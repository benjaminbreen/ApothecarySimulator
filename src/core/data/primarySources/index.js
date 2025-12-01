/**
 * Primary Sources - Index
 *
 * Aggregates all primary sources from category-specific files
 * and exports a unified API for the service layer.
 */

import { MATERIA_MEDICA_SOURCES } from './materiaMediaca';
import { MEDICAL_THEORY_SOURCES } from './medicalTheory';
import { COLONIAL_MEXICO_SOURCES } from './colonialMexico';
import { PEOPLE_SOURCES } from './people';
import { PLACES_EVENTS_SOURCES } from './placesEvents';
import { THEMATIC_TOPICS_SOURCES } from './thematicTopics';
import { CRAFTING_METHODS_SOURCES } from './craftingMethods';

// ============================================
// SOURCE CATEGORIES
// ============================================

export const SOURCE_CATEGORIES = {
  'materia-medica': {
    id: 'materia-medica',
    name: 'Materia Medica',
    icon: '🌿',
    color: '#059669',
    description: 'Historical texts about medicinal substances and drugs'
  },
  'medical-theory': {
    id: 'medical-theory',
    name: 'Medical Theory',
    icon: '📜',
    color: '#2563eb',
    description: 'Texts on medical philosophy, diagnosis, and treatment'
  },
  'colonial-mexico': {
    id: 'colonial-mexico',
    name: 'Colonial Mexico',
    icon: '🏛️',
    color: '#dc2626',
    description: 'Life, society, and culture in New Spain'
  },
  'people': {
    id: 'people',
    name: 'People',
    icon: '👤',
    color: '#7c3aed',
    description: 'Notable individuals and social types'
  },
  'places-events': {
    id: 'places-events',
    name: 'Places & Events',
    icon: '🗺️',
    color: '#ca8a04',
    description: 'Locations, epidemics, and historical events'
  },
  'thematic-topics': {
    id: 'thematic-topics',
    name: 'Thematic Topics',
    icon: '💭',
    color: '#6366f1',
    description: 'Broader themes: death, religion, gender, race, commerce, science'
  },
  'crafting-methods': {
    id: 'crafting-methods',
    name: 'Crafting Methods',
    icon: '⚗️',
    color: '#f59e0b',
    description: 'Pharmaceutical processes: distillation, decoction, calcination'
  }
};

// ============================================
// COMBINED SOURCES
// ============================================

export const PRIMARY_SOURCES = [
  ...MATERIA_MEDICA_SOURCES,
  ...MEDICAL_THEORY_SOURCES,
  ...COLONIAL_MEXICO_SOURCES,
  ...PEOPLE_SOURCES,
  ...PLACES_EVENTS_SOURCES,
  ...THEMATIC_TOPICS_SOURCES,
  ...CRAFTING_METHODS_SOURCES
];

// ============================================
// LOOKUP FUNCTIONS
// ============================================

/**
 * Get all sources
 * @returns {Array} All primary sources
 */
export function getAllSources() {
  return PRIMARY_SOURCES;
}

/**
 * Get a source by ID
 * @param {string} id - Source ID
 * @returns {Object|null} Source object or null
 */
export function getSourceById(id) {
  return PRIMARY_SOURCES.find(source => source.id === id) || null;
}

/**
 * Get sources by category
 * @param {string} category - Category ID
 * @returns {Array} Matching sources
 */
export function getSourcesByCategory(category) {
  return PRIMARY_SOURCES.filter(source => source.category === category);
}

/**
 * Get sources by tag
 * @param {string} tag - Tag to search for
 * @returns {Array} Matching sources
 */
export function getSourcesByTag(tag) {
  const normalizedTag = tag.toLowerCase();
  return PRIMARY_SOURCES.filter(source =>
    source.tags.some(t => t.toLowerCase().includes(normalizedTag))
  );
}

/**
 * Get featured sources
 * @param {number} limit - Maximum number to return
 * @returns {Array} Featured sources
 */
export function getFeaturedSources(limit = 10) {
  return PRIMARY_SOURCES
    .filter(source => source.featured)
    .slice(0, limit);
}

/**
 * Search sources by query
 * @param {string} query - Search query
 * @returns {Array} Matching sources (sorted by relevance)
 */
export function searchSources(query) {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase();

  return PRIMARY_SOURCES
    .map(source => {
      let score = 0;

      // Title match (highest weight)
      if (source.title.toLowerCase().includes(normalizedQuery)) score += 10;

      // Tag match
      if (source.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) score += 5;

      // Linked entity match
      if (source.linkedEntities?.some(entity =>
        entity.toLowerCase().includes(normalizedQuery)
      )) score += 5;

      // Author match
      if (source.author.toLowerCase().includes(normalizedQuery)) score += 3;

      // Work match
      if (source.work.toLowerCase().includes(normalizedQuery)) score += 3;

      // Translation/text match (lowest weight)
      if (source.translation?.toLowerCase().includes(normalizedQuery)) score += 1;
      if (source.text?.toLowerCase().includes(normalizedQuery)) score += 1;

      return { source, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.source);
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get source collection statistics
 * @returns {Object} Statistics object
 */
export function getSourceStats() {
  const stats = {
    total: PRIMARY_SOURCES.length,
    byCategory: {},
    byDifficulty: { beginner: 0, intermediate: 0, advanced: 0 },
    featured: 0,
    withTranslation: 0
  };

  PRIMARY_SOURCES.forEach(source => {
    // By category
    stats.byCategory[source.category] = (stats.byCategory[source.category] || 0) + 1;

    // By difficulty
    if (source.difficulty) {
      stats.byDifficulty[source.difficulty]++;
    }

    // Featured
    if (source.featured) stats.featured++;

    // With translation
    if (source.translation) stats.withTranslation++;
  });

  return stats;
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  PRIMARY_SOURCES,
  SOURCE_CATEGORIES,
  getAllSources,
  getSourceById,
  getSourcesByCategory,
  getSourcesByTag,
  getFeaturedSources,
  searchSources,
  getSourceStats
};
