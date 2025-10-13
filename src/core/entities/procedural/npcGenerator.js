/**
 * NPC Procedural Generator
 *
 * Dwarf Fortress-style depth for generating realistic, historically accurate NPCs.
 * Generates:
 * - Physical appearance
 * - Personality (Big Five + Humoral temperament)
 * - Clothing
 * - Biography
 * - Skills
 * - Dialogue patterns
 *
 * @module npcGenerator
 */

import { calculateTemperament, temperamentToBigFive } from '../entitySchema';
import { MexicoCity1680, Universal, Clothing, random, randomInt, roll, weightedRandom } from './historicalData';

/**
 * Generate full NPC appearance
 * @param {Object} npc - Partial NPC data
 * @returns {Object} Appearance object
 */
export function generateAppearance(npc) {
  const appearance = { ...npc.appearance } || {};

  // Determine scenario data
  const scenarioData = MexicoCity1680; // TODO: Make scenario-aware

  // Age (based on occupation if not set)
  if (!appearance.age) {
    appearance.age = generateAge(npc.social?.occupation);
  }

  // Gender (if not set)
  if (!appearance.gender) {
    appearance.gender = Math.random() > 0.5 ? 'male' : 'female';
  }

  // Build (influenced by occupation and class)
  if (!appearance.build) {
    appearance.build = generateBuild(npc.social?.occupation, npc.social?.class);
  }

  // Height and weight
  if (!appearance.height) {
    appearance.height = generateHeight(appearance.gender, appearance.build);
  }
  if (!appearance.weight) {
    appearance.weight = generateWeight(appearance.gender, appearance.build, appearance.height);
  }

  // Face (detailed)
  if (!appearance.face) {
    appearance.face = generateFace(npc.social?.casta);
  }

  // Hair
  if (!appearance.hair) {
    appearance.hair = generateHair(appearance.gender, appearance.age, npc.social?.casta);
  }

  // Distinguishing features (30% chance of having some)
  if (!appearance.distinguishingFeatures || appearance.distinguishingFeatures.length === 0) {
    appearance.distinguishingFeatures = generateDistinguishingFeatures(npc.social?.occupation, appearance.age);
  }

  // Disabilities (10% chance)
  if (!appearance.disabilities || appearance.disabilities.length === 0) {
    if (Math.random() < 0.10) {
      appearance.disabilities = [random(Universal.disabilities)];
    } else {
      appearance.disabilities = [];
    }
  }

  // Chronic conditions (increases with age)
  if (!appearance.chronicConditions || appearance.chronicConditions.length === 0) {
    appearance.chronicConditions = generateChronicConditions(appearance.age);
  }

  return appearance;
}

/**
 * Generate age based on occupation
 */
function generateAge(occupation) {
  const ageRanges = {
    'child': [5, 12],
    'apprentice': [12, 18],
    'soldier': [18, 35],
    'laborer': [18, 50],
    'merchant': [25, 60],
    'physician': [30, 65],
    'priest': [25, 70],
    'bishop': [45, 75],
    'beggar': [20, 65],
    'widow': [40, 75]
  };

  const range = ageRanges[occupation] || [20, 55];
  return randomInt(range[0], range[1]);
}

/**
 * Generate build based on occupation and class
 */
function generateBuild(occupation, socialClass) {
  const buildsByOccupation = {
    'soldier': ['muscular', 'stocky', 'wiry'],
    'laborer': ['muscular', 'stocky', 'wiry'],
    'merchant': ['stocky', 'portly', 'average'],
    'priest': ['thin', 'average', 'portly'],
    'scholar': ['thin', 'slight', 'average'],
    'beggar': ['thin', 'wiry', 'gaunt']
  };

  // Elite tend to be heavier (better nutrition)
  if (socialClass === 'elite') {
    return weightedRandom([
      { value: 'average', weight: 3 },
      { value: 'portly', weight: 4 },
      { value: 'stocky', weight: 2 },
      { value: 'corpulent', weight: 1 }
    ]);
  }

  // Use occupation-specific builds if available
  if (occupation && buildsByOccupation[occupation]) {
    return random(buildsByOccupation[occupation]);
  }

  // Default: random from all builds
  return random(Universal.builds);
}

/**
 * Generate height based on gender and build
 */
function generateHeight(gender, build) {
  // Base heights (in inches)
  const baseMale = 66; // 5'6" (historically accurate average)
  const baseFemale = 61; // 5'1"

  const base = gender === 'male' ? baseMale : baseFemale;

  // Build modifiers
  const buildMods = {
    'thin': -2,
    'slight': -3,
    'wiry': -1,
    'average': 0,
    'stocky': 1,
    'muscular': 2,
    'portly': 1,
    'corpulent': 0
  };

  const mod = buildMods[build] || 0;
  const variance = randomInt(-2, 2);
  const totalInches = base + mod + variance;

  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  return `${feet}'${inches}"`;
}

/**
 * Generate weight based on gender, build, height
 */
function generateWeight(gender, build, heightStr) {
  // Parse height
  const [feet, inches] = heightStr.split("'").map(s => parseInt(s));
  const totalInches = feet * 12 + (inches || 0);

  // Base weight calculation (rough BMI)
  const baseWeight = gender === 'male' ? (totalInches - 60) * 3 + 130 : (totalInches - 60) * 2.5 + 110;

  // Build modifiers
  const buildMods = {
    'thin': 0.8,
    'slight': 0.75,
    'wiry': 0.85,
    'average': 1.0,
    'stocky': 1.15,
    'muscular': 1.2,
    'portly': 1.3,
    'corpulent': 1.5
  };

  const mod = buildMods[build] || 1.0;
  const weight = Math.round(baseWeight * mod);

  return `${weight} lbs`;
}

/**
 * Generate detailed face based on casta
 */
function generateFace(casta) {
  const features = MexicoCity1680.features[casta] || MexicoCity1680.features.español;

  return {
    shape: random(Universal.faceShapes),
    skinTone: random(features.skinTones),
    complexion: random(['smooth', 'weathered', 'scarred', 'pockmarked', 'ruddy', 'pale']),
    eyeColor: random(features.eyeColors),
    eyeShape: random(Universal.eyeShapes),
    noseShape: random(Universal.noseShapes),
    mouthShape: random(['wide', 'thin', 'full', 'small', 'pursed']),
    jawline: random(['strong', 'weak', 'square', 'pointed', 'rounded'])
  };
}

/**
 * Generate hair based on gender, age, and casta
 */
function generateHair(gender, age, casta) {
  const features = MexicoCity1680.features[casta] || MexicoCity1680.features.español;

  const hair = {
    color: random(features.hairColors),
    texture: random(Universal.hairTextures)
  };

  // Age affects color
  if (age > 50) {
    if (Math.random() < 0.5) {
      hair.color = age > 65 ? 'white' : 'grey';
    } else {
      hair.color = `greying ${hair.color}`;
    }
  }

  // Style based on gender
  if (gender === 'male') {
    hair.style = random(Universal.hairStylesMale);
    hair.facialHair = random(Universal.facialHair);

    // Balding more likely with age
    if (age > 40 && Math.random() < 0.3) {
      hair.style = random(['balding', 'receding']);
    }
  } else {
    hair.style = random(Universal.hairStylesFemale);
    hair.facialHair = '';
  }

  return hair;
}

/**
 * Generate distinguishing features
 */
function generateDistinguishingFeatures(occupation, age) {
  const features = [];

  // 30% chance of having features
  if (Math.random() > 0.7) return features;

  // Number of features (1-2)
  const numFeatures = Math.random() > 0.7 ? 2 : 1;

  for (let i = 0; i < numFeatures; i++) {
    const featureType = random(Universal.distinguishingFeatures);
    const variation = random(featureType.variations);

    features.push({
      type: featureType.type,
      location: variation,
      description: `${featureType.type} - ${variation}`
    });
  }

  // Age-specific features
  if (age > 60) {
    if (Math.random() < 0.4) {
      features.push({
        type: 'feature',
        location: 'face',
        description: 'deeply wrinkled face'
      });
    }
  }

  // Occupation-specific features
  if (occupation === 'soldier' && Math.random() < 0.6) {
    features.push({
      type: 'scar',
      location: random(['face', 'arm', 'leg', 'chest']),
      description: 'battle scar from combat'
    });
  }

  if (occupation === 'laborer' && Math.random() < 0.5) {
    features.push({
      type: 'marking',
      location: 'hands',
      description: 'heavily calloused and scarred hands'
    });
  }

  return features;
}

/**
 * Generate chronic conditions based on age
 */
function generateChronicConditions(age) {
  const conditions = [];

  // Chance increases with age
  const baseChance = Math.max(0, (age - 30) / 100); // 0% at 30, 50% at 80

  if (Math.random() < baseChance) {
    const numConditions = Math.random() > 0.7 ? 2 : 1;
    for (let i = 0; i < numConditions; i++) {
      const condition = random(MexicoCity1680.chronicConditions);
      if (!conditions.includes(condition)) {
        conditions.push(condition);
      }
    }
  }

  return conditions;
}

/**
 * Generate personality (Big Five + derived temperament)
 * @param {Object} npc - Partial NPC data
 * @returns {Object} Personality object
 */
export function generatePersonality(npc) {
  const personality = {};

  // Start with base Big Five scores (30-70 range for variety)
  const base = () => randomInt(30, 70);

  personality.bigFive = {
    openness: base(),
    conscientiousness: base(),
    extroversion: base(),
    agreeableness: base(),
    neuroticism: base()
  };

  // Apply occupation modifiers
  const occupationMods = {
    merchant: { extroversion: 15, agreeableness: 10, neuroticism: -5 },
    soldier: { conscientiousness: 15, neuroticism: -10, agreeableness: -5 },
    priest: { agreeableness: 15, conscientiousness: 10, openness: -5 },
    scholar: { openness: 20, extroversion: -10, conscientiousness: 10 },
    beggar: { neuroticism: 15, agreeableness: -10, extroversion: -5 },
    physician: { openness: 15, conscientiousness: 15, intelligence: 10 },
    laborer: { conscientiousness: 10, openness: -5 }
  };

  if (npc.social?.occupation && occupationMods[npc.social.occupation]) {
    const mods = occupationMods[npc.social.occupation];
    Object.keys(mods).forEach(trait => {
      if (personality.bigFive[trait] !== undefined) {
        personality.bigFive[trait] = Math.max(0, Math.min(100, personality.bigFive[trait] + mods[trait]));
      }
    });
  }

  // Calculate humoral temperament from Big Five
  personality.temperament = calculateTemperament(personality.bigFive);

  // Generate behavioral traits from Big Five
  personality.traits = generateTraits(personality.bigFive, npc.social?.occupation);

  return personality;
}

/**
 * Generate behavioral traits from Big Five
 */
function generateTraits(bigFive, occupation) {
  const traits = [];

  // Map Big Five to trait descriptors
  if (bigFive.extroversion > 65) traits.push(random(['outgoing', 'talkative', 'sociable']));
  else if (bigFive.extroversion < 35) traits.push(random(['reserved', 'quiet', 'shy']));

  if (bigFive.agreeableness > 65) traits.push(random(['kind', 'friendly', 'compassionate']));
  else if (bigFive.agreeableness < 35) traits.push(random(['gruff', 'unfriendly', 'callous']));

  if (bigFive.conscientiousness > 65) traits.push(random(['meticulous', 'organized', 'disciplined']));
  else if (bigFive.conscientiousness < 35) traits.push(random(['disorganized', 'careless', 'lazy']));

  if (bigFive.neuroticism > 65) traits.push(random(['anxious', 'nervous', 'worried']));
  else if (bigFive.neuroticism < 35) traits.push(random(['calm', 'stable', 'unflappable']));

  if (bigFive.openness > 65) traits.push(random(['curious', 'imaginative', 'open-minded']));
  else if (bigFive.openness < 35) traits.push(random(['traditional', 'conventional', 'close-minded']));

  // Add occupation-specific trait
  const occupationTraits = {
    merchant: ['shrewd', 'calculating', 'profit-minded'],
    priest: ['pious', 'serene', 'judgmental'],
    soldier: ['disciplined', 'brave', 'gruff'],
    beggar: ['desperate', 'cunning', 'pitiful']
  };

  if (occupation && occupationTraits[occupation]) {
    traits.push(random(occupationTraits[occupation]));
  }

  return traits.slice(0, 4); // Max 4 traits
}

/**
 * Generate clothing based on class and gender
 * @param {Object} npc - NPC data
 * @returns {Object} Clothing object
 */
export function generateClothing(npc) {
  const gender = npc.appearance?.gender || 'male';
  const socialClass = npc.social?.class || 'common';

  // Map class to clothing tier
  const tier = socialClass === 'elite' ? 'elite' :
               socialClass === 'merchant' || socialClass === 'middling' ? 'middling' :
               'common';

  const clothingData = Clothing['1680-mexico-city'][gender][tier];

  const clothing = {
    style: npc.social?.occupation || 'common',
    quality: tier === 'elite' ? 'luxurious' : tier === 'middling' ? 'fine' : 'common',
    cleanliness: random(['clean', 'average', 'dirty', 'filthy']),
    items: [],
    accessories: []
  };

  // Generate individual garments
  clothingData.garments.forEach(garmentTemplate => {
    // Defensive: Check if required data exists
    if (!garmentTemplate.materials || !garmentTemplate.colors) {
      console.warn('[generateClothing] Missing data for garment:', garmentTemplate.name, {
        hasMaterials: !!garmentTemplate.materials,
        hasColors: !!garmentTemplate.colors
      });
      return; // Skip this garment
    }

    const garment = {
      garment: garmentTemplate.name,
      material: random(garmentTemplate.materials),
      color: random(garmentTemplate.colors),
      condition: random(['excellent', 'good', 'worn', 'tattered']),
      decorations: garmentTemplate.decorations ? [random(garmentTemplate.decorations)] : []
    };
    clothing.items.push(garment);
  });

  // Add accessories
  if (clothingData.accessories) {
    const numAccessories = randomInt(1, Math.min(3, clothingData.accessories.length));
    for (let i = 0; i < numAccessories; i++) {
      const accessory = random(clothingData.accessories);
      if (!clothing.accessories.find(a => a.item === accessory)) {
        clothing.accessories.push({
          item: accessory,
          material: tier === 'elite' ? random(['gold', 'silver']) : random(['iron', 'brass', 'wood']),
          description: ''
        });
      }
    }
  }

  return clothing;
}

/**
 * Generate biography
 * @param {Object} npc - NPC data
 * @returns {Object} Biography object
 */
export function generateBiography(npc) {
  const age = npc.appearance?.age || 30;
  const casta = npc.social?.casta || 'mestizo';
  const occupation = npc.social?.occupation || 'laborer';

  const currentYear = 1680;
  const birthYear = currentYear - age;

  const biography = {
    birthYear,
    birthplace: '',
    immigrationYear: null,
    immigrationReason: '',
    majorEvents: [],
    secrets: []
  };

  // Determine birthplace based on casta
  if (casta === 'español') {
    // Spanish-born
    biography.birthplace = random(MexicoCity1680.spanishBirthplaces);
    if (age < 50) { // Immigrated as adult
      biography.immigrationYear = birthYear + randomInt(18, 30);
      biography.immigrationReason = random([
        'seeking fortune in New Spain',
        'fleeing debts in Spain',
        'appointed to colonial position',
        'following family trade routes'
      ]);
    }
  } else {
    // Born in New Spain
    biography.birthplace = random(MexicoCity1680.newSpainBirthplaces);
  }

  // Generate major life events
  const numEvents = randomInt(2, 4);
  const eventYears = [];

  for (let i = 0; i < numEvents; i++) {
    const eventAge = randomInt(15, age - 5);
    const eventYear = birthYear + eventAge;

    if (!eventYears.includes(eventYear)) {
      eventYears.push(eventYear);

      const events = [
        `Apprenticed as ${occupation}`,
        `Married`,
        `Birth of first child`,
        `Moved to Mexico City`,
        `Established business`,
        `Inherited property`,
        `Survived serious illness`,
        `Involved in legal dispute`
      ];

      biography.majorEvents.push({
        year: eventYear,
        event: random(events)
      });
    }
  }

  // Sort events chronologically
  biography.majorEvents.sort((a, b) => a.year - b.year);

  // Generate secrets (20% chance)
  if (Math.random() < 0.2) {
    const secrets = [
      'Owes significant debt to a merchant guild',
      'Has secret converso ancestry',
      'Involved in smuggling contraband',
      'Had affair with notable person',
      'Witnessed a crime but stayed silent',
      'Practices folk magic in secret'
    ];
    biography.secrets.push(random(secrets));
  }

  return biography;
}

/**
 * Generate skills based on occupation and age
 * @param {Object} npc - NPC data
 * @returns {Object} Skills object
 */
export function generateSkills(npc) {
  const occupation = npc.social?.occupation || 'laborer';
  const age = npc.appearance?.age || 30;

  // Base skills (0-100)
  const skills = {
    trade: 0,
    negotiation: 0,
    mathematics: 0,
    literacy: 0,
    languages: 0,
    combat: 0,
    medicine: 0,
    craft: 0
  };

  // Occupation skill bonuses
  const occupationSkills = {
    merchant: { trade: 60, negotiation: 50, mathematics: 40, literacy: 50 },
    soldier: { combat: 60, literacy: 10, craft: 20 },
    priest: { literacy: 70, languages: 50, negotiation: 30 },
    physician: { medicine: 70, literacy: 60, languages: 40 },
    scholar: { literacy: 80, languages: 60, mathematics: 50 },
    laborer: { craft: 40, combat: 20, literacy: 5 },
    beggar: { negotiation: 30, literacy: 0 }
  };

  if (occupationSkills[occupation]) {
    Object.assign(skills, occupationSkills[occupation]);
  }

  // Age bonus (experience)
  const experienceBonus = Math.floor((age - 20) / 5) * 5;
  Object.keys(skills).forEach(skill => {
    if (skills[skill] > 0) {
      skills[skill] = Math.min(100, skills[skill] + experienceBonus);
    }
  });

  return skills;
}

/**
 * Generate dialogue patterns
 * @param {Object} npc - NPC data
 * @returns {Object} Dialogue object
 */
export function generateDialogue(npc) {
  const personality = npc.personality?.bigFive;
  const relationship = npc.relationships?.player?.value || 50;
  const occupation = npc.social?.occupation;

  const dialogue = {
    greeting: '',
    farewell: '',
    personalityPrompt: '',
    voiceStyle: ''
  };

  // Greeting based on relationship and personality
  const greetings = {
    high: [
      '¡Señora de Lima! ¡Qué placer verla!',
      'Ah, my dear friend! Welcome!',
      'María! I was hoping to see you today.'
    ],
    neutral: [
      'Good day, Señora.',
      'Greetings. How may I help you?',
      'Ah, you\'ve come. What brings you here?'
    ],
    low: [
      'What do you want?',
      'You again.',
      'State your business.'
    ]
  };

  const greetingSet = relationship > 65 ? greetings.high :
                      relationship < 35 ? greetings.low :
                      greetings.neutral;

  dialogue.greeting = random(greetingSet);

  // Farewell
  const farewells = {
    high: ['Vaya con Dios, my friend!', 'Until we meet again!', 'May God watch over you.'],
    neutral: ['Good day.', 'Farewell.', 'Until next time.'],
    low: ['Be gone.', 'Leave me.', 'Hmph.']
  };

  const farewellSet = relationship > 65 ? farewells.high :
                      relationship < 35 ? farewells.low :
                      farewells.neutral;

  dialogue.farewell = random(farewellSet);

  // Personality prompt (for LLM)
  const traits = npc.personality?.traits || [];
  dialogue.personalityPrompt = traits.length > 0 ?
    traits.join(', ') :
    'unremarkable';

  // Voice style
  const styles = [];

  if (personality) {
    if (personality.extroversion > 65) styles.push('enthusiastic');
    if (personality.extroversion < 35) styles.push('reserved');
    if (personality.conscientiousness > 65) styles.push('formal');
    if (personality.conscientiousness < 35) styles.push('casual');
    if (personality.openness > 65) styles.push('flowery language');
  }

  // Occupation-specific styles
  if (occupation === 'merchant') styles.push('uses business terms');
  if (occupation === 'priest') styles.push('uses religious language');
  if (occupation === 'soldier') styles.push('direct and blunt');

  dialogue.voiceStyle = styles.join(', ') || 'straightforward';

  return dialogue;
}

/**
 * Export all generator functions
 */
export default {
  generateAppearance,
  generatePersonality,
  generateClothing,
  generateBiography,
  generateSkills,
  generateDialogue
};
