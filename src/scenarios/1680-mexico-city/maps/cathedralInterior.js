/**
 * Interior map: Catedral Metropolitana
 * Large cross-shaped cathedral with nave, transepts, sanctuary, and sacristy
 * Grand religious space under construction in 1680
 *
 * @type {import('../../../core/types/map.types').InteriorMapData}
 */
export default {
  id: 'cathedral-interior',
  type: 'interior',
  name: 'Catedral Metropolitana',
  style: 'colonial-interior',
  bounds: {
    width: 1200,
    height: 1000
  },
  startPosition: [600, 850], // Nave near entrance

  // 5 rooms in cross formation
  rooms: [
    // Nave - Main central hall (large vertical rectangle)
    {
      id: 'nave',
      name: 'Nave',
      polygon: [
        [400, 400],
        [800, 400],
        [800, 950],
        [400, 950]
      ],
      type: 'nave',
      spawnPoint: { x: 600, y: 850 }
    },

    // Transept West - Left arm of cross
    {
      id: 'transept-west',
      name: 'West Transept',
      polygon: [
        [50, 350],
        [400, 350],
        [400, 650],
        [50, 650]
      ],
      type: 'transept',
      spawnPoint: { x: 225, y: 500 }
    },

    // Transept East - Right arm of cross
    {
      id: 'transept-east',
      name: 'East Transept',
      polygon: [
        [800, 350],
        [1150, 350],
        [1150, 650],
        [800, 650]
      ],
      type: 'transept',
      spawnPoint: { x: 975, y: 500 }
    },

    // Sanctuary/Altar - Top of cross (holy of holies)
    {
      id: 'sanctuary',
      name: 'Sanctuary',
      polygon: [
        [400, 50],
        [800, 50],
        [800, 400],
        [400, 400]
      ],
      type: 'sanctuary',
      spawnPoint: { x: 600, y: 250 }
    },

    // Sacristy - Priest preparation room (off to side)
    {
      id: 'sacristy',
      name: 'Sacristy',
      polygon: [
        [850, 50],
        [1100, 50],
        [1100, 300],
        [850, 300]
      ],
      type: 'sacristy',
      spawnPoint: { x: 975, y: 175 }
    }
  ],

  // Doors connecting the cross
  doors: [
    // Main entrance to nave from street
    {
      id: 'main-entrance',
      from: 'street',
      to: 'nave',
      position: [570, 950],
      width: 100,
      rotation: 0,
      isLocked: false
    },

    // Nave to west transept
    {
      id: 'nave-to-west',
      from: 'nave',
      to: 'transept-west',
      position: [400, 500],
      width: 80,
      rotation: 90,
      isLocked: false
    },

    // Nave to east transept
    {
      id: 'nave-to-east',
      from: 'nave',
      to: 'transept-east',
      position: [800, 500],
      width: 80,
      rotation: 90,
      isLocked: false
    },

    // Nave to sanctuary (no physical door, open passage)
    {
      id: 'nave-to-sanctuary',
      from: 'nave',
      to: 'sanctuary',
      position: [600, 400],
      width: 120,
      rotation: 0,
      isLocked: false
    },

    // Sanctuary to sacristy (priests only)
    {
      id: 'sanctuary-to-sacristy',
      from: 'sanctuary',
      to: 'sacristy',
      position: [850, 175],
      width: 60,
      rotation: 90,
      isLocked: false
    }
  ],

  // Religious furniture and fixtures
  furniture: [
    // === NAVE - Pews and central aisle ===
    {
      id: 'pew-row-1-left',
      name: 'Pew',
      type: 'furniture',
      position: [460, 700],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'pew-row-1-right',
      name: 'Pew',
      type: 'furniture',
      position: [620, 700],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'pew-row-2-left',
      name: 'Pew',
      type: 'furniture',
      position: [460, 600],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'pew-row-2-right',
      name: 'Pew',
      type: 'furniture',
      position: [620, 600],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'pew-row-3-left',
      name: 'Pew',
      type: 'furniture',
      position: [460, 500],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'pew-row-3-right',
      name: 'Pew',
      type: 'furniture',
      position: [620, 500],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'baptismal-font',
      name: 'Baptismal Font',
      type: 'furniture',
      position: [720, 880],
      rotation: 0,
      size: [60, 60]
    },

    // === SANCTUARY - Altar and religious items ===
    {
      id: 'main-altar',
      name: 'Main Altar',
      type: 'table',
      position: [600, 120],
      rotation: 0,
      size: [200, 100]
    },
    {
      id: 'altar-candles-left',
      name: 'Candles',
      type: 'decoration',
      position: [500, 140],
      rotation: 0,
      size: [30, 30]
    },
    {
      id: 'altar-candles-right',
      name: 'Candles',
      type: 'decoration',
      position: [700, 140],
      rotation: 0,
      size: [30, 30]
    },
    {
      id: 'pulpit',
      name: 'Pulpit',
      type: 'furniture',
      position: [720, 320],
      rotation: 0,
      size: [70, 70]
    },

    // === TRANSEPT WEST - Side chapel ===
    {
      id: 'west-side-altar',
      name: 'Side Altar',
      type: 'table',
      position: [100, 400],
      rotation: 0,
      size: [120, 60]
    },
    {
      id: 'west-religious-painting',
      name: 'Religious Painting',
      type: 'decoration',
      position: [80, 500],
      rotation: 0,
      size: [80, 120]
    },

    // === TRANSEPT EAST - Side chapel ===
    {
      id: 'east-side-altar',
      name: 'Side Altar',
      type: 'table',
      position: [980, 400],
      rotation: 0,
      size: [120, 60]
    },
    {
      id: 'confessional-booth',
      name: 'Confessional Booth',
      type: 'furniture',
      position: [1050, 550],
      rotation: 0,
      size: [80, 80]
    },

    // === SACRISTY - Priest preparation room ===
    {
      id: 'vestment-chest',
      name: 'Vestment Chest',
      type: 'chest',
      position: [920, 100],
      rotation: 0,
      size: [100, 70]
    },
    {
      id: 'sacristy-table',
      name: 'Preparation Table',
      type: 'table',
      position: [980, 220],
      rotation: 0,
      size: [120, 60]
    },
    {
      id: 'religious-book-shelf',
      name: 'Book Shelf',
      type: 'shelf',
      position: [1050, 100],
      rotation: 0,
      size: [70, 140]
    }
  ],

  backgroundColor: '#1a1f2e'
};
