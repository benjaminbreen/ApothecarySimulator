// NarrativeAgent - Specialized agent for story generation
// Handles: Story text, player actions, NPC interactions, dialogue, spatial context

import { createChatCompletion } from '../services/llmService';
import { buildContextSummary, buildEntityContext, buildSkillsContext } from '../../prompts/promptModules';
import { scenarioLoader } from '../services/scenarioLoader';
import { getGridSystem } from '../../features/map/services/gridMovementSystem';
import { getReputationTier, getFactionStanding, FACTION_INFO } from '../systems/reputationSystem';

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
 * Build map context for narrative generation
 * @param {Object} mapData - Current map data
 * @param {Object} playerPosition - Player's current position
 * @param {string} currentMapId - Current map identifier
 * @returns {string} Formatted map context for LLM
 */
function buildMapContext(mapData, playerPosition, currentMapId) {
  if (!mapData || !playerPosition) {
    return '';
  }

  try {
    const gridSystem = getGridSystem(currentMapId, mapData);

    // Get nearby locations
    const nearby = gridSystem.getNearbyLocations(playerPosition, 4);

    // Get movement options
    const movementOptions = gridSystem.getMovementOptions(playerPosition);

    // Build context string
    let context = `\n### Spatial Context (Current Location):
Player Position: Grid (${playerPosition.gridX || Math.floor(playerPosition.x / 20)}, ${playerPosition.gridY || Math.floor(playerPosition.y / 20)})

`;

    // Add nearby locations if any
    if (nearby.length > 0) {
      context += `Nearby Locations:\n`;
      nearby.forEach(loc => {
        context += `- ${loc.name} (${loc.distance} steps ${loc.direction})${loc.type ? ` [${loc.type}]` : ''}\n`;
      });
      context += '\n';
    }

    // Add movement options
    context += `Movement Options:\n`;
    Object.entries(movementOptions).forEach(([direction, option]) => {
      const status = option.valid ? '✓ CLEAR' : `✗ BLOCKED (${option.reason})`;
      context += `- ${direction.toUpperCase()}: ${status}\n`;
    });

    context += `\n### Narrative Instructions for Movement:
- If player tries to move in a BLOCKED direction, narratively explain WHY using the obstacle name
- If player moves in a CLEAR direction, describe the movement vividly with period details
- Mention nearby locations naturally in the narrative to give spatial awareness
- Use directional language (north, south, east, west) when describing relative positions
- DO NOT mention grid coordinates or game mechanics - stay in-character and historical`;

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

### Response Format (JSON):
\`\`\`json
{
  "narrative": "Story text (1-3 paragraphs, markdown, concise, vivid)",
  "npcDialogue": "Direct NPC speech if applicable",
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

### Primary NPC & Portrait System (NEW):
**When a NAMED NPC is the primary person Maria is interacting with, provide their COMPLETE profile upfront.**

**Available Portraits** (choose best match):
- **Elite Women:** spanishnoblewoman.jpg, middleagedcriollofemalemerchant.jpg, criollofemalemerchant.jpg
- **Common Women:** peasantwoman.jpg, poorwoman.jpg, beggarwoman.jpg, africanwoman.jpg, indiowoman.jpg
- **Young Women:** youngspanishwoman.jpg, youngafricanwoman.jpg, youngindigenouswoman.jpg, youngmulattowoman.jpg
- **Elderly Women:** oldwoman.jpg, elderlyafricanwoman.jpg, elderlycriollofemalehealer.jpg
- **Elite Men:** spanishnoble.jpg, elderlynobleman.jpg, elderlypeninsulareman.jpg
- **Common Men:** indiopeasantman.jpg, mulattoman.jpg, pooryoungman.jpg, youngman.jpg
- **Clergy:** priest.jpg, abbot.jpg, nun.jpg, elderlycriollonun.jpg, middleagedcriollonun.jpg
- **Merchants:** merchantman.jpg, middleagedmalemerchant.jpg, mestizomiddleagedmalemerchant.jpg
- **Soldiers:** soldier.jpg, elderlysoldier.jpg, mulattosoldier.jpg, frontiersoldier.jpg
- **Children:** child.jpg, childevening.jpg, sickboy.jpg, mestizoboy.jpg, mestizogirl.jpg, noblemalechild.jpg
- **Scholars/Healers:** scholar.jpg, femalescholar.jpg, middleagedfemaleapothecary.jpg, middleagedmaleapothecary.jpg
- **Workers:** middleagedfarmer.jpg, middleagedmalesailor.jpg, middleagedmalemuleteer.jpg, fishermanonriver.jpg

**When to provide primaryPortrait & primaryNPC:**
✓ Named NPC speaking/interacting directly (Doña Luisa, Fray Antonio, etc.)
✓ First appearance of a new recurring NPC
✓ Patient being discussed in detail (even if intermediary present)
✗ Background entities (soldiers marching past)
✗ Animals, items, locations
✗ Maria alone navigating

**primaryNPC must include:**
- name (full formal name)
- age, gender (for portrait matching)
- occupation (specific job, not vague)
- casta, class (colonial social hierarchy)
- personality (2-3 traits: "Gruff but fair", "Pious and nervous")
- appearance (physical description: build, clothing, distinguishing features)
- description (1 sentence character summary)

**Portrait Selection Rules:**
1. Match demographics first (age + gender + class)
2. Match occupation second (clergy, merchant, soldier, etc.)
3. Match casta third (español, criollo, mestizo, etc.)
4. If no perfect match, choose closest approximate

**Examples:**
✓ Doña Luisa Mendoza (elite woman, middle-aged, español) → "primaryPortrait": "spanishnoblewoman.jpg"
✓ Fray Antonio (priest, middle-aged, male) → "primaryPortrait": "priest.jpg"
✓ Stout peasant woman (common, middle-aged) → "primaryPortrait": "peasantwoman.jpg"
✗ João the cat → null (animal)
✗ Maria thinking alone → null (no NPC)

**CRITICAL:** Keep showPortraitFor for compatibility, but primaryPortrait is now authoritative.

### Patient Request System (requestNewPatient):
**YOU control when new patients arrive.** Only request a new patient when it makes narrative sense.

**Set requestNewPatient to TRUE when:**
- Maria is clearly waiting for patients at her shop during business hours
- Player says something like "wait for patients" or "open the shop"
- It's morning/midday at the botica and no one has visited recently
- A messenger arrives saying someone needs treatment
- The narrative suggests patients would naturally seek Maria out

**Set requestNewPatient to FALSE when:**
- Currently treating an active patient (don't interrupt)
- Maria is away from her shop/workplace
- It's late evening or night time
- Maria is busy with other activities (mixing medicines, studying, eating)
- The scene doesn't support a new arrival (traveling, sleeping, in crisis)
- Someone already arrived this turn

**patientContext examples:**
- "Morning rush - word of Maria's success has spread"
- "Nobleman sends messenger requesting treatment"
- "Market day brings more foot traffic"
- "Patient returns for follow-up treatment"

**Default to FALSE unless context clearly supports a new patient arrival.**

### Contract Offers (CRITICAL):
**When an NPC requests medical treatment or wants to purchase medicine, DO NOT have Maria automatically agree.**

**Treatment Request Flow:**
1. NPC makes request: "I need you to treat [patient name]. I can offer [X reales]."
2. Describe the patient's condition and symptoms clearly
3. **END THE NARRATIVE before Maria responds** - let player decide via modal
4. StateAgent will detect this as a contract offer

**Sale Request Flow:**
1. NPC asks: "Do you have [medicine name]? I need it for [condition]. What is your price?"
2. **END THE NARRATIVE before Maria responds** - let player propose price via modal
3. StateAgent will detect this as a sale offer

**Examples:**
✓ GOOD (Treatment): "Hermana Francisca clutches the feverish child. 'Please, *curandera*, young Diego needs your help. The convent can pay 15 reales for your services.'" ← STOPS HERE (no Maria response)
✗ BAD (Treatment): "Hermana Francisca requests help, and Maria agrees to treat the child." ← Maria already agreed, no player choice

✓ GOOD (Sale): "The merchant eyes your shelf. 'Do you have a remedy for stomach griping? My wife suffers terribly.'" ← STOPS HERE
✗ BAD (Sale): "The merchant asks for medicine and Maria sells him a draught for 8 reales." ← Already completed, no player choice

**KEY RULE:** Treatment/purchase requests = PAUSE for player decision. Don't auto-complete transactions.

### Entity Detection:
List 2-3 most important interactive elements in "entities" array.
**Include:** Named NPCs ("Don Luis"), unnamed characters ("a beggar"), important animals ("a stray dog barking at you"), important items ("a bloodstained letter"), significant locations ("the alley entrance")
**Exclude:** Abstract concepts, weather/atmosphere, non-interactive objects, generic descriptions

**Field rules:**
- "text": Must match narrative EXACTLY for highlighting
- "tier": story-critical (plot-essential) | recurring (named, likely to reappear) | background (unnamed one-time)
- "description": Required for unnamed entities
- "wikipediaQuery": **Educational context suggestion**
  - For NPCs/patients: Suggest Wikipedia pages about their ROLE/OCCUPATION/SOCIAL CONTEXT, NOT their personal name
    - ✓ Good: "Converso", "Midwifery in colonial Mexico", "Spanish Inquisition"
    - ✗ Bad: "Rosa Maria Perez" (ambiguous person name)
  - For items: Use null to allow direct lookup, OR suggest specific page if ambiguous
    - ✓ Good: null (for "Sal Ammoniac"), "Mexico City Metropolitan Cathedral" (for "Cathedral")
    - ✗ Bad: Generic terms that won't match Wikipedia
  - For locations: Suggest full proper name if abbreviated in narrative
- "demographics": **REQUIRED for NPCs and patients** - Provides portrait matching data
  - "gender": Physical presentation (male, female, or unknown if ambiguous/group)
  - "age": Apparent age category (child <12, youth 12-20, adult 20-40, middle-aged 40-60, elderly 60+)
  - "casta": Colonial caste system category (español/European, indígena/Indigenous, africano/African, mestizo/mixed Spanish-Indigenous, mulato/mixed Spanish-African, criollo/American-born Spanish, unknown)
  - "class": Socioeconomic status (elite/nobility-wealthy, middling/artisans-merchants, common/laborers, poor/destitute)
  - **Omit demographics for animals, items, and locations**

**Examples:**
- Named NPC: \`{ "text": "Señor Benavides", "entityType": "npc", "tier": "recurring", "occupation": "herb merchant", "wikipediaQuery": "Herbalism in colonial Mexico", "demographics": { "gender": "male", "age": "middle-aged", "casta": "español", "class": "middling" } }\`
- Unnamed character: \`{ "text": "a weathered beggar", "entityType": "npc", "tier": "background", "description": "An elderly Indigenous man in tattered clothes", "wikipediaQuery": "Poverty in colonial Mexico", "demographics": { "gender": "male", "age": "elderly", "casta": "indígena", "class": "poor" } }\`
- Patient: \`{ "text": "Doña Mercedes", "entityType": "patient", "tier": "recurring", "description": "A wealthy criolla woman with fever", "wikipediaQuery": "Criollo people", "demographics": { "gender": "female", "age": "adult", "casta": "criollo", "class": "elite" } }\`
- Item: \`{ "text": "Sal Ammoniac", "entityType": "item", "tier": "background", "description": "A crystalline salt", "wikipediaQuery": null }\`
- Location: \`{ "text": "the Cathedral", "entityType": "location", "tier": "recurring", "description": "The grand Metropolitan Cathedral", "wikipediaQuery": "Mexico City Metropolitan Cathedral" }\`

### Writing Style:
${core.tone || 'Clear, concise prose. No purple language. 1-3 paragraphs max.'}

${mechanics.commands ? `\n### Commands Available:\n${mechanics.commands}` : ''}

### Historical Context:
${historical.accuracy || 'Maintain accuracy. No anachronisms. Use period terminology.'}
${historical.social ? `\n${historical.social}` : ''}

${narrative.pacing ? `\n### Pacing:\n${narrative.pacing}` : ''}
${narrative.events ? `\n### Events:\n${narrative.events}` : ''}
${narrative.npcIntroduction ? `\n### NPC Introduction:\n${narrative.npcIntroduction}` : ''}
${narrative.npcPresence ? `\n${narrative.npcPresence}` : ''}

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
  // DEBUG: Log what we received
  console.log('[buildConversationHistory] Received:', {
    historyLength: conversationHistory?.length,
    journalLength: journal?.length,
    currentTurn,
    historyType: Array.isArray(conversationHistory) ? 'array' : typeof conversationHistory
  });

  // Log first few messages to see structure
  if (conversationHistory && conversationHistory.length > 0) {
    console.log('[buildConversationHistory] First 2 messages:', {
      msg0: conversationHistory[0],
      msg1: conversationHistory[1]
    });
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

    if (userMsg?.role === 'user' && assistantMsg?.role === 'assistant') {
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
      history.push(`Player: ${pair.user}`);
      history.push(`Narrator: ${pair.assistant}`);
    });
  }

  // Log compression stats
  const uncompressedTokens = recentPairs.reduce((sum, p) =>
    sum + (p.user.length + p.assistant.length) / 4, 0
  );
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
  currentMapId = null,
  reputation = null,
  playerSkills = null,
  journal = []
}) {
  try {
    // Load scenario
    const scenario = scenarioLoader.loadScenario(scenarioId);

    // Build map context if available
    const mapContext = mapData && playerPosition && currentMapId
      ? buildMapContext(mapData, playerPosition, currentMapId)
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

    // Build reputation context
    const reputationContext = buildReputationContext(reputation, selectedEntity);

    // Build skills context
    const skillsContext = playerSkills ? buildSkillsContext(playerSkills) : '';

    // Build conversation history (5 full turns + 10 journal entries)
    const recentHistory = buildConversationHistory(conversationHistory, journal, turnNumber);

    const userPrompt = `Context:
${contextSummary}

Recent Conversation:
${recentHistory}

${entityContext ? `\n${entityContext}\n` : ''}
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

    // Debug: Log the showPortraitFor and requestNewPatient values
    console.log('[NarrativeAgent] LLM returned showPortraitFor:', narrativeData.showPortraitFor);
    console.log('[NarrativeAgent] LLM returned requestNewPatient:', narrativeData.requestNewPatient);

    return {
      success: true,
      narrative: narrativeData.narrative || '',
      npcDialogue: narrativeData.npcDialogue || null,
      sceneDescription: narrativeData.sceneDescription || '',
      suggestedCommands: narrativeData.suggestedCommands || [],
      showPortraitFor: narrativeData.showPortraitFor || null, // LLM portrait hint
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
