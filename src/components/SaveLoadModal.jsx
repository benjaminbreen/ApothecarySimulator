/**
 * Save/Load Modal Component
 * Manages multiple save slots (3 manual + 1 autosave)
 * Allows saving, loading, deleting, and exporting saves
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  listSaves,
  saveGame,
  loadGame,
  deleteSave,
  exportSave,
  formatSaveTimestamp,
  createSaveData
} from '../core/services/saveManager';
import { safeLocalStorage } from '../utils/safeLocalStorage';
import { exportEntitiesForSave } from '../core/entities/initializeEntities';
import npcPositionTracker from '../features/map/services/npcPositionTracker';
import { getTransactionManager } from '../core/systems/transactionManager';

export default function SaveLoadModal({
  isOpen,
  onClose,
  onLoadSave, // Callback when user loads a save
  // Current game data (for saving)
  gameState,
  playerSkills,
  conversationHistory,
  reputation,
  npcRelationships,
  discoveredBooks, // NEW v1.1.0: Discovered books from Study tab
  scenarioId // NEW v1.1.0: For gathering other save data
}) {
  const isDark = document.documentElement.classList.contains('dark');
  const [saves, setSaves] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [saveNameInput, setSaveNameInput] = useState('');
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // Load save list when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshSaveList();
    }
  }, [isOpen]);

  const refreshSaveList = () => {
    const saveList = listSaves();
    setSaves(saveList);
  };

  const handleSave = (slotKey, slotName) => {
    // Gather all game state for v1.1.0 save system
    const entities = exportEntitiesForSave();
    const npcPositions = npcPositionTracker.exportForSave();
    const transactionManager = getTransactionManager(scenarioId);
    const transactions = transactionManager.exportForSave();

    // Get calendar notes from localStorage (stored by DateTimeDropdown)
    const calendarNotesJSON = safeLocalStorage.getItem('apothecary_calendar_notes');
    const calendarNotes = calendarNotesJSON ? JSON.parse(calendarNotesJSON) : {};

    const saveData = createSaveData({
      gameState,
      playerSkills,
      conversationHistory,
      reputation,
      npcRelationships,
      // NEW v1.1.0 fields:
      entities,
      npcPositions,
      discoveredBooks: discoveredBooks || [],
      calendarNotes,
      transactions,
      slotName
    });

    const success = saveGame(slotKey, saveData);

    if (success) {
      refreshSaveList();
      setShowSavePrompt(false);
      setSaveNameInput('');
    }

    return success;
  };

  const handleLoad = (slotKey) => {
    const saveData = loadGame(slotKey);

    if (saveData) {
      onLoadSave(saveData);
      onClose();
    }
  };

  const handleDelete = (slotKey) => {
    if (window.confirm('Are you sure you want to delete this save? This cannot be undone.')) {
      deleteSave(slotKey);
      refreshSaveList();
    }
  };

  const handleExport = (slotKey) => {
    exportSave(slotKey);
  };

  const handleQuickSave = (slot) => {
    const slotName = saveNameInput || `Save ${slot.slotKey.slice(-1)}`;
    handleSave(slot.slotKey, slotName);
  };

  const handlePromptSave = (slot) => {
    setSelectedSlot(slot);
    setSaveNameInput(slot.slotName || `Save ${slot.slotKey.slice(-1)}`);
    setShowSavePrompt(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 backdrop-blur-lg z-[100] flex items-center justify-center p-4"
        style={{
          background: isDark
            ? 'linear-gradient(to br, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.90))'
            : 'linear-gradient(to br, rgba(245, 238, 223, 0.95), rgba(252, 250, 247, 0.90))'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.95))'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(252, 250, 247, 0.95))',
            border: isDark ? '2px solid rgba(251, 191, 36, 0.2)' : '2px solid rgba(139, 92, 46, 0.2)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-8 py-6 border-b"
            style={{
              background: isDark
                ? 'linear-gradient(to bottom, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))'
                : 'linear-gradient(to bottom, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.05))',
              borderColor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)'
            }}
          >
            <h2
              className="text-3xl font-bold font-serif"
              style={{ color: isDark ? '#fbbf24' : '#3d2f24' }}
            >
              Save / Load Game
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
            >
              Manage your save files
            </p>
          </div>

          {/* Save Slots */}
          <div className="p-8 overflow-y-auto max-h-[calc(85vh-180px)]">
            <div className="space-y-4">
              {saves.map((save) => (
                <div
                  key={save.slotKey}
                  className="rounded-xl p-6 border transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: save.isEmpty
                      ? isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(255, 255, 255, 0.5)'
                      : isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(139, 92, 46, 0.2)'
                  }}
                >
                  {save.isEmpty ? (
                    // Empty Slot
                    <div className="flex items-center justify-between">
                      <div>
                        <h3
                          className="text-lg font-bold font-serif"
                          style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
                        >
                          {save.isAutosave ? 'Auto-save' : `Save Slot ${save.slotKey.slice(-1)}`}
                        </h3>
                        <p
                          className="text-sm mt-1"
                          style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                        >
                          Empty
                        </p>
                      </div>
                      {!save.isAutosave && (
                        <button
                          onClick={() => handlePromptSave(save)}
                          className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                          style={{
                            background: isDark
                              ? 'linear-gradient(to right, #10b981, #059669)'
                              : 'linear-gradient(to right, #059669, #047857)',
                            color: '#ffffff'
                          }}
                        >
                          💾 Save Here
                        </button>
                      )}
                    </div>
                  ) : (
                    // Filled Slot
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3
                            className="text-xl font-bold font-serif mb-1"
                            style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                          >
                            {save.slotName}
                          </h3>
                          <p
                            className="text-xs"
                            style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                          >
                            {formatSaveTimestamp(save.timestamp)}
                          </p>
                        </div>
                        <div
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: save.isAutosave
                              ? 'rgba(168, 85, 247, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)',
                            color: save.isAutosave
                              ? isDark ? '#c084fc' : '#7e22ce'
                              : isDark ? '#34d399' : '#047857'
                          }}
                        >
                          {save.isAutosave ? 'AUTO' : `SLOT ${save.slotKey.slice(-1)}`}
                        </div>
                      </div>

                      {/* Save Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div
                          className="px-3 py-2 rounded-lg"
                          style={{
                            background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          <div
                            className="text-xs mb-1"
                            style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                          >
                            Level
                          </div>
                          <div
                            className="text-lg font-bold"
                            style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                          >
                            {save.metadata.playerLevel}
                          </div>
                        </div>

                        <div
                          className="px-3 py-2 rounded-lg"
                          style={{
                            background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          <div
                            className="text-xs mb-1"
                            style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                          >
                            Turn
                          </div>
                          <div
                            className="text-lg font-bold"
                            style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
                          >
                            {save.metadata.turnNumber}
                          </div>
                        </div>

                        <div
                          className="px-3 py-2 rounded-lg"
                          style={{
                            background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          <div
                            className="text-xs mb-1"
                            style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                          >
                            Wealth
                          </div>
                          <div
                            className="text-lg font-bold"
                            style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                          >
                            {save.metadata.wealth}
                          </div>
                        </div>

                        <div
                          className="px-3 py-2 rounded-lg"
                          style={{
                            background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          <div
                            className="text-xs mb-1"
                            style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                          >
                            Health
                          </div>
                          <div
                            className="text-lg font-bold"
                            style={{
                              color: save.metadata.health < 30
                                ? '#ef4444'
                                : save.metadata.health < 60
                                ? '#fbbf24'
                                : '#10b981'
                            }}
                          >
                            {save.metadata.health}
                          </div>
                        </div>
                      </div>

                      {/* Location & Date */}
                      <div
                        className="px-4 py-2 rounded-lg mb-4 text-sm"
                        style={{
                          background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                          color: isDark ? '#cbd5e1' : '#64748b'
                        }}
                      >
                        <div>📍 {save.metadata.location}</div>
                        <div className="mt-1">📅 {save.metadata.date}, {save.metadata.time}</div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoad(save.slotKey)}
                          className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                          style={{
                            background: isDark
                              ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                              : 'linear-gradient(to right, #2563eb, #1e40af)',
                            color: '#ffffff'
                          }}
                        >
                          📂 Load
                        </button>

                        {!save.isAutosave && (
                          <button
                            onClick={() => handlePromptSave(save)}
                            className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                            style={{
                              background: isDark
                                ? 'linear-gradient(to right, #10b981, #059669)'
                                : 'linear-gradient(to right, #059669, #047857)',
                              color: '#ffffff'
                            }}
                          >
                            💾 Overwrite
                          </button>
                        )}

                        <button
                          onClick={() => handleExport(save.slotKey)}
                          className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                          style={{
                            background: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(209, 213, 219, 0.5)',
                            color: isDark ? '#94a3b8' : '#64748b'
                          }}
                        >
                          📤
                        </button>

                        {!save.isAutosave && (
                          <button
                            onClick={() => handleDelete(save.slotKey)}
                            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: '#ef4444'
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-8 py-4 border-t flex justify-end"
            style={{
              background: isDark
                ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))'
                : 'linear-gradient(to bottom, rgba(245, 238, 223, 0.5), rgba(250, 248, 243, 0.3))',
              borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(209, 213, 219, 0.3)'
            }}
          >
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
              style={{
                background: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(209, 213, 219, 0.5)',
                color: isDark ? '#e2e8f0' : '#1e293b'
              }}
            >
              Close
            </button>
          </div>

          {/* Save Name Prompt */}
          <AnimatePresence>
            {showSavePrompt && selectedSlot && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center p-4"
                onClick={() => setShowSavePrompt(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="rounded-xl p-6 max-w-md w-full"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(252, 250, 247, 0.98))',
                    border: isDark ? '2px solid rgba(251, 191, 36, 0.3)' : '2px solid rgba(139, 92, 46, 0.3)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3
                    className="text-xl font-bold mb-4 font-serif"
                    style={{ color: isDark ? '#fbbf24' : '#3d2f24' }}
                  >
                    Name Your Save
                  </h3>

                  <input
                    type="text"
                    value={saveNameInput}
                    onChange={(e) => setSaveNameInput(e.target.value)}
                    placeholder="Enter save name..."
                    className="w-full px-4 py-2 rounded-lg mb-4 font-sans"
                    style={{
                      background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                      border: isDark ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(209, 213, 219, 0.5)',
                      color: isDark ? '#e2e8f0' : '#1e293b'
                    }}
                    autoFocus
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSavePrompt(false)}
                      className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm"
                      style={{
                        background: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(209, 213, 219, 0.5)',
                        color: isDark ? '#e2e8f0' : '#1e293b'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleQuickSave(selectedSlot)}
                      className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm"
                      style={{
                        background: isDark
                          ? 'linear-gradient(to right, #10b981, #059669)'
                          : 'linear-gradient(to right, #059669, #047857)',
                        color: '#ffffff'
                      }}
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
