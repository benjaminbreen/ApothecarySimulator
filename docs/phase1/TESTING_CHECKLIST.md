# Testing Checklist Templates - Phase 1 Audit

**Date**: October 10, 2025
**Purpose**: Standardized testing procedures for each migration phase
**Status**: Complete

---

## Master Testing Strategy

### Testing Pyramid

```
        Unit Tests (None - React Components)
              /\
             /  \
            /    \
           /      \
          /--------\
         Integration Tests (None - Full App)
        /            \
       /--------------\
      /                \
     /------------------\
    Manual E2E Testing ← WE ARE HERE
```

**Our Approach**: Comprehensive manual testing
**Why**: React components + game logic = hard to unit test, E2E is more practical

---

## Phase-Specific Checklists

### Phase 2: Non-Critical Components CSS Conversion

#### Pre-Testing Setup
- [ ] **Take screenshot** of each component before conversion
- [ ] **Note current behavior** (animations, interactions)
- [ ] **Check browser** (Chrome, Firefox, Safari)
- [ ] **Verify git status** - commit before starting

#### Visual Regression Checks

**For EACH converted component:**

**LoadingIndicator**
- [ ] Spinner appears when loading
- [ ] Animation is smooth (not jittery)
- [ ] Correct size (not too big/small)
- [ ] Correct colors (botanical green)
- [ ] Centered properly
- [ ] Light mode: looks good
- [ ] Dark mode: looks good (if Phase 4 done)

**WealthTracker**
- [ ] Displays correct wealth value
- [ ] Gradient background looks good
- [ ] Text is readable
- [ ] Hover states work (if any)
- [ ] Animation when wealth changes
- [ ] Light/dark mode

**NotificationPopup**
- [ ] Appears in correct position (top-right)
- [ ] Slide-in animation works
- [ ] Auto-dismiss after timeout
- [ ] Can be manually dismissed (if X button)
- [ ] Doesn't block gameplay
- [ ] Light/dark mode

**HistoricalContextCard**
- [ ] Text is readable
- [ ] Images display correctly
- [ ] Hover effects work
- [ ] Can be dismissed
- [ ] Light/dark mode

**RelationshipBar**
- [ ] Progress bar fills correctly
- [ ] Colors match relationship level
- [ ] NPC name displays
- [ ] Tooltip shows on hover (if any)
- [ ] Light/dark mode

**SkillRadialProgress**
- [ ] SVG renders correctly
- [ ] Progress animates smoothly
- [ ] Correct colors
- [ ] Center text displays
- [ ] Light/dark mode

**ScenarioSelector** (HomePage)
- [ ] Cards display in grid
- [ ] Images load
- [ ] Hover effects work
- [ ] Click navigates correctly
- [ ] Responsive on mobile
- [ ] Light/dark mode

#### Functional Testing (Phase 2)

**Integration Tests:**
- [ ] Start new game → LoadingIndicator appears
- [ ] Complete turn → NotificationPopup shows (if triggered)
- [ ] Check wealth → WealthTracker updates correctly
- [ ] View relationships → RelationshipBar shows correctly
- [ ] Open About → HistoricalContextCard displays

**No Regressions:**
- [ ] No console errors
- [ ] No visual glitches
- [ ] No broken layouts
- [ ] All animations smooth
- [ ] Mobile responsive (if applicable)

---

### Phase 3: Modals & Dialogs CSS Conversion

#### Pre-Testing Setup
- [ ] **Video record** modal open/close (for animation comparison)
- [ ] **Test all 15+ modals** before starting
- [ ] **Document any existing bugs** (don't blame new code for old bugs)
- [ ] **Commit before each modal conversion**

#### Modal-Specific Tests

**Sleep Modal**
- [ ] Opens on #sleep command or action button
- [ ] Displays dream imagery correctly
- [ ] Dream text is readable
- [ ] Buttons work (Confirm sleep, Cancel)
- [ ] Confirms sleep → time advances, energy restores
- [ ] Backdrop blur works
- [ ] Click outside to close (if enabled)
- [ ] Escape key closes
- [ ] Animation smooth (fade-in/out)
- [ ] Light/dark mode

**Buy Modal**
- [ ] Opens on #buy command or action button
- [ ] Item list displays correctly
- [ ] Filters work (if any)
- [ ] Search works (if any)
- [ ] Can add items to cart
- [ ] Price calculates correctly
- [ ] Confirm purchase → wealth decreases, inventory updates
- [ ] Cancel works
- [ ] Not enough money → shows error
- [ ] Light/dark mode

**Mixing Workshop**
- [ ] Opens on #mix command or action button
- [ ] Methods display correctly (Distill, Decoct, etc.)
- [ ] Ingredients list shows player inventory
- [ ] **CRITICAL**: Drag-and-drop works
  - [ ] Can drag ingredient from list
  - [ ] Can drop onto method
  - [ ] Visual feedback during drag
  - [ ] Drop zone highlights correctly
- [ ] Mix button enables when valid
- [ ] Mix button disabled when invalid
- [ ] Confirm mix → creates compound
- [ ] Compound added to inventory
- [ ] Ingredients consumed from inventory
- [ ] Energy deducted correctly
- [ ] Cancel doesn't consume resources
- [ ] Animations smooth (glowing effect, etc.)
- [ ] Light/dark mode

**PrescribePopup**
- [ ] Opens when prescribing to patient
- [ ] Patient info displays correctly
- [ ] Can select medicine from inventory
- [ ] Can specify dosage
- [ ] Can specify route (oral, topical, etc.)
- [ ] Form validation works
- [ ] Submit → medicine prescribed, inventory updates
- [ ] Cancel doesn't prescribe
- [ ] Light/dark mode

**Quest Modal**
- [ ] Opens when quest triggers
- [ ] Banner image displays correctly
- [ ] Quest text is readable
- [ ] Choice buttons display correctly
- [ ] Click choice → quest progresses
- [ ] Quest completion works
- [ ] Rewards granted (if any)
- [ ] Backdrop is dark (rgba(0,0,0,0.8))
- [ ] Close button works (if dismissible)
- [ ] Animation is smooth (fade-in)
- [ ] Light/dark mode

**Diagnose Modal**
- [ ] Opens when examining patient
- [ ] Patient symptoms display
- [ ] Body map shows correctly (if any)
- [ ] Can add notes (if feature exists)
- [ ] Close works
- [ ] Light/dark mode

**Symptoms Modal**
- [ ] Opens from patient examination
- [ ] Symptoms list displays
- [ ] Severity indicators show
- [ ] Can be dismissed
- [ ] Light/dark mode

**Journal Modal**
- [ ] Opens when clicking journal
- [ ] Past entries display in order
- [ ] Can scroll through entries
- [ ] Can add custom entry (if feature)
- [ ] Close works
- [ ] Light/dark mode

**Inventory Modal** (old version)
- [ ] Opens on #inventory command
- [ ] Items display in grid/list
- [ ] Item quantities correct
- [ ] Can click item to see details
- [ ] Close works
- [ ] Light/dark mode

**ModernInventoryPanel** (new version)
- [ ] Opens when toggled
- [ ] Categories display correctly
- [ ] Items grouped properly
- [ ] Search works (if any)
- [ ] Filter works (if any)
- [ ] Drag to input area works (if feature)
- [ ] Close works
- [ ] Light/dark mode

**Map Modal**
- [ ] Opens on #map command or action
- [ ] SVG map renders correctly
- [ ] Player position marker shows
- [ ] NPC markers show
- [ ] Can click locations (if interactive)
- [ ] Close works
- [ ] Light/dark mode

**GameIntro Modal**
- [ ] Shows on first game load
- [ ] Scenario description displays
- [ ] Images load correctly
- [ ] Start button works
- [ ] Animation smooth
- [ ] Light/dark mode

**About Modal**
- [ ] Opens from header/menu
- [ ] About text displays
- [ ] Links work (if any)
- [ ] Close works
- [ ] Light/dark mode

**Settings Modal**
- [ ] Opens from header/menu
- [ ] Settings display correctly
- [ ] Can change settings (API keys, etc.)
- [ ] Save works
- [ ] Cancel doesn't save
- [ ] Close works
- [ ] Light/dark mode

**PDF Popup**
- [ ] Opens when clicking PDF link
- [ ] PDF loads correctly
- [ ] Can scroll through PDF
- [ ] Citation displays
- [ ] Close works
- [ ] Light/dark mode

#### Critical Modal Integration Tests

**Modal Stacking:**
- [ ] Open Sleep → open Journal from within → both display correctly
- [ ] Close order is correct (LIFO - last in, first out)
- [ ] Z-index stacking works (no overlaps)

**Modal + Game State:**
- [ ] Open Buy → buy item → close → inventory updates in main view
- [ ] Open Mix → create compound → close → compound in inventory
- [ ] Open Sleep → sleep → close → time updated in UI
- [ ] Open Prescribe → prescribe → close → patient healed

**Performance:**
- [ ] Open/close 10 modals rapidly → no lag
- [ ] Open modal with 100 items (Buy) → no lag
- [ ] Drag 10 ingredients in Mixing → no lag

---

### Phase 4: Core UI + Dark Mode

#### Pre-Testing Setup
- [ ] **Take full-page screenshots** in light mode
- [ ] **Document all colors** currently used
- [ ] **Test toggle mechanism** before implementing dark mode
- [ ] **Commit before starting**

#### Light Mode Testing

**After converting CharacterStats:**
- [ ] Portrait displays correctly
- [ ] Health bar correct color (green gradient)
- [ ] Energy bar correct color (purple gradient)
- [ ] Wealth displays correctly
- [ ] Status badge correct color
- [ ] Reputation emoji shows
- [ ] Faction bars display correctly
- [ ] Effects tab shows effects
- [ ] Log tab shows history
- [ ] All text readable
- [ ] Hover states work
- [ ] Click portrait → modal opens

**After converting ContextPanel:**
- [ ] Action buttons display correctly
- [ ] Icons show correctly
- [ ] Hover states work (green highlight)
- [ ] Click action → triggers correctly
- [ ] Viewport panel switches tabs (Map/Portrait/Weather)
- [ ] Map displays correctly
- [ ] NPC portrait shows when NPC present
- [ ] Weather tab displays

**After converting NarrativePanel:**
- [ ] Conversation history displays
- [ ] Entity highlighting works (red=patient, green=NPC, purple=item)
- [ ] Can click highlighted entity → modal opens
- [ ] Scrolling works smoothly
- [ ] Text is readable
- [ ] Loading skeleton shows when processing

**After converting InputArea:**
- [ ] Text input works
- [ ] Quick action buttons work
- [ ] Enter key submits
- [ ] Drag-drop into input works (if feature)
- [ ] Disabled state shows correctly

**After converting Header:**
- [ ] Logo/title displays
- [ ] Navigation works
- [ ] Settings button works
- [ ] Dark mode toggle appears (if added)

#### Dark Mode Testing

**Dark Mode Toggle:**
- [ ] Toggle button displays correctly
- [ ] Click toggle → switches to dark mode
- [ ] Dark mode persists on page reload
- [ ] Click again → switches back to light
- [ ] Transition is smooth (not jarring)

**For EVERY Component (Test in Dark Mode):**

**CharacterStats**
- [ ] Background is dark (ink-900)
- [ ] Text is light (parchment-50/100)
- [ ] Borders are visible (ink-700)
- [ ] Health bar visible
- [ ] Energy bar visible
- [ ] Wealth text readable
- [ ] All text has good contrast (WCAG AA minimum)

**ContextPanel**
- [ ] Background dark
- [ ] Action buttons visible
- [ ] Icons visible
- [ ] Hover state clearly different
- [ ] Viewport panel dark
- [ ] Map visible in dark mode
- [ ] NPC portrait visible

**NarrativePanel**
- [ ] Background dark
- [ ] Text light and readable
- [ ] Entity highlights still visible and distinct
  - [ ] Patients (red) still clear
  - [ ] NPCs (green) still clear
  - [ ] Items (purple) still clear
- [ ] Scrollbar visible

**InputArea**
- [ ] Input background dark
- [ ] Input text light
- [ ] Placeholder text visible
- [ ] Border visible
- [ ] Focus state visible
- [ ] Quick action buttons visible

**Header**
- [ ] Background dark
- [ ] Text light
- [ ] Buttons visible
- [ ] Logo/title readable

**Modals (Test Random Sample in Dark Mode):**
- [ ] Sleep modal dark theme
- [ ] Buy modal dark theme
- [ ] Mixing modal dark theme
- [ ] Quest modal dark theme (may keep dark always)

#### Contrast Testing

**Use Browser DevTools Accessibility Inspector:**
- [ ] All text meets WCAG AA contrast ratio (4.5:1 for normal text)
- [ ] All icons/buttons meet WCAG AA (3:1 for large text/icons)
- [ ] No invisible text (white on white, black on black)
- [ ] No unreadable color combinations

#### Cross-Browser Testing

**Test in 3 browsers (Light + Dark mode each):**
- [ ] Chrome/Edge - Light mode
- [ ] Chrome/Edge - Dark mode
- [ ] Firefox - Light mode
- [ ] Firefox - Dark mode
- [ ] Safari - Light mode
- [ ] Safari - Dark mode

#### Responsive Testing

**Test at 3 viewport sizes (Light + Dark each):**
- [ ] Desktop (1920x1080) - Light
- [ ] Desktop (1920x1080) - Dark
- [ ] Tablet (768px) - Light
- [ ] Tablet (768px) - Dark
- [ ] Mobile (375px) - Light
- [ ] Mobile (375px) - Dark

---

### Phase 5: GamePage State Extraction (CRITICAL)

#### Pre-Testing Setup
- [ ] **Full backup** of working game
- [ ] **Document every function** that touches state
- [ ] **Create test save file** to load
- [ ] **Video record** full playthrough before changes

#### State Extraction Testing (Per Hook)

**After creating useResources hook:**
- [ ] Health displays correctly
- [ ] Energy displays correctly
- [ ] Wealth displays correctly
- [ ] Resource changes work:
  - [ ] Eat → energy increases
  - [ ] Sleep → energy restores
  - [ ] Action → energy decreases
  - [ ] Low energy → health decreases
- [ ] Status updates correctly
- [ ] Reputation updates correctly
- [ ] Active effects display
- [ ] No console errors

**After creating useModalOrchestrator hook:**
- [ ] EVERY modal still opens correctly (test all 15+)
- [ ] EVERY modal still closes correctly
- [ ] Modal props passed correctly:
  - [ ] Prescribe gets patient
  - [ ] Buy gets available items
  - [ ] Sleep gets current time
- [ ] Multiple modals can open (if allowed)
- [ ] ESC key still closes modals
- [ ] Click outside still closes (if enabled)
- [ ] No console errors

**After creating useGameLoop hook:**
- [ ] Turn processing works
- [ ] Player input submitted correctly
- [ ] LLM response received
- [ ] Conversation history updates
- [ ] Narrative displays correctly
- [ ] Loading state shows
- [ ] Turn number increments
- [ ] NPC tracking works (portraits appear)
- [ ] Commands detected (#sleep, #buy, etc.)
- [ ] Inventory updates on turn
- [ ] Time advances on turn
- [ ] No console errors

**After creating useNPCInteraction hook:**
- [ ] NPC portrait displays when NPC appears
- [ ] Caption shows correctly
- [ ] Can click portrait → modal opens
- [ ] Current patient tracked correctly
- [ ] Selected item tracked correctly
- [ ] No console errors

**After creating useJournal hook:**
- [ ] Journal displays past entries
- [ ] Can add custom entry
- [ ] Entries show correct date/turn
- [ ] Journal persists across sessions (localStorage)
- [ ] No console errors

#### Full Integration Testing (Phase 5)

**Complete Game Playthrough (30+ turns):**
- [ ] Start new game
- [ ] Complete intro
- [ ] Take 5 actions
- [ ] Buy items (modal)
- [ ] Mix compound (modal)
- [ ] Prescribe medicine (modal)
- [ ] Sleep (modal)
- [ ] Examine patient (modal)
- [ ] Check map (modal)
- [ ] View journal (modal)
- [ ] Check inventory (modal)
- [ ] Open About (modal)
- [ ] Open Settings (modal)
- [ ] Change settings
- [ ] Continue playing 10+ turns
- [ ] Save game
- [ ] Reload page
- [ ] Load game
- [ ] Continue playing 10+ turns
- [ ] Trigger quest
- [ ] Complete quest
- [ ] Reach low energy
- [ ] Reach low health
- [ ] Recover resources
- [ ] Accumulate wealth
- [ ] Spend wealth
- [ ] Reach game over (if possible)
- [ ] No crashes
- [ ] No console errors
- [ ] No visual glitches

**Edge Cases:**
- [ ] Spam click actions → no duplicate processing
- [ ] Open 10 modals rapidly → no crashes
- [ ] Low memory device → no lag
- [ ] Slow network → LLM calls timeout gracefully
- [ ] Invalid save data → doesn't crash

---

### Phase 6: Component Split + Final Polish

#### Pre-Testing Setup
- [ ] **Confirm Phase 5 is stable** (no known bugs)
- [ ] **Video record** final pre-split playthrough
- [ ] **Document file structure** before split

#### After Component Split

**GamePage.jsx (should be ~100 lines):**
- [ ] Only contains providers
- [ ] Renders GamePageLayout
- [ ] No state management
- [ ] No business logic
- [ ] Clean and readable

**GamePageLayout.jsx:**
- [ ] Renders all main components
- [ ] Uses contexts correctly
- [ ] No prop drilling
- [ ] Responsive layout works
- [ ] Clean and readable

**ModalOrchestrator.jsx:**
- [ ] All 15+ modals rendered
- [ ] Conditional rendering works
- [ ] Props passed correctly
- [ ] Close handlers work
- [ ] Z-index stacking works
- [ ] Clean and readable

#### Final Comprehensive Test

**Full Regression Test:**
- [ ] Everything from Phase 5 integration test ☝
- [ ] PLUS additional 10 turns
- [ ] PLUS test ALL features not yet tested
- [ ] PLUS performance check (no lag)
- [ ] PLUS memory check (no leaks)
- [ ] PLUS bundle size check (not significantly larger)

**Code Quality Checks:**
- [ ] No unused imports
- [ ] No console.logs (except intentional debug)
- [ ] No commented-out code
- [ ] No TODOs left unresolved
- [ ] All files have proper headers
- [ ] ESLint passes (if configured)
- [ ] Prettier formatting (if configured)

---

## Master Acceptance Criteria

### Phase 2 Complete When:
- [ ] All 12 component CSS files converted
- [ ] All components visually identical
- [ ] No console errors
- [ ] Full playthrough successful

### Phase 3 Complete When:
- [ ] All 10 modal CSS files converted
- [ ] All modals open/close correctly
- [ ] All form submissions work
- [ ] Drag-drop preserved
- [ ] Full playthrough successful

### Phase 4 Complete When:
- [ ] All core UI converted to Tailwind
- [ ] Dark mode fully functional
- [ ] Both modes tested extensively
- [ ] Contrast ratios pass WCAG AA
- [ ] ~90% of App.css removed
- [ ] Full playthrough in both modes successful

### Phase 5 Complete When:
- [ ] All state extracted from GamePage
- [ ] All contexts working
- [ ] All hooks working
- [ ] GamePage < 500 lines
- [ ] 100% feature parity
- [ ] No console errors
- [ ] Full playthrough (30+ turns) successful

### Phase 6 Complete When:
- [ ] GamePage < 150 lines
- [ ] Component structure clear
- [ ] Zero custom CSS files
- [ ] Dark mode perfect
- [ ] All features working
- [ ] Full regression test passed

---

## Emergency Stop Criteria

**STOP IMMEDIATELY if:**
- ❌ Game crashes
- ❌ Data loss occurs
- ❌ Turn processing breaks
- ❌ Save/load breaks
- ❌ Critical modal won't open (Sleep, Buy, Mix)
- ❌ Console filled with errors
- ❌ Visual corruption (layout completely broken)

**When stopped:**
1. **Don't panic** - git has your back
2. **Document the issue** - screenshot, console log, steps to reproduce
3. **Rollback** - use git revert or git checkout
4. **Diagnose** - figure out what went wrong
5. **Fix or skip** - fix the issue or skip that change
6. **Resume** - continue from last good state

---

## Post-Migration Verification

**After ALL 6 phases complete:**

**Final Checklist:**
- [ ] CSS: 10,049 lines → 0 lines ✅
- [ ] GamePage: 1,468 lines → ~100 lines ✅
- [ ] Dark mode: Incomplete → Complete ✅
- [ ] State management: Prop drilling → Contexts ✅
- [ ] Maintainability: Hard → Easy ✅
- [ ] 100% feature parity ✅
- [ ] No known bugs ✅

**Celebration:**
- [ ] Commit final changes
- [ ] Push to main
- [ ] Tag release (v2.0.0-refactored)
- [ ] Update CLAUDE.md with completion date
- [ ] Pat yourself on the back 🎉

---

**Status**: ✅ Phase 1 Complete - Testing procedures documented
**Next Step**: Begin Phase 2 CSS conversion
**Use These Checklists**: For every phase to ensure quality
