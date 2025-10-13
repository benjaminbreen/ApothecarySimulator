/**
 * Map Templates - Procedural generation system
 *
 * Templates define generic map structures that can be populated with
 * contextual labels via LLM generation.
 *
 * @module maps/templates
 */

/**
 * Small Colonial House Template
 * Simple 3-room layout for apothecaries, homes, workshops
 */
export const SMALL_COLONIAL_HOUSE = {
  id: 'small-colonial-house',
  name: 'Small Colonial House',
  type: 'interior',
  era: ['colonial', 'baroque', 'early-modern'],
  professions: ['apothecary', 'merchant', 'artisan', 'physician'],
  bounds: {
    width: 800,
    height: 600
  },

  zones: [
    {
      id: 'zone-1',
      labelSlot: 'ROOM_1_NAME',
      defaultLabel: 'Shop Floor',
      category: 'commercial', // For LLM context
      description: 'Main public-facing room for business',
      polygon: [
        [0, 300],
        [800, 300],
        [800, 600],
        [0, 600]
      ],
      type: 'shop-floor',
      suggestedLabels: ['Shop Floor', 'Trading Room', 'Consultation Room', 'Workshop']
    },
    {
      id: 'zone-2',
      labelSlot: 'ROOM_2_NAME',
      defaultLabel: 'Laboratory',
      category: 'workspace',
      description: 'Private work area for production',
      polygon: [
        [400, 0],
        [800, 0],
        [800, 300],
        [400, 300]
      ],
      type: 'laboratory',
      suggestedLabels: ['Laboratory', 'Workshop', 'Study', 'Workroom']
    },
    {
      id: 'zone-3',
      labelSlot: 'ROOM_3_NAME',
      defaultLabel: 'Bedroom',
      category: 'private',
      description: 'Personal living quarters',
      polygon: [
        [0, 0],
        [400, 0],
        [400, 300],
        [0, 300]
      ],
      type: 'bedroom',
      suggestedLabels: ['Bedroom', 'Sleeping Quarters', 'Private Chambers', 'Living Quarters']
    }
  ],

  doors: [
    {
      id: 'main-entrance',
      from: 'street',
      to: 'zone-1',
      position: [300, 600],
      rotation: 0,
      isLocked: false
    },
    {
      id: 'lab-door',
      from: 'zone-1',
      to: 'zone-2',
      position: [600, 300],
      rotation: 0,
      isLocked: false
    },
    {
      id: 'bedroom-door',
      from: 'zone-1',
      to: 'zone-3',
      position: [200, 300],
      rotation: 0,
      isLocked: false
    },
    {
      id: 'connecting-door',
      from: 'zone-3',
      to: 'zone-2',
      position: [400, 150],
      rotation: 90,
      isLocked: false
    },
    {
      id: 'back-door',
      from: 'zone-3',
      to: 'alley',
      position: [100, 0],
      rotation: 0,
      isLocked: true
    }
  ],

  furnitureSlots: [
    // Shop floor
    { zone: 'zone-1', type: 'counter', position: [300, 400], size: [220, 50] },
    { zone: 'zone-1', type: 'shelf', position: [30, 350], size: [60, 240] },
    { zone: 'zone-1', type: 'shelf', position: [770, 350], size: [60, 240] },
    { zone: 'zone-1', type: 'chair', position: [400, 520] },
    // Laboratory
    { zone: 'zone-2', type: 'table', position: [600, 150], size: [250, 100] },
    { zone: 'zone-2', type: 'shelf', position: [760, 40], size: [60, 220] },
    { zone: 'zone-2', type: 'chest', position: [450, 50], size: [70, 70] },
    { zone: 'zone-2', type: 'table', position: [450, 220], size: [70, 50] },
    // Bedroom
    { zone: 'zone-3', type: 'bed', position: [200, 100], size: [160, 100] },
    { zone: 'zone-3', type: 'chest', position: [50, 240], size: [50, 50] },
    { zone: 'zone-3', type: 'table', position: [320, 30], size: [70, 50] }
  ]
};

/**
 * Baroque City Grid Template
 * Generic city map with central plaza and surrounding buildings
 */
export const BAROQUE_CITY_GRID = {
  id: 'baroque-city-grid',
  name: 'Baroque City Grid',
  type: 'exterior',
  era: ['baroque', 'colonial', 'early-modern'],
  bounds: {
    width: 1200,
    height: 900
  },

  zones: [
    // Central landmark
    {
      id: 'central-landmark',
      labelSlot: 'CENTRAL_LANDMARK',
      defaultLabel: 'Cathedral',
      category: 'religious',
      description: 'Main religious or government building',
      polygon: [
        [475, 350],
        [725, 350],
        [725, 550],
        [475, 550]
      ],
      suggestedLabels: ['Cathedral', 'Church', 'Palace', 'Government Building']
    },
    // Northwest building
    {
      id: 'nw-building',
      labelSlot: 'NW_BUILDING',
      defaultLabel: 'Marketplace',
      category: 'commercial',
      description: 'Northwestern commercial district',
      polygon: [
        [50, 50],
        [350, 50],
        [350, 250],
        [50, 250]
      ],
      suggestedLabels: ['Marketplace', 'Market Square', 'Trading Post', 'Merchants Quarter']
    },
    // Northeast building
    {
      id: 'ne-building',
      labelSlot: 'NE_BUILDING',
      defaultLabel: 'Hospital',
      category: 'medical',
      description: 'Northeastern institutional building',
      polygon: [
        [850, 50],
        [1150, 50],
        [1150, 250],
        [850, 250]
      ],
      suggestedLabels: ['Hospital', 'Infirmary', 'Monastery', 'University']
    },
    // Southwest building
    {
      id: 'sw-building',
      labelSlot: 'SW_BUILDING',
      defaultLabel: 'Residential Quarter',
      category: 'residential',
      description: 'Southwestern residential district',
      polygon: [
        [50, 650],
        [350, 650],
        [350, 850],
        [50, 850]
      ],
      suggestedLabels: ['Residential Quarter', 'Housing', 'Tenements', 'Workers District']
    },
    // Southeast building
    {
      id: 'se-building',
      labelSlot: 'SE_BUILDING',
      defaultLabel: 'Barracks',
      category: 'military',
      description: 'Southeastern security/military building',
      polygon: [
        [850, 650],
        [1150, 650],
        [1150, 850],
        [850, 850]
      ],
      suggestedLabels: ['Barracks', 'Garrison', 'Fort', 'Watch House']
    }
  ],

  streets: [
    // Main horizontal streets
    {
      id: 'main-east-west',
      points: [[0, 450], [1200, 450]],
      width: 30,
      type: 'main',
      nameSlot: 'MAIN_STREET'
    },
    // Main vertical street
    {
      id: 'main-north-south',
      points: [[600, 0], [600, 900]],
      width: 30,
      type: 'main',
      nameSlot: 'CROSS_STREET'
    },
    // Side streets
    {
      id: 'north-street',
      points: [[0, 150], [1200, 150]],
      width: 20,
      type: 'side'
    },
    {
      id: 'south-street',
      points: [[0, 750], [1200, 750]],
      width: 20,
      type: 'side'
    },
    {
      id: 'west-street',
      points: [[200, 0], [200, 900]],
      width: 20,
      type: 'side'
    },
    {
      id: 'east-street',
      points: [[1000, 0], [1000, 900]],
      width: 20,
      type: 'side'
    }
  ],

  landmarks: []
};

/**
 * All available templates indexed by ID
 */
export const MAP_TEMPLATES = {
  'small-colonial-house': SMALL_COLONIAL_HOUSE,
  'baroque-city-grid': BAROQUE_CITY_GRID
};

/**
 * Get a template by ID
 * @param {string} templateId - Template identifier
 * @returns {Object|null} Template definition or null if not found
 */
export function getTemplate(templateId) {
  return MAP_TEMPLATES[templateId] || null;
}

/**
 * Get all templates matching criteria
 * @param {Object} criteria - Filter criteria
 * @param {string} [criteria.type] - 'interior' or 'exterior'
 * @param {string} [criteria.era] - Historical era
 * @param {string} [criteria.profession] - Character profession
 * @returns {Array} Matching templates
 */
export function findTemplates(criteria = {}) {
  return Object.values(MAP_TEMPLATES).filter(template => {
    if (criteria.type && template.type !== criteria.type) return false;
    if (criteria.era && template.era && !template.era.includes(criteria.era)) return false;
    if (criteria.profession && template.professions && !template.professions.includes(criteria.profession)) return false;
    return true;
  });
}

export default MAP_TEMPLATES;
