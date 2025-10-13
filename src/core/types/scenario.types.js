// Type definitions for scenario configuration
// These JSDoc types provide autocomplete and type checking in VSCode

/**
 * @typedef {Object} ScenarioConfig
 * @property {string} id - Unique scenario identifier (e.g., "1680-mexico-city")
 * @property {string} name - Display name (e.g., "1680 Mexico City")
 * @property {string} description - Brief scenario description
 * @property {ScenarioCharacter} character - Protagonist details
 * @property {ScenarioSettings} settings - Scenario-specific settings
 * @property {string} startDate - Starting date (e.g., "August 22, 1680")
 * @property {string} startTime - Starting time (e.g., "8:00 AM")
 * @property {string} startLocation - Starting location
 * @property {string} currency - Currency name (e.g., "reales", "dollars", "pounds")
 * @property {string} currencySymbol - Currency symbol (e.g., "R", "$", "£")
 * @property {number} startingWealth - Starting wealth amount
 * @property {Object.<string, Debt>} debts - Starting debts by creditor name
 * @property {NPC[]} npcs - Available NPCs
 * @property {InventoryItem[]} startingInventory - Starting items
 * @property {Object} prompts - Scenario-specific prompt modules
 * @property {ScriptedEvent[]} [scriptedEvents] - Optional scripted events
 */

/**
 * @typedef {Object} ScriptedEvent
 * @property {number|number[]} turns - Turn number(s) when event can trigger
 * @property {string} [date] - Specific date when event triggers (e.g., "August 23, 1680")
 * @property {string} [timeOfDay] - Time of day ("AM" or "PM")
 * @property {string} npcTag - Tag to find NPC (e.g., "debt-collector-primary")
 * @property {number} probability - Probability of event (0-1)
 * @property {string} [description] - Event description for debugging
 */

/**
 * @typedef {Object} ScenarioCharacter
 * @property {string} name - Character full name
 * @property {number} age - Character age
 * @property {string} title - Character title/profession
 * @property {number} level - Character level
 * @property {string} background - Character backstory (1-2 paragraphs)
 * @property {Object.<string, string>} portraits - Portrait images by mood
 * @property {string[]} startingMethods - Unlocked mixing/crafting methods
 * @property {CharacterStats} stats - Starting stats
 */

/**
 * @typedef {Object} CharacterStats
 * @property {number} health - Starting health
 * @property {number} energy - Starting energy
 */

/**
 * @typedef {Object} ScenarioSettings
 * @property {string} language - Primary language ("Spanish", "English", etc.)
 * @property {string} addressStyle - How NPCs address protagonist
 * @property {string[]} socialNorms - Important social norms for the period
 * @property {string[]} historicalContext - Key historical facts
 * @property {string[]} locations - Available locations
 */

/**
 * @typedef {Object} Debt
 * @property {number} amount - Amount owed
 * @property {string|null} deadline - Deadline date (or null if no deadline)
 * @property {string} consequence - What happens if debt isn't paid
 */

/**
 * Validate scenario configuration
 * @param {ScenarioConfig} config - Scenario config to validate
 * @returns {boolean} - True if valid
 * @throws {Error} - If validation fails
 */
export function validateScenarioConfig(config) {
  const required = ['id', 'name', 'character', 'startDate', 'npcs', 'startingInventory'];

  for (const field of required) {
    if (!config[field]) {
      throw new Error(`Invalid scenario: missing ${field}`);
    }
  }

  // Validate character
  if (!config.character.name || !config.character.portraits) {
    throw new Error('Invalid character config');
  }

  // Validate NPCs
  if (!Array.isArray(config.npcs) || config.npcs.length === 0) {
    throw new Error('Scenario must have at least one NPC');
  }

  // Validate starting inventory
  if (!Array.isArray(config.startingInventory)) {
    throw new Error('Starting inventory must be an array');
  }

  return true;
}
