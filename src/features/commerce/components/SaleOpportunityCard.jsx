/**
 * SaleOpportunityCard - Displays NPC trade opportunities in narrative panel
 *
 * Appears when NPCs express interest in buying/selling items during conversation.
 * Styled to match existing parchment/glassomorphic aesthetic.
 */

import React from 'react';

export default function SaleOpportunityCard({
  opportunity,
  onAccept,
  onDecline,
  isDark = false
}) {
  if (!opportunity) return null;

  const {
    npcName,
    npcPortrait,
    type, // 'buy' | 'sell' | 'both'
    interest, // { items, reason, urgency, priceMultiplier }
    offering, // { items: [{ name, quantity, price }] }
    context
  } = opportunity;

  // Determine urgency stars
  const urgencyLevel = interest?.urgency || 'moderate';
  const urgencyStars = {
    'low': '⭐',
    'moderate': '⭐⭐⭐',
    'high': '⭐⭐⭐⭐⭐'
  }[urgencyLevel] || '⭐⭐⭐';

  // Card icon based on type
  const cardIcon = type === 'buy' ? '💰' : type === 'sell' ? '🛒' : '🤝';

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg animate-slide-in-right"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.92) 50%, rgba(0, 0, 0, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.95) 100%)',
        backdropFilter: 'blur(12px) saturate(120%)',
        WebkitBackdropFilter: 'blur(12px) saturate(120%)',
        border: isDark
          ? '2px solid rgba(245, 158, 11, 0.3)'
          : '2px solid rgba(245, 158, 11, 0.4)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 8px 32px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08))'
            : 'linear-gradient(to bottom, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.06))',
          borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.25)'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cardIcon}</span>
          <h3
            className="text-sm font-bold uppercase tracking-wider font-sans"
            style={{
              color: '#d97706',
              letterSpacing: '0.08em'
            }}
          >
            {type === 'buy' ? 'Sale Opportunity' : type === 'sell' ? 'Purchase Opportunity' : 'Trade Opportunity'}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* NPC Info */}
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
                alt={npcName}
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
                🧑‍🤝‍🧑
              </div>
            </div>
          )}

          {/* NPC Name & Context */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-lg font-bold font-serif mb-1 ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
              {npcName}
            </h4>
            {context && (
              <p className={`text-sm font-sans italic ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {context}
              </p>
            )}
          </div>
        </div>

        {/* Trade Details */}
        {type === 'buy' && interest && (
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
              Wants to Buy:
            </p>
            <ul className="space-y-1">
              {interest.items.map((item, idx) => (
                <li key={idx} className={`text-sm font-sans ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                  • {item}
                </li>
              ))}
            </ul>
            {interest.priceMultiplier && interest.priceMultiplier > 1 && (
              <p className={`text-sm font-bold font-sans mt-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                Offering {Math.round((interest.priceMultiplier - 1) * 100)}% above market price
              </p>
            )}
          </div>
        )}

        {type === 'sell' && offering && (
          <div
            className="rounded-lg p-3"
            style={{
              background: isDark
                ? 'rgba(59, 130, 246, 0.08)'
                : 'rgba(59, 130, 246, 0.06)',
              border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.25)'
            }}
          >
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 font-sans ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              Offering for Sale:
            </p>
            <ul className="space-y-1">
              {offering.items.map((item, idx) => (
                <li key={idx} className={`text-sm font-sans ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  • {item.name} ({item.quantity}x) - {item.price} reales
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reason & Urgency */}
        {interest?.reason && (
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
              "{interest.reason}"
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-bold uppercase tracking-wider font-sans ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                Urgency:
              </span>
              <span className="text-sm">{urgencyStars}</span>
              <span className={`text-xs font-sans ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                ({urgencyLevel})
              </span>
            </div>
          </div>
        )}
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
          onClick={onAccept}
          className="flex-1 px-4 py-2.5 rounded-lg font-sans font-bold text-sm transition-all duration-200 hover:transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          Open Trade
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
          Not Now
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
