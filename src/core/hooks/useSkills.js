/**
 * useSkills Hook
 *
 * React hook for managing player skills, XP, and leveling
 */

import { useState, useCallback } from 'react';
import {
  initializePlayerSkills,
  addXP,
  addSkillXP,
  startLearningSkill,
  levelUpSkill,
  getActiveSkillEffects
} from '../systems/skillsSystem';

export function useSkills(onSkillLevelUp = null) {
  // Initialize skills fresh every page load (8 random skill points distributed differently each time)
  const [playerSkills, setPlayerSkills] = useState(() => {
    const newSkills = initializePlayerSkills();
    console.log('[useSkills] Initialized new skills:', Object.keys(newSkills.knownSkills).length, 'skills');
    return newSkills;
  });

  /**
   * Award XP to player (triggers level-ups)
   */
  const awardXP = useCallback((xp, source = 'unknown') => {
    console.log(`[Skills] Awarded ${xp} XP from ${source}`);
    setPlayerSkills(prev => addXP(prev, xp));
  }, []);

  /**
   * Award XP to a specific skill
   */
  const awardSkillXP = useCallback((skillId, xp, source = 'unknown') => {
    console.log(`[Skills] Awarded ${xp} XP to ${skillId} from ${source}`);
    setPlayerSkills(prev => {
      const result = addSkillXP(prev, skillId, xp);
      // If skill leveled up, trigger callback
      if (result.leveledUp && typeof onSkillLevelUp === 'function') {
        onSkillLevelUp(skillId);
      }
      return result.newState;
    });
  }, [onSkillLevelUp]);

  /**
   * Begin learning a new skill (costs 1 skill point)
   */
  const learnNewSkill = useCallback((skillId) => {
    setPlayerSkills(prev => startLearningSkill(prev, skillId));
  }, []);

  /**
   * Spend skill point to level up existing skill
   */
  const improveSkill = useCallback((skillId) => {
    setPlayerSkills(prev => levelUpSkill(prev, skillId));
  }, []);

  /**
   * Get all currently active effects from skills
   */
  const activeEffects = getActiveSkillEffects(playerSkills);

  /**
   * Reset skills (for testing or new game)
   */
  const resetSkills = useCallback(() => {
    const newSkills = initializePlayerSkills();
    setPlayerSkills(newSkills);
  }, []);

  return {
    playerSkills,
    activeEffects,
    awardXP,
    awardSkillXP,
    learnNewSkill,
    improveSkill,
    resetSkills
  };
}
