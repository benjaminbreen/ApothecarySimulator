/**
 * Portrait Name Matching Service
 *
 * Checks if a portrait file exists for a given NPC name by trying various
 * name format variations (accents, separators, case, extensions).
 */

import { PORTRAIT_CATEGORIES } from '../config/portraits.config.js';

/**
 * Remove diacritical marks (accents) from a string
 * á → a, é → e, í → i, ó → o, ú → u, ñ → n, etc.
 */
function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Generate all possible filename variations for a given NPC name
 *
 * Example: "Pedro Vázquez" generates:
 * - pedrovázquez.jpg, pedrovázquez.png
 * - pedrovasquez.jpg, pedrovasquez.png
 * - pedro_vázquez.jpg, pedro_vázquez.png
 * - pedro_vasquez.jpg, pedro_vasquez.png
 * - pedrovazquez.jpg, pedrovazquez.png
 * - etc.
 */
function generateNameVariations(name) {
  if (!name || typeof name !== 'string') return [];

  const variations = new Set();
  const extensions = ['.jpg', '.png', '.jpeg'];

  // Normalize name: lowercase
  const lowerName = name.toLowerCase().trim();

  // Version 1: With accents
  const withAccents = lowerName;

  // Version 2: Without accents
  const withoutAccents = removeDiacritics(lowerName);

  // For each version, try different separators
  const separatorVariations = [
    (s) => s.replace(/\s+/g, ''),           // no separator: "pedrovasquez"
    (s) => s.replace(/\s+/g, '_'),          // underscore: "pedro_vasquez"
    (s) => s.replace(/\s+/g, '-'),          // hyphen: "pedro-vasquez"
  ];

  // Generate all combinations
  [withAccents, withoutAccents].forEach(nameVersion => {
    separatorVariations.forEach(separatorFn => {
      const processedName = separatorFn(nameVersion);
      extensions.forEach(ext => {
        variations.add(processedName + ext);
      });
    });
  });

  return Array.from(variations);
}

/**
 * Flatten portrait categories into a single list of all available portrait filenames
 */
function getAllPortraitFilenames() {
  const allPortraits = new Set();

  Object.values(PORTRAIT_CATEGORIES).forEach(category => {
    if (Array.isArray(category)) {
      category.forEach(filename => allPortraits.add(filename.toLowerCase()));
    }
  });

  return allPortraits;
}

/**
 * Check if a portrait filename exists in the available portraits
 * @param {string} filename - Portrait filename to check (e.g., "pedrovasquez.jpg")
 * @returns {boolean} - True if portrait exists, false otherwise
 */
export function portraitExists(filename) {
  if (!filename || typeof filename !== 'string') return false;

  const availablePortraits = getAllPortraitFilenames();
  const normalizedFilename = filename.toLowerCase().trim();

  return availablePortraits.has(normalizedFilename);
}

/**
 * Find a portrait file that matches the NPC's name
 *
 * @param {string} npcName - The NPC's name (e.g., "Pedro Vázquez")
 * @returns {string|null} - The matching portrait filename or null if no match found
 */
export function findPortraitByName(npcName) {
  if (!npcName || typeof npcName !== 'string') {
    return null;
  }

  // Get all available portrait filenames
  const availablePortraits = getAllPortraitFilenames();

  // Generate all possible name variations
  const nameVariations = generateNameVariations(npcName);

  console.log(`[portraitMatcher] Checking ${nameVariations.length} variations for "${npcName}"`);

  // Check each variation against available portraits
  for (const variation of nameVariations) {
    if (availablePortraits.has(variation)) {
      console.log(`[portraitMatcher] ✓ Found exact match: ${variation}`);

      // Find the original-case version from the config
      for (const category of Object.values(PORTRAIT_CATEGORIES)) {
        if (Array.isArray(category)) {
          const match = category.find(filename => filename.toLowerCase() === variation);
          if (match) {
            return match;
          }
        }
      }

      // Fallback: return the lowercase version (shouldn't reach here)
      return variation;
    }
  }

  console.log(`[portraitMatcher] ✗ No name-based match found for "${npcName}"`);
  return null;
}

/**
 * Check if a portrait exists for an NPC name
 *
 * @param {string} npcName - The NPC's name
 * @returns {boolean} - True if a portrait file exists for this name
 */
export function hasPortraitForName(npcName) {
  return findPortraitByName(npcName) !== null;
}
