/**
 * Event Selector - Weighted Random Selection
 * Chooses appropriate random events based on game state and context
 */

import { EVENT_POOL } from './eventPool';

/**
 * Session-level tracking of event occurrences
 * Resets when game is reloaded
 */
const eventOccurrences = new Map();

/**
 * Reset occurrence tracking (call on new game or load)
 */
export function resetEventTracking() {
  eventOccurrences.clear();
}

/**
 * Get how many times an event has occurred this session
 */
function getOccurrenceCount(eventId) {
  return eventOccurrences.get(eventId) || 0;
}

/**
 * Record that an event has occurred
 */
export function recordEventOccurrence(eventId) {
  const count = getOccurrenceCount(eventId);
  eventOccurrences.set(eventId, count + 1);
  console.log(`[EventSelector] Event ${eventId} occurred (${count + 1} times this session)`);
}

/**
 * Normalize location string for comparison
 */
function normalizeLocation(location) {
  if (!location) return 'unknown';
  return location.toLowerCase().trim();
}

/**
 * Check if event location matches current location
 */
function matchesLocation(eventLocations, currentLocation) {
  if (!eventLocations || eventLocations.length === 0) return true; // No location restriction

  const normalized = normalizeLocation(currentLocation);

  // Check for exact matches or partial matches
  return eventLocations.some(eventLoc => {
    const eventLocNorm = normalizeLocation(eventLoc);
    return normalized.includes(eventLocNorm) || eventLocNorm.includes(normalized);
  });
}

/**
 * Get time of day from time string (e.g., "8:00 AM" -> "morning")
 */
function getTimeOfDay(timeString) {
  if (!timeString) return 'unknown';

  const hour = parseInt(timeString.match(/\d+/)?.[0] || '12');
  const isPM = timeString.toLowerCase().includes('pm');
  const hour24 = isPM && hour !== 12 ? hour + 12 : hour;

  if (hour24 >= 5 && hour24 < 12) return 'morning';
  if (hour24 >= 12 && hour24 < 17) return 'afternoon';
  if (hour24 >= 17 && hour24 < 21) return 'evening';
  return 'night';
}

/**
 * Check if event time matches current time
 */
function matchesTime(eventTimes, currentTime) {
  if (!eventTimes || eventTimes.length === 0) return true; // No time restriction

  const timeOfDay = getTimeOfDay(currentTime);
  return eventTimes.includes(timeOfDay);
}

/**
 * Check if player meets wealth requirement
 */
function meetsWealthRequirement(eventTrigger, playerWealth) {
  if (!eventTrigger.minWealth) return true;
  return playerWealth >= eventTrigger.minWealth;
}

/**
 * Check if player meets item requirement
 */
function meetsItemRequirement(eventTrigger, inventory) {
  if (!eventTrigger.hasItem) return true;

  return inventory.some(item =>
    item.name.toLowerCase().includes(eventTrigger.hasItem.toLowerCase())
  );
}

/**
 * Check if player meets turn number requirement
 */
function meetsTurnRequirement(eventTrigger, currentTurn) {
  const minTurn = eventTrigger.minTurnNumber || 0;
  const maxTurn = eventTrigger.maxTurnNumber || Infinity;

  return currentTurn >= minTurn && currentTurn <= maxTurn;
}

/**
 * Check if player meets reputation requirement
 */
function meetsReputationRequirement(eventTrigger, reputation) {
  if (!eventTrigger.minReputation) return true;

  const { faction, value } = eventTrigger.minReputation;
  const factionRep = reputation[faction];

  if (factionRep === undefined) return false;
  return factionRep >= value;
}

/**
 * Check if event has exceeded max occurrences
 */
function exceedsMaxOccurrences(event) {
  if (!event.triggers.maxPerSession) return false;

  const count = getOccurrenceCount(event.id);
  return count >= event.triggers.maxPerSession;
}

/**
 * Check if event meets all trigger conditions
 */
function meetsAllConditions(event, context) {
  const { location, time, turnNumber, wealth, inventory, reputation } = context;
  const triggers = event.triggers;

  // Check max occurrences first (hard gate)
  if (exceedsMaxOccurrences(event)) {
    return false;
  }

  // Check all other conditions
  if (!matchesLocation(triggers.locations, location)) return false;
  if (!matchesTime(triggers.timeOfDay, time)) return false;
  if (!meetsTurnRequirement(triggers, turnNumber)) return false;
  if (!meetsWealthRequirement(triggers, wealth)) return false;
  if (!meetsItemRequirement(triggers, inventory)) return false;
  if (!meetsReputationRequirement(triggers, reputation)) return false;

  return true;
}

/**
 * Apply context modifiers to event weight
 */
function applyWeightModifiers(event, context) {
  let weight = event.triggers.weight || 10;

  // Apply category modifiers based on recent history
  const { recentEventCategories = [] } = context;

  // Reduce weight if same category appeared recently
  const sameCategory = recentEventCategories.filter(cat => cat === event.category).length;
  if (sameCategory > 0) {
    weight *= Math.pow(0.7, sameCategory); // 30% reduction per same-category event
  }

  // Apply weather modifiers (if weather system exists)
  if (context.weather === 'rain' && event.category === 'environmental') {
    weight *= 0.5; // Less environmental events in rain
  }

  // Apply time-based modifiers
  const timeOfDay = getTimeOfDay(context.time);
  if (timeOfDay === 'night' && event.category === 'danger') {
    weight *= 1.5; // More danger at night
  }

  // Apply reputation-based modifiers
  if (context.reputation?.church < -20 && event.category === 'religious') {
    weight *= 1.3; // More religious pressure if church reputation is low
  }

  return weight;
}

/**
 * Select a random event using weighted selection
 *
 * @param {Object} context - Game state context
 * @param {string} context.location - Current location
 * @param {string} context.time - Current time
 * @param {number} context.turnNumber - Current turn
 * @param {number} context.wealth - Player wealth
 * @param {Array} context.inventory - Player inventory
 * @param {Object} context.reputation - Player reputation by faction
 * @param {Array} context.recentEventCategories - Recently triggered event categories
 * @param {number} context.randomEventChance - Base chance for event to trigger (0-1)
 * @returns {Object|null} Selected event or null
 */
export function selectRandomEvent(context) {
  const { randomEventChance = 0.15 } = context; // Default 15% chance per turn

  // First check if we should trigger an event at all
  if (Math.random() > randomEventChance) {
    console.log('[EventSelector] Random event check failed (chance roll)');
    return null;
  }

  // Filter events that meet all conditions
  const eligibleEvents = EVENT_POOL.filter(event => meetsAllConditions(event, context));

  if (eligibleEvents.length === 0) {
    console.log('[EventSelector] No eligible events found for current context');
    return null;
  }

  // Apply weight modifiers and build weighted pool
  const weightedPool = eligibleEvents.map(event => ({
    event,
    weight: applyWeightModifiers(event, context)
  }));

  // Calculate total weight
  const totalWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0);

  // Select random event using weighted probability
  let random = Math.random() * totalWeight;

  for (const item of weightedPool) {
    random -= item.weight;
    if (random <= 0) {
      console.log(`[EventSelector] Selected event: ${item.event.id} (weight: ${item.weight.toFixed(2)})`);
      console.log(`[EventSelector] Eligible pool: ${eligibleEvents.length} events, total weight: ${totalWeight.toFixed(2)}`);
      return item.event;
    }
  }

  // Fallback: return last event (shouldn't reach here)
  const fallback = weightedPool[weightedPool.length - 1].event;
  console.log(`[EventSelector] Fallback selection: ${fallback.id}`);
  return fallback;
}

/**
 * Force select a specific event by ID (for testing/debugging)
 */
export function selectEventById(eventId) {
  const event = EVENT_POOL.find(e => e.id === eventId);
  if (!event) {
    console.warn(`[EventSelector] Event not found: ${eventId}`);
    return null;
  }
  return event;
}

/**
 * Get all events in a specific category
 */
export function getEventsByCategory(category) {
  return EVENT_POOL.filter(e => e.category === category);
}

/**
 * Get event statistics
 */
export function getEventStats() {
  const stats = {
    totalEvents: EVENT_POOL.length,
    byCategory: {},
    byOccurrence: {}
  };

  // Count by category
  EVENT_POOL.forEach(event => {
    stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1;

    const occurrences = getOccurrenceCount(event.id);
    if (occurrences > 0) {
      stats.byOccurrence[event.id] = occurrences;
    }
  });

  return stats;
}
