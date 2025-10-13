// ScenarioSelector - UI component for choosing game scenario
// Displays available scenarios and allows player to select one

import React, { useState, useEffect } from 'react';
import { scenarioLoader } from '../core/services/scenarioLoader';

/**
 * ScenarioSelector component
 * @param {Object} props
 * @param {Function} props.onScenarioSelect - Callback when scenario is selected
 */
export default function ScenarioSelector({ onScenarioSelect }) {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [hoveredScenario, setHoveredScenario] = useState(null);

  useEffect(() => {
    // Load all available scenarios
    const allScenarios = scenarioLoader.getAllScenarios();
    setScenarios(allScenarios);
  }, []);

  const handleSelect = (scenario) => {
    setSelectedScenario(scenario.id);
  };

  const handleConfirm = () => {
    if (selectedScenario && onScenarioSelect) {
      onScenarioSelect(selectedScenario);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Choose Your Journey
          </h1>
          <p className="text-gray-300 text-lg">
            Select a historical setting to begin your medical practice
          </p>
        </div>

        {/* Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {scenarios.map((scenario) => {
            const isSelected = selectedScenario === scenario.id;
            const isHovered = hoveredScenario === scenario.id;
            const character = scenario.character;

            return (
              <div
                key={scenario.id}
                className={`
                  relative rounded-xl border-2 transition-all duration-300 cursor-pointer
                  ${isSelected
                    ? 'border-green-400 bg-green-900 bg-opacity-20'
                    : 'border-white border-opacity-20 bg-white bg-opacity-5 hover:bg-opacity-10'
                  }
                  ${isHovered ? 'transform scale-105' : ''}
                `}
                onClick={() => handleSelect(scenario)}
                onMouseEnter={() => setHoveredScenario(scenario.id)}
                onMouseLeave={() => setHoveredScenario(null)}
              >
                <div className="p-6">
                  {/* Character Portrait */}
                  {character?.portraits?.default && (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={character.portraits.default}
                        alt={character.name}
                        className="w-32 h-32 rounded-full border-4 border-white border-opacity-20 object-cover"
                      />
                    </div>
                  )}

                  {/* Scenario Info */}
                  <h3 className="text-2xl font-bold text-white mb-2 text-center">
                    {scenario.name}
                  </h3>

                  {character && (
                    <p className="text-green-300 text-center mb-3 font-medium">
                      Play as {character.name}
                    </p>
                  )}

                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {scenario.description}
                  </p>

                  {/* Scenario Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Starting Date:</span>
                      <span className="text-white">{scenario.startDate}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Location:</span>
                      <span className="text-white">{scenario.startLocation}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Starting Wealth:</span>
                      <span className="text-white">
                        {scenario.startingWealth} {scenario.currency}
                      </span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="mt-4 text-center">
                      <span className="inline-block px-4 py-2 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-sm font-medium">
                        ✓ Selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className="text-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedScenario}
            className={`
              px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300
              ${selectedScenario
                ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {selectedScenario ? 'Begin Journey' : 'Select a Scenario'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>More scenarios coming soon!</p>
        </div>
      </div>
    </div>
  );
}
