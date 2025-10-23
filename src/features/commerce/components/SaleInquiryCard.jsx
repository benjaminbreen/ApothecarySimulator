/**
 * SaleInquiryCard - Displays remedy sale requests in narrative panel
 *
 * Appears when NPCs request a remedy that doesn't exist yet (needs crafting).
 * First step in the sale pipeline: Pursue → Mix → Sell → Trade Modal
 * Compact style matching SimpleInteractionCard.
 */

import React from 'react';

export default function SaleInquiryCard({
  inquiry,
  onPursue,
  onDecline,
  isDark = false
}) {
  if (!inquiry || inquiry.type !== 'sale_inquiry') return null;

  const {
    offeredBy,
    offeredByDescription,
    patientName,
    patientDescription,
    paymentOffered,
    ailmentDescription,
    npcPortrait // Added by orchestrator from primaryPortraitFile
  } = inquiry;

  // Purple color scheme to distinguish from other interaction types
  const colors = {
    gradient: 'from-purple-500/90 to-purple-600',
    darkGradient: 'dark:from-purple-700 dark:to-purple-800',
    border: 'border-purple-400/20',
    darkBorder: 'dark:border-purple-600/30',
    textSecondary: 'text-purple-100',
    darkTextSecondary: 'dark:text-purple-200',
    buttonPrimary: 'bg-white hover:bg-purple-50 text-purple-600',
    buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white',
    icon: '💊'
  };

  return (
    <div className="animate-fade-in mb-4">
      <div className={`w-full p-4 bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder}`}>
        <div className="flex items-center gap-3">
          {/* NPC Portrait */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
            {npcPortrait ? (
              <img
                src={npcPortrait}
                alt={offeredBy}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.outerHTML = '<div class="text-2xl">' + colors.icon + '</div>';
                }}
              />
            ) : (
              <div className="text-2xl">{colors.icon}</div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <div className="text-white font-bold text-lg mb-0.5">
              Remedy Request
            </div>
            <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-medium`}>
              {offeredBy} seeks remedy for {patientName || 'patient'}
            </div>
            {paymentOffered > 0 && (
              <div className="text-white/70 text-xs mt-0.5">
                Offers {paymentOffered} reales
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={onPursue}
              className={`px-4 py-2 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2`}
            >
              Craft Remedy
            </button>
            <button
              onClick={onDecline}
              className={`px-4 py-2 ${colors.buttonSecondary} font-semibold rounded-lg transition-colors`}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
