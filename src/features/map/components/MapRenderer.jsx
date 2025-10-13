import React, { useState, useEffect, useMemo } from 'react';
import ExteriorMap from './ExteriorMap';
import InteriorMap from './InteriorMap';

/**
 * MapRenderer - Main map controller component
 * Determines which map to show based on current location
 *
 * @param {Object} props
 * @param {Object} props.scenario - Current scenario config
 * @param {string} props.currentLocation - Current location string (e.g., "Botica de la Amargura")
 * @param {Array} props.npcs - Array of NPC objects with position data
 * @param {Object} props.playerPosition - Player's current position {x, y}
 * @param {Function} props.onLocationChange - Callback when user clicks to change location
 * @param {string} props.theme - Theme mode: 'light' or 'dark' (defaults to 'light')
 */
export default function MapRenderer({ scenario, currentLocation, npcs = [], playerPosition = null, onLocationChange, onMapClick = null, theme = 'light' }) {
  const [activeMapId, setActiveMapId] = useState(null);
  const [mapType, setMapType] = useState('exterior'); // 'exterior' or 'interior'
  const [showModal, setShowModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('shop-floor'); // Default room

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Get all maps from scenario
  const maps = scenario?.maps;

  // Reset zoom when map type changes
  useEffect(() => {
    if (mapType === 'exterior') {
      setZoom(1.8); // Exterior maps more zoomed in
      setPan({ x: 0, y: 0 }); // Reset pan
    } else {
      setZoom(1); // Interior maps normal zoom
      setPan({ x: 0, y: 0 }); // Reset pan
    }
  }, [mapType]);

  // Determine which map to show based on current location
  useEffect(() => {
    if (!maps || !currentLocation) {
      return;
    }

    console.log('[MapRenderer] Location changed to:', currentLocation);

    // Keywords that indicate exterior/outdoor locations
    const exteriorKeywords = ['outside', 'street', 'calle', 'plaza', 'square', 'market', 'alley', 'callejón', 'road', 'avenue'];
    const isLikelyExterior = exteriorKeywords.some(keyword =>
      currentLocation.toLowerCase().includes(keyword)
    );

    console.log('[MapRenderer] Is likely exterior?', isLikelyExterior);

    // If location contains exterior keywords, prioritize exterior maps
    if (isLikelyExterior) {
      const exteriorMapEntry = Object.entries(maps.exterior || {}).find(([id, mapData]) => {
        return mapData.name === currentLocation || currentLocation.includes(mapData.name);
      });

      if (exteriorMapEntry) {
        console.log('[MapRenderer] Matched exterior map:', exteriorMapEntry[1].name);
        setActiveMapId(exteriorMapEntry[0]);
        setMapType('exterior');
        return;
      }

      // Default to first exterior map if no specific match
      const defaultExteriorMap = Object.keys(maps.exterior || {})[0];
      if (defaultExteriorMap) {
        console.log('[MapRenderer] Using default exterior map');
        setActiveMapId(defaultExteriorMap);
        setMapType('exterior');
        return;
      }
    }

    // Check for interior maps (only if not likely exterior)
    const interiorMapEntry = Object.entries(maps.interior || {}).find(([id, mapData]) => {
      return mapData.name === currentLocation || currentLocation.includes(mapData.name);
    });

    if (interiorMapEntry) {
      console.log('[MapRenderer] Matched interior map:', interiorMapEntry[1].name);
      setActiveMapId(interiorMapEntry[0]);
      setMapType('interior');
      return;
    }

    // Otherwise, check for exterior maps by name
    const exteriorMapEntry = Object.entries(maps.exterior || {}).find(([id, mapData]) => {
      return mapData.name === currentLocation || currentLocation.includes(mapData.name);
    });

    if (exteriorMapEntry) {
      console.log('[MapRenderer] Matched exterior map:', exteriorMapEntry[1].name);
      setActiveMapId(exteriorMapEntry[0]);
      setMapType('exterior');
      return;
    }

    // Default to first exterior map (usually city center)
    const defaultExteriorMap = Object.keys(maps.exterior || {})[0];
    if (defaultExteriorMap) {
      console.log('[MapRenderer] Using default exterior map');
      setActiveMapId(defaultExteriorMap);
      setMapType('exterior');
    }
  }, [currentLocation, maps]);

  // Get the current map data
  const currentMapData = useMemo(() => {
    if (!maps || !activeMapId) return null;

    if (mapType === 'interior') {
      return maps.interior[activeMapId];
    } else {
      return maps.exterior[activeMapId];
    }
  }, [maps, activeMapId, mapType]);

  // Reset zoom/pan when map changes
  useEffect(() => {
    if (mapType === 'exterior') {
      setZoom(1.8);
    } else {
      setZoom(1);
    }
    setPan({ x: 0, y: 0 });
  }, [activeMapId, mapType]);

  // Zoom handlers - Smoother, slower zoom (1.15 instead of 1.3)
  const handleZoomIn = () => {
    setZoom(z => Math.min(z * 1.15, 4)); // Max 4x zoom, gentler increment
  };

  const handleZoomOut = () => {
    setZoom(z => Math.max(z / 1.15, 0.5)); // Min 0.5x zoom, gentler decrement
  };

  const handleResetView = () => {
    // Reset to appropriate zoom based on map type
    if (mapType === 'exterior') {
      setZoom(1.8);
    } else {
      setZoom(1);
    }
    setPan({ x: 0, y: 0 });
  };

  // Pan handlers
  const handleMouseDown = (e) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Convert NPCs to map markers format
  const npcMarkers = useMemo(() => {
    const markers = npcs
      .map((npc, index) => ({
        npcId: npc.npcId || npc.id || npc.name || `npc-${index}`, // Ensure every NPC has an ID
        npcName: npc.npcName || npc.name || `Unknown NPC ${index}`,
        position: npc.position || npc.mapPosition || [100, 100], // Default position if not set
        status: npc.status || 'idle',
        path: npc.movementPath || npc.path || null,
        pathProgress: npc.pathProgress || 0
      }))
      .filter((npc, index, self) => {
        // Filter out NPCs with duplicate IDs (keep first occurrence)
        return index === self.findIndex(n => n.npcId === npc.npcId);
      });

    return markers;
  }, [npcs]);

  // Handle building click (exterior map)
  const handleBuildingClick = (building) => {
    if (building.hasInterior) {
      // Switch to interior map
      setActiveMapId(building.hasInterior);
      setMapType('interior');

      // Notify parent component of location change
      if (onLocationChange) {
        const interiorMap = maps.interior[building.hasInterior];
        onLocationChange(interiorMap.name);
      }
    } else {
      // Navigate to this building's location (but stay on exterior map)
      if (onLocationChange) {
        onLocationChange(building.name);
      }
    }
  };

  // Handle landmark click
  const handleLandmarkClick = (landmark) => {
    console.log('Landmark clicked:', landmark.name);
    // Could trigger travel events, quests, etc.
  };

  // Handle room click (interior map)
  const handleRoomClick = (room) => {
    console.log('Room clicked:', room.name);
    setCurrentRoom(room.id);
    // Could trigger room-specific interactions
  };

  // Handle door click (interior map)
  const handleDoorClick = (door) => {
    if (door.isLocked) {
      console.log('Door is locked:', door.id);
      // Could trigger unlock attempt, notification, etc.
      return;
    }

    if (door.to === 'street' || door.to === 'alley') {
      // Exit to exterior map
      const defaultExteriorMap = Object.keys(maps.exterior || {})[0];
      if (defaultExteriorMap) {
        setActiveMapId(defaultExteriorMap);
        setMapType('exterior');

        // Notify parent of location change
        if (onLocationChange) {
          onLocationChange(maps.exterior[defaultExteriorMap].name);
        }
      }
    } else {
      // Move to another room (stay in interior)
      console.log('Moving to:', door.to);
      // Could update player position, trigger events, etc.
    }
  };

  // Handle exit button click
  const handleExitBuilding = () => {
    const defaultExteriorMap = Object.keys(maps.exterior || {})[0];
    if (defaultExteriorMap) {
      setActiveMapId(defaultExteriorMap);
      setMapType('exterior');
      if (onLocationChange) {
        onLocationChange(maps.exterior[defaultExteriorMap].name);
      }
    }
  };

  // Show loading if no map data
  if (!currentMapData) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500 dark:text-gray-400 font-sans">
        {maps ? 'Loading map...' : 'No map data available'}
      </div>
    );
  }

  // Render appropriate map type
  return (
    <>
      <div className="flex flex-col h-full">
        {/* Clickable map area */}
        <div
          className={`flex-1 relative overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          onClick={() => {
            if (onMapClick) {
              onMapClick();
            } else {
              setShowModal(true);
            }
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          title="Drag to pan, scroll to zoom, click to enlarge"
        >
          {/* Zoom controls - Compact and glassy */}
          <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold transition-all opacity-60 hover:opacity-100 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border border-emerald-600/20 dark:border-sky-400/20 text-emerald-700 dark:text-sky-400 hover:bg-white/50 dark:hover:bg-slate-900/50"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold transition-all opacity-60 hover:opacity-100 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border border-emerald-600/20 dark:border-sky-400/20 text-emerald-700 dark:text-sky-400 hover:bg-white/50 dark:hover:bg-slate-900/50"
              title="Zoom out"
            >
              −
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleResetView(); }}
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all opacity-60 hover:opacity-100 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border border-emerald-600/20 dark:border-sky-400/20 text-emerald-700 dark:text-sky-400 hover:bg-white/50 dark:hover:bg-slate-900/50"
              title="Reset view"
            >
              ⟲
            </button>
          </div>

          {/* Map container with zoom/pan transform */}
          <div
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center',
              transition: isPanning ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            {mapType === 'exterior' ? (
              <ExteriorMap
                mapData={currentMapData}
                npcs={npcMarkers}
                playerPosition={playerPosition}
                onBuildingClick={handleBuildingClick}
                onLandmarkClick={handleLandmarkClick}
                zoom={zoom}
                theme={theme}
              />
            ) : (
              <InteriorMap
                mapData={currentMapData}
                npcs={npcMarkers}
                playerPosition={playerPosition}
                onRoomClick={handleRoomClick}
                onDoorClick={handleDoorClick}
                theme={theme}
                isModal={false}
              />
            )}
          </div>
        </div>

        {/* Compact info panel */}
        <div className="px-3 py-2 border-t border-[#d4c5a9] dark:border-gray-600 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
          {/* Location name and Exit button */}
          <div className="flex justify-between items-center gap-3 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="font-['Cinzel'] text-xs font-bold text-[#3d2817] dark:text-sky-400 truncate">
                {currentMapData?.name}
              </div>
              <div className="text-[0.65rem] text-gray-600 dark:text-gray-400 font-sans">
                {mapType === 'interior' ? (
                  <>
                    {currentMapData?.rooms?.length} rooms • {
                      currentMapData?.rooms?.find(r => r.id === currentRoom)?.name || 'Unknown'
                    }
                  </>
                ) : (
                  <>
                    {currentMapData?.buildings?.length} buildings
                  </>
                )}
              </div>
            </div>

            {/* Exit button - only show for interior maps */}
            {mapType === 'interior' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExitBuilding();
                }}
                className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border border-emerald-600/40 dark:border-sky-400/40 text-emerald-700 dark:text-sky-400 hover:bg-emerald-50 dark:hover:bg-sky-900/20 transition-colors"
                title="Exit to city view"
              >
                <span className="text-sm">🚪</span>
                <span>Exit</span>
              </button>
            )}
          </div>

          {/* Compact legend */}
          {mapType === 'exterior' && (
            <div className="flex items-center gap-3 text-[0.65rem] text-gray-600 dark:text-gray-400 font-sans">
              {playerPosition && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-sky-400 border border-emerald-800 dark:border-white"></div>
                  <span>You</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-100 dark:bg-slate-700 border border-amber-400 dark:border-gray-500"></div>
                <span>Buildings</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-white border border-gray-400 dark:border-sky-400"></div>
                <span>NPCs</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enlarged map modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-10 animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-[90%] max-w-6xl h-[90vh] bg-[#fffcf5] dark:bg-slate-900 rounded-2xl border-2 border-emerald-600/30 dark:border-sky-400/30 shadow-2xl dark:shadow-sky-400/20 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-5 py-3 border-b-2 border-[#d4c5a9] dark:border-gray-700 flex justify-between items-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <div>
                <div className="font-['Cinzel'] text-base font-bold text-[#3d2817] dark:text-sky-400">
                  {currentMapData?.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-sans">
                  {mapType === 'interior' ? (
                    <>Currently in: {currentMapData?.rooms?.find(r => r.id === currentRoom)?.name}</>
                  ) : (
                    <>Showing {currentMapData?.buildings?.length} locations</>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border-2 border-emerald-600/40 dark:border-sky-400/40 text-emerald-700 dark:text-sky-400 font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-sky-900/20 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Modal map content */}
            <div className="flex-1 overflow-hidden">
              {mapType === 'exterior' ? (
                <ExteriorMap
                  mapData={currentMapData}
                  npcs={npcMarkers}
                  playerPosition={playerPosition}
                  onBuildingClick={(building) => {
                    setShowModal(false);
                    handleBuildingClick(building);
                  }}
                  onLandmarkClick={handleLandmarkClick}
                  zoom={zoom}
                  theme={theme}
                />
              ) : (
                <InteriorMap
                  mapData={currentMapData}
                  npcs={npcMarkers}
                  playerPosition={playerPosition}
                  onRoomClick={(room) => {
                    setCurrentRoom(room.id);
                    handleRoomClick(room);
                  }}
                  onDoorClick={(door) => {
                    setShowModal(false);
                    handleDoorClick(door);
                  }}
                  theme={theme}
                  isModal={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
