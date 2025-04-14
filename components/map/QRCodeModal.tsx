import React, { useState, useEffect } from "react";
import { RoadNode } from "./roadSystem";

interface QRCodeModalProps {
  qrCodeUrl: string;
  destination: RoadNode;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
  };
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  qrCodeUrl,
  destination,
  routeInfo,
  onClose,
}) => {
  const [animationClass, setAnimationClass] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);

  // // Animate the QR code on mount
  // useEffect(() => {
  //   setAnimationClass("animate-fade-in");
  //   let timer: NodeJS.Timeout;
  //   const startTime = 30; // seconds

  //   setCountdown(startTime);

  //   timer = setInterval(() => {
  //     setCountdown((prev) => {
  //       if (prev === null || prev <= 1) {
  //         clearInterval(timer);
  //         onClose();
  //         return null;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              Navigate to {destination.name}
            </h2>
            <button
              className="text-white hover:text-gray-200 transition-colors p-2"
              onClick={onClose}
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
              >
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          {destination.category && (
            <div className="mt-1 inline-block px-2 py-1 bg-blue-800 bg-opacity-50 rounded-lg text-white text-sm">
              {destination.category}
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className={`p-6 flex flex-col items-center ${animationClass}`}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl"></div>
            <div className="relative p-3 bg-white rounded-xl shadow-md">
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

          {/* Scan instructions */}
          <p className="mt-6 text-center text-gray-600 max-w-xs">
            Scan this QR code with your phone camera to navigate to{" "}
            <span className="font-semibold">{destination.name}</span>
          </p>

          {countdown && (
            <div className="mt-2 text-sm text-gray-500">
              Auto-closing in {countdown} seconds
            </div>
          )}
        </div>

        {/* Route info */}
        {routeInfo && (
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center p-2">
                <span className="text-gray-500 text-sm">Distance</span>
                <span className="text-xl font-bold text-gray-800">
                  {(routeInfo.distance / 1000).toFixed(2)} km
                </span>
              </div>

              <div className="h-12 border-l border-gray-300"></div>

              <div className="flex flex-col items-center p-2">
                <span className="text-gray-500 text-sm">Walking Time</span>
                <span className="text-xl font-bold text-gray-800">
                  {Math.ceil(routeInfo.estimatedTime)} min
                </span>
              </div>

              <div className="h-12 border-l border-gray-300"></div>

              <div className="flex flex-col items-center p-2">
                <span className="text-gray-500 text-sm">Calories</span>
                <span className="text-xl font-bold text-gray-800">
                  {Math.round((routeInfo.distance / 1000) * 65)} cal
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
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
