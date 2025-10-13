// bodyPositionMapper.js
// Simple utility to map anatomical location strings to SVG body diagram coordinates
// This is purely presentation layer - medical data (severity, type) belongs in EntityList

/**
 * Maps anatomical locations to SVG body diagram coordinates
 * SVG viewBox is 140x260, origin at top-left
 */
const LOCATION_POSITIONS = {
  // Head region
  'head': { x: 70, y: 24 },
  'cranium': { x: 70, y: 24 },
  'eyes': { x: 70, y: 24 },
  'eye': { x: 70, y: 24 },
  'face': { x: 70, y: 28 },
  'mouth': { x: 70, y: 32 },
  'jaw': { x: 70, y: 35 },
  'teeth': { x: 70, y: 32 },
  'tongue': { x: 70, y: 32 },
  'throat': { x: 70, y: 42 },
  'neck': { x: 70, y: 50 },

  // Torso
  'chest': { x: 70, y: 75 },
  'breast': { x: 70, y: 72 },
  'lungs': { x: 70, y: 75 },
  'heart': { x: 70, y: 75 },
  'stomach': { x: 70, y: 95 },
  'abdomen': { x: 70, y: 95 },
  'belly': { x: 70, y: 95 },
  'gut': { x: 70, y: 95 },
  'liver': { x: 80, y: 90 },
  'spleen': { x: 60, y: 90 },
  'kidneys': { x: 70, y: 105 },
  'back': { x: 70, y: 85 },
  'spine': { x: 70, y: 85 },
  'ribs': { x: 70, y: 80 },

  // Arms
  'left arm': { x: 26, y: 80 },
  'left hand': { x: 22, y: 113 },
  'left shoulder': { x: 48, y: 58 },
  'right arm': { x: 114, y: 80 },
  'right hand': { x: 118, y: 113 },
  'right shoulder': { x: 92, y: 58 },
  'arms': { x: 70, y: 80 },
  'hands': { x: 70, y: 113 },
  'fingers': { x: 70, y: 113 },
  'wrist': { x: 70, y: 100 },

  // Legs
  'left leg': { x: 54, y: 165 },
  'right leg': { x: 86, y: 165 },
  'legs': { x: 70, y: 165 },
  'left foot': { x: 47, y: 237 },
  'right foot': { x: 90, y: 237 },
  'feet': { x: 70, y: 237 },
  'thigh': { x: 70, y: 150 },
  'knee': { x: 70, y: 190 },
  'ankle': { x: 70, y: 220 },

  // General/whole body
  'whole body': { x: 70, y: 95 },
  'body': { x: 70, y: 95 },
  'general': { x: 70, y: 95 },
  'systemic': { x: 70, y: 95 },
  'skin': { x: 70, y: 95 },
};

/**
 * Get SVG position for an anatomical location
 * @param {string} location - Anatomical location (e.g., "head", "left arm")
 * @returns {{x: number, y: number}} SVG coordinates
 */
export function getPositionForLocation(location) {
  if (!location) return { x: 70, y: 95 }; // Default to center

  const key = location.toLowerCase().trim();

  // Direct match
  if (LOCATION_POSITIONS[key]) {
    return LOCATION_POSITIONS[key];
  }

  // Partial match (e.g., "left arm wound" -> "left arm")
  for (const [loc, pos] of Object.entries(LOCATION_POSITIONS)) {
    if (key.includes(loc)) {
      return pos;
    }
  }

  // Default to center
  return { x: 70, y: 95 };
}
