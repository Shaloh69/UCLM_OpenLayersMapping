"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
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
import View from "ol/View";
import Geometry from "ol/geom/Geometry";

import { getSafeCoordinates } from "./typeSafeGeometryUtils";
import { useRouteProcessor } from "./routeProcessor";

import { MapProps } from "./types";
import { setupLayers } from "./layers";
import { setupLocationTracking } from "./locationTracking";
import {
  setupEnhancedLocationTracking,
  EnhancedLocationTracker,
  RouteProgress,
  UserPosition,
} from "./enhancedLocationTracking";
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
import { useKioskRouteManager } from "./qrCodeUtils";
import KioskQRModal from "./KioskQRModal";
import RouteOverlay from "./RouteOverlay";
import EnhancedMobileRoutePanel from "./EnhancedMobileRoutePanel";
import router from "next/router";
import GeoJSON from "ol/format/GeoJSON";

const CampusMap: React.FC<MapProps> = ({
  mapUrl = "/UCLM_Map.geojson",
  pointsUrl = "/UCLM_Points.geojson",
  roadsUrl = "/UCLM_Roads.geojson",
  nodesUrl = "/UCLM_Nodes.geojson",
  backdropColor = "#f7f2e4",
  initialZoom = 15,
  centerCoordinates = [123.9545, 10.3265],
  routeData,
  mobileMode = false,
  debug = false,
  searchParams,
}) => {
  const routerSearchParams = useSearchParams();
  const effectiveSearchParams = searchParams || routerSearchParams;

  const mapRef = useRef<HTMLDivElement>(null);
  const debugInfoRef = useRef<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [drawType, setDrawType] = useState<
    "Point" | "LineString" | "Polygon" | null
  >(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<string>("");

  // Feature customization state
  const [showCustomizePanel, setShowCustomizePanel] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [featureProperties, setFeatureProperties] = useState<{
    [key: string]: any;
  }>({});
  const markerSizeOptions = useMemo(() => ["small", "medium", "large"], []);

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
  const allFeaturesRef = useRef<Feature[]>([]);

  // User location permission state
  const [locationPermissionRequested, setLocationPermissionRequested] =
    useState<boolean>(false);
  const [locationTrackingEnabled, setLocationTrackingEnabled] =
    useState<boolean>(false);
  const [defaultStartLocation, setDefaultStartLocation] =
    useState<RoadNode | null>(null);

  const {
    qrCodeUrl,
    showQRModal,
    isGenerating,
    error,
    generateRouteQRCode,
    closeQRModal,
    resetKiosk,
  } = useKioskRouteManager({
    currentLocation,
    selectedDestination,
    routeInfo,
    defaultStartLocation,
    debugInfoRef,
    debug: true, // Set to false in production
    // onReset: clearRoute,
    updateDebugCallback: () => setDebugInfo([...debugInfoRef.current]),
  });
  // Map instance and source references
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const pointsSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const drawInteractionRef = useRef<any>(null);
  const modifyInteractionRef = useRef<any>(null);
  const selectInteractionRef = useRef<any>(null);

  // Road system references
  const roadsSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const nodesSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const routeLayerRef = useRef<VectorLayer<
    VectorSource<Feature<Geometry>>
  > | null>(null);

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
  const locationWatchIdRef = useRef<number | null>(null);
  const locationNodeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced location tracking
  const enhancedTrackerRef = useRef<EnhancedLocationTracker | null>(null);
  const [routeProgress, setRouteProgress] = useState<RouteProgress | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [useEnhancedTracking, setUseEnhancedTracking] = useState<boolean>(true);

  // Memoized debug log function
  const logDebug = useCallback((message: string) => {
    debugLog(debugInfoRef, true, message, () =>
      setDebugInfo([...debugInfoRef.current])
    );
  }, []);

  const requestLocationPermission = useCallback(() => {
    setLocationPermissionRequested(true);

    // This will now be in response to a user gesture
    navigator.geolocation.getCurrentPosition(
      () => {
        logDebug("Location permission granted");

        // Start location tracking now that we have permission
        const cleanup = initLocationTracking();
        return () => {
          if (cleanup) cleanup();
        };
      },
      (error) => {
        console.error("Location permission denied", error);
        setLocationError(
          "Location permission denied. Using default entry point for navigation."
        );
        logDebug(`Geolocation error: ${error.message}`);
      }
    );
  }, [logDebug]);

  const initLocationTracking = useCallback(() => {
    if (!mapInstanceRef.current) return undefined;

    setLocationTrackingEnabled(true);

    // Use enhanced tracking for mobile mode
    if (mobileMode && useEnhancedTracking) {
      logDebug("Initializing enhanced location tracking for mobile");

      // Create enhanced tracker
      const tracker = setupEnhancedLocationTracking(
        mapInstanceRef.current,
        {
          autoFollow: true,
          rotateMap: true,
          smoothAnimation: true,
          animationDuration: 1000,
          zoomLevel: 19,
          showAccuracyCircle: true,
          showDirectionArrow: true,
          trackingMode: "route",
        },
        debugInfoRef,
        locationErrorRef,
        isOutsideSchoolRef,
        schoolBoundaryRef,
        debug
      );

      enhancedTrackerRef.current = tracker;

      // Start tracking with callbacks
      tracker.startTracking(
        (position: UserPosition) => {
          setUserPosition(position);

          // Update current location node
          if (nodesSourceRef.current) {
            const closestNode = findClosestNode(
              position.coordinates[0],
              position.coordinates[1],
              nodesSourceRef.current
            );

            if (
              closestNode &&
              (!currentLocation || closestNode.id !== currentLocation.id)
            ) {
              setCurrentLocation(closestNode);
              logDebug(`Current location updated to: ${closestNode.name}`);

              // If there's an active destination, update the route
              if (selectedDestination) {
                displayRoute(closestNode.id, selectedDestination.id);
              }
            }
          }
        },
        (progress: RouteProgress) => {
          setRouteProgress(progress);
        }
      );

      // Return cleanup function
      return () => {
        if (enhancedTrackerRef.current) {
          enhancedTrackerRef.current.stopTracking();
          enhancedTrackerRef.current.destroy();
          enhancedTrackerRef.current = null;
        }
      };
    } else {
      // Use standard tracking for desktop
      logDebug("Initializing standard location tracking");

      const { watchId, userPositionFeature } = setupLocationTracking(
        mapInstanceRef.current,
        debugInfoRef,
        locationErrorRef,
        isOutsideSchoolRef,
        schoolBoundaryRef,
        isUpdatingPositionRef,
        debug
      );

      locationWatchIdRef.current = watchId;

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
          logDebug(`Current location updated to: ${closestNode.name}`);

          // If there's an active destination, update the route
          if (selectedDestination) {
            displayRoute(closestNode.id, selectedDestination.id);
          }
        }
      };

      // Set up timer to update current location node
      const locationNodeInterval = setInterval(updateCurrentLocationNode, 3000);
      locationNodeIntervalRef.current = locationNodeInterval;

      // Return cleanup function
      return () => {
        if (locationWatchIdRef.current) {
          navigator.geolocation.clearWatch(locationWatchIdRef.current);
          locationWatchIdRef.current = null;
        }
        if (locationNodeIntervalRef.current) {
          clearInterval(locationNodeIntervalRef.current);
          locationNodeIntervalRef.current = null;
        }
      };
    }
  }, [currentLocation, selectedDestination, debug, logDebug, mobileMode, useEnhancedTracking]);

  const getFeatureCoordinates = (feature: Feature<Geometry>) => {
    const geometry = feature.getGeometry();
    if (geometry && geometry instanceof Point) {
      const coords = geometry.getCoordinates();
      const geoCoords = toLonLat(coords);
      // Explicitly cast to [number, number] tuple
      return geoCoords as [number, number];
    }
    return [0, 0] as [number, number]; // Default coordinates as tuple
  };

  // Helper function to process the route data
  const processRouteData = (routeData: RouteData) => {
    // Check if sources are available
    if (!nodesSourceRef.current) {
      console.error("Nodes source not initialized");
      return;
    }

    // Find start and end nodes
    const startNodeId = routeData.startNodeId;
    const endNodeId = routeData.endNodeId;

    console.log(`Processing route from ${startNodeId} to ${endNodeId}`);

    const features = nodesSourceRef.current.getFeatures();

    const startFeature = features.find((f) => f.get("id") === startNodeId);
    const endFeature = features.find((f) => f.get("id") === endNodeId);

    if (!startFeature || !endFeature) {
      console.error("Could not find start or end node features");
      return;
    }

    // Create node objects
    const startNode = {
      id: startFeature.get("id"),
      name: startFeature.get("name") || "Start",
      isDestination: true,
      coordinates: getFeatureCoordinates(startFeature),
      category: startFeature.get("category"),
    };

    const endNode = {
      id: endFeature.get("id"),
      name: endFeature.get("name") || "Destination",
      isDestination: true,
      coordinates: getFeatureCoordinates(endFeature),
      category: endFeature.get("category"),
    };

    // Set nodes in state
    setCurrentLocation(startNode);
    setSelectedDestination(endNode);

    // Find and display route
    displayRoute(startNode.id, endNode.id);

    // Set route UI to visible
    setShowRouteOverlay(true);

    // Set route info if available
    if (routeData.routeInfo) {
      setRouteInfo(routeData.routeInfo);
    }
  };

  // Update feature property
  const updateFeatureProperty = useCallback(
    (property: string, value: any) => {
      if (!selectedFeature) return;

      selectedFeature.set(property, value);

      // Update local state to reflect changes
      setFeatureProperties((prev) => ({
        ...prev,
        [property]: value,
      }));

      logDebug(`Updated ${property} to ${value}`);
    },
    [selectedFeature, logDebug]
  );

  // Handle destination selection
  const handleDestinationSelect = useCallback(
    (destination: RoadNode) => {
      setSelectedDestination(destination);
      setShowDestinationSelector(false);

      if (currentLocation) {
        // Find and display the route from current location
        displayRoute(currentLocation.id, destination.id);
      } else if (defaultStartLocation) {
        // Use default start location (main gate) when current location is not available
        displayRoute(defaultStartLocation.id, destination.id);

        logDebug(`Using ${defaultStartLocation.name} as starting point`);
      } else {
        logDebug("No current location or default entry point available");

        // Show error message to user
        setLocationError(
          "No starting point available. Please grant location permission or try again."
        );
      }
    },
    [currentLocation, defaultStartLocation, logDebug]
  );

  // Display route between two nodes
  const displayRoute = useCallback(
    (startNodeId: string, endNodeId: string) => {
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
        logDebug("No route found");
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
              const lineString =
                geometry as import("ol/geom/LineString").default;
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

      // Set route path for enhanced tracking
      if (enhancedTrackerRef.current && mobileMode) {
        // Extract route coordinates from path features
        const routePath: [number, number][] = [];
        pathFeatures.forEach((feature) => {
          const geometry = feature.getGeometry();
          if (geometry && geometry.getType() === "LineString") {
            const lineString = geometry as import("ol/geom/LineString").default;
            const coords = lineString.getCoordinates();
            coords.forEach((coord) => {
              const geoCoord = toLonLat(coord);
              routePath.push([geoCoord[0], geoCoord[1]]);
            });
          }
        });

        if (routePath.length > 0) {
          enhancedTrackerRef.current.setRoute(routePath);
          logDebug(`Route path set for enhanced tracking: ${routePath.length} waypoints`);
        }
      }

      logDebug(
        `Route displayed: ${pathFeatures.length} segments, ${(totalDistance / 1000).toFixed(2)}km`
      );
    },
    [debug, logDebug, mobileMode]
  );

  // Generate QR code for the current route
  const handleGenerateQR = useCallback(() => {
    generateRouteQRCode();
  }, [generateRouteQRCode]);

  // Clear active route
  const clearRoute = useCallback(() => {
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    setActiveRoute([]);
    setSelectedDestination(null);
    setShowRouteOverlay(false);
    setRouteInfo(undefined);
    setRouteProgress(null);
    resetRouteProcessor();

    // Clear route from enhanced tracker
    if (enhancedTrackerRef.current) {
      enhancedTrackerRef.current.clearRoute();
    }

    logDebug("Route cleared");
  }, [logDebug]);

  // Toggle edit mode - memoized
  const toggleEditMode = useCallback(() => {
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
  }, [isEditMode, debug]);

  // Handle draw interaction toggles
  const handleDrawInteractionToggle = useCallback(
    (type: "Point" | "LineString" | "Polygon") => {
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
    },
    [drawType, isEditMode, debug]
  );

  // Memoize handlers for UI components
  const handleCloseCustomizePanel = useCallback(() => {
    setShowCustomizePanel(false);
  }, []);

  const handleCloseDestinationSelector = useCallback(() => {
    setShowDestinationSelector(false);
  }, []);

  const handleShowDestinationSelector = useCallback(() => {
    logDebug(
      `Show destination selector clicked. Available destinations: ${destinations.length}`
    );
    setShowDestinationSelector(true);
  }, [destinations.length, logDebug]);

  const handleDeleteSelected = useCallback(() => {
    deleteSelectedFeature(
      selectInteractionRef.current,
      vectorSourceRef.current,
      pointsSourceRef.current,
      setShowCustomizePanel,
      setSelectedFeature,
      debugInfoRef,
      debug,
      () => setDebugInfo([...debugInfoRef.current])
    );
  }, [debug]);

  const { featuresReady, allFeatures, resetRouteProcessor } = useRouteProcessor(
    nodesUrl,
    roadsUrl,
    mapInstanceRef,
    displayRoute,
    setCurrentLocation,
    setSelectedDestination,
    setRouteInfo,
    setShowRouteOverlay,
    routeData, // This can be from props or from URL params
    logDebug
  );

  const handleExportMap = useCallback(() => {
    exportGeoJSON(
      vectorSourceRef.current,
      "map_export.geojson",
      debugInfoRef,
      debug,
      () => setDebugInfo([...debugInfoRef.current])
    );
  }, [debug]);

  useEffect(() => {
    if (effectiveSearchParams && mobileMode) {
      console.log(
        "Mobile mode - checking URL params:",
        effectiveSearchParams.toString()
      );

      const routeData = parseRouteFromUrl(
        effectiveSearchParams,
        debugInfoRef,
        debug,
        () => setDebugInfo([...debugInfoRef.current])
      );

      if (routeData) {
        console.log("Found route data:", routeData);

        // Wait for map and sources to be fully initialized
        const checkSourcesLoaded = () => {
          if (
            mapInstanceRef.current &&
            roadsSourceRef.current &&
            roadsSourceRef.current.getState() === "ready" &&
            nodesSourceRef.current &&
            nodesSourceRef.current.getState() === "ready"
          ) {
            console.log("Sources ready, processing route");
            processRouteData(routeData);
          } else {
            console.log("Sources not ready yet, waiting...");
            setTimeout(checkSourcesLoaded, 300);
          }
        };

        checkSourcesLoaded();
      }
    }
  }, [effectiveSearchParams, mobileMode]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current) return;

    logDebug("Initializing map...");

    const updateUIStates = () => {
      if (locationErrorRef.current !== locationError) {
        setLocationError(locationErrorRef.current);
      }
      if (isOutsideSchoolRef.current !== isOutsideSchool) {
        setIsOutsideSchool(isOutsideSchoolRef.current);
      }
    };

    const uiUpdateInterval = setInterval(updateUIStates, 1000);

    const { map, vectorSource, pointsSource, view } = setupLayers(
      mapRef.current,
      backdropColor,
      centerCoordinates,
      initialZoom,
      mapUrl,
      pointsUrl
    );

    mapInstanceRef.current = map;
    vectorSourceRef.current = vectorSource;
    pointsSourceRef.current = pointsSource;

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

    // Define a function to process features to avoid code duplication
    const processFeatures = (features: Feature<Geometry>[]) => {
      logDebug(`Processing ${features.length} node features...`);
      const loadedDestinations: RoadNode[] = [];

      // Set default start location (main gate)
      let mainGate: RoadNode | null = null;

      // Debug counters
      let destinationCount = 0;
      let geometryIssueCount = 0;
      let nonPointCount = 0;

      features.forEach((feature: Feature<Geometry>) => {
        const props = feature.getProperties();
        const geometry = feature.getGeometry();

        // Debug the node properties
        logDebug(
          `Node: ${props.id} - isDestination: ${props.isDestination}, Has geometry: ${!!geometry}`
        );

        if (props.isDestination && geometry) {
          destinationCount++;
          let coords: number[] = [0, 0];

          // Handle geometry correctly
          if (geometry instanceof Point) {
            coords = geometry.getCoordinates();

            // Convert to geo coordinates
            const geoCoords = toLonLat(coords);

            // Create node object
            const node: RoadNode = {
              id:
                props.id ||
                `node-${Math.random().toString(36).substring(2, 9)}`,
              name: props.name || "Unnamed Location",
              isDestination: !!props.isDestination,
              coordinates: geoCoords as [number, number],
              description: props.description,
              category: props.category || "General",
              imageUrl: props.imageUrl,
            };

            // Find and set main gate as default starting point
            if (props.category === "Gates" && props.id === "gate1") {
              mainGate = node;
            }

            // Add to destinations
            loadedDestinations.push(node);

            logDebug(`Added destination: ${node.name} (${node.category})`);
          } else {
            nonPointCount++;
            logDebug(
              `Node ${props.id || "unknown"} is not a Point geometry: ${geometry.getType()}`
            );
          }
        } else if (!geometry && props.isDestination) {
          geometryIssueCount++;
          logDebug(
            `Destination node ${props.id || "unknown"} has no geometry!`
          );
        }
      });

      logDebug(
        `Destination stats - Total: ${destinationCount}, Loaded: ${loadedDestinations.length}, Geometry issues: ${geometryIssueCount}, Non-point: ${nonPointCount}`
      );

      // Set destinations in state
      if (loadedDestinations.length > 0) {
        setDestinations(loadedDestinations);

        // Set default start location
        if (mainGate) {
          setDefaultStartLocation(mainGate);
          logDebug(`Default starting point set to: ${(mainGate as any).name}`);
        }

        // Check for pending route from URL parameters
        processPendingRoute(loadedDestinations, mainGate);
      } else {
        logDebug(
          "No destinations loaded from features. Will attempt direct GeoJSON load."
        );
        loadDestinationsDirectly();
      }
    };

    // Function to process pending route
    const processPendingRoute = (
      loadedDestinations: RoadNode[],
      mainGate: RoadNode | null
    ) => {
      const pendingRouteData = sessionStorage.getItem("pendingRoute");
      if (pendingRouteData) {
        try {
          const routeData: RouteData = JSON.parse(pendingRouteData);

          // Find nodes by ID
          const startNode =
            loadedDestinations.find((d) => d.id === routeData.startNodeId) ||
            mainGate;
          const endNode =
            loadedDestinations.find((d) => d.id === routeData.endNodeId) ||
            null;

          if (startNode && endNode) {
            // Use the default start node or the one from the URL
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
    };

    // Function to load destinations directly from GeoJSON
    const loadDestinationsDirectly = () => {
      logDebug("Attempting direct GeoJSON load of destinations...");

      fetch(nodesUrl)
        .then((response) => response.json())
        .then((data) => {
          const directLoadedDestinations: RoadNode[] = [];
          let mainGate: RoadNode | null = null;

          logDebug(
            `Direct load: ${data.features.length} features in GeoJSON file`
          );

          data.features.forEach((feature: any) => {
            if (feature.properties.isDestination) {
              // Create node object directly from GeoJSON
              const coords = feature.geometry.coordinates;
              const node: RoadNode = {
                id:
                  feature.properties.id ||
                  `node-${Math.random().toString(36).substring(2, 9)}`,
                name: feature.properties.name || "Unnamed Location",
                isDestination: true,
                coordinates: coords as [number, number],
                description: feature.properties.description,
                category: feature.properties.category || "General",
                imageUrl: feature.properties.imageUrl,
              };

              // Find and set main gate as default starting point
              if (
                feature.properties.category === "Gates" &&
                feature.properties.id === "gate1"
              ) {
                mainGate = node;
              }

              directLoadedDestinations.push(node);
              logDebug(
                `Added destination from GeoJSON: ${node.name} (${node.category})`
              );
            }
          });

          logDebug(
            `Direct load destinations: ${directLoadedDestinations.length}`
          );

          if (directLoadedDestinations.length > 0) {
            setDestinations(directLoadedDestinations);
            if (mainGate) {
              setDefaultStartLocation(mainGate);
              logDebug(
                `Default starting point set to: ${(mainGate as any).name}`
              );
            }

            // Check for pending route
            processPendingRoute(directLoadedDestinations, mainGate);
          } else {
            logDebug("No destinations found in GeoJSON file.");
          }
        })
        .catch((error) => {
          logDebug(`Error loading destinations directly: ${error.message}`);
        });
    };

    // Handle feature loaded event
    const handleFeaturesLoaded = () => {
      const features = nodesSource.getFeatures();
      logDebug(
        `Features loaded event: ${features.length} features from nodes source`
      );
      processFeatures(features);
    };

    // Register event for future loads
    nodesSource.on("featuresloadend", handleFeaturesLoaded);

    // Also check if features are already loaded
    if (nodesSource.getState() === "ready") {
      const features = nodesSource.getFeatures();
      logDebug(
        `Source already in 'ready' state with ${features.length} features`
      );
      processFeatures(features);
    } else {
      // If no features are available yet, try loading directly after a short delay
      const checkFeaturesTimer = setTimeout(() => {
        const features = nodesSource.getFeatures();
        if (features.length > 0) {
          logDebug(`Found ${features.length} features after delay`);
          processFeatures(features);
        } else {
          logDebug("No features available after delay, loading directly...");
          loadDestinationsDirectly();
        }
      }, 500);

      // Clean up timer in component cleanup
      updatePositionTimeoutRef.current = checkFeaturesTimer;
    }

    // Force a refresh/reload of the nodes source
    try {
      logDebug("Refreshing nodes source...");
      nodesSource.refresh();
    } catch (e) {
      logDebug(`Error refreshing source: ${e}`);
    }
    // Load destinations from nodes source
    nodesSource.on("featuresloadend", () => {
      logDebug(`Nodes features load end triggered. Parsing destinations...`);
      const features = nodesSource.getFeatures();
      logDebug(`Total nodes features loaded: ${features.length}`);
      console.log(
        `✅ featuresloadend triggered, total features: ${features.length}`
      );

      const loadedDestinations: RoadNode[] = [];

      // Set default start location (main gate)
      let mainGate: RoadNode | null = null;

      // Debug counters
      let destinationCount = 0;
      let geometryIssueCount = 0;
      let nonPointCount = 0;

      features.forEach((feature: Feature<Geometry>) => {
        const props = feature.getProperties();
        const geometry = feature.getGeometry();

        // Debug the node properties
        logDebug(
          `Node: ${props.id} - isDestination: ${props.isDestination}, Has geometry: ${!!geometry}`
        );

        if (props.isDestination && geometry) {
          destinationCount++;
          let coords: number[] = [0, 0];

          // Handle geometry correctly
          if (geometry instanceof Point) {
            coords = geometry.getCoordinates();

            // Convert to geo coordinates
            const geoCoords = toLonLat(coords);

            // Create node object
            const node: RoadNode = {
              id:
                props.id ||
                `node-${Math.random().toString(36).substring(2, 9)}`,
              name: props.name || "Unnamed Location",
              isDestination: !!props.isDestination,
              coordinates: geoCoords as [number, number],
              description: props.description,
              category: props.category || "General",
              imageUrl: props.imageUrl,
            };

            // Find and set main gate as default starting point
            if (props.category === "Gates" && props.id === "gate1") {
              mainGate = node;
            }

            // Add to destinations
            loadedDestinations.push(node);

            logDebug(`Added destination: ${node.name} (${node.category})`);
          } else {
            nonPointCount++;
            logDebug(
              `Node ${props.id || "unknown"} is not a Point geometry: ${geometry.getType()}`
            );
          }
        } else if (!geometry && props.isDestination) {
          geometryIssueCount++;
          logDebug(
            `Destination node ${props.id || "unknown"} has no geometry!`
          );
        }
      });

      logDebug(
        `Destination stats - Total: ${destinationCount}, Loaded: ${loadedDestinations.length}, Geometry issues: ${geometryIssueCount}, Non-point: ${nonPointCount}`
      );

      // If no destinations were loaded, try to load them directly from the GeoJSON file
      if (loadedDestinations.length === 0) {
        logDebug(
          "No destinations loaded from features. Attempting direct GeoJSON load..."
        );

        fetch(nodesUrl)
          .then((response) => response.json())
          .then((data) => {
            const directLoadedDestinations: RoadNode[] = [];

            data.features.forEach((feature: any) => {
              if (feature.properties.isDestination) {
                // Create node object directly from GeoJSON
                const coords = feature.geometry.coordinates;
                const node: RoadNode = {
                  id:
                    feature.properties.id ||
                    `node-${Math.random().toString(36).substring(2, 9)}`,
                  name: feature.properties.name || "Unnamed Location",
                  isDestination: true,
                  coordinates: coords as [number, number],
                  description: feature.properties.description,
                  category: feature.properties.category || "General",
                  imageUrl: feature.properties.imageUrl,
                };

                // Find and set main gate as default starting point
                if (
                  feature.properties.category === "Gates" &&
                  feature.properties.id === "gate1"
                ) {
                  mainGate = node;
                }

                directLoadedDestinations.push(node);
              }
            });

            logDebug(
              `Direct load destinations: ${directLoadedDestinations.length}`
            );

            if (directLoadedDestinations.length > 0) {
              setDestinations(directLoadedDestinations);
              if (mainGate) {
                setDefaultStartLocation(mainGate);
              }
            }
          })
          .catch((error) => {
            logDebug(`Error loading destinations directly: ${error.message}`);
          });
      } else {
        setDestinations(loadedDestinations);

        // Set default start location
        if (mainGate) {
          setDefaultStartLocation(mainGate);
          logDebug(`Default starting point set to: ${(mainGate as any).name}`);
        }
      }

      logDebug(`Loaded ${loadedDestinations.length} destinations`);

      // Check for pending route from URL parameters
      const pendingRouteData = sessionStorage.getItem("pendingRoute");
      if (pendingRouteData) {
        try {
          const routeData: RouteData = JSON.parse(pendingRouteData);

          // Find nodes by ID
          const startNode =
            loadedDestinations.find((d) => d.id === routeData.startNodeId) ||
            mainGate;
          const endNode =
            loadedDestinations.find((d) => d.id === routeData.endNodeId) ||
            null;

          if (startNode && endNode) {
            // Use the default start node or the one from the URL
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
          features.forEach((feature: Feature, index: number) => {
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
      exportGeoJSON: (filename = "map_export.geojson") => {
        exportGeoJSON(vectorSource, filename, debugInfoRef, debug, () =>
          setDebugInfo([...debugInfoRef.current])
        );
      },
    };

    return () => {
      clearInterval(uiUpdateInterval);
      if (locationWatchIdRef.current) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
        locationWatchIdRef.current = null;
      }
      if (locationNodeIntervalRef.current) {
        clearInterval(locationNodeIntervalRef.current);
        locationNodeIntervalRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
      delete (window as any).mapEditor;
      map.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    const cleanup = initializeMap();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Memoize UI components to reduce re-renders
  const OutsideSchoolAlert = useMemo(() => {
    if (isOutsideSchool && locationTrackingEnabled) {
      return (
        <div className="absolute top-20 left-0 right-0 mx-auto w-64 bg-yellow-500 text-white p-3 rounded-lg z-20 text-center shadow-lg">
          <strong>Notice:</strong> You appear to be outside the campus
          boundaries. Navigation will use the main gate as your starting point.
        </div>
      );
    }
    return null;
  }, [isOutsideSchool, locationTrackingEnabled]);

  // Memoize location error alert
  const LocationErrorAlert = useMemo(() => {
    if (locationError) {
      return (
        <div className="absolute top-20 left-0 right-0 mx-auto w-80 bg-red-500 text-white p-3 rounded-lg z-20 text-center shadow-lg">
          {locationError}
        </div>
      );
    }
    return null;
  }, [locationError]);

  // Memoize location permission request button
  const LocationPermissionButton = useMemo(() => {
    if (!locationPermissionRequested) {
      return (
        <div className="absolute top-20 left-4 z-40 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg">
          <h3 className="font-bold mb-2">Location Access</h3>
          <p className="text-sm mb-3">
            Grant location access to enable real-time navigation on campus.
          </p>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 w-full"
            onClick={requestLocationPermission}
          >
            Enable Location
          </button>
        </div>
      );
    }
    return null;
  }, [locationPermissionRequested, requestLocationPermission]);

  // Memoize edit controls
  const EditControlsComponent = useMemo(
    () => (
      <EditControls
        isEditMode={isEditMode}
        toggleEditMode={toggleEditMode}
        drawType={drawType}
        handleDrawInteractionToggle={handleDrawInteractionToggle}
        handleDeleteSelected={handleDeleteSelected}
        handleExportMap={handleExportMap}
      />
    ),
    [
      isEditMode,
      toggleEditMode,
      drawType,
      handleDrawInteractionToggle,
      handleDeleteSelected,
      handleExportMap,
    ]
  );

  // Memoize customization panel
  const CustomizationPanelComponent = useMemo(() => {
    if (showCustomizePanel) {
      return (
        <CustomizationPanel
          featureProperties={featureProperties}
          updateFeatureProperty={updateFeatureProperty}
          markerSizeOptions={markerSizeOptions}
          onClose={handleCloseCustomizePanel}
        />
      );
    }
    return null;
  }, [
    showCustomizePanel,
    featureProperties,
    updateFeatureProperty,
    markerSizeOptions,
    handleCloseCustomizePanel,
  ]);

  // Memoize navigation status bar
  const NavigationStatusBar = useMemo(
    () => (
      <div className="absolute top-4 right-4 z-30 bg-white bg-opacity-90 p-2 rounded-lg shadow-lg">
        <div className="text-sm font-medium">
          {currentLocation ? (
            <span className="text-green-600">
              ● Current location: {currentLocation.name}
            </span>
          ) : locationPermissionRequested && defaultStartLocation ? (
            <span className="text-yellow-600">
              ● Using default: {defaultStartLocation.name}
            </span>
          ) : (
            <span className="text-gray-600">● Location: Not available</span>
          )}
        </div>
      </div>
    ),
    [currentLocation, locationPermissionRequested, defaultStartLocation]
  );

  // Memoize destination selector button
  const DestinationSelectorButton = useMemo(
    () => (
      <div className="absolute bottom-4 right-4 z-30">
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
          onClick={handleShowDestinationSelector}
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
    ),
    [handleShowDestinationSelector]
  );

  // Memoize destination selector
  const DestinationSelectorComponent = useMemo(() => {
    if (showDestinationSelector) {
      return (
        <div className="absolute top-4 left-4 z-40">
          <DestinationSelector
            destinations={destinations}
            onSelect={handleDestinationSelect}
            onClose={handleCloseDestinationSelector}
            categories={[
              "Gates",
              "Main Buildings",
              "Maritime",
              "Business",
              "Facilities",
              "Sports Facilities",
            ]}
          />
        </div>
      );
    }
    return null;
  }, [
    showDestinationSelector,
    destinations,
    handleDestinationSelect,
    handleCloseDestinationSelector,
  ]);

  // Memoize destinations debug info
  const DestinationsDebugInfo = useMemo(() => {
    if (debug) {
      return (
        <div className="absolute top-20 right-4 w-64 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg z-30">
          <h3 className="font-bold mb-1">Destinations</h3>
          <p className="text-xs mb-1">Total: {destinations.length}</p>
          <div className="max-h-40 overflow-y-auto text-xs">
            {destinations.map((dest, index) => (
              <div key={index} className="mb-1">
                {dest.name} ({dest.category})
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }, [debug, destinations]);

  // Memoize route overlay
  const RouteOverlayComponent = useMemo(() => {
    if (showRouteOverlay && selectedDestination) {
      return (
        <RouteOverlay
          startNode={currentLocation || defaultStartLocation}
          endNode={selectedDestination}
          routeInfo={routeInfo}
          onCancel={clearRoute}
          onGenerateQR={handleGenerateQR}
        />
      );
    }
    return null;
  }, [
    showRouteOverlay,
    selectedDestination,
    currentLocation,
    defaultStartLocation,
    routeInfo,
    clearRoute,
    handleGenerateQR,
  ]);

  // Memoize debug panel
  const DebugPanelComponent = useMemo(() => {
    if (debug) {
      return <DebugPanel debugInfo={debugInfo} />;
    }
    return null;
  }, [debug, debugInfo]);

  const renderMobileUI = () => {
    if (!mobileMode) return null;

    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-white p-3 shadow-md z-40">
          <div className="flex items-center justify-between">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
              onClick={() => router.back()}
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
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </button>

            <h1 className="text-lg font-bold text-gray-900">
              {selectedDestination
                ? `Navigate to ${selectedDestination.name}`
                : "Campus Map"}
            </h1>

            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white"
              onClick={() => {
                if (mapInstanceRef.current && currentLocation) {
                  const coords = fromLonLat(currentLocation.coordinates);
                  mapInstanceRef.current.getView().setCenter(coords);
                  mapInstanceRef.current.getView().setZoom(18);
                } else {
                  initLocationTracking();
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="1"></circle>
                <path d="M12 2v4"></path>
                <path d="M12 18v4"></path>
                <path d="M4.93 4.93l2.83 2.83"></path>
                <path d="M16.24 16.24l2.83 2.83"></path>
                <path d="M2 12h4"></path>
                <path d="M18 12h4"></path>
                <path d="M4.93 19.07l2.83-2.83"></path>
                <path d="M16.24 7.76l2.83-2.83"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Floating Locate Button */}
        <button
          className="fixed right-4 bottom-24 z-40 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200"
          onClick={() => {
            if (mapInstanceRef.current && currentLocation) {
              const coords = fromLonLat(currentLocation.coordinates);
              mapInstanceRef.current.getView().setCenter(coords);
              mapInstanceRef.current.getView().setZoom(18);
            } else {
              initLocationTracking();
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4b5563"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="1"></circle>
            <path d="M12 2v4"></path>
            <path d="M12 18v4"></path>
            <path d="M4.93 4.93l2.83 2.83"></path>
            <path d="M16.24 16.24l2.83 2.83"></path>
            <path d="M2 12h4"></path>
            <path d="M18 12h4"></path>
            <path d="M4.93 19.07l2.83-2.83"></path>
            <path d="M16.24 7.76l2.83-2.83"></path>
          </svg>
        </button>

        {/* Enhanced Mobile Route Panel */}
        {showRouteOverlay && selectedDestination && (
          <EnhancedMobileRoutePanel
            destination={selectedDestination}
            currentLocation={currentLocation}
            routeInfo={routeInfo}
            routeProgress={routeProgress}
            onClose={clearRoute}
          />
        )}
      </>
    );
  };

  return (
    <div className="relative w-full h-screen">
      <div
        ref={mapRef}
        className="w-full h-full absolute top-0 left-0"
        style={{
          boxShadow: mobileMode ? "none" : "0 4px 20px rgba(0,0,0,0.15)",
          borderRadius: mobileMode ? "0" : "12px",
        }}
      />

      {/* Conditionally show/hide UI elements based on mobileMode */}
      {OutsideSchoolAlert && !mobileMode && OutsideSchoolAlert}
      {LocationErrorAlert}
      {!mobileMode && LocationPermissionButton}
      {!mobileMode && EditControlsComponent}
      {!mobileMode && CustomizationPanelComponent}
      {!mobileMode && NavigationStatusBar}
      {!mobileMode && DestinationSelectorButton}
      {showDestinationSelector && !mobileMode && DestinationSelectorComponent}
      {!mobileMode && DestinationsDebugInfo}
      {debug && DebugPanelComponent}

      {/* Render mobile UI */}
      {mobileMode && renderMobileUI()}

      {RouteOverlayComponent}
      {showQRModal && selectedDestination && (
        <KioskQRModal
          qrCodeUrl={qrCodeUrl}
          destination={selectedDestination}
          routeInfo={routeInfo}
          onClose={closeQRModal}
          autoCloseTime={60} // Seconds before auto-close
        />
      )}

      {/* Add loading and error states */}
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-800 font-medium">Generating QR Code...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-20 left-0 right-0 mx-auto w-80 bg-red-500 text-white p-3 rounded-lg z-30 text-center shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

const MemoizedCampusMap = React.memo(CampusMap);

export default dynamic(() => Promise.resolve(MemoizedCampusMap), {
  ssr: false,
});
