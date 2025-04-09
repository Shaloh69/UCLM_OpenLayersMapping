"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "ol/ol.css";
import Map from "ol/Map";
import { fromLonLat, toLonLat } from "ol/proj";
import { Feature } from "ol";
import { Style, Stroke } from "ol/style";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { useRouter, useSearchParams } from "next/navigation";
import { containsCoordinate, Extent } from "ol/extent";
import Point from "ol/geom/Point";

import { MapProps } from "./types";
import { setupLayers } from "./layers";
import {
  setupLocationTracking,
  isCoordinateInsideSchool,
} from "./locationTracking";
import {
  setupEditControls,
  toggleDrawInteraction,
  deleteSelectedFeature,
  exportGeoJSON,
} from "./editControls";
import {
  CustomizationPanel,
  debugLog,
  DebugPanel,
  EditControls,
} from "./components";
import {
  setupRoadSystem,
  findClosestNode,
  findShortestPath,
  RoadNode,
} from "./roadSystem";
import { generateRouteQR, parseRouteFromUrl, RouteData } from "./qrCodeUtils";
import DestinationSelector from "./DestinationSelector";
import QRCodeModal from "./QRCodeModal";
import RouteOverlay from "./RouteOverlay";

const CampusMap: React.FC<MapProps> = ({
  mapUrl = "/UCLM_Map.geojson",
  pointsUrl = "/UCLM_Points.geojson",
  roadsUrl = "/UCLM_Roads.geojson", // New prop for roads data
  nodesUrl = "/UCLM_Nodes.geojson", // New prop for nodes data
  backdropColor = "#f7f2e4",
  initialZoom = 15,
  debug = false,
  centerCoordinates = [-3.8688, 40.0333],
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mapRef = useRef<HTMLDivElement>(null);
  const debugInfoRef = useRef<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [drawType, setDrawType] = useState<
    "Point" | "LineString" | "Polygon" | null
  >(null);

  // Feature customization state
  const [showCustomizePanel, setShowCustomizePanel] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [featureProperties, setFeatureProperties] = useState<{
    [key: string]: any;
  }>({});
  const [markerSizeOptions] = useState<string[]>(["small", "medium", "large"]);

  // Road system and navigation state
  const [showDestinationSelector, setShowDestinationSelector] =
    useState<boolean>(false);
  const [destinations, setDestinations] = useState<RoadNode[]>([]);
  const [selectedDestination, setSelectedDestination] =
    useState<RoadNode | null>(null);
  const [currentLocation, setCurrentLocation] = useState<RoadNode | null>(null);
  const [activeRoute, setActiveRoute] = useState<Feature[]>([]);
  const [showRouteOverlay, setShowRouteOverlay] = useState<boolean>(false);
  const [routeInfo, setRouteInfo] = useState<
    { distance: number; estimatedTime: number } | undefined
  >(undefined);
  const [showQRCodeModal, setShowQRCodeModal] = useState<boolean>(false);
  const [qrCodeUrl, setQRCodeUrl] = useState<string>("");

  // Map instance and source references
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<any>(null);
  const pointsSourceRef = useRef<any>(null);
  const drawInteractionRef = useRef<any>(null);
  const modifyInteractionRef = useRef<any>(null);
  const selectInteractionRef = useRef<any>(null);

  // Road system references
  const roadsSourceRef = useRef<VectorSource<Feature> | null>(null);
  const nodesSourceRef = useRef<VectorSource<Feature> | null>(null);
  const routeLayerRef = useRef<VectorLayer<VectorSource<Feature>> | null>(null);

  // Store UI in refs to minimize re-renders
  const locationErrorRef = useRef<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const isOutsideSchoolRef = useRef<boolean>(false);
  const [isOutsideSchool, setIsOutsideSchool] = useState<boolean>(false);
  const schoolBoundaryRef = useRef<Extent | null>(null);
  const updatePositionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidCenterRef = useRef<number[] | null>(null);
  const expandedExtentRef = useRef<Extent | null>(null);
  const isUpdatingPositionRef = useRef<boolean>(false);

  // Update feature property
  const updateFeatureProperty = (property: string, value: any) => {
    if (!selectedFeature) return;

    selectedFeature.set(property, value);

    // Update local state to reflect changes
    setFeatureProperties((prev) => ({
      ...prev,
      [property]: value,
    }));

    debugLog(debugInfoRef, debug, `Updated ${property} to ${value}`, () => {
      setDebugInfo([...debugInfoRef.current]);
    });
  };

  // Handle destination selection
  const handleDestinationSelect = (destination: RoadNode) => {
    setSelectedDestination(destination);
    setShowDestinationSelector(false);

    if (currentLocation) {
      // Find and display the route
      displayRoute(currentLocation.id, destination.id);
    } else {
      debugLog(
        debugInfoRef,
        debug,
        "No current location available for routing",
        () => setDebugInfo([...debugInfoRef.current])
      );
    }
  };

  // Display route between two nodes
  const displayRoute = (startNodeId: string, endNodeId: string) => {
    if (
      !roadsSourceRef.current ||
      !nodesSourceRef.current ||
      !mapInstanceRef.current
    ) {
      return;
    }

    // Clear existing route
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Find the shortest path
    const pathFeatures = findShortestPath(
      startNodeId,
      endNodeId,
      roadsSourceRef.current,
      nodesSourceRef.current,
      debugInfoRef,
      debug,
      () => setDebugInfo([...debugInfoRef.current])
    );

    if (pathFeatures.length === 0) {
      debugLog(debugInfoRef, debug, "No route found", () =>
        setDebugInfo([...debugInfoRef.current])
      );
      return;
    }

    // Create a route source and layer
    const routeSource = new VectorSource({
      features: pathFeatures,
    });

    const routeLayer = new VectorLayer({
      source: routeSource,
      style: new Style({
        stroke: new Stroke({
          color: "#4285F4",
          width: 6,
          lineDash: [],
        }),
        zIndex: 10,
      }),
    });

    // Add the layer to the map
    mapInstanceRef.current.addLayer(routeLayer);
    routeLayerRef.current = routeLayer;

    // Calculate route information (distance and time)
    let totalDistance = 0;
    pathFeatures.forEach((feature) => {
      const geometry = feature.getGeometry();
      if (geometry) {
        // Check if the geometry is a LineString that has getLength method
        if (geometry.getType() === "LineString") {
          try {
            // Use type assertion to access getLength
            const lineString = geometry as import("ol/geom/LineString").default;
            totalDistance += lineString.getLength(); // in meters
          } catch (error) {
            console.error("Error calculating line length:", error);
          }
        }
      }
    });

    // Estimate time (assuming walking speed of 5km/h = 1.38m/s)
    const estimatedTimeMinutes = totalDistance / (1.38 * 60);

    setRouteInfo({
      distance: totalDistance,
      estimatedTime: estimatedTimeMinutes,
    });

    setActiveRoute(pathFeatures);
    setShowRouteOverlay(true);

    debugLog(
      debugInfoRef,
      debug,
      `Route displayed: ${pathFeatures.length} segments, ${(totalDistance / 1000).toFixed(2)}km`,
      () => setDebugInfo([...debugInfoRef.current])
    );
  };

  // Generate QR code for the current route
  const handleGenerateQR = async () => {
    if (!currentLocation || !selectedDestination || !routeInfo) {
      return;
    }

    try {
      const routeData: RouteData = {
        startNodeId: currentLocation.id,
        endNodeId: selectedDestination.id,
        routeInfo: routeInfo,
      };

      const qrCode = await generateRouteQR(routeData, debugInfoRef, debug, () =>
        setDebugInfo([...debugInfoRef.current])
      );

      setQRCodeUrl(qrCode);
      setShowQRCodeModal(true);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      debugLog(debugInfoRef, debug, `QR code generation failed: ${error}`, () =>
        setDebugInfo([...debugInfoRef.current])
      );
    }
  };

  // Clear active route
  const clearRoute = () => {
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    setActiveRoute([]);
    setSelectedDestination(null);
    setShowRouteOverlay(false);
    setRouteInfo(undefined);

    debugLog(debugInfoRef, debug, "Route cleared", () =>
      setDebugInfo([...debugInfoRef.current])
    );
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (!mapInstanceRef.current) return;

    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);

    setupEditControls(
      newEditMode,
      mapInstanceRef.current,
      vectorSourceRef.current,
      pointsSourceRef.current,
      modifyInteractionRef,
      selectInteractionRef,
      drawInteractionRef,
      setSelectedFeature,
      setFeatureProperties,
      setShowCustomizePanel,
      setDrawType,
      debug,
      debugInfoRef,
      () => {
        setDebugInfo([...debugInfoRef.current]);
      }
    );
  };

  // Handle draw interaction toggles
  const handleDrawInteractionToggle = (
    type: "Point" | "LineString" | "Polygon"
  ) => {
    // If already active, toggle it off
    if (drawType === type) {
      toggleDrawInteraction(
        null,
        isEditMode,
        mapInstanceRef.current,
        vectorSourceRef.current,
        pointsSourceRef.current,
        drawInteractionRef,
        selectInteractionRef,
        setSelectedFeature,
        setFeatureProperties,
        setShowCustomizePanel,
        debug,
        debugInfoRef,
        () => {
          setDebugInfo([...debugInfoRef.current]);
        }
      );
      setDrawType(null);
    } else {
      // Otherwise, activate the new type
      toggleDrawInteraction(
        type,
        isEditMode,
        mapInstanceRef.current,
        vectorSourceRef.current,
        pointsSourceRef.current,
        drawInteractionRef,
        selectInteractionRef,
        setSelectedFeature,
        setFeatureProperties,
        setShowCustomizePanel,
        debug,
        debugInfoRef,
        () => {
          setDebugInfo([...debugInfoRef.current]);
        }
      );
      setDrawType(type);
    }
  };

  // Check URL for route parameters on first load
  useEffect(() => {
    if (searchParams) {
      const routeData = parseRouteFromUrl(
        searchParams,
        debugInfoRef,
        debug,
        () => setDebugInfo([...debugInfoRef.current])
      );

      if (routeData) {
        // Store route data to activate after map initialization
        sessionStorage.setItem("pendingRoute", JSON.stringify(routeData));
      }
    }
  }, [searchParams]);

  // MAIN EFFECT - Initialize map once and handle changes to GeoJSON files
  useEffect(() => {
    if (!mapRef.current) return;

    // Update UI states from refs when they change - minimize state updates
    const updateUIStates = () => {
      // Only update if values have changed to prevent re-renders
      if (locationErrorRef.current !== locationError) {
        setLocationError(locationErrorRef.current);
      }
      if (isOutsideSchoolRef.current !== isOutsideSchool) {
        setIsOutsideSchool(isOutsideSchoolRef.current);
      }
    };

    // Throttle UI updates
    const uiUpdateInterval = setInterval(updateUIStates, 1000);

    // Setup layers and map
    const { map, vectorSource, pointsSource, view } = setupLayers(
      mapRef.current,
      backdropColor,
      centerCoordinates,
      initialZoom,
      mapUrl,
      pointsUrl
    );

    // Store refs for access in other functions
    mapInstanceRef.current = map;
    vectorSourceRef.current = vectorSource;
    pointsSourceRef.current = pointsSource;

    // Setup road system
    const { roadsLayer, roadsSource, nodesSource } = setupRoadSystem(
      roadsUrl,
      nodesUrl,
      debugInfoRef,
      debug,
      () => setDebugInfo([...debugInfoRef.current])
    );

    // Add road layer to map
    map.addLayer(roadsLayer);

    // Store road system refs
    roadsSourceRef.current = roadsSource;
    nodesSourceRef.current = nodesSource;

    // Load destinations from nodes source
    nodesSource.on("featuresloadend", () => {
      const features = nodesSource.getFeatures();
      const loadedDestinations: RoadNode[] = [];

      features.forEach((feature) => {
        const props = feature.getProperties();
        const geometry = feature.getGeometry();

        if (props.isDestination && geometry) {
          let coords: number[] = [0, 0];

          // Handle geometry correctly
          if (geometry instanceof Point) {
            coords = geometry.getCoordinates();
          } else {
            // Skip if not a point
            return;
          }

          const geoCoords = toLonLat(coords);

          loadedDestinations.push({
            id:
              props.id || `node-${Math.random().toString(36).substring(2, 9)}`,
            name: props.name || "Unnamed Location",
            isDestination: true,
            coordinates: geoCoords as [number, number],
            description: props.description,
            category: props.category || "General",
            imageUrl: props.imageUrl,
          });
        }
      });

      setDestinations(loadedDestinations);
      debugLog(
        debugInfoRef,
        debug,
        `Loaded ${loadedDestinations.length} destinations`,
        () => setDebugInfo([...debugInfoRef.current])
      );

      // Check for pending route from URL parameters
      const pendingRouteData = sessionStorage.getItem("pendingRoute");
      if (pendingRouteData) {
        try {
          const routeData: RouteData = JSON.parse(pendingRouteData);

          // Find nodes by ID
          const startNode =
            loadedDestinations.find((d) => d.id === routeData.startNodeId) ||
            null;
          const endNode =
            loadedDestinations.find((d) => d.id === routeData.endNodeId) ||
            null;

          if (startNode && endNode) {
            setCurrentLocation(startNode);
            setSelectedDestination(endNode);

            // Display the route
            displayRoute(startNode.id, endNode.id);

            // If route info was provided, use it
            if (routeData.routeInfo) {
              setRouteInfo(routeData.routeInfo);
            }
          }

          // Clear the pending route
          sessionStorage.removeItem("pendingRoute");
        } catch (error) {
          console.error("Error processing pending route:", error);
        }
      }
    });

    // Setup location tracking
    const { watchId, userPositionFeature, accuracyFeature } =
      setupLocationTracking(
        map,
        debugInfoRef,
        locationErrorRef,
        isOutsideSchoolRef,
        schoolBoundaryRef,
        isUpdatingPositionRef,
        debug
      );

    // Update current location node when user position changes
    const updateCurrentLocationNode = () => {
      if (
        !userPositionFeature ||
        !nodesSourceRef.current ||
        isUpdatingPositionRef.current
      )
        return;

      const geometry = userPositionFeature.getGeometry();
      if (!geometry) return;

      const coords = geometry.getFirstCoordinate
        ? geometry.getFirstCoordinate()
        : geometry instanceof Point
          ? geometry.getCoordinates()
          : null;
      if (!coords) return;

      // Convert to geo coordinates
      const geoCoords = toLonLat(coords);

      // Find the closest node
      const closestNode = findClosestNode(
        geoCoords[0],
        geoCoords[1],
        nodesSourceRef.current
      );

      if (
        closestNode &&
        (!currentLocation || closestNode.id !== currentLocation.id)
      ) {
        setCurrentLocation(closestNode);
        debugLog(
          debugInfoRef,
          debug,
          `Current location updated to: ${closestNode.name}`,
          () => setDebugInfo([...debugInfoRef.current])
        );

        // If there's an active destination, update the route
        if (selectedDestination) {
          displayRoute(closestNode.id, selectedDestination.id);
        }
      }
    };

    // Set up timer to update current location node
    const locationNodeInterval = setInterval(updateCurrentLocationNode, 3000);

    vectorSource.on("featuresloadend", () => {
      try {
        const extent: Extent = vectorSource.getExtent();
        const features = vectorSource.getFeatures();

        // Store the school boundary for location checking
        if (extent && extent.every((v) => isFinite(v))) {
          // Add some padding to the boundary
          const expandedBoundary: Extent = [
            extent[0] - 500, // buffer in meters
            extent[1] - 500,
            extent[2] + 500,
            extent[3] + 500,
          ];
          schoolBoundaryRef.current = expandedBoundary;
        }

        if (debug) {
          features.forEach((feature: any, index: number) => {
            try {
              const properties = feature.getProperties();
              debugLog(
                debugInfoRef,
                debug,
                `Feature ${index + 1} Properties: ${JSON.stringify(properties)}`,
                () => {
                  setDebugInfo([...debugInfoRef.current]);
                }
              );
            } catch (propError) {
              console.error(
                `Property processing error for feature ${index}:`,
                propError
              );
            }
          });
        }

        if (extent && extent.every((v) => isFinite(v))) {
          const paddingFactor = 1.5;
          const centerPoint = [
            (extent[0] + extent[2]) / 2,
            (extent[1] + extent[3]) / 2,
          ];

          const expanded: Extent = [
            centerPoint[0] - ((extent[2] - extent[0]) * paddingFactor) / 2,
            centerPoint[1] - ((extent[3] - extent[1]) * paddingFactor) / 2,
            centerPoint[0] + ((extent[2] - extent[0]) * paddingFactor) / 2,
            centerPoint[1] + ((extent[3] - extent[1]) * paddingFactor) / 2,
          ];

          // Store in ref for access from other functions
          expandedExtentRef.current = expanded;

          view.fit(extent, {
            padding: [20, 20, 20, 20],
            maxZoom: 18,
          });

          lastValidCenterRef.current = view.getCenter() || null;
        } else {
          console.error("Invalid map extent:", extent);
          view.setCenter(fromLonLat(centerCoordinates));
          view.setZoom(initialZoom);
        }

        debugLog(
          debugInfoRef,
          debug,
          `Loaded ${features.length} features successfully`,
          () => setDebugInfo([...debugInfoRef.current])
        );
      } catch (error) {
        console.error("Error processing map extent:", error);
      }
    });

    // FIX: Improve the pointerdrag handler to avoid state updates
    let isUpdatingCenter = false;

    map.on("pointerdrag", () => {
      if (isUpdatingCenter) return;

      const currentCenter = view.getCenter();
      if (!currentCenter || !expandedExtentRef.current) return;

      if (!containsCoordinate(expandedExtentRef.current, currentCenter)) {
        isUpdatingCenter = true;

        try {
          const clampedCenter = [
            Math.max(
              expandedExtentRef.current[0],
              Math.min(currentCenter[0], expandedExtentRef.current[2])
            ),
            Math.max(
              expandedExtentRef.current[1],
              Math.min(currentCenter[1], expandedExtentRef.current[3])
            ),
          ];

          // Only update if the center has significantly changed
          if (
            !lastValidCenterRef.current ||
            Math.abs(clampedCenter[0] - (lastValidCenterRef.current[0] || 0)) >
              0.1 ||
            Math.abs(clampedCenter[1] - (lastValidCenterRef.current[1] || 0)) >
              0.1
          ) {
            lastValidCenterRef.current = clampedCenter;
            view.setCenter(clampedCenter);
          }
        } finally {
          isUpdatingCenter = false;
        }
      } else {
        lastValidCenterRef.current = currentCenter;
      }
    });

    vectorSource.on("featuresloaderror", (error: any) => {
      console.error("Features load error:", error);
      debugLog(debugInfoRef, debug, "Failed to load map features", () =>
        setDebugInfo([...debugInfoRef.current])
      );
      locationErrorRef.current =
        "Failed to load map data. Please try again later.";
    });

    const handleResize = () => {
      try {
        map.updateSize();
        const extent: Extent = vectorSource.getExtent();
        if (extent && extent.every((v) => isFinite(v))) {
          view.fit(extent, {
            padding: [20, 20, 20, 20],
            maxZoom: 18,
          });
        }
      } catch (resizeError) {
        console.error("Resize error:", resizeError);
      }
    };
    window.addEventListener("resize", handleResize);

    // Expose map editing API to console
    (window as any).mapEditor = {
      toggleEditMode,
      deleteSelected: () =>
        deleteSelectedFeature(
          selectInteractionRef.current,
          vectorSourceRef.current,
          pointsSourceRef.current,
          setShowCustomizePanel,
          setSelectedFeature,
          debugInfoRef,
          debug,
          () => setDebugInfo([...debugInfoRef.current])
        ),
      exportGeoJSON: (filename: string = "map_export.geojson") => {
        exportGeoJSON(vectorSource, filename, debugInfoRef, debug, () =>
          setDebugInfo([...debugInfoRef.current])
        );
      },
      exportPointsGeoJSON: (filename: string = "points_export.geojson") => {
        exportGeoJSON(pointsSource, filename, debugInfoRef, debug, () =>
          setDebugInfo([...debugInfoRef.current])
        );
      },
      getAllFeatures: () => {
        return {
          polygons: vectorSource.getFeatures(),
          markers: pointsSource.getFeatures(),
        };
      },
      getSelectedFeature: () => {
        return selectInteractionRef.current?.getFeatures().item(0) || null;
      },
      updateFeatureProperty: (
        featureId: string,
        property: string,
        value: any
      ) => {
        const features = [
          ...vectorSource.getFeatures(),
          ...pointsSource.getFeatures(),
        ];
        const feature = features.find((f: any) => f.getId() === featureId);
        if (feature) {
          feature.set(property, value);
          debugLog(
            debugInfoRef,
            debug,
            `Updated property ${property} for feature ${featureId}`,
            () => setDebugInfo([...debugInfoRef.current])
          );
          return true;
        }
        return false;
      },
    };

    debugLog(
      debugInfoRef,
      debug,
      "Map editor initialized. Access via window.mapEditor in console",
      () => setDebugInfo([...debugInfoRef.current])
    );

    return () => {
      // Clean up timeouts to prevent memory leaks
      if (updatePositionTimeoutRef.current) {
        clearTimeout(updatePositionTimeoutRef.current);
      }

      clearInterval(uiUpdateInterval);
      clearInterval(locationNodeInterval);
      window.removeEventListener("resize", handleResize);
      navigator.geolocation.clearWatch(watchId);
      // Clean up the global API
      delete (window as any).mapEditor;
      map.setTarget(undefined);
    };
  }, [mapUrl, pointsUrl, roadsUrl, nodesUrl]); // Only re-run if the GeoJSON files change

  return (
    <div className="relative w-full h-screen">
      <div
        ref={mapRef}
        className="w-full h-full absolute top-0 left-0"
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          borderRadius: "12px",
        }}
      />

      {/* Outside School Boundary Alert */}
      {isOutsideSchool && (
        <div className="absolute top-20 left-0 right-0 mx-auto w-64 bg-red-500 text-white p-3 rounded-lg z-20 text-center shadow-lg">
          <strong>Warning:</strong> You appear to be outside the campus
          boundaries.
        </div>
      )}

      {/* Location Error Alert */}
      {locationError && (
        <div className="absolute top-20 left-0 right-0 mx-auto w-64 bg-yellow-500 text-white p-3 rounded-lg z-20 text-center shadow-lg">
          {locationError}
        </div>
      )}

      {/* Edit Controls */}
      <EditControls
        isEditMode={isEditMode}
        toggleEditMode={toggleEditMode}
        drawType={drawType}
        handleDrawInteractionToggle={handleDrawInteractionToggle}
        handleDeleteSelected={() =>
          deleteSelectedFeature(
            selectInteractionRef.current,
            vectorSourceRef.current,
            pointsSourceRef.current,
            setShowCustomizePanel,
            setSelectedFeature,
            debugInfoRef,
            debug,
            () => setDebugInfo([...debugInfoRef.current])
          )
        }
        handleExportMap={() =>
          exportGeoJSON(
            vectorSourceRef.current,
            "map_export.geojson",
            debugInfoRef,
            debug,
            () => setDebugInfo([...debugInfoRef.current])
          )
        }
      />

      {/* Feature Customization Panel */}
      {showCustomizePanel && (
        <CustomizationPanel
          featureProperties={featureProperties}
          updateFeatureProperty={updateFeatureProperty}
          markerSizeOptions={markerSizeOptions}
          onClose={() => setShowCustomizePanel(false)}
        />
      )}

      {/* Navigation Controls */}
      <div className="absolute bottom-4 right-4 z-30">
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
          onClick={() => setShowDestinationSelector(true)}
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
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </button>
      </div>

      {/* Destination Selector */}
      {showDestinationSelector && (
        <div className="absolute top-4 left-4 z-40">
          <DestinationSelector
            destinations={destinations}
            onSelect={handleDestinationSelect}
            onClose={() => setShowDestinationSelector(false)}
          />
        </div>
      )}

      {/* Route Overlay */}
      {showRouteOverlay && (
        <RouteOverlay
          startNode={currentLocation}
          endNode={selectedDestination}
          routeInfo={routeInfo}
          onCancel={clearRoute}
          onGenerateQR={handleGenerateQR}
        />
      )}

      {/* QR Code Modal */}
      {showQRCodeModal && (
        <QRCodeModal
          qrCodeUrl={qrCodeUrl}
          destination={selectedDestination!}
          routeInfo={routeInfo}
          onClose={() => setShowQRCodeModal(false)}
        />
      )}

      {/* Debug Panel */}
      {debug && <DebugPanel debugInfo={debugInfo} />}
    </div>
  );
};

export default dynamic(() => Promise.resolve(CampusMap), { ssr: false });
