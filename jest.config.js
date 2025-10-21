/**
 * Jest Configuration for Apothecary Simulator
 * Supports ES6 modules, React components, and mock utilities
 */

module.exports = {
  // Use jsdom environment for DOM testing
  testEnvironment: 'jsdom',

  // Setup files to run after Jest is initialized
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],

  // Module paths
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.test.jsx',
    '**/__tests__/**/*.js',
    '**/__tests__/**/*.jsx'
  ],

  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Module name mapper for CSS and assets
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/mocks/fileMock.js',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/**/*.test.{js,jsx}',
  ],

  // Coverage thresholds (start low, increase over time)
  coverageThresholds: {
    global: {
      statements: 30,
      branches: 25,
      functions: 25,
      lines: 30,
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
  ],

  // Verbose output
  verbose: true,

  // Automatically clear mock calls between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,
};
