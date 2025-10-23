// StateAgent - Specialized agent for game state tracking
// Handles: Wealth, status, reputation, time, location, inventory changes, player movement

import { createChatCompletion } from '../services/llmService';
import { scenarioLoader } from '../services/scenarioLoader';
import { getGridSystem } from '../../features/map/services/gridMovementSystem';

/**
 * Extract movement intent from narrative
 * @param {string} narrative - Narrative text to analyze
 * @param {string} playerAction - What the player typed
 * @param {Position} currentPosition - Current player position
 * @param {string} currentMapId - Current map identifier
 * @param {Object} mapData - Current map data
 * @returns {Object|null} Movement data or null if no movement detected
 */
function extractMovement(narrative, playerAction, currentPosition, currentMapId, mapData) {
  if (!mapData || !currentPosition) {
    return null; // No movement tracking for this map
  }

  // Check narrative and player action for movement keywords
  const combinedText = `${playerAction} ${narrative}`.toLowerCase();

  // Movement patterns to detect
  const movementPatterns = [
    /(?:walk|move|head|go|travel|run|stride)\s+(?:to\s+the\s+)?(north|south|east|west)/i,
    /(?:go|head|walk|move)\s+(north|south|east|west)/i,
    /\b(north|south|east|west)(?:ward)?(?:\s+direction)?\b/i
  ];

  let detectedDirection = null;

  for (const pattern of movementPatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      detectedDirection = match[1].toLowerCase();
      break;
    }
  }

  if (!detectedDirection) {
    return null; // No movement detected
  }

  // Validate with grid system
  const gridSystem = getGridSystem(currentMapId, mapData);
  const validation = gridSystem.validateMove(currentPosition, detectedDirection);

  // Get nearby locations for context
  const nearby = gridSystem.getNearbyLocations(
    validation.valid ? validation.newPosition : currentPosition
  );

  return {
    direction: detectedDirection,
    valid: validation.valid,
    reason: validation.reason,
    oldPosition: currentPosition,
    newPosition: validation.newPosition || currentPosition,
    nearbyLocations: nearby.slice(0, 3) // Top 3 nearest
  };
}

/**
 * Build state agent system prompt from scenario-specific configuration
 * @param {Object} scenario - Scenario configuration
 * @param {Object} [movementData] - Movement validation data
 * @returns {string} Complete state agent system prompt
 */
function buildStatePrompt(scenario, movementData = null) {
  const currencyName = scenario.currency || 'coins';

  return `Extract game state changes from narrative text. Return JSON only.

\`\`\`json
{
  "gameState": {
    "wealth": number,
    "wealthChange": number,
    "status": "one word",
    "reputation": "emoji",
    "location": "string",
    "time": "H:MM AM/PM",
    "date": "Month DD, YYYY",
    "timeElapsed": "X hours Y minutes",
    "position": ${movementData ? `{"x": ${movementData.newPosition.x}, "y": ${movementData.newPosition.y}}` : 'null'}
  },
  "inventoryChanges": [{"item": "string", "quantity": number, "action": "bought|sold|used|foraged|received|lost", "price": number}],
  "relationshipChanges": [{"npcId": "kebab-case", "npcName": "Full Name", "delta": -20 to +20, "reason": "brief"}],
  "reputationEvents": [{"faction": "church|elite|common_folk|indigenous|guild|merchants", "delta": number (-50 to +50), "reason": "brief description of what happened"}],
  "contractOffer": {"type": "treatment|sale_inquiry|null", "offeredBy": "string", "offeredByDescription": "string", "patientName": "string", "patientDescription": "string", "patientLocation": "string or null", "paymentOffered": number, "ailmentDescription": "string"},
  "tradeOpportunity": {"npcId": "kebab-case", "npcName": "Full Name", "npcPortrait": "/portraits/filename.jpg", "type": "buy|sell|null", "interest": {"items": ["item1", "item2"], "reason": "brief explanation", "urgency": "low|moderate|high", "priceMultiplier": 1.0}, "offering": {"items": [{"name": "item", "quantity": 1, "price": 10}]}, "context": "brief context"},
  "journalEntry": "**Date, Time, Location**: One sentence with **NPC names bolded**",
  "systemAnnouncements": []
}
\`\`\`

**Status words**: tired, exhilarated, frightened, anxious, worried, determined, calm, rested, weary, content, frustrated, angry, curious, hopeful, desperate, relieved, proud, ashamed, uncertain, confident, melancholy, joyful

**Reputation**: 😡 (1), 😠 (2), 😐 (3), 😶 (4), 🙂 (5), 😌 (6), 😏 (7), 😃 (8), 😇 (9), 👑 (10)

**Time**: Conversation 0.5-1h, treatment 1-2h, shopping 1-2h, travel 2-3h, sleep 6-8h. Use exact times ("8:35 AM"), increment date past midnight.

**Relationships**: Most interactions are neutral (delta: 0). Only track meaningful changes. Major positive +10 to +20, moderate +5 to +9, minor +1 to +4, minor negative -1 to -4, moderate -5 to -9, major -10 to -20.

**Contract Detection** (BE CONSERVATIVE):

**CRITICAL: Never detect contracts for actions that already happened or are narrated as complete!**

**⚠️ PRIORITY RULE: Treatment contracts take absolute priority. If a treatment contract is detected, DO NOT also detect a sale_inquiry contract, even if the NPC mentions wanting medicine. One NPC can only have ONE contract type at a time.**

**Treatment vs Sale**: treatment = "I'm sick, help me" (needs exam), sale_inquiry = "I need headache medicine" (knows remedy)

**Type "treatment"** - Patient examination/treatment request:
- **Detect when**:
  - NPC makes a CLEAR REQUEST for Maria to EXAMINE, DIAGNOSE, or SEE a patient
  - Language implies consultation: "can you help", "look at", "examine", "what's wrong with me"
  - Patient is PRESENT at shop OR house call to patient's location
  - Patient has symptoms needing professional medical assessment
  - **Payment amount is explicitly mentioned** (e.g., "I can pay 5 reales", "offers 20 reales")
  - Player has NOT yet examined the patient (examination happens in Patient View)
- **DO NOT detect**:
  - NPC just wants to BUY a specific remedy without examination (use "sale_inquiry")
  - Vague mentions of illness without an explicit request ("my son has been sick lately")
  - Treatment already completed in narrative
  - Player explicitly declined the request already
  - **SCHOLARLY/PROFESSIONAL requests**: translation, preservation, copying, teaching, research about texts/codices/manuscripts
  - **NON-MEDICAL help**: NPC wants intellectual/professional assistance (translation, literacy, teaching), not medical treatment
- **Extract**:
  - offeredBy: Person making request (might be family member, not patient)
  - offeredByDescription: Brief description of requester
  - patientName: EXACT NAME of the person who is actually sick
    * If Primary NPC (from context) is the patient themselves → use their exact name
    * If Primary NPC is a messenger/intermediary → extract actual patient name from narrative
    * Use specific names like "Tomas", "the laborers at Alameda construction site"
    * **If only relationship given** ("my son", "a colleague", "the servant") → format as "[NPC name]'s [relationship]" (e.g., "Fernando de Toledo's colleague")
    * **If completely vague** ("a friend", "someone") → use "unknown patient (details pending)"
  - patientDescription: Brief description of patient (age, relation, condition)
  - patientLocation:
    - **null** if patient physically PRESENT at Maria's shop (visible in narrative)
    - **"[location]"** if patient elsewhere (house call needed)
    - **HOUSE CALL INDICATORS**: Patient "at home/in [place]", "confined/bedridden", "cannot travel/too weak", "I traveled from [place]"
    - **MESSENGER PATTERN**: If offeredBy is a servant/maid/messenger and patientName is their master/mistress/employer → ALWAYS set to "[Patient]'s residence" (patient is at home, messenger came to fetch Maria)
    - **Location format**: Use exact address if given ("Calle de Tacuba"), else "[Name]'s residence". Use "pending" only if truly ambiguous.
  - paymentOffered: Amount in reales (number) or 0 if not specified yet
  - ailmentDescription: What symptoms/problem are described (e.g., "fever and chills", "persistent cough")

**Type "sale_inquiry"** - Request for remedy to purchase:
- **⚠️ REMEMBER: If a treatment contract was already detected above, DO NOT detect sale_inquiry. Only ONE contract type per NPC.**
- **Detect when**:
  - NPC makes a CLEAR REQUEST for a specific remedy/medicine for a symptom or condition
  - Transactional language: "Do you have", "Can you make", "I need [remedy for X]", "I'll pay"
  - NO examination or diagnosis requested (just wants medicine)
  - Focus is on OBTAINING a remedy, not being examined
  - Remedy needs to be crafted/prepared (implied by request)
- **DO NOT detect**:
  - Patient requests examination ("can you look at", "examine me", "what's wrong with me")
  - Patient wants diagnosis or consultation (use "treatment" instead)
  - Transaction already completed in narrative
  - Just browsing/asking vague questions ("Do you sell remedies?")
  - Player explicitly declined the request already
  - **SCHOLARLY/PROFESSIONAL requests**: translation, preservation, copying, teaching, research, knowledge exchange about texts/codices/manuscripts
  - **NON-MEDICAL services**: NPC wants Maria's skills for translation, writing, reading, teaching, or other intellectual work (NOT medicine)
- **Extract**:
  - offeredBy: Buyer's name (use Primary NPC name if they are the buyer)
  - offeredByDescription: Brief description
  - patientName: Person remedy is for
    * If Primary NPC is buying for themselves → use their exact name
    * If buying for someone else → use specific name or relation from narrative
  - patientDescription: Brief description if given
  - patientLocation: null (sale inquiries don't involve house calls)
  - paymentOffered: Amount offered or 0 if not specified
  - ailmentDescription: What the remedy is for (e.g., "headache", "digestive troubles", "skin rash")

**Type null** - Default (no contract):
- Normal conversation
- Completed transactions
- Vague mentions of illness without explicit request
- Player explicitly declined the request

**System announcement**: When type is NOT null, add ONE of these announcements:
- If type is "treatment": "A treatment contract is being discussed (payment: [payment] reales)."
- If type is "sale_inquiry": "A sales contract is being discussed (payment: [payment] reales)."
- If payment is 0 or unknown: "A contract is being discussed (payment to be determined)."

**Examples**:
- "My daughter has a terrible fever, can you examine her? I can pay 5 reales" → **treatment** (requests examination), patientLocation: null (daughter will come to shop), patientName: "[requester's name]'s daughter", ailmentDescription: "fever"
- **"I am the maid to Doña Elvira. She suffers from terrible cough and cannot leave her bed"** → **treatment** (MESSENGER PATTERN - maid at shop, mistress at home), offeredBy: "Isabel Ramírez", patientName: "Doña Elvira", patientLocation: "Doña Elvira's residence", ailmentDescription: "cough, bedridden"
- "Please come to my home on Calle de Tacuba, my husband cannot walk" → **treatment** (house call), patientLocation: "Calle de Tacuba", patientName: (husband's name if given), ailmentDescription: based on context
- "I traveled from Xochimilco, my grandson Tomas suffers a terrible flux" → **treatment** (HOUSE CALL - grandmother is representative, patient is in Xochimilco), patientLocation: "Xochimilco", patientName: "Tomas", offeredBy: (grandmother's name), ailmentDescription: "flux"
- **"My husband has been confined to his chambers for three weeks with melancholy"** → **treatment** (HOUSE CALL - "confined to chambers" = at home), patientLocation: "[Husband's name]'s residence" OR "[Family name] household", patientName: (husband's name), ailmentDescription: "melancholy"
- "I have a broken arm, can you help?" → **treatment** (patient present at shop, needs examination), patientLocation: null
- "Do you have something for headaches? I'll pay 2 reales" → **sale_inquiry** (wants medicine, not examination), ailmentDescription: "headaches"
- "Can you make me a tonic for sleeplessness?" → **sale_inquiry** (wants product made), ailmentDescription: "sleeplessness"
- "My mother needs a poultice for burns, I'll pay 3 reales" → **sale_inquiry** (purchasing for someone), ailmentDescription: "burns", patientName: "mother"
- "Do you sell remedies for stomach troubles?" → **sale_inquiry** (transactional request), ailmentDescription: "stomach troubles"
- "I heard you sell good medicines" → **null** (too vague, no specific request)
- **"I carry a codex regarding ancient pharmacopeia. I need your skill with letters and herbs to translate and protect it"** → **null** (scholarly/professional request for translation, NOT medical treatment or remedy purchase)
- "Can you teach me to read Latin medical texts?" → **null** (educational request, not medical)
- "I need help preserving an ancient manuscript" → **null** (scholarly preservation, not medical)

**Trade Opportunity Detection** (NEW):
- **Detect when**: NPC explicitly expresses interest in buying/selling items (e.g., "I need chocolate", "Do you have cinnamon to sell?", "I'm selling silk")
- **DO NOT detect**: Generic conversation, already at market, completed transactions
- **Type "buy"**: NPC wants to purchase items from Maria. Extract: items they want, reason, urgency (low/moderate/high), priceMultiplier (1.0-1.5 if willing to pay premium)
- **Type "sell"**: NPC offers items for sale. Extract: offering items with names, quantities, and prices
- **Type null**: Default (no trade opportunity)
- **Portrait**: Use NPC portrait path if available from narrative context
- **Context**: Brief 1-sentence context about the trade (e.g., "Needs chocolate for daughter's wedding")

Examples:
- NPC says "I desperately need chocolate for my daughter's wedding" → type: "buy", items: ["chocolate"], urgency: "high", reason: "Wedding gift", priceMultiplier: 1.2
- NPC says "I'm selling fine silk from China, 10 reales" → type: "sell", offering: [{"name": "Chinese Silk", "quantity": 1, "price": 10}]
- Normal conversation → type: null

### Reputation Events (CRITICAL - Detect Extreme Actions):
**Detect when Maria commits EXTREME actions that should affect faction reputation:**

**Church faction** (-50 to +50):
- Assaulting clergy (-40 to -50): Throwing objects at priests, physical violence, public insults
- Witchcraft accusations triggered (-30 to -40): Occult behavior, consorting with "devils", suspicious rituals
- Sacrilege (-20 to -30): Defiling religious items, mocking sacraments
- Charitable acts (+10 to +20): Donating to church, helping the poor, pious behavior
- Miraculous cures (+20 to +30): Healing important clergy or nobles

**Elite faction** (-50 to +50):
- Public scandal (-30 to -40): Embarrassing nobles, causing scenes in public
- Treating nobles poorly (-10 to -20): Refusing service, insulting, poor treatment outcomes
- Treating nobles well (+10 to +20): Successful cures, respectful service
- Gaining noble patronage (+20 to +30): Multiple successful treatments, becoming favored physician

**Common_folk faction** (-50 to +50):
- Exploiting the poor (-20 to -30): Charging excessive prices, refusing charity
- Helping the poor (+10 to +20): Free treatments, fair prices, generosity
- Publicly standing up for common people (+20 to +30): Defending them from authorities

**Indigenous faction** (-50 to +50):
- Disrespecting indigenous practices (-20 to -30): Mocking traditions, rejecting indigenous medicine
- Embracing indigenous knowledge (+10 to +20): Using native remedies, respecting traditions
- Becoming bridge between cultures (+20 to +30): Integrating indigenous and European medicine

**Guild faction** (-50 to +50):
- Competing unfairly (-20 to -30): Undercutting prices drastically, stealing clients
- Professional excellence (+10 to +20): Demonstrating superior skill, ethical practice

**Merchants faction** (-50 to +50):
- Breaking business deals (-20 to -30): Defaulting on debts, cheating in trades
- Building business relationships (+10 to +20): Paying debts, fair trading
- Becoming major customer (+20 to +30): Large purchases, repeat business

**EXAMPLES:**
- "You throw the vial of dead frog at Padre Alonso" → [{"faction": "church", "delta": -45, "reason": "Assaulted priest with occult substance"}]
- "You successfully cure the Viceroy's daughter" → [{"faction": "elite", "delta": 25, "reason": "Miraculous cure of noble child"}, {"faction": "church", "delta": 15, "reason": "Divine healing"}]
- "You refuse to treat the beggar child unless paid" → [{"faction": "common_folk", "delta": -25, "reason": "Refused charity to dying child"}]
- Normal interactions, conversation, walking → []

**Rules**:
- Wealth changes match inventory (${currencyName})
- Time moves forward only
- Location: Include building/region/city BUT NEVER include interior room names (shop floor/laboratory/bedroom)
- **Relationship changes should be FREQUENT and GRANULAR**: Detect small shifts (+2 to -2) in most NPC interactions, larger shifts (+5 to +10 or -5 to -10) for meaningful help/harm, extreme shifts (+15 to +20 or -15 to -20) only for major events
- **Examples of relationship changes**:
  - Pleasant conversation: +1 to +2
  - Helping with small request: +3 to +5
  - Refusing reasonable request: -2 to -4
  - Successful medical treatment: +5 to +10
  - Failed treatment causing harm: -8 to -15
  - Major betrayal or assault: -15 to -20
- Extreme actions trigger BOTH relationshipChanges AND reputationEvents (faction-wide impact)
- Contracts: Only when actively negotiating, never on first mention
- Trade opportunities: Only when NPC explicitly mentions buying/selling, not at markets`;
}

/**
 * Extract game state from narrative
 * @param {Object} params - Parameters
 * @param {string} params.scenarioId - Current scenario identifier
 * @param {string} params.narrative - Narrative text to analyze
 * @param {Object} params.currentGameState - Current game state
 * @param {string} params.playerAction - What player did
 * @param {Object|null} params.selectedEntity - NPC if present
 * @param {Object|null} params.mapData - Current map data for movement tracking
 * @param {Array} params.availableLocations - Locations reachable from current position
 * @returns {Promise<Object>} Extracted state
 */
export async function extractGameState({
  scenarioId = '1680-mexico-city', // Default for backward compatibility
  narrative,
  currentGameState,
  playerAction,
  selectedEntity = null,
  mapData = null,
  turnNumber = 0,
  availableLocations = [], // NEW: Location registry for granular location tracking
  primaryNPC = null // NEW: Primary NPC for contract name resolution
}) {
  try {
    // Load scenario
    const scenario = scenarioLoader.loadScenario(scenarioId);
    const currencyName = scenario.currency || 'coins';

    // Extract movement (if applicable)
    let movementData = null;
    if (mapData && currentGameState.position) {
      movementData = extractMovement(
        narrative,
        playerAction,
        currentGameState.position,
        currentGameState.currentMap || currentGameState.location,
        mapData
      );
    }

    // Build state prompt with movement context
    const statePrompt = buildStatePrompt(scenario, movementData);

    const userPrompt = `Current Game State:
- Wealth: ${currentGameState.wealth} ${currencyName}
- Status: ${currentGameState.status}
- Reputation: ${currentGameState.reputation}
- Location: ${currentGameState.location}
- Time: ${currentGameState.time}
- Date: ${currentGameState.date}
${currentGameState.position ? `- Position: Grid (${Math.floor(currentGameState.position.x / 20)}, ${Math.floor(currentGameState.position.y / 20)})` : ''}

${availableLocations.length > 0 ? `Available Locations (reachable from here):
${availableLocations.map(loc => `- ${loc.fullName}`).join('\n')}
` : ''}

Player Action: ${playerAction}

${selectedEntity ? `NPC Involved: ${selectedEntity.name}` : ''}

${primaryNPC ? `
### Primary NPC (Person Physically Present):
Name: ${primaryNPC.name}
Demographics: ${primaryNPC.age || 'unknown'} ${primaryNPC.gender || 'unknown'} ${primaryNPC.casta || 'unknown'}
Occupation: ${primaryNPC.occupation || 'unknown'}

**Contract Name Guidance:**
- If ${primaryNPC.name} is seeking treatment FOR THEMSELVES → use "${primaryNPC.name}" as patientName
- If ${primaryNPC.name} is a MESSENGER (sent by, on behalf of, asking for others) → extract actual patient name from narrative
- Use specific names, not generic descriptions like "young man" or "messenger"
- If multiple patients mentioned, extract specific names or "laborers at [location]" format
` : ''}

${movementData ? `\n### Movement Analysis:
Direction: ${movementData.direction}
Status: ${movementData.valid ? '✓ VALID - Path is clear' : '✗ BLOCKED - ' + movementData.reason}
${movementData.valid ? `New Position: (${movementData.newPosition.x}, ${movementData.newPosition.y})` : `Stayed at: (${movementData.oldPosition.x}, ${movementData.oldPosition.y})`}
${movementData.nearbyLocations.length > 0 ? `Nearby: ${movementData.nearbyLocations.map(l => l.name).join(', ')}` : ''}
` : ''}

Narrative That Just Occurred:
${narrative}

Analyze this narrative and extract game state changes. Return JSON with the specified format.${movementData && !movementData.valid ? '\n\nIMPORTANT: Movement was BLOCKED. Position should NOT change.' : ''}

LOCATION TRACKING:
- If player moved to a different location, return the SPECIFIC location name
- Use exact names from "Available Locations" list when player goes to those places
- For example: "Bedroom, Botica de la Amargura" instead of just "Mexico City"
- If location didn't change, return current location exactly as is
- Be specific and granular - rooms, buildings, streets have meaning`;

    const messages = [
      { role: 'system', content: statePrompt },
      { role: 'user', content: userPrompt }
    ];

    // Log prompt token estimates (rough estimate: 1 token ≈ 4 chars)
    const systemTokens = Math.ceil(statePrompt.length / 4);
    const userTokens = Math.ceil(userPrompt.length / 4);
    const totalPromptTokens = systemTokens + userTokens;
    console.log('[StateAgent] Prompt tokens (est):', {
      system: systemTokens,
      user: userTokens,
      total: totalPromptTokens
    });

    const response = await createChatCompletion(
      messages,
      0.3, // Lower temperature for consistent state tracking
      1000,
      { type: 'json_object' },
      { agent: 'StateAgent', turnNumber } // Metadata for LLM transparency view
    );

    const rawResponse = response.choices[0].message.content;

    // Clean markdown-wrapped JSON (LLM sometimes returns ```json ... ```)
    const cleanedResponse = rawResponse
      .replace(/^```json\s*\n?/i, '') // Remove opening ```json
      .replace(/\n?```\s*$/i, '')      // Remove closing ```
      .trim();

    const stateData = JSON.parse(cleanedResponse);

    // Ensure position is updated correctly if movement occurred
    if (movementData && movementData.valid) {
      if (!stateData.gameState.position) {
        stateData.gameState.position = movementData.newPosition;
      }
    } else if (movementData && !movementData.valid) {
      // Movement blocked - keep old position
      stateData.gameState.position = movementData.oldPosition;
    }

    return {
      success: true,
      ...stateData,
      movement: movementData // Include movement data for debugging/logging
    };

  } catch (error) {
    console.error('StateAgent error:', error);
    return {
      success: false,
      gameState: currentGameState,
      inventoryChanges: [],
      relationshipChanges: [],
      journalEntry: '',
      systemAnnouncements: [],
      error: error.message
    };
  }
}

/**
 * Validate game state for consistency
 * @param {Object} newState - New game state to validate
 * @param {Object} oldState - Previous game state
 * @returns {Object} Validated state with corrections
 */
export function validateGameState(newState, oldState) {
  const validated = { ...newState };

  // Ensure wealth doesn't go negative
  if (validated.wealth < 0) {
    console.warn('Wealth went negative, clamping to 0');
    validated.wealth = 0;
  }

  // Ensure time only moves forward
  const oldTime = new Date(`${oldState.date} ${oldState.time}`);
  const newTime = new Date(`${validated.date} ${validated.time}`);

  if (newTime < oldTime) {
    console.warn('Time moved backward, keeping old time');
    validated.time = oldState.time;
    validated.date = oldState.date;
  }

  // Ensure reputation is valid emoji
  const validEmojis = ['😡', '😠', '😐', '😶', '🙂', '😌', '😏', '😃', '😇', '👑'];
  if (!validEmojis.includes(validated.reputation)) {
    console.warn(`Invalid reputation emoji: ${validated.reputation}, keeping old`);
    validated.reputation = oldState.reputation;
  }

  // Ensure location isn't empty
  if (!validated.location || validated.location.trim() === '') {
    console.warn('Empty location, keeping old');
    validated.location = oldState.location;
  }

  return validated;
}

export default {
  extractGameState,
  validateGameState
};
