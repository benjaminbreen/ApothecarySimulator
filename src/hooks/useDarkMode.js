/**
 * useDarkMode Hook
 *
 * Manages dark mode with three modes: 'light', 'dark', 'auto'
 * - light: Always light mode
 * - dark: Always dark mode
 * - auto: Smart auto mode (system preference → time-based fallback)
 *
 * Auto mode priority:
 * 1. System preference (prefers-color-scheme)
 * 2. Time-based (7pm-6am = dark)
 *
 * Usage:
 *   const { isDarkMode, mode, setMode, toggle } = useDarkMode();
 */

import { useEffect, useState } from 'react';
import { safeLocalStorage } from '../utils/safeLocalStorage';

/**
 * Check if it's night time (7pm - 6am)
 */
function isNightTime() {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6;
}

/**
 * Get system preference for dark mode
 */
function getSystemPreference() {
  if (typeof window === 'undefined') return false;

  // Check if browser supports prefers-color-scheme
  if (window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Fallback to time-based if not supported
  return isNightTime();
}

/**
 * Resolve what dark mode state should be based on mode
 */
function resolveTheme(mode) {
  if (mode === 'light') return false;
  if (mode === 'dark') return true;

  // Auto mode: check system preference, fallback to time
  return getSystemPreference();
}

export function useDarkMode() {
  // Mode: 'auto' | 'light' | 'dark'
  const [mode, setModeState] = useState(() => {
    const saved = safeLocalStorage.getItem('apothecary-theme-mode');
    return saved || 'auto'; // Default to auto
  });

  // Actual applied dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = safeLocalStorage.getItem('apothecary-theme-mode');
    return resolveTheme(saved || 'auto');
  });

  // Listen for system preference changes (when in auto mode)
  useEffect(() => {
    if (mode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      console.log('[useDarkMode] System preference changed:', e.matches ? 'dark' : 'light');
      setIsDarkMode(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers (Safari < 14)
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [mode]);

  // Update isDarkMode when mode changes
  useEffect(() => {
    const resolved = resolveTheme(mode);
    setIsDarkMode(resolved);

    const modeLabel = mode === 'auto'
      ? `Auto (${resolved ? 'Dark' : 'Light'})`
      : mode.charAt(0).toUpperCase() + mode.slice(1);

    console.log(`[useDarkMode] Mode: ${modeLabel}`);
  }, [mode]);

  // Apply dark class to document root
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
      console.log('[useDarkMode] Dark mode enabled');
    } else {
      root.classList.remove('dark');
      console.log('[useDarkMode] Light mode enabled');
    }
  }, [isDarkMode]);

  // Set mode and persist to localStorage
  const setMode = (newMode) => {
    if (!['auto', 'light', 'dark'].includes(newMode)) {
      console.warn('[useDarkMode] Invalid mode:', newMode);
      return;
    }

    setModeState(newMode);
    safeLocalStorage.setItem('apothecary-theme-mode', newMode);
    console.log('[useDarkMode] Mode changed to:', newMode);
  };

  // Legacy toggle function (cycles: auto → light → dark → auto)
  const toggle = () => {
    const nextMode = mode === 'auto' ? 'light' : mode === 'light' ? 'dark' : 'auto';
    setMode(nextMode);
  };

  // Legacy setDarkMode function (converts boolean to mode)
  const setDarkMode = (enabled) => {
    setMode(enabled ? 'dark' : 'light');
  };

  return {
    isDarkMode,      // Current applied state (boolean)
    mode,            // Current mode ('auto' | 'light' | 'dark')
    setMode,         // Set mode directly
    toggle,          // Cycle through modes
    setDarkMode      // Legacy: set via boolean
  };
}
