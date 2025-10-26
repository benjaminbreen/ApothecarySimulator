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
    "location": "string",
    "time": "H:MM AM/PM",
    "date": "Month DD, YYYY",
    "timeElapsed": "X hours Y minutes",
    "position": ${movementData ? `{"x": ${movementData.newPosition.x}, "y": ${movementData.newPosition.y}}` : 'null'}
  },
  "inventoryChanges": [{"item": "string", "quantity": number, "action": "bought|sold|used|foraged|received|lost", "price": number, "isReadable": "boolean (true if item is a letter/document/codex/manuscript/map/recipe that can be read)", "documentType": "letter|document|codex|note|contract|recipe|map|certificate|null", "metadata": {"author": "string or null", "giver": "string or null", "purpose": "string or null"}}],
  "relationshipChanges": [{"npcName": "Full Name", "delta": -20 to +20, "reason": "brief"}],
  "reputationEvents": [{"faction": "church|elite|common_folk|indigenous|guild|merchants", "delta": number (-50 to +50), "reason": "brief description of what happened"}],
  "contractOffer": {"type": "treatment|null", "offeredBy": "string (person making request)", "offeredByDescription": "string", "patientName": "string (person who is sick - MAY BE DIFFERENT from offeredBy)", "patientDescription": "string", "patientLocation": "string or null", "paymentOffered": number, "ailmentDescription": "string", "isEmissary": "boolean (true if offeredBy !== patientName)"},
  "actionPrompt": {"type": "give|sell|prescribe|null", "recipientName": "Full Name", "npcId": "kebab-case", "npcPortrait": "/portraits/filename.jpg", "context": "brief explanation why prompted", "suggestedItems": ["item1", "item2"], "priceOffered": number, "ailmentDescription": "string or null"},
  "journalEntry": "**Date, Time, Location**: One sentence with **NPC names bolded**",
  "systemAnnouncements": []
}
\`\`\`

**Status words**: tired, exhilarated, frightened, anxious, worried, determined, calm, rested, weary, content, frustrated, angry, curious, hopeful, desperate, relieved, proud, ashamed, uncertain, confident, melancholy, joyful

**Time**: Conversation 0.5-1h, treatment 1-2h, shopping 1-2h, travel 2-3h, sleep 6-8h. Use exact times ("8:35 AM"), increment date past midnight.

**NOTE**: Reputation is calculated from reputationEvents (faction-based system), not returned directly in gameState.

**Readable Documents Detection** (for inventoryChanges):
When an item is added to inventory (action: "received" or "foraged"), detect if it's a readable document:

**Set isReadable: true when item is:**
- **Letters/Correspondence**: "Letter from X", "Carta de X", "missive", "correspondence"
- **Documents**: "Document", "parchment", "scroll", "deed", "certificate", "proclamation"
- **Books/Codices**: "Codex", "manuscript", "tome", "treatise", "grimoire"
- **Notes**: "Note from X", "message", "memorandum"
- **Contracts**: "Contract", "agreement", "accord"
- **Recipes**: "Recipe for X", "formula", "preparation instructions"
- **Maps**: "Map of X", "chart", "plano"

**Set isReadable: false for:**
- Regular items: "Cannabis", "Cinnamon", "Gold Coin"
- Tools: "Mortar and Pestle", "Distillation Flask"
- Medicines: "Tonic", "Poultice", "Salve"

**Document metadata extraction:**
- **author**: Who wrote it (extract from item name or narrative: "Letter from Don Miguel" → "Don Miguel")
- **giver**: Who physically handed it to Maria (extract from narrative: "He gives you a letter" → use NPC name)
- **purpose**: Why it was given (extract from narrative context: "warns you about", "requests help with", etc.)

**Examples:**
- "Letter from the Viceroy" → isReadable: true, documentType: "letter", metadata: {author: "Viceroy", giver: (from narrative), purpose: (from context)}
- "Ancient Codex of Remedies" → isReadable: true, documentType: "codex", metadata: {author: null, giver: (from narrative), purpose: "medical knowledge"}
- "Cinnamon" → isReadable: false, documentType: null, metadata: null
- "Map to the Silver Mines" → isReadable: true, documentType: "map", metadata: {author: null, giver: (from narrative), purpose: "navigation"}

**Relationships**: Most interactions are neutral (delta: 0). Only track meaningful changes. Major positive +10 to +20, moderate +5 to +9, minor +1 to +4, minor negative -1 to -4, moderate -5 to -9, major -10 to -20.

**Contract Detection** (BE CONSERVATIVE):

** Never detect contracts for actions that already happened or are narrated as complete!**

⚠️ **CRITICAL - When NOT to use contractOffer (use actionPrompt instead):**
- NPC wants to BUY/PURCHASE a remedy or item → use actionPrompt type "sell"
- NPC wants a simple remedy for minor ailment WITHOUT examination → use actionPrompt type "prescribe"
- NPC asks for help/charity/item as gift → use actionPrompt type "give"
- **ONLY use contractOffer type "treatment" when NPC explicitly requests EXAMINATION, DIAGNOSIS, or CONSULTATION**

**Treatment contracts take priority.** If a treatment contract is detected, DO NOT also detect an actionPrompt, even if the NPC mentions wanting medicine. One NPC can only have ONE contract or action at a time.

**Type "treatment"** - ONLY when explicit diagnostic language:
- **Detect ONLY when:**
  - "Examine", "diagnose", "look at the patient", "see the patient", "assess", "what's wrong with", "visit and check"
  - Narrative offers to "ask for more details about the wound/condition"

- **DO NOT detect (use actionPrompt instead):**
  - "I need/want/require [item/remedy]" → actionPrompt (sell or prescribe)
  - Vague request without diagnostic words → actionPrompt
  - Initial contact → type: "null"
- **Extract**:
  - offeredBy: Person making request (might be family member, not patient)
  - offeredByDescription: Brief description of requester
  - patientName: Name of sick person. If "I am sick" → use offeredBy name. If "My [relation] is sick" → use "[offeredBy]'s [relation]". If named → use name (e.g., "Lucia")
  - patientDescription: Brief description of patient (age, relation, condition)
  - patientLocation:
    - **null** if patient physically PRESENT at Maria's shop (visible in narrative)
    - **"[location]"** if patient elsewhere (house call needed)
    - **HOUSE CALL INDICATORS**: Patient "at home/in [place]", "confined/bedridden", "cannot travel/too weak", "I traveled from [place]"
    - **MESSENGER PATTERN**: If offeredBy is a servant/maid/messenger and patientName is their master/mistress/employer → ALWAYS set to "[Patient]'s residence" (patient is at home, messenger came to fetch Maria)
    - **Location format**: Use exact address if given ("Calle de Tacuba"), else "[Name]'s residence". Use "pending" only if truly ambiguous.
  - paymentOffered: Amount in reales (number) or 0 if not specified yet
  - ailmentDescription: What symptoms/problem are described (e.g., "fever and chills", "persistent cough")

**Type null** - Default (no contract):
- Normal conversation
- Completed transactions
- Vague mentions of illness without explicit request
- Player explicitly declined the request

**System announcement**: When type is NOT null, add:
- If type is "treatment": "A treatment contract is being discussed (payment: [payment] reales)."
- If payment is 0 or unknown: "A contract is being discussed (payment to be determined)."

**CRITICAL - patientName vs offeredBy**:
When someone requests treatment for a family member or another person:
- **patientName**: The ACTUAL PATIENT who needs treatment (extract from DIALOGUE)
- **offeredBy**: The person making the request (may be different from patient)
- **isEmissary**: true if offeredBy !== patientName (messenger scenario)
- If patient's actual name is mentioned (e.g., "My wife Isabel has fever"), use: patientName: "Isabel", isEmissary: true
- If patient's name is NOT mentioned (e.g., "My wife has fever"), use: patientName: "[offeredBy]'s wife", isEmissary: true
- **NEVER** use the requester's name as patientName unless they are the actual patient!

**CRITICAL EXAMPLES - Patient Name Extraction:**
- Dialogue: "I have a broken arm" → patientName: (same as offeredBy), isEmissary: false (speaker is patient)
- Dialogue: "My wife has fever" → patientName: "[offeredBy]'s wife", isEmissary: true (relationship, no name given)
- Dialogue: "Gaspar's son is ill" → patientName: "Gaspar's son", isEmissary: depends (if Gaspar speaking = false, if someone else = true)
- Dialogue: "The laborers at the site are injured" → patientName: "laborers at [location]", isEmissary: true

**Examples**:
- "Can you examine my daughter? She has fever" → **treatment** (diagnostic language: "examine")
- "Please visit my home and see what's wrong with my clerk" → **treatment** (diagnostic: "see what's wrong")
- "I need a tincture for my clerk who has a chill, I'll pay well" → **actionPrompt sell** (knows what they want, no diagnostic language)
- "My head hurts, do you have something?" → **actionPrompt prescribe** (has ailment, asks recommendation)
- "I require cascarilla powder, 15 reales" → **actionPrompt sell** (knows what to buy)
- "Could you spare some bread?" → **actionPrompt give** (charity, no payment)
- "I heard you sell good medicines" → **null** (too vague)

**Action Prompt** (NPC wants Maria to give/sell/prescribe):
Only detect if NO treatment contract above.

**Type "sell"** - NPC buying FROM Maria:
DETECT: "I need", "I want", "I require", "Can I buy", "I'll take"
SKIP: "I have", "I offer", "I brought", "for sale"

**Type "prescribe"** - NPC asks recommendation:
DETECT: "What helps with", "Do you have something for", "My [body part] hurts"

**Type "give"** - Charity:
DETECT: "Could you spare", "I have no money", "please help"

**Type null** - Default

### Reputation Events:
**Detect when Maria commits actions that should affect faction reputation:**

**Church faction** (-50 to +50):
- Assaulting clergy (-40 to -50): physical violence, public insults
- Witchcraft accusations triggered (-30 to -40): Occult behavior, suspicious rituals
- Sacrilege (-20 to -30): Defiling religious items, mocking sacraments
- Charitable acts (+10 to +20): Donating to church, helping the poor, pious behavior
- Miraculous cures (+20 to +30): Healing important clergy or nobles

**Elite faction** (-50 to +50):
- Public scandal (-30 to -40): causing scenes in public
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
- "You successfully cure the Viceroy's daughter" → [{"faction": "elite", "delta": 25, "reason": "Miraculous cure of noble child"}, {"faction": "church", "delta": 15, "reason": "Divine healing"}]
- "You refuse to treat the beggar child unless paid" → [{"faction": "common_folk", "delta": -25, "reason": "Refused charity to dying child"}]
- Normal interactions, conversation, walking → []

**Rules**:
- Wealth changes match inventory (${currencyName})
- Time moves forward only
- Location: Include building/region/city BUT NEVER include interior room names (shop floor/laboratory/bedroom)
- **Relationship changes should be FREQUENT and GRANULAR**: Detect small shifts (+2 to -2) in many NPC interactions, larger shifts (+5 to +10 or -5 to -10) for meaningful help/harm, extreme shifts (+15 to +40 or -15 to -40) for major events
- **Examples of relationship changes**:
  - Pleasant conversation: +1 to +2
  - Helping with small request: +3 to +5
  - Refusing reasonable request: -2 to -4
  - Successful medical treatment: +5 to +10
  - Failed treatment causing harm: -8 to -15
  - Major betrayal or assault: -15 to -40
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
- Reputation: ${currentGameState.reputationEmoji || '😌'} (${currentGameState.reputation?.overall || 50}/100)
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

**NOTE:** This person is physically present at the scene. They may or may not be the patient - extract patient identity from the narrative DIALOGUE, not from this context.
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

    // CRITICAL FIX: Prevent contracts when narrative ends with BINARY acceptance/refusal questions
    // This enforces turn-gating: contracts should only appear after player agrees to discuss
    // IMPORTANT: Only block if question offers BOTH acceptance AND refusal options (binary choice)
    const narrativeLower = narrative.trim().toLowerCase();

    // Extract the final question (last sentence ending with ?)
    const finalQuestion = narrativeLower.match(/[^.!?]*\?[*\s]*$/)?.[0] || '';

    // Split keywords: acceptance vs refusal
    // Block ONLY if question offers BOTH options (binary choice to help or not)
    const acceptanceKeywords = /\b(accept|agree|help\s+(him|her|them)|see\s+(him|her|them|the\s+patient)|take\s+the\s+case)\b/i;
    const refusalKeywords = /\b(refuse|decline|reject|turn\s+away|dismiss|send\s+away)\b/i;

    // Question must offer BOTH acceptance AND refusal to be blocked
    // This allows negotiation questions like "agree to 10 pesos or ask for more" (no refusal keyword)
    const isAcceptanceQuestion =
      /will you\s+.+\?[*\s]*$/.test(finalQuestion) &&
      acceptanceKeywords.test(finalQuestion) &&
      refusalKeywords.test(finalQuestion);

    if (isAcceptanceQuestion && stateData.contractOffer && stateData.contractOffer.type !== 'null') {
      console.log('[StateAgent] ⚠️ CONTRACT BLOCKED: Narrative ends with acceptance/refusal question, forcing contract to null');
      console.log('[StateAgent] Original contract type:', stateData.contractOffer.type);
      console.log('[StateAgent] Question detected:', finalQuestion.trim());

      // Force contract to null - player hasn't agreed yet
      stateData.contractOffer = {
        type: 'null',
        offeredBy: '',
        offeredByDescription: '',
        patientName: '',
        patientDescription: '',
        patientLocation: null,
        paymentOffered: 0,
        ailmentDescription: ''
      };

      // Remove contract announcement from system messages
      if (stateData.systemAnnouncements) {
        stateData.systemAnnouncements = stateData.systemAnnouncements.filter(
          announcement => !announcement.includes('contract') && !announcement.includes('CONTRACT')
        );
      }
    }

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

  // NOTE: Reputation is now faction-based (handled by reputationEvents), not a simple emoji
  // No validation needed here - reputation is calculated from faction scores in useReputation hook

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
