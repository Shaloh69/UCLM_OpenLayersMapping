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
export const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const point1 = fromLonLat(coord1);
  const point2 = fromLonLat(coord2);
  return getDistance(point1, point2);
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

  // Animation
  private animationFrameId: number | null = null;
  private targetRotation: number = 0;
  private currentRotation: number = 0;

  // Callbacks
  private onPositionUpdate?: (position: UserPosition) => void;
  private onRouteProgressUpdate?: (progress: RouteProgress) => void;
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

    if (name === "userPosition") {
      // Pulsing user position dot
      return new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: "#3B82F6" }),
          stroke: new Stroke({ color: "#ffffff", width: 3 }),
        }),
      });
    } else if (name === "accuracy" && this.options.showAccuracyCircle) {
      // Accuracy circle
      return new Style({
        fill: new Fill({ color: "rgba(59, 130, 246, 0.1)" }),
        stroke: new Stroke({ color: "#3B82F6", width: 1.5, lineDash: [5, 5] }),
      });
    } else if (name === "directionArrow" && this.options.showDirectionArrow) {
      // Direction arrow
      const rotation = this.currentPosition?.heading || 0;
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
    onRouteProgressUpdate?: (progress: RouteProgress) => void
  ): void {
    console.log(`[GPS] 🚀 Starting GPS tracking with update interval: 0.5s (UI updates debounced to ${this.debounceDelay}ms, rotation debounced to ${this.rotationDebounceDelay}ms)`);
    this.onPositionUpdate = onPositionUpdate;
    this.onRouteProgressUpdate = onRouteProgressUpdate;

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
  }

  private handlePositionUpdate(geoPosition: GeolocationPosition): void {
    const { latitude, longitude, accuracy, heading, speed } = geoPosition.coords;
    console.log(`[GPS] 📍 Raw GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} | Accuracy: ${accuracy?.toFixed(1)}m`);

    // =============================================
    // PHASE 1: PRE-RENDER VALIDATION
    // Validate GPS quality BEFORE any processing
    // =============================================

    // 1.1 ACCURACY FILTER: Reject poor quality GPS readings
    if (accuracy && accuracy > this.maxAccuracyThreshold) {
      console.log(`[GPS] ❌ REJECTED - Poor accuracy: ${accuracy.toFixed(0)}m > ${this.maxAccuracyThreshold}m threshold`);
      return; // Skip entire render cycle
    }

    // 1.2 MOVEMENT FILTER: Only process if user actually moved
    if (this.lastValidPosition) {
      const distance = this.calculateMovementDistance(
        this.lastValidPosition.coordinates,
        [longitude, latitude]
      );

      if (distance < this.minMovementThreshold) {
        console.log(`[GPS] ❌ REJECTED - Insufficient movement: ${distance.toFixed(1)}m < ${this.minMovementThreshold}m threshold`);
        return; // Skip entire render cycle
      }
      console.log(`[GPS] ✅ ACCEPTED - Movement: ${distance.toFixed(1)}m (threshold: ${this.minMovementThreshold}m)`);
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
    // PHASE 3: DETERMINE RENDER COORDINATES
    // CRITICAL: When route exists, marker MUST ALWAYS be on road
    // NEVER show marker at raw GPS position when route is active
    // =============================================

    const hasActiveRoute = this.routePath && this.routePath.length >= 2;
    let finalRenderCoordinates: [number, number];

    if (hasActiveRoute) {
      // ========== ROUTE MODE: MANDATORY ROAD-ONLY RENDERING ==========
      // The marker MUST stay on the highlighted road at ALL times
      console.log(`[RENDER] 🛣️  Route active - MANDATORY road snap (NO GPS FALLBACK)`);

      // ALWAYS snap to route - NO EXCEPTIONS, NO GPS FALLBACK EVER
      const snappedPoint = this.findClosestPointOnRoute(longitude, latitude);

      if (snappedPoint) {
        // SUCCESS: Marker will render ON the road
        finalRenderCoordinates = snappedPoint;
        this.snappedPosition = snappedPoint;
        console.log(`[RENDER] ✅ Snap successful - marker ON ROAD at [${snappedPoint[0].toFixed(6)}, ${snappedPoint[1].toFixed(6)}]`);
      } else {
        // FAILURE: Cannot snap to route
        // CRITICAL: NEVER show marker off-road
        // Priority 1: Use last valid snapped position
        // Priority 2: Use route start point
        // Priority 3: Skip render entirely (marker stays invisible)
        if (this.snappedPosition) {
          finalRenderCoordinates = this.snappedPosition;
          console.log(`[RENDER] ⚠️ Snap failed - keeping marker at LAST SNAPPED position on road`);
        } else if (this.routePath.length > 0) {
          // Use route start as fallback - marker MUST be on road
          finalRenderCoordinates = this.routePath[0];
          this.snappedPosition = this.routePath[0];
          console.log(`[RENDER] ⚠️ Snap failed, no previous snap - placing marker at ROUTE START`);
        } else {
          console.log(`[RENDER] ❌ Cannot render - no route available. SKIPPING to prevent off-road marker`);
          return; // Skip entire render cycle - DO NOT show marker off-road
        }
      }
    } else {
      // ========== FREE MODE: No route - show actual GPS ==========
      // Only in free mode (no navigation) do we show actual GPS position
      console.log(`[RENDER] 📍 No route - showing actual GPS position`);
      finalRenderCoordinates = [longitude, latitude];
      this.snappedPosition = null;
    }

    // =============================================
    // PHASE 4: UPDATE STATE
    // All checks passed - update internal state
    // =============================================

    this.lastValidPosition = newPosition;
    this.previousPosition = this.currentPosition;
    this.currentPosition = newPosition;

    this.positionHistory.push(newPosition);
    if (this.positionHistory.length > this.maxHistoryLength) {
      this.positionHistory.shift();
    }

    // Record start position if not set
    if (!this.startPosition) {
      this.startPosition = finalRenderCoordinates;
    }

    // =============================================
    // PHASE 5: RENDER MARKER
    // GUARANTEED: finalRenderCoordinates is ALWAYS on road when route exists
    // =============================================

    console.log(`[RENDER] 🎯 Rendering marker at: [${finalRenderCoordinates[0].toFixed(6)}, ${finalRenderCoordinates[1].toFixed(6)}]`);
    this.updateMapFeatures(finalRenderCoordinates);

    // =============================================
    // PHASE 6: POST-RENDER UPDATES
    // Update UI, route progress, callbacks
    // =============================================

    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUIUpdateTime;
    const shouldDoFullUpdate = timeSinceLastUpdate >= this.minUpdateInterval;

    if (shouldDoFullUpdate) {
      // Immediate full update
      console.log(`[GPS] 📊 Full UI update (${timeSinceLastUpdate}ms since last)`);
      this.lastUIUpdateTime = now;

      // Check boundary
      this.checkBoundary();

      // Auto-follow if enabled
      if (this.options.autoFollow) {
        this.centerMapOnUser();
      }

      // Calculate route progress
      if (this.destinationPosition) {
        const progress = this.calculateRouteProgress();
        if (this.onRouteProgressUpdate) {
          this.onRouteProgressUpdate(progress);
        }
      }

      // Callback
      if (this.onPositionUpdate) {
        this.onPositionUpdate(newPosition);
      }
    } else {
      // DEBOUNCED heavy updates
      if (this.debounceTimer !== null) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = window.setTimeout(() => {
        console.log(`[GPS] ⏱️  Debounced update triggered`);

        this.checkBoundary();

        if (this.destinationPosition) {
          const progress = this.calculateRouteProgress();
          if (this.onRouteProgressUpdate) {
            this.onRouteProgressUpdate(progress);
          }
        }

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

    // ROBUST SEARCH: Check EVERY segment of the route
    for (let i = 0; i < this.routePath.length - 1; i++) {
      const segmentStart = this.routePath[i];
      const segmentEnd = this.routePath[i + 1];

      // Validate segment coordinates
      if (!segmentStart || !segmentEnd ||
          segmentStart.length !== 2 || segmentEnd.length !== 2) {
        console.log(`[SNAP] ⚠️ Invalid segment ${i} - skipping`);
        continue;
      }

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

    // VALIDATION: Ensure we found a valid snap point
    if (!closestPoint) {
      console.log(`[SNAP] ❌ CRITICAL: Failed to find snap point despite having ${this.routePath.length} route points`);
      return null;
    }

    // SUCCESS: Marker will render on road
    if (minDistance > 100) {
      console.log(`[SNAP] ⚠️ GPS far from route (${minDistance.toFixed(1)}m, segment ${closestSegmentIndex}) - but SNAPPING to keep marker on road`);
    } else if (minDistance > 50) {
      console.log(`[SNAP] 📍 Moderate snap distance: ${minDistance.toFixed(1)}m (segment ${closestSegmentIndex})`);
    } else {
      console.log(`[SNAP] ✅ Good snap: ${minDistance.toFixed(1)}m (segment ${closestSegmentIndex})`);
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
    const coords = fromLonLat(this.currentPosition.coordinates);

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
  // Route Management
  // =============================================

  public setRoute(path: [number, number][], destinationCoords?: [number, number]): void {
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

    if (validPath.length > 0) {
      // Validate destination coordinates
      let validDestination = destinationCoords;
      if (destinationCoords) {
        const [dLon, dLat] = destinationCoords;
        if (isNaN(dLon) || isNaN(dLat) || !isFinite(dLon) || !isFinite(dLat)) {
          console.warn(`[ROUTE] ⚠️ Invalid destination coords, using route end instead`);
          validDestination = validPath[validPath.length - 1];
        }
      }

      // Use provided destination coordinates if available (for POIs with nearest_node)
      // Otherwise use the last point in the route path
      this.destinationPosition = validDestination || validPath[validPath.length - 1];

      // Calculate total route distance
      this.totalRouteDistance = 0;
      for (let i = 0; i < validPath.length - 1; i++) {
        this.totalRouteDistance += calculateDistance(validPath[i], validPath[i + 1]);
      }

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

    // Debug logging for arrival detection
    if (distanceToDestination < 150) { // Log when getting close
      const positionType = this.snappedPosition ? 'marker (snapped)' : 'GPS';
      console.log(`[Arrival Detection] Distance from ${positionType} to destination: ${distanceToDestination.toFixed(1)}m`);
      if (distanceToDestination < 70) {
        console.log(`[Arrival Detection] ✓ ARRIVED! ${positionType} is ${distanceToDestination.toFixed(1)}m from destination (< 70m threshold)`);
      } else if (distanceToDestination < 120) {
        console.log(`[Arrival Detection] 👀 Almost there! ${distanceToDestination.toFixed(1)}m away (measuring from ${positionType})`);
      }
    }

    // Distance traveled (from start) - use marker position for consistency
    const distanceTraveled = this.startPosition
      ? calculateDistance(this.startPosition, userCoords)
      : 0;

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
