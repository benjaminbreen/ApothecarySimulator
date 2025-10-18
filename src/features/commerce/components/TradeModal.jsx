/**
 * TradeModal - Modern Trading Interface (ReputationModal Style)
 *
 * Features:
 * - Skill-based pricing (Bargaining, Languages, Etiquette, Reputation)
 * - Haggling mini-game (unlocked at Bargaining 1+)
 * - Multiple merchant types with personalities
 * - Relationship tracking for repeat customers
 * - Black market tab (Bargaining 5+)
 * - Investment tab (Bookkeeping 5+)
 * - NPC trade negotiation with LLM
 * - Clean tabbed interface matching ReputationModal aesthetic
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createChatCompletion } from '../../../core/services/llmService';
import { calculatePriceModifier, FACTIONS } from '../../../core/systems/reputationSystem';
import { getItemRarity, getRarityColors } from '../../../core/systems/itemRarity';
import { getMarketDiscountBonus } from '../../../core/systems/professionAbilities';
import { getAllPersonalItems } from '../../../core/systems/personalEffects';
import { negotiateSale } from '../services/tradeNegotiationService';
import CircularRelationshipMeter from './CircularRelationshipMeter';
import BonusCard from './BonusCard';
import InfoCard from './InfoCard';
import ItemRow from './ItemRow';
import NegotiationPanel from './NegotiationPanel';

// Merchant archetypes with personalities and languages
const MERCHANT_TYPES = {
  MARKET_VENDOR: {
    id: 'market_vendor',
    name: 'Market Vendor',
    languages: ['spanish'],
    personality: 'practical',
    haggleResistance: 0.5,
    portrait: '/portraits/merchant_market.jpg'
  },
  INDIGENOUS_TRADER: {
    id: 'indigenous_trader',
    name: 'Indigenous Trader',
    languages: ['nahuatl', 'spanish'],
    personality: 'traditional',
    haggleResistance: 0.3,
    portrait: '/portraits/merchant_indigenous.jpg'
  },
  FOREIGN_MERCHANT: {
    id: 'foreign_merchant',
    name: 'French Merchant',
    languages: ['french', 'spanish'],
    personality: 'sophisticated',
    haggleResistance: 0.7,
    portrait: '/portraits/merchant_foreign.jpg'
  },
  BLACK_MARKET: {
    id: 'black_market',
    name: 'Black Market Dealer',
    languages: ['spanish', 'portuguese'],
    personality: 'suspicious',
    haggleResistance: 0.9,
    portrait: '/portraits/merchant_black_market.jpg'
  }
};

// Keyword-based icon mapping for personal effects and items
const ICON_KEYWORD_MAP = {
  // Books & Papers
  'book': 'commonplace_book_icon',
  'journal': 'commonplace_book_icon',
  'commonplace': 'commonplace_book_icon',
  'diary': 'commonplace_book_icon',
  'prayer book': 'commonplace_book_icon',
  'recipe book': 'commonplace_book_icon',
  'enquiry': 'commonplace_book_icon',
  'materia medica': 'commonplace_book_icon',
  'theophrastus': 'commonplace_book_icon',
  'dioscorides': 'commonplace_book_icon',
  'hours': 'commonplace_book_icon',
  'letters': 'commonplace_book_icon',
  'hebrew': 'commonplace_book_icon',

  // Clothing & Textiles
  'shawl': 'shawl_icon',
  'rebozo': 'shawl_icon',
  'embroidered': 'shawl_icon',
  'dress': 'dress_icon',
  'wool dress': 'dress_icon',
  'chemise': 'chemise_icon',
  'linen': 'chemise_icon',
  'shoes': 'shoes_icon',
  'leather shoes': 'shoes_icon',
  'mantilla': 'mantilla_icon',
  'lace': 'mantilla_icon',

  // Kitchen & Household
  'pot': 'copper_pot_icon',
  'copper': 'copper_pot_icon',
  'cooking pot': 'copper_pot_icon',
  'kettle': 'copper_pot_icon',
  'pan': 'copper_pot_icon',
  'jug': 'jug_icon',
  'water jug': 'jug_icon',
  'clay': 'jug_icon',
  'spoon': 'spoon_icon',
  'wooden spoon': 'spoon_icon',
  'spoons': 'spoon_icon',
  'plate': 'plate_icon',
  'pewter': 'plate_icon',
  'candle': 'candle_icon',
  'candles': 'candle_icon',
  'beeswax': 'candle_icon',
  'tallow': 'candle_icon',
  'mat': 'mat_icon',
  'petate': 'mat_icon',
  'woven': 'mat_icon',
  'blanket': 'blanket_icon',
  'wool blanket': 'blanket_icon',
  'bedding': 'blanket_icon',
  'quilt': 'blanket_icon',

  // Religious Items
  'crucifix': 'crucifix_icon',
  'cross': 'crucifix_icon',
  'rosary': 'rosary_icon',
  'beads': 'rosary_icon',
  'rosary beads': 'rosary_icon',
  'menorah': 'menorah_icon',

  // Personal Items
  'mirror': 'mirror_icon',
  'hand mirror': 'mirror_icon',
  'silver mirror': 'mirror_icon',
  'looking glass': 'mirror_icon',
  'comb': 'comb_icon',
  'ivory comb': 'comb_icon',
  'ivory': 'comb_icon',
  'sewing': 'sewing_kit_icon',
  'sewing kit': 'sewing_kit_icon',
  'needle': 'sewing_kit_icon',
  'thread': 'sewing_kit_icon',
  'lavender': 'lavender_icon',
  'sachet': 'lavender_icon',
  'dried lavender': 'lavender_icon',

  // Shop Equipment
  'mortar': 'mortar_icon',
  'pestle': 'mortar_icon',
  'mortar & pestle': 'mortar_icon',
  'brass mortar': 'mortar_icon',
  'alembic': 'alembic_icon',
  'glass alembic': 'alembic_icon',
  'distillation': 'alembic_icon',
  'drug jar': 'drug_jar_icon',
  'ceramic jar': 'drug_jar_icon',
  'talavera': 'drug_jar_icon',
  'jar': 'drug_jar_icon',
  'scale': 'scale_icon',
  'balance': 'scale_icon',
  'balance scale': 'scale_icon',
  'brass scale': 'scale_icon',
  'cabinet': 'cabinet_icon',
  'medicine cabinet': 'cabinet_icon',
  'wooden cabinet': 'cabinet_icon',

  // Add more keyword mappings as you add icons
  // Format: 'keyword': 'icon_filename_without_extension'
};

// Helper: Get icon path for item with smart keyword matching
function getItemIcon(itemName) {
  // Try exact match first
  const normalized = itemName
    .toLowerCase()
    .replace(/['()]/g, '')
    .replace(/\s+/g, '_');

  // First attempt: exact match with _icon suffix
  let iconPath = `/icons/${normalized}_icon.png`;

  // Second attempt: exact match without _icon suffix
  if (!iconPath) {
    iconPath = `/icons/${normalized}.png`;
  }

  // Third attempt: keyword-based matching
  const lowerName = itemName.toLowerCase();
  for (const [keyword, iconName] of Object.entries(ICON_KEYWORD_MAP)) {
    if (lowerName.includes(keyword)) {
      // Try with .png extension first
      iconPath = `/icons/${iconName}.png`;
      break;
    }
  }

  // Default fallback - return exact match attempt
  return iconPath || `/icons/${normalized}_icon.png`;
}

// Shelf Inventory Display Component
function InventoryShelfDisplay({ gameState, isDark, initialViewMode = 'shelf' }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, alignRight: false });
  const [viewMode, setViewMode] = useState(initialViewMode); // 'shelf' | 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'value' | 'category' | 'quantity'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Combine inventory items + personal effects
  const personalItems = getAllPersonalItems(false);
  const inventoryItems = gameState.inventory || [];
  const allItems = [
    ...inventoryItems.map(item => ({ ...item, type: 'inventory' })),
    ...personalItems.map(item => ({
      ...item,
      type: 'personal',
      quantity: 1,
      price: item.value
    }))
  ];

  // Separate items: Materia Medica vs Everything Else
  const materiaMedica = allItems.filter(item =>
    item.category === 'Materia Medica & Compounds' || item.type === 'inventory'
  );

  const everythingElse = allItems.filter(item =>
    item.category !== 'Materia Medica & Compounds' && item.type !== 'inventory'
  );

  // Calculate tallies by category
  const clothingAndPersonal = allItems.filter(item =>
    item.category === 'Clothing & Textiles' ||
    item.category === 'Personal Items' ||
    item.category === 'Books & Papers'
  );
  const furniture = allItems.filter(item =>
    item.category === 'Kitchen & Household' ||
    item.category === 'Shop Equipment' ||
    item.category === 'Religious Items'
  );

  const materiaMedicaValue = materiaMedica.reduce((sum, item) => sum + ((item.price || item.value || 0) * (item.quantity || 1)), 0);
  const clothingValue = clothingAndPersonal.reduce((sum, item) => sum + ((item.price || item.value || 0) * (item.quantity || 1)), 0);
  const furnitureValue = furniture.reduce((sum, item) => sum + ((item.price || item.value || 0) * (item.quantity || 1)), 0);

  // Layout: 2 columns (left shelf, right shelf), 5 rows per column, 5 items per row = 25 slots per shelf
  const ROWS_PER_COLUMN = 5;
  const ITEMS_PER_ROW = 5;
  const SLOTS_PER_SHELF = ROWS_PER_COLUMN * ITEMS_PER_ROW;

  // Pad each shelf to fill all slots
  const leftShelfItems = [...materiaMedica];
  while (leftShelfItems.length < SLOTS_PER_SHELF) {
    leftShelfItems.push(null);
  }

  const rightShelfItems = [...everythingElse];
  while (rightShelfItems.length < SLOTS_PER_SHELF) {
    rightShelfItems.push(null);
  }

  const handleMouseEnter = (item, e) => {
    if (!item) return;
    setHoveredItem(item);
    const rect = e.currentTarget.getBoundingClientRect();

    // Check if tooltip would go off screen on the right
    // Assume tooltip width is ~240px (max-w-[240px])
    const tooltipWidth = 240;
    const centerX = rect.left + rect.width / 2;
    const wouldOverflowRight = centerX + tooltipWidth / 2 > window.innerWidth - 20;

    // Position tooltip above the item
    // If near right edge, align to upper-left instead of centered
    setTooltipPosition({
      x: wouldOverflowRight ? rect.right : centerX,
      y: rect.top - 8,
      alignRight: wouldOverflowRight
    });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // Sorting logic for list view
  const sortedItems = [...allItems].sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'value':
        aVal = (a.price || a.value || 0) * (a.quantity || 1);
        bVal = (b.price || b.value || 0) * (b.quantity || 1);
        break;
      case 'category':
        aVal = a.category || '';
        bVal = b.category || '';
        break;
      case 'quantity':
        aVal = a.quantity || 1;
        bVal = b.quantity || 1;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Info Panel */}
      <div
        className="flex-shrink-0 px-8 py-4 border-b"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
            : 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
          borderColor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(209, 213, 219, 0.3)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-xl font-bold font-serif ${isDark ? 'text-amber-100' : 'text-ink-900'}`}>
            Maria's Complete Stock
          </h2>

          {/* View Toggle and Item Count */}
          <div className="flex items-center gap-4">
            <div className={`text-sm font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {allItems.length} total items
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 p-1 rounded-lg" style={{
              background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)',
              border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
            }}>
              <button
                onClick={() => setViewMode('shelf')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'shelf'
                    ? (isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-100 text-emerald-700')
                    : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700')
                }`}
                title="Shelf View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6v12M15 6v12" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'list'
                    ? (isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-100 text-emerald-700')
                    : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700')
                }`}
                title="List View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tally Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Materia Medica */}
          <div
            className="p-3 rounded-lg"
            style={{
              background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)'
            }}
          >
            <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
              Materia Medica
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {materiaMedica.length}
              </span>
              <span className={`text-sm font-sans ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                {materiaMedicaValue} reales
              </span>
            </div>
          </div>

          {/* Clothing & Personal */}
          <div
            className="p-3 rounded-lg"
            style={{
              background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)',
              border: isDark ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.25)'
            }}
          >
            <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
              Clothing & Personal
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                {clothingAndPersonal.length}
              </span>
              <span className={`text-sm font-sans ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                {clothingValue} reales
              </span>
            </div>
          </div>

          {/* Furniture & Equipment */}
          <div
            className="p-3 rounded-lg"
            style={{
              background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)',
              border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.25)'
            }}
          >
            <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
              Furniture & Equipment
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                {furniture.length}
              </span>
              <span className={`text-sm font-sans ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                {furnitureValue} reales
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Display - Shelf or List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {viewMode === 'shelf' ? (
          /* Shelf View */
          <div
          className="relative w-full"
          style={{
          minHeight: '800px',
          backgroundImage: 'url(/ui/inventory.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
            aspectRatio: '1 / 0.7'
          }}
        >
          {/* Items Overlay Grid - Adjusted for shelf alignment */}
          <div
            className="absolute inset-7 grid grid-cols-2 gap-[2%] px-[5%] pt-[7%] pb-[7.5%]"
          >
            {/* Left Shelf Column - Materia Medica */}
            <div className="grid grid-rows-5 gap-[3%] px-[5%] py-1">
              {Array.from({ length: ROWS_PER_COLUMN }).map((_, rowIdx) => (
                <div key={`left-row-${rowIdx}`} className="grid grid-cols-5 gap-[6%]">
                  {Array.from({ length: ITEMS_PER_ROW }).map((_, colIdx) => {
                    const itemIdx = rowIdx * ITEMS_PER_ROW + colIdx;
                    const item = leftShelfItems[itemIdx];

                    return (
                      <div
                        key={`left-${rowIdx}-${colIdx}`}
                        className="relative flex items-center justify-center group aspect-square"
                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {item && (
                          <>
                            <img
                              src={getItemIcon(item.name)}
                              alt={item.name}
                              className="w-full h-full object-contain transition-all duration-200 group-hover:scale-110"
                              style={{
                                filter: 'drop-shadow(0 10px 8px rgba(0, 0, 0, 0.75)) drop-shadow(0 3px 5px rgba(0, 0, 0, 0.9))',
                                imageRendering: '-webkit-optimize-contrast'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            {/* Fallback emoji if icon not found */}
                            <div
                              className="absolute inset-0 flex items-center justify-center text-5xl"
                              style={{ display: 'none' }}
                            >
                              {item.emoji || '📦'}
                            </div>
                            {/* Quantity badge */}
                            {item.quantity > 1 && (
                              <div
                                className="absolute -bottom-0 -right-0 bg-ink-800 dark:bg-slate-800 text-amber-100 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-amber-500"
                                style={{
                                  fontSize: '0.65rem',
                                  fontFamily: 'monospace'
                                }}
                              >
                                {item.quantity}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Right Shelf Column - Everything Else */}
            <div className="grid grid-rows-5 gap-[4%] px-[5%] py-1">
              {Array.from({ length: ROWS_PER_COLUMN }).map((_, rowIdx) => (
                <div key={`right-row-${rowIdx}`} className="grid grid-cols-5 gap-[2%]">
                  {Array.from({ length: ITEMS_PER_ROW }).map((_, colIdx) => {
                    const itemIdx = rowIdx * ITEMS_PER_ROW + colIdx;
                    const item = rightShelfItems[itemIdx];

                    return (
                      <div
                        key={`right-${rowIdx}-${colIdx}`}
                        className="relative flex items-center justify-center group aspect-square"
                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {item && (
                          <>
                            <img
                              src={getItemIcon(item.name)}
                              alt={item.name}
                              className="w-full h-full object-contain transition-all duration-200 group-hover:scale-110"
                              style={{
                                 filter: 'drop-shadow(0 10px 8px rgba(0, 0, 0, 0.75)) drop-shadow(0 3px 5px rgba(0, 0, 0, 0.9))',
                                imageRendering: '-webkit-optimize-contrast'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            {/* Fallback emoji if icon not found */}
                            <div
                              className="absolute inset-0 flex items-center justify-center text-5xl"
                              style={{ display: 'none' }}
                            >
                              {item.emoji || '📦'}
                            </div>
                            {/* Quantity badge */}
                            {item.quantity > 1 && (
                              <div
                                className="absolute -bottom-1 -right-1 bg-ink-900 dark:bg-slate-800 text-amber-100 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-amber-500"
                                style={{
                                  fontSize: '0.65rem',
                                  fontFamily: 'monospace'
                                }}
                              >
                                {item.quantity}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          </div>
        ) : (
          /* List View */
          <div className="p-6">
            {/* Sort Controls */}
            <div className="mb-4 flex gap-2 items-center">
              <span className={`text-sm font-sans font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Sort by:
              </span>
              <div className="flex gap-2">
                {['name', 'value', 'category', 'quantity'].map((field) => (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold uppercase tracking-wide transition-all duration-200 ${
                      sortBy === field
                        ? (isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-100 text-emerald-700')
                        : (isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                    }`}
                  >
                    {field}
                    {sortBy === field && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* List Items */}
            <div className="space-y-2">
              {sortedItems.map((item, idx) => {
                const itemValue = (item.price || item.value || 0);
                const totalValue = itemValue * (item.quantity || 1);

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 rounded-lg hover:shadow-md transition-all duration-200"
                    style={{
                      background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      border: isDark ? '1px solid rgba(71, 85, 105, 0.4)' : '1px solid rgba(209, 213, 219, 0.3)'
                    }}
                    onMouseEnter={(e) => handleMouseEnter(item, e)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12">
                      <img
                        src={getItemIcon(item.name)}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div
                        className="w-full h-full items-center justify-center text-3xl"
                        style={{ display: 'none' }}
                      >
                        {item.emoji || '📦'}
                      </div>
                    </div>

                    {/* Name & Category */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base text-ink-800 dark:text-stone-200 truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-ink-500 dark:text-stone-400 truncate">
                        {item.category || 'Miscellaneous'}
                      </div>
                    </div>

                    {/* Location (for personal items) */}
                    {item.location && (
                      <div className="flex-shrink-0 w-32">
                        <div className="text-xs text-ink-500 dark:text-stone-400 truncate">
                          📍 {item.location}
                        </div>
                      </div>
                    )}

                    {/* Quantity */}
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-xs text-ink-500 dark:text-stone-400">Qty</div>
                      <div className="text-lg font-bold font-mono text-ink-900 dark:text-amber-100">
                        {item.quantity || 1}
                      </div>
                    </div>

                    {/* Unit Value */}
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="text-xs text-ink-500 dark:text-stone-400">Unit</div>
                      <div className="text-sm font-bold font-mono text-ink-900 dark:text-amber-100">
                        {itemValue}
                      </div>
                    </div>

                    {/* Total Value */}
                    <div className="flex-shrink-0 w-24 text-right">
                      <div className="text-xs text-ink-500 dark:text-stone-400">Total</div>
                      <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {totalValue}
                      </div>
                    </div>

                    {/* Cannot Sell Badge */}
                    {item.canSell === false && (
                      <div className="flex-shrink-0">
                        <div className="px-2 py-1 rounded text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
                          Can't Sell
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hover Tooltip - Portal-like positioning (works for both views) */}
        {hoveredItem && (
          <div
            className="fixed z-[200] pointer-events-none"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: tooltipPosition.alignRight ? 'translate(-100%, -100%)' : 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-ink-900 dark:bg-slate-900 backdrop-blur-md rounded-lg p-2 shadow-2xl border-2 border-amber-500/70 dark:border-amber-400/70 min-w-[200px] max-w-[240px]">
              <h4 className="font-serif text-sm font-bold text-amber-50 dark:text-amber-100 mb-1 pb-1 border-b border-amber-500/40">
                {hoveredItem.name}
              </h4>
              <div className="space-y-0.5 text-xs text-amber-100 dark:text-amber-200 font-sans">
                {/* Price/Value */}
                <div className="flex justify-between">
                  <span className="font-medium text-amber-200 dark:text-amber-300">Value:</span>
                  <span className="font-bold text-yellow-200 dark:text-yellow-300">
                    {hoveredItem.price || hoveredItem.value || 0} reales
                  </span>
                </div>

                {/* Quantity */}
                {hoveredItem.quantity > 1 && (
                  <div className="flex justify-between">
                    <span className="font-medium text-amber-200 dark:text-amber-300">Quantity:</span>
                    <span className="font-bold text-green-200 dark:text-green-300">{hoveredItem.quantity}</span>
                  </div>
                )}

                {/* Location (for personal items) */}
                {hoveredItem.location && (
                  <div className="flex justify-between">
                    <span className="font-medium text-amber-200 dark:text-amber-300">Location:</span>
                    <span className="text-amber-100 dark:text-amber-200">{hoveredItem.location}</span>
                  </div>
                )}

                {/* Category */}
                {hoveredItem.category && (
                  <div className="flex justify-between">
                    <span className="font-medium text-amber-200 dark:text-amber-300">Category:</span>
                    <span className="text-amber-100 dark:text-amber-200">{hoveredItem.category}</span>
                  </div>
                )}

                {/* Rarity (for personal items) */}
                {hoveredItem.rarity && (
                  <div className="flex justify-between">
                    <span className="font-medium text-amber-200 dark:text-amber-300">Rarity:</span>
                    <span className="text-amber-100 dark:text-amber-200 capitalize">{hoveredItem.rarity}</span>
                  </div>
                )}

                {/* Description */}
                {hoveredItem.description && (
                  <div className="pt-1 mt-1 border-t border-amber-500/30">
                    <p className="text-amber-50 dark:text-amber-100 leading-tight text-xs">{hoveredItem.description}</p>
                  </div>
                )}

                {/* Cannot Sell warning */}
                {hoveredItem.type === 'personal' && hoveredItem.canSell === false && (
                  <div className="pt-1.5 border-t border-red-500/30">
                    <p className="text-red-300 dark:text-red-400 font-semibold">Cannot Sell</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TradeModal({
  isOpen,
  onClose,
  gameState,
  updateInventory,
  setHistoryOutput,
  currentWealth,
  handleWealthChange,
  addJournalEntry,
  conversationHistory,
  handleTurnEnd,
  reputation,
  transactionManager,
  TRANSACTION_CATEGORIES,
  playerSkills,
  awardXP,
  awardSkillXP,
  // NPC Trade props
  mode = 'market', // 'market' | 'npc' | 'inventory'
  tradingNPC = null, // NPC data when mode is 'npc'
  initialViewMode = 'shelf' // 'shelf' | 'list' - for inventory mode
}) {
  // Determine initial tab based on mode
  const getInitialTab = () => {
    if (mode === 'inventory') return 'full-inventory'; // Personal belongings
    if (mode === 'npc') {
      // For NPC mode, check trade opportunity type
      if (tradingNPC?.type === 'buy') return 'sell-to-npc'; // NPC wants to buy from Maria
      if (tradingNPC?.type === 'sell') return 'buy-from-npc'; // NPC wants to sell to Maria
      return 'sell-to-npc'; // Default to selling
    }
    return 'market'; // Market mode default
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [selectedMerchant, setSelectedMerchant] = useState(
    mode === 'npc' && tradingNPC
      ? {
          id: tradingNPC.npcId || 'npc',
          name: tradingNPC.npcName || 'NPC',
          languages: ['spanish'],
          personality: 'friendly',
          haggleResistance: 0.5,
          portrait: tradingNPC.npcPortrait || '/portraits/default_npc.jpg'
        }
      : MERCHANT_TYPES.MARKET_VENDOR
  );
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [offeredPrice, setOfferedPrice] = useState(0);
  const [isHaggling, setIsHaggling] = useState(false);
  const [merchantResponse, setMerchantResponse] = useState(null);
  const [isFetchingItems, setIsFetchingItems] = useState(false);
  const [relationshipLevel, setRelationshipLevel] = useState(50); // 0-100

  // NPC Sell tab state
  const [selectedSellItem, setSelectedSellItem] = useState(null);
  const [proposedSellPrice, setProposedSellPrice] = useState(0);
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [isNegotiating, setIsNegotiating] = useState(false);

  // NPC Buy tab state
  const [selectedBuyItem, setSelectedBuyItem] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Calculate skill bonuses
  const skillBonuses = useMemo(() => {
    if (!playerSkills) return { total: 0, breakdown: [] };

    const breakdown = [];
    let totalDiscount = 0;

    // Bargaining skill (0-15% discount)
    const bargaining = playerSkills.knownSkills?.bargaining?.level || 0;
    if (bargaining > 0) {
      const discount = bargaining * 0.05; // 5% per level
      totalDiscount += discount;
      breakdown.push({
        name: 'Bargaining',
        level: bargaining,
        value: discount,
        color: '#10b981'
      });
    }

    // Language bonus (10% if you speak merchant's language)
    const merchantLanguages = selectedMerchant.languages || [];
    const hasLanguageMatch = merchantLanguages.some(lang => {
      const skillName = lang === 'nahuatl' ? 'nahuatl' :
                       lang === 'french' ? 'french' :
                       lang === 'english' ? 'english' :
                       lang === 'latin' ? 'latin' : null;
      if (!skillName) return false;
      const skillLevel = playerSkills.knownSkills?.[skillName]?.level || 0;
      return skillLevel >= 2; // Need level 2+ for trading bonus
    });

    if (hasLanguageMatch) {
      totalDiscount += 0.10;
      breakdown.push({
        name: 'Language',
        level: 2,
        value: 0.10,
        color: '#6366f1'
      });
    }

    // Etiquette bonus (10% sympathetic merchant discount at level 2+)
    const etiquette = playerSkills.knownSkills?.etiquette?.level || 0;
    if (etiquette >= 2) {
      totalDiscount += 0.10;
      breakdown.push({
        name: 'Etiquette',
        level: etiquette,
        value: 0.10,
        color: '#8b5cf6'
      });
    }

    // Relationship bonus (up to 10% for repeat customers)
    const relationshipBonus = (relationshipLevel - 50) / 500; // 0-10% based on relationship above 50
    if (relationshipBonus > 0) {
      totalDiscount += relationshipBonus;
      breakdown.push({
        name: 'Relationship',
        level: Math.round(relationshipLevel),
        value: relationshipBonus,
        color: '#f59e0b'
      });
    }

    // Profession bonuses (Herbalist L20/L30, Court Physician L20/L30)
    const professionDiscount = getMarketDiscountBonus(
      gameState.chosenProfession,
      gameState.playerLevel,
      selectedItem?.categories || []
    );

    if (professionDiscount > 0) {
      totalDiscount += professionDiscount;

      // Determine profession name for breakdown
      const professionName = gameState.chosenProfession === 'herbalist' ? 'Herbalist' : 'Court Physician';

      breakdown.push({
        name: professionName,
        level: gameState.playerLevel,
        value: professionDiscount,
        color: '#ec4899'
      });
    }

    return { total: totalDiscount, breakdown };
  }, [playerSkills, selectedMerchant, relationshipLevel, gameState.chosenProfession, gameState.playerLevel, selectedItem]);

  // Calculate reputation modifier
  const reputationModifier = useMemo(() => {
    if (!reputation) return 1.0;
    const merchantRep = reputation.factions[FACTIONS.MERCHANTS] || 50;
    return calculatePriceModifier(merchantRep);
  }, [reputation]);

  // Get final price with all modifiers
  const getFinalPrice = (basePrice) => {
    // Apply reputation modifier first
    let price = basePrice * reputationModifier;
    // Then apply skill bonuses
    price = price * (1 - skillBonuses.total);
    return Math.max(1, Math.round(price));
  };

  // Fetch items from LLM
  useEffect(() => {
    const fetchItems = async () => {
      if (!isOpen) return;

      setIsFetchingItems(true);
      const previousContext = conversationHistory[conversationHistory.length - 1]?.content || '';

      // Adjust prompt based on merchant type
      const merchantContext = selectedMerchant.id === 'black_market'
        ? 'rare, illegal, or contraband items'
        : selectedMerchant.id === 'indigenous_trader'
        ? 'traditional Indigenous medicines, local herbs, and natural ingredients'
        : selectedMerchant.id === 'foreign_merchant'
        ? 'exotic imported goods, spices, and luxury items'
        : 'common market goods, basic medicines, and everyday ingredients';

      const prompt = `
        You are generating items for sale by a ${selectedMerchant.name} in 1680 Mexico City.
        This merchant specializes in ${merchantContext}.

        Previous context:
        "${previousContext}"

        Maria's current wealth is ${currentWealth} reales.

        Generate a list of 4-8 items for sale. Each item should include:
        1. **name**: The item's name (be specific, not generic)
        2. **description**: Brief description (1-2 sentences)
        3. **origin**: Specific origin location
        4. **price**: Price in reales (integer, ranging from 1-20)
        5. **emoji**: Appropriate emoji
        6. **rarity**: 'common', 'uncommon', 'rare', or 'legendary'

        Example:
        [
          {
            "name": "Yucatan Honey",
            "description": "Golden honey harvested from wild bees. Excellent for sweetening medicines.",
            "origin": "Yucatan Peninsula",
            "price": 3,
            "emoji": "🍯",
            "rarity": "common"
          }
        ]

        IMPORTANT: Return ONLY valid JSON array. No backticks, no additional text.
      `;

      try {
        const response = await createChatCompletion([
          { role: 'system', content: 'You are a historical item generator for a trading system. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ], 0.3, 2000, { type: 'json_object' });

        let generatedItems;
        try {
          generatedItems = JSON.parse(response.choices[0].message.content);
        } catch {
          const jsonMatch = response.choices[0].message.content.match(/\[.*?\]/s);
          generatedItems = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        }

        setAvailableItems(generatedItems);
      } catch (error) {
        console.error('[TradeModal] Error fetching items:', error);
        setAvailableItems([]);
      } finally {
        setIsFetchingItems(false);
      }
    };

    fetchItems();
  }, [isOpen, selectedMerchant, conversationHistory, currentWealth]);

  // Handle purchase
  const handlePurchase = async (finalPrice) => {
    if (!selectedItem) return;
    if (currentWealth < finalPrice) {
      setMerchantResponse({ type: 'error', text: 'Not enough wealth to purchase this item.' });
      return;
    }

    const updatedWealth = currentWealth - finalPrice;
    handleWealthChange(updatedWealth);
    updateInventory(selectedItem.name, 1);

    // Log transaction
    if (transactionManager && TRANSACTION_CATEGORIES) {
      transactionManager.logTransaction(
        'expense',
        TRANSACTION_CATEGORIES.INGREDIENTS,
        `Purchased ${selectedItem.name} from ${selectedMerchant.name}`,
        finalPrice,
        updatedWealth,
        gameState.date,
        gameState.time
      );
    }

    // Improve relationship slightly
    setRelationshipLevel(prev => Math.min(100, prev + 2));

    const responseText = `The ${selectedMerchant.name.toLowerCase()} accepts your offer of ${finalPrice} reales for ${selectedItem.name}. **Item added to inventory.**`;
    setHistoryOutput(responseText);
    addJournalEntry(`Purchased ${selectedItem.name} for ${finalPrice} reales.`);

    // Award XP for commerce (+1 XP)
    if (typeof awardXP === 'function') {
      awardXP(1, `commerce_purchase_${selectedItem.name}`);
    }

    // Award bargaining skill XP
    if (typeof awardSkillXP === 'function') {
      awardSkillXP('bargaining', 2);
    }

    await handleTurnEnd(responseText);

    setSelectedItem(null);
    setIsHaggling(false);
  };

  // Handle haggling
  const handleHaggle = async () => {
    if (!selectedItem || offeredPrice <= 0) return;

    const fairPrice = getFinalPrice(selectedItem.price);
    const bargainingLevel = playerSkills?.knownSkills?.bargaining?.level || 0;

    if (bargainingLevel === 0) {
      setMerchantResponse({ type: 'error', text: 'You need Bargaining skill to haggle.' });
      return;
    }

    // Calculate success chance
    const priceRatio = offeredPrice / fairPrice;
    const skillBonus = bargainingLevel * 0.1; // 10% bonus per level
    const relationshipBonus = (relationshipLevel - 50) / 200; // -25% to +25%
    const baseChance = 0.5;

    let successChance = baseChance + skillBonus + relationshipBonus;

    // Adjust based on how far from fair price
    if (priceRatio < 0.7) successChance -= 0.3; // Very low offer
    else if (priceRatio < 0.85) successChance -= 0.1; // Low offer
    else if (priceRatio >= 0.95) successChance += 0.2; // Close to fair

    const success = Math.random() < successChance;

    if (success) {
      // Accept the haggle
      setRelationshipLevel(prev => Math.min(100, prev + 5));
      await handlePurchase(offeredPrice);
    } else {
      // Reject and lower relationship
      setRelationshipLevel(prev => Math.max(0, prev - 3));
      setMerchantResponse({
        type: 'reject',
        text: `The ${selectedMerchant.name.toLowerCase()} scoffs at your offer of ${offeredPrice} reales. "That's insulting! The price is ${fairPrice} reales."`
      });
    }

    setIsHaggling(false);
  };

  // NPC Sell: Handle item selection
  const handleSelectSellItem = (item) => {
    setSelectedSellItem(item);
    setNegotiationHistory([]);
    setIsNegotiating(false);

    // Calculate suggested price (base price with bonuses applied)
    const basePrice = item.price || item.value || 10;
    const suggestedPrice = getFinalPrice(basePrice);
    setProposedSellPrice(suggestedPrice);
  };

  // NPC Sell: Handle price proposal
  const handleProposeSellPrice = async (proposedPrice) => {
    if (!selectedSellItem || proposedPrice <= 0) return;

    setIsNegotiating(true);

    try {
      const fairPrice = getFinalPrice(selectedSellItem.price || selectedSellItem.value || 10);

      // Use LLM-based negotiation service
      const result = await negotiateSale({
        npc: selectedMerchant,
        item: selectedSellItem,
        proposedPrice,
        fairPrice,
        relationshipLevel,
        previousHistory: negotiationHistory,
        playerSkills,
        scenarioContext: '1680 Mexico City'
      });

      if (result.accepted) {
        // NPC accepts the price
        const updatedWealth = currentWealth + proposedPrice;
        handleWealthChange(updatedWealth);

        // Remove item from inventory
        updateInventory(selectedSellItem.name, -1);

        // Log transaction
        if (transactionManager && TRANSACTION_CATEGORIES) {
          transactionManager.logTransaction(
            'income',
            TRANSACTION_CATEGORIES.COMMERCE,
            `Sold ${selectedSellItem.name} to ${selectedMerchant.name}`,
            proposedPrice,
            updatedWealth,
            gameState.date,
            gameState.time
          );
        }

        // Update relationship
        setRelationshipLevel(prev => Math.min(100, Math.max(0, prev + result.relationshipChange)));

        const responseText = `${result.dialogue}\n\n**Item sold for ${proposedPrice} reales. Wealth increased.**`;
        setHistoryOutput(responseText);
        addJournalEntry(`Sold ${selectedSellItem.name} for ${proposedPrice} reales to ${selectedMerchant.name}.`);

        // Award XP
        if (typeof awardXP === 'function') {
          awardXP(1, `commerce_sell_${selectedSellItem.name}`);
        }
        if (typeof awardSkillXP === 'function') {
          awardSkillXP('bargaining', 2);
        }

        await handleTurnEnd(responseText);

        // Clear selection
        setSelectedSellItem(null);
        setNegotiationHistory([]);
      } else {
        // NPC rejects - add to history
        const newHistory = [
          ...negotiationHistory,
          {
            speaker: 'You',
            text: `I'm asking ${proposedPrice} reales for this ${selectedSellItem.name}.`
          },
          {
            speaker: selectedMerchant.name,
            text: result.dialogue
          }
        ];
        setNegotiationHistory(newHistory);

        // Update suggested price to counter-offer if provided
        if (result.counterOffer) {
          setProposedSellPrice(result.counterOffer);
        }

        // Update relationship
        setRelationshipLevel(prev => Math.min(100, Math.max(0, prev + result.relationshipChange)));
      }
    } catch (error) {
      console.error('[TradeModal] Negotiation failed:', error);
      // Show error message
      setNegotiationHistory([
        ...negotiationHistory,
        {
          speaker: 'System',
          text: 'Negotiation failed due to a technical issue. Please try again.'
        }
      ]);
    }

    setIsNegotiating(false);
  };

  // NPC Sell: Cancel negotiation
  const handleCancelSellNegotiation = () => {
    setSelectedSellItem(null);
    setNegotiationHistory([]);
    setIsNegotiating(false);
  };

  // NPC Buy: Handle item selection
  const handleSelectBuyItem = (item) => {
    setSelectedBuyItem(item);
    setBuyQuantity(1);
  };

  // NPC Buy: Handle purchase
  const handleBuyFromNPC = async () => {
    if (!selectedBuyItem || buyQuantity <= 0) return;

    const totalCost = (selectedBuyItem.price || 10) * buyQuantity;

    if (currentWealth < totalCost) {
      setMerchantResponse({ type: 'error', text: 'Not enough wealth to purchase this item.' });
      return;
    }

    // Check if NPC has enough quantity
    if (selectedBuyItem.quantity && buyQuantity > selectedBuyItem.quantity) {
      setMerchantResponse({ type: 'error', text: `${selectedMerchant.name} only has ${selectedBuyItem.quantity} of this item.` });
      return;
    }

    // Process purchase
    const updatedWealth = currentWealth - totalCost;
    handleWealthChange(updatedWealth);
    updateInventory(selectedBuyItem.name, buyQuantity);

    // Log transaction
    if (transactionManager && TRANSACTION_CATEGORIES) {
      transactionManager.logTransaction(
        'expense',
        TRANSACTION_CATEGORIES.INGREDIENTS,
        `Purchased ${buyQuantity}x ${selectedBuyItem.name} from ${selectedMerchant.name}`,
        totalCost,
        updatedWealth,
        gameState.date,
        gameState.time
      );
    }

    // Improve relationship
    setRelationshipLevel(prev => Math.min(100, prev + 2));

    const responseText = `${selectedMerchant.name} sells you ${buyQuantity}x ${selectedBuyItem.name} for ${totalCost} reales. **Items added to inventory.**`;
    setHistoryOutput(responseText);
    addJournalEntry(`Purchased ${buyQuantity}x ${selectedBuyItem.name} for ${totalCost} reales.`);

    // Award XP
    if (typeof awardXP === 'function') {
      awardXP(1, `commerce_buy_from_npc_${selectedBuyItem.name}`);
    }
    if (typeof awardSkillXP === 'function') {
      awardSkillXP('bargaining', 1);
    }

    await handleTurnEnd(responseText);

    // Update NPC's available quantity (if applicable)
    // Note: This requires modifying tradingNPC.offering.items
    // For now, just clear selection
    setSelectedBuyItem(null);
    setBuyQuantity(1);
  };

  // NPC Buy: Cancel selection
  const handleCancelBuy = () => {
    setSelectedBuyItem(null);
    setBuyQuantity(1);
  };

  // Check if tabs are unlocked
  const hasBlackMarketAccess = (playerSkills?.knownSkills?.bargaining?.level || 0) >= 5;
  const hasInvestmentAccess = (playerSkills?.knownSkills?.bookkeeping?.level || 0) >= 5;

  if (!isOpen) return null;

  const isDark = document.documentElement.classList.contains('dark');

  // Always show all tabs - context determines which are active
  const tabs = mode === 'npc'
    ? [
        // NPC Trade Tabs (for NPC-specific trading)
        { id: 'sell-to-npc', label: `Sell to ${selectedMerchant.name}`, icon: '💰', unlocked: true },
        { id: 'buy-from-npc', label: `Buy from ${selectedMerchant.name}`, icon: '🛒', unlocked: true },
      ]
    : [
        // Standard Tabs (always visible)
        { id: 'market', label: 'Market', icon: '🏪', unlocked: true },
        { id: 'black_market', label: 'Black Market', icon: '🎭', unlocked: hasBlackMarketAccess },
        { id: 'investments', label: 'Investments', icon: '💰', unlocked: hasInvestmentAccess },
        { id: 'full-inventory', label: 'Inventory', icon: '📦', unlocked: true },
        { id: 'history', label: 'History', icon: '📜', unlocked: true }
      ];

  return (
    <div
      className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4"
      style={{
        background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(41, 37, 36, 0.5)'
      }}
      onClick={onClose}
    >
      {/* Modal Container - ReputationModal Style */}
      <div
        className={`relative w-full h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-elevation-4 transition-all duration-300 ${
          activeTab === 'full-inventory' || activeTab === 'history' ? 'max-w-7xl' : 'max-w-5xl'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 1.0) 0%, rgba(30, 41, 59, 1.0) 50%, rgba(15, 23, 42, 1.0) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.95) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: isDark
            ? '0 24px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
            : '0 24px 80px rgba(61, 47, 36, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* Decorative Background Gradient */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: '50%',
            height: '70%',
            zIndex: 0,
            overflow: 'hidden',
            opacity: 0.15,
            background: 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.3) 0%, transparent 70%)'
          }}
        />

        {/* Close Button - Floating */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 p-2 rounded-lg transition-all duration-150"
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            border: isDark ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
            boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(243, 244, 246, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke={isDark ? '#fbbf24' : '#3d2817'} viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tab Navigation */}
        <div
          className="flex-shrink-0 flex border-b relative z-10"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
              : 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
            borderColor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(209, 213, 219, 0.3)'
          }}
        >
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const isLocked = !tab.unlocked;

            return (
              <button
                key={tab.id}
                onClick={() => !isLocked && setActiveTab(tab.id)}
                disabled={isLocked}
                className={`flex-1 px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative font-sans ${
                  isLocked ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                style={{
                  fontWeight: isActive ? 700 : 600,
                  letterSpacing: '0.08em',
                  color: isActive
                    ? (isDark ? '#fbbf24' : '#10b981')
                    : (isDark ? '#a8a29e' : '#6b5a47'),
                  background: isActive
                    ? (isDark
                      ? 'linear-gradient(to bottom, rgba(51, 65, 85, 0.9), rgba(30, 41, 59, 0.8))'
                      : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))')
                    : 'transparent',
                  borderLeft: idx > 0
                    ? (isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.2)')
                    : 'none'
                }}
              >
                <span className="mr-2 text-base" style={{ opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
                {tab.label}
                {isLocked && <span className="ml-2">🔒</span>}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: isDark
                        ? 'linear-gradient(to right, #fbbf24, #f59e0b, #fbbf24)'
                        : 'linear-gradient(to right, #10b981, #059669, #10b981)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area - Scrollable */}
        <div
          className="flex-1 overflow-y-auto custom-scrollbar relative z-10"
          style={{
            background: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(252, 250, 247, 0.4)'
          }}
        >
          {/* Inventory Mode Content - Shelf Display */}
          {activeTab === 'full-inventory' && (
            <InventoryShelfDisplay
              gameState={gameState}
              isDark={isDark}
              initialViewMode={initialViewMode}
            />
          )}

          {/* History Tab Content */}
          {activeTab === 'history' && (
            <div className="p-8 space-y-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📜</div>
                <h2 className={`text-2xl font-bold font-serif mb-3 ${isDark ? 'text-amber-100' : 'text-ink-900'}`}>
                  Transaction History
                </h2>
                <p className={`text-base font-sans ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Your past inventory changes, sales, and purchases will appear here.
                </p>
                <p className={`text-sm font-sans italic mt-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Coming soon!
                </p>
              </div>
            </div>
          )}

          {/* NPC Mode Content */}
          {mode === 'npc' && (
            <div className="h-full flex flex-col">
              {activeTab === 'sell-to-npc' && (
                <>
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
                    <h3 className="text-sm font-bold uppercase tracking-widest text-ink-600 dark:text-amber-400 mb-3 font-sans sticky top-0 py-2" style={{
                      background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(252, 250, 247, 0.9)',
                      backdropFilter: 'blur(8px)'
                    }}>
                      Your Inventory
                    </h3>

                    {gameState.inventory && gameState.inventory.length > 0 ? (
                      gameState.inventory.map((item, idx) => {
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
                      })
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <p className={`text-base font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          Your inventory is empty.
                        </p>
                      </div>
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
              )}
              {activeTab === 'buy-from-npc' && (
                <>
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
              )}
            </div>
          )}

          {/* Market Mode Content */}
          {mode === 'market' && activeTab === 'market' && (
            <div className="p-8 space-y-6">
              {/* Relationship Meter */}
              <CircularRelationshipMeter
                value={relationshipLevel}
                merchantName={selectedMerchant.name}
              />

              {/* Bonus Cards Grid */}
              {skillBonuses.breakdown.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ink-600 dark:text-amber-400 mb-3 font-sans">
                    Your Trading Bonuses
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {skillBonuses.breakdown.map((bonus, idx) => {
                      // Map bonus names to component types
                      const typeMap = {
                        'Bargaining': 'bargaining',
                        'Language': 'language',
                        'Etiquette': 'etiquette',
                        'Herbalist': 'profession',
                        'Court Physician': 'profession',
                        'Relationship': 'relationship'
                      };
                      return (
                        <BonusCard
                          key={idx}
                          name={bonus.name}
                          level={bonus.level}
                          value={bonus.value}
                          type={typeMap[bonus.name] || 'bargaining'}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items Section */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink-600 dark:text-amber-400 mb-3 font-sans">
                  Items for Sale
                </h3>
                {isFetchingItems ? (
                  <div className="flex items-center justify-center py-12">
                    <div className={`text-lg font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Loading items for sale...
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {availableItems.map((item, idx) => {
                const rarity = getItemRarity(item);
                const colors = getRarityColors(rarity);
                const finalPrice = getFinalPrice(item.price);
                const hasDiscount = finalPrice < item.price;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedItem(item);
                      setOfferedPrice(finalPrice);
                      setIsHaggling(false);
                      setMerchantResponse(null);
                    }}
                    className={`relative rounded-xl cursor-pointer group overflow-hidden transition-all duration-300 ${
                      selectedItem === item ? 'ring-2 ring-emerald-500' : ''
                    }`}
                    style={{
                      aspectRatio: '1 / 1.15',
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.85) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 250, 247, 0.9) 50%, rgba(249, 245, 235, 0.85) 100%)',
                      backdropFilter: 'blur(12px) saturate(120%)',
                      WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                      border: isDark ? '1.5px solid rgba(71, 85, 105, 0.5)' : '1.5px solid rgba(180, 175, 165, 0.5)',
                      boxShadow: isDark
                        ? '0 3px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : '0 3px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {/* Rarity-colored hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 30%, ${colors.glow} 0%, ${colors.bg} 40%, transparent 70%)`,
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-between h-full p-3">
                      {/* Emoji Icon */}
                      <div className="flex items-center justify-center" style={{ height: '3rem' }}>
                        <span className="text-5xl">{item.emoji || '📦'}</span>
                      </div>

                      {/* Item Name */}
                      <div
                        className="text-center px-2 font-sans font-bold text-sm leading-tight"
                        style={{
                          color: isDark ? colors.light : colors.dark,
                          textShadow: isDark ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none',
                          minHeight: '2.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {item.name}
                      </div>

                      {/* Origin */}
                      <div className={`text-xs font-sans italic text-center px-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {item.origin}
                      </div>

                      {/* Price */}
                      <div className="text-center mt-2">
                        {hasDiscount ? (
                          <div>
                            <div className="text-xs line-through text-gray-400">
                              {item.price} reales
                            </div>
                            <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                              {finalPrice} reales
                            </div>
                          </div>
                        ) : (
                          <div className={`text-base font-bold font-mono ${isDark ? 'text-parchment-200' : 'text-ink-800'}`}>
                            {finalPrice} reales
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel - Selected Item & Purchase */}
        {selectedItem && mode === 'market' && (
          <div
            className="flex-shrink-0 border-t p-6"
            style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))'
                : 'linear-gradient(to top, rgba(248, 246, 241, 0.95), rgba(252, 250, 247, 0.9))',
              borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
            }}
          >
            <div className="flex items-start gap-6">
              {/* Selected Item Details */}
              <div className="flex-1">
                <h3 className={`text-xl font-bold font-serif mb-2 ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
                  {selectedItem.name}
                </h3>
                <p className={`text-sm font-sans mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {selectedItem.description}
                </p>
                <div className={`text-sm font-sans italic ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Origin: {selectedItem.origin}
                </div>
              </div>

              {/* Purchase Controls */}
              <div className="w-80 space-y-3">
                {/* Merchant Response */}
                {merchantResponse && (
                  <div
                    className={`px-4 py-3 rounded-lg text-sm font-sans ${
                      merchantResponse.type === 'error'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    }`}
                  >
                    {merchantResponse.text}
                  </div>
                )}

                {/* Bargaining Controls */}
                {(playerSkills?.knownSkills?.bargaining?.level || 0) >= 1 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(Number(e.target.value))}
                      min="1"
                      className={`flex-1 px-3 py-2 rounded-lg font-mono text-sm border ${
                        isDark
                          ? 'bg-slate-800 border-slate-600 text-parchment-100'
                          : 'bg-white border-gray-300 text-ink-900'
                      }`}
                    />
                    <button
                      onClick={handleHaggle}
                      disabled={offeredPrice <= 0 || currentWealth < offeredPrice}
                      className="px-4 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-200 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Haggle
                    </button>
                  </div>
                )}

                {/* Buy Button */}
                <button
                  onClick={() => handlePurchase(getFinalPrice(selectedItem.price))}
                  disabled={currentWealth < getFinalPrice(selectedItem.price)}
                  className="w-full px-6 py-3 rounded-lg font-sans font-bold text-base transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Buy for {getFinalPrice(selectedItem.price)} reales
                </button>

                {/* Wealth Display */}
                <div className={`text-center text-sm font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Your wealth: <span className="font-bold font-mono">{currentWealth} reales</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
