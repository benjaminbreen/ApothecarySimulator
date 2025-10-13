// Type definitions for map system
// SVG-based map rendering with JSON schema

/**
 * @typedef {Object} Point2D
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {[number, number]} PointTuple - [x, y] coordinate pair
 */

/**
 * @typedef {Object} MapBounds
 * @property {number} width - Map width in SVG units
 * @property {number} height - Map height in SVG units
 */

/**
 * @typedef {Object} Street
 * @property {string} id - Unique street identifier
 * @property {string} name - Street name for display
 * @property {PointTuple[]} points - Array of [x, y] points defining the street path
 * @property {number} width - Street width in pixels
 * @property {string} [type] - Street type: 'main' | 'side' | 'alley'
 */

/**
 * @typedef {Object} Building
 * @property {string} id - Unique building identifier
 * @property {string} name - Building name
 * @property {PointTuple[]} polygon - Array of [x, y] points defining the building footprint
 * @property {string} [type] - Building type: 'residence' | 'shop' | 'church' | 'government' | 'market'
 * @property {string|null} hasInterior - Interior map ID if building is enterable
 * @property {boolean} [isPlayerLocation] - True if this is the player's current location
 * @property {PointTuple} [labelPosition] - Optional custom position for label
 */

/**
 * @typedef {Object} Landmark
 * @property {string} id - Unique landmark identifier
 * @property {string} name - Landmark name
 * @property {PointTuple} position - [x, y] position
 * @property {string} icon - Icon identifier (e.g., 'church', 'market', 'tree')
 * @property {string} [description] - Optional description for tooltip
 */

/**
 * @typedef {Object} Room
 * @property {string} id - Unique room identifier
 * @property {string} name - Room name
 * @property {PointTuple[]} polygon - Array of [x, y] points defining room boundary
 * @property {string} [type] - Room type: 'shop-floor' | 'laboratory' | 'bedroom' | 'storage'
 */

/**
 * @typedef {Object} Door
 * @property {string} id - Unique door identifier
 * @property {string} from - Room ID or 'street'
 * @property {string} to - Room ID or exit location
 * @property {PointTuple} position - [x, y] position
 * @property {number} [rotation] - Door rotation in degrees
 * @property {boolean} [isLocked] - True if door is locked
 */

/**
 * @typedef {Object} Furniture
 * @property {string} id - Unique furniture identifier
 * @property {string} type - Furniture type: 'counter' | 'shelf' | 'table' | 'chair' | 'bed' | 'chest'
 * @property {PointTuple} position - [x, y] position
 * @property {number} [rotation] - Rotation in degrees
 * @property {PointTuple} [size] - [width, height] if not using default
 */

/**
 * @typedef {Object} NPCMarker
 * @property {string} npcId - NPC identifier
 * @property {string} npcName - NPC display name
 * @property {PointTuple} position - Current [x, y] position
 * @property {string} [status] - NPC status: 'idle' | 'moving' | 'interacting'
 * @property {PointTuple[]} [path] - Path the NPC is following (if moving)
 * @property {number} [pathProgress] - Progress along path (0-1)
 */

/**
 * @typedef {Object} ExteriorMapData
 * @property {string} id - Unique map identifier
 * @property {string} type - Always 'exterior'
 * @property {string} name - Map display name
 * @property {string} style - Visual style: 'colonial-spanish' | 'grid-american' | 'medieval-organic'
 * @property {MapBounds} bounds - Map dimensions
 * @property {Street[]} streets - Street network
 * @property {Building[]} buildings - Buildings on the map
 * @property {Landmark[]} [landmarks] - Optional landmarks (fountains, statues, etc.)
 * @property {string} [backgroundColor] - Optional background color override
 */

/**
 * @typedef {Object} InteriorMapData
 * @property {string} id - Unique map identifier
 * @property {string} type - Always 'interior'
 * @property {string} name - Map display name
 * @property {string} style - Visual style: 'colonial-interior' | 'modern' | 'rustic'
 * @property {MapBounds} bounds - Map dimensions
 * @property {Room[]} rooms - Rooms in the building
 * @property {Door[]} doors - Doors and connections
 * @property {Furniture[]} [furniture] - Optional furniture items
 * @property {string} [backgroundColor] - Optional background color override
 */

/**
 * @typedef {ExteriorMapData | InteriorMapData} MapData
 */

/**
 * @typedef {Object} MapCollection
 * @property {Object.<string, ExteriorMapData>} exterior - Exterior maps by ID
 * @property {Object.<string, InteriorMapData>} interior - Interior maps by ID
 */

/**
 * @typedef {Object} MapViewport
 * @property {number} scale - Zoom level (1 = 100%)
 * @property {PointTuple} center - Center point [x, y]
 * @property {boolean} [followPlayer] - Auto-center on player position
 */

/**
 * Validate map data structure
 * @param {MapData} mapData - Map data to validate
 * @returns {boolean} - True if valid
 * @throws {Error} - If validation fails
 */
export function validateMapData(mapData) {
  if (!mapData.id || !mapData.type || !mapData.name) {
    throw new Error('Map must have id, type, and name');
  }

  if (!mapData.bounds || typeof mapData.bounds.width !== 'number' || typeof mapData.bounds.height !== 'number') {
    throw new Error('Map must have valid bounds with width and height');
  }

  if (mapData.type === 'exterior') {
    if (!Array.isArray(mapData.streets)) {
      throw new Error('Exterior map must have streets array');
    }
    if (!Array.isArray(mapData.buildings)) {
      throw new Error('Exterior map must have buildings array');
    }
  } else if (mapData.type === 'interior') {
    if (!Array.isArray(mapData.rooms)) {
      throw new Error('Interior map must have rooms array');
    }
    if (!Array.isArray(mapData.doors)) {
      throw new Error('Interior map must have doors array');
    }
  } else {
    throw new Error(`Invalid map type: ${mapData.type}`);
  }

  return true;
}

/**
 * Helper to convert Point2D to PointTuple
 * @param {Point2D} point
 * @returns {PointTuple}
 */
export function pointToTuple(point) {
  return [point.x, point.y];
}

/**
 * Helper to convert PointTuple to Point2D
 * @param {PointTuple} tuple
 * @returns {Point2D}
 */
export function tupleToPoint(tuple) {
  return { x: tuple[0], y: tuple[1] };
}

/**
 * Calculate distance between two points
 * @param {PointTuple} p1
 * @param {PointTuple} p2
 * @returns {number}
 */
export function distance(p1, p2) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert polygon points array to SVG points string
 * @param {PointTuple[]} polygon
 * @returns {string}
 */
export function polygonToSVGPoints(polygon) {
  return polygon.map(p => p.join(',')).join(' ');
}
