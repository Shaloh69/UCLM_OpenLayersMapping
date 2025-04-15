import React, { useState, useEffect, useMemo } from "react";
import { RoadNode } from "./roadSystem";

interface KioskQRModalProps {
  qrCodeUrl: string;
  destination: RoadNode;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
  };
  onClose: () => void;
  autoCloseTime?: number; // Time in seconds before auto-closing
}

const KioskQRModal: React.FC<KioskQRModalProps> = ({
  qrCodeUrl,
  destination,
  routeInfo,
  onClose,
  autoCloseTime = 60, // Default to 60 seconds
}) => {
  const [countdown, setCountdown] = useState<number>(autoCloseTime);

  // Auto-close timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Clean up on unmount
    return () => clearInterval(timer);
  }, [onClose, autoCloseTime]);

  // Format route information
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
    // Average 65 calories burned per km walking
    return Math.round((routeInfo.distance / 1000) * 65);
  }, [routeInfo]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl overflow-hidden mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              Navigate to {destination.name}
            </h2>
            <div className="bg-blue-800 bg-opacity-50 px-3 py-1 rounded-lg text-white text-sm">
              Auto-closing: {countdown}s
            </div>
          </div>
          {destination.category && (
            <div className="mt-1 inline-block px-3 py-1 bg-blue-700 bg-opacity-50 rounded-full text-white text-sm">
              {destination.category}
            </div>
          )}
          {destination.description && (
            <p className="mt-2 text-white text-opacity-90 text-sm">
              {destination.description}
            </p>
          )}
        </div>

        {/* QR Code and Instructions */}
        <div className="p-6 flex flex-col md:flex-row items-center">
          <div className="relative mb-6 md:mb-0 md:mr-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"></div>
            <div className="relative p-4 bg-white rounded-xl shadow-md">
              <img
                src={qrCodeUrl}
                alt="Route QR Code"
                className="w-64 h-64 object-contain"
              />
            </div>

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg -translate-x-2 -translate-y-2"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg translate-x-2 -translate-y-2"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg -translate-x-2 translate-y-2"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg translate-x-2 translate-y-2"></div>
          </div>

          <div className="md:flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Scan with your phone
            </h3>

            <ol className="text-left space-y-4 mb-6">
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <p className="text-gray-700">Open your phone's camera app</p>
                </div>
              </li>

              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <p className="text-gray-700">Point camera at the QR code</p>
                </div>
              </li>

              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <p className="text-gray-700">
                    Tap the notification that appears
                  </p>
                </div>
              </li>

              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <div>
                  <p className="text-gray-700">
                    Follow directions on your phone
                  </p>
                </div>
              </li>
            </ol>

            <p className="text-sm text-gray-500 italic">
              The map will reset for the next user after the timer ends
            </p>
          </div>
        </div>

        {/* Route info */}
        {routeInfo && (
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center p-2">
                <span className="text-gray-500 text-sm">Distance</span>
                <span className="text-xl font-bold text-gray-800">
                  {formattedDistance}
                </span>
              </div>

              <div className="h-12 border-l border-gray-300"></div>

              <div className="flex flex-col items-center p-2">
                <span className="text-gray-500 text-sm">Walking Time</span>
                <span className="text-xl font-bold text-gray-800">
                  {formattedTime}
                </span>
              </div>

              <div className="h-12 border-l border-gray-300"></div>

              <div className="flex flex-col items-center p-2">
                <span className="text-gray-500 text-sm">Calories</span>
                <span className="text-xl font-bold text-gray-800">
                  {calories} cal
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 flex justify-between">
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            Close ({countdown}s)
          </button>

          <p className="text-blue-600 font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Take your phone with you!
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(KioskQRModal);
