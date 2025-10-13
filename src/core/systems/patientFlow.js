/**
 * Patient Flow System
 *
 * Simple patient appearance probability calculator.
 * Determines when generic patients should seek treatment based on:
 * - Shop location
 * - Shop sign visibility
 * - Time of day
 * - Reputation
 *
 * Uses simple multipliers instead of complex probability distributions.
 */

/**
 * Time of day multipliers for patient appearance
 * Morning/afternoon are peak times, night is very slow
 */
const TIME_MULTIPLIERS = {
  "Morning": 1.2,
  "Afternoon": 1.5,
  "Evening": 0.8,
  "Night": 0.3,
  "Dawn": 0.5,
  "Dusk": 0.9
};

/**
 * Calculate patient flow probability
 * @param {Object} gameState - Current game state
 * @returns {{active: boolean, chance: number, shouldSeekPatient: boolean, factors: Object}}
 */
export function calculatePatientFlow(gameState) {
  const {
    location = '',
    shopSign = {},
    reputation = {},
    time = '',
    turnNumber = 0
  } = gameState;

  // Extract time of day from time string (e.g., "8:00 AM" -> "Morning")
  const timeOfDay = getTimeOfDay(time);

  // Must be at the shop for patients to appear
  const atShop = location.toLowerCase().includes('botica') ||
                 location.toLowerCase().includes('apothecary') ||
                 location.toLowerCase().includes('shop');

  if (!atShop) {
    return {
      active: false,
      chance: 0,
      shouldSeekPatient: false,
      factors: { reason: "Not at shop location" }
    };
  }

  // Base chance depends on shop sign
  let baseChance = shopSign.hung ? 70 : 20;

  // Track factors for debugging
  const factors = {
    location: atShop ? "At shop" : "Not at shop",
    signHung: shopSign.hung ? "Sign displayed (+high)" : "No sign (+low)",
    baseChance: baseChance
  };

  // Apply time of day multiplier
  const timeMultiplier = TIME_MULTIPLIERS[timeOfDay] || 1.0;
  baseChance *= timeMultiplier;
  factors.timeOfDay = `${timeOfDay} (${timeMultiplier}x)`;

  // Apply reputation modifier
  const overallRep = reputation.overall || 50;
  const medicalRep = reputation.medical || 50;

  if (overallRep >= 70 || medicalRep >= 70) {
    // Good reputation attracts more patients
    baseChance *= 1.5;
    factors.reputation = "Good reputation (+1.5x)";
  } else if (overallRep < 30 || medicalRep < 30) {
    // Poor reputation reduces patients
    baseChance *= 0.5;
    factors.reputation = "Poor reputation (0.5x)";
  } else {
    factors.reputation = "Average reputation (1.0x)";
  }

  // Early game boost - help player learn mechanics
  if (turnNumber < 5) {
    baseChance *= 1.3;
    factors.earlyGame = "Early game boost (+1.3x)";
  }

  // Cap at 90% to maintain some randomness
  const finalChance = Math.min(baseChance, 90);
  factors.finalChance = `${finalChance.toFixed(1)}%`;

  // Roll for patient appearance
  const roll = Math.random() * 100;
  const shouldSeekPatient = roll < finalChance;

  factors.roll = `${roll.toFixed(1)} ${shouldSeekPatient ? '<' : '>='} ${finalChance.toFixed(1)}`;

  return {
    active: true,
    chance: finalChance,
    shouldSeekPatient,
    factors
  };
}

/**
 * Determine time of day category from time string
 * @param {string} timeStr - Time string like "8:00 AM" or "3:00 PM"
 * @returns {string} - Time of day category
 */
function getTimeOfDay(timeStr) {
  if (!timeStr) return "Morning";

  // Extract hour from time string
  const hourMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!hourMatch) return "Morning";

  let hour = parseInt(hourMatch[1]);
  const period = hourMatch[3]?.toUpperCase();

  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  // Categorize time of day
  if (hour >= 5 && hour < 8) return "Dawn";
  if (hour >= 8 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 19) return "Dusk";
  if (hour >= 19 && hour < 22) return "Evening";
  return "Night";
}

/**
 * Check if player should encounter a patient (high-level check)
 * @param {Object} gameState - Current game state
 * @param {string} playerIntent - What the player is trying to do
 * @returns {boolean}
 */
export function shouldEncounterPatient(gameState, playerIntent = '') {
  const flow = calculatePatientFlow(gameState);

  // If not at shop or flow not active, no patient
  if (!flow.active) return false;

  // If player explicitly wants to see patients, boost chance
  if (playerIntent.includes('patient') || playerIntent.includes('diagnose') || playerIntent.includes('treat')) {
    console.log('[patientFlow] Player intent suggests patient encounter');
    return true;
  }

  // Otherwise use calculated probability
  if (flow.shouldSeekPatient) {
    console.log('[patientFlow] Patient seeks treatment:', flow.factors);
  }

  return flow.shouldSeekPatient;
}

/**
 * Get patient flow status message for debugging/UI
 * @param {Object} gameState - Current game state
 * @returns {string}
 */
export function getPatientFlowStatus(gameState) {
  const flow = calculatePatientFlow(gameState);

  if (!flow.active) {
    return "No patient flow (not at shop)";
  }

  const status = flow.shouldSeekPatient ? "ACTIVE" : "inactive";
  return `Patient flow ${status}: ${flow.chance.toFixed(0)}% chance (${flow.factors.signHung}, ${flow.factors.timeOfDay})`;
}
