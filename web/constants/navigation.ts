/**
 * Navigation System Constants
 * Centralized configuration for GPS tracking, route calculation, and arrival detection
 */

/**
 * GPS Tracking Configuration
 */
export const GPS_CONSTANTS = {
  // Update intervals and debouncing
  DEBOUNCE_DELAY_MS: 2000, // Debounce delay between GPS updates
  ROTATION_DEBOUNCE_MS: 1500, // Debounce delay for compass rotation
  MIN_UPDATE_INTERVAL_MS: 1000, // Minimum time between UI updates

  // Movement and accuracy thresholds
  MIN_MOVEMENT_M: 5, // Minimum movement in meters to trigger update
  MAX_ACCURACY_M: 50, // Maximum GPS accuracy to accept (meters)

  // Distance thresholds
  ARRIVAL_DISTANCE_M: 3, // Distance to destination to trigger arrival (meters)
  MIN_PROGRESS_M: 20, // Minimum distance traveled before arrival can trigger
  OFF_ROUTE_THRESHOLD_M: 50, // Distance from route to consider user off-route

  // Dynamic movement thresholds based on proximity to destination
  CLOSE_PROXIMITY_M: 150, // Distance for high sensitivity
  MEDIUM_PROXIMITY_M: 500, // Distance for medium sensitivity
  CLOSE_THRESHOLD_M: 2, // Movement threshold when close to destination
  MEDIUM_THRESHOLD_M: 3, // Movement threshold at medium distance
  NORMAL_THRESHOLD_M: 5, // Movement threshold when far from destination

  // Timeouts
  GPS_TIMEOUT_MS: 20000, // Maximum time to wait for GPS (20 seconds)
  GPS_ACQUISITION_TIMEOUT_MS: 15000, // Timeout for initial GPS acquisition

  // Force update configuration
  FORCE_UPDATE_INTERVAL_MS: 5000, // Periodic force update interval near destination
  FORCE_UPDATE_DISTANCE_M: 150, // Distance threshold for force updates

  // GPS options
  MAXIMUM_AGE_MS: 2000, // Maximum age of cached GPS position
} as const;

/**
 * Route Calculation Configuration
 */
export const ROUTE_CONSTANTS = {
  // Waypoint configuration
  LOOK_AHEAD_DISTANCE_M: 15, // How far ahead to look for next waypoint
  NEXT_WAYPOINT_MIN_DISTANCE_M: 10, // Minimum distance for next waypoint

  // Road segment validation
  MIN_SEGMENT_LENGTH_M: 0.1, // Minimum valid segment length (meters)

  // Snapping configuration
  MAX_SNAP_DISTANCE_M: 100, // Maximum distance to snap to route

  // Road highlighting
  HIGHLIGHTED_ROAD_WIDTH: 8, // Width of highlighted route roads
  NORMAL_ROAD_WIDTH: 4, // Width of normal roads
} as const;

/**
 * QR Code Configuration
 */
export const QR_CONSTANTS = {
  // QR code capacity limits (QR Version 40-L)
  MAX_QR_CAPACITY_CHARS: 2953, // Maximum characters in QR code
  MAX_QR_SAFE_CAPACITY_CHARS: 2800, // Safe limit with margin

  // QR code generation options
  DEFAULT_WIDTH: 512, // Default QR code width in pixels
  DEFAULT_MARGIN: 2, // Default margin around QR code
  ERROR_CORRECTION_LEVEL: 'M' as const, // Error correction level (L, M, Q, H)
} as const;

/**
 * Map Configuration
 */
export const MAP_CONSTANTS = {
  // Zoom levels
  DEFAULT_ZOOM: 15, // Default map zoom level
  NAVIGATION_ZOOM: 19, // Zoom level during navigation
  MAX_ZOOM: 20, // Maximum zoom level
  MIN_ZOOM: 10, // Minimum zoom level

  // Map extent and boundaries
  EXTENT_PADDING_FACTOR: 3.0, // Multiplier for scrollable map extent
  BOUNDARY_BUFFER_M: 500, // Buffer around campus boundary (meters)

  // Retry configuration - OPTIMIZED to prevent UI blocking
  MAX_ROAD_LOAD_RETRIES: 5, // Maximum retries for road loading (reduced from 15)
  ROAD_LOAD_RETRY_BASE_DELAY_MS: 300, // Base delay for retry exponential backoff
  ROAD_LOAD_RETRY_MAX_DELAY_MS: 1000, // Maximum delay between retries (capped to prevent storm)

  // Source check configuration - OPTIMIZED to reduce wait time
  MAX_SOURCE_CHECK_ATTEMPTS: 20, // Maximum attempts to check if sources loaded (reduced from 30)
  SOURCE_CHECK_BASE_DELAY_MS: 300, // Base delay for source check
  SOURCE_CHECK_MAX_DELAY_MS: 1000, // Maximum delay for source checks
} as const;

/**
 * Arrival Detection Configuration
 */
export const ARRIVAL_CONSTANTS = {
  // Primary arrival detection
  PRIMARY_ARRIVAL_DISTANCE_M: 3, // Primary arrival threshold
  MIN_PROGRESS_BEFORE_ARRIVAL_M: 20, // Minimum travel distance before arrival

  // Failsafe arrival detection
  FAILSAFE_PROXIMITY_DISTANCE_M: 50, // Failsafe proximity threshold
  FAILSAFE_PROXIMITY_TIME_S: 30, // Time to stay in proximity for failsafe

  // Proximity warnings
  VERY_CLOSE_DISTANCE_M: 10, // Distance for "very close" warning
  APPROACHING_DISTANCE_M: 50, // Distance for "approaching" warning
  GETTING_CLOSE_DISTANCE_M: 150, // Distance for "getting close" warning
} as const;

/**
 * Animation Configuration
 */
export const ANIMATION_CONSTANTS = {
  // Smooth transitions
  MAP_ANIMATION_DURATION_MS: 500, // Duration for map animations
  MARKER_ANIMATION_DURATION_MS: 1000, // Duration for marker animations

  // Rotation
  ROTATION_SMOOTHING_FACTOR: 0.1, // Smoothing factor for rotation interpolation (0-1)
  BEARING_CHANGE_LOG_THRESHOLD_DEG: 5, // Minimum bearing change to log (degrees)
} as const;

/**
 * UI Configuration
 */
export const UI_CONSTANTS = {
  // Timeouts
  INITIALIZATION_TIMEOUT_MS: 30000, // Maximum time for initialization

  // Update intervals
  LOCATION_NODE_UPDATE_INTERVAL_MS: 3000, // Interval to update current location node

  // Padding
  MAP_VIEW_PADDING_PX: [20, 20, 20, 20] as const, // Padding for map view fitting
} as const;

/**
 * Development/Debug Configuration
 */
export const DEBUG_CONSTANTS = {
  // Logging
  ENABLE_VERBOSE_GPS_LOGGING: false, // Enable detailed GPS logging
  ENABLE_PERFORMANCE_LOGGING: false, // Enable performance timing logs
  ENABLE_ROUTE_LOGGING: true, // Enable route calculation logging
} as const;

/**
 * Type exports for type safety
 */
export type GPSConstants = typeof GPS_CONSTANTS;
export type RouteConstants = typeof ROUTE_CONSTANTS;
export type QRConstants = typeof QR_CONSTANTS;
export type MapConstants = typeof MAP_CONSTANTS;
export type ArrivalConstants = typeof ARRIVAL_CONSTANTS;
export type AnimationConstants = typeof ANIMATION_CONSTANTS;
export type UIConstants = typeof UI_CONSTANTS;
export type DebugConstants = typeof DEBUG_CONSTANTS;
