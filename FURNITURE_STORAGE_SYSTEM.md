# Furniture Storage System

## Overview
The furniture storage system allows players to store items in furniture entities throughout the botica. Items can be dragged from the inventory and dropped onto furniture storage spaces.

## Implementation Date
October 2025

## Features Implemented

### 1. Storage Configuration (`src/core/config/furnitureStorage.config.js`)
- Centralized configuration for all furniture storage
- Defines capacity, allowed item types, and special features per furniture
- Helper functions: `hasStorage()`, `hasFalseBottom()`, `getStorageConfig()`, `canStoreItemType()`

### 2. Furniture with Storage

#### Shop Floor
- **Drug Cabinet**: 20 items (medicines, compounds, prepared remedies)
- **Sales Counter**: 10 items (tools, coins, ledgers)

#### Laboratory
- **Workbench**: 15 items (tools, apparatus, equipment, chemicals)
- **Herb Shelf**: 30 items (herbs, spices, botanicals, ingredients)

#### Bedroom
- **Bed**: 5 items (clothing, textiles, blankets)
- **Bookshelf**: 12 items (books, scrolls, documents, manuscripts)
- **Clothing Chest**: 15 visible + 5 hidden (clothing, jewelry, valuables, contraband)

### 3. Special Feature: False Bottom (Clothing Chest)
- Hidden compartment accessed via "Reveal False Bottom" button
- Stores prohibited/dangerous items (contraband, evidence, prohibited books)
- Separate capacity from visible storage (5 items)
- Can be hidden/revealed by player

### 4. UI Components

#### Overview Mode
- Shows normal POI information (description, historical context)
- "Open" button for furniture with storage (🔓 icon)

#### Storage Mode
- Displays open furniture image (e.g., `clothing_chest_open.png`)
- Item icons visually overlaid on the furniture image
- Storage instructions and capacity counter
- Grid view of stored items with click-to-remove
- Visual feedback when hovering during drag (ring highlight)

### 5. Drag-and-Drop Integration
- Uses `react-dnd` library (same as inventory system)
- Drag items from inventory → drop on furniture header image
- Drop validation: checks item type compatibility
- Capacity enforcement: prevents overfilling
- Visual feedback: ring highlight on hover during drag

### 6. State Management
- `viewMode`: 'overview' | 'storage'
- `storedItems`: array of items in visible storage
- `hiddenItems`: array of items in false bottom
- `showFalseBottom`: boolean toggle for revealing hidden compartment

### 7. Parent Integration
- `GameModals.jsx`: Passes `inventory` and `onInventoryUpdate` to POIModal
- `NarrativePanel.js`: Passes inventory (TODO: wire up updateInventory callback)
- Inventory updates immediately remove/add items when storing/retrieving

## Technical Details

### Image Paths
- Closed furniture: `/details/{furniture_name}.png` (e.g., `clothing_chest.png`)
- Open furniture: `/details/{furniture_name}_open.png` (e.g., `clothing_chest_open.png`)
- Item icons: `/icons/{item_name}_icon.png` (normalized: lowercase, no apostrophes, underscores for spaces)

### Validation Logic
```javascript
// Check if item type matches furniture's allowed types
canStoreItemType(furnitureName, itemType, isHidden)

// Examples:
canStoreItemType('Bookshelf', 'book', false) // ✅ true
canStoreItemType('Bookshelf', 'herb', false) // ❌ false
canStoreItemType('Clothing Chest', 'prohibited_book', true) // ✅ true (hidden)
canStoreItemType('Clothing Chest', 'prohibited_book', false) // ❌ false (visible)
```

### React DnD Integration
```javascript
// Drop zone for visible storage
const [{ isOverVisible }, dropVisibleRef] = useDrop(() => ({
  accept: 'INVENTORY_ITEM',
  drop: (item) => handleItemDrop(item, false),
  collect: (monitor) => ({ isOverVisible: monitor.isOver() }),
}), [dependencies]);

// Apply ref to drop zone
<div ref={dropVisibleRef} className={isOverVisible ? 'ring-4 ring-amber-400' : ''}>
```

## Storage Persistence

### Current Implementation (In-Memory Only)
- Storage state resets on page reload
- Items return to inventory when modal closes or page refreshes
- **Rationale**: Save game system not yet implemented, avoiding partial localStorage implementation

### Future Implementation (When Save Games Are Ready)
```javascript
// Save to localStorage alongside other game state
const gameState = {
  // ... existing state
  furnitureStorage: {
    'Drug Cabinet': [{ name: 'Cinnamon', icon: 'cinnamon_icon.png', quantity: 1 }],
    'Clothing Chest': {
      visible: [{ name: 'Shawl', icon: 'shawl_icon.png', quantity: 1 }],
      hidden: [{ name: 'Prohibited Book', icon: 'book_icon.png', quantity: 1 }]
    }
  }
};
```

## Assets Required

### Furniture Open-State Images (Need to be Created)
Place in `/public/details/`:
- `drug_cabinet_open.png`
- `sales_counter_open.png`
- `workbench_open.png`
- `herb_shelf_open.png`
- `bed_open.png`
- `bookshelf_open.png`
- `clothing_chest_open.png`

**Image Specifications**:
- Dimensions: ~800x600px (header image size in modal)
- Style: Interior view showing storage compartments
- Format: PNG with transparency if needed
- Perspective: Front-facing view of open furniture

### Item Icons (Already Exist)
- All materia medica already have icons in `/public/icons/`
- Format: `{item_name}_icon.png` (e.g., `cinnamon_icon.png`)
- These are reused from inventory system

## Usage

1. **Player clicks furniture POI link** in narrative
2. **POIModal opens in overview mode** showing furniture details
3. **Player clicks "Open {Furniture Name}" button**
4. **Modal switches to storage mode** showing open furniture image
5. **Player drags items from inventory** (left sidebar)
6. **Player drops items on header image** (visual overlay appears)
7. **Items are removed from inventory** and added to storage
8. **Player clicks stored items** to remove them (returns to inventory)
9. **For Clothing Chest**: Player clicks "Reveal False Bottom" to access hidden storage

## Future Enhancements

### Phase 1: Polish
- [ ] Add sound effects (open/close furniture, drop items)
- [ ] Animation for item placement on image overlay
- [ ] Tooltips showing allowed item types for each furniture
- [ ] Better visual feedback for invalid drops (shake animation, error message)

### Phase 2: Gameplay Integration
- [ ] NPC searches: Inquisitor can discover hidden items (Investigation skill check)
- [ ] Decay system: Food items in storage spoil over time
- [ ] Organization bonuses: Well-organized storage speeds up finding items
- [ ] Storage upgrades: Purchase better furniture with higher capacity

### Phase 3: Advanced Features
- [ ] Item stacking: Store multiple quantities of same item
- [ ] Auto-sort: Automatically organize items by type
- [ ] Quick transfer: Shift-click to move items
- [ ] Storage search: Filter stored items by name/type
- [ ] Shared storage: Multiple furniture pieces share storage pools

## Files Modified

### New Files
- `/Users/benjaminbreen/code/Apothecary Simulator/src/core/config/furnitureStorage.config.js`

### Modified Files
- `/Users/benjaminbreen/code/Apothecary Simulator/src/components/POIModal.jsx`
- `/Users/benjaminbreen/code/Apothecary Simulator/src/pages/components/GameModals.jsx`
- `/Users/benjaminbreen/code/Apothecary Simulator/src/components/NarrativePanel.js`

## Testing Checklist

- [x] Storage configuration loads correctly
- [ ] "Open" button appears for furniture with storage
- [ ] Modal switches to storage view when opened
- [ ] Header image changes to open-state image
- [ ] Drag-and-drop works from inventory to furniture
- [ ] Item type validation prevents invalid storage
- [ ] Capacity limits enforced
- [ ] Items visually appear on header image overlay
- [ ] Click-to-remove returns items to inventory
- [ ] False bottom reveals/hides correctly
- [ ] Hidden storage accepts only allowed item types
- [ ] Modal resets to overview when closed
- [ ] State persists while modal is open

## Known Limitations

1. **No persistence**: Storage resets on page reload (by design until save system ready)
2. **No bulk operations**: Can only move 1 item at a time
3. **No item stacking**: Each stored item is separate (even if same type)
4. **No visual item placement**: Items overlay in grid, not positioned on furniture image
5. **NarrativePanel not fully wired**: updateInventory callback needs parent hook-up

## Notes

- Image overlay uses flexbox grid, not absolute positioning (easier to implement)
- For authentic experience, consider absolute positioning with predefined slots
- False bottom feature adds historical flavor and gameplay depth
- Storage system designed to be expandable for future furniture additions
