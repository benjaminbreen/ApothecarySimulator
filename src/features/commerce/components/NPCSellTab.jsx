/**
 * NPCSellTab - NPC trade tab for selling items from player inventory to NPC
 *
 * Features:
 * - Displays player's materia medica and other items
 * - Medicine type filtering
 * - Highlights items NPC is interested in
 * - LLM-based price negotiation
 */

import React from 'react';
import CircularRelationshipMeter from './CircularRelationshipMeter';
import BonusCard from './BonusCard';
import InfoCard from './InfoCard';
import ItemRow from './ItemRow';
import NegotiationPanel from './NegotiationPanel';
import { getAllMedicineTypes } from '../../../core/config/medicineCategories';

export default function NPCSellTab({
  // State
  relationshipLevel,
  selectedMerchant,
  skillBonuses,
  tradingNPC,
  isDark,
  medicineTypeFilter,
  setMedicineTypeFilter,
  materiaMedicaItems,
  medicineCountsByType,
  filteredMateriaMedica,
  otherItems,
  selectedSellItem,
  proposedSellPrice,
  negotiationHistory,
  isNegotiating,
  // Handlers
  handleSelectSellItem,
  handleProposeSellPrice,
  handleCancelSellNegotiation
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

        {/* Interest Info */}
        {tradingNPC?.interest && (
          <InfoCard
            title="Interested In"
            icon="⭐"
            color="#10b981"
            expanded={true}
          >
            <div className="grid grid-cols-2 gap-2 mt-2">
              {tradingNPC.interest.items.map((itemName, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-lg text-sm font-semibold font-sans"
                  style={{
                    background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                    border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)',
                    color: isDark ? '#6ee7b7' : '#059669'
                  }}
                >
                  {itemName}
                </div>
              ))}
            </div>
          </InfoCard>
        )}
      </div>

      {/* Middle Section: Scrollable Inventory List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
        {/* Medicine Type Filter Buttons */}
        {materiaMedicaItems.length > 0 && (
          <div className="mb-4 sticky top-0 py-2" style={{
            background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(252, 250, 247, 0.95)',
            backdropFilter: 'blur(12px)',
            zIndex: 10
          }}>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setMedicineTypeFilter('all')}
                className="text-xs px-2.5 py-1.5 rounded-lg transition-all duration-200 font-sans font-medium"
                style={{
                  background: medicineTypeFilter === 'all'
                    ? (isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.2)')
                    : (isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(229, 231, 235, 0.5)'),
                  color: medicineTypeFilter === 'all'
                    ? (isDark ? '#10b981' : '#059669')
                    : (isDark ? '#94a3b8' : '#64748b'),
                  border: medicineTypeFilter === 'all'
                    ? (isDark ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)')
                    : '1px solid transparent'
                }}
              >
                All Materia Medica ({medicineCountsByType.all})
              </button>
              {getAllMedicineTypes().map(type => (
                <button
                  key={type.id}
                  onClick={() => setMedicineTypeFilter(type.id)}
                  className="text-xs px-2.5 py-1.5 rounded-lg transition-all duration-200 font-sans font-medium flex items-center gap-1"
                  style={{
                    background: medicineTypeFilter === type.id
                      ? `${type.color}30`
                      : (isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(229, 231, 235, 0.5)'),
                    color: medicineTypeFilter === type.id
                      ? type.color
                      : (isDark ? '#94a3b8' : '#64748b'),
                    border: medicineTypeFilter === type.id
                      ? `1px solid ${type.color}60`
                      : '1px solid transparent'
                  }}
                >
                  <span>{type.emoji}</span>
                  <span>{medicineCountsByType[type.id] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Materia Medica Section */}
        {filteredMateriaMedica.length > 0 && (
          <>
            <h3 className="text-sm font-bold uppercase tracking-widest text-ink-600 dark:text-amber-400 mb-3 font-sans sticky top-14 py-2" style={{
              background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(252, 250, 247, 0.9)',
              backdropFilter: 'blur(8px)'
            }}>
              Materia Medica
            </h3>
            {filteredMateriaMedica.map((item, idx) => {
              const isInterested = tradingNPC?.interest?.items?.some(
                interestedItem => interestedItem.toLowerCase() === item.name.toLowerCase()
              );
              return (
                <ItemRow
                  key={idx}
                  item={item}
                  highlighted={isInterested}
                  selected={selectedSellItem?.name === item.name}
                  onClick={handleSelectSellItem}
                />
              );
            })}
          </>
        )}

        {/* Other Items Section */}
        {otherItems.length > 0 && (
          <>
            <h3 className="text-sm font-bold uppercase tracking-widest text-ink-600 dark:text-amber-400 mb-3 mt-6 font-sans">
              Other Items
            </h3>
            {otherItems.map((item, idx) => {
              const isInterested = tradingNPC?.interest?.items?.some(
                interestedItem => interestedItem.toLowerCase() === item.name.toLowerCase()
              );
              return (
                <ItemRow
                  key={`other-${idx}`}
                  item={item}
                  highlighted={isInterested}
                  selected={selectedSellItem?.name === item.name}
                  onClick={handleSelectSellItem}
                />
              );
            })}
          </>
        )}

        {/* Empty State */}
        {filteredMateriaMedica.length === 0 && otherItems.length === 0 && (
          materiaMedicaItems.length > 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className={`text-base font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                No items in this category.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className={`text-base font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Your inventory is empty.
              </p>
            </div>
          )
        )}
      </div>

      {/* Bottom Section: Negotiation Panel (when item selected) */}
      {selectedSellItem && (
        <NegotiationPanel
          item={selectedSellItem}
          suggestedPrice={proposedSellPrice}
          onPropose={handleProposeSellPrice}
          onCancel={handleCancelSellNegotiation}
          negotiationHistory={negotiationHistory}
          isNegotiating={isNegotiating}
        />
      )}
    </>
  );
}
