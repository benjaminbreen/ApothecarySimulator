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
import { calculateTemperament } from '../../core/entities/entitySchema';
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
import { parseTravelNarrative, selectHorizonImage, getTravelModeImage } from '../../utils/travelNarrativeParser';
import { mapNPCFactionToSystemFaction, updateFactionFromNPCInteraction } from '../../core/systems/reputationSystem';
import { simulateLongDistanceTravel } from '../../core/agents/LongDistanceTravelAgent';
import { checkForRandomEvent, processEventChoice, initializeEventSystem } from '../../core/events/randomEventService';
import { checkForWeatherEvent } from '../../core/events/weatherEventService';
import { getDetailImagePathSync } from '../../utils/detailImageResolver';
import { isDocumentItem, getDocumentType, extractDocumentMetadata, shouldAutoOpenDocument } from '../../utils/documentDetector';
import { getHouseCallData } from '../../features/medical/services/houseSelector';
import { getTransactionManager, TRANSACTION_CATEGORIES } from '../../core/systems/transactionManager';
import { MedicalRecordsManager } from '../../core/systems/medicalRecordsManager';
import { interpolatePrompt, getListTypeById } from '../../core/config/listTypes.config';
import { checkAndTriggerConsequences } from '../../systems/consequenceSystem';

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

const DOOR_COMMAND_REGEX = /^(?:\s*(?:go|walk|move|step|head)\s+(?:to|toward|towards)\s+(?:the\s+)?door\s*|see\s+who\s+is\s+there\s*|answer\s+the\s+door\s*|open\s+the\s+door\s*)$/i;

function parseDateTimeToMillis(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const combined = `${dateStr} ${timeStr}`;
  let value = Date.parse(combined);
  if (Number.isNaN(value)) {
    value = Date.parse(`${combined} GMT`);
  }
  return Number.isNaN(value) ? null : value;
}

function computeMinutesBetween(prevDate, prevTime, nextDate, nextTime) {
  const start = parseDateTimeToMillis(prevDate, prevTime);
  const end = parseDateTimeToMillis(nextDate, nextTime);
  if (start === null || end === null) return 0;
  return Math.abs(Math.round((end - start) / 60000));
}

const sanitizePortraitFilename = (filename) => {
  if (!filename) return null;
  const trimmed = filename.trim();

  // Fix: LLM sometimes returns string "null" instead of JSON null
  if (trimmed === 'null') return null;

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
  setInventoryViewMode, // Trade system - inventory view mode
  setPreselectedTradeTab, // Trade system - tab pre-selection for TradeModal
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
  setBackgroundMode, // Immersive background mode (fade UI for travel/events)
  setTravelZoomState, // Background zoom effects for travel
  setJourneyTransition, // Journey transition screen for long-distance travel

  // State values
  isLoading, // CRITICAL FIX: Loading state for double-click guard
  energy,
  health,
  currentWealth,
  consecutiveLowEnergyTurns,
  activeEffects, // Body effects from PlayerContext
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
  npcRelationships = {}, // NPC relationships (for save system, default to empty object)
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
  pendingContract, // Current pending contract offer (for textual acceptance detection)
  playerSkills,
  journal,
  pendingExitData, // Exit confirmation system state
  currentWeather, // PHASE 1: Weather state for narrative integration

  // Callbacks from gameState
  updateInventory,
  generateNewItemDetails,
  advanceTime,
  updateLocation,
  addCompoundToInventory,
  refreshInventory,
  toggleShopSign,
  updateWealth,
  updateHealth,
  updateEnergy,
  addTradeOpportunity, // Trade system
  removeTradeOpportunity, // Trade system
  addTradeTransaction, // Trade system
  cleanupExpiredOpportunities, // Trade system
  removeScheduledFollowUp, // Follow-up system - remove follow-up after patient appears

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

  const previousContextRef = useRef({
    location: gameState.location,
    time: gameState.time,
    date: gameState.date
  });

  // Track if NPC departed last turn (for continuation detection)
  const npcDepartedLastTurnRef = useRef(false);
  const conversationLockRef = useRef(null);
  const walkPlayerToDoorRef = useRef(null);
  const handleListRequestRef = useRef(null); // For breaking circular dependency with navigationHandlers

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

      setGameState(prev => {
        const newWorldLocationId = arrivalWorldId || prev.worldLocationId;
        const visitedLocations = prev.visitedWorldLocations || [];

        // Add to visited locations if successful travel and not already visited
        const shouldAddToVisited = (outcome === 'success' || outcome === 'delayed') &&
                                    newWorldLocationId &&
                                    !visitedLocations.includes(newWorldLocationId);

        return {
          ...prev,
          worldLocationId: newWorldLocationId,
          visitedWorldLocations: shouldAddToVisited
            ? [...visitedLocations, newWorldLocationId]
            : visitedLocations
        };
      });

      // Update player position to destination's world coordinates and switch to world map
      if (outcome === 'success' || outcome === 'delayed') {
        setCurrentMapId('world-map');

        // Look up destination world location to get its pixel position
        const { WORLD_LOCATION_LOOKUP } = await import('../../features/map/data/worldLocations');
        const destinationLocation = WORLD_LOCATION_LOOKUP[arrivalWorldId];

        if (destinationLocation?.position) {
          // Update player position to the destination's world map coordinates
          setPlayerPosition(destinationLocation.position);
          console.log('[useGameHandlers] Updated player position to world location:', {
            locationId: arrivalWorldId,
            position: destinationLocation.position
          });
        } else {
          console.warn('[useGameHandlers] Destination location not found in world map:', arrivalWorldId);
        }
      }

      const narrative = result?.narrative || '*The journey proceeds, but no chronicler records its details.*';

      // Parse narrative into journey and arrival sections
      const { journeySection, arrivalSection, parseSuccess } = parseTravelNarrative(narrative);

      if (!parseSuccess) {
        // Fallback: use old behavior (show full narrative in panel)
        console.warn('[LongTravel] Narrative parsing failed, using fallback');
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
            travelOutcome: outcome,
            travelMode: travelPayload?.mode?.id || null
          }
        );
        setHistoryOutput(narrative);
        setDynamicChips(null);
        return;
      }

      // Get destination data for horizon selection
      const { WORLD_LOCATION_LOOKUP } = await import('../../features/map/data/worldLocations');
      const destinationLocation = WORLD_LOCATION_LOOKUP[arrivalWorldId];

      // Select horizon image based on travel mode and destination
      const horizonImage = selectHorizonImage(
        travelPayload.mode?.id || 'wagon',
        destinationLocation?.region || '',
        destinationLocation?.biome || ''
      );

      // Get travel mode image
      const modeImage = getTravelModeImage(travelPayload.mode?.id || 'wagon');

      // Show journey transition screen
      setJourneyTransition({
        journeyText: journeySection,
        horizonImage,
        modeImage,
        arrivalText: arrivalSection,
        onComplete: () => {
          // When user clicks "See Arrival", add arrival narrative to history
          addToHistory(
            {
              role: 'user',
              content: originalCommand,
              hidden: true,
              isMovement: true
            },
            {
              role: 'assistant',
              content: arrivalSection,
              responseType: 'travel',
              travelOutcome: outcome,
              travelMode: travelPayload?.mode?.id || null
            }
          );
          setHistoryOutput(arrivalSection);
          setDynamicChips(null);
        }
      });

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
    activeEffects, // Body effects from PlayerContext
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
    setBackgroundMode, // Immersive background mode
    setTravelZoomState, // Background zoom effects
    handleListRequestRef, // Auto-generate people list on fast travel arrival (passed as ref to break circular dependency)
  });
  if (navigationHandlers.walkPlayerToDoor) {
    walkPlayerToDoorRef.current = navigationHandlers.walkPlayerToDoor;
  }

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
    setBackgroundMode, // Immersive background mode for house calls
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
    setInventoryViewMode,
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
    // Save system params
    playerSkills,
    conversationHistory,
    reputation,
    npcRelationships,
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

  // LIST REQUEST HANDLER
  // Handles generation of reference lists (people, sensory details, objects, ingredients)
  // @param {object} listType - List type configuration
  // @param {boolean} isAutoGenerated - If true, hides the user prompt in conversation history (used for auto-lists after fast travel)
  const handleListRequest = useCallback(async (listType, isAutoGenerated = false) => {
    console.log('[handleListRequest] Called with listType:', listType.id, 'isAutoGenerated:', isAutoGenerated);

    // Safety check
    if (!gameState) {
      console.error('[handleListRequest] gameState is undefined');
      return;
    }

    // Prevent spam submissions
    if (isLoading) {
      console.log('[handleListRequest] Already processing, ignoring duplicate request');
      return;
    }

    setIsLoading(true);

    try {
      // Always use LLM to generate list - it can read conversation history and figure out who's present
      console.log('[handleListRequest] Using LLM for list generation');

      // Build the user prompt - simple request for the list
      const userPrompt = `List all ${listType.label.toLowerCase()}.`;

      // Build merchant context for "people" list
      let merchantContext = '';
      if (listType.id === 'people' && gameState.location) {
        // Get NPCs at current location who are merchants (using top-level import)
        const locationMerchants = entityManager.getAll()
          .filter(e =>
            e.entityType === 'npc' &&
            e.merchantShop === true &&
            e.location === gameState.location
          );

        if (locationMerchants.length > 0) {
          merchantContext = '**MERCHANTS AT THIS LOCATION:**\n' +
            locationMerchants.map(m =>
              `- ${m.name} operates "${m.shopName}" (${m.merchantType}) - ADD 🛒 AFTER THIS NAME`
            ).join('\n');
          console.log('[handleListRequest] Found merchants at location:', locationMerchants.map(m => m.name));
        } else {
          merchantContext = '**MERCHANTS AT THIS LOCATION:** None';
        }
      }

      // Get interpolated system prompt with game state and merchant context
      const systemPromptAddition = interpolatePrompt(listType, gameState, { merchantContext });

      // Call orchestrator with special flag for list requests
      const result = await orchestrateTurn({
        scenarioId: gameState.scenarioId || scenarioId || '1680-mexico-city',
        playerAction: userPrompt,
        conversationHistory,
        gameState: {
          ...gameState,
          activeEffects: activeEffects // Include body effects for narrative context
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
        activePatient: activePatient,
        recentPortrait: recentPortraitRef.current,
        npcDepartedLastTurn: npcDepartedLastTurnRef.current,
        conversationLock: conversationLockRef.current,
        weather: currentWeather, // PHASE 1: Weather state for narrative integration
        scheduledFollowUps: gameState.scheduledFollowUps || [], // NEW: Pass scheduled follow-ups
        removeScheduledFollowUp, // NEW: Callback to remove follow-up after patient appears
        options: { isListRequest: true, listType: listType.id, listSystemPrompt: systemPromptAddition }
      });

      // Add the list response to conversation history
      // If auto-generated (e.g., after fast travel), hide the user prompt
      addToHistory({ role: 'user', content: userPrompt, hidden: isAutoGenerated });
      addToHistory({ role: 'assistant', content: result.narrative });

      // Display the narrative (which should contain the markdown table)
      setHistoryOutput(result.narrative);

      // Clear user input
      setUserInput('');

    } catch (error) {
      console.error('[handleListRequest] Error generating list:', error);

      // Determine error type and show appropriate message
      let errorMessage;

      if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
        errorMessage = `*Request timed out while generating ${listType.label.toLowerCase()}. The AI took too long to respond. Please try again.*`;
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = `*Network error while generating ${listType.label.toLowerCase()}. Please check your internet connection and try again.*`;
      } else if (error.message?.includes('API key')) {
        errorMessage = `*API authentication error. Please check your API keys in settings.*`;
      } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        errorMessage = `*API rate limit reached. Please wait a moment before trying again.*`;
      } else {
        // Don't expose technical error details to player
        errorMessage = `*Unable to generate ${listType.label.toLowerCase()} at this time. Please try again.*`;
      }

      addToHistory({ role: 'assistant', content: errorMessage });
      setHistoryOutput(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    setIsLoading,
    gameState,
    conversationHistory,
    scenarioId,
    turnNumber,
    npcTracker,
    reputation,
    currentWealth,
    currentMapData,
    playerPosition,
    playerFacing,
    currentMapId,
    playerSkills,
    journal,
    activePatient,
    activeEffects,
    currentWeather,
    removeScheduledFollowUp,
    recentPortraitRef,
    npcDepartedLastTurnRef,
    conversationLockRef,
    addToHistory,
    setHistoryOutput,
    setUserInput,
    setDynamicChips,
  ]);

  // Update handleListRequestRef after handleListRequest is defined (for navigationHandlers)
  handleListRequestRef.current = handleListRequest;

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

    if (!actionOverride && DOOR_COMMAND_REGEX.test(originalInput)) {
      const doorMover = walkPlayerToDoorRef.current;
      if (typeof doorMover === 'function') {
        try {
          await doorMover();
        } catch (error) {
          console.error('[DoorShortcut] Failed to animate walk to door:', error);
        }
      }
    }

    // TEXTUAL CONTRACT ACCEPTANCE/DECLINE: Detect if player types acceptance/refusal instead of clicking card
    if (pendingContract && pendingContract.type !== 'null') {
      const inputLower = originalInput.toLowerCase();

      // Detect acceptance signals
      const acceptanceKeywords = ['agree', 'accept', 'yes', 'i will', "i'll", 'very well', 'fine', 'ok', 'okay'];
      const acceptsContract = acceptanceKeywords.some(kw => inputLower.startsWith(kw)) ||
        inputLower.includes('make the house call') ||
        inputLower.includes('make a house call') ||
        (pendingContract.patientName && inputLower.includes(`treat ${pendingContract.patientName.toLowerCase()}`));

      // Detect refusal signals
      const refusalKeywords = ['decline', 'refuse', 'no', "won't", 'cannot', "can't", 'too expensive', 'not interested'];
      const declinesContract = refusalKeywords.some(kw => inputLower.startsWith(kw));

      if (acceptsContract && !declinesContract) {
        console.log('[Contract] Textual acceptance detected, auto-accepting contract');
        // Create patient entity from contract
        const demographics = pendingContract.patientDemographics || {};
        const patientEntity = entityManager.register({
          id: `patient_${pendingContract.patientName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
          name: pendingContract.patientName,
          entityType: 'patient',
          type: 'patient',
          description: pendingContract.patientDescription || pendingContract.ailmentDescription || 'Patient requiring treatment',
          symptoms: [],
          // Add demographics from contract for portrait matching
          gender: demographics.gender || 'unknown',
          age: demographics.age || 'adult',
          casta: demographics.casta || 'unknown',
          class: demographics.class || 'common',
          metadata: {
            representedBy: pendingContract.isEmissary ? pendingContract.offeredBy : null,
            offeredBy: pendingContract.offeredBy || null,
            paymentAgreed: pendingContract.paymentOffered,
            patientLocation: pendingContract.patientLocation || null,
            ailmentDescription: pendingContract.ailmentDescription || pendingContract.patientDescription || null,
            isEmissary: !!pendingContract.isEmissary,
            contractIntent: 'treatment'
          }
        });

        await handleAcceptTreatment(patientEntity, pendingContract.paymentOffered, pendingContract);
        setUserInput('');
        setIsLoading(false);
        return; // Skip normal turn processing
      }

      if (declinesContract && !acceptsContract) {
        console.log('[Contract] Textual refusal detected, auto-declining contract');
        handleDeclineContract();
        // Continue to normal turn processing to generate "Maria declines" narrative
      }
    }

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
    const { actionResultType, llmInstructions } = options;

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

    // Check for pending consequences that should trigger this turn
    const triggeredConsequences = checkAndTriggerConsequences(
      gameState,
      turnNumber,
      {
        updateWealth,
        updateHealth,
        updateEnergy,
        updateInventory,
        toast
      }
    );

    // If consequences were triggered, inject their narrative as a system message
    if (triggeredConsequences.length > 0) {
      console.log(`[Consequence] ${triggeredConsequences.length} consequence(s) triggered this turn`);

      for (const consequenceResult of triggeredConsequences) {
        // Add consequence narrative to conversation history
        const consequenceMessage = {
          role: 'assistant',
          content: consequenceResult.narrative,
          isConsequence: true // Flag to style differently if needed
        };

        addToHistory(consequenceMessage);
        setHistoryOutput(consequenceResult.narrative);

        // Add journal entry
        addJournalEntry({
          turnNumber,
          date: gameState.date,
          entry: `⚠️ CONSEQUENCE: ${consequenceResult.effects.join(', ')}`
        });

        // Show toast notification
        toast.error(`⚠️ Consequence triggered!`, { duration: 4000 });
      }

      // Brief pause to let player see the consequence before continuing
      // (Optional: could also short-circuit and not call orchestrator this turn)
    }

    // Use AgentOrchestrator for coordinated agent responses
    try {
      // Build player action for LLM (may include instructions not shown in Chronicle)
      const playerActionForLLM = llmInstructions
        ? `${narrativeText}\n\n${llmInstructions}`
        : narrativeText;

      const result = await orchestrateTurn({
        scenarioId: gameState.scenarioId || '1680-mexico-city',
        playerAction: playerActionForLLM,
        conversationHistory,
        gameState: {
          ...gameState,
          position: playerPosition,
          currentMap: currentMapId,
          activeEffects: activeEffects // Include body effects for narrative context
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
        conversationLock: conversationLockRef.current,
        weather: currentWeather, // PHASE 1: Weather state for narrative integration
        signJustHung: options.signJustHung || false, // TRIGGER: Force patient spawn when sign just hung
        scheduledFollowUps: gameState.scheduledFollowUps || [], // NEW: Pass scheduled follow-ups
        removeScheduledFollowUp // NEW: Callback to remove follow-up after patient appears
      });

      if (!result.success) {
        setHistoryOutput(result.narrative || 'An error occurred. Please try again.');
        setIsLoading(false);
        return;
      }

      const companions = Array.isArray(result.companions) ? result.companions : [];
      const nextLocation = result.gameState?.location || gameState.location;
      const nextTime = result.gameState?.time || gameState.time;
      const nextDate = result.gameState?.date || gameState.date;

      const previousContext = previousContextRef.current || {};
      const locationChanged = Boolean(previousContext.location && nextLocation && previousContext.location !== nextLocation);
      const timeJumpMinutes = computeMinutesBetween(previousContext.date, previousContext.time, nextDate, nextTime);
      const majorContextShift = locationChanged || timeJumpMinutes >= 30;

      if (majorContextShift) {
        const companionNames = companions.map(companion => companion?.name).filter(Boolean);
        const lockedName = conversationLockRef.current?.name || null;
        const keepLock = lockedName && companionNames.includes(lockedName);

        if (!keepLock) {
          clearConversationLock();
          npcTracker.clear();
          npcDepartedLastTurnRef.current = false;
          setPrimaryPortraitFile(null);
          recentPortraitRef.current = null;
          previousPortraitEntityRef.current = null;
        }
      }

      companions.forEach(companion => {
        if (companion?.name && !npcTracker.wasRecentlySeen(companion.name)) {
          npcTracker.addNPC(companion.name);
        }
      });

      // NEW: Handle LLM-provided primary NPC profile (Phase 1)
      if (result.primaryNPC) {
        console.log('[Primary NPC] Received from LLM:', result.primaryNPC.name);

        // Generate basic bigFive from personality string for humoral display
        const personalityTraits = result.primaryNPC.personality ?
          result.primaryNPC.personality.split(',').map(t => t.trim().toLowerCase()) : [];

        // Simple heuristic mapping of personality traits to Big Five
        const bigFive = {
          openness: personalityTraits.some(t => ['curious', 'imaginative', 'creative'].includes(t)) ? 70 : 50,
          conscientiousness: personalityTraits.some(t => ['careful', 'organized', 'diligent'].includes(t)) ? 70 : 50,
          extroversion: personalityTraits.some(t => ['outgoing', 'talkative', 'sociable'].includes(t)) ? 70 :
                        personalityTraits.some(t => ['shy', 'reserved', 'quiet'].includes(t)) ? 30 : 50,
          agreeableness: personalityTraits.some(t => ['kind', 'generous', 'warm'].includes(t)) ? 70 :
                         personalityTraits.some(t => ['suspicious', 'cold', 'harsh'].includes(t)) ? 30 : 50,
          neuroticism: personalityTraits.some(t => ['anxious', 'nervous', 'worried', 'fearful'].includes(t)) ? 70 :
                       personalityTraits.some(t => ['calm', 'stable', 'confident'].includes(t)) ? 30 : 50
        };

        const npcEntity = {
          name: result.primaryNPC.name,
          id: `npc_${result.primaryNPC.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
          entityType: 'npc',
          type: 'npc',
          llmProvided: true, // Flag to prevent procedural override
          description: result.primaryNPC.description,
          age: result.primaryNPC.age,
          gender: result.primaryNPC.gender,
          appearance: result.primaryNPC.appearance, // Keep as string from LLM
          personality: {
            traits: personalityTraits,
            bigFive: bigFive,
            temperament: calculateTemperament(bigFive)
          },
          social: {
            class: result.primaryNPC.class,
            casta: result.primaryNPC.casta,
            occupation: result.primaryNPC.occupation
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

      // Priority: LLM portrait > Auto-resolve from showPortraitFor > Turn 1 entrance fallback > Map
      if (result.primaryPortrait) {
        const normalizedPortrait = sanitizePortraitFilename(result.primaryPortrait);
        console.log('[Portrait] LLM selected portrait:', result.primaryPortrait, '→ normalized to:', normalizedPortrait);
        primaryPortraitFile = normalizedPortrait;
        portraitForHistory = normalizedPortrait;
      } else if (result.showPortraitFor && result.showPortraitFor !== 'player') {
        // Auto-resolve portrait: LLM specified entity to show portrait for, but didn't provide filename
        // Construct portrait filename from entity name (e.g., "Frog" → "frog.jpg")
        const entityName = result.showPortraitFor.toLowerCase().trim();
        const autoPortraitFile = `${entityName}.jpg`;
        console.log('[Portrait] Auto-resolving portrait for:', result.showPortraitFor, '→', autoPortraitFile);
        primaryPortraitFile = autoPortraitFile;
        portraitForHistory = autoPortraitFile;
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

      // Only show the FIRST system announcement to avoid duplicate/redundant messages
      // The first announcement is usually more important and player-facing
      if (result.systemAnnouncements && result.systemAnnouncements.length > 0) {
        newHistory.push({ role: 'system', content: result.systemAnnouncements[0] });
      }

      if (crisisSystemMessages.length > 0) {
        crisisSystemMessages.forEach(msg => {
          newHistory.push({ role: 'system', content: msg });
        });
      }

      // CARD ASSIGNMENT: Add cards to assistantMessage BEFORE setConversationHistory
      // This must happen before React state update to ensure cards render

      // Simple Interaction Card
      const rawSimpleInteraction = result.simpleInteraction;
      const simpleInteractionType = rawSimpleInteraction?.type || 'null';
      const isMedicalSimpleInteraction = ['house_call', 'house_call_request', 'medical_diagnosis'].includes(simpleInteractionType);
      const medicalIntents = new Set(['medical_diagnosis', 'medical_purchase', 'medical_followup', 'house_call']);
      const currentIntent = result.interactionIntent || 'none';

      let effectiveSimpleInteraction = isMedicalSimpleInteraction ? null : rawSimpleInteraction;
      if (medicalIntents.has(currentIntent)) {
        effectiveSimpleInteraction = null;
      }

      if (effectiveSimpleInteraction && effectiveSimpleInteraction.type && effectiveSimpleInteraction.type !== 'null') {
        console.log('[SimpleInteraction] Detected:', simpleInteractionType, rawSimpleInteraction);
        assistantMessage.card = {
          type: 'simple_interaction',
          data: effectiveSimpleInteraction
        };
      }

      // Add timestamps to all new history entries
      newHistory.forEach(entry => {
        entry.timestamp = {
          time: gameState.time,
          date: gameState.date
        };
      });

      setConversationHistory(newHistory);
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
        // VIEWPORT: Update focusedItem for contextual image display
        if (result.gameState.focusedItem !== undefined) {
          setGameState(prev => ({ ...prev, focusedItem: result.gameState.focusedItem }));
          console.log('[Viewport] Updated focusedItem:', result.gameState.focusedItem);
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
              console.log('[Location Change] 🏢 BUILDING ENTRANCE - Using interior spawn point:', spawnX, spawnY);
              console.log('[Location Change] Building:', locationMatch.name, 'Interior Map:', locationMatch.mapId);
            } else {
              // For rooms and exits, use the position directly
              spawnX = locationMatch.position.x;
              spawnY = locationMatch.position.y;
              console.log('[Location Change] 📍 ROOM/EXIT - Using standard spawn point:', spawnX, spawnY);
              console.log('[Location Change] Location:', locationMatch.name, 'Type:', locationMatch.type);
            }

            // Calculate grid position from spawn point
            const gridX = Number.isFinite(locationMatch.gridX)
              ? locationMatch.gridX
              : Math.floor(spawnX / 20);
            const gridY = Number.isFinite(locationMatch.gridY)
              ? locationMatch.gridY // FIX: Was incorrectly using gridX here
              : Math.floor(spawnY / 20);

            console.log('[Location Change] ⚠️ SETTING PLAYER POSITION:', {
              x: spawnX,
              y: spawnY,
              gridX,
              gridY,
              location: locationMatch.name,
              mapId: locationMatch.mapId
            });

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

            // Auto-trigger "people present" list ONLY for marketplace locations
            const isMarketplace = locationMatch.fullName.toLowerCase().includes('market') ||
                                  locationMatch.fullName.toLowerCase().includes('plaza mayor');

            if (isMarketplace) {
              setTimeout(() => {
                const peopleListType = getListTypeById('people');
                if (peopleListType) {
                  console.log('[Location Change] Marketplace detected - auto-triggering people list');
                  handleListRequest(peopleListType);
                }
              }, 800); // Small delay to let location update propagate
            }
          } else {
            // No match - just update text, keep current position
            console.log('[Location Change] No registry match, updating text only');
            updateLocation(result.gameState.location);

            // Auto-trigger "people present" list ONLY for marketplace locations
            const isMarketplace = result.gameState.location.toLowerCase().includes('market') ||
                                  result.gameState.location.toLowerCase().includes('plaza mayor');

            if (isMarketplace) {
              setTimeout(() => {
                const peopleListType = getListTypeById('people');
                if (peopleListType) {
                  console.log('[Location Change] Marketplace detected - auto-triggering people list');
                  handleListRequest(peopleListType);
                }
              }, 800); // Small delay to let location update propagate
            }
          }
        } else if (result.gameState.location) {
          // Location same as before, no change needed
          console.log('[Location Change] Location unchanged:', result.gameState.location);
      }

      // NEW: Update locationType and biome from StateAgent (structured location fields)
      if (result.gameState.locationType) {
        setGameState(prev => ({ ...prev, locationType: result.gameState.locationType }));
        console.log('[Location] Updated locationType:', result.gameState.locationType);
      }
      if (result.gameState.biome) {
        setGameState(prev => ({ ...prev, biome: result.gameState.biome }));
        console.log('[Location] Updated biome:', result.gameState.biome);
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

      // PHASE 1B: Environmental text detection (signs, plaques, inscriptions)
      // Lightweight: only triggers when narrative explicitly shows Maria reading
      const narrative = result.narrative || historyOutput;
      const lowerNarrative = narrative.toLowerCase();

      // Only trigger if narrative explicitly shows Maria reading environmental text
      const readingPatterns = [
        /(?:you read|maria reads?|reading|examine[sd]?)\s+(?:the|a)\s+(sign|plaque|inscription|notice|poster|graffiti|carving|tablet|board|mural)/i,
        /(?:sign|plaque|notice|inscription|poster|board)\s+(?:says?|reads?|states?)/i,
        /(?:written|inscribed|carved|painted)\s+(?:on|into|above)/i
      ];

      const isReadingEnvironmentalText = readingPatterns.some(pattern => pattern.test(narrative));

      // Don't trigger if already showing a document
      const hasDocumentTriggered = result.inventoryChanges?.some(c => c.isReadable);

      if (isReadingEnvironmentalText && !hasDocumentTriggered) {
        console.log('[EnvironmentalText] Detected active reading in narrative');

        // Extract type from narrative
        const typeMatch = narrative.match(/\b(sign|plaque|inscription|notice|poster|graffiti|carving|tablet|board|mural)\b/i);
        const type = typeMatch ? typeMatch[1].toLowerCase() : 'sign';

        const textDocument = {
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Text`,
          type: type,
          description: `Environmental text - ${type}`,
          tier: 'environmental',
          metadata: {
            environmentalType: type,
            turnSeen: turnNumber,
            dateSeen: gameState.date,
            gameLocation: gameState.location
          },
          narrativeContext: narrative,
          isEnvironmental: true // Flag: don't add to inventory
        };

        console.log('[EnvironmentalText] Creating environmental text modal:', textDocument.name);

        setPendingDocument(textDocument);
        setTimeout(() => {
          setIsDocumentModalOpen(true);
        }, 800);
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

      // OFFER COMPLETION: Handle sell/give offer acceptance/rejection
      // Process pendingOffer from options if present
      if (options.pendingOffer) {
        const offer = options.pendingOffer;
        console.log('[Offer] Processing offer result:', { offer, narrative: result.narrative });

        // Detect acceptance/rejection from LLM narrative
        const narrativeLower = result.narrative.toLowerCase();
        const accepted = narrativeLower.includes('accept') || narrativeLower.includes('pay') || narrativeLower.includes('take') || narrativeLower.includes('grateful') || narrativeLower.includes('thank');
        const rejected = narrativeLower.includes('reject') || narrativeLower.includes('refuse') || narrativeLower.includes('decline') || narrativeLower.includes('inappropriate') || narrativeLower.includes('too expensive');
        const negotiated = narrativeLower.includes('bargain') || narrativeLower.includes('negotiate') || narrativeLower.includes('haggle') || narrativeLower.includes('lower price');

        if (rejected && !accepted) {
          // REJECTION: Keep item in inventory, no transaction
          console.log(`[Offer] ${offer.recipientName} REJECTED the offer - no transaction`);

          // Add system message to conversation history
          setConversationHistory(prev => [...prev, {
            role: 'system',
            content: `*[OFFER REJECTED] ${offer.recipientName} refused Maria's offer of ${offer.item.name}.*`
          }]);

          // Toast notification
          toast.error(`${offer.recipientName} rejected your offer`, { duration: 3000 });

        } else if (negotiated && !accepted) {
          // NEGOTIATION: Keep item for now, may need player response
          console.log(`[Offer] ${offer.recipientName} wants to NEGOTIATE - no transaction yet`);

          toast.info(`${offer.recipientName} wants to negotiate`, { duration: 3000 });

        } else {
          // ACCEPTANCE (default if not clearly rejected): Complete transaction
          console.log(`[Offer] ${offer.recipientName} ACCEPTED the offer - completing transaction`);

          // Remove item from inventory
          updateInventory(offer.item.name, -offer.amount);

          // For sell type, add money to wealth
          if (offer.type === 'sell' && offer.price > 0) {
            updateWealth(offer.price);

            // Log transaction to ledger
            const transactionManager = getTransactionManager(gameState.scenarioId || '1680-mexico-city');
            const currentWealth = (gameState.wealth || 0) + offer.price;
            const description = `Sold ${offer.amount}× ${offer.item.name} to ${offer.recipientName}`;
            transactionManager.logTransaction(
              'income',
              TRANSACTION_CATEGORIES.MEDICINE_SALES,
              description,
              offer.price,
              currentWealth,
              gameState.date,
              gameState.time
            );
            console.log('[Offer] Transaction logged to ledger');
          }

          // Add system message to conversation history
          const systemMessages = {
            sell: `*[ITEM SOLD] Maria sells ${offer.amount}× ${offer.item.name} to ${offer.recipientName} for ${offer.price} reales.*`,
            give: `*[ITEM GIVEN] Maria gives ${offer.amount}× ${offer.item.name} to ${offer.recipientName} as a gift.*`
          };
          setConversationHistory(prev => [...prev, {
            role: 'system',
            content: systemMessages[offer.type] || systemMessages.give
          }]);

          // Add journal entry
          const journalEntries = {
            sell: `Sold ${offer.amount}× ${offer.item.name} to ${offer.recipientName} for ${offer.price} reales.`,
            give: `Gave ${offer.amount}× ${offer.item.name} to ${offer.recipientName}.`
          };
          addJournalEntry({
            turnNumber,
            date: gameState.date,
            entry: journalEntries[offer.type] || journalEntries.give
          });

          // Toast notification
          const toastMessages = {
            sell: `Sold ${offer.item.name} for ${offer.price} reales`,
            give: `Gave ${offer.item.name} to ${offer.recipientName}`
          };
          toast.success(toastMessages[offer.type] || toastMessages.give, { duration: 3000 });
        }
      }

      // SIMPLE INTERACTION STATE MANAGEMENT
      // Detection and card assignment already happened before setConversationHistory (line ~1888)
      // This section only manages the pendingSimpleInteraction state variable

      // Recompute from result (variables from earlier block are out of scope here)
      const rawSI = result.simpleInteraction;
      const siType = rawSI?.type || 'null';
      const isMedicalSI = ['house_call', 'house_call_request', 'medical_diagnosis'].includes(siType);
      const medIntents = new Set(['medical_diagnosis', 'medical_purchase', 'medical_followup', 'house_call']);
      const curIntent = result.interactionIntent || 'none';

      let effectiveSI = isMedicalSI ? null : rawSI;
      if (medIntents.has(curIntent)) {
        effectiveSI = null;
      }

      const hasSimpleInteraction = effectiveSI && effectiveSI.type && effectiveSI.type !== 'null';

      if (isMedicalSI ||
          (medIntents.has(curIntent) && rawSI && rawSI.type && rawSI.type !== 'null')) {
        setPendingSimpleInteraction(null);
      }

      // Handle contract offers (treatment or sale)
      // Store contract offer but DON'T auto-open modal
      // Player will see a clickable card in NarrativePanel
      // Only show card when StateAgent confirms with system announcement
      // This ensures contracts appear when NPC makes a CLEAR REQUEST (any turn)
      // but not for vague mentions or completed transactions
      // GUARD: Skip if simpleInteraction is already handling this turn (prevent duplicate cards)
      // GUARD: Skip on first turn (turnNumber === 1) to prevent contracts before player has oriented
      if (!hasSimpleInteraction &&
          turnNumber > 1 &&
          result.contractOffer &&
          result.contractOffer.type &&
          result.contractOffer.type !== 'null' &&
          result.systemAnnouncements?.some(msg => {
            const lower = msg.toLowerCase();
            return lower.includes('contract') || lower.includes('house call');
          })) {

        // Treatment contract detected
        console.log('[Contract] Offer finalized and ready for player decision:', result.contractOffer.type, result.contractOffer);

        // Auto-populate contract price if not specified (defaults to 0)
        if (!result.contractOffer.paymentOffered || result.contractOffer.paymentOffered === 0) {
          const randomPrice = Math.floor(Math.random() * 19) + 2; // Random 2-20 reales
          result.contractOffer.paymentOffered = randomPrice;
          console.log(`[Contract] Auto-populated price: ${randomPrice} reales (NPC didn't specify amount)`);
        }

        // Store in conversation history so card stays in place
        assistantMessage.card = {
          type: 'contract',
          data: result.contractOffer
        };
        setPendingContract(result.contractOffer);
        // Note: Modal/card is NOT auto-opened, user must click the card
      } else if (turnNumber === 1 && result.contractOffer?.type && result.contractOffer.type !== 'null') {
        console.log('[Contract] Skipped - turn 1 (contracts disabled on first turn)');
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

          // CRITICAL VALIDATION: Reject obviously invalid patient names (items, furniture, objects)
          const invalidPatientNames = [
            'drug cabinet', 'medicine cabinet', 'cabinet', 'shelf', 'drawer', 'counter',
            'table', 'chair', 'mortar', 'pestle', 'jar', 'vial', 'bottle', 'box',
            'chest', 'trunk', 'door', 'window', 'wall', 'floor', 'ceiling',
            'medicine chest', 'apothecary cabinet', 'storage', 'cupboard',
            'bed', 'master bed', 'dining table', 'desk', 'bench', 'stool'
          ];

          let patientName = travel.patientName || 'Unnamed Patient';
          const patientNameLower = patientName.toLowerCase();

          // Check if patient name is an invalid item/furniture name
          if (invalidPatientNames.some(invalid => patientNameLower.includes(invalid))) {
            console.warn(`[HouseCall] ❌ Invalid patient name detected: "${patientName}" (appears to be an item/furniture). Using fallback.`);
            patientName = travel.patientDescription || 'Sick person at residence';
          }

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
      console.log('[ActionPrompt DEBUG] hasSimpleInteraction:', hasSimpleInteraction);
      console.log('[ActionPrompt DEBUG] effectiveSimpleInteraction:', effectiveSimpleInteraction);

      // ENHANCED GUARD: Clear actionPrompt if simpleInteraction is handling this OR if type is null
      const shouldClearActionPrompt = hasSimpleInteraction || (result.actionPrompt && result.actionPrompt.type === 'null');

      if (shouldClearActionPrompt) {
        console.log('[ActionPrompt] Clearing - either simpleInteraction active or type is null');
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
      } else if (!hasSimpleInteraction &&
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
      // Card assignment already happened before setConversationHistory (line ~1888)
      // This section only manages the pendingSimpleInteraction state variable
      if (effectiveSimpleInteraction &&
          effectiveSimpleInteraction.type &&
          effectiveSimpleInteraction.type !== 'null') {
        setPendingSimpleInteraction(effectiveSimpleInteraction);
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
      console.log('[RandomEvent DEBUG] Reached event check. effectiveSimpleInteraction:', effectiveSimpleInteraction);
      // FIX: Check if interaction type exists, not just if object exists
      if (!effectiveSimpleInteraction || !effectiveSimpleInteraction.type) {
        console.log('[RandomEvent DEBUG] Calling checkForRandomEvent with gameState:', {
          location: gameState.location,
          turnNumber,
          time: gameState.time,
          wealth: gameState.wealth || currentWealth
        });
        const eventCard = checkForRandomEvent(
          gameState,
          reputation,
          narrativeText
        );
        console.log('[RandomEvent DEBUG] checkForRandomEvent returned:', eventCard);

        if (eventCard) {
          console.log('[RandomEvent] Event triggered:', eventCard.title);
          // Store in conversation history so card stays in place
          assistantMessage.card = {
            type: 'random_event',
            data: eventCard
          };
          setPendingRandomEvent(eventCard);
        } else {
          // Check for weather events (only if no random event triggered)
          // Weather events are less frequent but more dramatic
          const weatherEventCard = await checkForWeatherEvent(currentWeather, gameState);

          if (weatherEventCard) {
            console.log('[WeatherEvent] Weather event triggered:', weatherEventCard.title);
            // Fade UI to show weather background (immersive mode)
            setBackgroundMode('event');
            // Store in conversation history so card stays in place
            assistantMessage.card = {
              type: 'weather_event',
              data: weatherEventCard
            };
            setPendingRandomEvent(weatherEventCard); // Reuse same UI component
          } else {
            // Clear any previous event
            setPendingRandomEvent(null);
          }
        }
      } else {
        console.log('[RandomEvent DEBUG] Skipping event check - effectiveSimpleInteraction is active:', effectiveSimpleInteraction?.type);
      }

      // CLOSING QUESTION CLEANUP: Remove "Will you X or Y?" when card UI provides choices instead
      // Cards are attached to conversation history objects (by reference) after history is set at line 1882
      // So we update history again here to strip closing questions from messages that have cards
      setConversationHistory(prev => {
        return prev.map(msg => {
          // Only process assistant messages with cards attached
          if (msg.role === 'assistant' && msg.card && msg.card.type && msg.card.type !== 'null') {
            const originalContent = msg.content;
            const strippedContent = msg.content.replace(
              /\n\n\*\*['""]?Will you [^?]+\?\*\*\s*$/i,
              ''
            );
            if (strippedContent !== originalContent) {
              console.log(`[Card] Removed closing question (${msg.card.type} card provides choices instead)`);
              return {
                ...msg,
                content: strippedContent
              };
            }
          }
          return msg;
        });
      });

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

      previousContextRef.current = {
        location: nextLocation,
        time: nextTime,
        date: nextDate
      };

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
    clearConversationLock,
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
    // Restore normal UI mode
    setBackgroundMode('normal');

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
    setBackgroundMode,
    toast
  ]);

  /**
   * Handle furniture/POI click from interactive map
   * Opens POIModal if detail image exists for the furniture
   */
  const handleFurnitureClick = useCallback((furnitureItem) => {
    const furnitureName = furnitureItem.name || furnitureItem.id;
    console.log('[GameHandlers] Furniture clicked:', furnitureName, furnitureItem);

    // 🛒 MARKET STALL CLICK DETECTION
    // Check if this is a market stall at La Merced Market
    if (gameState.location === 'La Merced Market' && furnitureItem.id) {
      const stallId = furnitureItem.id; // e.g., "north-stall-1", "south-stall-3"

      // Check if this is a stall (matches pattern)
      if (stallId.match(/^(north|south)-stall-\d+$/)) {
        console.log('[GameHandlers] Market stall clicked:', stallId);

        // Find merchant NPC with matching stallId
        const allEntities = entityManager.getAll();
        const merchantNPC = allEntities.find(entity =>
          entity.entityType === 'npc' &&
          entity.merchantShop === true &&
          entity.stallId === stallId
        );

        if (merchantNPC) {
          console.log('[GameHandlers] Found merchant for stall:', merchantNPC.name);

          // Generate merchant inventory (async import)
          import('../../features/commerce/services/merchantInventoryGenerator').then(({ generateMerchantInventory }) => {
            // Generate merchant inventory for today
            const inventory = generateMerchantInventory(merchantNPC, gameState.date);

            console.log(`[GameHandlers] Generated ${inventory.length} items for ${merchantNPC.name}`);

            // Build portrait path from image filename
            const portraitPath = merchantNPC.image ? `/portraits/${merchantNPC.image}` : null;

            // Set up merchant data for TradeModal
            const merchantData = {
              id: merchantNPC.id,
              name: merchantNPC.name,
              shopName: merchantNPC.shopName,
              merchantType: merchantNPC.merchantType,
              portrait: portraitPath,
              greeting: merchantNPC.dialogue?.greeting || `Welcome to ${merchantNPC.shopName}.`,
              shopAmbiance: merchantNPC.shopAmbiance || '',
              offering: {
                items: inventory
              }
            };

            // Open TradeModal in merchant mode
            setTradingNPC(merchantData);
            setTradeMode('merchant');
            setIsBuyOpen(true);

            toast.success(`Browsing ${merchantNPC.shopName}...`, { duration: 2000 });
          }).catch(error => {
            console.error('[GameHandlers] Error loading merchant inventory:', error);
            toast.error('Failed to load merchant inventory');
          });

          return;
        } else {
          console.warn('[GameHandlers] No merchant found for stall:', stallId);
          toast.info(`This stall is currently unattended.`, { duration: 2000 });
          return;
        }
      }
    }

    // 🏛️ NORMAL FURNITURE CLICK (non-stall)
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

  }, [setShowPOIModal, setSelectedPOIEntity, toast, gameState.location, gameState.date, setTradingNPC, setTradeMode, setIsBuyOpen]);

  /**
   * Handle time change from interactive clock
   * Triggers narration agent as if user entered "wait until [time]"
   */
  const handleTimeChange = useCallback(async (newTime) => {
    console.log('[TimeChange] Changing time from', gameState.time, 'to', newTime);

    try {
      setIsLoading(true);

      // Calculate time difference
      const parseTime = (timeStr) => {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return { hours: 0, minutes: 0 };
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return { hours, minutes };
      };

      const currentParsed = parseTime(gameState.time);
      const newParsed = parseTime(newTime);

      const currentTotalMinutes = currentParsed.hours * 60 + currentParsed.minutes;
      const newTotalMinutes = newParsed.hours * 60 + newParsed.minutes;
      let minutesDiff = newTotalMinutes - currentTotalMinutes;

      // Handle day wraparound
      if (minutesDiff < 0) {
        minutesDiff += 24 * 60; // Add a full day
      }

      // Update game time first
      advanceTime({ time: newTime, date: gameState.date });

      // Create wait message for LLM
      const hoursWaited = Math.floor(minutesDiff / 60);
      const minutesWaited = minutesDiff % 60;
      let waitDescription = '';

      if (hoursWaited > 0 && minutesWaited > 0) {
        waitDescription = `${hoursWaited} ${hoursWaited === 1 ? 'hour' : 'hours'} and ${minutesWaited} ${minutesWaited === 1 ? 'minute' : 'minutes'}`;
      } else if (hoursWaited > 0) {
        waitDescription = `${hoursWaited} ${hoursWaited === 1 ? 'hour' : 'hours'}`;
      } else {
        waitDescription = `${minutesWaited} ${minutesWaited === 1 ? 'minute' : 'minutes'}`;
      }

      const waitMessage = `Maria waits ${waitDescription} until ${newTime} on ${gameState.date} in ${gameState.location}. Please briefly describe what happens during this time - what Maria does, any sounds or sights, her thoughts. Then present a numbered list of 3 possible next steps. End with: "**Time passes. Maria waits until ${newTime}. Time: ${newTime}, ${gameState.date}, 1680.**"`;

      // Build system prompt
      const systemPrompt = buildSystemPrompt(scenarioId, gameState);

      // Create messages array from conversation history
      const recentHistory = conversationHistory.slice(-10); // Last 10 turns for context
      const messages = [
        ...recentHistory,
        { role: 'user', content: waitMessage }
      ];

      // Call LLM
      const response = await createChatCompletion(systemPrompt, messages, { temperature: 0.7 });
      const narrativeOutput = response.choices[0].message.content;

      // Add to conversation history
      addToHistory(
        { role: 'user', content: `[Maria waits until ${newTime}]` },
        { role: 'assistant', content: narrativeOutput }
      );

      // Update history output
      setHistoryOutput(narrativeOutput);

      // Add journal entry
      addJournalEntry(`⏰ Maria waited until ${newTime} on ${gameState.date} in ${gameState.location}.`);

      // Advance turn number
      setTurnNumber(prev => prev + 1);

      // Apply resource changes (waiting costs some energy)
      if (minutesDiff >= 60) {
        // Waiting more than an hour costs 5 energy
        const energyCost = Math.min(Math.floor(minutesDiff / 60) * 5, 30); // Max 30 energy cost
        const newEnergy = Math.max(0, gameState.energy - energyCost);
        setEnergy(newEnergy);
        console.log(`[TimeChange] Energy cost for waiting: -${energyCost}`);
      }

      // Award XP for time management (+1 XP)
      if (typeof awardXP === 'function') {
        awardXP(1, 'time-management');
        console.log('[XP] Awarded 1 XP for time management');
      }

      // Success toast
      if (toast) {
        toast.success(`Time advanced to ${newTime}`, { duration: 3000 });
      }

    } catch (error) {
      console.error('[TimeChange] Error:', error);

      // Show error message
      const errorMessage = '*An error occurred while advancing time. Please try again.*';
      addToHistory({ role: 'assistant', content: errorMessage });
      setHistoryOutput(errorMessage);

      if (toast) {
        toast.error('Failed to change time', { duration: 3000 });
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    gameState,
    conversationHistory,
    scenarioId,
    advanceTime,
    addToHistory,
    setHistoryOutput,
    addJournalEntry,
    setTurnNumber,
    setEnergy,
    awardXP,
    toast,
    setIsLoading
  ]);

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
    handleListRequest, // List feature handler
    handleEntityClick,
    handleRandomEventChoice,
    handleFurnitureClick,
    handleTimeChange, // Interactive clock time change handler
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
