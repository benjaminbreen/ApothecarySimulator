/**
 * Interior map: Palacio Virreinal
 * Seat of the Viceroy of New Spain - 9 grand rooms
 * Layout: 3x3 grid with Throne Room at center, surrounded by offices, chambers, and service rooms
 *
 * @type {import('../../../core/types/map.types').InteriorMapData}
 */
export default {
  id: 'palacio-interior',
  type: 'interior',
  name: 'Palacio Virreinal',
  style: 'colonial-interior',
  bounds: {
    width: 1400,
    height: 1000
  },
  startPosition: [700, 850], // Reception hall near entrance

  // 9 rooms - 3x3 grid layout
  rooms: [
    // === TOP ROW (left to right) ===
    // Library - Top left
    {
      id: 'library',
      name: 'Library',
      polygon: [
        [50, 50],
        [466, 50],
        [466, 350],
        [50, 350]
      ],
      type: 'library',
      spawnPoint: { x: 258, y: 200 }
    },

    // Viceroy's Study - Top center
    {
      id: 'viceroy-study',
      name: "Viceroy's Study",
      polygon: [
        [466, 50],
        [934, 50],
        [934, 350],
        [466, 350]
      ],
      type: 'study',
      spawnPoint: { x: 700, y: 200 }
    },

    // Council Chamber - Top right
    {
      id: 'council-chamber',
      name: 'Council Chamber',
      polygon: [
        [934, 50],
        [1350, 50],
        [1350, 350],
        [934, 350]
      ],
      type: 'council',
      spawnPoint: { x: 1142, y: 200 }
    },

    // === MIDDLE ROW (left to right) ===
    // West Entrance - Middle left
    {
      id: 'west-entrance',
      name: 'West Entrance',
      polygon: [
        [50, 350],
        [466, 350],
        [466, 650],
        [50, 650]
      ],
      type: 'entrance',
      spawnPoint: { x: 258, y: 500 }
    },

    // Audience Chamber - Middle center (main throne room)
    {
      id: 'audience-chamber',
      name: 'Audience Chamber',
      polygon: [
        [466, 350],
        [934, 350],
        [934, 650],
        [466, 650]
      ],
      type: 'throne-room',
      spawnPoint: { x: 700, y: 500 }
    },

    // Anteroom - Middle right
    {
      id: 'anteroom',
      name: 'Anteroom',
      polygon: [
        [934, 350],
        [1350, 350],
        [1350, 650],
        [934, 650]
      ],
      type: 'anteroom',
      spawnPoint: { x: 1142, y: 500 }
    },

    // === BOTTOM ROW (left to right) ===
    // Guard Room - Bottom left
    {
      id: 'guard-room',
      name: 'Guard Room',
      polygon: [
        [50, 650],
        [466, 650],
        [466, 950],
        [50, 950]
      ],
      type: 'guard',
      spawnPoint: { x: 258, y: 800 }
    },

    // Entry Hall - Bottom center (main entrance)
    {
      id: 'entry-hall',
      name: 'Entry Hall',
      polygon: [
        [466, 650],
        [934, 650],
        [934, 950],
        [466, 950]
      ],
      type: 'entrance',
      spawnPoint: { x: 700, y: 850 }
    },

    // Waiting Area - Bottom right
    {
      id: 'waiting-area',
      name: 'Waiting Area',
      polygon: [
        [934, 650],
        [1350, 650],
        [1350, 950],
        [934, 950]
      ],
      type: 'waiting',
      spawnPoint: { x: 1142, y: 800 }
    }
  ],

  // Doors connecting the 9 rooms in 3x3 grid
  doors: [
    // === MAIN ENTRANCE ===
    {
      id: 'main-entrance',
      from: 'street',
      to: 'entry-hall',
      position: [700, 950],
      width: 100,
      rotation: 0,
      isLocked: false
    },

    // === BOTTOM ROW CONNECTIONS ===
    {
      id: 'entry-to-guard',
      from: 'entry-hall',
      to: 'guard-room',
      position: [466, 800],
      width: 60,
      rotation: 90,
      isLocked: false
    },
    {
      id: 'entry-to-waiting',
      from: 'entry-hall',
      to: 'waiting-area',
      position: [934, 800],
      width: 60,
      rotation: 90,
      isLocked: false
    },

    // === VERTICAL CONNECTIONS (bottom to middle row) ===
    {
      id: 'guard-to-west-entrance',
      from: 'guard-room',
      to: 'west-entrance',
      position: [258, 650],
      width: 60,
      rotation: 0,
      isLocked: false
    },
    {
      id: 'entry-to-audience',
      from: 'entry-hall',
      to: 'audience-chamber',
      position: [700, 650],
      width: 80,
      rotation: 0,
      isLocked: false
    },
    {
      id: 'waiting-to-anteroom',
      from: 'waiting-area',
      to: 'anteroom',
      position: [1142, 650],
      width: 60,
      rotation: 0,
      isLocked: false
    },

    // === MIDDLE ROW CONNECTIONS ===
    {
      id: 'west-to-audience',
      from: 'west-entrance',
      to: 'audience-chamber',
      position: [466, 500],
      width: 60,
      rotation: 90,
      isLocked: false
    },
    {
      id: 'audience-to-anteroom',
      from: 'audience-chamber',
      to: 'anteroom',
      position: [934, 500],
      width: 60,
      rotation: 90,
      isLocked: false
    },

    // === VERTICAL CONNECTIONS (middle to top row) ===
    {
      id: 'west-to-library',
      from: 'west-entrance',
      to: 'library',
      position: [258, 350],
      width: 60,
      rotation: 0,
      isLocked: false
    },
    {
      id: 'audience-to-study',
      from: 'audience-chamber',
      to: 'viceroy-study',
      position: [700, 350],
      width: 80,
      rotation: 0,
      isLocked: false
    },
    {
      id: 'anteroom-to-council',
      from: 'anteroom',
      to: 'council-chamber',
      position: [1142, 350],
      width: 60,
      rotation: 0,
      isLocked: false
    },

    // === TOP ROW CONNECTIONS ===
    {
      id: 'library-to-study',
      from: 'library',
      to: 'viceroy-study',
      position: [466, 200],
      width: 60,
      rotation: 90,
      isLocked: false
    },
    {
      id: 'study-to-council',
      from: 'viceroy-study',
      to: 'council-chamber',
      position: [934, 200],
      width: 60,
      rotation: 90,
      isLocked: false
    }
  ],

  // Furniture for each room - simplified, only key pieces visible in background
  furniture: [
    // === LIBRARY (top left) ===
    {
      id: 'library-bookshelf',
      name: 'Bookshelf',
      type: 'shelf',
      position: [258, 180],
      rotation: 0,
      size: [300, 200]
    },

    // === VICEROY'S STUDY (top center) ===
    {
      id: 'study-desk-west',
      name: 'Desk',
      type: 'table',
      position: [550, 180],
      rotation: 0,
      size: [140, 100]
    },
    {
      id: 'study-desk-east',
      name: 'Desk',
      type: 'table',
      position: [850, 180],
      rotation: 0,
      size: [140, 100]
    },

    // === COUNCIL CHAMBER (top right) ===
    {
      id: 'council-table',
      name: 'Council Table',
      type: 'table',
      position: [1142, 200],
      rotation: 0,
      size: [320, 180]
    },

    // === AUDIENCE CHAMBER (middle center - throne room) ===
    {
      id: 'viceregal-throne',
      name: 'Viceregal Throne',
      type: 'chair',
      position: [700, 450],
      rotation: 0,
      size: [140, 120]
    },

    // === GUARD ROOM (bottom left) ===
    {
      id: 'weapon-rack',
      name: 'Weapon Rack',
      type: 'furniture',
      position: [258, 710],
      rotation: 0,
      size: [200, 50]
    },
    {
      id: 'guard-table',
      name: 'Guard Table',
      type: 'table',
      position: [200, 850],
      rotation: 0,
      size: [120, 70]
    }
  ],

  backgroundColor: '#1a1f2e'
};
