import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';
import {
  getItemRarity,
  getItemQuality,
  getRarityColors,
  shouldShowQualityBadge
} from '../core/systems/itemRarity';

const DraggableIngredient = ({ simple, onHover, onLeave, isDisabled, onClick }) => {
  const [iconPath, setIconPath] = useState(null);
  const [hasIcon, setHasIcon] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ horizontal: 'right', vertical: 'top' });
  const [isDragStarted, setIsDragStarted] = useState(false);

  // Generate icon path from item name
  const getItemIcon = (itemName) => {
    const normalized = itemName
      .toLowerCase()
      .replace(/[']/g, '') // Remove apostrophes
      .replace(/\s+/g, '_'); // Replace spaces with underscores

    return `/icons/${normalized}_icon.png`;
  };

  // Check if icon exists
  useEffect(() => {
    const iconUrl = getItemIcon(simple.name);
    const img = new Image();
    img.onload = () => {
      setIconPath(iconUrl);
      setHasIcon(true);
    };
    img.onerror = () => {
      setIconPath(null);
      setHasIcon(false);
    };
    img.src = iconUrl;
  }, [simple.name]);

  // Determine tooltip position based on element position (flip to avoid clipping)
  const handleMouseEnter = (e) => {
    if (isDisabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const distanceFromRight = viewportWidth - rect.right;
    const distanceFromBottom = viewportHeight - rect.bottom;

    // Determine horizontal position: flip left if < 300px from right edge
    const horizontal = distanceFromRight < 300 ? 'left' : 'right';

    // Determine vertical position: flip up if < 250px from bottom edge (more aggressive)
    // Tooltips are ~180-200px tall, so need more space
    const vertical = distanceFromBottom < 250 ? 'bottom' : 'top';

    setTooltipPosition({ horizontal, vertical });

    if (onHover) onHover(simple);
  };

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'simple',
      item: {
        id: simple.id,
        name: simple.name,
        emoji: simple.emoji
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      }),
      canDrag: !isDisabled,
      isDragging: (monitor) => {
        const item = monitor.getItem();
        if (item && item.id === simple.id) {
          // Clear hover state when dragging starts
          if (onLeave) onLeave();
          setIsDragStarted(true); // Track that drag started
        }
        return item && item.id === simple.id;
      },
      end: () => {
        // Reset drag state after a short delay to prevent click from firing
        setTimeout(() => setIsDragStarted(false), 100);
      }
    }),
    [simple, isDisabled, onLeave]
  );

  // Get rarity and quality for styling
  const rarity = getItemRarity(simple);
  const quality = getItemQuality(simple);
  const showQuality = shouldShowQualityBadge(simple);
  const colors = getRarityColors(rarity);
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Handle click - only if not dragging and onClick is provided
  const handleClick = (e) => {
    if (!isDisabled && onClick && !isDragStarted) {
      e.stopPropagation();
      onClick(simple);
    }
  };

  return (
    <div
      ref={drag}
      className={`
        group relative
        rounded-xl p-1.5 pt-3 pb-1.5 transition-all duration-300
        ${isDragging
          ? 'opacity-30 scale-95'
          : isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : onClick
          ? 'cursor-pointer hover:scale-110 active:scale-95 hover:z-50'
          : 'cursor-grab hover:cursor-grabbing hover:scale-110 active:scale-95 hover:z-50'
        }
      `}
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.85) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(252, 250, 247, 0.99) 50%, rgba(249, 245, 235, 0.95) 100%)',
        backdropFilter: 'blur(12px) saturate(110%)',
        WebkitBackdropFilter: 'blur(12px) saturate(120%)',
        border: isDarkMode ? '1.5px solid rgba(71, 85, 105, 0.5)' : '1.5px solid rgba(180, 175, 165, 0.5)',
        boxShadow: isDarkMode
          ? '0 3px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)'
          : '0 3px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(209, 213, 219, 0.15)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => !isDisabled && onLeave && onLeave()}
      onClick={handleClick}
    >
      {/* Rarity-colored hover glow */}
      {!isDisabled && (
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${colors.glow} 0%, ${colors.bg} 30%, transparent 70%)`,
            backdropFilter: 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: 'blur(16px) saturate(150%)'
          }}
        />
      )}

      {/* Quantity badge - rarity-colored with 3D effect */}
      {simple.quantity > 1 && (
        <div
          className="absolute top-1 right-1 z-20 min-w-[1.15rem] h-[1.1rem] px-1 flex items-center justify-center rounded-xl text-[0.7rem] font-mono font-semibold shadow-lg opacity-80"
          style={{
            background: `linear-gradient(135deg, ${colors.light} 0%, ${colors.primary} 100%)`,
            color: '#fff',
            border: `1px solid ${colors.light}`,
            boxShadow: `0 3px 8px ${colors.glow}, inset 0 1px 2px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(0, 0, 0, 0.2)`,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
          }}
        >
          {simple.quantity}
        </div>
      )}

      {/* Icon or Emoji */}
      <div className="text-center mt-1 flex items-center justify-center relative z-10" style={{ height: '3rem' }}>
        {hasIcon ? (
          <img
            src={iconPath}
            alt={simple.name}
            className="max-w-[3rem] max-h-[3rem] object-contain transition-transform duration-300 group-hover:scale-125"
            style={{
              filter: isDarkMode
                ? `drop-shadow(0 0 6px ${colors.glow})`
                : `drop-shadow(0 0 4px ${colors.glow})`
            }}
          />
        ) : (
          <span
            className="text-3xl transition-transform duration-300 group-hover:scale-125"
            style={{
              filter: isDarkMode
                ? `drop-shadow(0 0 6px ${colors.glow})`
                : `drop-shadow(0 0 4px ${colors.glow})`
            }}
          >
            {simple.emoji}
          </span>
        )}
      </div>

      {/* Name with quality prefix */}
      <div className="text-center w-full relative z-10 mt-1.5">
        <p
          className="text-[0.88rem] font-serif text-ink-900 dark:text-parchment-100 leading-tight drop-shadow-sm transition-colors duration-300"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '1',
            minHeight: '1rem'
          }}
        >
          {showQuality && quality === 'high_quality' && (
            <span style={{ color: '#a855f7' }}>Quality </span>
          )}
          {showQuality && quality === 'exceptional' && (
            <span style={{ color: '#a855f7' }}>Exceptional </span>
          )}
          {simple.name}
        </p>
      </div>

      {/* Rarity-colored border glow on hover */}
      {!isDisabled && (
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `0 0 24px ${colors.glow}, inset 0 0 20px rgba(255, 255, 255, 0.4)`,
            border: `2px solid ${colors.light}`
          }}
        />
      )}

      {/* Hover Tooltip - flips position to avoid clipping on edges */}
      {!isDisabled && !isDragging && (
        <div
          className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-[200px] max-w-[240px] ${
            // Horizontal positioning
            tooltipPosition.horizontal === 'left' ? 'right-full mr-2' : 'left-full ml-2'
          } ${
            // Vertical positioning
            tooltipPosition.vertical === 'bottom' ? 'bottom-0' : 'top-0'
          }`}
        >
          <div className="bg-ink-900 dark:bg-slate-900 backdrop-blur-md rounded-lg p-2 shadow-2xl border-2 border-amber-500/70 dark:border-amber-400/70">
            <h4 className="font-serif text-sm font-bold text-amber-50 dark:text-amber-100 mb-1.5 pb-1.5 border-b border-amber-500/40">
              {simple.name}
            </h4>
            <div className="space-y-1 text-xs text-amber-100 dark:text-amber-200 font-sans">
              <div className="flex justify-between gap-2">
                <span className="font-medium text-amber-200 dark:text-amber-300">Price:</span>
                <span className="font-bold text-yellow-200 dark:text-yellow-300">{simple.price} reales</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="font-medium text-amber-200 dark:text-amber-300">Qty:</span>
                <span className="font-bold text-green-200 dark:text-green-300">{simple.quantity}</span>
              </div>
              {simple.humoralQualities && (
                <div className="pt-1 border-t border-amber-500/30">
                  <p className="text-amber-200 dark:text-amber-300/90 font-semibold mb-0.5 text-[10px]">Qualities:</p>
                  <p className="text-amber-50 dark:text-amber-100 text-[10px] leading-tight">{simple.humoralQualities}</p>
                </div>
              )}
              {simple.medicinalEffects && (
                <div className="pt-0.5">
                  <p className="text-amber-200 dark:text-amber-300/90 font-semibold mb-0.5 text-[10px]">Effects:</p>
                  <p className="text-amber-50 dark:text-amber-100 leading-tight text-[10px]">{simple.medicinalEffects}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DraggableIngredient.propTypes = {
  simple: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
    quantity: PropTypes.number,
    price: PropTypes.number,
    humoralQualities: PropTypes.string,
    medicinalEffects: PropTypes.string
  }).isRequired,
  onHover: PropTypes.func,
  onLeave: PropTypes.func,
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func
};

export default DraggableIngredient;
