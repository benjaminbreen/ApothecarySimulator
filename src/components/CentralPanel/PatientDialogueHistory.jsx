import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * PatientDialogueHistory - reusable list of question/answer exchanges.
 *
 * @param {Array} entries - Dialogue array [{ question, answer, timestamp }]
 * @param {string} emptyLabel - Message when there are no entries
 * @param {string} className - Optional wrapper classes
 * @param {number} maxItems - Optional limit on number of entries to show
 */
export function PatientDialogueHistory({
  entries = [],
  emptyLabel = 'No questions yet',
  className = '',
  maxItems = null
}) {
  if (!entries || entries.length === 0) {
    return (
      <p className={`text-xs text-ink-500 dark:text-slate-400 italic text-center py-2 ${className}`}>
        {emptyLabel}
      </p>
    );
  }

  const items = maxItems ? entries.slice(0, maxItems) : entries;

  const renderTimestamp = (timestamp) => {
    if (!timestamp) return null;
    const dateObj = new Date(timestamp);
    if (Number.isNaN(dateObj.getTime())) return null;
    const timePart = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dayPart = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dayPart} • ${timePart}`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((entry, idx) => (
        <div
          key={`${entry.question}-${idx}`}
          className="bg-white/70 dark:bg-slate-800/60 border border-ink-100 dark:border-slate-600 rounded-lg p-3 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Q: "{entry.question}"
            </div>
            {renderTimestamp(entry.timestamp) && (
              <div className="text-[10px] uppercase tracking-wide text-ink-400 dark:text-slate-500">
                {renderTimestamp(entry.timestamp)}
              </div>
            )}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-ink-500 dark:text-slate-400 font-semibold mb-1">
            Patient Response
          </div>
          <div className="text-sm leading-relaxed text-ink-900 dark:text-slate-200 font-serif prose prose-sm max-w-none">
            <ReactMarkdown>{entry.answer}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PatientDialogueHistory;
