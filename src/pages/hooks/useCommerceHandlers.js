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
import { getTransactionManager, TRANSACTION_CATEGORIES } from '../../core/systems/transactionManager';

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
 * Custom hook for commerce/trade handlers
 * Manages sales, trades, and simple NPC interactions
 *
 * @param {Object} params - Hook parameters
 * @param {Function} params.addJournalEntry - Journal entry adder
 * @param {Function} params.setConversationHistory - Conversation history setter
 * @param {Function} params.toast - Toast notification function
 * @param {Function} params.awardXP - Award XP function
 * @param {Function} params.updateReputation - Update faction reputation
 * @param {Function} params.advanceTime - Time advancement function
 * @param {Function} params.setTradingNPC - Set trading NPC
 * @param {Function} params.setTradeMode - Set trade mode
 * @param {Function} params.setIsBuyOpen - Open buy/trade modal
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
 *
 * @returns {Object} Commerce handlers
 */
export function useCommerceHandlers({
  addJournalEntry,
  setConversationHistory,
  toast,
  awardXP,
  updateReputation,
  advanceTime,
  setTradingNPC,
  setTradeMode,
  setIsBuyOpen,
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
    toast
  ]);

  /**
   * Handle simple interaction choices
   * Processes service offers, donations, competitive checks, info exchange, social visits
   * This is the largest commerce handler
   */
  const handleSimpleInteractionChoice = useCallback(async (action, interaction) => {
    console.log('[SimpleInteraction] Player chose:', action, interaction);

    const { type, npcName } = interaction;

    // Detect if this is a dismissal action (NPC should be removed from tracking)
    const isDismissal = ['refuse', 'decline', 'not_now', 'not_today', 'no_thanks'].includes(action.toLowerCase());

    // Determine time increment based on interaction type
    const timeIncrements = {
      service_offer: 5,
      donation_request: 5,
      competitive_check: 10,
      information_exchange: 5,
      social_visit: 15
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
        } else {
          journalText = `Declined to purchase ${item} from ${npcName}.`;
          toast.info('Purchase declined', { duration: 1500 });
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
        const { targetItem, offeredPrice, actualValue } = interaction.competitive;
        if (action === 'sell_lowball') {
          // Sell at lowball price
          updateInventory(targetItem, -1, `sold to ${npcName}`);
          updateWealth(offeredPrice);
          reputationChange = -2; // Slight reputation hit for appearing desperate
          journalText = `Sold ${targetItem} to ${npcName} for ${offeredPrice} reales (below market value).`;
          toast.warning(`Sold for ${offeredPrice} reales. Market value was ${actualValue}`, { duration: 3000 });
        } else if (action === 'demand_fair') {
          // Demand fair price - competitive check passed
          updateInventory(targetItem, -1, `sold to ${npcName}`);
          updateWealth(actualValue);
          reputationChange = +3; // Reputation boost for standing firm
          xpAmount = 2; // Extra XP for good business sense
          journalText = `Refused lowball offer and sold ${targetItem} to ${npcName} for fair price (${actualValue} reales).`;
          toast.success(`Sold for fair price: ${actualValue} reales! +3 reputation`, { duration: 3000 });
        } else {
          // Dismiss the rival
          reputationChange = +1; // Small reputation boost for refusing to engage
          journalText = `Dismissed ${npcName}'s attempt to undercut prices.`;
          toast.info('Dismissed rival apothecary', { duration: 2000 });
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

          // Generate follow-up narrative revealing the information
          // This is a CRITICAL fix - information_exchange needs continuation narrative
          const shouldGenerateNarrative = true;
          if (shouldGenerateNarrative) {
            console.log('[SimpleInteraction] Information accepted - will generate follow-up narrative');
          }
        } else {
          journalText = `Refused to pay ${npcName} for information about ${topic}.`;
          toast.info('Declined information', { duration: 1500 });
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
        if (action === 'view_items') {
          // Open TradeModal with vendor's inventory
          console.log('[VendorOffer] Opening TradeModal for:', npcName);

          setTradingNPC({
            npcName: npcName,
            npcId: npcName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            npcPortrait: interaction.npcPortrait || null
          });
          setTradeMode('market');
          openModal('trade');

          // Clear simple interaction after opening modal
          setPendingSimpleInteraction(null);

          // No journal entry or time increment for just viewing items
          // Time will increment when player actually purchases
          return; // Early return - don't process further
        } else {
          // Refused to view items
          journalText = `Declined ${npcName}'s offer to view their goods.`;
          toast.info('Offer declined', { duration: 1500 });
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
        if (action === 'sell_lowball') {
          simulatedAction = `accept ${npcName}'s lowball offer`;
        } else if (action === 'demand_fair') {
          simulatedAction = `demand a fair price from ${npcName}`;
        } else {
          simulatedAction = `Not today - send ${npcName} on their way`;
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
        // Note: 'view_items' returns early, so this only handles refusal
        simulatedAction = `politely decline ${npcName}'s offer to view their goods`;
        break;
      default:
        simulatedAction = `interact with ${npcName}`;
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
    handleSubmit
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
    setPendingSaleInquiry(null);

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
    gameState.date,
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
    setMixingContextForSale(mixingContext);
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
    setPendingSaleProposal(null);

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
    setPendingSaleProposal(null);
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
    const { type, recipientName, item, amount, price, ailmentDescription, npcId } = proposalData;

    console.log('[ActionPrompt] Proposing action:', { type, recipientName, item: item.name, amount, price });

    // Remove item from inventory
    updateInventory(item.name, -amount);

    // For sell type, add money to wealth
    if (type === 'sell' && price > 0) {
      updateWealth(price);
    }

    // Log transaction to ledger (Libro de Cuentas)
    if (type === 'sell' && price > 0) {
      const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
      const currentWealth = (gameState.wealth || 0) + price; // Wealth AFTER transaction
      transactionManager.logTransaction(
        'income',
        TRANSACTION_CATEGORIES.MEDICINE_SALES,
        `Sold ${amount}× ${item.name} to ${recipientName}`,
        price,
        currentWealth,
        gameState.date,
        gameState.time
      );
      console.log('[ActionPrompt] Transaction logged to ledger');
    }

    // Add to medical records (Patient Roster) for sell/prescribe types
    if ((type === 'sell' || type === 'prescribe') && recipientName) {
      // Get NPC entity from entityManager
      let npcEntity = npcId ? entityManager.getById(npcId) : entityManager.getByName(recipientName);

      // If not found, search recent NPCs
      if (!npcEntity) {
        const recentNPCs = npcTracker.getRecentNPCs();
        const matchedName = recentNPCs.find(name => name.toLowerCase() === recipientName.toLowerCase());
        if (matchedName) {
          npcEntity = entityManager.getByName(matchedName);
        }
      }

      // If still not found, create minimal patient record
      if (!npcEntity) {
        console.warn(`[ActionPrompt] NPC entity not found for ${recipientName}, creating minimal record`);
        npcEntity = {
          id: `npc_${recipientName.replace(/\s+/g, '_').toLowerCase()}`,
          name: recipientName,
          entityType: 'npc'
        };
      }

      // Add session to medical records
      const sessionData = {
        date: gameState.date,
        turnNumber: turnNumber,
        sessionType: 'purchase', // Purchase type (not examination)
        prescriptions: [{
          medicine: item.name,
          route: type === 'prescribe' ? 'Oral' : 'N/A', // Default route for prescriptions
          dosage: `${amount} ${amount === 1 ? 'drachm' : 'drachms'}`,
          price: type === 'sell' ? price : 0
        }],
        outcome: 'Completed', // Mark as completed immediately
        payment: type === 'sell' ? price : 0,
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

    // Log to conversation history based on type
    const actions = {
      give: `*[ITEM GIVEN] Maria gives ${amount}× ${item.name} to ${recipientName} as a gift.*`,
      sell: `*[ITEM SOLD] Maria sells ${amount}× ${item.name} to ${recipientName} for ${price} reales.*`,
      prescribe: `*[PRESCRIPTION GIVEN] Maria prescribes ${amount}× ${item.name} to ${recipientName} for ${ailmentDescription}.*`
    };

    setConversationHistory(prev => [...prev,
      { role: 'system', content: actions[type] || actions.give }
    ]);

    // Add journal entry
    const journalEntries = {
      give: `Gave ${amount}× ${item.name} to ${recipientName}.`,
      sell: `Sold ${amount}× ${item.name} to ${recipientName} for ${price} reales.`,
      prescribe: `Prescribed ${amount}× ${item.name} to ${recipientName} for ${ailmentDescription}.`
    };

    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: journalEntries[type] || journalEntries.give
    });

    // Clear the action prompt
    setPendingActionPrompt(null);

    // Toast notification
    const toastMessages = {
      give: `Gave ${item.name} to ${recipientName}`,
      sell: `Sold ${item.name} for ${price} reales`,
      prescribe: `Prescribed ${item.name} for ${ailmentDescription}`
    };

    toast.success(toastMessages[type] || toastMessages.give, { duration: 2000 });

    // Trigger LLM narration describing the result
    // Pass action type as metadata so NarrativePanel can style it
    const followUpPrompts = {
      give: `[You just gave ${amount}× ${item.name} to ${recipientName} as a gift. Describe their reaction and what happens next in 2-3 sentences.]`,
      sell: `[You just sold ${amount}× ${item.name} to ${recipientName} for ${price} reales. Describe the transaction completion and their reaction in 2-3 sentences.]`,
      prescribe: `[You just prescribed ${amount}× ${item.name} to ${recipientName} for their ${ailmentDescription}. Describe how they receive the prescription and what happens next in 2-3 sentences.]`
    };

    // Call handleSubmit with null event, prompt as actionOverride, and options with metadata
    await handleSubmit(null, followUpPrompts[type] || followUpPrompts.give, {
      actionResultType: type // Metadata for styling
    });
  }, [
    updateInventory,
    updateWealth,
    setConversationHistory,
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
  const handleDeclineAction = useCallback(() => {
    console.log('[ActionPrompt] Action declined');

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
    toast
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
