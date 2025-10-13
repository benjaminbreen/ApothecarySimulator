/**
 * Phase 1 Foundation Tests
 *
 * Manual tests to verify quest system foundation works correctly.
 * Run these in browser console or Node.js.
 */

import { validateQuest, validateQuestTemplate, validateQuestState } from '../QuestValidator.js';
import {
  generateQuestId,
  isQuestExpired,
  calculateQuestDifficulty,
  calculateTurnLimit,
  filterEligibleNPCs,
  matchesCompletionCriteria,
  formatQuestDescription,
  getQuestProgressPercentage,
  isQuestUrgent,
  calculateNPCWealthMultiplier
} from '../questUtils.js';
import { QuestTypes, QuestStatus } from '../../types/quest.types.js';

// ============================================
// TEST 1: Quest ID Generation
// ============================================
export function testQuestIdGeneration() {
  console.log('TEST 1: Quest ID Generation');

  const id1 = generateQuestId();
  const id2 = generateQuestId();

  console.assert(id1.startsWith('quest_'), 'ID should start with quest_');
  console.assert(id1 !== id2, 'IDs should be unique');
  console.log('✅ Quest ID generation works');
  return true;
}

// ============================================
// TEST 2: Quest Difficulty Calculation
// ============================================
export function testDifficultyCalculation() {
  console.log('\nTEST 2: Quest Difficulty Calculation');

  // Low-level player (should get easier quests)
  const weakPlayer = {
    reputation: 10,
    wealth: 5,
    health: 30
  };
  const easyDifficulty = calculateQuestDifficulty(weakPlayer);
  console.assert(easyDifficulty < 1.0, 'Weak player should get easier quests');
  console.log(`Weak player difficulty: ${easyDifficulty} (expected < 1.0)`);

  // High-level player (should get harder quests)
  const strongPlayer = {
    reputation: 85,
    wealth: 200,
    health: 100
  };
  const hardDifficulty = calculateQuestDifficulty(strongPlayer);
  console.assert(hardDifficulty > 1.0, 'Strong player should get harder quests');
  console.log(`Strong player difficulty: ${hardDifficulty} (expected > 1.0)`);

  console.log('✅ Difficulty scaling works');
  return true;
}

// ============================================
// TEST 3: Turn Limit Calculation
// ============================================
export function testTurnLimitCalculation() {
  console.log('\nTEST 3: Turn Limit Calculation');

  const medicalLimit = calculateTurnLimit('medical', 1.0);
  const crisisLimit = calculateTurnLimit('crisis', 1.0);

  console.assert(medicalLimit === 5, 'Medical quests should have 5 turn limit');
  console.assert(crisisLimit === 3, 'Crisis quests should have 3 turn limit');
  console.assert(crisisLimit < medicalLimit, 'Crisis should be shorter than medical');

  // Higher difficulty = shorter time
  const hardCrisisLimit = calculateTurnLimit('crisis', 2.0);
  console.assert(hardCrisisLimit < crisisLimit, 'Higher difficulty = shorter time');

  console.log('✅ Turn limit calculation works');
  return true;
}

// ============================================
// TEST 4: NPC Filtering
// ============================================
export function testNPCFiltering() {
  console.log('\nTEST 4: NPC Filtering');

  const mockNPCs = [
    { id: 'npc1', name: 'Patient Pedro', type: 'patient', isDead: false },
    { id: 'npc2', name: 'Merchant Maria', type: 'merchant', isDead: false, social: { occupation: 'merchant' } },
    { id: 'npc3', name: 'Dead Dave', type: 'patient', isDead: true },
    { id: 'npc4', name: 'Elite Elena', type: 'noble', isDead: false, social: { class: 'elite' } },
  ];

  // Medical quests should only get patients
  const medicalNPCs = filterEligibleNPCs(mockNPCs, 'medical', []);
  console.assert(medicalNPCs.length === 1, 'Should find 1 living patient');
  console.assert(medicalNPCs[0].name === 'Patient Pedro', 'Should find Patient Pedro');

  // Acquisition quests should get merchants
  const acquisitionNPCs = filterEligibleNPCs(mockNPCs, 'acquisition', []);
  console.assert(acquisitionNPCs.length === 1, 'Should find 1 merchant');
  console.assert(acquisitionNPCs[0].name === 'Merchant Maria', 'Should find Merchant Maria');

  // Exclude specific NPCs
  const excludedNPCs = filterEligibleNPCs(mockNPCs, 'medical', ['npc1']);
  console.assert(excludedNPCs.length === 0, 'Should exclude npc1');

  console.log('✅ NPC filtering works');
  return true;
}

// ============================================
// TEST 5: Completion Criteria Matching
// ============================================
export function testCompletionCriteriaMatching() {
  console.log('\nTEST 5: Completion Criteria Matching');

  // Test 1: Simple action match
  const simpleCompletion = { action: 'prescribe' };
  const prescribeAction = 'prescribe';
  const buyAction = 'buy';

  console.assert(
    matchesCompletionCriteria(prescribeAction, {}, simpleCompletion),
    'Should match prescribe action'
  );
  console.assert(
    !matchesCompletionCriteria(buyAction, {}, simpleCompletion),
    'Should not match buy action'
  );

  // Test 2: Target matching
  const targetCompletion = { action: 'prescribe', target: 'Pedro Gonzalez' };
  console.assert(
    matchesCompletionCriteria('prescribe', { target: 'Pedro Gonzalez' }, targetCompletion),
    'Should match correct target'
  );
  console.assert(
    !matchesCompletionCriteria('prescribe', { target: 'Wrong Person' }, targetCompletion),
    'Should not match wrong target'
  );

  // Test 3: Min/max parameters
  const minCompletion = { action: 'buy', params: { minQuantity: 5 } };
  console.assert(
    matchesCompletionCriteria('buy', { quantity: 10 }, minCompletion),
    'Should match quantity >= min'
  );
  console.assert(
    !matchesCompletionCriteria('buy', { quantity: 3 }, minCompletion),
    'Should not match quantity < min'
  );

  console.log('✅ Completion criteria matching works');
  return true;
}

// ============================================
// TEST 6: Quest Validation
// ============================================
export function testQuestValidation() {
  console.log('\nTEST 6: Quest Validation');

  // Valid quest
  const validQuest = {
    id: 'quest_123',
    templateId: 'medical_fever',
    type: 'medical',
    status: 'active',
    giver: {
      npcId: 'npc_1',
      name: 'Pedro Gonzalez',
      type: 'patient'
    },
    objective: {
      description: 'Cure Pedro of fever',
      steps: [
        {
          stepNumber: 1,
          description: 'Diagnose fever',
          completion: { action: 'diagnose' },
          completed: false
        }
      ],
      completion: { allSteps: true }
    },
    progress: {
      currentStep: 0,
      turnsActive: 1,
      stepData: {}
    },
    rewards: {
      wealth: 50,
      reputation: 10,
      items: [],
      knowledge: []
    },
    constraints: {
      turnLimit: 5,
      failureConditions: []
    },
    narrative: {
      intro: null,
      completion: null,
      failure: null
    },
    metadata: {
      startTurn: 10,
      completedTurn: null,
      scenarioId: '1680-mexico-city',
      difficulty: 1.0
    }
  };

  const validResult = validateQuest(validQuest);
  console.assert(validResult.valid === true, 'Valid quest should pass validation');
  console.assert(validResult.errors.length === 0, 'Valid quest should have no errors');

  // Invalid quest (missing required fields)
  const invalidQuest = {
    id: 'quest_456',
    // Missing templateId, type, status
    giver: {
      // Missing npcId
      name: 'Test'
    }
  };

  const invalidResult = validateQuest(invalidQuest);
  console.assert(invalidResult.valid === false, 'Invalid quest should fail validation');
  console.assert(invalidResult.errors.length > 0, 'Invalid quest should have errors');
  console.log(`Invalid quest errors: ${invalidResult.errors.join(', ')}`);

  console.log('✅ Quest validation works');
  return true;
}

// ============================================
// TEST 7: Quest State Validation
// ============================================
export function testQuestStateValidation() {
  console.log('\nTEST 7: Quest State Validation');

  // Valid quest state
  const validState = {
    active: [],
    completed: [],
    failed: [],
    cooldowns: {}
  };

  const validResult = validateQuestState(validState);
  console.assert(validResult.valid === true, 'Valid state should pass');

  // Invalid quest state
  const invalidState = {
    active: 'not an array',
    completed: [],
    failed: [],
    cooldowns: null
  };

  const invalidResult = validateQuestState(invalidState);
  console.assert(invalidResult.valid === false, 'Invalid state should fail');

  console.log('✅ Quest state validation works');
  return true;
}

// ============================================
// TEST 8: Quest Expiration
// ============================================
export function testQuestExpiration() {
  console.log('\nTEST 8: Quest Expiration');

  const quest = {
    constraints: {
      turnLimit: 5
    },
    metadata: {
      startTurn: 10
    }
  };

  // Turn 14 (4 turns active) - not expired
  console.assert(!isQuestExpired(quest, 14), 'Quest should not be expired at turn 14');

  // Turn 16 (6 turns active) - expired
  console.assert(isQuestExpired(quest, 16), 'Quest should be expired at turn 16');

  // Quest with no turn limit - never expires
  const noLimitQuest = {
    constraints: {
      turnLimit: null
    },
    metadata: {
      startTurn: 10
    }
  };
  console.assert(!isQuestExpired(noLimitQuest, 1000), 'Quest with no limit should never expire');

  console.log('✅ Quest expiration works');
  return true;
}

// ============================================
// TEST 9: Quest Urgency
// ============================================
export function testQuestUrgency() {
  console.log('\nTEST 9: Quest Urgency');

  const quest = {
    constraints: {
      turnLimit: 5
    },
    metadata: {
      startTurn: 10
    }
  };

  // Turn 12 (2 turns active, 3 remaining) - not urgent
  console.assert(!isQuestUrgent(quest, 12), 'Quest should not be urgent with 3 turns left');

  // Turn 14 (4 turns active, 1 remaining) - urgent
  console.assert(isQuestUrgent(quest, 14), 'Quest should be urgent with 1 turn left');

  console.log('✅ Quest urgency works');
  return true;
}

// ============================================
// TEST 10: NPC Wealth Multiplier
// ============================================
export function testNPCWealthMultiplier() {
  console.log('\nTEST 10: NPC Wealth Multiplier');

  const eliteNPC = { social: { class: 'elite' } };
  const middlingNPC = { social: { class: 'middling' } };
  const commonNPC = { social: { class: 'common' } };
  const noSocialNPC = {};

  console.assert(calculateNPCWealthMultiplier(eliteNPC) === 3.0, 'Elite should be 3x');
  console.assert(calculateNPCWealthMultiplier(middlingNPC) === 1.5, 'Middling should be 1.5x');
  console.assert(calculateNPCWealthMultiplier(commonNPC) === 1.0, 'Common should be 1x');
  console.assert(calculateNPCWealthMultiplier(noSocialNPC) === 1.0, 'No social should be 1x');

  console.log('✅ NPC wealth multiplier works');
  return true;
}

// ============================================
// RUN ALL TESTS
// ============================================
export function runAllTests() {
  console.log('========================================');
  console.log('QUEST SYSTEM PHASE 1 TESTS');
  console.log('========================================');

  const tests = [
    testQuestIdGeneration,
    testDifficultyCalculation,
    testTurnLimitCalculation,
    testNPCFiltering,
    testCompletionCriteriaMatching,
    testQuestValidation,
    testQuestStateValidation,
    testQuestExpiration,
    testQuestUrgency,
    testNPCWealthMultiplier
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      if (test()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Test ${test.name} failed:`, error);
      failed++;
    }
  }

  console.log('\n========================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('========================================');

  return failed === 0;
}

// Auto-run tests if in Node.js
if (typeof window === 'undefined') {
  runAllTests();
}
