/**
 * Progression Tree Modal - Production Edition v3
 *
 * Visual roadmap showing player progression with:
 * - Dynamic level progression (shows current + 1 level)
 * - 6 profession specialization paths (unlock at Level 5)
 * - Large profession banners with historically accurate descriptions
 * - Beautiful hover effects and animations
 */

import React, { useState } from 'react';
import {
  PROFESSIONS,
  getAllAbilitiesForProfession,
  getProfessionName,
  getProfessionIcon,
  getProfessionDescription
} from '../core/systems/professionAbilities';

/**
 * Level titles for progression (1-25)
 */
const LEVEL_TITLES = {
  1: 'Apprentice',
  2: 'Senior Apprentice',
  3: 'Assistant',
  4: 'Independent Apothecary',
  5: 'Specialization',
  6: 'Practitioner',
  7: 'Skilled Practitioner',
  8: 'Experienced',
  9: 'Advanced',
  10: 'Expert',
  15: 'Master',
  20: 'Grand Master',
  25: 'Legendary'
};

/**
 * Profession metadata with banners and shorter descriptions
 */
const PROFESSION_META = {
  [PROFESSIONS.ALCHEMIST]: {
    banner: '/ui/alchemistpath.png',
    description: 'Pursuing transmutation and quintessences in New Spain laboratories, blending Paracelsian chemical philosophy with Galenic medicine to create powerful medicaments.',
    gradient: 'from-purple-600 to-indigo-700'
  },
  [PROFESSIONS.HERBALIST]: {
    banner: '/ui/herbalistpath.png',
    description: 'Drawing upon indigenous Nahua knowledge and European herbals, cultivating medicinal gardens and compounding remedies from New World plants.',
    gradient: 'from-green-600 to-emerald-700'
  },
  [PROFESSIONS.SURGEON]: {
    banner: '/ui/surgicalpath.png',
    description: 'Mastering bloodletting, wound treatment, and bone-setting as barber-surgeons providing practical medical care to soldiers, sailors, and the urban poor.',
    gradient: 'from-red-600 to-rose-700'
  },
  [PROFESSIONS.POISONER]: {
    banner: '/ui/poisonerpath.png',
    description: 'Operating in colonial shadows with dangerous knowledge of toxic substances, walking the line between preparing antidotes and facing accusations of witchcraft.',
    gradient: 'from-slate-700 to-stone-900'
  },
  [PROFESSIONS.SCHOLAR]: {
    banner: '/ui/scholarpath.png',
    description: 'University-educated in Hippocratic and Galenic texts alongside Arabic authorities, diagnosing through pulse-taking and prescribing complex humoral remedies.',
    gradient: 'from-blue-600 to-cyan-700'
  },
  [PROFESSIONS.COURT_PHYSICIAN]: {
    banner: '/ui/courtphysicianpath.png',
    description: 'Attending viceroys and wealthy merchants with access to rare imperial ingredients—bezoar stones, theriac, Eastern spices—and extensive manuscript libraries.',
    gradient: 'from-amber-600 to-yellow-700'
  }
};

/**
 * Get profession colors matching game palette
 */
function getProfessionColor(professionId) {
  const colors = {
    [PROFESSIONS.ALCHEMIST]: { primary: '#8b5cf6', light: '#a78bfa', dark: '#6d28d9', bg: 'rgba(139, 92, 246, 0.1)' },
    [PROFESSIONS.HERBALIST]: { primary: '#16a34a', light: '#22c55e', dark: '#15803d', bg: 'rgba(22, 163, 74, 0.1)' },
    [PROFESSIONS.SURGEON]: { primary: '#dc2626', light: '#ef4444', dark: '#b91c1c', bg: 'rgba(220, 38, 38, 0.1)' },
    [PROFESSIONS.POISONER]: { primary: '#1f2937', light: '#374151', dark: '#111827', bg: 'rgba(31, 41, 55, 0.1)' },
    [PROFESSIONS.SCHOLAR]: { primary: '#0ea5e9', light: '#38bdf8', dark: '#0284c7', bg: 'rgba(14, 165, 233, 0.1)' },
    [PROFESSIONS.COURT_PHYSICIAN]: { primary: '#f59e0b', light: '#fbbf24', dark: '#d97706', bg: 'rgba(245, 158, 11, 0.1)' }
  };
  return colors[professionId] || colors[PROFESSIONS.SCHOLAR];
}

/**
 * Level Progression Component - Shows levels up to current + 1
 */
function LevelProgression({ playerLevel }) {
  const isDark = document.documentElement.classList.contains('dark');

  // Show levels from 1 to current + 1, max 10
  const maxLevel = Math.min(playerLevel + 1, 10);
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);

  return (
    <div className="mb-6">
      <h3
        className="text-sm font-sans font-semibold uppercase tracking-wider text-center mb-4"
        style={{ color: isDark ? '#a8a29e' : '#6b7280', letterSpacing: '0.12em' }}
      >
        Career Progression
      </h3>

      <div className="flex items-center justify-center gap-2 px-4">
        {levels.map((level, idx) => (
          <React.Fragment key={level}>
            {/* Level Circle */}
            <div className="flex flex-col items-center group">
              {/* Title Above */}
              <div
                className="text-sm font-sans mb-1.5 whitespace-nowrap transition-all duration-300"
                style={{
                  color: playerLevel >= level
                    ? (isDark ? '#a78bfa' : '#8b5cf6')
                    : (isDark ? '#6b7280' : '#9ca3af'),
                  fontSize: '0.75rem',
                  fontWeight: playerLevel === level ? 700 : 500
                }}
              >
                {LEVEL_TITLES[level]}
              </div>

              {/* Circle */}
              <div
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 cursor-pointer group-hover:scale-110 group-hover:shadow-xl"
                style={{
                  background: playerLevel === level
                    ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
                    : playerLevel > level
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : isDark ? '#374151' : '#e5e7eb',
                  borderColor: playerLevel === level
                    ? '#8b5cf6'
                    : playerLevel > level
                    ? '#16a34a'
                    : isDark ? '#4b5563' : '#d1d5db',
                  color: playerLevel >= level ? 'white' : isDark ? '#6b7280' : '#9ca3af',
                  fontSize: '0.85rem',
                  boxShadow: playerLevel === level
                    ? '0 0 16px rgba(139, 92, 246, 0.7)'
                    : 'none'
                }}
              >
                {level}
              </div>
            </div>

            {/* Arrow */}
            {idx < levels.length - 1 && (
              <div
                className="flex items-center transition-all duration-300"
                style={{
                  color: playerLevel > level
                    ? (isDark ? '#22c55e' : '#16a34a')
                    : (isDark ? '#4b5563' : '#d1d5db'),
                  marginTop: '24px'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/**
 * Profession Card Component - With beautiful hover effects
 */
function ProfessionCard({
  professionId,
  playerLevel,
  chosenProfession,
  onSelectProfession,
  onHoverAbility
}) {
  const abilities = getAllAbilitiesForProfession(professionId).filter(a => a.level > 5);
  const professionColor = getProfessionColor(professionId);
  const meta = PROFESSION_META[professionId];
  const isChosen = chosenProfession === professionId;
  const isDark = document.documentElement.classList.contains('dark');
  const isAvailable = playerLevel >= 5 && !chosenProfession;

  return (
    <div
      className="flex flex-col rounded-xl border transition-all duration-500 ease-out overflow-hidden cursor-pointer group"
      onClick={() => isAvailable && onSelectProfession(professionId)}
      style={{
        background: isDark
          ? (isChosen ? 'rgba(30, 41, 59, 0.8)' : 'rgba(30, 41, 59, 0.6)')
          : (isChosen ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.9)'),
        borderColor: isChosen
          ? professionColor.primary
          : isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.3)',
        borderWidth: isChosen ? '2px' : '1.5px',
        opacity: chosenProfession && !isChosen ? 0.5 : 1,
        boxShadow: isChosen
          ? isDark
            ? `0 8px 24px ${professionColor.primary}50, inset 0 1px 0 rgba(251, 191, 36, 0.1)`
            : `0 8px 24px ${professionColor.primary}40, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
          : isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.5)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        transform: 'scale(1)',
        willChange: 'transform, box-shadow'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark
          ? `0 16px 48px ${professionColor.primary}60, inset 0 1px 0 rgba(251, 191, 36, 0.15)`
          : `0 16px 48px ${professionColor.primary}50, inset 0 1px 0 rgba(255, 255, 255, 0.95)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = isChosen
          ? (isDark
            ? `0 8px 24px ${professionColor.primary}50, inset 0 1px 0 rgba(251, 191, 36, 0.1)`
            : `0 8px 24px ${professionColor.primary}40, inset 0 1px 0 rgba(255, 255, 255, 0.9)`)
          : (isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.5)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)');
      }}
    >
      {/* Banner Image - Taller, No Icon */}
      <div className="relative h-40 overflow-hidden">
        {meta.banner ? (
          <img
            src={meta.banner}
            alt={getProfessionName(professionId)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            style={{
              filter: isDark ? 'brightness(0.7)' : 'brightness(1)'
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${meta.gradient} transition-transform duration-500 group-hover:scale-110`} />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/70" />

        {/* Chosen Badge */}
        {isChosen && (
          <div
            className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              background: professionColor.primary,
              color: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            Your Path
          </div>
        )}

        {/* Ability Nodes - OVER BANNER */}
        <div className="absolute bottom-3 left-0 right-0 px-4">
          <div className="flex items-center justify-between gap-1">
            {abilities.map((ability) => {
              const isUnlocked = isChosen && playerLevel >= ability.level;
              return (
                <div
                  key={ability.level}
                  className="relative flex flex-col items-center"
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    onHoverAbility(ability, professionColor, professionId, e.currentTarget);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    onHoverAbility(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-125"
                    style={{
                      background: isUnlocked
                        ? `${professionColor.primary}50`
                        : 'rgba(0, 0, 0, 0.4)',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: isUnlocked ? professionColor.primary : 'rgba(255, 255, 255, 0.3)',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      color: 'white',
                      boxShadow: isUnlocked ? `0 4px 12px ${professionColor.primary}60` : '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {isUnlocked ? '✓' : ability.level}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3
            className="font-display text-xl font-bold mb-2 leading-tight"
            style={{ color: isDark ? '#fbbf24' : professionColor.dark }}
          >
            {getProfessionName(professionId)}
          </h3>

          {/* Historical Description - LARGER FONT */}
          <p
            className="font-serif leading-relaxed"
            style={{
              color: isDark ? '#d1d5db' : '#374151',
              fontSize: '0.9375rem',
              lineHeight: '1.55'
            }}
          >
            {meta.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Progression Tree Modal
 */
export default function ProgressionTreeModal({
  isOpen,
  onClose,
  playerLevel = 1,
  chosenProfession = null
}) {
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [hoveredAbility, setHoveredAbility] = useState(null);
  const [tooltipProfessionId, setTooltipProfessionId] = useState(null);
  const isDark = document.documentElement.classList.contains('dark');

  // Handle ESC key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allProfessions = [
    PROFESSIONS.ALCHEMIST,
    PROFESSIONS.HERBALIST,
    PROFESSIONS.SURGEON,
    PROFESSIONS.POISONER,
    PROFESSIONS.SCHOLAR,
    PROFESSIONS.COURT_PHYSICIAN
  ];

  const handleHoverAbility = (ability, professionColor, professionId, element) => {
    if (ability && element) {
      setHoveredAbility({ ability, professionColor });
      setTooltipProfessionId(professionId);
    } else {
      setHoveredAbility(null);
      setTooltipProfessionId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(41, 37, 36, 0.6)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-7xl max-h-[96vh] rounded-2xl overflow-hidden flex flex-col shadow-elevation-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 1.0) 0%, rgba(30, 41, 59, 1.0) 50%, rgba(15, 23, 42, 1.0) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 245, 235, 0.95) 50%, rgba(252, 250, 247, 0.98) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(251, 191, 36, 0.25)' : '1px solid rgba(209, 213, 219, 0.4)',
          boxShadow: isDark
            ? '0 24px 80px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(251, 191, 36, 0.15)'
            : '0 24px 80px rgba(61, 47, 36, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
        }}
      >

        {/* Decorative Background Pattern */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: '50%',
            height: '70%',
            zIndex: 0,
            overflow: 'hidden',
            opacity: 0.1,
            background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.5) 0%, transparent 70%)'
          }}
        />

        {/* Header - COMPACT */}
        <div
          className="flex-shrink-0 px-6 py-0 border-b relative z-10"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))'
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(167, 139, 250, 0.05))',
            borderColor: isDark ? 'rgba(251, 191, 36, 0.25)' : 'rgba(209, 213, 219, 0.4)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-5 flex-1">
              <h1
                className="font-display text-2xl mt-4 font-semibold"
                style={{
                  color: isDark ? '#fbbf24' : '#3d2817',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1'
                }}
              >
                PROFESSION PATHS
              </h1>
              <p
                className="font-serif text-base italic"
                style={{
                  color: isDark ? '#d1d5db' : '#6b7280',
                  fontWeight: 500
                }}
              >
                You can select one of six specializations upon reaching Level 5
              </p>

              {/* Status Badges - Inline */}
              <div className="flex flex-wrap gap-2 ml-auto">
                <span
                  className="px-3 py-1 rounded-full text-sm font-sans font-semibold"
                  style={{
                    background: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)',
                    color: isDark ? '#a78bfa' : '#6d28d9',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)'}`
                  }}
                >
                  Level {playerLevel}
                </span>
                {chosenProfession && (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-sans font-semibold"
                    style={{
                      background: isDark
                        ? `${getProfessionColor(chosenProfession).primary}30`
                        : `${getProfessionColor(chosenProfession).primary}20`,
                      color: getProfessionColor(chosenProfession).dark,
                      border: `1px solid ${getProfessionColor(chosenProfession).primary}`
                    }}
                  >
                    {getProfessionName(chosenProfession)}
                  </span>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-150 hover:bg-opacity-80 ml-4"
              style={{
                background: isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.6)' : 'rgba(209, 213, 219, 0.4)'}`,
                boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke={isDark ? '#fbbf24' : '#3d2817'}
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 px-6 relative z-10">

          {/* Level Progression */}
          <LevelProgression playerLevel={playerLevel} />

          {/* Divider */}
          <div className="flex items-center justify-center my-3">
            <div
              className="flex-1 h-px"
              style={{
                background: isDark
                  ? 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3), transparent)'
                  : 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.2), transparent)'
              }}
            />
          </div>

          {/* Specialization Section */}
          <div className="mb-6">
            <h2
              className="font-serif text-2xl font-normal text-center mb-1"
              style={{ color: isDark ? '#a78bfa' : '#8b5cf6' }}
            >
              Profession Specialization
            </h2>
            <p
              className="text-center font-serif italic text-md mb-3"
              style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
            >
              {playerLevel < 5
                ? `Unlocks at Level 5 (${5 - playerLevel} level${5 - playerLevel !== 1 ? 's' : ''} remaining)`
                : playerLevel === 5 && !chosenProfession
                ? 'Choose your specialization to unlock unique abilities'
                : 'Hover over ability nodes to see details'}
            </p>

            {/* Profession Grid - 2 rows of 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allProfessions.map((professionId) => (
                <ProfessionCard
                  key={professionId}
                  professionId={professionId}
                  playerLevel={playerLevel}
                  chosenProfession={chosenProfession}
                  onSelectProfession={setSelectedProfession}
                  onHoverAbility={handleHoverAbility}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Ability Tooltip - OVER THE BANNER */}
        {hoveredAbility && tooltipProfessionId && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="rounded-xl p-4 shadow-2xl border-2 animate-fade-in"
              style={{
                background: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: hoveredAbility.professionColor.primary,
                boxShadow: `0 16px 48px ${hoveredAbility.professionColor.primary}80`,
                minWidth: '240px',
                maxWidth: '300px',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div className="flex items-start gap-2 mb-2">
                <span
                  className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: hoveredAbility.professionColor.bg,
                    color: hoveredAbility.professionColor.dark,
                    border: `1px solid ${hoveredAbility.professionColor.primary}`
                  }}
                >
                  Level {hoveredAbility.ability.level}
                </span>
                {chosenProfession && playerLevel >= hoveredAbility.ability.level && (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-500">
                    ✓ Active
                  </span>
                )}
              </div>
              <h4
                className="font-display text-base font-bold mb-2"
                style={{ color: isDark ? '#fbbf24' : hoveredAbility.professionColor.dark }}
              >
                {hoveredAbility.ability.name}
              </h4>
              <p className="font-serif text-sm leading-relaxed" style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                {hoveredAbility.ability.description}
              </p>
            </div>
          </div>
        )}

        {/* Profession Details Panel */}
        {selectedProfession && (
          <div
            className="absolute inset-0 flex items-center justify-center p-8 z-20 animate-fade-in"
            style={{
              background: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(6px)'
            }}
            onClick={() => setSelectedProfession(null)}
          >
            <div
              className="w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar animate-slide-up"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))'
                  : 'rgba(255, 255, 255, 0.98)',
                border: `3px solid ${getProfessionColor(selectedProfession).primary}`,
                boxShadow: `0 24px 64px ${getProfessionColor(selectedProfession).primary}60`
              }}
            >
              <div className="text-center mb-6">
                <div className="text-7xl mb-4">{getProfessionIcon(selectedProfession)}</div>
                <h3
                  className="font-display text-3xl font-bold mb-3"
                  style={{ color: isDark ? '#fbbf24' : getProfessionColor(selectedProfession).dark }}
                >
                  {getProfessionName(selectedProfession)}
                </h3>
                <p
                  className="font-serif text-base leading-relaxed"
                  style={{ color: isDark ? '#d1d5db' : '#374151' }}
                >
                  {PROFESSION_META[selectedProfession].description}
                </p>
              </div>

              <div className="space-y-3">
                <h4
                  className="font-display text-xl font-bold mb-3"
                  style={{ color: isDark ? '#fbbf24' : '#1f2937' }}
                >
                  All Abilities
                </h4>
                {getAllAbilitiesForProfession(selectedProfession).map((ability) => (
                  <div
                    key={ability.level}
                    className="p-4 rounded-xl border-2"
                    style={{
                      background: isDark
                        ? 'rgba(55, 65, 81, 0.6)'
                        : getProfessionColor(selectedProfession).bg,
                      borderColor: `${getProfessionColor(selectedProfession).primary}60`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{
                          background: getProfessionColor(selectedProfession).primary,
                          color: 'white'
                        }}
                      >
                        Level {ability.level}
                      </span>
                      <span
                        className="font-display text-base font-bold"
                        style={{ color: isDark ? '#fbbf24' : '#1f2937' }}
                      >
                        {ability.name}
                      </span>
                    </div>
                    <p
                      className="font-serif text-sm leading-relaxed"
                      style={{ color: isDark ? '#d1d5db' : '#374151' }}
                    >
                      {ability.description}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedProfession(null)}
                className="w-full mt-6 px-6 py-3 rounded-xl font-sans font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${getProfessionColor(selectedProfession).primary}, ${getProfessionColor(selectedProfession).light})`,
                  boxShadow: `0 4px 16px ${getProfessionColor(selectedProfession).primary}60`
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)'};
          border-radius: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)'};
          border-radius: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? 'rgba(139, 92, 246, 0.7)' : 'rgba(139, 92, 246, 0.5)'};
        }
      `}</style>
    </div>
  );
}
