/**
 * Modern Mobile Navigation UI
 * Redesigned from scratch with proper state management
 * Prevents bugs where modals disappear permanently
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadNode } from './roadSystem';
import { RouteProgress } from './enhancedLocationTracking';

type PanelState = 'hidden' | 'minimized' | 'expanded';

interface ModernMobileNavUIProps {
  destination: RoadNode;
  currentLocation: RoadNode | null;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
  };
  routeProgress?: RouteProgress | null;
  cameraFollowMode: boolean;
  onToggleCameraFollow: () => void;
  onClearRoute: () => void;
}

const ModernMobileNavUI: React.FC<ModernMobileNavUIProps> = ({
  destination,
  currentLocation,
  routeInfo,
  routeProgress,
  cameraFollowMode,
  onToggleCameraFollow,
  onClearRoute,
}) => {
  // Default to minimized so progress info is always visible during navigation
  // NEVER set to 'hidden' to ensure footer is always accessible
  const [panelState, setPanelState] = useState<PanelState>('minimized');
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showEndRouteConfirm, setShowEndRouteConfirm] = useState(false);

  // PRIORITY 1: Multi-criteria arrival detection state
  const [lastCloseTime, setLastCloseTime] = useState<number | null>(null);
  const [proximityTimer, setProximityTimer] = useState<number>(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return '< 1 min';
    }
    const minutes = Math.ceil(seconds / 60);
    return minutes === 1 ? '1 min' : `${minutes} mins`;
  };

  // Calculate ETA
  const getETA = (): string => {
    const seconds = routeProgress?.estimatedTimeRemaining ??
                   (routeInfo?.estimatedTime ? routeInfo.estimatedTime * 60 : 0);
    const now = new Date();
    const eta = new Date(now.getTime() + seconds * 1000);
    return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const displayDistance = routeProgress?.distanceToDestination ?? routeInfo?.distance ?? 0;
  const displayTime = routeProgress?.estimatedTimeRemaining ??
                     (routeInfo?.estimatedTime ? routeInfo.estimatedTime * 60 : 0);
  const percentComplete = routeProgress?.percentComplete ?? 0;

  // PRIORITY 4: Snap distance indicator - shows when GPS is far from route
  const snapDistance = routeProgress?.distanceFromRoute ?? 0;
  const isOffRoute = snapDistance > 50; // More than 50m from route
  const isNearlyOffRoute = snapDistance > 25 && snapDistance <= 50;

  // Track last update time for staleness detection
  useEffect(() => {
    if (displayDistance > 0) {
      setLastUpdateTime(Date.now());
    }
  }, [displayDistance]);

  // Calculate staleness indicator
  const secondsSinceUpdate = Math.floor((Date.now() - lastUpdateTime) / 1000);
  const isStale = secondsSinceUpdate > 10;

  // PRIORITY 1: Track time spent near destination for failsafe arrival detection
  useEffect(() => {
    if (displayDistance < 100 && displayDistance > 0) {
      // User is within 100m of destination - start/continue proximity timer
      if (lastCloseTime === null) {
        setLastCloseTime(Date.now());
        console.log('[Arrival Failsafe] 📍 User entered 100m proximity zone - starting timer');
      }
      const elapsed = Math.floor((Date.now() - (lastCloseTime || Date.now())) / 1000);
      setProximityTimer(elapsed);

      if (elapsed > 0 && elapsed % 5 === 0) { // Log every 5 seconds
        console.log(`[Arrival Failsafe] ⏱️  User has been within 100m for ${elapsed}s`);
      }
    } else {
      // User is far from destination - reset timer
      if (lastCloseTime !== null) {
        console.log('[Arrival Failsafe] 📍 User exited 100m proximity zone - resetting timer');
      }
      setLastCloseTime(null);
      setProximityTimer(0);
    }
  }, [displayDistance, lastCloseTime]);

  // PRIORITY 1: Multi-criteria arrival detection with failsafes
  // Triggers on ANY of these conditions:
  // 1. Primary: Within 70m of destination
  // 2. Failsafe A: Within 100m for 30+ seconds (user stopped moving)
  // 3. Failsafe B: Route 95%+ complete (GPS inaccurate but route nearly done)
  const hasArrived = useMemo(() => {
    const isVeryClose = displayDistance < 70; // Primary detection
    const isCloseEnough = displayDistance < 100;
    const hasBeenCloseForAWhile = proximityTimer >= 30; // 30 seconds failsafe
    const isAlmostComplete = percentComplete >= 95; // 95% completion failsafe

    const arrivalCriteria = {
      distance: isVeryClose,
      proximity: isCloseEnough && hasBeenCloseForAWhile,
      completion: isAlmostComplete,
    };

    const arrived = isVeryClose || (isCloseEnough && hasBeenCloseForAWhile) || isAlmostComplete;

    // Enhanced logging with criteria breakdown
    if (displayDistance > 0 && displayDistance < 150) {
      const criteriaStatus = `Distance: ${isVeryClose ? '✓' : '✗'} (${displayDistance.toFixed(1)}m < 70m) | ` +
                            `Proximity: ${arrivalCriteria.proximity ? '✓' : '✗'} (${isCloseEnough ? 'in range' : 'out of range'}, ${proximityTimer}s/30s) | ` +
                            `Completion: ${arrivalCriteria.completion ? '✓' : '✗'} (${percentComplete.toFixed(1)}%/95%)`;
      console.log(`[Arrival Detection] ${criteriaStatus}`);
    }

    if (arrived) {
      const triggeredBy = isVeryClose ? 'Distance < 70m' :
                         arrivalCriteria.proximity ? `Proximity (${proximityTimer}s at < 100m)` :
                         'Route completion (95%+)';
      console.log(`[Arrival Detection] 🎉 ARRIVAL DETECTED! Triggered by: ${triggeredBy}`);
    }

    return arrived;
  }, [displayDistance, proximityTimer, percentComplete]);

  // Debug logging for arrival detection
  useEffect(() => {
    if (displayDistance > 0 && displayDistance < 150) {
      console.log(`[UI] Distance to destination: ${displayDistance.toFixed(1)}m | Arrived: ${hasArrived} | Update age: ${secondsSinceUpdate}s`);
    }
  }, [displayDistance, hasArrived, secondsSinceUpdate]);

  // Show "getting close" indicator when within 70-120m but not yet arrived
  const isGettingClose = displayDistance >= 70 && displayDistance < 120;

  // CRITICAL: Ensure footer is ALWAYS visible during navigation
  // Reset from 'hidden' to 'minimized' if panel somehow gets hidden
  useEffect(() => {
    if (panelState === 'hidden') {
      console.warn('[ModernMobileNavUI] Panel was hidden during active navigation - forcing to minimized state');
      setPanelState('minimized');
    }
  }, [panelState]);

  // Auto-expand panel and show additional info on arrival
  useEffect(() => {
    if (hasArrived) {
      // CRITICAL: Auto-expand panel so user SEES the arrival celebration
      setPanelState('expanded');

      if (destination.additionalDirections) {
        setShowAdditionalInfo(true);
      }
    }
  }, [hasArrived, destination.additionalDirections]);

  // Restore Panel Button (shows when hidden)
  const RestoreButton = () => (
    <AnimatePresence>
      {panelState === 'hidden' && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={() => setPanelState('minimized')}
          style={{ zIndex: 'var(--z-panels)' }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2
                     bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl
                     flex items-center gap-2 hover:bg-blue-700 active:scale-95
                     transition-all safe-area-inset-bottom"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span className="font-semibold">Show Navigation</span>
        </motion.button>
      )}
    </AnimatePresence>
  );

  // Minimized Bottom Bar
  const MinimizedBar = () => (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ zIndex: 'var(--z-panels)' }}
      className={`fixed bottom-0 left-0 right-0 shadow-2xl
                 border-t-4 safe-area-inset-bottom landscape-compact ${
                   hasArrived
                     ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500'
                     : 'bg-white border-blue-500'
                 }`}
    >
      <div className="px-4 py-3">
        {/* ARRIVAL CELEBRATION - ALWAYS VISIBLE IN MINIMIZED MODE */}
        {hasArrived && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="mb-3 p-4 bg-gradient-to-br from-green-400 to-emerald-500
                       rounded-2xl shadow-lg cursor-pointer"
            onClick={() => setPanelState('expanded')}
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl animate-bounce">🎉</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">
                  You've Arrived!
                </h3>
                <p className="text-sm text-green-50">
                  Welcome to {destination.name}
                </p>
              </div>
              <span className="text-3xl text-white">✓</span>
            </div>
            {destination.additionalDirections && (
              <p className="text-xs text-green-50 mt-2 flex items-center gap-1">
                <span>👆</span>
                Tap to see walking directions
              </p>
            )}
          </motion.div>
        )}

        {/* PRIORITY 4: Snap Distance Warning - Shows when GPS is far from route */}
        {!hasArrived && snapDistance > 10 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-3 px-3 py-2 rounded-lg flex items-center gap-2 text-xs ${
              isOffRoute
                ? 'bg-red-50 border border-red-200 text-red-700'
                : isNearlyOffRoute
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <span className="font-semibold">
                {isOffRoute ? 'Off route' : isNearlyOffRoute ? 'Drifting from route' : 'GPS adjusting'}
              </span>
              <span className="ml-1">• {snapDistance.toFixed(0)}m from path</span>
            </div>
          </motion.div>
        )}

        {/* Swipe indicator - Touch-optimized with 44px minimum tap target */}
        <div
          className="touch-target-drag-handle w-full mb-2"
          onClick={() => setPanelState('expanded')}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
        </div>

        <div className="flex items-center justify-between">
          {/* Left: Destination Info */}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => setPanelState('expanded')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📍</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 font-medium">Navigating to</p>
                <p className="text-sm font-bold text-gray-900 truncate responsive-text-base">
                  {destination.name}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">
                {formatDistance(displayDistance)}
              </p>
              <p className="text-xs text-gray-500">{formatTime(displayTime)}</p>
            </div>

            {/* Minimize Button - Changed to only minimize, NOT hide completely */}
            {/* This ensures progress UI is ALWAYS visible during navigation */}
            <button
              onClick={() => setPanelState('minimized')}
              title="Minimize (progress stays visible)"
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center
                       hover:bg-gray-200 active:scale-95 transition-all"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {routeProgress && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, percentComplete)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                {percentComplete.toFixed(0)}% complete
              </span>
              <span className="text-xs text-gray-500">ETA: {getETA()}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Expanded Panel
  const ExpandedPanel = () => (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ zIndex: 'var(--z-panels)' }}
      className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl
                 rounded-t-3xl max-h-[80dvh] overflow-hidden safe-area-inset-bottom landscape-compact"
    >
      {/* Drag Handle - Touch-optimized with 44px minimum tap target */}
      <div
        className="w-full touch-target-drag-handle bg-gray-50"
        onClick={() => setPanelState('minimized')}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* Content */}
      <div className="px-4 pb-6 max-h-[calc(80dvh-3rem)] overflow-y-auto custom-scrollbar landscape-minimize-padding">
        {/* Getting Close Indicator */}
        {isGettingClose && !hasArrived && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 p-4 bg-gradient-to-br from-yellow-50 to-amber-50
                       border-2 border-yellow-400 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">👀</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900">
                  Almost There!
                </h3>
                <p className="text-sm text-yellow-700">
                  Just {formatDistance(displayDistance)} away
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Arrival Celebration */}
        {hasArrived && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50
                       border-2 border-green-400 rounded-2xl"
          >
            <div className="flex items-center gap-4">
              <span className="text-5xl animate-bounce">🎉</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900">
                  You've Arrived!
                </h3>
                <p className="text-sm text-green-700">
                  Welcome to {destination.name}
                </p>
              </div>
              <span className="text-4xl">✓</span>
            </div>
          </motion.div>
        )}

        {/* Camera Follow Indicator */}
        {cameraFollowMode && !hasArrived && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 px-3 py-2 bg-blue-50
                       border border-blue-200 rounded-lg"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-blue-700 flex-1">
              Camera Following Your Position
            </span>
            <button
              onClick={onToggleCameraFollow}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Stop
            </button>
          </motion.div>
        )}

        {/* Main Navigation Info */}
        <div className="mb-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500
                           rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              📍
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-1">
                Destination
              </p>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {destination.name}
              </h2>
              {destination.description && (
                <p className="text-sm text-gray-600">{destination.description}</p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">Distance</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatDistance(displayDistance)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-600 font-medium mb-1">Time</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatTime(displayTime)}
              </p>
            </div>
          </div>

          {/* Progress */}
          {routeProgress && !hasArrived && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span className="font-semibold">Progress</span>
                <span>{percentComplete.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, percentComplete)}%` }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="h-full w-full bg-white/30 animate-pulse" />
                </motion.div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Started</span>
                <span>ETA: {getETA()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Additional Directions */}
        {destination.additionalDirections && (
          <motion.div
            layout
            className="mb-4 bg-amber-50 border-2 border-amber-200 rounded-xl p-4"
          >
            <button
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <span className="font-semibold text-gray-900">
                  Walking Directions
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  showAdditionalInfo ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <AnimatePresence>
              {showAdditionalInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 text-sm text-gray-700 leading-relaxed pl-7">
                    {destination.additionalDirections}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onToggleCameraFollow}
            className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all
                       flex items-center justify-center gap-2 ${
              cameraFollowMode
                ? 'bg-blue-500 text-white active:bg-blue-600'
                : 'bg-gray-100 text-gray-700 active:bg-gray-200'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {cameraFollowMode ? 'Following' : 'Follow Me'}
          </button>

          <button
            onClick={() => setShowEndRouteConfirm(true)}
            className="py-3 px-4 bg-red-50 text-red-600 rounded-xl font-semibold
                       text-sm hover:bg-red-100 active:bg-red-200 transition-all
                       flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            End Route
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Full-Screen Arrival Overlay (appears briefly on arrival for maximum visibility)
  const [showArrivalOverlay, setShowArrivalOverlay] = useState(false);

  // Show arrival overlay briefly when user arrives
  useEffect(() => {
    if (hasArrived && !showArrivalOverlay) {
      setShowArrivalOverlay(true);
      // Auto-hide after 3 seconds (panel remains expanded with full info)
      setTimeout(() => setShowArrivalOverlay(false), 3000);
    }
  }, [hasArrived]);

  return (
    <>
      {/* END ROUTE CONFIRMATION MODAL - Custom mobile-friendly dialog */}
      <AnimatePresence>
        {showEndRouteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 'var(--z-critical-modal)' }}
            className="fixed inset-0 flex items-center justify-center
                       bg-black bg-opacity-50 backdrop-blur-sm px-4"
            onClick={() => setShowEndRouteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  End Navigation?
                </h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to stop navigating to{' '}
                  <span className="font-semibold">{destination.name}</span>?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndRouteConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl
                           font-semibold hover:bg-gray-200 active:scale-95 transition-all"
                >
                  Keep Going
                </button>
                <button
                  onClick={() => {
                    setShowEndRouteConfirm(false);
                    onClearRoute();
                    // Don't hide panel - component will unmount when route clears
                  }}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl
                           font-semibold hover:bg-red-600 active:scale-95 transition-all"
                >
                  End Route
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN ARRIVAL OVERLAY - IMPOSSIBLE TO MISS */}
      <AnimatePresence>
        {showArrivalOverlay && hasArrived && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ zIndex: 'var(--z-arrival-overlay)' }}
            className="fixed inset-0 flex items-center justify-center
                       bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowArrivalOverlay(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="mx-4 max-w-md w-full bg-gradient-to-br from-green-400 to-emerald-500
                         rounded-3xl shadow-2xl p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
              >
                <span className="text-8xl block mb-4">🎉</span>
              </motion.div>

              <h1 className="text-3xl font-bold text-white mb-2">
                You've Arrived!
              </h1>

              <p className="text-xl text-green-50 mb-6">
                Welcome to<br />
                <span className="font-bold">{destination.name}</span>
              </p>

              {destination.additionalDirections && (
                <div className="bg-white bg-opacity-20 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-white font-medium mb-2">
                    📍 Walking Directions:
                  </p>
                  <p className="text-sm text-green-50">
                    {destination.additionalDirections}
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowArrivalOverlay(false)}
                className="w-full bg-white text-green-600 font-bold py-3 px-6 rounded-xl
                         hover:bg-green-50 active:scale-95 transition-all shadow-lg"
              >
                Got it! ✓
              </button>

              <p className="text-xs text-green-100 mt-3">
                Tap anywhere to dismiss
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RestoreButton />
      <AnimatePresence mode="wait">
        {panelState === 'minimized' && <MinimizedBar key="minimized" />}
        {panelState === 'expanded' && <ExpandedPanel key="expanded" />}
      </AnimatePresence>
    </>
  );
};

export default ModernMobileNavUI;
