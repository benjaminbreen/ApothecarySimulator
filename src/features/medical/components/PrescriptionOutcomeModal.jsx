/**
 * PrescriptionOutcomeModal - Beautiful two-column modal showing prescription results
 * Left: Patient info, prescription details, and summary
 * Right: Full LLM outcome narrative with markdown rendering
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { resolvePortrait } from '../../../core/services/portraitResolver';

function PrescriptionOutcomeModal({
  isOpen,
  onClose,
  patient,
  prescriptionData,
  outcome,
  onContinue
}) {
  // Debug logging
  console.log('[PrescriptionOutcomeModal] Render check', {
    isOpen,
    hasPatient: !!patient,
    hasPrescriptionData: !!prescriptionData,
    hasOutcome: !!outcome,
    outcomeLength: outcome?.length
  });

  if (!isOpen || !patient || !prescriptionData || !outcome) {
    console.log('[PrescriptionOutcomeModal] Not rendering - missing required prop');
    return null;
  }

  const portraitUrl = resolvePortrait(patient);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'severe': return 'text-red-500 dark:text-red-400';
      case 'moderate': return 'text-orange-500 dark:text-orange-400';
      case 'mild': return 'text-yellow-600 dark:text-yellow-500';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Render modal using portal to ensure it appears above everything
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-ink-200 dark:border-slate-700 shadow-2xl dark:shadow-dark-elevation-4 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-ink-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white text-xl">
              ℞
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink-900 dark:text-parchment-100 font-serif transition-colors duration-300">
                Prescription Outcome
              </h2>
              <p className="text-sm text-ink-600 dark:text-slate-400 font-sans transition-colors duration-300">
                Treatment results for {patient.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-6 h-6 text-ink-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="flex h-[calc(90vh-12rem)] overflow-hidden">
          {/* Left Column - Patient & Prescription Info */}
          <div className="w-1/3 border-r-2 border-ink-100 dark:border-slate-700 overflow-y-auto custom-scrollbar bg-parchment-50 dark:bg-slate-900/30 p-6 space-y-4 transition-colors duration-300">
            {/* Patient Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-ink-100 dark:border-slate-700 overflow-hidden shadow-md transition-colors duration-300">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800">
                <div className="flex items-center gap-3">
                  {portraitUrl && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-full border-3 border-white/40 overflow-hidden shadow-lg">
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
                  <div className="flex-1 text-white">
                    <h3 className="text-xl font-bold mb-1">{patient.name}</h3>
                    <div className="text-sm text-blue-100 space-y-0.5">
                      <div>{patient.occupation || 'Unknown'}</div>
                      <div>{patient.gender || 'Unknown'} • Age {patient.age || '?'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Symptoms List */}
              {patient.symptoms && patient.symptoms.length > 0 && (
                <div className="p-4 border-t border-ink-100 dark:border-slate-700">
                  <h4 className="text-xs uppercase tracking-wider text-ink-500 dark:text-slate-500 font-bold mb-2">
                    Chief Complaints:
                  </h4>
                  <div className="space-y-2">
                    {patient.symptoms.slice(0, 5).map((symptom, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(symptom.severity)}`} />
                        <span className="text-sm text-ink-700 dark:text-slate-300 font-medium">
                          {symptom.name}
                        </span>
                        <span className={`text-xs uppercase ${getSeverityColor(symptom.severity)}`}>
                          ({symptom.severity})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Prescription Details */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-ink-100 dark:border-slate-700 p-4 shadow-md transition-colors duration-300">
              <h4 className="text-sm font-bold text-ink-900 dark:text-parchment-100 mb-3 flex items-center gap-2 transition-colors duration-300">
                <span className="text-xl">📋</span>
                Prescription Details
              </h4>

              <div className="space-y-3">
                {/* Medicine */}
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors duration-300">
                  <div className="text-3xl">{prescriptionData.item?.emoji || '🍵'}</div>
                  <div className="flex-1">
                    <div className="font-bold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                      {prescriptionData.item?.name}
                    </div>
                    {prescriptionData.item?.spanishName && (
                      <div className="text-xs italic text-ink-600 dark:text-slate-400 transition-colors duration-300">
                        ({prescriptionData.item.spanishName})
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-parchment-50 dark:bg-slate-900/50 rounded-lg border border-ink-100 dark:border-slate-700 transition-colors duration-300">
                    <div className="text-xs text-ink-500 dark:text-slate-500 font-semibold mb-0.5">Amount</div>
                    <div className="text-lg font-bold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                      {prescriptionData.amount} drachms
                    </div>
                  </div>
                  <div className="p-2 bg-parchment-50 dark:bg-slate-900/50 rounded-lg border border-ink-100 dark:border-slate-700 transition-colors duration-300">
                    <div className="text-xs text-ink-500 dark:text-slate-500 font-semibold mb-0.5">Price</div>
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400 transition-colors duration-300">
                      {prescriptionData.price} reales
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors duration-300">
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1">Route of Administration</div>
                  <div className="text-base font-bold text-emerald-900 dark:text-emerald-300 transition-colors duration-300">
                    {prescriptionData.route}
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis (if available) */}
            {patient.diagnosis && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-ink-100 dark:border-slate-700 p-4 shadow-md transition-colors duration-300">
                <h4 className="text-sm font-bold text-ink-900 dark:text-parchment-100 mb-2 flex items-center gap-2 transition-colors duration-300">
                  <span className="text-xl">🩺</span>
                  Your Diagnosis
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 font-semibold transition-colors duration-300">
                  {patient.diagnosis}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Outcome Narrative */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-slate-800/50 transition-colors duration-300">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => (
                    <h3 className="text-2xl font-bold text-ink-900 dark:text-parchment-100 mb-4 mt-0 font-serif transition-colors duration-300" {...props} />
                  ),
                  h5: ({ node, ...props }) => (
                    <h5 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 mt-0 font-serif transition-colors duration-300" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-base text-ink-700 dark:text-slate-300 leading-relaxed mb-4 font-sans transition-colors duration-300" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-ink-900 dark:text-parchment-100 transition-colors duration-300" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic text-ink-600 dark:text-slate-400 transition-colors duration-300" {...props} />
                  ),
                }}
              >
                {outcome}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Footer with Continue Button */}
        <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-ink-100 dark:border-slate-700 bg-parchment-50 dark:bg-slate-900/30 transition-colors duration-300">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-semibold transition-all bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-ink-900 dark:text-parchment-100 border border-gray-300 dark:border-slate-600"
          >
            Close
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-3 rounded-lg font-semibold transition-all bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-blue-700 flex items-center gap-2"
          >
            Continue
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document root (above all other UI)
  return ReactDOM.createPortal(modalContent, document.body);
}

export default PrescriptionOutcomeModal;
