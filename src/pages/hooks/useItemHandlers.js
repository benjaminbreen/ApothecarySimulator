// useItemHandlers.js
// Handles all item interaction logic (drop, give, sell, prescribe)
// Extracted from useGameHandlers.js (Phase 2.6)

import { useCallback } from 'react';
import { useGameState } from '../../contexts/GameStateContext';
import { createChatCompletion } from '../../core/services/llmService';
import { entityManager } from '../../core/entities/EntityManager';
import relationshipGraph from '../../core/entities/RelationshipGraph';
import scenarioLoader from '../../core/services/scenarioLoader';

/**
 * Custom hook for item handlers
 * Manages item drag-and-drop, give/sell/prescribe actions
 *
 * @param {Object} params - Hook parameters
 * @param {Function} params.setUserInput - User input setter
 * @param {Function} params.setConversationHistory - Conversation history setter
 * @param {Function} params.setHistoryOutput - History output setter
 * @param {Function} params.addJournalEntry - Journal entry adder
 * @param {Function} params.toast - Toast notification function
 * @param {Object} params.gameState - DEPRECATED: Use useGameState() instead
 * @param {number} params.turnNumber - Current turn number
 *
 * @returns {Object} Item handlers
 */
export function useItemHandlers({
  setUserInput,
  setConversationHistory,
  setHistoryOutput,
  addJournalEntry,
  toast,
  // Legacy params
  gameState,
  turnNumber,
}) {
  // Context hooks
  const { updateInventory, updateWealth } = useGameState();

  /**
   * Handle item drop
   * Formats item text for input field with proper quantity/quality
   */
  const handleItemDrop = useCallback((item) => {
    // Get quality inline
    const getItemQuality = (item) => {
      if (!item || !item.quality) return 'standard';
      return item.quality;
    };

    const quantity = item.quantity || 1;
    const isMedicine = !['clothing', 'misc', 'tool', 'weapon'].includes(item.type || item.entityType);

    // Get quality prefix
    const quality = getItemQuality(item);
    const qualityPrefix = quality === 'high_quality' ? 'high quality ' : quality === 'exceptional' ? 'exceptional ' : '';

    // Number words for quantities 1-10
    const numberWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const quantityWord = quantity <= 10 ? numberWords[quantity] : quantity.toString();

    let formattedText;
    if (isMedicine) {
      // For medicine: "Three drachms of high quality opium"
      const drachmText = quantity === 1 ? 'drachm' : 'drachms';
      formattedText = `${quantityWord} ${drachmText} of ${qualityPrefix}${item.name.toLowerCase()}`;
    } else {
      // For other items: "Two leather shoes" or "One blue apron"
      formattedText = `${quantityWord} ${qualityPrefix}${item.name.toLowerCase()}`;
    }

    // Capitalize first letter
    const capitalizedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1);
    setUserInput(capitalizedText);
  }, [setUserInput]);

  /**
   * Helper: Build LLM prompt for item action
   * Creates detailed prompt for give/sell/prescribe interactions
   */
  const buildItemActionPrompt = useCallback((action, item, npc, npcEntity, affinity, gameState) => {
    const scenario = scenarioLoader.getScenario(gameState.scenarioId || '1680-mexico-city');

    const basePrompt = `You are simulating ${npc.name}, a character in 1680 Mexico City.

**NPC Profile:**
- Name: ${npc.name}
- Type: ${npcEntity?.entityType || npc.type || 'npc'}
- Background: ${npcEntity?.background || npc.background || 'Unknown'}
- Personality: ${npcEntity?.personality || npc.personality || 'Reserved'}
- Social Class: ${npcEntity?.socialClass || npc.socialClass || 'Middle class'}
- Wealth: ${npcEntity?.wealth || npc.wealth || 'Moderate means'}
- Current Relationship with Maria: ${affinity > 50 ? 'Friendly' : affinity > 0 ? 'Neutral' : affinity < -50 ? 'Hostile' : 'Cautious'} (${affinity}/100)

**Item Details:**
- Name: ${item.name}
- Type: ${item.type || 'medicine'}
- Price: ${item.price || 0} reales
- Quality: ${item.quality || 'standard'}
- Properties: ${item.properties?.join(', ') || 'Unknown'}
- Description: ${item.description || 'No description'}

**Context:**
Maria de Lima, a converso apothecary, is attempting to ${action === 'give' ? 'give this item as a gift' : action === 'sell' ? 'sell this item' : 'prescribe this item as medical treatment'} to ${npc.name}.

**Instructions:**
Based on ${npc.name}'s personality, social status, current relationship with Maria, and the nature of the item, determine how they would respond.

Consider:
1. Would they accept/buy/use this item? Why or why not?
2. How does their relationship with Maria affect their response?
3. ${action === 'sell' ? 'Is the price fair? Would they negotiate?' : action === 'give' ? 'Do they appreciate gifts? Is this gift appropriate?' : 'Do they trust Maria\'s medical expertise? Are they suffering from an ailment this could treat?'}
4. Historical context (Inquisition, social hierarchy, converso prejudice)

Respond with ONLY a JSON object in this exact format:
{
  "accepted": true or false,
  "narrative": "A 2-3 sentence response from ${npc.name} in their voice, showing their reaction",
  "relationshipDelta": number between -15 and +15 (how this interaction affects their relationship),
  "priceAdjustment": ${action === 'sell' ? 'number (positive if they pay more, negative if they bargain down)' : '0'},
  "systemMessage": "One sentence explaining the outcome (e.g., 'They appreciated the gesture but politely declined' or 'They paid 5 reales for the medicine')"
}`;

    return basePrompt;
  }, []);

  /**
   * Helper: Parse LLM response for item action
   * Extracts JSON data from LLM response
   */
  const parseItemActionOutcome = useCallback((response, action, item) => {
    try {
      // Try to parse as JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          accepted: parsed.accepted || false,
          narrative: parsed.narrative || `${parsed.accepted ? 'They accept.' : 'They decline.'}`,
          relationshipDelta: parsed.relationshipDelta || 0,
          priceAdjustment: parsed.priceAdjustment || 0,
          price: action === 'sell' ? (item.price + (parsed.priceAdjustment || 0)) : 0,
          systemMessage: parsed.systemMessage || `${parsed.accepted ? 'Transaction completed' : 'Offer declined'}.`
        };
      }
    } catch (error) {
      console.error('[Item Action] Failed to parse LLM response:', error);
    }

    // Fallback response if parsing fails
    return {
      accepted: false,
      narrative: "They seem uncertain and politely decline for now.",
      relationshipDelta: 0,
      priceAdjustment: 0,
      price: 0,
      systemMessage: "The interaction was inconclusive."
    };
  }, []);

  /**
   * Handle item action
   * Processes give/sell/prescribe item actions to NPCs
   * Uses LLM to determine NPC response based on relationship and context
   */
  const handleItemAction = useCallback(async (action, item, npc, closePopup) => {
    console.log(`[Item Action] Starting: ${action} ${item.name} to ${npc.name}`);

    try {
      // Get full NPC entity data from EntityManager
      const npcEntity = entityManager.getByName(npc.name);
      console.log('[Item Action] NPC Entity:', npcEntity);

      // Get relationship value if available
      const relationship = relationshipGraph.getRelationship(npc.id || npc.name, 'player');
      const affinity = relationship?.value || 0;
      console.log('[Item Action] Relationship affinity:', affinity);

      // Build prompt based on action type
      const systemPrompt = buildItemActionPrompt(action, item, npc, npcEntity, affinity, gameState);
      console.log('[Item Action] Prompt built, calling LLM...');

      // Call LLM to get NPC response
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Maria attempts to ${action === 'give' ? 'give' : action === 'sell' ? 'sell' : 'prescribe'} ${item.name} to ${npc.name}.` }
      ];

      const response = await createChatCompletion(
        messages,
        0.8,  // temperature
        500   // maxTokens
      );

      console.log('[Item Action] LLM Response:', response);

      // Extract text content from response
      const responseText = response.choices?.[0]?.message?.content || response;
      console.log('[Item Action] Response text:', responseText);

      // Parse response
      const outcome = parseItemActionOutcome(responseText, action, item);
      console.log('[Item Action] Parsed outcome:', outcome);

      // Update game state based on outcome
      if (outcome.accepted) {
        // Remove item from inventory
        updateInventory(item.name, -1, action);

        // Update wealth if selling
        if (action === 'sell' && outcome.price) {
          const finalPrice = item.price + (outcome.priceAdjustment || 0);
          updateWealth(finalPrice);

          toast.success(`Sold ${item.name} for ${finalPrice} reales!`, { duration: 3000 });
        } else if (action === 'give') {
          toast.success(`${npc.name} accepted your gift!`, { duration: 3000 });
        } else if (action === 'prescribe') {
          toast.success(`${npc.name} accepted the prescription!`, { duration: 3000 });
        }

        // Update relationship
        if (outcome.relationshipDelta) {
          relationshipGraph.updateRelationship(
            npc.id || npc.name,
            'player',
            outcome.relationshipDelta,
            `${action === 'give' ? 'Received gift' : action === 'sell' ? 'Purchased item' : 'Received prescription'}: ${item.name}`
          );

          console.log(`[Relationship] ${npc.name}: ${outcome.relationshipDelta > 0 ? '+' : ''}${outcome.relationshipDelta} (${action} ${item.name})`);
        }
      } else {
        // Action rejected - item stays in inventory
        if (action === 'sell') {
          toast.error(`${npc.name} declined to buy ${item.name}`, { duration: 3000 });
        } else if (action === 'give') {
          toast.info(`${npc.name} politely refused your gift`, { duration: 3000 });
        } else if (action === 'prescribe') {
          toast.warning(`${npc.name} declined the prescription`, { duration: 3000 });
        }
      }

      // Add to conversation history
      const narrativeMessage = { role: 'assistant', content: outcome.narrative };
      const systemMessage = { role: 'system', content: `*${outcome.systemMessage}*` };

      setConversationHistory(prev => [...prev, narrativeMessage, systemMessage]);

      // Also update history output to display in narrative panel
      setHistoryOutput(outcome.narrative);

      // Add journal entry
      const journalText = outcome.accepted
        ? `${action === 'give' ? 'Gave' : action === 'sell' ? 'Sold' : 'Prescribed'} ${item.name} to ${npc.name}. ${outcome.systemMessage}`
        : `Attempted to ${action} ${item.name} to ${npc.name}, but they declined. ${outcome.systemMessage}`;

      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: journalText
      });

      // Close popup
      if (closePopup) {
        closePopup();
      }

    } catch (error) {
      console.error('[Item Action] Error details:', error);
      console.error('[Item Action] Error stack:', error.stack);
      toast.error(`Failed to ${action} item: ${error.message}`, { duration: 5000 });

      if (closePopup) {
        closePopup();
      }
    }
  }, [
    updateInventory,
    updateWealth,
    setConversationHistory,
    setHistoryOutput,
    addJournalEntry,
    turnNumber,
    gameState,
    toast,
    buildItemActionPrompt,
    parseItemActionOutcome
  ]);

  return {
    handleItemDrop,
    handleItemAction,
  };
}
