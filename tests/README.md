# Testing Infrastructure

Comprehensive testing suite for Apothecary Simulator game.

## Quick Start

### Dev Panel Tests (Recommended)
**These tests make real LLM calls and verify actual game behavior:**

1. Start the game: `npm run dev`
2. Open Settings → Dev Panel
3. Run test suites:
   - **Game Systems Test Suite** - NPC conditions, patient flow, shop sign mechanics
   - **Portrait Selection Tests** - Portrait priority and resolution
   - **Phase 2 Portrait System** - NPC identity consistency, portrait resolution, edge cases
   - **Simple Interaction Test Suite** - Continuation narratives for water sellers, beggars, information exchanges

### Jest Unit Tests (Fast, No LLM)
```bash
# Run unit tests for pure logic
npm run test:unit

# Run with coverage report
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Test Structure

```
tests/
├── README.md                      # This file
├── setup/
│   └── jest.setup.js              # Jest configuration and global mocks
├── mocks/
│   ├── fileMock.js                # Mock for image/asset imports
│   └── llmService.mock.js         # Mock LLM API calls
├── fixtures/
│   └── gameState.fixture.js       # Reusable test data
├── utils/
│   └── testHelpers.js             # Common test utilities
├── unit/
│   └── eventSelector.test.js      # Unit tests (fast, no LLM)
├── integration/
│   └── simpleInteractions.test.js # Integration tests (mocked LLM)
└── manual/
    └── quickStressTest.js         # Browser console stress tests
```

## Test Types

### Dev Panel Tests (Primary Testing Method)
- **Purpose**: Test full game systems with real LLM calls
- **Speed**: Slower (1-3 minutes for full suites)
- **LLM**: Real LLM calls via OpenAI/Gemini APIs
- **Examples**: Simple interactions, NPC identity, portrait selection, game systems

**Available Test Suites**:

1. **Simple Interaction Test Suite** (`src/tests/simpleInteractionTests.js`)
   - Tests continuation narrative generation for water sellers, beggars, information exchanges
   - Verifies buy/refuse, give/refuse, pay/refuse workflows
   - Checks that LLM generates next steps after interactions

2. **Phase 2 Portrait System** (`src/tests/phase2Tests.js`)
   - Tests NPC identity consistency across conversation turns
   - Contract → patient transitions
   - Edge cases (player alone, animals, physical presence)

3. **Game Systems Tests** (`src/core/testing/gameSystemTests.js`)
   - NPC condition checks
   - Patient flow validation
   - Shop sign mechanics

**How to run**:
- Open game → Settings → Dev Panel
- Click "Run All Tests" on desired test suite
- View live logs and detailed results

### Unit Tests (`tests/unit/`)
- **Purpose**: Test individual functions and logic in isolation
- **Speed**: Very fast (milliseconds)
- **LLM**: No LLM calls (pure logic testing)
- **Examples**: Event selection, state calculations, filtering

**When to write**:
- Testing pure functions
- Testing game rules and calculations
- Testing data structures and utilities

**Example**:
```javascript
test('respects max occurrences per session', () => {
  const event = selectEventById('street-juggler');
  recordEventOccurrence('street-juggler'); // Record max times
  const selected = selectRandomEvent(context);
  expect(selected.id).not.toBe('street-juggler'); // Should be blocked
});
```

### Manual Tests (`tests/manual/`)
- **Purpose**: Interactive testing in browser
- **Speed**: Manual execution
- **LLM**: Real LLM calls
- **Examples**: Stress testing, UI testing, exploratory testing

**How to run**:
1. Start the dev server: `npm run dev`
2. Open browser console (F12)
3. Copy-paste `tests/manual/quickStressTest.js`
4. Run: `quickStressTest()`

**Available tests**:
- `quickStressTest()` - Run all tests
- `testRapidFireActions()` - Spam 20 actions rapidly
- `testModalStacking()` - Open multiple modals
- `testStateInspection()` - Check localStorage validity
- `testResourceDepletion()` - Force critical state
- `testPerformance()` - Measure DOM/memory usage
- `testErrorLogReview()` - Check error log

## Test Utilities

### Fixtures (`tests/fixtures/gameState.fixture.js`)
Reusable test data for consistent testing:

```javascript
import { defaultGameState, criticalGameState } from '../fixtures/gameState.fixture';

test('handles low energy correctly', () => {
  const result = checkResourceWarnings(criticalGameState);
  expect(result.energyWarning).toBe(true);
});
```

Available fixtures:
- `defaultGameState` - Standard mid-game state
- `earlyGameState` - Turn 1-3, low resources
- `lateGameState` - Turn 50+, high resources
- `criticalGameState` - Low health/energy/wealth
- `brokeGameState` - Zero money
- `defaultReputation` - Neutral reputation
- `highReputation` - Well-liked across factions
- `lowReputation` - Suspicious and mistrusted
- `defaultEventContext` - Standard event trigger context

### Test Helpers (`tests/utils/testHelpers.js`)
Common utilities for cleaner tests:

```javascript
import { expectInventoryChange, expectReputationChange } from '../utils/testHelpers';

test('buying water reduces wealth', () => {
  const before = { inventory: [...], wealth: 50 };
  const after = buyWater(before);

  expectInventoryChange(before.inventory, after.inventory, 'Water', +1);
  expect(after.wealth).toBe(49);
});
```

Available helpers:
- `renderWithProviders()` - Render with React context
- `waitForAsync()` - Wait for promises to resolve
- `createMockEvent()` - Mock DOM events
- `createMockConversationHistory()` - Generate conversation arrays
- `expectGameStateChange()` - Assert state mutations
- `expectReputationChange()` - Verify faction reputation
- `expectInventoryChange()` - Verify item quantities
- `getConsoleErrors()` - Check error logging
- `clearConsoleMocks()` - Reset console spies

### Creating New Dev Panel Tests

To add a new LLM test suite to the dev panel:

1. **Create test file** in `src/tests/`:
```javascript
// src/tests/myFeatureTests.js
export const TEST_SCENARIOS = [
  {
    id: 'my-test',
    name: 'My Test Name',
    description: 'What this tests',
    turns: [
      { action: 'player action', expectedBehavior: 'what should happen' }
    ],
    checks: [
      { type: 'check_type', description: 'What to verify' }
    ]
  }
];

export async function runTestScenario(scenario, gameState, logCallback) {
  // Make real LLM calls via orchestrateTurn
  // Return structured results
}

export async function runAllTests(gameState, logCallback) {
  // Run all scenarios, return combined results
}
```

2. **Create UI panel** in `src/components/`:
```javascript
// src/components/MyFeatureTestPanel.jsx
import { runAllTests, TEST_SCENARIOS } from '../tests/myFeatureTests';

const MyFeatureTestPanel = ({ gameState }) => {
  // Similar structure to SimpleInteractionTestPanel
  // Shows test scenarios, runs tests, displays results
};
```

3. **Add to Settings**:
```javascript
// src/components/SettingsModal_V3.jsx
import MyFeatureTestPanel from './MyFeatureTestPanel';

// In DevSection:
<SettingCard title="My Feature Tests">
  <MyFeatureTestPanel gameState={gameState} />
</SettingCard>
```

## Writing New Tests

### Unit Test Template
```javascript
import { functionToTest } from '../../src/path/to/module';
import { defaultGameState } from '../fixtures/gameState.fixture';

describe('Feature Name - Specific Behavior', () => {
  beforeEach(() => {
    // Reset state before each test
  });

  test('does what it should do', () => {
    const input = { /* test data */ };
    const result = functionToTest(input);

    expect(result).toEqual(expectedOutput);
  });

  test('handles edge cases correctly', () => {
    const edgeCase = { /* edge case data */ };
    const result = functionToTest(edgeCase);

    expect(result).toBeDefined();
  });
});
```

### Integration Test Template
```javascript
import { mockLLMFunction } from '../mocks/llmService.mock';
import { defaultGameState } from '../fixtures/gameState.fixture';

jest.mock('../../src/core/services/llmService', () => require('../mocks/llmService.mock'));

describe('Feature Flow - User Action', () => {
  beforeEach(() => {
    resetLLMMocks();
  });

  test('completes full interaction flow', async () => {
    const initialState = { ...defaultGameState };

    // Trigger action
    const result = await performAction(initialState);

    // Verify LLM was called
    expect(mockLLMFunction).toHaveBeenCalled();

    // Verify state changed
    expect(result.wealth).toBeLessThan(initialState.wealth);
  });
});
```

## Coverage Goals

Current coverage thresholds (will increase over time):
- **Statements**: 30%
- **Branches**: 25%
- **Functions**: 25%
- **Lines**: 30%

Priority areas for coverage:
1. Core game logic (event selection, state management)
2. Critical user flows (interactions, crafting, prescriptions)
3. Error handling and edge cases

## Continuous Integration

**Future setup** (not yet implemented):
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:coverage
```

## Debugging Tests

**Run specific test file**:
```bash
npm test eventSelector.test.js
```

**Run specific test**:
```bash
npm test -- -t "respects max occurrences"
```

**Debug in VS Code**:
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Current File",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["${fileBasename}", "--runInBand"],
  "console": "integratedTerminal"
}
```

## Common Issues

**Issue**: `Cannot find module` errors
**Solution**: Run `npm install` to ensure all test dependencies are installed

**Issue**: Tests fail with `localStorage is not defined`
**Solution**: Jest setup mocks localStorage automatically - check `tests/setup/jest.setup.js`

**Issue**: CSS import errors
**Solution**: CSS is mocked via `identity-obj-proxy` in jest.config.js

**Issue**: Image import errors
**Solution**: Images are mocked via `tests/mocks/fileMock.js`

**Issue**: LLM timeout errors
**Solution**: Use mocked LLM service for integration tests, not real API

## Best Practices

1. **Keep tests fast**: Unit tests should run in milliseconds
2. **Use fixtures**: Don't duplicate test data across files
3. **Test behavior, not implementation**: Test what the user sees, not internal details
4. **Mock external dependencies**: LLM, localStorage, timers
5. **One assertion per test**: Each test should verify one specific behavior
6. **Clear test names**: `test('reduces wealth when buying water')` not `test('works')`
7. **Setup and teardown**: Use `beforeEach()` to reset state
8. **Avoid test interdependence**: Each test should run independently

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: October 18, 2025
**Maintainer**: Development Team
