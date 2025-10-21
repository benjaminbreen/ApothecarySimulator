import { useState, useEffect } from 'react';

/**
 * Tailwind-aligned breakpoints for responsive design
 * @constant
 */
export const BREAKPOINTS = {
  mobile: 640,      // sm: phones (iPhone SE, Android)
  tablet: 768,      // md: tablets (iPad Mini)
  desktop: 1024,    // lg: laptops
  wide: 1280        // xl: large desktops
};

/**
 * Determines device type based on screen width
 * @param {number} width - Screen width in pixels
 * @returns {string} Device type: 'phone' | 'large-phone' | 'tablet' | 'laptop' | 'desktop'
 */
function getDeviceType(width) {
  if (width < BREAKPOINTS.mobile) return 'phone';
  if (width < BREAKPOINTS.tablet) return 'large-phone';
  if (width < BREAKPOINTS.desktop) return 'tablet';
  if (width < BREAKPOINTS.wide) return 'laptop';
  return 'desktop';
}

/**
 * Hook for detecting screen size and device characteristics
 * Provides responsive breakpoint detection and orientation tracking
 *
 * @returns {Object} Screen size information
 * @property {number} width - Current viewport width
 * @property {number} height - Current viewport height
 * @property {boolean} isMobile - True if width < 640px (phone)
 * @property {boolean} isTablet - True if 640px <= width < 1024px
 * @property {boolean} isDesktop - True if width >= 1024px
 * @property {boolean} isPortrait - True if height > width
 * @property {boolean} isLandscape - True if width > height
 * @property {string} device - Device type ('phone' | 'large-phone' | 'tablet' | 'laptop' | 'desktop')
 *
 * @example
 * const { isMobile, isTablet, isPortrait, device } = useScreenSize();
 *
 * if (isMobile) {
 *   return <MobileLayout />;
 * }
 *
 * if (isTablet && isPortrait) {
 *   return <TabletPortraitLayout />;
 * }
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      isMobile: width < BREAKPOINTS.mobile,
      isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop,
      isDesktop: width >= BREAKPOINTS.desktop,
      isPortrait: height > width,
      isLandscape: width > height,
      device: getDeviceType(width)
    };
  });

  useEffect(() => {
    /**
     * Updates screen size state on window resize
     */
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({
        width,
        height,
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop,
        isDesktop: width >= BREAKPOINTS.desktop,
        isPortrait: height > width,
        isLandscape: width > height,
        device: getDeviceType(width)
      });
    };

    // Debounce resize events for performance
    // Prevents excessive re-renders during continuous resize
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150); // 150ms debounce
    };

    // Listen for both resize and orientation change events
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', handleResize);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenSize;
}
