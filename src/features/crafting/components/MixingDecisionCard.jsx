/**
 * MixingDecisionCard - Prompts player to craft remedy
 *
 * Appears after pursuing a sale inquiry, before opening mixing workshop.
 * Gives player final chance to craft or abandon the opportunity.
 * Styled to match glassomorphic/parchment aesthetic.
 */

import React from 'react';

export default function MixingDecisionCard({
  mixingContext,
  onOpenMixing,
  onDecline,
  isDark = false
}) {
  if (!mixingContext) return null;

  const {
    customerName,
    customerDescription,
    patientName,
    ailmentDescription,
    paymentOffered,
    npcPortrait
  } = mixingContext;

  const hasPayment = paymentOffered && paymentOffered > 0;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg animate-slide-in-right mb-4"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.92) 50%, rgba(0, 0, 0, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.95) 100%)',
        backdropFilter: 'blur(12px) saturate(120%)',
        WebkitBackdropFilter: 'blur(12px) saturate(120%)',
        border: isDark
          ? '2px solid rgba(16, 185, 129, 0.3)'
          : '2px solid rgba(16, 185, 129, 0.4)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 8px 32px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))'
            : 'linear-gradient(to bottom, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.06))',
          borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.25)'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚗️</span>
          <h3
            className="text-sm font-bold uppercase tracking-wider font-sans"
            style={{
              color: '#10b981',
              letterSpacing: '0.08em'
            }}
          >
            Craft Remedy
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Customer Info */}
        <div className="flex items-start gap-3">
          {/* Portrait */}
          {npcPortrait && (
            <div
              className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95), rgba(30, 41, 59, 0.9))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                border: isDark ? '2px solid rgba(71, 85, 105, 0.3)' : '2px solid rgba(209, 213, 219, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <img
                src={npcPortrait}
                alt={customerName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="w-full h-full items-center justify-center text-3xl"
                style={{ display: 'none' }}
              >
                🧑‍⚕️
              </div>
            </div>
          )}

          {/* Customer Name & Description */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-lg font-bold font-serif mb-1 ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
              {customerName}
            </h4>
            {customerDescription && (
              <p className={`text-sm font-sans italic ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {customerDescription}
              </p>
            )}
          </div>
        </div>

        {/* Request Summary */}
        <div
          className="rounded-lg p-3"
          style={{
            background: isDark
              ? 'rgba(16, 185, 129, 0.08)'
              : 'rgba(16, 185, 129, 0.06)',
            border: isDark ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(16, 185, 129, 0.25)'
          }}
        >
          <p className={`text-xs font-bold uppercase tracking-wider mb-2 font-sans ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Request Summary:
          </p>
          <div className="space-y-1">
            <p className={`text-sm font-sans ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
              <span className="font-bold">Patient:</span> {patientName || customerName}
            </p>
            <p className={`text-sm font-sans ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
              <span className="font-bold">Ailment:</span> {ailmentDescription}
            </p>
            {hasPayment && (
              <p className={`text-sm font-sans ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                <span className="font-bold">Payment:</span> {paymentOffered} reales
              </p>
            )}
          </div>
        </div>

        {/* Workshop Prompt */}
        <div
          className="rounded-lg p-3"
          style={{
            background: isDark
              ? 'rgba(245, 158, 11, 0.08)'
              : 'rgba(245, 158, 11, 0.06)',
            border: isDark ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(245, 158, 11, 0.25)'
          }}
        >
          <p className={`text-sm font-serif italic ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
            You've agreed to help. Now you must craft an appropriate remedy using the materials in your workshop.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="px-4 py-3 border-t flex gap-3"
        style={{
          background: isDark
            ? 'linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))'
            : 'linear-gradient(to top, rgba(248, 246, 241, 0.95), rgba(252, 250, 247, 0.9))',
          borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
        }}
      >
        <button
          onClick={onOpenMixing}
          className="flex-1 px-4 py-2.5 rounded-lg font-sans font-bold text-sm transition-all duration-200 hover:transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          Open Workshop
        </button>
        <button
          onClick={onDecline}
          className={`px-4 py-2.5 rounded-lg font-sans font-semibold text-sm transition-all duration-200 ${
            isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'
          }`}
          style={{
            background: isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(229, 231, 235, 0.6)',
            color: isDark ? '#cbd5e1' : '#4b5563',
            border: isDark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(209, 213, 219, 0.5)'
          }}
        >
          Abandon
        </button>
      </div>

      {/* Slide-in animation */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
