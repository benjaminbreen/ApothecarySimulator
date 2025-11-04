// NarrativeAgent - Specialized agent for story generation
// Handles: Story text, player actions, NPC interactions, dialogue, spatial context

import { createChatCompletion } from '../services/llmService';
import { buildContextSummary, buildEntityContext, buildSkillsContext } from '../../prompts/promptModules';
import { scenarioLoader } from '../services/scenarioLoader';
import { getGridSystem } from '../../features/map/services/gridMovementSystem';
import { getReputationTier, getFactionStanding, FACTION_INFO } from '../systems/reputationSystem';
import { findPortraitByName } from '../services/portraitMatcher';
import { resolvePortrait } from '../services/portraitResolver';
import { isValidPortrait, getFilteredPortraitList } from '../config/portraits.config';
import { buildNPCContext } from '../services/locationContextService'; // Location NPC system
import { isFeatureEnabled } from '../config/featureFlags';

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
      context += `\n**IMPORTANT**: This NPC belongs to a faction. Check their faction standing above and adjust their attitude accordingly:
- Allied (80+): Very respectful, helpful, offers special favors
- Friendly (60-79): Polite, cooperative, willing to help
- Neutral (40-59): Business-like, neither warm nor cold
- Unfriendly (20-39): Curt, suspicious, reluctant to help
- Hostile (<20): Openly hostile, may refuse service or insult Maria

Use this to inform dialogue tone, willingness to help, and general demeanor.`;
    } else {
      // Non-faction NPC: Use overall reputation
      context += `\n**IMPORTANT**: This NPC has no specific faction ties. Use Maria's overall reputation to guide their attitude:
- Celebrated (80+): Rumors of Maria's skill precede her. Warm reception, eager to help, may offer discounts or favors
- Respected (60-79): Known as competent. Polite, professional treatment. Willing to do business
- Mixed Reputation (40-59): Some have heard good things, some bad. Neutral, cautious, business-like
- Questionable (20-39): Suspicious rumors circulate. Cold reception, reluctant to help, may demand payment upfront
- Notorious (<20): Bad reputation widespread. Openly hostile, may refuse service, insult Maria, or demand she leave

Use this to inform dialogue tone, willingness to help, pricing, and general demeanor.`;
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
  parts.push('\n**Narrative Instructions**:');
  parts.push('- Mention weather naturally in scene descriptions (NOT every turn)');
  parts.push('- NPCs react appropriately (seek shelter in rain, complain about heat, etc.)');
  parts.push('- Describe sensory details: sounds (rain on tiles), smells (petrichor), tactile (wind on skin)');
  parts.push('- Consider practicality: wet clothes, muddy streets, seeking cover, closing shutters');

  // Historical context for afternoon thunderstorms
  if (weather.precipitation === 'rain' && gameState.time) {
    const hour = parseInt(gameState.time.split(':')[0]);
    if (hour >= 14 && hour < 18) {
      parts.push('- HISTORICAL NOTE: Afternoon thunderstorms are typical in Mexico City summer (wet season)');
    }
  }

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
  const core = scenarioPrompts.core || {};
  const mechanics = scenarioPrompts.mechanics || {};
  const historical = scenarioPrompts.historical || {};
  const narrative = scenarioPrompts.narrative || {};

  const schemaSection = `### Output Schema
Return strict JSON (no markdown fencing, no prose outside the object).

{
  "responseType": "movement|narration",
  "narrative": "string (<=2-3 short paragraphs, second person). CRITICAL: All NPC speech MUST be embedded here as quoted dialogue, like: She says, "I need your help." Never leave this field without quoted speech when NPCs are present.",
  "sceneDescription": "string",
  "suggestedCommands": ["#command"],
  "showPortraitFor": "string or null",
  "primaryPortrait": "null (engine assigns portrait automatically)",
  "experimentalPortraitChoice": "exact filename from portrait list OR null (EXPERIMENTAL: for A/B testing)",
  "primaryNPC": { "name": "...", "age": "...", "gender": "...", "occupation": "...", "casta": "...", "class": "...", "personality": "two traits", "appearance": "one sentence", "description": "one sentence" } or null,
  "simpleInteraction": { "type": "vendor_offer|service_offer|donation_request|competitive_check|information_exchange|social_visit|extortion_demand|protection_racket|entertainment_tip|food_purchase|gamble_opportunity|labor_offer|neighbor_complaint|church_donation|null", ... } or {"type": "null"} or null,
  "requestNewPatient": true|false,
  "patientContext": { "reason": "string", "urgency": "low|moderate|high|critical" } or null,
  "npcDeparted": true|false,
  "entities": [{ "text": "...", "entityType": "npc|patient|animal|item|location", "tier": "story-critical|recurring|background", "occupation": "string", "description": "string", "wikipediaQuery": "string|null", "demographics": { "gender": "...", "age": "...", "casta": "...", "class": "..." } }],
  "interactionIntent": "medical_diagnosis|medical_followup|medical_purchase|house_call|nonmedical_request|vendor_offer|social|none"
}`;

  const interactionIntentSection = `### Interaction Intent — Decide By Maria's ACTION
Ask: *What is the NPC asking Maria to DO right now?*

- medical_diagnosis → Maria examines or treats a patient who is physically present (or immediately enters) the scene. She is using her medical judgement here in the shop. No travel required.
- medical_followup → The same patient returns (or an emissary reports back) about an ongoing treatment Maria already manages. No new contract/fee—continue the conversation.
- medical_purchase → The visitor wants Maria to PROVIDE medicine or a prepared remedy so they can take it away. Maria stays in the shop, selects/dispenses the remedy, accepts payment. Think "Please give me something for…".
- house_call → **STRICTLY MEDICAL ONLY**. A messenger asks Maria to travel to EXAMINE/TREAT a SICK or INJURED patient. NOT for errands, harvesting, deliveries, or non-medical favors.
  **Key indicators (ALL must be present):**
  * Messenger/intermediary arrives (not the patient themselves)
  * Patient is SICK, INJURED, or SUFFERING from a medical condition
  * Messenger explicitly asks Maria to examine/treat/see the patient
  * Phrases like "he's fallen ill", "she's bedridden", "needs a physician", "can you examine", "please treat"
  * Location mentioned or implied: "at the church", "at his estate", "in her chambers"
  **Examples:**
  * ✓ "Sister Ines: 'Father Anselmo has taken ill. Please come to the monastery!'" → house_call (medical: illness)
  * ✓ "Servant: 'Don Luis cannot leave his bed. He requests your attendance.'" → house_call (medical: bedridden)
  * ✗ "An elderly man enters coughing. 'Please help me, señora.'" → medical_diagnosis (patient is here)
  * ✗ "Wife: 'My husband is sick. Can you give me something?'" → medical_purchase (wants medicine to take away)
  * ✗ "Procurator's Clerk: 'The Bishop has terrible flux. Do you have gum mastic?'" → medical_purchase (buying medicine, NOT vendor_offer!)
  * ✗ "Boy: 'My mother needs help harvesting herbs safely. Can you come show her?'" → nonmedical_request (NOT treating a patient)
  * ✗ "Messenger: 'Don Luis requests you visit to discuss a business matter.'" → social (NOT medical)

- nonmedical_request → Any favour, investigation, or errand unrelated to medicine. No remedy discussion, no diagnosis. Includes: harvesting help, deliveries, social visits, errands.
- vendor_offer → The NPC is selling NON-MEDICAL goods/services TO Maria (direction NPC → Maria). Maria is the buyer. **NEVER use for medicine requests - those are medical_purchase!**
- social → Pure conversation, warnings, gossip, or relationship scenes with no actionable request.
- none → No clear request or action this turn.`;

  const modeSection = `### Mode Selection
- Movement commands ONLY (actual directional travel) -> responseType "movement". 3-4 sentences, describe a single step, second person, minimal dialogue.
  - VALID: "go north", "walk east", "head south", "move west", "go outside", "go upstairs", "go downstairs", "leave building"
  - INVALID: "go to the door" (use narration), "let's move on" (use narration), "go see who's there" (use narration), "move forward with the conversation" (use narration)
  - Rule: Use "movement" ONLY if action is LITERAL spatial movement with compass direction OR explicit exit/entrance (outside/upstairs/downstairs). Otherwise use "narration".
- All other inputs -> responseType "narration". Stay under 150 words, second person. CRITICAL: When NPCs speak, embed their words directly in the narrative using quotation marks. Example: He frowns. "I need medicine for my wife," he says urgently.
- Always honour player input exactly—no detours or invented lines for Maria.`;

  const agencySection = `### Player Agency & Pacing
- If the player (i.e. Maria) enters a command to do something, do it, no matter how strange! (Within reason - i.e. if the player says "fly on a spaceship," this is plainly impossible. But if they say "stand on my head and say a hail mary," then depict Maria doing EXACTLY that - but also depict realistic consequences.)
- Stop before mechanical actions (mixing, prescribing, buying) so UI modals handle them.
- Show real consequences, NPC reactions, and sensory detail grounded in 1680 Mexico City.
- Close most narration responses with a bold prompt offering 2 concise follow-up choices unless the moment demands free input.

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
- Tie speech to the NPC's role and stakes; vary tone, length, and mannerisms so debt collectors, servants, and beggars sound distinct.
- CRITICAL: Embed all dialogue directly in the "narrative" field using quotation marks. Example: He steps forward. "Doña Maria," he says, "I need your help." Do NOT use separate dialogue fields—everything goes in narrative.`;

  const unexpectedSection = `### Texture & Surprise
- Draw from Mexico City street life—vendors hawking goods, gossiping neighbors, stray animals, distant bells, sudden weather shifts.
- Real life is at times unexpected in a David Lynch-ian way. Reflect that. Occasional uncanny or surreal or unexpected touches are welcome **if** they remain grounded in the period.`;

  const variationSection = `### Dialogue & Length Variety
- Vary the amount of speech: some NPCs ramble or argue, others mutter a word or two. Some suffer from diseases like syphilis which make them mad or ashamed.
- Remember how humans ACTUALLY talk. This is not a fantasy novel or historical fiction. It's real life.
- Dialogue pulls things forward - always advance the plot powerfully.
- DOOR ANSWERING RULE: When a knock/visitor is mentioned in recent context AND player performs any door-related action ("see who is there", "open the door", "go to the door", "approach the door", "answer the door", "check the door"), immediately complete the full encounter in a single response:
  1. Maria opens/peers through the door
  2. Describe who's standing outside (use selectedEntity/primaryNPC data)
  3. Have them speak first with their opening line
  Do NOT stop at Maria reaching for the latch or approaching the door - complete the reveal and greeting in one response.`;

  const animalSection = `### Animals & Non-Human Actors
- Animals do not speak or reason like humans. Describe their behaviour through body language only.
- If an animal is the focus, show who is handling it or why it matters; otherwise keep the primary NPC slot for humans.`;

  const closingSection = `### Closing Prompt
- End narration with your own bolded follow-up question (**“Will you …, or …?”**) that offers two concrete next choices rooted in the scene (refer to the NPC, stakes, or setting). There is no system fallback—make it original.
- Skip the question only when the next step is unambiguous (combat in progress, total silence, cliffhanger, etc.), and in that case end with a vivid image or beat.`;

  const simpleInteractionSection = `### Simple Interaction Guardrails
- Only populate simpleInteraction when explicitly in "SIMPLE INTERACTION MODE".
- If the scene mentions sickness, remedies, treatment, symptoms, or Maria's expertise, set simpleInteraction.type to "null" immediately. Medical matters always use the main medical systems.
- Use it for brief non-medical encounters (charity, gossip, quick social visits, threats, gambling, investment offers). Keep to <=50 words and one physical beat + a few lines of dialogue.
- Do NOT invent new simpleInteraction types. Supported values:
  * **vendor_offer** = NPC selling goods TO Maria
  * **service_offer** = NPC offering services TO Maria
  * **competitive_check** = Rival apothecary scouting Maria's practice
  * **extortion_demand** = Threats/demands from criminals, corrupt officials, or Inquisition proxies
  * **gamble_opportunity** = NPC invites Maria to gamble/bet
  * **investment_offer** = NPC presents investment opportunity TO Maria
- **Odds guidance for gambling**: favorable (60% win) if NPC is friendly/drunk/unskilled, even (50%) for fair game, unfavorable (40%) if NPC is skilled/cheating/professional gambler
- **Investment type guidance**: church_bond (⛪, no risk, 10% return, 5-10 days), cacao_plantation (🌿, low risk, 25-50%, 10-15 days), apothecary_syndicate (💊, low risk, 15-25%, 3-7 days), real_estate (🏠, medium risk, 35-60%, 20-30 days), manila_galleon (🚢, medium risk, 120-200% or total loss, 30-45 days), silver_mining (🏔️, high risk, 70-200% or total loss, 7-14 days)
- **IMPORTANT**: Always provide a contextually appropriate emoji for the item/service being offered. Examples: 💧 for water, 🪵 for firewood, 📜 for documents/codices, 🍯 for honey, 🌿 for herbs, 🔥 for charcoal, 💀 for threats, 🎲 for gambling, ⛪ for church bonds, 🚢 for galleon trade, etc.
- When SIMPLE INTERACTION MODE is active you MUST fill the simpleInteraction object with the specifics (prices, items, reasons, amounts, odds, investment details) and keep the narrative laser-focused on that exchange.`;

  const crisisActive = gameState?.crisis?.active;
  const crisisResolutionSection = crisisActive ? `### Crisis Context
- A crisis is in progress (${gameState.crisis?.reason || 'high stakes confrontation'}).
- Describe events clearly so consequences are unmistakable (escape, surrender/arrest, capture, bribery, death, or ongoing standoff).
- Do NOT declare game mechanics. Show the outcome vividly and let downstream systems handle consequences.` : '';

  const portraitDescriptorSection = `### Portrait Descriptor Rules
- Our engine chooses portraits automatically. Provide precise demographics so it can match correctly.
- Use gender values: male | female | unknown.
- Use age bands: child | young | adult | middle-aged | elderly.
- Use casta terms: español, criollo, mestizo, mulato, africano, indio, or "unknown".
- Use social class terms: elite, middling, common, poor, religious, enslaved, freedman, artisan.
- Keep occupation as a short noun (friar, soldier, merchant, market vendor, nun, muleteer, lawyer, etc.).
- Mention key traits in appearance/description (e.g., clergy, military, artisan, noble) when relevant.
- Set primaryPortrait to null; the system will assign the portrait from these descriptors.`;

  const entitySection = `### Entities & Portraits
- List 2–3 meaningful entities the player may interact with (no throwaways).
- Provide complete demographics for primaryNPC (name, age, gender, occupation, casta, class, personality, appearance, description).
- primaryPortrait is assigned automatically; keep it null in your output.
- primaryNPC/primaryPortrait must describe the person physically present with Maria; set to null if no primary NPCs are present.
- Maintain portrait/name continuity when conversations continue, but also allow NPCs to leave as appropriate.`;

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
    portraitDescriptorSection,
    entitySection,
    patientSection,
    commandsSection,
    historySection,
    pacingSection,
    mapContext ? mapContext.trim() : ''
  ];

  return sections.filter(Boolean).join('\n\n');
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

  // Take last 20 messages for detailed recent context
  const recentMessages = conversationHistory.slice(-20);

  const history = [];

  // Add older journal entries for compressed context (if available)
  if (journal.length > 5) {
    const oldJournal = journal.slice(-15, -5); // 6-15 turns ago
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
        gamble_opportunity: { tone: 'persuasive, friendly, competitive', items: 'dice games (5-10r wager), card games (3-8r), cockfights (8-15r), friendly wagers', vary: 'wager amount, odds fairness, NPC skill level' },
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

    // Build reputation context
    const reputationContext = buildReputationContext(reputation, selectedEntity);

    // Build weather context
    const weatherContext = buildWeatherContext(weather, gameState);

    // Build skills context
    const skillsContext = playerSkills ? buildSkillsContext(playerSkills) : '';

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
- **Waiting for specific events with stated duration** ("wait for Mateo", "wait for the escort"):
  * Check recent conversation history for stated time ("return in 30 minutes", "back in an hour")
  * Advance time to MATCH that duration (e.g., if they said "30 minutes", advance ~30 minutes)
  * Show the expected event occurring (person returns, task completes)
  * Example: Maria sent Mateo on errand "return in 30 minutes" → Player says "wait" → Advance 30-35 minutes and show Mateo returning
- **Passive observation** ("not much", "look around", "watch"): Pure description, minimal time (1-5 minutes), no new events
- **Vague waiting** ("rest", "wait" with no context): Brief time passage (10-15 minutes), introduce new event
`;
    }

    // EXPERIMENTAL: Portrait list for LLM to choose from (A/B testing vs demographic matching)
    // Feature flag controlled to save ~280 tokens when disabled
    let experimentalPortraitSection = '';
    if (isFeatureEnabled('experimentalPortraitSelection')) {
      try {
        if (selectedEntity && !isContinuation) {
          // Filter portraits based on selected entity
          const portraitList = getFilteredPortraitList({
            gender: selectedEntity.gender,
            occupation: selectedEntity.occupation || selectedEntity.archetype,
            limit: 35  // Token-efficient: ~280 tokens for 35 portraits
          });

          experimentalPortraitSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 EXPERIMENTAL PORTRAIT SELECTION (A/B Testing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${portraitList}

**EXPERIMENTAL INSTRUCTION:**
Pick the EXACT filename from the list above that best matches this NPC.
Put it in "experimentalPortraitChoice" field.
This will NOT affect the game - it's for testing portrait variety.

If no good match, set experimentalPortraitChoice to null.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

        console.log('[NarrativeAgent] 🧪 Experimental portrait list generated:', portraitList.split('\n').length, 'lines');
      } else if (!selectedEntity && !isContinuation) {
        // No NPC - offer scenes/animals
        experimentalPortraitSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 EXPERIMENTAL PORTRAIT SELECTION (Scenes/Animals)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Available Scene Portraits** (for atmosphere without NPCs):
coffeehouseday.jpg, coffeehouseevening.jpg, tavernaday.jpg, marketplaceday.jpg,
churchcourtyard.jpg, backalleynight.jpg, villagelaneday.jpg, citybackstreet.jpg,
palaceentryway.jpg, conventoinside.jpg, streetscene.jpg

**Available Animal Portraits** (if an animal is present):
catday.jpg, dog.jpg, pig.jpg, pablothegoat.jpg, horse.jpg, donkey.jpg,
cow.jpg, sheep.jpg, owl.jpg, rabbit.jpg, rooster.jpg, duck.jpg

**EXPERIMENTAL INSTRUCTION:**
If appropriate, pick a scene or animal portrait from above.
Put it in "experimentalPortraitChoice" field.
This will NOT affect the game - it's for testing.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
      }
      } catch (error) {
        console.warn('[NarrativeAgent] ⚠️ Failed to generate experimental portrait list:', error);
      }
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

    const userPrompt = `Context:
${contextSummary}

Recent Conversation:
${recentHistory}

${locationNPCContext ? `\n${locationNPCContext}\n` : ''}
${entityContext ? `\n${entityContext}\n` : ''}
${simpleInteractionContext ? `\n${simpleInteractionContext}\n` : ''}
${continuationContext}
${noEncounterContext}
${reputationContext}

${weatherContext ? `\n${weatherContext}\n` : ''}

${skillsContext ? `\n${skillsContext}\n` : ''}

${experimentalPortraitSection ? `\n${experimentalPortraitSection}\n` : ''}

Player Action: ${playerAction}

Turn: ${turnNumber + 1}

Generate narrative response. Remember: JSON format, concise, historically accurate, vivid details.`;

    // Handle list requests (special mode for generating reference tables)
    let finalSystemPrompt = narrativePrompt;
    let finalUserPrompt = userPrompt;

    if (options.isListRequest && options.listSystemPrompt) {
      console.log('[NarrativeAgent] List request detected - using custom prompt for list type:', options.listType);

      // For list requests, we override the system prompt entirely
      // The list prompt contains specific table format instructions
      finalSystemPrompt = options.listSystemPrompt;

      // Simplified user prompt for lists - just the action and minimal context
      finalUserPrompt = `Location: ${gameState.location || 'unknown'}
Time: ${gameState.time || 'unknown'}
Date: ${gameState.date || 'unknown'}

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
      0.7, // Higher temperature for more creative narrative
      1200,
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
      if ((isContinuation || primaryNPC.name === continuationNPC) && recentPortrait) {
        const normalizedRecentPortrait = normalizePortraitFilename(recentPortrait);
        narrativeData.primaryPortrait = normalizedRecentPortrait;
        console.log(`[NarrativeAgent] 🔄 Continuation: Maintaining portrait ${normalizedRecentPortrait}`);
      } else {
        // Build input entity for portrait resolver using LLM-provided descriptors
        const portraitEntity = {
          name: primaryNPC.name,
          gender: primaryNPC.gender,
          age: primaryNPC.age,
          casta: primaryNPC.casta,
          class: primaryNPC.class,
          occupation: primaryNPC.occupation,
          appearance: {
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

    // Check if NPC dialogue is embedded in narrative (should contain quoted speech)
    const narrativeText = narrativeData.narrative || '';
    const hasQuotedDialogue = narrativeText.includes('"') || narrativeText.includes('"') || narrativeText.includes('"');

    if (primaryNPC && !hasQuotedDialogue && !isAnimal && narrativeText.length > 50) {
      console.warn('[NarrativeAgent] ⚠️ NPC present but no quoted dialogue found in narrative. This may indicate the LLM forgot to include speech.');
    } else if (primaryNPC && !hasQuotedDialogue && isAnimal) {
      console.log('[NarrativeAgent] ✓ Animal encounter without dialogue (expected).');
    }

    return {
      success: true,
      narrative: narrativeData.narrative || '',
      responseType: narrativeData.responseType || 'narration',
      sceneDescription: narrativeData.sceneDescription || '',
      suggestedCommands: narrativeData.suggestedCommands || [],
      interactionIntent: narrativeData.interactionIntent || 'none',
      showPortraitFor: narrativeData.showPortraitFor || null,
      primaryPortrait: narrativeData.primaryPortrait || null,
      primaryNPC: narrativeData.primaryNPC || null,
      simpleInteraction: narrativeData.simpleInteraction || null,
      requestNewPatient: narrativeData.requestNewPatient || false,
      patientContext: narrativeData.patientContext || null,
      npcDeparted: narrativeData.npcDeparted || false,
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
- Format: "Will you [specific action A], or [specific action B]?"
- Make both options feel urgent, interesting, or consequential
- AVOID generic choices that result in no action
- Connect to the drama: debts, dangers, relationships, mysteries, opportunities

**Examples of GOOD questions**:
- "Will you forage for herbs in the fields outside the city, or visit the market?"
- "Will you accept the stranger's suspicious offer, or turn instead to the church for sanctuary?"

**Examples of BAD questions (NEVER use these)**:
- "What do you do?" ❌
- "What is your next move?" ❌

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
