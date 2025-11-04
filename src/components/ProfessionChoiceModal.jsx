/**
 * Profession Choice Modal
 *
 * Appears at Level 5 - player must choose their specialization path
 * This is a PERMANENT choice that shapes the rest of the game
 *
 * Features:
 * - 6 profession cards with icons, descriptions, abilities preview
 * - Shows player's current skill distribution
 * - Recommends professions based on playstyle
 * - Confirmation dialog before locking in choice
 * - Blocks other actions until choice is made
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PROFESSIONS,
  getRecommendedProfessions,
  getProfessionName,
  getProfessionDescription,
  getProfessionIcon
} from '../core/systems/levelingSystem';
import { getAllAbilitiesForProfession } from '../core/systems/professionAbilities';

/**
 * Get profession color theme
 */
function getProfessionColor(professionId) {
  const colors = {
    [PROFESSIONS.ALCHEMIST]: { primary: '#8b5cf6', light: '#a78bfa', bg: '#f5f3ff' },
    [PROFESSIONS.HERBALIST]: { primary: '#16a34a', light: '#22c55e', bg: '#f0fdf4' },
    [PROFESSIONS.SURGEON]: { primary: '#dc2626', light: '#ef4444', bg: '#fef2f2' },
    [PROFESSIONS.POISONER]: { primary: '#1f2937', light: '#374151', bg: '#f9fafb' },
    [PROFESSIONS.SCHOLAR]: { primary: '#0ea5e9', light: '#38bdf8', bg: '#f0f9ff' },
    [PROFESSIONS.COURT_PHYSICIAN]: { primary: '#f59e0b', light: '#fbbf24', bg: '#fffbeb' }
  };
  return colors[professionId] || { primary: '#6b7280', light: '#9ca3af', bg: '#f9fafb' };
}

/**
 * Get ability preview list for profession (shows abilities at different levels)
 */
function getAbilityPreview(professionId) {
  const allAbilities = getAllAbilitiesForProfession(professionId);

  // Return first 3-4 abilities for preview
  return allAbilities.slice(0, 4).map(ability => ({
    level: ability.level,
    name: ability.name,
    description: ability.description
  }));
}

/**
 * Get legendary title for profession
 */
function getLegendaryTitle(professionId) {
  const titles = {
    [PROFESSIONS.ALCHEMIST]: 'Philosopher Supreme',
    [PROFESSIONS.HERBALIST]: 'Speaker to Plants',
    [PROFESSIONS.SURGEON]: 'Hand of Galen',
    [PROFESSIONS.POISONER]: 'Bringer of the Pale Horse',
    [PROFESSIONS.SCHOLAR]: 'Immortal Sage',
    [PROFESSIONS.COURT_PHYSICIAN]: 'Beloved of All Nations'
  };
  return titles[professionId] || 'Legendary Master';
}

/**
 * Profession Card Component
 */
function ProfessionCard({ professionId, isRecommended, onSelect, isSelected, isExpanded, onToggleExpand }) {
  const colors = getProfessionColor(professionId);
  const name = getProfessionName(professionId);
  const description = getProfessionDescription(professionId);
  const icon = getProfessionIcon(professionId);
  const abilities = getAbilityPreview(professionId);
  const legendaryTitle = getLegendaryTitle(professionId);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200 relative"
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${colors.primary}15, ${colors.light}10)`
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
        border: isSelected ? `3px solid ${colors.primary}` : `2px solid ${colors.primary}30`,
        boxShadow: isSelected
          ? `0 8px 24px rgba(0, 0, 0, 0.12)`
          : `0 2px 8px rgba(0, 0, 0, 0.06)`
      }}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10"
          style={{
            background: colors.bg,
            color: colors.primary,
            border: `1.5px solid ${colors.primary}`
          }}
        >
          Recommended
        </div>
      )}

      {/* Content - Clickable to expand/collapse */}
      <div
        className="p-6 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Icon & Name */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-3">{icon}</div>
          <h3 className="text-2xl font-bold font-serif mb-1" style={{ color: colors.primary }}>
            {name}
          </h3>
          <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold">
            Profession Specialization
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-ink-700 leading-relaxed mb-4 text-center px-2">
          {description}
        </p>

        {/* Expand/Collapse Indicator */}
        <div className="text-center mb-4">
          <div className="text-xs text-ink-500 font-semibold">
            {isExpanded ? '▼ Click to collapse details' : '▶ Click to view abilities'}
          </div>
        </div>

        {/* Abilities Preview - Collapsible */}
        {isExpanded && (
          <>
            <div
              className="rounded-lg p-3 mb-4 space-y-2"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.primary}30`
              }}
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.primary }}>
                Ability Progression
              </div>
              {abilities.map((ability, idx) => (
                <div key={idx} className="text-xs">
                  <span className="font-semibold" style={{ color: colors.primary }}>
                    L{ability.level}:
                  </span>
                  <span className="text-ink-700 ml-1">
                    {ability.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Legendary Title Preview */}
            <div className="text-center py-2 px-3 rounded-lg" style={{ background: colors.bg }}>
              <div className="text-xs text-ink-500 mb-1">Level 99 Title</div>
              <div className="text-sm font-bold font-serif italic" style={{ color: colors.primary }}>
                "{legendaryTitle}"
              </div>
            </div>
          </>
        )}
      </div>

      {/* Select Button - Only this triggers selection */}
      <div
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering expand/collapse
          onSelect();
        }}
        className="py-4 px-6 text-center transition-all duration-200 cursor-pointer hover:opacity-80"
        style={{
          background: isSelected
            ? `linear-gradient(135deg, ${colors.primary}, ${colors.light})`
            : colors.bg
        }}
      >
        <div
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: isSelected ? 'white' : colors.primary }}
        >
          {isSelected ? '✓ Selected' : 'Choose This Path'}
        </div>
      </div>
    </div>
  );
}

/**
 * Get immediate benefit text for each profession
 */
function getImmediateBenefit(professionId) {
  const benefits = {
    [PROFESSIONS.ALCHEMIST]: {
      icon: '⚗️',
      text: 'Unlock advanced alchemical transmutation',
      color: '#8b5cf6'
    },
    [PROFESSIONS.HERBALIST]: {
      icon: '🌿',
      text: 'Access to rare botanical ingredients and foraging bonuses',
      color: '#16a34a'
    },
    [PROFESSIONS.SURGEON]: {
      icon: '⚕️',
      text: 'Perform surgical procedures with expert precision',
      color: '#dc2626'
    },
    [PROFESSIONS.POISONER]: {
      icon: '☠️',
      text: 'BLACK MARKET ACCESS: Buy poisons, illicit drugs, and forbidden items immediately',
      color: '#1f2937',
      highlight: true
    },
    [PROFESSIONS.SCHOLAR]: {
      icon: '📚',
      text: 'Gain knowledge faster from all activities',
      color: '#0ea5e9'
    },
    [PROFESSIONS.COURT_PHYSICIAN]: {
      icon: '👑',
      text: 'Access to wealthy patrons and noble networks',
      color: '#f59e0b'
    }
  };
  return benefits[professionId];
}

/**
 * Confirmation Dialog
 */
function ConfirmationDialog({ profession, onConfirm, onCancel }) {
  const isDark = document.documentElement.classList.contains('dark');
  const colors = getProfessionColor(profession);
  const name = getProfessionName(profession);
  const icon = getProfessionIcon(profession);
  const benefit = getImmediateBenefit(profession);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(252, 250, 247, 0.98))',
          border: `2px solid ${colors.primary}40`,
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div
          className="py-6 px-8 text-center border-b"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}15, ${colors.light}10)`,
            borderColor: `${colors.primary}30`
          }}
        >
          <div className="text-6xl mb-3">{icon}</div>
          <h2 className="text-2xl font-bold font-serif mb-2" style={{ color: colors.primary }}>
            Confirm Your Choice
          </h2>
          <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
            This decision is permanent
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="text-center mb-6">
            <p className="text-base leading-relaxed mb-4" style={{ color: isDark ? '#e2e8f0' : '#374151' }}>
              Are you sure you want to become a <span className="font-bold" style={{ color: colors.primary }}>{name}</span>?
            </p>

            {/* Immediate Benefit */}
            {benefit && (
              <div
                className="mb-4 p-4 rounded-xl"
                style={{
                  background: benefit.highlight
                    ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
                    : colors.bg,
                  border: benefit.highlight ? '2px solid #8b0000' : `2px solid ${colors.primary}40`,
                  boxShadow: benefit.highlight ? '0 4px 16px rgba(139, 0, 0, 0.3)' : 'none'
                }}
              >
                <div className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: benefit.highlight ? '#ff6b6b' : colors.primary }}>
                  {benefit.icon} Immediate Unlock
                </div>
                <div className="text-sm font-semibold leading-relaxed" style={{ color: benefit.highlight ? '#fff' : '#374151' }}>
                  {benefit.text}
                </div>
              </div>
            )}

            <div className="text-sm leading-relaxed space-y-2" style={{ color: isDark ? '#cbd5e1' : '#6b7280' }}>
              <p>
                ✓ This choice will shape your journey through Mexico City
              </p>
              <p>
                ✓ You'll unlock unique abilities and exclusive quests
              </p>
              <p>
                ⚠️ Other paths will still be accessible, but at reduced efficiency
              </p>
              <p className="font-bold mt-4" style={{ color: isDark ? '#fbbf24' : '#1e293b' }}>
                This choice cannot be changed.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-80 active:scale-95"
              style={{
                background: isDark ? 'rgba(71, 85, 105, 0.5)' : '#e5e7eb',
                color: isDark ? '#e2e8f0' : '#374151',
                border: isDark ? '1.5px solid rgba(148, 163, 184, 0.3)' : '1.5px solid #9ca3af'
              }}
            >
              Go Back
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.light})`,
                color: 'white',
                border: `1.5px solid ${colors.primary}`
              }}
            >
              Confirm Choice
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Main Profession Choice Modal
 */
export default function ProfessionChoiceModal({
  isOpen,
  playerSkills = {},
  onChoose,
  canClose = false // Set to false to force choice before continuing
}) {
  const isDark = document.documentElement.classList.contains('dark');
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get recommended professions based on player's skills
  const recommendations = getRecommendedProfessions(playerSkills?.knownSkills || {});
  const recommendedIds = recommendations.map(r => r.profession);

  // All professions in display order
  const allProfessions = [
    PROFESSIONS.ALCHEMIST,
    PROFESSIONS.HERBALIST,
    PROFESSIONS.SURGEON,
    PROFESSIONS.POISONER,
    PROFESSIONS.SCHOLAR,
    PROFESSIONS.COURT_PHYSICIAN
  ];

  const handleSelectProfession = (professionId) => {
    setSelectedProfession(professionId);
    setShowConfirmation(true);
  };

  const handleToggleExpand = (professionId) => {
    setExpandedCard(expandedCard === professionId ? null : professionId);
  };

  const handleConfirm = () => {
    onChoose(selectedProfession);
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div
        className="fixed inset-0 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={{
          background: isDark
            ? 'linear-gradient(to br, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.90))'
            : 'linear-gradient(to br, rgba(245, 238, 223, 0.95), rgba(252, 250, 247, 0.90))'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-7xl my-8"
        >
          {/* Main Container */}
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.95))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(252, 250, 247, 0.95))',
              border: isDark ? '2px solid rgba(251, 191, 36, 0.2)' : '2px solid rgba(139, 92, 46, 0.2)',
              boxShadow: isDark
                ? '0 30px 100px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
                : '0 30px 100px rgba(92, 74, 58, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            }}
          >
            {/* Header */}
            <div
              className="py-8 px-10 text-center relative overflow-hidden border-b"
              style={{
                background: isDark
                  ? 'linear-gradient(to bottom, rgba(251, 191, 36, 0.12), rgba(245, 158, 11, 0.08))'
                  : 'linear-gradient(to bottom, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.05))',
                borderColor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)'
              }}
            >
              <div className="text-6xl mb-4">🌟</div>
              <h1
                className="text-5xl font-bold mb-3 font-serif tracking-wide"
                style={{
                  color: isDark ? '#fbbf24' : '#3d2f24'
                }}
              >
                Choose Your Profession
              </h1>
              <p
                className="text-xl mb-2"
                style={{
                  color: isDark ? '#fbbf24' : '#d97706'
                }}
              >
                You have reached Level 5
              </p>
              <p
                className="text-sm max-w-2xl mx-auto leading-relaxed"
                style={{
                  color: isDark ? '#94a3b8' : '#8b7a6a'
                }}
              >
                This choice will define your path through Mexico City. Each profession unlocks unique abilities,
                exclusive quests, and a legendary title at Level 99. Choose wisely—this decision is permanent.
              </p>
            </div>

            {/* Skill Distribution */}
            {Object.keys(playerSkills?.knownSkills || {}).length > 0 && (
              <div
                className="px-10 py-6 border-b"
                style={{
                  background: isDark ? 'rgba(251, 191, 36, 0.05)' : 'rgba(251, 191, 36, 0.05)',
                  borderColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)'
                }}
              >
                <h3
                  className="text-sm font-bold uppercase tracking-widest mb-3 text-center"
                  style={{
                    color: isDark ? '#fbbf24' : '#d97706'
                  }}
                >
                  Your Journey So Far
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(playerSkills.knownSkills || {}).slice(0, 8).map(([skillId, data]) => (
                    <div
                      key={skillId}
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                        color: isDark ? '#fbbf24' : '#d97706',
                        border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.2)'
                      }}
                    >
                      {skillId.replace('_', ' ')} Lv{data.level}
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {recommendedIds.length > 0 && (
                  <div className="mt-4 text-center">
                    <p
                      className="text-sm"
                      style={{
                        color: isDark ? '#cbd5e1' : '#78716c'
                      }}
                    >
                      <span className="font-bold">Recommended for you:</span>{' '}
                      {recommendations.map((r, i) => (
                        <span key={r.profession}>
                          {i > 0 && ', '}
                          <span className="font-bold">{getProfessionName(r.profession)}</span>
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Profession Grid */}
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProfessions.map(professionId => (
                  <ProfessionCard
                    key={professionId}
                    professionId={professionId}
                    isRecommended={recommendedIds.includes(professionId)}
                    isSelected={selectedProfession === professionId}
                    isExpanded={expandedCard === professionId}
                    onSelect={() => handleSelectProfession(professionId)}
                    onToggleExpand={() => handleToggleExpand(professionId)}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-10 py-6 border-t text-center"
              style={{
                background: isDark ? 'rgba(251, 191, 36, 0.05)' : 'rgba(251, 191, 36, 0.05)',
                borderColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)'
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: isDark ? '#94a3b8' : '#78716c'
                }}
              >
                💡 <span className="font-semibold">Tip:</span> You can still level up skills from other professions,
                but your chosen profession will grant special bonuses and unlock unique storylines.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmation && (
          <ConfirmationDialog
            profession={selectedProfession}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </>
  );
}
