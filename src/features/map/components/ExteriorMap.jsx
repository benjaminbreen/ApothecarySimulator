import React, { useState, useMemo } from 'react';
import { polygonToSVGPoints } from '../../../core/types/map.types';
import { filterOverlappingLabels } from '../utils/labelCollision';
import './Map.css';

/**
 * ExteriorMap - Renders exterior/city maps with theme-aware styling
 * @param {Object} props
 * @param {import('../../../core/types/map.types').ExteriorMapData} props.mapData - Map data to render
 * @param {import('../../../core/types/map.types').NPCMarker[]} props.npcs - NPCs to show on map
 * @param {Object} props.playerPosition - Player's current position {x, y}
 * @param {Function} props.onBuildingClick - Callback when building is clicked
 * @param {Function} props.onLandmarkClick - Callback when landmark is clicked
 * @param {string} props.theme - Theme mode: 'light' or 'dark' (defaults to 'light')
 */
export default function ExteriorMap({ mapData, npcs = [], playerPosition = null, onBuildingClick, onLandmarkClick, theme = 'light', zoom = 1 }) {
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [hoveredNPC, setHoveredNPC] = useState(null);

  // Theme color palettes - Enhanced for better aesthetics
  const themes = {
    light: {
      bg: '#fefaf5',
      streetStroke: '#f5ebe0',        // Lighter (almost white) for better contrast
      streetPaved: '#f5ebe0',         // Lighter streets
      streetUnpaved: '#9a8668',
      streetLabel: '#6d5d4b',
      streetLabelBg: 'rgba(254, 250, 245, 0.95)',
      buildingFill: '#d4c5a9',
      buildingStroke: '#8b7355',
      buildingLabel: '#3d2817',
      buildingLabelBg: 'rgba(254, 250, 245, 0.95)',
      playerLocationFill: 'rgba(255, 215, 0, 0.4)',  // Slightly more opaque gold
      playerLocationStroke: '#ffd700',
      playerLocationLabel: '#d4a017',
      landmarkFill: 'rgba(230, 170, 50, 0.2)',
      landmarkStroke: '#d4a547',
      landmarkLabel: '#a67c2e',
      playerMarker: '#648c73',
      playerStroke: '#3d5745',
      playerLabel: '#4a6d55',
      npcMarker: '#fff',
      npcStroke: '#b5a589',
      npcLabel: '#6d5d4b',
      // Phase 2: Canals, parks, barrios - More subtle
      acequiaFill: 'rgba(100, 180, 220, 0.4)',  // More subtle (was 0.6)
      acequiaStroke: '#5aa8d8',
      acequiaLabel: '#3d7fa8',
      parkFill: 'rgba(140, 180, 120, 0.3)',
      parkStroke: '#7a9a65',
      parkLabel: '#5a7a45',
      treeFill: '#6d8a5c',
      treeStroke: '#4a5f3d',
      barrioSpanish: 'rgba(220, 205, 180, 0.15)',
      barrioIndigenous: 'rgba(180, 160, 140, 0.12)',
      barrioMixed: 'rgba(200, 185, 165, 0.13)',
      barrioStroke: 'rgba(160, 145, 125, 0.3)',
      fountainFill: '#64a8d8',
      fountainStroke: '#4a8ab8',
      fountainAccent: '#e8f4f8'
    },
    // DARK MODE: "Candlelit Apothecary" - Night-time HUD aesthetic
    // Inspired by AAA game UIs (Witcher 3, Skyrim) with warm amber/brass glows
    dark: {
      // Deep slate background - night sky
      bg: '#0a0e1a',

      // Streets - dim cobblestone with subtle glow
      streetStroke: '#2a3142',
      streetPaved: '#3a4254',
      streetUnpaved: '#2a3142',
      streetLabel: '#fbbf24',  // Amber labels
      streetLabelBg: 'rgba(10, 14, 26, 0.95)',

      // Buildings - dark stone with amber accent lighting
      buildingFill: 'rgba(20, 25, 40, 0.85)',
      buildingStroke: '#d97706',  // Amber-600 borders (candlelight edge)
      buildingLabel: '#fde68a',   // Amber-200 text
      buildingLabelBg: 'rgba(10, 14, 26, 0.9)',

      // Player location - GOLD GLOW like beacon/waypoint marker
      playerLocationFill: 'rgba(251, 191, 36, 0.35)',  // Amber-400 fill
      playerLocationStroke: '#fbbf24',  // Amber-400 glowing border
      playerLocationLabel: '#fef3c7',   // Amber-100 bright text

      // Landmarks - brass/bronze markers
      landmarkFill: 'rgba(217, 119, 6, 0.3)',  // Amber-600
      landmarkStroke: '#f59e0b',  // Amber-500
      landmarkLabel: '#fcd34d',   // Amber-300

      // Player marker - golden
      playerMarker: '#fbbf24',
      playerStroke: '#78350f',  // Amber-900 dark outline
      playerLabel: '#fef3c7',

      // NPCs - pale amber/brass figures
      npcMarker: '#fde68a',  // Amber-200
      npcStroke: '#f59e0b',  // Amber-500 outline
      npcLabel: '#fef3c7',

      // Canals - dark water with moonlight reflection
      acequiaFill: 'rgba(30, 58, 138, 0.5)',  // Deep blue-900
      acequiaStroke: '#60a5fa',  // Blue-400 (moonlight)
      acequiaLabel: '#93c5fd',   // Blue-300

      // Parks - dark foliage with faint green
      parkFill: 'rgba(22, 101, 52, 0.25)',  // Green-800
      parkStroke: '#4ade80',  // Green-400
      parkLabel: '#86efac',   // Green-300
      treeFill: '#15803d',   // Green-700
      treeStroke: '#16a34a',  // Green-600

      // Barrios - subtle district zones
      barrioSpanish: 'rgba(120, 53, 15, 0.15)',  // Amber-900 very subtle
      barrioIndigenous: 'rgba(55, 48, 163, 0.12)',  // Indigo-700
      barrioMixed: 'rgba(88, 28, 135, 0.13)',  // Purple-800
      barrioStroke: 'rgba(217, 119, 6, 0.2)',  // Amber-600

      // Fountains - water features with moonlit glow
      fountainFill: '#60a5fa',  // Blue-400
      fountainStroke: '#3b82f6',  // Blue-500
      fountainAccent: '#dbeafe'  // Blue-100
    }
  };

  const colors = themes[theme] || themes.light;

  if (!mapData) {
    return <div className="map-loading">Loading map...</div>;
  }

  const { bounds, streets, buildings, landmarks, acequias = [], barrios = [], parks = [], cityBlocks = [] } = mapData;

  return (
    <div className="map-container">
      <svg
        viewBox={`0 0 ${bounds.width} ${bounds.height}`}
        className="map-svg exterior-map"
        style={{ backgroundColor: colors.bg }}
      >
        {/* Define filters for glowy effect */}
        <defs>
          {/* Main glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Strong glow for selected/hovered elements */}
          <filter id="glow-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Pulsing animation for NPCs */}
          <filter id="glow-pulse" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur">
              <animate
                attributeName="stdDeviation"
                values="4;8;4"
                dur="2s"
                repeatCount="indefinite"
              />
            </feGaussianBlur>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Water flow animation for acequias */}
          <linearGradient id="water-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.acequiaFill} stopOpacity="0.4">
              <animate attributeName="stop-opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite"/>
            </stop>
            <stop offset="50%" stopColor={colors.acequiaStroke} stopOpacity="0.8">
              <animate attributeName="stop-opacity" values="0.8;0.5;0.8" dur="3s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" stopColor={colors.acequiaFill} stopOpacity="0.4">
              <animate attributeName="stop-opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite"/>
            </stop>
          </linearGradient>

          {/* AAA GAME HUD FILTERS - Dark Mode Glows */}

          {/* Amber candlelight glow (for buildings in dark mode) */}
          <filter id="amber-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feFlood floodColor="#fbbf24" floodOpacity="0.6"/>
            <feComposite in2="coloredBlur" operator="in" result="softGlow"/>
            <feMerge>
              <feMergeNode in="softGlow"/>
              <feMergeNode in="softGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Gold beacon glow (for player location) */}
          <filter id="gold-beacon" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feFlood floodColor="#fbbf24" floodOpacity="0.8"/>
            <feComposite in2="coloredBlur" operator="in" result="softGlow"/>
            <feGaussianBlur in="softGlow" stdDeviation="12" result="outerGlow"/>
            <feMerge>
              <feMergeNode in="outerGlow"/>
              <feMergeNode in="softGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Animated pulsing beacon (AAA waypoint marker) */}
          <filter id="beacon-pulse" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="10" result="coloredBlur">
              <animate
                attributeName="stdDeviation"
                values="8;16;8"
                dur="2s"
                repeatCount="indefinite"
              />
            </feGaussianBlur>
            <feFlood floodColor="#fbbf24" floodOpacity="0.7">
              <animate
                attributeName="floodOpacity"
                values="0.7;0.3;0.7"
                dur="2s"
                repeatCount="indefinite"
              />
            </feFlood>
            <feComposite in2="coloredBlur" operator="in" result="softGlow"/>
            <feMerge>
              <feMergeNode in="softGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Moonlight shimmer for water */}
          <filter id="moonlight-shimmer" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feFlood floodColor="#93c5fd" floodOpacity="0.5"/>
            <feComposite in2="blur" operator="in" result="glow"/>
            <feMerge>
              <feMergeNode in="glow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Drop shadow for buildings (Pixar-style depth) */}
          <filter id="building-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="2" dy="3" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Player location strong glow and pulse */}
          <filter id="player-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="1.8"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Diagonal line patterns for city blocks */}
          <pattern id="block-pattern-0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={colors.buildingStroke} strokeWidth="0.5" opacity="0.15"/>
          </pattern>
          <pattern id="block-pattern-1" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke={colors.buildingStroke} strokeWidth="0.5" opacity="0.12"/>
          </pattern>
          <pattern id="block-pattern-2" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" stroke={colors.buildingStroke} strokeWidth="0.5" opacity="0.13"/>
          </pattern>
        </defs>

        {/* Historical Map Background Layer - 1680 Mexico City */}
        <image
          href={theme === 'dark' ? '/maps/mapdark.png' : '/maps/maplight.png'}
          x="0"
          y="0"
          width={bounds.width}
          height={bounds.height}
          opacity={theme === 'dark' ? '0.6' : '0.7'}
          preserveAspectRatio="xMidYMid slice"
          style={{ pointerEvents: 'none' }}
        />

        {/* Phase 2: Barrios layer - HIDDEN: Historical map shows districts */}

        {/* Generic City Blocks - HIDDEN: Historical map shows urban fabric */}

        {/* Phase 2: Acequias layer - HIDDEN: Historical map shows canals */}

        {/* Phase 2: Parks layer */}
        {parks && parks.length > 0 && (
          <g className="parks-layer">
            {parks.map(park => (
              <g key={park.id}>
                {/* Park background */}
                <polygon
                  points={polygonToSVGPoints(park.polygon)}
                  fill={colors.parkFill}
                  stroke={colors.parkStroke}
                  strokeWidth="2"
                  strokeDasharray="6 3"
                  className="park-area"
                />

                {/* Trees */}
                {park.treePositions && park.treePositions.map((treePos, idx) => (
                  <g key={`tree-${idx}`}>
                    {/* Tree canopy */}
                    <circle
                      cx={treePos[0]}
                      cy={treePos[1] - 3}
                      r="6"
                      fill={colors.treeFill}
                      stroke={colors.treeStroke}
                      strokeWidth="1.5"
                      opacity="0.9"
                    />
                    {/* Tree trunk */}
                    <rect
                      x={treePos[0] - 1.5}
                      y={treePos[1] + 2}
                      width="3"
                      height="6"
                      fill={colors.treeStroke}
                      opacity="0.8"
                    />
                  </g>
                ))}
              </g>
            ))}
          </g>
        )}

        {/* Render streets - HIDDEN: Historical map shows streets */}

        {/* Render buildings */}
        <g className="buildings-layer">
          {buildings.map(building => {
            const isHovered = hoveredBuilding === building.id;
            const isPlayerLocation = building.isPlayerLocation;
            const isClickable = building.hasInterior !== null;
            const isKeyBuilding = building.priority <= 4; // Priority 1-4 get shadows

            // Determine filter based on building importance, state, and theme
            let buildingFilter = 'none';
            if (isPlayerLocation) {
              // Player location gets golden beacon in dark mode, standard glow in light
              buildingFilter = theme === 'dark' ? 'url(#gold-beacon)' : 'url(#player-glow)';
            } else if (isHovered) {
              // Hovered buildings get amber glow in dark, standard glow in light
              buildingFilter = theme === 'dark' ? 'url(#amber-glow)' : 'url(#glow)';
            } else if (isKeyBuilding) {
              // Key buildings get subtle amber glow in dark, shadow in light
              buildingFilter = theme === 'dark' ? 'url(#amber-glow)' : 'url(#building-shadow)';
            }

            return (
              <g key={building.id}>
                {/* Enhanced gold pulsing rings for player location */}
                {isPlayerLocation && (
                  <>
                    {/* Outer pulse ring - dramatic expansion */}
                    <polygon
                      points={polygonToSVGPoints(building.polygon)}
                      fill="none"
                      stroke={colors.playerLocationStroke}
                      strokeWidth="8"
                      opacity="0.4"
                      transform={`translate(${building.labelPosition?.[0] || 0}, ${building.labelPosition?.[1] || 0}) scale(1.2) translate(-${building.labelPosition?.[0] || 0}, -${building.labelPosition?.[1] || 0})`}
                    >
                      <animate
                        attributeName="stroke-width"
                        values="8;16;8"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.4;0.1;0.4"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </polygon>

                    {/* Middle pulse ring */}
                    <polygon
                      points={polygonToSVGPoints(building.polygon)}
                      fill="none"
                      stroke={colors.playerLocationStroke}
                      strokeWidth="6"
                      opacity="0.5"
                      transform={`translate(${building.labelPosition?.[0] || 0}, ${building.labelPosition?.[1] || 0}) scale(1.1) translate(-${building.labelPosition?.[0] || 0}, -${building.labelPosition?.[1] || 0})`}
                    >
                      <animate
                        attributeName="stroke-width"
                        values="6;10;6"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.5;0.25;0.5"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </polygon>

                    {/* Inner pulse ring - always visible */}
                    <polygon
                      points={polygonToSVGPoints(building.polygon)}
                      fill="none"
                      stroke={colors.playerLocationStroke}
                      strokeWidth="4"
                      opacity="0.7"
                    >
                      <animate
                        attributeName="stroke-width"
                        values="4;8;4"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.7;0.4;0.7"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </polygon>
                  </>
                )}

                <polygon
                  points={polygonToSVGPoints(building.polygon)}
                  className={`building building-${building.type || 'generic'} ${isPlayerLocation ? 'player-location' : ''} ${isClickable ? 'clickable' : ''}`}
                  fill={isPlayerLocation ? colors.playerLocationFill : colors.buildingFill}
                  stroke={isPlayerLocation ? colors.playerLocationStroke : colors.buildingStroke}
                  strokeWidth={isPlayerLocation ? 3 : (isHovered ? 2.5 : (isKeyBuilding ? 2 : 1.5))}
                  filter={buildingFilter}
                  style={{ cursor: isClickable ? 'pointer' : 'default' }}
                  onMouseEnter={() => setHoveredBuilding(building.id)}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  onClick={(e) => {
                    if (isClickable && onBuildingClick) {
                      e.stopPropagation();
                      onBuildingClick(building);
                    }
                  }}
                />
              </g>
            );
          })}
        </g>

        {/* Render landmarks */}
        {landmarks && (
          <g className="landmarks-layer">
            {landmarks.map(landmark => {
              const isFountain = landmark.type === 'fountain';

              return (
                <g
                  key={landmark.id}
                  onClick={() => onLandmarkClick && onLandmarkClick(landmark)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Fountain rendering (enhanced) */}
                  {isFountain ? (
                    <g className="fountain">
                      {/* Fountain basin */}
                      <circle
                        cx={landmark.position[0]}
                        cy={landmark.position[1]}
                        r={landmark.radius || 15}
                        fill={colors.fountainFill}
                        stroke={colors.fountainStroke}
                        strokeWidth="3"
                        filter={theme === 'dark' ? 'url(#glow)' : 'none'}
                        opacity="0.7"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.6;0.8;0.6"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Inner fountain detail */}
                      <circle
                        cx={landmark.position[0]}
                        cy={landmark.position[1]}
                        r={(landmark.radius || 15) * 0.5}
                        fill={colors.fountainAccent}
                        opacity="0.5"
                      >
                        <animate
                          attributeName="r"
                          values={`${(landmark.radius || 15) * 0.5};${(landmark.radius || 15) * 0.6};${(landmark.radius || 15) * 0.5}`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.3;0.6;0.3"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Water splash effect (decorative) */}
                      <circle
                        cx={landmark.position[0]}
                        cy={landmark.position[1]}
                        r="3"
                        fill={colors.fountainAccent}
                        opacity="0.8"
                      >
                        <animate
                          attributeName="r"
                          values="2;8;2"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0.2;0.8"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  ) : (
                    /* Generic landmark icon */
                    <circle
                      cx={landmark.position[0]}
                      cy={landmark.position[1]}
                      r="8"
                      fill={colors.landmarkFill}
                      stroke={colors.landmarkStroke}
                      strokeWidth="2"
                      filter={theme === 'dark' ? 'url(#glow)' : 'none'}
                      className="landmark-icon"
                    />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Render NPCs */}
        {npcs && npcs.length > 0 && (
          <g className="npcs-layer">
            {npcs.map(npc => {
              const isHovered = hoveredNPC === npc.npcId;

              return (
                <g
                  key={npc.npcId}
                  onMouseEnter={() => setHoveredNPC(npc.npcId)}
                  onMouseLeave={() => setHoveredNPC(null)}
                >
                  {/* NPC marker */}
                  <circle
                    cx={npc.position[0]}
                    cy={npc.position[1]}
                    r={isHovered ? 10 : 8}
                    fill={colors.npcMarker}
                    stroke={colors.npcStroke}
                    strokeWidth="2"
                    filter={theme === 'dark' ? 'url(#glow-pulse)' : 'none'}
                    className="npc-marker"
                    style={{ cursor: 'pointer' }}
                  />

                  {/* NPC name label (show on hover or if status is 'interacting') */}
                  {(isHovered || npc.status === 'interacting') && (
                    <g>
                      <text
                        x={npc.position[0]}
                        y={npc.position[1] - 20}
                        className="npc-label-shadow"
                        fontSize="16"
                        fill="#000000"
                        fontWeight="700"
                        textAnchor="middle"
                        opacity={theme === 'dark' ? '0.7' : '0.4'}
                        style={{ pointerEvents: 'none' }}
                      >
                        {npc.npcName}
                      </text>
                      <text
                        x={npc.position[0]}
                        y={npc.position[1] - 20}
                        className="npc-label"
                        fontSize="16"
                        fill={colors.npcLabel}
                        fontWeight="700"
                        textAnchor="middle"
                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
                        letterSpacing="0.3px"
                        filter={theme === 'dark' ? 'url(#amber-glow)' : 'none'}
                        style={{ pointerEvents: 'none' }}
                      >
                        {npc.npcName}
                      </text>
                    </g>
                  )}

                  {/* Movement path (if NPC is moving) */}
                  {npc.path && npc.path.length > 0 && (
                    <polyline
                      points={npc.path.map(p => p.join(',')).join(' ')}
                      fill="none"
                      stroke={colors.npcStroke}
                      strokeWidth="1"
                      strokeDasharray="4 2"
                      opacity="0.4"
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Render player position */}
        {playerPosition && (
          <g className="player-layer">
            {/* Pulsing outer ring */}
            <circle
              cx={playerPosition.x}
              cy={playerPosition.y}
              r="20"
              fill="none"
              stroke={colors.playerMarker}
              strokeWidth="2"
              opacity="0.4"
            >
              <animate
                attributeName="r"
                values="20;28;20"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.4;0.1;0.4"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Middle ring */}
            <circle
              cx={playerPosition.x}
              cy={playerPosition.y}
              r="16"
              fill="none"
              stroke={colors.playerMarker}
              strokeWidth="1.5"
              opacity="0.6"
            >
              <animate
                attributeName="r"
                values="16;20;16"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Player marker (solid center) */}
            <circle
              cx={playerPosition.x}
              cy={playerPosition.y}
              r="10"
              fill={colors.playerMarker}
              stroke={colors.playerStroke}
              strokeWidth="3"
              filter={theme === 'dark' ? 'url(#glow-strong)' : 'none'}
              className="player-marker"
            />

            {/* Direction indicator (north arrow) */}
            <path
              d={`M ${playerPosition.x} ${playerPosition.y - 16} L ${playerPosition.x - 4} ${playerPosition.y - 10} L ${playerPosition.x} ${playerPosition.y - 12} L ${playerPosition.x + 4} ${playerPosition.y - 10} Z`}
              fill={colors.playerMarker}
              stroke={colors.playerStroke}
              strokeWidth="1"
              filter={theme === 'dark' ? 'url(#glow)' : 'none'}
              style={{ pointerEvents: 'none' }}
            />

            {/* Player label with better typography */}
            <g>
              <text
                x={playerPosition.x}
                y={playerPosition.y + 35}
                className="player-label-shadow"
                fontSize="16"
                fill="#000000"
                fontWeight="700"
                textAnchor="middle"
                opacity={theme === 'dark' ? '0.7' : '0.4'}
                style={{ pointerEvents: 'none' }}
              >
                You
              </text>
              <text
                x={playerPosition.x}
                y={playerPosition.y + 35}
                className="player-label"
                fontSize="16"
                fill={colors.playerLabel}
                fontWeight="700"
                textAnchor="middle"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
                letterSpacing="0.5px"
                filter={theme === 'dark' ? 'url(#glow-strong)' : 'none'}
                style={{ pointerEvents: 'none' }}
              >
                You
              </text>
            </g>
          </g>
        )}

        {/* Unified Labels Layer - Smart Collision Detection */}
        {(() => {
          // Collect all labels with their priorities
          const allLabels = [];

          // Street labels
          streets.forEach(street => {
            if (street.name && (street.type === 'main' || zoom >= 1.5)) {
              const labelX = street.labelPosition?.[0] || (street.points[0][0] + street.points[street.points.length - 1][0]) / 2;
              const labelY = street.labelPosition?.[1] || (street.points[0][1] + street.points[street.points.length - 1][1]) / 2;
              const finalX = labelX + (street.labelOffset?.[0] || 0);
              const finalY = labelY + (street.labelOffset?.[1] || 0);

              allLabels.push({
                id: `street-${street.id}`,
                x: finalX,
                y: finalY,
                text: street.name,
                fontSize: 18,  // Increased from 16 for better readability
                rotation: street.labelRotation || 0,
                priority: street.priority || 5,
                type: 'street',
                color: colors.streetLabel,
                bgColor: colors.streetLabelBg,
                isHovered: false,
                isPlayerLocation: false,
                alwaysShowLabel: false
              });
            }
          });

          // Building labels
          buildings.forEach(building => {
            const isHovered = hoveredBuilding === building.id;
            const isPlayerLocation = building.isPlayerLocation;

            if (building.labelPosition || building.alwaysShowLabel || isHovered || isPlayerLocation) {
              const x = building.labelPosition ? building.labelPosition[0] : building.polygon[0][0] + 20;
              const y = building.labelPosition ? building.labelPosition[1] : building.polygon[0][1] + 20;

              allLabels.push({
                id: `building-${building.id}`,
                x,
                y,
                text: building.name,
                fontSize: isPlayerLocation ? 20 : (isHovered ? 22 : 20),  // Same size as others
                rotation: 0,
                priority: building.priority || 5,
                type: 'building',
                color: isPlayerLocation ? colors.buildingLabel : colors.buildingLabel,
                bgColor: isPlayerLocation ? colors.buildingLabelBg : colors.buildingLabelBg,
                isHovered,
                isPlayerLocation,
                alwaysShowLabel: building.alwaysShowLabel || false
              });
            }
          });

          // Landmark labels
          if (landmarks) {
            landmarks.forEach(landmark => {
              // Only show fountain labels if zoom is high enough, or always show if flagged
              if (landmark.type === 'fountain' && !landmark.alwaysShowLabel && zoom < 1.8) {
                return; // Skip fountain labels at low zoom
              }

              allLabels.push({
                id: `landmark-${landmark.id}`,
                x: landmark.position[0],
                y: landmark.position[1] - 25,
                text: landmark.name,
                fontSize: 15,  // Slightly reduced for cleaner look
                rotation: 0,
                priority: landmark.priority || 6,
                type: 'landmark',
                color: colors.landmarkLabel,
                bgColor: colors.streetLabelBg,
                isHovered: false,
                isPlayerLocation: false,
                alwaysShowLabel: landmark.alwaysShowLabel || false
              });
            });
          }

          // Acequia labels (Phase 2)
          if (acequias && zoom >= 1.3) {
            acequias.forEach(acequia => {
              if (acequia.labelPosition) {
                allLabels.push({
                  id: `acequia-${acequia.id}`,
                  x: acequia.labelPosition[0],
                  y: acequia.labelPosition[1],
                  text: acequia.name,
                  fontSize: 17,  // Increased from 15
                  rotation: acequia.labelRotation || 0,
                  priority: acequia.priority || 6,
                  type: 'acequia',
                  color: colors.acequiaLabel,
                  bgColor: colors.streetLabelBg,
                  isHovered: false,
                  isPlayerLocation: false,
                  alwaysShowLabel: false
                });
              }
            });
          }

          // Park labels (Phase 2)
          if (parks && zoom >= 1.2) {
            parks.forEach(park => {
              if (park.labelPosition) {
                allLabels.push({
                  id: `park-${park.id}`,
                  x: park.labelPosition[0],
                  y: park.labelPosition[1],
                  text: park.name,
                  fontSize: 17,  // Reduced for cleaner look
                  rotation: 0,
                  priority: park.priority || 5,
                  type: 'park',
                  color: colors.parkLabel,
                  bgColor: colors.streetLabelBg,
                  isHovered: false,
                  isPlayerLocation: false,
                  alwaysShowLabel: park.alwaysShowLabel || false
                });
              }
            });
          }

          // Filter labels using collision detection
          const visibleLabels = filterOverlappingLabels(allLabels, zoom);

          // Render filtered labels with enhanced typography
          return (
            <g className="labels-layer">
              {visibleLabels.map(label => {
                const transform = label.rotation !== 0
                  ? `rotate(${label.rotation}, ${label.x}, ${label.y})`
                  : '';

                return (
                  <g key={label.id} transform={transform}>
                    {/* Label background for better legibility */}
                    <rect
                      x={label.x - (label.text.length * label.fontSize * 0.3)}
                      y={label.y - label.fontSize * 0.7}
                      width={label.text.length * label.fontSize * 0.6}
                      height={label.fontSize * 1.3}
                      fill={label.bgColor}
                      stroke={label.isPlayerLocation ? (theme === 'dark' ? '#fbbf24' : '#f59e0b') : 'none'}
                      strokeWidth={label.isPlayerLocation ? '1.5' : '0'}
                      rx="4"
                      ry="4"
                      opacity="0.9"
                      style={{ pointerEvents: 'none' }}
                    />

                    {/* Main label text - Enhanced glow in dark mode */}
                    <text
                      x={label.x}
                      y={label.y}
                      className="label-text"
                      fontSize={label.fontSize}
                      fill={label.color}
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="'Crimson Text', 'Georgia', serif"
                      letterSpacing="0.5px"
                      filter={
                        theme === 'dark'
                          ? (label.isPlayerLocation ? 'url(#beacon-pulse)' : (label.isHovered ? 'url(#amber-glow)' : (label.type === 'building' ? 'url(#glow)' : 'none')))
                          : (label.isPlayerLocation ? 'url(#glow-strong)' : (label.isHovered ? 'url(#glow)' : 'none'))
                      }
                      style={{ pointerEvents: 'none' }}
                    >
                      {label.text}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })()}
      </svg>

      {/* Hover tooltip */}
      {hoveredBuilding && (
        <div className="map-tooltip">
          {buildings.find(b => b.id === hoveredBuilding)?.name}
          {buildings.find(b => b.id === hoveredBuilding)?.hasInterior && (
            <span className="tooltip-hint"> (click to enter)</span>
          )}
        </div>
      )}
    </div>
  );
}
