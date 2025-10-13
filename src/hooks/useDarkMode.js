/**
 * useDarkMode Hook
 *
 * Manages dark mode state with localStorage persistence.
 * Applies .dark class to document root for Tailwind dark mode.
 *
 * Usage:
 *   const { isDarkMode, toggle } = useDarkMode();
 */

import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first for saved preference
    const saved = localStorage.getItem('apothecary-theme');
    if (saved) {
      return saved === 'dark';
    }

    // Default to light mode (maintains historical aesthetic)
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('apothecary-theme', 'dark');
      console.log('[useDarkMode] Dark mode enabled');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('apothecary-theme', 'light');
      console.log('[useDarkMode] Light mode enabled');
    }
  }, [isDarkMode]);

  const toggle = () => {
    setIsDarkMode(prev => !prev);
  };

  const setDarkMode = (enabled) => {
    setIsDarkMode(enabled);
  };

  return {
    isDarkMode,
    toggle,
    setDarkMode
  };
}
