/**
 * entityHelpers.js
 * Utility functions for working with entity objects
 */

/**
 * Merge two entity objects while preserving non-enumerable cached properties
 *
 * CRITICAL: Entity objects have a _portraitPath property that is non-enumerable
 * (to avoid serialization to localStorage). The spread operator {...obj} only
 * copies enumerable properties, so this helper ensures the cache is preserved.
 *
 * @param {Object} target - Base entity object (may have cached properties)
 * @param {Object} source - New data to merge in
 * @returns {Object} Merged entity with cache preserved
 *
 * @example
 * const existingNPC = { name: "Isabel", _portraitPath: "/portraits/isabel.jpg" };
 * const updates = { reputation: 75 };
 * const merged = mergeEntityPreservingCache(existingNPC, updates);
 * // merged._portraitPath is preserved
 */
export function mergeEntityPreservingCache(target, source) {
  if (!target || !source) {
    console.warn('[entityHelpers] mergeEntityPreservingCache called with null/undefined');
    return target || source || {};
  }

  // Perform standard merge
  const merged = { ...target, ...source };

  // Preserve cached portrait path (non-enumerable property)
  if (target._portraitPath) {
    try {
      Object.defineProperty(merged, '_portraitPath', {
        value: target._portraitPath,
        writable: true,
        enumerable: false, // Don't serialize to localStorage
        configurable: true
      });
      console.log(`[entityHelpers] Preserved portrait cache for ${merged.name || 'unknown'}: ${target._portraitPath}`);
    } catch (error) {
      console.warn('[entityHelpers] Could not preserve portrait cache:', error);
    }
  }

  return merged;
}

/**
 * Cache a portrait path on an entity (ensures proper property descriptor)
 *
 * @param {Object} entity - Entity to cache portrait on
 * @param {string} portraitPath - Full portrait path (e.g., "/portraits/isabel.jpg")
 * @returns {boolean} True if cache was set successfully
 */
export function cachePortraitOnEntity(entity, portraitPath) {
  if (!entity || !portraitPath) {
    console.warn('[entityHelpers] cachePortraitOnEntity called with invalid arguments');
    return false;
  }

  try {
    Object.defineProperty(entity, '_portraitPath', {
      value: portraitPath,
      writable: true,
      enumerable: false, // Don't serialize to localStorage
      configurable: true
    });
    console.log(`[entityHelpers] Cached portrait for ${entity.name || 'unknown'}: ${portraitPath}`);
    return true;
  } catch (error) {
    console.warn(`[entityHelpers] Could not cache portrait for ${entity.name || 'unknown'}:`, error);
    return false;
  }
}

/**
 * Check if entity has a cached portrait
 *
 * @param {Object} entity - Entity to check
 * @returns {string|null} Cached portrait path or null if not cached
 */
export function getCachedPortrait(entity) {
  return entity?._portraitPath || null;
}

/**
 * Clear cached portrait from entity
 *
 * @param {Object} entity - Entity to clear cache from
 */
export function clearCachedPortrait(entity) {
  if (entity && entity._portraitPath) {
    delete entity._portraitPath;
    console.log(`[entityHelpers] Cleared portrait cache for ${entity.name || 'unknown'}`);
  }
}

export default {
  mergeEntityPreservingCache,
  cachePortraitOnEntity,
  getCachedPortrait,
  clearCachedPortrait
};
