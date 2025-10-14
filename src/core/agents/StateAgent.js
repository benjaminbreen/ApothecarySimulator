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
  "contractOffer": {"type": "treatment|sale|null", "offeredBy": "string", "offeredByDescription": "string", "patientName": "string", "patientDescription": "string", "paymentOffered": number, "itemRequested": "string"},
  "journalEntry": "**Date, Time, Location**: One sentence with **NPC names bolded**",
  "systemAnnouncements": []
}
\`\`\`

**Status words**: tired, exhilarated, frightened, anxious, worried, determined, calm, rested, weary, content, frustrated, angry, curious, hopeful, desperate, relieved, proud, ashamed, uncertain, confident, melancholy, joyful

**Reputation**: 😡 (1), 😠 (2), 😐 (3), 😶 (4), 🙂 (5), 😌 (6), 😏 (7), 😃 (8), 😇 (9), 👑 (10)

**Time**: Conversation 0.5-1h, treatment 1-2h, shopping 1-2h, travel 2-3h, sleep 6-8h. Use exact times ("8:35 AM"), increment date past midnight.

**Relationships**: Most interactions are neutral (delta: 0). Only track meaningful changes. Major positive +10 to +20, moderate +5 to +9, minor +1 to +4, minor negative -1 to -4, moderate -5 to -9, major -10 to -20.

**Contract Detection** (BE CONSERVATIVE):
- **Detect ONLY when**: Player action includes "negotiate", "how much", "payment", "terms" OR NPC offers payment AND player engaged
- **DO NOT detect**: First turn with NPC, player hasn't asked about payment, no negotiation yet, already completed transaction
- **Type "treatment"**: Extract offeredBy, offeredByDescription, patientName, patientDescription, paymentOffered (number or 0)
- **Type "sale"**: Extract offeredBy, offeredByDescription, itemRequested, paymentOffered
- **Type null**: Default (no contract)
- **System announcement**: Add "A potential contract offer for [type] has been detected, pending player acceptance of the terms ([payment])." when type is NOT null

**Rules**:
- Wealth changes match inventory (${currencyName})
- Time moves forward only
- Location: Include region/city
- Conservative: Reputation/relationships rarely change
- Contracts: Only when actively negotiating, never on first mention`;
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
