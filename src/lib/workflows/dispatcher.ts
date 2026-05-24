import { logger } from "../observability/logger";
import { handlers } from "./registry";
import { WorkflowEventName, WorkflowContext } from "./types";

/**
 * Dispatches an event to all registered workflow handlers asynchronously.
 * This ensures that webhook/automation failures 
 * do not crash the primary CRUD transaction or block the API response.
 */
export async function dispatchEvent(eventName: WorkflowEventName, context: WorkflowContext) {
  // Fire and forget: We use Promise.allSettled to ensure one failing handler
  // doesn't prevent other handlers from executing.
  Promise.allSettled(
    handlers.map(handler => 
      handler.handle(eventName, context).catch(err => {
        logger.error(`Workflow handler ${handler.name} failed for event ${eventName}`, err, { context });
      })
    )
  );
}
