/**
 * Black Market Items
 *
 * Items available to Poisoners through shady merchants
 * Categorized by:
 * - poisons: Toxic substances (L5+)
 * - drugs: Illicit/recreational substances (L5+)
 * - weapons: Assassination tools (L10+)
 */

export const BLACK_MARKET_ITEMS = {
  // POISONS - Available at L5
  poisons: [
    {
      name: 'Hemlock Extract',
      description: 'Concentrated poison from hemlock plant. Causes paralysis and death.',
      origin: 'European smugglers',
      price: 15,
      emoji: '☠️',
      rarity: 'common',
      properties: ['Toxic', 'Paralytic', 'Lethal']
    },
    {
      name: 'Arsenic Powder',
      description: 'White arsenic trioxide. The poisoner\'s favorite - tasteless and deadly.',
      origin: 'Venetian traders',
      price: 25,
      emoji: '⚗️',
      rarity: 'common',
      properties: ['Toxic', 'Lethal', 'Undetectable']
    },
    {
      name: 'Belladonna Berries',
      description: 'Deadly nightshade berries. Beautiful but fatal.',
      origin: 'Spanish botanist',
      price: 12,
      emoji: '🫐',
      rarity: 'common',
      properties: ['Toxic', 'Hallucinogenic', 'Dilates pupils']
    },
    {
      name: 'Aconite Root',
      description: 'Wolfsbane root. One of the deadliest poisons known.',
      origin: 'Alpine smugglers',
      price: 30,
      emoji: '🌿',
      rarity: 'uncommon',
      properties: ['Toxic', 'Cardiac poison', 'Fast-acting']
    },
    {
      name: 'Mercury Sublimate',
      description: 'Corrosive mercury compound. Causes organ failure.',
      origin: 'Alchemist\'s workshop',
      price: 18,
      emoji: '💧',
      rarity: 'common',
      properties: ['Toxic', 'Corrosive', 'Cumulative poison']
    },
    {
      name: 'Strychnine Seeds',
      description: 'Seeds from nux vomica tree. Causes violent convulsions.',
      origin: 'East Indies',
      price: 35,
      emoji: '🌰',
      rarity: 'rare',
      properties: ['Toxic', 'Convulsant', 'Extremely painful']
    }
  ],

  // DRUGS - Available at L5
  drugs: [
    {
      name: 'Raw Opium',
      description: 'Crude opium sap. Highly addictive painkiller and sedative.',
      origin: 'Ottoman merchants',
      price: 20,
      emoji: '🌺',
      rarity: 'common',
      properties: ['Narcotic', 'Sedative', 'Addictive']
    },
    {
      name: 'Concentrated Laudanum',
      description: 'Potent opium tincture. Much stronger than standard preparations.',
      origin: 'Underground apothecary',
      price: 28,
      emoji: '🍷',
      rarity: 'uncommon',
      properties: ['Narcotic', 'Liquid', 'Highly potent']
    },
    {
      name: 'Henbane Seeds',
      description: 'Powerful hallucinogenic and deliriant. Used by witches.',
      origin: 'Gypsy herbalist',
      price: 15,
      emoji: '🌾',
      rarity: 'common',
      properties: ['Hallucinogenic', 'Deliriant', 'Dangerous']
    },
    {
      name: 'Peyote Buttons',
      description: 'Sacred cactus of indigenous peoples. Causes visions.',
      origin: 'Chichimeca traders',
      price: 25,
      emoji: '🌵',
      rarity: 'uncommon',
      properties: ['Hallucinogenic', 'Visionary', 'Sacred']
    },
    {
      name: 'Coca Leaves',
      description: 'Andean stimulant leaves. Increase energy and endurance.',
      origin: 'Peruvian smugglers',
      price: 22,
      emoji: '🍃',
      rarity: 'uncommon',
      properties: ['Stimulant', 'Energizing', 'Appetite suppressant']
    },
    {
      name: 'Mandrake Root',
      description: 'Legendary narcotic root. Said to scream when pulled from earth.',
      origin: 'Mediterranean traders',
      price: 40,
      emoji: '🥔',
      rarity: 'rare',
      properties: ['Narcotic', 'Anesthetic', 'Legendary']
    },
    {
      name: 'Datura Seeds',
      description: 'Jimsonweed seeds. Powerful deliriant used in indigenous rituals.',
      origin: 'Aztec herbalist',
      price: 18,
      emoji: '🌰',
      rarity: 'common',
      properties: ['Deliriant', 'Amnesiatic', 'Ritual use']
    }
  ],

  // WEAPONS - Available at L10+
  weapons: [
    {
      name: 'Stiletto Dagger',
      description: 'Thin Italian dagger designed to slip between ribs.',
      origin: 'Venetian assassin',
      price: 45,
      emoji: '🗡️',
      rarity: 'uncommon',
      properties: ['Weapon', 'Concealable', 'Armor-piercing']
    },
    {
      name: 'Poison Ring',
      description: 'Ring with hidden compartment for poison powder.',
      origin: 'Borgia family',
      price: 60,
      emoji: '💍',
      rarity: 'rare',
      properties: ['Weapon', 'Concealable', 'One-time use']
    },
    {
      name: 'Garrote Wire',
      description: 'Silent strangulation wire used by professional killers.',
      origin: 'Spanish Inquisition',
      price: 30,
      emoji: '🪢',
      rarity: 'uncommon',
      properties: ['Weapon', 'Silent', 'Professional']
    },
    {
      name: 'Blowgun & Darts',
      description: 'Indigenous blowgun with poisoned darts.',
      origin: 'Amazon jungle',
      price: 50,
      emoji: '🎯',
      rarity: 'rare',
      properties: ['Weapon', 'Ranged', 'Silent']
    },
    {
      name: 'Throwing Knives (Set of 3)',
      description: 'Balanced throwing knives for precision attacks.',
      origin: 'Moorish assassin',
      price: 55,
      emoji: '🔪',
      rarity: 'uncommon',
      properties: ['Weapon', 'Ranged', 'Multiple uses']
    },
    {
      name: 'Poisoned Hairpin',
      description: 'Ornate hairpin with poisoned tip. Perfect for court intrigue.',
      origin: 'Chinese silk road',
      price: 70,
      emoji: '📍',
      rarity: 'rare',
      properties: ['Weapon', 'Concealable', 'Disguised']
    },
    {
      name: 'Hidden Blade Gauntlet',
      description: 'Spring-loaded wrist blade. Concealed until needed.',
      origin: 'Ottoman assassins',
      price: 80,
      emoji: '🦾',
      rarity: 'very_rare',
      properties: ['Weapon', 'Concealable', 'Spring-loaded']
    }
  ],

  // RARE CONTRABAND - Available at L20+
  rareContraband: [
    {
      name: 'Aqua Tofana',
      description: 'Legendary poison created by Giulia Tofana. Undetectable and lethal.',
      origin: 'Secret Italian recipe',
      price: 150,
      emoji: '💧',
      rarity: 'legendary',
      properties: ['Toxic', 'Legendary', 'Undetectable', 'Slow-acting']
    },
    {
      name: 'Pufferfish Toxin',
      description: 'Tetrodotoxin from Japanese fugu. Creates death-like paralysis.',
      origin: 'Eastern traders',
      price: 120,
      emoji: '🐡',
      rarity: 'very_rare',
      properties: ['Toxic', 'Paralytic', 'Exotic', 'Reversible']
    },
    {
      name: 'Cantarella',
      description: 'The Borgia family\'s secret poison. Recipe unknown to most.',
      origin: 'Papal States',
      price: 200,
      emoji: '⚱️',
      rarity: 'legendary',
      properties: ['Toxic', 'Legendary', 'Untraceable', 'Political weapon']
    },
    {
      name: 'Master Assassin\'s Kit',
      description: 'Complete set of tools used by professional killers. Includes lockpicks, poisons, and weapons.',
      origin: 'Assassin\'s guild',
      price: 250,
      emoji: '🧰',
      rarity: 'legendary',
      properties: ['Complete kit', 'Professional', 'Versatile']
    },
    {
      name: 'Philosopher\'s Mercury',
      description: 'Alchemically enhanced mercury. Said to grant visions before death.',
      origin: 'Rogue alchemist',
      price: 180,
      emoji: '🌙',
      rarity: 'very_rare',
      properties: ['Toxic', 'Alchemical', 'Visionary', 'Mythical']
    }
  ]
};

/**
 * Get available items for a Poisoner based on level
 * @param {number} playerLevel
 * @returns {Array} Available black market items
 */
export function getAvailableBlackMarketItems(playerLevel) {
  const available = [];

  // L5+: Poisons and drugs
  if (playerLevel >= 5) {
    available.push(...BLACK_MARKET_ITEMS.poisons);
    available.push(...BLACK_MARKET_ITEMS.drugs);
  }

  // L10+: Add weapons
  if (playerLevel >= 10) {
    available.push(...BLACK_MARKET_ITEMS.weapons);
  }

  // L20+: Add rare contraband
  if (playerLevel >= 20) {
    available.push(...BLACK_MARKET_ITEMS.rareContraband);
  }

  return available;
}

/**
 * Apply black market discount
 * @param {number} basePrice
 * @param {number} discount - Discount percentage (0.15 = 15% off)
 * @returns {number} Discounted price
 */
export function applyBlackMarketDiscount(basePrice, discount) {
  return Math.max(1, Math.round(basePrice * (1 - discount)));
}
