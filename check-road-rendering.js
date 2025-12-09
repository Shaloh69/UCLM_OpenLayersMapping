#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the GeoJSON file
const geojsonPath = path.join(__dirname, 'web/public/GEOJSON_Reference.geojson');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

console.log('='.repeat(80));
console.log('CHECKING ROAD RENDERING ISSUES');
console.log('='.repeat(80));
console.log();

const roads = geojson.features.filter(f => f.properties.from && f.properties.to);

console.log(`Total roads with from/to: ${roads.length}`);
console.log();

// Check for common rendering issues
const issues = {
  duplicateNames: {},
  invalidGeometry: [],
  zeroLengthRoads: [],
  missingProperties: [],
  suspiciousCoordinates: []
};

// Check for duplicate names
roads.forEach(road => {
  const name = road.properties.name || 'UNNAMED';
  if (!issues.duplicateNames[name]) {
    issues.duplicateNames[name] = [];
  }
  issues.duplicateNames[name].push(road);
});

// Find actual duplicates
const actualDuplicates = Object.entries(issues.duplicateNames).filter(([name, roads]) => roads.length > 1);

if (actualDuplicates.length > 0) {
  console.log('⚠️  DUPLICATE ROAD NAMES:');
  actualDuplicates.forEach(([name, dupeRoads]) => {
    console.log(`\n  ${name} (${dupeRoads.length} instances):`);
    dupeRoads.forEach((road, idx) => {
      console.log(`    ${idx + 1}. ${road.properties.from} → ${road.properties.to}`);
      console.log(`       Coordinates: ${road.geometry.coordinates.length} points`);
      console.log(`       First point: [${road.geometry.coordinates[0].join(', ')}]`);
    });
  });
  console.log();
}

// Check geometry issues
roads.forEach(road => {
  const props = road.properties;
  const name = props.name || 'UNNAMED';

  // Check required properties
  if (!props.type) {
    issues.missingProperties.push({ name, missing: 'type' });
  }

  // Check geometry
  if (road.geometry.type !== 'LineString') {
    issues.invalidGeometry.push({
      name,
      issue: `Geometry type is ${road.geometry.type}, expected LineString`
    });
  }

  const coords = road.geometry.coordinates;

  // Check coordinate count
  if (!coords || coords.length < 2) {
    issues.invalidGeometry.push({
      name,
      issue: `Only ${coords?.length || 0} coordinate(s), need at least 2`
    });
  }

  // Check for zero-length roads (same start and end point)
  if (coords && coords.length === 2) {
    const [lon1, lat1] = coords[0];
    const [lon2, lat2] = coords[1];
    const distance = Math.sqrt(Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2));

    if (distance < 0.000001) {
      issues.zeroLengthRoads.push({
        name,
        from: props.from,
        to: props.to,
        distance
      });
    }
  }

  // Check for suspicious coordinates (not in expected range for Philippines)
  coords.forEach((coord, idx) => {
    const [lon, lat] = coord;
    // Philippines is roughly 116-127°E, 5-21°N
    if (lon < 116 || lon > 127 || lat < 5 || lat > 21) {
      issues.suspiciousCoordinates.push({
        name,
        index: idx,
        coord: [lon, lat],
        issue: 'Coordinate outside Philippines bounds'
      });
    }
  });
});

// Report issues
if (issues.invalidGeometry.length > 0) {
  console.log('⚠️  INVALID GEOMETRY:');
  issues.invalidGeometry.forEach(({ name, issue }) => {
    console.log(`  - ${name}: ${issue}`);
  });
  console.log();
}

if (issues.zeroLengthRoads.length > 0) {
  console.log('⚠️  ZERO-LENGTH ROADS (may not render):');
  issues.zeroLengthRoads.forEach(({ name, from, to, distance }) => {
    console.log(`  - ${name}: ${from} → ${to} (distance: ${distance.toExponential(2)})`);
  });
  console.log();
}

if (issues.missingProperties.length > 0) {
  console.log('⚠️  MISSING PROPERTIES:');
  issues.missingProperties.forEach(({ name, missing }) => {
    console.log(`  - ${name}: missing '${missing}' property`);
  });
  console.log();
}

if (issues.suspiciousCoordinates.length > 0) {
  console.log('⚠️  SUSPICIOUS COORDINATES:');
  const grouped = {};
  issues.suspiciousCoordinates.forEach(item => {
    if (!grouped[item.name]) grouped[item.name] = [];
    grouped[item.name].push(item);
  });
  Object.entries(grouped).forEach(([name, coords]) => {
    console.log(`  - ${name}: ${coords.length} suspicious coordinate(s)`);
  });
  console.log();
}

// Check for self-referencing roads
console.log('='.repeat(80));
console.log('SELF-REFERENCING ROADS');
console.log('='.repeat(80));
console.log();

const selfRefs = roads.filter(r => r.properties.from === r.properties.to);
if (selfRefs.length > 0) {
  console.log(`Found ${selfRefs.length} self-referencing road(s):`);
  selfRefs.forEach(road => {
    console.log(`  - ${road.properties.name}: ${road.properties.from} → ${road.properties.to}`);
  });
} else {
  console.log('No self-referencing roads found.');
}
console.log();

// Summary
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log();

const totalIssues =
  actualDuplicates.length +
  issues.invalidGeometry.length +
  issues.zeroLengthRoads.length +
  issues.missingProperties.length +
  (Object.keys(issues.suspiciousCoordinates.length > 0 ? 1 : 0));

if (totalIssues === 0) {
  console.log('✅ No rendering issues found!');
} else {
  console.log(`⚠️  Found ${totalIssues} type(s) of issues:`);
  if (actualDuplicates.length > 0) {
    console.log(`  - ${actualDuplicates.length} duplicate road name(s)`);
  }
  if (issues.invalidGeometry.length > 0) {
    console.log(`  - ${issues.invalidGeometry.length} geometry issue(s)`);
  }
  if (issues.zeroLengthRoads.length > 0) {
    console.log(`  - ${issues.zeroLengthRoads.length} zero-length road(s)`);
  }
  if (issues.missingProperties.length > 0) {
    console.log(`  - ${issues.missingProperties.length} missing properties`);
  }
  if (issues.suspiciousCoordinates.length > 0) {
    console.log(`  - Roads with suspicious coordinates`);
  }
}
console.log();

// Export results to JSON for further analysis
const results = {
  totalRoads: roads.length,
  duplicateNames: actualDuplicates.map(([name, roads]) => ({
    name,
    count: roads.length,
    instances: roads.map(r => ({
      from: r.properties.from,
      to: r.properties.to,
      coordinates: r.geometry.coordinates
    }))
  })),
  invalidGeometry: issues.invalidGeometry,
  zeroLengthRoads: issues.zeroLengthRoads,
  missingProperties: issues.missingProperties,
  selfReferencingRoads: selfRefs.map(r => ({
    name: r.properties.name,
    node: r.properties.from
  }))
};

fs.writeFileSync(
  path.join(__dirname, 'road-issues.json'),
  JSON.stringify(results, null, 2)
);

console.log('💾 Detailed results saved to road-issues.json');
console.log();
