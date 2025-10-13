/**
 * Clothing Item Generator
 *
 * Converts NPC clothing templates into wearable inventory items.
 * Generates clothing items appropriate to character's station, gender, and setting.
 *
 * @module clothingItemGenerator
 */

import { Clothing, random, randomInt } from './historicalData';

/**
 * Wearable slots for equipment system
 */
export const WEARABLE_SLOTS = {
  HEAD: 'head',
  BODY: 'body',
  LEGS: 'legs',
  FEET: 'feet',
  ACCESSORY: 'accessory',
  WEAPON: 'weapon'
};

/**
 * Map garment types to equipment slots
 */
const GARMENT_SLOTS = {
  // Head
  'hat': WEARABLE_SLOTS.HEAD,
  'mantilla': WEARABLE_SLOTS.HEAD,
  'headscarf': WEARABLE_SLOTS.HEAD,

  // Body
  'doublet': WEARABLE_SLOTS.BODY,
  'gown': WEARABLE_SLOTS.BODY,
  'dress': WEARABLE_SLOTS.BODY,
  'simple dress': WEARABLE_SLOTS.BODY,
  'bodice': WEARABLE_SLOTS.BODY,
  'shirt': WEARABLE_SLOTS.BODY,
  'vest': WEARABLE_SLOTS.BODY,
  'jerkin': WEARABLE_SLOTS.BODY,
  'cape': WEARABLE_SLOTS.BODY,
  'shawl': WEARABLE_SLOTS.BODY,

  // Legs
  'hose': WEARABLE_SLOTS.LEGS,
  'breeches': WEARABLE_SLOTS.LEGS,
  'skirt': WEARABLE_SLOTS.LEGS,

  // Feet
  'boots': WEARABLE_SLOTS.FEET,
  'shoes': WEARABLE_SLOTS.FEET,
  'slippers': WEARABLE_SLOTS.FEET,
  'sandals': WEARABLE_SLOTS.FEET,

  // Accessories
  'sword': WEARABLE_SLOTS.WEAPON,
  'knife': WEARABLE_SLOTS.WEAPON
};

/**
 * Material value multipliers (affects price)
 */
const MATERIAL_VALUES = {
  // Luxury
  'silk': 10,
  'velvet': 8,
  'brocade': 12,
  'lace': 6,
  'taffeta': 7,

  // Mid-tier
  'fine wool': 4,
  'fine leather': 5,
  'wool': 3,
  'leather': 3,
  'cotton': 2,
  'linen': 2,

  // Basic
  'undyed': 1,
  'rope': 0.5,
  'straw': 0.5,

  // Metals
  'gold': 50,
  'silver': 20,
  'brass': 3,
  'iron': 2
};

/**
 * Generate clothing items for a character
 * @param {Object} params
 * @param {string} params.gender - 'male' or 'female'
 * @param {string} params.socialClass - 'elite', 'middling', or 'common'
 * @param {string} params.scenarioId - Scenario identifier (e.g., '1680-mexico-city')
 * @param {Object} params.npc - Optional NPC data (for customization)
 * @returns {Array<Object>} Array of clothing item objects
 */
export function generateClothingItems({ gender, socialClass, scenarioId = '1680-mexico-city', npc = {} }) {
  const items = [];

  // Map social class to clothing tier
  const tier = socialClass === 'elite' ? 'elite' :
               socialClass === 'merchant' || socialClass === 'middling' ? 'middling' :
               'common';

  const clothingData = Clothing[scenarioId][gender][tier];

  if (!clothingData) {
    console.warn(`No clothing data for ${scenarioId}/${gender}/${tier}`);
    return items;
  }

  // Generate garments
  clothingData.garments.forEach(garmentTemplate => {
    const item = generateGarmentItem(garmentTemplate, tier, scenarioId);
    items.push(item);
  });

  // Generate accessories
  if (clothingData.accessories) {
    const numAccessories = tier === 'elite' ? randomInt(2, 4) :
                          tier === 'middling' ? randomInt(1, 3) :
                          randomInt(0, 2);

    for (let i = 0; i < numAccessories && i < clothingData.accessories.length; i++) {
      const accessoryName = clothingData.accessories[i];
      const item = generateAccessoryItem(accessoryName, tier, scenarioId);
      if (item) items.push(item);
    }
  }

  return items;
}

/**
 * Generate a single garment item
 * @param {Object} template - Garment template from historicalData
 * @param {string} tier - Clothing tier (elite/middling/common)
 * @param {string} scenarioId - Scenario ID
 * @returns {Object} Inventory item
 */
function generateGarmentItem(template, tier, scenarioId) {
  const material = random(template.materials);
  const color = random(template.colors);
  const condition = tier === 'elite' ? random(['excellent', 'excellent', 'good']) :
                    tier === 'middling' ? random(['good', 'good', 'worn']) :
                    random(['worn', 'worn', 'tattered']);

  const slot = GARMENT_SLOTS[template.name] || WEARABLE_SLOTS.BODY;

  // Calculate base price
  const materialValue = MATERIAL_VALUES[material] || 2;
  const basePrice = materialValue * (tier === 'elite' ? 3 : tier === 'middling' ? 2 : 1);
  const conditionMultiplier = condition === 'excellent' ? 1.2 :
                               condition === 'good' ? 1.0 :
                               condition === 'worn' ? 0.6 : 0.3;
  const price = Math.round(basePrice * conditionMultiplier);

  // Generate description
  const description = generateGarmentDescription(template.name, material, color, condition, template.decorations);

  // Determine emoji
  const emoji = getGarmentEmoji(template.name, slot);

  return {
    entityType: 'item',
    id: `item_${template.name.replace(/\s+/g, '_')}_${Date.now()}_${randomInt(1000, 9999)}`,
    name: `${material} ${template.name}`,

    // Classification
    itemType: 'wearable',
    category: 'clothing',
    categories: ['clothing', 'wearable', tier],

    // Economic
    value: {
      base: price,
      currency: 'reales',
      rarity: tier === 'elite' ? 'rare' : tier === 'middling' ? 'uncommon' : 'common'
    },
    price: price,

    // Wearable properties
    wearable: {
      slot: slot,
      equipped: false,
      armorClass: 0, // Clothing provides no armor
      effects: [], // Could add warmth, social bonuses, etc.
      requirements: {
        class: tier === 'elite' ? ['elite', 'merchant'] : null
      }
    },

    // Physical properties
    weight: 0.5,
    bulk: 'small',

    // Appearance
    appearance: {
      form: 'garment',
      material: material,
      color: color,
      condition: condition,
      decorations: template.decorations ? [random(template.decorations)] : [],
      visualDescription: description
    },

    description: description,
    emoji: emoji,

    // Metadata
    metadata: {
      created: Date.now(),
      version: 1,
      isDiscovered: true,
      dataSource: 'procedural',
      scenarioId: scenarioId
    }
  };
}

/**
 * Generate accessory item
 * @param {string} accessoryName - Name of accessory
 * @param {string} tier - Clothing tier
 * @param {string} scenarioId - Scenario ID
 * @returns {Object|null} Inventory item or null
 */
function generateAccessoryItem(accessoryName, tier, scenarioId) {
  // Determine if weapon or accessory
  const isWeapon = ['sword', 'knife', 'dagger'].includes(accessoryName);

  const material = tier === 'elite' ? random(['gold', 'silver', 'fine leather']) :
                   tier === 'middling' ? random(['silver', 'brass', 'leather']) :
                   random(['iron', 'brass', 'wood', 'rope']);

  const materialValue = MATERIAL_VALUES[material] || 2;
  const price = Math.round(materialValue * (isWeapon ? 5 : 2));

  const slot = isWeapon ? WEARABLE_SLOTS.WEAPON : WEARABLE_SLOTS.ACCESSORY;

  const description = `A ${material} ${accessoryName}${tier === 'elite' ? ', finely crafted' : ''}`;
  const emoji = getAccessoryEmoji(accessoryName, isWeapon);

  return {
    entityType: 'item',
    id: `item_${accessoryName.replace(/\s+/g, '_')}_${Date.now()}_${randomInt(1000, 9999)}`,
    name: `${material} ${accessoryName}`,

    itemType: isWeapon ? 'weapon' : 'wearable',
    category: isWeapon ? 'weapon' : 'accessory',
    categories: [isWeapon ? 'weapon' : 'accessory', 'wearable', tier],

    value: {
      base: price,
      currency: 'reales',
      rarity: tier === 'elite' ? 'rare' : 'uncommon'
    },
    price: price,

    wearable: {
      slot: slot,
      equipped: false,
      armorClass: 0,
      effects: [],
      requirements: null
    },

    weight: isWeapon ? 1.5 : 0.2,
    bulk: isWeapon ? 'medium' : 'tiny',

    appearance: {
      form: isWeapon ? 'weapon' : 'accessory',
      material: material,
      visualDescription: description
    },

    description: description,
    emoji: emoji,

    metadata: {
      created: Date.now(),
      version: 1,
      isDiscovered: true,
      dataSource: 'procedural',
      scenarioId: scenarioId
    }
  };
}

/**
 * Generate garment description
 */
function generateGarmentDescription(name, material, color, condition, decorations) {
  let desc = `A ${condition} ${color} ${name} made of ${material}`;

  if (decorations && decorations.length > 0) {
    const deco = random(decorations);
    desc += `, adorned with ${deco}`;
  }

  desc += '.';
  return desc;
}

/**
 * Get emoji for garment
 */
function getGarmentEmoji(name, slot) {
  const emojiMap = {
    // Head
    'hat': '🎩',
    'mantilla': '👒',
    'headscarf': '🧣',

    // Body
    'doublet': '🧥',
    'gown': '👗',
    'dress': '👗',
    'simple dress': '👗',
    'bodice': '👚',
    'shirt': '👕',
    'vest': '🦺',
    'jerkin': '🧥',
    'cape': '🧥',
    'shawl': '🧣',

    // Legs
    'hose': '👖',
    'breeches': '👖',
    'skirt': '👗',

    // Feet
    'boots': '🥾',
    'shoes': '👞',
    'slippers': '🥿',
    'sandals': '🩴'
  };

  return emojiMap[name] || (slot === WEARABLE_SLOTS.HEAD ? '🎩' :
                            slot === WEARABLE_SLOTS.BODY ? '👔' :
                            slot === WEARABLE_SLOTS.LEGS ? '👖' :
                            slot === WEARABLE_SLOTS.FEET ? '👞' : '📿');
}

/**
 * Get emoji for accessory
 */
function getAccessoryEmoji(name, isWeapon) {
  if (isWeapon) {
    return name.includes('sword') ? '⚔️' : '🗡️';
  }

  const emojiMap = {
    'pearl necklace': '📿',
    'gold earrings': '💍',
    'jeweled rings': '💍',
    'fan': '🪭',
    'rosary': '📿',
    'simple necklace': '📿',
    'shawl pin': '📌',
    'belt': '🔗',
    'rope belt': '🪢'
  };

  return emojiMap[name] || '📿';
}

/**
 * Generate starting clothing for Maria de Lima
 * @param {string} scenarioId - Scenario ID
 * @returns {Array<Object>} Starting equipped clothing items
 */
export function generateMariaStartingClothing(scenarioId = '1680-mexico-city') {
  // Maria is a middling-class female apothecary
  return generateClothingItems({
    gender: 'female',
    socialClass: 'middling',
    scenarioId: scenarioId,
    npc: {
      name: 'Maria de Lima',
      occupation: 'apothecary'
    }
  });
}

/**
 * Auto-equip clothing items (equips best items for each slot)
 * @param {Array<Object>} clothingItems - Array of clothing items
 * @returns {Array<Object>} Clothing items with equipped status set
 */
export function autoEquipClothing(clothingItems) {
  const equipped = {};

  // Sort by price (higher = better)
  const sorted = [...clothingItems].sort((a, b) => (b.price || 0) - (a.price || 0));

  // Equip best item for each slot
  sorted.forEach(item => {
    if (item.wearable && item.wearable.slot) {
      const slot = item.wearable.slot;

      if (!equipped[slot]) {
        item.wearable.equipped = true;
        equipped[slot] = item;
      } else {
        item.wearable.equipped = false;
      }
    }
  });

  return clothingItems;
}

export default {
  generateClothingItems,
  generateMariaStartingClothing,
  autoEquipClothing,
  WEARABLE_SLOTS
};
