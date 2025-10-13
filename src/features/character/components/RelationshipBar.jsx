import React, { useState } from 'react';

/**
 * Visual representation of NPC relationship score
 * Scenario-agnostic - works with any NPC data
 */
export default function RelationshipBar({
  npcName,
  npcType = 'Unknown',
  score = 0, // -100 to +100
  emoji = '😐',
  events = [] // Optional: array of relationship events for tooltip
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate bar position (score ranges from -100 to +100, we need 0 to 100%)
  const percentage = ((score + 100) / 200) * 100;

  // Color gradient based on score
  const getColor = () => {
    if (score >= 50) return { bg: 'bg-success-500', glow: 'shadow-success-300' };
    if (score >= 20) return { bg: 'bg-botanical-500', glow: 'shadow-botanical-300' };
    if (score >= -20) return { bg: 'bg-ink-400', glow: 'shadow-ink-300' };
    if (score >= -50) return { bg: 'bg-warning-500', glow: 'shadow-warning-300' };
    return { bg: 'bg-danger-500', glow: 'shadow-danger-300' };
  };

  const colors = getColor();

  // Relationship label
  const getLabel = () => {
    if (score >= 70) return 'Close Ally';
    if (score >= 40) return 'Friendly';
    if (score >= 10) return 'Acquaintance';
    if (score >= -10) return 'Neutral';
    if (score >= -40) return 'Unfriendly';
    if (score >= -70) return 'Hostile';
    return 'Enemy';
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* NPC Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <p className="text-sm font-semibold font-sans text-ink-900">
              {npcName}
            </p>
            <p className="text-xs text-ink-600 font-serif">
              {npcType}
            </p>
          </div>
        </div>

        {/* Score and label */}
        <div className="text-right">
          <p className={`text-sm font-bold font-sans ${score >= 0 ? 'text-botanical-700' : 'text-danger-700'}`}>
            {score >= 0 ? '+' : ''}{score}
          </p>
          <p className="text-xs text-ink-600 font-sans">
            {getLabel()}
          </p>
        </div>
      </div>

      {/* Relationship bar */}
      <div className="relative h-3 bg-ink-200 rounded-full overflow-hidden">
        {/* Center marker (neutral point) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-ink-400 z-10" />

        {/* Progress fill */}
        <div
          className={`absolute top-0 bottom-0 left-1/2 ${colors.bg} transition-all duration-slow rounded-r-full ${colors.glow} shadow-md`}
          style={{
            width: `${Math.abs(percentage - 50)}%`,
            transform: score >= 0 ? 'translateX(0)' : 'translateX(-100%)',
            transformOrigin: score >= 0 ? 'left' : 'right'
          }}
        />
      </div>

      {/* Tooltip with relationship events */}
      {showTooltip && events.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-ink-900 text-white text-xs rounded-lg p-3 shadow-elevation-4 animate-fade-in-up">
          <p className="font-semibold mb-2">Relationship History:</p>
          <ul className="space-y-1">
            {events.slice(0, 3).map((event, idx) => (
              <li key={idx} className="text-ink-200">
                • {event}
              </li>
            ))}
          </ul>
          {events.length > 3 && (
            <p className="text-ink-400 mt-1">...and {events.length - 3} more</p>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
