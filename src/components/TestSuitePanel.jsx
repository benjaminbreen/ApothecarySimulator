import React, { useState } from 'react';
import { runAllTests } from '../core/testing/gameSystemTests';

/**
 * Test Suite Panel
 * Developer tool for testing game systems
 */
export function TestSuitePanel() {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTests, setExpandedTests] = useState(new Set());

  const runTests = () => {
    setIsRunning(true);
    setTestResults(null);

    // Run tests with slight delay to show loading state
    setTimeout(() => {
      const results = runAllTests();
      setTestResults(results);
      setIsRunning(false);
    }, 100);
  };

  const toggleTestExpanded = (testName) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testName)) {
      newExpanded.delete(testName);
    } else {
      newExpanded.add(testName);
    }
    setExpandedTests(newExpanded);
  };

  const expandAll = () => {
    if (testResults) {
      setExpandedTests(new Set(testResults.results.map(r => r.name)));
    }
  };

  const collapseAll = () => {
    setExpandedTests(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Game Systems Test Suite
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Automated tests for NPC conditions, patient flow, and game mechanics
          </p>
        </div>
        <button
          onClick={runTests}
          disabled={isRunning}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            isRunning
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isRunning ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Running...
            </span>
          ) : (
            '▶ Run All Tests'
          )}
        </button>
      </div>

      {/* Test Results Summary */}
      {testResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Test Results
            </h4>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {testResults.total}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Total Tests
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {testResults.passed}
              </div>
              <div className="text-xs text-green-600 dark:text-green-500 uppercase tracking-wide">
                Passed
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {testResults.failed}
              </div>
              <div className="text-xs text-red-600 dark:text-red-500 uppercase tracking-wide">
                Failed
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {testResults.totalDuration.toFixed(1)}ms
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-500 uppercase tracking-wide">
                Duration
              </div>
            </div>
          </div>

          {/* Individual Test Results */}
          <div className="space-y-2">
            {testResults.results.map((result, index) => {
              const isExpanded = expandedTests.has(result.name);

              return (
                <div
                  key={index}
                  className={`border rounded-lg overflow-hidden ${
                    result.passed
                      ? 'border-green-200 dark:border-green-800'
                      : 'border-red-200 dark:border-red-800'
                  }`}
                >
                  {/* Test Header */}
                  <button
                    onClick={() => toggleTestExpanded(result.name)}
                    className={`w-full px-4 py-3 flex items-center justify-between ${
                      result.passed
                        ? 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20'
                        : 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Status Icon */}
                      <div className={`text-xl ${result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {result.passed ? '✓' : '✗'}
                      </div>

                      {/* Test Name */}
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {result.name}
                        </div>
                        <div className={`text-sm ${
                          result.passed
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-red-700 dark:text-red-400'
                        }`}>
                          {result.message}
                        </div>
                      </div>
                    </div>

                    {/* Duration + Expand Icon */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {result.duration.toFixed(2)}ms
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      {result.expected !== undefined && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Expected
                          </div>
                          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-sm text-gray-900 dark:text-gray-100 overflow-x-auto">
                            {typeof result.expected === 'object'
                              ? JSON.stringify(result.expected, null, 2)
                              : String(result.expected)}
                          </pre>
                        </div>
                      )}

                      {result.actual !== undefined && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Actual
                          </div>
                          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-sm text-gray-900 dark:text-gray-100 overflow-x-auto">
                            {typeof result.actual === 'object'
                              ? JSON.stringify(result.actual, null, 2)
                              : String(result.actual)}
                          </pre>
                        </div>
                      )}

                      {result.error && (
                        <div>
                          <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                            Error Stack
                          </div>
                          <pre className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-900 dark:text-red-100 overflow-x-auto">
                            {result.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!testResults && !isRunning && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            No tests run yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Click "Run All Tests" to verify game systems are working correctly
          </p>
        </div>
      )}
    </div>
  );
}

export default TestSuitePanel;
