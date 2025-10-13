/**
 * Entity Schema Definitions
 *
 * Unified entity system for NPCs, Patients, Items, Locations, and more.
 * Dwarf Fortress-style depth with historical accuracy.
 *
 * Design Principles:
 * - Immutable entities
 * - Dual personality system (Big Five + Humoral Temperament)
 * - Universal schemas work across all scenarios
 * - Rich procedural generation for missing data
 * - Educational metadata optional
 *
 * @module entitySchema
 */

/**
 * Base entity - all entities extend this
 * @typedef {Object} BaseEntity
 */
export const BaseEntity = {
  entityType: '',           // 'npc', 'patient', 'item', 'location', 'quest'
  id: '',                   // unique identifier (e.g., 'npc_juan_hernandez')
  name: '',                 // display name

  tier: 'background',       // story-critical, recurring, background

  // Visual representation
  visual: {
    emoji: '',
    image: null,            // file path or null
    icon: null,             // icon identifier
    portraitStyle: 'realistic',
    color: null             // hex color for UI theming
  },

  // Interactivity
  clickable: true,
  modal: null,              // which modal to open: 'npc', 'patient', 'item', 'location'

  // State
  isActive: true,
  isDiscovered: false,

  // Metadata
  metadata: {
    created: null,          // timestamp
    lastModified: null,
    version: 1,
    dataSource: 'procedural' // handcrafted, procedural, mixed
  }
};

/**
 * NPC Entity Schema
 * @typedef {Object} NPCEntity
 * @extends BaseEntity
 */
export const NPCEntity = {
  ...BaseEntity,
  entityType: 'npc',
  modal: 'npc',

  // Dual personality system - Big Five (AI) + Humoral (display)
  personality: {
    // Big Five personality traits (0-100) - used for AI behavior
    bigFive: {
      openness: 50,           // curiosity, creativity
      conscientiousness: 50,  // organization, discipline
      extroversion: 50,       // social energy
      agreeableness: 50,      // compassion, cooperation
      neuroticism: 50         // emotional stability (low = stable)
    },

    // Humoral temperament - derived from Big Five, displayed to player
    temperament: {
      primary: 'sanguine',    // sanguine, choleric, melancholic, phlegmatic
      secondary: null,

      // Humoral balance (0-100, should sum to 100)
      humors: {
        blood: 25,            // sanguine - optimistic, social, active
        yellowBile: 25,       // choleric - ambitious, irritable, passionate
        blackBile: 25,        // melancholic - thoughtful, sad, analytical
        phlegm: 25            // phlegmatic - calm, sluggish, peaceful
      }
    },

    // Behavioral traits (for LLM prompting)
    traits: []                // e.g., ['jovial', 'greedy', 'talkative']
  },

  // Physical appearance (Dwarf Fortress-style depth)
  appearance: {
    age: null,
    gender: '',               // male, female, other
    height: '',               // e.g., "5'8\""
    build: '',                // thin, average, stocky, muscular, portly
    weight: '',               // e.g., "180 lbs"

    // Detailed facial features
    face: {
      shape: '',              // round, oval, square, angular, heart-shaped
      skinTone: '',           // fair, olive, tan, brown, dark brown
      complexion: '',         // smooth, weathered, scarred, youthful
      eyeColor: '',           // brown, blue, green, hazel, grey
      eyeShape: '',           // wide, narrow, almond, round
      noseShape: '',          // broad, narrow, aquiline, flat, upturned
      mouthShape: '',         // wide, thin, full, small
      jawline: ''             // strong, weak, square, pointed
    },

    // Hair
    hair: {
      color: '',              // black, brown, blonde, red, grey, white
      style: '',              // long, short, bald, braided, etc.
      texture: '',            // straight, wavy, curly, coarse
      facialHair: ''          // for men: beard, mustache, clean-shaven, etc.
    },

    // Distinguishing features (array of objects)
    distinguishingFeatures: [
      // { type: 'scar', location: 'face', description: 'knife scar on left cheek' }
    ],

    // Disabilities & conditions
    disabilities: [],         // e.g., 'blind in one eye', 'lame left leg'
    chronicConditions: []     // e.g., 'gout', 'consumption', 'poor eyesight'
  },

  // Clothing (period-accurate)
  clothing: {
    style: '',                // merchant, military, clerical, laborer, noble
    quality: 'common',        // poor, common, fine, luxurious
    cleanliness: 'average',   // filthy, dirty, average, clean, immaculate

    // Individual garments
    items: [
      // { garment: 'doublet', material: 'wool', color: 'brown', condition: 'worn' }
    ],

    // Accessories
    accessories: [
      // { item: 'ring', material: 'silver', description: 'family signet' }
    ]
  },

  // Social context
  social: {
    class: '',                // peasant, laborer, artisan, merchant, noble
    casta: '',                // español, mestizo, indio, negro, mulato, etc. (1680 context)
    occupation: '',           // merchant, soldier, priest, etc.
    wealth: 'poor',           // destitute, poor, comfortable, wealthy, rich
    literacyLevel: 'illiterate', // illiterate, basic, literate, well-educated
    languages: [],            // e.g., ['Spanish', 'Nahuatl', 'Latin']
    reputation: 50,           // 0-100
    faction: null,            // e.g., 'merchants_guild', 'viceroy_court'

    // Family relationships
    family: {
      maritalStatus: 'single', // single, married, widowed, divorced
      spouse: null,            // entity ID
      children: [],            // entity IDs
      parents: [],             // entity IDs
      siblings: []             // entity IDs
    }
  },

  // Biography (procedural or handcrafted)
  biography: {
    birthplace: '',
    birthYear: null,
    immigrationYear: null,
    immigrationReason: '',

    // Major life events
    majorEvents: [
      // { year: 1665, event: 'Arrived in New Spain' }
    ],

    // Secrets (revealed through interaction)
    secrets: []
  },

  // Skills & abilities (0-100)
  skills: {
    trade: 0,
    negotiation: 0,
    mathematics: 0,
    literacy: 0,
    languages: 0,
    combat: 0,
    medicine: 0,
    // Add more as needed
  },

  // Dynamic state (changes during gameplay)
  state: {
    location: null,           // current location entity ID
    activity: '',             // what they're doing
    mood: 'neutral',          // neutral, happy, sad, angry, fearful
    health: 100,              // 0-100
    energy: 100,              // 0-100

    // Current inventory (for merchants, etc.)
    inventory: [],

    // Active goals
    goals: [
      // { goal: 'sell goods', priority: 'high' }
    ],

    // Active wounds (for combat)
    wounds: []                // array of wound objects
  },

  // Interaction memory - up to 10 interactions, auto-summarized
  memory: {
    interactions: [
      // { date: '1680-04-15', turnNumber: 142, summary: '...', delta: +5 }
    ],
    maxInteractions: 10,

    // Archived summary of older interactions
    archivedSummary: ''
  },

  // Relationships (graph) - NPC ↔ NPC and NPC ↔ Player
  relationships: {
    // 'entity_id': { value: 50, type: 'friend', status: 'friendly', reason: '' }
  },

  // Movement schedule
  movement: {
    schedule: [
      // { time: 'morning', location: 'market', activity: 'selling' }
    ],
    speed: 'normal',          // slow, normal, fast
    currentDestination: null,
    preferredRoutes: []
  },

  // Dialogue (for LLM prompting)
  dialogue: {
    greeting: '',
    farewell: '',
    personalityPrompt: '',    // personality description for LLM
    voiceStyle: ''            // e.g., 'formal', 'casual', 'flowery'
  }
};

/**
 * Patient Entity Schema (extends NPC)
 * @typedef {Object} PatientEntity
 * @extends NPCEntity
 */
export const PatientEntity = {
  ...NPCEntity,
  entityType: 'patient',
  modal: 'patient',
  tier: 'story-critical',     // patients are usually important

  // Medical data
  medical: {
    symptoms: [
      // { name: 'fever', location: 'whole body', severity: 'moderate', quote: '...' }
    ],
    diagnosis: '',
    urgency: 'moderate',      // low, moderate, high, critical
    contemporaryTheory: '',   // humoral/Galenic explanation
    astrologicalSign: '',     // e.g., 'Libra'

    // Treatment history
    treatmentHistory: [
      // { date: '1680-04-10', treatment: 'camphor', outcome: 'improved' }
    ],

    allergies: [],
    chronicConditions: []
  },

  // Quest/story hooks
  quest: {
    id: null,
    status: 'inactive',       // inactive, active, completed, failed
    reward: {
      reputation: 0,
      wealth: 0,
      special: ''             // special reward description
    },
    successCondition: '',
    failureCondition: ''
  }
};

/**
 * Item Entity Schema
 * @typedef {Object} ItemEntity
 * @extends BaseEntity
 */
export const ItemEntity = {
  ...BaseEntity,
  entityType: 'item',
  modal: 'item',

  // Classification
  itemType: '',               // materia_medica, tool, wearable, weapon, consumable, misc
  categories: [],             // tags: medicinal, food, luxury, etc.

  // Economic
  value: {
    base: 0,                  // base price
    currency: 'reales',       // scenario-specific currency
    rarity: 'common',         // common, uncommon, rare, very_rare, legendary
    marketDemand: 'medium'    // low, medium, high
  },

  weight: 0,                  // in pounds
  bulk: 'medium',             // tiny, small, medium, large, huge

  // Universal provenance (works for any scenario)
  provenance: {
    origin: {
      region: '',
      specificLocation: '',
      culturalGroup: ''
    },

    // Trade routes (scenario-aware)
    tradeRoute: {
      // 'scenario-id': 'route description'
      generic: ''
    },

    // Multiple knowledge systems (array)
    knowledgeSystems: [
      // {
      //   tradition: 'Galenic/European',
      //   termFor: 'Azafrán',
      //   theory: 'Hot and dry...',
      //   uses: ['treating depression'],
      //   preparations: ['infusion']
      // }
    ],

    // Historical context
    historicalContext: {
      importStatus: 'common',   // common, uncommon, luxury, contraband
      monopolyHolder: null,     // e.g., 'Spanish Crown'
      prohibitionStatus: 'legal', // legal, restricted, contraband
      culturalSignificance: '',

      // Period-specific notes (scenario-aware)
      periodNotes: {}
    }
  },

  // Medicinal properties
  medicinal: {
    // Humoral qualities (Galenic medicine)
    humoralQualities: {
      temperature: null,        // hot, warm, cool, cold
      temperatureDegree: 0,     // 1-4 (Galenic degrees)
      moisture: null,           // dry, moist, wet
      moistureDegree: 0
    },

    effects: [],                // e.g., 'relieves pain', 'reduces fever'

    dosage: {
      min: 0,
      max: 0,
      unit: '',                 // drachm, grain, drop, etc.
      frequency: '',            // e.g., 'twice daily'
      warnings: ''
    },

    contraindications: [],      // e.g., 'pregnancy', 'fever'
    preparations: [],           // methods: infusion, powder, salve, etc.
    treatsConditions: []        // e.g., 'melancholia', 'fever'
  },

  // Physical description
  appearance: {
    form: '',                   // powder, liquid, crystalline, etc.
    color: '',
    smell: '',
    taste: '',
    texture: '',
    visualDescription: ''       // detailed description
  },

  // Combat properties (for future combat system)
  combat: {
    wieldable: false,
    throwable: false,
    damage: 0,                  // base damage
    range: 0,                   // in feet
    attackType: null,           // melee, ranged, thrown
    improvisedWeapon: false     // can be used as weapon if desperate
  },

  // Wearable properties
  wearable: null,               // or { slot: 'chest', defense: 5, encumbrance: 2 }

  // Consumable properties
  consumable: {
    isConsumable: false,
    consumeEffect: '',
    consumeTime: 'instant',     // instant, short, long
    stackable: true,
    maxStack: 100
  },

  // Crafting
  crafting: {
    canMix: false,
    mixableWith: [],            // entity IDs or item names
    producesCompound: false,
    compoundType: '',
    usedInRecipes: []           // recipe IDs
  },

  // Educational metadata (optional tooltips)
  education: {
    historicalNote: '',
    citations: [],
    relatedTopics: [],          // tags for cross-referencing
    imageCaption: '',
    funFact: ''
  },

  // Lore (scenario-specific flavor text)
  lore: {
    scenarioSpecific: {},       // { 'scenario-id': 'description' }
    genericDescription: ''
  }
};

/**
 * Location Entity Schema
 * @typedef {Object} LocationEntity
 * @extends BaseEntity
 */
export const LocationEntity = {
  ...BaseEntity,
  entityType: 'location',
  modal: 'location',

  locationType: '',             // shop, home, street, public_space, landmark

  description: {
    brief: '',
    detailed: '',
    atmosphere: '',
    sounds: [],
    smells: []
  },

  // Geographic data
  geography: {
    district: '',
    coordinates: { x: 0, y: 0 },  // for map rendering
    adjacentLocations: [],        // entity IDs
    travelTime: {}                // { 'location_id': minutes }
  },

  // NPCs present
  npcs: {
    permanent: [],                // always here
    visitors: [],                 // dynamic
    capacity: 10
  },

  // Available resources
  resources: {
    forageable: [],
    purchaseable: [],
    lootable: []
  },

  // Actions available here
  actions: [
    // { id: 'buy', label: 'Browse market', command: '#buy' }
  ],

  // Time-based changes
  schedule: {
    // 'dawn': { open: false, activity: 'closed' }
  },

  // Safety
  safety: {
    dangerLevel: 'low',           // low, moderate, high, extreme
    guards: false,
    crimeProbability: 0,          // 0-1
    encounterTypes: []            // types of NPCs encountered
  }
};

/**
 * Combat Wound Schema
 * @typedef {Object} Wound
 */
export const Wound = {
  woundType: '',                  // laceration, fracture, puncture, burn, infection, disease
  severity: 'minor',              // minor, moderate, severe, critical
  location: '',                   // body part

  // Effects
  effects: {
    bleeding: {
      active: false,
      rate: 'slow',               // slow, moderate, severe, arterial
      bloodLoss: 0                // percentage (100 = death)
    },

    pain: {
      level: 0,                   // 0-100
      type: '',                   // dull, sharp, burning, throbbing
      debuff: ''                  // game effect
    },

    mobility: {
      affected: false,
      reduction: 0,               // percentage reduction
      bodyPart: ''
    },

    infection: {
      risk: 0,                    // 0-100 probability
      onset: 72,                  // hours
      currentStatus: 'none'       // none, mild, moderate, severe, critical
    }
  },

  // Treatment
  treatment: {
    required: [],                 // e.g., ['bandaging', 'rest']
    optional: [],
    healTime: {
      untreated: 14,              // days
      treated: 7,
      withMedicine: 5
    },
    treatedBy: null,              // entity ID
    treatedDate: null,
    medicinesUsed: []
  },

  // Consequences
  consequences: {
    scarring: false,
    permanentDamage: false,
    deathRisk: 0                  // 0-100 probability
  },

  // Timestamp
  dateReceived: '',
  turnReceived: 0,

  // Lore
  description: '',
  causeDescription: ''
};

/**
 * Interaction Record (for NPC memory)
 * @typedef {Object} Interaction
 */
export const Interaction = {
  date: '',                       // e.g., '1680-04-15'
  turnNumber: 0,
  summary: '',                    // LLM-generated one-sentence summary
  relationship: 'neutral',        // improved, neutral, worsened
  delta: 0,                       // change in relationship value

  // Optional details
  transaction: null,              // { type: 'purchase', items: [], value: 0 }
  mood: '',                       // NPC mood during interaction
  playerAction: ''                // what player did
};

/**
 * Relationship Record (for relationship graph)
 * @typedef {Object} Relationship
 */
export const Relationship = {
  value: 50,                      // 0-100 (0=enemy, 50=neutral, 100=best friend)
  type: '',                       // friend, family, rival, customer, employee, etc.
  status: 'neutral',              // hostile, unfriendly, neutral, friendly, allied
  reason: '',                     // why this relationship exists
  debt: 0,                        // monetary debt (+ or -)
  lastInteraction: '',            // date

  // History
  history: [
    // { date: '1680-04-10', event: 'business deal', delta: +5 }
  ]
};

/**
 * Helper: Calculate humoral temperament from Big Five scores
 * @param {Object} bigFive - Big Five scores
 * @returns {Object} temperament
 */
export function calculateTemperament(bigFive) {
  const { extroversion, neuroticism, openness, agreeableness, conscientiousness } = bigFive;

  // Calculate humoral balance
  // Sanguine = high extroversion, low neuroticism
  const blood = (extroversion + (100 - neuroticism)) / 2;

  // Choleric = high extroversion, high neuroticism
  const yellowBile = (extroversion + neuroticism) / 2;

  // Melancholic = low extroversion, high neuroticism
  const blackBile = ((100 - extroversion) + neuroticism) / 2;

  // Phlegmatic = low extroversion, low neuroticism
  const phlegm = ((100 - extroversion) + (100 - neuroticism)) / 2;

  // Normalize to sum to 100
  const total = blood + yellowBile + blackBile + phlegm;
  const humors = {
    blood: Math.round((blood / total) * 100),
    yellowBile: Math.round((yellowBile / total) * 100),
    blackBile: Math.round((blackBile / total) * 100),
    phlegm: Math.round((phlegm / total) * 100)
  };

  // Determine primary temperament
  const max = Math.max(humors.blood, humors.yellowBile, humors.blackBile, humors.phlegm);
  let primary;
  if (humors.blood === max) primary = 'sanguine';
  else if (humors.yellowBile === max) primary = 'choleric';
  else if (humors.blackBile === max) primary = 'melancholic';
  else primary = 'phlegmatic';

  // Determine secondary (second highest)
  const sorted = Object.entries(humors).sort((a, b) => b[1] - a[1]);
  const secondaryHumor = sorted[1][0];
  let secondary;
  if (secondaryHumor === 'blood') secondary = 'sanguine';
  else if (secondaryHumor === 'yellowBile') secondary = 'choleric';
  else if (secondaryHumor === 'blackBile') secondary = 'melancholic';
  else secondary = 'phlegmatic';

  // Only set secondary if significantly different from primary
  if (sorted[1][1] < sorted[0][1] * 0.6) {
    secondary = null;
  }

  return {
    primary,
    secondary,
    humors
  };
}

/**
 * Helper: Generate Big Five from temperament (reverse mapping)
 * @param {string} primary - primary temperament
 * @param {string} secondary - secondary temperament (optional)
 * @returns {Object} Big Five scores
 */
export function temperamentToBigFive(primary, secondary = null) {
  const bases = {
    sanguine: { extroversion: 75, neuroticism: 25, openness: 60, agreeableness: 60, conscientiousness: 50 },
    choleric: { extroversion: 70, neuroticism: 70, openness: 55, agreeableness: 35, conscientiousness: 65 },
    melancholic: { extroversion: 30, neuroticism: 70, openness: 60, agreeableness: 50, conscientiousness: 70 },
    phlegmatic: { extroversion: 35, neuroticism: 30, openness: 45, agreeableness: 70, conscientiousness: 55 }
  };

  let bigFive = { ...bases[primary] };

  // Blend with secondary if present
  if (secondary && bases[secondary]) {
    Object.keys(bigFive).forEach(trait => {
      bigFive[trait] = Math.round((bigFive[trait] + bases[secondary][trait]) / 2);
    });
  }

  // Add slight randomization (±10)
  Object.keys(bigFive).forEach(trait => {
    const variance = Math.floor(Math.random() * 20) - 10;
    bigFive[trait] = Math.max(0, Math.min(100, bigFive[trait] + variance));
  });

  return bigFive;
}

// Export all schemas
export default {
  BaseEntity,
  NPCEntity,
  PatientEntity,
  ItemEntity,
  LocationEntity,
  Wound,
  Interaction,
  Relationship,
  calculateTemperament,
  temperamentToBigFive
};
