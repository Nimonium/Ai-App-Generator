/**
 * A lightweight structured logger for runtime observability.
 * In production, this emits JSON strings for external log aggregators (e.g., Datadog, ELK, Vercel).
 * In development, it emits readable console output.
 */

const IS_PROD = process.env.NODE_ENV === "production";

export const logger = {
  info: (message: string, meta?: any) => {
    if (IS_PROD) {
      console.log(JSON.stringify({ level: "info", message, ...meta, timestamp: new Date().toISOString() }));
    } else {
      console.log(`[INFO] ${message}`, meta ? meta : "");
    }
  },
  warn: (message: string, meta?: any) => {
    if (IS_PROD) {
      console.warn(JSON.stringify({ level: "warn", message, ...meta, timestamp: new Date().toISOString() }));
    } else {
      console.warn(`[WARN] ${message}`, meta ? meta : "");
    }
  },
  error: (message: string, error?: any, meta?: any) => {
    if (IS_PROD) {
      console.error(JSON.stringify({ 
        level: "error", 
        message, 
        error: error?.message || error, 
        stack: error?.stack,
        ...meta, 
        timestamp: new Date().toISOString() 
      }));
    } else {
      console.error(`[ERROR] ${message}`, error || "", meta ? meta : "");
    }
  }
};
