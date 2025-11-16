/**
 * Helper Tooltip Component
 *
 * Portal-rendered tooltip for first-time user guidance with:
 * - Smart positioning (avoids screen edges)
 * - Parchment styling (matches game aesthetic)
 * - Auto-dismiss after 15 seconds (accessibility)
 * - Two dismiss options: "Got it" or "Disable all tooltips"
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const ARROW_SIZE = 8; // Size of arrow pointer
const TOOLTIP_OFFSET = 12; // Distance from target element
const AUTO_DISMISS_DELAY = 15000; // 15 seconds

export default function HelperTooltip({
  id,
  content,
  targetRef,
  show,
  onDismiss,
  onDisableAll,
  position = 'auto' // 'auto' | 'top' | 'bottom' | 'left' | 'right'
}) {
  const [calculatedPosition, setCalculatedPosition] = useState({ top: 0, left: 0, placement: 'bottom' });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const autoDismissTimerRef = useRef(null);

  // Detect dark mode
  const isDark = document.documentElement.classList.contains('dark');

  // Calculate optimal position
  useEffect(() => {
    if (show && targetRef?.current && tooltipRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Calculate available space in each direction
      const spaceAbove = targetRect.top;
      const spaceBelow = viewport.height - targetRect.bottom;
      const spaceLeft = targetRect.left;
      const spaceRight = viewport.width - targetRect.right;

      let placement = position === 'auto' ? 'bottom' : position;
      let top = 0;
      let left = 0;

      // Auto-detect best placement if 'auto'
      if (position === 'auto') {
        // Prefer below target (most natural)
        if (spaceBelow >= tooltipRect.height + TOOLTIP_OFFSET + ARROW_SIZE) {
          placement = 'bottom';
        } else if (spaceAbove >= tooltipRect.height + TOOLTIP_OFFSET + ARROW_SIZE) {
          placement = 'top';
        } else if (spaceRight >= tooltipRect.width + TOOLTIP_OFFSET + ARROW_SIZE) {
          placement = 'right';
        } else if (spaceLeft >= tooltipRect.width + TOOLTIP_OFFSET + ARROW_SIZE) {
          placement = 'left';
        } else {
          // Not enough space anywhere - default to bottom and let it overflow
          placement = 'bottom';
        }
      }

      // Calculate position based on placement
      switch (placement) {
        case 'bottom':
          top = targetRect.bottom + TOOLTIP_OFFSET + ARROW_SIZE;
          left = targetRect.left + targetRect.width / 2;
          break;

        case 'top':
          top = targetRect.top - tooltipRect.height - TOOLTIP_OFFSET - ARROW_SIZE;
          left = targetRect.left + targetRect.width / 2;
          break;

        case 'right':
          top = targetRect.top + targetRect.height / 2;
          left = targetRect.right + TOOLTIP_OFFSET + ARROW_SIZE;
          break;

        case 'left':
          top = targetRect.top + targetRect.height / 2;
          left = targetRect.left - tooltipRect.width - TOOLTIP_OFFSET - ARROW_SIZE;
          break;

        default:
          break;
      }

      // Ensure tooltip stays within viewport horizontally (for top/bottom placements)
      if (placement === 'top' || placement === 'bottom') {
        const halfWidth = tooltipRect.width / 2;
        if (left - halfWidth < 10) {
          left = halfWidth + 10;
        } else if (left + halfWidth > viewport.width - 10) {
          left = viewport.width - halfWidth - 10;
        }
      }

      // Ensure tooltip stays within viewport vertically (for left/right placements)
      if (placement === 'left' || placement === 'right') {
        const halfHeight = tooltipRect.height / 2;
        if (top - halfHeight < 10) {
          top = halfHeight + 10;
        } else if (top + halfHeight > viewport.height - 10) {
          top = viewport.height - halfHeight - 10;
        }
      }

      // Ensure tooltip stays within viewport vertically (for top/bottom placements)
      if (placement === 'top' || placement === 'bottom') {
        const tooltipHeight = tooltipRect.height;
        if (top < 10) {
          top = 10; // Don't go above viewport
        } else if (top + tooltipHeight > viewport.height - 10) {
          top = viewport.height - tooltipHeight - 10; // Don't go below viewport
        }
      }

      setCalculatedPosition({ top, left, placement });
    }
  }, [show, targetRef, position]);

  // Fade in animation
  useEffect(() => {
    if (show) {
      // Small delay for smooth appearance
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  // Auto-dismiss after 15 seconds (accessibility)
  useEffect(() => {
    if (show) {
      autoDismissTimerRef.current = setTimeout(() => {
        console.log('[HelperTooltip] Auto-dismissing after 15s:', id);
        handleDismiss();
      }, AUTO_DISMISS_DELAY);

      return () => {
        if (autoDismissTimerRef.current) {
          clearTimeout(autoDismissTimerRef.current);
        }
      };
    }
  }, [show, id]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 200); // Match fade-out duration
  };

  const handleDisableAll = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDisableAll?.();
    }, 200);
  };

  if (!show) return null;

  const { top, left, placement } = calculatedPosition;

  // Calculate transform based on placement
  let transform = 'translate(-50%, 0)'; // Default for bottom/top
  if (placement === 'left' || placement === 'right') {
    transform = 'translate(0, -50%)';
  }
  if (placement === 'right') {
    transform = 'translate(0, -50%)';
  }
  if (placement === 'left') {
    transform = 'translate(-100%, -50%)';
  }
  if (placement === 'top') {
    transform = 'translate(-50%, 0)';
  }

  // Arrow styles based on placement
  const getArrowStyle = () => {
    const baseStyle = {
      position: 'absolute',
      width: 0,
      height: 0,
    };

    const arrowColor = isDark
      ? 'rgba(30, 41, 59, 0.98)'
      : 'rgba(255, 255, 255, 0.98)';

    switch (placement) {
      case 'bottom':
        return {
          ...baseStyle,
          top: `-${ARROW_SIZE}px`,
          left: '50%',
          marginLeft: `-${ARROW_SIZE}px`,
          borderLeft: `${ARROW_SIZE}px solid transparent`,
          borderRight: `${ARROW_SIZE}px solid transparent`,
          borderBottom: `${ARROW_SIZE}px solid ${arrowColor}`,
        };

      case 'top':
        return {
          ...baseStyle,
          bottom: `-${ARROW_SIZE}px`,
          left: '50%',
          marginLeft: `-${ARROW_SIZE}px`,
          borderLeft: `${ARROW_SIZE}px solid transparent`,
          borderRight: `${ARROW_SIZE}px solid transparent`,
          borderTop: `${ARROW_SIZE}px solid ${arrowColor}`,
        };

      case 'right':
        return {
          ...baseStyle,
          left: `-${ARROW_SIZE}px`,
          top: '50%',
          marginTop: `-${ARROW_SIZE}px`,
          borderTop: `${ARROW_SIZE}px solid transparent`,
          borderBottom: `${ARROW_SIZE}px solid transparent`,
          borderRight: `${ARROW_SIZE}px solid ${arrowColor}`,
        };

      case 'left':
        return {
          ...baseStyle,
          right: `-${ARROW_SIZE}px`,
          top: '50%',
          marginTop: `-${ARROW_SIZE}px`,
          borderTop: `${ARROW_SIZE}px solid transparent`,
          borderBottom: `${ARROW_SIZE}px solid transparent`,
          borderLeft: `${ARROW_SIZE}px solid ${arrowColor}`,
        };

      default:
        return baseStyle;
    }
  };

  return createPortal(
    <div
      className="fixed z-[10000] transition-opacity duration-200"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div
        ref={tooltipRef}
        className={`relative rounded-xl shadow-2xl backdrop-blur-sm border max-w-sm ${
          isVisible ? 'animate-tooltip-pulse' : ''
        }`}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 247, 0.95) 100%)',
          borderColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(217, 119, 6, 0.25)',
          boxShadow: isDark
            ? '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(251, 191, 36, 0.1)'
            : '0 8px 24px rgba(139, 92, 46, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* Arrow */}
        <div style={getArrowStyle()} />

        {/* Icon */}
        <div className="flex items-start gap-3 p-4 pb-3">
          <div
            className="text-2xl flex-shrink-0"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
            }}
          >
            💡
          </div>

          {/* Content */}
          <div className="flex-1">
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                color: isDark ? '#f1f5f9' : '#3d2f24',
                lineHeight: '1.5',
              }}
            >
              {content}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex flex-col gap-2">
          <button
            onClick={handleDismiss}
            className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)',
              border: '1px solid rgba(180, 83, 9, 0.3)',
            }}
          >
            Got it
          </button>

          <button
            onClick={handleDisableAll}
            className="text-xs transition-colors duration-150"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              color: isDark ? '#94a3b8' : '#8b7a6a',
            }}
          >
            Disable future helper tooltips
          </button>
        </div>
      </div>

      {/* Pulse animation keyframes */}
      <style jsx>{`
        @keyframes tooltip-pulse {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-tooltip-pulse {
          animation: tooltip-pulse 0.4s ease-out;
        }
      `}</style>
    </div>,
    document.body
  );
}
