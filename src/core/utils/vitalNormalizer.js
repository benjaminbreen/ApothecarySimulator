/**
 * Normalizes LLM-generated vital signs to canonical values
 * Handles variations like "fast"→"rapid", "burning"→"hot", etc.
 */

// Maps LLM variations to canonical values expected by UI
const VITAL_SYNONYMS = {
  pulse: {
    rapid: ['rapid', 'fast', 'quick', 'racing', 'elevated', 'high', 'accelerated', 'pounding', 'thready'],
    slow: ['slow', 'weak', 'sluggish', 'depressed', 'low', 'faint', 'feeble'],
    steady: ['steady', 'normal', 'regular', 'stable', 'moderate', 'strong', 'even']
  },
  temperature: {
    hot: ['hot', 'burning', 'feverish', 'elevated', 'high', 'warm', 'fever', 'heated'],
    cold: ['cold', 'cool', 'chilled', 'frigid', 'low', 'clammy'],
    neutral: ['neutral', 'normal', 'temperate', 'moderate', 'unremarkable']
  },
  respiration: {
    rapid: ['rapid', 'fast', 'quick', 'accelerated', 'hyperventilating', 'hurried'],
    slow: ['slow', 'shallow', 'weak', 'depressed', 'reduced'],
    labored: ['labored', 'difficult', 'strained', 'wheezing', 'gasping', 'distressed', 'rattling', 'struggling'],
    normal: ['normal', 'regular', 'steady', 'even', 'unremarkable', 'clear']
  },
  urine: {
    cloudy: ['cloudy', 'murky', 'turbid', 'opaque', 'milky'],
    dark: ['dark', 'amber', 'concentrated', 'brown', 'deep'],
    reddish: ['reddish', 'red', 'bloody', 'pink', 'blood-tinged', 'blood'],
    clear: ['clear', 'transparent', 'normal', 'pale', 'light']
  },
  tongue: {
    coated: ['coated', 'furry', 'fuzzy', 'filmed', 'covered'],
    'white-coated': ['white-coated', 'white coated', 'white', 'whitish', 'pale coating'],
    'yellow-coated': ['yellow-coated', 'yellow coated', 'yellow', 'yellowish', 'yellow film'],
    pale: ['pale', 'pallid', 'colorless', 'light'],
    red: ['red', 'reddish', 'inflamed', 'crimson', 'bright red'],
    swollen: ['swollen', 'enlarged', 'puffy', 'bloated', 'thick'],
    normal: ['normal', 'healthy', 'pink', 'unremarkable', 'clean']
  }
};

/**
 * Normalizes a vital sign value to its canonical form
 * @param {string} vitalType - Type of vital (pulse, temperature, respiration, urine, tongue)
 * @param {string|number} rawValue - Raw value from LLM
 * @returns {string|null} Canonical value or original if no match
 */
export function normalizeVital(vitalType, rawValue) {
  if (!rawValue) return null;

  const normalized = rawValue.toString().toLowerCase().trim();
  const synonyms = VITAL_SYNONYMS[vitalType];

  if (!synonyms) return rawValue; // Unknown vital type, pass through

  // Check each canonical value's synonyms
  for (const [canonical, variations] of Object.entries(synonyms)) {
    if (variations.some(v => normalized.includes(v))) {
      return canonical;
    }
  }

  return rawValue; // No match, return original
}

/**
 * Normalizes all vitals in an object
 * @param {Object} vitals - Object containing vital signs
 * @returns {Object} Normalized vitals object
 */
export function normalizeAllVitals(vitals) {
  if (!vitals) return null;

  const normalized = {};
  for (const [key, value] of Object.entries(vitals)) {
    if (VITAL_SYNONYMS[key]) {
      normalized[key] = normalizeVital(key, value);
    } else {
      normalized[key] = value; // Pass through unknown vitals
    }
  }

  return normalized;
}
