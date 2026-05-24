export class RuntimeError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = "RuntimeError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class AppNotFoundError extends RuntimeError {
  constructor(appSlug: string) {
    super(`App with slug '${appSlug}' not found`, 404);
    this.name = "AppNotFoundError";
  }
}

export class ModelNotFoundError extends RuntimeError {
  constructor(modelName: string) {
    super(`Model '${modelName}' not found in the application configuration`, 404);
    this.name = "ModelNotFoundError";
  }
}

export class RecordNotFoundError extends RuntimeError {
  constructor(recordId: string, modelName: string) {
    super(`Record '${recordId}' not found for model '${modelName}'`, 404);
    this.name = "RecordNotFoundError";
  }
}

export class RuntimeValidationError extends RuntimeError {
  constructor(message: string, errors: any) {
    super(message, 400, errors);
    this.name = "RuntimeValidationError";
  }
}

export class AuthorizationError extends RuntimeError {
  constructor(message: string = "Unauthorized access") {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}
