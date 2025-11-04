/**
 * colorUtils.js - Color manipulation utilities for weather and background systems
 * Provides color blending, conversion, and interpolation functions
 */

/**
 * Convert hex color to RGB components
 * @param {string} hex - Hex color string (e.g., "#FF5733" or "FF5733")
 * @returns {{ r: number, g: number, b: number }} - RGB components (0-255)
 */
export const hexToRgb = (hex) => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse hex string
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
};

/**
 * Convert RGB components to hex color string
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} - Hex color string with # prefix
 */
export const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Convert RGB string to RGB components
 * @param {string} rgb - RGB string (e.g., "rgb(255, 87, 51)")
 * @returns {{ r: number, g: number, b: number }} - RGB components (0-255)
 */
export const parseRgbString = (rgb) => {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) {
    console.warn('[colorUtils] Could not parse RGB string:', rgb);
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10)
  };
};

/**
 * Parse any color string to RGB components
 * Supports hex (#FF5733) and rgb(255, 87, 51) formats
 * @param {string} color - Color string
 * @returns {{ r: number, g: number, b: number }} - RGB components (0-255)
 */
export const parseColor = (color) => {
  if (!color || typeof color !== 'string') {
    console.warn('[colorUtils] Invalid color:', color);
    return { r: 0, g: 0, b: 0 };
  }

  const trimmed = color.trim();

  // Hex format
  if (trimmed.startsWith('#')) {
    return hexToRgb(trimmed);
  }

  // RGB format
  if (trimmed.startsWith('rgb')) {
    return parseRgbString(trimmed);
  }

  console.warn('[colorUtils] Unsupported color format:', color);
  return { r: 0, g: 0, b: 0 };
};

/**
 * Blend two colors together
 * @param {string} color1 - First color (hex or rgb string)
 * @param {string} color2 - Second color (hex or rgb string)
 * @param {number} progress - Blend progress (0 = color1, 1 = color2)
 * @returns {string} - Blended color as RGB string
 */
export const blendColors = (color1, color2, progress) => {
  // Clamp progress to 0-1
  const t = Math.max(0, Math.min(1, progress));

  // Parse colors
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);

  // Linear interpolation for each channel
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Blend two colors with easing function
 * @param {string} color1 - First color
 * @param {string} color2 - Second color
 * @param {number} progress - Blend progress (0-1)
 * @param {function} easingFn - Easing function (default: easeInOutCubic)
 * @returns {string} - Blended color as RGB string
 */
export const blendColorsEased = (color1, color2, progress, easingFn = easeInOutCubic) => {
  const easedProgress = easingFn(progress);
  return blendColors(color1, color2, easedProgress);
};

/**
 * Darken a color by a percentage
 * @param {string} color - Color to darken (hex or rgb)
 * @param {number} amount - Amount to darken (0-1, where 1 = completely black)
 * @returns {string} - Darkened color as RGB string
 */
export const darkenColor = (color, amount) => {
  const rgb = parseColor(color);
  const factor = 1 - Math.max(0, Math.min(1, amount));

  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Lighten a color by a percentage
 * @param {string} color - Color to lighten (hex or rgb)
 * @param {number} amount - Amount to lighten (0-1, where 1 = completely white)
 * @returns {string} - Lightened color as RGB string
 */
export const lightenColor = (color, amount) => {
  const rgb = parseColor(color);
  const factor = Math.max(0, Math.min(1, amount));

  const r = Math.round(rgb.r + (255 - rgb.r) * factor);
  const g = Math.round(rgb.g + (255 - rgb.g) * factor);
  const b = Math.round(rgb.b + (255 - rgb.b) * factor);

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Adjust color saturation
 * @param {string} color - Color to adjust
 * @param {number} amount - Saturation multiplier (0 = grayscale, 1 = original, >1 = more saturated)
 * @returns {string} - Adjusted color as RGB string
 */
export const adjustSaturation = (color, amount) => {
  const rgb = parseColor(color);

  // Convert to HSL
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    // Grayscale
    return color;
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  // Apply saturation adjustment
  const newS = Math.max(0, Math.min(1, s * amount));

  // Convert back to RGB
  const hue = (() => {
    if (max === r) return ((g - b) / d + (g < b ? 6 : 0)) / 6;
    if (max === g) return ((b - r) / d + 2) / 6;
    return ((r - g) / d + 4) / 6;
  })();

  const hslToRgb = (h, s, l) => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const newRgb = hslToRgb(hue, newS, l);
  return `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`;
};

/**
 * Create a gradient string for CSS
 * @param {Array<{color: string, position: number}>} stops - Color stops (position 0-1)
 * @param {string} direction - Gradient direction (e.g., "to bottom", "180deg")
 * @returns {string} - CSS gradient string
 */
export const createGradient = (stops, direction = '180deg') => {
  const stopStrings = stops.map(stop => {
    const pos = Math.round(stop.position * 100);
    return `${stop.color} ${pos}%`;
  });

  return `linear-gradient(${direction}, ${stopStrings.join(', ')})`;
};

// ============================================
// Easing Functions
// ============================================

/**
 * Ease in-out cubic (smooth acceleration and deceleration)
 * @param {number} t - Progress (0-1)
 * @returns {number} - Eased progress (0-1)
 */
export const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Ease in cubic (smooth acceleration)
 * @param {number} t - Progress (0-1)
 * @returns {number} - Eased progress (0-1)
 */
export const easeInCubic = (t) => {
  return t * t * t;
};

/**
 * Ease out cubic (smooth deceleration)
 * @param {number} t - Progress (0-1)
 * @returns {number} - Eased progress (0-1)
 */
export const easeOutCubic = (t) => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Ease in-out sine (very smooth)
 * @param {number} t - Progress (0-1)
 * @returns {number} - Eased progress (0-1)
 */
export const easeInOutSine = (t) => {
  return -(Math.cos(Math.PI * t) - 1) / 2;
};

/**
 * Linear (no easing)
 * @param {number} t - Progress (0-1)
 * @returns {number} - Eased progress (0-1)
 */
export const linear = (t) => {
  return t;
};
