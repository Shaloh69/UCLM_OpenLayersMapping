import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoadNode } from "./roadSystem";

interface EnhancedDestinationSelectorProps {
  destinations: RoadNode[];
  onSelect: (destination: RoadNode) => void;
  onClose: () => void;
  categories?: string[];
}

const categoryIcons: Record<string, string> = {
  "Gates": "🚪",
  "Points of Interest": "📍",
  "Other": "📍",
};

const categoryColors: Record<string, string> = {
  "Gates": "from-emerald-500 to-teal-600",
  "Points of Interest": "from-blue-500 to-indigo-600",
  "Other": "from-gray-500 to-gray-600",
};

const EnhancedDestinationSelector: React.FC<EnhancedDestinationSelectorProps> = ({
  destinations,
  onSelect,
  onClose,
  categories = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredDestinations, setFilteredDestinations] = useState<RoadNode[]>(destinations);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Get unique categories
  const usedCategories = useMemo(() => {
    return categories.length > 0
      ? categories
      : Array.from(new Set(destinations.map((d) => d.category || "Other")));
  }, [categories, destinations]);

  // Filter destinations
  useEffect(() => {
    let filtered = destinations;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(query) ||
          (dest.description && dest.description.toLowerCase().includes(query)) ||
          (dest.category && dest.category.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((dest) => (dest.category || "Other") === selectedCategory);
    }

    setFilteredDestinations(filtered);
  }, [searchQuery, selectedCategory, destinations]);

  // Group destinations by category
  const destinationsByCategory = useMemo(() => {
    const result: Record<string, RoadNode[]> = {};
    usedCategories.forEach((category) => {
      result[category] = [];
    });
    filteredDestinations.forEach((dest) => {
      const category = dest.category || "Other";
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(dest);
    });
    return result;
  }, [filteredDestinations, usedCategories]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 'var(--z-modal)' }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 safe-area-inset-top safe-area-inset-bottom"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-7xl max-h-[90dvh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col landscape-compact"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <motion.h2
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-3xl sm:text-4xl font-bold text-white mb-2"
              >
                Where would you like to go?
              </motion.h2>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-white/90 text-sm sm:text-base"
              >
                Select your destination from {destinations.length} locations across campus
              </motion.p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base sm:text-lg outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-4 flex items-center"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === null
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                }`}
              >
                All
              </button>
              {usedCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                  className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                  }`}
                >
                  <span>{categoryIcons[category] || "📍"}</span>
                  <span>{category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredDestinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No destinations found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(destinationsByCategory).map(([category, dests]) => {
                if (dests.length === 0) return null;

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${categoryColors[category] || categoryColors.Other} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                        {categoryIcons[category] || "📍"}
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{category}</h3>
                        <p className="text-sm text-gray-600">{dests.length} location{dests.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {dests.map((destination, index) => (
                        <motion.button
                          key={destination.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSelect(destination)}
                          className="group relative bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-300 text-left overflow-hidden"
                        >
                          {/* Gradient Overlay on Hover */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[category] || categoryColors.Other} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <div className={`w-10 h-10 bg-gradient-to-br ${categoryColors[category] || categoryColors.Other} rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform`}>
                                {categoryIcons[category] || "📍"}
                              </div>
                              <div className="w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>

                            <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 line-clamp-2">
                              {destination.name}
                            </h4>

                            {destination.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {destination.description}
                              </p>
                            )}

                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-gray-500 font-medium">Available</span>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {filteredDestinations.length} of {destinations.length} shown
              </span>
            </div>
            {selectedCategory && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                <span className="text-sm font-medium text-blue-700">
                  Filtered by: {selectedCategory}
                </span>
                <button onClick={() => setSelectedCategory(null)} className="text-blue-600 hover:text-blue-800">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(EnhancedDestinationSelector);
