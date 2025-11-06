/**
 * Background Zoom Animation Utility
 *
 * Provides smooth zoom animations for background travel effects
 */

/**
 * Animate background zoom from 0 to 100 over duration
 * @param {Function} setZoomState - State setter for travelZoomState
 * @param {number} targetX - Target horizontal position (% from left, 0-100)
 * @param {number} duration - Animation duration in milliseconds
 * @param {Function} onComplete - Callback when animation completes
 * @returns {Function} Cancel function to stop animation
 */
export function animateBackgroundZoom(setZoomState, targetX, duration, onComplete) {
  console.log('[ZoomAnimation] Starting zoom:', { targetX, duration });

  const startTime = Date.now();
  const frameInterval = 16; // ~60fps
  let timeoutId = null;
  let cancelled = false;

  const animate = () => {
    if (cancelled) {
      console.log('[ZoomAnimation] Animation cancelled');
      return;
    }

    const elapsed = Date.now() - startTime;
    const progress = Math.min((elapsed / duration) * 100, 100);

    setZoomState({
      isActive: true,
      progress,
      targetX
    });

    console.log('[ZoomAnimation] Progress:', progress.toFixed(1) + '%');

    if (progress < 100) {
      timeoutId = setTimeout(animate, frameInterval);
    } else {
      // Animation complete - callback handles what happens next (maintain or reset)
      console.log('[ZoomAnimation] Zoom IN complete');
      if (onComplete) onComplete();
    }
  };

  // Start animation
  animate();

  // Return cancel function
  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
    console.log('[ZoomAnimation] Cancel requested');
  };
}

/**
 * Animate background zoom OUT from current position to normal view (0)
 * @param {Function} setZoomState - State setter for travelZoomState
 * @param {number} currentProgress - Current zoom progress (0-100)
 * @param {number} targetX - Current target X position to zoom out from
 * @param {number} duration - Animation duration in milliseconds
 * @param {Function} onComplete - Callback when animation completes
 * @returns {Function} Cancel function to stop animation
 */
export function animateBackgroundZoomOut(setZoomState, currentProgress, targetX, duration, onComplete) {
  console.log('[ZoomAnimation] Starting zoom OUT:', { currentProgress, targetX, duration });

  const startTime = Date.now();
  const frameInterval = 16; // ~60fps
  let timeoutId = null;
  let cancelled = false;

  const animate = () => {
    if (cancelled) {
      console.log('[ZoomAnimation] Zoom out cancelled');
      return;
    }

    const elapsed = Date.now() - startTime;
    const progressRatio = Math.min(elapsed / duration, 1); // 0 to 1

    // Animate from currentProgress down to 0
    const progress = currentProgress * (1 - progressRatio);

    setZoomState({
      isActive: progress > 0,
      progress,
      targetX
    });

    console.log('[ZoomAnimation] Zoom OUT progress:', progress.toFixed(1) + '%');

    if (progressRatio < 1) {
      timeoutId = setTimeout(animate, frameInterval);
    } else {
      // Zoom out complete
      console.log('[ZoomAnimation] Zoom OUT complete, resetting');
      setZoomState({ isActive: false, progress: 0, targetX: 50 });
      if (onComplete) onComplete();
    }
  };

  // Start animation
  animate();

  // Return cancel function
  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
    console.log('[ZoomAnimation] Zoom out cancel requested');
  };
}

/**
 * Reset zoom state to default
 * @param {Function} setZoomState - State setter for travelZoomState
 */
export function resetZoom(setZoomState) {
  setZoomState({ isActive: false, progress: 0, targetX: 50 });
}

/**
 * Set and maintain zoom at a specific building
 * @param {Function} setZoomState - State setter for travelZoomState
 * @param {number} targetX - Target X position to maintain zoom on
 */
export function maintainZoom(setZoomState, targetX) {
  console.log('[ZoomAnimation] Maintaining zoom at:', targetX);
  setZoomState({
    isActive: true,
    progress: 100,
    targetX
  });
}
