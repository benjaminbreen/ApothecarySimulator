/**
 * Skills Modal
 *
 * Production-ready skills viewer with:
 * - Fixed dimensions matching ReputationModal (max-w-5xl, h-[85vh])
 * - High information density with multiple detailed tabs
 * - Known skills with level-up functionality
 * - Skills in training with progress tracking
 * - Available skills to learn
 * - Visual progress indicators and skill effects
 * - Glassomorphic parchment aesthetic
 * - Comprehensive skill management interface
 */

import React, { useState } from 'react';
import {
  SKILLS,
  SKILL_CATEGORIES,
  getSkillsByCategory,
  getAllSkills
} from '../core/systems/skillsSystem';

/**
 * Get color palette based on skill category
 */
function getCategoryColor(category) {
  switch (category) {
    case SKILL_CATEGORIES.MEDICAL:
      return { primary: '#16a34a', light: '#22c55e', glow: 'rgba(22, 163, 74, 0.3)', bg: '#f0fdf4' }; // green
    case SKILL_CATEGORIES.SOCIAL:
      return { primary: '#3b82f6', light: '#60a5fa', glow: 'rgba(59, 130, 246, 0.3)', bg: '#eff6ff' }; // blue
    case SKILL_CATEGORIES.PRACTICAL:
      return { primary: '#f59e0b', light: '#fbbf24', glow: 'rgba(245, 158, 11, 0.3)', bg: '#fffbeb' }; // amber
    case SKILL_CATEGORIES.SCHOLARLY:
      return { primary: '#8b5cf6', light: '#a78bfa', glow: 'rgba(139, 92, 246, 0.3)', bg: '#f5f3ff' }; // purple
    case SKILL_CATEGORIES.COVERT:
      return { primary: '#dc2626', light: '#ef4444', glow: 'rgba(220, 38, 38, 0.3)', bg: '#fef2f2' }; // red
    case SKILL_CATEGORIES.LANGUAGES:
      return { primary: '#06b6d4', light: '#22d3ee', glow: 'rgba(6, 182, 212, 0.3)', bg: '#ecfeff' }; // cyan
    default:
      return { primary: '#6b7280', light: '#9ca3af', glow: 'rgba(107, 114, 128, 0.3)', bg: '#f9fafb' }; // gray
  }
}

/**
 * Info card component with expandable content
 */
function InfoCard({ title, icon, color, children, expanded, onToggle, badge }) {
  const isDark = document.documentElement.classList.contains('dark');
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
        border: `1.5px solid ${color}${isDark ? '40' : '20'}`,
        boxShadow: expanded
          ? (isDark
            ? `0 6px 20px ${color}20, inset 0 1px 0 rgba(251, 191, 36, 0.1)`
            : `0 6px 20px ${color}15, inset 0 1px 0 rgba(255, 255, 255, 0.9)`)
          : (isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(251, 191, 36, 0.05)'
            : '0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)')
      }}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between transition-all duration-150"
        style={{
          background: expanded ? `${color}08` : 'transparent'
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{icon}</span>
          <h3
            className="text-sm font-bold uppercase tracking-wider font-sans"
            style={{
              color: color,
              letterSpacing: '0.08em'
            }}
          >
            {title}
          </h3>
          {badge && (
            <span
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{
                background: `${color}20`,
                color: color
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <svg
          className="w-4 h-4 transition-transform duration-200"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            color: color
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="px-4 pb-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Compact Skill Card (Grid View)
 */
function CompactSkillCard({ skillId, level, xp, canLevelUp, onLevelUp, onClick }) {
  const skill = SKILLS[skillId];
  if (!skill) return null;

  const colors = getCategoryColor(skill.category);
  const xpRequired = skill.xpPerLevel || 20;
  const xpProgress = Math.round((xp / xpRequired) * 100);
  const isMaxLevel = level >= skill.maxLevel;

  return (
    <div
      onClick={onClick}
      className="rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-lg group"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
        border: `1.5px solid ${colors.primary}20`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="text-2xl flex-shrink-0">{skill.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-ink-900 truncate">{skill.name}</h3>
            <span
              className="text-xs px-2 py-0.5 rounded font-bold ml-2 flex-shrink-0"
              style={{
                background: `${colors.primary}20`,
                color: colors.primary
              }}
            >
              Lv {level}
            </span>
          </div>
          <p className="text-xs text-ink-600 line-clamp-2 leading-tight">{skill.description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {!isMaxLevel && (
        <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${xpProgress}%`,
              background: `linear-gradient(90deg, ${colors.light}, ${colors.primary})`
            }}
          />
        </div>
      )}

      {/* Level Up Button */}
      {canLevelUp && !isMaxLevel && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLevelUp(skillId);
          }}
          className="w-full px-2 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-md"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.light})`,
            color: 'white'
          }}
        >
          ⬆️ Level Up
        </button>
      )}

      {isMaxLevel && (
        <div className="text-center text-xs font-bold uppercase tracking-wider" style={{ color: colors.primary }}>
          ★ MASTERED ★
        </div>
      )}
    </div>
  );
}

/**
 * Skill Row (List View)
 */
function SkillRow({ skillId, level, xp, canLevelUp, onLevelUp }) {
  const skill = SKILLS[skillId];
  if (!skill) return null;

  const colors = getCategoryColor(skill.category);
  const xpRequired = skill.xpPerLevel || 20;
  const xpProgress = Math.round((xp / xpRequired) * 100);
  const isMaxLevel = level >= skill.maxLevel;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:shadow-md"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
        border: `1.5px solid ${colors.primary}20`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
    >
      <span className="text-2xl flex-shrink-0">{skill.icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-ink-900">{skill.name}</h3>
          <span
            className="text-xs px-2 py-0.5 rounded font-bold"
            style={{
              background: `${colors.primary}20`,
              color: colors.primary
            }}
          >
            Level {level}/{skill.maxLevel}
          </span>
        </div>
        <p className="text-xs text-ink-600 mb-2">{skill.description}</p>

        {!isMaxLevel && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${xpProgress}%`,
                  background: `linear-gradient(90deg, ${colors.light}, ${colors.primary})`
                }}
              />
            </div>
            <span className="text-xs text-ink-500 font-sans min-w-[60px] text-right">
              {xp}/{xpRequired} XP
            </span>
          </div>
        )}

        {isMaxLevel && (
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.primary }}>
            ★ MASTERED ★
          </div>
        )}
      </div>

      {canLevelUp && !isMaxLevel && (
        <button
          onClick={() => onLevelUp(skillId)}
          className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:shadow-lg flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.light})`,
            color: 'white'
          }}
        >
          ⬆️ Level Up
        </button>
      )}
    </div>
  );
}

/**
 * Learning skill card with progress bar
 */
function LearningSkillCard({ skillId, xp }) {
  const skill = SKILLS[skillId];
  if (!skill) return null;

  const colors = getCategoryColor(skill.category);
  const xpRequired = skill.xpPerLevel || 20;
  const progress = Math.round((xp / xpRequired) * 100);

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
        border: `1.5px solid ${colors.primary}20`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{skill.icon}</span>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-ink-900">{skill.name}</h3>
          <p className="text-xs text-ink-600 mt-1">{skill.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-600 font-sans font-semibold">Learning Progress</span>
          <span className="text-ink-500 font-sans">{xp} / {xpRequired} XP</span>
        </div>
        <div className="h-3 bg-ink-100 rounded-full overflow-hidden">
          <div
            className="h-full relative transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${colors.light}, ${colors.primary})`,
              boxShadow: `0 0 8px ${colors.glow}`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-white/50 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Available skill card (can be learned)
 */
function AvailableSkillCard({ skillId, canAfford, onLearnSkill }) {
  const skill = SKILLS[skillId];
  if (!skill) return null;

  const colors = getCategoryColor(skill.category);

  return (
    <div
      className="p-4 rounded-xl transition-all duration-200 hover:shadow-md"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
        border: `1.5px solid ${colors.primary}20`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        opacity: canAfford ? 1 : 0.6
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{skill.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-sm text-ink-900">{skill.name}</h3>
            <span
              className="text-xs px-2 py-0.5 rounded font-bold uppercase"
              style={{
                background: colors.bg,
                color: colors.primary
              }}
            >
              {skill.category}
            </span>
          </div>
          <p className="text-xs text-ink-600">{skill.description}</p>
        </div>
      </div>

      {/* First Level Effect */}
      {skill.effects[1] && (
        <div
          className="text-xs p-2 rounded mb-3"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.primary}20`
          }}
        >
          <span className="font-bold" style={{ color: colors.primary }}>Level 1:</span> {skill.effects[1].description}
        </div>
      )}

      {/* Learn Button */}
      <button
        onClick={() => onLearnSkill(skillId)}
        disabled={!canAfford}
        className="w-full px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: canAfford
            ? `linear-gradient(135deg, ${colors.primary}, ${colors.light})`
            : '#d1d5db',
          color: 'white',
          boxShadow: canAfford ? `0 4px 12px ${colors.glow}` : 'none'
        }}
      >
        📚 Learn Skill (1 Point)
      </button>
    </div>
  );
}

export default function SkillsModal({
  isOpen,
  onClose,
  playerSkills,
  onLearnSkill,
  onLevelUpSkill
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const isDark = document.documentElement.classList.contains('dark');

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

  if (!isOpen || !playerSkills) return null;

  const {
    level = 1,
    xp = 0,
    xpToNextLevel = 20,
    skillPoints = 0,
    knownSkills = {},
    learningSkills = []
  } = playerSkills;

  // Calculate XP percentage
  const xpPercentage = Math.round((xp / xpToNextLevel) * 100);

  // Get known, learning, and available skills
  const knownSkillIds = Object.keys(knownSkills || {});
  const learningSkillIds = learningSkills.map(l => l.skillId);
  const allSkills = getAllSkills();
  const availableSkills = allSkills.filter(
    skill => !knownSkillIds.includes(skill.id) && !learningSkillIds.includes(skill.id)
  );

  // Toggle expandable sections
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Calculate stats
  const totalSkillsKnown = knownSkillIds.length;
  const averageSkillLevel = knownSkillIds.length > 0
    ? Math.round(Object.values(knownSkills).reduce((sum, s) => sum + s.level, 0) / knownSkillIds.length)
    : 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'known', label: 'Known Skills', icon: '⭐', badge: totalSkillsKnown },
    { id: 'learning', label: 'Learning', icon: '📖', badge: learningSkills.length },
    { id: 'available', label: 'Available', icon: '🎓', badge: availableSkills.length }
  ];

  return (
    <div
      className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4"
      style={{
        background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(41, 37, 36, 0.5)'
      }}
      onClick={onClose}
    >
      {/* Modal Container - FIXED DIMENSIONS */}
      <div
        className="relative w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-elevation-4 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 1.0) 0%, rgba(30, 41, 59, 1.0) 50%, rgba(15, 23, 42, 1.0) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.95) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: isDark
            ? '0 24px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
            : '0 24px 80px rgba(61, 47, 36, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
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
            background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.3) 0%, transparent 70%)'
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
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative font-sans"
              style={{
                fontWeight: activeTab === tab.id ? 700 : 600,
                letterSpacing: '0.08em',
                color: activeTab === tab.id ? '#8b5cf6' : '#6b5a47',
                background: activeTab === tab.id
                  ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))'
                  : 'transparent',
                borderLeft: idx > 0 ? '1px solid rgba(209, 213, 219, 0.2)' : 'none'
              }}
            >
              <span className="mr-2 text-base" style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon}</span>
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className="ml-2 px-1.5 py-0.5 rounded text-xs font-bold"
                  style={{
                    background: activeTab === tab.id ? '#8b5cf620' : '#d1d5db20',
                    color: activeTab === tab.id ? '#8b5cf6' : '#6b7280'
                  }}
                >
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: 'linear-gradient(to right, #a78bfa, #8b5cf6, #a78bfa)'
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
                {/* Level Circle */}
                <div className="flex-shrink-0">
                  <div
                    className="w-48 h-48 rounded-full flex flex-col items-center justify-center relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(167, 139, 250, 0.1))',
                      border: '3px solid rgba(139, 92, 246, 0.4)',
                      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <div className="text-7xl mb-2">⭐</div>
                    <div className="text-5xl font-bold font-mono text-purple-600">
                      {level}
                    </div>
                    <div className="text-xs text-ink-500 font-sans mt-1">LEVEL</div>
                  </div>
                </div>

                {/* Title & Summary */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-5xl font-bold mb-3 leading-tight font-serif text-ink-900" style={{
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}>
                    Skills & Expertise
                  </h1>

                  <p className="text-lg italic font-serif text-ink-700 mb-4" style={{ fontWeight: 500 }}>
                    Maria de Lima's Abilities & Knowledge
                  </p>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-sans"
                      style={{
                        background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {skillPoints} Skill Points
                    </span>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold font-sans"
                      style={{
                        background: 'rgba(245, 238, 223, 0.7)',
                        color: '#5c4a3a',
                        border: '1px solid rgba(209, 213, 219, 0.3)'
                      }}
                    >
                      {totalSkillsKnown} Skills Known
                    </span>
                  </div>

                  {/* XP Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-700 font-semibold">Next Level</span>
                      <span className="text-ink-600 font-mono">{xp} / {xpToNextLevel} XP</span>
                    </div>
                    <div className="h-4 bg-ink-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full relative transition-all duration-500"
                        style={{
                          width: `${xpPercentage}%`,
                          background: 'linear-gradient(90deg, #a78bfa 0%, #8b5cf6 50%, #a78bfa 100%)',
                          boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-white/50 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05))',
                    border: '1.5px solid rgba(16, 185, 129, 0.2)',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
                  }}
                >
                  <div className="text-3xl mb-1">📚</div>
                  <div className="text-xs font-bold text-emerald-900 mb-1 uppercase tracking-wide">Known Skills</div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">{totalSkillsKnown}</div>
                </div>

                <div className="p-4 rounded-xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.05))',
                    border: '1.5px solid rgba(59, 130, 246, 0.2)',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
                  }}
                >
                  <div className="text-3xl mb-1">📖</div>
                  <div className="text-xs font-bold text-blue-900 mb-1 uppercase tracking-wide">Learning</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">{learningSkills.length}</div>
                </div>

                <div className="p-4 rounded-xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(167, 139, 250, 0.05))',
                    border: '1.5px solid rgba(139, 92, 246, 0.2)',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
                  }}
                >
                  <div className="text-3xl mb-1">⭐</div>
                  <div className="text-xs font-bold text-purple-900 mb-1 uppercase tracking-wide">Avg Level</div>
                  <div className="text-2xl font-bold text-purple-600 mt-1">{averageSkillLevel}</div>
                </div>
              </div>

              {/* Skills by Category */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ink-600 uppercase tracking-widest font-sans mb-3">
                  Skills by Category
                </h3>
                {Object.values(SKILL_CATEGORIES).map(category => {
                  const categorySkills = getSkillsByCategory(category);
                  const knownInCategory = knownSkillIds.filter(id => SKILLS[id] && SKILLS[id].category === category);
                  const colors = getCategoryColor(category);

                  return (
                    <div
                      key={category}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(209, 213, 219, 0.3)'
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-sm font-semibold text-ink-800 capitalize">{category}</span>
                          <span className="text-xs text-ink-500 ml-2">
                            {knownInCategory.length} / {categorySkills.length} known
                          </span>
                        </div>
                        <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${(knownInCategory.length / categorySkills.length) * 100}%`,
                              background: `linear-gradient(90deg, ${colors.light}, ${colors.primary})`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* KNOWN SKILLS TAB */}
          {activeTab === 'known' && (
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-ink-900 font-serif">Known Skills</h2>
                  <p className="text-sm text-ink-600 font-sans leading-relaxed mt-1">
                    Your mastered skills and abilities. {viewMode === 'grid' ? 'Click to see more details.' : ''}
                  </p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-ink-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                    style={{
                      background: viewMode === 'grid' ? 'white' : 'transparent',
                      color: viewMode === 'grid' ? '#8b5cf6' : '#6b7280',
                      boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                    style={{
                      background: viewMode === 'list' ? 'white' : 'transparent',
                      color: viewMode === 'list' ? '#8b5cf6' : '#6b7280',
                      boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List
                  </button>
                </div>
              </div>

              {knownSkillIds.length === 0 ? (
                <p className="text-center text-ink-500 py-8">No skills learned yet</p>
              ) : (
                <>
                  {/* Grid View */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {knownSkillIds.map(skillId => {
                        const skillData = knownSkills[skillId];
                        if (!skillData) return null;
                        return (
                          <CompactSkillCard
                            key={skillId}
                            skillId={skillId}
                            level={skillData.level}
                            xp={skillData.xp}
                            canLevelUp={skillPoints > 0}
                            onLevelUp={onLevelUpSkill}
                            onClick={() => toggleSection(skillId)}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* List View */}
                  {viewMode === 'list' && (
                    <div className="space-y-3">
                      {knownSkillIds.map(skillId => {
                        const skillData = knownSkills[skillId];
                        if (!skillData) return null;
                        return (
                          <SkillRow
                            key={skillId}
                            skillId={skillId}
                            level={skillData.level}
                            xp={skillData.xp}
                            canLevelUp={skillPoints > 0}
                            onLevelUp={onLevelUpSkill}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* LEARNING TAB */}
          {activeTab === 'learning' && (
            <div className="p-8 space-y-4">
              <h2 className="text-3xl font-bold text-ink-900 dark:text-amber-100 mb-4 font-serif">Skills in Training</h2>
              <p className="text-sm text-ink-600 dark:text-stone-300 mb-6 font-sans leading-relaxed">
                Skills you're actively learning. Gain XP through practice and gameplay to master them.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningSkills.length === 0 ? (
                  <div className="col-span-2">
                    <p className="text-center text-ink-500 py-8">Not currently learning any skills</p>
                    <p className="text-center text-sm text-ink-400">
                      Use a skill point in the "Available" tab to start learning a new skill
                    </p>
                  </div>
                ) : (
                  learningSkills.map(learning => (
                    <LearningSkillCard
                      key={learning.skillId}
                      skillId={learning.skillId}
                      xp={learning.xp}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* AVAILABLE TAB */}
          {activeTab === 'available' && (
            <div className="p-8 space-y-4">
              <h2 className="text-3xl font-bold text-ink-900 dark:text-amber-100 mb-4 font-serif">Available Skills</h2>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-ink-600 font-sans leading-relaxed">
                  Skills you can learn. Requires 1 skill point per skill.
                </p>
                <span className="px-3 py-1.5 rounded-lg text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  {skillPoints} Points Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSkills.length === 0 ? (
                  <p className="col-span-2 text-center text-ink-500 py-8">All skills learned!</p>
                ) : (
                  availableSkills.map(skill => (
                    <AvailableSkillCard
                      key={skill.id}
                      skillId={skill.id}
                      canAfford={skillPoints > 0}
                      onLearnSkill={onLearnSkill}
                    />
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
