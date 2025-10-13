/**
 * Label Collision Detection Utilities
 * Helps prevent overlapping labels on maps
 */

/**
 * Calculate bounding box for a text label
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} text - Label text
 * @param {number} fontSize - Font size in pixels
 * @param {number} rotation - Rotation in degrees
 * @returns {Object} Bounding box {x, y, width, height}
 */
export function calculateLabelBounds(x, y, text, fontSize = 18, rotation = 0) {
  // Approximate character width (varies by font, using average)
  const charWidth = fontSize * 0.6;
  const width = text.length * charWidth;
  const height = fontSize * 1.4; // Include line-height
  const padding = 8; // Extra padding for background

  if (rotation !== 0) {
    // For rotated labels, swap dimensions
    return {
      x: x - height / 2 - padding,
      y: y - width / 2 - padding,
      width: height + padding * 2,
      height: width + padding * 2
    };
  }

  return {
    x: x - width / 2 - padding,
    y: y - height / 2 - padding,
    width: width + padding * 2,
    height: height + padding * 2
  };
}

/**
 * Check if two bounding boxes overlap
 * @param {Object} box1 - First bounding box
 * @param {Object} box2 - Second bounding box
 * @returns {boolean} True if boxes overlap
 */
export function boxesOverlap(box1, box2) {
  return !(
    box1.x + box1.width < box2.x ||
    box2.x + box2.width < box1.x ||
    box1.y + box1.height < box2.y ||
    box2.y + box2.height < box1.y
  );
}

/**
 * Filter labels to prevent overlaps based on priority
 * @param {Array} labels - Array of label objects with {x, y, text, fontSize, rotation, priority}
 * @param {number} zoom - Current zoom level
 * @returns {Array} Filtered labels that should be displayed
 */
export function filterOverlappingLabels(labels, zoom = 1) {
  // Sort by priority (lower number = higher priority)
  const sortedLabels = [...labels].sort((a, b) => {
    // Always show player location first
    if (a.isPlayerLocation) return -1;
    if (b.isPlayerLocation) return 1;
    // Always show hovered items
    if (a.isHovered) return -1;
    if (b.isHovered) return 1;
    // Then by priority
    return (a.priority || 5) - (b.priority || 5);
  });

  const visibleLabels = [];
  const occupiedBounds = [];

  // Zoom-based filtering
  const maxPriorityToShow = getMaxPriorityForZoom(zoom);

  for (const label of sortedLabels) {
    // Skip labels that are too low priority for current zoom
    if ((label.priority || 5) > maxPriorityToShow && !label.alwaysShowLabel && !label.isHovered && !label.isPlayerLocation) {
      continue;
    }

    const bounds = calculateLabelBounds(
      label.x,
      label.y,
      label.text,
      label.fontSize || 18,
      label.rotation || 0
    );

    // Check if this label overlaps with any already visible labels
    const hasCollision = occupiedBounds.some(occupied => boxesOverlap(bounds, occupied));

    if (!hasCollision || label.isPlayerLocation || label.isHovered || label.alwaysShowLabel) {
      visibleLabels.push(label);
      occupiedBounds.push(bounds);
    }
  }

  return visibleLabels;
}

/**
 * Get maximum priority level to show at current zoom
 * Lower priority numbers (1-3) = more important, shown first
 * Higher priority numbers (4+) = less important, shown only when zoomed
 * @param {number} zoom - Current zoom level
 * @returns {number} Maximum priority to display
 */
function getMaxPriorityForZoom(zoom) {
  if (zoom >= 2.5) return 10; // Show everything
  if (zoom >= 2.0) return 7;  // Show most labels
  if (zoom >= 1.5) return 5;  // Show main + some secondary
  if (zoom >= 1.0) return 4;  // Show main labels only
  return 3; // Default: show only most important
}
