// GamePage.jsx
// Main game page component

import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy} from 'react';
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
import ItemActionPopup from '../components/ItemActionPopup';
import LevelUpNotification from '../components/LevelUpNotification';
import ProfessionChoiceModal from '../components/ProfessionChoiceModal';
import AbilityUnlockNotification from '../components/AbilityUnlockNotification';
import ContractOfferModal from '../components/ContractOfferModal';
import ItemConsumptionModal from '../components/ItemConsumptionModal';
import GameOverModal from '../components/GameOverModal';
import SimpleInteractionCard from '../components/SimpleInteractionCard';

// Feature components
import { useGameState } from '../core/state/gameState';
import { useReputation } from '../core/hooks/useReputation';
import { useSkills } from '../core/hooks/useSkills';

// Game systems
import resourceManager from '../systems/ResourceManager';
import { scenarioLoader } from '../core/services/scenarioLoader';
import { getTransactionManager, TRANSACTION_CATEGORIES } from '../core/systems/transactionManager';
import { getAllAbilitiesForProfession, getXPMultiplier, getSkillXPMultiplier } from '../core/systems/professionAbilities';
import { getProfessionIcon, getProfessionName, getPlayerTitle } from '../core/systems/levelingSystem';

// Modularized components
import { useGameHandlers } from './hooks/useGameHandlers';
import { GameModals } from './components/GameModals';



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
import { getMariaPortrait, getDeterminedPortrait, getPortraitFromStatus } from '../utils/portraitSelector';

const PDFPopup = lazy(() => import('../shared/components/PDFPopup'));

const GameContent = () => {
  const toast = useToast();
  const { scenarioId } = useParams(); // Get scenarioId from URL

  // Load scenario character data for skills initialization
  const scenario = scenarioLoader.getScenario(scenarioId || '1680-mexico-city');
  const characterData = scenario?.character;

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
  } = useGameState(scenarioId || '1680-mexico-city');

  // Core state
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [historyOutput, setHistoryOutput] = useState('');
  const [currentEntities, setCurrentEntities] = useState([]); // Entities from latest turn for historical context
  const [isLoading, setIsLoading] = useState(false);
  const [turnNumber, setTurnNumber] = useState(1);
  const [npcTracker] = useState(() => new NPCTracker(5)); // Track last 5 NPCs

  // Transaction Manager
  const [transactionManager] = useState(() => getTransactionManager(scenarioId || '1680-mexico-city'));

  // Player position and map tracking
  // Grid (25, 24) = pixel center (510, 480) with 20px grid size - behind counter (north side)
  const [playerPosition, setPlayerPosition] = useState({ x: 510, y: 480, gridX: 25, gridY: 24 }); // Default: behind counter on shop floor
  const [playerFacing, setPlayerFacing] = useState(180); // Degrees: 0=North, 90=East, 180=South, 270=West (start facing south)
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

  // DISABLED: Auto-reset position on location change
  // This was causing conflicts with manual position management from exit/enter commands
  // Position is now managed exclusively by exit/enter handlers in useGameHandlers.js
  /*
  const [previousLocation, setPreviousLocation] = React.useState(gameState.location);

  useEffect(() => {
    const location = gameState.location;

    // Only reset position if location actually changed (not just re-rendering)
    if (location !== previousLocation) {
      console.log('[GamePage] Location changed from', previousLocation, 'to', location);

      // If location is "Botica de la Amargura, Mexico City" (exterior map view)
      if (location && location.includes('Botica') && location.includes('Mexico City')) {
        // Set position to botica building center on exterior map
        console.log('[GamePage] Switching to exterior map position');
        setPlayerPosition({ x: 1350, y: 917, gridX: 0, gridY: 0 });
        setCurrentMapId('mexico-city-center');
      }
      // For interior locations, use interior starting position
      else if (location && location.includes('Botica') && !location.includes('Mexico City')) {
        console.log('[GamePage] Switching to interior map position');
        // Grid (25, 24) = pixel center (510, 480) - behind counter (north side)
        setPlayerPosition({ x: 510, y: 480, gridX: 25, gridY: 24 });
        setCurrentMapId('botica-interior');
      }

      setPreviousLocation(location);
    }
  }, [gameState.location, previousLocation]);
  */

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
    if (!currentMapData || !playerPosition) {
      console.log('[GamePage] nearbyLocations empty: missing map data or position', {
        hasMapData: !!currentMapData,
        hasPosition: !!playerPosition
      });
      return [];
    }

    try {
      const gridSystem = getGridSystem(currentMapId, currentMapData);
      const nearby = gridSystem.getNearbyLocations(playerPosition, 5);

      // Return top 5 closest
      const top5 = nearby.slice(0, 5);
      console.log('[GamePage] Calculated nearby locations:', top5);
      return top5;
    } catch (error) {
      console.error('[GamePage] Error getting nearby locations:', error);
      return [];
    }
  }, [currentMapData, playerPosition, currentMapId]);

  // UI state
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isModernInventoryOpen, setIsModernInventoryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isInteractiveMapModalOpen, setIsInteractiveMapModalOpen] = useState(false);
  const [isDiagnoseOpen, setIsDiagnoseOpen] = useState(false);
  const [leftSidebarTab, setLeftSidebarTab] = useState('inventory'); // Control left sidebar tab
  const [isCharacterCardCollapsed, setIsCharacterCardCollapsed] = useState(false); // Track CharacterCard collapse state for condensed header stats

  const [isGameLogOpen, setIsGameLogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('character');

  // Central Panel state
  const [activeTab, setActiveTab] = useState('chronicle');
  const [gameLog, setGameLog] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [patientDialogue, setPatientDialogue] = useState([]);
  const [pendingPrescription, setPendingPrescription] = useState(null);

  // Contract system state
  const [pendingContract, setPendingContract] = useState(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  // Exit confirmation state
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [pendingExitData, setPendingExitData] = useState(null);

  // Trade system state
  const [tradingNPC, setTradingNPC] = useState(null); // Current NPC being traded with
  const [tradeMode, setTradeMode] = useState('market'); // 'market' | 'npc' | 'inventory'
  const [inventoryViewMode, setInventoryViewMode] = useState('shelf'); // 'shelf' | 'list'

  // Simple interaction system state
  const [pendingSimpleInteraction, setPendingSimpleInteraction] = useState(null);

  // Item consumption modal state
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [itemToConsume, setItemToConsume] = useState(null);

  // Game over state
  const [isGameOver, setIsGameOver] = useState(false);
  const [causeOfDeath, setCauseOfDeath] = useState('');

  // PHASE 1: Primary portrait file (LLM-selected portrait)
  const [primaryPortraitFile, setPrimaryPortraitFile] = useState(null);

  // Dynamic action chips from narrative parser
  const [dynamicChips, setDynamicChips] = useState(null);

  // Narration settings state
  const [narrationFontSize, setNarrationFontSize] = useState('text-base');
  const [narrationDarkMode, setNarrationDarkMode] = useState(false);
  const [isNarrationSettingsOpen, setIsNarrationSettingsOpen] = useState(false);
  const [isLLMViewOpen, setIsLLMViewOpen] = useState(false);

  // Portrait state: temporary "determined" override (shows for 5 seconds after XP gain)
  const [showDeterminedPortrait, setShowDeterminedPortrait] = useState(false);
  const determinedTimerRef = React.useRef(null);

  // Reputation system
  const { reputation, updateReputation, reputationEmoji, setReputation: setReputationDirect } = useReputation();

  // Skills system (pass character data for proper initialization)
  const {
    playerSkills,
    activeEffects: skillEffects,
    awardXP: rawAwardXP,
    awardSkillXP: rawAwardSkillXP,
    learnNewSkill,
    improveSkill,
    resetSkills
  } = useSkills(characterData, null); // No callback needed - character XP is managed by playerSkills now

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

  // Active effects (not core stats - this is for temporary buffs/debuffs)
  const [activeEffects, setActiveEffects] = useState([]);
  const [consecutiveLowEnergyTurns, setConsecutiveLowEnergyTurns] = useState(0);

  // XP gain notification state
  const [xpGain, setXPGain] = useState(null);
  const [xpGainKey, setXPGainKey] = useState(0); // Force re-render for animations

  // Popups and modals
  const [showMixingPopup, setShowMixingPopup] = useState(false);
  const [showSymptomsPopup, setShowSymptomsPopup] = useState(false);
  const [isPrescribePopupOpen, setIsPrescribePopupOpen] = useState(false);
  const [isPrescribing, setIsPrescribing] = useState(false);
  const [currentPrescriptionType, setCurrentPrescriptionType] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [selectedNpcName, setSelectedNpcName] = useState('');
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isSleepOpen, setIsSleepOpen] = useState(false);
  const [isRestDurationOpen, setIsRestDurationOpen] = useState(false);
  const [sleepHours, setSleepHours] = useState(8);
  const [isEatOpen, setIsEatOpen] = useState(false);
  const [isForageOpen, setIsForageOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [selectedCitation, setSelectedCitation] = useState(null);

  // Study Tab - Discovered Books
  const [discoveredBooks, setDiscoveredBooks] = useState(() => {
    const saved = localStorage.getItem(`apothecary_discovered_books_${scenarioId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [showEndGamePopup, setShowEndGamePopup] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameAssessment, setGameAssessment] = useState('');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showNPCModal, setShowNPCModal] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showReputationModal, setShowReputationModal] = useState(false);
  const [reputationModalFaction, setReputationModalFaction] = useState(null);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isFastTravelOpen, setIsFastTravelOpen] = useState(false);
  const [isBloodlettingOpen, setIsBloodlettingOpen] = useState(false);
  const [isPatientRosterOpen, setIsPatientRosterOpen] = useState(false);

  // Leveling system modals
  const [showLevelUpNotification, setShowLevelUpNotification] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [showProfessionChoiceModal, setShowProfessionChoiceModal] = useState(false);
  const [showAbilityUnlockNotification, setShowAbilityUnlockNotification] = useState(false);
  const [abilityUnlockData, setAbilityUnlockData] = useState(null);

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
  useEffect(() => {
    if (transactionManager && scenarioId) {
      transactionManager.saveToStorage(scenarioId);
    }
  }, [gameState.wealth, transactionManager, scenarioId]);

  // Real-time clock: advance game time by 10 minutes every real-world minute
  useEffect(() => {
    const clockInterval = setInterval(() => {
      advanceTime({ minutes: 10 });
      console.log('[Real-Time Clock] Advanced game time by 10 minutes');
    }, 60000); // 60,000 ms = 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(clockInterval);
  }, [advanceTime]);

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

      // Check if reached level 5 and no profession chosen
      if (playerSkills.level === 5 && !gameState.chosenProfession) {
        // Show profession choice modal after level-up notification closes
        setTimeout(() => {
          setShowProfessionChoiceModal(true);
        }, 6000); // Wait for level-up notification to auto-dismiss
      }

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
    setIncorporatedContent,
    setShowIncorporatePopup,
    setIsJournalOpen,
    setIsInventoryOpen,
    setIsHistoryOpen,
    setIsAboutOpen,
    setIsMapOpen,
    setIsDiagnoseOpen,
    setShowMixingPopup,
    setSelectedPDF,
    setSelectedCitation,
    setIsPdfOpen,
    setSelectedPatient,
    setShowPatientModal,
    setSelectedNPC,
    setShowNPCModal,
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
    setIsContractModalOpen,
    setPendingExitData, // Exit confirmation system
    setShowExitConfirmation, // Exit confirmation system
    setTradingNPC, // Trade system
    setTradeMode, // Trade system
    setPendingSimpleInteraction, // Simple interaction system
    setPrimaryPortraitFile, // PHASE 1: For LLM-selected portraits
    setDynamicChips, // Dynamic action chips from narrative parsing
    setGameState, // For updating gameState (e.g., status from StateAgent)

    // State values
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
    patientDialogue,
    playerSkills,
    journal,

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

    // Leveling system
    awardXP,
    awardSkillXP,
  });

  // Destructure handlers for easy use
  const {
    handleWealthChange,

    handleReputationChange,
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
    handleMovement,
    handleEnterBuilding,
    handleExitBuilding,
  } = handlers;

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

      // A/D keys for rotation (only in interior maps)
      if ((e.key === 'a' || e.key === 'A') && currentMapId === 'botica-interior') {
        e.preventDefault();
        setPlayerFacing(prev => (prev - 90 + 360) % 360); // Rotate left
        return;
      }
      if ((e.key === 'd' || e.key === 'D') && currentMapId === 'botica-interior') {
        e.preventDefault();
        setPlayerFacing(prev => (prev + 90) % 360); // Rotate right
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
  }, [handleMovement, currentMapId]);

  // Study Tab - Detect books when narrative changes
  React.useEffect(() => {
    if (historyOutput && historyOutput.length > 0) {
      detectNewBooks(historyOutput);
    }
  }, [historyOutput]);

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

    // Execute the exit
    updateLocation(pendingExitData.location);
    setCurrentMapId(pendingExitData.mapId);
    setPlayerPosition(pendingExitData.position);

    // Show exit message
    setHistoryOutput(pendingExitData.exitMessage);
    addToHistory({ role: 'assistant', content: pendingExitData.exitMessage });
    setUserActions(prev => [...prev, 'leave']);

    // Clear state
    setShowExitConfirmation(false);
    setPendingExitData(null);
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
  const recentNPCs = npcTracker.getRecentNPCs();

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

  return (
      <DndProvider backend={HTML5Backend}>
        <div className={`h-screen flex flex-col overflow-hidden bg-gradient-to-br from-parchment-100 via-parchment-50/50 to-parchment-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 ${narrationDarkMode ? 'dark' : ''}`}>


        {/* Header */}
        <Header
          location={gameState.location}
          time={gameState.time}
          date={gameState.date}
          onSaveGame={handleSaveGame}
          onSettings={() => setIsSettingsOpen(true)}
          showCondensedStats={isCharacterCardCollapsed}
          health={gameState.health}
          energy={gameState.energy}
          wealth={gameState.wealth}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className={`h-full max-w-screen-2xl mx-auto px-4 py-4 flex gap-6 transition-all duration-500 ease-in-out ${
            activeTab === 'patient' ? 'gap-6' : 'gap-6'
          }`}>

            {/* Left Sidebar - Character Card & Status Panel */}
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
              onOpenFullInventory={handleOpenFullInventory}
              onItemDropOnPlayer={handleItemDropOnPlayer}
              statusPanelTab={leftSidebarTab}
              onStatusPanelTabChange={setLeftSidebarTab}
              xpGain={xpGain}
              xpGainKey={xpGainKey}
              onCharacterCardCollapseChange={setIsCharacterCardCollapsed}
            />

            {/* Center - Central Panel (Tabbed Interface) */}
            <main className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-500 ease-in-out ${
              activeTab === 'patient' ? 'mr-0' : ''
            }`}>
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
                onCancelExit={() => setShowExitConfirmation(false)}
                // Trade props
                tradeOpportunities={gameState.tradeOpportunities || []}
                onAcceptTrade={handleAcceptTrade}
                onDeclineTrade={handleDeclineTrade}
                // Simple interaction props
                pendingSimpleInteraction={pendingSimpleInteraction}
                onSimpleInteractionChoice={handleSimpleInteractionChoice}
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
                  />
                </div>
              )}
            </main>

            {/* Right Sidebar - Context - Slides out when Patient View is active */}
            <div className={`transition-all duration-500 ease-in-out ${
              activeTab === 'patient'
                ? 'w-0 opacity-0 translate-x-full overflow-hidden pointer-events-none'
                : 'w-[356px] lg:w-[356px] xl:w-[370px] opacity-100 translate-x-0'
            }`}>
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
                playerPosition={playerPosition} // Pass player position to map
                playerFacing={playerFacing} // Pass player facing direction for interior map
                currentMapId={currentMapId} // Pass current map ID to control which map is rendered
                shopSignHung={gameState.shopSign?.hung || false} // Pass shop sign status
                setIsLedgerOpen={setIsLedgerOpen} // Open Ledger Modal when Accounts button clicked
                toggleShopSign={toggleShopSign} // Direct shop sign control
                toast={toast} // For notifications
                entities={currentEntities} // Entities for Wikipedia context panel
                discoveredBooks={discoveredBooks} // Books discovered during gameplay
                onBookClick={handleBookClick} // Handle book clicks in Study tab
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
              />
            </div>

          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeTab={mobileTab}
          onTabChange={setMobileTab}
          onCharacterClick={() => console.log('Character clicked')}
          onInventoryClick={toggleInventory}
          onJournalClick={toggleJournal}
          onMapClick={toggleMap}
        />



        {/* All game modals managed by GameModals component */}
        <GameModals
          // Modal states
          showMixingPopup={showMixingPopup}
          isPrescribePopupOpen={isPrescribePopupOpen}
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
          isSettingsOpen={isSettingsOpen}
          isPdfOpen={isPdfOpen}
          showEndGamePopup={showEndGamePopup}
          isEatOpen={isEatOpen}
          isForageOpen={isForageOpen}
          isGameLogOpen={isGameLogOpen}
          isModernInventoryOpen={isModernInventoryOpen}
          isDiagnoseOpen={isDiagnoseOpen}
          isBuyOpen={isBuyOpen}
          isLedgerOpen={isLedgerOpen}
          isFastTravelOpen={isFastTravelOpen}
          isBloodlettingOpen={isBloodlettingOpen}
          isPatientRosterOpen={isPatientRosterOpen}

          // Modal data
          tradeMode={tradeMode}
          tradingNPC={tradingNPC}
          inventoryViewMode={inventoryViewMode}
          selectedPatient={selectedPatient}
          selectedNPC={selectedNPC}
          selectedItem={selectedItem}
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
          setIsSettingsOpen={setIsSettingsOpen}
          closePdfPopup={closePdfPopup}
          setShowEndGamePopup={setShowEndGamePopup}
          setIsEatOpen={setIsEatOpen}
          setIsForageOpen={setIsForageOpen}
          setIsGameLogOpen={setIsGameLogOpen}
          setIsModernInventoryOpen={setIsModernInventoryOpen}
          toggleDiagnose={toggleDiagnose}
          setIsBuyOpen={setIsBuyOpen}
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
        />

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

        </div>
      </DndProvider>
  );
};

export default function GamePage() {
  return (
    <ToastProvider>
      <GameContent />
    </ToastProvider>
  );
}
