import React from 'react';

/**
 * EffectsTab Component
 * Displays active effects from meals, rest, and conditions
 */
export function EffectsTab({ activeEffects = [] }) {
  return (
    <div className="space-y-3 animate-fade-in-up">
      {activeEffects.length > 0 ? (
        activeEffects.map((effect, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-botanical-50 to-white rounded-xl p-4 border border-botanical-200 hover:border-botanical-300 transition-all duration-base shadow-elevation-1 hover:shadow-elevation-2"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">{effect.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-ink-900 font-serif mb-1">
                  {effect.name}
                </h4>
                <p className="text-sm text-ink-700 font-serif leading-relaxed mb-1">
                  {effect.description}
                </p>
                {effect.duration && (
                  <div className="flex items-center gap-1.5 text-xs text-ink-500 font-sans">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{effect.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-20">✨</div>
          <p className="text-base text-ink-500 font-sans font-medium">No active effects</p>
          <p className="text-sm text-ink-400 font-sans mt-1">Effects from meals, rest, and conditions appear here</p>
        </div>
      )}
    </div>
  );
}
