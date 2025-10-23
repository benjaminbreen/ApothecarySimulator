import { entityManager } from '../../../core/entities/EntityManager';

/**
 * Interior map: Humble House
 * A single-room dwelling for a poor family
 * Everything in one cramped space - sleeping, cooking, storage
 *
 * @type {import('../../../core/types/map.types').InteriorMapData}
 */
const humbleHouseInteriorMap = {
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

/**
 * Register humble house furniture as POI entities for clickable links
 * Called during map initialization
 */
export const registerHumbleHouseFurniture = () => {
  // Register Straw Mattress
  entityManager.register({
    name: 'Straw Mattress',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A thin mattress stuffed with corn husks and straw, its rough fabric worn thin from years of use and bodies pressing upon it. The filling has compressed and shifted, creating lumps and hollows, and the faint smell of mildew rises from the damp straw that never fully dries in the rainy season.`,
    position: [100, 120],
    properties: ['Sleeping', 'Communal', 'Poverty'],
    historicalContext: `For the poor of colonial Mexico City, beds were luxuries. Most families slept on petates—woven reed mats—spread directly on the dirt floor. A straw mattress, even one this threadbare, represented a step above absolute destitution. The entire family would share it, sleeping perpendicular like sardines to maximize space, their combined body heat the only warmth against the cold highland nights. In the morning, the mattress would be rolled up or pushed against the wall to reclaim precious floor space for the day's activities.`
  });

  // Register Cooking Hearth
  entityManager.register({
    name: 'Cooking Hearth',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A simple cooking hearth built into the corner—three stones supporting a blackened clay comal, a smoke-stained wall behind it, ashes perpetually warm from near-constant use. A few fire-darkened pots hang from iron hooks, and a small pile of kindling sits nearby, each stick carefully hoarded.`,
    position: [380, 250],
    properties: ['Cooking', 'Fire', 'Survival'],
    historicalContext: `The hearth was the heart of any poor household—source of warmth, light, and sustenance. Colonial cooking for the poor centered on the comal, a flat griddle for making tortillas, the dietary staple that kept families from starvation. Three stones formed the traditional configuration, mirroring indigenous practice stretching back centuries before Spanish conquest. Firewood was expensive; families sent children to scavenge for fallen branches or dried dung. Smoke had no chimney, simply rising to blacken the ceiling and seep through gaps in the walls, filling the room with acrid haze. Respiratory diseases were endemic.`
  });

  // Register Rough Table
  entityManager.register({
    name: 'Rough Table',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A crude table cobbled together from scrap wood, its surface scarred by knife marks, burn stains, and the accumulated grime of countless meals. The legs wobble slightly, shimmed with folded cloth, and splinters catch unwary hands on the rough, unfinished surface.`,
    position: [250, 250],
    properties: ['Eating', 'Work Surface', 'Gathering'],
    historicalContext: `For poor families, a table—any table—was a significant possession. Many ate squatting on the ground with clay bowls balanced on knees. This rough-hewn table served multiple functions: dining surface for the single daily meal, work surface for mending clothes or preparing food, gathering place for family prayers. The table's central position reflected its importance—the family's only real furniture beyond sleeping mats. Its surface bore the marks of daily life: knife scores from cutting vegetables, burn marks from hot pots, water stains from washing, ink stains from the rare letter written home to distant villages. A chronicle of survival carved in wood.`
  });

  // Register Storage Chest
  entityManager.register({
    name: 'Storage Chest',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A small wooden chest, crudely constructed with visible gaps between the planks and a simple latch instead of a lock. Inside: a few spare garments, perhaps a cloth bundle of dried beans, maybe a treasured object—a cracked mirror, a religious medal, a letter from home—something precious enough to safeguard but valueless to thieves.`,
    position: [100, 380],
    properties: ['Storage', 'Possessions', 'Survival'],
    historicalContext: `The storage chest contained the family's entire material wealth beyond what they wore or used daily. For the poor, possessions were minimal: one or two changes of clothing, stored food when available, perhaps a keepsake from before the city, before the poverty. The chest had no lock—nothing inside worth stealing to anyone but another desperate soul. Valuable items weren't stored; they didn't exist. What filled the chest instead were the bare necessities of survival: the spare manta cloth for when the worn one finally disintegrated, the handful of corn kernels saved from yesterday's grinding, the saint's medal inherited from a grandmother. Poverty preserved in a wooden box.`
  });

  // Register Religious Icon
  entityManager.register({
    name: 'Religious Icon',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A small painted image of the Virgin Mary, its colors faded from years of smoke and handling, mounted on a rough wooden board nailed to the wall. Someone has tucked a wilted wildflower behind the frame—yesterday's offering, tomorrow's compost, today's prayer made visible.`,
    position: [370, 80],
    properties: ['Religious', 'Devotion', 'Hope'],
    historicalContext: `The religious icon was often the only decoration in a poor household, the only item not strictly utilitarian. This ubiquity of sacred images in even the poorest homes reflected the deep religious saturation of colonial society. For those with nothing—no security, no prospects, no power—faith offered hope of divine intervention, explanation for suffering, and promise of eventual justice in the afterlife. The image of the Virgin was particularly popular among the poor; Mary understood suffering, loss, and watching loved ones die. The wildflower offering cost nothing but time to gather, yet represented real devotion. In a life measured by scarcity, any offering mattered. The Church taught that God loved the poor especially; the poor desperately wanted to believe it.`
  });

  console.log('[HumbleHouse] Registered 5 furniture POI entities');
};

// Call furniture registration immediately
registerHumbleHouseFurniture();

export default humbleHouseInteriorMap;
