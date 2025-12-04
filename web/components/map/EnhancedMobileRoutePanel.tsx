import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { RoadNode } from "./roadSystem";
import { RouteProgress } from "./enhancedLocationTracking";

interface EnhancedMobileRoutePanelProps {
  destination: RoadNode;
  currentLocation: RoadNode | null;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
  };
  routeProgress?: RouteProgress | null;
  onClose?: () => void;
  cameraFollowMode?: boolean; // New prop for camera follow indicator
}

const EnhancedMobileRoutePanel: React.FC<EnhancedMobileRoutePanelProps> = ({
  destination,
  currentLocation,
  routeInfo,
  routeProgress,
  onClose,
  cameraFollowMode = false,
}) => {
  const [showDirections, setShowDirections] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [dragY, setDragY] = useState(0);

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return "< 1 min";
    }
    const minutes = Math.ceil(seconds / 60);
    return minutes === 1 ? "1 min" : `${minutes} mins`;
  };

  const formatBearing = (degrees: number | null): string => {
    if (degrees === null) return "N";
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const etaTime = useMemo(() => {
    if (!routeProgress?.estimatedTimeRemaining) {
      return "";
    }
    const now = new Date();
    const eta = new Date(now.getTime() + routeProgress.estimatedTimeRemaining * 1000);
    return eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [routeProgress?.estimatedTimeRemaining]);

  const displayDistance = routeProgress?.distanceToDestination ?? routeInfo?.distance ?? 0;
  const displayTime = routeProgress?.estimatedTimeRemaining ?? (routeInfo?.estimatedTime ? routeInfo.estimatedTime * 60 : 0);
  const percentComplete = routeProgress?.percentComplete ?? 0;

  // Arrival detection: User has arrived when within 20 meters of destination
  // This threshold accounts for GPS accuracy (typically 5-50m) and ensures
  // the arrival message shows when user is genuinely near the destination
  const hasArrived = displayDistance < 20;

  const handleDrag = (_: any, info: PanInfo) => {
    setDragY(info.offset.y);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100 && onClose) {
      onClose();
    }
    setDragY(0);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 300 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 rounded-t-3xl max-h-[85vh] overflow-hidden"
      style={{
        boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Drag Handle */}
      <div className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          animate={{ scaleX: dragY > 0 ? 1.5 : 1 }}
          className="w-12 h-1.5 bg-gray-300 rounded-full"
        />
      </div>

      {/* Main Content */}
      <div className="px-4 pb-4 max-h-[calc(85vh-3rem)] overflow-y-auto">
        {/* Progress Bar */}
        {routeProgress && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, percentComplete)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </motion.div>
            </div>
            <div className="flex justify-between mt-2">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs font-semibold text-blue-600"
              >
                {percentComplete.toFixed(0)}% Complete
              </motion.span>
              {etaTime && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs font-semibold text-purple-600"
                >
                  ETA: {etaTime}
                </motion.span>
              )}
            </div>
          </motion.div>
        )}

        {/* Camera Follow Indicator */}
        {cameraFollowMode && !hasArrived && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-blue-700">
              Camera Following Your Position
            </span>
            <svg
              className="w-4 h-4 text-blue-500"
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
          </motion.div>
        )}

        {/* Arrival Celebration */}
        <AnimatePresence>
          {hasArrived && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="mb-4 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-400 rounded-2xl shadow-2xl overflow-hidden relative"
            >
              {/* Confetti background effect */}
              <div className="absolute inset-0 opacity-20">
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-full h-full bg-gradient-to-br from-yellow-200 via-green-200 to-blue-200"
                />
              </div>

              <div className="relative z-10 flex items-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-5xl mr-4"
                >
                  🎉
                </motion.div>
                <div className="flex-1">
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-green-900 mb-1"
                  >
                    You Have Arrived!
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-green-700"
                  >
                    Welcome to {destination.name} 🎯
                  </motion.p>
                </div>
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-4xl"
                >
                  ✅
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Off Route Warning */}
        <AnimatePresence>
          {!hasArrived && routeProgress?.isOffRoute && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-2xl flex items-center shadow-lg"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-3xl mr-3"
              >
                ⚠️
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-bold text-orange-900">
                  You're off the route!
                </p>
                <p className="text-xs text-orange-700">
                  {formatDistance(routeProgress.distanceFromRoute)} away from path
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Destination Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="flex items-center mb-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg mr-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {destination.name}
              </h2>
              {destination.category && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mt-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>
                  {destination.category}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Real-time Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-4"
        >
          {[
            { label: "Distance", value: formatDistance(displayDistance), icon: "🎯", gradient: "from-blue-500 to-blue-600", bgGradient: "from-blue-50 to-blue-100" },
            { label: "Time", value: formatTime(displayTime), icon: "⏱️", gradient: "from-purple-500 to-purple-600", bgGradient: "from-purple-50 to-purple-100" },
            { label: "Direction", value: formatBearing(routeProgress?.bearingToNextWaypoint ?? null), icon: "🧭", gradient: "from-pink-500 to-pink-600", bgGradient: "from-pink-50 to-pink-100" }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`bg-gradient-to-br ${metric.bgGradient} rounded-2xl p-4 shadow-md relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${metric.gradient} opacity-10 rounded-bl-full`}></div>
              <div className="relative z-10">
                <div className="text-2xl mb-1">{metric.icon}</div>
                <p className="text-xs text-gray-600 mb-1 font-medium">{metric.label}</p>
                <p className="text-lg font-bold text-gray-900">{metric.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Expanded Info */}
        <AnimatePresence>
          {isPanelExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 pt-4 mb-4 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Traveled", value: formatDistance(routeProgress?.distanceTraveled ?? 0), icon: "📍" },
                  { label: "Calories", value: `${Math.round(((routeProgress?.distanceTraveled ?? 0) / 1000) * 65)} cal`, icon: "🔥" },
                  { label: "Location", value: currentLocation?.name ?? "Locating...", icon: "📌" },
                  { label: "Next Point", value: formatDistance(routeProgress?.distanceToNextWaypoint ?? 0), icon: "➡️" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 shadow-sm"
                  >
                    <div className="flex items-center mb-1">
                      <span className="text-lg mr-2">{stat.icon}</span>
                      <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                    </div>
                    <p className="font-bold text-gray-900 truncate">{stat.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDirections(!showDirections)}
            className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all shadow-md ${
              showDirections
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {showDirections ? "Hide" : "Show"} Steps
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold shadow-md"
          >
            <svg className={`w-6 h-6 transition-transform ${isPanelExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>

          {onClose && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>

        {/* Step-by-Step Directions */}
        <AnimatePresence>
          {showDirections && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 pt-4 overflow-hidden"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mr-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Navigation Steps</h3>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {[
                  { step: 1, title: `Start at ${currentLocation?.name ?? "current location"}`, desc: `Head ${formatBearing(routeProgress?.bearingToNextWaypoint ?? null)} toward ${destination.name}`, icon: "🟢", color: "green" },
                  { step: 2, title: "Follow the highlighted path", desc: routeProgress?.isOffRoute ? "⚠️ Return to the marked route" : `Continue for ${formatDistance(displayDistance * 0.6)}`, icon: "🔵", color: "blue" },
                  { step: 3, title: `Arrive at ${destination.name}`, desc: destination.description ?? "Your destination", icon: "🔴", color: "red" }
                ].map((navStep, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start p-4 bg-gradient-to-r from-${navStep.color}-50 to-${navStep.color}-100 rounded-2xl shadow-sm border border-${navStep.color}-200`}
                  >
                    <div className="text-3xl mr-3">{navStep.icon}</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">{navStep.title}</p>
                      <p className="text-sm text-gray-700">{navStep.desc}</p>
                    </div>
                    <div className={`w-8 h-8 bg-${navStep.color}-500 rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
                      {navStep.step}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Indicator */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute top-6 right-4 flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
      >
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-2 h-2 bg-white rounded-full mr-2"
        />
        LIVE
      </motion.div>
    </motion.div>
  );
};

export default EnhancedMobileRoutePanel;
