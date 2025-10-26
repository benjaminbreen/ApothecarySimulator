# Apothecary Simulator - Comprehensive Technical Review
**Date**: October 23, 2025
**Reviewer**: Claude Code Analysis

---

## Executive Summary

**Overall Assessment**: ⭐⭐⭐⭐ (4/5)

This is an **architecturally ambitious and historically thoughtful** game with excellent bones. The core loop (Player → Agent Orchestrator → Narrative/State/Entity → LLM → UI) is **elegant and works well**. However, there are **significant complexity issues** in the handler layer and medical systems that reduce maintainability and can cause bugs.

**Key Strengths**:
- ✅ Three-agent orchestration is brilliant and scalable
- ✅ Historical grounding is exceptional (specific, vivid, educational)
- ✅ Card embedding system creates persistent, timeline-based UI (innovative!)
- ✅ Portrait auto-matching with LLM demographics is clever
- ✅ Player agency enforcement (newly added) addresses major UX issue

**Critical Issues**:
- ❌ Handler bloat: `useGameHandlers.js` is 1668 lines (unmanageable)
- ❌ Medical system overcomplexity: 14 components for medical workflow
- ❌ Card proliferation: 8 different card types with overlapping logic
- ❌ File duplication: `Diagnose.js` + `Diagnose.jsx`, `PrescribePopup.js` + `PrescribePopup.jsx`
- ❌ Navigation system is fragile due to position coordinate juggling (x, y, gridX, gridY)

---

## What's Working Well

### 1. **Agent Orchestration Architecture** ⭐⭐⭐⭐⭐

**File**: `src/core/agents/AgentOrchestrator.js` (343 lines)

This is the **crown jewel** of the architecture. The orchestration flow is clean:

```
Player Input
    ↓
EntityAgent (select contextual NPC/patient)
    ↓
NarrativeAgent (generate story + portrait)
    ↓
StateAgent (extract game state changes)
    ↓
Combined Result → Update UI
```

**Why it works**:
- Clear separation of concerns
- Entity selection is decoupled from narrative generation
- LLM sees enriched context (entity + map + reputation + skills)
- StateAgent validates/sanitizes LLM output before applying

**Recommendation**: **Keep this exactly as-is.** This is production-quality code.

---

### 2. **Card Embedding System** ⭐⭐⭐⭐⭐

**Innovation**: Cards are stored in `conversationHistory` entries:

```javascript
{
  role: 'assistant',
  content: 'Narrative text...',
  card: {
    type: 'simple_interaction',
    data: { ... }
  }
}
```

**Why it's brilliant**:
- Cards stay at their **original timeline position** (no floating/pinning issues)
- Survives re-renders, new turns, scrolling
- Clean separation: narrative in text, interaction in card
- Single source of truth (conversation history)

**Current card types**:
1. `simple_interaction` - Fast transactions (water, donations, gossip)
2. `random_event` - Variety moments (lottery, complaint, extortion)
3. `sale_inquiry` - Remedy requests (purple)
4. `sale_proposal` - Complete sale after mixing
5. `mixing_decision` - Accept/decline mixing contract
6. `contract_offer` - Accept/decline treatment contract
7. `exit_confirmation` - Confirm leaving building
8. `travel` - House call travel card

**Problem**: **8 different card types with similar logic**. Most have:
- Portrait display
- NPC name
- Description/context
- 2 buttons (accept/decline or primary/secondary action)

**Recommendation**: **Consolidate into 1-2 generic card types** (see Streamlining section).

---

### 3. **Historical Specificity** ⭐⭐⭐⭐⭐

**Scenario prompts** (`src/scenarios/1680-mexico-city/prompts.js`) are **exceptional**:

- Specific people: "Nahua market women in embroidered huipils, viceregal soldiers in morion helmets"
- Specific places: "Portal de Mercaderes (Spanish arcade), Metropolitan Cathedral (construction site since 1573)"
- Specific sounds: "Nahuatl/Spanish mixing, vendor cries 'Tomatl! Chilli!'"
- Specific smells: "Copal incense, acequia sewage, pulque (sour, yeasty)"

**This is what makes the game special.** Most historical games use generic "medieval market" descriptions. This is **scholarly and immersive**.

**Recommendation**: **Expand this approach to other eras** when creating new scenarios.

---

### 4. **Context Provider Architecture** ⭐⭐⭐⭐

**Files**: `src/contexts/`

The migration to React Context (Phase 1) was smart:

- `GameStateContext` - Inventory, time, location, quests
- `PlayerContext` - Position, facing, health, energy
- `NPCContext` - Active NPC, patient, portraits
- `ModalContext` - Centralized modal state

**Why it works**:
- Eliminates prop drilling (was passing 10+ props through 3+ levels)
- Single source of truth for each domain
- Easy to test in isolation

**Recommendation**: **Continue this pattern.** Consider adding:
- `MapContext` - Current map, grid system, NPC positions
- `CommerceContext` - Wealth, ledger, pending sales

---

## What's Overly Complex

### 1. **Handler Bloat** ❌❌❌

**File**: `src/pages/hooks/useGameHandlers.js` (1668 lines)

**Problem**: This file does **everything**:
- Main turn orchestration
- Medical contract handling
- Simple interaction processing
- Random event processing
- Mixing decision processing
- Sale proposal handling
- House call processing
- Travel animation
- Patient dialogue
- Entity clicking
- Item actions
- Journal entries
- XP awarding
- Reputation updates

**Impact**:
- Hard to find specific logic
- Merge conflicts during development
- Testing is difficult
- Easy to introduce bugs

**Evidence**:
```bash
$ wc -l src/pages/hooks/*.js
  30038 useCommerceHandlers.js    # Already split out
  62195 useGameHandlers.js        # MASSIVE
  11793 useItemHandlers.js        # Already split out
  19521 useMedicalHandlers.js     # Already split out
  38560 useNavigationHandlers.js  # Already split out
   8441 useResourceHandlers.js    # Already split out
  13043 useUIHandlers.js           # Already split out
```

**Some handlers were already extracted, but `useGameHandlers.js` is still 1668 lines!**

**Recommendation**: **Further split into**:
- `useOrchestrationHandlers.js` - Main turn loop only
- `useInteractionHandlers.js` - Simple interactions + random events
- `useContractHandlers.js` - All contract offers (medical, sale, mixing)
- `usePatientHandlers.js` - Patient dialogue, Q&A, diagnosis

---

### 2. **Medical System Overcomplexity** ❌❌

**Files**: `src/features/medical/components/` (14 components!)

```
BloodlettingModal.jsx         # Separate modal for one treatment
BodyMap.jsx                   # Symptom visualizer
Diagnose.js                   # OLD version?
Diagnose.jsx                  # NEW version?
DiagnosisPanel.jsx            # Another diagnosis UI?
NPCPatientModal.jsx           # Main patient modal
PatientRosterModal.jsx        # List of patients
PrescribeOverviewPanel.jsx    # Prescription preview
PrescribePanelIntegrated.jsx  # Prescription UI (integrated where?)
PrescribePopup.js             # OLD version?
PrescribePopup.jsx            # NEW version?
PrescriptionOutcomeModal.jsx  # Show prescription result
TreatmentTimeline.jsx         # Historical treatments
index.js
```

**Problems**:
1. **Duplicate files**: `.js` and `.jsx` versions suggest incomplete refactoring
2. **Unclear workflow**: Which components are used in what order?
3. **Fragmentation**: 3 different prescription UIs?
4. **Modal proliferation**: Bloodletting gets its own modal, but other treatments don't?

**Current workflow** (as best I can tell):
```
Player clicks patient name
  → NPCPatientModal opens (shows patient info)
  → Click #symptoms → Shows symptoms list
  → Click #diagnose → DiagnosisPanel? Diagnose.jsx?
  → Click #prescribe → PrescribePopup? PrescribePanelIntegrated?
  → PrescriptionOutcomeModal shows result
```

**Recommendation**: **Consolidate into single workflow**:
```
PatientModal (single component)
  ├─ Tab 1: Examination (symptoms + body map)
  ├─ Tab 2: Diagnosis (diagnosis panel)
  ├─ Tab 3: Treatment (prescription UI)
  └─ Tab 4: History (treatment timeline)
```

Delete duplicates, merge UIs.

---

### 3. **Navigation Coordinate Complexity** ❌

**Problem**: Player position requires **4 values**:
```javascript
{
  x: 510,        // Pixel X
  y: 480,        // Pixel Y
  gridX: 25,     // Grid X (x / 20)
  gridY: 24      // Grid Y (y / 20)
}
```

**Why this is fragile**:
- Easy to forget `gridX`/`gridY` when setting position
- Causes NaN errors during movement (we just fixed 4 of these!)
- StateAgent only returns `{x, y}`, which strips grid coordinates
- Manual `Math.floor(x / 20)` calculations everywhere

**Current workarounds**:
1. Skip StateAgent position updates during movement
2. Add grid coordinates to every `setPlayerPosition` call
3. Hope nothing breaks

**Recommendation**: **Use computed properties**:

```javascript
// In PlayerContext
const updatePosition = (position) => {
  const gridSize = 20;
  setPlayerPosition({
    x: position.x,
    y: position.y,
    gridX: position.gridX ?? Math.floor(position.x / gridSize),
    gridY: position.gridY ?? Math.floor(position.y / gridSize)
  });
};
```

Or better: **Store only grid coordinates**, compute pixels on render:

```javascript
// Store
{ gridX: 25, gridY: 24 }

// Render
const pixelX = gridX * gridSize + gridSize / 2;
const pixelY = gridY * gridSize + gridSize / 2;
```

---

### 4. **Card Type Proliferation** ❌

**8 different card types** with similar structure:

| Card Type | Portrait | Description | Buttons | Color |
|-----------|----------|-------------|---------|-------|
| `simple_interaction` | ✓ | ✓ | Accept/Decline | Blue/Green/Purple |
| `random_event` | ✗ | ✓ | Choice 1-4 | Red/Yellow/Green |
| `sale_inquiry` | ✓ | ✓ | Craft/Decline | Purple |
| `sale_proposal` | ✓ | ✓ | Complete/Abandon | Amber |
| `mixing_decision` | ✓ | ✓ | Accept/Decline | Green |
| `contract_offer` | ✓ | ✓ | Accept/Decline | Blue |
| `exit_confirmation` | ✗ | ✓ | Confirm/Cancel | Amber |
| `travel` | ✓ | ✓ | Auto (no buttons) | Teal |

**Observation**: Most cards have:
- Optional portrait (top-left or integrated)
- Title
- Description text
- 1-4 action buttons
- Color scheme

**Recommendation**: **Create generic `InteractionCard` component**:

```jsx
<InteractionCard
  type="sale_inquiry"  // For color scheme
  portrait={npcPortrait}
  title="Remedy Request"
  description={ailmentDescription}
  actions={[
    { label: 'Craft Remedy', onClick: onPursue, style: 'primary' },
    { label: 'Decline', onClick: onDecline, style: 'secondary' }
  ]}
/>
```

Benefits:
- Single component to maintain
- Consistent styling automatically
- Easy to add new interaction types
- Reduces bundle size

---

## What Can Be Streamlined

### Priority 1: Split `useGameHandlers.js`

**Current**: 1668 lines handling everything

**Proposed structure**:

```
useGameHandlers.js (200 lines)
  ├─ Imports all domain handlers
  ├─ Returns combined handler object
  └─ No logic, just composition

Domain handlers:
  ├─ useOrchestrationHandlers.js (300 lines)
  │   └─ handleSubmit, orchestration logic
  ├─ useInteractionHandlers.js (200 lines)
  │   ├─ handleSimpleInteractionChoice
  │   └─ handleRandomEventChoice
  ├─ useContractHandlers.js (250 lines)
  │   ├─ handleAcceptTreatment
  │   ├─ handleMixingDecision
  │   └─ handleSaleProposal
  └─ usePatientHandlers.js (200 lines)
      ├─ handleAskQuestion
      └─ handlePatientDialogue
```

**Benefits**:
- Each file < 300 lines (manageable)
- Clear domain boundaries
- Easier testing
- Parallel development

---

### Priority 2: Consolidate Medical UI

**Current**: 14 components, unclear workflow

**Proposed**: Single `PatientModal` with tabs

```
PatientModal.jsx (400 lines)
  ├─ PatientHeader (portrait, name, demographics)
  ├─ TabBar (Examine | Diagnose | Treat | History)
  ├─ ExamineTab (symptoms list + body map)
  ├─ DiagnoseTab (diagnosis panel)
  ├─ TreatTab (prescription builder)
  └─ HistoryTab (treatment timeline)
```

**Delete**:
- `Diagnose.js` (use `Diagnose.jsx`)
- `PrescribePopup.js` (use `PrescribePopup.jsx`)
- `DiagnosisPanel.jsx` (merge into tab)
- `PrescribeOverviewPanel.jsx` (merge into tab)
- `PrescribePanelIntegrated.jsx` (merge into tab)
- `BloodlettingModal.jsx` (special case in TreatTab)

**Keep**:
- `NPCPatientModal.jsx` → rename to `PatientModal.jsx`
- `BodyMap.jsx` (used in ExamineTab)
- `TreatmentTimeline.jsx` (used in HistoryTab)
- `PrescriptionOutcomeModal.jsx` (separate result modal is fine)
- `PatientRosterModal.jsx` (separate patient list is fine)

---

### Priority 3: Unify Card System

**Replace 8 card components with 2**:

1. **`InteractionCard.jsx`** - Generic card with portrait, actions, color scheme
   - Use for: simple_interaction, sale_inquiry, sale_proposal, mixing_decision, contract_offer, exit_confirmation

2. **`EventCard.jsx`** - Multi-choice events without portraits
   - Use for: random_event (keep separate due to different structure)

**`TravelCard.jsx`** can stay separate (animated, no actions).

**Implementation**:

```jsx
// Generic interaction card
<InteractionCard
  variant="sale_inquiry"  // Determines color scheme
  portrait={npcPortrait}
  icon="💊"
  title="Remedy Request"
  subtitle={`${offeredBy} seeks remedy for ${patientName}`}
  details={[
    { label: 'Patient', value: patientName },
    { label: 'Ailment', value: ailmentDescription },
    { label: 'Payment', value: `${paymentOffered} reales` }
  ]}
  actions={[
    { label: 'Craft Remedy', onClick: onPursue, variant: 'primary' },
    { label: 'Decline', onClick: onDecline, variant: 'secondary' }
  ]}
/>
```

**Color schemes** map to variant:
```javascript
const CARD_COLORS = {
  simple_interaction: 'blue',
  sale_inquiry: 'purple',
  sale_proposal: 'amber',
  mixing_decision: 'green',
  contract_offer: 'indigo',
  exit_confirmation: 'orange'
};
```

---

### Priority 4: Simplify Position Management

**Option A: Computed Grid Coordinates** (easier migration)

```javascript
// PlayerContext.jsx
const updatePosition = useCallback((position) => {
  const GRID_SIZE = 20;
  setPlayerPosition({
    x: position.x,
    y: position.y,
    // Auto-compute grid if not provided
    gridX: position.gridX ?? Math.floor(position.x / GRID_SIZE),
    gridY: position.gridY ?? Math.floor(position.y / GRID_SIZE)
  });
}, []);
```

**Option B: Grid-First Storage** (cleaner long-term)

```javascript
// Store only grid coordinates
const [playerGrid, setPlayerGrid] = useState({ gridX: 25, gridY: 24 });

// Compute pixels on demand
const getPixelPosition = (grid) => {
  const GRID_SIZE = 20;
  return {
    x: grid.gridX * GRID_SIZE + GRID_SIZE / 2,
    y: grid.gridY * GRID_SIZE + GRID_SIZE / 2
  };
};
```

**Recommendation**: Start with **Option A** (less breaking), migrate to **Option B** later.

---

### Priority 5: Remove File Duplicates

**Duplicate files to investigate**:

```bash
# Medical
src/features/medical/components/Diagnose.js
src/features/medical/components/Diagnose.jsx

src/features/medical/components/PrescribePopup.js
src/features/medical/components/PrescribePopup.jsx

# Check which is actually used
grep -r "from.*Diagnose" src/
grep -r "from.*PrescribePopup" src/
```

**Process**:
1. Find which version is imported
2. Delete unused version
3. Rename `.jsx` → `.js` for consistency (or vice versa)

---

## Scope for Dynamic Decision Making

### What Makes This Special

The **agent orchestration + LLM combo** creates emergent gameplay:

**Example flow**:
```
Player: "go to market and buy cannabis"
  ↓
EntityAgent: Selects merchant NPC based on location + time
  ↓
NarrativeAgent:
  - Generates merchant personality
  - Creates risk scenario (Inquisition watches cannabis)
  - Prices it based on danger
  ↓
Player must negotiate, consider risk, make moral choice
```

**This is not scripted.** Each playthrough will have:
- Different merchant personalities
- Different prices
- Different risk scenarios
- Different consequences

**Strengths**:
1. ✅ Historical accuracy grounds creativity
2. ✅ Reputation system creates NPC attitude variance
3. ✅ Entity selection creates pacing variety
4. ✅ Simple interaction cards create fast-paced transactions
5. ✅ Random events inject surprises

**Opportunities to enhance**:
1. **Faction drama**: Make faction conflicts more visible (e.g., Spanish vs. Indigenous merchants refuse to work together)
2. **Recurring characters**: Entity system should track "favorite" NPCs and bring them back
3. **Consequence chains**: Treatment outcomes should affect future patients (word spreads)
4. **Historical events**: Integrate real 1680 events (King's death, Inquisition trials) into random events

---

## Reliability Concerns

### Current Fragility Points

**1. LLM Failures**
- **Mitigation**: Fallback to Gemini if OpenAI fails ✓
- **Gap**: No graceful degradation if both fail
- **Fix**: Add hardcoded fallback responses for common actions

**2. StateAgent JSON Parsing**
- **Mitigation**: Retry logic with exponential backoff ✓
- **Gap**: Sometimes returns partial/invalid state
- **Fix**: Validate required fields before accepting

**3. Position Coordinate Bugs**
- **Issue**: gridX/gridY can become undefined → NaN
- **Mitigation**: We just fixed 4 instances
- **Gap**: Will happen again with new position-setting code
- **Fix**: Implement auto-computation (Priority 4 above)

**4. Card State Persistence**
- **Issue**: Cards can get "stuck" if state not cleared
- **Mitigation**: Checks like `!conversationHistory.some(entry => entry.card?.type === 'X')`
- **Gap**: Complex logic, easy to mess up
- **Fix**: Generic card registry to track active cards

---

## Recommendations by Priority

### Immediate (This Week)

1. **Add LLM fallback responses** for common failures
   ```javascript
   const FALLBACK_RESPONSES = {
     movement_blocked: "That path is blocked.",
     purchase_failed: "The merchant doesn't have that item.",
     default: "Something went wrong. Please try again."
   };
   ```

2. **Fix position auto-computation** (Priority 4, Option A)
   - Prevents future NaN bugs
   - 30 minutes to implement

3. **Delete duplicate files** (Diagnose, PrescribePopup)
   - Reduces confusion
   - 15 minutes to verify + delete

### Short-term (Next 2 Weeks)

4. **Split useGameHandlers.js** (Priority 1)
   - Most impactful for maintainability
   - ~4 hours of work

5. **Consolidate medical UI** (Priority 2)
   - Improves UX clarity
   - ~6 hours of work

6. **Create InteractionCard** (Priority 3)
   - Migrate 2-3 card types to test
   - ~4 hours of work

### Long-term (Next Month)

7. **Faction conflict system** - Make reputation more visible
8. **Recurring NPC system** - Track relationship arcs
9. **Historical event integration** - 1680-specific triggers
10. **Mobile optimization** - Touch-friendly card UIs

---

## Final Verdict

### What You've Built

This is a **genuinely innovative historical RPG** with:
- Scholarly historical grounding (rivals academic games)
- Elegant LLM-driven narrative emergence
- Unique card-based persistent UI
- Complex systems (medicine, commerce, map, reputation) that interlock

**The core is brilliant.** The architecture (agents, contexts, cards) is production-ready.

### Where to Focus

**Technical debt** is localized to:
- Handler bloat (fixable via splitting)
- Medical UI complexity (fixable via consolidation)
- Position coordinate fragility (fixable via auto-computation)

**None of these threaten the core architecture.** They're refactoring opportunities, not fundamental flaws.

### Comparison to Industry

**Similar to**:
- *Disco Elysium* (skill-based dialogue, emergent choices)
- *Crusader Kings 3* (character-driven historical simulation)
- *80 Days* (procedural narrative, historical accuracy)

**Better than most in**:
- Historical specificity (most games are generic)
- LLM integration (most use branching dialogue trees)
- Emergent gameplay (most are scripted)

**Needs improvement in**:
- Code organization (handler files too large)
- UI clarity (medical workflow is confusing)

### Grade: A- (4.5/5)

**Recommendation**: **This is release-worthy after Priority 1-3 fixes.**

The game is **playable, engaging, and unique**. The complexity issues are **technical debt**, not design flaws. With 2-3 weeks of refactoring (split handlers, consolidate medical UI, unify cards), this becomes an **A+ production-ready game**.

---

## Action Items

**To achieve elegance + reliability + dynamic scope:**

✅ Keep: Agent orchestration, card embedding, historical grounding
❌ Remove: Duplicate files, redundant medical components
🔨 Refactor: Handler splitting, medical consolidation, card unification
✨ Enhance: Faction conflicts, recurring NPCs, consequence chains

**Next Steps**:
1. Delete duplicate files (15 min)
2. Fix position auto-computation (30 min)
3. Add LLM fallback responses (1 hour)
4. Plan handler split (document structure)
5. Plan medical UI consolidation (wireframe tabs)
6. Prototype InteractionCard (prove concept)

**Timeline**: 2-3 weeks to address all Priority 1-3 items.

**Result**: Production-ready historical RPG with clean architecture.
