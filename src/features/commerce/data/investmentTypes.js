/**
 * Investment Types for 1680 Mexico City
 *
 * Each investment has:
 * - Cost range, duration, risk level
 * - Probabilistic outcomes
 * - Skill/reputation requirements
 */

import { FACTIONS } from '../../../core/systems/reputationSystem';

export const RISK_LEVELS = {
  NONE: { id: 'none', label: 'No Risk', color: '#10b981', emoji: '🟢' },
  LOW: { id: 'low', label: 'Low Risk', color: '#3b82f6', emoji: '🔵' },
  MEDIUM: { id: 'medium', label: 'Medium Risk', color: '#f59e0b', emoji: '🟡' },
  HIGH: { id: 'high', label: 'High Risk', color: '#ef4444', emoji: '🔴' }
};

export const INVESTMENT_TYPES = {
  CHURCH_BOND: {
    id: 'church_bond',
    name: 'Church Bond',
    emoji: '⛪',
    description: 'Loan money to the Church with a guaranteed return. The safest investment available.',
    historicalContext: 'The Catholic Church in New Spain frequently issues bonds to finance cathedral construction and missionary work. These are considered the most reliable investments, backed by tithes and vast landholdings.',
    costRange: [20, 500],
    durationDays: [5, 10],
    riskLevel: RISK_LEVELS.NONE,
    outcomes: [
      {
        chance: 1.00,
        returnMultiplier: 1.10,
        label: 'Guaranteed Return',
        description: 'The Church honors its obligation and returns your investment with interest.'
      }
    ],
    requirements: {
      bookkeeping: 3
    },
    bonuses: {
      factionGain: { faction: FACTIONS.CHURCH, amount: 5 }
    }
  },

  CACAO_PLANTATION: {
    id: 'cacao_plantation',
    name: 'Cacao Plantation Shares',
    emoji: '🌿',
    description: 'Invest in cacao plantations in Veracruz. Chocolate is in high demand across Europe.',
    historicalContext: 'Cacao cultivation thrives in the humid lowlands of Veracruz. The beans are processed into chocolate, a luxury good that commands high prices in Spain and beyond.',
    costRange: [30, 100],
    durationDays: [10, 15],
    riskLevel: RISK_LEVELS.LOW,
    outcomes: [
      {
        chance: 0.15,
        returnMultiplier: 0.90,
        label: 'Drought & Pests',
        description: 'Unseasonable weather and insect infestations damage the harvest.'
      },
      {
        chance: 0.70,
        returnMultiplier: 1.25,
        label: 'Normal Harvest',
        description: 'The plantation yields a typical harvest of quality cacao beans.'
      },
      {
        chance: 0.15,
        returnMultiplier: 1.50,
        label: 'Exceptional Harvest',
        description: 'Perfect growing conditions produce an abundant, high-quality crop.'
      }
    ],
    requirements: {
      bookkeeping: 5
    },
    bonuses: {
      skillBonus: { skill: 'herbalism', bonusChance: 0.10 } // Better outcomes with plant knowledge
    }
  },

  APOTHECARY_SYNDICATE: {
    id: 'apothecary_syndicate',
    name: 'Apothecary Supply Syndicate',
    emoji: '💊',
    description: 'Pool resources with fellow apothecaries to purchase ingredients in bulk.',
    historicalContext: 'Mexico City apothecaries occasionally form syndicates to negotiate better prices with importers and reduce individual risk.',
    costRange: [40, 120],
    durationDays: [3, 7],
    riskLevel: RISK_LEVELS.LOW,
    outcomes: [
      {
        chance: 0.20,
        returnMultiplier: 1.05,
        label: 'Supplier Delays',
        description: 'Shipments arrive late, but the syndicate still turns a modest profit.'
      },
      {
        chance: 0.65,
        returnMultiplier: 1.15,
        label: 'Normal Operation',
        description: 'Bulk purchasing secures favorable prices and steady returns.'
      },
      {
        chance: 0.15,
        returnMultiplier: 1.25,
        label: 'Rare Ingredient Secured',
        description: 'The syndicate acquires a shipment of rare materia medica.',
        bonus: { type: 'item', rarity: 'rare' } // Player receives a random rare ingredient
      }
    ],
    requirements: {
      bookkeeping: 5
    }
  },

  REAL_ESTATE: {
    id: 'real_estate',
    name: 'Real Estate Venture',
    emoji: '🏠',
    description: 'Co-invest in purchasing and renting property in Mexico City.',
    historicalContext: 'The expanding colonial capital offers opportunities to profit from property rental, particularly to wealthy merchants and officials.',
    costRange: [150, 400],
    durationDays: [20, 30],
    riskLevel: RISK_LEVELS.MEDIUM,
    outcomes: [
      {
        chance: 0.10,
        returnMultiplier: 1.00,
        label: 'Tenant Default',
        description: 'The tenant fails to pay rent, returning only your initial investment.'
      },
      {
        chance: 0.05,
        returnMultiplier: 0.70,
        label: 'Earthquake Damage',
        description: 'Tremors damage the property, requiring costly repairs.'
      },
      {
        chance: 0.70,
        returnMultiplier: 1.35,
        label: 'Normal Rent Collection',
        description: 'The property is rented successfully to a reliable tenant.'
      },
      {
        chance: 0.15,
        returnMultiplier: 1.60,
        label: 'Wealthy Tenant',
        description: 'A noble family rents the property at premium rates.'
      }
    ],
    requirements: {
      bookkeeping: 6,
      etiquette: 4
    },
    bonuses: {
      reputationBonus: { faction: FACTIONS.NOBLES, threshold: 60, bonusChance: 0.10 }
    }
  },

  MANILA_GALLEON: {
    id: 'manila_galleon',
    name: 'Manila Galleon Trade',
    emoji: '🚢',
    description: 'Invest in cargo space on the annual galleon from Manila to Acapulco.',
    historicalContext: 'The Manila Galleon is the lifeblood of trans-Pacific trade, carrying silk, porcelain, and spices from Asia to New Spain. The voyage is long and perilous, but profits can be extraordinary.',
    costRange: [100, 300],
    durationDays: [30, 45],
    riskLevel: RISK_LEVELS.MEDIUM,
    outcomes: [
      {
        chance: 0.05,
        returnMultiplier: 0.00,
        label: 'Pirate Attack',
        description: 'Pirates intercept the galleon off the California coast. All cargo is lost.'
      },
      {
        chance: 0.20,
        returnMultiplier: 0.80,
        label: 'Storm Damage',
        description: 'Heavy storms damage cargo, reducing profits.'
      },
      {
        chance: 0.65,
        returnMultiplier: 2.20,
        label: 'Successful Voyage',
        description: 'The galleon arrives safely with valuable Asian goods.'
      },
      {
        chance: 0.10,
        returnMultiplier: 3.00,
        label: 'Exceptional Haul',
        description: 'A cargo of premium Chinese silk and porcelain fetches extraordinary prices.'
      }
    ],
    requirements: {
      bookkeeping: 7
    },
    bonuses: {
      languageBonus: { languages: ['chinese', 'tagalog'], level: 3, bonusChance: 0.05 }
    }
  },

  SILVER_MINING: {
    id: 'silver_mining',
    name: 'Silver Mining Consortium',
    emoji: '🏔️',
    description: 'Purchase shares in silver mining operations in Zacatecas or Guanajuato.',
    historicalContext: 'New Spain\'s silver mines are legendary for their wealth, but mining is dangerous and unpredictable. Fortunes are made and lost in the depths.',
    costRange: [50, 200],
    durationDays: [7, 14],
    riskLevel: RISK_LEVELS.HIGH,
    outcomes: [
      {
        chance: 0.10,
        returnMultiplier: 0.00,
        label: 'Mine Collapse',
        description: 'A catastrophic collapse destroys the mine and all invested capital.'
      },
      {
        chance: 0.15,
        returnMultiplier: 0.50,
        label: 'Labor Disputes',
        description: 'Indigenous workers strike, halting production and reducing returns.'
      },
      {
        chance: 0.60,
        returnMultiplier: 1.70,
        label: 'Normal Operation',
        description: 'The mine yields a steady flow of silver ore.'
      },
      {
        chance: 0.15,
        returnMultiplier: 3.00,
        label: 'Rich Vein Discovered',
        description: 'Miners strike an exceptionally rich vein of pure silver!'
      }
    ],
    requirements: {
      bookkeeping: 10
    },
    bonuses: {
      reputationBonus: { faction: FACTIONS.MERCHANTS, threshold: 60, bonusChance: 0.05 }
    }
  }
};

/**
 * Get all investment types as array
 */
export function getAllInvestmentTypes() {
  return Object.values(INVESTMENT_TYPES);
}

/**
 * Get investment type by ID
 */
export function getInvestmentType(id) {
  return Object.values(INVESTMENT_TYPES).find(type => type.id === id);
}

/**
 * Check if player meets requirements for investment
 * NOTE: Requirements are now informational only - they don't block access
 */
export function meetsRequirements(investmentType, playerSkills, reputation) {
  const { requirements, bonuses } = investmentType;
  const warnings = [];

  // Check bookkeeping requirement (informational only)
  if (requirements.bookkeeping) {
    const bookkeepingLevel = playerSkills?.knownSkills?.bookkeeping?.level || 0;
    if (bookkeepingLevel < requirements.bookkeeping) {
      warnings.push(`💡 Bookkeeping Level ${requirements.bookkeeping} recommended for better outcomes`);
    }
  }

  // Check etiquette requirement (informational only)
  if (requirements.etiquette) {
    const etiquetteLevel = playerSkills?.knownSkills?.etiquette?.level || 0;
    if (etiquetteLevel < requirements.etiquette) {
      warnings.push(`💡 Etiquette Level ${requirements.etiquette} recommended`);
    }
  }

  // Check reputation requirement (optional - doesn't block, just reduces success)
  if (bonuses?.reputationBonus) {
    const factionRep = reputation?.factions?.[bonuses.reputationBonus.faction] || 50;
    if (factionRep < bonuses.reputationBonus.threshold) {
      warnings.push(`💡 Higher ${bonuses.reputationBonus.faction} reputation would improve chances`);
    }
  }

  return { allowed: true };
}

/**
 * Get random cost within investment's range
 */
export function getRandomCost(investmentType) {
  const [min, max] = investmentType.costRange;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random duration within investment's range
 */
export function getRandomDuration(investmentType) {
  const [min, max] = investmentType.durationDays;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
