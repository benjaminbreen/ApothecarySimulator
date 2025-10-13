/**
 * Player Character Modal
 *
 * Beautiful, comprehensive character sheet with tabbed navigation
 * Matches SkillsModal and ItemModalEnhanced aesthetic
 *
 * Features:
 * - Tabbed interface (Overview, Skills, Personal, Relationships, History)
 * - Spider/radar charts for skills by category
 * - Glassomorphic parchment design
 * - Fully scenario-agnostic
 */

import React, { useState } from 'react';
import SkillRadarChart from './SkillRadarChart';
import HistoricalContextCard from './HistoricalContextCard';
import RelationshipBar from './RelationshipBar';
import ProgressionTreeModal from '../../../components/ProgressionTreeModal';
import { SKILLS, SKILL_CATEGORIES, getSkillsByCategory } from '../../../core/systems/skillsSystem';

/**
 * Get category color palette
 */
function getCategoryColor(category) {
  switch (category) {
    case SKILL_CATEGORIES.MEDICAL:
      return { primary: '#16a34a', light: '#22c55e', bg: '#f0fdf4' };
    case SKILL_CATEGORIES.SOCIAL:
      return { primary: '#3b82f6', light: '#60a5fa', bg: '#eff6ff' };
    case SKILL_CATEGORIES.PRACTICAL:
      return { primary: '#f59e0b', light: '#fbbf24', bg: '#fffbeb' };
    case SKILL_CATEGORIES.SCHOLARLY:
      return { primary: '#8b5cf6', light: '#a78bfa', bg: '#f5f3ff' };
    case SKILL_CATEGORIES.COVERT:
      return { primary: '#dc2626', light: '#ef4444', bg: '#fef2f2' };
    case SKILL_CATEGORIES.LANGUAGES:
      return { primary: '#06b6d4', light: '#22d3ee', bg: '#ecfeff' };
    default:
      return { primary: '#6b7280', light: '#9ca3af', bg: '#f9fafb' };
  }
}

/**
 * Get category display name
 */
function getCategoryLabel(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function PlayerCharacterModal({
  isOpen,
  onClose,
  characterData,
  playerSkills,
  currentStats = {},
  portraitSrc,
  onOpenEquipment,
  onOpenSkillsModal,
  // Leveling system props
  playerLevel = 5,
  playerXP = 0,
  xpToNextLevel = 75,
  playerTitle = 'Experienced Apothecary',
  chosenProfession = null
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [breadcrumb, setBreadcrumb] = useState(null); // For navigation back from SkillsModal
  const [showProgressionTree, setShowProgressionTree] = useState(false);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !characterData) return null;

  const {
    name,
    age,
    title,
    level = 1,
    background,
    backgroundFields = [],
    medicalKnowledge = {},
    personalEffects = [],
    relationships = [],
    historicalContext = []
  } = characterData;

  const {
    health = 85,
    energy = 62,
    wealth = 11,
    reputation = '😐'
  } = currentStats;

  // Group skills by category for radar charts
  const skillsByCategory = {};
  if (playerSkills && playerSkills.knownSkills) {
    Object.entries(playerSkills.knownSkills).forEach(([skillId, skillData]) => {
      const skill = SKILLS[skillId];
      if (skill) {
        const category = skill.category;
        if (!skillsByCategory[category]) {
          skillsByCategory[category] = [];
        }
        skillsByCategory[category].push({
          id: skillId,
          name: skill.name,
          icon: skill.icon,
          level: skillData.level,
          xp: skillData.xp,
          category: skill.category
        });
      }
    });
  }

  // Define tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'skills', label: 'Skills', icon: '⭐', badge: Object.keys(playerSkills?.knownSkills || {}).length },
    { id: 'personal', label: 'Personal', icon: '🎒', badge: personalEffects.length },
    { id: 'relationships', label: 'Relationships', icon: '👥', badge: relationships.length },
    { id: 'history', label: 'History', icon: '📚', badge: historicalContext.length }
  ];

  // Filter out empty tabs
  const visibleTabs = tabs.filter(tab => {
    if (tab.id === 'personal' && personalEffects.length === 0) return false;
    if (tab.id === 'relationships' && relationships.length === 0) return false;
    if (tab.id === 'history' && historicalContext.length === 0) return false;
    return true;
  });

  return (
    <div
      className="fixed inset-0 bg-stone-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Container - FIXED DIMENSIONS matching SkillsModal */}
      <div
        className="relative w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-elevation-4 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.95) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: '0 24px 80px rgba(61, 47, 36, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
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
            opacity: 0.15,
            background: 'radial-gradient(circle at top right, rgba(22, 163, 74, 0.3) 0%, transparent 70%)'
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 p-2 rounded-lg transition-all duration-150 hover:bg-ink-100"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(209, 213, 219, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="#3d2817" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tab Navigation */}
        <div className="flex-shrink-0 flex border-b relative z-10" style={{
          background: 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
          borderColor: 'rgba(209, 213, 219, 0.3)'
        }}>
          {visibleTabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative font-sans"
              style={{
                fontWeight: activeTab === tab.id ? 700 : 600,
                letterSpacing: '0.08em',
                color: activeTab === tab.id ? '#16a34a' : '#6b5a47',
                background: activeTab === tab.id
                  ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))'
                  : 'transparent',
                borderLeft: idx > 0 ? '1px solid rgba(209, 213, 219, 0.2)' : 'none'
              }}
            >
              <span className="mr-2 text-base" style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon}</span>
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className="ml-2 px-1.5 py-0.5 rounded text-xs font-bold"
                  style={{
                    background: activeTab === tab.id ? '#16a34a20' : '#d1d5db20',
                    color: activeTab === tab.id ? '#16a34a' : '#6b7280'
                  }}
                >
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: 'linear-gradient(to right, #22c55e, #16a34a, #22c55e)'
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area - FIXED HEIGHT with scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10" style={{
          background: 'rgba(252, 250, 247, 0.4)'
        }}>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="p-8 space-y-6">

              {/* Hero Section */}
              <div className="flex gap-6 items-start">

                {/* Left: Portrait */}
                <div className="flex-shrink-0">
                  <img
                    src={portraitSrc}
                    alt={name}
                    className="w-64 h-64 object-cover rounded-2xl border-4 shadow-elevation-3 transition-transform duration-base hover:scale-105"
                    style={{
                      borderColor: '#16a34a',
                      filter: 'drop-shadow(0 0 20px rgba(22, 163, 74, 0.3))'
                    }}
                  />
                </div>

                {/* Right: Info */}
                <div className="flex-1 space-y-4">
                  {/* Title */}
                  <div>
                    <h1 className="text-5xl font-bold mb-2 leading-tight font-serif text-ink-900">
                      {name}
                    </h1>
                    <p className="text-lg italic font-serif text-ink-700">
                      {playerTitle} • Level {playerLevel} • Age {age}
                    </p>

                    {/* XP Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-600 font-semibold">Experience Progress</span>
                        <span className="text-ink-500 font-mono">{playerXP} / {xpToNextLevel} XP</span>
                      </div>
                      <div className="h-3 bg-ink-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full relative transition-all duration-500"
                          style={{
                            width: `${Math.round((playerXP / xpToNextLevel) * 100)}%`,
                            background: 'linear-gradient(90deg, #a78bfa 0%, #8b5cf6 50%, #a78bfa 100%)',
                            boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-white/50 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Background story */}
                  <div className="bg-white rounded-xl shadow-elevation-2 p-5 border-2 border-ink-200">
                    <h3 className="font-display text-base font-bold text-ink-900 mb-3">
                      📖 Background
                    </h3>
                    <p className="text-sm text-ink-800 font-serif leading-relaxed">
                      {background}
                    </p>
                  </div>
                </div>
              </div>

              {/* Background fields grid */}
              {backgroundFields.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {backgroundFields.map((field) => (
                    <div
                      key={field.key}
                      className="rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                        borderColor: 'rgba(22, 163, 74, 0.2)'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{field.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-sans font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                            {field.label}
                          </p>
                          <p className="text-sm font-serif text-ink-900">
                            {field.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats Section */}
              <div className="bg-white rounded-xl shadow-elevation-2 p-5 border-2 border-ink-200">
                <h3 className="font-display text-lg font-bold text-ink-900 mb-4">
                  ⚡ Current Status
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Health */}
                  <div className="text-center">
                    <div className="text-3xl mb-2">❤️</div>
                    <div className="text-2xl font-bold font-sans text-success-700">{health}</div>
                    <div className="text-xs text-ink-600 font-sans">Health</div>
                    <div className="mt-2 h-2 bg-ink-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-success-500 to-success-600 transition-all duration-500"
                        style={{ width: `${health}%` }}
                      />
                    </div>
                  </div>

                  {/* Energy */}
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-2xl font-bold font-sans text-potion-700">{energy}</div>
                    <div className="text-xs text-ink-600 font-sans">Energy</div>
                    <div className="mt-2 h-2 bg-ink-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-potion-500 to-potion-600 transition-all duration-500"
                        style={{ width: `${energy}%` }}
                      />
                    </div>
                  </div>

                  {/* Wealth */}
                  <div className="text-center">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-2xl font-bold font-sans text-warning-700">{wealth}</div>
                    <div className="text-xs text-ink-600 font-sans">Reales</div>
                  </div>

                  {/* Reputation */}
                  <div className="text-center">
                    <div className="text-3xl mb-2">{reputation}</div>
                    <div className="text-sm font-semibold font-sans text-ink-800">Reputation</div>
                    <div className="text-xs text-ink-600 font-sans">
                      {reputation === '😡' && 'Abysmal'}
                      {reputation === '😠' && 'Poor'}
                      {reputation === '😐' && 'Neutral'}
                      {reputation === '🙂' && 'Decent'}
                      {reputation === '😌' && 'Good'}
                      {reputation === '😃' && 'Excellent'}
                      {reputation === '👑' && 'Legendary'}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 space-y-3">
                  {onOpenEquipment && (
                    <button
                      onClick={() => {
                        onOpenEquipment();
                        onClose();
                      }}
                      className="w-full px-4 py-3 rounded-xl font-semibold font-sans transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                        color: 'white',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Equipment & Inventory
                    </button>
                  )}

                  {/* Progression Tree Button */}
                  <button
                    onClick={() => setShowProgressionTree(true)}
                    className="w-full px-4 py-3 rounded-xl font-semibold font-sans transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                      color: 'white',
                      boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
                    }}
                  >
                    <span className="text-xl">🌳</span>
                    View Progression Tree
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="p-8 space-y-6">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-sm mb-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-slate-800/50"
                  style={{ color: '#64748b' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Character Overview
                </button>
                <span style={{ color: '#475569' }}>/</span>
                <span style={{ color: '#e2e8f0' }} className="font-semibold">Skills & Expertise</span>
              </div>

              {/* HUD Header */}
              <div
                className="rounded-xl p-6 mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 20px rgba(139, 92, 246, 0.2)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2
                      className="text-3xl font-bold font-sans mb-2"
                      style={{
                        color: '#e2e8f0',
                        textShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                      }}
                    >
                      Skills & Expertise
                    </h2>
                    <p className="text-sm text-gray-400 font-sans leading-relaxed">
                      Your proficiency across different skill categories. Click any skill to view details.
                    </p>
                  </div>

                  {/* Action Button */}
                  {onOpenSkillsModal && (
                    <button
                      onClick={() => {
                        setBreadcrumb('character');
                        onOpenSkillsModal();
                      }}
                      className="px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                        color: 'white',
                        boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      📊 Manage Skills
                    </button>
                  )}
                </div>

                {/* Player Level & XP - HUD Style */}
                {playerSkills && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span
                          className="text-4xl font-bold font-mono"
                          style={{
                            background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 20px rgba(167, 139, 250, 0.5)'
                          }}
                        >
                          LV {playerSkills.level || 1}
                        </span>
                        <span className="text-sm text-gray-400 font-sans">
                          {playerSkills.xp || 0} / {playerSkills.xpToNextLevel || 20} XP
                        </span>
                      </div>
                      {/* XP Progress Bar - Glowing */}
                      <div
                        className="h-3 rounded-full overflow-hidden"
                        style={{ background: 'rgba(30, 41, 59, 0.8)' }}
                      >
                        <div
                          className="h-full transition-all duration-500 relative"
                          style={{
                            width: `${((playerSkills.xp || 0) / (playerSkills.xpToNextLevel || 20)) * 100}%`,
                            background: 'linear-gradient(90deg, #8b5cf6, #a78bfa, #c4b5fd)',
                            boxShadow: '0 0 12px rgba(139, 92, 246, 0.8)'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40" />
                        </div>
                      </div>
                    </div>

                    <div
                      className="px-5 py-3 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                        boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      <div className="text-3xl font-bold text-white font-mono">
                        {playerSkills.skillPoints || 0}
                      </div>
                      <div className="text-xs text-purple-100 font-sans uppercase tracking-wider">
                        Skill Points
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Radar Charts - 2 Rows of 3 Columns (for 6 categories) */}
              {Object.keys(skillsByCategory).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.entries(skillsByCategory).map(([category, skills]) => (
                    <SkillRadarChart
                      key={category}
                      skills={skills}
                      category={category}
                      categoryLabel={getCategoryLabel(category)}
                      size={280}
                      onSkillClick={(skillId) => {
                        if (onOpenSkillsModal) {
                          setBreadcrumb('character');
                          onOpenSkillsModal();
                          // Could potentially pass skillId to auto-select in SkillsModal
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4 opacity-20">⭐</div>
                  <p className="text-base font-sans font-medium text-gray-400">
                    No skills learned yet
                  </p>
                </div>
              )}

              {/* Medical Knowledge */}
              {medicalKnowledge.knownMethods && medicalKnowledge.knownMethods.length > 0 && (
                <div className="bg-white rounded-xl shadow-elevation-2 p-5 border-2 border-ink-200">
                  <h4 className="font-display text-base font-bold text-ink-900 mb-3">
                    ⚗️ Known Methods
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {medicalKnowledge.knownMethods.map((method) => (
                      <span
                        key={method}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold font-sans"
                        style={{
                          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                          color: 'white'
                        }}
                      >
                        {method}
                      </span>
                    ))}
                  </div>

                  {medicalKnowledge.specialties && medicalKnowledge.specialties.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-ink-600 font-sans mb-1 font-semibold">Specialties:</p>
                      <p className="text-sm text-ink-700 font-serif">
                        {medicalKnowledge.specialties.join(' • ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* PERSONAL TAB */}
          {activeTab === 'personal' && (
            <div className="p-8 space-y-4">
              <h2 className="text-3xl font-bold text-ink-900 mb-4 font-serif">Personal Effects</h2>
              <p className="text-sm text-ink-600 mb-6 font-sans leading-relaxed">
                Items of personal significance that define who you are.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personalEffects.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl p-5 border-2 transition-all duration-200 hover:shadow-lg group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                      borderColor: 'rgba(22, 163, 74, 0.2)'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-sans font-bold text-sm text-ink-900">
                            {item.name}
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded-full font-sans font-semibold flex-shrink-0"
                            style={{
                              background: 'rgba(22, 163, 74, 0.1)',
                              color: '#16a34a'
                            }}>
                            {item.significance}
                          </span>
                        </div>
                        <p className="text-xs text-ink-700 font-serif leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RELATIONSHIPS TAB */}
          {activeTab === 'relationships' && (
            <div className="p-8 space-y-4">
              <h2 className="text-3xl font-bold text-ink-900 mb-4 font-serif">Relationships</h2>
              <p className="text-sm text-ink-600 mb-6 font-sans leading-relaxed">
                Your connections with notable individuals in the world.
              </p>

              <div className="space-y-4">
                {relationships.map((rel) => (
                  <RelationshipBar
                    key={rel.npcId}
                    npcName={rel.name}
                    npcType={rel.type}
                    score={rel.score}
                    emoji={rel.emoji}
                    events={rel.events || []}
                  />
                ))}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="p-8 space-y-4">
              <h2 className="text-3xl font-bold text-ink-900 mb-4 font-serif">Historical Context</h2>
              <p className="text-sm text-ink-600 mb-6 font-sans leading-relaxed">
                Understanding the world and times you inhabit.
              </p>

              <div className="space-y-3">
                {historicalContext.map((context) => (
                  <HistoricalContextCard
                    key={context.id}
                    title={context.title}
                    icon={context.icon}
                    summary={context.summary}
                    content={context.content}
                    source={context.source}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Progression Tree Modal */}
      <ProgressionTreeModal
        isOpen={showProgressionTree}
        onClose={() => setShowProgressionTree(false)}
        playerLevel={playerLevel}
        chosenProfession={chosenProfession}
      />
    </div>
  );
}
