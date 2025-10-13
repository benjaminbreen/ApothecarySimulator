/**
 * Combat Wound System
 *
 * Realistic, unforgiving wound mechanics.
 * Wounds have specific effects, require treatment, and can be lethal.
 *
 * @module woundSystem
 */

/**
 * Create a wound
 * @param {Object} params - Wound parameters
 * @returns {Object} Wound object
 */
export function createWound(params) {
  const {
    woundType,      // laceration, fracture, puncture, burn, infection
    severity,       // minor, moderate, severe, critical
    location,       // body part
    causeDescription = ''
  } = params;

  const wound = {
    woundType,
    severity,
    location,
    causeDescription,

    // Effects
    effects: generateWoundEffects(woundType, severity, location),

    // Treatment
    treatment: {
      required: getRequiredTreatments(woundType, severity),
      optional: getOptionalTreatments(woundType),
      healTime: calculateHealTime(severity),
      treatedBy: null,
      treatedDate: null,
      medicinesUsed: []
    },

    // Consequences
    consequences: {
      scarring: severity !== 'minor',
      permanentDamage: severity === 'critical',
      deathRisk: calculateDeathRisk(woundType, severity, location)
    },

    // Timestamp
    dateReceived: new Date().toISOString().split('T')[0],
    turnReceived: 0, // Set externally

    // Description
    description: generateWoundDescription(woundType, severity, location)
  };

  return wound;
}

/**
 * Generate wound effects
 */
function generateWoundEffects(woundType, severity, location) {
  const effects = {
    bleeding: { active: false, rate: 'slow', bloodLoss: 0 },
    pain: { level: 0, type: 'dull', debuff: '' },
    mobility: { affected: false, reduction: 0, bodyPart: location },
    infection: { risk: 0, onset: 72, currentStatus: 'none' }
  };

  // Bleeding
  if (woundType === 'laceration' || woundType === 'puncture') {
    effects.bleeding.active = true;

    const bleedingRates = {
      minor: { rate: 'slow', bloodLoss: 5 },
      moderate: { rate: 'moderate', bloodLoss: 15 },
      severe: { rate: 'severe', bloodLoss: 30 },
      critical: { rate: 'arterial', bloodLoss: 50 }
    };

    effects.bleeding = { ...effects.bleeding, ...bleedingRates[severity] };
  }

  // Pain
  const painLevels = {
    minor: 20,
    moderate: 50,
    severe: 75,
    critical: 95
  };

  effects.pain.level = painLevels[severity];
  effects.pain.type = woundType === 'burn' ? 'burning' :
                      woundType === 'fracture' ? 'throbbing' :
                      'sharp';

  if (severity !== 'minor') {
    effects.pain.debuff = 'reduced effectiveness in combat/skills';
  }

  // Mobility
  const limbLocations = ['arm', 'leg', 'hand', 'foot', 'shoulder', 'hip'];
  if (limbLocations.some(limb => location.includes(limb))) {
    effects.mobility.affected = true;

    const mobilityReduction = {
      minor: 10,
      moderate: 30,
      severe: 60,
      critical: 90
    };

    effects.mobility.reduction = mobilityReduction[severity];
  }

  // Infection risk
  const infectionRisks = {
    minor: 10,
    moderate: 30,
    severe: 60,
    critical: 80
  };

  effects.infection.risk = infectionRisks[severity];

  // Dirty wounds have higher infection risk
  if (woundType === 'puncture') {
    effects.infection.risk += 20;
  }

  return effects;
}

/**
 * Get required treatments
 */
function getRequiredTreatments(woundType, severity) {
  const treatments = [];

  if (woundType === 'laceration' || woundType === 'puncture') {
    treatments.push('cleaning');
    treatments.push('bandaging');

    if (severity === 'severe' || severity === 'critical') {
      treatments.push('suturing');
    }
  }

  if (woundType === 'fracture') {
    treatments.push('splinting');
    treatments.push('immobilization');
  }

  if (woundType === 'burn') {
    treatments.push('cooling');
    treatments.push('salve application');
  }

  treatments.push('rest');

  return treatments;
}

/**
 * Get optional treatments
 */
function getOptionalTreatments(woundType) {
  const treatments = [];

  if (woundType === 'laceration' || woundType === 'puncture') {
    treatments.push('poultice');
    treatments.push('cauterization');
    treatments.push('medicinal wash');
  }

  if (woundType === 'burn') {
    treatments.push('honey dressing');
    treatments.push('herbal salve');
  }

  return treatments;
}

/**
 * Calculate heal time
 */
function calculateHealTime(severity) {
  const healTimes = {
    minor: { untreated: 7, treated: 3, withMedicine: 2 },
    moderate: { untreated: 14, treated: 7, withMedicine: 5 },
    severe: { untreated: 30, treated: 14, withMedicine: 10 },
    critical: { untreated: 60, treated: 30, withMedicine: 21 }
  };

  return healTimes[severity];
}

/**
 * Calculate death risk
 */
function calculateDeathRisk(woundType, severity, location) {
  let risk = 0;

  const severityRisks = {
    minor: 1,
    moderate: 5,
    severe: 20,
    critical: 50
  };

  risk = severityRisks[severity];

  // Location modifiers
  if (location.includes('head') || location.includes('neck')) {
    risk *= 2;
  }

  if (location.includes('chest') || location.includes('abdomen')) {
    risk *= 1.5;
  }

  // Wound type modifiers
  if (woundType === 'puncture' && (location.includes('chest') || location.includes('abdomen'))) {
    risk *= 1.5; // Internal damage
  }

  return Math.min(100, Math.round(risk));
}

/**
 * Generate wound description
 */
function generateWoundDescription(woundType, severity, location) {
  const descriptions = {
    laceration: {
      minor: `A shallow cut on the ${location}`,
      moderate: `A jagged laceration across the ${location}`,
      severe: `A deep, gaping wound on the ${location}, bleeding profusely`,
      critical: `A massive laceration to the ${location}, life-threatening`
    },
    fracture: {
      minor: `A hairline fracture in the ${location}`,
      moderate: `A broken bone in the ${location}`,
      severe: `A compound fracture of the ${location}, bone protruding`,
      critical: `A shattered ${location}, multiple bone fragments`
    },
    puncture: {
      minor: `A small puncture wound on the ${location}`,
      moderate: `A deep puncture to the ${location}`,
      severe: `A penetrating wound through the ${location}`,
      critical: `A grievous puncture to the ${location}, possibly piercing vital organs`
    },
    burn: {
      minor: `First-degree burn on the ${location}`,
      moderate: `Second-degree burn on the ${location}, blistering`,
      severe: `Third-degree burn on the ${location}, flesh charred`,
      critical: `Catastrophic burns covering the ${location}`
    },
    infection: {
      minor: `Minor infection in the ${location}`,
      moderate: `Spreading infection in the ${location}`,
      severe: `Severe infection in the ${location}, fever and inflammation`,
      critical: `Life-threatening sepsis originating from the ${location}`
    }
  };

  return descriptions[woundType]?.[severity] || `${severity} ${woundType} to ${location}`;
}

/**
 * Apply treatment to wound
 * @param {Object} wound - Wound object
 * @param {string} treatment - Treatment type
 * @param {string} treatedBy - Entity ID of healer
 * @param {Array} medicines - Medicines used
 * @returns {Object} Updated wound
 */
export function treatWound(wound, treatment, treatedBy, medicines = []) {
  const updated = { ...wound };

  updated.treatment = {
    ...updated.treatment,
    treatedBy,
    treatedDate: new Date().toISOString().split('T')[0],
    medicinesUsed: [...updated.treatment.medicinesUsed, ...medicines]
  };

  // Stop bleeding if bandaged
  if (treatment === 'bandaging' && updated.effects.bleeding.active) {
    updated.effects.bleeding.active = false;
    updated.effects.bleeding.rate = 'stopped';
  }

  // Reduce infection risk if cleaned/medicated
  if (treatment === 'cleaning' || medicines.length > 0) {
    updated.effects.infection.risk = Math.max(0, updated.effects.infection.risk - 20);
  }

  // Reduce pain if treated with medicine
  if (medicines.length > 0) {
    updated.effects.pain.level = Math.max(10, updated.effects.pain.level - 20);
  }

  return updated;
}

/**
 * Progress wound over time
 * @param {Object} wound - Wound object
 * @param {number} daysPassed - Days since wound received
 * @returns {Object} Updated wound
 */
export function progressWound(wound, daysPassed) {
  const updated = { ...wound };

  // Check for infection
  if (daysPassed >= (updated.effects.infection.onset / 24)) {
    if (Math.random() * 100 < updated.effects.infection.risk) {
      updated.effects.infection.currentStatus = updated.severity === 'critical' ? 'severe' :
                                                 updated.severity === 'severe' ? 'moderate' :
                                                 'mild';
      updated.effects.pain.level = Math.min(100, updated.effects.pain.level + 20);
    }
  }

  // Natural healing (if treated)
  if (updated.treatment.treatedBy) {
    const healTime = updated.treatment.medicinesUsed.length > 0 ?
                     updated.treatment.healTime.withMedicine :
                     updated.treatment.healTime.treated;

    if (daysPassed >= healTime) {
      // Wound healed
      updated.effects.pain.level = Math.max(0, updated.effects.pain.level - 50);
      updated.effects.mobility.reduction = Math.max(0, updated.effects.mobility.reduction - 50);
    }
  }

  return updated;
}

export default {
  createWound,
  treatWound,
  progressWound
};
