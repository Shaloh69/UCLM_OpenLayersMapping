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
}

const RouteOverlay: React.FC<RouteOverlayProps> = ({
  startNode,
  endNode,
  routeInfo,
  onCancel,
  onGenerateQR,
}) => {
  if (!startNode || !endNode) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 mx-auto w-80 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg z-30">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">Route Details</h3>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={onCancel}
        >
          ✕
        </button>
      </div>

      <div className="mb-3">
        <div className="flex mb-2">
          <div className="w-6 flex-shrink-0">
            <div className="w-4 h-4 rounded-full bg-blue-500 mt-1"></div>
          </div>
          <div>
            <p className="font-semibold">Current Location</p>
            <p className="text-sm text-gray-600">{startNode.name}</p>
          </div>
        </div>

        <div className="flex ml-3 my-1">
          <div className="border-l-2 border-gray-300 h-5 ml-1"></div>
        </div>

        <div className="flex">
          <div className="w-6 flex-shrink-0">
            <div className="w-4 h-4 rounded-full bg-red-500 mt-1"></div>
          </div>
          <div>
            <p className="font-semibold">Destination</p>
            <p className="text-sm text-gray-600">{endNode.name}</p>
          </div>
        </div>
      </div>

      {routeInfo && (
        <div className="bg-gray-50 p-2 rounded-md mb-3">
          <div className="flex justify-between text-sm">
            <span>Distance</span>
            <span className="font-semibold">
              {(routeInfo.distance / 1000).toFixed(2)} km
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Est. Time</span>
            <span className="font-semibold">
              {Math.ceil(routeInfo.estimatedTime)} min
            </span>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          className="flex-1 py-2 px-3 bg-gray-200 rounded-md text-sm font-medium hover:bg-gray-300"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
          onClick={onGenerateQR}
        >
          Generate QR
        </button>
      </div>
    </div>
  );
};

export default RouteOverlay;
