/**
 * Entity Migration System
 *
 * Migrates existing EntityList and initialInventory to new entity system.
 * Auto-generates missing data using procedural generators.
 *
 * @module migrateEntities
 */

import { entityManager } from '../EntityManager';
import { PatientEntity, ItemEntity } from '../entitySchema';
import npcGenerator from '../procedural/npcGenerator';
import itemGenerator from '../procedural/itemGenerator';

/**
 * Migrate all entities
 * @param {Array} entityList - Original EntityList
 * @param {Array} inventoryList - Original initialInventoryData
 */
export async function migrateAllEntities(entityList, inventoryList) {
  console.log('[Migration] Starting entity migration...');

  // Register generators
  entityManager.setGenerators({
    npc: npcGenerator,
    item: itemGenerator
  });

  // Migrate NPCs
  const npcCount = await migrateNPCs(entityList);

  // Migrate items
  const itemCount = await migrateItems(inventoryList);

  console.log(`[Migration] Complete! Migrated ${npcCount} NPCs and ${itemCount} items`);
  console.log('[Migration] Total entities:', entityManager.count());

  return {
    npcs: npcCount,
    items: itemCount,
    total: entityManager.count()
  };
}

/**
 * Migrate NPCs from EntityList
 * @param {Array} entityList - Original EntityList
 * @returns {Promise<number>} Number of NPCs migrated
 */
export async function migrateNPCs(entityList) {
  console.log(`[Migration] Migrating ${entityList.length} NPCs...`);

  let count = 0;

  for (const npc of entityList) {
    try {
      const entity = {
        ...PatientEntity,
        id: `patient_${sanitizeId(npc.name)}`,
        name: npc.name,
        entityType: npc.type === 'patient' ? 'patient' : 'npc',
        tier: 'story-critical', // All hand-crafted NPCs are story-critical

        // Appearance
        appearance: {
          age: npc.age || null,
          gender: npc.gender || '',
          build: '',
          height: '',
          weight: '',
          face: {},
          hair: {},
          distinguishingFeatures: [],
          disabilities: [],
          chronicConditions: []
        },

        // Social
        social: {
          class: npc.class || '',
          casta: npc.casta || '',
          occupation: npc.occupation || '',
          wealth: mapWealthLevel(npc.class),
          literacyLevel: 'literate', // Assume patients can afford apothecary = literate
          languages: ['Spanish'],
          reputation: 50,
          faction: null,
          family: {}
        },

        // State
        state: {
          location: npc.currentResidence || 'Mexico City',
          activity: '',
          mood: 'neutral',
          health: 100,
          energy: 100,
          inventory: [],
          goals: [],
          wounds: []
        },

        // Visual
        visual: {
          emoji: null,
          image: npc.image || null,
          icon: null,
          portraitStyle: 'realistic',
          color: null
        },

        // Description
        description: npc.description || npc.socialContext || '',

        // Patient-specific data
        medical: npc.type === 'patient' ? {
          symptoms: npc.symptoms || [],
          diagnosis: npc.diagnosis || '',
          urgency: npc.urgency || 'moderate',
          contemporaryTheory: npc.contemporaryTheory || '',
          astrologicalSign: npc.astrologicalSign || '',
          treatmentHistory: [],
          allergies: [],
          chronicConditions: []
        } : undefined,

        // Quest
        quest: npc.type === 'patient' && npc.ability ? {
          id: `quest_${sanitizeId(npc.name)}`,
          status: 'inactive',
          reward: {
            reputation: 15,
            wealth: 0,
            special: npc.ability
          },
          successCondition: 'Successfully treat patient',
          failureCondition: 'Patient condition worsens'
        } : undefined,

        // Citations (educational)
        education: {
          historicalNote: npc.socialContext || '',
          citations: npc.citation ? [npc.citation] : [],
          relatedTopics: [],
          imageCaption: npc.caption || '',
          funFact: npc.secret || ''
        },

        // Metadata
        metadata: {
          created: Date.now(),
          lastModified: Date.now(),
          version: 1,
          dataSource: 'handcrafted'
        }
      };

      // Register (EntityManager will auto-generate missing fields)
      entityManager.register(entity);
      count++;

    } catch (error) {
      console.error(`[Migration] Failed to migrate NPC ${npc.name}:`, error);
    }
  }

  console.log(`[Migration] Migrated ${count} NPCs`);
  return count;
}

/**
 * Migrate items from initialInventory
 * @param {Array} inventoryList - Original initialInventoryData
 * @returns {Promise<number>} Number of items migrated
 */
export async function migrateItems(inventoryList) {
  console.log(`[Migration] Migrating ${inventoryList.length} items...`);

  let count = 0;

  for (const item of inventoryList) {
    try {
      const entity = {
        ...ItemEntity,
        id: `item_${sanitizeId(item.name)}`,
        name: item.name,
        entityType: 'item',
        tier: 'common',
        itemType: 'materia_medica',
        categories: ['medicinal'],

        // Economic
        value: {
          base: item.price || 0,
          currency: 'reales',
          rarity: item.price > 10 ? 'rare' : item.price > 5 ? 'uncommon' : 'common',
          marketDemand: 'medium'
        },

        weight: 0.5,
        bulk: 'tiny',

        // Medicinal properties
        medicinal: {
          humoralQualities: parseHumoralQualities(item.humoralQualities),
          effects: item.medicinalEffects ? item.medicinalEffects.split(',').map(e => e.trim()) : [],
          dosage: {
            min: 0.5,
            max: 2,
            unit: 'drachm',
            frequency: 'twice daily',
            warnings: ''
          },
          contraindications: [],
          preparations: ['powder', 'infusion'],
          treatsConditions: []
        },

        // Appearance (will be procedurally generated)
        appearance: {
          form: '',
          color: '',
          smell: '',
          taste: '',
          texture: '',
          visualDescription: item.description || ''
        },

        // Combat
        combat: {
          wieldable: false,
          throwable: false,
          damage: 0,
          range: 0,
          attackType: null,
          improvisedWeapon: false
        },

        // Wearable
        wearable: null,

        // Consumable
        consumable: {
          isConsumable: true,
          consumeEffect: '',
          consumeTime: 'instant',
          stackable: true,
          maxStack: 100
        },

        // Crafting
        crafting: {
          canMix: true,
          mixableWith: [],
          producesCompound: true,
          compoundType: 'tincture',
          usedInRecipes: []
        },

        // Education
        education: {
          historicalNote: item.description || '',
          citations: item.citation ? [item.citation] : [],
          relatedTopics: [],
          imageCaption: item.name,
          funFact: ''
        },

        // Lore
        lore: {
          scenarioSpecific: {
            '1680-mexico-city': item.description || ''
          },
          genericDescription: item.description || ''
        },

        // Visual
        visual: {
          emoji: item.emoji || '',
          image: item.image || null,
          icon: null,
          color: null
        },

        // Provenance (will be enhanced with universal structure later)
        provenance: {
          origin: {
            region: '',
            specificLocation: '',
            culturalGroup: ''
          },
          tradeRoute: {
            '1680-mexico-city': '',
            generic: 'Colonial trade networks'
          },
          knowledgeSystems: [],
          historicalContext: {
            importStatus: 'common',
            monopolyHolder: null,
            prohibitionStatus: 'legal',
            culturalSignificance: '',
            periodNotes: {}
          }
        },

        // Metadata
        metadata: {
          created: Date.now(),
          lastModified: Date.now(),
          version: 1,
          dataSource: 'handcrafted'
        }
      };

      // Register (EntityManager will auto-generate missing fields)
      entityManager.register(entity);
      count++;

    } catch (error) {
      console.error(`[Migration] Failed to migrate item ${item.name}:`, error);
    }
  }

  console.log(`[Migration] Migrated ${count} items`);
  return count;
}

/**
 * Helper: Sanitize ID
 */
function sanitizeId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Helper: Map class to wealth level
 */
function mapWealthLevel(classLevel) {
  const mapping = {
    'elite': 'wealthy',
    'Elite': 'wealthy',
    'merchant': 'comfortable',
    'Merchant': 'comfortable',
    'freedman': 'poor',
    'Freedman': 'poor',
    'slave': 'destitute',
    'Slave': 'destitute'
  };

  return mapping[classLevel] || 'poor';
}

/**
 * Helper: Parse humoral qualities
 */
function parseHumoralQualities(str) {
  if (!str) return { temperature: null, temperatureDegree: 0, moisture: null, moistureDegree: 0 };

  const lower = str.toLowerCase();

  const temp = lower.includes('hot') ? 'hot' :
               lower.includes('warm') ? 'warm' :
               lower.includes('cool') ? 'cool' :
               lower.includes('cold') ? 'cold' : null;

  const moisture = lower.includes('dry') ? 'dry' :
                   lower.includes('moist') ? 'moist' :
                   lower.includes('wet') ? 'wet' : null;

  return {
    temperature: temp,
    temperatureDegree: 2, // Default to 2nd degree
    moisture,
    moistureDegree: 2
  };
}

export default {
  migrateAllEntities,
  migrateNPCs,
  migrateItems
};
