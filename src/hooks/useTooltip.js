/**
 * useTooltip Hook
 *
 * Custom hook for integrating helper tooltips into components with:
 * - Automatic registration/cleanup
 * - Trigger condition evaluation
 * - Smart show/hide logic
 * - Ref management for anchor element
 *
 * Usage:
 * ```jsx
 * const { show, dismiss, anchorRef } = useTooltip('my-tooltip-id', {
 *   content: 'This is a helpful tip',
 *   trigger: 'immediate',
 *   dependencies: [someValue]
 * });
 *
 * return (
 *   <div ref={anchorRef}>
 *     Content to attach tooltip to
 *   </div>
 * );
 * ```
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useTooltipContext } from '../contexts/TooltipContext';
import { shouldShowTooltip as evaluateTrigger } from '../utils/tooltipTriggers';

/**
 * Hook for using a tooltip in a component
 *
 * @param {string} id - Unique tooltip ID
 * @param {Object} config - Tooltip configuration
 * @param {string} config.content - Tooltip text content (keep under 140 chars)
 * @param {string} [config.trigger='immediate'] - When to show ('immediate' | 'hover-delay')
 * @param {Array} [config.dependencies=[]] - Values that trigger re-evaluation
 * @param {Function} [config.shouldShow] - Custom function to determine if tooltip should show
 * @param {string} [config.position='auto'] - Tooltip position preference ('auto' | 'top' | 'bottom' | 'left' | 'right')
 * @param {Object} [config.gameState] - Game state for trigger evaluation (optional)
 * @param {boolean} [config.useTriggerSystem=false] - Use trigger system for auto-show (optional)
 * @returns {Object} - { show, dismiss, anchorRef, isActive }
 */
export function useTooltip(id, config = {}) {
  const {
    content = '',
    trigger = 'immediate',
    dependencies = [],
    shouldShow: customShouldShow = null,
    position = 'auto',
    gameState = null,
    useTriggerSystem = false
  } = config;

  const {
    tooltipsEnabled,
    seenTooltips,
    currentTooltip,
    registerTooltip,
    unregisterTooltip,
    showTooltip,
    dismissTooltip,
    disableAllTooltips,
  } = useTooltipContext();

  const anchorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimerRef = useRef(null);

  // Register tooltip on mount
  useEffect(() => {
    registerTooltip(id, {
      content,
      trigger,
      position,
      dependencies
    });

    console.log('[useTooltip] Registered:', id);

    return () => {
      unregisterTooltip(id);
      console.log('[useTooltip] Unregistered:', id);
    };
  }, [id, content, trigger, position, registerTooltip, unregisterTooltip]);

  // Check if this tooltip should be shown
  const shouldShowTooltip = useCallback(() => {
    // Don't show if disabled or already seen
    if (!tooltipsEnabled || seenTooltips.has(id)) {
      return false;
    }

    // Don't show if another tooltip is currently visible
    if (currentTooltip && currentTooltip !== id) {
      return false;
    }

    // Use trigger system if enabled and gameState provided
    if (useTriggerSystem && gameState) {
      const triggerResult = evaluateTrigger(id, gameState, seenTooltips);
      if (!triggerResult) {
        return false;
      }
    }

    // Use custom logic if provided
    if (customShouldShow) {
      return customShouldShow();
    }

    // Default: always show if conditions met
    return true;
  }, [tooltipsEnabled, seenTooltips, currentTooltip, id, customShouldShow, useTriggerSystem, gameState]);

  // Trigger logic based on type
  useEffect(() => {
    if (trigger === 'immediate' && shouldShowTooltip()) {
      // Show immediately when conditions are met
      const timer = setTimeout(() => {
        showTooltip(id);
      }, 100); // Small delay to ensure component is mounted

      return () => clearTimeout(timer);
    }
  }, [trigger, shouldShowTooltip, showTooltip, id, ...dependencies]);

  // Hover delay trigger (show after 2s hover)
  useEffect(() => {
    if (trigger === 'hover-delay' && anchorRef.current) {
      const element = anchorRef.current;

      const handleMouseEnter = () => {
        setIsHovering(true);

        // Start 2-second timer
        hoverTimerRef.current = setTimeout(() => {
          if (shouldShowTooltip()) {
            showTooltip(id);
          }
        }, 2000);
      };

      const handleMouseLeave = () => {
        setIsHovering(false);

        // Clear timer if mouse leaves early
        if (hoverTimerRef.current) {
          clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = null;
        }
      };

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);

        if (hoverTimerRef.current) {
          clearTimeout(hoverTimerRef.current);
        }
      };
    }
  }, [trigger, shouldShowTooltip, showTooltip, id]);

  // Dismiss handler
  const dismiss = useCallback(() => {
    dismissTooltip(id);
  }, [dismissTooltip, id]);

  // Disable all handler
  const handleDisableAll = useCallback(() => {
    disableAllTooltips();
  }, [disableAllTooltips]);

  // Is this tooltip currently active?
  const isActive = currentTooltip === id;

  return {
    show: isActive,
    dismiss,
    anchorRef,
    isActive,
    content,
    position,
    onDisableAll: handleDisableAll,
  };
}

export default useTooltip;
