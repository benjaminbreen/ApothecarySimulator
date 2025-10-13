/**
 * Diagnose Modal - Redesigned with Tailwind
 * Beautiful parchment aesthetic with light mode default and dark mode support
 * Based on SettingsModal_V3 design patterns
 */

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createChatCompletion } from '../../../core/services/llmService';

const Diagnose = ({ isOpen, onClose, patient = null, previousOutput = '', theme = 'light' }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateDiagnosis = async (patient) => {
    if (!patient) return;
    setIsLoading(true);

    try {
      const diagnosisPrompt = `
        You are an apothecary in the 1680s. Given the following patient information, provide a brief diagnosis for the patient and suggest medicinal simples or compound remedies of potential value.
        **Patient Information:**
        - Name: ${patient.name}
        - Age: ${patient.age || 'Unknown'}
        - Gender: ${patient.gender || 'Unknown'}
        - Occupation: ${patient.occupation || 'Unknown'}
        - Symptoms: ${patient.symptoms?.length > 0
            ? patient.symptoms.map(s => `${s.name} (${s.location}): "${s.quote}"`).join('; ')
            : 'No symptoms available'}
        ${previousOutput ? `**Recent Observations:**\n${previousOutput}` : ''}
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
    if (isOpen && patient) {
      setDiagnosis(''); // Reset diagnosis when opening
      generateDiagnosis(patient);
    }
  }, [isOpen, patient]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: isDark
            ? 'rgba(15, 23, 42, 0.85)'
            : 'rgba(92, 74, 58, 0.4)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      >

        {/* Modal Container */}
        <div
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)'
              : 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 50%, #faf8f3 100%)',
            boxShadow: isDark
              ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.05)'
              : '0 20px 60px rgba(92, 74, 58, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
          }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* Subtle Border Accent */}
          <div
            className="absolute inset-0 pointer-events-none rounded-xl"
            style={{
              border: isDark
                ? '1px solid rgba(148, 163, 184, 0.2)'
                : '1px solid rgba(139, 92, 46, 0.15)'
            }}
          />

          {/* Header */}
          <div
            className="relative px-8 py-6 border-b"
            style={{
              background: isDark
                ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.6))'
                : 'linear-gradient(to bottom, rgba(245, 238, 223, 0.5), rgba(250, 248, 243, 0.3))',
              borderColor: isDark
                ? 'rgba(148, 163, 184, 0.2)'
                : 'rgba(139, 92, 46, 0.15)'
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🩺</span>
                  <h1
                    className="text-3xl tracking-tight"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontWeight: 700,
                      color: isDark ? '#e2e8f0' : '#3d2f24',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Medical Diagnosis
                  </h1>
                </div>
                {patient && (
                  <p
                    className="text-sm font-medium mt-2"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: isDark ? '#94a3b8' : '#8b7a6a',
                      letterSpacing: '0.01em'
                    }}
                  >
                    Examining: <span style={{fontWeight: 600, color: isDark ? '#cbd5e1' : '#6b5d52'}}>{patient.name}</span>
                    {patient.age && ` • Age ${patient.age}`}
                    {patient.occupation && ` • ${patient.occupation}`}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold transition-all rounded"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  background: isDark ? '#334155' : '#5c4a3a',
                  color: 'white',
                  border: isDark
                    ? '1px solid rgba(148, 163, 184, 0.3)'
                    : '1px solid rgba(92, 74, 58, 0.3)',
                  boxShadow: isDark
                    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                    : '0 2px 8px rgba(92, 74, 58, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = isDark ? '#475569' : '#4a3a2d';
                  e.target.style.boxShadow = isDark
                    ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                    : '0 4px 12px rgba(92, 74, 58, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = isDark ? '#334155' : '#5c4a3a';
                  e.target.style.boxShadow = isDark
                    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                    : '0 2px 8px rgba(92, 74, 58, 0.2)';
                }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="p-8 overflow-y-auto"
            style={{
              maxHeight: 'calc(90vh - 140px)',
              background: isDark
                ? 'rgba(15, 23, 42, 0.3)'
                : 'rgba(248, 243, 233, 0.3)'
            }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div
                  className="relative w-16 h-16"
                  style={{
                    borderRadius: '50%',
                    border: isDark
                      ? '3px solid rgba(148, 163, 184, 0.2)'
                      : '3px solid rgba(139, 92, 46, 0.2)',
                    borderTopColor: isDark ? '#94a3b8' : '#8b5c2e',
                    animation: 'spin 1s linear infinite'
                  }}
                />
                <p
                  className="text-sm font-medium"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isDark ? '#94a3b8' : '#8b7a6a'
                  }}
                >
                  Maria is examining the patient...
                </p>
              </div>
            ) : diagnosis ? (
              <div
                className="prose prose-lg max-w-none"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.125rem',
                  lineHeight: '1.8',
                  color: isDark ? '#e2e8f0' : '#3d2f24'
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    em: ({ node, ...props }) => (
                      <em
                        style={{
                          color: isDark ? '#fbbf24' : '#d97706',
                          fontStyle: 'italic',
                          fontWeight: 500
                        }}
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        style={{
                          marginBottom: '1.5rem',
                          color: isDark ? '#cbd5e1' : '#4a3f35'
                        }}
                        {...props}
                      />
                    )
                  }}
                >
                  {diagnosis}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-16">
                <p
                  className="text-lg font-medium"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isDark ? '#94a3b8' : '#8b7a6a'
                  }}
                >
                  No patient selected
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default Diagnose;
