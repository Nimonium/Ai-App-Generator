import { logger } from "../../observability/logger";
import { WorkflowHandler } from "../types";

export const auditLogHandler: WorkflowHandler = {
  name: "AuditLogHandler",
  handle: async (eventName, context) => {
    // In a fully scaled platform, this might insert into an AuditTrail Postgres table.
    // For this architecture, we emit a structured log that can be aggregated securely.
    logger.info(`[WORKFLOW] ${eventName} triggered`, {
      handler: "AuditLog",
      appId: context.appId,
      model: context.modelName,
      userId: context.userId,
      recordId: context.recordId,
      count: context.count
    });
  }
};
