"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Head from "next/head";

// Import your existing map component dynamically
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

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

    // Route parameters are valid
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Route | UCLM Campus Navigation</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
        </Head>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center p-6">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-bold text-gray-800 mb-2">
              Loading your route
            </p>
            <p className="text-gray-600">
              Please wait while we prepare your navigation
            </p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Route Error | UCLM Campus Navigation</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
        </Head>
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
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Campus Navigation | UCLM</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Head>

      <div className="h-screen w-full">
        <MapComponent
          roadsUrl="/UCLM_Roads.geojson"
          nodesUrl="/UCLM_Nodes.geojson"
          mapUrl="/UCLM_Map.geojson"
          pointsUrl="/UCLM_Points.geojson"
          searchParams={searchParams}
          mobileMode={true}
          debug={false}
        />
      </div>
    </>
  );
};

export default RoutePage;
