"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { logger } from "@/lib/observability/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the catastrophic error to our observability layer
    logger.error("Global boundary caught an unhandled error", error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-8 text-sm">
          Our runtime encountered an unexpected failure. We've logged this for investigation.
        </p>
        <button
          onClick={() => reset()}
          className="w-full bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Attempt Recovery
        </button>
      </div>
    </div>
  );
}
