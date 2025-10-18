/**
 * Circular Relationship Meter
 *
 * Visual circular meter for merchant relationships (matches ReputationModal style)
 */

import React from 'react';

function getRelationshipColor(value) {
  if (value >= 80) return { primary: '#10b981', light: '#34d399', glow: 'rgba(16, 185, 129, 0.3)' };
  if (value >= 70) return { primary: '#34d399', light: '#6ee7b7', glow: 'rgba(52, 211, 153, 0.3)' };
  if (value >= 60) return { primary: '#84cc16', light: '#a3e635', glow: 'rgba(132, 204, 22, 0.3)' };
  if (value >= 50) return { primary: '#eab308', light: '#facc15', glow: 'rgba(234, 179, 8, 0.3)' };
  if (value >= 40) return { primary: '#f59e0b', light: '#fbbf24', glow: 'rgba(245, 158, 11, 0.3)' };
  if (value >= 30) return { primary: '#f97316', light: '#fb923c', glow: 'rgba(249, 115, 22, 0.3)' };
  if (value >= 20) return { primary: '#ef4444', light: '#f87171', glow: 'rgba(239, 68, 68, 0.3)' };
  return { primary: '#dc2626', light: '#ef4444', glow: 'rgba(220, 38, 38, 0.3)' };
}

function getRelationshipEmoji(value) {
  if (value >= 80) return '😊';
  if (value >= 60) return '🙂';
  if (value >= 40) return '😐';
  if (value >= 20) return '😟';
  return '😠';
}

export default function CircularRelationshipMeter({ value, merchantName }) {
  const colors = getRelationshipColor(value);
  const emoji = getRelationshipEmoji(value);

  return (
    <div className="flex gap-6 items-center">
      {/* Circular Meter */}
      <div className="flex-shrink-0">
        <div
          className="w-32 h-32 rounded-full flex flex-col items-center justify-center relative"
          style={{
            background: `linear-gradient(135deg, ${colors.light}20, ${colors.primary}10)`,
            border: `3px solid ${colors.primary}40`,
            boxShadow: `0 8px 32px ${colors.glow}, inset 0 2px 8px rgba(255, 255, 255, 0.8)`
          }}
        >
          <div className="text-5xl mb-1">{emoji}</div>
          <div
            className="text-3xl font-bold font-mono"
            style={{ color: colors.primary }}
          >
            {value}
          </div>
          <div className="text-xs text-ink-500 dark:text-stone-400 font-sans">/ 100</div>
        </div>
      </div>

      {/* Merchant Info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-stone-400 mb-1">
          Relationship
        </div>
        <h3 className="text-xl font-semibold text-ink-900 dark:text-amber-100 mb-2">
          {merchantName}
        </h3>

        {/* Progress Bar */}
        <div className="h-2 bg-ink-100 dark:bg-slate-700 rounded-full overflow-hidden" style={{
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <div
            className="h-full relative transition-all duration-500"
            style={{
              width: `${value}%`,
              background: `linear-gradient(90deg, ${colors.light} 0%, ${colors.primary} 50%, ${colors.light} 100%)`,
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
