/**
 * pricingUtils.js - Pricing calculation utilities for commerce system
 *
 * Handles all price modifications based on:
 * - Player skills (Bargaining, Languages, Etiquette)
 * - Merchant relationships
 * - Player profession bonuses
 * - Faction reputation
 */

import { calculatePriceModifier, FACTIONS } from '../../../core/systems/reputationSystem';
import { getMarketDiscountBonus } from '../../../core/systems/professionAbilities';

/**
 * Calculate all skill-based bonuses for trading
 * @param {Object} playerSkills - Player's skill data
 * @param {Object} selectedMerchant - Current merchant data
 * @param {number} relationshipLevel - Relationship level with merchant (0-100)
 * @param {Object} gameState - Game state with profession/level
 * @param {Object} selectedItem - Currently selected item (for profession bonuses)
 * @returns {Object} { total: number, breakdown: Array<{name, level, value, color}> }
 */
export function calculateSkillBonuses(
  playerSkills,
  selectedMerchant,
  relationshipLevel,
  gameState,
  selectedItem
) {
  if (!playerSkills) return { total: 0, breakdown: [] };

  const breakdown = [];
  let totalDiscount = 0;

  // Bargaining skill (5% per level)
  const bargaining = playerSkills.knownSkills?.bargaining?.level || 0;
  if (bargaining > 0) {
    const discount = bargaining * 0.05;
    totalDiscount += discount;
    breakdown.push({
      name: 'Bargaining',
      level: bargaining,
      value: discount,
      color: '#10b981'
    });
  }

  // Language bonus (10% if you speak merchant's language at level 2+)
  const merchantLanguages = selectedMerchant.languages || [];
  const hasLanguageMatch = merchantLanguages.some(lang => {
    const skillName = lang === 'nahuatl' ? 'nahuatl' :
                     lang === 'french' ? 'french' :
                     lang === 'english' ? 'english' :
                     lang === 'latin' ? 'latin' : null;
    if (!skillName) return false;
    const skillLevel = playerSkills.knownSkills?.[skillName]?.level || 0;
    return skillLevel >= 2;
  });

  if (hasLanguageMatch) {
    totalDiscount += 0.10;
    breakdown.push({
      name: 'Language',
      level: 2,
      value: 0.10,
      color: '#6366f1'
    });
  }

  // Etiquette bonus (10% sympathetic merchant discount at level 2+)
  const etiquette = playerSkills.knownSkills?.etiquette?.level || 0;
  if (etiquette >= 2) {
    totalDiscount += 0.10;
    breakdown.push({
      name: 'Etiquette',
      level: etiquette,
      value: 0.10,
      color: '#8b5cf6'
    });
  }

  // Relationship bonus (up to 10% for repeat customers)
  const relationshipBonus = (relationshipLevel - 50) / 500; // 0-10% based on relationship above 50
  if (relationshipBonus > 0) {
    totalDiscount += relationshipBonus;
    breakdown.push({
      name: 'Relationship',
      level: Math.round(relationshipLevel),
      value: relationshipBonus,
      color: '#f59e0b'
    });
  }

  // Profession bonuses (Herbalist L20/L30, Court Physician L20/L30)
  const professionDiscount = getMarketDiscountBonus(
    gameState?.chosenProfession,
    gameState?.playerLevel,
    selectedItem?.categories || []
  );

  if (professionDiscount > 0) {
    totalDiscount += professionDiscount;

    // Determine profession name for breakdown
    const professionName = gameState?.chosenProfession === 'herbalist' ? 'Herbalist' : 'Court Physician';

    breakdown.push({
      name: professionName,
      level: gameState?.playerLevel || 0,
      value: professionDiscount,
      color: '#ec4899'
    });
  }

  return { total: totalDiscount, breakdown };
}

/**
 * Calculate reputation-based price modifier
 * @param {Object} reputation - Player's reputation data
 * @returns {number} Price multiplier (e.g., 0.9 for 10% discount, 1.1 for 10% markup)
 */
export function calculateReputationModifier(reputation) {
  if (!reputation) return 1.0;
  const merchantRep = reputation.factions?.[FACTIONS.MERCHANTS] || 50;
  return calculatePriceModifier(merchantRep);
}

/**
 * Calculate final price after all modifiers
 * @param {number} basePrice - Item's base price
 * @param {number} skillBonusTotal - Total skill discount (0-1, e.g., 0.15 for 15%)
 * @param {number} reputationModifier - Reputation multiplier
 * @returns {number} Final price (minimum 1)
 */
export function calculateFinalPrice(basePrice, skillBonusTotal, reputationModifier) {
  // Apply reputation modifier first
  let price = basePrice * reputationModifier;
  // Then apply skill bonuses
  price = price * (1 - skillBonusTotal);
  return Math.max(1, Math.round(price));
}

/**
 * Get formatted price breakdown for display
 * @param {number} basePrice - Original price
 * @param {number} finalPrice - Price after modifiers
 * @param {Array} bonusBreakdown - Array of bonus objects from calculateSkillBonuses
 * @returns {Object} { basePrice, finalPrice, savings, bonuses }
 */
export function getPriceBreakdown(basePrice, finalPrice, bonusBreakdown) {
  return {
    basePrice,
    finalPrice,
    savings: basePrice - finalPrice,
    savingsPercent: ((basePrice - finalPrice) / basePrice * 100).toFixed(1),
    bonuses: bonusBreakdown
  };
}
