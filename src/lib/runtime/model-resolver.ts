import { AppConfig, Model } from "../schema/app-config";
import { ModelNotFoundError } from "./runtime-errors";

/**
 * Resolves a model definition from an application configuration safely.
 * 
 * @param config The validated AppConfig
 * @param modelName The target model name requested by the user
 * @returns The resolved Model definition
 * @throws ModelNotFoundError if the model is not defined in the configuration
 */
export function resolveModel(config: AppConfig, modelName: string): Model {
  // Case-insensitive match could be added here if desired, but strict matching is safer for JSON systems
  const model = config.models.find(m => m.name === modelName);
  
  if (!model) {
    throw new ModelNotFoundError(modelName);
  }
  
  return model;
}
