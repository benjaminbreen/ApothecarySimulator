import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../../EndGameAssessment.css';
import { createChatCompletion } from '../../core/services/llmService';

const callAIApi = async (prompt) => {
  try {
    const response = await createChatCompletion([
      { role: 'system', content: 'You are a game master for a historical simulation.' },
      { role: 'user', content: prompt }
    ], 1.0, 1000);

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error with AI API:', error);
    return 'An error occurred during the assessment.';
  }
};

const determineOutcomeFromResponse = (response) => {
  const lowerCaseResponse = response.toLowerCase();
  if (lowerCaseResponse.includes('success')) return 'success';
  if (lowerCaseResponse.includes('neutral')) return 'neutral';
  if (lowerCaseResponse.includes('worse')) return 'worse';
  return 'neutral';
};

// Function to assess the final gameplay result for the Valdez quest
export const assessPrescription = async (quantity, item, patient) => {
  const prompt = `
    Maria de Lima, an apothecary in 1680 Mexico City, has prescribed ${quantity} of ${item.name} (${item.spanishName}) to a patient.
    
    Patient: ${patient.name}
    Disease: ${patient.diagnosis}
    Humoral Imbalance: ${patient.contemporaryTheory}
    Astrological Sign: ${patient.astrologicalSign}
    
    Prescribed item:
    Humoral Qualities: ${item.humoralQualities}
    Medicinal Effects: ${item.medicinalEffects}
    
    Assess the likely outcome of this prescription. Choose one of the following outcomes and explain briefly:
    1. Success
    2. Neutral Effects
    3. Worsening Illness
    
    Provide a brief, historically accurate description of the patient's reaction and condition after taking the prescription.
  `;

  const assessmentOutput = await callAIApi(prompt);
  const outcome = determineOutcomeFromResponse(assessmentOutput);

  return {
    outcome,
    description: assessmentOutput
  };
};

// Popup component to display prescription results
export const PrescriptionPopup = ({ assessment, onClose }) => {
  const badgeMap = {
    success: 'badge-success.png',
    neutral: 'badge-neutral.png',
    worse: 'badge-worse.png'
  };

  return (
    <div className="assessment-popup">
      <div className="assessment-content">
        <img src={require(`../../assets/${badgeMap[assessment.outcome]}`)} alt={assessment.outcome} className="outcome-badge" />
        <h3>{assessment.outcome.charAt(0).toUpperCase() + assessment.outcome.slice(1)}</h3>
        <ReactMarkdown>{assessment.description}</ReactMarkdown>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

// Assess final gameplay at the end of the game
export const assessGameplay = async (turnNumber, wealth, inventory, journalEntries) => {
  const inventorySummary = inventory.map(item => `${item.name} (${item.quantity})`).join(', ');
  const journalSummary = journalEntries.map(entry => entry.content).join(' ');

  const prompt = `
    Provide a brief, quantitative, critical assessment of the player's performance in the historical simulation as Maria de Lima, an apothecary in Mexico City in 1680. 

    Consider how well the player adhered to historical accuracy, how effectively they managed the apothecary, and how they interacted with the simulation. Also note the NPCs they met and analyze the sentiment of their interactions.

    Here is some context:
    - Final Turn Number: ${turnNumber}
    - Final Wealth: ${wealth} reales
    - Final Inventory: ${inventorySummary}
    - Summary of Journal Entries: ${journalSummary}

    Keep the assessment to 2-3 paragraphs and end with a quirky rating in bold.
  `;

  const assessmentOutput = await callAIApi(prompt);
  return assessmentOutput;
};

/**
 * Export game data as JSON for professor assessment/grading
 * @param {Object} gameData - Complete game data for export
 */
export const exportGameData = (gameData) => {
  const timestamp = new Date().toISOString();
  const filename = `apothecary-sim-${gameData.turnNumber}-turns-${timestamp}.json`;

  const exportData = {
    meta: {
      exportedAt: timestamp,
      gameVersion: '1.0.0',
      scenario: gameData.scenarioId || '1680-mexico-city',
    },
    gameplay: {
      turnNumber: gameData.turnNumber,
      finalWealth: gameData.wealth,
      finalHealth: gameData.health,
      finalEnergy: gameData.energy,
      finalReputation: gameData.reputation,
      endReason: gameData.endQuestResult,
    },
    inventory: gameData.inventory,
    journal: gameData.journal,
    conversationHistory: gameData.conversationHistory,
    assessment: gameData.assessment,
    playerSkills: gameData.playerSkills,
    profession: gameData.profession,
    relationships: gameData.relationships,
  };

  // Create downloadable JSON file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log('[Export] Game data exported:', filename);
};

// Final End Game Popup showing the assessment
export const EndGamePopup = ({ assessment, onClose, gameData }) => {
  const handleExport = () => {
    if (gameData) {
      exportGameData({ ...gameData, assessment });
    } else {
      console.warn('[Export] No game data available for export');
    }
  };

  return (
    <div className="endgame-popup">
      <div className="endgame-content">
        <h2>Game Over</h2>
        <ReactMarkdown>{assessment}</ReactMarkdown>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          {gameData && (
            <button onClick={handleExport} className="export-button" style={{
              padding: '12px 24px',
              background: '#3498db',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1em',
              fontFamily: 'MedievalSharp, cursive',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
            }}>
              📊 Export Data (For Professors)
            </button>
          )}
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    </div>
  );
};
