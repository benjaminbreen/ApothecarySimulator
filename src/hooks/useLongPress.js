import { useCallback, useRef, useState } from 'react';
import { triggerHaptic } from '../utils/haptics';

/**
 * Long Press Hook
 * Detects long press gestures for context menus and alternative actions
 *
 * @param {Function} onLongPress - Callback when long press is detected
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Time threshold in ms (default: 500)
 * @param {Function} options.onStart - Callback when press starts
 * @param {Function} options.onFinish - Callback when press finishes
 * @param {Function} options.onCancel - Callback when press is cancelled
 * @param {boolean} options.enableHaptics - Enable haptic feedback (default: true)
 * @param {string} options.hapticType - Haptic pattern (default: 'medium')
 *
 * @returns {Object} Event handlers to attach to element
 *
 * @example
 * const longPressHandlers = useLongPress(() => {
 *   console.log('Long press detected!');
 *   showContextMenu();
 * }, { threshold: 500 });
 *
 * return <div {...longPressHandlers}>Long press me</div>;
 */
export function useLongPress(
  onLongPress,
  {
    threshold = 500,
    onStart,
    onFinish,
    onCancel,
    enableHaptics = true,
    hapticType = 'medium'
  } = {}
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef(null);
  const target = useRef(null);

  const start = useCallback(
    (event) => {
      // Prevent default to avoid text selection on long press
      if (event.cancelable) {
        event.preventDefault();
      }

      if (onStart) {
        onStart(event);
      }

      target.current = event.target;

      timeout.current = setTimeout(() => {
        // Trigger haptic feedback
        if (enableHaptics) {
          triggerHaptic(hapticType);
        }

        // Call long press handler
        if (onLongPress) {
          onLongPress(event);
        }

        setLongPressTriggered(true);

        if (onFinish) {
          onFinish(event);
        }
      }, threshold);
    },
    [onLongPress, onStart, onFinish, threshold, enableHaptics, hapticType]
  );

  const clear = useCallback(
    (event, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      timeout.current = null;

      if (longPressTriggered) {
        if (onFinish && !shouldTriggerClick) {
          onFinish(event);
        }
        setLongPressTriggered(false);
      } else if (onCancel) {
        onCancel(event);
      }
    },
    [longPressTriggered, onFinish, onCancel]
  );

  return {
    onMouseDown: (e) => start(e),
    onTouchStart: (e) => start(e),
    onMouseUp: (e) => clear(e),
    onTouchEnd: (e) => clear(e),
    onMouseLeave: (e) => clear(e, false),
    onTouchCancel: (e) => clear(e, false)
  };
}

/**
 * Simplified long press hook with just callback
 * @param {Function} callback - Long press callback
 * @param {number} threshold - Time threshold (default: 500ms)
 * @returns {Object} Event handlers
 */
export function useSimpleLongPress(callback, threshold = 500) {
  return useLongPress(callback, {
    threshold,
    enableHaptics: true,
    hapticType: 'medium'
  });
}

export default useLongPress;
