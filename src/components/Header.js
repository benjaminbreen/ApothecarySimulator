import React from 'react';
import DateTimeDropdown from './DateTimeDropdown';

const Header = ({
  location = 'Mexico City',
  time = '8:00 AM',
  date = 'August 22, 1680',
  onSaveGame,
  onSettings
}) => {

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
    <header className="flex-shrink-0 relative overflow-hidden bg-gradient-to-b from-parchment-50 to-white/70 dark:from-slate-900 dark:to-slate-950 border-b-2 border-parchment-400 dark:border-amber-600/30 transition-colors duration-300">
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10 dark:opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238a7149' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="max-w-screen-2xl mx-auto px-8 relative z-10" style={{ paddingTop: '5px', paddingBottom: '6px' }}>
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              {/* Ornamental icon */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-parchment-200 to-parchment-300 dark:from-amber-600/20 dark:to-amber-700/30 border-2 border-parchment-400 dark:border-amber-600/40 flex items-center justify-center shadow-md dark:shadow-glow-amber transition-all duration-300">
                <span className="text-xl">⚗️</span>
              </div>

              <div>
                <h1 className="font-bold text-ink-800 dark:text-amber-400 tracking-wide transition-colors duration-300" style={{
                  fontSize: '1.2rem',
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.1em',
                  lineHeight: '1.1',
                  textTransform: 'uppercase'
                }}>
                  The Apothecary
                </h1>
                <p className="text-sm text-ink-500 dark:text-slate-400 font-serif italic mt-0.5 leading-none transition-colors duration-300">A Medical History Educational Game</p>
              </div>
            </div>

            {/* Location & Time - More elegant */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-parchment-300 dark:border-slate-600 shadow-sm dark:shadow-dark-elevation-1 transition-all duration-300">
                <svg className="w-4 h-4 text-emerald-600 dark:text-amber-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-ink-800 dark:text-parchment-200 font-sans font-medium transition-colors duration-300">{location}</span>
              </div>
              <DateTimeDropdown
                time={time}
                date={date}
                weather={{
                  condition: 'Clear',
                  temperature: '72°F',
                  humidity: '45%',
                  wind: 'Light breeze'
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSettings}
              className="p-2 hover:bg-parchment-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 text-ink-600 dark:text-slate-400 hover:text-ink-900 dark:hover:text-amber-400 border border-transparent hover:border-parchment-300 dark:hover:border-slate-600"
              title="Settings"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
            <button
              onClick={handleSaveGame}
              className="px-4 py-2 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-amber-600 dark:to-amber-700 text-white dark:text-slate-900 rounded-xl hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-amber-500 dark:hover:to-amber-600 active:scale-[0.97] transition-all duration-200 text-sm font-semibold font-sans flex items-center gap-2 shadow-elevation-2 dark:shadow-glow-amber"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Game
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
