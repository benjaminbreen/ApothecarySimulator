/**
 * LocationDropdown - Dropdown menu showing nearby locations
 * Appears when user clicks "Go somewhere" chip
 */

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

export function LocationDropdown({
  show,
  onClose,
  onSelectLocation,
  nearbyLocations = [],
  targetRef
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const isDark = document.documentElement.classList.contains('dark');

  // Position dropdown above the chip
  useEffect(() => {
    if (show && targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 10, // 10px above the chip
        left: rect.left,
      });
    }
  }, [show, targetRef]);

  // Close on outside click
  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          targetRef?.current && !targetRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose, targetRef]);

  if (!show) return null;

  const handleLocationClick = (location) => {
    onSelectLocation(location);
    onClose();
  };

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[10000] transition-opacity duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-100%)',
        opacity: show ? 1 : 0,
      }}
    >
      <div
        className="rounded-xl shadow-2xl border overflow-hidden backdrop-blur-sm min-w-[280px]"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 247, 0.95) 100%)',
          borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(228, 218, 195, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-parchment-300 dark:border-slate-600">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="w-4 h-4 text-emerald-600 dark:text-amber-500" />
            <span className="text-sm font-semibold text-ink-900 dark:text-parchment-100 font-sans">
              Nearby Locations
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 dark:text-slate-400 hover:text-ink-700 dark:hover:text-parchment-200 transition-colors"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Location list */}
        <div className="py-1 max-h-[300px] overflow-y-auto">
          {nearbyLocations.length > 0 ? (
            nearbyLocations.map((location, idx) => (
              <button
                key={idx}
                onClick={() => handleLocationClick(location)}
                className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-start gap-3 group"
              >
                <FaMapMarkerAlt className="w-3.5 h-3.5 text-emerald-500 dark:text-amber-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink-900 dark:text-parchment-100 group-hover:text-emerald-700 dark:group-hover:text-amber-400 transition-colors">
                    {location.name}
                  </div>
                  {location.distance && (
                    <div className="text-xs text-ink-500 dark:text-slate-400 mt-0.5">
                      {location.distance} steps {location.direction}
                    </div>
                  )}
                  {location.type && (
                    <div className="text-xs text-emerald-600 dark:text-amber-500 mt-0.5 italic">
                      {location.type}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-ink-500 dark:text-slate-400">
              No nearby locations found
            </div>
          )}
        </div>
      </div>

      {/* Arrow pointing down */}
      <div
        className="absolute top-full left-6 w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: isDark ? '8px solid rgba(15, 23, 42, 0.98)' : '8px solid rgba(255, 255, 255, 0.98)',
        }}
      />
    </div>,
    document.body
  );
}

export default LocationDropdown;
