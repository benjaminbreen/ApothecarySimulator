// NarrativeTab.jsx
// Chronicle tab - wrapper around existing NarrativePanel

import React from 'react';
import NarrativePanel from '../NarrativePanel';

export function NarrativeTab({
  conversationHistory,
  recentNPCs,
  isLoading,
  onShowPrescribePopup,
  onShowDiagnosePopup,
  onEntityClick,
  playerPortrait,
  activePatient,
  onSwitchToPatientView,
  onDismissPatient = null, // Handler to dismiss patient
  pendingPrescription,
  onOpenPrescriptionDetails = null, // Handler to open prescription outcome modal
  pendingContract = null, // Contract offer
  onOpenContractModal = null, // Handler to open contract modal
  pendingExitConfirmation = null, // Exit confirmation data
  onConfirmExit = null, // Handler to confirm exit
  onCancelExit = null, // Handler to cancel exit
  tradeOpportunities = [], // Trade opportunities
  onAcceptTrade = null, // Handler to accept trade
  onDeclineTrade = null, // Handler to decline trade
  pendingSimpleInteraction = null, // Simple interaction
  onSimpleInteractionChoice = null, // Handler for simple interaction
  pendingActionPrompt = null, // Action prompt (give/sell/prescribe)
  onProposeAction = null, // Handler to propose action
  onDeclineAction = null, // Handler to decline action
  pendingMixingDecision = null, // Mixing decision
  onOpenMixingWorkshop = null, // Handler to open mixing workshop
  onAbandonMixing = null, // Handler to abandon mixing
  pendingRandomEvent = null, // Random event
  onRandomEventChoice = null, // Handler for random event
  gameState = {}, // Game state for wealth/inventory
  updateInventory = null, // Handler to update inventory quantities
  onMerchantClick = null, // Handler for merchant clicks
  fontSize = 'text-base',
  isDarkMode = false
}) {
  return (
    <div className="h-full flex flex-col animate-fade-in">
      <NarrativePanel
        conversationHistory={conversationHistory}
        recentNPCs={recentNPCs}
        isLoading={isLoading}
        onShowPrescribePopup={onShowPrescribePopup}
        onShowDiagnosePopup={onShowDiagnosePopup}
        onEntityClick={onEntityClick}
        playerPortrait={playerPortrait}
        activePatient={activePatient}
        onSwitchToPatientView={onSwitchToPatientView}
        onDismissPatient={onDismissPatient}
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
        onMerchantClick={onMerchantClick}
        fontSize={fontSize}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
