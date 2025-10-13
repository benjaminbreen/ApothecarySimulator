// Type definitions for NPCs and entity system

/**
 * @typedef {Object} NPC
 * @property {string} id - Unique NPC identifier
 * @property {string} name - NPC full name
 * @property {string} type - NPC type ("patient", "antagonist", "helper", "neutral", "state", "rival")
 * @property {string} description - NPC description
 * @property {string} [diagnosis] - Medical diagnosis (for patients)
 * @property {string} [socialContext] - Social background and context
 * @property {string} [secret] - Hidden information about NPC
 * @property {string} portraitKey - Key to find portrait image
 * @property {number} [relationshipScore] - Relationship with protagonist (-100 to 100)
 * @property {string[]} [symptoms] - List of symptoms (for patients)
 * @property {string} [occupation] - NPC's occupation
 * @property {string} [socialClass] - Social class
 * @property {string} [class] - Social class (alternate field name for compatibility)
 * @property {number} [age] - NPC age
 * @property {string[]} [tags] - Tags for scripted events (e.g., ["debt-collector-primary", "antagonist-main"])
 */

/**
 * @typedef {Object} NPCState
 * @property {string} name - NPC name
 * @property {number} interactionCount - Number of interactions
 * @property {string} lastSeen - ISO timestamp of last interaction
 * @property {string} lastLocation - Last known location
 * @property {number} relationshipScore - Current relationship score
 * @property {TreatmentRecord[]} treatmentHistory - History of treatments
 * @property {string[]} knownSecrets - Secrets player has discovered
 * @property {Object} customData - Scenario-specific custom data
 */

/**
 * @typedef {Object} TreatmentRecord
 * @property {string} date - Game date of treatment
 * @property {string} treatment - Treatment description
 * @property {boolean} successful - Whether treatment was successful
 * @property {number} reputationChange - Reputation change from treatment
 */

/**
 * @typedef {Object} EntitySelectionContext
 * @property {number} turnNumber - Current turn
 * @property {string} location - Current location
 * @property {string} time - Current time
 * @property {string} date - Current date
 * @property {string[]} recentNPCs - Recently encountered NPC names
 * @property {string} reputation - Current reputation emoji
 * @property {number} wealth - Current wealth
 * @property {Quest[]} [activeQuests] - Active quests
 * @property {string} scenarioId - Current scenario ID
 */

/**
 * NPC type categories
 */
export const NPC_TYPES = {
  PATIENT: 'patient',
  ANTAGONIST: 'antagonist',
  HELPER: 'helper',
  NEUTRAL: 'neutral',
  STATE: 'state',
  RIVAL: 'rival'
};

/**
 * Valid NPC types for random encounter selection
 */
export const VALID_ENCOUNTER_TYPES = [
  NPC_TYPES.PATIENT,
  NPC_TYPES.ANTAGONIST,
  NPC_TYPES.HELPER,
  NPC_TYPES.STATE
];

/**
 * Relationship score thresholds
 */
export const RELATIONSHIP_LEVELS = {
  ENEMY: -75,
  HOSTILE: -50,
  UNFRIENDLY: -25,
  NEUTRAL: 0,
  FRIENDLY: 25,
  ALLY: 50,
  DEVOTED: 75
};

/**
 * Get relationship level from score
 * @param {number} score - Relationship score (-100 to 100)
 * @returns {string} - Relationship level name
 */
export function getRelationshipLevel(score) {
  if (score <= RELATIONSHIP_LEVELS.ENEMY) return 'Enemy';
  if (score <= RELATIONSHIP_LEVELS.HOSTILE) return 'Hostile';
  if (score <= RELATIONSHIP_LEVELS.UNFRIENDLY) return 'Unfriendly';
  if (score <= RELATIONSHIP_LEVELS.NEUTRAL) return 'Neutral';
  if (score <= RELATIONSHIP_LEVELS.FRIENDLY) return 'Friendly';
  if (score <= RELATIONSHIP_LEVELS.ALLY) return 'Ally';
  return 'Devoted';
}

/**
 * Validate NPC structure
 * @param {NPC} npc - NPC to validate
 * @returns {boolean} - True if valid
 * @throws {Error} - If validation fails
 */
export function validateNPC(npc) {
  const required = ['id', 'name', 'type', 'description'];

  for (const field of required) {
    if (!npc[field]) {
      throw new Error(`Invalid NPC: missing ${field}`);
    }
  }

  // Validate type
  const validTypes = Object.values(NPC_TYPES);
  if (!validTypes.includes(npc.type)) {
    throw new Error(`Invalid NPC type: ${npc.type}`);
  }

  // Patients must have diagnosis
  if (npc.type === NPC_TYPES.PATIENT && !npc.diagnosis) {
    console.warn(`Patient ${npc.name} is missing diagnosis`);
  }

  return true;
}
