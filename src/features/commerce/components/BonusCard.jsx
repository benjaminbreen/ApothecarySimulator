/**
 * Bonus Card Component
 *
 * Colored gradient card for displaying skill bonuses (matches ReputationModal pattern)
 */

import React from 'react';

// Color schemes for different bonus types
const COLOR_SCHEMES = {
  bargaining: {
    bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05))',
    border: '1.5px solid rgba(16, 185, 129, 0.2)',
    shadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
    text: '#10b981'
  },
  language: {
    bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(129, 140, 248, 0.05))',
    border: '1.5px solid rgba(99, 102, 241, 0.2)',
    shadow: '0 2px 8px rgba(99, 102, 241, 0.1)',
    text: '#6366f1'
  },
  etiquette: {
    bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(167, 139, 250, 0.05))',
    border: '1.5px solid rgba(139, 92, 246, 0.2)',
    shadow: '0 2px 8px rgba(139, 92, 246, 0.1)',
    text: '#8b5cf6'
  },
  profession: {
    bg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(244, 114, 182, 0.05))',
    border: '1.5px solid rgba(236, 72, 153, 0.2)',
    shadow: '0 2px 8px rgba(236, 72, 153, 0.1)',
    text: '#ec4899'
  },
  relationship: {
    bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05))',
    border: '1.5px solid rgba(245, 158, 11, 0.2)',
    shadow: '0 2px 8px rgba(245, 158, 11, 0.1)',
    text: '#f59e0b'
  }
};

// Icons for bonus types
const BONUS_ICONS = {
  bargaining: '💰',
  language: '🗣️',
  etiquette: '🎩',
  profession: '⚕️',
  relationship: '💚'
};

export default function BonusCard({ name, level, value, type = 'bargaining' }) {
  const scheme = COLOR_SCHEMES[type.toLowerCase()] || COLOR_SCHEMES.bargaining;
  const icon = BONUS_ICONS[type.toLowerCase()] || '📊';

  return (
    <div
      className="p-4 rounded-xl text-center transition-all duration-200 hover:scale-105"
      style={{
        background: scheme.bg,
        border: scheme.border,
        boxShadow: scheme.shadow
      }}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div
        className="text-xs font-bold uppercase tracking-wide mb-1"
        style={{ color: scheme.text }}
      >
        {name}
      </div>
      {level && (
        <div className="text-sm font-semibold text-ink-700 dark:text-stone-300 mb-1">
          Level {level}
        </div>
      )}
      <div
        className="text-2xl font-bold mt-1"
        style={{ color: scheme.text }}
      >
        -{Math.round(value * 100)}%
      </div>
    </div>
  );
}
