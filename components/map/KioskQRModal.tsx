import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoadNode } from "./roadSystem";

interface KioskQRModalProps {
  qrCodeUrl: string;
  destination: RoadNode;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
  };
  onClose: () => void;
  autoCloseTime?: number;
}

const KioskQRModal: React.FC<KioskQRModalProps> = ({
  qrCodeUrl,
  destination,
  routeInfo,
  onClose,
  autoCloseTime = 60,
}) => {
  const [countdown, setCountdown] = useState<number>(autoCloseTime);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose, autoCloseTime]);

  const formattedDistance = useMemo(() => {
    if (!routeInfo) return "Unknown";
    return routeInfo.distance < 1000
      ? `${Math.round(routeInfo.distance)}m`
      : `${(routeInfo.distance / 1000).toFixed(2)}km`;
  }, [routeInfo]);

  const formattedTime = useMemo(() => {
    if (!routeInfo) return "Unknown";
    const minutes = Math.ceil(routeInfo.estimatedTime);
    return minutes === 1 ? "1 min" : `${minutes} mins`;
  }, [routeInfo]);

  const calories = useMemo(() => {
    if (!routeInfo) return 0;
    return Math.round((routeInfo.distance / 1000) * 65);
  }, [routeInfo]);

  const progressPercent = ((autoCloseTime - countdown) / autoCloseTime) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-md"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden mx-4 relative"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <motion.h2
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-bold text-white mb-2"
                  >
                    Navigate to {destination.name}
                  </motion.h2>
                  {destination.category && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium"
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      {destination.category}
                    </motion.div>
                  )}
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="flex flex-col items-end"
                >
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-white font-semibold mb-2">
                    <div className="text-2xl">{countdown}s</div>
                    <div className="text-xs opacity-80">Auto-closing</div>
                  </div>
                </motion.div>
              </div>

              {destination.description && (
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/90 text-sm max-w-2xl"
                >
                  {destination.description}
                </motion.p>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* QR Code Section */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="relative group">
                  {/* Animated border */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>

                  {/* QR Code Container */}
                  <div className="relative bg-white p-6 rounded-2xl shadow-xl">
                    <motion.img
                      src={qrCodeUrl}
                      alt="Route QR Code"
                      className="w-full h-auto object-contain"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      onMouseEnter={() => setIsScanning(true)}
                      onMouseLeave={() => setIsScanning(false)}
                    />

                    {/* Scanning animation */}
                    <AnimatePresence>
                      {isScanning && (
                        <motion.div
                          initial={{ top: 0, opacity: 0 }}
                          animate={{ top: "100%", opacity: [0, 1, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Corner accents */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-2xl"></div>
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-2xl"></div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-pink-500 rounded-br-2xl"></div>
                </div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3"
                >
                  <p className="text-sm font-medium text-gray-700">
                    📱 Position your camera over the QR code
                  </p>
                </motion.div>
              </motion.div>

              {/* Instructions Section */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mr-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  Quick Start Guide
                </h3>

                <div className="space-y-3">
                  {[
                    { icon: "📱", title: "Open Camera", desc: "Launch your phone's camera app" },
                    { icon: "🎯", title: "Point & Scan", desc: "Aim at the QR code above" },
                    { icon: "🔔", title: "Tap Notification", desc: "Click the banner that appears" },
                    { icon: "🗺️", title: "Navigate", desc: "Follow live directions on your phone" }
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{step.title}</p>
                        <p className="text-sm text-gray-600">{step.desc}</p>
                      </div>
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm">
                        {index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl"
                >
                  <p className="text-sm text-amber-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <strong>Don't forget your phone!</strong> Keep it with you during navigation.
                  </p>
                </motion.div>
              </motion.div>
            </div>

            {/* Route Statistics */}
            {routeInfo && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 grid grid-cols-3 gap-4"
              >
                {[
                  { label: "Distance", value: formattedDistance, icon: "🏃", color: "from-blue-500 to-blue-600" },
                  { label: "Walking Time", value: formattedTime, icon: "⏱️", color: "from-purple-500 to-purple-600" },
                  { label: "Calories", value: `${calories} cal`, icon: "🔥", color: "from-pink-500 to-pink-600" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`bg-gradient-to-br ${stat.color} p-5 rounded-2xl text-white shadow-lg relative overflow-hidden group`}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                    <div className="relative z-10">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-xs opacity-90 mb-1">{stat.label}</div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 flex justify-between items-center border-t border-gray-200">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm text-gray-600 italic"
            >
              🔄 Map resets automatically for the next user
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              Close ({countdown}s)
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(KioskQRModal);
