/**
 * Investment Service - Business logic for investment system
 */

import { getAllInvestmentTypes, meetsRequirements, getRandomCost, getRandomDuration } from '../data/investmentTypes';
import {
  calculateInvestmentOutcome,
  calculateExpectedReturn,
  getReturnRange,
  hasMatured,
  addDaysToDate,
  getDaysRemaining,
  getProgressPercentage
} from '../utils/investmentCalculator';
import { createChatCompletion } from '../../../core/services/llmService';

/**
 * Get available investment opportunities for player
 * @param {Object} playerSkills - Player's skills
 * @param {Object} reputation - Player's reputation
 * @param {Array} activeInvestments - Currently active investments
 * @param {number} maxSlots - Maximum allowed active investments
 * @param {Object} gameState - Current game state (to check for LLM-offered investments)
 * @returns {Array} Available investment opportunities
 */
export function getAvailableInvestments(playerSkills, reputation, activeInvestments = [], maxSlots = 3, gameState = null) {
  const allTypes = getAllInvestmentTypes();

  // Filter to investments player can access
  const available = allTypes
    .map(type => {
      const eligibility = meetsRequirements(type, playerSkills, reputation);
      const suggestedCost = getRandomCost(type);
      const suggestedDuration = getRandomDuration(type);

      return {
        ...type,
        suggestedCost,
        suggestedDuration,
        eligibility,
        expectedReturn: calculateExpectedReturn(type, suggestedCost, playerSkills, reputation),
        returnRange: getReturnRange(type, suggestedCost)
      };
    })
    .filter(inv => inv.eligibility.allowed);

  // Check if there's an LLM-offered investment from simpleInteraction
  let llmOffered = null;
  if (gameState?.simpleInteraction?.type === 'investment_offer' && gameState.simpleInteraction.investment) {
    const investment = gameState.simpleInteraction.investment;
    console.log('[InvestmentService] Found LLM-offered investment:', investment);

    // Look up the type definition
    const typeDefinition = allTypes.find(t => t.id === investment.investmentType);

    if (typeDefinition) {
      // Map LLM investment to opportunity format
      const riskLevel = typeDefinition.riskLevel;
      const minReturn = investment.expectedReturn?.min || investment.amount * 1.2;
      const maxReturn = investment.expectedReturn?.max || investment.amount * 2.0;

      llmOffered = {
        ...typeDefinition,
        suggestedCost: investment.amount,
        suggestedDuration: investment.duration,
        eligibility: { allowed: true, reasons: [] }, // LLM-offered are always available
        expectedReturn: (minReturn + maxReturn) / 2,
        returnRange: {
          min: minReturn,
          max: maxReturn,
          minPercent: ((minReturn / investment.amount - 1) * 100).toFixed(0),
          maxPercent: ((maxReturn / investment.amount - 1) * 100).toFixed(0)
        },
        // Override description with LLM's specific context
        description: investment.description || typeDefinition.description,
        // Mark as LLM-offered so UI can highlight it
        isLLMOffered: true
      };

      console.log('[InvestmentService] Mapped LLM investment to opportunity:', llmOffered);
    } else {
      console.warn('[InvestmentService] Unknown investment type from LLM:', investment.investmentType);
    }
  }

  // Combine LLM-offered (first) with other available investments
  const opportunities = llmOffered ? [llmOffered, ...available] : available;

  return {
    opportunities,
    slotsAvailable: maxSlots - activeInvestments.length,
    maxSlots
  };
}

/**
 * Process a new investment
 * @param {Object} investmentType - Investment type definition
 * @param {number} amount - Amount to invest
 * @param {string} currentDate - Current game date
 * @returns {Object} New investment instance
 */
export function processNewInvestment(investmentType, amount, currentDate) {
  const duration = getRandomDuration(investmentType);
  const maturityDate = addDaysToDate(currentDate, duration);

  const investment = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    typeId: investmentType.id,
    type: investmentType.name,
    emoji: investmentType.emoji,
    amount,
    startDate: currentDate,
    maturityDate,
    duration,
    status: 'active',
    riskLevel: investmentType.riskLevel
  };

  return investment;
}

/**
 * Check for matured investments and calculate outcomes
 * @param {Array} activeInvestments - Currently active investments
 * @param {string} currentDate - Current game date
 * @param {Object} playerSkills - Player's skills
 * @param {Object} reputation - Player's reputation
 * @returns {Object} { matured: Array, stillActive: Array }
 */
export async function checkMatureInvestments(activeInvestments, currentDate, playerSkills, reputation) {
  const matured = [];
  const stillActive = [];

  for (const investment of activeInvestments) {
    if (hasMatured(investment, currentDate)) {
      // Get investment type definition
      const investmentType = getAllInvestmentTypes().find(t => t.id === investment.typeId);

      if (!investmentType) {
        console.error(`[InvestmentService] Unknown investment type: ${investment.typeId}`);
        stillActive.push(investment);
        continue;
      }

      // Calculate outcome
      const result = calculateInvestmentOutcome(investment, investmentType, playerSkills, reputation);

      // Generate narrative
      const narrative = await generateOutcomeNarrative(investment, investmentType, result);

      matured.push({
        investment,
        result,
        narrative
      });
    } else {
      stillActive.push(investment);
    }
  }

  return { matured, stillActive };
}

/**
 * Generate LLM-based narrative for investment outcome
 */
async function generateOutcomeNarrative(investment, investmentType, result) {
  const { outcome, payout, profit, returnPercentage } = result;

  const prompt = `You are generating the outcome for an investment in 1680 Mexico City.

Investment Type: ${investmentType.name} (${investmentType.emoji})
Historical Context: ${investmentType.historicalContext}
Amount Invested: ${investment.amount} reales
Duration: ${investment.duration} days
Outcome: ${outcome.label}
Payout: ${payout} reales (${profit >= 0 ? '+' : ''}${profit} reales, ${returnPercentage >= 0 ? '+' : ''}${returnPercentage}%)

Generate a brief (2-3 sentences) narrative explaining what happened with this investment.
Use historically accurate colonial Mexican details. Make it immersive and specific.
DO NOT repeat the numbers - focus on the story.

Style: Third person, matter-of-fact news report.

Example for successful mine: "Word arrives from Zacatecas that the mining consortium has struck a promising new vein of silver. Production has increased substantially, and investors are receiving handsome returns."

Example for failed galleon: "Terrible news from Acapulco: the Manila Galleon was intercepted by English privateers off the California coast. All cargo has been lost to the sea."

Generate the narrative now:`;

  try {
    const response = await createChatCompletion(prompt, [], {
      temperature: 0.8,
      max_tokens: 150
    });

    return response?.trim() || outcome.description;
  } catch (error) {
    console.error('[InvestmentService] LLM narrative generation failed:', error);
    // Fallback to template
    return `${outcome.description} Your investment of ${investment.amount} reales has returned ${payout} reales.`;
  }
}

/**
 * Get investment progress data for UI
 */
export function getInvestmentProgress(investment, currentDate) {
  return {
    daysRemaining: getDaysRemaining(investment, currentDate),
    progressPercentage: getProgressPercentage(investment, currentDate),
    isAlmostMature: getDaysRemaining(investment, currentDate) <= 2
  };
}

/**
 * Get investment statistics for player
 */
export function getInvestmentStatistics(investmentHistory) {
  if (!investmentHistory || investmentHistory.length === 0) {
    return {
      totalInvested: 0,
      totalReturned: 0,
      totalProfit: 0,
      avgReturn: 0,
      successRate: 0,
      bestDeal: null,
      worstDeal: null
    };
  }

  const totalInvested = investmentHistory.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReturned = investmentHistory.reduce((sum, inv) => sum + (inv.payout || 0), 0);
  const totalProfit = totalReturned - totalInvested;
  const avgReturn = investmentHistory.length > 0
    ? ((totalReturned / totalInvested - 1) * 100).toFixed(1)
    : 0;

  const successful = investmentHistory.filter(inv => (inv.payout || 0) > inv.amount);
  const successRate = (successful.length / investmentHistory.length * 100).toFixed(1);

  // Find best and worst deals
  const withReturns = investmentHistory.filter(inv => inv.payout !== undefined);
  const best = withReturns.length > 0
    ? withReturns.reduce((best, inv) => {
        const bestReturn = (best.payout - best.amount) / best.amount;
        const invReturn = (inv.payout - inv.amount) / inv.amount;
        return invReturn > bestReturn ? inv : best;
      })
    : null;

  const worst = withReturns.length > 0
    ? withReturns.reduce((worst, inv) => {
        const worstReturn = (worst.payout - worst.amount) / worst.amount;
        const invReturn = (inv.payout - inv.amount) / inv.amount;
        return invReturn < worstReturn ? inv : worst;
      })
    : null;

  return {
    totalInvested,
    totalReturned,
    totalProfit,
    avgReturn,
    successRate,
    bestDeal: best,
    worstDeal: worst,
    totalCount: investmentHistory.length
  };
}

/**
 * Get bonus item reward (for Apothecary Syndicate)
 */
export function getBonusItem(outcome, gameState) {
  if (!outcome.bonus || outcome.bonus.type !== 'item') return null;

  // Get a random rare materia medica from inventory system
  const rareItems = [
    { name: 'Dragon\'s Blood Resin', price: 15, rarity: 'rare', emoji: '🩸' },
    { name: 'Ambergris', price: 20, rarity: 'rare', emoji: '🐋' },
    { name: 'Bezoar Stone', price: 25, rarity: 'rare', emoji: '💎' },
    { name: 'Unicorn Horn Powder', price: 30, rarity: 'legendary', emoji: '🦄' },
    { name: 'Philosopher\'s Mercury', price: 18, rarity: 'rare', emoji: '☿️' }
  ];

  return rareItems[Math.floor(Math.random() * rareItems.length)];
}
