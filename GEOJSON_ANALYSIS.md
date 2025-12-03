# GeoJSON Configuration Analysis

## Files Overview

| File | Features | Lines | Purpose |
|------|----------|-------|---------|
| UCLM_RoadSystem.geojson | 141 | 3,460 | **MAIN FILE** - All nodes and roads combined |
| UCLM_Buildings.geojson | 27 | 1,017 | Building polygons |
| UCLM_Roads.geojson | 109 | 1,800 | Road segments only |
| UCLM_Nodes.geojson | 30 | 405 | Navigation nodes only |
| UCLM_Points.geojson | 20 | 265 | Visual markers |
| UCLM_Map.geojson | 31 | 862 | Legacy map file |

## Coordinate System

**Location**: UCLM Campus
**Coordinates**: ~123.95°E, ~10.32°N (Cebu, Philippines)
**Projection**: WGS84 (EPSG:4326) → Web Mercator (EPSG:3857) for display

## RoadSystem.geojson Structure

### Nodes (44 total):
- **20 Destination Nodes** (isDestination: true)
  - 4 Gates
  - 8 Main Buildings
  - 2 Maritime facilities
  - 2 Business buildings
  - 2 Sports facilities
  - 2 Stairs/access points

- **24 Junction Nodes** (isDestination: false)
  - Routing waypoints for pathfinding

### Roads (97 segments):
- LineString features connecting nodes
- Properties: `from`, `to`, `type` (main/secondary/path)

## Issues Found

### 1. **Boundary Restriction** ✅ IDENTIFIED
**File**: `web/components/map/enhancedLocationTracking.ts:401-415`

The system checks if user is inside campus boundary:
```typescript
private checkBoundary(): void {
  if (!this.currentPosition || !this.schoolBoundaryRef.current) return;

  const coords = fromLonLat(this.currentPosition.coordinates);
  const isOutside = !isCoordinateInsideSchool(coords, this.schoolBoundaryRef.current);

  this.isOutsideSchoolRef.current = isOutside;
}
```

**Problem**: When testing OUTSIDE campus, this flag is set but:
- ❌ Does NOT hide the marker (correct behavior)
- ✅ Should show marker everywhere (needs verification)

### 2. **Campus Boundary Definition** ✅ IDENTIFIED
**File**: `web/components/map/MapComponent.tsx:1167-1177`

Boundary is set with 500m padding around buildings:
```typescript
const expandedBoundary: Extent = [
  extent[0] - 500,  // 500m buffer west
  extent[1] - 500,  // 500m buffer south
  extent[2] + 500,  // 500m buffer east
  extent[3] + 500,  // 500m buffer north
];
schoolBoundaryRef.current = expandedBoundary;
```

**Issue**: If testing far outside (>500m), you get "outside school" warning but marker should still show.

### 3. **Route Display Outside Campus** ⚠️ POTENTIAL ISSUE

When outside campus:
- Route SHOULD still render
- zIndex is 500 (below user marker at 1000)
- BUT: Route only connects campus nodes, won't extend to your location

## Testing Outside Campus

### Expected Behavior:
1. ✅ GPS marker shows YOUR location (anywhere in the world)
2. ⚠️ Route shows path from NEAREST CAMPUS NODE to destination
3. ✅ Yellow warning: "You appear to be outside campus boundaries"
4. ✅ Navigation uses "main gate as starting point"

### Actual Issues:
1. ❌ User reports: "can't see my current location"
2. ❌ User reports: "no highlighted road"

## Root Cause Analysis

### Why marker might not show:
1. **GPS permission denied** → Check browser console for errors
2. **Coordinates incorrect** → Check console logs for lat/lng
3. **Z-index too low** → User marker is at zIndex 1000 (should be visible)
4. **Layer not added** → Check if `userPositionLayer` is on map

### Why route might not show:
1. **No route selected** → Must scan QR or select destination
2. **Route outside view** → Map centered on GPS, route on campus
3. **Z-index issue** → Route at 500, should be below marker but above roads
4. **Route not rendered** → Check console for "[displayRoute] Route layer added"

## Recommendations

### Immediate Fixes:
1. Add console logging to track GPS position updates
2. Ensure marker displays regardless of boundary check
3. Zoom map to show both user location AND route
4. Add visual indicator when user is far from campus

### Long-term Improvements:
1. Calculate route from user's actual GPS position (not just nearest node)
2. Show distance from campus when outside
3. Provide directions to nearest gate
4. Add "return to campus" mode
