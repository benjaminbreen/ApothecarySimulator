import React from 'react';

/**
 * Treatment timeline with Swiss design principles
 * Precise typography, clean layout, functional color use
 */
export default function TreatmentTimeline({ treatments = [] }) {
  if (treatments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-ink-400 mb-3">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-sans text-ink-600 tracking-wide" style={{ letterSpacing: '0.02em' }}>
          NO TREATMENT HISTORY
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {treatments.map((treatment, index) => {
        const isPlayer = treatment.practitioner.isPlayer;
        const isLast = index === treatments.length - 1;

        return (
          <div key={index} className="relative">
            {/* Timeline connector */}
            {!isLast && (
              <div className="absolute left-[9px] top-[32px] bottom-[-16px] w-px bg-ink-200" />
            )}

            {/* Treatment entry */}
            <div className="flex gap-4 pb-6">
              {/* Timeline dot */}
              <div className="flex-shrink-0 pt-1">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isPlayer
                      ? 'bg-botanical-500 border-botanical-600'
                      : 'bg-white border-ink-300'
                  }`}
                >
                  {isPlayer && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Content - Swiss grid layout */}
              <div className="flex-1 min-w-0">
                {/* Header row - precise typography */}
                <div className="mb-2">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <h4 className="font-sans font-bold text-sm text-ink-900" style={{ letterSpacing: '0.01em' }}>
                      {treatment.practitioner.name}
                      {isPlayer && (
                        <span className="ml-2 px-2 py-0.5 bg-botanical-100 text-botanical-700 text-xs font-semibold rounded" style={{ letterSpacing: '0.03em' }}>
                          YOU
                        </span>
                      )}
                    </h4>
                    <time className="text-xs font-sans text-ink-500 tracking-wide flex-shrink-0" style={{ letterSpacing: '0.02em' }}>
                      {treatment.date}
                    </time>
                  </div>

                  <p className="text-xs font-sans text-ink-600 uppercase tracking-wider" style={{ letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                    {treatment.practitioner.education}
                  </p>
                </div>

                {/* Treatment details - organized grid */}
                <div className="space-y-2">
                  {/* Treatment name */}
                  <div className="bg-gradient-to-r from-parchment-50 to-white border-l-2 border-botanical-400 pl-3 pr-3 py-2">
                    <dt className="text-xs font-sans font-semibold text-ink-500 uppercase tracking-wide mb-0.5" style={{ letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                      Treatment
                    </dt>
                    <dd className="text-sm font-serif text-ink-900 leading-snug">
                      {treatment.treatment.name}
                    </dd>
                  </div>

                  {/* Method */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="font-sans font-semibold text-ink-500 uppercase tracking-wide mb-1" style={{ letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                        Method
                      </dt>
                      <dd className="font-serif text-ink-800 leading-relaxed">
                        {treatment.treatment.method}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-sans font-semibold text-ink-500 uppercase tracking-wide mb-1" style={{ letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                        Theory
                      </dt>
                      <dd className="font-serif text-ink-800 leading-relaxed">
                        {treatment.treatment.theory}
                      </dd>
                    </div>
                  </div>

                  {/* Outcome - emphasized */}
                  <div className="bg-ink-50 border border-ink-200 rounded px-3 py-2">
                    <dt className="text-xs font-sans font-semibold text-ink-500 uppercase tracking-wide mb-1" style={{ letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                      Outcome
                    </dt>
                    <dd className="text-sm font-serif text-ink-900 leading-snug">
                      {treatment.outcome}
                    </dd>
                  </div>

                  {/* Notes if present */}
                  {treatment.notes && (
                    <div className="text-xs font-serif text-ink-600 italic pl-3 border-l border-ink-200">
                      {treatment.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
