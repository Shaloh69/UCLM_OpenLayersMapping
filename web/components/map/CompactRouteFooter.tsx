import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoadNode } from "./roadSystem";

interface CompactRouteFooterProps {
  destination?: RoadNode | null;
  currentLocation?: RoadNode | null;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
  };
  qrCodeUrl?: string;
  onClose: () => void;
  onGenerateQR?: () => void;
  isGeneratingQR?: boolean;
  onFindLocation: () => void;
}

const CompactRouteFooter: React.FC<CompactRouteFooterProps> = ({
  destination,
  currentLocation,
  routeInfo,
  qrCodeUrl,
  onClose,
  onGenerateQR,
  isGeneratingQR = false,
  onFindLocation,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // All hooks must be called before any conditional returns
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

  // If no destination, show compact "Find Location" button
  if (!destination) {
    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 rounded-t-2xl overflow-hidden"
        style={{ boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15)" }}
      >
        <div className="px-6 py-4">
          <button
            onClick={onFindLocation}
            className="w-full group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] focus:outline-none transition-all duration-300 flex items-center justify-center gap-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span className="font-bold text-lg">Find Location</span>
          </button>
        </div>
      </motion.div>
    );
  }

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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl text-center"
                    >
                      <div className="text-2xl mb-1">✅</div>
                      <div className="text-xs text-gray-600 mb-1">
                        Difficulty
                      </div>
                      <div className="text-lg font-bold text-green-700">
                        Easy
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

                {/* Pro Tip */}
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-amber-900">
                        <strong>Pro Tip:</strong> Scan the QR code with your
                        phone to get turn-by-turn navigation with live GPS
                        tracking!
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
