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
      className="rounded-xl overflow-hidden animate-slide-in mb-4 shadow-lg"
      style={{
        background: useNightImage
          ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.65)), url(/ui/isometricboticanight.png)'
          : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.45)), url(/ui/isometricboticaday.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: isDark
          ? '1px solid rgba(251, 191, 36, 0.3)'
          : '1px solid rgba(45, 90, 74, 0.25)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(251, 191, 36, 0.1) inset'
          : '0 8px 32px rgba(45, 90, 74, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b backdrop-blur-sm"
        style={{
          background: isDark
            ? 'rgba(0, 0, 0, 0.4)'
            : 'rgba(255, 255, 255, 0.15)',
          borderColor: isDark
            ? 'rgba(251, 191, 36, 0.2)'
            : 'rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚪</span>
            <h3
              className="text-lg font-serif font-semibold"
              style={{
                color: isDark ? '#fbbf24' : '#ffffff',
                textShadow: isDark
                  ? '0 2px 8px rgba(0, 0, 0, 0.5)'
                  : '0 2px 12px rgba(0, 0, 0, 0.6)'
              }}
            >
              Leaving the {locationName || 'Building'}
            </h3>
          </div>
          {/* Close button */}
          <button
            onClick={onCancel}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              color: isDark ? '#fbbf24' : '#ffffff'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'}
            title="Cancel"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Main Question */}
        <div className="text-center mb-4">
          <p
            className="text-xl font-serif font-semibold mb-2"
            style={{
              color: isDark ? '#fcd34d' : '#ffffff',
              textShadow: isDark
                ? '0 2px 8px rgba(0, 0, 0, 0.6)'
                : '0 2px 12px rgba(0, 0, 0, 0.7)'
            }}
          >
            Are you sure you want to leave this space?
          </p>
          <p
            className="text-sm font-sans"
            style={{
              color: isDark ? '#fde68a' : '#f3f4f6',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)'
            }}
          >
            You will exit to {location || 'the streets of Mexico City'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="px-5 py-4 border-t flex gap-3 backdrop-blur-sm"
        style={{
          background: isDark
            ? 'rgba(0, 0, 0, 0.5)'
            : 'rgba(0, 0, 0, 0.3)',
          borderColor: isDark
            ? 'rgba(251, 191, 36, 0.2)'
            : 'rgba(255, 255, 255, 0.2)'
        }}
      >
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-lg font-sans font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02]"
          style={{
            background: isDark
              ? 'rgba(71, 85, 105, 0.8)'
              : 'rgba(248, 250, 252, 0.9)',
            color: isDark ? '#e2e8f0' : '#334155',
            border: isDark
              ? '1px solid rgba(148, 163, 184, 0.3)'
              : '1px solid rgba(203, 213, 225, 0.5)',
            boxShadow: isDark
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Stay Here
        </button>

        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-lg font-sans font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02]"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.9), rgba(245, 158, 11, 0.85))'
              : 'linear-gradient(135deg, #3d6b5a, #2d5a4a)',
            color: isDark ? '#1c1917' : '#ffffff',
            border: isDark
              ? '1px solid rgba(251, 191, 36, 0.4)'
              : '1px solid rgba(45, 90, 74, 0.3)',
            boxShadow: isDark
              ? '0 2px 12px rgba(251, 191, 36, 0.3)'
              : '0 2px 12px rgba(45, 90, 74, 0.3)'
          }}
        >
          Leave the {locationName?.includes('Botica') ? 'Botica' : 'Building'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
