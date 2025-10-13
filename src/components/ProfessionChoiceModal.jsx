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
    [PROFESSIONS.ALCHEMIST]: { primary: '#8b5cf6', light: '#a78bfa', bg: '#f5f3ff', glow: 'rgba(139, 92, 246, 0.3)' },
    [PROFESSIONS.HERBALIST]: { primary: '#16a34a', light: '#22c55e', bg: '#f0fdf4', glow: 'rgba(22, 163, 74, 0.3)' },
    [PROFESSIONS.SURGEON]: { primary: '#dc2626', light: '#ef4444', bg: '#fef2f2', glow: 'rgba(220, 38, 38, 0.3)' },
    [PROFESSIONS.POISONER]: { primary: '#1f2937', light: '#374151', bg: '#f9fafb', glow: 'rgba(31, 41, 55, 0.3)' },
    [PROFESSIONS.SCHOLAR]: { primary: '#0ea5e9', light: '#38bdf8', bg: '#f0f9ff', glow: 'rgba(14, 165, 233, 0.3)' },
    [PROFESSIONS.COURT_PHYSICIAN]: { primary: '#f59e0b', light: '#fbbf24', bg: '#fffbeb', glow: 'rgba(245, 158, 11, 0.3)' }
  };
  return colors[professionId] || { primary: '#6b7280', light: '#9ca3af', bg: '#f9fafb', glow: 'rgba(107, 114, 128, 0.3)' };
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
function ProfessionCard({ professionId, isRecommended, onSelect, isSelected }) {
  const colors = getProfessionColor(professionId);
  const name = getProfessionName(professionId);
  const description = getProfessionDescription(professionId);
  const icon = getProfessionIcon(professionId);
  const abilities = getAbilityPreview(professionId);
  const legendaryTitle = getLegendaryTitle(professionId);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 relative"
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${colors.primary}15, ${colors.light}10)`
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
        border: isSelected ? `3px solid ${colors.primary}` : `2px solid ${colors.primary}30`,
        boxShadow: isSelected
          ? `0 20px 60px ${colors.glow}, 0 0 0 1px ${colors.primary}50`
          : `0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px ${colors.primary}20`
      }}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg z-10"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.light})`,
            color: 'white'
          }}
        >
          ⭐ Recommended
        </div>
      )}

      {/* Content */}
      <div className="p-6">
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

        {/* Abilities Preview */}
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
      </div>

      {/* Select Button */}
      <div
        className="py-4 px-6 text-center transition-all duration-200"
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
    </motion.div>
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
  const colors = getProfessionColor(profession);
  const name = getProfessionName(profession);
  const icon = getProfessionIcon(profession);
  const benefit = getImmediateBenefit(profession);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{
          border: `3px solid ${colors.primary}`,
          boxShadow: `0 25px 80px ${colors.glow}`
        }}
      >
        {/* Header */}
        <div
          className="py-6 px-8 text-center"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.light})`
          }}
        >
          <div className="text-7xl mb-3">{icon}</div>
          <h2 className="text-3xl font-bold text-white font-serif mb-2">
            Confirm Your Choice
          </h2>
          <p className="text-white/90 text-sm">
            This decision is permanent
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="text-center mb-6">
            <p className="text-lg text-ink-800 leading-relaxed mb-4">
              Are you sure you want to become a <span className="font-bold" style={{ color: colors.primary }}>{name}</span>?
            </p>

            {/* Immediate Benefit */}
            {benefit && (
              <div
                className="mb-4 p-4 rounded-xl"
                style={{
                  background: benefit.highlight ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' : `${colors.bg}`,
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

            <div className="text-sm text-ink-600 leading-relaxed space-y-2">
              <p>
                ✓ This choice will shape your journey through Mexico City
              </p>
              <p>
                ✓ You'll unlock unique abilities and exclusive quests
              </p>
              <p>
                ⚠️ Other paths will still be accessible, but at reduced efficiency
              </p>
              <p className="font-bold text-ink-900 mt-4">
                This choice cannot be changed.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
                color: '#374151',
                border: '2px solid #9ca3af'
              }}
            >
              Go Back
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.light})`,
                color: 'white',
                border: `2px solid ${colors.primary}`,
                boxShadow: `0 4px 16px ${colors.glow}`
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
  const [selectedProfession, setSelectedProfession] = useState(null);
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
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/40 via-stone-900/60 to-amber-900/40 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-7xl my-8"
        >
          {/* Main Container */}
          <div
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 245, 235, 0.95) 50%, rgba(252, 250, 247, 0.98) 100%)',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 30px 100px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            }}
          >
            {/* Header */}
            <div
              className="py-8 px-10 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #8b5cf6 100%)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-4 left-8 text-4xl opacity-50 animate-pulse">✨</div>
              <div className="absolute top-4 right-8 text-4xl opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
              <div className="absolute bottom-4 left-1/4 text-3xl opacity-30 animate-pulse" style={{ animationDelay: '0.3s' }}>⭐</div>
              <div className="absolute bottom-4 right-1/4 text-3xl opacity-30 animate-pulse" style={{ animationDelay: '0.7s' }}>⭐</div>

              <div className="text-8xl mb-4">🌟</div>
              <h1 className="text-5xl font-bold text-white mb-3 font-serif tracking-wide">
                Choose Your Profession
              </h1>
              <p className="text-xl text-purple-100 mb-2">
                You have reached Level 5
              </p>
              <p className="text-sm text-purple-200 max-w-2xl mx-auto leading-relaxed">
                This choice will define your path through Mexico City. Each profession unlocks unique abilities,
                exclusive quests, and a legendary title at Level 99. Choose wisely—this decision is permanent.
              </p>
            </div>

            {/* Skill Distribution */}
            {Object.keys(playerSkills?.knownSkills || {}).length > 0 && (
              <div className="px-10 py-6 bg-purple-50/50 border-b border-purple-200/30">
                <h3 className="text-sm font-bold text-purple-900 uppercase tracking-widest mb-3 text-center">
                  Your Journey So Far
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(playerSkills.knownSkills || {}).slice(0, 8).map(([skillId, data]) => (
                    <div
                      key={skillId}
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: '#7c3aed',
                        border: '1px solid rgba(139, 92, 246, 0.2)'
                      }}
                    >
                      {skillId.replace('_', ' ')} Lv{data.level}
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {recommendedIds.length > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-purple-800">
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
                    onSelect={() => handleSelectProfession(professionId)}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-6 bg-purple-50/30 border-t border-purple-200/30 text-center">
              <p className="text-sm text-ink-600 leading-relaxed">
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
