/**
 * Medicine Type Badge Component
 *
 * A reusable badge that displays medicine type classification with tooltip.
 * Shows emoji, name, and color based on the medicine taxonomy.
 *
 * Used across:
 * - ItemModal (top right corner)
 * - Inventory lists (inline badges)
 * - Buy/Sell interfaces (filter/display)
 * - Crafting/Mixing (result preview)
 * - Transaction records (ledger entries)
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getMedicineType, inferMedicineType, getMedicineEmoji, getMedicineColor } from '../core/config/medicineCategories';

export default function MedicineTypeBadge({
  item,
  size = 'medium', // 'small', 'medium', 'large'
  showTooltip = true,
  position = 'top-right', // 'top-right', 'inline', 'standalone'
  className = ''
}) {
  const [showTooltipState, setShowTooltipState] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const badgeRef = useRef(null);
  const isDark = document.documentElement.classList.contains('dark');

  // Calculate tooltip position when hovering
  useEffect(() => {
    if (showTooltipState && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8, // 8px below badge
        left: rect.left + rect.width / 2 // center of badge
      });
    }
  }, [showTooltipState]);

  // Infer medicine type from item
  const medicineTypeId = item.medicineType || inferMedicineType(item);
  const medicineType = getMedicineType(medicineTypeId);

  // If no valid medicine type, don't render
  if (!medicineType) return null;

  // Size variants
  const sizeClasses = {
    small: {
      badge: 'px-2 py-1 text-xs',
      emoji: 'text-sm',
      text: 'text-xs',
      tooltip: 'w-48 text-xs'
    },
    medium: {
      badge: 'px-3 py-1.5 text-sm',
      emoji: 'text-lg',
      text: 'text-sm',
      tooltip: 'w-64 text-sm'
    },
    large: {
      badge: 'px-4 py-2 text-base',
      emoji: 'text-xl',
      text: 'text-base',
      tooltip: 'w-72 text-base'
    }
  };

  const sizing = sizeClasses[size] || sizeClasses.medium;

  // Position variants
  const positionClasses = {
    'top-right': 'absolute top-4 right-4 z-10',
    'inline': 'inline-flex',
    'standalone': 'flex'
  };

  return (
    <>
      {/* Badge */}
      <div
        ref={badgeRef}
        className={`
          ${positionClasses[position]}
          ${sizing.badge}
          rounded-full font-sans font-semibold
          flex items-center gap-1.5
          transition-all duration-200
          cursor-help
          backdrop-blur-sm
          ${className}
        `}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => showTooltip && setShowTooltipState(false)}
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${medicineType.color}40, ${medicineType.color}30)`
            : `linear-gradient(135deg, ${medicineType.color}30, ${medicineType.color}20)`,
          border: `1.5px solid ${medicineType.color}${isDark ? '60' : '50'}`,
          color: isDark ? medicineType.color : medicineType.color,
          boxShadow: showTooltipState
            ? `0 4px 12px ${medicineType.color}40, 0 0 20px ${medicineType.color}20`
            : `0 2px 4px ${medicineType.color}20`,
          transform: showTooltipState ? 'scale(1.05)' : 'scale(1)'
        }}
      >
        <span className={sizing.emoji}>{medicineType.emoji}</span>
        <span className={sizing.text}>{medicineType.name}</span>
      </div>

      {/* Tooltip - Rendered via Portal */}
      {showTooltip && showTooltipState && createPortal(
        <div
          className="fixed pointer-events-none z-[9999] transition-opacity duration-200"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translate(-50%, 0)',
            opacity: showTooltipState ? 1 : 0
          }}
        >
          <div
            className={`${sizing.tooltip} p-4 rounded-xl shadow-2xl backdrop-blur-sm`}
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 247, 0.95) 100%)',
              border: `1.5px solid ${medicineType.color}60`,
              boxShadow: isDark
                ? `0 8px 24px rgba(0, 0, 0, 0.6), 0 0 40px ${medicineType.color}30`
                : `0 8px 24px rgba(0, 0, 0, 0.15), 0 0 40px ${medicineType.color}20`
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b"
              style={{ borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)' }}>
              <span className="text-2xl">{medicineType.emoji}</span>
              <h4 className="font-sans font-bold"
                style={{ color: medicineType.color }}>
                {medicineType.name}
              </h4>
            </div>

            {/* Description */}
            <p className="font-serif text-xs leading-relaxed mb-2"
              style={{ color: isDark ? '#cbd5e1' : '#374151' }}>
              {medicineType.description}
            </p>

            {/* Historical Context */}
            <div className="pt-2 border-t"
              style={{ borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)' }}>
              <p className="font-sans text-xs italic"
                style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                {medicineType.historicalContext}
              </p>
            </div>

            {/* Examples */}
            {medicineType.examples && (
              <div className="mt-2 pt-2 border-t"
                style={{ borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)' }}>
                <p className="font-sans text-xs font-semibold mb-1"
                  style={{ color: isDark ? '#cbd5e1' : '#374151' }}>
                  Examples:
                </p>
                <p className="font-serif text-xs"
                  style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                  {medicineType.examples.slice(0, 3).join(', ')}
                </p>
              </div>
            )}

            {/* Arrow pointing up */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: isDark
                  ? '6px solid rgba(15, 23, 42, 0.98)'
                  : '6px solid rgba(255, 255, 255, 0.98)',
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
