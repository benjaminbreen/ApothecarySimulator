/**
 * Humoral Matcher - Uses historical humoral theory for treatment matching
 * Based on Galenic principles: opposites cure (hot cures cold, dry cures moist)
 *
 * Uses EXISTING item data (humoralQualities, medicinalEffects) - no new data needed
 *
 * Historical Accuracy:
 * - Based on Galenic humoral theory (2nd century AD)
 * - Standard practice in 17th century medicine
 * - "Contraria contrariis curantur" - opposites cure opposites
 */

/**
 * Parse humoral qualities from item's humoralQualities string
 * Handles formats like "Warm & Dry", "Cold & Moist", "Hot & Wet"
 * @param {string} qualityString - e.g., "Warm & Dry"
 * @returns {Object|null} { temperature: string, moisture: string }
 */
function parseHumoralQualities(qualityString) {
  if (!qualityString || typeof qualityString !== 'string') {
    return null;
  }

  const lower = qualityString.toLowerCase();

  // Temperature (4 degrees: cold, cool, warm, hot)
  let temperature = null;
  if (lower.includes('hot')) temperature = 'hot';
  else if (lower.includes('warm')) temperature = 'warm';
  else if (lower.includes('cool')) temperature = 'cool';
  else if (lower.includes('cold')) temperature = 'cold';

  // Moisture (2 states: dry, moist/wet)
  let moisture = null;
  if (lower.includes('dry')) moisture = 'dry';
  else if (lower.includes('moist') || lower.includes('wet')) moisture = 'moist';

  return temperature || moisture ? { temperature, moisture } : null;
}

/**
 * Symptom to humoral imbalance mapping
 * Based on historical Galenic diagnosis
 * Each symptom indicates excess or deficiency of a humor
 */
const SYMPTOM_HUMORAL_MAP = {
  // Hot conditions (excess blood/yellow bile) - need cold remedies
  'fever': { temperature: 'hot', moisture: null, severity: 'high' },
  'inflammation': { temperature: 'hot', moisture: null, severity: 'medium' },
  'rash': { temperature: 'hot', moisture: 'dry', severity: 'medium' },
  'burning': { temperature: 'hot', moisture: 'dry', severity: 'medium' },
  'red skin': { temperature: 'hot', moisture: null, severity: 'low' },
  'hot to touch': { temperature: 'hot', moisture: null, severity: 'medium' },
  'delirium': { temperature: 'hot', moisture: 'dry', severity: 'high' },
  'thirst': { temperature: 'hot', moisture: 'dry', severity: 'medium' },

  // Cold conditions (excess phlegm/black bile) - need warm/hot remedies
  'chills': { temperature: 'cold', moisture: null, severity: 'medium' },
  'paleness': { temperature: 'cold', moisture: null, severity: 'low' },
  'lethargy': { temperature: 'cold', moisture: 'moist', severity: 'medium' },
  'cold extremities': { temperature: 'cold', moisture: null, severity: 'medium' },
  'sluggishness': { temperature: 'cold', moisture: 'moist', severity: 'low' },
  'melancholy': { temperature: 'cold', moisture: 'dry', severity: 'medium' },
  'depression': { temperature: 'cold', moisture: 'dry', severity: 'medium' },

  // Moist conditions (excess phlegm) - need dry remedies
  'cough with phlegm': { temperature: null, moisture: 'moist', severity: 'medium' },
  'productive cough': { temperature: null, moisture: 'moist', severity: 'medium' },
  'diarrhea': { temperature: null, moisture: 'moist', severity: 'high' },
  'excessive sweating': { temperature: null, moisture: 'moist', severity: 'medium' },
  'swelling': { temperature: null, moisture: 'moist', severity: 'medium' },
  'edema': { temperature: null, moisture: 'moist', severity: 'high' },
  'runny nose': { temperature: null, moisture: 'moist', severity: 'low' },

  // Dry conditions (deficiency) - need moist remedies
  'constipation': { temperature: null, moisture: 'dry', severity: 'medium' },
  'dry cough': { temperature: null, moisture: 'dry', severity: 'medium' },
  'dry skin': { temperature: null, moisture: 'dry', severity: 'low' },
  'thirsty': { temperature: 'hot', moisture: 'dry', severity: 'medium' },

  // Complex conditions with known humoral associations
  'headache': { temperature: 'hot', moisture: null, severity: 'medium' },
  'anxiety': { temperature: 'hot', moisture: 'dry', severity: 'medium' },
  'insomnia': { temperature: 'hot', moisture: 'dry', severity: 'medium' },
  'nausea': { temperature: null, moisture: 'moist', severity: 'medium' },
  'vomiting': { temperature: null, moisture: 'moist', severity: 'high' },
  'pain': { temperature: 'hot', moisture: null, severity: 'variable' },
  'wound': { temperature: 'hot', moisture: 'moist', severity: 'variable' },
  'bleeding': { temperature: 'hot', moisture: 'moist', severity: 'high' },
  'weakness': { temperature: 'cold', moisture: null, severity: 'medium' }
};

/**
 * Keywords in medicinalEffects that directly indicate treatment capabilities
 * Maps conditions to keywords that should appear in item.medicinalEffects
 */
const EFFECT_KEYWORDS = {
  'pain': ['pain', 'analgesic', 'soporific', 'anodyne', 'relieves pain'],
  'fever': ['fever', 'febrifuge', 'cooling', 'reduces fever', 'antipyretic'],
  'cough': ['cough', 'expectorant', 'respiratory', 'pectoral', 'soothes coughs'],
  'anxiety': ['anxiety', 'calming', 'sedative', 'soporific', 'nerves', 'nervous'],
  'nausea': ['nausea', 'digestive', 'stomach', 'aids digestion', 'carminative'],
  'wound': ['wound', 'healing', 'vulnerary', 'cicatrizing'],
  'bleeding': ['bleeding', 'styptic', 'astringent', 'stops bleeding', 'hemostatic'],
  'inflammation': ['inflammation', 'anti-inflammatory', 'reduces inflammation', 'soothes'],
  'constipation': ['constipation', 'laxative', 'purgative', 'cleanses bowels'],
  'diarrhea': ['diarrhea', 'astringent', 'binding', 'stops flux'],
  'insomnia': ['sleep', 'soporific', 'sedative', 'insomnia'],
  'melancholy': ['melancholy', 'depression', 'uplifting', 'cheers'],
  'digestion': ['digestion', 'digestive', 'stomach', 'carminative']
};

/**
 * Calculate how well a remedy matches patient symptoms using humoral theory
 * @param {Object} item - Medicine item with humoralQualities and medicinalEffects
 * @param {Array} symptoms - Array of symptom objects or strings
 * @returns {Object} Detailed matching analysis
 */
export function calculateHumoralMatch(item, symptoms) {
  // Validate inputs
  if (!item) {
    console.warn('[HumoralMatcher] No item provided');
    return createEmptyMatch();
  }

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    console.warn('[HumoralMatcher] No symptoms provided');
    return createEmptyMatch();
  }

  // Parse item's humoral qualities
  const itemHumors = parseHumoralQualities(item.humoralQualities);
  const itemEffects = (item.medicinalEffects || '').toLowerCase();

  if (!itemHumors && !itemEffects) {
    console.warn(`[HumoralMatcher] Item "${item.name}" has no humoral data or effects`);
    return createEmptyMatch();
  }

  // Scoring components
  let humoralScore = 0;    // 0-60 points from humoral matching
  let directScore = 0;     // 0-40 points from direct effect matching
  let matchedSymptoms = [];
  let humoralExplanations = [];
  let directMatches = [];
  let mismatches = [];

  // Process each symptom
  symptoms.forEach(symptom => {
    const symptomName = extractSymptomName(symptom);
    if (!symptomName) return;

    const symptomNameLower = symptomName.toLowerCase();

    // 1. HUMORAL MATCHING (Galenic "opposites cure")
    const humoralResult = matchHumoralOpposites(
      symptomNameLower,
      itemHumors,
      item.name
    );

    if (humoralResult.matched) {
      humoralScore += humoralResult.points;
      humoralExplanations.push(...humoralResult.explanations);
      if (!matchedSymptoms.includes(symptomName)) {
        matchedSymptoms.push(symptomName);
      }
    } else if (humoralResult.mismatch) {
      mismatches.push(humoralResult.mismatch);
    }

    // 2. DIRECT EFFECT MATCHING (from medicinalEffects text)
    const directResult = matchDirectEffects(symptomNameLower, itemEffects);

    if (directResult.matched) {
      directScore += directResult.points;
      directMatches.push(symptomName);
      if (!matchedSymptoms.includes(symptomName)) {
        matchedSymptoms.push(symptomName);
      }
    }
  });

  // Calculate total score (max 100)
  const totalScore = Math.min(100, humoralScore + directScore);

  return {
    totalScore,
    humoralScore,
    directScore,
    matchedSymptoms,
    humoralExplanations,
    directMatches,
    mismatches,
    maxPossible: symptoms.length * 30, // Each symptom worth up to 30 points
    itemHumors,
    hasHumoralData: !!itemHumors,
    hasEffectsData: !!itemEffects
  };
}

/**
 * Match humoral opposites (core Galenic principle)
 */
function matchHumoralOpposites(symptomNameLower, itemHumors, itemName) {
  const symptomHumors = SYMPTOM_HUMORAL_MAP[symptomNameLower];

  if (!symptomHumors || !itemHumors) {
    return { matched: false, points: 0, explanations: [] };
  }

  let points = 0;
  let explanations = [];
  let matched = false;
  let mismatch = null;

  // Temperature opposition
  if (symptomHumors.temperature && itemHumors.temperature) {
    if (isOppositeTemperature(symptomHumors.temperature, itemHumors.temperature)) {
      // Perfect opposition: hot symptom + cold remedy (or vice versa)
      const basePoints = 15;
      const severityMultiplier = symptomHumors.severity === 'high' ? 1.5 : 1.0;
      const earnedPoints = Math.round(basePoints * severityMultiplier);

      points += earnedPoints;
      matched = true;
      explanations.push(
        `${itemName}'s ${itemHumors.temperature} nature counters the ${symptomHumors.temperature} quality of ${symptomNameLower}`
      );
    } else if (symptomHumors.temperature === itemHumors.temperature) {
      // Mismatch: hot symptom + hot remedy makes it worse
      mismatch = `⚠️ ${itemName} is ${itemHumors.temperature}, which may worsen ${symptomNameLower} (also ${symptomHumors.temperature})`;
    }
  }

  // Moisture opposition
  if (symptomHumors.moisture && itemHumors.moisture) {
    if (isOppositeMoisture(symptomHumors.moisture, itemHumors.moisture)) {
      const basePoints = 15;
      const severityMultiplier = symptomHumors.severity === 'high' ? 1.5 : 1.0;
      const earnedPoints = Math.round(basePoints * severityMultiplier);

      points += earnedPoints;
      matched = true;
      explanations.push(
        `${itemName}'s ${itemHumors.moisture} property counters the ${symptomHumors.moisture} imbalance`
      );
    } else if (symptomHumors.moisture === itemHumors.moisture) {
      mismatch = `⚠️ ${itemName} is ${itemHumors.moisture}, which may worsen the ${symptomHumors.moisture} condition`;
    }
  }

  return { matched, points, explanations, mismatch };
}

/**
 * Check if temperatures are opposite (for Galenic theory)
 */
function isOppositeTemperature(temp1, temp2) {
  const hotTemps = ['hot', 'warm'];
  const coldTemps = ['cold', 'cool'];

  return (hotTemps.includes(temp1) && coldTemps.includes(temp2)) ||
         (coldTemps.includes(temp1) && hotTemps.includes(temp2));
}

/**
 * Check if moistures are opposite
 */
function isOppositeMoisture(moist1, moist2) {
  return (moist1 === 'dry' && moist2 === 'moist') ||
         (moist1 === 'moist' && moist2 === 'dry');
}

/**
 * Match direct effects from medicinalEffects text
 */
function matchDirectEffects(symptomNameLower, itemEffects) {
  if (!itemEffects) {
    return { matched: false, points: 0 };
  }

  // Find base symptom (e.g., "cough with phlegm" -> "cough")
  const baseSymptom = Object.keys(EFFECT_KEYWORDS).find(key =>
    symptomNameLower.includes(key)
  );

  if (!baseSymptom) {
    // Try exact match
    const hasMatch = itemEffects.includes(symptomNameLower);
    return {
      matched: hasMatch,
      points: hasMatch ? 20 : 0
    };
  }

  // Check if item effects contain any of the keywords for this symptom
  const keywords = EFFECT_KEYWORDS[baseSymptom];
  const hasMatch = keywords.some(kw => itemEffects.includes(kw));

  return {
    matched: hasMatch,
    points: hasMatch ? 20 : 0
  };
}

/**
 * Extract symptom name from symptom object or string
 */
function extractSymptomName(symptom) {
  if (typeof symptom === 'string') {
    return symptom;
  }
  if (symptom && typeof symptom === 'object') {
    return symptom.name || symptom.symptom || null;
  }
  return null;
}

/**
 * Create empty match result
 */
function createEmptyMatch() {
  return {
    totalScore: 0,
    humoralScore: 0,
    directScore: 0,
    matchedSymptoms: [],
    humoralExplanations: [],
    directMatches: [],
    mismatches: [],
    maxPossible: 0,
    itemHumors: null,
    hasHumoralData: false,
    hasEffectsData: false
  };
}

/**
 * Export for testing
 */
export const _testExports = {
  parseHumoralQualities,
  SYMPTOM_HUMORAL_MAP,
  EFFECT_KEYWORDS,
  matchHumoralOpposites,
  matchDirectEffects,
  isOppositeTemperature,
  isOppositeMoisture
};
