/**
 * Age Utilities
 *
 * Helper functions for mapping age descriptors to numeric values
 * and calculating birth years.
 *
 * @module ageUtils
 */

/**
 * Age range mappings for different life stages
 */
export const AGE_RANGES = {
  child: { min: 8, max: 17, midpoint: 12 },
  young: { min: 18, max: 30, midpoint: 24 },
  'middle-aged': { min: 35, max: 55, midpoint: 45 },
  elderly: { min: 60, max: 80, midpoint: 70 },
  ancient: { min: 80, max: 95, midpoint: 85 }
};

/**
 * Normalize age descriptor to standard format
 * @param {string} ageStr - Age descriptor from LLM
 * @returns {string} Normalized age descriptor
 */
export function normalizeAgeDescriptor(ageStr) {
  if (!ageStr) return 'middle-aged';

  const normalized = ageStr.toLowerCase().trim();

  // Handle variations
  if (normalized.includes('youth') || normalized.includes('teenager')) return 'young';
  if (normalized.includes('middle') || normalized.includes('adult')) return 'middle-aged';
  if (normalized.includes('old') || normalized.includes('elder')) return 'elderly';
  if (normalized.includes('child') || normalized.includes('young boy') || normalized.includes('young girl')) return 'child';

  // Check if matches known keys
  if (AGE_RANGES[normalized]) return normalized;

  // Default
  return 'middle-aged';
}

/**
 * Get numeric age from descriptor using seeded RNG
 * @param {string} ageDescriptor - Age descriptor ('young', 'middle-aged', etc.)
 * @param {Object} rng - Seeded RNG instance
 * @returns {number} Numeric age
 */
export function getNumericAge(ageDescriptor, rng) {
  const normalized = normalizeAgeDescriptor(ageDescriptor);
  const range = AGE_RANGES[normalized];

  if (!range) {
    console.warn(`[AgeUtils] Unknown age descriptor: ${ageDescriptor}, using middle-aged`);
    return AGE_RANGES['middle-aged'].midpoint;
  }

  // Use RNG to pick age within range
  return rng.nextInt(range.min, range.max);
}

/**
 * Calculate birth year from age and current year
 * @param {number} age - Numeric age
 * @param {number} currentYear - Current year (default: 1680)
 * @returns {number} Birth year
 */
export function calculateBirthYear(age, currentYear = 1680) {
  return currentYear - age;
}

/**
 * Get age descriptor from numeric age
 * @param {number} age - Numeric age
 * @returns {string} Age descriptor
 */
export function getAgeDescriptor(age) {
  if (age < 18) return 'child';
  if (age < 35) return 'young';
  if (age < 60) return 'middle-aged';
  if (age < 80) return 'elderly';
  return 'ancient';
}

/**
 * Calculate age from birth year and current year
 * @param {number} birthYear - Birth year
 * @param {number} currentYear - Current year (default: 1680)
 * @returns {number} Current age
 */
export function calculateAge(birthYear, currentYear = 1680) {
  return currentYear - birthYear;
}

/**
 * Check if age makes sense for occupation/role
 * @param {number} age - Numeric age
 * @param {string} occupation - Occupation string
 * @returns {boolean} Whether age is plausible
 */
export function isAgePlausible(age, occupation) {
  const occLower = occupation.toLowerCase();

  // Clergy should be at least 25 (ordained)
  if (occLower.includes('priest') || occLower.includes('padre')) {
    return age >= 25;
  }

  // High officials should be at least 35
  if (occLower.includes('viceroy') || occLower.includes('bishop') || occLower.includes('alcalde')) {
    return age >= 35;
  }

  // Artisan masters should be at least 25 (journeyman ’ master)
  if (occLower.includes('master')) {
    return age >= 25;
  }

  // Most occupations plausible at 18+
  return age >= 18;
}

export default {
  AGE_RANGES,
  normalizeAgeDescriptor,
  getNumericAge,
  calculateBirthYear,
  getAgeDescriptor,
  calculateAge,
  isAgePlausible
};
