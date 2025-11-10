# GamePage.jsx Calendar Notes Migration Guide

**Purpose**: Complete the calendar notes per-slot storage migration (v1.1.1)
**Status**: DateTimeDropdown and Header already updated, GamePage needs 4 changes

---

## Changes Required

### 1. Add Calendar Notes State (Near Top of Component)

**Location**: Add after other state declarations (around line 180-200)

```javascript
// v1.1.1: Calendar notes state (per-slot storage)
const [calendarNotes, setCalendarNotes] = useState({});
```

---

### 2. Update Auto-Save Function (Line ~1444-1462)

**Current Code** (lines 1455-1458):
```javascript
// Get calendar notes from localStorage (stored by DateTimeDropdown)
const calendarNotesJSON = safeLocalStorage.getItem('apothecary_calendar_notes');
const calendarNotes = calendarNotesJSON ? JSON.parse(calendarNotesJSON) : {};
```

**Change To**:
```javascript
// v1.1.1: Use calendar notes from state (per-slot storage)
// No need to read from localStorage anymore
```

**Also Update** (line 1461):
```javascript
// OLD
const { autoSave, createSaveData } = require('../core/services/saveManager');

// Change the createSaveData call to use state:
const saveData = createSaveData({
  gameState,
  playerSkills,
  conversationHistory,
  reputation,
  npcRelationships,
  entities: exportEntitiesForSave(),
  npcPositions: npcPositionTracker.exportForSave(),
  discoveredBooks: getDocuments().filter(d => d.discovered),
  calendarNotes: calendarNotes, // ← Use state instead of reading localStorage
  transactions: transactionManager.exportForSave()
});
```

---

### 3. Update Load Save Function (Line ~3024-3040)

**Current Code** (lines 3033-3035):
```javascript
// Store calendar notes in localStorage for DateTimeDropdown to load
const calendarNotesJSON = JSON.stringify(loadedSaveData.calendarNotes || {});
safeLocalStorage.setItem('apothecary_calendar_notes', calendarNotesJSON);
```

**Change To**:
```javascript
// v1.1.1: Restore calendar notes to state (per-slot storage)
setCalendarNotes(loadedSaveData.calendarNotes || {});
// No longer write to global localStorage
```

---

### 4. Pass Props to Header Component

**Location**: Find where `<Header ... />` is rendered (search for "Header" component)

**Add These Props**:
```javascript
<Header
  // ... existing props
  calendarNotes={calendarNotes}
  onCalendarNotesChange={setCalendarNotes}
/>
```

---

## Testing Checklist

After making these changes:

- [ ] Start new game → Write calendar note → Save to Slot 1
- [ ] Load Slot 1 → Verify note appears
- [ ] Write different note → Save to Slot 2
- [ ] Load Slot 1 → Verify original note (not Slot 2's note)
- [ ] Load Slot 2 → Verify second note (not Slot 1's note)
- [ ] ✅ Success: Notes are now per-slot!

---

## Migration Behavior

**For Old Saves (v1.0.0 or v1.1.0)**:
- Migration v1.1.1 will import global calendar notes into each save
- After first load, global `apothecary_calendar_notes` key is ignored
- Each slot now has its own independent notes

**For New Saves (v1.1.1)**:
- Calendar notes stored in save data
- No global localStorage pollution
- Proper multi-slot isolation

---

## Legacy Cleanup (Optional)

After confirming all saves work:

```javascript
// Add to GamePage useEffect on mount:
useEffect(() => {
  // Clean up legacy global calendar notes after migration
  if (safeLocalStorage.hasItem('apothecary_calendar_notes')) {
    console.log('[GamePage] Removing legacy global calendar notes key');
    safeLocalStorage.removeItem('apothecary_calendar_notes');
  }
}, []); // Run once on mount
```

This can be added after v1.1.1 is stable (give users a few weeks to migrate).

---

**Status**: Ready to implement
**Estimated Time**: 10-15 minutes
**Breaking Change**: Yes (requires save version bump to v1.1.1) ✅ Already done in saveManager.js
