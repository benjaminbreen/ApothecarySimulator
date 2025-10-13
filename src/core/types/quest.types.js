/**
 * Quest System Type Definitions
 *
 * Provides TypeScript-style JSDoc types for quest system.
 * Import these in all quest-related files for IDE autocomplete and validation.
 *
 * @module quest.types
 */

/**
 * Quest status enum
 * @typedef {'active' | 'completed' | 'failed' | 'expired'} QuestStatus
 */

/**
 * Quest type enum
 * @typedef {'medical' | 'acquisition' | 'research' | 'crisis' | 'social' | 'economic' | 'ethical'} QuestType
 */

/**
 * Quest category enum
 * @typedef {'medical' | 'economic' | 'social' | 'research'} QuestCategory
 */

/**
 * Quest step completion criteria
 * @typedef {Object} QuestStepCompletion
 * @property {string} action - Required action type (e.g., 'diagnose', 'prescribe', 'buy')
 * @property {string} [target] - Target NPC name (optional)
 * @property {Object} [params] - Additional parameters for matching
 */

/**
 * Individual quest step
 * @typedef {Object} QuestStep
 * @property {number} stepNumber - Step index (1-based for display)
 * @property {string} description - Human-readable step description
 * @property {QuestStepCompletion} completion - Completion criteria
 * @property {boolean} completed - Whether step is complete
 */

/**
 * Quest objective structure
 * @typedef {Object} QuestObjective
 * @property {string} description - Overall quest description
 * @property {Array<QuestStep>} steps - Sequential steps to complete
 * @property {Object} completion - Overall completion rules
 * @property {boolean} [completion.allSteps] - All steps must be complete
 * @property {number} [completion.timeLimit] - Turn limit for completion
 */

/**
 * Quest rewards
 * @typedef {Object} QuestRewards
 * @property {number} wealth - Silver coins reward
 * @property {number} reputation - Reputation points reward
 * @property {Array<Object>} items - Item rewards
 * @property {Array<string>} knowledge - Unlocked recipes/methods
 * @property {Array<Object>} [relationships] - NPC relationship changes
 */

/**
 * Quest constraints
 * @typedef {Object} QuestConstraints
 * @property {number} [turnLimit] - Must complete within X turns (null = no limit)
 * @property {Array<string>} failureConditions - Conditions that cause failure
 */

/**
 * Quest giver info
 * @typedef {Object} QuestGiver
 * @property {string} npcId - NPC entity ID
 * @property {string} name - NPC name
 * @property {string} type - NPC type (patient, merchant, etc.)
 */

/**
 * Quest progress tracking
 * @typedef {Object} QuestProgress
 * @property {number} currentStep - Index of current step (0-based)
 * @property {number} turnsActive - Turns since quest started
 * @property {Object} stepData - Step-specific tracking data
 */

/**
 * Quest narrative text
 * @typedef {Object} QuestNarrative
 * @property {string|null} intro - Quest start text (LLM-generated)
 * @property {string|null} completion - Quest end text (success)
 * @property {string|null} failure - Quest end text (failure)
 */

/**
 * Quest metadata
 * @typedef {Object} QuestMetadata
 * @property {number} startTurn - Turn quest was created
 * @property {number|null} completedTurn - Turn quest was completed/failed
 * @property {string} scenarioId - Scenario this quest belongs to
 * @property {number} difficulty - Difficulty multiplier
 */

/**
 * Complete quest object
 * @typedef {Object} Quest
 * @property {string} id - Unique quest identifier
 * @property {string} templateId - Quest template used
 * @property {QuestType} type - Quest type
 * @property {QuestStatus} status - Current status
 * @property {QuestGiver} giver - Quest giver NPC
 * @property {QuestObjective} objective - What player must do
 * @property {QuestProgress} progress - Current progress
 * @property {QuestRewards} rewards - Rewards on completion
 * @property {QuestConstraints} constraints - Time limits & failure conditions
 * @property {QuestNarrative} narrative - LLM-generated narrative
 * @property {QuestMetadata} metadata - Metadata
 * @property {string} [failureReason] - Why quest failed (if applicable)
 */

/**
 * Quest trigger conditions
 * @typedef {Object} QuestTriggerConditions
 * @property {number} [minTurn] - Minimum turn number
 * @property {number} [maxTurn] - Maximum turn number
 * @property {number} [minReputation] - Minimum reputation
 * @property {number} [maxReputation] - Maximum reputation
 * @property {number} [minWealth] - Minimum wealth
 * @property {number} [maxWealth] - Maximum wealth
 * @property {Array<string>} [location] - Required locations
 * @property {Array<string>} [timeOfDay] - Required times
 * @property {boolean} [hasPatients] - Requires patients present
 */

/**
 * Quest triggers
 * @typedef {Object} QuestTriggers
 * @property {number} baseChance - Base probability (0-1)
 * @property {QuestTriggerConditions} [conditions] - Trigger conditions
 * @property {Function} [evaluate] - Custom trigger evaluation function
 */

/**
 * Quest generation functions
 * @typedef {Object} QuestGeneration
 * @property {Function} selectNPC - Select quest giver NPC
 * @property {Function} generateObjective - Generate quest objective
 * @property {Function} generateRewards - Calculate rewards
 * @property {Function} [getFailureConditions] - Get failure conditions
 * @property {Object} [baseRewards] - Base reward values
 */

/**
 * Quest LLM settings
 * @typedef {Object} QuestLLM
 * @property {boolean} generateIntro - Use LLM for intro narrative
 * @property {boolean} generateOutcome - Use LLM for outcome
 * @property {string} [promptTemplate] - Template for LLM prompt
 */

/**
 * Quest template structure
 * @typedef {Object} QuestTemplate
 * @property {string} id - Template identifier
 * @property {QuestType} type - Quest type
 * @property {QuestCategory} category - Quest category
 * @property {QuestTriggers} triggers - When quest can appear
 * @property {QuestGeneration} generation - Procedural generation rules
 * @property {QuestLLM} llm - LLM integration settings
 */

/**
 * Quest state in game
 * @typedef {Object} QuestGameState
 * @property {Array<Quest>} active - Currently active quests
 * @property {Array<string>} completed - Completed quest IDs
 * @property {Array<string>} failed - Failed quest IDs
 * @property {Object<string, number>} cooldowns - Quest template cooldowns
 */

/**
 * Quest update for UI notifications
 * @typedef {Object} QuestUpdate
 * @property {string} type - Update type (quest_available, quest_progress, quest_completed, quest_failed)
 * @property {Quest} quest - Quest object
 * @property {string} message - User-friendly message
 */

// Export placeholder to make this a module
export const QuestTypes = {
  MEDICAL: 'medical',
  ACQUISITION: 'acquisition',
  RESEARCH: 'research',
  CRISIS: 'crisis',
  SOCIAL: 'social',
  ECONOMIC: 'economic',
  ETHICAL: 'ethical'
};

export const QuestStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired'
};

export default {
  QuestTypes,
  QuestStatus
};
