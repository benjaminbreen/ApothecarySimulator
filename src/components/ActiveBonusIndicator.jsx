/**
 * Active Bonus Indicator
 *
 * Small banner showing active profession bonuses for current activity
 * Context-aware: displays relevant bonuses based on activity type
 *
 * Usage:
 *   <ActiveBonusIndicator
 *     context="mixing" | "prescribing" | "bloodletting"
 *     profession={chosenProfession}
 *     playerLevel={playerLevel}
 *     additionalData={{ itemName: "Hemlock", patientType: "nobility" }}
 *   />
 */

import React from 'react';
import {
  PROFESSIONS,
  getProfessionIcon,
  getProfessionName,
  // Mixing bonuses
  getMixingTimeMultiplier,
  // Prescribing bonuses
  getXPMultiplier,
  getPaymentMultiplier,
  getToxicXPBonus,
  // Bloodletting bonuses
  getBloodlettingDifficultyReduction,
  getComplicationChanceReduction,
  getBloodlettingPaymentBonus
} from '../core/systems/professionAbilities';

/**
 * Get profession color
 */
function getProfessionColor(professionId) {
  const colors = {
    [PROFESSIONS.ALCHEMIST]: '#8b5cf6',
    [PROFESSIONS.HERBALIST]: '#16a34a',
    [PROFESSIONS.SURGEON]: '#dc2626',
    [PROFESSIONS.POISONER]: '#1f2937',
    [PROFESSIONS.SCHOLAR]: '#0ea5e9',
    [PROFESSIONS.COURT_PHYSICIAN]: '#f59e0b'
  };
  return colors[professionId] || '#6b7280';
}

/**
 * Get active bonuses for context
 */
function getActiveBonuses(context, profession, playerLevel, additionalData = {}) {
  if (!profession || playerLevel < 10) return [];

  const bonuses = [];

  switch (context) {
    case 'mixing': {
      const speedMultiplier = getMixingTimeMultiplier(profession, playerLevel);
      if (speedMultiplier < 1.0) {
        const percentFaster = Math.round((1 - speedMultiplier) * 100);
        bonuses.push({
          icon: '⚡',
          text: `Mixing ${percentFaster}% faster`,
          source: 'Swift Compounds'
        });
      }
      break;
    }

    case 'prescribing': {
      const xpMultiplier = getXPMultiplier(profession, playerLevel);
      if (xpMultiplier > 1.0) {
        const percentBonus = Math.round((xpMultiplier - 1) * 100);
        bonuses.push({
          icon: '📚',
          text: `+${percentBonus}% XP from all actions`,
          source: 'Eternal Student'
        });
      }

      if (additionalData.patientType) {
        const paymentMultiplier = getPaymentMultiplier(profession, playerLevel, additionalData.patientType);
        if (paymentMultiplier > 1.0) {
          const percentBonus = Math.round((paymentMultiplier - 1) * 100);
          bonuses.push({
            icon: '👑',
            text: `+${percentBonus}% payment from ${additionalData.patientType}`,
            source: 'Royal Favor'
          });
        }
      }

      if (additionalData.itemName) {
        const toxicBonus = getToxicXPBonus(profession, playerLevel, additionalData.itemName);
        if (toxicBonus > 1.0) {
          const percentBonus = Math.round((toxicBonus - 1) * 100);
          bonuses.push({
            icon: '☠️',
            text: `+${percentBonus}% XP from toxic substances`,
            source: 'Toxic Expertise'
          });
        }
      }
      break;
    }

    case 'bloodletting': {
      const difficultyReduction = getBloodlettingDifficultyReduction(profession, playerLevel);
      if (difficultyReduction > 0) {
        bonuses.push({
          icon: '🩸',
          text: `-${difficultyReduction} difficulty to all veins`,
          source: 'Master Surgeon'
        });
      }

      const complicationReduction = getComplicationChanceReduction(profession, playerLevel);
      if (complicationReduction > 0) {
        const percentReduction = Math.round(complicationReduction * 100);
        bonuses.push({
          icon: '🛡️',
          text: `${percentReduction}% chance to prevent complications`,
          source: 'Steady Hand'
        });
      }

      const paymentBonus = getBloodlettingPaymentBonus(profession, playerLevel);
      if (paymentBonus > 1.0) {
        const percentBonus = Math.round((paymentBonus - 1) * 100);
        bonuses.push({
          icon: '💰',
          text: `+${percentBonus}% payment for bloodletting`,
          source: 'Surgical Reputation'
        });
      }
      break;
    }

    // Note: Foraging bonuses not yet implemented
    // case 'foraging': {
    //   // Future implementation for Herbalist foraging bonuses
    //   break;
    // }

    default:
      break;
  }

  return bonuses;
}

/**
 * Main Component
 */
export default function ActiveBonusIndicator({
  context,
  profession,
  playerLevel,
  additionalData = {}
}) {
  const bonuses = getActiveBonuses(context, profession, playerLevel, additionalData);

  if (bonuses.length === 0) return null;

  const professionColor = getProfessionColor(profession);

  return (
    <div
      className="rounded-lg p-3 mb-4 border-2 transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${professionColor}15, ${professionColor}08)`,
        borderColor: `${professionColor}40`,
        boxShadow: `0 2px 8px ${professionColor}20`
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{getProfessionIcon(profession)}</span>
        <span
          className="font-bold text-sm uppercase tracking-wider"
          style={{ color: professionColor }}
        >
          {getProfessionName(profession)} Bonuses Active
        </span>
      </div>

      {/* Bonuses List */}
      <div className="space-y-1">
        {bonuses.map((bonus, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="text-base">{bonus.icon}</span>
            <span className="font-semibold text-gray-700">{bonus.text}</span>
            <span className="text-gray-500 ml-auto">({bonus.source})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
