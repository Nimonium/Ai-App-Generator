export type WorkflowEventName = "onRecordCreate" | "onRecordUpdate" | "onRecordDelete" | "onBulkRecordCreate";

export interface WorkflowContext {
  appId: string;
  modelName: string;
  userId: string;
  recordId?: string;
  count?: number;
  payload?: any;
}

export interface WorkflowHandler {
  name: string;
  handle: (eventName: WorkflowEventName, context: WorkflowContext) => Promise<void>;
}
