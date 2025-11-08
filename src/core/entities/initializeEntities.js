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

    // NOTE: Entity loading is now handled by saveManager (v1.1.0+)
    // Entities are loaded from save slots, not separate localStorage keys
    // If no entities are loaded (new game), migrate from static data

    if (entityManager.count() === 0) {
      console.log('[EntitySystem] No entities loaded, migrating from static data...');
      const results = await migrateAllEntities(EntityList, initialInventoryData);
      console.log(`[EntitySystem] Migrated ${results.npcs} NPCs and ${results.items} items`);
    }

    // REMOVED: Auto-save callback (saveManager now handles persistence)
    // REMOVED: localStorage operations (saveManager now handles storage)

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
 * Export all entities for save system
 * @returns {Array} Array of entity data ready for JSON serialization
 */
export function exportEntitiesForSave() {
  const entities = entityManager.exportToJSON();
  console.log(`[EntitySystem] Exported ${entities.length} entities for save`);
  return entities;
}

/**
 * Load entities from save data
 * @param {Array} entities - Array of entity data from save
 * @returns {boolean} Success status
 */
export function loadEntitiesFromSave(entities) {
  try {
    if (!Array.isArray(entities)) {
      console.error('[EntitySystem] Invalid entity data: not an array');
      return false;
    }

    entityManager.clear();
    entityManager.importFromJSON(entities);
    console.log(`[EntitySystem] ✅ Loaded ${entities.length} entities from save`);
    return true;
  } catch (error) {
    console.error('[EntitySystem] ❌ Failed to load entities from save:', error);
    return false;
  }
}

/**
 * Reset the entity system (for new game)
 */
export function resetEntitySystem() {
  entityManager.clear();
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
