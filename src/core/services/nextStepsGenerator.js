// nextStepsGenerator.js
// Generates "Next Steps" narrative after simple interactions

import { createChatCompletion } from './llmService';
import { scenarioLoader } from './scenarioLoader';

/**
 * Generate "Next Steps" narrative after a simple interaction
 * Creates a short reflective paragraph with bold options
 *
 * @param {Object} params
 * @param {string} params.playerAction - What just happened (e.g., "Declined Pedro's water offer")
 * @param {Object} params.gameState - Current game state
 * @param {Array} params.recentEvents - Recent journal entries for context
 * @param {string} params.scenarioId - Current scenario
 * @returns {Promise<string>} Formatted narrative with bold options
 */
export async function generateNextSteps({
  playerAction,
  gameState,
  recentEvents = [],
  scenarioId = '1680-mexico-city'
}) {
  const scenario = scenarioLoader.getScenario(scenarioId);
  const characterName = scenario?.character?.name || 'Maria';

  const systemPrompt = `You are narrating a historical RPG. Generate a brief "Next Steps" reflection after ${characterName} completes a simple interaction.

**Format**:
1. Short paragraph (2-3 sentences) describing the scene after the interaction
2. One sentence ending with bold options for what to do next

**Style**:
- Second person ("you")
- Reflective, contemplative tone
- Options should be contextual (based on debts, discoveries, time of day, location)
- Keep it concise (under 100 words total)

**Example**:
"Having sent the water seller on his way, you return to the dim quiet of your shop. The afternoon light filters through the dusty windows, illuminating jars of dried herbs. **Will you review your account books and ponder your debts, experiment with that interesting recipe you found yesterday, or venture out to the marketplace?**"`;

  const userPrompt = `**What just happened**: ${playerAction}

**Current context**:
- Location: ${gameState.location}
- Time: ${gameState.time}
- Date: ${gameState.date}
- Wealth: ${gameState.wealth} reales
- Recent events: ${recentEvents.slice(-3).map(e => e.entry || e.content).join('; ')}

Generate the "Next Steps" reflection now.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  try {
    const response = await createChatCompletion(
      messages,
      0.7, // Slightly creative but consistent
      300, // Short response
      null, // No JSON response needed
      { agent: 'NextStepsGenerator' }
    );

    const narrative = response.choices[0].message.content.trim();
    return narrative;

  } catch (error) {
    console.error('[NextStepsGenerator] Error:', error);

    // Fallback narrative
    return `With the matter settled, you turn your attention back to your work. The day continues at the botica. **What will you do next?**`;
  }
}
