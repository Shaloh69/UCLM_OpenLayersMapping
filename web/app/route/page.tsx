"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Head from "next/head";
import { parseRouteFromUrl } from "@/components/map/qrCodeUtils"; // Adjust this path as needed

// Import map component dynamically to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

// Loading screen component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center p-6">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-xl font-bold text-gray-800 mb-2">Loading your route</p>
      <p className="text-gray-600">
        Please wait while we prepare your navigation
      </p>
    </div>
  </div>
);

// Error screen component
const ErrorScreen = ({ error }: { error: string }) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-red-500 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-center mb-3">Route Error</h2>
        <p className="text-gray-600 text-center mb-8">{error}</p>
        <button
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => router.push("/")}
        >
          Go to Map
        </button>
      </div>
    </div>
  );
};

// Ready screen component
const RouteReadyScreen = ({ startRoute }: { startRoute: () => void }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
      <div className="text-blue-500 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-3">Route Ready</h2>
      <p className="text-gray-600 mb-8">
        Your navigation is ready to begin. Tap the button below to start.
      </p>
      <button
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
        onClick={startRoute}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        Start Navigation
      </button>
    </div>
  </div>
);

export default function RoutePage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readyToStart, setReadyToStart] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);

  const debugInfoRef = useRef<string[]>([]);

  useEffect(() => {
    if (!searchParams || Array.from(searchParams.entries()).length === 0) {
      setError("No route parameters found");
      setLoading(false);
      return;
    }

    try {
      const routeDataObj = parseRouteFromUrl(searchParams, debugInfoRef, false);

      if (!routeDataObj) {
        setError("Invalid route data");
        setLoading(false);
        return;
      }

      setRouteData(routeDataObj);
      setLoading(false);
      setReadyToStart(true);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error parsing route:", err.message);
      } else {
        console.error("Unknown error parsing route:", err);
      }
      setError("Failed to load route. Please try again.");
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <>
      <Head>
        <title>Campus Navigation</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>

      {readyToStart ? (
        <RouteReadyScreen startRoute={() => setReadyToStart(false)} />
      ) : (
        <div className="h-screen w-full">
          <MapComponent routeData={routeData} mobileMode={true} debug={false} />
        </div>
      )}
    </>
  );
}
