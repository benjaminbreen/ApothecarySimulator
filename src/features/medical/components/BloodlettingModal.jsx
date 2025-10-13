/**
 * Bloodletting Modal
 *
 * Historical phlebotomy interface using the body map.
 * Unlocked with Anatomy Level 1.
 *
 * Features:
 * - Clickable vein locations (basilic, cephalic, temporal, etc.)
 * - Historically accurate 17th century bloodletting practices
 * - Different therapeutic effects per vein (based on humoral theory)
 * - Risk of complications (fainting, infection, excessive blood loss)
 *
 * Historical Context:
 * - Bloodletting was a primary treatment for "plethora" (excess blood)
 * - Different veins treated different ailments (humoral balancing)
 * - Barber-surgeons and physicians performed phlebotomy regularly
 */

import React, { useState } from 'react';
import { performSkillCheck, DIFFICULTY } from '../../../core/systems/skillCheckSystem';
import ActiveBonusIndicator from '../../../components/ActiveBonusIndicator';
import {
  getBloodlettingDifficultyReduction,
  getComplicationChanceReduction,
  getBloodlettingPaymentBonus
} from '../../../core/systems/professionAbilities';

/**
 * Vein locations for phlebotomy
 * Based on 17th century medical texts (Vesalius, Paré, etc.)
 */
const VEINS = [
  // ARM VEINS (most common)
  {
    id: 'basilic-vein-left',
    name: 'Basilic Vein (Left)',
    location: 'Inner left elbow',
    x: 82, // Left arm, inner elbow
    y: 310,
    humoralTarget: 'Liver and Spleen',
    ailments: ['Fever', 'Inflammation', 'Liver disorders', 'Excess blood'],
    difficulty: DIFFICULTY.EASY,
    bloodAmount: 'moderate'
  },
  {
    id: 'basilic-vein-right',
    name: 'Basilic Vein (Right)',
    location: 'Inner right elbow',
    x: 318,
    y: 310,
    humoralTarget: 'Liver and Spleen',
    ailments: ['Fever', 'Inflammation', 'Liver disorders', 'Excess blood'],
    difficulty: DIFFICULTY.EASY,
    bloodAmount: 'moderate'
  },
  {
    id: 'cephalic-vein-left',
    name: 'Cephalic Vein (Left)',
    location: 'Outer left arm',
    x: 100,
    y: 280,
    humoralTarget: 'Head and Shoulders',
    ailments: ['Headache', 'Eye disorders', 'Shoulder pain', 'Melancholy'],
    difficulty: DIFFICULTY.MODERATE,
    bloodAmount: 'light'
  },
  {
    id: 'cephalic-vein-right',
    name: 'Cephalic Vein (Right)',
    location: 'Outer right arm',
    x: 300,
    y: 280,
    humoralTarget: 'Head and Shoulders',
    ailments: ['Headache', 'Eye disorders', 'Shoulder pain', 'Melancholy'],
    difficulty: DIFFICULTY.MODERATE,
    bloodAmount: 'light'
  },
  {
    id: 'median-cubital-left',
    name: 'Median Cubital Vein (Left)',
    location: 'Left elbow crease',
    x: 90,
    y: 300,
    humoralTarget: 'Heart and Lungs',
    ailments: ['Chest pain', 'Shortness of breath', 'Cardiac distress', 'Pleurisy'],
    difficulty: DIFFICULTY.EASY,
    bloodAmount: 'moderate'
  },
  {
    id: 'median-cubital-right',
    name: 'Median Cubital Vein (Right)',
    location: 'Right elbow crease',
    x: 310,
    y: 300,
    humoralTarget: 'Heart and Lungs',
    ailments: ['Chest pain', 'Shortness of breath', 'Cardiac distress', 'Pleurisy'],
    difficulty: DIFFICULTY.EASY,
    bloodAmount: 'moderate'
  },

  // HEAD/NECK VEINS (riskier)
  {
    id: 'temporal-vein-left',
    name: 'Temporal Vein (Left)',
    location: 'Left temple',
    x: 175,
    y: 65,
    humoralTarget: 'Brain and Eyes',
    ailments: ['Severe headache', 'Apoplexy', 'Eye inflammation', 'Delirium'],
    difficulty: DIFFICULTY.HARD,
    bloodAmount: 'light'
  },
  {
    id: 'temporal-vein-right',
    name: 'Temporal Vein (Right)',
    location: 'Right temple',
    x: 225,
    y: 65,
    humoralTarget: 'Brain and Eyes',
    ailments: ['Severe headache', 'Apoplexy', 'Eye inflammation', 'Delirium'],
    difficulty: DIFFICULTY.HARD,
    bloodAmount: 'light'
  },
  {
    id: 'jugular-vein',
    name: 'Jugular Vein',
    location: 'Neck',
    x: 200,
    y: 125,
    humoralTarget: 'Brain and Throat',
    ailments: ['Quinsy', 'Throat inflammation', 'Severe headache', 'Apoplexy'],
    difficulty: DIFFICULTY.VERY_HARD,
    bloodAmount: 'moderate',
    warning: '⚠️ DANGEROUS - Risk of excessive bleeding'
  },

  // LEG VEINS (for lower body ailments)
  {
    id: 'saphenous-vein-left',
    name: 'Saphenous Vein (Left)',
    location: 'Left leg',
    x: 175,
    y: 520,
    humoralTarget: 'Kidneys and Lower Body',
    ailments: ['Gout', 'Leg swelling', 'Kidney stones', 'Sciatica'],
    difficulty: DIFFICULTY.MODERATE,
    bloodAmount: 'light'
  },
  {
    id: 'saphenous-vein-right',
    name: 'Saphenous Vein (Right)',
    location: 'Right leg',
    x: 225,
    y: 520,
    humoralTarget: 'Kidneys and Lower Body',
    ailments: ['Gout', 'Leg swelling', 'Kidney stones', 'Sciatica'],
    difficulty: DIFFICULTY.MODERATE,
    bloodAmount: 'light'
  }
];

/**
 * Blood amount conversion to fluid ounces (historical measurement)
 */
const BLOOD_AMOUNTS = {
  light: { oz: 4, label: '4 fl oz (~120ml)' },
  moderate: { oz: 8, label: '8 fl oz (~240ml)' },
  heavy: { oz: 12, label: '12 fl oz (~360ml)' }
};

export default function BloodlettingModal({
  isOpen,
  onClose,
  playerSkills,
  patientName,
  patientSymptoms = [],
  onPerformBloodletting,
  gameState = {}
}) {
  const [selectedVein, setSelectedVein] = useState(null);
  const [hoveredVein, setHoveredVein] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Check if player has Anatomy skill
  const anatomyLevel = playerSkills?.knownSkills?.anatomy?.level || 0;
  const hasAnatomySkill = anatomyLevel > 0;

  if (!isOpen) return null;

  function handleVeinHover(vein, event) {
    setHoveredVein(vein);
    const svgRect = event.currentTarget.closest('svg').getBoundingClientRect();
    setTooltipPos({
      x: event.clientX - svgRect.left,
      y: event.clientY - svgRect.top
    });
  }

  function handleVeinClick(vein) {
    setSelectedVein(vein);
    setShowConfirmation(true);
  }

  function handleConfirmBloodletting() {
    if (!selectedVein) return;

    // Apply Surgeon L15/L30 ability: Steady Hands (difficulty reduction)
    const difficultyReduction = getBloodlettingDifficultyReduction(
      gameState.chosenProfession,
      gameState.playerLevel
    );

    let adjustedDifficulty = selectedVein.difficulty;
    if (difficultyReduction > 0) {
      adjustedDifficulty = Math.max(DIFFICULTY.EASY, selectedVein.difficulty - difficultyReduction);
      console.log(`[Surgeon] Steady Hands reduced difficulty: DC ${selectedVein.difficulty} → ${adjustedDifficulty}`);
    }

    // Perform skill check with adjusted difficulty
    const skillCheck = performSkillCheck('anatomy', playerSkills, adjustedDifficulty);

    // Calculate outcome
    const outcome = {
      vein: selectedVein,
      skillCheck,
      bloodAmount: BLOOD_AMOUNTS[selectedVein.bloodAmount],
      complications: []
    };

    // Apply Surgeon L10/L30 ability: Master Surgeon (complication reduction)
    const complicationReduction = getComplicationChanceReduction(
      gameState.chosenProfession,
      gameState.playerLevel
    );

    // Check for complications (with Surgeon protection)
    if (!skillCheck.success) {
      const complicationRoll = Math.random();

      if (complicationRoll > complicationReduction) {
        // Complications occur (not prevented by Surgeon ability)
        if (skillCheck.natural1) {
          outcome.complications.push('Severe bleeding!', 'Patient fainted', 'Risk of infection');
        } else if (selectedVein.difficulty >= DIFFICULTY.HARD) {
          outcome.complications.push('Excessive bleeding', 'Patient weakened');
        } else {
          outcome.complications.push('Mild bruising', 'Patient discomfort');
        }
      } else {
        console.log(`[Surgeon] Master Surgeon prevented complications! (${Math.round(complicationReduction * 100)}% chance)`);
      }
    }

    // Natural 20 = perfect technique, enhanced effects
    if (skillCheck.natural20) {
      outcome.criticalSuccess = true;
    }

    // Apply Surgeon L25/L30 ability: Renowned Surgeon (payment bonus)
    const paymentBonus = getBloodlettingPaymentBonus(
      gameState.chosenProfession,
      gameState.playerLevel
    );

    if (paymentBonus > 1.0) {
      outcome.paymentBonus = paymentBonus;
      console.log(`[Surgeon] Renowned Surgeon increased payment: ${paymentBonus}x`);
    }

    // Call parent handler
    onPerformBloodletting(outcome);

    // Close modal
    setShowConfirmation(false);
    setSelectedVein(null);
    onClose();
  }

  if (!hasAnatomySkill) {
    return (
      <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="modal-content bg-white rounded-2xl shadow-elevation-4 max-w-md w-full p-8">
          <h2 className="font-display text-2xl font-bold text-red-900 mb-4">⚠️ Skill Required</h2>
          <p className="font-serif text-gray-700 mb-6">
            You do not have the <span className="font-bold">Anatomy</span> skill required to perform bloodletting safely.
            Attempting phlebotomy without proper training could result in severe harm to the patient.
          </p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-sans font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="modal-content bg-white rounded-2xl shadow-elevation-4 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">

        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-4">
            <div className="text-5xl">🩸</div>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold mb-2">Bloodletting (Phlebotomy)</h1>
              <p className="text-white/90 font-serif text-sm mb-2">
                Select a vein to perform therapeutic bloodletting on {patientName || 'the patient'}.
              </p>
              <p className="text-white/80 text-xs italic">
                "The art of phlebotomy balances the humors and restores health through the judicious removal of corrupted blood."
                — Ambroise Paré, 1564
              </p>
            </div>
          </div>

          {/* Skill Level Indicator */}
          <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 w-fit">
            <span className="text-sm font-sans">Anatomy Level {anatomyLevel}</span>
            <span className="text-xs opacity-75">
              • Skill Bonus: +{anatomyLevel * 2}
            </span>
          </div>
        </div>

        {/* Active Profession Bonuses */}
        <div className="px-6 pt-4">
          <ActiveBonusIndicator
            context="bloodletting"
            profession={gameState.chosenProfession}
            playerLevel={gameState.playerLevel}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">

            {/* Body Map with Veins */}
            <div className="bg-parchment-50 rounded-xl p-6 border border-ink-200">
              <h3 className="font-sans text-lg font-bold text-ink-900 mb-4">Select Vein Location</h3>

              <div className="relative w-full flex items-center justify-center">
                <svg
                  viewBox="0 0 400 720"
                  className="w-full h-full max-w-md"
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))' }}
                >
                  {/* Body outline - same as BodyMap.jsx */}
                  <g className="body-outline" stroke="#1A1816" strokeWidth="2" fill="none">
                    {/* Head */}
                    <ellipse cx="200" cy="80" rx="35" ry="42" fill="#F5E6D3" />

                    {/* Neck */}
                    <rect x="185" y="118" width="30" height="20" fill="#F5E6D3" />

                    {/* Torso */}
                    <path
                      d="M 155 138 L 155 280 Q 155 320 170 340 L 170 380 Q 175 385 200 385 Q 225 385 230 380 L 230 340 Q 245 320 245 280 L 245 138 Q 245 138 200 138 Q 155 138 155 138 Z"
                      fill="#F5E6D3"
                    />

                    {/* Arms */}
                    <g>
                      {/* Left arm */}
                      <path d="M 155 140 L 130 170 L 110 240 L 100 310 L 90 370 L 82 400" stroke="#1A1816" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.9" />
                      {/* Right arm */}
                      <path d="M 245 140 L 270 170 L 290 240 L 300 310 L 310 370 L 318 400" stroke="#1A1816" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.9" />
                    </g>

                    {/* Legs */}
                    <g>
                      {/* Left leg */}
                      <path d="M 185 385 L 180 440 L 175 520 L 172 600 L 170 670" stroke="#1A1816" strokeWidth="24" strokeLinecap="round" fill="none" opacity="0.9" />
                      {/* Right leg */}
                      <path d="M 215 385 L 220 440 L 225 520 L 228 600 L 230 670" stroke="#1A1816" strokeWidth="24" strokeLinecap="round" fill="none" opacity="0.9" />
                    </g>
                  </g>

                  {/* Vein markers */}
                  {VEINS.map((vein) => {
                    const isHovered = hoveredVein?.id === vein.id;
                    const isSelected = selectedVein?.id === vein.id;

                    // Color based on difficulty
                    let color = '#DC2626'; // red
                    if (vein.difficulty >= DIFFICULTY.VERY_HARD) color = '#7C2D12'; // dark red
                    else if (vein.difficulty >= DIFFICULTY.HARD) color = '#DC2626'; // red
                    else if (vein.difficulty >= DIFFICULTY.MODERATE) color = '#EA580C'; // orange
                    else color = '#F59E0B'; // amber

                    return (
                      <g key={vein.id}>
                        {/* Glow effect */}
                        <circle
                          cx={vein.x}
                          cy={vein.y}
                          r={isHovered || isSelected ? 16 : 12}
                          fill={color}
                          opacity={0.3}
                          className="transition-all duration-200"
                        />

                        {/* Main marker */}
                        <circle
                          cx={vein.x}
                          cy={vein.y}
                          r={isHovered || isSelected ? 10 : 7}
                          fill={isSelected ? color : 'white'}
                          stroke={color}
                          strokeWidth="3"
                          className="cursor-pointer transition-all duration-200"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                          }}
                          onMouseEnter={(e) => handleVeinHover(vein, e)}
                          onMouseLeave={() => setHoveredVein(null)}
                          onClick={() => handleVeinClick(vein)}
                        >
                          <animate
                            attributeName="r"
                            values={`7;9;7`}
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>

                        {/* Inner dot */}
                        <circle
                          cx={vein.x}
                          cy={vein.y}
                          r="2"
                          fill={isSelected ? 'white' : color}
                          pointerEvents="none"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip */}
                {hoveredVein && (
                  <div
                    className="absolute pointer-events-none z-50"
                    style={{
                      left: tooltipPos.x + 15,
                      top: tooltipPos.y - 10,
                      transform: 'translateY(-100%)'
                    }}
                  >
                    <div className="bg-ink-900 text-white px-3 py-2 rounded shadow-elevation-4 max-w-xs">
                      <div className="font-sans font-bold text-sm mb-1">
                        {hoveredVein.name}
                      </div>
                      <div className="text-xs opacity-90 mb-2">
                        Target: {hoveredVein.humoralTarget}
                      </div>
                      <div className="text-xs opacity-75">
                        {hoveredVein.ailments.join(' • ')}
                      </div>
                      {hoveredVein.warning && (
                        <div className="text-xs text-red-300 font-semibold mt-1">
                          {hoveredVein.warning}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vein Details & Confirmation */}
            <div className="space-y-4">
              {!selectedVein ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-sans text-lg font-bold text-blue-900 mb-3">Instructions</h3>
                  <ol className="space-y-2 text-sm text-blue-800 font-serif list-decimal list-inside">
                    <li>Click on a vein location on the body map</li>
                    <li>Review the therapeutic target and recommended ailments</li>
                    <li>Confirm the procedure</li>
                    <li>Your Anatomy skill will determine the outcome</li>
                  </ol>

                  <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                    <h4 className="text-xs font-sans font-bold text-blue-900 mb-2">HISTORICAL NOTE</h4>
                    <p className="text-xs text-blue-700 font-serif leading-relaxed">
                      In 17th century medicine, different veins were believed to correspond to different organs via
                      the four humors. Bloodletting from the basilic vein (inner elbow) treated liver disorders, while
                      the cephalic vein (outer arm) addressed head ailments.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Selected Vein Details */}
                  <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                    <h3 className="font-sans text-xl font-bold text-red-900 mb-4">
                      {selectedVein.name}
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-sans font-semibold text-red-900">Location:</span>
                        <span className="ml-2 text-red-800">{selectedVein.location}</span>
                      </div>

                      <div>
                        <span className="font-sans font-semibold text-red-900">Humoral Target:</span>
                        <span className="ml-2 text-red-800">{selectedVein.humoralTarget}</span>
                      </div>

                      <div>
                        <span className="font-sans font-semibold text-red-900">Blood Amount:</span>
                        <span className="ml-2 text-red-800">
                          {BLOOD_AMOUNTS[selectedVein.bloodAmount].label}
                        </span>
                      </div>

                      <div>
                        <span className="font-sans font-semibold text-red-900">Difficulty:</span>
                        <span className="ml-2 text-red-800">
                          DC {selectedVein.difficulty}
                        </span>
                      </div>

                      <div>
                        <span className="font-sans font-semibold text-red-900">Recommended for:</span>
                        <ul className="ml-6 mt-1 list-disc text-red-700">
                          {selectedVein.ailments.map((ailment, i) => (
                            <li key={i}>{ailment}</li>
                          ))}
                        </ul>
                      </div>

                      {selectedVein.warning && (
                        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                          <p className="text-xs text-red-900 font-semibold">
                            {selectedVein.warning}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirmation Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirmBloodletting}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-sans font-medium transition-colors shadow-lg"
                    >
                      Perform Bloodletting
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVein(null);
                        setShowConfirmation(false);
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-sans font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-600 font-serif italic">
            "Let blood be drawn from that vein which is nearest to the affected part." — Galen (c. 200 CE)
          </p>
        </div>

      </div>
    </div>
  );
}
