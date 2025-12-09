import { Fill, Stroke, Style, Icon } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat, toLonLat } from "ol/proj";
import { Circle as CircleGeometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import { Extent } from "ol/extent";
import { containsCoordinate } from "ol/extent";
import Map from "ol/Map";
import { MutableRefObject } from "react";
import { LineString } from "ol/geom";
import { getDistance } from "ol/sphere";

// =============================================
// Enhanced Location Tracking Types
// =============================================

export interface LocationTrackingOptions {
  autoFollow: boolean; // Auto-center map on user
  rotateMap: boolean; // Rotate map based on heading
  smoothAnimation: boolean; // Smooth camera transitions
  animationDuration: number; // Animation duration in ms
  zoomLevel: number; // Zoom level for auto-follow
  showAccuracyCircle: boolean; // Show GPS accuracy
  showDirectionArrow: boolean; // Show direction indicator
  trackingMode: "normal" | "compass" | "route"; // Tracking mode
}

export interface UserPosition {
  coordinates: [number, number]; // [longitude, latitude]
  accuracy: number; // GPS accuracy in meters
  heading: number | null; // Direction of travel in degrees (0 = North)
  speed: number | null; // Speed in m/s
  timestamp: number; // Position timestamp
}

export interface RouteProgress {
  distanceToDestination: number; // Distance remaining in meters
  distanceTraveled: number; // Distance traveled in meters
  percentComplete: number; // Percentage of route completed
  estimatedTimeRemaining: number; // ETA in seconds
  isOffRoute: boolean; // Whether user is off the planned route
  distanceFromRoute: number; // Distance from route in meters
  nextWaypoint: [number, number] | null; // Next waypoint coordinates
  distanceToNextWaypoint: number; // Distance to next waypoint
  bearingToNextWaypoint: number | null; // Bearing to next waypoint in degrees
}

// =============================================
// Helper Functions
// =============================================

// Calculate bearing between two points (in degrees, 0 = North)
export const calculateBearing = (
  start: [number, number],
  end: [number, number]
): number => {
  const [lon1, lat1] = start;
  const [lon2, lat2] = end;

  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  const bearingRad = Math.atan2(y, x);
  const bearingDeg = (bearingRad * 180) / Math.PI;

  return (bearingDeg + 360) % 360;
};

// Calculate distance between two geographic coordinates (in meters)
// CRITICAL: getDistance expects EPSG:4326 (lon/lat), NOT EPSG:3857 (Web Mercator)
export const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  // Do NOT convert to Web Mercator - getDistance calculates spherical distance on lon/lat
  return getDistance(coord1, coord2);
};

// Smooth angle interpolation (handles wrapping)
const interpolateAngle = (
  current: number,
  target: number,
  factor: number
): number => {
  let diff = target - current;

  // Normalize to [-180, 180]
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  return current + diff * factor;
};

// Check if coordinate is within school boundary
export const isCoordinateInsideSchool = (
  coords: number[],
  boundary: Extent | null
): boolean => {
  if (!boundary) return true;
  return containsCoordinate(boundary, coords);
};

// =============================================
// Enhanced Location Tracking System
// =============================================

export class EnhancedLocationTracker {
  private map: Map;
  private options: LocationTrackingOptions;
  // Feature references
  private userPositionFeature: Feature;
  private accuracyFeature: Feature;
  private directionArrowFeature: Feature;
  private userPositionLayer: VectorLayer<VectorSource>;

  // Position tracking
  private currentPosition: UserPosition | null = null;
  private previousPosition: UserPosition | null = null;
  private watchId: number | null = null;
  private positionHistory: UserPosition[] = [];
  private maxHistoryLength = 10;

  // GPS Update Debouncer (prevents rapid updates, gives roads time to render)
  private debounceTimer: number | null = null;
  private debounceDelay = 2000; // 2 seconds - prevents random updates, allows road highlighting to generate
  private lastUIUpdateTime: number = 0; // Track when last UI update happened
  private minUpdateInterval = 1000; // Minimum 1 second between UI updates (marker always updates)

  // GPS NOISE FILTERING - Prevents random jumps in low signal areas
  private minMovementThreshold = 5; // Minimum 5 meters movement before updating position
  private maxAccuracyThreshold = 50; // Ignore GPS readings with accuracy > 50 meters
  private lastValidPosition: UserPosition | null = null; // Last position that passed filtering
  private snappedPosition: [number, number] | null = null; // Position snapped to nearest road node
  private lastSnappedPosition: [number, number] | null = null; // Last snapped position for movement comparison
  private nodesSource: VectorSource | null = null; // Reference to nodes source for snapping

  // Camera Rotation Debouncer (prevents jittery compass rotation)
  private targetHeading: number | null = null; // Debounced heading for smooth rotation
  private rotationDebounceTimer: number | null = null;
  private rotationDebounceDelay = 1500; // 1.5 seconds - prevents rapid compass changes

  // Route tracking
  private routePath: [number, number][] = [];
  private startPosition: [number, number] | null = null;
  private destinationPosition: [number, number] | null = null;
  private totalRouteDistance: number = 0;

  // Dynamic road highlighting - maps route segment indices to road names
  private routeSegmentRoads: string[] = [];
  private currentRoad: string | null = null;

  // PRIORITY 3: Periodic force update near destination
  private forceUpdateInterval: number | null = null;
  private forceUpdateIntervalMs = 5000; // 5 seconds - force recalculation when close to destination

  // Animation
  private animationFrameId: number | null = null;
  private targetRotation: number = 0;
  private currentRotation: number = 0;

  // Callbacks
  private onPositionUpdate?: (position: UserPosition) => void;
  private onRouteProgressUpdate?: (progress: RouteProgress) => void;
  private onCurrentRoadChange?: (roadName: string | null) => void;
  private locationErrorRef: MutableRefObject<string | null>;
  private isOutsideSchoolRef: MutableRefObject<boolean>;
  private schoolBoundaryRef: MutableRefObject<Extent | null>;

  constructor(
    map: Map,
    options: Partial<LocationTrackingOptions>,
    locationErrorRef: MutableRefObject<string | null>,
    isOutsideSchoolRef: MutableRefObject<boolean>,
    schoolBoundaryRef: MutableRefObject<Extent | null>,
    nodesSource?: VectorSource // Optional nodes source for snapping marker to road nodes
  ) {
    this.map = map;
    this.locationErrorRef = locationErrorRef;
    this.isOutsideSchoolRef = isOutsideSchoolRef;
    this.schoolBoundaryRef = schoolBoundaryRef;
    this.nodesSource = nodesSource || null;

    // Default options
    this.options = {
      autoFollow: true,
      rotateMap: true,
      smoothAnimation: true,
      animationDuration: 1000,
      zoomLevel: 19,
      showAccuracyCircle: true,
      showDirectionArrow: true,
      trackingMode: "route",
      ...options,
    };

    // Initialize features
    this.userPositionFeature = new Feature({
      geometry: new Point(fromLonLat([0, 0])),
      name: "userPosition",
    });

    this.accuracyFeature = new Feature({
      geometry: new CircleGeometry(fromLonLat([0, 0]), 10),
      name: "accuracy",
    });

    // Create direction arrow using SVG data URL
    const arrowSvg = this.createDirectionArrowSVG();
    this.directionArrowFeature = new Feature({
      geometry: new Point(fromLonLat([0, 0])),
      name: "directionArrow",
    });

    // Create layer with styled features
    this.userPositionLayer = new VectorLayer({
      source: new VectorSource({
        features: [
          this.accuracyFeature,
          this.userPositionFeature,
          this.directionArrowFeature,
        ],
      }),
      style: (feature) => this.getFeatureStyle(feature),
      zIndex: 1000, // High z-index to render on top
    });

    this.map.addLayer(this.userPositionLayer);

  }

  // =============================================
  // Styling
  // =============================================

  private createDirectionArrowSVG(): string {
    const svg = `
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="20" cy="20" r="18" fill="#3B82F6" opacity="0.3"/>
        <circle cx="20" cy="20" r="14" fill="#3B82F6" stroke="white" stroke-width="2" filter="url(#shadow)"/>
        <path d="M20 8 L26 24 L20 20 L14 24 Z" fill="white" filter="url(#shadow)"/>
      </svg>
    `;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  private getFeatureStyle(feature: Feature): Style {
    const name = feature.get("name");

    // CRITICAL: Only show directionArrow when we have heading data AND are moving
    // Otherwise show the simpler userPosition marker to avoid duplicate markers
    const hasValidHeading = this.currentPosition?.heading !== null &&
                           this.currentPosition?.heading !== undefined;
    const isMoving = (this.currentPosition?.speed ?? 0) > 0.5; // Moving > 0.5 m/s

    if (name === "userPosition") {
      // Only show position dot when NOT showing direction arrow
      // This prevents dual markers (one with arrow, one without)
      if (this.options.showDirectionArrow && hasValidHeading && isMoving) {
        return new Style(); // Hide - direction arrow will show instead
      }

      // Show pulsing user position dot when stationary or no heading
      return new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: "#3B82F6" }),
          stroke: new Stroke({ color: "#ffffff", width: 3 }),
        }),
      });
    } else if (name === "accuracy") {
      // Hide accuracy circle entirely
      return new Style();
    } else if (name === "directionArrow" && this.options.showDirectionArrow) {
      // Only show direction arrow when we have valid heading AND are moving
      if (!hasValidHeading || !isMoving) {
        return new Style(); // Hide when stationary/no heading
      }

      // Direction arrow - shows movement direction
      const rotation = this.currentPosition!.heading!;
      return new Style({
        image: new Icon({
          src: this.createDirectionArrowSVG(),
          scale: 0.8,
          rotation: (rotation * Math.PI) / 180, // Convert to radians
          rotateWithView: false, // We handle rotation ourselves
        }),
      });
    }

    return new Style();
  }

  // =============================================
  // Position Tracking
  // =============================================

  public startTracking(
    onPositionUpdate?: (position: UserPosition) => void,
    onRouteProgressUpdate?: (progress: RouteProgress) => void,
    onCurrentRoadChange?: (roadName: string | null) => void
  ): void {
    console.log(`[GPS] 🚀 Starting GPS tracking with update interval: 0.5s (UI updates debounced to ${this.debounceDelay}ms, rotation debounced to ${this.rotationDebounceDelay}ms)`);
    this.onPositionUpdate = onPositionUpdate;
    this.onRouteProgressUpdate = onRouteProgressUpdate;
    this.onCurrentRoadChange = onCurrentRoadChange;

    if (this.watchId !== null) {
      console.log(`[GPS] ⚠️ GPS tracking already active (watchId: ${this.watchId})`);
      return;
    }

    console.log(`[GPS] 📡 Requesting high-accuracy GPS location...`);
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handlePositionError(error),
      {
        enableHighAccuracy: true,
        maximumAge: 2000, // Battery-optimized: 2 seconds is sufficient for walking navigation
        timeout: 15000,
      }
    );

    // PRIORITY 3: Start periodic force update interval for near-destination scenarios
    // This ensures distance calculations continue even if GPS is stationary or inaccurate
    this.startForceUpdateInterval();

    // Start animation loop
    this.startAnimationLoop();
  }

  public stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Clear debounce timers
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.rotationDebounceTimer !== null) {
      clearTimeout(this.rotationDebounceTimer);
      this.rotationDebounceTimer = null;
    }

    // Reset position tracking
    this.lastSnappedPosition = null;

    // PRIORITY 3: Stop force update interval
    this.stopForceUpdateInterval();
  }

  private handlePositionUpdate(geoPosition: GeolocationPosition): void {
    const { latitude, longitude, accuracy, heading, speed } = geoPosition.coords;
    console.log(`[GPS] 📍 Raw GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} | Accuracy: ${accuracy?.toFixed(1)}m`);

    // =============================================
    // PHASE 1: ACCURACY VALIDATION
    // Check GPS quality but continue to process
    // =============================================

    let isHighQualityGPS = true;
    if (accuracy && accuracy > this.maxAccuracyThreshold) {
      console.log(`[GPS] ⚠️ Low accuracy: ${accuracy.toFixed(0)}m > ${this.maxAccuracyThreshold}m (will snap but skip heavy UI updates)`);
      isHighQualityGPS = false;
      // Continue to snap marker even with low accuracy
    }

    // =============================================
    // PHASE 2: PROCESS GPS DATA
    // Calculate heading and create position object
    // =============================================

    // Calculate derived heading from movement if not provided by device
    let effectiveHeading = heading;
    if (
      this.previousPosition &&
      (heading === null || heading === undefined)
    ) {
      effectiveHeading = calculateBearing(
        this.previousPosition.coordinates,
        [longitude, latitude]
      );
    }

    const newPosition: UserPosition = {
      coordinates: [longitude, latitude],
      accuracy: accuracy || 10,
      heading: effectiveHeading,
      speed: speed,
      timestamp: Date.now(),
    };

    // =============================================
    // PHASE 3: SNAP TO ROUTE (IF ACTIVE)
    // CRITICAL: Snap BEFORE checking movement
    // This allows us to compare snapped positions, not raw GPS
    // =============================================

    const hasActiveRoute = this.routePath && this.routePath.length >= 2;
    let finalRenderCoordinates: [number, number];

    if (hasActiveRoute) {
      // ========== ROUTE MODE: MANDATORY ROAD-ONLY RENDERING ==========
      // The marker MUST stay on the highlighted road at ALL times
      console.log(`[SNAP] 🛣️  Route active - snapping to road BEFORE movement check`);

      // ALWAYS snap to route - NO EXCEPTIONS, NO GPS FALLBACK EVER
      const snappedPoint = this.findClosestPointOnRoute(longitude, latitude);

      if (snappedPoint) {
        // SUCCESS: Marker will render ON the road
        finalRenderCoordinates = snappedPoint;
        this.snappedPosition = snappedPoint;
        console.log(`[SNAP] ✅ Snap successful - marker ON ROAD at [${snappedPoint[0].toFixed(6)}, ${snappedPoint[1].toFixed(6)}]`);
      } else {
        // FAILURE: Cannot snap to route
        // CRITICAL: NEVER show marker off-road
        // Priority 1: Use last valid snapped position
        // Priority 2: Use route start point
        // Priority 3: Skip render entirely (marker stays invisible)
        if (this.snappedPosition) {
          finalRenderCoordinates = this.snappedPosition;
          console.log(`[SNAP] ⚠️ Snap failed - keeping marker at LAST SNAPPED position on road`);
        } else if (this.routePath.length > 0) {
          // Use route start as fallback - marker MUST be on road
          finalRenderCoordinates = this.routePath[0];
          this.snappedPosition = this.routePath[0];
          console.log(`[SNAP] ⚠️ Snap failed, no previous snap - placing marker at ROUTE START`);
        } else {
          console.log(`[SNAP] ❌ Cannot render - no route available. SKIPPING to prevent off-road marker`);
          return; // Skip entire render cycle - DO NOT show marker off-road
        }
      }
    } else {
      // ========== FREE MODE: No route - show actual GPS ==========
      // Only in free mode (no navigation) do we show actual GPS position
      console.log(`[SNAP] 📍 No route - showing actual GPS position`);
      finalRenderCoordinates = [longitude, latitude];
      this.snappedPosition = null;
    }

    // =============================================
    // PHASE 4: MOVEMENT FILTER (ON SNAPPED POSITION)
    // NOW we check movement using snapped positions
    // This is more meaningful than comparing raw GPS
    // =============================================

    let hasMovedSignificantly = true;

    if (this.lastSnappedPosition && hasActiveRoute) {
      // Compare snapped positions (more accurate than raw GPS)
      const snappedDistance = this.calculateMovementDistance(
        this.lastSnappedPosition,
        finalRenderCoordinates
      );

      // PRIORITY 2: Dynamic movement threshold based on distance to destination
      // When close to destination, use lower threshold for higher sensitivity
      // When far away, use normal threshold to reduce GPS jitter
      let dynamicThreshold = this.minMovementThreshold; // Default: 5m

      if (this.destinationPosition) {
        const distToDestination = this.calculateMovementDistance(
          finalRenderCoordinates,
          this.destinationPosition
        );

        // Dynamic threshold calculation:
        // < 150m from destination: 2m threshold (high sensitivity for arrival detection)
        // 150m-500m: 3m threshold (moderate sensitivity)
        // > 500m: 5m threshold (normal, reduces jitter)
        if (distToDestination < 150) {
          dynamicThreshold = 2;
        } else if (distToDestination < 500) {
          dynamicThreshold = 3;
        }

        if (distToDestination < 200) {
          console.log(`[Movement Filter] 🎯 ${distToDestination.toFixed(0)}m from destination - using ${dynamicThreshold}m threshold`);
        }
      }

      if (snappedDistance < dynamicThreshold) {
        console.log(`[Movement Filter] ⚠️ Small snapped movement: ${snappedDistance.toFixed(1)}m < ${dynamicThreshold.toFixed(1)}m (will render but skip heavy UI updates)`);
        hasMovedSignificantly = false;
        // Continue to render marker, but skip heavy UI updates
      } else {
        console.log(`[Movement Filter] ✅ Good snapped movement: ${snappedDistance.toFixed(1)}m (threshold: ${dynamicThreshold}m)`);
      }
    } else if (this.lastValidPosition && !hasActiveRoute) {
      // Free mode: compare raw GPS positions
      const rawDistance = this.calculateMovementDistance(
        this.lastValidPosition.coordinates,
        [longitude, latitude]
      );

      if (rawDistance < this.minMovementThreshold) {
        console.log(`[Movement Filter] ⚠️ Small raw GPS movement: ${rawDistance.toFixed(1)}m < ${this.minMovementThreshold}m`);
        hasMovedSignificantly = false;
      } else {
        console.log(`[Movement Filter] ✅ Good raw GPS movement: ${rawDistance.toFixed(1)}m`);
      }
    }

    // =============================================
    // PHASE 5: UPDATE STATE
    // All checks passed - update internal state
    // =============================================

    this.lastValidPosition = newPosition;
    this.previousPosition = this.currentPosition;
    this.currentPosition = newPosition;

    // Update last snapped position for next movement comparison
    if (hasActiveRoute && this.snappedPosition) {
      this.lastSnappedPosition = [...this.snappedPosition] as [number, number];
    }

    this.positionHistory.push(newPosition);
    if (this.positionHistory.length > this.maxHistoryLength) {
      this.positionHistory.shift();
    }

    // Record start position if not set
    if (!this.startPosition) {
      this.startPosition = finalRenderCoordinates;
    }

    // =============================================
    // PHASE 6: RENDER MARKER
    // GUARANTEED: finalRenderCoordinates is ALWAYS on road when route exists
    // =============================================

    // Add GPS noise for poor signal quality
    let renderCoordinates = finalRenderCoordinates;
    if (!isHighQualityGPS && accuracy) {
      // Add random jitter proportional to GPS accuracy
      // Poor GPS (50-100m accuracy) gets 5-15m of random noise
      const noiseScale = Math.min((accuracy - this.maxAccuracyThreshold) / 50, 1.0); // 0 to 1
      const maxNoise = 5 + (noiseScale * 10); // 5m to 15m of noise

      // Random offset in meters
      const noiseDistance = Math.random() * maxNoise;
      const noiseAngle = Math.random() * 2 * Math.PI;

      // Convert noise to lat/lon offset (approximate)
      const latOffset = (noiseDistance * Math.cos(noiseAngle)) / 111320; // 1 degree lat ≈ 111.32 km
      const lonOffset = (noiseDistance * Math.sin(noiseAngle)) / (111320 * Math.cos(finalRenderCoordinates[1] * Math.PI / 180));

      renderCoordinates = [
        finalRenderCoordinates[0] + lonOffset,
        finalRenderCoordinates[1] + latOffset
      ] as [number, number];

      console.log(`[GPS NOISE] Adding ${noiseDistance.toFixed(1)}m jitter due to poor GPS (accuracy: ${accuracy.toFixed(0)}m)`);
    }

    console.log(`[RENDER] 🎯 Rendering marker at: [${renderCoordinates[0].toFixed(6)}, ${renderCoordinates[1].toFixed(6)}]`);
    this.updateMapFeatures(renderCoordinates);

    // =============================================
    // PHASE 6.5: ALWAYS CHECK ARRIVAL (CRITICAL)
    // Route progress MUST be calculated on EVERY marker update for arrival detection
    // This ensures we never miss when user arrives at destination
    // =============================================

    if (this.destinationPosition) {
      const progress = this.calculateRouteProgress();
      if (this.onRouteProgressUpdate) {
        this.onRouteProgressUpdate(progress);
      }
      console.log(`[Arrival Check] ✓ Distance to destination: ${progress.distanceToDestination.toFixed(1)}m (checked on every marker update)`);
    }

    // Early exit for low-quality GPS - marker was snapped and arrival checked, but skip other heavy updates
    // This allows the marker to update smoothly even with poor GPS or minimal movement
    if (!isHighQualityGPS || !hasMovedSignificantly) {
      console.log(`[GPS] ⏭️  Marker rendered and arrival checked, but skipping other UI updates (${!isHighQualityGPS ? 'low accuracy' : 'small snapped movement'})`);
      return; // Skip expensive boundary checks, camera centering, etc.
    }

    // =============================================
    // PHASE 7: POST-RENDER UPDATES (HIGH QUALITY GPS ONLY)
    // Update UI, route progress, callbacks - only for high-quality GPS readings
    // =============================================

    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUIUpdateTime;
    const shouldDoFullUpdate = timeSinceLastUpdate >= this.minUpdateInterval;

    if (shouldDoFullUpdate) {
      // Immediate full update (route progress already calculated above)
      console.log(`[GPS] 📊 Full UI update (${timeSinceLastUpdate}ms since last)`);
      this.lastUIUpdateTime = now;

      // Check boundary
      this.checkBoundary();

      // Auto-follow if enabled
      if (this.options.autoFollow) {
        this.centerMapOnUser();
      }

      // Callback
      if (this.onPositionUpdate) {
        this.onPositionUpdate(newPosition);
      }
    } else {
      // DEBOUNCED heavy updates (route progress already calculated above)
      if (this.debounceTimer !== null) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = window.setTimeout(() => {
        console.log(`[GPS] ⏱️  Debounced update triggered`);

        this.checkBoundary();

        if (this.onPositionUpdate && this.currentPosition) {
          this.onPositionUpdate(this.currentPosition);
        }

        this.lastUIUpdateTime = Date.now();
        this.debounceTimer = null;
      }, this.debounceDelay);
    }

    // =============================================
    // PHASE 7: UPDATE HEADING/ROTATION
    // Smooth compass rotation
    // =============================================

    if (effectiveHeading !== null && effectiveHeading !== undefined) {
      if (this.targetHeading === null) {
        this.targetHeading = effectiveHeading;
        console.log(`[GPS] 🧭 Initial heading: ${effectiveHeading.toFixed(1)}°`);
      }

      if (this.rotationDebounceTimer !== null) {
        clearTimeout(this.rotationDebounceTimer);
      }

      this.rotationDebounceTimer = window.setTimeout(() => {
        this.targetHeading = effectiveHeading;
        this.rotationDebounceTimer = null;
      }, this.rotationDebounceDelay);
    }

    console.log(`[RENDER] ✅ Render cycle complete`);
  }

  private handlePositionError(error: GeolocationPositionError): void {
    const errorMsg = `Location error: ${error.message}`;
    this.locationErrorRef.current = errorMsg;
  }

  // Calculate distance between two coordinates in meters (for movement filtering)
  private calculateMovementDistance(
    coord1: [number, number],
    coord2: [number, number]
  ): number {
    // Use Haversine formula for accurate distance calculation
    const R = 6371000; // Earth radius in meters
    const lat1 = (coord1[1] * Math.PI) / 180;
    const lat2 = (coord2[1] * Math.PI) / 180;
    const dLat = lat2 - lat1;
    const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Find closest point ON THE ACTIVE ROUTE to the given GPS coordinates
   * This projects the GPS position onto the nearest route segment to keep
   * the marker on the highlighted path at all times.
   *
   * GUARANTEE: When route exists, this ALWAYS returns a valid on-road point
   */
  private findClosestPointOnRoute(
    longitude: number,
    latitude: number
  ): [number, number] | null {
    // Validate route exists
    if (!this.routePath || this.routePath.length < 2) {
      console.log(`[SNAP] ❌ No valid route (path length: ${this.routePath?.length || 0})`);
      return null; // No active route - don't snap
    }

    let closestPoint: [number, number] | null = null;
    let minDistance = Infinity;
    let closestSegmentIndex = -1;

    // PRIORITY 3: ENHANCED ROBUST SEARCH - Check EVERY segment with comprehensive validation
    let validSegmentCount = 0;
    let skippedSegmentCount = 0;

    for (let i = 0; i < this.routePath.length - 1; i++) {
      const segmentStart = this.routePath[i];
      const segmentEnd = this.routePath[i + 1];

      // ENHANCED VALIDATION: Comprehensive coordinate checks
      const isValidSegment =
        segmentStart && segmentEnd &&
        segmentStart.length === 2 && segmentEnd.length === 2 &&
        !isNaN(segmentStart[0]) && !isNaN(segmentStart[1]) &&
        !isNaN(segmentEnd[0]) && !isNaN(segmentEnd[1]) &&
        isFinite(segmentStart[0]) && isFinite(segmentStart[1]) &&
        isFinite(segmentEnd[0]) && isFinite(segmentEnd[1]);

      if (!isValidSegment) {
        skippedSegmentCount++;
        console.warn(`[SNAP] ⚠️ Invalid segment ${i}: Start=[${segmentStart}], End=[${segmentEnd}] - SKIPPING`);
        continue;
      }

      // Check for degenerate segment (zero length or too short)
      const segmentLength = this.calculateMovementDistance(segmentStart, segmentEnd);
      if (segmentLength < 0.1) { // Less than 10cm
        skippedSegmentCount++;
        console.warn(`[SNAP] ⚠️ Degenerate segment ${i} (length: ${segmentLength.toFixed(3)}m) - SKIPPING`);
        continue;
      }

      validSegmentCount++;

      // Project GPS position onto this line segment
      const projectedPoint = this.projectPointOntoLineSegment(
        [longitude, latitude],
        segmentStart,
        segmentEnd
      );

      // Calculate distance from GPS to projected point
      const distance = calculateDistance(
        [longitude, latitude],
        projectedPoint
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = projectedPoint;
        closestSegmentIndex = i;
      }
    }

    console.log(`[SNAP] Segment validation: ${validSegmentCount} valid, ${skippedSegmentCount} skipped out of ${this.routePath.length - 1} total`);

    // PRIORITY 3: EMERGENCY FALLBACK - If ALL segments were invalid, use closest route node
    if (!closestPoint) {
      console.error(`[SNAP] ❌ CRITICAL: No valid segments found! All ${this.routePath.length - 1} segments were invalid.`);
      console.log(`[SNAP] 🆘 Emergency fallback: Finding closest route node instead of projected point`);

      // Find closest route node (guaranteed to be valid since route was validated on setRoute)
      let closestNode: [number, number] = this.routePath[0];
      let minNodeDistance = Infinity;

      this.routePath.forEach((node, idx) => {
        const dist = this.calculateMovementDistance([longitude, latitude], node);
        if (dist < minNodeDistance) {
          minNodeDistance = dist;
          closestNode = node;
        }
      });

      console.warn(`[SNAP] 🆘 Emergency fallback complete: Using closest route node at ${minNodeDistance.toFixed(1)}m (node-based, not projected)`);
      return closestNode; // Guaranteed to be on-road (an actual route node)
    }

    // SUCCESS: Marker will render on road
    if (minDistance > 100) {
      console.log(`[SNAP] ⚠️ GPS far from route (${minDistance.toFixed(1)}m, segment ${closestSegmentIndex}) - but SNAPPING to keep marker on road`);
    } else if (minDistance > 50) {
      console.log(`[SNAP] 📍 Moderate snap distance: ${minDistance.toFixed(1)}m (segment ${closestSegmentIndex})`);
    } else {
      console.log(`[SNAP] ✅ Good snap: ${minDistance.toFixed(1)}m (segment ${closestSegmentIndex})`);
    }

    // =============================================
    // DYNAMIC ROAD HIGHLIGHTING
    // Update current road based on snapped segment
    // =============================================
    if (this.routeSegmentRoads.length > 0 && closestSegmentIndex >= 0 && closestSegmentIndex < this.routeSegmentRoads.length) {
      const roadName = this.routeSegmentRoads[closestSegmentIndex];

      // Only trigger callback if road has changed
      if (roadName !== this.currentRoad) {
        const previousRoad = this.currentRoad;
        this.currentRoad = roadName;

        console.log(`[Dynamic Roads] 🔴 Road changed: "${previousRoad || 'none'}" → "${roadName}" (segment ${closestSegmentIndex})`);

        if (this.onCurrentRoadChange) {
          this.onCurrentRoadChange(roadName);
        }
      }
    }

    // GUARANTEE: closestPoint is ALWAYS on the route when we reach here
    return closestPoint;
  }

  /**
   * Project a point onto a line segment (closest point on the line)
   * This ensures the marker stays ON the route line, not just near it
   */
  private projectPointOntoLineSegment(
    point: [number, number],
    lineStart: [number, number],
    lineEnd: [number, number]
  ): [number, number] {
    const [px, py] = point;
    const [ax, ay] = lineStart;
    const [bx, by] = lineEnd;

    // Vector from A to B
    const abx = bx - ax;
    const aby = by - ay;

    // Vector from A to P
    const apx = px - ax;
    const apy = py - ay;

    // Squared length of AB
    const abSquared = abx * abx + aby * aby;

    // Handle degenerate case (line segment is actually a point)
    if (abSquared === 0) {
      return lineStart;
    }

    // Project P onto AB: t = (AP · AB) / |AB|²
    // t = 0 means point projects to A, t = 1 means point projects to B
    const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abSquared));

    // Calculate projected point: A + t * AB
    return [ax + t * abx, ay + t * aby];
  }

  // DEPRECATED: Old method that snapped to any road node
  // Kept for backward compatibility but not used during navigation
  private findClosestNodeInternal(
    longitude: number,
    latitude: number
  ): [number, number] | null {
    if (!this.nodesSource) return null;

    const features = this.nodesSource.getFeatures();
    if (features.length === 0) return null;

    let closestCoords: [number, number] | null = null;
    let minDistance = Infinity;

    features.forEach((feature) => {
      const geometry = feature.getGeometry();
      if (!geometry) return;

      let featureCoords: number[] = [0, 0];

      if (geometry instanceof Point) {
        featureCoords = geometry.getCoordinates();
      } else {
        return; // Skip non-point geometries
      }

      // Convert from EPSG:3857 to EPSG:4326
      const geoCoords = toLonLat(featureCoords);

      // Calculate distance
      const distance = this.calculateMovementDistance(
        [longitude, latitude],
        geoCoords as [number, number]
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestCoords = geoCoords as [number, number];
      }
    });

    return closestCoords;
  }

  /**
   * Update marker position on the map
   * CRITICAL: This is the ONLY function that renders the marker
   * All coordinates passed here MUST be validated before calling
   */
  private updateMapFeatures(displayCoordinates?: [number, number]): void {
    if (!this.currentPosition) {
      console.log(`[RENDER] ❌ Cannot render - no current position`);
      return;
    }

    // Use provided display coordinates (snapped) or raw GPS coordinates
    const coordsToUse = displayCoordinates || this.currentPosition.coordinates;

    // FINAL VALIDATION: Ensure coordinates are valid
    if (!coordsToUse || coordsToUse.length !== 2 ||
        isNaN(coordsToUse[0]) || isNaN(coordsToUse[1])) {
      console.log(`[RENDER] ❌ CRITICAL: Invalid coordinates - cannot render marker`);
      return;
    }

    // Convert to map projection
    const coords = fromLonLat(coordsToUse);

    // Log the actual render
    const hasActiveRoute = this.routePath && this.routePath.length >= 2;
    const isSnapped = this.snappedPosition !== null;
    const positionType = hasActiveRoute && isSnapped ? "ON ROAD (snapped)" : "GPS (free)";

    console.log(`[RENDER] 🎯 Marker rendered at [${coordsToUse[0].toFixed(6)}, ${coordsToUse[1].toFixed(6)}] - ${positionType}`);

    // Update position marker
    this.userPositionFeature.setGeometry(new Point(coords));

    // Update accuracy circle
    this.accuracyFeature.setGeometry(
      new CircleGeometry(coords, this.currentPosition.accuracy)
    );

    // Update direction arrow
    this.directionArrowFeature.setGeometry(new Point(coords));

    // Refresh styles to update display
    this.userPositionLayer.changed();
  }

  private checkBoundary(): void {
    if (!this.currentPosition || !this.schoolBoundaryRef.current) {
      console.log(`[GPS] ⚠️ Boundary check skipped (no position or boundary defined)`);
      return;
    }

    const coords = fromLonLat(this.currentPosition.coordinates);
    const isOutside = !isCoordinateInsideSchool(
      coords,
      this.schoolBoundaryRef.current
    );

    if (isOutside !== this.isOutsideSchoolRef.current) {
      this.isOutsideSchoolRef.current = isOutside;
      if (isOutside) {
        console.log(`[GPS] 🚨 User is OUTSIDE campus boundaries - but marker still shows!`);
      } else {
        console.log(`[GPS] ✅ User is INSIDE campus boundaries`);
      }
    }
  }

  // =============================================
  // Map Control
  // =============================================

  private centerMapOnUser(): void {
    if (!this.currentPosition) return;

    const view = this.map.getView();

    // PRIORITY 2: Use snapped position for camera centering during navigation
    // This keeps the camera perfectly centered on the marker (on-road) instead of raw GPS (possibly off-road)
    // Prevents visual "drift" where camera is slightly off from where marker is displayed
    const hasActiveRoute = this.routePath && this.routePath.length >= 2;
    const displayCoords = hasActiveRoute && this.snappedPosition
      ? this.snappedPosition  // Use snapped position during navigation (marker location)
      : this.currentPosition.coordinates; // Use raw GPS when no route

    const coords = fromLonLat(displayCoords);

    if (this.options.smoothAnimation) {
      view.animate({
        center: coords,
        zoom: this.options.zoomLevel,
        duration: 500, // Smooth transition
      });
    } else {
      view.setCenter(coords);
      view.setZoom(this.options.zoomLevel);
    }

    // Log when using snapped position for debugging
    if (hasActiveRoute && this.snappedPosition) {
      const offset = this.calculateMovementDistance(
        this.currentPosition.coordinates,
        this.snappedPosition
      );
      if (offset > 5) { // Only log if offset is significant (> 5m)
        console.log(`[Camera] Centering on SNAPPED position (${offset.toFixed(1)}m from raw GPS) for on-road alignment`);
      }
    }
  }

  private startAnimationLoop(): void {
    const animate = () => {
      // Use debounced targetHeading instead of direct currentPosition.heading
      // This prevents jittery compass rotation from rapid GPS heading updates
      if (
        this.options.rotateMap &&
        this.targetHeading !== null &&
        this.targetHeading !== undefined
      ) {
        // Smooth rotation interpolation
        const targetRotation = -((this.targetHeading * Math.PI) / 180);
        this.currentRotation = interpolateAngle(
          this.currentRotation,
          targetRotation,
          0.1 // Smoothing factor
        );

        const view = this.map.getView();
        view.setRotation(this.currentRotation);
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  // =============================================
  // PRIORITY 3: Force Update System
  // Guarantees distance calculations even when GPS is poor or stationary
  // =============================================

  /**
   * Start periodic force updates when close to destination
   * This ensures arrival detection works even with poor GPS or stationary user
   */
  private startForceUpdateInterval(): void {
    // Clear any existing interval first
    this.stopForceUpdateInterval();

    console.log(`[Force Update] 🔄 Starting periodic force updates every ${this.forceUpdateIntervalMs}ms`);

    this.forceUpdateInterval = window.setInterval(() => {
      // Only force update when we have both position and destination
      if (!this.currentPosition || !this.destinationPosition) {
        return;
      }

      // Calculate current distance to destination
      const userCoords = this.snappedPosition || this.currentPosition.coordinates;
      const distToDestination = calculateDistance(userCoords, this.destinationPosition);

      // Only force update when within 150m of destination (critical zone for arrival detection)
      if (distToDestination < 150) {
        console.log(`[Force Update] 🎯 Forcing route progress update at ${distToDestination.toFixed(1)}m from destination`);

        // Force recalculation of route progress
        const progress = this.calculateRouteProgress();

        // Trigger callback to update UI
        if (this.onRouteProgressUpdate) {
          this.onRouteProgressUpdate(progress);
          console.log(`[Force Update] ✅ Progress updated - Distance: ${progress.distanceToDestination.toFixed(1)}m, Complete: ${progress.percentComplete.toFixed(1)}%`);
        }
      } else if (distToDestination < 300) {
        // Log less frequently when farther away
        console.log(`[Force Update] 📍 ${distToDestination.toFixed(0)}m from destination (force updates active < 150m)`);
      }
    }, this.forceUpdateIntervalMs);
  }

  /**
   * Stop periodic force updates
   */
  private stopForceUpdateInterval(): void {
    if (this.forceUpdateInterval !== null) {
      console.log('[Force Update] 🛑 Stopping periodic force updates');
      clearInterval(this.forceUpdateInterval);
      this.forceUpdateInterval = null;
    }
  }

  // =============================================
  // Route Management
  // =============================================

  public setRoute(
    path: [number, number][],
    destinationCoords?: [number, number],
    segmentRoads?: string[]
  ): void {
    // =============================================
    // VALIDATE ROUTE PATH
    // Ensure no NaN or invalid coordinates
    // =============================================
    const validPath = path.filter(([lon, lat]) => {
      const isValid = !isNaN(lon) && !isNaN(lat) &&
                      isFinite(lon) && isFinite(lat) &&
                      lon >= -180 && lon <= 180 &&
                      lat >= -90 && lat <= 90;
      if (!isValid) {
        console.warn(`[ROUTE] ⚠️ Filtering invalid coordinate: [${lon}, ${lat}]`);
      }
      return isValid;
    });

    if (validPath.length < path.length) {
      console.warn(`[ROUTE] ⚠️ Filtered ${path.length - validPath.length} invalid coordinates from route`);
    }

    if (validPath.length < 2) {
      console.error(`[ROUTE] ❌ Route too short after validation (${validPath.length} points). Cannot set route.`);
      return;
    }

    this.routePath = validPath;
    this.routeSegmentRoads = segmentRoads || [];
    this.currentRoad = null; // Reset current road when new route is set

    console.log(`[Dynamic Roads] Route set with ${this.routeSegmentRoads.length} road segment mappings`);

    if (validPath.length > 0) {
      // Validate destination coordinates
      let validDestination = destinationCoords;
      if (destinationCoords) {
        const [dLon, dLat] = destinationCoords;
        if (isNaN(dLon) || isNaN(dLat) || !isFinite(dLon) || !isFinite(dLat)) {
          console.warn(`[ROUTE] ⚠️ Invalid destination coords, using route end instead`);
          validDestination = undefined;
        }
      }

      // CRITICAL FIX: If destination coords differ from route end, extend the route
      // This ensures the marker can snap all the way to the actual destination
      const routeEnd = validPath[validPath.length - 1];
      if (validDestination) {
        const distanceToActualDestination = calculateDistance(routeEnd, validDestination);

        if (distanceToActualDestination > 5) { // More than 5m difference
          console.log(`[ROUTE] ⚠️ Route end is ${distanceToActualDestination.toFixed(1)}m from actual destination`);
          console.log(`[ROUTE] 📍 Route end: [${routeEnd[0].toFixed(6)}, ${routeEnd[1].toFixed(6)}]`);
          console.log(`[ROUTE] 🎯 Actual dest: [${validDestination[0].toFixed(6)}, ${validDestination[1].toFixed(6)}]`);
          console.log(`[ROUTE] ✓ Extending route to include actual destination point`);

          // Add the actual destination as the final point in the route
          this.routePath = [...validPath, validDestination];

          // Add road name for the final segment (use last road name)
          if (this.routeSegmentRoads.length > 0) {
            const lastRoad = this.routeSegmentRoads[this.routeSegmentRoads.length - 1];
            this.routeSegmentRoads = [...this.routeSegmentRoads, lastRoad];
          }
        }
      }

      // Use provided destination coordinates if available (for POIs with nearest_node)
      // Otherwise use the last point in the route path (which may have been extended above)
      this.destinationPosition = validDestination || this.routePath[this.routePath.length - 1];

      console.log(`[ROUTE] 🎯 Final destination set to: [${this.destinationPosition[0].toFixed(6)}, ${this.destinationPosition[1].toFixed(6)}]`);
      console.log(`[ROUTE] 🛣️  Route path has ${this.routePath.length} points`);

      // Verify final point matches destination
      const finalPoint = this.routePath[this.routePath.length - 1];
      const finalDistance = calculateDistance(finalPoint, this.destinationPosition);
      if (finalDistance < 1) {
        console.log(`[ROUTE] ✅ Route final point matches destination (${finalDistance.toFixed(1)}m apart)`);
      } else {
        console.warn(`[ROUTE] ⚠️ Route final point is ${finalDistance.toFixed(1)}m from destination!`);
      }

      // Calculate total route distance
      this.totalRouteDistance = 0;
      for (let i = 0; i < this.routePath.length - 1; i++) {
        this.totalRouteDistance += calculateDistance(this.routePath[i], this.routePath[i + 1]);
      }

      console.log(`[ROUTE] 📏 Total route distance: ${this.totalRouteDistance.toFixed(1)}m`);

      // CRITICAL: Force initial snap to route start if we have a current position
      // This ensures the marker is on the road from the very beginning
      if (this.currentPosition) {
        console.log('[ROUTE] 🎯 Route set - forcing initial marker snap to route');
        this.forceSnapToRoute();
      } else {
        // No GPS yet - set initial snapped position to route start
        console.log('[ROUTE] 🎯 Route set - setting initial marker at route start (no GPS yet)');
        this.snappedPosition = validPath[0];
        this.updateMapFeatures(validPath[0]);
      }
    }
  }

  /**
   * Force snap the current GPS position to the route
   * This is used when route is first set to ensure marker is on road from the start
   */
  public forceSnapToRoute(): void {
    if (!this.routePath || this.routePath.length < 2) {
      console.log('[SNAP] ❌ Cannot force snap - no route set');
      return;
    }

    // If we have a current GPS position, snap it to the route
    if (this.currentPosition) {
      const snappedPoint = this.findClosestPointOnRoute(
        this.currentPosition.coordinates[0],
        this.currentPosition.coordinates[1]
      );

      if (snappedPoint) {
        this.snappedPosition = snappedPoint;
        console.log(`[SNAP] ✅ Force snapped to route at [${snappedPoint[0].toFixed(6)}, ${snappedPoint[1].toFixed(6)}]`);
        this.updateMapFeatures(snappedPoint);
      } else {
        // Fallback to route start if snap fails
        this.snappedPosition = this.routePath[0];
        console.log(`[SNAP] ⚠️ Force snap failed - using route start`);
        this.updateMapFeatures(this.routePath[0]);
      }
    } else {
      // No GPS position - use route start
      this.snappedPosition = this.routePath[0];
      console.log(`[SNAP] 📍 No GPS - marker at route start`);
      this.updateMapFeatures(this.routePath[0]);
    }
  }

  public clearRoute(): void {
    this.routePath = [];
    this.destinationPosition = null;
    this.totalRouteDistance = 0;
    this.startPosition = null;
  }

  private calculateRouteProgress(): RouteProgress {
    if (
      !this.currentPosition ||
      !this.destinationPosition ||
      this.routePath.length === 0
    ) {
      return {
        distanceToDestination: 0,
        distanceTraveled: 0,
        percentComplete: 0,
        estimatedTimeRemaining: 0,
        isOffRoute: false,
        distanceFromRoute: 0,
        nextWaypoint: null,
        distanceToNextWaypoint: 0,
        bearingToNextWaypoint: null,
      };
    }

    // IMPORTANT: Use snapped position for distance calculation
    // Since marker is displayed at snapped position (on route), distance should be
    // calculated from where the marker is shown, not raw GPS position
    const userCoords = this.snappedPosition || this.currentPosition.coordinates;
    const rawGPSCoords = this.currentPosition.coordinates;

    // Distance to destination FROM MARKER POSITION (snapped)
    const distanceToDestination = calculateDistance(
      userCoords,
      this.destinationPosition
    );

    // Distance traveled (from start) - use marker position for consistency
    // MUST calculate this BEFORE logging to avoid undefined variable
    const distanceTraveled = this.startPosition
      ? calculateDistance(this.startPosition, userCoords)
      : 0;

    // Debug logging for arrival detection
    if (distanceToDestination < 150) { // Log when getting close
      const positionType = this.snappedPosition ? 'marker (snapped)' : 'GPS';
      console.log(`[Arrival Detection] Distance from ${positionType} to destination: ${distanceToDestination.toFixed(1)}m | Traveled: ${distanceTraveled.toFixed(1)}m`);

      // Only trigger arrival if user has traveled at least 20m from start
      // This prevents immediate arrival when scanning QR near destination
      const minProgressBeforeArrival = 20; // meters
      if (distanceToDestination < 15) {
        if (distanceTraveled >= minProgressBeforeArrival) {
          console.log(`[Arrival Detection] ✓ ARRIVED! ${positionType} is ${distanceToDestination.toFixed(1)}m from destination (< 15m threshold, traveled ${distanceTraveled.toFixed(1)}m)`);
        } else {
          console.log(`[Arrival Detection] ⏸️ At destination but not enough progress (${distanceTraveled.toFixed(1)}m < ${minProgressBeforeArrival}m) - waiting for user to start journey`);
        }
      } else if (distanceToDestination < 50) {
        console.log(`[Arrival Detection] 👀 Almost there! ${distanceToDestination.toFixed(1)}m away (measuring from ${positionType})`);
      }
    }

    // Calculate distance from raw GPS to route (for off-route detection)
    const distanceFromRoute = this.snappedPosition
      ? calculateDistance(rawGPSCoords, this.snappedPosition)
      : 0;

    // Percent complete
    const percentComplete =
      this.totalRouteDistance > 0
        ? Math.min(
            100,
            ((this.totalRouteDistance - distanceToDestination) /
              this.totalRouteDistance) *
              100
          )
        : 0;

    // Find next waypoint FROM MARKER POSITION
    let nextWaypoint: [number, number] | null = null;
    let minDistanceToWaypoint = Infinity;

    for (const waypoint of this.routePath) {
      const dist = calculateDistance(userCoords, waypoint);
      if (dist < minDistanceToWaypoint) {
        minDistanceToWaypoint = dist;
        nextWaypoint = waypoint;
      }
    }

    // Bearing to next waypoint FROM MARKER POSITION
    const bearingToNextWaypoint = nextWaypoint
      ? calculateBearing(userCoords, nextWaypoint)
      : null;

    // Check if off route based on GPS distance from route
    // If GPS is more than 50m from the snapped marker position, consider off-route
    const isOffRoute = distanceFromRoute > 50;

    // Estimated time remaining (based on average walking speed 1.4 m/s)
    const walkingSpeed = this.currentPosition.speed || 1.4;
    const estimatedTimeRemaining = distanceToDestination / walkingSpeed;

    return {
      distanceToDestination, // From marker position to destination
      distanceTraveled,
      percentComplete,
      estimatedTimeRemaining,
      isOffRoute,
      distanceFromRoute, // GPS distance from snapped marker position
      nextWaypoint,
      distanceToNextWaypoint: minDistanceToWaypoint,
      bearingToNextWaypoint,
    };
  }

  // =============================================
  // Configuration
  // =============================================

  public setOptions(options: Partial<LocationTrackingOptions>): void {
    this.options = { ...this.options, ...options };
    this.userPositionLayer.changed(); // Refresh styles
  }

  public getOptions(): LocationTrackingOptions {
    return { ...this.options };
  }

  /**
   * Set the GPS update debounce delay in milliseconds
   * Higher values = smoother experience, less CPU usage, more time for road rendering
   * Lower values = more responsive but may cause rapid updates
   * @param delayMs Debounce delay in milliseconds (recommended: 1500-3000ms)
   */
  public setDebounceDelay(delayMs: number): void {
    this.debounceDelay = Math.max(500, delayMs); // Minimum 500ms
    console.log(`[GPS] 🔧 Debounce delay set to ${this.debounceDelay}ms`);
  }

  public getDebounceDelay(): number {
    return this.debounceDelay;
  }

  /**
   * Set the camera rotation debounce delay in milliseconds
   * Higher values = less jittery rotation but slower response to direction changes
   * Lower values = more responsive but may show compass jitter
   * @param delayMs Rotation debounce delay in milliseconds (recommended: 1000-2000ms)
   */
  public setRotationDebounceDelay(delayMs: number): void {
    this.rotationDebounceDelay = Math.max(500, delayMs); // Minimum 500ms
    console.log(`[GPS] 🧭 Rotation debounce delay set to ${this.rotationDebounceDelay}ms`);
  }

  public getRotationDebounceDelay(): number {
    return this.rotationDebounceDelay;
  }

  /**
   * Set the nodes source for snapping marker to road nodes
   * When set, the marker will snap to the nearest road node instead of raw GPS position
   * @param source VectorSource containing road node features
   */
  public setNodesSource(source: VectorSource | null): void {
    this.nodesSource = source;
    console.log(`[GPS] 📌 Nodes source ${source ? 'set for snapping' : 'cleared'}`);
  }

  /**
   * Set minimum movement threshold in meters
   * GPS updates with less movement than this will be ignored (reduces jitter)
   * @param meters Minimum movement in meters (default: 5m)
   */
  public setMinMovementThreshold(meters: number): void {
    this.minMovementThreshold = Math.max(1, meters);
    console.log(`[GPS] 🔧 Min movement threshold set to ${this.minMovementThreshold}m`);
  }

  public getMinMovementThreshold(): number {
    return this.minMovementThreshold;
  }

  /**
   * Set maximum accuracy threshold in meters
   * GPS readings with worse accuracy will be ignored (filters low-quality readings)
   * @param meters Maximum acceptable accuracy in meters (default: 50m)
   */
  public setMaxAccuracyThreshold(meters: number): void {
    this.maxAccuracyThreshold = Math.max(10, meters);
    console.log(`[GPS] 🔧 Max accuracy threshold set to ${this.maxAccuracyThreshold}m`);
  }

  public getMaxAccuracyThreshold(): number {
    return this.maxAccuracyThreshold;
  }

  public getCurrentPosition(): UserPosition | null {
    return this.currentPosition;
  }

  public getPositionHistory(): UserPosition[] {
    return [...this.positionHistory];
  }

  public getSnappedPosition(): [number, number] | null {
    return this.snappedPosition;
  }

  public getRoutePath(): [number, number][] {
    return this.routePath;
  }

  // =============================================
  // Utilities
  // =============================================

  public destroy(): void {
    this.stopTracking();
    this.map.removeLayer(this.userPositionLayer);
  }
}

// =============================================
// Export Factory Function
// =============================================

export const setupEnhancedLocationTracking = (
  map: Map,
  options: Partial<LocationTrackingOptions>,
  locationErrorRef: MutableRefObject<string | null>,
  isOutsideSchoolRef: MutableRefObject<boolean>,
  schoolBoundaryRef: MutableRefObject<Extent | null>,
  nodesSource?: VectorSource // Optional: for snapping marker to road nodes
): EnhancedLocationTracker => {
  return new EnhancedLocationTracker(
    map,
    options,
    locationErrorRef,
    isOutsideSchoolRef,
    schoolBoundaryRef,
    nodesSource
  );
};
