import React from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';

const DraggableIngredient = ({ simple, onHover, onLeave, isDisabled }) => {
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
          : 'cursor-grab hover:cursor-grabbing hover:scale-105 hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500 active:scale-95'
        }
        ${!isDisabled && 'hover:from-amber-50 hover:via-amber-100 hover:to-amber-50 dark:hover:from-amber-900/30 dark:hover:via-amber-800/30 dark:hover:to-amber-900/30'}
      `}
      onMouseEnter={() => !isDisabled && onHover && onHover(simple)}
      onMouseLeave={() => !isDisabled && onLeave && onLeave()}
    >
      {/* Quantity badge */}
      {simple.quantity > 1 && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-botanical-500 to-botanical-700 dark:from-emerald-600 dark:to-emerald-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-800 shadow-lg z-10">
          {simple.quantity}
        </div>
      )}

      {/* Emoji */}
      <div className="text-4xl mb-2 text-center filter drop-shadow-lg transition-transform duration-200 group-hover:scale-110">
        {simple.emoji}
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
    </div>
  );
};

DraggableIngredient.propTypes = {
  simple: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
    quantity: PropTypes.number
  }).isRequired,
  onHover: PropTypes.func,
  onLeave: PropTypes.func,
  isDisabled: PropTypes.bool
};

export default DraggableIngredient;
