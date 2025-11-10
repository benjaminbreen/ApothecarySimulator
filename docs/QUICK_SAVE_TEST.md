# 🚀 Quick Save System Verification

**Purpose**: 5-minute quick test to verify save system is working
**Time**: ~5 minutes

---

## Method 1: Browser Console Test (Fastest)

1. **Start game**:
```bash
cd "/Users/benjaminbreen/code/Apothecary Simulator"
npm start
```

2. **Open browser** to http://localhost:3001

3. **Open console** (Cmd+Option+J on Mac, F12 on Windows)

4. **Run quick test**:
```javascript
// Quick Save System Test
(async function quickTest() {
  console.log('🧪 Running Quick Save System Test...\n');

  // Import saveManager functions
  const { createSaveData, saveGame, loadGame, deleteSave } = await import('./src/core/services/saveManager.js');

  // Create test save data
  const testData = createSaveData({
    gameState: {
      turnNumber: 999,
      location: 'Test Location',
      wealth: 12345
    },
    playerSkills: { level: 10 },
    calendarNotes: { '1680-08-25': 'Test note for quick test' },
    slotName: 'Quick Test Save'
  });

  // Test 1: Save
  console.log('Test 1: Saving to slot...');
  const saveSuccess = saveGame('apothecary_save_slot_1', testData);
  console.log(saveSuccess ? '✅ Save successful' : '❌ Save failed');

  // Test 2: Load
  console.log('\nTest 2: Loading from slot...');
  const loaded = loadGame('apothecary_save_slot_1');
  console.log(loaded ? '✅ Load successful' : '❌ Load failed');

  if (loaded) {
    console.log('\nTest 3: Verify data integrity...');
    const checks = {
      'Turn number': loaded.gameState.turnNumber === 999,
      'Location': loaded.gameState.location === 'Test Location',
      'Wealth': loaded.gameState.wealth === 12345,
      'Calendar note': loaded.calendarNotes['1680-08-25'] === 'Test note for quick test',
      'Version': loaded.version === '1.1.1'
    };

    Object.entries(checks).forEach(([name, passed]) => {
      console.log(passed ? `✅ ${name}` : `❌ ${name}`);
    });

    const allPassed = Object.values(checks).every(v => v);
    console.log(`\n${allPassed ? '🎉 ALL CHECKS PASSED!' : '⚠️ SOME CHECKS FAILED'}`);
  }

  // Test 4: Delete
  console.log('\nTest 4: Deleting test save...');
  const deleteSuccess = deleteSave('apothecary_save_slot_1');
  console.log(deleteSuccess ? '✅ Delete successful' : '❌ Delete failed');

  console.log('\n✅ Quick test complete!');
})();
```

**Expected Output**:
```
🧪 Running Quick Save System Test...

Test 1: Saving to slot...
[SaveManager] ✅ Game saved to apothecary_save_slot_1
✅ Save successful

Test 2: Loading from slot...
[SaveManager] ✅ Game loaded from apothecary_save_slot_1
✅ Load successful

Test 3: Verify data integrity...
✅ Turn number
✅ Location
✅ Wealth
✅ Calendar note
✅ Version

🎉 ALL CHECKS PASSED!

Test 4: Deleting test save...
✅ Delete successful

✅ Quick test complete!
```

---

## Method 2: In-Game Test (5 minutes)

### Quick Manual Test
1. Start new game
2. Play 2-3 turns
3. **Write calendar note**: Open date/time dropdown → Calendar → August 25 → "Test note 1"
4. **Save to Slot 1**: Cmd+S → Save to Slot 1 → Name "Test 1"
5. Play 2 more turns
6. **Write calendar note**: August 26 → "Test note 2"
7. **Save to Slot 2**: Save to Slot 2 → Name "Test 2"
8. **Load Slot 1**: Load from Slot 1
9. **Check calendar**: Open calendar → August 25 should have "Test note 1"
10. **Check calendar**: August 26 should be EMPTY (not "Test note 2")
11. **Load Slot 2**: Load from Slot 2
12. **Check calendar**: August 26 should have "Test note 2"
13. **Check calendar**: August 25 should be EMPTY (not "Test note 1")

**✅ PASS**: If calendar notes are isolated per slot
**❌ FAIL**: If notes appear in wrong slots (data mixing)

---

## Method 3: Console Verification (1 minute)

Just check for errors/warnings:

```javascript
// Check for deprecation warnings
console.log('Checking for deprecation warnings...');

// Reload page and watch console
location.reload();

// After reload, should NOT see:
// - "loadFromStorage() is deprecated"
// - "saveToStorage() is deprecated"
// ✅ Clean console = working!
```

---

## Method 4: localStorage Inspection (Advanced)

```javascript
// Inspect localStorage structure
console.log('Save slots:', Object.keys(localStorage).filter(k => k.startsWith('apothecary_save')));

// View a specific save
const slot1 = JSON.parse(localStorage.getItem('apothecary_save_slot_1'));
if (slot1) {
  console.log('Slot 1 version:', slot1.version);
  console.log('Slot 1 turn:', slot1.metadata.turnNumber);
  console.log('Slot 1 calendar notes:', Object.keys(slot1.calendarNotes).length);
}
```

---

## ✅ Success Criteria

Quick test passes if:
- [x] Save operation succeeds
- [x] Load operation succeeds
- [x] Data integrity maintained (turn, wealth, location)
- [x] Calendar notes preserved
- [x] Version is 1.1.1
- [x] Delete operation succeeds
- [x] No console errors or warnings

---

## 🐛 If Test Fails

1. Check console for error messages
2. Verify Phase 2 changes were applied:
   - `saveManager.js` version is 1.1.1
   - `npcPositionTracker.js` has no deprecated method calls
   - `DateTimeDropdown.jsx` has callback props
   - `GamePage.jsx` has calendarNotes state

3. Run full manual test checklist (MANUAL_TEST_CHECKLIST.md)

---

**Last Updated**: November 10, 2024
