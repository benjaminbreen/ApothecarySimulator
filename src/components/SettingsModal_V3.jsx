/**
 * Settings Modal V3 - Refined Alchemical Light Mode
 *
 * Design philosophy:
 * - Light parchment aesthetic (aged manuscript)
 * - Modern typography with subtle historical touches
 * - Elegant serif for headings, clean sans serif for content
 * - Refined color palette: sepia, amber, warm browns
 */

import React, { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import TestSuitePanel from './TestSuitePanel';
import PortraitTestPanel from './PortraitTestPanel';
import ProfessionTestPanel from './ProfessionTestPanel';

const GAME_VERSION = '0.1.0';

export default function SettingsModal_V3({ isOpen, onClose, scenario, gameState, setGameState, health: propsHealth, energy: propsEnergy, onLoadTestPatient, onLoadPrescriptionTest }) {
  const [activeSection, setActiveSection] = useState('game');
  const [textSize, setTextSize] = useState('medium');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Dark mode hook
  const { isDarkMode, toggle } = useDarkMode();

  if (!isOpen) return null;

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* Backdrop */}
      <div className="fixed inset-0 bg-stone-900/40 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-300">

        {/* Modal Container */}
        <div className="relative w-full max-w-7xl h-[95vh] rounded-lg overflow-hidden transition-all duration-300"
          style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)'
              : 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 50%, #faf8f3 100%)',
            boxShadow: isDarkMode
              ? '0 12px 48px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(251, 191, 36, 0.1)'
              : '0 8px 40px rgba(92, 74, 58, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
          }}
        >

          {/* Subtle Border Accent */}
          <div className="absolute inset-0 pointer-events-none transition-all duration-300" style={{
            border: isDarkMode
              ? '1px solid rgba(251, 191, 36, 0.2)'
              : '1px solid rgba(139, 92, 46, 0.15)',
            borderRadius: '0.5rem'
          }} />

          {/* Header */}
          <div className="relative px-8 py-4 border-b flex items-center justify-between transition-all duration-300"
            style={{
              background: isDarkMode
                ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))'
                : 'linear-gradient(to bottom, rgba(245, 238, 223, 0.5), rgba(250, 248, 243, 0.3))',
              borderColor: isDarkMode
                ? 'rgba(251, 191, 36, 0.15)'
                : 'rgba(139, 92, 46, 0.15)'
            }}
          >
            <div>
              <h1 className="text-4xl tracking-tight transition-colors duration-300"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 700,
                  color: isDarkMode ? '#fbbf24' : '#3d2f24',
                  letterSpacing: '-0.02em'
                }}
              >
                Settings
              </h1>
              <p className="text-xs font-medium mt-0.5 transition-colors duration-300"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: isDarkMode ? '#94a3b8' : '#8b7a6a',
                  letterSpacing: '0.02em'
                }}
              >
                Configure preferences • Review statistics
              </p>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-3 mr-4">
              <span
                className="text-xs font-medium transition-colors select-none"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: isDarkMode ? '#fbbf24' : '#8b7a6a',
                  letterSpacing: '0.02em'
                }}
              >
                {isDarkMode ? '🌙 Night Mode' : '☀️ Day Mode'}
              </span>
              <button
                onClick={toggle}
                className="relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  border: '2px solid rgba(139, 92, 46, 0.2)',
                  boxShadow: isDarkMode
                    ? '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
                    : '0 2px 8px rgba(251, 191, 36, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
                  focusRingColor: isDarkMode ? '#fbbf24' : '#8b5c2e'
                }}
                aria-label="Toggle dark mode"
                title={isDarkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
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
                      : '0 1px 3px rgba(0, 0, 0, 0.3)'
                  }}
                />

                {/* Icon inside toggle - shows opposite mode icon */}
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className={`text-xs transition-all duration-300 ${
                      isDarkMode ? 'opacity-0' : 'opacity-100'
                    }`}
                    style={{
                      marginLeft: isDarkMode ? '-12px' : '12px',
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    ☀️
                  </span>
                  <span
                    className={`text-xs transition-all duration-300 absolute ${
                      isDarkMode ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      marginLeft: isDarkMode ? '-12px' : '12px',
                      color: '#fbbf24'
                    }}
                  >
                    🌙
                  </span>
                </span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold transition-all duration-300"
              style={{
                fontFamily: "'Inter', sans-serif",
                background: isDarkMode ? '#334155' : '#5c4a3a',
                color: isDarkMode ? '#fbbf24' : 'white',
                borderRadius: '4px',
                border: isDarkMode
                  ? '1px solid rgba(251, 191, 36, 0.3)'
                  : '1px solid rgba(92, 74, 58, 0.3)',
                boxShadow: isDarkMode
                  ? '0 2px 4px rgba(0, 0, 0, 0.4)'
                  : '0 2px 4px rgba(92, 74, 58, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDarkMode ? '#475569' : '#4a3a2d';
                e.target.style.boxShadow = isDarkMode
                  ? '0 4px 8px rgba(0, 0, 0, 0.6)'
                  : '0 4px 8px rgba(92, 74, 58, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = isDarkMode ? '#334155' : '#5c4a3a';
                e.target.style.boxShadow = isDarkMode
                  ? '0 2px 4px rgba(0, 0, 0, 0.4)'
                  : '0 2px 4px rgba(92, 74, 58, 0.2)';
              }}
            >
              Close
            </button>
          </div>

          {/* Main Content */}
          <div className="flex h-[calc(100%-120px)]">

            {/* Sidebar Navigation */}
            <div className="w-64 p-6 transition-all duration-300"
              style={{
                background: isDarkMode
                  ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))'
                  : 'linear-gradient(to bottom, rgba(235, 225, 210, 0.6), rgba(240, 232, 218, 0.8))',
                borderRight: isDarkMode
                  ? '1px solid rgba(251, 191, 36, 0.15)'
                  : '1px solid rgba(139, 92, 46, 0.15)'
              }}
            >
              <nav className="space-y-2">
                {[
                  { id: 'game', label: 'Overview', icon: '⚗' },
                  { id: 'progress', label: 'Progress', icon: '◆' },
                  { id: 'display', label: 'Display', icon: '◇' },
                  { id: 'commands', label: 'Commands', icon: '⌘' },
                  { id: 'dev', label: 'Dev Panel', icon: '🔧' },
                  { id: 'about', label: 'About', icon: '○' }
                ].map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded transition-all duration-200`}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.875rem',
                      fontWeight: activeSection === section.id ? 600 : 500,
                      color: isDarkMode
                        ? (activeSection === section.id ? '#fbbf24' : '#94a3b8')
                        : (activeSection === section.id ? '#3d2f24' : '#6b5d52'),
                      background: activeSection === section.id
                        ? (isDarkMode
                          ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))'
                          : 'linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(245, 158, 11, 0.08))')
                        : 'transparent',
                      border: activeSection === section.id
                        ? (isDarkMode
                          ? '1px solid rgba(251, 191, 36, 0.3)'
                          : '1px solid rgba(217, 119, 6, 0.25)')
                        : '1px solid transparent',
                      boxShadow: activeSection === section.id
                        ? (isDarkMode
                          ? '0 2px 8px rgba(251, 191, 36, 0.2)'
                          : '0 2px 8px rgba(217, 119, 6, 0.1)')
                        : 'none'
                    }}
                  >
                    <span className="mr-3 opacity-60">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8" style={{
              background: isDarkMode
                ? 'rgba(15, 23, 42, 0.4)'
                : 'rgba(248, 243, 233, 0.3)'
            }}>

              {activeSection === 'game' && (
                <GameSection scenario={scenario} gameState={gameState} health={propsHealth} energy={propsEnergy} />
              )}

              {activeSection === 'progress' && (
                <ProgressSection gameState={gameState} />
              )}

              {activeSection === 'display' && (
                <DisplaySection
                  textSize={textSize}
                  setTextSize={setTextSize}
                  animationsEnabled={animationsEnabled}
                  setAnimationsEnabled={setAnimationsEnabled}
                />
              )}

              {activeSection === 'commands' && (
                <CommandsSection />
              )}

              {activeSection === 'dev' && (
                <DevSection
                  onLoadTestPatient={onLoadTestPatient}
                  onClose={onClose}
                  gameState={gameState}
                  setGameState={setGameState}
                />
              )}

              {activeSection === 'about' && (
                <AboutSection />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 px-8 py-4 flex justify-between items-center"
            style={{
              background: isDarkMode
                ? 'linear-gradient(to top, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.6))'
                : 'linear-gradient(to top, rgba(235, 225, 210, 0.9), rgba(245, 238, 223, 0.6))',
              borderTop: isDarkMode
                ? '1px solid rgba(251, 191, 36, 0.15)'
                : '1px solid rgba(139, 92, 46, 0.15)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
              <span style={{
                fontFamily: "'Inter', sans-serif",
                color: isDarkMode ? '#94a3b8' : '#6b5d52',
                fontSize: '0.8125rem',
                fontWeight: 500
              }}>
                Game Active
              </span>
            </div>

            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: isDarkMode ? '#94a3b8' : '#8b7a6a',
              fontSize: '0.75rem'
            }}>
              v{GAME_VERSION} • The Apothecary
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// Section Components
function GameSection({ scenario, gameState, health: propsHealth, energy: propsEnergy }) {
  const { isDarkMode } = useDarkMode();
  const health = propsHealth ?? 100;
  const energy = propsEnergy ?? 100;

  return (
    <div className="space-y-3">
      

      {/* Header with Resources */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-shrink-0">
          <h2 className="text-2xl mb-1 leading-tight" style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
            color: isDarkMode ? '#fbbf24' : '#3d2f24',
            letterSpacing: '-0.02em'
          }}>
            Current Session
          </h2>
          <p className="text-xs font-medium" style={{
            fontFamily: "'Inter', sans-serif",
            color: isDarkMode ? '#a8a29e' : '#8b7a6a',
            letterSpacing: '0.01em'
          }}>
            Active game information
          </p>
        </div>

        {/* Character Resources - Compact Right Side */}
        <div className="grid grid-cols-2 gap-2 min-w-[300px]">
          <ResourceBar label="Health" value={health} max={100} color="rose" compact />
          <ResourceBar label="Energy" value={energy} max={100} color="amber" compact />
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Turn" value={gameState?.turnNumber || 1} />
        <StatCard label="Wealth" value={`${gameState?.wealth?.toFixed(0) || '0'} ${scenario?.currency?.substring(0,1).toUpperCase() || 'Reales'}`} />
        <StatCard label="Items" value={gameState?.inventory?.length || 0} />
        <StatCard label="Compounds" value={gameState?.compounds?.length || 0} />
      </div>

      {/* Scenario Card */}
      <div className="rounded-lg p-5"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
            : 'linear-gradient(135deg, rgba(250, 245, 235, 0.95), rgba(245, 238, 223, 0.9))',
          border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(139, 92, 46, 0.2)',
          boxShadow: isDarkMode
            ? '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(251, 191, 36, 0.1)'
            : '0 4px 12px rgba(92, 74, 58, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{
              fontFamily: "'Inter', sans-serif",
              color: isDarkMode ? '#a8a29e' : '#8b7a6a',
              letterSpacing: '0.08em'
            }}>
              Scenario
            </p>
            <h3 className="text-3xl mb-2 leading-tight" style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 600,
              color: isDarkMode ? '#fbbf24' : '#3d2f24',
              letterSpacing: '-0.01em'
            }}>
              {scenario?.name || '1680 Mexico City'}
            </h3>
            <div className="flex gap-2">
              <Badge text="Historical RPG" />
              <Badge text="Colonial Era" color="amber" />
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{
              fontFamily: "'Inter', sans-serif",
              color: isDarkMode ? '#a8a29e' : '#8b7a6a',
              letterSpacing: '0.08em'
            }}>
              Character
            </p>
            <p className="text-xl" style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
              color: isDarkMode ? '#fcd34d' : '#3d2f24'
            }}>
              {scenario?.character?.name || 'Maria de Lima'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-5 pt-5" style={{
          borderTop: isDarkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(139, 92, 46, 0.15)'
        }}>
          <InfoRow label="Location" value={gameState?.location || 'Botica de la Amargura'} />
          <InfoRow label="Date" value={gameState?.date || 'August 22, 1680'} />
          <InfoRow label="Time" value={gameState?.time || '8:00 AM'} />
          <InfoRow label="Save Type" value="Auto-save (LocalStorage)" />
        </div>
      </div>

      {/* Mini Progress Overview */}
      <div>
        <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{
          fontFamily: "'Inter', sans-serif",
          color: isDarkMode ? '#fbbf24' : '#5c4a3a',
          letterSpacing: '0.08em'
        }}>
          Quick Progress
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <MiniProgressCard
            title="Methods"
            current={gameState?.unlockedMethods?.length || 2}
            max={6}
            color="#3b82f6"
          />
          <MiniProgressCard
            title="Quests"
            current={Array.isArray(gameState?.quests) ? gameState.quests.filter(q => q.completed).length : 0}
            max={10}
            color="#10b981"
          />
          <MiniProgressCard
            title="Patients"
            current={0}
            max={50}
            color="#ef4444"
          />
          <MiniProgressCard
            title="Story"
            current={Math.min((gameState?.turnNumber || 1) * 2, 100)}
            max={100}
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Detailed Session Information */}
      <div className="rounded-lg p-5"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
            : 'linear-gradient(135deg, rgba(250, 245, 235, 0.95), rgba(245, 238, 223, 0.9))',
          border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(139, 92, 46, 0.2)',
          boxShadow: isDarkMode
            ? '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(251, 191, 36, 0.1)'
            : '0 4px 12px rgba(92, 74, 58, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
        }}
      >
        <h3 className="text-lg mb-4 font-bold" style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: isDarkMode ? '#fbbf24' : '#3d2f24'
        }}>
          Session Details
        </h3>

        <div className="grid grid-cols-3 gap-6">
          {/* Column 1: Character & Scenario */}
          <div className="space-y-3">
            <InfoRow label="Scenario" value={scenario?.name || '1680 Mexico City'} />
            <InfoRow label="Character" value={scenario?.character?.name || 'Maria de Lima'} />
            <InfoRow label="Occupation" value="Converso Apothecary" />
            <InfoRow label="Game Mode" value="Story Mode" />
          </div>

          {/* Column 2: Location & Time */}
          <div className="space-y-3">
            <InfoRow label="Location" value={gameState?.location || 'Botica de la Amargura'} />
            <InfoRow label="Date" value={gameState?.date || 'August 22, 1680'} />
            <InfoRow label="Time of Day" value={gameState?.time || '8:00 AM'} />
            <InfoRow label="Session Duration" value={`${gameState?.turnNumber || 1} turns`} />
          </div>

          {/* Column 3: System Info */}
          <div className="space-y-3">
            <InfoRow label="Save System" value="Auto-save" />
            <InfoRow label="Storage" value="LocalStorage" />
            <InfoRow label="Version" value="v0.1.0" />
            <InfoRow label="Build" value="The Apothecary" />
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="mt-5 pt-5 grid grid-cols-4 gap-4" style={{
          borderTop: isDarkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(139, 92, 46, 0.15)'
        }}>
          <InfoRow label="Methods Unlocked" value={`${gameState?.unlockedMethods?.length || 2}/6`} />
          <InfoRow label="Inventory Capacity" value={`${gameState?.inventory?.length || 0} items`} />
          <InfoRow label="Compounds Created" value={`${gameState?.compounds?.length || 0}`} />
          <InfoRow label="Currency" value={scenario?.currency || 'Reales'} />
        </div>
      </div>
    </div>
  );
}

function ProgressSection({ gameState }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Progress Tracking" subtitle="Your journey through history" />

      <div className="grid grid-cols-2 gap-4">
        <ProgressCard
          title="Methods Unlocked"
          current={gameState?.unlockedMethods?.length || 2}
          max={6}
          description="Alchemical techniques mastered"
        />
        <ProgressCard
          title="Quests Completed"
          current={Array.isArray(gameState?.quests) ? gameState.quests.filter(q => q.completed).length : 0}
          max={10}
          description="Story missions finished"
        />
        <ProgressCard
          title="Patients Treated"
          current={0}
          max={50}
          description="Medical interventions performed"
        />
        <ProgressCard
          title="Story Progress"
          current={Math.min((gameState?.turnNumber || 1) * 2, 100)}
          max={100}
          description="Narrative completion percentage"
        />
      </div>
    </div>
  );
}

function DisplaySection({ textSize, setTextSize, animationsEnabled, setAnimationsEnabled }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Display Preferences" subtitle="Customize your visual experience" />

      {/* Text Size */}
      <SettingCard title="Text Size">
        <div className="flex gap-3">
          {['small', 'medium', 'large'].map(size => (
            <button
              key={size}
              onClick={() => setTextSize(size)}
              className="flex-1 px-6 py-3 rounded transition-all"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                color: textSize === size ? 'white' : '#6b5d52',
                background: textSize === size
                  ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                  : 'rgba(245, 238, 223, 0.5)',
                border: `1px solid ${textSize === size ? '#d97706' : 'rgba(139, 92, 46, 0.2)'}`,
                boxShadow: textSize === size
                  ? '0 4px 12px rgba(217, 119, 6, 0.25)'
                  : '0 2px 4px rgba(92, 74, 58, 0.05)'
              }}
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
          ))}
        </div>
      </SettingCard>

      {/* Animations */}
      <SettingCard title="Animations">
        <div className="flex items-center justify-between">
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            color: '#5c4a3a'
          }}>
            Enable smooth transitions and visual effects
          </p>
          <button
            onClick={() => setAnimationsEnabled(!animationsEnabled)}
            className="relative w-14 h-7 rounded-full transition-all"
            style={{
              background: animationsEnabled
                ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                : 'rgba(139, 92, 46, 0.2)',
              border: '1px solid rgba(139, 92, 46, 0.3)',
              boxShadow: animationsEnabled
                ? '0 2px 8px rgba(217, 119, 6, 0.3)'
                : '0 1px 3px rgba(92, 74, 58, 0.15)'
            }}
          >
            <div className={`absolute top-0.5 ${animationsEnabled ? 'left-7' : 'left-0.5'} w-6 h-6 rounded-full transition-all`}
              style={{
                background: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
              }}
            />
          </button>
        </div>
      </SettingCard>

      {/* Info Note */}
      <div className="rounded-lg p-4"
        style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}
      >
        <p className="text-sm" style={{
          fontFamily: "'Inter', sans-serif",
          color: '#1e40af'
        }}>
          <strong>Note:</strong> Theme preference follows your system settings. Light and dark modes are supported.
        </p>
      </div>
    </div>
  );
}

function CommandsSection() {
  const commands = [
    { category: 'Medical', items: [
      { cmd: '#prescribe', desc: 'Open prescription interface' },
      { cmd: '#diagnose', desc: 'Examine patient symptoms' },
      { cmd: '#treat', desc: 'Apply treatment to patient' }
    ]},
    { category: 'Crafting', items: [
      { cmd: '#mix', desc: 'Open mixing workshop' },
      { cmd: '#distill', desc: 'Distill ingredients' },
      { cmd: '#decoct', desc: 'Decoct ingredients' }
    ]},
    { category: 'Commerce', items: [
      { cmd: '#buy', desc: 'Purchase ingredients' },
      { cmd: '#sell', desc: 'Sell compounds' }
    ]},
    { category: 'Actions', items: [
      { cmd: '#sleep', desc: 'Rest to restore energy' },
      { cmd: '#eat', desc: 'Consume food' },
      { cmd: '#forage', desc: 'Search for items' }
    ]}
  ];

  return (
    <div className="space-y-8">
      <SectionHeader title="Command Reference" subtitle="Quick actions available in-game" />

      {commands.map(category => (
        <div key={category.category}>
          <h3 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{
            fontFamily: "'Inter', sans-serif",
            color: '#5c4a3a',
            letterSpacing: '0.08em'
          }}>
            {category.category}
          </h3>
          <div className="space-y-2">
            {category.items.map(cmd => (
              <div key={cmd.cmd} className="flex items-center gap-4 p-3 rounded transition-all"
                style={{
                  background: 'rgba(250, 245, 235, 0.6)',
                  border: '1px solid rgba(139, 92, 46, 0.1)'
                }}
              >
                <code className="px-3 py-1.5 rounded font-mono text-sm font-medium"
                  style={{
                    background: 'rgba(217, 119, 6, 0.1)',
                    color: '#d97706',
                    border: '1px solid rgba(217, 119, 6, 0.2)',
                    fontFamily: "'IBM Plex Mono', monospace"
                  }}
                >
                  {cmd.cmd}
                </code>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.875rem',
                  color: '#5c4a3a'
                }}>
                  {cmd.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DevSection({ onLoadTestPatient, onClose, gameState, setGameState, onLoadPrescriptionTest }) {
  const handleLoadTestPatient = () => {
    const testPatient = {
      name: 'Don Vicente de Soto',
      age: 42,
      gender: 'Male',
      occupation: 'Merchant',
      occupationDetail: 'Warehouse owner',
      family: 'Wife: Doña Isabella, Children: 3',
      astrology: 'Leo',
      healthHistory: 'Previously treated for melancholy in 1678',
      symptoms: [
        {
          name: 'Severe Headache',
          severity: 'severe',
          type: 'pain',
          location: 'Head / Cranium',
          description: 'My head pounds as if struck by a blacksmith\'s hammer—it began three days past and has not ceased',
          position: { x: 70, y: 24 }
        },
        {
          name: 'Burning Abdominal Pain',
          severity: 'severe',
          type: 'pain',
          location: 'Abdomen / Digestive',
          description: 'A terrible burning in my gut, especially after I eat',
          position: { x: 70, y: 95 }
        },
        {
          name: 'Infected Wound',
          severity: 'critical',
          type: 'wound',
          location: 'Right Arm / Upper Limb',
          description: 'Caught on a rusted nail at the warehouse—flesh around it has turned an angry red',
          position: { x: 117, y: 92 }
        },
        {
          name: 'Recurring Fever',
          severity: 'moderate',
          type: 'inflammation',
          location: 'Whole Body / Systemic',
          description: 'The fever comes and goes in waves, leaving me drenched in sweat',
          position: { x: 70, y: 75 }
        }
      ]
    };

    if (onLoadTestPatient) {
      onLoadTestPatient(testPatient);
      onClose();
    }
  };

  const handleLoadPrescriptionTest = () => {
    const testPatient = {
      name: 'Doña Catalina Méndez',
      age: 35,
      gender: 'Female',
      occupation: 'Merchant\'s Wife',
      occupationDetail: 'Manages household accounts',
      family: 'Husband: Don Fernando Méndez, Children: 2',
      astrology: 'Virgo',
      healthHistory: 'Prone to headaches and digestive troubles',
      diagnosis: 'Melancholy with choleric tendency',
      socialContext: 'Upper-middle class, respects conversos but watches reputation',
      secret: 'Secretly reads forbidden books from Europe',
      symptoms: [
        {
          name: 'Persistent Headache',
          severity: 'moderate',
          type: 'pain',
          location: 'Head / Cranium',
          description: 'A dull ache that worsens in the afternoon',
          position: { x: 70, y: 24 }
        },
        {
          name: 'Melancholic Humors',
          severity: 'moderate',
          type: 'humoral',
          location: 'Whole Body / Systemic',
          description: 'Feelings of deep sadness and fatigue',
          position: { x: 70, y: 75 }
        }
      ]
    };

    if (onLoadPrescriptionTest) {
      onLoadPrescriptionTest(testPatient);
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Developer Panel" subtitle="Testing and debugging tools" />

      <div className="rounded-lg p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.05))',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)'
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="text-sm font-semibold mb-1" style={{
              fontFamily: "'Inter', sans-serif",
              color: '#1e40af'
            }}>
              Development Tools
            </h3>
            <p className="text-xs leading-relaxed" style={{
              fontFamily: "'Inter', sans-serif",
              color: '#3730a3',
              lineHeight: '1.6'
            }}>
              These tools are for testing purposes and may override game state. Use with caution.
            </p>
          </div>
        </div>
      </div>

      <SettingCard title="Patient View Testing">
        <p className="text-sm mb-4" style={{
          fontFamily: "'Inter', sans-serif",
          color: '#5c4a3a',
          lineHeight: '1.6'
        }}>
          Load a test patient with multiple symptoms to preview the Patient View tab even when no patient is active in the game.
        </p>
        <button
          onClick={handleLoadTestPatient}
          className="px-6 py-3 rounded-lg font-semibold transition-all w-full"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            color: 'white',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: '1px solid #059669',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #059669, #047857)';
            e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.25)';
          }}
        >
          🩺 Load Test Patient (Don Vicente de Soto)
        </button>

        <div className="mt-4 p-3 rounded"
          style={{
            background: 'rgba(245, 238, 223, 0.5)',
            border: '1px solid rgba(139, 92, 46, 0.1)'
          }}
        >
          <p className="text-xs" style={{
            fontFamily: "'Inter', sans-serif",
            color: '#6b5d52',
            lineHeight: '1.5'
          }}>
            <strong>Test patient details:</strong> 42-year-old male merchant with severe headache, abdominal pain, infected wound, and fever. Includes realistic symptom positioning on body diagram.
          </p>
        </div>
      </SettingCard>

      <SettingCard title="Prescription Flow Testing">
        <p className="text-sm mb-4" style={{
          fontFamily: "'Inter', sans-serif",
          color: '#5c4a3a',
          lineHeight: '1.6'
        }}>
          Test the new integrated prescription system. Loads a patient ready for prescription with pre-answered dialogue, automatically switches to Patient View tab, and enables prescription mode.
        </p>
        <button
          onClick={handleLoadPrescriptionTest}
          className="px-6 py-3 rounded-lg font-semibold transition-all w-full mb-3"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            color: 'white',
            background: 'linear-gradient(135deg, #ec4899, #db2777)',
            border: '1px solid #db2777',
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #db2777, #be185d)';
            e.target.style.boxShadow = '0 6px 16px rgba(236, 72, 153, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #ec4899, #db2777)';
            e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.25)';
          }}
        >
          ℞ Load Prescription Test (Doña Catalina Méndez)
        </button>

        <div className="p-3 rounded"
          style={{
            background: 'rgba(236, 72, 153, 0.08)',
            border: '1px solid rgba(236, 72, 153, 0.2)'
          }}
        >
          <p className="text-xs mb-2" style={{
            fontFamily: "'Inter', sans-serif",
            color: '#831843',
            lineHeight: '1.5'
          }}>
            <strong>Test scenario:</strong> 35-year-old woman with melancholy and headaches. Patient view will open with dialogue pre-answered, showing the red "Offer a Prescription" banner.
          </p>
          <p className="text-xs" style={{
            fontFamily: "'Inter', sans-serif",
            color: '#9f1239',
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            💡 <strong>Test workflow:</strong> Click banner or prescribe button → drag inventory item → select route → adjust amount/price → prescribe → review outcome
          </p>
        </div>
      </SettingCard>

      <SettingCard title="Game Systems Test Suite">
        <p className="text-sm mb-4" style={{
          fontFamily: "'Inter', sans-serif",
          color: '#5c4a3a',
          lineHeight: '1.6'
        }}>
          Run automated tests for NPC conditions, patient flow, shop sign mechanics, and other game systems. Verify that recent changes haven't broken core functionality.
        </p>
        <TestSuitePanel />
      </SettingCard>

      <SettingCard title="Portrait Selection Tests">
        <p className="text-sm mb-4" style={{
          fontFamily: "'Inter', sans-serif",
          color: '#5c4a3a',
          lineHeight: '1.6'
        }}>
          Test the portrait priority system: physically present NPCs (newly created) should take priority over topical entities (pre-selected). Validates the fix for showing correct portraits (e.g., servant vs patient).
        </p>
        <PortraitTestPanel />
      </SettingCard>

      <SettingCard title="Profession System Testing">
        <p className="text-sm mb-4" style={{
          fontFamily: "'Inter', sans-serif",
          color: '#5c4a3a',
          lineHeight: '1.6'
        }}>
          Test the profession system by switching professions and adjusting level to see which abilities unlock. Changes apply immediately to gameplay - use #buy (Poisoner black market), #prescribe (payment bonuses), or #mix (alchemist bonuses) to verify.
        </p>
        <ProfessionTestPanel gameState={gameState} setGameState={setGameState} />
      </SettingCard>
    </div>
  );
}

function AboutSection() {
  const { isDarkMode } = useDarkMode();

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="rounded-lg p-6"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.7))'
            : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(217, 119, 6, 0.08))',
          border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(217, 119, 6, 0.25)',
          boxShadow: isDarkMode
            ? '0 4px 16px rgba(0, 0, 0, 0.4)'
            : '0 4px 16px rgba(217, 119, 6, 0.15)'
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl mb-2 leading-tight" style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              color: isDarkMode ? '#fbbf24' : '#92400e',
              letterSpacing: '-0.02em'
            }}>
              The Apothecary
            </h1>
            <p className="text-sm" style={{
              fontFamily: "'Inter', sans-serif",
              color: isDarkMode ? '#a8a29e' : '#8b7a6a',
              fontStyle: 'italic'
            }}>
              A Historical Medical RPG
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold" style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: isDarkMode ? '#fbbf24' : '#d97706'
            }}>
              v0.1.0
            </div>
            <div className="text-xs" style={{
              fontFamily: "'Inter', sans-serif",
              color: isDarkMode ? '#78716c' : '#8b7a6a'
            }}>
              Alpha Build
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-4" style={{
          fontFamily: "'Inter', sans-serif",
          color: isDarkMode ? '#d6d3d1' : '#3d2f24',
          lineHeight: '1.7'
        }}>
          Step into the world of 1680 Mexico City as <strong style={{ color: isDarkMode ? '#fbbf24' : '#92400e' }}>Maria de Lima</strong>,
          a converso apothecary navigating the dangerous intersection of colonial politics, religious persecution, and the healing arts.
          Combining historically accurate humoral medicine, alchemical crafting, and AI-driven procedural storytelling,
          The Apothecary creates emergent narratives where your choices shape an authentic historical experience.
        </p>

        <div className="flex gap-2 flex-wrap">
          <Badge text="Historical Simulation" />
          <Badge text="Procedural Narrative" color="amber" />
          <Badge text="Educational" />
        </div>
      </div>

      {/* Key Features */}
      <div>
        <h3 className="text-lg mb-4 font-bold" style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: isDarkMode ? '#fbbf24' : '#3d2f24'
        }}>
          Key Features
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <FeatureCard
            icon="🔬"
            title="Authentic Medicine"
            desc="Mix remedies using 100+ historical materia medica from the 17th century"
            isDarkMode={isDarkMode}
          />
          <FeatureCard
            icon="🎭"
            title="Procedural Stories"
            desc="AI-driven narratives create unique encounters and branching storylines"
            isDarkMode={isDarkMode}
          />
          <FeatureCard
            icon="⚗️"
            title="Alchemical Crafting"
            desc="Distill, decoct, calcinate, and confection compounds with period techniques"
            isDarkMode={isDarkMode}
          />
          <FeatureCard
            icon="🗡️"
            title="Reputation System"
            desc="Navigate six competing factions in a dangerous colonial society"
            isDarkMode={isDarkMode}
          />
          <FeatureCard
            icon="📜"
            title="Historical Accuracy"
            desc="Based on extensive research into early modern medicine and society"
            isDarkMode={isDarkMode}
          />
          <FeatureCard
            icon="🎮"
            title="Emergent Gameplay"
            desc="Dynamic world events, NPC relationships, and branching quests"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Historical Context */}
      <div className="rounded-lg p-5"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
            : 'linear-gradient(135deg, rgba(250, 245, 235, 0.95), rgba(245, 238, 223, 0.9))',
          border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(139, 92, 46, 0.2)',
          boxShadow: isDarkMode
            ? '0 4px 12px rgba(0, 0, 0, 0.4)'
            : '0 4px 12px rgba(92, 74, 58, 0.08)'
        }}
      >
        <h3 className="text-lg mb-3 font-bold" style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: isDarkMode ? '#fbbf24' : '#3d2f24'
        }}>
          Historical Context
        </h3>
        <p className="text-sm leading-relaxed mb-3" style={{
          fontFamily: "'Inter', sans-serif",
          color: isDarkMode ? '#d6d3d1' : '#3d2f24',
          lineHeight: '1.7'
        }}>
          The game is set during a pivotal moment in colonial Mexican history. The Spanish Inquisition is active in New Spain,
          conversos (Jewish converts to Christianity) face constant scrutiny, and medical practice blends European humoral theory
          with indigenous Nahua knowledge. The protagonist's identity as a converso apothecary places her at the crossroads of
          multiple marginalized communities while serving patients from all social classes.
        </p>
        <p className="text-sm leading-relaxed" style={{
          fontFamily: "'Inter', sans-serif",
          color: isDarkMode ? '#d6d3d1' : '#3d2f24',
          lineHeight: '1.7'
        }}>
          Historical apothecaries were part physician, part pharmacist, and part alchemist—trusted healers who wielded both
          practical medical knowledge and the mystical authority of transforming raw materials into powerful medicines.
        </p>
      </div>

      {/* Tech Stack */}
      <div>
        <h3 className="text-lg mb-4 font-bold" style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: isDarkMode ? '#fbbf24' : '#3d2f24'
        }}>
          Technology Stack
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <TechCard title="React 18" desc="Modern UI framework with hooks" isDarkMode={isDarkMode} />
          <TechCard title="OpenAI GPT-4o" desc="Primary narrative generation engine" isDarkMode={isDarkMode} />
          <TechCard title="Google Gemini 2.0" desc="Fallback LLM with lower latency" isDarkMode={isDarkMode} />
          <TechCard title="LocalStorage" desc="Client-side save system" isDarkMode={isDarkMode} />
          <TechCard title="Tailwind CSS" desc="Utility-first styling framework" isDarkMode={isDarkMode} />
          <TechCard title="Procedural Generation" desc="Dynamic NPCs, items, and encounters" isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Credits */}
      <div>
        <h3 className="text-lg mb-4 font-bold" style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: isDarkMode ? '#fbbf24' : '#3d2f24'
        }}>
          Credits
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <CreditCard role="Design & Development" name="Benjamin Breen" isDarkMode={isDarkMode} />
          <CreditCard role="Historical Research" name="Benjamin Breen" isDarkMode={isDarkMode} />
          <CreditCard role="Game Design" name="Benjamin Breen" isDarkMode={isDarkMode} />
          <CreditCard role="Narrative Systems" name="Benjamin Breen" isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Links */}
      <div className="rounded-lg p-5"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5))'
            : 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(217, 119, 6, 0.05))',
          border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(217, 119, 6, 0.2)'
        }}
      >
        <h3 className="text-lg mb-3 font-bold" style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: isDarkMode ? '#fbbf24' : '#92400e'
        }}>
          Resources
        </h3>
        <div className="space-y-2 text-sm" style={{
          fontFamily: "'Inter', sans-serif",
          color: isDarkMode ? '#d6d3d1' : '#5c4a3a'
        }}>
          <p>• Source code and documentation available on GitHub</p>
          <p>• Report bugs and suggest features through the issue tracker</p>
          <p>• Learn more about historical medicine at the project wiki</p>
          <p>• Join the community Discord for discussions and updates</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center pt-4" style={{
        borderTop: isDarkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(139, 92, 46, 0.15)'
      }}>
        <p className="text-xs" style={{
          fontFamily: "'Inter', sans-serif",
          color: isDarkMode ? '#78716c' : '#8b7a6a'
        }}>
          © 2025 Benjamin Breen • The Apothecary • Alpha v0.1.0
        </p>
      </div>
    </div>
  );
}

// UI Components
function SectionHeader({ title, subtitle }) {
  const { isDarkMode } = useDarkMode();
  return (
    <div className="mb-5">
      <h2 className="text-2xl mb-1 leading-tight" style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 700,
        color: isDarkMode ? '#fbbf24' : '#3d2f24',
        letterSpacing: '-0.02em'
      }}>
        {title}
      </h2>
      <p className="text-xs font-medium" style={{
        fontFamily: "'Inter', sans-serif",
        color: isDarkMode ? '#a8a29e' : '#8b7a6a',
        letterSpacing: '0.01em'
      }}>
        {subtitle}
      </p>
    </div>
  );
}

function StatCard({ label, value }) {
  const { isDarkMode } = useDarkMode();
  return (
    <div className="rounded-lg p-3 transition-all duration-200 hover:shadow-md"
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.7))'
          : 'linear-gradient(135deg, rgba(250, 245, 235, 0.9), rgba(245, 238, 223, 0.7))',
        border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(139, 92, 46, 0.2)',
        boxShadow: isDarkMode
          ? '0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(251, 191, 36, 0.1)'
          : '0 2px 6px rgba(92, 74, 58, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
      }}
    >
      <div className="text-[10px] font-bold mb-1.5 uppercase tracking-wider" style={{
        fontFamily: "'Inter', sans-serif",
        color: isDarkMode ? '#a8a29e' : '#8b7a6a',
        letterSpacing: '0.1em'
      }}>
        {label}
      </div>
      <div className="text-4xl font-semibold leading-wide" style={{
        fontFamily: "'Cinzel', Georgia, serif",
        color: isDarkMode ? '#fcd34d' : '#3d2f24'
      }}>
        {value}
      </div>
    </div>
  );
}

function Badge({ text, color = 'blue' }) {
  const { isDarkMode } = useDarkMode();
  const styles = {
    blue: {
      background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)',
      color: isDarkMode ? '#60a5fa' : '#1e40af',
      border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(59, 130, 246, 0.25)'
    },
    amber: {
      background: isDarkMode ? 'rgba(217, 119, 6, 0.2)' : 'rgba(217, 119, 6, 0.12)',
      color: isDarkMode ? '#fbbf24' : '#92400e',
      border: isDarkMode ? '1px solid rgba(217, 119, 6, 0.4)' : '1px solid rgba(217, 119, 6, 0.25)'
    }
  };

  return (
    <span className="px-3 py-1 rounded text-xs font-semibold"
      style={{
        ...styles[color],
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {text}
    </span>
  );
}

function InfoRow({ label, value }) {
  const { isDarkMode } = useDarkMode();
  return (
    <div>
      <div className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{
        fontFamily: "'Inter', sans-serif",
        color: isDarkMode ? '#a8a29e' : '#8b7a6a',
        letterSpacing: '0.08em'
      }}>
        {label}
      </div>
      <div className="text-sm font-medium" style={{
        fontFamily: "'Inter', sans-serif",
        color: isDarkMode ? '#e5e5e5' : '#3d2f24'
      }}>
        {value}
      </div>
    </div>
  );
}

function ProgressCard({ title, current, max, description }) {
  const percent = (current / max) * 100;

  return (
    <div className="rounded-lg p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(250, 245, 235, 0.9), rgba(245, 238, 223, 0.8))',
        border: '1px solid rgba(139, 92, 46, 0.2)',
        boxShadow: '0 2px 8px rgba(92, 74, 58, 0.08)'
      }}
    >
      <h4 className="text-lg font-semibold mb-1" style={{
        fontFamily: "'Inter', sans-serif",
        color: '#3d2f24'
      }}>
        {title}
      </h4>
      <p className="text-xs mb-4" style={{
        fontFamily: "'Inter', sans-serif",
        color: '#8b7a6a'
      }}>
        {description}
      </p>
      <div className="flex justify-between text-sm mb-2" style={{
        fontFamily: "'Inter', sans-serif"
      }}>
        <span style={{ color: '#5c4a3a', fontWeight: 600 }}>
          {current} / {max}
        </span>
        <span style={{ color: '#d97706', fontWeight: 600 }}>
          {percent.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden"
        style={{
          background: 'rgba(139, 92, 46, 0.15)'
        }}
      >
        <div className="h-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(90deg, #d97706, #f59e0b)',
            boxShadow: '0 0 8px rgba(217, 119, 6, 0.4)'
          }}
        />
      </div>
    </div>
  );
}

function SettingCard({ title, children }) {
  return (
    <div className="rounded-lg p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(250, 245, 235, 0.9), rgba(245, 238, 223, 0.8))',
        border: '1px solid rgba(139, 92, 46, 0.2)',
        boxShadow: '0 2px 8px rgba(92, 74, 58, 0.08)'
      }}
    >
      <h3 className="text-base font-semibold mb-4" style={{
        fontFamily: "'Inter', sans-serif",
        color: '#3d2f24'
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function TechCard({ title, desc, isDarkMode }) {
  return (
    <div className="p-4 rounded"
      style={{
        background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(250, 245, 235, 0.6)',
        border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.15)' : '1px solid rgba(139, 92, 46, 0.1)'
      }}
    >
      <div className="text-sm font-semibold mb-1" style={{
        fontFamily: "'Inter', sans-serif",
        color: isDarkMode ? '#fcd34d' : '#3d2f24'
      }}>
        {title}
      </div>
      <div className="text-xs" style={{
        fontFamily: "'Inter', sans-serif",
        color: isDarkMode ? '#a8a29e' : '#8b7a6a'
      }}>
        {desc}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, isDarkMode }) {
  return (
    <div className="p-4 rounded-lg"
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.6))'
          : 'linear-gradient(135deg, rgba(250, 245, 235, 0.7), rgba(245, 238, 223, 0.6))',
        border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(139, 92, 46, 0.15)',
        boxShadow: isDarkMode ? '0 2px 6px rgba(0, 0, 0, 0.3)' : '0 2px 6px rgba(92, 74, 58, 0.06)'
      }}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-bold mb-1" style={{
        fontFamily: "'Inter', sans-serif",
        color: isDarkMode ? '#fbbf24' : '#3d2f24'
      }}>
        {title}
      </div>
      <div className="text-xs leading-relaxed" style={{
        fontFamily: "'Inter', sans-serif",
        color: isDarkMode ? '#a8a29e' : '#8b7a6a',
        lineHeight: '1.5'
      }}>
        {desc}
      </div>
    </div>
  );
}

function CreditCard({ role, name, isDarkMode }) {
  return (
    <div className="flex justify-between items-center p-3 rounded"
      style={{
        background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(250, 245, 235, 0.6)',
        border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.15)' : '1px solid rgba(139, 92, 46, 0.1)'
      }}
    >
      <span className="text-xs" style={{
        fontFamily: "'Inter', sans-serif",
        color: isDarkMode ? '#a8a29e' : '#8b7a6a'
      }}>
        {role}
      </span>
      <span className="text-sm font-semibold" style={{
        fontFamily: "'Inter', sans-serif",
        color: isDarkMode ? '#fcd34d' : '#3d2f24'
      }}>
        {name}
      </span>
    </div>
  );
}

function ResourceBar({ label, value, max, color, compact = false }) {
  const { isDarkMode } = useDarkMode();
  const percent = (value / max) * 100;
  const colorMap = {
    rose: {
      bg: '#f43f5e',
      light: isDarkMode ? 'rgba(244, 63, 94, 0.2)' : 'rgba(244, 63, 94, 0.1)',
      dark: '#e11d48'
    },
    amber: {
      bg: '#f59e0b',
      light: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
      dark: '#d97706'
    }
  };

  if (compact) {
    return (
      <div className="rounded p-2"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.5))'
            : 'linear-gradient(135deg, rgba(250, 245, 235, 0.7), rgba(245, 238, 223, 0.5))',
          border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(139, 92, 46, 0.15)',
          boxShadow: isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(92, 74, 58, 0.05)'
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: isDarkMode ? '#a8a29e' : '#8b7a6a',
              letterSpacing: '0.1em'
            }}
          >
            {label}
          </span>
          <span className="text-xs font-bold"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: isDarkMode ? '#fcd34d' : '#3d2f24'
            }}
          >
            {value}/{max}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden"
          style={{
            background: colorMap[color].light
          }}
        >
          <div className="h-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: colorMap[color].bg,
              boxShadow: `0 0 6px ${colorMap[color].bg}40`
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-3"
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.5))'
          : 'linear-gradient(135deg, rgba(250, 245, 235, 0.7), rgba(245, 238, 223, 0.5))',
        border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(139, 92, 46, 0.15)',
        boxShadow: isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(92, 74, 58, 0.05)'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: isDarkMode ? '#a8a29e' : '#8b7a6a',
            letterSpacing: '0.08em'
          }}
        >
          {label}
        </span>
        <span className="text-sm font-bold"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: isDarkMode ? '#fcd34d' : '#3d2f24'
          }}
        >
          {value}/{max}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden"
        style={{
          background: colorMap[color].light
        }}
      >
        <div className="h-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: colorMap[color].bg,
            boxShadow: `0 0 6px ${colorMap[color].bg}40`
          }}
        />
      </div>
    </div>
  );
}

function MiniProgressCard({ title, current, max, color }) {
  const { isDarkMode } = useDarkMode();
  const percent = (current / max) * 100;

  return (
    <div className="rounded p-3"
      style={{
        background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(250, 245, 235, 0.5)',
        border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.15)' : '1px solid rgba(139, 92, 46, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: isDarkMode ? '#d6d3d1' : '#5c4a3a'
          }}
        >
          {title}
        </span>
        <span className="text-xs font-bold"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: isDarkMode ? '#a8a29e' : '#8b7a6a'
          }}
        >
          {current}/{max}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden"
        style={{
          background: isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(139, 92, 46, 0.1)'
        }}
      >
        <div className="h-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: color
          }}
        />
      </div>
    </div>
  );
}
