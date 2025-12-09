#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the GeoJSON file
const geojsonPath = path.join(__dirname, 'web/public/GEOJSON_Reference.geojson');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

console.log('='.repeat(80));
console.log('GEOJSON ROADS ANALYSIS');
console.log('='.repeat(80));
console.log();

// Separate features by type
const roads = [];
const nodes = [];
const other = [];

geojson.features.forEach(feature => {
  const props = feature.properties || {};

  if (props.from && props.to) {
    roads.push(feature);
  } else if (props.type === 'node' || props.nodeType) {
    nodes.push(feature);
  } else {
    other.push(feature);
  }
});

console.log(`📊 SUMMARY:`);
console.log(`  Total features: ${geojson.features.length}`);
console.log(`  Roads (with from/to): ${roads.length}`);
console.log(`  Nodes: ${nodes.length}`);
console.log(`  Other features: ${other.length}`);
console.log();

// Analyze roads
console.log('='.repeat(80));
console.log('ROAD FEATURES ANALYSIS');
console.log('='.repeat(80));
console.log();

// Group roads by name pattern
const roadsByPattern = {};
roads.forEach(road => {
  const name = road.properties.name || 'UNNAMED';
  const match = name.match(/^([A-Z]+)(\d+)/);
  const pattern = match ? match[1] : 'OTHER';

  if (!roadsByPattern[pattern]) {
    roadsByPattern[pattern] = [];
  }
  roadsByPattern[pattern].push(road);
});

console.log('Roads by prefix:');
Object.keys(roadsByPattern).sort().forEach(pattern => {
  console.log(`  ${pattern}: ${roadsByPattern[pattern].length} roads`);
});
console.log();

// List all roads sorted by name
console.log('All roads (sorted by name):');
const sortedRoads = [...roads].sort((a, b) => {
  const nameA = a.properties.name || '';
  const nameB = b.properties.name || '';
  return nameA.localeCompare(nameB, undefined, { numeric: true });
});

sortedRoads.forEach((road, index) => {
  const props = road.properties;
  console.log(`  ${(index + 1).toString().padStart(3)}. ${props.name?.padEnd(20) || 'UNNAMED'.padEnd(20)} (${props.from} → ${props.to})`);
});
console.log();

// Check for missing roads in sequence
console.log('='.repeat(80));
console.log('CHECKING FOR MISSING ROADS IN SEQUENCES');
console.log('='.repeat(80));
console.log();

Object.keys(roadsByPattern).sort().forEach(pattern => {
  const roadsInPattern = roadsByPattern[pattern];
  const numbers = roadsInPattern
    .map(r => {
      const name = r.properties.name || '';
      const match = name.match(/\d+$/);
      return match ? parseInt(match[0], 10) : null;
    })
    .filter(n => n !== null)
    .sort((a, b) => a - b);

  if (numbers.length === 0) return;

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const missing = [];

  for (let i = min; i <= max; i++) {
    if (!numbers.includes(i)) {
      missing.push(i);
    }
  }

  if (missing.length > 0) {
    console.log(`${pattern} sequence (${min} to ${max}):`);
    console.log(`  Present: [${numbers.join(', ')}]`);
    console.log(`  Missing: [${missing.map(n => `${pattern}${n}`).join(', ')}]`);
    console.log();
  }
});

// Build a graph to check connectivity
console.log('='.repeat(80));
console.log('GRAPH CONNECTIVITY ANALYSIS');
console.log('='.repeat(80));
console.log();

const graph = {};
const nodeSet = new Set();

roads.forEach(road => {
  const { from, to, name } = road.properties;

  nodeSet.add(from);
  nodeSet.add(to);

  if (!graph[from]) graph[from] = {};
  if (!graph[to]) graph[to] = {};

  graph[from][to] = name;
  graph[to][from] = name;
});

console.log(`Total nodes in graph: ${Object.keys(graph).length}`);
console.log(`Total unique nodes from road endpoints: ${nodeSet.size}`);
console.log();

// Find isolated nodes (nodes with only one connection)
const isolatedNodes = [];
const terminalNodes = [];

Object.keys(graph).forEach(node => {
  const connections = Object.keys(graph[node]).length;
  if (connections === 0) {
    isolatedNodes.push(node);
  } else if (connections === 1) {
    terminalNodes.push(node);
  }
});

if (isolatedNodes.length > 0) {
  console.log(`⚠️  Isolated nodes (no connections): ${isolatedNodes.length}`);
  isolatedNodes.forEach(node => {
    console.log(`    - ${node}`);
  });
  console.log();
}

console.log(`Terminal nodes (only 1 connection): ${terminalNodes.length}`);
terminalNodes.forEach(node => {
  const connectedTo = Object.keys(graph[node])[0];
  const roadName = graph[node][connectedTo];
  console.log(`  - ${node.padEnd(30)} → ${connectedTo.padEnd(30)} (${roadName})`);
});
console.log();

// Check for nodes referenced in roads but not defined as node features
const definedNodes = new Set(nodes.map(n => n.properties.name));
const referencedNodes = nodeSet;
const undefinedNodes = [...referencedNodes].filter(n => !definedNodes.has(n));

if (undefinedNodes.length > 0) {
  console.log(`⚠️  Nodes referenced in roads but not defined as node features: ${undefinedNodes.length}`);
  undefinedNodes.forEach(node => {
    console.log(`    - ${node}`);
  });
  console.log();
}

// Analyze road geometry
console.log('='.repeat(80));
console.log('ROAD GEOMETRY ANALYSIS');
console.log('='.repeat(80));
console.log();

const geometryTypes = {};
roads.forEach(road => {
  const type = road.geometry.type;
  if (!geometryTypes[type]) {
    geometryTypes[type] = 0;
  }
  geometryTypes[type]++;
});

console.log('Geometry types:');
Object.keys(geometryTypes).forEach(type => {
  console.log(`  ${type}: ${geometryTypes[type]}`);
});
console.log();

// Check for roads with insufficient coordinates
const problematicRoads = [];
roads.forEach(road => {
  if (road.geometry.type === 'LineString') {
    const coords = road.geometry.coordinates;
    if (!coords || coords.length < 2) {
      problematicRoads.push({
        name: road.properties.name,
        issue: `LineString with ${coords?.length || 0} coordinates (need at least 2)`
      });
    }
  }
});

if (problematicRoads.length > 0) {
  console.log(`⚠️  Roads with geometry issues: ${problematicRoads.length}`);
  problematicRoads.forEach(({ name, issue }) => {
    console.log(`    - ${name}: ${issue}`);
  });
  console.log();
}

console.log('='.repeat(80));
console.log('ANALYSIS COMPLETE');
console.log('='.repeat(80));
