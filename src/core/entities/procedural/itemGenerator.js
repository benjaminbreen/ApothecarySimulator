/**
 * Item Procedural Generator
 *
 * Generates appearance and properties for items.
 * Simpler than NPC generation but still with depth.
 *
 * @module itemGenerator
 */

import { random, randomInt } from './historicalData';

/**
 * Generate item appearance
 * @param {Object} item - Partial item data
 * @returns {Object} Appearance object
 */
export function generateAppearance(item) {
  const appearance = { ...item.appearance } || {};

  const itemType = item.itemType || 'misc';
  const categories = item.categories || [];

  // Form based on item type
  if (!appearance.form) {
    const forms = {
      'materia_medica': determineMateriaMedicaForm(item.name, categories),
      'tool': 'metal implement',
      'weapon': 'forged weapon',
      'wearable': 'garment',
      'consumable': random(['liquid', 'powder', 'paste', 'solid'])
    };
    appearance.form = forms[itemType] || 'object';
  }

  // Color
  if (!appearance.color) {
    appearance.color = generateColor(itemType, categories);
  }

  // Smell
  if (!appearance.smell) {
    appearance.smell = generateSmell(itemType, categories);
  }

  // Taste (for medicinal/consumables)
  if (!appearance.taste && (itemType === 'materia_medica' || itemType === 'consumable')) {
    appearance.taste = random(['bitter', 'sweet', 'sour', 'acrid', 'astringent', 'bland', 'pungent']);
  }

  // Texture
  if (!appearance.texture) {
    appearance.texture = generateTexture(appearance.form);
  }

  // Visual description
  if (!appearance.visualDescription) {
    appearance.visualDescription = `${appearance.color} ${appearance.form} with a ${appearance.smell} scent`;
  }

  return appearance;
}

/**
 * Determine form for materia medica
 */
function determineMateriaMedicaForm(name, categories) {
  const lowerName = (name || '').toLowerCase();

  // Herb/plant
  if (categories.includes('herb') || lowerName.includes('leaf') || lowerName.includes('flower')) {
    return random(['dried leaves', 'fresh leaves', 'powdered herb', 'bundled stems', 'crushed petals']);
  }

  // Resin
  if (categories.includes('resin') || lowerName.includes('resin') || lowerName.includes('gum')) {
    return random(['crystalline resin', 'sticky resin', 'hardened chunks', 'amber-like lumps']);
  }

  // Mineral
  if (categories.includes('mineral') || lowerName.includes('salt') || lowerName.includes('stone')) {
    return random(['powdered mineral', 'crystalline mineral', 'ground stone', 'fine powder']);
  }

  // Animal-derived
  if (categories.includes('animal') || lowerName.includes('bone') || lowerName.includes('horn')) {
    return random(['dried extract', 'powdered bone', 'ground horn', 'prepared tissue']);
  }

  // Spice
  if (categories.includes('spice')) {
    return random(['dried seeds', 'ground powder', 'aromatic bark', 'dried roots']);
  }

  // Default
  return 'processed substance';
}

/**
 * Generate color
 */
function generateColor(itemType, categories) {
  if (itemType === 'materia_medica') {
    if (categories.includes('herb')) return random(['green', 'brown', 'yellow-green', 'dried brown']);
    if (categories.includes('resin')) return random(['amber', 'white', 'translucent', 'yellow']);
    if (categories.includes('mineral')) return random(['white', 'grey', 'red', 'blue', 'crystalline']);
    if (categories.includes('spice')) return random(['brown', 'red', 'yellow', 'orange', 'black']);
  }

  if (itemType === 'tool' || itemType === 'weapon') {
    return random(['steel grey', 'iron black', 'bronze', 'tarnished silver']);
  }

  return random(['brown', 'grey', 'white', 'black', 'tan']);
}

/**
 * Generate smell
 */
function generateSmell(itemType, categories) {
  if (itemType === 'materia_medica') {
    if (categories.includes('herb')) return random(['aromatic', 'pungent', 'sweet', 'earthy', 'grassy']);
    if (categories.includes('resin')) return random(['strong aromatic', 'sharp', 'medicinal', 'piney']);
    if (categories.includes('mineral')) return 'odorless';
    if (categories.includes('animal')) return random(['faint', 'musky', 'unpleasant', 'gamey']);
    if (categories.includes('spice')) return random(['aromatic', 'pungent', 'sweet', 'spicy']);
  }

  if (itemType === 'tool' || itemType === 'weapon') {
    return random(['metallic', 'oily', 'faint']);
  }

  return 'faint';
}

/**
 * Generate texture
 */
function generateTexture(form) {
  if (form.includes('powder')) return random(['fine powder', 'coarse powder', 'gritty']);
  if (form.includes('liquid')) return random(['thin liquid', 'viscous', 'syrupy', 'watery']);
  if (form.includes('crystalline')) return random(['hard crystals', 'brittle', 'sharp-edged']);
  if (form.includes('dried')) return random(['brittle', 'crumbly', 'papery', 'leathery']);

  return 'solid';
}

/**
 * Generate combat properties for items
 * @param {Object} item - Item data
 * @returns {Object} Combat properties
 */
export function generateCombatProperties(item) {
  const combat = {
    wieldable: false,
    throwable: false,
    damage: 0,
    range: 0,
    attackType: null,
    improvisedWeapon: false
  };

  // Weapons
  if (item.itemType === 'weapon') {
    combat.wieldable = true;

    const weaponType = (item.name || '').toLowerCase();

    if (weaponType.includes('sword') || weaponType.includes('rapier')) {
      combat.damage = randomInt(8, 15);
      combat.range = 1; // melee
      combat.attackType = 'slashing';
    } else if (weaponType.includes('knife') || weaponType.includes('dagger')) {
      combat.damage = randomInt(4, 10);
      combat.range = 1;
      combat.attackType = 'piercing';
      combat.throwable = true;
    } else if (weaponType.includes('club') || weaponType.includes('mace')) {
      combat.damage = randomInt(6, 12);
      combat.range = 1;
      combat.attackType = 'bludgeoning';
    } else if (weaponType.includes('bow')) {
      combat.damage = randomInt(6, 12);
      combat.range = 30;
      combat.attackType = 'piercing';
    } else {
      // Generic weapon
      combat.damage = randomInt(5, 10);
      combat.range = 1;
      combat.attackType = 'bludgeoning';
    }
  }

  // Tools as improvised weapons
  else if (item.itemType === 'tool') {
    const toolName = (item.name || '').toLowerCase();
    const weaponizableTools = ['knife', 'hammer', 'axe', 'saw', 'pickaxe', 'chisel'];

    const isWeaponizable = weaponizableTools.some(tool => toolName.includes(tool));

    if (isWeaponizable) {
      combat.improvisedWeapon = true;
      combat.wieldable = true;
      combat.damage = randomInt(3, 8);
      combat.range = 1;
      combat.attackType = toolName.includes('knife') ? 'piercing' : 'bludgeoning';
    }
  }

  return combat;
}

export default {
  generateAppearance,
  generateCombatProperties
};
