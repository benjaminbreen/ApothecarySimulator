// useGameHandlers.js
// Main orchestrator hook for GamePage - coordinates specialized handler hooks
//
// REFACTORING COMPLETE (Phase 2.7):
// This hook now serves as a thin orchestrator, delegating to specialized hooks:
//   - useNavigationHandlers: Movement, map, travel, interior navigation
//   - useMedicalHandlers: Patient Q&A, treatment contracts, diagnosis
//   - useCommerceHandlers: Sales, trades, NPC interactions
//   - useResourceHandlers: Health, energy, eating, foraging
//   - useUIHandlers: Modals, toggles, commands, actions, tabs
//   - useItemHandlers: Item drop, give/sell/prescribe
//
// This hook retains only:
//   - Core orchestration logic (handleSubmit - main narrative processor)
//   - Helper functions (addToHistory, addJournalEntry, generateNewItemDetails)
//   - Simple state setters (wealth, reputation, incorporate)
//   - Event coordinators (entity click, random events, furniture)
//
// Original size: 3,180 lines with 95 parameters
// Current size: ~1,490 lines (53% reduction)
// Target size: Sub-300 lines pure orchestration layer

import { useCallback, useRef } from 'react';
import { orchestrateTurn } from '../../core/agents/AgentOrchestrator';
import { processPatientDialogue } from '../../core/agents/PatientDialogueAgent';
import { extractPatientContext } from '../../core/agents/PatientContextExtractor';
import { enrichPatientData } from '../../core/entities/PatientEnrichment';
import { entityManager } from '../../core/entities/EntityManager';
import { createChatCompletion } from '../../core/services/llmService';
import { buildSystemPrompt } from '../../prompts/promptModules';
import { scenarioLoader } from '../../core/services/scenarioLoader';
import { buildLocationRegistry, matchLocation } from '../../features/map/services/locationRegistry';
import resourceManager from '../../systems/ResourceManager';
import { relationshipGraph } from '../../core/entities/RelationshipGraph';
import { applyRelationshipToReputation } from '../../core/systems/reputationFeedback';
import { getXPForNextLevel, getPlayerTitle } from '../../core/systems/levelingSystem';
import { resolvePortrait } from '../../core/services/portraitResolver';
import { parseNarrativeChoices } from '../../utils/narrativeParser';
import { generateNextSteps } from '../../core/services/nextStepsGenerator';
import { mapNPCFactionToSystemFaction, updateFactionFromNPCInteraction } from '../../core/systems/reputationSystem';
import { simulateLongDistanceTravel } from '../../core/agents/LongDistanceTravelAgent';
import { checkForRandomEvent, processEventChoice, initializeEventSystem } from '../../core/events/randomEventService';
import { getDetailImagePathSync } from '../../utils/detailImageResolver';
import { isDocumentItem, getDocumentType, extractDocumentMetadata, shouldAutoOpenDocument } from '../../utils/documentDetector';
import { getHouseCallData } from '../../features/medical/services/houseSelector';
import { getTransactionManager, TRANSACTION_CATEGORIES } from '../../core/systems/transactionManager';
import { MedicalRecordsManager } from '../../core/systems/medicalRecordsManager';

// PHASE 2.1: Specialized navigation handlers hook
import { useNavigationHandlers } from './useNavigationHandlers';

// PHASE 2.2: Specialized medical handlers hook
import { useMedicalHandlers } from './useMedicalHandlers';

// PHASE 2.3: Specialized commerce handlers hook
import { useCommerceHandlers } from './useCommerceHandlers';

// PHASE 2.4: Specialized resource handlers hook
import { useResourceHandlers } from './useResourceHandlers';

// PHASE 2.5: Specialized UI handlers hook
import { useUIHandlers } from './useUIHandlers';

// PHASE 2.6: Specialized item handlers hook
import { useItemHandlers } from './useItemHandlers';

const sanitizePortraitFilename = (filename) => {
  if (!filename) return null;
  const trimmed = filename.trim();

  if (trimmed.startsWith('ui/')) {
    return trimmed.replace(/^\/+/, 'ui/');
  }

  return trimmed
    .replace(/^\/?portraits\//i, '')
    .replace(/^\/+/, '');
};

export function useGameHandlers({
  // State setters
  setWealth,  // Changed from setWealth - now uses gameState
  setGameState, // For updating gameState fields like status
  setReputation,
  updateReputation, // Faction-based reputation updates
  setReputationChange, // For UI feedback on reputation changes
  setIncorporatedContent,
  setShowIncorporatePopup,
  setIsJournalOpen,
  setIsInventoryOpen,
  setIsHistoryOpen,
  setIsAboutOpen,
  setIsMapOpen,
  setIsDiagnoseOpen,
  setShowMixingPopup,
  toggleModal, // Modal context toggle function
  openModal, // Modal context open function
  setSelectedPDF,
  setSelectedCitation,
  setOfferRecipient, // Offer modal recipient data
  setSimplePrescribeRecipient, // Simple prescribe modal recipient
  setIsPdfOpen,
  setSelectedPatient,
  setShowPatientModal,
  setSelectedNPC,
  setShowNPCModal,
  setSelectedItem,
  setShowItemModal,
  setJournal,
  setCustomJournalEntry,
  setEnergy,
  setConsecutiveLowEnergyTurns,
  setHealth,
  setActiveEffects,
  setConversationHistory,
  setIsLoading,
  setHistoryOutput,
  setCurrentEntities,
  setUserInput,
  setSelectedNpcName,
  setShowSymptomsPopup,
  setIsBuyOpen,
  setIsPrescribePopupOpen,
  setIsSleepOpen,
  setIsRestDurationOpen,
  setIsEatOpen,
  setIsForageOpen,
  setTurnNumber,
  setCurrentPatient,
  setIsPrescribing,
  setCurrentPrescriptionType,
  setNPCPosition,
  setPlayerPosition,
  setPlayerFacing,
  setCurrentMapId,
  setIsModernInventoryOpen,
  setUserActions,
  setActiveTab,
  setGameLog,
  setActivePatient,
  setPatientDialogue,
  setIsLedgerOpen,
  setIsFastTravelOpen,
  setIsBloodlettingOpen,
  setIsPatientRosterOpen,
  setPendingContract,
  setPendingActionPrompt,
  setPendingMixingDecision,
  setPendingHouseCall, // House call system (Phase 3A)
  setPendingPurchaseOffer, // Purchase offer system (vendor selling to Maria)
  setIsContractModalOpen,
  setPendingExitData, // Exit confirmation system
  setShowExitConfirmation, // Exit confirmation system
  setTradingNPC, // Trade system
  setTradeMode, // Trade system
  setPendingSimpleInteraction, // Simple interaction system
  setPendingRandomEvent, // Random event system
  setPrimaryPortraitFile, // PHASE 1: For LLM-selected portraits
  setDynamicChips, // Dynamic action chips from narrative parsing
  setPendingPrescription, // Clear prescription card on next action
  setShowPOIModal, // POI modal for map furniture clicks
  setSelectedPOIEntity, // Selected entity for POI modal
  setPendingDocument, // Document modal for letters/codices
  setIsDocumentModalOpen, // Document modal open state
  setTravelAnimationState,
  openLongDistanceTravelCard,
  triggerGameOver,
  setCrisisState,

  // State values
  isLoading, // CRITICAL FIX: Loading state for double-click guard
  energy,
  health,
  currentWealth,
  consecutiveLowEnergyTurns,
  toast,
  turnNumber,
  gameState,
  scenarioId,
  userInput,
  conversationHistory,
  historyOutput, // Current narrative output for document context
  npcTracker,
  reputation,
  reputationEmoji,
  currentMapData,
  playerPosition,
  playerFacing,
  currentMapId,
  npcPositions,
  activeTab,
  gameLog,
  activePatient,
  currentPatient,
  patientDialogue,
  playerSkills,
  journal,
  pendingExitData, // Exit confirmation system state

  // Callbacks from gameState
  updateInventory,
  generateNewItemDetails,
  advanceTime,
  updateLocation,
  addCompoundToInventory,
  refreshInventory,
  toggleShopSign,
  updateEnergy,
  addTradeOpportunity, // Trade system
  removeTradeOpportunity, // Trade system
  addTradeTransaction, // Trade system
  cleanupExpiredOpportunities, // Trade system

  // Document library system
  addDocument,
  markDocumentAsRead,
  getDocuments,
  getUnreadDocumentsCount,

  // Leveling system
  awardXP,
  awardSkillXP,
}) {

  // ============================================================================
  // SECTION 1: HELPER FUNCTIONS
  // Core utilities used by the main orchestration logic
  // ============================================================================

  // Helper: Add entry/entries to conversation history with automatic timestamps
  const addToHistory = useCallback((...entries) => {
    const timestampedEntries = entries.map(entry => ({
      ...entry,
      timestamp: {
        time: gameState.time,
        date: gameState.date
      }
    }));
    setConversationHistory(prev => [...prev, ...timestampedEntries]);
  }, [gameState.time, gameState.date, setConversationHistory]);

  // PHASE 2.1: currentBuildingRef moved to useNavigationHandlers.js

  // Track previous portrait entity for smooth transitions (persists across renders)
  const previousPortraitEntityRef = useRef(null);
  const lastHouseCallKeyRef = useRef(null);

  // PHASE 2: Track recent portrait filename for consistency across turns
  const recentPortraitRef = useRef(null);

  // Track if NPC departed last turn (for continuation detection)
  const npcDepartedLastTurnRef = useRef(false);
  const conversationLockRef = useRef(null);

  const clearConversationLock = useCallback(() => {
   if (conversationLockRef.current) {
     console.log('[ConversationLock] Clearing conversation lock for', conversationLockRef.current.name || 'unknown');
   }
   conversationLockRef.current = null;
 }, []);

  const handleWealthChange = useCallback((newWealth) => {
    setWealth(newWealth);
  }, [setWealth]);

  const addJournalEntry = useCallback((entry) => {
    setJournal(prevJournal => [...prevJournal, entry]);
  }, [setJournal]);

  const handleLongDistanceTravelCommand = useCallback(async (travelPayload, originalCommand) => {
    try {
      const recentHistory = conversationHistory.slice(-6);
      const result = await simulateLongDistanceTravel({
        travelPlan: travelPayload,
        gameState,
        playerSkills,
        reputation,
        journal,
        recentHistory
      });

      const wealthDeltaRaw = Number.isFinite(result?.wealthDelta)
        ? result.wealthDelta
        : -(travelPayload.costReales || 0);
      const wealthDelta = Number.isFinite(wealthDeltaRaw) ? wealthDeltaRaw : 0;
      if (wealthDelta !== 0) {
        handleWealthChange(Math.max(0, gameState.wealth + wealthDelta));
      }

      const minutesAdvance = Number.isFinite(result?.timeAdvanceMinutes)
        ? Math.max(0, Math.round(result.timeAdvanceMinutes))
        : Math.max(0, Math.round((travelPayload.durationDays || 0) * 24 * 60));

      if (minutesAdvance > 0) {
        advanceTime({ time: gameState.time, date: gameState.date, location: gameState.location }, minutesAdvance);
      }

      if (Number.isFinite(result?.energyDelta) && result.energyDelta !== 0) {
        const newEnergy = Math.max(0, Math.min(100, (gameState.energy || 0) + result.energyDelta));
        setEnergy(newEnergy);
      }


      const outcome = result?.outcome || 'success';
      const arrivalLocation = result?.arrival?.location || travelPayload.destinationName || gameState.location;
      const arrivalWorldId = result?.arrival?.worldLocationId || travelPayload.destinationId || gameState.worldLocationId;

      if (arrivalLocation) {
        updateLocation(arrivalLocation);
      }

      setGameState(prev => ({
        ...prev,
        worldLocationId: arrivalWorldId || prev.worldLocationId
      }));

      if (outcome === 'success' || outcome === 'delayed') {
        setCurrentMapId('world-map');
      }

      const narrative = result?.narrative || '*The journey proceeds, but no chronicler records its details.*';

      addToHistory(
        {
          role: 'user',
          content: originalCommand,
          hidden: true,
          isMovement: true
        },
        {
          role: 'assistant',
          content: narrative,
          responseType: 'travel',
          travelOutcome: outcome
        }
      );

      setHistoryOutput(narrative);
      setDynamicChips(null);

      const journalEntry = outcome === 'failure'
        ? `Attempted to travel toward ${travelPayload.destinationName}, but the journey failed: ${result?.arrival?.notes || 'obstacles arose.'}`
        : `Traveled by ${travelPayload.mode?.label?.toLowerCase() || 'unknown means'} to ${arrivalLocation}.`;
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: journalEntry
      });
    } catch (error) {
      console.error('[LongTravel] Error handling long-distance travel:', error);
      const failureMessage = `*The travel plan collapses: ${error.message || 'an unexpected complication occurs'}.*`;
      addToHistory({ role: 'assistant', content: failureMessage });
      setHistoryOutput(failureMessage);
    }
  }, [
    conversationHistory,
    gameState,
    playerSkills,
    reputation,
    journal,
    simulateLongDistanceTravel,
    handleWealthChange,
    advanceTime,
    updateLocation,
    setGameState,
    setCurrentMapId,
    setEnergy,
    addToHistory,
    setHistoryOutput,
    setDynamicChips,
    addJournalEntry,
    turnNumber
  ]);

  // ============================================================================
  // SECTION 2: SIMPLE STATE SETTERS
  // Basic handlers for state updates (wealth, reputation, etc.)
  // ============================================================================

  /**
   * Check if an entity is an animal or object (not portrait-worthy)
   * @param {Object} entity - Entity to check
   * @returns {boolean} - True if entity is an animal/object
   */
  const isAnimalOrObject = (entity) => {
    if (!entity) return true;

    const name = entity.name?.toLowerCase() || '';
    // Support BOTH flat and nested formats (EntityList vs EntityManager)
    const occupation = (entity.social?.occupation || entity.occupation || '').toLowerCase();
    const casta = (entity.social?.casta || entity.casta || '').toLowerCase();

    // Check for animal keywords
    const animalKeywords = ['dog', 'cat', 'horse', 'goat', 'sheep', 'pig', 'chicken', 'cow', 'donkey', 'mule'];
    const isAnimal = animalKeywords.some(keyword =>
      name.includes(keyword) || occupation.includes(keyword)
    );

    // Check for object/non-person indicators
    const isObject =
      casta === 'n/a' ||
      occupation.includes('farm animal') ||
      occupation.includes('livestock');

    return isAnimal || isObject;
  };

  // handleStatusChange removed - portrait now calculated dynamically in GamePage via getMariaPortrait()
  // handleReputationChange removed - reputation now updated directly via updateFactionFromNPCInteraction

  const handleIncorporate = (content) => {
    setIncorporatedContent(content);
    setShowIncorporatePopup(true);
    setTimeout(() => setShowIncorporatePopup(false), 2000);
  };

  // TOGGLE HANDLERS
  // PHASE 2.5: All toggle functions moved to useUIHandlers.js
  // PHASE 2.5: handlePDFClick moved to useUIHandlers.js
  // PHASE 2.5: closePdfPopup moved to useUIHandlers.js
  // PHASE 2.5: handlePortraitClick moved to useUIHandlers.js

  // JOURNAL HANDLERS

  const handleJournalEntrySubmit = async (e) => {
    e.preventDefault();
    const customEntryValue = e.target.elements?.journalEntry?.value;
    if (!customEntryValue || !customEntryValue.trim()) return;

    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: customEntryValue
    });
    setCustomJournalEntry('');
  };

  // RESOURCE MANAGEMENT
  // PHASE 2.4: applyResourceChanges moved to useResourceHandlers.js

  // PHASE 2.4: handleEat moved to useResourceHandlers.js

  // PHASE 2.4: handleForageComplete moved to useResourceHandlers.js

  // ============================================================================
  // SECTION 3: SPECIALIZED HOOK INITIALIZATION
  // Initialize all 6 specialized handler hooks (must come AFTER helpers)
  // ============================================================================

  // PHASE 2.1: Initialize navigation handlers hook
  // NOTE: Must come AFTER addJournalEntry and addToHistory are defined
  const navigationHandlers = useNavigationHandlers({
    setIsLoading,
    setUserInput,
    setUserActions,
    setHistoryOutput,
    setConversationHistory,
    setTurnNumber,
    setPendingExitData,
    setShowExitConfirmation,
    setDynamicChips,
    addJournalEntry,
    addToHistory,
    // Legacy params (still needed for orchestrateTurn)
    gameState,
    playerPosition,
    playerFacing,
    currentMapId,
    setCurrentMapId,
    currentMapData,
    conversationHistory,
    turnNumber,
    npcTracker,
    reputation,
    currentWealth,
    npcPositions,
    playerSkills,
    journal,
    scenarioId,
    // Phase 3B: House call arrival
    setActivePatient,
    setPatientDialogue,
    setPendingHouseCall,
    toast,
    // Phase 3C: Patient positioning
    setNPCPosition,
    // Phase 3D: House call completion
    awardXP,
    updateReputation,
    setTravelAnimationState,
    openLongDistanceTravelCard,
  });

  // PHASE 2.2: Initialize medical handlers hook
  // NOTE: Must come AFTER addJournalEntry and other helpers are defined
  const medicalHandlers = useMedicalHandlers({
    addJournalEntry,
    setConversationHistory,
    setHistoryOutput,
    setIsLoading,
    toast,
    awardXP,
    previousPortraitEntityRef,
    recentPortraitRef,
    setPendingHouseCall,
    // Legacy params
    gameState,
    turnNumber,
    conversationHistory,
    energy,
    updateEnergy,
    advanceTime,
    scenarioId,
  });

  // PHASE 2.4: Initialize resource handlers hook
  // NOTE: Must come AFTER addJournalEntry, addToHistory, and generateNewItemDetails are defined
  const resourceHandlers = useResourceHandlers({
    addJournalEntry,
    addToHistory,
    generateNewItemDetails,
    toast,
    awardXP,
    // Legacy params
    gameState,
    turnNumber,
    energy,
    health,
    currentWealth,
    consecutiveLowEnergyTurns,
    setEnergy,
    setHealth,
    setConsecutiveLowEnergyTurns,
    setActiveEffects,
  });

  // PHASE 2.5: Initialize UI handlers hook
  // NOTE: Must come AFTER addJournalEntry, addToHistory, and other helpers are defined
  const uiHandlers = useUIHandlers({
    setIsJournalOpen,
    setIsInventoryOpen,
    setIsHistoryOpen,
    setIsAboutOpen,
    setIsMapOpen,
    setIsDiagnoseOpen,
    setShowMixingPopup,
    toggleModal, // Pass toggleModal for proper modal toggling
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
  });

  // PHASE 2.6: Initialize item handlers hook
  const itemHandlers = useItemHandlers({
    setUserInput,
    setConversationHistory,
    setHistoryOutput,
    addJournalEntry,
    toast,
    // Legacy params
    gameState,
    turnNumber,
  });

  // PHASE 2.6: handleItemDrop moved to useItemHandlers.js

  // ============================================================================
  // SECTION 4: MAIN ORCHESTRATOR
  // Core narrative processing logic (handleSubmit)
  // ============================================================================

  // MAIN SUBMIT HANDLER
  const handleSubmit = useCallback(async (e, actionOverride = null, options = {}) => {
    // Prevent default only if called from form event
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    // CRITICAL FIX: Prevent double-click/spam submissions
    if (isLoading) {
      console.log('[handleSubmit] Already processing, ignoring duplicate submission');
      return;
    }

    // Clear pending prescription card when player submits new action
    if (setPendingPrescription) {
      setPendingPrescription(null);
    }

    setIsLoading(true);

    // Use override if provided (from chip clicks), otherwise fall back to userInput state
    const originalInput = (actionOverride || userInput).trim();

    if (originalInput.startsWith('#long_travel ')) {
      try {
        const payloadString = originalInput.slice('#long_travel '.length).trim();
        const travelPayload = JSON.parse(payloadString);
        await handleLongDistanceTravelCommand(travelPayload, originalInput);
      } catch (error) {
        console.error('[handleSubmit] Invalid long travel payload:', error);
        const message = '*The travel request could not be understood. Please try again.*';
        addToHistory({ role: 'assistant', content: message });
        setHistoryOutput(message);
      } finally {
        setUserInput('');
        setIsLoading(false);
      }
      return;
    }

    let narrativeText = originalInput.toLowerCase();

    if (conversationLockRef.current) {
      const breakLockPattern = /(dismiss|send\s+(him|her|them)\s+away|tell\s+(him|her|them)\s+to\s+leave|close\s+the\s+door|shut\s+the\s+door|go\s+away|leave\s+me\s+alone|see\s+who\s+is\s+there|open\s+the\s+door|answer\s+the\s+door|check\s+the\s+door)\b/i;
      if (breakLockPattern.test(narrativeText)) {
        clearConversationLock();
      }
    }

    // Extract metadata options
    const { actionResultType } = options;

    // Handle command shortcuts

    // AUTO-TREAT/DIAGNOSE: "treat [npc]" or "diagnose [npc]"
    // Automatically sets up NPC as active patient and switches to patient view
    if (narrativeText.startsWith('treat ') || narrativeText.startsWith('diagnose ')) {
      const command = narrativeText.split(' ')[0]; // 'treat' or 'diagnose'
      const searchTerm = originalInput.substring(command.length + 1).trim(); // Preserve case

      console.log(`[AutoTreat] Command: ${command}, searching for: "${searchTerm}"`);

      // Search for matching NPC/patient in recent NPCs
      const recentNPCs = npcTracker.getRecentNPCs();
      let matchedEntity = null;

      // Try to find exact or partial match
      for (const npcName of recentNPCs) {
        const lowerNPCName = npcName.toLowerCase();
        const lowerSearch = searchTerm.toLowerCase();

        // Match if search term is contained in NPC name OR NPC name is contained in search term
        // This handles "goat", "Manso", "the goat", "goat Manso", etc.
        if (lowerNPCName.includes(lowerSearch) || lowerSearch.includes(lowerNPCName)) {
          // Find the actual entity from EntityManager or EntityList
          const EntityList = require('../../EntityList').default;
          matchedEntity = entityManager.getByName(npcName) || EntityList.find(e => e.name === npcName);

          if (matchedEntity) {
            console.log(`[AutoTreat] Found match: ${matchedEntity.name}`);
            break;
          }
        }
      }

      // If no match in recent NPCs, search conversation history for mentions
      if (!matchedEntity) {
        console.log('[AutoTreat] No match in recent NPCs, searching conversation history...');

        // Get all entity mentions from recent conversation
        const recentMessages = conversationHistory.slice(-10);
        const EntityList = require('../../EntityList').default;

        for (const entity of EntityList) {
          const lowerEntityName = entity.name.toLowerCase();
          const lowerSearch = searchTerm.toLowerCase();

          if (lowerEntityName.includes(lowerSearch) || lowerSearch.includes(lowerEntityName)) {
            // Check if this entity was mentioned in recent conversation
            const wasMentioned = recentMessages.some(msg =>
              msg.content && msg.content.toLowerCase().includes(lowerEntityName)
            );

            if (wasMentioned) {
              matchedEntity = entity;
              console.log(`[AutoTreat] Found match in conversation: ${matchedEntity.name}`);
              break;
            }
          }
        }
      }

      if (!matchedEntity) {
        toast.error(`Could not find "${searchTerm}" to treat. Try using their exact name from the narrative.`, { duration: 4000 });
        setUserInput('');
        setIsLoading(false);
        return;
      }

      // Ensure entity has patient-like properties
      if (!matchedEntity.entityType) matchedEntity.entityType = 'patient';
      if (!matchedEntity.symptoms) matchedEntity.symptoms = ['Unknown symptoms'];

      // Enrich the entity if needed
      const enrichedEntity = entityManager.getById(matchedEntity.id) || matchedEntity;

      // Set up portrait
      const patientPortrait = resolvePortrait(enrichedEntity);
      if (patientPortrait) {
        const portraitFilename = patientPortrait.replace('/portraits/', '');
        enrichedEntity.image = portraitFilename;
        if (!enrichedEntity.visual) enrichedEntity.visual = {};
        enrichedEntity.visual.image = portraitFilename;
        setPrimaryPortraitFile(portraitFilename);
        recentPortraitRef.current = portraitFilename;
        previousPortraitEntityRef.current = enrichedEntity;
      }

      // Set as active patient
      console.log(`[AutoTreat] Setting active patient: ${enrichedEntity.name}`);
      setActivePatient(enrichedEntity);
      setPatientDialogue([]);

      // Switch to patient tab
      setActiveTab('patient');

      // Add narrative turn
      const narrativeAction = command === 'treat' ? 'preparing to treat' : 'beginning to examine';
      const narrativeText = `You prepare your workspace, ${narrativeAction} ${enrichedEntity.name}.`;

      setConversationHistory(prev => [...prev,
        { role: 'user', content: originalInput },
        { role: 'assistant', content: narrativeText }
      ]);
      setHistoryOutput(narrativeText);
      setTurnNumber(t => t + 1);

      toast.success(`Now treating ${enrichedEntity.name}`, { duration: 3000 });

      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (narrativeText === '#prescribe') {
      const recentNPCs = typeof npcTracker?.getRecentNPCs === 'function' ? npcTracker.getRecentNPCs() : [];
      let targetEntity = activePatient || currentPatient || null;
      let targetName = targetEntity?.name || null;

      if (!targetEntity && recentNPCs.length > 0) {
        const fallbackName = recentNPCs[recentNPCs.length - 1];
        targetEntity = entityManager.getByName(fallbackName) || null;
        targetName = fallbackName;
      }

      const portraitFile = targetEntity?.visual?.image || targetEntity?.image || null;
      const portraitPath = portraitFile ? `/portraits/${portraitFile.replace(/^\/portraits\//, '')}` : null;
      const symptoms = Array.isArray(targetEntity?.symptoms) ? targetEntity.symptoms : [];
      const primarySymptom = symptoms.length > 0 ? symptoms[0] : null;
      const ailmentDescription = typeof primarySymptom === 'string'
        ? primarySymptom
        : primarySymptom?.name || targetEntity?.ailmentDescription || 'Unspecified ailment';
      const suggestedItems = Array.isArray(targetEntity?.suggestedItems)
        ? targetEntity.suggestedItems
        : Array.isArray(targetEntity?.recommendedItems)
          ? targetEntity.recommendedItems
          : Array.isArray(targetEntity?.prescriptionSuggestions)
            ? targetEntity.prescriptionSuggestions
            : [];

      setPendingActionPrompt({
        type: 'prescribe',
        recipientName: targetName || 'Patient',
        npcId: targetEntity?.id || null,
        npcPortrait: portraitPath,
        context: targetName ? `Provide treatment for ${targetName}` : 'Select a remedy to prescribe',
        ailmentDescription,
        suggestedItems
      });

      setActiveTab('chronicle');
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (narrativeText === '#sleep') {
      setIsRestDurationOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (narrativeText === '#eat') {
      setIsEatOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#buy') {
      setIsBuyOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#offer') {
      // Open offer modal with generic recipient (last NPC in conversation)
      const recentNPCs = npcTracker.getRecentNPCs();
      const lastNPC = recentNPCs.length > 0 ? recentNPCs[recentNPCs.length - 1] : null;
      setOfferRecipient({
        name: lastNPC || 'someone',
        context: 'Manual offer command'
      });
      openModal('offer');
      setUserInput('');
      setIsLoading(false);
      return;
    }

    // SIMPLE PRESCRIBE: "prescribe [npc]" - Quick dispensing without full patient examination
    if (narrativeText.startsWith('prescribe ')) {
      const searchTerm = originalInput.substring('prescribe '.length).trim(); // Preserve case

      console.log(`[SimplePrescribe] Searching for recipient: "${searchTerm}"`);

      // Search for matching NPC in recent NPCs
      const recentNPCs = npcTracker.getRecentNPCs();
      let recipientName = null;

      // Try to find exact or partial match
      for (const npcName of recentNPCs) {
        const lowerNPCName = npcName.toLowerCase();
        const lowerSearch = searchTerm.toLowerCase();

        if (lowerNPCName.includes(lowerSearch) || lowerSearch.includes(lowerNPCName)) {
          recipientName = npcName;
          console.log(`[SimplePrescribe] Found match: ${recipientName}`);
          break;
        }
      }

      // If no specific NPC found, use search term as-is (might be "the boy", "goat", etc.)
      if (!recipientName) {
        recipientName = searchTerm || 'someone';
        console.log(`[SimplePrescribe] No exact match, using: ${recipientName}`);
      }

      setSimplePrescribeRecipient(recipientName);
      openModal('simplePrescribe');
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#forage') {
      setIsForageOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#travel') {
      setIsFastTravelOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    // PHASE 2.1: Handle fast travel using navigation handler
    if (narrativeText.startsWith('#fast_travel ')) {
      const locationName = originalInput.substring(13); // Remove "#fast_travel " while preserving case
      setIsLoading(false); // CRITICAL FIX: Reset loading state before delegating
      navigationHandlers.handleFastTravel(locationName);
      return;
    }

    // Helper: Detect if a phrase is a player movement command vs dialogue/NPC-directed/narrative action
    const isPlayerMovementCommand = (text, phrase) => {
      // 1. Exclude if phrase is in quotation marks (dialogue)
      const quotedPattern = new RegExp(`["']([^"']*${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*)["']`, 'i');
      if (quotedPattern.test(text)) {
        return false;
      }

      // 2. Exclude if directed at NPC (tell/ask/order X to Y)
      const npcDirectivePattern = /(?:tell|ask|order|command|instruct|say to)\s+(?:him|her|them|the\s+\w+|\w+)\s+to/i;
      const npcDirectiveMatch = text.match(npcDirectivePattern);
      if (npcDirectiveMatch) {
        const directiveIndex = text.indexOf(npcDirectiveMatch[0]);
        const phraseIndex = text.indexOf(phrase);
        if (phraseIndex > directiveIndex) {
          return false; // Phrase comes after directive, so it's directed at NPC
        }
      }

      // 3. Exclude if using comma-addressing (e.g., "soldier, go outside")
      if (/^\w+,\s+/.test(text)) {
        return false;
      }

      // 4. Exclude if it's a narrative action (contains action verbs after "go")
      // e.g., "go see who it is", "go check on X", "go investigate", "go find out"
      const narrativeActionPattern = /\b(?:go|walk|head)\s+(?:see|check|investigate|find|look|talk|speak|ask|tell|help|assist|answer|greet|meet)\b/i;
      if (narrativeActionPattern.test(text)) {
        return false;
      }

      // 5. Phrase should appear near the start (within first 30 chars) for imperative commands
      const phraseIndex = text.indexOf(phrase);
      if (phraseIndex > 30) {
        return false;
      }

      return true; // Passes all checks - this is a player movement command
    };

    // Handle "go outside" / "leave" commands when inside the botica
    const exitPhrases = ['go outside', 'leave', 'exit', 'go out', 'step outside', 'walk outside'];
    const isExitCommand = exitPhrases.some(phrase =>
      narrativeText.includes(phrase) && isPlayerMovementCommand(narrativeText, phrase)
    );
    const isInsideBotica = gameState.location?.includes('Botica de la Amargura');

    // Don't show exit confirmation if we're already processing an exit (prevents duplicate cards)
    if (isExitCommand && isInsideBotica && !pendingExitData) {
      console.log('[Exit] Showing exit confirmation card');

      // Store exit data for later execution
      setPendingExitData({
        location: 'Mexico City',
        mapId: 'mexico-city-center',
        position: { x: 1350, y: 930, gridX: 67, gridY: 46 },
        exitMessage: "You step outside into the bustling streets of Mexico City.",
        locationName: "Botica de la Amargura",
        gameTime: gameState.time
      });

      // Show confirmation card
      setShowExitConfirmation(true);
      setUserInput('');
      setIsLoading(false);

      // Don't continue with exit or LLM processing
      return;
    }

    // Handle "go inside" / "enter" commands when outside near the botica
    const enterPhrases = ['go inside', 'enter', 'go in', 'step inside', 'walk inside', 'enter shop', 'enter botica'];
    const isEnterCommand = enterPhrases.some(phrase =>
      narrativeText.includes(phrase) && isPlayerMovementCommand(narrativeText, phrase)
    );
    const isOutsideBotica = !gameState.location?.includes('Botica de la Amargura') &&
                            (narrativeText.includes('botica') || narrativeText.includes('shop') || narrativeText.includes('home'));

    if (isEnterCommand && isOutsideBotica) {
      console.log('[Enter] Player entering Botica de la Amargura');

      // Update location to interior
      updateLocation('Botica de la Amargura, Mexico City');

      // Switch to interior map
      setCurrentMapId('botica-interior');

      // Position player at the starting interior position (behind counter on shop floor, north side)
      setPlayerPosition({ x: 510, y: 480, gridX: 25, gridY: 24 });

      // Show simple system message instead of calling LLM
      const enterMessage = "You step inside the Botica de la Amargura. The familiar scent of herbs and compounds fills the air.";
      setHistoryOutput(enterMessage);
      addToHistory({ role: 'assistant', content: enterMessage });
      setUserInput('');
      setUserActions(prev => [...prev, actionOverride || userInput]);
      setIsLoading(false);

      // Don't continue with LLM turn processing
      return;
    }

    // PHASE 2.1: Handle natural language navigation using navigation handler
    if (navigationHandlers.handleNaturalLanguageNavigation(narrativeText)) {
      setUserInput('');
      setUserActions(prev => [...prev, actionOverride || userInput]);
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#ledger') {
      // Check if player has Bookkeeping skill
      const bookkeepingLevel = playerSkills?.knownSkills?.bookkeeping?.level || 0;

      if (bookkeepingLevel < 1) {
        setHistoryOutput('Maria lacks formal bookkeeping training. She needs at least Level 1 Bookkeeping skill to maintain a proper ledger.');
        setUserInput('');
        setIsLoading(false);
        return;
      }

      setIsLedgerOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#bloodlet') {
      // Check if player has Anatomy skill
      const anatomyLevel = playerSkills?.knownSkills?.anatomy?.level || 0;

      if (anatomyLevel < 1) {
        setHistoryOutput('Maria lacks the anatomical knowledge to perform phlebotomy safely. She needs at least Level 1 Anatomy skill.');
        setUserInput('');
        setIsLoading(false);
        return;
      }

      setIsBloodlettingOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#hangsign' || userInput.trim().toLowerCase() === '#removesign') {
      // Toggle shop sign
      toggleShopSign();

      // Determine message based on current state (will be opposite after toggle)
      const signWasHung = gameState.shopSign?.hung || false;
      const message = signWasHung
        ? '*You remove your shop sign from the entrance. Patients will be less likely to approach.*'
        : '*With your sign hung outside your shop, you are now actively seeking patients.*';

      // Add journal entry
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: signWasHung ? 'Removed the shop sign.' : 'Hung the shop sign to attract patients.'
      });

      setConversationHistory(prev => [...prev, { role: 'system', content: message }]);
      setHistoryOutput(message);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    // Track user actions
    setUserActions(prevActions => [...prevActions, narrativeText]);

    // Normalize command
    const command = narrativeText.startsWith('#') ? narrativeText.substring(1) : narrativeText;

    // Handle symptoms command
    if (command.startsWith('symptoms')) {
      const recentNPCs = npcTracker.getRecentNPCs();
      const latestNPC = recentNPCs.length > 0 ? recentNPCs[recentNPCs.length - 1] : null;
      const npcName = command.split(' ')[1] || latestNPC;
      if (npcName) {
        setSelectedNpcName(npcName);
        setShowSymptomsPopup(true);
        setUserInput('');
        setIsLoading(false);
        return;
      } else {
        setHistoryOutput('No NPC is currently selected.');
        setUserInput('');
        setIsLoading(false);
        return;
      }
    }

    // Use AgentOrchestrator for coordinated agent responses
    try {
      const result = await orchestrateTurn({
        scenarioId: gameState.scenarioId || '1680-mexico-city',
        playerAction: narrativeText,
        conversationHistory,
        gameState: {
          ...gameState,
          position: playerPosition,
          currentMap: currentMapId
        },
        turnNumber,
        recentNPCs: npcTracker.getRecentNPCs(),
        reputation: reputation,
        wealth: currentWealth,
        mapData: currentMapData,
        playerPosition: playerPosition,
        playerFacing: playerFacing,
        currentMapId: currentMapId,
        playerSkills: playerSkills,
        journal: journal,
        activePatient: activePatient, // Pass current active patient for contextual guards
        recentPortrait: recentPortraitRef.current, // PHASE 2: Pass last portrait for consistency
        npcDepartedLastTurn: npcDepartedLastTurnRef.current, // Pass departure status from last turn
        conversationLock: conversationLockRef.current
      });

      if (!result.success) {
        setHistoryOutput(result.narrative || 'An error occurred. Please try again.');
        setIsLoading(false);
        return;
      }

      // NEW: Handle LLM-provided primary NPC profile (Phase 1)
      if (result.primaryNPC) {
        console.log('[Primary NPC] Received from LLM:', result.primaryNPC.name);

        const npcEntity = {
          ...result.primaryNPC,
          id: `npc_${result.primaryNPC.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
          entityType: 'npc',
          type: 'npc',
          llmProvided: true, // Flag to prevent procedural override
          social: {
            class: result.primaryNPC.class,
            casta: result.primaryNPC.casta,
            occupation: result.primaryNPC.occupation
          },
          appearance: {
            gender: result.primaryNPC.gender,
            age: result.primaryNPC.age,
            description: result.primaryNPC.appearance
          },
          personality: {
            traits: result.primaryNPC.personality,
            description: result.primaryNPC.personality
          },
          tier: 'recurring' // LLM-generated NPCs are recurring by default
        };

        // Register or update entity
        try {
          const registered = entityManager.register(npcEntity);
          console.log('[Primary NPC] Registered:', registered.name);
        } catch (error) {
          console.error('[Primary NPC] Registration error:', error);
        }
      }

      // NEW PHASE 1: Handle LLM-selected portrait (replaces complex portrait resolution)
      let primaryPortraitFile = null;
      let portraitForHistory = null; // Separate value for conversation history context

      // Priority: LLM portrait > Turn 1 entrance fallback > Map
      if (result.primaryPortrait) {
        const normalizedPortrait = sanitizePortraitFilename(result.primaryPortrait);
        console.log('[Portrait] LLM selected portrait:', result.primaryPortrait, '→ normalized to:', normalizedPortrait);
        primaryPortraitFile = normalizedPortrait;
        portraitForHistory = normalizedPortrait;
      } else if (turnNumber === 1) {
        // Turn 1 fallback: Show entrance image only if LLM didn't provide a portrait
        // This allows map to show if player uses Exit button on turn 1
        primaryPortraitFile = 'ui/boticaentrance.png';
        portraitForHistory = null;
        console.log('[Portrait] Turn 1 fallback: Displaying entrance image (no LLM portrait)');
      } else {
        console.log('[Portrait] No portrait this turn - map will be shown');
      }

      // Store in state for ContextPanel to use (what user sees)
      setPrimaryPortraitFile(primaryPortraitFile);

      // Store LLM's portrait selection for conversation history context (what LLM learns from)
      if (portraitForHistory) {
        recentPortraitRef.current = sanitizePortraitFilename(portraitForHistory);
        console.log('[Portrait] Storing portrait for next turn context:', recentPortraitRef.current);
      }

      // PATIENT HANDLING: If entity is a patient, validate LLM used them correctly
      if (result.selectedEntity) {
        const entityType = result.selectedEntity.entityType || result.selectedEntity.type;

        if (entityType === 'patient') {
          const preSelectedPatient = result.selectedEntity;
          let patientToSet = preSelectedPatient;
          let validationStatus = 'direct'; // direct, intermediary, or diverged

          // Check if LLM actually mentioned the pre-selected patient in the narrative
          const narrativeLower = result.narrative?.toLowerCase() || '';
          const patientNameLower = preSelectedPatient.name.toLowerCase();
          const patientMentioned = narrativeLower.includes(patientNameLower);

          if (!patientMentioned) {
            console.warn(`[Patient Validation] Pre-selected patient "${preSelectedPatient.name}" NOT mentioned in narrative`);

            // Check if any extracted entities could be intermediaries
            const intermediaryKeywords = /woman|man|servant|messenger|daughter|son|wife|husband|child|mother|father|family|representative|maid|attendant|envoy/i;
            const extractedIntermediaries = (result.newNPCs || []).filter(entity =>
              intermediaryKeywords.test(entity.name) || intermediaryKeywords.test(entity.description || '')
            );

            if (extractedIntermediaries.length > 0) {
              // Found potential intermediary - link them to the patient
              const intermediary = extractedIntermediaries[0];
              console.log(`[Patient Validation] Found intermediary: "${intermediary.name}" representing ${preSelectedPatient.name}`);

              // Enrich intermediary with relationship to patient
              if (intermediary.metadata) {
                intermediary.metadata.representsPatient = preSelectedPatient.name;
                intermediary.metadata.representsPatierId = preSelectedPatient.id;
              }

              validationStatus = 'intermediary';
              // Still set the pre-selected patient as active (they're the one who needs treatment)
            } else {
              // LLM completely diverged - no intermediary found
              console.warn(`[Patient Validation] LLM diverged - no patient or intermediary found. Trusting pre-selection.`);
              validationStatus = 'diverged';
            }
          } else {
            console.log(`[Patient Validation] ✓ Pre-selected patient "${preSelectedPatient.name}" mentioned in narrative`);
          }

          // Set active patient regardless (they're the one being treated)
          console.log(`[Patient] Setting active patient: ${patientToSet.name} (validation: ${validationStatus})`);
          setActivePatient(patientToSet);
          setPatientDialogue([]); // Clear previous dialogue
        }

        const npcId = result.selectedEntity.id || result.selectedEntity.name;
        const currentNPCPosition = npcPositions.find(npc => npc.npcId === npcId);

        if (!currentNPCPosition && playerPosition && currentMapData) {
          const offsetX = (Math.random() - 0.5) * 100;
          const offsetY = (Math.random() - 0.5) * 100;
          const npcPosition = [
            Math.max(50, Math.min(currentMapData.bounds.width - 50, playerPosition.gridX * 20 + offsetX)),
            Math.max(50, Math.min(currentMapData.bounds.height - 50, playerPosition.gridY * 20 + offsetY))
          ];
          setNPCPosition(npcId, result.selectedEntity.name, npcPosition, 'interacting');
          console.log(`[NPC] Placed ${result.selectedEntity.name} at map position`, npcPosition);
        } else if (currentNPCPosition) {
          setNPCPosition(npcId, result.selectedEntity.name, currentNPCPosition.position, 'interacting');
          console.log(`[NPC] ${result.selectedEntity.name} is now interacting`);
        }
      } else {
        npcPositions.forEach(npc => {
          if (npc.status === 'interacting') {
            setNPCPosition(npc.npcId, npc.npcName, npc.position, 'idle');
          }
        });
      }

      // Portrait Selection Logic (OPTION A: LLM-ONLY, NO FALLBACK):
      // Only show portrait if LLM explicitly provides primaryPortrait
      // If LLM returns null, UI will show map tab instead
      let portraitEntity = null;

      if (primaryPortraitFile) {
        // LLM provided portrait - this is the ONLY way portraits are shown
        console.log('[Portrait] ✓ LLM selected portrait:', primaryPortraitFile);

        // Link portrait to primaryNPC if available (for modal opening)
        if (result.primaryNPC) {
          const primaryEntity = entityManager.getByName(result.primaryNPC.name);
          if (primaryEntity) {
            portraitEntity = primaryEntity;
            console.log('[Portrait] ✓ Linked portrait to primaryNPC:', result.primaryNPC.name);
          }
        }

        // Track NPC for display
        if (portraitEntity) {
          npcTracker.addNPC(portraitEntity.name);
          console.log('[Portrait] → Tracking for display:', portraitEntity.name);
          previousPortraitEntityRef.current = portraitEntity;
        }
      } else {
        // No portrait provided by LLM - this is intentional, show map instead
        console.log('[Portrait] ∅ No portrait this turn - map will be shown');
        previousPortraitEntityRef.current = null;

        if (result.primaryNPC?.name) {
          npcTracker.addNPC(result.primaryNPC.name);
        }
      }

      if (!result.npcDeparted) {
        const lockedEntity = portraitEntity || (result.primaryNPC?.name ? entityManager.getByName(result.primaryNPC.name) : null);
        const lockName = lockedEntity?.name || result.primaryNPC?.name || conversationLockRef.current?.name || null;
        if (lockName) {
          conversationLockRef.current = {
            id: lockedEntity?.id || conversationLockRef.current?.id || null,
            name: lockName,
            portrait: primaryPortraitFile || conversationLockRef.current?.portrait || null,
            active: true,
            lastTurn: turnNumber
          };
        }
      }

      // NPC DEPARTURE HANDLING: Remove NPC from tracker when they leave
      if (result.npcDeparted) {
        const recentNPCs = npcTracker.getRecentNPCs();
        const departingNPC = recentNPCs.length > 0 ? recentNPCs[recentNPCs.length - 1] : null;

        if (departingNPC) {
          console.log(`[NPC Departure] ${departingNPC} has left the scene`);
          npcTracker.removeNPC(departingNPC);

          // Clear portrait since NPC is gone
          setPrimaryPortraitFile(null);
          recentPortraitRef.current = null;
          previousPortraitEntityRef.current = null;
        } else {
          console.warn('[NPC Departure] npcDeparted=true but no NPC in tracker to remove');
        }

        // Track that NPC departed for next turn (prevents continuation detection)
        npcDepartedLastTurnRef.current = true;
        clearConversationLock();
      } else {
        // Reset departure flag if no departure this turn
        npcDepartedLastTurnRef.current = false;
      }

      // Log all entities for debugging
      if (result.newNPCs && result.newNPCs.length > 0) {
        console.log(`[Entities] ${result.newNPCs.length} entities mentioned in narrative:`,
          result.newNPCs.map(npc => `${npc.name} (${npc.tier || 'background'})`).join(', '));
      }

      // Display narrative
      setHistoryOutput(result.narrative);

      // Parse narrative for dynamic action chips
      if (result.narrative && setDynamicChips) {
        const parsedChips = parseNarrativeChoices(result.narrative);
        if (parsedChips) {
          console.log('[Dynamic Chips] Parsed choices from narrative:', parsedChips.map(c => c.label).join(', '));
          setDynamicChips(parsedChips);
        } else {
          console.log('[Dynamic Chips] No choice pattern detected, using defaults');
          setDynamicChips(null);
        }
      }

      // Store entities for historical context panel
      if (result.entities && result.entities.length > 0) {
        console.log('[GameHandlers] Storing entities for context panel:', result.entities);
        setCurrentEntities(result.entities);
      } else {
        setCurrentEntities([]);
      }

      // Add entry to game log
      const logEntry = {
        id: `turn-${turnNumber}`,
        timestamp: new Date().toLocaleTimeString(),
        turnNumber: turnNumber,
        category: result.category || 'default',
        summary: result.summary || narrativeText.substring(0, 100),
        context: {
          action: narrativeText,
          narrative: result.narrative,
          stateChanges: result.gameState || {},
          entities: result.selectedEntity ? [result.selectedEntity.name] : []
        },
        debug: result.debug || null
      };
      setGameLog(prev => [...prev, logEntry]);

      // Build conversation history
      const newUserMessage = { role: 'user', content: narrativeText };
      const newHistory = [...conversationHistory, newUserMessage];

      // Note: Removed "Someone approaches" system message - causes confusion when LLM diverges
      // The narrative itself already mentions who appears

      // CARD EMBEDDING: Store card data in conversation history so cards stay in place
      const assistantMessage = {
        role: 'assistant',
        content: result.narrative, // All dialogue is now embedded in narrative
        responseType: result.responseType || 'narration',
        primaryPortrait: result.primaryPortrait || null,
        primaryNPCName: result.primaryNPC?.name || null, // Store primary NPC name for portrait matching
        actionResultType: actionResultType || null, // Action result metadata (give/sell/prescribe)
        // Cards will be added below if detected
        card: null
      };
      newHistory.push(assistantMessage);
      const crisisSystemMessages = [];

      if (result.systemAnnouncements && result.systemAnnouncements.length > 0) {
        result.systemAnnouncements.forEach(announcement => {
          newHistory.push({ role: 'system', content: announcement });
        });
      }

      if (crisisSystemMessages.length > 0) {
        crisisSystemMessages.forEach(msg => {
          newHistory.push({ role: 'system', content: msg });
        });
      }

      // Add timestamps to all new history entries
      const timestampedHistory = newHistory.map(entry => ({
        ...entry,
        timestamp: {
          time: gameState.time,
          date: gameState.date
        }
      }));

      setConversationHistory(timestampedHistory);
      setTurnNumber(result.turnNumber || turnNumber + 1);

      // Handle game state updates
      if (result.gameState) {
        if (result.gameState.wealth !== undefined) {
          setWealth(result.gameState.wealth);
        }
        // Update status for tooltip and next turn's StateAgent prompt
        if (result.gameState.status) {
          setGameState(prev => ({ ...prev, status: result.gameState.status }));
          console.log('[State] Updated status:', result.gameState.status);
        }

        // Handle reputation events from extreme actions
        if (result.reputationEvents && result.reputationEvents.length > 0) {
          // Calculate total overall reputation change from all events
          const oldOverall = reputation?.overall || 50;
          let totalDelta = 0;
          let mostSevereEvent = null; // Track most severe event for crisis context

          result.reputationEvents.forEach(event => {
            // Map State Agent's snake_case faction names to reputation system's format
            const factionMap = {
              'church': 'church',
              'elite': 'elite',
              'common_folk': 'commonFolk',
              'indigenous': 'indigenous',
              'guild': 'guild',
              'merchants': 'merchants'
            };

            const factionKey = factionMap[event.faction];
            if (factionKey) {
              console.log(`[Reputation Event] ${event.faction} → ${factionKey}: ${event.delta > 0 ? '+' : ''}${event.delta} - ${event.reason}`);
              updateReputation(factionKey, event.delta, event.reason);
              // Accumulate approximate overall change (faction deltas contribute to overall)
              totalDelta += event.delta;

              // FIX #1: Magnitude-based crisis detection
              // Track most severe negative event for crisis activation
              if (event.delta < 0 && (!mostSevereEvent || event.delta < mostSevereEvent.delta)) {
                mostSevereEvent = event;
              }
            } else {
              console.warn(`[Reputation Event] Unknown faction: ${event.faction}`);
            }
          });

          // Show UI feedback for reputation change (approximate)
          if (totalDelta !== 0 && setReputationChange) {
            // Rough estimate: faction changes affect overall by ~16% (1/6 factions)
            const estimatedOverallDelta = Math.round(totalDelta / 6);
            if (estimatedOverallDelta !== 0) {
              setReputationChange({ delta: estimatedOverallDelta, timestamp: Date.now() });
              console.log(`[Reputation] Overall reputation changed by approximately ${estimatedOverallDelta > 0 ? '+' : ''}${estimatedOverallDelta}`);
            }
          }

          // FIX #2 & #3: Crisis activation logic
          // Only trigger if crisis is not already active
          if (!gameState.crisis?.active) {
            const newOverall = reputation?.overall || 50; // Get updated reputation after changes
            let crisisTriggered = false;
            let crisisReason = '';
            let crisisContext = '';

            // TRIGGER 1: Severe single event (magnitude < -40)
            if (mostSevereEvent && mostSevereEvent.delta <= -40) {
              crisisTriggered = true;
              crisisReason = `Severe reputation loss with ${mostSevereEvent.faction}`;
              crisisContext = `Maria's actions have caused outrage among ${mostSevereEvent.faction}. Reason: ${mostSevereEvent.reason}. Authorities may investigate or attempt arrest.`;
              console.log(`[Crisis] 🚨 MAGNITUDE TRIGGER: Single event delta ${mostSevereEvent.delta} (threshold: -40)`);
            }

            // TRIGGER 2: Critical overall reputation threshold (< 25)
            if (!crisisTriggered && newOverall < 25) {
              crisisTriggered = true;
              crisisReason = 'Overall reputation critically low';
              crisisContext = `Maria's reputation has plummeted to ${newOverall}/100. She is now infamous in Mexico City. Authorities or vigilantes may seek her out.`;
              console.log(`[Crisis] 🚨 THRESHOLD TRIGGER: Overall reputation ${newOverall} (threshold: <25)`);
            }

            // TRIGGER 3: Catastrophic faction-specific threshold
            // Check if any single faction dropped below 10 (hostile)
            if (!crisisTriggered && reputation?.factions) {
              Object.entries(reputation.factions).forEach(([factionId, score]) => {
                if (score < 10 && !crisisTriggered) {
                  crisisTriggered = true;
                  const factionName = {
                    'church': 'the Church',
                    'elite': 'elite society',
                    'commonFolk': 'common folk',
                    'indigenous': 'indigenous communities',
                    'guild': 'the Medical Guild',
                    'merchants': 'merchant class'
                  }[factionId] || factionId;
                  crisisReason = `Hostile standing with ${factionName}`;
                  crisisContext = `Maria is now considered an enemy by ${factionName} (${score}/100). They may actively work against her or seek retribution.`;
                  console.log(`[Crisis] 🚨 FACTION TRIGGER: ${factionName} at ${score} (threshold: <10)`);
                }
              });
            }

            // Activate crisis if any trigger fired
            if (crisisTriggered) {
              setCrisisState({
                active: true,
                reason: crisisReason,
                context: crisisContext
              });
              console.log(`[Crisis] ⚠️ CRISIS ACTIVATED: ${crisisReason}`);
              console.log(`[Crisis] Context: ${crisisContext}`);

              // Add system message to warn player
              newHistory.push({
                role: 'system',
                content: `⚠️ CRISIS: ${crisisReason} - Expect consequences.`
              });
            }
          } else {
            console.log('[Crisis] Crisis already active, skipping new triggers');
          }
        }

        // Handle location changes with coordinate matching
        if (result.gameState.location && result.gameState.location !== gameState.location) {
          console.log('[Location Change] StateAgent returned:', result.gameState.location);
          console.log('[Location Change] Current location:', gameState.location);

          // Build registry and try to match
          const scenario = scenarioLoader.getScenario(gameState.scenarioId || '1680-mexico-city');
          const registry = buildLocationRegistry(
            scenario,
            currentMapId,
            {
              currentLocationText: result.gameState.location,
              playerPosition,
              currentWorldLocationId: gameState.worldLocationId || null,
              maxWorldLocations: 10
            }
          );
          const locationMatch = matchLocation(result.gameState.location, registry);

          if (locationMatch) {
            console.log('[Location Change] ✓ Matched to registry:', locationMatch);

            // Update map if different
            if (locationMatch.mapId !== currentMapId) {
              console.log('[Location Change] Switching map:', currentMapId, '→', locationMatch.mapId);
              setCurrentMapId(locationMatch.mapId);
            }

            // Calculate spawn position
            let spawnX, spawnY;

            // For building entrances (entering interior), use interiorSpawn if available
            if (locationMatch.type === 'building' && locationMatch.interiorSpawn) {
              [spawnX, spawnY] = locationMatch.interiorSpawn;
              console.log('[Location Change] Using interior spawn point:', spawnX, spawnY);
            } else {
              // For rooms and exits, use the position directly
              spawnX = locationMatch.position.x;
              spawnY = locationMatch.position.y;
              console.log('[Location Change] Using standard spawn point:', spawnX, spawnY);
            }

            // Calculate grid position from spawn point
            const gridX = Number.isFinite(locationMatch.gridX)
              ? locationMatch.gridX
              : Math.floor(spawnX / 20);
            const gridY = Number.isFinite(locationMatch.gridY)
              ? locationMatch.gridY
              : Math.floor(spawnY / 20);

            setPlayerPosition({
              x: spawnX,
              y: spawnY,
              gridX,
              gridY
            });

            // Update location text
            updateLocation(locationMatch.fullName);

            console.log('[Location Change] ✓ Teleported to:', {
              location: locationMatch.fullName,
              mapId: locationMatch.mapId,
              position: { x: spawnX, y: spawnY, gridX, gridY }
            });
          } else {
            // No match - just update text, keep current position
            console.log('[Location Change] No registry match, updating text only');
            updateLocation(result.gameState.location);
          }
        } else if (result.gameState.location) {
          // Location same as before, no change needed
          console.log('[Location Change] Location unchanged:', result.gameState.location);
      }

      if (result.gameState.time && result.gameState.date) {
        advanceTime({
          time: result.gameState.time,
          date: result.gameState.date,
          location: result.gameState.location || gameState.location
        });
      }
      // Update player position if movement occurred (with validation)
        // Only accept position updates with valid pixel coordinates (x, y)
        // Ignore grid-only coordinates from StateAgent - we manage position ourselves
        // CRITICAL: Don't update position from StateAgent during movement turns
        // useNavigationHandlers already updated position with correct gridX/gridY
        // StateAgent only returns {x, y} which would strip grid coordinates causing NaN
        const isMovementTurn = narrativeText.toLowerCase().match(/\b(go|walk|move|head|travel)\s+(north|south|east|west)\b/);

        if (!isMovementTurn && result.gameState.position &&
            typeof result.gameState.position.x === 'number' &&
            typeof result.gameState.position.y === 'number' &&
            !isNaN(result.gameState.position.x) &&
            !isNaN(result.gameState.position.y)) {
          setPlayerPosition(result.gameState.position);
          console.log(`[Position] Player position updated to: (${result.gameState.position.x}, ${result.gameState.position.y})`);
        } else if (isMovementTurn) {
          console.log('[Position] Skipping StateAgent position update during movement (already set by useNavigationHandlers)');
        } else if (result.gameState.position) {
          console.log('[Position] Ignoring incomplete position data from StateAgent:', result.gameState.position);
          // Keep current position - StateAgent doesn't have enough info to update it
        }
      }

      if (result.crisisResolution && result.crisisResolution.status && result.crisisResolution.status !== 'ongoing' && (gameState.crisis?.active || result.crisisResolution.gameOver)) {
        const resolution = result.crisisResolution;
        const outcome = resolution.status;

        setCrisisState(prev => ({
          ...prev,
          active: false,
          lastOutcome: outcome,
          resolvedTurn: turnNumber
        }));

        if (resolution.gameOver && !gameState.isGameOver) {
          triggerGameOver({
            type: outcome,
            reason: resolution.gameOverReason || 'Crisis concluded',
            narrative: result.narrative
          });
        }

        let message = '';
        switch (outcome) {
          case 'escaped':
            message = '⚠️ You slipped away from the authorities. Expect consequences.';
            break;
          case 'bribed':
            message = `💰 Crisis resolved through bribery${resolution.wealthChange ? ` (${resolution.wealthChange > 0 ? '+' : ''}${resolution.wealthChange} reales)` : ''}.`;
            break;
          case 'surrendered':
            message = '⚖️ Maria surrendered and is taken into custody.';
            break;
          case 'captured':
            message = '⚖️ Maria was captured while attempting to flee.';
            break;
          case 'killed':
            message = '☠️ Maria perished during the confrontation.';
            break;
          default:
            message = `⚠️ Crisis resolved (${outcome}).`;
        }

        if (message) {
          crisisSystemMessages.push(message);
        }
      }

      // Log movement details
      if (result.movement) {
        if (result.movement.valid) {
          console.log(`[Movement] ✓ Moved ${result.movement.direction}`);
          if (result.movement.nearbyLocations && result.movement.nearbyLocations.length > 0) {
            console.log(`[Movement] Nearby: ${result.movement.nearbyLocations.map(l => l.name).join(', ')}`);
          }
        } else {
          console.log(`[Movement] ✗ Blocked: ${result.movement.reason}`);
        }
      }

      // Handle inventory changes
      if (result.inventoryChanges && result.inventoryChanges.length > 0) {
        for (const change of result.inventoryChanges) {
          updateInventory(change.item, change.quantity, change.action);

          if (change.action === 'bought' || change.action === 'foraged' || change.action === 'received') {
            await generateNewItemDetails(change.item);

            // PHASE 1: Document detection and auto-open
            // Check if item is a readable document (letter, codex, map, etc.)
            const isReadable = change.isReadable || isDocumentItem(change.item);

            if (isReadable && change.action === 'received') {
              console.log('[DocumentSystem] Readable document received:', change.item);

              // Extract document metadata (author, giver, purpose)
              const metadata = extractDocumentMetadata(
                change.item,
                result.narrative || historyOutput,
                change
              );

              // Determine document type (letter, codex, map, etc.)
              const documentType = change.documentType || getDocumentType(change.item);

              // Create document data object
              const documentData = {
                name: change.item,
                type: documentType,
                description: `A ${documentType} that was just received`,
                metadata: {
                  ...metadata,
                  turnReceived: turnNumber,
                  dateReceived: gameState.date,
                  location: gameState.location
                },
                // Pass narrative context for better LLM generation
                narrativeContext: result.narrative || historyOutput
              };

              console.log('[DocumentSystem] Document data:', documentData);

              // Add document to permanent library
              addDocument(documentData);

              // Set pending document for modal display
              setPendingDocument(documentData);

              // Auto-open if appropriate (direct handoff, story-critical)
              const autoOpen = shouldAutoOpenDocument(documentData, result.narrative || historyOutput);

              if (autoOpen) {
                console.log('[DocumentSystem] Auto-opening document modal');
                // Delay slightly so narrative renders first
                setTimeout(() => {
                  setIsDocumentModalOpen(true);
                }, 800);
              } else {
                console.log('[DocumentSystem] Document queued, showing notification');
                toast.info(`📜 New document received: ${change.item}`, { duration: 4000 });
                // Open modal after a longer delay
                setTimeout(() => {
                  setIsDocumentModalOpen(true);
                }, 1500);
              }
            }
          }
        }
      }

      // Handle relationship changes and reputation feedback
      if (result.relationshipChanges && result.relationshipChanges.length > 0) {
        console.log(`[Relationship] Processing ${result.relationshipChanges.length} relationship changes`);

        for (const change of result.relationshipChanges) {
          // Look up NPC by name (more reliable than ID due to kebab-case inconsistencies)
          const npc = entityManager.getByName(change.npcName);

          if (!npc) {
            console.warn(`[Reputation] NPC not found for relationship change: ${change.npcName}`);
            continue;
          }

          // Update relationship graph using NPC's actual ID
          relationshipGraph.updateRelationship(
            npc.id,
            'player',
            change.delta,
            change.reason
          );

          console.log(`[Relationship] ${change.npcName}: ${change.delta > 0 ? '+' : ''}${change.delta} (${change.reason})`);

          // Calculate overall reputation before update
          const oldOverall = reputation?.overall || 50;
          console.log(`[Reputation Debug] OLD overall: ${oldOverall}, OLD state:`, reputation);

          // Update faction reputation based on NPC relationship change
          const newReputation = updateFactionFromNPCInteraction(
            reputation,
            npc,
            change.delta,
            change.reason
          );

          if (newReputation) {
            setReputation(newReputation);
            console.log('[Reputation] Updated faction reputation from relationship change');

            // Calculate overall reputation delta and show UI feedback
            const newOverall = newReputation.overall || 50;
            console.log(`[Reputation Debug] NEW overall: ${newOverall}, NEW state:`, newReputation);
            const overallDelta = Math.round(newOverall - oldOverall);

            if (overallDelta !== 0 && setReputationChange) {
              setReputationChange({ delta: overallDelta, timestamp: Date.now() });
              console.log(`[Reputation] Overall reputation changed by ${overallDelta > 0 ? '+' : ''}${overallDelta} (${oldOverall} → ${newOverall})`);
            }
          }
        }

        // CRISIS DETECTION FOR RELATIONSHIP-BASED REPUTATION CHANGES
        // Check after all relationship changes are processed
        if (!gameState.crisis?.active && result.relationshipChanges.length > 0) {
          // Find most severe relationship change
          let mostSevere = null;
          for (const change of result.relationshipChanges) {
            if (change.delta < 0 && (!mostSevere || change.delta < mostSevere.delta)) {
              const npc = entityManager.getByName(change.npcName);
              mostSevere = { ...change, npc };
            }
          }

          if (mostSevere) {
            const currentOverall = reputation?.overall || 50;
            let crisisTriggered = false;
            let crisisReason = '';
            let crisisContext = '';

            // TRIGGER 1: Severe relationship change (delta <= -15)
            if (mostSevere.delta <= -15) {
              crisisTriggered = true;
              const factionName = mostSevere.npc?.social?.faction || 'unknown faction';
              crisisReason = `Violent action against ${mostSevere.npcName}`;
              crisisContext = `Maria committed a serious offense: ${mostSevere.reason}. ${mostSevere.npcName} is a member of ${factionName}. Witnesses may report this to authorities, leading to arrest or confrontation.`;
              console.log(`[Crisis] 🚨 RELATIONSHIP TRIGGER: Severe action against ${mostSevere.npcName} (delta: ${mostSevere.delta})`);
            }

            // TRIGGER 2: Critical overall reputation (< 25)
            if (!crisisTriggered && currentOverall < 25) {
              crisisTriggered = true;
              crisisReason = 'Overall reputation critically low';
              crisisContext = `Maria's reputation has plummeted to ${currentOverall}/100. She is now infamous in Mexico City. Authorities or vigilantes may seek her out.`;
              console.log(`[Crisis] 🚨 THRESHOLD TRIGGER: Overall reputation ${currentOverall} (threshold: <25)`);
            }

            // TRIGGER 3: Hostile faction (< 10)
            if (!crisisTriggered && reputation?.factions) {
              Object.entries(reputation.factions).forEach(([factionId, score]) => {
                if (score < 10 && !crisisTriggered) {
                  crisisTriggered = true;
                  const factionNames = {
                    'church': 'the Church', 'elite': 'elite society', 'commonFolk': 'common folk',
                    'indigenous': 'indigenous communities', 'guild': 'the Medical Guild', 'merchants': 'merchant class'
                  };
                  crisisReason = `Hostile standing with ${factionNames[factionId] || factionId}`;
                  crisisContext = `Maria is now considered an enemy by ${factionNames[factionId] || factionId} (${score}/100). They may actively work against her or seek retribution.`;
                  console.log(`[Crisis] 🚨 FACTION TRIGGER: ${factionNames[factionId]} at ${score} (threshold: <10)`);
                }
              });
            }

            // Activate crisis
            if (crisisTriggered) {
              setCrisisState({ active: true, reason: crisisReason, context: crisisContext });
              console.log(`[Crisis] ⚠️ CRISIS ACTIVATED (from relationship): ${crisisReason}`);
              newHistory.push({ role: 'system', content: `⚠️ CRISIS: ${crisisReason} - Expect consequences.` });
            }
          }
        }
      }

      // CARD PRIORITY SYSTEM: Check if simpleInteraction is active
      // Used to prevent multiple cards appearing on same turn
      const rawSimpleInteraction = result.simpleInteraction;
      const simpleInteractionType = rawSimpleInteraction?.type || 'null';
      const isMedicalSimpleInteraction = ['house_call', 'house_call_request', 'medical_diagnosis'].includes(simpleInteractionType);
      let effectiveSimpleInteraction = isMedicalSimpleInteraction ? null : rawSimpleInteraction;
      let hasSimpleInteraction = effectiveSimpleInteraction && effectiveSimpleInteraction.type && effectiveSimpleInteraction.type !== 'null';

      const medicalIntents = new Set(['medical_diagnosis', 'medical_purchase', 'medical_followup', 'house_call']);
      const currentIntent = result.interactionIntent || 'none';

      if (medicalIntents.has(currentIntent)) {
        if (hasSimpleInteraction) {
          console.log('[SimpleInteraction] Overriding simple interaction due to medical intent:', currentIntent, simpleInteractionType);
        }
        effectiveSimpleInteraction = null;
        hasSimpleInteraction = false;
      }

      if (isMedicalSimpleInteraction ||
          (medicalIntents.has(currentIntent) && rawSimpleInteraction && rawSimpleInteraction.type && rawSimpleInteraction.type !== 'null')) {
        setPendingSimpleInteraction(null);
      }

      // Handle contract offers (treatment or sale)
      // Store contract offer but DON'T auto-open modal
      // Player will see a clickable card in NarrativePanel
      // Only show card when StateAgent confirms with system announcement
      // This ensures contracts appear when NPC makes a CLEAR REQUEST (any turn)
      // but not for vague mentions or completed transactions
      // GUARD: Skip if simpleInteraction is already handling this turn (prevent duplicate cards)
      if (!hasSimpleInteraction &&
          result.contractOffer &&
          result.contractOffer.type &&
          result.contractOffer.type !== 'null' &&
          result.systemAnnouncements?.some(msg => msg.toLowerCase().includes('contract'))) {

        // Treatment contract detected
        console.log('[Contract] Offer finalized and ready for player decision:', result.contractOffer.type, result.contractOffer);
        // Store in conversation history so card stays in place
        assistantMessage.card = {
          type: 'contract',
          data: result.contractOffer
        };
        setPendingContract(result.contractOffer);
        // Note: Modal/card is NOT auto-opened, user must click the card
      } else if (hasSimpleInteraction && result.contractOffer?.type && result.contractOffer.type !== 'null') {
        console.log('[Contract] Skipped - simpleInteraction already active (prevents duplicate cards)');
      } else if (result.contractOffer && result.contractOffer.type && result.contractOffer.type !== 'null') {
        // Contract detected but StateAgent didn't confirm with announcement
        // This means it's a vague mention or not yet finalized
        console.log('[Contract] Offer detected but not confirmed by StateAgent (no announcement):', result.contractOffer.type);
        // Don't show card yet - let negotiation continue
      } else {
        // Clear any previous contract when none is active
        if (result.contractOffer && result.contractOffer.type === 'null') {
          console.log('[Contract] No active contract, clearing previous offer');
          setPendingContract(null);

          // CARD CLEANUP: Remove contract cards from conversation history
          setConversationHistory(prev => {
            return prev.map(msg => {
              // Remove contract cards from assistant messages
              if (msg.role === 'assistant' && msg.card && msg.card.type === 'contract') {
                const { card, ...msgWithoutCard } = msg;
                console.log('[Contract] Removing card from history entry:', msg.card.type);
                return msgWithoutCard;
              }
              return msg;
            });
          });
        }
      }

      if (result.houseCallTravel && setPendingHouseCall) {
        try {
          const travel = result.houseCallTravel;
          const patientName = travel.patientName || 'Unnamed Patient';
          const locationName = travel.patientLocation || 'Unknown residence';

          const travelKey = `${patientName}|${locationName}|${travel.paymentOffered || 0}`;
          if (lastHouseCallKeyRef.current !== travelKey) {
            lastHouseCallKeyRef.current = travelKey;

            let patientEntity = entityManager.getByName(patientName);

            if (!patientEntity) {
              patientEntity = entityManager.register({
                id: `housecall-${Date.now()}`,
                name: patientName,
                entityType: 'patient',
                type: 'patient',
                clickable: false,
                description: travel.patientDescription || 'Patient awaiting Maria\'s treatment.',
                appearance: travel.patientDescription || 'Unspecified appearance',
                social: {
                  class: 'unknown'
                },
                metadata: {
                  representedBy: travel.emissaryName || null
                }
              });
            }

            const houseCallData = getHouseCallData(patientEntity, locationName);
            houseCallData.paymentAmount = travel.paymentOffered || 0;
            houseCallData.ailmentDescription = travel.ailmentDescription || patientEntity.description;

            // CRITICAL: Switch to exterior map BEFORE travel animation starts
            // This ensures the travel path is shown on the city map, not interior
            if (setCurrentMapId) {
              console.log('[HouseCall] Switching to exterior map for travel animation');
              setCurrentMapId('mexico-city-center');
            }

            if (setTravelAnimationState) {
              setTravelAnimationState(null);
            }
            setPendingHouseCall(houseCallData);
            setPendingContract(null);

            if (toast) {
              toast.success(`Traveling to ${locationName} to treat ${patientEntity.name}.`, { duration: 3000 });
            }
          }
        } catch (error) {
          console.error('[HouseCall] Failed to initialize house call travel:', error);
        }
      }

      // Prescription Offer Outcome Processing
      // Handles results when NPC accepts/declines/bargains on prescription offers
      if (result.prescriptionOfferOutcome && result.prescriptionOfferOutcome.occurred) {
        const outcome = result.prescriptionOfferOutcome;
        console.log('[PrescriptionOutcome] Detected:', outcome);

        if (outcome.outcome === 'accepted') {
          // Apply inventory and wealth changes
          updateInventory(outcome.item, -outcome.amount);
          updateWealth(outcome.finalPrice);

          // Log transaction to ledger
          const transactionManager = getTransactionManager(scenarioId);
          const currentWealth = (gameState.wealth || 0) + outcome.finalPrice;
          transactionManager.logTransaction(
            'income',
            TRANSACTION_CATEGORIES.MEDICINE_SALES,
            `Prescribed ${outcome.amount}× ${outcome.item} to ${outcome.recipientName} (${outcome.route} route)`,
            outcome.finalPrice,
            currentWealth,
            gameState.date,
            gameState.time
          );

          // Add to medical records (Patient Roster)
          let npcEntity = entityManager.getByName(outcome.recipientName);

          if (!npcEntity) {
            const recentNPCs = npcTracker.getRecentNPCs();
            const matchedName = recentNPCs.find(name => name.toLowerCase() === outcome.recipientName.toLowerCase());
            if (matchedName) {
              npcEntity = entityManager.getByName(matchedName);
            }
          }

          if (!npcEntity) {
            console.warn(`[PrescriptionOutcome] NPC entity not found for ${outcome.recipientName}, creating minimal record`);
            npcEntity = {
              id: `npc_${outcome.recipientName.replace(/\s+/g, '_').toLowerCase()}`,
              name: outcome.recipientName,
              entityType: 'npc'
            };
          }

          const sessionData = {
            date: gameState.date,
            turnNumber: turnNumber,
            sessionType: 'purchase',
            prescriptions: [{
              medicine: outcome.item,
              route: outcome.route,
              dosage: `${outcome.amount} ${outcome.amount === 1 ? 'drachm' : 'drachms'}`,
              price: outcome.finalPrice,
              bloodletting: outcome.includeBloodletting ? `${outcome.bloodAmount} ounces` : 'None'
            }],
            outcome: 'Completed',
            payment: outcome.finalPrice,
            ailment: 'Prescription purchase'
          };

          setGameState(prev => ({
            ...prev,
            medicalRecords: MedicalRecordsManager.addSession(
              prev.medicalRecords || {},
              npcEntity,
              sessionData
            )
          }));

          // Success toast
          if (toast) {
            const bloodlettingNote = outcome.includeBloodletting ? ` (with ${outcome.bloodAmount}oz bloodletting)` : '';
            toast.success(`${outcome.recipientName} purchased prescription for ${outcome.finalPrice} reales${bloodlettingNote}`, { duration: 3000 });
          }

          console.log('[PrescriptionOutcome] Transaction completed:', {
            item: outcome.item,
            amount: outcome.amount,
            price: outcome.finalPrice,
            recipient: outcome.recipientName
          });

        } else if (outcome.outcome === 'declined') {
          // NPC declined - no inventory/wealth changes
          if (toast) {
            toast.info(`${outcome.recipientName} declined the prescription`, { duration: 2500 });
          }
          console.log('[PrescriptionOutcome] Offer declined by:', outcome.recipientName);

        } else if (outcome.outcome === 'bargained') {
          // NPC wants to negotiate - could show follow-up or just narrate
          if (toast) {
            toast.info(`${outcome.recipientName} wants to negotiate the price`, { duration: 2500 });
          }
          console.log('[PrescriptionOutcome] Price negotiation:', outcome.recipientName, 'offered:', outcome.finalPrice);

          // If they bargained AND accepted at lower price, apply the transaction
          if (outcome.finalPrice > 0) {
            updateInventory(outcome.item, -outcome.amount);
            updateWealth(outcome.finalPrice);

            const transactionManager = getTransactionManager(scenarioId);
            const currentWealth = (gameState.wealth || 0) + outcome.finalPrice;
            transactionManager.logTransaction(
              'income',
              TRANSACTION_CATEGORIES.MEDICINE_SALES,
              `Prescribed ${outcome.amount}× ${outcome.item} to ${outcome.recipientName} (negotiated price)`,
              outcome.finalPrice,
              currentWealth,
              gameState.date,
              gameState.time
            );

            if (toast) {
              toast.success(`Negotiated: Sold for ${outcome.finalPrice} reales`, { duration: 2500 });
            }
          }
        }
      }

      // Action Prompt Processing (give/sell/prescribe requests)
      // GUARD: Skip if simpleInteraction is already handling this turn (prevent duplicate cards)
      console.log('[ActionPrompt DEBUG] result.actionPrompt:', result.actionPrompt);
      if (!hasSimpleInteraction &&
          result.actionPrompt &&
          result.actionPrompt.type &&
          result.actionPrompt.type !== 'null') {
        console.log('[ActionPrompt] Request detected:', result.actionPrompt);

        // Add portrait from current NPC if available
        const enrichedPrompt = {
          ...result.actionPrompt,
          npcPortrait: result.actionPrompt.npcPortrait || (primaryPortraitFile ? `/portraits/${primaryPortraitFile}` : null)
        };

        // Store in conversation history so card stays in place
        assistantMessage.card = {
          type: 'action_prompt',
          data: enrichedPrompt
        };

        setPendingActionPrompt(enrichedPrompt);
      } else if (hasSimpleInteraction && result.actionPrompt?.type && result.actionPrompt.type !== 'null') {
        console.log('[ActionPrompt] Skipped - simpleInteraction already active (prevents duplicate cards)');
      } else if (result.actionPrompt && result.actionPrompt.type === 'null') {
        // Clear action prompt when none is active
        console.log('[ActionPrompt] No active prompt, clearing');
        setPendingActionPrompt(null);

        // Remove action_prompt cards from conversation history
        setConversationHistory(prev => {
          return prev.map(msg => {
            if (msg.role === 'assistant' && msg.card && msg.card.type === 'action_prompt') {
              const { card, ...msgWithoutCard } = msg;
              console.log('[ActionPrompt] Removing card from history entry');
              return msgWithoutCard;
            }
            return msg;
          });
        });
      }

      // Purchase Offer Processing (vendor selling TO Maria)
      // GUARD: Skip if simpleInteraction is already handling this turn (prevent duplicate cards)
      console.log('[PurchaseOffer DEBUG] result.purchaseOffer:', result.purchaseOffer);
      if (!hasSimpleInteraction &&
          result.purchaseOffer &&
          result.purchaseOffer.type &&
          result.purchaseOffer.type !== 'null') {
        console.log('[PurchaseOffer] Vendor offer detected:', result.purchaseOffer);

        // Add portrait from current NPC if available
        const enrichedOffer = {
          ...result.purchaseOffer,
          npcPortrait: result.purchaseOffer.npcPortrait || (primaryPortraitFile ? primaryPortraitFile : null)
        };

        // Store in conversation history so card stays in place
        assistantMessage.card = {
          type: 'purchase_offer',
          data: enrichedOffer
        };

        setPendingPurchaseOffer(enrichedOffer);
      } else if (hasSimpleInteraction && result.purchaseOffer?.type && result.purchaseOffer.type !== 'null') {
        console.log('[PurchaseOffer] Skipped - simpleInteraction already active (prevents duplicate cards)');
      } else if (result.purchaseOffer && result.purchaseOffer.type === 'null') {
        // Clear purchase offer when none is active
        console.log('[PurchaseOffer] No active offer, clearing');
        setPendingPurchaseOffer(null);

        // Remove purchase_offer cards from conversation history
        setConversationHistory(prev => {
          return prev.map(msg => {
            if (msg.role === 'assistant' && msg.card && msg.card.type === 'purchase_offer') {
              const { card, ...msgWithoutCard } = msg;
              console.log('[PurchaseOffer] Removing card from history entry');
              return msgWithoutCard;
            }
            return msg;
        });
      });
    }

    if (!result.houseCallTravel) {
      lastHouseCallKeyRef.current = null;
      if (setTravelAnimationState) {
        setTravelAnimationState(null);
      }
    }

      // Trade Opportunity Processing
      // Add trade opportunities from narrative when NPC expresses buy/sell interest
      if (result.tradeOpportunity &&
          result.tradeOpportunity.type &&
          result.tradeOpportunity.type !== 'null' &&
          turnNumber >= 2) {
        console.log('[Trade] Opportunity detected:', result.tradeOpportunity.type, result.tradeOpportunity);
        addTradeOpportunity(result.tradeOpportunity);
      }

      // Clean up expired trade opportunities
      cleanupExpiredOpportunities();

      // Simple Interaction Processing
      // Detect fast gameplay loops (service offers, donations, competitive checks, etc.)
      if (effectiveSimpleInteraction &&
          effectiveSimpleInteraction.type &&
          effectiveSimpleInteraction.type !== 'null') {
        // Keep all simpleInteractions as simpleInteraction cards (no conversion to purchaseOffer)
        {
          console.log('[SimpleInteraction] Detected:', simpleInteractionType, rawSimpleInteraction);
          assistantMessage.card = {
            type: 'simple_interaction',
            data: effectiveSimpleInteraction
          };
          setPendingSimpleInteraction(effectiveSimpleInteraction);
        }
      } else if (rawSimpleInteraction && rawSimpleInteraction.type === 'null') {
        // Clear any previous simple interaction when none is active
        console.log('[SimpleInteraction] No active interaction, clearing previous');
        setPendingSimpleInteraction(null);

        // CARD CLEANUP: Remove simple_interaction cards from conversation history
        setConversationHistory(prev => {
          return prev.map(msg => {
            // Remove simple_interaction cards from assistant messages
            if (msg.role === 'assistant' && msg.card && msg.card.type === 'simple_interaction') {
              const { card, ...msgWithoutCard } = msg;
              console.log('[SimpleInteraction] Removing card from history entry');
              return msgWithoutCard;
            }
            return msg;
          });
        });
      }

      // Offer Prompt Detection
      // When narrative prompts player to offer an item from inventory
      if (result.offerPrompt && result.offerPrompt.triggered) {
        console.log('[OfferPrompt] Detected offer opportunity:', result.offerPrompt);
        // Set offer recipient data and open modal
        setOfferRecipient({
          name: result.offerPrompt.recipientName,
          context: result.offerPrompt.context
        });
        // Auto-open the offer modal so player can choose what to give
        openModal('offer');
      }

      // Random Event Processing
      // Check for random events after narrative (adds variety and fast gameplay)
      // Only trigger if no simple interaction is active (avoid stacking interactions)
      if (!effectiveSimpleInteraction) {
        const eventCard = checkForRandomEvent(
          gameState,
          reputation,
          narrativeText
        );

        if (eventCard) {
          console.log('[RandomEvent] Event triggered:', eventCard.title);
          // Store in conversation history so card stays in place
          assistantMessage.card = {
            type: 'random_event',
            data: eventCard
          };
          setPendingRandomEvent(eventCard);
        } else {
          // Clear any previous random event
          setPendingRandomEvent(null);
        }
      }

      // Add journal entry
      if (result.journalEntry) {
        setJournal(prevJournal => [...prevJournal, { content: result.journalEntry, type: 'auto' }]);
      }

      // Detect action type and apply resource changes
      let actionType = 'chat';
      const lowerInput = narrativeText.toLowerCase();

      if (lowerInput.includes('study') || lowerInput.includes('read')) {
        actionType = 'study';
      } else if (lowerInput.includes('forage') || lowerInput.includes('search') || lowerInput.includes('gather')) {
        actionType = 'forage';
      } else if (lowerInput.includes('mix') || lowerInput.includes('prepare medicine') || lowerInput.includes('compound')) {
        actionType = 'mix';
      } else if (lowerInput.includes('patient') || lowerInput.includes('examine') || lowerInput.includes('treat')) {
        actionType = 'seePatients';
      } else if (lowerInput.includes('travel') || lowerInput.includes('go to') || lowerInput.includes('visit')) {
        actionType = 'travel';
      } else if (lowerInput.includes('buy') || lowerInput.includes('purchase') || lowerInput.includes('shop')) {
        actionType = 'buy';
      }

      // Apply minimal energy cost for narrative turns (1 energy per turn)
      // This represents mental fatigue from conversation/thinking
      if (actionType === 'chat') {
        const currentEnergy = energy || 50;
        const newEnergy = Math.max(0, currentEnergy - 1);
        updateEnergy(newEnergy);
        console.log('[Energy] Narrative turn cost: -1 energy');
      }

      // If StateAgent didn't advance time, add default 5 minutes for conversational turn
      if (!result.gameState?.time && actionType === 'chat') {
        advanceTime({ minutes: 5 });
        console.log('[Time] Default narrative turn: +5 minutes');
      }

      resourceHandlers.applyResourceChanges(actionType);

    } catch (error) {
      console.error("Error fetching data:", error);
      setHistoryOutput(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }

    setUserInput('');

  }, [
    conversationHistory,
    gameState,
    turnNumber,
    userInput,
    npcTracker,
    reputation,
    reputationEmoji,
    currentWealth,
    updateInventory,
    updateLocation,
    advanceTime,
    generateNewItemDetails,
    setJournal,
    setIsLoading,
    setHistoryOutput,
    setConversationHistory,
    setTurnNumber,
    setUserInput,
    setSelectedNpcName,
    setShowSymptomsPopup,
    setIsBuyOpen,
    setIsPrescribePopupOpen,
    setIsSleepOpen,
    setWealth,
    setUserActions,
    setIsEatOpen,
    setIsForageOpen,
    setNPCPosition,
    currentMapData,
    playerPosition,
    currentMapId,
    npcPositions,
    setPlayerPosition,
    setCurrentMapId,
    setGameLog,
    energy,
    updateEnergy,
    resourceHandlers,
    // CRITICAL FIX: Added missing dependencies to prevent stale closures
    // Note: isLoading is now a parameter, automatically tracked by React
    playerSkills, // Used for skill checks (bookkeeping, anatomy)
    journal, // Used in orchestrateTurn
    setPrimaryPortraitFile, // Used for portrait updates
    setDynamicChips, // Used for narrative-driven action chips
    setCurrentEntities, // Used for entity tracking
    setPendingContract, // Used for contract offers
    addTradeOpportunity, // Used for trade opportunities
    cleanupExpiredOpportunities, // Used for trade cleanup
    setPendingSimpleInteraction, // Used for simple interactions
    setPendingRandomEvent, // Used for random events
    toggleShopSign, // Used for shop sign toggle
    navigationHandlers, // Used for fast travel
    toast, // Used throughout for notifications
    setIsRestDurationOpen, // Used for sleep command
    setIsFastTravelOpen, // Used for travel command
    setIsBloodlettingOpen, // Used for bloodlet command
    setIsLedgerOpen, // Used for ledger command
    setShowExitConfirmation, // Used for exit confirmation
    setPendingExitData, // Used for exit data
    addJournalEntry, // Used for journal entries
    addToHistory, // Used for conversation history
    clearConversationLock,
    setCrisisState,
    triggerGameOver
  ]);

  // PHASE 2.3: Initialize commerce handlers hook
  // NOTE: Must come AFTER handleSubmit is defined
  const commerceHandlers = useCommerceHandlers({
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
    setPendingActionPrompt,
    setShowMixingPopup,
    setGameState,
    recentPortraitRef, // Portrait ref for clearing on NPC dismissal
    previousPortraitEntityRef, // Portrait entity ref for clearing on NPC dismissal
    handleSubmit, // For triggering full narrative turns after simple interactions
    conversationHistory, // For NarrativeAgent context
    journal, // For NarrativeAgent context
    // Legacy params
    gameState,
    turnNumber,
    npcTracker,
  });

  // ARROW KEY MOVEMENT HANDLER
  // PHASE 2.1: handleMovement moved to useNavigationHandlers.js

  // PHASE 2.5: handleQuickAction moved to useUIHandlers.js

  // PHASE 2.5: handleActionClick moved to useUIHandlers.js

  // PHASE 2.5: handleCommandClick moved to useUIHandlers.js

  // PHASE 2.5: handleSaveGame moved to useUIHandlers.js
  // PHASE 2.5: handleTabChange moved to useUIHandlers.js

  // ============================================================================
  // SECTION 5: EVENT COORDINATORS
  // Handlers for entity clicks, random events, and furniture interactions
  // ============================================================================

  const handleEntityClick = useCallback((entityType, entityName) => {
    console.log('[Entity Click]', entityType, entityName);

    // Get entity from EntityManager or EntityList
    const EntityList = require('../../EntityList').default;
    const entity = EntityList.find(e => e.name === entityName);

    if (!entity) {
      console.warn(`[Entity Click] Entity not found: ${entityName}`);
      return;
    }

    if (entityType === 'patient' || entity.type === 'patient') {
      // Open Patient View tab and set active patient
      setActivePatient(entity);
      setActiveTab('patient');
      setPatientDialogue([]); // Clear previous dialogue
    } else if (entityType === 'npc' || entity.type === 'npc') {
      // Open NPC modal
      console.log('[Entity Click] NPC clicked:', entityName);
      setSelectedNPC(entity);
      setShowNPCModal(true);
    } else if (entityType === 'item') {
      // Open item modal
      console.log('[Entity Click] Item clicked:', entityName);
      setSelectedItem(entity);
      setShowItemModal(true);
    }
  }, [setActivePatient, setActiveTab, setPatientDialogue, setSelectedNPC, setShowNPCModal, setSelectedItem, setShowItemModal]);

  // PHASE 2.2: handleAskQuestion moved to useMedicalHandlers.js

  // Helper: Build prompt for item action
  // PHASE 2.6: buildItemActionPrompt moved to useItemHandlers.js
  // PHASE 2.6: parseItemActionOutcome moved to useItemHandlers.js
  // PHASE 2.6: handleItemAction moved to useItemHandlers.js

  // CONTRACT HANDLERS

  // Handle accepting treatment contract
  // PHASE 2.2: handleAcceptTreatment moved to useMedicalHandlers.js

  // PHASE 2.3: handleAcceptSale moved to useCommerceHandlers.js

  // PHASE 2.2: handleDeclineContract moved to useMedicalHandlers.js

  // EXPLICIT ENTER BUILDING HANDLER (for clicking building on map)
  // PHASE 2.1: handleEnterBuilding and handleExitBuilding moved to useNavigationHandlers.js

  // PHASE 2.3: handleAcceptTrade and handleDeclineTrade moved to useCommerceHandlers.js

  // PHASE 2.3: handleSimpleInteractionChoice moved to useCommerceHandlers.js

  /**
   * Handle random event choice
   */
  const handleRandomEventChoice = useCallback(async (action, eventCard) => {
    console.log('[RandomEvent] Player chose:', action, eventCard);

    const { eventId, title, category } = eventCard;

    // Process the choice using the event service
    const result = processEventChoice(
      eventId,
      action,
      gameState,
      updateReputation,
      updateInventory
    );

    if (!result) {
      console.error('[RandomEvent] Failed to process choice');
      toast.error('Failed to process event choice', { duration: 2000 });
      return;
    }

    const { narrative, xpGained, costs, results, outcome } = result;

    // Apply costs
    if (costs.wealth) {
      setWealth(currentWealth + costs.wealth); // costs.wealth is already negative
    }
    if (costs.energy) {
      setEnergy(prev => prev + costs.energy); // costs.energy is already negative
    }
    if (costs.health) {
      setHealth(prev => prev + costs.health); // costs.health is already negative
    }

    // Award XP
    if (xpGained > 0) {
      awardXP(xpGained, `random_event_${category}`);
    }

    // Advance time (random events take 5-10 minutes)
    advanceTime({ minutes: 10 });

    // Build journal text
    const journalText = `Random Event: ${title} - ${narrative}`;

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: journalText
    });

    // Add to conversation history
    setConversationHistory(prev => [...prev, {
      role: 'assistant',
      content: narrative,
      responseType: 'random_event_outcome'
    }]);

    // Clear the pending random event
    setPendingRandomEvent(null);

    // Show toast notification
    let toastMessage = narrative.substring(0, 80);
    if (xpGained > 0) {
      toastMessage += ` (+${xpGained} XP)`;
    }
    toast.success(toastMessage, { duration: 3000 });

    console.log('[RandomEvent] Choice processed:', {
      action,
      xp: xpGained,
      costs,
      results
    });

  }, [
    gameState,
    updateInventory,
    setWealth,
    setEnergy,
    setHealth,
    awardXP,
    advanceTime,
    addJournalEntry,
    turnNumber,
    setConversationHistory,
    setPendingRandomEvent,
    toast
  ]);

  /**
   * Handle furniture/POI click from interactive map
   * Opens POIModal if detail image exists for the furniture
   */
  const handleFurnitureClick = useCallback((furnitureItem) => {
    const furnitureName = furnitureItem.name || furnitureItem.id;
    console.log('[GameHandlers] Furniture clicked:', furnitureName, furnitureItem);

    // Check if detail image exists for this furniture
    const detailImagePath = getDetailImagePathSync(furnitureName);

    if (!detailImagePath) {
      console.log('[GameHandlers] No detail image for:', furnitureName);
      // Optionally show a toast or do nothing
      toast.info(`No detailed view available for ${furnitureName}`, { duration: 2000 });
      return;
    }

    console.log('[GameHandlers] Found detail image:', detailImagePath);

    // Get entity data from EntityManager (furniture items should be registered)
    const entityData = entityManager.getByName(furnitureName);

    if (entityData) {
      // Use existing entity data
      setSelectedPOIEntity(entityData);
    } else {
      // Create minimal entity for POI modal from map data
      setSelectedPOIEntity({
        name: furnitureName,
        description: furnitureItem.description || `A piece of furniture in the apothecary shop.`,
        entityType: 'item',
        type: furnitureItem.type || 'furniture',
        image: detailImagePath
      });
    }

    // Open POI modal
    setShowPOIModal(true);

  }, [setShowPOIModal, setSelectedPOIEntity, toast]);

  // ============================================================================
  // SECTION 6: RETURN STATEMENT
  // Export all handlers (orchestrator + 6 specialized hooks)
  // ============================================================================

  // Return all handlers
  return {
    handleWealthChange,
    handleIncorporate,
    addJournalEntry,
    handleJournalEntrySubmit,
    handleSubmit,
    handleEntityClick,
    handleRandomEventChoice,
    handleFurnitureClick,
    // PHASE 2.1: Navigation handlers from useNavigationHandlers
    ...navigationHandlers,
    // PHASE 2.2: Medical handlers from useMedicalHandlers
    ...medicalHandlers,
    // PHASE 2.3: Commerce handlers from useCommerceHandlers
    ...commerceHandlers,
    // PHASE 2.4: Resource handlers from useResourceHandlers
    ...resourceHandlers,
    // PHASE 2.5: UI handlers from useUIHandlers
    ...uiHandlers,
    // PHASE 2.6: Item handlers from useItemHandlers
    ...itemHandlers,
  };
}
