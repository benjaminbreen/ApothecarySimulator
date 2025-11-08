/**
 * PrescriptionOutcomeModal - Beautiful two-column modal showing prescription results
 * Left: Patient info, prescription details, and summary
 * Right: Full LLM outcome narrative with markdown rendering
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { resolvePortrait } from '../../../core/services/portraitResolver';

/**
 * Parse the LLM's score out of 10 from the outcome text
 * Looks for patterns like "Score: 8/10" or "**8/10**"
 */
function parseOutcomeScore(outcomeText) {
  if (!outcomeText) return null;

  // Match patterns like:
  // "Score: 8/10" or "**Score: 8/10**" or "Rating: 8/10"
  // "8/10" or "**8/10**"
  const scorePatterns = [
    /(?:Score|Rating):\s*\*{0,2}(\d+)\/10\*{0,2}/i,
    /\*{0,2}(\d+)\/10\*{0,2}/,
  ];

  for (const pattern of scorePatterns) {
    const match = outcomeText.match(pattern);
    if (match) {
      const score = parseInt(match[1], 10);
      return score >= 0 && score <= 10 ? score : null;
    }
  }

  return null; // Fallback if no score found
}

/**
 * Get color theme based on prescription outcome score (1-10)
 * Returns colors and emoji for visual feedback
 */
function getOutcomeTheme(score) {
  // Fallback to neutral if no score
  if (score === null || score === undefined) {
    return {
      category: 'unknown',
      emoji: '℞',
      headerGradient: 'from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800',
      iconBg: 'bg-blue-500 dark:bg-blue-600',
      patientGradient: 'from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800',
      titleColor: 'text-ink-900 dark:text-parchment-100',
      subtitleColor: 'text-ink-600 dark:text-slate-400',
      label: 'Prescription Outcome'
    };
  }

  // Score 1: Fatal/Catastrophic
  if (score <= 1) {
    return {
      category: 'fatal',
      emoji: '☠️',
      headerGradient: 'from-gray-900 to-black dark:from-black dark:to-gray-950',
      iconBg: 'bg-gray-900 dark:bg-black',
      patientGradient: 'from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black',
      titleColor: 'text-white dark:text-gray-100',
      subtitleColor: 'text-gray-300 dark:text-gray-400',
      label: 'Fatal Outcome'
    };
  }

  // Score 2-3: Severe Complications
  if (score <= 3) {
    return {
      category: 'severe_injury',
      emoji: '🩸',
      headerGradient: 'from-red-900 to-red-950 dark:from-red-950 dark:to-black',
      iconBg: 'bg-red-900 dark:bg-red-950',
      patientGradient: 'from-red-800 to-red-900 dark:from-red-900 dark:to-red-950',
      titleColor: 'text-white dark:text-red-100',
      subtitleColor: 'text-red-200 dark:text-red-300',
      label: 'Severe Complications'
    };
  }

  // Score 4: Moderate Harm
  if (score <= 4) {
    return {
      category: 'injury',
      emoji: '🤕',
      headerGradient: 'from-red-600 to-red-700 dark:from-red-800 dark:to-red-900',
      iconBg: 'bg-red-600 dark:bg-red-800',
      patientGradient: 'from-red-500 to-red-600 dark:from-red-700 dark:to-red-800',
      titleColor: 'text-white dark:text-red-100',
      subtitleColor: 'text-red-100 dark:text-red-200',
      label: 'Harmful Side Effects'
    };
  }

  // Score 5: Unpleasant/Nausea
  if (score <= 5) {
    return {
      category: 'unpleasant',
      emoji: '🤢',
      headerGradient: 'from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800',
      iconBg: 'bg-orange-500 dark:bg-orange-700',
      patientGradient: 'from-orange-400 to-orange-500 dark:from-orange-600 dark:to-orange-700',
      titleColor: 'text-white dark:text-orange-100',
      subtitleColor: 'text-orange-100 dark:text-orange-200',
      label: 'Unpleasant Outcome'
    };
  }

  // Score 6: Ineffective
  if (score <= 6) {
    return {
      category: 'ineffective',
      emoji: '😐',
      headerGradient: 'from-yellow-500 to-yellow-600 dark:from-yellow-700 dark:to-yellow-800',
      iconBg: 'bg-yellow-500 dark:bg-yellow-700',
      patientGradient: 'from-yellow-400 to-yellow-500 dark:from-yellow-600 dark:to-yellow-700',
      titleColor: 'text-gray-900 dark:text-yellow-100',
      subtitleColor: 'text-yellow-900 dark:text-yellow-200',
      label: 'Ineffective Treatment'
    };
  }

  // Score 7-8: Effective
  if (score <= 8) {
    return {
      category: 'effective',
      emoji: '✓',
      headerGradient: 'from-green-500 to-green-600 dark:from-green-700 dark:to-green-800',
      iconBg: 'bg-green-500 dark:bg-green-700',
      patientGradient: 'from-green-400 to-green-500 dark:from-green-600 dark:to-green-700',
      titleColor: 'text-white dark:text-green-100',
      subtitleColor: 'text-green-100 dark:text-green-200',
      label: 'Effective Treatment'
    };
  }

  // Score 9-10: Excellent
  return {
    category: 'excellent',
    emoji: '✨',
    headerGradient: 'from-emerald-500 to-green-600 dark:from-emerald-700 dark:to-green-800',
    iconBg: 'bg-emerald-500 dark:bg-emerald-600',
    patientGradient: 'from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700',
    titleColor: 'text-white dark:text-emerald-100',
    subtitleColor: 'text-emerald-100 dark:text-emerald-200',
    label: 'Excellent Outcome'
  };
}

function PrescriptionOutcomeModal({
  isOpen,
  onClose,
  patient,
  prescriptionData,
  outcome,
  onContinue,
  mechanicsBreakdown = null
}) {
  // Early return if not ready - no logging to avoid console spam
  if (!isOpen || !patient || !prescriptionData || !outcome) {
    return null;
  }

  // Debug logging only when modal is actually rendering
  // console.log('[PrescriptionOutcomeModal] Rendering with', {
  //   patient: patient.name,
  //   prescriptionData,
  //   outcomeLength: outcome?.length
  // });

  const portraitUrl = resolvePortrait(patient);

  // Parse outcome score and get dynamic theme
  const outcomeScore = parseOutcomeScore(outcome);
  const theme = getOutcomeTheme(outcomeScore);

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
        {/* Header - Dynamic Color */}
        <div className={`flex items-center justify-between p-4 border-b border-ink-100 dark:border-slate-700 bg-gradient-to-r ${theme.headerGradient} transition-colors duration-300`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full ${theme.iconBg} flex items-center justify-center text-white text-lg`}>
              {theme.emoji}
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme.titleColor} font-serif transition-colors duration-300`}>
                {theme.label}
              </h2>
              <p className={`text-sm ${theme.subtitleColor} font-sans transition-colors duration-300`}>
                Treatment results for {patient.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5 text-ink-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="flex h-[calc(90vh-10rem)] overflow-hidden">
          {/* Left Column - Patient & Prescription Info */}
          <div className="w-1/3 border-r border-ink-100 dark:border-slate-700 overflow-y-auto custom-scrollbar bg-parchment-50 dark:bg-slate-900/30 p-4 space-y-3 transition-colors duration-300">
            {/* Patient Card - Compact with Dynamic Color */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-ink-100 dark:border-slate-700 overflow-hidden shadow-sm transition-colors duration-300">
              <div className={`p-3 bg-gradient-to-br ${theme.patientGradient}`}>
                <div className="flex items-center gap-2.5">
                  {portraitUrl && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden shadow-lg">
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
                    <h3 className="text-lg font-bold mb-0.5">{patient.name}</h3>
                    <div className="text-xs text-blue-100">
                      <div>{patient.occupation || 'Unknown'}</div>
                      <div>{patient.appearance?.gender || patient.gender || 'Unknown'} • Age {patient.appearance?.age || patient.age || '?'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Symptoms List - Compact */}
              {patient.symptoms && patient.symptoms.length > 0 && (
                <div className="p-3 border-t border-ink-100 dark:border-slate-700">
                  <h4 className="text-xs uppercase tracking-wider text-ink-500 dark:text-slate-500 font-bold mb-1.5">
                    Chief Complaints:
                  </h4>
                  <div className="space-y-1.5">
                    {patient.symptoms.slice(0, 5).map((symptom, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${getSeverityColor(symptom.severity)}`} />
                        <span className="text-xs text-ink-700 dark:text-slate-300 font-medium">
                          {symptom.name}
                        </span>
                        <span className={`text-[10px] uppercase ${getSeverityColor(symptom.severity)}`}>
                          ({symptom.severity})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Prescription Details - Compact */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-ink-100 dark:border-slate-700 p-3 shadow-sm transition-colors duration-300">
              <h4 className="text-md font-bold text-ink-900 dark:text-parchment-100 mb-2 flex items-center gap-1.5 transition-colors duration-300">
                <span className="text-base">📋</span>
                Prescription Details
              </h4>

              <div className="space-y-2">
                {/* Medicine - Compact */}
                <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors duration-300">
                  <div className="text-2xl">{prescriptionData.item?.emoji || '🍵'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-ink-900 dark:text-parchment-100 transition-colors duration-300 truncate">
                      {prescriptionData.item?.name}
                    </div>
                    {prescriptionData.item?.spanishName && (
                      <div className="text-[10px] italic text-ink-600 dark:text-slate-400 transition-colors duration-300 truncate">
                        ({prescriptionData.item.spanishName})
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid - Compact */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-2 bg-parchment-50 dark:bg-slate-900/50 rounded-lg border border-ink-100 dark:border-slate-700 transition-colors duration-300">
                    <div className="text-[10px] text-ink-500 dark:text-slate-500 font-semibold mb-0.5">Amount</div>
                    <div className="text-sm font-bold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                      {prescriptionData.amount} dr
                    </div>
                  </div>
                  <div className="p-2 bg-parchment-50 dark:bg-slate-900/50 rounded-lg border border-ink-100 dark:border-slate-700 transition-colors duration-300">
                    <div className="text-[10px] text-ink-500 dark:text-slate-500 font-semibold mb-0.5">Price</div>
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400 transition-colors duration-300">
                      {prescriptionData.price}R
                    </div>
                  </div>
                </div>

                {/* Route - Compact */}
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors duration-300">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mb-0.5">Route</div>
                  <div className="text-sm font-bold text-emerald-900 dark:text-emerald-300 transition-colors duration-300">
                    {prescriptionData.route}
                  </div>
                </div>
              </div>
            </div>

            {/* Mechanics Breakdown (if available) - Compact */}
            {mechanicsBreakdown && (
              <details className="bg-white dark:bg-slate-800 rounded-lg border border-ink-100 dark:border-slate-700 overflow-hidden shadow-sm transition-colors duration-300">
                <summary className="p-2.5 cursor-pointer hover:bg-parchment-50 dark:hover:bg-slate-700/50 transition-colors">
                  <h4 className="text-md font-bold text-ink-900 dark:text-parchment-100 inline-flex items-center gap-1.5">
                    <span className="text-base">⚗️</span>
                    Mechanics Breakdown
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{
                      background: mechanicsBreakdown.effectiveness >= 75
                        ? 'rgba(22, 163, 74, 0.15)'
                        : mechanicsBreakdown.effectiveness >= 50
                        ? 'rgba(234, 179, 8, 0.15)'
                        : 'rgba(220, 38, 38, 0.15)',
                      color: mechanicsBreakdown.effectiveness >= 75
                        ? '#15803d'
                        : mechanicsBreakdown.effectiveness >= 50
                        ? '#ca8a04'
                        : '#991b1b'
                    }}>
                      {mechanicsBreakdown.effectiveness}%
                    </span>
                  </h4>
                </summary>

                <div className="p-2.5 space-y-2 border-t border-ink-100 dark:border-slate-700 bg-parchment-50 dark:bg-slate-900/30">
                  {/* Humoral Matching - Compact */}
                  {mechanicsBreakdown.breakdown?.humoralScore > 0 && (
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-[10px] font-bold text-purple-700 dark:text-purple-400 mb-1">
                        Humoral Theory (+{mechanicsBreakdown.breakdown.humoralScore} pts)
                      </div>
                      <ul className="space-y-0.5 text-[10px] text-purple-900 dark:text-purple-300 pl-3 list-disc">
                        {mechanicsBreakdown.breakdown.humoralExplanations.map((exp, idx) => (
                          <li key={idx}>{exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Route Appropriateness - Compact */}
                  {mechanicsBreakdown.breakdown?.routeBonus !== 0 && (
                    <div className={`p-2 rounded-lg border ${
                      mechanicsBreakdown.breakdown.routeBonus > 0
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <div className={`text-[10px] font-bold mb-0.5 ${
                        mechanicsBreakdown.breakdown.routeBonus > 0
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}>
                        Route: {mechanicsBreakdown.breakdown.routeBonus > 0 ? '+' : ''}{mechanicsBreakdown.breakdown.routeBonus} pts
                      </div>
                      <div className={`text-[10px] ${
                        mechanicsBreakdown.breakdown.routeBonus > 0
                          ? 'text-green-900 dark:text-green-300'
                          : 'text-red-900 dark:text-red-300'
                      }`}>
                        {mechanicsBreakdown.breakdown.routeExplanation}
                      </div>
                    </div>
                  )}

                  {/* Dosage Warning - Compact */}
                  {mechanicsBreakdown.breakdown?.dosageWarning && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="text-[10px] text-yellow-900 dark:text-yellow-300">
                        {mechanicsBreakdown.breakdown.dosageWarning}
                      </div>
                    </div>
                  )}

                  {/* Toxicity Warning - Compact */}
                  {mechanicsBreakdown.breakdown?.toxicityWarning && (
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-500 dark:border-red-700">
                      <div className="text-[10px] font-bold text-red-900 dark:text-red-300">
                        {mechanicsBreakdown.breakdown.toxicityWarning}
                      </div>
                    </div>
                  )}

                  {/* Matched Symptoms - Compact */}
                  {mechanicsBreakdown.breakdown?.directMatches?.length > 0 && (
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">
                        Matched Symptoms:
                      </div>
                      <div className="text-[10px] text-emerald-900 dark:text-emerald-300">
                        {mechanicsBreakdown.breakdown.directMatches.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Mismatches - Compact */}
                  {mechanicsBreakdown.breakdown?.mismatches?.length > 0 && (
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-[10px] font-bold text-orange-700 dark:text-orange-400 mb-0.5">
                        Warnings:
                      </div>
                      <ul className="space-y-0.5 text-[10px] text-orange-900 dark:text-orange-300 pl-3 list-disc">
                        {mechanicsBreakdown.breakdown.mismatches.map((mis, idx) => (
                          <li key={idx}>{mis}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Diagnosis (if available) - Compact */}
            {patient.diagnosis && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-ink-100 dark:border-slate-700 p-3 shadow-sm transition-colors duration-300">
                <h4 className="text-xs font-bold text-ink-900 dark:text-parchment-100 mb-1.5 flex items-center gap-1.5 transition-colors duration-300">
                  <span className="text-base">🩺</span>
                  Your Diagnosis
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold transition-colors duration-300">
                  {patient.diagnosis}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Outcome Narrative */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-white dark:bg-slate-800/50 transition-colors duration-300">
            <div className="prose text-lg prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => (
                    <h3 className="text-2xl font-bold text-ink-900 dark:text-parchment-100 mb-4 mt-0 font-serif transition-colors duration-300" {...props} />
                  ),
                  h5: ({ node, ...props }) => (
                    <h5 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 mt-0 font-serif transition-colors duration-300" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-md  text-ink-700 dark:text-slate-300 leading-relaxed mb-4 font-sans transition-colors duration-300" {...props} />
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

        {/* Footer with Continue Button - Compact */}
        <div className="flex items-center justify-end gap-2 p-3 border-t border-ink-100 dark:border-slate-700 bg-parchment-50 dark:bg-slate-900/30 transition-colors duration-300">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-ink-900 dark:text-parchment-100 border border-gray-300 dark:border-slate-600"
          >
            Close
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-blue-700 flex items-center gap-1.5"
          >
            Continue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
