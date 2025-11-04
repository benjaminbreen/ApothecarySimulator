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

/**
 * Generate complete biography for NPC
 * @param {Object} npc - NPC entity
 * @param {number} currentYear - Current game year (default: 1680)
 * @returns {Object} Complete biography data
 */
export function generateBiography(npc, currentYear = 1680) {
  // Create seeded RNG for deterministic results
  const rng = createRNGFromNPC(npc);

  // Extract NPC data
  const ageDescriptor = npc.age || 'middle-aged';
  const casta = npc.social?.casta || npc.casta || 'mestizo';
  const socialClass = npc.social?.class || npc.class || 'common';
  const gender = npc.gender || npc.appearance?.gender || 'male';

  // Calculate numeric age and birth year
  const numericAge = typeof ageDescriptor === 'number'
    ? ageDescriptor
    : getNumericAge(ageDescriptor, rng);

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

  return {
    birthYear,
    birthplace: birthplaceString,
    birthplaceData: birthplace,
    age: numericAge,
    family,
    timeline: [], // Phase 4 will populate this
    secrets: [], // Phase 5 will populate this
    narrative: null // Phase 6 will generate prose
  };
}

/**
 * Get or generate biography for NPC (with caching)
 * @param {Object} npc - NPC entity
 * @param {number} currentYear - Current game year
 * @returns {Object} Biography data
 */
export function getBiography(npc, currentYear = 1680) {
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
