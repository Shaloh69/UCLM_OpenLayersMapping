"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try again or refresh the
          page.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && error && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32">
            <p className="text-xs font-mono text-red-600 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-6 bg-blue-500 text-white rounded-xl font-semibold
                     hover:bg-blue-600 active:scale-95 transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-semibold
                     hover:bg-gray-300 active:scale-95 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
