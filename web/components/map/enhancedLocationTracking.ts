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
        maximumAge: 500, // Ultra-responsive: updates every 0.5 seconds for smooth navigation
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
    console.log(`[GPS] 📍 Raw Position: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} | Accuracy: ${accuracy?.toFixed(1)}m | Speed: ${speed?.toFixed(2)}m/s`);

    // ========== GPS NOISE FILTERING ==========
    // Filter out unreliable GPS readings in low signal areas

    // 1. ACCURACY FILTER: Ignore readings with very poor accuracy
    if (accuracy && accuracy > this.maxAccuracyThreshold) {
      console.log(`[GPS] ⚠️ Ignoring position - accuracy ${accuracy.toFixed(0)}m > threshold ${this.maxAccuracyThreshold}m`);
      return; // Skip this update entirely
    }

    // 2. DISTANCE FILTER: Only update if moved more than threshold
    if (this.lastValidPosition) {
      const distance = this.calculateMovementDistance(
        this.lastValidPosition.coordinates,
        [longitude, latitude]
      );

      if (distance < this.minMovementThreshold) {
        console.log(`[GPS] ⏸️ Ignoring position - moved only ${distance.toFixed(1)}m < threshold ${this.minMovementThreshold}m`);
        return; // Skip this update - not enough movement
      }
      console.log(`[GPS] ✅ Position accepted - moved ${distance.toFixed(1)}m (threshold: ${this.minMovementThreshold}m)`);
    }

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

    // ========== SNAP TO ROAD NODE ==========
    // Snap marker to active route (if route exists)
    // This keeps the marker ON the highlighted path, not on random roads
    let displayCoordinates: [number, number] = [longitude, latitude];

    if (this.routePath && this.routePath.length >= 2) {
      // We have an active route - snap to it
      const snappedPoint = this.findClosestPointOnRoute(longitude, latitude);
      if (snappedPoint) {
        displayCoordinates = snappedPoint;
        this.snappedPosition = snappedPoint;
        // Logging is done inside findClosestPointOnRoute
      } else {
        // Too far from route (>50m) or no route - show actual GPS
        console.log(`[GPS] 📍 Using actual GPS position (not snapping)`);
        this.snappedPosition = null;
      }
    } else {
      // No active route - show actual GPS position
      console.log(`[GPS] 📍 No active route - using actual GPS position`);
      this.snappedPosition = null;
    }

    // Update last valid position (this one passed all filters)
    this.lastValidPosition = newPosition;

    // Update position history (IMMEDIATE - no debounce)
    this.previousPosition = this.currentPosition;
    this.currentPosition = newPosition;

    this.positionHistory.push(newPosition);
    if (this.positionHistory.length > this.maxHistoryLength) {
      this.positionHistory.shift();
    }

    // Record start position if not set
    if (!this.startPosition) {
      this.startPosition = displayCoordinates;
    }

    // CRITICAL FIX: ALWAYS update the map marker position IMMEDIATELY
    // The marker must move in real-time so the user sees their position updating
    // Use snapped coordinates for display
    this.updateMapFeatures(displayCoordinates);

    // Check if enough time has passed for full UI update (route progress, callbacks, etc.)
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUIUpdateTime;
    const shouldDoFullUpdate = timeSinceLastUpdate >= this.minUpdateInterval;

    if (shouldDoFullUpdate) {
      // Immediate full update (not debounced)
      console.log(`[GPS] 📍 Full UI update (${timeSinceLastUpdate}ms since last)`);
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
      // DEBOUNCED heavy updates - route recalculation, etc.
      // Clear existing debounce timer
      if (this.debounceTimer !== null) {
        clearTimeout(this.debounceTimer);
      }

      // Set new debounce timer for heavy operations
      this.debounceTimer = window.setTimeout(() => {
        console.log(`[GPS] ⏱️  Debounced heavy update triggered`);

        // Check boundary
        this.checkBoundary();

        // Calculate route progress
        if (this.destinationPosition) {
          const progress = this.calculateRouteProgress();
          if (this.onRouteProgressUpdate) {
            this.onRouteProgressUpdate(progress);
          }
        }

        // Callback for heavy operations only
        if (this.onPositionUpdate && this.currentPosition) {
          this.onPositionUpdate(this.currentPosition);
        }

        this.lastUIUpdateTime = Date.now();
        this.debounceTimer = null;
      }, this.debounceDelay);
    }

    // DEBOUNCED CAMERA ROTATION - Prevents jittery compass rotation from rapid heading changes
    if (effectiveHeading !== null && effectiveHeading !== undefined) {
      // Initialize targetHeading immediately on first position update (for instant rotation start)
      if (this.targetHeading === null) {
        this.targetHeading = effectiveHeading;
        console.log(`[GPS] 🧭 Initial heading set: ${effectiveHeading.toFixed(1)}°`);
      }

      // Clear existing rotation debounce timer
      if (this.rotationDebounceTimer !== null) {
        clearTimeout(this.rotationDebounceTimer);
      }

      // Set new rotation debounce timer for subsequent updates
      this.rotationDebounceTimer = window.setTimeout(() => {
        console.log(`[GPS] 🧭 Debounced rotation update triggered (heading: ${effectiveHeading?.toFixed(1)}°, delay: ${this.rotationDebounceDelay}ms)`);

        // Update target heading for smooth rotation animation
        this.targetHeading = effectiveHeading;

        // Clear timer reference
        this.rotationDebounceTimer = null;
      }, this.rotationDebounceDelay);
    }
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
   */
  private findClosestPointOnRoute(
    longitude: number,
    latitude: number
  ): [number, number] | null {
    // Only snap to route if we have an active route
    if (!this.routePath || this.routePath.length < 2) {
      return null; // No active route - don't snap
    }

    let closestPoint: [number, number] | null = null;
    let minDistance = Infinity;

    // Check each segment of the route path
    for (let i = 0; i < this.routePath.length - 1; i++) {
      const segmentStart = this.routePath[i];
      const segmentEnd = this.routePath[i + 1];

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
      }
    }

    // Only snap if GPS is within 50m of the route
    // If farther, user might be off-route - show actual GPS position
    const MAX_SNAP_DISTANCE = 50; // meters
    if (minDistance > MAX_SNAP_DISTANCE) {
      console.log(`[GPS Snap] ⚠️ Too far from route (${minDistance.toFixed(1)}m) - showing actual GPS`);
      return null;
    }

    if (closestPoint) {
      console.log(`[GPS Snap] 📍 Snapped to route (distance: ${minDistance.toFixed(1)}m)`);
    }

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

  // Update marker position with optional snapped coordinates
  private updateMapFeatures(displayCoordinates?: [number, number]): void {
    if (!this.currentPosition) return;

    // Use provided display coordinates (snapped) or raw GPS coordinates
    const coordsToUse = displayCoordinates || this.currentPosition.coordinates;
    const coords = fromLonLat(coordsToUse);
    console.log(`[GPS] 🎯 Marker updated at: [${coords[0].toFixed(2)}, ${coords[1].toFixed(2)}]`);

    // Update position marker
    this.userPositionFeature.setGeometry(new Point(coords));

    // Update accuracy circle
    this.accuracyFeature.setGeometry(
      new CircleGeometry(coords, this.currentPosition.accuracy)
    );

    // Update direction arrow
    this.directionArrowFeature.setGeometry(new Point(coords));

    // Refresh styles
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
    this.routePath = path;

    if (path.length > 0) {
      // Use provided destination coordinates if available (for POIs with nearest_node)
      // Otherwise use the last point in the route path
      this.destinationPosition = destinationCoords || path[path.length - 1];

      // Calculate total route distance
      this.totalRouteDistance = 0;
      for (let i = 0; i < path.length - 1; i++) {
        this.totalRouteDistance += calculateDistance(path[i], path[i + 1]);
      }
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

    const userCoords = this.currentPosition.coordinates;

    // Distance to destination
    const distanceToDestination = calculateDistance(
      userCoords,
      this.destinationPosition
    );

    // Debug logging for arrival detection
    if (distanceToDestination < 50) { // Only log when getting close
      console.log(`[Arrival Detection] Distance to destination: ${distanceToDestination.toFixed(1)}m`);
      if (distanceToDestination < 20) {
        console.log(`[Arrival Detection] ✓ ARRIVED! Distance is ${distanceToDestination.toFixed(1)}m (< 20m threshold)`);
      }
    }

    // Distance traveled (from start)
    const distanceTraveled = this.startPosition
      ? calculateDistance(this.startPosition, userCoords)
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

    // Find next waypoint
    let nextWaypoint: [number, number] | null = null;
    let minDistanceToWaypoint = Infinity;

    for (const waypoint of this.routePath) {
      const dist = calculateDistance(userCoords, waypoint);
      if (dist < minDistanceToWaypoint) {
        minDistanceToWaypoint = dist;
        nextWaypoint = waypoint;
      }
    }

    // Bearing to next waypoint
    const bearingToNextWaypoint = nextWaypoint
      ? calculateBearing(userCoords, nextWaypoint)
      : null;

    // Check if off route (more than 50m from any waypoint)
    const isOffRoute = minDistanceToWaypoint > 50;

    // Estimated time remaining (based on average walking speed 1.4 m/s)
    const walkingSpeed = this.currentPosition.speed || 1.4;
    const estimatedTimeRemaining = distanceToDestination / walkingSpeed;

    return {
      distanceToDestination,
      distanceTraveled,
      percentComplete,
      estimatedTimeRemaining,
      isOffRoute,
      distanceFromRoute: minDistanceToWaypoint,
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
