/**
 * Location-specific NPC populations for 1680 Mexico City
 *
 * Defines who is present at each major location in the game.
 * This ensures consistency between:
 * - List function (shows who's present)
 * - Narrative agent (knows who's there)
 * - Map display (shows NPC positions)
 *
 * Structure:
 * - permanent: NPCs always present at this location
 * - typical: NPCs who might be present (probability-based)
 * - templates: Generic NPC templates for background population
 */

/**
 * @typedef {Object} LocationNPC
 * @property {string} [name] - Actual NPC name (if named character)
 * @property {string} [template] - Template ID for generic NPCs
 * @property {Object} demographics - Age, gender, casta, class
 * @property {string} occupation - What they do
 * @property {string} clothing - What they're wearing
 * @property {string|string[]} activity - What they're doing (can be array for variety)
 * @property {boolean} [alwaysPresent] - If true, always here
 * @property {number} [probability] - 0.0-1.0 chance of being present
 * @property {string[]} [timeOfDay] - Times they're present: ['AM', 'afternoon', 'PM', 'night']
 * @property {number[]} [count] - [min, max] for template NPCs
 */

export const LOCATION_NPCS = {
  /**
   * EL CONSULADO DE MERCADERES
   * The merchant's exchange hall - center of commerce
   */
  'consulado-interior': {
    // Always present - core staff
    permanent: [
      {
        name: 'Don Rafael de Soto',
        demographics: { age: 'middle-aged', gender: 'male', casta: 'peninsular', class: 'elite' },
        occupation: 'Chief Registrar of the Consulado',
        clothing: 'fine velvet doublet with gold buttons, lace collar, silk hose',
        activity: 'reviewing ledger at large mahogany desk',
        alwaysPresent: true,
        description: 'The head official of El Consulado, responsible for registering contracts, settling trade disputes, and maintaining records. A meticulous bureaucrat with decades of experience.',
        portraitImage: 'peninsularmalemiddleagedmerchant.jpg'
      }
    ],

    // Usually present during business hours
    typical: [
      {
        template: 'consulado-clerk',
        demographics: { age: 'young', gender: 'male', casta: 'mestizo', class: 'common' },
        occupation: 'Clerk',
        clothing: 'plain brown wool tunic, ink-stained cuffs, simple leather shoes',
        activity: ['organizing stacks of contracts', 'copying ledger entries with quill', 'filing documents in wooden cabinets'],
        probability: 0.85,
        timeOfDay: ['AM', 'afternoon'],
        count: [1, 2]
      },
      {
        template: 'indigenous-porter',
        demographics: { age: 'young', gender: 'male', casta: 'indigenous', class: 'laborer' },
        occupation: 'Porter',
        clothing: 'simple cotton tunic, cloth headband, bare feet or sandals',
        activity: ['carrying heavy wooden crates to storage', 'loading cargo onto carts', 'sweating as he moves goods'],
        probability: 0.7,
        timeOfDay: ['AM', 'afternoon'],
        count: [1, 3]
      },
      {
        name: 'Don Fernando de Herrera',
        demographics: { age: 'middle-aged', gender: 'male', casta: 'peninsular', class: 'elite' },
        occupation: 'Investment Broker',
        clothing: 'expensive silk doublet, leather portfolio under arm, gold rings',
        activity: ['discussing investment opportunities with merchants', 'reviewing financial documents', 'negotiating deal terms'],
        probability: 0.5,
        timeOfDay: ['AM', 'afternoon'],
        portraitImage: 'peninsularmalemiddleagedmerchant.jpg'
      },
      {
        template: 'merchant-visitor',
        demographics: {
          age: ['middle-aged', 'adult'],
          gender: ['male', 'female'],
          casta: ['criollo', 'mestizo', 'mulatto'],
          class: 'middling'
        },
        occupation: 'Merchant',
        clothing: ['well-made wool doublet, leather pouch at belt', 'silk shawl over cotton dress, jewelry', 'practical merchant coat, wide-brimmed hat'],
        activity: ['negotiating prices with another merchant', 'reviewing contracts at a table', 'arguing about shipping delays', 'waiting to register a new trade agreement'],
        probability: 0.6,
        timeOfDay: ['AM', 'afternoon'],
        count: [0, 3]
      },
      {
        template: 'guild-official',
        demographics: { age: 'middle-aged', gender: 'male', casta: 'criollo', class: 'middling' },
        occupation: 'Guild Master',
        clothing: 'guild insignia on doublet, polished boots, official seal on chain',
        activity: ['settling a dispute between two members', 'examining quality of imported goods', 'collecting guild dues'],
        probability: 0.4,
        timeOfDay: ['AM', 'afternoon'],
        count: [0, 1]
      }
    ]
  },

  /**
   * LA MERCED MARKET
   * Bustling marketplace - food, goods, chaos
   */
  'mercado-interior': {
    permanent: [
      {
        name: 'Juana the Milk Vendor',
        demographics: { age: 'middle-aged', gender: 'female', casta: 'indigenous', class: 'common' },
        occupation: 'Milk Vendor',
        clothing: 'simple cotton huipil, woven rebozo, worn sandals',
        activity: 'selling fresh milk from ceramic jugs at her stall',
        alwaysPresent: true,
        timeOfDay: ['AM', 'afternoon'],
        portraitImage: 'indigenousfemalemiddleaged.jpg'
      },
      {
        template: 'market-overseer',
        demographics: { age: 'middle-aged', gender: 'male', casta: 'criollo', class: 'middling' },
        occupation: 'Market Overseer',
        clothing: 'practical wool coat, wide-brimmed hat, official medallion',
        activity: 'walking through market aisles, checking vendor permits',
        alwaysPresent: true,
        timeOfDay: ['AM', 'afternoon']
      }
    ],

    typical: [
      {
        template: 'food-vendor',
        demographics: {
          age: ['adult', 'middle-aged', 'elderly'],
          gender: ['female', 'male'],
          casta: ['indigenous', 'mestizo', 'mulatto'],
          class: 'common'
        },
        occupation: 'Food Vendor',
        clothing: ['worn cotton dress, stained apron', 'simple tunic, cloth cap', 'colorful huipil, headscarf'],
        activity: ['calling out prices of fresh tortillas', 'grilling fish over charcoal brazier', 'arranging pyramids of colorful fruit', 'wrapping tamales in corn husks'],
        probability: 0.95,
        timeOfDay: ['AM', 'afternoon'],
        count: [4, 8]
      },
      {
        template: 'herb-seller',
        demographics: { age: ['middle-aged', 'elderly'], gender: 'female', casta: ['indigenous', 'mestizo'], class: 'common' },
        occupation: 'Herb Seller',
        clothing: 'traditional indigenous dress, bundles of herbs hanging from belt',
        activity: ['sorting dried herbs into bundles', 'explaining medicinal properties to customer', 'haggling over rare plant specimens'],
        probability: 0.8,
        timeOfDay: ['AM', 'afternoon'],
        count: [1, 3]
      },
      {
        template: 'market-porter',
        demographics: { age: 'young', gender: 'male', casta: ['indigenous', 'mestizo'], class: 'laborer' },
        occupation: 'Porter',
        clothing: 'ragged cotton shirt, rope belt, bare feet',
        activity: ['hauling heavy sacks of grain', 'carrying baskets for wealthy shoppers', 'sweating profusely under the sun'],
        probability: 0.75,
        timeOfDay: ['AM', 'afternoon'],
        count: [2, 5]
      },
      {
        template: 'wealthy-shopper',
        demographics: {
          age: ['adult', 'middle-aged'],
          gender: ['female', 'male'],
          casta: ['criollo', 'peninsular'],
          class: 'elite'
        },
        occupation: 'Wealthy Patron',
        clothing: ['expensive silk dress, parasol, accompanied by servant', 'fine doublet and cape, perfumed gloves'],
        activity: ['examining fabric samples disdainfully', 'barking orders at servant to carry purchases', 'wrinkling nose at market smells'],
        probability: 0.4,
        timeOfDay: ['AM'],
        count: [0, 2]
      },
      {
        template: 'street-musician',
        demographics: { age: ['young', 'adult'], gender: 'male', casta: ['mestizo', 'mulatto'], class: 'common' },
        occupation: 'Street Musician',
        clothing: 'colorful but worn clothing, feathered hat',
        activity: ['playing guitar and singing for coins', 'strumming cheerful tune between vendors'],
        probability: 0.3,
        timeOfDay: ['afternoon'],
        count: [0, 1]
      },
      {
        template: 'market-guard',
        demographics: { age: 'adult', gender: 'male', casta: 'mestizo', class: 'military' },
        occupation: 'Market Guard',
        clothing: 'leather jerkin, steel helmet, sword at hip',
        activity: ['watching for thieves with suspicious eyes', 'breaking up argument between vendors'],
        probability: 0.5,
        timeOfDay: ['AM', 'afternoon'],
        count: [1, 2]
      }
    ]
  },

  /**
   * METROPOLITAN CATHEDRAL
   * Spiritual center - clergy, worshippers, officials
   */
  'cathedral-interior': {
    permanent: [
      {
        name: 'Padre Diego Martínez',
        demographics: { age: 'middle-aged', gender: 'male', casta: 'criollo', class: 'clergy' },
        occupation: 'Parish Priest',
        clothing: 'black cassock, simple wooden cross on chain, leather-bound breviary',
        activity: 'hearing confessions in wooden booth',
        alwaysPresent: true,
        timeOfDay: ['AM', 'afternoon', 'PM'],
        portraitImage: 'priestmiddleagedcriollo.jpg'
      },
      {
        template: 'cathedral-sacristan',
        demographics: { age: 'elderly', gender: 'male', casta: 'mestizo', class: 'clergy' },
        occupation: 'Sacristan',
        clothing: 'brown wool robe, rope belt, worn sandals',
        activity: 'lighting candles at various altars with taper',
        alwaysPresent: true,
        timeOfDay: ['AM', 'afternoon', 'PM']
      }
    ],

    typical: [
      {
        template: 'worshipper',
        demographics: {
          age: ['adult', 'middle-aged', 'elderly'],
          gender: ['female', 'male'],
          casta: ['criollo', 'peninsular', 'mestizo', 'indigenous'],
          class: ['common', 'middling', 'elite']
        },
        occupation: 'Worshipper',
        clothing: ['black mourning dress, rosary in hands', 'simple cotton clothing, bare head bowed', 'expensive silk mantilla, lace veil', 'indigenous clothing with Christian cross'],
        activity: ['kneeling in prayer before statue of Virgin', 'lighting votive candles with trembling hands', 'weeping softly in back pew', 'crossing themselves before altar'],
        probability: 0.9,
        timeOfDay: ['AM', 'afternoon', 'PM'],
        count: [3, 10]
      },
      {
        name: 'Fray Antonio Ruiz',
        demographics: { age: 'middle-aged', gender: 'male', casta: 'peninsular', class: 'clergy' },
        occupation: 'Franciscan Friar',
        clothing: 'rough brown wool robe, rope belt, bare feet',
        activity: 'preaching to small group about humility and charity',
        probability: 0.6,
        timeOfDay: ['AM', 'afternoon'],
        portraitImage: 'friar.jpg'
      },
      {
        template: 'nun',
        demographics: { age: ['young', 'middle-aged'], gender: 'female', casta: ['criollo', 'peninsular'], class: 'clergy' },
        occupation: 'Nun',
        clothing: 'black habit with white coif, rosary at waist',
        activity: ['leading novices in quiet prayer', 'instructing young girls in religious instruction', 'distributing alms to the poor at cathedral door'],
        probability: 0.5,
        timeOfDay: ['AM', 'afternoon'],
        count: [0, 2]
      },
      {
        template: 'cathedral-beggar',
        demographics: { age: ['adult', 'elderly'], gender: ['male', 'female'], casta: ['indigenous', 'mestizo', 'mulatto'], class: 'poor' },
        occupation: 'Beggar',
        clothing: 'ragged clothing, dirty bare feet, wooden bowl',
        activity: ['sitting near entrance with outstretched hand', 'calling out for Christian charity', 'muttering prayers in exchange for coins'],
        probability: 0.7,
        timeOfDay: ['AM', 'afternoon', 'PM'],
        count: [1, 3]
      },
      {
        template: 'church-official',
        demographics: { age: 'middle-aged', gender: 'male', casta: ['peninsular', 'criollo'], class: 'clergy' },
        occupation: 'Church Official',
        clothing: 'fine black cassock with purple trim, gold crucifix',
        activity: ['inspecting cathedral accounts with stern expression', 'supervising altar preparations', 'conferring quietly with other officials'],
        probability: 0.3,
        timeOfDay: ['AM', 'afternoon'],
        count: [0, 1]
      }
    ]
  },

  /**
   * BOTICA DE LA AMARGURA
   * Maria's apothecary shop - always empty except for João
   * Customers only appear when selected by EntityAgent
   */
  'botica-interior': {
    permanent: [
      {
        name: 'João the Kitten',
        demographics: { age: 'animal', gender: 'animal', casta: 'animal', class: 'animal' },
        occupation: 'kitten',
        type: 'animal',
        clothing: 'orange tabby fur',
        activity: 'sleeping on sunny windowsill',
        alwaysPresent: true,
        isAnimal: true,
        description: 'Maria\'s friendly street cat who has made the shop his home'
      }
    ]
    // No typical NPCs - the shop is Maria's private space
    // Customers only appear when EntityAgent selects them for the narrative
  }
};

/**
 * Helper function to get time of day category from game time
 * @param {string} time - Game time (e.g., "9:00 AM", "2:30 PM")
 * @returns {string} Time category: 'AM', 'afternoon', 'PM', 'night'
 */
export function getTimeOfDay(time) {
  if (!time) return 'AM';

  const timeLower = time.toLowerCase();

  // Night: 7 PM - 6 AM
  if (timeLower.includes('pm') || timeLower.includes('evening')) {
    const hour = parseInt(time.match(/\d+/)?.[0] || '0');
    if (hour >= 7 || hour < 6) return 'night';
    if (hour >= 12) return 'PM';
    return 'afternoon';
  }

  // AM times
  if (timeLower.includes('am') || timeLower.includes('morning')) {
    return 'AM';
  }

  // Afternoon: 12 PM - 5 PM
  if (timeLower.includes('afternoon')) {
    return 'afternoon';
  }

  // Default
  return 'AM';
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random element from array
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export default LOCATION_NPCS;
