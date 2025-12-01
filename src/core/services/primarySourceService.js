/**
 * Primary Source Service
 *
 * Provides lookup and search functionality for primary sources.
 * Links game entities (items, NPCs, locations, concepts) to historical sources.
 */

import {
  PRIMARY_SOURCES,
  SOURCE_CATEGORIES,
  getAllSources,
  getSourceById,
  getSourcesByCategory,
  getSourcesByTag,
  getFeaturedSources,
  searchSources
} from '../data/primarySources/index';

// Re-export core functions
export {
  PRIMARY_SOURCES,
  SOURCE_CATEGORIES,
  getAllSources,
  getSourceById,
  getSourcesByCategory,
  getSourcesByTag,
  getFeaturedSources,
  searchSources
};

/**
 * Normalize a string for matching (lowercase, remove accents, trim)
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
function normalizeForMatch(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .trim();
}

/**
 * Get sources that relate to a game entity (item, NPC, location, concept)
 * Uses fuzzy matching on tags and linkedEntities
 *
 * @param {string} entityName - Name of the entity (e.g., "opium", "Sor Juana")
 * @returns {Array} Array of matching sources
 */
export function getSourcesForEntity(entityName) {
  if (!entityName || entityName.length < 2) return [];

  const normalized = normalizeForMatch(entityName);
  const sources = getAllSources();

  return sources.filter(source => {
    // Check linkedEntities (primary match)
    if (source.linkedEntities?.some(entity =>
      normalizeForMatch(entity).includes(normalized) ||
      normalized.includes(normalizeForMatch(entity))
    )) {
      return true;
    }

    // Check tags
    if (source.tags.some(tag =>
      normalizeForMatch(tag).includes(normalized) ||
      normalized.includes(normalizeForMatch(tag))
    )) {
      return true;
    }

    // Check title
    if (normalizeForMatch(source.title).includes(normalized)) {
      return true;
    }

    return false;
  });
}

/**
 * Check if an entity has associated primary sources
 * Use this to determine whether to show the source icon
 *
 * @param {string} entityName - Name of the entity
 * @returns {boolean} True if sources exist
 */
export function hasSourcesForEntity(entityName) {
  return getSourcesForEntity(entityName).length > 0;
}

/**
 * Get the count of sources for an entity
 *
 * @param {string} entityName - Name of the entity
 * @returns {number} Number of sources
 */
export function getSourceCountForEntity(entityName) {
  return getSourcesForEntity(entityName).length;
}

/**
 * Get a random source (for "Did you know?" features)
 *
 * @param {string} category - Optional category filter
 * @returns {Object} Random source
 */
export function getRandomSource(category = null) {
  let sources = getAllSources();

  if (category) {
    sources = sources.filter(s => s.category === category);
  }

  if (sources.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * sources.length);
  return sources[randomIndex];
}

/**
 * Get sources matching multiple tags (AND logic)
 *
 * @param {Array} tags - Array of tags to match
 * @returns {Array} Sources matching all tags
 */
export function getSourcesByMultipleTags(tags) {
  if (!tags || tags.length === 0) return getAllSources();

  const normalizedTags = tags.map(normalizeForMatch);

  return getAllSources().filter(source =>
    normalizedTags.every(searchTag =>
      source.tags.some(sourceTag =>
        normalizeForMatch(sourceTag).includes(searchTag)
      )
    )
  );
}

/**
 * Get related sources (sources sharing tags with a given source)
 *
 * @param {string} sourceId - Source ID
 * @param {number} limit - Maximum number to return
 * @returns {Array} Related sources
 */
export function getRelatedSources(sourceId, limit = 5) {
  const source = getSourceById(sourceId);
  if (!source) return [];

  // Find sources sharing tags
  const related = getAllSources()
    .filter(s => s.id !== sourceId) // Exclude self
    .map(s => ({
      source: s,
      sharedTags: s.tags.filter(tag => source.tags.includes(tag)).length
    }))
    .filter(item => item.sharedTags > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags)
    .slice(0, limit)
    .map(item => item.source);

  return related;
}

/**
 * Get sources by difficulty level
 *
 * @param {string} difficulty - 'beginner', 'intermediate', or 'advanced'
 * @returns {Array} Sources at that difficulty
 */
export function getSourcesByDifficulty(difficulty) {
  return getAllSources().filter(s => s.difficulty === difficulty);
}

/**
 * Get contextual source suggestions based on game state
 *
 * @param {Object} context - Current game context
 * @param {string} context.location - Current location
 * @param {Array} context.inventory - Player inventory items
 * @param {Object} context.currentPatient - Current patient (if any)
 * @param {string} context.currentAction - Current action type
 * @returns {Array} Suggested sources (max 3)
 */
export function getContextualSuggestions(context = {}) {
  const suggestions = new Set();
  const allSources = getAllSources();

  // Based on location
  if (context.location) {
    const locationLower = context.location.toLowerCase();

    if (locationLower.includes('cathedral') || locationLower.includes('church')) {
      suggestions.add('sor-juana-respuesta');
      suggestions.add('auto-de-fe');
    }

    if (locationLower.includes('plaza') || locationLower.includes('market')) {
      suggestions.add('plaza-mayor-description');
      suggestions.add('tianguis-market');
    }

    if (locationLower.includes('alameda')) {
      suggestions.add('alameda-park');
    }

    if (locationLower.includes('hospital')) {
      suggestions.add('hospital-naturales');
    }
  }

  // Based on inventory items
  if (context.inventory && Array.isArray(context.inventory)) {
    context.inventory.forEach(item => {
      const itemName = typeof item === 'string' ? item : item.name;
      const sources = getSourcesForEntity(itemName);
      if (sources.length > 0) {
        suggestions.add(sources[0].id);
      }
    });
  }

  // Based on patient condition
  if (context.currentPatient?.condition) {
    const condition = context.currentPatient.condition.toLowerCase();

    if (condition.includes('fever') || condition.includes('malaria')) {
      suggestions.add('acosta-cinchona');
    }

    if (condition.includes('pain')) {
      suggestions.add('monardes-opium');
    }
  }

  // Based on action
  if (context.currentAction === 'diagnose') {
    suggestions.add('avicenna-diagnosis');
    suggestions.add('galen-humors');
  }

  if (context.currentAction === 'bloodletting') {
    suggestions.add('galen-bloodletting');
  }

  // Convert to source objects and limit
  return Array.from(suggestions)
    .slice(0, 3)
    .map(id => getSourceById(id))
    .filter(Boolean);
}

/**
 * Format a source citation in academic style
 *
 * @param {Object} source - Source object
 * @param {string} style - Citation style ('short', 'full', 'chicago')
 * @returns {string} Formatted citation
 */
export function formatCitation(source, style = 'full') {
  if (!source) return '';

  switch (style) {
    case 'short':
      return `${source.author}, ${source.year}`;

    case 'chicago':
      return `${source.author}. "${source.title}." In *${source.work}*, ${source.pages || 'n.p.'}. ${source.location}, ${source.year}.`;

    case 'full':
    default:
      let citation = `${source.author}. *${source.work}*`;
      if (source.location) citation += ` (${source.location}`;
      if (source.year) citation += `, ${source.year}`;
      if (source.location) citation += ')';
      if (source.pages) citation += `, ${source.pages}`;
      citation += '.';
      return citation;
  }
}

/**
 * Get source content type for display purposes
 *
 * @param {Object} source - Source object
 * @returns {Object} Content type info { hasText, hasTranslation, hasPdf, hasImages, primaryType }
 */
export function getSourceContentType(source) {
  if (!source) return { hasText: false, hasTranslation: false, hasPdf: false, hasImages: false, primaryType: 'none' };

  const hasText = Boolean(source.text);
  const hasTranslation = Boolean(source.translation);
  const hasPdf = Boolean(source.pdf);
  const hasImages = Boolean(source.images && source.images.length > 0);

  // Determine primary content type
  let primaryType = 'text';
  if (hasPdf) primaryType = 'pdf';
  else if (hasImages && !hasText) primaryType = 'image';

  return {
    hasText,
    hasTranslation,
    hasPdf,
    hasImages,
    primaryType
  };
}

/**
 * Get statistics about the source collection
 *
 * @returns {Object} Statistics
 */
export function getSourceStats() {
  const sources = getAllSources();

  const byCategory = {};
  const byDifficulty = { beginner: 0, intermediate: 0, advanced: 0 };
  let withPdf = 0;
  let withImages = 0;
  let featured = 0;

  sources.forEach(source => {
    // By category
    byCategory[source.category] = (byCategory[source.category] || 0) + 1;

    // By difficulty
    if (source.difficulty) {
      byDifficulty[source.difficulty]++;
    }

    // Content types
    if (source.pdf) withPdf++;
    if (source.images && source.images.length > 0) withImages++;
    if (source.featured) featured++;
  });

  return {
    total: sources.length,
    byCategory,
    byDifficulty,
    withPdf,
    withImages,
    featured
  };
}

export default {
  PRIMARY_SOURCES,
  SOURCE_CATEGORIES,
  getAllSources,
  getSourceById,
  getSourcesByCategory,
  getSourcesByTag,
  getFeaturedSources,
  searchSources,
  getSourcesForEntity,
  hasSourcesForEntity,
  getSourceCountForEntity,
  getRandomSource,
  getSourcesByMultipleTags,
  getRelatedSources,
  getSourcesByDifficulty,
  getContextualSuggestions,
  formatCitation,
  getSourceContentType,
  getSourceStats
};
