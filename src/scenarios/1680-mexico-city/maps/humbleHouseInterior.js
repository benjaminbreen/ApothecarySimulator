/**
 * Interior map: Humble House
 * A single-room dwelling for a poor family
 * Everything in one cramped space - sleeping, cooking, storage
 *
 * @type {import('../../../core/types/map.types').InteriorMapData}
 */
export default {
  id: 'humble-house-interior',
  type: 'interior',
  name: 'Humble House',
  style: 'colonial-interior',
  bounds: {
    width: 500,
    height: 500
  },
  startPosition: [250, 420], // Near door, center of room

  // Single room with all functions
  rooms: [
    {
      id: 'main-room',
      name: 'Main Room',
      polygon: [
        [50, 50],
        [450, 50],
        [450, 450],
        [50, 450]
      ],
      type: 'living',
      spawnPoint: { x: 250, y: 420 }
    }
  ],

  // Single entrance door
  doors: [
    {
      id: 'main-entrance',
      from: 'street',
      to: 'main-room',
      position: [220, 450],
      width: 60,
      rotation: 0,
      isLocked: false
    }
  ],

  // Minimal furniture - only essentials
  furniture: [
    // Simple straw mattress in corner
    {
      id: 'straw-bed',
      name: 'Straw Mattress',
      type: 'bed',
      position: [100, 120],
      rotation: 0,
      size: [100, 140]
    },
    // Cooking hearth along wall
    {
      id: 'hearth',
      name: 'Cooking Hearth',
      type: 'furniture',
      position: [380, 250],
      rotation: 0,
      size: [50, 50]
    },
    // Small rough table for eating
    {
      id: 'rough-table',
      name: 'Rough Table',
      type: 'table',
      position: [250, 250],
      rotation: 0,
      size: [100, 60]
    },
    // Simple storage chest for belongings
    {
      id: 'storage-chest',
      name: 'Storage Chest',
      type: 'chest',
      position: [100, 380],
      rotation: 0,
      size: [60, 50]
    },
    // Religious icon on wall (small)
    {
      id: 'religious-icon',
      name: 'Religious Icon',
      type: 'decoration',
      position: [370, 80],
      rotation: 0,
      size: [30, 40]
    }
  ],

  backgroundColor: '#1a1f2e'
};
