# Save System Refactor Plan

## Current Problems

### 1. Fragmented State (CRITICAL)
- **11 separate localStorage keys** for game state
- saveManager only includes 5 data types
- Missing: entities, NPC positions, books, notes, transactions

### 2. No Slot Isolation (DATA CORRUPTION RISK)
- Keys don't include slot ID: `apothecary_entities` is global
- Loading Slot 2 while Slot 1 data exists = corruption
- Example: Slot 1's NPCs appear in Slot 2

### 3. Missing Error Handling (CRASHES IN PRODUCTION)
- 13 of 26 localStorage calls have NO try-catch
- Private browsing mode = instant crash
- Storage quota exceeded = silent failure

### 4. Legacy Keys (MAINTENANCE DEBT)
- Old keys referenced: `apothecaryGameState`, `apothecaryConversationHistory`
- Not matching saveManager architecture

---

## Recommended Architecture

### Design Principle: "One Slot = One Complete State"

```
apothecary_save_slot_1/
├── gameState (existing)
├── playerSkills (existing)
├── conversationHistory (existing)
├── reputation (existing)
├── npcRelationships (existing)
├── entities (NEW - from initializeEntities.js)
├── npcPositions (NEW - from npcPositionTracker.js)
├── discoveredBooks (NEW - from GamePage.jsx)
├── calendarNotes (NEW - from DateTimeDropdown.jsx)
└── transactions (NEW - from transactionManager.js)
```

### Implementation Steps

#### Step 1: Extend saveManager.js (1 hour)

Add to `createSaveData()`:
```javascript
export function createSaveData({
  gameState,
  playerSkills,
  conversationHistory,
  reputation,
  npcRelationships,
  // NEW additions:
  entities,           // From entityManager.exportToJSON()
  npcPositions,       // From npcPositionTracker.getAllPositions()
  discoveredBooks,    // From GamePage state
  calendarNotes,      // From DateTimeDropdown state
  transactions,       // From transactionManager.getAll()
  slotName
}) {
  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    slotName,
    metadata: { ... },

    // Core game data (existing)
    gameState,
    playerSkills,
    conversationHistory,
    reputation,
    npcRelationships,

    // NEW: Extended game data
    entities,
    npcPositions,
    discoveredBooks,
    calendarNotes,
    transactions
  };
}
```

#### Step 2: Update All Systems to Use saveManager (3 hours)

**2a. Entity System Integration**
```javascript
// initializeEntities.js
export function loadEntitiesFromSave(entities) {
  entityManager.clear();
  entityManager.importFromJSON(entities);
}

// REMOVE: localStorage.setItem('apothecary_entities', ...)
// REMOVE: Auto-save callback (saveManager handles this)
```

**2b. NPC Position Tracker**
```javascript
// npcPositionTracker.js
export function getAllPositions() {
  return Array.from(positions.entries());
}

export function loadPositionsFromSave(positionData) {
  positions.clear();
  positionData.forEach(npc => positions.set(npc.npcId, npc));
}

// REMOVE: localStorage.setItem('npcPositions', ...)
```

**2c. Transaction Manager**
```javascript
// transactionManager.js
export function getTransactionsForSave() {
  return this.transactions;
}

export function loadTransactionsFromSave(transactions) {
  this.transactions = transactions;
}

// REMOVE: Disabled localStorage code (lines 313-323)
// ENABLE: Proper save integration
```

**2d. GamePage State**
```javascript
// Move discoveredBooks to saveManager
// REMOVE: localStorage.setItem('apothecary_discovered_books_${scenarioId}', ...)
```

**2e. DateTimeDropdown**
```javascript
// Pass calendarNotes to parent GamePage
// REMOVE: localStorage.setItem('apothecary_calendar_notes', ...)
```

#### Step 3: Add Global Error Handler (30 min)

Create `src/utils/safeLocalStorage.js`:
```javascript
/**
 * Safe localStorage wrapper with error handling
 */
export const safeLocalStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`[Storage] Failed to get ${key}:`, error);
      if (error.name === 'SecurityError') {
        alert('Storage access denied. Are you in private browsing mode?');
      }
      return null;
    }
  },

  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`[Storage] Failed to set ${key}:`, error);

      if (error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please delete old saves.');
      } else if (error.name === 'SecurityError') {
        alert('Storage access denied. Are you in private browsing mode?');
      }

      return false;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[Storage] Failed to remove ${key}:`, error);
      return false;
    }
  }
};
```

Replace all `localStorage.*` calls with `safeLocalStorage.*`.

#### Step 4: Migration System (2 hours)

Add to saveManager.js:
```javascript
const MIGRATIONS = {
  '1.0.0': (saveData) => saveData, // No changes
  '1.1.0': (saveData) => {
    // Add new fields with defaults
    return {
      ...saveData,
      entities: saveData.entities || [],
      npcPositions: saveData.npcPositions || [],
      discoveredBooks: saveData.discoveredBooks || [],
      calendarNotes: saveData.calendarNotes || {},
      transactions: saveData.transactions || []
    };
  }
};

export function migrateSave(saveData) {
  let currentVersion = saveData.version;
  let data = saveData;

  // Apply migrations in order
  const versions = Object.keys(MIGRATIONS).sort();
  for (const version of versions) {
    if (compareVersions(currentVersion, version) < 0) {
      console.log(`[SaveManager] Migrating from ${currentVersion} to ${version}`);
      data = MIGRATIONS[version](data);
      data.version = version;
      currentVersion = version;
    }
  }

  return data;
}
```

#### Step 5: Clean Up Legacy Keys (30 min)

Add migration helper:
```javascript
export function cleanupLegacyStorage() {
  const legacyKeys = [
    'apothecaryGameState',
    'apothecaryConversationHistory',
    'apothecary_entities', // Now per-slot
    'npcPositions', // Now per-slot
    // Merchant caches (keep these, they're intentionally ephemeral)
  ];

  legacyKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`[Migration] Removed legacy key: ${key}`);
    } catch (error) {
      console.warn(`[Migration] Failed to remove ${key}:`, error);
    }
  });
}
```

#### Step 6: Update SaveLoadModal UI (1 hour)

Add warnings:
- "Loading this save will overwrite all current progress"
- Show what's included: "Contains X NPCs, Y books, Z transactions"

---

## Timeline

- **Phase 1** (Step 1-2): 4 hours - Core refactor
- **Phase 2** (Step 3-4): 2.5 hours - Safety & migration
- **Phase 3** (Step 5-6): 1.5 hours - Cleanup & polish

**Total**: ~8 hours of development work

---

## Testing Checklist

- [ ] Save game in slot 1, load in slot 2 - no data leakage
- [ ] Save with entities, load - entities preserved
- [ ] Save with NPC positions, load - positions restored
- [ ] Save in private browsing mode - graceful error
- [ ] Fill localStorage quota - proper error message
- [ ] Load v1.0.0 save in v1.1.0 - migration works
- [ ] Delete save slot - all related data removed
- [ ] Export save - complete data included
- [ ] Import save - all data restored

---

## Benefits

1. **Data Integrity**: One slot = one complete game
2. **Reliability**: Proper error handling prevents crashes
3. **User Experience**: Load any slot anytime without corruption
4. **Maintainability**: Single source of truth for saves
5. **Debuggability**: All data in one place
6. **Future-proof**: Migration system for updates

---

## Breaking Changes

**For existing players:**
- Current saves will be migrated automatically
- Old loose localStorage data (entities, positions) will be cleaned up
- One-time migration message on first load

**For developers:**
- All systems must use saveManager for persistence
- Direct localStorage usage only for UI preferences
- Must participate in save/load cycle
