import { Feature } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import LineString from "ol/geom/LineString";
import { fromLonLat, toLonLat } from "ol/proj";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Style, Stroke } from "ol/style";
import { MutableRefObject } from "react";
import Point from "ol/geom/Point";
import { Geometry } from "ol/geom";

export interface Road {
  id: string;
  name: string;
  type: "main" | "secondary" | "path";
  from: string;
  to: string;
  coordinates: number[][];
}

export interface RoadNode {
  id: string;
  name: string;
  isDestination: boolean;
  coordinates: [number, number]; // [longitude, latitude]
  description?: string;
  category?: string;
  imageUrl?: string;
  nearest_node?: string; // ID of nearest road node (for POIs not on road network)
  additionalDirections?: string; // Walking directions from nearest_node to this POI
}

/**
 * Resolves the routing node ID for a given destination.
 * If the destination has a nearest_node property (POI not on road network),
 * returns that node ID. Otherwise, returns the destination's own ID.
 *
 * @param destination - The destination RoadNode
 * @returns The node ID to use for routing
 */
export const resolveRoutingNode = (destination: RoadNode): string => {
  // If destination is a POI with a nearest_node, route to that instead
  if (destination.nearest_node && destination.nearest_node.trim() !== '') {
    return destination.nearest_node;
  }
  // Otherwise, route directly to the destination
  return destination.id;
};

/**
 * Checks if a destination requires additional directions
 * (i.e., it's a POI not directly on the road network)
 *
 * @param destination - The destination RoadNode
 * @returns True if additional directions are needed
 */
export const requiresAdditionalDirections = (destination: RoadNode): boolean => {
  return !!(
    destination.nearest_node &&
    destination.nearest_node.trim() !== '' &&
    destination.additionalDirections &&
    destination.additionalDirections.trim() !== ''
  );
};

// Setup road system
// Find the closest node to the given coordinates

export const findClosestNode = (
  longitude: number,
  latitude: number,
  nodesSource: VectorSource<Feature>
): RoadNode | null => {
  const features = nodesSource.getFeatures();
  if (!features.length) return null;

  let closestNode: RoadNode | null = null;
  let minDistance = Infinity;

  features.forEach((feature) => {
    const properties = feature.getProperties();
    const geometry = feature.getGeometry();
    if (!geometry) return;

    let coordinates: number[] = [0, 0];

    // Handle different geometry types
    if (geometry instanceof Point) {
      coordinates = geometry.getCoordinates();
    } else {
      // For other geometry types, attempt to get the first coordinate if possible
      try {
        // This is unsafe but we're checking the actual type at runtime
        const coords = (geometry as any).getFirstCoordinate?.();
        if (coords) {
          coordinates = coords;
        } else {
          return; // Skip if we can't get coordinates
        }
      } catch (e) {
        return; // Skip this feature on error
      }
    }

    // Convert from EPSG:3857 to EPSG:4326
    const geoCoords = toLonLat(coordinates);

    // Calculate distance (simple Euclidean for now)
    const dx = longitude - geoCoords[0];
    const dy = latitude - geoCoords[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      closestNode = {
        id:
          properties.id || `node-${Math.random().toString(36).substring(2, 9)}`,
        name: properties.name || "Unnamed Node",
        isDestination: !!properties.isDestination,
        coordinates: geoCoords as [number, number],
        description: properties.description,
        category: properties.category,
        imageUrl: properties.imageUrl,
        nearest_node: properties.nearest_node,
        additionalDirections: properties.additionalDirections,
      };
    }
  });

  return closestNode;
};

// Find the shortest path between two nodes
export const findShortestPath = (
  startNodeId: string,
  endNodeId: string,
  roadsSource: VectorSource<Feature>,
  nodesSource: VectorSource<Feature>
): Feature[] => {
  // Build a graph from the road network
  const graph: Record<string, Record<string, number>> = {};
  const nodeCoordinates: Record<string, number[]> = {};

  // Record all node coordinates
  nodesSource.getFeatures().forEach((feature) => {
    const props = feature.getProperties();
    const geometry = feature.getGeometry();
    if (props.id && geometry) {
      let coordinates: number[] = [0, 0];

      // Handle different geometry types
      if (geometry instanceof Point) {
        coordinates = geometry.getCoordinates();
      } else {
        // Skip if not a point
        return;
      }

      nodeCoordinates[props.id] = coordinates;
      graph[props.id] = {};
    }
  });

  nodesSource.on("featuresloadend", () => {
    console.log("🚩 roadsystem.txt - featuresloadend triggered");
    const features = nodesSource.getFeatures();
    console.log("🚩 roadsystem.txt - features count:", features.length);
  });

  // Add edges to the graph
  roadsSource.getFeatures().forEach((feature) => {
    const props = feature.getProperties();
    if (props.from && props.to) {
      const geometry = feature.getGeometry();
      if (!geometry) return;

      // Calculate road segment length
      let distance = 0;
      if (geometry instanceof LineString) {
        distance = geometry.getLength();
      } else if (geometry.getType() === "LineString") {
        try {
          // Use type assertion for LineString
          const lineString = geometry as LineString;
          distance = lineString.getLength();
        } catch (error) {
          console.error("Error calculating line length:", error);
        }
      }

      // Add to graph in both directions (assuming bidirectional roads)
      if (!graph[props.from]) graph[props.from] = {};
      if (!graph[props.to]) graph[props.to] = {};

      graph[props.from][props.to] = distance;
      graph[props.to][props.from] = distance;
    }

    console.log("😊😊Graph structure:", JSON.stringify(graph));
    console.log("Looking for path between:", startNodeId, "and", endNodeId);
    console.log("Nodes available:", Object.keys(graph));
  });

  // Check if both nodes exist in the graph
  if (!graph[startNodeId] || !graph[endNodeId]) {
    return [];
  }

  // Dijkstra's algorithm
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  // Initialize
  Object.keys(graph).forEach((node) => {
    distances[node] = node === startNodeId ? 0 : Infinity;
    previous[node] = null;
    unvisited.add(node);
  });

  // Main algorithm
  while (unvisited.size > 0) {
    // Find node with minimum distance
    let current: string | null = null;
    let minDistance = Infinity;

    // Convert Set to Array for iteration to avoid TypeScript error
    Array.from(unvisited).forEach((node) => {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    });

    // If we can't find a node or we found the end node
    if (current === null || current === endNodeId) break;

    // Remove current from unvisited
    unvisited.delete(current);

    // Check all neighbors
    for (const neighbor in graph[current]) {
      if (!unvisited.has(neighbor)) continue;

      const distance = distances[current] + graph[current][neighbor];

      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previous[neighbor] = current;
      }
    }
  }

  // Build the path
  const path: string[] = [];
  let current = endNodeId;

  if (previous[endNodeId] === null && startNodeId !== endNodeId) {
    // No path found
    return [];
  }

  // Construct the path
  while (current) {
    path.unshift(current);
    current = previous[current] || "";
    if (current === startNodeId) {
      path.unshift(current);
      break;
    }
    if (!previous[current]) break;
  }

  // Convert path to features
  const pathFeatures: Feature[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const fromNode = path[i];
    const toNode = path[i + 1];

    // Find the road segment between these nodes
    const roadSegment = roadsSource.getFeatures().find((feature) => {
      const props = feature.getProperties();
      return (
        (props.from === fromNode && props.to === toNode) ||
        (props.from === toNode && props.to === fromNode)
      );
    });

    if (roadSegment) {
      pathFeatures.push(roadSegment);
    }
  }


  return pathFeatures;
};

export const setupRoadSystem = (
  roadsUrl: string,
  nodesUrl: string
) => {
  // Create source for roads
  const roadsSource = new VectorSource({
    url: roadsUrl,
    format: new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    }),
  });

  // Create source for nodes/destinations
  const nodesSource = new VectorSource({
    url: nodesUrl,
    format: new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    }),
  });

  // Create layer for roads with styling
  const roadsLayer = new VectorLayer({
    source: roadsSource,
    style: (feature) => {
      const properties = feature.getProperties();
      const roadType = properties.type || "secondary";

      // Different styling based on road type
      let color = "#555555";
      let width = 3;
      let lineDash: number[] = [];

      switch (roadType) {
        case "main":
          color = "#333333";
          width = 5;
          break;
        case "secondary":
          color = "#666666";
          width = 3;
          break;
        case "path":
          color = "#555555";  // Darker gray for better visibility
          width = 4;          // Increased from 2 to 4 pixels
          lineDash = [6, 3];  // More visible dash pattern
          break;
      }

      return new Style({
        stroke: new Stroke({
          color: color,
          width: width,
          lineDash: lineDash,
        }),
      });
    },
    zIndex: 5, // Place below points but above polygon areas
  });

  // Load initial roads data
  roadsSource.on("featuresloadend", () => {
    const features = roadsSource.getFeatures();
  });

  // Handle potential errors loading roads
  roadsSource.on("featuresloaderror", (error: any) => {
  });

  // Load initial nodes data
  nodesSource.on("featuresloadend", () => {
    const features = nodesSource.getFeatures();

    // Count destinations for debugging
    const destinations = features.filter((feature) => {
      const props = feature.getProperties();
      return props.isDestination === true;
    });
    console.log(
      `✅ featuresloadend in road system triggered ${features}, total features: ${features.length}`
    );

    console.log(
      `✅ featuresloadend in road system triggered, total features: ${destinations}`
    );


  });

  // Handle potential errors loading nodes
  nodesSource.on("featuresloaderror", (error: any) => {
  });

  return { roadsLayer, roadsSource, nodesSource };
};
