/**
 * Prescription Calculator - Deterministic outcome calculation
 * Combines humoral matching, skill checks, route appropriateness, and dosage
 *
 * This creates a learnable system where:
 * - Players can predict outcomes
 * - Skill progression matters
 * - Historical medical theory is respected
 * - LLM narrates but doesn't decide
 */

import { calculateHumoralMatch } from './humoralMatcher.mjs';

// Temporary mock for standalone testing - will use real skillCheckSystem when integrated
const DIFFICULTY = {
  TRIVIAL: 5,
  EASY: 10,
  MODERATE: 15,
  HARD: 20,
  VERY_HARD: 25,
  HEROIC: 30
};

function performSkillCheck(skillId, playerSkills, dc) {
  // Mock implementation for testing
  const skillLevel = playerSkills?.knownSkills?.[skillId]?.level || 0;
  const skillBonus = skillLevel * 2;
  const roll = Math.floor(Math.random() * 20) + 1;
  const total = roll + skillBonus;
  const success = total >= dc;

  return {
    success,
    roll,
    skillBonus,
    total,
    dc,
    skillLevel,
    message: success ? 'Success' : 'Failure'
  };
}

/**
 * Route appropriateness for different symptom types
 * Based on historical medical practice
 */
const ROUTE_EFFECTIVENESS = {
  oral: {
    good: ['internal', 'systemic', 'digestive', 'pain', 'fever', 'anxiety', 'insomnia', 'melancholy'],
    bad: ['nausea', 'vomiting', 'difficulty swallowing'],
    modifier: { good: 10, neutral: 0, bad: -15 }
  },
  topical: {
    good: ['wound', 'rash', 'skin', 'burn', 'inflammation', 'swelling', 'bruise', 'ulcer'],
    bad: ['internal', 'systemic', 'fever'],
    modifier: { good: 20, neutral: 5, bad: -10 }
  },
  inhaled: {
    good: ['respiratory', 'cough', 'congestion', 'asthma', 'lung'],
    bad: ['digestive', 'wound', 'external'],
    modifier: { good: 15, neutral: 0, bad: -10 },
    toxicSubstances: ['quicksilver', 'mercury'] // These are FATAL when inhaled
  },
  enema: {
    good: ['constipation', 'digestive', 'bowel', 'purging', 'flux'],
    bad: ['respiratory', 'wound', 'fever'],
    modifier: { good: 15, neutral: 5, bad: -5 }
  }
};

/**
 * Toxic substances that require special handling
 * Based on historical toxicology and modern knowledge
 */
const TOXIC_SUBSTANCES = {
  'quicksilver': {
    fatalRoutes: ['inhaled'],
    dangerousRoutes: ['oral'],
    safeDose: 0, // Mercury is never safe internally
    warning: 'Mercury vapor is fatal; internal use causes severe poisoning'
  },
  'mercury': {
    fatalRoutes: ['inhaled'],
    dangerousRoutes: ['oral'],
    safeDose: 0,
    warning: 'Highly toxic heavy metal'
  },
  'opium': {
    fatalRoutes: [],
    dangerousRoutes: ['oral'],
    safeDose: 2, // More than 2 drachms is dangerous
    warning: 'Powerful narcotic; overdose causes respiratory failure'
  },
  'crocus metallorum': {
    fatalRoutes: [],
    dangerousRoutes: ['oral'],
    safeDose: 1, // Antimony-based, very toxic
    warning: 'Powerful purgative; excessive dose causes violent vomiting'
  }
};

/**
 * Calculate prescription outcome using deterministic mechanics
 * @param {Object} params - Prescription parameters
 * @param {Object} params.item - Medicine item
 * @param {Object} params.patient - Patient with symptoms
 * @param {string} params.route - Route of administration
 * @param {number} params.amount - Dosage in drachms
 * @param {Object} params.playerSkills - Player's skills object
 * @returns {Object} Complete outcome with mechanics breakdown
 */
export function calculatePrescriptionOutcome(params) {
  const { item, patient, route, amount, playerSkills } = params;

  // Comprehensive input validation
  if (!item || typeof item !== 'object') {
    console.error('[PrescriptionCalculator] Invalid or missing item');
    return createFailureOutcome('Invalid medicine item');
  }

  if (!patient || typeof patient !== 'object') {
    console.error('[PrescriptionCalculator] Invalid or missing patient');
    return createFailureOutcome('Invalid patient data');
  }

  if (!route || typeof route !== 'string' || route.trim().length === 0) {
    console.error('[PrescriptionCalculator] Invalid route of administration');
    return createFailureOutcome('Route of administration is required');
  }

  if (typeof amount !== 'number' || amount <= 0 || isNaN(amount) || !isFinite(amount)) {
    console.error('[PrescriptionCalculator] Invalid dosage amount:', amount);
    return createFailureOutcome('Dosage must be a positive number');
  }

  // Extract symptoms from patient (handle different data structures)
  const symptoms = patient.symptoms || patient.medical?.symptoms || [];

  if (!Array.isArray(symptoms)) {
    console.error('[PrescriptionCalculator] Patient symptoms must be an array');
    return createFailureOutcome('Invalid symptom data');
  }

  if (symptoms.length === 0) {
    console.warn('[PrescriptionCalculator] Patient has no symptoms to treat');
    return createFailureOutcome('Patient has no symptoms to treat');
  }

  // CRITICAL: Check for fatal toxicity FIRST to avoid wasting CPU
  // (e.g., inhaled mercury vapor = instant death, no need to calculate anything else)
  const toxicityCheck = checkToxicity(item.name, route, amount);
  if (toxicityCheck.fatal) {
    // Return immediately with minimal breakdown (patient dies before treatment effects matter)
    return createDeathOutcome(toxicityCheck.reason, {
      humoralScore: 0,
      humoralExplanations: [],
      directMatches: [],
      mismatches: [],
      routeBonus: 0,
      routeExplanation: 'Fatal toxicity prevented treatment',
      dosageModifier: 0,
      dosageWarning: toxicityCheck.reason,
      skillCheck: null,
      toxicityWarning: `💀 FATAL: ${toxicityCheck.reason}`
    });
  }

  // Initialize scoring components
  let totalEffectiveness = 0;
  const breakdown = {
    humoralScore: 0,
    humoralExplanations: [],
    directMatches: [],
    mismatches: [],
    routeBonus: 0,
    routeExplanation: '',
    dosageModifier: 0,
    dosageWarning: null,
    skillCheck: null,
    toxicityWarning: toxicityCheck.warning || null
  };

  // 1. HUMORAL MATCHING (0-100 points from symptoms)
  const humoralMatch = calculateHumoralMatch(item, symptoms);
  breakdown.humoralScore = humoralMatch.totalScore;
  breakdown.humoralExplanations = humoralMatch.humoralExplanations;
  breakdown.directMatches = humoralMatch.directMatches;
  breakdown.mismatches = humoralMatch.mismatches;

  totalEffectiveness += humoralMatch.totalScore;

  // 2. ROUTE APPROPRIATENESS (0-20 points, or negative if inappropriate)
  const routeResult = calculateRouteBonus(route, symptoms, item.name);
  breakdown.routeBonus = routeResult.bonus;
  breakdown.routeExplanation = routeResult.explanation;

  totalEffectiveness += routeResult.bonus;

  // 3. DOSAGE APPROPRIATENESS (0 to -30 points for overdose)
  const dosageResult = calculateDosageModifier(item.name, amount);
  breakdown.dosageModifier = dosageResult.modifier;
  breakdown.dosageWarning = dosageResult.warning;

  totalEffectiveness += dosageResult.modifier;

  // 4. SKILL CHECK (variable based on herbalism skill)
  // Only perform skill check if playerSkills provided
  if (playerSkills) {
    const skillCheck = performSkillCheck('herbalism', playerSkills, DIFFICULTY.MODERATE);
    breakdown.skillCheck = {
      roll: skillCheck.roll,
      bonus: skillCheck.skillBonus,
      total: skillCheck.total,
      success: skillCheck.success,
      message: skillCheck.message
    };

    totalEffectiveness += skillCheck.total;
  } else {
    // No skill check - use neutral value
    breakdown.skillCheck = {
      roll: 10,
      bonus: 0,
      total: 10,
      success: true,
      message: 'No skill data available'
    };
    totalEffectiveness += 10;
  }

  // 6. CLAMP EFFECTIVENESS TO 0-100 RANGE
  const effectiveness = Math.max(0, Math.min(100, totalEffectiveness));

  // 7. DETERMINE OUTCOME CATEGORY
  const outcome = determineOutcomeCategory(effectiveness, toxicityCheck.hasToxicityRisk);

  return {
    outcome,
    effectiveness,
    breakdown,
    matchedSymptoms: humoralMatch.matchedSymptoms,
    itemName: item.name,
    patientName: patient.name
  };
}

/**
 * Calculate route appropriateness bonus
 */
function calculateRouteBonus(route, symptoms, itemName) {
  if (!route) {
    return { bonus: 0, explanation: 'No route specified' };
  }

  const routeLower = route.toLowerCase();
  const routeData = ROUTE_EFFECTIVENESS[routeLower];

  if (!routeData) {
    return { bonus: 0, explanation: `Unknown route: ${route}` };
  }

  // Check for toxic substances with fatal routes
  if (routeData.toxicSubstances) {
    const itemLower = itemName.toLowerCase();
    const isToxic = routeData.toxicSubstances.some(toxin =>
      itemLower.includes(toxin)
    );

    if (isToxic && routeLower === 'inhaled') {
      return {
        bonus: -100, // Ensures death
        explanation: `FATAL: ${itemName} vapor is deadly when inhaled`
      };
    }
  }

  // Check symptom types
  const symptomNames = symptoms.map(s =>
    (typeof s === 'string' ? s : s.name || '').toLowerCase()
  );

  const hasGoodMatch = symptomNames.some(name =>
    routeData.good.some(goodType => name.includes(goodType))
  );

  const hasBadMatch = symptomNames.some(name =>
    routeData.bad.some(badType => name.includes(badType))
  );

  if (hasGoodMatch) {
    return {
      bonus: routeData.modifier.good,
      explanation: `${route} route is well-suited for these symptoms`
    };
  } else if (hasBadMatch) {
    return {
      bonus: routeData.modifier.bad,
      explanation: `${route} route is poorly suited for these symptoms`
    };
  } else {
    return {
      bonus: routeData.modifier.neutral,
      explanation: `${route} route is acceptable for these symptoms`
    };
  }
}

/**
 * Calculate dosage modifier
 */
function calculateDosageModifier(itemName, amount) {
  const itemLower = itemName.toLowerCase();

  // Check if this is a known toxic substance
  for (const [toxinName, toxinData] of Object.entries(TOXIC_SUBSTANCES)) {
    if (itemLower.includes(toxinName)) {
      if (amount > toxinData.safeDose && toxinData.safeDose > 0) {
        const excessAmount = amount - toxinData.safeDose;
        return {
          modifier: -15 * excessAmount,
          warning: `⚠️ Overdose: ${itemName} is toxic above ${toxinData.safeDose} drachm(s). ${toxinData.warning}`
        };
      } else if (toxinData.safeDose === 0 && amount > 0) {
        return {
          modifier: -30,
          warning: `⚠️ DANGEROUS: ${toxinData.warning}`
        };
      }
    }
  }

  // General overdose rule: more than 3 drachms is excessive for most substances
  if (amount > 3) {
    return {
      modifier: -10 * (amount - 3),
      warning: `Excessive dosage: ${amount} drachms may be too much`
    };
  }

  // Optimal dosage (1-3 drachms)
  return {
    modifier: 0,
    warning: null
  };
}

/**
 * Check for fatal toxicity
 */
function checkToxicity(itemName, route, amount) {
  const itemLower = itemName.toLowerCase();
  const routeLower = (route || '').toLowerCase();

  for (const [toxinName, toxinData] of Object.entries(TOXIC_SUBSTANCES)) {
    if (itemLower.includes(toxinName)) {
      // Check for fatal routes
      if (toxinData.fatalRoutes.includes(routeLower)) {
        return {
          fatal: true,
          reason: `${itemName} administered via ${route} route - ${toxinData.warning}`,
          hasToxicityRisk: true
        };
      }

      // Check for dangerous routes with excessive dose
      if (toxinData.dangerousRoutes.includes(routeLower) && amount > toxinData.safeDose * 2) {
        return {
          fatal: true,
          reason: `Severe ${itemName} overdose (${amount} drachms) - ${toxinData.warning}`,
          hasToxicityRisk: true
        };
      }

      // Non-fatal but risky
      if (toxinData.dangerousRoutes.includes(routeLower)) {
        return {
          fatal: false,
          warning: `${itemName} carries toxicity risk`,
          hasToxicityRisk: true
        };
      }
    }
  }

  return {
    fatal: false,
    warning: null,
    hasToxicityRisk: false
  };
}

/**
 * Determine outcome category from effectiveness score
 */
function determineOutcomeCategory(effectiveness, hasToxicityRisk) {
  // If toxic substance and very low effectiveness, it's a complication
  if (hasToxicityRisk && effectiveness < 30) {
    return 'complication';
  }

  // Standard thresholds
  if (effectiveness >= 75) return 'success';
  if (effectiveness >= 50) return 'partial';
  if (effectiveness >= 25) return 'minimal';
  if (effectiveness >= 10) return 'failure';
  return 'complication';
}

/**
 * Create failure outcome
 */
function createFailureOutcome(reason) {
  return {
    outcome: 'failure',
    effectiveness: 0,
    breakdown: {
      humoralScore: 0,
      humoralExplanations: [],
      directMatches: [],
      mismatches: [`Error: ${reason}`],
      routeBonus: 0,
      routeExplanation: '',
      dosageModifier: 0,
      dosageWarning: null,
      skillCheck: null,
      toxicityWarning: null
    },
    matchedSymptoms: [],
    itemName: 'Unknown',
    patientName: 'Unknown'
  };
}

/**
 * Create death outcome
 */
function createDeathOutcome(reason, breakdown) {
  return {
    outcome: 'death',
    effectiveness: 0,
    breakdown: {
      ...breakdown,
      toxicityWarning: `💀 FATAL: ${reason}`
    },
    matchedSymptoms: [],
    fatal: true,
    fatalReason: reason
  };
}

/**
 * Export outcome categories for external use
 */
export const OUTCOME_CATEGORIES = {
  SUCCESS: 'success',        // 75-100%
  PARTIAL: 'partial',        // 50-74%
  MINIMAL: 'minimal',        // 25-49%
  FAILURE: 'failure',        // 10-24%
  COMPLICATION: 'complication', // 0-9%
  DEATH: 'death'            // Fatal toxicity
};

/**
 * Get outcome description
 */
export function getOutcomeDescription(outcome) {
  const descriptions = {
    success: 'Treatment was highly effective',
    partial: 'Treatment showed moderate improvement',
    minimal: 'Treatment had limited effect',
    failure: 'Treatment was ineffective',
    complication: 'Treatment caused complications',
    death: 'Treatment was fatal'
  };

  return descriptions[outcome] || 'Unknown outcome';
}

/**
 * Export for testing
 */
export const _testExports = {
  calculateRouteBonus,
  calculateDosageModifier,
  checkToxicity,
  determineOutcomeCategory,
  ROUTE_EFFECTIVENESS,
  TOXIC_SUBSTANCES
};
