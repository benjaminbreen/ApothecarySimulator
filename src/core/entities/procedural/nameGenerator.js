/**
 * Name Generator - Procedural historical name generation
 *
 * Generates historically accurate names for NPCs based on:
 * - Gender
 * - Casta (racial/ethnic category)
 * - Occupation/social class
 *
 * Uses period-accurate name data from historicalData.js
 *
 * @module nameGenerator
 */

import { MexicoCity1680, random } from './historicalData';

/**
 * Generate a full historical name
 * @param {Object} options - Name generation options
 * @param {string} [options.gender='male'] - 'male' or 'female'
 * @param {string} [options.casta='español'] - Casta category (español, mestizo, indio, etc.)
 * @param {string} [options.occupation] - Occupation (used for class-based name selection)
 * @param {string} [options.archetype] - Entity archetype (Shopkeeper, Nun, etc.) - appended in parentheses
 * @returns {Object} Generated name data
 */
export function generateHistoricalName(options = {}) {
  const {
    gender = Math.random() > 0.5 ? 'male' : 'female',
    casta = 'español',
    occupation = null,
    archetype = null
  } = options;

  const nameData = MexicoCity1680.names;

  let firstName, surname, fullName;

  // Indigenous names for indio casta
  if (casta === 'indio' && nameData.nahuatl) {
    firstName = gender === 'female'
      ? random(nameData.nahuatl.female)
      : random(nameData.nahuatl.male);

    // Indigenous people often used single names or Spanish baptismal names + indigenous surname
    const useSpanishSurname = Math.random() > 0.5;
    if (useSpanishSurname) {
      const spanishSurnames = gender === 'female' ? nameData.female.surnames : nameData.male.surnames;
      surname = random(spanishSurnames);
    } else {
      // Use first name as full name (common for indigenous people)
      surname = null;
    }
  } else {
    // Spanish names (for español, criollo, mestizo, etc.)
    const firstNames = gender === 'female' ? nameData.female.first : nameData.male.first;
    firstName = random(firstNames);

    const surnames = gender === 'female' ? nameData.female.surnames : nameData.male.surnames;
    surname = random(surnames);
  }

  // Build full name
  if (surname) {
    fullName = `${firstName} ${surname}`;
  } else {
    fullName = firstName;
  }

  // Append archetype in parentheses if provided (e.g., "Pedro Rivas (Shopkeeper)")
  const displayName = archetype ? `${fullName} (${archetype})` : fullName;

  return {
    fullName: displayName,
    firstName,
    surname,
    gender,
    casta
  };
}

/**
 * Generate a name specifically for a template entity
 * Extracts archetype from template name and generates appropriate full name
 *
 * @param {Object} templateEntity - Template entity with instruction text in name
 * @returns {Object} Name data suitable for entity creation
 */
export function generateNameForTemplate(templateEntity) {
  // Extract archetype from template name
  // e.g., "Shopkeeper [this is a generic...]" -> "Shopkeeper"
  const archetype = templateEntity.name.split('[')[0].trim();

  // Determine gender from archetype or entity data
  let gender = templateEntity.gender || templateEntity.appearance?.gender;

  // If no gender specified, infer from archetype
  if (!gender) {
    gender = inferGenderFromArchetype(archetype);
  }

  // Determine casta from entity data or default to español
  const casta = templateEntity.social?.casta || templateEntity.casta || 'español';

  // Generate name with archetype appended
  const nameData = generateHistoricalName({
    gender,
    casta,
    occupation: archetype,
    archetype: archetype // This appends "(Shopkeeper)" to the name
  });

  return {
    ...nameData,
    archetype
  };
}

/**
 * Infer gender from archetype name
 * @param {string} archetype - Entity archetype (e.g., "Nun", "Shopkeeper")
 * @returns {string} 'male' or 'female'
 */
function inferGenderFromArchetype(archetype) {
  const femaleKeywords = [
    'woman', 'female', 'nun', 'mother', 'daughter', 'wife',
    'widow', 'seamstress', 'midwife', 'curandera', 'doña', 'tejedora'
  ];

  const maleKeywords = [
    'man', 'male', 'father', 'son', 'husband', 'priest',
    'friar', 'monk', 'soldier', 'don', 'caballero', 'vaquero'
  ];

  const archetypeLower = archetype.toLowerCase();

  // Check for explicit gender keywords
  if (femaleKeywords.some(keyword => archetypeLower.includes(keyword))) {
    return 'female';
  }
  if (maleKeywords.some(keyword => archetypeLower.includes(keyword))) {
    return 'male';
  }

  // Default to 50/50 for ambiguous archetypes
  return Math.random() > 0.5 ? 'male' : 'female';
}

/**
 * Check if an entity name contains template instruction text
 * @param {string} name - Entity name to check
 * @returns {boolean} True if name contains instruction text
 */
export function isTemplateName(name) {
  return name && name.includes('[this is a generic');
}

export default {
  generateHistoricalName,
  generateNameForTemplate,
  isTemplateName
};
