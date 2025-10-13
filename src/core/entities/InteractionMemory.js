/**
 * Interaction Memory System
 *
 * Manages NPC memory of player interactions.
 * - Stores up to 10 interactions per NPC
 * - Auto-summarizes when limit exceeded
 * - Provides context for LLM prompts
 *
 * @module InteractionMemory
 */

/**
 * Add interaction to NPC memory
 * @param {Object} npc - NPC entity
 * @param {Object} interaction - Interaction data
 * @param {Function} summarize - LLM summarization function (optional)
 * @returns {Object} Updated NPC
 */
export async function addInteraction(npc, interaction, summarize = null) {
  const memory = npc.memory || {
    interactions: [],
    maxInteractions: 10,
    archivedSummary: ''
  };

  // Add new interaction
  memory.interactions.push(interaction);

  // If over limit, archive oldest and summarize
  if (memory.interactions.length > memory.maxInteractions) {
    const removed = memory.interactions.shift(); // Remove oldest

    // Update archived summary
    if (summarize) {
      // Use LLM to create concise summary
      const context = {
        removedInteraction: removed,
        currentSummary: memory.archivedSummary,
        totalArchived: memory.interactions.length - memory.maxInteractions + 1
      };

      memory.archivedSummary = await summarize(context);
    } else {
      // Fallback: simple concatenation
      const summary = `${removed.date}: ${removed.summary}`;
      memory.archivedSummary = memory.archivedSummary ?
        `${memory.archivedSummary}; ${summary}` :
        summary;
    }
  }

  return {
    ...npc,
    memory
  };
}

/**
 * Get memory context for LLM prompt
 * @param {Object} npc - NPC entity
 * @returns {string} Formatted memory context
 */
export function getMemoryContext(npc) {
  const memory = npc.memory;
  if (!memory || memory.interactions.length === 0) {
    return 'No previous interactions with this person.';
  }

  let context = '';

  // Recent interactions (detailed)
  if (memory.interactions.length > 0) {
    context += 'Recent interactions:\n';
    memory.interactions.slice(-5).forEach(interaction => {
      context += `- ${interaction.date} (${interaction.turnNumber}): ${interaction.summary}\n`;
    });
  }

  // Archived summary (if exists)
  if (memory.archivedSummary) {
    context += `\nEarlier interactions: ${memory.archivedSummary}`;
  }

  return context;
}

/**
 * Get relationship trend from memory
 * @param {Object} npc - NPC entity
 * @returns {string} Trend: 'improving', 'declining', 'stable'
 */
export function getRelationshipTrend(npc) {
  const memory = npc.memory;
  if (!memory || memory.interactions.length < 2) {
    return 'stable';
  }

  // Calculate average delta over last 5 interactions
  const recentDeltas = memory.interactions.slice(-5).map(i => i.delta || 0);
  const avgDelta = recentDeltas.reduce((sum, d) => sum + d, 0) / recentDeltas.length;

  if (avgDelta > 2) return 'improving';
  if (avgDelta < -2) return 'declining';
  return 'stable';
}

/**
 * Clear old interactions (for testing/reset)
 * @param {Object} npc - NPC entity
 * @returns {Object} Updated NPC
 */
export function clearMemory(npc) {
  return {
    ...npc,
    memory: {
      interactions: [],
      maxInteractions: 10,
      archivedSummary: ''
    }
  };
}

export default {
  addInteraction,
  getMemoryContext,
  getRelationshipTrend,
  clearMemory
};
