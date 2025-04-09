import React, { useState, useEffect } from "react";
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

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  destinations,
  onSelect,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-4">
      <div
        className="flex items-center justify-between bg-gray-100 p-2 rounded-t cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-medium">{category}</h3>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  destinations,
  onSelect,
  onClose,
  categories = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDestinations, setFilteredDestinations] =
    useState<RoadNode[]>(destinations);

  // Group destinations by category
  const destinationsByCategory: Record<string, RoadNode[]> = {};

  // Use provided categories or extract them from destinations
  const usedCategories =
    categories.length > 0
      ? categories
      : Array.from(new Set(destinations.map((d) => d.category || "Other")));

  // Initialize empty arrays for each category
  usedCategories.forEach((category) => {
    destinationsByCategory[category] = [];
  });

  // Fill with filtered destinations
  filteredDestinations.forEach((dest) => {
    const category = dest.category || "Other";
    if (!destinationsByCategory[category]) {
      destinationsByCategory[category] = [];
    }
    destinationsByCategory[category].push(dest);
  });

  // Update filtered destinations when search changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDestinations(destinations);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = destinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(query) ||
        (dest.description && dest.description.toLowerCase().includes(query))
    );

    setFilteredDestinations(filtered);
  }, [searchQuery, destinations]);

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
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div>
        {Object.entries(destinationsByCategory).map(([category, dests]) => {
          if (dests.length === 0) return null;

          return (
            <CategoryGroup
              key={category}
              category={category}
              destinations={dests}
              onSelect={onSelect}
            />
          );
        })}

        {filteredDestinations.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No destinations found
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationSelector;
