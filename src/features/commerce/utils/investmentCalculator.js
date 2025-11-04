/**
 * Investment Calculator - Handles outcome rolls and return calculations
 */

/**
 * Calculate investment outcome based on probabilities and bonuses
 * @param {Object} investment - Investment instance { type, amount, ... }
 * @param {Object} investmentType - Investment type definition
 * @param {Object} playerSkills - Player's skills
 * @param {Object} reputation - Player's reputation
 * @returns {Object} { outcome, payout, narrative }
 */
export function calculateInvestmentOutcome(investment, investmentType, playerSkills, reputation) {
  const { outcomes, bonuses } = investmentType;

  // Apply bonuses to outcome chances
  const adjustedOutcomes = applyBonuses(outcomes, bonuses, playerSkills, reputation);

  // Roll for outcome
  const roll = Math.random();
  let cumulativeChance = 0;
  let selectedOutcome = adjustedOutcomes[adjustedOutcomes.length - 1]; // Fallback to last outcome

  for (const outcome of adjustedOutcomes) {
    cumulativeChance += outcome.chance;
    if (roll <= cumulativeChance) {
      selectedOutcome = outcome;
      break;
    }
  }

  // Calculate payout
  const payout = Math.round(investment.amount * selectedOutcome.returnMultiplier);

  return {
    outcome: selectedOutcome,
    payout,
    profit: payout - investment.amount,
    returnPercentage: Math.round((selectedOutcome.returnMultiplier - 1) * 100)
  };
}

/**
 * Apply skill and reputation bonuses to outcome probabilities
 */
function applyBonuses(outcomes, bonuses, playerSkills, reputation) {
  if (!bonuses) return outcomes;

  let adjustedOutcomes = [...outcomes];

  // Skill bonus (improves best outcome chance)
  if (bonuses.skillBonus) {
    const { skill, bonusChance } = bonuses.skillBonus;
    const skillLevel = playerSkills?.knownSkills?.[skill]?.level || 0;

    if (skillLevel > 0) {
      // Shift probability from worst to best outcome
      const bonus = bonusChance * Math.min(skillLevel / 10, 1); // Cap at 10% bonus
      adjustedOutcomes = shiftProbability(adjustedOutcomes, bonus);
    }
  }

  // Reputation bonus (improves best outcome chance)
  if (bonuses.reputationBonus) {
    const { faction, threshold, bonusChance } = bonuses.reputationBonus;
    const factionRep = reputation?.factions?.[faction] || 50;

    if (factionRep >= threshold) {
      const bonus = bonusChance;
      adjustedOutcomes = shiftProbability(adjustedOutcomes, bonus);
    }
  }

  // Language bonus (for Manila Galleon)
  if (bonuses.languageBonus) {
    const { languages, level, bonusChance } = bonuses.languageBonus;
    const hasLanguage = languages.some(lang => {
      const langLevel = playerSkills?.knownSkills?.[lang]?.level || 0;
      return langLevel >= level;
    });

    if (hasLanguage) {
      adjustedOutcomes = shiftProbability(adjustedOutcomes, bonusChance);
    }
  }

  return adjustedOutcomes;
}

/**
 * Shift probability from worst to best outcomes
 */
function shiftProbability(outcomes, bonusAmount) {
  const adjusted = outcomes.map(o => ({ ...o }));
  const worstIndex = 0; // First outcome is always worst
  const bestIndex = adjusted.length - 1; // Last outcome is always best

  // Don't adjust if there's only one outcome (Church bonds)
  if (adjusted.length === 1) return adjusted;

  // Reduce worst outcome probability
  const reduction = Math.min(adjusted[worstIndex].chance, bonusAmount);
  adjusted[worstIndex].chance -= reduction;

  // Increase best outcome probability
  adjusted[bestIndex].chance += reduction;

  return adjusted;
}

/**
 * Calculate expected return for display
 */
export function calculateExpectedReturn(investmentType, amount, playerSkills, reputation) {
  const { outcomes, bonuses } = investmentType;
  const adjustedOutcomes = applyBonuses(outcomes, bonuses, playerSkills, reputation);

  // Calculate weighted average return
  const expectedMultiplier = adjustedOutcomes.reduce(
    (sum, outcome) => sum + (outcome.chance * outcome.returnMultiplier),
    0
  );

  const expectedPayout = Math.round(amount * expectedMultiplier);
  const expectedProfit = expectedPayout - amount;

  return {
    expectedPayout,
    expectedProfit,
    expectedReturn: Math.round((expectedMultiplier - 1) * 100)
  };
}

/**
 * Get min/max possible returns
 */
export function getReturnRange(investmentType, amount) {
  const { outcomes } = investmentType;

  const multipliers = outcomes.map(o => o.returnMultiplier);
  const minMultiplier = Math.min(...multipliers);
  const maxMultiplier = Math.max(...multipliers);

  return {
    min: Math.round(amount * minMultiplier),
    max: Math.round(amount * maxMultiplier),
    minPercent: Math.round((minMultiplier - 1) * 100),
    maxPercent: Math.round((maxMultiplier - 1) * 100)
  };
}

/**
 * Check if investment has matured
 */
export function hasMatured(investment, currentDate) {
  return isDateAfter(currentDate, investment.maturityDate) || currentDate === investment.maturityDate;
}

/**
 * Compare two date strings (format: "Month Day, Year")
 */
function isDateAfter(dateStr1, dateStr2) {
  const date1 = parseGameDate(dateStr1);
  const date2 = parseGameDate(dateStr2);
  return date1 > date2;
}

/**
 * Parse game date string to Date object
 */
function parseGameDate(dateStr) {
  // Format: "August 22, 1680"
  return new Date(dateStr);
}

/**
 * Add days to a date string
 */
export function addDaysToDate(dateStr, days) {
  const date = parseGameDate(dateStr);
  date.setDate(date.getDate() + days);

  // Format back to game date format
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * Calculate days remaining until maturity
 */
export function getDaysRemaining(investment, currentDate) {
  const current = parseGameDate(currentDate);
  const maturity = parseGameDate(investment.maturityDate);
  const diffTime = maturity - current;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Get progress percentage (0-100)
 */
export function getProgressPercentage(investment, currentDate) {
  const start = parseGameDate(investment.startDate);
  const maturity = parseGameDate(investment.maturityDate);
  const current = parseGameDate(currentDate);

  const totalDays = (maturity - start) / (1000 * 60 * 60 * 24);
  const elapsedDays = (current - start) / (1000 * 60 * 60 * 24);

  const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  return Math.round(progress);
}
