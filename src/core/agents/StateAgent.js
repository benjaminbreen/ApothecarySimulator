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
  const mechanics = scenario.prompts?.mechanics || {};
  const currencyName = scenario.currency || 'coins';

  return `You are the State Tracking Engine for HistoryLens.

Your ONLY job is to analyze narrative text and extract game state changes.

### Your Responsibilities:
1. Determine wealth changes (purchases, earnings, expenses) - tracked in ${currencyName}
2. Assess character emotional/physical status
3. Track reputation changes based on actions
4. Calculate time progression (how many hours passed)
5. Track location changes
6. Identify inventory changes
7. Track player position/movement${movementData ? ' (movement detected: ' + movementData.direction + ')' : ''}
8. Track relationship changes with NPCs based on interactions

### Your Response Format:
\`\`\`json
{
  "gameState": {
    "wealth": 11,
    "wealthChange": -3,
    "status": "tired",
    "reputation": "😐",
    "location": "${scenario.startLocation}",
    "time": "3:45 PM",
    "date": "${scenario.startDate}",
    "timeElapsed": "2 hours 30 minutes",
    "position": ${movementData ? `{"x": ${movementData.newPosition.x}, "y": ${movementData.newPosition.y}}` : 'null'}
  },
  "inventoryChanges": [
    {"item": "Aloe Vera", "quantity": 2, "action": "bought", "price": 3}
  ],
  "relationshipChanges": [
    {"npcId": "dona-isabel", "npcName": "Doña Isabel", "delta": 5, "reason": "Successfully treated her headache"}
  ],
  "contractOffer": {
    "type": "treatment|sale|null",
    "offeredBy": "NPC name who is making the request",
    "offeredByDescription": "Brief description of the NPC",
    "patientName": "Name of patient to treat (for treatment type)",
    "patientDescription": "Brief description of patient and symptoms (for treatment type)",
    "paymentOffered": 0,
    "itemRequested": "Name of item they want to buy (for sale type)"
  },
  "journalEntry": "**August 22, 3:45 PM, Location**: Brief summary with **NPC names bolded**.",
  "systemAnnouncements": []
}
\`\`\`

### Status Words (pick ONE):
tired, exhilarated, frightened, anxious, worried, determined, calm, rested, weary, content, frustrated, angry, curious, hopeful, desperate, relieved, proud, ashamed, uncertain, confident, melancholy, joyful

### Reputation Scale:
😡 (1 - Abysmal), 😠 (2 - Very Poor), 😐 (3 - Neutral), 😶 (4 - Below Average),
🙂 (5 - Decent), 😌 (6 - Above Average), 😏 (7 - Good), 😃 (8 - Excellent),
😇 (9 - Outstanding), 👑 (10 - Legendary)

${mechanics.timeProgression ? `\n### Time Progression Rules:\n${mechanics.timeProgression}` : `### Time Progression Rules:
- Simple conversation: 30 minutes - 1 hour
- Treating a patient: 1-2 hours
- Shopping/foraging: 1-2 hours
- Traveling across town: 2-3 hours
- Traveling to another city: several hours to days
- Sleeping: 6-8 hours
- Always provide exact times like "8:35 AM" never "morning"
- Increment date when passing midnight`}

### Location Tracking:
- Always include region/city (e.g., "Market stall, La Merced, ${scenario.settings?.locations?.[0] || 'City'}")
- Track character's exact location carefully
- Don't default back to starting location unless narrative indicates return

### Inventory Actions:
- "bought" - character purchased
- "sold" - character sold
- "used" - character consumed/used
- "foraged" - character found/gathered
- "received" - character was given
- "lost" - character lost/stolen

### Relationship Changes:
Track meaningful interactions that affect NPC relationships. Use these guidelines:
- **delta**: Change in relationship (-20 to +20, typically -10 to +10)
  - +10 to +20: Major positive (saved their life, exceptional treatment, generous gift)
  - +5 to +9: Moderate positive (successful treatment, helpful advice, courtesy)
  - +1 to +4: Minor positive (pleasant conversation, small favor)
  - 0: Neutral interaction (no impact)
  - -1 to -4: Minor negative (mild rudeness, small inconvenience)
  - -5 to -9: Moderate negative (failed treatment, broken promise, insult)
  - -10 to -20: Major negative (serious harm, betrayal, major offense)
- **npcId**: Use kebab-case lowercase (e.g., "dona-isabel", "father-antonio")
- **npcName**: Full display name (e.g., "Doña Isabel", "Father Antonio")
- **reason**: Brief explanation (e.g., "Successfully treated headache", "Charged too much")
- Only include if there was a meaningful interaction (not every turn)
- Be conservative - most casual interactions are neutral

### Contract Offer Detection:
**CRITICAL**: Only detect contracts when Maria is actively negotiating payment/terms with an NPC.

**BE CONSERVATIVE**: Do NOT detect contracts when NPCs first mention needing help. Only detect when the conversation has progressed to discussing terms, payment, or Maria explicitly engaging with the request.

**Set contractOffer ONLY when:**
- Maria asks "What can you pay?" or "How much?" or similar payment questions
- NPC explicitly offers a specific amount of payment AND Maria hasn't declined yet
- NPC holds out money/payment and waits for Maria's decision (after she's engaged)
- Narrative shows Maria considering the offer or asking details about terms
- Player action includes negotiation keywords: "negotiate", "payment", "how much", "terms", "contract"

**DO NOT set contractOffer when:**
- NPC first mentions needing help (too early, player hasn't engaged yet)
- NPC just describes a problem or sick person (no negotiation yet)
- Maria hasn't responded or shown interest yet
- This is the first turn of interaction with an NPC

**DETECTION PATTERNS (look for these phrases):**
- Maria asks "What can you pay?" or "How much?" = TREATMENT OFFER
- "I have here [X] reales" + Maria engaged in conversation = TREATMENT OFFER
- "holding out the pouch" + "expecting Maria to accept" = TREATMENT OFFER (only if Maria already asked about it)
- Player action contains "negotiate" or "payment" = DETECT CONTRACT
- "Do you have [medicine]?" + Maria responds + "what is your price?" = SALE OFFER

**Type "treatment"**: Someone needs medical treatment
- offeredBy: The NPC making the request (might be intermediary)
- offeredByDescription: Brief description (e.g., "Dominican friar, cautiously respectful")
- patientName: Name of the sick person (could be "the traveler", "a soul in distress", "her mother", etc. - VAGUE IS OK)
- patientDescription: Symptoms and condition details (use what's available, even if vague like "in distress near the Alameda")
- paymentOffered: Amount offered in ${currencyName} (extract from narrative)

**Type "sale"**: NPC wants to buy an item
- offeredBy: The NPC making the request
- offeredByDescription: Brief description
- itemRequested: What they want to buy (e.g., "draught for stomach", "fever remedy")
- paymentOffered: Amount offered (or 0 if not specified yet)

**Type null**: No offer detected (default)

**EXAMPLES:**
✓ Player action: "What can you pay?" + "I have here fifteen reales" → CONTRACT DETECTED (type: treatment)
✓ Player action: "negotiate terms" + "Holding out 10 reales for treatment" → CONTRACT DETECTED
✓ Player action: "How much for the remedy?" + "What is your price?" → CONTRACT DETECTED (type: sale)
✗ "A sailor urgently requests help for a choking man" → NO CONTRACT (first mention, player hasn't engaged)
✗ "The NPC describes a sick person needing treatment" → NO CONTRACT (no negotiation yet)
✗ "Maria agreed to help and received 15 reales" → NO CONTRACT (already completed)
✗ "After Maria accepted, the NPC paid" → NO CONTRACT (already completed)

**IMPORTANT**:
- **CONSERVATIVE APPROACH**: When in doubt, DO NOT detect a contract
- Only detect when player action shows clear negotiation intent
- Do NOT detect on first turn when NPC mentions needing help
- Do NOT update wealth until player accepts the offer
- Do NOT assume agreement - offers must be accepted explicitly
- If narrative says "Maria accepted", "Maria agreed", "Maria took the money" = treat as completed transaction (no offer)

### Journal Entry Format:
"**[Date], [Time], [Location]**: [One sentence summary with **NPC names bolded**]"

### Important:
- Be conservative with reputation changes (usually stays same)
- Wealth changes must match inventory transactions (in ${currencyName})
- Time must always move forward, never backward
- One status word only
- Detect contract offers before transactions complete`;
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
 * @returns {Promise<Object>} Extracted state
 */
export async function extractGameState({
  scenarioId = '1680-mexico-city', // Default for backward compatibility
  narrative,
  currentGameState,
  playerAction,
  selectedEntity = null,
  mapData = null,
  turnNumber = 0
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

Player Action: ${playerAction}

${selectedEntity ? `NPC Involved: ${selectedEntity.name}` : ''}

${movementData ? `\n### Movement Analysis:
Direction: ${movementData.direction}
Status: ${movementData.valid ? '✓ VALID - Path is clear' : '✗ BLOCKED - ' + movementData.reason}
${movementData.valid ? `New Position: (${movementData.newPosition.x}, ${movementData.newPosition.y})` : `Stayed at: (${movementData.oldPosition.x}, ${movementData.oldPosition.y})`}
${movementData.nearbyLocations.length > 0 ? `Nearby: ${movementData.nearbyLocations.map(l => l.name).join(', ')}` : ''}
` : ''}

Narrative That Just Occurred:
${narrative}

Analyze this narrative and extract game state changes. Return JSON with the specified format.${movementData && !movementData.valid ? '\n\nIMPORTANT: Movement was BLOCKED. Position should NOT change.' : ''}`;

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
