import React from "react";
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
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Navigate to {destination.name}</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white p-2 rounded-lg shadow mb-4">
            <img
              src={qrCodeUrl}
              alt="Route QR Code"
              className="w-64 h-64 object-contain"
            />
          </div>

          {routeInfo && (
            <div className="w-full bg-gray-50 p-3 rounded-lg text-center mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Distance:</span>
                <span>{(routeInfo.distance / 1000).toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Est. Time:</span>
                <span>{Math.ceil(routeInfo.estimatedTime)} min</span>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-600 mb-4">
            Scan this QR code with your mobile device to navigate to this
            destination
          </p>

          <div className="w-full flex justify-center">
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              onClick={() => {
                // Download QR code
                const link = document.createElement("a");
                link.href = qrCodeUrl;
                link.download = `navigate-to-${destination.name.replace(/\s+/g, "-")}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
