/**
 * Dialogue Extractor
 *
 * Extracts NPC dialogue from conversation history by parsing markdown bold patterns.
 * Dialogue is indicated by **"quoted text"** in the narrative.
 */

/**
 * Extract all dialogue utterances from a narrative text
 * Looks for patterns like: **"Some dialogue text"** or **"Text,"** or **"Text!"**
 *
 * @param {string} text - Narrative text to parse
 * @returns {Array<string>} Array of dialogue strings (without formatting)
 */
function extractDialogueFromText(text) {
  if (!text || typeof text !== 'string') return [];

  // Pattern: **"dialogue text"** (with optional punctuation before closing quote)
  // Matches: **"Hello"**, **"Hello!"**, **"Hello,"**, **"Hello?"**
  const dialoguePattern = /\*\*"([^"]+)"\*\*/g;

  const dialogues = [];
  let match;

  while ((match = dialoguePattern.exec(text)) !== null) {
    const dialogue = match[1].trim();
    if (dialogue) {
      dialogues.push(dialogue);
    }
  }

  return dialogues;
}

/**
 * Extract NPC name from dialogue attribution patterns
 * Looks for patterns like: "Name says," or "Name responds," or just "Name:"
 *
 * @param {string} text - Text to search for attribution
 * @returns {string|null} NPC name if found, null otherwise
 */
function extractSpeakerName(text) {
  if (!text || typeof text !== 'string') return null;

  // Pattern 1: Name says/responds/asks/replies/etc.
  const verbPattern = /([A-Z][a-zA-Z\s]+?)\s+(says|responds|asks|replies|answers|murmurs|whispers|shouts|exclaims|declares|announces|states)/i;
  const verbMatch = text.match(verbPattern);
  if (verbMatch) {
    return verbMatch[1].trim();
  }

  // Pattern 2: Name: "dialogue"
  const colonPattern = /([A-Z][a-zA-Z\s]+?):\s*\*\*"/;
  const colonMatch = text.match(colonPattern);
  if (colonMatch) {
    return colonMatch[1].trim();
  }

  // Pattern 3: Look for capitalized name before dialogue
  const nameBeforePattern = /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+[a-z]+\s*\*\*"/;
  const nameMatch = text.match(nameBeforePattern);
  if (nameMatch) {
    return nameMatch[1].trim();
  }

  return null;
}

/**
 * Check if text contains dialogue spoken by a specific NPC
 *
 * @param {string} text - Narrative text
 * @param {string} npcName - Name of NPC to check for
 * @returns {boolean} True if NPC spoke in this text
 */
function textContainsNPCDialogue(text, npcName) {
  if (!text || !npcName) return false;

  // Check if NPC name appears near dialogue
  const dialogues = extractDialogueFromText(text);
  if (dialogues.length === 0) return false;

  // Simple check: does the text contain the NPC's name and dialogue?
  const textLower = text.toLowerCase();
  const nameLower = npcName.toLowerCase();

  return textLower.includes(nameLower);
}

/**
 * Extract all dialogue exchanges for a specific NPC from conversation history
 *
 * @param {Array} conversationHistory - Array of conversation turns
 * @param {string} npcName - Name of NPC to extract dialogue for
 * @returns {Array<Object>} Array of dialogue objects with context
 */
export function extractNPCDialogue(conversationHistory, npcName) {
  if (!conversationHistory || !Array.isArray(conversationHistory)) return [];
  if (!npcName) return [];

  const dialogueExchanges = [];

  conversationHistory.forEach((turn, index) => {
    // Each turn should have: role, content, turnNumber, date, time, location
    const { role, content, turnNumber, date, time, location } = turn;

    // We're interested in assistant responses (narrative + NPC dialogue)
    if (role !== 'assistant') return;
    if (!content) return;

    // Check if this text contains dialogue from our NPC
    if (!textContainsNPCDialogue(content, npcName)) return;

    // Extract all dialogue from this turn
    const dialogues = extractDialogueFromText(content);
    if (dialogues.length === 0) return;

    // Get player's previous action (for context)
    let playerAction = '';
    if (index > 0 && conversationHistory[index - 1]?.role === 'user') {
      playerAction = conversationHistory[index - 1].content || '';
    }

    // For each dialogue utterance, try to determine if it's from our NPC
    dialogues.forEach((dialogue) => {
      // Get surrounding context (look for NPC name near the dialogue)
      const dialogueIndex = content.indexOf(`**"${dialogue}"`);
      if (dialogueIndex === -1) return;

      // Get text around the dialogue to find speaker attribution
      const contextStart = Math.max(0, dialogueIndex - 100);
      const contextEnd = Math.min(content.length, dialogueIndex + dialogue.length + 100);
      const context = content.substring(contextStart, contextEnd);

      // Check if NPC name appears in context
      if (!context.toLowerCase().includes(npcName.toLowerCase())) return;

      // Add to exchanges
      dialogueExchanges.push({
        dialogue,
        playerAction: playerAction.trim(),
        turnNumber: turnNumber || index + 1,
        date: date || 'Unknown date',
        time: time || 'Unknown time',
        location: location || 'Unknown location',
        fullNarrative: content,
        contextSnippet: context
      });
    });
  });

  return dialogueExchanges;
}

/**
 * Group dialogue exchanges by conversation sessions
 * (consecutive turns without large time gaps)
 *
 * @param {Array<Object>} dialogueExchanges - Array of dialogue exchanges
 * @returns {Array<Array<Object>>} Grouped exchanges by session
 */
export function groupDialogueIntoSessions(dialogueExchanges) {
  if (!dialogueExchanges || dialogueExchanges.length === 0) return [];

  const sessions = [];
  let currentSession = [];
  let lastTurnNumber = -1;

  dialogueExchanges.forEach((exchange) => {
    const turnGap = exchange.turnNumber - lastTurnNumber;

    // Start new session if gap > 5 turns (indicates different conversation)
    if (turnGap > 5 && currentSession.length > 0) {
      sessions.push(currentSession);
      currentSession = [];
    }

    currentSession.push(exchange);
    lastTurnNumber = exchange.turnNumber;
  });

  // Add final session
  if (currentSession.length > 0) {
    sessions.push(currentSession);
  }

  return sessions;
}

/**
 * Get summary statistics about NPC dialogue
 *
 * @param {Array<Object>} dialogueExchanges - Array of dialogue exchanges
 * @returns {Object} Statistics object
 */
export function getDialogueStats(dialogueExchanges) {
  if (!dialogueExchanges || dialogueExchanges.length === 0) {
    return {
      totalExchanges: 0,
      totalWords: 0,
      firstEncounter: null,
      lastEncounter: null,
      locations: []
    };
  }

  const totalWords = dialogueExchanges.reduce((sum, exchange) => {
    return sum + (exchange.dialogue?.split(/\s+/).length || 0);
  }, 0);

  const locations = [...new Set(dialogueExchanges.map(e => e.location))];

  return {
    totalExchanges: dialogueExchanges.length,
    totalWords,
    firstEncounter: dialogueExchanges[0],
    lastEncounter: dialogueExchanges[dialogueExchanges.length - 1],
    locations
  };
}

export default {
  extractDialogueFromText,
  extractSpeakerName,
  textContainsNPCDialogue,
  extractNPCDialogue,
  groupDialogueIntoSessions,
  getDialogueStats
};
