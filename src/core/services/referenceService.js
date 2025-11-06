/**
 * Reference Service
 * Combines hardcoded primary source entries with Wikipedia API
 */

import { fetchWikipediaArticle } from './wikipediaService';
import {
  REFERENCE_ENTRIES,
  getEntriesByCategory,
  searchEntries as searchHardcodedEntries,
  getEntryById
} from '../data/medicalReference';

/**
 * Enhanced entry combining hardcoded data with Wikipedia
 * @param {string} entryId - Entry ID from medicalReference
 * @returns {Promise<Object>} Enhanced entry with Wikipedia data
 */
export async function getEnhancedEntry(entryId) {
  const hardcodedEntry = getEntryById(entryId);
  if (!hardcodedEntry) return null;

  // If entry has wikipediaQuery, fetch Wikipedia data
  if (hardcodedEntry.wikipediaQuery) {
    try {
      const wikipediaData = await fetchWikipediaArticle(hardcodedEntry.wikipediaQuery);
      return {
        ...hardcodedEntry,
        wikipedia: wikipediaData,
        hasWikipedia: !!wikipediaData
      };
    } catch (error) {
      console.error(`[ReferenceService] Error fetching Wikipedia for ${entryId}:`, error);
    }
  }

  return {
    ...hardcodedEntry,
    hasWikipedia: false
  };
}

/**
 * Search both hardcoded entries and Wikipedia
 * @param {string} query - Search query
 * @returns {Promise<Array>} Combined search results
 */
export async function searchAll(query) {
  if (!query || query.trim().length < 2) return [];

  // Search hardcoded entries first (instant)
  const hardcodedResults = searchHardcodedEntries(query);

  // Also try Wikipedia search for the query term itself
  // This allows discovering entries not in our hardcoded list
  try {
    const wikipediaResult = await fetchWikipediaArticle(query);

    if (wikipediaResult) {
      // Create a Wikipedia-only entry
      const wikipediaEntry = {
        id: `wikipedia-${query.toLowerCase().replace(/\s+/g, '-')}`,
        name: wikipediaResult.title,
        summary: wikipediaResult.extract,
        category: 'wikipedia-only',
        source: 'wikipedia',
        thumbnail: wikipediaResult.thumbnail,
        url: wikipediaResult.url,
        wikipedia: wikipediaResult,
        hasWikipedia: true
      };

      // Check if this Wikipedia result overlaps with hardcoded entries
      const isDuplicate = hardcodedResults.some(entry =>
        entry.name.toLowerCase() === wikipediaResult.title.toLowerCase() ||
        entry.wikipediaQuery?.toLowerCase() === query.toLowerCase()
      );

      if (!isDuplicate) {
        return [wikipediaEntry, ...hardcodedResults];
      }
    }
  } catch (error) {
    console.error('[ReferenceService] Wikipedia search error:', error);
  }

  return hardcodedResults;
}

/**
 * Get entries by category, enhanced with Wikipedia data
 * @param {string} categoryId - Category ID
 * @returns {Promise<Array>} Enhanced entries
 */
export async function getEnhancedEntriesByCategory(categoryId) {
  const entries = getEntriesByCategory(categoryId);

  // Enhance each entry with Wikipedia data in parallel
  const enhancedEntries = await Promise.all(
    entries.map(async (entry) => {
      if (entry.wikipediaQuery) {
        try {
          const wikipediaData = await fetchWikipediaArticle(entry.wikipediaQuery);
          return {
            ...entry,
            wikipedia: wikipediaData,
            hasWikipedia: !!wikipediaData
          };
        } catch (error) {
          return { ...entry, hasWikipedia: false };
        }
      }
      return { ...entry, hasWikipedia: false };
    })
  );

  return enhancedEntries;
}

/**
 * Get related entries for a given entry
 * @param {string} entryId - Entry ID
 * @returns {Array} Related entries
 */
export function getRelatedEntries(entryId) {
  const entry = getEntryById(entryId);
  if (!entry || !entry.relatedEntries) return [];

  return entry.relatedEntries
    .map(relatedId => getEntryById(relatedId))
    .filter(Boolean);
}

/**
 * Get quick lookup suggestions based on context
 * Used for context-aware hints in Patient View etc.
 * @param {Object} context - Current game context
 * @returns {Array} Suggested entry IDs
 */
export function getContextualSuggestions(context) {
  const suggestions = [];

  // Suggest based on symptoms
  if (context.symptoms?.includes('fever')) {
    suggestions.push('malaria', 'bloodletting', 'peruvian-bark');
  }

  // Suggest based on items in inventory
  if (context.hasItem?.includes('opium')) {
    suggestions.push('opium');
  }

  // Suggest based on diagnosis attempts
  if (context.isDiagnosing) {
    suggestions.push('humoral-theory', 'bloodletting');
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

export default {
  getEnhancedEntry,
  searchAll,
  getEnhancedEntriesByCategory,
  getRelatedEntries,
  getContextualSuggestions
};
