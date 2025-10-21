import { useRef, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics';

/**
 * Gesture Detection Hook
 * Detects swipe gestures (up, down, left, right) and tap events
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback for left swipe
 * @param {Function} options.onSwipeRight - Callback for right swipe
 * @param {Function} options.onSwipeUp - Callback for up swipe
 * @param {Function} options.onSwipeDown - Callback for down swipe
 * @param {Function} options.onTap - Callback for tap
 * @param {number} options.minSwipeDistance - Minimum distance for swipe (default: 50px)
 * @param {number} options.minSwipeVelocity - Minimum velocity for swipe (default: 0.3 px/ms)
 * @param {number} options.maxSwipeTime - Maximum time for swipe (default: 500ms)
 * @param {boolean} options.enableHaptics - Enable haptic feedback (default: true)
 * @param {boolean} options.preventDefault - Prevent default touch behavior (default: false)
 *
 * @returns {Object} Ref to attach to element
 *
 * @example
 * const gestureRef = useGesture({
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right'),
 *   minSwipeDistance: 100
 * });
 * return <div ref={gestureRef}>Swipeable content</div>;
 */
export function useGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  minSwipeDistance = 50,
  minSwipeVelocity = 0.3,
  maxSwipeTime = 500,
  enableHaptics = true,
  preventDefault = false
} = {}) {
  const elementRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let touchStartTime = 0;

    /**
     * Handle touch start
     */
    const handleTouchStart = (e) => {
      if (preventDefault) {
        e.preventDefault();
      }

      touchStartTime = Date.now();
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      touchEndRef.current = null;
    };

    /**
     * Handle touch move
     */
    const handleTouchMove = (e) => {
      if (preventDefault) {
        e.preventDefault();
      }

      touchEndRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };

    /**
     * Handle touch end - detect gesture type
     */
    const handleTouchEnd = (e) => {
      if (preventDefault) {
        e.preventDefault();
      }

      if (!touchStartRef.current || !touchEndRef.current) {
        // Tap gesture (no movement)
        if (onTap && touchStartRef.current) {
          const touchDuration = Date.now() - touchStartTime;
          if (touchDuration < 200) {
            if (enableHaptics) {
              triggerHaptic('light');
            }
            onTap(e);
          }
        }
        return;
      }

      const touchDuration = Date.now() - touchStartTime;
      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = touchEndRef.current.y - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / touchDuration;

      // Check if gesture meets minimum requirements
      if (distance < minSwipeDistance || touchDuration > maxSwipeTime) {
        return;
      }

      if (velocity < minSwipeVelocity) {
        return;
      }

      // Determine swipe direction
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          if (enableHaptics) {
            triggerHaptic('selection');
          }
          onSwipeRight({ distance, velocity, deltaX, deltaY });
        } else if (deltaX < 0 && onSwipeLeft) {
          if (enableHaptics) {
            triggerHaptic('selection');
          }
          onSwipeLeft({ distance, velocity, deltaX, deltaY });
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          if (enableHaptics) {
            triggerHaptic('selection');
          }
          onSwipeDown({ distance, velocity, deltaX, deltaY });
        } else if (deltaY < 0 && onSwipeUp) {
          if (enableHaptics) {
            triggerHaptic('selection');
          }
          onSwipeUp({ distance, velocity, deltaX, deltaY });
        }
      }

      // Reset
      touchStartRef.current = null;
      touchEndRef.current = null;
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    minSwipeDistance,
    minSwipeVelocity,
    maxSwipeTime,
    enableHaptics,
    preventDefault
  ]);

  return elementRef;
}

/**
 * Simplified swipe hook for common use cases
 * @param {Function} onSwipeLeft - Left swipe callback
 * @param {Function} onSwipeRight - Right swipe callback
 * @returns {Object} Ref to attach to element
 */
export function useSwipe(onSwipeLeft, onSwipeRight) {
  return useGesture({
    onSwipeLeft,
    onSwipeRight,
    minSwipeDistance: 50,
    enableHaptics: true
  });
}

/**
 * Pull-to-refresh hook
 * @param {Function} onRefresh - Refresh callback
 * @param {number} threshold - Pull distance threshold (default: 80px)
 * @returns {Object} Ref and state
 */
export function usePullToRefresh(onRefresh, threshold = 80) {
  const elementRef = useRef(null);
  const isPullingRef = useRef(false);
  const pullDistanceRef = useRef(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startY = 0;

    const handleTouchStart = (e) => {
      // Only trigger if scrolled to top
      if (element.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isPullingRef.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPullingRef.current) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0) {
        pullDistanceRef.current = deltaY;

        // Visual feedback when threshold reached
        if (deltaY > threshold) {
          triggerHaptic('light');
        }
      }
    };

    const handleTouchEnd = () => {
      if (isPullingRef.current && pullDistanceRef.current > threshold) {
        triggerHaptic('success');
        if (onRefresh) {
          onRefresh();
        }
      }

      isPullingRef.current = false;
      pullDistanceRef.current = 0;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold]);

  return elementRef;
}

export default useGesture;
