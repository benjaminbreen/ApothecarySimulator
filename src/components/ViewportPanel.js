import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { MapRenderer } from '../features/map';
import StudyTab from './StudyTab';

const ViewportPanel = ({
  location = 'Mexico City',
  locationDetails = 'Botica de la Amargura',
  npcPresent = false,
  npcName = null,
  npcPortrait = null,
  npcData = null, // Full NPC data for patient modal
  onPortraitClick = null, // Callback when portrait is clicked
  onItemDropOnNPC = null, // Callback when item is dropped on NPC portrait
  weather = {
    condition: 'Clear',
    temperature: '72°F',
    humidity: '45%',
    wind: 'Light breeze'
  },
  scenario = null, // Scenario config for maps
  npcs = [], // NPCs to show on map
  playerPosition = null, // Player position for map rendering
  onLocationChange = null, // Callback when location changes
  onMapClick = null, // Callback when map is clicked to open modal
  discoveredBooks = [], // Books discovered during gameplay
  onBookClick = null, // Callback when book is clicked
  narrativeTurn = '', // Most recent narrative turn for Study tab
  primaryPortraitFile = null // Primary portrait filename for status detection
}) => {
  const defaultTab = npcPresent ? 'portrait' : 'map';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [hoveredTab, setHoveredTab] = useState(null);

  // Auto-detect dark mode from document
  const [currentTheme, setCurrentTheme] = useState(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // Debug logging
  React.useEffect(() => {
    console.log('ViewportPanel - UPDATED DESIGN');
    console.log('ViewportPanel - scenario:', scenario);
    console.log('ViewportPanel - has maps?', scenario?.maps);
    console.log('ViewportPanel - maps data:', scenario?.maps);
  }, [scenario]);

  React.useEffect(() => {
    if (npcPresent) {
      setActiveTab('portrait');
    }
  }, [npcPresent]);

  // Listen for theme changes on document.documentElement
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setCurrentTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const tabs = [
    { id: 'map', label: 'MAP' },
    { id: 'portrait', label: 'PORTRAIT' },
    { id: 'study', label: 'STUDY' }
  ];

  // Drop zone for inventory items on NPC portrait
  const [{ isOverNPC }, dropNPC] = useDrop(() => ({
    accept: 'INVENTORY_ITEM',
    drop: (item) => {
      if (onItemDropOnNPC && npcData) {
        onItemDropOnNPC(item, npcData);
      }
    },
    collect: (monitor) => ({
      isOverNPC: monitor.isOver(),
    }),
  }), [onItemDropOnNPC, npcData]);

  return (
    <div className="bg-white dark:bg-slate-800 shadow-elevation-2 dark:shadow-dark-elevation-2 flex flex-col border border-ink-200 dark:border-slate-600 transition-colors duration-300" style={{ borderRadius: '16px 16px 0 0' }}>

      {/* Tab Headers - Option A: Modern Minimal */}
      <div className="flex border-b-2 border-ink-100 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-300" style={{ borderRadius: '16px 16px 0 0' }}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isHovered = hoveredTab === tab.id;
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className="flex-1 px-6 py-2.5 font-sans font-bold text-xs tracking-widest transition-all duration-300 relative"
              style={{
                color: isActive
                  ? (document.documentElement.classList.contains('dark') ? '#fbbf24' : '#15803d')
                  : (document.documentElement.classList.contains('dark') ? '#a8a29e' : '#8a857d'),
                backgroundColor: isHovered && !isActive
                  ? (document.documentElement.classList.contains('dark') ? '#334155' : '#f8f8f7')
                  : (document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff'),
                borderRadius: isFirst ? '16px 0 0 0' : isLast ? '0 16px 0 0' : '0',
                letterSpacing: '0.15em'
              }}
            >
              {tab.label}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                  style={{
                    height: '2px',
                    background: document.documentElement.classList.contains('dark')
                      ? 'linear-gradient(to right, #fbbf24, #f59e0b, #fbbf24)'
                      : 'linear-gradient(to right, #22c55e, #16a34a, #22c55e)'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">

        {/* Map Tab - Interactive SVG Map */}
        {activeTab === 'map' && (
          <div className="flex flex-col animate-fade-in" style={{ height: '335px' }}>
            {scenario && scenario.maps ? (
              <div className="h-full">
                <MapRenderer
                  scenario={scenario}
                  currentLocation={locationDetails}
                  npcs={npcs}
                  playerPosition={playerPosition}
                  onLocationChange={onLocationChange}
                  onMapClick={onMapClick}
                  theme={currentTheme}
                />
              </div>
            ) : (
              // Fallback to original design if no map data
              <div className="h-full flex flex-col">
                <div className="relative h-36 bg-gradient-to-br from-parchment-100 via-parchment-50 to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 flex items-center justify-center border-b border-ink-100 dark:border-slate-600 transition-colors duration-300">
                  <div className="absolute top-2 left-2 w-5 h-5 border-l border-t border-ink-300 opacity-40"></div>
                  <div className="absolute top-2 right-2 w-5 h-5 border-r border-t border-ink-300 opacity-40"></div>
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-l border-b border-ink-300 opacity-40"></div>
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-r border-b border-ink-300 opacity-40"></div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-botanical-200 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-slower"></div>
                    <div className="relative text-6xl transition-transform duration-base hover:scale-110">
                      🏠
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3 flex-1">
                  <div className="border-b border-ink-200 dark:border-slate-600 pb-3 transition-colors duration-300">
                    <h3 className="font-serif text-base font-bold text-ink-900 dark:text-amber-400 uppercase tracking-wide mb-1 leading-tight transition-colors duration-300">
                      {locationDetails}
                    </h3>
                    <p className="text-sm text-ink-500 dark:text-parchment-300 font-sans tracking-wide transition-colors duration-300">
                      {location}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Portrait Tab */}
        {activeTab === 'portrait' && (
          <div className="h-full flex flex-col items-center justify-center p-5 animate-fade-in bg-gradient-to-br from-parchment-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">
            {npcPresent && npcPortrait ? (
              <div className="text-center">
                <button
                  ref={dropNPC}
                  onClick={() => onPortraitClick?.(npcData)}
                  className={`relative inline-block  mb-4 group cursor-pointer transition-transform duration-base hover:scale-105 ${isOverNPC ? 'scale-110 ring-4 ring-emerald-400' : ''}`}
                  disabled={!npcData}
                  title={isOverNPC ? 'Drop item to interact' : (npcData?.type === 'patient' ? 'Click to examine patient' : 'View character details')}
                >
                  {/* Decorative frame corners */}
                  <div className={`absolute -top-2 -left-2 w-7 h-7 border-l-2 border-t-2 transition-colors duration-300 ${isOverNPC ? 'border-emerald-500' : 'border-botanical-400 dark:border-amber-500 group-hover:border-botanical-600 dark:group-hover:border-amber-400'}`}></div>
                  <div className={`absolute -top-2 -right-2 w-7 h-7 border-r-2 border-t-2 transition-colors duration-300 ${isOverNPC ? 'border-emerald-500' : 'border-botanical-400 dark:border-amber-500 group-hover:border-botanical-600 dark:group-hover:border-amber-400'}`}></div>
                  <div className={`absolute -bottom-2 -left-2 w-7 h-7 border-l-2 border-b-2 transition-colors duration-300 ${isOverNPC ? 'border-emerald-500' : 'border-botanical-400 dark:border-amber-500 group-hover:border-botanical-600 dark:group-hover:border-amber-400'}`}></div>
                  <div className={`absolute -bottom-2 -right-2 w-7 h-7 border-r-2 border-b-2 transition-colors duration-300 ${isOverNPC ? 'border-emerald-500' : 'border-botanical-400 dark:border-amber-500 group-hover:border-botanical-600 dark:group-hover:border-amber-400'}`}></div>

                  {/* Hover overlay */}
                  <div className={`absolute inset-0 rounded-lg flex items-center justify-center transition-colors duration-base ${isOverNPC ? 'bg-emerald-600/20' : 'bg-botanical-600/0 group-hover:bg-botanical-600/10'}`}>
                    {npcData && !isOverNPC && (
                      <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-base drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {isOverNPC && (
                      <svg className="w-10 h-10 text-emerald-500 opacity-100 transition-opacity duration-base drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>

                  <div className="w-[220px] h-[181px] rounded-lg overflow-hidden border-4 border-white shadow-elevation-3 group-hover:shadow-elevation-4 transition-shadow">
                    <img src={npcPortrait} alt={npcName} className="w-full h-full object-cover" />
                  </div>
                </button>
                <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-amber-400 uppercase tracking-wide mb-0.5 transition-colors duration-300">{npcName}</h3>
                <p className="text-sm text-ink-400 dark:text-parchment-300 font-sans italic transition-colors duration-300">
                  {primaryPortraitFile === 'ui/boticaentrance.png' ? 'At the Door' : 'In Conversation'}
                </p>
                {npcData && (
                  <p className="text-xs font-sans mt-0.5 transition-colors duration-300 tracking-wide" style={{
                    color: 'var(--tw-prose-body)',
                    opacity: 0.7,
                    letterSpacing: '0.05em',
                    fontWeight: 500
                  }}>
                    {[
                      npcData.appearance?.gender || npcData.gender,
                      (npcData.appearance?.age || npcData.age) ? `Age ${npcData.appearance?.age || npcData.age}` : null,
                      npcData.social?.occupation || npcData.occupation
                    ].filter(Boolean).map((text, i) =>
                      i === 0 ? text.charAt(0).toUpperCase() + text.slice(1) : text
                    ).join(' · ')}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-parchment-200 to-parchment-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-elevation-2 dark:shadow-dark-elevation-2 mb-3 mx-auto transition-colors duration-300">
                  <svg className="w-10 h-10 text-ink-400 dark:text-parchment-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-sm text-ink-500 dark:text-parchment-300 font-sans uppercase tracking-wide transition-colors duration-300">No Visitors</p>
                <p className="text-xs text-ink-400 dark:text-parchment-400 font-sans mt-0.5 transition-colors duration-300">Portraits appear when someone arrives</p>
              </div>
            )}
          </div>
        )}

        {/* Study Tab */}
        {activeTab === 'study' && (
          <StudyTab
            discoveredBooks={discoveredBooks}
            onBookClick={onBookClick}
            theme={currentTheme}
            narrativeTurn={narrativeTurn}
            location={locationDetails}
          />
        )}

      </div>
    </div>
  );
};

export default ViewportPanel;
