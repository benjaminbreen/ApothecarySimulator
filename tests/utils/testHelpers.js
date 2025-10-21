/**
 * Test Helper Utilities
 * Common functions for writing cleaner tests
 */

import { render } from '@testing-library/react';

/**
 * Custom render function that wraps components with common providers
 * Use this instead of @testing-library/react's render for components that need context
 */
export function renderWithProviders(ui, options = {}) {
  const {
    initialState = {},
    ...renderOptions
  } = options;

  // Add providers here as needed (Router, Context, etc.)
  function Wrapper({ children }) {
    return children;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Wait for async operations to complete
 * Useful for LLM calls and state updates
 */
export function waitForAsync(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock event object
 * Useful for testing event handlers
 */
export function createMockEvent(overrides = {}) {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: { value: '' },
    ...overrides
  };
}

/**
 * Simulate conversation history
 * Returns mock conversation history for testing narrative flows
 */
export function createMockConversationHistory(length = 5) {
  const history = [];

  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) {
      history.push({
        role: 'user',
        content: `Test action ${i + 1}`
      });
    } else {
      history.push({
        role: 'assistant',
        content: `Test response ${i + 1}`
      });
    }
  }

  return history;
}

/**
 * Assert game state changes
 * Helper to verify state mutations
 */
export function expectGameStateChange(before, after, expectedChanges) {
  Object.entries(expectedChanges).forEach(([key, expectedValue]) => {
    if (typeof expectedValue === 'number') {
      expect(after[key]).toBe(before[key] + expectedValue);
    } else {
      expect(after[key]).toEqual(expectedValue);
    }
  });
}

/**
 * Mock component props
 * Generate default props for components
 */
export function createMockProps(overrides = {}) {
  return {
    isDarkMode: false,
    gameState: {},
    onAction: jest.fn(),
    ...overrides
  };
}

/**
 * Verify reputation change
 * Check that reputation changed by expected amount
 */
export function expectReputationChange(before, after, faction, expectedChange) {
  expect(after[faction]).toBe((before[faction] || 0) + expectedChange);
}

/**
 * Verify inventory change
 * Check that item quantity changed correctly
 */
export function expectInventoryChange(before, after, itemName, expectedChange) {
  const beforeItem = before.find(i => i.name === itemName);
  const afterItem = after.find(i => i.name === itemName);

  const beforeQty = beforeItem?.quantity || 0;
  const afterQty = afterItem?.quantity || 0;

  expect(afterQty).toBe(beforeQty + expectedChange);
}

/**
 * Get console error calls
 * Useful for verifying error logging
 */
export function getConsoleErrors() {
  return console.error.mock.calls;
}

/**
 * Get console warning calls
 * Useful for verifying warning logging
 */
export function getConsoleWarnings() {
  return console.warn.mock.calls;
}

/**
 * Clear console mocks
 * Reset console.log, console.error, etc.
 */
export function clearConsoleMocks() {
  console.log.mockClear();
  console.error.mockClear();
  console.warn.mockClear();
  console.debug.mockClear();
  console.info.mockClear();
}
