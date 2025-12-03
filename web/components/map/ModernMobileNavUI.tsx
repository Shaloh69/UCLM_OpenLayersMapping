/**
 * Modern Mobile Navigation UI
 * Redesigned from scratch with proper state management
 * Prevents bugs where modals disappear permanently
 */

import React, { useState, useEffect } from 'react';
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
  const [panelState, setPanelState] = useState<PanelState>('expanded');
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

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
  const hasArrived = displayDistance < 20;

  // Auto-show additional info on arrival
  useEffect(() => {
    if (hasArrived && destination.additionalDirections) {
      setShowAdditionalInfo(true);
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
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50
                     bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl
                     flex items-center gap-2 hover:bg-blue-700 active:scale-95
                     transition-all"
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
      className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50
                 border-t-4 border-blue-500"
    >
      <div className="px-4 py-3">
        {/* Swipe indicator */}
        <div
          className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3 cursor-pointer"
          onClick={() => setPanelState('expanded')}
        />

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
              <div>
                <p className="text-xs text-gray-500 font-medium">Navigating to</p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[180px]">
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

            {/* Minimize Button */}
            <button
              onClick={() => setPanelState('hidden')}
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
                  d="M6 18L18 6M6 6l12 12"
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
      className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50
                 rounded-t-3xl max-h-[80vh] overflow-hidden"
    >
      {/* Drag Handle */}
      <div
        className="w-full flex justify-center py-3 cursor-pointer bg-gray-50"
        onClick={() => setPanelState('minimized')}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* Content */}
      <div className="px-4 pb-6 max-h-[calc(80vh-3rem)] overflow-y-auto">
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
            onClick={() => {
              if (confirm('End navigation?')) {
                onClearRoute();
                setPanelState('hidden');
              }
            }}
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

  return (
    <>
      <RestoreButton />
      <AnimatePresence mode="wait">
        {panelState === 'minimized' && <MinimizedBar key="minimized" />}
        {panelState === 'expanded' && <ExpandedPanel key="expanded" />}
      </AnimatePresence>
    </>
  );
};

export default ModernMobileNavUI;
