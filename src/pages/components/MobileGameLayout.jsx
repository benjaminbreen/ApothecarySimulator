import React, { useState } from 'react';
import CollapsiblePanel from '../../components/CollapsiblePanel';
import BottomSheet from '../../components/BottomSheet';
import TouchButton from '../../components/TouchButton';
import MobileBottomNav from '../../components/MobileBottomNav';
import NarrativePanel from '../../components/NarrativePanel';
import InputArea from '../../components/InputArea';
import ContextPanel from '../../components/ContextPanel';
import { LeftSidebar } from '../../components/LeftSidebar';
import { CentralPanel } from '../../components/CentralPanel';
import Header from '../../components/Header';

/**
 * Mobile Game Layout
 *
 * Mobile-optimized layout for GamePage that uses:
 * - Collapsible panels for space efficiency
 * - Bottom navigation for quick access
 * - Full-screen chronicle view
 * - Touch-optimized buttons
 *
 * Desktop layout is completely untouched.
 */
const MobileGameLayout = ({
  // All the same props as GamePage
  gameState,
  narrationDarkMode,
  activeTab,
  handleTabChange,
  conversationHistory,
  recentNPCs,
  isLoading,
  handleShowPrescribePopup,
  handleShowDiagnosePopup,
  gameLog,
  activePatient,
  patientDialogue,
  handleAskQuestion,
  pendingContract,
  setIsContractModalOpen,
  showExitConfirmation,
  pendingExitData,
  handleConfirmExit,
  setShowExitConfirmation,
  handleAcceptTrade,
  handleDeclineTrade,
  pendingSimpleInteraction,
  handleSimpleInteractionChoice,
  pendingRandomEvent,
  handleRandomEventChoice,
  handleEntityClick,
  mariaPortraitUrl,
  updateInventory,
  addJournalEntry,
  setHistoryOutput,
  setConversationHistory,
  setTurnNumber,
  currentPrescriptionType,
  advanceTime,
  updateEnergy,
  transactionManager,
  TRANSACTION_CATEGORIES,
  toggleInventory,
  setLeftSidebarTab,
  setShowMixingPopup,
  setPendingPrescription,
  setActiveTab,
  pendingPrescription,
  narrationFontSize,
  isNarrationSettingsOpen,
  isLLMViewOpen,
  setNarrationFontSize,
  setNarrationDarkMode,
  setIsNarrationSettingsOpen,
  setIsLLMViewOpen,
  userInput,
  setUserInput,
  handleSubmit,
  handleQuickAction,
  handleItemDrop,
  dynamicChips,
  nearbyLocations,
  primaryPortraitFile,
  historyOutput,
  scenarioLoader,
  scenarioId,
  filteredNPCPositions,
  playerPosition,
  playerFacing,
  currentMapId,
  toggleShopSign,
  toast,
  currentEntities,
  discoveredBooks,
  handleBookClick,
  updateLocation,
  handlePortraitClick,
  setIsInteractiveMapModalOpen,
  handleItemDropOnNPC,
  handleEnterBuilding,
  handleExitBuilding,
  handleFurnitureClick,
  handleSaveGame,
  setIsSettingsOpen,
  isCharacterCardCollapsed,
  reputation,
  reputationEmoji,
  playerSkills,
  activeEffects,
  setShowEquipmentModal,
  setSelectedItem,
  setShowItemModal,
  setReputationModalFaction,
  setShowReputationModal,
  setShowSkillsModal,
  setDetailSkillId,
  handleOpenFullInventory,
  handleItemDropOnPlayer,
  leftSidebarTab,
  setIsCharacterCardCollapsed,
  xpGain,
  xpGainKey,
  handleActionClick
}) => {
  const [activeBottomTab, setActiveBottomTab] = useState('chronicle');
  const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState(false);
  const [isInventorySheetOpen, setIsInventorySheetOpen] = useState(false);
  const [isContextSheetOpen, setIsContextSheetOpen] = useState(false);

  // Bottom nav items (actual game features, not unused Journal/Map)
  const bottomNavItems = [
    { id: 'chronicle', icon: '📖', label: 'Story' },
    { id: 'character', icon: '👤', label: 'Character' },
    { id: 'context', icon: '🏛️', label: 'Location' }
  ];

  return (
    <div className={`h-screen flex flex-col overflow-hidden bg-gradient-to-br from-parchment-100 via-parchment-50/50 to-parchment-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 ${narrationDarkMode ? 'dark' : ''}`}>

      {/* Header - same as desktop but condensed */}
      <Header
        location={gameState.location}
        time={gameState.time}
        date={gameState.date}
        onSaveGame={handleSaveGame}
        onSettings={() => setIsSettingsOpen(true)}
        showCondensedStats={true} // Always condensed on mobile
        health={gameState.health}
        energy={gameState.energy}
        wealth={gameState.wealth}
      />

      {/* Main Content - Chronicle View (Full Screen) */}
      <div className="flex-1 overflow-hidden px-2 py-2 pb-16">
        {activeBottomTab === 'chronicle' && (
          <div className="h-full flex flex-col gap-2">
            {/* Central Panel with Chronicle/Patient tabs */}
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
                onOpenContractModal={() => setIsContractModalOpen(true)}
                pendingExitConfirmation={showExitConfirmation ? pendingExitData : null}
                onConfirmExit={handleConfirmExit}
                onCancelExit={() => setShowExitConfirmation(false)}
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
                onOpenMixing={() => setShowMixingPopup(true)}
                onPrescriptionPending={(data) => {
                  setPendingPrescription(data);
                  setActiveTab('chronicle');
                }}
                onPrescriptionComplete={() => setPendingPrescription(null)}
                pendingPrescription={pendingPrescription}
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

        {/* Character Tab - Quick stats and actions */}
        {activeBottomTab === 'character' && (
          <div className="h-full overflow-y-auto">
            <CollapsiblePanel
              title="Character"
              icon="👤"
              variant="primary"
              defaultCollapsed={false}
            >
              <div className="space-y-4 p-2">
                {/* Character stats overview */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-parchment-100 dark:bg-slate-800 p-3 rounded-lg">
                    <div className="text-2xl">❤️</div>
                    <div className="text-sm font-semibold">{gameState.health}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Health</div>
                  </div>
                  <div className="bg-parchment-100 dark:bg-slate-800 p-3 rounded-lg">
                    <div className="text-2xl">⚡</div>
                    <div className="text-sm font-semibold">{gameState.energy}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Energy</div>
                  </div>
                  <div className="bg-parchment-100 dark:bg-slate-800 p-3 rounded-lg">
                    <div className="text-2xl">💰</div>
                    <div className="text-sm font-semibold">{gameState.wealth}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Reales</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <TouchButton
                    variant="primary"
                    size="large"
                    onClick={() => {
                      setLeftSidebarTab('inventory');
                      setIsInventorySheetOpen(true);
                    }}
                    className="w-full"
                  >
                    🎒 View Full Inventory
                  </TouchButton>
                  <TouchButton
                    variant="secondary"
                    size="large"
                    onClick={() => setShowSkillsModal(true)}
                    className="w-full"
                  >
                    ✨ Skills & Abilities
                  </TouchButton>
                  <TouchButton
                    variant="secondary"
                    size="large"
                    onClick={() => setShowReputationModal(true)}
                    className="w-full"
                  >
                    ⭐ Reputation
                  </TouchButton>
                </div>
              </div>
            </CollapsiblePanel>
          </div>
        )}

        {/* Context Tab - Location info and actions */}
        {activeBottomTab === 'context' && (
          <div className="h-full overflow-y-auto">
            <ContextPanel
              location={gameState.location}
              locationDetails={gameState.location}
              onActionClick={handleActionClick}
              recentNPCs={recentNPCs}
              primaryPortraitFile={primaryPortraitFile}
              currentNarrative={historyOutput}
              recentNarrativeTurn={historyOutput}
              scenario={scenarioLoader.getScenario(scenarioId || '1680-mexico-city')}
              npcs={filteredNPCPositions}
              playerPosition={playerPosition}
              playerFacing={playerFacing}
              currentMapId={currentMapId}
              shopSignHung={gameState.shopSign?.hung || false}
              setIsLedgerOpen={(val) => {}} // TODO: Add ledger to mobile
              toggleShopSign={toggleShopSign}
              toast={toast}
              entities={currentEntities}
              discoveredBooks={discoveredBooks}
              onBookClick={handleBookClick}
              onLocationChange={(newLocation) => {
                console.log('Location changed to:', newLocation);
                updateLocation(newLocation);
              }}
              onPortraitClick={handlePortraitClick}
              onMapClick={() => setIsInteractiveMapModalOpen(true)}
              onItemDropOnNPC={handleItemDropOnNPC}
              onEnterBuilding={handleEnterBuilding}
              onExitBuilding={handleExitBuilding}
              onRoomCommand={handleSubmit}
              onFurnitureClick={handleFurnitureClick}
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav
        items={bottomNavItems}
        activeItem={activeBottomTab}
        onItemClick={(item) => setActiveBottomTab(item.id)}
        showLabels={true}
        enableHaptics={true}
      />

      {/* Bottom Sheets for Character/Inventory details */}
      <BottomSheet
        isOpen={isInventorySheetOpen}
        onClose={() => setIsInventorySheetOpen(false)}
        title="Full Inventory"
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
          statusPanelTab={leftSidebarTab}
          onStatusPanelTabChange={setLeftSidebarTab}
          xpGain={xpGain}
          xpGainKey={xpGainKey}
          onCharacterCardCollapseChange={setIsCharacterCardCollapsed}
        />
      </BottomSheet>
    </div>
  );
};

export default MobileGameLayout;
