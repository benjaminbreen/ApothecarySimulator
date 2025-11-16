// useNavigationHandlers.js
// Handles all player movement and location transitions
// Extracted from useGameHandlers.js (Phase 2.1)

import { useCallback, useEffect, useRef } from 'react';
import { useGameState } from '../../contexts/GameStateContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { useNPCs } from '../../contexts/NPCContext';
import { orchestrateTurn } from '../../core/agents/AgentOrchestrator';
import { scenarioLoader } from '../../core/services/scenarioLoader';
import { parseNarrativeChoices } from '../../utils/narrativeParser';
import { determinePatientPosition, getPlacementNarrative } from '../../features/medical/services/patientPositioning'; // Phase 3C
import { getLocationNPCs } from '../../core/services/locationContextService'; // Location NPC system
import { resolvePortrait } from '../../core/services/portraitResolver'; // Phase 2: Portrait resolution
import { entityManager } from '../../core/entities/EntityManager'; // For enriching patient entities
import { getZoomTargetForBuilding } from '../../components/HorizonLine'; // Zoom target calculation
import { animateBackgroundZoom, animateBackgroundZoomOut, maintainZoom } from '../../utils/zoomAnimation'; // Zoom animation utilities
import { getLocationName } from '../../features/map/services/reverseGeocoder'; // Phase 1-2: Reverse geocoding for location names
import { getListTypeById } from '../../core/config/listTypes.config'; // List feature for auto-generating people list on arrival
import { createChatCompletion } from '../../core/services/llmService'; // LLM service for dynamic narratives
import { matchNavigationLocation, getSuggestedLocations } from '../../scenarios/1680-mexico-city/data/navigationLocations'; // Location-based navigation
import { calculateStreetBasedPath, calculateTravelTime } from '../../features/map/services/cityPathfinding'; // Pathfinding for location-based navigation
import { getFullLocationContext } from '../../scenarios/1680-mexico-city/data/streetGrid'; // Street context for arrivals

const BOTICA_MAIN_DOOR = { x: 400, y: 700 };
const WALK_STEP_DELAY_MS = 70;

const ARRIVAL_ARCHETYPES = {
  plaza: {
    people: [
      '**Don Alonso Herrán** arguing with a royal scribe',
      '**Doña Ysabel de Sandoval** distributing alms beneath the arcades',
      '**two Tlaxcalan porters** steadying crates on their shoulders'
    ],
    choices: [
      'petition the cabildo clerks',
      'greet Doña Ysabel',
      'observe the porters'
    ]
  },
  church: {
    people: [
      '**Padre Sebastián** anointing a penitent',
      '**Sor Francisca** ushering novices toward choir',
      '**Captain Ibarra** kneeling with his plumed hat in hand'
    ],
    choices: [
      'seek the sacristan',
      'speak with Sor Francisca',
      'light a candle in the side chapel'
    ]
  },
  government: {
    people: [
      '**Licenciado Martín de la Cueva** reviewing petitions',
      '**Scribe Hernando Díaz** sharpening his quills',
      '**two alguaciles** escorting a merchant up the stairs'
    ],
    choices: [
      'petition the regidores',
      'question Licenciado Martín',
      'listen to the alguaciles'
    ]
  },
  market: {
    people: [
      '**Doña Beatriz the silk vendor** bargaining over bolts of brocade',
      '**Sebastián the cacao broker** weighing beans on a brass scale',
      '**two Mixtec muleteers** unloading wicker panniers'
    ],
    choices: [
      'inspect the silk bolts',
      'negotiate with Sebastián',
      'help the muleteers unload'
    ]
  },
  default: {
    people: [
      '**Don Diego de Sandoval** conferring with a clerk',
      '**Sister Beatriz** guiding parishioners toward the nave',
      '**two indigenous porters** balancing crates'
    ],
    choices: [
      'announce yourself',
      'speak with Don Diego',
      'observe quietly from the edge'
    ]
  }
};

const getArrivalArchetypes = (destination) => {
  if (!destination) return ARRIVAL_ARCHETYPES.default;
  const typeKey = destination.type && ARRIVAL_ARCHETYPES[destination.type]
    ? destination.type
    : 'default';
  return ARRIVAL_ARCHETYPES[typeKey] || ARRIVAL_ARCHETYPES.default;
};

/**
 * Detect "go to [location]" commands on exterior maps
 * Returns { isLocationCommand: true, targetLocation: string } or null
 *
 * @param {string} input - User's input text
 * @param {string} currentMapId - Current map ID
 * @returns {Object|null} Location command data or null if not a location command
 */
export function detectLocationCommand(input, currentMapId) {
  // Only apply to exterior city maps
  const isExteriorMap = currentMapId?.includes('city') ||
                        currentMapId?.includes('world') ||
                        currentMapId === 'mexico-city-center';

  if (!isExteriorMap) return null;

  // Regex patterns for location commands
  const patterns = [
    /^(?:go|walk|travel|head|move)\s+(?:to|towards?)\s+(?:the\s+)?(.+)$/i,
    /^(?:visit|find|locate)\s+(?:the\s+)?(.+)$/i,
    /^take me to\s+(?:the\s+)?(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = input.trim().match(pattern);
    if (match) {
      console.log('[Navigation] Location command detected:', match[1]);
      return {
        isLocationCommand: true,
        targetLocation: match[1].trim()
      };
    }
  }

  return null;
}

/**
 * Custom hook for navigation handlers
 * Manages player movement, building entry/exit, and fast travel
 *
 * @param {Object} params - Hook parameters
 * @param {Function} params.setIsLoading - Loading state setter
 * @param {Function} params.setUserInput - User input setter
 * @param {Function} params.setUserActions - User actions setter
 * @param {Function} params.setHistoryOutput - History output setter
 * @param {Function} params.setConversationHistory - Conversation history setter
 * @param {Function} params.setTurnNumber - Turn number setter
 * @param {Function} params.setPendingExitData - Pending exit data setter
 * @param {Function} params.setShowExitConfirmation - Exit confirmation modal setter
 * @param {Function} params.setDynamicChips - Dynamic chips setter
 * @param {Function} params.addJournalEntry - Journal entry adder
 * @param {Function} params.addToHistory - Add to conversation history helper
 * @param {Object} params.gameState - Current game state (passed from parent)
 * @param {Object} params.playerPosition - Current player position (passed from parent)
 * @param {number} params.playerFacing - Current player facing direction (passed from parent)
 * @param {string} params.currentMapId - Current map ID
 * @param {Function} params.setCurrentMapId - Current map ID setter
 * @param {Object} params.currentMapData - Current map data
 * @param {Array} params.conversationHistory - Conversation history
 * @param {number} params.turnNumber - Current turn number
 * @param {Object} params.npcTracker - NPC tracker instance
 * @param {Object} params.reputation - Reputation state
 * @param {number} params.currentWealth - Current wealth
 * @param {Object} params.npcPositions - NPC positions
 * @param {Object} params.playerSkills - Player skills
 * @param {Array} params.journal - Journal entries
 * @param {string} params.scenarioId - Scenario ID
 * @param {Function} params.setActivePatient - Set active patient (Phase 3B)
 * @param {Function} params.setPatientDialogue - Set patient dialogue (Phase 3B)
 * @param {Function} params.setPendingHouseCall - Set pending house call (Phase 3B)
 * @param {Function} params.toast - Toast notification function (Phase 3B)
 * @param {Function} params.setNPCPosition - Set NPC position (Phase 3C)
 * @param {Function} params.awardXP - Award XP function (Phase 3D)
 * @param {Function} params.updateReputation - Update reputation function (Phase 3D)
 * @param {Function} params.setTravelAnimationState - Set travel path state for UI overlays
 * @param {Function} params.setBackgroundMode - Set background mode for immersive UI
 * @param {Function} params.setTravelZoomState - Set travel zoom state for background zoom effects
 * @param {Object} params.handleListRequestRef - Ref to list request handler (auto-called after fast travel)
 *
 * @returns {Object} Navigation handlers
 */
export function useNavigationHandlers({
  setIsLoading,
  setUserInput,
  setUserActions,
  setHistoryOutput,
  setConversationHistory,
  setTurnNumber,
  setPendingExitData,
  setShowExitConfirmation,
  setDynamicChips,
  addJournalEntry,
  addToHistory,
  // Legacy params (still needed for orchestrateTurn)
  gameState,
  playerPosition,
  playerFacing,
  currentMapId,
  setCurrentMapId,
  currentMapData,
  conversationHistory,
  turnNumber,
  npcTracker,
  reputation,
  currentWealth,
  npcPositions,
  playerSkills,
  activeEffects, // Body effects from PlayerContext
  journal,
  scenarioId,
  // Phase 3B: House call arrival
  setActivePatient,
  setPatientDialogue,
  setPendingHouseCall,
  toast,
  // Phase 3C: Patient positioning
  setNPCPosition,
  // Phase 3D: House call completion
  awardXP,
  updateReputation,
  setTravelAnimationState,
  openLongDistanceTravelCard,
  setBackgroundMode, // Immersive background mode
  setTravelZoomState, // Background zoom effects
  handleListRequestRef, // List feature handler ref
}) {
  // Context hooks
  const { updateLocation, advanceTime, updateInventory, setGameState, setEnergy } = useGameState();
  const { setPosition: setPlayerPosition, setFacing: setPlayerFacing } = usePlayer();
  const { setPrimaryPortraitFile, currentEntities } = useNPCs();

  // Ref for current building data (used by exit handler)
  const currentBuildingRef = useRef(null);
  const travelTimeoutsRef = useRef([]);

  const normalizeText = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const isNPCReference = (query) => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return false;

    const npcNameSet = new Set();
    try {
      const recentNPCs = npcTracker?.getRecentNPCs?.() || [];
      recentNPCs.forEach(name => {
        const normalized = normalizeText(name);
        if (normalized) npcNameSet.add(normalized);
      });
    } catch (error) {
      console.warn('[Navigation] Unable to read recent NPCs:', error);
    }

    if (Array.isArray(npcPositions)) {
      npcPositions.forEach(npc => {
        if (npc?.npcName) {
          const normalized = normalizeText(npc.npcName);
          if (normalized) npcNameSet.add(normalized);
        }
      });
    }

    if (Array.isArray(currentEntities)) {
      currentEntities.forEach(entity => {
        const normalized = normalizeText(entity?.name);
        if (normalized) npcNameSet.add(normalized);
      });
    }

    for (const npcName of npcNameSet) {
      if (!npcName) continue;
      if (normalizedQuery === npcName) return true;
      if (npcName.length >= 3 && normalizedQuery.includes(npcName)) return true;
      if (normalizedQuery.length >= 3 && npcName.includes(normalizedQuery)) return true;
    }

    return false;
  };

  const clearTravelTimeouts = useCallback(() => {
    if (travelTimeoutsRef.current.length) {
      travelTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      travelTimeoutsRef.current = [];
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTravelTimeouts();
    };
  }, [clearTravelTimeouts]);

  const calculateBearing = useCallback((from, to) => {
    if (!from || !to) return 180;
    const [x1, y1] = from;
    const [x2, y2] = to;
    const dx = x2 - x1;
    const dy = y2 - y1;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 90) % 360;
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  const animateTravelPath = useCallback(
    (path, duration, onArrive) => {
      if (!path || path.length === 0) {
        try {
          onArrive?.();
        } catch (error) {
          console.error('[Navigation] Error in arrival callback:', error);
        }
        return;
      }

      clearTravelTimeouts();

      const segments = Math.max(path.length - 1, 1);
      const stepDuration = Math.max(350, Math.floor(duration / segments));
      const finalPoint = path[path.length - 1];

      // FIX BUG #3: Safety timeout - force completion if animation hangs
      const safetyTimeoutId = setTimeout(() => {
        console.warn('[Navigation] Animation safety timeout triggered - forcing completion');
        clearTravelTimeouts();

        // Force player to final position
        setPlayerPosition({ x: finalPoint[0], y: finalPoint[1] });

        // Call arrival callback with error handling
        try {
          onArrive?.();
        } catch (error) {
          console.error('[Navigation] Error in safety timeout arrival callback:', error);
          // Ensure loading state clears even on error
          if (typeof setIsLoading === 'function') {
            setIsLoading(false);
          }
        }
      }, duration + 5000); // Animation time + 5 second buffer

      travelTimeoutsRef.current.push(safetyTimeoutId);

      path.forEach((point, index) => {
        const timeoutId = setTimeout(() => {
          setPlayerPosition({ x: point[0], y: point[1] });

          const nextPoint = index < path.length - 1 ? path[index + 1] : null;
          const previousPoint = index > 0 ? path[index - 1] : null;
          const fromPoint = nextPoint ? point : previousPoint;
          const toPoint = nextPoint || point;

          if (fromPoint && toPoint && (fromPoint[0] !== toPoint[0] || fromPoint[1] !== toPoint[1])) {
            const direction = calculateBearing(fromPoint, toPoint);
            setPlayerFacing(direction);
          }

          if (index === path.length - 1) {
            // Clear safety timeout on successful completion
            clearTimeout(safetyTimeoutId);

            // Call arrival callback with error handling
            try {
              onArrive?.();
            } catch (error) {
              console.error('[Navigation] Error in arrival callback:', error);
              // Ensure loading state clears even on error
              if (typeof setIsLoading === 'function') {
                setIsLoading(false);
              }
            }
          }
        }, index * stepDuration);

        travelTimeoutsRef.current.push(timeoutId);
      });
    },
    [calculateBearing, clearTravelTimeouts, setPlayerFacing, setPlayerPosition, setIsLoading]
  );

  const computePolygonCentroid = useCallback((polygon = []) => {
    if (!Array.isArray(polygon) || polygon.length === 0) {
      return { x: 900, y: 670 };
    }
    const { length } = polygon;
    const sums = polygon.reduce(
      (acc, point) => {
        const [px, py] = point;
        return { x: acc.x + (px || 0), y: acc.y + (py || 0) };
      },
      { x: 0, y: 0 }
    );
    return {
      x: sums.x / length,
      y: sums.y / length
    };
  }, []);

  const getExteriorExitForInterior = useCallback(() => {
    if (!currentMapId || !currentMapId.includes('interior')) return null;
    const scenario = scenarioLoader.getScenario(gameState.scenarioId || '1680-mexico-city');
    const exteriorMaps = scenario?.maps?.exterior;
    if (!exteriorMaps) return null;

    for (const [mapKey, mapData] of Object.entries(exteriorMaps)) {
      if (!mapData?.buildings) continue;
      const building = mapData.buildings.find(b => b.hasInterior === currentMapId);
      if (!building) continue;
      const entrancePoint = building.entrancePoint
        ? { x: building.entrancePoint.x, y: building.entrancePoint.y }
        : computePolygonCentroid(building.polygon);
      return {
        mapId: mapData.id || mapKey,
        position: entrancePoint,
        buildingName: building.name || 'Exterior street'
      };
    }
    return null;
  }, [computePolygonCentroid, currentMapId, gameState.scenarioId]);

  const autoExitInteriorIfNeeded = useCallback(() => {
    const exitInfo = getExteriorExitForInterior();
    if (!exitInfo) return null;

    console.log('[LocationNav] Auto-exiting interior map:', currentMapId, '→', exitInfo.mapId);
    setPlayerPosition(exitInfo.position);
    setPlayerFacing(180);
    setCurrentMapId(exitInfo.mapId);
    const exteriorName = getLocationName(exitInfo.position.x, exitInfo.position.y);
    if (exteriorName) {
      updateLocation(exteriorName);
    }
    return exitInfo;
  }, [currentMapId, getExteriorExitForInterior, setPlayerFacing, setPlayerPosition, setCurrentMapId, updateLocation]);

  /**
   * Handle arrow key movement
   * Pre-validates movement against map bounds and obstacles
   * Uses pre-written narratives for interior movement when available
   */
  const handleMovement = useCallback(async (direction) => {
    // CRITICAL: Load map data fresh to avoid stale closure values
    // This prevents race conditions when exiting building then immediately moving
    const scenario = scenarioLoader.getScenario(gameState.scenarioId || '1680-mexico-city');
    const freshMapData = scenario?.maps?.interior?.[currentMapId] || scenario?.maps?.exterior?.[currentMapId];

    if (!freshMapData) {
      console.error('[Movement] No map data found for:', currentMapId);
      return;
    }

    if (freshMapData.type === 'world') {
      console.log('[Movement] World map active - arrow movement disabled');
      return;
    }

    console.log('[Movement] Using fresh map data:', {
      mapId: currentMapId,
      mapType: freshMapData.type,
      bounds: freshMapData.bounds
    });

    // Map direction to movement delta and text
    // Use larger steps for interior maps (110px) vs exterior (50px) for better coverage
    const isInterior = freshMapData?.type === 'interior';
    const MOVEMENT_STEP = isInterior ? 110 : 50;

    const movements = {
      north: { dx: 0, dy: -MOVEMENT_STEP, text: 'I walk north' },
      south: { dx: 0, dy: MOVEMENT_STEP, text: 'I walk south' },
      west: { dx: -MOVEMENT_STEP, dy: 0, text: 'I walk west' },
      east: { dx: MOVEMENT_STEP, dy: 0, text: 'I walk east' }
    };

    const movement = movements[direction];
    if (!movement) return;

    // EXIT ZONE DETECTION: Check if player is trying to exit through main entrance
    // This must happen BEFORE grid validation (which would block the move)
    if (isInterior && currentMapId === 'botica-interior' && direction === 'south') {
      const mainEntranceDoor = { x: 400, y: 700, width: 60 };
      const exitZoneRadius = 120; // Detection radius in pixels

      const distanceToExit = Math.sqrt(
        Math.pow(playerPosition.x - mainEntranceDoor.x, 2) +
        Math.pow(playerPosition.y - mainEntranceDoor.y, 2)
      );

      if (distanceToExit <= exitZoneRadius) {
        console.log('[Exit] Player near main entrance, moving south - showing exit confirmation');

        // Get specific location name from reverse geocoder
        const exitPosition = { x: 1350, y: 930, gridX: 67, gridY: 46 };
        const exitLocationName = getLocationName(exitPosition.x, exitPosition.y);

        console.log('[Exit] Reverse geocoder result:', exitLocationName);

        const exitData = {
          location: exitLocationName, // Use reverse geocoder instead of hardcoded "Mexico City"
          mapId: 'mexico-city-center',
          position: exitPosition,
          exitMessage: `You step outside onto ${exitLocationName}.`,
          locationName: "Botica de la Amargura",
          gameTime: gameState.time
        };

        // Store exit data for later execution
        setPendingExitData(exitData);

        // Show confirmation card
        setShowExitConfirmation(true);

        // Embed exit card in conversation history so it stays in timeline position
        setConversationHistory(prev => [...prev, {
          role: 'assistant',
          content: `You approach the entrance to the shop.`,
          card: {
            type: 'exit_confirmation',
            data: exitData
          }
        }]);

        // Don't continue with movement or LLM processing
        return;
      }
    }

    // PRE-VALIDATE MOVEMENT: Check if move is blocked before calling LLM
    let newPosition;
    if (freshMapData && currentMapId) {
      const { getGridSystem } = await import('../../features/map/services/gridMovementSystem');
      const gridSystem = getGridSystem(currentMapId, freshMapData);
      const validation = gridSystem.validateMove(playerPosition, direction, MOVEMENT_STEP);

      if (!validation.valid) {
        // Movement blocked - show system message instead of calling LLM
        console.log('[Movement] Blocked by:', validation.reason);

        if (
          validation.reason === 'the map boundary' &&
          typeof openLongDistanceTravelCard === 'function' &&
          freshMapData.type === 'exterior'
        ) {
          openLongDistanceTravelCard('map-boundary');
        }

        const blockedMessage = `*That way is not accessible.*`;

        // Update UI with system message
        setHistoryOutput(blockedMessage);
        addToHistory({ role: 'system', content: blockedMessage });

        // Don't update position, don't call LLM
        return;
      }

      // Use the grid-aligned validated position (prevents wall phasing)
      newPosition = validation.newPosition;
      console.log('[Movement] Position update:', {
        old: { x: playerPosition.x, y: playerPosition.y, gridX: playerPosition.gridX, gridY: playerPosition.gridY },
        new: newPosition,
        direction,
        distance: MOVEMENT_STEP
      });
    } else {
      // Fallback: manual calculation if no map data available
      newPosition = {
        ...playerPosition,
        x: playerPosition.x + movement.dx,
        y: playerPosition.y + movement.dy
      };
      console.log('[Movement] No map data, using fallback position:', newPosition);
    }

    // Calculate new facing direction
    const directionToDegrees = {
      north: 0,
      east: 90,
      south: 180,
      west: 270
    };
    const newFacing = directionToDegrees[direction] !== undefined ? directionToDegrees[direction] : playerFacing;

    // Update player position and facing immediately for visual feedback
    setPlayerPosition(newPosition);
    setPlayerFacing(newFacing);

    // PRE-WRITTEN NARRATIVE CHECK: For interior maps, check if we have a pre-written narrative
    // This eliminates expensive LLM calls for simple position changes
    if (isInterior && currentMapId === 'botica-interior') {
      const { getInteriorNarrative, hasPreWrittenNarrative } = await import('../../features/map/services/interiorNarratives');

      if (hasPreWrittenNarrative(currentMapId, newPosition.x, newPosition.y)) {
        console.log('[Movement] Using pre-written interior narrative for position:', newPosition);

        const narrative = getInteriorNarrative(newPosition.x, newPosition.y, gameState.time);

        // Add narrative to conversation history with movement flag
        const newEntry = {
          role: 'assistant',
          content: narrative.description,
          timestamp: new Date().toISOString(),
          responseType: 'movement',
          isMovement: true,
          position: newPosition
        };

        setConversationHistory(prev => [...prev, newEntry]);
        setHistoryOutput(narrative.description);

        // No time passage, no energy cost for simple repositioning within same room
        // (Player is just shifting position on the shop floor, not traveling)

        console.log('[Movement] Pre-written narrative applied - no LLM call needed');
        return; // Exit early - skip LLM call
      }
    }

    // Calculate new time (add 5 minutes for movement)
    const addMinutesToTime = (timeStr, dateStr, minutes) => {
      try {
        const dateTime = new Date(`${dateStr} ${timeStr}`);
        dateTime.setMinutes(dateTime.getMinutes() + minutes);

        const newTime = dateTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        const newDate = dateTime.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });

        return { time: newTime, date: newDate };
      } catch (error) {
        console.error('[Movement] Time calculation error:', error);
        return { time: timeStr, date: dateStr };
      }
    };

    const { time: newTime, date: newDate } = addMinutesToTime(
      gameState.time,
      gameState.date,
      5
    );

    // Set loading state
    setIsLoading(true);

    // NOTE: Don't add to userActions or setUserInput - keep movement command hidden from player
    // It's only in conversation history for LLM context

    // Call orchestrateTurn directly with movement text (bypasses state timing issues)
    try {
      const result = await orchestrateTurn({
        scenarioId: gameState.scenarioId || '1680-mexico-city',
        playerAction: movement.text, // Pass movement text directly
        conversationHistory,
        gameState: {
          ...gameState,
          position: newPosition, // Use new position
          currentMap: currentMapId,
          time: newTime, // Use incremented time
          date: newDate,
          activeEffects: activeEffects // Include body effects for narrative context
        },
        turnNumber,
        recentNPCs: npcTracker.getRecentNPCs(),
        reputation: reputation,
        wealth: currentWealth,
        mapData: freshMapData, // Use fresh map data, not stale state
        playerPosition: newPosition, // CRITICAL: Pass new position, not old state
        playerFacing: newFacing, // CRITICAL: Pass new facing, not old state
        currentMapId: currentMapId, // CRITICAL: Pass as top-level param for map context
        npcPositions,
        playerSkills,
        journal,
        shopSignHung: gameState.shopSign?.hung || false,
        isContinuation: false, // IMPORTANT: Movement breaks conversation continuation
        continuationNPC: null, // No NPC continuity for movement
      });

      // Check if result is valid
      // Note: result.narrative is a STRING, not an object
      if (!result || !result.narrative || typeof result.narrative !== 'string') {
        console.error('[Movement] Invalid result structure:', result);
        throw new Error('Invalid response from narrative agent');
      }

      // Process result same as handleSubmit (abbreviated for movement)
      const primaryPortraitFile = result.primaryPortrait || null;

      if (primaryPortraitFile) {
        console.log('[Portrait Phase 2] Movement: Setting portrait:', primaryPortraitFile);
        setPrimaryPortraitFile(primaryPortraitFile);
      } else {
        console.log('[Portrait Phase 2] Movement: No portrait (solo exploration)');
        setPrimaryPortraitFile(null); // Clear portrait when walking alone
      }

      // Update conversation history
      // Mark movement commands as hidden so they don't display in narrative panel
      addToHistory(
        { role: 'user', content: movement.text, isMovement: true, hidden: true },
        {
          role: 'assistant',
          content: result.narrative,
          responseType: result.responseType || 'movement',
          primaryPortrait: result.primaryPortrait || null
        }
      );

      // Update narrative output
      setHistoryOutput(result.narrative);

      // Parse narrative for dynamic action chips
      if (result.narrative && setDynamicChips) {
        const parsedChips = parseNarrativeChoices(result.narrative);
        if (parsedChips) {
          console.log('[Dynamic Chips] Parsed choices from dialogue:', parsedChips.map(c => c.label).join(', '));
          setDynamicChips(parsedChips);
        } else {
          console.log('[Dynamic Chips] No choice pattern detected in dialogue, using defaults');
          setDynamicChips(null);
        }
      }

      // Handle game state updates
      if (result.gameState) {
        // Handle inventory changes properly (don't call updateInventory with null)
        if (result.inventoryChanges && result.inventoryChanges.length > 0) {
          for (const change of result.inventoryChanges) {
            updateInventory(change.item, change.quantity);
          }
        }

        // CRITICAL: NEVER update location during arrow key movement
        // Arrow keys should ONLY move within the current map, never trigger map switches
        // Location changes should ONLY happen via:
        // - Explicit "exit"/"leave" commands (handled separately above)
        // - Natural language like "go outside" (handled separately above)
        // - Clicking exit button on map
        // The StateAgent shouldn't be touching location during simple arrow key movement
        console.log('[Movement] Ignoring any location updates from StateAgent during arrow key movement');

        // DON'T overwrite position during movement - we already set it manually above
        // The LLM doesn't track pixel coordinates, so its position data would be stale
      }

      // Update time/date - ALWAYS add 5 minutes for movement (even if no gameState returned)
      // This happens regardless of LLM output
      advanceTime({
        time: newTime,
        date: newDate,
        location: gameState.location
      });

      // Increment turn
      setTurnNumber(prevTurn => prevTurn + 1);

      // Don't clear input (we never set it for movement)
    } catch (error) {
      console.error('[Movement] Error:', error);
      console.error('[Movement] Error details:', error.message);
      console.error('[Movement] Error stack:', error.stack);

      // Show error to player
      const errorMessage = `*Movement failed: ${error.message || 'Unknown error'}*`;
      setHistoryOutput(errorMessage);

      // Add error to conversation history
      addToHistory({ role: 'system', content: errorMessage });

      // Revert position on error
      setPlayerPosition(playerPosition);
    } finally {
      setIsLoading(false);
    }
  }, [
    setPlayerPosition,
    setCurrentMapId,
    setIsLoading,
    setUserInput,
    setUserActions,
    orchestrateTurn,
    gameState,
    conversationHistory,
    turnNumber,
    npcTracker,
    reputation,
    currentWealth,
    currentMapData,
    playerPosition,
    currentMapId,
    npcPositions,
    playerSkills,
    journal,
    setPrimaryPortraitFile,
    addToHistory,
    setHistoryOutput,
    updateInventory,
    updateLocation,
    setTurnNumber,
    playerFacing,
    setPlayerFacing,
    setPendingExitData,
    setShowExitConfirmation,
    setConversationHistory,
    setDynamicChips,
    advanceTime,
    openLongDistanceTravelCard
  ]);

  /**
   * Handle entering a building from exterior map
   * Transitions player to interior map with appropriate spawn position
   */
  const handleEnterBuilding = useCallback((buildingData) => {
    console.log('[Enter Button] Player entering building:', buildingData);

    if (!buildingData || !buildingData.hasInterior) {
      console.warn('[Enter Button] Building has no interior:', buildingData);
      return;
    }

    // FIX #7: Clear pending house call if navigating away
    if (setPendingHouseCall) {
      setPendingHouseCall(null);
      console.log('[Enter Building] Cleared pending house call');
    }

    // Temporarily disable input during transition
    setIsLoading(true);

    // Load the scenario to access maps
    const scenario = scenarioLoader.getScenario(scenarioId);
    if (!scenario || !scenario.maps) {
      console.error('[Enter Button] Cannot load scenario maps');
      setIsLoading(false);
      return;
    }

    // Get the interior map data
    const interiorMapId = buildingData.hasInterior;
    const interiorMap = scenario.maps.interior[interiorMapId];

    if (!interiorMap) {
      console.error('[Enter Button] Interior map not found:', interiorMapId);
      setIsLoading(false);
      return;
    }

    // Store building data for exit handling
    currentBuildingRef.current = buildingData;

    // Get spawn position from interior map (or use default)
    const spawnPosition = interiorMap.startPosition || [400, 400];
    const [spawnX, spawnY] = spawnPosition;

    // Update all states for interior map
    const buildingName = buildingData.fullName || buildingData.name;
    updateLocation(`${buildingName}, Mexico City`);
    setCurrentMapId(interiorMapId);

    // CRITICAL: Include grid coordinates to prevent NaN errors during movement
    const gridSize = 20; // Standard grid size
    const finalPosition = {
      x: spawnX,
      y: spawnY,
      gridX: Math.floor(spawnX / gridSize),
      gridY: Math.floor(spawnY / gridSize)
    };

    console.log('[Enter Building] 🎯 FINAL POSITION BEING SET:', finalPosition);
    setPlayerPosition(finalPosition);

    // Generate dynamic enter message based on building type
    let enterMessage = `You step inside the ${buildingName}.`;
    if (buildingData.type === 'church') {
      enterMessage = `You enter the ${buildingName}. The vast sacred space echoes with whispered prayers, and the scent of incense fills the air.`;
    } else if (buildingData.type === 'government') {
      enterMessage = `You step into the ${buildingName}. The grand halls speak of colonial power and authority.`;
    } else if (buildingData.type === 'market') {
      enterMessage = `You enter the ${buildingName}. The bustling market is alive with vendors calling out their wares and the mingled scents of food, spices, and goods.`;
    } else if (buildingData.type === 'residence') {
      enterMessage = `You step into the ${buildingName}. The ${buildingData.subtype === 'humble' ? 'cramped space' : 'modest rooms'} speak of daily life in colonial Mexico City.`;
    }

    setHistoryOutput(enterMessage);
    setConversationHistory(prev => [
      ...prev,
      { role: 'system', content: `*[LOCATION CHANGE] Maria enters ${buildingName}. Interior: ${interiorMapId}*` },
      { role: 'assistant', content: enterMessage }
    ]);

    // Add to user actions for context
    setUserActions(prev => [...prev, `enter ${buildingData.name.toLowerCase()}`]);

    // Small delay to ensure all states sync, then re-enable input
    setTimeout(() => {
      setIsLoading(false);
      console.log('[Enter Button] Transition complete');
    }, 100);
  }, [
    scenarioId,
    updateLocation,
    setCurrentMapId,
    setPlayerPosition,
    setHistoryOutput,
    setConversationHistory,
    setUserActions,
    setIsLoading
  ]);

  /**
   * Handle exiting a building to exterior map
   * Triggered by "Exit" button on interior map
   * NOW: Shows exit confirmation card instead of executing immediately
   */
  const handleExitBuilding = useCallback(() => {
    console.log('[Exit Button] Showing exit confirmation');

    // FIX #7: Clear pending house call if navigating away
    if (setPendingHouseCall) {
      setPendingHouseCall(null);
      console.log('[Exit Building] Cleared pending house call');
    }

    // Get building data from ref (stored when entering)
    const building = currentBuildingRef.current;

    // Determine exit position (use building's entrancePoint or default)
    // CRITICAL: Include grid coordinates to prevent NaN errors during movement
    const gridSize = 20; // Standard grid size
    let exitPosition = {
      x: 1350,
      y: 930,
      gridX: Math.floor(1350 / gridSize),
      gridY: Math.floor(930 / gridSize)
    }; // Default to botica position

    if (building && building.entrancePoint) {
      const ep = building.entrancePoint;
      exitPosition = {
        x: ep.x,
        y: ep.y,
        gridX: ep.gridX !== undefined ? ep.gridX : Math.floor(ep.x / gridSize),
        gridY: ep.gridY !== undefined ? ep.gridY : Math.floor(ep.y / gridSize)
      };
    }

    // Create exit data
    const buildingName = building ? (building.name || 'the building') : 'the building';

    // Get specific location name from reverse geocoder
    const exitLocationName = getLocationName(exitPosition.x, exitPosition.y);

    console.log('[Exit] Building click - Reverse geocoder result:', exitLocationName);

    const exitData = {
      location: exitLocationName, // Use reverse geocoder instead of hardcoded "Mexico City"
      mapId: 'mexico-city-center',
      position: exitPosition,
      exitMessage: `You step outside onto ${exitLocationName}.`,
      locationName: buildingName,
      gameTime: gameState.time
    };

    // Store exit data for later execution
    setPendingExitData(exitData);

    // Show confirmation card
    setShowExitConfirmation(true);

    // Embed exit card in conversation history so it stays in timeline position
    setConversationHistory(prev => [...prev, {
      role: 'assistant',
      content: `You approach the exit.`,
      card: {
        type: 'exit_confirmation',
        data: exitData
      }
    }]);
  }, [
    setPendingExitData,
    setShowExitConfirmation,
    setConversationHistory,
    gameState.time,
    setPendingHouseCall
  ]);

  /**
   * Handle fast travel command (#fast_travel Location Name)
   * Quick travel to key locations with zoom effects
   */
  const handleFastTravel = useCallback((locationName) => {
    console.log('[HandleFastTravel] Fast travel to:', locationName);

    // FIX #7: Clear pending house call if navigating away
    if (setPendingHouseCall) {
      setPendingHouseCall(null);
      console.log('[Fast Travel] Cleared pending house call');
    }

    // Map location names to map IDs
    const locationMap = {
      'Botica de la Amargura': 'botica-interior',
      'Metropolitan Cathedral': 'cathedral-interior',
      'La Merced Market': 'mercado-interior',
      'El Consulado de Mercaderes': 'consulado-interior'
    };

    // Map location names to building IDs for zoom
    const locationZoomMap = {
      'Botica de la Amargura': 'botica',
      'Metropolitan Cathedral': 'cathedral',
      'La Merced Market': 'lamerced',
      'El Consulado de Mercaderes': 'consulado',
      // Other locations don't have visible buildings on horizon yet
    };

    const mapId = locationMap[locationName];
    console.log('[HandleFastTravel] Location mapping:', { locationName, mapId, availableLocations: Object.keys(locationMap) });

    if (!mapId) {
      console.error('[HandleFastTravel] Location not found in map:', locationName);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    // Complete travel logic (updates state, NPCs, journal, etc.)
    const completeTravel = () => {
      console.log('[HandleFastTravel] Completing travel to:', locationName);

      // Generate location NPCs
      const locationNPCs = getLocationNPCs(mapId, gameState.time, gameState.date);
      console.log(`[HandleFastTravel] Generated ${locationNPCs.length} NPCs for ${locationName}`);

      // Update location and store location NPCs
      setGameState(prev => ({
        ...prev,
        location: locationName,
        currentLocationNPCs: locationNPCs
      }));

      // Set the map
      setCurrentMapId(mapId);

      // 🚨 FIX: Set player position based on interior map's startPosition
      const scenario = scenarioLoader.getScenario(scenarioId);
      if (scenario?.maps?.interior?.[mapId]) {
        const interiorMap = scenario.maps.interior[mapId];
        const spawnPosition = interiorMap.startPosition || [400, 400];
        const [spawnX, spawnY] = spawnPosition;
        const gridSize = 20;

        const newPosition = {
          x: spawnX,
          y: spawnY,
          gridX: Math.floor(spawnX / gridSize),
          gridY: Math.floor(spawnY / gridSize)
        };

        console.log('[HandleFastTravel] 🎯 Setting player position:', {
          location: locationName,
          mapId,
          startPosition: interiorMap.startPosition,
          finalPosition: newPosition
        });

        setPlayerPosition(newPosition);
      } else {
        console.warn('[HandleFastTravel] No interior map found for:', mapId);
      }

      // Deduct travel energy (5 energy for local destinations)
      setEnergy(prevEnergy => Math.max(0, prevEnergy - 5));

      // Advance time by 20 minutes
      advanceTime({ time: gameState.time, date: gameState.date }, 20);

      // Add journal entry
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: `Traveled to ${locationName}.`
      });

      // Add narrative message
      const travelNarrative = `You make your way through the streets of Mexico City to ${locationName}.`;
      setConversationHistory(prev => [
        ...prev,
        { role: 'assistant', content: travelNarrative }
      ]);

      setUserInput('');
      setIsLoading(false);

      // AUTO-GENERATE "People present" list after arrival
      // This gives player immediate context about who's at the destination
      if (handleListRequestRef && handleListRequestRef.current) {
        const peopleListType = getListTypeById('people');
        if (peopleListType) {
          console.log('[HandleFastTravel] Auto-generating people list at destination:', locationName);
          // Small delay ensures travel narrative renders first, then list appears
          setTimeout(() => {
            handleListRequestRef.current(peopleListType, true); // isAutoGenerated = true (hides "List all people present" user message)
          }, 100);
        }
      }
    };

    // Determine zoom logic
    const currentLocationBuildingId = locationZoomMap[gameState.location];
    const arrivalBuildingId = locationZoomMap[locationName];
    const isCurrentlyZoomed = currentLocationBuildingId && setTravelZoomState && setBackgroundMode;
    const shouldZoomToArrival = arrivalBuildingId && setTravelZoomState && setBackgroundMode;

    console.log('[HandleFastTravel] Zoom logic:', {
      currentLocation: gameState.location,
      destination: locationName,
      currentLocationBuildingId,
      arrivalBuildingId,
      isCurrentlyZoomed,
      shouldZoomToArrival
    });

    const ZOOM_DURATION = 2500; // Slower, smoother zoom (was 1500ms)

    // Case 1: Currently zoomed in, need to zoom out first
    if (isCurrentlyZoomed) {
      const currentTarget = getZoomTargetForBuilding(currentLocationBuildingId);
      console.log('[HandleFastTravel] Zooming OUT from current location:', currentLocationBuildingId);

      setBackgroundMode('travel');

      // Zoom OUT from current location
      animateBackgroundZoomOut(setTravelZoomState, 100, currentTarget, ZOOM_DURATION, () => {
        console.log('[HandleFastTravel] Zoom out complete');

        // Case 1a: Destination also has zoom - zoom IN to it
        if (shouldZoomToArrival) {
          const arrivalTarget = getZoomTargetForBuilding(arrivalBuildingId);
          console.log('[HandleFastTravel] Zooming IN to arrival:', arrivalBuildingId);

          // Zoom IN to destination
          animateBackgroundZoom(setTravelZoomState, arrivalTarget, ZOOM_DURATION, () => {
            console.log('[HandleFastTravel] Arrival zoom complete, maintaining zoom');
            completeTravel();
            // KEEP zoom active at destination
            maintainZoom(setTravelZoomState, arrivalTarget);
            setBackgroundMode('normal');
          });
        } else {
          // Case 1b: No arrival zoom, just complete at normal view
          console.log('[HandleFastTravel] No arrival zoom, completing travel');
          completeTravel();
          setBackgroundMode('normal');
        }
      });
    }
    // Case 2: Not currently zoomed, but destination has zoom
    else if (shouldZoomToArrival) {
      const arrivalTarget = getZoomTargetForBuilding(arrivalBuildingId);
      console.log('[HandleFastTravel] Zooming IN to arrival (no departure zoom):', arrivalBuildingId);

      setBackgroundMode('travel');

      // Zoom IN to destination
      animateBackgroundZoom(setTravelZoomState, arrivalTarget, ZOOM_DURATION, () => {
        console.log('[HandleFastTravel] Arrival zoom complete, maintaining zoom');
        completeTravel();
        // KEEP zoom active at destination
        maintainZoom(setTravelZoomState, arrivalTarget);
        setBackgroundMode('normal');
      });
    }
    // Case 3: No zoom effects - clear any existing zoom
    else {
      console.log('[HandleFastTravel] No zoom effects, instant travel');

      // If currently zoomed, zoom out first
      if (isCurrentlyZoomed) {
        const currentTarget = getZoomTargetForBuilding(currentLocationBuildingId);
        console.log('[HandleFastTravel] Clearing zoom before instant travel');

        setBackgroundMode('travel');
        animateBackgroundZoomOut(setTravelZoomState, 100, currentTarget, ZOOM_DURATION, () => {
          completeTravel();
          setBackgroundMode('normal');
        });
      } else {
        // Not zoomed, just travel
        completeTravel();
      }
    }
  }, [
    setGameState,
    setCurrentMapId,
    setPlayerPosition,
    setEnergy,
    advanceTime,
    addJournalEntry,
    setConversationHistory,
    setUserInput,
    setIsLoading,
    setTravelZoomState,
    setBackgroundMode,
    setPendingHouseCall,
    scenarioId,
    gameState.location,
    gameState.time,
    gameState.date,
    turnNumber,
    handleListRequestRef
  ]);

  /**
   * Handle natural language navigation to interior rooms
   * Returns true if navigation was handled, false otherwise
   */
  const handleNaturalLanguageNavigation = useCallback((narrativeText) => {
    const isInsideBotica = gameState.location?.includes('Botica de la Amargura');

    // Only apply to interior navigation
    if (!isInsideBotica) return false;

    const navigationPatterns = [
      { phrases: ['go to laboratory', 'walk to laboratory', 'head to laboratory', 'enter laboratory'], position: { x: 700, y: 250, gridX: 35, gridY: 12 }, room: 'Laboratory' },
      { phrases: ['go to bedroom', 'walk to bedroom', 'head to bedroom', 'enter bedroom'], position: { x: 300, y: 250, gridX: 15, gridY: 12 }, room: 'Bedroom' },
      { phrases: ['go to shop floor', 'walk to shop', 'go to counter', 'walk to counter'], position: { x: 510, y: 480, gridX: 25, gridY: 24 }, room: 'Shop Floor' },
      { phrases: ['go to door', 'walk to door', 'go to entrance', 'walk to entrance'], position: { x: 400, y: 670, gridX: 20, gridY: 33 }, room: 'Shop Floor' },
      { phrases: ['go to workbench', 'walk to workbench'], position: { x: 640, y: 210, gridX: 32, gridY: 10 }, room: 'Laboratory' },
      { phrases: ['go to bed', 'walk to bed'], position: { x: 350, y: 200, gridX: 17, gridY: 10 }, room: 'Bedroom' },
      { phrases: ['go to bookshelf', 'walk to bookshelf'], position: { x: 140, y: 260, gridX: 7, gridY: 13 }, room: 'Bedroom' }
    ];

    const matchedNavigation = navigationPatterns.find(pattern =>
      pattern.phrases.some(phrase => narrativeText.includes(phrase))
    );

    if (matchedNavigation) {
      console.log(`[Navigation] Moving to ${matchedNavigation.room}`);

      // Update player position
      setPlayerPosition(matchedNavigation.position);

      // Update facing direction based on movement direction
      const dx = matchedNavigation.position.x - playerPosition.x;
      const dy = matchedNavigation.position.y - playerPosition.y;

      // Determine primary direction (larger delta wins)
      if (Math.abs(dx) > Math.abs(dy)) {
        setPlayerFacing(dx > 0 ? 90 : 270); // East or West
      } else if (Math.abs(dy) > 0) {
        setPlayerFacing(dy > 0 ? 180 : 0); // South or North
      }
      // If no movement (already at target), don't change facing

      // Show simple system message
      const navMessage = `You walk to the ${matchedNavigation.room.toLowerCase()}.`;
      setHistoryOutput(navMessage);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: navMessage }]);

      return true; // Navigation handled
    }

    return false; // No navigation match
  }, [
    gameState.location,
    playerPosition,
    setPlayerPosition,
    setPlayerFacing,
    setHistoryOutput,
    setConversationHistory
  ]);

  /**
   * Handle location-based navigation commands (e.g., "go to plaza mayor")
   * Returns true if navigation was handled, false otherwise
   *
   * @param {string} input - User's input text
   * @returns {Promise<boolean>} True if navigation was handled
   */
  const handleLocationBasedNavigation = useCallback(async (input) => {
    // 1. Detect location command
    const locationCommand = detectLocationCommand(input, currentMapId);

    if (!locationCommand) {
      return false; // Not a location command
    }

    console.log('[LocationNav] Location command detected:', locationCommand.targetLocation);

    if (isNPCReference(locationCommand.targetLocation)) {
      console.log('[LocationNav] Command appears to reference an NPC, not a location. Falling back to standard processing.');
      return false;
    }

    // 2. Match location string to destination
    const destination = matchNavigationLocation(locationCommand.targetLocation);

    if (!destination) {
      // Location not recognized - provide helpful error with suggestions
      const suggestions = getSuggestedLocations(locationCommand.targetLocation);
      const errorMessage = `You don't recognize a place called "${locationCommand.targetLocation}". Did you mean: ${suggestions.join(', ')}?`;

      setHistoryOutput(errorMessage);
      setConversationHistory(prev => [...prev,
        { role: 'user', content: input },
        { role: 'assistant', content: errorMessage }
      ]);

      return true; // Command was handled (even though it failed)
    }

    console.log('[LocationNav] Matched destination:', destination.name, 'at', destination.coordinates);

    // 3. Check if already at destination
    let currentPos = playerPosition;

    if (currentMapId?.includes('interior')) {
      const exitInfo = autoExitInteriorIfNeeded();
      if (exitInfo) {
        currentPos = exitInfo.position;
      }
    }
    const destCoords = destination.coordinates;
    if (currentMapId === 'botica-interior') {
      const exteriorPosition = { x: 1350, y: 930 };
      console.log('[LocationNav] Auto-exiting botica interior before travel command');
      currentPos = exteriorPosition;
      activeMapId = 'mexico-city-center';
      setPlayerPosition(exteriorPosition);
      setPlayerFacing(180);
      setCurrentMapId('mexico-city-center');
      const exteriorLocationName = getLocationName(exteriorPosition.x, exteriorPosition.y);
      updateLocation(exteriorLocationName);
    }

    const distance = Math.sqrt(
      Math.pow(currentPos.x - destCoords.x, 2) +
      Math.pow(currentPos.y - destCoords.y, 2)
    );

    if (distance < 50) { // Within 50 pixels = already there
      const alreadyThereMessage = `You're already at ${destination.name}.`;
      setHistoryOutput(alreadyThereMessage);
      setConversationHistory(prev => [...prev,
        { role: 'user', content: input },
        { role: 'assistant', content: alreadyThereMessage }
      ]);
      return true;
    }

    // 4. Calculate street-based path
    const path = calculateStreetBasedPath(
      [currentPos.x, currentPos.y],
      [destCoords.x, destCoords.y]
    );

    if (!path || path.length === 0) {
      const noPathMessage = `You can't find a clear path to ${destination.name} from here.`;
      setHistoryOutput(noPathMessage);
      setConversationHistory(prev => [...prev,
        { role: 'user', content: input },
        { role: 'assistant', content: noPathMessage }
      ]);
      setIsLoading(false);
      return true;
    }

    console.log('[LocationNav] Calculated street-based path with', path.length, 'waypoints');

    // 5. Calculate travel time and energy cost
    const travelTime = calculateTravelTime(path); // 2-3 seconds
    const travelMinutes = Math.round(travelTime / 1000 * 6); // Convert animation seconds to game minutes (1 second = 6 minutes)
    const energyCost = Math.max(5, Math.round(travelMinutes / 6)); // 1 energy per ~6 minutes of travel

    console.log('[LocationNav] Travel animation:', travelTime, 'ms, Game time:', travelMinutes, 'minutes, Energy cost:', energyCost);

    // 6. Check if player has enough energy
    const currentEnergy = gameState.energy || 100;
    if (currentEnergy < energyCost) {
      const lowEnergyMessage = `You're too tired to walk to ${destination.name}. You need at least ${energyCost} energy, but you only have ${currentEnergy}.`;
      setHistoryOutput(lowEnergyMessage);
      setConversationHistory(prev => [...prev,
        { role: 'user', content: input },
        { role: 'assistant', content: lowEnergyMessage }
      ]);
      setIsLoading(false);
      return true;
    }

    // 7. Show "walking to..." message
    // FIX BUG #2: Show loading indicator while preparing animation
    setIsLoading(true);
    const walkingMessage = `You begin walking toward ${destination.name}...`;
    setHistoryOutput(walkingMessage);
    setConversationHistory(prev => [...prev,
      { role: 'user', content: input },
      { role: 'assistant', content: walkingMessage }
    ]);

    const finalizeTravel = () => {
      console.log('[LocationNav] Travel animation complete');
      clearTravelTimeouts();

      setPlayerPosition({ x: destCoords.x, y: destCoords.y });
      setEnergy(Math.max(0, currentEnergy - energyCost));
      advanceTime({ minutes: travelMinutes });

      const locationContext = getFullLocationContext(destCoords.x, destCoords.y);
      const archetype = getArrivalArchetypes(destination);
      const peopleSentence = `You notice ${archetype.people.join(', ')}.`;
      const choiceSentence = `**Will you ${archetype.choices[0]}, ${archetype.choices[1]}, or ${archetype.choices[2]}?**`;
      const destinationDescription = destination.description || 'a prominent landmark';
      const descLower = destinationDescription.toLowerCase();
      setGameState(prev => ({
        ...prev,
        location: locationContext.formatted || destination.name,
        position: { x: destCoords.x, y: destCoords.y }
      }));

      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: `Traveled to ${destination.name}.`
      });

      clearTravelTimeouts();
      if (setTravelAnimationState) {
        setTravelAnimationState(null);
      }

      setUserInput('');

      const arrivalPrompt = `You are narrating in SECOND PERSON (addressing Maria as "you") as she arrives in 1680 Mexico City.

Context:
- Destination: ${destination.name}
- Canonical description: ${destination.description}
- Reverse geocoder context: ${locationContext.formatted || 'Unknown street'}
- Time: ${gameState.time || 'Unknown time'} on ${gameState.date || 'Unknown date'}
- Travel distance: ${Math.round(distance)} pixels across the colonial grid

Output Requirements (exactly 4 sentences):
1. Sentence 1: Describe the approach through the surrounding streets/plaza with sensory detail, using "You ..." phrasing.
2. Sentence 2: Describe the facade or entrance of ${destination.name} with period-authentic imagery, still in second person.
3. Sentence 3: Explicitly mention 2-3 distinct people present (e.g., names, titles, occupations) so downstream systems can detect them. Example format: "You notice Don Alonso Herrán conferring with a scribe, Sister Beatriz handing out alms, and two Tlaxcalan porters unloading crates." Use unique names/roles relevant to the setting.
4. Sentence 4: Offer a choice question in second person with exactly three options that advance play, e.g., "Will you petition the regidores, speak with Don Alonso, or observe the porters?" Each option should be distinct verbs/actions.

Formatting:
- Use Markdown with two paragraphs separated by a blank line (\\n\\n).
- Paragraph 1 contains sentences 1-2. Paragraph 2 contains sentences 3-4.
- Bold each NPC name in sentence 3 using **Name** (e.g., **Don Alonso Herrán**).
- Make the entire sentence 4 bold (the question with choices).

Tone: grounded, observational, historically authentic.`;

      setIsLoading(true);

      createChatCompletion(
        [
          { role: 'system', content: arrivalPrompt },
          { role: 'user', content: `Narrate Maria's arrival at ${destination.name}.` }
        ],
        0.7,
        220
      ).then(response => {
        const narrative = response.choices?.[0]?.message?.content?.trim();
        const finalText = narrative && narrative.length > 0
          ? narrative
          : `You trace the arcaded edge of the plaza until ${destination.name} fills your view, the flagstones slick with spilled atole and the smell of charcoal lingering in the air.` +
            ` The façade, ${descLower}, looms ahead as bells mutter overhead and clerks dart through its shadowed portal.` +
            `\n\n${peopleSentence} ${choiceSentence}`;
        setHistoryOutput(finalText);
        setConversationHistory(prev => [...prev,
          { role: 'assistant', content: finalText }
        ]);
        const parsedChoices = parseNarrativeChoices(finalText);
        if (parsedChoices && setDynamicChips) {
          setDynamicChips(parsedChoices);
        }
      }).catch(error => {
        console.error('[LocationNav] Arrival narrative failed, using fallback:', error);
        const fallback = `You approach ${destination.name}, the morning crowd parting around your skirts while incense from a nearby shrine braids with the scent of roasting maize.` +
          ` The façade, ${descLower}, glows warm against the pale sky as heralds stride beneath its carved lintels.` +
          `\n\n${peopleSentence} ${choiceSentence}`;
        setHistoryOutput(fallback);
        setConversationHistory(prev => [...prev,
          { role: 'assistant', content: fallback }
        ]);
        const parsedChoices = parseNarrativeChoices(fallback);
        if (parsedChoices && setDynamicChips) {
          setDynamicChips(parsedChoices);
        }
      }).finally(() => {
        setIsLoading(false);
      });
    };

    // FIX BUG #1: Removed setTravelAnimationState to prevent animation conflict
    // Only use setTimeout-based animation from animateTravelPath
    // (TravelAnimationManager requestAnimationFrame system removed)

    // FIX BUG #2: Hide loading indicator when animation starts, then call finalize
    animateTravelPath(path, travelTime, () => {
      setIsLoading(false); // Hide spinner when animation completes
      finalizeTravel();    // Then generate arrival narrative
    });

    return true; // Navigation handled
  }, [
    currentMapId,
    playerPosition,
    gameState,
    setHistoryOutput,
    setConversationHistory,
    setPlayerPosition,
    setEnergy,
    advanceTime,
    setGameState,
    addJournalEntry,
    animateTravelPath,
    clearTravelTimeouts,
    setTravelAnimationState,
    setUserInput,
    setIsLoading,
    setPlayerFacing,
    setCurrentMapId,
    updateLocation,
    autoExitInteriorIfNeeded,
    turnNumber
  ]);

  /**
   * Handle house call arrival (Phase 3B/3C)
   * Transitions to house interior map, positions patient, and sets up examination
   * @param {Object} houseCallData - Complete house call data from Phase 3A
   */
  const handleHouseCallArrival = useCallback(async (houseCallData) => {
    console.log('[Phase 3B] House call arrival:', houseCallData);

    try {
      // FIX #5: Validate map exists before transitioning
      const scenario = scenarioLoader.getScenario(gameState.scenarioId || '1680-mexico-city');
      let finalHouseCallData = houseCallData;
      const { houseMapId } = houseCallData;
      const mapData = scenario?.maps?.interior?.[houseMapId];

      if (!mapData) {
        console.error('[Phase 3B] House map not found:', houseMapId);
        console.error('[Phase 3B] Falling back to middling house');

        // FIXED: Create new object instead of mutating parameter (React best practice)
        finalHouseCallData = {
          ...houseCallData,
          houseMapId: 'middling-house-interior',
          houseName: 'Middling House (default)'
        };

        // Validate fallback exists
        const fallbackMap = scenario?.maps?.interior?.['middling-house-interior'];
        if (!fallbackMap) {
          throw new Error('Neither house map nor fallback map exists');
        }
      }

      // Re-destructure from finalHouseCallData to get correct values
      const { patientEntity, houseMapId: finalHouseMapId, houseName, destination, travelTime } = finalHouseCallData;

      // 1. Transition to house interior map
      setCurrentMapId(finalHouseMapId);
      console.log('[Phase 3B] Transitioned to map:', finalHouseMapId);

      // 1.5. Update game location to match the map and narrative destination
      // This syncs the location pill with the actual location being visited
      updateLocation(`${destination} (Inside ${houseName})`);
      console.log('[Phase 3B] Updated location to:', `${destination} (Inside ${houseName})`);

      clearTravelTimeouts();
      if (setTravelAnimationState) {
        setTravelAnimationState(null);
      }

      // 2. PHASE 3C: Determine patient position based on condition severity
      const positionData = determinePatientPosition(patientEntity, finalHouseMapId);
      console.log('[Phase 3C] Patient positioning:', positionData);

      // 3. Set player position to entry point
      // For humble house: near door (250, 420)
      // For middling house: in sala near entrance (650, 560)
      // CRITICAL: Include grid coordinates to prevent NaN errors during movement
      const gridSize = 20; // Standard grid size
      if (finalHouseMapId === 'humble-house-interior') {
        setPlayerPosition({ x: 250, y: 420, gridX: Math.floor(250 / gridSize), gridY: Math.floor(420 / gridSize) });
      } else if (finalHouseMapId === 'middling-house-interior') {
        setPlayerPosition({ x: 650, y: 560, gridX: Math.floor(650 / gridSize), gridY: Math.floor(560 / gridSize) });
      } else {
        setPlayerPosition({ x: 250, y: 420, gridX: Math.floor(250 / gridSize), gridY: Math.floor(420 / gridSize) }); // Default
      }
      setPlayerFacing(0); // Facing into room (north)

      // 4. PHASE 3C: Position patient at determined furniture location
      setNPCPosition(
        patientEntity.id || patientEntity.name,
        patientEntity.name,
        positionData.position,
        'idle' // Patient is stationary, waiting
      );
      console.log('[Phase 3C] Positioned', patientEntity.name, 'at', positionData.furnitureName);

      // 5. Advance time by travel time
      advanceTime({ minutes: travelTime });
      console.log('[Phase 3B] Advanced time by', travelTime, 'minutes');

      // 6. Set active patient for examination
      setActivePatient(patientEntity);
      setPatientDialogue([]); // Clear previous dialogue
      console.log('[Phase 3B] Set active patient:', patientEntity.name);

      // 6.5. PORTRAIT FIX: Infer demographics BEFORE EntityManager enrichment
      console.log('[Portrait Phase 2] House call patient now present, inferring demographics for:', patientEntity.name);

      // CRITICAL FIX: Infer missing demographics from context BEFORE registration
      // This ensures EntityManager.inferGender() can see the occupation
      if (!patientEntity.social) patientEntity.social = {};
      if (!patientEntity.appearance) patientEntity.appearance = {};

      // Infer casta from name patterns and house type
      if (!patientEntity.social.casta || patientEntity.social.casta === 'unknown') {
        // Check for Spanish nobility markers
        if (patientEntity.name.match(/don |doña |de la |del /i) || houseCallData.destination?.match(/don |doña /i)) {
          patientEntity.social.casta = 'español';
          console.log('[Portrait Phase 2] Inferred casta as español from name/location');
        } else if (finalHouseMapId === 'elite-house-interior') {
          patientEntity.social.casta = 'criollo';
          console.log('[Portrait Phase 2] Inferred casta as criollo from elite house');
        } else if (finalHouseMapId === 'middling-house-interior') {
          patientEntity.social.casta = 'mestizo';
          console.log('[Portrait Phase 2] Inferred casta as mestizo from middling house');
        } else {
          patientEntity.social.casta = 'mestizo'; // Default
          console.log('[Portrait Phase 2] Defaulted casta to mestizo');
        }
      }

      // Infer occupation from age and context
      if (!patientEntity.social.occupation || patientEntity.social.occupation === 'unknown') {
        const age = patientEntity.appearance?.age || 'adult';
        const socialClass = patientEntity.social?.class || 'common';

        if (age === 'child' || age === 'young') {
          patientEntity.social.occupation = socialClass === 'elite' ? 'Noble youth' : 'Apprentice';
        } else if (socialClass === 'elite') {
          patientEntity.social.occupation = 'Gentleman';
        } else {
          patientEntity.social.occupation = 'Commoner';
        }
        console.log('[Portrait Phase 2] Inferred occupation as', patientEntity.social.occupation);
      }

      // NOW register with EntityManager (lazy enrichment will see the occupation)
      let enrichedPatient = entityManager.getById(patientEntity.id);
      if (!enrichedPatient) {
        console.log('[Portrait Phase 2] Patient not registered, registering with demographics:', patientEntity.name);
        entityManager.register(patientEntity);
        enrichedPatient = entityManager.getById(patientEntity.id);
      }

      // Fallback to raw entity if registration failed
      if (!enrichedPatient) {
        console.warn('[Portrait Phase 2] Entity registration failed, using raw entity');
        enrichedPatient = patientEntity;
      }

      // Resolve portrait using demographics (enrichment should have populated these)
      const patientPortrait = resolvePortrait(enrichedPatient);
      if (patientPortrait) {
        const portraitFilename = patientPortrait.replace('/portraits/', '');
        console.log('[Portrait Phase 2] Setting house call patient portrait:', portraitFilename);

        // Store portrait in patient entity for display in patient view
        enrichedPatient.image = portraitFilename;
        if (!enrichedPatient.visual) enrichedPatient.visual = {};
        enrichedPatient.visual.image = portraitFilename;
        console.log('[Portrait Phase 2] Stored portrait in patient entity:', portraitFilename);

        setPrimaryPortraitFile(portraitFilename);

        // Update active patient to include the portrait
        setActivePatient({ ...enrichedPatient });
      } else {
        console.warn('[Portrait Phase 2] Could not resolve portrait for house call patient:', patientEntity.name);
      }

      // 7. Generate arrival narrative with patient placement context
      let arrivalNarrative;

      try {
        // Build dynamic arrival narrative via LLM for historical flavor
        const ailmentDescription = patientEntity.metadata?.ailmentDescription || patientEntity.description || 'unknown ailment';
        // Support both nested and flat entity structures
        const patientAge = patientEntity.appearance?.age || patientEntity.age || 'adult';
        const patientGender = patientEntity.appearance?.gender || patientEntity.gender || 'person';
        const socialClass = patientEntity.social?.class || patientEntity.class || 'common';

        // Check if destination is a landmark/institutional building
        const isLandmark = houseCallData.isLandmark || false;
        const landmarkDescription = houseCallData.landmarkDescription || null;

        // Build location description based on type
        let locationDescription;
        if (isLandmark) {
          // Institutional/landmark destination
          locationDescription = `**Location Type:** INSTITUTIONAL/LANDMARK (NOT a residential household)
- Destination: ${destination}
- Building: ${landmarkDescription}
- CRITICAL: This is ${destination}, NOT a "middling household" or "merchant's home"`;
        } else {
          // Residential household
          locationDescription = `**Location Type:** Residential household
- Destination: ${destination}
- House type: ${houseName.includes('Humble') ? 'humble dwelling (single room, dirt floor, sparse furnishings)' : 'middling household (4 rooms, modest furnishings, middle-class residence)'}`;
        }

        const arrivalPrompt = `You are narrating Maria de Lima's arrival at a house call in 1680 Mexico City.

**Context:**
- Maria has traveled ${travelTime} minutes through the colonial streets to reach ${destination}
- She is treating ${patientEntity.name}, a ${patientAge} ${patientGender} of ${socialClass} status
- Patient condition: ${ailmentDescription}
- Patient severity: ${positionData.severity}
${locationDescription}
- Patient position: ${positionData.furnitureName} (${positionData.severity === 'critical' ? 'bedridden' : positionData.severity === 'moderate' ? 'seated' : 'standing'})

**Write a brief (3-4 sentences) arrival narrative in present tense that:**
1. Describes Maria's arrival at ${destination} (${isLandmark ? 'describe the institutional building accurately - use the exact destination name' : 'describe the household type - humble dwelling or middling merchant/artisan home'})
2. Mentions the journey (heat/dust/crowds in streets, time taken)
3. Shows Maria entering and immediately observing the patient's condition and position
4. Conveys historical atmosphere (colonial architecture, religious imagery, social class markers)

**Keep it atmospheric and specific to the patient's actual condition. Do not use generic phrases like "showing signs of concern" - use their actual symptoms.**`;

        const response = await createChatCompletion(
          [
            { role: 'system', content: arrivalPrompt },
            { role: 'user', content: `Generate the arrival narrative for Maria's house call to treat ${patientEntity.name} (${ailmentDescription}).` }
          ],
          0.7,
          250
        );

        arrivalNarrative = response.choices[0].message.content;
        console.log('[Phase 3B] Generated dynamic arrival narrative via LLM');

      } catch (error) {
        console.error('[Phase 3B] Failed to generate arrival narrative, using fallback:', error);
        // Fallback to improved template
        let locationDesc;
        const isLandmark = houseCallData.isLandmark || false;

        if (isLandmark) {
          // Landmark - use exact destination name
          locationDesc = destination;
        } else if (destination === 'their household' || destination === 'a nearby residence') {
          // Generic residential - use house type description
          locationDesc = `${houseName.includes('Humble') ? 'a humble dwelling' : 'a middling household'} on a narrow street`;
        } else {
          // Specific residential destination - use as-is
          locationDesc = destination;
        }

        const placementNarrative = getPlacementNarrative(positionData, patientEntity);
        arrivalNarrative = `Maria arrives at ${locationDesc} after ${travelTime} minutes through the winding streets of Mexico City. ${placementNarrative}`;
      }

      setHistoryOutput(arrivalNarrative);
      setConversationHistory(prev => [...prev,
        { role: 'system', content: `*[HOUSE CALL ARRIVAL] Maria arrived at ${destination} to treat ${patientEntity.name}. Patient condition: ${positionData.severity}.*` },
        { role: 'assistant', content: arrivalNarrative }
      ]);

      // 8. Add journal entry
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: `Arrived at ${destination} for house call. Found ${patientEntity.name} ${positionData.severity === 'critical' ? 'bedridden' : positionData.severity === 'moderate' ? 'seated' : 'standing'} at ${positionData.furnitureName}.`
      });

      // 9. Clear pending house call state
      setPendingHouseCall(null);
      // Restore normal UI mode
      setBackgroundMode('normal');

      // 10. Show success toast
      if (toast) {
        toast.success(`Arrived at ${houseName}. Patient positioned at ${positionData.furnitureName}.`, { duration: 3000 });
      }

      // 11. PHASE 3D: Store patient for "Return to Botica" command
      // User can type "return to botica" or "leave" to trigger completion
      // Dynamic chip will be added by parent component when it detects house call state
      console.log('[Phase 3D] House call active - "return to botica" command available');

      console.log('[Phase 3C] House call arrival complete with patient positioned');

    } catch (error) {
      console.error('[Phase 3B/3C] House call arrival error:', error);
      if (toast) {
        toast.error('Failed to arrive at house call location.');
      }
      // Clear pending house call on error
      setPendingHouseCall(null);
      // Restore normal UI mode
      setBackgroundMode('normal');
      clearTravelTimeouts();
      if (setTravelAnimationState) {
        setTravelAnimationState(null);
      }
    }
  }, [
    setCurrentMapId,
    setPlayerPosition,
    setPlayerFacing,
    setNPCPosition,
    advanceTime,
    setActivePatient,
    setPatientDialogue,
    setHistoryOutput,
    setConversationHistory,
    addJournalEntry,
    setPendingHouseCall,
    setBackgroundMode,
    toast,
    turnNumber,
    gameState.date,
    updateLocation,
    setTravelAnimationState,
    clearTravelTimeouts
  ]);

  /**
   * Handle completing house call and returning to botica (Phase 3D simplified)
   * Wraps up consultation, awards XP/reputation, and returns to botica
   * @param {Object} patientEntity - Optional patient entity for reputation awards
   */
  const handleCompleteHouseCall = useCallback(async (patientEntity = null) => {
    console.log('[Phase 3D] Completing house call');

    try {
      clearTravelTimeouts();
      if (setTravelAnimationState) {
        setTravelAnimationState(null);
      }

      // 1. Generate wrap-up narrative via LLM for better context
      let wrapUpNarrative;
      try {
        const patientName = patientEntity?.name || 'the patient';
        const ailment = patientEntity?.symptoms?.[0]?.name || patientEntity?.medical?.condition || 'their ailment';

        const returnPrompt = `You are narrating the conclusion of a house call in 1680 Mexico City.

**Context:**
- Maria de Lima has just finished treating ${patientName} for ${ailment}
- The treatment interaction is complete (either successful, declined, or outcome varies)
- Maria is now leaving the patient's residence and returning to her botica

**Write a brief (2-3 sentences) return narrative in present tense that:**
1. Shows Maria gathering her supplies and departing the household
2. Describes her return journey through the streets back to the Botica de la Amargura
3. Conveys her reflection on the case (professional, matter-of-fact tone)

**Keep it atmospheric and period-appropriate. Focus on the journey and transition, not the medical outcome (that was already narrated).**`;

        const response = await createChatCompletion(
          [
            { role: 'system', content: returnPrompt },
            { role: 'user', content: `Generate the return narrative for Maria's house call to ${patientName}.` }
          ],
          0.7,
          200
        );

        wrapUpNarrative = response.choices[0].message.content;
        console.log('[Phase 3D] Generated return narrative via LLM');

      } catch (error) {
        console.error('[Phase 3D] Failed to generate return narrative, using fallback:', error);
        // Fallback to simple template
        wrapUpNarrative = `Maria gathers her medical bag and bids farewell to the household. She makes her way back through the winding streets of Mexico City to the Botica de la Amargura, her mind already turning to the next patient.`;
      }

      setHistoryOutput(wrapUpNarrative);
      setConversationHistory(prev => [...prev,
        { role: 'system', content: `*[HOUSE CALL COMPLETE] Maria returned to the Botica de la Amargura.*` },
        { role: 'assistant', content: wrapUpNarrative }
      ]);

      // 2. Award XP for completing house call (+2 XP for travel + consultation effort)
      if (typeof awardXP === 'function') {
        awardXP(2, 'house_call_complete');
        console.log('[Phase 3D] Awarded +2 XP for house call');
      }

      // 3. Award reputation if patient has faction affiliation
      if (patientEntity && updateReputation && patientEntity.faction) {
        updateReputation(patientEntity.faction, 1);
        console.log('[Phase 3D] Awarded +1 reputation with', patientEntity.faction);
      }

      // 4. Add journal entry
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: `Completed house call. Returned to botica.${patientEntity ? ` Treated ${patientEntity.name}.` : ''}`
      });

      // 5. Advance time by return journey (~10-15 minutes)
      advanceTime({ minutes: 12 });
      console.log('[Phase 3D] Advanced time by 12 minutes for return journey');

      // 6. Clean up state - clear active patient
      setActivePatient(null);
      setPatientDialogue([]);
      console.log('[Phase 3D] Cleared active patient state');

      // 7. Transition back to botica interior map
      updateLocation('Botica de la Amargura, Mexico City');
      setCurrentMapId('botica-interior');
      console.log('[Phase 3D] Transitioned to botica-interior and updated location');

      // 8. Set player position to botica starting position (workshop area)
      // CRITICAL: Include grid coordinates to prevent NaN errors during movement
      const gridSize = 20; // Standard grid size
      setPlayerPosition({
        x: 400,
        y: 300,
        gridX: Math.floor(400 / gridSize),
        gridY: Math.floor(300 / gridSize)
      }); // Botica interior starting position
      setPlayerFacing(180);

      // 9. Show success toast
      if (toast) {
        toast.success('Returned to botica. House call complete. +2 XP', { duration: 3000 });
      }

      console.log('[Phase 3D] House call completion successful');

    } catch (error) {
      console.error('[Phase 3D] House call completion error:', error);
      clearTravelTimeouts();
      if (toast) {
        toast.error('Failed to return to botica.');
      }
    }
  }, [
    setHistoryOutput,
    setConversationHistory,
    awardXP,
    updateReputation,
    addJournalEntry,
    turnNumber,
    gameState.date,
    advanceTime,
    setActivePatient,
    setPatientDialogue,
    setCurrentMapId,
    setPlayerPosition,
    setPlayerFacing,
    toast,
    updateLocation,
    setTravelAnimationState,
    clearTravelTimeouts
  ]);

  const walkPlayerToDoor = useCallback(async () => {
    if (currentMapId !== 'botica-interior') {
      console.debug('[DoorShortcut] Skipping animation - not in botica interior');
      return false;
    }

    try {
      const scenario = scenarioLoader.getScenario(gameState.scenarioId || '1680-mexico-city');
      const freshMapData = scenario?.maps?.interior?.[currentMapId];

      if (!freshMapData) {
        console.warn('[DoorShortcut] No interior map data for botica-interior');
        return false;
      }

      const { getGridSystem } = await import('../../features/map/services/gridMovementSystem');
      const gridSystem = getGridSystem(currentMapId, freshMapData);

      const mainDoor = Array.isArray(freshMapData?.doors)
        ? freshMapData.doors.find(door => door.id === 'main-entrance')
        : null;

      const doorX = Array.isArray(mainDoor?.position) ? mainDoor.position[0] : BOTICA_MAIN_DOOR.x;
      const doorY = Array.isArray(mainDoor?.position) ? mainDoor.position[1] : BOTICA_MAIN_DOOR.y;
      const approachOffset = gridSystem.gridSize * 2; // Step inside the doorway
      const approachY = Math.max(doorY - approachOffset, 0);

      const targetGrid = gridSystem.pixelToGrid(doorX, approachY);
      const targetPosition = {
        x: targetGrid.x,
        y: targetGrid.y,
        gridX: targetGrid.gridX,
        gridY: targetGrid.gridY
      };

      let startGrid;
      if (playerPosition && typeof playerPosition.x === 'number' && typeof playerPosition.y === 'number') {
        if (typeof playerPosition.gridX === 'number' && typeof playerPosition.gridY === 'number') {
          startGrid = {
            x: playerPosition.x,
            y: playerPosition.y,
            gridX: playerPosition.gridX,
            gridY: playerPosition.gridY
          };
        } else {
          const derived = gridSystem.pixelToGrid(playerPosition.x, playerPosition.y);
          startGrid = {
            x: derived.x,
            y: derived.y,
            gridX: derived.gridX,
            gridY: derived.gridY
          };
        }
      } else {
        startGrid = { ...targetPosition };
      }

      const startPosition = startGrid;
      const pathResult = gridSystem.findPath(startPosition, targetPosition);

      console.debug('[DoorShortcut] Path result:', {
        valid: pathResult.valid,
        length: pathResult.path?.length || 0,
        reason: pathResult.reason,
        start: startPosition,
        target: targetPosition
      });

      let steps = pathResult.valid && Array.isArray(pathResult.path)
        ? pathResult.path.slice(1)
        : null;

      if (!steps || steps.length === 0) {
        const boundsWidth = freshMapData?.bounds?.width || 1000;
        const lateralOffset = gridSystem.gridSize * 7; // 140px sidestep around counter
        const walkwayLeftX = Math.max(doorX - lateralOffset, gridSystem.gridSize * 5);
        const walkwayRightX = Math.min(doorX + lateralOffset, boundsWidth - gridSystem.gridSize * 5);
        const lateralX = startPosition.x >= doorX ? walkwayLeftX : walkwayRightX;

        const fallbackPoints = [
          { x: lateralX, y: startPosition.y },
          { x: lateralX, y: approachY },
          { x: doorX, y: approachY }
        ];

        const fallbackPath = [startPosition];
        let fallbackValid = true;

        for (const point of fallbackPoints) {
          const gridPoint = gridSystem.pixelToGrid(point.x, point.y);
          if (!gridSystem.isWalkable(gridPoint.gridX, gridPoint.gridY)) {
            fallbackValid = false;
            break;
          }
          fallbackPath.push({
            x: gridPoint.x,
            y: gridPoint.y,
            gridX: gridPoint.gridX,
            gridY: gridPoint.gridY
          });
        }

        if (fallbackValid) {
          console.warn('[DoorShortcut] Using fallback path to door');
          steps = fallbackPath.slice(1);
        } else {
          console.warn('[DoorShortcut] No valid path to door - teleporting to entrance');
          setPlayerPosition(targetPosition);
          setPlayerFacing(180);
          return true;
        }
      }

      if (steps.length === 0) {
        setPlayerFacing(180);
        return true;
      }

      let currentStep = { ...startPosition };
      for (const step of steps) {
        currentStep = {
          x: step.x,
          y: step.y,
          gridX: step.gridX,
          gridY: step.gridY
        };

        setPlayerPosition(currentStep);
        await new Promise(resolve => setTimeout(resolve, WALK_STEP_DELAY_MS));
      }

      setPlayerFacing(180);
      console.debug('[DoorShortcut] Arrived at door in', steps.length, 'steps');
      return true;
    } catch (error) {
      console.error('[DoorShortcut] Failed to walk to door:', error);
      return false;
    }
  }, [
    currentMapId,
    gameState.scenarioId,
    playerPosition,
    setPlayerPosition,
    setPlayerFacing
  ]);

  return {
    handleMovement,
    handleEnterBuilding,
    handleExitBuilding,
    handleFastTravel,
    handleNaturalLanguageNavigation,
    handleLocationBasedNavigation, // Location-based pathfinding navigation
    handleHouseCallArrival, // Phase 3B/3C
    handleCompleteHouseCall, // Phase 3D
    walkPlayerToDoor,
  };
}
