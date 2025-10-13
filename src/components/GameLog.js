import React from 'react';

const GameLog = ({ isOpen, onClose, conversationHistory = [], turnNumber }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-parchment-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink-200 flex items-center justify-between flex-shrink-0">
          <h2 className="font-display text-2xl font-bold text-ink-900">📜 Game Log</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-ink-900 text-parchment-50 rounded-lg hover:bg-ink-800 transition-colors text-sm font-semibold"
          >
            Close
          </button>
        </div>

        {/* Stats Summary */}
        <div className="px-6 py-3 bg-botanical-50 border-b border-botanical-200 flex-shrink-0">
          <div className="flex items-center space-x-6 text-sm font-serif">
            <span className="text-ink-700">
              <span className="font-semibold">Turn:</span> {turnNumber}
            </span>
            <span className="text-ink-700">
              <span className="font-semibold">Total Actions:</span> {conversationHistory.length}
            </span>
          </div>
        </div>

        {/* Log Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
          <div className="space-y-4">
            {conversationHistory.map((entry, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  entry.role === 'user'
                    ? 'bg-botanical-50 border-botanical-600'
                    : 'bg-parchment-100 border-ink-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-ink-700 font-serif">
                    {entry.role === 'user' ? '👤 Player Action' : '📜 Narrative Response'}
                  </span>
                  <span className="text-xs text-ink-500 font-serif">
                    Turn {index + 1}
                  </span>
                </div>
                <div className="text-base text-ink-800 font-serif leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-ink-200 bg-parchment-100 flex-shrink-0">
          <p className="text-sm text-ink-600 font-serif italic">
            This is a complete record of your journey through 1680s Mexico City.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameLog;
