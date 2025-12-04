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
  EditControls,
} from "./components";
import {
  setupRoadSystem,
  findClosestNode,
  findShortestPath,
  RoadNode,
  resolveRoutingNode,
  requiresAdditionalDirections,
} from "./roadSystem";
import { generateRouteQR, parseRouteFromUrl, RouteData } from "./qrCodeUtils";
import DestinationSelector from "./DestinationSelector";
import EnhancedDestinationSelector from "./EnhancedDestinationSelector";
import CompactDestinationSelector from "./CompactDestinationSelector";
import AdditionalDirections from "./AdditionalDirections";
import ModernMobileNavUI from "./ModernMobileNavUI";
import { useKioskRouteManager } from "./qrCodeUtils";
import KioskQRModal from "./KioskQRModal";
import CompactRouteFooter from "./CompactRouteFooter";
import RouteOverlay from "./RouteOverlay";
import EnhancedRouteOverlay from "./EnhancedRouteOverlay";
import EnhancedKioskUI from "./EnhancedKioskUI";
import router from "next/router";
import GeoJSON from "ol/format/GeoJSON";

const CampusMap: React.FC<MapProps> = ({
  mapUrl = "/UCLM_Buildings.geojson",
  pointsUrl = "/newPoints.geojson",       // Updated to use new GeoJSON
  roadsUrl = "/NewTestRoad.geojson",      // Updated to use new GeoJSON
  nodesUrl = "/NewTestRoad.geojson",      // Updated to use new GeoJSON (nodes from roads)
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
  const [showKioskWelcome, setShowKioskWelcome] = useState<boolean>(!mobileMode);
  const [useEnhancedKioskUI, setUseEnhancedKioskUI] = useState<boolean>(true);
  const [showAdditionalDirections, setShowAdditionalDirections] =
    useState<boolean>(false);
  const [cameraFollowMode, setCameraFollowMode] = useState<boolean>(false);
  const [lastUserPosition, setLastUserPosition] = useState<[number, number] | null>(null);

  // State for custom GeoJSON URLs (from Electron config)
  // Add cache-busting timestamp to force reload of GeoJSON files
  const cacheBuster = Date.now();
  const [actualMapUrl, setActualMapUrl] = useState<string>(`${mapUrl}?v=${cacheBuster}`);
  const [actualPointsUrl, setActualPointsUrl] = useState<string>(`${pointsUrl}?v=${cacheBuster}`);
  const [actualRoadsUrl, setActualRoadsUrl] = useState<string>(`${roadsUrl}?v=${cacheBuster}`);
  const [actualNodesUrl, setActualNodesUrl] = useState<string>(`${nodesUrl}?v=${cacheBuster}`);
  const [customGeoJSONLoaded, setCustomGeoJSONLoaded] = useState<boolean>(false);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false); // Track when map is ready for GPS

  const [routeProgress, setRouteProgress] = useState<RouteProgress | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [useEnhancedTracking, setUseEnhancedTracking] = useState<boolean>(true);

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
  const roadsLayerRef = useRef<VectorLayer<VectorSource<Feature<Geometry>>> | null>(null);
  const routeLayerRef = useRef<VectorLayer<
    VectorSource<Feature<Geometry>>
  > | null>(null);
  const activeRouteRoadsRef = useRef<Set<string>>(new Set());
  const lastRerouteTimeRef = useRef<number>(0);
  const isReroutingRef = useRef<boolean>(false);

  // Refs to avoid stale closures in GPS callback
  // These hold the latest values for use in the location tracking callback
  const currentLocationRef = useRef<RoadNode | null>(null);
  const selectedDestinationRef = useRef<RoadNode | null>(null);
  const cameraFollowModeRef = useRef<boolean>(false);

  // Keep refs in sync with state to avoid stale closures in callbacks
  useEffect(() => {
    currentLocationRef.current = currentLocation;
  }, [currentLocation]);

  useEffect(() => {
    selectedDestinationRef.current = selectedDestination;
  }, [selectedDestination]);

  useEffect(() => {
    cameraFollowModeRef.current = cameraFollowMode;
  }, [cameraFollowMode]);

  // Kiosk QR code management hook - must come after activeRouteRoadsRef declaration
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
    userPosition,
    routeInfo,
    defaultStartLocation,
    activeRouteRoads: activeRouteRoadsRef.current, // Include route roads for QR encoding
  });

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
  const requestLocationPermission = useCallback(() => {
    setLocationPermissionRequested(true);

    // This will now be in response to a user gesture
    navigator.geolocation.getCurrentPosition(
      () => {
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
      }
    );
  }, []);

  const initLocationTracking = useCallback(() => {
    if (!mapInstanceRef.current) return undefined;

    setLocationTrackingEnabled(true);

    // Use enhanced tracking for mobile mode
    if (mobileMode && useEnhancedTracking) {
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
        locationErrorRef,
        isOutsideSchoolRef,
        schoolBoundaryRef,
        nodesSourceRef.current || undefined // Pass nodes source for snapping to road nodes
      );

      enhancedTrackerRef.current = tracker;

      // Configure GPS noise filtering thresholds
      tracker.setMinMovementThreshold(5);  // Ignore movements less than 5 meters
      tracker.setMaxAccuracyThreshold(50); // Ignore readings with accuracy > 50m

      // Start tracking with callbacks
      // CRITICAL: Use refs (not state) to get latest values and avoid stale closures
      tracker.startTracking(
        (position: UserPosition) => {
          setUserPosition(position);

          // Auto-follow camera in mobile mode when navigating
          // Use refs to get latest values
          if (mobileMode && cameraFollowModeRef.current && selectedDestinationRef.current) {
            followUserPosition(position.coordinates);
          }

          // Store last position for comparison
          setLastUserPosition(position.coordinates);

          // Update current location node based on GPS position
          if (nodesSourceRef.current) {
            const closestNode = findClosestNode(
              position.coordinates[0],
              position.coordinates[1],
              nodesSourceRef.current
            );

            // Use ref to check current location (not stale state)
            const currentLoc = currentLocationRef.current;
            if (
              closestNode &&
              (!currentLoc || closestNode.id !== currentLoc.id)
            ) {
              console.log(`[GPS] 📍 Location changed: ${currentLoc?.id || 'none'} → ${closestNode.id}`);
              setCurrentLocation(closestNode);

              // If there's an active destination, update the route from new position
              // Use ref to get latest destination
              const destination = selectedDestinationRef.current;
              if (destination) {
                const routingNodeId = resolveRoutingNode(destination);
                console.log(`[GPS] 🔄 Recalculating route: ${closestNode.id} → ${routingNodeId}`);
                displayRoute(closestNode.id, routingNodeId);

                // Check if user has reached the routing node (nearest_node for POIs)
                if (closestNode.id === routingNodeId) {
                  // User reached the routing node - show additional directions if needed
                  // Note: In mobile mode, ModernMobileNavUI already handles showing additional directions
                  // based on distance. We only show the separate modal in desktop/kiosk mode.
                  if (requiresAdditionalDirections(destination) && !mobileMode) {
                    console.log(
                      `[Navigation] Reached routing node "${routingNodeId}". Showing additional directions.`
                    );
                    setShowAdditionalDirections(true);
                  }

                  // Disable camera follow when destination reached
                  if (mobileMode) {
                    setCameraFollowMode(false);
                  }
                }
              }
            }
          }
        },
        (progress: RouteProgress) => {
          setRouteProgress(progress);

          // Auto-reroute when off-route (with throttling)
          // Use refs to get latest values
          const destination = selectedDestinationRef.current;
          const currentLoc = currentLocationRef.current;
          if (progress.isOffRoute && destination && currentLoc) {
            const now = Date.now();
            const timeSinceLastReroute = now - lastRerouteTimeRef.current;
            const MIN_REROUTE_INTERVAL = 10000; // 10 seconds minimum between reroutes

            // Only reroute if:
            // 1. User is more than 50m off route
            // 2. At least 10 seconds have passed since last reroute
            // 3. Not currently rerouting
            if (
              progress.distanceFromRoute > 50 &&
              timeSinceLastReroute > MIN_REROUTE_INTERVAL &&
              !isReroutingRef.current
            ) {
              console.log(`[Auto-Reroute] User is ${progress.distanceFromRoute.toFixed(0)}m off route. Recalculating...`);
              isReroutingRef.current = true;
              lastRerouteTimeRef.current = now;

              // Recalculate route from current location to destination
              setTimeout(() => {
                const dest = selectedDestinationRef.current;
                const loc = currentLocationRef.current;
                if (loc && dest) {
                  const routingNodeId = resolveRoutingNode(dest);
                  displayRoute(loc.id, routingNodeId);
                }
                isReroutingRef.current = false;
              }, 500); // Small delay to avoid blocking UI
            }
          }
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
      const { watchId, userPositionFeature } = setupLocationTracking(
        mapInstanceRef.current,
        locationErrorRef,
        isOutsideSchoolRef,
        schoolBoundaryRef,
        isUpdatingPositionRef
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation, selectedDestination, mobileMode, useEnhancedTracking]);

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

  // Helper function to process the route data from QR code
  const processRouteData = (routeData: RouteData) => {
    // Check if sources are available
    if (!nodesSourceRef.current) {
      console.error("Nodes source not initialized");
      return;
    }

    // CRITICAL: If route roads are provided from QR, apply them directly for immediate highlighting
    // This allows the mobile to show highlighted roads without waiting for path calculation
    if (routeData.routeRoads && routeData.routeRoads.length > 0) {
      console.log(`[MOBILE] 🎯 Found ${routeData.routeRoads.length} pre-calculated route roads from QR code:`, routeData.routeRoads);
      activeRouteRoadsRef.current = new Set(routeData.routeRoads);

      // Force immediate road highlighting
      if (roadsSourceRef.current && roadsLayerRef.current) {
        const allRoads = roadsSourceRef.current.getFeatures();
        console.log(`[MOBILE] Applying immediate highlighting to ${allRoads.length} road features`);

        let highlightedCount = 0;
        allRoads.forEach(feature => {
          const roadName = feature.getProperties().name;
          if (activeRouteRoadsRef.current.has(roadName)) {
            highlightedCount++;
            console.log(`[MOBILE] 🟢 Pre-highlighting road: "${roadName}"`);
          }
          feature.setStyle(undefined); // Clear style cache to force re-evaluation
        });

        console.log(`[MOBILE] ✅ Pre-highlighted ${highlightedCount} roads from QR data`);

        // Force layer refresh
        roadsLayerRef.current.setVisible(false);
        roadsLayerRef.current.setVisible(true);
        roadsLayerRef.current.changed();
        roadsSourceRef.current.changed();

        if (mapInstanceRef.current) {
          mapInstanceRef.current.render();
        }
      }
    }

    // Find start and end nodes
    let startNodeId = routeData.startNodeId;
    const endNodeId = routeData.endNodeId;

    console.log(`[MOBILE] Processing route from ${startNodeId} to ${endNodeId}`);

    // CRITICAL FIX: On mobile, get the PHONE's current GPS position, not the kiosk's GPS from QR
    // The route should start from where the USER is NOW, not where they scanned the QR
    const getPhoneGPSAndStartRoute = () => {
      if ('geolocation' in navigator) {
        console.log(`[MOBILE] 📍 Getting phone's current GPS position...`);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const phoneLon = position.coords.longitude;
            const phoneLat = position.coords.latitude;
            console.log(`[MOBILE] 📍 Phone GPS: ${phoneLat.toFixed(6)}, ${phoneLon.toFixed(6)} (accuracy: ${position.coords.accuracy?.toFixed(0)}m)`);

            if (nodesSourceRef.current) {
              const phoneNode = findClosestNode(phoneLon, phoneLat, nodesSourceRef.current);
              if (phoneNode) {
                startNodeId = phoneNode.id;
                console.log(`[MOBILE] ✅ Route starting from phone's location: ${phoneNode.name} (${phoneNode.id})`);
                continueRouteSetup(startNodeId);
              } else {
                console.warn(`[MOBILE] ⚠️ No node found near phone GPS, falling back to QR start node`);
                useFallbackStart();
              }
            }
          },
          (error) => {
            console.warn(`[MOBILE] ⚠️ Phone GPS error: ${error.message}, falling back to QR start`);
            useFallbackStart();
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        console.warn(`[MOBILE] ⚠️ Geolocation not available, using QR start`);
        useFallbackStart();
      }
    };

    // Fallback: Use kiosk GPS from QR code if phone GPS fails
    const useFallbackStart = () => {
      if (routeData.startGPS && nodesSourceRef.current) {
        console.log(`[MOBILE] Using fallback GPS from QR: ${routeData.startGPS.longitude}, ${routeData.startGPS.latitude}`);
        const gpsNode = findClosestNode(
          routeData.startGPS.longitude,
          routeData.startGPS.latitude,
          nodesSourceRef.current
        );
        if (gpsNode) {
          startNodeId = gpsNode.id;
          console.log(`[MOBILE] Fallback start node: ${gpsNode.name} (${gpsNode.id})`);
        }
      }
      continueRouteSetup(startNodeId);
    };

    // Continue setting up the route after determining start node
    const continueRouteSetup = (finalStartNodeId: string) => {
      const features = nodesSourceRef.current!.getFeatures();

      const startFeature = features.find((f) => f.get("id") === finalStartNodeId);
      const endFeature = features.find((f) => f.get("id") === endNodeId);

      if (!startFeature || !endFeature) {
        console.error("Could not find start or end node features");
        return;
      }

      // Create node objects
      const startNode: RoadNode = {
        id: startFeature.get("id"),
        name: "Current Location",
        isDestination: true,
        coordinates: getFeatureCoordinates(startFeature),
        category: startFeature.get("category"),
        description: startFeature.get("description"),
        imageUrl: startFeature.get("imageUrl"),
        nearest_node: startFeature.get("nearest_node"),
        additionalDirections: startFeature.get("additionalDirections"),
      };

      const endNode: RoadNode = {
        id: endFeature.get("id"),
        name: endFeature.get("name") || "Destination",
        isDestination: true,
        coordinates: getFeatureCoordinates(endFeature),
        category: endFeature.get("category"),
        description: endFeature.get("description"),
        imageUrl: endFeature.get("imageUrl"),
        nearest_node: endFeature.get("nearest_node"),
        additionalDirections: endFeature.get("additionalDirections"),
      };

      // Set nodes in state
      setCurrentLocation(startNode);
      setSelectedDestination(endNode);

      // Find and display route - this triggers road highlighting
      console.log(`[MOBILE] Displaying route: ${startNode.id} → ${endNode.id}`);
      displayRoute(startNode.id, endNode.id);

      // Set route UI to visible
      setShowRouteOverlay(true);

      // Set route info if available
      if (routeData.routeInfo) {
        setRouteInfo(routeData.routeInfo);
      }

      // Enable camera follow mode on mobile
      if (mobileMode) {
        setCameraFollowMode(true);
        console.log('[MOBILE] Auto-enabled camera follow mode');

        // CRITICAL: Start GPS tracking on mobile after route is processed
        // This ensures the user's position is tracked and the route updates as they move
        if (!locationTrackingEnabled && mapInstanceRef.current) {
          console.log('[MOBILE] 📍 Starting GPS tracking for navigation...');
          // Request permission if not already done, otherwise just start tracking
          if (!locationPermissionRequested) {
            requestLocationPermission();
          } else {
            // Permission already granted, just start tracking
            const cleanup = initLocationTracking();
            if (cleanup) {
              console.log('[MOBILE] ✅ GPS tracking started for navigation');
            }
          }
        } else if (locationTrackingEnabled) {
          console.log('[MOBILE] GPS tracking already active');
        }
      }
    };

    // Start the GPS-based route initialization
    getPhoneGPSAndStartRoute();
  };

  /**
   * Smoothly animate camera to follow user's GPS position
   * Used in mobile mode for real-time navigation
   */
  const followUserPosition = useCallback(
    (coordinates: [number, number], zoom?: number) => {
      if (!mapInstanceRef.current) return;

      const view = mapInstanceRef.current.getView();
      const targetCoords = fromLonLat(coordinates);

      // Smooth animation to user's position
      view.animate({
        center: targetCoords,
        zoom: zoom || view.getZoom() || 19,
        duration: 500, // 500ms smooth animation
        easing: (t: number) => t * (2 - t), // Ease-out quad
      });
    },
    []
  );

  /**
   * Enable or disable camera follow mode
   * When enabled, camera automatically centers on user's GPS position
   */
  const toggleCameraFollow = useCallback(
    (enabled: boolean) => {
      setCameraFollowMode(enabled);
      console.log(`[Camera] Follow mode ${enabled ? 'enabled' : 'disabled'}`);

      // If enabling and we have a user position, immediately center on it
      if (enabled && userPosition) {
        followUserPosition(userPosition.coordinates, 19);
      }
    },
    [userPosition, followUserPosition]
  );

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
    },
    [selectedFeature]
  );

  // Handle destination selection
  const handleDestinationSelect = useCallback(
    (destination: RoadNode) => {
      setSelectedDestination(destination);
      setShowDestinationSelector(false);
      setShowAdditionalDirections(false); // Reset additional directions modal

      let startNodeToUse: RoadNode | null = null;

      // ===== MOBILE MODE: GPS ONLY - NO GATE1, NO FALLBACK =====
      if (mobileMode) {
        // MOBILE: ONLY use GPS position, never gate1
        if (userPosition && nodesSourceRef.current) {
          const closestNode = findClosestNode(
            userPosition.coordinates[0],
            userPosition.coordinates[1],
            nodesSourceRef.current
          );
          if (closestNode) {
            startNodeToUse = closestNode;
            setCurrentLocation(closestNode);
            console.log(`[MOBILE] Using GPS position: ${closestNode.name}`);
          }
        }

        // If no GPS on mobile, show error and request permission
        if (!startNodeToUse) {
          setLocationError(
            "GPS location required for navigation. Please enable location services and grant permission."
          );
          if (!locationPermissionRequested) {
            requestLocationPermission();
          }
          return; // EXIT - don't use gate1 or any fallback
        }
      }
      // ===== KIOSK MODE: GPS ONLY - Use kiosk's current GPS location =====
      else {
        // KIOSK: Primary source - Live GPS position (most accurate)
        if (userPosition && nodesSourceRef.current) {
          const closestNode = findClosestNode(
            userPosition.coordinates[0],
            userPosition.coordinates[1],
            nodesSourceRef.current
          );
          if (closestNode) {
            // Create a special "Current Location" node that represents the GPS position
            // This is different from the actual node - it shows where the kiosk IS located
            startNodeToUse = {
              ...closestNode,
              name: "Current Location", // Override name to show GPS-based location
            };
            setCurrentLocation(startNodeToUse);
            console.log(`[KIOSK] Using GPS position (nearest node: ${closestNode.id}): Current Location`);
          }
        }

        // KIOSK: Secondary source - Cached GPS location
        if (!startNodeToUse && currentLocation) {
          startNodeToUse = currentLocation;
          console.log(`[KIOSK] Using cached GPS location: ${currentLocation.name}`);
        }

        // KIOSK: Fallback to gate1 ONLY if GPS is completely unavailable
        // This should rarely happen on a properly configured kiosk
        if (!startNodeToUse && defaultStartLocation) {
          startNodeToUse = defaultStartLocation;
          console.log(`[KIOSK] ⚠️ GPS unavailable - falling back to gate1: ${defaultStartLocation.name}`);
          // Request GPS permission if not already requested
          if (!locationPermissionRequested) {
            console.log('[KIOSK] Requesting GPS permission for future routes...');
            requestLocationPermission();
          }
        }

        // KIOSK: Error if nothing available
        if (!startNodeToUse) {
          setLocationError(
            "No starting point available. Please enable GPS location services."
          );
          return;
        }
      }

      // Calculate route from the determined start point
      if (startNodeToUse) {
        // Resolve the actual routing node (handles POIs with nearest_node)
        const routingNodeId = resolveRoutingNode(destination);
        displayRoute(startNodeToUse.id, routingNodeId);

        // Log if routing to nearest node instead of actual destination
        if (routingNodeId !== destination.id) {
          console.log(
            `[Route] Routing to nearest node "${routingNodeId}" for POI "${destination.name}"`
          );
        }

        // Enable camera follow mode on mobile when route starts
        if (mobileMode && userPosition) {
          toggleCameraFollow(true);
          console.log('[Mobile] Auto-enabled camera follow mode for navigation');
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLocation, userPosition, locationPermissionRequested, requestLocationPermission, mobileMode, defaultStartLocation, toggleCameraFollow]
  );

  // Display route between two nodes
  const displayRoute = useCallback(
    (startNodeId: string, endNodeId: string) => {
      console.log(`[displayRoute] Called with start: ${startNodeId}, end: ${endNodeId}`);

      if (
        !roadsSourceRef.current ||
        !nodesSourceRef.current ||
        !mapInstanceRef.current
      ) {
        console.log("[displayRoute] Sources or map not ready");
        return;
      }

      // Clear existing route
      if (routeLayerRef.current) {
        console.log("[displayRoute] Removing existing route layer");
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      // Find the shortest path
      const pathFeatures = findShortestPath(
        startNodeId,
        endNodeId,
        roadsSourceRef.current,
        nodesSourceRef.current
      );

      console.log(`[displayRoute] Found ${pathFeatures.length} path features`);

      if (pathFeatures.length === 0) {
        console.log("[displayRoute] No path found!");
        // Clear active route roads
        activeRouteRoadsRef.current.clear();
        if (roadsLayerRef.current && roadsSourceRef.current) {
          // Clear cached styles to remove any existing highlights
          const allRoads = roadsSourceRef.current.getFeatures();
          allRoads.forEach(feature => {
            feature.setStyle(undefined);
          });
          roadsLayerRef.current.changed();
          roadsSourceRef.current.changed();
        }
        return;
      }

      // Extract road names from path features and update activeRouteRoadsRef
      const roadNames = new Set<string>();
      pathFeatures.forEach((feature, index) => {
        const props = feature.getProperties();
        const roadName = props.name;
        console.log(`[Road Highlighting] Path feature ${index}:`, {
          name: props.name,
          from: props.from,
          to: props.to,
          type: props.type,
          allProps: Object.keys(props)
        });
        if (roadName) {
          roadNames.add(roadName);
        }
      });
      activeRouteRoadsRef.current = roadNames;
      console.log(`[Road Highlighting] Highlighted ${roadNames.size} roads:`, Array.from(roadNames));

      // CRITICAL: Force roads layer to re-style to show highlighted roads
      // This happens BEFORE the route overlay is created to ensure proper rendering order
      // OpenLayers caches feature styles for performance, so we must manually clear them

      // Function to clear road style cache and force re-render
      // ENHANCED: More retries and longer delays for mobile devices
      const MAX_ROAD_RETRIES = mobileMode ? 15 : 5; // More retries on mobile
      const BASE_RETRY_DELAY = mobileMode ? 400 : 300; // Longer base delay on mobile

      const clearRoadStyleCache = (retryCount = 0): Promise<void> => {
        return new Promise((resolve) => {
          if (!roadsSourceRef.current || !roadsLayerRef.current) {
            console.warn('[Road Highlighting] ⚠️ Roads source or layer not available');
            resolve();
            return;
          }

          const allRoads = roadsSourceRef.current.getFeatures();
          console.log(`[Road Highlighting] Attempt ${retryCount + 1}/${MAX_ROAD_RETRIES}: Found ${allRoads.length} road features`);
          console.log(`[Road Highlighting] Active route roads: ${Array.from(activeRouteRoadsRef.current).join(', ')}`);

          if (allRoads.length === 0 && retryCount < MAX_ROAD_RETRIES) {
            // Roads not loaded yet, retry after a delay (increased retries for mobile)
            const delay = BASE_RETRY_DELAY * (retryCount + 1);
            console.warn(`[Road Highlighting] ⚠️ No road features found! Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_ROAD_RETRIES})`);
            setTimeout(() => {
              clearRoadStyleCache(retryCount + 1).then(resolve);
            }, delay);
            return;
          }

          if (allRoads.length === 0) {
            console.error(`[Road Highlighting] ❌ Failed to load road features after ${MAX_ROAD_RETRIES} retries`);
            resolve();
            return;
          }

          // Clear cached styles for ALL road features to force style function re-evaluation
          console.log(`[Road Highlighting] Clearing style cache for ${allRoads.length} road features`);
          let highlightedCount = 0;
          allRoads.forEach(feature => {
            const roadName = feature.getProperties().name;
            const willBeHighlighted = activeRouteRoadsRef.current.has(roadName);
            if (willBeHighlighted) {
              highlightedCount++;
              console.log(`[Road Highlighting] 🟢 Will highlight: "${roadName}"`);
            }
            feature.setStyle(undefined); // undefined = use layer's style function
          });

          console.log(`[Road Highlighting] 📊 ${highlightedCount} roads will be highlighted out of ${allRoads.length} total`);

          // CRITICAL: Force layer to re-render with new styles
          // This is especially important on mobile where rendering can be delayed
          roadsLayerRef.current.setVisible(false);
          roadsLayerRef.current.setVisible(true);
          roadsLayerRef.current.changed();
          roadsSourceRef.current.changed();

          // Force map to render
          if (mapInstanceRef.current) {
            mapInstanceRef.current.render();
          }

          console.log('[Road Highlighting] ✅ Road styles refreshed - creating route overlay');

          // Slightly longer delay for mobile devices
          setTimeout(() => resolve(), mobileMode ? 150 : 50);
        });
      };

      // Wait for road highlighting to complete, THEN create route overlay
      const initializeRouteDisplay = async () => {
        if (!roadsLayerRef.current || !roadsSourceRef.current) {
          console.log('[Road Highlighting] Skipping - roads not initialized');
          return;
        }

        console.log('[Road Highlighting] Starting road highlighting process...');

        // Wait 100ms for initial render, then start retry mechanism
        await new Promise(resolve => setTimeout(resolve, 100));
        await clearRoadStyleCache(0);

        console.log('[Road Highlighting] ✅✅✅ Road highlighting COMPLETE - proceeding with route overlay');
        createRouteOverlay();
      };

      // Function to create the route overlay (orange/white line)
      const createRouteOverlay = () => {
        if (!mapInstanceRef.current) return;

      // Create a route source and layer
      const routeSource = new VectorSource({
        features: pathFeatures,
      });

      // Create multi-layered route for better visibility
      const routeLayer = new VectorLayer({
        source: routeSource,
        style: [
          // Outer glow/shadow for depth
          new Style({
            stroke: new Stroke({
              color: "rgba(255, 87, 34, 0.4)", // Brighter orange glow
              width: 16, // Wider for better visibility
              lineCap: "round",
              lineJoin: "round",
            }),
            zIndex: 998,
          }),
          // Middle bright layer
          new Style({
            stroke: new Stroke({
              color: "#FF5722", // Bright orange-red
              width: 10, // Wider
              lineCap: "round",
              lineJoin: "round",
            }),
            zIndex: 999,
          }),
          // Inner white core for contrast
          new Style({
            stroke: new Stroke({
              color: "#FFFFFF",
              width: 4, // Wider white core
              lineCap: "round",
              lineJoin: "round",
            }),
            zIndex: 1000,
          }),
        ],
        // Ensure route layer renders above roads but below user marker
        // User marker is at zIndex 1000, so route should be just below at 500
        zIndex: 500,
      });

      // Add the layer to the map
      mapInstanceRef.current.addLayer(routeLayer);
      routeLayerRef.current = routeLayer;
      console.log("[displayRoute] Route layer added to map with zIndex 500");

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
          // Get the actual destination coordinates (not routing node)
          // This is critical for POIs with nearest_node - we want to measure
          // distance to the actual POI location, not the routing node
          const destinationCoords = selectedDestinationRef.current?.coordinates;

          if (destinationCoords) {
            console.log(`[Arrival Detection] Destination: ${selectedDestinationRef.current?.name}`);
            console.log(`[Arrival Detection] Destination coords: [${destinationCoords[0].toFixed(6)}, ${destinationCoords[1].toFixed(6)}]`);
            console.log(`[Arrival Detection] Route end coords: [${routePath[routePath.length - 1][0].toFixed(6)}, ${routePath[routePath.length - 1][1].toFixed(6)}]`);

            if (selectedDestinationRef.current?.nearest_node) {
              console.log(`[Arrival Detection] ⚠️ POI has nearest_node: ${selectedDestinationRef.current.nearest_node}`);
              console.log(`[Arrival Detection] ✓ Using actual POI coordinates for arrival detection`);
            }
          }

          enhancedTrackerRef.current.setRoute(routePath, destinationCoords);
        }
      }
      };

      // Start the process: highlight roads FIRST, then create overlay
      initializeRouteDisplay();
    },
    [mobileMode]
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

    // Clear highlighted roads
    activeRouteRoadsRef.current.clear();
    if (roadsLayerRef.current && roadsSourceRef.current) {
      console.log('[Road Highlighting] Clearing road highlights');

      // Clear cached styles to force re-render without highlights
      const allRoads = roadsSourceRef.current.getFeatures();
      allRoads.forEach(feature => {
        feature.setStyle(undefined); // Clear cached style
      });

      roadsLayerRef.current.changed();
      roadsSourceRef.current.changed();
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

    // Also close QR modal if open
    closeQRModal();
  }, [closeQRModal]);

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
      setDrawType
    );
  }, [isEditMode]);

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
          setShowCustomizePanel
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
          setShowCustomizePanel
        );
        setDrawType(type);
      }
    },
    [drawType, isEditMode]
  );

  // Memoize handlers for UI components
  const handleCloseCustomizePanel = useCallback(() => {
    setShowCustomizePanel(false);
  }, []);

  const handleCloseDestinationSelector = useCallback(() => {
    setShowDestinationSelector(false);
  }, []);

  const handleShowDestinationSelector = useCallback(() => {
    setShowDestinationSelector(true);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    deleteSelectedFeature(
      selectInteractionRef.current,
      vectorSourceRef.current,
      pointsSourceRef.current,
      setShowCustomizePanel,
      setSelectedFeature
    );
  }, []);

  const { featuresReady, allFeatures, resetRouteProcessor } = useRouteProcessor(
    actualNodesUrl,
    actualRoadsUrl,
    mapInstanceRef,
    displayRoute,
    setCurrentLocation,
    setSelectedDestination,
    setRouteInfo,
    setShowRouteOverlay,
    routeData // This can be from props or from URL params
  );

  const handleExportMap = useCallback(() => {
    exportGeoJSON(
      vectorSourceRef.current,
      "map_export.geojson"
    );
  }, []);

  // Load custom GeoJSON files from Electron if available
  useEffect(() => {
    const loadCustomGeoJSON = async () => {
      // Check if running in Electron
      if (typeof window !== 'undefined' && (window as any).electron) {
        try {
          console.log('Checking for custom GeoJSON files from Electron...');

          // Try to load custom files
          const buildingsData = await (window as any).electron.getCustomGeoJSON('Buildings.geojson');
          const roadSystemData = await (window as any).electron.getCustomGeoJSON('NewTestRoad.geojson');
          const pointsData = await (window as any).electron.getCustomGeoJSON('Points.geojson');

          let hasCustomFiles = false;

          // If custom files exist, create blob URLs from them
          if (buildingsData) {
            console.log('Custom Buildings.geojson found');
            const blob = new Blob([JSON.stringify(buildingsData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            setActualMapUrl(url);
            hasCustomFiles = true;
          }

          if (roadSystemData) {
            console.log('Custom NewTestRoad.geojson found');
            const blob = new Blob([JSON.stringify(roadSystemData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            setActualRoadsUrl(url);
            setActualNodesUrl(url); // Both use the same file
            hasCustomFiles = true;
          }

          if (pointsData) {
            console.log('Custom Points.geojson found');
            const blob = new Blob([JSON.stringify(pointsData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            setActualPointsUrl(url);
            hasCustomFiles = true;
          }

          if (hasCustomFiles) {
            console.log('Using custom GeoJSON files from Electron configuration');
          } else {
            console.log('No custom GeoJSON files found, using defaults');
          }
        } catch (error) {
          console.log('Error loading custom GeoJSON files, using defaults:', error);
        }
      }

      // Mark as loaded (whether custom files were found or not)
      setCustomGeoJSONLoaded(true);
    };

    loadCustomGeoJSON();
  }, []);

  // Auto-request GPS permission on mobile mode AND kiosk mode
  // KIOSK: GPS is needed to provide accurate starting location for navigation
  // CRITICAL: Use mapInitialized state (not ref) to trigger effect when map is ready
  useEffect(() => {
    // Request GPS for both mobile AND kiosk mode WHEN map is ready
    if (!locationPermissionRequested && mapInitialized) {
      const mode = mobileMode ? 'MOBILE' : 'KIOSK';
      console.log(`[${mode}] 📍 Auto-requesting GPS permission - map is ready`);
      // Small delay to ensure map is fully ready
      const timer = setTimeout(() => {
        requestLocationPermission();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mobileMode, locationPermissionRequested, requestLocationPermission, mapInitialized]);

  useEffect(() => {
    if (effectiveSearchParams && mobileMode) {
      console.log(
        "Mobile mode - checking URL params:",
        effectiveSearchParams.toString()
      );

      const routeData = parseRouteFromUrl(
        effectiveSearchParams
      );

      if (routeData) {
        console.log("Found route data:", routeData);

        // Wait for map and sources to be fully initialized
        // CRITICAL FIX: Check actual feature count, not just source state
        // Source state can be "ready" but features array can still be empty
        let checkAttempts = 0;
        const MAX_CHECK_ATTEMPTS = 30; // 30 attempts x 500ms = 15 seconds max wait

        const checkSourcesLoaded = () => {
          checkAttempts++;

          const mapReady = !!mapInstanceRef.current;
          const roadsReady = roadsSourceRef.current && roadsSourceRef.current.getState() === "ready";
          const nodesReady = nodesSourceRef.current && nodesSourceRef.current.getState() === "ready";

          // CRITICAL: Check actual feature count, not just state
          const roadsCount = roadsSourceRef.current?.getFeatures().length || 0;
          const nodesCount = nodesSourceRef.current?.getFeatures().length || 0;

          console.log(`[Mobile Route] Check ${checkAttempts}/${MAX_CHECK_ATTEMPTS}:`, {
            mapReady,
            roadsReady,
            nodesReady,
            roadsCount,
            nodesCount
          });

          // Need actual features loaded, not just source ready state
          if (mapReady && roadsReady && nodesReady && roadsCount > 0 && nodesCount > 0) {
            console.log(`[Mobile Route] ✅ All sources loaded with ${roadsCount} roads and ${nodesCount} nodes. Processing route...`);
            processRouteData(routeData);
          } else if (checkAttempts < MAX_CHECK_ATTEMPTS) {
            // Exponential backoff with cap at 1 second
            const delay = Math.min(300 + (checkAttempts * 100), 1000);
            console.log(`[Mobile Route] ⏳ Sources not fully loaded yet, retry in ${delay}ms...`);
            setTimeout(checkSourcesLoaded, delay);
          } else {
            console.error(`[Mobile Route] ❌ Failed to load sources after ${MAX_CHECK_ATTEMPTS} attempts`);
            // Try processing anyway - maybe partial data is available
            if (roadsCount > 0 || nodesCount > 0) {
              console.log(`[Mobile Route] 🔄 Attempting route processing with partial data...`);
              processRouteData(routeData);
            }
          }
        };

        // Start checking after initial delay to let resources begin loading
        setTimeout(checkSourcesLoaded, 500);
      }
    }
  }, [effectiveSearchParams, mobileMode]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current) return;

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
      actualMapUrl,
      actualPointsUrl
    );

    mapInstanceRef.current = map;
    vectorSourceRef.current = vectorSource;
    pointsSourceRef.current = pointsSource;

    // CRITICAL: Signal that map is ready for GPS tracking
    // This triggers the auto-GPS-request effect
    setMapInitialized(true);
    console.log('[Map] ✅ Map initialized, GPS can now be requested');

    const { roadsLayer, roadsSource, nodesSource } = setupRoadSystem(
      actualRoadsUrl,
      actualNodesUrl,
      activeRouteRoadsRef
    );

    // Add road layer to map
    map.addLayer(roadsLayer);

    // Store road system refs
    roadsSourceRef.current = roadsSource;
    nodesSourceRef.current = nodesSource;
    roadsLayerRef.current = roadsLayer;

    // Define a function to process features to avoid code duplication
    const processFeatures = (features: Feature<Geometry>[]) => {
      const loadedDestinations: RoadNode[] = [];

      // Set default start location (main gate)
      let mainGate: RoadNode | null = null;

      features.forEach((feature: Feature<Geometry>) => {
        const props = feature.getProperties();
        const geometry = feature.getGeometry();

        if (props.isDestination && geometry) {
          // Handle geometry correctly
          if (geometry instanceof Point) {
            const coords = geometry.getCoordinates();

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
              nearest_node: props.nearest_node,
              additionalDirections: props.additionalDirections,
            };

            // Find and set main gate as default starting point
            if (props.category === "Gates" && props.id === "gate1") {
              mainGate = node;
            }

            // Add to destinations
            loadedDestinations.push(node);
          }
        }
      });

      // Set destinations in state
      if (loadedDestinations.length > 0) {
        setDestinations(loadedDestinations);

        // Set default start location
        if (mainGate) {
          setDefaultStartLocation(mainGate);
        }

        // Check for pending route from URL parameters
        processPendingRoute(loadedDestinations, mainGate);
      } else {
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
      fetch(actualNodesUrl)
        .then((response) => response.json())
        .then((data) => {
          const directLoadedDestinations: RoadNode[] = [];
          let mainGate: RoadNode | null = null;

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
                nearest_node: feature.properties.nearest_node,
                additionalDirections: feature.properties.additionalDirections,
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

          if (directLoadedDestinations.length > 0) {
            setDestinations(directLoadedDestinations);
            if (mainGate) {
              setDefaultStartLocation(mainGate);
            }

            // Check for pending route
            processPendingRoute(directLoadedDestinations, mainGate);
          }
        })
        .catch((error) => {
          console.error("Error loading destinations directly:", error);
        });
    };

    // Function to combine and load destinations from both sources
    const loadCombinedDestinations = () => {
      console.log("[Destinations] Loading combined destinations");
      const pointFeatures = pointsSource.getFeatures();
      const nodeFeatures = nodesSource.getFeatures();

      console.log(`[Destinations] pointsSource has ${pointFeatures.length} features`);
      console.log(`[Destinations] nodesSource has ${nodeFeatures.length} features`);

      // Combine features from both sources
      const allFeatures = [...pointFeatures, ...nodeFeatures];
      const combinedDestinations: RoadNode[] = [];
      let mainGate: RoadNode | null = null;

      allFeatures.forEach((feature: Feature<Geometry>) => {
        const props = feature.getProperties();
        const geometry = feature.getGeometry();

        if (props.isDestination && geometry) {
          if (geometry instanceof Point) {
            const coords = geometry.getCoordinates();
            const geoCoords = toLonLat(coords);

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
              nearest_node: props.nearest_node,
              additionalDirections: props.additionalDirections,
            };

            // Find main gate
            if (props.category === "Gates" && props.id === "gate1") {
              mainGate = node;
            }

            combinedDestinations.push(node);
          }
        }
      });

      console.log(`[Destinations] Loaded ${combinedDestinations.length} destinations from both sources`);

      if (combinedDestinations.length > 0) {
        setDestinations(combinedDestinations);
        if (mainGate) {
          setDefaultStartLocation(mainGate);
        }
        processPendingRoute(combinedDestinations, mainGate);
      }
    };

    // Load destinations when EITHER source finishes loading
    pointsSource.on("featuresloadend", loadCombinedDestinations);
    nodesSource.on("featuresloadend", loadCombinedDestinations);

    // REMOVED: Duplicate nodesSource.on("featuresloadend") event listener
    // The pointsSource listener above already correctly combines destinations from both sources
    // This duplicate was overwriting the combined destinations with only the 1 destination from nodesSource

    vectorSource.on("featuresloadend", () => {
      try {
        const extent: Extent = vectorSource.getExtent();
        const features = vectorSource.getFeatures();

        // DISABLED: Boundary checking removed to allow GPS anywhere globally
        // Users can navigate from any location, not restricted to campus
        // Store the school boundary for map extent only (not for location restriction)
        if (extent && extent.every((v) => isFinite(v))) {
          // Add some padding to the boundary
          const expandedBoundary: Extent = [
            extent[0] - 500, // buffer in meters
            extent[1] - 500,
            extent[2] + 500,
            extent[3] + 500,
          ];
          schoolBoundaryRef.current = null; // Disabled - set to null to skip boundary checks
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
          setSelectedFeature
        ),
      exportGeoJSON: (filename = "map_export.geojson") => {
        exportGeoJSON(vectorSource, filename);
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
  }, [actualMapUrl, actualPointsUrl, actualRoadsUrl, actualNodesUrl]);

  // Only initialize map after custom GeoJSON check is complete
  useEffect(() => {
    if (!customGeoJSONLoaded) return;

    const cleanup = initializeMap();
    return () => {
      if (cleanup) cleanup();
    };
  }, [customGeoJSONLoaded, initializeMap]);

  // Memoize UI components to reduce re-renders
  // DISABLED: Outside school alert removed - GPS works globally now
  const OutsideSchoolAlert = useMemo(() => {
    // Boundary checking disabled - users can navigate from anywhere
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

  // Destination selector button - removed, now integrated into footer

  // Memoize destination selector
  const DestinationSelectorComponent = useMemo(() => {
    if (showDestinationSelector) {
      // Use compact UI for desktop/kiosk mode
      if (useEnhancedKioskUI && !mobileMode) {
        return (
          <CompactDestinationSelector
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
        );
      }
      // Use original UI for mobile or when enhanced UI is disabled
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
    useEnhancedKioskUI,
    mobileMode,
  ]);


  // Memoize route overlay
  const RouteOverlayComponent = useMemo(() => {
    if (showRouteOverlay && selectedDestination && !mobileMode) {
      // Use enhanced UI for desktop/kiosk mode
      if (useEnhancedKioskUI) {
        return (
          <EnhancedRouteOverlay
            startNode={currentLocation || defaultStartLocation}
            endNode={selectedDestination}
            routeInfo={routeInfo}
            onCancel={clearRoute}
            onGenerateQR={handleGenerateQR}
            isLoading={isGenerating}
          />
        );
      }
      // Use original UI when enhanced UI is disabled
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
    useEnhancedKioskUI,
    mobileMode,
    isGenerating,
  ]);


  const renderMobileUI = () => {
    if (!mobileMode) return null;

    // Format distance for display
    const formatDistance = (meters: number): string => {
      if (meters < 1000) {
        return `${Math.round(meters)}m`;
      }
      return `${(meters / 1000).toFixed(1)}km`;
    };

    // Format time for display
    const formatTime = (minutes: number): string => {
      if (minutes < 1) {
        return '< 1 min';
      }
      const mins = Math.ceil(minutes);
      return mins === 1 ? '1 min' : `${mins} mins`;
    };

    return (
      <>
        {/* Enhanced Mobile Header with Destination Info */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-40">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
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

            <h1 className="text-lg font-bold text-gray-900 flex-1 text-center truncate px-2">
              {selectedDestination
                ? selectedDestination.name
                : "Campus Navigation"}
            </h1>

            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all"
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

          {/* Destination Info Card - Shows when navigating */}
          {selectedDestination && (
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                {/* Destination Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                {/* Destination Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Navigating to
                    </span>
                    {selectedDestination.category && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {selectedDestination.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-gray-900 truncate">
                    {selectedDestination.name}
                  </h2>
                  {selectedDestination.description && (
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {selectedDestination.description}
                    </p>
                  )}
                </div>

                {/* Distance & Time */}
                {routeInfo && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-blue-600">
                      {formatDistance(routeProgress?.distanceToDestination ?? routeInfo.distance)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(routeProgress?.estimatedTimeRemaining
                        ? routeProgress.estimatedTimeRemaining / 60
                        : routeInfo.estimatedTime)}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {routeProgress && routeProgress.percentComplete > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, routeProgress.percentComplete)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {routeProgress.percentComplete.toFixed(0)}% complete
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistance(routeProgress.distanceTraveled)} traveled
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
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

        {/* Camera Follow Toggle Button - Only show when navigating */}
        {selectedDestination && (
          <button
            className={`fixed right-4 bottom-40 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 transition-all ${
              cameraFollowMode
                ? 'bg-blue-500 border-blue-600 text-white'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
            onClick={() => toggleCameraFollow(!cameraFollowMode)}
            title={cameraFollowMode ? 'Camera Following' : 'Enable Camera Follow'}
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
              {cameraFollowMode ? (
                // Camera on icon
                <>
                  <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                  <path d="M12 2v4m0 12v4M2 12h4m12 0h4"></path>
                  <circle cx="12" cy="12" r="9"></circle>
                </>
              ) : (
                // Camera off icon
                <>
                  <circle cx="12" cy="12" r="10" strokeDasharray="3 3"></circle>
                  <path d="M12 8v8"></path>
                  <path d="M8 12h8"></path>
                </>
              )}
            </svg>
          </button>
        )}

        {/* Modern Mobile Navigation UI */}
        {selectedDestination && (
          <ModernMobileNavUI
            destination={selectedDestination}
            currentLocation={currentLocation}
            routeInfo={routeInfo}
            routeProgress={routeProgress}
            cameraFollowMode={cameraFollowMode}
            onToggleCameraFollow={() => toggleCameraFollow(!cameraFollowMode)}
            onClearRoute={clearRoute}
          />
        )}
      </>
    );
  };

  return (
    <div className="relative w-full h-screen">
      {/* Kiosk Welcome Screen */}
      {!mobileMode && useEnhancedKioskUI && showKioskWelcome && (
        <EnhancedKioskUI
          onStartNavigation={() => setShowKioskWelcome(false)}
          showWelcome={showKioskWelcome}
        />
      )}

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
      {!mobileMode && !showKioskWelcome && LocationPermissionButton}
      {/* Edit controls only shown when debug mode is enabled - hidden in kiosk */}
      {!mobileMode && !showKioskWelcome && debug && EditControlsComponent}
      {!mobileMode && !showKioskWelcome && debug && CustomizationPanelComponent}
      {!mobileMode && !showKioskWelcome && NavigationStatusBar}
      {showDestinationSelector && !mobileMode && !showKioskWelcome && DestinationSelectorComponent}

      {/* Render mobile UI */}
      {mobileMode && renderMobileUI()}

      {/* Desktop/Kiosk Route Footer - always show, with integrated destination selector */}
      {!showKioskWelcome && !mobileMode && (
        <CompactRouteFooter
          destination={selectedDestination}
          currentLocation={currentLocation}
          routeInfo={routeInfo}
          qrCodeUrl={showQRModal ? qrCodeUrl : undefined}
          onClose={clearRoute}
          onGenerateQR={generateRouteQRCode}
          isGeneratingQR={isGenerating}
          onFindLocation={handleShowDestinationSelector}
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

      {/* Additional Directions Modal - shown when user reaches routing node for POI */}
      {showAdditionalDirections && selectedDestination && (
        <AdditionalDirections
          destination={selectedDestination}
          onClose={() => setShowAdditionalDirections(false)}
          mobileMode={mobileMode}
        />
      )}
    </div>
  );
};

const MemoizedCampusMap = React.memo(CampusMap);

export default dynamic(() => Promise.resolve(MemoizedCampusMap), {
  ssr: false,
});
