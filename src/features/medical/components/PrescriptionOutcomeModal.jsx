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
 * Returns both the score and the text with score removed
 */
function parseOutcomeScore(outcomeText) {
  if (!outcomeText) return { score: null, cleanedText: outcomeText };

  // Match patterns like:
  // "Score: 8/10" or "**Score: 8/10**" or "Rating: 8/10"
  // "8/10" or "**8/10**"
  const scorePatterns = [
    /(?:Score|Rating):\s*\*{0,2}(\d+)\/10\*{0,2}/gi,
    /\*{0,2}(\d+)\/10\*{0,2}/g,
  ];

  let score = null;
  let cleanedText = outcomeText;

  for (const pattern of scorePatterns) {
    const match = outcomeText.match(pattern);
    if (match && !score) {
      const scoreMatch = match[0].match(/(\d+)/);
      if (scoreMatch) {
        const parsedScore = parseInt(scoreMatch[1], 10);
        if (parsedScore >= 0 && parsedScore <= 10) {
          score = parsedScore;
          // Remove the score text from the narrative
          cleanedText = cleanedText.replace(pattern, '').trim();
          // Clean up any double line breaks left behind
          cleanedText = cleanedText.replace(/\n\n\n+/g, '\n\n');
        }
      }
    }
  }

  return { score, cleanedText };
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
  const { score: outcomeScore, cleanedText: narrativeText } = parseOutcomeScore(outcome);
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

              {/* Symptoms List - Tags/Chips */}
              {patient.symptoms && patient.symptoms.length > 0 && (
                <div className="p-3 border-t border-ink-100 dark:border-slate-700 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-slate-900/30 dark:to-slate-800/30">
                  <h4 className="text-xs uppercase tracking-wider text-ink-600 dark:text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Chief Complaints
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.symptoms.slice(0, 5).map((symptom, idx) => {
                      const severityStyles = symptom.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300' :
                                            symptom.severity === 'severe' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' :
                                            symptom.severity === 'moderate' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400' :
                                            symptom.severity === 'mild' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400' :
                                            'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400';

                      return (
                        <div key={idx} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${severityStyles} text-xs font-medium transition-colors duration-300`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${getSeverityColor(symptom.severity)}`} />
                          <span>{symptom.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Prescription Details - Historical Document Style */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border-2 border-amber-300 dark:border-amber-800 p-4 shadow-lg transition-colors duration-300">
              {/* Header with decorative ℞ */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-amber-300/50 dark:border-amber-700/50">
                <h4 className="text-lg font-bold text-amber-900 dark:text-amber-200 font-serif flex items-center gap-2">
                  <span className="text-2xl">℞</span>
                  Prescription Written
                </h4>
                <div className="text-xs text-amber-700 dark:text-amber-400 font-serif italic">
                  Anno Domini 1680
                </div>
              </div>

              <div className="space-y-3">
                {/* Medicine - Featured */}
                <div className="bg-white/60 dark:bg-slate-900/40 rounded-lg p-3 border border-amber-400/50 dark:border-amber-700/50 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl flex-shrink-0">{prescriptionData.item?.emoji || '🍵'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base text-ink-900 dark:text-parchment-100 font-serif transition-colors duration-300">
                        {prescriptionData.item?.name}
                      </div>
                      {prescriptionData.item?.spanishName && (
                        <div className="text-xs italic text-amber-800 dark:text-amber-400 font-serif transition-colors duration-300">
                          {prescriptionData.item.spanishName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Decorative separator */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 dark:via-amber-700 to-transparent"></div>
                  <div className="text-amber-600 dark:text-amber-500 text-xs">⚕</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 dark:via-amber-700 to-transparent"></div>
                </div>

                {/* Prescription Details with Icons */}
                <div className="space-y-2 font-serif">
                  {/* Dosage */}
                  <div className="flex items-center gap-2 p-2 bg-white/40 dark:bg-slate-900/30 rounded border border-amber-300/50 dark:border-amber-800/50">
                    <svg className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <div className="flex-1 text-sm">
                      <span className="text-amber-800 dark:text-amber-400 font-semibold">Dosage:</span>
                      <span className="ml-1.5 text-ink-900 dark:text-parchment-100 font-bold">{prescriptionData.amount} drachms</span>
                    </div>
                  </div>

                  {/* Route of Administration */}
                  <div className="flex items-center gap-2 p-2 bg-white/40 dark:bg-slate-900/30 rounded border border-amber-300/50 dark:border-amber-800/50">
                    <svg className="w-4 h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 text-sm">
                      <span className="text-emerald-800 dark:text-emerald-400 font-semibold">Route:</span>
                      <span className="ml-1.5 text-ink-900 dark:text-parchment-100 font-bold capitalize">{prescriptionData.route}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 p-2 bg-white/40 dark:bg-slate-900/30 rounded border border-amber-300/50 dark:border-amber-800/50">
                    <svg className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 text-sm">
                      <span className="text-amber-800 dark:text-amber-400 font-semibold">Fee:</span>
                      <span className="ml-1.5 text-amber-900 dark:text-amber-300 font-bold">{prescriptionData.price} reales</span>
                    </div>
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
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-slate-800/50 transition-colors duration-300">
            {/* Score Header - Enhanced with Stars and Progress Bar */}
            {outcomeScore !== null && (
              <div className={`mb-6 rounded-xl p-6 border-2 bg-gradient-to-br ${theme.headerGradient} transition-all duration-300 shadow-lg`}
                style={{
                  borderColor: outcomeScore <= 3 ? '#991b1b' :
                              outcomeScore <= 5 ? '#d97706' :
                              outcomeScore <= 6 ? '#ca8a04' :
                              outcomeScore <= 8 ? '#15803d' : '#059669'
                }}
              >
                <div className="space-y-4">
                  {/* Top Row - Emoji, Score, Label */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-6xl drop-shadow-lg">{theme.emoji}</div>
                      <div>
                        <div className={`text-xs font-semibold uppercase tracking-wider ${theme.subtitleColor} mb-1 transition-colors duration-300`}>
                          Treatment Outcome
                        </div>
                        <div className={`text-5xl font-bold font-serif ${theme.titleColor} transition-colors duration-300`}>
                          {outcomeScore}/10
                        </div>
                      </div>
                    </div>
                    <div className={`px-4 py-2.5 rounded-lg font-bold text-sm ${theme.titleColor} transition-colors duration-300 shadow-md`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {theme.label}
                    </div>
                  </div>

                  {/* Star Rating Visualization */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = outcomeScore >= star * 2;
                      const isHalfFilled = outcomeScore >= (star * 2 - 1) && outcomeScore < star * 2;

                      return (
                        <svg
                          key={star}
                          className={`w-8 h-8 transition-all duration-300 ${isFilled || isHalfFilled ? 'drop-shadow-md' : ''}`}
                          fill={isFilled ? 'currentColor' : isHalfFilled ? 'url(#half)' : 'none'}
                          stroke="currentColor"
                          strokeWidth={isFilled || isHalfFilled ? 0 : 2}
                          viewBox="0 0 24 24"
                          style={{
                            color: isFilled || isHalfFilled ?
                              (outcomeScore <= 3 ? '#fca5a5' :
                               outcomeScore <= 5 ? '#fdba74' :
                               outcomeScore <= 6 ? '#fde047' :
                               outcomeScore <= 8 ? '#86efac' : '#6ee7b7') :
                              'rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          <defs>
                            <linearGradient id="half">
                              <stop offset="50%" stopColor="currentColor" />
                              <stop offset="50%" stopColor="transparent" />
                            </linearGradient>
                          </defs>
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      );
                    })}
                  </div>

                  {/* Progress Bar */}
                  <div className="relative w-full h-3 bg-white/20 dark:bg-black/20 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out shadow-lg"
                      style={{
                        width: `${outcomeScore * 10}%`,
                        background: outcomeScore <= 1 ? 'linear-gradient(to right, #1f2937, #111827)' :
                                   outcomeScore <= 3 ? 'linear-gradient(to right, #dc2626, #991b1b)' :
                                   outcomeScore <= 4 ? 'linear-gradient(to right, #ea580c, #c2410c)' :
                                   outcomeScore <= 5 ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                                   outcomeScore <= 6 ? 'linear-gradient(to right, #eab308, #ca8a04)' :
                                   outcomeScore <= 8 ? 'linear-gradient(to right, #22c55e, #16a34a)' :
                                   'linear-gradient(to right, #10b981, #059669)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>

                  {/* Percentage Label */}
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className={theme.subtitleColor}>{outcomeScore * 10}% Effective</span>
                    <span className={theme.subtitleColor}>
                      {outcomeScore <= 3 ? 'Poor' :
                       outcomeScore <= 5 ? 'Suboptimal' :
                       outcomeScore <= 6 ? 'Mediocre' :
                       outcomeScore <= 8 ? 'Good' : 'Excellent'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Narrative Text - Enhanced with Section Headers */}
            <div className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-ink-200 dark:via-slate-600 to-transparent"></div>
                <h3 className="text-sm uppercase tracking-widest font-bold text-ink-600 dark:text-slate-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Treatment Report
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-ink-200 dark:via-slate-600 to-transparent"></div>
              </div>

              {/* Narrative Container */}
              <div className={`rounded-xl p-6 border-2 transition-all duration-300 shadow-inner`}
                style={{
                  background: outcomeScore === null ? 'transparent' :
                             outcomeScore <= 1 ? 'linear-gradient(to bottom, rgba(17, 24, 39, 0.08), rgba(0, 0, 0, 0.03))' :
                             outcomeScore <= 3 ? 'linear-gradient(to bottom, rgba(127, 29, 29, 0.1), rgba(127, 29, 29, 0.04))' :
                             outcomeScore <= 4 ? 'linear-gradient(to bottom, rgba(185, 28, 28, 0.08), rgba(185, 28, 28, 0.03))' :
                             outcomeScore <= 5 ? 'linear-gradient(to bottom, rgba(217, 119, 6, 0.08), rgba(217, 119, 6, 0.03))' :
                             outcomeScore <= 6 ? 'linear-gradient(to bottom, rgba(202, 138, 4, 0.08), rgba(202, 138, 4, 0.03))' :
                             outcomeScore <= 8 ? 'linear-gradient(to bottom, rgba(21, 128, 61, 0.08), rgba(21, 128, 61, 0.03))' :
                             'linear-gradient(to bottom, rgba(5, 150, 105, 0.1), rgba(5, 150, 105, 0.04))',
                  borderColor: outcomeScore === null ? 'rgba(209, 213, 219, 0.4)' :
                              outcomeScore <= 3 ? 'rgba(153, 27, 27, 0.4)' :
                              outcomeScore <= 5 ? 'rgba(217, 119, 6, 0.4)' :
                              outcomeScore <= 6 ? 'rgba(202, 138, 4, 0.4)' :
                              outcomeScore <= 8 ? 'rgba(21, 128, 61, 0.4)' : 'rgba(5, 150, 105, 0.5)'
                }}
              >
                <div className="prose text-lg prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <div className="mb-5 pb-3 border-b-2 border-ink-200 dark:border-slate-700">
                          <h1 className="text-3xl font-bold text-ink-900 dark:text-parchment-100 font-serif transition-colors duration-300 flex items-center gap-2" {...props}>
                            <span className="text-2xl">📖</span>
                            {props.children}
                          </h1>
                        </div>
                      ),
                      h2: ({ node, ...props }) => (
                        <div className="mt-6 mb-4 pb-2 border-b border-ink-200 dark:border-slate-700">
                          <h2 className="text-2xl font-bold text-ink-900 dark:text-parchment-100 font-serif transition-colors duration-300" {...props} />
                        </div>
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-xl font-bold text-ink-900 dark:text-parchment-100 mb-3 mt-5 font-serif transition-colors duration-300 flex items-center gap-2" {...props}>
                          <span className="text-amber-600 dark:text-amber-400">▸</span>
                          {props.children}
                        </h3>
                      ),
                      h4: ({ node, ...props }) => (
                        <h4 className="text-lg font-semibold text-ink-800 dark:text-parchment-200 mb-2 mt-4 font-serif transition-colors duration-300" {...props} />
                      ),
                      h5: ({ node, ...props }) => (
                        <h5 className="text-base font-semibold text-ink-700 dark:text-parchment-300 mb-2 mt-3 transition-colors duration-300" {...props} />
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
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc list-inside space-y-2 my-4 text-ink-700 dark:text-slate-300" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-inside space-y-2 my-4 text-ink-700 dark:text-slate-300" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="text-base leading-relaxed ml-2" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-amber-400 dark:border-amber-600 pl-4 italic my-4 text-ink-600 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-900/10 py-2 rounded-r" {...props} />
                      ),
                    }}
                  >
                    {narrativeText || outcome}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Continue Button - Enhanced */}
        <div className="flex items-center justify-between gap-3 p-4 border-t-2 border-ink-200 dark:border-slate-700 bg-gradient-to-r from-parchment-50 via-parchment-100 to-parchment-50 dark:from-slate-900/50 dark:via-slate-900/30 dark:to-slate-900/50 transition-colors duration-300">
          {/* Left side - decorative info */}
          <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Prescription Recorded</span>
          </div>

          {/* Right side - action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-ink-700 dark:text-parchment-200 border-2 border-ink-200 dark:border-slate-600 hover:border-ink-300 dark:hover:border-slate-500 shadow-sm hover:shadow"
            >
              Close
            </button>
            <button
              onClick={onContinue}
              className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 border-2 border-blue-800 dark:border-blue-600 flex items-center gap-2 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="relative">Continue</span>
              <svg className="w-4 h-4 relative transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document root (above all other UI)
  return ReactDOM.createPortal(modalContent, document.body);
}

export default PrescriptionOutcomeModal;
