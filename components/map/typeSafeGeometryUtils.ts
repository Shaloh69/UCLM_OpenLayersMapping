import { Geometry } from "ol/geom";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import { Feature } from "ol";

/**
 * Type-safe utility to get coordinates from any geometry
 *
 * @param geometry The geometry to extract coordinates from
 * @returns A safe array of coordinates or null if not available
 */
export const getSafeCoordinates = (
  geometry: Geometry | null | undefined
): number[] | null => {
  if (!geometry) return null;

  try {
    if (geometry instanceof Point) {
      return geometry.getCoordinates();
    }

    if (geometry instanceof LineString) {
      const firstCoord = geometry.getFirstCoordinate();
      return firstCoord || null;
    }

    // Fallback for other geometry types
    if (typeof (geometry as any).getFirstCoordinate === "function") {
      return (geometry as any).getFirstCoordinate();
    }

    if (typeof (geometry as any).getCoordinates === "function") {
      const coords = (geometry as any).getCoordinates();
      if (Array.isArray(coords) && coords.length > 0) {
        if (Array.isArray(coords[0])) {
          return coords[0];
        }
        return coords;
      }
    }
  } catch (error) {
    console.error("Error getting coordinates from geometry:", error);
  }

  return null;
};

/**
 * Type-safe utility to get length from a geometry
 *
 * @param geometry The geometry to measure
 * @returns The length of the geometry or 0 if not available
 */
export const getSafeLength = (
  geometry: Geometry | null | undefined
): number => {
  if (!geometry) return 0;

  try {
    if (geometry instanceof LineString) {
      return geometry.getLength();
    }

    // Fallback for other geometry types
    if (typeof (geometry as any).getLength === "function") {
      return (geometry as any).getLength();
    }
  } catch (error) {
    console.error("Error calculating geometry length:", error);
  }

  return 0;
};

/**
 * Type-safe utility to get the type of a geometry
 *
 * @param geometry The geometry to check
 * @returns The geometry type as a string
 */
export const getSafeGeometryType = (
  geometry: Geometry | null | undefined
): string => {
  if (!geometry) return "unknown";

  try {
    return geometry.getType();
  } catch (error) {
    console.error("Error getting geometry type:", error);
    return "unknown";
  }
};

/**
 * Type-safe utility to calculate total path length from features
 *
 * @param features Array of features to measure
 * @returns Total length of all features
 */
export const calculatePathLength = (features: Feature[]): number => {
  let totalLength = 0;

  features.forEach((feature) => {
    const geometry = feature.getGeometry();
    totalLength += getSafeLength(geometry);
  });

  return totalLength;
};
