// NarrativeAgent - Specialized agent for story generation
// Handles: Story text, player actions, NPC interactions, dialogue, spatial context

import { createChatCompletion } from '../services/llmService';
import { buildContextSummary, buildEntityContext, buildSkillsContext } from '../../prompts/promptModules';
import { scenarioLoader } from '../services/scenarioLoader';
import { getGridSystem } from '../../features/map/services/gridMovementSystem';
import { getReputationTier, getFactionStanding, FACTION_INFO } from '../systems/reputationSystem';
// Portrait list removed from prompt - system does lookup after demographics provided
import { findPortraitByName, portraitExists } from '../services/portraitMatcher';
import { resolvePortrait } from '../services/portraitResolver';

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

**MOVEMENT MODE** - Two types of movement:

1. **Directional movement** (single step):
   - Patterns: "go east", "walk north", "head south", "turn left"
   - Set \`responseType: "movement"\`
   - Brief description (2-3 sentences, 40-60 words)
   - Describe ONE unit of movement in that direction
   - Player stays in movement mode, can continue moving
   - **MUST use SECOND PERSON ("You walk...", "You step...") - NEVER first person**

2. **Destination movement** (arrive at target):
   - Patterns: "go to the meeting", "go to the market", "go home", "head to [specific place]"
   - If destination mentioned in recent context (last 1-3 turns) → player wants to ARRIVE there
   - Set \`responseType: "narration"\` (switching to full scene mode)
   - Summarize journey briefly (1 sentence)
   - Then describe arrival and what happens AT the destination (full narration)
   - **MUST use SECOND PERSON throughout**
   - **Example**: "go to the meeting" after summons → summarize walk, arrive at Alcalde's office, describe the office interior and who's there

**NARRATION MODE (DEFAULT)** - All other actions:
- Player actions, NPC interactions, examining, choices, contracts, commands
- Set \`responseType: "narration"\`
- Full scene in \`narrative\` field (1-2 paragraphs)
- **Use SECOND PERSON ("You examine...", "You say...", "You notice...")**
- **Embed NPC dialogue naturally** using quotation marks

**CRITICAL - PLAYER AGENCY RULES:**
- **NEVER invent Maria's dialogue** - if player says something, that's exactly what she says (no embellishment, no adding thoughts/tone)
- **NEVER invent Maria's major actions** - if player says "go to market", she goes to market (don't make her stop to talk to someone first)
- **FOLLOW PLAYER COMMANDS LITERALLY**:
  * "buy cannabis" → purchase cannabis immediately, show the transaction
  * "go away" → NPC leaves (unless strong in-character reason like guard, authority figure with power over Maria)
  * "go to market" → describe arrival at market, NOT detours or conversations along the way
- **DON'T elaborate on player inputs** - if player says "ask for price", jump straight to NPC stating the price
- **Show CONSEQUENCES immediately** - NPC reactions, what happens next - NOT what Maria does/thinks/feels (player controls that)

**Examples:**

\`\`\`json
// Directional movement (single step)
{
  "responseType": "movement",
  "narrative": "You walk north along the dusty Calle de Plateros. The cathedral's unfinished towers loom ahead, scaffolding wrapped around stone. A vendor calls out, selling tamales."
}
\`\`\`

\`\`\`json
// Destination movement (arrive at target)
// Player said "go to the meeting" after receiving summons to Alcalde's office
{
  "responseType": "narration",
  "narrative": "You make your way east through the crowded streets, passing the market and the cathedral. Within minutes, you arrive at the imposing stone building housing the Alcalde Ordinario's offices. The anteroom smells of ink and old parchment. A clerk in dark robes looks up from his ledger, studying you with narrowed eyes. \\"You are Maria de Lima?\\" he asks curtly, gesturing toward a heavy wooden door. \\"The Alcalde will see you now.\\""
}
\`\`\`

\`\`\`json
// Regular narration
{
  "responseType": "narration",
  "narrative": "Beatriz's face brightens. \\"The ipecacuanha, Doña Maria,\\" she says, gesturing to the bundles. \\"The bitter one for purging the stomach.\\" She unwraps the cloth to reveal dark, gnarled specimens."
}
\`\`\`

### Response Format (JSON):



\`\`\`json
{
  "responseType": "movement|narration - REQUIRED (use 'narration' for everything except movement)",
  "narrative": "Story text (1-3 paragraphs, markdown) - PURE NARRATIVE ONLY, no meta-commentary or explanations",
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
  "npcDeparted": "boolean - true if the current NPC has completed their business and is leaving the scene, false otherwise",
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
- ✗ NPCs saying "I have a matter of the humours", "I need your medical expertise", "I'm feeling unwell"
- ✗ ANY mention of illness, ailments, symptoms, or requests for Maria's medical skills

**ONLY USE simpleInteraction FOR NON-MEDICAL ENCOUNTERS:**
- ✓ itinerant merchants (mundane goods like water, firewood, food - NOT medicine)
- ✓ Beggar asking for bread/coins (charity, NOT medical charity)
- ✓ Rival apothecary testing prices (business competition)
- ✓ Street urchin selling gossip (information exchange)
- ✓ Friend bringing books/warnings (social)

**CRITICAL MUTUAL EXCLUSIVITY RULES:**

1. **⚠️ ABSOLUTE RULE: If NPC mentions ANY medical topic → ALWAYS set type to NULL**
   - Medical keywords: illness, sick, symptoms, humours, fever, pain, ailment, treatment, examination, diagnosis, medicine, remedy, medical expertise, consultation
   - "I have a small matter of the humours" = NULL (MEDICAL! StateAgent handles this as treatment contract)
   - "I need your medical expertise" = NULL (MEDICAL! StateAgent handles this as treatment contract)
   - "My son is sick, can you help?" = NULL (StateAgent will detect as treatment contract)
   - "I need medicine for flux" = NULL (StateAgent will detect as sale_inquiry contract)
   - Even if NPC offers payment for medical help = NULL (treatment contract)
   - Even if NPC is poor/desperate = NULL (medical requests use contract system, not simpleInteraction)

2. **If the NPC is requesting medicine, treatment, or medical examination → ALWAYS set type to NULL**
   - Do NOT use donation_request for medical charity cases
   - Do NOT use service_offer for medical consultation/treatment (these are CONTRACTS handled by StateAgent!)
   - Medical interactions use the contractOffer system (detected by StateAgent), NOT simpleInteraction

3. **DEFAULT RULE: If the user prompt does NOT contain "SIMPLE INTERACTION MODE" instructions, set type to NULL.**
   This field should ONLY be populated when explicitly instructed to do so.

**Only use simpleInteraction for non-medical interactions:**
- **service_offer**: NPC is SELLING TO Maria (Maria is BUYER) - Water seller, food vendor offering goods → Extract item, price, description, stock
- **donation_request**: Beggar asking for charity → Extract item, reason, urgency, reputationImpact (donate: +3 to +10, refuse: -3 to -10)
- **competitive_check**: Rival testing prices → Extract targetItem, offeredPrice, actualValue, intent
- **information_exchange**: STREET GOSSIP ONLY (street urchin selling rumors for 1-2 reales). DO NOT use for examining documents, helping with complex requests, or risky involvement. Only for buying simple gossip/rumors.
- **social_visit**: Acquaintance, friend or enemy visiting → Extract purpose, mood

**CRITICAL - DO NOT use simpleInteraction for:**
- **Commerce/purchases**: NPC wants to buy/sell items → type: "null" (StateAgent handles via actionPrompt)
- **Medical requests**: Any treatment/diagnosis/remedy → type: "null" (StateAgent handles via contractOffer or actionPrompt)
- Risky/dangerous involvement → type: "null"
- Complex multi-turn interactions → type: "null"

**✓ CORRECT - Water seller offers TO SELL TO Maria (service_offer):**
\`\`\`json
{
  "narrative": "A water vendor approaches. 'Fresh water from Chapultepec! Only 3 reales per barrel!'",
  "simpleInteraction": {
    "type": "service_offer",  // ✓ CORRECT! Vendor is SELLING TO Maria
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

**CORRECT - Non-medical charity (donation_request):**
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


### Player Agency:

**STOP before mechanical actions** (mixing, selling, buying, prescribing) - player uses modals for these.
**RESPECT player input** - if they say "examine mother", don't substitute "offer remedy".

**Examples**:
❌ "You measure guayaba leaves and prepare a decoction..." (mixing - use modal instead)
✓ "You consider which remedy might help."

❌ Player says "examine" → You narrate offering remedy (wrong action)
✓ Player says "examine" → You narrate examining (player's exact action)

**Player Agency:**
ALWAYS honor player's exact action. Never substitute "better" alternatives. Show real consequences (NPC reactions, physical effects, reputation). Exception: impossible actions (flying) fail realistically.

### Primary NPC & Portrait:
Show who Maria is LOOKING AT and TALKING TO, not who she's HEARING ABOUT.
- Present: NPC actively conversing with Maria → provide primaryNPC
- Absent: Person mentioned/discussed but not present → null
- Consistency: Same NPC still present → reuse exact name + portrait

primaryNPC fields: name, age, gender, occupation, casta, class, personality (1-2 traits)
- appearance (short description of the person PRESENT: build, clothing, distinguishing features)
- description (1 sentence summary of THIS person, not who they're talking about)

**CRITICAL - NPC Naming Guidelines (Historical Accuracy):**

Mexico City in 1680 was cosmopolitan with German, Flemish, French, Italian, Portuguese, Basque, Galician, Angolan, and diverse Spanish populations.

**AVOID OVERUSED CLICHÉS:** Do NOT default to "Tomás", "Isabel", "Juan", "María",

**Use diverse, historically accurate names:**

**Spanish (Peninsular/Criollo):**
- First: Alonso, Gonzalo, Rodrigo, Baltasar, Gaspar, Jerónimo, Andrés, Sebastián, Bartolomé
- First (F): Catalina, Inés, Beatriz, Leonor, Ana, Juana, Luisa, Clara, Mariana, Elvira, Teresa, Francisca
- Surnames: Velázquez, Montero, Ruiz, Mendoza, Guzmán, Pacheco, Vargas, 

**Basque (common in colonial admin):**
- First: Iñigo, Martín, Sancho, Lope
- First (F): Urraca, Sancha
- Surnames: Echevarría, Gorostiza, Arizpe, Ibarra, Urquiza, 

**Portuguese (merchants, traders):**
- First: Vasco, Afonso, Duarte, Rui, 
- First (F): Guiomar, Branca, Violante
- Surnames: Pereira, Silva, Teixeira, Cardoso, 

**German/Flemish (artisans, merchants):**
- First: Enrique, Guillermo, Otto, 
- First (F): Margarita, Gertrudis
- Surnames: Schäfer, Mueller, Strauss, 

**French (artisans, merchants):**
- First: Jacques, Pierre, François, 
- First (F): Marguerite, Jeanne, 
- Surnames: Dubois, Martin, Bernard, Moreau, 

**Italian (rare but present):**
- First: Giovanni/Juan, Lorenzo, Alessandro, Paolo
- Surnames: Fontana, Romano, Conti, Marino

**Angolan/African (enslaved, freedpersons - use Portuguese names or Africanized Portuguese):**
- First: Antão, Domingos, Simão, Gonçalo, 
- First (F): Úrsula, Esperança, Felipa, 
- Surnames: Often named after owners or saints (Bran, Lobo, de la Peña)

**Indigenous (baptized, often Spanish + Nahuatl):**
- First: Use Spanish baptismal names (Diego, Juan, Mateo, etc)
- Surnames: López, Hernández, García, or place names
- Alternative: Single Nahuatl name (Malintzin, Cuauhtémoc, Nezahualcóyotl) for traditional contexts

**Naming Patterns:**
- Españoles/Criollos: Full formal names (two first names + 1-2 surnames: "Rodrigo Alfonso de Guzmán y Pacheco")
- Mestizos/Castas: Simplified (one first + one surname: "Sebastián Montero")
- Indigenous: Spanish first + Spanish or place surname ("Baltasar Texcoco", "Mateo López")
- Enslaved: First name + owner surname or origin ("Domingos Angola", "Esperança Lobo")


**NPC Emotional Variety:**
NPCs show a wide variety of reactions. This is a gritty, realistic world with no punches pulled. 

Most conversations should be straightforward without constant physical distress signals.

**Portrait Selection Rules:**
1. Match demographics first (age + gender + class) OF THE PERSON PRESENT
2. Match occupation second (clergy, merchant, soldier) OF THE PERSON PRESENT
3. Match casta third (español, criollo, mestizo) OF THE PERSON PRESENT
4. If no perfect match, choose closest approximate

### Patient Encounter Types (CRITICAL - Balance Required):

**You control whether patients arrive DIRECTLY or send EMISSARIES. Maintain a 50/50 balance.**

**DIRECT PATIENT (50% of encounters):**
- Patient themselves appears at Maria's door
- They describe THEIR OWN symptoms: "I have terrible headaches", "I injured my arm"
- primaryNPC = the patient (show their portrait)
- More efficient, faster medical resolution
- **When to use:** Morning hours (8 AM - 2 PM), minor ailments, younger/mobile patients, common folk, straightforward cases

**EMISSARY ENCOUNTER (50% of encounters):**
- Family member/servant/messenger arrives on behalf of patient
- They describe SOMEONE ELSE's symptoms: "My wife has fever", "The master is bedridden", "My son needs help"
- primaryNPC = the messenger (show their portrait, NOT the patient's)
- Adds narrative complexity, potential for house calls
- **When to use:** Severe cases (patient can't travel), elite patients (send servants), evening hours, emergencies, dramatic scenarios

**CRITICAL - House Call Indicators for Emissary Encounters:**
When an emissary arrives, decide patient location in your narrative:
- **Patient will come to shop** (patientLocation: null): "She will arrive soon", "I brought him along", "He's waiting outside"
- **House call needed** (patientLocation: "[location]"): "He cannot leave his bed", "She's at our home on Calle de Tacuba", "Too weak to travel", "Confined to chambers"

**Balance Check:**
Review recent conversation history. If last 2-3 patient encounters were emissaries, create a DIRECT patient this time. If last 2-3 were direct, create an EMISSARY scenario. Variety maintains engagement.

### Patient Request System (requestNewPatient):
**YOU control when new patients arrive.** Only request a new patient when it makes narrative sense. It often does in Maria's shop.

**Set requestNewPatient to TRUE when:**
- It's day at the botica and no one is currently visiting
- The narrative suggests patients would naturally seek Maria out

**Set requestNewPatient to FALSE when:**
- Currently treating an active patient (don't interrupt)
- It's late evening 
- The scene doesn't support a new arrival (traveling, sleeping, in crisis)


**Default to FALSE unless context clearly supports a new patient arrival.**

### NPC Departure System (npcDeparted):
**YOU control when NPCs leave the scene.** Set this flag to dismiss NPCs when their business is complete.

**Set npcDeparted to TRUE when:**
- NPC's stated purpose is accomplished (message delivered, summons given, question answered)
- Transaction is completed (item sold, information shared, donation given/refused)
- Player explicitly dismisses them ("thank you, goodbye", "you may go", "that's all I needed")
- Conversation reaches natural conclusion (greetings exchanged, business finished, nothing more to discuss)

**Set npcDeparted to FALSE when:**
- Conversation is ongoing and unresolved
- NPC is waiting for player response to a question or offer
- Transaction is proposed but not yet accepted/declined
- Medical examination/treatment is in progress

**CRITICAL - When npcDeparted is TRUE:**
- MUST narrate the departure in the narrative field ("The corporal nods sharply, turns on his heel, and strides back toward the street")
- Set primaryPortrait to null (no one present anymore)
- Set primaryNPC to null
- Make it clear the NPC is LEAVING, not just standing silently

**Don't keep NPCs present indefinitely.** People arrive, conduct business, and leave. Natural flow.

### Commerce Scenarios:
At shop during business hours: customers arrive every 2-4 turns.
- Purchase: "I need X remedy, will pay Y reales"
- Prescription: "My head hurts, do you have something?"
- Charity: "I have no money, please help..."

END before Maria responds. DO NOT offer examination/diagnosis (triggers contract instead). Set simpleInteraction: null.

### Contract Offers:
NPC requests EXAMINATION/DIAGNOSIS ("I'll pay X for treatment") → END narrative before Maria responds. After agreement: narrate acknowledgment/departure only, not preparation/payment.

### Entity Detection:
List 2-3 most important interactive elements in "entities" array.

**Include ONLY:**
- Named NPCs ("Don Luis", "Señora Beatriz")
- Unnamed characters with narrative significance
- Important animals that are central to the scene, if any
- Significant items that are plot-relevant
- Key locations ("the alley entrance", "the Cathedral")

**EXCLUDE (Do NOT list as entities):**
- Currency amounts ("three reales", "silver coins")
- Generic objects mentioned in passing ("the door")
- Abstract concepts or weather
- Body parts or common items 
- Trivial possessions that aren't plot-critical 
- Generic descriptions ("common clothes", "worn sandals")

**Guideline:** Only include entities the player might want to click on or interact with meaningfully

**Field rules:**
- "text": Must match narrative EXACTLY for highlighting
- "tier": story-critical (plot-essential) | recurring (named, likely to reappear) | background (unnamed one-time)
- "description": Required for unnamed entities
- "wikipediaQuery": **ONE Wikipedia article suggestion per turn (max)**
  - Use SIMPLE, GENERAL Wikipedia article titles that actually exist. Avoid overly specific phrases.
  - Choose the most educationally valuable term.

  - **For NPCs/patients:** Suggest pages about their ROLE/OCCUPATION/SOCIAL CONTEXT (not personal names)
    - ✓ Good: "Converso", "Midwife", "Spanish Inquisition", "Criollo people"
    - ✗ Bad: "Rosa Maria Perez" (person name), "Midwifery in colonial Mexico" (too specific - use "Midwife")

  - **For items/objects:** Use the SIMPLEST form of the item name
    - ✓ Good: "Molcajete", "Hacienda", "Copal", "Metate"

  - **For locations:** Use the actual Wikipedia article title
    - ✓ Good: "Mexico City Metropolitan Cathedral", "Zócalo"

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


### Anti-Repetition System:

**Check conversation history for repetitive player actions:**
- If player repeated same action 2+ consecutive turns :
  → STOP offering that exact choice again
  → INJECT new event/interruption to break the loop

### Writing Style:
${core.tone || 'Clear, concise prose. No purple language. Interesting details, historically vivid touches. 1-2 paragraphs max.'}

${mechanics.commands ? `\n### Commands Available:\n${mechanics.commands}` : ''}

### Choice Questions:
End narrative with **bold question** INSIDE JSON "narrative" field: "**Will you X, or Y?**"

**When to skip questions:**
- There is a truly ambiguous moment in the plot which requires player to come up with original input

**When to ask:**
- most of the time

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
  console.log(`[History] ${visibleMessages.length} messages (${visibleMessages.filter(m => m.role === 'user').length} user, ${visibleMessages.filter(m => m.role === 'assistant').length} assistant, ${visibleMessages.filter(m => m.role === 'system').length} system) → ${Math.ceil(tokens)} tokens`);

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
      // Compressed interaction type guidance 
      const interactionGuidance = {
        service_offer: { tone: 'cheerful, direct, salesmanlike', items: 'aqueduct water (3 reales), river water (2r), firewood (oak/pine, 4r), charcoal (6r)', vary: 'quality claims, source, urgency' },
        donation_request: { tone: 'urgent but dignified, humble, specific', items: 'bread (1r), tortillas, medicine, coins (2-3r)', vary: 'family situation, desperation level' },
        competitive_check: { tone: 'calculating, businesslike, subtly condescending', items: 'lowball offers (50-70% value), quality criticism, price scouting', vary: 'politeness, directness' },
        information_exchange: { tone: 'coy, street-smart, transactional', items: 'gossip (1-2r), warnings, intel about Inquisitor/officials', vary: 'how much revealed upfront' },
        social_visit: { tone: 'warm but purposeful, concerned, friendly', items: 'warnings, books, herbs, advice', vary: 'urgency of warning' },
        extortion_demand: { tone: 'politely threatening, bureaucratic, matter-of-fact', items: '"voluntary donation" (5-10r), inspection fees, permits', vary: 'explicitness of threat' },
        indigenous_trade: { tone: 'proud, dignified, knowledgeable', items: 'huipils from Texcoco (12r), pottery, baskets, carved santos', vary: 'craftsmanship details' },
        protection_racket: { tone: 'matter-of-fact, casual threat, businesslike', items: 'monthly protection (5r), one-time payment (10r)', vary: 'how explicit the threat is' },
        entertainment_tip: { tone: 'charming, lighthearted, performative', items: 'songs (1r), stories, guitar music', vary: 'how much performed before asking' },
        food_purchase: { tone: 'cheerful, energetic, persuasive', items: 'fish from Xochimilco (2r), milk (1r), fresh tortillas, tamales', vary: 'freshness claims, time of day' },
        gamble_opportunity: { tone: 'persuasive, hopeful, slightly desperate', items: 'cathedral lottery (2r/ticket, 200r prize), card games, dice', vary: 'prize amount' },
        labor_offer: { tone: 'earnest, humble, eager', items: 'work for food/shelter, apprentice position, temporary help', vary: 'skills offered, desperation' },
        neighbor_complaint: { tone: 'judgmental, indignant, self-righteous', items: 'noise complaints, smell complaints, impropriety accusations', vary: 'severity, specific grievance' },
        church_donation: { tone: 'persistent but pious, professional fundraiser', items: 'cathedral repairs, feast day expenses, charity for poor (2-10r)', vary: 'cause, urgency' }
      };

      const guidance = interactionGuidance[selectedEntity.simpleInteractionType] || { tone: 'direct', items: 'mundane goods', vary: 'approach' };

      simpleInteractionContext = `
**SIMPLE INTERACTION MODE:**
Type: ${selectedEntity.simpleInteractionType}

**Approach**: ${guidance.tone}
**Typical items/offers**: ${guidance.items}
**Vary this encounter**: ${guidance.vary}, demographics, exact dialogue

**Rules**: BRIEF (50 words), direct offer/request, NO medical consultations, NO lengthy backstories
**Format**: One physical action + one line of dialogue (or vice versa)

**Examples of variation:**
✓ "A water seller stops. 'Aqueduct water, 3 reales!'"
✗ "Pedro explains his wife's symptoms in detail..." (TOO MEDICAL—WRONG TYPE)

Generate a BRIEF, VARIED encounter. Don't reuse exact dialogue from previous turns.
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

    // PHASE 3B: Build "no encounter" context when NPCs have departed
    let noEncounterContext = '';
    if (!selectedEntity && !isContinuation) {
      noEncounterContext = `
**No NPC Present:**
Previous NPCs have departed. Do NOT continue their scenes. Set primaryNPC/primaryPortrait to null.

**Waiting/Passive Actions:**
- If player waits for SPECIFIC expected thing ("wait for escort", "await patient"): Fulfill that expectation
- If player observes passively ("not much", "look around", "watch"): Pure description, no new events, no questions
- If vague waiting ("rest", "wait"): Introduce new event
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
${noEncounterContext}
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

    // NAME-BASED PORTRAIT MATCHING: Check if exact name match exists BEFORE LLM demographic selection
    // This allows specific portrait files (e.g., "pedrovázquez.png") to override generic demographic portraits
    // Only do this on NEW encounters, not continuations (to maintain portrait consistency)
    if (!isContinuation && narrativeData.primaryNPC && narrativeData.primaryNPC.name) {
      const nameBasedPortrait = findPortraitByName(narrativeData.primaryNPC.name);
      if (nameBasedPortrait) {
        console.log(`[NarrativeAgent] 🎯 NAME MATCH: Overriding LLM portrait "${narrativeData.primaryPortrait}" with exact name match "${nameBasedPortrait}" for "${narrativeData.primaryNPC.name}"`);
        narrativeData.primaryPortrait = nameBasedPortrait;
      }
    }

    // PHASE 2 ENFORCEMENT: Override LLM portrait choice during conversation continuation
    // This ensures portrait consistency even if LLM ignores prompt instructions
    // ONLY if primaryNPC exists (if null, NPC has departed and we shouldn't restore portrait)
    if (isContinuation && recentPortrait && narrativeData.primaryNPC) {
      if (narrativeData.primaryPortrait && narrativeData.primaryPortrait !== recentPortrait) {
        console.log(`[NarrativeAgent] ⚠️ PORTRAIT CONSISTENCY ENFORCEMENT: LLM tried to change portrait from ${recentPortrait} to ${narrativeData.primaryPortrait} during conversation continuation. Overriding to maintain consistency.`);
        narrativeData.primaryPortrait = recentPortrait;
      } else if (!narrativeData.primaryPortrait) {
        console.log(`[NarrativeAgent] 🔧 PORTRAIT CONSISTENCY ENFORCEMENT: LLM didn't provide portrait during continuation. Using previous: ${recentPortrait}`);
        narrativeData.primaryPortrait = recentPortrait;
      } else {
        console.log(`[NarrativeAgent] ✓ PORTRAIT CONSISTENCY: LLM correctly maintained portrait: ${recentPortrait}`);
      }
    } else if (isContinuation && !narrativeData.primaryNPC) {
      console.log(`[NarrativeAgent] 👋 NPC DEPARTED: primaryNPC is null, conversation ended, clearing portrait`);
    }

    // PORTRAIT VALIDATION: Check if LLM-selected portrait file actually exists
    // If not, fall back to demographic-based portrait resolution
    // FIX: Validate portrait even without primaryNPC (e.g., during continuations)
    if (narrativeData.primaryPortrait) {
      const llmPortraitExists = portraitExists(narrativeData.primaryPortrait);

      if (!llmPortraitExists) {
        console.log(`[NarrativeAgent] ⚠️ PORTRAIT VALIDATION: LLM selected non-existent portrait "${narrativeData.primaryPortrait}"`);

        // Check if NPC identity is uncertain (unnamed/unknown visitor at door)
        // In these cases, show neutral botica interior instead of guessing a portrait
        const uncertainIdentityKeywords = ['unnamed', 'unknown', 'visitor', 'someone', 'person at', 'knock', 'door'];
        const isUncertainIdentity = narrativeData.primaryNPC &&
          uncertainIdentityKeywords.some(keyword =>
            narrativeData.primaryNPC.name?.toLowerCase().includes(keyword) ||
            narrativeData.primaryNPC.description?.toLowerCase().includes(keyword)
          );

        if (isUncertainIdentity) {
          console.log(`[NarrativeAgent] 🚪 UNCERTAIN IDENTITY: Using neutral botica interior instead of guessing portrait for "${narrativeData.primaryNPC.name}"`);
          narrativeData.primaryPortrait = 'ui/boticaentrance.png';
        }
        // Try demographic-based resolution if we have NPC data and identity is known
        else if (narrativeData.primaryNPC) {
          const validPortraitPath = resolvePortrait(narrativeData.primaryNPC);

          if (validPortraitPath) {
            // Extract filename from path (e.g., "/portraits/foo.jpg" → "foo.jpg")
            const validPortraitFilename = validPortraitPath.replace(/^\/portraits\//, '');
            console.log(`[NarrativeAgent] ✓ PORTRAIT VALIDATION: Using demographic-matched portrait "${validPortraitFilename}" instead`);
            narrativeData.primaryPortrait = validPortraitFilename;
          } else {
            console.log(`[NarrativeAgent] ⚠️ PORTRAIT VALIDATION: No demographic match found, using default`);
            narrativeData.primaryPortrait = 'defaultnpc.jpg';
          }
        } else {
          // During continuations we don't have primaryNPC, so just use default
          console.log(`[NarrativeAgent] ⚠️ PORTRAIT VALIDATION: No NPC data for demographic matching (likely continuation), using default`);
          narrativeData.primaryPortrait = 'defaultnpc.jpg';
        }
      } else {
        console.log(`[NarrativeAgent] ✓ PORTRAIT VALIDATION: LLM portrait exists: ${narrativeData.primaryPortrait}`);
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
      npcDeparted: narrativeData.npcDeparted || false, // NPC has left the scene
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
