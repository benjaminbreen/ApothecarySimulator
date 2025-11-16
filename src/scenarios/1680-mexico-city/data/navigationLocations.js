/**
 * Navigation Locations Registry
 * Complete database of navigable destinations in 1680 Mexico City
 *
 * Used for location-based navigation commands like:
 * - "go to plaza mayor"
 * - "walk to the cathedral"
 * - "visit the zocalo"
 *
 * Each location includes:
 * - id: Unique identifier
 * - name: Canonical display name
 * - aliases: Array of alternative names for fuzzy matching
 * - coordinates: { x, y } position on mexico-city-center map
 * - type: Location category (plaza, church, market, etc.)
 * - description: Narrative text for arrival messages
 */

export const NAVIGATION_LOCATIONS = [
  // ===== MAJOR PLAZAS =====
  {
    id: 'plaza-mayor',
    name: 'Plaza Mayor',
    aliases: [
      'plaza mayor', 'zocalo', 'zócalo', 'plaza de armas',
      'main square', 'central plaza', 'grand plaza', 'plaza'
    ],
    coordinates: { x: 900, y: 670 },
    type: 'plaza',
    description: 'The grand central plaza of Mexico City, heart of colonial power and commerce'
  },
  {
    id: 'plaza-santo-domingo',
    name: 'Plaza de Santo Domingo',
    aliases: [
      'santo domingo', 'plaza santo domingo', 'santo domingo plaza',
      'plaza de santo domingo', 'dominican plaza'
    ],
    coordinates: { x: 450, y: 295 },
    type: 'plaza',
    description: 'A bustling plaza near the Dominican monastery, known for scribes and printers'
  },
  {
    id: 'la-alameda',
    name: 'La Alameda',
    aliases: [
      'alameda', 'la alameda', 'alameda park', 'la alameda park',
      'park', 'poplar grove'
    ],
    coordinates: { x: 70, y: 1305 },
    type: 'plaza',
    description: 'A tree-lined park on the western edge of the city, popular for evening strolls'
  },

  // ===== RELIGIOUS BUILDINGS =====
  {
    id: 'cathedral',
    name: 'Catedral Metropolitana',
    aliases: [
      'cathedral', 'catedral', 'catedral metropolitana',
      'metropolitan cathedral', 'main cathedral', 'the cathedral'
    ],
    coordinates: { x: 900, y: 525 },
    type: 'church',
    description: 'The grand Metropolitan Cathedral dominating the north side of Plaza Mayor'
  },
  {
    id: 'santo-domingo-church',
    name: 'Iglesia de Santo Domingo',
    aliases: [
      'santo domingo church', 'church of santo domingo', 'iglesia de santo domingo',
      'dominican church', 'church santo domingo', 'santo domingo monastery'
    ],
    coordinates: { x: 450, y: 165 },
    type: 'church',
    description: 'The imposing Dominican monastery and church in the northern district'
  },
  {
    id: 'san-francisco',
    name: 'Iglesia de San Francisco',
    aliases: [
      'san francisco', 'church of san francisco', 'iglesia de san francisco',
      'franciscan church', 'church san francisco', 'san francisco monastery'
    ],
    coordinates: { x: 450, y: 950 },
    type: 'church',
    description: 'The Franciscan church and monastery on the western side of the city'
  },
  {
    id: 'hospital-san-hipolito',
    name: 'Hospital de San Hipólito',
    aliases: [
      'san hipolito', 'san hipólito', 'hospital san hipolito',
      'hospital de san hipólito', 'hospital', 'asylum', 'madhouse'
    ],
    coordinates: { x: 250, y: 950 },
    type: 'hospital',
    description: 'The Hospital de San Hipólito, caring for the mentally ill and infirm'
  },
  {
    id: 'convent-san-jeronimo',
    name: 'Convento de San Jerónimo',
    aliases: [
      'san jeronimo', 'san jerónimo', 'convent', 'convento de san jerónimo',
      'convent san jeronimo', 'sor juana', 'nunnery'
    ],
    coordinates: { x: 1500, y: 1100 },
    type: 'church',
    description: 'The Convent of San Jerónimo, home to scholarly nuns including Sor Juana Inés de la Cruz'
  },

  // ===== GOVERNMENT BUILDINGS =====
  {
    id: 'palacio-virreinal',
    name: 'Palacio Virreinal',
    aliases: [
      'palace', 'palacio', 'viceregal palace', 'palacio virreinal',
      'viceroy palace', 'viceroy', 'viceroys palace'
    ],
    coordinates: { x: 1055, y: 670 },
    type: 'government',
    description: "The Viceroy's grand palace on the eastern side of Plaza Mayor"
  },
  {
    id: 'ayuntamiento',
    name: 'Ayuntamiento',
    aliases: [
      'ayuntamiento', 'town hall', 'city hall', 'cabildo',
      'city council', 'municipal building'
    ],
    coordinates: { x: 900, y: 795 },
    type: 'government',
    description: 'The city council building on the southern edge of Plaza Mayor'
  },

  // ===== MARKETS & COMMERCE =====
  {
    id: 'el-parian',
    name: 'El Parián',
    aliases: [
      'parian', 'parián', 'el parian', 'el parián',
      'covered market', 'silk market', 'luxury market'
    ],
    coordinates: { x: 900, y: 670 },
    type: 'market',
    description: 'The covered market in Plaza Mayor, famous for silks and luxury goods from the Orient'
  },
  {
    id: 'merchant-district',
    name: 'Merchant District',
    aliases: [
      'merchant district', 'merchants quarter', 'market district',
      'market area', 'merchant quarter', 'shops'
    ],
    coordinates: { x: 720, y: 830 },
    type: 'market',
    description: 'The bustling merchant district south of Plaza Mayor, filled with shops and market stalls'
  },

  // ===== MAJOR STREETS (Notable Intersections) =====
  {
    id: 'calle-plateros',
    name: 'Calle de Plateros',
    aliases: [
      'plateros', 'calle plateros', 'calle de plateros',
      'goldsmiths street', 'silversmiths street', 'street of silversmiths'
    ],
    coordinates: { x: 720, y: 490 },
    type: 'street',
    description: 'The Street of Silversmiths, lined with workshops of master craftsmen'
  },
  {
    id: 'calle-tacuba',
    name: 'Calle de Tacuba',
    aliases: [
      'tacuba', 'calle tacuba', 'calle de tacuba',
      'tacuba street'
    ],
    coordinates: { x: 900, y: 300 },
    type: 'street',
    description: 'The broad Calle de Tacuba, one of the main thoroughfares running west from Plaza Mayor'
  },
  {
    id: 'calle-san-francisco',
    name: 'Calle de San Francisco',
    aliases: [
      'calle san francisco', 'calle de san francisco',
      'san francisco street'
    ],
    coordinates: { x: 150, y: 675 },
    type: 'street',
    description: 'The western street leading to the Franciscan monastery'
  },
  {
    id: 'calle-santo-domingo',
    name: 'Calle Santo Domingo',
    aliases: [
      'calle santo domingo', 'santo domingo street'
    ],
    coordinates: { x: 350, y: 675 },
    type: 'street',
    description: 'The street running past the Dominican monastery'
  },
  {
    id: 'calle-moneda',
    name: 'Calle de la Moneda',
    aliases: [
      'moneda', 'calle moneda', 'calle de la moneda',
      'mint street', 'street of the mint'
    ],
    coordinates: { x: 1280, y: 675 },
    type: 'street',
    description: 'The street near the royal mint on the eastern side'
  },
  {
    id: 'calle-amargura',
    name: 'Calle de la Amargura',
    aliases: [
      'amargura', 'calle amargura', 'calle de la amargura',
      'street of bitterness'
    ],
    coordinates: { x: 1425, y: 1200 },
    type: 'street',
    description: 'The Street of Bitterness in the southeastern district, where your apothecary stands'
  },

  // ===== RESIDENTIAL DISTRICTS =====
  {
    id: 'barrio-san-juan',
    name: 'San Juan Moyotlan',
    aliases: [
      'san juan', 'san juan moyotlan', 'barrio san juan',
      'indigenous quarter', 'indian quarter', 'barrio de san juan'
    ],
    coordinates: { x: 280, y: 675 },
    type: 'district',
    description: 'The indigenous quarter of San Juan Moyotlan on the western side'
  },
  {
    id: 'barrio-santiago',
    name: 'Barrio de Santiago',
    aliases: [
      'santiago', 'barrio santiago', 'barrio de santiago',
      'santiago tlatelolco', 'tlatelolco'
    ],
    coordinates: { x: 200, y: 500 },
    type: 'district',
    description: 'The indigenous neighborhood of Santiago Tlatelolco to the northwest'
  },
  {
    id: 'spanish-quarter-north',
    name: 'Spanish Quarter (North)',
    aliases: [
      'spanish quarter north', 'northern spanish quarter',
      'north spanish district', 'wealthy quarter north'
    ],
    coordinates: { x: 900, y: 250 },
    type: 'district',
    description: 'The wealthy Spanish residential district north of Plaza Mayor'
  },
  {
    id: 'spanish-quarter-east',
    name: 'Spanish Quarter (East)',
    aliases: [
      'spanish quarter east', 'eastern spanish quarter',
      'east spanish district', 'wealthy quarter east'
    ],
    coordinates: { x: 1400, y: 670 },
    type: 'district',
    description: 'The prosperous Spanish residential district east of the plaza'
  },
  {
    id: 'traza-west',
    name: 'La Traza (West)',
    aliases: [
      'traza west', 'western traza', 'la traza west',
      'traza occidental'
    ],
    coordinates: { x: 400, y: 670 },
    type: 'district',
    description: 'The western Traza, a mixed neighborhood of Spanish and criollo residents'
  },
  {
    id: 'traza-south',
    name: 'La Traza (South)',
    aliases: [
      'traza south', 'southern traza', 'la traza south',
      'traza meridional'
    ],
    coordinates: { x: 900, y: 1100 },
    type: 'district',
    description: 'The southern Traza district, home to merchants and artisans'
  },
  {
    id: 'artisan-quarter',
    name: 'Artisan Quarter',
    aliases: [
      'artisan quarter', 'artisan district', 'craftsmen quarter',
      'artesanos', 'workshops'
    ],
    coordinates: { x: 350, y: 1100 },
    type: 'district',
    description: 'The neighborhood of craftsmen, workshops, and artisan studios'
  },
  {
    id: 'canal-district',
    name: 'Canal District',
    aliases: [
      'canal district', 'canals', 'acequia district',
      'waterways', 'canal quarter'
    ],
    coordinates: { x: 1200, y: 1200 },
    type: 'district',
    description: 'The neighborhood along the acequias (canals) in the southeastern part of the city'
  },

  // ===== SPECIFIC NOTABLE LOCATIONS =====
  {
    id: 'botica-de-la-amargura',
    name: 'Botica de la Amargura',
    aliases: [
      'botica', 'my shop', 'my apothecary', 'apothecary',
      'botica de la amargura', 'home', 'my botica'
    ],
    coordinates: { x: 1350, y: 917 },
    type: 'shop',
    description: 'Your apothecary shop on Calle de la Amargura'
  },
  {
    id: 'hacienda-outside-walls',
    name: 'Hacienda Outside City Walls',
    aliases: [
      'hacienda', 'estate', 'hacienda outside walls',
      'country estate', 'rural hacienda'
    ],
    coordinates: { x: 1650, y: 200 },
    type: 'estate',
    description: 'A wealthy hacienda estate beyond the city walls to the northeast'
  },

  // ===== GENERIC DESTINATION TYPES =====
  // These serve as fallback destinations when LLM provides vague locations
  {
    id: 'noble-residence',
    name: 'Noble Residence',
    aliases: [
      'noble residence', 'noble house', 'nobles house',
      'aristocrat residence', 'wealthy home'
    ],
    coordinates: { x: 1400, y: 400 },
    type: 'residential',
    description: 'A grand residence of the Spanish nobility'
  },
  {
    id: 'merchant-house',
    name: 'Merchant House',
    aliases: [
      'merchant house', 'merchants house', 'merchant residence',
      'prosperous house', 'middle class home'
    ],
    coordinates: { x: 800, y: 900 },
    type: 'residential',
    description: 'A prosperous merchant household'
  },
  {
    id: 'modest-dwelling',
    name: 'Modest Dwelling',
    aliases: [
      'modest dwelling', 'humble home', 'poor dwelling',
      'simple house', 'modest home'
    ],
    coordinates: { x: 600, y: 1100 },
    type: 'residential',
    description: 'A humble dwelling in the artisan quarter'
  }
];

/**
 * Match user input to a navigation location
 * Uses exact matching, alias matching, and fuzzy substring matching
 *
 * @param {string} locationString - User's location query
 * @returns {Object|null} Matched location object or null
 */
export function matchNavigationLocation(locationString) {
  if (!locationString || typeof locationString !== 'string') {
    console.warn('[navigationLocations] Invalid location string:', locationString);
    return null;
  }

  const query = locationString.toLowerCase().trim();

  // 1. Exact match on canonical name (case-insensitive)
  const exactMatch = NAVIGATION_LOCATIONS.find(loc =>
    loc.name.toLowerCase() === query
  );
  if (exactMatch) {
    console.log('[navigationLocations] Exact match found:', exactMatch.name);
    return exactMatch;
  }

  // 2. Exact match on any alias
  const aliasMatch = NAVIGATION_LOCATIONS.find(loc =>
    loc.aliases.some(alias => alias.toLowerCase() === query)
  );
  if (aliasMatch) {
    console.log('[navigationLocations] Alias match found:', aliasMatch.name);
    return aliasMatch;
  }

  // 3. Fuzzy match - location name contains query
  const fuzzyNameMatch = NAVIGATION_LOCATIONS.find(loc =>
    loc.name.toLowerCase().includes(query)
  );
  if (fuzzyNameMatch) {
    console.log('[navigationLocations] Fuzzy name match found:', fuzzyNameMatch.name);
    return fuzzyNameMatch;
  }

  // 4. Fuzzy match - any alias contains query
  const fuzzyAliasMatch = NAVIGATION_LOCATIONS.find(loc =>
    loc.aliases.some(alias => alias.toLowerCase().includes(query))
  );
  if (fuzzyAliasMatch) {
    console.log('[navigationLocations] Fuzzy alias match found:', fuzzyAliasMatch.name);
    return fuzzyAliasMatch;
  }

  // 5. Reverse fuzzy match - query contains location name or alias
  const reverseMatch = NAVIGATION_LOCATIONS.find(loc => {
    const nameInQuery = query.includes(loc.name.toLowerCase());
    const aliasInQuery = loc.aliases.some(alias => query.includes(alias.toLowerCase()));
    return nameInQuery || aliasInQuery;
  });
  if (reverseMatch) {
    console.log('[navigationLocations] Reverse fuzzy match found:', reverseMatch.name);
    return reverseMatch;
  }

  console.warn('[navigationLocations] No match found for:', locationString);
  return null;
}

/**
 * Get suggested locations based on partial match
 * Returns up to 5 location names that partially match the query
 *
 * @param {string} query - User's partial input
 * @returns {Array<string>} Suggested location names
 */
export function getSuggestedLocations(query) {
  if (!query || typeof query !== 'string') {
    return ['Plaza Mayor', 'Catedral Metropolitana', 'La Alameda'];
  }

  const q = query.toLowerCase();

  const suggestions = NAVIGATION_LOCATIONS
    .filter(loc => {
      const nameMatch = loc.name.toLowerCase().includes(q);
      const aliasMatch = loc.aliases.some(alias =>
        alias.toLowerCase().includes(q)
      );
      return nameMatch || aliasMatch;
    })
    .slice(0, 5)
    .map(loc => loc.name);

  return suggestions.length > 0
    ? suggestions
    : ['Plaza Mayor', 'Catedral Metropolitana', 'La Alameda', 'Botica de la Amargura'];
}

/**
 * Get all locations of a specific type
 *
 * @param {string} type - Location type (plaza, church, market, etc.)
 * @returns {Array<Object>} Array of locations matching the type
 */
export function getLocationsByType(type) {
  return NAVIGATION_LOCATIONS.filter(loc => loc.type === type);
}

/**
 * Get location by ID
 *
 * @param {string} id - Location ID
 * @returns {Object|null} Location object or null
 */
export function getLocationById(id) {
  return NAVIGATION_LOCATIONS.find(loc => loc.id === id) || null;
}

export default {
  NAVIGATION_LOCATIONS,
  matchNavigationLocation,
  getSuggestedLocations,
  getLocationsByType,
  getLocationById
};
