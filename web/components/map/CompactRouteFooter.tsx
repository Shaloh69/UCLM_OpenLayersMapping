import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoadNode } from "./roadSystem";

interface CompactRouteFooterProps {
  destination: RoadNode;
  currentLocation: RoadNode | null;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
  };
  qrCodeUrl?: string;
  onClose: () => void;
  onGenerateQR?: () => void;
  isGeneratingQR?: boolean;
}

const CompactRouteFooter: React.FC<CompactRouteFooterProps> = ({
  destination,
  currentLocation,
  routeInfo,
  qrCodeUrl,
  onClose,
  onGenerateQR,
  isGeneratingQR = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDistance = useMemo(() => {
    if (!routeInfo) return "Unknown";
    return routeInfo.distance < 1000
      ? `${Math.round(routeInfo.distance)}m`
      : `${(routeInfo.distance / 1000).toFixed(2)}km`;
  }, [routeInfo]);

  const formattedTime = useMemo(() => {
    if (!routeInfo) return "Unknown";
    const minutes = Math.ceil(routeInfo.estimatedTime);
    return minutes === 1 ? "1 min" : `${minutes} mins`;
  }, [routeInfo]);

  const calories = useMemo(() => {
    if (!routeInfo) return 0;
    return Math.round((routeInfo.distance / 1000) * 65);
  }, [routeInfo]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 rounded-t-2xl overflow-hidden"
        style={{ boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15)" }}
      >
        {/* Collapsed View */}
        <div className="relative">
          {/* Drag Handle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 flex justify-center items-center bg-gradient-to-b from-gray-100 to-white cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-1 bg-gray-300 rounded-full"
            />
          </button>

          {/* Compact Info Bar */}
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            {/* Destination Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  📍
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 text-sm truncate">
                    {destination.name}
                  </h3>
                  {destination.category && (
                    <p className="text-xs text-gray-500 truncate">
                      {destination.category}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-center">
                <p className="text-xs text-gray-500">Distance</p>
                <p className="text-sm font-bold text-blue-600">
                  {formattedDistance}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-bold text-purple-600">
                  {formattedTime}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            >
              <svg
                className="w-4 h-4 text-gray-600"
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
          </div>
        </div>

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 overflow-hidden"
            >
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {/* Route Details */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Route Information
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl text-center"
                    >
                      <div className="text-2xl mb-1">🏃</div>
                      <div className="text-xs text-gray-600 mb-1">Distance</div>
                      <div className="text-lg font-bold text-blue-700">
                        {formattedDistance}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl text-center"
                    >
                      <div className="text-2xl mb-1">⏱️</div>
                      <div className="text-xs text-gray-600 mb-1">Time</div>
                      <div className="text-lg font-bold text-purple-700">
                        {formattedTime}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-pink-50 to-pink-100 p-3 rounded-xl text-center"
                    >
                      <div className="text-2xl mb-1">🔥</div>
                      <div className="text-xs text-gray-600 mb-1">Calories</div>
                      <div className="text-lg font-bold text-pink-700">
                        {calories}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Description */}
                {destination.description && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      About this location
                    </h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {destination.description}
                    </p>
                  </div>
                )}

                {/* Current Location */}
                {currentLocation && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Starting from
                    </h4>
                    <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                      <span className="text-sm text-gray-700">
                        {currentLocation.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* QR Code Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Send to your phone
                  </h4>

                  {qrCodeUrl ? (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-white p-3 rounded-lg shadow-md">
                          <img
                            src={qrCodeUrl}
                            alt="Route QR Code"
                            className="w-40 h-40 object-contain"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            📱 Scan with your phone
                          </p>
                          <p className="text-xs text-gray-500">
                            Get turn-by-turn navigation on your mobile device
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={onGenerateQR}
                      disabled={isGeneratingQR}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGeneratingQR ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating QR Code...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                            />
                          </svg>
                          Generate QR Code
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-1">
                        How to navigate
                      </p>
                      <p className="text-xs text-amber-700">
                        Follow the blue line on the map to reach your
                        destination, or scan the QR code for mobile navigation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(CompactRouteFooter);
