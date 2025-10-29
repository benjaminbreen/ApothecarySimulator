/**
 * useAnimatedTravel Hook
 * Phase 3: Smooth player icon animation along city paths
 *
 * Manages animated movement of player marker across exterior map during house calls
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { interpolatePath } from '../services/cityPathfinding';

/**
 * Custom hook for animating player icon travel along a path
 *
 * @param {Object} options - Animation options
 * @param {Array<[number, number]>} options.path - Path waypoints [[x1, y1], [x2, y2], ...]
 * @param {number} options.duration - Total animation duration in milliseconds
 * @param {boolean} options.isActive - Whether animation should be running
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {Function} options.onProgress - Callback with progress updates (0-100)
 *
 * @returns {Object} Animation state
 * @returns {[number, number]|null} return.currentPosition - Current player position [x, y]
 * @returns {number} return.currentDirection - Current facing direction in degrees (0=N, 90=E, 180=S, 270=W)
 * @returns {number} return.progress - Animation progress (0-100)
 * @returns {boolean} return.isAnimating - Whether animation is currently running
 * @returns {Function} return.skip - Function to skip to end of animation
 */
export function useAnimatedTravel({
  path = null,
  duration = 3000,
  isActive = false,
  onComplete = null,
  onProgress = null
}) {
  useEffect(() => {
    if (!isActive && onProgress) {
      onProgress(0);
    }
  }, [isActive, onProgress]);

  const [currentPosition, setCurrentPosition] = useState(null);
  const [currentDirection, setCurrentDirection] = useState(180); // Default south
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const interpolatedPathRef = useRef(null);

  /**
   * Calculate direction angle between two points
   * @param {[number, number]} from - Start point
   * @param {[number, number]} to - End point
   * @returns {number} Angle in degrees (0=N, 90=E, 180=S, 270=W)
   */
  const calculateDirection = useCallback((from, to) => {
    if (!from || !to) return 180;

    const [x1, y1] = from;
    const [x2, y2] = to;

    const dx = x2 - x1;
    const dy = y2 - y1;

    // Calculate angle in radians, then convert to degrees
    // Math.atan2 returns angle from positive x-axis
    // We need to adjust for SVG coordinate system (y increases downward)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Convert to compass bearing (0=N, 90=E, 180=S, 270=W)
    // Math.atan2 gives: 0=E, 90=S, 180=W, -90=N
    // We want: 0=N, 90=E, 180=S, 270=W
    angle = (angle + 90) % 360;
    if (angle < 0) angle += 360;

    return angle;
  }, []);

  /**
   * Animation loop
   */
  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progressPercent = Math.min((elapsed / duration) * 100, 100);

    setProgress(progressPercent);
    if (onProgress) {
      onProgress(progressPercent);
    }

    // Get interpolated path
    const interpolated = interpolatedPathRef.current;
    if (!interpolated || interpolated.length < 2) {
      console.warn('[useAnimatedTravel] No interpolated path available');
      setIsAnimating(false);
      return;
    }

    // Calculate current position along path
    const totalPoints = interpolated.length;
    const currentIndex = Math.floor((progressPercent / 100) * (totalPoints - 1));
    const nextIndex = Math.min(currentIndex + 1, totalPoints - 1);

    const currentPoint = interpolated[currentIndex];
    const nextPoint = interpolated[nextIndex];

    setCurrentPosition(currentPoint);

    // Update direction based on movement vector
    if (currentIndex < totalPoints - 1) {
      const direction = calculateDirection(currentPoint, nextPoint);
      setCurrentDirection(direction);
    }

    // Continue animation or complete
    if (progressPercent < 100) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Animation complete
      setIsAnimating(false);
      startTimeRef.current = null;
      if (onComplete) {
        onComplete();
      }
    }
  }, [duration, onComplete, onProgress, calculateDirection]);

  /**
   * Start animation
   */
  useEffect(() => {
    if (!isActive || !path || path.length < 2) {
      // Reset animation state if not active
      if (!isActive) {
        setIsAnimating(false);
        setProgress(0);
        setCurrentPosition(null);
        startTimeRef.current = null;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
      if (!isActive && onProgress) {
        onProgress(0);
      }
      return;
    }

    console.log('[useAnimatedTravel] Starting animation with path:', path);

    // Generate interpolated path for smooth movement
    const interpolated = interpolatePath(path, 20); // Point every 20 pixels
    interpolatedPathRef.current = interpolated;

    console.log('[useAnimatedTravel] Interpolated path:', interpolated.length, 'points');

    // Set initial position
    setCurrentPosition(path[0]);
    setProgress(0);
    setIsAnimating(true);
    startTimeRef.current = null;

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, path, animate]);

  /**
   * Skip to end of animation
   */
  const skip = useCallback(() => {
    if (!path || path.length === 0) return;

    // Cancel current animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Jump to end
    const endPosition = path[path.length - 1];
    setCurrentPosition(endPosition);
    setProgress(100);
    setIsAnimating(false);
    startTimeRef.current = null;

    // Trigger completion callback
    if (onProgress) {
      onProgress(100);
    }

    if (onComplete) {
      onComplete();
    }
  }, [path, onComplete]);

  return {
    currentPosition,
    currentDirection,
    progress,
    isAnimating,
    skip
  };
}
