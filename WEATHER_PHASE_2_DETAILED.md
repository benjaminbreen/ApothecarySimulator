# Weather Integration Phase 2: Gameplay Mechanics
## Making Weather Impact Player Decisions & Strategy

---

## Philosophy: Weather as Strategic Layer

Phase 1 made weather *visible* to the narrative. Phase 2 makes weather *matter* to gameplay.

**Core Principle**: Weather should create meaningful choices:
- "Do I travel in this storm, or wait until morning?"
- "Should I stock up on remedies before winter hits?"
- "Is it worth going outside when my energy is low?"

Weather should NOT be:
- Purely punitive (constant penalties feel unfair)
- Ignorable (if it doesn't affect decisions, why have it?)
- Overly complex (simple, intuitive effects)

---

## Architecture: Centralized Weather Effects Service

Instead of scattering weather logic across 20 different files, create a **single source of truth** that calculates all weather modifiers.

### File Structure
```
src/services/weatherEffectsService.js  ← NEW: All weather gameplay logic
src/services/weatherService.js         ← Existing: Weather generation
```

### Why Centralized?
✅ **Easy to test**: All modifiers in one place
✅ **Easy to balance**: Tune numbers without hunting through codebase
✅ **Easy to extend**: Add new weather effects without touching core systems
✅ **Performance**: Calculate once per turn, cache results
✅ **Debugging**: Single file to check when weather feels "off"

---

## Implementation Plan

### Step 1: Create Weather Effects Service

**File**: `src/services/weatherEffectsService.js`

```javascript
/**
 * weatherEffectsService.js
 * Centralized service for calculating weather-based gameplay modifiers
 *
 * All weather effects on gameplay flow through this service.
 * This makes balancing, testing, and debugging much easier.
 */

/**
 * Get all weather effects for the current conditions
 * @param {Object} weather - Weather state from weatherService
 * @returns {Object} All calculated effects
 */
export function getWeatherEffects(weather) {
  if (!weather) {
    return getDefaultEffects();
  }

  return {
    // Movement & Travel
    travelCostMultiplier: calculateTravelCostMultiplier(weather),
    canFastTravel: canFastTravel(weather),
    fastTravelWarning: getFastTravelWarning(weather),

    // Resource Drains
    energyDrainMultiplier: calculateEnergyDrainMultiplier(weather),
    healthRiskLevel: calculateHealthRiskLevel(weather),

    // NPC Behavior
    outdoorNPCModifier: calculateOutdoorNPCModifier(weather),
    indoorNPCModifier: calculateIndoorNPCModifier(weather),

    // Commerce & Economy
    ingredientAvailability: calculateIngredientAvailability(weather),
    priceModifiers: calculatePriceModifiers(weather),

    // Medical
    conditionModifiers: calculateConditionModifiers(weather),
    treatmentEffectivenessModifiers: calculateTreatmentModifiers(weather),

    // UI & Warnings
    warnings: generateWeatherWarnings(weather),
    statusEffects: generateStatusEffects(weather),

    // Meta
    severity: calculateWeatherSeverity(weather),
    category: categorizeWeather(weather)
  };
}

/**
 * Calculate travel cost multiplier based on weather
 * @returns {number} 1.0 = normal, 2.0 = double energy cost
 */
function calculateTravelCostMultiplier(weather) {
  let multiplier = 1.0;

  // Heavy rain slows travel
  if (weather.precipitation === 'rain') {
    if (weather.intensity > 0.7) {
      multiplier *= 1.5; // Heavy rain: 50% more energy
    } else if (weather.intensity > 0.4) {
      multiplier *= 1.25; // Moderate rain: 25% more energy
    } else {
      multiplier *= 1.1; // Light rain: 10% more energy
    }
  }

  // Snow is even worse
  if (weather.precipitation === 'snow') {
    multiplier *= 1.8; // Snow: 80% more energy
  }

  // Fog impedes navigation
  if (weather.special === 'fog' || weather.visibility < 0.3) {
    multiplier *= 1.3; // Fog: 30% more energy (slower, lost)
  }

  // Strong winds
  if (weather.windSpeed > 30) {
    multiplier *= 1.2; // Strong winds: 20% more energy
  }

  // Ground wetness makes walking harder
  if (weather.fx?.surfaceWetnessNow > 0.7) {
    multiplier *= 1.15; // Muddy ground: 15% more energy
  }

  return Math.min(multiplier, 2.5); // Cap at 2.5x (never more than double)
}

/**
 * Check if fast travel is allowed in current weather
 * @returns {boolean}
 */
function canFastTravel(weather) {
  // Block fast travel during dangerous conditions
  if (weather.special === 'thunderstorm') return false;
  if (weather.precipitation === 'rain' && weather.intensity > 0.8) return false;
  if (weather.visibility < 0.2) return false; // Dense fog

  return true;
}

/**
 * Get warning message for fast travel in current weather
 * @returns {string|null}
 */
function getFastTravelWarning(weather) {
  if (!canFastTravel(weather)) {
    if (weather.special === 'thunderstorm') {
      return "Fast travel unavailable during thunderstorm. Too dangerous.";
    }
    if (weather.visibility < 0.2) {
      return "Fast travel unavailable in dense fog. You'd get lost.";
    }
    if (weather.precipitation === 'rain' && weather.intensity > 0.8) {
      return "Fast travel unavailable in torrential rain. Wait for the storm to pass.";
    }
  }

  // Non-blocking warnings
  if (weather.precipitation === 'rain' && weather.intensity > 0.5) {
    return "⚠️ Traveling in heavy rain will drain extra energy.";
  }
  if (weather.special === 'fog') {
    return "⚠️ Fog will slow your travel significantly.";
  }
  if (weather.windSpeed > 25) {
    return "⚠️ Strong winds will make travel more tiring.";
  }

  return null;
}

/**
 * Calculate passive energy drain from exposure to weather
 * @returns {number} Energy loss per turn (0-5)
 */
function calculateEnergyDrainMultiplier(weather) {
  let drain = 0;

  // Extreme heat
  if (weather.special === 'heatwave') {
    drain += 2; // Lose 2 energy per turn in extreme heat
  }

  // Getting soaked in rain
  if (weather.precipitation === 'rain' && weather.intensity > 0.6) {
    drain += 1; // Lose 1 energy per turn when wet
  }

  // Cold (future: winter implementation)
  // if (weather.temperature < 5) drain += 1;

  return drain;
}

/**
 * Calculate health risk level from weather exposure
 * @returns {number} 0-3 (0=none, 1=low, 2=moderate, 3=high)
 */
function calculateHealthRiskLevel(weather) {
  let risk = 0;

  // Exposure to heavy rain
  if (weather.precipitation === 'rain' && weather.intensity > 0.7) {
    risk = Math.max(risk, 2); // Moderate risk: catch cold
  }

  // Extreme heat
  if (weather.special === 'heatwave') {
    risk = Math.max(risk, 2); // Moderate risk: heat exhaustion
  }

  // Thunderstorm danger
  if (weather.special === 'thunderstorm') {
    risk = 3; // High risk: lightning, flooding
  }

  return risk;
}

/**
 * Calculate modifier for outdoor NPC spawn rates
 * @returns {number} 0.0-1.5 (0.5 = half as many, 1.5 = 50% more)
 */
function calculateOutdoorNPCModifier(weather) {
  let modifier = 1.0;

  // Heavy rain drives people indoors
  if (weather.precipitation === 'rain') {
    if (weather.intensity > 0.7) {
      modifier *= 0.2; // Heavy rain: 80% fewer outdoor NPCs
    } else if (weather.intensity > 0.4) {
      modifier *= 0.5; // Moderate rain: 50% fewer
    } else {
      modifier *= 0.8; // Light rain: 20% fewer
    }
  }

  // Thunderstorms clear the streets
  if (weather.special === 'thunderstorm') {
    modifier *= 0.1; // Almost no one outside
  }

  // Fog reduces encounters (people stay home)
  if (weather.special === 'fog' || weather.visibility < 0.4) {
    modifier *= 0.6; // Fog: 40% fewer outdoor NPCs
  }

  // Pleasant weather increases street activity
  if (weather.precipitation === 'none' &&
      weather.cloudCover < 0.3 &&
      !weather.special) {
    modifier *= 1.2; // Nice weather: 20% more outdoor NPCs
  }

  return modifier;
}

/**
 * Calculate modifier for indoor NPC spawn rates
 * @returns {number} 0.8-2.0 (1.5 = 50% more crowded)
 */
function calculateIndoorNPCModifier(weather) {
  let modifier = 1.0;

  // Bad weather drives people to taverns, churches, shops
  if (weather.precipitation === 'rain' && weather.intensity > 0.5) {
    modifier *= 1.4; // Rain: 40% more indoor NPCs
  }

  if (weather.special === 'thunderstorm') {
    modifier *= 1.8; // Thunderstorm: 80% more crowded indoors
  }

  if (weather.special === 'heatwave') {
    modifier *= 1.3; // Heat: People seek cool shade indoors
  }

  return Math.min(modifier, 2.0); // Cap at 2x
}

/**
 * Calculate ingredient availability modifiers
 * @returns {Object} Ingredient type → availability modifier
 */
function calculateIngredientAvailability(weather) {
  const modifiers = {};

  // Rain helps herbs grow (more available next day)
  if (weather.precipitation === 'rain') {
    modifiers.herbs = 1.2; // 20% more herbs after rain
  }

  // Drought reduces plant availability
  if (weather.special === 'heatwave') {
    modifiers.herbs = 0.7; // 30% fewer herbs in heat
    modifiers.flowers = 0.6; // 40% fewer flowers
  }

  // Fog makes foraging dangerous/difficult
  if (weather.special === 'fog') {
    modifiers.wildPlants = 0.4; // 60% fewer wild plants visible
  }

  return modifiers;
}

/**
 * Calculate price modifiers for items based on weather
 * @returns {Object} Item category → price modifier
 */
function calculatePriceModifiers(weather) {
  const modifiers = {};

  // Umbrellas/rain gear expensive during rain
  if (weather.precipitation === 'rain' && weather.intensity > 0.5) {
    modifiers.rainGear = 1.5; // 50% markup on umbrellas, cloaks
    modifiers.firewood = 1.3; // 30% markup (everyone wants dry wood)
  }

  // Cooling items expensive during heat
  if (weather.special === 'heatwave') {
    modifiers.water = 1.4; // 40% markup on water
    modifiers.coolingSalves = 1.3; // 30% markup on cooling remedies
  }

  // Fresh food cheaper after rain (farmers rush to sell)
  if (weather.precipitation === 'rain' && weather.intensity > 0.3) {
    modifiers.freshFood = 0.9; // 10% discount (perishables must sell)
  }

  return modifiers;
}

/**
 * Calculate medical condition modifiers
 * Certain conditions worsen in specific weather
 * @returns {Object} Condition type → severity modifier
 */
function calculateConditionModifiers(weather) {
  const modifiers = {};

  // Cold/damp worsens respiratory issues
  if (weather.precipitation === 'rain' || weather.special === 'fog') {
    modifiers.cough = 1.3; // Coughs get 30% worse
    modifiers.breathing = 1.2; // Breathing issues worsen
    modifiers.chestPain = 1.15;
  }

  // Heat worsens fevers and inflammation
  if (weather.special === 'heatwave') {
    modifiers.fever = 1.4; // Fevers spike in heat
    modifiers.headache = 1.2; // Headaches worsen
    modifiers.swelling = 1.15; // Inflammation increases
  }

  // Fog/low visibility worsens eye conditions
  if (weather.special === 'fog' || weather.visibility < 0.4) {
    modifiers.eyeProblems = 1.2;
  }

  return modifiers;
}

/**
 * Calculate treatment effectiveness modifiers
 * Weather affects how well treatments work
 * @returns {Object} Treatment type → effectiveness modifier
 */
function calculateTreatmentModifiers(weather) {
  const modifiers = {};

  // Damp weather reduces effectiveness of drying remedies
  if (weather.precipitation === 'rain' && weather.intensity > 0.5) {
    modifiers.dryingPowders = 0.85; // 15% less effective
    modifiers.warmingTonics = 0.9; // 10% less effective
  }

  // Heat improves circulation-based treatments
  if (weather.special === 'heatwave') {
    modifiers.bloodletting = 1.1; // 10% more effective (easier flow)
    modifiers.poultices = 0.9; // 10% less effective (dry out)
  }

  // Cold improves anti-inflammatory treatments
  if (weather.precipitation === 'snow') {
    modifiers.antiInflammatory = 1.15; // 15% more effective
  }

  return modifiers;
}

/**
 * Generate warning messages for dangerous weather
 * @returns {Array<string>} Warning messages
 */
function generateWeatherWarnings(weather) {
  const warnings = [];

  if (weather.special === 'thunderstorm') {
    warnings.push("⚠️ THUNDERSTORM: Stay indoors. Lightning danger.");
  }

  if (weather.precipitation === 'rain' && weather.intensity > 0.8) {
    warnings.push("⚠️ TORRENTIAL RAIN: Travel will be difficult and exhausting.");
  }

  if (weather.special === 'fog' && weather.visibility < 0.2) {
    warnings.push("⚠️ DENSE FOG: Easy to get lost. Stay near landmarks.");
  }

  if (weather.special === 'heatwave') {
    warnings.push("⚠️ EXTREME HEAT: Avoid exertion. Drink plenty of water.");
  }

  // Flood risk during heavy rain
  if (weather.precipitation === 'rain' && weather.intensity > 0.7) {
    warnings.push("⚠️ FLOODING RISK: Streets may be impassable.");
  }

  return warnings;
}

/**
 * Generate active status effects from weather
 * @returns {Array<Object>} Status effects
 */
function generateStatusEffects(weather) {
  const effects = [];

  // Wet status (from rain)
  if (weather.precipitation === 'rain' && weather.intensity > 0.4) {
    effects.push({
      id: 'wet',
      name: 'Soaked',
      description: 'Wet clothes drain extra energy',
      icon: '💧',
      energyDrainPerTurn: 1,
      duration: 3 // Lasts 3 turns after rain stops
    });
  }

  // Heat exhaustion risk
  if (weather.special === 'heatwave') {
    effects.push({
      id: 'overheated',
      name: 'Overheated',
      description: 'Extreme heat drains energy rapidly',
      icon: '🌡️',
      energyDrainPerTurn: 2,
      healthRisk: 'moderate'
    });
  }

  // Chilled (from cold rain)
  if (weather.precipitation === 'rain' && weather.intensity > 0.6) {
    effects.push({
      id: 'chilled',
      name: 'Chilled',
      description: 'Cold and wet. Risk of falling ill.',
      icon: '❄️',
      healthRisk: 'low',
      treatmentModifier: -0.1 // 10% less effective treatments
    });
  }

  return effects;
}

/**
 * Calculate overall weather severity (for UI coloring, urgency)
 * @returns {number} 0-5 (0=perfect, 5=catastrophic)
 */
function calculateWeatherSeverity(weather) {
  let severity = 0;

  // Precipitation intensity
  if (weather.precipitation !== 'none') {
    severity += weather.intensity * 2; // 0-2 points
  }

  // Special conditions
  if (weather.special === 'thunderstorm') severity += 3;
  if (weather.special === 'fog') severity += 1.5;
  if (weather.special === 'heatwave') severity += 2;

  // Wind
  if (weather.windSpeed > 30) severity += 1;
  if (weather.windSpeed > 40) severity += 1;

  // Visibility
  if (weather.visibility < 0.3) severity += 1.5;

  return Math.min(Math.round(severity), 5);
}

/**
 * Categorize weather for quick checks
 * @returns {string} 'pleasant' | 'mild' | 'unpleasant' | 'harsh' | 'dangerous'
 */
function categorizeWeather(weather) {
  const severity = calculateWeatherSeverity(weather);

  if (severity === 0) return 'pleasant';
  if (severity <= 1) return 'mild';
  if (severity <= 2) return 'unpleasant';
  if (severity <= 3) return 'harsh';
  return 'dangerous';
}

/**
 * Get default effects (when no weather data available)
 */
function getDefaultEffects() {
  return {
    travelCostMultiplier: 1.0,
    canFastTravel: true,
    fastTravelWarning: null,
    energyDrainMultiplier: 0,
    healthRiskLevel: 0,
    outdoorNPCModifier: 1.0,
    indoorNPCModifier: 1.0,
    ingredientAvailability: {},
    priceModifiers: {},
    conditionModifiers: {},
    treatmentEffectivenessModifiers: {},
    warnings: [],
    statusEffects: [],
    severity: 0,
    category: 'pleasant'
  };
}

// Export all functions
export default {
  getWeatherEffects,
  calculateWeatherSeverity,
  categorizeWeather,
  canFastTravel,
  getFastTravelWarning
};
```

---

## Step 2: Integrate into Existing Systems

### 2A. Travel System (useNavigationHandlers.js)

**Current**: Fixed energy costs for travel
**New**: Weather-adjusted energy costs

```javascript
// In handleTravel or handleFastTravel
import { getWeatherEffects } from '../../services/weatherEffectsService';

const weatherEffects = getWeatherEffects(currentWeather);

// Check if fast travel is blocked
if (!weatherEffects.canFastTravel) {
  toast.error(weatherEffects.fastTravelWarning);
  return;
}

// Show warning if risky
if (weatherEffects.fastTravelWarning) {
  toast.warning(weatherEffects.fastTravelWarning);
}

// Calculate energy cost with weather modifier
const baseEnergyCost = 20;
const weatherAdjustedCost = Math.round(baseEnergyCost * weatherEffects.travelCostMultiplier);

updateEnergy(-weatherAdjustedCost);

// Show feedback
if (weatherEffects.travelCostMultiplier > 1.2) {
  toast.info(`The ${weatherEffects.category} weather made travel exhausting (-${weatherAdjustedCost} energy)`);
}
```

### 2B. Entity Selection (EntityAgent.js)

**Current**: Same NPC spawn rates regardless of weather
**New**: Weather-modified spawn probabilities

```javascript
// In selectContextAwareEntity
import { getWeatherEffects } from '../../services/weatherEffectsService';

export function selectContextAwareEntity({ weather, location, ... }) {
  const weatherEffects = getWeatherEffects(weather);

  // Determine if location is indoor or outdoor
  const isIndoor = location.toLowerCase().includes('tavern') ||
                   location.toLowerCase().includes('church') ||
                   location.toLowerCase().includes('shop') ||
                   location.toLowerCase().includes('botica');

  const spawnModifier = isIndoor
    ? weatherEffects.indoorNPCModifier
    : weatherEffects.outdoorNPCModifier;

  // Apply modifier to spawn roll
  const adjustedSpawnChance = baseSpawnChance * spawnModifier;

  if (Math.random() > adjustedSpawnChance) {
    console.log(`[EntityAgent] Weather (${weatherEffects.category}) reduced NPC spawn (modifier: ${spawnModifier.toFixed(2)})`);
    return null; // No NPC spawns
  }

  // Continue with normal entity selection...
}
```

### 2C. Medical System (diagnosisService.js, treatmentService.js)

**Current**: Fixed treatment success rates
**New**: Weather-modified effectiveness

```javascript
// In evaluateTreatmentSuccess
import { getWeatherEffects } from '../../services/weatherEffectsService';

export function evaluateTreatmentSuccess(prescription, patient, weather) {
  const weatherEffects = getWeatherEffects(weather);

  let baseSuccess = 0.7; // 70% base success rate

  // Check if patient's condition is affected by weather
  if (patient.symptoms.includes('cough')) {
    const coughModifier = weatherEffects.conditionModifiers.cough || 1.0;
    if (coughModifier > 1.1) {
      console.log('[Treatment] Patient's cough worsened by weather');
      baseSuccess *= 0.9; // 10% penalty
    }
  }

  // Check if treatment type is affected by weather
  const treatmentType = getTreatmentType(prescription); // e.g., 'dryingPowders'
  const treatmentModifier = weatherEffects.treatmentEffectivenessModifiers[treatmentType];

  if (treatmentModifier) {
    baseSuccess *= treatmentModifier;
    console.log(`[Treatment] Weather ${treatmentModifier > 1 ? 'helps' : 'hinders'} ${treatmentType}`);
  }

  return Math.random() < baseSuccess;
}
```

### 2D. Energy System (useResourceHandlers.js)

**Current**: No passive energy drain
**New**: Weather exposure costs

```javascript
// In useEffect that runs each turn
import { getWeatherEffects } from '../../services/weatherEffectsService';

useEffect(() => {
  if (turnNumber === 0) return;

  const weatherEffects = getWeatherEffects(currentWeather);

  // Apply passive weather drain
  if (weatherEffects.energyDrainMultiplier > 0) {
    const drain = weatherEffects.energyDrainMultiplier;
    updateEnergy(-drain);

    // Show status effect
    const effect = weatherEffects.statusEffects.find(e => e.energyDrainPerTurn);
    if (effect) {
      toast.warning(`${effect.icon} ${effect.name}: -${drain} energy`);
    }
  }
}, [turnNumber]);
```

### 2E. Commerce System (Buy.js, pricing logic)

**Current**: Fixed prices
**New**: Weather-adjusted prices

```javascript
// In item rendering or price calculation
import { getWeatherEffects } from '../../services/weatherEffectsService';

function getAdjustedPrice(item, weather) {
  const weatherEffects = getWeatherEffects(weather);

  let price = item.price;

  // Check for item category modifiers
  const category = getItemCategory(item); // e.g., 'water', 'rainGear', 'herbs'
  const modifier = weatherEffects.priceModifiers[category];

  if (modifier) {
    price = Math.round(price * modifier);

    // Show indicator in UI
    if (modifier > 1.1) {
      // Show ↑ icon, red text (price increase)
    } else if (modifier < 0.9) {
      // Show ↓ icon, green text (price decrease)
    }
  }

  return price;
}
```

---

## Step 3: UI Feedback & Player Communication

### 3A. Weather Status Panel

**Location**: Header or character stats area

```javascript
// New component: WeatherStatusIndicator.jsx
function WeatherStatusIndicator({ weather }) {
  const effects = getWeatherEffects(weather);

  // Color code by severity
  const severityColors = {
    pleasant: 'text-green-600',
    mild: 'text-blue-600',
    unpleasant: 'text-yellow-600',
    harsh: 'text-orange-600',
    dangerous: 'text-red-600'
  };

  const severityIcons = {
    pleasant: '☀️',
    mild: '⛅',
    unpleasant: '🌧️',
    harsh: '⛈️',
    dangerous: '🌩️'
  };

  return (
    <div className={`weather-indicator ${severityColors[effects.category]}`}>
      {severityIcons[effects.category]}
      <span>{weatherDescription}</span>
      {effects.warnings.length > 0 && (
        <Tooltip content={effects.warnings.join('\n')}>
          ⚠️
        </Tooltip>
      )}
    </div>
  );
}
```

### 3B. Active Status Effects

**Location**: Character stats panel or persistent UI

```javascript
// Show active weather effects
{weatherEffects.statusEffects.map(effect => (
  <div key={effect.id} className="status-effect">
    <span className="effect-icon">{effect.icon}</span>
    <span className="effect-name">{effect.name}</span>
    <Tooltip content={effect.description} />
  </div>
))}
```

### 3C. Travel Confirmation Modal

**When**: Player attempts fast travel in bad weather

```javascript
// New modal: WeatherTravelWarning.jsx
function WeatherTravelWarning({ weather, destination, onConfirm, onCancel }) {
  const effects = getWeatherEffects(weather);

  return (
    <Modal>
      <h2>⚠️ Travel Warning</h2>
      <p>{effects.fastTravelWarning}</p>
      <p>Energy cost: {Math.round(baseEnergyCost * effects.travelCostMultiplier)} (normally {baseEnergyCost})</p>

      {effects.healthRiskLevel > 1 && (
        <p className="text-red-600">
          ⚠️ Health risk: You may fall ill from exposure
        </p>
      )}

      <button onClick={onConfirm}>Travel Anyway</button>
      <button onClick={onCancel}>Wait for Better Weather</button>
    </Modal>
  );
}
```

---

## Step 4: Balancing & Testing

### Balancing Guidelines

**Travel Costs**:
- Normal weather: 20 energy per fast travel
- Light rain: 22 energy (10% increase)
- Heavy rain: 30 energy (50% increase)
- Thunderstorm: Fast travel blocked

**NPC Spawns**:
- Pleasant weather: 120% outdoor NPCs
- Normal: 100%
- Light rain: 80% outdoor
- Heavy rain: 20% outdoor
- Thunderstorm: 10% outdoor (streets are empty)

**Energy Drain**:
- Heat wave: -2 energy per turn
- Soaked: -1 energy per turn
- Maximum drain: -3 energy per turn total

**Price Fluctuations**:
- Water during heat: +40% price
- Umbrellas during rain: +50% price
- Fresh food during rain: -10% price (spoilage risk)

### Testing Scenarios

1. **Thunderstorm Test**:
   - Set weather to thunderstorm
   - Verify fast travel is blocked
   - Verify almost no outdoor NPCs spawn
   - Verify player receives warnings

2. **Heat Wave Test**:
   - Set weather to heatwave
   - Verify energy drains each turn
   - Verify water prices increase
   - Verify fevers worsen in patients

3. **Rain Test**:
   - Set weather to heavy rain
   - Verify travel costs increase
   - Verify outdoor NPCs reduced
   - Verify indoor locations are crowded

4. **Economic Test**:
   - Verify price changes feel fair
   - Verify players can still afford essentials
   - Verify price indicators show clearly

---

## Step 5: Player Communication & Documentation

### In-Game Tutorial

Add tutorial message on first bad weather encounter:

```
WEATHER SYSTEM

Weather now affects gameplay:

☀️ Pleasant: Bonus outdoor activity, normal costs
🌧️ Rain: Higher travel costs, fewer outdoor NPCs
⛈️ Storms: Fast travel blocked, stay indoors
🌡️ Heat: Passive energy drain, water expensive

Plan your activities around the weather!
```

### Settings Panel Addition

```javascript
// In SettingsModal_V3.jsx
<div className="weather-settings">
  <h3>Weather Effects</h3>

  <label>
    <input type="checkbox" checked={weatherEffectsEnabled} onChange={...} />
    Enable weather gameplay effects
  </label>

  <p className="help-text">
    When enabled, weather affects travel costs, NPC behavior, prices, and health.
    Disable for a simpler experience.
  </p>

  <label>
    <input type="range" min="0.5" max="2.0" step="0.1" value={weatherEffectIntensity} />
    Weather effect intensity: {weatherEffectIntensity}x
  </label>
</div>
```

---

## Implementation Priority

### Week 1: Core Mechanics (Must Have)
- [ ] Day 1-2: Create weatherEffectsService.js with all calculation functions
- [ ] Day 3: Integrate travel cost modifiers
- [ ] Day 4: Integrate NPC spawn modifiers
- [ ] Day 5: Add fast travel blocking for dangerous weather
- [ ] Day 6-7: Testing and balance tuning

### Week 2: Depth & Polish (Should Have)
- [ ] Day 1-2: Add energy drain from exposure
- [ ] Day 3: Add medical condition modifiers
- [ ] Day 4: Add price fluctuations
- [ ] Day 5: Create weather status UI
- [ ] Day 6: Add travel warning modal
- [ ] Day 7: Testing and player feedback

### Week 3: Advanced Features (Nice to Have)
- [ ] Day 1: Add ingredient availability modifiers
- [ ] Day 2: Add treatment effectiveness modifiers
- [ ] Day 3: Add weather-triggered events
- [ ] Day 4-5: Balance pass on all systems
- [ ] Day 6-7: Documentation and tutorial

---

## Success Metrics

**Functionality**:
- ✅ Weather modifiers apply correctly
- ✅ UI shows weather effects clearly
- ✅ Player receives warnings before risky decisions
- ✅ Fast travel blocks during dangerous weather

**Balance**:
- ✅ Weather feels impactful but not punitive
- ✅ Players make strategic choices around weather
- ✅ Bad weather is survivable with planning
- ✅ Good weather feels like a bonus, not default

**Polish**:
- ✅ All UI indicators show correct values
- ✅ Tooltips explain weather effects clearly
- ✅ Settings allow customization
- ✅ No performance impact from calculations

---

## Future Enhancements (Phase 3+)

### Seasonal Patterns
- Multi-day weather persistence
- Rainy season (June-Sept) vs dry season (Oct-May)
- Predictable patterns (afternoon storms)
- Weather forecasting (NPC mentions)

### Weather-Triggered Events
- Flood event during heavy storms
- Drought event during long dry spells
- Market closure during extreme weather
- Emergency patients from weather accidents

### Long-Term Effects
- Seasonal ingredient availability
- Weather-dependent quest triggers
- Reputation gains/losses from helping during storms
- Historical weather events (famous 1680 flood)

---

**Last Updated**: January 2025
**Status**: 📋 Detailed Planning Complete
**Estimated Effort**: 2-3 weeks for full implementation
