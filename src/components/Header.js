import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DateTimeDropdown from './DateTimeDropdown';
import { RippleButton, RippleIconButton } from './RippleButton';
import { isSafari } from '../utils/browserDetection';
import { useGameState } from '../core/state/gameState';
import { useTooltip } from '../hooks/useTooltip';
import { useDarkMode } from '../hooks/useDarkMode';
import HelperTooltip from './HelperTooltip';

// Tooltip component matching ActionPanel style
const HeaderTooltip = ({ children, targetRef, show }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (show && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8, // 8px below button
        left: rect.left + rect.width / 2 // center of button
      });
    }
  }, [show, targetRef]);

  if (!show) return null;

  return createPortal(
    <div
      className="fixed pointer-events-none z-[9999] transition-opacity duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, 0)',
        opacity: show ? 1 : 0
      }}
    >
      <div
        className="px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap border backdrop-blur-sm"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 247, 0.95) 100%)',
          borderColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(100, 116, 139, 0.3)',
        }}
      >
        <div className="text-xs font-sans text-ink-700 dark:text-parchment-200" style={{ fontWeight: 500 }}>
          {children}
        </div>
        {/* Arrow pointing up */}
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: isDark ? '6px solid rgba(15, 23, 42, 0.98)' : '6px solid rgba(255, 255, 255, 0.98)',
          }}
        />
      </div>
    </div>,
    document.body
  );
};

/**
 * Truncate location string to 7-8 words and ensure city is always shown
 */
const formatLocationForDisplay = (location, city = 'Mexico City') => {
  if (!location) return city;

  // If location is just the city name, return it
  if (location === city || location.trim().toLowerCase() === city.toLowerCase()) {
    return city;
  }

  // Split location into words
  const words = location.split(' ');
  const maxWords = 8;

  // If location is short enough, return as-is
  if (words.length <= maxWords) {
    return location;
  }

  // Truncate to 6 words and add city
  const truncated = words.slice(0, 6).join(' ');
  return `${truncated}..., ${city}`;
};

const Header = ({
  location = 'Mexico City',
  time = '8:00 AM',
  date = 'August 22, 1680',
  onSaveGame,
  onSettings,
  onHelp,
  // Weather props
  weatherDescription = 'Clear',
  onWeatherClick,
  isWeatherViewActive = false,
  // Journal props
  onJournalClick,
  isJournalOpen = false,
  // Location props
  onLocationClick,
  // Condensed stats props
  showCondensedStats = false,
  health = 85,
  energy = 62,
  wealth = 11,
  // Time control
  onTimeChange,
  // v1.1.1: Calendar notes (per-slot storage)
  calendarNotes = {},
  onCalendarNotesChange = null,
  // Style prop for pointer events control
  style
}) => {
  // Safari performance optimization - disable expensive backdrop-filter
  const isSafariBrowser = isSafari();

  // Format location for display
  const displayLocation = formatLocationForDisplay(location);

  // Game state for tooltip
  const { gameState } = useGameState();

  // Dark mode hook
  const { isDarkMode, toggle } = useDarkMode();

  // State for header button tooltips
  const [showDarkModeTooltip, setShowDarkModeTooltip] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [showSettingsTooltip, setShowSettingsTooltip] = useState(false);
  const [showSaveTooltip, setShowSaveTooltip] = useState(false);
  const [showLocationTooltip, setShowLocationTooltip] = useState(false);
  const [showDateTimeTooltip, setShowDateTimeTooltip] = useState(false);
  const [showWeatherTooltip, setShowWeatherTooltip] = useState(false);
  const [showJournalTooltip, setShowJournalTooltip] = useState(false);

  // Refs for header buttons
  const darkModeToggleRef = useRef(null);
  const helpButtonRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const locationButtonRef = useRef(null);
  const dateTimeButtonRef = useRef(null);
  const weatherButtonRef = useRef(null);

  // Ref for journal button tooltip (also used for HelperTooltip)
  const journalButtonRef = useRef(null);

  // TOOLTIP 5: Journal button - shows on turn 2
  const journalTooltip = useTooltip('journal-button', {
    content: "Click to read auto-generated summaries of each turn and add your own notes",
    trigger: 'immediate',
    gameState,
    useTriggerSystem: true,
    dependencies: [gameState.turnNumber, onJournalClick]
  });

  const handleSaveGame = () => {
    if (onSaveGame) {
      onSaveGame();
    } else {
      console.log('Save game clicked');
    }
  };

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    } else {
      console.log('Settings clicked');
    }
  };

  return (
    <header
      className="flex-shrink-0 mb-0.5 relative overflow-hidden bg-gradient-to-b from-parchment-50 to-white/70 dark:from-slate-900 dark:to-slate-950 border-b-2 border-parchment-400 dark:border-amber-600/30 transition-colors duration-300"
      style={style}
    >
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10 dark:opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238a7149' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="max-w-screen-2xl mx-auto px-4  relative z-10" style={{ paddingTop: '5px', paddingBottom: '6px' }}>
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 ">
              {/* Ornamental icon */}
              <div className="flex-shrink-0 -ml-3  w-10 h-10 opacity-80 rounded-full bg-gradient-to-br from-parchment-200 to-parchment-300 dark:from-amber-600/20 dark:to-amber-700/30 border-2 border-parchment-400 dark:border-amber-600/40 flex items-center justify-center shadow-md dark:shadow-glow-amber transition-all duration-300">
                <span className="text-2xl">⚗️</span>
              </div>

              <div>
                <h1 className="font-bold  mt-1.5 -mb-1 text-ink-800 dark:text-amber-400 tracking-wide transition-colors duration-300" style={{
                  fontSize: '1.1rem',
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.05em',
                  lineHeight: '1',
                  textTransform: 'uppercase'
                }}>
                  Apothecary Simulator
                </h1>
                <p className="text-[17px]  text-ink-500 mt-1.5 mb-1.5 dark:text-slate-400 font-serif italic leading-none transition-colors duration-300">A Medical History Educational Game</p>
              </div>
            </div>

            {/* Location & Time - More elegant */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                ref={locationButtonRef}
                onMouseEnter={() => setShowLocationTooltip(true)}
                onMouseLeave={() => setShowLocationTooltip(false)}
                onClick={onLocationClick}
                className={`flex items-center ml-2 gap-2 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 ${isSafariBrowser ? '' : 'backdrop-blur-sm'} border border-parchment-300 dark:border-slate-600 shadow-sm dark:shadow-dark-elevation-1 transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer`}
                title={location !== displayLocation ? location : undefined}
              >
                <svg className="w-4 h-4 text-emerald-600 dark:text-amber-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-ink-800 dark:text-parchment-200 font-sans font-medium transition-colors duration-300">{displayLocation}</span>
              </button>
              <div
                ref={dateTimeButtonRef}
                onMouseEnter={() => setShowDateTimeTooltip(true)}
                onMouseLeave={() => setShowDateTimeTooltip(false)}
              >
                <DateTimeDropdown
                  time={time}
                  date={date}
                  weather={{
                    condition: 'Clear',
                    temperature: '72°F',
                    humidity: '45%',
                    wind: 'Light breeze'
                  }}
                  showCondensedStats={showCondensedStats}
                  health={health}
                  energy={energy}
                  wealth={wealth}
                  onTimeChange={onTimeChange}
                  calendarNotes={calendarNotes}
                  onCalendarNotesChange={onCalendarNotesChange}
                />
              </div>
              {/* Weather Badge - Safari: no backdrop-blur */}
              <button
                ref={weatherButtonRef}
                onMouseEnter={() => setShowWeatherTooltip(true)}
                onMouseLeave={() => setShowWeatherTooltip(false)}
                onClick={onWeatherClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isSafariBrowser ? '' : 'backdrop-blur-sm'} border shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                  isWeatherViewActive
                    ? 'bg-sky-500/80 border-sky-400 text-white'
                    : 'bg-white/60 dark:bg-slate-800/60 border-parchment-300 dark:border-slate-600 text-ink-800 dark:text-parchment-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span className="text-sm font-sans font-medium">{weatherDescription}</span>
              </button>
              {/* Journal Badge - Safari: no backdrop-blur */}
              {onJournalClick && (
                <button
                  ref={journalButtonRef}
                  onMouseEnter={() => setShowJournalTooltip(true)}
                  onMouseLeave={() => setShowJournalTooltip(false)}
                  onClick={onJournalClick}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isSafariBrowser ? '' : 'backdrop-blur-sm'} border shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                    isJournalOpen
                      ? 'bg-amber-500/80 dark:bg-amber-600/80 border-amber-400 dark:border-amber-500 text-white'
                      : 'bg-white/60 dark:bg-slate-800/60 border-parchment-300 dark:border-slate-600 text-ink-800 dark:text-parchment-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm font-sans font-medium">Journal</span>
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Dark/Light Mode Toggle */}
            <button
              ref={darkModeToggleRef}
              onMouseEnter={() => setShowDarkModeTooltip(true)}
              onMouseLeave={() => setShowDarkModeTooltip(false)}
              onClick={toggle}
              className="relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105"
              style={{
                background: isDarkMode
                  ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                  : 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                border: isDarkMode ? '2px solid rgba(251, 191, 36, 0.2)' : '2px solid rgba(100, 116, 139, 0.2)',
                boxShadow: isDarkMode
                  ? '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
                  : '0 2px 8px rgba(100, 116, 139, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
                focusRingColor: isDarkMode ? '#fbbf24' : '#64748b'
              }}
              aria-label="Toggle dark mode"
            >
              {/* Toggle Circle */}
              <span
                className={`inline-block h-5 w-5 transform rounded-full transition-all duration-300 ease-in-out ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                    : 'white',
                  boxShadow: isDarkMode
                    ? '0 2px 6px rgba(251, 191, 36, 0.6), 0 0 12px rgba(251, 191, 36, 0.3)'
                    : '0 1px 3px rgba(0, 0, 0, 0.2)'
                }}
              />

              {/* Icon inside toggle - shows opposite mode icon */}
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span
                  className={`text-xs transition-all duration-300 ${
                    isDarkMode ? 'opacity-0' : 'opacity-60'
                  }`}
                  style={{
                    transform: isDarkMode ? 'translateX(8px)' : 'translateX(-8px)'
                  }}
                >
                  ☀️
                </span>
                <span
                  className={`text-xs transition-all duration-300 ${
                    isDarkMode ? 'opacity-70' : 'opacity-0'
                  }`}
                  style={{
                    transform: isDarkMode ? 'translateX(8px)' : 'translateX(-8px)'
                  }}
                >
                  🌙
                </span>
              </span>
            </button>

            {onHelp && (
              <div
                ref={helpButtonRef}
                onMouseEnter={() => setShowHelpTooltip(true)}
                onMouseLeave={() => setShowHelpTooltip(false)}
              >
                <RippleIconButton
                  onClick={onHelp}
                  className="p-3.5 hover:bg-parchment-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 text-ink-600 dark:text-slate-400 hover:text-ink-900 dark:hover:text-amber-400 border border-transparent hover:border-parchment-300 dark:hover:border-slate-600"
                  aria-label="Help and content guide"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </RippleIconButton>
              </div>
            )}
            <div
              ref={settingsButtonRef}
              onMouseEnter={() => setShowSettingsTooltip(true)}
              onMouseLeave={() => setShowSettingsTooltip(false)}
            >
              <RippleIconButton
                onClick={handleSettings}
                className="p-3.5 hover:bg-parchment-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 text-ink-600 dark:text-slate-400 hover:text-ink-900 dark:hover:text-amber-400 border border-transparent hover:border-parchment-300 dark:hover:border-slate-600"
                aria-label="Open settings menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </RippleIconButton>
            </div>
            <div
              ref={saveButtonRef}
              onMouseEnter={() => setShowSaveTooltip(true)}
              onMouseLeave={() => setShowSaveTooltip(false)}
            >
              <RippleButton
                onClick={handleSaveGame}
                className="px-4 py-2 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-amber-600 dark:to-amber-700 text-white dark:text-slate-900 rounded-xl hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-amber-500 dark:hover:to-amber-600 active:scale-[0.97] transition-all duration-200 text-sm font-semibold font-sans flex items-center gap-2 shadow-elevation-2 dark:shadow-glow-amber"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </RippleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Helper Tooltip 5: Journal button */}
      {onJournalClick && (
        <HelperTooltip
          id="journal-button"
          content={journalTooltip.content}
          targetRef={journalButtonRef}
          show={journalTooltip.show}
          onDismiss={journalTooltip.dismiss}
          onDisableAll={journalTooltip.onDisableAll}
          position={journalTooltip.position}
        />
      )}

      {/* Header Button Tooltips */}
      <HeaderTooltip targetRef={locationButtonRef} show={showLocationTooltip}>
        View Map & Travel
      </HeaderTooltip>

      <HeaderTooltip targetRef={dateTimeButtonRef} show={showDateTimeTooltip}>
        View Calendar & Change Time
      </HeaderTooltip>

      <HeaderTooltip targetRef={weatherButtonRef} show={showWeatherTooltip}>
        Click to see weather background
      </HeaderTooltip>

      {onJournalClick && (
        <HeaderTooltip targetRef={journalButtonRef} show={showJournalTooltip && !journalTooltip.show}>
          View Turn Summaries & Notes
        </HeaderTooltip>
      )}

      <HeaderTooltip targetRef={darkModeToggleRef} show={showDarkModeTooltip}>
        {isDarkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
      </HeaderTooltip>

      {onHelp && (
        <HeaderTooltip targetRef={helpButtonRef} show={showHelpTooltip}>
          Help & Content Guide
        </HeaderTooltip>
      )}

      <HeaderTooltip targetRef={settingsButtonRef} show={showSettingsTooltip}>
        Settings
      </HeaderTooltip>

      <HeaderTooltip targetRef={saveButtonRef} show={showSaveTooltip}>
        Save Game
      </HeaderTooltip>
    </header>
  );
};

// Memoize to prevent unnecessary re-renders (ALL BROWSERS performance optimization)
export default React.memo(Header);
