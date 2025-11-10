// GameStateContext.jsx
// React Context for managing core game state
// Replaces prop drilling of gameState and related functions

import React, { createContext, useContext } from 'react';
import { useGameState as useGameStateHook } from '../core/state/gameState';

/**
 * Context for game state management
 * Provides: inventory, time, location, story NPC state, player stats, etc.
 */
const GameStateContext = createContext(null);

/**
 * GameStateProvider - Wraps the app and provides game state to all children
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.scenarioId - Scenario identifier (e.g., '1680-mexico-city')
 * @param {Object} props.loadedSaveData - Optional loaded save data
 */
export function GameStateProvider({ children, scenarioId, loadedSaveData = null }) {
  // Use the existing useGameState hook to manage state
  // This approach allows us to gradually migrate without rewriting all the state logic
  const gameStateValue = useGameStateHook(scenarioId, loadedSaveData);

  return (
    <GameStateContext.Provider value={gameStateValue}>
      {children}
    </GameStateContext.Provider>
  );
}

/**
 * Hook to consume GameStateContext
 *
 * @returns {Object} Game state and update functions
 * @throws {Error} If used outside of GameStateProvider
 *
 * @example
 * function MyComponent() {
 *   const { gameState, updateInventory, advanceTime } = useGameState();
 *
 *   const handleBuyItem = () => {
 *     updateInventory('Opium', 1);
 *   };
 *
 *   return <button onClick={handleBuyItem}>Buy Opium</button>;
 * }
 */
export function useGameState() {
  const context = useContext(GameStateContext);

  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }

  return context;
}

/**
 * Available exports from context:
 *
 * Core State:
 * - gameState: Main game state object
 * - setGameState: Direct state setter (use sparingly)
 *
 * Inventory Management:
 * - updateInventory(itemName, quantityChange): Update item quantity
 * - addCompoundToInventory(compound): Add crafted compound
 * - generateNewItemDetails(itemName): Generate item with LLM
 * - refreshInventory(): Force inventory re-render
 * - lastAddedItem: Most recently added item
 * - clearLastAddedItem(): Clear last added item flag
 *
 * Location & Time:
 * - updateLocation(newLocation): Update player location
 * - advanceTime(summaryData, playerLevel): Advance game time
 *
 * Story NPC System:
 * - updateStoryNpcStatus(npcId, updates): Persist encounter outcomes/cooldowns
 * - resetStoryNpcStatus(): Clear all story NPC progress
 *
 * Player Stats:
 * - updateWealth(amount): Add/subtract wealth
 * - setWealth(value): Set wealth to specific value
 * - updateHealth(amount): Add/subtract health
 * - setHealth(value): Set health to specific value
 * - updateEnergy(amount): Add/subtract energy
 * - setEnergy(value): Set energy to specific value
 *
 * Crafting:
 * - unlockMethod(methodName): Unlock new mixing method
 *
 * Shop:
 * - toggleShopSign(): Toggle shop sign visibility
 *
 * Profession:
 * - chooseProfession(professionId, playerLevel): Choose profession at level 5
 *
 * Commerce:
 * - addTradeOpportunity(opportunity): Add NPC trade opportunity
 * - removeTradeOpportunity(opportunityId): Remove trade opportunity
 * - addTradeTransaction(npcId, transaction): Log transaction
 * - getTradeHistory(npcId): Get NPC trade history
 * - cleanupExpiredOpportunities(): Remove expired trade offers
 *
 * Investment System:
 * - addActiveInvestment(investment): Add new active investment
 * - getActiveInvestments(): Get all active investments
 * - getInvestmentHistory(): Get completed investment history
 * - clearMaturedInvestments(): Clear maturation notifications
 *
 * Game Flow:
 * - triggerGameOver(result): Trigger game over state
 * - resetGameOver(): Reset game over state
 */
