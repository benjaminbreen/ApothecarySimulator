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
  getNearestWorldLocation,
  calculateDistanceKm
} from '../data/worldLocations';
import { SeededRNG } from '../../../utils/seededRandom';

/**
 * Historical Trade Route Matrix
 * Defines which destinations are available from each major port
 * Based on actual 17th-century trade routes
 */
const PORT_ROUTES = {
  // Atlantic Gateway
  'veracruz': {
    primary: ['havana', 'cartagena', 'portobelo', 'santo-domingo'],
    secondary: ['cadiz', 'seville', 'canary-islands'],
    rare: ['cape-verde', 'dakar-goree', 'azores']
  },

  // Pacific Gateway (Manila Galleon route!)
  'acapulco': {
    primary: ['panama-city', 'lima', 'callao'],
    secondary: ['manila', 'guam'], // Famous Manila Galleon
    rare: ['valparaiso', 'santiago-de-chile']
  },

  // Caribbean Hub
  'havana': {
    primary: ['port-royal', 'san-juan', 'santo-domingo', 'veracruz'],
    secondary: ['cartagena', 'bridgetown', 'campeche'],
    rare: ['cadiz', 'seville']
  },

  // New World Hubs
  'cartagena': {
    primary: ['portobelo', 'havana', 'veracruz', 'santo-domingo'],
    secondary: ['caracas', 'panama-city', 'cape-verde'],
    rare: ['cadiz', 'seville']
  },

  'panama-city': {
    primary: ['lima', 'acapulco', 'cartagena'],
    secondary: ['guayaquil', 'quito', 'callao'],
    rare: ['manila']
  },

  'lima': {
    primary: ['panama-city', 'callao', 'valparaiso'],
    secondary: ['acapulco', 'santiago-de-chile', 'cusco'],
    rare: ['manila', 'guam']
  },

  // Asian Hub (Manila Galleon terminus)
  'manila': {
    primary: ['acapulco', 'guam'], // Return voyage to New Spain
    secondary: ['macau', 'canton', 'batavia'],
    rare: ['nagasaki', 'malacca', 'goa']
  },

  // European Hub
  'seville': {
    primary: ['cadiz', 'madrid', 'lisbon', 'barcelona'],
    secondary: ['veracruz', 'havana', 'cartagena', 'canary-islands'],
    rare: ['azores', 'cape-verde', 'paris', 'genoa']
  },

  'cadiz': {
    primary: ['seville', 'lisbon', 'canary-islands'],
    secondary: ['veracruz', 'havana', 'azores'],
    rare: ['london', 'amsterdam', 'cape-verde']
  },

  // African Ports
  'cape-verde': {
    primary: ['dakar-goree', 'canary-islands', 'azores'],
    secondary: ['seville', 'cadiz', 'veracruz'],
    rare: ['salvador-da-bahia', 'luanda']
  },

  'cape-town': {
    primary: ['goa', 'muscat', 'cape-verde'],
    secondary: ['batavia', 'luanda', 'dakar-goree'],
    rare: ['lisbon', 'amsterdam']
  },

  // Asian Trade Network
  'goa': {
    primary: ['muscat', 'cape-town', 'batavia'],
    secondary: ['colombo', 'malacca', 'macau'],
    rare: ['lisbon', 'seville']
  },

  'batavia': {
    primary: ['malacca', 'macau', 'manila'],
    secondary: ['goa', 'colombo', 'canton'],
    rare: ['cape-town', 'amsterdam']
  }
};

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
    street: ['outside', 'street', 'exit', 'leave', 'exterior', 'city', 'zócalo', 'zocalo', 'plaza', 'main square', 'central plaza', 'central square', 'cathedral', 'fountain', 'market']
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
 * Get randomized travel destinations based on trade routes and current location
 * Routes refresh daily and simulate realistic historical trade patterns
 *
 * @param {Object} params
 * @param {Object} params.scenario
 * @param {string} params.currentMapId
 * @param {string} params.currentLocationText
 * @param {{x:number,y:number}} [params.playerPosition]
 * @param {string|null} params.currentWorldLocationId
 * @param {string} params.gameDate - Current game date for seeding randomization
 * @param {string} params.playthroughSeed - Unique seed for this playthrough
 * @param {Array<string>} [params.visitedLocations=[]] - Array of visited location IDs
 * @returns {{ origin: Object|null, destinations: Array<Object> }}
 */
export function getRandomizedTravelOptions({
  scenario,
  currentMapId,
  currentLocationText,
  playerPosition,
  currentWorldLocationId = null,
  gameDate,
  playthroughSeed,
  visitedLocations = []
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

  // Create seeded RNG (same results for same date)
  const seed = `${gameDate}-${playthroughSeed}-travel`;
  const rng = new SeededRNG(seed);

  const destinations = [];

  // Tier 1: Local cities (random 3-4 from nearby locations)
  const localCities = WORLD_LOCATIONS
    .filter(loc => !loc.suppressRegistry && loc.id !== originId)
    .map(loc => {
      const distanceKm = calculateDistanceKm(originLat, originLon, loc.lat, loc.lon);
      return { ...loc, distanceKm };
    })
    .filter(loc => loc.distanceKm <= 500) // Within 500km
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const randomLocalCount = rng.nextInt(3, 4);
  const selectedLocal = rng.sample(localCities, randomLocalCount).map(loc => ({
    ...loc,
    distanceLeagues: Math.round(loc.distanceKm / 4.2)
  }));

  destinations.push(...selectedLocal);

  // Tier 2: Major ports (always available from Mexico City and nearby New Spain cities)
  const originRegion = originLocation?.region?.toLowerCase() || '';
  const isInMexico = originRegion.includes('new spain') ||
                     originRegion.includes('mexico');

  if (isInMexico) {
    ['veracruz', 'acapulco'].forEach(portId => {
      const port = WORLD_LOCATION_LOOKUP[portId];
      if (port && !destinations.find(d => d.id === portId)) {
        const distanceKm = calculateDistanceKm(originLat, originLon, port.lat, port.lon);
        destinations.push({
          ...port,
          distanceKm,
          distanceLeagues: Math.round(distanceKm / 4.2),
          isMajorPort: true // Flag for UI highlighting
        });
      }
    });
  }

  // Tier 3: Port-specific routes (if currently at a port)
  if (PORT_ROUTES[originId]) {
    const portRoutes = PORT_ROUTES[originId];

    // Pick 2 primary, 1-2 secondary, 0-1 rare
    const primaryPicks = rng.sample(portRoutes.primary, 2);
    const secondaryPicks = rng.sample(portRoutes.secondary, rng.nextInt(1, 2));
    const rarePicks = rng.chance(0.4) ? rng.sample(portRoutes.rare, 1) : [];

    const portDestinations = [...primaryPicks, ...secondaryPicks, ...rarePicks]
      .map(destId => {
        const dest = WORLD_LOCATION_LOOKUP[destId];
        if (!dest || destinations.find(d => d.id === destId)) return null;

        const distanceKm = calculateDistanceKm(originLat, originLon, dest.lat, dest.lon);
        return {
          ...dest,
          distanceKm,
          distanceLeagues: Math.round(distanceKm / 4.2),
          isTradeRoute: true // Flag for UI
        };
      })
      .filter(Boolean);

    destinations.push(...portDestinations);
  }

  // Remove duplicates and limit to 6 total
  const uniqueDestinations = [];
  const seenIds = new Set();

  destinations.forEach(dest => {
    if (!seenIds.has(dest.id)) {
      uniqueDestinations.push(dest);
      seenIds.add(dest.id);
    }
  });

  return {
    origin: originLocation,
    destinations: uniqueDestinations.slice(0, 6)
  };
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

  const baseDestinations = getClosestWorldLocations({
    originId,
    originLat,
    originLon,
    maxResults: Math.max(maxResults, 14),
    excludeIds: [originId]
  }).map(loc => ({
    ...loc,
    distanceKm: loc.distanceKm,
    distanceLeagues: loc.distanceKm ? Math.round(loc.distanceKm / 4.2) : null
  }));

  const mustIncludeIds = ['texas-frontier', 'cartagena'];
  mustIncludeIds.forEach(id => {
    const loc = WORLD_LOCATION_LOOKUP[id];
    if (loc && !loc.suppressRegistry && !baseDestinations.find(d => d.id === id)) {
      const distanceKm = calculateDistanceKm(originLat, originLon, loc.lat, loc.lon);
      baseDestinations.push({
        ...loc,
        distanceKm,
        distanceLeagues: Math.round(distanceKm / 4.2)
      });
    }
  });

  const importantExtras = WORLD_LOCATIONS
    .filter(loc => !loc.suppressRegistry && !baseDestinations.find(d => d.id === loc.id))
    .filter(loc => ['capital', 'port', 'regional-center'].includes(loc.importance))
    .map(loc => {
      const distanceKm = calculateDistanceKm(originLat, originLon, loc.lat, loc.lon);
      return {
        ...loc,
        distanceKm,
        distanceLeagues: Math.round(distanceKm / 4.2)
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  importantExtras.slice(0, 6).forEach(extra => baseDestinations.push(extra));

  const uniqueDestinations = [];
  const seenIds = new Set();
  baseDestinations.forEach(dest => {
    if (!seenIds.has(dest.id)) {
      uniqueDestinations.push(dest);
      seenIds.add(dest.id);
    }
  });

  const limit = Math.max(maxResults, 14);
  return {
    origin: originLocation,
    destinations: uniqueDestinations.slice(0, limit)
  };
}
