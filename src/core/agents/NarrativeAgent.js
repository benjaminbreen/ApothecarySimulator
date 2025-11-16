// NarrativeAgent - Specialized agent for story generation
// Handles: Story text, player actions, NPC interactions, dialogue, spatial context

import { createChatCompletion } from '../services/llmService';
import { buildContextSummary, buildEntityContext, buildSkillsContext } from '../../prompts/promptModules';
import { scenarioLoader } from '../services/scenarioLoader';
import { getGridSystem } from '../../features/map/services/gridMovementSystem';
import { getReputationTier, getFactionStanding, FACTION_INFO } from '../systems/reputationSystem';
import { findPortraitByName } from '../services/portraitMatcher';
import { resolvePortrait } from '../services/portraitResolver';
import { isValidPortrait } from '../config/portraits.config';
import { buildNPCContext } from '../services/locationContextService'; // Location NPC system
import { getNarrativeFlags, formatDuration } from '../../systems/bodyEffects';
import { parseHourFromTimeString } from '../../utils/timeUtils';

// PERFORMANCE: Cache system prompt to avoid rebuilding every turn
// Note: Cache is keyed by scenario JSON, so changes to prompts automatically invalidate cache
let cachedSystemPrompt = null;
let cachedScenarioId = null;

/**
 * Normalize portrait filenames so downstream UI always receives a consistent shape.
 * - Trims whitespace
 * - Removes leading "/portraits/" prefixes
 * - Preserves "ui/" scene images
 * @param {string|null} filename
 * @returns {string|null}
 */
function normalizePortraitFilename(filename) {
  if (!filename) return null;
  const trimmed = filename.trim();

  if (trimmed.startsWith('ui/')) {
    return trimmed.replace(/^\/+/, 'ui/'); // ensure no leading slashes before ui/
  }

  // Drop any leading /portraits/ or portraits/ prefixes and stray slashes
  return trimmed
    .replace(/^\/?portraits\//i, '')
    .replace(/^\/+/, '');
}

/**
 * Build reputation context for narrative generation
 * @param {Object} reputation - Current reputation state
 * @param {Object} selectedEntity - Currently interacting NPC (if any)
 * @returns {string} Formatted reputation context for LLM
 */
function buildReputationContext(reputation, selectedEntity = null) {
  if (!reputation) return '';

  const tier = getReputationTier(reputation.overall);

  let context = `\n### Reputation Context (for NPC reactions):
Maria's Overall Reputation: ${reputation.overall}/100 (${tier.tier})

Faction Standing:
`;

  // Add each faction's standing
  Object.entries(reputation.factions).forEach(([factionId, score]) => {
    const info = FACTION_INFO[factionId];
    const standing = getFactionStanding(score);
    context += `- ${info.name}: ${score}/100 (${standing})\n`;
  });

  // If interacting with an NPC, provide attitude guidance
  if (selectedEntity) {
    if (selectedEntity.social?.faction) {
      // Faction-affiliated NPC: Use faction standing
      context += `\n**NPC Attitude**: 80+ helpful, favors | 60-79 polite | 40-59 neutral | 20-39 curt, suspicious | <20 hostile, refuses service. Never reference scores.`;
    } else {
      // Non-faction NPC: Use overall reputation
      context += `\n**NPC Attitude**: 80+ warm, eager | 60-79 polite | 40-59 neutral, cautious | 20-39 cold, upfront payment | <20 hostile, refuses service. Never reference scores.`;
    }
  }

  return context;
}

/**
 * Build weather context for narrative generation
 * Converts technical weather state into evocative prompts for LLM
 * @param {Object} weather - Weather state from weatherService
 * @param {Object} gameState - Current game state
 * @returns {string} Formatted weather context for LLM
 */
function buildWeatherContext(weather, gameState) {
  if (!weather) return '';

  const parts = [];

  // Header
  parts.push('### Current Weather & Atmosphere');

  // Precipitation
  if (weather.precipitation !== 'none') {
    const intensityDesc = weather.intensity > 0.7 ? 'heavy' :
                         weather.intensity > 0.4 ? 'moderate' : 'light';
    parts.push(`- ${intensityDesc} ${weather.precipitation} falling`);
  }

  // Cloud cover
  const cloudDesc = weather.cloudCover > 0.8 ? 'overcast skies' :
                   weather.cloudCover > 0.5 ? 'cloudy skies' :
                   weather.cloudCover > 0.2 ? 'partly cloudy' : 'clear skies';
  parts.push(`- ${cloudDesc}`);

  // Wind
  if (weather.windSpeed > 20) {
    parts.push(`- strong winds (${Math.round(weather.windSpeed)} km/h)`);
  } else if (weather.windSpeed > 10) {
    parts.push(`- breezy winds`);
  }

  // Visibility
  if (weather.visibility < 0.5) {
    parts.push(`- poor visibility (${Math.round(weather.visibility * 100)}%)`);
  }

  // Special conditions
  if (weather.special === 'thunderstorm') {
    parts.push(`- **THUNDERSTORM**: Lightning flashes, thunder rumbling`);
  }
  if (weather.special === 'fog') {
    parts.push(`- **HEAVY FOG**: Streets shrouded in mist`);
  }
  if (weather.special === 'heatwave') {
    parts.push(`- **OPPRESSIVE HEAT**: Shimmering air, intense sun`);
  }
  if (weather.special === 'rainbow') {
    parts.push(`- Rainbow visible after recent rain`);
  }

  // Ground conditions (from fx)
  if (weather.fx?.surfaceWetnessNow > 0.5) {
    parts.push(`- Ground is wet and muddy`);
  }

  // Atmospheric guidance for LLM
  parts.push('\n**Use weather naturally (not every turn)**: NPC reactions, sensory details (sounds, smells), practical effects (wet clothes, mud). Summer afternoons in Mexico City often bring thunderstorms.');

  return parts.join('\n');
}

/**
 * Build active body effects context for narrative
 * @param {Array} activeEffects - Active body effects array
 * @returns {string} Effects context for narrative
 */
function buildEffectsContext(activeEffects = []) {
  if (!activeEffects || activeEffects.length === 0) return '';

  const parts = [];
  parts.push('### Active Body Effects');
  parts.push('Maria is currently experiencing the following conditions:\n');

  activeEffects.forEach(effect => {
    const remaining = formatDuration(effect.remainingMinutes);
    parts.push(`- **${effect.emoji} ${effect.name}**: ${effect.description} (${remaining} remaining)`);

    // Add narrative flags as hints
    if (effect.narrativeFlags && effect.narrativeFlags.length > 0) {
      parts.push(`  * Narrative hints: ${effect.narrativeFlags.join(', ')}`);
    }
  });

  parts.push('\n**Narrative Instructions**: Weave effects naturally when contextually relevant (not every turn).');
  parts.push('**Portrayals**: Hallucinations (distorted reality) | Poisoned (nausea, trembling) | Intoxicated (slurred, swaying) | Wounded (pain, injuries) | Blessed (confidence, ease)');
  parts.push('**NPC Reactions**: Intoxicated/Hallucinating = scandal (-10 to -30 reputation, may refuse service) | Poisoned/Wounded = concern or suspicion | Use relationshipChanges/reputationEvents for mechanical tracking.');

  return parts.join('\n');
}

/**
 * Convert degrees to cardinal direction
 * @param {number} degrees - Facing direction in degrees (0=N, 90=E, 180=S, 270=W)
 * @returns {string} Cardinal direction
 */
function getCardinalDirection(degrees) {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return 'North';
  if (normalized >= 22.5 && normalized < 67.5) return 'Northeast';
  if (normalized >= 67.5 && normalized < 112.5) return 'East';
  if (normalized >= 112.5 && normalized < 157.5) return 'Southeast';
  if (normalized >= 157.5 && normalized < 202.5) return 'South';
  if (normalized >= 202.5 && normalized < 247.5) return 'Southwest';
  if (normalized >= 247.5 && normalized < 292.5) return 'West';
  if (normalized >= 292.5 && normalized < 337.5) return 'Northwest';
  return 'North'; // Default
}

/**
 * Build map context for narrative generation
 * @param {Object} mapData - Current map data
 * @param {Object} playerPosition - Player's current position
 * @param {number} playerFacing - Player facing direction in degrees (0=N, 90=E, 180=S, 270=W)
 * @param {string} currentMapId - Current map identifier
 * @returns {string} Formatted map context for LLM
 */
function buildMapContext(mapData, playerPosition, playerFacing, currentMapId) {
  if (!mapData || !playerPosition) {
    return '';
  }

  try {
    const gridSystem = getGridSystem(currentMapId, mapData);

    // Get nearby locations
    const nearby = gridSystem.getNearbyLocations(playerPosition, 4);

    // Get movement options
    const movementOptions = gridSystem.getMovementOptions(playerPosition);

    // Detect current room (for interior maps)
    const currentRoom = gridSystem.getCurrentRoom(playerPosition);

    // DEBUG: Log room detection for troubleshooting
    if (mapData.type === 'interior') {
      console.log('[NarrativeAgent] Room Detection:', {
        position: `(${playerPosition.x}, ${playerPosition.y})`,
        detectedRoom: currentRoom?.name || 'NONE',
        mapName: mapData.name
      });
    }

    // Build context string
    let context = `\n### Spatial Context (Current Location):
Player Position: Grid (${playerPosition.gridX || Math.floor(playerPosition.x / 20)}, ${playerPosition.gridY || Math.floor(playerPosition.y / 20)})
${currentRoom ? `**Current Room: ${currentRoom.name}**` : ''}
${playerFacing !== undefined ? `Player Facing: ${getCardinalDirection(playerFacing)}` : ''}

`;

    // Add nearby locations if any
    if (nearby.length > 0) {
      context += `Nearby Locations:\n`;
      nearby.forEach(loc => {
        context += `- ${loc.name} (${loc.distance} steps ${loc.direction})${loc.type ? ` [${loc.type}]` : ''}\n`;
      });
      context += '\n';
    }

    // Add nearby furniture for interior maps
    if (mapData.type === 'interior' && mapData.furniture) {
      // Helper function to check if furniture is in the same room as player
      const isFurnitureInCurrentRoom = (furniture) => {
        if (!currentRoom) return true; // If no room detected, show all furniture

        const fx = furniture.position ? furniture.position[0] : furniture.x;
        const fy = furniture.position ? furniture.position[1] : furniture.y;

        // Check if furniture center is in the same room polygon
        return gridSystem.isPointInPolygon([fx, fy],
          mapData.rooms.find(r => r.id === currentRoom.id)?.polygon || []);
      };

      const nearbyFurniture = mapData.furniture.filter(f => {
        const fx = f.position ? f.position[0] : f.x;
        const fy = f.position ? f.position[1] : f.y;
        const dist = Math.abs(playerPosition.x - fx) + Math.abs(playerPosition.y - fy);
        // CRITICAL: Only show furniture in the same room as the player
        return dist < 200 && isFurnitureInCurrentRoom(f);
      });

      if (nearbyFurniture.length > 0) {
        context += `Nearby Objects/Furniture (in ${currentRoom?.name || 'current area'}):\n`;
        nearbyFurniture.forEach(f => {
          const fx = f.position ? f.position[0] : f.x;
          const fy = f.position ? f.position[1] : f.y;
          const dist = Math.floor(Math.abs(playerPosition.x - fx) + Math.abs(playerPosition.y - fy) / 20);
          const dx = fx - playerPosition.x;
          const dy = fy - playerPosition.y;
          const direction = Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? 'to the east' : 'to the west')
            : (dy > 0 ? 'to the south' : 'to the north');

          const displayName = f.name || f.type || 'object';
          context += `- ${displayName} (${dist} steps ${direction})\n`;
        });
        context += '\n';
      }
    }

    // Add movement options
    context += `Movement Options:\n`;
    Object.entries(movementOptions).forEach(([direction, option]) => {
      const status = option.valid ? '✓ CLEAR' : `✗ BLOCKED (${option.reason})`;
      context += `- ${direction.toUpperCase()}: ${status}\n`;
    });

    // Determine if interior or exterior based on map type
    const isInterior = mapData.type === 'interior';
    const mapTypeName = isInterior ? 'INTERIOR' : 'EXTERIOR';

    context += `\n### Narrative Instructions for Movement:
**Map Type: ${mapTypeName}** - Adjust descriptions accordingly!

- MOVEMENT COMMANDS ("I walk north", "I go east", "I walk south", "I walk west"):
  * Keep description BRIEF (3-4 sentences maximum, 60-80 words)
  * **CRITICAL: Use SECOND PERSON ("You walk...", "You step...", "You pass...") - NEVER first person ("I walk")**
  * Focus on immediate surroundings and what the player observes
  * Use vivid sensory details (sounds, sights) but stay concise
  * DO NOT include long dialogues or complex interactions during simple movement
  * DO NOT mention grid coordinates or game mechanics - stay in-character and historical

${isInterior ?
`**INTERIOR Movement** - Currently inside ${mapData.name || 'a building'}:
  ${currentRoom ? `* **CRITICAL**: You are in the **${currentRoom.name}** - ONLY describe furniture/features from this room!` : ''}
  * ONLY describe furniture listed in "Nearby Objects/Furniture" above (already filtered to current room)
  * DO NOT mention furniture from other rooms 
  * Describe room features: walls, doors, windows, lighting specific to current room
  * Note light sources: candles, windows, sunlight streaming in
  * Include interior sounds: creaking floorboards, rustling fabric, distant voices
  * Reference the current room name naturally when appropriate
  * Example (SECOND PERSON): "You step toward the eastern wall of the ${currentRoom?.name.toLowerCase() || 'room'}, where sunlight streams through a narrow window."`
:
`**EXTERIOR Movement** - Currently outdoors in the city:
  * Describe relevent local landscape features. be vivid and specific.
  * Mention people Maria passes, if any
  * Include ambient soundscape and sights if relevent 
  * Note weather and light as needed
  * Example (SECOND PERSON): "You walk north along the dusty Calle de Plateros. The cathedral's unfinished towers loom ahead, scaffolding wrapped around its stone facade. A vendor calls out, selling tamales from a clay pot."`}

- If BLOCKED by obstacle, explain why in 1 sentence, then describe what the player sees instead
- Mention nearby locations naturally to give spatial awareness (see list above)
- Use compass directions (north, south, east, west) when describing positions`;

    return context;

  } catch (error) {
    console.error('Error building map context:', error);
    return '';
  }
}

/**
 * Build narrative agent system prompt from scenario-specific prompts
 * @param {Object} scenarioPrompts - Scenario-specific prompt modules
 * @param {string} [mapContext] - Optional map context for spatial awareness
 * @returns {string} Complete narrative agent system prompt
 */
 function buildNarrativePrompt(scenarioPrompts, mapContext = '', gameState = {}) {
  // PERFORMANCE: Cache static prompt sections (everything except mapContext)
  // Only rebuild when scenario changes (extremely rare - typically once per session)
  const cacheKey = JSON.stringify(scenarioPrompts);

  if (!cachedSystemPrompt || cachedScenarioId !== cacheKey) {
    console.log('[NarrativeAgent] Building and caching static system prompt...');

    const core = scenarioPrompts.core || {};
    const mechanics = scenarioPrompts.mechanics || {};
    const historical = scenarioPrompts.historical || {};
    const narrative = scenarioPrompts.narrative || {};

    const schemaSection = `### Output Schema
Return strict JSON (no markdown fencing, no prose outside the object).

{
  "responseType": "movement|narration",
  "narrative": ["array of paragraphs (1-2 sentences each). Second person. Embed NPC speech as quotes: She says, \"I need help.\" Be concise."],
  "sceneDescription": "string",
  "suggestedCommands": ["#command"],
  "showPortraitFor": "string or null",
  "primaryPortrait": "null (engine assigns portrait automatically)",
  "experimentalPortraitChoice": "exact filename from portrait list OR null (EXPERIMENTAL: for A/B testing)",
  "primaryNPC": { "name": "...", "age": "...", "gender": "...", "occupation": "...", "casta": "...", "class": "...", "personality": "two traits", "appearance": "one sentence", "description": "one sentence" } or null (MUST be HUMAN physically present with Maria - NOT animals. Null if alone),
  "simpleInteraction": { "type": "vendor_offer|service_offer|donation_request|competitive_check|information_exchange|social_visit|extortion_demand|protection_racket|entertainment_tip|food_purchase|gamble_opportunity|labor_offer|neighbor_complaint|church_donation|null", ... } or {"type": "null"} or null,
  "requestNewPatient": true|false,
  "patientContext": { "reason": "string", "urgency": "low|moderate|high|critical" } or null,
  "npcDeparted": true|false,
  "companions": [{"name": "string", "role": "string"}],
  "entities": [{ "text": "...", "entityType": "npc|patient|animal|item|location", "tier": "story-critical|recurring|background", "occupation": "string", "description": "string", "wikipediaQuery": "string|null", "demographics": { "gender": "...", "age": "...", "casta": "...", "class": "..." } }],
  "interactionIntent": "medical_diagnosis|medical_followup|medical_purchase|house_call|nonmedical_request|vendor_offer|social|none"
}

**EXAMPLE - Correct Narrative Array Format (CONCISE):**
{
  "narrative": [
    "A woman's sharp voice calls through the door. \\"Open this at once, apothecary! I have urgent need.\\"",
    "**Will you ask for more information, or suggest a prescription?**"
  ],
  "responseType": "narration",
  "primaryNPC": null,
  "companions": [{"name": "João", "role": "pet"}]
}`;

    const interactionIntentSection = `### Interaction Intent (What NPC Asks Maria To DO)

**Medical:**
- **medical_diagnosis** = Patient present in shop, Maria examines/treats
- **medical_followup** = Patient returns for ongoing treatment
- **medical_purchase** = "Give me medicine for…" - Maria dispenses remedy, no examination
- **house_call** = MEDICAL ONLY. Messenger asks Maria to TRAVEL to sick/injured patient
  * ✓ "Father ill at monastery, come treat him"
  * ✗ "Man enters coughing, help me" (he's here = diagnosis) | ✗ "Can I buy medicine?" (purchase)

**CRITICAL - Timing Rule:**
Set intent when NPC makes OR is still waiting for a request. When NPC pays/accepts/departs (completing request), set intent to "none".
- Request turn: "My wife has fever, I need medicine" → medical_purchase ✓
- Waiting turn: NPC stands waiting for Maria's prescription → medical_purchase ✓ (request still active)
- Resolution turn: NPC pays 6 reales and departs with vial → "none" ✓ (request completed)

**Non-Medical:**
- **nonmedical_request** = Favors/errands unrelated to medicine (harvesting, deliveries, social visits)
- **vendor_offer** = NPC buying FROM or selling TO Maria (set direction field). NOT for medicine requests!
- **social** = Pure conversation, no actionable request
- **none** = No clear request this turn`;

    const modeSection = `### Mode Selection
**"movement"** = Compass directions (north/south/east/west) OR explicit exits (outside/upstairs/downstairs). 2-3 sentences, second person.
  - ✓ "go north", "walk east", "leave building"
  - ✗ "go to door", "let's move on", "go see who's there" (all = narration)
  - Destinations ("go to bakery") = full travel scene: departure, traversal, arrival. Advance time, update location.

**"narration"** = Everything else. 60-80 words MAX, second person. NPC speech embedded with quotes. Be CONCISE.`;

    const agencySection = `### Player Agency & Pacing
- If the player (i.e. Maria) enters a command to do something, do it, no matter how strange! (Within reason - i.e. if the player says "fly on a spaceship," this is plainly impossible. But if they say "stand on my head and say a hail mary," then depict Maria doing EXACTLY that - but also depict realistic consequences.)
- Stop before mechanical actions (mixing, prescribing, buying) so UI modals handle them - UNLESS the player's command contains specific modal results (prescription details, purchase list, mixing ingredients). If the command has modal results, treat the action as COMPLETE and show the aftermath.
- Show real consequences, NPC reactions, sensory detail grounded in 1680 Mexico City.
- Close most narration responses with a bold prompt offering 2 concise follow-up choices unless the moment demands free input.
-  Cut flowery descriptions, redundant details, and obvious observations. Trust the player's imagination.

**Time Passage for Waiting Actions:**
- When player waits for specific event with stated duration ("wait for [NPC]" after saying "return in X minutes"):
  * Check recent conversation history for stated time duration
  * Advance time to MATCH that duration (e.g., "return in 30 minutes" → advance 30-35 minutes)
  * Show the expected event occurring (NPC returns, task completes, etc.)
- Passive observation ("look around"): 1-5 minutes, pure description
- Vague waiting ("wait", "rest"): 10-15 minutes, may introduce new event`;

    const momentumSection = `### Momentum & Stakes
- Every turn must deliver two micro-beats: immediate reaction to the player AND a fresh consequence, clue, or escalation.
- Think like a skilled novelst: always move things forward in a way that honors character intent, the setting, and the deeply mysterious complexity of the human psyche.
- Never leave the scene idle; even if Maria is alone and reflective, something must happen next. Always something new.`;

    const psychologySection = `### Emotional Realism
- Match reactions to status and context: nobles are haughty and often have the pox, bandits press threats, the poor plead or despair.
- NPCs have purposeful, idiosycratic, psychologically realistic responses.`;

    const comportmentSection = `### Etiquette & Historical Detail
- Use proper address (Doña, Don, titles) and note posture/rituals common to 1680 Mexico City.
- Highlight caste dynamics: elites expect deference, commoners hedge, soldiers enforce authority.`;

    const dialogueSection = `### NPC Dialogue
- If a primary NPC is present, typically include at least one line of quoted speech from them.
- When Maria performs any door action after a knock (go/approach/open/see/answer/check the door), reveal who stands there immediately and let them speak first. Complete the encounter in one response.
- Tie speech to the NPC role and stakes; vary tone, length, and mannerisms so debt collectors, servants, and beggars sound distinct.
- CRITICAL: Embed all dialogue directly in the "narrative" field using quotation marks. Example: He steps forward. "Doña Maria," he says, "I need your help." Do NOT use separate dialogue fields—everything goes in narrative.`;

    const unexpectedSection = `### Texture & Surprise
- Draw from Mexico City street life—vendors hawking goods, gossiping neighbors, stray animals, distant bells, sudden weather shifts.
- Real life is at times unexpected in a David Lynch-ian way. Reflect that. Occasional uncanny or surreal or unexpected touches are welcome **if** they remain grounded in the period.`;

    const variationSection = `### Dialogue & Length Variety
- Vary the amount of speech: some NPCs ramble or argue, others mutter a word or two. Some suffer from diseases like syphilis which make them mad or ashamed.
- Remember how humans ACTUALLY talk. This is not a fantasy novel or historical fiction. It's real life.
- Dialogue pulls things forward - always advance the plot powerfully.
- DOOR ACTIONS: When player opens/approaches/answers door after a knock, complete full encounter in ONE response (reveal visitor + their greeting). Don't stop at "reaching for latch."`;

    const animalSection = `### Animals & Non-Human Actors
- Animals do not speak or reason like humans. Describe their behaviour through body language only.
- If an animal is the focus, show who is handling it or why it matters; otherwise keep the primary NPC slot for humans.`;

    const closingSection = `### Closing Prompt - CRITICAL REQUIREMENT
- You should usually end the "narrative" field with a bolded follow-up question offering 2-3 concrete, contextual choices.
- Format: **"Will you [specific action A], or [specific action B]?"** or **"Will you [A], [B], or [C]?"**
- The question must always be the final sentence.
- Make it propell the narrative forward in a realistic way.
- use the word "prescribe" or "prescription" in one option if you think Maria might plausibly prescribe something in response to the turn
- Even when NPCs depart or complete transactions, the question is about MARIA's next action, not the NPC's.

**GOOD EXAMPLES**:
- **"Will you open the door and face the guard, or slip out the back entrance?"**
- **"Will you accept her offer, decline politely, or ask for more time?"**
- Ending with no question at all if a card has been active, a sale made, a contract card offered, or other event which already presents a choice to the player implicitly.
-

**BAD EXAMPLES**:
- ❌ "What will you do?" (too vague, no specific options)
- ❌ After NPC buys opium and departs: "Will you seek out the confessor to ease your spirit, or return to your lodgings?" (refers to NPC, not Maria!)

**When to include the question** (80% of turns):
  * After conversations end (NPC leaves, finishes speaking, or waits for response)
  * At scene transitions or time passage
  * When Maria is alone and deciding what to do next
  * When an NPC demands something or makes a request (ESPECIALLY this - like a guard demanding entry!)

- If you skip the question, end with a vivid "narrative beat" that propells plot forward.`;

    const simpleInteractionSection = `### Simple Interactions (SIMPLE MODE only)
Brief non-medical encounters (≤50 words). If medical (sickness/remedies/symptoms), set type:"null".

**CRITICAL - Role Exclusivity**:
- If simpleInteraction is set (vendor_offer/service_offer/etc), then requestNewPatient MUST be false and interactionIntent must match the interaction type.
- If requestNewPatient is true, then simpleInteraction MUST be null.
- An NPC has ONE purpose per visit.

| Type | Use Case | Emoji Examples |
|------|----------|----------------|
| vendor_offer | NPC buying FROM or selling TO Maria | 💧 fish (sell TO Maria), 🌿 cochineal (buy FROM Maria) |
| service_offer | NPC providing service TO Maria OR requesting Maria's expertise | 💧 water delivery (TO Maria), 🎨 paint advice (FROM Maria) |
| donation_request | Church/charity | ⛪ alms, 💒 offerings |
| competitive_check | Rival scouting | 💊 other apothecary |
| extortion_demand | Threats/demands | 💀 criminals, officials |
| gamble_opportunity | Betting invite | 🎲 dice, 🃏 cards |
| investment_offer | Investment TO Maria | ⛪ church bonds (10%, low risk), 🚢 galleon (120-200%, high risk), 🏔️ mining (70-200%, high risk) |

**CRITICAL - Nested Object Structure (REQUIRED):**

**vendor_offer** - NPC buying FROM or selling TO Maria:
{
  "type": "vendor_offer",
  "npcName": "Carmen the Fish Seller",
  "npcPortrait": null,
  "npcRole": "fish seller",
  "direction": "selling_to_maria",  // "selling_to_maria" (NPC is seller, Maria is buyer) OR "buying_from_maria" (NPC is buyer, Maria is seller)
  "context": "offers fresh fish from Xochimilco",
  "offer": {
    "item": "fish",
    "price": 2,  // MUST be positive integer (1-1000), NEVER 0/"variable"/null. Use asking price even if negotiable.
    "description": "fresh catch from lake",
    "quality": "fresh",
    "quantity": 1,
    "emoji": "🐟"
  }
}

// Examples:
// NPC selling TO Maria: {"direction": "selling_to_maria", "npcName": "Fish Seller", "context": "offers fresh fish", "offer": {"item": "fish", "price": 2}}
// NPC buying FROM Maria: {"direction": "buying_from_maria", "npcName": "Don Lorenzo", "context": "seeks to purchase cochineal from Maria", "offer": {"item": "cochineal", "price": 50}}

**service_offer** - NPC offering services TO Maria OR requesting Maria's services:
{
  "type": "service_offer",
  "npcName": "Water Seller",
  "npcPortrait": null,
  "npcRole": "water carrier",
  "direction": "selling_to_maria",  // "selling_to_maria" (NPC provides service, Maria pays) OR "buying_from_maria" (NPC wants Maria's expertise, NPC pays)
  "context": "offers fresh water delivery",
  "offer": {
    "item": "water delivery",
    "price": 1,
    "description": "daily water delivery for one week",
    "stock": 10,
    "quality": "clean",
    "emoji": "💧"
  }
}

// Examples:
// NPC selling TO Maria: {"direction": "selling_to_maria", "npcName": "Water Seller", "context": "offers water delivery", "offer": {"item": "water delivery", "price": 3}}
// NPC buying FROM Maria: {"direction": "buying_from_maria", "npcName": "Toymaker", "context": "needs paint consultation", "offer": {"item": "paint stabilization advice", "price": 10}}

**donation_request** - NPC asking for charity:
{
  "type": "donation_request",
  "npcName": "Beggar",
  "request": {
    "item": "bread",
    "reason": "starving family",
    "urgency": "high",
    "reputationImpact": {"donate": 5, "refuse": -3}
  }
}

**gamble_opportunity** - NPC inviting Maria to gamble:
{
  "type": "gamble_opportunity",
  "npcName": "Card Player",
  "gamble": {
    "gameType": "cards|dice|taba|cockfight|lottery",
    "wager": 5,
    "potentialWin": 10,
    "odds": "even|favorable|unfavorable",
    "description": "high-low card game",
    "delayed": false // IMPORTANT: Set to true ONLY for lottery (cathedral drawings have delayed results)
  }
}
// For lottery specifically (church raffles for cathedral funds):
{
  "type": "gamble_opportunity",
  "npcName": "Don Esteban the Lottery Seller",
  "gamble": {
    "gameType": "lottery",
    "wager": 1,
    "potentialWin": 10,
    "odds": "unfavorable",
    "description": "church lottery for cathedral repairs",
    "delayed": true // Lottery drawings happen later at cathedral steps
  }
}

**investment_offer** - NPC offering investment opportunity TO Maria:
{
  "type": "investment_offer",
  "npcName": "Spanish Merchant",
  "npcPortrait": null,
  "npcRole": "merchant investor",
  "context": "offers share in silver mining venture",
  "investment": {
    "investmentType": "silver_mining",  // church_bond, manila_galleon, cacao_plantation, real_estate, apothecary_syndicate
    "amount": 100,  // Capital required (positive integer 50-500)
    "expectedReturn": {
      "min": 120,
      "max": 200
    },
    "duration": 365,  // Days until payout (90-1095)
    "riskLevel": "high",  // low, medium, high
    "description": "silver mine in Zacatecas needs investor",
    "emoji": "⛏️"  // ⛪ bonds, 🚢 galleon, 🌱 cacao, 🏠 estate, ⚗️ syndicate
  }
}

**Gambling odds**: favorable (60%) if NPC drunk/unskilled, even (50%) for fair game, unfavorable (40%) if NPC skilled/cheating.

**CRITICAL**: Always use nested "offer", "request", "gamble", or "investment" objects. NEVER use flat structure with fields at root level.`;

    const crisisActive = gameState?.crisis?.active;
    const crisisResolutionSection = crisisActive ? `### Crisis Context
- A crisis is in progress (${gameState.crisis?.reason || 'high stakes confrontation'}).
- Describe events clearly so consequences are unmistakable (escape, surrender/arrest, capture, bribery, death, or ongoing standoff).
- Do NOT declare game mechanics. Show the outcome vividly and let downstream systems handle consequences.` : '';

    const npcsAndPortraitsSection = `### NPCs & Portraits
**Demographics**: gender (male/female/unknown), age (child/young/adult/middle-aged/elderly), casta (español/criollo/mestizo/mulato/africano/indio), class (elite/middling/common/poor/religious/enslaved/artisan), occupation (short noun).

**CRITICAL - Gender & Class Inference:**
- **Titles with "Father"** → gender: male, class: religious (e.g., "Father Anselmo", "Reverend Father Superior de la Cuesta")
- **Titles with "Mother"** → gender: female, class: religious (e.g., "Mother Superior Burgos")
- **Titles with "Fray"/"Padre"** → gender: male, class: religious (e.g., "Fray Diego")
- **Titles with "Doña"** → gender: female 
- **Titles with "Don"** → gender: male 
- **Religious occupations**: priest, monk, nun, friar, abbess, abbot (NOT muleteer, merchant, etc.)

**primaryNPC**: Person PHYSICALLY WITH Maria. Complete demographics required. Null if alone.
**primaryPortrait**: Always null (engine auto-assigns from demographics).
**Continuity**: Same NPC = same name across turns. But NPCs leave when appropriate.

**Departures & Companions**:
- npcDeparted: true when NPC exits narrative
- companions: [{"name","role"}] for NPCs traveling/staying with Maria. Empty array if none (not null).
- Brief visitors/vendors NOT companions unless explicitly accompanying Maria.

**Entities**: List 2-3 meaningful entities player may interact with (no throwaways).`;

    const patientSection = `### Patient Flow
- You control patient arrivals: requestNewPatient true only when context supports it (shop open, no active consultation).
- When an emissary only wants to buy or collect medicine, keep them in the shop and use interactionIntent "medical_purchase".
- interactionIntent "house_call" for situations where Maria must leave the shop to treat or examine someone.
- npcDeparted true when the NPC would realistically depart the departure in narrative.`;

    const historySection = historical.accuracy
      ? `### Historical Accuracy
${historical.accuracy}
${historical.social || ''}`
      : '';

    const toneSection = core.tone ? `### Style
${core.tone}` : '';

    const commandsSection = mechanics.commands ? `### Command Suggestions
${mechanics.commands}` : '';

    const pacingSection = narrative.pacing ? `### Scene Pacing
${narrative.pacing}` : '';

    const sections = [
      core.identity || 'You are the Narrative Engine for HistoryLens, a historical simulation set in 1680 Mexico City.',
      toneSection,
      schemaSection,
      interactionIntentSection,
      modeSection,
      agencySection,
      momentumSection,
      psychologySection,
      comportmentSection,
      unexpectedSection,
      variationSection,
      dialogueSection,
      animalSection,
      closingSection,
      simpleInteractionSection,
      crisisResolutionSection,
      npcsAndPortraitsSection,
      patientSection,
      commandsSection,
      historySection,
      pacingSection
    ];

    // Cache the static prompt (everything except dynamic mapContext)
    cachedSystemPrompt = sections.filter(Boolean).join('\n\n');
    cachedScenarioId = cacheKey;
  }

  // PERFORMANCE: Append dynamic mapContext to cached static prompt
  // This avoids rebuilding 95% of the prompt every turn
  return mapContext ? `${cachedSystemPrompt}\n\n${mapContext.trim()}` : cachedSystemPrompt;
}

function buildConversationHistory(conversationHistory, journal = [], currentTurn = 0) {
  // Validate inputs
  if (!Array.isArray(journal)) {
    console.warn('[buildConversationHistory] journal is not an array:', typeof journal);
    journal = [];
  }

  // Log basic stats
  console.log(`[buildConversationHistory] Processing ${conversationHistory?.length || 0} total messages, ${journal?.length || 0} journal entries`);

  if (!conversationHistory || conversationHistory.length === 0) {
    console.warn('[buildConversationHistory] Empty or missing conversation history!');
    return '';
  }

  // PHASE 1 FIX: Process messages sequentially instead of enforcing strict pairing
  // This allows medical events (Q&A, prescriptions, contracts) to be included without breaking

  // PERFORMANCE: Reduced from 20 to 14 messages for balanced context/speed
  const recentMessages = conversationHistory.slice(-14);

  const history = [];

  // Add older journal entries for compressed context (if available)
  // EXTENDED: Now includes turns 15-30 ago for better long-term memory
  if (journal.length > 5) {
    // Very old events (16-30 turns ago) - compressed summaries
    const veryOldJournal = journal.slice(-30, -14);
    if (veryOldJournal.length > 0) {
      history.push('### Past Events (Brief Summary):');
      veryOldJournal.forEach(entry => {
        if (entry?.content) {
          // Further compress by taking first sentence only
          const firstSentence = entry.content.split('.')[0] + '.';
          history.push(firstSentence);
        }
      });
      history.push(''); // Blank line separator
    }

    // Older events (6-15 turns ago) - standard summaries
    const oldJournal = journal.slice(-15, -5);
    if (oldJournal.length > 0) {
      history.push('### Earlier Events (Summary):');
      oldJournal.forEach(entry => {
        if (entry?.content) {
          history.push(entry.content);
        }
      });
      history.push(''); // Blank line separator
    }
  }

  // Recent events in full detail - ALL message types included
  if (recentMessages.length > 0) {
    history.push('### Recent Events:');

    recentMessages.forEach(msg => {
      // Skip hidden messages (internal system prompts not meant for LLM context)
      if (msg.hidden) return;

      // Skip messages without content
      if (!msg.content) return;

      // Format based on role - no pairing enforcement
      if (msg.role === 'user') {
        history.push(`**Maria**: ${msg.content}`);
      } else if (msg.role === 'assistant') {
        history.push(msg.content);
      } else if (msg.role === 'system') {
        // System messages are meta-events like [CONTRACT ACCEPTED], [PRESCRIPTION ADMINISTERED]
        history.push(`*${msg.content}*`);
      }
    });
  }

  // Update logging for new sequential approach
  const visibleMessages = recentMessages.filter(m => !m.hidden && m.content);
  const tokens = history.join('\n').length / 4;
  console.log(`[History] ${visibleMessages.length} messages (${visibleMessages.filter(m => m.role === 'user').length} user, ${visibleMessages.filter(m => m.role === 'assistant').length} assistant, ${visibleMessages.filter(m => m.role === 'system').length} system) -> ${Math.ceil(tokens)} tokens`);

  return history.join('\n');
}

/**
 * Generate narrative response from player action
 * @param {Object} params - Parameters for narrative generation
 * @param {string} params.scenarioId - Current scenario identifier
 * @param {string} params.playerAction - What the player typed
 * @param {Array} params.conversationHistory - Recent conversation history
 * @param {Object} params.gameState - Current game state
 * @param {number} params.turnNumber - Current turn number
 * @param {Object|null} params.selectedEntity - NPC entity if one is selected
 * @param {string} params.incorporatedContent - Optional incorporated critique
 * @param {string} params.additionalQuestions - Optional additional questions
 * @param {Object|null} params.mapData - Current map data for spatial context
 * @param {Object|null} params.playerPosition - Current player position
 * @param {string|null} params.currentMapId - Current map identifier
 * @param {Object|null} params.playerSkills - Player's skills from useSkills hook
 * @param {Array} params.journal - Journal entries for history compression
 * @param {string|null} params.recentPortrait - Portrait file from previous turn (for consistency)
 * @param {boolean} params.isContinuation - Flag if conversation is continuing from previous turn
 * @param {string|null} params.continuationNPC - Name of NPC from previous turn (if continuing)
 * @returns {Promise<Object>} Narrative response
 */
export async function generateNarrative({
  scenarioId = '1680-mexico-city', // Default for backward compatibility
  playerAction,
  conversationHistory,
  gameState,
  turnNumber,
  selectedEntity = null,
  incorporatedContent = '',
  additionalQuestions = '',
  mapData = null,
  playerPosition = null,
  playerFacing = null,
  currentMapId = null,
  reputation = null,
  playerSkills = null,
  journal = [],
  recentPortrait = null,
  isContinuation = false,
  continuationNPC = null,
  weather = null, // PHASE 1: Weather state for narrative integration
  options = {} // NEW: Options for special request types (e.g., list requests)
}) {
  try {
    // Load scenario
    const scenario = scenarioLoader.loadScenario(scenarioId);

    // Build map context if available
    const mapContext = mapData && playerPosition && currentMapId
      ? buildMapContext(mapData, playerPosition, playerFacing, currentMapId)
      : '';

    // Build narrative prompt with map context
      const narrativePrompt = buildNarrativePrompt(scenario.prompts, mapContext, gameState);

    // Build context
    const contextSummary = buildContextSummary(
      gameState,
      turnNumber,
      incorporatedContent,
      additionalQuestions
    );

    const entityContext = selectedEntity ? buildEntityContext(selectedEntity, playerAction) : '';

    // Build follow-up visit context (if applicable)
    let followUpContext = '';
    if (selectedEntity && selectedEntity.isFollowUpVisit) {
      const followUpData = selectedEntity.followUpContext || {};
      const sessionNum = followUpData.sessionNumber || 2;
      const previousTreatments = followUpData.previousTreatments || [];
      const daysSince = followUpData.daysSinceLastVisit || 3;
      const reason = followUpData.scheduledReason || 'follow-up examination';

      followUpContext = `
### FOLLOW-UP VISIT CONTEXT

**THIS IS A SCHEDULED FOLLOW-UP VISIT** - ${selectedEntity.name} was previously treated by Maria and is returning as scheduled.

**Previous Treatment Summary**:
- Initial diagnosis: ${selectedEntity.treatmentProgress?.initialDiagnosis || 'Not recorded'}
- Treatments given: ${previousTreatments.join(', ') || 'Unknown'}
- Days since last visit: ${daysSince}
- Session number: ${sessionNum}
- Reason for return: ${reason}

**Your Task**:
1. Generate a narrative showing ${selectedEntity.name} returning to the shop
2. The patient should reference their previous visit and report on their condition
3. Determine treatment outcome based on the treatment given and natural progression:
   - **improving**: Condition is getting better, symptoms reduced
   - **stable**: No change, symptoms persist at same level
   - **worsening**: Condition deteriorated, new symptoms or complications
   - **resolved**: Fully recovered, no remaining symptoms
4. Be realistic about medical progression:
   - Wounds heal over days (3-7 days typical)
   - Infections either resolve or worsen (antibiotics didn't exist)
   - Fevers break after 2-3 days if treatment works
   - Pain management is temporary, underlying causes persist
5. Patient mood should match outcome: grateful if better, worried if worse

**CRITICAL**: Include "outcomeStatus" field in your response with one of: improving, stable, worsening, resolved
**CRITICAL**: Include "symptomChanges" array showing before/after for each symptom
**CRITICAL**: Include "needsFurtherTreatment" boolean

**Example Response Structure**:
{
  "narrative": [
    "Ximena returns to the shop, walking more easily than before. She smiles as she shows you her arm where the wound was.",
    "The redness has faded significantly, and the swelling is nearly gone. She flexes her fingers with only a slight wince. \\"Doña Maria, your treatment worked wonders. The pain is much better.\\""
  ],
  "outcomeStatus": "improving",
  "symptomChanges": [
    {"symptom": "Pain", "before": "severe", "now": "mild"},
    {"symptom": "Redness", "before": "moderate", "now": "minimal"}
  ],
  "patientMood": "grateful",
  "needsFurtherTreatment": true
}
`;
    }

    // Build simple interaction context (if applicable)
    let simpleInteractionContext = '';
    if (selectedEntity?.simpleInteractionType) {
      // Compressed interaction type guidance 
      const interactionGuidance = {
        vendor_offer: { tone: 'businesslike, impatient, transactional', items: 'cochineal dye (12r), textiles, pottery, spices, tools', vary: 'urgency, quality claims' },
        service_offer: { tone: 'cheerful, direct, salesmanlike', items: 'aqueduct water (3 reales), river water (2r), firewood (oak/pine, 4r), charcoal (6r)', vary: 'quality claims, source, urgency' },
        donation_request: { tone: ' humble, specific', items: 'bread (1r), tortillas, medicine, coins (2-3r)', vary: 'family situation, desperation level' },
        competitive_check: { tone: 'calculating, subtly competitive, friendly facade', items: 'requests to tour workshop, questions about ingredient sources, inquiries about techniques, general scouting', vary: 'how friendly vs obvious the competitive intent is' },
        information_exchange: { tone: 'coy, street-smart, transactional', items: 'gossip (1-2r), warnings, intel about Inquisitor/officials', vary: 'how much revealed upfront' },
        social_visit: { tone: 'warm but purposeful, concerned, friendly', items: 'warnings, books, herbs, advice', vary: 'urgency of warning' },
        extortion_demand: { tone: 'politely threatening, bureaucratic, matter-of-fact', items: '"voluntary donation" (5-10r), inspection fees, permits', vary: 'explicitness of threat' },
        protection_racket: { tone: 'matter-of-fact, casual threat, businesslike', items: 'monthly protection (5r), one-time payment (10r)', vary: 'how explicit the threat is' },
        entertainment_tip: { tone: 'charming, lighthearted, performative', items: 'songs (1r), stories, guitar music', vary: 'how much performed before asking' },
        food_purchase: { tone: 'cheerful, energetic, persuasive', items: 'fish from Xochimilco (2r), milk (1r), fresh tortillas, tamales', vary: 'freshness claims, time of day' },
        gamble_opportunity: { tone: 'persuasive, friendly, competitive', items: 'dice games (5-10r wager), card games (3-8r), cockfights (8-15r), lottery tickets (1-2r, delayed:true ONLY for lottery)', vary: 'wager amount, odds fairness, NPC skill level, delayed flag (true for lottery)' },
        investment_offer: { tone: 'businesslike, persuasive, opportunistic, confident', items: 'Church bonds (50r, low risk, 10%), Cacao shares (75r, 25-50%), Real estate (200r, 35-60%), Manila galleon (150r, high risk, 120-200%), Silver mining (100r, very high risk, 70-200%)', vary: 'investment amount, return estimates, urgency, NPC expertise/connection to opportunity' },
        labor_offer: { tone: 'earnest, humble, eager', items: 'work for food/shelter, apprentice position, temporary help', vary: 'skills offered, desperation' },
        neighbor_complaint: { tone: 'judgmental, indignant, self-righteous', items: 'noise complaints, smell complaints, impropriety accusations', vary: 'severity, specific grievance' },
        church_donation: { tone: 'persistent but pious, professional fundraiser', items: 'cathedral repairs, feast day expenses, charity for poor (2-10r)', vary: 'cause, urgency' }
      };

      const guidance = interactionGuidance[selectedEntity.simpleInteractionType] || { tone: 'direct', items: 'mundane goods', vary: 'approach' };

      // Add gambling history context if applicable
      let historyContext = '';
      if (selectedEntity.simpleInteractionType === 'gamble_opportunity' && gameState?.gamblingHistory?.byNPC) {
        const npcHistory = gameState.gamblingHistory.byNPC[selectedEntity.name];
        if (npcHistory) {
          historyContext += `\n**Gambling History with ${selectedEntity.name}**: ${npcHistory.totalWins}W-${npcHistory.totalLosses}L, net ${npcHistory.netGain >= 0 ? '+' : ''}${npcHistory.netGain}r. `;
          if (npcHistory.totalWins > npcHistory.totalLosses) {
            historyContext += `NPC is wary (Maria wins too often). May offer worse odds or be reluctant.`;
          } else if (npcHistory.totalLosses > npcHistory.totalWins * 2) {
            historyContext += `NPC sees Maria as easy money. May be eager, offer bigger wagers.`;
          }
        }
        const currentStreak = gameState.gamblingHistory.currentStreak;
        if (currentStreak && currentStreak.count >= 3) {
          historyContext += `\n**Current ${currentStreak.count}-game ${currentStreak.type} streak!** Other gamblers are taking notice.`;
        }
      }

      // Add extortion history context if applicable
      if (selectedEntity.simpleInteractionType === 'extortion_demand' && gameState?.extortionHistory?.byNPC) {
        const npcHistory = gameState.extortionHistory.byNPC[selectedEntity.name];
        if (npcHistory) {
          historyContext += `\n**Extortion History with ${selectedEntity.name}**: `;
          if (npcHistory.timesPaid > 0) {
            historyContext += `Paid ${npcHistory.timesPaid}x (last: ${npcHistory.lastAmount}r). `;
            if (npcHistory.timesPaid > 1) {
              historyContext += `⚠️ ESCALATE: They expect regular payments now. Demand ${Math.floor(npcHistory.lastAmount * 1.3)}+ reales this time.`;
            } else {
              historyContext += `They remember Maria complied. May return for more.`;
            }
          }
          if (npcHistory.timesRefused > 0) {
            historyContext += `Refused ${npcHistory.timesRefused}x. ⚠️ NPC is ANGRY. Escalate threat level (veiled→direct, direct→violent). Higher demands.`;
          }
          if (npcHistory.timesReported > 0) {
            historyContext += `Reported to authorities ${npcHistory.timesReported}x. NPC is FURIOUS. This is personal now.`;
          }
        }
      }

      simpleInteractionContext = `
**SIMPLE INTERACTION MODE:**
Type: ${selectedEntity.simpleInteractionType}

**Approach**: ${guidance.tone}
**Typical items/offers**: ${guidance.items}
**Vary this encounter**: ${guidance.vary}, demographics, exact dialogue
${historyContext}

**Rules**:
- BRIEF (50 words max), direct offer/request, NO medical consultations, NO lengthy backstories
- MUST mention the NPC in the narrative text BEFORE populating simpleInteraction JSON
- Format: One physical action + one line of dialogue IN THE NARRATIVE TEXT

**CRITICAL - Two-Part Requirement:**
1. **Narrative Text**: Describe the NPC arriving/calling out + their opening line
2. **JSON Field**: Populate simpleInteraction with structured data

**Examples of CORRECT format:**
✓ Narrative: "A loud voice calls from outside. 'Fresh fish from Xochimilco!' Carmen the fish seller grins at you."
   JSON: {simpleInteraction: {type: "vendor_offer", npcName: "Carmen the Fish Seller"...}}

✓ Narrative: "An old woman approaches. 'Please, Señora, a few coins for bread?' She holds out a trembling hand."
   JSON: {simpleInteraction: {type: "donation_request", npcName: "Elderly Beggar Woman"...}}

**Examples of WRONG format:**
✗ Narrative: [ends with previous NPC leaving, no mention of new person]
   JSON: {simpleInteraction: {type: "vendor_offer"...}} ← WRONG! NPC not introduced!

**If you populate simpleInteraction JSON, you MUST introduce the NPC in the narrative text first. No exceptions.**

Generate a BRIEF, VARIED encounter. Don't reuse exact dialogue from previous turns.
`;
    }

    // PERFORMANCE: Lazy context building - only build when data exists and is needed
    const reputationContext = (reputation && selectedEntity)
      ? buildReputationContext(reputation, selectedEntity)
      : '';

    const weatherContext = weather
      ? buildWeatherContext(weather, gameState)
      : '';

    const skillsContext = (playerSkills && Object.keys(playerSkills).length > 0)
      ? buildSkillsContext(playerSkills)
      : '';

    const effectsContext = (gameState.activeEffects && gameState.activeEffects.length > 0)
      ? buildEffectsContext(gameState.activeEffects)
      : '';

    // PHASE 3: Build conversation continuation context
    let continuationContext = '';
    if (continuationNPC) { // Always inject if we have a previous NPC name
      continuationContext = `
**CRITICAL - Conversation Continuation:**
${continuationNPC} is STILL PRESENT from the previous turn.
The player is continuing their conversation with them.

DO NOT:
- Create a new NPC identity
- Change their name or description
- Introduce someone new unless the player explicitly mentions another person

DO:
- Use the EXISTING name: "${continuationNPC}"
- Continue the ongoing conversation naturally
- Maintain identity consistency
`;
    }

    // PHASE 3B: Build "no encounter" context when NPCs have departed
    let noEncounterContext = '';
    if (!selectedEntity && !isContinuation) {
      noEncounterContext = `
**No NPC Present:**
Previous NPCs have departed. Do NOT continue their scenes. Set primaryNPC/primaryPortrait to null.

**Waiting/Passive Actions & Time Passage:**
- **Waiting for specific events with stated duration**:
  * Check recent conversation history for stated time ("return in 30 minutes", "back in an hour")
  * Advance time to MATCH that duration (e.g., if they said "30 minutes", advance ~30 minutes)
  * Show the expected event occurring (person returns, task completes)
- **Passive observation** ("not much", "look around", "watch"): Pure description, minimal time (1-5 minutes), no new events
- **Vague waiting** ("rest", "wait" with no context): Brief time passage (10-15 minutes), introduce new event
`;
    }


    // Build conversation history (5 full turns + 10 journal entries)
    const recentHistory = buildConversationHistory(conversationHistory, journal, turnNumber);

    // Build location NPC context (shows who is present at hard-coded locations)
    const locationNPCContext = gameState.currentLocationNPCs && gameState.currentLocationNPCs.length > 0
      ? buildNPCContext(gameState.currentLocationNPCs, gameState.location)
      : '';

    if (locationNPCContext) {
      console.log('[NarrativeAgent] Location NPC context added for:', gameState.location);
    }

    let userPrompt = `Context:
${contextSummary}

Recent Conversation:
${recentHistory}

${locationNPCContext ? `\n${locationNPCContext}\n` : ''}
${entityContext ? `\n${entityContext}\n` : ''}
${followUpContext ? `\n${followUpContext}\n` : ''}
${simpleInteractionContext ? `\n${simpleInteractionContext}\n` : ''}
${continuationContext}
${noEncounterContext}
${reputationContext}

${weatherContext ? `\n${weatherContext}\n` : ''}

${skillsContext ? `\n${skillsContext}\n` : ''}

${effectsContext ? `\n${effectsContext}\n` : ''}

Player Action: ${playerAction}

Turn: ${turnNumber + 1}

Generate narrative response. Remember: JSON format, concise, historically accurate, vivid details.`;

    // Handle consumption actions (special mode for item consumption with dynamic effects)
    if (options.isConsumptionAction) {
      console.log('[NarrativeAgent] Consumption action detected for item:', options.itemConsumed);

      // Add consumption-specific instructions to user prompt
      const consumptionInstructions = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ SPECIAL CONSUMPTION EVENT: Dynamically simulate realistic effects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**CONTEXT**: Maria has just consumed: **${options.itemConsumed}**
Item properties: ${JSON.stringify(options.itemProperties || {}, null, 2)}

**YOUR TASK**: Generate a vivid, realistic narrative describing what happens after Maria consumes this item. Then extract appropriate health and energy changes.

**OUTCOME GUIDELINES** (be realistic based on item nature):

**Food Items** (bread, honey, fruits, tortillas):
- Energy: +10 to +25
- Health: +0 to +10
- Narrative: Nourishing, satisfying, restores energy

**Medicinal Herbs** (used properly):
- Energy: +3 to +8
- Health: +5 to +15
- Narrative: Therapeutic effects, specific to herb's properties (calming, invigorating, healing)

**Moderately Toxic** (questionable substances, raw ingredients):
- Energy: -10 to -20
- Health: -15 to -30
- Narrative: Nausea, stomach upset, dizziness, vomiting, discomfort

**Highly Toxic** (mercury, quicksilver, lead, arsenic, deadly nightshade, hemlock, belladonna):
- Energy: 0 (irrelevant)
- Health: -100 (instant death)
- Narrative: IMMEDIATE LETHAL EFFECTS - convulsions, agony, collapse, death within moments

**Inedible Objects** (pins, needles, leather, fabric, metal):
- Energy: -5 to -15
- Health: -10 to -25
- Narrative: Physical injury, choking, internal damage, sharp pain

**Unknown/Experimental Substances**:
- Vary based on realistic assessment of the item's nature
- Consider historical context (1680 Mexico City medicine)
- Use medical knowledge to determine realistic effects

**CRITICAL RULES**:
1. **BE DESCRIPTIVE**: Describe physical sensations, taste, immediate reactions
2. **BE REALISTIC**: Match effects to the actual nature of the substance
3. **BE DRAMATIC**: Make lethal substances IMMEDIATELY fatal (no slow decline)
4. **VARY OUTCOMES**: Don't be predictable - beneficial things can still have side effects, neutral things might surprise
5. **HISTORICAL ACCURACY**: Reference humoral theory, 1680s medical understanding when relevant

**OUTPUT REQUIREMENTS**:
- "narrative": 2-4 vivid sentences describing what happens
- "energyChange": Exact number (can be negative, positive, or zero)
- "healthChange": Exact number (use -100 for instant death)

**EXAMPLE OUTPUTS**:

Honey consumed:
"The golden honey slides down Maria's throat, its sweetness a brief comfort in these difficult times. She feels warmth spread through her chest as the nourishment restores some vitality. A small measure of energy returns to her weary limbs."

Mercury consumed:
"The liquid metal touches Maria's tongue and immediately burns with an unholy fire. Violent convulsions seize her body as the quicksilver ravages her innards. Within moments, she collapses, her vision darkening. Death comes swiftly - the poison shows no mercy."

Leather consumed:
"Maria gags as the tough, inedible leather catches in her throat. Pain shoots through her mouth and esophagus as the material scrapes and tears delicate tissue. She doubles over, coughing violently, blood speckling her lips."

Chamomile consumed:
"The dried chamomile flowers release their gentle perfume as Maria chews them. A subtle calm washes over her, the herb's soothing properties easing tension from her shoulders. Though modest, the medicinal benefit is real."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      userPrompt += consumptionInstructions;
    }

    // Handle list requests (special mode for generating reference tables)
    let finalSystemPrompt = narrativePrompt;
    let finalUserPrompt = userPrompt;

    if (options.isListRequest && options.listSystemPrompt) {
      console.log('[NarrativeAgent] List request detected - using custom prompt for list type:', options.listType);

      // For list requests, we override the system prompt entirely
      // The list prompt contains specific table format instructions
      finalSystemPrompt = options.listSystemPrompt;

      // User prompt for lists - include recent conversation history so LLM can see who's present
      // Extract last 3 turns of conversation history to provide context
      // IMPORTANT: Include BOTH user and assistant messages to capture names mentioned in player actions
      const recentHistory = conversationHistory.slice(-3);
      const historyContext = recentHistory
        .filter(entry => entry.content)
        .map(entry => {
          // Label messages so LLM can distinguish between player actions and narrative
          const label = entry.role === 'user' ? 'Maria' : 'Narrative';
          return `${label}: ${entry.content}`;
        })
        .join('\n\n');

      finalUserPrompt = `Location: ${gameState.location || 'unknown'}
Time: ${gameState.time || 'unknown'}
Date: ${gameState.date || 'unknown'}

Recent Narrative (for context):
${historyContext || 'No recent narrative.'}

${playerAction}`;
    }

    const messages = [
      { role: 'system', content: finalSystemPrompt },
      { role: 'user', content: finalUserPrompt }
    ];

    // Log prompt token estimates (rough estimate: 1 token ≈ 4 chars)
    const systemTokens = Math.ceil(narrativePrompt.length / 4);
    const userTokens = Math.ceil(userPrompt.length / 4);
    const totalPromptTokens = systemTokens + userTokens;
    console.log('[NarrativeAgent] Prompt tokens (est):', {
      system: systemTokens,
      user: userTokens,
      total: totalPromptTokens
    });

    // For list requests, we don't want JSON mode - we want plain text with markdown table
    const responseFormat = options.isListRequest ? undefined : { type: 'json_object' };

    const response = await createChatCompletion(
      messages,
      0.5, // Higher temperature for more creative narrative
      1000,
      responseFormat,
      { agent: 'NarrativeAgent', turnNumber } // Metadata for LLM transparency view
    );

    const rawResponse = response.choices[0].message.content;

    // Handle list requests differently - return raw text with table
    if (options.isListRequest) {
      console.log('[NarrativeAgent] List request completed, returning raw table');
      return {
        success: true,
        narrative: rawResponse.trim(),
        primaryPortrait: null,
        primaryNPC: null,
        requestNewPatient: false,
        showPortraitFor: 'player'
      };
    }

    // Clean markdown-wrapped JSON (LLM sometimes returns ```json ... ```)
    const cleanedResponse = rawResponse
      .replace(/^```json\s*\n?/i, '') // Remove opening ```json
      .replace(/\n?```\s*$/i, '')      // Remove closing ```
      .trim();

    const narrativeData = JSON.parse(cleanedResponse);

    // Debug: Log the portrait and patient system values
    console.log('[NarrativeAgent] LLM returned showPortraitFor:', narrativeData.showPortraitFor);
    console.log('[NarrativeAgent] LLM returned primaryPortrait:', narrativeData.primaryPortrait);
    console.log('[NarrativeAgent] LLM returned primaryNPC:', narrativeData.primaryNPC ? narrativeData.primaryNPC.name : 'null');
    console.log('[NarrativeAgent] LLM returned requestNewPatient:', narrativeData.requestNewPatient);

    // PORTRAIT SELECTION & CONTINUITY
    const primaryNPC = narrativeData.primaryNPC || null;
    if (!primaryNPC && !isContinuation) {
      narrativeData.primaryPortrait = null;
    }
    if (primaryNPC) {
      // FIX: Only maintain portrait if BOTH continuation is detected AND the NPC name matches
      // If NPC changed (e.g., muleteer interrupted boy conversation), select new portrait
      if (isContinuation && primaryNPC.name === continuationNPC && recentPortrait) {
        const normalizedRecentPortrait = normalizePortraitFilename(recentPortrait);
        narrativeData.primaryPortrait = normalizedRecentPortrait;
        console.log(`[NarrativeAgent] 🔄 Continuation: Maintaining portrait ${normalizedRecentPortrait} for ${primaryNPC.name}`);
      } else {
        // Build input entity for portrait resolver using LLM-provided descriptors
        const portraitEntity = {
          name: primaryNPC.name,
          gender: primaryNPC.gender,
          age: primaryNPC.age,
          casta: primaryNPC.casta,
          class: primaryNPC.class,
          occupation: primaryNPC.occupation,
          // Add top-level fields for portrait tag matching
          appearance: primaryNPC.appearance,
          description: primaryNPC.description,
          personality: primaryNPC.personality,
          // Keep nested appearance for backwards compatibility
          appearanceNested: {
            gender: primaryNPC.gender,
            age: primaryNPC.age,
            description: primaryNPC.appearance
          },
          social: {
            occupation: primaryNPC.occupation,
            casta: primaryNPC.casta,
            class: primaryNPC.class
          }
        };

        let selectedPortrait = null;

        if (primaryNPC.name) {
          const nameMatch = findPortraitByName(primaryNPC.name);
          if (nameMatch) {
            const normalizedNameMatch = normalizePortraitFilename(nameMatch);
            if (normalizedNameMatch) {
              selectedPortrait = normalizedNameMatch;
              if (isValidPortrait(normalizedNameMatch)) {
                console.log(`[NarrativeAgent] 🎯 Name match portrait selected: ${normalizedNameMatch} for ${primaryNPC.name}`);
              } else {
                console.warn(`[NarrativeAgent] ⚠️ Name-matched portrait "${normalizedNameMatch}" not registered; using anyway.`);
              }
            }
          }
        }

        if (!selectedPortrait) {
          const resolvedPath = resolvePortrait(portraitEntity);
          if (resolvedPath) {
            const normalizedResolved = normalizePortraitFilename(resolvedPath);
            if (normalizedResolved) {
              selectedPortrait = normalizedResolved;
              if (isValidPortrait(normalizedResolved)) {
                console.log(`[NarrativeAgent] 📊 Demographic portrait selected: ${normalizedResolved} for ${primaryNPC.name || 'unknown NPC'}`);
              } else {
                console.warn(`[NarrativeAgent] ⚠️ Demographic portrait "${normalizedResolved}" not registered; using anyway.`);
              }
            }
          }
        }

        if (!selectedPortrait) {
          selectedPortrait = 'defaultnpc.jpg';
          console.warn(`[NarrativeAgent] ⚠️ Falling back to default portrait for ${primaryNPC.name || 'unknown NPC'}`);
        }

        narrativeData.primaryPortrait = selectedPortrait;

        // A/B TESTING: Log current system vs experimental LLM choice
        if (narrativeData.experimentalPortraitChoice) {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🧪 PORTRAIT A/B TEST COMPARISON');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`NPC: ${primaryNPC.name || 'Unknown'}`);
          console.log(`  Demographics: ${primaryNPC.gender} / ${primaryNPC.age} / ${primaryNPC.casta} / ${primaryNPC.class} / ${primaryNPC.occupation}`);
          console.log(`  Current System (Demographic Matching): ${selectedPortrait}`);
          console.log(`  🧪 Experimental (LLM Direct Choice):   ${narrativeData.experimentalPortraitChoice}`);
          console.log(`  Match: ${selectedPortrait === normalizePortraitFilename(narrativeData.experimentalPortraitChoice) ? '✅ SAME' : '❌ DIFFERENT'}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
      }
    } else if (isContinuation && recentPortrait) {
      const normalizedRecentPortrait = normalizePortraitFilename(recentPortrait);
      narrativeData.primaryPortrait = normalizedRecentPortrait;
      console.log(`[NarrativeAgent] 🔄 Continuation without primary NPC data; keeping portrait ${normalizedRecentPortrait}`);
    }

    if (!narrativeData.interactionIntent) {
      narrativeData.interactionIntent = 'none';
    }

    if (narrativeData.primaryPortrait) {
      narrativeData.primaryPortrait = normalizePortraitFilename(narrativeData.primaryPortrait);
    }


    let isAnimal = false;

    if (primaryNPC) {
      const lowerFields = [
        primaryNPC.name,
        primaryNPC.occupation,
        primaryNPC.description,
        primaryNPC.appearance,
        primaryNPC.personality
      ]
        .filter(Boolean)
        .map(value => value.toLowerCase());

      const animalKeywords = [
        'pig', 'hog', 'boar', 'cat', 'dog', 'horse', 'mule', 'cow', 'bull', 'goat',
        'hen', 'rooster', 'chicken', 'bird', 'sparrow', 'rat', 'mouse', 'donkey',
        'monkey', 'parrot', 'animal', 'beast', 'sheep', 'lamb', 'burro', 'fox'
      ];

      const normalizedClass = (primaryNPC.class || '').toLowerCase();
      const normalizedOccupation = (primaryNPC.occupation || '').toLowerCase();
      const normalizedGender = (primaryNPC.gender || '').toLowerCase();

      const keywordMatch = lowerFields.some(field =>
        animalKeywords.some(keyword => field.includes(keyword))
      );

      const classHintsAnimal = ['animal', 'beast', 'livestock'].some(token => normalizedClass.includes(token));
      const occupationHintsAnimal = ['pig', 'dog', 'mule', 'cow', 'horse', 'beast'].some(token => normalizedOccupation.includes(token));

      isAnimal =
        classHintsAnimal ||
        occupationHintsAnimal ||
        (keywordMatch && normalizedGender === 'unknown' && !normalizedOccupation);
    }

    // ARRAY TO STRING: Join narrative array into single string with paragraph breaks
    let narrativeText = '';
    if (Array.isArray(narrativeData.narrative)) {
      // LLM sent array of paragraphs - join with double newlines
      narrativeText = narrativeData.narrative.join('\n\n');
      console.log('[NarrativeAgent] ✓ Joined', narrativeData.narrative.length, 'paragraph(s)');
    } else if (typeof narrativeData.narrative === 'string') {
      // LLM sent string (legacy format) - use as-is
      narrativeText = narrativeData.narrative;
      console.warn('[NarrativeAgent] ⚠️ Received string instead of array for narrative (legacy format)');
    } else {
      narrativeText = '';
    }

    // PARAGRAPH BREAK FIX: Add line break before "Will you..." questions (if not already present)
    // This ensures the closing question is visually separated from dialogue/description
    if (narrativeText && !narrativeText.match(/\n\n.*?Will you/)) {
      // Match: end punctuation + optional quote + whitespace + "Will you"
      // Replace with: same content + double newline before "Will you"
      narrativeText = narrativeText.replace(
        /([.!?]"?)\s+(Will you [^?]+\?)/g,
        '$1\n\n$2'
      );
    }

    // Check if NPC dialogue is embedded in narrative (should contain quoted speech)
    const hasQuotedDialogue = narrativeText.includes('"') || narrativeText.includes('"') || narrativeText.includes('"');

    if (primaryNPC && !hasQuotedDialogue && !isAnimal && narrativeText.length > 50) {
      console.warn('[NarrativeAgent] ⚠️ NPC present but no quoted dialogue found in narrative. This may indicate the LLM forgot to include speech.');
    } else if (primaryNPC && !hasQuotedDialogue && isAnimal) {
      console.log('[NarrativeAgent] ✓ Animal encounter without dialogue (expected).');
    }

    return {
      success: true,
      narrative: narrativeText,
      responseType: narrativeData.responseType || 'narration',
      sceneDescription: narrativeData.sceneDescription || '',
      suggestedCommands: narrativeData.suggestedCommands || [],
      interactionIntent: narrativeData.interactionIntent || 'none',
      showPortraitFor: narrativeData.showPortraitFor || null,
      // Fix: Convert string "null" to actual null (LLM sometimes returns string instead of JSON null)
      primaryPortrait: (narrativeData.primaryPortrait === 'null' || !narrativeData.primaryPortrait) ? null : narrativeData.primaryPortrait,
      primaryNPC: narrativeData.primaryNPC || null,
      simpleInteraction: narrativeData.simpleInteraction || null,
      requestNewPatient: narrativeData.requestNewPatient || false,
      patientContext: narrativeData.patientContext || null,
      npcDeparted: narrativeData.npcDeparted || false,
      companions: Array.isArray(narrativeData.companions) ? narrativeData.companions : [],
      entities: narrativeData.entities || []
    };
  } catch (error) {
    console.error('NarrativeAgent error:', error);
    return {
      success: false,
      narrative: 'An error occurred while generating the narrative.',
      error: error.message
    };
  }
}

/**
 * Generate brief continuation narrative after simple interactions
 * Uses standard narrative voice with conversation context for consistency
 *
 * @param {Object} params
 * @param {string} params.scenarioId - Scenario identifier
 * @param {Array} params.conversationHistory - Recent conversation history
 * @param {Array} params.journal - Journal entries for compression
 * @param {string} params.journalText - What just happened (journal entry)
 * @param {boolean} params.isDismissal - Whether NPC is leaving
 * @param {Object} params.gameState - Current game state
 * @param {number} params.turnNumber - Current turn
 * @returns {Promise<string>} Continuation narrative text
 */
export async function generateContinuationNarrative({
  scenarioId = '1680-mexico-city',
  conversationHistory,
  journal = [],
  journalText,
  isDismissal = false,
  gameState,
  turnNumber
}) {
  try {
    // Load scenario for narrative context
    const scenario = scenarioLoader.loadScenario(scenarioId);

    // Build conversation history (last 10 turns for context)
    const recentHistory = buildConversationHistory(conversationHistory, journal, turnNumber);

    // Build simplified prompt that returns PLAIN TEXT, not JSON
    const continuationPrompt = `You are the Narrative Engine for a historical simulation set in ${scenario.name}.

**Character**: ${scenario.character.name}, ${scenario.character.description}

**Setting**: ${scenario.setting}, ${scenario.year}

**Recent Events**:
${recentHistory}

**What Just Happened**: ${journalText}

**Your Task**: Generate a SHORT continuation (max 100 words) that:
1. Acknowledges Maria's choice (1 sentence)
2. Describes immediate aftermath - NPC reaction, scene change, or Maria's internal thoughts (1-2 sentences)
3. **ENDS WITH A COMPELLING QUESTION** that offers TWO specific, plot-relevant choices

**Critical - The Final Question**:
- Review the recent narrative for active plot threads (debts, conflicts, mysteries, opportunities, threats, NPC relationships)
- Reference at least ONE of these threads in your question
- Format: "Will you [brief, specific action A], or [brief, specific action B]?"
- Make both options feel urgent, interesting, or consequential
- AVOID generic choices that result in no action
- Connect to the drama/plot that just happened, but propell plot forward in new, realistic way

**Style**:
- Second person ("you")
- Brief and evocative (3-4 sentences total)
- Dynamic, plot-driven choices that make player excited to act

**IMPORTANT**: Return ONLY the narrative text, NOT JSON. No field names, no structure - just the prose.`;

    const messages = [
      { role: 'system', content: continuationPrompt },
      { role: 'user', content: 'Generate the brief continuation narrative.' }
    ];

    const response = await createChatCompletion(
      messages,
      0.7, // Match standard narrative temperature
      250, // Short response
      null,
      { agent: 'NarrativeAgent_Continuation' }
    );

    const continuationNarrative = response.choices[0].message.content.trim();

    console.log('[NarrativeAgent] Generated continuation:', continuationNarrative.substring(0, 100));

    return continuationNarrative;

  } catch (error) {
    console.error('[NarrativeAgent] Continuation error:', error);
    // Fallback to simple acknowledgment
    return `You take a moment to consider your next move.`;
  }
}

export default {
  generateNarrative,
  generateContinuationNarrative
};
