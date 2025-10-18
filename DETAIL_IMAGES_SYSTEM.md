# Detail Images System for POIs and Furniture

## Overview
I've implemented a system that automatically displays detail images for Points of Interest (POIs) and furniture items when they are clicked, either in the narrative text or on the map.

## How It Works

### 1. Image Naming Convention
Detail images should be placed in `public/details/` with the following naming format:
- **Format**: `{name_in_lowercase_with_underscores}.png`
- **Examples**:
  - "Shop Counter" → `shop_counter.png`
  - "Sales Counter" → `sales_counter.png`
  - "Mortar and Pestle" → `mortar_and_pestle.png`
  - "Display Shelf" → `display_shelf.png`

The system automatically:
- Converts to lowercase
- Replaces spaces with underscores
- Removes special characters
- Appends `.png`

### 2. File Created

**`src/utils/detailImageResolver.js`**
```javascript
// Converts POI names to filenames
nameToFilename("Shop Counter") // → "shop_counter.png"

// Returns the path to check
getDetailImagePathSync("Shop Counter") // → "/details/shop_counter.png"
```

### 3. Files Modified

**`src/components/POIModal.jsx`**
- Now checks for detail images FIRST before falling back to other image sources
- Priority order:
  1. Detail image in `/details/` folder (NEW!)
  2. Entity's explicit image property
  3. Portrait resolver (for NPCs)
  4. Fallback images by type

**`src/features/map/components/InteriorMap.jsx`**
- Added `onFurnitureClick` prop
- Furniture items now trigger click handler when clicked
- Click handler receives the furniture item object

## Integration Required

To complete the integration, you need to connect the furniture click handler in the component that renders `MapRenderer`. Here's what to add:

### In the component that uses MapRenderer (likely GamePage.jsx or ViewportPanel.js):

```javascript
// Add this handler
const handleFurnitureClick = (furnitureItem) => {
  // Convert furniture item to entity format for POIModal
  const entity = {
    name: furnitureItem.name,
    entityType: 'location', // or 'furniture' if you want a custom type
    description: furnitureItem.description || `A ${furnitureItem.name.toLowerCase()} in the shop.`,
    locationType: 'Interior',
    type: furnitureItem.type,
    ...furnitureItem // spread any other properties
  };

  // Open POIModal with this entity
  setSelectedPOI(entity);
  setShowPOIModal(true);
};
```

### Pass it through to InteriorMap:

In `MapRenderer.jsx`, add the handler to the InteriorMap components (lines ~574 and ~706):
```jsx
<InteriorMap
  mapData={currentMapData}
  npcs={npcMarkers}
  playerPosition={playerPosition}
  playerFacing={playerFacing}
  onRoomClick={handleRoomClick}
  onDoorClick={handleDoorClick}
  onFurnitureClick={onFurnitureClick}  // ADD THIS
  viewBox={viewBox}
  theme={theme}
  isModal={false}
/>
```

And add `onFurnitureClick` to MapRenderer's props.

## Usage

### Adding a New Detail Image:

1. **Create/obtain the image** (PNG format recommended)
2. **Name it correctly**: `shop_counter.png`
3. **Place in** `public/details/`
4. **Done!** The system will automatically:
   - Check for the image when the POI/furniture is clicked
   - Display it in the POIModal header
   - Fall back to default images if not found

### For Narrative POIs:
POIs mentioned in narrative text (like "sales counter") are already highlighted and clickable through the existing entity system. When clicked, they open POIModal, which will now check for and display the detail image automatically.

### For Map Furniture:
When a player clicks a furniture item on the map (like the shop counter), the `onFurnitureClick` handler is triggered, which should open POIModal with that furniture as an entity.

## Current Status

✅ **Completed:**
- Detail image resolver utility
- POIModal integration with detail images
- Furniture click handlers in InteriorMap

⏳ **Needs Connection:**
- Wire up furniture click handler through MapRenderer → ViewportPanel → GamePage
- Test with shop_counter.png

## Testing

Once integrated, test by:
1. Adding `shop_counter.png` to `/public/details/`
2. Walking to the sales counter in the shop
3. Clicking on it (either in narrative or on map)
4. POIModal should open with the detail image

## Error Handling

The system gracefully handles missing images:
- If detail image doesn't exist → falls back to entity's image property
- If that doesn't exist → uses portrait resolver (for NPCs)
- If all else fails → uses default parchment texture

No errors will occur from missing images; the fallback chain ensures something always displays.
