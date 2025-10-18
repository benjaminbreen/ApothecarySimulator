/**
 * ExitConfirmationCard - Confirmation prompt for leaving interior spaces
 *
 * Displays in narrative panel with isometric botica background
 * Two-button choice: Cancel / Leave
 */

import React from 'react';

export default function ExitConfirmationCard({
  exitData,
  onConfirm,
  onCancel,
  isDark = false
}) {
  if (!exitData) return null;

  const { locationName, location, gameTime } = exitData;

  // Determine if it's nighttime (7 PM - 7 AM)
  const isNightTime = () => {
    if (!gameTime) return false;

    // Parse time string (e.g., "8:00 AM", "7:30 PM")
    const timeMatch = gameTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return false;

    let hours = parseInt(timeMatch[1]);
    const period = timeMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    // Night is 19:00 (7 PM) to 6:59 (6:59 AM)
    return hours >= 19 || hours < 7;
  };

  const useNightImage = isDark || isNightTime();

  return (
    <div
      className="rounded-xl overflow-hidden animate-slide-in mb-4"
      style={{
        background: useNightImage
          ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.7)), url(/ui/isometricboticanight.png)'
          : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.5)), url(/ui/isometricboticaday.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backdropFilter: 'blur(8px) saturate(120%)',
        WebkitBackdropFilter: 'blur(8px) saturate(120%)',
        border: isDark ? '2px solid rgba(245, 158, 11, 0.4)' : '2px solid rgba(251, 191, 36, 0.5)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
          : '0 8px 32px rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{
          background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2))',
          borderColor: 'rgba(251, 191, 36, 0.4)'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚪</span>
          <h3 className="text-sm font-bold uppercase tracking-wider font-sans text-amber-100">
            Leaving the {locationName || 'Building'}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Main Question */}
        <div className="text-center">
          <p className="text-2xl font-serif font-bold text-white mb-3 drop-shadow-lg">
            Are you sure you want to leave this space?
          </p>
          <p className="text-base font-sans text-amber-100 drop-shadow-md">
            You will exit to the streets of {location || 'Mexico City'}
          </p>
        </div>

        {/* Location Info */}
        <div
          className="rounded-lg p-4 space-y-2"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-sans font-medium text-amber-200">Current Location:</span>
            <span className="text-sm font-sans font-bold text-white">{locationName || 'Interior Space'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-sans font-medium text-amber-200">Destination:</span>
            <span className="text-sm font-sans font-bold text-white">{location || 'Mexico City'} Streets</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="px-4 py-3 border-t flex gap-3"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          borderColor: 'rgba(251, 191, 36, 0.3)'
        }}
      >
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-lg font-sans font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:transform hover:scale-105"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.95), rgba(51, 65, 85, 0.9))'
              : 'linear-gradient(135deg, rgba(148, 163, 184, 0.95), rgba(100, 116, 139, 0.9))',
            color: '#ffffff',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Stay Here
        </button>

        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-lg font-sans font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.9))',
            color: isDark ? '#1c1917' : '#78350f',
            border: '1px solid rgba(251, 191, 36, 0.5)',
            boxShadow: '0 2px 8px rgba(251, 191, 36, 0.4)'
          }}
        >
          Leave the {locationName?.includes('Botica') ? 'Botica' : 'Building'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
