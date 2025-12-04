"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Navigation error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center max-w-sm">
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
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Navigation Error
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          We couldn't load your navigation route. This might be due to an
          invalid QR code or network issues.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && error && (
          <div className="bg-gray-100 rounded-lg p-3 mb-6 text-left overflow-auto max-h-24">
            <p className="text-xs font-mono text-red-600 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-6 bg-blue-500 text-white rounded-xl font-semibold
                     active:scale-95 transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold
                     active:scale-95 transition-all"
          >
            Go to Map
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 mt-6">
          If this problem persists, try scanning the QR code again or ask at the
          kiosk for help.
        </p>
      </div>
    </div>
  );
}
