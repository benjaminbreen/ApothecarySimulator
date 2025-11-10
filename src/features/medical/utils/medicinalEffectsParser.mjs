/**
 * Medicinal Effects Parser
 * Extracts therapeutic actions from natural language descriptions
 * Maps them to symptom keywords for intelligent matching
 */

import { REFERENCE_ENTRIES } from '../../../core/data/medicalReference.js';

/**
 * Common therapeutic action patterns and their symptom keywords
 * Based on historical materia medica and modern pharmacology
 */
const THERAPEUTIC_ACTIONS = {
  // Pain relief
  'relieves pain': {
    keywords: ['pain', 'ache', 'aching', 'hurt', 'painful', 'sore', 'soreness', 'discomfort'],
    score: 20,
    category: 'analgesic'
  },
  'pain relief': {
    keywords: ['pain', 'ache', 'aching', 'hurt', 'painful', 'sore', 'soreness', 'discomfort'],
    score: 20,
    category: 'analgesic'
  },
  'analgesic': {
    keywords: ['pain', 'ache', 'aching', 'hurt', 'painful', 'sore', 'soreness', 'discomfort'],
    score: 20,
    category: 'analgesic'
  },

  // Anti-inflammatory
  'anti-inflammatory': {
    keywords: ['inflammation', 'inflamed', 'swelling', 'swollen', 'redness', 'red', 'tender', 'hot to touch'],
    score: 25,
    category: 'anti-inflammatory'
  },
  'reduces inflammation': {
    keywords: ['inflammation', 'inflamed', 'swelling', 'swollen', 'redness', 'red', 'tender'],
    score: 25,
    category: 'anti-inflammatory'
  },
  'reduces swelling': {
    keywords: ['swelling', 'swollen', 'edema', 'bloated', 'distended'],
    score: 20,
    category: 'anti-inflammatory'
  },

  // Calming/Sedative
  'calming': {
    keywords: ['anxiety', 'anxious', 'nervous', 'nervousness', 'agitation', 'agitated', 'restless', 'restlessness', 'fear', 'worry'],
    score: 15,
    category: 'sedative'
  },
  'sedative': {
    keywords: ['insomnia', 'sleeplessness', 'cannot sleep', 'difficulty sleeping', 'restless', 'agitation', 'anxiety'],
    score: 20,
    category: 'sedative'
  },
  'promotes sleep': {
    keywords: ['insomnia', 'sleeplessness', 'cannot sleep', 'difficulty sleeping', 'restless nights'],
    score: 25,
    category: 'sedative'
  },

  // Digestive
  'aids digestion': {
    keywords: ['indigestion', 'dyspepsia', 'stomach pain', 'stomach ache', 'fullness', 'bloating', 'gas', 'flatulence'],
    score: 20,
    category: 'digestive'
  },
  'digestive aid': {
    keywords: ['indigestion', 'dyspepsia', 'stomach pain', 'stomach ache', 'fullness', 'bloating'],
    score: 20,
    category: 'digestive'
  },
  'relieves nausea': {
    keywords: ['nausea', 'nauseous', 'queasiness', 'queasy', 'sick to stomach', 'vomiting', 'retching'],
    score: 25,
    category: 'digestive'
  },
  'anti-emetic': {
    keywords: ['nausea', 'vomiting', 'retching', 'sick'],
    score: 25,
    category: 'digestive'
  },

  // Respiratory
  'expectorant': {
    keywords: ['cough', 'coughing', 'phlegm', 'mucus', 'congestion', 'chest congestion', 'productive cough'],
    score: 25,
    category: 'respiratory'
  },
  'relieves cough': {
    keywords: ['cough', 'coughing', 'hacking', 'dry cough', 'persistent cough'],
    score: 20,
    category: 'respiratory'
  },
  'clears congestion': {
    keywords: ['congestion', 'congested', 'stuffy', 'blocked nose', 'nasal blockage', 'phlegm'],
    score: 20,
    category: 'respiratory'
  },

  // Fever reduction
  'reduces fever': {
    keywords: ['fever', 'feverish', 'high temperature', 'hot', 'burning up', 'chills'],
    score: 25,
    category: 'antipyretic'
  },
  'febrifuge': {
    keywords: ['fever', 'feverish', 'high temperature', 'burning', 'chills'],
    score: 25,
    category: 'antipyretic'
  },
  'cooling': {
    keywords: ['fever', 'heat', 'hot', 'burning', 'flushed', 'overheated'],
    score: 15,
    category: 'antipyretic'
  },

  // Wound healing
  'promotes healing': {
    keywords: ['wound', 'cut', 'laceration', 'abrasion', 'sore', 'ulcer', 'lesion'],
    score: 20,
    category: 'vulnerary'
  },
  'vulnerary': {
    keywords: ['wound', 'cut', 'laceration', 'injury', 'trauma', 'bruise'],
    score: 25,
    category: 'vulnerary'
  },
  'antiseptic': {
    keywords: ['wound', 'infection', 'infected', 'pus', 'suppuration', 'festering'],
    score: 25,
    category: 'vulnerary'
  },

  // Purgative/Laxative
  'purgative': {
    keywords: ['constipation', 'constipated', 'bowel obstruction', 'hard stools', 'difficulty passing stool'],
    score: 25,
    category: 'purgative'
  },
  'laxative': {
    keywords: ['constipation', 'constipated', 'hard stools', 'infrequent bowel movements'],
    score: 20,
    category: 'purgative'
  },
  'promotes evacuation': {
    keywords: ['constipation', 'obstruction', 'bowel blockage'],
    score: 20,
    category: 'purgative'
  },

  // Diuretic
  'diuretic': {
    keywords: ['edema', 'swelling', 'water retention', 'bloating', 'dropsy'],
    score: 20,
    category: 'diuretic'
  },
  'promotes urination': {
    keywords: ['urinary retention', 'difficulty urinating', 'dropsy', 'edema'],
    score: 20,
    category: 'diuretic'
  },

  // Stimulant
  'stimulant': {
    keywords: ['fatigue', 'exhaustion', 'weakness', 'lethargy', 'tired', 'drowsiness'],
    score: 15,
    category: 'stimulant'
  },
  'invigorating': {
    keywords: ['weakness', 'fatigue', 'exhaustion', 'debility', 'lethargy'],
    score: 15,
    category: 'stimulant'
  },

  // Astringent
  'astringent': {
    keywords: ['diarrhea', 'flux', 'dysentery', 'loose stools', 'bleeding', 'hemorrhage'],
    score: 20,
    category: 'astringent'
  },
  'stops bleeding': {
    keywords: ['bleeding', 'hemorrhage', 'blood loss', 'wound bleeding'],
    score: 25,
    category: 'astringent'
  }
};

/**
 * Contraindications - when a therapeutic action worsens a symptom
 * Based on humoral theory and historical medical practice
 */
const CONTRAINDICATIONS = {
  'heating': {
    worsens: ['fever', 'inflammation', 'hot', 'burning', 'redness', 'flushed'],
    reason: 'Hot medicines worsen hot conditions',
    historicalContext: 'According to Galenic theory, heat begets heat. Adding warming remedies to febrile conditions intensifies the distemper.'
  },
  'cooling': {
    worsens: ['cold', 'chills', 'shivering', 'pale', 'weakness', 'lethargy'],
    reason: 'Cold medicines worsen cold conditions',
    historicalContext: 'Cold remedies applied to cold constitutions further depress vital heat and weaken the natural faculties.'
  },
  'drying': {
    worsens: ['dry skin', 'dry cough', 'thirst', 'dehydration', 'constipation'],
    reason: 'Drying medicines worsen dryness',
    historicalContext: 'Excessive desiccation depletes vital moisture and may lead to consumption or wasting.'
  },
  'moistening': {
    worsens: ['phlegm', 'mucus', 'congestion', 'edema', 'diarrhea'],
    reason: 'Moistening medicines worsen moist conditions',
    historicalContext: 'Adding moisture to phlegmatic constitutions increases cold humors and may cause putrefaction.'
  },
  'sedative': {
    worsens: ['weakness', 'fatigue', 'drowsiness', 'lethargy', 'unconsciousness'],
    reason: 'Sedatives worsen depressed vital functions',
    historicalContext: 'Narcotic remedies depress the animal spirits. Applied to weakened patients, they may extinguish the vital flame.'
  },
  'stimulant': {
    worsens: ['anxiety', 'agitation', 'insomnia', 'fever', 'mania', 'seizure'],
    reason: 'Stimulants worsen excitable conditions',
    historicalContext: 'Exciting remedies applied to choleric constitutions may inflame the passions and bring on fits or delirium.'
  }
};

/**
 * Parse medicinal effects text into structured therapeutic actions
 * @param {string} effectsText - Natural language medicinal effects description
 * @returns {Array} Array of therapeutic action objects
 */
export function parseMedicinalEffects(effectsText) {
  if (!effectsText || typeof effectsText !== 'string') {
    return [];
  }

  const lowerText = effectsText.toLowerCase();
  const actions = [];

  // Search for each known therapeutic action
  for (const [actionName, actionData] of Object.entries(THERAPEUTIC_ACTIONS)) {
    if (lowerText.includes(actionName)) {
      actions.push({
        action: actionName,
        keywords: actionData.keywords,
        score: actionData.score,
        category: actionData.category
      });
    }
  }

  return actions;
}

/**
 * Match therapeutic actions against patient symptoms
 * @param {Array} therapeuticActions - Parsed actions from medicine
 * @param {Array} symptoms - Patient symptoms (objects or strings)
 * @returns {Object} Match results with score and explanations
 */
export function matchActionsToSymptoms(therapeuticActions, symptoms) {
  if (!Array.isArray(therapeuticActions) || !Array.isArray(symptoms)) {
    return {
      directMatches: [],
      totalScore: 0
    };
  }

  const directMatches = [];
  let totalScore = 0;

  // Convert symptoms to lowercase strings
  const symptomStrings = symptoms.map(s =>
    (typeof s === 'string' ? s : s.name || '').toLowerCase()
  );

  // Check each therapeutic action against symptoms
  for (const action of therapeuticActions) {
    for (const symptomText of symptomStrings) {
      // Check if any keyword matches this symptom
      const matchedKeywords = action.keywords.filter(keyword =>
        symptomText.includes(keyword)
      );

      if (matchedKeywords.length > 0) {
        const match = {
          symptom: symptomText,
          action: action.action,
          category: action.category,
          score: action.score,
          matchedKeywords: matchedKeywords,
          explanation: generateMatchExplanation(action.action, symptomText, action.category)
        };

        directMatches.push(match);
        totalScore += action.score;
        break; // Don't double-count same action for same symptom
      }
    }
  }

  return {
    directMatches,
    totalScore
  };
}

/**
 * Check for contraindications between medicine and symptoms
 * Uses reference data as single source of truth when available
 *
 * @param {Object} item - Medicine item with humoralQualities
 * @param {Array} symptoms - Patient symptoms
 * @param {Array} therapeuticActions - Parsed actions
 * @returns {Array} Contraindication warnings
 */
export function checkContraindications(item, symptoms, therapeuticActions) {
  const warnings = [];

  if (!item || !Array.isArray(symptoms)) {
    return warnings;
  }

  // FIRST: Check reference data for authoritative contraindications (single source of truth)
  const itemKey = item.name.toLowerCase().replace(/\s+/g, '-').replace(/['']/g, '');
  const referenceEntry = REFERENCE_ENTRIES[itemKey];

  // If reference entry has explicit contraindications, use those (authoritative!)
  if (referenceEntry?.contraindications && referenceEntry.contraindications.length > 0) {
    const symptomStrings = symptoms.map(s =>
      (typeof s === 'string' ? s : s.name || '').toLowerCase()
    );

    // Check if any symptom matches reference contraindications
    for (const contra of referenceEntry.contraindications) {
      const contraLower = contra.toLowerCase();
      const matchesSymptom = symptomStrings.some(s =>
        contraLower.includes(s) || s.includes(contraLower.split(' ')[0])
      );

      if (matchesSymptom) {
        warnings.push({
          severity: 'high',
          warning: contra,
          reason: `Historical contraindication from primary sources`,
          historicalContext: `Traditional medical texts warn: "${contra}"`,
          isFromReference: true
        });
      }
    }
  }

  // Extract humoral qualities from item
  const humoralText = (item.humoralQualities || '').toLowerCase();

  // Check humoral contraindications
  const symptomStrings = symptoms.map(s =>
    (typeof s === 'string' ? s : s.name || '').toLowerCase()
  );

  // Check heating/cooling contraindications
  if (humoralText.includes('hot') || humoralText.includes('warming') || humoralText.includes('heat')) {
    const heatingContras = CONTRAINDICATIONS['heating'];
    const worsensSymptoms = symptomStrings.filter(s =>
      heatingContras.worsens.some(contra => s.includes(contra))
    );

    if (worsensSymptoms.length > 0) {
      warnings.push({
        severity: 'high',
        affectedSymptoms: worsensSymptoms,
        reason: heatingContras.reason,
        recommendation: 'Consider a cooling remedy instead (cucumber, lettuce, endive)',
        historicalContext: heatingContras.historicalContext
      });
    }
  }

  if (humoralText.includes('cold') || humoralText.includes('cooling') || humoralText.includes('cool')) {
    const coolingContras = CONTRAINDICATIONS['cooling'];
    const worsensSymptoms = symptomStrings.filter(s =>
      coolingContras.worsens.some(contra => s.includes(contra))
    );

    if (worsensSymptoms.length > 0) {
      warnings.push({
        severity: 'high',
        affectedSymptoms: worsensSymptoms,
        reason: coolingContras.reason,
        recommendation: 'Consider a warming remedy instead (ginger, pepper, cinnamon)',
        historicalContext: coolingContras.historicalContext
      });
    }
  }

  // Check therapeutic action contraindications
  for (const action of therapeuticActions) {
    const contraindicationKey = action.category;
    const contras = CONTRAINDICATIONS[contraindicationKey];

    if (contras) {
      const worsensSymptoms = symptomStrings.filter(s =>
        contras.worsens.some(contra => s.includes(contra))
      );

      if (worsensSymptoms.length > 0) {
        warnings.push({
          severity: 'medium',
          affectedSymptoms: worsensSymptoms,
          reason: contras.reason,
          recommendation: `Avoid ${action.category} medicines for this patient`,
          historicalContext: contras.historicalContext
        });
      }
    }
  }

  return warnings;
}

/**
 * Generate human-readable explanation for a symptom-action match
 */
function generateMatchExplanation(action, symptom, category) {
  const categoryExplanations = {
    analgesic: `${capitalizeFirst(action)} directly addresses ${symptom}`,
    'anti-inflammatory': `${capitalizeFirst(action)} properties counteract ${symptom}`,
    sedative: `${capitalizeFirst(action)} effect helps manage ${symptom}`,
    digestive: `${capitalizeFirst(action)} supports digestive function, addressing ${symptom}`,
    respiratory: `${capitalizeFirst(action)} clears airways and relieves ${symptom}`,
    antipyretic: `${capitalizeFirst(action)} reduces body heat causing ${symptom}`,
    vulnerary: `${capitalizeFirst(action)} promotes tissue repair for ${symptom}`,
    purgative: `${capitalizeFirst(action)} evacuates matter causing ${symptom}`,
    diuretic: `${capitalizeFirst(action)} expels excess fluid related to ${symptom}`,
    stimulant: `${capitalizeFirst(action)} restores vital force depleted by ${symptom}`,
    astringent: `${capitalizeFirst(action)} tightens tissues and controls ${symptom}`
  };

  return categoryExplanations[category] || `${capitalizeFirst(action)} may help with ${symptom}`;
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Analyze ingredient synergies in compound medicines
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {Object} Synergy analysis with bonuses and conflicts
 */
export function analyzeIngredientSynergies(ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length < 2) {
    return {
      synergies: [],
      conflicts: [],
      totalBonus: 0
    };
  }

  const synergies = [];
  const conflicts = [];
  let totalBonus = 0;

  // Parse therapeutic actions for all ingredients
  const ingredientActions = ingredients.map(ing => ({
    name: ing.name,
    actions: parseMedicinalEffects(ing.medicinalEffects || ''),
    humoral: (ing.humoralQualities || '').toLowerCase()
  }));

  // Check for category synergies (same therapeutic category)
  const categories = {};
  ingredientActions.forEach(ing => {
    ing.actions.forEach(action => {
      if (!categories[action.category]) {
        categories[action.category] = [];
      }
      categories[action.category].push(ing.name);
    });
  });

  for (const [category, ingredientNames] of Object.entries(categories)) {
    if (ingredientNames.length >= 2) {
      synergies.push({
        ingredients: ingredientNames.slice(0, 2),
        effect: `Enhanced ${category} effect`,
        score: 10,
        explanation: `Multiple ${category} ingredients work synergistically`
      });
      totalBonus += 10;
    }
  }

  // Check for humoral conflicts (opposing qualities)
  for (let i = 0; i < ingredientActions.length; i++) {
    for (let j = i + 1; j < ingredientActions.length; j++) {
      const ing1 = ingredientActions[i];
      const ing2 = ingredientActions[j];

      // Hot + Cold conflict
      if ((ing1.humoral.includes('hot') && ing2.humoral.includes('cold')) ||
          (ing1.humoral.includes('cold') && ing2.humoral.includes('hot'))) {
        conflicts.push({
          ingredients: [ing1.name, ing2.name],
          type: 'humoral_opposition',
          severity: 'medium',
          penalty: -5,
          explanation: 'Opposing hot/cold qualities may cancel each other out'
        });
        totalBonus -= 5;
      }

      // Dry + Moist conflict
      if ((ing1.humoral.includes('dry') && ing2.humoral.includes('moist')) ||
          (ing1.humoral.includes('moist') && ing2.humoral.includes('dry'))) {
        conflicts.push({
          ingredients: [ing1.name, ing2.name],
          type: 'humoral_opposition',
          severity: 'low',
          penalty: -3,
          explanation: 'Opposing dry/moist qualities reduce potency'
        });
        totalBonus -= 3;
      }
    }
  }

  return {
    synergies,
    conflicts,
    totalBonus
  };
}
