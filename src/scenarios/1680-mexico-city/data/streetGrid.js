/**
 * Historical Street Grid for Mexico City 1680
 * Based on actual 17th century map coordinates from mexicoCityCenter.js
 *
 * This file maps x/y coordinates to historically accurate street names
 * for use in the movement/navigation system.
 *
 * Map bounds: 1800 x 1350 pixels
 * Scale: 1.5 pixels per meter (1:0.67 scale)
 */

// ===== NORTH-SOUTH STREETS (Vertical) =====
// These run the full height of the map (y: 0 to 1350)
export const NORTH_SOUTH_STREETS = [
  {
    id: 'calle-san-jose-real',
    name: 'Calle de San José el Real',
    x: 150,
    tolerance: 30, // How far from centerline to consider "on this street"
    priority: 4
  },
  {
    id: 'calle-santo-domingo',
    name: 'Calle Santo Domingo',
    x: 350,
    tolerance: 30,
    priority: 4
  },
  {
    id: 'calle-santa-teresa',
    name: 'Calle de Santa Teresa la Antigua',
    x: 550,
    tolerance: 30,
    priority: 5
  },
  {
    id: 'calle-la-palma',
    name: 'Calle de la Palma',
    x: 720,
    tolerance: 30,
    priority: 3
  },
  {
    id: 'calle-jesus-maria',
    name: 'Calle de Jesús María',
    x: 1080,
    tolerance: 30,
    priority: 3
  },
  {
    id: 'calle-moneda',
    name: 'Calle de la Moneda',
    x: 1280,
    tolerance: 25,
    priority: 6
  },
  {
    id: 'calle-jesus',
    name: 'Calle de Jesús',
    x: 1480,
    tolerance: 25,
    priority: 6
  }
];

// ===== EAST-WEST STREETS (Horizontal) =====
// These run the full width of the map (x: 0 to 1800)
export const EAST_WEST_STREETS = [
  {
    id: 'calle-norte',
    name: 'Calle del Norte',
    y: 100,
    tolerance: 25,
    priority: 7
  },
  {
    id: 'calle-tacuba',
    name: 'Calle de Tacuba',
    y: 300,
    tolerance: 35,
    priority: 4
  },
  {
    id: 'calle-plateros-ew',
    name: 'Calle de los Plateros',
    y: 490,
    tolerance: 30,
    priority: 4
  },
  {
    id: 'calle-empedradillo',
    name: 'Calle del Empedradillo',
    y: 590,
    tolerance: 20,
    xMin: 780,
    xMax: 1040,
    priority: 3
  },
  {
    id: 'calle-san-francisco',
    name: 'Calle de San Francisco',
    y: 770,
    tolerance: 25,
    xMin: 600,
    xMax: 1200,
    priority: 3
  },
  {
    id: 'calle-diputacion',
    name: 'Calle de la Diputación',
    y: 830,
    tolerance: 30,
    priority: 4
  },
  {
    id: 'calle-arzobispos',
    name: 'Calle de los Arzobispos',
    y: 1020,
    tolerance: 30,
    priority: 4
  },
  {
    id: 'calle-amargura',
    name: 'Calle de la Amargura',
    y: 1200,
    tolerance: 25,
    xMin: 1100, // Partial street (doesn't span full width)
    xMax: 1750,
    priority: 5
  },
  {
    id: 'calle-sur',
    name: 'Calle del Sur',
    y: 1250,
    tolerance: 25,
    priority: 7
  }
];

// ===== SPECIAL LOCATIONS =====
// Areas that override street names (plazas, major buildings)
export const SPECIAL_LOCATIONS = [
  {
    id: 'plaza-mayor',
    name: 'Plaza Mayor',
    bounds: { xMin: 840, xMax: 960, yMin: 610, yMax: 730 },
    priority: 1
  },
  {
    id: 'cathedral',
    name: 'Catedral Metropolitana',
    bounds: { xMin: 830, xMax: 950, yMin: 470, yMax: 570 },
    priority: 2,
    includeInDescription: true
  },
  {
    id: 'palacio-virreinal',
    name: 'Palacio Virreinal',
    bounds: { xMin: 973, xMax: 1030, yMin: 615, yMax: 703 },
    priority: 2,
    includeInDescription: true
  },
  {
    id: 'ayuntamiento',
    name: 'Ayuntamiento',
    bounds: { xMin: 850, xMax: 990, yMin: 775, yMax: 820 },
    priority: 3,
    includeInDescription: true
  },
  {
    id: 'consulado',
    name: 'El Consulado',
    bounds: { xMin: 1060, xMax: 1120, yMin: 615, yMax: 703 },
    priority: 3,
    includeInDescription: true
  },
  {
    id: 'santo-domingo-plaza',
    name: 'Plaza de Santo Domingo',
    bounds: { xMin: 360, xMax: 540, yMin: 110, yMax: 480 },
    priority: 3,
    includeInDescription: true
  },
  {
    id: 'la-alameda',
    name: 'La Alameda',
    bounds: { xMin: 0, xMax: 140, yMin: 1260, yMax: 1350 },
    priority: 4,
    includeInDescription: true
  }
];

// ===== BARRIOS (Districts) =====
// Background context for location descriptions
export const BARRIOS = [
  {
    id: 'traza-espanola',
    name: 'Traza Española',
    bounds: { xMin: 560, xMax: 1770, yMin: 0, yMax: 1350 },
    priority: 10,
    description: 'Spanish colonial core'
  },
  {
    id: 'barrio-san-juan',
    name: 'San Juan Moyotlan',
    bounds: { xMin: 0, xMax: 560, yMin: 0, yMax: 1350 },
    priority: 10,
    description: 'Indigenous quarter'
  }
];

/**
 * Get the street name(s) for a given position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {boolean} includeIntersections - If true, return both streets at intersections
 * @returns {Object} { primary: string, secondary?: string, location?: string, barrio?: string }
 */
export function getStreetNameFromPosition(x, y, includeIntersections = true) {
  // 1. Check special locations first (highest priority)
  for (const location of SPECIAL_LOCATIONS) {
    if (x >= location.bounds.xMin && x <= location.bounds.xMax &&
        y >= location.bounds.yMin && y <= location.bounds.yMax) {
      return {
        location: location.name,
        type: 'special',
        id: location.id
      };
    }
  }

  // 2. Find matching streets
  let primaryStreet = null;
  let secondaryStreet = null;

  // Check North-South streets
  for (const street of NORTH_SOUTH_STREETS) {
    if (Math.abs(x - street.x) <= street.tolerance) {
      if (!primaryStreet || street.priority < primaryStreet.priority) {
        secondaryStreet = primaryStreet;
        primaryStreet = street;
      } else if (!secondaryStreet || street.priority < secondaryStreet.priority) {
        secondaryStreet = street;
      }
    }
  }

  // Check East-West streets
  for (const street of EAST_WEST_STREETS) {
    if (street.xMin !== undefined && street.xMax !== undefined) {
      if (x < street.xMin || x > street.xMax) {
        continue;
      }
    }

    if (Math.abs(y - street.y) <= street.tolerance) {
      if (!primaryStreet || street.priority < primaryStreet.priority) {
        secondaryStreet = primaryStreet;
        primaryStreet = street;
      } else if (!secondaryStreet || street.priority < secondaryStreet.priority) {
        secondaryStreet = street;
      }
    }
  }

  // 3. Get barrio
  let barrio = null;
  for (const district of BARRIOS) {
    if (x >= district.bounds.xMin && x <= district.bounds.xMax &&
        y >= district.bounds.yMin && y <= district.bounds.yMax) {
      barrio = district.name;
      break;
    }
  }

  // 4. Format response
  if (primaryStreet && secondaryStreet && includeIntersections) {
    // At intersection
    return {
      primary: primaryStreet.name,
      secondary: secondaryStreet.name,
      type: 'intersection',
      barrio: barrio,
      formatted: `${primaryStreet.name} and ${secondaryStreet.name}`
    };
  } else if (primaryStreet) {
    // On a single street
    return {
      primary: primaryStreet.name,
      type: 'street',
      barrio: barrio,
      formatted: primaryStreet.name
    };
  } else {
    // No specific street match - return generic based on barrio
    return {
      primary: barrio || 'Streets of Mexico City',
      type: 'generic',
      barrio: barrio,
      formatted: barrio || 'Streets of Mexico City'
    };
  }
}

/**
 * Get a narrative description of a location
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {string} Human-readable location description
 */
export function getLocationDescription(x, y) {
  const streetInfo = getStreetNameFromPosition(x, y, true);

  if (streetInfo.type === 'special') {
    return `at ${streetInfo.location}`;
  } else if (streetInfo.type === 'intersection') {
    return `at the intersection of ${streetInfo.primary} and ${streetInfo.secondary}`;
  } else if (streetInfo.type === 'street') {
    return `on ${streetInfo.primary}`;
  } else {
    return `in the streets of ${streetInfo.barrio || 'Mexico City'}`;
  }
}

/**
 * Get nearby landmarks for context (within 200 pixels)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Array<string>} Array of nearby landmark names
 */
export function getNearbyLandmarks(x, y, radius = 200) {
  const nearby = [];

  for (const location of SPECIAL_LOCATIONS) {
    if (!location.includeInDescription) continue;

    // Calculate distance to center of location
    const centerX = (location.bounds.xMin + location.bounds.xMax) / 2;
    const centerY = (location.bounds.yMin + location.bounds.yMax) / 2;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

    if (distance <= radius) {
      nearby.push(location.name);
    }
  }

  return nearby;
}

/**
 * Get full context for StateAgent (includes streets, landmarks, barrio)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object} Complete location context
 */
export function getFullLocationContext(x, y) {
  const streetInfo = getStreetNameFromPosition(x, y, true);
  const landmarks = getNearbyLandmarks(x, y, 200);
  const description = getLocationDescription(x, y);

  return {
    ...streetInfo,
    landmarks,
    description,
    coordinates: { x, y }
  };
}

export default {
  NORTH_SOUTH_STREETS,
  EAST_WEST_STREETS,
  SPECIAL_LOCATIONS,
  BARRIOS,
  getStreetNameFromPosition,
  getLocationDescription,
  getNearbyLandmarks,
  getFullLocationContext
};
