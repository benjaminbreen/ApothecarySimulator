# 🧪 Save System Manual Test Checklist

**Purpose**: Manual testing checklist for Phase 3 comprehensive testing
**Estimated Time**: 30-45 minutes
**Prerequisites**: Game running at http://localhost:3001

---

## 🎯 Pre-Test Setup

```bash
cd "/Users/benjaminbreen/code/Apothecary Simulator"
npm start
```

Open browser to: http://localhost:3001
Open browser console (Cmd+Option+J on Mac, F12 on Windows)

---

## ✅ TEST SUITE 1: BASIC SAVE/LOAD (5 minutes)

### Test 1.1: Create New Save
- [ ] Start new game
- [ ] Play for 5-10 turns (buy items, mix compound, accept patient)
- [ ] Open Save/Load modal (Cmd+S or menu)
- [ ] Save to **Slot 1** with name "Test Save 1"
- [ ] **Verify**: Save appears in slot list with correct metadata (turn, wealth, location)

### Test 1.2: Load Save
- [ ] Continue playing for 5 more turns
- [ ] Note current turn number and wealth
- [ ] Open Save/Load modal
- [ ] Load from **Slot 1**
- [ ] **Verify**: Game returns to earlier turn number
- [ ] **Verify**: Wealth matches Slot 1 (not current)
- [ ] **Verify**: Inventory matches Slot 1

### Test 1.3: Delete Save
- [ ] Open Save/Load modal
- [ ] Delete **Slot 1**
- [ ] Confirm deletion dialog
- [ ] **Verify**: Slot 1 shows as empty
- [ ] **Verify**: No orphaned data (check localStorage in console)

**Expected Result**: ✅ All basic save/load operations work

---

## ✅ TEST SUITE 2: MULTI-SLOT ISOLATION (10 minutes)

### Test 2.1: Create Multiple Saves
- [ ] Start new game (or continue existing)
- [ ] Play to turn 5, wealth 30 reales
- [ ] Save to **Slot 1** with name "Early Game"
- [ ] Play to turn 15, wealth 100 reales
- [ ] Save to **Slot 2** with name "Mid Game"
- [ ] Play to turn 25, wealth 200 reales
- [ ] Save to **Slot 3** with name "Late Game"

### Test 2.2: Verify Slot Independence
- [ ] Load **Slot 1**
- [ ] **Verify**: Turn 5, wealth 30 (not mixed with other slots)
- [ ] Load **Slot 2**
- [ ] **Verify**: Turn 15, wealth 100
- [ ] Load **Slot 3**
- [ ] **Verify**: Turn 25, wealth 200

**Expected Result**: ✅ All slots maintain independent game states

---

## ✅ TEST SUITE 3: CALENDAR NOTES (CRITICAL - v1.1.1) (10 minutes)

### Test 3.1: Calendar Notes in Slot 1
- [ ] Load **Slot 1** (or create new save)
- [ ] Click time/date dropdown in header
- [ ] Switch to Calendar view
- [ ] Click on August 25, 1680
- [ ] Write note: "**Note for Slot 1 only**"
- [ ] Wait 1 second (auto-save debounce)
- [ ] Close calendar
- [ ] Save game to **Slot 1**

### Test 3.2: Calendar Notes in Slot 2
- [ ] Load **Slot 2** (or create new save)
- [ ] Click time/date dropdown
- [ ] Click on August 26, 1680
- [ ] Write note: "**Note for Slot 2 only**"
- [ ] Close calendar
- [ ] Save game to **Slot 2**

### Test 3.3: Verify Notes Are Isolated (CRITICAL)
- [ ] Load **Slot 1**
- [ ] Open calendar
- [ ] Check August 25: **Should see "Note for Slot 1 only"** ✅
- [ ] Check August 26: **Should be EMPTY** (no Slot 2 note) ✅
- [ ] Load **Slot 2**
- [ ] Open calendar
- [ ] Check August 26: **Should see "Note for Slot 2 only"** ✅
- [ ] Check August 25: **Should be EMPTY** (no Slot 1 note) ✅

**Expected Result**: ✅ Calendar notes are properly isolated per slot (v1.1.1 fix working!)

---

## ✅ TEST SUITE 4: DATA INTEGRITY (10 minutes)

### Test 4.1: Inventory Persistence
- [ ] Create new game (or continue)
- [ ] Buy 3 specific items (note their names)
- [ ] Mix 1 compound (note recipe)
- [ ] Save to **Slot 1**
- [ ] Load **Slot 1**
- [ ] **Verify**: All 3 items present with correct quantities
- [ ] **Verify**: Compound present with correct recipe

### Test 4.2: Quest State Persistence
- [ ] Progress through a quest (if available)
- [ ] Note quest stage/completion status
- [ ] Save to **Slot 1**
- [ ] Load **Slot 1**
- [ ] **Verify**: Quest stage matches

### Test 4.3: NPC State Persistence
- [ ] Accept a patient (if available)
- [ ] Note patient name and condition
- [ ] Save to **Slot 1**
- [ ] Load **Slot 1**
- [ ] **Verify**: Patient still active with same condition

### Test 4.4: Health/Energy/Wealth Persistence
- [ ] Note exact values: Health ___, Energy ___, Wealth ___
- [ ] Save to **Slot 1**
- [ ] Load **Slot 1**
- [ ] **Verify**: All values match exactly

**Expected Result**: ✅ All game state preserved accurately

---

## ✅ TEST SUITE 5: EDGE CASES (5 minutes)

### Test 5.1: Empty Inventory
- [ ] Start new game
- [ ] Sell/consume all items until inventory empty
- [ ] Save to **Slot 1**
- [ ] Load **Slot 1**
- [ ] **Verify**: Inventory still empty (no crashes)

### Test 5.2: Overwrite Existing Save
- [ ] Load **Slot 1**
- [ ] Play for several more turns
- [ ] Save to **Slot 1** again (overwrite)
- [ ] Confirm overwrite
- [ ] Load **Slot 1**
- [ ] **Verify**: New data loaded (not old)

### Test 5.3: Multiple Rapid Saves
- [ ] Save to **Slot 1**
- [ ] Immediately save to **Slot 2**
- [ ] Immediately save to **Slot 3**
- [ ] Load each slot
- [ ] **Verify**: All slots work, no corruption

**Expected Result**: ✅ Edge cases handled gracefully

---

## ✅ TEST SUITE 6: AUTO-SAVE (5 minutes)

### Test 6.1: Auto-Save Trigger
- [ ] Start new game or load existing
- [ ] Play exactly 10 turns (watch turn counter)
- [ ] **Check console**: Should see "[SaveManager] ✅ Game saved to apothecary_autosave"
- [ ] Open Save/Load modal
- [ ] **Verify**: Autosave slot shows recent save

### Test 6.2: Auto-Save Restoration
- [ ] Close game tab entirely
- [ ] Reopen game
- [ ] Open Save/Load modal
- [ ] Load from **Autosave** slot
- [ ] **Verify**: Game resumes from last auto-save

**Expected Result**: ✅ Auto-save triggers and restores correctly

---

## ✅ TEST SUITE 7: CONSOLE CHECKS (5 minutes)

### Test 7.1: No Deprecation Warnings
- [ ] Reload page
- [ ] **Check console**: Should NOT see any warnings about:
  - "loadFromStorage() is deprecated"
  - "saveToStorage() is deprecated"
- [ ] **Expected**: Clean console (or only expected logs)

### Test 7.2: Save/Load Logging
- [ ] Save to Slot 1
- [ ] **Check console**: Should see:
  - "[SaveManager] ✅ Game saved to apothecary_save_slot_1"
  - "[SaveManager] Save includes: X entities, Y transactions, Z books"
- [ ] Load from Slot 1
- [ ] **Check console**: Should see:
  - "[SaveManager] ✅ Game loaded from apothecary_save_slot_1"
  - "[SaveManager] Version: 1.1.1, Turn: X"

### Test 7.3: NPC Position Logging
- [ ] Reload page
- [ ] **Check console**: Should NOT see "deprecated" warnings
- [ ] **Expected**: Clean initialization

**Expected Result**: ✅ All console output clean and informative

---

## ✅ TEST SUITE 8: MIGRATION TESTING (Advanced - Optional)

### Test 8.1: Create v1.0.0 Save (Simulated)
**Note**: This requires manual localStorage manipulation

```javascript
// Run in browser console:
const v100Save = {
  version: '1.0.0',
  timestamp: Date.now(),
  slotName: 'Test v1.0.0',
  metadata: { scenarioId: '1680-mexico-city', turnNumber: 5 },
  gameState: { /* minimal game state */ },
  playerSkills: { level: 1 },
  conversationHistory: [],
  reputation: { overall: 50 },
  npcRelationships: {}
  // Missing: entities, npcPositions, calendarNotes, transactions
};

localStorage.setItem('apothecary_save_slot_1', JSON.stringify(v100Save));
console.log('Created fake v1.0.0 save in Slot 1');
```

- [ ] Reload page
- [ ] Open Save/Load modal
- [ ] Load from **Slot 1**
- [ ] **Check console**: Should see migration messages:
  - "[SaveManager] Migrating save from v1.0.0 to v1.1.0"
  - "[SaveManager] ✅ Migration complete: vX → v1.1.1"
- [ ] **Verify**: Game loads without errors
- [ ] Save to Slot 1 again
- [ ] **Verify**: Now saved as v1.1.1

**Expected Result**: ✅ Old saves migrate automatically

---

## 📊 TEST SUMMARY

### Pass Criteria
- [ ] All basic save/load operations work
- [ ] Multiple slots maintain independence
- [ ] **Calendar notes are isolated per slot** (CRITICAL)
- [ ] All game state fields preserved accurately
- [ ] Edge cases handled gracefully
- [ ] Auto-save triggers correctly
- [ ] Console is clean (no deprecation warnings)
- [ ] Migrations work (if tested)

### Final Checks
- [ ] No crashes during testing
- [ ] No data loss observed
- [ ] No console errors (except expected)
- [ ] UI remains responsive after save/load
- [ ] Game continues to work after multiple operations

---

## 🐛 Issue Reporting

If any test fails, note:
1. **Test ID**: (e.g., Test 3.3)
2. **Expected**: What should happen
3. **Actual**: What actually happened
4. **Console**: Any error messages
5. **Steps**: Exact steps to reproduce

---

## ✅ COMPLETION

When all tests pass:
- [ ] Mark this checklist complete
- [ ] Proceed to Phase 3 report
- [ ] Consider Phase 4 (Polish) or Phase 5 (Docs)

**Estimated Total Time**: 30-45 minutes
**Last Updated**: November 10, 2024
