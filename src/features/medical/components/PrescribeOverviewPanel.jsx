/**
 * PrescribeOverviewPanel - Left column overview during prescription phase
 * Shows patient summary, Q&A history, diagnosis, and option to mix new medicine
 */

import React, { useState } from 'react';
import { resolvePortrait } from '../../../core/services/portraitResolver';

function PrescribeOverviewPanel({
  patient,
  patientDialogue = [],
  diagnosisData = null,
  onOpenMixing
}) {
  const [isQAExpanded, setIsQAExpanded] = useState(false);
  const [isDiagnosisExpanded, setIsDiagnosisExpanded] = useState(false);

  if (!patient) return null;

  // Get top 3 symptoms by severity
  const topSymptoms = (patient.symptoms || [])
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
              <span>{patient.gender || 'Unknown'}</span>
              <span>•</span>
              <span>Age {patient.age || '?'}</span>
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
            <div className="max-h-48 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-white dark:bg-slate-900/30">
              {patientDialogue.length === 0 ? (
                <p className="text-xs text-ink-500 dark:text-slate-500 italic text-center py-2">
                  No questions asked yet
                </p>
              ) : (
                patientDialogue.map((qa, idx) => (
                  <div key={idx} className="border-l-2 border-emerald-500 dark:border-emerald-600 pl-3 py-1">
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                      Q: {qa.question}
                    </div>
                    <div className="text-xs text-ink-700 dark:text-slate-300 leading-relaxed">
                      {qa.answer}
                    </div>
                  </div>
                ))
              )}
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

      {/* Info Panel - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t-2 border-ink-100 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20">
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
      </div>
    </div>
  );
}

export default PrescribeOverviewPanel;
