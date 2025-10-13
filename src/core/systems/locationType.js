/**
 * Location Type System
 *
 * Universal location types for foraging across all scenarios.
 * Defines forageable properties for different environment types.
 *
 * These location types are scenario-agnostic and can be used across
 * different time periods (1680 Mexico City, 1940s NYC, 1880s London, etc.)
 *
 * Each scenario provides its own:
 * - Location name → type mappings
 * - Loot tables for each location type
 *
 * @module locationType
 */

/**
 * Universal Location Types
 * Can be used across any historical scenario
 */
export const LOCATION_TYPES = {
  // ==================== URBAN ENVIRONMENTS ====================

  'urban-street': {
    id: 'urban-street',
    name: 'City Street',
    category: 'urban',
    description: 'Paved or cobblestone streets between buildings',
    canForage: true,
    successRate: 0.40,
    energyCost: 5,
    timeCost: 15, // minutes
    averageItemCount: 1.5,
    icon: '🏛️',
    flavorText: 'You search along the street, examining cracks in pavement and corners...',
    tags: ['urban', 'common', 'low-quality']
  },

  'urban-plaza': {
    id: 'urban-plaza',
    name: 'Plaza/Market Square',
    category: 'urban',
    description: 'Open public square, often with markets or gatherings',
    canForage: true,
    successRate: 0.60,
    energyCost: 5,
    timeCost: 15,
    averageItemCount: 2,
    icon: '🏬',
    flavorText: 'You carefully examine discarded goods near market stalls and public spaces...',
    tags: ['urban', 'market', 'medium-quality']
  },

  'urban-alley': {
    id: 'urban-alley',
    name: 'Alleyway',
    category: 'urban',
    description: 'Narrow passage between buildings, often shadowy',
    canForage: true,
    successRate: 0.45,
    energyCost: 5,
    timeCost: 10,
    averageItemCount: 1,
    icon: '🌑',
    flavorText: 'You venture into the shadowy alley, searching carefully...',
    dangerLevel: 'low',
    tags: ['urban', 'hidden', 'low-quality']
  },

  'urban-waterfront': {
    id: 'urban-waterfront',
    name: 'Waterfront/Docks',
    category: 'urban',
    description: 'Harbor area with docks, warehouses, and maritime activity',
    canForage: true,
    successRate: 0.55,
    energyCost: 8,
    timeCost: 20,
    averageItemCount: 2,
    icon: '⚓',
    flavorText: 'You search along the docks, examining washed-up items and cargo debris...',
    tags: ['urban', 'waterfront', 'exotic']
  },

  'urban-industrial': {
    id: 'urban-industrial',
    name: 'Industrial Area',
    category: 'urban',
    description: 'Factories, workshops, or production facilities',
    canForage: true,
    successRate: 0.50,
    energyCost: 8,
    timeCost: 20,
    averageItemCount: 1.5,
    icon: '🏭',
    flavorText: 'You search the industrial area, looking for discarded materials...',
    dangerLevel: 'medium',
    tags: ['urban', 'industrial', 'materials']
  },

  // ==================== NATURAL ENVIRONMENTS ====================

  'forest': {
    id: 'forest',
    name: 'Forest/Woodland',
    category: 'natural',
    description: 'Dense tree coverage with undergrowth and wild plants',
    canForage: true,
    successRate: 0.85,
    energyCost: 10,
    timeCost: 30,
    averageItemCount: 3,
    icon: '🌲',
    flavorText: 'You search the forest floor, examining plants and trees carefully...',
    skillBonus: 0.1, // Future: herbalism skill adds +10%
    tags: ['natural', 'high-biodiversity', 'medicinal']
  },

  'garden': {
    id: 'garden',
    name: 'Garden',
    category: 'natural',
    description: 'Cultivated garden with herbs, flowers, and plants',
    canForage: true,
    successRate: 0.75,
    energyCost: 8,
    timeCost: 20,
    averageItemCount: 2.5,
    icon: '🌿',
    flavorText: 'You browse the garden, identifying useful plants and herbs...',
    tags: ['natural', 'cultivated', 'medicinal']
  },

  'park': {
    id: 'park',
    name: 'Public Park',
    category: 'natural',
    description: 'Manicured public green space',
    canForage: true,
    successRate: 0.65,
    energyCost: 7,
    timeCost: 20,
    averageItemCount: 2,
    icon: '🌳',
    flavorText: 'You explore the park grounds, searching for useful plants...',
    tags: ['natural', 'urban-green', 'accessible']
  },

  'field': {
    id: 'field',
    name: 'Field/Grassland',
    category: 'natural',
    description: 'Open field with wild grasses and flowers',
    canForage: true,
    successRate: 0.70,
    energyCost: 10,
    timeCost: 25,
    averageItemCount: 2,
    icon: '🌾',
    flavorText: 'You walk through the field, gathering what you find...',
    tags: ['natural', 'open', 'herbs']
  },

  'riverbank': {
    id: 'riverbank',
    name: 'Riverbank/Wetland',
    category: 'natural',
    description: 'Marshy area near water with aquatic plants',
    canForage: true,
    successRate: 0.80,
    energyCost: 10,
    timeCost: 25,
    averageItemCount: 2.5,
    icon: '💧',
    flavorText: 'You search along the water\'s edge, examining the shoreline...',
    tags: ['natural', 'aquatic', 'unique']
  },

  'wilderness': {
    id: 'wilderness',
    name: 'Wilderness/Wild Area',
    category: 'natural',
    description: 'Untamed wild land with diverse flora',
    canForage: true,
    successRate: 0.75,
    energyCost: 12,
    timeCost: 35,
    averageItemCount: 3,
    icon: '🏞️',
    flavorText: 'You venture into the wilderness, searching for rare specimens...',
    dangerLevel: 'medium',
    tags: ['natural', 'wild', 'rare']
  },

  // ==================== INTERIOR SPACES (SCROUNGING) ====================

  'interior-shop': {
    id: 'interior-shop',
    name: 'Shop Interior',
    category: 'interior',
    description: 'Scrounging through a commercial establishment',
    canForage: true,
    successRate: 0.35,
    energyCost: 6,
    timeCost: 15,
    averageItemCount: 1,
    icon: '🏪',
    flavorText: 'You discreetly search the floor and corners, looking for dropped items...',
    tags: ['interior', 'commercial', 'scrounging']
  },

  'interior-church': {
    id: 'interior-church',
    name: 'Church/Temple Interior',
    category: 'interior',
    description: 'Quietly searching a sacred space',
    canForage: true,
    successRate: 0.25,
    energyCost: 5,
    timeCost: 12,
    averageItemCount: 1,
    icon: '⛪',
    flavorText: 'You quietly search near pews and altars, careful not to disturb the sanctity...',
    tags: ['interior', 'sacred', 'scrounging']
  },

  'interior-home': {
    id: 'interior-home',
    name: 'Home Interior',
    category: 'interior',
    description: 'Searching through drawers and cabinets',
    canForage: true,
    successRate: 0.50,
    energyCost: 4,
    timeCost: 10,
    averageItemCount: 1.5,
    icon: '🏠',
    flavorText: 'You rifle through drawers, check under furniture, and search cabinets...',
    tags: ['interior', 'residential', 'scrounging']
  },

  'interior-palace': {
    id: 'interior-palace',
    name: 'Palace/Government Building',
    category: 'interior',
    description: 'Carefully searching without attracting attention',
    canForage: true,
    successRate: 0.20,
    energyCost: 8,
    timeCost: 18,
    averageItemCount: 1,
    icon: '👑',
    flavorText: 'You nervously search corners and alcoves, wary of guards...',
    dangerLevel: 'high',
    tags: ['interior', 'government', 'dangerous', 'scrounging']
  },

  'interior-hospital': {
    id: 'interior-hospital',
    name: 'Hospital/Infirmary',
    category: 'interior',
    description: 'Scrounging through a medical facility',
    canForage: true,
    successRate: 0.40,
    energyCost: 6,
    timeCost: 15,
    averageItemCount: 1.5,
    icon: '🏥',
    flavorText: 'You search treatment rooms and storage areas for discarded medical supplies...',
    tags: ['interior', 'medical', 'scrounging']
  },

  'interior-tavern': {
    id: 'interior-tavern',
    name: 'Tavern/Inn',
    category: 'interior',
    description: 'Searching a drinking establishment',
    canForage: true,
    successRate: 0.45,
    energyCost: 5,
    timeCost: 12,
    averageItemCount: 1.5,
    icon: '🍺',
    flavorText: 'You search under tables and behind barrels for dropped coins and items...',
    tags: ['interior', 'social', 'scrounging']
  }
};

/**
 * Generic keyword mapping for fuzzy location matching
 * Used when exact location name isn't found in scenario mapping
 */
export const GENERIC_LOCATION_KEYWORDS = {
  // Urban keywords
  'street': 'urban-street',
  'road': 'urban-street',
  'avenue': 'urban-street',
  'boulevard': 'urban-street',
  'calle': 'urban-street',

  'plaza': 'urban-plaza',
  'square': 'urban-plaza',
  'market': 'urban-plaza',
  'marketplace': 'urban-plaza',
  'mercado': 'urban-plaza',

  'alley': 'urban-alley',
  'alleyway': 'urban-alley',
  'back street': 'urban-alley',
  'callejón': 'urban-alley',

  'docks': 'urban-waterfront',
  'harbor': 'urban-waterfront',
  'harbour': 'urban-waterfront',
  'port': 'urban-waterfront',
  'waterfront': 'urban-waterfront',
  'wharf': 'urban-waterfront',

  'factory': 'urban-industrial',
  'workshop': 'urban-industrial',
  'mill': 'urban-industrial',
  'foundry': 'urban-industrial',

  // Natural keywords
  'forest': 'forest',
  'woods': 'forest',
  'woodland': 'forest',
  'grove': 'forest',
  'copse': 'forest',

  'garden': 'garden',
  'botanical': 'garden',
  'orchard': 'garden',
  'jardin': 'garden',

  'park': 'park',
  'commons': 'park',
  'green': 'park',

  'field': 'field',
  'meadow': 'field',
  'grassland': 'field',
  'prairie': 'field',
  'campo': 'field',

  'river': 'riverbank',
  'creek': 'riverbank',
  'stream': 'riverbank',
  'lake': 'riverbank',
  'pond': 'riverbank',
  'wetland': 'riverbank',
  'marsh': 'riverbank',
  'swamp': 'riverbank',

  'wilderness': 'wilderness',
  'wild': 'wilderness',
  'outskirts': 'wilderness',

  // Interior keywords
  'shop': 'interior-shop',
  'store': 'interior-shop',
  'boutique': 'interior-shop',
  'tienda': 'interior-shop',
  'botica': 'interior-shop',
  'apothecary': 'interior-shop',

  'church': 'interior-church',
  'cathedral': 'interior-church',
  'chapel': 'interior-church',
  'temple': 'interior-church',
  'synagogue': 'interior-church',
  'mosque': 'interior-church',

  'home': 'interior-home',
  'house': 'interior-home',
  'residence': 'interior-home',
  'apartment': 'interior-home',
  'dwelling': 'interior-home',

  'palace': 'interior-palace',
  'castle': 'interior-palace',
  'government': 'interior-palace',
  'courthouse': 'interior-palace',
  'town hall': 'interior-palace',

  'hospital': 'interior-hospital',
  'infirmary': 'interior-hospital',
  'clinic': 'interior-hospital',
  'sanatorium': 'interior-hospital',

  'tavern': 'interior-tavern',
  'inn': 'interior-tavern',
  'pub': 'interior-tavern',
  'bar': 'interior-tavern',
  'saloon': 'interior-tavern'
};

/**
 * Get location type for a given location string
 *
 * Priority order:
 * 1. Scenario-specific location mapping (passed as parameter)
 * 2. Generic keyword matching
 * 3. Default fallback (urban-street)
 *
 * @param {string} locationName - Current game location
 * @param {Object} scenarioLocationMap - Scenario-specific location → type mapping
 * @returns {Object} Location type config
 */
export function getLocationForageType(locationName, scenarioLocationMap = {}) {
  if (!locationName) {
    console.warn('[LocationType] No location name provided, defaulting to urban-street');
    return LOCATION_TYPES['urban-street'];
  }

  // 1. Check scenario-specific mapping first (exact match)
  if (scenarioLocationMap[locationName]) {
    const typeId = scenarioLocationMap[locationName];
    const locationType = LOCATION_TYPES[typeId];

    if (locationType) {
      console.log(`[LocationType] Found scenario mapping: "${locationName}" → ${typeId}`);
      return locationType;
    } else {
      console.warn(`[LocationType] Invalid type ID in scenario mapping: ${typeId}`);
    }
  }

  // 2. Try fuzzy matching with generic keywords
  const lowerName = locationName.toLowerCase();

  for (const [keyword, typeId] of Object.entries(GENERIC_LOCATION_KEYWORDS)) {
    if (lowerName.includes(keyword.toLowerCase())) {
      const locationType = LOCATION_TYPES[typeId];
      console.log(`[LocationType] Fuzzy match: "${locationName}" contains "${keyword}" → ${typeId}`);
      return locationType;
    }
  }

  // 3. Default fallback
  console.warn(`[LocationType] No forage type found for "${locationName}", defaulting to urban-street`);
  return LOCATION_TYPES['urban-street'];
}

/**
 * Get all forageable locations
 * @returns {Array} List of forageable location types
 */
export function getForageableLocations() {
  return Object.values(LOCATION_TYPES).filter(type => type.canForage);
}

/**
 * Get all location types by category
 * @param {string} category - 'urban', 'natural', or 'interior'
 * @returns {Array} List of location types in category
 */
export function getLocationTypesByCategory(category) {
  return Object.values(LOCATION_TYPES).filter(type => type.category === category);
}

/**
 * Validate location type ID
 * @param {string} typeId - Location type ID to validate
 * @returns {boolean} True if valid
 */
export function isValidLocationType(typeId) {
  return typeId in LOCATION_TYPES;
}

export default {
  LOCATION_TYPES,
  GENERIC_LOCATION_KEYWORDS,
  getLocationForageType,
  getForageableLocations,
  getLocationTypesByCategory,
  isValidLocationType
};
