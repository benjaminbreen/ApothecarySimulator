# GamePage State Dependency Graph - Phase 1 Audit

**Date**: October 10, 2025
**Status**: Complete
**Total State Variables**: 47 in GamePage.jsx

---

## Executive Summary

GamePage.jsx currently manages **47 state variables** directly, leading to:
- ❌ Prop drilling (passing state 5+ levels deep)
- ❌ Difficult testing (must mock entire GamePage)
- ❌ Hard to reason about data flow
- ❌ Tightly coupled components

**Solution** (Phase 5):
- Extract to Context providers
- Create specialized hooks
- Reduce GamePage to ~100 lines

---

## State Variables Inventory

### ✅ Already Extracted (Via useGameState Hook)

**Good news**: The most complex state is already in a custom hook!

```javascript
const {
  gameState,          // { inventory, compounds, time, date, location, quests, etc. }
  updateInventory,
  updateLocation,
  addCompoundToInventory,
  generateNewItemDetails,
  startQuest,
  advanceTime,
  refreshInventory,
  lastAddedItem,
  clearLastAddedItem,
  unlockMethod,
  setGameState,
  unlockedMethods
} = useGameState(scenarioId);
```

**Used By**: Nearly every component
**Migration**: Already done ✅ - Can be wrapped in Context in Phase 5

---

## State Categories & Extraction Strategy

### Category 1: Core Game State (✅ DONE - useGameState)

| Variable | Type | Description | Used By |
|---|---|---|---|
| `gameState` | Object | Inventory, compounds, time, date, location, quests | ALL |
| `updateInventory` | Function | Modify inventory | Buy, Mixing, Prescribe |
| `addCompoundToInventory` | Function | Add created compounds | Mixing |
| `advanceTime` | Function | Progress time | Sleep, turn processing |

**Extraction Status**: ✅ Already in `src/core/state/gameState.js`
**Phase 5 Action**: Wrap in Context provider, no changes needed

---

### Category 2: Resource State (Extract to useResources)

| Variable | Type | Init Value | Description | Used By |
|---|---|---|---|---|
| `health` | number | 85 | Player health (0-100) | CharacterStats, ResourceManager |
| `energy` | number | 62 | Player energy (0-100) | CharacterStats, all actions |
| `currentWealth` | number | 11 | Money in reales | CharacterStats, Buy, WealthTracker |
| `mariaStatus` | string | 'rested' | Status text | CharacterStats, PortraitSection |
| `reputationEmoji` | string | '😐' | Reputation | CharacterStats |
| `activeEffects` | array | [] | Buffs/debuffs | CharacterStats, Sleep, Eat |
| `consecutiveLowEnergyTurns` | number | 0 | Track exhaustion | ResourceManager |

**Extraction Plan** (Phase 5):
```javascript
// src/pages/GamePage/hooks/useResources.js
export const useResources = () => {
  const [health, setHealth] = useState(85);
  const [energy, setEnergy] = useState(62);
  const [wealth, setWealth] = useState(11);
  const [status, setStatus] = useState('rested');
  const [reputation, setReputation] = useState('😐');
  const [activeEffects, setActiveEffects] = useState([]);

  const applyResourceChanges = useCallback((action, modifiers) => {
    // Resource calculation logic from lines 279-357
  }, [energy, health, wealth]);

  return {
    health, energy, wealth, status, reputation, activeEffects,
    setHealth, setEnergy, setWealth, setStatus, setReputation,
    applyResourceChanges
  };
};
```

**Used By**:
- CharacterStats (display)
- ResourceManager (calculations)
- Sleep, Eat, Mixing (resource changes)
- All action handlers

---

### Category 3: Modal State (Extract to useModalOrchestrator)

**Current**: 15 boolean states for modals

| Variable | Type | Init | Description | Component |
|---|---|---|---|---|
| `isJournalOpen` | bool | false | Journal modal | Journal |
| `isInventoryOpen` | bool | false | Old inventory | InventoryPane |
| `isModernInventoryOpen` | bool | false | New inventory | ModernInventoryPanel |
| `isHistoryOpen` | bool | false | Game log | GameLog |
| `isAboutOpen` | bool | false | About page | About |
| `isMapOpen` | bool | false | Map view | Map |
| `isDiagnoseOpen` | bool | false | Diagnosis | Diagnose |
| `isGameIntroOpen` | bool | true | Intro screen | GameIntro |
| `isGameLogOpen` | bool | false | Turn log | GameLog |
| `isSettingsOpen` | bool | false | Settings | SettingsModal |
| `showMixingPopup` | bool | false | Mixing workshop | MixingWorkshop |
| `showSymptomsPopup` | bool | false | Symptoms list | Symptoms |
| `isPrescribePopupOpen` | bool | false | Prescribe | PrescribePopup |
| `isBuyOpen` | bool | false | Buy modal | Buy |
| `isSleepOpen` | bool | false | Sleep modal | Sleep |
| `isEatOpen` | bool | false | Eat action | EatAction |
| `isForageOpen` | bool | false | Forage modal | ForageAction |
| `isPdfOpen` | bool | false | PDF viewer | PDFPopup |
| `showEndGamePopup` | bool | false | Game over | EndGamePopup |
| `showPatientModal` | bool | false | Patient exam | NPCPatientModal |
| `showItemModal` | bool | false | Item details | ItemModal |
| `showEquipmentModal` | bool | false | Equipment | EquipmentModal |

**Total: 22 modal boolean states!**

**Extraction Plan** (Phase 5):
```javascript
// src/pages/GamePage/hooks/useModalOrchestrator.js
export const useModalOrchestrator = () => {
  const [modals, setModals] = useState({
    journal: { isOpen: false, props: {} },
    inventory: { isOpen: false, props: {} },
    modernInventory: { isOpen: false, props: {} },
    map: { isOpen: false, props: {} },
    mixing: { isOpen: false, props: {} },
    prescribe: { isOpen: false, props: {} },
    buy: { isOpen: false, props: {} },
    sleep: { isOpen: false, props: {} },
    eat: { isOpen: false, props: {} },
    forage: { isOpen: false, props: {} },
    diagnose: { isOpen: false, props: {} },
    patientModal: { isOpen: false, props: {} },
    itemModal: { isOpen: false, props: {} },
    equipmentModal: { isOpen: false, props: {} },
    pdf: { isOpen: false, props: {} },
    endGame: { isOpen: false, props: {} },
    about: { isOpen: false, props: {} },
    settings: { isOpen: false, props: {} },
    history: { isOpen: false, props: {} },
    gameLog: { isOpen: false, props: {} },
    gameIntro: { isOpen: true, props: {} }, // Only one open by default
  });

  const openModal = useCallback((modalName, props = {}) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { isOpen: true, props }
    }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { isOpen: false, props: {} }
    }));
  }, []);

  const closeAll = useCallback(() => {
    setModals(prev =>
      Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: { isOpen: false, props: {} }
      }), {})
    );
  }, []);

  return { modals, openModal, closeModal, closeAll };
};
```

**New Usage**:
```javascript
// Instead of:
setIsPrescribePopupOpen(true);
setCurrentPatient(patient);

// Use:
openModal('prescribe', { patient });

// In ModalOrchestrator component:
{modals.prescribe.isOpen && (
  <PrescribePopup
    onClose={() => closeModal('prescribe')}
    {...modals.prescribe.props}
  />
)}
```

---

### Category 4: UI State (Keep in GamePage - Minor)

| Variable | Type | Init | Description | Used By |
|---|---|---|---|---|
| `mobileTab` | string | 'character' | Mobile nav tab | MobileBottomNav |
| `incorporatedContent` | string | '' | Temp notification | NotificationPopup |
| `showIncorporatePopup` | bool | false | Temp notification | NotificationPopup |

**Extraction Plan**: Keep in GamePage (simple UI state)

---

### Category 5: Turn/Narrative State (Extract to useGameLoop)

| Variable | Type | Init | Description | Used By |
|---|---|---|---|---|
| `userInput` | string | '' | Player input text | InputArea |
| `conversationHistory` | array | [] | Turn history | NarrativePanel, LLM |
| `historyOutput` | string | '' | ?? (appears unused) | ?? |
| `isLoading` | bool | false | Turn processing | NarrativePanel, InputArea |
| `turnNumber` | number | 1 | Current turn | Journal, orchestrator |
| `npcTracker` | NPCTracker | new NPCTracker(5) | NPC appearance tracking | EntityAgent |

**Extraction Plan** (Phase 5):
```javascript
// src/pages/GamePage/hooks/useGameLoop.js
export const useGameLoop = (gameState, resources) => {
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [turnNumber, setTurnNumber] = useState(1);
  const [npcTracker] = useState(() => new NPCTracker(5));

  const handleSubmit = useCallback(async (e) => {
    // Lines 502-791 from current GamePage
    // Turn processing logic
  }, [gameState, resources, turnNumber]);

  return {
    userInput,
    setUserInput,
    conversationHistory,
    setConversationHistory,
    isLoading,
    turnNumber,
    setTurnNumber,
    npcTracker,
    handleSubmit
  };
};
```

---

### Category 6: NPC/Portrait State (Extract to useNPCInteraction)

| Variable | Type | Init | Description | Used By |
|---|---|---|---|---|
| `npcImage` | string | '' | Current NPC portrait | ContextPanel |
| `npcCaption` | string | "Maria's..." | Portrait caption | ContextPanel |
| `npcInfo` | string | "Maria's..." | Portrait info | ContextPanel |
| `selectedNpcName` | string | '' | Selected NPC | Various modals |
| `currentPatient` | object | null | Current patient | PrescribePopup |
| `selectedPatient` | object | null | Selected patient | NPCPatientModal |
| `selectedItem` | object | null | Selected item | ItemModal |

**Extraction Plan** (Phase 5):
```javascript
// src/pages/GamePage/hooks/useNPCInteraction.js
export const useNPCInteraction = () => {
  const [npcImage, setNpcImage] = useState('');
  const [npcCaption, setNpcCaption] = useState("Maria's apothecary shop");
  const [npcInfo, setNpcInfo] = useState("Maria's apothecary...");
  const [selectedNpcName, setSelectedNpcName] = useState('');
  const [currentPatient, setCurrentPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  return {
    npcImage, setNpcImage,
    npcCaption, setNpcCaption,
    npcInfo, setNpcInfo,
    selectedNpcName, setSelectedNpcName,
    currentPatient, setCurrentPatient,
    selectedPatient, setSelectedPatient,
    selectedItem, setSelectedItem
  };
};
```

---

### Category 7: Map State (Extract to useMapState)

| Variable | Type | Init | Description | Used By |
|---|---|---|---|---|
| `playerPosition` | object | { x, y, gridX, gridY } | Player coords | Map |
| `currentMapData` | object | null | Current map | Map |
| `currentMapId` | string | 'botica-...' | Map ID | Map |
| `npcPositions` | object | from hook | NPC positions | Map |
| `setNPCPosition` | function | from hook | Set NPC pos | Map |
| `moveNPC` | function | from hook | Move NPC | Map |
| `initializeNPCs` | function | from hook | Init NPCs | Map |
| `refreshNPCPositions` | function | from hook | Refresh | Map |

**Extraction Plan**: Already partially done with `useNPCPositions` hook
**Phase 5 Action**: Consolidate into useMapState, pass to Map component only

---

### Category 8: Journal State (Extract to useJournal)

| Variable | Type | Init | Description | Used By |
|---|---|---|---|---|
| `journal` | array | [] | Journal entries | Journal |
| `customJournalEntry` | string | '' | Input text | Journal |

**Extraction Plan**:
```javascript
// src/pages/GamePage/hooks/useJournal.js
export const useJournal = () => {
  const [journal, setJournal] = useState([]);
  const [customJournalEntry, setCustomJournalEntry] = useState('');

  const addJournalEntry = useCallback((entry) => {
    setJournal(prev => [...prev, entry]);
  }, []);

  return {
    journal,
    customJournalEntry,
    setCustomJournalEntry,
    addJournalEntry
  };
};
```

---

### Category 9: Quest/Game Flow State (useGameState - Already Done)

| Variable | Type | Init | Description | Used By |
|---|---|---|---|---|
| `gameOver` | bool | false | Game ended | EndGamePopup |
| `gameAssessment` | string | '' | End game text | EndGamePopup |
| `commandsDetected` | object | {...} | Parsed commands | Turn processing |
| `summaryData` | object | {...} | Time/date/loc | Turn processing |
| `additionalQuestions` | string | '' | ?? (unused?) | ?? |
| `userActions` | array | [] | ?? (unused?) | ?? |

**Extraction Plan**: Some may be unused, can be removed or kept in useGameLoop

---

### Category 10: Prescription State (Can be in useModalOrchestrator props)

| Variable | Type | Init | Description | Used By |
|---|---|---|---|---|
| `isPrescribing` | bool | false | Prescription mode | PrescribePopup |
| `currentPrescriptionType` | string | null | Type of prescription | PrescribePopup |
| `selectedPDF` | string | null | PDF to show | PDFPopup |
| `selectedCitation` | string | null | Citation | PDFPopup |

**Extraction Plan**: Pass as props when opening modals
```javascript
openModal('prescribe', {
  isPrescribing: true,
  prescriptionType: 'tincture',
  patient: currentPatient
});
```

---

## State Dependency Matrix

### HIGH COUPLING (Used by 10+ components)

| State | Component Count | Strategy |
|---|---|---|
| `gameState` | 25+ | ✅ Already in hook, wrap in Context |
| `energy` | 15+ | Extract to ResourceContext |
| `health` | 15+ | Extract to ResourceContext |
| `currentWealth` | 12+ | Extract to ResourceContext |
| `conversationHistory` | 10+ | Extract to GameLoopContext |

### MEDIUM COUPLING (Used by 5-9 components)

| State | Component Count | Strategy |
|---|---|---|
| Modal states | 8+ each | Extract to ModalOrchestrator |
| `turnNumber` | 6 | Extract to GameLoopContext |
| `activeEffects` | 5 | Extract to ResourceContext |

### LOW COUPLING (Used by 1-4 components)

| State | Component Count | Strategy |
|---|---|---|
| NPC portrait state | 2-3 | Extract to useNPCInteraction |
| Journal state | 2 | Extract to useJournal |
| Map state | 1 (Map component) | Already extracted, consolidate |

---

## Component Dependency Graph

### How State Flows Currently (PROP DRILLING)

```
GamePage (47 state variables)
  ├─> Header (1 prop)
  ├─> CharacterStats (10 props)
  │     ├─> health, energy, wealth, status, reputation
  │     ├─> activeEffects, conversationHistory
  │     └─> onOpenEquipment
  ├─> NarrativePanel (5 props)
  │     ├─> conversationHistory, isLoading
  │     └─> onClick handlers
  ├─> InputArea (6 props)
  │     ├─> userInput, setUserInput
  │     ├─> handleSubmit, disabled
  │     └─> onQuickAction, onItemDrop
  ├─> ContextPanel (15 props) ← WORST OFFENDER
  │     ├─> location, locationDetails
  │     ├─> onActionClick, recentNPCs
  │     ├─> scenario, npcs, playerPosition
  │     └─> onLocationChange, onPortraitClick
  ├─> MobileBottomNav (2 props)
  ├─> ModalOrchestrator (30+ props) ← DOESN'T EXIST YET
  │     ├─> All modal states (22 booleans)
  │     ├─> All modal props (patient, item, etc.)
  │     └─> All close handlers (22 functions)
  └─> Sleep, Buy, Mixing, etc. (8-15 props each)
```

**Total Props Passed**: ~150+

---

### How State Will Flow After Phase 5 (CONTEXT)

```
<GameStateProvider>  ← gameState, inventory, time, etc.
  <ResourceProvider>  ← health, energy, wealth, effects
    <ModalProvider>  ← modal orchestrator
      <GamePageLayout>  ← just layout, no state
        ├─> CharacterStats (uses ResourceContext)
        ├─> NarrativePanel (uses GameLoopContext)
        ├─> InputArea (uses GameLoopContext)
        ├─> ContextPanel (uses GameStateContext)
        └─> ModalOrchestrator (uses ModalContext)
              ├─> Sleep (accesses contexts directly)
              ├─> Buy (accesses contexts directly)
              └─> Mixing (accesses contexts directly)
```

**Total Props Passed**: ~20 (95% reduction)

---

## Phase 5 Extraction Roadmap

### Step 1: Create Context Providers (Low Risk)
```
src/core/context/
├── GameStateContext.jsx  ← Wrap useGameState hook
├── ResourceContext.jsx   ← NEW
└── ModalContext.jsx      ← NEW
```

### Step 2: Create Hooks (Medium Risk)
```
src/pages/GamePage/hooks/
├── useResources.js        ← Extract lines 279-357
├── useModalOrchestrator.js ← Replace 22 boolean states
├── useGameLoop.js         ← Extract lines 502-791 (handleSubmit)
├── useNPCInteraction.js   ← Extract NPC portrait state
└── useJournal.js          ← Extract journal state
```

### Step 3: Update GamePage (High Risk)
- Remove all state declarations
- Import contexts
- Pass contexts to components
- Test EVERYTHING

### Step 4: Update Components (Medium Risk)
- Remove prop drilling
- Use contexts directly
- Test each component

---

## Migration Checklist for Phase 5

**Before Starting:**
- [ ] Commit current working state
- [ ] Create backup branch
- [ ] Document all state dependencies (THIS DOCUMENT ✅)

**For Each Hook:**
- [ ] Create hook file
- [ ] Move state variables
- [ ] Move related functions
- [ ] Add useCallback/useMemo as needed
- [ ] Test hook in isolation (if possible)

**For Each Context:**
- [ ] Create context file
- [ ] Create provider component
- [ ] Add to GamePage provider tree
- [ ] Test that context is accessible

**After All Extraction:**
- [ ] Full game playthrough (20+ turns)
- [ ] Test all modals
- [ ] Test all actions
- [ ] Verify no console errors
- [ ] Check for memory leaks

---

## Risk Mitigation

### HIGH RISK Areas

1. **handleSubmit** (lines 502-791)
   - Most complex logic
   - Touches everything
   - Risk: Breaking turn processing
   - Mitigation: Extract last, test extensively

2. **Resource Management** (lines 279-357)
   - Complex calculations
   - Affects health/energy
   - Risk: Resource bugs
   - Mitigation: Copy logic exactly, don't refactor yet

3. **Modal Orchestrator**
   - Replacing 22 boolean states
   - Risk: Modal doesn't open/close
   - Mitigation: One modal at a time, test each

### MEDIUM RISK Areas

4. **NPC Tracking**
   - EntityAgent integration
   - Risk: NPCs don't appear correctly
   - Mitigation: Keep NPCTracker instance, just move it

5. **Map State**
   - Player/NPC positions
   - Risk: Map breaks
   - Mitigation: Already partially extracted, just consolidate

---

## Success Criteria

**Phase 5 is complete when:**
- ✅ GamePage.jsx < 500 lines (from 1,468)
- ✅ All state in hooks/contexts
- ✅ Zero prop drilling (components use contexts)
- ✅ All 47 state variables accounted for
- ✅ 100% feature parity - nothing broken
- ✅ No console errors
- ✅ Full game playthrough successful

---

**Status**: ✅ Phase 1 Complete - State dependencies mapped
**Next Step**: Proceed to Phase 2 (CSS conversion)
**Phase 5 Ready**: This document provides complete roadmap for state extraction
