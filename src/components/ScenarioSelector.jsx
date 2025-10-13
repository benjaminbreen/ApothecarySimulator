// ScenarioSelector.jsx
// Allows players to choose which historical scenario to play

import React from 'react';
import { scenarioLoader } from '../core/services/scenarioLoader';
import './ScenarioSelector.css';

/**
 * Scenario selection screen
 * @param {Object} props
 * @param {Function} props.onSelectScenario - Callback when scenario is selected (receives scenarioId)
 */
export default function ScenarioSelector({ onSelectScenario }) {
  const scenarios = scenarioLoader.getAllScenarios();

  return (
    <div className="scenario-selector-overlay">
      <div className="scenario-selector-container">
        <h1 className="scenario-selector-title">Choose Your Story</h1>
        <p className="scenario-selector-subtitle">
          Practice medicine across different historical periods
        </p>

        <div className="scenario-grid">
          {scenarios.map(scenario => (
            <div
              key={scenario.id}
              className="scenario-card"
              onClick={() => onSelectScenario(scenario.id)}
            >
              <div className="scenario-card-inner">
                <div className="scenario-header">
                  <h2>{scenario.name}</h2>
                  <p className="scenario-description">{scenario.description}</p>
                </div>

                <div className="scenario-preview">
                  <div className="scenario-portrait">
                    <img
                      src={require(`../assets/${scenario.character.portraits.normal}`)}
                      alt={scenario.character.name}
                    />
                  </div>
                  <div className="scenario-character-info">
                    <h3>{scenario.character.name}</h3>
                    <p className="character-title">{scenario.character.title}</p>
                    <p className="character-age">Age {scenario.character.age}</p>
                  </div>
                </div>

                <div className="scenario-details">
                  <div className="scenario-detail">
                    <span className="detail-label">Setting:</span>
                    <span className="detail-value">{scenario.startLocation}</span>
                  </div>
                  <div className="scenario-detail">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{scenario.startDate}</span>
                  </div>
                  <div className="scenario-detail">
                    <span className="detail-label">Starting Wealth:</span>
                    <span className="detail-value">
                      {scenario.startingWealth} {scenario.currency}
                    </span>
                  </div>
                </div>

                <button className="scenario-select-btn">
                  Begin This Story
                </button>
              </div>
            </div>
          ))}
        </div>

        {scenarios.length === 0 && (
          <div className="no-scenarios">
            <p>No scenarios available. Please check your installation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
