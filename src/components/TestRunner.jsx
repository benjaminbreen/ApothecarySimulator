// TestRunner.jsx
// UI component for running Phase 2 portrait system tests

import React, { useState, useRef, useEffect } from 'react';
import { runAllTests, TEST_SCENARIOS } from '../tests/phase2Tests';

const TestRunner = ({ gameState }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [currentTest, setCurrentTest] = useState(null);
  const [logs, setLogs] = useState([]);
  const [expandedTests, setExpandedTests] = useState({});
  const logContainerRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults(null);
    setLogs([]);
    setCurrentTest(null);
    setExpandedTests({});

    // Custom log callback to capture output
    const logCallback = (message) => {
      setLogs(prev => [...prev, {
        timestamp: Date.now(),
        message
      }]);

      // Extract current test name from logs
      if (message.includes('🧪 Running:')) {
        const testName = message.replace('🧪 Running:', '').trim();
        setCurrentTest(testName);
      }
    };

    try {
      const testResults = await runAllTests(gameState, logCallback);
      setResults(testResults);
      setCurrentTest(null);
    } catch (error) {
      logCallback(`\n💥 FATAL ERROR: ${error.message}`);
      console.error('Test runner error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleTestExpand = (scenarioId) => {
    setExpandedTests(prev => ({
      ...prev,
      [scenarioId]: !prev[scenarioId]
    }));
  };

  return (
    <div className="test-runner p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          🧪 Phase 2 Test Suite
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Automated tests for portrait system, NPC identity consistency, and edge cases.
          <br />
          <strong>Note:</strong> These tests call the actual LLM and may take 2-3 minutes.
        </p>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
            isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isRunning ? '🔄 Running Tests...' : '▶️ Run All Tests'}
        </button>

        {currentTest && (
          <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
            <strong>Currently testing:</strong> {currentTest}
          </div>
        )}
      </div>

      {/* Test Scenarios Info */}
      {!isRunning && !results && (
        <div className="mb-4 p-3 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Test Scenarios ({TEST_SCENARIOS.length}):
          </h4>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            {TEST_SCENARIOS.map((scenario, idx) => (
              <li key={scenario.id} className="flex items-start">
                <span className="mr-2 text-gray-500">{idx + 1}.</span>
                <div>
                  <strong>{scenario.name}</strong>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {scenario.description} ({scenario.turns.length} turns, {scenario.checks.length} checks)
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Results Summary */}
      {results && (
        <div className="mb-4 p-4 bg-white dark:bg-slate-700 rounded-lg border-2 border-gray-200 dark:border-slate-600">
          <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">
            Test Results
          </h4>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-gray-100 dark:bg-slate-800 rounded">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {results.totalTests}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Tests</div>
            </div>
            <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {results.passed}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">Passed</div>
            </div>
            <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded">
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {results.failed}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">Failed</div>
            </div>
          </div>

          {/* Individual Test Results */}
          <div className="space-y-2">
            {results.scenarios.map((scenario) => (
              <div
                key={scenario.scenarioId}
                className={`border-2 rounded-lg overflow-hidden ${
                  scenario.passed
                    ? 'border-green-300 dark:border-green-700'
                    : 'border-red-300 dark:border-red-700'
                }`}
              >
                {/* Test Header */}
                <button
                  onClick={() => toggleTestExpand(scenario.scenarioId)}
                  className="w-full p-3 flex items-center justify-between bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {scenario.passed ? '✅' : '❌'}
                    </span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {scenario.scenarioName}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {scenario.checks.filter(c => c.passed).length}/{scenario.checks.length} checks passed
                      </div>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedTests[scenario.scenarioId] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded Details */}
                {expandedTests[scenario.scenarioId] && (
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
                    {/* Turns */}
                    <div className="mb-4">
                      <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Turns Executed:
                      </h5>
                      <div className="space-y-2">
                        {scenario.turns.map((turn, idx) => (
                          <div key={idx} className="text-xs bg-white dark:bg-slate-800 p-2 rounded">
                            <div className="font-mono text-blue-600 dark:text-blue-400">
                              Turn {turn.turnNumber}: "{turn.action}"
                            </div>
                            {turn.npcName && (
                              <div className="text-gray-700 dark:text-gray-300 mt-1">
                                NPC: {turn.npcName} ({turn.portraitFile || 'no portrait'})
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checks */}
                    <div className="mb-4">
                      <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Checks:
                      </h5>
                      <div className="space-y-1">
                        {scenario.checks.map((check, idx) => (
                          <div
                            key={idx}
                            className={`text-xs p-2 rounded flex items-start gap-2 ${
                              check.passed
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                            }`}
                          >
                            <span className="flex-shrink-0">
                              {check.passed ? '✓' : '✗'}
                            </span>
                            <div className="flex-1">
                              <div className="font-semibold">{check.description}</div>
                              <div className="text-xs opacity-75 mt-0.5">{check.reason}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Warnings */}
                    {scenario.warnings && scenario.warnings.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-sm text-amber-700 dark:text-amber-400 mb-2">
                          ⚠️ Warnings ({scenario.warnings.length}):
                        </h5>
                        <div className="space-y-1">
                          {scenario.warnings.map((warning, idx) => (
                            <div
                              key={idx}
                              className="text-xs p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded font-mono"
                            >
                              {warning}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Errors */}
                    {scenario.errors && scenario.errors.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-semibold text-sm text-red-700 dark:text-red-400 mb-2">
                          💥 Errors:
                        </h5>
                        <div className="space-y-1">
                          {scenario.errors.map((error, idx) => (
                            <div
                              key={idx}
                              className="text-xs p-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded font-mono"
                            >
                              {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Logs */}
      {logs.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">
            Test Logs:
          </h4>
          <div
            ref={logContainerRef}
            className="bg-black text-green-400 p-3 rounded font-mono text-xs h-64 overflow-y-auto"
          >
            {logs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap">
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunner;
