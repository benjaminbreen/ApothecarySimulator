/**
 * Item Row Component
 *
 * List view for items with progress bar (matches ReputationModal faction list pattern)
 */

import React from 'react';

// Helper to get icon path
function getItemIcon(itemName) {
  const normalized = itemName
    .toLowerCase()
    .replace(/['()]/g, '')
    .replace(/\s+/g, '_');
  return `/icons/${normalized}_icon.png`;
}

export default function ItemRow({ item, highlighted = false, onClick, selected = false }) {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onClick && onClick(item)}
      style={{
        background: selected
          ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)')
          : highlighted
          ? (isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(254, 243, 199, 0.6)')
          : (isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)'),
        border: selected
          ? '2px solid rgba(16, 185, 129, 0.5)'
          : (isDark ? '1px solid rgba(71, 85, 105, 0.4)' : '1px solid rgba(209, 213, 219, 0.3)')
      }}
    >
      {/* Item Icon */}
      <div className="flex-shrink-0 w-10 h-10">
        <img
          src={getItemIcon(item.name)}
          alt={item.name}
          className="w-full h-full object-contain"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div
          className="w-full h-full items-center justify-center text-2xl"
          style={{ display: 'none' }}
        >
          {item.emoji || '📦'}
        </div>
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-semibold text-ink-800 dark:text-stone-200">
            {item.name}
          </span>
          {highlighted && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold ml-2">
              ⭐ INTERESTED
            </span>
          )}
          <span className="text-lg font-bold text-ink-900 dark:text-amber-100 ml-auto font-mono">
            {item.price || item.value || 0}
          </span>
        </div>

        {/* Optional: Origin or category */}
        {(item.origin || item.category) && (
          <div className="text-xs text-ink-500 dark:text-stone-400 mb-1">
            {item.origin || item.category}
          </div>
        )}

        {/* Quantity Progress Bar */}
        {item.quantity && (
          <div className="h-2 bg-ink-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${Math.min(item.quantity * 10, 100)}%`,
                background: highlighted
                  ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(90deg, #10b981, #059669)'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
