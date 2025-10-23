/**
 * City Location Registry
 * Phase 3B: Maps location names to exterior map coordinates
 *
 * Used for house call pathfinding - converts location strings
 * (like "Doña Elvira's residence") to map coordinates for travel animation
 */

/**
 * Calculates the center point of a polygon
 * @param {Array<[number, number]>} polygon - Array of [x, y] coordinate pairs
 * @returns {[number, number]} Center point [x, y]
 */
function polygonCenter(polygon) {
  const sumX = polygon.reduce((sum, point) => sum + point[0], 0);
  const sumY = polygon.reduce((sum, point) => sum + point[1], 0);
  return [sumX / polygon.length, sumY / polygon.length];
}

/**
 * Landmark Coordinates Registry
 * Based on src/scenarios/1680-mexico-city/maps/mexicoCityCenter.js
 *
 * Format: { name, coordinates: [x, y], type, description }
 */
export const CITY_LOCATIONS = {
  // ===== PLAYER'S LOCATION (STARTING POINT) =====
  'botica-de-la-amargura': {
    name: 'Botica de la Amargura',
    coordinates: [1350, 917], // Center of polygon [[1340, 910], [1360, 910], [1360, 925], [1340, 925]]
    type: 'apothecary',
    description: "Maria de Lima's apothecary shop"
  },

  // ===== MAJOR LANDMARKS =====
  'plaza-mayor': {
    name: 'Plaza Mayor',
    coordinates: [900, 670],
    type: 'plaza',
    description: 'Central plaza, heart of colonial power'
  },

  'catedral': {
    name: 'Catedral Metropolitana',
    coordinates: [745, 670],
    type: 'church',
    description: 'Metropolitan Cathedral'
  },

  'palacio-virreinal': {
    name: 'Palacio Virreinal',
    coordinates: [1055, 670],
    type: 'government',
    description: 'Viceregal Palace'
  },

  'ayuntamiento': {
    name: 'Ayuntamiento',
    coordinates: [900, 795],
    type: 'government',
    description: 'City council building'
  },

  // ===== CHURCHES & MONASTERIES =====
  'santo-domingo': {
    name: 'Iglesia de Santo Domingo',
    coordinates: [450, 165],
    type: 'church',
    description: 'Dominican church and monastery'
  },

  'san-francisco': {
    name: 'Iglesia de San Francisco',
    coordinates: [450, 950],
    type: 'church',
    description: 'Franciscan church'
  },

  'hospital-san-hipolito': {
    name: 'Hospital de San Hipólito',
    coordinates: [250, 950],
    type: 'hospital',
    description: 'Hospital for the mentally ill'
  },

  // ===== MARKETS =====
  'el-parian': {
    name: 'El Parián',
    coordinates: [900, 670],
    type: 'market',
    description: 'Central covered market'
  },

  // ===== RESIDENTIAL DISTRICTS =====

  // Spanish Quarter (wealthy criollos and peninsulares)
  'spanish-quarter-north': {
    name: 'Spanish Quarter (North)',
    coordinates: [900, 250],
    type: 'residential',
    description: 'Wealthy Spanish residences near Plaza Mayor'
  },

  'spanish-quarter-east': {
    name: 'Spanish Quarter (East)',
    coordinates: [1400, 670],
    type: 'residential',
    description: 'Wealthy Spanish residences east of Plaza'
  },

  // Traza (mixed Spanish/criollo area)
  'traza-west': {
    name: 'La Traza (West)',
    coordinates: [400, 670],
    type: 'residential',
    description: 'Mixed Spanish and criollo neighborhood'
  },

  'traza-south': {
    name: 'La Traza (South)',
    coordinates: [900, 1100],
    type: 'residential',
    description: 'Mixed neighborhood south of Plaza'
  },

  // Indigenous Quarter
  'barrio-santiago': {
    name: 'Barrio de Santiago',
    coordinates: [200, 500],
    type: 'residential',
    description: 'Indigenous neighborhood (Santiago Tlatelolco)'
  },

  // ===== GENERIC LOCATION TYPES =====
  // Used when LLM provides vague locations

  'hacienda-outside-walls': {
    name: 'Hacienda Outside City Walls',
    coordinates: [1650, 200],
    type: 'residential',
    description: 'Wealthy estate outside city limits'
  },

  'merchant-district': {
    name: 'Merchant District',
    coordinates: [720, 830],
    type: 'commercial',
    description: 'Area near Plaza with shops and merchant houses'
  },

  'artisan-quarter': {
    name: 'Artisan Quarter',
    coordinates: [350, 1100],
    type: 'commercial',
    description: 'Neighborhood of craftsmen and workshops'
  },

  'canal-district': {
    name: 'Canal District',
    coordinates: [1200, 1200],
    type: 'residential',
    description: 'Neighborhood along the acequias (canals)'
  },

  // ===== SPECIFIC BUILDING TYPES (for matching) =====
  'noble-residence': {
    name: 'Noble Residence',
    coordinates: [1400, 400],
    type: 'residential',
    description: 'Wealthy noble household'
  },

  'merchant-house': {
    name: 'Merchant House',
    coordinates: [800, 900],
    type: 'residential',
    description: 'Prosperous merchant residence'
  },

  'modest-dwelling': {
    name: 'Modest Dwelling',
    coordinates: [600, 1100],
    type: 'residential',
    description: 'Humble residence in artisan quarter'
  },

  'convent-san-jeronimo': {
    name: 'Convento de San Jerónimo',
    coordinates: [1500, 1100],
    type: 'monastery',
    description: 'Convent of nuns (Sor Juana Inés de la Cruz)'
  }
};

/**
 * Fuzzy match location string to registry key
 * Handles variations like "Don Rodrigo's residence" → 'noble-residence'
 *
 * @param {string} locationString - Location from StateAgent (e.g., "Doña Elvira's residence")
 * @returns {string|null} Registry key or null if no match
 */
export function matchLocation(locationString) {
  if (!locationString || typeof locationString !== 'string') {
    console.warn('[cityLocations] Invalid location string:', locationString);
    return null;
  }

  const lower = locationString.toLowerCase();

  // Exact match (case-insensitive key lookup)
  const exactMatch = Object.keys(CITY_LOCATIONS).find(
    key => key.toLowerCase() === lower.replace(/\s+/g, '-')
  );
  if (exactMatch) return exactMatch;

  // Pattern matching

  // Churches
  if (lower.includes('catedral') || lower.includes('cathedral')) return 'catedral';
  if (lower.includes('santo domingo')) return 'santo-domingo';
  if (lower.includes('san francisco')) return 'san-francisco';
  if (lower.includes('san hipólito') || lower.includes('san hipolito')) return 'hospital-san-hipolito';
  if (lower.includes('san jerónimo') || lower.includes('san jeronimo')) return 'convent-san-jeronimo';

  // Government
  if (lower.includes('palacio') && (lower.includes('virrey') || lower.includes('viceroy'))) return 'palacio-virreinal';
  if (lower.includes('ayuntamiento') || lower.includes('cabildo')) return 'ayuntamiento';

  // Markets
  if (lower.includes('parián') || lower.includes('parian')) return 'el-parian';
  if (lower.includes('mercado') || lower.includes('market')) return 'merchant-district';

  // Residential - by class/type
  if (lower.includes('hacienda')) return 'hacienda-outside-walls';

  if (lower.includes('noble') || lower.includes('don ') || lower.includes('doña ') ||
      lower.includes('conde') || lower.includes('marqués') || lower.includes('marquesa')) {
    return 'noble-residence';
  }

  if (lower.includes('merchant') || lower.includes('comerciante') || lower.includes('mercader')) {
    return 'merchant-house';
  }

  if (lower.includes('artisan') || lower.includes('craftsman') || lower.includes('artesano') ||
      lower.includes('cobbler') || lower.includes('seamstress')) {
    return 'artisan-quarter';
  }

  // Generic "residence" patterns
  if (lower.includes('residence') || lower.includes('home') || lower.includes('casa') ||
      lower.includes('dwelling') || lower.includes('house')) {

    // Check for wealth indicators
    if (lower.includes('wealthy') || lower.includes('rich') || lower.includes('prosperous')) {
      return 'spanish-quarter-east';
    }

    if (lower.includes('modest') || lower.includes('humble') || lower.includes('poor')) {
      return 'modest-dwelling';
    }

    // Default to merchant house (middle class)
    return 'merchant-house';
  }

  // Districts
  if (lower.includes('spanish quarter') || lower.includes('barrio español')) {
    return lower.includes('north') ? 'spanish-quarter-north' : 'spanish-quarter-east';
  }

  if (lower.includes('santiago') || lower.includes('tlatelolco')) return 'barrio-santiago';
  if (lower.includes('traza')) return lower.includes('west') ? 'traza-west' : 'traza-south';
  if (lower.includes('canal') || lower.includes('acequia')) return 'canal-district';

  // No match found
  console.warn('[cityLocations] Could not match location string:', locationString);
  return null;
}

/**
 * Get coordinates for a location string
 *
 * @param {string} locationString - Location from StateAgent
 * @returns {[number, number]|null} Coordinates [x, y] or null if not found
 */
export function getLocationCoordinates(locationString) {
  const key = matchLocation(locationString);
  if (!key) return null;

  const location = CITY_LOCATIONS[key];
  return location ? location.coordinates : null;
}

/**
 * Get full location data for a location string
 *
 * @param {string} locationString - Location from StateAgent
 * @returns {Object|null} Location data or null if not found
 */
export function getLocationData(locationString) {
  const key = matchLocation(locationString);
  if (!key) return null;

  return CITY_LOCATIONS[key];
}
