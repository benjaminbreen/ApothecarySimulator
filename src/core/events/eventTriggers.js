/**
 * Event Triggers - Condition Checking and Timing
 * Manages when random events should be checked and triggered
 */

/**
 * Cooldown tracking for event system
 */
let lastEventTurn = -1;
let recentEventCategories = [];
const MAX_RECENT_CATEGORIES = 5; // Track last 5 event categories

/**
 * Reset event trigger state (call on new game or load)
 */
export function resetEventTriggers() {
  lastEventTurn = -1;
  recentEventCategories = [];
  console.log('[EventTriggers] Reset trigger state');
}

/**
 * Record that an event was triggered
 */
export function recordEventTrigger(category, turnNumber) {
  lastEventTurn = turnNumber;
  recentEventCategories.unshift(category);

  // Keep only recent categories
  if (recentEventCategories.length > MAX_RECENT_CATEGORIES) {
    recentEventCategories = recentEventCategories.slice(0, MAX_RECENT_CATEGORIES);
  }

  console.log(`[EventTriggers] Event triggered: ${category} on turn ${turnNumber}`);
  console.log(`[EventTriggers] Recent categories: ${recentEventCategories.join(', ')}`);
}

/**
 * Get minimum turns between events based on pacing
 */
function getMinTurnCooldown(gameState) {
  const { turnNumber } = gameState;

  // Early game: More frequent events (every 2-3 turns)
  if (turnNumber < 10) return 2;

  // Mid game: Standard pacing (every 3-4 turns)
  if (turnNumber < 30) return 3;

  // Late game: Less frequent (every 4-5 turns)
  return 4;
}

/**
 * Check if enough turns have passed since last event
 */
export function checkCooldown(gameState) {
  const { turnNumber } = gameState;
  const minCooldown = getMinTurnCooldown(gameState);

  if (lastEventTurn === -1) return true; // No events yet

  const turnsSinceLastEvent = turnNumber - lastEventTurn;
  const cooledDown = turnsSinceLastEvent >= minCooldown;

  if (!cooledDown) {
    console.log(`[EventTriggers] Still on cooldown (${turnsSinceLastEvent}/${minCooldown} turns)`);
  }

  return cooledDown;
}

/**
 * Calculate event trigger chance based on game state
 */
export function calculateEventChance(gameState) {
  const { location, turnNumber, energy, health } = gameState;

  let baseChance = 0.15; // 15% base chance

  // Increase chance in certain locations
  const locationLower = (location || '').toLowerCase();
  if (locationLower.includes('street') || locationLower.includes('market') || locationLower.includes('plaza')) {
    baseChance += 0.10; // +10% in busy areas
  }

  // Increase chance as game progresses (more events in mid-late game)
  if (turnNumber >= 10 && turnNumber < 30) {
    baseChance += 0.05;
  } else if (turnNumber >= 30) {
    baseChance += 0.08;
  }

  // Reduce chance if player is low on resources (give them breathing room)
  if (energy < 20 || health < 30) {
    baseChance *= 0.5;
  }

  // Cap at 80% max (TESTING - normally 40%)
  return Math.min(baseChance, 0.80);
}

/**
 * Check if player action should suppress events
 */
export function shouldSuppressEvent(playerAction) {
  if (!playerAction) return false;

  const actionLower = playerAction.toLowerCase();

  // Suppress during critical actions
  const criticalActions = [
    '#prescribe',
    '#buy',
    '#sell',
    '#mix',
    '#sleep',
    '#travel',
    'examine patient',
    'diagnose'
  ];

  return criticalActions.some(action => actionLower.includes(action));
}

/**
 * Build context object for event selection
 */
export function buildEventContext(gameState, reputation) {
  const {
    location,
    locationType,
    time,
    turnNumber,
    inventory,
    currentWealth,
    weather // Optional, may not exist yet
  } = gameState;

  const context = {
    location: location || 'unknown',
    locationType: locationType || null, // NEW: Structured location type for reliable event matching
    time: time || '12:00 PM',
    turnNumber: turnNumber || 0,
    wealth: currentWealth || 0,
    inventory: inventory || [],
    reputation: reputation || {},
    recentEventCategories: [...recentEventCategories],
    randomEventChance: calculateEventChance(gameState),
    weather: weather || null
  };

  return context;
}

/**
 * Check if event should be triggered on this turn
 */
export function shouldTriggerEvent(gameState, playerAction) {
  const { turnNumber } = gameState;

  // TESTING MODE: Trigger from turn 2 (normally turn 3)
  // TODO: Restore to turnNumber < 3 after testing
  if (turnNumber < 2) {
    console.log('[EventTriggers] Too early for events (turn < 2)');
    return false;
  }

  // Check if player is doing critical action
  if (shouldSuppressEvent(playerAction)) {
    console.log('[EventTriggers] Event suppressed (critical action)');
    return false;
  }

  // Check cooldown
  if (!checkCooldown(gameState)) {
    return false;
  }

  // Passed all checks
  return true;
}

/**
 * Get recent event history for debugging
 */
export function getRecentEventHistory() {
  return {
    lastEventTurn,
    recentCategories: [...recentEventCategories]
  };
}

/**
 * Force clear cooldown (for testing/debugging)
 */
export function clearCooldown() {
  lastEventTurn = -1;
  console.log('[EventTriggers] Cooldown cleared');
}
