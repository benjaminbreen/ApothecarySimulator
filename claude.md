# Apothecary Simulator - Technical Reference

**Project**: Historical medical RPG with procedural narrative generation
**Current Scenario**: 1680 Mexico City (Maria de Lima, converso apothecary)
**Stack**: React 18, OpenAI/Gemini, localStorage saves, client-side only
**Status**: ✅ Fully Functional | 🚧 Feature Expansion Phase

---

## Architecture Overview

### Core Systems

```
┌─────────────────────────────────────────────────┐
│  Game Loop (src/pages/GamePage.jsx)            │
├─────────────────────────────────────────────────┤
│  Player Input → AgentOrchestrator               │
│       ↓                                         │
│  1. EntityAgent: Select contextual NPC/Patient  │
│  2. NarrativeAgent: Generate story response     │
│  3. StateAgent: Extract game state changes      │
│       ↓                                         │
│  Update UI → Display narrative & state          │
└─────────────────────────────────────────────────┘
```

#### 1. Agent Orchestrator (`src/core/agents/`)
**Purpose**: Coordinates 3 specialized LLM agents to process each player turn

- **NarrativeAgent.js**: Generates story text, dialogue, scene descriptions
- **StateAgent.js**: Extracts structured data (inventory changes, time passage, location)
- **EntityAgent.js**: Selects appropriate NPCs/patients based on context, pacing, reputation
- **AgentOrchestrator.js**: Chains agents together, handles errors, validates output

**Flow**:
```javascript
orchestrateTurn() →
  selectContextAwareEntity() →
  generateNarrative(entity) →
  extractGameState(narrative) →
  validateGameState() →
  return combined result
```

#### 2. Entity System (`src/core/entities/`)
**Purpose**: Unified data model for all game entities (NPCs, patients, items, locations)

- **EntityManager.js**: Registry, CRUD operations, procedural generation triggers
- **entitySchema.js**: Base classes for NPCs, patients, items (with validation)
- **procedural/npcGenerator.js**: Generates appearance, personality, medical conditions
- **procedural/itemGenerator.js**: Generates historical materia medica with properties
- **InteractionMemory.js**: Tracks NPC relationship changes over time
- **RelationshipGraph.js**: Social network between entities
- **combat/woundSystem.js**: Medical condition progression, wound healing

**Entity Types**:
- `NPC` - Generic characters (merchants, officials, neighbors)
- `Patient` - NPCs with medical conditions (extends NPC)
- `Item` - Materia medica, compounds, equipment
- `Location` - Places in the game world

**Procedural Data**: Appearance, personality, symptoms, provenance, historical context

#### 3. Scenario System (`src/scenarios/`)
**Purpose**: Multi-timeline support (currently only 1680 Mexico City implemented)

Each scenario defines:
- Character (name, background, portraits, starting stats)
- NPCs (EntityList of story-critical and background characters)
- Starting inventory (random 10 items from ~100 historical items)
- Location, date, time, currency
- Scripted events (debt deadlines, Inquisitor appearances)
- Social context (address style, power dynamics, threats)

**File Structure**:
```
scenarios/1680-mexico-city/
├── config.js          # Main scenario config
├── character.js       # Maria de Lima data
├── prompts.js         # Scenario-specific prompt modules
├── maps/              # Map data for locations
└── assets/            # Portraits, location images
```

#### 4. Resource System (`src/systems/ResourceManager.js`)
**Purpose**: Health/energy management with action costs

- **Energy**: 0-100, costs for actions (mix: 10, travel: 25, sleep: -60)
- **Health**: 0-100, affected by illness, injuries, successful treatments
- **Warnings**: Critical (<10 energy) blocks actions
- **Regeneration**: Sleep, eating restore resources

#### 5. Game State (`src/core/state/gameState.js`)
**Purpose**: Central state management hook

**State Structure**:
```javascript
{
  scenarioId: '1680-mexico-city',
  inventory: [{ name, quantity, price, properties }],
  compounds: [{ name, ingredients, method }],
  quests: [{ id, completed, stage }],
  time: '8:00 AM',
  date: 'August 22, 1680',
  location: 'Botica de la Amargura',
  turnNumber: 1,
  unlockedMethods: ['Distill', 'Decoct'],
  isGameOver: false
}
```

**Methods**: `updateInventory()`, `addCompoundToInventory()`, `advanceTime()`, `unlockMethod()`, `triggerGameOver()`

---

## Feature Systems

### Medical (`src/features/medical/`)
- **Diagnosis**: Examine patients, identify symptoms
- **Prescriptions**: Dispense medicines with routes (oral, topical, etc.)
- **Body Map**: Visual symptom tracker
- **Treatment Timeline**: Historical treatment records for patients
- **Symptoms Panel**: List patient complaints, severity

**Components**: `PrescribePopup.js`, `Symptoms.js`, `Diagnose.js`, `NPCPatientModal.jsx`, `BodyMap.jsx`

### Crafting (`src/features/crafting/`)
- **Mixing Workshop**: Combine ingredients into compounds
- **Methods**: Distill, Decoct, Calcinate, Confection (unlockable)
- **Recipes**: Emergent (LLM validates combinations)
- **Drag-Drop**: React DnD for ingredient selection

**Components**: `Mixing.js`

### Commerce (`src/features/commerce/`)
- **Buy**: Purchase ingredients from market
- **Sell**: Dispense medicines for profit
- **Prices**: Dynamic based on rarity, scenario
- **Wealth Tracking**: Debt deadlines, profit/loss

**Components**: `Buy.js`, `WealthTracker.js`

### Narrative (`src/features/narrative/`)
- **Quest System**: Scripted branching quests with stages
  - **Banner**: Cutscenes with images
  - **Dialogue**: NPC conversations with choices
  - **Decision**: Player choice points
- **Map**: Visual location browser
- **Counter-Narrative**: Alternative historical perspectives

**Components**: `Quest.js`, `Map.js`, `CounterNarrative.js`

**Quest Structure**:
```javascript
{
  id: 1,
  name: 'The Valencian Alchemist',
  npc: 'Antonius Philalethes',
  classification: 'Helper',
  trigger: (turnNumber, time, date) => ...,
  stages: [
    { type: 'banner', image, text, buttons },
    { type: 'dialogue', npcResponses, playerChoices },
    { type: 'decision', buttons }
  ]
}
```

### Character (`src/features/character/`)
- **Portrait System**: Emotion-based portraits (happy, sad, worried, determined, curious)
- **Stats Panel**: Health, energy, wealth, reputation display
- **Sleep**: Rest to restore energy, advance time
- **Skill Tracking**: Medical proficiency visualization
- **Relationships**: NPC affinity bars

**Components**: `PortraitSection.js`, `CharacterStats.js`, `Sleep.js`, `SkillRadialProgress.jsx`, `RelationshipBar.jsx`

### NPC Portrait System (Phase 2 - Current)
**Purpose**: Display portraits of NPCs physically present in scenes (people Maria is looking at and talking to)

#### How It Works

**1. Entity Selection (EntityAgent.js)**
- Selects contextual NPC/patient based on:
  - Player action intent (conversation continuation vs new encounter)
  - Time of day, location, reputation
  - Shop sign status (for patients)
- **No procedural names generated** - templates are demographic hints only
- Returns template entity (e.g., "Merchant", "Widow") OR null if conversation continues

**2. LLM Portrait Selection (NarrativeAgent.js)**
- LLM receives template as demographic hint
- Generates complete NPC profile via `primaryNPC` field:
  ```json
  {
    "primaryNPC": {
      "name": "Isabel Valdés",
      "age": "middle-aged",
      "gender": "female",
      "casta": "criollo",
      "class": "middling",
      "occupation": "Merchant's widow",
      "personality": "Cautious but desperate",
      "appearance": "Tanned skin, worn clothing",
      "description": "A widow seeking help for her ill daughter"
    },
    "primaryPortrait": "middleagedcriollofemalemerchant.jpg"
  }
  ```
- **Critical rule**: Show physically present person (mother at door), NOT discussed person (sick daughter)
- **Identity consistency**: Same NPC keeps same name/portrait across conversation turns

**3. Portrait Display (ContextPanel.js)**
- Receives `primaryPortraitFile` from useGameHandlers
- Displays portrait at `/portraits/{filename}`
- **Phase 2**: LLM-primary path with fallback warnings if old system used

#### Adding New Portraits

**Automated sync system** - portraits are auto-added to the config when you run the sync script.

**Step 1: Add image file to `/public/portraits/`**
- Naming convention: `{descriptor}_{age}_{casta}_{occupation}.jpg`
- Examples:
  - `female_middleaged_criollo_patroness.jpg`
  - `male_elder_indigenous_noble_delegate.jpg`
  - `female_young_mestiza_market_vendor.jpg`
  - `criollomaleprintermiddleaged.jpg`
  - `peninsularpriestmiddleaged.jpg`

**Step 2: Run the portrait sync script**
```bash
node scripts/syncPortraits.js
```

The script will:
- Scan `/public/portraits/` for all `.jpg` and `.png` files
- Auto-categorize new portraits based on filename patterns (gender, age, class, occupation)
- Update `src/core/config/portraits.config.js` automatically
- Display which portraits were added to which categories

**That's it!** The LLM will now be able to select the new portraits from the config.

**Categorization keywords:**
- `priest`, `nun`, `friar`, `monk` → Clergy
- `merchant`, `vendor`, `trader` → Merchants
- `soldier`, `guard`, `military` → Soldiers
- `child`, `boy`, `girl` → Children
- `scholar`, `healer`, `apothecary`, `physician`, `midwife` → Scholars/Healers
- `farmer`, `sailor`, `artisan`, `cobbler`, `seamstress`, `innkeeper` → Workers/Artisans
- Gender/age/class patterns → Elite/Common/Young/Elderly Women/Men

**Files:**
- Portrait config: `src/core/config/portraits.config.js`
- Sync script: `scripts/syncPortraits.js`
- ~~`portraitLibrary.js`~~ (deprecated, will be deleted in Phase 3)

#### Identity Consistency Rules (NarrativeAgent prompt)

- **Conversation continuations**: EntityAgent returns null → LLM sees existing NPC in history → maintains identity
- **Turn 1**: "Isabel Valdés arrives at door" → `primaryPortrait: "middleagedcriollofemalemerchant.jpg"`
- **Turn 2**: Player says "what do you need?" → EntityAgent detects continuation → no new entity
- **Turn 2 result**: LLM sees "Isabel Valdés" in history → uses same name and portrait ✓

**Edge Cases**:
- **Animals**: `primaryPortrait: null` (no human portrait for João the cat)
- **Player alone**: `primaryPortrait: null` (no NPC present)
- **Patient transitions**: When contract accepted, portrait updates to patient via `handleAcceptTreatment`

**Files**:
- Entity selection: `src/core/agents/EntityAgent.js`
- LLM portrait generation: `src/core/agents/NarrativeAgent.js`
- Portrait display: `src/components/ContextPanel.js`
- Portrait orchestration: `src/pages/hooks/useGameHandlers.js`

### Inventory (`src/features/inventory/`)
- **Inventory Pane**: Materia medica list with search/filter
- **Journal**: Auto-generated entries for important events
- **Drag-Drop**: Item management

**Components**: `InventoryPane.js`, `Journal.js`

### Map (`src/features/map/`)
- **Grid Movement**: NPC pathfinding and player movement
- **Interior Maps**: Room-based navigation
- **Exterior Maps**: City-level locations
- **NPC Positions**: Real-time NPC location tracking

**Components**: `MapRenderer.jsx`, `InteriorMap.jsx`, `ExteriorMap.jsx`
**Services**: `gridMovementSystem.js`, `npcPositionTracker.js`, `mapGenerator.js`

---

## Data Flow

### Turn Processing
```
1. Player types action → handleSubmit()
2. Check for commands (#prescribe, #buy, #sleep)
   ├─ If command → open modal UI
   └─ If narrative → orchestrateTurn()
3. AgentOrchestrator processes:
   ├─ EntityAgent selects NPC/patient (weighted by context)
   ├─ NarrativeAgent generates story (with entity context)
   └─ StateAgent extracts changes (inventory, time, location)
4. Update React state:
   ├─ conversationHistory (for LLM context)
   ├─ gameState (inventory, time, location)
   ├─ currentWealth, health, energy
   └─ journal entries
5. Render narrative + updated UI
```

### Entity Highlighting
```
1. NarrativeAgent returns text with entity names
2. NarrativePanel_Enhanced parses text
3. EntityManager.highlightEntitiesInText() identifies:
   ├─ Patients → red, clickable
   ├─ NPCs → green, clickable
   └─ Items → purple, clickable
4. Click → open appropriate modal (NPCPatientModal, NPCModal, ItemModal)
```

### Procedural Generation
```
1. EntityManager.register(entity) called with minimal data
2. Check entity.generationNeeded fields (appearance, symptoms, etc.)
3. If missing data:
   ├─ Call npcGenerator.generate() or itemGenerator.generate()
   └─ Enrich entity with procedural data
4. Store enriched entity in EntityManager
5. Future access retrieves full data
```

---

## Prompts System (`src/prompts/promptModules.js`)

**Modular Prompts**: Composable prompt fragments for LLM calls

**Modules**:
- `systemRolePrompt(scenario)`: Character identity, historical context
- `gameRulesPrompt(scenario)`: Mechanics, commands, constraints
- `entityContextPrompt(entity)`: NPC/patient details
- `locationPrompt(location)`: Setting description
- `inventoryPrompt(inventory)`: Available items
- `conversationContextPrompt(history)`: Recent dialogue

**Usage**:
```javascript
const prompt = [
  systemRolePrompt(scenario),
  gameRulesPrompt(scenario),
  entityContextPrompt(selectedNPC),
  conversationContextPrompt(history)
].join('\n\n');

const response = await createChatCompletion(prompt, messages);
```

---

## LLM Integration (`src/core/services/llmService.js`)

**Providers**: OpenAI GPT-4o, Google Gemini 2.0 Flash
**Strategy**: Try OpenAI first, fallback to Gemini on error
**Context Window**: ~8K tokens (conversation history trimmed to last 20 messages)
**Output Format**: JSON + narrative text (parsed by StateAgent)

**Key Functions**:
- `createChatCompletion(systemPrompt, messages, options)`: Main LLM call
- `createStructuredCompletion(schema, messages)`: JSON-only responses

---

## File Organization

```
src/
├── pages/
│   ├── HomePage.jsx           # Scenario selection
│   └── GamePage.jsx           # Main game loop (1135 lines)
│
├── core/
│   ├── agents/                # LLM agent coordination
│   ├── entities/              # Entity system & procedural generation
│   ├── services/              # LLM, scenarios, portraits
│   ├── state/                 # Game state hook
│   ├── types/                 # JSDoc type definitions
│   └── constants/             # Game rules, commands, UI constants
│
├── features/                  # Feature-based modules
│   ├── medical/
│   ├── crafting/
│   ├── commerce/
│   ├── character/
│   ├── narrative/
│   ├── inventory/
│   └── map/
│
├── scenarios/                 # Scenario configs
│   └── 1680-mexico-city/
│
├── components/                # Shared UI components
│   ├── Header.jsx
│   ├── CharacterStats.jsx
│   ├── NarrativePanel_Enhanced.jsx
│   ├── ContextPanel.jsx
│   ├── ErrorBoundary.jsx
│   └── ...
│
├── systems/
│   └── ResourceManager.js     # Health/energy system
│
└── prompts/
    └── promptModules.js       # Composable prompts
```

---

## Known Issues & Limitations

### Current Limitations
1. **Single scenario**: Only 1680 Mexico City implemented (architecture supports multiple)
2. **No save system version migration**: Old saves may break on major updates
3. **Performance**: LLM calls can take 3-5 seconds
4. **Entity persistence**: NPC states reset on page reload (stored in memory, not localStorage)
5. **Limited testing**: No automated tests, manual QA only

### Technical Debt
1. **GamePage.jsx**: 1135 lines (could split into smaller components)
2. **Prop drilling**: Some components pass 10+ props (could use React Context)
3. **CSS organization**: Mix of CSS files and inline styles
4. **Error handling**: Minimal LLM error recovery beyond fallbacks

### Edge Cases
1. **LLM failures**: Graceful degradation (fallback narrative, preserve state)
2. **Invalid JSON**: StateAgent has retry logic with exponential backoff
3. **Entity name collisions**: EntityManager uses normalized names for lookup
4. **Inventory overflow**: No hard cap (could become unwieldy)

---

## Roadmap

### Phase 1: Core Improvements (High Priority)

#### 1.1 Performance Optimization
- [ ] **LLM response streaming**: Display narrative word-by-word (better UX)
- [ ] **Conversation history trimming**: Intelligent summarization (keep critical context)
- [ ] **Entity caching**: Persist procedural data to localStorage
- [ ] **React.memo**: Prevent unnecessary re-renders in expensive components

#### 1.2 Save System
- [ ] **Multiple save slots**: 3 manual saves + 1 autosave
- [ ] **Save versioning**: Migrations for breaking changes
- [ ] **Export/import saves**: JSON download/upload
- [ ] **Save metadata**: Timestamp, scenario, turn number, portrait preview

#### 1.3 UI Polish
- [ ] **Loading states**: Skeletons for LLM calls, entity generation
- [ ] **Tooltips**: Help text for all commands, stats, conditions
- [ ] **Accessibility**: Keyboard navigation, ARIA labels, screen reader support
- [ ] **Mobile optimization**: Responsive design (currently desktop-first)

### Phase 2: New Features (Medium Priority)

#### 2.1 Combat & Wound System
- [x] Wound system implemented (`src/core/entities/combat/woundSystem.js`)
- [ ] Combat UI (turn-based medical combat, e.g., treating battlefield wounds)
- [ ] Treatment consequences (infection risk, recovery time)
- [ ] Historical weaponry (sword wounds, musket balls, burns)

#### 2.2 Relationship System Expansion
- [x] Relationship graph built (`src/core/entities/RelationshipGraph.js`)
- [ ] Gossip system (NPCs share info about player actions)
- [ ] Reputation tiers (affects prices, NPC attitudes, quest availability)
- [ ] Romance/rivalry arcs (deep relationships with key NPCs)

#### 2.3 Dynamic World Events
- [ ] **Random encounters**: Plague outbreaks, market shortages, festivals
- [ ] **NPC life events**: Births, deaths, marriages (affect quests)
- [ ] **Weather system**: Affects travel, ingredient availability
- [ ] **News system**: Historical events (e.g., King's death, Inquisition trials)

#### 2.4 Economy Expansion
- [ ] **Supply/demand**: Prices fluctuate based on player actions
- [ ] **Ingredient rarity**: Seasons affect availability
- [ ] **Competitors**: Other apothecaries affect market
- [ ] **Loans & investments**: Borrow money, invest in ventures

### Phase 3: New Scenarios (Low Priority, High Impact)

#### 3.1 Scenario: 1940s New York
- [ ] Character: Jewish immigrant pharmacist fleeing WWII Europe
- [ ] Setting: Lower East Side, NYC during wartime
- [ ] Themes: Antisemitism, refugee crisis, modernization of medicine
- [ ] Items: Sulfanilamide, aspirin, early antibiotics
- [ ] NPCs: Union organizers, Italian mobsters, FBI agents, fellow refugees

#### 3.2 Scenario: 1880s London
- [ ] Character: Victorian physician during Jack the Ripper era
- [ ] Setting: Whitechapel, East End poverty
- [ ] Themes: Class divide, women's suffrage, early forensics
- [ ] Items: Laudanum, ether, chloroform, early vaccines
- [ ] NPCs: Scotland Yard detectives, street vendors, asylum patients

#### 3.3 Scenario Template System
- [ ] Wizard for creating custom scenarios
- [ ] JSON schema validation
- [ ] Procedural NPC/item generation for new eras
- [ ] Community scenario sharing (import/export)

### Phase 4: Advanced Features (Nice-to-Have)

#### 4.1 Procedural Quest Generation
- [ ] Quest templates based on NPC needs
- [ ] Branching outcomes based on relationship, skills
- [ ] Emergent storylines (not just scripted)

#### 4.2 Skill System
- [ ] Medical skills: Diagnosis, Surgery, Herbalism, Chemistry
- [ ] XP/leveling from successful treatments
- [ ] Skill checks influence outcomes (e.g., surgery success rate)
- [ ] Skill trees (unlock advanced treatments)

#### 4.3 NPC Scheduling
- [ ] Time-based NPC locations (e.g., merchant at market 9-5)
- [ ] Daily routines (sleep, work, socialize)
- [ ] Special events (church on Sunday, market days)

#### 4.4 Multiplayer/Social
- [ ] Asynchronous co-op (send items/messages to other players)
- [ ] Shared world events (plague affects all players)
- [ ] Leaderboards (wealth, patients cured, quests completed)

---

## Development Guidelines

### Adding New Features
1. Check if feature fits existing architecture (agents, entities, scenarios)
2. Add to appropriate `src/features/` folder
3. Update scenario configs if scenario-specific
4. Add prompts to `src/prompts/promptModules.js`
5. Test with multiple LLM providers (OpenAI + Gemini)

### Adding New Scenarios
1. Create folder: `src/scenarios/{id}/`
2. Define `config.js` (character, NPCs, items, settings)
3. Create character portraits (6 emotions: normal, happy, sad, worried, determined, curious)
4. Write scenario-specific prompts in `prompts.js`
5. Add to `src/core/services/scenarioLoader.js`

### Code Style
- **Functional components**: Use hooks, avoid class components
- **JSDoc types**: Document complex functions
- **Console logs**: Use `[ComponentName]` prefix for debugging
- **Error handling**: Always catch LLM errors, provide fallbacks
- **Immutability**: Never mutate state directly

### LLM Best Practices
- **System prompts**: Clear, concise role definition
- **Context**: Include only relevant game state (trim old history)
- **JSON output**: Always validate with try-catch
- **Fallbacks**: Hardcoded responses for common failures
- **Cost optimization**: Use cheaper models (Gemini Flash) where possible

---

## Testing

### Manual Testing Checklist
- [ ] New game starts correctly
- [ ] Commands work (#prescribe, #buy, #sleep, #mix, #eat)
- [ ] NPCs appear at correct turns
- [ ] Inventory updates correctly
- [ ] Time advances properly
- [ ] Quests trigger and complete
- [ ] Save/load preserves state
- [ ] Entity highlighting works (click NPC names)
- [ ] Modals open/close correctly
- [ ] LLM errors show graceful fallback

### Test Scenarios
1. **Happy path**: Complete prologue, buy items, mix compound, prescribe to patient
2. **Edge cases**: Run out of energy, deplete inventory, trigger game over
3. **LLM failures**: Disconnect internet mid-turn, check fallback
4. **Performance**: Spam actions, check for memory leaks

---

## Deployment

**Build**: `npm run build`
**Deploy**: Static hosting (Vercel, Netlify, GitHub Pages)
**Env vars**: `REACT_APP_OPENAI_API_KEY`, `REACT_APP_GOOGLE_API_KEY`
**Size**: ~500KB bundle (excluding node_modules)

---

## FAQ

**Q: Why client-side LLM calls? Isn't that insecure?**
A: This is a single-player game, not a production API. User provides their own API keys. For production, move LLM calls to backend.

**Q: Why not TypeScript?**
A: Started as prototype, grew organically. TypeScript migration planned for Phase 4.

**Q: Why so many portraits per character?**
A: Emotional feedback is core to immersion. Portrait changes reflect Maria's state (worried when low energy, determined during quests).

**Q: Can I add my own scenarios?**
A: Yes! Follow "Adding New Scenarios" guide above. Community scenarios planned for Phase 3.

**Q: Why 1680 Mexico City specifically?**
A: Rich historical setting (Inquisition, converso identity, colonial tensions, humoral medicine) with underexplored narrative potential.

---

## Planned Refactoring

**UI Modernization & Architecture Refactor** - A comprehensive 6-phase plan to convert all CSS to Tailwind and modularize GamePage.jsx.

📄 **See detailed plan**: [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)

**Objectives**:
- Convert 10,000+ lines of custom CSS to Tailwind
- Implement cohesive dark mode
- Split 1,468-line GamePage.jsx into modular hooks and components
- Eliminate prop drilling with Context providers
- Achieve 100% feature parity (zero breakage)

**Timeline**: 6 phases, 15-21 hours total work
**Status**: 📋 Planning Complete | ⏳ Awaiting Approval

---

**Last Updated**: October 10, 2025
**Contributors**: Benjamin Breen (lead developer)
**License**: TBD
