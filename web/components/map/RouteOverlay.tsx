import React from "react";
import { RoadNode } from "./roadSystem";

interface RouteOverlayProps {
  startNode: RoadNode | null;
  endNode: RoadNode | null;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
  };
  onCancel: () => void;
  onGenerateQR: () => void;
  isLoading?: boolean;
}

const RouteOverlay: React.FC<RouteOverlayProps> = ({
  startNode,
  endNode,
  routeInfo,
  onCancel,
  onGenerateQR,
  isLoading = false,
}) => {
  if (!startNode || !endNode) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 mx-auto w-80 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg z-30">
      <div className="flex space-x-2">
        <button
          className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          onClick={onGenerateQR}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1.5"
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
              Generate QR
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RouteOverlay;
