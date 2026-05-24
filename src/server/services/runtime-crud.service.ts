import prisma from "@/lib/prisma";
import { loadAppConfig } from "@/lib/runtime/config-loader";
import { resolveModel } from "@/lib/runtime/model-resolver";
import { validatePayload } from "@/lib/runtime/validation-engine";
import { buildPrismaQuery, QueryOptions } from "@/lib/runtime/query-engine";
import { RecordNotFoundError, AuthorizationError } from "@/lib/runtime/runtime-errors";
import { waitUntil } from "@vercel/functions";
import { dispatchEvent } from "@/lib/workflows/dispatcher";

/**
 * The core orchestration service for the Dynamic Backend Runtime.
 * 
 * DESIGN RATIONALE:
 * By keeping this logic separate from the Next.js API Routes, we ensure
 * it can be tested independently, and it could even be called natively
 * by React Server Actions in the future without an HTTP hop.
 */
export class RuntimeCrudService {
  /**
   * Retrieves a paginated list of records for a dynamic model.
   */
  static async listRecords(appSlug: string, modelName: string, queryOptions: QueryOptions, userId: string) {
    const { appId, config, ownerId } = await loadAppConfig(appSlug);
    
    // User Isolation: Ensure only the app owner (or authorized users) can access records.
    if (ownerId !== userId) throw new AuthorizationError("You do not have permission to access this app's data.");

    // Verify model exists in config before allowing any database operation
    resolveModel(config, modelName);

    const prismaQuery = buildPrismaQuery(appId, modelName, queryOptions);

    // Enforce pagination to prevent Out-Of-Memory crashes on large datasets
    const limit = queryOptions.limit ? Math.min(Number(queryOptions.limit), 100) : 50;
    const page = queryOptions.page ? Number(queryOptions.page) : 1;
    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      prisma.record.count({ where: { appId, modelName, ...prismaQuery.where } }),
      prisma.record.findMany({
        where: { appId, modelName, ...prismaQuery.where },
        orderBy: prismaQuery.orderBy || { createdAt: "desc" },
        take: limit,
        skip: skip,
        select: { id: true, data: true, createdAt: true, updatedAt: true }
      })
    ]);

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Retrieves a single record by ID safely.
   */
  static async getRecord(appSlug: string, modelName: string, recordId: string, userId: string) {
    const { appId, config, ownerId } = await loadAppConfig(appSlug);
    if (ownerId !== userId) throw new AuthorizationError("Unauthorized");

    resolveModel(config, modelName);

    const record = await prisma.record.findFirst({
      where: { id: recordId, appId, modelName },
      select: { id: true, data: true, createdAt: true, updatedAt: true }
    });

    if (!record) {
      throw new RecordNotFoundError(recordId, modelName);
    }

    return record;
  }

  /**
   * Creates a new dynamic record.
   * Safety: Unconditionally runs the generated Zod validation pipeline against the payload.
   */
  static async createRecord(appSlug: string, modelName: string, payload: unknown, userId: string) {
    const { appId, config, ownerId } = await loadAppConfig(appSlug);
    if (ownerId !== userId) throw new AuthorizationError("Unauthorized");

    const model = resolveModel(config, modelName);
    
    // Step 1: Validate & Sanitize. Any unknown fields are stripped. Malformed types throw a clean error.
    const sanitizedData = validatePayload(payload, model);

    // Step 2: Safe Database Insertion
    const record = await prisma.record.create({
      data: {
        appId,
        modelName,
        data: sanitizedData as any
      },
      select: { id: true, data: true, createdAt: true, updatedAt: true }
    });

    // 5. Fire async workflow hooks safely using waitUntil
    waitUntil(
      dispatchEvent("onRecordCreate", {
        appId: appId,
        modelName: model.name,
        userId: userId,
        recordId: record.id,
        payload: record.data
      })
    );

    return record;
  }

  /**
   * Updates an existing record safely using PATCH semantics (partial updates).
   */
  static async updateRecord(appSlug: string, modelName: string, recordId: string, payload: unknown, userId: string) {
    const { appId, config, ownerId } = await loadAppConfig(appSlug);
    if (ownerId !== userId) throw new AuthorizationError("Unauthorized");

    const model = resolveModel(config, modelName);
    
    // Prevent updating a record that doesn't belong to the specified app/model
    const existingRecord = await prisma.record.findFirst({
      where: { id: recordId, appId, modelName }
    });

    if (!existingRecord) {
      throw new RecordNotFoundError(recordId, modelName);
    }

    // Pass `true` to `validatePayload` to enforce partial validation (all fields optional)
    const sanitizedPartialData = validatePayload(payload, model, true);

    // Application-level merge of JSONB data
    const mergedData = {
      ...(existingRecord.data as object),
      ...sanitizedPartialData
    };

    const updatedRecord = await prisma.record.update({
      where: { id: recordId },
      data: { data: mergedData as any },
      select: { id: true, data: true, createdAt: true, updatedAt: true }
    });

    // Fire async workflow hooks safely using waitUntil
    waitUntil(
      dispatchEvent("onRecordUpdate", {
        appId: appId,
        modelName: model.name,
        userId: userId,
        recordId: recordId,
        payload: updatedRecord.data
      })
    );

    return updatedRecord;
  }

  /**
   * Deletes a specific dynamic record safely.
   */
  static async deleteRecord(appSlug: string, modelName: string, recordId: string, userId: string) {
    const { appId, config, ownerId } = await loadAppConfig(appSlug);
    if (ownerId !== userId) throw new AuthorizationError("Unauthorized");

    resolveModel(config, modelName);

    const existingRecord = await prisma.record.findFirst({
      where: { id: recordId, appId, modelName }
    });

    if (!existingRecord) {
      throw new RecordNotFoundError(recordId, modelName);
    }

    await prisma.record.delete({
      where: { id: recordId }
    });

    // Fire async workflow hooks safely using waitUntil
    waitUntil(
      dispatchEvent("onRecordDelete", {
        appId: appId,
        modelName: modelName,
        userId: userId,
        recordId: recordId
      })
    );

    return { success: true };
  }
}
