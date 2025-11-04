// ConsequenceTestPanel.jsx
// UI component for running consequence system tests

import React, { useState, useRef, useEffect } from 'react';
import { runAllTests, TEST_SCENARIOS } from '../tests/consequenceSystemTests';

const ConsequenceTestPanel = ({ gameState, handlers }) => {
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
      const testResults = await runAllTests(gameState, handlers, logCallback);
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
          🧪 Consequence System Test Suite
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Automated tests for the extortion/gambling/consequence flow. Tests:
          <br />
          • Extortion refusal → consequence scheduling
          <br />
          • Consequences trigger at correct turns
          <br />
          • Mechanical effects (wealth, health, inventory)
          <br />
          • NPC memory and history tracking
          <br />
          • Multiple refusals escalate severity
          <br />
          <strong className="text-yellow-600 dark:text-yellow-400">Note:</strong> Uses real LLM calls, may take 2-3 minutes.
        </p>

        <button
          onClick={handleRunTests}
          disabled={isRunning || !handlers}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
            isRunning || !handlers
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isRunning ? '🔄 Running Tests...' : '▶️ Run All Tests'}
        </button>

        {!handlers && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            ⚠️ Handlers not provided. Tests cannot run without updateWealth, updateHealth, etc.
          </div>
        )}

        {currentTest && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm">
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
            {TEST_SCENARIOS.map(scenario => (
              <li key={scenario.id} className="flex items-start">
                <span className="mr-2">•</span>
                <div>
                  <strong>{scenario.name}</strong>: {scenario.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Live Logs */}
      {isRunning && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Live Test Log:
          </h4>
          <div
            ref={logContainerRef}
            className="bg-black text-green-400 font-mono text-xs p-3 rounded h-96 overflow-y-auto"
          >
            {logs.map((log, idx) => (
              <div key={idx} className="mb-1">
                {log.message}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500">Starting tests...</div>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results && (
        <div className="mb-4">
          <div className="p-4 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600">
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">
              Test Results Summary
            </h4>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-100 dark:bg-slate-600 rounded">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {results.totalTests}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Tests</div>
              </div>
              <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded">
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {results.passed}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Passed</div>
              </div>
              <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded">
                <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                  {results.failed}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
              </div>
            </div>

            {/* Individual Test Results */}
            <div className="space-y-2">
              {results.scenarios.map(scenario => (
                <div
                  key={scenario.scenarioId}
                  className={`border rounded p-3 ${
                    scenario.passed
                      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleTestExpand(scenario.scenarioId)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">
                        {scenario.passed ? '✅' : '❌'}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {scenario.scenarioName}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {scenario.checks.filter(c => c.passed).length}/{scenario.checks.length} checks passed
                      <span className="ml-2">
                        {expandedTests[scenario.scenarioId] ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTests[scenario.scenarioId] && (
                    <div className="mt-3 space-y-2">
                      {/* Turns */}
                      <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                        <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Turns Executed:
                        </div>
                        {scenario.turns.map(turn => (
                          <div key={turn.turnNumber} className="text-xs text-gray-600 dark:text-gray-400 ml-3">
                            Turn {turn.turnNumber}: {turn.action}
                            {turn.hasSimpleInteraction && (
                              <span className="ml-2 text-purple-600 dark:text-purple-400">
                                [{turn.interactionType}]
                              </span>
                            )}
                            <span className="ml-2 text-gray-500">
                              ({turn.pendingConsequencesCount} pending)
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Interaction Results */}
                      {scenario.interactionResults && scenario.interactionResults.length > 0 && (
                        <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                          <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                            Interactions:
                          </div>
                          {scenario.interactionResults.map((ir, idx) => (
                            <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 ml-3">
                              Turn {ir.turn}: {ir.type} with {ir.npcName} → {ir.choice}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Checks */}
                      <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                        <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Checks:
                        </div>
                        {scenario.checks.map((check, idx) => (
                          <div
                            key={idx}
                            className={`text-xs ml-3 ${
                              check.passed
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-red-700 dark:text-red-300'
                            }`}
                          >
                            {check.passed ? '✓' : '✗'} {check.description}: {check.reason}
                          </div>
                        ))}
                      </div>

                      {/* Errors */}
                      {scenario.errors.length > 0 && (
                        <div className="border-t border-red-300 dark:border-red-600 pt-2">
                          <div className="font-semibold text-sm text-red-700 dark:text-red-300 mb-1">
                            Errors:
                          </div>
                          {scenario.errors.map((error, idx) => (
                            <div key={idx} className="text-xs text-red-600 dark:text-red-400 ml-3">
                              {error}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Warnings */}
                      {scenario.warnings.length > 0 && (
                        <div className="border-t border-yellow-300 dark:border-yellow-600 pt-2">
                          <div className="font-semibold text-sm text-yellow-700 dark:text-yellow-300 mb-1">
                            Warnings:
                          </div>
                          {scenario.warnings.map((warning, idx) => (
                            <div key={idx} className="text-xs text-yellow-600 dark:text-yellow-400 ml-3">
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Log (after tests complete) */}
      {results && logs.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Full Test Log:
          </h4>
          <div
            className="bg-black text-green-400 font-mono text-xs p-3 rounded max-h-96 overflow-y-auto"
          >
            {logs.map((log, idx) => (
              <div key={idx} className="mb-1">
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsequenceTestPanel;
