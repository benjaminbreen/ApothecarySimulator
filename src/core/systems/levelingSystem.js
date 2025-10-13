/**
 * Leveling System
 *
 * Manages player level progression, XP requirements, and dynamic title system.
 * Players start at Level 4 and can reach Level 99.
 * At Level 5, players choose a permanent profession specialization.
 *
 * @module levelingSystem
 */

/**
 * Profession IDs
 */
export const PROFESSIONS = {
  ALCHEMIST: 'alchemist',
  HERBALIST: 'herbalist',
  SURGEON: 'surgeon',
  POISONER: 'poisoner',
  SCHOLAR: 'scholar',
  COURT_PHYSICIAN: 'courtPhysician'
};

/**
 * Get XP required to advance from current level to next level
 * @param {number} currentLevel - Current player level
 * @returns {number} XP required for next level
 */
export function getXPForNextLevel(currentLevel) {
  if (currentLevel < 5) return 50;    // Levels 1-4: Very fast early progression
  if (currentLevel < 10) return 75;   // Levels 5-9: Fast progression
  if (currentLevel < 20) return 100;  // Levels 10-19: Steady growth
  if (currentLevel < 40) return 150;  // Levels 20-39: Moderate pace
  if (currentLevel < 60) return 200;  // Levels 40-59: Slowing down
  if (currentLevel < 80) return 250;  // Levels 60-79: Dedication required
  return 300;                          // Levels 80-99: True mastery
}

/**
 * Calculate total XP needed to reach a specific level from Level 5
 * @param {number} targetLevel - Target level
 * @returns {number} Total XP required
 */
export function getTotalXPForLevel(targetLevel) {
  let totalXP = 0;
  for (let level = 5; level < targetLevel; level++) {
    totalXP += getXPForNextLevel(level);
  }
  return totalXP;
}

/**
 * Dynamic title data for levels 1-4 (pre-profession)
 * Titles hint at player's dominant playstyle before profession choice
 */
export const PRE_PROFESSION_TITLES = {
  1: {
    // Level 1 is fixed for all paths
    default: 'Apprentice Apothecary'
  },
  2: {
    default: 'Junior Apothecary'
  },
  3: {
    default: 'Competent Apothecary'
  },
  4: {
    // Level 4 is the starting level
    default: 'Independent Apothecary'
  }
};

/**
 * Profession titles for levels 5+
 */
export const PROFESSION_TITLES = {
  [PROFESSIONS.ALCHEMIST]: {
    base: 'Alchemist',           // Levels 5-49
    master: 'Master Alchemist',  // Levels 50-98
    legendary: 'Philosopher Supreme' // Level 99
  },
  [PROFESSIONS.HERBALIST]: {
    base: 'Herbalist',
    master: 'Master Herbalist',
    legendary: 'Speaker to Plants'
  },
  [PROFESSIONS.SURGEON]: {
    base: 'Surgeon',
    master: 'Master Surgeon',
    legendary: 'Hand of Galen'
  },
  [PROFESSIONS.POISONER]: {
    base: 'Poisoner',
    master: 'Master Poisoner',
    legendary: 'Bringer of the Pale Horse'
  },
  [PROFESSIONS.SCHOLAR]: {
    base: 'Scholar-Physician',
    master: 'Fellow of Natural Philosophy',
    legendary: 'Immortal Sage'
  },
  [PROFESSIONS.COURT_PHYSICIAN]: {
    base: 'Court Physician',
    master: 'Physician to the Viceroy',
    legendary: 'Beloved of All Nations'
  }
};

/**
 * Calculate profession affinity scores based on player's skill levels
 * Higher score = player has been focusing on skills aligned with that profession
 *
 * @param {Object} knownSkills - Player's known skills { skillId: { level, xp } }
 * @returns {Object} Profession scores { professionId: score }
 */
export function calculateProfessionScores(knownSkills) {
  if (!knownSkills) {
    return {
      [PROFESSIONS.ALCHEMIST]: 0,
      [PROFESSIONS.HERBALIST]: 0,
      [PROFESSIONS.SURGEON]: 0,
      [PROFESSIONS.POISONER]: 0,
      [PROFESSIONS.SCHOLAR]: 0,
      [PROFESSIONS.COURT_PHYSICIAN]: 0
    };
  }

  // Helper to safely get skill level
  const getSkillLevel = (skillId) => knownSkills[skillId]?.level || 0;

  return {
    // Alchemist: Alchemy + Pharmacy skills
    [PROFESSIONS.ALCHEMIST]:
      getSkillLevel('alchemy') * 2.0 +
      getSkillLevel('pharmacy') * 1.5 +
      getSkillLevel('preservation') * 1.0,

    // Herbalist: Herbalism + Foraging + Diagnosis + Gardening
    [PROFESSIONS.HERBALIST]:
      getSkillLevel('herbalism') * 2.0 +
      getSkillLevel('foraging') * 1.5 +
      getSkillLevel('diagnosis') * 1.0 +
      getSkillLevel('gardening') * 1.5 +
      getSkillLevel('cooking') * 0.5,

    // Surgeon: Anatomy + Diagnosis
    [PROFESSIONS.SURGEON]:
      getSkillLevel('anatomy') * 2.0 +
      getSkillLevel('diagnosis') * 1.5 +
      getSkillLevel('combat') * 0.5,

    // Poisoner: Stealth + Deception + Theft + Alchemy (dark side)
    [PROFESSIONS.POISONER]:
      getSkillLevel('stealth') * 2.0 +
      getSkillLevel('deception') * 1.5 +
      getSkillLevel('theft') * 1.5 +
      getSkillLevel('lockpicking') * 1.0 +
      getSkillLevel('disguise') * 1.0 +
      getSkillLevel('alchemy') * 0.5, // Poisons need chemistry

    // Scholar: Natural Philosophy + Literacy + Latin + Languages
    [PROFESSIONS.SCHOLAR]:
      getSkillLevel('natural_philosophy') * 2.0 +
      getSkillLevel('literacy') * 1.5 +
      getSkillLevel('latin') * 1.5 +
      getSkillLevel('greek') * 1.0 +
      getSkillLevel('bookkeeping') * 0.5,

    // Court Physician: Persuasion + Etiquette + Bargaining + Social skills
    [PROFESSIONS.COURT_PHYSICIAN]:
      getSkillLevel('persuasion') * 2.0 +
      getSkillLevel('etiquette') * 2.0 +
      getSkillLevel('bargaining') * 1.0 +
      getSkillLevel('theology') * 1.0 +
      getSkillLevel('diagnosis') * 0.5
  };
}

/**
 * Get the dominant profession affinity (highest score)
 * @param {Object} professionScores - Scores from calculateProfessionScores()
 * @returns {string} Profession ID with highest score
 */
export function getDominantProfession(professionScores) {
  let maxScore = 0;
  let dominant = PROFESSIONS.ALCHEMIST; // Default

  Object.entries(professionScores).forEach(([professionId, score]) => {
    if (score > maxScore) {
      maxScore = score;
      dominant = professionId;
    }
  });

  return dominant;
}

/**
 * Get player's current title based on level and profession
 *
 * @param {number} level - Current player level
 * @param {string|null} chosenProfession - Chosen profession ID (null if not chosen yet)
 * @param {Object} knownSkills - Player's known skills (for pre-profession titles)
 * @returns {string} Player's title
 */
export function getPlayerTitle(level, chosenProfession, knownSkills = {}) {
  // Levels 1-4: Pre-profession titles
  if (level <= 4 && PRE_PROFESSION_TITLES[level]) {
    return PRE_PROFESSION_TITLES[level].default;
  }

  // Level 5+: Profession-based titles (after profession choice)
  if (chosenProfession && PROFESSION_TITLES[chosenProfession]) {
    if (level === 99) {
      return PROFESSION_TITLES[chosenProfession].legendary;
    } else if (level >= 50) {
      return PROFESSION_TITLES[chosenProfession].master;
    } else {
      return PROFESSION_TITLES[chosenProfession].base;
    }
  }

  // Fallback for level 5+ without profession chosen
  return 'Independent Apothecary';
}

/**
 * Get recommended professions based on player's skill distribution
 * Returns top 2 professions by score
 *
 * @param {Object} knownSkills - Player's known skills
 * @returns {Array<{profession: string, score: number}>} Top 2 professions with scores
 */
export function getRecommendedProfessions(knownSkills) {
  const scores = calculateProfessionScores(knownSkills);

  // Convert to array and sort by score descending
  const sorted = Object.entries(scores)
    .map(([profession, score]) => ({ profession, score }))
    .sort((a, b) => b.score - a.score);

  // Return top 2
  return sorted.slice(0, 2);
}

/**
 * Get profession display name
 * @param {string} professionId - Profession ID
 * @returns {string} Human-readable profession name
 */
export function getProfessionName(professionId) {
  const names = {
    [PROFESSIONS.ALCHEMIST]: 'Alchemist',
    [PROFESSIONS.HERBALIST]: 'Herbalist',
    [PROFESSIONS.SURGEON]: 'Surgeon',
    [PROFESSIONS.POISONER]: 'Poisoner',
    [PROFESSIONS.SCHOLAR]: 'Scholar-Physician',
    [PROFESSIONS.COURT_PHYSICIAN]: 'Court Physician'
  };
  return names[professionId] || 'Unknown';
}

/**
 * Get profession description
 * @param {string} professionId - Profession ID
 * @returns {string} Profession description
 */
export function getProfessionDescription(professionId) {
  const descriptions = {
    [PROFESSIONS.ALCHEMIST]: 'Master of complex compounds, transmutation, and chemical experimentation. Create legendary elixirs and unlock the secrets of chrysopoeia.',
    [PROFESSIONS.HERBALIST]: 'Expert in natural remedies, foraging, and holistic healing. Connect with indigenous medicine and cultivate powerful medicinal gardens.',
    [PROFESSIONS.SURGEON]: 'Skilled in anatomy, bloodletting, and surgical procedures. Treat traumatic wounds and perform operations others fear to attempt.',
    [PROFESSIONS.POISONER]: 'Master of toxicology, stealth, and covert operations. Create undetectable poisons and navigate the dangerous underworld.',
    [PROFESSIONS.SCHOLAR]: 'Devoted to research, correspondence, and academic pursuit. Publish treatises and join the ranks of Europe\'s greatest minds.',
    [PROFESSIONS.COURT_PHYSICIAN]: 'Expert in social navigation and diplomacy. Gain patronage of the elite and bridge cultural divides through medicine.'
  };
  return descriptions[professionId] || 'Unknown profession.';
}

/**
 * Get profession icon emoji
 * @param {string} professionId - Profession ID
 * @returns {string} Emoji icon
 */
export function getProfessionIcon(professionId) {
  const icons = {
    [PROFESSIONS.ALCHEMIST]: '⚗️',
    [PROFESSIONS.HERBALIST]: '🌿',
    [PROFESSIONS.SURGEON]: '💉',
    [PROFESSIONS.POISONER]: '☠️',
    [PROFESSIONS.SCHOLAR]: '📚',
    [PROFESSIONS.COURT_PHYSICIAN]: '👑'
  };
  return icons[professionId] || '🎓';
}

export default {
  PROFESSIONS,
  getXPForNextLevel,
  getTotalXPForLevel,
  calculateProfessionScores,
  getDominantProfession,
  getPlayerTitle,
  getRecommendedProfessions,
  getProfessionName,
  getProfessionDescription,
  getProfessionIcon,
  PRE_PROFESSION_TITLES,
  PROFESSION_TITLES
};
