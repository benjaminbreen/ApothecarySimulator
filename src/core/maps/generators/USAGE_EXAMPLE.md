# Procedural Map Generation - Usage Guide

## Overview

The procedural map generation system allows you to create historically accurate, contextually appropriate maps by combining **generic templates** with **LLM-generated labels**.

### Key Concept

**Template** (generic structure) + **LLM Labels** (contextual names) = **Complete Map** (ready to render)

---

## Quick Start

### 1. Generate a Map from Template

```javascript
import { generateMap } from './core/maps/generators';
import scenario from './scenarios/1680-mexico-city/config';

// Generate a small colonial house for 1680s Mexico City
const map = await generateMap(
  'small-colonial-house',  // Template ID
  scenario,                 // Scenario config
  {
    characterProfession: 'apothecary',
    characterName: 'Maria de Lima',
    locationContext: {
      neighborhood: 'Plaza Mayor',
      socialClass: 'merchant'
    }
  }
);

// Result: Complete map with rooms named contextually
// e.g., "Botica" instead of "Shop Floor", "Taller" instead of "Laboratory"
```

### 2. Use Default Labels (No LLM)

For faster generation or when LLM is unavailable:

```javascript
const map = await generateMap(
  'small-colonial-house',
  scenario,
  {
    useDefaults: true  // Skip LLM, use template's default labels
  }
);

// Result: Rooms use defaultLabel from template
// e.g., "Shop Floor", "Laboratory", "Bedroom"
```

### 3. Override Specific Labels

Mix LLM generation with manual overrides:

```javascript
const map = await generateMap(
  'small-colonial-house',
  scenario,
  {
    characterProfession: 'physician',
    overrideLabels: {
      'ROOM_1_NAME': 'Consultation Chamber',  // Manual override
      'ROOM_2_NAME': 'Surgery'                // Manual override
      // ROOM_3_NAME will be LLM-generated
    }
  }
);
```

---

## Advanced Usage

### Generate Multiple Maps

```javascript
import { generateMaps } from './core/maps/generators';

const maps = await generateMaps(
  ['small-colonial-house', 'baroque-city-grid'],  // Multiple templates
  scenario,
  {
    characterProfession: 'apothecary',
    characterName: 'Maria de Lima'
  }
);

// Result: { 'small-colonial-house': {...}, 'baroque-city-grid': {...} }
```

### Custom Furniture Layout

```javascript
import { generateMapWithFurniture } from './core/maps/generators';

const customFurniture = [
  {
    id: 'custom-counter',
    name: 'Ornate Sales Counter',
    type: 'counter',
    position: [500, 550],
    size: [400, 80],
    rotation: 0
  },
  // ... more furniture
];

const map = await generateMapWithFurniture(
  'small-colonial-house',
  scenario,
  customFurniture,
  { useDefaults: true }
);
```

### Label Generation Only

If you only need labels without full map generation:

```javascript
import { generateMapLabels } from './core/maps/generators';
import { getTemplate } from './core/maps/templates';

const template = getTemplate('baroque-city-grid');
const labels = await generateMapLabels(template, scenario, {
  characterProfession: 'merchant',
  locationContext: {
    neighborhood: 'Waterfront District'
  }
});

// Result:
// {
//   'CENTRAL_LANDMARK': 'Cathedral of the Assumption',
//   'NW_BUILDING': 'Fish Market',
//   'NE_BUILDING': 'Customs House',
//   'SW_BUILDING': 'Sailors' Quarters',
//   'SE_BUILDING': 'Harbor Watch',
//   'MAIN_STREET': 'Calle del Mar',
//   'CROSS_STREET': 'Avenida de los Comerciantes'
// }
```

---

## Template System

### Available Templates

1. **`small-colonial-house`** (Interior)
   - 3 zones: commercial, workspace, private
   - Era: colonial, baroque, early-modern
   - Best for: Apothecaries, merchants, artisans, physicians

2. **`baroque-city-grid`** (Exterior)
   - 5 buildings + street grid
   - Era: baroque, colonial, early-modern
   - Best for: City-level maps with mixed districts

### Creating New Templates

See `/src/core/maps/templates/index.js` for template structure.

Key fields for procedural generation:
- `labelSlot`: Unique ID for LLM to populate (e.g., "ROOM_1_NAME")
- `defaultLabel`: Fallback name if LLM fails
- `category`: Context for LLM (e.g., "commercial", "residential")
- `description`: Detailed description for LLM context
- `suggestedLabels`: Array of example names

---

## Integration with Scenario System

### Example: Adding Procedural Maps to a Scenario

```javascript
// scenarios/1880-london/config.js

import { generateMap } from '../../core/maps/generators';

export async function loadScenario() {
  const config = {
    id: '1880-london',
    setting: 'Whitechapel, London',
    year: 1880,
    // ... other config
  };

  // Generate maps procedurally
  const interiorMap = await generateMap(
    'small-colonial-house',  // Reuse same template
    config,
    {
      characterProfession: 'physician',
      characterName: 'Dr. Henry Jekyll',
      locationContext: {
        neighborhood: 'Whitechapel',
        socialClass: 'upper-middle'
      }
    }
  );

  const cityMap = await generateMap(
    'baroque-city-grid',  // Same city template
    config,
    {
      characterProfession: 'physician',
      overrideLabels: {
        'CENTRAL_LANDMARK': 'St. Paul\'s Cathedral',
        'NW_BUILDING': 'Scotland Yard'
      }
    }
  );

  config.maps = {
    'physicians-office': interiorMap,
    'london-streets': cityMap
  };

  return config;
}
```

---

## LLM Behavior

### What the LLM Considers

When generating labels, the LLM is prompted with:
- **Era** (e.g., "colonial, baroque, early-modern")
- **Setting** (e.g., "Mexico City, 1680")
- **Character profession** (e.g., "apothecary")
- **Zone category** (e.g., "commercial", "residential", "medical")
- **Zone description** (e.g., "Main public-facing room for business")
- **Suggested labels** (e.g., ["Shop Floor", "Trading Room", "Consultation Room"])

### Example Outputs

**1680s Mexico City Apothecary:**
```json
{
  "ROOM_1_NAME": "Botica de Ventas",      // Commercial zone
  "ROOM_2_NAME": "Taller de Mezclas",     // Workspace zone
  "ROOM_3_NAME": "Alcoba Privada"         // Private zone
}
```

**1680s London Apothecary:**
```json
{
  "ROOM_1_NAME": "Apothecary Shop",
  "ROOM_2_NAME": "Distillation Laboratory",
  "ROOM_3_NAME": "Private Chambers"
}
```

**1880s New York Pharmacist:**
```json
{
  "ROOM_1_NAME": "Pharmacy Counter",
  "ROOM_2_NAME": "Compounding Lab",
  "ROOM_3_NAME": "Proprietor's Quarters"
}
```

---

## Performance Considerations

### Speed vs. Quality

- **LLM Generation**: ~2-5 seconds, contextually rich
- **Default Labels**: Instant, generic but functional

### Caching

Consider caching generated labels in localStorage:

```javascript
const cacheKey = `map-labels-${templateId}-${scenario.id}`;
const cached = localStorage.getItem(cacheKey);

if (cached) {
  const labels = JSON.parse(cached);
  const map = populateTemplate(template, labels);
} else {
  const labels = await generateMapLabels(template, scenario, options);
  localStorage.setItem(cacheKey, JSON.stringify(labels));
  const map = populateTemplate(template, labels);
}
```

---

## Error Handling

The system has robust fallbacks:

1. **LLM API Failure**: Falls back to default labels
2. **Invalid JSON**: Retries parsing, then uses defaults
3. **Missing Slots**: Fills with template defaults
4. **Template Not Found**: Throws error (catch this!)

```javascript
try {
  const map = await generateMap('invalid-template', scenario);
} catch (error) {
  console.error('Map generation failed:', error);
  // Use hardcoded map or show error to user
}
```

---

## Testing

### Manual Testing

```javascript
import { generateMap } from './core/maps/generators';
import scenario from './scenarios/1680-mexico-city/config';

// Test with console logging
const map = await generateMap('small-colonial-house', scenario, {
  characterProfession: 'apothecary'
});

console.log('Generated Map:', map);
console.log('Room Names:', map.rooms.map(r => r.name));
```

### Expected Output Structure

```javascript
{
  id: 'small-colonial-house-1709847362829',
  type: 'interior',
  name: 'Small Colonial House',
  style: 'colonial-interior',
  bounds: { width: 1000, height: 800 },
  rooms: [
    {
      id: 'zone-1',
      name: 'Botica de Ventas',  // LLM-generated
      polygon: [[100, 400], [900, 400], [900, 700], [100, 700]],
      type: 'shop-floor',
      category: 'commercial',
      description: 'Main public-facing room for business'
    },
    // ... more rooms
  ],
  doors: [ /* ... */ ],
  furniture: [ /* ... */ ],
  backgroundColor: '#1a1f2e',
  generatedFrom: 'small-colonial-house',
  generatedAt: '2025-10-09T21:30:00.000Z'
}
```

---

## Next Steps

1. **Create More Templates**: Add medieval taverns, Victorian pharmacies, etc.
2. **Add Furniture Generation**: LLM-generated furniture with historical accuracy
3. **Multi-floor Support**: Stairways, basements, upper floors
4. **Outdoor Spaces**: Gardens, courtyards, alleyways
5. **NPC Placement**: Procedurally position NPCs based on map zones

---

## API Reference

### `generateMap(templateId, scenario, options)`

**Parameters:**
- `templateId` (string): Template identifier
- `scenario` (object): Scenario configuration
- `options` (object):
  - `useDefaults` (boolean): Skip LLM generation
  - `characterProfession` (string): Character profession
  - `characterName` (string): Character name
  - `locationContext` (object): Additional context
  - `overrideLabels` (object): Manual label overrides

**Returns:** Promise<Object> - Complete map data

---

### `generateMapLabels(template, scenario, options)`

**Parameters:**
- `template` (object): Template object (not ID)
- `scenario` (object): Scenario configuration
- `options` (object): Generation options

**Returns:** Promise<Object> - Label slot mappings

---

### `generateMaps(templateIds, scenario, options)`

**Parameters:**
- `templateIds` (string[]): Array of template IDs
- `scenario` (object): Scenario configuration
- `options` (object): Generation options

**Returns:** Promise<Object> - Map of template IDs to generated maps

---

## License

Part of Apothecary Simulator project.
