/**
 * PrescribeOverviewPanel - Left column overview during prescription phase
 * Shows patient summary, Q&A history, diagnosis, and option to mix new medicine
 */

import React, { useState } from 'react';
import { resolvePortrait } from '../../../core/services/portraitResolver';
import PatientDialogueHistory from '../../../components/CentralPanel/PatientDialogueHistory';

function PrescribeOverviewPanel({
  patient,
  patientDialogue = [],
  diagnosisData = null,
  onOpenMixing,
  prescriptionPreview = null
}) {
  const [isQAExpanded, setIsQAExpanded] = useState(false);
  const [isDiagnosisExpanded, setIsDiagnosisExpanded] = useState(false);

  if (!patient) return null;

  // Get top 3 symptoms by severity
  const topSymptoms = [...(patient.symptoms || [])]
    .sort((a, b) => {
      const severityOrder = { critical: 4, severe: 3, moderate: 2, mild: 1 };
      return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    })
    .slice(0, 3);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'severe': return 'text-red-500 dark:text-red-400';
      case 'moderate': return 'text-orange-500 dark:text-orange-400';
      case 'mild': return 'text-yellow-600 dark:text-yellow-500';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const portraitUrl = resolvePortrait(patient);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl border border-ink-100 dark:border-slate-700 shadow-md overflow-hidden">

      {/* Compact Patient Card - Always visible */}
      <div className="flex-shrink-0 p-4 border-b-2 border-ink-100 dark:border-slate-700 bg-gradient-to-br from-parchment-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="flex gap-3">
          {/* Portrait Thumbnail */}
          {portraitUrl && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-emerald-500 dark:border-amber-500 shadow-md">
              <img
                src={portraitUrl}
                alt={patient.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-ink-900 dark:text-parchment-100 mb-1 truncate">
              {patient.name}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-ink-600 dark:text-slate-400 mb-2">
              <span>{patient.occupation || 'Unknown'}</span>
              <span>•</span>
              <span>{patient.appearance?.gender || patient.gender || 'Unknown'}</span>
              <span>•</span>
              <span>Age {patient.appearance?.age || patient.age || '?'}</span>
            </div>

            {/* Top 3 Symptoms */}
            <div className="text-xs">
              <div className="text-[10px] uppercase tracking-wider text-ink-500 dark:text-slate-500 font-bold mb-1">
                Chief Complaints:
              </div>
              <div className="space-y-0.5">
                {topSymptoms.map((symptom, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${getSeverityColor(symptom.severity)}`} />
                    <span className="text-ink-700 dark:text-slate-300 font-medium">
                      {symptom.name}
                    </span>
                    <span className={`text-[10px] uppercase ${getSeverityColor(symptom.severity)}`}>
                      ({symptom.severity})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">

        {/* Expandable Q&A Section */}
        <div className="border border-ink-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-800/50">
          <button
            onClick={() => setIsQAExpanded(!isQAExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg
                className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 ${isQAExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                Questions & Answers ({patientDialogue.length})
              </span>
            </div>
            {!isQAExpanded && patientDialogue.length > 0 && (
              <span className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">
                Click to review
              </span>
            )}
          </button>

          {isQAExpanded && (
            <div className="max-h-56 overflow-y-auto custom-scrollbar p-4 bg-white dark:bg-slate-900/30 rounded-b-lg">
              <PatientDialogueHistory
                entries={[...patientDialogue].reverse()}
                emptyLabel="No questions asked yet"
              />
            </div>
          )}
        </div>

        {/* Expandable Diagnosis Section */}
        {diagnosisData && (
          <div className="border border-ink-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-800/50">
            <button
              onClick={() => setIsDiagnosisExpanded(!isDiagnosisExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${isDiagnosisExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                  Your Diagnosis
                </span>
              </div>
              {!isDiagnosisExpanded && (
                <span className="text-xs text-blue-600 dark:text-blue-500 font-medium truncate max-w-[120px]">
                  {diagnosisData.diagnosis}
                </span>
              )}
            </button>

            {isDiagnosisExpanded && (
              <div className="p-4 space-y-3 bg-white dark:bg-slate-900/30">
                <div>
                  <div className="text-xs font-bold text-ink-700 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Diagnosis:
                  </div>
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    {diagnosisData.diagnosis}
                  </div>
                </div>

                {diagnosisData.evidence && diagnosisData.evidence.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-ink-700 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Evidence Used:
                    </div>
                    <div className="space-y-1">
                      {diagnosisData.evidence.map((evidence, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-ink-700 dark:text-slate-300">
                          <span className="text-blue-500 dark:text-blue-400 flex-shrink-0">•</span>
                          <span>{evidence}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mix New Medicine Button */}
        <button
          onClick={onOpenMixing}
          className="w-full p-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="text-2xl">⚗️</span>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-0.5">
                Mix a New Medicine
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-500">
                Create a custom compound for this patient
              </div>
            </div>
            <svg
              className="w-5 h-5 text-purple-600 dark:text-purple-500 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>
      </div>

      {/* Info Panel - Fixed at bottom - Contextual based on prescription selection */}
      <div className="flex-shrink-0 p-4 border-t-2 border-ink-100 dark:border-slate-700"
        style={{
          background: prescriptionPreview
            ? (prescriptionPreview.effectiveness >= 75 ? 'rgba(16, 185, 129, 0.1)' :
               prescriptionPreview.effectiveness >= 50 ? 'rgba(245, 158, 11, 0.1)' :
               prescriptionPreview.effectiveness >= 25 ? 'rgba(249, 115, 22, 0.1)' : 'rgba(220, 38, 38, 0.1)')
            : document.documentElement.classList.contains('dark') ? 'rgba(217, 119, 6, 0.2)' : 'rgba(254, 243, 199, 1)'
        }}
      >
        {/* Show "How to Prescribe" when no medicine selected */}
        {!prescriptionPreview && (
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 dark:bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
              i
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-1">
                How to Prescribe
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                Drag a medicine from your inventory (bottom right) or mix a new one above, then select route and amount.
              </div>
            </div>
          </div>
        )}

        {/* Show Predicted Effectiveness when medicine selected */}
        {prescriptionPreview && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wide"
                style={{
                  color: prescriptionPreview.effectiveness >= 75 ? '#065f46' :
                         prescriptionPreview.effectiveness >= 50 ? '#92400e' :
                         prescriptionPreview.effectiveness >= 25 ? '#9a3412' : '#991b1b'
                }}
              >
                Predicted Effectiveness
              </span>
              <span className="text-2xl font-bold"
                style={{
                  color: prescriptionPreview.effectiveness >= 75 ? '#10b981' :
                         prescriptionPreview.effectiveness >= 50 ? '#f59e0b' :
                         prescriptionPreview.effectiveness >= 25 ? '#f97316' : '#dc2626'
                }}
              >
                {Math.round(prescriptionPreview.effectiveness)}/100
              </span>
            </div>

            {/* Effectiveness breakdown */}
            <div className="space-y-2 text-xs">
              {prescriptionPreview.breakdown.toxicityWarning && (
                <div className="flex items-start gap-2 p-2 rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <span className="text-red-600 dark:text-red-400 flex-shrink-0">⚠️</span>
                  <span className="text-red-700 dark:text-red-300 font-semibold">
                    {prescriptionPreview.breakdown.toxicityWarning}
                  </span>
                </div>
              )}

              {prescriptionPreview.breakdown.dosageWarning && (
                <div className="flex items-start gap-2 p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                  <span className="text-amber-600 dark:text-amber-400 flex-shrink-0">⚠️</span>
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    {prescriptionPreview.breakdown.dosageWarning}
                  </span>
                </div>
              )}

              {prescriptionPreview.breakdown.routeExplanation && (
                <div className="p-2 rounded bg-white dark:bg-slate-800 border border-ink-200 dark:border-slate-600">
                  <span className="text-ink-700 dark:text-slate-300 leading-relaxed">
                    {prescriptionPreview.breakdown.routeExplanation}
                  </span>
                </div>
              )}

              {/* HIGH PRIORITY: Contraindications - Show if present */}
              {prescriptionPreview.breakdown.contraindications && prescriptionPreview.breakdown.contraindications.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-red-700 dark:text-red-400">
                    ⚠️ Contraindications:
                  </div>
                  {prescriptionPreview.breakdown.contraindications.map((contra, idx) => (
                    <div key={idx} className="p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <div className="text-red-700 dark:text-red-300 font-semibold text-xs mb-1">
                        {contra.warning}
                      </div>
                      {contra.historicalContext && (
                        <div className="text-red-600 dark:text-red-400 text-[10px] italic">
                          {contra.historicalContext}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Therapeutic Action Matches - Direct symptom relief */}
              {prescriptionPreview.breakdown.therapeuticMatches && prescriptionPreview.breakdown.therapeuticMatches.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
                    ✓ Therapeutic Actions:
                  </div>
                  {prescriptionPreview.breakdown.therapeuticMatches.slice(0, 3).map((match, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                      <span className="text-emerald-600 dark:text-emerald-400 flex-shrink-0">•</span>
                      <div className="flex-1">
                        <span className="text-emerald-700 dark:text-emerald-300 font-medium text-xs">
                          {match.action}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px] ml-1">
                          → treats {match.symptom}
                        </span>
                        {match.score && (
                          <span className="text-emerald-500 dark:text-emerald-500 text-[10px] ml-1">
                            (+{match.score})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ingredient Synergies - For compound medicines */}
              {prescriptionPreview.breakdown.ingredientSynergies && prescriptionPreview.breakdown.ingredientSynergies.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">
                    ⚗️ Ingredient Interactions:
                  </div>
                  {prescriptionPreview.breakdown.ingredientSynergies.map((synergy, idx) => (
                    <div key={idx} className={`flex items-start gap-2 p-2 rounded border ${
                      synergy.type === 'synergy'
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                        : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
                    }`}>
                      <span className={`flex-shrink-0 ${
                        synergy.type === 'synergy' ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {synergy.type === 'synergy' ? '✓' : '⚠️'}
                      </span>
                      <div className="flex-1">
                        <span className={`font-medium text-xs ${
                          synergy.type === 'synergy'
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-orange-700 dark:text-orange-300'
                        }`}>
                          {synergy.description}
                        </span>
                        {synergy.effect && (
                          <div className="text-[10px] mt-0.5 opacity-80">
                            {synergy.effect}
                          </div>
                        )}
                        {synergy.bonus && (
                          <span className={`text-[10px] ml-1 ${
                            synergy.bonus > 0 ? 'text-purple-500' : 'text-orange-500'
                          }`}>
                            ({synergy.bonus > 0 ? '+' : ''}{synergy.bonus})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Historical Medical Reasoning - Educational context */}
              {prescriptionPreview.breakdown.historicalReasoning && prescriptionPreview.breakdown.historicalReasoning.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400">
                    📜 Historical Reasoning:
                  </div>
                  {prescriptionPreview.breakdown.historicalReasoning.slice(0, 2).map((reasoning, idx) => (
                    <div key={idx} className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                      <div className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
                        {reasoning.explanation}
                      </div>
                      {reasoning.authority && (
                        <div className="text-blue-600 dark:text-blue-400 text-[10px] italic mt-1">
                          — {reasoning.authority}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Show positive feedback for good choices */}
              {prescriptionPreview.effectiveness >= 75 && (
                <div className="flex items-start gap-2 p-2 rounded bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                  <span className="text-emerald-600 dark:text-emerald-400 flex-shrink-0">✓</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                    This treatment is highly effective for the patient's condition
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrescribeOverviewPanel;
