"use client";

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { parseRouteFromUrl } from "@/components/map/qrCodeUtils"; // Adjust this path as needed
import { MobileErrorBoundary } from "@/components/ErrorBoundary";

// Import map component dynamically to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => null, // Don't show loading here, we handle it ourselves
});

// Navigation readiness state
interface NavigationReadiness {
  routeParsed: boolean;
  mapLoaded: boolean;
  gpsReady: boolean;
  routeCalculated: boolean;
  markerSnapped: boolean;
}

// Loading screen component with progress steps
const LoadingScreen = ({
  readiness,
  currentStep
}: {
  readiness: NavigationReadiness;
  currentStep: string;
}) => {
  const steps = [
    { key: 'routeParsed', label: 'Reading route data', icon: '📍' },
    { key: 'mapLoaded', label: 'Loading map', icon: '🗺️' },
    { key: 'gpsReady', label: 'Acquiring GPS position', icon: '📡' },
    { key: 'routeCalculated', label: 'Calculating route', icon: '🛣️' },
    { key: 'markerSnapped', label: 'Positioning marker on route', icon: '✅' },
  ];

  const completedSteps = Object.values(readiness).filter(Boolean).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Preparing Navigation</h1>
          <p className="text-gray-500">{currentStep}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{completedSteps} of {steps.length} steps</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = readiness[step.key as keyof NavigationReadiness];
            const isCurrent = !isCompleted && Object.values(readiness).filter(Boolean).length === index;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCompleted
                    ? 'bg-green-50 text-green-700'
                    : isCurrent
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-50 text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : isCurrent ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : step.icon}
                </div>
                <span className={`font-medium ${isCompleted ? '' : isCurrent ? '' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Loading Spinner at Bottom */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Please wait...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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

// Ready screen component - shown when all preparations are complete
const RouteReadyScreen = ({
  startRoute,
  routeData,
  destinationName
}: {
  startRoute: () => void;
  routeData: any;
  destinationName?: string;
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">Navigation Ready!</h2>

      {/* Destination Info */}
      {destinationName && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Your destination</p>
          <p className="text-lg font-semibold text-blue-700">{destinationName}</p>
        </div>
      )}

      {/* Route Info */}
      {routeData?.routeInfo && (
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">
              {routeData.routeInfo.distance < 1000
                ? `${Math.round(routeData.routeInfo.distance)}m`
                : `${(routeData.routeInfo.distance / 1000).toFixed(1)}km`}
            </p>
            <p className="text-xs text-gray-500">Distance</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">
              {Math.ceil(routeData.routeInfo.estimatedTime)} min
            </p>
            <p className="text-xs text-gray-500">Est. Time</p>
          </div>
        </div>
      )}

      <p className="text-gray-600 mb-8">
        Everything is ready. Your position will be shown on the highlighted route.
      </p>

      <button
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold text-lg shadow-lg flex items-center justify-center gap-2"
        onClick={startRoute}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Start Navigation
      </button>
    </div>
  </div>
);

// Component that uses useSearchParams - wrapped in Suspense
function RouteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [initializationTimedOut, setInitializationTimedOut] = useState(false);
  const [currentStep, setCurrentStep] = useState("Initializing...");

  // Navigation readiness tracking
  const [readiness, setReadiness] = useState<NavigationReadiness>({
    routeParsed: false,
    mapLoaded: false,
    gpsReady: false,
    routeCalculated: false,
    markerSnapped: false,
  });

  const debugInfoRef = useRef<string[]>([]);

  // Check if all steps are complete OR if timeout occurred
  const isFullyReady = Object.values(readiness).every(Boolean) || initializationTimedOut;

  // =============================================
  // OVERALL INITIALIZATION TIMEOUT
  // Final safety net - prevents loading screen from hanging forever
  // If not ready after 30 seconds, force proceed anyway
  // =============================================
  useEffect(() => {
    const INITIALIZATION_TIMEOUT_MS = 30000; // 30 seconds max wait

    const timeoutId = setTimeout(() => {
      if (!Object.values(readiness).every(Boolean)) {
        console.warn('[Route Page] ⚠️ Initialization timeout after 30s - forcing ready state');
        console.warn('[Route Page] Incomplete steps:',
          Object.entries(readiness)
            .filter(([_, ready]) => !ready)
            .map(([step]) => step)
            .join(', ')
        );
        setInitializationTimedOut(true);
        setCurrentStep('Ready (some steps skipped)');
      }
    }, INITIALIZATION_TIMEOUT_MS);

    // Clear timeout if fully ready before timeout
    if (Object.values(readiness).every(Boolean)) {
      clearTimeout(timeoutId);
    }

    return () => clearTimeout(timeoutId);
  }, [readiness]);

  // Update readiness state helper
  const updateReadiness = useCallback((key: keyof NavigationReadiness, value: boolean) => {
    setReadiness(prev => ({ ...prev, [key]: value }));
  }, []);

  // Callback for MapComponent to report readiness
  const onMapReady = useCallback(() => {
    console.log('[Route Page] Map loaded and ready');
    updateReadiness('mapLoaded', true);
    setCurrentStep('Map loaded');
  }, [updateReadiness]);

  const onGpsReady = useCallback(() => {
    console.log('[Route Page] GPS position acquired');
    updateReadiness('gpsReady', true);
    setCurrentStep('GPS ready');
  }, [updateReadiness]);

  const onRouteCalculated = useCallback(() => {
    console.log('[Route Page] Route calculated');
    updateReadiness('routeCalculated', true);
    setCurrentStep('Route calculated');
  }, [updateReadiness]);

  const onMarkerSnapped = useCallback(() => {
    console.log('[Route Page] Marker snapped to route');
    updateReadiness('markerSnapped', true);
    setCurrentStep('Ready to navigate!');
  }, [updateReadiness]);

  // Parse route data from URL
  useEffect(() => {
    if (!searchParams || Array.from(searchParams.entries()).length === 0) {
      setError("No route parameters found. Please scan a valid QR code.");
      return;
    }

    try {
      setCurrentStep('Reading route data...');
      const routeDataObj = parseRouteFromUrl(searchParams, debugInfoRef, false);

      if (!routeDataObj) {
        setError("Invalid route data. The QR code may be expired or corrupted.");
        return;
      }

      console.log('[Route Page] Route data parsed:', routeDataObj);
      setRouteData(routeDataObj);
      updateReadiness('routeParsed', true);
      setCurrentStep('Loading map...');
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error parsing route:", err.message);
      } else {
        console.error("Unknown error parsing route:", err);
      }
      setError("Failed to load route. Please try scanning the QR code again.");
    }
  }, [searchParams, updateReadiness]);

  // Show error screen if there's an error
  if (error) return <ErrorScreen error={error} />;

  // Show loading screen until route is parsed
  if (!routeData) {
    return (
      <LoadingScreen
        readiness={readiness}
        currentStep={currentStep}
      />
    );
  }

  return (
    <MobileErrorBoundary>
      {/* Show loading screen while preparing */}
      {!isFullyReady && !navigationStarted && (
        <LoadingScreen
          readiness={readiness}
          currentStep={currentStep}
        />
      )}

      {/* Show ready screen when all preparations complete */}
      {isFullyReady && !navigationStarted && (
        <RouteReadyScreen
          startRoute={() => setNavigationStarted(true)}
          routeData={routeData}
          destinationName={routeData?.endNodeId}
        />
      )}

      {/* Map is always rendered (hidden until ready) to allow preloading */}
      <div
        className="h-screen w-full"
        style={{
          visibility: navigationStarted ? 'visible' : 'hidden',
          position: navigationStarted ? 'relative' : 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <MapComponent
          routeData={routeData}
          mobileMode={true}
          debug={false}
          onMapReady={onMapReady}
          onGpsReady={onGpsReady}
          onRouteCalculated={onRouteCalculated}
          onMarkerSnapped={onMarkerSnapped}
        />
      </div>
    </MobileErrorBoundary>
  );
}

// Main page component with Suspense boundary
export default function RoutePage() {
  // Simple initial loading fallback for Suspense (before RouteContent mounts)
  const initialFallback = (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xl font-bold text-gray-800">Loading...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={initialFallback}>
      <RouteContent />
    </Suspense>
  );
}
