import React, { MutableRefObject, ChangeEvent } from "react";
import {
  DebugPanelProps,
  EditControlsProps,
  CustomizationPanelProps,
} from "./types";

// Debug logging function
export const debugLog = (
  debugInfoRef: MutableRefObject<string[]>,
  debug: boolean,
  message: string,
  callback?: () => void
) => {
  if (!debug) return;

  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${message}`;

  console.log(logMessage);
  debugInfoRef.current = [...debugInfoRef.current, logMessage].slice(-50); // Keep last 50 messages

  if (callback) callback();
};

// Debug Panel Component
export const DebugPanel: React.FC<DebugPanelProps> = ({ debugInfo }) => (
  <div className="absolute bottom-4 right-4 w-80 max-h-60 overflow-y-auto bg-white bg-opacity-90 rounded-lg shadow-lg p-3 text-xs font-mono z-20">
    <h3 className="font-bold mb-2">Debug Info</h3>
    <ul className="space-y-1">
      {debugInfo.map((info, index) => (
        <li key={index}>{info}</li>
      ))}
    </ul>
  </div>
);

// Edit Controls Component
export const EditControls: React.FC<EditControlsProps> = ({
  isEditMode,
  toggleEditMode,
  drawType,
  handleDrawInteractionToggle,
  handleDeleteSelected,
  handleExportMap,
}) => (
  <div className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
    <div className="flex flex-col space-y-2">
      <button
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isEditMode ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
        onClick={toggleEditMode}
      >
        {isEditMode ? "Exit Edit Mode" : "Edit Map"}
      </button>

      {isEditMode && (
        <>
          <div className="flex space-x-2">
            {(["Point", "LineString", "Polygon"] as const).map((type) => (
              <button
                key={type}
                className={`px-3 py-1 text-xs rounded-md ${
                  drawType === type ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => handleDrawInteractionToggle(type)}
              >
                {type === "LineString"
                  ? "Line"
                  : type === "Polygon"
                    ? "Area"
                    : "Point"}
              </button>
            ))}
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 text-xs bg-red-500 text-white rounded-md"
              onClick={handleDeleteSelected}
            >
              Delete
            </button>
            <button
              className="px-3 py-1 text-xs bg-gray-700 text-white rounded-md"
              onClick={handleExportMap}
            >
              Export
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);

// Customization Panel Component
export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  featureProperties,
  updateFeatureProperty,
  markerSizeOptions,
  onClose,
}) => {
  const isPoint =
    featureProperties?.geometry?.getType?.() === "Point" ||
    featureProperties?.["marker-color"] !== undefined;

  return (
    <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg w-64">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">Customize Feature</h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            className="w-full px-2 py-1 border rounded"
            value={featureProperties?.name ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateFeatureProperty("name", e.target.value)
            }
          />
        </div>

        {isPoint ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Marker Color
              </label>
              <input
                type="color"
                className="block w-full"
                value={featureProperties?.["marker-color"] ?? "#ff0000"}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateFeatureProperty("marker-color", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <select
                className="w-full px-2 py-1 border rounded"
                value={featureProperties?.["marker-size"] ?? "medium"}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  updateFeatureProperty("marker-size", e.target.value)
                }
              >
                {markerSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Fill Color
              </label>
              <input
                type="color"
                className="block w-full"
                value={featureProperties?.fill ?? "#0080ff"}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateFeatureProperty("fill", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Stroke Color
              </label>
              <input
                type="color"
                className="block w-full"
                value={featureProperties?.stroke ?? "#000000"}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateFeatureProperty("stroke", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="w-full"
                value={featureProperties?.["fill-opacity"] ?? 0.5}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateFeatureProperty(
                    "fill-opacity",
                    parseFloat(e.target.value)
                  )
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Stroke Width
              </label>
              <input
                type="number"
                className="w-full px-2 py-1 border rounded"
                min="1"
                max="10"
                value={featureProperties?.strokeWidth ?? 3}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateFeatureProperty("strokeWidth", parseInt(e.target.value))
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
