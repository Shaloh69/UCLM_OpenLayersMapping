"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// Import the map component dynamically
const CampusMap = dynamic(() => import("./MapComponent"), { ssr: false });

const RoutePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) {
      setError("No route parameters found");
      setLoading(false);
      return;
    }

    const startNode = searchParams.get("startNode");
    const endNode = searchParams.get("endNode");

    if (!startNode || !endNode) {
      setError("Invalid route parameters");
      setLoading(false);
      return;
    }

    // Route parameters are valid, proceed to loading the map
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-700">Loading your route...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
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
          <h2 className="text-xl font-bold text-center mb-2">Route Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            onClick={() => router.push("/")}
          >
            Go to Map
          </button>
        </div>
      </div>
    );
  }

  // All parameters are valid, render the map with route information
  return (
    <div className="h-screen w-full">
      <CampusMap
        roadsUrl="/UCLM_Roads.geojson"
        nodesUrl="/UCLM_Nodes.geojson"
        mapUrl="/UCLM_Map.geojson"
        pointsUrl="/UCLM_Points.geojson"
        debug={false}
      />

      {/* Route information toast */}
      <div className="absolute top-4 left-0 right-0 mx-auto w-80 bg-blue-500 text-white p-3 rounded-lg z-50 text-center shadow-lg">
        Navigation route loaded
      </div>
    </div>
  );
};

export default RoutePage;
