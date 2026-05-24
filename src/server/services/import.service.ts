import prisma from "@/lib/prisma";
import { AppConfigSchema } from "@/lib/schema/app-config";
import { createDynamicSchema } from "@/lib/runtime/validation-engine";
import { dispatchEvent } from "@/lib/workflows/dispatcher";
import { logger } from "@/lib/observability/logger";
import { waitUntil } from "@vercel/functions";

export interface ImportSummary {
  total: number;
  successful: number;
  failed: number;
  errors: { row: number; error: string }[];
}

/**
 * Handles bulk ingestion of dynamic records (e.g., from CSV).
 * It enforces strict validation and uses a partial-failure strategy.
 */
export async function processBulkImport(
  appId: string, 
  modelName: string, 
  rows: any[],
  userId: string
): Promise<ImportSummary> {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) throw new Error("App not found");

  const config = AppConfigSchema.parse(app.config);
  const model = config.models.find(m => m.name === modelName);
  if (!model) throw new Error(`Model ${modelName} not found in config`);

  // Dynamically generate the Zod schema for this specific model configuration
  const schema = createDynamicSchema(model);
  
  const validRows: any[] = [];
  const errors: { row: number; error: string }[] = [];

  // Validate each row against the schema
  rows.forEach((row, index) => {
    const result = schema.safeParse(row);
    if (result.success) {
      validRows.push(result.data);
    } else {
      const errorMsg = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(" | ");
      errors.push({ row: index + 1, error: errorMsg });
      
      // Log validation failures for observability
      logger.warn(`Bulk import validation failed for row ${index + 1}`, {
        appId,
        modelName,
        errors: errorMsg
      });
    }
  });

  // Batch insert all valid rows
  if (validRows.length > 0) {
    await prisma.record.createMany({
      data: validRows.map(data => ({
        appId,
        modelName,
        data
      }))
    });

    // Fire automation hooks asynchronously safely using waitUntil
    waitUntil(
      dispatchEvent("onBulkRecordCreate", {
        appId,
        modelName,
        userId,
        count: validRows.length
      })
    );
  }

  logger.info(`Bulk import completed for ${modelName}`, {
    total: rows.length,
    successful: validRows.length,
    failed: errors.length
  });

  return {
    total: rows.length,
    successful: validRows.length,
    failed: errors.length,
    errors
  };
}
