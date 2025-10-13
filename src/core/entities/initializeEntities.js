/**
 * Initialize Entity System
 *
 * Call this once when the app starts to migrate existing data
 * and set up the entity manager.
 *
 * Usage in AppNew.js:
 * ```
 * import { initializeEntitySystem } from './core/entities/initializeEntities';
 *
 * useEffect(() => {
 *   initializeEntitySystem();
 * }, []);
 * ```
 */

import { entityManager } from './EntityManager';
import { migrateAllEntities } from './migrations/migrateEntities';
import npcGenerator from './procedural/npcGenerator';
import itemGenerator from './procedural/itemGenerator';
import EntityList from '../../EntityList';
import { initialInventoryData } from '../../initialInventory';

let initialized = false;

/**
 * Initialize the entity system
 * @returns {Promise<Object>} Migration results
 */
export async function initializeEntitySystem() {
  if (initialized) {
    console.log('[EntitySystem] Already initialized');
    return { alreadyInitialized: true };
  }

  console.log('[EntitySystem] Initializing...');

  try {
    // Register generators
    entityManager.setGenerators({
      npc: npcGenerator,
      item: itemGenerator
    });

    // Try to load from localStorage first
    const savedEntities = localStorage.getItem('apothecary_entities');

    if (savedEntities) {
      try {
        const entities = JSON.parse(savedEntities);
        console.log(`[EntitySystem] Loading ${entities.length} entities from localStorage...`);
        entityManager.importFromJSON(entities);
        console.log('[EntitySystem] ✅ Loaded entities from localStorage');
      } catch (error) {
        console.error('[EntitySystem] Failed to load from localStorage:', error);
        // Fall through to migration
      }
    }

    // If no saved entities or loading failed, migrate from static data
    if (entityManager.count() === 0) {
      console.log('[EntitySystem] No saved entities, migrating from static data...');
      const results = await migrateAllEntities(EntityList, initialInventoryData);
      console.log(`[EntitySystem] Migrated ${results.npcs} NPCs and ${results.items} items`);

      // Save after migration
      saveEntitiesToLocalStorage();
    }

    // Set up auto-save callback
    entityManager.setSaveCallback(() => {
      // Debounce saves to avoid excessive writes
      if (window.entitySaveTimeout) {
        clearTimeout(window.entitySaveTimeout);
      }
      window.entitySaveTimeout = setTimeout(() => {
        saveEntitiesToLocalStorage();
      }, 500); // Save 500ms after last change
    });

    initialized = true;

    console.log('[EntitySystem] ✅ Initialization complete');
    console.log(`[EntitySystem] Total entities: ${entityManager.count()}`);

    // Log stats
    const stats = entityManager.getStats();
    console.log('[EntitySystem] Stats:', stats);

    return { success: true };

  } catch (error) {
    console.error('[EntitySystem] ❌ Initialization failed:', error);
    throw error;
  }
}

/**
 * Save all entities to localStorage
 */
export function saveEntitiesToLocalStorage() {
  try {
    const entities = entityManager.exportToJSON();
    localStorage.setItem('apothecary_entities', JSON.stringify(entities));
    console.log(`[EntitySystem] 💾 Saved ${entities.length} entities to localStorage`);
    return true;
  } catch (error) {
    console.error('[EntitySystem] ❌ Failed to save entities:', error);
    return false;
  }
}

/**
 * Reset the entity system (for testing)
 */
export function resetEntitySystem() {
  entityManager.clear();
  localStorage.removeItem('apothecary_entities');
  initialized = false;
  console.log('[EntitySystem] Reset complete');
}

/**
 * Check if initialized
 */
export function isEntitySystemInitialized() {
  return initialized;
}

export default {
  initializeEntitySystem,
  saveEntitiesToLocalStorage,
  resetEntitySystem,
  isEntitySystemInitialized
};
