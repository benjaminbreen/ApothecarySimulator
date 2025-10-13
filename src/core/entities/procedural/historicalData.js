/**
 * Historical Data for Procedural Generation
 *
 * Period-accurate data for generating realistic NPCs across different scenarios.
 * Data is organized by scenario but with universal structures.
 *
 * Sources:
 * - Colonial Latin American history
 * - Spanish colonial records
 * - Historical demographics
 * - Period fashion and social customs
 *
 * @module historicalData
 */

/**
 * 1680s Mexico City Data
 */
export const MexicoCity1680 = {
  // Common Spanish names (period-accurate)
  names: {
    male: {
      first: [
        'Juan', 'Pedro', 'Diego', 'Antonio', 'Francisco', 'José', 'Miguel', 'Andrés',
        'Luis', 'Carlos', 'Felipe', 'Gonzalo', 'Rodrigo', 'Alonso', 'Sebastián',
        'Tomás', 'Domingo', 'Manuel', 'Gabriel', 'Rafael', 'Bartolomé', 'Cristóbal'
      ],
      surnames: [
        'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Pérez',
        'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz',
        'Morales', 'Jiménez', 'Ruiz', 'Mendoza', 'de la Cruz', 'de León', 'de Silva'
      ]
    },
    female: {
      first: [
        'María', 'Ana', 'Isabel', 'Catalina', 'Juana', 'Francisca', 'Teresa', 'Beatriz',
        'Inés', 'Luisa', 'Magdalena', 'Elena', 'Rosa', 'Margarita', 'Clara', 'Antonia',
        'Josefa', 'Leonor', 'Bárbara', 'Paula', 'Úrsula', 'Esperanza'
      ],
      surnames: [
        'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Pérez',
        'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz',
        'Morales', 'Jiménez', 'Ruiz', 'Mendoza', 'de la Cruz', 'de León', 'de Silva'
      ]
    },
    // Indigenous names (Nahuatl)
    nahuatl: {
      male: ['Cuauhtémoc', 'Moctezuma', 'Tlahuicole', 'Xolotl', 'Nezahualcóyotl'],
      female: ['Citlali', 'Xochitl', 'Nenetl', 'Zyanya', 'Tlalli']
    }
  },

  // Occupations by social class
  occupations: {
    elite: ['hacendado', 'merchant prince', 'high government official', 'bishop', 'judge'],
    middling: ['merchant', 'shopkeeper', 'notary', 'priest', 'physician', 'lawyer', 'artisan master'],
    common: ['laborer', 'servant', 'street vendor', 'muleteer', 'artisan', 'farmhand'],
    marginal: ['beggar', 'vagrant', 'petty thief', 'prostitute', 'day laborer']
  },

  // Casta system (racial categories)
  castas: ['español', 'criollo', 'mestizo', 'indio', 'negro', 'mulato', 'castizo', 'morisco', 'chino'],

  // Birthplaces for Spanish-born
  spanishBirthplaces: [
    'Seville', 'Madrid', 'Toledo', 'Barcelona', 'Valencia', 'Granada',
    'Córdoba', 'Salamanca', 'Cádiz', 'Málaga'
  ],

  // Birthplaces for New Spain-born
  newSpainBirthplaces: [
    'Mexico City', 'Puebla', 'Guadalajara', 'Querétaro', 'Oaxaca',
    'Guanajuato', 'Veracruz', 'Mérida', 'Durango'
  ],

  // Common chronic conditions (period-accurate)
  chronicConditions: [
    'gout', 'consumption', 'falling sickness (epilepsy)', 'dropsy',
    'scrofula', 'tertian fever', 'quartan fever', 'stone (kidney/bladder)',
    'catarrh', 'rheumatism', 'poor eyesight', 'deafness', 'toothache'
  ],

  // Physical features by casta
  features: {
    español: {
      skinTones: ['fair', 'olive', 'light olive'],
      hairColors: ['brown', 'dark brown', 'black', 'blonde (rare)'],
      eyeColors: ['brown', 'dark brown', 'hazel', 'blue (rare)']
    },
    mestizo: {
      skinTones: ['olive', 'tan', 'brown'],
      hairColors: ['black', 'dark brown'],
      eyeColors: ['brown', 'dark brown']
    },
    indio: {
      skinTones: ['tan', 'brown', 'copper'],
      hairColors: ['black'],
      eyeColors: ['dark brown', 'black']
    },
    negro: {
      skinTones: ['dark brown', 'very dark brown', 'black'],
      hairColors: ['black'],
      eyeColors: ['dark brown', 'black']
    },
    mulato: {
      skinTones: ['tan', 'brown', 'dark brown'],
      hairColors: ['black', 'dark brown', 'curly black'],
      eyeColors: ['brown', 'dark brown']
    }
  }
};

/**
 * Universal data (works for all scenarios)
 */
export const Universal = {
  // Body builds
  builds: ['thin', 'wiry', 'slight', 'average', 'stocky', 'muscular', 'portly', 'corpulent'],

  // Face shapes
  faceShapes: ['round', 'oval', 'square', 'long', 'heart-shaped', 'angular', 'gaunt'],

  // Eye shapes
  eyeShapes: ['wide', 'narrow', 'almond-shaped', 'round', 'deep-set', 'hooded', 'upturned'],

  // Nose shapes
  noseShapes: ['straight', 'aquiline', 'broad', 'narrow', 'flat', 'upturned', 'hooked', 'bulbous'],

  // Hair textures
  hairTextures: ['straight', 'wavy', 'curly', 'coarse', 'fine', 'thick', 'thin'],

  // Hair styles (male)
  hairStylesMale: [
    'short', 'shoulder-length', 'long', 'balding', 'receding', 'shaved',
    'tonsured (priests)', 'tied back', 'unkempt'
  ],

  // Hair styles (female)
  hairStylesFemale: [
    'long and loose', 'long and braided', 'pinned up', 'covered by veil',
    'covered by mantilla', 'in a bun', 'plaited'
  ],

  // Facial hair (male)
  facialHair: [
    'clean-shaven', 'mustache', 'short beard', 'full beard', 'goatee',
    'thick mustache', 'wispy beard', 'stubble'
  ],

  // Distinguishing features (generic)
  distinguishingFeatures: [
    { type: 'scar', variations: ['on face', 'on hand', 'on arm', 'on leg', 'on neck'] },
    { type: 'missing', variations: ['tooth', 'finger', 'ear tip', 'eye'] },
    { type: 'marking', variations: ['mole on cheek', 'birthmark', 'tattoo', 'brand mark'] },
    { type: 'deformity', variations: ['crooked nose', 'club foot', 'withered hand', 'hunchback'] },
    { type: 'feature', variations: ['gap-toothed', 'dimples', 'prominent jaw', 'high cheekbones'] }
  ],

  // Disabilities
  disabilities: [
    'blind in one eye', 'blind in both eyes', 'deaf', 'partially deaf',
    'lame left leg', 'lame right leg', 'missing hand', 'missing fingers',
    'speech impediment', 'hunchback', 'club foot'
  ],

  // Personality traits
  traits: {
    positive: [
      'honest', 'generous', 'kind', 'brave', 'loyal', 'hardworking', 'cheerful',
      'wise', 'patient', 'humble', 'pious', 'charitable', 'shrewd'
    ],
    negative: [
      'dishonest', 'greedy', 'cruel', 'cowardly', 'fickle', 'lazy', 'gloomy',
      'foolish', 'impatient', 'proud', 'impious', 'stingy', 'naive'
    ],
    neutral: [
      'talkative', 'quiet', 'serious', 'jovial', 'suspicious', 'trusting',
      'ambitious', 'content', 'curious', 'indifferent'
    ]
  }
};

/**
 * Clothing data by period and class
 */
export const Clothing = {
  '1680-mexico-city': {
    male: {
      elite: {
        garments: [
          { name: 'doublet', materials: ['silk', 'velvet', 'brocade'], colors: ['black', 'burgundy', 'deep blue', 'purple'] },
          { name: 'hose', materials: ['silk', 'fine wool'], colors: ['black', 'white', 'matching doublet'] },
          { name: 'cape', materials: ['velvet', 'silk'], colors: ['black', 'burgundy'] },
          { name: 'boots', materials: ['fine leather'], colors: ['black', 'brown'] },
          { name: 'hat', materials: ['felt', 'velvet'], decorations: ['feather plume', 'jeweled pin'] }
        ],
        accessories: ['sword', 'jeweled rings', 'gold chain', 'lace collar', 'silk gloves']
      },
      middling: {
        garments: [
          { name: 'doublet', materials: ['wool', 'cotton'], colors: ['brown', 'grey', 'dark green'] },
          { name: 'breeches', materials: ['wool', 'linen'], colors: ['brown', 'black', 'grey'] },
          { name: 'jerkin', materials: ['leather', 'wool'], colors: ['brown', 'black'] },
          { name: 'boots', materials: ['leather'], colors: ['brown'] },
          { name: 'hat', materials: ['felt', 'straw'], decorations: ['simple band'] }
        ],
        accessories: ['belt', 'simple ring', 'knife']
      },
      common: {
        garments: [
          { name: 'shirt', materials: ['linen', 'cotton'], colors: ['undyed', 'off-white', 'brown'] },
          { name: 'breeches', materials: ['wool', 'cotton'], colors: ['brown', 'grey'] },
          { name: 'vest', materials: ['wool'], colors: ['brown', 'grey'] },
          { name: 'sandals', materials: ['leather', 'rope'], colors: ['brown'] }
        ],
        accessories: ['rope belt', 'simple hat']
      }
    },
    female: {
      elite: {
        garments: [
          { name: 'gown', materials: ['silk', 'velvet', 'brocade'], colors: ['burgundy', 'deep blue', 'emerald', 'black'] },
          { name: 'bodice', materials: ['silk', 'brocade'], decorations: ['embroidery', 'jewels'] },
          { name: 'skirt', materials: ['silk', 'taffeta'], colors: ['matching gown'] },
          { name: 'mantilla', materials: ['lace', 'silk'], colors: ['black', 'white'] },
          { name: 'slippers', materials: ['silk', 'velvet'], colors: ['matching gown'] }
        ],
        accessories: ['pearl necklace', 'gold earrings', 'jeweled rings', 'fan', 'rosary']
      },
      middling: {
        garments: [
          { name: 'dress', materials: ['wool', 'cotton'], colors: ['brown', 'dark green', 'grey'] },
          { name: 'bodice', materials: ['wool', 'linen'], colors: ['matching dress'] },
          { name: 'skirt', materials: ['wool', 'cotton'], colors: ['brown', 'grey'] },
          { name: 'shawl', materials: ['wool'], colors: ['brown', 'black'] },
          { name: 'shoes', materials: ['leather'], colors: ['black', 'brown'] }
        ],
        accessories: ['simple necklace', 'shawl pin', 'rosary']
      },
      common: {
        garments: [
          { name: 'simple dress', materials: ['linen', 'cotton'], colors: ['undyed', 'brown'] },
          { name: 'shawl', materials: ['wool', 'cotton'], colors: ['brown', 'grey'] },
          { name: 'sandals', materials: ['leather', 'rope'], colors: ['brown'] }
        ],
        accessories: ['rope belt', 'simple headscarf']
      }
    }
  }
};

/**
 * Get random item from array
 */
export function random(arr) {
  // Defensive: Handle undefined or empty arrays
  if (!arr || arr.length === 0) {
    console.warn('[random] Called with invalid array:', arr);
    return null;
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random int between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Roll dice (e.g., roll(1, 6) = 1d6)
 */
export function roll(num, sides) {
  let total = 0;
  for (let i = 0; i < num; i++) {
    total += randomInt(1, sides);
  }
  return total;
}

/**
 * Weighted random selection
 * @param {Array} items - Array of { value, weight } objects
 */
export function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.value;
    }
  }

  return items[items.length - 1].value;
}

export default {
  MexicoCity1680,
  Universal,
  Clothing,
  random,
  randomInt,
  roll,
  weightedRandom
};
