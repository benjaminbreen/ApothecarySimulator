/**
 * Info Card Component
 *
 * Expandable card with colored header (matches ReputationModal pattern)
 */

import React from 'react';

export default function InfoCard({ title, icon, color, children, expanded, onToggle, badge }) {
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
      {expanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
