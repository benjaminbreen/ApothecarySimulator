/**
 * Biography Generator
 *
 * Main entry point for procedural biography generation.
 * Ties together family, birthplace, and age systems.
 *
 * @module biographyGenerator
 */

import { createRNGFromNPC } from '../../../utils/seededRandom';
import { getNumericAge, calculateBirthYear } from '../../../utils/ageUtils';
import { getBirthplace } from '../../config/birthplaces.config';
import { generateFamily } from './familyGenerator';
import { generateTimeline } from './timelineGenerator';

/**
 * Generate complete biography for NPC
 * @param {Object} npc - NPC entity
 * @param {number} currentYear - Current game year (default: 1680)
 * @returns {Object|null} Complete biography data or null if invalid input
 */
export function generateBiography(npc, currentYear = 1680) {
  // Input validation
  if (!npc) {
    console.warn('[BiographyGenerator] Invalid NPC data: null or undefined');
    return null;
  }

  if (!npc.name || typeof npc.name !== 'string') {
    console.warn('[BiographyGenerator] NPC missing valid name:', npc);
    return null;
  }

  // Validate current year
  if (typeof currentYear !== 'number' || currentYear < 1500 || currentYear > 2000) {
    console.warn('[BiographyGenerator] Invalid current year:', currentYear);
    currentYear = 1680; // Use default
  }

  // Create seeded RNG for deterministic results
  const rng = createRNGFromNPC(npc);

  // Extract NPC data
  const ageDescriptor = npc.age || 'middle-aged';
  const casta = npc.social?.casta || npc.casta || 'mestizo';
  const socialClass = npc.social?.class || npc.class || 'common';
  const gender = npc.gender || npc.appearance?.gender || 'male';

  // Calculate numeric age and birth year
  let numericAge;
  if (typeof ageDescriptor === 'number') {
    // Validate numeric age
    if (ageDescriptor < 0 || ageDescriptor > 100) {
      console.warn('[BiographyGenerator] Invalid numeric age:', ageDescriptor, '- using default');
      numericAge = 45; // Default to middle-aged
    } else {
      numericAge = ageDescriptor;
    }
  } else {
    numericAge = getNumericAge(ageDescriptor, rng);
  }

  const birthYear = calculateBirthYear(numericAge, currentYear);

  // Generate birthplace
  const birthplace = getBirthplace(casta, socialClass, rng);

  // Generate family
  const family = generateFamily({ ...npc, age: numericAge }, rng);

  // Format birthplace string
  let birthplaceString;
  if (birthplace.arrivedFrom === 'Spain') {
    birthplaceString = `${birthplace.city}, ${birthplace.region}, Spain (arrived in New Spain ${birthplace.yearsInNewSpain} years ago)`;
  } else if (birthplace.altepetl) {
    birthplaceString = birthplace.neighborhood
      ? `${birthplace.neighborhood}, ${birthplace.altepetl}`
      : birthplace.altepetl;
  } else {
    birthplaceString = birthplace.neighborhood
      ? `${birthplace.neighborhood}, ${birthplace.city}`
      : birthplace.city;
  }

  // Create biography object (needed for timeline generation)
  const biography = {
    birthYear,
    birthplace: birthplaceString,
    birthplaceData: birthplace,
    age: numericAge,
    family
  };

  // Generate life event timeline
  const timeline = generateTimeline(biography, npc, rng, currentYear);

  return {
    ...biography,
    timeline,
    secrets: [], // Phase 5 will populate this
    narrative: null // Phase 6 will generate prose
  };
}

/**
 * Get or generate biography for NPC (with caching)
 * @param {Object} npc - NPC entity
 * @param {number} currentYear - Current game year
 * @returns {Object|null} Biography data or null if invalid input
 */
export function getBiography(npc, currentYear = 1680) {
  // Validate input
  if (!npc) {
    console.warn('[BiographyGenerator] Cannot get biography for null/undefined NPC');
    return null;
  }

  // Check if NPC already has biography
  if (npc.biography && npc.biography.birthYear) {
    return npc.biography;
  }

  // Generate new biography
  return generateBiography(npc, currentYear);
}

export default {
  generateBiography,
  getBiography
};
