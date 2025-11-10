/**
 * House Template Selector
 *
 * Intelligently selects the appropriate house interior template
 * based on patient's social class, casta, and wealth level.
 */

// Building X positions on horizon for zoom targeting (% from left edge)
// These correspond to actual building positions in HorizonLine.jsx
const BUILDING_POSITIONS = {
  humble: [18, 32, 45, 58, 72, 85], // Small houses/huts
  middling: [12, 42, 68, 88], // Medium houses/shops
  wealthy: [25, 55, 78] // Large buildings (for future use)
};

/**
 * Determine which house template to use based on patient characteristics
 * FIXED: Added null/undefined validation for patient parameter
 *
 * @param {Object} patient - Patient entity
 * @returns {Object} - { mapId, houseName }
 */
export function selectHouseTemplate(patient) {
  // FIXED: Validate patient exists before accessing properties
  if (!patient) {
    console.warn('[houseSelector] No patient provided, defaulting to middling house');
    return {
      mapId: 'middling-house-interior',
      houseName: 'Middling House (default)'
    };
  }

  const socialClass = patient.class?.toLowerCase() || '';
  const casta = patient.casta?.toLowerCase() || '';
  const occupation = patient.occupation?.toLowerCase() || '';

  // Determine wealth/class tier
  const isHumble =
    socialClass.includes('poor') ||
    socialClass.includes('laborer') ||
    socialClass.includes('servant') ||
    casta === 'india' ||
    casta === 'indigenous' ||
    casta === 'mulato' ||
    casta === 'negro' ||
    casta === 'zambo' ||
    occupation.includes('vendor') ||
    occupation.includes('laborer') ||
    occupation.includes('beggar') ||
    occupation.includes('servant');

  const isMiddling =
    socialClass.includes('middling') ||
    socialClass.includes('artisan') ||
    socialClass.includes('merchant') ||
    casta === 'criollo' ||
    casta === 'mestizo' ||
    casta === 'castizo' ||
    occupation.includes('merchant') ||
    occupation.includes('artisan') ||
    occupation.includes('shopkeeper') ||
    occupation.includes('clerk');

  // Default to middling if unclear
  if (isHumble) {
    return {
      mapId: 'humble-house-interior',
      houseName: 'Humble Dwelling'
    };
  } else {
    // Middling or elite (we only have middling house template for now)
    return {
      mapId: 'middling-house-interior',
      houseName: 'Middling House'
    };
  }
}

/**
 * Seeded random number generator for deterministic variance
 * @param {number} seed - Seed value
 * @returns {number} Pseudo-random number between 0 and 1
 */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Calculate distance to location based on location name
 * Uses consistent hash function for deterministic distances
 * FIXED: Now uses seeded random for consistent variance per location
 *
 * @param {string} locationName - Location name (e.g., "Calle de Tacuba")
 * @returns {number} - Distance in meters (500-2000)
 */
export function calculateDistanceToLocation(locationName) {
  if (!locationName) return 800; // Default

  // Simple hash function for consistent distance
  let hash = 0;
  for (let i = 0; i < locationName.length; i++) {
    hash = ((hash << 5) - hash) + locationName.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Map hash to 500-2000 meters range
  const baseDistance = 500 + (Math.abs(hash) % 1500);

  // FIXED: Deterministic variance based on hash (same location always has same distance)
  const variance = (seededRandom(hash) - 0.5) * 0.2; // ±10%
  const actualDistance = Math.round(baseDistance * (1 + variance));

  return actualDistance;
}

/**
 * Calculate travel time based on distance
 * Walking speed: ~70 meters/minute in crowded colonial streets
 *
 * @param {number} distance - Distance in meters
 * @returns {number} - Travel time in minutes
 */
export function calculateTravelTime(distance) {
  const walkingSpeed = 70; // meters/minute (slow due to crowds, narrow streets)
  const travelTime = Math.round(distance / walkingSpeed);

  // Minimum 5 minutes, maximum 20 minutes
  return Math.max(5, Math.min(20, travelTime));
}

/**
 * Detect if destination is a landmark/institutional building (not a residential household)
 *
 * @param {string} destination - Destination location name
 * @returns {Object|null} - Landmark info or null if residential
 */
function detectLandmark(destination) {
  if (!destination) return null;

  const lower = destination.toLowerCase();

  // Holy Office / Inquisition
  if (lower.includes('holy office') || lower.includes('inquisition')) {
    return {
      type: 'holy-office',
      name: 'Holy Office',
      description: 'imposing stone building housing the Inquisition tribunal',
      category: 'institutional'
    };
  }

  // Churches and Cathedral
  if (lower.includes('cathedral') || lower.includes('metropolitan cathedral')) {
    return {
      type: 'cathedral',
      name: 'Metropolitan Cathedral',
      description: 'vast sacred edifice dominating the plaza',
      category: 'religious'
    };
  }

  if (lower.includes('church of') || lower.includes('iglesia')) {
    return {
      type: 'church',
      name: destination,
      description: 'stone church with vaulted ceilings and religious iconography',
      category: 'religious'
    };
  }

  // Convents and Monasteries
  if (lower.includes('convent') || lower.includes('monastery')) {
    return {
      type: 'convent',
      name: destination,
      description: 'walled religious compound with cloistered quarters',
      category: 'religious'
    };
  }

  // Government buildings
  if (lower.includes('palace') || lower.includes('palacio')) {
    return {
      type: 'palace',
      name: destination,
      description: 'grand colonial palace with imposing architecture',
      category: 'institutional'
    };
  }

  // No landmark detected - must be a residential household
  return null;
}

/**
 * Get complete house call data for a patient
 *
 * @param {Object} patient - Patient entity
 * @param {string} destination - Destination location name
 * @returns {Object} - Complete house call data
 */
export function getHouseCallData(patient, destination) {
  const distance = calculateDistanceToLocation(destination);
  const travelTime = calculateTravelTime(distance);

  // Check if destination is a landmark/institutional building
  const landmark = detectLandmark(destination);

  if (landmark) {
    // Landmark destination (Holy Office, Church, etc.)
    // Still use a map template for interior, but mark it as a landmark
    const { mapId } = selectHouseTemplate(patient); // Use appropriate map based on patient class

    return {
      patientEntity: patient,
      houseMapId: mapId,
      houseName: landmark.name, // Use landmark name, not "Middling House"
      destination,
      distance,
      travelTime,
      originalMapId: 'botica-interior',
      targetLocation: 50, // Center position for landmarks
      isLandmark: true, // FLAG: This is NOT a residential household
      landmarkType: landmark.type,
      landmarkDescription: landmark.description,
      landmarkCategory: landmark.category
    };
  } else {
    // Normal residential house call
    const { mapId, houseName } = selectHouseTemplate(patient);

    // Determine house type from mapId
    const houseType = mapId.includes('humble') ? 'humble' : 'middling';

    // Select random building position for zoom target
    const positions = BUILDING_POSITIONS[houseType] || BUILDING_POSITIONS.middling;
    const targetLocation = positions[Math.floor(Math.random() * positions.length)];

    return {
      patientEntity: patient,
      houseMapId: mapId,
      houseName,
      destination,
      distance,
      travelTime,
      originalMapId: 'botica-interior', // Always return to botica
      targetLocation, // X position (%) for zoom effect
      isLandmark: false
    };
  }
}
