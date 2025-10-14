// LeftSidebar/index.jsx
// Main container for character card and player status panel

import React, { useState } from 'react';
import { CharacterCard } from './CharacterCard';
import { PlayerStatusPanel } from './PlayerStatusPanel';
import PlayerCharacterModal from '../../features/character/components/PlayerCharacterModal';
import characterData from '../../scenarios/1680-mexico-city/characterExtended';

/**
 * LeftSidebar Component
 * Orchestrates the character card (portrait + vitals) and status panel (tabs)
 * Follows same pattern as CentralPanel
 */
export function LeftSidebar({
  wealth = 11,
  status = 'rested',
  reputation = null,
  reputationEmoji = '😐',
  health = 85,
  energy = 62,
  characterName = 'Maria de Lima',
  characterTitle = 'Master Apothecary',
  characterLevel = 8,
  chosenProfession = null, // New prop: player's chosen profession
  activeEffects = [],
  playerSkills = null,
  portraitImage = null,
  conversationHistory = [],
  onOpenEquipment = null,
  onItemClick = null,
  onOpenReputationModal = null,
  onOpenSkillsModal = null,
  onItemDropOnPlayer = null, // New prop for drag-drop
  statusPanelTab = undefined, // External control of status panel tab
  onStatusPanelTabChange = undefined, // Callback when tab changes
  inventory = [], // Inventory array from gameState
  xpGain = null, // XP gain notification data
  xpGainKey = 0 // Key to force re-render of XP animation
}) {
  const [showCharacterModal, setShowCharacterModal] = useState(false);

  return (
    <aside className="hidden lg:flex flex-col w-[282px] xl:w-[315px] h-full">
      {/* Character Card - Portrait & Vitals */}
      <CharacterCard
        wealth={wealth}
        status={status}
        health={health}
        energy={energy}
        characterName={characterName}
        characterTitle={characterTitle}
        characterLevel={characterLevel}
        chosenProfession={chosenProfession}
        portraitImage={portraitImage}
        onOpenCharacterModal={() => setShowCharacterModal(true)}
        onItemDropOnPlayer={onItemDropOnPlayer}
      />

      {/* Player Status Panel - Tabs (Reputation, Status, Inventory) */}
      <PlayerStatusPanel
        reputation={reputation}
        reputationEmoji={reputationEmoji}
        activeEffects={activeEffects}
        playerSkills={playerSkills}
        onItemClick={onItemClick}
        onOpenReputationModal={onOpenReputationModal}
        onOpenSkillsModal={onOpenSkillsModal}
        activeTab={statusPanelTab}
        onTabChange={onStatusPanelTabChange}
        inventory={inventory}
        xpGain={xpGain}
        xpGainKey={xpGainKey}
      />

      {/* Player Character Modal */}
      <PlayerCharacterModal
        isOpen={showCharacterModal}
        onClose={() => setShowCharacterModal(false)}
        characterData={characterData}
        playerSkills={playerSkills}
        currentStats={{
          health,
          energy,
          wealth,
          reputation: reputationEmoji
        }}
        portraitSrc={portraitImage}
        onOpenEquipment={onOpenEquipment}
        playerLevel={characterLevel}
        chosenProfession={chosenProfession}
      />
    </aside>
  );
}

export default LeftSidebar;
