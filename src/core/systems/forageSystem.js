/**
 * Foraging System
 *
 * Core foraging mechanics with dice-based loot generation.
 * Scenario-agnostic: Works with any scenario's loot tables.
 *
 * Architecture:
 * - Universal location type system (locationType.js)
 * - Scenario-specific loot tables (scenarios/{id}/data/forageLoot.js)
 * - This file: Pure game logic (dice rolls, weighted selection, validation)
 *
 * @module forageSystem
 */

import { getLocationForageType } from './locationType';
import {
  getForagingSuccessMultiplier,
  getMinForageQuantity,
  getRareDropThreshold
} from './professionAbilities';

/**
 * Weighted random selection
 * Selects an item from an array based on optional 'weight' property
 *
 * @param {Array} items - Array of items with optional 'weight' property
 * @returns {Object} Selected item
 */
export function weightedRandom(items) {
  if (!items || items.length === 0) {
    throw new Error('[ForageSystem] weightedRandom: items array is empty');
  }

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    const weight = item.weight || 1;
    if (random < weight) {
      return item;
    }
    random -= weight;
  }

  // Fallback to last item (should never happen, but safety)
  return items[items.length - 1];
}

/**
 * Roll for quantity range
 * Returns a single value or a random value within [min, max] range
 *
 * @param {number|Array} quantity - Single number or [min, max] range
 * @returns {number} Rolled quantity
 */
export function rollQuantity(quantity) {
  if (Array.isArray(quantity)) {
    const [min, max] = quantity;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return quantity;
}

/**
 * Determine rarity tier based on dice roll
 *
 * Distribution:
 * - Trash: 1% (0.00-0.01) - only if trash items exist
 * - Rare: 9% (0.01-0.10) - or higher with Herbalist profession
 * - Uncommon: 30% (0.10-0.40)
 * - Common: 60% (0.40-1.00)
 *
 * @param {number} roll - Random number 0-1
 * @param {Object} lootTable - Location's loot table
 * @param {Object} gameState - Game state (for profession bonuses)
 * @returns {string} Tier name ('common', 'uncommon', 'rare', or 'trash')
 */
export function getRarityTier(roll, lootTable, gameState = {}) {
  // Trash: 1% (only if trash items exist)
  if (lootTable.trash && lootTable.trash.length > 0 && roll < 0.01) {
    return 'trash';
  }

  // Apply Herbalist L25/L30 ability: Nature's Favor (increased rare drop rate)
  const rareThreshold = getRareDropThreshold(gameState.chosenProfession, gameState.playerLevel);

  // Rare: default 9% (1-10%), or 20-30% with Herbalist
  if (roll < rareThreshold) {
    return 'rare';
  }

  // Uncommon: 30% (10-40%)
  if (roll < 0.40) {
    return 'uncommon';
  }

  // Common: 60% (40-100%)
  return 'common';
}

/**
 * Main forage function
 *
 * Flow:
 * 1. Get location type (universal)
 * 2. Validate foraging is allowed
 * 3. Check energy requirements
 * 4. Roll for success
 * 5. If successful, select item from scenario-specific loot table
 * 6. Roll for quantity
 * 7. Return result with item data
 *
 * @param {string} currentLocation - Player's current location name
 * @param {Object} gameState - Current game state (must include: energy, inventory, location)
 * @param {Object} scenarioData - Scenario-specific data object
 * @param {Object} scenarioData.lootTables - Scenario's loot tables (keyed by location type ID)
 * @param {Object} scenarioData.locationMap - Location name → type ID mapping
 * @returns {Object} Forage result
 */
export function forage(currentLocation, gameState, scenarioData) {
  console.log('[ForageSystem] Attempting forage:', {
    location: currentLocation,
    energy: gameState.energy,
    hasScenarioData: !!scenarioData
  });

  // Validate scenario data
  if (!scenarioData || !scenarioData.lootTables) {
    return {
      success: false,
      error: 'System error: No scenario foraging data available.',
      debug: 'scenarioData.lootTables is required'
    };
  }

  // 1. Get location type (universal system)
  const locationMap = scenarioData.locationMap || {};
  const locationType = getLocationForageType(currentLocation, locationMap);

  // 2. Check if foraging is allowed
  if (!locationType.canForage) {
    return {
      success: false,
      blocked: true,
      errorMessage: locationType.errorMessage,
      suggestedAction: locationType.suggestedAction,
      icon: locationType.icon,
      locationType: locationType.id,
      locationName: locationType.name
    };
  }

  // 3. Check energy requirement
  const currentEnergy = gameState.energy || 0;
  if (currentEnergy < locationType.energyCost) {
    return {
      success: false,
      blocked: true,
      errorMessage: `You're too tired to forage. You need at least ${locationType.energyCost} energy.`,
      suggestedAction: '#sleep',
      currentEnergy: currentEnergy,
      requiredEnergy: locationType.energyCost,
      icon: locationType.icon
    };
  }

  // 4. Roll for success
  // Apply Herbalist L10/L30 ability: Green Thumb (increased success rate)
  const successMultiplier = getForagingSuccessMultiplier(gameState.chosenProfession, gameState.playerLevel);
  const adjustedSuccessRate = Math.min(1.0, locationType.successRate * successMultiplier);

  const successRoll = Math.random();
  const succeeded = successRoll <= adjustedSuccessRate;

  console.log('[ForageSystem] Success roll:', {
    roll: successRoll.toFixed(3),
    baseSuccessRate: locationType.successRate,
    adjustedSuccessRate: adjustedSuccessRate.toFixed(3),
    multiplier: successMultiplier,
    succeeded
  });

  if (!succeeded) {
    return {
      success: true,
      foundNothing: true,
      message: `${locationType.flavorText}\n\nAfter ${locationType.timeCost} minutes of careful searching, you find nothing useful.`,
      energyCost: locationType.energyCost,
      timeCost: locationType.timeCost,
      locationType: locationType.id,
      locationName: locationType.name,
      icon: locationType.icon
    };
  }

  // 5. Get loot table for this location type
  const lootTable = scenarioData.lootTables[locationType.id];

  if (!lootTable) {
    console.error('[ForageSystem] No loot table for location type:', locationType.id);
    return {
      success: false,
      error: `System error: No items configured for ${locationType.name}.`,
      debug: `Missing lootTable for type: ${locationType.id}`
    };
  }

  // 6. Roll for rarity tier
  const rarityRoll = Math.random();
  const tier = getRarityTier(rarityRoll, lootTable, gameState);

  console.log('[ForageSystem] Rarity roll:', {
    roll: rarityRoll.toFixed(3),
    tier
  });

  // 7. Get items from tier
  let tierItems = lootTable[tier];

  // Fallback to common if tier is empty
  if (!tierItems || tierItems.length === 0) {
    console.warn(`[ForageSystem] Tier "${tier}" is empty, falling back to common`);
    tierItems = lootTable.common;

    if (!tierItems || tierItems.length === 0) {
      return {
        success: true,
        foundNothing: true,
        message: `${locationType.flavorText}\n\nYou search thoroughly but find nothing useful.`,
        energyCost: locationType.energyCost,
        timeCost: locationType.timeCost,
        locationType: locationType.id,
        locationName: locationType.name,
        icon: locationType.icon
      };
    }
  }

  // 8. Select random item from tier (weighted)
  const selectedItem = weightedRandom(tierItems);

  // 9. Roll for quantity
  let quantity = rollQuantity(selectedItem.quantity);

  // Apply Herbalist L15/L30 ability: Bountiful Harvest (minimum quantity)
  const minQuantity = getMinForageQuantity(gameState.chosenProfession, gameState.playerLevel);
  if (minQuantity > 1) {
    quantity = Math.max(quantity, minQuantity);
  }

  console.log('[ForageSystem] Found item:', {
    name: selectedItem.name,
    tier,
    baseQuantity: rollQuantity(selectedItem.quantity),
    finalQuantity: quantity,
    minQuantity
  });

  // 10. Build item object for EntityManager
  const foundItem = {
    name: selectedItem.name,
    quantity: quantity,
    itemType: selectedItem.itemType || 'materia_medica',
    categories: selectedItem.categories || ['foraged'],
    properties: selectedItem.properties || [],
    provenance: `Foraged from ${currentLocation}`,
    value: selectedItem.value,
    // Preserve loot table metadata for debugging/tracking
    _meta: {
      tier: tier,
      locationForaged: currentLocation,
      locationType: locationType.id,
      timestamp: new Date().toISOString(),
      rarityRoll: rarityRoll.toFixed(3),
      successRoll: successRoll.toFixed(3)
    }
  };

  // 11. Return success result
  return {
    success: true,
    foundItem: true,
    item: foundItem,
    quantity: quantity,
    message: selectedItem.message,
    tierName: tier,
    energyCost: locationType.energyCost,
    timeCost: locationType.timeCost,
    locationType: locationType.id,
    locationName: locationType.name,
    icon: locationType.icon,
    flavorText: locationType.flavorText
  };
}

/**
 * Validate forage result structure
 * Useful for testing and debugging
 *
 * @param {Object} result - Forage result object
 * @returns {boolean} True if valid
 */
export function validateForageResult(result) {
  if (!result || typeof result !== 'object') {
    return false;
  }

  // Must have success flag
  if (typeof result.success !== 'boolean') {
    return false;
  }

  // If not successful, must have error or blocked flag
  if (!result.success) {
    return result.error || result.blocked;
  }

  // If successful but found nothing, must have message
  if (result.foundNothing) {
    return typeof result.message === 'string' &&
           typeof result.energyCost === 'number' &&
           typeof result.timeCost === 'number';
  }

  // If successful and found item, must have item data
  if (result.foundItem) {
    return result.item &&
           typeof result.item.name === 'string' &&
           typeof result.quantity === 'number' &&
           typeof result.message === 'string' &&
           typeof result.tierName === 'string';
  }

  return false;
}

/**
 * Get forage statistics (for debugging/balancing)
 * Run forage multiple times and return distribution
 *
 * @param {string} currentLocation - Location to test
 * @param {Object} gameState - Game state (high energy for testing)
 * @param {Object} scenarioData - Scenario data
 * @param {number} iterations - Number of times to run (default: 100)
 * @returns {Object} Statistics object
 */
export function getForageStatistics(currentLocation, gameState, scenarioData, iterations = 100) {
  const stats = {
    iterations,
    location: currentLocation,
    results: {
      foundNothing: 0,
      foundItem: 0,
      error: 0
    },
    tiers: {
      common: 0,
      uncommon: 0,
      rare: 0,
      trash: 0
    },
    items: {},
    averageValue: 0,
    totalEnergyCost: 0,
    totalTimeCost: 0
  };

  let totalValue = 0;

  for (let i = 0; i < iterations; i++) {
    const result = forage(currentLocation, { energy: 100, ...gameState }, scenarioData);

    if (result.success) {
      if (result.foundNothing) {
        stats.results.foundNothing++;
      } else if (result.foundItem) {
        stats.results.foundItem++;
        stats.tiers[result.tierName]++;

        // Track items found
        if (!stats.items[result.item.name]) {
          stats.items[result.item.name] = 0;
        }
        stats.items[result.item.name]++;

        // Track value
        if (result.item.value) {
          totalValue += result.item.value * result.quantity;
        }
      }

      stats.totalEnergyCost += result.energyCost || 0;
      stats.totalTimeCost += result.timeCost || 0;
    } else {
      stats.results.error++;
    }
  }

  stats.averageValue = totalValue / iterations;
  stats.averageEnergyCost = stats.totalEnergyCost / iterations;
  stats.averageTimeCost = stats.totalTimeCost / iterations;

  // Calculate percentages
  stats.percentages = {
    foundNothing: (stats.results.foundNothing / iterations * 100).toFixed(1) + '%',
    foundItem: (stats.results.foundItem / iterations * 100).toFixed(1) + '%',
    common: (stats.tiers.common / iterations * 100).toFixed(1) + '%',
    uncommon: (stats.tiers.uncommon / iterations * 100).toFixed(1) + '%',
    rare: (stats.tiers.rare / iterations * 100).toFixed(1) + '%',
    trash: (stats.tiers.trash / iterations * 100).toFixed(1) + '%'
  };

  return stats;
}

export default {
  forage,
  weightedRandom,
  rollQuantity,
  getRarityTier,
  validateForageResult,
  getForageStatistics
};
