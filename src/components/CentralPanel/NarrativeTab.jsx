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
  onSimpleInteractionChoice = null, // Handler for simple interaction choices
  pendingRandomEvent = null, // Random event
  onRandomEventChoice = null, // Handler for random event choices
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
