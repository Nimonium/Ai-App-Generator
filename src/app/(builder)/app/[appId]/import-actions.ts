"use server";

import { auth } from "@/auth";
import { processBulkImport, ImportSummary } from "@/server/services/import.service";

/**
 * Server action to process an uploaded CSV payload.
 * The client has already parsed the CSV to JSON and mapped the fields.
 */
export async function uploadCsvAction(appId: string, modelName: string, rows: any[]): Promise<ImportSummary> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Limit batch size to prevent serverless execution timeouts
  if (rows.length > 500) {
    throw new Error("Maximum 500 rows allowed per import batch.");
  }

  return await processBulkImport(appId, modelName, rows, session.user.id);
}
