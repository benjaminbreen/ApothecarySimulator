import React, { useState } from 'react';
import resourceManager from '../systems/ResourceManager';

const EatAction = ({
  isOpen,
  onClose,
  currentWealth,
  currentEnergy,
  currentHealth,
  onEat,
  transactionManager,
  TRANSACTION_CATEGORIES,
  gameState
}) => {
  const [selectedMeal, setSelectedMeal] = useState(null);

  if (!isOpen) return null;

  // Calculate meal options based on current wealth
  const mealOptions = [
    resourceManager.calculateMealEffects(10), // Good meal (if wealth >= 5)
    resourceManager.calculateMealEffects(3),  // Adequate meal (if wealth >= 2)
    resourceManager.calculateMealEffects(0),  // Poor meal (if wealth < 2)
  ].filter(meal => currentWealth >= meal.cost);

  const handleEat = (meal) => {
    if (currentWealth >= meal.cost) {
      // Log transaction for food purchase
      if (transactionManager && TRANSACTION_CATEGORIES && gameState && meal.cost > 0) {
        const mealName = getMealName(meal.quality);
        transactionManager.logTransaction(
          'expense',
          TRANSACTION_CATEGORIES.FOOD,
          `Ate ${mealName.toLowerCase()}`,
          meal.cost,
          currentWealth - meal.cost, // New wealth after expense
          gameState.date,
          gameState.time
        );
      }

      onEat(meal);
      onClose();
    }
  };

  const getMealIcon = (quality) => {
    switch (quality) {
      case 'good': return '🍲';
      case 'adequate': return '🥘';
      case 'poor': return '🍞';
      default: return '🍽️';
    }
  };

  const getMealName = (quality) => {
    switch (quality) {
      case 'good': return 'Hearty Meal';
      case 'adequate': return 'Simple Meal';
      case 'poor': return 'Meager Rations';
      default: return 'Meal';
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-parchment-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-ink-200 flex items-center justify-between flex-shrink-0">
          <h2 className="font-display text-2xl font-bold text-ink-900">🍽️ Eat a Meal</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-ink-900 text-parchment-50 rounded-lg hover:bg-ink-800 transition-colors font-serif"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">

          {/* Current Status */}
          <div className="bg-botanical-50 border border-botanical-200 rounded-xl p-4 mb-6">
            <h3 className="font-display text-lg font-bold text-ink-900 mb-2">Current Status</h3>
            <div className="space-y-1 text-base font-serif">
              <p className="text-ink-700">Energy: <span className="font-bold text-ink-900">{currentEnergy}/100</span></p>
              <p className="text-ink-700">Wealth: <span className="font-bold text-ink-900">{currentWealth} reales</span></p>
            </div>
            {currentEnergy < 25 && (
              <p className="text-sm text-yellow-700 mt-2 italic">
                😴 You are quite tired. A meal would help restore your vigor.
              </p>
            )}
          </div>

          {/* Meal Options */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-ink-900 mb-3">Available Meals</h3>

            {mealOptions.length === 0 ? (
              <div className="bg-parchment-100 border border-ink-200 rounded-xl p-6 text-center">
                <p className="text-base text-ink-600 font-serif">
                  You cannot afford even the simplest meal. You must earn more reales first.
                </p>
              </div>
            ) : (
              mealOptions.map((meal, index) => (
                <div
                  key={index}
                  className={`bg-white border-2 rounded-xl p-4 transition-all cursor-pointer ${
                    selectedMeal === meal
                      ? 'border-botanical-500 shadow-md'
                      : 'border-parchment-300 hover:border-botanical-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedMeal(meal)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-4xl">{getMealIcon(meal.quality)}</span>
                      <div>
                        <h4 className="font-display text-lg font-bold text-ink-900">
                          {getMealName(meal.quality)}
                        </h4>
                        <p className="text-base text-ink-600 font-serif mb-2">
                          {meal.message}
                        </p>
                        <div className="space-y-1 text-sm font-serif">
                          <p className="text-botanical-700">
                            ⚡ Restores {meal.energy} energy
                          </p>
                          {meal.health > 0 && (
                            <p className="text-danger-600">
                              ❤️ Restores {meal.health} health
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-bold text-ink-900">
                        {meal.cost} reales
                      </p>
                      {currentWealth < meal.cost ? (
                        <p className="text-xs text-danger-600 font-serif">Cannot afford</p>
                      ) : (
                        <p className="text-xs text-botanical-600 font-serif">Available</p>
                      )}
                    </div>
                  </div>

                  {selectedMeal === meal && (
                    <div className="mt-4 pt-4 border-t border-ink-200">
                      <button
                        onClick={() => handleEat(meal)}
                        disabled={currentWealth < meal.cost}
                        className={`w-full px-6 py-3 rounded-lg font-display font-bold text-lg transition-colors ${
                          currentWealth < meal.cost
                            ? 'bg-parchment-200 text-ink-400 cursor-not-allowed'
                            : 'bg-botanical-600 text-white hover:bg-botanical-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {currentWealth < meal.cost ? 'Cannot Afford' : 'Eat This Meal'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Historical Note */}
          <div className="mt-6 bg-ink-100 border border-ink-300 rounded-xl p-4">
            <h4 className="font-display text-sm font-bold text-ink-900 mb-2">📚 Historical Note</h4>
            <p className="text-sm text-ink-700 font-serif leading-relaxed">
              In 17th-century Mexico City, meals varied greatly by social class. The wealthy enjoyed elaborate
              dishes with imported spices, while the poor subsisted on tortillas, beans, and chile. A simple meal
              at a *fonda* (tavern) might cost 1-2 reales, while a feast could cost many times that. Food was not
              just sustenance but a marker of social status and cultural identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EatAction;
