/**
 * Tooltip Trigger System
 *
 * Defines when tooltips should appear based on:
 * - Turn number (progressive reveal)
 * - Game state conditions
 * - User context
 *
 * Best Practices:
 * - Show 1-2 tooltips per turn max
 * - Progress from basic (input) to advanced (mixing)
 * - Use turn ranges for flexibility
 * - Combine turn + condition for smart triggering
 */

/**
 * Tooltip Configuration
 *
 * @typedef {Object} TooltipTrigger
 * @property {number[]} [turns] - Array of turn numbers when tooltip can show
 * @property {Function} [condition] - Function(gameState) => boolean to evaluate
 * @property {boolean} [once] - If true, only show once per playthrough
 * @property {number} [priority] - Higher priority tooltips show first (default: 0)
 */

/**
 * Tooltip Trigger Definitions
 *
 * Each tooltip ID maps to trigger conditions
 */
export const TOOLTIP_TRIGGERS = {
  // PHASE 1: Basic Controls (Turns 1-2)
  'input-commands': {
    turns: [1, 2],
    condition: () => true,
    once: false,
    priority: 100,
    description: 'Show on first 2 turns to teach basic input'
  },

  'command-chips': {
    turns: [1, 2, 3],
    condition: () => true,
    once: false,
    priority: 90,
    description: 'Show quick action chips early'
  },

  'journal-button': {
    turns: [2],
    condition: () => true,
    once: false,
    priority: 85,
    description: 'Show journal button tooltip on turn 2'
  },

  // PHASE 2: NPC Interaction (Turns 2-4)
  'portrait-click': {
    turns: [2, 3, 4, 5],
    condition: (gameState) => {
      // Only show if there's an NPC or patient visible
      return gameState.recentNPCs?.length > 0 || gameState.activePatient !== null;
    },
    once: false,
    priority: 80,
    description: 'Teach clicking portraits when NPCs appear'
  },

  'first-patient': {
    turns: null, // Any turn
    condition: (gameState) => {
      // Show when first patient contract is offered
      return gameState.activePatient !== null;
    },
    once: true,
    priority: 85,
    description: 'Explain patient contracts on first patient'
  },

  // PHASE 3: Inventory & Crafting (Turns 3-7)
  'inventory-drag': {
    turns: [3, 4, 5, 6, 7],
    condition: (gameState) => {
      // Show when player has enough items to mix
      return gameState.inventory && gameState.inventory.length >= 2;
    },
    once: false,
    priority: 70,
    description: 'Teach drag-and-drop when inventory has items'
  },

  'mixing-workshop': {
    turns: [5, 6, 7, 8],
    condition: (gameState) => {
      // Show after player has some inventory and energy
      return (
        gameState.inventory &&
        gameState.inventory.length >= 2 &&
        gameState.energy > 50
      );
    },
    once: false,
    priority: 60,
    description: 'Introduce mixing system mid-game'
  },

  // PHASE 4: Resource Management (Condition-based)
  'energy-warning': {
    turns: null, // Any turn
    condition: (gameState) => {
      // Show when energy is critically low
      return gameState.energy < 30;
    },
    once: true,
    priority: 95,
    description: 'Warn about low energy (once per game)'
  },

  'health-warning': {
    turns: null,
    condition: (gameState) => {
      return gameState.health < 40;
    },
    once: true,
    priority: 95,
    description: 'Warn about low health (once per game)'
  },

  'wealth-crisis': {
    turns: null,
    condition: (gameState) => {
      // Show when player is running out of money
      return gameState.wealth !== undefined && gameState.wealth < 10;
    },
    once: true,
    priority: 90,
    description: 'Warn about financial trouble'
  },

  // PHASE 5: Advanced Features (Turns 10+)
  'map-navigation': {
    turns: [8, 9, 10, 11, 12],
    condition: (gameState) => {
      // Show after player is established
      return gameState.turnNumber >= 8;
    },
    once: false,
    priority: 50,
    description: 'Introduce map navigation later'
  },

  'shop-sign': {
    turns: [6, 7, 8, 9, 10],
    condition: (gameState) => {
      // Show when player has inventory to sell
      return (
        gameState.inventory &&
        gameState.inventory.length >= 5 &&
        !gameState.shopSignHung
      );
    },
    once: false,
    priority: 55,
    description: 'Teach hanging shop sign when ready to sell'
  }
};

/**
 * Evaluate if a tooltip should be shown
 *
 * @param {string} id - Tooltip ID
 * @param {Object} gameState - Current game state
 * @param {Set} seenTooltips - Set of already-seen tooltip IDs
 * @returns {boolean} - True if tooltip should show
 */
export function shouldShowTooltip(id, gameState, seenTooltips = new Set()) {
  const trigger = TOOLTIP_TRIGGERS[id];

  if (!trigger) {
    console.warn(`[TooltipTriggers] Unknown tooltip ID: ${id}`);
    return false;
  }

  // If "once" and already seen, don't show again
  if (trigger.once && seenTooltips.has(id)) {
    return false;
  }

  // Check turn number constraint
  if (trigger.turns) {
    const currentTurn = gameState.turnNumber || 1;
    if (!trigger.turns.includes(currentTurn)) {
      return false;
    }
  }

  // Check condition
  if (trigger.condition) {
    try {
      if (!trigger.condition(gameState)) {
        return false;
      }
    } catch (error) {
      console.error(`[TooltipTriggers] Error evaluating condition for ${id}:`, error);
      return false;
    }
  }

  return true;
}

/**
 * Get all tooltips that should be shown for current state
 * Returns sorted by priority (highest first)
 *
 * @param {Object} gameState - Current game state
 * @param {Set} seenTooltips - Set of already-seen tooltip IDs
 * @param {number} [maxTooltips=1] - Maximum tooltips to return
 * @returns {string[]} - Array of tooltip IDs to show
 */
export function getTooltipsToShow(gameState, seenTooltips = new Set(), maxTooltips = 1) {
  const eligibleTooltips = [];

  for (const [id, trigger] of Object.entries(TOOLTIP_TRIGGERS)) {
    if (shouldShowTooltip(id, gameState, seenTooltips)) {
      eligibleTooltips.push({
        id,
        priority: trigger.priority || 0
      });
    }
  }

  // Sort by priority (highest first)
  eligibleTooltips.sort((a, b) => b.priority - a.priority);

  // Return top N
  return eligibleTooltips.slice(0, maxTooltips).map(t => t.id);
}

/**
 * Get tooltip metadata for debugging/logging
 *
 * @param {string} id - Tooltip ID
 * @returns {Object|null} - Tooltip metadata or null if not found
 */
export function getTooltipMetadata(id) {
  const trigger = TOOLTIP_TRIGGERS[id];
  if (!trigger) return null;

  return {
    id,
    turns: trigger.turns,
    hasCondition: !!trigger.condition,
    once: trigger.once || false,
    priority: trigger.priority || 0,
    description: trigger.description || 'No description'
  };
}
