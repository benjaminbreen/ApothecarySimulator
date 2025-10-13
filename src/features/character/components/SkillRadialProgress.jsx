import React, { useState, useEffect } from 'react';

/**
 * Beautiful radial/circular progress indicator for skills
 * Scenario-agnostic - works with any skill name and level
 */
export default function SkillRadialProgress({
  skillName,
  level = 0,
  size = 80,
  description = '',
  animate = true
}) {
  const [displayLevel, setDisplayLevel] = useState(0);

  // Animate level counting up
  useEffect(() => {
    if (!animate) {
      setDisplayLevel(level);
      return;
    }

    let start = 0;
    const duration = 1000; // 1 second
    const increment = level / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= level) {
        setDisplayLevel(level);
        clearInterval(timer);
      } else {
        setDisplayLevel(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [level, animate]);

  // Calculate circle properties
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayLevel / 100) * circumference;
  const remaining = circumference - progress;

  // Color based on skill level
  const getColorClasses = () => {
    if (level >= 80) return { stroke: '#16A34A', glow: '#16A34A', text: 'text-botanical-600' }; // Green - Expert
    if (level >= 60) return { stroke: '#8B5CF6', glow: '#8B5CF6', text: 'text-potion-600' }; // Purple - Proficient
    if (level >= 40) return { stroke: '#F59E0B', glow: '#F59E0B', text: 'text-warning-600' }; // Orange - Competent
    return { stroke: '#6B7280', glow: '#6B7280', text: 'text-ink-500' }; // Gray - Novice
  };

  const colors = getColorClasses();

  return (
    <div className="flex flex-col items-center gap-2 group">
      {/* SVG Circle */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: level >= 80 ? `drop-shadow(0 0 8px ${colors.glow}40)` : 'none' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="4"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${remaining}`}
            className="transition-all duration-slow"
            style={{
              filter: `drop-shadow(0 0 4px ${colors.glow}30)`
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold font-sans ${colors.text} transition-colors duration-base`}>
            {displayLevel}
          </span>
        </div>
      </div>

      {/* Skill name */}
      <div className="text-center">
        <p className="text-sm font-semibold font-sans text-ink-900">
          {skillName}
        </p>

        {/* Tooltip on hover */}
        {description && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-base max-w-[120px]">
            <p className="text-xs text-ink-600 font-serif mt-1">
              {description}
            </p>
          </div>
        )}
      </div>

      {/* Skill level label */}
      <div className="text-xs font-sans font-medium text-ink-500">
        {level >= 80 && '⭐ Expert'}
        {level >= 60 && level < 80 && 'Proficient'}
        {level >= 40 && level < 60 && 'Competent'}
        {level < 40 && 'Novice'}
      </div>
    </div>
  );
}
