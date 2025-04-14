import React, { useState, useEffect, useMemo, useCallback } from "react";
import { RoadNode } from "./roadSystem";

interface DestinationSelectorProps {
  destinations: RoadNode[];
  onSelect: (destination: RoadNode) => void;
  onClose: () => void;
  categories?: string[];
}

interface CategoryGroupProps {
  category: string;
  destinations: RoadNode[];
  onSelect: (destination: RoadNode) => void;
}

// CategoryGroup component wrapped in React.memo for performance
const CategoryGroup: React.FC<CategoryGroupProps> = React.memo(
  ({ category, destinations, onSelect }) => {
    const [expanded, setExpanded] = useState(true);

    // Skip rendering empty categories
    if (destinations.length === 0) {
      return null;
    }

    // Memoize the toggle function
    const toggleExpanded = useCallback(() => {
      setExpanded((prev) => !prev);
    }, []);

    return (
      <div className="mb-4">
        <div
          className="flex items-center justify-between bg-gray-100 p-2 rounded-t cursor-pointer"
          onClick={toggleExpanded}
        >
          <h3 className="font-medium">
            {category} ({destinations.length})
          </h3>
          <span>{expanded ? "▼" : "►"}</span>
        </div>

        {expanded && (
          <div className="pl-2 border-l-2 border-gray-200">
            {destinations.map((destination) => (
              <div
                key={destination.id}
                className="p-2 hover:bg-gray-50 cursor-pointer flex items-center"
                onClick={() => onSelect(destination)}
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>{destination.name}</span>
                {destination.description && (
                  <span className="ml-1 text-xs text-gray-500">
                    {" "}
                    - {destination.description.substring(0, 30)}
                    {destination.description.length > 30 ? "..." : ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

// Set display name for React DevTools
CategoryGroup.displayName = "CategoryGroup";

const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  destinations,
  onSelect,
  onClose,
  categories = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDestinations, setFilteredDestinations] =
    useState<RoadNode[]>(destinations);

  // Memoize the search handler to prevent recreating it on every render
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // Filter destinations based on search query - memoized
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDestinations(destinations);

      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = destinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(query) ||
        (dest.description && dest.description.toLowerCase().includes(query)) ||
        (dest.category && dest.category.toLowerCase().includes(query))
    );

    setFilteredDestinations(filtered);
  }, [searchQuery, destinations]);

  // Make sure we have the latest destinations
  useEffect(() => {
    setFilteredDestinations(destinations);
  }, [destinations]);

  // Memoize the used categories
  const usedCategories = useMemo(() => {
    return categories.length > 0
      ? categories
      : Array.from(new Set(destinations.map((d) => d.category || "Other")));
  }, [categories, destinations]);

  // Memoize the destinations grouped by category
  const destinationsByCategory = useMemo(() => {
    const result: Record<string, RoadNode[]> = {};

    // Initialize empty arrays for each category
    usedCategories.forEach((category) => {
      result[category] = [];
    });

    // Fill with filtered destinations
    filteredDestinations.forEach((dest) => {
      const category = dest.category || "Other";
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(dest);
    });

    return result;
  }, [filteredDestinations, usedCategories]);

  // Memoize the empty state component
  const EmptyState = useMemo(() => {
    if (destinations.length === 0) {
      return (
        <div className="text-center py-4 bg-yellow-100 rounded-lg">
          <p className="font-medium text-yellow-800">No destinations loaded</p>
          <p className="text-sm text-yellow-700 mt-1">
            Please check your data files or refresh the page.
          </p>
        </div>
      );
    }
    return null;
  }, [destinations.length]);

  // Memoize the no results component
  const NoResults = useMemo(() => {
    if (
      filteredDestinations.length === 0 &&
      destinations.length > 0 &&
      searchQuery.trim() !== ""
    ) {
      return (
        <div className="text-center text-gray-500 py-4">
          No destinations found for "{searchQuery}"
        </div>
      );
    }
    return null;
  }, [filteredDestinations.length, destinations.length, searchQuery]);

  // Memoize the category groups
  const CategoryGroups = useMemo(() => {
    return Object.entries(destinationsByCategory).map(([category, dests]) => {
      if (dests.length === 0) return null;

      return (
        <CategoryGroup
          key={category}
          category={category}
          destinations={dests}
          onSelect={onSelect}
        />
      );
    });
  }, [destinationsByCategory, onSelect]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-h-[70vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Select Destination</h2>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Search destinations..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {EmptyState || (
        <div>
          {CategoryGroups}
          {NoResults}
        </div>
      )}

      {/* Debug info */}
      <div className="mt-3 pt-2 border-t text-xs text-gray-500">
        <p>Total destinations: {destinations.length}</p>
        <p>Filtered destinations: {filteredDestinations.length}</p>
      </div>
    </div>
  );
};

// Export the component wrapped in React.memo for performance optimization
export default React.memo(DestinationSelector);
