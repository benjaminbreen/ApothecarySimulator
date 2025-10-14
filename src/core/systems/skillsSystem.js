/**
 * Skills System - Revised 6-Family Structure
 *
 * Manages character skills, XP, and leveling for Maria de Lima.
 * Skills are historically accurate for a 1680s converso apothecary in Mexico City.
 *
 * Structure:
 * - 6 skill families (Medical, Social, Practical, Scholarly, Covert, Languages)
 * - 5 skills per family = 30 total skills
 * - All skills have exactly 5 levels
 * - Each level provides a buff
 * - Main unlocks occur at levels 1 and 3
 * - Most skills integrate with existing mechanics or LLM context
 *
 * @module skillsSystem
 */

/**
 * Skill Categories
 */
export const SKILL_CATEGORIES = {
  MEDICAL: 'medical',
  SOCIAL: 'social',
  PRACTICAL: 'practical',
  SCHOLARLY: 'scholarly',
  COVERT: 'covert',
  LANGUAGES: 'languages'
};

/**
 * Category Display Names
 */
export const CATEGORY_LABELS = {
  medical: 'Medical Arts',
  social: 'Social Navigation',
  practical: 'Practical Skills',
  scholarly: 'Scholarly Pursuits',
  covert: 'Covert Operations',
  languages: 'Languages'
};

/**
 * Skill Definitions
 * Each skill has:
 * - id: Unique identifier
 * - name: Display name
 * - category: One of SKILL_CATEGORIES
 * - description: Flavor text
 * - icon: Emoji icon
 * - hardcoded: If true, always starts with this skill
 * - startLevel: Initial level if hardcoded
 * - maxLevel: Always 5
 * - xpPerLevel: XP required to level up (default 20)
 * - effects: Object mapping level → effect definition
 *   - Levels 1 and 3 typically have major unlocks
 *   - All levels provide some benefit
 */
export const SKILLS = {
  // ========== MEDICAL SKILLS ==========

  diagnosis: {
    id: 'diagnosis',
    name: 'Diagnosis',
    category: SKILL_CATEGORIES.MEDICAL,
    description: 'Identify symptoms, diseases, and their underlying humoral imbalances with precision.',
    icon: '🔬',
    hardcoded: true,
    startLevel: 4,
    maxLevel: 5,
    xpPerLevel: 20,
    effects: {
      1: { type: 'unlock_action', action: 'examine_patient', description: 'Unlock "Examine Patient" - identify common ailments (fever, cough, pain)' },
      2: { type: 'llm_buff', buff: 'symptom_detail', value: 0.1, description: '+10% accuracy identifying symptoms in LLM descriptions' },
      3: { type: 'unlock_action', action: 'advanced_examination', description: 'Unlock "Advanced Examination" - identify humoral imbalances, internal disorders' },
      4: { type: 'llm_buff', buff: 'hidden_symptoms', value: 0.2, description: '+20% chance LLM reveals hidden symptoms or complications' },
      5: { type: 'llm_buff', buff: 'master_diagnostician', value: 1.0, description: 'Master diagnostician - Can identify rare/exotic diseases, poison detection' }
    }
  },

  pharmacy: {
    id: 'pharmacy',
    name: 'Pharmacy',
    category: SKILL_CATEGORIES.MEDICAL,
    description: 'Expert knowledge of compounding medicines, dosages, and preparation methods.',
    icon: '💊',
    hardcoded: true,
    startLevel: 4,
    maxLevel: 5,
    xpPerLevel: 20,
    effects: {
      1: { type: 'unlock_action', action: 'compound_basic', description: 'Unlock "Compound Mixing" - create basic remedies (syrups, powders)' },
      2: { type: 'crafting_buff', buff: 'ingredient_waste', value: -0.1, description: '-10% ingredient waste when mixing compounds' },
      3: { type: 'unlock_recipes', category: 'galenic', description: 'Unlock "Galenic Preparations" - create pills, electuaries, troches' },
      4: { type: 'prescription_buff', buff: 'potency', value: 0.15, description: '+15% potency for all crafted medicines' },
      5: { type: 'unlock_recipes', category: 'legendary', description: 'Legendary pharmacist - Can create theriac, mithridatum, other legendary compounds' }
    }
  },

  herbalism: {
    id: 'herbalism',
    name: 'Herbalism',
    category: SKILL_CATEGORIES.MEDICAL,
    description: 'Deep understanding of medicinal plants, their properties, and combinations.',
    icon: '🌿',
    hardcoded: true,
    startLevel: 4,
    maxLevel: 5,
    xpPerLevel: 20,
    effects: {
      1: { type: 'unlock_action', action: 'identify_herb', description: 'Unlock "Identify Herb" - recognize common medicinal plants' },
      2: { type: 'foraging_buff', buff: 'quality', value: 0.1, description: '+10% quality when harvesting/foraging plants' },
      3: { type: 'crafting_feature', feature: 'substitute_ingredients', description: 'Unlock "Substitute Ingredients" - swap similar herbs in recipes without penalty' },
      4: { type: 'foraging_buff', buff: 'rare_chance', value: 0.2, description: '+20% chance of finding rare medicinal plants while foraging' },
      5: { type: 'llm_buff', buff: 'master_herbalist', value: 1.0, description: 'Master herbalist - Knows indigenous, European, and Arabic plant lore' }
    }
  },

  anatomy: {
    id: 'anatomy',
    name: 'Anatomy',
    category: SKILL_CATEGORIES.MEDICAL,
    description: 'Understanding of human body structure, organs, and their functions.',
    icon: '🫀',
    hardcoded: true,
    startLevel: 3,
    maxLevel: 5,
    xpPerLevel: 25,
    effects: {
      1: { type: 'unlock_action', action: 'bloodletting', description: 'Unlock "Bloodletting" - perform phlebotomy safely (modal with body map)' },
      2: { type: 'skill_check_buff', activity: 'surgery', value: 0.1, description: '+10% success rate for surgical procedures' },
      3: { type: 'unlock_action', action: 'minor_surgery', description: 'Unlock "Minor Surgery" - lance boils, remove splinters, set bones' },
      4: { type: 'prescription_buff', buff: 'trauma_survival', value: 0.15, description: '+15% patient survival rate for traumatic injuries' },
      5: { type: 'unlock_action', action: 'major_surgery', description: 'Expert surgeon - Can perform amputations, trepanation, lithotomy' }
    }
  },

  alchemy: {
    id: 'alchemy',
    name: 'Alchemy',
    category: SKILL_CATEGORIES.MEDICAL,
    description: 'Advanced techniques for extracting essences, purification, and transmutation.',
    icon: '⚗️',
    hardcoded: true,
    startLevel: 3,
    maxLevel: 5,
    xpPerLevel: 25,
    effects: {
      1: { type: 'unlock_method', method: 'distill', description: 'Unlock "Distillation" - extract essences, create spirits (aqua vitae, rose water)' },
      2: { type: 'crafting_buff', buff: 'fuel_cost', value: -0.1, description: '-10% fuel cost for alchemical operations' },
      3: { type: 'unlock_method', method: 'calcination', description: 'Unlock "Calcination" - purify metals, create mineral medicines' },
      4: { type: 'crafting_buff', buff: 'yield', value: 0.2, description: '+20% yield from distillation/calcination processes' },
      5: { type: 'unlock_recipes', category: 'chrysopoeia', description: "Philosopher's transmutation - Can attempt chrysopoeia (gold-making), create elixirs" }
    }
  },

  // ========== SOCIAL SKILLS ==========

  persuasion: {
    id: 'persuasion',
    name: 'Persuasion',
    category: SKILL_CATEGORIES.SOCIAL,
    description: 'Influence others through rhetoric, charm, and logical argument.',
    icon: '🗣️',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 20,
    effects: {
      1: { type: 'skill_check', action: 'convince', description: 'Unlock "Convince" action - sway NPCs with logical arguments (dice roll)' },
      2: { type: 'commerce_buff', buff: 'sympathetic_discount', value: 0.1, description: '+10% discount when buying from sympathetic merchants' },
      3: { type: 'skill_check', action: 'rally_support', description: 'Unlock "Rally Support" - gain allies for quests/causes' },
      4: { type: 'llm_buff', buff: 'reputation_gain', value: 0.15, description: '+15% reputation gain from successful interactions' },
      5: { type: 'llm_buff', buff: 'master_orator', value: 1.0, description: 'Master orator - Can sway hostile NPCs, defuse dangerous situations' }
    }
  },

  bargaining: {
    id: 'bargaining',
    name: 'Bargaining',
    category: SKILL_CATEGORIES.SOCIAL,
    description: 'Negotiate favorable prices in trade and commerce.',
    icon: '💰',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 15,
    effects: {
      1: { type: 'unlock_action', action: 'haggle', description: 'Unlock "Haggle" - negotiate prices with merchants' },
      2: { type: 'price_modifier', buy: -0.05, sell: 0.05, description: '-5% buy prices, +5% sell prices' },
      3: { type: 'unlock_action', action: 'bulk_discount', description: 'Unlock "Bulk Discount" - negotiate better deals for large orders' },
      4: { type: 'price_modifier', buy: -0.1, sell: 0.1, description: '-10% buy prices, +10% sell prices' },
      5: { type: 'commerce_feature', feature: 'black_market', description: 'Trade master - Access black market goods, negotiate exclusive contracts' }
    }
  },

  etiquette: {
    id: 'etiquette',
    name: 'Courtly Etiquette',
    category: SKILL_CATEGORIES.SOCIAL,
    description: 'Navigate elite society with grace, propriety, and social awareness.',
    icon: '👑',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 20,
    effects: {
      1: { type: 'llm_buff', buff: 'formal_address', value: 1.0, description: 'Unlock "Formal Address" - interact with nobility/clergy without offense' },
      2: { type: 'llm_buff', buff: 'upper_class_reactions', value: 0.1, description: '+10% positive reactions from upper-class NPCs' },
      3: { type: 'fast_travel', locations: ['viceregal_palace', 'cathedral', 'university'], description: 'Fast travel to elite spaces (Viceregal Palace, Cathedral, University)' },
      4: { type: 'llm_buff', buff: 'official_reputation', value: 0.15, description: '+15% reputation with colonial officials' },
      5: { type: 'llm_quest', quest: 'court_patronage', description: 'Court insider - Can attend viceregal functions, gain patronage' }
    }
  },

  deception: {
    id: 'deception',
    name: 'Deception',
    category: SKILL_CATEGORIES.SOCIAL,
    description: 'Conceal your converso identity and navigate dangerous social situations.',
    icon: '🎭',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 25,
    effects: {
      1: { type: 'skill_check', action: 'lie', description: 'Unlock "Lie" action - attempt to mislead NPCs (dice roll)' },
      2: { type: 'skill_check_buff', activity: 'deception', value: 0.1, description: '+10% success rate for deception checks' },
      3: { type: 'skill_check', action: 'disguise', description: 'Unlock "Disguise" - temporarily hide converso identity or social class' },
      4: { type: 'skill_check_buff', activity: 'forgery', value: 0.2, description: '+20% success rate for forgery/fake documents' },
      5: { type: 'llm_buff', buff: 'master_spy', value: 1.0, description: 'Master spy - Can impersonate others, create elaborate cover stories' }
    }
  },

  intimidation: {
    id: 'intimidation',
    name: 'Intimidation',
    category: SKILL_CATEGORIES.SOCIAL,
    description: 'Project authority and force through presence and threats.',
    icon: '⚔️',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 20,
    effects: {
      1: { type: 'skill_check', action: 'threaten', description: 'Unlock "Threaten" - attempt to coerce NPCs (dice roll)' },
      2: { type: 'skill_check_buff', activity: 'intimidation', value: 0.1, description: '+10% success rate for intimidation checks' },
      3: { type: 'skill_check', action: 'demand_payment', description: 'Unlock "Demand Payment" - aggressively collect debts' },
      4: { type: 'skill_check_buff', activity: 'enemy_flee', value: 0.15, description: '+15% chance of enemies fleeing combat' },
      5: { type: 'llm_buff', buff: 'fearsome_reputation', value: 1.0, description: 'Fearsome reputation - Hostile NPCs may surrender without conflict' }
    }
  },

  // ========== PRACTICAL SKILLS ==========

  foraging: {
    id: 'foraging',
    name: 'Foraging',
    category: SKILL_CATEGORIES.PRACTICAL,
    description: 'Find rare medicinal plants, fungi, and minerals in the wild.',
    icon: '🌾',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 18,
    effects: {
      1: { type: 'unlock_action', action: 'gather_herbs', description: 'Unlock "Gather Herbs" - collect common plants in wilderness' },
      2: { type: 'foraging_buff', buff: 'quantity', value: 0.1, description: '+10% quantity when foraging' },
      3: { type: 'foraging_feature', feature: 'track_animals', description: 'Unlock "Track Animals" - hunt for musk, ambergris, animal parts' },
      4: { type: 'foraging_buff', buff: 'rare_chance', value: 0.2, description: '+20% chance of finding rare ingredients' },
      5: { type: 'foraging_feature', feature: 'exotic_imports', description: 'Master forager - Can find exotic imports (Chinese ginseng, Indian spices)' }
    }
  },

  riding: {
    id: 'riding',
    name: 'Riding',
    category: SKILL_CATEGORIES.PRACTICAL,
    description: 'Horseback riding for faster travel and expanded mobility.',
    icon: '🐴',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 20,
    effects: {
      1: { type: 'fast_travel', locations: ['valley_of_mexico'], description: 'Fast travel to nearby locations (within Valley of Mexico)' },
      2: { type: 'travel_buff', buff: 'speed', value: -0.25, description: '-25% travel time' },
      3: { type: 'fast_travel', locations: ['veracruz', 'puebla', 'oaxaca'], description: 'Fast travel to distant locations (Veracruz, Puebla, Oaxaca)' },
      4: { type: 'travel_buff', buff: 'carry_capacity', value: 0.5, description: '-50% travel time, can carry more goods' },
      5: { type: 'travel_feature', feature: 'own_horse', description: 'Own horse (no rental cost, access to remote areas)' }
    }
  },

  gardening: {
    id: 'gardening',
    name: 'Gardening',
    category: SKILL_CATEGORIES.PRACTICAL,
    description: 'Cultivate your own medicinal herb garden for sustainable supply.',
    icon: '🌱',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 22,
    effects: {
      1: { type: 'unlock_feature', feature: 'garden', description: 'Unlock "Herb Garden" - grow common medicinal plants at home (slow but free)' },
      2: { type: 'time_buff', buff: 'growth_rate', value: 0.1, description: '+10% growth rate for cultivated plants' },
      3: { type: 'garden_feature', feature: 'exotic_cultivation', description: 'Unlock "Exotic Cultivation" - grow New World plants (cocoa, tobacco, chili)' },
      4: { type: 'foraging_buff', buff: 'harvest_yield', value: 0.15, description: '+15% yield from harvested garden' },
      5: { type: 'garden_feature', feature: 'hybridize', description: 'Master horticulturist - Can hybridize plants, create new varieties' }
    }
  },

  preservation: {
    id: 'preservation',
    name: 'Preservation',
    category: SKILL_CATEGORIES.PRACTICAL,
    description: 'Extend the shelf life of ingredients and prevent spoilage.',
    icon: '🧂',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 20,
    effects: {
      1: { type: 'time_buff', buff: 'shelf_life', value: 0.1, description: 'Unlock "Dry Herbs" - extends shelf life by 10%' },
      2: { type: 'time_buff', buff: 'inventory_shelf_life', value: 0.1, description: '+10% shelf life for all inventory items' },
      3: { type: 'crafting_feature', feature: 'pickling', description: 'Unlock "Pickling/Candying" - preserve fruits, roots in sugar/vinegar' },
      4: { type: 'time_buff', buff: 'medicine_shelf_life', value: 0.2, description: '+20% shelf life for preserved medicines' },
      5: { type: 'time_buff', buff: 'perfect_preservation', value: 1.0, description: 'Master preserver - Items never spoil, can create mummia' }
    }
  },

  cooking: {
    id: 'cooking',
    name: 'Cooking',
    category: SKILL_CATEGORIES.PRACTICAL,
    description: 'Prepare nutritious meals and medicinal foods.',
    icon: '🍲',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 15,
    effects: {
      1: { type: 'unlock_action', action: 'prepare_meal', description: 'Unlock "Prepare Meal" - cook food for energy restoration' },
      2: { type: 'resource_buff', buff: 'energy_restored', value: 0.1, description: '+10% energy restored from eating' },
      3: { type: 'crafting_feature', feature: 'medicinal_cuisine', description: 'Unlock "Medicinal Cuisine" - create healing broths, cordials' },
      4: { type: 'resource_buff', buff: 'health_restored', value: 0.15, description: '+15% health restored from medicinal meals' },
      5: { type: 'llm_buff', buff: 'master_chef', value: 1.0, description: 'Master chef - Can create banquet dishes, impress nobility' }
    }
  },

  // ========== SCHOLARLY SKILLS ==========

  natural_philosophy: {
    id: 'natural_philosophy',
    name: 'Natural Philosophy',
    category: SKILL_CATEGORIES.SCHOLARLY,
    description: 'Study of nature, natural laws, and experimental methods.',
    icon: '📚',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 25,
    effects: {
      1: { type: 'unlock_feature', feature: 'research', description: 'Unlock "Research" - consult books for medical knowledge (modal with excerpts)' },
      2: { type: 'xp_buff', skills: ['medical'], value: 0.1, description: '+10% XP gain for all Medical skills' },
      3: { type: 'unlock_feature', feature: 'correspondence', description: 'Unlock "Correspondence" - write to European scholars (send/receive letters)' },
      4: { type: 'skill_check_buff', activity: 'experimental_treatment', value: 0.15, description: '+15% success rate for experimental treatments' },
      5: { type: 'correspondence_feature', feature: 'royal_society', description: 'Unlock "Fellow of Royal Society" - correspond with Royal Society, publish treatises (permanent reputation)' }
    }
  },

  theology: {
    id: 'theology',
    name: 'Catholic Theology',
    category: SKILL_CATEGORIES.SCHOLARLY,
    description: 'Knowledge of the Bible, saints, and Catholic doctrine to avoid suspicion.',
    icon: '✝️',
    hardcoded: true,
    startLevel: 2,
    maxLevel: 5,
    xpPerLevel: 20,
    effects: {
      1: { type: 'llm_buff', buff: 'spiritual_counsel', value: 1.0, description: 'Unlock "Spiritual Counsel" - provide spiritual comfort to patients (+morale)' },
      2: { type: 'llm_buff', buff: 'clergy_reputation', value: 0.1, description: '+10% reputation with clergy' },
      3: { type: 'unlock_action', action: 'exorcism', description: 'Unlock "Exorcism" - perform exorcism to treat "possession" (mental illness)' },
      4: { type: 'prescription_buff', buff: 'placebo_effect', value: 0.15, description: '+15% placebo effect/patient morale' },
      5: { type: 'skill_check', action: 'debate_doctrine', description: 'Theologian - Can debate doctrine, avoid Inquisition suspicion' }
    }
  },

  indigenous_lore: {
    id: 'indigenous_lore',
    name: 'Indigenous Lore',
    category: SKILL_CATEGORIES.SCHOLARLY,
    description: 'Traditional Nahua healing practices and sacred plant knowledge.',
    icon: '🪶',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 30,
    effects: {
      1: { type: 'unlock_feature', feature: 'learn_from_curanderos', description: 'Unlock "Learn From Curanderos" - consult Indigenous healers (research mechanic)' },
      2: { type: 'prescription_buff', buff: 'new_world_medicines', value: 0.1, description: '+10% effectiveness of New World medicines (chocolate, tobacco, peyote)' },
      3: { type: 'unlock_action', action: 'sacred_rituals', description: 'Unlock "Sacred Rituals" - perform temazcal sweat lodge, ritual healing' },
      4: { type: 'llm_buff', buff: 'indigenous_reputation', value: 0.2, description: '+20% relationship gain with Indigenous NPCs' },
      5: { type: 'llm_buff', buff: 'cultural_bridge', value: 1.0, description: 'Cultural bridge - Fluent in Nahua medical cosmology, can synthesize traditions' }
    }
  },

  literacy: {
    id: 'literacy',
    name: 'Literacy',
    category: SKILL_CATEGORIES.SCHOLARLY,
    description: 'Read and write in Spanish with fluency and comprehension.',
    icon: '📖',
    hardcoded: true,
    startLevel: 5,
    maxLevel: 5,
    xpPerLevel: 15,
    effects: {
      1: { type: 'unlock_feature', feature: 'read_write_spanish', description: 'Unlock "Read/Write Spanish" - document patient notes, write letters locally' },
      2: { type: 'llm_buff', buff: 'journal_quality', value: 0.05, description: '+5% quality of journal entries (more detail for future reference)' },
      3: { type: 'research_buff', buff: 'romance_languages', value: 1.0, description: 'Unlock "Translate Texts" - read medical texts in other Romance languages' },
      4: { type: 'research_buff', buff: 'reading_speed', value: 0.1, description: '+10% faster research when consulting books' },
      5: { type: 'correspondence_feature', feature: 'local', description: 'Scholar - Can write letters to anyone in Mexico City, read Gothic script' }
    }
  },

  bookkeeping: {
    id: 'bookkeeping',
    name: 'Bookkeeping',
    category: SKILL_CATEGORIES.SCHOLARLY,
    description: 'Maintain accurate financial records and track expenses.',
    icon: '🧾',
    hardcoded: true,
    startLevel: 1,
    maxLevel: 5,
    xpPerLevel: 18,
    effects: {
      1: { type: 'unlock_feature', feature: 'ledger', description: 'Unlock "Account Ledger" - track income/expenses systematically (ledger UI modal)' },
      2: { type: 'commerce_buff', buff: 'profit', value: 0.05, description: '+5% profit from all sales' },
      3: { type: 'commerce_feature', feature: 'credit_system', description: 'Unlock "Credit System" - offer payment plans, collect debts efficiently' },
      4: { type: 'commerce_buff', buff: 'wealth_generation', value: 0.1, description: '+10% wealth generation from business operations' },
      5: { type: 'commerce_feature', feature: 'investments', description: 'Master merchant - Can invest in trade ventures, earn passive income' }
    }
  },

  // ========== COVERT SKILLS ==========

  stealth: {
    id: 'stealth',
    name: 'Stealth',
    category: SKILL_CATEGORIES.COVERT,
    description: 'Move undetected through shadows and crowds.',
    icon: '🌙',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 25,
    effects: {
      1: { type: 'skill_check', action: 'sneak', description: 'Unlock "Sneak" - attempt to move undetected (dice roll + LLM narration)' },
      2: { type: 'skill_check_buff', activity: 'stealth', value: 0.1, description: '+10% success rate for stealth checks' },
      3: { type: 'skill_check', action: 'eavesdrop', description: 'Unlock "Eavesdrop" - listen to private conversations (LLM reveals secrets)' },
      4: { type: 'llm_buff', buff: 'avoid_encounters', value: 0.15, description: '+15% chance of avoiding random encounters' },
      5: { type: 'llm_buff', buff: 'shadow_walker', value: 1.0, description: 'Shadow walker - Can infiltrate restricted areas, escape pursuit' }
    }
  },

  lockpicking: {
    id: 'lockpicking',
    name: 'Lockpicking',
    category: SKILL_CATEGORIES.COVERT,
    description: 'Open locks without keys using improvised tools.',
    icon: '🗝️',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 30,
    effects: {
      1: { type: 'skill_check', action: 'pick_lock', description: 'Unlock "Pick Lock" - attempt to open simple locks (dice roll + LLM narration)' },
      2: { type: 'skill_check_buff', activity: 'lockpicking', value: 0.1, description: '+10% success rate for lockpicking checks' },
      3: { type: 'skill_check', action: 'pick_complex_lock', description: 'Unlock "Advanced Locks" - open complex mechanisms (safes, gates)' },
      4: { type: 'skill_check_buff', activity: 'lockpicking_speed', value: 0.5, description: '-50% time required to pick locks' },
      5: { type: 'llm_buff', buff: 'master_thief', value: 1.0, description: 'Master thief - Can open any lock, leave no evidence' }
    }
  },

  theft: {
    id: 'theft',
    name: 'Theft',
    category: SKILL_CATEGORIES.COVERT,
    description: 'Steal rare ingredients, coins, or valuables. Risky but profitable.',
    icon: '🤏',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 30,
    effects: {
      1: { type: 'skill_check', action: 'pickpocket', description: 'Unlock "Pickpocket" - steal small items from NPCs (dice roll, adds to inventory)' },
      2: { type: 'skill_check_buff', activity: 'theft', value: 0.1, description: '+10% success rate for theft checks' },
      3: { type: 'skill_check', action: 'burglary', description: 'Unlock "Burglary" - break into homes/shops at night' },
      4: { type: 'commerce_buff', buff: 'stolen_value', value: 0.2, description: '+20% value of stolen goods' },
      5: { type: 'commerce_feature', feature: 'fence_goods', description: 'Master burglar - Can steal heavily guarded items, fence goods' }
    }
  },

  disguise: {
    id: 'disguise',
    name: 'Disguise',
    category: SKILL_CATEGORIES.COVERT,
    description: 'Alter appearance and mannerisms to avoid recognition.',
    icon: '👤',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 25,
    effects: {
      1: { type: 'skill_check', action: 'change_appearance', description: 'Unlock "Change Appearance" - alter clothing/mannerisms' },
      2: { type: 'skill_check_buff', activity: 'disguise', value: 0.1, description: '+10% success rate for disguise checks' },
      3: { type: 'skill_check', action: 'impersonate', description: 'Unlock "Impersonate" - pose as specific NPCs (servants, officials)' },
      4: { type: 'skill_check_buff', activity: 'disguise_duration', value: 0.15, description: '+15% duration disguise remains believable' },
      5: { type: 'llm_buff', buff: 'master_of_disguise', value: 1.0, description: 'Master of disguise - Can impersonate any social class, avoid recognition' }
    }
  },

  combat: {
    id: 'combat',
    name: 'Combat',
    category: SKILL_CATEGORIES.COVERT,
    description: 'Self-defense with blades and hand-to-hand fighting. Survival in dangerous encounters.',
    icon: '⚔️',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 28,
    effects: {
      1: { type: 'skill_check', action: 'defend', description: 'Unlock "Defend" - use weapons for self-defense (knife, club) in combat' },
      2: { type: 'combat_buff', buff: 'damage_dealt', value: 0.1, damage_reduction: 0.05, description: '+10% damage dealt, -5% damage received' },
      3: { type: 'skill_check', action: 'disarm', description: 'Unlock "Disarm" - attempt to disarm attackers in combat' },
      4: { type: 'combat_buff', buff: 'crit_chance', value: 0.15, dodge: 0.1, description: '+15% chance to critical hit, +10% dodge chance' },
      5: { type: 'llm_buff', buff: 'duelist', value: 1.0, description: 'Duelist - Can challenge NPCs to formal combat, use rapier/firearms' }
    }
  },

  // ========== LANGUAGES ==========

  nahuatl: {
    id: 'nahuatl',
    name: 'Nahuatl',
    category: SKILL_CATEGORIES.LANGUAGES,
    description: 'Speak the indigenous language of the Mexica people.',
    icon: '🌽',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 30,
    effects: {
      1: { type: 'llm_language', language: 'nahuatl_basic', description: 'Unlock "Basic Phrases" - greet, trade with Nahua speakers (LLM varies dialogue)' },
      2: { type: 'commerce_buff', buff: 'indigenous_prices', value: 0.1, description: '+10% better prices when trading with Indigenous merchants' },
      3: { type: 'llm_language', language: 'nahuatl_conversational', description: 'Unlock "Conversational" - discuss medicine, learn plant names (LLM deeper dialogue)' },
      4: { type: 'llm_buff', buff: 'indigenous_reputation', value: 0.15, description: '+15% reputation gain with Indigenous NPCs' },
      5: { type: 'llm_language', language: 'nahuatl_fluent', description: 'Fluent - Understand Nahua cosmology, poetry, metaphor (LLM full access)' }
    }
  },

  latin: {
    id: 'latin',
    name: 'Latin',
    category: SKILL_CATEGORIES.LANGUAGES,
    description: 'Read medical texts, correspond with scholars, and access classical knowledge.',
    icon: '📜',
    hardcoded: true,
    startLevel: 3,
    maxLevel: 5,
    xpPerLevel: 25,
    effects: {
      1: { type: 'research_buff', buff: 'medical_latin', value: 1.0, description: 'Unlock "Medical Latin" - read European medical texts, prescriptions (research mechanic)' },
      2: { type: 'xp_buff', skills: ['scholarly'], value: 0.1, description: '+10% XP gain for Scholarly skills' },
      3: { type: 'llm_language', language: 'latin_ecclesiastical', description: 'Unlock "Ecclesiastical Latin" - read Church documents, debate clergy (LLM dialogue)' },
      4: { type: 'llm_buff', buff: 'scholar_clergy_reputation', value: 0.15, description: '+15% reputation with scholars/clergy' },
      5: { type: 'research_buff', buff: 'classical_latin', value: 1.0, description: 'Classical scholar - Read ancient Roman texts (Galen, Pliny, Dioscorides)' }
    }
  },

  french: {
    id: 'french',
    name: 'French',
    category: SKILL_CATEGORIES.LANGUAGES,
    description: 'Communicate with French traders, diplomats, and expatriates.',
    icon: '🥖',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 30,
    effects: {
      1: { type: 'llm_language', language: 'french_basic', description: 'Unlock "Basic French" - communicate with French traders/diplomats (LLM varies dialogue)' },
      2: { type: 'commerce_buff', buff: 'french_goods', value: 0.1, description: '+10% access to French imported goods (wines, perfumes)' },
      3: { type: 'llm_language', language: 'french_conversational', description: 'Unlock "Conversational" - discuss politics, philosophy (LLM deeper dialogue)' },
      4: { type: 'llm_buff', buff: 'european_expatriate_reputation', value: 0.15, description: '+15% reputation with European expatriates' },
      5: { type: 'research_buff', buff: 'french_medical', value: 1.0, description: 'Fluent - Read French medical innovations, correspond with Paris (research + correspondence)' }
    }
  },

  english: {
    id: 'english',
    name: 'English',
    category: SKILL_CATEGORIES.LANGUAGES,
    description: 'Communicate with English pirates, traders, and Caribbean merchants.',
    icon: '🏴',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 30,
    effects: {
      1: { type: 'llm_language', language: 'english_basic', description: 'Unlock "Basic English" - communicate with English pirates/traders (LLM varies dialogue)' },
      2: { type: 'commerce_buff', buff: 'english_smuggled', value: 0.1, description: '+10% access to English smuggled goods (tobacco, sugar)' },
      3: { type: 'llm_language', language: 'english_conversational', description: 'Unlock "Conversational" - negotiate with Caribbean merchants (LLM deeper dialogue)' },
      4: { type: 'llm_buff', buff: 'protestant_reputation', value: 0.15, description: '+15% reputation with Protestant networks' },
      5: { type: 'research_buff', buff: 'english_herbals', value: 1.0, description: 'Fluent - Read English herbal texts, understand colonial politics (research + LLM)' }
    }
  },

  greek: {
    id: 'greek',
    name: 'Greek',
    category: SKILL_CATEGORIES.LANGUAGES,
    description: 'Read classical medical and philosophical texts in their original language.',
    icon: '🏛️',
    hardcoded: false,
    maxLevel: 5,
    xpPerLevel: 35,
    effects: {
      1: { type: 'research_buff', buff: 'medical_greek', value: 1.0, description: 'Unlock "Medical Greek" - read Hippocratic/Galenic texts in original (research mechanic)' },
      2: { type: 'xp_buff', skills: ['medical'], value: 0.1, description: '+10% XP gain for Medical skills' },
      3: { type: 'research_buff', buff: 'philosophical_greek', value: 1.0, description: 'Unlock "Philosophical Greek" - read Aristotle, Theophrastus (research mechanic)' },
      4: { type: 'prescription_buff', buff: 'humoral_theory', value: 0.2, description: '+20% understanding of humoral theory applications' },
      5: { type: 'research_buff', buff: 'byzantine_greek', value: 1.0, description: 'Master - Read Byzantine medical manuscripts, debate philosophy (research + LLM)' }
    }
  }
};

/**
 * Get all available skills
 */
export function getAllSkills() {
  return Object.values(SKILLS);
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(category) {
  return Object.values(SKILLS).filter(skill => skill.category === category);
}

/**
 * Get hardcoded starting skills
 */
export function getHardcodedSkills() {
  return Object.values(SKILLS).filter(skill => skill.hardcoded);
}

/**
 * Get random starting skills (non-hardcoded)
 * @param {number} count - Number of random skills to select
 * @returns {Array} Array of skill IDs
 */
export function getRandomStartingSkills(count = 2) {
  const available = Object.values(SKILLS).filter(skill => !skill.hardcoded);
  const selected = [];

  // Weight certain skills more likely for a converso apothecary
  const weights = {
    natural_philosophy: 2.0,
    indigenous_lore: 1.5,
    persuasion: 1.5,
    etiquette: 1.2,
    cooking: 1.3,
    foraging: 1.5,
    gardening: 1.3,
    bargaining: 1.8,
    deception: 2.0,
    bookkeeping: 1.4,
    nahuatl: 1.2,
    french: 0.8,
    english: 0.6,
    greek: 0.5,
    stealth: 0.7,
    lockpicking: 0.5,
    theft: 0.6,
    disguise: 0.8,
    combat: 0.6,
    intimidation: 0.7,
    riding: 1.0,
    preservation: 1.2
  };

  while (selected.length < count && available.length > 0) {
    // Weighted random selection
    let totalWeight = 0;
    available.forEach(skill => {
      totalWeight += (weights[skill.id] || 1.0);
    });

    let random = Math.random() * totalWeight;
    let cumulative = 0;

    for (const skill of available) {
      cumulative += (weights[skill.id] || 1.0);
      if (random <= cumulative) {
        selected.push(skill.id);
        available.splice(available.indexOf(skill), 1);
        break;
      }
    }
  }

  return selected;
}

/**
 * Initialize player skills with fixed baseline + random auxiliary
 * Fixed baseline: Core medical knowledge and languages (always same for replayability)
 * Random auxiliary: 10 skill points distributed randomly for variety
 *
 * @param {number} startLevel - Starting character level (default 1)
 * @param {number|null} startXP - Starting XP (default null = random 5-15)
 * @returns {Object} Initial player skills state
 */
export function initializePlayerSkills(startLevel = 1, startXP = null) {
  const knownSkills = {};

  // Generate random starting XP between 5-15 if not explicitly provided
  const initialXP = startXP !== null ? startXP : Math.floor(Math.random() * 11) + 5;

  // FIXED BASELINE SKILLS (always the same)
  // Core Medical Knowledge - Considerable starting skills
  knownSkills.diagnosis = { level: 4, xp: 0 };
  knownSkills.pharmacy = { level: 4, xp: 0 };
  knownSkills.herbalism = { level: 4, xp: 0 };
  knownSkills.anatomy = { level: 3, xp: 0 };
  knownSkills.alchemy = { level: 3, xp: 0 };

  // Language Skills - Literacy MAXED OUT (Maria is highly educated)
  knownSkills.literacy = { level: 5, xp: 0 };  // Spanish literacy - can write to anyone in Mexico City
  knownSkills.latin = { level: 3, xp: 0 };     // Can read medical texts

  // Defensive Knowledge
  knownSkills.theology = { level: 2, xp: 0 };  // Avoid Inquisition suspicion

  // Practical Knowledge
  knownSkills.bookkeeping = { level: 1, xp: 0 };  // Track finances and expenses

  // RANDOM AUXILIARY SKILLS (8 skill points distributed randomly)
  const availableSkills = Object.values(SKILLS)
    .filter(skill => !skill.hardcoded)
    .map(skill => skill.id);

  let pointsToDistribute = 8;
  const skillWeights = {
    natural_philosophy: 2.0,
    indigenous_lore: 1.5,
    persuasion: 1.5,
    etiquette: 1.2,
    cooking: 1.3,
    foraging: 1.5,
    gardening: 1.3,
    bargaining: 1.8,
    deception: 2.0,
    bookkeeping: 1.4,
    nahuatl: 1.2,
    french: 0.8,
    english: 0.6,
    greek: 0.5,
    stealth: 0.7,
    lockpicking: 0.5,
    theft: 0.6,
    disguise: 0.8,
    combat: 0.6,
    intimidation: 0.7,
    riding: 1.0,
    preservation: 1.2
  };

  while (pointsToDistribute > 0 && availableSkills.length > 0) {
    // Weighted random selection of a skill
    let totalWeight = 0;
    availableSkills.forEach(skillId => {
      totalWeight += (skillWeights[skillId] || 1.0);
    });

    let random = Math.random() * totalWeight;
    let cumulative = 0;
    let selectedSkillId = null;

    for (const skillId of availableSkills) {
      cumulative += (skillWeights[skillId] || 1.0);
      if (random <= cumulative) {
        selectedSkillId = skillId;
        break;
      }
    }

    if (selectedSkillId) {
      // Add skill or level it up
      const currentLevel = knownSkills[selectedSkillId]?.level || 0;
      const maxLevel = SKILLS[selectedSkillId]?.maxLevel || 5;

      if (currentLevel < maxLevel) {
        // Randomly add 1-2 levels (weighted toward 1)
        const levelsToAdd = Math.random() < 0.7 ? 1 : Math.min(2, pointsToDistribute);
        const newLevel = Math.min(currentLevel + levelsToAdd, maxLevel);

        knownSkills[selectedSkillId] = {
          level: newLevel,
          xp: 0
        };

        pointsToDistribute -= levelsToAdd;
      }

      // If skill is maxed, remove from available pool
      if ((knownSkills[selectedSkillId]?.level || 0) >= maxLevel) {
        availableSkills.splice(availableSkills.indexOf(selectedSkillId), 1);
      }
    }

    // Safety: If we can't distribute any more points, break
    if (availableSkills.length === 0 || pointsToDistribute <= 0) {
      break;
    }
  }

  return {
    knownSkills,          // { skillId: { level, xp } }
    learningSkills: [],   // [{ skillId, xp }] - skills being actively trained
    skillPoints: 0,       // Unspent skill points
    level: startLevel,    // Player level (from character.js)
    xp: initialXP,        // Current XP towards next level (random 5-15)
    xpToNextLevel: 20,    // XP needed for next level (flat 20 always)
    totalXP: 0            // Total XP earned
  };
}

/**
 * Add XP to player's total
 * @param {Object} playerSkills - Current player skills state
 * @param {number} xp - XP to add
 * @returns {Object} Updated state with level-ups
 */
export function addXP(playerSkills, xp) {
  const newState = { ...playerSkills, xp: playerSkills.xp + xp, totalXP: playerSkills.totalXP + xp };

  // Check for player level-ups (flat 20 XP per level)
  while (newState.xp >= newState.xpToNextLevel) {
    newState.xp -= newState.xpToNextLevel;
    newState.level += 1;
    newState.skillPoints += 1;
    console.log(`[Skills] Level up! Now level ${newState.level}. +1 skill point`);

    // Flat 20 XP per level (simple, predictable progression)
    newState.xpToNextLevel = 20;
  }

  return newState;
}

/**
 * Add XP to a specific skill being learned
 * @param {Object} playerSkills - Current player skills state
 * @param {string} skillId - Skill being trained
 * @param {number} xp - XP to add
 * @returns {Object} Updated state with potential skill acquisition
 */
export function addSkillXP(playerSkills, skillId, xp) {
  const newState = {
    ...playerSkills,
    knownSkills: { ...playerSkills.knownSkills },
    learningSkills: [...playerSkills.learningSkills]
  };
  const skill = SKILLS[skillId];
  let leveledUp = false;

  if (!skill) {
    console.error(`[Skills] Unknown skill: ${skillId}`);
    return { newState, leveledUp: false };
  }

  // If learning this skill
  const learningIndex = newState.learningSkills.findIndex(l => l.skillId === skillId);
  if (learningIndex >= 0) {
    newState.learningSkills[learningIndex] = {
      ...newState.learningSkills[learningIndex],
      xp: newState.learningSkills[learningIndex].xp + xp
    };

    // Check if learned (XP threshold met)
    const xpRequired = skill.xpPerLevel || 20;
    if (newState.learningSkills[learningIndex].xp >= xpRequired) {
      // Move to known skills at level 1
      newState.knownSkills[skillId] = { level: 1, xp: 0 };
      newState.learningSkills.splice(learningIndex, 1);
      leveledUp = true;  // Learning a skill counts as leveling up
      console.log(`[Skills] Learned new skill: ${skill.name}!`);
    }
  }
  // If already know this skill, add to skill XP for level-up
  else if (newState.knownSkills[skillId]) {
    const currentSkill = { ...newState.knownSkills[skillId] };
    currentSkill.xp += xp;

    // Check for skill level-up
    const xpRequired = skill.xpPerLevel || 20;
    if (currentSkill.xp >= xpRequired && currentSkill.level < skill.maxLevel) {
      currentSkill.level += 1;
      currentSkill.xp = 0;
      leveledUp = true;
      console.log(`[Skills] ${skill.name} leveled up to ${currentSkill.level}!`);
    }

    newState.knownSkills[skillId] = currentSkill;
  }

  return { newState, leveledUp };
}

/**
 * Start learning a new skill (costs 1 skill point)
 * @param {Object} playerSkills - Current player skills state
 * @param {string} skillId - Skill to start learning
 * @returns {Object} Updated state
 */
export function startLearningSkill(playerSkills, skillId) {
  if (playerSkills.skillPoints < 1) {
    console.error('[Skills] Not enough skill points');
    return playerSkills;
  }

  if (playerSkills.knownSkills[skillId]) {
    console.error('[Skills] Already know this skill');
    return playerSkills;
  }

  if (playerSkills.learningSkills.find(l => l.skillId === skillId)) {
    console.error('[Skills] Already learning this skill');
    return playerSkills;
  }

  const newState = {
    ...playerSkills,
    skillPoints: playerSkills.skillPoints - 1,
    learningSkills: [...playerSkills.learningSkills, { skillId, xp: 0 }]
  };

  console.log(`[Skills] Started learning ${SKILLS[skillId].name}`);
  return newState;
}

/**
 * Spend skill point to level up an existing skill
 * @param {Object} playerSkills - Current player skills state
 * @param {string} skillId - Skill to level up
 * @returns {Object} Updated state
 */
export function levelUpSkill(playerSkills, skillId) {
  if (playerSkills.skillPoints < 1) {
    console.error('[Skills] Not enough skill points');
    return playerSkills;
  }

  if (!playerSkills.knownSkills[skillId]) {
    console.error('[Skills] Don\'t know this skill yet');
    return playerSkills;
  }

  const currentSkill = playerSkills.knownSkills[skillId];
  const skill = SKILLS[skillId];
  if (currentSkill.level >= skill.maxLevel) {
    console.error('[Skills] Skill already at max level');
    return playerSkills;
  }

  const newState = {
    ...playerSkills,
    skillPoints: playerSkills.skillPoints - 1,
    knownSkills: {
      ...playerSkills.knownSkills,
      [skillId]: { ...currentSkill, level: currentSkill.level + 1 }
    }
  };

  console.log(`[Skills] Spent skill point to level up ${SKILLS[skillId].name} to level ${newState.knownSkills[skillId].level}`);
  return newState;
}

/**
 * Get active effects from all skills
 * @param {Object} playerSkills - Current player skills state
 * @returns {Object} All active effects
 */
export function getActiveSkillEffects(playerSkills) {
  const effects = {
    priceModifiers: { buy: 0, sell: 0 },
    reputationBonuses: {},
    unlockedActions: [],
    unlockedFeatures: [],
    successRateBonuses: {},
    skillChecks: {},
    llmBuffs: {},
    // ... etc
  };

  if (!playerSkills || !playerSkills.knownSkills) {
    return effects;
  }

  Object.entries(playerSkills.knownSkills).forEach(([skillId, skillData]) => {
    const skill = SKILLS[skillId];
    if (!skill) return;

    // Get all effects up to current level
    for (let level = 1; level <= skillData.level; level++) {
      const effect = skill.effects[level];
      if (!effect) continue;

      // Apply effect based on type
      switch (effect.type) {
        case 'price_modifier':
          effects.priceModifiers.buy += effect.buy || 0;
          effects.priceModifiers.sell += effect.sell || 0;
          break;
        case 'llm_buff':
          effects.llmBuffs[effect.buff] = effect.value;
          break;
        case 'unlock_action':
          if (!effects.unlockedActions.includes(effect.action)) {
            effects.unlockedActions.push(effect.action);
          }
          break;
        case 'unlock_feature':
          if (!effects.unlockedFeatures.includes(effect.feature)) {
            effects.unlockedFeatures.push(effect.feature);
          }
          break;
        case 'skill_check':
          effects.skillChecks[effect.action] = { skillId, level: skillData.level };
          break;
        // ... handle other effect types
      }
    }
  });

  return effects;
}

/**
 * Convert playerSkills to format expected by PlayerCharacterModal
 * @param {Object} playerSkills - Player skills state
 * @returns {Object} Skills grouped by category with full metadata
 */
export function convertSkillsForModal(playerSkills) {
  if (!playerSkills || !playerSkills.knownSkills) {
    return {};
  }

  const skillsByCategory = {};

  Object.entries(playerSkills.knownSkills).forEach(([skillId, skillData]) => {
    const skill = SKILLS[skillId];
    if (!skill) return;

    const category = skill.category;
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }

    skillsByCategory[category].push({
      id: skillId,
      name: skill.name,
      icon: skill.icon,
      level: skillData.level,
      xp: skillData.xp,
      maxLevel: skill.maxLevel,
      description: skill.description
    });
  });

  return skillsByCategory;
}

export default {
  SKILLS,
  SKILL_CATEGORIES,
  CATEGORY_LABELS,
  getAllSkills,
  getSkillsByCategory,
  initializePlayerSkills,
  addXP,
  addSkillXP,
  startLearningSkill,
  levelUpSkill,
  getActiveSkillEffects,
  convertSkillsForModal,
  getRandomStartingSkills
};
