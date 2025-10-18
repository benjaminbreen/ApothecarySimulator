// Main configuration for 1680 Mexico City scenario

import character from './character';
import prompts from './prompts';
import maps from './maps';

// Import existing data (will be migrated to JSON later)
import EntityList from '../../EntityList';
import { initialInventoryData } from '../../initialInventory';
import { generateMariaStartingClothing, autoEquipClothing } from '../../core/entities/procedural/clothingItemGenerator';

// Import foraging data
import FORAGE_LOOT_1680_MEXICO_CITY from './data/forageLoot';

/**
 * @type {import('../../core/types/scenario.types').ScenarioConfig}
 */
export default {
  id: '1680-mexico-city',
  name: '1680 Mexico City',
  description: 'Practice medicine as Maria de Lima, a converso apothecary fleeing the Inquisition in colonial Mexico City.',

  character,

  settings: {
    language: 'Spanish',
    addressStyle: 'Señora de Lima',
    socialNorms: [
      'Address people by last name',
      'Nobility and church officials treat commoners harshly',
      'The Inquisition is a constant threat',
      'Medical practice without physician license is illegal',
      'Conversos (converted Jews) face persecution',
      'Women cannot practice medicine officially'
    ],
    historicalContext: [
      'Mexico City in 1680 is a bustling colonial capital of 100,000+ people',
      'The Spanish Inquisition is active and feared',
      'Humoral medicine is the dominant medical theory',
      'Indigenous and Spanish medical traditions mix',
      'The city has recently recovered from floods (1629-1634)',
      'Tensions between criollos (American-born Spaniards) and peninsulares (Spanish-born) are high'
    ],
    locations: [
      'Botica de la Amargura',
      'La Merced Market',
      'Metropolitan Cathedral',
      'Portal Mercedes',
      'Chapultepec Forest',
      'The Alameda',
      'Plaza Mayor',
      'Inquisition Palace',
      'Hospital Real de los Naturales',
      'San Hipólito',
      'Calle de Tacuba'
    ]
  },

  startDate: 'August 22, 1680',
  startTime: '8:00 AM',
  startLocation: 'Botica de la Amargura, Mexico City',

  currency: 'reales',
  currencySymbol: 'R',
  startingWealth: 11,

  // Initial narrative text displayed at game start
  initialNarrative: `You are **Maria de Lima**, apothecary. Dawn light bathes your shop in Mexico City. The year is 1680, and you have just awoken from a strange dream, only to find that your shop has been visited by a local moneylender, **Don Luis**, who has left behind a message warning you to pay him 100 reales in a week... or else. 

As you grind cacao in a *molcajete* to make hot chocolate, you ponder what to do about your debts. For now, your next move is to feed some scraps of dried fish to a friendly street kitten who you've named **João**.

Meanwhile, the street outside comes to life. Servants hurry past with baskets of fresh produce. A line of Dominican friars makes their way towards the nearby church, casting disapproving glances at a boisterous group of students. A patrol of soldiers carrying pikes is a reminder of troubling rumors – whispers of unrest in the northern provinces.

Just as you begin to sort through your supply of aloe leaves, a sharp knock at the door announces the day's first visitor.

**Will you see who is there, or ignore them?**`,

  debts: {
    'Don Luis (Moneylender)': {
      amount: 100,
      deadline: 'August 23, 1680, 8:00 PM',
      consequence: 'Shop repossession and potential imprisonment'
    },
    'Marta (Herb Woman)': {
      amount: 20,
      deadline: null,
      consequence: 'Loss of primary herb supplier'
    }
  },

  // Using existing EntityList for now - will be migrated to scenario-specific JSON
  npcs: EntityList,

  // Using existing initialInventoryData + procedurally generated clothing
  // Clothing items are equipped and provide social context
  startingInventory: [
    ...initialInventoryData,
    ...autoEquipClothing(generateMariaStartingClothing('1680-mexico-city'))
  ],

  // LEGACY: Scripted events (DEPRECATED - replaced by condition-based system)
  // This turn-based system has been replaced by src/core/systems/npcConditions.js
  // which uses flexible state/date/reputation checks instead of hardcoded turn numbers.
  // Kept for reference during transition period. Can be deleted after testing.
  //
  // OLD BEHAVIOR:
  // - Don Luis appeared exactly on turn 13 (now: appears when debt deadline date passes)
  // - Inquisitor appeared on turns 19/29 (now: appears when church reputation drops below threshold)
  //
  scriptedEvents: [
    // {
    //   turns: 13,
    //   date: 'August 23, 1680',
    //   timeOfDay: 'PM',
    //   npcTag: 'debt-collector-primary',
    //   probability: 1.0,
    //   description: 'Don Luis comes to collect debt on deadline day'
    // },
    // {
    //   turns: [19, 29],
    //   npcTag: 'antagonist-inquisitor',
    //   probability: 0.4,
    //   description: 'Inquisitor may appear on special turns to investigate Maria'
    // }
  ],

  // NPC Generation Rules (scenario-specific)
  // Used by autoGenerateNPC.js for detecting and creating NPCs in narrative
  npcGeneration: {
    // Name patterns for auto-detection in narrative
    namePatterns: {
      // Spanish colonial titles that indicate proper names
      titles: ['Don', 'Doña', 'Padre', 'Fray', 'Sor', 'Señor', 'Señora', 'Doctor', 'Maestro'],

      // Regex for matching full Spanish names with accents
      // Matches: "Juan Hernández", "María de la Cruz", "Pedro López"
      fullNameRegex: /\b([A-Z][a-záéíóúñ]+)\s+([A-Z][a-záéíóúñ]+(?:\s+de\s+[a-záéíóúñ]+)?(?:\s+[A-Z][a-záéíóúñ]+)?)\b/g,

      // Title patterns for gender inference
      feminineTitles: ['Doña', 'Sor', 'Señora'],
      masculineTitles: ['Don', 'Padre', 'Fray', 'Señor', 'Doctor', 'Maestro'],

      // Social class indicators (Spanish colonial casta system)
      eliteTitles: ['Don', 'Doña'],
      religiousTitles: ['Padre', 'Fray', 'Sor'],
      professionalTitles: ['Doctor', 'Maestro']
    },

    // Historical data source key (maps to historicalData.js exports)
    historicalDataKey: 'MexicoCity1680',

    // Common phrases to exclude from name detection (place names, concepts)
    excludePhrases: [
      'Maria de Lima', // Player character
      'Mexico City',
      'New Spain',
      'La Merced',
      'Plaza Mayor',
      'Metropolitan Cathedral',
      'The Inquisition',
      'The Crown',
      'God Almighty',
      'Your Majesty',
      'Portal Mercedes',
      'Botica de la Amargura'
    ],

    // Default social structure for NPCs without clear indicators
    defaultSocialClass: 'common',
    defaultCasta: 'mestizo',

    // Naming instructions for LLM (used in prompts)
    namingGuidelines: `Use historically accurate Spanish colonial names (1680s Mexico City):

**Elite Class** (españoles, criollos):
- Format: Don/Doña + First Name + Surname(s)
- Examples: "Don Juan de Mendoza", "Doña Isabel García de la Cruz"
- Use noble surnames: Mendoza, Cortés, de León, de Silva, Velázquez

**Clergy**:
- Format: Padre/Fray/Sor + First Name + Surname
- Examples: "Padre Diego Martínez", "Sor María de la Concepción", "Fray Antonio Ruiz"

**Middling Class** (merchants, artisans):
- Format: Señor/Señora + First Name + Surname (optional title)
- Examples: "Juan Hernández", "Señora Ana López", "Doctor Miguel Torres"

**Common Class** (laborers, servants):
- Format: First Name + Surname (no titles)
- Examples: "Pedro Ramírez", "Catalina Flores", "Diego Cruz"

**Indigenous NPCs** (indios):
- May use Spanish baptismal names: "Juan Xochitl", "María Citlali"
- Or traditional Nahuatl names: "Cuauhtémoc", "Xochitl"

**Important Rules**:
- ALWAYS use full proper names for named characters
- Match social class to title usage (nobles get Don/Doña, commoners don't)
- Use period-accurate Spanish names (no modern names like "Kevin" or "Jennifer")
- Surnames can be compound: "de la Cruz", "de León", "García Morales"
- Respect the casta system's social hierarchy in naming conventions`
  },

  prompts,

  // Map data for this scenario
  maps,

  // Foraging system data
  foraging: {
    // Loot tables for each location type
    lootTables: FORAGE_LOOT_1680_MEXICO_CITY,

    // Location name → location type ID mapping
    // Maps specific game locations to universal location types
    locationMap: {
      // Player's shop
      'Botica de la Amargura': 'interior-shop',

      // Markets and plazas
      'La Merced Market': 'urban-plaza',
      'Plaza Mayor': 'urban-plaza',
      'Portal Mercedes': 'urban-plaza',
      'Portal de Mercaderes': 'urban-plaza',

      // Streets
      'Calle de Tacuba': 'urban-street',
      'Calle Real': 'urban-street',
      'Calle de Mercaderes': 'urban-street',
      'Calle Santo Domingo': 'urban-street',
      'Calle del Empedradillo': 'urban-street',
      'Calle del Portal': 'urban-street',

      // Alleys
      'Callejón de las Flores': 'urban-alley',
      'Callejón del Ayuntamiento': 'urban-alley',

      // Natural areas
      'Chapultepec Forest': 'forest',
      'The Alameda': 'garden',

      // Religious buildings
      'Metropolitan Cathedral': 'interior-church',
      'San Hipólito': 'interior-church',

      // Government and institutional
      'Inquisition Palace': 'interior-palace',
      'Palace of the Viceroy': 'interior-palace',

      // Medical facilities
      'Hospital Real de los Naturales': 'interior-hospital',
      'Hospital de San Juan de Dios': 'interior-hospital',

      // Waterfront (if Mexico City canal/lake access)
      'Lake Texcoco Shore': 'riverbank',
      'Canal District': 'urban-waterfront',

      // Additional areas
      'Mexico City Outskirts': 'field',
      'Forest Clearing': 'forest',
      'Public Garden': 'garden'
    }
  }
};
