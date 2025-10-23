/**
 * City Pathfinding Service
 * Phase 3B: Calculate travel paths across exterior city map
 *
 * Generates waypoint paths for house call travel animations
 */

import { CITY_LOCATIONS, getLocationCoordinates } from '../data/cityLocations';

/**
 * Calculate a simple path between two points on the city map
 * Uses Manhattan-style movement (orthogonal grid) for colonial street navigation
 *
 * @param {[number, number]} start - Starting coordinates [x, y]
 * @param {[number, number]} end - Ending coordinates [x, y]
 * @returns {Array<[number, number]>} Array of waypoint coordinates
 */
export function calculateCityPath(start, end) {
  if (!start || !end || start.length !== 2 || end.length !== 2) {
    console.error('[cityPathfinding] Invalid start or end coordinates:', { start, end });
    return [start, end];
  }

  const [startX, startY] = start;
  const [endX, endY] = end;

  console.log('[cityPathfinding] Calculating path from', start, 'to', end);

  // Simple Manhattan path: horizontal first, then vertical
  // This follows colonial street grid (orthogonal movement)
  const waypoints = [
    start,
    [endX, startY], // Move horizontally to destination X
    end             // Move vertically to destination Y
  ];

  // Remove duplicate points (if start/end share X or Y)
  const uniqueWaypoints = waypoints.filter((point, index, self) => {
    if (index === 0) return true; // Always keep start
    const prev = self[index - 1];
    return point[0] !== prev[0] || point[1] !== prev[1];
  });

  console.log('[cityPathfinding] Generated path with', uniqueWaypoints.length, 'waypoints:', uniqueWaypoints);

  return uniqueWaypoints;
}

/**
 * Calculate path from botica to a destination location string
 *
 * @param {string} destinationString - Destination location (e.g., "Don Rodrigo's residence")
 * @returns {Object} Path data { path: Array<[number, number]>, destination: Object }
 */
export function calculatePathFromBotica(destinationString) {
  // Get botica coordinates
  const boticaCoords = CITY_LOCATIONS['botica-de-la-amargura'].coordinates;

  // Get destination coordinates
  const destCoords = getLocationCoordinates(destinationString);

  if (!destCoords) {
    console.warn('[cityPathfinding] Could not find coordinates for:', destinationString);
    // Default to merchant district if location not found
    const fallbackCoords = CITY_LOCATIONS['merchant-district'].coordinates;
    const path = calculateCityPath(boticaCoords, fallbackCoords);

    return {
      path,
      destination: {
        name: destinationString,
        coordinates: fallbackCoords,
        type: 'unknown',
        isFallback: true
      }
    };
  }

  // Calculate path
  const path = calculateCityPath(boticaCoords, destCoords);

  // Get full location data
  const destData = Object.values(CITY_LOCATIONS).find(
    loc => loc.coordinates[0] === destCoords[0] && loc.coordinates[1] === destCoords[1]
  );

  return {
    path,
    destination: {
      name: destinationString,
      coordinates: destCoords,
      type: destData?.type || 'residential',
      isFallback: false
    }
  };
}

/**
 * Interpolate points along a path for smooth animation
 * Adds intermediate points between waypoints for smoother player icon movement
 *
 * @param {Array<[number, number]>} waypoints - Path waypoints
 * @param {number} segmentLength - Desired length between interpolated points (default: 20px)
 * @returns {Array<[number, number]>} Interpolated path with more points
 */
export function interpolatePath(waypoints, segmentLength = 20) {
  if (!waypoints || waypoints.length < 2) return waypoints;

  const interpolated = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const [x1, y1] = waypoints[i];
    const [x2, y2] = waypoints[i + 1];

    interpolated.push([x1, y1]);

    // Calculate distance between waypoints
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Number of segments to create
    const segments = Math.ceil(distance / segmentLength);

    // Add intermediate points
    for (let j = 1; j < segments; j++) {
      const t = j / segments;
      const x = x1 + dx * t;
      const y = y1 + dy * t;
      interpolated.push([x, y]);
    }
  }

  // Add final point
  interpolated.push(waypoints[waypoints.length - 1]);

  return interpolated;
}

/**
 * Calculate estimated travel time based on path distance
 * Used for TravelCard progress bar duration
 *
 * @param {Array<[number, number]>} path - Path waypoints
 * @returns {number} Estimated travel time in milliseconds
 */
export function calculateTravelTime(path) {
  if (!path || path.length < 2) return 2000; // Minimum 2 seconds

  let totalDistance = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const [x1, y1] = path[i];
    const [x2, y2] = path[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }

  // 1 map pixel ≈ 0.67 meters (from mexicoCityCenter.js scale)
  // Average walking speed: 5 km/h = 1.4 m/s
  // Animation speed multiplier: 10x faster than real time

  const distanceMeters = totalDistance * 0.67;
  const realTimeSeconds = distanceMeters / 1.4;
  const animationSeconds = realTimeSeconds / 10;
  const animationMilliseconds = animationSeconds * 1000;

  // Clamp to reasonable range: 2-10 seconds
  return Math.max(2000, Math.min(10000, animationMilliseconds));
}

/**
 * Get a descriptive label for a path segment
 * Used for travel narrative updates (e.g., "Passing through Plaza Mayor...")
 *
 * @param {[number, number]} currentPosition - Current position on path
 * @returns {string|null} Nearby landmark name or null
 */
export function getNearbyLandmark(currentPosition) {
  if (!currentPosition || currentPosition.length !== 2) return null;

  const [x, y] = currentPosition;
  const PROXIMITY_THRESHOLD = 100; // pixels

  // Find closest landmark within threshold
  let closestLandmark = null;
  let closestDistance = PROXIMITY_THRESHOLD;

  for (const [key, location] of Object.entries(CITY_LOCATIONS)) {
    // Skip player's own location
    if (key === 'botica-de-la-amargura') continue;

    // Only include notable landmarks (churches, plazas, markets)
    const notableTypes = ['church', 'plaza', 'market', 'government', 'hospital', 'monastery'];
    if (!notableTypes.includes(location.type)) continue;

    const [lx, ly] = location.coordinates;
    const distance = Math.sqrt((x - lx) ** 2 + (y - ly) ** 2);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestLandmark = location.name;
    }
  }

  return closestLandmark;
}
