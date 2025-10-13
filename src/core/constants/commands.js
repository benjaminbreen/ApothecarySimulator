// Command constants for the game
// These are the special commands players can type to trigger specific actions

/**
 * Available game commands
 * @const {Object}
 */
export const COMMANDS = {
  BUY: '#buy',
  SLEEP: '#sleep',
  PRESCRIBE: '#prescribe',
  MIX: '#mix',
  FORAGE: '#forage',
  DIAGNOSE: '#diagnose',
  SYMPTOMS: '#symptoms'
};

/**
 * Regular expression patterns for command detection
 * @const {Object}
 */
export const COMMAND_PATTERNS = {
  BUY: /^#buy\s+(.+)/i,
  SLEEP: /^#sleep/i,
  PRESCRIBE: /^#prescribe/i,
  MIX: /^#mix/i,
  FORAGE: /^#forage/i,
  DIAGNOSE: /^#diagnose/i,
  SYMPTOMS: /^#symptoms/i
};

/**
 * Human-readable command descriptions
 * @const {Object}
 */
export const COMMAND_DESCRIPTIONS = {
  [COMMANDS.BUY]: 'Purchase items from merchants',
  [COMMANDS.SLEEP]: 'Rest to restore energy and advance time',
  [COMMANDS.PRESCRIBE]: 'Prescribe medicine to a patient',
  [COMMANDS.MIX]: 'Mix ingredients to create compounds',
  [COMMANDS.FORAGE]: 'Search for herbs and materials in the environment',
  [COMMANDS.DIAGNOSE]: 'Examine a patient and form a diagnosis',
  [COMMANDS.SYMPTOMS]: 'Ask a patient about their symptoms'
};

/**
 * Check if a string contains any command
 * @param {string} input - User input string
 * @returns {string|null} - Matched command or null
 */
export function detectCommand(input) {
  const lowerInput = input.toLowerCase().trim();

  for (const [key, pattern] of Object.entries(COMMAND_PATTERNS)) {
    if (pattern.test(lowerInput)) {
      return COMMANDS[key];
    }
  }

  return null;
}

/**
 * Get all available commands as an array
 * @returns {string[]}
 */
export function getAllCommands() {
  return Object.values(COMMANDS);
}
