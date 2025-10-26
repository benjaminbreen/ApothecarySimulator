/**
 * Position Validation Utilities
 * Provides helper functions for position coordinate handling
 */

const GRID_SIZE = 20; // Standard grid size (pixels per cell)

/**
 * Validate and normalize a position object
 * Auto-computes grid coordinates if missing
 *
 * @param {Object} position - Raw position data { x, y, gridX?, gridY? }
 * @returns {Object} Normalized position with all 4 coordinates
 * @throws {Error} If position is invalid
 */
export function normalizePosition(position) {
  if (!position || typeof position !== 'object') {
    throw new Error('Position must be an object');
  }

  if (typeof position.x !== 'number' || typeof position.y !== 'number') {
    throw new Error('Position must have numeric x and y coordinates');
  }

  if (isNaN(position.x) || isNaN(position.y)) {
    throw new Error('Position coordinates cannot be NaN');
  }

  const normalized = {
    x: position.x,
    y: position.y,
    gridX: position.gridX ?? Math.floor(position.x / GRID_SIZE),
    gridY: position.gridY ?? Math.floor(position.y / GRID_SIZE)
  };

  if (isNaN(normalized.gridX) || isNaN(normalized.gridY)) {
    throw new Error('Grid coordinates cannot be NaN');
  }

  return normalized;
}

/**
 * Check if position grid coordinates match pixel coordinates
 * Used for debugging position consistency
 *
 * @param {Object} position - Position to check { x, y, gridX, gridY }
 * @returns {boolean} True if grid coords match pixel coords
 */
export function isPositionValid(position) {
  const expectedGridX = Math.floor(position.x / GRID_SIZE);
  const expectedGridY = Math.floor(position.y / GRID_SIZE);

  return position.gridX === expectedGridX && position.gridY === expectedGridY;
}

/**
 * Convert pixel coordinates to grid coordinates
 *
 * @param {number} x - Pixel x coordinate
 * @param {number} y - Pixel y coordinate
 * @returns {Object} { gridX, gridY }
 */
export function pixelsToGrid(x, y) {
  return {
    gridX: Math.floor(x / GRID_SIZE),
    gridY: Math.floor(y / GRID_SIZE)
  };
}

/**
 * Convert grid coordinates to pixel coordinates (center of cell)
 *
 * @param {number} gridX - Grid x coordinate
 * @param {number} gridY - Grid y coordinate
 * @returns {Object} { x, y }
 */
export function gridToPixels(gridX, gridY) {
  return {
    x: gridX * GRID_SIZE + GRID_SIZE / 2,
    y: gridY * GRID_SIZE + GRID_SIZE / 2
  };
}

/**
 * Create a complete position object from minimal data
 * Supports partial input (pixel-only or grid-only)
 *
 * @param {Object} input - Partial position { x?, y?, gridX?, gridY? }
 * @returns {Object} Complete position { x, y, gridX, gridY }
 */
export function createPosition(input) {
  // If we have pixels, compute grid from pixels
  if (input.x !== undefined && input.y !== undefined) {
    return normalizePosition(input);
  }

  // If we have grid, compute pixels from grid
  if (input.gridX !== undefined && input.gridY !== undefined) {
    const pixels = gridToPixels(input.gridX, input.gridY);
    return {
      x: pixels.x,
      y: pixels.y,
      gridX: input.gridX,
      gridY: input.gridY
    };
  }

  throw new Error('Position must have either (x, y) or (gridX, gridY)');
}

/**
 * Get the grid size constant
 * @returns {number} Grid size in pixels
 */
export function getGridSize() {
  return GRID_SIZE;
}
