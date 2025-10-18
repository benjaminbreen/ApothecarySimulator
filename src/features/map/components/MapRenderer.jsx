import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ExteriorMap from './ExteriorMap';
import InteriorMap from './InteriorMap';
import { LocationDropdown } from '../../../components/LocationDropdown';

/**
 * MapRenderer - Main map controller component
 * Renders the specified map based on currentMapId
 * Uses SVG viewBox for pan/zoom (no CSS transforms)
 *
 * @param {Object} props
 * @param {Object} props.scenario - Current scenario config
 * @param {string} props.currentLocation - Current location string (descriptive text only, doesn't control map rendering)
 * @param {string} props.currentMapId - Current map ID to render (e.g., 'botica-interior', 'mexico-city-center')
 * @param {Array} props.npcs - Array of NPC objects with position data
 * @param {Object} props.playerPosition - Player's current position {x, y}
 * @param {number} props.playerFacing - Player facing direction in degrees (0=N, 90=E, 180=S, 270=W)
 * @param {Function} props.onLocationChange - Callback when user clicks to change location
 * @param {string} props.theme - Theme mode: 'light' or 'dark' (defaults to 'light')
 */
export default function MapRenderer({ scenario, currentLocation, currentMapId, npcs = [], playerPosition = null, playerFacing = 180, onLocationChange, onMapClick = null, onEnterBuilding = null, onExitBuilding = null, onRoomCommand = null, theme = 'light' }) {
  const [activeMapId, setActiveMapId] = useState(null);
  const [mapType, setMapType] = useState('exterior'); // 'exterior' or 'interior'
  const [showModal, setShowModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('shop-floor'); // Default room
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const roomInfoRef = useRef(null);

  // ViewBox-based state (replaces zoom/pan CSS transforms)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1800, height: 1350 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, viewX: 0, viewY: 0 });

  // Ref for map container
  const mapContainerRef = useRef(null);

  // Get all maps from scenario
  const maps = scenario?.maps;

  // Use the provided currentMapId directly (no parsing of location strings)
  useEffect(() => {
    if (!maps || !currentMapId) {
      return;
    }

    console.log('[MapRenderer] Rendering map:', currentMapId);

    // Determine map type by checking which collection contains this ID
    if (maps.interior && maps.interior[currentMapId]) {
      console.log('[MapRenderer] Interior map detected');
      setActiveMapId(currentMapId);
      setMapType('interior');
    } else if (maps.exterior && maps.exterior[currentMapId]) {
      console.log('[MapRenderer] Exterior map detected');
      setActiveMapId(currentMapId);
      setMapType('exterior');
    } else {
      console.warn('[MapRenderer] Map ID not found:', currentMapId);
      // Fallback to first available map
      const fallbackId = Object.keys(maps.interior || {})[0] || Object.keys(maps.exterior || {})[0];
      if (fallbackId) {
        console.log('[MapRenderer] Falling back to:', fallbackId);
        setActiveMapId(fallbackId);
        setMapType(maps.interior?.[fallbackId] ? 'interior' : 'exterior');
      }
    }
  }, [currentMapId, maps]);

  // Get the current map data (MUST be defined before viewBox useEffect)
  const currentMapData = useMemo(() => {
    if (!maps || !activeMapId) return null;

    if (mapType === 'interior') {
      return maps.interior[activeMapId];
    } else {
      return maps.exterior[activeMapId];
    }
  }, [maps, activeMapId, mapType]);

  // Calculate initial viewBox based on map type and player position
  const getInitialViewBox = useCallback((mapData, mapType, playerPosition) => {
    if (!mapData?.bounds) {
      console.warn('[MapRenderer] No map bounds available, using defaults');
      return { x: 0, y: 0, width: 1800, height: 1350 };
    }

    if (mapType === 'interior') {
      // Interior: zoom in 2.5x and center on player for HUD-like experience
      const zoom = 2.0; // Increased from 1 (full map) to 2.5 (more zoomed)
      const width = mapData.bounds.width / zoom;
      const height = mapData.bounds.height / zoom;

      if (playerPosition) {
        // Center on player, clamped to map bounds
        const x = Math.max(0, Math.min(
          playerPosition.x - (width / 2),
          mapData.bounds.width - width
        ));
        const y = Math.max(0, Math.min(
          playerPosition.y - (height / 2),
          mapData.bounds.height - height
        ));

        console.log('[MapRenderer] Interior map - centering on player (HUD mode):', playerPosition, '→ viewBox:', { x, y, width, height });
        return { x, y, width, height };
      }

      // Fallback: center on map
      console.log('[MapRenderer] Interior map - centering on map center (no player position)');
      return {
        x: (mapData.bounds.width - width) / 2,
        y: (mapData.bounds.height - height) / 2,
        width,
        height
      };
    }

    // Exterior: 4x zoom centered on player
    const zoom = 4;
    const width = mapData.bounds.width / zoom;   // 1800 / 4 = 450
    const height = mapData.bounds.height / zoom; // 1350 / 4 = 337.5

    if (playerPosition) {
      // Center on player, clamped to map bounds
      const x = Math.max(0, Math.min(
        playerPosition.x - (width / 2),
        mapData.bounds.width - width
      ));
      const y = Math.max(0, Math.min(
        playerPosition.y - (height / 2),
        mapData.bounds.height - height
      ));

      console.log('[MapRenderer] Exterior map - centering on player:', playerPosition, '→ viewBox:', { x, y, width, height });
      return { x, y, width, height };
    }

    // Fallback: center on map
    console.log('[MapRenderer] Exterior map - centering on map center (no player position)');
    return {
      x: (mapData.bounds.width - width) / 2,
      y: (mapData.bounds.height - height) / 2,
      width,
      height
    };
  }, []);

  // Initialize viewBox when map type or map data changes
  useEffect(() => {
    if (!currentMapData) return;

    const newViewBox = getInitialViewBox(currentMapData, mapType, playerPosition);
    setViewBox(newViewBox);

    console.log('[MapRenderer] ViewBox initialized for', mapType, ':', newViewBox);
  }, [mapType, currentMapData, getInitialViewBox]);
  // Note: playerPosition NOT in deps - only center once on transition

  // Camera following for interior maps (HUD mode)
  // Update viewBox to follow player when they move in interior spaces
  useEffect(() => {
    // Only follow in interior maps, and only when not showing modal
    if (mapType !== 'interior' || !playerPosition || !currentMapData?.bounds || showModal) {
      return;
    }

    // Smoothly update viewBox to keep player centered
    setViewBox(prev => {
      const width = prev.width;
      const height = prev.height;

      // Calculate new viewBox centered on player
      const newX = Math.max(0, Math.min(
        playerPosition.x - (width / 2),
        currentMapData.bounds.width - width
      ));
      const newY = Math.max(0, Math.min(
        playerPosition.y - (height / 2),
        currentMapData.bounds.height - height
      ));

      // Only update if position changed significantly (avoid micro-updates)
      const deltaX = Math.abs(newX - prev.x);
      const deltaY = Math.abs(newY - prev.y);
      if (deltaX < 1 && deltaY < 1) {
        return prev; // No significant change
      }

      console.log('[MapRenderer] Camera following player:', playerPosition, '→ viewBox:', { x: newX, y: newY, width, height });
      return {
        x: newX,
        y: newY,
        width,
        height
      };
    });
  }, [playerPosition, mapType, currentMapData, showModal]);

  // PHASE 2: Zoom handlers
  const handleZoomIn = useCallback(() => {
    setViewBox(prev => {
      if (!currentMapData?.bounds) return prev;

      // Calculate new dimensions (smaller = more zoomed)
      const newWidth = prev.width / 1.15;
      const newHeight = prev.height / 1.15;

      // Enforce max zoom (min viewBox size = 1/4 of map)
      const minWidth = currentMapData.bounds.width / 4;
      const minHeight = currentMapData.bounds.height / 4;
      const clampedWidth = Math.max(minWidth, newWidth);
      const clampedHeight = Math.max(minHeight, newHeight);

      // Keep center point the same
      const centerX = prev.x + (prev.width / 2);
      const centerY = prev.y + (prev.height / 2);

      // Calculate new origin to maintain center
      const newX = centerX - (clampedWidth / 2);
      const newY = centerY - (clampedHeight / 2);

      // Clamp to map bounds
      const finalX = Math.max(0, Math.min(newX, currentMapData.bounds.width - clampedWidth));
      const finalY = Math.max(0, Math.min(newY, currentMapData.bounds.height - clampedHeight));

      console.log('[MapRenderer] Zoom in:', { width: clampedWidth, height: clampedHeight });
      return {
        x: finalX,
        y: finalY,
        width: clampedWidth,
        height: clampedHeight
      };
    });
  }, [currentMapData]);

  const handleZoomOut = useCallback(() => {
    setViewBox(prev => {
      if (!currentMapData?.bounds) return prev;

      // Calculate new dimensions (larger = less zoomed)
      const newWidth = prev.width * 1.15;
      const newHeight = prev.height * 1.15;

      // Enforce min zoom (max viewBox size = full map)
      const clampedWidth = Math.min(newWidth, currentMapData.bounds.width);
      const clampedHeight = Math.min(newHeight, currentMapData.bounds.height);

      // Keep center point the same
      const centerX = prev.x + (prev.width / 2);
      const centerY = prev.y + (prev.height / 2);

      // Calculate new origin to maintain center
      const newX = centerX - (clampedWidth / 2);
      const newY = centerY - (clampedHeight / 2);

      // Clamp to map bounds
      const finalX = Math.max(0, Math.min(newX, currentMapData.bounds.width - clampedWidth));
      const finalY = Math.max(0, Math.min(newY, currentMapData.bounds.height - clampedHeight));

      console.log('[MapRenderer] Zoom out:', { width: clampedWidth, height: clampedHeight });
      return {
        x: finalX,
        y: finalY,
        width: clampedWidth,
        height: clampedHeight
      };
    });
  }, [currentMapData]);

  const handleResetView = useCallback(() => {
    if (!currentMapData) return;

    const newViewBox = getInitialViewBox(currentMapData, mapType, playerPosition);
    setViewBox(newViewBox);
    console.log('[MapRenderer] Reset view:', newViewBox);
  }, [currentMapData, mapType, playerPosition, getInitialViewBox]);

  // PHASE 3: Pan handlers (drag)
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      viewX: viewBox.x,
      viewY: viewBox.y
    });
  }, [viewBox]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !currentMapData?.bounds || !mapContainerRef.current) return;

    // Calculate mouse delta in screen pixels
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Convert screen pixels to SVG coordinates
    const containerRect = mapContainerRef.current.getBoundingClientRect();
    const svgUnitsPerPixelX = viewBox.width / containerRect.width;
    const svgUnitsPerPixelY = viewBox.height / containerRect.height;

    const deltaSvgX = deltaX * svgUnitsPerPixelX;
    const deltaSvgY = deltaY * svgUnitsPerPixelY;

    // Update viewBox (drag moves opposite direction of mouse)
    const newX = Math.max(0, Math.min(
      dragStart.viewX - deltaSvgX,
      currentMapData.bounds.width - viewBox.width
    ));
    const newY = Math.max(0, Math.min(
      dragStart.viewY - deltaSvgY,
      currentMapData.bounds.height - viewBox.height
    ));

    setViewBox(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart, viewBox, currentMapData]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // PHASE 3: Mouse wheel zoom (zoom towards cursor position)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (!currentMapData?.bounds || !mapContainerRef.current) return;

    const containerRect = mapContainerRef.current.getBoundingClientRect();

    // Get mouse position in SVG coordinates
    const mouseScreenX = e.clientX - containerRect.left;
    const mouseScreenY = e.clientY - containerRect.top;

    const svgMouseX = viewBox.x + (mouseScreenX / containerRect.width) * viewBox.width;
    const svgMouseY = viewBox.y + (mouseScreenY / containerRect.height) * viewBox.height;

    // Zoom factor
    const zoomFactor = e.deltaY < 0 ? 0.87 : 1.15; // Zoom in/out

    setViewBox(prev => {
      const newWidth = prev.width * zoomFactor;
      const newHeight = prev.height * zoomFactor;

      // Clamp dimensions
      const minWidth = currentMapData.bounds.width / 4; // Max 4x zoom
      const maxWidth = currentMapData.bounds.width;     // Min 1x zoom
      const minHeight = currentMapData.bounds.height / 4;
      const maxHeight = currentMapData.bounds.height;

      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      // Zoom towards mouse position
      // Formula: keep the point under the mouse stationary
      const newX = svgMouseX - (svgMouseX - prev.x) * (clampedWidth / prev.width);
      const newY = svgMouseY - (svgMouseY - prev.y) * (clampedHeight / prev.height);

      // Clamp position
      const finalX = Math.max(0, Math.min(newX, currentMapData.bounds.width - clampedWidth));
      const finalY = Math.max(0, Math.min(newY, currentMapData.bounds.height - clampedHeight));

      return {
        x: finalX,
        y: finalY,
        width: clampedWidth,
        height: clampedHeight
      };
    });
  }, [viewBox, currentMapData]);

  // Attach non-passive wheel event listener
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

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
      // Use parent-provided handler for building entry
      if (onEnterBuilding) {
        // Pass building data to parent handler (GamePage → useGameHandlers)
        // This properly updates all game state (map ID, position, location, LLM context)
        onEnterBuilding(building);
      } else {
        // Fallback: local map switching only (legacy behavior)
        setActiveMapId(building.hasInterior);
        setMapType('interior');

        // Notify parent component of location change
        if (onLocationChange && maps?.interior?.[building.hasInterior]) {
          const interiorMap = maps.interior[building.hasInterior];
          onLocationChange(interiorMap.name);
        } else if (onLocationChange) {
          // Fallback: use building name if interior map not found
          onLocationChange(building.name);
        }
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

  // Handle exit button click - delegate to parent handler if provided
  const handleExitButtonClick = () => {
    if (onExitBuilding) {
      // Use parent-provided handler (GamePage → useGameHandlers)
      // This properly updates all game state (map ID, position, location, LLM context)
      onExitBuilding();
    } else {
      // Fallback: local map switching only (legacy behavior)
      const defaultExteriorMap = Object.keys(maps.exterior || {})[0];
      if (defaultExteriorMap) {
        setActiveMapId(defaultExteriorMap);
        setMapType('exterior');
        if (onLocationChange) {
          onLocationChange(maps.exterior[defaultExteriorMap].name);
        }
      }
    }
  };

  // Handle room selection from dropdown
  const handleRoomSelect = (room) => {
    const command = `go to ${room.name}`;
    console.log('[MapRenderer] Room selected:', command);

    // Update current room
    setCurrentRoom(room.id);

    // Send command through onRoomCommand (handleSubmit)
    // This processes it as a proper movement command through the LLM system
    if (onRoomCommand) {
      // Create fake event and call handleSubmit with command override
      const fakeEvent = { preventDefault: () => {} };
      onRoomCommand(fakeEvent, command);
    } else if (onLocationChange) {
      // Fallback to old behavior
      onLocationChange(command);
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
          ref={mapContainerRef}
          className={`flex-1 relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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

          {/* Maps rendered with viewBox (no CSS transforms) */}
          {mapType === 'exterior' ? (
            <ExteriorMap
              mapData={currentMapData}
              npcs={npcMarkers}
              playerPosition={playerPosition}
              playerFacing={playerFacing}
              onBuildingClick={handleBuildingClick}
              onLandmarkClick={handleLandmarkClick}
              viewBox={viewBox}
              theme={theme}
            />
          ) : (
            <InteriorMap
              mapData={currentMapData}
              npcs={npcMarkers}
              playerPosition={playerPosition}
              playerFacing={playerFacing}
              onRoomClick={handleRoomClick}
              onDoorClick={handleDoorClick}
              viewBox={viewBox}
              theme={theme}
              isModal={false}
            />
          )}
        </div>

        {/* Compact info panel */}
        <div className="px-3 py-3 border-t border-[#d4c5a9] dark:border-gray-600 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
          {/* Location name and Exit button */}
          <div className="flex justify-between items-center gap-3 mb-2.5">
            <div className="flex-1 min-w-0">
              <div className="font-['Cinzel'] text-sm font-bold text-[#3d2817] dark:text-sky-400 truncate">
                {currentMapData?.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                {mapType === 'interior' ? (
                  <button
                    ref={roomInfoRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRoomDropdown(!showRoomDropdown);
                    }}
                    className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors cursor-pointer text-left"
                    title="Click to select a different room"
                  >
                    {currentMapData?.rooms?.length} rooms • {
                      currentMapData?.rooms?.find(r => r.id === currentRoom)?.name || 'Unknown'
                    }
                  </button>
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
                  handleExitButtonClick();
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

            {/* Modal map content - shows full map (no viewBox) */}
            <div className="flex-1 overflow-hidden">
              {mapType === 'exterior' ? (
                <ExteriorMap
                  mapData={currentMapData}
                  npcs={npcMarkers}
                  playerPosition={playerPosition}
                  playerFacing={playerFacing}
                  onBuildingClick={(building) => {
                    setShowModal(false);
                    handleBuildingClick(building);
                  }}
                  onLandmarkClick={handleLandmarkClick}
                  viewBox={undefined}
                  theme={theme}
                />
              ) : (
                <InteriorMap
                  mapData={currentMapData}
                  npcs={npcMarkers}
                  playerPosition={playerPosition}
                  playerFacing={playerFacing}
                  onRoomClick={(room) => {
                    setCurrentRoom(room.id);
                    handleRoomClick(room);
                  }}
                  onDoorClick={(door) => {
                    setShowModal(false);
                    handleDoorClick(door);
                  }}
                  viewBox={undefined}
                  theme={theme}
                  isModal={true}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Room selection dropdown */}
      {mapType === 'interior' && (
        <LocationDropdown
          show={showRoomDropdown}
          onClose={() => setShowRoomDropdown(false)}
          onSelectLocation={handleRoomSelect}
          nearbyLocations={currentMapData?.rooms?.map(room => ({
            id: room.id,
            name: room.name,
            type: room.function || 'Room'
          })) || []}
          targetRef={roomInfoRef}
        />
      )}
    </>
  );
}
