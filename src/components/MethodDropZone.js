import React from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd';

const MethodDropZone = ({ method, ingredients = [], onDrop, isLoading }) => {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'simple',
      drop: (item) => onDrop(item, method),
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
    <div className="flex flex-col">
      {/* Method Name */}
      <div className="mb-2">
        <h4 className="font-sans text-sm font-semibold text-ink-900 dark:text-amber-100 tracking-wide">
          {method.name}
        </h4>
        {method.timeCost && (
          <p className="text-xs text-ink-500 dark:text-amber-300/60 font-sans">
            {method.timeCost} hour{method.timeCost !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Drop Zone */}
      <div
        ref={drop}
        className={`
          relative aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-300 group
          ${isOver && canDrop
            ? 'border-amber-500 dark:border-amber-400 shadow-2xl shadow-amber-500/50 scale-105'
            : hasIngredients
            ? 'border-amber-600/60 dark:border-amber-500/40 shadow-xl'
            : 'border-amber-700/30 dark:border-amber-600/20 shadow-lg'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-amber-500/70 dark:hover:border-amber-400/50'}
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

        {/* Ingredients Display */}
        {hasIngredients ? (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex gap-3 flex-wrap justify-center p-4">
              {ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="text-7xl animate-float drop-shadow-2xl"
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
              ))}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-6xl mb-2 text-white/80 drop-shadow-lg animate-bounce">
              ⬇️
            </div>
            <p className="text-sm font-serif text-white/90 bg-ink-900/50 px-3 py-1 rounded-full backdrop-blur-sm">
              Drop Here
            </p>
          </div>
        )}

        {/* Drop indicator overlay */}
        {isOver && canDrop && (
          <div className="absolute inset-0 bg-amber-400/30 dark:bg-amber-300/20 backdrop-blur-sm z-20 border-4 border-amber-400 dark:border-amber-300 animate-pulse"></div>
        )}

        {/* Hover Tooltip */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div className="bg-ink-900/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg p-2.5 border border-amber-500/40">
            <p className="text-xs font-sans italic text-amber-100/90 dark:text-amber-50/90 leading-snug">
              {method.caption}
            </p>
          </div>
        </div>
      </div>

      {/* Ingredient Count */}
      {hasIngredients && (
        <div className="mt-2 text-center">
          <span className="inline-block px-2 py-0.5 bg-botanical-100 dark:bg-emerald-900/40 text-botanical-800 dark:text-emerald-300 rounded text-xs font-sans font-medium">
            {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
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
  isLoading: PropTypes.bool
};

export default MethodDropZone;
