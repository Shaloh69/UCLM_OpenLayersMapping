# Campus Navigation Kiosk - Configuration Guide

This guide explains how to configure the Campus Navigation Kiosk to work with any campus or location by uploading custom GeoJSON files.

## Overview

The kiosk is now **location-agnostic** - you can use it for any campus, park, mall, or facility by providing custom GeoJSON files that define:
- Building footprints
- Navigation network (roads, paths, walkways)
- Points of interest (buildings, gates, facilities)

## Quick Start

1. **Launch the Kiosk Electron App**
   ```bash
   cd kiosk_Electron
   npm start
   ```

2. **Open Configuration Panel**
   - Press **Ctrl+Shift+C** (Windows/Linux) or **Cmd+Shift+C** (Mac)

3. **Configure Server URL**
   - Enter the URL where your Next.js web app is running
   - Default: `http://localhost:3000`

4. **Upload GeoJSON Files**
   - Buildings.geojson (required)
   - RoadSystem.geojson (required)
   - Points.geojson (optional)

5. **Save and Launch**
   - Click "Save & Launch"
   - The kiosk will reload with your custom configuration

## GeoJSON File Requirements

### Buildings.geojson (Required)

Contains polygons representing building footprints.

**What it controls:**
- Visual representation of buildings on the map
- Building colors and borders
- Campus layout

**Example:**
```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "properties": {
      "stroke": "#555555",
      "stroke-width": 2,
      "fill": "#34ea40",
      "fill-opacity": 1
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[lon, lat], [lon, lat], ...]]
    },
    "id": "library_building"
  }]
}
```

### RoadSystem.geojson (Required)

Contains the complete navigation system including destinations, junctions, and paths.

**What it controls:**
- Selectable destinations (buildings, gates, facilities)
- Navigation paths between locations
- Route calculation algorithm

**Contains three types of features:**

1. **Destination Points** - Places users can navigate to
   ```json
   {
     "type": "Feature",
     "properties": {
       "id": "library",
       "name": "Library Building",
       "isDestination": true,
       "category": "Main Buildings",
       "description": "Campus library and study area"
     },
     "geometry": {
       "type": "Point",
       "coordinates": [lon, lat]
     }
   }
   ```

2. **Junction Points** - Waypoints for pathfinding
   ```json
   {
     "type": "Feature",
     "properties": {
       "id": "junction1",
       "isDestination": false,
       "category": "Junctions"
     },
     "geometry": {
       "type": "Point",
       "coordinates": [lon, lat]
     }
   }
   ```

3. **Road LineStrings** - Paths connecting nodes
   ```json
   {
     "type": "Feature",
     "properties": {
       "from": "gate1",
       "to": "junction1",
       "type": "main"
     },
     "geometry": {
       "type": "LineString",
       "coordinates": [[lon1, lat1], [lon2, lat2]]
     }
   }
   ```

### Points.geojson (Optional)

Contains visual marker points for decoration.

**What it controls:**
- Decorative markers on the map
- Visual indicators for landmarks

## Keyboard Shortcuts

- **Ctrl+Shift+C** - Open configuration panel
- **Ctrl+Shift+R** - Reload kiosk
- **Ctrl+Shift+F** - Toggle fullscreen
- **Ctrl+Shift+I** - Open developer tools
- **Ctrl+Shift+Q** - Quit application

## Creating Custom GeoJSON Files

### Option 1: Use geojson.io (Recommended for Beginners)

1. Visit https://geojson.io
2. Use the drawing tools to create:
   - Polygons for buildings
   - Points for destinations and junctions
   - Lines for paths
3. Add properties in the right panel
4. Download as GeoJSON

### Option 2: Edit Template Files

1. Navigate to `kiosk_Electron/templates/`
2. Copy the template files:
   - `Buildings_Template.geojson`
   - `RoadSystem_Template.geojson`
   - `Points_Template.geojson`
3. Edit the coordinates and properties
4. Upload via configuration panel

### Option 3: Use Existing UCLM Files as Reference

The `/public/` directory contains real-world examples:
- `UCLM_Buildings.geojson` - 27 building polygons
- `UCLM_RoadSystem.geojson` - Complete navigation system
- `UCLM_Points.geojson` - Visual markers

See `/public/GEOJSON_STRUCTURE.md` for detailed documentation.

## Important Properties

### For Destination Points

| Property | Required | Description | Example Values |
|----------|----------|-------------|----------------|
| `id` | Yes | Unique identifier | "library", "gate1" |
| `name` | Yes | Display name | "Library Building" |
| `isDestination` | Yes | Can users navigate here? | `true` or `false` |
| `category` | Yes | Classification | "Gates", "Main Buildings", etc. |
| `description` | No | Additional info | "Main entrance..." |

### For Road LineStrings

| Property | Required | Description | Example Values |
|----------|----------|-------------|----------------|
| `from` | Yes | Starting node ID | "gate1" |
| `to` | Yes | Ending node ID | "junction1" |
| `type` | Yes | Road type | "main", "secondary", "path" |

### Categories for Destinations

The system supports these categories:
- **Gates** - Entry/exit points (default starting location)
- **Main Buildings** - Primary campus buildings
- **Maritime** - Maritime-related facilities
- **Business** - Business school buildings
- **Facilities** - General facilities (cafeteria, etc.)
- **Sports Facilities** - Gyms, courts, pools
- **Academic Facilities** - Classrooms, labs
- **Administrative** - Admin offices
- **Stairs** - Stairways and vertical access

## Configuration File Storage

Custom GeoJSON files are stored in:
```
kiosk_Electron/custom_geojson/
├── Buildings.geojson
├── RoadSystem.geojson
└── Points.geojson
```

The server URL is stored in:
```
kiosk_Electron/config.json
```

## Troubleshooting

### Map doesn't display
- Check that Buildings.geojson is valid JSON
- Verify coordinates are in [longitude, latitude] format
- Ensure polygons are closed (first point = last point)

### No destinations appear
- Check that `isDestination: true` is set on nodes
- Verify the `category` property is present
- Ensure at least one gate exists

### Routes don't calculate
- Verify LineStrings have correct `from` and `to` IDs
- Check that node IDs match exactly
- Ensure there's a connected path between locations
- Confirm no isolated sections in the graph

### Kiosk won't load web app
- Verify the server URL in configuration
- Make sure Next.js app is running: `npm run dev`
- Check for firewall or network issues

## Development Mode

To see debug logs and verify your configuration:

1. Press **Ctrl+Shift+I** to open Developer Tools
2. Check the Console tab for:
   - "Custom Buildings.geojson found"
   - "Custom RoadSystem.geojson found"
   - "Using custom GeoJSON files from Electron configuration"

## Best Practices

1. **Start Simple**
   - Begin with 2-3 buildings and basic paths
   - Test navigation before adding complexity

2. **Use Meaningful IDs**
   - Clear identifiers make debugging easier
   - Example: "library_main_entrance" not "node42"

3. **Maintain Connectivity**
   - Every destination should be reachable from gates
   - Use junction points for complex layouts

4. **Set a Default Gate**
   - The first gate (category: "Gates") becomes the default starting point
   - Recommended: Use ID "gate1" for the main entrance

5. **Test Incrementally**
   - Upload files and test navigation
   - Add more features gradually

## Example Minimal Setup

A basic working campus needs:

```
RoadSystem.geojson:
- 1 gate (id: "gate1", category: "Gates", isDestination: true)
- 1 building destination (isDestination: true)
- 1 junction (isDestination: false)
- 2 LineStrings (gate→junction, junction→building)

Buildings.geojson:
- 1-2 building polygons matching the destinations
```

## Converting Existing Data

If you have campus data in other formats:

### From Shapefile
```bash
ogr2ogr -f GeoJSON output.geojson input.shp
```

### From KML
```bash
ogr2ogr -f GeoJSON output.geojson input.kml
```

### From CSV with coordinates
Use https://geojson.io to import and convert

## Need Help?

For more detailed information:
- **Template Files**: `kiosk_Electron/templates/`
- **Template README**: `kiosk_Electron/templates/README.md`
- **GeoJSON Structure Docs**: `/public/GEOJSON_STRUCTURE.md`
- **Real Examples**: `/public/UCLM_*.geojson`

## Last Updated
November 30, 2025
