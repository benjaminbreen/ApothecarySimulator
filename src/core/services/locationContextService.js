/**
 * Location Context Service
 *
 * Generates NPC presence for specific locations based on:
 * - Pre-defined location NPCs (locationNPCs.js)
 * - Time of day
 * - Probabilistic variation
 *
 * This ensures consistency between:
 * - List function (shows who's present)
 * - Narrative agent (knows who's there)
 * - Map display (shows NPC positions)
 */

import LOCATION_NPCS, { getTimeOfDay, randomInt, randomChoice } from '../../scenarios/1680-mexico-city/locationNPCs';
import { entityManager } from '../entities/EntityManager';

/**
 * Generate list of NPCs present at a location
 *
 * @param {string} mapId - Map ID (e.g., 'consulado-interior', 'mercado-interior')
 * @param {string} time - Current game time (e.g., '9:00 AM')
 * @param {string} date - Current game date (for future date-based variation)
 * @returns {Array<Object>} List of NPC objects with populated data
 */
export function getLocationNPCs(mapId, time, date) {
  console.log(`[LocationContextService] Generating NPCs for ${mapId} at ${time}`);

  const locationData = LOCATION_NPCS[mapId];

  // If no location data, return empty array (dynamic/outdoor locations)
  if (!locationData) {
    console.log(`[LocationContextService] No location data for ${mapId}`);
    return [];
  }

  const presentNPCs = [];
  const timeCategory = getTimeOfDay(time);
  console.log(`[LocationContextService] Time category: ${timeCategory}`);

  // STEP 1: Add permanent NPCs (always present)
  if (locationData.permanent) {
    locationData.permanent.forEach(npcData => {
      // Check if NPC has time restrictions
      if (npcData.timeOfDay && !npcData.timeOfDay.includes(timeCategory)) {
        console.log(`[LocationContextService] Skipping ${npcData.name} - wrong time of day`);
        return;
      }

      const npc = resolveNPC(npcData, 0);
      if (npc) {
        presentNPCs.push(npc);
        console.log(`[LocationContextService] Added permanent NPC: ${npc.name}`);
      }
    });
  }

  // STEP 2: Probabilistically add typical NPCs
  if (locationData.typical) {
    locationData.typical.forEach((template, templateIndex) => {
      // Check time of day match
      if (template.timeOfDay && !template.timeOfDay.includes(timeCategory)) {
        return;
      }

      // Roll probability
      const roll = Math.random();
      if (roll > template.probability) {
        console.log(`[LocationContextService] Skipped template ${template.template || template.name} (rolled ${roll.toFixed(2)} vs ${template.probability})`);
        return;
      }

      // Determine count (default 1)
      const count = template.count ? randomInt(template.count[0], template.count[1]) : 1;

      // Generate instances
      for (let i = 0; i < count; i++) {
        const npc = resolveNPC(template, i, templateIndex);
        if (npc) {
          presentNPCs.push(npc);
          console.log(`[LocationContextService] Added typical NPC: ${npc.name || npc.description}`);
        }
      }
    });
  }

  console.log(`[LocationContextService] Generated ${presentNPCs.length} total NPCs for ${mapId}`);
  return presentNPCs;
}

/**
 * Resolve an NPC template into an actual NPC object
 *
 * For named NPCs: Retrieve from EntityManager or register
 * For templates: Generate from template data
 *
 * @param {Object} npcData - NPC data or template
 * @param {number} index - Index for template instances (0, 1, 2...)
 * @param {number} templateIndex - Template position in typical array
 * @returns {Object} Resolved NPC object
 */
function resolveNPC(npcData, index = 0, templateIndex = 0) {
  // Named NPC - permanent character in the game
  if (npcData.name && !npcData.template) {
    // Check if already registered in EntityManager
    let existingNPC = entityManager.getByName(npcData.name);

    if (existingNPC) {
      // Merge with location-specific activity
      return {
        ...existingNPC,
        currentActivity: resolveValue(npcData.activity, index),
        currentClothing: resolveValue(npcData.clothing, index)
      };
    }

    // Not registered yet - create minimal NPC object for location context
    // (EntityManager registration happens when NPC actually interacts with player)
    return {
      name: npcData.name,
      demographics: npcData.demographics,
      occupation: npcData.occupation,
      clothing: resolveValue(npcData.clothing, index),
      activity: resolveValue(npcData.activity, index),
      description: npcData.description || '',
      portraitImage: npcData.portraitImage || null,
      isLocationNPC: true,
      isPermanent: npcData.alwaysPresent || false,
      isAnimal: npcData.isAnimal || false
    };
  }

  // Template NPC - generic background character
  return generateFromTemplate(npcData, index, templateIndex);
}

/**
 * Generate a generic NPC from a template
 *
 * @param {Object} template - Template definition
 * @param {number} index - Instance index (for multiple copies)
 * @param {number} templateIndex - Template position
 * @returns {Object} Generated NPC
 */
function generateFromTemplate(template, index, templateIndex) {
  const demographics = {
    age: resolveValue(template.demographics.age, index),
    gender: resolveValue(template.demographics.gender, index),
    casta: resolveValue(template.demographics.casta, index),
    class: resolveValue(template.demographics.class, index)
  };

  // Generate description based on demographics and occupation
  const article = demographics.gender === 'female' ? 'A' : 'A';
  const ageDesc = demographics.age === 'young' ? 'young' :
                  demographics.age === 'elderly' ? 'elderly' :
                  demographics.age === 'middle-aged' ? 'middle-aged' : '';
  const castaDesc = demographics.casta;
  const genderDesc = demographics.gender === 'female' ? 'woman' : 'man';

  const occupation = resolveValue(template.occupation, index);
  const occLower = occupation.toLowerCase();

  const description = `${article} ${ageDesc} ${castaDesc} ${genderDesc}`.replace(/\s+/g, ' ').trim();

  // For multiple instances of same template, add number
  const instanceSuffix = (template.count && template.count[1] > 1 && index > 0) ? ` #${index + 1}` : '';

  return {
    name: null, // No name - just description
    description: description + instanceSuffix,
    demographics,
    occupation,
    clothing: resolveValue(template.clothing, index),
    activity: resolveValue(template.activity, index),
    isLocationNPC: true,
    isPermanent: false,
    templateId: template.template || `template-${templateIndex}`,
    instanceIndex: index
  };
}

/**
 * Resolve a value that might be a single value or array
 * If array, pick randomly
 *
 * @param {any|Array} value - Value or array of values
 * @param {number} seed - Optional seed for deterministic selection
 * @returns {any} Resolved value
 */
function resolveValue(value, seed = 0) {
  if (!value) return '';
  if (Array.isArray(value)) {
    // Use seed for some determinism while still allowing variation
    const index = seed % value.length;
    return value[index];
  }
  return value;
}

/**
 * Format location NPCs as markdown table for display
 * Used by List function to display "People present"
 *
 * @param {Array<Object>} npcs - List of NPC objects
 * @returns {string} Markdown table
 */
export function formatNPCsAsTable(npcs) {
  if (!npcs || npcs.length === 0) {
    return 'No other people are currently visible.';
  }

  // Filter out animals (like João the cat)
  const humanNPCs = npcs.filter(npc => !npc.isAnimal);

  if (humanNPCs.length === 0) {
    return 'No other people are currently visible.';
  }

  // Build markdown table
  let table = '| Name/Description | Age | Class/Casta | Gender | Clothing | Activity |\n';
  table += '|------------------|-----|-------------|--------|----------|----------|\n';

  humanNPCs.forEach(npc => {
    const name = npc.name || npc.description;
    const age = npc.demographics?.age || 'unknown';
    const casta = npc.demographics?.casta || 'unknown';
    const gender = npc.demographics?.gender || 'unknown';
    const clothing = npc.clothing || npc.currentClothing || 'ordinary clothing';
    const activity = npc.activity || npc.currentActivity || 'standing nearby';

    // Truncate long values
    const clothingShort = truncate(clothing, 50);
    const activityShort = truncate(activity, 50);

    table += `| ${name} | ${age} | ${casta} | ${gender} | ${clothingShort} | ${activityShort} |\n`;
  });

  return table;
}

/**
 * Truncate string to max length
 */
function truncate(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Build narrative context string for NPCs present
 * Used by NarrativeAgent to know who's in the scene
 *
 * @param {Array<Object>} npcs - List of NPC objects
 * @param {string} location - Location name
 * @returns {string} Formatted context for LLM
 */
export function buildNPCContext(npcs, location) {
  if (!npcs || npcs.length === 0) {
    return '';
  }

  const humanNPCs = npcs.filter(npc => !npc.isAnimal);

  if (humanNPCs.length === 0) {
    return '';
  }

  let context = `### People Present in ${location}\n\n`;
  context += `The following NPCs are currently in this location:\n\n`;

  humanNPCs.forEach(npc => {
    const name = npc.name || npc.description;
    const occupation = npc.occupation || 'person';
    const activity = npc.activity || npc.currentActivity || 'present';

    if (npc.name) {
      // Named NPC - more detail
      context += `- **${name}** (${occupation}): ${activity}\n`;
      if (npc.description) {
        context += `  _${npc.description}_\n`;
      }
    } else {
      // Template NPC - brief
      context += `- ${name}: ${occupation}, ${activity}\n`;
    }
  });

  context += `\n**IMPORTANT**: When Maria asks "who is present?" or looks around, you MUST mention these NPCs. They are the source of truth for who is in this location.\n`;
  context += `**CONSISTENCY RULE**: The list above matches what the "List all people present" function would show. Your narrative MUST be consistent with this list.\n`;

  return context;
}

export default {
  getLocationNPCs,
  formatNPCsAsTable,
  buildNPCContext
};
