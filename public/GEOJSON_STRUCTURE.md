# GeoJSON Structure Documentation

## Overview

The UCLM Campus Navigation system uses a clean, separated GeoJSON structure for better organization and maintainability.

## File Structure

### UCLM_Buildings.geojson
**Purpose:** Contains all building polygons for campus visualization

**Features:** 27 building polygons
- Old Building
- SH Buildings (1, 2)
- Maritime Buildings (1-5)
- CBE Buildings (1-3)
- Covered Court
- Maritime Canteen
- Pool
- Parking areas

**Geometry Type:** Polygon

**Properties:**
- `id`: Unique building identifier
- `fill`: Building fill color
- `fill-opacity`: Fill transparency
- `stroke`: Border color
- `stroke-width`: Border width

---

### UCLM_RoadSystem.geojson
**Purpose:** Complete navigation system including roads, points of interest, and destination nodes

**Total Features:** 141

#### Breakdown:
1. **Points (83 features)**
   - **Destination Nodes** (20): Main buildings, facilities
   - **Gates** (18): Campus entry/exit points
   - **Stairs** (14): Vertical access points
   - **Junctions** (24): Pathfinding waypoints
   - **Other POIs** (7): Academic facilities, administrative buildings

2. **LineStrings (56 features)**
   - Road paths connecting nodes
   - Used for route calculation via Dijkstra's algorithm
   - Properties include: `from`, `to`, `type` (main/secondary/path)

3. **Polygons (2 features)**
   - `road1`: Main campus road surface
   - `road2`: Secondary campus road surface

**Categories:**
- Gates
- Main Buildings
- Maritime
- Business
- Facilities
- Sports Facilities
- Stairs
- Academic Facilities
- Administrative

**Properties:**
- `id`: Unique identifier
- `name`: Human-readable name
- `isDestination`: Boolean - can users navigate here?
- `category`: Classification
- `description`: Additional information
- `from`/`to`: Connection endpoints (for LineStrings)

---

### UCLM_Points.geojson
**Purpose:** Visual marker points for map decoration

**Features:** 20 marker points

**Properties:**
- `marker-color`: Marker color
- `marker-size`: small/medium/large
- `marker-symbol`: Icon type

---

## Migration from Old Structure

### Old Files (Backed up in `/backup_geojson/`)
- `UCLM_Map.geojson` - Mixed buildings and roads
- `UCLM_Roads.geojson` - Road network only
- `UCLM_Nodes.geojson` - Destination points only

### New Files
- `UCLM_Buildings.geojson` - Buildings only (cleaner)
- `UCLM_RoadSystem.geojson` - Complete navigation system (roads + nodes + POIs)

### Benefits of New Structure

1. **Separation of Concerns**
   - Buildings are purely visual
   - RoadSystem is purely functional (navigation)

2. **Easier Maintenance**
   - Update buildings without affecting navigation
   - Update routes without affecting building rendering

3. **Better Performance**
   - Smaller file sizes when only one aspect is needed
   - Reduced parsing time

4. **Clearer Organization**
   - Obvious what each file contains
   - Easier for new developers to understand

---

## Usage in Code

### MapComponent.tsx

```typescript
const CampusMap: React.FC<MapProps> = ({
  mapUrl = "/UCLM_Buildings.geojson",        // Building polygons
  pointsUrl = "/UCLM_Points.geojson",        // Visual markers
  roadsUrl = "/UCLM_RoadSystem.geojson",     // Road network (LineStrings)
  nodesUrl = "/UCLM_RoadSystem.geojson",     // Navigation nodes (Points)
  // ...
}) => {
```

**Note:** Both `roadsUrl` and `nodesUrl` point to the same file (`UCLM_RoadSystem.geojson`) because it contains all navigation-related data.

---

## File Statistics

| File | Size | Features | Types |
|------|------|----------|-------|
| UCLM_Buildings.geojson | 22KB | 27 | Polygons |
| UCLM_RoadSystem.geojson | 76KB | 141 | 83 Points, 56 LineStrings, 2 Polygons |
| UCLM_Points.geojson | 6KB | 20 | Points |

---

## Adding New Features

### Adding a New Building
Edit `UCLM_Buildings.geojson`:
```json
{
  "type": "Feature",
  "properties": {
    "stroke": "#555555",
    "stroke-width": 2,
    "fill": "#34ea40",
    "fill-opacity": 1
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[lng, lat], ...]]
  },
  "id": "new_building_name"
}
```

### Adding a New Destination
Edit `UCLM_RoadSystem.geojson`:
```json
{
  "type": "Feature",
  "properties": {
    "id": "node99",
    "name": "New Building Entrance",
    "isDestination": true,
    "category": "Main Buildings",
    "description": "Main entrance to the new building"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [lng, lat]
  }
}
```

### Adding a New Road Path
Edit `UCLM_RoadSystem.geojson`:
```json
{
  "type": "Feature",
  "properties": {
    "from": "node1",
    "to": "node2",
    "type": "main"
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [[lng1, lat1], [lng2, lat2], ...]
  }
}
```

---

## Coordinate System

**Projection:** EPSG:4326 (WGS84)
- Standard latitude/longitude format
- Converted to EPSG:3857 (Web Mercator) for display

**Campus Location:** Cebu, Philippines
- Center: [123.9545, 10.3265]

---

## Last Updated
November 30, 2025

## Maintained By
UCLM Campus Navigation Development Team
