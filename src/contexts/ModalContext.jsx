// ModalContext.jsx
// React Context for managing all modal open/close states
// Eliminates 40+ boolean useState calls in GamePage

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

/**
 * Initial modal states - all modals closed by default
 */
const INITIAL_MODAL_STATE = {
  // Core UI Modals
  journal: false,
  inventory: false,
  modernInventory: false,
  history: false,
  about: false,
  map: false,
  interactiveMap: false,
  diagnose: false,
  gameLog: false,
  settings: false,

  // Action Modals
  mixing: false,
  symptoms: false,
  prescribe: false,
  simplePrescribe: false,
  buy: false,
  offer: false,
  sleep: false,
  restDuration: false,
  eat: false,
  forage: false,
  pdf: false,

  // Game Event Modals
  endGame: false,
  contract: false,
  exitConfirmation: false,
  consumption: false,

  // Entity Modals
  patient: false,
  npc: false,
  item: false,
  equipment: false,
  poi: false,

  // System Modals
  reputation: false,
  skills: false,
  ledger: false,
  fastTravel: false,
  bloodletting: false,
  patientRoster: false,

  // Settings Modals
  narrationSettings: false,
  llmView: false,

  // Notifications
  levelUp: false,
  professionChoice: false,
  abilityUnlock: false,
  determinedPortrait: false,
};

/**
 * Context for modal state management
 */
const ModalContext = createContext(null);

/**
 * ModalProvider - Manages all modal open/close states
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function ModalProvider({ children }) {
  const [modals, setModals] = useState(INITIAL_MODAL_STATE);

  // Additional modal-related state (data, not just boolean)
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [detailSkillId, setDetailSkillId] = useState(null);
  const [offerRecipient, setOfferRecipient] = useState(null); // { name: string, context: string }
  const [simplePrescribeRecipient, setSimplePrescribeRecipient] = useState(null); // NPC name for simple prescribe

  /**
   * Open a modal by name
   * @param {string} modalName - Name of modal to open (e.g., 'journal', 'buy')
   */
  const openModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  /**
   * Close a modal by name
   * @param {string} modalName - Name of modal to close
   */
  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));

    // Clean up related state when closing certain modals
    if (modalName === 'pdf') {
      setSelectedPDF(null);
      setSelectedCitation(null);
    }
    if (modalName === 'skills') {
      setDetailSkillId(null);
    }
    if (modalName === 'offer') {
      setOfferRecipient(null);
    }
    if (modalName === 'simplePrescribe') {
      setSimplePrescribeRecipient(null);
    }
  }, []);

  /**
   * Toggle a modal's state
   * @param {string} modalName - Name of modal to toggle
   */
  const toggleModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  /**
   * Close all modals at once
   * Useful for navigation or critical state changes
   */
  const closeAllModals = useCallback(() => {
    setModals(INITIAL_MODAL_STATE);
    setSelectedPDF(null);
    setSelectedCitation(null);
    setDetailSkillId(null);
    setOfferRecipient(null);
    setSimplePrescribeRecipient(null);
  }, []);

  /**
   * Check if any modal is currently open
   * @returns {boolean} - True if at least one modal is open
   */
  const isAnyModalOpen = useMemo(() => {
    return Object.values(modals).some(isOpen => isOpen);
  }, [modals]);

  /**
   * Get list of currently open modals
   * @returns {string[]} - Array of open modal names
   */
  const openModals = useMemo(() => {
    return Object.entries(modals)
      .filter(([_, isOpen]) => isOpen)
      .map(([name, _]) => name);
  }, [modals]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // Modal states
    modals,

    // Actions
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,

    // Utilities
    isAnyModalOpen,
    openModals,

    // Modal-related data state
    selectedPDF,
    setSelectedPDF,
    selectedCitation,
    setSelectedCitation,
    detailSkillId,
    setDetailSkillId,
    offerRecipient,
    setOfferRecipient,
    simplePrescribeRecipient,
    setSimplePrescribeRecipient,
  }), [
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    isAnyModalOpen,
    openModals,
    selectedPDF,
    selectedCitation,
    detailSkillId,
    offerRecipient,
    simplePrescribeRecipient,
  ]);

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

/**
 * Hook to consume ModalContext
 *
 * @returns {Object} Modal state and control functions
 * @throws {Error} If used outside of ModalProvider
 *
 * @example
 * function MyComponent() {
 *   const { modals, openModal, closeModal } = useModals();
 *
 *   return (
 *     <div>
 *       <button onClick={() => openModal('journal')}>Open Journal</button>
 *       {modals.journal && <JournalModal onClose={() => closeModal('journal')} />}
 *     </div>
 *   );
 * }
 */
export function useModals() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }

  return context;
}

/**
 * Modal name constants for type safety
 * Use these to avoid typos when calling openModal/closeModal
 */
export const MODALS = {
  // Core UI
  JOURNAL: 'journal',
  INVENTORY: 'inventory',
  MODERN_INVENTORY: 'modernInventory',
  HISTORY: 'history',
  ABOUT: 'about',
  MAP: 'map',
  INTERACTIVE_MAP: 'interactiveMap',
  DIAGNOSE: 'diagnose',
  GAME_LOG: 'gameLog',
  SETTINGS: 'settings',

  // Actions
  MIXING: 'mixing',
  SYMPTOMS: 'symptoms',
  PRESCRIBE: 'prescribe',
  SIMPLE_PRESCRIBE: 'simplePrescribe',
  BUY: 'buy',
  OFFER: 'offer',
  SLEEP: 'sleep',
  REST_DURATION: 'restDuration',
  EAT: 'eat',
  FORAGE: 'forage',
  PDF: 'pdf',

  // Game Events
  END_GAME: 'endGame',
  CONTRACT: 'contract',
  EXIT_CONFIRMATION: 'exitConfirmation',
  CONSUMPTION: 'consumption',

  // Entities
  PATIENT: 'patient',
  NPC: 'npc',
  ITEM: 'item',
  EQUIPMENT: 'equipment',
  POI: 'poi',

  // System
  REPUTATION: 'reputation',
  SKILLS: 'skills',
  LEDGER: 'ledger',
  FAST_TRAVEL: 'fastTravel',
  BLOODLETTING: 'bloodletting',
  PATIENT_ROSTER: 'patientRoster',

  // Settings
  NARRATION_SETTINGS: 'narrationSettings',
  LLM_VIEW: 'llmView',

  // Notifications
  LEVEL_UP: 'levelUp',
  PROFESSION_CHOICE: 'professionChoice',
  ABILITY_UNLOCK: 'abilityUnlock',
  DETERMINED_PORTRAIT: 'determinedPortrait',
};

/**
 * Available exports from context:
 *
 * State:
 * - modals: Object with all modal states (e.g., { journal: false, buy: true })
 * - selectedPDF: Currently selected PDF path
 * - selectedCitation: Citation for current PDF
 * - detailSkillId: Selected skill ID for details modal
 *
 * Actions:
 * - openModal(modalName): Open a modal
 * - closeModal(modalName): Close a modal
 * - toggleModal(modalName): Toggle modal state
 * - closeAllModals(): Close all modals at once
 *
 * Setters (for modal data):
 * - setSelectedPDF(path): Set PDF to display
 * - setSelectedCitation(citation): Set citation text
 * - setDetailSkillId(id): Set skill to show details for
 *
 * Utilities:
 * - isAnyModalOpen: Boolean indicating if any modal is open
 * - openModals: Array of currently open modal names
 *
 * Constants:
 * - MODALS: Object with all modal name constants
 */
