/**
 * Profession Abilities System
 *
 * Manages profession-specific abilities unlocked at levels 5, 10, 15, 20, 25.
 * Each profession has unique bonuses and modifiers that enhance gameplay.
 *
 * @module professionAbilities
 */

import {
  PROFESSIONS,
  getProfessionName,
  getProfessionIcon,
  getProfessionDescription
} from './levelingSystem';

// Re-export from levelingSystem for convenience
export {
  PROFESSIONS,
  getProfessionName,
  getProfessionIcon,
  getProfessionDescription
};

/**
 * Ability definitions for all professions
 * Each profession has abilities unlocked at specific levels
 */
export const ABILITIES = {
  [PROFESSIONS.ALCHEMIST]: {
    5: {
      name: 'Efficient Mixing',
      description: '25% chance to retain all ingredients when mixing',
      ingredientRetention: 0.25
    },
    10: {
      name: 'Swift Compounds',
      description: 'Mixing time reduced by 50%',
      mixingTimeMultiplier: 0.5
    },
    15: {
      name: 'Double Batch',
      description: '10% chance to create double quantity when mixing',
      doubleBatchChance: 0.10
    },
    20: {
      name: 'Master Alchemist',
      description: 'Mixing never results in "Unusable Sludge"',
      preventSludge: true
    },
    25: {
      name: 'Legendary Chemist',
      description: 'All mixing bonuses improved: 50% ingredient retention, 75% time reduction, 20% double batch',
      ingredientRetention: 0.50,
      mixingTimeMultiplier: 0.25,
      doubleBatchChance: 0.20,
      preventSludge: true
    }
  },

  [PROFESSIONS.HERBALIST]: {
    5: {
      name: 'Green Thumb',
      description: '+25% foraging success rate',
      foragingSuccessMultiplier: 1.25
    },
    10: {
      name: 'Bountiful Harvest',
      description: 'Minimum 2 items when foraging successfully',
      minForageQuantity: 2
    },
    15: {
      name: 'Market Savvy',
      description: '15% discount when buying herbs and plants',
      herbDiscount: 0.15
    },
    20: {
      name: "Nature's Favor",
      description: 'Rare forage drops 2x more common (20% instead of 10%)',
      rareDropThreshold: 0.20
    },
    25: {
      name: 'Master Herbalist',
      description: 'Foraging +50% success, rare drops 30% chance, minimum 3 items',
      foragingSuccessMultiplier: 1.5,
      minForageQuantity: 3,
      rareDropThreshold: 0.30
    }
  },

  [PROFESSIONS.SURGEON]: {
    5: {
      name: 'Steady Hand',
      description: '+3 bonus to anatomy skill checks during surgery',
      surgerySkillBonus: 3
    },
    10: {
      name: 'Higher Fees',
      description: 'Surgical procedures earn 50% more payment',
      surgeryPaymentMultiplier: 1.5
    },
    15: {
      name: 'Complication Prevention',
      description: '50% chance to avoid complications on failed surgery',
      complicationPreventionChance: 0.5
    },
    20: {
      name: 'Swift Surgery',
      description: 'Surgery takes 50% less time',
      surgeryTimeMultiplier: 0.5
    },
    25: {
      name: 'Master Surgeon',
      description: '+5 anatomy bonus, 75% complication prevention, 100% higher fees, 75% faster',
      surgerySkillBonus: 5,
      surgeryPaymentMultiplier: 2.0,
      complicationPreventionChance: 0.75,
      surgeryTimeMultiplier: 0.25
    }
  },

  [PROFESSIONS.POISONER]: {
    5: {
      name: 'Black Market Access',
      description: 'Unlock shady merchants selling poison ingredients and illicit drugs',
      unlockBlackMarket: true,
      blackMarketCategories: ['poisons', 'drugs']
    },
    10: {
      name: 'Poison Expertise',
      description: '+25% XP from toxic substances. Unlock weapons dealer at black market',
      toxicXPMultiplier: 1.25,
      blackMarketCategories: ['poisons', 'drugs', 'weapons']
    },
    15: {
      name: 'Shadow Contacts',
      description: '15% discount on black market. 50% less reputation loss from poisoning',
      blackMarketDiscount: 0.15,
      negativeReputationMultiplier: 0.5
    },
    20: {
      name: 'Deep Underworld',
      description: '25% black market discount. Rare contraband items now available',
      blackMarketDiscount: 0.25,
      unlockRareContraband: true
    },
    25: {
      name: 'Master of Shadows',
      description: '+50% toxic XP, 75% less reputation loss, 35% black market discount',
      toxicXPMultiplier: 1.5,
      negativeReputationMultiplier: 0.25,
      blackMarketDiscount: 0.35,
      unlockRareContraband: true,
      blackMarketCategories: ['poisons', 'drugs', 'weapons']
    }
  },

  [PROFESSIONS.SCHOLAR]: {
    5: {
      name: 'Voracious Learner',
      description: '+25% XP from all sources',
      xpMultiplier: 1.25
    },
    10: {
      name: 'Rapid Mastery',
      description: '+50% skill XP from all actions',
      skillXPMultiplier: 1.5
    },
    15: {
      name: 'Academic Efficiency',
      description: 'XP bonus increases to +50%',
      xpMultiplier: 1.5
    },
    20: {
      name: 'Natural Philosopher',
      description: 'Skill XP bonus increases to +100%',
      skillXPMultiplier: 2.0
    },
    25: {
      name: 'Immortal Sage',
      description: '+100% XP from all sources, +150% skill XP',
      xpMultiplier: 2.0,
      skillXPMultiplier: 2.5
    }
  },

  [PROFESSIONS.COURT_PHYSICIAN]: {
    5: {
      name: 'Silver Tongue',
      description: '+50% reputation gains',
      positiveReputationMultiplier: 1.5
    },
    10: {
      name: 'Aristocratic Clientele',
      description: 'All prescription payments +25%',
      prescriptionPaymentMultiplier: 1.25
    },
    15: {
      name: 'Merchant Connections',
      description: '15% discount at all markets',
      marketDiscount: 0.15
    },
    20: {
      name: 'Court Patronage',
      description: 'Gain +5 silver reales per day automatically',
      passiveIncomePerDay: 5
    },
    25: {
      name: 'Beloved of All Nations',
      description: '+100% reputation gains, +50% prescription payments, 25% market discount, +10 reales/day',
      positiveReputationMultiplier: 2.0,
      prescriptionPaymentMultiplier: 1.5,
      marketDiscount: 0.25,
      passiveIncomePerDay: 10
    }
  }
};

/**
 * Check if player has a specific ability unlocked
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @param {number} requiredLevel - Level required for ability
 * @returns {boolean}
 */
export function hasAbility(chosenProfession, playerLevel, requiredLevel) {
  if (!chosenProfession) return false;
  return playerLevel >= requiredLevel;
}

/**
 * Get ability configuration for profession at specific level
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @param {number} abilityLevel - Level of the ability to retrieve
 * @returns {Object|null} Ability config or null if not unlocked
 */
export function getAbilityConfig(chosenProfession, playerLevel, abilityLevel) {
  if (!hasAbility(chosenProfession, playerLevel, abilityLevel)) return null;
  return ABILITIES[chosenProfession]?.[abilityLevel] || null;
}

/**
 * Get all unlocked abilities for player
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {Array<Object>} Array of unlocked abilities
 */
export function getUnlockedAbilities(chosenProfession, playerLevel) {
  if (!chosenProfession) return [];

  const professionAbilities = ABILITIES[chosenProfession];
  if (!professionAbilities) return [];

  return Object.entries(professionAbilities)
    .filter(([level]) => playerLevel >= parseInt(level))
    .map(([level, config]) => ({
      level: parseInt(level),
      ...config
    }));
}

/**
 * Calculate best modifier value for a specific bonus type
 * Higher level abilities override lower level ones
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @param {string} modifierType - Type of modifier to calculate
 * @returns {any|null} Best modifier value or null
 */
export function calculateModifier(chosenProfession, playerLevel, modifierType) {
  const unlockedAbilities = getUnlockedAbilities(chosenProfession, playerLevel);

  let bestModifier = null;

  unlockedAbilities.forEach(ability => {
    if (ability[modifierType] !== undefined) {
      // Higher level abilities override lower ones
      bestModifier = ability[modifierType];
    }
  });

  return bestModifier;
}

// ============================================
// Specific Helper Functions for Game Systems
// ============================================

/**
 * Get mixing time multiplier for Alchemist
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Time multiplier (1.0 = normal, 0.5 = 50% faster)
 */
export function getMixingTimeMultiplier(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.ALCHEMIST) return 1.0;
  return calculateModifier(chosenProfession, playerLevel, 'mixingTimeMultiplier') || 1.0;
}

/**
 * Get ingredient retention chance for Alchemist
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Chance to retain ingredients (0.0 to 1.0)
 */
export function getIngredientRetentionChance(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.ALCHEMIST) return 0;
  return calculateModifier(chosenProfession, playerLevel, 'ingredientRetention') || 0;
}

/**
 * Get double batch chance for Alchemist
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Chance to create double batch (0.0 to 1.0)
 */
export function getDoubleBatchChance(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.ALCHEMIST) return 0;
  return calculateModifier(chosenProfession, playerLevel, 'doubleBatchChance') || 0;
}

/**
 * Check if Alchemist can prevent sludge
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {boolean}
 */
export function canPreventSludge(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.ALCHEMIST) return false;
  return calculateModifier(chosenProfession, playerLevel, 'preventSludge') || false;
}

/**
 * Get foraging success rate multiplier for Herbalist
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Multiplier (1.0 = normal, 1.25 = 25% better)
 */
export function getForagingSuccessMultiplier(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.HERBALIST) return 1.0;
  return calculateModifier(chosenProfession, playerLevel, 'foragingSuccessMultiplier') || 1.0;
}

/**
 * Get minimum forage quantity for Herbalist
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Minimum quantity (1 = normal)
 */
export function getMinForageQuantity(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.HERBALIST) return 1;
  return calculateModifier(chosenProfession, playerLevel, 'minForageQuantity') || 1;
}

/**
 * Get rare drop threshold for Herbalist
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Threshold (0.10 = 10%, 0.20 = 20%, etc.)
 */
export function getRareDropThreshold(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.HERBALIST) return 0.10; // Default 10%
  return calculateModifier(chosenProfession, playerLevel, 'rareDropThreshold') || 0.10;
}

/**
 * Get surgery skill bonus for Surgeon
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Bonus to add to skill check
 */
export function getSurgerySkillBonus(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.SURGEON) return 0;
  return calculateModifier(chosenProfession, playerLevel, 'surgerySkillBonus') || 0;
}

/**
 * Get surgery payment multiplier for Surgeon
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Payment multiplier (1.0 = normal, 1.5 = 50% more)
 */
export function getSurgeryPaymentMultiplier(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.SURGEON) return 1.0;
  return calculateModifier(chosenProfession, playerLevel, 'surgeryPaymentMultiplier') || 1.0;
}

/**
 * Get complication prevention chance for Surgeon
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Chance to prevent complications (0.0 to 1.0)
 */
export function getComplicationPreventionChance(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.SURGEON) return 0;
  return calculateModifier(chosenProfession, playerLevel, 'complicationPreventionChance') || 0;
}

/**
 * Get surgery time multiplier for Surgeon
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Time multiplier (1.0 = normal, 0.5 = 50% faster)
 */
export function getSurgeryTimeMultiplier(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.SURGEON) return 1.0;
  return calculateModifier(chosenProfession, playerLevel, 'surgeryTimeMultiplier') || 1.0;
}

// ========== ALIASES FOR BLOODLETTING MODAL ==========

/**
 * Alias for getComplicationPreventionChance (used in BloodlettingModal)
 */
export function getComplicationChanceReduction(chosenProfession, playerLevel) {
  return getComplicationPreventionChance(chosenProfession, playerLevel);
}

/**
 * Get bloodletting difficulty reduction for Surgeon
 * Reduces the DC (difficulty class) for skill checks
 */
export function getBloodlettingDifficultyReduction(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.SURGEON) return 0;

  // L10: -2 DC
  if (playerLevel >= 10 && playerLevel < 25) {
    return 2;
  }

  // L25: -4 DC
  if (playerLevel >= 25) {
    return 4;
  }

  return 0;
}

/**
 * Alias for getSurgeryPaymentMultiplier (used in BloodlettingModal)
 */
export function getBloodlettingPaymentBonus(chosenProfession, playerLevel) {
  return getSurgeryPaymentMultiplier(chosenProfession, playerLevel);
}

// ========== ALIASES FOR COURT PHYSICIAN ==========

/**
 * Get payment multiplier for wealthy patients (Court Physician L15/L20)
 */
export function getPaymentMultiplier(chosenProfession, playerLevel, patient = {}) {
  if (chosenProfession !== PROFESSIONS.COURT_PHYSICIAN) return 1.0;
  if (playerLevel < 15) return 1.0;

  // Check if patient is wealthy/noble
  const socialClass = patient?.social?.class || '';
  const isWealthy = ['nobility', 'elite', 'professional'].includes(socialClass.toLowerCase());

  if (!isWealthy) return 1.0;

  // L10: 25% bonus
  if (playerLevel >= 10 && playerLevel < 15) {
    return 1.25;
  }

  // L15: 50% bonus
  if (playerLevel >= 15) {
    return 1.50;
  }

  return 1.0;
}

/**
 * Get XP multiplier (primarily for Scholar, but also checks Poisoner for toxic substances)
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} XP multiplier (1.0 = normal, 1.25 = 25% more)
 */
export function getXPMultiplier(chosenProfession, playerLevel) {
  if (chosenProfession === PROFESSIONS.SCHOLAR) {
    return calculateModifier(chosenProfession, playerLevel, 'xpMultiplier') || 1.0;
  }
  return 1.0;
}

/**
 * Get skill XP multiplier for Scholar
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Skill XP multiplier
 */
export function getSkillXPMultiplier(chosenProfession, playerLevel) {
  if (chosenProfession === PROFESSIONS.SCHOLAR) {
    return calculateModifier(chosenProfession, playerLevel, 'skillXPMultiplier') || 1.0;
  }
  return 1.0;
}

/**
 * Check if item is toxic and get Poisoner XP bonus
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @param {string} itemName - Name of the item being prescribed
 * @returns {number} XP multiplier for toxic substances
 */
export function getToxicXPBonus(chosenProfession, playerLevel, itemName) {
  if (chosenProfession !== PROFESSIONS.POISONER) return 1.0;

  const toxicKeywords = [
    'mercury', 'quicksilver', 'opium', 'laudanum', 'arsenic',
    'belladonna', 'hemlock', 'nightshade', 'aconite', 'antimony',
    'lead', 'antimony', 'vitriol', 'aqua fortis'
  ];

  const isToxic = toxicKeywords.some(keyword =>
    itemName.toLowerCase().includes(keyword)
  );

  if (!isToxic) return 1.0;

  return calculateModifier(chosenProfession, playerLevel, 'toxicXPMultiplier') || 1.0;
}

/**
 * Get reputation multiplier based on reputation change direction
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @param {number} reputationDelta - Reputation change (positive or negative)
 * @returns {number} Reputation multiplier
 */
export function getReputationMultiplier(chosenProfession, playerLevel, reputationDelta) {
  const deltaSign = Math.sign(reputationDelta);

  // Court Physician: Boost positive reputation
  if (chosenProfession === PROFESSIONS.COURT_PHYSICIAN && deltaSign > 0) {
    return calculateModifier(chosenProfession, playerLevel, 'positiveReputationMultiplier') || 1.0;
  }

  // Poisoner: Reduce negative reputation
  if (chosenProfession === PROFESSIONS.POISONER && deltaSign < 0) {
    return calculateModifier(chosenProfession, playerLevel, 'negativeReputationMultiplier') || 1.0;
  }

  return 1.0;
}

/**
 * Get Inquisition reputation protection (Poisoner L15/L20 ability)
 * Returns a reduction percentage applied to negative Inquisition reputation changes
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @param {string} itemUsed - Name of item used (for toxic substance detection)
 * @returns {number} Protection as decimal (0.5 = 50% reduction in reputation loss)
 */
export function getInquisitionProtection(chosenProfession, playerLevel, itemUsed = '') {
  if (chosenProfession !== PROFESSIONS.POISONER) return 0;
  if (playerLevel < 15) return 0;

  // Check if item is toxic
  const isToxic = TOXIC_SUBSTANCES.some(toxic =>
    itemUsed.toLowerCase().includes(toxic.toLowerCase())
  );

  if (!isToxic) return 0;

  // L10: 50% protection
  if (playerLevel >= 10 && playerLevel < 15) {
    return 0.5;
  }

  // L15: 75% protection
  if (playerLevel >= 15) {
    return 0.75;
  }

  return 0;
}

/**
 * Get market discount bonus
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @param {Array<string>} itemCategories - Categories of item being purchased
 * @returns {number} Discount as decimal (0.15 = 15% off)
 */
export function getMarketDiscountBonus(chosenProfession, playerLevel, itemCategories = []) {
  let totalDiscount = 0;

  // Court Physician: Universal discount
  if (chosenProfession === PROFESSIONS.COURT_PHYSICIAN) {
    const discount = calculateModifier(chosenProfession, playerLevel, 'marketDiscount');
    if (discount) totalDiscount += discount;
  }

  // Herbalist: Herb-specific discount
  if (chosenProfession === PROFESSIONS.HERBALIST && itemCategories.includes('herb')) {
    const discount = calculateModifier(chosenProfession, playerLevel, 'herbDiscount');
    if (discount) totalDiscount += discount;
  }

  // Poisoner: Black market discount (L15+)
  if (chosenProfession === PROFESSIONS.POISONER && playerLevel >= 15) {
    const discount = calculateModifier(chosenProfession, playerLevel, 'blackMarketDiscount');
    if (discount) totalDiscount += discount;
  }

  return totalDiscount;
}

/**
 * Get prescription payment multiplier
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Payment multiplier (1.0 = normal, 1.25 = 25% more)
 */
export function getPrescriptionPaymentMultiplier(chosenProfession, playerLevel) {
  if (chosenProfession === PROFESSIONS.COURT_PHYSICIAN) {
    return calculateModifier(chosenProfession, playerLevel, 'prescriptionPaymentMultiplier') || 1.0;
  }
  return 1.0;
}

/**
 * Check if black market is unlocked for Poisoner
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {boolean}
 */
export function hasBlackMarketAccess(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.POISONER) return false;
  // Black market unlocked immediately at L5 for Poisoners
  return playerLevel >= 5;
}

/**
 * Get available black market categories for Poisoner
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {Array<string>} Available categories
 */
export function getBlackMarketCategories(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.POISONER) return [];
  if (playerLevel < 5) return [];

  // L5-9: Poisons and drugs only
  if (playerLevel < 10) {
    return ['poisons', 'drugs'];
  }

  // L10+: Add weapons
  return ['poisons', 'drugs', 'weapons'];
}

/**
 * Check if rare contraband is available
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {boolean}
 */
export function hasRareContrabandAccess(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.POISONER) return false;
  return playerLevel >= 20;
}

/**
 * Get black market discount for Poisoner
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Discount percentage (0.15 = 15% off)
 */
export function getBlackMarketDiscount(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.POISONER) return 0;

  const discount = calculateModifier(chosenProfession, playerLevel, 'blackMarketDiscount');
  return discount || 0;
}

/**
 * Get negative reputation multiplier for Poisoner (reduces reputation loss from dark deeds)
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Multiplier (1.0 = normal, 0.5 = 50% less loss, etc.)
 */
export function getNegativeReputationMultiplier(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.POISONER) return 1.0;

  const multiplier = calculateModifier(chosenProfession, playerLevel, 'negativeReputationMultiplier');
  return multiplier || 1.0;
}

/**
 * Get passive income per day for Court Physician
 * @param {string} chosenProfession - Player's chosen profession
 * @param {number} playerLevel - Player's current level
 * @returns {number} Reales per day
 */
export function getPassiveIncomePerDay(chosenProfession, playerLevel) {
  if (chosenProfession !== PROFESSIONS.COURT_PHYSICIAN) return 0;
  return calculateModifier(chosenProfession, playerLevel, 'passiveIncomePerDay') || 0;
}

/**
 * Get all abilities for a profession (for UI display)
 * @param {string} professionId - Profession ID
 * @returns {Array<Object>} All abilities with level requirements
 */
export function getAllAbilitiesForProfession(professionId) {
  const abilities = ABILITIES[professionId];
  if (!abilities) return [];

  return Object.entries(abilities).map(([level, config]) => ({
    level: parseInt(level),
    ...config
  }));
}

export default {
  ABILITIES,
  hasAbility,
  getAbilityConfig,
  getUnlockedAbilities,
  calculateModifier,
  getAllAbilitiesForProfession,

  // Alchemist
  getMixingTimeMultiplier,
  getIngredientRetentionChance,
  getDoubleBatchChance,
  canPreventSludge,

  // Herbalist
  getForagingSuccessMultiplier,
  getMinForageQuantity,
  getRareDropThreshold,

  // Surgeon
  getSurgerySkillBonus,
  getSurgeryPaymentMultiplier,
  getComplicationPreventionChance,
  getSurgeryTimeMultiplier,

  // Poisoner
  getToxicXPBonus,
  hasBlackMarketAccess,
  getBlackMarketCategories,
  getBlackMarketDiscount,
  hasRareContrabandAccess,
  getNegativeReputationMultiplier,

  // Scholar
  getXPMultiplier,
  getSkillXPMultiplier,

  // Court Physician
  getReputationMultiplier,
  getMarketDiscountBonus,
  getPrescriptionPaymentMultiplier,
  getPassiveIncomePerDay
};
