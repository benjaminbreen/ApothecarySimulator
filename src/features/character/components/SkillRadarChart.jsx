/**
 * Skill Radar Chart Component - Futuristic HUD Style
 *
 * Displays skills in a category as a glowing spider/radar chart
 * Shows skill levels (0-5) on each axis with cyberpunk aesthetics
 */

import React, { useState } from 'react';

/**
 * Category color mapping with glow effects
 */
const getCategoryColor = (category) => {
  switch (category) {
    case 'medical':
      return {
        primary: '#10b981',
        light: '#34d399',
        glow: 'rgba(16, 185, 129, 0.6)',
        shadow: '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
        gradient: 'linear-gradient(135deg, #10b981, #34d399)'
      };
    case 'social':
      return {
        primary: '#3b82f6',
        light: '#60a5fa',
        glow: 'rgba(59, 130, 246, 0.6)',
        shadow: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)',
        gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)'
      };
    case 'practical':
      return {
        primary: '#f59e0b',
        light: '#fbbf24',
        glow: 'rgba(245, 158, 11, 0.6)',
        shadow: '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
        gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
      };
    case 'scholarly':
      return {
        primary: '#8b5cf6',
        light: '#a78bfa',
        glow: 'rgba(139, 92, 246, 0.6)',
        shadow: '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
        gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
      };
    case 'covert':
      return {
        primary: '#dc2626',
        light: '#ef4444',
        glow: 'rgba(220, 38, 38, 0.6)',
        shadow: '0 0 20px rgba(220, 38, 38, 0.4), 0 0 40px rgba(220, 38, 38, 0.2)',
        gradient: 'linear-gradient(135deg, #dc2626, #ef4444)'
      };
    case 'languages':
      return {
        primary: '#06b6d4',
        light: '#22d3ee',
        glow: 'rgba(6, 182, 212, 0.6)',
        shadow: '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)',
        gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)'
      };
    default:
      return {
        primary: '#6b7280',
        light: '#9ca3af',
        glow: 'rgba(107, 114, 128, 0.6)',
        shadow: '0 0 20px rgba(107, 114, 128, 0.4), 0 0 40px rgba(107, 114, 128, 0.2)',
        gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)'
      };
  }
};

/**
 * Calculate polygon points for radar chart (max level = 5)
 */
function calculateRadarPoints(skills, centerX, centerY, radius) {
  const points = [];
  const angleStep = (Math.PI * 2) / skills.length;

  skills.forEach((skill, index) => {
    const angle = angleStep * index - Math.PI / 2; // Start from top
    const level = skill.level || 0;
    const distance = (level / 5) * radius; // Normalize to 0-5 scale

    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    points.push({ x, y, angle, distance: level, skill });
  });

  return points;
}

/**
 * Calculate axis endpoints for radar chart
 */
function calculateAxisPoints(count, centerX, centerY, radius) {
  const points = [];
  const angleStep = (Math.PI * 2) / count;

  for (let i = 0; i < count; i++) {
    const angle = angleStep * i - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    points.push({ x, y, angle });
  }

  return points;
}

export default function SkillRadarChart({
  skills,
  category,
  categoryLabel,
  size = 280,
  onSkillClick
}) {
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!skills || skills.length === 0) {
    return null;
  }

  const colors = getCategoryColor(category);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 50; // Leave space for labels

  // Calculate points for the skill levels
  const dataPoints = calculateRadarPoints(skills, centerX, centerY, radius);

  // Calculate axis endpoints
  const axisPoints = calculateAxisPoints(skills.length, centerX, centerY, radius);

  // Create polygon path for filled area
  const polygonPath = dataPoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  // Create background grid circles (levels 1, 2, 3, 4, 5)
  const gridLevels = [1, 2, 3, 4, 5];

  const handleSkillHover = (skill, event) => {
    setHoveredSkill(skill);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* HUD Container with glow effect */}
      <div
        className="relative rounded-2xl p-4 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
          border: `2px solid ${colors.primary}40`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), ${colors.shadow}`
        }}
      >
        {/* Category Label with glow */}
        <div className="text-center mb-3">
          <h3
            className="text-sm font-bold uppercase tracking-widest font-sans mb-1"
            style={{
              color: colors.primary,
              textShadow: `0 0 10px ${colors.glow}, 0 0 20px ${colors.glow}`,
              letterSpacing: '0.15em'
            }}
          >
            {categoryLabel}
          </h3>
          <div
            className="h-0.5 w-16 mx-auto rounded-full"
            style={{
              background: colors.gradient,
              boxShadow: `0 0 8px ${colors.glow}`
            }}
          />
          <p className="text-xs text-gray-400 mt-1 font-sans">
            {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
          </p>
        </div>

        {/* SVG Radar Chart */}
        <svg
          width={size}
          height={size}
          className="overflow-visible"
        >
          {/* Glow filter definition */}
          <defs>
            <filter id={`glow-${category}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id={`gradient-${category}`}>
              <stop offset="0%" stopColor={colors.light} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={colors.primary} stopOpacity="0.3"/>
            </radialGradient>
          </defs>

          {/* Background grid circles */}
          {gridLevels.map((level) => {
            const gridRadius = (level / 5) * radius;
            const opacity = level === 5 ? 0.3 : 0.15;
            return (
              <circle
                key={`grid-${level}`}
                cx={centerX}
                cy={centerY}
                r={gridRadius}
                fill="none"
                stroke={level === 5 ? colors.primary : '#64748b'}
                strokeWidth={level === 5 ? "2" : "1"}
                opacity={opacity}
                strokeDasharray={level === 5 ? "none" : "4 4"}
              />
            );
          })}

          {/* Axes */}
          {axisPoints.map((point, index) => (
            <line
              key={`axis-${index}`}
              x1={centerX}
              y1={centerY}
              x2={point.x}
              y2={point.y}
              stroke="#475569"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Data polygon - filled area with glow */}
          <path
            d={polygonPath}
            fill={`url(#gradient-${category})`}
            fillOpacity="0.4"
            stroke={colors.primary}
            strokeWidth="3"
            strokeLinejoin="round"
            filter={`url(#glow-${category})`}
          />

          {/* Data points */}
          {dataPoints.map((point, index) => {
            const skill = point.skill;
            const isMaxLevel = skill.level >= 5;
            const isHovered = hoveredSkill?.id === skill.id;

            return (
              <g key={`point-${index}`}>
                {/* Outer glow ring for hovered/max skills */}
                {(isHovered || isMaxLevel) && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? "12" : "10"}
                    fill={colors.primary}
                    opacity="0.2"
                    className="animate-pulse"
                  />
                )}

                {/* Main point */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isMaxLevel ? "7" : "6"}
                  fill={isMaxLevel ? colors.light : colors.primary}
                  stroke="rgba(255, 255, 255, 0.9)"
                  strokeWidth="2"
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    filter: `drop-shadow(0 0 6px ${colors.glow})`,
                    transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => handleSkillHover(skill, e)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  onClick={() => onSkillClick && onSkillClick(skill.id)}
                />

                {/* Max level star */}
                {isMaxLevel && (
                  <text
                    x={point.x}
                    y={point.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fill="white"
                    className="pointer-events-none"
                    style={{ fontWeight: 'bold' }}
                  >
                    ★
                  </text>
                )}
              </g>
            );
          })}

          {/* Skill labels */}
          {skills.map((skill, index) => {
            const point = axisPoints[index];
            const labelDistance = radius + 35;
            const angle = point.angle;
            const labelX = centerX + Math.cos(angle) * labelDistance;
            const labelY = centerY + Math.sin(angle) * labelDistance;

            // Adjust text anchor based on position
            let textAnchor = 'middle';
            if (Math.abs(Math.cos(angle)) > 0.3) {
              textAnchor = Math.cos(angle) > 0 ? 'start' : 'end';
            }

            return (
              <g
                key={`label-${index}`}
                className="cursor-pointer"
                onMouseEnter={(e) => handleSkillHover(skill, e)}
                onMouseLeave={() => setHoveredSkill(null)}
                onClick={() => onSkillClick && onSkillClick(skill.id)}
              >
                {/* Skill icon */}
                <text
                  x={labelX}
                  y={labelY - 10}
                  textAnchor={textAnchor}
                  fontSize="16"
                  className="transition-all duration-200"
                  style={{
                    filter: hoveredSkill?.id === skill.id ? `drop-shadow(0 0 4px ${colors.glow})` : 'none'
                  }}
                >
                  {skill.icon}
                </text>
                {/* Skill name */}
                <text
                  x={labelX}
                  y={labelY + 4}
                  textAnchor={textAnchor}
                  fontSize="10"
                  fontWeight="600"
                  fill={hoveredSkill?.id === skill.id ? colors.light : '#cbd5e1'}
                  className="font-sans transition-colors duration-200"
                  style={{
                    textShadow: hoveredSkill?.id === skill.id ? `0 0 8px ${colors.glow}` : 'none'
                  }}
                >
                  {skill.name}
                </text>
                {/* Level badge */}
                <text
                  x={labelX}
                  y={labelY + 16}
                  textAnchor={textAnchor}
                  fontSize="9"
                  fontWeight="700"
                  fill={skill.level >= 5 ? colors.light : colors.primary}
                  className="font-sans"
                  style={{
                    textShadow: skill.level >= 5 ? `0 0 8px ${colors.glow}` : 'none'
                  }}
                >
                  Lv {skill.level}/5
                </text>
              </g>
            );
          })}

          {/* Center point with pulse */}
          <circle
            cx={centerX}
            cy={centerY}
            r="4"
            fill={colors.primary}
            opacity="0.8"
          >
            <animate
              attributeName="r"
              values="4;6;4"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;0.4;0.8"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* Hover Tooltip */}
      {hoveredSkill && (
        <div
          className="fixed z-[100] px-4 py-3 rounded-lg pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
            border: `2px solid ${colors.primary}60`,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), ${colors.shadow}`,
            minWidth: '200px',
            maxWidth: '300px'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{hoveredSkill.icon}</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white font-sans">{hoveredSkill.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                  style={{
                    background: colors.gradient,
                    color: 'white',
                    boxShadow: `0 0 8px ${colors.glow}`
                  }}
                >
                  Level {hoveredSkill.level}/5
                </span>
                {hoveredSkill.level >= 5 && (
                  <span className="text-xs font-bold" style={{ color: colors.light }}>
                    ★ MASTERED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* XP Progress (if not maxed) */}
          {hoveredSkill.level < 5 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400 font-sans">XP Progress</span>
                <span className="text-gray-300 font-mono">{hoveredSkill.xp || 0} / 20</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${((hoveredSkill.xp || 0) / 20) * 100}%`,
                    background: colors.gradient,
                    boxShadow: `0 0 8px ${colors.glow}`
                  }}
                />
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2 leading-relaxed font-sans">
            Click to view in Skills Modal
          </p>
        </div>
      )}
    </div>
  );
}
