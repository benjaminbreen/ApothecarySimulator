import React from 'react';
import './Map.css';

const PLAYER_RADIUS = 18;

/**
 * WorldMap - Renders the global travel map
 *
 * @param {Object} props
 * @param {import('../../../core/types/map.types').ExteriorMapData} props.mapData - Map data to render
 * @param {{x: number, y: number}} props.playerPosition - Player's world position
 * @param {Array<[number, number]>} props.travelPath - Optional travel path to animate
 * @param {boolean} props.isTraveling - Whether travel animation is active
 * @param {{x: number, y: number, width: number, height: number}} [props.viewBox] - Optional viewBox override
 * @param {{ id: string, name: string, position: {x:number, y:number} }|null} [props.originLocation] - Origin marker
 * @param {Array<Object>} [props.destinationMarkers] - Travel destination markers
 * @param {Function} [props.onDestinationSelect] - Callback when destination marker clicked
 * @param {string|null} [props.selectedDestinationId] - Currently selected destination
 */
export default function WorldMap({
  mapData,
  playerPosition,
  travelPath = null,
  isTraveling = false,
  viewBox = null,
  originLocation = null,
  destinationMarkers = [],
  onDestinationSelect = null,
  selectedDestinationId = null
}) {
  if (!mapData) {
    return <div className="map-loading">Loading world map...</div>;
  }

  const { bounds, backgroundImage } = mapData;
  const svgViewBox = viewBox
    ? `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
    : `0 0 ${bounds.width} ${bounds.height}`;

  const handleDestinationClick = (event, destination) => {
    event.stopPropagation();
    if (typeof onDestinationSelect === 'function') {
      onDestinationSelect(destination.id);
    }
  };

  return (
    <div className="map-container">
      <svg
        viewBox={svgViewBox}
        preserveAspectRatio="xMidYMid meet"
        className="map-svg exterior-map world-map w-full h-full"
      >
        <image
          href={backgroundImage || '/maps/worldmap.png'}
          width={bounds.width}
          height={bounds.height}
          preserveAspectRatio="xMidYMid meet"
        />

        {travelPath && travelPath.length > 1 && (
          <polyline
            points={travelPath.map(([x, y]) => `${x},${y}`).join(' ')}
            fill="none"
            stroke="rgba(250, 204, 21, 0.6)"
            strokeWidth={6}
            strokeDasharray="18 12"
          />
        )}

        {originLocation?.position && (
          <g className="origin-marker" transform={`translate(${originLocation.position.x}, ${originLocation.position.y})`}>
            <circle
              r={22}
              fill="rgba(16, 185, 129, 0.75)"
              stroke="#065f46"
              strokeWidth={5}
            />
            <rect
              x={-120}
              y={-58}
              width={240}
              height={32}
              rx={8}
              fill="rgba(15, 118, 110, 0.85)"
              stroke="#0d9488"
              strokeWidth={2}
            />
            <text
              x={0}
              y={-36}
              textAnchor="middle"
              fontSize="20"
              fontWeight="700"
              fill="#ecfeff"
              stroke="#052e16"
              strokeWidth={0.8}
            >
              Origin
            </text>
          </g>
        )}

        {destinationMarkers.map(destination => {
          const index = destination.labelIndex ?? 0;
          const ring = Math.floor(index / 5);
          const slot = index % 5;
          const offsetY = -60 - ring * 34;
          const offsetX = (slot - 2) * 62;
          const isSelected = selectedDestinationId === destination.id;

          return (
            <g
              key={destination.id}
              className="destination-marker cursor-pointer"
              transform={`translate(${destination.position.x}, ${destination.position.y})`}
              onClick={(event) => handleDestinationClick(event, destination)}
            >
              <circle
                r={isSelected ? 22 : 18}
                fill={isSelected ? 'rgba(16, 185, 129, 0.85)' : 'rgba(45, 212, 191, 0.65)'}
                stroke="#115e59"
                strokeWidth={isSelected ? 5 : 3}
              />
              <g transform={`translate(${offsetX}, ${offsetY})`}>
                <rect
                  x={-110}
                  y={-20}
                  width={220}
                  height={isSelected ? 40 : 34}
                  rx={14}
                  fill={isSelected ? 'rgba(15, 118, 110, 0.92)' : 'rgba(13, 148, 136, 0.88)'}
                  stroke="#0f766e"
                  strokeWidth={isSelected ? 2.4 : 2}
                  opacity={0.95}
                />
                <text
                  x={0}
                  y={isSelected ? 5 : 3}
                  textAnchor="middle"
                  fontSize={isSelected ? 18 : 16}
                  fontWeight="700"
                  fill="#fef3c7"
                  stroke="#0f172a"
                  strokeWidth={0.9}
                >
                  {destination.name.split(',')[0]}
                </text>
              </g>
            </g>
          );
        })}

        {playerPosition && (
          <g className="player-marker" transform={`translate(${playerPosition.x}, ${playerPosition.y})`}>
            <circle
              r={PLAYER_RADIUS}
              fill={isTraveling ? 'rgba(251, 191, 36, 0.45)' : 'rgba(251, 191, 36, 0.65)'}
              stroke="#92400e"
              strokeWidth={4}
            />
            <text
              x={0}
              y={-PLAYER_RADIUS - 12}
              textAnchor="middle"
              fontSize="32"
              fontWeight="700"
              fill="#facc15"
              stroke="#1f2937"
              strokeWidth={2}
            >
              ℞
            </text>
          </g>
        )}

        {playerPosition && (
          <g transform={`translate(${playerPosition.x}, ${playerPosition.y + PLAYER_RADIUS + 40})`}>
            <rect
              x={-120}
              y={-30}
              width={240}
              height={60}
              rx={28}
              fill="rgba(10, 10, 10, 0.55)"
              stroke="rgba(239, 196, 62, 0.65)"
              strokeWidth={4}
            />
            <text
              x={0}
              y={6}
              textAnchor="middle"
              fontSize="28"
              fontWeight="600"
              fill="#fde68a"
            >
              You are here
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
