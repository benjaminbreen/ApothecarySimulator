/**
 * Quick Manual Stress Test
 * Run this in browser console while game is running
 *
 * Usage:
 * 1. Start the game
 * 2. Open browser console (F12)
 * 3. Copy-paste this entire file
 * 4. Run: quickStressTest()
 */

// =======================
// TEST 1: Rapid Fire Actions
// =======================
async function testRapidFireActions() {
  console.log('🔥 TEST 1: Rapid Fire Actions');
  console.log('Clicking everything as fast as possible...');

  const actions = [
    'examine shop',
    'look around',
    'count inventory',
    'check time',
    'think about debts',
    'organize herbs',
    'prepare medicines',
    'clean workspace',
    'review ledger',
    'plan for tomorrow'
  ];

  const startTime = Date.now();
  let errors = [];

  try {
    for (let i = 0; i < 20; i++) {
      const action = actions[i % actions.length];
      const input = document.querySelector('textarea, input[type="text"]');

      if (input) {
        input.value = action;
        input.dispatchEvent(new Event('input', { bubbles: true }));

        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.click();
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms between actions
    }
  } catch (error) {
    errors.push(error);
    console.error('❌ Error during rapid fire:', error);
  }

  const duration = Date.now() - startTime;
  console.log(`✅ Completed in ${duration}ms`);
  console.log(`Errors: ${errors.length}`);

  return { success: errors.length === 0, errors, duration };
}

// =======================
// TEST 2: Modal Stacking
// =======================
function testModalStacking() {
  console.log('🪟 TEST 2: Modal Stacking');
  console.log('Opening multiple modals rapidly...');

  const buttons = {
    inventory: document.querySelector('[data-testid="inventory-button"]') ||
                Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Inventory')),
    journal: document.querySelector('[data-testid="journal-button"]') ||
              Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Journal')),
    map: document.querySelector('[data-testid="map-button"]') ||
          Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Map'))
  };

  let errors = [];

  try {
    // Open all modals with slight delays
    Object.entries(buttons).forEach(([name, button], index) => {
      if (button) {
        setTimeout(() => {
          console.log(`Opening ${name}...`);
          button.click();
        }, index * 200);
      } else {
        console.warn(`⚠️ ${name} button not found`);
      }
    });

    // Close all after 2 seconds
    setTimeout(() => {
      console.log('Closing all modals...');
      const closeButtons = document.querySelectorAll('[aria-label="Close"], button[title="Close"]');
      closeButtons.forEach(btn => btn.click());
      console.log('✅ Modal stacking test complete');
    }, 2000);

  } catch (error) {
    errors.push(error);
    console.error('❌ Error during modal stacking:', error);
  }

  return { success: errors.length === 0, errors };
}

// =======================
// TEST 3: State Inspection
// =======================
function testStateInspection() {
  console.log('🔍 TEST 3: State Inspection');

  // Try to access React state (varies by implementation)
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('❌ Root element not found');
    return { success: false, data: null };
  }

  // Check for common state issues
  const checks = {
    hasLocalStorage: !!localStorage.getItem('gameState-1680-mexico-city'),
    localStorageSize: localStorage.getItem('gameState-1680-mexico-city')?.length || 0,
    conversationHistoryExists: !!localStorage.getItem('conversationHistory'),
    totalLocalStorageItems: Object.keys(localStorage).length
  };

  console.log('State checks:', checks);

  // Validate localStorage isn't corrupted
  try {
    const gameState = JSON.parse(localStorage.getItem('gameState-1680-mexico-city') || '{}');

    const issues = [];

    if (gameState.wealth < 0) {
      issues.push('❌ NEGATIVE WEALTH DETECTED: ' + gameState.wealth);
    }

    if (gameState.energy < 0 || gameState.energy > 100) {
      issues.push('❌ INVALID ENERGY: ' + gameState.energy);
    }

    if (gameState.health < 0 || gameState.health > 100) {
      issues.push('❌ INVALID HEALTH: ' + gameState.health);
    }

    if (gameState.inventory && gameState.inventory.length > 200) {
      issues.push('⚠️ INVENTORY OVERFLOW: ' + gameState.inventory.length + ' items');
    }

    if (issues.length > 0) {
      console.error('State issues found:', issues);
      return { success: false, issues };
    } else {
      console.log('✅ State validation passed');
      return { success: true, gameState };
    }

  } catch (error) {
    console.error('❌ Failed to parse game state:', error);
    return { success: false, error };
  }
}

// =======================
// TEST 4: Resource Depletion
// =======================
function testResourceDepletion() {
  console.log('💰 TEST 4: Resource Depletion');
  console.log('Forcing all resources to critical levels...');

  try {
    const gameStateKey = 'gameState-1680-mexico-city';
    const gameState = JSON.parse(localStorage.getItem(gameStateKey) || '{}');

    console.log('Original state:', {
      wealth: gameState.wealth,
      energy: gameState.energy,
      health: gameState.health
    });

    // Force depletion
    gameState.wealth = 0;
    gameState.energy = 5;
    gameState.health = 10;
    gameState.inventory = [];

    localStorage.setItem(gameStateKey, JSON.stringify(gameState));

    console.log('⚠️ Resources depleted. Reload page to see effects.');
    console.log('Expected behavior: Events should show disabled choices, warnings should appear');

    return {
      success: true,
      message: 'Resources set to critical. Reload page to test behavior.'
    };

  } catch (error) {
    console.error('❌ Failed to deplete resources:', error);
    return { success: false, error };
  }
}

// =======================
// TEST 5: Performance Check
// =======================
function testPerformance() {
  console.log('⚡ TEST 5: Performance Check');

  const metrics = {
    domNodes: document.querySelectorAll('*').length,
    conversationHistoryLength: 0,
    localStorageSize: 0,
    memoryUsage: performance.memory ? {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
    } : 'Not available (Chrome only)'
  };

  try {
    const conversationHistory = JSON.parse(localStorage.getItem('conversationHistory') || '[]');
    metrics.conversationHistoryLength = conversationHistory.length;

    // Calculate total localStorage size
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    metrics.localStorageSize = Math.round(totalSize / 1024) + ' KB';

  } catch (error) {
    console.error('Failed to measure some metrics:', error);
  }

  console.log('Performance metrics:', metrics);

  // Warnings
  const warnings = [];
  if (metrics.domNodes > 5000) {
    warnings.push('⚠️ High DOM node count: ' + metrics.domNodes);
  }
  if (metrics.conversationHistoryLength > 100) {
    warnings.push('⚠️ Long conversation history: ' + metrics.conversationHistoryLength);
  }

  if (warnings.length > 0) {
    console.warn('Performance warnings:', warnings);
  } else {
    console.log('✅ Performance looks good');
  }

  return { metrics, warnings };
}

// =======================
// TEST 6: Error Log Review
// =======================
function testErrorLogReview() {
  console.log('📋 TEST 6: Error Log Review');

  try {
    const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');

    if (errorLog.length === 0) {
      console.log('✅ No errors logged');
      return { success: true, errors: [] };
    } else {
      console.warn(`⚠️ Found ${errorLog.length} logged errors:`);
      errorLog.forEach((log, i) => {
        console.error(`Error ${i + 1} (${log.timestamp}):`, log.error);
      });
      return { success: false, errors: errorLog };
    }
  } catch (error) {
    console.error('Failed to read error log:', error);
    return { success: false, error };
  }
}

// =======================
// RUN ALL TESTS
// =======================
async function quickStressTest() {
  console.clear();
  console.log('🧪 QUICK STRESS TEST SUITE');
  console.log('==========================\n');

  const results = {};

  // Test 1: Rapid Fire (async)
  results.rapidFire = await testRapidFireActions();
  console.log('\n---\n');

  // Test 2: Modal Stacking
  results.modalStacking = testModalStacking();
  console.log('\n---\n');

  // Wait for modals
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test 3: State Inspection
  results.stateInspection = testStateInspection();
  console.log('\n---\n');

  // Test 5: Performance
  results.performance = testPerformance();
  console.log('\n---\n');

  // Test 6: Error Logs
  results.errorLogs = testErrorLogReview();
  console.log('\n---\n');

  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('===============');

  const passed = Object.entries(results).filter(([_, r]) => r.success).length;
  const total = Object.keys(results).length;

  console.log(`✅ Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Review output above.');
  }

  // Optional: Test 4 (destructive - ask first)
  console.log('\n📝 Optional destructive test:');
  console.log('To test resource depletion, run: testResourceDepletion()');

  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.quickStressTest = quickStressTest;
  window.testRapidFireActions = testRapidFireActions;
  window.testModalStacking = testModalStacking;
  window.testStateInspection = testStateInspection;
  window.testResourceDepletion = testResourceDepletion;
  window.testPerformance = testPerformance;
  window.testErrorLogReview = testErrorLogReview;

  console.log('✅ Stress tests loaded!');
  console.log('Run: quickStressTest()');
}
