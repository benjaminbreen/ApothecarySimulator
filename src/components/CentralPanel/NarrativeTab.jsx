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
        fontSize={fontSize}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
