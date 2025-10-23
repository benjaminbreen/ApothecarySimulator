import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';

const DraggableIngredient = ({ simple, onHover, onLeave, isDisabled }) => {
  const [iconPath, setIconPath] = useState(null);
  const [hasIcon, setHasIcon] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ horizontal: 'right', vertical: 'top' });

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
      canDrag: !isDisabled
    }),
    [simple, isDisabled]
  );

  return (
    <div
      ref={drag}
      className={`
        group relative bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200
        dark:from-slate-700 dark:via-slate-600 dark:to-slate-700
        border-2 border-slate-300 dark:border-slate-500
        rounded-xl p-3 transition-all duration-200
        ${isDragging
          ? 'opacity-30 scale-95'
          : isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-grab hover:cursor-grabbing hover:scale-105 hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500 active:scale-95 hover:z-50'
        }
        ${!isDisabled && 'hover:from-amber-50 hover:via-amber-100 hover:to-amber-50 dark:hover:from-amber-900/30 dark:hover:via-amber-800/30 dark:hover:to-amber-900/30'}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => !isDisabled && onLeave && onLeave()}
    >
      {/* Quantity badge */}
      {simple.quantity > 1 && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-botanical-500 to-botanical-700 dark:from-emerald-600 dark:to-emerald-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-800 shadow-lg z-10">
          {simple.quantity}
        </div>
      )}

      {/* Icon or Emoji */}
      <div className="mb-2 text-center flex items-center justify-center" style={{ height: '3rem' }}>
        {hasIcon ? (
          <img
            src={iconPath}
            alt={simple.name}
            className="max-w-[3rem] max-h-[3rem] object-contain filter drop-shadow-lg transition-transform duration-200 group-hover:scale-110"
          />
        ) : (
          <span className="text-4xl filter drop-shadow-lg transition-transform duration-200 group-hover:scale-110">
            {simple.emoji}
          </span>
        )}
      </div>

      {/* Name */}
      <p className="text-sm font-serif font-semibold text-ink-900 dark:text-amber-50 text-center leading-tight truncate">
        {simple.name}
      </p>

      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)'
        }}
      ></div>

      {/* Hover Tooltip - flips position to avoid clipping on edges */}
      {!isDisabled && (
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
  isDisabled: PropTypes.bool
};

export default DraggableIngredient;
