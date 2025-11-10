// useCommerceHandlers.js
// Handles all commerce and NPC interaction logic
// Extracted from useGameHandlers.js (Phase 2.3)

import { useCallback } from 'react';
import { useGameState } from '../../contexts/GameStateContext';
import { useNPCs } from '../../contexts/NPCContext';
import { entityManager } from '../../core/entities/EntityManager';
import { createChatCompletion } from '../../core/services/llmService';
import { mapNPCFactionToSystemFaction } from '../../core/systems/reputationSystem';
import { MedicalRecordsManager } from '../../core/systems/medicalRecordsManager';
import { getTransactionManager, TRANSACTION_CATEGORIES, TRANSACTION_OUTCOMES } from '../../core/systems/transactionManager';

/**
 * Helper: Check if donation is abstract (non-physical)
 * Abstract donations don't require inventory items
 */
function isAbstractDonation(itemName) {
  if (!itemName) return false;
  const lower = itemName.toLowerCase();
  // Abstract donations: time, access, permission, information, advice, etc.
  const abstractPatterns = [
    'time',
    'access',
    'permission',
    'information',
    'advice',
    'guidance',
    'knowledge',
    'wisdom',
    'favor',
    'blessing',
    'prayer',
    'secret',
    'help',
    'assistance'
  ];
  return abstractPatterns.some(pattern => lower.includes(pattern));
}

/**
 * Helper: Build evaluation prompt for give/sell outcomes
 * Relies on LLM knowledge of 17th century medicine rather than hard-coded tables
 */
function buildGiveSellOutcomePrompt({ type, recipientName, item, amount, price, ailmentDescription, recentNarrative, location }) {
  const quantityText = `${amount}× ${item.name}`;
  const priceLine = type === 'sell'
    ? `Maria is asking ${price} reales for this transaction.`
    : 'This is a charitable gift with no payment expected.';
  const ailmentLine = ailmentDescription
    ? `The recipient originally described their need as: "${ailmentDescription}".`
    : 'The recipient did not describe a specific ailment.';
  const contextLine = recentNarrative
    ? `\n\nRecent context:\n${recentNarrative}`
    : '';

  return `You adjudicate outcomes for a historical roleplaying game set in 1680 Mexico City.
Maria de Lima, a converso apothecary, offers ${quantityText} of ${item.name} to ${recipientName} as a ${type === 'sell' ? 'sale' : 'gift'}.
${priceLine}
${ailmentLine}${contextLine}

**CRITICAL - Realistic Skepticism:**
People in 1680 are NOT passive customers. They are:
- Skeptical of remedies that don't match their ailment (honey for cough = reasonable but not very impressive; honey for broken bone = outrageous nonsense)
- Price-conscious (1 real = day's wages for poor; >10 reales = serious expense)
- Knowledgeable about common remedies (old wives' tales, humoral theory, Church teachings)
- Quick to anger if they feel cheated or dismissed, which is often

**Decision Guidelines:**
- **Appropriate remedy + fair price** → Likely accept (60-70% chance)
- **Appropriate remedy + high price** → Counter-offer or decline if poor (40% accept)
- **Questionable remedy** → Skeptical, even insulting - likely counter or decline (10% accept)
- **Wrong remedy** → Outright reject, offended, possibly try to fight Maria or demean her (0% accept)

Respond with ONLY a JSON object in this format:
{
  "accepted": true | false,
  "decision": "accepted" | "declined" | "counter",
  "finalPrice": ${type === 'sell' ? 'number (amount exchanged, or counter-offer if haggling)' : '0'},
  "narrative": "3-4 sentences describing: (1) NPC's reaction, (2) their departure (leaving satisfied/angry/confused) OR staying to haggle/ask follow-up/badmouth the player",
  "reason": "Short phrase explaining their decision",
  "forwardMomentum": "ONLY if NPC departs, 1 sentence with bold question offering 2 choices: **'Will you [action A], or [action B]?'** (example: **'Will you open the shop for more patients, or close early to forage for herbs?'**). If NPC stays, leave null."
}

**CRITICAL - Departure Logic:**
- If accepted OR declined → NPC leaves (describe them exiting, satisfied or furious or whatever it is)
- If counter/haggle → NPC stays, awaiting Maria's response (do NOT describe departure)
- forwardMomentum ONLY appears when NPC leaves

**Example Narratives:**
✓ GOOD (accepted, departs): "Mateo reluctantly accepts, counting out the reales with calloused fingers. He tucks the honey into his basket and nods curtly before stepping back into the crowded street, his shoulders still tight with worry."
✓ GOOD (declined, departs): "The woman's eyes narrow. 'Honey for a broken finger? You mock me, señora.' She turns sharply, her skirts kicking up dust as she storms toward the plaza, muttering about 'fraudulent healers.'"
✓ GOOD (counter, stays): "He frowns, weighing the vial in his palm. 'Five reales is all I have, Doña Maria. Will you take that instead?' He waits, eyes hopeful but wary."

Rules:
- For gifts, finalPrice must be 0.
- If the NPC has a specific ask and the player offers something else, the NPC is always offended and leaves.
- Keep narrative grounded in 1680 realities; no anachronisms.`;
}

/**
 * Helper: Parse LLM outcome response for give/sell actions
 */
function parseGiveSellOutcome(rawText, type, fallbackPrice) {
  const defaultNarrative = 'The exchange fizzles awkwardly; no goods change hands.';
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const accepted = Boolean(parsed.accepted);
      const decision = parsed.decision || (accepted ? 'accepted' : 'declined');
      let finalPrice = type === 'sell' ? Number(parsed.finalPrice ?? fallbackPrice ?? 0) : 0;

      if (Number.isNaN(finalPrice) || finalPrice < 0) {
        finalPrice = fallbackPrice ?? 0;
      }
      if (type !== 'sell') {
        finalPrice = 0;
      }

      return {
        accepted,
        decision,
        finalPrice,
        narrative: parsed.narrative || defaultNarrative,
        reason: parsed.reason || '',
        forwardMomentum: parsed.forwardMomentum || null, // New: forward momentum question
      };
    }
  } catch (error) {
    console.error('[ActionPrompt] Failed to parse give/sell outcome:', error);
  }

  return {
    accepted: false,
    decision: 'declined',
    finalPrice: type === 'sell' ? (fallbackPrice ?? 0) : 0,
    narrative: defaultNarrative,
    reason: 'No clear outcome returned',
    forwardMomentum: null,
  };
}

/**
 * Custom hook for commerce/trade handlers
 * Manages sales, trades, and simple NPC interactions
 *
 * @param {Object} params - Hook parameters
 * @param {Function} params.addJournalEntry - Journal entry adder
 * @param {Function} params.setConversationHistory - Conversation history setter
 * @param {Function} params.setHistoryOutput - Narrative output setter
 * @param {Function} params.toast - Toast notification function
 * @param {Function} params.awardXP - Award XP function
 * @param {Function} params.updateReputation - Update faction reputation
 * @param {Function} params.advanceTime - Time advancement function
 * @param {Function} params.setTradingNPC - Set trading NPC
 * @param {Function} params.setTradeMode - Set trade mode
 * @param {Function} params.setIsBuyOpen - Open buy/trade modal
 * @param {Function} params.setCurrentMapId - Change current map/location
 * @param {Function} params.setPreselectedTradeTab - Preselect tab in TradeModal
 * @param {Function} params.removeTradeOpportunity - Remove trade opportunity from state
 * @param {Function} params.setPendingSimpleInteraction - Set pending simple interaction
 * @param {Function} params.setPendingMixingDecision - Set pending mixing decision
 * @param {Function} params.setPendingSaleInquiry - Clear sale inquiry
 * @param {Function} params.setPendingSaleProposal - Set pending sale proposal
 * @param {Function} params.setMixingContextForSale - Set mixing context for sale
 * @param {Function} params.setShowMixingPopup - Open mixing workshop modal
 * @param {Function} params.setGameState - Update game state (for medical records)
 * @param {Function} params.handleSubmit - Main submit handler for triggering full narrative turns
 * @param {Array} params.conversationHistory - Conversation history for NarrativeAgent context
 * @param {Array} params.journal - Journal entries for NarrativeAgent context
 * @param {Object} params.gameState - DEPRECATED: Use useGameState() instead
 * @param {number} params.turnNumber - Current turn number
 * @param {Object} params.npcTracker - NPC tracker instance
 * @param {Function} params.clearConversationLock - Clears active NPC conversation lock
 *
 * @returns {Object} Commerce handlers
 */
export function useCommerceHandlers({
  addJournalEntry,
  setConversationHistory,
  setHistoryOutput,
  toast,
  awardXP,
  updateReputation,
  advanceTime,
  setTradingNPC,
  setTradeMode,
  setIsBuyOpen,
  setCurrentMapId,
  setPreselectedTradeTab,
  removeTradeOpportunity,
  setPendingSimpleInteraction,
  setPendingMixingDecision,
  setPendingSaleInquiry,
  setPendingActionPrompt,
  setPendingSaleProposal,
  setMixingContextForSale,
  setShowMixingPopup,
  setGameState,
  recentPortraitRef, // Portrait ref for clearing on NPC dismissal
  previousPortraitEntityRef, // Portrait entity ref for clearing on NPC dismissal
  handleSubmit, // Main submit handler for full turns
  conversationHistory, // For NarrativeAgent context
  journal, // For NarrativeAgent context
  // Legacy params
  gameState,
  turnNumber,
  npcTracker,
  clearConversationLock,
}) {
  // Context hooks
  const { updateInventory, updateWealth } = useGameState();
  const { setPendingContract, setPrimaryPortraitFile } = useNPCs();

  /**
   * Handle accepting a sale contract
   * Completes item sale to customer, updates inventory and wealth
   */
  const handleAcceptSale = useCallback(async (item, price, customerName) => {
    console.log('[Contract] Proposing sale:', item.name, 'Price:', price, 'Customer:', customerName);

    // Update inventory (remove item)
    updateInventory(item.name, -1, 'sold');

    // Update wealth
    updateWealth(price);

    // Award XP for completing sale
    if (typeof awardXP === 'function') {
      awardXP(1, `sale_${item.name}_to_${customerName}`);
    }

    // Log transaction to ledger (Libro de Cuentas)
    const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
    const currentWealth = (gameState.wealth || 0) + price; // Calculate new wealth after payment
    transactionManager.logTransaction(
      'income',
      TRANSACTION_CATEGORIES.MEDICINE_SALES,
      `Sold ${item.name} to ${customerName}`,
      price,
      currentWealth,
      gameState.date,
      gameState.time
    );
    console.log(`[Ledger] Logged sale of ${item.name} for ${price} reales`);

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[SALE COMPLETED] Maria sold ${item.name} to ${customerName} for ${price} reales.*` }
    ]);

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Sold ${item.name} to ${customerName} for ${price} reales.`
    });

    toast.success(`Sold ${item.name} for ${price} reales!`, { duration: 3000 });

    // Clear the contract and close modal
    setPendingContract(null);

    // Simulate player action for full narrative turn showing the handoff
    const simulatedAction = `hand over the ${item.name} to ${customerName} and receive ${price} reales`;

    console.log('[Sale] Triggering full narrative turn for sale completion:', simulatedAction);

    // Trigger full narrative turn to show NPC receiving item, their reaction, and departure
    // CRITICAL: Pass action as second parameter (actionOverride), not first (event)
    setTimeout(() => {
      handleSubmit(null, simulatedAction);
    }, 100);
  }, [
    updateInventory,
    updateWealth,
    awardXP,
    setConversationHistory,
    addJournalEntry,
    turnNumber,
    gameState.date,
    gameState.scenarioId,
    gameState.time,
    gameState.wealth,
    toast,
    setPendingContract,
    handleSubmit
  ]);

  /**
   * Handle accepting a trade opportunity
   * Opens trade modal with selected NPC
   */
  const handleAcceptTrade = useCallback((opportunity) => {
    console.log('[Trade] Accepted trade opportunity:', opportunity);

    // Set the trading NPC and mode
    setTradingNPC(opportunity);
    setTradeMode('npc');

    // Open the trade modal
    setIsBuyOpen(true);

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[TRADE OPENED] Maria opens trade with ${opportunity.npcName}.*` }
    ]);

    toast.success(`Opening trade with ${opportunity.npcName}`, { duration: 2000 });
  }, [
    setTradingNPC,
    setTradeMode,
    setIsBuyOpen,
    setConversationHistory,
    toast
  ]);

  /**
   * Handle declining a trade opportunity
   * Removes opportunity from state
   */
  const handleDeclineTrade = useCallback((opportunityId) => {
    console.log('[Trade] Declined trade opportunity:', opportunityId);

    // Log failed transaction attempt
    const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
    transactionManager.logInteractionAttempt(
      TRANSACTION_CATEGORIES.OTHER,
      `Declined trade opportunity (ID: ${opportunityId})`,
      0, // No amount available without opportunity details
      TRANSACTION_OUTCOMES.DECLINED_OFFER,
      'Player rejected the trade',
      gameState.date,
      gameState.time
    );

    // Remove the opportunity
    removeTradeOpportunity(opportunityId);

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[TRADE DECLINED] Maria declined the trade offer.*` }
    ]);

    toast.info('Trade opportunity declined.', { duration: 2000 });
  }, [
    removeTradeOpportunity,
    setConversationHistory,
    toast,
    gameState
  ]);

  /**
   * Handle simple interaction choices
   * Processes service offers, donations, competitive checks, info exchange, social visits
   * This is the largest commerce handler
   */
  const handleSimpleInteractionChoice = useCallback(async (action, interaction) => {
    console.log('[SimpleInteraction] Player chose:', action, interaction);

    const { type, npcName } = interaction;

    // ALL simple interactions are one-and-done brief encounters
    // After any action (buy, refuse, donate, gamble, etc.), the NPC should depart
    // This is different from medical consultations which span multiple turns
    const isDismissal = true;

    // Determine time increment based on interaction type
    const timeIncrements = {
      service_offer: 5,
      vendor_offer: 5,
      donation_request: 5,
      competitive_check: 10,
      information_exchange: 5,
      social_visit: 15,
      investment_offer: 10 // Investment discussions take a bit longer
    };
    const timeIncrement = timeIncrements[type] || 5;

    // Process action based on type
    let journalText = '';
    let reputationChange = 0;
    let xpAmount = 1; // Base XP for simple interactions

    switch (type) {
      case 'service_offer': {
        const { item, price } = interaction.offer;
        if (action === 'buy') {
          // Deduct wealth
          updateWealth(-price);
          // Add item to inventory
          updateInventory(item, 1, `purchased from ${npcName}`);
          journalText = `Purchased ${item} from ${npcName} for ${price} reales.`;
          toast.success(`Bought ${item} for ${price} reales`, { duration: 2000 });
          reputationChange = +1; // Small reputation boost for supporting vendors
        } else {
          journalText = `Declined to purchase ${item} from ${npcName}.`;
          toast.info('Purchase declined', { duration: 1500 });
          // No reputation penalty for politely declining
        }
        break;
      }

      case 'donation_request': {
        const { item, reputationImpact } = interaction.request;
        if (action === 'donate') {
          // Check if donation is abstract (non-physical)
          const isAbstract = isAbstractDonation(item);

          // Only deduct from inventory if it's a physical item
          if (!isAbstract) {
            updateInventory(item, -1, `donated to ${npcName}`);
          }

          reputationChange = reputationImpact.donate;
          journalText = `Donated ${item} to ${npcName}. A small act of charity.`;
          toast.success(`Donated ${item}. Reputation +${reputationChange}`, { duration: 2500 });
        } else {
          reputationChange = reputationImpact.refuse;
          journalText = `Refused ${npcName}'s request for charity.`;
          toast.warning(`Refused donation. Reputation ${reputationChange}`, { duration: 2000 });
        }
        break;
      }

      case 'competitive_check': {
        const { difficulty = 'medium' } = interaction.competitive;

        if (action === 'show_around') {
          // Friendly but risky - reveal information to rival
          reputationChange = +2; // Reputation boost for being friendly
          journalText = `Showed ${npcName} around the workshop. They seemed impressed but also took careful note of everything.`;
          toast.warning(`${npcName} learned about your methods. Reputation +2 but they may use this knowledge against you.`, { duration: 4000 });
          xpAmount = 1;
        } else if (action === 'refuse_politely') {
          // Safe but unfriendly - maintain secrets but seem closed-off
          reputationChange = -1; // Small reputation hit for being unfriendly
          journalText = `Politely refused ${npcName}'s request to see the workshop. They seemed disappointed but accepted gracefully.`;
          toast.info(`Maintained trade secrets. Reputation -1 for appearing closed-off.`, { duration: 3000 });
          xpAmount = 1;
        } else if (action === 'misdirect') {
          // Deception check - try to feed them false information
          const deceptionSuccessRate = {
            easy: 0.8,
            medium: 0.5,
            hard: 0.3
          };
          const successRate = deceptionSuccessRate[difficulty] || 0.5;
          const success = Math.random() < successRate;

          if (success) {
            // Successfully misdirected rival
            reputationChange = +3; // Reputation boost for cunning
            journalText = `Successfully misdirected ${npcName} with false information about your methods. They left believing they learned something valuable.`;
            toast.success(`Misdirection successful! ${npcName} was fooled. +3 reputation for cunning`, { duration: 4000 });
            xpAmount = 3; // Extra XP for successful deception
          } else {
            // Failed deception - rival caught on
            reputationChange = -3; // Reputation hit for obvious deception
            journalText = `Attempted to misdirect ${npcName}, but they saw through the ruse. They left offended and suspicious.`;
            toast.error(`${npcName} saw through your deception! Reputation -3`, { duration: 4000 });
            xpAmount = 1;
          }
        } else if (action === 'boast') {
          // Show off - try to intimidate rival with superiority
          const intimidationSuccessRate = {
            easy: 0.7,
            medium: 0.5,
            hard: 0.3
          };
          const successRate = intimidationSuccessRate[difficulty] || 0.5;
          const success = Math.random() < successRate;

          if (success) {
            // Successfully intimidated rival
            reputationChange = +4; // Strong reputation boost for demonstrating superiority
            journalText = `Demonstrated your superior knowledge and techniques to ${npcName}. They left visibly impressed and intimidated.`;
            toast.success(`${npcName} was intimidated by your expertise! +4 reputation`, { duration: 4000 });
            xpAmount = 2;
          } else {
            // Failed to impress - came off as arrogant
            reputationChange = -2; // Reputation hit for arrogance
            journalText = `Boasted about your techniques to ${npcName}, but they seemed unimpressed. You may have come across as arrogant.`;
            toast.warning(`${npcName} wasn't impressed. Reputation -2 for arrogance`, { duration: 3000 });
            xpAmount = 1;
          }
        } else {
          // Default case - shouldn't happen
          journalText = `${npcName}'s visit concluded.`;
          toast.info('Visit concluded', { duration: 2000 });
        }
        break;
      }

      case 'information_exchange': {
        const { topic, cost } = interaction.information;
        if (action === 'pay') {
          // Parse cost (could be "1 real", "1 bread", etc.)
          const coinMatch = cost.match(/(\d+)\s*(real|reale)/i);
          if (coinMatch) {
            const coinCost = parseInt(coinMatch[1]);
            updateWealth(-coinCost);
            journalText = `Paid ${coinCost} reales to ${npcName} for information about ${topic}.`;
            toast.success(`Learned about ${topic}`, { duration: 2500 });
          } else {
            // Item cost - extract item name
            const itemMatch = cost.match(/(\d+)\s+(\w+)/i);
            if (itemMatch) {
              const itemName = itemMatch[2];
              updateInventory(itemName, -1, `paid to ${npcName} for information`);
              journalText = `Paid ${itemName} to ${npcName} for information about ${topic}.`;
              toast.success(`Learned about ${topic}`, { duration: 2500 });
            }
          }
          xpAmount = 2; // Extra XP for gaining knowledge
          reputationChange = +1; // Small reputation boost for engaging with informants

          // Generate follow-up narrative revealing the information
          // This is a CRITICAL fix - information_exchange needs continuation narrative
          const shouldGenerateNarrative = true;
          if (shouldGenerateNarrative) {
            console.log('[SimpleInteraction] Information accepted - will generate follow-up narrative');
          }
        } else {
          journalText = `Refused to pay ${npcName} for information about ${topic}.`;
          toast.info('Declined information', { duration: 1500 });
          reputationChange = -1; // Small reputation hit for refusing informants
        }
        break;
      }

      case 'social_visit': {
        // Social visits are just conversational, no resource exchange
        journalText = `Spent time with ${npcName}. ${interaction.social.purpose}`;
        reputationChange = +2; // Small reputation boost for maintaining relationships
        toast.info(`Visit with ${npcName} complete`, { duration: 2000 });
        break;
      }

      case 'vendor_offer': {
        const { item, price, quantity = 1 } = interaction.offer;
        if (action === 'buy') {
          // Deduct wealth
          updateWealth(-price);
          // Add item to inventory
          updateInventory(item, quantity, `purchased from ${npcName}`);

          // Log transaction to ledger (Libro de Cuentas)
          const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
          const currentWealth = (gameState.wealth || 0) - price; // Calculate wealth after purchase
          transactionManager.logTransaction(
            'expense',
            TRANSACTION_CATEGORIES.INGREDIENT_PURCHASES,
            `Bought ${item} from ${npcName}`,
            price,
            currentWealth,
            gameState.date,
            gameState.time
          );
          console.log(`[Ledger] Logged purchase of ${item} from ${npcName} for ${price} reales`);

          journalText = `Purchased ${item} from ${npcName} for ${price} reales.`;
          toast.success(`Bought ${item} for ${price} reales`, { duration: 2000 });
          reputationChange = +1; // Small reputation boost for supporting vendors
        } else if (action === 'haggle') {
          // Guard: Can't haggle with undefined/zero price
          if (!price || price === 0) {
            toast.error('Price not set - cannot haggle', { duration: 2000 });
            return; // Exit early, don't trigger narrative turn
          }

          // Haggling attempt - simple skill check
          const baseSuccessRate = 0.5; // 50% base success rate
          const roll = Math.random();
          const success = roll < baseSuccessRate;

          if (success) {
            // Successful haggle - 10-20% discount
            const discountPercent = Math.floor(Math.random() * 11) + 10; // 10-20%
            const discount = Math.floor(price * (discountPercent / 100));
            const finalPrice = price - discount;

            // Check if player can afford discounted price
            if ((gameState.wealth || 0) >= finalPrice) {
              // Deduct wealth
              updateWealth(-finalPrice);
              // Add item to inventory
              updateInventory(item, quantity, `purchased from ${npcName} (haggled)`);

              // Log transaction to ledger
              const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
              const currentWealth = (gameState.wealth || 0) - finalPrice;
              transactionManager.logTransaction(
                'expense',
                TRANSACTION_CATEGORIES.INGREDIENT_PURCHASES,
                `Bought ${item} from ${npcName} (haggled down from ${price}r)`,
                finalPrice,
                currentWealth,
                gameState.date,
                gameState.time
              );
              console.log(`[Ledger] Logged haggled purchase of ${item} for ${finalPrice} reales (was ${price})`);

              journalText = `Successfully haggled with ${npcName}! Purchased ${item} for ${finalPrice} reales (${discountPercent}% discount).`;
              toast.success(`Haggled successfully! Saved ${discount} reales`, { duration: 3000 });
              reputationChange = +1; // Small reputation boost for successful haggling
              xpAmount = 2; // Extra XP for skillful negotiation
            } else {
              // Can't afford even with discount
              journalText = `Haggled with ${npcName} down to ${finalPrice} reales, but still couldn't afford it.`;
              toast.warning(`Negotiated to ${finalPrice}r but can't afford it`, { duration: 2500 });
            }
          } else {
            // Failed haggle - NPC slightly annoyed but accepts original price if player wants
            journalText = `Tried to haggle with ${npcName}, but they refused to budge on the price.`;
            toast.warning(`${npcName} wasn't interested in haggling`, { duration: 2500 });
            reputationChange = -1; // Small reputation hit for failed haggle
          }
        } else {
          // Refused to buy
          journalText = `Declined ${npcName}'s offer to purchase ${item}.`;
          toast.info('Offer declined', { duration: 1500 });
        }
        break;
      }

      case 'extortion_demand': {
        const { demandType, amount, difficulty, threatener, threatLevel } = interaction.extortion;

        // Initialize extortion history if needed
        if (!gameState.extortionHistory) {
          gameState.extortionHistory = {
            byNPC: {},
            activeProtection: [],
            pendingRetaliation: []
          };
        }

        // Helper to update extortion history
        const updateExtortionHistory = (response) => {
          if (!gameState.extortionHistory.byNPC[npcName]) {
            gameState.extortionHistory.byNPC[npcName] = {
              timesPaid: 0,
              timesRefused: 0,
              timesNegotiated: 0,
              timesReported: 0,
              lastAmount: amount,
              lastResponse: response,
              lastTurn: turnNumber,
              threatenerType: threatener
            };
          }
          const npcHistory = gameState.extortionHistory.byNPC[npcName];
          npcHistory[`times${response.charAt(0).toUpperCase() + response.slice(1)}`]++;
          npcHistory.lastAmount = amount;
          npcHistory.lastResponse = response;
          npcHistory.lastTurn = turnNumber;
          npcHistory.threatenerType = threatener;
        };

        // Helper to schedule consequence
        const scheduleConsequence = (type, severity, turnsUntil = 3) => {
          if (!gameState.pendingConsequences) {
            gameState.pendingConsequences = [];
          }
          gameState.pendingConsequences.push({
            type: 'extortion_retaliation',
            triggerTurn: turnNumber + turnsUntil,
            data: {
              npcName,
              retaliationType: type,
              severity,
              threatener,
              originalAmount: amount
            },
            description: `${npcName}'s threatened retaliation for refusing extortion`
          });
          console.log(`[Extortion] Scheduled ${type} retaliation from ${npcName} in ${turnsUntil} turns`);
        };

        if (action === 'pay') {
          // Pay the extortion
          updateWealth(-amount);
          updateExtortionHistory('paid');
          reputationChange = -2; // Paying extortion hurts reputation (seen as weak)

          // Check if this is a repeat payment - escalate amount next time
          const history = gameState.extortionHistory.byNPC[npcName];
          if (history && history.timesPaid > 1) {
            journalText = `Paid ${amount} reales to ${npcName} again. They've come to expect regular payments now...`;
            toast.warning(`Paid extortion. Reputation -2. They'll be back for more.`, { duration: 3500 });
          } else {
            journalText = `Paid ${amount} reales to ${npcName} to avoid trouble. The ${demandType} demand has been satisfied... for now.`;
            toast.warning(`Paid extortion money. Reputation -2`, { duration: 3000 });
          }
          xpAmount = 0; // No XP for giving in
        } else if (action === 'refuse') {
          // Refuse the extortion - brave but triggers consequences
          updateExtortionHistory('refused');
          reputationChange = +2; // Brave stance improves reputation

          // Schedule retaliation based on threatener type and threat level
          const retaliationTypes = {
            gang: ['vandalism', 'assault', 'theft'],
            official: ['shop_closure', 'fine', 'investigation'],
            inquisition_proxy: ['investigation', 'social_pressure', 'inquisition_notice'],
            rival: ['price_war', 'rumors', 'sabotage']
          };
          const severityMap = { veiled: 'low', direct: 'medium', violent: 'high' };
          const possibleRetaliations = retaliationTypes[threatener] || ['vandalism'];
          const retaliationType = possibleRetaliations[Math.floor(Math.random() * possibleRetaliations.length)];

          scheduleConsequence(retaliationType, severityMap[threatLevel] || 'medium', Math.floor(Math.random() * 3) + 2); // 2-4 turns

          journalText = `Refused ${npcName}'s demands. They didn't take it well. There may be consequences...`;
          toast.error(`Refused extortion! Watch your back. Reputation +2 for courage`, { duration: 4000 });
          xpAmount = 3; // XP for bravery
        } else if (action === 'negotiate') {
          // Attempt to negotiate - skill check
          const successRate = { easy: 0.7, medium: 0.5, hard: 0.3 }[difficulty] || 0.5;
          const success = Math.random() < successRate;

          if (success) {
            // Successful negotiation - reduced payment
            const reducedAmount = Math.floor(amount * 0.6); // 40% discount
            updateWealth(-reducedAmount);
            updateExtortionHistory('negotiated');
            reputationChange = +1; // Slight reputation boost for skillful negotiation
            journalText = `Successfully negotiated with ${npcName}. Reduced payment to ${reducedAmount} reales instead of ${amount}.`;
            toast.success(`Negotiated down to ${reducedAmount} reales!`, { duration: 3000 });
            xpAmount = 2; // XP for skillful handling
          } else {
            // Failed negotiation - now they're angry, schedule minor consequence
            updateExtortionHistory('negotiated');
            scheduleConsequence('intimidation', 'low', 2);
            journalText = `Attempted to negotiate with ${npcName}, but they were unmoved. The threat remains, and they seem more dangerous now.`;
            toast.error(`Negotiation failed!`, { duration: 2500 });
            reputationChange = -1;
            xpAmount = 0;
          }
        } else if (action === 'report') {
          // Report to authorities (only possible for non-official threats)
          updateExtortionHistory('reported');
          reputationChange = +3; // Good standing with law-abiding folks
          journalText = `Reported ${npcName} to the authorities. They promised to investigate the matter.`;
          toast.success(`Authorities notified. Reputation +3 for law-abiding behavior`, { duration: 3500 });
          xpAmount = 2;

          // Small chance corrupt authorities tip off the extorter (10% chance of consequence)
          if (Math.random() < 0.1) {
            scheduleConsequence('retaliation_for_snitching', 'high', 3);
            console.log(`[Extortion] Corrupt authorities tipped off ${npcName}!`);
          }
        }
        break;
      }

      case 'gamble_opportunity': {
        const { gameType, wager, potentialWin } = interaction.gamble;

        // Initialize gambling history if needed
        if (!gameState.gamblingHistory) {
          gameState.gamblingHistory = {
            byNPC: {},
            recentGames: [],
            currentStreak: { type: null, count: 0 }
          };
        }

        // Helper to update gambling history
        const updateGamblingHistory = (result, amount) => {
          // Update NPC-specific history
          if (!gameState.gamblingHistory.byNPC[npcName]) {
            gameState.gamblingHistory.byNPC[npcName] = {
              totalWins: 0,
              totalLosses: 0,
              netGain: 0,
              lastGameType: gameType,
              lastInteraction: turnNumber
            };
          }
          const npcHistory = gameState.gamblingHistory.byNPC[npcName];
          if (result === 'win') {
            npcHistory.totalWins++;
            npcHistory.netGain += amount;
          } else {
            npcHistory.totalLosses++;
            npcHistory.netGain -= Math.abs(amount);
          }
          npcHistory.lastGameType = gameType;
          npcHistory.lastInteraction = turnNumber;

          // Update recent games (keep last 10)
          gameState.gamblingHistory.recentGames.unshift({
            npcName,
            gameType,
            result,
            amount,
            turnNumber
          });
          if (gameState.gamblingHistory.recentGames.length > 10) {
            gameState.gamblingHistory.recentGames.pop();
          }

          // Update streak
          if (gameState.gamblingHistory.currentStreak.type === result) {
            gameState.gamblingHistory.currentStreak.count++;
          } else {
            gameState.gamblingHistory.currentStreak = { type: result, count: 1 };
          }
        };

        if (action === 'bet_won') {
          // Player won the bet
          const netGain = potentialWin - wager;
          updateWealth(netGain);
          updateGamblingHistory('win', netGain);

          // Log transaction to ledger
          const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
          const currentWealth = (gameState.wealth || 0) + netGain;
          transactionManager.logTransaction(
            'income',
            TRANSACTION_CATEGORIES.OTHER,
            `Won ${gameType} gamble with ${npcName}`,
            netGain,
            currentWealth,
            gameState.date,
            gameState.time
          );
          console.log(`[Ledger] Logged gambling win of ${netGain} reales from ${gameType}`);

          journalText = `Won at ${gameType} with ${npcName}! Gained ${netGain} reales.`;
          toast.success(`🎉 You won ${potentialWin} reales!`, { duration: 3500 });
          reputationChange = +1; // Slight reputation boost for winning
          xpAmount = 2;

          // Check for win streak
          if (gameState.gamblingHistory.currentStreak.count >= 3) {
            toast.warning(`${gameState.gamblingHistory.currentStreak.count} win streak! Other gamblers are taking notice...`, { duration: 4000 });
          }
        } else if (action === 'bet_doubled_won') {
          // Player won the double-or-nothing bet
          const doubledAmount = (potentialWin - wager) * 2;
          updateWealth(doubledAmount);
          updateGamblingHistory('win', doubledAmount);

          // Log transaction to ledger
          const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
          const currentWealth = (gameState.wealth || 0) + doubledAmount;
          transactionManager.logTransaction(
            'income',
            TRANSACTION_CATEGORIES.OTHER,
            `Won DOUBLED ${gameType} gamble with ${npcName}`,
            doubledAmount,
            currentWealth,
            gameState.date,
            gameState.time
          );
          console.log(`[Ledger] Logged DOUBLED gambling win of ${doubledAmount} reales from ${gameType}`);

          journalText = `Doubled down and WON at ${gameType} with ${npcName}! Gained ${doubledAmount} reales total!`;
          toast.success(`🎉🎉 DOUBLED! You won ${doubledAmount} reales!`, { duration: 4000 });
          reputationChange = +2; // Bigger reputation boost for risky win
          xpAmount = 4; // Extra XP for risky success
        } else if (action === 'bet_lost') {
          // Player lost the bet
          updateWealth(-wager);
          updateGamblingHistory('lose', wager);

          // Log transaction to ledger
          const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
          const currentWealth = (gameState.wealth || 0) - wager;
          transactionManager.logTransaction(
            'expense',
            TRANSACTION_CATEGORIES.OTHER,
            `Lost ${gameType} gamble with ${npcName}`,
            wager,
            currentWealth,
            gameState.date,
            gameState.time
          );
          console.log(`[Ledger] Logged gambling loss of ${wager} reales from ${gameType}`);

          journalText = `Lost ${wager} reales gambling at ${gameType} with ${npcName}.`;
          toast.error(`Lost ${wager} reales`, { duration: 3000 });
          reputationChange = -1; // Slight reputation hit for losing
          xpAmount = 0;
        } else if (action === 'bet_doubled_lost') {
          // Player lost the double-or-nothing bet (loses initial winnings)
          const lostWinnings = potentialWin - wager;
          // No wealth change since initial win wasn't applied yet
          updateGamblingHistory('lose', lostWinnings);

          journalText = `Tried to double winnings at ${gameType} with ${npcName}, but lost it all. Sometimes greed doesn't pay.`;
          toast.error(`💔 Lost all winnings! Walked away with nothing.`, { duration: 3500 });
          reputationChange = -2; // Bigger reputation hit for greedy loss
          xpAmount = 0;
        } else if (action === 'walk_away') {
          // Declined to gamble
          journalText = `Declined ${npcName}'s invitation to gamble at ${gameType}. Sometimes discretion is the better part of valor.`;
          toast.info(`Played it safe`, { duration: 2000 });
          xpAmount = 0;
        }
        break;
      }

      case 'investment_offer': {
        const { investment } = interaction;
        const { investmentType, amount, expectedReturn, duration, description } = investment;

        // Map investment type to display name
        const investmentTypeNames = {
          church_bond: 'Church Bond',
          cacao_plantation: 'Cacao Plantation Shares',
          apothecary_syndicate: 'Apothecary Supply Syndicate',
          real_estate: 'Real Estate Venture',
          manila_galleon: 'Manila Galleon Trade',
          silver_mining: 'Silver Mining Consortium'
        };
        const investmentDisplayName = investmentTypeNames[investmentType] || investmentType;

        if (action === 'view_details') {
          // Player wants to visit El Consulado to see investment details
          // Change location to El Consulado interior and open TradeModal with investments tab preselected
          journalText = `Agreed to visit El Consulado de Mercaderes with ${npcName} to review the ${investmentDisplayName} opportunity.`;
          toast.info(`Heading to El Consulado with ${npcName}...`, { duration: 3000 });

          // Change location to El Consulado interior
          setCurrentMapId('consulado-interior');
          console.log('[InvestmentOffer] Changed location to consulado-interior');

          // Preselect investments tab for TradeModal
          setPreselectedTradeTab('investments');
          console.log('[InvestmentOffer] Preselected investments tab');

          // Open TradeModal
          setIsBuyOpen(true);
          console.log('[InvestmentOffer] Opened TradeModal with investments tab preselected');

          xpAmount = 1; // Small XP for investigating opportunity
        } else if (action === 'decline' || action === 'maybe_later') {
          // Player declined or deferred the investment opportunity
          const declinedText = action === 'decline'
            ? `Declined ${npcName}'s ${investmentDisplayName} investment opportunity.`
            : `Told ${npcName} you'll consider the ${investmentDisplayName} investment another time.`;

          journalText = declinedText;
          toast.info(action === 'decline' ? 'Investment declined' : 'Maybe another time', { duration: 2000 });
          xpAmount = 0;
        } else {
          // Unknown action
          journalText = `Concluded discussion with ${npcName} about the investment opportunity.`;
          toast.info('Discussion concluded', { duration: 2000 });
          xpAmount = 0;
        }
        break;
      }

      default:
        console.warn('[SimpleInteraction] Unknown interaction type:', type);
        journalText = `Interaction with ${npcName} complete.`;
    }

    // Apply faction-based reputation change
    if (reputationChange !== 0 && npcName) {
      // Look up NPC entity to get their faction
      const npcEntity = entityManager.getByName(npcName);

      if (npcEntity) {
        // Get NPC's casta or faction
        const casta = npcEntity.social?.casta || npcEntity.appearance?.casta;
        const npcFaction = npcEntity.social?.faction;

        // Map casta to faction if no explicit faction set
        let factionToUpdate = null;
        if (npcFaction) {
          factionToUpdate = mapNPCFactionToSystemFaction(npcFaction);
        } else if (casta) {
          // Map common castas to factions
          const castaLower = casta.toLowerCase();
          if (castaLower.includes('indígena') || castaLower.includes('indigenous') || castaLower.includes('indio')) {
            factionToUpdate = 'indigenous';
          } else if (castaLower.includes('español') || castaLower.includes('peninsular')) {
            factionToUpdate = 'elite';
          } else if (castaLower.includes('criollo')) {
            factionToUpdate = 'elite';
          } else if (castaLower.includes('mestizo') || castaLower.includes('mulato')) {
            factionToUpdate = 'commonFolk';
          } else if (castaLower.includes('africano')) {
            factionToUpdate = 'commonFolk';
          }
        }

        if (factionToUpdate) {
          const actionType = type === 'donation_request' ?
            (reputationChange > 0 ? 'charity' : 'refusal') :
            'interaction';
          updateReputation(factionToUpdate, reputationChange, `${actionType} with ${npcName}`);
          console.log(`[SimpleInteraction] Updated ${factionToUpdate} reputation by ${reputationChange}`);
        } else {
          console.warn('[SimpleInteraction] Could not determine faction for NPC:', npcName);
        }
      } else {
        console.warn('[SimpleInteraction] NPC not found in EntityManager:', npcName);
      }
    }

    // Award XP
    awardXP(xpAmount, `simple_interaction_${type}`);

    // Advance time
    advanceTime({ minutes: timeIncrement });

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: journalText
    });

    // Add to conversation history (system message for record keeping)
    setConversationHistory(prev => [...prev, {
      role: 'system',
      content: `*[SIMPLE INTERACTION] ${journalText}*`
    }]);

    // CARD CLEANUP: Remove simple_interaction cards from conversation history
    setConversationHistory(prev => {
      return prev.map(msg => {
        if (msg.role === 'assistant' && msg.card && msg.card.type === 'simple_interaction') {
          const { card, ...msgWithoutCard } = msg;
          console.log('[SimpleInteraction] Removing card from history after completion');
          return msgWithoutCard;
        }
        return msg;
      });
    });

    // Clear the pending interaction
    setPendingSimpleInteraction(null);

    // If dismissal, remove NPC and clear portrait AND refs
    if (isDismissal && npcName) {
      console.log('[SimpleInteraction] Dismissal detected, removing NPC and clearing portrait refs');
      npcTracker.removeNPC(npcName);
      setPrimaryPortraitFile(null);
      // CRITICAL: Clear portrait refs to prevent false continuation detection
      if (recentPortraitRef) recentPortraitRef.current = null;
      if (previousPortraitEntityRef) previousPortraitEntityRef.current = null;
      if (typeof clearConversationLock === 'function') {
        clearConversationLock();
      }
    }

    // Simulate player action text for full narrative turn
    let simulatedAction = '';
    switch (type) {
      case 'service_offer':
        simulatedAction = action === 'buy'
          ? `purchase the ${interaction.offer.item} from ${npcName}`
          : `Not today - send ${npcName} on their way`;
        break;
      case 'donation_request':
        simulatedAction = action === 'donate'
          ? `give ${interaction.request.item} to ${npcName}`
          : `politely decline ${npcName}'s request`;
        break;
      case 'competitive_check':
        if (action === 'show_around') {
          simulatedAction = `show ${npcName} around the workshop`;
        } else if (action === 'refuse_politely') {
          simulatedAction = `politely refuse to show ${npcName} around`;
        } else if (action === 'misdirect') {
          simulatedAction = `attempt to misdirect ${npcName} with false information`;
        } else if (action === 'boast') {
          simulatedAction = `demonstrate my superior skills to ${npcName}`;
        } else {
          simulatedAction = `conclude the visit with ${npcName}`;
        }
        break;
      case 'information_exchange':
        simulatedAction = action === 'pay'
          ? `pay ${npcName} for the information`
          : `decline to pay ${npcName}`;
        break;
      case 'social_visit':
        simulatedAction = `spend time with ${npcName}`;
        break;
      case 'vendor_offer':
        if (action === 'buy') {
          simulatedAction = `purchase the ${interaction.offer.item} from ${npcName}`;
        } else if (action === 'haggle') {
          simulatedAction = `attempt to negotiate a better price with ${npcName}`;
        } else {
          simulatedAction = `politely decline ${npcName}'s offer`;
        }
        break;
      case 'extortion_demand':
        if (action === 'pay') {
          simulatedAction = `pay ${npcName} the demanded ${interaction.extortion.amount} reales`;
        } else if (action === 'refuse') {
          simulatedAction = `refuse ${npcName}'s extortion demands`;
        } else if (action === 'negotiate') {
          simulatedAction = `attempt to negotiate with ${npcName}`;
        } else if (action === 'report') {
          simulatedAction = `report ${npcName} to the authorities`;
        } else {
          simulatedAction = `deal with ${npcName}'s threats`;
        }
        break;
      case 'gamble_opportunity':
        if (action === 'bet_won') {
          simulatedAction = `win at ${interaction.gamble.gameType} against ${npcName}`;
        } else if (action === 'bet_doubled_won') {
          simulatedAction = `risk it all and WIN the double-or-nothing bet at ${interaction.gamble.gameType} with ${npcName}`;
        } else if (action === 'bet_lost') {
          simulatedAction = `lose at ${interaction.gamble.gameType} against ${npcName}`;
        } else if (action === 'bet_doubled_lost') {
          simulatedAction = `try to double my winnings but lose everything at ${interaction.gamble.gameType} with ${npcName}`;
        } else if (action === 'walk_away') {
          simulatedAction = `decline ${npcName}'s gambling invitation`;
        } else {
          simulatedAction = `consider ${npcName}'s gambling offer`;
        }
        break;
      case 'investment_offer':
        if (action === 'view_details') {
          const investmentTypeNames = {
            church_bond: 'Church Bond',
            cacao_plantation: 'Cacao Plantation',
            apothecary_syndicate: 'Apothecary Syndicate',
            real_estate: 'Real Estate',
            manila_galleon: 'Manila Galleon',
            silver_mining: 'Silver Mining'
          };
          const investmentName = investmentTypeNames[interaction.investment?.investmentType] || 'investment';
          simulatedAction = `accompany ${npcName} to El Consulado de Mercaderes to review the ${investmentName} opportunity in detail`;
        } else if (action === 'decline') {
          simulatedAction = `politely decline ${npcName}'s investment offer`;
        } else if (action === 'maybe_later') {
          simulatedAction = `tell ${npcName} I'll consider their investment offer another time`;
        } else {
          simulatedAction = `conclude the discussion with ${npcName}`;
        }
        break;
      default:
        simulatedAction = `interact with ${npcName}`;
    }

    if (npcName) {
      simulatedAction = `${simulatedAction} and see ${npcName} out so they can continue with their day.`;
    }

    console.log('[SimpleInteraction] Triggering full narrative turn with simulated action:', simulatedAction);

    // Trigger full narrative turn with simulated player action
    // CRITICAL: Pass action as second parameter (actionOverride), not first (event)
    setTimeout(() => {
      handleSubmit(null, simulatedAction);
    }, 100);

  }, [
    updateWealth,
    updateInventory,
    updateReputation,
    awardXP,
    advanceTime,
    addJournalEntry,
    turnNumber,
    gameState.date,
    npcTracker,
    setConversationHistory,
    setPendingSimpleInteraction,
    setPrimaryPortraitFile,
    recentPortraitRef,
    previousPortraitEntityRef,
    toast,
    handleSubmit,
    clearConversationLock
  ]);

  /**
   * Handle pursuing a sale inquiry
   * Creates mixing decision context and clears sale inquiry card
   */
  const handlePursueSale = useCallback((inquiry) => {
    console.log('[SaleInquiry] Pursuing sale opportunity:', inquiry);

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[SALE INQUIRY ACCEPTED] Maria decides to craft a remedy for ${inquiry.offeredBy}.*` }
    ]);

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Accepted request from ${inquiry.offeredBy} to create remedy for ${inquiry.ailmentDescription}.`
    });

    // Add customer to medical records (purchase type)
    const customerPatient = {
      id: inquiry.offeredBy,
      name: inquiry.offeredBy,
      age: 'Unknown', // Can be enriched later if needed
      occupation: 'Customer',
      portrait: inquiry.npcPortrait
    };

    const purchaseSession = {
      date: gameState.date,
      turnNumber: turnNumber,
      sessionType: 'purchase',
      ailment: inquiry.ailmentDescription,
      payment: inquiry.paymentOffered,
      prescriptions: [], // Will be filled when sale completes
      outcome: 'Pending', // Changes to 'Completed' when sale finishes
      qaExchanges: [],
      symptoms: [],
      diagnosis: ''
    };

    setGameState(prev => ({
      ...prev,
      medicalRecords: MedicalRecordsManager.addSession(
        prev.medicalRecords,
        customerPatient,
        purchaseSession
      )
    }));

    console.log(`[MedicalRecords] Added ${inquiry.offeredBy} to patient roster as purchase customer`);

    // Create mixing decision context
    const mixingContext = {
      customerName: inquiry.offeredBy,
      customerDescription: inquiry.offeredByDescription,
      patientName: inquiry.patientName,
      patientDescription: inquiry.patientDescription,
      ailmentDescription: inquiry.ailmentDescription,
      paymentOffered: inquiry.paymentOffered,
      npcPortrait: inquiry.npcPortrait
    };

    // Set mixing decision card (replaces sale inquiry card)
    setPendingMixingDecision(mixingContext);

    // Clear sale inquiry card
    if (setPendingSaleInquiry) {
      setPendingSaleInquiry(null);
    }

    toast.info(`Ready to craft remedy for ${inquiry.offeredBy}...`, { duration: 2000 });
  }, [
    setConversationHistory,
    addJournalEntry,
    setPendingMixingDecision,
    setPendingSaleInquiry,
    setGameState,
    turnNumber,
    gameState.date,
    gameState.medicalRecords,
    toast
  ]);

  /**
   * Handle declining a sale inquiry
   * Removes inquiry from state
   */
  const handleDeclineSale = useCallback((inquiry) => {
    console.log('[SaleInquiry] Declined sale opportunity:', inquiry);

    // Log failed transaction attempt
    const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
    const ailmentText = inquiry.ailmentDescription ? ` for ${inquiry.ailmentDescription}` : '';
    transactionManager.logInteractionAttempt(
      TRANSACTION_CATEGORIES.MEDICINE_SALES,
      `${inquiry.offeredBy} requested remedy${ailmentText}`,
      0, // No price negotiated yet
      TRANSACTION_OUTCOMES.REJECTED_BY_PLAYER,
      'Player declined the sale inquiry',
      gameState.date,
      gameState.time
    );

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[SALE INQUIRY DECLINED] Maria politely declined ${inquiry.offeredBy}'s request.*` }
    ]);

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Declined ${inquiry.offeredBy}'s request for a remedy.`
    });

    toast.info('Sale opportunity declined.', { duration: 2000 });

    // Clear the inquiry
    // setPendingSaleInquiry(null); - This will be handled by parent component
  }, [
    setConversationHistory,
    addJournalEntry,
    turnNumber,
    gameState,
    toast
  ]);

  /**
   * Handle opening mixing workshop from mixing decision card
   * Opens workshop modal and clears mixing decision card
   */
  const handleOpenMixingWorkshop = useCallback((mixingContext) => {
    console.log('[MixingDecision] Opening workshop with context:', mixingContext);

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[WORKSHOP OPENED] Maria enters her workshop to craft a remedy for ${mixingContext.ailmentDescription}.*` }
    ]);

    // Store context for sale proposal after mixing completes (Phase 2C)
    if (setMixingContextForSale) {
      setMixingContextForSale(mixingContext);
    }
    console.log('[Phase 2C] Stored mixing context for sale proposal:', mixingContext);

    // Clear mixing decision card
    setPendingMixingDecision(null);

    // Open mixing workshop modal
    setShowMixingPopup(true);

    toast.success('Opening workshop...', { duration: 1500 });
  }, [
    setConversationHistory,
    setMixingContextForSale,
    setPendingMixingDecision,
    setShowMixingPopup,
    toast
  ]);

  /**
   * Handle abandoning mixing decision
   * Clears mixing decision and logs to journal
   */
  const handleAbandonMixing = useCallback((mixingContext) => {
    console.log('[MixingDecision] Abandoning mixing opportunity:', mixingContext);

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[OPPORTUNITY ABANDONED] Maria decides not to craft a remedy for ${mixingContext.customerName}.*` }
    ]);

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Decided not to craft remedy for ${mixingContext.customerName}.`
    });

    // Clear mixing decision card
    setPendingMixingDecision(null);

    toast.info('Opportunity abandoned.', { duration: 2000 });
  }, [
    setConversationHistory,
    addJournalEntry,
    setPendingMixingDecision,
    turnNumber,
    gameState.date,
    toast
  ]);

  /**
   * Handle completing a sale proposal
   * Completes transaction after remedy has been crafted
   */
  const handleCompleteSale = useCallback((saleContext) => {
    console.log('[SaleProposal] Completing sale:', saleContext);

    const { customerName, craftedItem, paymentOffered, finalPrice } = saleContext;

    // Use finalPrice if set (manually edited), otherwise use original paymentOffered
    const actualPrice = finalPrice !== undefined ? finalPrice : paymentOffered;
    const priceWasNegotiated = finalPrice !== undefined && finalPrice !== paymentOffered;

    // If price was negotiated, we'll let the LLM decide acceptance/rejection
    // Otherwise, complete the transaction immediately
    if (!priceWasNegotiated) {
      // Update inventory (remove the crafted item)
      updateInventory(craftedItem.name, -1, 'sold');

      // Update wealth
      updateWealth(actualPrice);

      // Award XP for completing sale
      if (typeof awardXP === 'function') {
        awardXP(2, `remedy_sale_${craftedItem.name}_to_${customerName}`);
      }

      // Update medical records - mark purchase as completed with prescription details
      setGameState(prev => ({
        ...prev,
        medicalRecords: MedicalRecordsManager.updateLatestSession(
          prev.medicalRecords,
          customerName,
          {
            prescriptions: [{ medicine: craftedItem.name, route: 'Sold', dosage: '1 unit' }],
            outcome: 'Completed',
            completedDate: gameState.date
          }
        )
      }));

      console.log(`[MedicalRecords] Updated ${customerName}'s purchase record with ${craftedItem.name}`);

      // Log transaction to ledger (Libro de Cuentas)
      const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
      const currentWealth = (gameState.wealth || 0) + actualPrice; // Calculate new wealth after payment
      transactionManager.logTransaction(
        'income',
        TRANSACTION_CATEGORIES.MEDICINE_SALES,
        `Sold ${craftedItem.name} to ${customerName}`,
        actualPrice,
        currentWealth,
        gameState.date,
        gameState.time
      );
      console.log(`[Ledger] Logged sale of ${craftedItem.name} for ${actualPrice} reales`);

      // Log to conversation history
      setConversationHistory(prev => [...prev,
        { role: 'system', content: `*[SALE COMPLETED] Maria sold ${craftedItem.name} to ${customerName} for ${actualPrice} reales.*` }
      ]);

      // Add journal entry
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: `Crafted and sold ${craftedItem.name} to ${customerName} for ${actualPrice} reales.`
      });

      toast.success(`Sale complete! Earned ${actualPrice} reales.`, { duration: 3000 });
    } else {
      // Price negotiation scenario - don't complete transaction yet
      console.log(`[SaleProposal] Price negotiation: proposing ${actualPrice} reales (was ${paymentOffered} reales)`);
      toast.info(`Proposing ${actualPrice} reales to ${customerName}...`, { duration: 2000 });
    }

    // Clear the sale proposal
    if (setPendingSaleProposal) {
      setPendingSaleProposal(null);
    }

    // Simulate player action for full narrative turn showing the handoff
    // Include price negotiation context if player changed the price
    let simulatedAction;
    if (priceWasNegotiated) {
      simulatedAction = `propose selling the ${craftedItem.name} to ${customerName} for ${actualPrice} reales (originally ${paymentOffered} reales offered) and see if they accept`;
    } else {
      simulatedAction = `hand over the ${craftedItem.name} to ${customerName} and receive ${actualPrice} reales`;
    }

    console.log('[SaleProposal] Triggering full narrative turn for sale completion:', simulatedAction);

    // Trigger full narrative turn to show NPC receiving remedy, their reaction, and departure
    // CRITICAL: Pass action as second parameter (actionOverride), not first (event)
    setTimeout(() => {
      handleSubmit(null, simulatedAction);
    }, 100);
  }, [
    updateInventory,
    updateWealth,
    awardXP,
    setConversationHistory,
    addJournalEntry,
    setPendingSaleProposal,
    setGameState,
    turnNumber,
    gameState.date,
    gameState.medicalRecords,
    toast,
    handleSubmit
  ]);

  /**
   * Handle abandoning a sale proposal
   * Player decides not to sell the crafted remedy
   */
  const handleAbandonSaleProposal = useCallback((saleContext) => {
    console.log('[SaleProposal] Abandoning sale:', saleContext);

    const { customerName, craftedItem } = saleContext;

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[SALE ABANDONED] Maria decided not to sell ${craftedItem.name} to ${customerName}.*` }
    ]);

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Crafted ${craftedItem.name} but decided not to sell to ${customerName}.`
    });

    toast.info('Sale abandoned. Item remains in inventory.', { duration: 2500 });

    // Clear the sale proposal
    if (setPendingSaleProposal) {
      setPendingSaleProposal(null);
    }
  }, [
    setConversationHistory,
    addJournalEntry,
    setPendingSaleProposal,
    turnNumber,
    gameState.date,
    toast
  ]);

  /**
   * Handle proposing action from action prompt card
   * Processes give/sell/prescribe actions with drag-dropped items
   */
  const handleProposeAction = useCallback(async (proposalData) => {
    const { type, recipientName, item, amount, price, ailmentDescription, npcId, route, includeBloodletting, bloodAmount } = proposalData;

    console.log('[ActionPrompt] Proposing action:', { type, recipientName, item: item.name, amount, price, route, includeBloodletting, bloodAmount });

    // For prescribe type, trigger a full narrative turn
    if (type === 'prescribe') {
      const bloodlettingNote = includeBloodletting
        ? ` Maria also recommends bloodletting (drawing ${bloodAmount} ounces of blood) to restore humoral balance.`
        : '';

      // Format prescription as clean statement (capitalize properly)
      const recipientNameCapitalized = recipientName.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');

      // Fallback for ailment description
      const ailmentText = ailmentDescription || 'ailment';

      // Create clean prescription statement (what player sees in Chronicle)
      const cleanStatement = `Maria de Lima offers ${recipientNameCapitalized} a prescription for their ${ailmentText}: ${amount} ${amount === 1 ? 'drachm' : 'drachms'} of ${item.name} (${route}), price ${price} reales.${bloodlettingNote}`;

      // Create full prompt with instructions (what LLM sees to guide behavior)
      const llmInstructions = `
Describe ${recipientNameCapitalized}'s reaction to this prescription offer in 2-3 sentences. Show their physical response and decision.

## CRITICAL: Treatment Appropriateness Check
**BEFORE accepting, check if the treatment makes sense for the ailment:**

### Common Nonsensical Prescriptions (MUST DECLINE with anger):
- **Enemas for external injuries** (burns, cuts, bruises, skin rashes)
- **Topical treatments for internal issues** (fever, stomach pain, breathing problems)
- **Bloodletting for blood loss** (wounds, nosebleeds, menstruation)
- **Stimulants for insomnia** (pepper, cinnamon for sleep issues)
- **Cooling herbs for chills** (mint, cucumber for cold/shivering)
- **Hot spices for fever** (pepper, ginger for burning fever)
- **Wrong body part** (eye salve for foot injury, ear drops for headache)

**Current prescription:** ${amount} drachm(s) of ${item.name} via **${route}** for **${ailmentText}**

### Decision Logic:
1. **DECLINE IMMEDIATELY** (80% chance) if treatment is nonsensical:
   - NPC gets angry, confused, or disgusted
   - They question Maria's competence
   - They may threaten to report her to authorities or spread bad rumors
   - They leave WITHOUT paying
   - Example: "Pepper in my backside for a BURN?! Are you mad, woman? I'll tell everyone at the plaza about this mockery!"
   - **CRITICAL**: Set simpleInteraction.outcome = "declined_angry" or "declined_confused"
   - **CRITICAL**: Set simpleInteraction.reputationChange = -3 to -10 (severe nonsense = bigger penalty)
   - **CRITICAL**: Set npcDeparted = true (they storm out)

2. **BARGAIN** (15% chance) if treatment seems odd but price is too high:
   - NPC is skeptical but desperate enough to negotiate
   - They question why it's so expensive
   - Set simpleInteraction.outcome = "bargaining"
   - No reputation change yet

3. **ACCEPT** (5% chance) only if BOTH conditions met:
   - Treatment is appropriate AND sensible for the ailment
   - Price is reasonable OR patient is desperate enough to pay
   - Set simpleInteraction.outcome = "accepted" or "accepted_with_doubt"
   - Set simpleInteraction.reputationChange = +1 to +3 (good treatment = small boost)

## Context:
- ${price} reales is ${price > 50 ? 'extremely expensive (several months of wages for a common laborer)' : price > 20 ? 'moderately expensive (2-3 weeks of wages)' : 'affordable (a few days of wages)'} for ${recipientName.includes('Don') || recipientName.includes('Doña') ? 'a wealthy patron' : 'a common person (note: sailors earn ~80-100 reales/month)'}.
- ${recipientNameCapitalized} is a realistic 1680s person who expects treatments they've heard of or understand
- Make their reaction dramatic and realistic - confusion, anger, or walking out in disgust are NORMAL responses to bad medicine`;

      setPendingActionPrompt(null);

      await handleSubmit(null, cleanStatement, {
        llmInstructions, // Pass instructions separately so they don't appear in Chronicle
        actionResultType: 'prescription_offer',
        pendingPrescription: {
          recipientName,
          npcId,
          item,
          amount,
          price,
          route,
          includeBloodletting,
          bloodAmount,
          ailmentDescription
        }
      });

      return;
    }

    if (type !== 'sell' && type !== 'give') {
      console.warn('[ActionPrompt] Unsupported action type:', type);
      return;
    }

    let outcome;
    try {
      // Get recent narrative for context
      const recentNarrative = conversationHistory
        .slice(-2)
        .filter(msg => msg.role === 'assistant' && msg.content)
        .map(msg => msg.content)
        .join('\n\n');

      const systemPrompt = buildGiveSellOutcomePrompt({
        type,
        recipientName,
        item,
        amount,
        price,
        ailmentDescription,
        recentNarrative,
        location: gameState?.location || 'Mexico City'
      });
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Determine the realistic outcome. Reply with JSON only.' }
      ];
      const response = await createChatCompletion(messages, 0.5, 500); // Increased temp for variety, tokens for longer response
      const rawText = response?.choices?.[0]?.message?.content || response;
      outcome = parseGiveSellOutcome(rawText, type, price);
      console.log('[ActionPrompt] Give/Sell evaluation outcome:', outcome);
    } catch (error) {
      console.error('[ActionPrompt] LLM evaluation failed:', error);
      toast.error('The interaction stalled; please try again.', { duration: 3000 });
      return;
    }

    const { accepted, decision, finalPrice, narrative, reason, forwardMomentum } = outcome;
    const primarySystemTag = (() => {
      if (accepted) {
        if (type === 'sell') {
          return `*[ITEM SOLD] Maria sells ${amount}× ${item.name} to ${recipientName} for ${finalPrice || price || 0} reales.*`;
        }
        return `*[ITEM GIVEN] Maria gives ${amount}× ${item.name} to ${recipientName}.*`;
      }
      if (decision === 'counter') {
        return `*[OFFER COUNTERED] ${recipientName} is not satisfied with the terms and proposes a change.*`;
      }
      return `*[OFFER DECLINED] ${recipientName} refuses the ${item.name}.*`;
    })();
    const systemSummary = (() => {
      if (decision === 'counter' && type === 'sell') {
        const counterText = finalPrice > 0
          ? `${recipientName} counters with ${finalPrice} reales.`
          : `${recipientName} counters and asks for different terms.`;
        return `*${counterText}${reason ? ` (${reason})` : ''}*`;
      }
      const base = reason || (accepted ? `${recipientName} accepts the offer.` : `${recipientName} declines.`);
      return `*${base}*`;
    })();

    // Append forward momentum question to narrative if NPC departed
    const fullNarrative = forwardMomentum
      ? `${narrative}\n\n${forwardMomentum}`
      : narrative;

    setConversationHistory(prev => [
      ...prev,
      { role: 'system', content: primarySystemTag },
      { role: 'assistant', content: fullNarrative },
      { role: 'system', content: systemSummary }
    ]);
    setHistoryOutput(fullNarrative);

    if (!accepted) {
      const journalDecline = (() => {
        if (type === 'sell') {
          if (decision === 'counter') {
            return `Proposed selling ${amount}× ${item.name} to ${recipientName} for ${price} reales; they countered with ${finalPrice} reales. ${reason || ''}`.trim();
          }
          return `Attempted to sell ${amount}× ${item.name} to ${recipientName}, but they refused. ${reason || ''}`.trim();
        }
        return `Attempted to give ${amount}× ${item.name} to ${recipientName}, but they did not accept. ${reason || ''}`.trim();
      })();

      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: journalDecline
      });

      if (decision === 'counter' && type === 'sell') {
        toast.info(`${recipientName} proposes ${finalPrice} reales instead.`, { duration: 3500 });
        return; // Keep prompt open for player to respond
      }

      setPendingActionPrompt(null);
      toast.warning(reason ? reason : `${recipientName} declines.`, { duration: 2500 });
      return;
    }

    updateInventory(item.name, -amount, type === 'sell' ? 'sold' : 'gift');

    let actualPrice = type === 'sell' ? (finalPrice || price || 0) : 0;
    if (type === 'sell' && actualPrice < 0) {
      actualPrice = 0;
    }

    if (type === 'sell' && actualPrice > 0) {
      updateWealth(actualPrice);

      const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
      const currentWealth = (gameState.wealth || 0) + actualPrice;
      const description = `Sold ${amount}× ${item.name} to ${recipientName}`;
      transactionManager.logTransaction(
        'income',
        TRANSACTION_CATEGORIES.MEDICINE_SALES,
        description,
        actualPrice,
        currentWealth,
        gameState.date,
        gameState.time
      );
      console.log('[ActionPrompt] Transaction logged to ledger');
    }

    if (type === 'sell' && recipientName) {
      let npcEntity = npcId ? entityManager.getById(npcId) : entityManager.getByName(recipientName);
      if (!npcEntity) {
        const recentNPCs = npcTracker.getRecentNPCs();
        const matchedName = recentNPCs.find(name => name.toLowerCase() === recipientName.toLowerCase());
        if (matchedName) {
          npcEntity = entityManager.getByName(matchedName);
        }
      }
      if (!npcEntity) {
        console.warn(`[ActionPrompt] NPC entity not found for ${recipientName}, creating minimal record`);
        npcEntity = {
          id: `npc_${recipientName.replace(/\s+/g, '_').toLowerCase()}`,
          name: recipientName,
          entityType: 'npc'
        };
      }

      const sessionData = {
        date: gameState.date,
        turnNumber,
        sessionType: 'purchase',
        prescriptions: [{
          medicine: item.name,
          route: 'N/A',
          dosage: `${amount} ${amount === 1 ? 'drachm' : 'drachms'}`,
          price: actualPrice
        }],
        outcome: 'Completed',
        payment: actualPrice,
        ailment: ailmentDescription || 'Medicine purchase'
      };

      setGameState(prev => ({
        ...prev,
        medicalRecords: MedicalRecordsManager.addSession(
          prev.medicalRecords || {},
          npcEntity,
          sessionData
        )
      }));

      console.log(`[ActionPrompt] Added ${recipientName} to patient roster (purchase session)`);
    }

    const journalEntry = type === 'sell'
      ? `Sold ${amount}× ${item.name} to ${recipientName} for ${actualPrice} reales.`
      : `Gave ${amount}× ${item.name} to ${recipientName}.`;

    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: journalEntry
    });

    setPendingActionPrompt(null);

    if (type === 'sell') {
      toast.success(`Sold ${item.name} for ${actualPrice} reales`, { duration: 2500 });
    } else {
      toast.success(`${recipientName} accepts the gift`, { duration: 2500 });
    }
  }, [
    updateInventory,
    updateWealth,
    setConversationHistory,
    setHistoryOutput,
    addJournalEntry,
    setPendingActionPrompt,
    turnNumber,
    gameState,
    npcTracker,
    setGameState,
    toast,
    handleSubmit
  ]);

  /**
   * Handle declining action prompt
   * Just clears the prompt and logs to history
   */
  const handleDeclineAction = useCallback((actionPrompt = null) => {
    console.log('[ActionPrompt] Action declined', actionPrompt);

    // Log failed transaction attempt
    if (actionPrompt) {
      const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
      const itemsText = actionPrompt.suggestedItems && actionPrompt.suggestedItems.length > 0
        ? ` (suggested: ${actionPrompt.suggestedItems.join(', ')})`
        : '';
      const ailmentText = actionPrompt.ailmentDescription ? ` for ${actionPrompt.ailmentDescription}` : '';

      transactionManager.logInteractionAttempt(
        actionPrompt.type === 'prescribe' ? TRANSACTION_CATEGORIES.MEDICINE_SALES : TRANSACTION_CATEGORIES.OTHER,
        `${actionPrompt.recipientName} requested ${actionPrompt.type}${ailmentText}${itemsText}`,
        actionPrompt.priceOffered || 0,
        TRANSACTION_OUTCOMES.DECLINED_OFFER,
        'Player declined the request',
        gameState.date,
        gameState.time
      );
    }

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[ACTION DECLINED] Maria decides not to proceed with the request.*` }
    ]);

    // Clear the action prompt
    setPendingActionPrompt(null);

    toast.info('Request declined', { duration: 2000 });
  }, [
    setConversationHistory,
    setPendingActionPrompt,
    toast,
    gameState
  ]);

  return {
    handleAcceptSale,
    handleAcceptTrade,
    handleDeclineTrade,
    handleSimpleInteractionChoice,
    handlePursueSale,
    handleDeclineSale,
    handleOpenMixingWorkshop,
    handleAbandonMixing,
    handleCompleteSale,
    handleAbandonSaleProposal,
    handleProposeAction,
    handleDeclineAction,
  };
}
