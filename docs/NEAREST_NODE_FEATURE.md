# Nearest Node Feature Implementation

## Overview

This feature allows Points of Interest (POIs) that are not directly on the road network to be routable by mapping them to the nearest road node. When users reach the routing node, they receive additional walking directions to the actual POI location.

## Architecture

### 1. GeoJSON Structure

POIs in `TestPoints.geojson` now include two new properties:

```json
{
  "type": "Feature",
  "properties": {
    "id": "cbe_elevator",
    "name": "CBE ELEVATOR",
    "isDestination": true,
    "category": "Points of Interest",
    "description": "CBE ELEVATOR",
    "nearest_node": "gate7",
    "additionalDirections": "Enter CBE building main entrance. Elevator is on the right side of the lobby."
  },
  "geometry": {
    "type": "Point",
    "coordinates": [123.955704, 10.327094]
  }
}
```

**Properties:**
- `nearest_node`: ID of the nearest road node from `UCLM_Roads.geojson`
- `additionalDirections`: Walking instructions from the road node to the POI

### 2. TypeScript Types

Updated `RoadNode` interface in `roadSystem.ts`:

```typescript
export interface RoadNode {
  id: string;
  name: string;
  isDestination: boolean;
  coordinates: [number, number];
  description?: string;
  category?: string;
  imageUrl?: string;
  nearest_node?: string;              // NEW
  additionalDirections?: string;      // NEW
}
```

### 3. Helper Functions

Two new utility functions in `roadSystem.ts`:

#### `resolveRoutingNode(destination: RoadNode): string`
Resolves the actual node ID to use for routing:
- Returns `nearest_node` if defined (POI not on road network)
- Otherwise returns the destination's own `id` (direct routing)

```typescript
const routingNodeId = resolveRoutingNode(destination);
// "cbe_elevator" → "gate7" (uses nearest_node)
// "gate1" → "gate1" (direct routing)
```

#### `requiresAdditionalDirections(destination: RoadNode): boolean`
Checks if a destination needs additional directions:
- Returns `true` if both `nearest_node` and `additionalDirections` are set
- Used to determine whether to show the directions modal

### 4. Routing Logic

Updated in `MapComponent.tsx` - `handleDestinationSelect()`:

```typescript
const routingNodeId = resolveRoutingNode(destination);
displayRoute(startNodeToUse.id, routingNodeId);

// Log when routing to proxy node
if (routingNodeId !== destination.id) {
  console.log(
    `[Route] Routing to nearest node "${routingNodeId}" for POI "${destination.name}"`
  );
}
```

**Flow:**
1. User selects "CBE ELEVATOR" as destination
2. System resolves routing node: `"cbe_elevator"` → `"gate7"`
3. Route is calculated from current location to `"gate7"`
4. User sees route on map ending at gate7

### 5. Route Completion Detection

In GPS position update callback:

```typescript
if (closestNode.id === routingNodeId) {
  // User reached the routing node
  if (requiresAdditionalDirections(selectedDestination)) {
    setShowAdditionalDirections(true);
  }
}
```

**Detection Logic:**
- Continuously monitors user's GPS position
- When user gets close enough to be assigned to the routing node
- Shows additional directions modal automatically

### 6. UI Component

`AdditionalDirections.tsx` - A modal overlay showing:
- Success message: "You've arrived!"
- Destination name
- Walking directions from nearest node to POI
- "Got it!" button to dismiss

**Features:**
- Responsive design (mobile & desktop)
- Animated entrance (slide-up effect)
- High z-index (2000) to appear above all other UI
- Green success theme with walking emoji

## File Changes

### Modified Files

1. **`web/public/TestPoints.geojson`**
   - Added `nearest_node` and `additionalDirections` to all 28 POIs
   - Values automatically calculated using `scripts/calculateNearestNodes.ts`

2. **`web/components/map/roadSystem.ts`**
   - Updated `RoadNode` interface
   - Added `resolveRoutingNode()` helper
   - Added `requiresAdditionalDirections()` helper
   - Updated `findClosestNode()` to capture new properties

3. **`web/components/map/routeProcessor.ts`**
   - Updated `createNodeFromFeature()` to include new properties

4. **`web/components/map/MapComponent.tsx`**
   - Imported new helper functions
   - Added `showAdditionalDirections` state
   - Updated routing logic in `handleDestinationSelect()`
   - Added route completion detection in GPS callback
   - Integrated `AdditionalDirections` component in JSX

### New Files

1. **`web/components/map/AdditionalDirections.tsx`**
   - React component for displaying walking directions
   - Fully responsive UI
   - Accessibility features

2. **`scripts/calculateNearestNodes.ts`**
   - Automated script to calculate nearest nodes
   - Generates intelligent directions based on POI type
   - Can be run anytime POI locations are updated

## Usage

### For End Users

1. **Select a POI destination** (e.g., "CBE ELEVATOR")
2. **Follow the route** on the map (ends at nearest road node)
3. **Reach the routing node** (e.g., "Gate 7")
4. **Automatic modal appears** with walking directions
5. **Walk to POI** following the directions
6. **Dismiss modal** when done

### For Developers

#### Adding New POIs

1. Add POI to `TestPoints.geojson` with empty `nearest_node`:
```json
{
  "id": "new_poi",
  "name": "New Location",
  "isDestination": true,
  "category": "Points of Interest",
  "nearest_node": "",
  "additionalDirections": "",
  "geometry": {
    "coordinates": [123.123, 10.123],
    "type": "Point"
  }
}
```

2. Run the calculation script:
```bash
npx tsx scripts/calculateNearestNodes.ts
```

3. Script automatically:
   - Calculates nearest road node
   - Generates contextual directions
   - Updates the GeoJSON file

#### Manual Configuration

You can also manually specify:

```json
{
  "nearest_node": "gate7",
  "additionalDirections": "Custom directions here"
}
```

## Benefits

### User Experience
✅ Can navigate to POIs inside buildings
✅ Clear walking directions after route ends
✅ Automatic detection when destination reached
✅ Works on both mobile and kiosk modes

### Developer Experience
✅ Type-safe implementation
✅ Automated nearest node calculation
✅ Backward compatible (optional properties)
✅ Reusable helper functions

### Data Integrity
✅ All 28 POIs have valid nearest nodes
✅ Intelligent direction generation
✅ Verified distances (all < 35m)

## Testing

### Test Scenarios

1. **Route to POI with nearest_node**
   - Select "CBE ELEVATOR"
   - Verify route goes to "gate7"
   - Reach gate7
   - Confirm modal appears with directions

2. **Route to direct road node**
   - Select "Gate 1"
   - Verify route goes directly to gate1
   - Reach gate1
   - Confirm NO modal appears (no additionalDirections)

3. **Mobile vs Desktop**
   - Test on mobile: modal should be full-width
   - Test on desktop: modal should be centered

4. **Modal Dismissal**
   - Click "X" button - modal closes
   - Click "Got it!" button - modal closes
   - Select new destination - modal resets

## Future Enhancements

### Potential Improvements

1. **Photo Support**
   - Add photos of building entrances
   - Show visual directions in modal

2. **Turn-by-Turn**
   - Break walking directions into steps
   - Show progress through steps

3. **Indoor Navigation**
   - Extend to floor-by-floor directions
   - Support multi-floor buildings

4. **Voice Guidance**
   - Text-to-speech for directions
   - Accessibility improvement

5. **Distance Thresholds**
   - Configure trigger distance per POI
   - Some POIs might need closer proximity

## Troubleshooting

### Modal Not Showing

**Issue:** Reached destination but no modal appears

**Checklist:**
- Verify `nearest_node` is set in GeoJSON
- Verify `additionalDirections` is not empty
- Check console for "[Navigation] Reached routing node" log
- Confirm `requiresAdditionalDirections()` returns true

### Wrong Routing Node

**Issue:** Route goes to unexpected node

**Solution:**
```bash
# Recalculate nearest nodes
npx tsx scripts/calculateNearestNodes.ts

# Or manually update in TestPoints.geojson
"nearest_node": "correct_node_id"
```

### Directions Not Updated

**Issue:** Changed directions but not reflecting

**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Clear cache
- Verify GeoJSON file saved correctly

## Code Examples

### Checking if POI Uses Nearest Node

```typescript
import { resolveRoutingNode } from './roadSystem';

const destination: RoadNode = {
  id: 'cbe_elevator',
  name: 'CBE ELEVATOR',
  nearest_node: 'gate7',
  // ...
};

const routingNode = resolveRoutingNode(destination);
console.log(routingNode); // "gate7"

const isDirect = routingNode === destination.id;
console.log(isDirect); // false (uses proxy routing)
```

### Programmatically Showing Directions

```typescript
// In your component
if (requiresAdditionalDirections(destination)) {
  setShowAdditionalDirections(true);
}
```

## Performance Considerations

- ✅ No performance impact on routing (same Dijkstra algorithm)
- ✅ Minimal memory overhead (2 string properties per POI)
- ✅ Lazy rendering (modal only created when shown)
- ✅ Efficient detection (check only on GPS update)

## Accessibility

- Semantic HTML structure
- ARIA labels on close button
- Keyboard navigation support
- High contrast text
- Clear visual hierarchy

## Conclusion

The nearest node feature seamlessly extends the routing system to support off-network POIs while maintaining backward compatibility. The automated calculation script ensures data accuracy, and the intuitive UI provides clear guidance to users.

---

**Last Updated:** December 3, 2025
**Version:** 1.0.0
**Author:** UCLM Navigation Team
