import { Fill, Stroke, Style } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Circle as CircleGeometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import { Extent } from "ol/extent";
import { containsCoordinate } from "ol/extent";
import Map from "ol/Map";
import { MutableRefObject } from "react";
import { debugLog } from "./components";

// Check if coordinates are within school boundary
export const isCoordinateInsideSchool = (
  coords: number[],
  boundary: Extent | null
) => {
  if (!boundary) return true; // If no boundary defined, assume inside
  return containsCoordinate(boundary, coords);
};

export const setupLocationTracking = (
  map: Map,
  debugInfoRef: MutableRefObject<string[]>,
  locationErrorRef: MutableRefObject<string | null>,
  isOutsideSchoolRef: MutableRefObject<boolean>,
  schoolBoundaryRef: MutableRefObject<Extent | null>,
  isUpdatingPositionRef: MutableRefObject<boolean>,
  debug: boolean
) => {
  // GPS Marker & Accuracy Circle
  const userPositionFeature = new Feature({
    geometry: new Point(fromLonLat([0, 0])),
  });

  const accuracyFeature = new Feature({
    geometry: new CircleGeometry(fromLonLat([0, 0]), 10),
  });

  const userPositionLayer = new VectorLayer({
    source: new VectorSource({
      features: [accuracyFeature, userPositionFeature],
    }),
    style: (feature) => {
      if (feature === userPositionFeature) {
        return new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: "#ff0000" }),
            stroke: new Stroke({ color: "#ffffff", width: 2 }),
          }),
        });
      } else if (feature === accuracyFeature) {
        return new Style({
          fill: new Fill({ color: "rgba(0, 0, 255, 0.2)" }),
          stroke: new Stroke({ color: "blue", width: 1 }),
        });
      }
      return new Style();
    },
  });

  map.addLayer(userPositionLayer);

  // Better approach to update user position
  const updateUserPosition = (position: GeolocationPosition) => {
    if (isUpdatingPositionRef.current) return; // Prevent concurrent updates

    isUpdatingPositionRef.current = true;

    try {
      const { latitude, longitude, accuracy } = position.coords;
      const coords = fromLonLat([longitude, latitude]);

      // Update geometry directly without changing state if possible
      userPositionFeature.setGeometry(new Point(coords));
      accuracyFeature.setGeometry(new CircleGeometry(coords, accuracy || 10));

      // Check if the user is outside the school boundary
      const isOutside =
        schoolBoundaryRef.current &&
        !isCoordinateInsideSchool(coords, schoolBoundaryRef.current);

      // Only update ref if it has changed - no state updates here
      if (isOutside !== isOutsideSchoolRef.current) {
        isOutsideSchoolRef.current = !!isOutside;

        if (isOutside) {
          debugLog(debugInfoRef, debug, "Location outside school boundaries");
        }
      }
    } finally {
      // Make sure we reset the flag even if there's an error
      isUpdatingPositionRef.current = false;
    }
  };

  const watchId = navigator.geolocation.watchPosition(
    updateUserPosition,
    (error) => {
      console.error("Error getting location:", error);
      // Update ref instead of state directly
      const errorMsg = `Location error: ${error.message}`;
      if (locationErrorRef.current !== errorMsg) {
        locationErrorRef.current = errorMsg;
        debugLog(debugInfoRef, debug, `Geolocation error: ${error.message}`);
      }
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    }
  );

  return {
    watchId,
    userPositionFeature,
    accuracyFeature,
  };
};
