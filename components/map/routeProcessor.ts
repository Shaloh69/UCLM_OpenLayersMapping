import { useEffect, useRef, useState, useCallback } from "react";
import GeoJSON from "ol/format/GeoJSON";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import Map from "ol/Map";
import { toLonLat } from "ol/proj";
import { RoadNode } from "./roadSystem";
import { RouteData } from "./qrCodeUtils";
import { getSafeCoordinates } from "./typeSafeGeometryUtils";

/**
 * Custom hook for processing route data from URLs or passed props
 */
export const useRouteProcessor = (
  nodesUrl: string,
  roadsUrl: string,
  mapInstanceRef: React.MutableRefObject<Map | null>,
  displayRoute: (startNodeId: string, endNodeId: string) => void,
  setCurrentLocation: React.Dispatch<React.SetStateAction<RoadNode | null>>,
  setSelectedDestination: React.Dispatch<React.SetStateAction<RoadNode | null>>,
  setRouteInfo: React.Dispatch<
    React.SetStateAction<
      { distance: number; estimatedTime: number } | undefined
    >
  >,
  setShowRouteOverlay: React.Dispatch<React.SetStateAction<boolean>>,
  routeData: RouteData | null | undefined,
  logDebug: (message: string) => void
) => {
  // Store loaded features in a ref to avoid unnecessary re-renders
  const allFeaturesRef = useRef<Feature<Geometry>[]>([]);
  const [featuresReady, setFeaturesReady] = useState(false);
  const routeProcessedRef = useRef(false);

  // Helper function to create a RoadNode from a feature
  const createNodeFromFeature = useCallback(
    (feature: Feature | any): RoadNode => {
      const geometry = feature.getGeometry();
      const coords = getSafeCoordinates(geometry);

      // Ensure it's a tuple [number, number] for RoadNode
      const geoCoords =
        coords && coords.length >= 2
          ? (toLonLat(coords) as [number, number])
          : ([0, 0] as [number, number]);

      return {
        id:
          feature.get("id") ||
          `node-${Math.random().toString(36).substring(2, 9)}`,
        name: feature.get("name") || "Location",
        isDestination: !!feature.get("isDestination"),
        coordinates: geoCoords,
        category: feature.get("category"),
        description: feature.get("description"),
        imageUrl: feature.get("imageUrl"),
      };
    },
    []
  );

  // Load features directly from GeoJSON files
  useEffect(() => {
    // Skip if features are already loaded

    if (featuresReady || allFeaturesRef.current.length > 0) return;

    // Use actual URLs, not placeholder paths
    const actualNodesUrl = nodesUrl.startsWith("...")
      ? "/UCLM_Nodes.geojson"
      : nodesUrl;
    const actualRoadsUrl = roadsUrl.startsWith("...")
      ? "/UCLM_Roads.geojson"
      : roadsUrl;

    logDebug(
      `Attempting direct GeoJSON load from: ${actualNodesUrl} and ${actualRoadsUrl}`
    );

    // Create a GeoJSON format instance
    const format = new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    // Fetch both files in parallel
    Promise.all([
      fetch(actualNodesUrl).then((res) => res.json()),
      fetch(actualRoadsUrl).then((res) => res.json()),
    ])
      .then(([nodesJson, roadsJson]) => {
        try {
          // Parse the JSON into features
          const nodeFeatures = format.readFeatures(nodesJson);
          const roadFeatures = format.readFeatures(roadsJson);

          // Store in ref
          allFeaturesRef.current = [...nodeFeatures, ...roadFeatures];

          logDebug(
            `✅ Combined direct load: ${allFeaturesRef.current.length} features`
          );

          // Print some debug info about nodes
          const destinations = nodeFeatures.filter(
            (f) => f.get("isDestination") === true
          );
          logDebug(
            `✅ Loaded ${nodeFeatures.length} nodes (${destinations.length} destinations)`
          );

          // Mark features as ready
          setFeaturesReady(true);
        } catch (error) {
          console.error("Error parsing GeoJSON:", error);
          logDebug(`❌ Error parsing GeoJSON: ${error}`);
        }
      })
      .catch((error) => {
        console.error("❌ Failed to load GeoJSON files:", error);
        logDebug(`❌ Failed to load GeoJSON files: ${error}`);
      });
  }, [nodesUrl, roadsUrl, logDebug, featuresReady]);

  // Process route data once features are loaded
  useEffect(() => {
    // Skip if no route data, features not ready, map not ready, or already processed
    if (
      !routeData ||
      !featuresReady ||
      !mapInstanceRef.current ||
      routeProcessedRef.current
    ) {
      return;
    }

    const { startNodeId, endNodeId } = routeData;
    const features = allFeaturesRef.current;

    logDebug(`📍 Processing route from ${startNodeId} to ${endNodeId}`);
    logDebug(`📍 Searching in ${features.length} loaded features`);

    // First try exact match
    let startFeature = features.find((f) => f.get("id") === startNodeId);
    let endFeature = features.find((f) => f.get("id") === endNodeId);

    // If not found, try case-insensitive match
    if (!startFeature) {
      startFeature = features.find(
        (f) => f.get("id")?.toLowerCase() === startNodeId?.toLowerCase()
      );
    }

    if (!endFeature) {
      endFeature = features.find(
        (f) => f.get("id")?.toLowerCase() === endNodeId?.toLowerCase()
      );
    }

    if (!startFeature || !endFeature) {
      console.error("❌ Could not find start or end feature:", {
        startNodeId,
        endNodeId,
        availableIds: features
          .filter((f) => f.get("id"))
          .map((f) => f.get("id"))
          .slice(0, 10), // Just show the first 10 to avoid log flooding
      });

      logDebug(
        `❌ Could not find features for startNodeId=${startNodeId} or endNodeId=${endNodeId}`
      );
      return;
    }

    // Create node objects from features
    const startNode = createNodeFromFeature(startFeature);
    const endNode = createNodeFromFeature(endFeature);

    logDebug(`✅ Found startNode: ${startNode.name} (${startNode.id})`);
    logDebug(`✅ Found endNode: ${endNode.name} (${endNode.id})`);

    // Update state
    setCurrentLocation(startNode);
    setSelectedDestination(endNode);

    // Display the route
    displayRoute(startNode.id, endNode.id);

    // Set route info if available
    if (routeData.routeInfo) {
      setRouteInfo(routeData.routeInfo);
    }

    // Show the route overlay
    setShowRouteOverlay(true);

    // Mark as processed to avoid duplicate processing
    routeProcessedRef.current = true;

    logDebug("✅ Route processing complete");
  }, [
    routeData,
    featuresReady,
    mapInstanceRef,
    displayRoute,
    setCurrentLocation,
    setSelectedDestination,
    setRouteInfo,
    setShowRouteOverlay,
    createNodeFromFeature,
    logDebug,
  ]);

  // Method to reset the route processing state - useful for clearing routes
  const resetRouteProcessor = useCallback(() => {
    routeProcessedRef.current = false;
  }, []);

  // Return any values needed from this hook
  return {
    featuresReady,
    allFeatures: allFeaturesRef.current,
    resetRouteProcessor,
  };
};

export default useRouteProcessor;
