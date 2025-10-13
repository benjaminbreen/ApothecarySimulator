import React from 'react';
import resourceManager from '../../../systems/ResourceManager';

/**
 * RestDurationModal - Choose how long to rest/sleep
 * Allows selection from 30 minutes to full night's sleep (8 hours)
 */
const RestDurationModal = ({ isOpen, onClose, onSelectDuration, currentEnergy, currentHealth }) => {
  if (!isOpen) return null;

  // Rest duration options
  const restOptions = [
    {
      duration: 0.5,
      label: '30 Minutes',
      description: 'Quick rest',
      icon: '☕'
    },
    {
      duration: 1,
      label: '1 Hour',
      description: 'Short nap',
      icon: '😴'
    },
    {
      duration: 2,
      label: '2 Hours',
      description: 'Power nap',
      icon: '💤'
    },
    {
      duration: 4,
      label: '4 Hours',
      description: 'Half sleep',
      icon: '🌙'
    },
    {
      duration: 6,
      label: '6 Hours',
      description: 'Good sleep',
      icon: '🌃'
    },
    {
      duration: 8,
      label: 'Full Night (8 Hours)',
      description: 'Well rested',
      icon: '🛌'
    }
  ];

  const handleSelect = (option) => {
    const regeneration = resourceManager.calculateSleepRegeneration(option.duration);
    onSelectDuration({
      hours: option.duration,
      label: option.label,
      regeneration
    });
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="fixed inset-0 w-full h-full bg-black/70 dark:bg-black/85 flex justify-center items-center z-[1000]">
      <div className="bg-parchment-50 dark:bg-ink-800 p-6 rounded-xl w-[95%] md:w-[600px] shadow-elevation-4 text-left">
        {/* Title */}
        <h3 className="font-display text-2xl md:text-3xl uppercase tracking-wider border-b-2 border-ink-400 dark:border-ink-600 pb-3 mb-5 text-ink-900 dark:text-parchment-50 font-bold">
          How Long to Rest?
        </h3>

        {/* Current Stats */}
        <div className="mb-4 p-3 rounded-lg" style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(249, 245, 235, 0.8) 0%, rgba(252, 250, 247, 0.8) 100%)'
        }}>
          <div className="flex justify-between items-center text-sm">
            <span className="text-ink-700 dark:text-parchment-300">Current Energy:</span>
            <span className="font-bold text-botanical-600 dark:text-botanical-400">{currentEnergy}/100</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-ink-700 dark:text-parchment-300">Current Health:</span>
            <span className="font-bold text-vermillion-600 dark:text-vermillion-400">{currentHealth}/100</span>
          </div>
        </div>

        {/* Rest Options */}
        <div className="space-y-3 mb-5 max-h-[400px] overflow-y-auto custom-scrollbar">
          {restOptions.map((option) => {
            const regeneration = resourceManager.calculateSleepRegeneration(option.duration);
            const newEnergy = Math.min(100, currentEnergy + regeneration.energy);
            const newHealth = Math.min(100, currentHealth + regeneration.health);

            return (
              <button
                key={option.duration}
                onClick={() => handleSelect(option)}
                className="w-full p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] text-left"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(71, 85, 105, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 245, 235, 0.9) 100%)',
                  border: isDark ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(120, 113, 108, 0.3)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{option.icon}</span>
                    <div>
                      <div className="font-bold text-lg text-ink-900 dark:text-parchment-50">
                        {option.label}
                      </div>
                      <div className="text-sm text-ink-600 dark:text-parchment-300 italic">
                        {option.description}
                      </div>
                    </div>
                  </div>

                  {/* Regeneration Preview */}
                  <div className="text-right">
                    <div className="text-sm font-semibold text-botanical-600 dark:text-botanical-400">
                      +{regeneration.energy} Energy
                    </div>
                    <div className="text-sm font-semibold text-vermillion-600 dark:text-vermillion-400">
                      +{regeneration.health} Health
                    </div>
                    <div className="text-xs text-ink-500 dark:text-parchment-400 mt-1">
                      → {newEnergy}/{newHealth}
                    </div>
                  </div>
                </div>

                {/* Well-rested bonus indicator */}
                {regeneration.wellRested && (
                  <div className="mt-2 pt-2 border-t border-ink-300 dark:border-ink-600">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>✨</span>
                      <span>Well Rested Bonus!</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-ink-400 hover:bg-ink-500 dark:bg-ink-600 dark:hover:bg-ink-700 text-white rounded-lg font-bold transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestDurationModal;
