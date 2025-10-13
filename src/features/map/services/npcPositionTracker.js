/**
 * NPC Position Tracker
 * Manages NPC positions, movements, and animations on maps
 */

/**
 * @typedef {import('../../../core/types/map.types').NPCMarker} NPCMarker
 * @typedef {import('../../../core/types/map.types').PointTuple} PointTuple
 */

class NPCPositionTracker {
  constructor() {
    // Map of NPC ID to position data
    this.positions = new Map();

    // Movement queue - NPCs waiting to move
    this.movementQueue = [];

    // Animation frame ID for movement updates
    this.animationFrameId = null;

    // Movement speed (pixels per second)
    this.movementSpeed = 50;

    // Load saved positions from localStorage
    this.loadFromStorage();
  }

  /**
   * Set an NPC's position on a map
   * @param {string} npcId - NPC identifier
   * @param {string} npcName - NPC display name
   * @param {PointTuple} position - [x, y] position
   * @param {string} [status='idle'] - NPC status
   */
  setPosition(npcId, npcName, position, status = 'idle') {
    this.positions.set(npcId, {
      npcId,
      npcName,
      position,
      status,
      path: null,
      pathProgress: 0,
      lastUpdate: Date.now()
    });

    this.saveToStorage();
  }

  /**
   * Get an NPC's current position
   * @param {string} npcId
   * @returns {NPCMarker|null}
   */
  getPosition(npcId) {
    return this.positions.get(npcId) || null;
  }

  /**
   * Get all NPC positions
   * @returns {NPCMarker[]}
   */
  getAllPositions() {
    return Array.from(this.positions.values());
  }

  /**
   * Get NPCs in a specific location/map
   * @param {string} mapId - Map identifier
   * @param {string} scenarioId - Scenario identifier
   * @returns {NPCMarker[]}
   */
  getNPCsInLocation(mapId, scenarioId) {
    // For now, return all NPCs
    // In the future, filter by actual location tracking
    return this.getAllPositions().filter(npc => {
      // Check if NPC has a location property matching the mapId
      return true; // Placeholder - return all for now
    });
  }

  /**
   * Move an NPC to a new position (with animation)
   * @param {string} npcId
   * @param {PointTuple} targetPosition
   * @param {Function} [onComplete] - Callback when movement completes
   */
  moveNPC(npcId, targetPosition, onComplete) {
    const npc = this.positions.get(npcId);
    if (!npc) {
      console.warn(`NPC ${npcId} not found`);
      return;
    }

    // Calculate path (for now, just a straight line)
    const path = this.calculatePath(npc.position, targetPosition);

    // Update NPC with path
    this.positions.set(npcId, {
      ...npc,
      status: 'moving',
      path,
      pathProgress: 0,
      targetPosition,
      onComplete
    });

    // Start animation loop if not already running
    this.startAnimationLoop();
  }

  /**
   * Calculate a path between two points
   * @param {PointTuple} start
   * @param {PointTuple} end
   * @returns {PointTuple[]}
   */
  calculatePath(start, end) {
    // For now, just return start and end (straight line)
    // In the future, could use A* pathfinding to avoid obstacles
    return [start, end];
  }

  /**
   * Start animation loop for NPC movements
   */
  startAnimationLoop() {
    if (this.animationFrameId) {
      return; // Already running
    }

    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // Convert to seconds
      lastTime = now;

      let anyMoving = false;

      // Update all moving NPCs
      for (const [npcId, npc] of this.positions.entries()) {
        if (npc.status === 'moving' && npc.path && npc.path.length >= 2) {
          anyMoving = true;

          // Calculate how far to move this frame
          const totalDistance = this.distance(npc.path[0], npc.path[npc.path.length - 1]);
          const distanceThisFrame = this.movementSpeed * deltaTime;
          const progressIncrease = distanceThisFrame / totalDistance;

          // Update progress
          let newProgress = npc.pathProgress + progressIncrease;

          if (newProgress >= 1) {
            // Movement complete
            this.positions.set(npcId, {
              ...npc,
              position: npc.targetPosition,
              status: 'idle',
              path: null,
              pathProgress: 0
            });

            // Call completion callback
            if (npc.onComplete) {
              npc.onComplete();
            }
          } else {
            // Interpolate position along path
            const newPosition = this.interpolateAlongPath(npc.path, newProgress);

            this.positions.set(npcId, {
              ...npc,
              position: newPosition,
              pathProgress: newProgress
            });
          }
        }
      }

      // Continue animation if any NPCs are still moving
      if (anyMoving) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.animationFrameId = null;
        this.saveToStorage();
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Interpolate position along a path
   * @param {PointTuple[]} path
   * @param {number} progress - 0 to 1
   * @returns {PointTuple}
   */
  interpolateAlongPath(path, progress) {
    if (path.length < 2) {
      return path[0];
    }

    // For simple straight-line path
    const start = path[0];
    const end = path[path.length - 1];

    return [
      start[0] + (end[0] - start[0]) * progress,
      start[1] + (end[1] - start[1]) * progress
    ];
  }

  /**
   * Calculate distance between two points
   * @param {PointTuple} p1
   * @param {PointTuple} p2
   * @returns {number}
   */
  distance(p1, p2) {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Stop all NPC movements
   */
  stopAllMovements() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    for (const [npcId, npc] of this.positions.entries()) {
      if (npc.status === 'moving') {
        this.positions.set(npcId, {
          ...npc,
          status: 'idle',
          path: null,
          pathProgress: 0
        });
      }
    }
  }

  /**
   * Remove an NPC from tracking
   * @param {string} npcId
   */
  removeNPC(npcId) {
    this.positions.delete(npcId);
    this.saveToStorage();
  }

  /**
   * Clear all NPC positions
   */
  clearAll() {
    this.stopAllMovements();
    this.positions.clear();
    this.saveToStorage();
  }

  /**
   * Save positions to localStorage
   */
  saveToStorage() {
    try {
      const data = Array.from(this.positions.entries()).map(([id, npc]) => ({
        npcId: npc.npcId,
        npcName: npc.npcName,
        position: npc.position,
        status: npc.status === 'moving' ? 'idle' : npc.status // Don't save moving state
      }));

      localStorage.setItem('npcPositions', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save NPC positions:', error);
    }
  }

  /**
   * Load positions from localStorage
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('npcPositions');
      if (saved) {
        const data = JSON.parse(saved);

        for (const npc of data) {
          this.positions.set(npc.npcId, {
            npcId: npc.npcId,
            npcName: npc.npcName,
            position: npc.position,
            status: npc.status || 'idle',
            path: null,
            pathProgress: 0,
            lastUpdate: Date.now()
          });
        }
      }
    } catch (error) {
      console.error('Failed to load NPC positions:', error);
    }
  }

  /**
   * Generate random position within map bounds
   * @param {number} width - Map width
   * @param {number} height - Map height
   * @param {number} [margin=50] - Margin from edges
   * @returns {PointTuple}
   */
  randomPosition(width, height, margin = 50) {
    return [
      margin + Math.random() * (width - 2 * margin),
      margin + Math.random() * (height - 2 * margin)
    ];
  }

  /**
   * Initialize NPC positions for a scenario
   * @param {Object[]} npcs - Array of NPC objects
   * @param {Object} mapData - Map data with bounds
   */
  initializeNPCsForMap(npcs, mapData) {
    npcs.forEach(npc => {
      // Check if NPC already has a saved position
      if (!this.positions.has(npc.id || npc.name)) {
        // Generate random starting position
        const position = this.randomPosition(mapData.bounds.width, mapData.bounds.height);
        this.setPosition(npc.id || npc.name, npc.name, position, 'idle');
      }
    });
  }
}

// Export singleton instance
export const npcPositionTracker = new NPCPositionTracker();
export default npcPositionTracker;
