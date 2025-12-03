import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoadNode } from "./roadSystem";

interface CompactDestinationSelectorProps {
  destinations: RoadNode[];
  onSelect: (destination: RoadNode) => void;
  onClose: () => void;
  categories?: string[];
}

const categoryIcons: Record<string, string> = {
  Gates: "🚪",
  "Main Buildings": "🏛️",
  Maritime: "⚓",
  Business: "💼",
  Facilities: "🏢",
  "Sports Facilities": "⚽",
  Stairs: "🪜",
  Other: "📍",
};

const CompactDestinationSelector: React.FC<
  CompactDestinationSelectorProps
> = ({ destinations, onSelect, onClose, categories = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredDestinations, setFilteredDestinations] =
    useState<RoadNode[]>(destinations);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

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
      filtered = filtered.filter(
        (dest) => (dest.category || "Other") === selectedCategory
      );
    }

    setFilteredDestinations(filtered);
  }, [searchQuery, selectedCategory, destinations]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-start justify-center pt-4 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
              🗺️
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Choose Destination
              </h2>
              <p className="text-xs text-white/80">
                {destinations.length} locations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        {/* Search and Filters */}
        <div className="p-3 border-b border-gray-200 bg-gray-50 space-y-2">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                <svg
                  className="w-4 h-4 text-gray-400 hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              All
            </button>
            {usedCategories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(
                    category === selectedCategory ? null : category
                  )
                }
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span>{categoryIcons[category] || "📍"}</span>
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Destinations List */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredDestinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                No destinations found
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Try adjusting your search
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredDestinations.map((destination, index) => (
                <motion.button
                  key={destination.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(destination)}
                  className="group relative bg-white hover:bg-blue-50 rounded-xl p-3 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-blue-300 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {categoryIcons[destination.category || "Other"] || "📍"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {destination.name}
                      </h4>
                      {destination.category && (
                        <p className="text-xs text-gray-500 mb-1">
                          {destination.category}
                        </p>
                      )}
                      {destination.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {destination.description}
                        </p>
                      )}
                    </div>
                    <div className="w-6 h-6 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 transition-colors">
                      <svg
                        className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-600">
          <span>
            Showing {filteredDestinations.length} of {destinations.length}
          </span>
          {selectedCategory && (
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">
                {selectedCategory}
              </span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(CompactDestinationSelector);
