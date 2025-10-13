import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { entityManager } from '../../../core/entities/EntityManager';
import { createChatCompletion } from '../../../core/services/llmService';

const Diagnose = ({ isOpen, onClose, previousOutput, patient }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);

  // UseEffect to set patient when popup opens
  useEffect(() => {
    if (isOpen && patient) {
      setCurrentPatient(patient);
    }
  }, [isOpen, patient]);

  const generateDiagnosis = async (previousOutput, patient) => {
    if (!patient) return; // Don't attempt to generate a diagnosis without a valid patient
    setIsLoading(true);

    try {
      const diagnosisPrompt = `
        You are an apothecary in the 1680s. Given the following patient information and recent observations from the historical simulation, provide a brief diagnosis for the patient and suggest medicinal simples or compound remedies of potential value.
        **Patient Information:**
        - Name: ${patient.name}
        - Age: ${patient.age}
        - Symptoms: ${patient.symptoms.length > 0 
            ? patient.symptoms.map(s => `${s.name} (${s.location}): "${s.quote}"`).join('; ') 
            : 'No symptoms available'}
        **Recent Observations:**
        ${previousOutput}
         Use period-appropriate medical concepts to depict Maria de Lima's thought process as she diagnoses the patient. Portray her thoughts in a plainspoken, simple (no "hath" or "thou"!), stream of consciousness style, almost like notes to herself, blunt and to the point, unsparing, citing relevent 17th century and earlier authorities frequently (i.e. Avicenna, Pliny, Monardes), with materia medica she considers using in italic. 
         She is an eclectic apothecary and uses both New World and traditional drugs - i.e. she might prescribe drugs/simples from "the Indies" and alchemical remedies, not just traditional herbs. Limit your response to two paragraphs.
      `;

      const response = await createChatCompletion([
              { role: 'system', content: 'You are assisting in a history simulation game about an apothecary in 1680.' },
              { role: 'user', content: diagnosisPrompt },
            ], 0.8, 1000);

      const diagnosisOutput = response.choices[0].message.content;
      setDiagnosis(diagnosisOutput);
    } catch (error) {
      console.error('Error generating diagnosis:', error);
      setDiagnosis(`An error occurred while generating the diagnosis: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentPatient) {
      generateDiagnosis(previousOutput, currentPatient);
    }
  }, [currentPatient, previousOutput]);

  if (!isOpen) return null;

  return (
    <div className="diagnose-popup">
      <div className="diagnose-popup-content">
        <h2>Diagnosis for {currentPatient ? currentPatient.name : 'Unknown Patient'}</h2>
        {isLoading ? (
          <p>Loading diagnosis...</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{diagnosis}</ReactMarkdown>
        )}
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default Diagnose;
