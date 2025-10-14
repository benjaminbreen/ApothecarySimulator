// Phase 2 Portrait System Test Suite
// Automated tests for NPC identity consistency, portrait resolution, and edge cases

import { orchestrateTurn } from '../core/agents/AgentOrchestrator';
import { entityManager } from '../core/entities/EntityManager';

/**
 * Test scenario definitions
 * Each scenario simulates a real gameplay situation
 */
export const TEST_SCENARIOS = [
  {
    id: 'npc-conversation-continuity',
    name: 'NPC Conversation Continuity',
    description: 'Tests that same NPC maintains identity across 3 turns',
    turns: [
      { action: 'go to the door', expectedBehavior: 'New NPC arrives with portrait' },
      { action: 'what do you need?', expectedBehavior: 'Same NPC, same name, same portrait' },
      { action: 'tell me more about that', expectedBehavior: 'Still same NPC, no identity change' }
    ],
    checks: [
      { type: 'identity_consistency', description: 'Same NPC name across all turns' },
      { type: 'portrait_consistency', description: 'Same portrait file across all turns' },
      { type: 'no_fallback_warnings', description: 'Phase 2 primary path used (no fallbacks)' },
      { type: 'conversation_continuation_detected', description: 'EntityAgent detected continuation' }
    ]
  },

  {
    id: 'contract-to-patient-transition',
    name: 'Contract → Patient Transition',
    description: 'Tests portrait switches from NPC to patient after contract',
    turns: [
      { action: 'answer the door', expectedBehavior: 'NPC messenger arrives' },
      { action: 'what do you need?', expectedBehavior: 'NPC offers contract' },
      // Note: Contract acceptance happens via modal, not turn-based
      // This test will check logs for portrait update when patient set
    ],
    checks: [
      { type: 'portrait_update_on_patient', description: 'Portrait updates when patient becomes active' },
      { type: 'messenger_portrait_first', description: 'Initially shows messenger, not absent patient' }
    ]
  },

  {
    id: 'edge-case-no-npc',
    name: 'Edge Case: Player Alone',
    description: 'Tests behavior when no NPC is present',
    turns: [
      { action: 'look around the shop', expectedBehavior: 'No NPC, no portrait' },
      { action: 'organize my shelves', expectedBehavior: 'Still alone, no errors' }
    ],
    checks: [
      { type: 'no_portrait_when_alone', description: 'primaryPortrait is null when alone' },
      { type: 'no_crashes', description: 'No undefined errors' }
    ]
  },

  {
    id: 'edge-case-animal',
    name: 'Edge Case: Animal Interaction',
    description: 'Tests that animals don\'t get human portraits',
    turns: [
      { action: 'pet João the cat', expectedBehavior: 'Animal mentioned, no portrait' }
    ],
    checks: [
      { type: 'no_portrait_for_animal', description: 'primaryPortrait is null for animals' }
    ]
  },

  {
    id: 'physically-present-person',
    name: 'Show Physically Present Person',
    description: 'Tests that portrait shows person AT the scene, not discussed person',
    turns: [
      { action: 'answer the door', expectedBehavior: 'Mother at door (not her sick child)' }
    ],
    checks: [
      { type: 'correct_physical_presence', description: 'Shows person at door, not absent relative' }
    ]
  }
];

/**
 * Run a single test scenario
 * @param {Object} scenario - Test scenario from TEST_SCENARIOS
 * @param {Object} gameState - Current game state
 * @param {Function} logCallback - Callback for logging test progress
 * @returns {Promise<Object>} Test results
 */
export async function runTestScenario(scenario, gameState, logCallback = console.log) {
  const results = {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    passed: true,
    turns: [],
    checks: [],
    errors: [],
    warnings: []
  };

  logCallback(`\n🧪 Running: ${scenario.name}`);
  logCallback(`   ${scenario.description}`);

  // Store conversation history for multi-turn tests
  let conversationHistory = [
    { role: 'user', content: 'Begin the game' },
    { role: 'assistant', content: 'The day begins at your apothecary shop...' }
  ];

  // Track NPC identity across turns
  let firstNPCName = null;
  let firstPortraitFile = null;

  // PHASE 2: Track recent portrait for continuity testing
  let recentPortrait = null;

  // Capture console logs to detect warnings
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  const capturedLogs = [];

  console.warn = (...args) => {
    capturedLogs.push({ level: 'warn', message: args.join(' ') });
    originalConsoleWarn(...args);
  };

  console.log = (...args) => {
    const msg = args.join(' ');
    capturedLogs.push({ level: 'log', message: msg });
    originalConsoleLog(...args);
  };

  try {
    // Execute each turn in the scenario
    for (let i = 0; i < scenario.turns.length; i++) {
      const turn = scenario.turns[i];
      logCallback(`   Turn ${i + 1}: "${turn.action}" → expecting: ${turn.expectedBehavior}`);

      // Call orchestrateTurn with real LLM
      const result = await orchestrateTurn({
        scenarioId: gameState.scenarioId || '1680-mexico-city',
        playerAction: turn.action,
        conversationHistory,
        gameState,
        turnNumber: i + 1,
        recentNPCs: firstNPCName ? [firstNPCName] : [],
        reputation: gameState.reputation || { overall: 50, factions: {} },
        wealth: gameState.wealth || 100,
        mapData: null,
        playerPosition: null,
        currentMapId: null,
        playerSkills: null,
        journal: [],
        activePatient: null,
        recentPortrait: recentPortrait // PHASE 2: Pass last portrait for continuity
      });

      // Store turn results
      const turnResult = {
        turnNumber: i + 1,
        action: turn.action,
        success: result.success,
        npcName: result.primaryNPC?.name || null,
        portraitFile: result.primaryPortrait || null,
        narrative: result.narrative.substring(0, 100) + '...',
        selectedEntity: result.selectedEntity?.name || null
      };

      results.turns.push(turnResult);

      // Track first NPC for continuity tests
      if (i === 0 && result.primaryNPC) {
        firstNPCName = result.primaryNPC.name;
        firstPortraitFile = result.primaryPortrait;
        logCallback(`      ✓ First NPC: ${firstNPCName} (${firstPortraitFile})`);
      }

      // PHASE 2: Store portrait for next turn's continuity check
      if (result.primaryPortrait) {
        recentPortrait = result.primaryPortrait;
        logCallback(`      ✓ Stored portrait for next turn: ${recentPortrait}`);
      }

      // Update conversation history
      conversationHistory.push(
        { role: 'user', content: turn.action },
        { role: 'assistant', content: result.narrative }
      );
    }

    // Run checks
    logCallback(`   Running ${scenario.checks.length} checks...`);

    for (const check of scenario.checks) {
      const checkResult = runCheck(check, results.turns, capturedLogs, {
        firstNPCName,
        firstPortraitFile
      });

      results.checks.push(checkResult);

      if (!checkResult.passed) {
        results.passed = false;
        logCallback(`      ❌ ${check.description}: ${checkResult.reason}`);
      } else {
        logCallback(`      ✅ ${check.description}`);
      }
    }

  } catch (error) {
    results.passed = false;
    results.errors.push(error.message);
    logCallback(`   💥 ERROR: ${error.message}`);
  } finally {
    // Restore console
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  }

  // Collect warnings from captured logs
  const warnings = capturedLogs.filter(log =>
    log.level === 'warn' ||
    log.message.includes('⚠️') ||
    log.message.includes('FALLBACK')
  );
  results.warnings = warnings.map(w => w.message);

  if (results.passed) {
    logCallback(`   ✅ PASSED\n`);
  } else {
    logCallback(`   ❌ FAILED\n`);
  }

  return results;
}

/**
 * Run a specific check on test results
 * @param {Object} check - Check definition
 * @param {Array} turns - Turn results
 * @param {Array} logs - Captured console logs
 * @param {Object} context - Additional context (firstNPCName, etc.)
 * @returns {Object} Check result
 */
function runCheck(check, turns, logs, context) {
  const result = {
    type: check.type,
    description: check.description,
    passed: false,
    reason: ''
  };

  switch (check.type) {
    case 'identity_consistency':
      // All turns should have same NPC name
      const npcNames = turns.map(t => t.npcName).filter(n => n !== null);
      const uniqueNames = [...new Set(npcNames)];

      if (uniqueNames.length === 0) {
        result.passed = false;
        result.reason = 'No NPC appeared in any turn';
      } else if (uniqueNames.length === 1) {
        result.passed = true;
        result.reason = `Consistent identity: ${uniqueNames[0]}`;
      } else {
        result.passed = false;
        result.reason = `Identity changed: ${uniqueNames.join(' → ')}`;
      }
      break;

    case 'portrait_consistency':
      // All turns should have same portrait file
      const portraits = turns.map(t => t.portraitFile).filter(p => p !== null);
      const uniquePortraits = [...new Set(portraits)];

      if (uniquePortraits.length === 0) {
        result.passed = false;
        result.reason = 'No portrait appeared in any turn';
      } else if (uniquePortraits.length === 1) {
        result.passed = true;
        result.reason = `Consistent portrait: ${uniquePortraits[0]}`;
      } else {
        result.passed = false;
        result.reason = `Portrait changed: ${uniquePortraits.join(' → ')}`;
      }
      break;

    case 'no_fallback_warnings':
      // Check if Phase 2 fallback was used
      const fallbackWarnings = logs.filter(log =>
        log.message.includes('⚠️ FALLBACK') ||
        log.message.includes('Using old portrait resolver')
      );

      if (fallbackWarnings.length === 0) {
        result.passed = true;
        result.reason = 'Phase 2 primary path used (no fallbacks)';
      } else {
        result.passed = false;
        result.reason = `${fallbackWarnings.length} fallback warning(s) detected`;
      }
      break;

    case 'conversation_continuation_detected':
      // Check if EntityAgent detected continuation
      const continuationLogs = logs.filter(log =>
        log.message.includes('Conversation continuation detected')
      );

      if (continuationLogs.length > 0) {
        result.passed = true;
        result.reason = `Detected ${continuationLogs.length} continuation(s)`;
      } else {
        result.passed = false;
        result.reason = 'EntityAgent did not detect conversation continuation';
      }
      break;

    case 'no_portrait_when_alone':
      // Portrait should be null when no NPC present
      const hasPortrait = turns.some(t => t.portraitFile !== null);

      if (!hasPortrait) {
        result.passed = true;
        result.reason = 'No portrait shown when alone (correct)';
      } else {
        result.passed = false;
        result.reason = 'Portrait shown when player is alone (incorrect)';
      }
      break;

    case 'no_crashes':
      // Check for error-related logs
      const errorLogs = logs.filter(log =>
        log.level === 'warn' &&
        (log.message.includes('undefined') || log.message.includes('null'))
      );

      if (errorLogs.length === 0) {
        result.passed = true;
        result.reason = 'No crashes or undefined errors';
      } else {
        result.passed = false;
        result.reason = `${errorLogs.length} error(s) detected`;
      }
      break;

    case 'portrait_update_on_patient':
      // Check for patient portrait update log
      const updateLogs = logs.filter(log =>
        log.message.includes('Patient now present, updating portrait')
      );

      if (updateLogs.length > 0) {
        result.passed = true;
        result.reason = 'Portrait update detected when patient set';
      } else {
        result.passed = false;
        result.reason = 'No portrait update detected for patient transition';
      }
      break;

    case 'messenger_portrait_first':
      // First turn should show messenger, not patient
      if (turns.length > 0 && turns[0].npcName) {
        const firstNPC = turns[0].npcName.toLowerCase();
        const isPatient = firstNPC.includes('patient') || firstNPC.includes('sick');

        if (!isPatient) {
          result.passed = true;
          result.reason = `Correctly shows messenger: ${turns[0].npcName}`;
        } else {
          result.passed = false;
          result.reason = `Incorrectly shows patient instead of messenger`;
        }
      } else {
        result.passed = false;
        result.reason = 'No NPC in first turn';
      }
      break;

    case 'no_portrait_for_animal':
      // Portrait should be null for animal interactions
      const hasAnimalPortrait = turns.some(t => t.portraitFile !== null);

      if (!hasAnimalPortrait) {
        result.passed = true;
        result.reason = 'No portrait shown for animal (correct)';
      } else {
        result.passed = false;
        result.reason = 'Portrait shown for animal interaction (incorrect)';
      }
      break;

    case 'correct_physical_presence':
      // First turn should show person at door, check narrative
      if (turns.length > 0) {
        const narrative = turns[0].narrative.toLowerCase();
        const hasMotherAtDoor = narrative.includes('mother') || narrative.includes('woman');
        const hasSickChild = narrative.includes('sick') || narrative.includes('child') || narrative.includes('son');

        if (hasMotherAtDoor && hasSickChild) {
          // Check that portrait is for adult woman, not child
          const portrait = turns[0].portraitFile;
          const isChildPortrait = portrait?.includes('child') || portrait?.includes('boy') || portrait?.includes('girl');

          if (!isChildPortrait) {
            result.passed = true;
            result.reason = `Correct: Shows mother (${portrait}), not sick child`;
          } else {
            result.passed = false;
            result.reason = `Incorrect: Shows sick child (${portrait}) instead of mother`;
          }
        } else {
          result.passed = true;
          result.reason = 'Scenario did not trigger (no mother with sick child)';
        }
      } else {
        result.passed = false;
        result.reason = 'No turns executed';
      }
      break;

    default:
      result.passed = false;
      result.reason = `Unknown check type: ${check.type}`;
  }

  return result;
}

/**
 * Run all test scenarios
 * @param {Object} gameState - Current game state
 * @param {Function} logCallback - Callback for logging progress
 * @returns {Promise<Object>} All test results
 */
export async function runAllTests(gameState, logCallback = console.log) {
  logCallback('\n═══════════════════════════════════════════');
  logCallback('🧪 PHASE 2 PORTRAIT SYSTEM TEST SUITE');
  logCallback('═══════════════════════════════════════════\n');

  const allResults = {
    timestamp: new Date().toISOString(),
    totalTests: TEST_SCENARIOS.length,
    passed: 0,
    failed: 0,
    scenarios: []
  };

  for (const scenario of TEST_SCENARIOS) {
    const result = await runTestScenario(scenario, gameState, logCallback);
    allResults.scenarios.push(result);

    if (result.passed) {
      allResults.passed++;
    } else {
      allResults.failed++;
    }
  }

  logCallback('\n═══════════════════════════════════════════');
  logCallback(`✅ PASSED: ${allResults.passed}/${allResults.totalTests}`);
  logCallback(`❌ FAILED: ${allResults.failed}/${allResults.totalTests}`);
  logCallback('═══════════════════════════════════════════\n');

  return allResults;
}
