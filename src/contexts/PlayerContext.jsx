// PlayerContext.jsx
// React Context for managing player state (position, skills, effects, stats)
// Consolidates player-related state from GamePage

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useGameState } from './GameStateContext';
import { useSkills as useSkillsHook } from '../core/hooks/useSkills';

/**
 * Context for player state management
 * Provides: position, skills, effects, stats (health/energy/wealth)
 */
const PlayerContext = createContext(null);

/**
 * PlayerProvider - Manages all player-related state
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.characterData - Character data from scenario
 * @param {Function} props.onSkillLevelUp - Callback for skill level-up
 */
export function PlayerProvider({ children, characterData = null, onSkillLevelUp = null }) {
  // Get game state context for wealth/health/energy
  const { gameState, updateWealth, setWealth, updateHealth, setHealth, updateEnergy, setEnergy } = useGameState();

  // Player position and facing (for map navigation)
  // Grid (25, 24) = pixel center (510, 480) with 20px grid size - behind counter (north side)
  const [playerPosition, setPlayerPosition] = useState({
    x: 510,
    y: 480,
    gridX: 25,
    gridY: 24
  });

  // Facing direction in degrees: 0=North, 90=East, 180=South, 270=West
  const [playerFacing, setPlayerFacing] = useState(180); // Start facing south

  // Active effects (buffs/debuffs - NOT skill effects, those come from useSkills)
  const [activeEffects, setActiveEffects] = useState([]);

  // Low energy warning tracking
  const [consecutiveLowEnergyTurns, setConsecutiveLowEnergyTurns] = useState(0);

  // Skills system (wrapped from useSkills hook)
  const {
    playerSkills,
    activeEffects: skillEffects, // Skill-specific effects
    awardXP,
    awardSkillXP,
    learnNewSkill,
    improveSkill,
    resetSkills
  } = useSkillsHook(characterData, onSkillLevelUp);

  /**
   * Update player position
   * Auto-computes grid coordinates if not provided to prevent NaN errors
   * @param {Object} position - { x, y, gridX?, gridY? }
   */
  const updatePosition = useCallback((position) => {
    const GRID_SIZE = 20; // Standard grid size

    // Auto-compute grid coordinates if missing
    const normalizedPosition = {
      x: position.x,
      y: position.y,
      gridX: position.gridX ?? Math.floor(position.x / GRID_SIZE),
      gridY: position.gridY ?? Math.floor(position.y / GRID_SIZE)
    };

    // Validate coordinates before updating
    if (isNaN(normalizedPosition.x) || isNaN(normalizedPosition.y) ||
        isNaN(normalizedPosition.gridX) || isNaN(normalizedPosition.gridY)) {
      console.error('[PlayerContext] Invalid position coordinates - ignoring update:', {
        input: position,
        normalized: normalizedPosition
      });
      return; // Don't update with NaN
    }

    // Debug: Warn if auto-computed (helps find places that should provide grid coords)
    if (position.gridX === undefined || position.gridY === undefined) {
      console.log('[PlayerContext] Auto-computed grid coordinates:', {
        pixels: { x: position.x, y: position.y },
        grid: { gridX: normalizedPosition.gridX, gridY: normalizedPosition.gridY }
      });
    }

    setPlayerPosition(normalizedPosition);
  }, []);

  /**
   * Update player facing direction
   * @param {number} degrees - Direction in degrees (0-359)
   */
  const updateFacing = useCallback((degrees) => {
    setPlayerFacing(degrees % 360);
  }, []);

  /**
   * Add an active effect (buff/debuff)
   * @param {Object} effect - { id, name, type, value, duration }
   */
  const addEffect = useCallback((effect) => {
    setActiveEffects(prev => [...prev, effect]);
  }, []);

  /**
   * Remove an active effect by ID
   * @param {string} effectId - Effect ID to remove
   */
  const removeEffect = useCallback((effectId) => {
    setActiveEffects(prev => prev.filter(e => e.id !== effectId));
  }, []);

  /**
   * Clear all active effects
   */
  const clearEffects = useCallback(() => {
    setActiveEffects([]);
  }, []);

  /**
   * Apply resource changes (health, energy, wealth)
   * Centralized resource management with validation
   *
   * @param {Object} changes - { health, energy, wealth }
   * @returns {Object} - Applied changes
   */
  const applyResourceChanges = useCallback((changes) => {
    const applied = { health: 0, energy: 0, wealth: 0 };

    if (changes.health !== undefined && changes.health !== 0) {
      const currentHealth = gameState.health || 100;
      const newHealth = Math.max(0, Math.min(100, currentHealth + changes.health));
      setHealth(newHealth);
      applied.health = newHealth - currentHealth;
      console.log(`[PlayerContext] Health: ${currentHealth} → ${newHealth} (${applied.health > 0 ? '+' : ''}${applied.health})`);
    }

    if (changes.energy !== undefined && changes.energy !== 0) {
      const currentEnergy = gameState.energy || 100;
      const newEnergy = Math.max(0, Math.min(100, currentEnergy + changes.energy));
      setEnergy(newEnergy);
      applied.energy = newEnergy - currentEnergy;
      console.log(`[PlayerContext] Energy: ${currentEnergy} → ${newEnergy} (${applied.energy > 0 ? '+' : ''}${applied.energy})`);

      // Track consecutive low energy turns
      if (newEnergy < 10) {
        setConsecutiveLowEnergyTurns(prev => prev + 1);
      } else {
        setConsecutiveLowEnergyTurns(0);
      }
    }

    if (changes.wealth !== undefined && changes.wealth !== 0) {
      const currentWealth = gameState.wealth || 0;
      const newWealth = Math.max(0, currentWealth + changes.wealth);
      setWealth(newWealth);
      applied.wealth = newWealth - currentWealth;
      console.log(`[PlayerContext] Wealth: ${currentWealth} → ${newWealth} (${applied.wealth > 0 ? '+' : ''}${applied.wealth})`);
    }

    return applied;
  }, [gameState.health, gameState.energy, gameState.wealth, setHealth, setEnergy, setWealth]);

  /**
   * Get player stats summary
   * Convenience getter for all player stats
   */
  const stats = useMemo(() => ({
    health: gameState.health || 100,
    energy: gameState.energy || 100,
    wealth: gameState.wealth || 0,
    level: playerSkills.level || 1,
    xp: playerSkills.xp || 0,
    xpToNextLevel: playerSkills.xpToNextLevel || 100,
    skillPoints: playerSkills.skillPoints || 0,
  }), [
    gameState.health,
    gameState.energy,
    gameState.wealth,
    playerSkills.level,
    playerSkills.xp,
    playerSkills.xpToNextLevel,
    playerSkills.skillPoints,
  ]);

  /**
   * NOTE: activeEffects (array of buffs/debuffs) and skillEffects (object with categorized effects)
   * are different data structures and cannot be combined.
   *
   * - activeEffects: Array of temporary effects like [{ id, name, type, value, duration }]
   * - skillEffects: Object like { priceModifiers: {}, reputationBonuses: {}, unlockedActions: [], ... }
   *
   * Components should access them separately based on their needs.
   */

  /**
   * Set player position directly (bypasses merge, replaces entire position)
   * Auto-computes grid coordinates if not provided to prevent NaN errors
   * @param {Object} position - { x, y, gridX?, gridY? }
   */
  const setPosition = useCallback((position) => {
    const GRID_SIZE = 20;

    const normalizedPosition = {
      x: position.x,
      y: position.y,
      gridX: position.gridX ?? Math.floor(position.x / GRID_SIZE),
      gridY: position.gridY ?? Math.floor(position.y / GRID_SIZE)
    };

    if (isNaN(normalizedPosition.x) || isNaN(normalizedPosition.y) ||
        isNaN(normalizedPosition.gridX) || isNaN(normalizedPosition.gridY)) {
      console.error('[PlayerContext] Invalid position coordinates - ignoring setPosition:', {
        input: position,
        normalized: normalizedPosition
      });
      return;
    }

    if (position.gridX === undefined || position.gridY === undefined) {
      console.log('[PlayerContext] Auto-computed grid coordinates in setPosition:', {
        pixels: { x: position.x, y: position.y },
        grid: { gridX: normalizedPosition.gridX, gridY: normalizedPosition.gridY }
      });
    }

    setPlayerPosition(normalizedPosition);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // Position & Facing
    position: playerPosition,
    setPosition: setPosition,  // Use smart setter instead of raw state setter
    updatePosition,
    facing: playerFacing,
    setFacing: setPlayerFacing,
    updateFacing,

    // Stats (from GameStateContext)
    stats,
    health: gameState.health || 100,
    energy: gameState.energy || 100,
    wealth: gameState.wealth || 0,
    updateHealth,
    setHealth,
    updateEnergy,
    setEnergy,
    updateWealth,
    setWealth,

    // Resource management
    applyResourceChanges,

    // Effects (two separate structures - see note above)
    activeEffects, // Array of general buffs/debuffs
    setActiveEffects,
    skillEffects, // Object of skill-based effect modifiers
    addEffect,
    removeEffect,
    clearEffects,

    // Low energy tracking
    consecutiveLowEnergyTurns,
    setConsecutiveLowEnergyTurns,

    // Skills system
    playerSkills,
    awardXP,
    awardSkillXP,
    learnNewSkill,
    improveSkill,
    resetSkills,
  }), [
    playerPosition,
    setPosition,
    updatePosition,
    playerFacing,
    updateFacing,
    stats,
    gameState.health,
    gameState.energy,
    gameState.wealth,
    updateHealth,
    setHealth,
    updateEnergy,
    setEnergy,
    updateWealth,
    setWealth,
    applyResourceChanges,
    activeEffects,
    skillEffects,
    addEffect,
    removeEffect,
    clearEffects,
    consecutiveLowEnergyTurns,
    playerSkills,
    awardXP,
    awardSkillXP,
    learnNewSkill,
    improveSkill,
    resetSkills,
  ]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

/**
 * Hook to consume PlayerContext
 *
 * @returns {Object} Player state and update functions
 * @throws {Error} If used outside of PlayerProvider
 *
 * @example
 * function MyComponent() {
 *   const { stats, position, updateHealth, awardXP } = usePlayer();
 *
 *   const handleRest = () => {
 *     updateHealth(10);
 *     updateEnergy(20);
 *   };
 *
 *   return (
 *     <div>
 *       Health: {stats.health}
 *       Position: ({position.x}, {position.y})
 *       <button onClick={handleRest}>Rest</button>
 *     </div>
 *   );
 * }
 */
export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }

  return context;
}

/**
 * Available exports from context:
 *
 * Position & Movement:
 * - position: { x, y, gridX, gridY }
 * - setPosition(position): Set position directly
 * - updatePosition(position): Update position (merge with existing)
 * - facing: number (degrees)
 * - setFacing(degrees): Set facing direction
 * - updateFacing(degrees): Update facing direction
 *
 * Stats (from GameStateContext):
 * - stats: { health, energy, wealth, level, xp, xpToNextLevel, skillPoints }
 * - health: number (0-100)
 * - energy: number (0-100)
 * - wealth: number
 * - updateHealth(amount): Add/subtract health
 * - setHealth(value): Set health to specific value
 * - updateEnergy(amount): Add/subtract energy
 * - setEnergy(value): Set energy to specific value
 * - updateWealth(amount): Add/subtract wealth
 * - setWealth(value): Set wealth to specific value
 *
 * Resource Management:
 * - applyResourceChanges({ health, energy, wealth }): Apply multiple changes at once
 *
 * Effects (Two separate structures):
 * - activeEffects: Array of general buffs/debuffs [{ id, name, type, value, duration }]
 * - skillEffects: Object of skill effect modifiers { priceModifiers: {}, reputationBonuses: {}, ... }
 * - setActiveEffects(effects): Set active effects array
 * - addEffect(effect): Add single effect to activeEffects
 * - removeEffect(effectId): Remove effect by ID from activeEffects
 * - clearEffects(): Remove all active effects
 *
 * Low Energy Tracking:
 * - consecutiveLowEnergyTurns: number
 * - setConsecutiveLowEnergyTurns(value): Set counter
 *
 * Skills System:
 * - playerSkills: Complete skills object
 * - awardXP(xp, source): Award player XP
 * - awardSkillXP(skillId, xp, source): Award skill-specific XP
 * - learnNewSkill(skillId): Begin learning new skill
 * - improveSkill(skillId): Level up existing skill
 * - resetSkills(): Reset all skills (for new game)
 */
