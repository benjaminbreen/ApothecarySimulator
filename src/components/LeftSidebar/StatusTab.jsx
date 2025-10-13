import React, { useState, useEffect } from 'react';
import { SKILLS, SKILL_CATEGORIES } from '../../core/systems/skillsSystem';

/**
 * StatusTab Component
 * Displays player skills (known + learning) and active effects
 */
export function StatusTab({ playerSkills, activeEffects = [], onOpenSkillsModal }) {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

  // Watch for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Get category colors
  const getCategoryColor = (category) => {
    switch (category) {
      case SKILL_CATEGORIES.MEDICAL: return '#10b981'; // green
      case SKILL_CATEGORIES.SOCIAL: return '#3b82f6';  // blue
      case SKILL_CATEGORIES.PRACTICAL: return '#f97316'; // orange
      case SKILL_CATEGORIES.SCHOLARLY: return '#a855f7'; // purple
      case SKILL_CATEGORIES.COVERT: return '#ef4444';  // red
      default: return '#6b7280'; // gray
    }
  };

  // Get category display name
  const getCategoryName = (category) => {
    switch (category) {
      case SKILL_CATEGORIES.MEDICAL: return 'Medical';
      case SKILL_CATEGORIES.SOCIAL: return 'Social';
      case SKILL_CATEGORIES.PRACTICAL: return 'Practical';
      case SKILL_CATEGORIES.SCHOLARLY: return 'Scholarly';
      case SKILL_CATEGORIES.COVERT: return 'Covert';
      default: return 'General';
    }
  };

  // Get known skills (sorted by level, highest first)
  const knownSkills = playerSkills?.knownSkills
    ? Object.entries(playerSkills.knownSkills)
        .map(([skillId, skillData]) => ({
          ...SKILLS[skillId],
          level: skillData.level,
          xp: skillData.xp,
          currentXp: skillData.currentXp || 0
        }))
        .filter(skill => skill.id) // Filter out any undefined skills
        .sort((a, b) => b.level - a.level)
    : [];

  // Group skills by category
  const skillsByCategory = knownSkills.reduce((acc, skill) => {
    const category = skill.category || 'GENERAL';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  // Define category order
  const categoryOrder = [
    SKILL_CATEGORIES.MEDICAL,
    SKILL_CATEGORIES.SCHOLARLY,
    SKILL_CATEGORIES.SOCIAL,
    SKILL_CATEGORIES.PRACTICAL,
    SKILL_CATEGORIES.COVERT
  ];

  // Get ordered categories that have skills
  const orderedCategories = categoryOrder.filter(cat => skillsByCategory[cat] && skillsByCategory[cat].length > 0);

  // Get skills being learned
  const learningSkills = playerSkills?.learningSkills || [];

  return (
    <div className="space-y-3 animate-fade-in-up">
      {/* Player Level & XP - Enhanced */}
      {playerSkills && (
        <div
          onClick={onOpenSkillsModal}
          className="rounded-xl p-3 border cursor-pointer transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 1.0) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(282, 245, 240, 0.7) 100%)',
            borderColor: isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(209, 213, 219, 0.4)',
            boxShadow: isDark
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.14)'
          }}
        >
          {/* Top gradient accent */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent, #10b981, transparent)'
                : 'linear-gradient(90deg, transparent, #10b981, transparent)'
            }}
          />

          {/* Hover glow effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
                : 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)'
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div
                className="text-sm font-bold font-sans px-3 py-1 rounded-lg"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
              >
                Level {playerSkills.level}
              </div>
              <div
                className="text-xs font-sans px-2 py-1 rounded"
                style={{
                  color: isDark ? '#94a3b8' : '#64748b',
                  background: isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(229, 231, 235, 0.5)'
                }}
              >
                {playerSkills.skillPoints} skill {playerSkills.skillPoints === 1 ? 'point' : 'points'}
              </div>
            </div>
            {/* XP Progress Bar */}
            <div className="relative h-1.5 rounded-full overflow-hidden" style={{
              background: isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(229, 231, 235, 0.6)'
            }}>
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${(playerSkills.xp / playerSkills.xpToNextLevel) * 100}%`,
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
                }}
              />
            </div>
            <div className="text-xs text-center mt-1 font-sans" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              {playerSkills.xp} / {playerSkills.xpToNextLevel} XP
            </div>
          </div>
        </div>
      )}

      {/* Known Skills - Grid or List View */}
      {knownSkills.length > 0 && (
        <div>
          {/* Header with View Toggle */}
          <div className="flex items-center justify-between mb-1 px-1">
            <h3 className="text-xs font-semibold font-sans tracking-wider uppercase" style={{
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              Skills
            </h3>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-0.5 p-0.5 rounded" style={{
                background: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(229, 231, 235, 0.4)'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className="p-1 rounded transition-all duration-200"
                  style={{
                    background: viewMode === 'grid'
                      ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)')
                      : 'transparent',
                    color: viewMode === 'grid'
                      ? '#10b981'
                      : (isDark ? '#94a3b8' : '#64748b')
                  }}
                  title="Grid view"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="p-1 rounded transition-all duration-200"
                  style={{
                    background: viewMode === 'list'
                      ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)')
                      : 'transparent',
                    color: viewMode === 'list'
                      ? '#10b981'
                      : (isDark ? '#94a3b8' : '#64748b')
                  }}
                  title="List view"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              <span
                className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                style={{
                  background: isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(229, 231, 235, 0.4)',
                  color: isDark ? '#94a3b8' : '#64748b'
                }}
              >
                {knownSkills.length}
              </span>
            </div>
          </div>

          {/* Grid View - All skills in one grid, grouped by category */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-3 gap-1.5">
              {knownSkills.slice(0, 18).map((skill, index) => {
                const categoryColor = getCategoryColor(skill.category);
                const categoryName = getCategoryName(skill.category);

                // Get hex color without alpha for RGB conversion
                const hexToRgb = (hex) => {
                  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                  return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                  } : null;
                };

                const rgb = hexToRgb(categoryColor);

                return (
                <div
                  key={skill.id}
                  className="rounded-md p-1 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group relative overflow-hidden aspect-square flex flex-col"
                  style={{
                    background: isDark
                      ? `linear-gradient(145deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25) 0%, rgba(30, 41, 59, 0.98) 60%, rgba(51, 65, 85, 0.95) 100%)`
                      : `linear-gradient(145deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 0%, rgba(255, 253, 248, 1) 50%, rgba(252, 248, 242, 0.98) 100%)`,
                    border: isDark
                      ? `1.5px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`
                      : `1.5px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`,
                    boxShadow: isDark
                      ? `
                          0 2px 5px rgba(0, 0, 0, 0.4),
                          0 1px 2px rgba(0, 0, 0, 0.3),
                          inset -1px -1px 2px rgba(0, 0, 0, 0.2),
                          inset 1px 1px 2px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)
                        `
                      : `
                          0 3px 6px rgba(140, 100, 60, 0.18),
                          0 1px 3px rgba(120, 85, 50, 0.15),
                          inset -1px -1px 3px rgba(160, 130, 100, 0.25),
                          inset 1px 1px 2px rgba(255, 255, 255, 0.9)
                        `,
                    animationDelay: `${index * 40}ms`
                  }}
                >
                  {/* Level badge - top right corner */}
                  <div
                    className="absolute top-1 right-1 z-20 px-0.5 py-0.5 rounded-md text-[0.7rem] font-bold font-sans leading-none"
                    style={{
                      backgroundColor: isDark
                        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
                        : categoryColor,
                      color: isDark ? categoryColor : '#ffffff',
                      boxShadow: isDark
                        ? `0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
                        : `0 1px 3px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
                      textShadow: isDark ? `0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)` : '0 1px 2px rgba(0, 0, 0, 0.8)',
                      border: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDark ? 0.4 : 0.3})`
                    }}
                  >
                  {skill.level}/5
                  </div>

                  {/* Subtle gradient accent at top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3), transparent)`
                    }}
                  />

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25) 0%, transparent 70%)`
                    }}
                  />

                  {/* Hover elevation */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: isDark
                        ? `0 6px 16px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5), 0 3px 8px rgba(0, 0, 0, 0.5)`
                        : `0 6px 16px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3), 0 3px 8px rgba(140, 100, 60, 0.4)`
                    }}
                  />

                  <div className="relative z-10 flex-1 flex flex-col items-center justify-between -mt-1 px-1">
                    {/* Icon - centered with glow effect */}
                    <div className="text-center mb-0 mt-1 flex-shrink-0">
                      <span
                        className="text-xl inline-block group-hover:scale-110 transition-all duration-300"
                        style={{
                          filter: isDark
                            ? `drop-shadow(0 0 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                            : `drop-shadow(0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))`
                        }}
                      >
                        {skill.icon}
                      </span>
                    </div>

                    {/* Name - wrapping text */}
                    <div className="text-center px-0.5 flex-shrink-0">
                      <p className="text-[0.75rem] font-semibold leading-[0.9] font-sans line-clamp-1" style={{
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        letterSpacing: '0.005em',
                        wordBreak: 'break-word',
                        hyphens: 'auto'
                      }}>
                        {skill.name}
                      </p>
                    </div>

                    {/* Category badge - subtle outline style */}
                    <div className="text-center -mt-4 flex-shrink-0">
                      <span
                        className="text-[0.55rem] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded font-sans inline-block"
                        style={{
                          backgroundColor: isDark
                            ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
                            : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
                          color: isDark ? categoryColor : categoryColor,
                          border: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`,
                          textShadow: isDark ? `0 0 4px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` : 'none',
                          boxShadow: 'none'
                        }}
                      >
                        {categoryName}
                      </span>
                    </div>

                    {/* 5-segment level indicator bar - more subtle */}
                    <div className="w-full flex gap-0.5 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((segment) => (
                        <div
                          key={segment}
                          className="flex-1 h-0.5 rounded-full transition-all duration-300"
                          style={{
                            background: segment <= skill.level
                              ? isDark
                                ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`
                                : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`
                              : isDark
                                ? 'rgba(15, 23, 42, 0.3)'
                                : 'rgba(0, 0, 0, 0.06)',
                            boxShadow: segment <= skill.level
                              ? `0 0 2px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
                              : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* List View - Skills organized by category with headers */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {orderedCategories.map((category) => {
                const categorySkills = skillsByCategory[category];
                const categoryColor = getCategoryColor(category);
                const categoryName = getCategoryName(category);

                // Get hex color without alpha for RGB conversion
                const hexToRgb = (hex) => {
                  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                  return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                  } : null;
                };

                const rgb = hexToRgb(categoryColor);

                return (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <div
                        className="h-0.5 w-2 rounded-full"
                        style={{ background: categoryColor }}
                      />
                      <h4
                        className="text-[0.7rem] font-bold font-sans tracking-wider uppercase"
                        style={{
                          color: categoryColor,
                          textShadow: isDark ? `0 0 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)` : 'none'
                        }}
                      >
                        {categoryName.toUpperCase()}
                      </h4>
                      <div
                        className="h-0.5 flex-1 rounded-full"
                        style={{
                          background: isDark
                            ? `linear-gradient(to right, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3), transparent)`
                            : `linear-gradient(to right, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2), transparent)`
                        }}
                      />
                      <span
                        className="text-[0.65rem] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: isDark
                            ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
                            : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                          color: categoryColor
                        }}
                      >
                        {categorySkills.length}
                      </span>
                    </div>

                    {/* Skills List */}
                    <div className="space-y-1.5">
                      {categorySkills.map((skill) => (
                        <div
                          key={skill.id}
                          className="rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] group relative overflow-hidden"
                          style={{
                            background: isDark
                              ? `linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 0%, rgba(30, 41, 59, 0.95) 30%, rgba(51, 65, 85, 0.9) 100%)`
                              : `linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, rgba(255, 253, 248, 1) 30%, rgba(252, 248, 242, 0.98) 100%)`,
                            border: isDark
                              ? `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
                              : `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
                            boxShadow: isDark
                              ? `0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
                              : `0 2px 4px rgba(140, 100, 60, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)`
                          }}
                        >
                          {/* Hover glow */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                              background: `radial-gradient(circle at 0% 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) 0%, transparent 60%)`
                            }}
                          />

                          <div className="relative z-10 flex items-center gap-2.5">
                            {/* Icon with glow */}
                            <span
                              className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                              style={{
                                filter: isDark
                                  ? `drop-shadow(0 0 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5))`
                                  : `drop-shadow(0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3))`
                              }}
                            >
                              {skill.icon}
                            </span>

                            {/* Skill info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h5
                                  className="text-sm font-bold font-sans"
                                  style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                                >
                                  {skill.name}
                                </h5>
                                <span
                                  className="text-xs font-bold font-sans px-1.5 py-0.5 rounded flex-shrink-0"
                                  style={{
                                    backgroundColor: isDark
                                      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
                                      : categoryColor,
                                    color: isDark ? categoryColor : '#ffffff',
                                    boxShadow: isDark
                                      ? `0 1px 2px rgba(0, 0, 0, 0.3)`
                                      : `0 1px 2px rgba(0, 0, 0, 0.2)`,
                                    textShadow: isDark ? `0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)` : '0 1px 1px rgba(0, 0, 0, 0.5)'
                                  }}
                                >
                                  Lv {skill.level}
                                </span>
                              </div>

                              {/* 5-segment level indicator */}
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((segment) => (
                                  <div
                                    key={segment}
                                    className="flex-1 h-1 rounded-full transition-all duration-300"
                                    style={{
                                      background: segment <= skill.level
                                        ? isDark
                                          ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`
                                          : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`
                                        : isDark
                                          ? 'rgba(15, 23, 42, 0.3)'
                                          : 'rgba(0, 0, 0, 0.06)',
                                      boxShadow: segment <= skill.level
                                        ? `0 0 3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
                                        : 'none'
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {knownSkills.length > 18 && viewMode === 'grid' && (
            <button
              onClick={onOpenSkillsModal}
              className="w-full text-xs font-sans font-bold py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] border border-dashed mt-2 shadow-sm"
              style={{
                color: isDark ? '#fbbf24' : '#10b981',
                borderColor: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(5, 150, 105, 0.04) 100%)',
                boxShadow: isDark
                  ? '0 1px 3px rgba(0, 0, 0, 0.2)'
                  : '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}
            >
              +{knownSkills.length - 18} more skills
            </button>
          )}
        </div>
      )}

      {/* Skills Being Learned - Streamlined */}
      {learningSkills.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <h3 className="text-xs font-semibold font-sans tracking-wider uppercase" style={{
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              Learning
            </h3>
            <span
              className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
              style={{
                background: isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(229, 231, 235, 0.4)',
                color: isDark ? '#94a3b8' : '#64748b'
              }}
            >
              {learningSkills.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {learningSkills.map((learning) => {
              const skill = SKILLS[learning.skillId];
              if (!skill) return null;

              const categoryColor = getCategoryColor(skill.category);
              const categoryName = getCategoryName(skill.category);
              const learningRgb = '251, 191, 36'; // Amber color for learning

              return (
                <div
                  key={learning.skillId}
                  className="rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] group relative overflow-hidden"
                  style={{
                    background: isDark
                      ? `linear-gradient(90deg, rgba(${learningRgb}, 0.15) 0%, rgba(30, 41, 59, 0.95) 30%, rgba(51, 65, 85, 0.9) 100%)`
                      : `linear-gradient(90deg, rgba(${learningRgb}, 0.08) 0%, rgba(255, 253, 248, 1) 30%, rgba(252, 248, 242, 0.98) 100%)`,
                    border: isDark
                      ? `1px solid rgba(${learningRgb}, 0.4)`
                      : `1px solid rgba(${learningRgb}, 0.3)`,
                    boxShadow: isDark
                      ? `0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(${learningRgb}, 0.15)`
                      : `0 2px 4px rgba(140, 100, 60, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)`
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 0% 50%, rgba(${learningRgb}, 0.2) 0%, transparent 60%)`
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      {/* Icon with glow */}
                      <span
                        className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                        style={{
                          filter: isDark
                            ? `drop-shadow(0 0 8px rgba(${learningRgb}, 0.5))`
                            : `drop-shadow(0 0 6px rgba(${learningRgb}, 0.3))`
                        }}
                      >
                        {skill.icon}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h4
                            className="text-sm font-bold font-sans"
                            style={{ color: isDark ? '#fbbf24' : '#b45309' }}
                          >
                            {skill.name}
                          </h4>
                          <span
                            className="text-[0.65rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{
                              backgroundColor: isDark
                                ? `${categoryColor}20`
                                : `${categoryColor}15`,
                              color: categoryColor,
                              border: `1px solid ${categoryColor}40`
                            }}
                          >
                            {categoryName}
                          </span>
                        </div>

                        {/* Learning Progress Bar */}
                        <div className="relative h-1.5 rounded-full overflow-hidden" style={{
                          background: isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(229, 231, 235, 0.6)',
                          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}>
                          <div
                            className="h-full transition-all duration-500 rounded-full relative"
                            style={{
                              width: `${(learning.xp / skill.xpPerLevel) * 100}%`,
                              background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                              boxShadow: '0 0 6px rgba(251, 191, 36, 0.6)'
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-full"></div>
                          </div>
                        </div>
                        <div className="text-[0.65rem] text-right font-mono font-semibold mt-0.5" style={{
                          color: isDark ? '#94a3b8' : '#64748b'
                        }}>
                          {learning.xp} / {skill.xpPerLevel} XP
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Effects - Streamlined Horizontal Layout */}
      {activeEffects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <h3 className="text-xs font-semibold font-sans tracking-wider uppercase" style={{
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              Active Effects
            </h3>
            <span
              className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
              style={{
                background: isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(229, 231, 235, 0.4)',
                color: isDark ? '#94a3b8' : '#64748b'
              }}
            >
              {activeEffects.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {activeEffects.map((effect, idx) => {
              // Determine effect type color (positive = green, negative = red, neutral = blue)
              const effectColor = effect.type === 'positive'
                ? { primary: '#10b981', light: '#34d399', rgb: '16, 185, 129' }
                : effect.type === 'negative'
                ? { primary: '#ef4444', light: '#f87171', rgb: '239, 68, 68' }
                : { primary: '#3b82f6', light: '#60a5fa', rgb: '59, 130, 246' };

              return (
                <div
                  key={idx}
                  className="rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] group relative overflow-hidden"
                  style={{
                    background: isDark
                      ? `linear-gradient(90deg, rgba(${effectColor.rgb}, 0.15) 0%, rgba(30, 41, 59, 0.95) 30%, rgba(51, 65, 85, 0.9) 100%)`
                      : `linear-gradient(90deg, rgba(${effectColor.rgb}, 0.08) 0%, rgba(255, 253, 248, 1) 30%, rgba(252, 248, 242, 0.98) 100%)`,
                    border: isDark
                      ? `1px solid rgba(${effectColor.rgb}, 0.3)`
                      : `1px solid rgba(${effectColor.rgb}, 0.2)`,
                    boxShadow: isDark
                      ? `0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(${effectColor.rgb}, 0.1)`
                      : `0 2px 4px rgba(140, 100, 60, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)`
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 0% 50%, rgba(${effectColor.rgb}, 0.2) 0%, transparent 60%)`
                    }}
                  />

                  <div className="relative z-10 flex items-center gap-2.5">
                    {/* Icon with glow */}
                    <span
                      className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                      style={{
                        filter: isDark
                          ? `drop-shadow(0 0 8px rgba(${effectColor.rgb}, 0.5))`
                          : `drop-shadow(0 0 6px rgba(${effectColor.rgb}, 0.3))`
                      }}
                    >
                      {effect.icon}
                    </span>

                    {/* Effect info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4
                          className="text-sm font-bold font-sans"
                          style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                        >
                          {effect.name}
                        </h4>
                        {effect.duration && (
                          <span
                            className="text-[0.65rem] font-semibold font-mono px-1.5 py-0.5 rounded flex-shrink-0 flex items-center gap-1"
                            style={{
                              backgroundColor: isDark
                                ? `rgba(${effectColor.rgb}, 0.2)`
                                : `rgba(${effectColor.rgb}, 0.15)`,
                              color: effectColor.primary,
                              border: `1px solid rgba(${effectColor.rgb}, 0.3)`
                            }}
                          >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {effect.duration}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[0.7rem] leading-snug"
                        style={{
                          color: isDark ? '#cbd5e1' : '#475569'
                        }}
                      >
                        {effect.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {knownSkills.length === 0 && learningSkills.length === 0 && activeEffects.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-20">✨</div>
          <p className="text-base font-sans font-medium" style={{
            color: isDark ? '#94a3b8' : '#64748b'
          }}>
            No skills or effects
          </p>
          <p className="text-sm font-sans mt-1" style={{
            color: isDark ? '#64748b' : '#9ca3af'
          }}>
            Learn skills and gain effects through gameplay
          </p>
        </div>
      )}
    </div>
  );
}
