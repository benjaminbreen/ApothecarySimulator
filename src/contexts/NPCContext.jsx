// NPCContext.jsx
// React Context for managing NPC and entity state
// Consolidates NPC tracking, patient state, and entity selection
// NOTE: NPC positions managed separately in GameContent due to map dependencies

import React, { createContext, useContext, useState, useMemo } from 'react';
import { NPCTracker } from '../core/agents/EntityAgent';

/**
 * Context for NPC and entity management
 * Provides: NPC tracking, patient state, entity selection, contracts
 */
const NPCContext = createContext(null);

/**
 * NPCProvider - Manages all NPC and entity-related state
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function NPCProvider({ children }) {
  // NPC Tracker (tracks last 5 NPCs for context)
  const [npcTracker] = useState(() => new NPCTracker(5));

  // Current entities from latest turn (for historical context)
  const [currentEntities, setCurrentEntities] = useState([]);

  // Patient State
  const [activePatient, setActivePatient] = useState(null); // Currently active patient (in examination)
  const [patientDialogue, setPatientDialogue] = useState([]); // Dialogue history with active patient
  const [currentPatient, setCurrentPatient] = useState(null); // Patient being prescribed to

  // Entity Selection (for modals)
  const [selectedNPC, setSelectedNPC] = useState(null); // Selected NPC for NPC modal
  const [selectedPatient, setSelectedPatient] = useState(null); // Selected patient for patient modal

  // Trading State
  const [tradingNPC, setTradingNPC] = useState(null); // Current NPC being traded with

  // Portrait System (PHASE 2: LLM-selected portraits)
  const [primaryPortraitFile, setPrimaryPortraitFile] = useState(null); // LLM-selected portrait filename
  const [primaryNpcName, setPrimaryNpcName] = useState(null); // Primary NPC name (conversation partner)

  // Contract System
  const [pendingContract, setPendingContract] = useState(null); // Pending treatment/sale contract
  const [pendingActionPrompt, setPendingActionPrompt] = useState(null); // Pending action prompt (give/sell/prescribe)
  const [actionPromptLoading, setActionPromptLoading] = useState(null); // Loading state with context for action prompt (e.g., { type: 'prescribe', recipientName: 'Esteban' })

  /**
   * Get recent NPCs from tracker
   * Note: Not memoized - npcTracker mutates internally
   */
  const getRecentNPCs = () => npcTracker.getRecentNPCs();

  /**
   * Add NPC to tracker
   * @param {string} npcName - NPC name to track
   */
  const trackNPC = (npcName) => {
    npcTracker.addNPC(npcName);
  };

  /**
   * Remove NPC from tracker
   * @param {string} npcName - NPC name to remove
   */
  const untrackNPC = (npcName) => {
    npcTracker.removeNPC(npcName);
  };

  /**
   * Check if NPC is recently tracked
   * @param {string} npcName - NPC name
   * @returns {boolean}
   */
  const isNPCRecent = (npcName) => {
    return npcTracker.getRecentNPCs().includes(npcName);
  };

  /**
   * Clear active patient and dialogue
   */
  const clearActivePatient = () => {
    setActivePatient(null);
    setPatientDialogue([]);
  };

  /**
   * Clear all entity selections
   */
  const clearSelections = () => {
    setSelectedNPC(null);
    setSelectedPatient(null);
    setCurrentPatient(null);
  };

  /**
   * Clear trading state
   */
  const clearTrading = () => {
    setTradingNPC(null);
  };

  /**
   * Clear contract state
   */
  const clearContract = () => {
    setPendingContract(null);
  };

  /**
   * Clear action prompt state
   */
  const clearActionPrompt = () => {
    setPendingActionPrompt(null);
  };

  /**
   * Reset all NPC/entity state (for new game)
   */
  const resetNPCState = () => {
    clearActivePatient();
    clearSelections();
    clearTrading();
    clearContract();
    clearActionPrompt();
    setCurrentEntities([]);
    setPrimaryPortraitFile(null);
    // Note: npcTracker and npcPositions are not reset (managed separately)
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // NPC Tracker
    npcTracker,
    getRecentNPCs,
    trackNPC,
    untrackNPC,
    isNPCRecent,

    // Current Entities
    currentEntities,
    setCurrentEntities,

    // Patient State
    activePatient,
    setActivePatient,
    clearActivePatient,
    patientDialogue,
    setPatientDialogue,
    currentPatient,
    setCurrentPatient,

    // Entity Selection
    selectedNPC,
    setSelectedNPC,
    selectedPatient,
    setSelectedPatient,
    clearSelections,

    // Trading
    tradingNPC,
    setTradingNPC,
    clearTrading,

    // Portrait
    primaryPortraitFile,
    setPrimaryPortraitFile,
    primaryNpcName,
    setPrimaryNpcName,

    // Contracts
    pendingContract,
    setPendingContract,
    clearContract,

    // Action Prompts
    pendingActionPrompt,
    setPendingActionPrompt,
    clearActionPrompt,
    actionPromptLoading,
    setActionPromptLoading,

    // Utilities
    resetNPCState,
  }), [
    npcTracker,
    currentEntities,
    activePatient,
    patientDialogue,
    currentPatient,
    selectedNPC,
    selectedPatient,
    tradingNPC,
    primaryPortraitFile,
    primaryNpcName,
    pendingContract,
    pendingActionPrompt,
    actionPromptLoading,
  ]);

  return (
    <NPCContext.Provider value={value}>
      {children}
    </NPCContext.Provider>
  );
}

/**
 * Hook to consume NPCContext
 *
 * @returns {Object} NPC and entity state and update functions
 * @throws {Error} If used outside of NPCProvider
 *
 * @example
 * function MyComponent() {
 *   const {
 *     activePatient,
 *     setActivePatient,
 *     trackNPC,
 *     npcPositions
 *   } = useNPCs();
 *
 *   const handlePatientSelect = (patient) => {
 *     setActivePatient(patient);
 *     trackNPC(patient.name);
 *   };
 *
 *   return <div>Active Patient: {activePatient?.name}</div>;
 * }
 */
export function useNPCs() {
  const context = useContext(NPCContext);

  if (!context) {
    throw new Error('useNPCs must be used within an NPCProvider');
  }

  return context;
}

/**
 * Available exports from context:
 *
 * NPC Tracker:
 * - npcTracker: NPCTracker instance
 * - getRecentNPCs(): Get list of recently tracked NPCs
 * - trackNPC(npcName): Add NPC to tracker
 * - untrackNPC(npcName): Remove NPC from tracker
 * - isNPCRecent(npcName): Check if NPC is recently tracked
 *
 * NOTE: NPC Positions are managed separately in GameContent via useNPCPositions hook
 * due to tight coupling with map system and frequent updates.
 *
 * Current Entities:
 * - currentEntities: Array of entities from latest turn
 * - setCurrentEntities(entities): Set current entities
 *
 * Patient State:
 * - activePatient: Currently active patient (in examination)
 * - setActivePatient(patient): Set active patient
 * - clearActivePatient(): Clear active patient and dialogue
 * - patientDialogue: Array of dialogue history with patient
 * - setPatientDialogue(dialogue): Set patient dialogue
 * - currentPatient: Patient being prescribed to
 * - setCurrentPatient(patient): Set current patient
 *
 * Entity Selection (for modals):
 * - selectedNPC: Selected NPC for NPC modal
 * - setSelectedNPC(npc): Set selected NPC
 * - selectedPatient: Selected patient for patient modal
 * - setSelectedPatient(patient): Set selected patient
 * - clearSelections(): Clear all entity selections
 *
 * Trading:
 * - tradingNPC: Current NPC being traded with
 * - setTradingNPC(npc): Set trading NPC
 * - clearTrading(): Clear trading state
 *
 * Portrait:
 * - primaryPortraitFile: LLM-selected portrait filename
 * - setPrimaryPortraitFile(filename): Set portrait file
 *
 * Contracts:
 * - pendingContract: Pending treatment/sale contract
 * - setPendingContract(contract): Set pending contract
 * - clearContract(): Clear contract state
 *
 * Utilities:
 * - resetNPCState(): Reset all NPC/entity state (for new game)
 */
