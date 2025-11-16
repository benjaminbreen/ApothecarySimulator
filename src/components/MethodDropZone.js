import React from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd';

const MethodDropZone = ({ method, ingredients = [], onDrop, onRemove, isLoading }) => {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'simple',
      drop: (item) => {
        onDrop(item, method);
        // Add haptic feedback on drop
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      })
    }),
    [onDrop, method]
  );

  const hasIngredients = ingredients.length > 0;
  const image = hasIngredients ? method.activeImage : method.image;

  return (
    <div className="flex flex-col relative">
      {/* Ingredient Count Badge - Top Right */}
      {hasIngredients && (
        <div className="absolute -top-2 -right-2 z-30 min-w-[2rem] h-[2rem] px-2 flex items-center justify-center rounded-full text-sm font-bold shadow-xl animate-bounce"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#fff',
            border: '2px solid #fff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
          }}
        >
          {ingredients.length}
        </div>
      )}

      {/* Method Name + Costs */}
      <div className="mb-3 bg-gradient-to-r from-amber-100/50 via-amber-50/30 to-amber-100/50 dark:from-slate-800/50 dark:via-slate-700/30 dark:to-slate-800/50 rounded-lg px-3 py-2 border border-amber-300/30 dark:border-amber-600/20">
        <h4 className="font-display text-xl font-bold text-ink-900 dark:text-amber-100 tracking-wide text-center mb-1">
          {method.name}
        </h4>
        <div className="flex items-center justify-center gap-3 text-xs text-ink-600 dark:text-amber-300/70 font-sans">
          <span className="flex items-center gap-1">
            <span>⚡</span>
            <span>{method.energyCost} energy</span>
          </span>
          <span className="text-ink-400 dark:text-amber-500/50">•</span>
          <span className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{method.timeCost}h</span>
          </span>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={drop}
        className={`
          relative aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-300 group
          ${isOver && canDrop
            ? 'border-amber-500 dark:border-amber-400 shadow-2xl shadow-amber-500/50 scale-105 animate-pulse'
            : hasIngredients
            ? 'border-amber-600/60 dark:border-amber-500/40 shadow-xl'
            : 'border-amber-700/30 dark:border-amber-600/20 shadow-lg hover:shadow-2xl'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-amber-500/70 dark:hover:border-amber-400/50 hover:scale-[1.02]'}
          ${!hasIngredients && !isOver ? 'animate-subtle-pulse' : ''}
        `}
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${
          hasIngredients
            ? 'from-ink-900/80 via-ink-900/40 to-transparent'
            : 'from-ink-900/70 via-ink-900/30 to-transparent group-hover:from-ink-900/60'
        }`}></div>

        {/* Ingredients Display with Remove Buttons */}
        {hasIngredients ? (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex gap-3 flex-wrap justify-center p-4">
              {ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="relative group/ingredient"
                >
                  <div
                    className="text-7xl animate-float animate-ingredient-pop-in drop-shadow-2xl cursor-default"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      textShadow: `
                        0 0 20px rgba(255, 255, 255, 0.8),
                        0 0 40px rgba(255, 165, 0, 0.6),
                        0 0 60px rgba(255, 140, 0, 0.4)
                      `
                    }}
                  >
                    {ing.emoji}
                  </div>
                  {/* Sparkle effect on drop */}
                  <div
                    className="absolute -top-2 -right-2 text-3xl animate-sparkle pointer-events-none"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    ✨
                  </div>
                  <div
                    className="absolute -bottom-2 -left-2 text-2xl animate-sparkle pointer-events-none"
                    style={{ animationDelay: `${i * 0.2 + 0.1}s` }}
                  >
                    ✨
                  </div>
                  {/* Remove button - appears on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove && onRemove(method.name, i);
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-lg opacity-0 group-hover/ingredient:opacity-100 transition-opacity duration-200 flex items-center justify-center border-2 border-white z-20"
                    title={`Remove ${ing.name}`}
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          
          </div>
        )}

        {/* Drop indicator overlay */}
        {isOver && canDrop && (
          <div className="absolute inset-0 bg-amber-400/30 dark:bg-amber-300/20 backdrop-blur-sm z-20 border-4 border-amber-400 dark:border-amber-300 animate-pulse"></div>
        )}

        {/* Hover Tooltip with costs */}
        {!hasIngredients && (
          <div className="absolute inset-x-0 bottom-3 px-3 opacity-0 group-hover:opacity-100  z-10 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
            <div className="bg-ink-900/98 dark:bg-slate-900/98 backdrop-blur-md rounded-lg p-3 border border-amber-500/50 shadow-xl">
              <p className="text-sm font-serif italic text-amber-100 dark:text-amber-50 leading-relaxed mb-2">
                {method.caption}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2 border-t border-amber-500/30">
                {method.timeCost && (
                  <span className="text-xs text-amber-200/90 font-sans font-medium">
                    Time: {method.timeCost} hour{method.timeCost !== 1 ? 's' : ''}
                  </span>
                )}
                {method.energyCost && (
                  <span className="text-xs text-amber-200/90 font-sans font-medium">
                    Energy: {method.energyCost}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success feedback animation */}
        {hasIngredients && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl animate-ping opacity-20">
              ✨
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MethodDropZone.propTypes = {
  method: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    activeImage: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    energyCost: PropTypes.number,
    timeCost: PropTypes.number
  }).isRequired,
  ingredients: PropTypes.array,
  onDrop: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  isLoading: PropTypes.bool
};

export default MethodDropZone;
