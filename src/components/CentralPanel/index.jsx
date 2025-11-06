// CentralPanel/index.jsx
// Main container for tabbed central interface

import React, { useState, useEffect } from 'react';
import { TabNavigation } from './TabNavigation';
import { NarrativeTab } from './NarrativeTab';
import { LogTab } from './LogTab';
import { PatientViewTab } from './PatientViewTab';
import { ReferenceTab } from './ReferenceTab';
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
  toast, // Toast notification function
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedReferenceEntry, setSelectedReferenceEntry] = useState(null);
  const [tabTransitioning, setTabTransitioning] = useState(false);

  const handleHeaderClick = () => {
    setIsCollapsed(prev => !prev);
  };

  // Listen for medical term clicks from NarrativePanel
  useEffect(() => {
    const handleOpenReference = (event) => {
      const { entryId, sourceName, clickPosition } = event.detail;

      console.log('[CentralPanel] Received openReferenceEntry event:', {
        entryId,
        sourceName,
        clickPosition
      });

      // Start tab transition with smooth animation
      setTabTransitioning(true);

      // Set selected entry for ReferenceTab
      setSelectedReferenceEntry(entryId);

      // Switch to Reference tab with slight delay for visual feedback
      setTimeout(() => {
        onTabChange('reference');
        setTabTransitioning(false);
      }, 150);

      // Optional: Show visual feedback at click position
      if (clickPosition && typeof window !== 'undefined') {
        showRippleEffect(clickPosition);
      }
    };

    window.addEventListener('openReferenceEntry', handleOpenReference);

    return () => {
      window.removeEventListener('openReferenceEntry', handleOpenReference);
    };
  }, [onTabChange]);

  // Show ripple effect at click position for extra polish
  const showRippleEffect = (position) => {
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.left = `${position.x}px`;
    ripple.style.top = `${position.y}px`;
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9999';
    ripple.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease-out';
    ripple.style.opacity = '1';

    document.body.appendChild(ripple);

    // Trigger animation
    requestAnimationFrame(() => {
      ripple.style.transform = 'translate(-50%, -50%) scale(4)';
      ripple.style.opacity = '0';
    });

    // Clean up
    setTimeout(() => {
      document.body.removeChild(ripple);
    }, 600);
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

          {activeTab === 'reference' && (
            <ReferenceTab initialSelectedEntry={selectedReferenceEntry} />
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
              toast={toast}
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
