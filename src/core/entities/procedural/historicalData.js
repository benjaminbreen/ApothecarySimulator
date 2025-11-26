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

  // Medical conditions (period-accurate, massively expanded for variety)
  // Organized by category for easier maintenance, but flattened during selection
  medicalConditions: {
    // Acute/Infectious diseases (common illnesses)
    acute: [
      'smallpox', 'plague (bubonic)', 'cholera', 'typhoid fever', 'influenza',
      'measles', 'scarlet fever', 'malaria', 'yellow fever', 'dysentery',
      'common cold', 'pneumonia', 'whooping cough', 'diphtheria', 'erysipelas (skin infection)',
      'putrid fever', 'spotted fever', 'ague (fever and chills)', 'bloody flux',
      'pestilential fever', 'quotidian fever', 'burning fever', 'wasting fever'
    ],

    // Chronic/Degenerative conditions (long-term ailments)
    chronic: [
      'consumption (tuberculosis)', 'gout', 'dropsy (edema)', 'scrofula (lymph node TB)',
      'rheumatism', 'arthritis', 'catarrh (chronic mucus)', 'kidney stone', 'bladder stone',
      'gallstone', 'liver complaint', 'spleen disorder', 'chronic cough',
      'wasting disease', 'chronic ulcer', 'fistula', 'canker', 'chronic headache',
      'migraine', 'asthma', 'shortness of breath', 'heart palpitations'
    ],

    // Injuries/Wounds (trauma and accidents)
    injuries: [
      'infected wound from rusty nail', 'broken bone (poorly set)', 'fractured skull',
      'burn (fire accident)', 'burn (chemical)', 'scalding from hot liquid',
      'animal bite (dog)', 'animal bite (horse kick)', 'snake bite', 'scorpion sting',
      'knife wound (recent)', 'knife wound (festering)', 'gunshot wound',
      'severe bruising from fall', 'dislocated shoulder', 'dislocated hip',
      'head injury with memory loss', 'embedded splinter', 'embedded foreign object',
      'crushed fingers', 'crushed foot', 'deep laceration', 'glass embedded in flesh',
      'torn muscle', 'sprained ankle', 'back injury from lifting'
    ],

    // Mental/Neurological disorders
    mental: [
      'melancholia (depression)', 'mania', 'frenzy', 'religious mania',
      'demonic oppression', 'spiritual affliction', 'visions and voices',
      'falling sickness (epilepsy)', 'apoplexy (stroke)', 'palsy (tremors)',
      'memory loss', 'delirium', 'night terrors', 'hysteria',
      'nervous disorder', 'brain fever', 'lunacy', 'madness',
      'obsessive thoughts', 'phantom pains', 'paralysis (partial)',
      'paralysis (complete)', 'speech loss', 'confusion and forgetting'
    ],

    // Supernatural/Spiritual (period beliefs)
    supernatural: [
      'evil eye curse', 'bewitchment', 'hex from jealous rival',
      'demonic possession', 'spiritual oppression', 'curse from offended saint',
      'lunar madness', 'astrological misalignment', 'planetary affliction',
      'punishment for sin', 'divine retribution', 'witch\'s mark',
      'bad air sickness', 'miasma poisoning', 'enchantment',
      'love spell gone wrong', 'cursed object affliction'
    ],

    // Birth Defects/Congenital conditions
    congenital: [
      'clubfoot', 'harelip', 'cleft palate', 'extra digit (finger/toe)',
      'fused digits', 'missing limb from birth', 'shortened limb',
      'birthmark (large, disfiguring)', 'port-wine stain', 'crossed eyes',
      'lazy eye', 'spinal curvature', 'hunchback', 'dwarfism',
      'weak constitution from birth', 'hole in the heart', 'twisted spine',
      'malformed hand', 'webbed fingers'
    ],

    // Sensory/Specific organs
    sensory: [
      'blindness (one eye)', 'blindness (both eyes)', 'partial vision loss',
      'cataracts', 'cloudy vision', 'night blindness', 'sudden vision loss',
      'deafness (one ear)', 'deafness (both ears)', 'partial hearing loss',
      'ringing in ears', 'ear infection', 'ear discharge',
      'toothache', 'tooth abscess', 'festering gums', 'loose teeth',
      'lost teeth', 'jaw pain', 'lockjaw (tetanus)', 'tongue swelling',
      'loss of smell', 'loss of taste', 'constant bad taste'
    ],

    // Skin conditions
    skin: [
      'leprosy', 'skin rash (unknown cause)', 'weeping sores',
      'boils', 'carbuncles', 'pustules', 'hives', 'eczema',
      'scabies', 'ringworm', 'shingles', 'skin ulcers',
      'gangrene', 'mortification of flesh', 'black spots on skin',
      'mysterious lesions', 'chronic itch', 'peeling skin',
      'discolored patches', 'lumps under skin'
    ],

    // Digestive/Internal organs
    digestive: [
      'bloody flux (dysentery)', 'green sickness (chlorosis)', 'worms (intestinal)',
      'tapeworm', 'roundworm', 'stomach ulcer', 'constant nausea',
      'vomiting blood', 'vomiting bile', 'inability to keep food down',
      'chronic constipation', 'bloody stool', 'black stool',
      'swollen belly', 'liver disease', 'jaundice (yellow skin)',
      'enlarged spleen', 'internal bleeding', 'stomach pain (severe)',
      'colic', 'gripes (intestinal pain)'
    ],

    // Women's health (specific to female patients)
    womensHealth: [
      'difficult childbirth complications', 'milk fever', 'childbed fever',
      'womb displacement', 'falling of the womb', 'excessive monthly bleeding',
      'irregular courses', 'barrenness', 'miscarriage (recurring)',
      'breast tumor', 'swollen breasts', 'breast infection',
      'green sickness (young women)', 'hysteria (womb-related)'
    ],

    // Respiratory conditions
    respiratory: [
      'chronic cough', 'coughing blood', 'chest pain', 'pleurisy',
      'phlegm obstruction', 'wheezing', 'difficulty breathing',
      'rattling in chest', 'consumption (lung disease)', 'lung fever',
      'chest cold (severe)', 'blood in sputum'
    ],

    // Urinary/Reproductive
    urinary: [
      'painful urination', 'bloody urine', 'cloudy urine', 'dark urine',
      'inability to urinate', 'frequent urination', 'kidney pain',
      'bladder inflammation', 'urinary blockage', 'gonorrhea',
      'syphilis (early stage)', 'syphilis (late stage)', 'French pox',
      'genital sores', 'genital discharge'
    ],

    // Rare/Mysterious ailments
    rare: [
      'saint\'s fire (ergotism)', 'dancing plague', 'sleeping sickness',
      'petrification of limbs', 'mysterious wasting', 'creeping paralysis',
      'flesh turning to stone', 'body parts going numb', 'phantom tumor',
      'swelling that moves', 'blood disease (unknown)', 'bone disease',
      'joint disease (crippling)', 'muscle wasting', 'unexplained fevers'
    ],

    // Occupational/Environmental
    occupational: [
      'miner\'s lung', 'potter\'s rot', 'baker\'s cough', 'tanner\'s disease',
      'mercury poisoning (from mirrors/medicine)', 'lead poisoning',
      'poisoning from bad food', 'poisoning from contaminated water',
      'heat exhaustion', 'sun sickness', 'frostbite', 'chilblains',
      'exposure to cold', 'work injury (chronic)', 'repetitive strain'
    ],

    // Parasites/Infestations
    parasites: [
      'lice infestation', 'flea bites (infected)', 'bedbug bites',
      'tick embedded in skin', 'maggots in wound', 'fly larvae in sore',
      'guinea worm', 'liver flukes', 'blood parasites'
    ],

    // Miscellaneous serious conditions
    miscellaneous: [
      'tumor (visible)', 'tumor (internal)', 'growth on neck', 'swollen glands',
      'mysterious lump', 'hardening of arteries', 'weak heart',
      'irregular heartbeat', 'chest tightness', 'fainting spells',
      'seizures', 'fits', 'convulsions', 'trembling disease',
      'muscle spasms', 'lockjaw', 'rigid limbs', 'twisted neck',
      'swollen joints', 'bone pain', 'growing pains (severe)',
      'premature aging', 'sudden weakness', 'loss of appetite',
      'insatiable thirst', 'constant hunger', 'unexplained weight loss'
    ]
  },

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
