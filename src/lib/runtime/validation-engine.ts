import { z } from "zod";
import { Model } from "../schema/app-config";
import { RuntimeValidationError } from "./runtime-errors";

export function createDynamicSchema(model: Model): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of model.fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "string":
        fieldSchema = z.string();
        break;
      case "number":
        fieldSchema = z.number();
        break;
      case "boolean":
        fieldSchema = z.boolean();
        break;
      case "date":
        // JSON dates often come in as strings. Coerce to Date objects
        fieldSchema = z.coerce.date();
        break;
      case "email":
        fieldSchema = z.string().email();
        break;
      default:
        fieldSchema = z.any();
    }

    if (!field.required) {
      fieldSchema = fieldSchema.optional().nullable();
    }

    shape[field.name] = fieldSchema;
  }

  // Use strip() to silently remove any unknown fields (prevent malicious data injection)
  return z.object(shape).strip();
}

/**
 * Validates an incoming JSON payload against the dynamic schema derived from the model.
 * 
 * @param payload The raw JSON object from the request
 * @param model The configuration model defining the schema
 * @param isUpdate If true, all fields become optional (useful for PATCH requests)
 * @returns The sanitized, strongly-typed data ready for database insertion
 */
export function validatePayload(payload: unknown, model: Model, isUpdate = false) {
  let schema = createDynamicSchema(model);
  
  if (isUpdate) {
    // For partial updates (PATCH), all fields become optional
    schema = schema.partial() as unknown as z.ZodObject<any>;
  }

  const result = schema.safeParse(payload);

  if (!result.success) {
    // Format errors to be human-readable
    const formattedErrors = result.error.format();
    throw new RuntimeValidationError(`Validation failed for model '${model.name}'`, formattedErrors);
  }

  return result.data;
}
