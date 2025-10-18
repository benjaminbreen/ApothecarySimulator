/**
 * Interior map: Mercado (Market Hall)
 * Two rows of vendor stalls with central aisle
 * Bustling marketplace for goods, food, and textiles
 *
 * @type {import('../../../core/types/map.types').InteriorMapData}
 */
export default {
  id: 'mercado-interior',
  type: 'interior',
  name: 'Mercado',
  style: 'colonial-interior',
  bounds: {
    width: 1200,
    height: 500
  },
  startPosition: [600, 250], // Center aisle near entrance

  // Three main areas: North stalls, South stalls, Central aisle
  rooms: [
    // Central aisle - main walking area
    {
      id: 'central-aisle',
      name: 'Central Aisle',
      polygon: [
        [50, 180],
        [1150, 180],
        [1150, 320],
        [50, 320]
      ],
      type: 'aisle',
      spawnPoint: { x: 600, y: 250 }
    },

    // North row of stalls
    {
      id: 'north-stalls',
      name: 'North Stalls',
      polygon: [
        [50, 50],
        [1150, 50],
        [1150, 180],
        [50, 180]
      ],
      type: 'market-stalls',
      spawnPoint: { x: 600, y: 115 }
    },

    // South row of stalls
    {
      id: 'south-stalls',
      name: 'South Stalls',
      polygon: [
        [50, 320],
        [1150, 320],
        [1150, 450],
        [50, 450]
      ],
      type: 'market-stalls',
      spawnPoint: { x: 600, y: 385 }
    }
  ],

  // Entrances at both ends of market hall
  doors: [
    // West entrance
    {
      id: 'west-entrance',
      from: 'street',
      to: 'central-aisle',
      position: [50, 240],
      width: 80,
      rotation: 90,
      isLocked: false
    },

    // East entrance
    {
      id: 'east-entrance',
      from: 'street',
      to: 'central-aisle',
      position: [1150, 240],
      width: 80,
      rotation: 90,
      isLocked: false
    }
  ],

  // Vendor stalls and tables
  furniture: [
    // === NORTH ROW - 5 stalls ===
    {
      id: 'north-stall-1',
      name: 'Textile Stall',
      type: 'table',
      position: [150, 110],
      rotation: 0,
      size: [140, 80]
    },
    {
      id: 'north-stall-2',
      name: 'Food Stall',
      type: 'table',
      position: [380, 110],
      rotation: 0,
      size: [140, 80]
    },
    {
      id: 'north-stall-3',
      name: 'Pottery Stall',
      type: 'table',
      position: [610, 110],
      rotation: 0,
      size: [140, 80]
    },
    {
      id: 'north-stall-4',
      name: 'Spice Vendor',
      type: 'table',
      position: [840, 110],
      rotation: 0,
      size: [140, 80]
    },
    {
      id: 'north-stall-5',
      name: 'Tool Vendor',
      type: 'table',
      position: [1070, 110],
      rotation: 0,
      size: [140, 80]
    },

    // === SOUTH ROW - 5 stalls ===
    {
      id: 'south-stall-1',
      name: 'Butcher Stall',
      type: 'table',
      position: [150, 385],
      rotation: 0,
      size: [140, 80]
    },
    {
      id: 'south-stall-2',
      name: 'Vegetable Vendor',
      type: 'table',
      position: [380, 385],
      rotation: 0,
      size: [140, 80]
    },
    {
      id: 'south-stall-3',
      name: 'Leather Goods',
      type: 'table',
      position: [610, 385],
      rotation: 0,
      size: [140, 80]
    },
    {
      id: 'south-stall-4',
      name: 'Basket Weaver',
      type: 'table',
      position: [840, 385],
      rotation: 0,
      size: [140, 80]
    },
    {
      id: 'south-stall-5',
      name: 'Medicinal Herbs',
      type: 'table',
      position: [1070, 385],
      rotation: 0,
      size: [140, 80]
    },

    // === DECORATIVE ELEMENTS - hanging goods, crates ===
    {
      id: 'crate-pile-1',
      name: 'Crates',
      type: 'chest',
      position: [90, 250],
      rotation: 0,
      size: [50, 50]
    },
    {
      id: 'crate-pile-2',
      name: 'Crates',
      type: 'chest',
      position: [1110, 250],
      rotation: 0,
      size: [50, 50]
    }
  ],

  backgroundColor: '#1a1f2e'
};
