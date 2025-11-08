/**
 * NPCBuyTab - NPC trade tab for buying items from NPC
 *
 * Features:
 * - Displays items NPC is offering
 * - Quantity selector
 * - Price calculation
 * - Purchase transaction
 */

import React from 'react';
import CircularRelationshipMeter from './CircularRelationshipMeter';
import BonusCard from './BonusCard';
import ItemRow from './ItemRow';

export default function NPCBuyTab({
  // State
  relationshipLevel,
  selectedMerchant,
  skillBonuses,
  tradingNPC,
  isDark,
  selectedBuyItem,
  buyQuantity,
  setBuyQuantity,
  currentWealth,
  // Handlers
  handleSelectBuyItem,
  handleBuyFromNPC,
  handleCancelBuy
}) {
  return (
    <>
      {/* Merchant Info Section: Portrait + Greeting + Ambiance */}
      {(tradingNPC?.portrait || tradingNPC?.greeting || tradingNPC?.shopAmbiance) && (
        <div
          className="flex-shrink-0 p-6 border-b"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
              : 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
            borderColor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(209, 213, 219, 0.3)'
          }}
        >
          <div className="flex gap-6">
            {/* Portrait */}
            {tradingNPC.portrait && (
              <div className="flex-shrink-0">
                <img
                  src={tradingNPC.portrait}
                  alt={selectedMerchant.name}
                  className="w-32 h-32 rounded-xl object-cover border-2"
                  style={{
                    borderColor: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(180, 175, 165, 0.5)',
                    boxShadow: isDark
                      ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                      : '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </div>
            )}

            {/* Shop Info */}
            <div className="flex-1 min-w-0">
              {/* Shop Name */}
              <h2 className={`text-2xl font-bold font-serif mb-2 ${isDark ? 'text-amber-400' : 'text-ink-900'}`}>
                {tradingNPC.shopName || selectedMerchant.name}
              </h2>

              {/* Greeting */}
              {tradingNPC.greeting && (
                <p className={`text-base font-serif italic mb-3 ${isDark ? 'text-parchment-200' : 'text-gray-700'}`}>
                  "{tradingNPC.greeting}"
                </p>
              )}

              {/* Shop Ambiance */}
              {tradingNPC.shopAmbiance && (
                <p className={`text-sm font-sans leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  {tradingNPC.shopAmbiance}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Section: Relationship + Bonuses */}
      <div className="flex-shrink-0 p-6 space-y-4">
        {/* Relationship Meter */}
        <CircularRelationshipMeter
          value={relationshipLevel}
          merchantName={selectedMerchant.name}
        />

        {/* Trading Bonuses */}
        {skillBonuses.breakdown.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-ink-600 dark:text-amber-400 mb-3 font-sans">
              Your Trading Bonuses
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {skillBonuses.breakdown.map((bonus, idx) => {
                const bonusType = bonus.name.toLowerCase().includes('bargaining')
                  ? 'bargaining'
                  : bonus.name.toLowerCase().includes('language')
                  ? 'language'
                  : bonus.name.toLowerCase().includes('etiquette')
                  ? 'etiquette'
                  : bonus.name.toLowerCase().includes('herbalist') || bonus.name.toLowerCase().includes('physician')
                  ? 'profession'
                  : 'relationship';

                return (
                  <BonusCard
                    key={idx}
                    name={bonus.name}
                    level={bonus.level}
                    value={bonus.value}
                    type={bonusType}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Middle Section: Scrollable Items List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-ink-600 dark:text-amber-400 mb-3 font-sans sticky top-0 py-2" style={{
          background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(252, 250, 247, 0.9)',
          backdropFilter: 'blur(8px)'
        }}>
          Available Items
        </h3>

        {tradingNPC?.offering?.items && tradingNPC.offering.items.length > 0 ? (
          tradingNPC.offering.items.map((item, idx) => (
            <ItemRow
              key={idx}
              item={item}
              selected={selectedBuyItem?.name === item.name}
              onClick={handleSelectBuyItem}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className={`text-base font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {selectedMerchant.name} has no items to sell right now.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Section: Purchase Panel (when item selected) */}
      {selectedBuyItem && (
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
                  {selectedBuyItem.name}
                </h3>
                <p className={`text-sm font-sans mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {selectedBuyItem.description || selectedBuyItem.origin || 'Purchase this item.'}
                </p>
                {selectedBuyItem.quantity && (
                  <p className={`text-xs font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Available: {selectedBuyItem.quantity} in stock
                  </p>
                )}
              </div>

              {/* Purchase Controls */}
              <div className="w-80 space-y-3">
                {/* Price Display */}
                <div
                  className="p-3 rounded-lg text-center"
                  style={{
                    background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                    border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.25)'
                  }}
                >
                  <div className={`text-xs font-sans font-semibold uppercase tracking-wide mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    Price per Unit
                  </div>
                  <div className={`text-2xl font-bold font-mono ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                    {selectedBuyItem.price || 10} reales
                  </div>
                </div>

                {/* Quantity Selector */}
                <div>
                  <label className={`block text-xs font-sans font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(Math.max(1, Number(e.target.value)))}
                    min="1"
                    max={selectedBuyItem.quantity || 999}
                    className={`w-full px-4 py-2 rounded-lg font-mono text-lg border ${
                      isDark
                        ? 'bg-slate-800 border-slate-600 text-parchment-100'
                        : 'bg-white border-gray-300 text-ink-900'
                    }`}
                  />
                </div>

                {/* Total Cost Display */}
                <div
                  className="p-3 rounded-lg text-center"
                  style={{
                    background: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)',
                    border: isDark ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(251, 191, 36, 0.25)'
                  }}
                >
                  <div className={`text-xs font-sans font-semibold uppercase tracking-wide mb-1 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                    Total Cost
                  </div>
                  <div className={`text-2xl font-bold font-mono ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                    {(selectedBuyItem.price || 10) * buyQuantity} reales
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleBuyFromNPC}
                    disabled={currentWealth < (selectedBuyItem.price || 10) * buyQuantity}
                    className="flex-1 px-4 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Purchase
                  </button>
                  <button
                    onClick={handleCancelBuy}
                    className={`px-4 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-200 ${
                      isDark
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
