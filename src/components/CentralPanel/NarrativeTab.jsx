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
  pendingPrescription,
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
  pendingSaleInquiry = null, // Sale inquiry
  onPursueSale = null, // Handler to pursue sale
  onDeclineSale = null, // Handler to decline sale
  pendingMixingDecision = null, // Mixing decision
  onOpenMixingWorkshop = null, // Handler to open mixing workshop
  onAbandonMixing = null, // Handler to abandon mixing
  pendingSaleProposal = null, // Sale proposal (Phase 2C)
  onCompleteSale = null, // Handler to complete sale
  onAbandonSaleProposal = null, // Handler to abandon sale proposal
  pendingRandomEvent = null, // Random event
  onRandomEventChoice = null, // Handler for random event
  gameState = {}, // Game state for wealth/inventory
  updateInventory = null, // Handler to update inventory quantities
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
        pendingPrescription={pendingPrescription}
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
        pendingSaleInquiry={pendingSaleInquiry}
        onPursueSale={onPursueSale}
        onDeclineSale={onDeclineSale}
        pendingMixingDecision={pendingMixingDecision}
        onOpenMixingWorkshop={onOpenMixingWorkshop}
        onAbandonMixing={onAbandonMixing}
        pendingSaleProposal={pendingSaleProposal}
        onCompleteSale={onCompleteSale}
        onAbandonSaleProposal={onAbandonSaleProposal}
        pendingRandomEvent={pendingRandomEvent}
        onRandomEventChoice={onRandomEventChoice}
        gameState={gameState}
        updateInventory={updateInventory}
        fontSize={fontSize}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
