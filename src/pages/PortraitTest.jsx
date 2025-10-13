/**
 * Portrait System Test Page - Enhanced Version
 *
 * Tests the unified portrait resolution system with:
 * - Randomized demographic combinations
 * - Gap analysis for missing portraits
 * - Match quality assessment
 * - Setting-agnostic architecture planning
 */

import React, { useState, useEffect } from 'react';
import { resolvePortrait, clearPortraitCache } from '../core/services/portraitResolver';
import { PORTRAIT_LIBRARY } from '../core/services/portraitLibrary';

// Demographic dimensions (1680s Mexico City)
const DEMOGRAPHICS = {
  genders: ['male', 'female'],
  ages: ['child', 'young', 'adult', 'middle-aged', 'elderly'],
  castas: ['español', 'criollo', 'mestizo', 'indio', 'africano', 'mulato'],
  classes: ['elite', 'middling', 'common', 'poor', 'religious', 'enslaved'],
  occupations: {
    male: ['merchant', 'priest', 'soldier', 'scholar', 'laborer', 'official', 'physician', 'farmer', 'sailor', 'servant'],
    female: ['midwife', 'servant', 'nun', 'weaver', 'merchant', 'noblewoman', 'peasant', 'healer']
  }
};

// Named NPCs (always included in tests)
const NAMED_NPCS = [
  {
    name: 'Antonius Philalethes',
    entityType: 'npc',
    appearance: { gender: 'male', age: 'middle-aged' },
    social: { casta: 'europeo', class: 'elite', occupation: 'alchemist' }
  },
  {
    name: 'Ana de Soto',
    entityType: 'npc',
    appearance: { gender: 'female', age: 'adult' },
    social: { casta: 'española', class: 'middling', occupation: 'midwife' }
  }
];

/**
 * Generate random demographic entity
 */
function generateRandomEntity() {
  const gender = DEMOGRAPHICS.genders[Math.floor(Math.random() * DEMOGRAPHICS.genders.length)];
  const age = DEMOGRAPHICS.ages[Math.floor(Math.random() * DEMOGRAPHICS.ages.length)];
  const casta = DEMOGRAPHICS.castas[Math.floor(Math.random() * DEMOGRAPHICS.castas.length)];
  const classValue = DEMOGRAPHICS.classes[Math.floor(Math.random() * DEMOGRAPHICS.classes.length)];

  const occupations = DEMOGRAPHICS.occupations[gender] || DEMOGRAPHICS.occupations.male;
  const occupation = occupations[Math.floor(Math.random() * occupations.length)];

  // Generate descriptive name
  const ageDescriptor = age === 'adult' ? '' : `${age} `;
  const castaDescriptor = casta === 'mestizo' ? '' : `${casta} `;
  const name = `a ${ageDescriptor}${castaDescriptor}${gender} ${occupation}`.replace(/\s+/g, ' ').trim();

  return {
    name,
    entityType: 'npc',
    appearance: { gender, age },
    social: { casta, class: classValue, occupation }
  };
}

/**
 * Generate test entity set (2 named + 18 random)
 */
function generateTestEntities(count = 18) {
  const random = Array.from({ length: count }, generateRandomEntity);
  return [...NAMED_NPCS, ...random];
}

function PortraitTest() {
  const [testResults, setTestResults] = useState([]);
  const [consoleOutput, setConsoleOutput] = useState([]);

  // Capture console logs
  useEffect(() => {
    const originalLog = console.log;
    const logs = [];

    console.log = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      if (message.includes('[Portrait')) {
        logs.push(message);
        setConsoleOutput([...logs]);
      }

      originalLog.apply(console, args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [statistics, setStatistics] = useState(null);

  /**
   * Analyze portrait library gaps
   */
  const analyzeGaps = (results) => {
    // Track which demographic combinations were tested
    const testedCombos = new Map();
    const problematicMatches = [];

    results.forEach(result => {
      const { entity, portraitPath } = result;
      const key = `${entity.appearance.gender}-${entity.appearance.age}-${entity.social.casta}`;

      // Track match quality
      const filename = portraitPath?.split('/').pop();
      const portraitMeta = PORTRAIT_LIBRARY[filename];

      // Check if match is appropriate
      let isGoodMatch = true;
      let issues = [];

      if (portraitMeta) {
        // Gender mismatch
        if (portraitMeta.gender !== entity.appearance.gender &&
            portraitMeta.gender !== 'unknown' &&
            portraitMeta.gender !== 'group' &&
            entity.appearance.gender !== 'unknown') {
          isGoodMatch = false;
          issues.push(`Gender mismatch: wanted ${entity.appearance.gender}, got ${portraitMeta.gender}`);
        }

        // Age mismatch (severe)
        if (portraitMeta.age !== entity.appearance.age &&
            portraitMeta.age !== 'mixed' &&
            !['adult', 'middle-aged'].includes(entity.appearance.age) && // Adult/middle-aged can be flexible
            !['adult', 'middle-aged'].includes(portraitMeta.age)) {
          isGoodMatch = false;
          issues.push(`Age mismatch: wanted ${entity.appearance.age}, got ${portraitMeta.age}`);
        }
      }

      if (!isGoodMatch) {
        problematicMatches.push({
          entity,
          portraitPath,
          issues
        });
      }

      if (!testedCombos.has(key)) {
        testedCombos.set(key, []);
      }
      testedCombos.get(key).push({ entity, portraitPath, isGoodMatch });
    });

    // Identify missing combinations (high priority)
    const missingCombos = [];

    // Priority combinations to check
    const priorityCombos = [
      { gender: 'female', age: 'young', casta: 'indio', priority: 'HIGH' },
      { gender: 'female', age: 'young', casta: 'africano', priority: 'HIGH' },
      { gender: 'female', age: 'adult', casta: 'africano', priority: 'HIGH' },
      { gender: 'female', age: 'adult', casta: 'mulato', priority: 'HIGH' },
      { gender: 'female', age: 'young', casta: 'mulato', priority: 'HIGH' },
      { gender: 'female', age: 'young', casta: 'español', priority: 'MEDIUM' },
      { gender: 'female', age: 'young', casta: 'criollo', priority: 'MEDIUM' },
      { gender: 'male', age: 'young', casta: 'africano', priority: 'MEDIUM' },
      { gender: 'male', age: 'young', casta: 'indio', priority: 'MEDIUM' },
    ];

    priorityCombos.forEach(combo => {
      const key = `${combo.gender}-${combo.age}-${combo.casta}`;
      const tested = testedCombos.get(key);

      // Check if we have good portraits for this combo
      const hasGoodPortrait = tested?.some(t => t.isGoodMatch) || false;

      if (!hasGoodPortrait) {
        missingCombos.push({
          ...combo,
          tested: !!tested,
          description: `${combo.age} ${combo.casta} ${combo.gender}`
        });
      }
    });

    return {
      problematicMatches,
      missingCombos,
      totalTested: results.length,
      uniqueCombos: testedCombos.size
    };
  };

  const runTests = () => {
    console.log('=== PORTRAIT SYSTEM TEST START ===');
    const capturedLogs = [];

    // Capture console logs during test run
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      capturedLogs.push(message);
      originalLog.apply(console, args);
    };

    // Generate fresh random entities
    const testEntities = generateTestEntities(18);

    const results = testEntities.map(entity => {
      // Clear cache to force fresh resolution
      clearPortraitCache(entity);

      console.log(`\n--- Testing: ${entity.name} ---`);

      // Resolve portrait
      const portraitPath = resolvePortrait(entity);

      // Extract score from most recent logs
      const relevantLogs = capturedLogs.filter(log =>
        log.includes(entity.name) && log.includes('Selected:') && log.includes('score:')
      );
      let matchScore = null;
      if (relevantLogs.length > 0) {
        const match = relevantLogs[relevantLogs.length - 1].match(/score:\s*(\d+)/);
        matchScore = match ? parseInt(match[1]) : null;
      }

      // Test caching (second call should use cache)
      const cachedPath = resolvePortrait(entity);
      const isCached = entity._portraitPath === cachedPath;

      return {
        entity,
        portraitPath,
        isCached,
        matchScore,
        timestamp: Date.now()
      };
    });

    console.log('=== PORTRAIT SYSTEM TEST END ===');

    // Restore original console.log
    console.log = originalLog;

    setTestResults(results);

    // Calculate statistics
    const scores = results.map(r => r.matchScore).filter(s => s !== null);
    const stats = {
      avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      minScore: scores.length > 0 ? Math.min(...scores) : 0,
      maxScore: scores.length > 0 ? Math.max(...scores) : 0,
      goodMatches: scores.filter(s => s >= 80).length,
      okMatches: scores.filter(s => s >= 30 && s < 80).length,
      poorMatches: scores.filter(s => s < 30).length
    };
    setStatistics(stats);

    // Perform gap analysis
    const gaps = analyzeGaps(results);
    setGapAnalysis(gaps);
  };

  // Run tests on mount
  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment-100 to-parchment-200 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-ink-900 mb-4">
            Portrait System Test - Enhanced
          </h1>
          <p className="text-ink-600 mb-4">
            Testing the unified portrait resolution system with randomized demographics.
            Each test run generates different entity combinations to identify gaps.
          </p>
          <button
            onClick={runTests}
            className="bg-botanical-600 hover:bg-botanical-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            🎲 Generate New Random Tests
          </button>
        </div>

        {/* Statistics Panel */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-ink-900 mb-3">Match Quality</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">Good (80+):</span>
                  <span className="text-green-600 font-bold text-xl">{statistics.goodMatches}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">OK (30-79):</span>
                  <span className="text-yellow-600 font-bold text-xl">{statistics.okMatches}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">Poor (&lt;30):</span>
                  <span className="text-red-600 font-bold text-xl">{statistics.poorMatches}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-ink-900 mb-3">Score Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">Average:</span>
                  <span className="text-ink-900 font-bold text-xl">{statistics.avgScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">Min:</span>
                  <span className="text-ink-900 font-bold text-xl">{statistics.minScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">Max:</span>
                  <span className="text-ink-900 font-bold text-xl">{statistics.maxScore}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-ink-900 mb-3">Coverage</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">Total Tests:</span>
                  <span className="text-ink-900 font-bold text-xl">{testResults.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">Library Size:</span>
                  <span className="text-ink-900 font-bold text-xl">{Object.keys(PORTRAIT_LIBRARY).length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gap Analysis Panel */}
        {gapAnalysis && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-ink-900 mb-4">
              📊 Gap Analysis
            </h2>

            {/* Missing Portraits */}
            {gapAnalysis.missingCombos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-ink-900 mb-3">
                  🎨 Missing Portrait Recommendations
                </h3>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-red-700 font-semibold mb-2">
                    These demographic combinations lack appropriate portraits:
                  </p>
                  <ul className="space-y-2">
                    {gapAnalysis.missingCombos.map((combo, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span className="text-ink-700">
                          <strong>{combo.description}</strong>
                          {combo.tested && ' (tested, poor match)'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          combo.priority === 'HIGH' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-ink-900'
                        }`}>
                          {combo.priority}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Problematic Matches */}
            {gapAnalysis.problematicMatches.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-ink-900 mb-3">
                  ⚠️ Problematic Matches in This Run
                </h3>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <ul className="space-y-2">
                    {gapAnalysis.problematicMatches.slice(0, 5).map((match, i) => (
                      <li key={i} className="text-sm">
                        <strong className="text-ink-900">{match.entity.name}</strong>
                        <ul className="ml-4 mt-1 text-ink-600">
                          {match.issues.map((issue, j) => (
                            <li key={j}>• {issue}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                  {gapAnalysis.problematicMatches.length > 5 && (
                    <p className="text-ink-500 text-sm mt-2">
                      ...and {gapAnalysis.problematicMatches.length - 5} more issues
                    </p>
                  )}
                </div>
              </div>
            )}

            {gapAnalysis.missingCombos.length === 0 && gapAnalysis.problematicMatches.length === 0 && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <p className="text-green-700 font-semibold">
                  ✓ All tested demographics have appropriate portrait matches!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Test Results Grid */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-ink-900 mb-4">
            Test Results ({testResults.length} entities)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {testResults.map((result, index) => (
              <TestResultCard key={index} result={result} />
            ))}
          </div>
        </div>

        {/* Console Output */}
        <div className="bg-ink-900 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-parchment-100 mb-4">
            Console Output
          </h2>
          <div className="bg-ink-800 rounded p-4 font-mono text-sm text-parchment-200 max-h-96 overflow-y-auto">
            {consoleOutput.length === 0 ? (
              <p className="text-ink-500">Run tests to see console output...</p>
            ) : (
              consoleOutput.map((log, i) => (
                <div key={i} className="mb-1 whitespace-pre-wrap break-words">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Architecture Recommendations */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4">
            🏗️ Architecture Recommendations for Setting-Agnostic Design
          </h2>
          <div className="space-y-4 text-ink-700">
            <div>
              <h3 className="font-bold text-lg text-indigo-800 mb-2">1. Abstract Demographic System</h3>
              <p className="mb-2">Replace setting-specific terms with universal categories:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Casta</strong> (1680s Mexico) → <strong>Ethnicity</strong> (universal)</li>
                <li>Add <strong>setting</strong> field: "1680s-mexico", "1940s-nyc", "1880s-london"</li>
                <li>Map setting-specific values to universal categories in portrait resolver</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg text-indigo-800 mb-2">2. Portrait Library Structure</h3>
              <p className="mb-2">Organize portraits by setting:</p>
              <pre className="bg-indigo-900 text-indigo-100 p-3 rounded text-xs overflow-x-auto">
{`PORTRAIT_LIBRARY = {
  '1680s-mexico': {
    'merchantman.jpg': { gender: 'male', age: 'adult', ethnicity: 'mestizo', ... }
  },
  '1940s-nyc': {
    'immigrant.jpg': { gender: 'male', age: 'adult', ethnicity: 'jewish', ... }
  },
  shared: {
    'defaultnpc.jpg': { gender: 'unknown', ... }
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-bold text-lg text-indigo-800 mb-2">3. Setting-Aware Resolution</h3>
              <p>Update <code>resolvePortrait(entity, setting)</code> to:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>First try setting-specific portraits</li>
                <li>Fallback to shared portraits</li>
                <li>Normalize ethnicity terms per setting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestResultCard({ result }) {
  const { entity, portraitPath, isCached, matchScore } = result;
  const [imageError, setImageError] = useState(false);

  // Determine quality badge
  let qualityBadge = null;
  if (matchScore !== null) {
    if (matchScore >= 80) {
      qualityBadge = { text: 'GOOD', bg: 'bg-green-500', score: matchScore };
    } else if (matchScore >= 30) {
      qualityBadge = { text: 'OK', bg: 'bg-yellow-500', score: matchScore };
    } else {
      qualityBadge = { text: 'POOR', bg: 'bg-red-500', score: matchScore };
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Portrait Display */}
      <div className="relative h-48 bg-gradient-to-br from-parchment-100 to-parchment-200 flex items-center justify-center">
        {portraitPath && !imageError ? (
          <img
            src={portraitPath}
            alt={entity.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-center p-4">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-ink-500 text-xs">Portrait not found</p>
          </div>
        )}

        {/* Quality badge (top-left) */}
        {qualityBadge && (
          <div className={`absolute top-2 left-2 ${qualityBadge.bg} text-white px-2 py-1 rounded text-xs font-bold`}>
            {qualityBadge.text} ({qualityBadge.score})
          </div>
        )}

        {/* Cache indicator (top-right) */}
        {isCached && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
            CACHED
          </div>
        )}
      </div>

      {/* Entity Info */}
      <div className="p-3">
        <h3 className="font-bold text-sm text-ink-900 mb-2 truncate" title={entity.name}>
          {entity.name}
        </h3>

        {/* Demographics */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-ink-500">Gender:</span>
            <span className="text-ink-900 font-semibold">{entity.appearance?.gender || 'unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">Age:</span>
            <span className="text-ink-900 font-semibold">{entity.appearance?.age || 'unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">Casta:</span>
            <span className="text-ink-900 font-semibold">{entity.social?.casta || 'unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">Class:</span>
            <span className="text-ink-900 font-semibold">{entity.social?.class || 'unknown'}</span>
          </div>
        </div>

        {/* Portrait Path */}
        <div className="mt-2 pt-2 border-t border-ink-200">
          <p className="text-xs text-ink-500 break-all truncate" title={portraitPath}>
            {portraitPath?.split('/').pop() || 'No portrait'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PortraitTest;
