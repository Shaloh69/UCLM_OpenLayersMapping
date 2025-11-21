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
    schoolBoundaryRef: MutableRefObject<Extent | null>
  ) {
    this.map = map;
    this.locationErrorRef = locationErrorRef;
    this.isOutsideSchoolRef = isOutsideSchoolRef;
    this.schoolBoundaryRef = schoolBoundaryRef;

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
    this.onPositionUpdate = onPositionUpdate;
    this.onRouteProgressUpdate = onRouteProgressUpdate;

    if (this.watchId !== null) {
      return;
    }


    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handlePositionError(error),
      {
        enableHighAccuracy: true,
        maximumAge: 1000, // More frequent updates for mobile
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
  }

  private handlePositionUpdate(geoPosition: GeolocationPosition): void {
    const { latitude, longitude, accuracy, heading, speed } = geoPosition.coords;

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

    // Update position history
    this.previousPosition = this.currentPosition;
    this.currentPosition = newPosition;

    this.positionHistory.push(newPosition);
    if (this.positionHistory.length > this.maxHistoryLength) {
      this.positionHistory.shift();
    }

    // Record start position if not set
    if (!this.startPosition) {
      this.startPosition = [longitude, latitude];
    }

    // Update map features
    this.updateMapFeatures();

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

      `Position updated: [${longitude.toFixed(6)}, ${latitude.toFixed(6)}], accuracy: ${Math.round(accuracy)}m, heading: ${effectiveHeading ? Math.round(effectiveHeading) : "N/A"}°`
    );
  }

  private handlePositionError(error: GeolocationPositionError): void {
    const errorMsg = `Location error: ${error.message}`;
    this.locationErrorRef.current = errorMsg;
  }

  private updateMapFeatures(): void {
    if (!this.currentPosition) return;

    const coords = fromLonLat(this.currentPosition.coordinates);

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
    if (!this.currentPosition || !this.schoolBoundaryRef.current) return;

    const coords = fromLonLat(this.currentPosition.coordinates);
    const isOutside = !isCoordinateInsideSchool(
      coords,
      this.schoolBoundaryRef.current
    );

    if (isOutside !== this.isOutsideSchoolRef.current) {
      this.isOutsideSchoolRef.current = isOutside;
      if (isOutside) {
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
      if (
        this.options.rotateMap &&
        this.currentPosition?.heading !== null &&
        this.currentPosition?.heading !== undefined
      ) {
        // Smooth rotation interpolation
        const targetRotation = -((this.currentPosition.heading * Math.PI) / 180);
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

  public setRoute(path: [number, number][]): void {
    this.routePath = path;

    if (path.length > 0) {
      this.destinationPosition = path[path.length - 1];

      // Calculate total route distance
      this.totalRouteDistance = 0;
      for (let i = 0; i < path.length - 1; i++) {
        this.totalRouteDistance += calculateDistance(path[i], path[i + 1]);
      }

        `Route set: ${path.length} waypoints, ${Math.round(this.totalRouteDistance)}m total distance`
      );
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

  public getCurrentPosition(): UserPosition | null {
    return this.currentPosition;
  }

  public getPositionHistory(): UserPosition[] {
    return [...this.positionHistory];
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
  schoolBoundaryRef: MutableRefObject<Extent | null>
): EnhancedLocationTracker => {
  return new EnhancedLocationTracker(
    map,
    options,
    locationErrorRef,
    isOutsideSchoolRef,
    schoolBoundaryRef
  );
};
