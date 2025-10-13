/**
 * Game Systems Test Suite
 * Tests for NPC conditions, patient flow, and shop sign mechanics
 */

import { checkNPCConditions, getCriticalNPC, filterAvailableNPCs } from '../systems/npcConditions';
import { calculatePatientFlow } from '../systems/patientFlow';

/**
 * Test result structure
 * @typedef {Object} TestResult
 * @property {string} name - Test name
 * @property {boolean} passed - Whether test passed
 * @property {string} message - Success or failure message
 * @property {*} expected - Expected value
 * @property {*} actual - Actual value
 * @property {number} duration - Test duration in ms
 */

/**
 * Base test runner
 */
function runTest(name, testFn) {
  const startTime = performance.now();
  try {
    const result = testFn();
    const duration = performance.now() - startTime;

    if (result.passed) {
      return {
        name,
        passed: true,
        message: result.message || 'Test passed',
        expected: result.expected,
        actual: result.actual,
        duration
      };
    } else {
      return {
        name,
        passed: false,
        message: result.message || 'Test failed',
        expected: result.expected,
        actual: result.actual,
        duration
      };
    }
  } catch (error) {
    const duration = performance.now() - startTime;
    return {
      name,
      passed: false,
      message: `Test threw error: ${error.message}`,
      error: error.stack,
      duration
    };
  }
}

/**
 * Assert helper
 */
function assert(actual, expected, message) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  return {
    passed,
    message: passed ? message : `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    expected,
    actual
  };
}

function assertGreaterThan(actual, threshold, message) {
  const passed = actual > threshold;
  return {
    passed,
    message: passed ? message : `Expected ${actual} > ${threshold}`,
    expected: `> ${threshold}`,
    actual
  };
}

function assertLessThan(actual, threshold, message) {
  const passed = actual < threshold;
  return {
    passed,
    message: passed ? message : `Expected ${actual} < ${threshold}`,
    expected: `< ${threshold}`,
    actual
  };
}

function assertBetween(actual, min, max, message) {
  const passed = actual >= min && actual <= max;
  return {
    passed,
    message: passed ? message : `Expected ${actual} to be between ${min} and ${max}`,
    expected: `${min} - ${max}`,
    actual
  };
}

function assertTrue(actual, message) {
  return {
    passed: actual === true,
    message: actual === true ? message : `Expected true, got ${actual}`,
    expected: true,
    actual
  };
}

function assertFalse(actual, message) {
  return {
    passed: actual === false,
    message: actual === false ? message : `Expected false, got ${actual}`,
    expected: false,
    actual
  };
}

// =====================================================
// NPC CONDITION TESTS
// =====================================================

export function testDonLuisDeadlineWeight() {
  return runTest('Don Luis - Debt deadline weight multiplier', () => {
    // Test 1: Deadline passed
    const gameStateDeadlinePassed = {
      date: 'August 24, 1680',
      time: '10:00 AM',
      location: 'Botica de la Amargura',
      turnNumber: 15,
      currentWealth: 50,
      reputation: { overall: 50 }
    };

    const result1 = checkNPCConditions('Don Luis', gameStateDeadlinePassed);
    if (result1.weight !== 100) {
      return {
        passed: false,
        message: 'Don Luis should have 100x weight when deadline passed',
        expected: 100,
        actual: result1.weight
      };
    }

    // Test 2: Deadline tomorrow
    const gameStateDeadlineTomorrow = {
      date: 'August 22, 1680',
      time: '10:00 AM',
      location: 'Botica de la Amargura',
      turnNumber: 12,
      currentWealth: 50,
      reputation: { overall: 50 }
    };

    const result2 = checkNPCConditions('Don Luis', gameStateDeadlineTomorrow);
    if (result2.weight !== 50) {
      return {
        passed: false,
        message: 'Don Luis should have 50x weight when deadline is tomorrow',
        expected: 50,
        actual: result2.weight
      };
    }

    // Test 3: Deadline in 3 days
    const gameStateDeadlineDistant = {
      date: 'August 20, 1680',
      time: '10:00 AM',
      location: 'Botica de la Amargura',
      turnNumber: 8,
      currentWealth: 50,
      reputation: { overall: 50 }
    };

    const result3 = checkNPCConditions('Don Luis', gameStateDeadlineDistant);
    if (result3.weight !== 10) {
      return {
        passed: false,
        message: 'Don Luis should have 10x weight when deadline is 3 days away',
        expected: 10,
        actual: result3.weight
      };
    }

    return {
      passed: true,
      message: 'Don Luis weight scaling works correctly',
      actual: 'All weight tiers work (100x, 50x, 10x)'
    };
  });
}

export function testInquisitorReputationConditions() {
  return runTest('Inquisitor - Church reputation conditions', () => {
    // Test 1: Very low church reputation
    const gameStateLowRep = {
      date: 'August 22, 1680',
      time: '10:00 AM',
      location: 'Botica de la Amargura',
      turnNumber: 20,
      reputation: { church: 15 }
    };

    const result1 = checkNPCConditions('Inquisitor Fernando', gameStateLowRep);
    if (result1.weight !== 30) {
      return {
        passed: false,
        message: 'Inquisitor should have 30x weight when church rep < 20',
        expected: 30,
        actual: result1.weight
      };
    }

    // Test 2: Moderate church reputation
    const gameStateModRep = {
      date: 'August 22, 1680',
      time: '10:00 AM',
      location: 'Botica de la Amargura',
      turnNumber: 20,
      reputation: { church: 25 }
    };

    const result2 = checkNPCConditions('Inquisitor Fernando', gameStateModRep);
    if (result2.weight !== 15) {
      return {
        passed: false,
        message: 'Inquisitor should have 15x weight when church rep 20-30',
        expected: 15,
        actual: result2.weight
      };
    }

    // Test 3: Too early (should be unavailable)
    const gameStateEarly = {
      date: 'August 22, 1680',
      time: '10:00 AM',
      location: 'Botica de la Amargura',
      turnNumber: 10,
      reputation: { church: 15 }
    };

    const result3 = checkNPCConditions('Inquisitor Fernando', gameStateEarly);
    if (result3.available !== false) {
      return {
        passed: false,
        message: 'Inquisitor should be unavailable before turn 15',
        expected: false,
        actual: result3.available
      };
    }

    return {
      passed: true,
      message: 'Inquisitor reputation-based appearance works correctly'
    };
  });
}

export function testNewNPCTimingConditions() {
  return runTest('New NPCs - Timing and availability', () => {
    const gameStateEarly = {
      date: 'August 22, 1680',
      time: '10:00 AM',
      location: 'Botica de la Amargura',
      turnNumber: 8,
      reputation: { commonFolk: 50 }
    };

    // Tía Makeda - unavailable before turn 12
    const makeda = checkNPCConditions('Tía Makeda', gameStateEarly);
    if (makeda.available !== false) {
      return {
        passed: false,
        message: 'Tía Makeda should be unavailable before turn 12',
        expected: false,
        actual: makeda.available
      };
    }

    // Xochiquetzal - unavailable before turn 20
    const xochiquetzal = checkNPCConditions('Xochiquetzal', gameStateEarly);
    if (xochiquetzal.available !== false) {
      return {
        passed: false,
        message: 'Xochiquetzal should be unavailable before turn 20',
        expected: false,
        actual: xochiquetzal.available
      };
    }

    // Esteban - unavailable before turn 15
    const esteban = checkNPCConditions('Esteban Velázquez', gameStateEarly);
    if (esteban.available !== false) {
      return {
        passed: false,
        message: 'Esteban should be unavailable before turn 15',
        expected: false,
        actual: esteban.available
      };
    }

    return {
      passed: true,
      message: 'New NPC timing gates work correctly'
    };
  });
}

export function testLocationBasedWeights() {
  return runTest('Location-based NPC weight modifiers', () => {
    // Leonor at market - should get weight boost
    const gameStateAtMarket = {
      date: 'August 22, 1680',
      time: '10:00 AM',
      location: 'Market Plaza',
      turnNumber: 15,
      currentWealth: 150,
      reputation: { overall: 50 }
    };

    const leonor = checkNPCConditions('Leonor Méndez de Arteaga', gameStateAtMarket);
    if (leonor.weight !== 4) {
      return {
        passed: false,
        message: 'Leonor should have 4x weight at market',
        expected: 4,
        actual: leonor.weight
      };
    }

    // Xochiquetzal outside shop - should get weight boost
    const gameStateOutside = {
      date: 'August 22, 1680',
      time: '10:00 AM',
      location: 'Alameda Park',
      turnNumber: 25,
      reputation: { overall: 50 }
    };

    const xochiquetzal = checkNPCConditions('Xochiquetzal', gameStateOutside);
    if (xochiquetzal.weight !== 3) {
      return {
        passed: false,
        message: 'Xochiquetzal should have 3x weight outside shop',
        expected: 3,
        actual: xochiquetzal.weight
      };
    }

    return {
      passed: true,
      message: 'Location-based weights work correctly'
    };
  });
}

export function testGetCriticalNPC() {
  return runTest('getCriticalNPC - Don Luis on deadline', () => {
    const gameStateDeadline = {
      date: 'August 24, 1680',
      time: '10:00 AM'
    };

    const criticalNPC = getCriticalNPC(gameStateDeadline);

    return assert(criticalNPC, 'Don Luis', 'Don Luis should be critical NPC when deadline passes');
  });
}

// =====================================================
// PATIENT FLOW TESTS
// =====================================================

export function testPatientFlowWithSign() {
  return runTest('Patient Flow - Sign hung vs no sign', () => {
    const gameStateWithSign = {
      location: 'Botica de la Amargura',
      shopSign: { hung: true },
      reputation: { overall: 50, medical: 50 },
      time: '2:00 PM',
      turnNumber: 10
    };

    const flowWithSign = calculatePatientFlow(gameStateWithSign);

    if (!flowWithSign.active) {
      return {
        passed: false,
        message: 'Patient flow should be active at shop',
        expected: true,
        actual: flowWithSign.active
      };
    }

    if (flowWithSign.chance < 70) {
      return {
        passed: false,
        message: 'Base chance with sign should be >= 70% (before multipliers)',
        expected: '>= 70',
        actual: flowWithSign.chance
      };
    }

    // Test without sign
    const gameStateNoSign = {
      ...gameStateWithSign,
      shopSign: { hung: false }
    };

    const flowNoSign = calculatePatientFlow(gameStateNoSign);

    if (flowNoSign.chance >= flowWithSign.chance) {
      return {
        passed: false,
        message: 'Patient chance should be lower without sign',
        expected: `< ${flowWithSign.chance}`,
        actual: flowNoSign.chance
      };
    }

    return {
      passed: true,
      message: `Sign impact works: ${flowWithSign.chance.toFixed(1)}% with sign vs ${flowNoSign.chance.toFixed(1)}% without`,
      actual: {
        withSign: flowWithSign.chance,
        withoutSign: flowNoSign.chance
      }
    };
  });
}

export function testPatientFlowTimeOfDay() {
  return runTest('Patient Flow - Time of day multipliers', () => {
    const baseState = {
      location: 'Botica de la Amargura',
      shopSign: { hung: true },
      reputation: { overall: 50, medical: 50 },
      turnNumber: 10
    };

    // Test morning
    const morning = calculatePatientFlow({ ...baseState, time: '9:00 AM' });

    // Test afternoon (should be highest)
    const afternoon = calculatePatientFlow({ ...baseState, time: '2:00 PM' });

    // Test night (should be lowest)
    const night = calculatePatientFlow({ ...baseState, time: '11:00 PM' });

    if (afternoon.chance <= morning.chance) {
      return {
        passed: false,
        message: 'Afternoon should have higher patient chance than morning',
        expected: `> ${morning.chance}`,
        actual: afternoon.chance
      };
    }

    if (night.chance >= morning.chance) {
      return {
        passed: false,
        message: 'Night should have lower patient chance than morning',
        expected: `< ${morning.chance}`,
        actual: night.chance
      };
    }

    return {
      passed: true,
      message: 'Time multipliers work correctly',
      actual: {
        morning: morning.chance.toFixed(1),
        afternoon: afternoon.chance.toFixed(1),
        night: night.chance.toFixed(1)
      }
    };
  });
}

export function testPatientFlowReputation() {
  return runTest('Patient Flow - Reputation effects', () => {
    const baseState = {
      location: 'Botica de la Amargura',
      shopSign: { hung: true },
      time: '2:00 PM',
      turnNumber: 10
    };

    // High reputation
    const highRep = calculatePatientFlow({
      ...baseState,
      reputation: { overall: 80, medical: 80 }
    });

    // Low reputation
    const lowRep = calculatePatientFlow({
      ...baseState,
      reputation: { overall: 20, medical: 20 }
    });

    // Average reputation
    const avgRep = calculatePatientFlow({
      ...baseState,
      reputation: { overall: 50, medical: 50 }
    });

    if (highRep.chance <= avgRep.chance) {
      return {
        passed: false,
        message: 'High reputation should increase patient chance',
        expected: `> ${avgRep.chance}`,
        actual: highRep.chance
      };
    }

    if (lowRep.chance >= avgRep.chance) {
      return {
        passed: false,
        message: 'Low reputation should decrease patient chance',
        expected: `< ${avgRep.chance}`,
        actual: lowRep.chance
      };
    }

    return {
      passed: true,
      message: 'Reputation multipliers work correctly',
      actual: {
        highRep: highRep.chance.toFixed(1),
        avgRep: avgRep.chance.toFixed(1),
        lowRep: lowRep.chance.toFixed(1)
      }
    };
  });
}

export function testPatientFlowNotAtShop() {
  return runTest('Patient Flow - Not at shop location', () => {
    const gameStateAway = {
      location: 'Alameda Park',
      shopSign: { hung: true },
      reputation: { overall: 50 },
      time: '2:00 PM',
      turnNumber: 10
    };

    const flow = calculatePatientFlow(gameStateAway);

    return assertFalse(flow.active, 'Patient flow should be inactive when not at shop');
  });
}

// =====================================================
// INTEGRATION TESTS
// =====================================================

export function testFilterAvailableNPCs() {
  return runTest('filterAvailableNPCs - Early game filtering', () => {
    const mockNPCs = [
      { name: 'Don Luis' },
      { name: 'Tía Makeda' },
      { name: 'Xochiquetzal' },
      { name: 'Esteban Velázquez' }
    ];

    const earlyGameState = {
      date: 'August 22, 1680',
      time: '10:00 AM',
      location: 'Botica de la Amargura',
      turnNumber: 8,
      reputation: { overall: 50 }
    };

    const available = filterAvailableNPCs(mockNPCs, earlyGameState);

    // Don Luis should be available, others shouldn't
    const hasLuis = available.some(npc => npc.name === 'Don Luis');
    const hasMakeda = available.some(npc => npc.name === 'Tía Makeda');
    const hasXochiquetzal = available.some(npc => npc.name === 'Xochiquetzal');
    const hasEsteban = available.some(npc => npc.name === 'Esteban Velázquez');

    if (!hasLuis || hasMakeda || hasXochiquetzal || hasEsteban) {
      return {
        passed: false,
        message: 'Only Don Luis should be available at turn 8',
        expected: ['Don Luis'],
        actual: available.map(npc => npc.name)
      };
    }

    return {
      passed: true,
      message: 'Early game filtering works correctly',
      actual: available.map(npc => npc.name)
    };
  });
}

// =====================================================
// TEST SUITE RUNNER
// =====================================================

export function runAllTests() {
  const tests = [
    // NPC Condition Tests
    testDonLuisDeadlineWeight,
    testInquisitorReputationConditions,
    testNewNPCTimingConditions,
    testLocationBasedWeights,
    testGetCriticalNPC,

    // Patient Flow Tests
    testPatientFlowWithSign,
    testPatientFlowTimeOfDay,
    testPatientFlowReputation,
    testPatientFlowNotAtShop,

    // Integration Tests
    testFilterAvailableNPCs
  ];

  const results = tests.map(test => test());

  const summary = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => r.failed).length,
    totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    results
  };

  return summary;
}
