// Type definitions for game state and mechanics

/**
 * @typedef {Object} GameState
 * @property {string} scenarioId - Current scenario ID
 * @property {InventoryItem[]} inventory - Player's inventory
 * @property {Compound[]} compounds - Created compounds
 * @property {string} time - Current game time (e.g., "3:45 PM")
 * @property {string} date - Current game date (e.g., "August 22, 1680")
 * @property {string} location - Current location
 * @property {number} turnNumber - Current turn number
 * @property {boolean} isGameOver - Whether game has ended
 * @property {string[]} unlockedMethods - Unlocked crafting/mixing methods
 * @property {number} health - Current health (0-100)
 * @property {number} energy - Current energy (0-100)
 * @property {number} wealth - Current wealth amount
 * @property {string} status - Emotional/physical status word
 * @property {string} reputation - Reputation emoji
 * @property {Object|null} endQuestResult - Result of game-ending quest
 * @property {boolean} assessmentTriggered - Whether end game assessment was triggered
 * @property {Object.<string, StoryNpcStatus>} storyNpcStatus - Dynamic story NPC encounter tracking
 */

/**
 * @typedef {Object} InventoryItem
 * @property {string} name - Item name
 * @property {string} latinName - Latin name
 * @property {string} spanishName - Spanish name (or other language)
 * @property {string} emoji - Emoji representation
 * @property {number} price - Price per unit
 * @property {number} quantity - Quantity owned
 * @property {string} humoralQualities - Humoral qualities (e.g., "Hot & Dry")
 * @property {string} medicinalEffects - Medicinal effects description
 * @property {string} description - Item description
 */

/**
 * @typedef {Object} Compound
 * @property {number} id - Unique compound ID
 * @property {string} name - Compound name
 * @property {string} emoji - Emoji representation
 * @property {number} price - Compound value
 * @property {string} humoralQualities - Humoral qualities
 * @property {string} medicinalEffects - Medicinal effects
 * @property {string} description - Compound description
 * @property {string} citation - Historical citation/source
 * @property {number} quantity - Quantity
 * @property {string} method - Creation method used
 * @property {string[]} ingredients - Ingredient names used
 */

/**
 * @typedef {Object} StoryNpcStatus
 * @property {string} state - Encounter state ("met", "active", "completed", "declined", etc.)
 * @property {number} [lastTurn] - Turn number of the last interaction
 * @property {string} [lastOutcome] - Short code describing last outcome
 */

/**
 * @typedef {Object} ConversationEntry
 * @property {string} role - Message role ("user", "assistant", "system")
 * @property {string} content - Message content
 */

/**
 * @typedef {Object} JournalEntry
 * @property {string} content - Journal entry text
 * @property {string} type - Entry type ("auto", "manual")
 * @property {number} turnNumber - Turn number when created
 * @property {string} date - Game date when created
 */

/**
 * Validate game state structure
 * @param {GameState} state - Game state to validate
 * @returns {boolean} - True if valid
 * @throws {Error} - If validation fails
 */
export function validateGameState(state) {
  // Required fields
  const required = ['scenarioId', 'inventory', 'time', 'date', 'location', 'turnNumber'];

  for (const field of required) {
    if (state[field] === undefined) {
      throw new Error(`Invalid game state: missing ${field}`);
    }
  }

  // Type checks
  if (!Array.isArray(state.inventory)) {
    throw new Error('Inventory must be an array');
  }

  if (typeof state.turnNumber !== 'number') {
    throw new Error('Turn number must be a number');
  }

  if (state.storyNpcStatus && typeof state.storyNpcStatus !== 'object') {
    throw new Error('storyNpcStatus must be an object map');
  }

  return true;
}
