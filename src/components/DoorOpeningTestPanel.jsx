// DoorOpeningTestPanel.jsx
// UI component for running comprehensive door opening gameplay tests

import React, { useState, useRef, useEffect } from 'react';
import { runAllTests, TEST_SCENARIOS } from '../tests/doorOpeningTests';

const DoorOpeningTestPanel = ({ gameState }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [currentTest, setCurrentTest] = useState(null);
  const [logs, setLogs] = useState([]);
  const [expandedTests, setExpandedTests] = useState({});
  const [showInsights, setShowInsights] = useState(true);
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      default: return 'blue';
    }
  };

  return (
    <div className="test-runner p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          🚪 Door Opening Test Suite
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Comprehensive gameplay tests for portrait selection, entity management, and StateAgent interpretation.
          Each scenario starts with "open the door to see who is there" and explores realistic gameplay flows.
          <br />
          <strong className="text-red-600 dark:text-red-400">⚠️ Note:</strong> These tests make 10+ real LLM calls and will take 3-5 minutes to complete.
        </p>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
            isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRunning ? '🔄 Running Tests...' : '▶️ Run All 10 Scenarios'}
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
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            {TEST_SCENARIOS.map((scenario, idx) => (
              <li key={scenario.id} className="flex items-start">
                <span className="mr-2 text-gray-500 font-mono">{idx + 1}.</span>
                <div>
                  <strong>{scenario.name}</strong>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {scenario.description}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {scenario.turns.length} turns • {scenario.checks.length} checks
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Results Summary */}
      {results && (
        <>
          <div className="mb-4 p-4 bg-white dark:bg-slate-700 rounded-lg border-2 border-gray-200 dark:border-slate-600">
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">
              Test Results Summary
            </h4>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-100 dark:bg-slate-800 rounded">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {results.scenarios.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Scenarios</div>
              </div>
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {results.totalTests}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Total Checks</div>
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

            {/* Global Insights */}
            {results.globalInsights && results.globalInsights.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                    📊 Actionable Insights ({results.globalInsights.length})
                  </h5>
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showInsights ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showInsights && (
                  <div className="space-y-2">
                    {results.globalInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded border-l-4 ${
                          insight.severity === 'critical'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                            : insight.severity === 'high'
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                            : insight.severity === 'medium'
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">
                            {insight.severity === 'critical'
                              ? '🔴'
                              : insight.severity === 'high'
                              ? '🟠'
                              : insight.severity === 'medium'
                              ? '🟡'
                              : 'ℹ️'}
                          </span>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {insight.scenario} • {insight.type.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                              {insight.recommendation || insight.message}
                            </div>
                            {insight.changes && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono">
                                Changes: {insight.changes.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Individual Test Results */}
          <div className="space-y-2 mb-4">
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
                        {scenario.insights.length > 0 && ` • ${scenario.insights.length} insights`}
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
                          <div key={idx} className="text-xs bg-white dark:bg-slate-800 p-3 rounded">
                            <div className="font-mono text-blue-600 dark:text-blue-400 mb-1">
                              Turn {turn.turnNumber}: "{turn.action}"
                            </div>
                            {turn.npcName && (
                              <div className="space-y-1 text-gray-700 dark:text-gray-300">
                                <div><strong>NPC:</strong> {turn.npcName} ({turn.portraitFile || 'no portrait'})</div>
                                {turn.npcAge && <div><strong>Demographics:</strong> {turn.npcAge}, {turn.npcGender}, {turn.npcClass}, {turn.npcCasta}</div>}
                                {turn.npcOccupation && <div><strong>Occupation:</strong> {turn.npcOccupation}</div>}
                                {turn.contractOffer && <div className="text-green-600 dark:text-green-400">✓ Contract offer detected</div>}
                                {turn.simpleInteraction && <div className="text-purple-600 dark:text-purple-400">✓ Simple interaction: {turn.simpleInteraction.type}</div>}
                              </div>
                            )}
                            <div className="text-gray-500 dark:text-gray-400 mt-2 italic truncate">
                              {turn.narrative}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checks */}
                    <div className="mb-4">
                      <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Validation Checks:
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
                            <span className="flex-shrink-0 text-base">
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

                    {/* Scenario-Specific Insights */}
                    {scenario.insights && scenario.insights.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                          💡 Insights for this scenario:
                        </h5>
                        <div className="space-y-2">
                          {scenario.insights.map((insight, idx) => (
                            <div
                              key={idx}
                              className={`text-xs p-2 rounded ${
                                insight.severity === 'critical'
                                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                  : insight.severity === 'high'
                                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300'
                                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300'
                              }`}
                            >
                              <div className="font-semibold">{insight.type.replace(/_/g, ' ')}</div>
                              <div className="mt-1">{insight.recommendation || insight.message}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {scenario.warnings && scenario.warnings.length > 0 && (
                      <div className="mb-4">
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
                      <div>
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
        </>
      )}

      {/* Live Logs */}
      {logs.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">
            Test Logs:
          </h4>
          <div
            ref={logContainerRef}
            className="bg-black text-cyan-400 p-3 rounded font-mono text-xs h-64 overflow-y-auto"
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

export default DoorOpeningTestPanel;
