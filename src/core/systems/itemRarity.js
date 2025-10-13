/**
 * Item Rarity & Quality System
 *
 * Rarity Levels (4): Common, Scarce, Rare, Legendary
 * Quality Levels (3): Standard, High Quality, Exceptional
 *
 * Rarity is determined by price + quality modifier
 * Quality adds a multiplier to the effective price for rarity calculation
 */

// ============================================
// QUALITY SYSTEM
// ============================================

export const QUALITY = {
  STANDARD: 'standard',
  HIGH_QUALITY: 'high_quality',
  EXCEPTIONAL: 'exceptional'
};

export const QUALITY_LABELS = {
  [QUALITY.STANDARD]: 'Standard',
  [QUALITY.HIGH_QUALITY]: 'High Quality',
  [QUALITY.EXCEPTIONAL]: 'Exceptional'
};

// Quality multipliers for rarity calculation
// E.g., exceptional sugar (cheap) becomes rarer due to 3x multiplier
export const QUALITY_MULTIPLIERS = {
  [QUALITY.STANDARD]: 1,
  [QUALITY.HIGH_QUALITY]: 2,
  [QUALITY.EXCEPTIONAL]: 3
};

// ============================================
// RARITY SYSTEM
// ============================================

export const RARITY = {
  COMMON: 'common',
  SCARCE: 'scarce',
  RARE: 'rare',
  LEGENDARY: 'legendary'
};

export const RARITY_LABELS = {
  [RARITY.COMMON]: 'Common',
  [RARITY.SCARCE]: 'Scarce',
  [RARITY.RARE]: 'Rare',
  [RARITY.LEGENDARY]: 'Legendary'
};

// Price thresholds for rarity (in reales)
// These are base prices - quality multiplier applies
const RARITY_THRESHOLDS = {
  [RARITY.LEGENDARY]: 40,  // >= 40 reales
  [RARITY.RARE]: 20,       // >= 20 reales
  [RARITY.SCARCE]: 8,      // >= 8 reales
  [RARITY.COMMON]: 0       // < 8 reales
};

// Color schemes for each rarity - distinct from status bars
export const RARITY_COLORS = {
  [RARITY.COMMON]: {
    primary: '#10b981',      // Emerald-600 (keep green for common)
    light: '#34d399',        // Emerald-400
    dark: '#059669',         // Emerald-700
    glow: 'rgba(16, 185, 129, 0.5)',
    bg: 'rgba(16, 185, 129, 0.2)',
    border: 'rgba(16, 185, 129, 0.4)',
    text: '#059669'
  },
  [RARITY.SCARCE]: {
    primary: '#3b82f6',      // Blue-500
    light: '#60a5fa',        // Blue-400
    dark: '#2563eb',         // Blue-600
    glow: 'rgba(59, 130, 246, 0.5)',
    bg: 'rgba(59, 130, 246, 0.2)',
    border: 'rgba(59, 130, 246, 0.4)',
    text: '#2563eb'
  },
  [RARITY.RARE]: {
    primary: '#a855f7',      // Purple-500 (different shade)
    light: '#c084fc',        // Purple-400
    dark: '#9333ea',         // Purple-600
    glow: 'rgba(168, 85, 247, 0.5)',
    bg: 'rgba(168, 85, 247, 0.2)',
    border: 'rgba(168, 85, 247, 0.4)',
    text: '#9333ea'
  },
  [RARITY.LEGENDARY]: {
    primary: '#ec4899',      // Hot Pink-500
    light: '#f472b6',        // Pink-400
    dark: '#db2777',         // Pink-600
    glow: 'rgba(236, 72, 153, 0.6)',
    bg: 'rgba(236, 72, 153, 0.25)',
    border: 'rgba(236, 72, 153, 0.5)',
    text: '#db2777'
  }
};

// ============================================
// RARITY CALCULATION
// ============================================

/**
 * Calculate item rarity based on price and quality
 * @param {number} price - Base price in reales
 * @param {string} quality - Quality level (QUALITY.STANDARD, etc.)
 * @returns {string} Rarity level (RARITY.COMMON, etc.)
 */
export function calculateRarity(price, quality = QUALITY.STANDARD) {
  const multiplier = QUALITY_MULTIPLIERS[quality] || 1;
  const effectivePrice = price * multiplier;

  if (effectivePrice >= RARITY_THRESHOLDS[RARITY.LEGENDARY]) {
    return RARITY.LEGENDARY;
  }
  if (effectivePrice >= RARITY_THRESHOLDS[RARITY.RARE]) {
    return RARITY.RARE;
  }
  if (effectivePrice >= RARITY_THRESHOLDS[RARITY.SCARCE]) {
    return RARITY.SCARCE;
  }
  return RARITY.COMMON;
}

/**
 * Get color scheme for a rarity level
 * @param {string} rarity - Rarity level
 * @returns {object} Color scheme object
 */
export function getRarityColors(rarity) {
  return RARITY_COLORS[rarity] || RARITY_COLORS[RARITY.COMMON];
}

/**
 * Get item rarity from item object
 * @param {object} item - Item with price and optional quality/rarity fields
 * @returns {string} Rarity level
 */
export function getItemRarity(item) {
  // If item already has rarity defined, use it
  if (item.rarity) {
    return item.rarity;
  }

  // Otherwise calculate from price and quality
  const quality = item.quality || QUALITY.STANDARD;
  return calculateRarity(item.price, quality);
}

/**
 * Get item quality
 * @param {object} item - Item with optional quality field
 * @returns {string} Quality level
 */
export function getItemQuality(item) {
  return item.quality || QUALITY.STANDARD;
}

/**
 * Check if item should show quality badge
 * @param {object} item - Item object
 * @returns {boolean} True if quality badge should be shown
 */
export function shouldShowQualityBadge(item) {
  const quality = getItemQuality(item);
  return quality !== QUALITY.STANDARD;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a random quality level with weighted probability
 * Standard: 85%, High Quality: 13%, Exceptional: 2%
 * @returns {string} Quality level
 */
export function generateRandomQuality() {
  const roll = Math.random();

  if (roll < 0.02) {
    return QUALITY.EXCEPTIONAL;  // 2% chance
  }
  if (roll < 0.15) {
    return QUALITY.HIGH_QUALITY; // 13% chance
  }
  return QUALITY.STANDARD;       // 85% chance
}

/**
 * Add rarity/quality metadata to an item
 * @param {object} item - Item object
 * @param {string} quality - Optional quality override
 * @returns {object} Item with rarity/quality metadata
 */
export function enrichItemWithRarity(item, quality = null) {
  const itemQuality = quality || item.quality || QUALITY.STANDARD;
  const rarity = getItemRarity({ ...item, quality: itemQuality });

  return {
    ...item,
    quality: itemQuality,
    rarity,
    rarityColors: getRarityColors(rarity)
  };
}
