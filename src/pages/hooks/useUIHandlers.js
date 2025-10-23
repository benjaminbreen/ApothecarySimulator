// useUIHandlers.js
// Handles all UI interaction logic (modals, toggles, commands, actions)
// Extracted from useGameHandlers.js (Phase 2.5)

import { useCallback } from 'react';

/**
 * Custom hook for UI handlers
 * Manages modal toggles, PDF clicks, portrait clicks, commands, and actions
 *
 * @param {Object} params - Hook parameters
 * @param {Function} params.setIsJournalOpen - Journal modal toggle
 * @param {Function} params.setIsInventoryOpen - Inventory modal toggle
 * @param {Function} params.setIsHistoryOpen - History modal toggle
 * @param {Function} params.setIsAboutOpen - About modal toggle
 * @param {Function} params.setIsMapOpen - Map modal toggle
 * @param {Function} params.setIsDiagnoseOpen - Diagnose modal toggle
 * @param {Function} params.setShowMixingPopup - Mixing popup toggle
 * @param {Function} params.setSelectedPDF - PDF selection setter
 * @param {Function} params.setSelectedCitation - Citation selection setter
 * @param {Function} params.setIsPdfOpen - PDF modal toggle
 * @param {Function} params.setSelectedPatient - Patient selection setter
 * @param {Function} params.setShowPatientModal - Patient modal toggle
 * @param {Function} params.setSelectedNPC - NPC selection setter
 * @param {Function} params.setShowNPCModal - NPC modal toggle
 * @param {Function} params.setUserInput - User input setter
 * @param {Function} params.setIsBuyOpen - Buy modal toggle
 * @param {Function} params.setIsRestDurationOpen - Rest modal toggle
 * @param {Function} params.setIsEatOpen - Eat modal toggle
 * @param {Function} params.setIsForageOpen - Forage modal toggle
 * @param {Function} params.setIsPatientRosterOpen - Patient roster modal toggle
 * @param {Function} params.setTradingNPC - Trading NPC setter
 * @param {Function} params.setTradeMode - Trade mode setter
 * @param {Function} params.setIsLedgerOpen - Ledger modal toggle
 * @param {Function} params.setSelectedNpcName - NPC name setter
 * @param {Function} params.setShowSymptomsPopup - Symptoms popup toggle
 * @param {Function} params.setCurrentPatient - Current patient setter
 * @param {Function} params.setIsPrescribing - Prescribing state setter
 * @param {Function} params.setIsPrescribePopupOpen - Prescribe popup toggle
 * @param {Function} params.setNPCPosition - NPC position setter
 * @param {Function} params.setIsModernInventoryOpen - Modern inventory toggle
 * @param {Function} params.setActiveTab - Active tab setter
 * @param {Function} params.setHistoryOutput - History output setter
 * @param {Function} params.setIsLoading - Loading state setter
 * @param {Function} params.toast - Toast notification function
 * @param {Object} params.gameState - Game state object
 * @param {Object} params.npcTracker - NPC tracker
 * @param {Array} params.npcPositions - NPC positions array
 *
 * @returns {Object} UI handlers
 */
export function useUIHandlers({
  setIsJournalOpen,
  setIsInventoryOpen,
  setIsHistoryOpen,
  setIsAboutOpen,
  setIsMapOpen,
  setIsDiagnoseOpen,
  setShowMixingPopup,
  toggleModal, // Modal context toggle function
  setSelectedPDF,
  setSelectedCitation,
  setIsPdfOpen,
  setSelectedPatient,
  setShowPatientModal,
  setSelectedNPC,
  setShowNPCModal,
  setUserInput,
  setIsBuyOpen,
  setIsRestDurationOpen,
  setIsEatOpen,
  setIsForageOpen,
  setIsPatientRosterOpen,
  setTradingNPC,
  setTradeMode,
  setIsLedgerOpen,
  setSelectedNpcName,
  setShowSymptomsPopup,
  setCurrentPatient,
  setIsPrescribing,
  setIsPrescribePopupOpen,
  setNPCPosition,
  setIsModernInventoryOpen,
  setActiveTab,
  setHistoryOutput,
  setIsLoading,
  toast,
  // Legacy params
  gameState,
  npcTracker,
  npcPositions,
}) {
  /**
   * Helper: Fuzzy match for NPC name matching
   */
  const fuzzyMatch = (input, target) => {
    if (!input || !target) return false;
    return target.toLowerCase().includes(input.toLowerCase());
  };

  /**
   * Toggle modals
   */
  const toggleJournal = () => setIsJournalOpen(prev => !prev);
  const toggleInventory = () => setIsInventoryOpen(prev => !prev);
  const toggleHistory = () => setIsHistoryOpen(prev => !prev);
  const toggleAbout = () => setIsAboutOpen(prev => !prev);
  const toggleMap = () => setIsMapOpen(prev => !prev);
  const toggleDiagnose = () => setIsDiagnoseOpen(prev => !prev);
  const toggleMixingPopup = () => toggleModal('mixing'); // Fixed: use modal context toggle

  /**
   * Handle PDF click
   * Opens PDF viewer modal with selected PDF and citation
   */
  const handlePDFClick = useCallback((pdfPath, citation) => {
    setSelectedPDF(pdfPath);
    setSelectedCitation(citation);
    setIsPdfOpen(true);
  }, [setSelectedPDF, setSelectedCitation, setIsPdfOpen]);

  /**
   * Close PDF popup
   * Closes PDF viewer and clears selection
   */
  const closePdfPopup = () => {
    setIsPdfOpen(false);
    setSelectedPDF(null);
    setSelectedCitation(null);
  };

  /**
   * Handle portrait click
   * Opens patient or NPC modal based on entity type
   */
  const handlePortraitClick = useCallback((npcData) => {
    if (!npcData) return;

    console.log('[Portrait Click] NPC Data:', npcData);

    if (npcData.type === 'patient') {
      setSelectedPatient(npcData);
      setShowPatientModal(true);
    } else {
      console.log('[Portrait Click] Non-patient NPC clicked:', npcData.name);
      setSelectedNPC(npcData);
      setShowNPCModal(true);
    }
  }, [setSelectedPatient, setShowPatientModal, setSelectedNPC, setShowNPCModal]);

  /**
   * Handle quick action
   * Sets user input to the action text
   */
  const handleQuickAction = (action) => {
    setUserInput(action);
  };

  /**
   * Handle action click
   * Processes action button clicks (commands and secondary actions)
   */
  const handleActionClick = (action) => {
    if (action.startsWith('#')) {
      const commandType = action.split(' ')[0].toLowerCase();

      switch (commandType) {
        case '#mix':
          setShowMixingPopup(true);
          break;
        case '#buy':
          setIsBuyOpen(true);
          break;
        case '#sleep':
          setIsRestDurationOpen(true);
          break;
        case '#eat':
          setIsEatOpen(true);
          break;
        case '#forage':
          setIsForageOpen(true);
          break;
        // NOTE: #hangsign and #removesign removed - now handled as direct button actions in ContextPanel
        case '#prescribe':
        case '#symptoms':
        case '#diagnose':
          setUserInput(action);
          break;
        default:
          setUserInput(action);
          break;
      }
    } else {
      // Handle non-command actions (from ActionPanel secondary buttons)
      switch (action) {
        case 'roster':
          setIsPatientRosterOpen(true);
          break;
        case 'rest':
          setIsRestDurationOpen(true);
          break;
        case 'bargain': {
          // Context-aware trading: detect if at market, with NPC, or viewing full inventory
          const location = gameState?.location || '';
          const locationLower = location.toLowerCase();

          // Check if location is a market
          const marketKeywords = ['market', 'tianguis', 'plaza', 'mercado', 'bazaar', 'trade'];
          const isAtMarket = marketKeywords.some(keyword => locationLower.includes(keyword));

          // Get recent NPCs to check if we're interacting with someone
          const recentNPCs = npcTracker.getRecentNPCs();
          const recentNPC = recentNPCs.length > 0 ? recentNPCs[recentNPCs.length - 1] : null;

          // Check if there's a trade opportunity for this NPC
          const tradeOpportunity = gameState.tradeOpportunities?.find(
            opp => opp.npcName === recentNPC
          );

          if (tradeOpportunity) {
            // If there's an active trade opportunity, use NPC mode with that opportunity
            console.log('[Trade] Opening trade with NPC from opportunity:', tradeOpportunity.npcName);
            setTradingNPC(tradeOpportunity);
            setTradeMode('npc');
          } else if (recentNPC && !isAtMarket) {
            // If interacting with NPC but not at market, use NPC trade mode
            console.log('[Trade] Opening trade with recent NPC:', recentNPC);
            setTradingNPC({
              npcName: recentNPC,
              type: 'both', // Allow both buying and selling
              interest: { items: [], reason: 'General trade', urgency: 'moderate', priceMultiplier: 1.0 },
              offering: { items: [] }
            });
            setTradeMode('npc');
          } else if (isAtMarket) {
            // If at a market, use market mode
            console.log('[Trade] Opening market trade at:', location);
            setTradeMode('market');
          } else {
            // Default: Full inventory mode (no market, no NPC)
            console.log('[Trade] Opening full inventory mode');
            setTradeMode('inventory');
          }

          setIsBuyOpen(true);
          break;
        }
        case 'accounts':
          setIsLedgerOpen(true);
          break;
        default:
          setUserInput(action);
          break;
      }
    }
  };

  /**
   * Handle command click
   * Processes command buttons (#buy, #symptoms, #prescribe, #diagnose, #sleep, #eat, #forage, #mix)
   */
  const handleCommandClick = (command) => {
    const commandParts = command.split(' ');
    const commandType = commandParts[0].toLowerCase();
    const targetName = commandParts.slice(1).join(' ');
    let npcName;

    // Get most recent NPC from tracker if no explicit name provided
    if (commandType !== '#sleep') {
      const recentNPCs = npcTracker.getRecentNPCs();
      npcName = recentNPCs.length > 0 ? recentNPCs[recentNPCs.length - 1] : null;
    }

    // Try fuzzy matching for NPC name
    const getMatchedNPC = (name) => {
      const EntityList = require('../../EntityList').default;
      return EntityList.find(entity => fuzzyMatch(name, entity.name));
    };

    switch (commandType) {
      case '#buy':
        setIsBuyOpen(true);
        setUserInput('');
        setIsLoading(false);
        toggleInventory();
        break;

      case '#symptoms':
        let matchedNPC = getMatchedNPC(npcName);
        if (matchedNPC) {
          setSelectedNpcName(matchedNPC.name);
          setShowSymptomsPopup(true);

          const npcId = matchedNPC.id || matchedNPC.name;
          const npcPos = npcPositions.find(npc => npc.npcId === npcId);
          if (npcPos) {
            setNPCPosition(npcId, matchedNPC.name, npcPos.position, 'interacting');
          }
        } else {
          setHistoryOutput('No NPC is currently selected.');
        }
        break;

      case '#prescribe':
        let targetNPC = getMatchedNPC(targetName || npcName);
        if (targetNPC) {
          setCurrentPatient(targetNPC);
          setIsPrescribing(true);
          setIsInventoryOpen(true);
          setIsPrescribePopupOpen(true);

          const npcId = targetNPC.id || targetNPC.name;
          const npcPos = npcPositions.find(npc => npc.npcId === npcId);
          if (npcPos) {
            setNPCPosition(npcId, targetNPC.name, npcPos.position, 'interacting');
          }
        } else {
          setHistoryOutput('No valid NPC found for prescription. Make sure an NPC is present in the current scene or specify a valid NPC name.');
        }
        break;

      case '#diagnose':
        setIsDiagnoseOpen(true);
        break;

      case '#sleep':
        setIsRestDurationOpen(true);
        break;

      case '#eat':
        setIsEatOpen(true);
        break;

      case '#forage':
        setIsForageOpen(true);
        break;

      case '#mix':
        toggleMixingPopup();
        break;

      case '#inventory':
        setIsModernInventoryOpen(true);
        break;

      case 'see patients':
        const EntityList = require('../../EntityList').default;
        const patients = EntityList.filter(npc => npc.type === 'patient');

        if (patients.length > 0) {
          setSelectedPatient(patients[0]);
          setShowPatientModal(true);
          console.log(`[See Patients] Opening patient modal for: ${patients[0].name}`);
        } else {
          setHistoryOutput('No patients are currently waiting to see you. Try asking around or going to the market.');
        }
        break;

      default:
        break;
    }
  };

  /**
   * Handle save game
   * Shows success toast (actual save logic to be implemented)
   */
  const handleSaveGame = () => {
    toast.success('Game saved successfully!');
    // Add actual save logic here
  };

  /**
   * Handle tab change
   * Changes active tab in central panel
   */
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  return {
    toggleJournal,
    toggleInventory,
    toggleHistory,
    toggleAbout,
    toggleMap,
    toggleDiagnose,
    toggleMixingPopup,
    handlePDFClick,
    closePdfPopup,
    handlePortraitClick,
    handleQuickAction,
    handleActionClick,
    handleCommandClick,
    handleSaveGame,
    handleTabChange,
  };
}
