// UI-related constants for consistent styling and layout

/**
 * UI constants for the application
 * @const {Object}
 */
export const UI_CONSTANTS = {
  // Color palette (matches Tailwind config)
  COLORS: {
    PARCHMENT: {
      50: '#F5E6D3',
      100: '#F0DFC8',
      200: '#E8D3B8',
      300: '#E0C7A8'
    },
    INK: {
      100: '#F5F5F4',
      200: '#E7E5E4',
      300: '#D6D3D1',
      400: '#A8A29E',
      500: '#78716C',
      600: '#57534E',
      700: '#44403C',
      800: '#292524',
      900: '#1A1816'
    },
    BOTANICAL: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D'
    },
    POTION: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      400: '#A78BFA',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9'
    },
    DANGER: {
      50: '#FEF2F2',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C'
    },
    WARNING: {
      50: '#FFFBEB',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309'
    },
    SUCCESS: {
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A'
    }
  },

  // Responsive breakpoints (px)
  BREAKPOINTS: {
    MOBILE: 640,
    TABLET: 768,
    DESKTOP: 1024,
    LARGE_DESKTOP: 1280,
    XL_DESKTOP: 1536
  },

  // Z-index layers
  Z_INDEX: {
    BASE: 0,
    HEADER: 20,
    SIDEBAR: 25,
    POPUP: 30,
    OVERLAY: 40,
    MODAL: 50,
    TOAST: 60,
    TOOLTIP: 70
  },

  // Animation durations (ms)
  ANIMATION: {
    FAST: 150,
    BASE: 300,
    SLOW: 500,
    VERY_SLOW: 1000
  },

  // Common spacing values (rem)
  SPACING: {
    TINY: 0.25,
    SMALL: 0.5,
    BASE: 1,
    MEDIUM: 1.5,
    LARGE: 2,
    XL: 3,
    XXL: 4
  },

  // Typography
  TYPOGRAPHY: {
    FONTS: {
      SERIF: '"Crimson Pro", Georgia, serif',
      SANS: '"Inter", system-ui, sans-serif',
      DISPLAY: '"Cinzel", serif',
      MONO: '"Fira Code", monospace'
    },
    SIZES: {
      XS: '0.75rem',
      SM: '0.875rem',
      BASE: '1rem',
      LG: '1.125rem',
      XL: '1.25rem',
      '2XL': '1.5rem',
      '3XL': '1.875rem',
      '4XL': '2.25rem'
    }
  },

  // Common icon sizes (px)
  ICON_SIZES: {
    SMALL: 16,
    BASE: 20,
    MEDIUM: 24,
    LARGE: 32,
    XL: 48
  },

  // Border radius values
  BORDER_RADIUS: {
    SM: '0.25rem',
    BASE: '0.5rem',
    LG: '0.75rem',
    XL: '1rem',
    FULL: '9999px'
  },

  // Shadow elevation levels
  SHADOWS: {
    SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    BASE: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    INNER: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },

  // Layout dimensions
  LAYOUT: {
    HEADER_HEIGHT: '4rem',
    SIDEBAR_WIDTH: '20rem',
    MOBILE_NAV_HEIGHT: '4rem',
    MAX_CONTENT_WIDTH: '1280px'
  },

  // Transition presets
  TRANSITIONS: {
    DEFAULT: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    FAST: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    SLOW: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    SPRING: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

/**
 * Get breakpoint value
 * @param {string} breakpoint - Breakpoint name
 * @returns {number} - Breakpoint value in pixels
 */
export function getBreakpoint(breakpoint) {
  return UI_CONSTANTS.BREAKPOINTS[breakpoint.toUpperCase()] || UI_CONSTANTS.BREAKPOINTS.DESKTOP;
}

/**
 * Check if current window width is mobile
 * @returns {boolean}
 */
export function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < UI_CONSTANTS.BREAKPOINTS.TABLET;
}

/**
 * Check if current window width is tablet
 * @returns {boolean}
 */
export function isTablet() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= UI_CONSTANTS.BREAKPOINTS.TABLET &&
         window.innerWidth < UI_CONSTANTS.BREAKPOINTS.DESKTOP;
}

/**
 * Check if current window width is desktop
 * @returns {boolean}
 */
export function isDesktop() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= UI_CONSTANTS.BREAKPOINTS.DESKTOP;
}

/**
 * Get color value from palette
 * @param {string} color - Color name (e.g., 'botanical')
 * @param {number} shade - Shade value (e.g., 600)
 * @returns {string} - Color hex value
 */
export function getColor(color, shade = 500) {
  const colorKey = color.toUpperCase();
  const palette = UI_CONSTANTS.COLORS[colorKey];
  return palette ? palette[shade] : '#000000';
}
