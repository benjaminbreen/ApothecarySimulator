/**
 * Interior map: Botica de la Amargura
 * Maria de Lima's apothecary shop
 * Colonial-style layout with shop floor, laboratory, and living quarters
 *
 * @type {import('../../../core/types/map.types').InteriorMapData}
 */
export default {
  id: 'botica-interior',
  type: 'interior',
  name: 'Botica de la Amargura',
  style: 'colonial-interior',
  bounds: {
    width: 1000,  // Increased to add margin around house
    height: 800
  },
  startPosition: [510, 480], // Behind counter on shop floor (grid 25, 31)

  // Rooms - Simplified to 3 larger, clearer spaces with margin around house
  rooms: [
    // Main shop floor - where customers enter (LARGER - full bottom half)
    {
      id: 'shop-floor',
      name: 'Shop Floor',
      polygon: [
        [100, 400],   // Added 100px margin on left, moved down
        [900, 400],
        [900, 700],
        [100, 700]
      ],
      type: 'shop-floor',
      spawnPoint: { x: 510, y: 480 } // Behind counter (default start position)
    },

    // Laboratory - where Maria mixes compounds (Top right)
    {
      id: 'laboratory',
      name: 'Laboratory',
      polygon: [
        [500, 100],   // Added margin
        [900, 100],
        [900, 400],
        [500, 400]
      ],
      type: 'laboratory',
      spawnPoint: { x: 700, y: 250 } // Center of room, near workbench
    },

    // Bedroom - Maria's private quarters (Top left)
    {
      id: 'bedroom',
      name: 'Bedroom',
      polygon: [
        [100, 100],   // Added margin
        [500, 100],
        [500, 400],
        [100, 400]
      ],
      type: 'bedroom',
      spawnPoint: { x: 300, y: 250 } // Center of room, near bed
    }
  ],

  // Doors and connections - Wider doors for better visibility
  doors: [
    // Main entrance from street to shop floor
    {
      id: 'main-entrance',
      from: 'street',
      to: 'shop-floor',
      position: [400, 700],  // Adjusted for new coordinates
      width: 60,             // Much wider door
      rotation: 0,
      isLocked: false
    },

    // Shop floor to laboratory (through dividing wall)
    {
      id: 'lab-door',
      from: 'shop-floor',
      to: 'laboratory',
      position: [700, 400],  // Adjusted for new coordinates
      width: 60,
      rotation: 0,
      isLocked: false
    },

    // Shop floor to bedroom (through dividing wall)
    {
      id: 'bedroom-door',
      from: 'shop-floor',
      to: 'bedroom',
      position: [330, 400],  // Adjusted for new coordinates
      width: 60,
      rotation: 0,
      isLocked: false
    },

    // Bedroom to laboratory (connecting private quarters)
    {
      id: 'bedroom-lab-door',
      from: 'bedroom',
      to: 'laboratory',
      position: [500, 250],  // Adjusted for new coordinates
      width: 60,
      rotation: 90,
      isLocked: false
    },

  ],

  // Furniture - Minimal, high-quality pieces with labels
  furniture: [
    // Shop Floor - Counter, back wall cabinet, corner chair (positioned below label area)
    {
      id: 'shop-counter',
      name: 'Sales Counter',
      type: 'counter',
      position: [455, 550],  // Centered, below label area
      rotation: 0,
      size: [460, 70]  // Wide counter, not too deep
    },
    {
      id: 'drug-cabinet',
      name: 'Drug Cabinet',
      type: 'shelf',
      position: [130, 563],  // Moved down to avoid label overlap
      rotation: 0,
      size: [53, 220]  // Slightly shorter to fit better
    },
    {
      id: 'customer-chair',
      name: 'Waiting Chair',
      type: 'chair',
      position: [830, 630],  // Corner area, more visible
      rotation: 40,
      size: [50, 50]  // Larger for better visibility
    },

    // Laboratory - Workbench and herb shelf (positioned below label area)
    {
      id: 'workbench',
      name: 'Workbench',
      type: 'table',
      position: [620, 210],  // Moved down to avoid label overlap
      rotation: 0,
      size: [200, 80]  // Fits within laboratory boundaries (x: 500-900)
    },
    {
      id: 'herb-shelf',
      name: 'Herb Shelf',
      type: 'shelf',
      position: [830, 240],  // Moved down and adjusted to avoid label overlap
      rotation: 0,
      size: [94, 170]  // Shorter to fit better and avoid top wall
    },

    // Bedroom - Bed, bookshelf, clothing chest (positioned below label area)
    {
      id: 'bed',
      name: 'Bed',
      type: 'bed',
      position: [290, 220],  // Moved down to avoid label overlap
      rotation: 0,
      size: [130, 180]  // More realistic bed proportions
    },
    {
      id: 'bookshelf',
      name: 'Bookshelf',
      type: 'shelf',
      position: [165, 160],  // Moved down to avoid label overlap
      rotation: 0,
      size: [80, 85]  // Slightly shorter to fit better
    },
    {
      id: 'clothing-chest',
      name: 'Clothing Chest',
      type: 'chest',
      position: [413, 351],  // Adjusted for better spacing
      rotation: 0,
      size: [60, 63]
    }
  ],

  backgroundColor: '#1a1f2e'
};
