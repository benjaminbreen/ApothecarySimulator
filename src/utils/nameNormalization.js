/**
 * Name Normalization Utilities
 *
 * Handles inconsistent NPC naming (titles, honorifics) to ensure
 * portrait and entity continuity across conversations.
 */

/**
 * Common Spanish/Colonial honorifics and titles to strip for matching
 */
const HONORIFICS = [
  // Military ranks
  'sergeant', 'captain', 'lieutenant', 'colonel', 'general',
  'sargento', 'capitán', 'teniente', 'coronel',

  // Social titles
  'don', 'doña', 'señor', 'señora', 'señorita',
  'sir', 'madam', 'lady', 'lord',

  // Religious
  'father', 'padre', 'sister', 'hermana', 'brother', 'hermano',
  'friar', 'fray', 'bishop', 'obispo', 'archbishop',

  // Professional
  'doctor', 'dr.', 'dr', 'profesor', 'maestro', 'maestra',

  // Other (Note: "the" removed - too broad, causes false matches)
  'widow', 'viuda'
];

/**
 * Cache for normalized name lookups (performance optimization)
 * Maps: normalized_name_lowercase -> entity
 */
const normalizedNameCache = new Map();

/**
 * Escape special regex characters in a string
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for RegExp
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize a name by removing honorifics/titles
 * @param {string} name - Original name (e.g., "Sergeant Miguel Cordero")
 * @returns {string} Normalized name (e.g., "Miguel Cordero")
 */
export function normalizeNPCName(name) {
  if (!name || typeof name !== 'string') return '';

  const originalName = name.trim();
  let normalized = originalName;

  // Remove honorifics from start of name (case-insensitive)
  for (const honorific of HONORIFICS) {
    // Escape special regex characters (e.g., "dr." has a literal period)
    const escapedHonorific = escapeRegex(honorific);
    // Match honorific at start, followed by space or period+space
    const pattern = new RegExp(`^${escapedHonorific}[\\.\\s]+`, 'i');
    if (pattern.test(normalized)) {
      normalized = normalized.replace(pattern, '').trim();
      break; // Only remove first honorific
    }
  }

  // CRITICAL: If normalization removed everything, return original name
  // (prevents empty string matches)
  if (!normalized || normalized.length === 0) {
    return originalName;
  }

  return normalized;
}

/**
 * Check if two names refer to the same person
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {boolean} True if names match (with or without honorifics)
 */
export function namesMatch(name1, name2) {
  if (!name1 || !name2) return false;

  // Exact match
  if (name1 === name2) return true;

  // Normalized match
  const norm1 = normalizeNPCName(name1).toLowerCase();
  const norm2 = normalizeNPCName(name2).toLowerCase();

  return norm1 === norm2;
}

/**
 * Clear the normalized name cache (call when entities are added/removed)
 */
export function clearNormalizedNameCache() {
  normalizedNameCache.clear();
}

/**
 * Build cache of normalized names for fast lookups
 * @param {Object} entityManager - EntityManager instance
 */
function rebuildCache(entityManager) {
  normalizedNameCache.clear();

  const allEntities = [
    ...entityManager.getByType('npc'),
    ...entityManager.getByType('patient')
  ];

  for (const entity of allEntities) {
    if (entity.name) {
      const normalizedKey = normalizeNPCName(entity.name).toLowerCase();
      // Store first match only (prevents duplicates)
      if (!normalizedNameCache.has(normalizedKey)) {
        normalizedNameCache.set(normalizedKey, entity);
      }
    }
  }
}

/**
 * Find an entity by name, handling honorific variations
 * @param {string} entityName - Name to search for
 * @param {Object} entityManager - EntityManager instance
 * @returns {Object|null} Found entity or null
 */
export function findEntityByName(entityName, entityManager) {
  if (!entityName || !entityManager) return null;

  // Try exact match first (fastest - O(1) hash lookup)
  let entity = entityManager.getByName(entityName);
  if (entity) return entity;

  // Try normalized match with cache
  const normalizedSearch = normalizeNPCName(entityName).toLowerCase();

  // Rebuild cache if empty (first call or after clear)
  if (normalizedNameCache.size === 0) {
    rebuildCache(entityManager);
  }

  // Check cache for O(1) lookup
  entity = normalizedNameCache.get(normalizedSearch);
  if (entity) return entity;

  // Cache miss - entity might be newly added, rebuild cache and try again
  rebuildCache(entityManager);
  entity = normalizedNameCache.get(normalizedSearch);

  return entity || null;
}

export default {
  normalizeNPCName,
  namesMatch,
  findEntityByName,
  clearNormalizedNameCache
};
