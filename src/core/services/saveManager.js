/**
 * Save Manager Service
 * Handles saving and loading game state to/from localStorage
 * Supports multiple save slots (3 manual + 1 autosave)
 *
 * Version 1.1.0: Centralized all game state into unified save system
 * - Added: entities, npcPositions, calendarNotes, transactions
 * - Added: Migration system for version updates
 * - Added: Safe localStorage wrapper for error handling
 */

import { safeLocalStorage, setJSON, getJSON } from '../../utils/safeLocalStorage';

const SAVE_VERSION = '1.1.0';
const SAVE_KEY_PREFIX = 'apothecary_save_slot_';
const AUTOSAVE_KEY = 'apothecary_autosave';
const MAX_MANUAL_SLOTS = 3;

/**
 * Get all save slot keys (including autosave)
 */
export function getAllSaveSlotKeys() {
  return [
    AUTOSAVE_KEY,
    `${SAVE_KEY_PREFIX}1`,
    `${SAVE_KEY_PREFIX}2`,
    `${SAVE_KEY_PREFIX}3`
  ];
}

/**
 * Create save data object from current game state
 *
 * @param {Object} params - Save parameters
 * @param {Object} params.gameState - Core game state
 * @param {Object} params.playerSkills - Player skills and progression
 * @param {Array} params.conversationHistory - Recent conversation history (last 20 messages)
 * @param {Object} params.reputation - Reputation data
 * @param {Object} params.npcRelationships - NPC relationship data
 * @param {Array} params.entities - Entity manager data (NPCs, items)
 * @param {Array} params.npcPositions - NPC map positions
 * @param {Object} params.calendarNotes - Player calendar notes
 * @param {Array} params.transactions - Transaction history
 * @param {string} params.slotName - Custom name for this save
 * @returns {Object} Save data ready for storage
 */
export function createSaveData({
  gameState,
  playerSkills,
  conversationHistory = [],
  reputation = null,
  npcRelationships = {},
  // NEW: Extended game state (v1.1.0)
  entities = [],
  npcPositions = [],
  calendarNotes = {},
  transactions = [],
  slotName = 'Untitled Save'
}) {
  // Trim conversation history to last 20 messages to save space
  const trimmedHistory = conversationHistory.slice(-20);

  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    slotName,

    // Metadata for display
    metadata: {
      scenarioId: gameState.scenarioId || '1680-mexico-city',
      turnNumber: gameState.turnNumber || 1,
      location: gameState.location || 'Unknown',
      playerLevel: playerSkills?.level || 1,
      playerTitle: gameState.playerTitle || 'Apothecary',
      wealth: gameState.wealth || 0,
      health: gameState.health || 100,
      energy: gameState.energy || 100,
      date: gameState.date || 'Unknown',
      time: gameState.time || 'Unknown',
      // NEW: Enhanced metadata
      entityCount: entities.length,
      npcCount: entities.filter(e => e.type === 'npc').length,
      transactionCount: transactions.length
    },

    // Core game data (v1.0.0)
    gameState,
    playerSkills,
    conversationHistory: trimmedHistory,
    reputation,
    npcRelationships,

    // Extended game data (v1.1.0)
    entities,
    npcPositions,
    calendarNotes,
    transactions
  };
}

/**
 * Save game to a specific slot
 *
 * @param {string} slotKey - Save slot key (e.g., 'apothecary_save_slot_1' or 'apothecary_autosave')
 * @param {Object} saveData - Save data from createSaveData()
 * @returns {boolean} Success status
 */
export function saveGame(slotKey, saveData) {
  const success = setJSON(slotKey, saveData);

  if (success) {
    console.log(`[SaveManager] ✅ Game saved to ${slotKey}`);
    console.log(`[SaveManager] Save includes: ${saveData.metadata.entityCount} entities, ${saveData.metadata.transactionCount} transactions, ${saveData.metadata.booksDiscovered} books`);
  } else {
    console.error(`[SaveManager] ❌ Failed to save game to ${slotKey}`);
  }

  return success;
}

/**
 * Load game from a specific slot
 *
 * @param {string} slotKey - Save slot key
 * @returns {Object|null} Save data or null if not found/invalid
 */
export function loadGame(slotKey) {
  const saveData = getJSON(slotKey);

  if (!saveData) {
    console.log(`[SaveManager] No save found at ${slotKey}`);
    return null;
  }

  // Validate save data
  if (!saveData.version || !saveData.gameState) {
    console.error(`[SaveManager] Invalid save data at ${slotKey}`);
    return null;
  }

  // Migrate save if needed
  const migratedData = migrateSave(saveData);

  console.log(`[SaveManager] ✅ Game loaded from ${slotKey}`);
  console.log(`[SaveManager] Version: ${migratedData.version}, Turn: ${migratedData.metadata.turnNumber}`);

  return migratedData;
}

/**
 * Delete a save slot
 *
 * @param {string} slotKey - Save slot key
 * @returns {boolean} Success status
 */
export function deleteSave(slotKey) {
  try {
    localStorage.removeItem(slotKey);
    console.log(`[SaveManager] Deleted save at ${slotKey}`);
    return true;
  } catch (error) {
    console.error(`[SaveManager] Failed to delete save at ${slotKey}:`, error);
    return false;
  }
}

/**
 * List all available saves with metadata
 *
 * @returns {Array} Array of save info objects
 */
export function listSaves() {
  const saves = [];
  const slotKeys = getAllSaveSlotKeys();

  slotKeys.forEach(slotKey => {
    const saveData = loadGame(slotKey);

    if (saveData) {
      saves.push({
        slotKey,
        slotName: saveData.slotName,
        timestamp: saveData.timestamp,
        metadata: saveData.metadata,
        isAutosave: slotKey === AUTOSAVE_KEY
      });
    } else {
      // Empty slot
      saves.push({
        slotKey,
        slotName: null,
        timestamp: null,
        metadata: null,
        isEmpty: true,
        isAutosave: slotKey === AUTOSAVE_KEY
      });
    }
  });

  return saves;
}

/**
 * Export save data as JSON file (download)
 *
 * @param {string} slotKey - Save slot key
 * @returns {boolean} Success status
 */
export function exportSave(slotKey) {
  try {
    const saveData = loadGame(slotKey);

    if (!saveData) {
      console.error('[SaveManager] No save data to export');
      return false;
    }

    const jsonString = JSON.stringify(saveData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `apothecary_save_${saveData.metadata.turnNumber}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('[SaveManager] Save exported successfully');
    return true;
  } catch (error) {
    console.error('[SaveManager] Failed to export save:', error);
    return false;
  }
}

/**
 * Import save data from JSON file
 *
 * @param {string} jsonString - JSON string of save data
 * @param {string} targetSlotKey - Target slot key to save to
 * @returns {boolean} Success status
 */
export function importSave(jsonString, targetSlotKey) {
  try {
    const saveData = JSON.parse(jsonString);

    // Validate imported data
    if (!saveData.version || !saveData.gameState) {
      console.error('[SaveManager] Invalid imported save data');
      return false;
    }

    // Save to target slot
    return saveGame(targetSlotKey, saveData);
  } catch (error) {
    console.error('[SaveManager] Failed to import save:', error);
    return false;
  }
}

/**
 * Auto-save game (called automatically every N turns)
 *
 * @param {Object} saveData - Save data from createSaveData()
 * @returns {boolean} Success status
 */
export function autoSave(saveData) {
  const autoSaveData = {
    ...saveData,
    slotName: 'Auto-save'
  };

  return saveGame(AUTOSAVE_KEY, autoSaveData);
}

/**
 * Check if any saves exist
 *
 * @returns {boolean} True if at least one save exists
 */
export function hasSaves() {
  const saves = listSaves();
  return saves.some(save => !save.isEmpty);
}

/**
 * Get the most recent save
 *
 * @returns {Object|null} Most recent save info or null
 */
export function getMostRecentSave() {
  const saves = listSaves().filter(save => !save.isEmpty);

  if (saves.length === 0) {
    return null;
  }

  // Sort by timestamp (most recent first)
  saves.sort((a, b) => b.timestamp - a.timestamp);

  return saves[0];
}

/**
 * Format timestamp for display
 *
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date/time string
 */
export function formatSaveTimestamp(timestamp) {
  const date = new Date(timestamp);

  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  // Relative time for recent saves
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  // Absolute time for older saves
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Compare version strings (semantic versioning)
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }

  return 0;
}

/**
 * Migration functions for each version upgrade
 */
const MIGRATIONS = {
  '1.0.0': (saveData) => saveData, // No changes

  '1.1.0': (saveData) => {
    console.log('[SaveManager] Migrating save from v1.0.0 to v1.1.0');

    // Add new fields with defaults
    return {
      ...saveData,
      version: '1.1.0',
      entities: saveData.entities || [],
      npcPositions: saveData.npcPositions || [],
      calendarNotes: saveData.calendarNotes || {},
      transactions: saveData.transactions || [],
      // Update metadata with new fields
      metadata: {
        ...saveData.metadata,
        entityCount: (saveData.entities || []).length,
        npcCount: (saveData.entities || []).filter(e => e.type === 'npc').length,
        transactionCount: (saveData.transactions || []).length
      }
    };
  }
};

/**
 * Migrate save data to current version
 * @param {Object} saveData - Save data to migrate
 * @returns {Object} Migrated save data
 */
export function migrateSave(saveData) {
  let currentVersion = saveData.version;
  let data = saveData;

  // Apply migrations in order
  const versions = Object.keys(MIGRATIONS).sort(compareVersions);

  for (const version of versions) {
    if (compareVersions(currentVersion, version) < 0) {
      console.log(`[SaveManager] Applying migration: ${currentVersion} → ${version}`);
      data = MIGRATIONS[version](data);
      currentVersion = version;
    }
  }

  // Update version to current
  if (data.version !== SAVE_VERSION) {
    console.log(`[SaveManager] ✅ Migration complete: v${saveData.version} → v${SAVE_VERSION}`);
    data.version = SAVE_VERSION;
  }

  return data;
}

/**
 * Clean up legacy localStorage keys from old save system
 * Should be called once on first load of new save system
 * @returns {number} Number of keys removed
 */
export function cleanupLegacyStorage() {
  const legacyKeys = [
    'apothecaryGameState', // Old v1.0.0 key
    'apothecaryConversationHistory', // Old v1.0.0 key
    'apothecary_entities', // Now stored per-slot
    'npcPositions', // Now stored per-slot
    'apothecary_calendar_notes', // Now stored per-slot
    // Keep scenario-specific keys (they'll be cleaned up by scenario)
    // Keep merchant caches (they're intentionally ephemeral)
    // Keep UI preferences (theme, weather toggle)
  ];

  let removed = 0;

  legacyKeys.forEach(key => {
    if (safeLocalStorage.hasItem(key)) {
      console.log(`[SaveManager] Removing legacy key: ${key}`);
      if (safeLocalStorage.removeItem(key)) {
        removed++;
      }
    }
  });

  // Clean up old transaction keys (format: transactions_${scenarioId})
  const allKeys = safeLocalStorage.keys();
  allKeys.forEach(key => {
    if (key.startsWith('transactions_')) {
      console.log(`[SaveManager] Removing legacy transaction key: ${key}`);
      if (safeLocalStorage.removeItem(key)) {
        removed++;
      }
    }
  });

  if (removed > 0) {
    console.log(`[SaveManager] ✅ Cleaned up ${removed} legacy storage keys`);
  }

  return removed;
}

/**
 * Check if legacy cleanup is needed
 * @returns {boolean} True if legacy keys exist
 */
export function needsLegacyCleanup() {
  const legacyKeys = ['apothecaryGameState', 'apothecary_entities', 'npcPositions'];
  return legacyKeys.some(key => safeLocalStorage.hasItem(key));
}
