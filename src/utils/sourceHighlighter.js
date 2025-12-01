/**
 * Source Highlighter Utility
 *
 * Adds small book/scroll icons to narrative text when terms
 * match primary source tags or linked entities.
 */

import { SOURCE_CATEGORIES, getAllSources } from '../core/data/primarySources/index';
import { getSourcesForEntity, hasSourcesForEntity, getSourceCountForEntity } from '../core/services/primarySourceService';

// Cache for source lookups to avoid repeated searches
const sourceCache = new Map();

/**
 * Check if a term has associated primary sources
 * Uses caching to avoid repeated lookups
 *
 * @param {string} term - The term to check
 * @returns {Object|null} - { count, sources } or null if no sources
 */
export function checkTermForSources(term) {
  if (!term || term.length < 3) return null;

  // Normalize term for cache key
  const cacheKey = term.toLowerCase().trim();

  if (sourceCache.has(cacheKey)) {
    return sourceCache.get(cacheKey);
  }

  const sources = getSourcesForEntity(term);
  const result = sources.length > 0 ? { count: sources.length, sources } : null;

  sourceCache.set(cacheKey, result);
  return result;
}

/**
 * Get a list of all unique terms from all primary sources
 * Used for quick lookups when highlighting text
 *
 * @returns {Set<string>} - Set of all searchable terms
 */
export function getAllSourceTerms() {
  const terms = new Set();

  try {
    const sources = getAllSources();

    sources.forEach(source => {
      // Add tags
      if (source.tags) {
        source.tags.forEach(tag => {
          if (tag.length >= 3) {
            terms.add(tag.toLowerCase());
          }
        });
      }

      // Add linked entities
      if (source.linkedEntities) {
        source.linkedEntities.forEach(entity => {
          if (entity.length >= 3) {
            terms.add(entity.toLowerCase());
          }
        });
      }
    });
  } catch (e) {
    console.warn('[SourceHighlighter] Could not load sources:', e);
  }

  return terms;
}

// Pre-compute all source terms for fast lookups
let _allSourceTerms = null;

/**
 * Get pre-computed source terms (lazy loaded)
 * @returns {Set<string>}
 */
export function getSourceTermsSet() {
  if (!_allSourceTerms) {
    _allSourceTerms = getAllSourceTerms();
  }
  return _allSourceTerms;
}

/**
 * Check if a word might have sources (fast check)
 * @param {string} word
 * @returns {boolean}
 */
export function mightHaveSources(word) {
  if (!word || word.length < 3) return false;
  const terms = getSourceTermsSet();
  return terms.has(word.toLowerCase());
}

/**
 * Get the icon for a source category
 * @param {string} categoryId
 * @returns {string}
 */
export function getCategoryIcon(categoryId) {
  const category = SOURCE_CATEGORIES[categoryId];
  return category?.icon || '📚';
}

/**
 * Get a brief description for tooltip
 * @param {Array} sources - Array of matching sources
 * @returns {string}
 */
export function getSourceTooltip(sources) {
  if (!sources || sources.length === 0) return '';

  if (sources.length === 1) {
    return `📚 ${sources[0].title} (${sources[0].author}, ${sources[0].year})`;
  }

  return `📚 ${sources.length} primary sources available`;
}

/**
 * Priority terms that should always show source icons if they have sources
 * These are important thematic/gameplay terms
 */
export const PRIORITY_SOURCE_TERMS = new Set([
  // Crafting methods
  'distillation', 'distill', 'decoction', 'decoct', 'calcination', 'calcinate',
  'confection', 'confect', 'sublimation', 'sublimate', 'infusion', 'infuse',
  'tincture', 'electuary', 'theriac', 'mithridate',

  // Medical concepts
  'humors', 'humours', 'bloodletting', 'phlebotomy', 'purgative', 'emetic',
  'cathartic', 'febrifuge', 'sudorific', 'diuretic', 'anodyne', 'opiate',
  'melancholy', 'phlegm', 'choler', 'bile',

  // Key substances
  'opium', 'laudanum', 'mercury', 'quicksilver', 'antimony', 'arsenic',
  'cinchona', 'quinine', 'bezoar', 'theriac', 'mithridate',
  'coca', 'tobacco', 'chocolate', 'cacao',

  // Themes
  'Inquisition', 'converso', 'heresy', 'witchcraft', 'poison',
  'death', 'dying', 'plague', 'epidemic', 'contagion',
  'midwife', 'childbirth', 'pregnancy',

  // Social/Legal
  'limpieza', 'casta', 'guild', 'protomédico', 'apothecary'
]);

/**
 * Check if a term is a priority term for source highlighting
 * @param {string} term
 * @returns {boolean}
 */
export function isPriorityTerm(term) {
  if (!term) return false;
  return PRIORITY_SOURCE_TERMS.has(term.toLowerCase());
}

/**
 * Clear the source cache (call when sources are updated)
 */
export function clearSourceCache() {
  sourceCache.clear();
  _allSourceTerms = null;
}

export default {
  checkTermForSources,
  getAllSourceTerms,
  getSourceTermsSet,
  mightHaveSources,
  getCategoryIcon,
  getSourceTooltip,
  isPriorityTerm,
  clearSourceCache,
  PRIORITY_SOURCE_TERMS
};
