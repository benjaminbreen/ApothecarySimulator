import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import CollapsiblePanel from '../../components/CollapsiblePanel';
import BottomSheet from '../../components/BottomSheet';
import TouchButton from '../../components/TouchButton';
import SimpleMobileNav from '../../components/SimpleMobileNav';
import InputArea from '../../components/InputArea';
import ContextPanel from '../../components/ContextPanel';
import { LeftSidebar } from '../../components/LeftSidebar';
import { CentralPanel } from '../../components/CentralPanel';
import Header from '../../components/Header';

// Context hooks
import { useGameState } from '../../contexts/GameStateContext';
import { useModals } from '../../contexts/ModalContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { useNPCs } from '../../contexts/NPCContext';
import { useReputation } from '../../core/hooks/useReputation';
import { scenarioLoader } from '../../core/services/scenarioLoader';
import { useToast } from '../../components/ToastNotification';

/**
 * Mobile Game Layout
 *
 * Mobile-optimized layout using context-based architecture.
 * State comes from contexts where possible, with critical local state passed as props.
 *
 * Features:
 * - 4-tab bottom navigation (Story, Character, Inventory, Location)
 * - Bottom sheets for desktop components (reuses existing UI)
 * - Full-screen chronicle view
 * - Touch-optimized buttons
 *
 * @param {Object} props
 * @param {Object} props.handlers - All game handlers from useGameHandlers
 * @param {Array} props.nearbyLocations - Calculated nearby locations
 * @param {Array} props.filteredNPCPositions - Filtered NPC positions
 * @param {Object} props.dynamicChips - Dynamic action chips from narrative
 * @param {Array} props.conversationHistory - Conversation history (local state from GamePage)
 * @param {string} props.historyOutput - Current narrative output
 * @param {boolean} props.isLoading - Loading state for LLM calls
 * @param {string} props.userInput - Current user input
 * @param {Function} props.setUserInput - Setter for user input
 * @param {number} props.turnNumber - Current turn number
 * @param {string} props.activeTab - Active tab in CentralPanel
 * @param {number} props.narrationFontSize - Font size for narration
 * @param {boolean} props.narrationDarkMode - Dark mode for narration
 * @param {Array} props.gameLog - Game log entries
 * @param {Object} props.transactionManager - Transaction manager instance
 * @param {Object} props.TRANSACTION_CATEGORIES - Transaction categories
 * @param {string} props.mariaPortraitUrl - Maria's portrait URL
 * @param {string} props.currentMapId - Current map ID
 */
const MobileGameLayout = ({
  handlers,
  nearbyLocations,
  filteredNPCPositions,
  dynamicChips,
  // Local state from GamePage (not in contexts)
  conversationHistory,
  historyOutput,
  isLoading,
  userInput,
  setUserInput,
  turnNumber,
  activeTab,
  narrationFontSize,
  narrationDarkMode,
  gameLog,
  transactionManager,
  TRANSACTION_CATEGORIES,
  mariaPortraitUrl,
  currentMapId
}) => {
  const { scenarioId } = useParams();
  const toast = useToast();

  // Get state from contexts (no prop drilling!)
  const { gameState } = useGameState();
  const { modals, openModal, closeModal } = useModals();
  const {
    playerSkills,
    activeEffects,
    position: playerPosition,
    facing: playerFacing
  } = usePlayer();
  const {
    getRecentNPCs,
    currentEntities,
    activePatient,
    patientDialogue,
    currentPatient,
    primaryPortraitFile,
    pendingContract
  } = useNPCs();
  const { reputation, reputationEmoji } = useReputation();

  // Get scenario data
  const scenario = scenarioLoader.getScenario(scenarioId || '1680-mexico-city');

  // Recent NPCs from context
  const recentNPCs = getRecentNPCs();

  // Local mobile UI state
  const [activeBottomTab, setActiveBottomTab] = useState('chronicle');
  const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState(false);
  const [isInventorySheetOpen, setIsInventorySheetOpen] = useState(false);
  const [leftSidebarTab, setLeftSidebarTab] = useState('inventory');
  const [showDPad, setShowDPad] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  // Destructure handlers (functions only, not state!)
  const {
    handleSubmit,
    handleQuickAction,
    handleItemDrop,
    handleSaveGame,
    handleTabChange,
    handleActionClick,
    handlePortraitClick,
    handleItemDropOnNPC,
    handleEnterBuilding,
    handleExitBuilding,
    handleFurnitureClick,
    handleBookClick,
    handleEntityClick,
    handleShowPrescribePopup,
    handleShowDiagnosePopup,
    handleAskQuestion,
    handleConfirmExit,
    handleAcceptTrade,
    handleDeclineTrade,
    handleSimpleInteractionChoice,
    handleRandomEventChoice,
    handleItemDropOnPlayer,
    handleOpenFullInventory,
    setHistoryOutput,
    setConversationHistory,
    setTurnNumber,
    addJournalEntry,
    updateInventory,
    advanceTime,
    updateEnergy,
    updateLocation,
    toggleInventory,
    toggleShopSign,
    applyResourceChanges,
    setNarrationFontSize,
    setNarrationDarkMode,
    setPendingPrescription,
    showExitConfirmation,
    pendingExitData,
    pendingSimpleInteraction,
    pendingRandomEvent,
    pendingPrescription,
    currentPrescriptionType,
    isNarrationSettingsOpen,
    isLLMViewOpen,
    setIsNarrationSettingsOpen,
    setIsLLMViewOpen
  } = handlers;

  // Bottom nav items - 4 tabs for mobile
  const bottomNavItems = [
    { id: 'chronicle', icon: '📖', label: 'Story' },
    { id: 'character', icon: '👤', label: 'Character' },
    { id: 'inventory', icon: '🎒', label: 'Inventory' },
    { id: 'location', icon: '🏛️', label: 'Location' }
  ];

  return (
    <div className={`h-screen flex flex-col overflow-hidden bg-gradient-to-br from-parchment-100 via-parchment-50/50 to-parchment-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 ${narrationDarkMode ? 'dark' : ''}`}>

      {/* Header - condensed on mobile */}
      <Header
        location={gameState.location}
        time={gameState.time}
        date={gameState.date}
        onSaveGame={handleSaveGame}
        onSettings={() => openModal('settings')}
        showCondensedStats={true}
        health={gameState.health}
        energy={gameState.energy}
        wealth={gameState.wealth}
      />

      {/* Main Content Area - pb-20 (80px) for bottom nav clearance */}
      <div className="flex-1 overflow-hidden px-2 py-2 pb-20">

        {/* Chronicle Tab - Main story view */}
        {activeBottomTab === 'chronicle' && (
          <div className="h-full flex flex-col gap-2 relative">

            {/* Floating D-Pad Controller */}
            {showDPad && (
              <div
                className="absolute bottom-20 left-4 z-50"
                style={{
                  touchAction: 'none',
                  userSelect: 'none'
                }}
              >
                <div className="relative w-32 h-32">
                  {/* Center button */}
                  <button
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-700/80 dark:bg-gray-800/90 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg"
                    onClick={() => setShowDPad(false)}
                  >
                    ✕
                  </button>

                  {/* Up */}
                  <button
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-600/90 hover:bg-blue-700 active:bg-blue-800 rounded-t-xl flex items-center justify-center text-white text-xl shadow-lg transition-colors"
                    onClick={() => handleMovement('north')}
                  >
                    ▲
                  </button>

                  {/* Down */}
                  <button
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-600/90 hover:bg-blue-700 active:bg-blue-800 rounded-b-xl flex items-center justify-center text-white text-xl shadow-lg transition-colors"
                    onClick={() => handleMovement('south')}
                  >
                    ▼
                  </button>

                  {/* Left */}
                  <button
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-600/90 hover:bg-blue-700 active:bg-blue-800 rounded-l-xl flex items-center justify-center text-white text-xl shadow-lg transition-colors"
                    onClick={() => handleMovement('west')}
                  >
                    ◀
                  </button>

                  {/* Right */}
                  <button
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-600/90 hover:bg-blue-700 active:bg-blue-800 rounded-r-xl flex items-center justify-center text-white text-xl shadow-lg transition-colors"
                    onClick={() => handleMovement('east')}
                  >
                    ▶
                  </button>
                </div>
              </div>
            )}

            {/* Floating Action Menu */}
            <div className="absolute bottom-20 right-4 z-50 flex flex-col-reverse gap-2">
              {/* Action buttons (shown when menu is open) */}
              {showActionMenu && (
                <div className="flex flex-col-reverse gap-2 animate-in slide-in-from-bottom">
                  <button
                    className="w-14 h-14 bg-purple-600/90 hover:bg-purple-700 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-all"
                    onClick={() => {
                      openModal('mixing');
                      setShowActionMenu(false);
                    }}
                  >
                    ⚗️
                  </button>
                  <button
                    className="w-14 h-14 bg-green-600/90 hover:bg-green-700 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-all"
                    onClick={() => {
                      openModal('buy');
                      setShowActionMenu(false);
                    }}
                  >
                    🛒
                  </button>
                  <button
                    className="w-14 h-14 bg-amber-600/90 hover:bg-amber-700 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-all"
                    onClick={() => {
                      handleShowPrescribePopup();
                      setShowActionMenu(false);
                    }}
                  >
                    💊
                  </button>
                  <button
                    className="w-14 h-14 bg-teal-600/90 hover:bg-teal-700 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-all"
                    onClick={() => {
                      setShowDPad(!showDPad);
                      setShowActionMenu(false);
                    }}
                  >
                    🎮
                  </button>
                </div>
              )}

              {/* Main FAB toggle */}
              <button
                className={`w-16 h-16 ${showActionMenu ? 'bg-red-600/90 hover:bg-red-700' : 'bg-blue-600/90 hover:bg-blue-700'} rounded-full flex items-center justify-center text-white text-2xl shadow-xl transition-all ${showActionMenu ? 'rotate-45' : ''}`}
                onClick={() => setShowActionMenu(!showActionMenu)}
              >
                +
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
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
                pendingContract={pendingContract}
                onOpenContractModal={() => openModal('contract')}
                pendingExitConfirmation={showExitConfirmation ? pendingExitData : null}
                onConfirmExit={handleConfirmExit}
                onCancelExit={() => closeModal('exitConfirmation')}
                tradeOpportunities={gameState.tradeOpportunities || []}
                onAcceptTrade={handleAcceptTrade}
                onDeclineTrade={handleDeclineTrade}
                pendingSimpleInteraction={pendingSimpleInteraction}
                onSimpleInteractionChoice={handleSimpleInteractionChoice}
                pendingRandomEvent={pendingRandomEvent}
                onRandomEventChoice={handleRandomEventChoice}
                onEntityClick={handleEntityClick}
                playerPortrait={mariaPortraitUrl}
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
                onOpenMixing={() => openModal('mixing')}
                onPrescriptionPending={setPendingPrescription}
                onPrescriptionComplete={() => setPendingPrescription(null)}
                pendingPrescription={pendingPrescription}
                narrationFontSize={narrationFontSize}
                narrationDarkMode={narrationDarkMode}
                isNarrationSettingsOpen={isNarrationSettingsOpen}
                isLLMViewOpen={isLLMViewOpen}
                onNarrationFontSizeChange={setNarrationFontSize}
                onNarrationDarkModeToggle={setNarrationDarkMode}
                onOpenNarrationSettings={() => openModal('narrationSettings')}
                onCloseNarrationSettings={() => closeModal('narrationSettings')}
                onOpenLLMView={() => openModal('llmView')}
                onCloseLLMView={() => closeModal('llmView')}
              />
            </div>

            {/* Input Area - only on Chronicle tab */}
            {activeTab === 'chronicle' && (
              <div className="flex-shrink-0">
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
          </div>
        )}

        {/* Character Tab - Enhanced character overview */}
        {activeBottomTab === 'character' && (
          <div className="h-full overflow-y-auto p-3 space-y-4">
            {/* Portrait & Header Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 shadow-lg">
              <div className="flex gap-4 items-start">
                {/* Portrait */}
                <div className="flex-shrink-0">
                  <img
                    src={mariaPortraitUrl}
                    alt="Maria de Lima"
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-200 dark:border-amber-700 shadow-md"
                    onClick={handlePortraitClick}
                  />
                </div>

                {/* Character Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Maria de Lima
                  </h2>
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                    {gameState.playerTitle || "Master Apothecary"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Level {playerSkills.level || 1} • {gameState.chosenProfession || "Apothecary"}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>📍 {gameState.location}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>🕐 {gameState.time}</span>
                    <span>•</span>
                    <span>{gameState.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Bars */}
            <div className="space-y-3">
              {/* Health Bar */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">❤️</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Health</span>
                  </div>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">{gameState.health}/100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${gameState.health}%` }}
                  />
                </div>
              </div>

              {/* Energy Bar */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Energy</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{gameState.energy}/100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${gameState.energy}%` }}
                  />
                </div>
              </div>

              {/* Wealth */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Wealth</span>
                  </div>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {gameState.wealth} reales
                  </span>
                </div>
              </div>

              {/* Reputation */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Reputation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{reputationEmoji}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {reputation?.overall || reputation || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Effects (if any) */}
            {activeEffects && activeEffects.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 shadow">
                <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                  ✨ Active Effects
                </h3>
                <div className="space-y-1">
                  {activeEffects.map((effect, idx) => (
                    <div key={idx} className="text-xs text-purple-700 dark:text-purple-400">
                      • {effect.name || effect}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center shadow">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-lg font-bold text-blue-900 dark:text-blue-300">
                  {turnNumber}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-400">
                  Turns Played
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center shadow">
                <div className="text-2xl mb-1">🎒</div>
                <div className="text-lg font-bold text-green-900 dark:text-green-300">
                  {gameState.inventory?.length || 0}
                </div>
                <div className="text-xs text-green-700 dark:text-green-400">
                  Items Owned
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <TouchButton
                variant="primary"
                size="large"
                onClick={() => setIsCharacterSheetOpen(true)}
                className="w-full"
              >
                👤 Full Character Card
              </TouchButton>
              <TouchButton
                variant="secondary"
                size="large"
                onClick={() => openModal('skills')}
                className="w-full"
              >
                ✨ Skills & Abilities
              </TouchButton>
              <TouchButton
                variant="secondary"
                size="large"
                onClick={() => openModal('reputation')}
                className="w-full"
              >
                ⭐ Detailed Reputation
              </TouchButton>
            </div>
          </div>
        )}

        {/* Inventory Tab - Enhanced inventory overview */}
        {activeBottomTab === 'inventory' && (
          <div className="h-full overflow-y-auto p-3 space-y-4">
            {/* Inventory Summary Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">🎒</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Inventory
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {gameState.inventory?.length || 0} items total
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-white/60 dark:bg-slate-900/40 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {gameState.inventory?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Units</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-900/40 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                    {gameState.inventory?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Value</div>
                </div>
              </div>
            </div>

            {/* Recent Items Preview */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Recent Items
                </h3>
                <button
                  onClick={() => setIsInventorySheetOpen(true)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2">
                {gameState.inventory && gameState.inventory.length > 0 ? (
                  gameState.inventory.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => {
                        handlers.setSelectedItem(item);
                        openModal('item');
                      }}
                    >
                      <div className="text-3xl flex-shrink-0">
                        {item.emoji || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity || 1} • {item.price || 0} reales
                        </div>
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        →
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                    <div className="text-3xl mb-2">📦</div>
                    <p className="text-sm">No items in inventory</p>
                  </div>
                )}
              </div>
            </div>

            {/* Compounds Section */}
            {gameState.compounds && gameState.compounds.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚗️</span>
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                    Your Compounds
                  </h3>
                </div>
                <div className="space-y-2">
                  {gameState.compounds.slice(0, 3).map((compound, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-900/40 rounded-lg"
                    >
                      <span className="text-lg">⚗️</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-purple-900 dark:text-purple-300 truncate">
                          {compound.name}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">
                          {compound.ingredients?.length || 0} ingredients
                        </div>
                      </div>
                    </div>
                  ))}
                  {gameState.compounds.length > 3 && (
                    <div className="text-xs text-center text-purple-600 dark:text-purple-400">
                      +{gameState.compounds.length - 3} more compounds
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Categories Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Item Categories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(() => {
                  const categories = {};
                  gameState.inventory?.forEach(item => {
                    const category = item.category || 'Other';
                    categories[category] = (categories[category] || 0) + 1;
                  });
                  return Object.entries(categories).slice(0, 6).map(([category, count]) => (
                    <div
                      key={category}
                      className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 text-center"
                    >
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {count}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {category}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <TouchButton
                variant="primary"
                size="large"
                onClick={() => setIsInventorySheetOpen(true)}
                className="w-full"
              >
                🎒 Full Inventory List
              </TouchButton>
              <TouchButton
                variant="secondary"
                size="large"
                onClick={() => openModal('mixing')}
                className="w-full"
              >
                ⚗️ Mix Compounds
              </TouchButton>
              <div className="grid grid-cols-2 gap-2">
                <TouchButton
                  variant="secondary"
                  size="large"
                  onClick={() => openModal('buy')}
                  className="w-full"
                >
                  🛒 Buy
                </TouchButton>
                <TouchButton
                  variant="secondary"
                  size="large"
                  onClick={() => openModal('sell')}
                  className="w-full"
                >
                  💰 Sell
                </TouchButton>
              </div>
            </div>
          </div>
        )}

        {/* Location Tab - Simplified mobile map view */}
        {activeBottomTab === 'location' && (
          <div className="h-full overflow-auto p-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg">
              {/* Location Header */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {gameState.location}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {gameState.time} - {gameState.date}
                </p>
              </div>

              {/* Map Container */}
              <div className="bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <ContextPanel
                  defaultCollapsed={false}
                  location={gameState.location}
                  locationDetails={gameState.location}
                  onActionClick={handleActionClick}
                  recentNPCs={recentNPCs}
                  primaryPortraitFile={primaryPortraitFile}
                  currentNarrative={historyOutput}
                  recentNarrativeTurn={historyOutput}
                  scenario={scenario}
                  npcs={filteredNPCPositions}
                  playerPosition={playerPosition}
                  playerFacing={playerFacing}
                  currentMapId={currentMapId}
                  shopSignHung={gameState.shopSign?.hung || false}
                  setIsLedgerOpen={() => openModal('ledger')}
                  toggleShopSign={toggleShopSign}
                  toast={toast}
                  entities={currentEntities}
                  onBookClick={handleBookClick}
                  onLocationChange={(newLocation) => {
                    console.log('Location changed to:', newLocation);
                    updateLocation(newLocation);
                  }}
                  onPortraitClick={handlePortraitClick}
                  onMapClick={() => openModal('interactiveMap')}
                  onItemDropOnNPC={handleItemDropOnNPC}
                  onEnterBuilding={handleEnterBuilding}
                  onExitBuilding={handleExitBuilding}
                  onRoomCommand={handleSubmit}
                  onFurnitureClick={handleFurnitureClick}
                />
              </div>

              {/* Quick Actions */}
              <div className="mt-4 space-y-2">
                <TouchButton
                  variant="secondary"
                  size="large"
                  onClick={() => openModal('interactiveMap')}
                  className="w-full"
                >
                  🗺️ Full Map
                </TouchButton>
                {gameState.location === 'Botica de la Amargura' && (
                  <TouchButton
                    variant="secondary"
                    size="large"
                    onClick={toggleShopSign}
                    className="w-full"
                  >
                    {gameState.shopSign?.hung ? '🪧 Remove Sign' : '🪧 Hang Sign'}
                  </TouchButton>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Simple implementation with inline styles */}
      <SimpleMobileNav
        activeTab={activeBottomTab}
        onTabChange={(tabId) => {
          console.log('[SimpleMobileNav] Changing tab to:', tabId);
          setActiveBottomTab(tabId);
        }}
      />

      {/* Character Sheet - Full LeftSidebar in bottom sheet */}
      <BottomSheet
        isOpen={isCharacterSheetOpen}
        onClose={() => setIsCharacterSheetOpen(false)}
        title="Character"
        height="full"
      >
        <LeftSidebar
          wealth={gameState.wealth}
          status={gameState.status}
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
          onOpenEquipment={() => openModal('equipment')}
          onItemClick={(item) => {
            handlers.setSelectedItem(item);
            openModal('item');
          }}
          onOpenReputationModal={(factionId = null) => {
            handlers.setReputationModalFaction(factionId);
            openModal('reputation');
          }}
          onOpenSkillsModal={() => openModal('skills')}
          onOpenSkillDetail={(skillId) => handlers.setDetailSkillId(skillId)}
          onOpenFullInventory={handleOpenFullInventory}
          onItemDropOnPlayer={handleItemDropOnPlayer}
          statusPanelTab={leftSidebarTab}
          onStatusPanelTabChange={setLeftSidebarTab}
          xpGain={handlers.xpGain}
          xpGainKey={handlers.xpGainKey}
          onCharacterCardCollapseChange={() => {}}
        />
      </BottomSheet>

      {/* Inventory Sheet - Mobile-optimized inventory list */}
      <BottomSheet
        isOpen={isInventorySheetOpen}
        onClose={() => setIsInventorySheetOpen(false)}
        title="Full Inventory"
        height="full"
      >
        <div className="h-full overflow-y-auto">
          {/* Inventory Stats */}
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {gameState.inventory?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Value</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {gameState.inventory?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0} reales
                </p>
              </div>
            </div>
          </div>

          {/* Inventory List */}
          <div className="space-y-2">
            {gameState.inventory && gameState.inventory.length > 0 ? (
              gameState.inventory.map((item, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700"
                  onClick={() => {
                    handlers.setSelectedItem(item);
                    openModal('item');
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Qty: {item.quantity || 1}</span>
                        <span>•</span>
                        <span>{item.price || 0} reales</span>
                      </div>
                    </div>
                    <div className="text-4xl ml-3">
                      {item.emoji || '📦'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-4xl mb-2">🎒</p>
                <p>Your inventory is empty</p>
              </div>
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default MobileGameLayout;
