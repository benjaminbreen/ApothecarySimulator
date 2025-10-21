/**
 * RandomEventCard - 3-option cards for random gameplay events
 *
 * Displays fast decision points with multiple choices
 * Supports skill checks, reputation impacts, resource costs
 */

import React from 'react';

export default function RandomEventCard({
  eventCard,
  onChoice,
  currentWealth,
  energy,
  health,
  inventory = [],
  isDark = false
}) {
  if (!eventCard || eventCard.type !== 'random_event') return null;

  const { title, description, icon, colorScheme, choices, category } = eventCard;

  // Color schemes based on event category
  const colorSchemes = {
    blue: {
      gradient: 'from-blue-500/90 to-blue-600',
      darkGradient: 'dark:from-blue-700 dark:to-blue-800',
      border: 'border-blue-400/20',
      darkBorder: 'dark:border-blue-600/30',
      textSecondary: 'text-blue-100',
      darkTextSecondary: 'dark:text-blue-200',
      buttonPrimary: 'bg-white hover:bg-blue-50 text-blue-600',
      buttonSecondary: 'bg-white/30 hover:bg-white/40 text-white',
      buttonTertiary: 'bg-white/20 hover:bg-white/30 text-white'
    },
    amber: {
      gradient: 'from-amber-500/90 to-amber-600',
      darkGradient: 'dark:from-amber-700 dark:to-amber-800',
      border: 'border-amber-400/20',
      darkBorder: 'dark:border-amber-600/30',
      textSecondary: 'text-amber-100',
      darkTextSecondary: 'dark:text-amber-200',
      buttonPrimary: 'bg-white hover:bg-amber-50 text-amber-600',
      buttonSecondary: 'bg-white/30 hover:bg-white/40 text-white',
      buttonTertiary: 'bg-white/20 hover:bg-white/30 text-white'
    },
    emerald: {
      gradient: 'from-emerald-500/90 to-emerald-600',
      darkGradient: 'dark:from-emerald-700 dark:to-emerald-800',
      border: 'border-emerald-400/20',
      darkBorder: 'dark:border-emerald-600/30',
      textSecondary: 'text-emerald-100',
      darkTextSecondary: 'dark:text-emerald-200',
      buttonPrimary: 'bg-white hover:bg-emerald-50 text-emerald-600',
      buttonSecondary: 'bg-white/30 hover:bg-white/40 text-white',
      buttonTertiary: 'bg-white/20 hover:bg-white/30 text-white'
    },
    purple: {
      gradient: 'from-purple-500/90 to-purple-600',
      darkGradient: 'dark:from-purple-700 dark:to-purple-800',
      border: 'border-purple-400/20',
      darkBorder: 'dark:border-purple-600/30',
      textSecondary: 'text-purple-100',
      darkTextSecondary: 'dark:text-purple-200',
      buttonPrimary: 'bg-white hover:bg-purple-50 text-purple-600',
      buttonSecondary: 'bg-white/30 hover:bg-white/40 text-white',
      buttonTertiary: 'bg-white/20 hover:bg-white/30 text-white'
    },
    red: {
      gradient: 'from-red-500/90 to-red-600',
      darkGradient: 'dark:from-red-700 dark:to-red-800',
      border: 'border-red-400/20',
      darkBorder: 'dark:border-red-600/30',
      textSecondary: 'text-red-100',
      darkTextSecondary: 'dark:text-red-200',
      buttonPrimary: 'bg-white hover:bg-red-50 text-red-600',
      buttonSecondary: 'bg-white/30 hover:bg-white/40 text-white',
      buttonTertiary: 'bg-white/20 hover:bg-white/30 text-white'
    },
    indigo: {
      gradient: 'from-indigo-500/90 to-indigo-600',
      darkGradient: 'dark:from-indigo-700 dark:to-indigo-800',
      border: 'border-indigo-400/20',
      darkBorder: 'dark:border-indigo-600/30',
      textSecondary: 'text-indigo-100',
      darkTextSecondary: 'dark:text-indigo-200',
      buttonPrimary: 'bg-white hover:bg-indigo-50 text-indigo-600',
      buttonSecondary: 'bg-white/30 hover:bg-white/40 text-white',
      buttonTertiary: 'bg-white/20 hover:bg-white/30 text-white'
    }
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.blue;

  // Button style priority (first choice is primary, others are secondary/tertiary)
  const getButtonStyle = (index) => {
    if (index === 0) return colors.buttonPrimary;
    if (index === 1) return colors.buttonSecondary;
    return colors.buttonTertiary;
  };

  return (
    <div className="animate-fade-in mb-4">
      <div className={`w-full p-5 bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} rounded-xl shadow-lg border-2 ${colors.border} ${colors.darkBorder}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 rounded-full border-2 border-white/40 bg-white/10 flex items-center justify-center">
            <div className="text-3xl">{icon}</div>
          </div>

          {/* Title */}
          <div className="flex-1 text-left">
            <div className="text-white font-bold text-xl mb-1">
              {title}
            </div>
            <div className={`${colors.textSecondary} ${colors.darkTextSecondary} text-xs uppercase tracking-wide font-semibold`}>
              {category.replace('-', ' ')}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="text-white/90 text-base mb-4 leading-relaxed">
          {description}
        </div>

        {/* Choices */}
        <div className="flex flex-wrap gap-2">
          {choices.map((choice, index) => {
            const { action, label, shortLabel, isAffordable, requirements, cost } = choice;

            // Build disabled reason tooltip
            let disabledReason = null;
            if (!isAffordable) {
              if (requirements?.minWealth && currentWealth < requirements.minWealth) {
                disabledReason = `Need ${requirements.minWealth} reales (have ${currentWealth})`;
              } else if (requirements?.minEnergy && energy < requirements.minEnergy) {
                disabledReason = `Need ${requirements.minEnergy} energy (have ${energy})`;
              } else if (requirements?.minHealth && health < requirements.minHealth) {
                disabledReason = `Need ${requirements.minHealth} health (have ${health})`;
              } else if (requirements?.hasItem) {
                disabledReason = `Need ${requirements.hasItem}`;
              } else if (cost?.wealth && currentWealth < cost.wealth) {
                disabledReason = `Can't afford (need ${cost.wealth} reales)`;
              } else {
                disabledReason = 'Requirements not met';
              }
            }

            return (
              <button
                key={action}
                onClick={() => onChoice(action, eventCard)}
                disabled={!isAffordable}
                className={`
                  px-4 py-2.5 ${getButtonStyle(index)} font-semibold rounded-lg
                  transition-all shadow-md flex items-center gap-2
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:shadow-lg hover:scale-105 active:scale-95
                `}
                title={disabledReason || ''}
              >
                <span>{shortLabel || label}</span>
                {cost && (
                  <span className="text-xs opacity-80">
                    {cost.wealth && `(-${cost.wealth} reales)`}
                    {cost.energy && `(-${cost.energy} energy)`}
                    {cost.health && `(-${cost.health} health)`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category badge */}
        <div className="mt-3 text-right">
          <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-white/60 text-xs font-medium">
            Random Event
          </span>
        </div>
      </div>
    </div>
  );
}
