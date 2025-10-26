/**
 * ActionPromptCard - Unified card for give/sell/prescribe actions in narrative panel
 *
 * Replaces: SaleInquiryCard, SaleProposalCard, SaleOpportunityCard, etc.
 * Appears when NPCs request items with drag-and-drop interface.
 * Color-coded: green (give), amber (sell), purple (prescribe)
 */

import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';

export default function ActionPromptCard({
  actionPrompt,
  inventory = [],
  onPropose,
  onDecline,
  isDark = false
}) {
  // actionPrompt structure from StateAgent:
  // { type, recipientName, npcId, npcPortrait, context, suggestedItems, priceOffered, ailmentDescription }

  if (!actionPrompt || !actionPrompt.type || actionPrompt.type === 'null') return null;

  const [selectedItem, setSelectedItem] = useState(null);
  const [amount, setAmount] = useState(1);
  const [price, setPrice] = useState(actionPrompt.priceOffered || 0);

  // Reset when actionPrompt changes
  useEffect(() => {
    setSelectedItem(null);
    setAmount(1);
    setPrice(actionPrompt.priceOffered || 0);
  }, [actionPrompt]);

  // Update price when amount changes (for sell type)
  useEffect(() => {
    if (selectedItem && actionPrompt.type === 'sell' && selectedItem.price && !actionPrompt.priceOffered) {
      setPrice(Math.round(selectedItem.price * amount));
    }
  }, [amount, selectedItem, actionPrompt.type, actionPrompt.priceOffered]);

  // Drop zone for inventory items
  const [{ isOver }, drop] = useDrop({
    accept: 'INVENTORY_ITEM',
    drop: (item) => {
      setSelectedItem(item);
      setAmount(1);
      // For sell type, use item price if not specified by NPC
      if (actionPrompt.type === 'sell' && !actionPrompt.priceOffered && item.price) {
        setPrice(item.price);
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
      gradient: 'from-purple-500/90 to-purple-600',
      darkGradient: 'dark:from-purple-700 dark:to-purple-800',
      border: 'border-purple-400/20',
      darkBorder: 'dark:border-purple-600/30',
      textSecondary: 'text-purple-100',
      darkTextSecondary: 'dark:text-purple-200',
      buttonPrimary: 'bg-white hover:bg-purple-50 text-purple-600',
      buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white',
      icon: '⚕️',
      label: 'Prescribe'
    }
  };

  const colors = colorSchemes[actionPrompt.type] || colorSchemes.give;
  const maxAmount = selectedItem
    ? inventory.find(i => i.name.toLowerCase() === selectedItem.name.toLowerCase())?.quantity || 1
    : 1;

  const handlePropose = () => {
    if (!selectedItem) return;

    const itemInInventory = inventory.find(
      i => i.name.toLowerCase() === selectedItem.name.toLowerCase()
    );

    if (!itemInInventory || itemInInventory.quantity < amount) {
      alert(`You don't have enough ${selectedItem.name}!`);
      return;
    }

    onPropose({
      type: actionPrompt.type,
      recipientName: actionPrompt.recipientName,
      npcId: actionPrompt.npcId,
      item: selectedItem,
      amount,
      price: actionPrompt.type === 'sell' ? price : 0,
      ailmentDescription: actionPrompt.ailmentDescription
    });
  };

  return (
    <div className="animate-fade-in mb-4">
      <div className={`w-full p-4 bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder}`}>
        {/* Top Row: NPC Info */}
        <div className="flex items-center gap-3 mb-3">
          {/* NPC Portrait */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
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
            <div className="text-white font-bold text-lg mb-0.5">
              {colors.label} Request
            </div>
            <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-sm font-medium`}>
              {actionPrompt.recipientName} - {actionPrompt.context}
            </div>
            {actionPrompt.type === 'sell' && actionPrompt.priceOffered > 0 && (
              <div className="text-white/70 text-xs mt-0.5">
                Offers {actionPrompt.priceOffered} reales
              </div>
            )}
            {actionPrompt.type === 'prescribe' && actionPrompt.ailmentDescription && (
              <div className="text-white/70 text-xs mt-0.5">
                Ailment: {actionPrompt.ailmentDescription}
              </div>
            )}
          </div>
        </div>

        {/* Drag-Drop Zone */}
        <div
          ref={drop}
          className={`border-2 border-dashed rounded-lg p-3 mb-3 text-center transition-colors ${
            isOver
              ? 'bg-white/20 border-white'
              : 'bg-white/5 border-white/30'
          }`}
          style={{
            minHeight: '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {selectedItem ? (
            <div className="flex flex-col items-center">
              <div className="text-white font-bold text-base">{selectedItem.name}</div>
              <div className="text-white/70 text-xs mt-1">
                Available: {maxAmount}
              </div>
            </div>
          ) : (
            <p className="text-white/80 text-sm">
              Drag an item from your inventory here
            </p>
          )}
        </div>

        {/* Amount and Price Controls */}
        {selectedItem && (
          <div className={`grid gap-2 mb-3 ${actionPrompt.type === 'sell' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Amount */}
            <div>
              <label className="block text-white/90 text-xs font-semibold mb-1">
                Amount:
              </label>
              <input
                type="number"
                min="1"
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(Math.min(maxAmount, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-2 py-1 rounded border border-white/30 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* Price (only for sell type) */}
            {actionPrompt.type === 'sell' && (
              <div>
                <label className="block text-white/90 text-xs font-semibold mb-1">
                  Price (reales):
                </label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2 py-1 rounded border border-white/30 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder={actionPrompt.priceOffered ? actionPrompt.priceOffered.toString() : "Enter price"}
                />
              </div>
            )}
          </div>
        )}

        {/* Suggested Items Hint */}
        {!selectedItem && actionPrompt.suggestedItems && actionPrompt.suggestedItems.length > 0 && (
          <div className="mb-3 text-white/70 text-xs italic">
            Suggested: {actionPrompt.suggestedItems.join(', ')}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePropose}
            disabled={!selectedItem}
            className={`flex-1 px-4 py-2 ${colors.buttonPrimary} font-semibold rounded-lg transition-colors shadow-md ${
              !selectedItem ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Propose {colors.label}
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
  );
}
