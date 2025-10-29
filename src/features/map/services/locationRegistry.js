/**
 * Location Registry - Maps location strings to coordinates
 * Bridges natural language locations with map positions
 *
 * This service allows the StateAgent to return location names like
 * "Bedroom, Botica de la Amargura" which are then matched to actual
 * map coordinates and spawn points.
 */

import {
  WORLD_LOCATIONS,
  WORLD_LOCATION_LOOKUP,
  findWorldLocation,
  projectPixelsToLatLon,
  getClosestWorldLocations,
  getNearestWorldLocation
} from '../data/worldLocations';

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
function resolveWorldOrigin({
  scenario,
  currentMapId,
  currentLocationText,
  playerPosition,
  explicitWorldLocationId = null
}) {
  let originId = explicitWorldLocationId;
  let originLat = null;
  let originLon = null;

  if (!originId && currentLocationText) {
    const matched = findWorldLocation(currentLocationText);
    if (matched) {
      originId = matched.id;
    }
  }

  const worldMap = scenario?.maps?.exterior?.[currentMapId];
  const isWorldMap = worldMap?.type === 'world';

  if (isWorldMap && playerPosition) {
    const { lat, lon } = projectPixelsToLatLon(playerPosition.x, playerPosition.y);
    originLat = lat;
    originLon = lon;

    if (!originId) {
      const nearest = getNearestWorldLocation(lat, lon);
      originId = nearest?.id || null;
    }
  }

  if (originId && WORLD_LOCATION_LOOKUP[originId]) {
    originLat = WORLD_LOCATION_LOOKUP[originId].lat;
    originLon = WORLD_LOCATION_LOOKUP[originId].lon;
  }

  if (!originId) {
    originId = 'mexico-city';
    const fallback = WORLD_LOCATION_LOOKUP[originId];
    originLat = fallback?.lat ?? originLat;
    originLon = fallback?.lon ?? originLon;
  }

  const originLocation = WORLD_LOCATION_LOOKUP[originId] || null;

  return {
    originId,
    originLocation,
    originLat,
    originLon
  };
}

export function buildLocationRegistry(scenario, currentMapId, options = {}) {
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

  // ===== WORLD MAP: Add long-distance travel targets =====
  const worldMaps = Object.values(scenario.maps.exterior || {}).filter(map => map?.type === 'world');
  if (worldMaps.length > 0) {
    const {
      originId,
      originLat,
      originLon
    } = resolveWorldOrigin({
      scenario,
      currentMapId,
      currentLocationText: options.currentLocationText,
      playerPosition: options.playerPosition,
      explicitWorldLocationId: options.currentWorldLocationId
    });

    const maxWorldLocations = options.maxWorldLocations || 10;
    const closestWorldLocations = getClosestWorldLocations({
      originId,
      originLat,
      originLon,
      maxResults: maxWorldLocations,
      excludeIds: [originId]
    });

    closestWorldLocations.forEach(worldLocation => {
      locations.push({
        id: worldLocation.id,
        name: worldLocation.name,
        fullName: worldLocation.fullName,
        mapId: worldLocation.mapId,
        position: { x: worldLocation.position.x, y: worldLocation.position.y },
        gridX: worldLocation.gridX,
        gridY: worldLocation.gridY,
        type: 'world',
        aliases: worldLocation.aliases,
        region: worldLocation.region,
        importance: worldLocation.importance,
        distanceKm: Math.round(worldLocation.distanceKm)
      });
    });
    console.log('[LocationRegistry] Added world destinations (nearest):', closestWorldLocations.length);
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

  // 1b. Alias exact match
  match = registry.find(loc =>
    Array.isArray(loc.aliases) && loc.aliases.some(alias => alias === normalized)
  );
  if (match) {
    console.log('[LocationRegistry] Alias exact match:', match.name);
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

  // 2b. Alias partial match
  match = registry.find(loc =>
    Array.isArray(loc.aliases) &&
    loc.aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))
  );
  if (match) {
    console.log('[LocationRegistry] Alias partial match:', match.name);
    return match;
  }

  // 3. Fuzzy keywords for common variations
  const keywords = {
    bedroom: ['bed', 'sleep', 'room', 'quarters', 'chamber', 'sleeping'],
    laboratory: ['lab', 'workshop', 'workbench', 'mixing'],
    'shop floor': ['shop', 'counter', 'store', 'storefront', 'sales'],
    street: ['outside', 'street', 'exit', 'leave', 'exterior', 'city'],
    'plaza mayor': ['zócalo', 'zocalo', 'plaza', 'main square', 'central plaza', 'central square']
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

/**
 * Build world travel options (UI helper) with nearest destinations.
 * @param {Object} params
 * @param {Object} params.scenario
 * @param {string} params.currentMapId
 * @param {string} params.currentLocationText
 * @param {{x:number,y:number}} [params.playerPosition]
 * @param {number} [params.maxResults=10]
 * @param {string|null} [params.currentWorldLocationId]
 * @returns {{ origin: Object|null, destinations: Array<Object> }}
 */
export function getWorldTravelOptions({
  scenario,
  currentMapId,
  currentLocationText,
  playerPosition,
  maxResults = 10,
  currentWorldLocationId = null
}) {
  const {
    originId,
    originLocation,
    originLat,
    originLon
  } = resolveWorldOrigin({
    scenario,
    currentMapId,
    currentLocationText,
    playerPosition,
    explicitWorldLocationId: currentWorldLocationId
  });

  const destinations = getClosestWorldLocations({
    originId,
    originLat,
    originLon,
    maxResults,
    excludeIds: [originId]
  }).map(loc => ({
    ...loc,
    distanceKm: loc.distanceKm,
    distanceLeagues: loc.distanceKm ? Math.round(loc.distanceKm / 4.2) : null
  }));

  return {
    origin: originLocation,
    destinations
  };
}
