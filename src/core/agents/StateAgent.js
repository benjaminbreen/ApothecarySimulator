// StateAgent - Specialized agent for game state tracking
// Handles: Wealth, status, reputation, time, location, inventory changes, player movement

import { createChatCompletion } from '../services/llmService';
import { scenarioLoader } from '../services/scenarioLoader';
import { getGridSystem } from '../../features/map/services/gridMovementSystem';
import { isFeatureEnabled } from '../config/featureFlags';
import { isDocumentItem, getDocumentType } from '../../utils/documentDetector';

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
  const locationChangePatterns = [
    /(?:step|walk|move|head|go)\s+(?:out|outside|into|inside|through)/i,
    /(?:leave|exit|depart)\s+(?:the|your)?\s*(?:shop|building|house|room)/i,
    /(?:enter|arrive\s+at|step\s+into)\s+(?:the|a)\s+(?:street|building|shop|house)/i,
    /(?:secured|lock|close)\s+(?:the)?\s*(?:door|latch)/i,
    /transition|teleport|appear\s+in|find\s+yourself\s+in/i
  ];

  const isLocationChange = locationChangePatterns.some(pattern => pattern.test(combinedText));

  if (isLocationChange) {
    // Location change detected - skip grid movement validation
    // The player is transitioning between maps/locations, not moving on the grid
    console.log('[StateAgent] Location change detected - skipping grid movement validation');
    return null;
  }

  // Movement patterns to detect
  const movementPatterns = [
    /(?:walk|move|head|go|travel|run|stride)\s+(?:toward|to|into|across|through)?\s*(north|south|east|west)(?:ward)?\b/i,
    /(?:toward|to|into|across|through)\s+(?:the\s+)?(north|south|east|west)(?:ern)?\b/i,
    /(north|south|east|west)ward\b/i
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
function buildStatePrompt(scenario, movementData = null, interactionIntent = 'none', crisisState = null) {
  const currencyName = scenario.currency || 'coins';
  const positionTemplate = movementData ? `{"x": ${movementData.newPosition.x}, "y": ${movementData.newPosition.y}}` : 'null';

  return `You are the StateAgent. Read the latest narrative turn and emit JSON only (no markdown). Update values conservatively—prefer carrying forward previous state when information is missing.
Current interaction intent: ${interactionIntent}.

### Output Shape
{
  "gameState": {
    "wealth": number,
    "wealthChange": number,
    "status": "calm|anxious|frightened|determined|curious|hopeful|relieved|exhausted|tired|confident|worried|angry|content|weary|joyful|melancholy|proud|ashamed|uncertain",
    "location": "string",
    "time": "H:MM AM/PM",
    "date": "Month DD, YYYY",
    "timeElapsed": "X hours Y minutes",
    "position": ${positionTemplate},
    "focusedItem": "string|null",
    "energyChange": number,
    "healthChange": number
  },
  "inventoryChanges": [{"item": "string", "quantity": number, "action": "bought|sold|used|foraged|received|lost", "price": number, "isReadable": boolean, "documentType": "letter|document|codex|note|contract|recipe|map|certificate|null", "metadata": {"author": "string|null", "giver": "string|null", "purpose": "string|null"}}],
  "relationshipChanges": [{"npcName": "string", "delta": -20 to 20, "reason": "string"}],
  "reputationEvents": [{"faction": "church|elite|common_folk|indigenous|guild|merchants", "delta": -50 to 50, "reason": "string"}],
  "contractOffer": {"type": "treatment|null", "offeredBy": "string", "offeredByDescription": "string", "patientName": "string", "patientDescription": "string", "patientLocation": "string|null", "paymentOffered": number, "ailmentDescription": "string", "isEmissary": boolean},
  "actionPrompt": {"type": "give|sell|prescribe|null", "recipientName": "string", "npcId": "kebab-case", "npcPortrait": "/portraits/filename.jpg|null", "context": "string", "suggestedItems": ["string"], "priceOffered": number, "ailmentDescription": "string|null"},
  "simpleInteraction": {
    "type": "vendor_offer|service_offer|donation_request|competitive_check|information_exchange|social_visit|extortion_demand|gamble_opportunity|null",
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
    "gamble": {"gameType": "cards|dice|cockfight|wager", "wager": number, "potentialWin": number, "odds": "favorable|even|unfavorable", "description": "string"} OR null
  },
  "journalEntry": "string",
  "crisisResolution": {"status": "ongoing|escaped|surrendered|captured|bribed|killed", "gameOver": boolean, "gameOverReason": "string|null", "wealthChange": number, "reputationDelta": number},
  "prescriptionOfferOutcome": {"occurred": boolean, "recipientName": "string", "outcome": "accepted|bargained|declined", "item": "string", "amount": number, "route": "Oral|Inhaled|Topical|Enema", "finalPrice": number, "includeBloodletting": boolean, "bloodAmount": number},
  "systemAnnouncements": ["string"]
}

### Core Rules
- Wealth (${currencyName}) never drifts: set wealthChange to 0 unless payment/exchange is explicit.
- Time/date only move forward. Conversations usually advance ~10 minutes; movement uses map timing when provided.
- Keep status to one of the allowed adjectives; change only when the narrative clearly signals an emotional shift.
- Location should use known names (shop rooms, city districts); if unsure, reuse previous location.
- Use movement validation: if the grid step is invalid, keep old position; otherwise use provided new coordinates.
- **Energy and Health Changes**: Extract these ONLY when the narrative explicitly describes changes to Maria's physical condition:
  * energyChange: -100 to +100 (consumption, rest, exertion, sleep, eating)
  * healthChange: -100 to +100 (injury, healing, illness, medicine, poison)
  * Set to 0 when no physical effects occur
  * For consumption: extract the exact values mentioned in the narrative
  * For death/lethal effects: healthChange should be -100
  * For severe poisoning/injury: healthChange -20 to -50
  * For nourishment/healing: healthChange/energyChange +5 to +25
- focusedItem: Set this to the item name if the player is ACTIVELY examining, using, mixing, or focusing on a specific item. Examples: "examine aloe" → "aloe", "mix mercury" → "mercury", "I forage for herbs" → "herbs". Set to null if no item focus.

### Interaction Mapping
Use the provided Interaction Intent when classifying requests.
- medical_diagnosis -> Patient is PHYSICALLY PRESENT at shop. Create treatment contract (isEmissary false). Set actionPrompt.type = "null".
- house_call -> Messenger insists Maria travel to treat/examine the patient. contractOffer.type = "treatment", isEmissary true, patientLocation filled. DO NOT create actionPrompt during negotiation.
- medical_followup -> Ongoing care. Do not create new contracts; update relationship/reputation only.
- medical_purchase -> **CRITICAL:** Patient is NOT present. NPC wants medicine to take away. Use actionPrompt ONLY (type "sell" if item specified, "prescribe" if Maria must choose). Set contractOffer.type = "null". DO NOT create treatment contract.
- nonmedical_request -> Leave contractOffer and actionPrompt null. Capture request in journal/systemAnnouncements only.
- vendor_offer -> **CRITICAL:** Populate simpleInteraction ONLY (type 'vendor_offer'). Set actionPrompt.type = "null" and contractOffer.type = "null". DO NOT populate purchaseOffer (deprecated field). See examples below.
- social or none -> All transactional fields null unless narrative contradicts the intent.

### House Call Detection (CRITICAL)
When Interaction Intent is "house_call" OR when you detect house call patterns, set contractOffer with isEmissary: true.

**STRICTLY MEDICAL REQUESTS ONLY - House calls are for treating SICK or INJURED patients. NOT for errands, harvesting, deliveries, social visits, or non-medical favors.**

**Narrative Patterns That Indicate House Call (ALL must be present):**
1. Messenger/intermediary arrives (nun, servant, family member, neighbor) requesting Maria come to patient
2. Patient is SICK, INJURED, or SUFFERING from a medical condition (explicit mention required)
3. Messenger asks Maria to EXAMINE/TREAT/SEE the patient (medical language required)
4. Phrases: "taken ill", "fallen sick", "bedridden", "needs a physician", "fever", "injury", "cannot rise", "breathing poorly"
5. Patient is NOT physically present in the scene - only the messenger/intermediary is shown
6. Location mentioned or implied: "at the monastery", "in his chambers", "at her estate"

**NOT a house call if:**
- Request is for harvesting herbs, gathering ingredients, or agricultural help
- Request is for delivery of items or running errands
- Request is for social visits, business discussions, or non-medical matters
- No mention of illness, injury, or medical need

**Required Fields for House Call Contract:**
- type: "treatment"
- isEmissary: true (THE CRITICAL FLAG - this triggers house call flow)
- offeredBy: Name of the messenger/intermediary (e.g., "Sister Ines", "servant boy", "Don Luis's wife")
- offeredByDescription: Brief description of messenger (e.g., "nun from convent", "household servant")
- patientName: Name of the actual patient (NOT the messenger) - extract from dialogue
- patientDescription: Patient's title/role (e.g., "elderly priest", "nobleman", "child")
- patientLocation: Where patient is located - extract from narrative OR infer from patient's role
  * If mentioned: use exact phrase (e.g., "Church of San Francisco", "Don Luis's estate")
  * If not mentioned but inferable: use patient's likely location (priest -> church, nobleman -> estate, etc.)
  * Format: Specific building/place name if possible
- paymentOffered: Amount if mentioned, 0 if charity/urgent care
- ailmentDescription: What messenger says is wrong (e.g., "sudden fever", "terrible turn", "breathing difficulty")

**Example 1 - Nun Requesting Help for Priest:**
Narrative: "A nun arrives, clutching her rosary. 'Father Anselmo has taken a sudden turn. Please, come quickly!'"
Contract: {type: "treatment", isEmissary: true, offeredBy: "Sister Ines", offeredByDescription: "nun from convent", patientName: "Father Anselmo", patientDescription: "priest", patientLocation: "Church of San Francisco", paymentOffered: 0, ailmentDescription: "sudden turn/illness"}

**Example 2 - Servant Summoning for Noble:**
Narrative: "A servant boy appears at your door. 'Don Esteban requests your presence at his estate. He cannot rise from bed.'"
Contract: {type: "treatment", isEmissary: true, offeredBy: "servant boy", offeredByDescription: "household servant", patientName: "Don Esteban", patientDescription: "nobleman", patientLocation: "Don Esteban's estate", paymentOffered: 0, ailmentDescription: "bedridden"}

**Example 3 - Direct Patient Arrival (NOT a house call):**
Narrative: "An elderly woman enters your shop, coughing heavily. 'Can you help me, señora?'"
Contract: {type: "treatment", isEmissary: false, offeredBy: "elderly woman", patientName: "elderly woman", patientLocation: null, ...}

**DO NOT** set isEmissary true when:
- Patient is physically present at Maria's shop
- Patient speaks directly to Maria
- No messenger/intermediary involved
- narrative says "enters", "arrives at the shop", "sits down in your botica"

### Vendor Offers (SimpleInteraction)
When interaction intent is "vendor_offer", use simpleInteraction ONLY. Do NOT populate actionPrompt or purchaseOffer.

**Example 1 - Weaver Selling Tapestry:**
Narrative: "Citlali, a weaver, stands at your door clutching a rolled bundle. 'Doña Maria, I have fine work from Texcoco. This tapestry, woven with indigo and cochineal, twelve reales.'"
SimpleInteraction: {type: "vendor_offer", npcName: "Citlali", npcPortrait: null, npcRole: "weaver from Texcoco", context: "offers a tapestry woven with indigo and cochineal", offer: {item: "tapestry", price: 12, description: "woven with indigo and cochineal from Texcoco", quality: "fine", quantity: 1}}
ActionPrompt: {type: "null", ...}
ContractOffer: {type: "null"}

**Example 2 - NOT a vendor (patient seeking help):**
Narrative: "A woman enters, coughing. 'Please, I need medicine for my fever.'"
SimpleInteraction: {type: "null"}
ActionPrompt: {type: "prescribe", recipientName: "woman", context: "asks for fever medicine", ...}
ContractOffer: {type: "treatment", isEmissary: false, ...}

### Medical Diagnosis vs Medical Purchase (CRITICAL DISTINCTION)

**medical_diagnosis** = Patient is physically present, wants to be treated/examined by Maria
→ Create contractOffer (treatment contract)
→ Set actionPrompt.type = "null"

**medical_purchase** = Someone wants medicine to take away (patient is elsewhere)
→ Create actionPrompt (sell/prescribe)
→ Set contractOffer.type = "null"

**Example 1 - medical_diagnosis (Patient Present):**
Narrative: "An elderly man enters your shop, coughing heavily. He sits down on the bench. 'Doña Maria, can you examine me? This cough won't stop.'"
Intent: medical_diagnosis
ContractOffer: {type: "treatment", isEmissary: false, offeredBy: "elderly man", patientName: "elderly man", patientLocation: null, ailmentDescription: "persistent cough", ...}
ActionPrompt: {type: "null"}
SimpleInteraction: {type: "null"}

**Example 2 - medical_purchase (Mother Buying for Sick Child):**
Narrative: "A worried woman arrives at your door. 'My daughter has terrible fever and vomiting. I need medicine quickly before it worsens.'"
Intent: medical_purchase
ContractOffer: {type: "null"}
ActionPrompt: {type: "prescribe", recipientName: "worried woman", context: "needs fever/vomiting remedy for daughter", suggestedItems: ["Willow Bark", "Ginger"], ...}
SimpleInteraction: {type: "null"}

**Example 3 - medical_purchase (Husband Buying for Wife):**
Narrative: "A man approaches, holding out coins. 'My wife has headaches. Do you have willow bark?'"
Intent: medical_purchase
ContractOffer: {type: "null"}
ActionPrompt: {type: "sell", recipientName: "man", context: "wants willow bark for wife's headaches", suggestedItems: ["Willow Bark"], ...}
SimpleInteraction: {type: "null"}

**Key Differences:**
- Diagnosis: Patient sits down, asks to be examined, shows symptoms TO Maria → contractOffer
- Purchase: Family member/messenger describes patient elsewhere, asks for medicine → actionPrompt

### ActionPrompt Usage
Use actionPrompt ONLY for immediate, clear requests to transfer items:
- type "give": NPC explicitly asks Maria to donate/gift an item for free (charity, helping poor). NEVER use during house call negotiations.
- type "sell": NPC wants to buy a specific item from Maria's inventory.
- type "prescribe": NPC asks for medicine but doesn't specify which one (Maria must choose).
- type "null": Default. Use when no immediate item transfer is being requested.

**CRITICAL - Bargaining Behavior:**
- When NPC haggles/negotiates/counters price on an existing offer, set actionPrompt.type = "null"
- The bargaining is captured in narrative and relationshipChanges, not via actionPrompt
- DO NOT create new actionPrompt with type "bargain" - this is not a valid type
- Example: Maria offers medicine for 9 reales, NPC says "Can you do 7?" → actionPrompt.type = "null", describe haggling in narrative only

### Inventory & Documents
- Record only concrete item exchanges. If Maria merely inspects an item, leave inventoryChanges empty.
- Mark isReadable true for obvious letters, codices, maps, recipes, contracts, summons, warrants, complaints, or any other readable documents mentioned in the narrative. Leave metadata fields null when details are unavailable; downstream code enriches them.
- When an NPC hands/presents/gives/extends a document to Maria (letter, summons, warrant, etc.), create an inventoryChange with action "received" and isReadable true. Example: Lawyer presents summons → {"item": "Guild summons", "quantity": 1, "action": "received", "isReadable": true, "documentType": "document", "metadata": {"giver": "Licenciado Ramírez"}}.

### Wealth Changes (CRITICAL - Common Error)
**When Maria SELLS an item to an NPC:**
- inventoryChanges: action = "sold", quantity is NEGATIVE (item leaves inventory)
- gameState.wealthChange: POSITIVE number (Maria GAINS money)
- Example: Maria sells sugar for 5 reales → wealthChange = +5, wealth increases by 5

**When Maria BUYS an item from an NPC:**
- inventoryChanges: action = "bought", quantity is POSITIVE (item enters inventory)
- gameState.wealthChange: NEGATIVE number (Maria LOSES money)
- Example: Maria buys herbs for 3 reales → wealthChange = -3, wealth decreases by 3

**REMEMBER: SOLD = Maria gains money (+), BOUGHT = Maria loses money (-)**

### Relationships & Reputation
- Add relationshipChanges for notable emotional beats (+/-1 to 10). Extreme events (betrayal, rescue) may reach +/-20.
- Convert faction-level consequences into reputationEvents with concise reasons. Leave empty when there is no meaningful shift.

### System Messaging
- systemAnnouncements highlight actionable beats (e.g., "A treatment contract is being discussed (payment: X reales)."), never restate the entire narrative.
- journalEntry should summarize the turn in a single sentence: "**Date, Time, Location**: summary..."

### Prescription Offer Outcomes
- Populate prescriptionOfferOutcome when narrative describes Maria offering a prescription to an NPC (via action prompt, NOT patient tab treatment) and shows the NPC's decision.
- Set occurred = true only if the narrative clearly shows the NPC's response to Maria's specific offer (medicine, route, price).
- outcome = "accepted": NPC pays and takes medicine. Keywords: pays/accepts/buys/hands over reales
- outcome = "declined": NPC refuses. Keywords: refuses/declines/too expensive/cannot afford/storms off
- outcome = "bargained": NPC negotiates price. Keywords: counter-offer/haggles/offers less/argues about price
- Extract finalPrice from narrative (use original price if accepted immediately, lower price if bargained and accepted, 0 if declined)
- Set includeBloodletting = true only if narrative mentions phlebotomy/bloodletting was part of the offer
- Do NOT populate this field for regular patient tab prescriptions administered via PrescribePanel - only for action prompt prescription offers where NPC must decide whether to buy
- If outcome is unclear or NPC's decision is deferred ("I'll think about it"), set occurred = false

If data is missing or ambiguous, preserve the previous state rather than guessing.` + (crisisState?.active ? `

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
` : '');
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

${selectedEntity ? `NPC Involved: ${selectedEntity.name}` : ''}

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
    const acceptanceKeywords = /\b(accept|agree|help\s+(him|her|them)|see\s+(him|her|them|the\s+patient)|take\s+the\s+case)\b/i;
    const refusalKeywords = /\b(refuse|decline|reject|turn\s+away|dismiss|send\s+away)\b/i;

    // Question must offer BOTH acceptance AND refusal to be blocked
    // This allows negotiation questions like "agree to 10 pesos or ask for more" (no refusal keyword)
    const isAcceptanceQuestion =
      /will you\s+.+\?[*\s]*$/.test(finalQuestion) &&
      acceptanceKeywords.test(finalQuestion) &&
      refusalKeywords.test(finalQuestion);

    let normalizedIntent = (interactionIntent || 'none').toLowerCase();

    if (normalizedIntent === 'house_call') {
      const mentionsPayment = /\b(pay|pays|coin|coins|reales|price|offer|payment|fee|compensation)\b/i.test(narrativeLower);
      const mentionsRemedy = /\b(remedy|medicine|medicinal|potion|draught|tincture|salve|unguent|ointment|powder|lozenge|herb|remedio)\b/i.test(narrativeLower);
      const invitesTravel = /\b(house\s+call|come\s+with\s+me|bring\s+you|travel|journey|accompany|walk\s+with\s+me|go\s+to\s+(his|her|their)\s+(home|house|bedside)|visit\s+(him|her|them)|follow\s+me|come\s+to\s+(the|my|his|her|their)|at\s+(a|the|my|his|her)\s+(rented\s+)?(house|home|residence|estate|chambers)|near\s+the|she\s+is\s+at|he\s+is\s+at)\b/i.test(narrativeLower);

      if (mentionsPayment && mentionsRemedy && !invitesTravel) {
        console.log('[StateAgent] 🔁 Reclassifying house_call → medical_purchase (purchase language detected)');
        normalizedIntent = 'medical_purchase';
        stateData.interactionIntent = 'medical_purchase';

        // Drop house-call specific data
        if (stateData.houseCallTravel) {
          delete stateData.houseCallTravel;
        }

        if (stateData.systemAnnouncements) {
          stateData.systemAnnouncements = stateData.systemAnnouncements.filter(announcement => {
            const lower = announcement.toLowerCase();
            return !lower.includes('contract') && !lower.includes('house call');
          });
        }

        // Preserve original contract details for action prompt before clearing
        const contractPatient = originalContractOffer?.patientDescription || originalContractOffer?.patientName || 'a patient';
        const ailment = originalContractOffer?.ailmentDescription || null;
        const paymentOffered = originalContractOffer?.paymentOffered || 0;

        if (stateData.contractOffer && stateData.contractOffer.type && stateData.contractOffer.type !== 'null') {
          stateData.contractOffer = createNullContract();
        }

        if (!stateData.actionPrompt || stateData.actionPrompt.type === 'null') {
          const npcName = primaryNPC?.name || selectedEntity?.name || originalContractOffer?.offeredBy || '';
          const npcId = npcName ? npcName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
          const contextParts = [`${npcName || 'The visitor'} wants to buy a prepared remedy for ${contractPatient}`];
          if (ailment) {
            contextParts.push(`(${ailment})`);
          }

          stateData.actionPrompt = {
            type: 'sell',
            recipientName: npcName,
            npcId,
            npcPortrait: null,
            context: contextParts.join(' '),
            suggestedItems: [],
            priceOffered: paymentOffered,
            ailmentDescription: ailment
          };
        }
      }
    }

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

    const usingRevisedPipeline = isFeatureEnabled('revisedInteractionPipeline');
    if (usingRevisedPipeline && stateData.contractOffer && stateData.contractOffer.type && stateData.contractOffer.type !== 'null') {
      const contractIntentWhitelist = new Set(['medical_diagnosis', 'house_call']);
      const shouldKeepContract = contractIntentWhitelist.has(normalizedIntent);

      if (!shouldKeepContract) {
        console.log('[StateAgent] 🛑 Contract removed by revised pipeline', {
          intent: normalizedIntent,
          offeredBy: stateData.contractOffer.offeredBy,
          ailment: stateData.contractOffer.ailmentDescription
        });

        stateData.contractOffer = createNullContract();

        if (stateData.systemAnnouncements) {
          stateData.systemAnnouncements = stateData.systemAnnouncements.filter(
            announcement => !announcement.toLowerCase().includes('contract')
          );
        }
      } else if (normalizedIntent === 'house_call') {
        stateData.contractOffer.isEmissary = true;
        if (!stateData.contractOffer.patientLocation || stateData.contractOffer.patientLocation.trim() === '') {
          stateData.contractOffer.patientLocation = stateData.contractOffer.patientLocation || null;
        }

        // FIX: Use narrativeEntities to extract correct patient name
        // Sometimes LLM uses primaryNPC.name (the messenger) instead of the actual patient
        if (narrativeEntities && narrativeEntities.length > 0) {
          const patientEntity = narrativeEntities.find(e => e.entityType === 'patient');
          if (patientEntity && patientEntity.text) {
            // Only override if the current patientName looks like it might be the messenger
            // Detect relationship descriptions vs proper names with titles
            const currentName = stateData.contractOffer.patientName || '';

            // Relationship words (mother, servant, etc.) - but NOT when used as titles (Father Antonio)
            const relationshipPattern = /^(the\s+)?(mother|servant|maid|messenger|wife|husband|daughter|son|nurse|boy|girl|child|woman|man)$/i;
            const possessivePattern = /'s\s+(mother|father|servant|maid|wife|husband|daughter|son|brother|sister|nurse|boy|girl|child)/i;

            const isRelationshipDescription = relationshipPattern.test(currentName.trim()) ||
                                             possessivePattern.test(currentName);
            const matchesPrimaryNPC = primaryNPC && currentName === primaryNPC.name;
            const isProbablyMessenger = isRelationshipDescription || matchesPrimaryNPC;

            if (isProbablyMessenger) {
              console.log(`[StateAgent] ✅ Correcting patient name from "${currentName}" to "${patientEntity.text}" using narrativeEntities`);
              stateData.contractOffer.patientName = patientEntity.text;

              // Also update patient description if available
              if (patientEntity.description) {
                stateData.contractOffer.patientDescription = patientEntity.description;
              }
            }
          }
        }

        // NEGOTIATION GATING: House calls need location OR payment details before showing contract
        // This prevents contracts from appearing on first mention of illness
        const hasLocation = stateData.contractOffer.patientLocation &&
                          stateData.contractOffer.patientLocation !== 'null' &&
                          stateData.contractOffer.patientLocation.trim().length > 0;
        const hasPayment = stateData.contractOffer.paymentOffered &&
                         stateData.contractOffer.paymentOffered > 0;
        const hasPatientName = stateData.contractOffer.patientName &&
                             stateData.contractOffer.patientName.trim().length > 0 &&
                             !stateData.contractOffer.patientName.toLowerCase().includes('unknown') &&
                             !stateData.contractOffer.patientName.toLowerCase().includes('unidentified');

        // Require at least 2 of 3 details (location, payment, or named patient) for house call contract
        const detailCount = (hasLocation ? 1 : 0) + (hasPayment ? 1 : 0) + (hasPatientName ? 1 : 0);

        if (detailCount < 2) {
          console.log('[StateAgent] 🛑 House call contract blocked: insufficient negotiation details', {
            hasLocation,
            hasPayment,
            hasPatientName,
            detailCount,
            location: stateData.contractOffer.patientLocation,
            payment: stateData.contractOffer.paymentOffered,
            patient: stateData.contractOffer.patientName
          });

          stateData.contractOffer = createNullContract();

          if (stateData.systemAnnouncements) {
            stateData.systemAnnouncements = stateData.systemAnnouncements.filter(
              announcement => !announcement.toLowerCase().includes('contract')
            );
          }
        }
      } else if (normalizedIntent === 'medical_diagnosis') {
        stateData.contractOffer.isEmissary = false;
        stateData.contractOffer.patientLocation = null;
      }
    }

    if (usingRevisedPipeline &&
        normalizedIntent === 'house_call' &&
        contractNotice &&
        stateData.contractOffer &&
        stateData.contractOffer.type &&
        stateData.contractOffer.type !== 'null' &&
        !stateData.houseCallTravel) {
      // Use stateData.contractOffer (corrected) instead of originalContractOffer (uncorrected)
      stateData.houseCallTravel = {
        emissaryName: stateData.contractOffer.offeredBy || null,
        emissaryDescription: stateData.contractOffer.offeredByDescription || null,
        patientName: stateData.contractOffer.patientName || null,
        patientDescription: stateData.contractOffer.patientDescription || null,
        patientLocation: stateData.contractOffer.patientLocation || null,
        paymentOffered: stateData.contractOffer.paymentOffered || 0,
        ailmentDescription: stateData.contractOffer.ailmentDescription || null
      };

      stateData.contractOffer = createNullContract();
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

    if (usingRevisedPipeline && Array.isArray(stateData.inventoryChanges)) {
      stateData.inventoryChanges = stateData.inventoryChanges.map(change => {
        if (!change || !change.item) {
          return change;
        }

        const action = (change.action || '').toLowerCase();
        const docCandidate = isDocumentItem(change.item);

        if (docCandidate && (action === 'received' || action === 'foraged' || action === 'bought')) {
          change.isReadable = true;
          change.documentType = change.documentType && change.documentType !== 'null'
            ? change.documentType
            : getDocumentType(change.item);
          change.metadata = change.metadata || { author: null, giver: null, purpose: null };
        } else if (change.isReadable === undefined) {
          change.isReadable = false;
          change.documentType = change.documentType && change.documentType !== 'null'
            ? change.documentType
            : null;
        }

        return change;
      });
    }

    // FILTER ERRONEOUS ACTION PROMPTS: During house call negotiations, prevent "give" type
    // actionPrompts from appearing when we're still negotiating (no contract created)
    if (usingRevisedPipeline && normalizedIntent === 'house_call') {
      const hasActiveContract = stateData.contractOffer &&
                               stateData.contractOffer.type &&
                               stateData.contractOffer.type !== 'null';
      const hasGivePrompt = stateData.actionPrompt &&
                          stateData.actionPrompt.type === 'give';

      // If no contract (still negotiating) but there's a give prompt, remove it
      if (!hasActiveContract && hasGivePrompt) {
        console.log('[StateAgent] 🛑 Give actionPrompt blocked during house call negotiation');
        stateData.actionPrompt = { type: 'null' };
      }
    }

    // FILTER ERRONEOUS ACTION PROMPTS: During nonmedical requests, block all actionPrompts
    // These should use contractOffer or simpleInteraction instead
    if (usingRevisedPipeline && normalizedIntent === 'nonmedical_request') {
      const hasActionPrompt = stateData.actionPrompt &&
                            stateData.actionPrompt.type &&
                            stateData.actionPrompt.type !== 'null';

      if (hasActionPrompt) {
        console.log('[StateAgent] 🛑 ActionPrompt blocked for nonmedical request (type was:', stateData.actionPrompt.type + ')');
        stateData.actionPrompt = { type: 'null' };
      }
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

    if (isFeatureEnabled('interactionDebugLogging')) {
      try {
        console.log('[StateAgent][Legacy] Classification snapshot:', {
          contractType: stateData.contractOffer?.type || 'null',
          actionPromptType: stateData.actionPrompt?.type || 'null',
          simpleInteractionType: stateData.simpleInteraction?.type || 'null',
          relationshipChanges: stateData.relationshipChanges?.length || 0,
          interactionIntent: normalizedIntent,
          originalInteractionIntent: interactionIntent,
          primaryNPC: primaryNPC?.name || null,
          activePatient: activePatient?.name || null,
          narrativePreview: narrative.length > 160 ? `${narrative.slice(0, 160)}…` : narrative
        });
      } catch (logError) {
        console.warn('[StateAgent] Failed logging classification snapshot:', logError);
      }
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
