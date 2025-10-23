# Making the Game More Dynamic and Alive

## The Core Problem

The transcript shows a **static, verbose, repetitive experience**:
- Grinding cacao gets 120-word descriptions (should be 15 words)
- Same choices repeat 3+ times without variety
- World doesn't react - no events, customers, or life
- Time passes but nothing changes
- Generic descriptions ("servants") instead of vivid 1680s details

## Root Causes (from code analysis)

### 1. **No Action Triage**
Prompt doesn't distinguish trivial from critical actions. Grinding cacao = same verbosity as Inquisition arrival.

### 2. **Passive EntityAgent**
Only runs when player summons NPCs. Doesn't inject customers/events proactively when player idles.

### 3. **No Repetition Detection**
LLM offers identical choices turn after turn. No instruction to break loops.

### 4. **World Doesn't Breathe**
No environmental events (bells, weather, sounds). No sense of Mexico City existing around Maria.

### 5. **Generic Historical Detail**
Prompts don't guide toward specific 1680s texture. Gets "soldiers" not "viceregal guards in morion helmets."

---

## The Fix: Three Key Changes

### Change 1: **Dynamic Pacing by Action Type**

**Current problem:** Every action gets 1-3 paragraphs regardless of importance.

**Solution:** Add tiered response length rules to NarrativeAgent prompt.

```
TRIVIAL (grinding, walking, sorting): 1-2 sentences MAX (15-30 words)
- "You grind the cacao beans. The rhythmic work steadies your hands."

ROUTINE (purchases, simple chat): 3-4 sentences (40-60 words)
- Vendor interaction, examining items, brief exchanges

IMPORTANT (new patients, discoveries): 1-2 paragraphs (80-120 words)
- Arrivals, conflicts, revelations, contract offers

CRITICAL (crises, deaths, arrests): 2-3 paragraphs MAX (120-180 words)
- Life-or-death moments, major story beats
```

**Effect:** Mundane actions compress to 1 line. Important moments get space to breathe. Natural pacing emerges.

---

### Change 2: **Living World System**

**Current problem:** When player idles (grinding, waiting), nothing happens. World is frozen.

**Solution:** Add "world events" layer to NarrativeAgent that injects life when momentum slows.

**Inject when:**
- Player idle 1+ turn (repetitive action, waiting)
- No NPC interaction recently
- At shop during business hours

**Event types:**
1. **Customers arrive** (knock, voice calling, shadow in doorway)
2. **Sounds interrupt** (bells, procession, vendor cry, dog bark, rain)
3. **Environmental changes** (sun angle shifts, smell drifts in, temperature drops)
4. **Internal state** (hunger, fatigue, memory flash)

**Examples:**
```
Grinding cacao → "The cathedral bells toll for Sext. A knock at the door."
Sorting herbs → "Rapid Nahuatl from the street—two women arguing."
Waiting → "A child's voice: 'Curandera? My mother sent me.'"
```

**Critical rule:** If player action is idle/repetitive AND no NPC present AND at botica → **force an arrival or event**.

---

### Change 3: **Historical Texture Bank**

**Current problem:** Descriptions are generic. "Servants pass by."

**Solution:** Add scenario-specific detail library to 1680-mexico-city prompts.

**Examples to guide LLM:**

**People:**
- "A Nahua market woman in an embroidered huipil balances a basket of fresh chiles"
- "Viceregal soldiers in morion helmets, pikes resting on shoulders"
- "Dominican friars from Santo Domingo walk toward the Cathedral construction"

**Places:**
- Tlatelolco market, Portal de Mercaderes, La Merced, Alameda
- Metropolitan Cathedral (under construction since 1573, massive scaffolding)

**Sounds:**
- Nahuatl and Spanish mixing, church bells, vendor calls, horse hooves on cobblestones

**Smells:**
- Copal incense, roasting corn, pulque, sewage in canals, dust

**Key:** Prompt includes specific examples to guide from generic → vivid.

---

## Implementation (Prompt Changes Only)

### File 1: `src/prompts/promptModules.js`

**Replace `tone` section (~line 22):**

```javascript
tone: `**Dynamic pacing - match length to importance:**

TRIVIAL actions (grinding, sorting, walking): 15-30 words, 1-2 sentences
ROUTINE interactions (shopping, brief chat): 40-60 words, 3-4 sentences
IMPORTANT moments (new arrivals, conflicts): 80-120 words, 1-2 paragraphs
CRITICAL events (crises, deaths): 120-180 words MAX, 2-3 paragraphs

Clear, direct prose. No purple language. Grounded in 1680s realities.
Never "the air is thick with..." Use "says" as dialogue tag, not "murmurs."
Historical specificity over generic descriptions.`
```

**Add after `events` section:**

```javascript
livingWorld: `**Living World System:**

If player is idle/repetitive (grinding 2x, waiting, aimless):
→ INJECT an event to create momentum

Event types:
- Customer arrival (knock, voice, shadow at door) - 50%
- Environmental (bells, weather, sounds from street) - 30%
- Internal (hunger, memory, fatigue) - 20%

Examples:
"The cathedral bells toll. A knock interrupts your work."
"Rain drums on the roof. Someone calls: 'Curandera?'"
"Your stomach growls—you haven't eaten since dawn."

**Don't leave Maria idle more than 1 turn.** World is alive.`
```

---

### File 2: `src/core/agents/NarrativeAgent.js`

**Add to system prompt after line 650 (before "Writing Style"):**

```javascript
### Anti-Repetition System:

Check conversation history. If player repeated same action 2+ times:
→ STOP offering that choice
→ INJECT new event/interruption instead

Example WRONG:
Turn 1: "Will you grind cacao, or sort aloe?"
Turn 2: "Will you continue grinding, or sort aloe?" ❌ REPETITIVE

Example CORRECT:
Turn 1: "Will you grind cacao, or sort aloe?"
Turn 2: "A knock interrupts. Will you answer?" ✓ VARIETY
```

---

### File 3: `src/scenarios/1680-mexico-city/prompts.js`

**Add new section:**

```javascript
historicalTexture: `**1680 Mexico City Specificity:**

**People:**
- Nahua market women in embroidered huipils, baskets of chiles/corn
- Viceregal soldiers in morion helmets, pikes with pennants
- Dominican/Franciscan friars in black/brown habits
- Mestiza vendors selling tamales, atole, pulque from clay pots
- Criollo merchants in velvet doublets, gold chains
- African and mulato laborers hauling construction materials

**Places:** Tlatelolco market, Portal de Mercaderes, Cathedral construction site, La Merced, Alameda, Santo Domingo convent

**Sounds:** Church bells (many churches), Nahuatl and Spanish mixing, vendor cries, horse hooves, construction hammering

**Smells:** Copal incense, roasting corn, pulque, sewage in acequia canals, dust from dry season

**Use specific details.** NOT "soldiers" but "viceregal guards in morion helmets."
NOT "servants" but "Nahua girl carrying water from the aqueduct."`
```

---

## Expected Transformation

### Before:
```
Turn 1: [120 words describing grinding cacao in detail]
Turn 2: [120 words describing continuing to grind cacao]
Turn 3: Player types "surely we can find something else"
Turn 4: [120 words offering to grind more or sort herbs]
```

### After:
```
Turn 1: "You grind cacao beans into powder. The work steadies your hands." [14 words]
Turn 2: "The cathedral bells toll for Sext. A knock interrupts your work—a woman's voice calls out in Nahuatl." [20 words + EVENT INJECTION]
```

**Result:** Faster pacing, living world, no repetition loops, vivid historical texture.

---

## What This Achieves

✅ **Creativity** - Events inject unexpectedly (bells, knocks, smells, sounds)
✅ **Sprightliness** - Trivial actions = 1 line, keeps momentum
✅ **Dynamism** - World reacts, customers arrive, weather changes
✅ **Day's work** - Time passes through environmental cues (bells, sun angle, sounds)
✅ **Immersion** - Specific 1680s details (morion helmets, Nahuatl dialogue, copal smoke)

---

## Testing

**Scenario 1: Repetition breaking**
1. Player: "grind cacao"
2. Player: "grind cacao" (again)
3. **Expected:** Event injection (knock, sound, etc.) instead of repetition

**Scenario 2: Dynamic length**
1. Player: "grind cacao" → 15-30 words
2. Player: "answer door" → 80-120 words (new arrival)

**Scenario 3: Living world**
1. Player: "wait for customers"
2. **Expected:** Customer arrives within 1 turn (not 3+ idle turns)

---

## Next Step

Implement these 3 prompt changes, test with the grinding cacao scenario, verify it breaks loops and compresses mundane actions.
