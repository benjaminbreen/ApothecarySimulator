// GamePage.jsx
// Main game page component

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy} from 'react';
import { useParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// New UI Components
import Header from '../components/Header';
import { LeftSidebar } from '../components/LeftSidebar';
import { CentralPanel } from '../components/CentralPanel';
import NarrativePanel from '../components/NarrativePanel';
import InputArea from '../components/InputArea';
import ContextPanel from '../components/ContextPanel';
import MobileBottomNav from '../components/MobileBottomNav';
import GameLog from '../components/GameLog';
import EatAction from '../components/EatAction';
import { ToastProvider, useToast } from '../components/ToastNotification';
import Tooltip from '../components/Tooltip';
import { NarrativeLoading } from '../components/LoadingSkeleton';
import SettingsModal from '../components/SettingsModal_V3';
import HelpModal from '../components/HelpModal';
import ItemActionPopup from '../components/ItemActionPopup';
import LevelUpNotification from '../components/LevelUpNotification';
import ProfessionChoiceModal from '../components/ProfessionChoiceModal';
import AbilityUnlockNotification from '../components/AbilityUnlockNotification';
import ContractOfferModal from '../components/ContractOfferModal';
import ItemConsumptionModal from '../components/ItemConsumptionModal';
import GameOverModal from '../components/GameOverModal';
import SimpleInteractionCard from '../components/SimpleInteractionCard';
import WeatherBackground from '../components/WeatherBackground'; // PHASE 3: Weather system

const ACTION_PROMPT_SUPPRESSION_WINDOW = 60 * 1000; // 1 minute cooldown for repeated prescribe prompts
import RandomEventCard from '../components/RandomEventCard';
import POIModal from '../components/POIModal';
import { TravelCard } from '../components/TravelCard'; // Phase 3B: House call travel
import { PurchaseOfferCard } from '../components/PurchaseOfferCard'; // Purchase offers from vendors
import LongDistanceTravelModal from '../components/LongDistanceTravelModal';
import ReadableTextModal from '../components/ReadableTextModal'; // Document modal for letters, codices, etc.
import PrescriptionOutcomeModal from '../features/medical/components/PrescriptionOutcomeModal'; // Detailed prescription outcome modal
import SaveLoadModal from '../components/SaveLoadModal'; // Save/Load system

// Feature components
import { useGameState as useGameStateHook } from '../core/state/gameState'; // Legacy hook (for reference)
import { GameStateProvider, useGameState } from '../contexts/GameStateContext'; // PHASE 1.1
import { ModalProvider, useModals, MODALS } from '../contexts/ModalContext'; // PHASE 1.2
import { PlayerProvider, usePlayer } from '../contexts/PlayerContext'; // PHASE 1.3
import { NPCProvider, useNPCs } from '../contexts/NPCContext'; // PHASE 1.4
import { useReputation } from '../core/hooks/useReputation';
import { useSkills } from '../core/hooks/useSkills'; // Now wrapped by PlayerContext

// Game systems
import resourceManager from '../systems/ResourceManager';
import { scenarioLoader } from '../core/services/scenarioLoader';
import { initializeEventSystem } from '../core/events/randomEventService';
import { resetWeatherEventTracking } from '../core/events/weatherEventService';
import { getTransactionManager, TRANSACTION_CATEGORIES } from '../core/systems/transactionManager';
import { getAllAbilitiesForProfession, getXPMultiplier, getSkillXPMultiplier } from '../core/systems/professionAbilities';
import { getProfessionIcon, getProfessionName, getPlayerTitle } from '../core/systems/levelingSystem';

// Modularized components
import { useGameHandlers } from './hooks/useGameHandlers';
import { GameModals } from './components/GameModals';
import MobileGameLayout from './components/MobileGameLayout';

// Mobile optimization
import { MobileLayoutProvider } from '../contexts/MobileLayoutContext';
import { useScreenSize } from '../hooks';



import { generateJournalEntry } from '../journalAgent';
import imageMap from '../imageMap';

import { createChatCompletion } from '../core/services/llmService';
import { evaluateConsumptionEffects } from '../core/services/consumptionService';
import { buildSystemPrompt, buildContextSummary, buildEntityContext } from '../prompts/promptModules';
import { orchestrateTurn } from '../core/agents/AgentOrchestrator';
import { NPCTracker } from '../core/agents/EntityAgent';
import { entityManager } from '../core/entities/EntityManager';
import { useNPCPositions } from '../features/map/hooks/useNPCPositions';
import EntityList from '../EntityList';
import { parseNarrativeChoices } from '../utils/narrativeParser';
import { getGridSystem } from '../features/map/services/gridMovementSystem';
import { getWorldTravelOptions } from '../features/map/services/locationRegistry';
import { getLocationNPCs } from '../core/services/locationContextService';
import { getMariaPortrait, getDeterminedPortrait, getPortraitFromStatus } from '../utils/portraitSelector';

const PDFPopup = lazy(() => import('../shared/components/PDFPopup'));

const GameContent = () => {
  const toast = useToast();
  const { scenarioId } = useParams(); // Get scenarioId from URL
  const { isMobile, isTablet } = useScreenSize(); // Mobile optimization

  // Load scenario for map data and initial narrative
  const scenario = scenarioLoader.getScenario(scenarioId || '1680-mexico-city');

  // PHASE 1.1: Now using GameStateContext instead of direct hook call
  // The scenarioId is provided by GameStateProvider wrapper (see bottom of file)
  const {
    gameState,
    updateInventory,
    updateLocation,
    addCompoundToInventory,
    generateNewItemDetails,
    startQuest,
    advanceTime,
    refreshInventory,
    lastAddedItem,
    clearLastAddedItem,
    unlockMethod,
    setGameState,
    unlockedMethods,
    toggleShopSign,
    // Core player stats
    updateWealth,
    setWealth,
    updateHealth,
    setHealth,
    updateEnergy,
    setEnergy,
    // Profession system
    chooseProfession,
    // NPC Commerce system
    addTradeOpportunity,
    removeTradeOpportunity,
    addTradeTransaction,
    getTradeHistory,
    cleanupExpiredOpportunities,
    // Document library system
    addDocument,
    markDocumentAsRead,
    getDocuments,
    getUnreadDocumentsCount,
    triggerGameOver,
    setCrisisState,
  } = useGameState(); // No parameter - comes from context now!

  // PHASE 1.4: NPC tracking and entity state now managed by NPCContext
  const {
    npcTracker,
    getRecentNPCs,
    trackNPC,
    untrackNPC,
    currentEntities,
    setCurrentEntities,
    activePatient,
    setActivePatient,
    patientDialogue,
    setPatientDialogue,
    currentPatient,
    setCurrentPatient,
    selectedNPC,
    setSelectedNPC,
    selectedPatient,
    setSelectedPatient,
    tradingNPC,
    setTradingNPC,
    primaryPortraitFile,
    setPrimaryPortraitFile,
    pendingContract,
    setPendingContract,
    pendingActionPrompt,
    setPendingActionPrompt,
  } = useNPCs();

  const [recentlyCompletedActionPrompt, setRecentlyCompletedActionPrompt] = useState(null);

  // Core state
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [historyOutput, setHistoryOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnNumber, setTurnNumber] = useState(1);

  // Transaction Manager
  const [transactionManager] = useState(() => getTransactionManager(scenarioId || '1680-mexico-city'));

  // PHASE 1.3: Player position, facing, and stats now managed by PlayerContext
  const {
    position: playerPosition,
    setPosition: setPlayerPosition,
    facing: playerFacing,
    setFacing: setPlayerFacing,
    stats,
    playerSkills,
    awardXP: rawAwardXP,
    awardSkillXP: rawAwardSkillXP,
    learnNewSkill,
    improveSkill,
    resetSkills,
    activeEffects,
    setActiveEffects,
    skillEffects, // CRITICAL: Needed for useGameHandlers
    consecutiveLowEnergyTurns,
    setConsecutiveLowEnergyTurns,
  } = usePlayer();
  const [currentMapData, setCurrentMapData] = useState(null);
  const [currentMapId, setCurrentMapId] = useState('botica-interior'); // Interior map ID

  // Load map data when map ID changes
  useEffect(() => {
    if (scenario?.maps && currentMapId) {
      // Check both interior and exterior maps
      let mapData = scenario.maps.interior?.[currentMapId] || scenario.maps.exterior?.[currentMapId];

      if (mapData) {
        console.log('[GamePage] Loading map data for:', currentMapId);
        setCurrentMapData(mapData);
      } else {
        console.warn('[GamePage] No map data found for:', currentMapId);
      }
    }
  }, [currentMapId, scenario]);

  // Populate location NPCs ONCE when map changes (persist across turns)
  useEffect(() => {
    if (currentMapId && gameState.time && gameState.date) {
      const locationNPCs = getLocationNPCs(currentMapId, gameState.time, gameState.date);
      if (locationNPCs.length > 0) {
        console.log(`[GamePage] Populating location NPCs for ${currentMapId}: ${locationNPCs.length} NPCs`);
        setGameState(prev => ({
          ...prev,
          currentLocationNPCs: locationNPCs
        }));
      } else {
        // Clear location NPCs for non-hardcoded locations
        console.log(`[GamePage] No location NPCs defined for ${currentMapId}`);
        setGameState(prev => ({
          ...prev,
          currentLocationNPCs: []
        }));
      }
    }
  }, [currentMapId]); // ONLY re-run when map changes (NOT on time/date changes)

  // Initialize event systems on mount
  useEffect(() => {
    initializeEventSystem();
    resetWeatherEventTracking();
    console.log('[GamePage] Random event and weather event systems initialized');
  }, []); // Run once on mount

  // VIEWPORT: Track location changes for contextual images
  useEffect(() => {
    // When location changes, set flag to true
    setRecentLocationChange(true);
    console.log('[Viewport] Location changed:', gameState.location);

    // Auto-reset after 5 seconds (viewport images show for a brief period)
    const timer = setTimeout(() => {
      setRecentLocationChange(false);
      console.log('[Viewport] Location change flag reset');
    }, 5000);

    return () => clearTimeout(timer);
  }, [gameState.location]);

  // NPC position tracking (real-time updates every 100ms)
  const {
    npcPositions,
    setNPCPosition,
    moveNPC,
    initializeNPCs,
    refresh: refreshNPCPositions
  } = useNPCPositions({ mapId: currentMapId, updateInterval: 100 });

  // Calculate nearby locations for "Go somewhere" dropdown
  const nearbyLocations = useMemo(() => {
    const locations = [];

    // ALWAYS include key exterior locations (fast travel destinations)
    const keyLocations = [
      {
        name: 'Botica de la Amargura',
        type: 'shop',
        isFastTravel: true,
        mapId: 'botica-interior'
      },
      {
        name: 'Metropolitan Cathedral',
        type: 'cathedral',
        isFastTravel: true,
        mapId: 'cathedral-interior'
      },
      {
        name: 'La Merced Market',
        type: 'market',
        isFastTravel: true,
        mapId: 'mercado-interior'
      },
      {
        name: 'El Consulado de Mercaderes',
        type: 'guild hall',
        isFastTravel: true,
        mapId: 'consulado-interior'
      }
    ];

    // Add key locations (unless we're already at one)
    keyLocations.forEach(loc => {
      // Don't show current location
      if (gameState.location !== loc.name) {
        locations.push(loc);
      }
    });

    // If on an interior map, also add nearby interior locations
    if (currentMapData && playerPosition && currentMapId?.includes('interior')) {
      try {
        const gridSystem = getGridSystem(currentMapId, currentMapData);
        const nearby = gridSystem.getNearbyLocations(playerPosition, 3);

        // Add nearby interior locations (rooms/areas)
        nearby.forEach(loc => {
          locations.push({
            ...loc,
            isInterior: true
          });
        });
      } catch (error) {
        console.error('[GamePage] Error getting nearby interior locations:', error);
      }
    }

    console.log('[GamePage] Calculated locations for dropdown:', locations);
    return locations.slice(0, 7); // Max 7 locations total
  }, [currentMapData, playerPosition, currentMapId, gameState.location]);

  // PHASE 1.2: Modal state now managed by ModalContext
  const {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    selectedPDF,
    setSelectedPDF,
    selectedCitation,
    setSelectedCitation,
    detailSkillId,
    setDetailSkillId,
    offerRecipient,
    setOfferRecipient,
    simplePrescribeRecipient,
    setSimplePrescribeRecipient,
  } = useModals();

  // Backward compatibility aliases - use modals object directly
  const isJournalOpen = modals.journal;
  const setIsJournalOpen = (value) => value ? openModal('journal') : closeModal('journal');
  const isInventoryOpen = modals.inventory;
  const setIsInventoryOpen = (value) => value ? openModal('inventory') : closeModal('inventory');
  const isModernInventoryOpen = modals.modernInventory;
  const setIsModernInventoryOpen = (value) => value ? openModal('modernInventory') : closeModal('modernInventory');
  const isHistoryOpen = modals.history;
  const setIsHistoryOpen = (value) => value ? openModal('history') : closeModal('history');
  const isAboutOpen = modals.about;
  const setIsAboutOpen = (value) => value ? openModal('about') : closeModal('about');
  const isMapOpen = modals.map;
  const setIsMapOpen = (value) => value ? openModal('map') : closeModal('map');
  const isInteractiveMapModalOpen = modals.interactiveMap;
  const setIsInteractiveMapModalOpen = (value) => value ? openModal('interactiveMap') : closeModal('interactiveMap');
  const isDiagnoseOpen = modals.diagnose;
  const setIsDiagnoseOpen = (value) => value ? openModal('diagnose') : closeModal('diagnose');

  const isGameLogOpen = modals.gameLog;
  const setIsGameLogOpen = (value) => value ? openModal('gameLog') : closeModal('gameLog');
  const isSettingsOpen = modals.settings;
  const setIsSettingsOpen = (value) => value ? openModal('settings') : closeModal('settings');
  const isHelpOpen = modals.help;
  const setIsHelpOpen = (value) => value ? openModal('help') : closeModal('help');

  // Non-modal UI state (kept as useState)
  const [leftSidebarTab, setLeftSidebarTab] = useState('inventory'); // Control left sidebar tab
  const [isCharacterCardCollapsed, setIsCharacterCardCollapsed] = useState(false); // Track CharacterCard collapse state for condensed header stats
  const [mobileTab, setMobileTab] = useState('character');

  // Opening animation state - only plays once on first game load
  const [hasPlayedOpeningAnimation, setHasPlayedOpeningAnimation] = useState(false);

  // Central Panel state
  const [activeTab, setActiveTab] = useState('chronicle');
  const [gameLog, setGameLog] = useState([]);
  // NOTE: activePatient, patientDialogue, pendingContract now from NPCContext
  const [pendingPrescription, setPendingPrescription] = useState(null);
  const [showPrescriptionOutcomeModal, setShowPrescriptionOutcomeModal] = useState(false);
  const isContractModalOpen = modals.contract;
  const setIsContractModalOpen = (value) => value ? openModal('contract') : closeModal('contract');

  // Exit confirmation state
  const showExitConfirmation = modals.exitConfirmation;
  const setShowExitConfirmation = (value) => value ? openModal('exitConfirmation') : closeModal('exitConfirmation');
  const [pendingExitData, setPendingExitData] = useState(null);

  // Trade system state
  // NOTE: tradingNPC now from NPCContext
  const [tradeMode, setTradeMode] = useState('market'); // 'market' | 'npc' | 'inventory'
  const [inventoryViewMode, setInventoryViewMode] = useState('shelf'); // 'shelf' | 'list'
  const [preselectedTradeTab, setPreselectedTradeTab] = useState(null); // Optional tab to preselect (e.g., 'investments')

  // Simple interaction system state
  const [pendingSimpleInteraction, setPendingSimpleInteraction] = useState(null);

  // Random event system state
  const [pendingRandomEvent, setPendingRandomEvent] = useState(null);

  // Mixing decision system state (Phase 2B)
  const [pendingMixingDecision, setPendingMixingDecision] = useState(null);

  // House call system state (Phase 3A)
  const [pendingHouseCall, setPendingHouseCall] = useState(null);

  // Phase 3B/4: Travel animation state
  const [travelAnimationState, setTravelAnimationState] = useState(null);

  // House call zoom state (for background zoom effect)
  const [travelZoomState, setTravelZoomState] = useState({
    isActive: false,
    progress: 0,
    targetX: 50 // Default center
  });

  // Long-distance travel card state
  const [longDistanceCard, setLongDistanceCard] = useState(null);

  // Purchase offer state (vendor selling to Maria)
  const [pendingPurchaseOffer, setPendingPurchaseOffer] = useState(null);

  // Item consumption modal state
  const isConsumptionModalOpen = modals.consumption;
  const setIsConsumptionModalOpen = (value) => value ? openModal('consumption') : closeModal('consumption');
  const [itemToConsume, setItemToConsume] = useState(null);

  // Game over state
  const [isGameOver, setIsGameOver] = useState(false);
  const [causeOfDeath, setCauseOfDeath] = useState('');

  // NOTE: primaryPortraitFile now from NPCContext (PHASE 1.4)

  // Dynamic action chips from narrative parser
  const [dynamicChips, setDynamicChips] = useState(null);

  // VIEWPORT: Track recent location changes for contextual images
  const [recentLocationChange, setRecentLocationChange] = useState(false);

  const closeLongDistanceCard = useCallback(() => {
    setLongDistanceCard(null);
    // Restore normal UI mode
    setBackgroundMode('normal');
  }, []);

  const openLongDistanceTravelCard = useCallback((trigger = 'manual') => {
    // Fade UI to show background (immersive mode)
    setBackgroundMode('travel');

    const travelOptions = getWorldTravelOptions({
      scenario,
      currentMapId,
      currentLocationText: gameState.location,
      playerPosition,
      maxResults: 10,
      currentWorldLocationId: gameState.worldLocationId || null
    });

    if (!travelOptions.destinations || travelOptions.destinations.length === 0) {
      if (toast?.info) {
        toast.info('No long-distance destinations are available yet.', { duration: 4000 });
      }
      return;
    }

    if (longDistanceCard && longDistanceCard.trigger === trigger) {
      setLongDistanceCard({
        trigger,
        origin: travelOptions.origin,
        options: travelOptions.destinations
      });
      return;
    }

    setLongDistanceCard({
      trigger,
      origin: travelOptions.origin,
      options: travelOptions.destinations
    });
  }, [scenario, currentMapId, gameState.location, gameState.worldLocationId, playerPosition, toast, longDistanceCard]);

  // Narration settings state
  const [narrationFontSize, setNarrationFontSize] = useState('text-base');
  const [narrationDarkMode, setNarrationDarkMode] = useState(false);
  const isNarrationSettingsOpen = modals.narrationSettings;
  const setIsNarrationSettingsOpen = (value) => value ? openModal('narrationSettings') : closeModal('narrationSettings');

  // Weather background toggle (default: true)
  const [weatherBackgroundEnabled, setWeatherBackgroundEnabled] = useState(() => {
    const saved = localStorage.getItem('apothecary_weatherBackground');
    return saved === null ? true : saved === 'true';
  });

  // Persist weather background preference
  useEffect(() => {
    localStorage.setItem('apothecary_weatherBackground', String(weatherBackgroundEnabled));
  }, [weatherBackgroundEnabled]);
  const isLLMViewOpen = modals.llmView;
  const setIsLLMViewOpen = (value) => value ? openModal('llmView') : closeModal('llmView');

  // Portrait state: temporary "determined" override (shows for 5 seconds after XP gain)
  const showDeterminedPortrait = modals.determinedPortrait;
  const setShowDeterminedPortrait = (value) => value ? openModal('determinedPortrait') : closeModal('determinedPortrait');
  const determinedTimerRef = React.useRef(null);

  // Persistent cache for ReadableTextModal - prevents re-generating same documents
  const textCacheRef = useRef({});

  // Reputation system
  const { reputation, updateReputation, reputationEmoji, setReputation: setReputationDirect } = useReputation();

  // NOTE: Skills system now provided by PlayerContext (see usePlayer hook above)
  // playerSkills, rawAwardXP, rawAwardSkillXP, activeEffects all come from usePlayer()

  // Wrap XP award functions to apply Scholar profession bonuses
  const awardXP = useCallback((xp, source = 'unknown') => {
    const multiplier = getXPMultiplier(gameState.chosenProfession, playerSkills.level);
    const adjustedXP = Math.floor(xp * multiplier);

    if (multiplier > 1.0) {
      console.log(`[Scholar] XP bonus applied: ${xp} → ${adjustedXP} (+${Math.round((multiplier - 1) * 100)}%)`);
    }

    rawAwardXP(adjustedXP, source);

    // Trigger XP gain notification with category for color-coded particles
    const reasonText = formatXPReason(source);
    const category = categorizeXPSource(source);
    setXPGain({ amount: adjustedXP, reason: reasonText, category });
    setXPGainKey(prev => prev + 1);

    // Auto-open status tab to show XP gain
    setLeftSidebarTab('status');

    // Show "determined" portrait for 5 seconds after XP gain
    if (determinedTimerRef.current) {
      clearTimeout(determinedTimerRef.current);
    }
    setShowDeterminedPortrait(true);
    determinedTimerRef.current = setTimeout(() => {
      setShowDeterminedPortrait(false);
    }, 5000);

    // Clear notification after 2 seconds
    setTimeout(() => {
      setXPGain(null);
    }, 2000);
  }, [rawAwardXP, gameState.chosenProfession, playerSkills.level]);

  // Categorize XP sources for color-coded particles
  // gold: deals/contracts, green: foraging/herbal, purple: medical, blue: everything else
  const categorizeXPSource = (source) => {
    if (source.includes('sale_') || source.includes('contract_treatment')) {
      return 'gold'; // Deals and contracts
    } else if (source.includes('foraging') || source.includes('compound_creation')) {
      return 'green'; // Foraging and herbal skills
    } else if (source.includes('prescription') || source.includes('surgery') ||
               source.includes('bloodletting') || source.includes('patient_healing')) {
      return 'purple'; // Medical diagnosis and treatment
    } else {
      return 'blue'; // Everything else (rest, purchases, etc.)
    }
  };

  // Format XP reason text for display
  const formatXPReason = (source) => {
    if (source.includes('prescription') || source.includes('patient_healing')) {
      return 'prescription';
    } else if (source.includes('contract_treatment')) {
      return 'treatment contract';
    } else if (source.includes('sale_')) {
      return 'sale';
    } else if (source.includes('compound_creation')) {
      return 'alchemy';
    } else if (source.includes('foraging')) {
      return 'foraging';
    } else if (source.includes('rest')) {
      return 'rest';
    } else if (source.includes('commerce_purchase')) {
      return 'purchase';
    } else if (source.includes('surgery') || source.includes('bloodletting')) {
      return 'surgery';
    } else {
      return source.replace(/_/g, ' ');
    }
  };

  const awardSkillXP = useCallback((skillId, xp, source = 'unknown') => {
    const multiplier = getSkillXPMultiplier(gameState.chosenProfession, playerSkills.level);
    const adjustedXP = Math.floor(xp * multiplier);

    if (multiplier > 1.0) {
      console.log(`[Scholar] Skill XP bonus applied: ${xp} → ${adjustedXP} (+${Math.round((multiplier - 1) * 100)}%)`);
    }

    rawAwardSkillXP(skillId, adjustedXP, source);
  }, [rawAwardSkillXP, gameState.chosenProfession, playerSkills.level]);

  // Compute Maria's portrait dynamically based on game state
  const mariaPortraitUrl = useMemo(() => {
    // PRIORITY 1: "determined" override (XP gain flash, 5 seconds)
    if (showDeterminedPortrait) {
      console.log('[Portrait] Using determined override (XP gain flash)');
      return getDeterminedPortrait();
    }

    // PRIORITY 2: Status word from StatusAgent (LLM-determined emotional state)
    if (gameState.status) {
      const statusPortrait = getPortraitFromStatus(gameState.status);
      if (statusPortrait) {
        console.log('[Portrait] Using status word:', gameState.status, '→', statusPortrait);
        return statusPortrait;
      }
    }

    // PRIORITY 3: Calculated from health/energy/XP (fallback)
    const calculatedPortrait = getMariaPortrait({
      health: gameState.health || 100,
      energy: gameState.energy || 100,
      currentXP: playerSkills.xp || 0,
      nextLevelXP: playerSkills.xpToNextLevel || 100,
      level: playerSkills.level || 1,
      recentFailure: false // TODO: Track recent failures
    });
    console.log('[Portrait] Using calculated portrait (health/energy/XP):', calculatedPortrait);
    return calculatedPortrait;
  }, [
    showDeterminedPortrait,
    gameState.status, // NEW: Add status dependency
    gameState.health,
    gameState.energy,
    playerSkills.xp,
    playerSkills.xpToNextLevel,
    playerSkills.level
  ]);

  // NOTE: activeEffects and consecutiveLowEnergyTurns now provided by PlayerContext (see usePlayer hook above)

  // XP gain notification state
  const [xpGain, setXPGain] = useState(null);
  const [xpGainKey, setXPGainKey] = useState(0); // Force re-render for animations

  // Popups and modals (now using ModalContext)
  const showMixingPopup = modals.mixing;
  const setShowMixingPopup = (value) => value ? openModal('mixing') : closeModal('mixing');
  const showSymptomsPopup = modals.symptoms;
  const setShowSymptomsPopup = (value) => value ? openModal('symptoms') : closeModal('symptoms');
  const isPrescribePopupOpen = modals.prescribe;
  const setIsPrescribePopupOpen = (value) => value ? openModal('prescribe') : closeModal('prescribe');
  const isBuyOpen = modals.buy;
  const setIsBuyOpen = (value) => value ? openModal('buy') : closeModal('buy');
  const isSleepOpen = modals.sleep;
  const setIsSleepOpen = (value) => value ? openModal('sleep') : closeModal('sleep');
  const isRestDurationOpen = modals.restDuration;
  const setIsRestDurationOpen = (value) => value ? openModal('restDuration') : closeModal('restDuration');
  const isEatOpen = modals.eat;
  const setIsEatOpen = (value) => value ? openModal('eat') : closeModal('eat');
  const isForageOpen = modals.forage;
  const setIsForageOpen = (value) => value ? openModal('forage') : closeModal('forage');
  const isPdfOpen = modals.pdf;
  const setIsPdfOpen = (value) => value ? openModal('pdf') : closeModal('pdf');

  // Non-modal state (kept as useState)
  const [isPrescribing, setIsPrescribing] = useState(false);
  const [currentPrescriptionType, setCurrentPrescriptionType] = useState(null);
  // NOTE: currentPatient now from NPCContext
  const [selectedNpcName, setSelectedNpcName] = useState('');
  const [sleepHours, setSleepHours] = useState(8);
  // selectedPDF and selectedCitation now come from ModalContext

  // Study Tab - Discovered Books
  const [discoveredBooks, setDiscoveredBooks] = useState(() => {
    const saved = localStorage.getItem(`apothecary_discovered_books_${scenarioId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Entity modals (now using ModalContext)
  const showEndGamePopup = modals.endGame;
  const setShowEndGamePopup = (value) => value ? openModal('endGame') : closeModal('endGame');
  const showPatientModal = modals.patient;
  const setShowPatientModal = (value) => value ? openModal('patient') : closeModal('patient');
  const showNPCModal = modals.npc;
  const setShowNPCModal = (value) => value ? openModal('npc') : closeModal('npc');
  const showItemModal = modals.item;
  const setShowItemModal = (value) => value ? openModal('item') : closeModal('item');
  const showEquipmentModal = modals.equipment;
  const setShowEquipmentModal = (value) => value ? openModal('equipment') : closeModal('equipment');
  const showReputationModal = modals.reputation;
  const setShowReputationModal = (value) => value ? openModal('reputation') : closeModal('reputation');
  const showSkillsModal = modals.skills;
  const setShowSkillsModal = (value) => value ? openModal('skills') : closeModal('skills');
  // detailSkillId now comes from ModalContext
  const showPOIModal = modals.poi;
  const setShowPOIModal = (value) => value ? openModal('poi') : closeModal('poi');
  const isLedgerOpen = modals.ledger;
  const setIsLedgerOpen = (value) => value ? openModal('ledger') : closeModal('ledger');
  const isFastTravelOpen = modals.fastTravel;
  const setIsFastTravelOpen = (value) => value ? openModal('fastTravel') : closeModal('fastTravel');
  const isBloodlettingOpen = modals.bloodletting;
  const setIsBloodlettingOpen = (value) => value ? openModal('bloodletting') : closeModal('bloodletting');
  const isPatientRosterOpen = modals.patientRoster;
  const setIsPatientRosterOpen = (value) => value ? openModal('patientRoster') : closeModal('patientRoster');

  // Leveling system modals (now using ModalContext)
  const showLevelUpNotification = modals.levelUp;
  const setShowLevelUpNotification = (value) => value ? openModal('levelUp') : closeModal('levelUp');
  const showProfessionChoiceModal = modals.professionChoice;
  const setShowProfessionChoiceModal = (value) => value ? openModal('professionChoice') : closeModal('professionChoice');
  const showAbilityUnlockNotification = modals.abilityUnlock;
  const setShowAbilityUnlockNotification = (value) => value ? openModal('abilityUnlock') : closeModal('abilityUnlock');

  // Non-modal state (kept as useState)
  const [gameOver, setGameOver] = useState(false);
  const [gameAssessment, setGameAssessment] = useState('');
  // NOTE: selectedPatient, selectedNPC now from NPCContext
  const [selectedItem, setSelectedItem] = useState(null);
  const [reputationModalFaction, setReputationModalFaction] = useState(null);
  const [reputationChange, setReputationChange] = useState(null); // { delta: number, timestamp: number } for UI feedback
  const [selectedPOIEntity, setSelectedPOIEntity] = useState(null);
  const [levelUpData, setLevelUpData] = useState(null);
  const [abilityUnlockData, setAbilityUnlockData] = useState(null);

  // Document modal state (for auto-opening readable documents)
  const [pendingDocument, setPendingDocument] = useState(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  // Save/Load modal state
  const [isSaveLoadModalOpen, setIsSaveLoadModalOpen] = useState(false);

  // Background mode state - controls when main UI fades to show background
  const [backgroundMode, setBackgroundMode] = useState('normal');
  // Modes: 'normal' (UI visible), 'weather' (weather view), 'travel' (long distance), 'housecall', 'event'
  const isUIFaded = backgroundMode !== 'normal'; // Computed property for fade state

  const [weatherDescription, setWeatherDescription] = useState('Clear');
  const [currentWeather, setCurrentWeather] = useState(null); // Full weather state for narrative integration

  // Item action popup state (for drag-drop on portraits)
  const [itemActionPopup, setItemActionPopup] = useState({
    isOpen: false,
    item: null,
    npc: null
  });

  // NPC/Portrait state - REMOVED (dead code, never read by any component)

  // Journal state
  const [journal, setJournal] = useState([]);
  const [customJournalEntry, setCustomJournalEntry] = useState('');

  // Additional state for commands
  const [commandsDetected, setCommandsDetected] = useState({
    prescribe: false,
    symptoms: false,
    diagnose: false,
    map: false,
    buy: false,
    sleep: false,
    forage: false
  });
  const [incorporatedContent, setIncorporatedContent] = useState('');
  const [additionalQuestions, setAdditionalQuestions] = useState('');
  const [userActions, setUserActions] = useState([]);
  const [summaryData, setSummaryData] = useState({ time: '', date: '', location: '' });
  const [showIncorporatePopup, setShowIncorporatePopup] = useState(false);

  // Auto-save transactions to localStorage
  // NOTE: Disabled until save system is implemented
  // useEffect(() => {
  //   if (transactionManager && scenarioId) {
  //     transactionManager.saveToStorage(scenarioId);
  //   }
  // }, [gameState.wealth, transactionManager, scenarioId]);

  // Real-time clock: advance game time by 10 minutes every real-world minute
  useEffect(() => {
    const clockInterval = setInterval(() => {
      advanceTime({ minutes: 10 });
      console.log('[Real-Time Clock] Advanced game time by 10 minutes');
    }, 60000); // 60,000 ms = 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(clockInterval);
  }, [advanceTime]);

  // Opening animation - mark as complete after animation finishes
  useEffect(() => {
    if (!hasPlayedOpeningAnimation) {
      // Total animation time: pause (500ms) + narrative (600ms) + overlapping cascades + buffer
      const timeout = setTimeout(() => {
        setHasPlayedOpeningAnimation(true);
      }, 2800);
      return () => clearTimeout(timeout);
    }
  }, [hasPlayedOpeningAnimation]);

  // Auto-switch to Reputation tab when reputation changes
  useEffect(() => {
    if (reputationChange && reputationChange.delta !== 0) {
      console.log('[Reputation] Auto-switching to Reputation tab, delta:', reputationChange.delta);
      setLeftSidebarTab('reputation');

      // Clear the delta after 3 seconds to stop particle effect
      const timeout = setTimeout(() => {
        setReputationChange(null);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [reputationChange]);

  // Auto-switch to Inventory tab when items are added
  useEffect(() => {
    if (lastAddedItem) {
      console.log('[Inventory] Auto-switching to Inventory tab, added item:', lastAddedItem.name);
      setLeftSidebarTab('inventory');

      // Clear the lastAddedItem after 2 seconds to stop particle effect
      const timeout = setTimeout(() => {
        clearLastAddedItem();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [lastAddedItem, clearLastAddedItem]);

  // Handle level-ups and profession choice (now using playerSkills.level)
  const prevLevelRef = React.useRef(playerSkills.level);
  useEffect(() => {
    if (playerSkills.level > prevLevelRef.current) {
      // Level up occurred! Award health and energy bonuses
      const healthGain = 10;
      const energyGain = 5;

      setHealth(prev => Math.min(100, prev + healthGain));
      setEnergy(prev => Math.min(100, prev + energyGain));

      setLevelUpData({
        newLevel: playerSkills.level,
        oldLevel: prevLevelRef.current,
        newTitle: gameState.playerTitle,
        healthGain,
        energyGain,
        skillPointGain: 1
      });
      setShowLevelUpNotification(true);

      console.log(`[Level Up] ${prevLevelRef.current} → ${playerSkills.level} (+${healthGain} health, +${energyGain} energy)`);

      // NOTE: Profession choice modal NO LONGER auto-opens at level 5
      // Instead, a glowing "Choose Profession" badge appears in the character card
      // User must click the badge to open the modal

      // Check if a profession ability unlocked at this level (L10/L15/L20/L25)
      if (gameState.chosenProfession) {
        const allAbilities = getAllAbilitiesForProfession(gameState.chosenProfession);
        const unlockedAbility = allAbilities.find(a => a.level === playerSkills.level);

        if (unlockedAbility) {
          // Show ability unlock notification after level-up notification
          setTimeout(() => {
            const professionColors = {
              alchemist: '#8b5cf6',
              herbalist: '#16a34a',
              surgeon: '#dc2626',
              poisoner: '#1f2937',
              scholar: '#0ea5e9',
              court_physician: '#f59e0b'
            };

            setAbilityUnlockData({
              abilityName: unlockedAbility.name,
              abilityDescription: unlockedAbility.description,
              level: playerSkills.level,
              professionIcon: getProfessionIcon(gameState.chosenProfession),
              professionColor: professionColors[gameState.chosenProfession] || '#8b5cf6'
            });
            setShowAbilityUnlockNotification(true);
          }, 7000); // Show after level-up notification closes
        }
      }
    }
    prevLevelRef.current = playerSkills.level;
  }, [playerSkills.level, gameState.playerTitle, gameState.chosenProfession]);

  // Sync title with level and profession changes
  useEffect(() => {
    const newTitle = getPlayerTitle(
      playerSkills.level,
      gameState.chosenProfession,
      playerSkills.knownSkills
    );

    if (newTitle !== gameState.playerTitle) {
      setGameState(prev => ({ ...prev, playerTitle: newTitle }));
      console.log(`[Title] Updated to: ${newTitle}`);
    }
  }, [playerSkills.level, gameState.chosenProfession, playerSkills.knownSkills, gameState.playerTitle, setGameState]);

  // Monitor health for game over condition
  useEffect(() => {
    if (gameState.health <= 0 && !isGameOver) {
      console.log('[GameOver] Health reached 0, triggering game over');
      setIsGameOver(true);

      // If no specific cause of death was set, use generic message
      if (!causeOfDeath) {
        setCauseOfDeath('Maria\'s health was depleted. She succumbed to her injuries and ailments.');
      }
    }
  }, [gameState.health, isGameOver, causeOfDeath]);

  // Load initial narrative on game start AND register EntityList
  useEffect(() => {
    // Register all EntityList entities with EntityManager
    console.log('[GamePage] Registering EntityList entities:', EntityList.length);
    EntityList.forEach(entity => {
      try {
        entityManager.register(entity);
      } catch (error) {
        console.warn(`[GamePage] Failed to register entity ${entity.name}:`, error);
      }
    });

    // Note: activePatient is now set organically when LLM selects a patient entity
    // This happens in useGameHandlers.js after player takes an action

    // Only set initial narrative if conversation history is empty (new game)
    if (conversationHistory.length === 0) {
      const scenario = scenarioLoader.getScenario(scenarioId || '1680-mexico-city');
      if (scenario?.initialNarrative) {
        setConversationHistory([
          {
            role: 'user',
            content: 'Begin the game',
            hidden: true // Hide from UI - only needed for logging system
          },
          {
            role: 'assistant',
            content: scenario.initialNarrative
          }
        ]);
        setHistoryOutput(scenario.initialNarrative);

        // Parse initial narrative for dynamic chips
        const parsedChips = parseNarrativeChoices(scenario.initialNarrative);
        if (parsedChips) {
          console.log('[GamePage] Parsed initial narrative choices:', parsedChips.map(c => c.label).join(', '));
          setDynamicChips(parsedChips);
        }
      }
    }
  }, []); // Only run once on mount

  // Get all handlers from custom hook
  const handlers = useGameHandlers({
    // State setters
    setWealth,  // Changed from setCurrentWealth - now uses gameState
    setReputation: setReputationDirect,
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
    setEnergy,  // Now uses gameState
    setConsecutiveLowEnergyTurns,
    setHealth,  // Now uses gameState
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
    setPreselectedTradeTab, // Trade system - tab pre-selection
    setPendingSimpleInteraction, // Simple interaction system
    setPendingRandomEvent, // Random event system
    setPrimaryPortraitFile, // PHASE 1: For LLM-selected portraits
    setDynamicChips, // Dynamic action chips from narrative parsing
    setPendingPrescription, // Clear prescription card on next action
    setGameState, // For updating gameState (e.g., status from StateAgent)
    setShowPOIModal, // POI modal for map furniture clicks
    setSelectedPOIEntity, // Selected entity for POI modal
    setPendingDocument, // Document modal for letters/codices
    setIsDocumentModalOpen, // Document modal open state
    setTravelAnimationState,
    openLongDistanceTravelCard,
    triggerGameOver,
    setCrisisState,
    setBackgroundMode, // Immersive background mode (fade UI for travel/events)

    // State values
    isLoading, // CRITICAL FIX: Pass loading state for double-click guard
    energy: gameState.energy,  // From gameState
    health: gameState.health,  // From gameState
    currentWealth: gameState.wealth,  // From gameState
    consecutiveLowEnergyTurns,
    toast,
    turnNumber,
    gameState,
    scenarioId,
    userInput,
    conversationHistory,
    historyOutput, // Document context for auto-open
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

    // Document library system
    addDocument,
    markDocumentAsRead,
    getDocuments,
    getUnreadDocumentsCount,

    // Leveling system
    awardXP,
    awardSkillXP,
  });

  const baseHandleProposeAction = handlers.handleProposeAction;
  const handleProposeAction = useCallback(async (proposalData) => {
    if (proposalData?.type === 'prescribe') {
      setRecentlyCompletedActionPrompt({
        type: proposalData.type,
        npcId: proposalData.npcId || null,
        recipientName: proposalData.recipientName || null,
        timestamp: Date.now()
      });
    }
    return baseHandleProposeAction(proposalData);
  }, [baseHandleProposeAction]);

  const visibleActionPrompt = useMemo(() => {
    if (!pendingActionPrompt) return null;

    if (pendingActionPrompt.type === 'prescribe') {
      if (pendingPrescription) return null;

      if (recentlyCompletedActionPrompt?.type === 'prescribe') {
        const sameNpc = recentlyCompletedActionPrompt.npcId && pendingActionPrompt.npcId
          ? recentlyCompletedActionPrompt.npcId === pendingActionPrompt.npcId
          : recentlyCompletedActionPrompt.recipientName && pendingActionPrompt.recipientName
            ? recentlyCompletedActionPrompt.recipientName === pendingActionPrompt.recipientName
            : false;

        if (sameNpc) {
          const elapsed = Date.now() - (recentlyCompletedActionPrompt.timestamp || 0);
          if (elapsed < ACTION_PROMPT_SUPPRESSION_WINDOW) {
            return null;
          }
        }
      }
    }

    return pendingActionPrompt;
  }, [pendingActionPrompt, pendingPrescription, recentlyCompletedActionPrompt]);

  // Destructure handlers for easy use
  const {
    handleWealthChange,
    handleIncorporate,
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
    addJournalEntry,
    handleJournalEntrySubmit,
    applyResourceChanges,
    handleEat,
    handleForageComplete,
    handleItemDrop,
    handleSubmit,
    handleListRequest, // List feature handler
    handleQuickAction,
    handleActionClick,
    handleCommandClick,
    handleSaveGame,
    handleTabChange,
    handleEntityClick,
    handleAskQuestion,
    handleItemAction: handleItemActionFromHook,
    handleAcceptTreatment,
    handleAcceptSale,
    handleDeclineContract,
    handleAcceptTrade,
    handleDeclineTrade,
    handleSimpleInteractionChoice,
    handleRandomEventChoice,
    handleFurnitureClick,
    handleMovement,
    handleEnterBuilding,
    handleExitBuilding,
    handleHouseCallArrival, // Phase 3B/3C: House call arrival
    handleCompleteHouseCall, // Phase 3D: House call completion
  } = handlers;

  const handleLongDistanceTravelSubmit = useCallback((plan) => {
    if (!plan?.command) return;
    setLongDistanceCard(null);
    // Restore normal UI mode
    setBackgroundMode('normal');
    setUserInput(plan.command);

    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSubmit(fakeEvent, plan.command);
    }, 50);
  }, [handleSubmit, setUserInput, setLongDistanceCard]);

  /**
   * Handle loading a save game
   * Reloads the page with the saved data
   */
  const handleLoadSave = useCallback((saveData) => {
    console.log('[GamePage] Loading save:', saveData.metadata);

    // Store the save data in sessionStorage so it persists across page reload
    sessionStorage.setItem('pendingLoadSave', JSON.stringify(saveData));

    // Reload the page to fully reset state
    window.location.reload();
  }, []);

  // Note: Old addCompoundToInventoryWithSaleTrigger removed - sale proposal system deprecated

  // Keyboard event listener for arrow key movement and A/D rotation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only respond to keys when NOT typing in an input field
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      )) {
        return;
      }

      // A/D keys for rotation (works on all maps)
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setPlayerFacing(prev => (prev - 90 + 360) % 360); // Rotate left (counter-clockwise)
        return;
      }
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setPlayerFacing(prev => (prev + 90) % 360); // Rotate right (clockwise)
        return;
      }

      // Map arrow keys to compass directions
      const keyToDirection = {
        'ArrowUp': 'north',
        'ArrowDown': 'south',
        'ArrowLeft': 'west',
        'ArrowRight': 'east'
      };

      const direction = keyToDirection[e.key];
      if (direction) {
        e.preventDefault(); // Prevent page scrolling
        handleMovement(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMovement, setPlayerFacing]);

  // Study Tab - Detect books when narrative changes
  React.useEffect(() => {
    if (historyOutput && historyOutput.length > 0) {
      detectNewBooks(historyOutput);
    }
  }, [historyOutput]);

  // Auto-save every 5 turns
  React.useEffect(() => {
    const turnNumber = gameState.turnNumber;

    // Auto-save every 5 turns (skip turn 0)
    if (turnNumber > 0 && turnNumber % 5 === 0) {
      console.log('[Auto-save] Saving at turn', turnNumber);

      // Use the auto-save function from saveManager
      const { autoSave } = require('../core/services/saveManager');
      const { createSaveData } = require('../core/services/saveManager');

      try {
        const saveData = createSaveData({
          gameState,
          playerSkills,
          conversationHistory,
          reputation,
          npcRelationships: {},
          slotName: `Auto-save Turn ${turnNumber}`
        });

        autoSave(saveData);
        toast.success('Auto-saved!', { duration: 2000 });
      } catch (error) {
        console.error('[Auto-save] Error:', error);
      }
    }
  }, [gameState.turnNumber, gameState, playerSkills, conversationHistory, reputation, toast]);

  // Drag-drop handlers for portraits
  const handleItemDropOnPlayer = (item) => {
    console.log('[ItemDrop] Item dropped on player:', item);
    setItemToConsume(item);
    setIsConsumptionModalOpen(true);
  };

  const handleConfirmConsumption = async () => {
    if (!itemToConsume) return;

    console.log('[Consumption] Confirming consumption of:', itemToConsume.name);

    // Close modal first
    setIsConsumptionModalOpen(false);

    // Show brief info toast while evaluating
    toast.info('Evaluating effects...', 1000);

    try {
      // Check if item exists in inventory
      const inventoryItem = gameState.inventory.find(i => i.name === itemToConsume.name);
      if (!inventoryItem || inventoryItem.quantity < 1) {
        toast.error(`You don't have any ${itemToConsume.name} to consume!`);
        setItemToConsume(null);
        return;
      }

      // Remove one from inventory
      updateInventory(itemToConsume.name, -1, 'consumed');

      // Use LLM to evaluate realistic effects
      const scenario = `Maria de Lima is a converso apothecary in 1680 Mexico City. Current health: ${gameState.health}/100, Energy: ${gameState.energy}/100.`;

      const effects = await evaluateConsumptionEffects(
        itemToConsume.name,
        inventoryItem.properties || {},
        scenario
      );

      // Show appropriate toast based on severity
      const { healthChange, energyChange, message, severity } = effects;

      // Check for lethal consequences
      if (severity === 'lethal' || healthChange <= -100) {
        setCauseOfDeath(message);
        toast.error(message, 6000);
      } else if (severity === 'severe') {
        toast.error(message, 5000);
      } else if (severity === 'beneficial') {
        toast.success(message, 4000);
      } else if (healthChange < 0 || energyChange < 0) {
        toast.warning(message, 4000);
      } else {
        toast.info(message, 4000);
      }

      // Apply resource changes
      applyResourceChanges('consume_item', {
        energyBonus: energyChange,
        healthBonus: healthChange
      });

      // Add to conversation history
      setConversationHistory(prev => [...prev, { role: 'system', content: `*${message}*` }]);

      // Add journal entry
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: `Consumed ${itemToConsume.name}. Energy: ${energyChange > 0 ? '+' : ''}${energyChange}, Health: ${healthChange > 0 ? '+' : ''}${healthChange}.`
      });

    } catch (error) {
      console.error('[Consumption] Error evaluating effects:', error);
      toast.error('Failed to evaluate effects. Item not consumed.');
      // Refund the item since consumption failed
      updateInventory(itemToConsume.name, 1, 'refunded');
    }

    setItemToConsume(null);
  };

  const handleCancelConsumption = () => {
    console.log('[Consumption] Cancelled consumption');
    setIsConsumptionModalOpen(false);
    setItemToConsume(null);
  };

  // Handle game restart after game over
  const handleRestartGame = () => {
    console.log('[GameOver] Restarting game');

    // Clear localStorage to reset save
    localStorage.removeItem('apothecaryGameState');
    localStorage.removeItem('apothecaryConversationHistory');

    // Reload the page to start fresh
    window.location.reload();
  };

  const handleMainMenu = () => {
    console.log('[GameOver] Returning to main menu');
    window.location.href = '/'; // Navigate to home page
  };

  const handleWeatherToggle = () => {
    setBackgroundMode(prev => prev === 'weather' ? 'normal' : 'weather');
  };

  const handleItemDropOnNPC = (item, npcData) => {
    // Open action selection popup
    setItemActionPopup({
      isOpen: true,
      item,
      npc: npcData
    });
  };

  // Handle action selection from popup - calls LLM-powered handler
  const handleItemAction = (action, item, npc) => {
    // Pass closePopup function to handler
    const closePopup = () => setItemActionPopup({ isOpen: false, item: null, npc: null });
    handleItemActionFromHook(action, item, npc, closePopup);
  };

  // Handle journey narration when map animation completes
  const handleAnimationComplete = useCallback(async (journeyData) => {
    console.log('[Journey] Animation complete, generating narration:', journeyData);

    const { startPosition, endPosition, distance, travelMinutes, mapType, mapId } = journeyData;

    // Get current map data to find landmarks/rooms
    const scenario = scenarioLoader.getScenario(scenarioId || '1680-mexico-city');
    const mapData = scenario?.maps?.interior?.[mapId] || scenario?.maps?.exterior?.[mapId];

    if (!mapData) {
      console.warn('[Journey] No map data found for', mapId);
      return;
    }

    // Handle interior movement separately (use pre-written narratives)
    if (mapType === 'interior') {
      console.log('[Journey] Interior movement detected');

      // Check for pre-written narratives (same system as arrow key movement)
      if (mapId === 'botica-interior') {
        try {
          const { getInteriorNarrative, hasPreWrittenNarrative } = await import('../features/map/services/interiorNarratives');

          if (hasPreWrittenNarrative(mapId, endPosition.x, endPosition.y)) {
            console.log('[Journey] Using pre-written interior narrative for position:', endPosition);

            const narrative = getInteriorNarrative(endPosition.x, endPosition.y, gameState.time);

            // Add narrative to conversation history (same as arrow key movement)
            const newEntry = {
              role: 'assistant',
              content: narrative.description,
              timestamp: new Date().toISOString(),
              responseType: 'movement',
              isMovement: true,
              position: endPosition
            };

            setConversationHistory(prev => [...prev, newEntry]);
            setHistoryOutput(narrative.description);

            console.log('[Journey] Pre-written narrative applied - no time/energy cost');
            return; // Exit early - no time advancement for simple repositioning
          }
        } catch (error) {
          console.warn('[Journey] Could not load pre-written narratives:', error);
        }
      }

      // Fallback: Generic interior narration if no pre-written narrative exists
      const findRoomAtPosition = (position, rooms) => {
        if (!rooms || rooms.length === 0) return null;

        for (const room of rooms) {
          if (!room.polygon) continue;

          const polygon = room.polygon;
          let inside = false;
          for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            const intersect = ((yi > position.y) !== (yj > position.y))
              && (position.x < (xj - xi) * (position.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }
          if (inside) return room;
        }
        return null;
      };

      const destinationRoom = findRoomAtPosition(endPosition, mapData.rooms || []);
      const roomName = destinationRoom?.name || 'another part of the building';

      const interiorNarration = `Maria crossed the room, her footsteps echoing softly as she moved to ${roomName.toLowerCase()}.`;

      const newEntry = {
        role: 'assistant',
        content: interiorNarration,
        timestamp: new Date().toISOString(),
        responseType: 'movement',
        isMovement: true,
        position: endPosition
      };

      setConversationHistory(prev => [...prev, newEntry]);
      setHistoryOutput(interiorNarration);

      // Minimal time advancement for interior movement (1-2 minutes)
      const interiorTime = Math.max(1, Math.round(distance / 100));
      advanceTime({ minutes: interiorTime });

      console.log('[Journey] Generic interior narration complete, time advanced by', interiorTime, 'minutes');
      return;
    }

    // Find nearest buildings/landmarks at destination
    const findNearestLandmarks = (position, buildings, maxCount = 3) => {
      if (!buildings || buildings.length === 0) return [];

      const getDistanceToBuilding = (building) => {
        // Calculate center of building polygon
        if (!building.polygon || building.polygon.length === 0) return Infinity;

        const centerX = building.polygon.reduce((sum, p) => sum + p[0], 0) / building.polygon.length;
        const centerY = building.polygon.reduce((sum, p) => sum + p[1], 0) / building.polygon.length;

        const dx = position.x - centerX;
        const dy = position.y - centerY;
        return Math.sqrt(dx * dx + dy * dy);
      };

      return buildings
        .map(building => ({
          ...building,
          distance: getDistanceToBuilding(building)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxCount);
    };

    const nearbyLandmarks = findNearestLandmarks(endPosition, mapData.buildings || [], 3);

    // Generate journey narration using LLM
    try {
      const landmarkNames = nearbyLandmarks.map(l => l.name || l.fullName).filter(Boolean);
      const landmarkContext = landmarkNames.length > 0
        ? `Nearby landmarks: ${landmarkNames.join(', ')}`
        : 'No major landmarks nearby';

      const prompt = `You are narrating Maria de Lima's movement through 1680 Mexico City.

JOURNEY DETAILS:
- Distance traveled: ~${Math.round(distance / 1.5)} meters (${travelMinutes} minutes walking)
- Destination vicinity: ${landmarkContext}
- Current time: ${gameState.time}, ${gameState.date}

Generate a descriptive (3-4 sentences) narrative description of Maria's journey through the city streets. Include:
- Sensory details (sights, sounds, smells of colonial Mexico City)
- The route taken (which streets, landmarks passed)
- Maria's thoughts or observations during the walk

End with Maria arriving at her destination near the landmarks mentioned above.

Be historically accurate, immersive, and concise. Write in third person past tense.`;

      const messages = [
        { role: 'system', content: 'You are a historical fiction narrator specializing in colonial Mexico.' },
        { role: 'user', content: prompt }
      ];

      console.log('[Journey] Calling LLM for journey narration...');
      const response = await createChatCompletion(
        messages,
        0.8, // temperature
        200  // maxTokens
      );

      console.log('[Journey] LLM response received:', response);
      console.log('[Journey] Response structure:', {
        hasContent: !!response.content,
        content: response.content,
        hasChoices: !!response.choices,
        choicesContent: response.choices?.[0]?.message?.content,
        fullResponse: JSON.stringify(response, null, 2)
      });

      // Extract content from response - check both standard API format and normalized format
      const narration = response.choices?.[0]?.message?.content
        || response.content
        || `Maria walked ${travelMinutes} minutes through the streets to reach her destination.`;

      console.log('[Journey] Final narration text:', narration);
      console.log('[Journey] Narration length:', narration.length);

      // Add narration to conversation history
      const newEntry = {
        role: 'assistant',
        content: narration,
        timestamp: new Date().toISOString(),
        time: gameState.time,
        date: gameState.date,
        responseType: 'movement',
        isMovement: true,
        position: endPosition
      };

      console.log('[Journey] Adding entry to conversation history:', newEntry);
      setConversationHistory(prev => [...prev, newEntry]);

      console.log('[Journey] Setting history output to:', narration);
      setHistoryOutput(narration); // Display immediately in UI

      // Advance game time
      advanceTime({ minutes: travelMinutes });

      // Update location based on nearest landmark
      if (nearbyLandmarks.length > 0) {
        const primaryLandmark = nearbyLandmarks[0];
        const newLocation = primaryLandmark.name
          ? `Near ${primaryLandmark.name}, Mexico City`
          : gameState.location; // Keep current if no landmark found

        updateLocation(newLocation);
        console.log('[Journey] Updated location to:', newLocation);
      }

      console.log('[Journey] Narration complete, time advanced by', travelMinutes, 'minutes');

    } catch (error) {
      console.error('[Journey] Error generating narration:', error);
      console.error('[Journey] Error details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      // Fallback: Just advance time and add simple message
      const fallbackMessage = `Maria walked ${travelMinutes} minutes through the streets of Mexico City.`;
      console.log('[Journey] Using fallback message:', fallbackMessage);
      const fallbackEntry = {
        role: 'assistant',
        content: fallbackMessage,
        timestamp: new Date().toISOString(),
        time: gameState.time,
        date: gameState.date,
        responseType: 'movement',
        isMovement: true,
        position: endPosition
      };
      console.log('[Journey] Adding fallback entry to history:', fallbackEntry);
      setConversationHistory(prev => [...prev, fallbackEntry]);
      console.log('[Journey] Setting fallback history output');
      setHistoryOutput(fallbackMessage);
      advanceTime({ minutes: travelMinutes });
    }
  }, [scenarioId, gameState, setConversationHistory, setHistoryOutput, advanceTime, updateLocation]);

  // Handle opening full inventory modal in list view
  const handleOpenFullInventory = () => {
    setTradeMode('inventory');
    setInventoryViewMode('list');
    setTradingNPC({ type: 'inventory' }); // Set dummy NPC to trigger modal
    setIsBuyOpen(true); // Actually open the modal
  };

  // Handle exit confirmation
  const handleConfirmExit = () => {
    if (!pendingExitData) return;

    console.log('[Exit] Confirming exit to:', pendingExitData.location);

    // Execute the exit - update game state immediately
    updateLocation(pendingExitData.location);
    setCurrentMapId(pendingExitData.mapId);
    setPlayerPosition(pendingExitData.position);

    // Clear modal state
    setShowExitConfirmation(false);

    // Remove the exit confirmation card from conversation history
    setConversationHistory(prev => {
      return prev.filter(entry => entry.card?.type !== 'exit_confirmation');
    });

    // Trigger a full narrative turn to show the exit happening
    // This lets the LLM describe the player leaving and arriving in the new location
    const simulatedAction = `leave ${pendingExitData.locationName || 'the building'} and step outside`;

    // Clear pending data immediately to prevent duplicate exit cards
    setPendingExitData(null);

    // Trigger narrative turn after a brief delay to allow state updates
    setTimeout(() => {
      handleSubmit(null, simulatedAction);
    }, 100);
  };

  // Handle exit cancellation
  const handleCancelExit = () => {
    console.log('[Exit] Cancelling exit');

    // Clear modal state
    setShowExitConfirmation(false);
    setPendingExitData(null);

    // Remove the exit confirmation card from conversation history
    setConversationHistory(prev => {
      return prev.filter(entry => entry.card?.type !== 'exit_confirmation');
    });
  };

  // Study Tab - Book Click Handler
  const handleBookClick = (book) => {
    // Apply costs for reading/studying the book
    // Energy: -1 (minimal mental fatigue)
    const currentEnergy = gameState.energy || 50;
    const newEnergy = Math.max(0, currentEnergy - 1);
    updateEnergy(newEnergy);
    console.log('[Energy] Book study cost: -1 energy');

    // Time: 45 minutes to read and comprehend the book
    advanceTime({ minutes: 45 });
    console.log('[Time] Book study: +45 minutes');

    // XP: +1 for gaining knowledge
    if (typeof awardXP === 'function') {
      awardXP(1, `study_${book.name}`);
      console.log('[XP] Awarded 1 XP for studying:', book.name);
    }

    // Show toast notification
    if (toast) {
      toast.success(`Studied ${book.name}. +1 XP`, { duration: 2000 });
    }

    if (book.pdf) {
      // Open PDF popup
      setSelectedPDF(book.pdf);
      setSelectedCitation(book.citation || '');
      setIsPdfOpen(true);
    } else {
      // Open item modal for the book
      const entity = entityManager.getByName(book.name) || EntityList.find(e => e.name === book.name);
      if (entity) {
        setSelectedItem(entity);
        setShowItemModal(true);
      }
    }
  };

  // Study Tab - Detect New Books in Narrative
  const detectNewBooks = (narrativeText) => {
    const allEntities = entityManager.getAll();
    const allBooksWithPdf = [
      ...allEntities.filter(entity => entity.pdf),
      ...EntityList.filter(entity => entity.pdf)
    ];

    // Create regex pattern to match book names
    if (allBooksWithPdf.length === 0) return;

    const pattern = new RegExp(
      `\\b(${allBooksWithPdf.map(book => book.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
      'gi'
    );

    const newBooks = [];
    const matches = narrativeText.match(pattern);

    if (matches) {
      matches.forEach((match) => {
        const book = allBooksWithPdf.find(
          b => b.name.toLowerCase() === match.toLowerCase()
        );
        if (book && !discoveredBooks.some(eb => eb.name === book.name)) {
          newBooks.push({
            name: book.name,
            pdf: book.pdf,
            citation: book.citation || 'Unknown author',
            type: book.type || 'text',
            discoveredAt: new Date().toISOString(),
            discoveredTurn: turnNumber
          });
        }
      });
    }

    if (newBooks.length > 0) {
      const updated = [...discoveredBooks, ...newBooks];
      setDiscoveredBooks(updated);
      localStorage.setItem(
        `apothecary_discovered_books_${scenarioId}`,
        JSON.stringify(updated)
      );

      // Show toast notification
      newBooks.forEach((book) => {
        toast.info(`📚 Discovered: ${book.name}`);
      });
    }
  };

  // Get fresh NPC list on every render (cheap operation, spreads 5-item array)
  // Don't memoize - causes stale data bugs since npcTracker mutates internally
  // NOTE: getRecentNPCs now from NPCContext
  const recentNPCs = getRecentNPCs();

  // Memoize filtered NPC positions
  const filteredNPCPositions = useMemo(() =>
    npcPositions.filter(npc => recentNPCs.includes(npc.npcName)),
    [npcPositions, recentNPCs]
  );

  // Memoize callback handlers to prevent re-creation on every render
  const handleShowPrescribePopup = useCallback((patient) => {
    setCurrentPatient(patient);
    setIsPrescribePopupOpen(true);
    setIsInventoryOpen(true);
  }, []);

  const handleShowDiagnosePopup = useCallback((patient) => {
    setCurrentPatient(patient);
    setIsDiagnoseOpen(true);
  }, []);

  // Prescription outcome handlers
  const handlePrescriptionPending = useCallback((prescriptionData) => {
    console.log('[PrescriptionOutcome] Received full prescription data:', prescriptionData);
    setPendingPrescription(prescriptionData);
    setActiveTab('chronicle'); // Switch to chronicle tab to show prescription card
  }, []);

  const handleOpenPrescriptionDetails = useCallback((prescriptionData) => {
    console.log('[PrescriptionOutcome] Opening outcome modal:', prescriptionData);
    setShowPrescriptionOutcomeModal(true);
  }, []);

  useEffect(() => {
    if (!pendingHouseCall) {
      setTravelAnimationState(prev => (prev ? null : prev));
    }
  }, [pendingHouseCall]);

  // House call travel callbacks
  const handleTravelUpdate = useCallback((travelState) => {
    console.log('[GamePage] Travel state update:', travelState);
    if (!travelState || travelState.progress >= 100 || travelState.isAnimating === false) {
      setTravelAnimationState(null);
      // Deactivate zoom when travel completes
      setTravelZoomState({ isActive: false, progress: 0, targetX: 50 });
    } else {
      setTravelAnimationState(travelState);
      // Update zoom state with progress
      setTravelZoomState({
        isActive: true,
        progress: travelState.progress,
        targetX: pendingHouseCall?.targetLocation || 50
      });
    }
  }, [pendingHouseCall]);

  const handleCancelTravel = useCallback(() => {
    console.log('[House Call] User cancelled travel');
    setPendingHouseCall(null);
    setTravelAnimationState(null);
    // Reset zoom state
    setTravelZoomState({ isActive: false, progress: 0, targetX: 50 });
    // Restore normal UI mode
    setBackgroundMode('normal');
    // Refund payment
    const refundAmount = pendingHouseCall?.paymentAmount || 0;
    if (refundAmount > 0) {
      setWealth(prev => prev + refundAmount);
      toast.info(`House call cancelled. ${refundAmount} reales refunded.`, { duration: 3000 });
    } else {
      toast.info('House call cancelled.', { duration: 2000 });
    }
  }, [pendingHouseCall, setWealth, toast]);

  // Purchase offer callbacks
  const handleViewPurchaseItems = useCallback(() => {
    console.log('[PurchaseOffer] Opening TradeModal for:', pendingPurchaseOffer?.npcName);

    if (!pendingPurchaseOffer) return;

    // Set up TradeModal with the NPC who's offering goods
    setTradingNPC({
      npcName: pendingPurchaseOffer.npcName,
      npcId: pendingPurchaseOffer.npcId,
      npcPortrait: pendingPurchaseOffer.npcPortrait
    });
    setTradeMode('market'); // Open market tab
    openModal('trade');

    // Keep the offer active until they close the modal or decline
  }, [pendingPurchaseOffer, openModal]);

  const handleDeclinePurchaseOffer = useCallback(async () => {
    console.log('[PurchaseOffer] Declined offer from:', pendingPurchaseOffer?.npcName);

    const journalText = `Declined purchase offer from ${pendingPurchaseOffer.npcName}.`;

    // Clear purchase offer
    setPendingPurchaseOffer(null);

    // Generate brief continuation
    try {
      const { generateContinuationNarrative } = await import('../core/agents/NarrativeAgent');
      const continuation = await generateContinuationNarrative({
        scenarioId: gameState.scenarioId,
        conversationHistory,
        journal,
        journalText,
        isDismissal: true,
        gameState,
        turnNumber
      });

      setConversationHistory(prev => [
        ...prev,
        {
          sender: 'assistant',
          narrative: continuation,
          responseType: 'narration'
        }
      ]);
    } catch (error) {
      console.error('[PurchaseOffer] Failed to generate continuation:', error);
    }
  }, [pendingPurchaseOffer, conversationHistory, journal, gameState, turnNumber]);

  return (
      <DndProvider backend={HTML5Backend}>
        {/* Conditional rendering: Mobile layout for phones/tablets, Desktop layout for larger screens */}
        {(isMobile || isTablet) ? (
          <MobileGameLayout
            handlers={handlers}
            nearbyLocations={nearbyLocations}
            filteredNPCPositions={filteredNPCPositions}
            discoveredBooks={discoveredBooks}
            dynamicChips={dynamicChips}
            conversationHistory={conversationHistory}
            historyOutput={historyOutput}
            isLoading={isLoading}
            userInput={userInput}
            setUserInput={setUserInput}
            turnNumber={turnNumber}
            activeTab={activeTab}
            narrationFontSize={narrationFontSize}
            narrationDarkMode={narrationDarkMode}
            gameLog={gameLog}
            transactionManager={transactionManager}
            TRANSACTION_CATEGORIES={TRANSACTION_CATEGORIES}
            mariaPortraitUrl={mariaPortraitUrl}
            currentMapId={currentMapId}
          />
        ) : (
          <div className="relative min-h-screen overflow-hidden">
            {/* PHASE 3: Weather Background Layer (z-index: -10) */}
            {weatherBackgroundEnabled ? (
              <WeatherBackground
                gameTime={gameState.time}
                gameDate={gameState.date}
                location={gameState.location}
                viewMode="standard"
                onWeatherChange={(description, weatherState) => {
                  setWeatherDescription(description);
                  setCurrentWeather(weatherState); // Store full weather state for narrative agent
                }}
                travelZoom={backgroundMode === 'housecall' ? travelZoomState : null}
                isWeatherViewActive={backgroundMode === 'weather'}
              />
            ) : (
              /* Classic parchment/dark background when weather is disabled */
              <div className="absolute inset-0 -z-10 transition-colors duration-500" style={{
                background: narrationDarkMode
                  ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
                  : 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 50%, #faf8f3 100%)'
              }} />
            )}

            {/* Main UI Content (z-index: auto, glass effects allow weather to show through) */}
            <div
              className={`relative z-10 h-screen flex flex-col overflow-hidden bg-gradient-to-br from-parchment-100/70 via-parchment-50/40 to-parchment-50/50 dark:from-slate-950/70 dark:via-slate-900/60 dark:to-slate-950/70 transition-colors duration-500 ${narrationDarkMode ? 'dark' : ''}`}
              style={{ pointerEvents: isUIFaded ? 'none' : 'auto' }}
            >

        {/* Header - Always visible */}
        <Header
          style={{ pointerEvents: 'auto' }}
          location={gameState.location}
          time={gameState.time}
          date={gameState.date}
          onSaveGame={() => setIsSaveLoadModalOpen(true)}
          onSettings={() => setIsSettingsOpen(true)}
          onHelp={() => setIsHelpOpen(true)}
          weatherDescription={weatherDescription}
          onWeatherClick={handleWeatherToggle}
          isWeatherViewActive={backgroundMode === 'weather'}
          showCondensedStats={isCharacterCardCollapsed}
          health={gameState.health}
          energy={gameState.energy}
          wealth={gameState.wealth}
        />

        {/* Fading content wrapper - everything below Header */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-500 ${isUIFaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {/* House Call Active Indicator */}
          {activePatient && (currentMapId === 'humble-house-interior' || currentMapId === 'middling-house-interior') && (
            <div style={{
              position: 'fixed',
              top: '80px',
              right: '20px',
              zIndex: 1000,
              backgroundColor: '#059669',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              maxWidth: '280px'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🏥</span>
                House Call Active
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Patient: {activePatient.name}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>
                Type "return to botica" when finished
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
          <div className={`h-full max-w-screen-2xl mx-auto px-4 py-1.5 flex gap-6 transition-all duration-500 ease-in-out ${
            activeTab === 'patient' ? 'gap-6' : 'gap-6'
          }`}>

            {/* Left Sidebar - Character Card & Status Panel */}
            <div
              style={{
                opacity: hasPlayedOpeningAnimation ? 1 : 0,
                transform: hasPlayedOpeningAnimation ? 'none' : 'translateX(-20px)',
                animation: hasPlayedOpeningAnimation ? 'none' : 'slideInFromLeft 600ms ease-out 900ms forwards'
              }}
            >
            <LeftSidebar
              wealth={gameState.wealth}
              status={gameState.status} // Pass status from StateAgent
              reputation={reputation}
              reputationEmoji={reputationEmoji}
              health={gameState.health}
              energy={gameState.energy}
              characterName="Maria de Lima"
              characterTitle={gameState.playerTitle || "Master Apothecary"}
              characterLevel={playerSkills.level || 1}
              chosenProfession={gameState.chosenProfession}
              activeEffects={activeEffects}
              playerSkills={playerSkills}
              portraitImage={mariaPortraitUrl}
              conversationHistory={conversationHistory}
              inventory={gameState.inventory}
              onOpenEquipment={() => setShowEquipmentModal(true)}
              onItemClick={(item) => {
                setSelectedItem(item);
                setShowItemModal(true);
              }}
              onOpenReputationModal={(factionId = null) => {
                setReputationModalFaction(factionId);
                setShowReputationModal(true);
              }}
              onOpenSkillsModal={() => setShowSkillsModal(true)}
              onOpenSkillDetail={(skillId) => setDetailSkillId(skillId)}
              onOpenFullInventory={handleOpenFullInventory}
              onItemDropOnPlayer={handleItemDropOnPlayer}
              onOpenProfessionModal={() => setShowProfessionChoiceModal(true)}
              statusPanelTab={leftSidebarTab}
              onStatusPanelTabChange={setLeftSidebarTab}
              xpGain={xpGain}
              xpGainKey={xpGainKey}
              onCharacterCardCollapseChange={setIsCharacterCardCollapsed}
              reputationDelta={reputationChange?.delta || null}
              newlyAddedItemName={lastAddedItem?.name || null}
            />
            </div>

            {/* Center - Central Panel (Tabbed Interface) */}
            <main
              className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-500 ease-in-out ${
                activeTab === 'patient' ? 'mr-0' : ''
              }`}
              style={{
                opacity: hasPlayedOpeningAnimation ? 1 : 0,
                transform: hasPlayedOpeningAnimation ? 'none' : 'translateY(10px)',
                animation: hasPlayedOpeningAnimation ? 'none' : 'fadeInUp 600ms ease-out 500ms forwards'
              }}
            >
              <CentralPanel
                activeTab={activeTab}
                onTabChange={handleTabChange}
                conversationHistory={conversationHistory}
                recentNPCs={recentNPCs}
                isLoading={isLoading}
                onShowPrescribePopup={handleShowPrescribePopup}
                onShowDiagnosePopup={handleShowDiagnosePopup}
                gameLog={gameLog}
                activePatient={activePatient}
                patientDialogue={patientDialogue}
                onAskQuestion={handleAskQuestion}
                // Contract props
                pendingContract={pendingContract}
                onOpenContractModal={() => setIsContractModalOpen(true)}
                // Exit confirmation props
                pendingExitConfirmation={showExitConfirmation ? pendingExitData : null}
                onConfirmExit={handleConfirmExit}
                onCancelExit={handleCancelExit}
                // Trade props
                tradeOpportunities={gameState.tradeOpportunities || []}
                onAcceptTrade={handleAcceptTrade}
                onDeclineTrade={handleDeclineTrade}
                // Simple interaction props
                pendingSimpleInteraction={pendingSimpleInteraction}
                onSimpleInteractionChoice={handleSimpleInteractionChoice}
                // Action prompt props
                pendingActionPrompt={visibleActionPrompt}
                onProposeAction={handleProposeAction}
                onDeclineAction={handlers.handleDeclineAction}
                // Mixing decision props
                pendingMixingDecision={pendingMixingDecision}
                onOpenMixingWorkshop={handlers.handleOpenMixingWorkshop}
                onAbandonMixing={handlers.handleAbandonMixing}
                // Random event props
                pendingRandomEvent={pendingRandomEvent}
                onRandomEventChoice={handleRandomEventChoice}
                onEntityClick={handleEntityClick}
                playerPortrait={mariaPortraitUrl}
                // Prescription props for Patient View
                gameState={gameState}
                updateInventory={updateInventory}
                addJournalEntry={addJournalEntry}
                setHistoryOutput={setHistoryOutput}
                setConversationHistory={setConversationHistory}
                setTurnNumber={setTurnNumber}
                currentWealth={gameState.wealth}
                prescriptionType={currentPrescriptionType}
                advanceTime={advanceTime}
                energy={gameState.energy}
                updateEnergy={updateEnergy}
                transactionManager={transactionManager}
                TRANSACTION_CATEGORIES={TRANSACTION_CATEGORIES}
                toggleInventory={toggleInventory}
                onOpenInventoryTab={() => setLeftSidebarTab('inventory')}
                onOpenMixing={() => setShowMixingPopup(true)}
                onPrescriptionPending={(data) => {
                  setPendingPrescription(data);
                  setActiveTab('chronicle'); // Switch to chronicle tab to show blue card
                }}
                onPrescriptionComplete={() => setPendingPrescription(null)}
                pendingPrescription={pendingPrescription}
                onOpenPrescriptionDetails={handleOpenPrescriptionDetails}
                // Narration settings props
                narrationFontSize={narrationFontSize}
                narrationDarkMode={narrationDarkMode}
                isNarrationSettingsOpen={isNarrationSettingsOpen}
                isLLMViewOpen={isLLMViewOpen}
                onNarrationFontSizeChange={setNarrationFontSize}
                onNarrationDarkModeToggle={() => setNarrationDarkMode(!narrationDarkMode)}
                onOpenNarrationSettings={() => setIsNarrationSettingsOpen(true)}
                onCloseNarrationSettings={() => setIsNarrationSettingsOpen(false)}
                onOpenLLMView={() => setIsLLMViewOpen(true)}
                onCloseLLMView={() => setIsLLMViewOpen(false)}
              />

              {/* Input Area - fixed at bottom (only shown on Chronicle tab) */}
              {activeTab === 'chronicle' && (
                <div className="flex-shrink-0 mt-4">
                  <InputArea
                    userInput={userInput}
                    setUserInput={setUserInput}
                    handleSubmit={handleSubmit}
                    disabled={isLoading}
                    onQuickAction={handleQuickAction}
                    onItemDrop={handleItemDrop}
                    dynamicChips={dynamicChips}
                    nearbyLocations={nearbyLocations}
                    onRequestLongDistanceTravel={() => openLongDistanceTravelCard('chip')}
                    onListRequest={handleListRequest}
                  />
                </div>
              )}
            </main>

            {/* Right Sidebar - Context - Slides out when Patient View is active */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                activeTab === 'patient'
                  ? 'w-0 opacity-0 translate-x-full overflow-hidden pointer-events-none'
                  : 'w-[356px] lg:w-[356px] xl:w-[370px] opacity-100 translate-x-0'
              }`}
              style={{
                opacity: hasPlayedOpeningAnimation || activeTab === 'patient' ? undefined : 0,
                transform: hasPlayedOpeningAnimation || activeTab === 'patient' ? undefined : 'translateX(20px)',
                animation: hasPlayedOpeningAnimation || activeTab === 'patient' ? 'none' : 'slideInFromRight 600ms ease-out 1200ms forwards'
              }}
            >
              <ContextPanel
                location={gameState.location}
                locationDetails={gameState.location}
                onActionClick={handleActionClick}
                recentNPCs={recentNPCs}
                primaryPortraitFile={primaryPortraitFile} // PHASE 1: LLM-selected portrait
                currentNarrative={historyOutput}
                recentNarrativeTurn={historyOutput} // Most recent narrative turn for LLM analysis
                scenario={scenarioLoader.getScenario(scenarioId || '1680-mexico-city')}
                npcs={filteredNPCPositions} // Only show NPCs mentioned in narrative
                playerPosition={
                  travelAnimationState?.position
                    ? { x: travelAnimationState.position[0], y: travelAnimationState.position[1] }
                    : playerPosition
                } // Phase 4: Use animated position during travel (convert array to object)
                playerFacing={travelAnimationState?.direction || playerFacing} // Phase 4: Use animated direction during travel
                currentMapId={currentMapId} // Pass current map ID to control which map is rendered
                shopSignHung={gameState.shopSign?.hung || false} // Pass shop sign status
                setIsLedgerOpen={setIsLedgerOpen} // Open Ledger Modal when Accounts button clicked
                toggleShopSign={toggleShopSign} // Direct shop sign control
                toast={toast} // For notifications
                entities={currentEntities} // Entities for Wikipedia context panel
                discoveredBooks={discoveredBooks} // Books discovered during gameplay
                onBookClick={handleBookClick} // Handle book clicks in Study tab
                documents={getDocuments()} // Document library from gameState
                onDocumentClick={(doc) => {
                  // Re-open document from library
                  console.log('[DocumentSystem] Re-opening document from library:', doc.name);
                  setPendingDocument(doc);
                  setIsDocumentModalOpen(true);
                }}
                pendingHouseCall={pendingHouseCall} // Phase 3B: House call data (triggers map view)
                travelPath={travelAnimationState?.path || null} // Phase 4: Travel path for map animation
                isTraveling={!!pendingHouseCall && !!travelAnimationState} // Phase 4: Whether currently traveling
                activeTab={activeTab} // FIX #4: Tab context for portrait display
                activePatient={activePatient} // FIX #4: Patient entity for Patient View tab
                reputationChange={reputationChange} // Reputation change indicator
                focusedItem={gameState.focusedItem || null} // VIEWPORT: Item player is examining/using
                gameTime={gameState.time || null} // VIEWPORT: Current game time for time-based scenes
                recentLocationChange={recentLocationChange} // VIEWPORT: Whether location just changed
                onLocationChange={(newLocation) => {
                  console.log('Location changed to:', newLocation);
                  updateLocation(newLocation);
                }}
                onPortraitClick={handlePortraitClick} // Handle portrait clicks
                onMapClick={() => setIsInteractiveMapModalOpen(true)} // Open map modal
                onItemDropOnNPC={handleItemDropOnNPC} // Handle item drops on NPC portrait
                onEnterBuilding={handleEnterBuilding} // Handle building entry click on map
                onExitBuilding={handleExitBuilding} // Handle Exit button click on map
                onRoomCommand={handleSubmit} // Handle room movement commands from map
                onFurnitureClick={handleFurnitureClick} // Handle furniture clicks on map
                onPlayerTeleport={setPlayerPosition} // Handle Ctrl+Click teleport
                onAnimationComplete={handleAnimationComplete} // Handle journey narration when animation completes
              />
            </div>

          </div>
          </div>
        </div>
        {/* End fading content wrapper */}

        </div>
        {/* End weather background wrapper */}
        </div>
        )}
        {/* End conditional rendering */}

        {/* All game modals managed by GameModals component - Shared by both mobile and desktop */}
        <GameModals
          // Modal states
          showMixingPopup={showMixingPopup}
          isPrescribePopupOpen={isPrescribePopupOpen}
          isSimplePrescribeOpen={modals.simplePrescribe}
          isSleepOpen={isSleepOpen}
          isRestDurationOpen={isRestDurationOpen}
          isMapOpen={isMapOpen}
          isInteractiveMapModalOpen={isInteractiveMapModalOpen}
          isInventoryOpen={isInventoryOpen}
          isJournalOpen={isJournalOpen}
          isAboutOpen={isAboutOpen}
          showPatientModal={showPatientModal}
          showNPCModal={showNPCModal}
          showItemModal={showItemModal}
          showEquipmentModal={showEquipmentModal}
          showReputationModal={showReputationModal}
          reputationModalFaction={reputationModalFaction}
          showSkillsModal={showSkillsModal}
          detailSkillId={detailSkillId}
          showPOIModal={showPOIModal}
          isSettingsOpen={isSettingsOpen}
          isHelpOpen={isHelpOpen}
          isPdfOpen={isPdfOpen}
          showEndGamePopup={showEndGamePopup}
          isEatOpen={isEatOpen}
          isForageOpen={isForageOpen}
          isGameLogOpen={isGameLogOpen}
          isModernInventoryOpen={isModernInventoryOpen}
          isDiagnoseOpen={isDiagnoseOpen}
          isBuyOpen={isBuyOpen}
          isOfferOpen={modals.offer}
          isLedgerOpen={isLedgerOpen}
          isFastTravelOpen={isFastTravelOpen}
          isBloodlettingOpen={isBloodlettingOpen}
          isPatientRosterOpen={isPatientRosterOpen}

          // Modal data
          offerRecipient={offerRecipient}
          simplePrescribeRecipient={simplePrescribeRecipient}
          tradeMode={tradeMode}
          tradingNPC={tradingNPC}
          inventoryViewMode={inventoryViewMode}
          preselectedTradeTab={preselectedTradeTab}
          selectedPatient={selectedPatient}
          selectedNPC={selectedNPC}
          selectedItem={selectedItem}
          selectedPOIEntity={selectedPOIEntity}
          selectedPDF={selectedPDF}
          selectedCitation={selectedCitation}
          journal={journal}
          customJournalEntry={customJournalEntry}
          gameState={gameState}
          currentPatient={currentPatient}
          conversationHistory={conversationHistory}
          turnNumber={turnNumber}
          currentWealth={gameState.wealth}
          gameAssessment={gameAssessment}
          currentPrescriptionType={currentPrescriptionType}
          energy={gameState.energy}
          health={gameState.health}
          isPrescribing={isPrescribing}
          reputation={reputation}
          playerSkills={playerSkills}
          skillEffects={skillEffects}
          transactionManager={transactionManager}
          TRANSACTION_CATEGORIES={TRANSACTION_CATEGORIES}
          playerPosition={playerPosition}
          currentMapId={currentMapId}

          // Toggle/close handlers
          toggleMixingPopup={toggleMixingPopup}
          setIsPrescribePopupOpen={setIsPrescribePopupOpen}
          setIsSimplePrescribeOpen={(value) => value ? openModal('simplePrescribe') : closeModal('simplePrescribe')}
          setIsSleepOpen={setIsSleepOpen}
          setIsRestDurationOpen={setIsRestDurationOpen}
          sleepHours={sleepHours}
          setSleepHours={setSleepHours}
          toggleMap={toggleMap}
          setIsInteractiveMapModalOpen={setIsInteractiveMapModalOpen}
          toggleInventory={toggleInventory}
          toggleJournal={toggleJournal}
          toggleAbout={toggleAbout}
          setShowPatientModal={setShowPatientModal}
          setSelectedPatient={setSelectedPatient}
          setShowNPCModal={setShowNPCModal}
          setSelectedNPC={setSelectedNPC}
          setShowItemModal={setShowItemModal}
          setSelectedItem={setSelectedItem}
          setShowEquipmentModal={setShowEquipmentModal}
          setShowReputationModal={setShowReputationModal}
          setShowSkillsModal={setShowSkillsModal}
          setDetailSkillId={setDetailSkillId}
          setShowPOIModal={setShowPOIModal}
          setSelectedPOIEntity={setSelectedPOIEntity}
          setIsSettingsOpen={setIsSettingsOpen}
          setIsHelpOpen={setIsHelpOpen}
          closePdfPopup={closePdfPopup}
          setShowEndGamePopup={setShowEndGamePopup}
          setIsEatOpen={setIsEatOpen}
          setIsForageOpen={setIsForageOpen}
          setIsGameLogOpen={setIsGameLogOpen}
          setIsModernInventoryOpen={setIsModernInventoryOpen}
          toggleDiagnose={toggleDiagnose}
          setIsBuyOpen={setIsBuyOpen}
          setIsOfferOpen={(value) => value ? openModal('offer') : closeModal('offer')}
          setIsLedgerOpen={setIsLedgerOpen}
          setIsFastTravelOpen={setIsFastTravelOpen}
          setIsBloodlettingOpen={setIsBloodlettingOpen}
          setIsPatientRosterOpen={setIsPatientRosterOpen}

          // Callbacks and state setters
          addJournalEntry={addJournalEntry}
          addCompoundToInventory={addCompoundToInventory}
          updateInventory={updateInventory}
          advanceTime={advanceTime}
          handleJournalEntrySubmit={handleJournalEntrySubmit}
          setCustomJournalEntry={setCustomJournalEntry}
          handlePDFClick={handlePDFClick}
          refreshInventory={refreshInventory}
          setHistoryOutput={setHistoryOutput}
          setConversationHistory={setConversationHistory}
          setTurnNumber={setTurnNumber}
          setIsLoading={setIsLoading}
          handleEat={handleEat}
          handleForageComplete={handleForageComplete}
          applyResourceChanges={applyResourceChanges}
          setCurrentPatient={setCurrentPatient}
          setCurrentPrescriptionType={setCurrentPrescriptionType}
          setIsPrescribing={setIsPrescribing}
          setIsInventoryOpen={setIsInventoryOpen}
          setNPCPosition={setNPCPosition}
          setCurrentMapId={setCurrentMapId}
          npcPositions={npcPositions}
          recentNPCs={filteredNPCPositions}
          handleWealthChange={handleWealthChange}
          historyOutput={historyOutput}
          awardXP={awardXP}
          awardSkillXP={awardSkillXP}
          learnNewSkill={learnNewSkill}
          improveSkill={improveSkill}

          // Portrait and scenario
          portraitImage={mariaPortraitUrl}
          scenarioId={scenarioId}
          primaryPortraitFile={primaryPortraitFile}

          // Tab control (for dev panel)
          setActiveTab={setActiveTab}
          setActivePatient={setActivePatient}
          setPatientDialogue={setPatientDialogue}
          setGameState={setGameState}

          // Furniture click handler for map POI
          handleFurnitureClick={handleFurnitureClick}

          // Prescription outcome handlers
          onPrescriptionPending={handlePrescriptionPending}

          // Weather background toggle
          weatherBackgroundEnabled={weatherBackgroundEnabled}
          setWeatherBackgroundEnabled={setWeatherBackgroundEnabled}
        />

        {/* Level Up Notification */}
        {levelUpData && (
          <LevelUpNotification
            isVisible={showLevelUpNotification}
            newLevel={levelUpData.newLevel}
            newTitle={levelUpData.newTitle}
            healthGain={levelUpData.healthGain}
            energyGain={levelUpData.energyGain}
            skillPointGain={levelUpData.skillPointGain}
            onClose={() => setShowLevelUpNotification(false)}
          />
        )}

        {/* Ability Unlock Notification */}
        {abilityUnlockData && (
          <AbilityUnlockNotification
            isVisible={showAbilityUnlockNotification}
            abilityName={abilityUnlockData.abilityName}
            abilityDescription={abilityUnlockData.abilityDescription}
            level={abilityUnlockData.level}
            professionIcon={abilityUnlockData.professionIcon}
            professionColor={abilityUnlockData.professionColor}
            onClose={() => setShowAbilityUnlockNotification(false)}
          />
        )}

        {/* Profession Choice Modal */}
        <ProfessionChoiceModal
          isOpen={showProfessionChoiceModal}
          playerSkills={playerSkills}
          onChoose={(professionId) => {
            try {
              console.log('[GamePage] Profession chosen:', professionId);
              console.log('[GamePage] Player level:', playerSkills.level);
              console.log('[GamePage] Calling chooseProfession...');

              chooseProfession(professionId, playerSkills.level);

              console.log('[GamePage] chooseProfession completed, closing modal');
              setShowProfessionChoiceModal(false);

              // Show success message
              toast.success(`You are now a ${getProfessionName(professionId)}!`, { duration: 5000 });
            } catch (error) {
              console.error('[GamePage] Error choosing profession:', error);
              toast.error(`Failed to choose profession: ${error.message}`, { duration: 5000 });
            }
          }}
          canClose={false}
        />

        {/* Item Action Popup - for drag-drop interactions */}
        <ItemActionPopup
          isOpen={itemActionPopup.isOpen}
          onClose={() => setItemActionPopup({ isOpen: false, item: null, npc: null })}
          item={itemActionPopup.item}
          npc={itemActionPopup.npc}
          onSelectAction={handleItemAction}
        />

        {/* Contract Offer Modal - for treatment and sale contracts */}
        <ContractOfferModal
          offer={pendingContract}
          isOpen={isContractModalOpen}
          onClose={() => setIsContractModalOpen(false)}
          onAcceptTreatment={handleAcceptTreatment}
          onAcceptSale={handleAcceptSale}
          onDecline={handleDeclineContract}
          inventory={gameState.inventory}
          theme={narrationDarkMode ? 'dark' : 'light'}
          conversationHistory={conversationHistory}
        />

        {/* Long-distance travel modal */}
        {longDistanceCard && (
          <LongDistanceTravelModal
            isOpen={!!longDistanceCard}
            origin={longDistanceCard.origin}
            options={longDistanceCard.options}
            onSubmit={handleLongDistanceTravelSubmit}
            onClose={closeLongDistanceCard}
            trigger={longDistanceCard.trigger}
            currentDate={gameState.date}
            currentTime={gameState.time}
            worldMapData={scenario?.maps?.exterior?.['world-map'] || null}
          />
        )}

        {/* Phase 3B: Travel Card - displayed when traveling to house call */}
        {pendingHouseCall && (
          <TravelCard
            houseCallData={pendingHouseCall}
            gameTime={gameState.time}
            onArrival={handleHouseCallArrival}
            onTravelUpdate={handleTravelUpdate}
            onCancel={handleCancelTravel}
          />
        )}

        {/* Purchase Offer Card - displayed when vendor offers goods for sale */}
        {pendingPurchaseOffer && pendingPurchaseOffer.type === 'buy' && (
          <PurchaseOfferCard
            offer={pendingPurchaseOffer}
            onViewItems={handleViewPurchaseItems}
            onDecline={handleDeclinePurchaseOffer}
          />
        )}

        {/* Item Consumption Modal - for consuming items by dragging to player portrait */}
        <ItemConsumptionModal
          isOpen={isConsumptionModalOpen}
          itemName={itemToConsume?.name || ''}
          onConfirm={handleConfirmConsumption}
          onCancel={handleCancelConsumption}
        />

        {/* Game Over Modal - displayed when health reaches 0 */}
        <GameOverModal
          isOpen={isGameOver}
          causeOfDeath={causeOfDeath}
          onRestart={handleRestartGame}
          onMainMenu={handleMainMenu}
        />

        {/* Document Modal - auto-opens when letters/codices/documents are received */}
        <ReadableTextModal
          isOpen={isDocumentModalOpen}
          onClose={() => {
            setIsDocumentModalOpen(false);
            setPendingDocument(null);
          }}
          item={pendingDocument}
          theme={narrationDarkMode ? 'dark' : 'light'}
          narrativeContext={historyOutput}
          textCache={textCacheRef.current} // Persistent cache prevents re-generating same documents
          onMarkAsRead={markDocumentAsRead}
        />

        {/* Prescription Outcome Modal - shows detailed prescription results with LLM narrative */}
        <PrescriptionOutcomeModal
          isOpen={showPrescriptionOutcomeModal}
          patient={pendingPrescription?.patient}
          prescriptionData={pendingPrescription ? {
            remedy: pendingPrescription.item?.name,
            drachms: pendingPrescription.amount,
            route: pendingPrescription.route,
            payment: pendingPrescription.price
          } : null}
          outcome={pendingPrescription?.outcome}
          onContinue={() => {
            setShowPrescriptionOutcomeModal(false);
            setPendingPrescription(null); // Clear the prescription card
          }}
        />

        {/* Save/Load Modal - manage save slots */}
        <SaveLoadModal
          isOpen={isSaveLoadModalOpen}
          onClose={() => setIsSaveLoadModalOpen(false)}
          onLoadSave={handleLoadSave}
          gameState={gameState}
          playerSkills={playerSkills}
          conversationHistory={conversationHistory}
          reputation={reputation}
          npcRelationships={{}}
        />

        {/* Opening animation CSS */}
        <style jsx="true">{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInFromLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInFromRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>

      </DndProvider>
  );
};

/**
 * GamePageWithProvider - Intermediate component to extract scenarioId from URL
 * before passing it to providers
 */
function GamePageWithProvider() {
  const { scenarioId } = useParams();

  // Load scenario character data for PlayerProvider
  const scenario = scenarioLoader.getScenario(scenarioId || '1680-mexico-city');
  const characterData = scenario?.character;

  // Check if there's a pending load save in sessionStorage
  const pendingLoadSaveJSON = sessionStorage.getItem('pendingLoadSave');
  let loadedSaveData = null;

  if (pendingLoadSaveJSON) {
    try {
      loadedSaveData = JSON.parse(pendingLoadSaveJSON);
      console.log('[GamePage] Loading from sessionStorage:', loadedSaveData.metadata);

      // Clear the pending load save
      sessionStorage.removeItem('pendingLoadSave');
    } catch (error) {
      console.error('[GamePage] Error parsing pendingLoadSave:', error);
      sessionStorage.removeItem('pendingLoadSave');
    }
  }

  return (
    <GameStateProvider scenarioId={scenarioId || '1680-mexico-city'} loadedSaveData={loadedSaveData}>
      <ModalProvider>
        <PlayerProvider characterData={characterData}>
          <NPCProvider>
            <GameContent />
          </NPCProvider>
        </PlayerProvider>
      </ModalProvider>
    </GameStateProvider>
  );
}

/**
 * GamePage - Main export with all necessary providers
 * PHASE 1.1: Added GameStateProvider to eliminate prop drilling
 * PHASE 1.2: Added ModalProvider to manage all modal states
 * PHASE 1.3: Added PlayerProvider to manage player state and skills
 * PHASE 1.4: Added NPCProvider to manage NPC tracking and entity state
 */
export default function GamePage() {
  return (
    <ToastProvider>
      <MobileLayoutProvider>
        <GamePageWithProvider />
      </MobileLayoutProvider>
    </ToastProvider>
  );
}
