// InteractiveMapModal.jsx
// Full-screen modal for interactive map viewing

import React, { useEffect, useState } from 'react';
import MapRenderer from './MapRenderer';

/**
 * InteractiveMapModal - Full-screen modal wrapper for MapRenderer
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Object} props.scenario - Current scenario config
 * @param {string} props.currentLocation - Current location string
 * @param {string} props.currentMapId - Current map ID (e.g., 'botica-interior', 'mexico-city-center')
 * @param {Array} props.npcs - Array of NPC objects with position data
 * @param {Object} props.playerPosition - Player's current position {x, y}
 * @param {Function} props.onLocationChange - Callback when user clicks to change location
 * @param {string} props.theme - Theme mode: 'light' or 'dark' (auto-detected if not provided)
 */
export default function InteractiveMapModal({
  isOpen,
  onClose,
  scenario,
  currentLocation,
  currentMapId,
  npcs = [],
  playerPosition = null,
  onLocationChange,
  theme
}) {
  // Auto-detect dark mode from document if theme not explicitly provided
  const [currentTheme, setCurrentTheme] = useState(
    theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  );

  // Listen for theme changes
  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme);
      return;
    }

    // If no explicit theme prop, watch for class changes on document
    const observer = new MutationObserver(() => {
      setCurrentTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [theme]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-10 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-6xl h-[90vh] bg-[#fffcf5] dark:bg-slate-900 rounded-2xl border-2 border-emerald-600/30 dark:border-sky-400/30 shadow-2xl dark:shadow-sky-400/20 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="px-5 py-3 border-b-2 border-[#d4c5a9] dark:border-gray-700 flex justify-between items-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
          <div>
            <div className="font-['Cinzel'] text-base font-bold text-[#3d2817] dark:text-sky-400">
              Interactive Map
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-sans">
              {currentLocation}
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border-2 border-emerald-600/40 dark:border-sky-400/40 text-emerald-700 dark:text-sky-400 font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-sky-900/20 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Modal map content */}
        <div className="flex-1 overflow-hidden">
          <MapRenderer
            scenario={scenario}
            currentLocation={currentLocation}
            currentMapId={currentMapId}
            npcs={npcs}
            playerPosition={playerPosition}
            onLocationChange={(newLocation) => {
              // Close modal and trigger location change
              onClose();
              if (onLocationChange) {
                onLocationChange(newLocation);
              }
            }}
            onMapClick={() => {}} // Disable internal modal when already in modal
            theme={currentTheme}
          />
        </div>
      </div>
    </div>
  );
}
