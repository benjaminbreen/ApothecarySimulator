# Weather System - Quick Start Guide 🌦️

**TL;DR**: The weather system is fully integrated. Just start the game with `npm start` and it will automatically display dynamic weather and time-of-day effects behind your UI panels.

---

## 🚀 How to Test It

### **1. Start the Game**
```bash
npm start
```

### **2. What You'll See Immediately**

**At game start** (8:00 AM, August 22, 1680):
- ☀️ **Dawn sky gradient**: Pink/peach colors at horizon fading to darker blue at top
- 🏔️ **Mountain horizon**: 3-layer mountains with Mexico City colonial buildings (Cathedral, churches, palaces)
- 🌤️ **Clear weather**: Summer morning, no particles yet
- 🪟 **Semi-transparent UI**: Parchment panels with glass effect allowing weather to show through

### **3. Test Time Changes**

**Use the `#sleep` command to advance time:**

```
#sleep 8
```

This advances time by 8 hours. Watch the sky transition:

| From | To | What You'll See |
|------|-----|-----------------|
| 8 AM (dawn) | 4 PM (afternoon) | Pink dawn → bright blue day → possibility of rain (60% chance summer afternoon) |
| 4 PM | 12 AM (midnight) | Blue day → orange dusk → purple twilight → black night with stars |
| 12 AM | 8 AM (dawn) | Full starfield → stars fade → dawn colors return |

### **4. Test Weather Scenarios**

The game starts in **August 1680 (summer)**.

**To see rain:**
- Wait until afternoon (3-6 PM) - there's a 60% chance of thunderstorms
- Use `#sleep` repeatedly to advance time to afternoon hours
- When rain appears: 80-100 rain particles, lightning flashes, puddle ripples, wind gusts

**To see jacaranda blossoms (spring):**
- You'd need to advance the game date to spring (March-May)
- Requires windy conditions (automatically generated)
- Purple petals float from top to bottom

**To see dust particles (spring):**
- Again, needs spring date (March-May)
- Hot, dry, windy afternoon
- Tan-colored dust particles drift across screen

**To see fog (winter):**
- Would need winter date (December-February)
- Morning hours (5-9 AM)
- 2-3 fog layers with slow drift animation

---

## 🌟 Key Features to Notice

### **Sky Gradients**
- **Dawn** (5-8 AM): Dark blue → pink → pale peach
- **Day** (8 AM - 6 PM): Bright blue gradient
- **Dusk** (6-8 PM): Dark gray-blue → salmon → light salmon
- **Twilight** (8-10 PM): Deep purple-blue
- **Night** (10 PM - 4 AM): Near-black with subtle blue tones
- **Starfield** (9 PM - 6 AM): 4 parallax layers + 12 colored stars

### **Horizon**
- **Far mountains**: Gray, atmospheric haze
- **Mid mountains**: Darker, more defined
- **Colonial buildings**: Mexico City silhouettes
  - Metropolitan Cathedral (tallest, with spire)
  - Church domes and towers
  - Palace buildings
  - Various colonial structures
- **Time-aware**: Darker at night, visible during day

### **Weather Effects**
- **Rain**: Wind-affected trajectories, lens sheen overlay, puddle ripples at ground
- **Lightning**: Screen-wide flash during thunderstorms
- **Jacaranda blossoms**: Purple petals with rotation (spring, windy days)
- **Dust**: Tan particles drifting with wind (spring, hot afternoons)
- **Fog**: Multiple layers with slow drift (winter mornings)
- **Heat shimmer**: Vertical distortion + mirage (hot days)
- **Rainbow**: Double arc after rain

---

## 🎨 How It Works

### **Architecture**

```
WeatherBackground (z-index: -10, behind everything)
  ├─ TimeAwareBackground (sky gradient + starfield)
  ├─ HorizonLine (mountains + colonial buildings)
  └─ WeatherEffects (particles: rain, blossoms, dust, fog)

↓ (behind)

Main UI (z-index: 10, semi-transparent)
  ├─ Header
  ├─ LeftSidebar (glass-subtle effect)
  ├─ NarrativePanel (glass effect)
  ├─ ContextPanel (glass-subtle effect)
  └─ InputArea
```

### **Data Flow**

```
gameState.time + gameState.date
  ↓
WeatherBackground
  ↓ parseGameTime()
  ↓ getSeasonFromDate()
  ↓ generateWeather()
  ↓
WeatherState object
  ├─ precipitation: 'rain' | 'drizzle' | 'none'
  ├─ intensity: 0-1
  ├─ cloudCover: 0-1
  ├─ windSpeed: 0-50 km/h
  └─ fx: { lightningProbability, blossoms, etc. }
  ↓
TimeAwareBackground + WeatherEffects render
```

---

## 🔧 Customization Options

### **Disable Weather** (for performance testing)

In `GamePage.jsx` line 1806, comment out:
```jsx
{/* <WeatherBackground
  gameTime={gameState.time}
  gameDate={gameState.date}
  location={gameState.location}
  viewMode="standard"
/> */}
```

### **Adjust Background Transparency**

In `GamePage.jsx` line 1814, change opacity values:
```jsx
// Current (70%, 40%, 50%):
bg-gradient-to-br from-parchment-100/70 via-parchment-50/40 to-parchment-50/50

// More weather visible (lighter UI):
bg-gradient-to-br from-parchment-100/50 via-parchment-50/30 to-parchment-50/40

// Less weather visible (darker UI):
bg-gradient-to-br from-parchment-100/90 via-parchment-50/70 to-parchment-50/80
```

### **Force Specific Weather** (testing)

In `WeatherBackground.jsx` line ~67, replace the weather generation:
```javascript
// Force thunderstorm:
const newWeather = {
  precipitation: 'rain',
  intensity: 0.9,
  cloudCover: 0.9,
  windSpeed: 30,
  windDirection: 180,
  visibility: 0.4,
  special: null,
  fx: {
    dropletSize: 0.8,
    lightningProbability: 0.8,
    surfaceWetnessNow: 0.9,
    // ... other props with default values
  }
};
setWeather(newWeather);
```

### **Reduce Particle Counts** (performance)

In `WeatherEffects.jsx`:
- Line 157: Change `const base = weather.precipitation === 'rain' ? 80 : 50;` to lower values (e.g., 40, 25)
- Line 189: Change `const count = Math.min(120, ...)` to lower value (e.g., 60)
- Line 221: Change `const count = Math.floor((ap.density ?? 0.4) * 80);` to lower multiplier (e.g., * 40)

---

## 📊 Performance

**Expected Performance:**
- **Clear weather**: ~1-2ms per frame (minimal impact)
- **Light effects** (blossoms): ~5-8ms per frame
- **Heavy effects** (rain + lightning): ~10-15ms per frame
- **Target**: 60 FPS (16.67ms per frame budget)

**Optimizations Built-In:**
- ParticlePool (prevents garbage collection)
- Throttled updates (250ms intervals)
- Hardware-accelerated CSS transforms
- Reduced particle counts (80-120 vs original 150-260)

**If Performance Issues:**
1. Reduce particle counts (see above)
2. Disable on mobile: `enabled={!isMobile}`
3. Remove complex effects (lightning, rainbows)
4. Simplify gradients (2-color instead of 3-color)

---

## 🐛 Troubleshooting

### **"I don't see the weather background"**

1. Check browser console for errors
2. Verify `WeatherBackground.jsx` is imported in `GamePage.jsx` (line 31)
3. Make sure you're on desktop layout (not mobile)
4. Check if background opacity is too high (line 1814)

### **"The weather effects are laggy"**

1. Open DevTools Performance tab and record a profile
2. Check if particle animations are causing issues
3. Reduce particle counts (see Customization above)
3. Disable weather temporarily to confirm it's the cause

### **"Stars are visible during the day"**

1. Check the `getStarOpacity()` logic in `TimeAwareBackground.jsx`
2. Verify `gameState.time` is being parsed correctly
3. Stars should only appear 9 PM - 6 AM

### **"Rain particles not showing"**

1. Check if time is afternoon (3-6 PM) in summer
2. Weather is random - use `#sleep` to try different times
3. Force rain for testing (see Customization above)

---

## 🎯 What to Test

**Checklist:**
- [ ] Game starts with dawn/morning sky gradient
- [ ] Mountains + colonial buildings visible at horizon
- [ ] UI panels are semi-transparent (weather shows through)
- [ ] Use `#sleep` to advance time, watch sky transition
- [ ] Stars appear at night (~9 PM), disappear at dawn (~6 AM)
- [ ] Afternoon (3-6 PM) may trigger rain (summer only)
- [ ] Rain includes particles, lightning flashes, puddles
- [ ] Text remains readable through all weather conditions
- [ ] Performance stays smooth (60 FPS)

---

## 📚 Documentation

- **Full Implementation**: `WEATHER_SYSTEM.md`
- **Phase 2 Details**: `PHASE_2_COMPLETE.md`
- **Phase 3 Details**: `PHASE_3_COMPLETE.md`
- **Code Structure**: See inline comments in source files

---

**Enjoy your dynamic weather system!** 🌦️⛈️🌤️🌙✨

If you encounter issues or have questions, check the documentation files above or the inline code comments.
