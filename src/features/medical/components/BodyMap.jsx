import React, { useState } from 'react';
import { BODY_REGIONS, SEVERITY_COLORS, SYMPTOM_LOCATION_MAP } from '../data/bodyMapCoordinates';

/**
 * Interactive body map with symptom markers
 * Swiss design: Precise, functional, grid-based
 */
export default function BodyMap({ symptoms = [], onSymptomClick }) {
  const [hoveredSymptom, setHoveredSymptom] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map symptoms to body coordinates
  const mappedSymptoms = symptoms.map((symptom, index) => {
    const location = symptom.location || 'skin-general';
    const region = findRegionForSymptom(location);

    return {
      ...symptom,
      id: `symptom-${index}`,
      x: region.center.x + (Math.random() - 0.5) * 20, // Small random offset for multiple symptoms
      y: region.center.y + (Math.random() - 0.5) * 20,
      severity: symptom.severity || 'moderate',
      status: symptom.status || 'active'
    };
  });

  function findRegionForSymptom(location) {
    // Ensure location is a string
    const locationStr = String(location || 'skin-general');

    // Try direct match first
    const directMatch = Object.values(BODY_REGIONS).find(r => r.id === locationStr);
    if (directMatch) return directMatch;

    // Try symptom location map
    const mappedLocations = SYMPTOM_LOCATION_MAP[locationStr.toLowerCase()];
    if (mappedLocations && mappedLocations.length > 0) {
      const regionId = mappedLocations[0];
      const region = Object.values(BODY_REGIONS).find(r => r.id === regionId);
      if (region) return region;
    }

    // Default to general skin
    return BODY_REGIONS.SKIN_GENERAL;
  }

  function handleSymptomHover(symptom, event) {
    setHoveredSymptom(symptom);
    const svgRect = event.currentTarget.closest('svg').getBoundingClientRect();
    setTooltipPos({
      x: event.clientX - svgRect.left,
      y: event.clientY - svgRect.top
    });
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 720"
        className="w-full h-full max-w-md"
        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))' }}
      >
        {/* Body outline - clean, geometric, Swiss style */}
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

        {/* Symptom markers - precise, functional */}
        {mappedSymptoms.map((symptom) => {
          const colors = SEVERITY_COLORS[symptom.status === 'resolved' ? 'resolved' : symptom.severity];
          const isHovered = hoveredSymptom?.id === symptom.id;

          return (
            <g key={symptom.id}>
              {/* Glow effect */}
              <circle
                cx={symptom.x}
                cy={symptom.y}
                r={isHovered ? 14 : 10}
                fill={colors.glow}
                opacity={symptom.status === 'resolved' ? 0.2 : 0.4}
                className="transition-all duration-200"
              />

              {/* Main marker */}
              <circle
                cx={symptom.x}
                cy={symptom.y}
                r={isHovered ? 10 : 7}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                style={{
                  opacity: colors.opacity || 1,
                  filter: symptom.status === 'resolved' ? 'none' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}
                onMouseEnter={(e) => handleSymptomHover(symptom, e)}
                onMouseLeave={() => setHoveredSymptom(null)}
                onClick={() => onSymptomClick?.(symptom)}
              >
                {symptom.status !== 'resolved' && (
                  <animate
                    attributeName="r"
                    values={`7;${isHovered ? 10 : 8};7`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>

              {/* Inner dot for emphasis */}
              {symptom.status !== 'resolved' && (
                <circle
                  cx={symptom.x}
                  cy={symptom.y}
                  r="2"
                  fill="white"
                  opacity="0.8"
                  pointerEvents="none"
                />
              )}
            </g>
          );
        })}

        {/* Legend - Swiss typography */}
        <g transform="translate(20, 40)">
          <text x="0" y="0" className="text-xs font-sans font-semibold" fill="#1A1816" letterSpacing="0.05em">
            SEVERITY
          </text>
          {Object.entries({
            'Critical': 'critical',
            'Severe': 'severe',
            'Moderate': 'moderate',
            'Mild': 'mild',
            'Resolved': 'resolved'
          }).map(([label, key], index) => {
            const colors = SEVERITY_COLORS[key];
            return (
              <g key={key} transform={`translate(0, ${(index + 1) * 16})`}>
                <circle cx="5" cy="0" r="4" fill={colors.fill} stroke={colors.stroke} strokeWidth="1" opacity={colors.opacity || 1} />
                <text x="14" y="4" className="text-xs font-sans" fill="#4B5563" letterSpacing="0.02em">
                  {label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip - Swiss minimalist design */}
      {hoveredSymptom && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="bg-ink-900 text-white px-3 py-2 rounded shadow-elevation-4 max-w-xs">
            <div className="font-sans font-bold text-sm mb-1" style={{ letterSpacing: '0.02em' }}>
              {hoveredSymptom.name}
            </div>
            <div className="text-xs opacity-90 mb-1">
              {hoveredSymptom.description}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="uppercase font-semibold tracking-wide" style={{ fontSize: '0.65rem' }}>
                {hoveredSymptom.severity}
              </span>
              {hoveredSymptom.duration && (
                <>
                  <span className="opacity-50">•</span>
                  <span className="opacity-75">{hoveredSymptom.duration}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
