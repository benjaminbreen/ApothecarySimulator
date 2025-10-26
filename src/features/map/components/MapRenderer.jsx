import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ExteriorMap from './ExteriorMap';
import InteriorMap from './InteriorMap';
import { LocationDropdown } from '../../../components/LocationDropdown';
import { GridMovementSystem } from '../services/gridMovementSystem';

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
 * @param {Function} props.onFurnitureClick - Callback when furniture is clicked
 * @param {Function} props.onPlayerTeleport - Callback for Ctrl+Click teleport {x, y, gridX, gridY}
 * @param {string} props.theme - Theme mode: 'light' or 'dark' (defaults to 'light')
 * @param {Array<[number, number]>} props.travelPath - Phase 3B: Animated travel path for house calls
 * @param {boolean} props.isTraveling - Phase 3B: Whether travel animation is active
 */
export default function MapRenderer({ scenario, currentLocation, currentMapId, npcs = [], playerPosition = null, playerFacing = 180, onLocationChange, onMapClick = null, onEnterBuilding = null, onExitBuilding = null, onRoomCommand = null, onFurnitureClick = null, onPlayerTeleport = null, onAnimationComplete = null, theme = 'light', travelPath = null, isTraveling = false }) {
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

  // Ctrl+Click teleport feedback
  const [invalidClickPos, setInvalidClickPos] = useState(null); // { x, y } in SVG coords

  // Map transition state
  const [transitionState, setTransitionState] = useState('idle'); // 'idle' | 'fadeOut' | 'fadeIn'
  const [pendingMapChange, setPendingMapChange] = useState(null); // { mapId, mapType }
  const [mapOpacity, setMapOpacity] = useState(1);
  const transitionFrameRef = useRef(null);

  // Animation state for smooth movement (using refs to avoid re-render issues)
  const isAnimatingRef = useRef(false);
  const animationTargetRef = useRef(null); // { x, y, gridX, gridY }
  const animationStartPosRef = useRef(null); // Starting position
  const animationFrameRef = useRef(null);

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

    // Determine target map type
    let targetMapType = null;
    if (maps.interior && maps.interior[currentMapId]) {
      targetMapType = 'interior';
    } else if (maps.exterior && maps.exterior[currentMapId]) {
      targetMapType = 'exterior';
    } else {
      console.warn('[MapRenderer] Map ID not found:', currentMapId);
      // Fallback to first available map
      const fallbackId = Object.keys(maps.interior || {})[0] || Object.keys(maps.exterior || {})[0];
      if (fallbackId) {
        console.log('[MapRenderer] Falling back to:', fallbackId);
        targetMapType = maps.interior?.[fallbackId] ? 'interior' : 'exterior';
      }
    }

    // Check if this is a map change (not initial load)
    if (activeMapId && activeMapId !== currentMapId) {
      console.log('[MapRenderer] Map change detected:', activeMapId, '→', currentMapId);
      // Start transition
      setPendingMapChange({ mapId: currentMapId, mapType: targetMapType });
      setTransitionState('fadeOut');
    } else if (!activeMapId && targetMapType) {
      // Initial load - no transition
      console.log('[MapRenderer] Initial map load:', currentMapId, '(', targetMapType, ')');
      setActiveMapId(currentMapId);
      setMapType(targetMapType);
    }
  }, [currentMapId, maps, activeMapId]);

  // Get the current map data (MUST be defined before viewBox useEffect)
  const currentMapData = useMemo(() => {
    if (!maps || !activeMapId) return null;

    if (mapType === 'interior') {
      return maps.interior[activeMapId];
    } else {
      return maps.exterior[activeMapId];
    }
  }, [maps, activeMapId, mapType]);

  // Create GridMovementSystem instance for collision detection
  const gridSystem = useMemo(() => {
    if (!currentMapData) return null;
    return new GridMovementSystem(currentMapData, 20);
  }, [currentMapData]);

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

  // Map transition orchestration
  useEffect(() => {
    if (transitionState === 'fadeOut') {
      console.log('[MapRenderer] Transition Phase 1: Fade out');
      setMapOpacity(0);

      // After fade-out completes, swap the map
      setTimeout(() => {
        if (!pendingMapChange) return;

        console.log('[MapRenderer] Transition Phase 2: Swap map to', pendingMapChange.mapId);
        setActiveMapId(pendingMapChange.mapId);
        setMapType(pendingMapChange.mapType);
        setTransitionState('fadeIn');
      }, 350); // 300ms fade + 50ms buffer
    }

    if (transitionState === 'fadeIn' && currentMapData) {
      console.log('[MapRenderer] Transition Phase 3: Zoom + Fade in');

      // Start zoom animation
      const targetViewBox = getInitialViewBox(currentMapData, mapType, playerPosition);

      // Start zoomed OUT (2x normal dimensions)
      const startViewBox = {
        x: targetViewBox.x - targetViewBox.width * 0.5,
        y: targetViewBox.y - targetViewBox.height * 0.5,
        width: targetViewBox.width * 2,
        height: targetViewBox.height * 2
      };

      const startTime = Date.now();
      const duration = 600; // 600ms for zoom + fade

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic function (fast start, slow end)
        const eased = 1 - Math.pow(1 - progress, 3);

        // Interpolate viewBox
        setViewBox({
          x: startViewBox.x + (targetViewBox.x - startViewBox.x) * eased,
          y: startViewBox.y + (targetViewBox.y - startViewBox.y) * eased,
          width: startViewBox.width + (targetViewBox.width - startViewBox.width) * eased,
          height: startViewBox.height + (targetViewBox.height - startViewBox.height) * eased
        });

        // Fade in opacity simultaneously
        setMapOpacity(eased);

        if (progress < 1) {
          transitionFrameRef.current = requestAnimationFrame(animate);
        } else {
          console.log('[MapRenderer] Transition complete');
          setTransitionState('idle');
          setPendingMapChange(null);
        }
      };

      transitionFrameRef.current = requestAnimationFrame(animate);

      // Cleanup on unmount or state change
      return () => {
        if (transitionFrameRef.current) {
          cancelAnimationFrame(transitionFrameRef.current);
        }
      };
    }
  }, [transitionState, pendingMapChange, currentMapData, mapType, playerPosition, getInitialViewBox]);

  // Camera following for interior maps (HUD mode)
  // Update viewBox to follow player when they move in interior spaces
  useEffect(() => {
    // Only follow in interior maps, and only when not showing modal or transitioning
    if (mapType !== 'interior' || !playerPosition || !currentMapData?.bounds || showModal || transitionState !== 'idle') {
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
  }, [playerPosition, mapType, currentMapData, showModal, transitionState]);

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

    // Zoom factor (made less aggressive for smoother zooming)
    const zoomFactor = e.deltaY < 0 ? 0.95 : 1.05; // Zoom in/out

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

  // ANIMATION LOOP: Smoothly move player to target position
  const startAnimation = useCallback((startPos, targetPos) => {
    if (!onPlayerTeleport || !gridSystem) return;

    console.log('[MapRenderer] Starting animation from', startPos, 'to', targetPos);

    const startX = startPos.x;
    const startY = startPos.y;
    const targetX = targetPos.x;
    const targetY = targetPos.y;

    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Movement speed: Adjust based on map type
    // Interior: Fast (300px/s) - small rooms
    // Exterior: Slower (150px/s) - represents longer city distances
    const speed = mapType === 'exterior' ? 150 : 300;
    const duration = (distance / speed) * 1000; // milliseconds

    // Calculate travel time in game minutes
    // For exterior maps: ~1 minute per 10 pixels (represents ~7m at 1.5px/m scale)
    // For interior maps: Negligible time (instant within building)
    const travelMinutes = mapType === 'exterior'
      ? Math.round(distance / 10) // 1 game minute per ~70 meters
      : 0;

    const startTime = Date.now();
    let lastUpdateTime = startTime;
    const updateInterval = 50; // Update position state every 50ms (20fps for state updates)

    const animate = () => {
      if (!isAnimatingRef.current) {
        console.log('[MapRenderer] Animation cancelled');
        return; // Animation was cancelled
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1); // 0 to 1

      // Ease-in-out interpolation
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentX = startX + deltaX * easeProgress;
      const currentY = startY + deltaY * easeProgress;

      // Convert to grid coordinates
      const gridPos = gridSystem.pixelToGrid(currentX, currentY);

      // Throttle state updates to prevent React overload
      // Only update every 50ms instead of every frame (60fps)
      const now = Date.now();
      const shouldUpdate = now - lastUpdateTime >= updateInterval || progress === 1;

      if (shouldUpdate && onPlayerTeleport) {
        lastUpdateTime = now;
        onPlayerTeleport({
          x: currentX,
          y: currentY,
          gridX: gridPos.gridX,
          gridY: gridPos.gridY
        });
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - trigger callback with journey data
        console.log('[MapRenderer] Animation complete');
        isAnimatingRef.current = false;
        animationTargetRef.current = null;
        animationStartPosRef.current = null;

        // Call completion handler with journey details
        if (onAnimationComplete) {
          onAnimationComplete({
            startPosition: { x: startX, y: startY },
            endPosition: { x: targetX, y: targetY },
            distance: distance, // pixels
            travelMinutes: travelMinutes, // game time
            mapType: mapType, // 'interior' or 'exterior'
            mapId: activeMapId
          });
        }
      }
    };

    animate();
  }, [onPlayerTeleport, gridSystem, mapType, activeMapId, onAnimationComplete]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        isAnimatingRef.current = false;
      }
    };
  }, []);

  // Simple pathfinding: Check if straight line is clear
  const canMoveInStraightLine = useCallback((fromPos, toPos) => {
    if (!gridSystem) return false;

    const fromGrid = gridSystem.pixelToGrid(fromPos.x, fromPos.y);
    const toGrid = gridSystem.pixelToGrid(toPos.x, toPos.y);

    // Use Bresenham's line algorithm to check all cells along the path
    const dx = Math.abs(toGrid.gridX - fromGrid.gridX);
    const dy = Math.abs(toGrid.gridY - fromGrid.gridY);
    const sx = fromGrid.gridX < toGrid.gridX ? 1 : -1;
    const sy = fromGrid.gridY < toGrid.gridY ? 1 : -1;
    let err = dx - dy;

    let x = fromGrid.gridX;
    let y = fromGrid.gridY;

    while (true) {
      // Check if current cell is walkable
      if (!gridSystem.isWalkable(x, y)) {
        return false; // Path blocked
      }

      // Reached destination
      if (x === toGrid.gridX && y === toGrid.gridY) {
        return true; // Path clear!
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }, [gridSystem]);

  // CTRL+CLICK ANIMATED MOVEMENT: Convert click to grid position and animate if walkable
  const handleMapClick = useCallback((e) => {
    // Only handle Ctrl+Click (or Cmd+Click on Mac)
    if (!e.ctrlKey && !e.metaKey) return;
    if (!onPlayerTeleport || !gridSystem || !currentMapData || !mapContainerRef.current || !playerPosition) return;

    e.preventDefault();
    e.stopPropagation();

    const containerRect = mapContainerRef.current.getBoundingClientRect();

    // Get mouse position in screen coordinates
    const mouseScreenX = e.clientX - containerRect.left;
    const mouseScreenY = e.clientY - containerRect.top;

    // Convert screen coordinates to SVG coordinates
    const svgX = viewBox.x + (mouseScreenX / containerRect.width) * viewBox.width;
    const svgY = viewBox.y + (mouseScreenY / containerRect.height) * viewBox.height;

    console.log('[MapRenderer] Ctrl+Click movement attempt:', { svgX, svgY });

    // Convert SVG coordinates to grid coordinates
    const gridPos = gridSystem.pixelToGrid(svgX, svgY);

    console.log('[MapRenderer] Grid position:', gridPos);

    // Check if the destination is walkable
    if (!gridSystem.isWalkable(gridPos.gridX, gridPos.gridY)) {
      console.log('[MapRenderer] ❌ Invalid destination - showing feedback');
      setInvalidClickPos({ x: svgX, y: svgY });
      setTimeout(() => setInvalidClickPos(null), 1000);
      return;
    }

    // Check if path is clear
    if (!canMoveInStraightLine(playerPosition, gridPos)) {
      console.log('[MapRenderer] ❌ Path blocked - showing feedback');
      setInvalidClickPos({ x: svgX, y: svgY });
      setTimeout(() => setInvalidClickPos(null), 1000);
      return;
    }

    console.log('[MapRenderer] ✅ Valid path - starting animation');

    // Clear any previous animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      isAnimatingRef.current = false;
    }

    // Store animation target and start position
    animationTargetRef.current = {
      x: gridPos.x,
      y: gridPos.y,
      gridX: gridPos.gridX,
      gridY: gridPos.gridY
    };
    animationStartPosRef.current = {
      x: playerPosition.x,
      y: playerPosition.y
    };
    isAnimatingRef.current = true;

    // Start animation
    startAnimation(animationStartPosRef.current, animationTargetRef.current);

    // Clear any invalid click feedback
    setInvalidClickPos(null);
  }, [onPlayerTeleport, gridSystem, currentMapData, viewBox, playerPosition, canMoveInStraightLine, startAnimation]);

  // Listen for ESC key to close modal
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

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
          style={{
            opacity: mapOpacity,
            transition: transitionState === 'fadeOut' ? 'opacity 300ms ease-out' : 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleMapClick}
          title="Drag to pan, scroll to zoom, Ctrl+Click to move (animated)"
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
              travelPath={travelPath}
              isTraveling={isTraveling}
            />
          ) : (
            <InteriorMap
              mapData={currentMapData}
              npcs={npcMarkers}
              playerPosition={playerPosition}
              playerFacing={playerFacing}
              onRoomClick={handleRoomClick}
              onDoorClick={handleDoorClick}
              onFurnitureClick={onFurnitureClick}
              viewBox={viewBox}
              theme={theme}
              isModal={false}
            />
          )}

          {/* Invalid click feedback - Red X indicator */}
          {invalidClickPos && (
            <div
              className="absolute pointer-events-none animate-ping"
              style={{
                left: `${((invalidClickPos.x - viewBox.x) / viewBox.width) * 100}%`,
                top: `${((invalidClickPos.y - viewBox.y) / viewBox.height) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#dc2626" strokeWidth="3" opacity="0.8" />
                <line x1="12" y1="12" x2="28" y2="28" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
                <line x1="28" y1="12" x2="12" y2="28" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
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

            {/* Action buttons */}
            <div className="flex-shrink-0 flex items-center gap-2">
              {/* View Full Map button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMapClick) {
                    onMapClick();
                  } else {
                    setShowModal(true);
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border border-amber-600/40 dark:border-amber-400/40 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                title="Open full map view"
              >
                <span className="text-sm">🗺️</span>
                <span>View Full Map</span>
              </button>

              {/* Exit button - only show for interior maps */}
              {mapType === 'interior' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExitButtonClick();
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border border-emerald-600/40 dark:border-sky-400/40 text-emerald-700 dark:text-sky-400 hover:bg-emerald-50 dark:hover:bg-sky-900/20 transition-colors"
                  title="Exit to city view"
                >
                  <span className="text-sm">🚪</span>
                  <span>Exit</span>
                </button>
              )}
            </div>
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
                  travelPath={travelPath}
                  isTraveling={isTraveling}
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
                  onFurnitureClick={onFurnitureClick}
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
