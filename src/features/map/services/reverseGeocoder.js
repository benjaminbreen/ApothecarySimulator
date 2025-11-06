/**
 * Reverse Geocoder
 * Converts grid coordinates to location names using zone-based system
 *
 * Priority: street > plaza > proximity > district > nearest landmark
 */

import { CITY_ZONES, ZONE_PRIORITY } from '../data/cityZones';
import { CITY_LOCATIONS } from '../data/cityLocations';

/**
 * Check if a point is inside rectangular bounds
 * @param {number} x - Point X coordinate
 * @param {number} y - Point Y coordinate
 * @param {Object} bounds - Bounds {x1, y1, x2, y2}
 * @returns {boolean}
 */
function isInsideBounds(x, y, bounds) {
  return x >= bounds.x1 && x <= bounds.x2 && y >= bounds.y1 && y <= bounds.y2;
}

/**
 * Calculate Euclidean distance between two points
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number} Distance in pixels
 */
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Find nearest landmark from CITY_LOCATIONS
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @param {number} maxDistance - Maximum distance to consider (default 300)
 * @returns {{name: string, distance: number}|null}
 */
function getNearestLandmark(x, y, maxDistance = 300) {
  let nearest = null;
  let minDistance = maxDistance;

  for (const [key, location] of Object.entries(CITY_LOCATIONS)) {
    const [lx, ly] = location.coordinates;
    const distance = calculateDistance(x, y, lx, ly);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = {
        key,
        name: location.name,
        distance,
        type: location.type
      };
    }
  }

  return nearest;
}

/**
 * Get district context for a position (broader area description)
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @returns {string} District context string
 */
export function getDistrictContext(x, y) {
  // Find district-level zone (priority 1)
  const districtZones = CITY_ZONES.filter(z => z.type === 'district');

  for (const zone of districtZones) {
    if (zone.bounds && isInsideBounds(x, y, zone.bounds)) {
      return zone.description || zone.name;
    }
  }

  // Fallback based on general location
  if (x < 700 && y < 700) {
    return 'Northwestern quadrant, near indigenous neighborhoods';
  } else if (x > 1000 && y < 700) {
    return 'Northeastern quadrant, Spanish Quarter';
  } else if (x > 1000 && y > 700) {
    return 'Southeastern quadrant, near canals';
  } else {
    return 'Southwestern quadrant of the traza';
  }
}

/**
 * Get location name from coordinates using zone-based reverse geocoding
 * This is the main function called by the grid movement system
 *
 * @param {number} x - Pixel X coordinate
 * @param {number} y - Pixel Y coordinate
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.includeDistrict=false] - Whether to include district fallback
 * @returns {string} Location name (e.g., "Calle de San Francisco")
 */
export function getLocationName(x, y, options = {}) {
  const { includeDistrict = false } = options;

  console.log('[ReverseGeocoder] Looking up location for:', { x, y });

  const matches = [];

  // Step 1: Check rectangular zones (streets, plazas, districts)
  for (const zone of CITY_ZONES.filter(z => z.bounds)) {
    if (isInsideBounds(x, y, zone.bounds)) {
      matches.push({
        zone,
        priority: zone.priority,
        distance: 0 // Inside zone = distance 0
      });
    }
  }

  // Step 2: Check radial zones (proximity descriptors like "Near X")
  for (const zone of CITY_ZONES.filter(z => z.center && z.radius)) {
    const [cx, cy] = zone.center;
    const distance = calculateDistance(x, y, cx, cy);

    if (distance <= zone.radius) {
      matches.push({
        zone,
        priority: zone.priority,
        distance
      });
    }
  }

  // Step 3: Sort by priority (higher first), then by distance (closer first)
  matches.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority; // Higher priority first
    }
    return a.distance - b.distance; // Closer first
  });

  // Step 4: Return highest priority match
  if (matches.length > 0) {
    const match = matches[0];
    console.log('[ReverseGeocoder] Zone match:', {
      name: match.zone.name,
      type: match.zone.type,
      priority: match.priority
    });
    return match.zone.name;
  }

  // Step 5: Fallback to nearest landmark (if within 200 pixels)
  const nearest = getNearestLandmark(x, y, 200);
  if (nearest) {
    console.log('[ReverseGeocoder] Nearest landmark:', nearest.name, `(${Math.round(nearest.distance)}px away)`);
    return `Near ${nearest.name}`;
  }

  // Step 6: Ultimate fallback - district name or generic
  if (includeDistrict) {
    const districtZone = CITY_ZONES.find(z =>
      z.type === 'district' && z.bounds && isInsideBounds(x, y, z.bounds)
    );

    if (districtZone) {
      console.log('[ReverseGeocoder] District fallback:', districtZone.name);
      return districtZone.name;
    }
  }

  console.log('[ReverseGeocoder] No match found, using generic fallback');
  return 'Streets of Mexico City';
}

/**
 * Get nearby landmarks (for enriching narrative context)
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @param {number} count - Number of landmarks to return (default 3)
 * @param {number} maxDistance - Maximum distance to consider (default 400)
 * @returns {Array<{name: string, distance: number, type: string}>}
 */
export function getNearbyLandmarks(x, y, count = 3, maxDistance = 400) {
  const landmarks = [];

  for (const [key, location] of Object.entries(CITY_LOCATIONS)) {
    const [lx, ly] = location.coordinates;
    const distance = calculateDistance(x, y, lx, ly);

    if (distance <= maxDistance) {
      landmarks.push({
        key,
        name: location.name,
        distance: Math.round(distance),
        type: location.type
      });
    }
  }

  // Sort by distance and return top N
  landmarks.sort((a, b) => a.distance - b.distance);
  return landmarks.slice(0, count);
}

/**
 * Get enriched location data for a position
 * Returns comprehensive location context for StateAgent
 *
 * @param {number} x - Pixel X coordinate
 * @param {number} y - Pixel Y coordinate
 * @param {string} [previousLocation] - Previous location name for comparison
 * @returns {Object} Enriched location data
 */
export function getEnrichedLocationData(x, y, previousLocation = null) {
  const locationName = getLocationName(x, y);
  const nearbyLandmarks = getNearbyLandmarks(x, y, 3);
  const districtContext = getDistrictContext(x, y);

  // Determine if location changed meaningfully
  const locationChanged = previousLocation && previousLocation !== locationName;

  return {
    locationName,
    previousLocation,
    locationChanged,
    nearbyLandmarks: nearbyLandmarks.map(l => l.name),
    nearbyLandmarksDetailed: nearbyLandmarks,
    districtContext,
    coordinates: { x, y }
  };
}

/**
 * Debug: Get all zones at a position (for testing/troubleshooting)
 * @param {number} x
 * @param {number} y
 * @returns {Array<{name: string, type: string, priority: number}>}
 */
export function getAllZonesAtPosition(x, y) {
  const zones = [];

  // Check rectangular zones
  for (const zone of CITY_ZONES.filter(z => z.bounds)) {
    if (isInsideBounds(x, y, zone.bounds)) {
      zones.push({
        name: zone.name,
        type: zone.type,
        priority: zone.priority
      });
    }
  }

  // Check radial zones
  for (const zone of CITY_ZONES.filter(z => z.center && z.radius)) {
    const [cx, cy] = zone.center;
    const distance = calculateDistance(x, y, cx, cy);

    if (distance <= zone.radius) {
      zones.push({
        name: zone.name,
        type: zone.type,
        priority: zone.priority,
        distance: Math.round(distance)
      });
    }
  }

  zones.sort((a, b) => b.priority - a.priority);
  return zones;
}
