/**
 * Location Registry - Maps location strings to coordinates
 * Bridges natural language locations with map positions
 *
 * This service allows the StateAgent to return location names like
 * "Bedroom, Botica de la Amargura" which are then matched to actual
 * map coordinates and spawn points.
 */

/**
 * @typedef {Object} LocationEntry
 * @property {string} id - Location ID (e.g., 'bedroom', 'botica-amargura')
 * @property {string} name - Short name (e.g., 'Bedroom', 'Street')
 * @property {string} fullName - Full hierarchical name (e.g., 'Bedroom, Botica de la Amargura')
 * @property {string} mapId - Map ID where this location exists
 * @property {{x: number, y: number}} position - Spawn point coordinates
 * @property {string} type - Location type: 'room', 'building', 'exit'
 * @property {Array<number>} [interiorSpawn] - For buildings: [x, y] spawn inside
 */

/**
 * Build location registry from scenario map data
 * Returns all locations reachable from the current map
 *
 * @param {Object} scenario - Scenario with maps
 * @param {string} currentMapId - Current map ID
 * @returns {Array<LocationEntry>} Available locations with spawn points
 */
export function buildLocationRegistry(scenario, currentMapId) {
  if (!scenario?.maps) {
    console.warn('[LocationRegistry] No scenario maps available');
    return [];
  }

  const locations = [];
  const currentMap = scenario.maps.interior?.[currentMapId] ||
                     scenario.maps.exterior?.[currentMapId];

  if (!currentMap) {
    console.warn('[LocationRegistry] Current map not found:', currentMapId);
    return [];
  }

  console.log('[LocationRegistry] Building registry for:', currentMapId, currentMap.type);

  // ===== INTERIOR MAP: Add rooms + exit to exterior =====
  if (currentMap.type === 'interior' && currentMap.rooms) {
    // Add each room with a spawn point
    currentMap.rooms.forEach(room => {
      if (room.spawnPoint) {
        locations.push({
          id: room.id,
          name: room.name,
          fullName: `${room.name}, ${currentMap.name}`,
          mapId: currentMapId,
          position: room.spawnPoint,
          type: 'room'
        });
        console.log('[LocationRegistry] Added room:', room.name, 'at', room.spawnPoint);
      }
    });

    // Add exit to exterior (find building that has this interior)
    const exteriorMaps = Object.values(scenario.maps.exterior || {});
    for (const exteriorMap of exteriorMaps) {
      if (!exteriorMap.buildings) continue;

      const buildingWithThisInterior = exteriorMap.buildings.find(
        b => b.hasInterior === currentMapId
      );

      if (buildingWithThisInterior?.entrancePoint) {
        locations.push({
          id: 'street',
          name: 'Street',
          fullName: 'Streets of Mexico City',
          mapId: exteriorMap.id,
          position: buildingWithThisInterior.entrancePoint,
          type: 'exit'
        });
        console.log('[LocationRegistry] Added exit to street at', buildingWithThisInterior.entrancePoint);
        break; // Only need one exit
      }
    }
  }

  // ===== EXTERIOR MAP: Add buildings with interiors =====
  if (currentMap.type === 'exterior' && currentMap.buildings) {
    currentMap.buildings
      .filter(b => b.hasInterior && b.entrancePoint)
      .forEach(building => {
        const interiorMap = scenario.maps.interior?.[building.hasInterior];

        locations.push({
          id: building.id,
          name: building.name,
          fullName: building.fullName || building.name,
          mapId: building.hasInterior, // Target is interior map
          position: building.entrancePoint, // Position on current (exterior) map
          interiorSpawn: interiorMap?.startPosition, // Where to spawn inside
          type: 'building'
        });
        console.log('[LocationRegistry] Added building:', building.name, 'entrance at', building.entrancePoint);
      });
  }

  console.log('[LocationRegistry] Built registry with', locations.length, 'locations');
  return locations;
}

/**
 * Fuzzy match location string to registry entry
 * Handles natural language variations like "bedroom", "my room", "sleeping quarters"
 *
 * @param {string} locationString - Natural language location from StateAgent
 * @param {Array<LocationEntry>} registry - Available locations
 * @returns {LocationEntry|null} Matched location or null if no match
 */
export function matchLocation(locationString, registry) {
  if (!locationString || !registry || registry.length === 0) {
    return null;
  }

  const normalized = locationString.toLowerCase().trim();
  console.log('[LocationRegistry] Matching:', normalized, 'against', registry.length, 'locations');

  // 1. Exact name match (case-insensitive)
  let match = registry.find(loc =>
    loc.name.toLowerCase() === normalized ||
    loc.fullName.toLowerCase() === normalized
  );
  if (match) {
    console.log('[LocationRegistry] Exact match:', match.name);
    return match;
  }

  // 2. Partial match (location string contains location name or vice versa)
  match = registry.find(loc =>
    normalized.includes(loc.name.toLowerCase()) ||
    loc.name.toLowerCase().includes(normalized)
  );
  if (match) {
    console.log('[LocationRegistry] Partial match:', match.name);
    return match;
  }

  // 3. Fuzzy keywords for common variations
  const keywords = {
    bedroom: ['bed', 'sleep', 'room', 'quarters', 'chamber', 'sleeping'],
    laboratory: ['lab', 'workshop', 'workbench', 'mixing'],
    'shop floor': ['shop', 'counter', 'store', 'storefront', 'sales'],
    street: ['outside', 'street', 'exit', 'leave', 'exterior', 'city']
  };

  for (const [locationName, synonyms] of Object.entries(keywords)) {
    if (synonyms.some(syn => normalized.includes(syn))) {
      match = registry.find(loc => loc.name.toLowerCase().includes(locationName));
      if (match) {
        console.log('[LocationRegistry] Fuzzy match:', match.name, '(via keyword)');
        return match;
      }
    }
  }

  console.log('[LocationRegistry] No match found for:', normalized);
  return null;
}

/**
 * Get a human-readable summary of available locations
 * Useful for debugging and for inclusion in StateAgent prompt
 *
 * @param {Array<LocationEntry>} registry - Location registry
 * @returns {string} Formatted list of locations
 */
export function formatAvailableLocations(registry) {
  if (!registry || registry.length === 0) {
    return 'No locations available';
  }

  return registry
    .map(loc => `- ${loc.fullName} (${loc.type})`)
    .join('\n');
}
