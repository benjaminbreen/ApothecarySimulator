# Immersive Background UI System
## Making TimeAwareBackground/HorizonLine Central to Gameplay

**Research Date**: November 3, 2025
**Status**: 📋 Proposal / Architecture Plan

---

## Current State

### Existing Fade Mechanism

**Already implemented** in `GamePage.jsx` (line 1876):

```javascript
{/* Fading content wrapper - everything below Header */}
<div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-500
  ${isWeatherViewActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
  {/* LeftSidebar, CentralPanel, InputArea, etc. */}
</div>
```

**How it works**:
- State variable: `isWeatherViewActive` (boolean)
- When `true`: Main UI fades to opacity 0 and becomes non-interactive
- When `false`: Main UI visible at opacity 100
- Transition: 500ms smooth fade
- Header remains visible (outside fade wrapper)

**Current trigger**: Weather button in Header (line 1868: `onWeatherClick={handleWeatherToggle}`)

---

## Problem Statement

**Current modal behavior** (cluttered):
1. **House calls** (`TravelCard.jsx`) - Rendered as modal overlay at line 2374
2. **Long distance travel** (`LongDistanceTravelModal.jsx`) - Rendered as modal overlay at line 2359
3. Both appear as fixed position overlays covering the entire game UI
4. User sees: modal → background UI (blurred) → weather background (barely visible)

**Desired behavior** (immersive):
1. Fade out main UI (use existing mechanism)
2. Show modal over clean TimeAwareBackground/HorizonLine
3. User sees: modal → beautiful horizon/weather/sky (fully visible)
4. When done, fade main UI back in

---

## Architecture Analysis

### Component Hierarchy (Desktop Layout)

```
GamePage.jsx
├── WeatherBackground (z-index: -10) ← Always rendered
│   ├── TimeAwareBackground (gradient sky)
│   ├── HorizonLine (Mexico City skyline with birds/animations)
│   ├── CloudLayer (animated clouds)
│   └── WeatherEffects (rain, fog, rainbow, etc.)
│
├── Main UI Wrapper (z-index: 10, FADES with isWeatherViewActive)
│   ├── Header (OUTSIDE fade wrapper - always visible)
│   └── Fading Content Wrapper (opacity controlled)
│       ├── LeftSidebar (character, inventory, status)
│       ├── CentralPanel (narrative, context panel)
│       ├── InputArea (command input)
│       └── MobileBottomNav (mobile only)
│
└── Modals Layer (z-index: 12000+, rendered separately)
    ├── TravelCard (house calls)
    ├── LongDistanceTravelModal
    ├── RandomEventCard
    ├── SettingsModal
    └── etc.
```

**Key insight**:
- Weather background is always rendered (`z-index: -10`)
- Main UI already has fade infrastructure
- Modals rendered separately at high z-index
- We just need to **trigger the fade when modals open**

---

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 Centralized Background Mode State

**Create new state manager** (or extend existing):

```javascript
// In GamePage.jsx
const [backgroundMode, setBackgroundMode] = useState('normal');
// Modes: 'normal', 'weather', 'travel', 'housecall'

// Replace isWeatherViewActive with computed value
const isUIFaded = backgroundMode !== 'normal';
```

**Update fade wrapper** (line 1876):

```javascript
<div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-500
  ${isUIFaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
```

#### 1.2 Update Modal Triggers

**House Call Modal** (currently triggered in `useGameHandlers.js`):

```javascript
// Before rendering TravelCard, fade UI
const handleHouseCallAccepted = (houseCallData) => {
  setBackgroundMode('housecall'); // Fade UI
  setPendingHouseCall(houseCallData); // Show travel card
};
```

**Long Distance Travel Modal**:

```javascript
const openLongDistanceTravelCard = (trigger = 'manual') => {
  setBackgroundMode('travel'); // Fade UI
  setLongDistanceCard({ /* ...data */ });
};
```

#### 1.3 Restore UI on Modal Close

**House Call - on arrival** (TravelCard.jsx calls `onArrival`):

```javascript
const handleHouseCallArrival = (data) => {
  // Existing arrival logic...

  setBackgroundMode('normal'); // Restore UI
  setPendingHouseCall(null); // Hide travel card
};
```

**House Call - on cancel**:

```javascript
const handleHouseCallCancel = () => {
  setBackgroundMode('normal'); // Restore UI
  setPendingHouseCall(null);
};
```

**Long Distance Travel - on close**:

```javascript
const closeLongDistanceTravelModal = () => {
  setBackgroundMode('normal'); // Restore UI
  setLongDistanceCard(null);
};
```

---

### Phase 2: Enhanced Modal Styling

Since modals will now appear over clean background, update their visual design.

#### 2.1 TravelCard Updates

**Current**: White card with solid background
**Proposed**: Glass-morphic card that complements the horizon

```css
/* TravelCard.css - ENHANCED */
.travel-card {
  /* Existing styles... */

  /* Glass effect to blend with background */
  background: rgba(250, 248, 243, 0.85); /* Parchment with transparency */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 46, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Dark mode */
.dark .travel-card {
  background: rgba(15, 23, 42, 0.85); /* Slate with transparency */
  border: 1px solid rgba(148, 163, 184, 0.2);
}
```

#### 2.2 LongDistanceTravelModal Updates

**Current**: Full-screen modal with white background
**Proposed**: Centered card with glass effect

```javascript
// LongDistanceTravelModal.jsx line 395
<div className="fixed inset-0 z-[12000] flex items-center justify-center px-4 py-6">
  {/* Remove bg-slate-900/75 backdrop-blur-sm - let background show */}
  <div className="relative w-full max-w-5xl
    bg-parchment-50/85 dark:bg-slate-950/85
    backdrop-blur-md
    border border-emerald-800/30 dark:border-sky-400/20
    rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
    {/* Existing content */}
  </div>
</div>
```

---

### Phase 3: Header Behavior

**Current**: Header always visible
**Options**:

#### Option A: Keep Header Visible
- **Pros**: User always sees time/location/stats
- **Cons**: Breaks full immersion
- **Best for**: Travel modals (user needs context)

#### Option B: Fade Header Too
- **Pros**: Complete immersion, just background + modal
- **Cons**: Lose location/time context
- **Best for**: Quick interactions (random events)

#### Option C: Minimal Header Mode
- **Pros**: Best of both worlds
- **Implementation**:

```javascript
{/* Header - conditional content based on mode */}
<Header
  location={backgroundMode === 'normal' ? gameState.location : null}
  time={backgroundMode === 'normal' ? gameState.time : null}
  date={backgroundMode === 'normal' ? gameState.date : null}
  minimalMode={backgroundMode !== 'normal'} // New prop
  // ... other props
/>
```

```javascript
// In Header.jsx
{minimalMode ? (
  // Just show logo and close button
  <div className="flex items-center justify-between px-6 py-3">
    <div className="text-lg font-serif">Apothecary Simulator</div>
    <button onClick={onExitBackgroundMode}>✕</button>
  </div>
) : (
  // Full header with stats, location, time, etc.
  // ... existing header content
)}
```

**Recommendation**: Option C (minimal header mode)

---

### Phase 4: Animation Choreography

Add staggered animations for smooth transitions.

#### 4.1 Fade Timing

```javascript
const FADE_TIMINGS = {
  UI_FADE_OUT: 400,      // Main UI fades out
  MODAL_FADE_IN: 300,    // Modal fades in (starts 200ms after UI fade)
  MODAL_FADE_OUT: 300,   // Modal fades out
  UI_FADE_IN: 400        // Main UI fades back in
};

const openHouseCallWithAnimation = (data) => {
  // 1. Start fading UI
  setBackgroundMode('housecall');

  // 2. Show modal after UI is mostly faded
  setTimeout(() => {
    setPendingHouseCall(data);
  }, FADE_TIMINGS.UI_FADE_OUT - 100);
};

const closeHouseCallWithAnimation = () => {
  // 1. Hide modal first
  setPendingHouseCall(null);

  // 2. Restore UI after modal fades
  setTimeout(() => {
    setBackgroundMode('normal');
  }, FADE_TIMINGS.MODAL_FADE_OUT);
};
```

#### 4.2 Modal Animation Classes

```css
/* Modal enter animation */
.modal-enter {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
  animation: modalEnter 300ms ease-out forwards;
}

@keyframes modalEnter {
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Modal exit animation */
.modal-exit {
  animation: modalExit 300ms ease-in forwards;
}

@keyframes modalExit {
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
}
```

---

### Phase 5: Additional Modal Integrations

Extend to other modals that would benefit from background view:

#### 5.1 Random Event Cards

**When**: Weather events, street encounters, random events
**Benefit**: See thunderstorm/rain/fog in background during event

```javascript
// When showing weather event or atmospheric random event
if (eventCard.type === 'weather_event' || eventCard.atmospheric) {
  setBackgroundMode('event');
}
```

#### 5.2 Map Interactions

**When**: Viewing exterior map, selecting POI
**Benefit**: See actual location skyline

```javascript
// When opening map in exterior view
if (currentMapId === 'exterior-map') {
  setBackgroundMode('map');
}
```

#### 5.3 Sleep/Rest Actions

**When**: Player sleeps or rests
**Benefit**: Watch time-lapse of sky changing (dawn → day → dusk)

```javascript
const handleSleep = async () => {
  setBackgroundMode('sleep');

  // Animate background time changing
  // (TimeAwareBackground already responds to gameTime prop)

  // After sleep duration
  setTimeout(() => {
    setBackgroundMode('normal');
  }, SLEEP_ANIMATION_DURATION);
};
```

---

## Technical Considerations

### Performance

**Concern**: Is background rendering expensive when hidden?
**Answer**: No - already rendered at all times, just covered by opaque UI

**Optimization**: None needed, background is lightweight

### Mobile Support

**Current mobile layout** (lines 1810-1831): Uses `MobileGameLayout` component

**Consideration**: Mobile has different component structure

**Solution**:
```javascript
// In MobileGameLayout.jsx
const [mobileBackgroundMode, setMobileBackgroundMode] = useState('normal');

// Apply same fade to mobile panels
<div className={`transition-opacity duration-500
  ${mobileBackgroundMode !== 'normal' ? 'opacity-0' : 'opacity-100'}`}>
  {/* Mobile panels */}
</div>
```

### State Persistence

**Question**: Should background mode persist across saves?
**Answer**: No - always restore to 'normal' on load

**Implementation**:
```javascript
useEffect(() => {
  // On game load, ensure normal mode
  setBackgroundMode('normal');
}, []);
```

---

## User Experience Improvements

### Visual Storytelling

**House calls**:
- User accepts house call → UI fades
- Beautiful Mexico City horizon with weather visible
- Travel card shows destination, progress bar
- Clouds drift, birds fly, rain falls (if applicable)
- **Immersion**: Player feels like they're traveling through the city
- Arrival → UI fades back in

**Long distance travel**:
- User selects distant destination → UI fades
- World map appears over dramatic sky background
- Time-of-day sky matches departure time (e.g., leaving at dusk)
- **Immersion**: Player contemplating journey under twilight sky

**Weather events**:
- Thunderstorm event triggers → UI fades
- Full view of lightning, dark clouds, heavy rain
- Event card: "Lightning strikes church steeple..."
- **Immersion**: Player experiences the storm visually + narratively

### Accessibility

**Concern**: Does fade reduce readability?
**Solution**: Modals maintain full opacity, only background UI fades

**Concern**: Motion sensitivity
**Solution**: Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .fade-wrapper {
    transition: none !important;
  }
}
```

---

## Implementation Checklist

### Core (Phase 1)
- [ ] Add `backgroundMode` state to GamePage.jsx
- [ ] Replace `isWeatherViewActive` with `isUIFaded` computed property
- [ ] Update `handleHouseCallAccepted` to set backgroundMode
- [ ] Update `openLongDistanceTravelCard` to set backgroundMode
- [ ] Update `handleHouseCallArrival` to restore normal mode
- [ ] Update `handleHouseCallCancel` to restore normal mode
- [ ] Update `closeLongDistanceTravelModal` to restore normal mode

### Styling (Phase 2)
- [ ] Update TravelCard.css with glass-morphic styles
- [ ] Update LongDistanceTravelModal background transparency
- [ ] Test glass effect readability in light/dark mode
- [ ] Test at different times of day (dawn/dusk/night)

### Header (Phase 3)
- [ ] Add `minimalMode` prop to Header component
- [ ] Implement minimal header UI (logo + close only)
- [ ] Add `onExitBackgroundMode` callback
- [ ] Test header transitions

### Animations (Phase 4)
- [ ] Implement staggered fade timing
- [ ] Add modal enter/exit animations
- [ ] Test smooth transitions
- [ ] Add `prefers-reduced-motion` support

### Extensions (Phase 5)
- [ ] Integrate random event cards
- [ ] Integrate map view
- [ ] Integrate sleep/rest animations
- [ ] Test all integrated modals

### Mobile (Phase 6)
- [ ] Add backgroundMode to MobileGameLayout
- [ ] Test mobile fade transitions
- [ ] Test mobile modal positioning over background

---

## Example Code: Complete Implementation

```javascript
// GamePage.jsx - Simplified example

const GameContent = () => {
  // Background mode state
  const [backgroundMode, setBackgroundMode] = useState('normal');
  // Modes: 'normal', 'weather', 'travel', 'housecall', 'event', 'sleep'

  // Computed property
  const isUIFaded = backgroundMode !== 'normal';

  // House call handlers
  const handleHouseCallAccepted = (data) => {
    setBackgroundMode('housecall');
    setTimeout(() => {
      setPendingHouseCall(data);
    }, 300);
  };

  const handleHouseCallArrival = (data) => {
    // Existing logic...

    setPendingHouseCall(null);
    setTimeout(() => {
      setBackgroundMode('normal');
    }, 300);
  };

  const handleHouseCallCancel = () => {
    setPendingHouseCall(null);
    setTimeout(() => {
      setBackgroundMode('normal');
    }, 300);
  };

  // Long distance travel handlers
  const openLongDistanceTravelCard = (trigger) => {
    setBackgroundMode('travel');
    setTimeout(() => {
      setLongDistanceCard({ /* data */ });
    }, 300);
  };

  const closeLongDistanceTravelModal = () => {
    setLongDistanceCard(null);
    setTimeout(() => {
      setBackgroundMode('normal');
    }, 300);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Weather Background - always rendered */}
      <WeatherBackground
        gameTime={gameState.time}
        gameDate={gameState.date}
        location={gameState.location}
        viewMode="standard"
        onWeatherChange={...}
      />

      {/* Main UI - fades based on mode */}
      <div className={`relative z-10 h-screen flex flex-col overflow-hidden
        bg-gradient-to-br from-parchment-100/70 via-parchment-50/40 to-parchment-50/50
        transition-colors duration-500`}>

        {/* Header - minimal mode when faded */}
        <Header
          minimalMode={isUIFaded}
          onExitBackgroundMode={() => setBackgroundMode('normal')}
          {...headerProps}
        />

        {/* Fading content wrapper */}
        <div className={`flex-1 flex flex-col overflow-hidden
          transition-opacity duration-500
          ${isUIFaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

          <LeftSidebar {...} />
          <CentralPanel {...} />
          <InputArea {...} />
        </div>
      </div>

      {/* Modals - rendered at high z-index over everything */}
      {pendingHouseCall && (
        <TravelCard
          className="modal-enter"
          houseCallData={pendingHouseCall}
          onArrival={handleHouseCallArrival}
          onCancel={handleHouseCallCancel}
        />
      )}

      {longDistanceCard && (
        <LongDistanceTravelModal
          className="modal-enter"
          isOpen={!!longDistanceCard}
          onClose={closeLongDistanceTravelModal}
          {...longDistanceCard}
        />
      )}
    </div>
  );
};
```

---

## Benefits Summary

### Immersion
✓ Background becomes integral to gameplay, not decoration
✓ Weather/time-of-day visible during key moments
✓ Reduces UI clutter during transitions

### Technical
✓ Uses existing fade infrastructure (minimal new code)
✓ No performance impact (background already rendered)
✓ Works with existing modal system

### UX
✓ Smoother transitions between UI states
✓ Beautiful visual storytelling
✓ Reduces cognitive load (fewer overlapping layers)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Modals hard to read over background | Use glass-morphic design with high opacity |
| Users confused by UI disappearing | Add clear "Exit" button in minimal header |
| Animation jank on slow devices | Respect `prefers-reduced-motion`, test on low-end hardware |
| Mobile layout breaks | Test separately, may need different timing |
| Accidental background mode stuck | Add timeout fallback to restore normal mode |

---

## Next Steps

1. **Prototype**: Implement Phase 1 (core infrastructure) in dev branch
2. **Test**: House call and long distance travel with fade
3. **Iterate**: Adjust timing, styling based on feel
4. **Expand**: Add to random events, map, sleep
5. **Polish**: Glass effects, animations, mobile support

---

**Questions for User**:
1. Do you want header to fade completely, show minimal version, or stay fully visible?
2. Should random events also use background-only view?
3. Any specific visual effects for the background during travel (e.g., motion blur, zoom)?
4. Priority: House calls first, then long distance travel? Or both together?
