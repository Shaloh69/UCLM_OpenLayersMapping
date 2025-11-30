# GeoJSON Templates for Campus Navigation Kiosk

These template files demonstrate the structure and required properties for custom GeoJSON files that can be used with the Campus Navigation Kiosk.

## Files

1. **Buildings_Template.geojson** - Template for building polygons
2. **RoadSystem_Template.geojson** - Template for navigation system (roads + nodes + POIs)
3. **Points_Template.geojson** - Template for visual marker points (optional)

## How to Use

1. Open the Electron kiosk app
2. Press **Ctrl+Shift+C** to open the configuration panel
3. Upload your custom GeoJSON files:
   - Buildings.geojson (required)
   - RoadSystem.geojson (required)
   - Points.geojson (optional)
4. Click "Save & Launch" to apply the configuration

## Buildings GeoJSON Structure

The Buildings file contains polygons representing building footprints.

### Required Properties:
- `stroke`: Border color (hex)
- `stroke-width`: Border width (number)
- `fill`: Fill color (hex)
- `fill-opacity`: Fill transparency (0-1)

### Example:
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
    "coordinates": [[[lon, lat], [lon, lat], ...]]
  },
  "id": "building_name"
}
```

## RoadSystem GeoJSON Structure

The RoadSystem file contains all navigation-related features:
- **Points**: Destination nodes, gates, junctions, stairs, etc.
- **LineStrings**: Road paths connecting nodes
- **Polygons**: Road surfaces (optional)

### Point Features (Destinations)

**Required Properties:**
- `id`: Unique identifier (string)
- `name`: Display name (string)
- `isDestination`: Boolean - can users navigate here?
- `category`: Classification (Gates, Main Buildings, etc.)

**Optional Properties:**
- `description`: Additional info
- `imageUrl`: Image for the location

**Categories:**
- Gates
- Main Buildings
- Maritime
- Business
- Facilities
- Sports Facilities
- Academic Facilities
- Administrative
- Stairs

### Point Features (Junctions)

Junction nodes are waypoints for pathfinding.

**Required Properties:**
- `id`: Unique identifier
- `name`: Junction name
- `isDestination`: false (junctions are not selectable destinations)
- `category`: "Junctions"

### LineString Features (Roads)

Roads connect nodes and are used for route calculation.

**Required Properties:**
- `from`: ID of starting node
- `to`: ID of ending node
- `type`: "main", "secondary", or "path"

### Polygon Features (Road Surfaces)

Optional polygons for visualizing road surfaces.

**Properties:**
- `id`: Identifier (e.g., "road1")

## Points GeoJSON Structure (Optional)

The Points file contains visual markers for decoration.

### Properties:
- `marker-color`: Marker color (hex)
- `marker-size`: "small", "medium", or "large"
- `marker-symbol`: Icon type

## Coordinate System

**Format:** EPSG:4326 (WGS84)
- Coordinates: [longitude, latitude]
- Standard decimal degrees format

**Example:**
```json
"coordinates": [123.9540, 10.3270]
```

For polygon coordinates, the first and last point must be identical to close the shape.

## Tips

1. **Use geojson.io** - Create and edit GeoJSON files visually at https://geojson.io
2. **Test incrementally** - Start with a simple layout and add features gradually
3. **Maintain connectivity** - Ensure all LineStrings connect to valid node IDs
4. **Set at least one gate** - The system uses gates as default starting points
5. **Use meaningful IDs** - Clear identifiers make debugging easier

## Troubleshooting

### Map doesn't load
- Check that Buildings and RoadSystem files are valid JSON
- Verify all coordinates are in [longitude, latitude] format
- Ensure polygons are properly closed (first point = last point)

### Navigation doesn't work
- Verify `isDestination: true` is set on destination nodes
- Check that LineStrings have valid `from` and `to` properties
- Ensure all node IDs referenced in LineStrings actually exist
- Confirm at least one gate exists with `category: "Gates"`

### Routes not calculating
- Make sure there's a continuous path between nodes via LineStrings
- Check that node IDs in LineStrings match Point feature IDs exactly
- Verify the graph is connected (no isolated sections)

## Example Campus Setup

A minimal working campus needs:

1. **At least 2 destination nodes** (e.g., main gate + one building)
2. **At least 1 junction** (for routing)
3. **LineStrings connecting** gate → junction → building
4. **Building polygons** for visual representation

See the template files in this directory for working examples.

## Need Help?

For more information, see:
- `/public/GEOJSON_STRUCTURE.md` - Detailed documentation
- Original UCLM files in `/public/` - Real-world examples

## Last Updated
November 30, 2025
