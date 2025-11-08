/**
 * Browser detection utilities for performance optimization
 * Safari has poor SVG filter performance, so we detect it and apply optimizations
 */

let cachedIsSafari = null;

/**
 * Detects if the current browser is Safari
 * @returns {boolean} True if Safari, false otherwise
 */
export const isSafari = () => {
  if (cachedIsSafari !== null) {
    return cachedIsSafari;
  }

  // Check if running in browser
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    cachedIsSafari = false;
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();

  // Safari detection: contains "safari" but NOT "chrome" or "chromium"
  // This is important because Chrome's UA string also contains "safari"
  const isSafariBrowser =
    ua.includes('safari') &&
    !ua.includes('chrome') &&
    !ua.includes('chromium') &&
    !ua.includes('android');

  cachedIsSafari = isSafariBrowser;
  return isSafariBrowser;
};

/**
 * Hook to get Safari detection status
 * Use this in React components for reactivity
 */
export const useSafariDetection = () => {
  return isSafari();
};

/**
 * Applies Safari-specific class to document root for CSS targeting
 * Call this once on app initialization
 */
export const applySafariClass = () => {
  if (typeof document === 'undefined') return;

  if (isSafari()) {
    document.documentElement.classList.add('is-safari');
    console.log('[browserDetection] Safari detected - applying performance optimizations');
  }
};

/**
 * Returns backdrop-filter CSS only if NOT Safari
 * Safari has extremely poor backdrop-filter performance
 * @param {string} filterValue - The backdrop-filter value (e.g., 'blur(12px)')
 * @returns {object} CSS style object
 */
export const getBackdropFilter = (filterValue) => {
  if (isSafari()) {
    return {}; // Empty object, no backdrop-filter on Safari
  }
  return {
    backdropFilter: filterValue,
    WebkitBackdropFilter: filterValue
  };
};
