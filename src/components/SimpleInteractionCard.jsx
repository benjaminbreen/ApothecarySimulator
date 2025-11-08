/**
 * SimpleInteractionCard - Fast gameplay loops for routine NPC interactions
 *
 * Compact card matching patient card UI style
 * Blue gradient for service offers, other colors for other interaction types
 */

import React, { useState } from 'react';

export default function SimpleInteractionCard({
  interaction,
  onChoice,
  currentWealth,
  inventory = [],
  gameState = {},
  isDark = false
}) {
  // Create unique key for this interaction to track expansion state
  const interactionKey = `${interaction.type}_${interaction.npcName}_${interaction.offer?.item || interaction.request?.item || ''}`;

  // Use a Map to track expanded state per unique interaction
  const [expandedMap, setExpandedMap] = useState(new Map());

  const isExpanded = expandedMap.get(interactionKey) || false;
  const toggleExpanded = () => {
    setExpandedMap(prev => {
      const next = new Map(prev);
      next.set(interactionKey, !isExpanded);
      return next;
    });
  };

  if (!interaction || interaction.type === 'null' || !interaction.type) return null;

  const { type, npcName, npcPortrait } = interaction;

  // Helper: Check if player has item
  const hasItem = (itemName) => {
    return inventory.some(item =>
      item?.name?.toLowerCase() === itemName?.toLowerCase() && item.quantity > 0
    );
  };

  // Helper: Check if donation is abstract (non-physical)
  const isAbstractDonation = (itemName) => {
    if (!itemName) return false;
    const lower = itemName.toLowerCase();
    // Abstract donations: time, access, permission, information, advice, etc.
    const abstractPatterns = [
      'time',
      'access',
      'permission',
      'information',
      'advice',
      'guidance',
      'knowledge',
      'wisdom',
      'favor',
      'blessing',
      'prayer',
      'secret',
      'help',
      'assistance'
    ];
    return abstractPatterns.some(pattern => lower.includes(pattern));
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
    vendor_offer: {
      gradient: 'from-amber-500/90 to-amber-600',
      darkGradient: 'dark:from-amber-700 dark:to-amber-800',
      border: 'border-amber-400/20',
      darkBorder: 'dark:border-amber-600/30',
      textSecondary: 'text-amber-100',
      darkTextSecondary: 'dark:text-amber-200',
      buttonPrimary: 'bg-white hover:bg-amber-50 text-amber-600',
      buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white',
      icon: '🛒'
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
    },
    investment_offer: {
      gradient: 'from-teal-500/90 to-cyan-600',
      darkGradient: 'dark:from-teal-700 dark:to-cyan-800',
      border: 'border-teal-400/20',
      darkBorder: 'dark:border-teal-600/30',
      textSecondary: 'text-teal-100',
      darkTextSecondary: 'dark:text-teal-200',
      buttonPrimary: 'bg-white hover:bg-teal-50 text-teal-600',
      buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white',
      icon: '💰'
    }
  };

  const colors = colorSchemes[type] || colorSchemes.service_offer;

  // Render based on interaction type

  // Vendor offer (merchant/peddler selling goods to Maria)
  if (type === 'vendor_offer' && interaction.offer) {
    const { context, npcRole, offer } = interaction;
    const { item, price, description, quality, quantity, emoji } = offer;
    const canAfford = currentWealth >= price;
    const displayIcon = emoji || colors.icon; // Use offer emoji if present, otherwise default icon

    return (
      <div className="animate-fade-in mb-4">
        <div className={`w-full bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder} overflow-hidden transition-all duration-300`}>
          {/* Main Card Content */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              {/* NPC Portrait */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/20 flex items-center justify-center">
                {npcPortrait ? (
                  <img
                    src={npcPortrait}
                    alt={npcName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.outerHTML = '<div class="text-2xl">' + displayIcon + '</div>';
                    }}
                  />
                ) : (
                  <div className="text-2xl">{displayIcon}</div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <div className="text-white font-bold text-lg">
                  Vendor Offer
                </div>
                <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-semibold`}>
                  {npcName} {context || 'has goods for sale'}
                </div>
                <div className="text-white/80 text-xs mt-1 flex items-center gap-1">
                  <span>•</span>
                  <span className="font-medium">{item}</span>
                  <span className="text-white/60">({price} reales)</span>
                  {quality && <span className="text-white/60 italic">- {quality}</span>}
                </div>
                {npcRole && (
                  <div className="text-white/70 text-xs mt-0.5">
                    {npcRole}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={toggleExpanded}
                  className={`px-4 py-2 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md`}
                >
                  {isExpanded ? 'Hide Details' : 'View Items'}
                </button>
                <button
                  onClick={() => onChoice('refuse', interaction)}
                  className={`px-4 py-2 ${colors.buttonSecondary} font-semibold rounded-lg transition-colors`}
                >
                  Not Interested
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Item Details */}
          {isExpanded && (
            <div className="border-t border-white/50 p-3 animate-fade-in">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {item}
                      {quality && <span className="ml-2 text-sm text-white/60">({quality})</span>}
                    </h3>
                    {description && (
                      <p className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm mb-3`}>
                        {description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-white/100">
                        <span className="font-semibold">Price:</span> {price} reales
                      </div>
                      {quantity > 1 && (
                        <div className="text-white/100">
                          <span className="font-semibold">Quantity:</span> {quantity}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <button
                      onClick={() => onChoice('buy', interaction)}
                      disabled={!canAfford}
                      className={`px-6 py-3 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {canAfford ? `Buy (${price} reales)` : 'Cannot Afford'}
                    </button>
                    <button
                      onClick={() => onChoice('haggle', interaction)}
                      className={`px-6 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition-colors border border-white/30`}
                    >
                      💬 Try to Haggle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'service_offer' && interaction.offer) {
    const { item, price, description, stock, quality, emoji } = interaction.offer;
    const canAfford = currentWealth >= price;
    const displayIcon = emoji || colors.icon; // Use offer emoji if present, otherwise default icon

    return (
      <div className="animate-fade-in mb-4">
        <div className={`w-full bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder} overflow-hidden transition-all duration-300`}>
          {/* Main Card Content */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              {/* NPC Portrait */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/20 flex items-center justify-center">
                {npcPortrait ? (
                  <img
                    src={npcPortrait}
                    alt={npcName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.outerHTML = '<div class="text-2xl">' + displayIcon + '</div>';
                    }}
                  />
                ) : (
                  <div className="text-2xl">{displayIcon}</div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <div className="text-white font-bold text-lg">
                  Service Offer
                </div>
                <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-semibold`}>
                  {npcName} offers a service
                </div>
                <div className="text-white/80 text-xs mt-1 flex items-center gap-1">
                  <span>•</span>
                  <span className="font-medium">{item}</span>
                  <span className="text-white/60">({price} reales)</span>
                  {quality && <span className="text-white/60 italic">- {quality}</span>}
                </div>
                {stock > 0 && stock < 5 && (
                  <div className="text-yellow-400 text-xs mt-0.5 font-semibold">
                    ⚠️ Only {stock} in stock
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={toggleExpanded}
                  className={`px-4 py-2 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md`}
                >
                  {isExpanded ? 'Hide Details' : 'View Details'}
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

          {/* Expandable Item Details */}
          {isExpanded && (
            <div className="border-t border-white/50 p-3 animate-fade-in">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {item}
                      {quality && <span className="ml-2 text-sm text-white/60">({quality})</span>}
                    </h3>
                    {description && (
                      <p className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm mb-3`}>
                        {description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-white/100">
                        <span className="font-semibold">Price:</span> {price} reales
                      </div>
                      {stock > 0 && stock < 5 && (
                        <div className="text-yellow-400 font-semibold">
                          <span className="font-semibold">Stock:</span> {stock} remaining
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => onChoice('buy', interaction)}
                      disabled={!canAfford}
                      className={`px-6 py-3 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {canAfford ? `Buy (${price} reales)` : 'Cannot Afford'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Donation request (beggar asking for charity)
  if (type === 'donation_request' && interaction.request) {
    const { item, reason, urgency, reputationImpact } = interaction.request;
    const isAbstract = isAbstractDonation(item);
    const hasTheItem = isAbstract ? true : hasItem(item); // Abstract donations always available

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
                Donate {isAbstract ? '' : item}
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

  // Competitive check (rival apothecary scouting your practice)
  if (type === 'competitive_check' && interaction.competitive) {
    const { approach, intent, question, difficulty } = interaction.competitive;

    // Determine intent icon/description
    const intentLabels = {
      tour_workshop: { icon: '🔬', text: 'Tour Workshop' },
      ask_about_sources: { icon: '🌿', text: 'Ingredient Sources' },
      ask_about_techniques: { icon: '📖', text: 'Medical Techniques' },
      general_scouting: { icon: '👁️', text: 'General Scouting' }
    };

    const intentInfo = intentLabels[intent] || { icon: '👁️', text: 'Scouting' };

    return (
      <div className="animate-fade-in mb-4">
        <div className={`w-full bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder}`}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
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
                <div className="text-white font-bold text-lg">
                  Rival Apothecary Visit
                </div>
                <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-semibold`}>
                  {npcName} has arrived
                </div>
                <div className="text-white/80 text-xs mt-1 flex items-center gap-1">
                  <span>{intentInfo.icon}</span>
                  <span className="font-medium">{intentInfo.text}</span>
                  <span className="text-white/60">• {approach} approach</span>
                </div>
                {question && (
                  <div className="text-white/70 text-xs mt-1 italic">
                    "{question}"
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - 4 options in a grid */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => onChoice('show_around', interaction)}
                className={`px-4 py-3 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md flex flex-col items-center gap-1 text-sm`}
              >
                <span className="text-lg">🤝</span>
                <span>Show Them Around</span>
                <span className="text-xs opacity-75">Friendly but risky</span>
              </button>
              <button
                onClick={() => onChoice('refuse_politely', interaction)}
                className={`px-4 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors flex flex-col items-center gap-1 text-sm`}
              >
                <span className="text-lg">🚪</span>
                <span>Politely Refuse</span>
                <span className="text-xs opacity-75">Safe but unfriendly</span>
              </button>
              <button
                onClick={() => onChoice('misdirect', interaction)}
                className={`px-4 py-3 bg-white/30 hover:bg-white/40 text-white font-semibold rounded-lg transition-colors flex flex-col items-center gap-1 text-sm border border-white/40`}
              >
                <span className="text-lg">🎭</span>
                <span>Misdirect Them</span>
                <span className="text-xs opacity-75">Deception check</span>
              </button>
              <button
                onClick={() => onChoice('boast', interaction)}
                className={`px-4 py-3 bg-purple-500/40 hover:bg-purple-500/50 text-white font-semibold rounded-lg transition-colors flex flex-col items-center gap-1 text-sm border border-purple-400/40`}
              >
                <span className="text-lg">👑</span>
                <span>Boast & Intimidate</span>
                <span className="text-xs opacity-75">Show superiority</span>
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
    // Parse cost (e.g., "2 reales" or "1 bread")
    let canPay = false;
    const coinMatch = cost.match(/(\d+)\s*(real|reale)/i);
    if (coinMatch) {
      // Cost is in reales
      const coinCost = parseInt(coinMatch[1]);
      canPay = currentWealth >= coinCost;
    } else {
      // Cost is an item
      const itemMatch = cost.match(/(\d+)\s+(\w+)/i);
      if (itemMatch) {
        const itemName = itemMatch[2];
        canPay = hasItem(itemName);
      }
    }

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

  // Extortion demand (threats from criminals, corrupt officials, Inquisition proxies)
  if (type === 'extortion_demand' && interaction.extortion) {
    const { demandType, amount, threatLevel, threatener, consequence, difficulty } = interaction.extortion;
    const canAfford = currentWealth >= amount;

    // Historical context
    const extortionHistory = gameState?.extortionHistory?.byNPC?.[npcName];
    const timesPaid = extortionHistory?.timesPaid || 0;
    const timesRefused = extortionHistory?.timesRefused || 0;
    const lastResponse = extortionHistory?.lastResponse;

    // Threatener-specific styling and context
    const threatenerInfo = {
      gang: {
        icon: '🗡️',
        label: 'Criminal Gang',
        description: 'Dangerous criminals. Violence is their language.',
        canReportText: 'Can report to authorities',
        bg: 'from-red-600/80 to-gray-800/80'
      },
      official: {
        icon: '⚖️',
        label: 'Corrupt Official',
        description: 'Colonial bureaucrat demanding bribes. They ARE the law here.',
        canReportText: 'Cannot report (they are the authorities)',
        bg: 'from-purple-700/80 to-indigo-800/80'
      },
      inquisition_proxy: {
        icon: '✝️',
        label: 'Inquisition Proxy',
        description: 'Threatening to investigate your converso heritage. Most dangerous.',
        canReportText: 'Cannot report (Church authority)',
        bg: 'from-black/90 to-purple-900/80'
      },
      rival: {
        icon: '⚗️',
        label: 'Rival Apothecary',
        description: 'Business competitor using threats. Jealous of your practice.',
        canReportText: 'Can report to guild authorities',
        bg: 'from-green-700/80 to-teal-800/80'
      }
    };
    const threatInfo = threatenerInfo[threatener] || threatenerInfo.gang;

    // Threat level styling
    const threatColors = {
      veiled: { bg: 'from-orange-600/80 to-red-500/80', border: 'border-orange-400/60', icon: '⚠️' },
      direct: { bg: 'from-red-600/80 to-red-700/80', border: 'border-red-400/60', icon: '🔥' },
      violent: { bg: 'from-red-700/80 to-red-900/80', border: 'border-red-500/80', icon: '💀' }
    };
    const threatStyle = threatColors[threatLevel] || threatColors.direct;

    // Can only report if threatener isn't official
    const canReport = threatener !== 'official' && threatener !== 'inquisition_proxy';

    return (
      <div className="animate-fade-in mb-4">
        <div className={`w-full p-4 bg-gradient-to-r ${threatInfo.bg} rounded-xl shadow-lg border-2 ${threatStyle.border}`}>
          <div className="flex items-start gap-3">
            {/* NPC Portrait */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-black/20 flex items-center justify-center">
              {npcPortrait ? (
                <img
                  src={npcPortrait}
                  alt={npcName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.outerHTML = '<div class="text-2xl">' + threatInfo.icon + '</div>';
                  }}
                />
              ) : (
                <div className="text-2xl">{threatInfo.icon}</div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 text-left">
              <div className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                {threatInfo.icon} Extortion Demand
                <span className="text-xs font-normal bg-black/30 px-2 py-0.5 rounded">
                  {threatInfo.label}
                </span>
                <span className="text-xs font-normal bg-black/30 px-2 py-0.5 rounded">
                  {threatLevel}
                </span>
              </div>
              <div className="text-white/80 text-xs mb-2 italic">
                {threatInfo.description}
              </div>
              <div className="text-white/90 text-sm font-medium mb-2">
                {npcName} demands {amount} reales for {demandType}
              </div>
              <div className="text-white/70 text-xs italic border-l-2 border-white/30 pl-2 mb-2">
                "{consequence}"
              </div>

              {/* Historical Context */}
              {(timesPaid > 0 || timesRefused > 0) && (
                <div className="bg-black/30 rounded px-2 py-1 text-xs text-white/70 mb-3">
                  <span className="font-semibold">History with {npcName}:</span>
                  {timesPaid > 0 && <span className="ml-2">Paid {timesPaid}x</span>}
                  {timesRefused > 0 && <span className="ml-2">Refused {timesRefused}x</span>}
                  {timesPaid > 1 && <span className="ml-2 text-yellow-300">⚠️ They expect regular payments now</span>}
                  {timesRefused > 0 && <span className="ml-2 text-red-300">⚠️ Still angry from last refusal</span>}
                </div>
              )}

              {/* Action Buttons - 2x2 grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChoice('pay', interaction)}
                  disabled={!canAfford}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-0.5"
                >
                  <span className="text-base">💰</span>
                  <span>Pay {amount} reales</span>
                  {!canAfford && <span className="text-xs opacity-75">Can't afford</span>}
                </button>

                <button
                  onClick={() => onChoice('refuse', interaction)}
                  className="px-3 py-2 bg-red-500/30 hover:bg-red-500/40 text-white text-sm font-semibold rounded-lg transition-colors border border-red-400/40 flex flex-col items-center gap-0.5"
                >
                  <span className="text-base">🚫</span>
                  <span>Refuse</span>
                  <span className="text-xs opacity-75">Brave but risky</span>
                </button>

                <button
                  onClick={() => onChoice('negotiate', interaction)}
                  className="px-3 py-2 bg-purple-500/30 hover:bg-purple-500/40 text-white text-sm font-semibold rounded-lg transition-colors border border-purple-400/40 flex flex-col items-center gap-0.5"
                >
                  <span className="text-base">🗣️</span>
                  <span>Negotiate</span>
                  <span className="text-xs opacity-75">{difficulty} check</span>
                </button>

                {canReport ? (
                  <button
                    onClick={() => onChoice('report', interaction)}
                    className="px-3 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white text-sm font-semibold rounded-lg transition-colors border border-blue-400/40 flex flex-col items-center gap-0.5"
                  >
                    <span className="text-base">⚖️</span>
                    <span>Report</span>
                    <span className="text-xs opacity-75">To authorities</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-3 py-2 bg-gray-500/20 text-white/40 text-sm font-semibold rounded-lg cursor-not-allowed flex flex-col items-center gap-0.5"
                  >
                    <span className="text-base">⚖️</span>
                    <span>Can't Report</span>
                    <span className="text-xs">Official threat</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Gamble opportunity (interactive minigame)
  if (type === 'gamble_opportunity' && interaction.gamble) {
    const { gameType, wager, potentialWin, odds, description } = interaction.gamble;
    const canAfford = currentWealth >= wager;

    // Gambling state (use Map to handle multiple simultaneous gambles)
    const gambleKey = `${interaction.type}_${interaction.npcName}_${gameType}`;
    const [gamblingStates, setGamblingStates] = useState(new Map());
    const gamblingState = gamblingStates.get(gambleKey) || {
      phase: 'offer',
      result: null,
      playerChoice: null,
      gameResult: null,
      dealerCard: null,
      playerDice: null,
      houseDice: null
    };

    const setGamblingState = (newState) => {
      setGamblingStates(prev => {
        const next = new Map(prev);
        next.set(gambleKey, newState);
        return next;
      });
    };

    // Helper: Draw random Spanish playing card
    const drawCard = () => {
      const suits = ['Oros', 'Copas', 'Espadas', 'Bastos'];
      const values = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]; // Spanish deck: 1-7, 10(Sota), 11(Caballo), 12(Rey)
      return {
        suit: suits[Math.floor(Math.random() * suits.length)],
        value: values[Math.floor(Math.random() * values.length)]
      };
    };

    // Helper: Get card emoji
    const getCardEmoji = (card) => {
      if (!card) return '🃏';
      const suitEmojis = {
        'Oros': '🪙', // Coins
        'Copas': '🍷', // Cups
        'Espadas': '⚔️', // Swords
        'Bastos': '🏏'  // Clubs
      };
      return suitEmojis[card.suit] || '🃏';
    };

    // Helper: Get card display name
    const getCardName = (card) => {
      if (card.value === 10) return 'Sota';
      if (card.value === 11) return 'Caballo';
      if (card.value === 12) return 'Rey';
      return card.value.toString();
    };

    // Odds display
    const oddsInfo = {
      favorable: { text: '60% to win', color: 'text-green-300', icon: '🍀' },
      even: { text: '50% to win', color: 'text-yellow-300', icon: '⚖️' },
      unfavorable: { text: '40% to win', color: 'text-red-300', icon: '⚠️' }
    };
    const oddsDisplay = oddsInfo[odds] || oddsInfo.even;

    // === GAME-SPECIFIC HANDLERS ===

    // Taba (Knucklebone) Game
    const handleTabaChoice = (side) => {
      setGamblingState({
        ...gamblingState,
        phase: 'playing',
        playerChoice: side.name
      });

      // Simulate toss
      setTimeout(() => {
        const sides = [
          { name: 'Suerte', probability: 0.35 },
          { name: 'Culo', probability: 0.35 },
          { name: 'Lado', probability: 0.15 },
          { name: 'Pinino', probability: 0.15 }
        ];

        const roll = Math.random();
        let cumulative = 0;
        let landed = sides[0];

        for (const s of sides) {
          cumulative += s.probability;
          if (roll <= cumulative) {
            landed = s;
            break;
          }
        }

        const won = landed.name === side.name;

        setGamblingState({
          ...gamblingState,
          phase: 'result',
          playerChoice: side.name,
          gameResult: landed.name,
          result: won ? 'win' : 'lose'
        });

        resolveGame(won, false);
      }, 1500);
    };

    // Cards (High/Low) Game
    const handleCardChoice = (guess) => {
      const dealer = gamblingState.dealerCard || drawCard();
      setGamblingState({
        ...gamblingState,
        phase: 'playing',
        dealerCard: dealer,
        playerChoice: guess
      });

      // Draw next card
      setTimeout(() => {
        const nextCard = drawCard();
        const won = (guess === 'higher' && nextCard.value > dealer.value) ||
                     (guess === 'lower' && nextCard.value < dealer.value) ||
                     (guess === 'same' && nextCard.value === dealer.value);

        setGamblingState({
          ...gamblingState,
          phase: 'result',
          dealerCard: dealer,
          gameResult: nextCard,
          playerChoice: guess,
          result: won ? 'win' : 'lose'
        });

        resolveGame(won, false);
      }, 1500);
    };

    // Dice Game
    const handleDiceRoll = () => {
      setGamblingState({
        ...gamblingState,
        phase: 'playing'
      });

      // Roll dice
      setTimeout(() => {
        const house = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
        const player = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
        const won = player > house;

        setGamblingState({
          ...gamblingState,
          phase: 'result',
          houseDice: house,
          playerDice: player,
          result: won ? 'win' : 'lose'
        });

        resolveGame(won, false);
      }, 1500);
    };

    // Cockfight Game
    const handleCockfightBet = (choice) => {
      setGamblingState({
        ...gamblingState,
        phase: 'playing',
        playerChoice: choice
      });

      // Simulate fight
      setTimeout(() => {
        const winProbability = choice === 'red' ? 0.45 : 0.55; // Black slightly favored
        const won = Math.random() < winProbability;

        setGamblingState({
          ...gamblingState,
          phase: 'result',
          playerChoice: choice,
          result: won ? 'win' : 'lose',
          gameResult: won ? choice : (choice === 'red' ? 'black' : 'red')
        });

        resolveGame(won, false);
      }, 2000);
    };

    // Generic resolution
    const resolveGame = (won, isDouble) => {
      setTimeout(() => {
        if (won && !isDouble) {
          // Offer double or nothing
          setGamblingState(prev => ({
            ...prev,
            phase: 'double_offer',
            currentWinnings: potentialWin - wager
          }));
        } else {
          // Final result - trigger callback after delay
          setTimeout(() => {
            if (won) {
              onChoice(isDouble ? 'bet_doubled_won' : 'bet_won', interaction);
            } else {
              onChoice(isDouble ? 'bet_doubled_lost' : 'bet_lost', interaction);
            }
            setGamblingState({ phase: 'offer', result: null });
          }, 2500);
        }
      }, 1500);
    };

    const handleBet = (isDouble = false, currentStake = wager, currentPotential = potentialWin) => {
      if (!canAfford && !isDouble) return;

      // Start animation
      setGamblingState({
        phase: 'playing',
        result: null,
        isDouble,
        doubleStake: isDouble ? currentStake : null
      });

      // Simulate game play with delay
      setTimeout(() => {
        const winProbability = { favorable: 0.6, even: 0.5, unfavorable: 0.4 }[odds] || 0.5;
        const won = Math.random() < winProbability;

        if (won && !isDouble) {
          // Won first bet - offer double or nothing
          setGamblingState({
            phase: 'double_offer',
            result: 'win',
            currentWinnings: currentPotential - wager
          });
        } else {
          // Either lost, or finished double attempt
          setGamblingState({
            phase: 'result',
            result: won ? 'win' : 'lose',
            isDouble,
            finalAmount: won ? currentPotential : (isDouble ? 0 : -wager)
          });

          // Auto-dismiss and trigger handler after showing result
          setTimeout(() => {
            if (won) {
              onChoice(isDouble ? 'bet_doubled_won' : 'bet_won', interaction);
            } else {
              onChoice(isDouble ? 'bet_doubled_lost' : 'bet_lost', interaction);
            }
            setGamblingState({ phase: 'offer', result: null });
          }, 2500);
        }
      }, 1500);
    };

    const handleDoubleOrNothing = () => {
      const currentWinnings = potentialWin - wager;
      handleBet(true, currentWinnings, currentWinnings * 2);
    };

    const handleTakeWinnings = () => {
      onChoice('bet_won', interaction);
      setGamblingState({ phase: 'offer', result: null });
    };

    return (
      <div className="animate-fade-in mb-4">
        <div className="w-full p-4 bg-gradient-to-r from-purple-600/80 to-pink-600/80 rounded-xl shadow-lg border-2 border-purple-400/60">
          <div className="flex items-start gap-3">
            {/* NPC Portrait */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
              {npcPortrait ? (
                <img
                  src={npcPortrait}
                  alt={npcName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.outerHTML = '<div class="text-2xl">🎲</div>';
                  }}
                />
              ) : (
                <div className="text-2xl">🎲</div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 text-left">
              <div className="text-white font-bold text-lg mb-1">
                🎲 Game of Chance
              </div>
              <div className="text-white/90 text-sm font-medium mb-1">
                {npcName} invites you to play {gameType}
              </div>
              <div className="text-white/70 text-xs italic mb-2">
                {description}
              </div>

              {/* Gambling History */}
              {(() => {
                const gamblingHistory = gameState?.gamblingHistory;
                const npcHistory = gamblingHistory?.byNPC?.[npcName];
                const recentGames = gamblingHistory?.recentGames || [];
                const currentStreak = gamblingHistory?.currentStreak;

                return (
                  <>
                    {npcHistory && (
                      <div className="bg-black/30 rounded px-2 py-1 text-xs text-white/70 mb-2">
                        <span className="font-semibold">History with {npcName}:</span>
                        <span className="ml-2">{npcHistory.totalWins}W - {npcHistory.totalLosses}L</span>
                        <span className={`ml-2 font-semibold ${npcHistory.netGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                          {npcHistory.netGain >= 0 ? '+' : ''}{npcHistory.netGain}r
                        </span>
                        {npcHistory.totalWins > npcHistory.totalLosses && (
                          <span className="ml-2 text-yellow-300">🔥 They're wary of you</span>
                        )}
                        {npcHistory.totalLosses > npcHistory.totalWins * 2 && (
                          <span className="ml-2 text-blue-300">🎯 They see you as easy money</span>
                        )}
                      </div>
                    )}
                    {currentStreak && currentStreak.count >= 2 && (
                      <div className="bg-yellow-500/20 rounded px-2 py-1 text-xs text-yellow-200 mb-2 flex items-center gap-1">
                        <span className="font-bold">
                          {currentStreak.count} {currentStreak.type === 'win' ? 'WIN' : 'LOSS'} STREAK!
                        </span>
                        {currentStreak.type === 'win' && currentStreak.count >= 3 && (
                          <span>🔥 Others are watching...</span>
                        )}
                      </div>
                    )}
                    {recentGames.length > 0 && gamblingState.phase === 'offer' && (
                      <div className="text-xs text-white/60 mb-2 flex items-center gap-1">
                        <span>Recent:</span>
                        {recentGames.slice(0, 5).map((g, i) => (
                          <span key={i}>{g.result === 'win' ? '✅' : '❌'}</span>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Gamble Info */}
              {gamblingState.phase === 'offer' && (
                <>
                  <div className="bg-black/20 rounded-lg p-3 mb-3 border border-white/20">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-white/60 text-xs mb-1">Wager</div>
                        <div className="text-white font-bold">💰 {wager}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs mb-1">Win</div>
                        <div className="text-yellow-300 font-bold">✨ {potentialWin}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs mb-1">Odds</div>
                        <div className={`font-bold ${oddsDisplay.color}`}>
                          {oddsDisplay.icon} {oddsDisplay.text}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Game-Specific UI */}
                  {gameType === 'taba' && (
                    <>
                      <div className="text-white/90 text-sm mb-2 text-center">
                        {npcName} tosses the knucklebone... Which side lands up?
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[
                          { name: 'Suerte', probability: 35, emoji: '🦴', color: 'from-green-500/40' },
                          { name: 'Culo', probability: 35, emoji: '🦴', color: 'from-blue-500/40' },
                          { name: 'Lado', probability: 15, emoji: '🦴', color: 'from-orange-500/40' },
                          { name: 'Pinino', probability: 15, emoji: '🦴', color: 'from-purple-500/40' }
                        ].map(side => (
                          <button
                            key={side.name}
                            onClick={() => handleTabaChoice(side)}
                            disabled={!canAfford}
                            className={`p-3 bg-gradient-to-br ${side.color} to-black/40 hover:to-black/20 rounded-lg border border-white/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <div className="text-3xl mb-1">{side.emoji}</div>
                            <div className="text-white font-bold text-sm">{side.name}</div>
                            <div className="text-white/70 text-xs">{side.probability}% chance</div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {gameType === 'cards' && (
                    <>
                      <div className="bg-black/30 rounded-lg p-4 mb-3 border border-white/20">
                        <div className="text-white/80 text-sm mb-2 text-center">Dealer's Card</div>
                        <div className="text-center mb-2">
                          {(() => {
                            const card = gamblingState.dealerCard || drawCard();
                            if (!gamblingState.dealerCard) {
                              setGamblingState({ ...gamblingState, dealerCard: card });
                            }
                            return (
                              <>
                                <div className="text-5xl mb-1">{getCardEmoji(card)}</div>
                                <div className="text-white font-bold text-xl">{getCardName(card)}</div>
                                <div className="text-white/70 text-sm">{card.suit}</div>
                              </>
                            );
                          })()}
                        </div>
                        <div className="text-white/90 text-sm text-center">Will the next card be higher or lower?</div>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => handleCardChoice('higher')}
                          disabled={!canAfford}
                          className="flex-1 p-3 bg-green-500/30 hover:bg-green-500/40 rounded-lg border border-green-400/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="text-white font-bold">⬆️ Higher</div>
                        </button>
                        <button
                          onClick={() => handleCardChoice('lower')}
                          disabled={!canAfford}
                          className="flex-1 p-3 bg-red-500/30 hover:bg-red-500/40 rounded-lg border border-red-400/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="text-white font-bold">⬇️ Lower</div>
                        </button>
                      </div>
                    </>
                  )}

                  {gameType === 'dice' && (
                    <>
                      <div className="bg-black/30 rounded-lg p-4 mb-3 border border-white/20 text-center">
                        <div className="text-white/80 text-sm mb-3">Roll 2d6 and beat the house!</div>
                        <div className="text-6xl mb-2">🎲 🎲</div>
                        <div className="text-white/70 text-xs">Higher total wins</div>
                      </div>
                      <button
                        onClick={handleDiceRoll}
                        disabled={!canAfford}
                        className="w-full p-3 bg-gradient-to-r from-blue-500/40 to-purple-500/40 hover:from-blue-500/50 hover:to-purple-500/50 rounded-lg border border-white/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="text-white font-bold text-lg">🎲 Roll the Dice!</div>
                      </button>
                    </>
                  )}

                  {gameType === 'cockfight' && (
                    <>
                      <div className="text-white/90 text-sm mb-2 text-center">
                        Choose your champion!
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                          onClick={() => handleCockfightBet('red')}
                          disabled={!canAfford}
                          className="p-4 bg-gradient-to-br from-red-500/40 to-black/40 hover:to-black/20 rounded-lg border border-red-400/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="text-4xl mb-1">🐓</div>
                          <div className="text-white font-bold">Red Cock</div>
                          <div className="text-white/70 text-xs">Aggressive</div>
                          <div className="text-white/60 text-xs">45% chance</div>
                        </button>
                        <button
                          onClick={() => handleCockfightBet('black')}
                          disabled={!canAfford}
                          className="p-4 bg-gradient-to-br from-gray-700/40 to-black/40 hover:to-black/20 rounded-lg border border-gray-400/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="text-4xl mb-1">🐓</div>
                          <div className="text-white font-bold">Black Cock</div>
                          <div className="text-white/70 text-xs">Defensive</div>
                          <div className="text-white/60 text-xs">55% chance</div>
                        </button>
                      </div>
                    </>
                  )}

                  {gameType === 'wager' && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleBet}
                        disabled={!canAfford}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 hover:from-yellow-500/90 hover:to-orange-500/90 text-white font-bold rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                      >
                        {canAfford ? `🎲 Place Bet (${wager} reales)` : `Cannot Afford (need ${wager})`}
                      </button>
                    </div>
                  )}

                  {/* Walk Away button (always shown) */}
                  <button
                    onClick={() => onChoice('walk_away', interaction)}
                    className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors mt-2"
                  >
                    Walk Away
                  </button>

                  {!canAfford && (
                    <div className="text-red-300 text-xs text-center mt-2">
                      Not enough reales (need {wager}, have {currentWealth})
                    </div>
                  )}
                </>
              )}

              {/* Playing Animation */}
              {gamblingState.phase === 'playing' && (
                <div className="bg-black/30 rounded-lg p-6 mb-3 border border-white/20 text-center">
                  <div className="text-4xl mb-2 animate-bounce">
                    {gameType === 'taba' ? '🦴' :
                     gameType === 'dice' ? '🎲' :
                     gameType === 'cards' ? '🃏' :
                     gameType === 'cockfight' ? '🐓' : '🎰'}
                  </div>
                  <div className="text-white font-bold animate-pulse mb-2">
                    {gamblingState.isDouble ? 'DOUBLE OR NOTHING!' :
                     gameType === 'taba' ? 'Tossing the knucklebone...' :
                     gameType === 'dice' ? 'Rolling the dice...' :
                     gameType === 'cards' ? 'Drawing next card...' :
                     gameType === 'cockfight' ? 'The birds are fighting...' :
                     'Placing the wager...'}
                  </div>
                  {gamblingState.playerChoice && (
                    <div className="text-white/70 text-sm">
                      You chose: <span className="font-semibold text-white">{gamblingState.playerChoice}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Double or Nothing Offer */}
              {gamblingState.phase === 'double_offer' && (
                <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-lg p-6 mb-3 border-2 border-yellow-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="text-white font-bold text-xl mb-2">YOU WON!</div>
                    <div className="text-green-200 font-semibold text-lg mb-4">
                      +{gamblingState.currentWinnings} reales
                    </div>
                    <div className="text-white/90 text-sm mb-4">
                      {npcName} grins and shuffles the {gameType === 'cards' ? 'deck' : gameType === 'dice' ? 'dice' : 'coins'}...
                      <br/>
                      <span className="font-bold">"Care to double your winnings? Or walk away while you're ahead?"</span>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={handleDoubleOrNothing}
                        className="px-6 py-3 bg-gradient-to-r from-red-500/80 to-orange-500/80 hover:from-red-500/90 hover:to-orange-500/90 text-white font-bold rounded-lg transition-all shadow-md transform hover:scale-105 flex items-center gap-2"
                      >
                        <span className="text-xl">🔥</span>
                        <div className="text-left">
                          <div>Double or Nothing!</div>
                          <div className="text-xs opacity-75">Risk {gamblingState.currentWinnings}r for {gamblingState.currentWinnings * 2}r</div>
                        </div>
                      </button>
                      <button
                        onClick={handleTakeWinnings}
                        className="px-6 py-3 bg-green-500/50 hover:bg-green-500/60 text-white font-bold rounded-lg transition-all shadow-md flex items-center gap-2"
                      >
                        <span className="text-xl">💰</span>
                        <div className="text-left">
                          <div>Take the Winnings</div>
                          <div className="text-xs opacity-75">Walk away with {gamblingState.currentWinnings}r</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Result Display */}
              {gamblingState.phase === 'result' && (
                <div className={`rounded-lg p-6 mb-3 border-2 text-center ${
                  gamblingState.result === 'win'
                    ? 'bg-green-500/30 border-green-400'
                    : 'bg-red-500/30 border-red-400'
                }`}>
                  <div className="text-5xl mb-2">
                    {gamblingState.result === 'win' ? '🎉🎉🎉' : '💔'}
                  </div>
                  <div className="text-white font-bold text-2xl mb-1">
                    {gamblingState.result === 'win'
                      ? (gamblingState.isDouble ? 'DOUBLED!' : 'YOU WON!')
                      : (gamblingState.isDouble ? 'LOST IT ALL!' : 'YOU LOST!')}
                  </div>

                  {/* Game-Specific Result Details */}
                  {gameType === 'taba' && gamblingState.gameResult && (
                    <div className="text-white/90 text-sm mb-2">
                      The bone landed: <span className="font-bold">{gamblingState.gameResult}</span>
                      {gamblingState.playerChoice && (
                        <div className="text-white/70 text-xs mt-1">
                          (You chose {gamblingState.playerChoice})
                        </div>
                      )}
                    </div>
                  )}

                  {gameType === 'dice' && gamblingState.playerDice && gamblingState.houseDice && (
                    <div className="text-white/90 text-sm mb-2 space-y-1">
                      <div>Your roll: <span className="font-bold text-white">🎲 {gamblingState.playerDice}</span></div>
                      <div>House roll: <span className="font-bold text-white">🎲 {gamblingState.houseDice}</span></div>
                    </div>
                  )}

                  {gameType === 'cards' && gamblingState.gameResult && gamblingState.dealerCard && (
                    <div className="text-white/90 text-sm mb-2">
                      <div>Dealer: <span className="font-bold">{getCardEmoji(gamblingState.dealerCard)} {getCardName(gamblingState.dealerCard)}</span></div>
                      <div>Next card: <span className="font-bold">{getCardEmoji(gamblingState.gameResult)} {getCardName(gamblingState.gameResult)}</span></div>
                    </div>
                  )}

                  {gameType === 'cockfight' && gamblingState.gameResult && (
                    <div className="text-white/90 text-sm mb-2">
                      <div className="font-bold capitalize">{gamblingState.gameResult} Cock wins!</div>
                      {gamblingState.playerChoice && (
                        <div className="text-white/70 text-xs mt-1">
                          (You bet on {gamblingState.playerChoice})
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`text-lg font-semibold ${
                    gamblingState.result === 'win' ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {gamblingState.isDouble
                      ? (gamblingState.result === 'win'
                          ? `+${gamblingState.finalAmount - wager} reales (DOUBLED!)`
                          : `Lost all winnings`)
                      : (gamblingState.result === 'win'
                          ? `+${potentialWin - wager} reales`
                          : `-${wager} reales`)}
                  </div>
                  {gamblingState.isDouble && gamblingState.result === 'win' && (
                    <div className="text-yellow-300 text-sm mt-2 animate-pulse">
                      ⭐ What a gamble! ⭐
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Investment offer (broker/merchant presenting investment opportunity)
  if (type === 'investment_offer' && interaction.investment) {
    const { context, npcRole, investment } = interaction;
    const { investmentType, amount, expectedReturn, duration, riskLevel, description, emoji } = investment;
    const canAfford = currentWealth >= amount;
    const displayIcon = emoji || colors.icon;

    // Map investment type to display info
    const investmentTypeInfo = {
      church_bond: { name: 'Church Bond', riskText: 'No Risk - Guaranteed Return' },
      cacao_plantation: { name: 'Cacao Plantation Shares', riskText: 'Low Risk' },
      apothecary_syndicate: { name: 'Apothecary Supply Syndicate', riskText: 'Low Risk' },
      real_estate: { name: 'Real Estate Venture', riskText: 'Medium Risk' },
      manila_galleon: { name: 'Manila Galleon Trade', riskText: 'Medium Risk - High Reward' },
      silver_mining: { name: 'Silver Mining Consortium', riskText: 'High Risk - High Reward' }
    };
    const typeInfo = investmentTypeInfo[investmentType] || { name: investmentType, riskText: 'Unknown Risk' };

    return (
      <div className="animate-fade-in mb-4">
        <div className={`w-full bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder} overflow-hidden transition-all duration-300`}>
          {/* Main Card Content */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              {/* NPC Portrait */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/20 flex items-center justify-center">
                {npcPortrait ? (
                  <img
                    src={npcPortrait}
                    alt={npcName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.outerHTML = '<div class="text-2xl">' + displayIcon + '</div>';
                    }}
                  />
                ) : (
                  <div className="text-2xl">{displayIcon}</div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <div className="text-white font-bold text-lg">
                  Investment Opportunity
                </div>
                <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-semibold`}>
                  {npcName} {context || 'presents an opportunity'}
                </div>
                <div className="text-white/80 text-xs mt-1 flex items-center gap-1">
                  <span>•</span>
                  <span className="font-medium">{typeInfo.name}</span>
                  <span className="text-white/60">({amount} reales)</span>
                </div>
                {npcRole && (
                  <div className="text-white/70 text-xs mt-0.5">
                    {npcRole}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={toggleExpanded}
                  className={`px-4 py-2 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md`}
                >
                  {isExpanded ? 'Hide Details' : 'Tell Me More'}
                </button>
                <button
                  onClick={() => onChoice('decline', interaction)}
                  className={`px-4 py-2 ${colors.buttonSecondary} font-semibold rounded-lg transition-colors`}
                >
                  Not Interested
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Investment Details */}
          {isExpanded && (
            <div className="border-t border-white/50 p-3 animate-fade-in">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {typeInfo.name}
                      <span className="ml-2 text-sm text-white/60">({typeInfo.riskText})</span>
                    </h3>
                    {description && (
                      <p className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm mb-3`}>
                        {description}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <span className="text-white/70">Investment:</span>{' '}
                        <span className="text-white font-semibold">{amount} reales</span>
                      </div>
                      <div>
                        <span className="text-white/70">Duration:</span>{' '}
                        <span className="text-white font-semibold">{duration} days</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-white/70">Expected Return:</span>{' '}
                        <span className="text-green-300 font-semibold">
                          {expectedReturn.min} - {expectedReturn.max} reales
                        </span>
                        <span className="text-white/60 text-xs ml-1">
                          ({Math.round((expectedReturn.min/amount - 1) * 100)}% - {Math.round((expectedReturn.max/amount - 1) * 100)}%)
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded px-3 py-2 text-xs text-white/80 border border-white/20">
                      💡 <span className="font-semibold">Tip:</span> Visit El Consulado de Mercaderes to review detailed investment terms and make your decision.
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <button
                      onClick={() => onChoice('view_details', interaction)}
                      className={`px-6 py-3 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2`}
                    >
                      <span>📊</span>
                      <span>View at Consulado</span>
                    </button>
                    <button
                      onClick={() => onChoice('maybe_later', interaction)}
                      className={`px-6 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition-colors border border-white/30`}
                    >
                      💬 Maybe Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
