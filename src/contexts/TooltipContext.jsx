/**
 * Tooltip Context
 *
 * Manages helper tooltips for first-time users with:
 * - Progressive disclosure (show tooltips one at a time)
 * - localStorage persistence (remembers what user has seen)
 * - Global enable/disable (respects user preferences)
 * - Queue system (prevents tooltip spam)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getJSON, setJSON } from '../utils/safeLocalStorage';

const TooltipContext = createContext(null);

const STORAGE_KEY = 'apothecary_tooltips';
const DEFAULT_STATE = {
  enabled: true,
  seen: [],
  dismissedAt: null
};

export function TooltipProvider({ children }) {
  // Core state
  const [tooltipsEnabled, setTooltipsEnabled] = useState(true);
  const [seenTooltips, setSeenTooltips] = useState(new Set());
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [tooltipQueue, setTooltipQueue] = useState([]);
  const [registeredTooltips, setRegisteredTooltips] = useState(new Map());

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = getJSON(STORAGE_KEY, DEFAULT_STATE);

    console.log('[TooltipContext] Loading saved state:', saved);

    setTooltipsEnabled(saved.enabled);
    setSeenTooltips(new Set(saved.seen || []));
  }, []);

  // Save state to localStorage whenever it changes
  const saveState = useCallback((enabled, seen) => {
    const state = {
      enabled,
      seen: Array.from(seen),
      dismissedAt: !enabled ? new Date().toISOString() : null
    };

    console.log('[TooltipContext] Saving state:', state);
    setJSON(STORAGE_KEY, state);
  }, []);

  // Register a tooltip configuration
  const registerTooltip = useCallback((id, config) => {
    setRegisteredTooltips(prev => {
      const updated = new Map(prev);
      updated.set(id, config);
      return updated;
    });
  }, []);

  // Unregister a tooltip (cleanup)
  const unregisterTooltip = useCallback((id) => {
    setRegisteredTooltips(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  }, []);

  // Show a tooltip (adds to queue if another tooltip is visible)
  const showTooltip = useCallback((id) => {
    // Don't show if disabled or already seen
    if (!tooltipsEnabled || seenTooltips.has(id)) {
      console.log('[TooltipContext] Skipping tooltip:', id, {
        enabled: tooltipsEnabled,
        seen: seenTooltips.has(id)
      });
      return false;
    }

    // If another tooltip is showing, add to queue
    if (currentTooltip && currentTooltip !== id) {
      console.log('[TooltipContext] Queueing tooltip:', id);
      setTooltipQueue(prev => [...prev, id]);
      return false;
    }

    console.log('[TooltipContext] Showing tooltip:', id);
    setCurrentTooltip(id);
    return true;
  }, [tooltipsEnabled, seenTooltips, currentTooltip]);

  // Dismiss a tooltip and mark as seen
  const dismissTooltip = useCallback((id) => {
    console.log('[TooltipContext] Dismissing tooltip:', id);

    // Mark as seen
    const updatedSeen = new Set(seenTooltips);
    updatedSeen.add(id);
    setSeenTooltips(updatedSeen);

    // Clear current tooltip
    setCurrentTooltip(null);

    // Save to localStorage
    saveState(tooltipsEnabled, updatedSeen);

    // Show next in queue after a short delay
    setTimeout(() => {
      setTooltipQueue(prev => {
        if (prev.length > 0) {
          const [next, ...rest] = prev;
          console.log('[TooltipContext] Showing next tooltip from queue:', next);
          setCurrentTooltip(next);
          return rest;
        }
        return prev;
      });
    }, 500); // Small delay between tooltips
  }, [seenTooltips, tooltipsEnabled, saveState]);

  // Disable all tooltips (user preference)
  const disableAllTooltips = useCallback(() => {
    console.log('[TooltipContext] Disabling all tooltips');

    setTooltipsEnabled(false);
    setCurrentTooltip(null);
    setTooltipQueue([]);

    // Save to localStorage
    saveState(false, seenTooltips);
  }, [seenTooltips, saveState]);

  // Enable tooltips (from settings)
  const enableTooltips = useCallback(() => {
    console.log('[TooltipContext] Enabling tooltips');

    setTooltipsEnabled(true);

    // Save to localStorage
    saveState(true, seenTooltips);
  }, [seenTooltips, saveState]);

  // Reset tooltips (clear seen list - from settings)
  const resetTooltips = useCallback(() => {
    console.log('[TooltipContext] Resetting tooltips');

    const emptySet = new Set();
    setSeenTooltips(emptySet);
    setCurrentTooltip(null);
    setTooltipQueue([]);

    // Save to localStorage
    saveState(tooltipsEnabled, emptySet);
  }, [tooltipsEnabled, saveState]);

  // Check if a tooltip should be shown (for external use)
  const shouldShow = useCallback((id) => {
    return tooltipsEnabled && !seenTooltips.has(id) && currentTooltip !== id;
  }, [tooltipsEnabled, seenTooltips, currentTooltip]);

  const value = {
    // State
    tooltipsEnabled,
    seenTooltips,
    currentTooltip,
    registeredTooltips,

    // Methods
    registerTooltip,
    unregisterTooltip,
    showTooltip,
    dismissTooltip,
    disableAllTooltips,
    enableTooltips,
    resetTooltips,
    shouldShow,
  };

  return (
    <TooltipContext.Provider value={value}>
      {children}
    </TooltipContext.Provider>
  );
}

// Hook for using tooltip context
export function useTooltipContext() {
  const context = useContext(TooltipContext);

  if (!context) {
    throw new Error('useTooltipContext must be used within TooltipProvider');
  }

  return context;
}
