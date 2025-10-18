/**
 * Interior map: Middling House
 * A modest but respectable 4-room house for a middling-class family
 * Layout: Sala (reception), 2 bedrooms, storage/pantry
 *
 * @type {import('../../../core/types/map.types').InteriorMapData}
 */
export default {
  id: 'middling-house-interior',
  type: 'interior',
  name: 'Middling House',
  style: 'colonial-interior',
  bounds: {
    width: 900,
    height: 700
  },
  startPosition: [650, 560], // In sala near entrance

  // 4 rooms arranged in square
  rooms: [
    // Sala - Reception/living area (bottom right)
    {
      id: 'sala',
      name: 'Sala',
      polygon: [
        [450, 350],
        [850, 350],
        [850, 650],
        [450, 650]
      ],
      type: 'reception',
      spawnPoint: { x: 650, y: 560 }
    },

    // Master Bedroom (top right)
    {
      id: 'master-bedroom',
      name: 'Master Bedroom',
      polygon: [
        [450, 50],
        [850, 50],
        [850, 350],
        [450, 350]
      ],
      type: 'bedroom',
      spawnPoint: { x: 650, y: 200 }
    },

    // Second Bedroom (top left)
    {
      id: 'second-bedroom',
      name: 'Second Bedroom',
      polygon: [
        [50, 50],
        [450, 50],
        [450, 350],
        [50, 350]
      ],
      type: 'bedroom',
      spawnPoint: { x: 250, y: 200 }
    },

    // Storage/Pantry (bottom left)
    {
      id: 'storage',
      name: 'Storage',
      polygon: [
        [50, 350],
        [450, 350],
        [450, 650],
        [50, 650]
      ],
      type: 'storage',
      spawnPoint: { x: 250, y: 500 }
    }
  ],

  // Doors connecting rooms
  doors: [
    // Main entrance to sala
    {
      id: 'main-entrance',
      from: 'street',
      to: 'sala',
      position: [650, 650],
      width: 60,
      rotation: 0,
      isLocked: false
    },

    // Sala to master bedroom
    {
      id: 'sala-to-master',
      from: 'sala',
      to: 'master-bedroom',
      position: [650, 350],
      width: 60,
      rotation: 0,
      isLocked: false
    },

    // Sala to storage
    {
      id: 'sala-to-storage',
      from: 'sala',
      to: 'storage',
      position: [450, 500],
      width: 60,
      rotation: 90,
      isLocked: false
    },

    // Storage to second bedroom
    {
      id: 'storage-to-bedroom',
      from: 'storage',
      to: 'second-bedroom',
      position: [250, 350],
      width: 60,
      rotation: 0,
      isLocked: false
    },

    // Second bedroom to master bedroom
    {
      id: 'bedrooms-connect',
      from: 'second-bedroom',
      to: 'master-bedroom',
      position: [450, 200],
      width: 60,
      rotation: 90,
      isLocked: false
    }
  ],

  // Furniture for each room
  furniture: [
    // === SALA - Reception room furniture ===
    {
      id: 'sala-table',
      name: 'Dining Table',
      type: 'table',
      position: [650, 480],
      rotation: 0,
      size: [150, 100]
    },
    {
      id: 'sala-chair-1',
      name: 'Chair',
      type: 'chair',
      position: [560, 450],
      rotation: 0,
      size: [40, 40]
    },
    {
      id: 'sala-chair-2',
      name: 'Chair',
      type: 'chair',
      position: [740, 450],
      rotation: 180,
      size: [40, 40]
    },
    {
      id: 'religious-painting',
      name: 'Religious Painting',
      type: 'decoration',
      position: [490, 380],
      rotation: 0,
      size: [50, 70]
    },

    // === MASTER BEDROOM ===
    {
      id: 'master-bed',
      name: 'Master Bed',
      type: 'bed',
      position: [650, 140],
      rotation: 0,
      size: [140, 180]
    },
    {
      id: 'master-chest',
      name: 'Clothing Chest',
      type: 'chest',
      position: [780, 280],
      rotation: 0,
      size: [70, 60]
    },
    {
      id: 'writing-desk',
      name: 'Writing Desk',
      type: 'table',
      position: [500, 280],
      rotation: 0,
      size: [100, 60]
    },

    // === SECOND BEDROOM ===
    {
      id: 'second-bed',
      name: 'Bed',
      type: 'bed',
      position: [250, 140],
      rotation: 0,
      size: [120, 160]
    },
    {
      id: 'second-chest',
      name: 'Storage Chest',
      type: 'chest',
      position: [380, 270],
      rotation: 0,
      size: [60, 50]
    },
    {
      id: 'small-shelf',
      name: 'Shelf',
      type: 'shelf',
      position: [90, 200],
      rotation: 0,
      size: [60, 120]
    },

    // === STORAGE/PANTRY ===
    {
      id: 'storage-shelf-1',
      name: 'Storage Shelf',
      type: 'shelf',
      position: [100, 420],
      rotation: 0,
      size: [80, 180]
    },
    {
      id: 'storage-shelf-2',
      name: 'Storage Shelf',
      type: 'shelf',
      position: [360, 420],
      rotation: 0,
      size: [80, 180]
    },
    {
      id: 'pantry-chest',
      name: 'Food Chest',
      type: 'chest',
      position: [230, 590],
      rotation: 0,
      size: [80, 60]
    }
  ],

  backgroundColor: '#1a1f2e'
};
