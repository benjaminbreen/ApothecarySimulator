/**
 * Wikipedia API Service
 * Fetches article summaries from Wikipedia API
 */

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/api/rest_v1';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// In-memory cache for Wikipedia results
const cache = new Map();

/**
 * Fetch Wikipedia article summary by title
 * @param {string} title - Article title to search for
 * @returns {Promise<Object|null>} Article data or null if not found
 */
export async function fetchWikipediaArticle(title) {
  if (!title || typeof title !== 'string') {
    return null;
  }

  // Check cache first
  const cacheKey = title.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Wikipedia] Cache hit for: ${title}`);
    return cached.data;
  }

  try {
    // Encode title for URL
    const encodedTitle = encodeURIComponent(title);
    const url = `${WIKIPEDIA_API_BASE}/page/summary/${encodedTitle}`;

    console.log(`[Wikipedia] Fetching: ${title}`);
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[Wikipedia] Not found: ${title}`);
        // Cache negative result to avoid repeated failed requests
        cache.set(cacheKey, { data: null, timestamp: Date.now() });
        return null;
      }
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract relevant fields
    const articleData = {
      title: data.title,
      extract: data.extract, // Plain text summary
      thumbnail: data.thumbnail?.source || null,
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodedTitle}`,
      description: data.description || null
    };

    // Cache the result
    cache.set(cacheKey, { data: articleData, timestamp: Date.now() });

    console.log(`[Wikipedia] Success: ${title}`);
    return articleData;

  } catch (error) {
    console.error(`[Wikipedia] Error fetching ${title}:`, error);
    return null;
  }
}

/**
 * Fetch Wikipedia articles for multiple entities
 * @param {Array} entities - Array of entity objects from LLM
 * @returns {Promise<Array>} Array of enriched entities with Wikipedia data
 */
export async function fetchEntitiesWithWikipedia(entities) {
  if (!Array.isArray(entities) || entities.length === 0) {
    return [];
  }

  console.log(`[Wikipedia] Fetching data for ${entities.length} entities`);

  // Fetch all entities in parallel
  const promises = entities.map(async (entity) => {
    // Skip Wikipedia lookup for NPCs/patients without a specific query
    // (avoids ambiguous person name lookups like "Rosa Maria Perez")
    if (['npc', 'patient'].includes(entity.entityType) && !entity.wikipediaQuery) {
      console.log(`[Wikipedia] Skipping ${entity.text} (person without wikipediaQuery)`);
      return {
        ...entity,
        wikipedia: null
      };
    }

    // Use wikipediaQuery if provided, otherwise use entity text
    const searchTerm = entity.wikipediaQuery || entity.text;
    console.log(`[Wikipedia] Looking up "${entity.text}" as "${searchTerm}"`);

    const wikipediaData = await fetchWikipediaArticle(searchTerm);

    return {
      ...entity,
      wikipedia: wikipediaData,
      wikipediaSearchTerm: searchTerm // Store what we searched for
    };
  });

  const results = await Promise.all(promises);

  // Filter to only entities with Wikipedia data
  const withWikipedia = results.filter(e => e.wikipedia !== null);
  console.log(`[Wikipedia] Found ${withWikipedia.length}/${entities.length} articles`);

  return results; // Return all, including those without Wikipedia data
}

/**
 * Clear the Wikipedia cache
 */
export function clearWikipediaCache() {
  cache.clear();
  console.log('[Wikipedia] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getWikipediaCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.keys())
  };
}
