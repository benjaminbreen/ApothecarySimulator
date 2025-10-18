// NarrativeAgent - Specialized agent for story generation
// Handles: Story text, player actions, NPC interactions, dialogue, spatial context

import { createChatCompletion } from '../services/llmService';
import { buildContextSummary, buildEntityContext, buildSkillsContext } from '../../prompts/promptModules';
import { scenarioLoader } from '../services/scenarioLoader';
import { getGridSystem } from '../../features/map/services/gridMovementSystem';
import { getReputationTier, getFactionStanding, FACTION_INFO } from '../systems/reputationSystem';
import { formatPortraitListForPrompt } from '../config/portraits.config';

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

  // If interacting with an NPC, highlight their faction's standing
  if (selectedEntity?.social?.faction) {
    context += `\n**IMPORTANT**: This NPC belongs to a faction. Check their faction standing above and adjust their attitude accordingly:
- Allied (80+): Very respectful, helpful, offers special favors
- Friendly (60-79): Polite, cooperative, willing to help
- Neutral (40-59): Business-like, neither warm nor cold
- Unfriendly (20-39): Curt, suspicious, reluctant to help
- Hostile (<20): Openly hostile, may refuse service or insult Maria

Use this to inform dialogue tone, willingness to help, and general demeanor.`;
  }

  return context;
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
  * Keep description BRIEF (2-3 sentences maximum, 40-60 words)
  * **CRITICAL: Use SECOND PERSON ("You walk...", "You step...", "You pass...") - NEVER first person ("I walk")**
  * Focus on immediate surroundings and what Maria observes
  * Use vivid sensory details (sounds, smells, sights) but stay concise
  * DO NOT include long dialogues or complex interactions during simple movement
  * DO NOT mention grid coordinates or game mechanics - stay in-character and historical

${isInterior ?
`**INTERIOR Movement** - Currently inside ${mapData.name || 'a building'}:
  ${currentRoom ? `* **CRITICAL**: You are in the **${currentRoom.name}** - ONLY describe furniture/features from this room!` : ''}
  * ONLY describe furniture listed in "Nearby Objects/Furniture" above (already filtered to current room)
  * DO NOT mention furniture from other rooms (e.g., don't mention counter when in Laboratory)
  * Describe room features: walls, doors, windows, lighting specific to current room
  * Note light sources: candles, windows, sunlight streaming in
  * Include interior sounds: creaking floorboards, rustling fabric, distant voices
  * Reference the current room name naturally when appropriate
  * Example (SECOND PERSON): "You step toward the eastern wall of the ${currentRoom?.name.toLowerCase() || 'room'}, where sunlight streams through a narrow window."`
:
`**EXTERIOR Movement** - Currently outdoors in the city:
  * Describe streets, buildings, landmarks, and urban features
  * Mention people Maria passes: vendors, officials, pedestrians
  * Include city sounds: church bells, vendors calling, horses clopping
  * Note weather and light: dusty streets, colonial architecture, scaffolding
  * Reference street names and buildings naturally
  * Example (SECOND PERSON): "You walk north along the dusty Calle de Plateros. The cathedral's unfinished towers loom ahead, scaffolding wrapped around its stone facade. A vendor calls out, selling tamales from a clay pot."`}

- If BLOCKED by obstacle, explain why in 1 sentence, then describe what Maria sees instead
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
function buildNarrativePrompt(scenarioPrompts, mapContext = '') {
  const core = scenarioPrompts.core || {};
  const mechanics = scenarioPrompts.mechanics || {};
  const historical = scenarioPrompts.historical || {};
  const narrative = scenarioPrompts.narrative || {};

  return `${core.identity || 'You are the Narrative Engine for HistoryLens, a historical simulation.'}

Generate compelling, historically accurate narrative text. Create vivid scenes with period-specific detail, believable NPC dialogue, and appropriate pacing.

### Response Type Detection:

**MOVEMENT MODE** - Use when player navigates:
- Patterns: "I walk [direction]", "I go [direction]", "go to [place]"
- Set \`responseType: "movement"\`
- Brief description in \`narrative\` field (2-3 sentences, 40-60 words)
- **MUST use SECOND PERSON ("You walk...", "You step...") - NEVER first person ("I walk...") or third person ("Maria walks...")**

**NARRATION MODE (DEFAULT)** - All other actions:
- Player actions, NPC interactions, examining, choices, contracts, commands
- Set \`responseType: "narration"\`
- Full scene in \`narrative\` field (1-3 paragraphs)
- **Use SECOND PERSON ("You examine...", "You say...", "You notice...")**
- **Embed NPC dialogue naturally** using quotation marks
- **Accurately represent player input** - don't contradict what they said
- **Show consequences** - NPC responses, game events, what happens next

**Examples:**

\`\`\`json
{
  "responseType": "movement",
  "narrative": "You walk north along the dusty Calle de Plateros. The cathedral's unfinished towers loom ahead, scaffolding wrapped around stone. A vendor calls out, selling tamales."
}
\`\`\`

\`\`\`json
{
  "responseType": "narration",
  "narrative": "Beatriz's weathered face brightens. \\"The ipecacuanha, Doña Maria,\\" she says, gesturing to the bundles. \\"The bitter one for purging the stomach.\\" She unwraps the cloth to reveal dark, gnarled specimens."
}
\`\`\`

### Response Format (JSON):
\`\`\`json
{
  "responseType": "movement|narration - REQUIRED (use 'narration' for everything except movement)",
  "narrative": "Story text (1-3 paragraphs, markdown) - ALWAYS populate this field with the narrative",
  "dialogue": "RESERVED - leave null (future companion travel mode only)",
  "npcSpeaker": "RESERVED - leave null (future companion travel mode only)",
  "npcDialogue": "RESERVED - leave null (legacy field)",
  "sceneDescription": "Brief scene/setting description",
  "suggestedCommands": ["#symptoms", "#prescribe"],
  "showPortraitFor": "string or null - name of the primary character Maria is directly interacting with",
  "primaryPortrait": "filename.jpg or null - portrait file to display for primary NPC",
  "primaryNPC": {
    "name": "Full name of primary NPC",
    "age": "child|youth|adult|middle-aged|elderly",
    "gender": "male|female",
    "occupation": "Specific occupation/role",
    "casta": "español|criollo|mestizo|indígena|africano|mulato",
    "class": "elite|middling|common|poor",
    "personality": "2-3 trait description",
    "appearance": "Physical description",
    "description": "Brief character summary"
  },
  "simpleInteraction": {
    "type": "service_offer|donation_request|competitive_check|information_exchange|social_visit|null",
    "npcName": "Full NPC name",
    "npcId": "kebab-case-id",
    "npcPortrait": "/portraits/filename.jpg",
    "offer": {"item": "string", "price": number, "description": "string", "stock": number},
    "request": {"item": "string", "reason": "string", "urgency": "low|moderate|high", "reputationImpact": {"donate": number, "refuse": number}},
    "competitive": {"targetItem": "string", "offeredPrice": number, "actualValue": number, "intent": "testing|spying|sabotage"},
    "information": {"topic": "string", "cost": "string (e.g., '1 bread or 2 reales')", "value": "critical|useful|trivial"},
    "social": {"purpose": "string", "mood": "friendly|concerned|urgent"}
  },
  "requestNewPatient": "boolean - true if a new patient should arrive next turn, false otherwise",
  "patientContext": "string or null - Brief reason why patient is arriving (only if requestNewPatient is true). Examples: 'Morning rush at botica', 'Messenger sent by nobleman', 'Word of Maria's skill has spread'",
  "entities": [
    {
      "text": "exact text from narrative",
      "entityType": "npc|patient|animal|item|location",
      "tier": "story-critical|recurring|background",
      "occupation": "optional for NPCs",
      "description": "for unnamed entities",
      "wikipediaQuery": "string or null - For people (npc/patient), suggest a historically relevant Wikipedia page about their ROLE/CONTEXT (e.g., 'Converso' or 'Midwifery in colonial Mexico'), NOT their name. For items/locations, use null to allow direct name lookup, OR suggest a more specific page if needed (e.g., 'Mexico City Metropolitan Cathedral' instead of just 'Cathedral')",
      "demographics": {
        "gender": "male|female|unknown",
        "age": "child|youth|adult|middle-aged|elderly",
        "casta": "español|indígena|africano|mestizo|mulato|criollo|unknown",
        "class": "elite|middling|common|poor"
      }
    }
  ]
}
\`\`\`

### Simple Interaction Field (simpleInteraction):
**When the NPC has simpleInteractionType, populate this field with the interaction data.**

**CRITICAL - NEVER USE simpleInteraction FOR MEDICAL SITUATIONS:**
- ✗ Patients arriving with symptoms
- ✗ Messengers requesting treatment for sick relatives
- ✗ Anyone seeking medical consultation, diagnosis, or prescriptions
- ✗ House call requests for the ill
- ✗ Medical contract negotiations

**ONLY USE simpleInteraction FOR NON-MEDICAL ENCOUNTERS:**
- ✓ Water seller offering barrels (mundane goods)
- ✓ Beggar asking for bread/coins (charity)
- ✓ Rival apothecary testing prices (business)
- ✓ Street urchin selling gossip (information)
- ✓ Friend bringing books/warnings (social)

**If the interaction involves illness, symptoms, or medical services → Set type to NULL.**

**DEFAULT RULE: If the user prompt does NOT contain "SIMPLE INTERACTION MODE" instructions, set type to NULL.**
This field should ONLY be populated when explicitly instructed to do so.

Set type to null for normal interactions. Otherwise, extract the appropriate data:
- **service_offer**: Water seller, food vendor → Extract item, price, description, stock
- **donation_request**: Beggar asking for charity → Extract item, reason, urgency, reputationImpact (donate: +3 to +10, refuse: -3 to -10)
- **competitive_check**: Rival testing prices → Extract targetItem, offeredPrice, actualValue, intent
- **information_exchange**: STREET GOSSIP ONLY (street urchin selling rumors for 1-2 reales). DO NOT use for examining documents, helping with complex requests, or risky involvement. Only for buying simple gossip/rumors.
- **social_visit**: Friend visiting → Extract purpose, mood

**CRITICAL - DO NOT use simpleInteraction for:**
- Examining forbidden/dangerous documents → use null (let narrative flow naturally)
- Helping NPCs with specialized tasks (extraction, translation, etc.) → use null or contractOffer
- Getting involved in risky/dangerous situations → use null (these are story decisions, not transactions)
- Complex multi-turn interactions → use null (simple interactions are 1-click resolved)

**Examples:**
\`\`\`json
{
  "simpleInteraction": {
    "type": "service_offer",
    "npcName": "Pedro Vázquez",
    "npcId": "pedro-vazquez",
    "npcPortrait": "/portraits/mestizomalevendormiddleaged.jpg",
    "offer": {
      "item": "Water Barrel",
      "price": 3,
      "description": "Fresh from Chapultepec aqueduct",
      "stock": 2
    }
  }
}
\`\`\`

\`\`\`json
{
  "simpleInteraction": {
    "type": "donation_request",
    "npcName": "Widow Socorro",
    "npcId": "widow-socorro",
    "npcPortrait": "/portraits/elderlyfemaleindiapoor.jpg",
    "request": {
      "item": "bread",
      "reason": "family starving",
      "urgency": "high",
      "reputationImpact": {"donate": 5, "refuse": -5}
    }
  }
}
\`\`\`

### Primary NPC & Portrait System (NEW):
**Show the person who is PHYSICALLY PRESENT in the scene with Maria, NOT people being discussed or mentioned.**

**CRITICAL RULE: Show who Maria is LOOKING AT and TALKING TO, not who she's HEARING ABOUT.**

${formatPortraitListForPrompt()}

**When to provide primaryPortrait & primaryNPC:**
✓ NPC in the same room/location as Maria, actively conversing
✓ Person Maria is examining, treating, or directly interacting with
✗ Person being TALKED ABOUT but not present (sick relative, absent friend, etc.)
✗ Person mentioned in dialogue but not in the scene
✗ Background entities (soldiers marching past)
✗ Animals, items, locations
✗ Maria alone navigating

**EXAMPLES:**
✓ Mother at door talking about sick son → Show mother's portrait (she's present)
✓ Priest tells you about merchant → Show priest's portrait (he's present)
✗ Servant delivers message from Doña Isabel → null (Isabel absent)

**NPC Identity Consistency:**
Check conversation history. If same NPC still present → reuse EXACT name + portrait from previous turn. Only create NEW identity for NEW arrivals. If NPC leaves, narrate that departure.

**primaryNPC must describe the PHYSICALLY PRESENT person:**
- name (full formal name of the person AT THE SCENE)
- age, gender (for portrait matching)
- occupation (specific job of the person Maria is LOOKING AT, not who they represent)
- casta, class (colonial social hierarchy)
- personality (2-3 traits describing their demeanor and character: "Direct and businesslike, seems accustomed to giving orders", "Soft-spoken but determined", "Nervous but respectful, chooses words carefully")
- appearance (physical description of the person PRESENT: build, clothing, distinguishing features)
- description (1-2 sentence summary of THIS person, not who they're talking about)

**IMPORTANT - NPC Emotional Variety:**
Not every NPC should show strong physical reactions (wincing, flinching, recoiling, grimacing). Most people speak calmly and directly. Reserve intense physical reactions for:
- Patients in acute pain
- NPCs receiving shocking news
- Moments of genuine crisis

Most conversations should be straightforward without constant physical distress signals.

**Portrait Selection Rules:**
1. Match demographics first (age + gender + class) OF THE PERSON PRESENT
2. Match occupation second (clergy, merchant, soldier) OF THE PERSON PRESENT
3. Match casta third (español, criollo, mestizo) OF THE PERSON PRESENT
4. If no perfect match, choose closest approximate

**CRITICAL:** Keep showPortraitFor for compatibility, but primaryPortrait is now authoritative.

### Patient Request System (requestNewPatient):
**YOU control when new patients arrive.** Only request a new patient when it makes narrative sense.

**Set requestNewPatient to TRUE when:**
- Maria is clearly waiting for patients at her shop 
- Player says something like "wait for patients" or "open the shop"
- It's day at the botica and no one has visited recently
- The narrative suggests patients would naturally seek Maria out

**Set requestNewPatient to FALSE when:**
- Currently treating an active patient (don't interrupt)
- Maria is away from her shop/workplace
- It's late evening 
- Maria is busy with other activities (mixing medicines, studying, eating)
- The scene doesn't support a new arrival (traveling, sleeping, in crisis)
- Someone already arrived this turn

**patientContext examples:**
- "Nobleman sends messenger requesting treatment"
- "Patient returns for follow-up treatment"

**Default to FALSE unless context clearly supports a new patient arrival.**

### Contract Offers (CRITICAL):
When NPC requests treatment/purchase, STOP before Maria responds. Let player decide.

**Rules:**
1. NPC makes request with clear terms ("I'll pay X reales for treatment")
2. END narrative before Maria accepts/declines - no auto-completion
3. StateAgent detects and creates contract modal

**Examples:**
✓ "Please help my son. I can pay 15 reales." → STOP (player decides)
✗ "She asks for help and Maria agrees" → WRONG (auto-completed)

### Entity Detection:
List 2-3 most important interactive elements in "entities" array.

**Include ONLY:**
- Named NPCs ("Don Luis", "Señora Beatriz")
- Unnamed characters with narrative significance ("a beggar blocking the path", "a messenger with urgent news")
- Important animals that are central to the scene ("a stray dog barking at you")
- Significant items that are plot-relevant ("a bloodstained letter", "a mysterious vial")
- Key locations ("the alley entrance", "the Cathedral")

**EXCLUDE (Do NOT list as entities):**
- Currency amounts ("three reales", "10 pesos", "silver coins")
- Generic objects mentioned in passing ("the door", "the sun", "thread", "cloth")
- Abstract concepts ("fear", "urgency", "hope")
- Weather/atmosphere ("rain", "heat", "dust")
- Body parts or common items ("hands", "eyes", "a chair")
- Trivial possessions that aren't plot-critical ("her shawl", "his hat")
- Generic descriptions ("common clothes", "worn sandals")

**Guideline:** Only include entities the player might want to click on or interact with meaningfully

**Field rules:**
- "text": Must match narrative EXACTLY for highlighting
- "tier": story-critical (plot-essential) | recurring (named, likely to reappear) | background (unnamed one-time)
- "description": Required for unnamed entities
- "wikipediaQuery": **ONE Wikipedia article suggestion per turn (max)**
  - **CRITICAL:** Use SIMPLE, GENERAL Wikipedia article titles that actually exist. Avoid overly specific phrases.
  - **Test mentally:** Would this exact phrase be a Wikipedia article title? If unsure, use simpler/broader term.
  - **ONLY ONE** wikipediaQuery per turn across ALL entities (not one per entity). Choose the most educationally valuable term.

  - **For NPCs/patients:** Suggest pages about their ROLE/OCCUPATION/SOCIAL CONTEXT (not personal names)
    - ✓ Good: "Converso", "Midwife", "Spanish Inquisition", "Criollo people"
    - ✗ Bad: "Rosa Maria Perez" (person name), "Midwifery in colonial Mexico" (too specific - use "Midwife")

  - **For items/objects:** Use the SIMPLEST form of the item name
    - ✓ Good: "Molcajete", "Hacienda", "Copal", "Metate"
    - ✗ Bad: "Hacienda system in New Spain" (too specific - use "Hacienda"), "Traditional grinding tools" (too generic)

  - **For locations:** Use the actual Wikipedia article title
    - ✓ Good: "Mexico City Metropolitan Cathedral", "Zócalo"
    - ✗ Bad: "Cathedral" (too vague), "The main plaza" (not an article title)

  - **When in doubt:** Use the SHORTEST viable term. "Hacienda" not "Hacienda system". "Converso" not "Converso in New Spain".
- "demographics": **REQUIRED for NPCs and patients** - Provides portrait matching data
  - "gender": Physical presentation (male, female, or unknown if ambiguous/group)
  - "age": Apparent age category (child <12, youth 12-20, adult 20-40, middle-aged 40-60, elderly 60+)
  - "casta": Colonial caste system category (español/European, indígena/Indigenous, africano/African, mestizo/mixed Spanish-Indigenous, mulato/mixed Spanish-African, criollo/American-born Spanish, unknown)
  - "class": Socioeconomic status (elite/nobility-wealthy, middling/artisans-merchants, common/laborers, poor/destitute)
  - **Omit demographics for animals, items, and locations**

**Examples:**
- Named NPC: \`{ "text": "Señor Benavides", "entityType": "npc", "tier": "recurring", "occupation": "herb merchant", "wikipediaQuery": "Herbalism", "demographics": { "gender": "male", "age": "middle-aged", "casta": "español", "class": "middling" } }\`
- Unnamed character: \`{ "text": "a weathered beggar", "entityType": "npc", "tier": "background", "description": "An elderly Indigenous man in tattered clothes", "wikipediaQuery": null, "demographics": { "gender": "male", "age": "elderly", "casta": "indígena", "class": "poor" } }\`
- Patient: \`{ "text": "Doña Mercedes", "entityType": "patient", "tier": "recurring", "description": "A wealthy criolla woman with fever", "wikipediaQuery": null, "demographics": { "gender": "female", "age": "adult", "casta": "criollo", "class": "elite" } }\`
- Item: \`{ "text": "molcajete", "entityType": "item", "tier": "background", "description": "A stone mortar and pestle", "wikipediaQuery": null }\`
- Location: \`{ "text": "the Cathedral", "entityType": "location", "tier": "recurring", "description": "The grand Metropolitan Cathedral", "wikipediaQuery": null }\`

**Remember:** Only ONE entity should have a non-null wikipediaQuery per turn. Choose the most educationally valuable term.

### Writing Style:
${core.tone || 'Clear, concise prose. No purple language. Interesting details, historically vivid touches. 1-3 paragraphs max.'}

${mechanics.commands ? `\n### Commands Available:\n${mechanics.commands}` : ''}

### Narrative Choice Structure (CRITICAL - JSON FORMAT):
**IMPORTANT:** The choice question MUST be placed INSIDE the "narrative" field of your JSON response, NOT after the closing brace.

**Correct structure:**
{
  "narrative": "She shifts her weight nervously. **Will you examine the child, or decline the request?**",
  "entities": [...]
}

**WRONG - DO NOT DO THIS:**
{
  "narrative": "She shifts her weight nervously.",
  "entities": [...]
}
**Will you examine the child?**  ← WRONG! This breaks JSON parsing!

**Format Rules:**
- End the "narrative" field's text content with a bolded choice question
- Use bold markdown: **Will you [option A], or [option B]?**
- Support 1-3 choices:
  - Single choice (yes/no implicit): "**Will you see who is there?**"
  - Two choices: "**Will you see who is there, or ignore them?**"
  - Three choices: "**Will you greet them, ask what they need, or turn away?**"

**Complete Examples:**
{
  "narrative": "The door creaks open. A figure stands in shadow. **Will you see who is there, or ignore them?**",
  "entities": [...]
}

{
  "narrative": "She waits for your response, hands clasped. **Do you accept her offer, or decline politely?**",
  "entities": [...]
}

**Guidelines:**
- Make choices contextual to the narrative (not generic)
- Use active verbs (see, speak, go, refuse, accept, examine, help, etc.)
- Keep options brief (3-7 words each)
- Natural language, not game commands
- Make the question feel organic to the story, not mechanical

**This ending question structure is REQUIRED for all narrative responses.** The question MUST be inside the JSON "narrative" field.

### Historical Context:
${historical.accuracy || 'Maintain accuracy. No anachronisms. Use period terminology.'}
${historical.social ? `\n${historical.social}` : ''}

${narrative.pacing ? `\n### Pacing:\n${narrative.pacing}` : ''}
${narrative.events ? `\n### Events:\n${narrative.events}` : ''}
${narrative.npcIntroduction ? `\n### NPC Introduction:\n${narrative.npcIntroduction}` : ''}

**Focus only on narrative.** Another agent handles game state, inventory, and journal entries.

${mapContext}`;
}

/**
 * Build conversation history with journal compression
 * Recent 5 turns: full detail
 * Older 10 turns: journal entries only
 * @param {Array} conversationHistory - Full conversation history
 * @param {Array} journal - Journal entries [{content: string, type: string}]
 * @param {number} currentTurn - Current turn number
 * @returns {string} Formatted history string
 */
function buildConversationHistory(conversationHistory, journal = [], currentTurn = 0) {
  // Validate inputs
  if (!Array.isArray(journal)) {
    console.warn('[buildConversationHistory] journal is not an array:', typeof journal);
    journal = [];
  }

  // DEBUG: Log what we received
  console.log('[buildConversationHistory] Received:', {
    historyLength: conversationHistory?.length,
    journalLength: journal?.length,
    currentTurn,
    historyType: Array.isArray(conversationHistory) ? 'array' : typeof conversationHistory,
    journalType: Array.isArray(journal) ? 'array' : typeof journal
  });

  // Log first few messages to see structure
  if (conversationHistory && conversationHistory.length > 0) {
    console.log('[buildConversationHistory] First 2 messages:', {
      msg0: conversationHistory[0],
      msg1: conversationHistory[1]
    });
    console.log(`[buildConversationHistory] Total messages: ${conversationHistory.length}`);

    // Log last few messages for debugging
    const lastFew = conversationHistory.slice(-3);
    console.log('[buildConversationHistory] Last 3 messages:', lastFew.map(msg => ({
      role: msg?.role,
      contentPreview: msg?.content ? msg.content.substring(0, 50) : 'NO CONTENT',
      hasContent: !!msg?.content
    })));
  }

  if (!conversationHistory || conversationHistory.length === 0) {
    console.warn('[buildConversationHistory] Empty or missing conversation history!');
    return '';
  }

  // Filter out system messages - they break user/assistant pairing
  const filteredHistory = conversationHistory.filter(msg => msg.role !== 'system');
  console.log(`[buildConversationHistory] Filtered ${conversationHistory.length - filteredHistory.length} system messages`);

  // Group conversation into user+assistant pairs
  const pairs = [];
  for (let i = 0; i < filteredHistory.length; i += 2) {
    const userMsg = filteredHistory[i];
    const assistantMsg = filteredHistory[i + 1];

    if (userMsg?.role === 'user' && assistantMsg?.role === 'assistant' &&
        userMsg?.content && assistantMsg?.content) {
      pairs.push({
        user: userMsg.content,
        assistant: assistantMsg.content,
        turnIndex: Math.floor(i / 2) + 1
      });
    } else {
      console.warn(`[buildConversationHistory] Skipped malformed pair at index ${i}:`, {
        userRole: userMsg?.role,
        assistantRole: assistantMsg?.role,
        hasUserContent: !!userMsg?.content,
        hasAssistantContent: !!assistantMsg?.content
      });
    }
  }

  console.log(`[buildConversationHistory] Created ${pairs.length} valid pairs from ${filteredHistory.length} user/assistant messages`);

  // Take last 15 turns (5 full + 10 journal)
  const recentPairs = pairs.slice(-15);
  const history = [];

  // OLD TURNS (6-15 turns ago): Use journal entries if available
  const oldTurns = recentPairs.slice(0, -5);
  if (oldTurns.length > 0 && journal.length > 0) {
    // Get corresponding journal entries (journal array matches conversation by index)
    const startIndex = Math.max(0, journal.length - recentPairs.length);
    const oldJournalEntries = journal.slice(startIndex, startIndex + oldTurns.length);

    if (oldJournalEntries.length > 0) {
      history.push('### Earlier Events (from Journal):');
      oldJournalEntries.forEach((entry, index) => {
        if (entry && entry.content) {
          // Journal entries already well-formatted: "**Date, Time, Location**: Summary"
          history.push(entry.content);
        }
      });
      history.push(''); // Blank line separator
    }
  }

  // RECENT TURNS (last 5): Full conversation detail
  const recentFive = recentPairs.slice(-5);
  if (recentFive.length > 0) {
    history.push('### Recent Conversation:');
    recentFive.forEach(pair => {
      if (pair.user && pair.assistant) {
        history.push(`Player: ${pair.user}`);
        history.push(`Narrator: ${pair.assistant}`);
      }
    });
  }

  // Log compression stats (with safety checks for undefined/null)
  const uncompressedTokens = recentPairs.reduce((sum, p) => {
    const userLen = (p.user && typeof p.user === 'string') ? p.user.length : 0;
    const assistantLen = (p.assistant && typeof p.assistant === 'string') ? p.assistant.length : 0;
    return sum + (userLen + assistantLen) / 4;
  }, 0);
  const compressedTokens = history.join('\n').length / 4;
  const savedTokens = uncompressedTokens - compressedTokens;
  const journalUsed = oldTurns.length > 0 && journal.length > 0 ? Math.min(oldTurns.length, journal.length) : 0;
  console.log(`[History Compression] ${recentPairs.length} turns (${journalUsed} journal + ${recentFive.length} full): ${Math.ceil(uncompressedTokens)}→${Math.ceil(compressedTokens)} tokens (-${Math.ceil(savedTokens)}, ${Math.round((savedTokens/uncompressedTokens) * 100)}% saved)`);

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
  continuationNPC = null
}) {
  try {
    // Load scenario
    const scenario = scenarioLoader.loadScenario(scenarioId);

    // Build map context if available
    const mapContext = mapData && playerPosition && currentMapId
      ? buildMapContext(mapData, playerPosition, playerFacing, currentMapId)
      : '';

    // Build narrative prompt with map context
    const narrativePrompt = buildNarrativePrompt(scenario.prompts, mapContext);

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
      const interactionTypeExamples = {
        service_offer: 'NPC offers mundane items for sale (water, firewood, food). Example: "Fresh water from the aqueduct, 3 reales per barrel!" Keep it SHORT (1-2 sentences). NO medical consultations.',
        donation_request: 'NPC asks for charity (bread, medicine, coins). Example: "Please, señora, my children are starving. Just one loaf of bread?" Show urgency and dignity. NO medical consultations.',
        competitive_check: 'Rival apothecary tests Maria with lowball offers or price scouting. Example: "I\'ll pay 8 reales for your European mercury." Be calculating and businesslike. NO medical consultations.',
        information_exchange: 'Street urchin/gossip offers intel for payment. Example: "I know when the Inquisitor plans to visit... but I\'m hungry." Be coy and street-smart. NO medical consultations.',
        social_visit: 'Friend brings warnings, books, or friendly conversation. Example: Sister Teresa arrives with herbs and concerns about Inquisition activity. Be warm but purposeful. NO medical consultations.'
      };

      const example = interactionTypeExamples[selectedEntity.simpleInteractionType] || '';

      simpleInteractionContext = `
**CRITICAL - SIMPLE INTERACTION MODE:**
This is a FAST, SIMPLE interaction - NOT a medical consultation or complex negotiation.

NPC Type: ${selectedEntity.simpleInteractionType}
${example}

**RULES FOR SIMPLE INTERACTIONS:**
1. Keep narrative BRIEF (1-2 short paragraphs, 50-100 words MAX)
2. Get straight to the point - what does the NPC want/offer?
3. NO lengthy backstories, NO medical complaints about relatives
4. NO complex negotiations - just a simple offer or request
5. Player should be able to respond with a quick yes/no or simple choice
6. This should feel like a quick street encounter, not a consultation

**EXAMPLES TO FOLLOW:**
✓ "A water seller stops at your door. 'Fresh water, 3 reales!' he calls cheerfully."
✓ "An elderly woman approaches timidly. 'Please, señora... just one loaf of bread for my grandchildren?'"
✗ "A man arrives saying his wife has the bloody flux and needs pomegranate bark..." (TOO MEDICAL)
✗ "Pedro explains his wife's symptoms in great detail..." (TOO LONG, TOO COMPLEX)

Generate a SHORT, SIMPLE interaction matching the type above.
`;
    }

    // Build reputation context
    const reputationContext = buildReputationContext(reputation, selectedEntity);

    // Build skills context
    const skillsContext = playerSkills ? buildSkillsContext(playerSkills) : '';

    // PHASE 2: Build portrait continuity context
    let recentPortraitContext = '';
    if (recentPortrait && conversationHistory.length > 2) {
      recentPortraitContext = `
**IMPORTANT - Portrait Continuity:**
The NPC in the previous turn was displayed with portrait: ${recentPortrait}

If the SAME PERSON is still present in this scene, you MUST use: ${recentPortrait}
Only change the portrait if this is a DIFFERENT person (new arrival, different character).
`;
    }

    // PHASE 3: Build conversation continuation context
    let continuationContext = '';
    if (isContinuation && continuationNPC) {
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

    // Build conversation history (5 full turns + 10 journal entries)
    const recentHistory = buildConversationHistory(conversationHistory, journal, turnNumber);

    const userPrompt = `Context:
${contextSummary}

Recent Conversation:
${recentHistory}

${entityContext ? `\n${entityContext}\n` : ''}
${simpleInteractionContext ? `\n${simpleInteractionContext}\n` : ''}
${recentPortraitContext}
${continuationContext}
${reputationContext}

${skillsContext ? `\n${skillsContext}\n` : ''}

Player Action: ${playerAction}

Turn: ${turnNumber + 1}

Generate narrative response. Remember: JSON format, concise, historically accurate, vivid details.`;

    const messages = [
      { role: 'system', content: narrativePrompt },
      { role: 'user', content: userPrompt }
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

    const response = await createChatCompletion(
      messages,
      0.7, // Higher temperature for more creative narrative
      1200,
      { type: 'json_object' },
      { agent: 'NarrativeAgent', turnNumber } // Metadata for LLM transparency view
    );

    const rawResponse = response.choices[0].message.content;

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

    // PHASE 2 ENFORCEMENT: Override LLM portrait choice during conversation continuation
    // This ensures portrait consistency even if LLM ignores prompt instructions
    if (isContinuation && recentPortrait) {
      if (narrativeData.primaryPortrait && narrativeData.primaryPortrait !== recentPortrait) {
        console.log(`[NarrativeAgent] ⚠️ PORTRAIT CONSISTENCY ENFORCEMENT: LLM tried to change portrait from ${recentPortrait} to ${narrativeData.primaryPortrait} during conversation continuation. Overriding to maintain consistency.`);
        narrativeData.primaryPortrait = recentPortrait;
      } else if (!narrativeData.primaryPortrait) {
        console.log(`[NarrativeAgent] 🔧 PORTRAIT CONSISTENCY ENFORCEMENT: LLM didn't provide portrait during continuation. Using previous: ${recentPortrait}`);
        narrativeData.primaryPortrait = recentPortrait;
      } else {
        console.log(`[NarrativeAgent] ✓ PORTRAIT CONSISTENCY: LLM correctly maintained portrait: ${recentPortrait}`);
      }
    }

    return {
      success: true,
      narrative: narrativeData.narrative || '',
      responseType: narrativeData.responseType || 'narration', // PHASE 3: Response mode (dialogue/movement/narration)
      dialogue: narrativeData.dialogue || null, // PHASE 3: Pure NPC speech for dialogue mode
      npcSpeaker: narrativeData.npcSpeaker || null, // PHASE 3: NPC name for dialogue mode
      npcDialogue: narrativeData.npcDialogue || null,
      sceneDescription: narrativeData.sceneDescription || '',
      suggestedCommands: narrativeData.suggestedCommands || [],
      showPortraitFor: narrativeData.showPortraitFor || null, // LLM portrait hint (old system)
      primaryPortrait: narrativeData.primaryPortrait || null, // PHASE 2: Direct portrait filename
      primaryNPC: narrativeData.primaryNPC || null, // PHASE 2: Complete NPC profile
      simpleInteraction: narrativeData.simpleInteraction || null, // Simple interaction data (service offer, donation, etc.)
      requestNewPatient: narrativeData.requestNewPatient || false, // LLM controls patient flow
      patientContext: narrativeData.patientContext || null, // Reason for patient arrival
      entities: narrativeData.entities || [] // Entity list from LLM
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

export default {
  generateNarrative
};
