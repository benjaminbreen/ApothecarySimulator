import { useState, useEffect, useCallback } from 'react';
import npcPositionTracker from '../services/npcPositionTracker';

/**
 * React hook for managing NPC positions on maps
 * Provides real-time updates of NPC positions with automatic re-rendering
 *
 * @param {Object} options
 * @param {string} [options.mapId] - Filter NPCs by map ID
 * @param {number} [options.updateInterval=100] - Update interval in ms
 * @returns {Object}
 */
export function useNPCPositions({ mapId, updateInterval = 100 } = {}) {
  const [npcPositions, setNpcPositions] = useState([]);

  // Update NPC positions state
  const updatePositions = useCallback(() => {
    if (mapId) {
      // Get NPCs for specific map
      const positions = npcPositionTracker.getNPCsInLocation(mapId);
      setNpcPositions(positions);
    } else {
      // Get all NPCs
      const positions = npcPositionTracker.getAllPositions();
      setNpcPositions(positions);
    }
  }, [mapId]);

  // Set up polling for position updates
  useEffect(() => {
    // Initial update
    updatePositions();

    // Poll for updates
    const interval = setInterval(updatePositions, updateInterval);

    return () => {
      clearInterval(interval);
    };
  }, [updatePositions, updateInterval]);

  // Helper functions
  const setNPCPosition = useCallback((npcId, npcName, position, status = 'idle') => {
    npcPositionTracker.setPosition(npcId, npcName, position, status);
    updatePositions();
  }, [updatePositions]);

  const moveNPC = useCallback((npcId, targetPosition, onComplete) => {
    npcPositionTracker.moveNPC(npcId, targetPosition, () => {
      updatePositions();
      if (onComplete) onComplete();
    });
  }, [updatePositions]);

  const getNPCPosition = useCallback((npcId) => {
    return npcPositionTracker.getPosition(npcId);
  }, []);

  const removeNPC = useCallback((npcId) => {
    npcPositionTracker.removeNPC(npcId);
    updatePositions();
  }, [updatePositions]);

  const initializeNPCs = useCallback((npcs, mapData) => {
    npcPositionTracker.initializeNPCsForMap(npcs, mapData);
    updatePositions();
  }, [updatePositions]);

  return {
    npcPositions,
    setNPCPosition,
    moveNPC,
    getNPCPosition,
    removeNPC,
    initializeNPCs,
    refresh: updatePositions
  };
}

export default useNPCPositions;
