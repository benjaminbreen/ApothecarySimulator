/**
 * Forage System Tests
 *
 * Run these tests in the browser console to verify foraging mechanics.
 *
 * To run:
 * 1. Open browser console (F12)
 * 2. Import the test functions
 * 3. Run testForageSystem()
 */

import { forage, getForageStatistics, validateForageResult } from './forageSystem';
import { getLocationForageType } from './locationType';
import { scenarioLoader } from '../services/scenarioLoader';

/**
 * Test basic foraging in different locations
 */
export function testBasicForaging() {
  console.log('=== Basic Foraging Tests ===\n');

  const scenario = scenarioLoader.getScenario('1680-mexico-city');
  const scenarioData = {
    lootTables: scenario.foraging.lootTables,
    locationMap: scenario.foraging.locationMap
  };

  const gameState = {
    energy: 100,
    location: 'Chapultepec Forest'
  };

  // Test 1: Forage in a forest (high success rate)
  console.log('Test 1: Foraging in Chapultepec Forest');
  const forestResult = forage('Chapultepec Forest', gameState, scenarioData);
  console.log('Result:', forestResult);
  console.log('Valid:', validateForageResult(forestResult));
  console.log('');

  // Test 2: Forage in urban plaza (medium success rate)
  console.log('Test 2: Foraging in La Merced Market');
  const plazaResult = forage('La Merced Market', gameState, scenarioData);
  console.log('Result:', plazaResult);
  console.log('Valid:', validateForageResult(plazaResult));
  console.log('');

  // Test 3: Try to forage in shop (should be blocked)
  console.log('Test 3: Attempting to forage in Botica (should fail)');
  const shopResult = forage('Botica de la Amargura', gameState, scenarioData);
  console.log('Result:', shopResult);
  console.log('Blocked correctly:', shopResult.blocked === true);
  console.log('');

  // Test 4: Forage with low energy (should be blocked)
  console.log('Test 4: Attempting to forage with low energy');
  const lowEnergyResult = forage('Chapultepec Forest', { energy: 3 }, scenarioData);
  console.log('Result:', lowEnergyResult);
  console.log('Blocked correctly:', lowEnergyResult.blocked === true);
  console.log('');

  return {
    forestResult,
    plazaResult,
    shopResult,
    lowEnergyResult
  };
}

/**
 * Test rarity distribution across 100 forages
 */
export function testRarityDistribution() {
  console.log('=== Rarity Distribution Test ===\n');
  console.log('Running 100 forages in Chapultepec Forest...\n');

  const scenario = scenarioLoader.getScenario('1680-mexico-city');
  const scenarioData = {
    lootTables: scenario.foraging.lootTables,
    locationMap: scenario.foraging.locationMap
  };

  const gameState = {
    energy: 100,
    location: 'Chapultepec Forest'
  };

  const stats = getForageStatistics('Chapultepec Forest', gameState, scenarioData, 100);

  console.log('Location:', stats.location);
  console.log('Iterations:', stats.iterations);
  console.log('');

  console.log('Results:');
  console.log('  Found Nothing:', stats.results.foundNothing, `(${stats.percentages.foundNothing})`);
  console.log('  Found Item:', stats.results.foundItem, `(${stats.percentages.foundItem})`);
  console.log('  Errors:', stats.results.error);
  console.log('');

  console.log('Rarity Tiers:');
  console.log('  Common:', stats.tiers.common, `(${stats.percentages.common})`);
  console.log('  Uncommon:', stats.tiers.uncommon, `(${stats.percentages.uncommon})`);
  console.log('  Rare:', stats.tiers.rare, `(${stats.percentages.rare})`);
  console.log('  Trash:', stats.tiers.trash, `(${stats.percentages.trash})`);
  console.log('');

  console.log('Items Found:', Object.entries(stats.items).length, 'unique items');
  console.log('Average Value per Forage:', stats.averageValue.toFixed(2), 'reales');
  console.log('Average Energy Cost:', stats.averageEnergyCost.toFixed(1));
  console.log('Average Time Cost:', stats.averageTimeCost.toFixed(1), 'minutes');
  console.log('');

  console.log('Top 5 Most Common Finds:');
  const sortedItems = Object.entries(stats.items).sort((a, b) => b[1] - a[1]);
  sortedItems.slice(0, 5).forEach(([name, count], idx) => {
    console.log(`  ${idx + 1}. ${name}: ${count} times`);
  });

  return stats;
}

/**
 * Test all location types
 */
export function testAllLocations() {
  console.log('=== Testing All Location Types ===\n');

  const scenario = scenarioLoader.getScenario('1680-mexico-city');
  const scenarioData = {
    lootTables: scenario.foraging.lootTables,
    locationMap: scenario.foraging.locationMap
  };

  const gameState = { energy: 100 };

  const locations = [
    'Chapultepec Forest',
    'The Alameda',
    'La Merced Market',
    'Plaza Mayor',
    'Calle de Tacuba',
    'Callejón de las Flores',
    'Lake Texcoco Shore',
    'Botica de la Amargura',
    'Metropolitan Cathedral'
  ];

  const results = {};

  locations.forEach(location => {
    console.log(`Testing: ${location}`);
    const result = forage(location, gameState, scenarioData);

    const locType = getLocationForageType(location, scenarioData.locationMap);

    results[location] = {
      locationTypeId: locType.id,
      locationTypeName: locType.name,
      canForage: locType.canForage,
      successRate: locType.successRate,
      energyCost: locType.energyCost,
      testResult: result.success,
      foundItem: result.foundItem,
      blocked: result.blocked
    };

    console.log(`  Type: ${locType.name} (${locType.id})`);
    console.log(`  Can Forage: ${locType.canForage}`);
    if (locType.canForage) {
      console.log(`  Success Rate: ${(locType.successRate * 100).toFixed(0)}%`);
      console.log(`  Energy Cost: ${locType.energyCost}`);
      console.log(`  Found: ${result.foundItem ? result.item.name : 'Nothing'}`);
    } else {
      console.log(`  Error: ${result.errorMessage}`);
    }
    console.log('');
  });

  return results;
}

/**
 * Run all tests
 */
export function testForageSystem() {
  console.clear();
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   FORAGING SYSTEM TEST SUITE              ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  try {
    const basicTests = testBasicForaging();
    console.log('\n' + '═'.repeat(45) + '\n');

    const rarityTests = testRarityDistribution();
    console.log('\n' + '═'.repeat(45) + '\n');

    const locationTests = testAllLocations();
    console.log('\n' + '═'.repeat(45) + '\n');

    console.log('✅ All tests completed successfully!');
    console.log('\nExpected distributions:');
    console.log('  - Found Nothing: ~15% (depends on location success rate)');
    console.log('  - Common: ~51% (60% of successful finds)');
    console.log('  - Uncommon: ~25.5% (30% of successful finds)');
    console.log('  - Rare: ~7.5% (9% of successful finds)');
    console.log('  - Trash: ~1% (1% of successful finds, urban only)');

    return {
      basicTests,
      rarityTests,
      locationTests
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Browser console utilities
if (typeof window !== 'undefined') {
  window.testForageSystem = testForageSystem;
  window.testBasicForaging = testBasicForaging;
  window.testRarityDistribution = testRarityDistribution;
  window.testAllLocations = testAllLocations;

  console.log('Forage system tests loaded!');
  console.log('Run in console: testForageSystem()');
}

export default {
  testForageSystem,
  testBasicForaging,
  testRarityDistribution,
  testAllLocations
};
