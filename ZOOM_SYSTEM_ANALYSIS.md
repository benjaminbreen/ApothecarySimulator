# Background Zoom System Analysis

## Current Implementation (House Calls)

### Architecture

**State Management** (`src/pages/GamePage.jsx`)
```javascript
const [travelZoomState, setTravelZoomState] = useState({
  isActive: false,
  progress: 0,      // 0-100 animation progress
  targetX: 50       // Horizontal target position (% from left, 0-100)
});
```

**Zoom Transform Calculation** (`src/components/WeatherBackground.jsx`, lines 237-262)
```javascript
const zoomTransform = useMemo(() => {
  if (!travelZoom?.isActive) {
    return { transform: 'scale(1) translateY(0%) translateX(0%)', ... };
  }

  const progress = travelZoom.progress / 100; // 0 to 1

  // Zoom: 1.0 → 2.0 (doubles size at completion)
  const scale = 1.0 + (progress * 1.0);

  // Pan UP to focus on buildings at bottom of horizon
  const translateY = progress * -50; // 0% → -50%

  // Pan horizontally to specific building
  const translateX = (travelZoom.targetX - 50) * progress * 0.5;

  return {
    transform: `scale(${scale}) translateY(${translateY}%) translateX(${translateX}%)`,
    transition: 'transform 0.1s linear',
    willChange: 'transform'
  };
}, [travelZoom]);
```

**Applied to entire background** (line 294):
```javascript
<div className="absolute inset-0" style={{ ...zoomTransform, ... }}>
  {/* Sky, clouds, horizon, weather effects */}
</div>
```

### Building Position Mapping

**Notable Buildings** (`src/components/HorizonLine.jsx`, lines 18-54):
```javascript
const NOTABLE_BUILDINGS = {
  cathedral: {
    name: "Metropolitan Cathedral",
    bounds: { x: 92, y: 183, width: 95, height: 117 }
  },
  botica: {
    name: "Botica de la Amargura",
    bounds: { x: 1028, y: 276, width: 30, height: 24 }
  },
  // ... other buildings
};
```

**SVG ViewBox:** 0 to 1200 (width)

**Calculate targetX from building:**
```javascript
// Cathedral center: x=92 + (95/2) = 139.5
// targetX = (139.5 / 1200) * 100 = 11.6%

// Botica center: x=1028 + (30/2) = 1043
// targetX = (1043 / 1200) * 100 = 86.9%
```

### House Call Flow

1. **Trigger:** User accepts house call treatment (`src/pages/hooks/useMedicalHandlers.js`)
2. **Target Selection:** Random building position based on patient class (`src/features/medical/services/houseSelector.js`):
   ```javascript
   const BUILDING_POSITIONS = {
     humble: [18, 32, 45, 58, 72, 85],
     middling: [12, 42, 68, 88],
     wealthy: [25, 55, 78]
   };
   ```
3. **Animation:** Travel animation updates progress 0→100
4. **Callbacks:** `handleTravelUpdate()` in GamePage updates `travelZoomState`
5. **Background:** WeatherBackground applies transform based on state

---

## Proposed New Zoom Effects

### 1. Leaving Shop → Zoom to Botica

**Trigger Points:**
- When Maria leaves Botica de la Amargura (current location changes FROM "Botica de la Amargura")
- Fast travel to any other location

**Implementation:**
```javascript
// In handleFastTravel (src/pages/hooks/useNavigationHandlers.js)
const isLeavingBotica = gameState.location === 'Botica de la Amargura';

if (isLeavingBotica) {
  // Calculate botica center targetX
  const boticaBounds = NOTABLE_BUILDINGS.botica.bounds;
  const boticaCenterX = boticaBounds.x + (boticaBounds.width / 2);
  const boticaTargetX = (boticaCenterX / 1200) * 100; // 86.9%

  // Activate zoom
  setTravelZoomState({
    isActive: true,
    progress: 0,
    targetX: boticaTargetX
  });

  // Animate progress 0 → 100 over 2 seconds
  animateZoom(2000, () => {
    // On complete: deactivate zoom, show destination
    setTravelZoomState({ isActive: false, progress: 0, targetX: 50 });
    // ... complete travel
  });
}
```

### 2. Going to Cathedral → Zoom to Cathedral

**Trigger Points:**
- Fast travel to "Metropolitan Cathedral"

**Implementation:**
```javascript
// In handleFastTravel
if (locationName === 'Metropolitan Cathedral') {
  const cathedralBounds = NOTABLE_BUILDINGS.cathedral.bounds;
  const cathedralCenterX = cathedralBounds.x + (cathedralBounds.width / 2);
  const cathedralTargetX = (cathedralCenterX / 1200) * 100; // 11.6%

  setTravelZoomState({
    isActive: true,
    progress: 0,
    targetX: cathedralTargetX
  });

  animateZoom(2000, onComplete);
}
```

---

## Implementation Plan

### Step 1: Create Building Target Helper
**File:** `src/components/HorizonLine.jsx`

```javascript
/**
 * Calculate zoom targetX from building ID
 * @param {string} buildingId - Key from NOTABLE_BUILDINGS
 * @returns {number} targetX percentage (0-100)
 */
export function getZoomTargetForBuilding(buildingId) {
  const building = NOTABLE_BUILDINGS[buildingId];
  if (!building) return 50; // Default center

  const centerX = building.bounds.x + (building.bounds.width / 2);
  return (centerX / 1200) * 100;
}

// Export building constants for external use
export { NOTABLE_BUILDINGS };
```

### Step 2: Create Zoom Animation Helper
**File:** `src/utils/zoomAnimation.js` (new file)

```javascript
/**
 * Animate zoom from 0 to 100 over duration
 * @param {Function} setZoomState - State setter for travelZoomState
 * @param {number} targetX - Target horizontal position (%)
 * @param {number} duration - Animation duration in ms
 * @param {Function} onComplete - Callback when complete
 */
export function animateBackgroundZoom(setZoomState, targetX, duration, onComplete) {
  const startTime = Date.now();
  const frameInterval = 16; // ~60fps

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min((elapsed / duration) * 100, 100);

    setZoomState({
      isActive: true,
      progress,
      targetX
    });

    if (progress < 100) {
      setTimeout(animate, frameInterval);
    } else {
      // Complete
      setTimeout(() => {
        setZoomState({ isActive: false, progress: 0, targetX: 50 });
        if (onComplete) onComplete();
      }, 300); // Brief pause at zoom before reset
    }
  };

  animate();
}
```

### Step 3: Integrate into Fast Travel
**File:** `src/pages/hooks/useNavigationHandlers.js`

```javascript
import { getZoomTargetForBuilding } from '../../components/HorizonLine';
import { animateBackgroundZoom } from '../../utils/zoomAnimation';

const handleFastTravel = useCallback((locationName) => {
  const isLeavingBotica = gameState.location === 'Botica de la Amargura';

  // Map location names to building IDs for zoom
  const locationZoomMap = {
    'Botica de la Amargura': 'botica',
    'Metropolitan Cathedral': 'cathedral',
    // Add more as needed
  };

  // Determine zoom targets
  const departureZoom = isLeavingBotica ? getZoomTargetForBuilding('botica') : null;
  const arrivalZoom = getZoomTargetForBuilding(locationZoomMap[locationName]);

  // Phase 1: Departure zoom (if leaving botica)
  if (departureZoom && isLeavingBotica) {
    // Hide UI
    setBackgroundMode('travel'); // New mode for travel zoom

    // Animate zoom to botica
    animateBackgroundZoom(setTravelZoomState, departureZoom, 1500, () => {
      // Fade out after zoom
      setBackgroundMode('fade'); // Trigger fade to black/white

      setTimeout(() => {
        // Phase 2: Arrival zoom (if destination has landmark)
        if (arrivalZoom) {
          performArrivalZoom(arrivalZoom, locationName);
        } else {
          completeTravel(locationName);
        }
      }, 800); // Fade duration
    });
  } else if (arrivalZoom) {
    // Direct arrival zoom (no departure)
    performArrivalZoom(arrivalZoom, locationName);
  } else {
    // No zoom, instant travel
    completeTravel(locationName);
  }
}, [gameState.location, setTravelZoomState, setBackgroundMode]);

function performArrivalZoom(targetX, locationName) {
  animateBackgroundZoom(setTravelZoomState, targetX, 1500, () => {
    completeTravel(locationName);
    setBackgroundMode('normal');
  });
}

function completeTravel(locationName) {
  // Existing travel logic (update location, NPCs, journal, etc.)
  // ...
}
```

### Step 4: Add Background Mode Support
**File:** `src/pages/GamePage.jsx`

```javascript
// Add new background modes
const [backgroundMode, setBackgroundMode] = useState('normal');
// 'normal' | 'housecall' | 'travel' | 'fade' | 'weather'

// Update WeatherBackground pass-through
<WeatherBackground
  travelZoom={
    (backgroundMode === 'housecall' || backgroundMode === 'travel')
      ? travelZoomState
      : null
  }
  fadeMode={backgroundMode === 'fade'}
/>
```

---

## Additional Enhancements

### UI Fade During Zoom
Add fade overlay to hide UI during travel:

```javascript
{backgroundMode === 'travel' && (
  <div className="absolute inset-0 bg-black/50 z-50 transition-opacity duration-500" />
)}
```

### Sound Effects
Add audio cues:
- Door opening sound when leaving botica
- Footsteps during travel
- Church bells when arriving at cathedral

### Narration During Zoom
Display brief text during zoom:
```javascript
{backgroundMode === 'travel' && (
  <div className="absolute inset-0 z-50 flex items-center justify-center">
    <p className="text-white text-2xl font-serif">
      Traveling to {destinationName}...
    </p>
  </div>
)}
```

---

## Testing Checklist

- [ ] Zoom to botica when leaving for cathedral
- [ ] Zoom to cathedral when arriving from botica
- [ ] Zoom works from other locations
- [ ] UI properly hidden during zoom
- [ ] Animation smooth at 60fps
- [ ] No flicker when zoom completes
- [ ] Works on mobile (touch events)
- [ ] Reduced motion preference respected
- [ ] House call zoom still works
- [ ] Multiple rapid travels don't break state

---

## Files to Modify

1. **src/components/HorizonLine.jsx** - Export zoom helper
2. **src/utils/zoomAnimation.js** - New animation helper
3. **src/pages/hooks/useNavigationHandlers.js** - Integrate zoom into fast travel
4. **src/pages/GamePage.jsx** - Add background mode support
5. **src/components/WeatherBackground.jsx** - Support fade mode (optional)

---

## Estimated Complexity

**Time:** 2-3 hours
**Risk:** Low (non-breaking addition to existing system)
**Files Modified:** 4-5
**Lines Added:** ~150-200
