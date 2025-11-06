/**
 * Medical Term Entities
 * Converts reference entries into EntityManager-compatible format for highlighting
 * Registers medical terms as clickable entities in narrative text
 */

import { REFERENCE_ENTRIES, getAllEntries } from './medicalReference';
import { entityManager } from '../entities/EntityManager';

/**
 * Generate intelligent aliases for a medical term
 * Only includes multi-word phrases, not single words (to avoid false positives)
 * @param {Object} entry - Reference entry
 * @returns {Array<string>} Array of alias strings
 */
function generateAliases(entry) {
  const aliases = [];

  // Primary name
  if (entry.name) {
    aliases.push(entry.name);
  }

  // Latin name (if multi-word)
  if (entry.latinName && entry.latinName.split(' ').length >= 2) {
    aliases.push(entry.latinName);
  }

  // Extract multi-word phrases from tags (e.g., "tertian fever" from tags)
  if (entry.tags && Array.isArray(entry.tags)) {
    entry.tags.forEach(tag => {
      // Only include tags with spaces (multi-word)
      if (tag.includes(' ') || tag.includes('-')) {
        aliases.push(tag);
      }
    });
  }

  // Spanish name (if multi-word)
  if (entry.spanishName && entry.spanishName.split(' ').length >= 2) {
    aliases.push(entry.spanishName);
  }

  // Common alternative names (from entry metadata)
  if (entry.alternativeNames && Array.isArray(entry.alternativeNames)) {
    aliases.push(...entry.alternativeNames);
  }

  // Remove duplicates and filter out null/undefined
  return [...new Set(aliases)].filter(Boolean);
}

/**
 * Register a single medical term as an entity
 * @param {Object} entry - Reference entry to register
 */
function registerMedicalTerm(entry) {
  const aliases = generateAliases(entry);

  const medicalTermEntity = {
    id: `medical-term-${entry.id}`,
    name: entry.name,
    entityType: 'medical_term',
    referenceId: entry.id, // Link back to reference entry
    description: entry.summary || 'Medical reference entry',
    category: entry.category,
    icon: entry.icon || null, // Icon path for visual display

    // Store aliases for flexible matching
    aliases: aliases,

    // Metadata for tooltip display
    metadata: {
      latinName: entry.latinName || null,
      category: entry.category || 'reference',
      hasWikipedia: !!entry.wikipediaQuery,
      hasHistoricalSource: !!entry.historicalSource
    }
  };

  // Register primary entity
  entityManager.register(medicalTermEntity);

  // Register each alias as a separate entity pointing to same reference
  // This allows flexible matching (e.g., both "Opium" and "Papaver somniferum")
  aliases.forEach((alias, index) => {
    if (alias !== entry.name) { // Skip primary name (already registered)
      const aliasEntity = {
        id: `medical-term-${entry.id}-alias-${index}`,
        name: alias,
        entityType: 'medical_term',
        referenceId: entry.id,
        description: entry.summary || 'Medical reference entry',
        category: entry.category,
        icon: entry.icon || null, // Icon path for visual display
        aliases: [alias],
        metadata: medicalTermEntity.metadata,
        isPrimaryAlias: false // Mark as alias for tracking
      };
      entityManager.register(aliasEntity);
    }
  });
}

/**
 * Register all medical reference entries as highlightable entities
 * Called once on app initialization
 * @returns {number} Number of terms registered
 */
export function registerMedicalTerms() {
  const entries = getAllEntries();
  let termsRegistered = 0;
  let aliasesRegistered = 0;

  entries.forEach(entry => {
    const aliasCount = generateAliases(entry).length;
    registerMedicalTerm(entry);
    termsRegistered++;
    aliasesRegistered += aliasCount;
  });

  console.log(`[MedicalTerms] Registered ${termsRegistered} medical terms with ${aliasesRegistered} total aliases as entities`);
  console.log('[MedicalTerms] Medical terms are now highlightable in narrative text');

  return termsRegistered;
}

/**
 * Get all registered medical term entities
 * Useful for debugging and testing
 * @returns {Array} Array of medical term entities
 */
export function getMedicalTermEntities() {
  const allEntities = entityManager.getAll();
  return allEntities.filter(entity => entity.entityType === 'medical_term');
}

/**
 * Check if a medical term is registered
 * @param {string} termName - Name to check
 * @returns {boolean} True if term is registered
 */
export function isMedicalTermRegistered(termName) {
  const entity = entityManager.getByName(termName);
  return entity && entity.entityType === 'medical_term';
}

/**
 * Get reference ID from a medical term name
 * @param {string} termName - Medical term name
 * @returns {string|null} Reference entry ID or null
 */
export function getReferenceIdForTerm(termName) {
  const entity = entityManager.getByName(termName);
  if (entity && entity.entityType === 'medical_term') {
    return entity.referenceId;
  }
  return null;
}

export default {
  registerMedicalTerms,
  getMedicalTermEntities,
  isMedicalTermRegistered,
  getReferenceIdForTerm
};
