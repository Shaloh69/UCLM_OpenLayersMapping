import React, { useState, useEffect, useMemo } from "react";
import { RoadNode } from "./roadSystem";
import { RouteProgress } from "./enhancedLocationTracking";

interface EnhancedMobileRoutePanelProps {
  destination: RoadNode;
  currentLocation: RoadNode | null;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
  };
  routeProgress?: RouteProgress | null;
  onClose?: () => void;
}

const EnhancedMobileRoutePanel: React.FC<EnhancedMobileRoutePanelProps> = ({
  destination,
  currentLocation,
  routeInfo,
  routeProgress,
  onClose,
}) => {
  const [showDirections, setShowDirections] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return "< 1 min";
    }
    const minutes = Math.ceil(seconds / 60);
    return minutes === 1 ? "1 min" : `${minutes} mins`;
  };

  // Format bearing to cardinal direction
  const formatBearing = (degrees: number | null): string => {
    if (degrees === null) return "N";
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Calculate ETA
  const etaTime = useMemo(() => {
    if (!routeProgress?.estimatedTimeRemaining) {
      return "";
    }
    const now = new Date();
    const eta = new Date(now.getTime() + routeProgress.estimatedTimeRemaining * 1000);
    return eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [routeProgress?.estimatedTimeRemaining]);

  // Use route progress if available, otherwise fall back to routeInfo
  const displayDistance = routeProgress?.distanceToDestination ?? routeInfo?.distance ?? 0;
  const displayTime = routeProgress?.estimatedTimeRemaining ?? (routeInfo?.estimatedTime ? routeInfo.estimatedTime * 60 : 0);
  const percentComplete = routeProgress?.percentComplete ?? 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 rounded-t-2xl">
      {/* Drag Handle */}
      <div
        className="w-full flex justify-center py-2 cursor-pointer"
        onClick={() => setIsPanelExpanded(!isPanelExpanded)}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-4">
        {/* Progress Bar */}
        {routeProgress && (
          <div className="mb-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, percentComplete)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                {percentComplete.toFixed(0)}% Complete
              </span>
              {etaTime && (
                <span className="text-xs text-gray-500">ETA: {etaTime}</span>
              )}
            </div>
          </div>
        )}

        {/* Off Route Warning */}
        {routeProgress?.isOffRoute && (
          <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-orange-800">
                You're off the route
              </p>
              <p className="text-xs text-orange-600">
                {formatDistance(routeProgress.distanceFromRoute)} away from path
              </p>
            </div>
          </div>
        )}

        {/* Destination Info */}
        <div className="mb-3">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {destination.name}
          </h2>

          {destination.category && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mt-1">
              {destination.category}
            </span>
          )}
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Distance */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 mx-auto mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <p className="text-xs text-gray-600 mb-1">Distance</p>
            <p className="text-lg font-bold text-gray-900">
              {formatDistance(displayDistance)}
            </p>
          </div>

          {/* Time */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-600 mx-auto mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-gray-600 mb-1">Time</p>
            <p className="text-lg font-bold text-gray-900">
              {formatTime(displayTime)}
            </p>
          </div>

          {/* Direction */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-purple-600 mx-auto mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
            <p className="text-xs text-gray-600 mb-1">Direction</p>
            <p className="text-lg font-bold text-gray-900">
              {formatBearing(routeProgress?.bearingToNextWaypoint ?? null)}
            </p>
          </div>
        </div>

        {/* Expanded Info */}
        {isPanelExpanded && (
          <div className="border-t border-gray-200 pt-3 mb-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-600 text-xs">Distance Traveled</p>
                <p className="font-semibold text-gray-900">
                  {formatDistance(routeProgress?.distanceTraveled ?? 0)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-600 text-xs">Calories Burned</p>
                <p className="font-semibold text-gray-900">
                  {Math.round(((routeProgress?.distanceTraveled ?? 0) / 1000) * 65)} cal
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-600 text-xs">Current Location</p>
                <p className="font-semibold text-gray-900 truncate">
                  {currentLocation?.name ?? "Locating..."}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-600 text-xs">Next Waypoint</p>
                <p className="font-semibold text-gray-900">
                  {formatDistance(routeProgress?.distanceToNextWaypoint ?? 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              showDirections
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setShowDirections(!showDirections)}
          >
            <div className="flex items-center justify-center">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {showDirections ? "Hide" : "Show"} Steps
            </div>
          </button>

          {onClose && (
            <button
              className="px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Step-by-Step Directions */}
        {showDirections && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-600"
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
              Navigation Steps
            </h3>

            <ul className="space-y-3 max-h-48 overflow-y-auto">
              {/* Start */}
              <li className="flex items-start p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-3 flex-shrink-0 font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Start at {currentLocation?.name ?? "current location"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Head {formatBearing(routeProgress?.bearingToNextWaypoint ?? null)} toward {destination.name}
                  </p>
                </div>
              </li>

              {/* Continue */}
              <li className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3 flex-shrink-0 font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Follow the highlighted path
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Continue for {formatDistance(displayDistance * 0.6)}
                  </p>
                  {routeProgress?.isOffRoute && (
                    <p className="text-sm text-orange-600 mt-1 font-medium">
                      ⚠️ Return to the marked route
                    </p>
                  )}
                </div>
              </li>

              {/* Arrival */}
              <li className="flex items-start p-3 bg-red-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center mr-3 flex-shrink-0 font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Arrive at {destination.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {destination.description ?? "Your destination"}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Live Indicator */}
      <div className="absolute top-4 right-4 flex items-center bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
        <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
        LIVE
      </div>
    </div>
  );
};

export default EnhancedMobileRoutePanel;
