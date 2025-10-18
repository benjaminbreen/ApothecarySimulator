/**
 * Interior map: Palacio Virreinal
 * Seat of the Viceroy of New Spain - 6 grand rooms
 * Layout: Reception Hall (entry) → Throne Room (center) → surrounding offices/chambers
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

  // 6 rooms - Reception, Throne Room, Council Chamber, Library, Guard Room, Viceroy Office
  rooms: [
    // Reception Hall - Entry point for visitors (bottom center)
    {
      id: 'reception-hall',
      name: 'Reception Hall',
      polygon: [
        [450, 650],
        [950, 650],
        [950, 950],
        [450, 950]
      ],
      type: 'reception',
      spawnPoint: { x: 700, y: 850 }
    },

    // Throne Room - Central power room (middle center)
    {
      id: 'throne-room',
      name: 'Throne Room',
      polygon: [
        [450, 350],
        [950, 350],
        [950, 650],
        [450, 650]
      ],
      type: 'throne-room',
      spawnPoint: { x: 700, y: 500 }
    },

    // Council Chamber - Top right
    {
      id: 'council-chamber',
      name: 'Council Chamber',
      polygon: [
        [950, 50],
        [1350, 50],
        [1350, 350],
        [950, 350]
      ],
      type: 'council',
      spawnPoint: { x: 1150, y: 200 }
    },

    // Viceroy's Office - Top center
    {
      id: 'viceroy-office',
      name: 'Viceroy Office',
      polygon: [
        [450, 50],
        [950, 50],
        [950, 350],
        [450, 350]
      ],
      type: 'office',
      spawnPoint: { x: 700, y: 200 }
    },

    // Library/Archives - Top left
    {
      id: 'library',
      name: 'Library',
      polygon: [
        [50, 50],
        [450, 50],
        [450, 350],
        [50, 350]
      ],
      type: 'library',
      spawnPoint: { x: 250, y: 200 }
    },

    // Guard Room - Bottom left
    {
      id: 'guard-room',
      name: 'Guard Room',
      polygon: [
        [50, 650],
        [450, 650],
        [450, 950],
        [50, 950]
      ],
      type: 'guard',
      spawnPoint: { x: 250, y: 800 }
    }
  ],

  // Doors connecting the rooms
  doors: [
    // Main entrance to reception hall
    {
      id: 'main-entrance',
      from: 'street',
      to: 'reception-hall',
      position: [670, 950],
      width: 100,
      rotation: 0,
      isLocked: false
    },

    // Reception to throne room
    {
      id: 'reception-to-throne',
      from: 'reception-hall',
      to: 'throne-room',
      position: [700, 650],
      width: 80,
      rotation: 0,
      isLocked: false
    },

    // Reception to guard room
    {
      id: 'reception-to-guards',
      from: 'reception-hall',
      to: 'guard-room',
      position: [450, 800],
      width: 60,
      rotation: 90,
      isLocked: false
    },

    // Throne room to viceroy office
    {
      id: 'throne-to-office',
      from: 'throne-room',
      to: 'viceroy-office',
      position: [700, 350],
      width: 80,
      rotation: 0,
      isLocked: false
    },

    // Throne room to library
    {
      id: 'throne-to-library',
      from: 'throne-room',
      to: 'library',
      position: [450, 500],
      width: 60,
      rotation: 90,
      isLocked: false
    },

    // Throne room to council chamber
    {
      id: 'throne-to-council',
      from: 'throne-room',
      to: 'council-chamber',
      position: [950, 200],
      width: 60,
      rotation: 90,
      isLocked: false
    },

    // Viceroy office to library (private passage)
    {
      id: 'office-to-library',
      from: 'viceroy-office',
      to: 'library',
      position: [450, 200],
      width: 60,
      rotation: 90,
      isLocked: false
    },

    // Viceroy office to council chamber (private passage)
    {
      id: 'office-to-council',
      from: 'viceroy-office',
      to: 'council-chamber',
      position: [950, 200],
      width: 60,
      rotation: 90,
      isLocked: false
    }
  ],

  // Furniture for each room
  furniture: [
    // === RECEPTION HALL - Waiting area ===
    {
      id: 'reception-bench-1',
      name: 'Bench',
      type: 'furniture',
      position: [520, 750],
      rotation: 0,
      size: [120, 50]
    },
    {
      id: 'reception-bench-2',
      name: 'Bench',
      type: 'furniture',
      position: [760, 750],
      rotation: 0,
      size: [120, 50]
    },
    {
      id: 'official-portrait',
      name: 'Royal Portrait',
      type: 'decoration',
      position: [690, 680],
      rotation: 0,
      size: [100, 140]
    },

    // === THRONE ROOM - Seat of power ===
    {
      id: 'viceroy-throne',
      name: 'Viceregal Throne',
      type: 'chair',
      position: [700, 400],
      rotation: 0,
      size: [100, 120]
    },
    {
      id: 'throne-canopy',
      name: 'Canopy',
      type: 'decoration',
      position: [700, 370],
      rotation: 0,
      size: [150, 80]
    },
    {
      id: 'royal-seal',
      name: 'Royal Seal of Spain',
      type: 'decoration',
      position: [500, 400],
      rotation: 0,
      size: [80, 80]
    },

    // === VICEROY OFFICE - Private workspace ===
    {
      id: 'viceroy-desk',
      name: 'Viceroy Desk',
      type: 'table',
      position: [700, 150],
      rotation: 0,
      size: [200, 120]
    },
    {
      id: 'office-chair',
      name: 'Office Chair',
      type: 'chair',
      position: [700, 220],
      rotation: 180,
      size: [60, 60]
    },
    {
      id: 'document-cabinet',
      name: 'Document Cabinet',
      type: 'shelf',
      position: [520, 100],
      rotation: 0,
      size: [100, 180]
    },
    {
      id: 'map-of-new-spain',
      name: 'Map of New Spain',
      type: 'decoration',
      position: [850, 120],
      rotation: 0,
      size: [120, 100]
    },

    // === COUNCIL CHAMBER - Meeting room ===
    {
      id: 'council-table',
      name: 'Council Table',
      type: 'table',
      position: [1150, 200],
      rotation: 0,
      size: [300, 150]
    },
    {
      id: 'council-chair-1',
      name: 'Chair',
      type: 'chair',
      position: [1050, 180],
      rotation: 0,
      size: [50, 50]
    },
    {
      id: 'council-chair-2',
      name: 'Chair',
      type: 'chair',
      position: [1250, 180],
      rotation: 0,
      size: [50, 50]
    },
    {
      id: 'council-chair-3',
      name: 'Chair',
      type: 'chair',
      position: [1050, 280],
      rotation: 180,
      size: [50, 50]
    },
    {
      id: 'council-chair-4',
      name: 'Chair',
      type: 'chair',
      position: [1250, 280],
      rotation: 180,
      size: [50, 50]
    },

    // === LIBRARY - Archives and documents ===
    {
      id: 'library-shelf-1',
      name: 'Book Shelf',
      type: 'shelf',
      position: [100, 120],
      rotation: 0,
      size: [80, 200]
    },
    {
      id: 'library-shelf-2',
      name: 'Book Shelf',
      type: 'shelf',
      position: [240, 120],
      rotation: 0,
      size: [80, 200]
    },
    {
      id: 'library-shelf-3',
      name: 'Book Shelf',
      type: 'shelf',
      position: [380, 120],
      rotation: 0,
      size: [80, 200]
    },
    {
      id: 'reading-desk',
      name: 'Reading Desk',
      type: 'table',
      position: [240, 290],
      rotation: 0,
      size: [140, 80]
    },

    // === GUARD ROOM - Security ===
    {
      id: 'guard-table',
      name: 'Guard Table',
      type: 'table',
      position: [250, 800],
      rotation: 0,
      size: [150, 80]
    },
    {
      id: 'weapon-rack',
      name: 'Weapon Rack',
      type: 'furniture',
      position: [120, 720],
      rotation: 0,
      size: [80, 120]
    },
    {
      id: 'guard-chest',
      name: 'Equipment Chest',
      type: 'chest',
      position: [360, 880],
      rotation: 0,
      size: [100, 70]
    }
  ],

  backgroundColor: '#1a1f2e'
};
