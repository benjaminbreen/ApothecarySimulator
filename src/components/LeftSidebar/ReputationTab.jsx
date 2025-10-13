import React from 'react';
import {
  FaCrown,
  FaUsers,
  FaChurch,
  FaLeaf,
  FaFlask,
  FaCoins,
  FaArrowRight,
  FaTrophy,
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa';
import { FACTION_INFO, FACTIONS, getFactionStanding, getReputationTier, INITIAL_REPUTATION } from '../../core/systems/reputationSystem';

/**
 * Get color based on reputation score
 */
function getReputationColor(value) {
  if (value >= 90) return { primary: '#059669', light: '#10b981', glow: 'rgba(5, 150, 105, 0.3)', rgb: '5, 150, 105', darkText: '#065f46' }; // Emerald
  if (value >= 80) return { primary: '#10b981', light: '#34d399', glow: 'rgba(16, 185, 129, 0.3)', rgb: '16, 185, 129', darkText: '#047857' }; // Green
  if (value >= 70) return { primary: '#34d399', light: '#6ee7b7', glow: 'rgba(52, 211, 153, 0.3)', rgb: '52, 211, 153', darkText: '#059669' }; // Light green
  if (value >= 60) return { primary: '#84cc16', light: '#a3e635', glow: 'rgba(132, 204, 22, 0.3)', rgb: '132, 204, 22', darkText: '#4d7c0f' }; // Yellow-green
  if (value >= 50) return { primary: '#eab308', light: '#fcd34d', glow: 'rgba(234, 179, 8, 0.3)', rgb: '234, 179, 8', darkText: '#a16207' }; // Yellow
  if (value >= 40) return { primary: '#fbbf24', light: '#fde047', glow: 'rgba(251, 191, 36, 0.3)', rgb: '251, 191, 36', darkText: '#b45309' }; // Bright Yellow
  if (value >= 30) return { primary: '#f59e0b', light: '#fbbf24', glow: 'rgba(245, 158, 11, 0.3)', rgb: '245, 158, 11', darkText: '#c2410c' }; // Amber
  if (value >= 20) return { primary: '#f97316', light: '#fb923c', glow: 'rgba(249, 115, 22, 0.3)', rgb: '249, 115, 22', darkText: '#c2410c' }; // Orange
  if (value >= 10) return { primary: '#ef4444', light: '#f87171', glow: 'rgba(239, 68, 68, 0.3)', rgb: '239, 68, 68', darkText: '#b91c1c' }; // Red
  return { primary: '#dc2626', light: '#ef4444', glow: 'rgba(220, 38, 38, 0.3)', rgb: '220, 38, 38', darkText: '#991b1b' }; // Dark red
}

/**
 * Get faction icon - Clean render
 */
function getFactionIcon(factionId, size = 14, color) {
  const iconMap = {
    'elite': FaCrown,
    'commonFolk': FaUsers,
    'church': FaChurch,
    'indigenous': FaLeaf,
    'guild': FaFlask,
    'merchants': FaCoins
  };

  const Icon = iconMap[factionId] || FaUsers;
  return <Icon size={size} style={{ color }} />;
}

/**
 * Enhanced ReputationTab Component - Compact Version
 */
export function ReputationTab({ reputation, reputationEmoji, onOpenModal }) {
  const isDark = document.documentElement.classList.contains('dark');
  const repData = reputation || INITIAL_REPUTATION;
  const reputationTier = getReputationTier(repData.overall);
  const colors = getReputationColor(repData.overall);

  // Build faction list
  const factionReputation = Object.keys(FACTIONS).map(key => {
    const factionId = FACTIONS[key];
    const info = FACTION_INFO[factionId];
    return {
      id: factionId,
      name: info.name,
      value: repData.factions[factionId],
      color: info.color,
      standing: getFactionStanding(repData.factions[factionId])
    };
  });

  // Calculate stats
  const factionScores = Object.values(repData.factions);
  const avgScore = Math.round(factionScores.reduce((sum, val) => sum + val, 0) / factionScores.length);
  const highestScore = Math.max(...factionScores);
  const lowestScore = Math.min(...factionScores);
  const spread = highestScore - lowestScore;

  return (
    <div className="space-y-2.5 animate-fade-in-up">

      {/* Overall Reputation Card - Clean and Compact */}
      <button
        onClick={() => onOpenModal && onOpenModal()}
        className="w-full group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg cursor-pointer"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 250, 247, 0.9) 100%)',
          border: isDark
            ? `1.5px solid rgba(${colors.rgb}, 0.4)`
            : `1.5px solid rgba(${colors.rgb}, 0.3)`,
          boxShadow: isDark
            ? `0 3px 10px rgba(0, 0, 0, 0.4), 0 1px 3px ${colors.glow}, inset 0 1px 0 rgba(${colors.rgb}, 0.15)`
            : `0 3px 10px rgba(140, 100, 60, 0.15), 0 1px 3px ${colors.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
        }}
      >
        {/* Subtle glow effect on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.glow} 0%, transparent 70%)`
          }}
        />

        <div className="relative px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Emoji with glow that increases on hover */}
            <span
              className="text-2xl leading-none transition-all duration-300"
              style={{
                filter: isDark
                  ? `drop-shadow(0 0 4px rgba(${colors.rgb}, 0.4))`
                  : `drop-shadow(0 0 3px rgba(${colors.rgb}, 0.3))`,
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = isDark
                  ? `drop-shadow(0 0 12px rgba(${colors.rgb}, 0.8))`
                  : `drop-shadow(0 0 10px rgba(${colors.rgb}, 0.6))`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = isDark
                  ? `drop-shadow(0 0 4px rgba(${colors.rgb}, 0.4))`
                  : `drop-shadow(0 0 3px rgba(${colors.rgb}, 0.3))`;
              }}
            >
              {reputationTier.emoji}
            </span>

            <div className="flex flex-col items-start">
              <h3
                className="text-sm font-bold font-serif leading-none"
                style={{ color: isDark ? '#fbbf24' : colors.primary }}
              >
                {reputationTier.tier}
              </h3>
              <span className="text-xs text-ink-500 dark:text-slate-400 tracking-wide font-sans mt-0.5">
                Overall Reputation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-0.5">
              <span
                className="text-xl font-bold font-sans leading-none"
                style={{ color: isDark ? '#fbbf24' : colors.primary }}
              >
                {repData.overall}
              </span>
              <span className="text-xs text-ink-400 dark:text-slate-500 font-sans">
                /100
              </span>
            </div>

            <FaArrowRight
              className="text-ink-400 dark:text-slate-500 group-hover:text-ink-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-300"
              size={12}
            />
          </div>
        </div>

        {/* Slim progress bar */}
        <div
          className="h-0.5 bg-ink-100 dark:bg-slate-700"
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${repData.overall}%`,
              background: `linear-gradient(90deg, ${colors.light} 0%, ${colors.primary} 100%)`,
              boxShadow: `0 0 4px ${colors.glow}`
            }}
          />
        </div>
      </button>

      {/* Faction Cards - Streamlined Horizontal Layout */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 mb-1">
          <h4 className="text-xs font-semibold text-parchment-800 dark:text-slate-400 uppercase tracking-wider font-sans">
            Factions
          </h4>
          <span className="text-xs font-serif font-light px-2  tracking-wider py-0.5 rounded" style={{
            background: isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(229, 231, 235, 0.2)',
            color: isDark ? '#94a3b8' : '#3b2c18'
          }}>
            {factionReputation.filter(f => f.value >= 60).length}/6 Friendly
          </span>
        </div>

        {factionReputation.map((faction) => {
          const barColors = getReputationColor(faction.value);

          return (
            <button
              key={faction.id}
              onClick={() => onOpenModal && onOpenModal(faction.id)}
              className="w-full group relative overflow-hidden rounded-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer"
              style={{
                background: isDark
                  ? 'rgba(30, 41, 59, 0.6)'
                  : 'rgba(255, 255, 255, 0.7)',
                border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(209, 213, 219, 0.3)'}`,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, ${barColors.glow} 0%, transparent 100%)`
                }}
              />

              <div className="relative px-2.5 py-2">
                {/* Compact layout: Icon | Name | Standing | Score */}
                <div className="flex items-center gap-2 mb-1.5">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getFactionIcon(faction.id, 13, barColors.primary)}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-sm font-semibold text-ink-800 dark:text-slate-200 font-sans truncate block leading-tight">
                      {faction.name}
                    </span>
                  </div>

                  {/* Standing badge */}
                  <div className="flex-shrink-0">
                    <span
                      className="text-xs font-semibold font-sans px-1.5 py-0.5 rounded"
                      style={{
                        color: isDark ? barColors.light : barColors.darkText,
                        background: `${barColors.glow}`,
                        border: `1px solid ${barColors.primary}30`
                      }}
                    >
                      {faction.standing}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0">
                    <span
                      className="text-sm font-bold font-sans tabular-nums"
                      style={{ color: isDark ? '#fbbf24' : barColors.primary }}
                    >
                      {faction.value}
                    </span>
                  </div>
                </div>

                {/* Minimal progress bar */}
                <div
                  className="h-1 bg-ink-100 dark:bg-slate-700 rounded-full overflow-hidden"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.08)' }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${faction.value}%`,
                      background: `linear-gradient(90deg, ${barColors.light} 0%, ${barColors.primary} 100%)`,
                      boxShadow: `0 0 3px ${barColors.glow}`
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stats Footer - Refined */}
      <div
        className="rounded-lg p-2.5 space-y-2 text-xs"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.5) 100%)'
            : 'linear-gradient(135deg, rgba(249, 245, 235, 0.6) 0%, rgba(252, 250, 247, 0.5) 100%)',
          border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(209, 213, 219, 0.3)'}`,
          boxShadow: isDark
            ? '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 2px 4px rgba(140, 100, 60, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink-600 dark:text-slate-400">
            <FaTrophy size={12} className="text-emerald-500 drop-shadow-sm" />
            <span className="font-sans font-semibold">Best</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink-800 dark:text-slate-200 truncate max-w-[85px]">
              {factionReputation.find(f => f.value === highestScore)?.name}
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded" style={{
              background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'
            }}>
              {highestScore}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink-600 dark:text-slate-400">
            <FaExclamationTriangle size={12} className="text-red-500 drop-shadow-sm" />
            <span className="font-sans font-semibold">Worst</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink-800 dark:text-slate-200 truncate max-w-[85px]">
              {factionReputation.find(f => f.value === lowestScore)?.name}
            </span>
            <span className="font-mono font-bold text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded" style={{
              background: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'
            }}>
              {lowestScore}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t" style={{
          borderColor: isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(209, 213, 219, 0.3)'
        }}>
          <div className="flex items-center gap-2 text-ink-600 dark:text-slate-400">
            <FaChartLine size={12} className="text-amber-500 drop-shadow-sm" />
            <span className="font-sans font-semibold">Spread</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${spread > 50 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} style={{
              background: spread > 50
                ? (isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)')
                : (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
            }}>
              ±{spread}
            </span>
            <span className="text-ink-500 dark:text-slate-400 text-[0.7rem] font-semibold">
              {spread > 50 ? 'Unbalanced' : 'Balanced'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Tip - Refined */}
      <div
        className="rounded-lg px-2.5 py-2 text-xs text-ink-600 dark:text-slate-400 leading-relaxed font-sans"
        style={{
          background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(249, 245, 235, 0.5)',
          border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'}`,
          boxShadow: isDark
            ? '0 1px 3px rgba(0, 0, 0, 0.2)'
            : '0 1px 3px rgba(140, 100, 60, 0.06)'
        }}
      >
        💡 <span className="font-semibold">Tip:</span> Click any faction for detailed reputation strategies
      </div>
    </div>
  );
}

export default ReputationTab;
