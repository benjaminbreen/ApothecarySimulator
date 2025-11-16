import React from 'react';
import { useDrag } from 'react-dnd';
import {
  getItemRarity,
  getItemQuality,
  getRarityColors,
  shouldShowQualityBadge,
  QUALITY_LABELS
} from '../../core/systems/itemRarity';
import MedicineTypeBadge from '../MedicineTypeBadge';
import { getAllPersonalItems } from '../../core/systems/personalEffects';

/**
 * InventoryItemParticles - Beautiful particle effect for newly-added items
 */
function InventoryItemParticles({ itemName }) {
  const [particles, setParticles] = React.useState([]);

  React.useEffect(() => {
    if (!itemName) return;

    // Generate 8-10 sparkle particles
    const particleCount = 10;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 60 - 30, // -30 to 30px horizontal spread
      y: -(Math.random() * 50 + 30), // -30 to -80px vertical movement
      rotation: Math.random() * 360,
      delay: i * 60, // Stagger animation
      duration: 1200 + Math.random() * 400,
    }));

    setParticles(newParticles);

    // Clear particles after animation
    const timeout = setTimeout(() => setParticles([]), 2000);
    return () => clearTimeout(timeout);
  }, [itemName]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 50 }}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            animation: `particle-float-${particle.id} ${particle.duration}ms ease-out forwards`,
            animationDelay: `${particle.delay}ms`,
          }}
        >
          <div
            className="text-base font-bold"
            style={{
              color: '#10b981',
              textShadow: '0 0 12px rgba(16, 185, 129, 0.8), 0 0 6px rgba(16, 185, 129, 0.6)',
              transform: `rotate(${particle.rotation}deg)`,
            }}
          >
            ✨
          </div>
          <style>{`
            @keyframes particle-float-${particle.id} {
              0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(calc(-50% + ${particle.x}px), calc(-50% + ${particle.y}px)) scale(0.3);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}

/**
 * DraggableInventoryItem - Wrapper for draggable inventory items
 */
function DraggableInventoryItem({ item, children }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'INVENTORY_ITEM',
    item: { ...item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [item]);

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'grab' }}>
      {children}
    </div>
  );
}

/**
 * InventoryTab Component
 * Displays player's inventory in a 3-column grid with PNG icons,
 * rarity-based colors, quality badges, and glassomorphic effects
 * Now with Materia Medica / Other Items sections and Grid/List view toggle
 */
export function InventoryTab({ onItemClick, onOpenFullInventory, inventory = [], newlyAddedItemName = null }) {
  const [viewMode, setViewMode] = React.useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = React.useState('name'); // 'name', 'quantity', 'price', 'type'
  const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));
  const [glowingItem, setGlowingItem] = React.useState(null); // Track which item should glow
  const newItemRef = React.useRef(null); // Ref for scrolling to newly-added item

  // Watch for dark mode changes
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Scroll to newly-added item and trigger glow effect
  React.useEffect(() => {
    if (newlyAddedItemName && newItemRef.current) {
      // OPTION 3: Manual parent scrolling to prevent Chrome viewport scroll bug
      // Find the parent scroll container (PlayerStatusPanel's content div)
      let scrollParent = newItemRef.current.parentElement;
      while (scrollParent) {
        const overflowY = window.getComputedStyle(scrollParent).overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          break;
        }
        scrollParent = scrollParent.parentElement;
      }

      if (scrollParent) {
        // Get element and container positions
        const itemRect = newItemRef.current.getBoundingClientRect();
        const containerRect = scrollParent.getBoundingClientRect();

        // Calculate how much to scroll to center the item in its container
        const itemCenter = itemRect.top + itemRect.height / 2;
        const containerCenter = containerRect.top + containerRect.height / 2;
        const scrollOffset = itemCenter - containerCenter;

        // Smooth scroll ONLY the parent container (not the viewport)
        scrollParent.scrollBy({
          top: scrollOffset,
          behavior: 'smooth'
        });
      }

      // Trigger glow effect
      setGlowingItem(newlyAddedItemName);

      // Clear glow after 3 seconds
      const timeout = setTimeout(() => {
        setGlowingItem(null);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [newlyAddedItemName]);

  // Helper function to capitalize item names
  const capitalizeItemName = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper function to check if item is clothing (more comprehensive check)
  const isClothingItem = (item) => {
    if (item.entityType === 'clothing' || item.type === 'clothing') return true;

    // Check for clothing-related keywords in name
    const clothingKeywords = ['bodice', 'coat', 'dress', 'rosary', 'pin', 'shawl', 'gown', 'shirt', 'blouse', 'necklace', 'skirt', 'pants', 'trousers', 'hat', 'cap', 'shoes', 'boots', 'cloak', 'robe', 'tunic', 'vest', 'jacket', 'mantle', 'chemise', 'doublet', 'breeches', 'stockings', 'gloves'];
    const nameLower = (item.name || '').toLowerCase();
    return clothingKeywords.some(keyword => nameLower.includes(keyword));
  };

  // Separate medicine from non-medicine items
  const clothingItems = inventory.filter(item => isClothingItem(item));

  const miscItems = inventory.filter(item => {
    if (isClothingItem(item)) return false;
    return item.entityType === 'misc' || item.type === 'misc' || item.type === 'tool' || item.type === 'weapon';
  });

  // Medicine items are everything that's NOT clothing or misc
  const medicineItems = inventory.filter(item => {
    if (isClothingItem(item)) return false;
    const isMisc = item.entityType === 'misc' || item.type === 'misc' || item.type === 'tool' || item.type === 'weapon';
    return !isMisc;
  });

  const equippedClothing = clothingItems.filter(item => item.equipped);
  const unequippedClothing = clothingItems.filter(item => !item.equipped);

  // Get personal items (only specific items for Other Items section)
  const allowedPersonalItems = ['Account Book', 'Embroidered Shawl (Rebozo)', 'Ivory Comb', 'Linen Chemise', 'Sewing Kit', 'Silver Hand Mirror'];
  const personalItems = React.useMemo(() => {
    return getAllPersonalItems(false)
      .filter(item => allowedPersonalItems.includes(item.name))
      .map(item => ({
        ...item,
        type: 'personal',
        quantity: 1,
        price: item.value
      }));
  }, []);

  // Sort medicine items based on sortBy
  const sortedMedicineItems = React.useMemo(() => {
    const sorted = [...medicineItems];
    switch (sortBy) {
      case 'quantity':
        return sorted.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
      case 'price':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'type':
        return sorted.sort((a, b) => {
          const typeA = a.type || a.entityType || '';
          const typeB = b.type || b.entityType || '';
          return typeA.localeCompare(typeB);
        });
      case 'name':
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [medicineItems, sortBy]);

  // Map item names to icon paths
  const getItemIcon = (itemName) => {
    // Special mappings for items whose names don't match icon filenames
    const iconMappings = {
      'account book': 'commonplace_book',
      'embroidered shawl (rebozo)': 'shawl',
      'embroidered shawl': 'shawl',
      'wool blanket': 'blanket',
      'beeswax candles (bundle)': 'candle',
      'wooden crucifix': 'crucifix',
      'silver hand mirror': 'mirror',
      'pewter plate': 'plate',
    };

    // Normalize item name to match icon filename format
    const normalized = itemName
      .toLowerCase()
      .replace(/[']/g, '') // Remove apostrophes
      .replace(/\s+/g, '_'); // Replace spaces with underscores

    // Check if there's a special mapping, otherwise use normalized name
    const iconName = iconMappings[itemName.toLowerCase()] || normalized;

    const iconPath = `/icons/${iconName}_icon.png`;
    return iconPath;
  };

  // Check if icon exists (fallback to emoji)
  const [loadedIcons, setLoadedIcons] = React.useState({});

  React.useEffect(() => {
    let isMounted = true;

    // Load icons for all items (inventory + personal items)
    const allItems = [...inventory, ...personalItems];

    allItems.forEach(item => {
      const iconPath = getItemIcon(item.name);
      const img = new Image();
      img.onload = () => {
        if (isMounted) {
          setLoadedIcons(prev => ({ ...prev, [item.name]: iconPath }));
        }
      };
      img.onerror = () => {
        if (isMounted) {
          setLoadedIcons(prev => ({ ...prev, [item.name]: null }));
        }
      };
      img.src = iconPath;
    });

    return () => {
      isMounted = false;
    };
  }, [inventory, personalItems]);

  if (inventory.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-3 opacity-20">🏺</div>
        <p className="text-base text-ink-500 dark:text-parchment-400 font-sans font-medium transition-colors duration-300">No items in inventory</p>
        <p className="text-sm text-ink-400 dark:text-parchment-500 font-sans mt-1 transition-colors duration-300">Purchase supplies to begin</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Header with View Toggle and Sort Options */}
      <div className="flex items-center justify-between mb-1 px-1">
        <h3 className="text-[0.7rem] font-bold text-ink-600 dark:text-parchment-400 uppercase tracking-widest transition-colors duration-300 font-sans">
          Materia Medica
        </h3>
        <div className="flex items-center gap-3">
          {/* Sort dropdown (only in list view) */}
          {viewMode === 'list' && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-sans px-1.5 py-0.5 rounded transition-all duration-200"
              style={{
                background: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(229, 231, 235, 0.4)',
                color: isDark ? '#94a3b8' : '#64748b',
                border: 'none',
                outline: 'none'
              }}
            >
              <option value="name">Name</option>
              <option value="quantity">Quantity</option>
              <option value="price">Value</option>
              <option value="type">Type</option>
            </select>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 p-0.5 rounded" style={{
            background: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(229, 231, 235, 0.4)'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              className="p-1 rounded transition-all duration-200"
              style={{
                background: viewMode === 'grid'
                  ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)')
                  : 'transparent',
                color: viewMode === 'grid'
                  ? '#10b981'
                  : (isDark ? '#94a3b8' : '#64748b')
              }}
              title="Grid view"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-1 rounded transition-all duration-200"
              style={{
                background: viewMode === 'list'
                  ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)')
                  : 'transparent',
                color: viewMode === 'list'
                  ? '#10b981'
                  : (isDark ? '#94a3b8' : '#64748b')
              }}
              title="List view"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <span
            className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
            style={{
              background: isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(229, 231, 235, 0.4)',
              color: isDark ? '#94a3b8' : '#64748b'
            }}
          >
            {medicineItems.length}
          </span>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 gap-1.5">
          {medicineItems.slice(0, 18).map((item, idx) => {
        const iconPath = loadedIcons[item.name];
        const hasIcon = iconPath !== null && iconPath !== undefined;

        // Get rarity and quality
        const rarity = getItemRarity(item);
        const quality = getItemQuality(item);
        const showQuality = shouldShowQualityBadge(item);
        const colors = getRarityColors(rarity);

        // Build display name with quality prefix
        const qualityPrefix = quality === 'high_quality' ? 'Quality ' : quality === 'exceptional' ? 'Exceptional ' : '';
        const displayName = qualityPrefix + item.name;

        const isDark = document.documentElement.classList.contains('dark');

        const isNewlyAdded = newlyAddedItemName && item.name.toLowerCase() === newlyAddedItemName.toLowerCase();
        const isGlowing = glowingItem && item.name.toLowerCase() === glowingItem.toLowerCase();

        return (
          <DraggableInventoryItem key={item.name} item={item}>
            <div
              ref={isNewlyAdded ? newItemRef : null}
              className={`relative rounded-xl cursor-pointer group overflow-hidden transition-all duration-300 animate-cascade-in ${isGlowing ? 'inventory-glow-effect' : ''}`}
              title={`${item.name} (${item.quantity})`}
              onClick={() => onItemClick?.(item)}
              style={{
                aspectRatio: '1 / 1',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.85) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(252, 250, 247, 0.99) 50%, rgba(249, 245, 235, 0.95) 100%)',
                backdropFilter: 'blur(12px) saturate(110%)',
                WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                border: isDark ? '1.5px solid rgba(71, 85, 105, 0.5)' : '1.5px solid rgba(180, 175, 165, 0.5)',
                boxShadow: isDark
                  ? '0 3px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)'
                  : '0 3px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(209, 213, 219, 0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animationDelay: `${idx * 50}ms`
              }}
            >
            {/* Rarity-colored hover glow - strong and beautiful */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 30%, ${colors.glow} 0%, ${colors.bg} 30%, transparent 70%)`,
                backdropFilter: 'blur(16px) saturate(150%)',
                WebkitBackdropFilter: 'blur(16px) saturate(150%)',
              }}
            />

            {/* Quantity Badge - Upper Right - Solid 3D effect */}
            <div
              className="absolute top-1 right-1 z-20 min-w-[1.15rem] h-[1.1rem] opacity-80 px-1 flex items-center justify-center rounded-xl text-[0.7rem] font-mono font-semibold shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${colors.light} 0%, ${colors.primary} 100%)`,
                color: '#fff',
                border: `1px solid ${colors.light}`,
                boxShadow: `0 3px 8px ${colors.glow}, inset 0 1px 2px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(0, 0, 0, 0.2)`,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
              }}
            >
              {item.quantity}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-between h-full p-1.5 pt-3 pb-1.5">
              {/* Icon or Emoji - Fixed size container */}
              <div className="flex items-center justify-center" style={{ height: '2.75rem' }}>
                {hasIcon ? (
                  <img
                    src={iconPath}
                    alt={item.name}
                    className="max-w-[3rem] max-h-[3rem] object-contain group-hover:scale-125 transition-transform duration-300 drop-shadow-lg"
                  />
                ) : (
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-300 drop-shadow-md">
                    {item.emoji || '📦'}
                  </span>
                )}
              </div>

              {/* Item Name - Always visible, 2 lines with quality prefix in purple */}
              <div className="text-center w-full mt-1">
                <p
                  className="text-[0.68rem] font-semibold text-ink-900 dark:text-parchment-100 leading-tight drop-shadow-sm transition-colors duration-300"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1',
                    minHeight: '1.33rem',
                  }}
                >
                  {showQuality && (
                    <span style={{ color: '#a855f7' }}>{qualityPrefix}</span>
                  )}
                  {capitalizeItemName(item.name)}
                </p>
              </div>
            </div>

            {/* Hover border glow - rarity-colored, strong effect */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                boxShadow: `0 0 24px ${colors.glow}, inset 0 0 20px rgba(255, 255, 255, 0.4)`,
                border: `2px solid ${colors.light}`,
              }}
            />

            {/* Particle effect for newly-added items */}
            {isNewlyAdded && <InventoryItemParticles itemName={item.name} />}
          </div>
          </DraggableInventoryItem>
        );
      })}
      {medicineItems.length > 18 && (
        <div
          className="rounded-xl flex items-center justify-center relative overflow-hidden cursor-pointer group"
          onClick={() => onOpenFullInventory?.()}
          style={{
            aspectRatio: '1 / 1',
            background: 'linear-gradient(135deg, rgba(187, 247, 208, 0.5) 0%, rgba(134, 239, 172, 0.4) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          <span className="text-xs font-bold text-emerald-700 z-10 relative font-sans">
            +{medicineItems.length - 18} more
          </span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(187, 247, 208, 0.7) 0%, transparent 70%)',
            }}
          />
        </div>
      )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-1.5">
          {sortedMedicineItems.map((item, idx) => {
            const iconPath = loadedIcons[item.name];
            const hasIcon = iconPath !== null && iconPath !== undefined;

            // Get rarity and quality
            const rarity = getItemRarity(item);
            const quality = getItemQuality(item);
            const showQuality = shouldShowQualityBadge(item);
            const colors = getRarityColors(rarity);

            // Get hex color for RGB conversion
            const hexToRgb = (hex) => {
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
              return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
              } : { r: 100, g: 116, b: 139 };
            };

            const rgb = hexToRgb(colors.primary);

            const isNewlyAdded = newlyAddedItemName && item.name.toLowerCase() === newlyAddedItemName.toLowerCase();
            const isGlowing = glowingItem && item.name.toLowerCase() === glowingItem.toLowerCase();

            return (
              <DraggableInventoryItem key={item.name} item={item}>
                <div
                  ref={isNewlyAdded ? newItemRef : null}
                  className={`rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] group relative overflow-hidden ${isGlowing ? 'inventory-glow-effect' : ''}`}
                  onClick={() => onItemClick?.(item)}
                  style={{
                    background: isDark
                      ? `linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 0%, rgba(30, 41, 59, 0.95) 30%, rgba(51, 65, 85, 0.9) 100%)`
                      : `linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, rgba(255, 253, 248, 1) 30%, rgba(252, 248, 242, 0.98) 100%)`,
                    border: isDark
                      ? `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
                      : `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
                    boxShadow: isDark
                      ? `0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
                      : `0 2px 4px rgba(140, 100, 60, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)`
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 0% 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) 0%, transparent 60%)`
                    }}
                  />

                  <div className="relative z-10 flex items-center gap-2.5">
                    {/* Icon with glow */}
                    <div className="flex-shrink-0">
                      {hasIcon ? (
                        <img
                          src={iconPath}
                          alt={item.name}
                          className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-200"
                          style={{
                            filter: isDark
                              ? `drop-shadow(0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4))`
                              : `drop-shadow(0 0 4px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3))`
                          }}
                        />
                      ) : (
                        <span
                          className="text-2xl group-hover:scale-110 transition-transform duration-200"
                          style={{
                            filter: isDark
                              ? `drop-shadow(0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4))`
                              : `drop-shadow(0 0 4px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3))`
                          }}
                        >
                          {item.emoji || '📦'}
                        </span>
                      )}
                    </div>

                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h5
                          className="text-sm font-bold font-sans"
                          style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                        >
                          {showQuality && quality === 'high_quality' && (
                            <span style={{ color: '#a855f7' }}>Quality </span>
                          )}
                          {showQuality && quality === 'exceptional' && (
                            <span style={{ color: '#a855f7' }}>Exceptional </span>
                          )}
                          {capitalizeItemName(item.name)}
                        </h5>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Quantity badge */}
                          <span
                            className="text-xs font-bold font-mono px-1.5 py-0.5 rounded"
                            style={{
                              background: `linear-gradient(135deg, ${colors.light} 0%, ${colors.primary} 100%)`,
                              color: '#fff',
                              border: `1px solid ${colors.light}`,
                              boxShadow: `0 2px 6px ${colors.glow}`,
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
                            }}
                          >
                            ×{item.quantity}
                          </span>
                          {/* Price badge */}
                          {item.price && (
                            <span
                              className="text-xs font-bold font-mono px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: isDark
                                  ? 'rgba(251, 191, 36, 0.2)'
                                  : 'rgba(251, 191, 36, 0.15)',
                                color: isDark ? '#fbbf24' : '#b45309',
                                border: '1px solid rgba(251, 191, 36, 0.3)'
                              }}
                            >
                              ${item.price}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description (truncated) */}
                      {item.description && (
                        <p
                          className="text-[0.7rem] leading-snug line-clamp-1"
                          style={{
                            color: isDark ? '#cbd5e1' : '#475569'
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </DraggableInventoryItem>
            );
          })}
        </div>
      )}

      {/* Other Items - Compact 4-column layout */}
      {(equippedClothing.length > 0 || unequippedClothing.length > 0 || miscItems.length > 0 || personalItems.length > 0) && (
        <div className="space-y-1 pt-3 border-t border-ink-200/40 dark:border-slate-700/40 transition-colors duration-300">
          {/* Other Items Section Header */}
          <h3 className="text-[0.7rem] font-bold text-ink-600 dark:text-parchment-400 uppercase tracking-widest px-1 transition-colors duration-300 font-sans">
            Other Items
          </h3>

          {/* All Other Items in a Single Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {/* Equipped Clothing */}
            {equippedClothing.map((item) => {
              const iconPath = loadedIcons[item.name];
              const hasIcon = iconPath !== null && iconPath !== undefined;

              return (
                <DraggableInventoryItem key={item.name} item={item}>
                  <div
                    className="relative rounded-lg cursor-pointer group overflow-hidden bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-ink-200/50 dark:border-slate-600/50 p-1.5 transition-all duration-200"
                    title={item.name}
                    onClick={() => onItemClick?.(item)}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-0.5 flex items-center justify-center" style={{ height: '1.5rem' }}>
                        {hasIcon ? (
                          <img
                            src={iconPath}
                            alt={item.name}
                            className="max-w-[1.5rem] max-h-[1.5rem] object-contain group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <span>{item.emoji || '👔'}</span>
                        )}
                      </div>
                      <p className="text-[0.55rem] font-semibold text-ink-800 dark:text-parchment-100 leading-tight line-clamp-2 transition-colors duration-300">
                        {capitalizeItemName(item.name)}
                      </p>
                    </div>
                  </div>
                </DraggableInventoryItem>
              );
            })}

            {/* Unequipped Clothing */}
            {unequippedClothing.map((item) => {
              const iconPath = loadedIcons[item.name];
              const hasIcon = iconPath !== null && iconPath !== undefined;

              return (
                <DraggableInventoryItem key={item.name} item={item}>
                  <div
                    className="relative rounded-lg cursor-pointer group overflow-hidden bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-ink-200/50 dark:border-slate-600/50 p-1.5 transition-all duration-200"
                    title={item.name}
                    onClick={() => onItemClick?.(item)}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-0.5 flex items-center justify-center" style={{ height: '1.5rem' }}>
                        {hasIcon ? (
                          <img
                            src={iconPath}
                            alt={item.name}
                            className="max-w-[1.5rem] max-h-[1.5rem] object-contain group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <span>{item.emoji || '👔'}</span>
                        )}
                      </div>
                      <p className="text-[0.55rem] font-semibold text-ink-800 dark:text-parchment-100 leading-tight line-clamp-2 transition-colors duration-300">
                        {capitalizeItemName(item.name)}
                      </p>
                    </div>
                  </div>
                </DraggableInventoryItem>
              );
            })}

            {/* Miscellaneous & Personal Items */}
            {[...miscItems, ...personalItems].map((item) => {
              const iconPath = loadedIcons[item.name];
              const hasIcon = iconPath !== null && iconPath !== undefined;

              return (
                <DraggableInventoryItem key={item.name} item={item}>
                  <div
                    className="relative rounded-lg cursor-pointer group overflow-hidden bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-ink-200/50 dark:border-slate-600/50 p-1.5 transition-all duration-200"
                    title={item.name}
                    onClick={() => onItemClick?.(item)}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-0.5 flex items-center justify-center" style={{ height: '1.5rem' }}>
                        {hasIcon ? (
                          <img
                            src={iconPath}
                            alt={item.name}
                            className="max-w-[1.5rem] max-h-[1.5rem] object-contain group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <span>{item.emoji || '📦'}</span>
                        )}
                      </div>
                      <p className="text-[0.55rem] font-semibold text-ink-800 dark:text-parchment-100 leading-tight line-clamp-2 transition-colors duration-300">
                        {capitalizeItemName(item.name)}
                      </p>
                    </div>
                  </div>
                </DraggableInventoryItem>
              );
            })}
          </div>
        </div>
      )}

      {/* View Full Inventory Link - Always visible at bottom */}
      <div className="pt-3 mt-2 border-t border-ink-200/40 dark:border-slate-700/40">
        <button
          onClick={() => onOpenFullInventory?.()}
          className="w-full py-2 px-3 rounded-lg text-xs font-sans font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
            border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)'
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          View Full Inventory
        </button>
      </div>
    </div>
  );
}
