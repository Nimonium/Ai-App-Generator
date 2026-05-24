import { WorkflowHandler } from "./types";
import { auditLogHandler } from "./handlers/audit-log";

// Register all active workflow handlers here.
// This architecture makes it trivial to add new integrations (e.g., SlackWebhookHandler)
// without modifying the core CRUD engine.
export const handlers: WorkflowHandler[] = [
  auditLogHandler,
];
