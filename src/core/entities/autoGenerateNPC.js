/**
 * Auto-Generate NPCs
 *
 * Automatically creates procedural NPCs when new names are detected in the narrative.
 * Every named person in the game world should be an interactive, procedurally-generated NPC.
 *
 * @module autoGenerateNPC
 */

import { generateAppearance, generatePersonality, generateClothing, generateBiography, generateSkills, generateDialogue } from './procedural/npcGenerator';
import { MexicoCity1680, random, randomInt } from './procedural/historicalData';
import { scenarioLoader } from '../services/scenarioLoader';
import { entityManager } from './EntityManager';

/**
 * Extract NPC names from narrative text (SCENARIO-AWARE)
 * Uses scenario-specific patterns from npcGeneration config
 * @param {string} narrative - Narrative text
 * @param {string} scenarioId - Current scenario ID
 * @returns {Array<string>} Array of detected NPC names
 */
export function extractNPCNames(narrative, scenarioId = '1680-mexico-city') {
  if (!narrative) return [];

  const scenario = scenarioLoader.loadScenario(scenarioId);
  const npcGen = scenario.npcGeneration;
  const names = [];

  // Pattern 1: "Also present here:" listings (universal)
  const presentHereRegex = /\*\*Also present here:\*\*\s*(.+?)(?:\n|$)/gi;
  const presentHereMatches = narrative.matchAll(presentHereRegex);

  for (const match of presentHereMatches) {
    const namesList = match[1];
    // Split by commas and clean up
    const extractedNames = namesList
      .split(',')
      .map(name => {
        // Remove parenthetical descriptions like "(a wealthy merchant)"
        return name.replace(/\([^)]+\)/g, '').trim();
      })
      .filter(name => name.length > 0 && name.length < 50); // Reasonable name length

    names.push(...extractedNames);
  }

  // Pattern 2: Titles + Names (SCENARIO-SPECIFIC)
  if (npcGen?.namePatterns?.titles) {
    const titlesPattern = npcGen.namePatterns.titles.join('|');
    const titleRegex = new RegExp(`\\b(${titlesPattern})\\s+([A-Z][a-záéíóúñ]+(?:\\s+[A-Z][a-záéíóúñ]+)*)`, 'g');
    const titleMatches = narrative.matchAll(titleRegex);

    for (const match of titleMatches) {
      const fullName = `${match[1]} ${match[2]}`;
      if (!names.includes(fullName)) {
        names.push(fullName);
      }
    }
  }

  // Pattern 3: Full capitalized names (SCENARIO-SPECIFIC REGEX)
  if (npcGen?.namePatterns?.fullNameRegex) {
    const fullNameMatches = narrative.matchAll(npcGen.namePatterns.fullNameRegex);

    for (const match of fullNameMatches) {
      const fullName = match[0]; // Full match
      // Avoid adding if it's already in names or is a common phrase
      if (!names.includes(fullName) && !isCommonPhrase(fullName, npcGen.excludePhrases)) {
        names.push(fullName);
      }
    }
  }

  // Remove duplicates
  return [...new Set(names)];
}

/**
 * Check if a capitalized phrase is a common non-name phrase (SCENARIO-AWARE)
 * @param {string} phrase
 * @param {Array<string>} excludePhrases - Scenario-specific phrases to exclude
 * @returns {boolean}
 */
function isCommonPhrase(phrase, excludePhrases = []) {
  // Use scenario-specific exclude list if provided
  const phrasesToCheck = excludePhrases.length > 0 ? excludePhrases : [
    // Fallback defaults (for backward compatibility)
    'Maria de Lima',
    'Mexico City',
    'New Spain',
    'La Merced',
    'Plaza Mayor',
    'Metropolitan Cathedral',
    'The Inquisition',
    'The Crown',
    'Your Majesty',
    'God Almighty'
  ];

  return phrasesToCheck.some(common =>
    phrase.toLowerCase().includes(common.toLowerCase())
  );
}

/**
 * Infer NPC details from their name and context (SCENARIO-AWARE)
 * @param {string} name - NPC name
 * @param {string} narrative - Full narrative for context
 * @param {string} scenarioId - Current scenario ID
 * @returns {Object} Inferred NPC details
 */
function inferNPCDetails(name, narrative, scenarioId = '1680-mexico-city') {
  const scenario = scenarioLoader.loadScenario(scenarioId);
  const npcGen = scenario.npcGeneration;

  const details = {
    name: name,
    gender: 'male', // Default
    socialClass: npcGen?.defaultSocialClass || 'common',
    occupation: null,
    casta: npcGen?.defaultCasta || 'mestizo',
    type: 'character' // vs 'patient'
  };

  const nameLower = name.toLowerCase();

  // Gender inference (SCENARIO-SPECIFIC)
  if (npcGen?.namePatterns?.feminineTitles) {
    const hasFeminineTitle = npcGen.namePatterns.feminineTitles.some(title =>
      nameLower.includes(title.toLowerCase())
    );
    if (hasFeminineTitle) details.gender = 'female';
  }

  // Social class inference from titles (SCENARIO-SPECIFIC)
  if (npcGen?.namePatterns?.eliteTitles) {
    const hasEliteTitle = npcGen.namePatterns.eliteTitles.some(title =>
      nameLower.includes(title.toLowerCase())
    );
    if (hasEliteTitle) {
      details.socialClass = 'elite';
      details.casta = 'español';
    }
  }

  if (npcGen?.namePatterns?.religiousTitles) {
    const hasReligiousTitle = npcGen.namePatterns.religiousTitles.some(title =>
      nameLower.includes(title.toLowerCase())
    );
    if (hasReligiousTitle) {
      details.socialClass = 'middling';
      details.occupation = 'priest';
    }
  }

  if (npcGen?.namePatterns?.professionalTitles) {
    const hasProfessionalTitle = npcGen.namePatterns.professionalTitles.some(title =>
      nameLower.includes(title.toLowerCase())
    );
    if (hasProfessionalTitle) {
      details.socialClass = 'middling';
      // Infer occupation from the specific title
      if (nameLower.includes('doctor')) details.occupation = 'physician';
      else if (nameLower.includes('maestro')) details.occupation = 'scholar';
    }
  }

  // Occupation inference from context (universal)
  if (narrative.includes('merchant') && narrative.includes(name)) {
    details.occupation = 'merchant';
    details.socialClass = details.socialClass === 'elite' ? 'elite' : 'middling';
  } else if (narrative.includes('herb woman') || narrative.includes('herbalist')) {
    details.occupation = 'herbalist';
    details.socialClass = 'common';
    details.gender = 'female';
  } else if (narrative.includes('patient') || narrative.includes('symptoms') || narrative.includes('sick')) {
    details.type = 'patient';
    details.occupation = 'patient';
  }

  return details;
}

/**
 * Generate a complete procedural NPC (SCENARIO-AWARE)
 * @param {string} name - NPC name
 * @param {string} narrative - Narrative context for inference
 * @param {string} scenarioId - Current scenario
 * @returns {Object} Complete NPC entity
 */
export function generateProceduralNPC(name, narrative = '', scenarioId = '1680-mexico-city') {
  const inferred = inferNPCDetails(name, narrative, scenarioId);
  const scenario = scenarioLoader.loadScenario(scenarioId);
  const npcGen = scenario.npcGeneration;

  // Get historical data for this scenario (fallback to MexicoCity1680)
  const historicalDataKey = npcGen?.historicalDataKey || 'MexicoCity1680';
  const historicalData = historicalDataKey === 'MexicoCity1680' ? MexicoCity1680 : MexicoCity1680; // TODO: Support other datasets

  // Build base NPC structure
  const npc = {
    entityType: 'npc',
    id: `npc_${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
    name: name,
    tier: 'procedural', // vs 'story-critical'
    type: inferred.type,

    social: {
      class: inferred.socialClass,
      casta: inferred.casta,
      occupation: inferred.occupation || random(historicalData.occupations[inferred.socialClass] || historicalData.occupations.common),
      wealth: inferred.socialClass === 'elite' ? 'wealthy' :
              inferred.socialClass === 'middling' ? 'comfortable' : 'poor',
      literacyLevel: inferred.socialClass === 'elite' ? 'well-educated' :
                      inferred.socialClass === 'middling' ? 'literate' : 'illiterate',
      languages: ['Spanish'],
      reputation: randomInt(40, 70),
      faction: null
    },

    appearance: {},
    personality: {},
    clothing: {},
    biography: {},
    skills: {},
    dialogue: {},

    // Initial relationships
    relationships: {
      'player': {
        value: 50,
        type: 'acquaintance',
        status: 'neutral',
        debt: 0,
        lastInteraction: null
      }
    },

    // Empty memory to start
    memory: {
      interactions: [],
      archivedSummary: null
    },

    // Visual
    visual: {
      emoji: inferred.gender === 'female' ? '👩' : '👨',
      image: null,
      portraitStyle: 'procedural',
      icon: inferred.occupation || 'person'
    },

    // Metadata
    metadata: {
      created: Date.now(),
      lastModified: Date.now(),
      version: 1,
      isDiscovered: true,
      isActive: true,
      dataSource: 'procedural',
      scenarioId: scenarioId
    }
  };

  // Generate all procedural details
  npc.appearance = generateAppearance(npc);
  npc.personality = generatePersonality(npc);
  npc.clothing = generateClothing(npc);
  npc.biography = generateBiography(npc);
  npc.skills = generateSkills(npc);
  npc.dialogue = generateDialogue(npc);

  // Add patient-specific data if type is patient
  if (npc.type === 'patient') {
    npc.medicalHistory = generatePatientData(npc);
  }

  return npc;
}

/**
 * Generate basic patient medical data
 * @param {Object} npc - NPC entity
 * @returns {Object} Patient medical data
 */
function generatePatientData(npc) {
  const commonAilments = [
    'fever', 'cough', 'headache', 'stomach pain', 'rash', 'weakness',
    'chest pain', 'swelling', 'dizziness', 'shortness of breath'
  ];

  const numSymptoms = randomInt(2, 4);
  const symptoms = [];
  for (let i = 0; i < numSymptoms; i++) {
    symptoms.push(random(commonAilments));
  }

  return {
    currentSymptoms: symptoms,
    diagnosis: null,
    treatments: [],
    visitHistory: [],
    notes: `Procedurally generated patient. Presenting with: ${symptoms.join(', ')}.`
  };
}

/**
 * Process narrative and auto-generate missing NPCs (SCENARIO-AWARE + ENTITYMANAGER INTEGRATION)
 * @param {string} narrative - Narrative text
 * @param {Array} existingNPCs - Array of existing NPC entities (for backward compatibility)
 * @param {string} scenarioId - Current scenario
 * @returns {Array} Newly generated NPCs
 */
export function autoGenerateNPCsFromNarrative(narrative, existingNPCs = [], scenarioId = '1680-mexico-city') {
  // Use scenario-specific name patterns
  const detectedNames = extractNPCNames(narrative, scenarioId);
  const newNPCs = [];

  detectedNames.forEach(name => {
    // PRIMARY: Check EntityManager first (single source of truth)
    const existingInManager = entityManager.getByName(name);
    if (existingInManager) {
      console.log(`[AutoGen] "${name}" already exists in EntityManager, skipping`);
      return;
    }

    // FALLBACK: Check existingNPCs array (for backward compatibility during migration)
    const existingNames = existingNPCs.map(npc => npc.name.toLowerCase());
    if (existingNames.includes(name.toLowerCase())) {
      console.log(`[AutoGen] "${name}" already exists in array, skipping`);
      return;
    }

    // Skip player character (scenario-specific check could be added here)
    if (name.toLowerCase().includes('maria de lima')) {
      return;
    }

    // Generate new NPC with scenario-aware data
    console.log(`[AutoGen] Creating procedural NPC: ${name}`);
    const npc = generateProceduralNPC(name, narrative, scenarioId);
    newNPCs.push(npc);
  });

  return newNPCs;
}

export default {
  extractNPCNames,
  generateProceduralNPC,
  autoGenerateNPCsFromNarrative
};
