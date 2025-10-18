/**
 * Trade Negotiation Service
 *
 * Uses LLM to simulate realistic trade negotiations with NPCs in historical context
 */

import { createChatCompletion } from '../../../core/services/llmService';

/**
 * Negotiate a sale price with an NPC merchant
 *
 * @param {Object} params - Negotiation parameters
 * @param {Object} params.npc - NPC merchant data (name, personality, languages, etc.)
 * @param {Object} params.item - Item being sold (name, description, value, etc.)
 * @param {number} params.proposedPrice - Price Maria is asking for
 * @param {number} params.fairPrice - Fair market value for the item
 * @param {number} params.relationshipLevel - Relationship with NPC (0-100)
 * @param {Array} params.previousHistory - Previous negotiation messages
 * @param {Object} params.playerSkills - Maria's skills (bargaining, languages, etc.)
 * @param {string} params.scenarioContext - Historical context (e.g., "1680 Mexico City")
 *
 * @returns {Promise<Object>} Negotiation result
 *   - accepted: boolean - Whether NPC accepts the price
 *   - dialogue: string - NPC's response dialogue
 *   - counterOffer: number|null - Counter-offer price if rejected
 *   - relationshipChange: number - Change to relationship (-5 to +5)
 */
export async function negotiateSale({
  npc,
  item,
  proposedPrice,
  fairPrice,
  relationshipLevel,
  previousHistory = [],
  playerSkills = {},
  scenarioContext = '1680 Mexico City'
}) {
  // Build conversation context
  const conversationContext = previousHistory.length > 0
    ? previousHistory.map(msg => `${msg.speaker}: ${msg.text}`).join('\n')
    : '';

  // Calculate context for LLM
  const priceRatio = proposedPrice / fairPrice;
  const bargainingLevel = playerSkills?.knownSkills?.bargaining?.level || 0;
  const relationshipStatus = relationshipLevel >= 75 ? 'excellent' : relationshipLevel >= 50 ? 'good' : relationshipLevel >= 25 ? 'neutral' : 'poor';

  const systemPrompt = `You are roleplaying as ${npc.name}, a merchant in ${scenarioContext}.

**Your Personality**: ${npc.personality || 'practical and fair'}
**Your Relationship with Maria**: ${relationshipStatus} (${relationshipLevel}/100)
**Languages**: ${npc.languages?.join(', ') || 'Spanish'}

**Negotiation Context**:
- Maria (the player) is trying to sell you a ${item.name}
- Fair market value: ${fairPrice} reales
- Maria is asking: ${proposedPrice} reales
- Price ratio: ${priceRatio > 1 ? `${Math.round((priceRatio - 1) * 100)}% above fair value` : priceRatio < 1 ? `${Math.round((1 - priceRatio) * 100)}% below fair value` : 'at fair value'}
- Maria's bargaining skill: Level ${bargainingLevel}

**Your Task**:
Respond to Maria's price proposal as this merchant would. Consider:
1. Your relationship with Maria (better relationships = more flexibility)
2. How far the price is from fair value
3. Your personality (e.g., suspicious merchants are harder to bargain with)
4. Maria's bargaining skill (skilled negotiators deserve more respect)

**Decision Guidelines**:
- If price is 90-110% of fair value: Likely accept
- If price is 70-130% of fair value: Consider accepting based on relationship/skills
- If price is outside this range: Reject and make a counter-offer

**Response Format**:
Return a JSON object with:
{
  "accepted": true/false,
  "dialogue": "Your spoken response to Maria (2-3 sentences, historically appropriate, in character)",
  "counterOffer": null or number (if rejected, what price will you pay?),
  "relationshipChange": -5 to +5 (how this affects your relationship)
}

**Historical Context**: Remember you are in ${scenarioContext}. Use period-appropriate language and concerns. Be realistic about prices and trade.`;

  const userPrompt = conversationContext
    ? `Previous conversation:\n${conversationContext}\n\nNow Maria says: "I'm asking ${proposedPrice} reales for this ${item.name}."`
    : `Maria approaches you to sell a ${item.name}. She says: "I'm asking ${proposedPrice} reales for this ${item.name}."`;

  try {
    const response = await createChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      0.7, // Higher temperature for more personality
      500 // Token limit
    );

    // Parse JSON response
    let result;
    try {
      const content = response.choices[0].message.content;
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      console.error('[tradeNegotiationService] Failed to parse LLM response:', parseError);
      // Fallback to simple logic
      return fallbackNegotiation(proposedPrice, fairPrice, relationshipLevel, npc.name);
    }

    // Validate result structure
    if (typeof result.accepted !== 'boolean' || !result.dialogue) {
      console.warn('[tradeNegotiationService] Invalid LLM response structure, using fallback');
      return fallbackNegotiation(proposedPrice, fairPrice, relationshipLevel, npc.name);
    }

    // Ensure counter-offer is reasonable if provided
    if (!result.accepted && result.counterOffer) {
      result.counterOffer = Math.max(1, Math.round(result.counterOffer));
    }

    // Clamp relationship change
    result.relationshipChange = Math.max(-5, Math.min(5, result.relationshipChange || 0));

    return result;

  } catch (error) {
    console.error('[tradeNegotiationService] LLM call failed:', error);
    return fallbackNegotiation(proposedPrice, fairPrice, relationshipLevel, npc.name);
  }
}

/**
 * Fallback negotiation logic when LLM fails
 */
function fallbackNegotiation(proposedPrice, fairPrice, relationshipLevel, npcName) {
  const priceRatio = proposedPrice / fairPrice;
  const relationshipBonus = (relationshipLevel - 50) / 200; // -0.25 to +0.25

  let acceptanceChance = 0.5 + relationshipBonus;

  // Adjust based on price
  if (priceRatio > 1.3) acceptanceChance -= 0.4;
  else if (priceRatio > 1.1) acceptanceChance -= 0.2;
  else if (priceRatio <= 0.9) acceptanceChance += 0.3;

  const accepted = Math.random() < acceptanceChance;

  if (accepted) {
    return {
      accepted: true,
      dialogue: `${npcName} nods. "Very well, ${proposedPrice} reales is acceptable. We have a deal."`,
      counterOffer: null,
      relationshipChange: priceRatio <= 1 ? 3 : 1
    };
  } else {
    const counterOffer = Math.round(fairPrice * 0.85);
    return {
      accepted: false,
      dialogue: `${npcName} shakes their head. "I appreciate the offer, but ${proposedPrice} is too much. I can pay ${counterOffer} reales at most."`,
      counterOffer,
      relationshipChange: priceRatio > 1.5 ? -3 : -1
    };
  }
}

/**
 * Negotiate a purchase price with an NPC (when buying from them)
 * Similar to negotiateSale but from the buyer's perspective
 *
 * @param {Object} params - Same as negotiateSale
 * @returns {Promise<Object>} Negotiation result
 */
export async function negotiatePurchase({
  npc,
  item,
  proposedPrice,
  fairPrice,
  relationshipLevel,
  previousHistory = [],
  playerSkills = {},
  scenarioContext = '1680 Mexico City'
}) {
  // Similar implementation but from NPC seller perspective
  // For now, use simpler acceptance logic
  // TODO: Implement full LLM-based purchase negotiation

  const priceRatio = proposedPrice / fairPrice;
  const accepted = priceRatio >= 0.7; // NPCs are more lenient when selling

  return {
    accepted,
    dialogue: accepted
      ? `${npc.name} nods. "For ${proposedPrice} reales, it's yours."`
      : `${npc.name} frowns. "I cannot sell for less than ${fairPrice} reales."`,
    counterOffer: accepted ? null : fairPrice,
    relationshipChange: 0
  };
}
