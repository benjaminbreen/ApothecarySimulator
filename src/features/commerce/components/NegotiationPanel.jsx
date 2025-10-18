/**
 * Negotiation Panel Component
 *
 * Bottom panel for price negotiation when selling to NPCs
 */

import React, { useState } from 'react';

export default function NegotiationPanel({
  item,
  suggestedPrice,
  onPropose,
  onCancel,
  negotiationHistory = [],
  isNegotiating = false
}) {
  const [proposedPrice, setProposedPrice] = useState(suggestedPrice);
  const isDark = document.documentElement.classList.contains('dark');

  const handlePropose = () => {
    if (proposedPrice > 0 && !isNegotiating) {
      onPropose(proposedPrice);
    }
  };

  return (
    <div
      className="border-t p-6"
      style={{
        background: isDark
          ? 'linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))'
          : 'linear-gradient(to top, rgba(248, 246, 241, 0.95), rgba(252, 250, 247, 0.9))',
        borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-6">
          {/* Item Details */}
          <div className="flex-1">
            <h3 className={`text-xl font-bold font-serif mb-2 ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
              {item.name}
            </h3>
            <p className={`text-sm font-sans mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {item.description || item.origin || 'Negotiate a price for this item.'}
            </p>

            {/* Negotiation History */}
            {negotiationHistory.length > 0 && (
              <div
                className="mt-3 p-3 rounded-lg text-sm max-h-32 overflow-y-auto"
                style={{
                  background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                }}
              >
                {negotiationHistory.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 last:mb-0 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    <span className="font-semibold">{entry.speaker}:</span> {entry.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Negotiation Controls */}
          <div className="w-80 space-y-3">
            {/* Suggested Price Display */}
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.25)'
              }}
            >
              <div className={`text-xs font-sans font-semibold uppercase tracking-wide mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Suggested Price
              </div>
              <div className={`text-2xl font-bold font-mono ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                {suggestedPrice} reales
              </div>
            </div>

            {/* Your Asking Price */}
            <div>
              <label className={`block text-xs font-sans font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Your Asking Price
              </label>
              <input
                type="number"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(Number(e.target.value))}
                min="1"
                className={`w-full px-4 py-2 rounded-lg font-mono text-lg border ${
                  isDark
                    ? 'bg-slate-800 border-slate-600 text-parchment-100'
                    : 'bg-white border-gray-300 text-ink-900'
                }`}
                disabled={isNegotiating}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handlePropose}
                disabled={isNegotiating || proposedPrice <= 0}
                className="flex-1 px-4 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isNegotiating ? 'Negotiating...' : 'Propose Price'}
              </button>
              <button
                onClick={onCancel}
                disabled={isNegotiating}
                className={`px-4 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-200 ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
