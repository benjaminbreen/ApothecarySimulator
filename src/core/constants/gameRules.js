// Universal game rules that apply across all scenarios
// These constants define the core mechanics of the game

/**
 * Core game rules and mechanics
 * @const {Object}
 */
export const GAME_RULES = {
  // Character stats
  STARTING_HEALTH: 85,
  STARTING_ENERGY: 100,
  MAX_HEALTH: 100,
  MAX_ENERGY: 100,
  MIN_HEALTH: 0,
  MIN_ENERGY: 0,

  // Time costs (in hours) for various actions
  TIME_COSTS: {
    SLEEP: 8,
    MIX: 2,
    FORAGE: 4,
    BUY: 1,
    DIAGNOSE: 1,
    PRESCRIBE: 1,
    TRAVEL: 3,
    STUDY: 2
  },

  // Energy costs for actions
  ENERGY_COSTS: {
    FORAGE: 15,
    MIX: 10,
    DIAGNOSE: 5,
    PRESCRIBE: 5,
    TRAVEL: 20,
    STUDY: 10
  },

  // Energy restoration
  ENERGY_RESTORATION: {
    SLEEP: 100,
    REST: 30,
    MEAL: 20
  },

  // Reputation system
  REPUTATION_THRESHOLDS: {
    ABYSMAL: '😡',
    VERY_POOR: '😠',
    NEUTRAL: '😐',
    BELOW_AVERAGE: '😶',
    DECENT: '🙂',
    ABOVE_AVERAGE: '😌',
    GOOD: '😏',
    EXCELLENT: '😃',
    OUTSTANDING: '😇',
    LEGENDARY: '👑'
  },

  // Reputation values (for numeric comparison)
  REPUTATION_VALUES: {
    '😡': 10,
    '😠': 20,
    '😐': 30,
    '😶': 40,
    '🙂': 50,
    '😌': 60,
    '😏': 70,
    '😃': 80,
    '😇': 90,
    '👑': 100
  },

  // Pricing rules
  PRICES: {
    MIN_ITEM: 1,
    MAX_ITEM: 20,
    EXPENSIVE_THRESHOLD: 5,
    VERY_EXPENSIVE_THRESHOLD: 10
  },

  // Inventory limits
  INVENTORY: {
    MAX_ITEMS: 100,
    MAX_STACK: 99,
    STARTING_SLOTS: 10
  },

  // Turn mechanics
  TURN: {
    DEFAULT_TIME_ADVANCE: 3, // hours
    MAX_TURN_DURATION: 12 // hours
  },

  // Status durations (in turns)
  STATUS_DURATIONS: {
    SHORT: 3,
    MEDIUM: 5,
    LONG: 10
  }
};

/**
 * Get reputation emoji from numeric value
 * @param {number} value - Numeric reputation value (0-100)
 * @returns {string} - Reputation emoji
 */
export function getReputationEmoji(value) {
  if (value <= 10) return GAME_RULES.REPUTATION_THRESHOLDS.ABYSMAL;
  if (value <= 20) return GAME_RULES.REPUTATION_THRESHOLDS.VERY_POOR;
  if (value <= 30) return GAME_RULES.REPUTATION_THRESHOLDS.NEUTRAL;
  if (value <= 40) return GAME_RULES.REPUTATION_THRESHOLDS.BELOW_AVERAGE;
  if (value <= 50) return GAME_RULES.REPUTATION_THRESHOLDS.DECENT;
  if (value <= 60) return GAME_RULES.REPUTATION_THRESHOLDS.ABOVE_AVERAGE;
  if (value <= 70) return GAME_RULES.REPUTATION_THRESHOLDS.GOOD;
  if (value <= 80) return GAME_RULES.REPUTATION_THRESHOLDS.EXCELLENT;
  if (value <= 90) return GAME_RULES.REPUTATION_THRESHOLDS.OUTSTANDING;
  return GAME_RULES.REPUTATION_THRESHOLDS.LEGENDARY;
}

/**
 * Get numeric value from reputation emoji
 * @param {string} emoji - Reputation emoji
 * @returns {number} - Numeric value (0-100)
 */
export function getReputationValue(emoji) {
  return GAME_RULES.REPUTATION_VALUES[emoji] || 30;
}

/**
 * Calculate time cost for an action
 * @param {string} action - Action type
 * @returns {number} - Time cost in hours
 */
export function getTimeCost(action) {
  return GAME_RULES.TIME_COSTS[action.toUpperCase()] || GAME_RULES.TURN.DEFAULT_TIME_ADVANCE;
}

/**
 * Calculate energy cost for an action
 * @param {string} action - Action type
 * @returns {number} - Energy cost
 */
export function getEnergyCost(action) {
  return GAME_RULES.ENERGY_COSTS[action.toUpperCase()] || 0;
}

/**
 * Check if item is expensive
 * @param {number} price - Item price
 * @returns {boolean}
 */
export function isExpensive(price) {
  return price >= GAME_RULES.PRICES.EXPENSIVE_THRESHOLD;
}

/**
 * Check if item is very expensive
 * @param {number} price - Item price
 * @returns {boolean}
 */
export function isVeryExpensive(price) {
  return price >= GAME_RULES.PRICES.VERY_EXPENSIVE_THRESHOLD;
}
