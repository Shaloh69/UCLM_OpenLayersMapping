import { MutableRefObject } from "react";

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export interface MapProps {
  mapUrl?: string;
  pointsUrl?: string;
  roadsUrl?: string; // Added for road network
  nodesUrl?: string; // Added for road nodes/destinations
  initialZoom?: number;
  backdropColor?: string;
  debug?: boolean;
  centerCoordinates?: [number, number];
}

export interface EditControlsProps {
  isEditMode: boolean;
  toggleEditMode: () => void;
  drawType: "Point" | "LineString" | "Polygon" | null;
  handleDrawInteractionToggle: (
    type: "Point" | "LineString" | "Polygon"
  ) => void;
  handleDeleteSelected: () => void;
  handleExportMap: () => void;
}

export interface CustomizationPanelProps {
  featureProperties: { [key: string]: any };
  updateFeatureProperty: (property: string, value: any) => void;
  markerSizeOptions: string[];
  onClose: () => void;
}

export interface DebugPanelProps {
  debugInfo: string[];
}

export type DebugCallback = () => void;
