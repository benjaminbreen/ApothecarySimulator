import React, { useState } from 'react';
import { polygonToSVGPoints } from '../../../core/types/map.types';
import './Map.css';

/**
 * InteriorMap - Renders interior/floorplan maps with theme-aware styling
 * @param {Object} props
 * @param {import('../../../core/types/map.types').InteriorMapData} props.mapData - Map data to render
 * @param {import('../../../core/types/map.types').NPCMarker[]} props.npcs - NPCs to show on map
 * @param {Object} props.playerPosition - Player's current position {x, y}
 * @param {number} props.playerFacing - Player facing direction in degrees (0=N, 90=E, 180=S, 270=W)
 * @param {Function} props.onRoomClick - Callback when room is clicked
 * @param {Function} props.onDoorClick - Callback when door is clicked
 * @param {Function} props.onFurnitureClick - Callback when furniture is clicked
 * @param {Object} props.viewBox - ViewBox to use for zoom/pan {x, y, width, height} (optional, defaults to full map)
 * @param {string} props.theme - Theme mode: 'light' or 'dark' (defaults to 'light')
 * @param {boolean} props.isModal - Whether map is in modal view (affects label sizing)
 */
export default function InteriorMap({ mapData, npcs = [], playerPosition = null, playerFacing = 180, onRoomClick, onDoorClick, onFurnitureClick, viewBox, theme = 'light', isModal = false }) {
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [hoveredDoor, setHoveredDoor] = useState(null);
  const [hoveredFurniture, setHoveredFurniture] = useState(null);
  const [hoveredNPC, setHoveredNPC] = useState(null);

  // Theme color palettes
  const themes = {
    light: {
      bg: 'transparent', // Let background image show through
      furnitureFill: 'rgba(85, 114, 86, 0.12)',
      furnitureStroke: '#b8a890',
      roomFill: 'rgba(255, 250, 240, 0.1)', // More transparent to show background
      roomStroke: '#9d8f7a', // Darker, more visible walls
      textPrimary: '#6d5d44',
      textSecondary: '#8b7c6a',
      playerMarker: '#6b8a6a',
      playerStroke: '#3f5f3e',
      npcMarker: '#fff',
      npcStroke: '#b8a890',
      doorLocked: '#c45a5a',
      doorUnlocked: '#6a9a6d'
    },
    dark: {
      bg: 'transparent', // Let background image show through
      furnitureFill: 'rgba(148, 163, 184, 0.3)',
      furnitureStroke: '#94a3b8',
      roomFill: 'rgba(30, 41, 59, 0.1)', // More transparent to show background
      roomStroke: '#7dd3fc',
      textPrimary: '#7dd3fc',
      textSecondary: '#94a3b8',
      playerMarker: '#7dd3fc',
      playerStroke: '#fff',
      npcMarker: '#fff',
      npcStroke: '#7dd3fc',
      doorLocked: '#dc2626',
      doorUnlocked: '#22c55e'
    }
  };

  const colors = themes[theme] || themes.light;

  if (!mapData) {
    return <div className="map-loading">Loading interior map...</div>;
  }

  const { bounds, rooms, doors, furniture } = mapData;

  // Helper function to generate line of sight cone path
  const generateViewConePath = (x, y, facing, angle, distance) => {
    const halfAngle = (angle / 2) * (Math.PI / 180);
    // Adjust facing by -90° to convert from game coordinates (0°=North) to trig coordinates (0°=East)
    const facingRad = (facing - 90) * (Math.PI / 180);

    const leftEdgeX = x + Math.cos(facingRad - halfAngle) * distance;
    const leftEdgeY = y + Math.sin(facingRad - halfAngle) * distance;
    const rightEdgeX = x + Math.cos(facingRad + halfAngle) * distance;
    const rightEdgeY = y + Math.sin(facingRad + halfAngle) * distance;

    // Arc path for smooth cone
    return `M ${x},${y} L ${leftEdgeX},${leftEdgeY} A ${distance},${distance} 0 0,1 ${rightEdgeX},${rightEdgeY} Z`;
  };

  // Helper to render furniture icons - Enhanced with detail and glassy appearance
  const renderFurnitureIcon = (item) => {
    const [x, y] = item.position;
    const [width, height] = item.size || [40, 40];
    const rotation = item.rotation || 0;
    const isHovered = hoveredFurniture === item.id;

    // Glassy translucent colors
    const baseFill = theme === 'light'
      ? 'rgba(109, 97, 68, 0.15)'
      : 'rgba(148, 163, 184, 0.25)';
    const hoverFill = theme === 'light'
      ? 'rgba(109, 97, 68, 0.3)'
      : 'rgba(148, 163, 184, 0.4)';
    const detailColor = theme === 'light'
      ? 'rgba(109, 97, 68, 0.4)'
      : 'rgba(148, 163, 184, 0.5)';

    switch (item.type) {
      case 'counter':
        return (
          <g transform={`rotate(${rotation} ${x} ${y})`}>
            {/* Main counter surface */}
            <rect
              x={x - width / 2}
              y={y - height / 2}
              width={width}
              height={height}
              fill={isHovered ? hoverFill : baseFill}
              stroke={colors.furnitureStroke}
              strokeWidth={isHovered ? 3 : 2.5}
              rx="4"
            />
            {/* Counter edge/depth */}
            <rect
              x={x - width / 2}
              y={y - height / 2 + height - 8}
              width={width}
              height="8"
              fill={detailColor}
              stroke={colors.furnitureStroke}
              strokeWidth="1"
              opacity="0.6"
              rx="2"
            />
            {/* Inner panel detail */}
            <rect
              x={x - width / 2 + 8}
              y={y - height / 2 + 8}
              width={width - 16}
              height={height - 20}
              fill="none"
              stroke={detailColor}
              strokeWidth="1.5"
              rx="2"
              opacity="0.4"
            />
            {/* Drawer handles */}
            {[0.33, 0.66].map((ratio, i) => (
              <rect
                key={i}
                x={x - width / 2 + width * ratio - 4}
                y={y - height / 2 + height / 2 - 2}
                width="8"
                height="4"
                fill={detailColor}
                stroke={colors.furnitureStroke}
                strokeWidth="0.5"
                rx="1"
              />
            ))}
          </g>
        );

      case 'table':
        return (
          <g transform={`rotate(${rotation} ${x} ${y})`}>
            {/* Main surface */}
            <rect
              x={x - width / 2}
              y={y - height / 2}
              width={width}
              height={height}
              fill={isHovered ? hoverFill : baseFill}
              stroke={colors.furnitureStroke}
              strokeWidth={isHovered ? 3 : 2}
              rx="4"
            />
            {/* Inner detail lines */}
            <rect
              x={x - width / 2 + 6}
              y={y - height / 2 + 6}
              width={width - 12}
              height={height - 12}
              fill="none"
              stroke={detailColor}
              strokeWidth="1"
              rx="2"
            />
          </g>
        );

      case 'shelf':
        return (
          <g transform={`rotate(${rotation} ${x} ${y})`}>
            {/* Cabinet frame */}
            <rect
              x={x - width / 2}
              y={y - height / 2}
              width={width}
              height={height}
              fill={isHovered ? hoverFill : baseFill}
              stroke={colors.furnitureStroke}
              strokeWidth={isHovered ? 3 : 2.5}
              rx="3"
            />
            {/* Cabinet backing */}
            <rect
              x={x - width / 2 + 4}
              y={y - height / 2 + 4}
              width={width - 8}
              height={height - 8}
              fill="none"
              stroke={detailColor}
              strokeWidth="1"
              opacity="0.3"
              rx="2"
            />
            {/* Shelf lines - more prominent */}
            {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
              <g key={i}>
                <line
                  x1={x - width / 2 + 6}
                  y1={y - height / 2 + height * ratio}
                  x2={x + width / 2 - 6}
                  y2={y - height / 2 + height * ratio}
                  stroke={detailColor}
                  strokeWidth="2.5"
                  opacity="0.7"
                />
                {/* Shelf support brackets */}
                <rect
                  x={x - width / 2 + 8}
                  y={y - height / 2 + height * ratio - 1}
                  width="6"
                  height="2"
                  fill={detailColor}
                  opacity="0.5"
                />
                <rect
                  x={x + width / 2 - 14}
                  y={y - height / 2 + height * ratio - 1}
                  width="6"
                  height="2"
                  fill={detailColor}
                  opacity="0.5"
                />
              </g>
            ))}
            {/* Vertical divider */}
            <line
              x1={x}
              y1={y - height / 2 + 6}
              x2={x}
              y2={y + height / 2 - 6}
              stroke={detailColor}
              strokeWidth="2"
              opacity="0.5"
            />
          </g>
        );

      case 'chair':
        return (
          <g>
            {/* Seat (rounded) */}
            <rect
              x={x - width / 2}
              y={y - height / 2}
              width={width}
              height={height}
              fill={isHovered ? hoverFill : baseFill}
              stroke={colors.furnitureStroke}
              strokeWidth={isHovered ? 3 : 2.5}
              rx="8"
            />
            {/* Seat cushion detail */}
            <ellipse
              cx={x}
              cy={y}
              rx={width / 3}
              ry={height / 3}
              fill="none"
              stroke={detailColor}
              strokeWidth="1.5"
              opacity="0.4"
            />
            {/* Backrest - larger and more prominent */}
            <rect
              x={x - width / 2 + 6}
              y={y - height / 2 - 14}
              width={width - 12}
              height="10"
              fill={isHovered ? hoverFill : baseFill}
              stroke={colors.furnitureStroke}
              strokeWidth="2"
              rx="4"
            />
            {/* Backrest vertical supports */}
            <line
              x1={x - width / 4}
              y1={y - height / 2 - 10}
              x2={x - width / 4}
              y2={y - height / 2 - 4}
              stroke={detailColor}
              strokeWidth="1.5"
              opacity="0.5"
            />
            <line
              x1={x + width / 4}
              y1={y - height / 2 - 10}
              x2={x + width / 4}
              y2={y - height / 2 - 4}
              stroke={detailColor}
              strokeWidth="1.5"
              opacity="0.5"
            />
          </g>
        );

      case 'bed':
        return (
          <g transform={`rotate(${rotation} ${x} ${y})`}>
            {/* Bedframe outline */}
            <rect
              x={x - width / 2}
              y={y - height / 2}
              width={width}
              height={height}
              fill={isHovered ? hoverFill : baseFill}
              stroke={colors.furnitureStroke}
              strokeWidth={isHovered ? 3 : 2.5}
              rx="6"
            />

            {/* Mattress detail - inner rectangle */}
            <rect
              x={x - width / 2 + 10}
              y={y - height / 2 + 10}
              width={width - 20}
              height={height - 20}
              fill="none"
              stroke={detailColor}
              strokeWidth="2"
              rx="4"
              opacity="0.5"
            />

            {/* Pillow - more prominent */}
            <rect
              x={x - width / 3}
              y={y - height / 2 + 15}
              width={width / 1.5}
              height={height / 4}
              fill={detailColor}
              stroke={colors.furnitureStroke}
              strokeWidth="1.5"
              rx="8"
              opacity="0.7"
            />

            {/* Blanket fold detail */}
            <path
              d={`M ${x - width / 2 + 10} ${y + height / 6} Q ${x} ${y + height / 4} ${x + width / 2 - 10} ${y + height / 6}`}
              fill="none"
              stroke={detailColor}
              strokeWidth="2"
              opacity="0.4"
            />
          </g>
        );

      case 'chest':
        return (
          <g>
            {/* Main chest body */}
            <rect
              x={x - width / 2}
              y={y - height / 2}
              width={width}
              height={height}
              fill={isHovered ? hoverFill : baseFill}
              stroke={colors.furnitureStroke}
              strokeWidth={isHovered ? 3 : 2}
              rx="4"
            />
            {/* Lock/clasp */}
            <circle
              cx={x}
              cy={y}
              r="4"
              fill={detailColor}
              stroke={colors.furnitureStroke}
              strokeWidth="1.5"
            />
            {/* Corner details */}
            {[
              [-1, -1], [1, -1], [-1, 1], [1, 1]
            ].map(([dx, dy], i) => (
              <circle
                key={i}
                cx={x + dx * (width / 2 - 8)}
                cy={y + dy * (height / 2 - 8)}
                r="2"
                fill={detailColor}
              />
            ))}
          </g>
        );

      case 'apparatus':
        return (
          <g>
            {/* Base */}
            <rect
              x={x - width / 2}
              y={y + height / 4}
              width={width}
              height={height / 4}
              fill={isHovered ? hoverFill : baseFill}
              stroke={colors.furnitureStroke}
              strokeWidth={isHovered ? 3 : 2}
              rx="3"
            />
            {/* Flask body */}
            <ellipse
              cx={x}
              cy={y - height / 6}
              rx={width / 3}
              ry={height / 3}
              fill={theme === 'light' ? 'rgba(125, 211, 252, 0.2)' : 'rgba(125, 211, 252, 0.3)'}
              stroke={colors.furnitureStroke}
              strokeWidth="2"
            />
            {/* Flask neck */}
            <rect
              x={x - width / 8}
              y={y - height / 2}
              width={width / 4}
              height={height / 3}
              fill={theme === 'light' ? 'rgba(125, 211, 252, 0.15)' : 'rgba(125, 211, 252, 0.25)'}
              stroke={colors.furnitureStroke}
              strokeWidth="2"
            />
            {/* Coil/tube */}
            <path
              d={`M ${x + width / 3} ${y - height / 6} Q ${x + width / 2} ${y} ${x + width / 3} ${y + height / 4}`}
              fill="none"
              stroke={colors.furnitureStroke}
              strokeWidth="2"
            />
          </g>
        );

      default:
        return (
          <rect
            x={x - width / 2}
            y={y - height / 2}
            width={width}
            height={height}
            fill={isHovered ? hoverFill : baseFill}
            stroke={colors.furnitureStroke}
            strokeWidth={isHovered ? 3 : 2}
            rx="4"
          />
        );
    }
  };

  // Use provided viewBox or default to full map
  const svgViewBox = viewBox
    ? `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
    : `0 0 ${bounds.width} ${bounds.height}`;

  return (
    <div className="map-container" data-theme={theme}>
      <svg
        viewBox={svgViewBox}
        preserveAspectRatio="xMidYMid meet"
        className="map-svg interior-map w-full h-full"
        style={{
          background: colors.bg
        }}
      >
        {/* Background image overlay - themed */}
        <image
          href={theme === 'light' ? '/maps/boticamaplight.png' : '/maps/boticamapdark.png'}
          x="0"
          y="0"
          width={bounds.width}
          height={bounds.height}
          preserveAspectRatio="xMidYMid meet"
          opacity="0.7"
          style={{ pointerEvents: 'none' }}
        />

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
        </defs>

        {/* Render rooms */}
        <g className="rooms-layer">
          {rooms.map(room => {
            const isHovered = hoveredRoom === room.id;

            return (
              <g key={room.id}>
                <polygon
                  points={polygonToSVGPoints(room.polygon)}
                  className={`room room-${room.type || 'generic'}`}
                  fill={colors.roomFill}
                  stroke={colors.roomStroke}
                  strokeWidth={isHovered ? 12 : 10}  // Much thicker walls
                  filter={isHovered && theme === 'dark' ? 'url(#glow)' : 'none'}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRoomClick && onRoomClick(room);
                  }}
                />

                {/* Room label with background for legibility */}
                {/* COMMENTED OUT - Testing without room labels
                <g>
                  <rect
                    x={room.polygon[0][0] + 12}
                    y={room.polygon[0][1] + 8}
                    width={(room.name?.length || 10) * (isModal ? 20 : 22)}
                    height={isModal ? "40" : "42"}
                    rx="8"
                    fill={theme === 'light' ? 'rgba(255, 252, 245, 0.9)' : 'rgba(30, 41, 59, 0.9)'}
                    stroke={colors.roomStroke}
                    strokeWidth="2"
                    opacity="0.95"
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x={room.polygon[0][0] + 20}
                    y={room.polygon[0][1] + (isModal ? 28 : 36)}
                    className="room-label"
                    fontSize={isModal ? "26" : "36"}
                    fontWeight="500"
                    fill={theme === 'light' ? colors.textPrimary : '#f59e0b'}
                    opacity={isHovered ? 1 : 0.95}
                    filter={theme === 'dark' ? 'url(#glow)' : 'none'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {room.name}
                  </text>
                </g>
                */}
              </g>
            );
          })}
        </g>

        {/* Render furniture with hover labels */}
        {furniture && (
          <g className="furniture-layer">
            {furniture.map(item => {
              const isHovered = hoveredFurniture === item.id;
              const [x, y] = item.position;

              return (
                <g
                  key={item.id}
                  onMouseEnter={() => setHoveredFurniture(item.id)}
                  onMouseLeave={() => setHoveredFurniture(null)}
                  onClick={() => onFurnitureClick && onFurnitureClick(item)}
                  className="furniture-item"
                  style={{ cursor: 'pointer' }}
                >
                  {renderFurnitureIcon(item)}

                  {/* Hover label */}
                  {isHovered && item.name && (
                    <g>
                      {/* Label background */}
                      <rect
                        x={x - (item.name.length * (isModal ? 8 : 10))}
                        y={y + (item.size ? item.size[1] / 2 : 20) + 8}
                        width={item.name.length * (isModal ? 16 : 20)}
                        height={isModal ? "32" : "36"}
                        rx="6"
                        fill={theme === 'light' ? 'rgba(255, 252, 245, 0.95)' : 'rgba(30, 41, 59, 0.95)'}
                        stroke={colors.furnitureStroke}
                        strokeWidth="2"
                        filter={theme === 'dark' ? 'url(#glow)' : 'none'}
                      />
                      {/* Label text */}
                      <text
                        x={x}
                        y={y + (item.size ? item.size[1] / 2 : 20) + 8 + (isModal ? 22 : 24)}
                        fontSize={isModal ? "18" : "22"}
                        fontWeight="600"
                        fontFamily="system-ui, -apple-system, sans-serif"
                        letterSpacing="1.2"
                        fill={colors.textPrimary}
                        textAnchor="middle"
                        style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
                      >
                        {item.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Render doors - Wider and simpler */}
        {doors && (
          <g className="doors-layer">
            {doors.map(door => {
              const isHovered = hoveredDoor === door.id;
              const [x, y] = door.position;
              const rotation = door.rotation || 0;
              const doorWidth = door.width || 60;  // Use new width property
              const doorThickness = 12;  // Thicker door representation

              return (
                <g
                  key={door.id}
                  onMouseEnter={() => setHoveredDoor(door.id)}
                  onMouseLeave={() => setHoveredDoor(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDoorClick && onDoorClick(door);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Door rectangle - Much wider */}
                  <rect
                    x={x - doorWidth / 2}
                    y={y - doorThickness / 2}
                    width={doorWidth}
                    height={doorThickness}
                    fill={door.isLocked ? 'rgba(220, 38, 38, 0.6)' : 'rgba(34, 197, 94, 0.6)'}
                    stroke={door.isLocked ? colors.doorLocked : colors.doorUnlocked}
                    strokeWidth={isHovered ? 4 : 3}
                    rx="3"
                    transform={`rotate(${rotation} ${x} ${y})`}
                    filter={isHovered && theme === 'dark' ? 'url(#glow)' : 'none'}
                  />

                  {/* Lock indicator - Bigger */}
                  {door.isLocked && (
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill={colors.doorLocked}
                      stroke="#fff"
                      strokeWidth="1"
                      filter={theme === 'dark' ? 'url(#glow)' : 'none'}
                    />
                  )}

                  {/* Door label on hover */}
                  {isHovered && (
                    <text
                      x={x + 30}
                      y={y + 5}
                      className="door-label"
                      fontSize={isModal ? "20" : "24"}
                      fontWeight="700"
                      fill={door.isLocked ? colors.doorLocked : colors.doorUnlocked}
                      filter={theme === 'dark' ? 'url(#glow)' : 'none'}
                      style={{ pointerEvents: 'none' }}
                    >
                      {door.to} {door.isLocked ? '🔒' : '→'}
                    </text>
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
                    r={isHovered ? 12 : 10}
                    fill={colors.npcMarker}
                    stroke={colors.npcStroke}
                    strokeWidth="2"
                    filter={theme === 'dark' ? 'url(#glow-pulse)' : 'none'}
                    className="npc-marker"
                    style={{ cursor: 'pointer' }}
                  />

                  {/* NPC name label */}
                  <text
                    x={npc.position[0]}
                    y={npc.position[1] - 20}
                    className="npc-label"
                    fontSize={isModal ? "14" : "16"}
                    fill={colors.textPrimary}
                    fontWeight="bold"
                    textAnchor="middle"
                    filter={theme === 'dark' ? 'url(#glow)' : 'none'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {npc.npcName}
                  </text>

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

        {/* Render player position - LARGER for visibility */}
        {playerPosition && (
          <g className="player-layer">
            {/* Pulsing outer ring */}
            <circle
              cx={playerPosition.x}
              cy={playerPosition.y}
              r="28"
              fill="none"
              stroke={colors.playerMarker}
              strokeWidth="3"
              opacity="0.5"
            >
              <animate
                attributeName="r"
                values="28;36;28"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.5;0.15;0.5"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Middle ring */}
            <circle
              cx={playerPosition.x}
              cy={playerPosition.y}
              r="22"
              fill="none"
              stroke={colors.playerMarker}
              strokeWidth="2.5"
              opacity="0.7"
            >
              <animate
                attributeName="r"
                values="22;26;22"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Line of sight cone */}
            <path
              d={generateViewConePath(playerPosition.x, playerPosition.y, playerFacing, 90, 120)}
              fill={colors.playerMarker}
              fillOpacity="0.15"
              stroke={colors.playerStroke}
              strokeWidth="1"
              strokeOpacity="0.3"
              style={{ pointerEvents: 'none' }}
            />

            {/* Player marker (solid center) - MUCH BIGGER */}
            <circle
              cx={playerPosition.x}
              cy={playerPosition.y}
              r="14"
              fill={colors.playerMarker}
              stroke={colors.playerStroke}
              strokeWidth="3.5"
              filter={theme === 'light' ? 'drop-shadow(0 0 4px rgba(107, 138, 106, 0.6))' : 'url(#glow-strong)'}
              className="player-marker"
            />

            {/* Direction indicator (rotatable arrow) - BIGGER */}
            <g transform={`rotate(${playerFacing} ${playerPosition.x} ${playerPosition.y})`}>
              <path
                d={`M ${playerPosition.x} ${playerPosition.y - 20} L ${playerPosition.x - 5} ${playerPosition.y - 13} L ${playerPosition.x} ${playerPosition.y - 15} L ${playerPosition.x + 5} ${playerPosition.y - 13} Z`}
                fill={colors.playerMarker}
                stroke={colors.playerStroke}
                strokeWidth="1.5"
                filter={theme === 'light' ? 'drop-shadow(0 0 3px rgba(107, 138, 106, 0.5))' : 'url(#glow)'}
                style={{ pointerEvents: 'none' }}
              />
            </g>

            {/* Player label with background */}
            <rect
              x={playerPosition.x - 20}
              y={playerPosition.y + 22}
              width="40"
              height="20"
              rx="4"
              fill="rgba(255, 252, 245, 0.9)"
              stroke={colors.playerStroke}
              strokeWidth="1.5"
            />
            <text
              x={playerPosition.x}
              y={playerPosition.y + 36}
              className="player-label"
              fontSize={isModal ? "14" : "16"}
              fill={colors.textPrimary}
              fontWeight="bold"
              textAnchor="middle"
              filter={theme === 'dark' ? 'url(#glow)' : 'none'}
              style={{ pointerEvents: 'none' }}
            >
              You
            </text>
          </g>
        )}
      </svg>

      {/* Hover tooltip */}
      {hoveredRoom && (
        <div className="map-tooltip">
          {rooms.find(r => r.id === hoveredRoom)?.name}
        </div>
      )}
    </div>
  );
}
