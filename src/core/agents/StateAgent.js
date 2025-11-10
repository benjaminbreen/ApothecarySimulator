// StateAgent - Specialized agent for game state tracking
// Handles: Wealth, status, reputation, time, location, inventory changes, player movement

import { createChatCompletion } from '../services/llmService';
import { scenarioLoader } from '../services/scenarioLoader';
import { getGridSystem } from '../../features/map/services/gridMovementSystem';
import { isDocumentItem, getDocumentType } from '../../utils/documentDetector';

// PERFORMANCE: Cache state prompt to avoid rebuilding static sections every turn
// Note: Cache is keyed by scenario ID, invalidates only when scenario changes
let cachedStatePromptBase = null;
let cachedScenarioId = null;

// PERFORMANCE: Compile regex patterns at module level (not per-call)
// Movement detection patterns
const LOCATION_CHANGE_PATTERNS = [
  /(?:step|walk|move|head|go)\s+(?:out|outside|into|inside|through)/i,
  /(?:leave|exit|depart)\s+(?:the|your)?\s*(?:shop|building|house|room)/i,
  /(?:enter|arrive\s+at|step\s+into)\s+(?:the|a)\s+(?:street|building|shop|house)/i,
  /(?:secured|lock|close)\s+(?:the)?\s*(?:door|latch)/i,
  /transition|teleport|appear\s+in|find\s+yourself\s+in/i
];

const MOVEMENT_PATTERNS = [
  /(?:walk|move|head|go|travel|run|stride)\s+(?:toward|to|into|across|through)?\s*(north|south|east|west)(?:ward)?\b/i,
  /(?:toward|to|into|across|through)\s+(?:the\s+)?(north|south|east|west)(?:ern)?\b/i,
  /(north|south|east|west)ward\b/i
];

// Contract detection patterns (for binary acceptance question blocking)
const ACCEPTANCE_KEYWORDS = /\b(accept|agree|help\s+(him|her|them)|see\s+(him|her|them|the\s+patient)|take\s+the\s+case)\b/i;
const REFUSAL_KEYWORDS = /\b(refuse|decline|reject|turn\s+away|dismiss|send\s+away)\b/i;

/**
 * Create a null/empty contract offer object
 * Used to clear contracts when they're no longer active
 * @returns {Object} Empty contract offer
 */
function createNullContract() {
  return {
    type: 'null',
    offeredBy: '',
    offeredByDescription: '',
    patientName: '',
    patientDescription: '',
    patientLocation: null,
    paymentOffered: 0,
    ailmentDescription: '',
    isEmissary: false
  };
}

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

  // Check for location changes - if the narrative describes transitioning to a different location/map,
  // skip grid movement validation (Maria is leaving the shop, entering a building, etc.)
  // PERFORMANCE: Use module-level compiled patterns
  const isLocationChange = LOCATION_CHANGE_PATTERNS.some(pattern => pattern.test(combinedText));

  if (isLocationChange) {
    // Location change detected - skip grid movement validation
    // The player is transitioning between maps/locations, not moving on the grid
    console.log('[StateAgent] Location change detected - skipping grid movement validation');
    return null;
  }

  // PERFORMANCE: Use module-level compiled patterns
  let detectedDirection = null;

  for (const pattern of MOVEMENT_PATTERNS) {
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
function buildStatePrompt(scenario, movementData = null, interactionIntent = 'none', crisisState = null) {
  // PERFORMANCE: Cache static prompt sections to avoid rebuilding every turn
  // Only rebuild when scenario changes (extremely rare)
  if (!cachedStatePromptBase || cachedScenarioId !== scenario.id) {
    console.log('[StateAgent] Building and caching static state prompt...');
    const currencyName = scenario.currency || 'coins';

    // Build the static base prompt (everything except dynamic parts)
    cachedStatePromptBase = {
      header: `You are the StateAgent. Read the latest narrative turn and emit JSON only (no markdown). Update values conservatively—prefer carrying forward previous state when information is missing.`,
      currencyName: currencyName,
      staticBody: buildStaticPromptBody(currencyName)
    };
    cachedScenarioId = scenario.id;
  }

  // PERFORMANCE: Assemble final prompt from cached base + dynamic parts
  const positionTemplate = movementData ? `{"x": ${movementData.newPosition.x}, "y": ${movementData.newPosition.y}}` : 'null';
  const interactionLine = `\nCurrent interaction intent: ${interactionIntent}.`;
  const positionLine = `"position": ${positionTemplate},`;

  // Replace placeholders in cached body
  let finalPrompt = cachedStatePromptBase.header + interactionLine + '\n\n' +
    cachedStatePromptBase.staticBody.replace('POSITION_PLACEHOLDER', positionLine);

  // Append crisis section if active (dynamic)
  if (crisisState?.active) {
    finalPrompt += `

### Crisis Resolution Detection
The crisis flag is ACTIVE (${crisisState.reason || 'unresolved confrontation'}).
- status "escaped": Maria evades capture and reaches safety (gameOver false).
- status "surrendered": Maria yields or is peacefully arrested (gameOver true, reason should explain by whom).
- status "captured": Escape attempt fails and she is seized (gameOver true).
- status "bribed": Officials accept a payment and depart (gameOver false).
- status "killed": Narrative confirms Maria's death (gameOver true, include brief reason).
- Use "ongoing" when negotiations or conflict continue without a final outcome this turn.
- Fill wealthChange or reputationDelta only if explicitly resolved in narrative (bribes, public disgrace, etc.).
- Apply monetary consequences directly to gameState.wealth and mirror the change in wealthChange.
`;
  }

  return finalPrompt;
}

/**
 * Build the static portion of the state prompt (cached per scenario)
 * @param {string} currencyName - Currency name from scenario
 * @returns {string} Static prompt body with placeholders
 */
function buildStaticPromptBody(currencyName) {
  return `### Output Shape
{
  "gameState": {
    "wealth": number,
    "wealthChange": number,
    "status": "calm|anxious|frightened|determined|curious|hopeful|relieved|exhausted|tired|confident|worried|angry|content|weary|joyful|melancholy|proud|ashamed|uncertain",
    "location": "string",
    "locationType": "shop|street|market|plaza|cathedral|tavern|home|guild|fountain|outskirts|alley|indoor|outdoor",
    "biome": "city-mexico|city-colonial|city-european|coastal|mountain|desert|ocean|grassland",
    "time": "H:MM AM/PM",
    "date": "Month DD, YYYY",
    "timeElapsed": "X hours Y minutes",
    POSITION_PLACEHOLDER
    "focusedItem": "string|null",
    "energyChange": number,
    "healthChange": number
  },
  "inventoryChanges": [{"item": "string", "quantity": number, "action": "bought|sold|used|foraged|received|lost", "price": number, "isReadable": boolean, "documentType": "letter|document|codex|note|contract|recipe|map|certificate|null", "metadata": {"author": "string|null", "giver": "string|null", "purpose": "string|null"}}],
  "relationshipChanges": [{"npcName": "string", "delta": -20 to 20, "reason": "string"}],
  "reputationEvents": [{"faction": "church|elite|common_folk|indigenous|guild|merchants", "delta": -50 to 50, "reason": "string"}],
  "contractOffer": {"type": "treatment|null", "offeredBy": "string", "offeredByDescription": "string", "patientName": "HUMAN name (NEVER items/furniture like 'Drug Cabinet', 'Shelf', etc.)", "patientDescription": "string", "patientDemographics": {"gender": "male|female|unknown", "age": "child|young|adult|middle-aged|elderly", "casta": "español|peninsular|criollo|mestizo|indio|mulato|negro|unknown", "class": "elite|middling|common|poor|religious|unknown"}, "patientLocation": "string|null", "paymentOffered": number, "ailmentDescription": "string", "isEmissary": boolean},
  "actionPrompt": {"type": "give|sell|prescribe|null", "recipientName": "string", "npcId": "kebab-case", "npcPortrait": "/portraits/filename.jpg|null", "context": "string (10 words max: what NPC needs and why)", "suggestedItems": ["string"], "priceOffered": number, "ailmentDescription": "string|null"},
  "simpleInteraction": {
    "type": "vendor_offer|service_offer|donation_request|competitive_check|information_exchange|social_visit|extortion_demand|gamble_opportunity|investment_offer|null",
    "npcName": "string",
    "npcPortrait": "/portraits/filename.jpg|null",
    "npcRole": "string|null",
    "context": "string",
    "offer": {"item": "string|null", "price": number, "description": "string|null", "quality": "string|null", "quantity": number, "emoji": "emoji"} OR null,
    "request": {"item": "string", "reason": "string", "urgency": "low|medium|high|critical", "reputationImpact": {"donate": number, "refuse": number}} OR null,
    "competitive": {"approach": "friendly|openly_competitive|subtle", "intent": "tour_workshop|ask_about_sources|ask_about_techniques|general_scouting", "question": "specific question asked", "difficulty": "easy|medium|hard"} OR null,
    "information": {"topic": "string", "cost": "string like '2 reales' or '1 bread'", "value": "high|medium|low"} OR null,
    "social": {"purpose": "string", "mood": "friendly|concerned|urgent"} OR null,
    "extortion": {"demandType": "protection|silence|information|access", "amount": number, "threatLevel": "veiled|direct|violent", "threatener": "gang|official|inquisition_proxy|rival", "consequence": "string describing what happens if refused", "difficulty": "easy|medium|hard"} OR null,
    "gamble": {"gameType": "taba|cards|dice|cockfight|wager", "wager": number, "potentialWin": number, "odds": "favorable|even|unfavorable", "description": "string"} OR null,
    "investment": {"investmentType": "church_bond|cacao_plantation|apothecary_syndicate|real_estate|manila_galleon|silver_mining", "amount": number, "expectedReturn": {"min": number, "max": number}, "duration": number, "riskLevel": "low|medium|high", "description": "string", "emoji": "emoji|null"} OR null
  },
  "journalEntry": "string",
  "crisisResolution": {"status": "ongoing|escaped|surrendered|captured|bribed|killed", "gameOver": boolean, "gameOverReason": "string|null", "wealthChange": number, "reputationDelta": number},
  "prescriptionOfferOutcome": {"occurred": boolean, "recipientName": "string", "outcome": "accepted|bargained|declined", "item": "string", "amount": number, "route": "Oral|Inhaled|Topical|Enema", "finalPrice": number, "includeBloodletting": boolean, "bloodAmount": number},
  "systemAnnouncements": ["string"]
}

### Core Principles

**1. Conservative Extraction**: Only change values when narrative explicitly states them. Preserve previous state when ambiguous.

**2. Transactions**:
- Bought (Maria pays): wealthChange negative, inventoryChanges action="bought" (positive quantity)
- Sold (Maria receives): wealthChange positive, inventoryChanges action="sold" (negative quantity)
- Set wealthChange to 0 unless payment explicitly mentioned

**3. Time & Location**:
- Time advances ~10 minutes for conversations, use map timing for movement
- Only change location when narrative explicitly describes transition
- locationType examples: "Botica" → "shop", "Plaza Mayor" → "plaza", "street" → "street"
- biome examples: "Mexico City" → "city-mexico", "Veracruz" → "coastal"

**4. Physical Effects** (energyChange/healthChange):
- Only extract when narrative explicitly describes physical changes
- Sleep/rest/eating → positive energy, exertion → negative
- Set to 0 if no physical effects mentioned

**5. Documents**: Mark isReadable=true for letters, contracts, maps, certificates, warrants

### Intent-Based Object Creation
Trust the interactionIntent from NarrativeAgent. Create matching objects:

| Intent | Create | Set to Null |
|--------|--------|-------------|
| house_call | contractOffer (type: "treatment", isEmissary: true, patientLocation required) | actionPrompt |
| medical_purchase | actionPrompt (type: "prescribe" or "sell") | contractOffer |
| medical_followup | - | contractOffer, actionPrompt |
| vendor_offer | simpleInteraction (type: "vendor_offer") | contractOffer, actionPrompt |
| none | - | All transaction fields |

**Clear simpleInteraction** (set type: "null") when:
- Transaction completes (wealthChange + inventoryChanges present)
- NPC departs after business (npcDeparted: true + interactionIntent: "none")
- Player refuses offer

**House Calls** (isEmissary: true):
- offeredBy = messenger present (nun, servant)
- patientName = sick person discussed (NOT messenger)
- patientLocation = where patient is

### Key Examples

**Example 1: Medical Purchase Request**
Narrative: "Woman says 'My daughter has fever. I need medicine quickly.'"
Intent: medical_purchase
→ actionPrompt: {type: "prescribe", recipientName: "woman", context: "fever medicine for daughter"}
→ contractOffer: {type: "null"}

**Example 2: Vendor Offer**
Narrative: "Fish seller says 'Fresh tilapia, 2 reales!'"
Intent: vendor_offer
→ simpleInteraction: {type: "vendor_offer", offer: {item: "tilapia", price: 2, quantity: 1}}
→ contractOffer: {type: "null"}, actionPrompt: {type: "null"}

**Example 3: Sale Transaction Complete**
Narrative: "You hand over 80 reales. Diego gives you spices and departs."
→ wealthChange: -80
→ inventoryChanges: [{action: "bought", item: "spices", quantity: 1, price: 80}]
→ simpleInteraction: {type: "null"}

**Example 4: House Call Request**
Narrative: "Servant says 'Father Anselmo is gravely ill at the monastery.'"
Intent: house_call
→ contractOffer: {type: "treatment", isEmissary: true, offeredBy: "servant", patientName: "Father Anselmo", patientLocation: "monastery"}
→ actionPrompt: {type: "null"}

**Example 5: Medical Diagnosis (In-Shop)**
Narrative: "Elderly man enters, coughing. 'Doña Maria, can you examine me?'"
Intent: medical_diagnosis
→ contractOffer: {type: "treatment", isEmissary: false, patientName: "elderly man", ailmentDescription: "cough"}
→ actionPrompt: {type: "null"}

**Example 6: Investment Offer**
Narrative: "Merchant says 'Silver mine needs 100 reales capital. Returns 120-200 reales in a year.'"
Intent: vendor_offer
→ simpleInteraction: {type: "investment_offer", investment: {investmentType: "silver_mining", amount: 100, expectedReturn: {min: 120, max: 200}, duration: 365, riskLevel: "high", emoji: "⛏️"}}
→ contractOffer: {type: "null"}, actionPrompt: {type: "null"}

### Additional Notes
- **Relationships**: Track meaningful emotional beats (+/-1 to 20)
- **Documents**: Mark isReadable=true for letters/contracts, use specific names ("Inquisition warrant" not "document")
- **ActionPrompt context**: 10 words max, factual only ("fever remedy for daughter" not "you must decide")
- **Bargaining**: When NPC negotiates, set actionPrompt.type = "null" (captured in narrative)
- **Prescription outcomes**: Only populate when NPC decides to accept/decline Maria's offer
- **System announcements**: Highlight actionable beats, don't restate narrative
- **Journal**: One sentence summary with date/time/location

When data is unclear, preserve previous state rather than guessing.`;
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
 * @param {Object|null} params.primaryNPC - Primary NPC present in scene
 * @param {Object|null} params.activePatient - Patient currently under treatment
 * @param {Array} params.narrativeEntities - Entities from NarrativeAgent for accurate patient identification
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
  primaryNPC = null, // NEW: Primary NPC for contract name resolution
  activePatient = null, // NEW: Active patient for treatment context
  interactionIntent = 'none',
  narrativeEntities = [] // NEW: Entities from NarrativeAgent for accurate patient identification
}) {
  try {
    // Load scenario
    const scenario = scenarioLoader.loadScenario(scenarioId);
    const currencyName = scenario.currency || 'coins';

    // Extract movement (if applicable)
    let movementData = null;
    if (mapData && currentGameState.position && interactionIntent !== 'house_call') {
      movementData = extractMovement(
        narrative,
        playerAction,
        currentGameState.position,
        currentGameState.currentMap || currentGameState.location,
        mapData
      );
    }

    // Build state prompt with movement context
    const statePrompt = buildStatePrompt(scenario, movementData, interactionIntent, currentGameState.crisis || null);

const userPrompt = `Current Game State:
- Wealth: ${currentGameState.wealth} ${currencyName}
- Status: ${currentGameState.status}
- Reputation: ${currentGameState.reputationEmoji || '😌'} (${currentGameState.reputation?.overall || 50}/100)
- Location: ${currentGameState.location}
- Time: ${currentGameState.time}
- Date: ${currentGameState.date}
${currentGameState.position ? `- Position: Grid (${Math.floor(currentGameState.position.x / 20)}, ${Math.floor(currentGameState.position.y / 20)})` : ''}

Interaction Intent (from NarrativeAgent): ${interactionIntent}

${activePatient ? `
### Active Patient Under Treatment:
Name: ${activePatient.name}
Status: Currently being treated by Maria
${activePatient.lastPrescription ? `Last Prescription: ${activePatient.lastPrescription.remedy} (${activePatient.lastPrescription.route}) - ${activePatient.lastPrescription.drachms} drachms for ${activePatient.lastPrescription.payment} reales` : ''}
${activePatient.treatmentResult ? `Treatment Result: ${activePatient.treatmentResult.score}/10 - ${activePatient.treatmentResult.description}` : ''}
${activePatient.diagnosis ? `Diagnosis: ${activePatient.diagnosis}` : ''}
${activePatient.symptoms && activePatient.symptoms.length > 0 ? `Symptoms: ${activePatient.symptoms.map(s => s.name).join(', ')}` : ''}

**IMPORTANT**: This patient is ALREADY under treatment. If narrative mentions treatment failure, follow-up visit, or complaint about treatment, do NOT generate a new contractOffer. This is a continuation of existing treatment, not a new request.
` : ''}

${availableLocations.length > 0 ? `Available Locations (reachable from here):
${availableLocations.map(loc => `- ${loc.fullName}`).join('\n')}
` : ''}

Player Action: ${playerAction}

${primaryNPC ? `
### Primary NPC (Person Physically Present):
Name: ${primaryNPC.name}
Demographics: ${primaryNPC.age || 'unknown'} ${primaryNPC.gender || 'unknown'} ${primaryNPC.casta || 'unknown'}
Occupation: ${primaryNPC.occupation || 'unknown'}

**NOTE:** This person is physically present at the scene. They may or may not be the patient - extract patient identity from the narrative DIALOGUE, not from this context.
` : ''}

${currentGameState.crisis?.active ? `
### Crisis Status:
Reason: ${currentGameState.crisis.reason || 'Unspecified conflict'}
Context: ${currentGameState.crisis.context || 'No additional context provided.'}
` : ''}

${movementData ? `\n### Movement Analysis:
Direction: ${movementData.direction}
Status: ${movementData.valid ? '✓ VALID - Path is clear' : '✗ BLOCKED - ' + movementData.reason}
${movementData.valid ? `
Location Change:
- From: "${movementData.currentLocationName || 'Unknown'}"
- To: "${movementData.suggestedLocationName || 'Unknown'}"
- Nearby Landmarks: ${movementData.nearbyLandmarks?.join(', ') || 'None'}
- District Context: ${movementData.districtContext || 'Central Mexico City'}
- New Position: (${movementData.newPosition.x}, ${movementData.newPosition.y})

**IMPORTANT: Use "${movementData.suggestedLocationName}" as the new location unless the narrative explicitly describes a different location (like entering a building).**
` : `Movement Blocked:
- Stayed at: (${movementData.oldPosition.x}, ${movementData.oldPosition.y})
- Reason: ${movementData.reason}
`}
${movementData.nearbyLocations?.length > 0 ? `Other Nearby: ${movementData.nearbyLocations.map(l => l.name).join(', ')}` : ''}
` : ''}

Narrative That Just Occurred:
${narrative}

Analyze this narrative and extract game state changes. Return JSON with the specified format.${movementData && !movementData.valid ? '\n\nIMPORTANT: Movement was BLOCKED. Position should NOT change.' : ''}

LOCATION TRACKING:
${movementData && movementData.valid ? `
**Movement Detected - Use the Suggested Location:**
The reverse geocoder has determined the player is now at: "${movementData.suggestedLocationName}"

- Set location to: "${movementData.suggestedLocationName}"
- ONLY override this if the narrative explicitly describes entering a building or different location
- Examples where you SHOULD override:
  * Narrative: "You step through the cathedral doors" → location = "Catedral Metropolitana"
  * Narrative: "You enter the noble's estate" → location from Available Locations
  * Narrative: "You walk into your bedroom" → location = "Bedroom, Botica de la Amargura"
- Examples where you should USE the suggested location:
  * Narrative: "You walk west along the street" → location = "${movementData.suggestedLocationName}"
  * Narrative: "You continue down the narrow lane" → location = "${movementData.suggestedLocationName}"
  * Narrative: "You pass by vendors and shopkeepers" → location = "${movementData.suggestedLocationName}"
` : `
**No Movement Detected:**
- Preserve current location: "${currentGameState.location}"
- Only change if narrative explicitly describes going to a different place
- Use exact names from "Available Locations" list for building interiors
- For city streets, be specific (e.g., "Calle de San Francisco" not "streets")
`}

**General Rules:**
- Be specific and granular - streets, plazas, buildings all have distinct names
- Use hierarchical names for interiors: "Bedroom, Botica de la Amargura"
- NEVER use vague phrases like "Unknown" or "likely near..." - commit to a specific name
- Check "Available Locations" list first for exact matches`;

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
    const originalContractOffer = stateData.contractOffer && stateData.contractOffer.type && stateData.contractOffer.type !== 'null'
      ? { ...stateData.contractOffer }
      : null;

    if (!stateData.crisisResolution) {
      stateData.crisisResolution = {
        status: 'ongoing',
        gameOver: false,
        gameOverReason: null,
        wealthChange: 0,
        reputationDelta: 0
      };
    }

    // CRITICAL FIX: Prevent contracts when narrative ends with BINARY acceptance/refusal questions
    // This enforces turn-gating: contracts should only appear after player agrees to discuss
    // IMPORTANT: Only block if question offers BOTH acceptance AND refusal options (binary choice)
    const narrativeLower = narrative.trim().toLowerCase();

    // Extract the final question (last sentence ending with ?)
    const finalQuestion = narrativeLower.match(/[^.!?]*\?[*\s]*$/)?.[0] || '';

    // Split keywords: acceptance vs refusal
    // Block ONLY if question offers BOTH options (binary choice to help or not)
    // PERFORMANCE: Use module-level compiled patterns

    // Question must offer BOTH acceptance AND refusal to be blocked
    // This allows negotiation questions like "agree to 10 pesos or ask for more" (no refusal keyword)
    const isAcceptanceQuestion =
      /will you\s+.+\?[*\s]*$/.test(finalQuestion) &&
      ACCEPTANCE_KEYWORDS.test(finalQuestion) &&
      REFUSAL_KEYWORDS.test(finalQuestion);

    // PHASE 1 SIMPLIFICATION: Trust NarrativeAgent's intent classification completely
    // No reclassification logic - NarrativeAgent is the single source of truth
    let normalizedIntent = (interactionIntent || 'none').toLowerCase();

    const announcements = stateData.systemAnnouncements || [];
    const contractNotice = announcements.some(msg => {
      const lower = msg.toLowerCase();
      return lower.includes('contract') || lower.includes('house call');
    });

    if (isAcceptanceQuestion && stateData.contractOffer && stateData.contractOffer.type !== 'null') {
      if (!contractNotice) {
        console.log('[StateAgent] ⚠️ CONTRACT BLOCKED: Narrative ends with acceptance/refusal question, forcing contract to null');
        console.log('[StateAgent] Original contract type:', stateData.contractOffer.type);
        console.log('[StateAgent] Question detected:', finalQuestion.trim());

        stateData.contractOffer = createNullContract();

        stateData.systemAnnouncements = announcements.filter(
          announcement => !announcement.toLowerCase().includes('contract')
        );
      } else {
        console.log('[StateAgent] ✅ Contract acknowledged in announcements; suppressing duplicate offer.');

        if (normalizedIntent === 'house_call') {
          stateData.houseCallTravel = {
            emissaryName: stateData.contractOffer.offeredBy || null,
            emissaryDescription: stateData.contractOffer.offeredByDescription || null,
            patientName: stateData.contractOffer.patientName || null,
            patientDescription: stateData.contractOffer.patientDescription || null,
            patientLocation: stateData.contractOffer.patientLocation || null,
            paymentOffered: stateData.contractOffer.paymentOffered || 0,
            ailmentDescription: stateData.contractOffer.ailmentDescription || null
          };
        }

        stateData.contractOffer = createNullContract();
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


    const hasContract = stateData.contractOffer && stateData.contractOffer.type && stateData.contractOffer.type !== 'null';
    const hasActionPrompt = stateData.actionPrompt && stateData.actionPrompt.type && stateData.actionPrompt.type !== 'null';
    const medicalIntents = new Set(['medical_diagnosis', 'medical_purchase', 'medical_followup']);
    if (medicalIntents.has(normalizedIntent) && !hasContract && !hasActionPrompt) {
      const fallbackRecipient = primaryNPC?.name || selectedEntity?.name || originalContractOffer?.offeredBy || 'patient';
      const fallbackPatient = originalContractOffer?.patientDescription || originalContractOffer?.patientName || 'the patient';
      const fallbackAilment = originalContractOffer?.ailmentDescription || stateData.actionPrompt?.ailmentDescription || null;
      const npcId = fallbackRecipient
        ? fallbackRecipient.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : 'medical-request';

      const contextParts = [];
      contextParts.push(`${fallbackRecipient} needs your medical help for ${fallbackPatient}`);
      if (fallbackAilment) {
        contextParts.push(`(${fallbackAilment})`);
      }

      const fallbackActionPrompt = {
        type: 'prescribe',
        recipientName: fallbackRecipient,
        npcId,
        npcPortrait: null,
        context: contextParts.join(' '),
        suggestedItems: [],
        priceOffered: originalContractOffer?.paymentOffered || 0,
        ailmentDescription: fallbackAilment || null,
        metadata: {
          source: 'state-medical-fallback',
          intent: normalizedIntent
        }
      };

      console.warn('[StateAgent] ⚕️ Medical intent detected without surfaced card; creating fallback action prompt.', {
        intent: normalizedIntent,
        recipient: fallbackRecipient,
        patient: fallbackPatient
      });

      stateData.actionPrompt = fallbackActionPrompt;
    }

    // Vendor offers now use simpleInteraction system only (no purchaseOffer conversion)

    // CRITICAL: Enforce interaction intent rules

    // Rule 1: medical_purchase should have actionPrompt, NOT contractOffer
    if (normalizedIntent === 'medical_purchase' &&
        stateData.actionPrompt?.type &&
        stateData.actionPrompt.type !== 'null' &&
        stateData.contractOffer?.type &&
        stateData.contractOffer.type !== 'null') {
      console.warn('[StateAgent] 🩺 OVERRIDE: medical_purchase with actionPrompt detected. Clearing contractOffer to prevent duplicate cards.');
      console.warn('[StateAgent] Patient is NOT present - this is a medicine purchase, not a treatment contract.');
      stateData.contractOffer = { type: 'null' };
    }

    // Rule 2: medical_diagnosis should have contractOffer, NOT actionPrompt
    if (normalizedIntent === 'medical_diagnosis' &&
        stateData.contractOffer?.type &&
        stateData.contractOffer.type !== 'null' &&
        stateData.actionPrompt?.type &&
        stateData.actionPrompt.type !== 'null') {
      console.warn('[StateAgent] 🩺 OVERRIDE: medical_diagnosis with contractOffer detected. Clearing actionPrompt to prevent duplicate cards.');
      console.warn('[StateAgent] Patient IS present - this is a treatment contract, not a quick purchase.');
      stateData.actionPrompt = { type: 'null' };
    }

    // Debug logging for house call detection
    if (stateData.contractOffer && stateData.contractOffer.type === 'treatment') {
      console.log('[StateAgent] 📋 Treatment Contract Extracted:', {
        isEmissary: stateData.contractOffer.isEmissary,
        isHouseCall: stateData.contractOffer.isEmissary === true,
        offeredBy: stateData.contractOffer.offeredBy,
        patientName: stateData.contractOffer.patientName,
        patientLocation: stateData.contractOffer.patientLocation,
        paymentOffered: stateData.contractOffer.paymentOffered,
        interactionIntent: interactionIntent
      });

      if (stateData.contractOffer.isEmissary && !stateData.contractOffer.patientLocation) {
        console.warn('[StateAgent] ⚠️ House call detected but patientLocation is missing!');
      }
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
