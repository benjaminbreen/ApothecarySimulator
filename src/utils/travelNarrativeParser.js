/**
 * Travel Narrative Parser
 * Splits long-distance travel narratives into journey and arrival sections
 * based on markdown headers.
 */

/**
 * Parse a travel narrative into journey and arrival sections
 * @param {string} narrative - Full travel narrative with markdown headers
 * @returns {{ journeySection: string, arrivalSection: string, parseSuccess: boolean }}
 */
export function parseTravelNarrative(narrative) {
  if (!narrative || typeof narrative !== 'string') {
    return {
      journeySection: '',
      arrivalSection: '',
      parseSuccess: false
    };
  }

  // Regex patterns for the 3 sections
  // Journey: "## The Journey", "## The Voyage", "## The Road to X"
  const journeyPattern = /^##\s+(The Journey|The Voyage|The Road to .+?)$/m;

  // Arrival: "## Arrival at X", "## X City", or any other header after journey
  const arrivalPattern = /^##\s+(.+?)$/m;

  // Find first header (should be journey)
  const journeyMatch = narrative.match(journeyPattern);

  if (!journeyMatch) {
    console.warn('[TravelNarrativeParser] Journey header not found, using fallback');
    return {
      journeySection: narrative,
      arrivalSection: '',
      parseSuccess: false
    };
  }

  const journeyStart = narrative.indexOf(journeyMatch[0]);

  // Find arrival header (first ## header after journey header)
  const afterJourney = narrative.substring(journeyStart + journeyMatch[0].length);
  const arrivalMatch = afterJourney.match(arrivalPattern);

  if (!arrivalMatch) {
    console.warn('[TravelNarrativeParser] Arrival header not found, returning full narrative as journey');
    return {
      journeySection: narrative,
      arrivalSection: '',
      parseSuccess: false
    };
  }

  const arrivalStart = narrative.indexOf(arrivalMatch[0], journeyStart + journeyMatch[0].length);

  // Extract sections
  const journeySection = narrative.substring(journeyStart, arrivalStart).trim();
  const arrivalSection = narrative.substring(arrivalStart).trim();

  console.log('[TravelNarrativeParser] Successfully parsed narrative:', {
    journeyLength: journeySection.length,
    arrivalLength: arrivalSection.length
  });

  return {
    journeySection,
    arrivalSection,
    parseSuccess: true
  };
}

/**
 * Determine horizon image based on travel mode and destination biome/region
 * @param {string} travelMode - Travel mode ID (sea, wagon, horse, foot, river)
 * @param {string} destinationRegion - Destination region name
 * @param {string} destinationBiome - Destination biome type
 * @returns {string} Path to horizon image
 */
export function selectHorizonImage(travelMode, destinationRegion = '', destinationBiome = '') {
  // Sea travel always uses ocean horizon
  if (travelMode === 'sea') {
    return '/horizons/ocean_horizon.png';
  }

  // River travel uses ocean horizon as placeholder (could add river_horizon.png later)
  if (travelMode === 'river') {
    return '/horizons/ocean_horizon.png';
  }

  // Land travel: location-aware selection
  const region = (destinationRegion || '').toLowerCase();
  const biome = (destinationBiome || '').toLowerCase();

  // Desert regions/biomes
  if (
    biome.includes('desert') ||
    biome.includes('arid') ||
    region.includes('desert') ||
    region.includes('sonora') ||
    region.includes('chihuahua') ||
    region.includes('north africa') ||
    region.includes('sahara')
  ) {
    return '/horizons/desert_horizon.png';
  }

  // Mountain/highland regions
  if (
    biome.includes('mountain') ||
    biome.includes('highland') ||
    region.includes('andes') ||
    region.includes('sierra')
  ) {
    return '/horizons/mountain_horizon.png';
  }

  // Forest/jungle regions
  if (
    biome.includes('forest') ||
    biome.includes('jungle') ||
    biome.includes('rainforest') ||
    region.includes('amazon') ||
    region.includes('yucatan')
  ) {
    return '/horizons/forest_horizon.png';
  }

  // Default: grassland for most overland travel
  return '/horizons/grassland_horizon.png';
}

/**
 * Get travel mode image path
 * @param {string} travelMode - Travel mode ID
 * @returns {string} Path to travel mode image
 */
export function getTravelModeImage(travelMode) {
  const TRAVEL_MODE_IMAGES = {
    sea: '/ui/sea_voyage.png',
    wagon: '/ui/wagon_train.png',
    horse: '/ui/wagon_train.png', // Fallback to wagon for now
    foot: '/ui/wagon_train.png', // Fallback to wagon for now
    river: '/ui/sea_voyage.png' // Fallback to sea voyage for now
  };

  return TRAVEL_MODE_IMAGES[travelMode] || TRAVEL_MODE_IMAGES.wagon;
}
