/**
 * SimpleInteractionCard - Fast gameplay loops for routine NPC interactions
 *
 * Compact card matching patient card UI style
 * Blue gradient for service offers, other colors for other interaction types
 */

import React from 'react';

export default function SimpleInteractionCard({
  interaction,
  onChoice,
  currentWealth,
  inventory = [],
  isDark = false
}) {
  if (!interaction || interaction.type === 'null' || !interaction.type) return null;

  const { type, npcName, npcPortrait } = interaction;

  // Helper: Check if player has item
  const hasItem = (itemName) => {
    return inventory.some(item =>
      item.name.toLowerCase() === itemName.toLowerCase() && item.quantity > 0
    );
  };

  // Helper: Check if player can afford
  const canAfford = (price) => currentWealth >= price;

  // Color schemes for each interaction type (matching patient card style)
  const colorSchemes = {
    service_offer: {
      gradient: 'from-blue-500/90 to-blue-600',
      darkGradient: 'dark:from-blue-700 dark:to-blue-800',
      border: 'border-blue-400/20',
      darkBorder: 'dark:border-blue-600/30',
      textSecondary: 'text-blue-100',
      darkTextSecondary: 'dark:text-blue-200',
      buttonPrimary: 'bg-white hover:bg-blue-50 text-blue-600',
      buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white',
      icon: '🚰'
    },
    donation_request: {
      gradient: 'from-amber-500/90 to-amber-600',
      darkGradient: 'dark:from-amber-700 dark:to-amber-800',
      border: 'border-amber-400/20',
      darkBorder: 'dark:border-amber-600/30',
      textSecondary: 'text-amber-100',
      darkTextSecondary: 'dark:text-amber-200',
      buttonPrimary: 'bg-white hover:bg-amber-50 text-amber-600',
      buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white',
      icon: '🙏'
    },
    competitive_check: {
      gradient: 'from-purple-500/90 to-purple-600',
      darkGradient: 'dark:from-purple-700 dark:to-purple-800',
      border: 'border-purple-400/20',
      darkBorder: 'dark:border-purple-600/30',
      textSecondary: 'text-purple-100',
      darkTextSecondary: 'dark:text-purple-200',
      buttonPrimary: 'bg-white hover:bg-purple-50 text-purple-600',
      buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white',
      icon: '⚖️'
    },
    information_exchange: {
      gradient: 'from-indigo-500/90 to-indigo-600',
      darkGradient: 'dark:from-indigo-700 dark:to-indigo-800',
      border: 'border-indigo-400/20',
      darkBorder: 'dark:border-indigo-600/30',
      textSecondary: 'text-indigo-100',
      darkTextSecondary: 'dark:text-indigo-200',
      buttonPrimary: 'bg-white hover:bg-indigo-50 text-indigo-600',
      buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white',
      icon: '💬'
    },
    social_visit: {
      gradient: 'from-emerald-500/90 to-emerald-600',
      darkGradient: 'dark:from-emerald-700 dark:to-emerald-800',
      border: 'border-emerald-400/20',
      darkBorder: 'dark:border-emerald-600/30',
      textSecondary: 'text-emerald-100',
      darkTextSecondary: 'dark:text-emerald-200',
      buttonPrimary: 'bg-white hover:bg-emerald-50 text-emerald-600',
      buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white',
      icon: '👋'
    }
  };

  const colors = colorSchemes[type] || colorSchemes.service_offer;

  // Render based on interaction type
  if (type === 'service_offer' && interaction.offer) {
    const { item, price, description, stock } = interaction.offer;
    const affordable = canAfford(price);

    return (
      <div className="animate-fade-in mb-4">
        <div className={`w-full p-4 bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder}`}>
          <div className="flex items-center gap-3">
            {/* NPC Portrait */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
              {npcPortrait ? (
                <img
                  src={npcPortrait}
                  alt={npcName}
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
                Service Offer
              </div>
              <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-medium`}>
                {npcName} offers {item} - {price} reales
              </div>
              {stock > 0 && stock < 5 && (
                <div className="text-white/70 text-xs mt-0.5">
                  {stock} in stock
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => onChoice('buy', interaction)}
                disabled={!affordable}
                className={`px-4 py-2 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Buy ({price} reales)
              </button>
              <button
                onClick={() => onChoice('refuse', interaction)}
                className={`px-4 py-2 ${colors.buttonSecondary} font-semibold rounded-lg transition-colors`}
              >
                Not Today
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Donation request (beggar asking for charity)
  if (type === 'donation_request' && interaction.request) {
    const { item, reason, urgency, reputationImpact } = interaction.request;
    const hasTheItem = hasItem(item);

    return (
      <div className="animate-fade-in mb-4">
        <div className={`w-full p-4 bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder}`}>
          <div className="flex items-center gap-3">
            {/* NPC Portrait */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
              {npcPortrait ? (
                <img
                  src={npcPortrait}
                  alt={npcName}
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
                Charity Request
              </div>
              <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-medium`}>
                {npcName} asks for {item}
              </div>
              {urgency === 'high' && (
                <div className="text-white/90 text-xs mt-0.5 font-semibold">
                  Urgent need
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => onChoice('donate', interaction)}
                disabled={!hasTheItem}
                className={`px-4 py-2 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Donate {item}
              </button>
              <button
                onClick={() => onChoice('refuse', interaction)}
                className={`px-4 py-2 ${colors.buttonSecondary} font-semibold rounded-lg transition-colors`}
              >
                Refuse
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Competitive check (rival apothecary price scouting)
  if (type === 'competitive_check' && interaction.competitive) {
    const { targetItem, offeredPrice, actualValue, intent } = interaction.competitive;
    const hasTheItem = hasItem(targetItem);
    const isLowball = offeredPrice < actualValue * 0.8;

    return (
      <div className="animate-fade-in mb-4">
        <div className={`w-full p-4 bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder}`}>
          <div className="flex items-center gap-3">
            {/* NPC Portrait */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
              {npcPortrait ? (
                <img
                  src={npcPortrait}
                  alt={npcName}
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
                Business Offer
              </div>
              <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-medium`}>
                {npcName} offers {offeredPrice} reales for {targetItem}
              </div>
              {isLowball && (
                <div className="text-white/70 text-xs mt-0.5">
                  (Below market value)
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => onChoice('accept', interaction)}
                disabled={!hasTheItem}
                className={`px-4 py-2 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Sell
              </button>
              <button
                onClick={() => onChoice('refuse', interaction)}
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

  // Information exchange (gossip for payment)
  if (type === 'information_exchange' && interaction.information) {
    const { topic, cost, value } = interaction.information;
    // Parse cost (e.g., "1 bread or 2 reales")
    const hasBread = hasItem('bread');
    const canPayCoins = currentWealth >= 2;
    const canPay = hasBread || canPayCoins;

    return (
      <div className="animate-fade-in mb-4">
        <div className={`w-full p-4 bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder}`}>
          <div className="flex items-center gap-3">
            {/* NPC Portrait */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
              {npcPortrait ? (
                <img
                  src={npcPortrait}
                  alt={npcName}
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
                Information for Sale
              </div>
              <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-medium`}>
                {npcName} knows about: {topic}
              </div>
              <div className="text-white/70 text-xs mt-0.5">
                Cost: {cost}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => onChoice('pay', interaction)}
                disabled={!canPay}
                className={`px-4 py-2 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Buy Info
              </button>
              <button
                onClick={() => onChoice('refuse', interaction)}
                className={`px-4 py-2 ${colors.buttonSecondary} font-semibold rounded-lg transition-colors`}
              >
                No Thanks
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Social visit (friend with books, warnings, etc.)
  if (type === 'social_visit' && interaction.social) {
    const { purpose, mood } = interaction.social;

    return (
      <div className="animate-fade-in mb-4">
        <div className={`w-full p-4 bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder}`}>
          <div className="flex items-center gap-3">
            {/* NPC Portrait */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
              {npcPortrait ? (
                <img
                  src={npcPortrait}
                  alt={npcName}
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
                Visitor
              </div>
              <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-medium`}>
                {npcName} has arrived - {purpose}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => onChoice('welcome', interaction)}
                className={`px-4 py-2 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md`}
              >
                Welcome In
              </button>
              <button
                onClick={() => onChoice('decline', interaction)}
                className={`px-4 py-2 ${colors.buttonSecondary} font-semibold rounded-lg transition-colors`}
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
