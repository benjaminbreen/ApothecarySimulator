import React, { useState } from 'react';

/**
 * Expandable card for educational historical context
 * Fully scenario-agnostic - works with any historical content
 */
export default function HistoricalContextCard({
  title,
  icon = '📜',
  summary,
  content,
  source,
  defaultExpanded = false
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-gradient-to-br from-parchment-100 to-white rounded-xl border-2 border-botanical-200 overflow-hidden transition-all duration-base hover:border-botanical-400 hover:shadow-elevation-2">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-botanical-50 transition-colors duration-fast"
      >
        {/* Icon */}
        <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-bold text-ink-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-ink-700 font-serif leading-relaxed">
            {summary}
          </p>
        </div>

        {/* Expand chevron */}
        <svg
          className={`w-5 h-5 text-botanical-600 flex-shrink-0 transition-transform duration-base ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      <div
        className="overflow-hidden transition-all duration-base"
        style={{
          maxHeight: isExpanded ? '500px' : '0',
          opacity: isExpanded ? 1 : 0
        }}
      >
        <div className="px-4 pb-4 pt-2 border-t border-botanical-200 bg-white/50">
          {/* Full explanation */}
          <p className="text-sm text-ink-800 font-serif leading-relaxed mb-3">
            {content}
          </p>

          {/* Source citation */}
          {source && (
            <p className="text-xs text-ink-500 font-sans italic border-l-2 border-botanical-300 pl-3">
              {source}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
