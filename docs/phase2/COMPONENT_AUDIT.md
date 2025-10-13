# Component Usage Audit - Phase 2

**Date**: October 10, 2025
**Purpose**: Determine which components are ACTUALLY used vs deprecated
**Status**: Complete

---

## Methodology

Searched for:
1. Component imports in GamePage.jsx and other pages
2. Actual JSX rendering (< Component> tags)
3. CSS file imports

---

## Results

### ✅ ACTIVELY USED - Must Convert

| Component | Used By | Rendered | CSS File | Priority |
|---|---|---|---|---|
| **WealthTracker** | GamePage | Yes (hidden, parses LLM) | WealthTracker.css | HIGH |
| **CounterNarrative** | GamePage | No (imported but not rendered) | CounterNarrative.css | SKIP |
| **HomePage** | React Router | Yes | HomePage.css | MEDIUM |

### ❌ NOT USED - Deprecated/Orphaned

| Component | Status | Reason | Action |
|---|---|---|---|
| **LoadingIndicator** | Used by CounterNarrative & CritiqueAgent | CounterNarrative not rendered; CritiqueAgent unknown | SKIP - deprecated |
| **NotificationPopup** | Imported but NOT rendered | No JSX found in GamePage | SKIP - use ToastNotification instead |
| **ScenarioSelector** | Orphaned | Has its own CSS but HomePage doesn't use it | SKIP - deprecated |

---

## Phase 2 Revised Plan

### Convert These Only:

1. **WealthTracker** (HIGH PRIORITY)
   - File: `src/features/character/components/WealthTracker.js`
   - CSS: `src/WealthTracker.css` (208 lines)
   - Used in: GamePage.jsx (hidden div, parses LLM responses)
   - Complexity: MEDIUM
   - **Action**: Convert to Tailwind

2. **HomePage** (MEDIUM PRIORITY)
   - File: `src/pages/HomePage.jsx`
   - CSS: `src/pages/HomePage.css` (315 lines)
   - Used in: React Router
   - Complexity: LOW (card grid, landing page)
   - **Action**: Convert to Tailwind

### Mark as Deprecated (DO NOT CONVERT):

3. **LoadingIndicator**
   - Not currently in active use path
   - CounterNarrative not rendered
   - **Action**: Leave as-is, document as deprecated

4. **NotificationPopup**
   - Replaced by ToastNotification system
   - Imported but never rendered
   - **Action**: Remove import from GamePage, document as deprecated

5. **ScenarioSelector.css**
   - Orphaned CSS file
   - HomePage doesn't use it
   - **Action**: Can be deleted

6. **CounterNarrative**
   - Imported but not rendered in GamePage
   - **Action**: Leave as-is, document as deprecated

---

## Updated Phase 2 Scope

**Original**: 12 components, ~1,800 lines CSS
**Revised**: 2 components, ~523 lines CSS

### Benefits of Smaller Scope:
- ✅ Faster completion (30-60 min vs 2-3 hours)
- ✅ Lower risk (only touch what's used)
- ✅ Easier testing (2 components vs 12)
- ✅ Can proceed to Phase 3 quickly

---

## Conversion Order

### 1. WealthTracker (30 min)
- Convert component to Tailwind
- Remove WealthTracker.css
- Test: Verify LLM parsing still works (check console logs)
- **Risk**: LOW (hidden component, only affects parsing)

### 2. HomePage (30 min)
- Convert HomePage.jsx to Tailwind
- Remove HomePage.css
- Test: Visit localhost:3000, verify landing page looks good
- **Risk**: LOW (standalone page, not part of game loop)

---

## Testing Plan (Simplified)

### After WealthTracker:
- [ ] Start game
- [ ] Take 5 actions
- [ ] Check console for wealth/status updates
- [ ] No errors

### After HomePage:
- [ ] Visit homepage (/)
- [ ] Scenario cards display correctly
- [ ] Images load
- [ ] Hover effects work
- [ ] Click scenario → navigates to game
- [ ] Responsive on mobile

---

## Files to Delete After Phase 2

```bash
# Safe to delete after conversion:
rm src/WealthTracker.css
rm src/pages/HomePage.css

# Consider deleting (deprecated/unused):
rm src/LoadingIndicator.css
rm src/NotificationPopup.css
rm src/CounterNarrative.css
rm src/components/ScenarioSelector.css

# Remove unused imports:
# From GamePage.jsx: NotificationPopup
```

---

## Next Steps After Phase 2

**Phase 3** will focus on actively used modals:
- Sleep, Buy, Mixing, Prescribe, Quest
- Inventory, Journal, Diagnose
- Map, GameIntro

These are ALL actively rendered in GamePage, so Phase 3 is critical.

---

**Status**: ✅ Audit Complete
**Revised Scope**: 2 components instead of 12
**Estimated Time**: 1 hour instead of 2-3 hours
**Next**: Convert WealthTracker
