// CentralPanel/index.jsx
// Main container for tabbed central interface

import React from 'react';
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
  transactionManager,
  TRANSACTION_CATEGORIES,
  toggleInventory,
  onOpenInventoryTab, // Callback to open inventory tab in left sidebar
  onOpenMixing, // Callback to open mixing modal
  onPrescriptionPending, // Callback when prescription is being processed
  onPrescriptionComplete, // Callback when prescription outcome is accepted
  pendingPrescription, // Current pending prescription data

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
  return (
    <>
      <div className="h-full flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-dark-elevation-3 overflow-hidden border border-ink-100 dark:border-slate-700 transition-colors duration-300">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          hasActivePatient={!!activePatient}
          onOpenSettings={onOpenNarrationSettings}
        />

        <div className="flex-1 overflow-hidden bg-white/90 dark:bg-slate-900/90 transition-colors duration-300">
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
              pendingContract={pendingContract}
              onOpenContractModal={onOpenContractModal}
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
