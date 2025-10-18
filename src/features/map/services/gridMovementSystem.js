/**
 * Grid-based Movement System
 * The "physics engine" for player movement - validates moves requested by LLM
 * Does NOT parse player commands directly
 */

/**
 * @typedef {Object} Position
 * @property {number} x - Pixel x coordinate
 * @property {number} y - Pixel y coordinate
 * @property {number} gridX - Grid x coordinate
 * @property {number} gridY - Grid y coordinate
 */

/**
 * @typedef {Object} MoveValidation
 * @property {boolean} valid - Whether the move is valid
 * @property {string} reason - Reason for validity/invalidity
 * @property {Position} [newPosition] - New position if valid
 * @property {Position} [currentPosition] - Current position if invalid
 */

export class GridMovementSystem {
  /**
   * @param {Object} mapData - Map configuration data
   * @param {number} [gridSize=20] - Size of each grid cell in pixels
   */
  constructor(mapData, gridSize = 20) {
    this.mapData = mapData;
    this.gridSize = gridSize;
    this.obstacles = this.calculateObstacles();
  }

  /**
   * Calculate obstacle grid from map data (buildings, walls, furniture)
   * Uses INVERSE APPROACH for interior maps: everything outside rooms = walls
   * @returns {Set<string>} Set of "x,y" grid coordinates that are blocked
   */
  calculateObstacles() {
    const obstacles = new Set();

    // INTERIOR MAPS: Use inverse walkability approach
    if (this.mapData.type === 'interior' && this.mapData.rooms) {
      const mapWidth = this.mapData.bounds?.width || this.mapData.width || 1000;
      const mapHeight = this.mapData.bounds?.height || this.mapData.height || 800;
      const gridWidth = Math.ceil(mapWidth / this.gridSize);
      const gridHeight = Math.ceil(mapHeight / this.gridSize);

      console.log('[GridSystem] INTERIOR MAP - Using inverse walkability');
      console.log('[GridSystem] Map dimensions:', { mapWidth, mapHeight, gridWidth, gridHeight });

      // Step 1: Mark ALL cells as obstacles (walls) by default
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          obstacles.add(`${x},${y}`);
        }
      }

      console.log('[GridSystem] Initial obstacles (all cells):', obstacles.size);

      // Step 2: REMOVE cells inside room polygons (make them walkable)
      this.mapData.rooms.forEach(room => {
        const roomCells = this.polygonToGridCells(room.polygon);
        roomCells.forEach(cell => {
          obstacles.delete(`${cell.x},${cell.y}`);
        });
        console.log(`[GridSystem] Cleared ${roomCells.length} cells for room: ${room.name}`);
      });

      console.log('[GridSystem] After clearing rooms:', obstacles.size);

      // Step 3: REMOVE cells at door positions (punch through walls)
      if (this.mapData.doors) {
        this.mapData.doors.forEach(door => {
          if (!door.isLocked) {
            const doorWidth = door.width || 60;
            const [doorX, doorY] = door.position;

            // Clear a rectangular area for the door
            const doorCells = this.rectToGridCells(
              doorX - doorWidth / 2,
              doorY - this.gridSize / 2,
              doorWidth,
              this.gridSize
            );

            doorCells.forEach(cell => {
              obstacles.delete(`${cell.x},${cell.y}`);
            });

            console.log(`[GridSystem] Cleared ${doorCells.length} cells for door: ${door.id}`);
          }
        });
      }

      console.log('[GridSystem] After clearing doors:', obstacles.size);
    }
    // EXTERIOR MAPS: Use polygon-based approach for buildings
    else if (this.mapData.buildings) {
      console.log('[GridSystem] EXTERIOR MAP - Processing building obstacles');
      this.mapData.buildings.forEach(building => {
        let cells = [];

        // Handle polygon format (most common for exterior maps)
        if (building.polygon && Array.isArray(building.polygon)) {
          cells = this.polygonToGridCells(building.polygon);
        }
        // Handle legacy rect format {x, y, width, height}
        else if (building.x !== undefined && building.y !== undefined &&
                 building.width !== undefined && building.height !== undefined) {
          cells = this.rectToGridCells(
            building.x,
            building.y,
            building.width,
            building.height
          );
        }

        cells.forEach(cell => obstacles.add(`${cell.x},${cell.y}`));
      });
      console.log('[GridSystem] Added obstacles for', this.mapData.buildings.length, 'buildings');
    }

    // Furniture blocks walkable areas (applies to both interior and exterior)
    if (this.mapData.furniture) {
      this.mapData.furniture.forEach(furniture => {
        // Handle both formats: {x, y, width, height} and {position: [x, y], size: [w, h]}
        const centerX = furniture.x !== undefined ? furniture.x : (furniture.position ? furniture.position[0] : 0);
        const centerY = furniture.y !== undefined ? furniture.y : (furniture.position ? furniture.position[1] : 0);
        const width = furniture.width !== undefined ? furniture.width : (furniture.size ? furniture.size[0] : 40);
        const height = furniture.height !== undefined ? furniture.height : (furniture.size ? furniture.size[1] : 40);

        // Convert from center position to top-left corner for grid calculation
        const topLeftX = centerX - width / 2;
        const topLeftY = centerY - height / 2;

        const cells = this.rectToGridCells(topLeftX, topLeftY, width, height);
        cells.forEach(cell => obstacles.add(`${cell.x},${cell.y}`));
      });
    }

    console.log('[GridSystem] Final obstacles:', obstacles.size);
    return obstacles;
  }

  /**
   * Convert pixel coordinates to grid coordinates
   * @param {number} x - Pixel x
   * @param {number} y - Pixel y
   * @returns {Position}
   */
  pixelToGrid(x, y) {
    return {
      gridX: Math.floor(x / this.gridSize),
      gridY: Math.floor(y / this.gridSize),
      x: Math.floor(x / this.gridSize) * this.gridSize + this.gridSize / 2,
      y: Math.floor(y / this.gridSize) * this.gridSize + this.gridSize / 2
    };
  }

  /**
   * Check if a grid cell is walkable
   * @param {number} gridX - Grid x coordinate
   * @param {number} gridY - Grid y coordinate
   * @returns {boolean}
   */
  isWalkable(gridX, gridY) {
    // Check bounds (convert grid to pixel boundaries)
    if (gridX < 0 || gridY < 0) return false;

    // Fixed: Use >= instead of > to prevent walking one cell off the edge
    // Also fixed: Access bounds.width/height instead of flat width/height
    const mapWidth = this.mapData.bounds?.width || this.mapData.width || 1000;
    const mapHeight = this.mapData.bounds?.height || this.mapData.height || 800;

    // gridX * gridSize gives the LEFT edge of the cell, must be < map width
    if (gridX * this.gridSize >= mapWidth) return false;
    if (gridY * this.gridSize >= mapHeight) return false;

    // Check obstacles
    if (this.obstacles.has(`${gridX},${gridY}`)) return false;

    return true;
  }

  /**
   * Validate a directional move (for LLM to query)
   * @param {Position} currentPos - Current position
   * @param {string} direction - Direction: 'north', 'south', 'east', 'west'
   * @param {number} [pixelDistance] - Pixel distance to move (optional, defaults to 1 grid cell)
   * @returns {MoveValidation}
   */
  validateMove(currentPos, direction, pixelDistance = this.gridSize) {
    // Use stored grid coordinates as source of truth (don't recalculate from pixels)
    const gridX = currentPos.gridX;
    const gridY = currentPos.gridY;

    console.log('[MOVEMENT] Validating move:', {
      direction,
      currentPos: { x: currentPos.x, y: currentPos.y, gridX, gridY },
      pixelDistance,
      gridSize: this.gridSize
    });

    // Calculate how many grid cells we're actually moving
    const gridCellsToMove = Math.ceil(pixelDistance / this.gridSize);

    let dx = 0, dy = 0;

    // Calculate direction delta
    switch(direction.toLowerCase()) {
      case 'north':
      case 'n':
        dy = -1;
        break;
      case 'south':
      case 's':
        dy = 1;
        break;
      case 'east':
      case 'e':
        dx = 1;
        break;
      case 'west':
      case 'w':
        dx = -1;
        break;
      default:
        return {
          valid: false,
          reason: `invalid direction: ${direction}`,
          currentPosition: currentPos
        };
    }

    // Check ALL cells along the path, not just the destination
    console.log('[MOVEMENT] Checking path:', { gridCellsToMove, dx, dy, startGrid: { gridX, gridY } });

    for (let step = 1; step <= gridCellsToMove; step++) {
      const checkGridX = gridX + (dx * step);
      const checkGridY = gridY + (dy * step);

      console.log(`[MOVEMENT] Checking cell ${step}/${gridCellsToMove}: (${checkGridX}, ${checkGridY})`);

      if (!this.isWalkable(checkGridX, checkGridY)) {
        const obstacle = this.getObstacleType(checkGridX, checkGridY);
        console.log('[MOVEMENT] ❌ BLOCKED at cell', { gridX: checkGridX, gridY: checkGridY, obstacle });
        return {
          valid: false,
          reason: obstacle,
          currentPosition: currentPos
        };
      }
    }

    // All cells along path are clear - calculate final position
    const newGridX = gridX + (dx * gridCellsToMove);
    const newGridY = gridY + (dy * gridCellsToMove);

    const result = {
      valid: true,
      reason: 'path is clear',
      newPosition: {
        x: newGridX * this.gridSize + this.gridSize / 2,
        y: newGridY * this.gridSize + this.gridSize / 2,
        gridX: newGridX,
        gridY: newGridY
      }
    };

    console.log('[MOVEMENT] ✅ VALID move:', result.newPosition);

    return result;
  }

  /**
   * Get descriptive obstacle type for narrative context
   * @param {number} gridX - Grid x coordinate
   * @param {number} gridY - Grid y coordinate
   * @returns {string} Description of obstacle
   */
  getObstacleType(gridX, gridY) {
    // Check buildings
    if (this.mapData.buildings) {
      for (const building of this.mapData.buildings) {
        const cells = this.rectToGridCells(
          building.x, building.y,
          building.width, building.height
        );
        if (cells.some(c => c.x === gridX && c.y === gridY)) {
          return `${building.name} blocks the path`;
        }
      }
    }

    // Check walls
    if (this.mapData.walls) {
      if (this.obstacles.has(`${gridX},${gridY}`)) {
        return 'a wall blocks the path';
      }
    }

    // Check furniture
    if (this.mapData.furniture) {
      for (const furniture of this.mapData.furniture) {
        // Handle both formats: {x, y, width, height} and {position: [x, y], size: [w, h]}
        const centerX = furniture.x !== undefined ? furniture.x : (furniture.position ? furniture.position[0] : 0);
        const centerY = furniture.y !== undefined ? furniture.y : (furniture.position ? furniture.position[1] : 0);
        const width = furniture.width !== undefined ? furniture.width : (furniture.size ? furniture.size[0] : 40);
        const height = furniture.height !== undefined ? furniture.height : (furniture.size ? furniture.size[1] : 40);

        // Convert from center position to top-left corner for grid calculation
        const topLeftX = centerX - width / 2;
        const topLeftY = centerY - height / 2;

        const cells = this.rectToGridCells(topLeftX, topLeftY, width, height);
        if (cells.some(c => c.x === gridX && c.y === gridY)) {
          return `${furniture.type || 'furniture'} blocks the path`;
        }
      }
    }

    // Out of bounds
    const mapWidth = this.mapData.bounds?.width || this.mapData.width || 1000;
    const mapHeight = this.mapData.bounds?.height || this.mapData.height || 800;

    if (gridX < 0 || gridY < 0 ||
        gridX * this.gridSize >= mapWidth ||
        gridY * this.gridSize >= mapHeight) {
      return 'the map boundary';
    }

    return 'an obstacle blocks the path';
  }

  /**
   * Find path between two points using A* pathfinding
   * @param {Position} fromPos - Starting position
   * @param {Position} toPos - Target position
   * @returns {Object} Path result with validity and path array
   */
  findPath(fromPos, toPos) {
    const start = this.pixelToGrid(fromPos.x, fromPos.y);
    const end = this.pixelToGrid(toPos.x, toPos.y);

    const path = this.aStar(
      { x: start.gridX, y: start.gridY },
      { x: end.gridX, y: end.gridY }
    );

    if (!path || path.length === 0) {
      return {
        valid: false,
        reason: 'no path found',
        path: []
      };
    }

    // Convert grid path to pixel path
    const pixelPath = path.map(p => ({
      x: p.x * this.gridSize + this.gridSize / 2,
      y: p.y * this.gridSize + this.gridSize / 2,
      gridX: p.x,
      gridY: p.y
    }));

    return {
      valid: true,
      path: pixelPath,
      distance: path.length,
      estimatedTime: Math.ceil(path.length * 0.5) // 0.5 minutes per grid cell
    };
  }

  /**
   * A* pathfinding algorithm
   * @param {Object} start - Start grid position {x, y}
   * @param {Object} end - End grid position {x, y}
   * @returns {Array|null} Path as array of grid positions, or null if no path
   */
  aStar(start, end) {
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(`${start.x},${start.y}`, 0);
    fScore.set(`${start.x},${start.y}`, this.heuristic(start, end));

    while (openSet.length > 0) {
      // Get node with lowest fScore
      openSet.sort((a, b) => {
        const aScore = fScore.get(`${a.x},${a.y}`) || Infinity;
        const bScore = fScore.get(`${b.x},${b.y}`) || Infinity;
        return aScore - bScore;
      });

      const current = openSet.shift();

      // Reached goal
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(cameFrom, current);
      }

      // Check neighbors (4-directional movement)
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const neighbor of neighbors) {
        if (!this.isWalkable(neighbor.x, neighbor.y)) continue;

        const tentativeGScore = (gScore.get(`${current.x},${current.y}`) || Infinity) + 1;

        if (tentativeGScore < (gScore.get(`${neighbor.x},${neighbor.y}`) || Infinity)) {
          cameFrom.set(`${neighbor.x},${neighbor.y}`, current);
          gScore.set(`${neighbor.x},${neighbor.y}`, tentativeGScore);
          fScore.set(`${neighbor.x},${neighbor.y}`, tentativeGScore + this.heuristic(neighbor, end));

          if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return null; // No path found
  }

  /**
   * Manhattan distance heuristic for A*
   * @param {Object} a - Point A
   * @param {Object} b - Point B
   * @returns {number} Manhattan distance
   */
  heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  /**
   * Reconstruct path from A* cameFrom map
   * @param {Map} cameFrom - A* came from map
   * @param {Object} current - Current position
   * @returns {Array} Path array
   */
  reconstructPath(cameFrom, current) {
    const path = [current];
    let key = `${current.x},${current.y}`;

    while (cameFrom.has(key)) {
      current = cameFrom.get(key);
      path.unshift(current);
      key = `${current.x},${current.y}`;
    }

    return path;
  }

  /**
   * Get nearby locations for narrative context
   * @param {Position} position - Current position
   * @param {number} [radius=3] - Search radius in grid cells
   * @returns {Array} Nearby locations with distance and direction
   */
  getNearbyLocations(position, radius = 3) {
    const { gridX, gridY } = this.pixelToGrid(position.x, position.y);
    const nearby = [];

    // Check buildings
    if (this.mapData.buildings) {
      this.mapData.buildings.forEach(building => {
        const buildingCenter = {
          x: building.x + building.width / 2,
          y: building.y + building.height / 2
        };
        const buildingGrid = this.pixelToGrid(buildingCenter.x, buildingCenter.y);
        const distance = Math.abs(gridX - buildingGrid.gridX) +
                        Math.abs(gridY - buildingGrid.gridY);

        if (distance <= radius) {
          nearby.push({
            name: building.name,
            type: building.type,
            distance,
            direction: this.getDirection(gridX, gridY, buildingGrid.gridX, buildingGrid.gridY)
          });
        }
      });
    }

    // Check rooms (interior maps) - add as destinations
    if (this.mapData.rooms) {
      this.mapData.rooms.forEach(room => {
        // Calculate room center from polygon
        if (room.polygon && room.polygon.length > 0) {
          const centerX = room.polygon.reduce((sum, p) => sum + p[0], 0) / room.polygon.length;
          const centerY = room.polygon.reduce((sum, p) => sum + p[1], 0) / room.polygon.length;

          const roomGrid = this.pixelToGrid(centerX, centerY);
          const distance = Math.abs(gridX - roomGrid.gridX) +
                          Math.abs(gridY - roomGrid.gridY);

          if (distance <= radius) {
            nearby.push({
              name: room.name || room.id,
              type: 'room',
              distance,
              direction: this.getDirection(gridX, gridY, roomGrid.gridX, roomGrid.gridY)
            });
          }
        }
      });
    }

    // Check doors (interior maps)
    if (this.mapData.doors) {
      this.mapData.doors.forEach(door => {
        let doorCenter;

        // Handle both door formats: {x1, y1, x2, y2} and {position: [x, y]}
        if (door.position && Array.isArray(door.position)) {
          doorCenter = {
            x: door.position[0],
            y: door.position[1]
          };
        } else if (door.x1 !== undefined && door.y1 !== undefined) {
          doorCenter = {
            x: (door.x1 + door.x2) / 2,
            y: (door.y1 + door.y2) / 2
          };
        } else {
          // Skip doors without proper position data
          return;
        }

        const doorGrid = this.pixelToGrid(doorCenter.x, doorCenter.y);
        const distance = Math.abs(gridX - doorGrid.gridX) +
                        Math.abs(gridY - doorGrid.gridY);

        if (distance <= radius) {
          // Format name: "Laboratory" instead of "lab-door"
          let displayName = door.to || door.id || 'door';
          if (displayName === 'shop-floor') displayName = 'Shop Floor';
          else if (displayName === 'laboratory') displayName = 'Laboratory';
          else if (displayName === 'bedroom') displayName = 'Bedroom';
          else if (displayName === 'street') displayName = 'Street';

          nearby.push({
            name: displayName,
            type: 'door',
            distance,
            direction: this.getDirection(gridX, gridY, doorGrid.gridX, doorGrid.gridY),
            locked: door.isLocked || door.locked
          });
        }
      });
    }

    return nearby.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get cardinal direction from one point to another
   * @param {number} fromX - From grid x
   * @param {number} fromY - From grid y
   * @param {number} toX - To grid x
   * @param {number} toY - To grid y
   * @returns {string} Direction description
   */
  getDirection(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'to the east' : 'to the west';
    } else {
      return dy > 0 ? 'to the south' : 'to the north';
    }
  }

  /**
   * Get all valid movement options from current position
   * @param {Position} position - Current position
   * @returns {Object} Movement options for each direction
   */
  getMovementOptions(position) {
    const options = {};

    ['north', 'south', 'east', 'west'].forEach(direction => {
      const validation = this.validateMove(position, direction);
      options[direction] = {
        valid: validation.valid,
        reason: validation.reason
      };
    });

    return options;
  }

  /**
   * Detect which room the player is currently in (for interior maps)
   * @param {Position} position - Player position {x, y} in pixels
   * @returns {Object|null} Room object {id, name, type} or null if not in any room
   */
  getCurrentRoom(position) {
    // Only works for interior maps with room definitions
    if (this.mapData.type !== 'interior' || !this.mapData.rooms) {
      return null;
    }

    const pixelX = position.x;
    const pixelY = position.y;

    // Test each room polygon
    for (const room of this.mapData.rooms) {
      if (this.isPointInPolygon([pixelX, pixelY], room.polygon)) {
        return {
          id: room.id,
          name: room.name,
          type: room.type || 'room'
        };
      }
    }

    // Not inside any room (in a wall or doorway)
    return null;
  }

  /**
   * Point-in-polygon test using ray casting algorithm
   * @param {Array} point - [x, y] point to test
   * @param {Array} polygon - Array of [x, y] polygon vertices
   * @returns {boolean} True if point is inside polygon
   */
  isPointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Fill a polygon with grid cells using scanline algorithm
   * @param {Array} polygon - Array of [x, y] points
   * @returns {Array} Array of {x, y} grid cells inside polygon
   */
  polygonToGridCells(polygon) {
    const cells = [];

    // Find bounding box
    const minX = Math.min(...polygon.map(p => p[0]));
    const maxX = Math.max(...polygon.map(p => p[0]));
    const minY = Math.min(...polygon.map(p => p[1]));
    const maxY = Math.max(...polygon.map(p => p[1]));

    // Convert to grid coordinates
    const gridMinX = Math.floor(minX / this.gridSize);
    const gridMaxX = Math.ceil(maxX / this.gridSize);
    const gridMinY = Math.floor(minY / this.gridSize);
    const gridMaxY = Math.ceil(maxY / this.gridSize);

    // Test each cell in bounding box
    for (let gx = gridMinX; gx <= gridMaxX; gx++) {
      for (let gy = gridMinY; gy <= gridMaxY; gy++) {
        const centerX = gx * this.gridSize + this.gridSize / 2;
        const centerY = gy * this.gridSize + this.gridSize / 2;

        if (this.isPointInPolygon([centerX, centerY], polygon)) {
          cells.push({ x: gx, y: gy });
        }
      }
    }

    return cells;
  }

  /**
   * Convert rectangle to grid cells
   * @param {number} x - Rectangle x
   * @param {number} y - Rectangle y
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @returns {Array} Array of grid cells
   */
  rectToGridCells(x, y, width, height) {
    const cells = [];
    const startX = Math.floor(x / this.gridSize);
    const startY = Math.floor(y / this.gridSize);
    const endX = Math.floor((x + width) / this.gridSize);
    const endY = Math.floor((y + height) / this.gridSize);

    for (let gx = startX; gx <= endX; gx++) {
      for (let gy = startY; gy <= endY; gy++) {
        cells.push({ x: gx, y: gy });
      }
    }

    return cells;
  }

  /**
   * Convert line to grid cells using Bresenham's algorithm
   * @param {number} x1 - Start x
   * @param {number} y1 - Start y
   * @param {number} x2 - End x
   * @param {number} y2 - End y
   * @returns {Array} Array of grid cells along the line
   */
  lineToGridCells(x1, y1, x2, y2) {
    const cells = [];

    let currentX = Math.floor(x1 / this.gridSize);
    let currentY = Math.floor(y1 / this.gridSize);
    const endX = Math.floor(x2 / this.gridSize);
    const endY = Math.floor(y2 / this.gridSize);

    const dx = Math.abs(endX - currentX);
    const dy = Math.abs(endY - currentY);
    const sx = currentX < endX ? 1 : -1;
    const sy = currentY < endY ? 1 : -1;
    let err = dx - dy;

    while (true) {
      cells.push({ x: currentX, y: currentY });

      if (currentX === endX && currentY === endY) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        currentX += sx;
      }
      if (e2 < dx) {
        err += dx;
        currentY += sy;
      }
    }

    return cells;
  }
}

/**
 * Singleton grid system manager
 * Maintains one GridMovementSystem per map
 */
const gridSystems = new Map();

/**
 * Get or create a grid system for a map
 * @param {string} mapId - Map identifier
 * @param {Object} mapData - Map configuration
 * @returns {GridMovementSystem}
 */
export function getGridSystem(mapId, mapData) {
  // Cache key includes map dimensions to handle race conditions
  // where same mapId is accessed with different data (interior vs exterior)
  const cacheKey = `${mapId}-${mapData.bounds.width}x${mapData.bounds.height}`;

  if (!gridSystems.has(cacheKey)) {
    gridSystems.set(cacheKey, new GridMovementSystem(mapData));
  }
  return gridSystems.get(cacheKey);
}

/**
 * Clear all cached grid systems (useful for map updates)
 */
export function clearGridSystems() {
  gridSystems.clear();
}

export default GridMovementSystem;
