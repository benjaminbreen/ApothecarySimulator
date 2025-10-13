// GamePage.jsx
// Main game page component

import React, { useState, useEffect, useCallback, Suspense, lazy} from 'react';
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

// Feature components
import { useGameState } from '../core/state/gameState';
import { useReputation } from '../core/hooks/useReputation';
import { useSkills } from '../core/hooks/useSkills';

// Game systems
import resourceManager from '../systems/ResourceManager';
import { scenarioLoader } from '../core/services/scenarioLoader';
import { getTransactionManager, TRANSACTION_CATEGORIES } from '../core/systems/transactionManager';
import { getAllAbilitiesForProfession, getXPMultiplier, getSkillXPMultiplier } from '../core/systems/professionAbilities';
import { getProfessionIcon } from '../core/systems/levelingSystem';

// Modularized components
import { useGameHandlers } from './hooks/useGameHandlers';
import { GameModals } from './components/GameModals';



import { generateJournalEntry } from '../journalAgent';
import imageMap from '../imageMap';

import { createChatCompletion } from '../core/services/llmService';
import { buildSystemPrompt, buildContextSummary, buildEntityContext } from '../prompts/promptModules';
import { orchestrateTurn } from '../core/agents/AgentOrchestrator';
import { NPCTracker } from '../core/agents/EntityAgent';
import { entityManager } from '../core/entities/EntityManager';
import { useNPCPositions } from '../features/map/hooks/useNPCPositions';
import EntityList from '../EntityList';

// Maria portrait images
import mariaDetermined from '../assets/mariadetermined.jpg';
import mariaHappy from '../assets/mariahappy.jpg';
import mariaNormal from '../assets/marianormal.jpg';
import mariaSad from '../assets/mariasad.jpg';
import mariaWorried from '../assets/mariaworried.jpg';
import mariaCurious from '../assets/mariacurious.jpg';

const PDFPopup = lazy(() => import('../shared/components/PDFPopup'));

// Status to image mapping for Maria
const statusMappings = {
  normal: ['rested', 'calm', 'neutral', 'normal', 'composed', 'serene'],
  happy: ['content', 'happy', 'joyful', 'pleased', 'satisfied', 'elated', 'cheerful', 'delighted'],
  worried: ['worried', 'frightened', 'anxious', 'nervous', 'concerned', 'troubled', 'uneasy', 'weary', 'uncertain'],
  sad: ['sad', 'melancholy', 'depressed', 'downcast', 'gloomy', 'forlorn', 'terrified', 'desperate'],
  determined: ['determined', 'resolute', 'focused', 'steadfast', 'resolved', 'unwavering'],
  curious: ['curious', 'inquisitive', 'interested', 'intrigued', 'exploratory', 'questioning', 'fascinated', 'perceptive', 'reckless'],
};

const getStatusImage = (status) => {
  const lowerStatus = status.toLowerCase();
  if (statusMappings.normal.includes(lowerStatus)) return mariaNormal;
  if (statusMappings.happy.includes(lowerStatus)) return mariaHappy;
  if (statusMappings.worried.includes(lowerStatus)) return mariaWorried;
  if (statusMappings.sad.includes(lowerStatus)) return mariaSad;
  if (statusMappings.determined.includes(lowerStatus)) return mariaDetermined;
  if (statusMappings.curious.includes(lowerStatus)) return mariaCurious;
  return mariaNormal;
};

const GameContent = () => {
  const toast = useToast();
  const { scenarioId } = useParams(); // Get scenarioId from URL

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
  const [playerPosition, setPlayerPosition] = useState({ x: 500, y: 620, gridX: 25, gridY: 31 }); // Default: inside shop floor near entrance
  const [currentMapData, setCurrentMapData] = useState(null);
  const [currentMapId, setCurrentMapId] = useState('botica-de-la-amargura');

  // NPC position tracking (real-time updates every 100ms)
  const {
    npcPositions,
    setNPCPosition,
    moveNPC,
    initializeNPCs,
    refresh: refreshNPCPositions
  } = useNPCPositions({ mapId: currentMapId, updateInterval: 100 });

  // UI state
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isModernInventoryOpen, setIsModernInventoryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isInteractiveMapModalOpen, setIsInteractiveMapModalOpen] = useState(false);
  const [isDiagnoseOpen, setIsDiagnoseOpen] = useState(false);
  const [leftSidebarTab, setLeftSidebarTab] = useState('reputation'); // Control left sidebar tab

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

  // Narration settings state
  const [narrationFontSize, setNarrationFontSize] = useState('text-base');
  const [narrationDarkMode, setNarrationDarkMode] = useState(false);
  const [isNarrationSettingsOpen, setIsNarrationSettingsOpen] = useState(false);
  const [isLLMViewOpen, setIsLLMViewOpen] = useState(false);

  // Character status
  const [mariaStatus, setMariaStatus] = useState('rested');

  // Reputation system
  const { reputation, updateReputation, reputationEmoji, setReputation: setReputationDirect } = useReputation();

  // Skills system
  const {
    playerSkills,
    activeEffects: skillEffects,
    awardXP: rawAwardXP,
    awardSkillXP: rawAwardSkillXP,
    learnNewSkill,
    improveSkill,
    resetSkills
  } = useSkills((skillId) => {
    // Award character XP when skills level up
    if (typeof gameState.awardXP === 'function') {
      gameState.awardXP(10, `skill_levelup_${skillId}`, playerSkills);
      console.log(`[Character XP] Awarded 10 XP for leveling up skill: ${skillId}`);
    }
  });

  // Wrap XP award functions to apply Scholar profession bonuses
  const awardXP = useCallback((xp, source = 'unknown') => {
    const multiplier = getXPMultiplier(gameState.chosenProfession, gameState.playerLevel);
    const adjustedXP = Math.floor(xp * multiplier);

    if (multiplier > 1.0) {
      console.log(`[Scholar] XP bonus applied: ${xp} → ${adjustedXP} (+${Math.round((multiplier - 1) * 100)}%)`);
    }

    rawAwardXP(adjustedXP, source);
  }, [rawAwardXP, gameState.chosenProfession, gameState.playerLevel]);

  const awardSkillXP = useCallback((skillId, xp, source = 'unknown') => {
    const multiplier = getSkillXPMultiplier(gameState.chosenProfession, gameState.playerLevel);
    const adjustedXP = Math.floor(xp * multiplier);

    if (multiplier > 1.0) {
      console.log(`[Scholar] Skill XP bonus applied: ${xp} → ${adjustedXP} (+${Math.round((multiplier - 1) * 100)}%)`);
    }

    rawAwardSkillXP(skillId, adjustedXP, source);
  }, [rawAwardSkillXP, gameState.chosenProfession, gameState.playerLevel]);

  // Active effects (not core stats - this is for temporary buffs/debuffs)
  const [activeEffects, setActiveEffects] = useState([]);
  const [consecutiveLowEnergyTurns, setConsecutiveLowEnergyTurns] = useState(0);

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

  // Handle level-ups and profession choice
  const prevLevelRef = React.useRef(gameState.playerLevel);
  useEffect(() => {
    if (gameState.playerLevel > prevLevelRef.current) {
      // Level up occurred!
      setLevelUpData({
        newLevel: gameState.playerLevel,
        oldLevel: prevLevelRef.current,
        newTitle: gameState.playerTitle,
        healthGain: 10,
        energyGain: 5,
        skillPointGain: 1
      });
      setShowLevelUpNotification(true);

      // Check if reached level 5 and no profession chosen
      if (gameState.playerLevel === 5 && !gameState.chosenProfession) {
        // Show profession choice modal after level-up notification closes
        setTimeout(() => {
          setShowProfessionChoiceModal(true);
        }, 6000); // Wait for level-up notification to auto-dismiss
      }

      // Check if a profession ability unlocked at this level (L10/L15/L20/L25)
      if (gameState.chosenProfession) {
        const allAbilities = getAllAbilitiesForProfession(gameState.chosenProfession);
        const unlockedAbility = allAbilities.find(a => a.level === gameState.playerLevel);

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
              level: gameState.playerLevel,
              professionIcon: getProfessionIcon(gameState.chosenProfession),
              professionColor: professionColors[gameState.chosenProfession] || '#8b5cf6'
            });
            setShowAbilityUnlockNotification(true);
          }, 7000); // Show after level-up notification closes
        }
      }
    }
    prevLevelRef.current = gameState.playerLevel;
  }, [gameState.playerLevel, gameState.playerTitle, gameState.chosenProfession]);

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
            content: 'Begin the game'
          },
          {
            role: 'assistant',
            content: scenario.initialNarrative
          }
        ]);
        setHistoryOutput(scenario.initialNarrative);
      }
    }
  }, []); // Only run once on mount

  // Get all handlers from custom hook
  const handlers = useGameHandlers({
    // State setters
    setWealth,  // Changed from setCurrentWealth - now uses gameState
    setMariaStatus,
    setReputation: setReputationDirect,
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

    // Leveling system
    awardXP: gameState.awardXP,
    awardSkillXP,
  });

  // Destructure handlers for easy use
  const {
    handleWealthChange,
    handleStatusChange,
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
  } = handlers;

  // Study Tab - Detect books when narrative changes
  React.useEffect(() => {
    if (historyOutput && historyOutput.length > 0) {
      detectNewBooks(historyOutput);
    }
  }, [historyOutput]);

  // Drag-drop handlers for portraits
  const handleItemDropOnPlayer = (item) => {
    // For now, just show info toast (could be expanded to use/consume items)
    toast.info(`Drag items onto NPCs to interact with them`);
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

  // Study Tab - Book Click Handler
  const handleBookClick = (book) => {
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

  return (
      <DndProvider backend={HTML5Backend}>
        <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-parchment-100 via-parchment-50/50 to-parchment-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">


        {/* Header */}
        <Header
          location={gameState.location}
          time={gameState.time}
          date={gameState.date}
          onSaveGame={handleSaveGame}
          onSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className={`h-full max-w-screen-2xl mx-auto px-4 py-4 flex gap-6 transition-all duration-500 ease-in-out ${
            activeTab === 'patient' ? 'gap-6' : 'gap-6'
          }`}>

            {/* Left Sidebar - Character Card & Status Panel */}
            <LeftSidebar
              wealth={gameState.wealth}
              status={mariaStatus}
              reputation={reputation}
              reputationEmoji={reputationEmoji}
              health={gameState.health}
              energy={gameState.energy}
              characterName="Maria de Lima"
              characterTitle={gameState.playerTitle || "Master Apothecary"}
              characterLevel={gameState.playerLevel || 1}
              chosenProfession={gameState.chosenProfession}
              activeEffects={activeEffects}
              playerSkills={playerSkills}
              portraitImage={getStatusImage(mariaStatus)}
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
              onItemDropOnPlayer={handleItemDropOnPlayer}
              statusPanelTab={leftSidebarTab}
              onStatusPanelTabChange={setLeftSidebarTab}
            />

            {/* Center - Central Panel (Tabbed Interface) */}
            <main className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-500 ease-in-out ${
              activeTab === 'patient' ? 'mr-0' : ''
            }`}>
              <CentralPanel
                activeTab={activeTab}
                onTabChange={handleTabChange}
                conversationHistory={conversationHistory}
                recentNPCs={npcTracker.getRecentNPCs()}
                isLoading={isLoading}
                onShowPrescribePopup={(patient) => {
                  setCurrentPatient(patient);
                  setIsPrescribePopupOpen(true);
                  setIsInventoryOpen(true);
                }}
                onShowDiagnosePopup={(patient) => {
                  setCurrentPatient(patient);
                  setIsDiagnoseOpen(true);
                }}
                gameLog={gameLog}
                activePatient={activePatient}
                patientDialogue={patientDialogue}
                onAskQuestion={handleAskQuestion}
                onEntityClick={handleEntityClick}
                playerPortrait={getStatusImage(mariaStatus)}
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
                  />
                </div>
              )}
            </main>

            {/* Right Sidebar - Context - Slides out when Patient View is active */}
            <div className={`transition-all duration-500 ease-in-out ${
              activeTab === 'patient'
                ? 'w-0 opacity-0 translate-x-full overflow-hidden pointer-events-none'
                : 'w-[356px] lg:w-[356px] xl:w-[376px] opacity-100 translate-x-0'
            }`}>
              <ContextPanel
                location={gameState.location}
                locationDetails={gameState.location}
                onActionClick={handleActionClick}
                recentNPCs={npcTracker.getRecentNPCs()}
                currentNarrative={historyOutput}
                recentNarrativeTurn={historyOutput} // Most recent narrative turn for LLM analysis
                scenario={scenarioLoader.getScenario(scenarioId || '1680-mexico-city')}
                npcs={npcPositions.filter(npc => npcTracker.getRecentNPCs().includes(npc.npcName))} // Only show NPCs mentioned in narrative
                playerPosition={playerPosition} // Pass player position to map
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
          selectedPatient={selectedPatient}
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
          mariaStatus={mariaStatus}
          reputation={reputation}
          playerSkills={playerSkills}
          skillEffects={skillEffects}
          transactionManager={transactionManager}
          TRANSACTION_CATEGORIES={TRANSACTION_CATEGORIES}

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
          recentNPCs={npcPositions.filter(npc => npcTracker.getRecentNPCs().includes(npc.npcName))}
          handleWealthChange={handleWealthChange}
          historyOutput={historyOutput}
          awardXP={awardXP}
          awardSkillXP={awardSkillXP}
          learnNewSkill={learnNewSkill}
          improveSkill={improveSkill}

          // Portrait and scenario
          getStatusImage={getStatusImage}
          scenarioId={scenarioId}

          // Tab control (for dev panel)
          setActiveTab={setActiveTab}
          setActivePatient={setActivePatient}
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
            gameState.chooseProfession(professionId);
            setShowProfessionChoiceModal(false);
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
