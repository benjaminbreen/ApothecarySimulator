/**
 * House Template Selector
 *
 * Intelligently selects the appropriate house interior template
 * based on patient's social class, casta, and wealth level.
 */

/**
 * Determine which house template to use based on patient characteristics
 *
 * @param {Object} patient - Patient entity
 * @returns {Object} - { mapId, houseName }
 */
export function selectHouseTemplate(patient) {
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
 * Calculate distance to location based on location name
 * Uses consistent hash function for deterministic distances
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

  // Add slight variance (±10% for realism)
  const variance = (Math.random() - 0.5) * 0.2; // ±10%
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
 * Get complete house call data for a patient
 *
 * @param {Object} patient - Patient entity
 * @param {string} destination - Destination location name
 * @returns {Object} - Complete house call data
 */
export function getHouseCallData(patient, destination) {
  const { mapId, houseName } = selectHouseTemplate(patient);
  const distance = calculateDistanceToLocation(destination);
  const travelTime = calculateTravelTime(distance);

  return {
    patientEntity: patient,
    houseMapId: mapId,
    houseName,
    destination,
    distance,
    travelTime,
    originalMapId: 'botica-interior' // Always return to botica
  };
}
