# Interior Movement Pre-Written Narratives System

## Overview
Eliminates expensive LLM calls for interior movement by using pre-written descriptions for the 8 reachable positions in the botica shop floor.

---

## Schematic ASCII Map - Botica Shop Floor (9 Reachable Positions)

```
┌──────────────────────────────────────────────────────────────┐
│                     BOTICA SHOP FLOOR                        │
│                     (1000 x 800 pixels)                      │
│                                                              │
│  Drug Cabinet (130, 563)                                     │
│       ║                                                      │
│       ║                                                      │
│  ╔════╩══════════════════════════════════════════════════╗  │
│  ║                                                        ║  │
│  ║  ROW 1 (North Row, Y = 440px after rounding)          ║  │
│  ║                                                        ║  │
│  ║  [1A]     [1B]      [1C]        [1D]        [1E]      ║  │
│  ║  330,440  440,440   550,440     660,440     770,440   ║  │
│  ║  Near     By        STARTING    Open        Near      ║  │
│  ║  Cabinet  Cabinet   POSITION    Space       Chair     ║  │
│  ║                                                        ║  │
│  ║                                                        ║  │
│  ║              Sales Counter (455, 550)                  ║  │
│  ║              ═══════════════════════                   ║  │
│  ║                                                        ║  │
│  ║  ROW 2 (South Row, Y = 550px after rounding)          ║  │
│  ║                                                        ║  │
│  ║  [2A]     [2B]      [SKIP]      [2C]        [2D]      ║  │
│  ║  330,550  440,550               660,550     770,550   ║  │
│  ║  Far      By                    Central     Near      ║  │
│  ║  SW       Counter               South       Chair     ║  │
│  ║                                                        ║  │
│  ║                                      Waiting Chair     ║  │
│  ║                                      (830, 630) ■      ║  │
│  ╚════════════════════════════════════════════════════════╝  │
│                                                              │
│                  Main Entrance (400, 700)                    │
│                         [==Door==]                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Movement Grid Details

**Grid System:**
- **Collision Grid**: 20px cells (50 × 40 grid for 1000×800 map)
- **Movement Grid**: 110px steps for interior movement
- **Result**: 2 rows × 5 columns = **9 reachable positions** (1 position blocked by counter)

**Calculations:**
- Starting position: [510, 480] → rounds to [550, 440] (Row 1, Column 3)
- MOVEMENT_STEP = 110px
- Rounding formula: `Math.round(position / 110) * 110`
- Available X positions: 330, 440, 550, 660, 770 (5 columns)
- Available Y positions: 440, 550 (2 rows)
- Position 550,550 is blocked by Sales Counter

**Furniture Positions:**
- Drug Cabinet: [130, 563] (northwest wall)
- Sales Counter: [455, 550] (center, blocks 550,550)
- Waiting Chair: [830, 630] (southeast corner)

---

## POI Integration Method

**How It Works:**
1. Furniture items registered as entities in EntityManager
2. Pre-written narratives naturally mention furniture names
3. NarrativePanel.js automatically detects entity names via regex
4. Entity names become clickable purple links
5. Click opens POIModal with furniture details

**No Special Syntax Needed** - Just write naturally:
- ✅ "You approach the Drug Cabinet..." → "Drug Cabinet" becomes clickable
- ✅ "The Sales Counter gleams in..." → "Sales Counter" becomes clickable
- ✅ "You notice the Waiting Chair..." → "Waiting Chair" becomes clickable

---

## Pre-Written Narratives for Each Position

### Position 1A (290, 420) - Northwest Corner
**Near Drug Cabinet**

```javascript
{
  coordinates: [290, 420],
  description: `You stand near the northwest corner of the shop. The Drug Cabinet looms
    beside you, its dark mahogany surface gleaming in the filtered light from the window.
    Through the glass doors you can see rows of ceramic jars and glass vials arranged on
    velvet-lined shelves. The cabinet's brass handles are cool to the touch, worn smooth
    from years of use. A faint medicinal scent—cinnamon, camphor, and something sharper—
    emanates from the sealed wood. You notice a small brass keyhole beneath the left handle.
    The Drug Cabinet stands as a testament to your profession, its contents representing
    both healing and profit.`,
  nearbyPOIs: ['Drug Cabinet'],
  ambience: 'dim',
  scents: ['cinnamon', 'camphor', 'varnished wood']
}
```

---

### Position 1B (400, 420) - North Center
**By Drug Cabinet (Front View)**

```javascript
{
  coordinates: [400, 420],
  description: `You position yourself directly in front of the Drug Cabinet, examining
    its ornate façade. The cabinet's twin glass doors reflect your face back at you,
    distorted slightly by the antique bubbled glass. Behind the panes, you can inventory
    your prepared medicines: the blue-labeled tinctures on the top shelf, the amber powders
    in the middle, and the sealed ointment pots below. A small handwritten label on the
    cabinet's cornice reads "Medicamenta Composita" in your careful script. The Drug Cabinet
    represents hours of careful preparation—each compound mixed according to the ancient
    authorities. Dust motes dance in the light as you contemplate your inventory.`,
  nearbyPOIs: ['Drug Cabinet'],
  ambience: 'studious',
  scents: ['dried herbs', 'beeswax', 'aged paper']
}
```

---

### Position 1C (620, 420) - North East-Center
**Open Shop Floor (North)**

```javascript
{
  coordinates: [620, 420],
  description: `You stand in the open north section of your shop floor, the heart of your
    domain. From here, you can survey the entire botica: the Drug Cabinet to your west,
    its glass doors glinting; the Sales Counter to your south, ready to receive customers;
    and the Waiting Chair in the far corner, currently unoccupied. Sunlight streams through
    the high window, illuminating motes of dust suspended in the still air. The terracotta
    tiles beneath your feet are swept clean, their geometric patterns worn smooth by decades
    of footsteps. This is the space where you greet patrons, where first impressions form.
    The room feels expectant, as if awaiting the next patient to cross the threshold.`,
  nearbyPOIs: ['Drug Cabinet', 'Sales Counter', 'Waiting Chair'],
  ambience: 'open',
  scents: ['beeswax floor polish', 'faint incense', 'clean air']
}
```

---

### Position 1D (730, 420) - Northeast Corner
**Near Waiting Chair (Distant View)**

```javascript
{
  coordinates: [730, 420],
  description: `You stand in the northeast quadrant of the shop, closer to the customer
    area. The Waiting Chair sits nearby to your southeast, its woven wicker seat worn smooth
    from countless anxious patients. Even empty, the Waiting Chair seems to hold the memory
    of suffering—you can almost see the ghost of the last patient who sat there, wringing
    their hands while waiting for your examination. Beside the chair, a small wooden side
    table holds a brass bell for summoning your attention when you're in the back rooms.
    The eastern wall here is decorated with a framed print of Dioscorides, the ancient Greek
    physician, examining a mandrake root. His steady gaze seems to watch over your practice.`,
  nearbyPOIs: ['Waiting Chair'],
  ambience: 'anticipatory',
  scents: ['wicker', 'nervous sweat (memory)', 'old paper']
}
```

---

### Position 2A (290, 590) - Southwest Corner
**Far from All Furniture**

```javascript
{
  coordinates: [290, 590],
  description: `You stand in the southwest corner of the shop floor, somewhat removed from
    the main working areas. From this vantage point, the Drug Cabinet is visible to your
    north, though at a distance. The Sales Counter lies ahead toward the center, and the
    Waiting Chair is far to the east. This corner feels quieter, less frequented—a spot
    where you might pause between patients to collect your thoughts. The western wall here
    bears water stains from the rainy season, and you make a mental note to have them
    repaired before they worsen. A small wooden shelf holds your personal effects: a rosary,
    a leather-bound commonplace book, and a crucifix that provides the necessary appearance
    of Catholic devotion.`,
  nearbyPOIs: [],
  ambience: 'secluded',
  scents: ['damp plaster', 'old wood', 'faint mildew']
}
```

---

### Position 2B (400, 590) - South Center
**By Sales Counter**

```javascript
{
  coordinates: [400, 590],
  description: `You stand at the Sales Counter, the nerve center of your commercial
    operations. The counter's polished wooden surface is scarred from years of transactions—
    knife marks from cutting herbs, burn marks from hot wax seals, ink stains from recording
    purchases in your ledger. Behind the Sales Counter, shelves display your wares: bundles
    of dried herbs hanging from hooks, ceramic jars labeled in Latin, small wooden boxes
    containing exotic spices from the Manila galleons. A brass scale sits ready to weigh
    out precise measurements. Your accounting ledger lies open, its pages filled with
    entries in your careful hand. The Sales Counter is where medicine becomes commerce,
    where your knowledge translates into the coin necessary for survival.`,
  nearbyPOIs: ['Sales Counter'],
  ambience: 'commercial',
  scents: ['ink', 'beeswax', 'cinnamon', 'dried lavender']
}
```

---

### Position 2C (620, 590) - **STARTING POSITION** - South East-Center
**Open Shop Floor (South)**

```javascript
{
  coordinates: [620, 590],
  description: `You stand in the central-southern area of your shop, the default position
    from which you begin each day. From here, you have easy access to all corners of your
    domain. The Sales Counter is to your west, ready for commerce. The Drug Cabinet stands
    to your northwest, holding your prepared medicines. The Waiting Chair waits to your
    east for the next patient. Behind you, the main entrance door connects your world to
    the bustling streets of Mexico City. This spot feels balanced, centered—a place of
    readiness. The terracotta floor tiles form a diamond pattern around your feet, and
    you notice how the afternoon light creates long shadows that stretch toward the northern
    wall. From this position, you can survey your small empire of healing.`,
  nearbyPOIs: ['Sales Counter', 'Waiting Chair', 'Drug Cabinet'],
  ambience: 'central',
  scents: ['general shop air', 'herbs', 'wood', 'street sounds from outside']
}
```

---

### Position 2D (730, 590) - Southeast Corner
**Near Waiting Chair**

```javascript
{
  coordinates: [730, 590],
  description: `You stand beside the Waiting Chair, close enough to examine its construction.
    The Waiting Chair is a humble piece of furniture—woven wicker over a wooden frame, its
    seat cushion worn thin and slightly concave from the weight of countless patients. Up
    close, you notice details: a small tear in the wicker weave on the left armrest, a dark
    stain on the cushion (blood? wine? you can't recall), and initials carved into the wooden
    backrest—"M.S. 1673"—left by some long-ago visitor. The Waiting Chair faces toward the
    center of the shop, positioned so patients can watch you work at the Sales Counter or
    Drug Cabinet, perhaps taking comfort in your competent movements. A folded blanket rests
    on the seat for patients who arrive shivering with fever.`,
  nearbyPOIs: ['Waiting Chair'],
  ambience: 'intimate',
  scents: ['wicker', 'old fabric', 'human presence (subtle)']
}
```

---

## Implementation Instructions

### Step 1: Register Furniture as Entities

Add to `src/scenarios/1680-mexico-city/maps/boticaInterior.js` (in initialization):

```javascript
// Import EntityManager
import { entityManager } from '../../../../core/entities/EntityManager';

// Register furniture as POI entities
const registerBoticaFurniture = () => {
  entityManager.register({
    name: 'Drug Cabinet',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: 'An ornate mahogany cabinet with glass doors, storing prepared medicines and compounds',
    position: [130, 563],
    properties: ['Storage', 'Display', 'Inventory Management'],
    historicalContext: `Medicine cabinets in 17th-century apothecaries served both practical
      and symbolic purposes. The glass doors allowed customers to see the variety of prepared
      remedies, demonstrating the apothecary's expertise, while the lock protected valuable
      ingredients from theft.`,
    image: 'drugcabinet.jpg' // If you create a detail image
  });

  entityManager.register({
    name: 'Sales Counter',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: 'A sturdy wooden counter where transactions occur and herbs are measured',
    position: [455, 550],
    properties: ['Commerce', 'Measurement', 'Display'],
    historicalContext: `The counter in a colonial apothecary was the primary point of
      interaction with customers. Its surface bore the marks of daily work: knife scores
      from cutting roots, burn marks from sealing wax, and ink stains from maintaining
      ledgers required by the Protomedicato.`,
    image: 'salescounter.jpg'
  });

  entityManager.register({
    name: 'Waiting Chair',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: 'A worn wicker chair where patients wait to be examined',
    position: [830, 630],
    properties: ['Seating', 'Patient Care', 'Comfort'],
    historicalContext: `Seating for patients in colonial medical practices reflected social
      hierarchies. This simple wicker chair suggests a practice serving middling and common
      folk. Elite patients would expect cushioned chairs, while the poor often stood.`,
    image: 'waitingchair.jpg'
  });
};

// Call during map initialization
registerBoticaFurniture();
```

---

### Step 2: Enable Item Highlighting in NarrativePanel.js

Modify `src/components/NarrativePanel.js` (around line 92):

```javascript
// BEFORE:
const sortedNPCs = Array.from(allEntities)
  .filter(entity => {
    const type = (entity.entityType || entity.type || '').toLowerCase();
    return type === 'npc' || type === 'patient' || type === 'location';
  })
  // ... rest of code

// AFTER: Add 'item' to the filter
const sortedNPCs = Array.from(allEntities)
  .filter(entity => {
    const type = (entity.entityType || entity.type || '').toLowerCase();
    return type === 'npc' || type === 'patient' || type === 'location' || type === 'item';
  })
  // ... rest of code
```

---

### Step 3: Create Interior Movement Narrative Lookup

Add to `src/features/map/services/interiorNarratives.js` (new file):

```javascript
/**
 * Pre-written narratives for interior movement in the botica
 * Eliminates expensive LLM calls for simple position changes
 */

export const BOTICA_INTERIOR_NARRATIVES = {
  '290,420': {
    description: `You stand near the northwest corner of the shop. The Drug Cabinet looms
      beside you, its dark mahogany surface gleaming in the filtered light from the window.
      Through the glass doors you can see rows of ceramic jars and glass vials arranged on
      velvet-lined shelves. The cabinet's brass handles are cool to the touch, worn smooth
      from years of use. A faint medicinal scent—cinnamon, camphor, and something sharper—
      emanates from the sealed wood. You notice a small brass keyhole beneath the left handle.
      The Drug Cabinet stands as a testament to your profession, its contents representing
      both healing and profit.`,
    nearbyPOIs: ['Drug Cabinet']
  },

  '400,420': {
    description: `You position yourself directly in front of the Drug Cabinet, examining
      its ornate façade. The cabinet's twin glass doors reflect your face back at you,
      distorted slightly by the antique bubbled glass. Behind the panes, you can inventory
      your prepared medicines: the blue-labeled tinctures on the top shelf, the amber powders
      in the middle, and the sealed ointment pots below. A small handwritten label on the
      cabinet's cornice reads "Medicamenta Composita" in your careful script. The Drug Cabinet
      represents hours of careful preparation—each compound mixed according to the ancient
      authorities. Dust motes dance in the light as you contemplate your inventory.`,
    nearbyPOIs: ['Drug Cabinet']
  },

  '620,420': {
    description: `You stand in the open north section of your shop floor, the heart of your
      domain. From here, you can survey the entire botica: the Drug Cabinet to your west,
      its glass doors glinting; the Sales Counter to your south, ready to receive customers;
      and the Waiting Chair in the far corner, currently unoccupied. Sunlight streams through
      the high window, illuminating motes of dust suspended in the still air. The terracotta
      tiles beneath your feet are swept clean, their geometric patterns worn smooth by decades
      of footsteps. This is the space where you greet patrons, where first impressions form.
      The room feels expectant, as if awaiting the next patient to cross the threshold.`,
    nearbyPOIs: ['Drug Cabinet', 'Sales Counter', 'Waiting Chair']
  },

  '730,420': {
    description: `You stand in the northeast quadrant of the shop, closer to the customer
      area. The Waiting Chair sits nearby to your southeast, its woven wicker seat worn smooth
      from countless anxious patients. Even empty, the Waiting Chair seems to hold the memory
      of suffering—you can almost see the ghost of the last patient who sat there, wringing
      their hands while waiting for your examination. Beside the chair, a small wooden side
      table holds a brass bell for summoning your attention when you're in the back rooms.
      The eastern wall here is decorated with a framed print of Dioscorides, the ancient Greek
      physician, examining a mandrake root. His steady gaze seems to watch over your practice.`,
    nearbyPOIs: ['Waiting Chair']
  },

  '290,590': {
    description: `You stand in the southwest corner of the shop floor, somewhat removed from
      the main working areas. From this vantage point, the Drug Cabinet is visible to your
      north, though at a distance. The Sales Counter lies ahead toward the center, and the
      Waiting Chair is far to the east. This corner feels quieter, less frequented—a spot
      where you might pause between patients to collect your thoughts. The western wall here
      bears water stains from the rainy season, and you make a mental note to have them
      repaired before they worsen. A small wooden shelf holds your personal effects: a rosary,
      a leather-bound commonplace book, and a crucifix that provides the necessary appearance
      of Catholic devotion.`,
    nearbyPOIs: []
  },

  '400,590': {
    description: `You stand at the Sales Counter, the nerve center of your commercial
      operations. The counter's polished wooden surface is scarred from years of transactions—
      knife marks from cutting herbs, burn marks from hot wax seals, ink stains from recording
      purchases in your ledger. Behind the Sales Counter, shelves display your wares: bundles
      of dried herbs hanging from hooks, ceramic jars labeled in Latin, small wooden boxes
      containing exotic spices from the Manila galleons. A brass scale sits ready to weigh
      out precise measurements. Your accounting ledger lies open, its pages filled with
      entries in your careful hand. The Sales Counter is where medicine becomes commerce,
      where your knowledge translates into the coin necessary for survival.`,
    nearbyPOIs: ['Sales Counter']
  },

  '620,590': {
    description: `You stand in the central-southern area of your shop, the default position
      from which you begin each day. From here, you have easy access to all corners of your
      domain. The Sales Counter is to your west, ready for commerce. The Drug Cabinet stands
      to your northwest, holding your prepared medicines. The Waiting Chair waits to your
      east for the next patient. Behind you, the main entrance door connects your world to
      the bustling streets of Mexico City. This spot feels balanced, centered—a place of
      readiness. The terracotta floor tiles form a diamond pattern around your feet, and
      you notice how the afternoon light creates long shadows that stretch toward the northern
      wall. From this position, you can survey your small empire of healing.`,
    nearbyPOIs: ['Sales Counter', 'Waiting Chair', 'Drug Cabinet']
  },

  '730,590': {
    description: `You stand beside the Waiting Chair, close enough to examine its construction.
      The Waiting Chair is a humble piece of furniture—woven wicker over a wooden frame, its
      seat cushion worn thin and slightly concave from the weight of countless patients. Up
      close, you notice details: a small tear in the wicker weave on the left armrest, a dark
      stain on the cushion (blood? wine? you can't recall), and initials carved into the wooden
      backrest—"M.S. 1673"—left by some long-ago visitor. The Waiting Chair faces toward the
      center of the shop, positioned so patients can watch you work at the Sales Counter or
      Drug Cabinet, perhaps taking comfort in your competent movements. A folded blanket rests
      on the seat for patients who arrive shivering with fever.`,
    nearbyPOIs: ['Waiting Chair']
  }
};

/**
 * Get pre-written narrative for a position in botica interior
 * @param {number} x - X coordinate (pixel)
 * @param {number} y - Y coordinate (pixel)
 * @returns {Object|null} - Narrative object or null if not found
 */
export const getInteriorNarrative = (x, y) => {
  // Round to nearest movement grid position (110px steps)
  const MOVEMENT_STEP = 110;
  const gridX = Math.round(x / MOVEMENT_STEP) * MOVEMENT_STEP;
  const gridY = Math.round(y / MOVEMENT_STEP) * MOVEMENT_STEP;

  const key = `${gridX},${gridY}`;
  return BOTICA_INTERIOR_NARRATIVES[key] || null;
};

/**
 * Check if position has a pre-written narrative
 * @param {string} mapId - Map identifier
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean}
 */
export const hasPreWrittenNarrative = (mapId, x, y) => {
  if (mapId !== 'botica-interior') return false;
  return getInteriorNarrative(x, y) !== null;
};
```

---

### Step 4: Integrate into useGameHandlers.js

Modify `src/pages/hooks/useGameHandlers.js` in the arrow key movement handler (around line 1427):

```javascript
// Add import at top of file
import {
  getInteriorNarrative,
  hasPreWrittenNarrative
} from '../../features/map/services/interiorNarratives';

// In handleArrowKeyMovement function (around line 1427):

const handleArrowKeyMovement = async (direction) => {
  // ... existing validation code ...

  // After successful movement validation:
  const newPosition = { x: newX, y: newY };

  // Check if we have a pre-written narrative for this position
  const isInterior = currentLocation?.locationType === 'Interior';
  const currentMapId = currentLocation?.mapId;

  if (isInterior && hasPreWrittenNarrative(currentMapId, newX, newY)) {
    console.log('[Movement] Using pre-written interior narrative');

    const narrative = getInteriorNarrative(newX, newY);

    // Update position immediately (no LLM call needed)
    setPlayerPosition(newPosition);

    // Add narrative to conversation history
    const newEntry = {
      role: 'assistant',
      content: narrative.description,
      timestamp: new Date().toISOString(),
      isMovement: true,
      position: newPosition
    };

    setConversationHistory(prev => [...prev, newEntry]);

    // Minimal state update (no time passage, no energy cost for simple repositioning)
    // OR you can add minimal energy cost if desired:
    // updateEnergy(-1); // Tiny cost for shifting position

    return; // Exit early - no LLM call needed!
  }

  // ELSE: Fall back to LLM-generated movement narrative (for exterior or unknown positions)
  console.log('[Movement] Using LLM-generated narrative');

  // ... existing orchestrateTurn() call ...
};
```

---

## Cost Savings Analysis

**Current System (LLM per move):**
- LLM call: ~5,000 tokens @ $0.02/1K tokens = $0.10 per move
- Average interior session: 20 moves = $2.00
- Latency: 2-3 seconds per move

**Pre-Written System (8 positions):**
- LLM call: $0.00 (no API call)
- Average interior session: 20 moves = $0.00
- Latency: <100ms per move (instant)
- One-time writing cost: 8 narratives × 5 min = 40 minutes

**Savings per 1,000 interior moves:**
- Cost: $100 → $0 (100% reduction)
- Time: 2,500 seconds → 100 seconds (96% reduction)
- User experience: Dramatically improved (instant feedback)

---

## Edge Cases & Fallbacks

**Position Rounding:**
- If player ends up at non-standard position (e.g., [625, 590] instead of [620, 590])
- `getInteriorNarrative()` rounds to nearest 110px grid
- Ensures reliable lookup even with slight position drift

**Unknown Positions:**
- If `hasPreWrittenNarrative()` returns false
- Falls back to LLM-generated narrative (existing behavior)
- Graceful degradation for edge cases

**Future Maps:**
- System only applies to `botica-interior` map
- Other interiors can have their own narrative libraries added incrementally
- No breaking changes to existing LLM system

---

## Testing Checklist

- [ ] Register furniture entities in EntityManager
- [ ] Verify furniture names become clickable purple links in narrative
- [ ] Click Drug Cabinet → POIModal opens with cabinet details
- [ ] Click Sales Counter → POIModal opens with counter details
- [ ] Click Waiting Chair → POIModal opens with chair details
- [ ] Move to position (290, 420) → Narrative mentions Drug Cabinet
- [ ] Move to position (730, 590) → Narrative mentions Waiting Chair
- [ ] Move to position (400, 590) → Narrative mentions Sales Counter
- [ ] Verify instant movement response (<100ms)
- [ ] Verify no LLM calls during interior position changes
- [ ] Test fallback to LLM for unknown positions
- [ ] Test exterior movement still uses LLM

---

## Future Enhancements

**Dynamic Detail Injection:**
- Add time-of-day variations: "The Drug Cabinet gleams in the morning light..."
- Add NPC presence: "You notice Beatriz browsing near the Sales Counter..."
- Add weather effects: "Rain drums on the window beside the Drug Cabinet..."

**Contextual Branching:**
- If inventory.includes('Cacao'): Mention Cacao on counter
- If patient waiting: Mention patient in Waiting Chair
- If low on stock: Mention sparse shelves behind Sales Counter

**Multi-Room Expansion:**
- Create narrative libraries for back laboratory (mixing room)
- Create narrative libraries for storage cellar
- Create narrative libraries for living quarters upstairs

---

**Last Updated:** October 18, 2025
**Status:** Ready for Implementation
**Estimated Implementation Time:** 30 minutes