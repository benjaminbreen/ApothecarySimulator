/**
 * ActionPromptCard - Unified card for give/sell/prescribe actions in narrative panel
 *
 * Replaces: SaleInquiryCard, SaleProposalCard, SaleOpportunityCard, etc.
 * Appears when NPCs request items with drag-and-drop interface.
 * Color-coded: green (give), amber (sell), purple (prescribe)
 */

import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import oralImage from '../assets/oral.jpg';
import inhaledImage from '../assets/inhaled.jpg';
import topicalImage from '../assets/topical.jpg';
import enemaImage from '../assets/enema.jpg';

/**
 * Infer the best administration route based on item name and description
 * @param {Object} item - Inventory item
 * @returns {string} - Route name: 'Oral', 'Topical', 'Inhaled', or 'Enema'
 */
function inferBestRoute(item) {
  if (!item) return 'Oral';

  const name = item.name?.toLowerCase() || '';
  const desc = item.description?.toLowerCase() || '';
  const text = `${name} ${desc}`;

  // Priority 1: Explicit description mentions
  if (text.includes('topically') || text.includes('applied to') || text.includes('rub')) {
    return 'Topical';
  }
  if (text.includes('inhaled') || text.includes('smoked') || text.includes('vapor')) {
    return 'Inhaled';
  }
  if (text.includes('enema') || text.includes('clyster')) {
    return 'Enema';
  }

  // Priority 2: Name patterns (preparation types)
  if (name.includes('salve') || name.includes('ointment') || name.includes('balm') ||
      name.includes('poultice') || name.includes('plaster')) {
    return 'Topical';
  }
  if (name.includes('tincture') || name.includes('syrup') || name.includes('elixir') ||
      name.includes('decoction')) {
    return 'Oral';
  }
  if (name.includes('powder')) {
    return 'Oral'; // Most powders were taken orally
  }
  if (name.includes('oil')) {
    return 'Topical'; // Most oils were topical
  }

  // Priority 3: Item type hints
  if (name.includes('wine') || name.includes('honey') || name.includes('sugar')) {
    return 'Oral';
  }

  // Default: Oral (most common route historically)
  return 'Oral';
}

export default function ActionPromptCard({
  actionPrompt,
  inventory = [],
  onPropose,
  onDecline,
  onDismiss, // Optional: silently dismiss card without triggering narrative
  onMix,
  isDark = false
}) {
  // actionPrompt structure from StateAgent:
  // { type, recipientName, npcId, npcPortrait, context, suggestedItems, priceOffered, ailmentDescription }

  if (!actionPrompt || !actionPrompt.type || actionPrompt.type === 'null') return null;

  const [selectedItem, setSelectedItem] = useState(null);
  const [amount, setAmount] = useState(1);
  const [price, setPrice] = useState(actionPrompt.priceOffered || 0);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [includeBloodletting, setIncludeBloodletting] = useState(false);
  const [bloodAmount, setBloodAmount] = useState(8); // Default 8 ounces
  const [bloodlettingExpanded, setBloodlettingExpanded] = useState(false);

  const routeImages = {
    Oral: oralImage,
    Inhaled: inhaledImage,
    Topical: topicalImage,
    Enema: enemaImage
  };

  // Reset when actionPrompt changes
  useEffect(() => {
    setSelectedItem(null);
    setAmount(1);
    setPrice(actionPrompt.priceOffered || 0);
    setSelectedRoute('');
    setIncludeBloodletting(false);
    setBloodAmount(8);
    setBloodlettingExpanded(false);
  }, [actionPrompt]);

  // Update price when amount changes (for sell/prescribe types)
  useEffect(() => {
    if (selectedItem && (actionPrompt.type === 'sell' || actionPrompt.type === 'prescribe') && selectedItem.price && !actionPrompt.priceOffered) {
      setPrice(Math.round(selectedItem.price * amount));
    }
  }, [amount, selectedItem, actionPrompt.type, actionPrompt.priceOffered]);

  // Drop zone for inventory items
  const [{ isOver }, drop] = useDrop({
    accept: ['INVENTORY_ITEM', 'inventoryItem', 'compoundItem'], // Accept all item types including compounds
    drop: (item) => {
      setSelectedItem(item);
      setAmount(1);
      // For sell/prescribe types, use item price if not specified by NPC
      if ((actionPrompt.type === 'sell' || actionPrompt.type === 'prescribe') && !actionPrompt.priceOffered && item.price) {
        setPrice(item.price);
      }
      // Auto-select best route for prescribe type
      if (actionPrompt.type === 'prescribe') {
        setSelectedRoute(inferBestRoute(item));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  // Color scheme based on action type
  const colorSchemes = {
    give: {
      gradient: 'from-emerald-500/90 to-emerald-600',
      darkGradient: 'dark:from-emerald-700 dark:to-emerald-800',
      border: 'border-emerald-400/20',
      darkBorder: 'dark:border-emerald-600/30',
      textSecondary: 'text-emerald-100',
      darkTextSecondary: 'dark:text-emerald-200',
      buttonPrimary: 'bg-white hover:bg-emerald-50 text-emerald-600',
      buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white',
      icon: '🎁',
      label: 'Give'
    },
    sell: {
      gradient: 'from-amber-500/90 to-amber-600',
      darkGradient: 'dark:from-amber-700 dark:to-amber-800',
      border: 'border-amber-400/20',
      darkBorder: 'dark:border-amber-600/30',
      textSecondary: 'text-amber-100',
      darkTextSecondary: 'dark:text-amber-200',
      buttonPrimary: 'bg-white hover:bg-amber-50 text-amber-600',
      buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white',
      icon: '💰',
      label: 'Sell'
    },
    prescribe: {
      gradient: 'from-purple-600/25 via-purple-500/18 to-purple-500/10',
      darkGradient: 'dark:from-purple-700/30 dark:via-purple-600/22 dark:to-purple-600/15',
      border: 'border-purple-300/60',
      darkBorder: 'dark:border-purple-500/40',
      textSecondary: 'text-purple-700',
      darkTextSecondary: 'dark:text-purple-200',
      buttonPrimary: 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 shadow-sm dark:bg-white/90 dark:hover:bg-white dark:text-purple-700',
      buttonSecondary: 'border border-purple-300 text-purple-700 hover:bg-purple-100/50 dark:border-purple-200/60 dark:text-purple-100 dark:hover:bg-purple-500/20',
      icon: '⚕️',
      label: 'Prescribe'
    }
  };

  const colors = colorSchemes[actionPrompt.type] || colorSchemes.give;
  const isPrescribe = actionPrompt.type === 'prescribe';
  const containerClasses = isPrescribe
    ? `w-full p-3 rounded-xl shadow-lg border ${colors.border} ${colors.darkBorder} bg-gradient-to-br ${colors.gradient} ${colors.darkGradient} backdrop-blur-sm`
    : `w-full p-3 bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder}`;
  const titleClass = isPrescribe ? 'text-purple-900 dark:text-purple-100 font-semibold text-base mb-0.5' : 'text-white font-bold text-lg mb-0.5';
  const subtitleClass = isPrescribe
    ? `${colors.textSecondary} ${colors.darkTextSecondary} text-xs sm:text-sm font-medium`
    : `${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-medium`;
  const dropZoneClasses = `border-2 border-dashed rounded-lg p-2 text-center transition-colors ${
    isOver
      ? (isPrescribe ? 'bg-purple-100 border-purple-400 dark:bg-purple-500/25 dark:border-white/70' : 'bg-white/20 border-white')
      : (isPrescribe ? 'bg-purple-50 border-purple-300 dark:bg-purple-500/15 dark:border-purple-300/40' : 'bg-white/5 border-white/30')
  }`;
  const amountLabelClass = isPrescribe ? 'block text-purple-700 dark:text-purple-200 text-xs font-semibold mb-1' : 'block text-white/90 text-xs font-semibold mb-1';
  const inputClass = isPrescribe
    ? 'w-full px-2 py-1 rounded border border-purple-300 bg-white text-purple-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/70 dark:bg-white/90'
    : 'w-full px-2 py-1 rounded border border-white/30 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50';
  const priceInputClass = isPrescribe
    ? 'w-full px-2 py-1 rounded border border-purple-300 bg-white text-purple-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/70 dark:bg-white/90'
    : 'w-full px-2 py-1 rounded border border-white/30 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50';
  const primaryButtonClass = isPrescribe
    ? `${colors.buttonPrimary} px-3 py-2 rounded-lg text-sm font-semibold transition-all`
    : `px-3 py-2 rounded-lg text-sm font-semibold transition-all ${colors.buttonPrimary}`;
  const secondaryButtonClass = isPrescribe
    ? `${colors.buttonSecondary} px-3 py-2 rounded-lg text-sm font-semibold transition-all`
    : `px-3 py-2 rounded-lg text-sm font-semibold transition-all ${colors.buttonSecondary}`;
  const maxAmount = selectedItem
    ? inventory.find(i => i.name.toLowerCase() === selectedItem.name.toLowerCase())?.quantity || 1
    : 1;

  // Check which suggested items are missing from inventory
  const checkMissingItems = () => {
    if (!actionPrompt.suggestedItems || actionPrompt.suggestedItems.length === 0) {
      return { missing: [], available: [] };
    }

    const missing = [];
    const available = [];

    actionPrompt.suggestedItems.forEach(itemName => {
      const itemInInventory = inventory.find(
        inv => inv.name.toLowerCase() === itemName.toLowerCase()
      );

      if (!itemInInventory || itemInInventory.quantity === 0) {
        missing.push(itemName);
      } else {
        available.push(itemName);
      }
    });

    return { missing, available };
  };

  const { missing: missingItems, available: availableItems } = checkMissingItems();
  const hasMissingItems = missingItems.length > 0;

  const handleMixClick = () => {
    if (onMix) {
      // Pass the ailmentDescription and other context to the mixing workshop
      onMix({
        ailmentDescription: actionPrompt.ailmentDescription || actionPrompt.context,
        recipientName: actionPrompt.recipientName,
        npcId: actionPrompt.npcId,
        suggestedItems: actionPrompt.suggestedItems,
        missingItems: missingItems
      });
    }
  };

  const handlePropose = () => {
    if (!selectedItem) return;

    // For prescribe type, require route selection
    if (actionPrompt.type === 'prescribe' && !selectedRoute) {
      alert('Please select a route of administration.');
      return;
    }

    // Check quantity - first try to find in inventory, fallback to item's own quantity
    const itemInInventory = inventory.find(
      i => i.name.toLowerCase() === selectedItem.name.toLowerCase()
    );

    // Get available quantity from inventory OR from the item itself (for compounds)
    const availableQuantity = itemInInventory?.quantity ?? selectedItem?.quantity ?? 0;
    const numericAvailableQuantity = Number(availableQuantity); // Handle string quantities from LLM

    if (numericAvailableQuantity < amount) {
      alert(`You don't have enough ${selectedItem.name}!`);
      return;
    }

    onPropose({
      type: actionPrompt.type,
      recipientName: actionPrompt.recipientName,
      npcId: actionPrompt.npcId,
      item: selectedItem,
      amount,
      price: (actionPrompt.type === 'sell' || actionPrompt.type === 'prescribe') ? price : 0,
      ailmentDescription: actionPrompt.ailmentDescription,
      route: actionPrompt.type === 'prescribe' ? selectedRoute : undefined,
      includeBloodletting: actionPrompt.type === 'prescribe' ? includeBloodletting : false,
      bloodAmount: actionPrompt.type === 'prescribe' && includeBloodletting ? bloodAmount : 0
    });
  };

  return (
    <div className="animate-fade-in mb-3">
      <div className={containerClasses} style={{ position: 'relative' }}>
        {/* Dismiss X Button - Silent dismiss without narrative */}
        {onDismiss && (
          <button
            onClick={() => onDismiss(actionPrompt)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 z-10"
            style={{
              backgroundColor: isPrescribe
                ? (isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)')
                : 'rgba(255, 255, 255, 0.15)',
              color: isPrescribe
                ? (isDark ? '#e9d5ff' : '#7e22ce')
                : 'white',
            }}
            title="Dismiss card (no reaction)"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isPrescribe
                ? (isDark ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.25)')
                : 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isPrescribe
                ? (isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)')
                : 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span className="text-sm font-bold leading-none" style={{ marginTop: '-1px' }}>×</span>
          </button>
        )}

        {/* Header Row: Portrait + Info + Drop Zone */}
        <div className="grid grid-cols-[auto_1fr_minmax(180px,240px)] gap-3 mb-2">
          {/* NPC Portrait */}
          <div className="flex-shrink-0 w-14 h-14 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
            {actionPrompt.npcPortrait ? (
              <img
                src={actionPrompt.npcPortrait}
                alt={actionPrompt.recipientName}
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
            <div className={titleClass}>
              {colors.label} Request
            </div>
            <div className={subtitleClass}>
              {actionPrompt.recipientName} - {actionPrompt.context}
            </div>
            {actionPrompt.type === 'sell' && actionPrompt.priceOffered > 0 && (
              <div className={`${isPrescribe ? 'text-purple-700 dark:text-purple-100/70' : 'text-white/70'} text-xs mt-0.5`}>
                Offers {actionPrompt.priceOffered} reales
              </div>
            )}
            {actionPrompt.type === 'prescribe' && actionPrompt.ailmentDescription && (
              <div className="text-purple-700 dark:text-purple-100/70 text-xs mt-0.5">
                Ailment: {actionPrompt.ailmentDescription}
              </div>
            )}
          </div>

          {/* Drag-Drop Zone - Now in header row */}
          <div
            ref={drop}
            className={dropZoneClasses}
            style={{
              minHeight: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {selectedItem ? (
              <div className="flex flex-col items-center">
                <div className={`${isPrescribe ? 'text-purple-800 dark:text-purple-100' : 'text-white'} font-bold text-sm`}>{selectedItem.name}</div>
                <div className={`${isPrescribe ? 'text-purple-700 dark:text-purple-100/70' : 'text-white/70'} text-xs mt-0.5`}>
                  Available: {maxAmount}
                </div>
              </div>
            ) : (
              <p className={`${isPrescribe ? 'text-purple-700 dark:text-purple-100/80' : 'text-white/80'} text-xs text-center`}>
                Drag item here
              </p>
            )}
          </div>
        </div>


        {/* Suggested Items Hint with Availability Check */}
        {!selectedItem && actionPrompt.suggestedItems && actionPrompt.suggestedItems.length > 0 && (
          <div className="mb-2 space-y-1">
            {/* Available items */}
            {availableItems.length > 0 && (
              <div className={`${isPrescribe ? 'text-purple-700 dark:text-purple-100/70' : 'text-white/70'} text-xs italic`}>
                ✓ In stock: {availableItems.join(', ')}
              </div>
            )}

            {/* Missing items with suggestion to mix */}
            {missingItems.length > 0 && (
              <div className={`${isPrescribe ? 'text-amber-700 dark:text-amber-300' : 'text-yellow-200'} text-xs font-semibold`}>
                ✗ Not in stock: {missingItems.join(', ')}
                <br />
                <span className={`${isPrescribe ? 'text-purple-800 dark:text-purple-200' : 'text-white'} italic`}>
                  → Consider mixing an alternative remedy
                </span>
              </div>
            )}
          </div>
        )}

        {/* Route Selection (prescribe only) */}
        {actionPrompt.type === 'prescribe' && selectedItem && (
          <div className="mb-3">
            <label className="block text-purple-700 dark:text-purple-200 text-xs font-semibold mb-1.5 uppercase tracking-wide">
              Route of Administration *
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(routeImages).map(([route, image]) => (
                <button
                  key={route}
                  type="button"
                  onClick={() => setSelectedRoute(route)}
                  className="relative overflow-hidden rounded-md transition-all h-16 border-2"
                  style={{
                    borderColor: selectedRoute === route ? '#9333ea' : 'rgba(147, 51, 234, 0.3)',
                    boxShadow: selectedRoute === route ? '0 0 0 2px rgba(147, 51, 234, 0.2)' : 'none',
                    transform: selectedRoute === route ? 'scale(1.02)' : 'scale(1)',
                    opacity: selectedRoute === route ? 1 : 0.7
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'brightness(0.75) sepia(0.2)'
                    }}
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-1 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                    <span
                      className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
                      style={{
                        background: selectedRoute === route ? 'rgba(147, 51, 234, 0.9)' : 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      {route}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bloodletting Section (prescribe only, collapsible) */}
        {actionPrompt.type === 'prescribe' && selectedItem && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setBloodlettingExpanded(!bloodlettingExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-purple-300/60 dark:border-purple-500/40 bg-purple-50/50 dark:bg-purple-500/10 hover:bg-purple-100/50 dark:hover:bg-purple-500/15 transition-colors"
            >
              <span className="text-purple-700 dark:text-purple-200 text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
                🩸 Bloodletting (Optional)
              </span>
              <span className="text-purple-600 dark:text-purple-300 text-sm">
                {bloodlettingExpanded ? '▼' : '▶'}
              </span>
            </button>

            {bloodlettingExpanded && (
              <div className="mt-2 p-3 rounded-lg border border-red-300/50 dark:border-red-500/30 bg-red-50/30 dark:bg-red-900/10 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-red-700 dark:text-red-300 text-xs font-semibold uppercase tracking-wide">
                    Include Phlebotomy
                  </label>
                  <button
                    type="button"
                    onClick={() => setIncludeBloodletting(!includeBloodletting)}
                    className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                      includeBloodletting
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500'
                    }`}
                  >
                    {includeBloodletting ? 'Enabled ✓' : 'Disabled'}
                  </button>
                </div>

                {includeBloodletting && (
                  <div className="space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-700 dark:text-red-300">Blood Amount:</span>
                      <span className="font-bold text-red-700 dark:text-red-300">{bloodAmount} ounces</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="24"
                      step="2"
                      value={bloodAmount}
                      onChange={(e) => setBloodAmount(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: '#dc2626' }}
                    />
                    <div className="flex justify-between text-[10px] text-red-600 dark:text-red-400">
                      <span>4 oz (Safe)</span>
                      <span>12 oz (Moderate)</span>
                      <span>24 oz (Risky)</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Controls and Action Buttons - All on one row */}
        <div className="flex flex-wrap gap-2 items-end justify-between">
          {/* Left side: Amount and Price Controls (compact) */}
          {selectedItem && (
            <div className="flex gap-2 items-end">
              {/* Amount */}
              <div className="w-20">
                <label className={`${amountLabelClass} mb-0.5`}>
                  Amt:
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxAmount}
                  value={amount}
                  onChange={(e) => setAmount(Math.min(maxAmount, Math.max(1, parseInt(e.target.value) || 1)))}
                  className={inputClass}
                />
              </div>

              {/* Price (for sell and prescribe types) */}
              {(actionPrompt.type === 'sell' || actionPrompt.type === 'prescribe') && (
                <div className="w-24">
                  <label className={`${amountLabelClass} mb-0.5`}>
                    Price:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className={priceInputClass}
                    placeholder={actionPrompt.priceOffered ? actionPrompt.priceOffered.toString() : "0"}
                  />
                </div>
              )}
            </div>
          )}

          {/* Right side: Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-end ml-auto">
            {/* Mix a Remedy Button - Always available */}
            {onMix && (
              <button
                onClick={handleMixClick}
                className={`${secondaryButtonClass} flex items-center gap-1`}
                title="Open mixing workshop to craft a remedy"
              >
                🧪 Mix a Remedy
              </button>
            )}

            {/* Primary Action Button */}
            <button
              onClick={handlePropose}
              disabled={!selectedItem || (actionPrompt.type === 'prescribe' && !selectedRoute)}
              className={`${primaryButtonClass} ${
                (!selectedItem || (actionPrompt.type === 'prescribe' && !selectedRoute)) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer shadow-md hover:shadow-lg'
              }`}
            >
              {actionPrompt.type === 'sell' ? 'Complete Sale' : actionPrompt.type === 'give' ? 'Give Item' : 'Offer Prescription'}
            </button>

            {/* Decline Button */}
            <button
              onClick={() => onDecline(actionPrompt)}
              className={secondaryButtonClass}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
