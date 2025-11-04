/**
 * Save Manager Service
 * Handles saving and loading game state to/from localStorage
 * Supports multiple save slots (3 manual + 1 autosave)
 */

const SAVE_VERSION = '1.0.0';
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
 * @param {string} params.slotName - Custom name for this save
 * @returns {Object} Save data ready for storage
 */
export function createSaveData({
  gameState,
  playerSkills,
  conversationHistory = [],
  reputation = null,
  npcRelationships = {},
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
      time: gameState.time || 'Unknown'
    },

    // Core game data
    gameState,
    playerSkills,
    conversationHistory: trimmedHistory,
    reputation,
    npcRelationships
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
  try {
    const jsonData = JSON.stringify(saveData);
    localStorage.setItem(slotKey, jsonData);
    console.log(`[SaveManager] Game saved to ${slotKey}`);
    return true;
  } catch (error) {
    console.error(`[SaveManager] Failed to save game to ${slotKey}:`, error);

    // Check if localStorage is full
    if (error.name === 'QuotaExceededError') {
      console.error('[SaveManager] localStorage quota exceeded. Try deleting old saves.');
    }

    return false;
  }
}

/**
 * Load game from a specific slot
 *
 * @param {string} slotKey - Save slot key
 * @returns {Object|null} Save data or null if not found/invalid
 */
export function loadGame(slotKey) {
  try {
    const jsonData = localStorage.getItem(slotKey);

    if (!jsonData) {
      console.log(`[SaveManager] No save found at ${slotKey}`);
      return null;
    }

    const saveData = JSON.parse(jsonData);

    // Validate save data
    if (!saveData.version || !saveData.gameState) {
      console.error(`[SaveManager] Invalid save data at ${slotKey}`);
      return null;
    }

    // Check version compatibility (for future migrations)
    if (saveData.version !== SAVE_VERSION) {
      console.warn(`[SaveManager] Save version mismatch: ${saveData.version} vs ${SAVE_VERSION}`);
      // TODO: Add version migration logic here in future
    }

    console.log(`[SaveManager] Game loaded from ${slotKey}`);
    return saveData;
  } catch (error) {
    console.error(`[SaveManager] Failed to load game from ${slotKey}:`, error);
    return null;
  }
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
