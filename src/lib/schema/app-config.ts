import { z } from "zod";

export const FieldType = z.enum(["string", "number", "boolean", "date", "email"]);

export const ModelFieldSchema = z.object({
  name: z.string().min(1, "Field name must not be empty").max(50, "Field name is too long"),
  type: FieldType,
  required: z.boolean().default(false),
  description: z.string().optional(),
});

export const ModelSchema = z.object({
  name: z.string().min(1, "Model name must not be empty").max(50, "Model name is too long"),
  fields: z.array(ModelFieldSchema),
});

export const ViewType = z.enum(["table", "form", "detail"]);

export const ViewSchema = z.object({
  name: z.string().min(1, "View name must not be empty"),
  path: z.string().startsWith("/", "Path must start with /"),
  type: ViewType,
  model: z.string(), // Must match a model name defined in models
  columns: z.array(z.string()).optional(), // For tables: fields to display
  formFields: z.array(z.string()).optional(), // For forms: fields to edit
});

export const NavItemSchema = z.object({
  label: z.string(),
  path: z.string(),
  icon: z.string().optional(),
});

export const AppConfigSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  models: z.array(ModelSchema),
  views: z.array(ViewSchema),
  navigation: z.array(NavItemSchema),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type Model = z.infer<typeof ModelSchema>;
export type ModelField = z.infer<typeof ModelFieldSchema>;
export type View = z.infer<typeof ViewSchema>;
export type NavItem = z.infer<typeof NavItemSchema>;

/**
 * Validates an arbitrary JSON object against the AppConfig schema.
 * Throws a formatted error if validation fails.
 */
export function validateAppConfig(data: unknown): AppConfig {
  const result = AppConfigSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid App Configuration: ${result.error.message}`);
  }
  
  const config = result.data;
  
  // Cross-validation: Check if views reference existing models
  const modelNames = new Set(config.models.map(m => m.name));
  for (const view of config.views) {
    if (!modelNames.has(view.model)) {
      throw new Error(`View "${view.name}" references non-existent model "${view.model}"`);
    }
    
    // Cross-validation: Check if view columns/formFields exist on the model
    const model = config.models.find(m => m.name === view.model)!;
    const modelFieldNames = new Set(model.fields.map(f => f.name));
    
    if (view.columns) {
      for (const col of view.columns) {
        if (!modelFieldNames.has(col)) {
          throw new Error(`View "${view.name}" references non-existent column "${col}" on model "${model.name}"`);
        }
      }
    }
    
    if (view.formFields) {
      for (const field of view.formFields) {
        if (!modelFieldNames.has(field)) {
          throw new Error(`View "${view.name}" references non-existent form field "${field}" on model "${model.name}"`);
        }
      }
    }
  }

  return config;
}
