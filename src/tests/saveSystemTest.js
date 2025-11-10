/**
 * Save System Comprehensive Test Suite
 * Tests all save/load functionality, data integrity, migrations, and edge cases
 *
 * Run in browser console: window.runSaveSystemTests()
 */

import {
  createSaveData,
  saveGame,
  loadGame,
  deleteSave,
  migrateSave,
  getAllSaveSlotKeys,
  hasSaves,
  getMostRecentSave
} from '../core/services/saveManager';
import { safeLocalStorage } from '../utils/safeLocalStorage';

/**
 * Test results accumulator
 */
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Test helper: Assert condition is true
 */
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    testResults.tests.push({ status: 'PASS', message });
    console.log(`✅ PASS: ${message}`);
  } else {
    testResults.failed++;
    testResults.tests.push({ status: 'FAIL', message });
    console.error(`❌ FAIL: ${message}`);
  }
}

/**
 * Test helper: Assert deep equality
 */
function assertEqual(actual, expected, message) {
  const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
  assert(isEqual, `${message} (expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)})`);
}

/**
 * Test helper: Clear all save slots
 */
function clearAllSaves() {
  const slots = getAllSaveSlotKeys();
  slots.forEach(slot => deleteSave(slot));
  console.log('[Test] Cleared all save slots');
}

/**
 * Test helper: Create mock game state
 */
function createMockGameState(overrides = {}) {
  return {
    scenarioId: '1680-mexico-city',
    turnNumber: 10,
    location: 'Botica de la Amargura',
    time: '2:30 PM',
    date: 'August 25, 1680',
    wealth: 50,
    health: 85,
    energy: 62,
    playerTitle: 'Apothecary',
    inventory: [
      { name: 'Cinchona Bark', quantity: 3, price: 5 },
      { name: 'Honey', quantity: 1, price: 2 }
    ],
    compounds: [
      { name: 'Fever Tonic', ingredients: ['Cinchona Bark', 'Water'], method: 'Decoct' }
    ],
    unlockedMethods: ['Decoct', 'Distill', 'Confection'],
    ...overrides
  };
}

/**
 * Test helper: Create mock player skills
 */
function createMockPlayerSkills() {
  return {
    level: 5,
    xp: 1250,
    profession: 'Alchemist',
    skills: {
      herbalism: 3,
      anatomy: 2,
      diagnosis: 4
    }
  };
}

// ============================================================================
// TEST SUITE 1: BASIC SAVE/LOAD
// ============================================================================

function testBasicSaveLoad() {
  console.log('\n=== TEST SUITE 1: BASIC SAVE/LOAD ===\n');

  clearAllSaves();

  const gameState = createMockGameState();
  const playerSkills = createMockPlayerSkills();

  const saveData = createSaveData({
    gameState,
    playerSkills,
    conversationHistory: ['Turn 1', 'Turn 2'],
    reputation: { overall: 50 },
    npcRelationships: { 'NPC1': 10 },
    entities: [{ id: 'npc1', type: 'npc', name: 'Test NPC' }],
    npcPositions: [{ npcId: 'npc1', position: [100, 200] }],
    calendarNotes: { '1680-08-25': 'Test note' },
    transactions: [{ id: 1, amount: 10, type: 'sale' }],
    discoveredBooks: ['Book1', 'Book2'],
    slotName: 'Test Save'
  });

  // Test 1.1: Save to slot
  const saveSuccess = saveGame('apothecary_save_slot_1', saveData);
  assert(saveSuccess, 'Save game to slot 1');

  // Test 1.2: Load from slot
  const loadedData = loadGame('apothecary_save_slot_1');
  assert(loadedData !== null, 'Load game from slot 1');

  // Test 1.3: Version correct
  assertEqual(loadedData.version, '1.1.1', 'Loaded save has correct version');

  // Test 1.4: Slot name preserved
  assertEqual(loadedData.slotName, 'Test Save', 'Slot name preserved');

  // Test 1.5: Metadata correct
  assertEqual(loadedData.metadata.turnNumber, 10, 'Metadata turn number correct');
  assertEqual(loadedData.metadata.wealth, 50, 'Metadata wealth correct');
  assertEqual(loadedData.metadata.entityCount, 1, 'Metadata entity count correct');

  // Test 1.6: Delete slot
  const deleteSuccess = deleteSave('apothecary_save_slot_1');
  assert(deleteSuccess, 'Delete save slot 1');

  // Test 1.7: Verify deleted
  const loadedAfterDelete = loadGame('apothecary_save_slot_1');
  assert(loadedAfterDelete === null, 'Save slot 1 is empty after delete');
}

// ============================================================================
// TEST SUITE 2: DATA INTEGRITY
// ============================================================================

function testDataIntegrity() {
  console.log('\n=== TEST SUITE 2: DATA INTEGRITY ===\n');

  clearAllSaves();

  const gameState = createMockGameState({
    quests: [{ id: 1, completed: false, stage: 2 }],
    isShopSignUp: true,
    crisisState: { inCrisis: false }
  });

  const playerSkills = createMockPlayerSkills();

  const conversationHistory = [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Greetings' }
  ];

  const reputation = {
    overall: 60,
    factions: {
      church: 40,
      elite: 30,
      merchants: 70
    }
  };

  const npcRelationships = {
    'Don Luis': -20,
    'Marta': 15
  };

  const entities = [
    { id: 'npc1', type: 'npc', name: 'Isabel Valdés', age: 'middle-aged' },
    { id: 'item1', type: 'item', name: 'Cinchona Bark', rarity: 'rare' }
  ];

  const npcPositions = [
    { npcId: 'npc1', npcName: 'Isabel Valdés', position: [150, 250], status: 'idle' }
  ];

  const calendarNotes = {
    '1680-08-25': 'Important meeting with Don Luis',
    '1680-08-26': 'Market day'
  };

  const transactions = [
    { id: 1, amount: 10, type: 'sale', category: 'medicine', timestamp: Date.now() },
    { id: 2, amount: -5, type: 'purchase', category: 'ingredient', timestamp: Date.now() }
  ];

  const discoveredBooks = ['Herbal Medicine', 'Anatomy Studies'];

  const saveData = createSaveData({
    gameState,
    playerSkills,
    conversationHistory,
    reputation,
    npcRelationships,
    entities,
    npcPositions,
    calendarNotes,
    transactions,
    discoveredBooks,
    slotName: 'Integrity Test'
  });

  saveGame('apothecary_save_slot_1', saveData);
  const loaded = loadGame('apothecary_save_slot_1');

  // Test 2.1: Game State fields
  assertEqual(loaded.gameState.turnNumber, 10, 'Turn number preserved');
  assertEqual(loaded.gameState.location, 'Botica de la Amargura', 'Location preserved');
  assertEqual(loaded.gameState.time, '2:30 PM', 'Time preserved');
  assertEqual(loaded.gameState.date, 'August 25, 1680', 'Date preserved');
  assertEqual(loaded.gameState.wealth, 50, 'Wealth preserved');
  assertEqual(loaded.gameState.health, 85, 'Health preserved');
  assertEqual(loaded.gameState.energy, 62, 'Energy preserved');
  assertEqual(loaded.gameState.inventory.length, 2, 'Inventory items preserved');
  assertEqual(loaded.gameState.inventory[0].name, 'Cinchona Bark', 'First inventory item correct');
  assertEqual(loaded.gameState.compounds.length, 1, 'Compounds preserved');
  assertEqual(loaded.gameState.unlockedMethods.length, 3, 'Unlocked methods preserved');
  assertEqual(loaded.gameState.quests.length, 1, 'Quests preserved');
  assertEqual(loaded.gameState.isShopSignUp, true, 'Shop sign state preserved');

  // Test 2.2: Player Skills
  assertEqual(loaded.playerSkills.level, 5, 'Player level preserved');
  assertEqual(loaded.playerSkills.xp, 1250, 'Player XP preserved');
  assertEqual(loaded.playerSkills.profession, 'Alchemist', 'Player profession preserved');
  assertEqual(loaded.playerSkills.skills.herbalism, 3, 'Herbalism skill preserved');

  // Test 2.3: Conversation History
  assertEqual(loaded.conversationHistory.length, 2, 'Conversation history length preserved');
  assertEqual(loaded.conversationHistory[0].role, 'user', 'First message role preserved');

  // Test 2.4: Reputation
  assertEqual(loaded.reputation.overall, 60, 'Overall reputation preserved');
  assertEqual(loaded.reputation.factions.church, 40, 'Church reputation preserved');
  assertEqual(loaded.reputation.factions.merchants, 70, 'Merchants reputation preserved');

  // Test 2.5: NPC Relationships
  assertEqual(loaded.npcRelationships['Don Luis'], -20, 'Don Luis relationship preserved');
  assertEqual(loaded.npcRelationships['Marta'], 15, 'Marta relationship preserved');

  // Test 2.6: Entities
  assertEqual(loaded.entities.length, 2, 'Entities count preserved');
  assertEqual(loaded.entities[0].name, 'Isabel Valdés', 'First entity name preserved');
  assertEqual(loaded.entities[1].type, 'item', 'Second entity type preserved');

  // Test 2.7: NPC Positions
  assertEqual(loaded.npcPositions.length, 1, 'NPC positions count preserved');
  assertEqual(loaded.npcPositions[0].npcName, 'Isabel Valdés', 'NPC position name preserved');
  assertEqual(loaded.npcPositions[0].position[0], 150, 'NPC position X preserved');

  // Test 2.8: Calendar Notes (v1.1.1 feature)
  assertEqual(Object.keys(loaded.calendarNotes).length, 2, 'Calendar notes count preserved');
  assertEqual(loaded.calendarNotes['1680-08-25'], 'Important meeting with Don Luis', 'First calendar note preserved');

  // Test 2.9: Transactions
  assertEqual(loaded.transactions.length, 2, 'Transactions count preserved');
  assertEqual(loaded.transactions[0].type, 'sale', 'First transaction type preserved');
  assertEqual(loaded.transactions[1].amount, -5, 'Second transaction amount preserved');

  // Test 2.10: Discovered Books
  assertEqual(loaded.discoveredBooks.length, 2, 'Discovered books count preserved');
  assertEqual(loaded.discoveredBooks[0], 'Herbal Medicine', 'First book preserved');

  clearAllSaves();
}

// ============================================================================
// TEST SUITE 3: MULTIPLE SLOTS
// ============================================================================

function testMultipleSlots() {
  console.log('\n=== TEST SUITE 3: MULTIPLE SLOTS ===\n');

  clearAllSaves();

  // Create three different saves
  const save1 = createSaveData({
    gameState: createMockGameState({ turnNumber: 5, wealth: 20 }),
    playerSkills: createMockPlayerSkills(),
    calendarNotes: { '1680-08-23': 'Note for save 1' },
    slotName: 'Save 1'
  });

  const save2 = createSaveData({
    gameState: createMockGameState({ turnNumber: 15, wealth: 100 }),
    playerSkills: createMockPlayerSkills(),
    calendarNotes: { '1680-08-24': 'Note for save 2' },
    slotName: 'Save 2'
  });

  const save3 = createSaveData({
    gameState: createMockGameState({ turnNumber: 25, wealth: 200 }),
    playerSkills: createMockPlayerSkills(),
    calendarNotes: { '1680-08-25': 'Note for save 3' },
    slotName: 'Save 3'
  });

  // Save to different slots
  saveGame('apothecary_save_slot_1', save1);
  saveGame('apothecary_save_slot_2', save2);
  saveGame('apothecary_save_slot_3', save3);

  // Test 3.1: Load slot 1
  const loaded1 = loadGame('apothecary_save_slot_1');
  assertEqual(loaded1.gameState.turnNumber, 5, 'Slot 1 turn number correct');
  assertEqual(loaded1.gameState.wealth, 20, 'Slot 1 wealth correct');
  assertEqual(loaded1.calendarNotes['1680-08-23'], 'Note for save 1', 'Slot 1 calendar note correct');

  // Test 3.2: Load slot 2
  const loaded2 = loadGame('apothecary_save_slot_2');
  assertEqual(loaded2.gameState.turnNumber, 15, 'Slot 2 turn number correct');
  assertEqual(loaded2.gameState.wealth, 100, 'Slot 2 wealth correct');
  assertEqual(loaded2.calendarNotes['1680-08-24'], 'Note for save 2', 'Slot 2 calendar note correct');

  // Test 3.3: Load slot 3
  const loaded3 = loadGame('apothecary_save_slot_3');
  assertEqual(loaded3.gameState.turnNumber, 25, 'Slot 3 turn number correct');
  assertEqual(loaded3.gameState.wealth, 200, 'Slot 3 wealth correct');
  assertEqual(loaded3.calendarNotes['1680-08-25'], 'Note for save 3', 'Slot 3 calendar note correct');

  // Test 3.4: Calendar notes are NOT mixed (critical v1.1.1 test)
  assert(!loaded1.calendarNotes['1680-08-24'], 'Slot 1 does not have Slot 2 notes');
  assert(!loaded1.calendarNotes['1680-08-25'], 'Slot 1 does not have Slot 3 notes');
  assert(!loaded2.calendarNotes['1680-08-23'], 'Slot 2 does not have Slot 1 notes');
  assert(!loaded2.calendarNotes['1680-08-25'], 'Slot 2 does not have Slot 3 notes');
  assert(!loaded3.calendarNotes['1680-08-23'], 'Slot 3 does not have Slot 1 notes');
  assert(!loaded3.calendarNotes['1680-08-24'], 'Slot 3 does not have Slot 2 notes');

  // Test 3.5: hasSaves() works
  assert(hasSaves(), 'hasSaves() returns true when saves exist');

  // Test 3.6: getMostRecentSave() works
  const mostRecent = getMostRecentSave();
  assert(mostRecent !== null, 'getMostRecentSave() returns a save');

  clearAllSaves();
}

// ============================================================================
// TEST SUITE 4: EDGE CASES
// ============================================================================

function testEdgeCases() {
  console.log('\n=== TEST SUITE 4: EDGE CASES ===\n');

  clearAllSaves();

  // Test 4.1: Empty inventory
  const emptyInventory = createSaveData({
    gameState: createMockGameState({ inventory: [] }),
    playerSkills: createMockPlayerSkills()
  });
  saveGame('apothecary_save_slot_1', emptyInventory);
  const loaded1 = loadGame('apothecary_save_slot_1');
  assertEqual(loaded1.gameState.inventory.length, 0, 'Empty inventory preserved');

  // Test 4.2: Empty calendar notes
  const emptyNotes = createSaveData({
    gameState: createMockGameState(),
    playerSkills: createMockPlayerSkills(),
    calendarNotes: {}
  });
  saveGame('apothecary_save_slot_1', emptyNotes);
  const loaded2 = loadGame('apothecary_save_slot_1');
  assertEqual(Object.keys(loaded2.calendarNotes).length, 0, 'Empty calendar notes preserved');

  // Test 4.3: Very long conversation history (should trim to 20)
  const longHistory = Array(50).fill({ role: 'user', content: 'Test' });
  const longHistorySave = createSaveData({
    gameState: createMockGameState(),
    playerSkills: createMockPlayerSkills(),
    conversationHistory: longHistory
  });
  saveGame('apothecary_save_slot_1', longHistorySave);
  const loaded3 = loadGame('apothecary_save_slot_1');
  assertEqual(loaded3.conversationHistory.length, 20, 'Conversation history trimmed to 20');

  // Test 4.4: Missing optional fields (should use defaults)
  const minimalSave = createSaveData({
    gameState: createMockGameState(),
    playerSkills: createMockPlayerSkills()
    // Omit optional fields
  });
  saveGame('apothecary_save_slot_1', minimalSave);
  const loaded4 = loadGame('apothecary_save_slot_1');
  assert(loaded4 !== null, 'Minimal save loads successfully');
  assertEqual(loaded4.entities.length, 0, 'Missing entities defaults to empty array');
  assertEqual(Object.keys(loaded4.calendarNotes).length, 0, 'Missing calendarNotes defaults to empty object');

  // Test 4.5: Load non-existent slot
  const loadedNonExistent = loadGame('apothecary_save_slot_999');
  assert(loadedNonExistent === null, 'Loading non-existent slot returns null');

  // Test 4.6: Overwrite existing save
  const firstSave = createSaveData({
    gameState: createMockGameState({ turnNumber: 5 }),
    playerSkills: createMockPlayerSkills(),
    slotName: 'First'
  });
  saveGame('apothecary_save_slot_1', firstSave);

  const secondSave = createSaveData({
    gameState: createMockGameState({ turnNumber: 10 }),
    playerSkills: createMockPlayerSkills(),
    slotName: 'Second'
  });
  saveGame('apothecary_save_slot_1', secondSave);

  const loadedOverwritten = loadGame('apothecary_save_slot_1');
  assertEqual(loadedOverwritten.gameState.turnNumber, 10, 'Overwritten save has new turn number');
  assertEqual(loadedOverwritten.slotName, 'Second', 'Overwritten save has new slot name');

  clearAllSaves();
}

// ============================================================================
// TEST SUITE 5: VERSION MIGRATIONS
// ============================================================================

function testVersionMigrations() {
  console.log('\n=== TEST SUITE 5: VERSION MIGRATIONS ===\n');

  clearAllSaves();

  // Test 5.1: v1.0.0 → v1.1.0 migration
  const v100Save = {
    version: '1.0.0',
    timestamp: Date.now(),
    slotName: 'Test v1.0.0',
    metadata: {
      scenarioId: '1680-mexico-city',
      turnNumber: 5
    },
    gameState: createMockGameState(),
    playerSkills: createMockPlayerSkills(),
    conversationHistory: [],
    reputation: { overall: 50 },
    npcRelationships: {}
    // Missing v1.1.0 fields: entities, npcPositions, calendarNotes, transactions
  };

  const migrated100 = migrateSave(v100Save);
  assertEqual(migrated100.version, '1.1.1', 'v1.0.0 migrated to v1.1.1');
  assert(Array.isArray(migrated100.entities), 'v1.0.0 migration adds entities array');
  assert(Array.isArray(migrated100.npcPositions), 'v1.0.0 migration adds npcPositions array');
  assert(typeof migrated100.calendarNotes === 'object', 'v1.0.0 migration adds calendarNotes object');
  assert(Array.isArray(migrated100.transactions), 'v1.0.0 migration adds transactions array');

  // Test 5.2: v1.1.0 → v1.1.1 migration
  const v110Save = {
    version: '1.1.0',
    timestamp: Date.now(),
    slotName: 'Test v1.1.0',
    metadata: {
      scenarioId: '1680-mexico-city',
      turnNumber: 10,
      entityCount: 0,
      transactionCount: 0
    },
    gameState: createMockGameState(),
    playerSkills: createMockPlayerSkills(),
    conversationHistory: [],
    reputation: { overall: 60 },
    npcRelationships: {},
    entities: [],
    npcPositions: [],
    calendarNotes: {},
    transactions: []
    // Missing v1.1.1: discoveredBooks
  };

  const migrated110 = migrateSave(v110Save);
  assertEqual(migrated110.version, '1.1.1', 'v1.1.0 migrated to v1.1.1');
  assert(typeof migrated110.calendarNotes === 'object', 'v1.1.0 migration preserves calendarNotes');

  // Test 5.3: v1.1.1 save (no migration needed)
  const v111Save = {
    version: '1.1.1',
    timestamp: Date.now(),
    slotName: 'Test v1.1.1',
    metadata: {
      scenarioId: '1680-mexico-city',
      turnNumber: 15
    },
    gameState: createMockGameState(),
    playerSkills: createMockPlayerSkills(),
    conversationHistory: [],
    reputation: { overall: 70 },
    npcRelationships: {},
    entities: [],
    npcPositions: [],
    calendarNotes: { '1680-08-25': 'Test' },
    transactions: [],
    discoveredBooks: []
  };

  const migrated111 = migrateSave(v111Save);
  assertEqual(migrated111.version, '1.1.1', 'v1.1.1 save unchanged');
  assertEqual(migrated111.calendarNotes['1680-08-25'], 'Test', 'v1.1.1 data preserved');

  clearAllSaves();
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

export function runAllSaveSystemTests() {
  console.log('\n🧪 ========================================');
  console.log('🧪 SAVE SYSTEM COMPREHENSIVE TEST SUITE');
  console.log('🧪 ========================================\n');

  testResults.passed = 0;
  testResults.failed = 0;
  testResults.tests = [];

  try {
    testBasicSaveLoad();
    testDataIntegrity();
    testMultipleSlots();
    testEdgeCases();
    testVersionMigrations();
  } catch (error) {
    console.error('❌ Test suite crashed:', error);
    testResults.failed++;
  }

  console.log('\n========================================');
  console.log('📊 TEST RESULTS');
  console.log('========================================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📝 Total: ${testResults.passed + testResults.failed}`);
  console.log(`📈 Pass Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  console.log('========================================\n');

  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! 🎉');
  } else {
    console.log('⚠️ Some tests failed. Review results above.');
  }

  return testResults;
}

// Export test results globally for browser console access
if (typeof window !== 'undefined') {
  window.runSaveSystemTests = runAllSaveSystemTests;
}
