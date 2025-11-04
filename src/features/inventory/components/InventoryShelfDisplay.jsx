/**
 * InventoryShelfDisplay - Visual shelf/list display for Maria's complete inventory
 *
 * Features:
 * - Shelf view with two-column visual layout
 * - List view with sorting (name, value, category, quantity)
 * - Category filtering (materia medica, personal, furniture)
 * - Hover tooltips with item details
 * - Smart icon matching with fallback to emoji
 */

import React, { useState } from 'react';
import { getAllPersonalItems } from '../../../core/systems/personalEffects';
import { getAllMedicineTypes, inferMedicineType } from '../../../core/config/medicineCategories';

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

export default function InventoryShelfDisplay({ gameState, isDark, initialViewMode = 'shelf' }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, alignRight: false });
  const [viewMode, setViewMode] = useState(initialViewMode); // 'shelf' | 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'value' | 'category' | 'quantity'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'materia-medica' | 'personal' | 'furniture'

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
  // Enrich materia medica items with proper medicine type categories
  const materiaMedica = allItems
    .filter(item =>
      item.category === 'Materia Medica & Compounds' || item.type === 'inventory'
    )
    .map(item => {
      // Get the medicine type (Simples, Indies Drugs, etc.)
      const medicineType = inferMedicineType(item);
      const medicineTypeData = getAllMedicineTypes().find(t => t.id === medicineType);

      return {
        ...item,
        displayCategory: medicineTypeData?.name || 'Materia Medica',
        medicineTypeId: medicineType
      };
    });

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

  // Combine enriched materia medica with everything else for complete list
  const allItemsEnriched = [...materiaMedica, ...everythingElse];

  // Apply category filter
  const filteredItems = allItemsEnriched.filter(item => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'materia-medica') {
      return item.displayCategory || item.medicineTypeId;
    }
    if (categoryFilter === 'personal') {
      return item.category === 'Clothing & Textiles' ||
             item.category === 'Personal Items' ||
             item.category === 'Books & Papers';
    }
    if (categoryFilter === 'furniture') {
      return item.category === 'Kitchen & Household' ||
             item.category === 'Shop Equipment' ||
             item.category === 'Religious Items';
    }
    return true;
  });

  // Sorting logic for list view
  const sortedItems = [...filteredItems].sort((a, b) => {
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
        // Use displayCategory for materia medica, otherwise use category
        aVal = a.displayCategory || a.category || '';
        bVal = b.displayCategory || b.category || '';
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
            className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: categoryFilter === 'materia-medica'
                ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)')
                : (isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)'),
              border: categoryFilter === 'materia-medica'
                ? (isDark ? '2px solid rgba(16, 185, 129, 0.5)' : '2px solid rgba(16, 185, 129, 0.4)')
                : (isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)')
            }}
            onClick={() => setCategoryFilter(categoryFilter === 'materia-medica' ? 'all' : 'materia-medica')}
          >
            <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
              Materia Medica {categoryFilter === 'materia-medica' && '✓'}
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
            className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: categoryFilter === 'personal'
                ? (isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)')
                : (isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)'),
              border: categoryFilter === 'personal'
                ? (isDark ? '2px solid rgba(139, 92, 246, 0.5)' : '2px solid rgba(139, 92, 246, 0.4)')
                : (isDark ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.25)')
            }}
            onClick={() => setCategoryFilter(categoryFilter === 'personal' ? 'all' : 'personal')}
          >
            <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
              Clothing & Personal {categoryFilter === 'personal' && '✓'}
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
            className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: categoryFilter === 'furniture'
                ? (isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)')
                : (isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)'),
              border: categoryFilter === 'furniture'
                ? (isDark ? '2px solid rgba(245, 158, 11, 0.5)' : '2px solid rgba(245, 158, 11, 0.4)')
                : (isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.25)')
            }}
            onClick={() => setCategoryFilter(categoryFilter === 'furniture' ? 'all' : 'furniture')}
          >
            <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
              Furniture & Equipment {categoryFilter === 'furniture' && '✓'}
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
                        {item.displayCategory || item.category || 'Miscellaneous'}
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
