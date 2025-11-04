/**
 * Viewport Images Configuration
 *
 * Maps contextual images to game states for the portrait viewport.
 * These images are shown when no NPC portrait is active (add-on behavior).
 *
 * Priority hierarchy:
 * 1. NPC portrait (existing system)
 * 2. Item focus (this config - items)
 * 3. Location scene (this config - locations)
 * 4. Environmental fallback (this config - environment)
 */

export const VIEWPORT_IMAGES = {
  // Item images - shown when player examines or uses specific items
  items: {
    // Herbs & Plants
    'aloe': 'aloe.jpg',
    'aloe vera': 'aloe.jpg',
    'plantago': 'plantago.jpg',
    'plantain': 'plantago.jpg',
    'herbs': 'genericleavesorherbs.jpg',
    'herbal': 'genericleavesorherbs.jpg',
    'lavender': 'foraginglavenderorherbs.jpg',
    'flowers': 'herbflowers.jpg',
    'herbal flowers': 'herbalflowers.jpg',

    // Activities
    'compounding': 'compounding.jpg',
    'mixing': 'compounding.jpg',
    'foraging': 'foraginglavenderorherbs.jpg',
    'gathering herbs': 'foraginglavenderorherbs.jpg',

    // Minerals & Compounds (add more as needed)
    'mercury': 'mercury.jpg',
    'sulfur': 'sulfur.jpg',
    'alum': 'alum.jpg',
  },

  // Location images - shown when arriving at new location or no active NPC
  locations: {
    'botica-interior': {
      dawn: 'dawnshopjoao.jpg',
      day: 'herbshop.jpg',
      evening: 'herbshop.jpg',
      night: 'herbshop.jpg',
      default: 'herbshop.jpg'
    },
    'street': {
      dawn: 'streetscenedawn.jpg',
      day: 'citybackstreet.jpg',
      evening: 'streetsceneevening.jpg',
      night: 'europeancityatnightstreetscene.jpg',
      default: 'citybackstreet.jpg'
    },
    'marketplace': {
      dawn: 'marketplacedawn.jpg',
      day: 'lamercedmarket.jpg',
      evening: 'marketplace.jpg',
      night: 'marketplace.jpg',
      default: 'lamercedmarket.jpg'
    },
    'market': {
      dawn: 'marketplacedawn.jpg',
      day: 'lamercedmarket.jpg',
      evening: 'marketplace.jpg',
      default: 'lamercedmarket.jpg'
    },
    'church': {
      day: 'churchcourtyard.jpg',
      evening: 'churchcourtyard.jpg',
      night: 'churchnight.jpg',
      default: 'churchcourtyard.jpg'
    },
    'coffeehouse': {
      day: 'coffeehouseday.jpg',
      evening: 'coffeehouseevening.jpg',
      night: 'coffeehouseevening.jpg',
      default: 'coffeehouseday.jpg'
    }
  },

  // Default environmental scenes by time of day
  environmental: {
    dawn: 'streetscenedawn.jpg',
    day: 'citybackstreet.jpg',
    evening: 'streetsceneevening.jpg',
    night: 'europeancityatnightstreetscene.jpg',
    default: 'citybackstreet.jpg'
  }
};

/**
 * Get time of day category from game time
 * @param {string} gameTime - Time string like "3:00 PM"
 * @returns {string} Time category: dawn, day, evening, night
 */
export function getTimeCategory(gameTime) {
  if (!gameTime) return 'day';

  try {
    const hourMatch = gameTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!hourMatch) return 'day';

    let hour = parseInt(hourMatch[1]);
    const period = hourMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    // Categorize time
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  } catch (error) {
    console.warn('[ViewportImages] Error parsing time:', error);
    return 'day';
  }
}

/**
 * Select viewport image based on game context
 * @param {Object} context - Game context
 * @returns {string|null} Image path or null
 */
export function selectViewportImage({
  focusedItem = null,
  location = null,
  gameTime = null,
  recentLocationChange = false
}) {
  // Priority 1: Item focus
  if (focusedItem) {
    const itemKey = focusedItem.toLowerCase().trim();
    const itemImage = VIEWPORT_IMAGES.items[itemKey];

    if (itemImage) {
      console.log(`[ViewportImages] 🖼️ Item focus: ${focusedItem} → ${itemImage}`);
      return `/portraits/${itemImage}`;
    }
  }

  // Priority 2: Location scene (when just arrived)
  if (location && recentLocationChange) {
    const timeCategory = getTimeCategory(gameTime);
    const locationKey = location.toLowerCase().replace(/\s+/g, '-');
    const locationImages = VIEWPORT_IMAGES.locations[locationKey];

    if (locationImages) {
      const sceneImage = locationImages[timeCategory] || locationImages.default;
      console.log(`[ViewportImages] 📍 Location scene: ${location} (${timeCategory}) → ${sceneImage}`);
      return `/portraits/${sceneImage}`;
    }
  }

  // Priority 3: Location ambient (no recent change)
  if (location) {
    const timeCategory = getTimeCategory(gameTime);
    const locationKey = location.toLowerCase().replace(/\s+/g, '-');
    const locationImages = VIEWPORT_IMAGES.locations[locationKey];

    if (locationImages) {
      const sceneImage = locationImages[timeCategory] || locationImages.default;
      console.log(`[ViewportImages] 🌆 Location ambient: ${location} (${timeCategory}) → ${sceneImage}`);
      return `/portraits/${sceneImage}`;
    }
  }

  // Priority 4: Environmental fallback
  const timeCategory = getTimeCategory(gameTime);
  const envImage = VIEWPORT_IMAGES.environmental[timeCategory] || VIEWPORT_IMAGES.environmental.default;
  console.log(`[ViewportImages] 🌍 Environmental fallback: ${timeCategory} → ${envImage}`);
  return `/portraits/${envImage}`;
}

export default {
  VIEWPORT_IMAGES,
  getTimeCategory,
  selectViewportImage
};
