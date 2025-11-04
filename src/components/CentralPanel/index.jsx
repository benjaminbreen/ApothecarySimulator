// CentralPanel/index.jsx
// Main container for tabbed central interface

import React, { useState } from 'react';
import { TabNavigation } from './TabNavigation';
import { NarrativeTab } from './NarrativeTab';
import { LogTab } from './LogTab';
import { PatientViewTab } from './PatientViewTab';
import { NarrationSettingsModal } from './NarrationSettingsModal';
import { LLMTransparencyView } from './LLMTransparencyView';
import { getLLMCallHistory } from '../../core/services/llmService';

export function CentralPanel({
  // Tab state
  activeTab,
  onTabChange,

  // Chronicle/Narrative props
  conversationHistory,
  recentNPCs,
  isLoading,
  onShowPrescribePopup,
  onShowDiagnosePopup,

  // Log props
  gameLog,

  // Patient View props
  activePatient,
  patientDialogue,
  onAskQuestion,

  // Contract props
  pendingContract,
  onOpenContractModal,

  // Exit confirmation props
  pendingExitConfirmation,
  onConfirmExit,
  onCancelExit,

  // Trade props
  tradeOpportunities,
  onAcceptTrade,
  onDeclineTrade,

  // Simple interaction props
  pendingSimpleInteraction,
  onSimpleInteractionChoice,

  // Action prompt props
  pendingActionPrompt,
  onProposeAction,
  onDeclineAction,

  // Mixing decision props
  pendingMixingDecision,
  onOpenMixingWorkshop,
  onAbandonMixing,

  // Random event props
  pendingRandomEvent,
  onRandomEventChoice,

  // Prescription props for Patient View
  gameState,
  updateInventory,
  addJournalEntry,
  setHistoryOutput,
  setConversationHistory,
  setTurnNumber,
  currentWealth,
  prescriptionType,
  advanceTime,
  energy,
  updateEnergy,
  transactionManager,
  TRANSACTION_CATEGORIES,
  toggleInventory,
  onOpenInventoryTab, // Callback to open inventory tab in left sidebar
  onOpenMixing, // Callback to open mixing modal
  onPrescriptionPending, // Callback when prescription is being processed
  onPrescriptionComplete, // Callback when prescription outcome is accepted
  pendingPrescription, // Current pending prescription data
  onOpenPrescriptionDetails, // Callback to open prescription outcome modal

  // Narration settings props
  narrationFontSize,
  narrationDarkMode,
  isNarrationSettingsOpen,
  isLLMViewOpen,
  onNarrationFontSizeChange,
  onNarrationDarkModeToggle,
  onOpenNarrationSettings,
  onCloseNarrationSettings,
  onOpenLLMView,
  onCloseLLMView,

  // Shared
  onEntityClick,
  playerPortrait,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleHeaderClick = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <>
      <div className="flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-dark-elevation-3 overflow-hidden border border-ink-100 dark:border-slate-700" style={{
        flex: isCollapsed ? '0 0 auto' : '1 1 auto',
        height: isCollapsed ? 'auto' : '100%',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <TabNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          hasActivePatient={!!activePatient}
          onOpenSettings={onOpenNarrationSettings}
          onHeaderClick={handleHeaderClick}
        />

        <div className="overflow-hidden bg-white/90 dark:bg-slate-900/90" style={{
          flex: isCollapsed ? '0 0 0' : '1 1 auto',
          maxHeight: isCollapsed ? '0' : '100%',
          opacity: isCollapsed ? 0 : 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {activeTab === 'chronicle' && (
            <NarrativeTab
              conversationHistory={conversationHistory}
              recentNPCs={recentNPCs}
              isLoading={isLoading}
              onShowPrescribePopup={onShowPrescribePopup}
              onShowDiagnosePopup={onShowDiagnosePopup}
              onEntityClick={onEntityClick}
              playerPortrait={playerPortrait}
              activePatient={activePatient}
              onSwitchToPatientView={() => onTabChange('patient')}
              pendingPrescription={pendingPrescription}
              onOpenPrescriptionDetails={onOpenPrescriptionDetails}
              pendingContract={pendingContract}
              onOpenContractModal={onOpenContractModal}
              pendingExitConfirmation={pendingExitConfirmation}
              onConfirmExit={onConfirmExit}
              onCancelExit={onCancelExit}
              tradeOpportunities={tradeOpportunities}
              onAcceptTrade={onAcceptTrade}
              onDeclineTrade={onDeclineTrade}
              pendingSimpleInteraction={pendingSimpleInteraction}
              onSimpleInteractionChoice={onSimpleInteractionChoice}
              pendingActionPrompt={pendingActionPrompt}
              onProposeAction={onProposeAction}
              onDeclineAction={onDeclineAction}
              pendingMixingDecision={pendingMixingDecision}
              onOpenMixingWorkshop={onOpenMixingWorkshop}
              onAbandonMixing={onAbandonMixing}
              pendingRandomEvent={pendingRandomEvent}
              onRandomEventChoice={onRandomEventChoice}
              gameState={gameState}
              updateInventory={updateInventory}
              fontSize={narrationFontSize}
              isDarkMode={narrationDarkMode}
            />
          )}

          {activeTab === 'log' && (
            <LogTab
              conversationHistory={conversationHistory}
              onEntityClick={onEntityClick}
            />
          )}

          {activeTab === 'patient' && (
            <PatientViewTab
              patient={activePatient}
              patientDialogue={patientDialogue}
              onAskQuestion={onAskQuestion}
              // Prescription props
              gameState={gameState}
              updateInventory={updateInventory}
              addJournalEntry={addJournalEntry}
              conversationHistory={conversationHistory}
              setHistoryOutput={setHistoryOutput}
              setConversationHistory={setConversationHistory}
              setTurnNumber={setTurnNumber}
              currentWealth={currentWealth}
              prescriptionType={prescriptionType}
              advanceTime={advanceTime}
              energy={energy}
              updateEnergy={updateEnergy}
              transactionManager={transactionManager}
              TRANSACTION_CATEGORIES={TRANSACTION_CATEGORIES}
              toggleInventory={toggleInventory}
              onOpenInventoryTab={onOpenInventoryTab}
              onOpenMixing={onOpenMixing}
              onPrescriptionPending={onPrescriptionPending}
              onPrescriptionComplete={onPrescriptionComplete}
            />
          )}
        </div>
      </div>

      {/* Narration Settings Modal */}
      <NarrationSettingsModal
        isOpen={isNarrationSettingsOpen}
        onClose={onCloseNarrationSettings}
        fontSize={narrationFontSize}
        onFontSizeChange={onNarrationFontSizeChange}
        isDarkMode={narrationDarkMode}
        onDarkModeToggle={onNarrationDarkModeToggle}
        onOpenLLMView={onOpenLLMView}
      />

      {/* LLM Transparency View */}
      <LLMTransparencyView
        isOpen={isLLMViewOpen}
        onClose={onCloseLLMView}
        llmCalls={getLLMCallHistory()}
      />
    </>
  );
}
