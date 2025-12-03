/**
 * Script to calculate nearest road nodes for POIs
 * This ensures each POI can be routed to via the road network
 */

import * as fs from 'fs';
import * as path from 'path';

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    id?: string;
    name?: string;
    isDestination?: boolean;
    category?: string;
    description?: string;
    nearest_node?: string;
    additionalDirections?: string;
    [key: string]: any;
  };
  geometry: GeoJSONPoint | any;
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Calculate Euclidean distance between two coordinates
 * Returns distance in degrees (approximate)
 */
function calculateDistance(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  const dx = lon1 - lon2;
  const dy = lat1 - lat2;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert distance in degrees to meters (approximate for Cebu, Philippines ~10°N)
 */
function degreesToMeters(degrees: number): number {
  // At 10°N latitude:
  // 1° longitude ≈ 109,641 meters
  // 1° latitude ≈ 111,320 meters
  // Using average for simplification
  return degrees * 110480;
}

/**
 * Find the nearest road node to a POI
 */
function findNearestNode(
  poiCoords: [number, number],
  roadNodes: Array<{ id: string; coords: [number, number]; name: string }>
): { nodeId: string; distance: number; nodeName: string } | null {
  if (!roadNodes.length) return null;

  let minDistance = Infinity;
  let nearestNode: { nodeId: string; distance: number; nodeName: string } | null = null;

  for (const node of roadNodes) {
    const distance = calculateDistance(
      poiCoords[0],
      poiCoords[1],
      node.coords[0],
      node.coords[1]
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestNode = {
        nodeId: node.id,
        distance: degreesToMeters(distance),
        nodeName: node.name,
      };
    }
  }

  return nearestNode;
}

/**
 * Generate appropriate directions based on POI type and location
 */
function generateDirections(
  poiName: string,
  poiCategory: string,
  nearestNodeName: string
): string {
  const name = poiName.toLowerCase();

  // Elevator directions
  if (name.includes('elevator')) {
    if (name.includes('cbe')) {
      return 'Enter CBE building main entrance. Elevator is on the right side of the lobby.';
    }
    if (name.includes('annex')) {
      return 'Enter Annex 1 building. Elevator is located near the main entrance.';
    }
    return 'Look for elevator signs inside the building entrance.';
  }

  // Stairs directions
  if (name.includes('stairs') || name.includes('stair')) {
    if (name.includes('maritime')) {
      return 'Enter Maritime building and look for stairs near the main hallway.';
    }
    if (name.includes('old')) {
      return 'Stairs are located inside the old building main corridor.';
    }
    if (name.includes('sao')) {
      return 'Look for stairs leading to SAO office on upper floor.';
    }
    if (name.includes('uro')) {
      return 'Stairs to URO are located in the old building section.';
    }
    return 'Enter the building and follow signage to stairs.';
  }

  // Office/Room directions
  if (name.includes('office')) {
    if (name.includes('nsa')) {
      return 'Enter NSA building. Office is on the ground floor, follow corridor signs.';
    }
    return `Look for ${poiName} signs inside the building.`;
  }

  // Canteen directions
  if (name.includes('canteen') || name.includes('foodcourt')) {
    if (name.includes('cbe')) {
      return 'Enter CBE building ground floor. Canteen is accessible from main corridor.';
    }
    if (name.includes('nsa')) {
      return 'NSA canteen is on the ground floor of NSA building.';
    }
    if (name.includes('annex')) {
      return 'Annex 1 canteen is accessible from the ground floor corridor.';
    }
    return 'Follow signs to canteen area inside the building.';
  }

  // Study/classroom directions
  if (name.includes('study') || name.includes('hall')) {
    return 'Enter building and look for room number or signage.';
  }

  // Clinic/medical
  if (name.includes('clinic')) {
    return 'Clinic is located on the ground floor. Look for medical cross signage.';
  }

  // Chapel
  if (name.includes('chapel')) {
    return 'Chapel entrance is clearly marked. Follow pathway signs.';
  }

  // Guidance
  if (name.includes('guidance')) {
    return 'Guidance office is inside the building, follow directional signs.';
  }

  // Lab/tool room
  if (name.includes('lab') || name.includes('tool')) {
    return 'Enter building and look for room number signage.';
  }

  // Generic gates
  if (name.includes('gate')) {
    return `You have arrived at ${poiName}.`;
  }

  // Default
  return `Walk to ${poiName} from ${nearestNodeName}. Look for building entrance or signage.`;
}

/**
 * Main execution
 */
async function main() {
  const publicDir = path.join(__dirname, '../web/public');
  const roadsPath = path.join(publicDir, 'UCLM_Roads.geojson');
  const testPointsPath = path.join(publicDir, 'TestPoints.geojson');

  console.log('📍 Loading GeoJSON files...');

  // Read UCLM_Roads.geojson to get all road nodes
  const roadsData: GeoJSONFeatureCollection = JSON.parse(
    fs.readFileSync(roadsPath, 'utf-8')
  );

  // Extract all Point features with IDs (road nodes)
  const roadNodes = roadsData.features
    .filter(
      (f) =>
        f.geometry.type === 'Point' &&
        f.properties.id &&
        typeof f.properties.id === 'string'
    )
    .map((f) => ({
      id: f.properties.id!,
      coords: f.geometry.coordinates as [number, number],
      name: f.properties.name || f.properties.id!,
    }));

  console.log(`✅ Found ${roadNodes.length} road nodes`);

  // Read TestPoints.geojson
  const testPointsData: GeoJSONFeatureCollection = JSON.parse(
    fs.readFileSync(testPointsPath, 'utf-8')
  );

  console.log(`📍 Processing ${testPointsData.features.length} POIs...\n`);

  // Update each POI with nearest_node and additionalDirections
  let updatedCount = 0;
  for (const poi of testPointsData.features) {
    if (poi.geometry.type !== 'Point') continue;

    const poiCoords = poi.geometry.coordinates as [number, number];
    const nearest = findNearestNode(poiCoords, roadNodes);

    if (nearest) {
      poi.properties.nearest_node = nearest.nodeId;

      // Only generate directions if not already set
      if (!poi.properties.additionalDirections || poi.properties.additionalDirections === '') {
        poi.properties.additionalDirections = generateDirections(
          poi.properties.name || '',
          poi.properties.category || '',
          nearest.nodeName
        );
      }

      console.log(
        `✓ ${poi.properties.name?.padEnd(35)} → ${nearest.nodeId.padEnd(25)} (${nearest.distance.toFixed(1)}m)`
      );
      console.log(`  📝 "${poi.properties.additionalDirections}"\n`);

      updatedCount++;
    } else {
      console.log(`✗ ${poi.properties.name} - No nearest node found`);
    }
  }

  // Write updated file
  fs.writeFileSync(
    testPointsPath,
    JSON.stringify(testPointsData, null, 2),
    'utf-8'
  );

  console.log(`\n✅ Updated ${updatedCount} POIs with nearest_node data`);
  console.log(`💾 Saved to: ${testPointsPath}`);
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
