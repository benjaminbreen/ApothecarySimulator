/**
 * Profession Test Panel
 *
 * Dev tool for testing profession system:
 * - Change profession on the fly
 * - Adjust level to test ability unlocks
 * - View active abilities at current level
 * - Reset profession choice
 */

import React, { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import {
  PROFESSIONS,
  getAllAbilitiesForProfession,
  getProfessionName,
  getProfessionIcon,
  getProfessionDescription
} from '../core/systems/professionAbilities';

export default function ProfessionTestPanel({ gameState, setGameState }) {
  const { isDarkMode } = useDarkMode();
  const [selectedProfession, setSelectedProfession] = useState(gameState?.chosenProfession || null);
  const [testLevel, setTestLevel] = useState(gameState?.playerLevel || 5);

  // All professions
  const allProfessions = Object.values(PROFESSIONS);

  // Get profession color scheme
  const getProfessionColors = (professionId) => {
    const colors = {
      alchemist: { primary: '#8b5cf6', light: '#a78bfa', bg: '#f3e8ff' },
      herbalist: { primary: '#16a34a', light: '#22c55e', bg: '#dcfce7' },
      surgeon: { primary: '#dc2626', light: '#ef4444', bg: '#fee2e2' },
      poisoner: { primary: '#1f2937', light: '#374151', bg: '#e5e7eb' },
      scholar: { primary: '#0ea5e9', light: '#38bdf8', bg: '#e0f2fe' },
      court_physician: { primary: '#f59e0b', light: '#fbbf24', bg: '#fef3c7' }
    };
    return colors[professionId] || { primary: '#8b5cf6', light: '#a78bfa', bg: '#f3e8ff' };
  };

  // Apply profession and level change
  const handleApplyChanges = () => {
    if (!gameState || !setGameState) {
      console.error('[ProfessionTestPanel] gameState or setGameState not provided');
      return;
    }

    setGameState(prev => ({
      ...prev,
      chosenProfession: selectedProfession,
      playerLevel: testLevel,
      playerTitle: selectedProfession
        ? `${getProfessionName(selectedProfession)} (Level ${testLevel})`
        : `Independent Apothecary (Level ${testLevel})`
    }));

    console.log(`[ProfessionTestPanel] Applied: ${selectedProfession || 'No Profession'} at Level ${testLevel}`);
  };

  // Reset profession choice
  const handleResetProfession = () => {
    if (!gameState || !setGameState) {
      console.error('[ProfessionTestPanel] gameState or setGameState not provided');
      return;
    }

    setSelectedProfession(null);
    setGameState(prev => ({
      ...prev,
      chosenProfession: null,
      playerTitle: `Independent Apothecary (Level ${prev.playerLevel})`
    }));

    console.log('[ProfessionTestPanel] Reset profession choice');
  };

  // Get abilities for selected profession at test level
  const getActiveAbilities = () => {
    if (!selectedProfession) return [];

    const allAbilities = getAllAbilitiesForProfession(selectedProfession);
    return allAbilities.filter(ability => ability.level <= testLevel);
  };

  const activeAbilities = getActiveAbilities();
  const colors = selectedProfession ? getProfessionColors(selectedProfession) : null;

  return (
    <div className="space-y-6">
      {/* Profession Selector */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{
          fontFamily: "'Inter', sans-serif",
          color: isDarkMode ? '#fbbf24' : '#5c4a3a'
        }}>
          Select Profession
        </label>
        <div className="grid grid-cols-2 gap-3">
          {allProfessions.map(professionId => {
            const isSelected = selectedProfession === professionId;
            const profColors = getProfessionColors(professionId);

            return (
              <button
                key={professionId}
                onClick={() => setSelectedProfession(professionId)}
                className="px-4 py-3 rounded-lg text-left transition-all duration-200"
                style={{
                  background: isSelected
                    ? isDarkMode
                      ? `linear-gradient(135deg, ${profColors.primary}40, ${profColors.light}20)`
                      : `linear-gradient(135deg, ${profColors.bg}, ${profColors.bg})`
                    : isDarkMode
                      ? 'rgba(30, 41, 59, 0.4)'
                      : 'rgba(250, 248, 243, 0.6)',
                  border: isSelected
                    ? `2px solid ${profColors.primary}`
                    : isDarkMode
                      ? '1px solid rgba(251, 191, 36, 0.2)'
                      : '1px solid rgba(139, 92, 46, 0.15)',
                  boxShadow: isSelected
                    ? `0 4px 12px ${profColors.primary}40`
                    : 'none'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{getProfessionIcon(professionId)}</span>
                  <span className="font-semibold text-sm" style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isDarkMode ? '#fbbf24' : profColors.primary
                  }}>
                    {getProfessionName(professionId)}
                  </span>
                </div>
                <p className="text-xs leading-tight" style={{
                  fontFamily: "'Inter', sans-serif",
                  color: isDarkMode ? '#94a3b8' : '#6b5d52',
                  lineHeight: '1.4'
                }}>
                  {getProfessionDescription(professionId).split('.')[0]}.
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Level Slider */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{
          fontFamily: "'Inter', sans-serif",
          color: isDarkMode ? '#fbbf24' : '#5c4a3a'
        }}>
          Test Level: {testLevel}
        </label>
        <input
          type="range"
          min="1"
          max="30"
          value={testLevel}
          onChange={(e) => setTestLevel(parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: isDarkMode
              ? 'linear-gradient(to right, #fbbf24, #f59e0b)'
              : 'linear-gradient(to right, #d97706, #f59e0b)',
            accentColor: colors?.primary || '#8b5cf6'
          }}
        />
        <div className="flex justify-between text-xs mt-1" style={{
          fontFamily: "'Inter', sans-serif",
          color: isDarkMode ? '#94a3b8' : '#8b7a6a'
        }}>
          <span>Level 1</span>
          <span>Level 30</span>
        </div>
      </div>

      {/* Active Abilities Display */}
      {selectedProfession && activeAbilities.length > 0 && (
        <div className="rounded-lg p-4" style={{
          background: isDarkMode
            ? 'rgba(30, 41, 59, 0.6)'
            : colors?.bg || '#f3e8ff',
          border: `1px solid ${colors?.primary || '#8b5cf6'}40`
        }}>
          <h4 className="text-sm font-semibold mb-3" style={{
            fontFamily: "'Inter', sans-serif",
            color: isDarkMode ? '#fbbf24' : colors?.primary
          }}>
            Active Abilities at Level {testLevel}
          </h4>
          <div className="space-y-2">
            {activeAbilities.map((ability, index) => (
              <div
                key={index}
                className="p-3 rounded-lg"
                style={{
                  background: isDarkMode
                    ? 'rgba(15, 23, 42, 0.6)'
                    : 'rgba(255, 255, 255, 0.7)',
                  border: `1px solid ${colors?.primary}30`
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold" style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isDarkMode ? '#fbbf24' : colors?.primary
                  }}>
                    {ability.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: colors?.primary,
                    color: 'white',
                    fontWeight: 600
                  }}>
                    L{ability.level}
                  </span>
                </div>
                <p className="text-xs" style={{
                  fontFamily: "'Inter', sans-serif",
                  color: isDarkMode ? '#94a3b8' : '#6b5d52',
                  lineHeight: '1.5'
                }}>
                  {ability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleApplyChanges}
          className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            color: 'white',
            background: colors?.primary || '#8b5cf6',
            border: `1px solid ${colors?.primary || '#8b5cf6'}`,
            boxShadow: `0 4px 12px ${colors?.primary || '#8b5cf6'}40`
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = `0 6px 16px ${colors?.primary || '#8b5cf6'}60`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = `0 4px 12px ${colors?.primary || '#8b5cf6'}40`;
          }}
        >
          ✓ Apply Changes
        </button>

        <button
          onClick={handleResetProfession}
          className="px-6 py-3 rounded-lg font-semibold transition-all"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            color: isDarkMode ? '#fbbf24' : '#5c4a3a',
            background: isDarkMode
              ? 'rgba(30, 41, 59, 0.6)'
              : 'rgba(250, 248, 243, 0.6)',
            border: isDarkMode
              ? '1px solid rgba(251, 191, 36, 0.3)'
              : '1px solid rgba(139, 92, 46, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = isDarkMode
              ? 'rgba(30, 41, 59, 0.8)'
              : 'rgba(245, 238, 223, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = isDarkMode
              ? 'rgba(30, 41, 59, 0.6)'
              : 'rgba(250, 248, 243, 0.6)';
          }}
        >
          ↺ Reset
        </button>
      </div>

      {/* Info Notice */}
      <div className="rounded-lg p-3" style={{
        background: isDarkMode
          ? 'rgba(59, 130, 246, 0.1)'
          : 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <p className="text-xs" style={{
          fontFamily: "'Inter', sans-serif",
          color: isDarkMode ? '#60a5fa' : '#1e40af',
          lineHeight: '1.5'
        }}>
          <strong>Note:</strong> Changes apply immediately to gameplay. Use #buy to test black market (Poisoner), #prescribe to test payment bonuses (Court Physician), or #mix to test alchemist bonuses.
        </p>
      </div>
    </div>
  );
}
