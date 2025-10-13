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

// Final End Game Popup showing the assessment
export const EndGamePopup = ({ assessment, onClose }) => {
  return (
    <div className="endgame-popup">
      <div className="endgame-content">
        <h2>Game Over</h2>
        <ReactMarkdown>{assessment}</ReactMarkdown>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};
