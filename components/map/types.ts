import { ReadonlyURLSearchParams } from "next/navigation";
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
  roadsUrl?: string;
  nodesUrl?: string;
  initialZoom?: number;
  backdropColor?: string;
  debug?: boolean;
  centerCoordinates?: [number, number];
  routeData?: any;
  mobileMode?: boolean;
  kioskId?: string;
  searchParams?: ReadonlyURLSearchParams;
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
