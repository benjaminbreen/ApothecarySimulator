/**
 * Enhanced Reputation Modal
 *
 * Production-ready reputation viewer with:
 * - Fixed dimensions matching ItemModal (max-w-5xl, h-[85vh])
 * - High information density with multiple detailed tabs
 * - Detailed faction breakdowns with relationship history
 * - Visual progress indicators and trend analysis
 * - Expandable sections for mechanics and strategies
 * - Glassomorphic parchment aesthetic
 * - Comprehensive gameplay guidance
 */

import React, { useState } from 'react';
import { FACTION_INFO, FACTIONS, getFactionStanding, getReputationTier, INITIAL_REPUTATION } from '../core/systems/reputationSystem';

/**
 * Get color palette based on reputation score
 */
function getReputationColor(value) {
  if (value >= 80) return { primary: '#10b981', light: '#34d399', glow: 'rgba(16, 185, 129, 0.3)' }; // green
  if (value >= 70) return { primary: '#34d399', light: '#6ee7b7', glow: 'rgba(52, 211, 153, 0.3)' }; // light green
  if (value >= 60) return { primary: '#84cc16', light: '#a3e635', glow: 'rgba(132, 204, 22, 0.3)' }; // yellow-green
  if (value >= 50) return { primary: '#eab308', light: '#facc15', glow: 'rgba(234, 179, 8, 0.3)' }; // yellow
  if (value >= 40) return { primary: '#f59e0b', light: '#fbbf24', glow: 'rgba(245, 158, 11, 0.3)' }; // yellow-orange
  if (value >= 30) return { primary: '#f97316', light: '#fb923c', glow: 'rgba(249, 115, 22, 0.3)' }; // orange
  if (value >= 20) return { primary: '#ef4444', light: '#f87171', glow: 'rgba(239, 68, 68, 0.3)' }; // red-orange
  return { primary: '#dc2626', light: '#ef4444', glow: 'rgba(220, 38, 38, 0.3)' }; // red
}

/**
 * Info card component with expandable content (matches ItemModal pattern)
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
 * Detailed faction card with expandable information
 */
function FactionCard({ factionId, score, expanded, onToggle }) {
  const info = FACTION_INFO[factionId];
  const standing = getFactionStanding(score);
  const colors = getReputationColor(score);

  // Get description based on standing
  const standingDescriptions = {
    'Allied': `The ${info.name} regard you as a trusted ally and respected figure. They offer preferential treatment, share insider information, and come to your defense when needed.`,
    'Friendly': `The ${info.name} view you favorably and are generally cooperative. They're willing to help and offer fair treatment in most matters.`,
    'Neutral': `The ${info.name} have no strong opinion about you. They conduct business as usual but won't go out of their way to help or hinder you.`,
    'Unfriendly': `The ${info.name} regard you with suspicion or mild hostility. They may charge higher prices, provide slower service, or exclude you from opportunities.`,
    'Hostile': `The ${info.name} actively oppose you and may work to undermine your efforts. They refuse service, spread negative rumors, or even attempt sabotage.`
  };

  return (
    <InfoCard
      title={info.name}
      icon={info.icon}
      color={colors.primary}
      expanded={expanded}
      onToggle={onToggle}
      badge={standing}
    >
      <div className="space-y-3">
        {/* Score and Progress Bar */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold font-mono" style={{ color: colors.primary }}>
            {score}
          </span>
          <span className="text-sm text-ink-600 dark:text-stone-400 font-sans">/ 100</span>
        </div>

        <div className="h-3 bg-ink-100 dark:bg-slate-700 rounded-full overflow-hidden" style={{
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <div
            className="h-full relative transition-all duration-500"
            style={{
              width: `${score}%`,
              background: `linear-gradient(90deg, ${colors.light} 0%, ${colors.primary} 50%, ${colors.light} 100%)`,
              boxShadow: `0 0 8px ${colors.glow}`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-white/50 rounded-full"></div>
          </div>
        </div>

        {/* Standing Description */}
        {expanded && (
          <>
            <p className="text-sm leading-relaxed font-sans text-ink-700 dark:text-stone-300 pt-2" style={{ lineHeight: '1.6' }}>
              {standingDescriptions[standing]}
            </p>

            {/* Faction Details */}
            <div
              className="mt-3 p-3 rounded-lg text-sm font-sans text-ink-600 dark:text-stone-300"
              style={{
                background: `${info.color}08`,
                border: `1px solid ${info.color}20`
              }}
            >
              <p className="leading-relaxed" style={{ lineHeight: '1.6' }}>
                {info.description}
              </p>
            </div>

            {/* Benefits/Consequences */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">BENEFITS</div>
                <ul className="text-xs text-emerald-800 dark:text-emerald-400 space-y-0.5">
                  {score >= 80 && <li>• Special discounts</li>}
                  {score >= 80 && <li>• Insider information</li>}
                  {score >= 60 && <li>• Priority service</li>}
                  {score >= 60 && <li>• Fair treatment</li>}
                  {score < 60 && <li className="text-ink-500 dark:text-stone-500">• None currently</li>}
                </ul>
              </div>
              <div className="p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40">
                <div className="text-xs font-bold text-red-900 dark:text-red-300 mb-1">RISKS</div>
                <ul className="text-xs text-red-800 dark:text-red-400 space-y-0.5">
                  {score < 40 && <li>• Higher prices</li>}
                  {score < 40 && <li>• Refused service</li>}
                  {score < 20 && <li>• Active sabotage</li>}
                  {score < 20 && <li>• Social exclusion</li>}
                  {score >= 40 && <li className="text-ink-500 dark:text-stone-500">• None currently</li>}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </InfoCard>
  );
}

export default function ReputationModal({ isOpen, onClose, reputation, initialTab = 'overview', initialFaction = null }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedSections, setExpandedSections] = useState({});
  const isDark = document.documentElement.classList.contains('dark');
  const factionRefs = React.useRef({});

  // Initialize tab and expand/scroll to faction when modal opens with initialFaction
  React.useEffect(() => {
    if (isOpen && initialFaction) {
      // Switch to factions tab
      setActiveTab('factions');

      // Expand the specific faction
      setExpandedSections(prev => ({
        ...prev,
        [initialFaction]: true
      }));

      // Scroll to faction after a brief delay to ensure rendering
      setTimeout(() => {
        const factionElement = factionRefs.current[initialFaction];
        if (factionElement) {
          factionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else if (isOpen) {
      // Reset to initial tab if no faction specified
      setActiveTab(initialTab);
    }
  }, [isOpen, initialFaction, initialTab]);

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

  if (!isOpen) return null;

  // Use initial reputation if not provided
  const repData = reputation || INITIAL_REPUTATION;
  const overallTier = getReputationTier(repData.overall);
  const overallColors = getReputationColor(repData.overall);

  // Toggle expandable sections
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Calculate faction statistics
  const factionScores = Object.values(repData.factions);
  const avgScore = Math.round(factionScores.reduce((sum, val) => sum + val, 0) / factionScores.length);
  const highestFaction = Object.keys(repData.factions).reduce((a, b) =>
    repData.factions[a] > repData.factions[b] ? a : b
  );
  const lowestFaction = Object.keys(repData.factions).reduce((a, b) =>
    repData.factions[a] < repData.factions[b] ? a : b
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'factions', label: 'Factions', icon: '⚔️' },
    { id: 'mechanics', label: 'Mechanics', icon: '⚙️' },
    { id: 'strategy', label: 'Strategy', icon: '💡' }
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
            background: `radial-gradient(circle at top right, ${overallColors.glow} 0%, transparent 70%)`
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 p-2 rounded-lg transition-all duration-150"
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            border: isDark ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
            boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(243, 244, 246, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke={isDark ? '#fbbf24' : '#3d2817'} viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tab Navigation */}
        <div className="flex-shrink-0 flex border-b relative z-10" style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
            : 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
          borderColor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(209, 213, 219, 0.3)'
        }}>
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative font-sans"
              style={{
                fontWeight: activeTab === tab.id ? 700 : 600,
                letterSpacing: '0.08em',
                color: activeTab === tab.id
                  ? (isDark ? '#fbbf24' : overallColors.primary)
                  : (isDark ? '#a8a29e' : '#6b5a47'),
                background: activeTab === tab.id
                  ? (isDark
                    ? 'linear-gradient(to bottom, rgba(51, 65, 85, 0.9), rgba(30, 41, 59, 0.8))'
                    : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))')
                  : 'transparent',
                borderLeft: idx > 0
                  ? (isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.2)')
                  : 'none'
              }}
            >
              <span className="mr-2 text-base" style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: isDark
                      ? 'linear-gradient(to right, #fbbf24, #f59e0b, #fbbf24)'
                      : `linear-gradient(to right, ${overallColors.light}, ${overallColors.primary}, ${overallColors.light})`
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area - FIXED HEIGHT with scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10" style={{
          background: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(252, 250, 247, 0.4)'
        }}>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="p-8 space-y-6">

              {/* Hero Section */}
              <div className="flex gap-6 items-start">
                {/* Overall Score Circle */}
                <div className="flex-shrink-0">
                  <div
                    className="w-48 h-48 rounded-full flex flex-col items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${overallColors.light}20, ${overallColors.primary}10)`,
                      border: `3px solid ${overallColors.primary}40`,
                      boxShadow: `0 8px 32px ${overallColors.glow}, inset 0 2px 8px rgba(255, 255, 255, 0.8)`
                    }}
                  >
                    <div className="text-7xl mb-2">{overallTier.emoji}</div>
                    <div
                      className="text-5xl font-bold font-mono"
                      style={{ color: overallColors.primary }}
                    >
                      {repData.overall}
                    </div>
                    <div className="text-xs text-ink-500 dark:text-stone-400 font-sans mt-1">/ 100</div>
                  </div>
                </div>

                {/* Title & Summary */}
                <div className="flex-1 min-w-0">
                  <h1
                    className="text-5xl font-bold mb-3 leading-tight font-serif text-ink-900 dark:text-amber-100"
                    style={{
                      letterSpacing: '-0.02em',
                      lineHeight: '1.1'
                    }}
                  >
                    {overallTier.tier}
                  </h1>

                  <p className="text-lg italic font-serif text-ink-700 dark:text-stone-300 mb-4" style={{ fontWeight: 500 }}>
                    Overall Standing in 1680 Mexico City
                  </p>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-sans"
                      style={{
                        background: `linear-gradient(135deg, ${overallColors.light}, ${overallColors.primary})`,
                        color: 'white',
                        boxShadow: `0 2px 8px ${overallColors.glow}, inset 0 1px 2px rgba(255, 255, 255, 0.3)`
                      }}
                    >
                      {getFactionStanding(repData.overall)}
                    </span>
                    <span
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-sans"
                      style={{
                        background: isDark ? 'rgba(51, 65, 85, 0.7)' : 'rgba(245, 238, 223, 0.7)',
                        color: isDark ? '#fbbf24' : '#5c4a3a',
                        border: isDark ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                      }}
                    >
                      Average: {avgScore}
                    </span>
                  </div>

                  {/* Description */}
                  <p
                    className="text-base leading-relaxed font-serif text-ink-900 dark:text-stone-200"
                    style={{
                      lineHeight: '1.7',
                      fontSize: '1.0625rem'
                    }}
                  >
                    Your reputation reflects how different social groups in Mexico City perceive you.
                    As a converso apothecary, you must carefully navigate the complex web of colonial
                    power dynamics, balancing relationships with the Spanish elite, Catholic Church,
                    indigenous communities, merchant guilds, and common folk.
                  </p>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div
                  className="p-4 rounded-xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05))',
                    border: '1.5px solid rgba(16, 185, 129, 0.2)',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
                  }}
                >
                  <div className="text-3xl mb-1">{FACTION_INFO[highestFaction].icon}</div>
                  <div className="text-xs font-bold text-emerald-900 mb-1 uppercase tracking-wide">Highest</div>
                  <div className="text-sm font-semibold text-emerald-800">{FACTION_INFO[highestFaction].name}</div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">{repData.factions[highestFaction]}</div>
                </div>

                <div
                  className="p-4 rounded-xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.05))',
                    border: '1.5px solid rgba(239, 68, 68, 0.2)',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
                  }}
                >
                  <div className="text-3xl mb-1">{FACTION_INFO[lowestFaction].icon}</div>
                  <div className="text-xs font-bold text-red-900 mb-1 uppercase tracking-wide">Lowest</div>
                  <div className="text-sm font-semibold text-red-800">{FACTION_INFO[lowestFaction].name}</div>
                  <div className="text-2xl font-bold text-red-600 mt-1">{repData.factions[lowestFaction]}</div>
                </div>

                <div
                  className="p-4 rounded-xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(250, 204, 21, 0.05))',
                    border: '1.5px solid rgba(234, 179, 8, 0.2)',
                    boxShadow: '0 2px 8px rgba(234, 179, 8, 0.1)'
                  }}
                >
                  <div className="text-3xl mb-1">📊</div>
                  <div className="text-xs font-bold text-yellow-900 mb-1 uppercase tracking-wide">Balance</div>
                  <div className="text-sm font-semibold text-yellow-800">Spread</div>
                  <div className="text-2xl font-bold text-yellow-600 mt-1">
                    ±{Math.max(...factionScores) - Math.min(...factionScores)}
                  </div>
                </div>
              </div>

              {/* Faction Summary Bars */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ink-600 dark:text-amber-400 uppercase tracking-widest font-sans mb-3">
                  Faction Overview
                </h3>
                {Object.keys(FACTIONS).map(key => {
                  const factionId = FACTIONS[key];
                  const info = FACTION_INFO[factionId];
                  const score = repData.factions[factionId];
                  const colors = getReputationColor(score);
                  const standing = getFactionStanding(score);

                  return (
                    <div
                      key={factionId}
                      className="flex items-center gap-3 p-3 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                      style={{
                        background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                        border: isDark ? '1px solid rgba(71, 85, 105, 0.4)' : '1px solid rgba(209, 213, 219, 0.3)'
                      }}
                      onClick={() => setActiveTab('factions')}
                    >
                      <span className="text-2xl">{info.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-sm font-semibold text-ink-800 dark:text-stone-200">{info.name}</span>
                          <span className="text-xs text-ink-500 dark:text-stone-400 ml-2">| {standing}</span>
                          <span className="text-lg font-bold text-ink-900 dark:text-amber-100 ml-auto font-mono">{score}</span>
                        </div>
                        <div className="h-2 bg-ink-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${score}%`,
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

          {/* FACTIONS TAB */}
          {activeTab === 'factions' && (
            <div className="p-8 space-y-4">
              <h2 className="text-3xl font-bold text-ink-900 dark:text-amber-100 mb-4 font-serif">Faction Relationships</h2>
              <p className="text-sm text-ink-600 dark:text-stone-300 mb-6 font-sans leading-relaxed">
                Each faction has unique goals, values, and influence. Click on a faction to see detailed information,
                benefits, and strategies for improving your standing.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {Object.keys(FACTIONS).map(key => {
                  const factionId = FACTIONS[key];
                  const score = repData.factions[factionId];
                  return (
                    <div
                      key={factionId}
                      ref={(el) => {
                        if (el) factionRefs.current[factionId] = el;
                      }}
                    >
                      <FactionCard
                        factionId={factionId}
                        score={score}
                        expanded={expandedSections[factionId]}
                        onToggle={() => toggleSection(factionId)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MECHANICS TAB */}
          {activeTab === 'mechanics' && (
            <div className="p-8 space-y-4">
              <h2 className="text-3xl font-bold text-ink-900 dark:text-amber-100 mb-4 font-serif">How Reputation Works</h2>

              <InfoCard
                title="Overall Reputation"
                icon="📊"
                color="#3b82f6"
                expanded={expandedSections.mechanics_overall}
                onToggle={() => toggleSection('mechanics_overall')}
              >
                <div className="space-y-3 text-sm text-ink-700 dark:text-stone-300 leading-relaxed">
                  <p>
                    Your <strong>overall reputation</strong> is calculated as the average of all six faction scores.
                    This determines your general standing in Mexico City society and affects random encounters,
                    opportunities, and how NPCs initially perceive you.
                  </p>
                  <div className="p-3 rounded bg-blue-50 border border-blue-200">
                    <div className="font-bold text-blue-900 mb-1">Current: {repData.overall}/100</div>
                    <div className="text-xs text-blue-800">
                      Formula: (Elite + Common + Church + Indigenous + Guild + Merchants) ÷ 6
                    </div>
                  </div>
                </div>
              </InfoCard>

              <InfoCard
                title="Faction Influence"
                icon="⚖️"
                color="#8b5cf6"
                expanded={expandedSections.mechanics_faction}
                onToggle={() => toggleSection('mechanics_faction')}
              >
                <div className="space-y-3 text-sm text-ink-700 dark:text-stone-300 leading-relaxed">
                  <p>
                    Each faction represents a distinct social group with its own values and influence.
                    Your actions toward individual NPCs affect their faction's opinion of you:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>• <strong>Successfully treating</strong> a noble → +5 Elite reputation</li>
                    <li>• <strong>Charging fair prices</strong> → +2 Common Folk reputation</li>
                    <li>• <strong>Respecting indigenous knowledge</strong> → +3 Indigenous reputation</li>
                    <li>• <strong>Failing to cure</strong> a patient → -3 to -5 reputation</li>
                    <li>• <strong>Offending NPC</strong> → -5 to -10 faction reputation</li>
                  </ul>
                  <div className="p-3 rounded bg-purple-50 border border-purple-200 mt-3">
                    <div className="text-xs font-bold text-purple-900 mb-1">IMPORTANCE MULTIPLIER</div>
                    <div className="text-xs text-purple-800">
                      Higher-class NPCs have 2-3x more impact on reputation than common folk.
                    </div>
                  </div>
                </div>
              </InfoCard>

              <InfoCard
                title="Reputation Tiers"
                icon="🏆"
                color="#f59e0b"
                expanded={expandedSections.mechanics_tiers}
                onToggle={() => toggleSection('mechanics_tiers')}
              >
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                      <div className="font-bold text-emerald-900 text-xs mb-1">80-100: Allied</div>
                      <div className="text-xs text-emerald-800">Special favors, insider info, best prices</div>
                    </div>
                    <div className="p-2 rounded bg-green-50 border border-green-200">
                      <div className="font-bold text-green-900 text-xs mb-1">60-79: Friendly</div>
                      <div className="text-xs text-green-800">Helpful NPCs, fair treatment, cooperation</div>
                    </div>
                    <div className="p-2 rounded bg-yellow-50 border border-yellow-200">
                      <div className="font-bold text-yellow-900 text-xs mb-1">40-59: Neutral</div>
                      <div className="text-xs text-yellow-800">Business as usual, no special treatment</div>
                    </div>
                    <div className="p-2 rounded bg-orange-50 border border-orange-200">
                      <div className="font-bold text-orange-900 text-xs mb-1">20-39: Unfriendly</div>
                      <div className="text-xs text-orange-800">Suspicious, higher prices, slower service</div>
                    </div>
                    <div className="p-2 rounded bg-red-50 border border-red-200 col-span-2">
                      <div className="font-bold text-red-900 text-xs mb-1">0-19: Hostile</div>
                      <div className="text-xs text-red-800">Active opposition, refused service, sabotage attempts</div>
                    </div>
                  </div>
                </div>
              </InfoCard>

              <InfoCard
                title="Feedback Loop"
                icon="🔄"
                color="#ec4899"
                expanded={expandedSections.mechanics_feedback}
                onToggle={() => toggleSection('mechanics_feedback')}
              >
                <div className="space-y-3 text-sm text-ink-700 dark:text-stone-300 leading-relaxed">
                  <p>
                    Individual NPC relationships and faction reputation are interconnected:
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="p-3 rounded bg-pink-50 border border-pink-200">
                      <div className="text-xs font-bold text-pink-900 mb-2">NPC → FACTION</div>
                      <div className="text-xs text-pink-800">
                        When you help an NPC, their entire faction's opinion improves slightly.
                      </div>
                    </div>
                    <div className="p-3 rounded bg-pink-50 border border-pink-200">
                      <div className="text-xs font-bold text-pink-900 mb-2">FACTION → NPC</div>
                      <div className="text-xs text-pink-800">
                        Major faction events affect all individual NPCs in that faction.
                      </div>
                    </div>
                  </div>
                </div>
              </InfoCard>

            </div>
          )}

          {/* STRATEGY TAB */}
          {activeTab === 'strategy' && (
            <div className="p-8 space-y-4">
              <h2 className="text-3xl font-bold text-ink-900 dark:text-amber-100 mb-4 font-serif">Improving Your Reputation</h2>

              <InfoCard
                title="Quick Wins"
                icon="⚡"
                color="#10b981"
                expanded={expandedSections.strategy_quick}
                onToggle={() => toggleSection('strategy_quick')}
              >
                <div className="space-y-2 text-sm text-ink-700 dark:text-stone-300">
                  <p className="mb-3 leading-relaxed">
                    Fast ways to improve reputation with specific factions:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 text-lg">{FACTION_INFO[FACTIONS.ELITE].icon}</span>
                      <div>
                        <strong className="text-ink-900 dark:text-amber-200">Elite:</strong> Successfully treat nobles, use rare/expensive ingredients,
                        demonstrate medical expertise, respect social hierarchy
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 text-lg">{FACTION_INFO[FACTIONS.COMMON_FOLK].icon}</span>
                      <div>
                        <strong className="text-ink-900 dark:text-amber-200">Common Folk:</strong> Charge fair prices, offer free/discounted treatments,
                        listen to their concerns, use accessible ingredients
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 text-lg">{FACTION_INFO[FACTIONS.CHURCH].icon}</span>
                      <div>
                        <strong className="text-ink-900 dark:text-amber-200">Church:</strong> Avoid pagan practices, reference scripture,
                        treat clergy for free, avoid Jewish mysticism
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 text-lg">{FACTION_INFO[FACTIONS.INDIGENOUS].icon}</span>
                      <div>
                        <strong className="text-ink-900 dark:text-amber-200">Indigenous:</strong> Learn Nahuatl names, respect traditional medicine,
                        acknowledge their knowledge, use local plants
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 text-lg">{FACTION_INFO[FACTIONS.GUILD].icon}</span>
                      <div>
                        <strong className="text-ink-900 dark:text-amber-200">Guild:</strong> Follow regulations, pay dues on time,
                        share knowledge with apprentices, uphold standards
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 text-lg">{FACTION_INFO[FACTIONS.MERCHANTS].icon}</span>
                      <div>
                        <strong className="text-ink-900 dark:text-amber-200">Merchants:</strong> Buy from local suppliers, pay promptly,
                        recommend good vendors, negotiate fairly
                      </div>
                    </li>
                  </ul>
                </div>
              </InfoCard>

              <InfoCard
                title="Long-Term Strategy"
                icon="🎯"
                color="#3b82f6"
                expanded={expandedSections.strategy_long}
                onToggle={() => toggleSection('strategy_long')}
              >
                <div className="space-y-3 text-sm text-ink-700 dark:text-stone-300 leading-relaxed">
                  <p>
                    Building lasting reputation requires consistent behavior and strategic choices:
                  </p>
                  <div className="space-y-2 mt-3">
                    <div className="p-3 rounded bg-blue-50 border border-blue-200">
                      <div className="font-bold text-blue-900 mb-1">Specialize</div>
                      <div className="text-xs text-blue-800">
                        Focus on 2-3 factions rather than trying to please everyone. Some factions naturally conflict
                        (Elite vs. Common Folk, Church vs. Indigenous).
                      </div>
                    </div>
                    <div className="p-3 rounded bg-blue-50 border border-blue-200">
                      <div className="font-bold text-blue-900 mb-1">Build Relationships</div>
                      <div className="text-xs text-blue-800">
                        Repeated positive interactions with key NPCs compound over time. Find influential patrons
                        and maintain their favor.
                      </div>
                    </div>
                    <div className="p-3 rounded bg-blue-50 border border-blue-200">
                      <div className="font-bold text-blue-900 mb-1">Complete Quests</div>
                      <div className="text-xs text-blue-800">
                        Major quests often have faction rewards. Choose quest outcomes that align with your
                        desired reputation path.
                      </div>
                    </div>
                  </div>
                </div>
              </InfoCard>

              <InfoCard
                title="Risk Management"
                icon="⚠️"
                color="#ef4444"
                expanded={expandedSections.strategy_risk}
                onToggle={() => toggleSection('strategy_risk')}
              >
                <div className="space-y-3 text-sm text-ink-700 dark:text-stone-300 leading-relaxed">
                  <p>
                    Avoid common mistakes that can severely damage your reputation:
                  </p>
                  <ul className="space-y-2 ml-4 mt-3">
                    <li className="text-red-900">
                      <strong>❌ Price Gouging:</strong> Charging excessive prices alienates Common Folk and Merchants
                    </li>
                    <li className="text-red-900">
                      <strong>❌ Treatment Failures:</strong> Repeated failed treatments damage all faction reputations
                    </li>
                    <li className="text-red-900">
                      <strong>❌ Disrespect:</strong> Insulting NPCs, especially high-status ones, causes major reputation loss
                    </li>
                    <li className="text-red-900">
                      <strong>❌ Breaking Promises:</strong> Failing to deliver promised treatments or ingredients
                    </li>
                    <li className="text-red-900">
                      <strong>❌ Inquisition Attention:</strong> Openly practicing converso traditions risks Church hostility
                    </li>
                  </ul>
                  <div className="p-3 rounded bg-red-50 border border-red-200 mt-3">
                    <div className="text-xs font-bold text-red-900 mb-1">⚠️ CRITICAL WARNING</div>
                    <div className="text-xs text-red-800">
                      Falling below 20 reputation with the Church can trigger Inquisition investigations.
                      Maintain at least 40 reputation to stay safe.
                    </div>
                  </div>
                </div>
              </InfoCard>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
