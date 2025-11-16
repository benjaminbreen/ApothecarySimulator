/**
 * TravelAnimationManager
 * Handles animated travel for location-based navigation
 * Uses useAnimatedTravel hook to smoothly move player icon along calculated paths
 */

import { useEffect } from 'react';
import { useAnimatedTravel } from '../features/map/hooks/useAnimatedTravel';

/**
 * Travel Animation Manager Component
 * Invisible component that manages travel animation state
 *
 * @param {Object} props
 * @param {Object} props.travelState - Travel animation state from navigation handler
 * @param {Function} props.onPositionUpdate - Callback to update player position during animation
 */
export function TravelAnimationManager({ travelState, onPositionUpdate }) {
  const {
    currentPosition,
    currentDirection,
    progress,
    isAnimating,
    skip
  } = useAnimatedTravel({
    path: travelState?.path || null,
    duration: travelState?.duration || 2000,
    isActive: travelState?.isActive || false,
    onComplete: travelState?.onComplete || null,
    onProgress: (prog) => {
      // Call the navigation handler's onProgress callback
      if (travelState?.onProgress) {
        travelState.onProgress(prog);
      }
    }
  });

  // Update player position as animation progresses
  useEffect(() => {
    if (isAnimating && currentPosition && onPositionUpdate) {
      onPositionUpdate({
        x: currentPosition[0],
        y: currentPosition[1],
        direction: currentDirection
      });
    }
  }, [currentPosition, currentDirection, isAnimating, onPositionUpdate]);

  // Expose skip function globally (could be attached to a button)
  useEffect(() => {
    if (isAnimating && skip && window) {
      window.__skipTravelAnimation = skip;
    } else if (window) {
      delete window.__skipTravelAnimation;
    }

    return () => {
      if (window) {
        delete window.__skipTravelAnimation;
      }
    };
  }, [isAnimating, skip]);

  // This is an invisible component - it only manages state
  return null;
}

export default TravelAnimationManager;
