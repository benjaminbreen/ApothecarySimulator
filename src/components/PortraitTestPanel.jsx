/**
 * Portrait Test Panel - Automated testing for portrait selection logic
 * Tests the priority system: physically present NPCs > topical NPCs > default
 */

import React, { useState } from 'react';
import { resolvePortrait } from '../core/services/portraitResolver';

// Random demographic generators
const GENDERS = ['male', 'female'];
const AGES = ['young', 'adult', 'middleaged', 'elderly'];
const CASTAS = ['español', 'criollo', 'mestizo', 'indio', 'africano', 'mulato'];
const CLASSES = ['elite', 'middling', 'common', 'poor', 'enslaved', 'religious'];
const OCCUPATIONS = {
  elite: ['nobleman', 'noblewoman', 'merchant', 'physician', 'lawyer', 'official'],
  middling: ['merchant', 'artisan', 'shopkeeper', 'clerk', 'teacher', 'midwife'],
  common: ['servant', 'laborer', 'farmer', 'weaver', 'carpenter', 'apprentice'],
  poor: ['beggar', 'peddler', 'day laborer', 'street vendor'],
  enslaved: ['enslaved', 'servant'],
  religious: ['priest', 'nun', 'friar', 'monk']
};

const MALE_NAMES = ['Juan', 'Pedro', 'Diego', 'Francisco', 'Antonio', 'Miguel', 'José', 'Manuel', 'Carlos', 'Fernando', 'Sebastián', 'Vicente'];
const FEMALE_NAMES = ['María', 'Ana', 'Isabel', 'Catalina', 'Juana', 'Teresa', 'Francisca', 'Beatriz', 'Inés', 'Rosa', 'Antonia', 'Luisa'];
const SURNAMES = ['García', 'Martínez', 'López', 'Rodríguez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'de Soto', 'de la Cruz', 'Hernández', 'Jiménez'];

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomName(gender) {
  const firstName = gender === 'male' ? randomChoice(MALE_NAMES) : randomChoice(FEMALE_NAMES);
  const surname = randomChoice(SURNAMES);
  return `${firstName} ${surname}`;
}

function generateRandomEntity(tier, entityType = 'npc') {
  const gender = randomChoice(GENDERS);
  const age = randomChoice(AGES);
  const casta = randomChoice(CASTAS);
  const socialClass = randomChoice(CLASSES);
  const occupation = randomChoice(OCCUPATIONS[socialClass] || OCCUPATIONS.common);

  return {
    name: generateRandomName(gender),
    entityType,
    tier,
    appearance: { gender, age },
    social: { casta, class: socialClass },
    occupation
  };
}

// Test scenario templates (demographics randomized on each run)
function generateTestScenarios() {
  const patient = generateRandomEntity('story-critical', 'patient');
  const servant = generateRandomEntity('recurring', 'npc');
  const directPatient = generateRandomEntity('story-critical', 'patient');
  const backgroundNPC1 = generateRandomEntity('background', 'npc');
  const backgroundNPC2 = generateRandomEntity('background', 'npc');
  const recurringNPC = generateRandomEntity('recurring', 'npc');
  const storyCriticalNPC = generateRandomEntity('story-critical', 'npc');
  const backgroundNPC3 = generateRandomEntity('background', 'npc');

  return [
    {
      id: 'servant-announces-patient',
      name: 'Servant Announces Patient',
      description: `A ${servant.occupation} arrives to announce ${patient.name} is ill`,
      selectedEntity: patient,
      newNPCs: [servant],
      expectedPortrait: servant.name,
      expectedReason: `Physically present NPC (${servant.occupation}) should take priority over topical patient (${patient.name})`
    },
    {
      id: 'direct-patient-encounter',
      name: 'Direct Patient Encounter',
      description: `${directPatient.name} arrives at your shop for treatment`,
      selectedEntity: directPatient,
      newNPCs: [],
      expectedPortrait: directPatient.name,
      expectedReason: 'Direct encounter with named patient should show their portrait'
    },
    {
      id: 'background-npcs-only',
      name: 'Background NPCs Only',
      description: `${backgroundNPC1.occupation}s and ${backgroundNPC2.occupation}s walk past your shop`,
      selectedEntity: null,
      newNPCs: [backgroundNPC1, backgroundNPC2],
      expectedPortrait: null,
      expectedReason: 'Background NPCs should not show portraits'
    },
    {
      id: 'multiple-portrait-worthy',
      name: 'Multiple Portrait-Worthy NPCs',
      description: `A ${storyCriticalNPC.occupation} and ${recurringNPC.occupation} both appear`,
      selectedEntity: recurringNPC,
      newNPCs: [storyCriticalNPC, backgroundNPC3],
      expectedPortrait: storyCriticalNPC.name,
      expectedReason: 'First portrait-worthy NPC in newNPCs should take priority'
    },
    {
      id: 'no-entities',
      name: 'No Entities',
      description: 'Turn with no NPCs (internal monologue or description)',
      selectedEntity: null,
      newNPCs: [],
      expectedPortrait: null,
      expectedReason: 'No entities means no portrait, show default shop'
    }
  ];
}

// Simulate the portrait selection logic from useGameHandlers.js
function simulatePortraitSelection(selectedEntity, newNPCs) {
  let portraitEntity = null;

  // 1. Check for newly-created portrait-worthy NPCs (likely physically present)
  if (newNPCs && newNPCs.length > 0) {
    const presentNPC = newNPCs.find(npc => {
      const tier = npc.tier || 'background';
      const entityType = npc.entityType || npc.type;
      const isActualNPC = ['npc', 'patient', 'antagonist'].includes(entityType);
      const isPortraitWorthy = ['story-critical', 'recurring'].includes(tier);
      return isActualNPC && isPortraitWorthy;
    });

    if (presentNPC) {
      portraitEntity = presentNPC;
      return { entity: portraitEntity, source: 'newNPC' };
    }
  }

  // 2. Fall back to selected entity if no new portrait-worthy NPCs
  if (!portraitEntity && selectedEntity) {
    const entityType = selectedEntity.entityType || selectedEntity.type;
    const tier = selectedEntity.tier || 'background';
    const isActualNPC = ['npc', 'patient', 'antagonist'].includes(entityType);
    const isPortraitWorthy = ['story-critical', 'recurring'].includes(tier);

    if (isActualNPC && isPortraitWorthy) {
      portraitEntity = selectedEntity;
      return { entity: portraitEntity, source: 'selectedEntity' };
    }
  }

  return { entity: null, source: null };
}

function TestResult({ test, result, onViewPortrait }) {
  const passed = result.passed;
  const statusColor = passed ? '#10b981' : '#ef4444';
  const statusBg = passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  const statusIcon = passed ? '✓' : '✗';

  // Format demographics for display
  const formatDemographics = (entity) => {
    if (!entity) return '';
    const { appearance, social, occupation } = entity;
    return `${appearance?.gender || '?'}, ${appearance?.age || '?'}, ${social?.casta || '?'}, ${social?.class || '?'}, ${occupation || '?'}`;
  };

  return (
    <div
      className="rounded-lg p-4 mb-3"
      style={{
        background: statusBg,
        border: `1px solid ${statusColor}40`,
        boxShadow: `0 2px 8px ${statusColor}15`
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="text-xl font-bold"
          style={{ color: statusColor }}
        >
          {statusIcon}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm" style={{
                fontFamily: "'Inter', sans-serif",
                color: '#3d2f24'
              }}>
                {test.name}
              </h4>
              <p className="text-xs mt-1" style={{
                fontFamily: "'Inter', sans-serif",
                color: '#6b5d52',
                lineHeight: '1.5'
              }}>
                {test.description}
              </p>

              {/* Show randomly generated entity demographics */}
              <div className="mt-2 space-y-1">
                {test.selectedEntity && (
                  <div className="text-xs" style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#8b7a6a',
                    fontSize: '0.7rem'
                  }}>
                    <strong>Selected:</strong> {test.selectedEntity.name} ({formatDemographics(test.selectedEntity)})
                  </div>
                )}
                {test.newNPCs && test.newNPCs.length > 0 && (
                  <div className="text-xs" style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#8b7a6a',
                    fontSize: '0.7rem'
                  }}>
                    <strong>New NPCs:</strong> {test.newNPCs.map(npc =>
                      `${npc.name} (${formatDemographics(npc)})`
                    ).join(' | ')}
                  </div>
                )}
              </div>
            </div>
            {result.portraitPath && (
              <button
                onClick={() => onViewPortrait(result.portraitPath)}
                className="ml-2 px-3 py-1 text-xs rounded"
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  fontFamily: "'Inter', sans-serif",
                  border: '1px solid #2563eb'
                }}
              >
                View Portrait
              </button>
            )}
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold" style={{ color: '#6b5d52' }}>Expected:</span>
              <code className="px-2 py-1 rounded" style={{
                background: 'rgba(245, 238, 223, 0.6)',
                color: '#d97706',
                fontFamily: "'IBM Plex Mono', monospace",
                border: '1px solid rgba(217, 119, 6, 0.2)'
              }}>
                {test.expectedPortrait || '(no portrait)'}
              </code>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold" style={{ color: '#6b5d52' }}>Actual:</span>
              <code className="px-2 py-1 rounded" style={{
                background: 'rgba(245, 238, 223, 0.6)',
                color: passed ? '#10b981' : '#ef4444',
                fontFamily: "'IBM Plex Mono', monospace",
                border: `1px solid ${passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {result.selectedName || '(no portrait)'}
              </code>
              {result.source && (
                <span className="text-xs" style={{ color: '#8b7a6a' }}>
                  (from {result.source})
                </span>
              )}
            </div>

            {result.portraitPath && (
              <div className="text-xs" style={{ color: '#8b7a6a' }}>
                <strong>Portrait:</strong> {result.portraitPath.split('/').pop()}
              </div>
            )}

            <div className="mt-2 p-2 rounded text-xs" style={{
              background: 'rgba(250, 245, 235, 0.8)',
              border: '1px solid rgba(139, 92, 46, 0.15)',
              fontFamily: "'Inter', sans-serif",
              color: '#5c4a3a',
              lineHeight: '1.5'
            }}>
              <strong>Reason:</strong> {test.expectedReason}
            </div>

            {!passed && result.error && (
              <div className="mt-2 p-2 rounded text-xs" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                fontFamily: "'Inter', sans-serif",
                color: '#dc2626',
                lineHeight: '1.5'
              }}>
                <strong>Error:</strong> {result.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortraitTestPanel() {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPortrait, setSelectedPortrait] = useState(null);

  const runTests = () => {
    setIsRunning(true);
    const results = [];

    // Generate fresh random test scenarios
    const testScenarios = generateTestScenarios();

    for (const test of testScenarios) {
      try {
        // Simulate portrait selection
        const { entity: selectedPortraitEntity, source } = simulatePortraitSelection(
          test.selectedEntity,
          test.newNPCs
        );

        const selectedName = selectedPortraitEntity?.name || null;
        const portraitPath = selectedPortraitEntity ? resolvePortrait(selectedPortraitEntity) : null;

        // Check if result matches expectation
        const passed = selectedName === test.expectedPortrait;

        results.push({
          test,
          passed,
          selectedName,
          portraitPath,
          source,
          error: null
        });
      } catch (error) {
        results.push({
          test,
          passed: false,
          selectedName: null,
          portraitPath: null,
          source: null,
          error: error.message
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{
              fontFamily: "'Inter', sans-serif",
              color: '#3d2f24'
            }}>
              Portrait Selection Tests
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1))',
              color: '#6d28d9',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              fontFamily: "'Inter', sans-serif"
            }}>
              🎲 Randomized
            </span>
          </div>
          <p className="text-xs mt-1" style={{
            fontFamily: "'Inter', sans-serif",
            color: '#8b7a6a',
            lineHeight: '1.5'
          }}>
            Tests the priority system with randomized NPC demographics. Each test run generates new entities to validate portrait matching across different demographic combinations.
          </p>
        </div>

        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-6 py-2 rounded-lg font-semibold transition-all"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            color: 'white',
            background: isRunning ? '#6b7280' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: '1px solid #2563eb',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? '⏳ Running...' : '▶ Run Tests'}
        </button>
      </div>

      {testResults.length > 0 && (
        <>
          <div className="mb-4 p-4 rounded-lg" style={{
            background: allPassed
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
            border: `1px solid ${allPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            boxShadow: `0 4px 12px ${allPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
          }}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {allPassed ? '✓' : '⚠️'}
              </div>
              <div>
                <h4 className="font-bold text-sm" style={{
                  fontFamily: "'Inter', sans-serif",
                  color: allPassed ? '#059669' : '#dc2626'
                }}>
                  {allPassed ? 'All Tests Passed' : 'Some Tests Failed'}
                </h4>
                <p className="text-xs mt-1" style={{
                  fontFamily: "'Inter', sans-serif",
                  color: allPassed ? '#047857' : '#b91c1c'
                }}>
                  {passedCount} / {totalCount} tests passing
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {testResults.map((result, index) => (
              <TestResult
                key={result.test.id}
                test={result.test}
                result={result}
                onViewPortrait={setSelectedPortrait}
              />
            ))}
          </div>
        </>
      )}

      {testResults.length === 0 && (
        <div className="text-center py-12 rounded-lg" style={{
          background: 'rgba(245, 238, 223, 0.5)',
          border: '1px solid rgba(139, 92, 46, 0.15)'
        }}>
          <div className="text-4xl mb-3">🎭</div>
          <p className="text-sm" style={{
            fontFamily: "'Inter', sans-serif",
            color: '#8b7a6a'
          }}>
            Click "Run Tests" to validate portrait selection logic
          </p>
        </div>
      )}

      {/* Portrait Preview Modal */}
      {selectedPortrait && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedPortrait(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{
                fontFamily: "'Inter', sans-serif",
                color: '#3d2f24'
              }}>
                Portrait Preview
              </h3>
              <button
                onClick={() => setSelectedPortrait(null)}
                className="text-2xl leading-none"
                style={{ color: '#8b7a6a' }}
              >
                ×
              </button>
            </div>
            <img
              src={selectedPortrait}
              alt="Portrait preview"
              className="w-full rounded"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            <p className="text-xs mt-3 text-center" style={{
              fontFamily: "'Inter', sans-serif",
              color: '#8b7a6a'
            }}>
              {selectedPortrait.split('/').pop()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
