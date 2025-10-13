/**
 * Quest System Utilities
 *
 * Pure functions for quest operations.
 * No side effects, fully testable.
 *
 * @module questUtils
 */

import { randomInt, random } from '../entities/procedural/historicalData';

/**
 * Generate unique quest ID
 * @returns {string}
 */
export function generateQuestId() {
  return `quest_${Date.now()}_${randomInt(1000, 9999)}`;
}

/**
 * Check if quest has expired
 * @param {Quest} quest
 * @param {number} currentTurn
 * @returns {boolean}
 */
export function isQuestExpired(quest, currentTurn) {
  if (!quest.constraints.turnLimit) return false;

  const turnsActive = currentTurn - quest.metadata.startTurn;
  return turnsActive > quest.constraints.turnLimit;
}

/**
 * Calculate quest difficulty based on player state
 * @param {Object} gameState
 * @returns {number} Difficulty multiplier (0.5 - 2.0)
 */
export function calculateQuestDifficulty(gameState) {
  let difficulty = 1.0;

  // Increase difficulty as player gains reputation
  if (gameState.reputation > 60) difficulty *= 1.2;
  if (gameState.reputation > 80) difficulty *= 1.5;

  // Decrease difficulty if struggling
  if (gameState.wealth < 20) difficulty *= 0.8;
  if (gameState.health && gameState.health < 50) difficulty *= 0.9;

  return Math.max(0.5, Math.min(2.0, difficulty));
}

/**
 * Calculate turn limit based on quest type
 * @param {string} questType
 * @param {number} difficulty
 * @returns {number} Turn limit
 */
export function calculateTurnLimit(questType, difficulty) {
  const baseLimits = {
    medical: 5,
    acquisition: 8,
    research: 12,
    crisis: 3,
    social: 10,
    economic: 15,
    ethical: 7
  };

  const base = baseLimits[questType] || 10;
  return Math.floor(base / difficulty);
}

/**
 * Filter NPCs eligible for quest type
 * @param {Array} entityList
 * @param {string} questType
 * @param {Array<string>} excludeIds - NPCs already in quests
 * @returns {Array}
 */
export function filterEligibleNPCs(entityList, questType, excludeIds = []) {
  return entityList.filter(npc => {
    // Already in a quest
    if (excludeIds.includes(npc.id)) return false;

    // Dead NPCs can't give quests
    if (npc.isDead) return false;

    // Type-specific filters
    switch (questType) {
      case 'medical':
        return npc.type === 'patient';
      case 'acquisition':
        return npc.social?.occupation === 'merchant' || npc.social?.occupation === 'herbalist';
      case 'social':
        return npc.social?.class === 'elite' || npc.type === 'authority';
      default:
        return true;
    }
  });
}

/**
 * Check if action matches quest step completion criteria
 * @param {string} action - Player action
 * @param {Object} params - Action parameters
 * @param {Object} completion - Step completion criteria
 * @returns {boolean}
 */
export function matchesCompletionCriteria(action, params, completion) {
  // Action type must match
  if (action !== completion.action) return false;

  // Target must match (if specified)
  if (completion.target && params.target !== completion.target) {
    return false;
  }

  // Additional parameter checks
  if (completion.params) {
    for (const [key, value] of Object.entries(completion.params)) {
      // Special handling for numeric comparisons
      if (key.startsWith('min') || key.startsWith('max')) {
        const actualKey = key.replace(/^(min|max)/, '').toLowerCase();
        const actualValue = params[actualKey];

        if (actualValue === undefined) return false;

        if (key.startsWith('min') && actualValue < value) return false;
        if (key.startsWith('max') && actualValue > value) return false;
      } else {
        // Exact match for other params
        if (params[key] !== value) return false;
      }
    }
  }

  return true;
}

/**
 * Format quest for display
 * @param {Quest} quest
 * @returns {string}
 */
export function formatQuestDescription(quest) {
  const { objective, progress } = quest;
  const currentStep = objective.steps[progress.currentStep];

  if (!currentStep) {
    return objective.description;
  }

  return `${objective.description}\n\nCurrent step: ${currentStep.description}`;
}

/**
 * Get quest progress percentage
 * @param {Quest} quest
 * @returns {number} Progress percentage (0-100)
 */
export function getQuestProgressPercentage(quest) {
  const { objective, progress } = quest;
  const totalSteps = objective.steps.length;
  const completedSteps = progress.currentStep;

  return Math.floor((completedSteps / totalSteps) * 100);
}

/**
 * Check if quest is urgent (near expiration)
 * @param {Quest} quest
 * @param {number} currentTurn
 * @returns {boolean}
 */
export function isQuestUrgent(quest, currentTurn) {
  if (!quest.constraints.turnLimit) return false;

  const turnsActive = currentTurn - quest.metadata.startTurn;
  const turnsRemaining = quest.constraints.turnLimit - turnsActive;

  // Urgent if 2 or fewer turns remaining
  return turnsRemaining <= 2;
}

/**
 * Get all active quest giver IDs
 * @param {Array<Quest>} activeQuests
 * @returns {Array<string>}
 */
export function getActiveQuestGiverIds(activeQuests) {
  return activeQuests.map(quest => quest.giver.npcId);
}

/**
 * Find quest by NPC name
 * @param {Array<Quest>} quests
 * @param {string} npcName
 * @returns {Quest|null}
 */
export function findQuestByNPC(quests, npcName) {
  return quests.find(quest =>
    quest.giver.name.toLowerCase() === npcName.toLowerCase()
  ) || null;
}

/**
 * Get quest type display name
 * @param {string} questType
 * @returns {string}
 */
export function getQuestTypeDisplayName(questType) {
  const displayNames = {
    medical: 'Medical Treatment',
    acquisition: 'Item Acquisition',
    research: 'Research & Discovery',
    crisis: 'Emergency Crisis',
    social: 'Social Navigation',
    economic: 'Economic Survival',
    ethical: 'Ethical Dilemma'
  };

  return displayNames[questType] || questType;
}

/**
 * Calculate reward scaling based on NPC social class
 * @param {Object} npc
 * @returns {number} Wealth multiplier
 */
export function calculateNPCWealthMultiplier(npc) {
  if (!npc.social) return 1.0;

  switch (npc.social.class) {
    case 'elite':
      return 3.0;
    case 'middling':
      return 1.5;
    case 'common':
      return 1.0;
    default:
      return 1.0;
  }
}

/**
 * Validate quest step number is valid
 * @param {Quest} quest
 * @param {number} stepNumber
 * @returns {boolean}
 */
export function isValidQuestStep(quest, stepNumber) {
  return stepNumber >= 0 && stepNumber < quest.objective.steps.length;
}

export default {
  generateQuestId,
  isQuestExpired,
  calculateQuestDifficulty,
  calculateTurnLimit,
  filterEligibleNPCs,
  matchesCompletionCriteria,
  formatQuestDescription,
  getQuestProgressPercentage,
  isQuestUrgent,
  getActiveQuestGiverIds,
  findQuestByNPC,
  getQuestTypeDisplayName,
  calculateNPCWealthMultiplier,
  isValidQuestStep
};
