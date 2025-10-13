/**
 * Skill Check System
 *
 * D&D-style skill checks for various actions (lockpicking, persuasion, etc.)
 * Uses d20 + skill bonus vs. Difficulty Class (DC)
 *
 * Usage:
 *   const result = performSkillCheck('lockpicking', playerSkills, 15);
 *   if (result.success) { ... }
 *
 * @module skillCheckSystem
 */

import { SKILLS } from './skillsSystem';

/**
 * Difficulty Classes (DC) for skill checks
 */
export const DIFFICULTY = {
  TRIVIAL: 5,      // Almost impossible to fail
  EASY: 10,        // Easy for trained characters
  MODERATE: 15,    // Standard challenge
  HARD: 20,        // Difficult even for experts
  VERY_HARD: 25,   // Nearly impossible
  HEROIC: 30       // Legendary feat
};

/**
 * Get skill bonus from skill level
 * Level 1 = +2, Level 2 = +4, Level 3 = +6, Level 4 = +8, Level 5 = +10
 */
function getSkillBonus(level) {
  return level * 2;
}

/**
 * Roll a d20
 */
function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * Perform a skill check
 *
 * @param {string} skillId - ID of the skill (e.g., 'lockpicking', 'persuasion')
 * @param {Object} playerSkills - Player's skills object from useSkills hook
 * @param {number} dc - Difficulty Class (default: 15 - moderate challenge)
 * @param {Object} options - Additional options (advantage, disadvantage, modifier)
 * @returns {Object} Result object with success, roll details, and narrative
 */
export function performSkillCheck(skillId, playerSkills, dc = DIFFICULTY.MODERATE, options = {}) {
  const {
    advantage = false,      // Roll twice, take higher
    disadvantage = false,   // Roll twice, take lower
    modifier = 0,           // Additional bonus/penalty
    autoSuccess = false,    // Automatic success (for master skills)
    autoFail = false        // Automatic failure
  } = options;

  // Get skill data
  const skill = SKILLS[skillId];
  if (!skill) {
    console.error(`[Skill Check] Unknown skill: ${skillId}`);
    return {
      success: false,
      roll: 0,
      total: 0,
      dc,
      skillLevel: 0,
      skillBonus: 0,
      natural20: false,
      natural1: false,
      message: `Unknown skill: ${skillId}`
    };
  }

  // Get player's skill level (0 if not learned)
  const skillLevel = playerSkills?.knownSkills?.[skillId]?.level || 0;
  const skillBonus = getSkillBonus(skillLevel);

  // Check if player has the skill
  if (skillLevel === 0) {
    return {
      success: false,
      roll: 0,
      total: 0,
      dc,
      skillLevel: 0,
      skillBonus: 0,
      natural20: false,
      natural1: false,
      message: `You don't have the ${skill.name} skill. You cannot attempt this action.`
    };
  }

  // Auto success/fail
  if (autoSuccess) {
    return {
      success: true,
      roll: 20,
      total: 20 + skillBonus + modifier,
      dc,
      skillLevel,
      skillBonus,
      natural20: true,
      natural1: false,
      message: `Master ${skill.name} - Automatic success!`
    };
  }

  if (autoFail) {
    return {
      success: false,
      roll: 1,
      total: 1 + skillBonus + modifier,
      dc,
      skillLevel,
      skillBonus,
      natural20: false,
      natural1: true,
      message: `Critical failure!`
    };
  }

  // Roll d20 (with advantage/disadvantage)
  let roll1 = rollD20();
  let roll2 = advantage || disadvantage ? rollD20() : roll1;

  let roll = roll1;
  if (advantage) {
    roll = Math.max(roll1, roll2);
  } else if (disadvantage) {
    roll = Math.min(roll1, roll2);
  }

  const natural20 = roll === 20;
  const natural1 = roll === 1;

  // Calculate total
  const total = roll + skillBonus + modifier;

  // Determine success
  let success = total >= dc;

  // Natural 20 always succeeds (unless DC is heroic and total < DC - 5)
  if (natural20 && dc <= DIFFICULTY.VERY_HARD) {
    success = true;
  }

  // Natural 1 always fails (unless total exceeds DC by 10+)
  if (natural1 && total < dc + 10) {
    success = false;
  }

  // Generate narrative message
  let message = '';
  if (natural20) {
    message = `Critical success! You rolled a natural 20!`;
  } else if (natural1) {
    message = `Critical failure! You rolled a natural 1.`;
  } else if (success) {
    const margin = total - dc;
    if (margin >= 10) {
      message = `Outstanding success! (rolled ${roll} + ${skillBonus} = ${total} vs DC ${dc})`;
    } else if (margin >= 5) {
      message = `Solid success. (rolled ${roll} + ${skillBonus} = ${total} vs DC ${dc})`;
    } else {
      message = `Narrow success. (rolled ${roll} + ${skillBonus} = ${total} vs DC ${dc})`;
    }
  } else {
    const margin = dc - total;
    if (margin >= 10) {
      message = `Complete failure. (rolled ${roll} + ${skillBonus} = ${total} vs DC ${dc})`;
    } else if (margin >= 5) {
      message = `Failure. (rolled ${roll} + ${skillBonus} = ${total} vs DC ${dc})`;
    } else {
      message = `Narrow failure. (rolled ${roll} + ${skillBonus} = ${total} vs DC ${dc})`;
    }
  }

  // Add advantage/disadvantage info
  if (advantage) {
    message += ` [Advantage: rolled ${roll1} and ${roll2}, took ${roll}]`;
  } else if (disadvantage) {
    message += ` [Disadvantage: rolled ${roll1} and ${roll2}, took ${roll}]`;
  }

  return {
    success,
    roll,
    roll1,
    roll2,
    total,
    dc,
    skillLevel,
    skillBonus,
    modifier,
    natural20,
    natural1,
    advantage,
    disadvantage,
    message
  };
}

/**
 * Get recommended DC based on skill level and context
 * Higher skill levels face easier relative challenges
 */
export function getRecommendedDC(skillLevel, context = 'standard') {
  const baseDC = {
    trivial: DIFFICULTY.TRIVIAL,
    easy: DIFFICULTY.EASY,
    standard: DIFFICULTY.MODERATE,
    hard: DIFFICULTY.HARD,
    veryHard: DIFFICULTY.VERY_HARD,
    heroic: DIFFICULTY.HEROIC
  }[context] || DIFFICULTY.MODERATE;

  // Reduce DC slightly for higher skill levels (represents experience)
  const reduction = Math.floor(skillLevel / 2);
  return Math.max(baseDC - reduction, DIFFICULTY.TRIVIAL);
}

/**
 * Check if player can attempt a skill action
 * Returns true if player has the skill, false otherwise
 */
export function canAttemptSkillCheck(skillId, playerSkills) {
  const skillLevel = playerSkills?.knownSkills?.[skillId]?.level || 0;
  return skillLevel > 0;
}

/**
 * Get skill check context for LLM prompts
 * Formats skill data for AI narrator to understand player capabilities
 */
export function getSkillCheckContext(skillId, playerSkills) {
  const skill = SKILLS[skillId];
  if (!skill) return null;

  const skillLevel = playerSkills?.knownSkills?.[skillId]?.level || 0;
  const skillBonus = getSkillBonus(skillLevel);

  return {
    skillId,
    skillName: skill.name,
    skillLevel,
    skillBonus,
    hasSkill: skillLevel > 0,
    description: skill.description,
    category: skill.category,
    effects: skill.effects[skillLevel] || {}
  };
}

/**
 * Perform opposed skill check (two characters compete)
 * Used for contests like persuasion vs. insight, stealth vs. perception
 */
export function performOpposedCheck(
  skillId1,
  playerSkills1,
  skillId2,
  playerSkills2,
  options = {}
) {
  // Roll for both sides
  const result1 = performSkillCheck(skillId1, playerSkills1, 10, options.player || {});
  const result2 = performSkillCheck(skillId2, playerSkills2, 10, options.opponent || {});

  const playerWins = result1.total > result2.total;
  const tie = result1.total === result2.total;

  return {
    playerWins,
    tie,
    playerResult: result1,
    opponentResult: result2,
    margin: Math.abs(result1.total - result2.total),
    message: tie
      ? 'A perfect stalemate!'
      : playerWins
      ? `You succeed! (${result1.total} vs ${result2.total})`
      : `You fail. (${result1.total} vs ${result2.total})`
  };
}

/**
 * Format skill check result for display
 * Creates a narrative-friendly description of the roll
 */
export function formatSkillCheckResult(result, skillId) {
  const skill = SKILLS[skillId];
  const { success, roll, total, dc, skillBonus, natural20, natural1, message } = result;

  let narrative = `**${skill.name} Check**\n\n`;

  if (natural20) {
    narrative += `🎲 **CRITICAL SUCCESS!** You rolled a natural 20!\n\n`;
  } else if (natural1) {
    narrative += `🎲 **CRITICAL FAILURE!** You rolled a natural 1.\n\n`;
  } else {
    narrative += `🎲 **Roll**: ${roll} + ${skillBonus} (skill bonus) = **${total}**\n`;
    narrative += `🎯 **Target DC**: ${dc}\n\n`;
  }

  narrative += `**Result**: ${success ? '✅ Success' : '❌ Failure'}\n\n`;
  narrative += message;

  return narrative;
}

export default {
  performSkillCheck,
  canAttemptSkillCheck,
  getRecommendedDC,
  getSkillCheckContext,
  performOpposedCheck,
  formatSkillCheckResult,
  DIFFICULTY
};
