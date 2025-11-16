// useResourceHandlers.js
// Handles all resource management logic (health, energy, eating, foraging)
// Extracted from useGameHandlers.js (Phase 2.4)

import { useCallback } from 'react';
import { useGameState } from '../../contexts/GameStateContext';
import { usePlayer } from '../../contexts/PlayerContext';
import resourceManager from '../../systems/ResourceManager';

/**
 * Custom hook for resource management handlers
 * Manages health, energy, eating, and foraging mechanics
 *
 * @param {Object} params - Hook parameters
 * @param {Function} params.addJournalEntry - Journal entry adder
 * @param {Function} params.addToHistory - Conversation history adder
 * @param {Function} params.generateNewItemDetails - Item details generator
 * @param {Function} params.toast - Toast notification function
 * @param {Function} params.awardXP - Award XP function
 * @param {Object} params.gameState - Current game state (passed from parent)
 * @param {number} params.turnNumber - Current turn number
 * @param {number} params.energy - Current energy value (passed from parent)
 * @param {number} params.health - Current health value (passed from parent)
 * @param {number} params.currentWealth - Current wealth value (passed from parent)
 * @param {number} params.consecutiveLowEnergyTurns - Low energy counter (passed from parent)
 * @param {Function} params.setEnergy - Energy setter (passed from parent)
 * @param {Function} params.setHealth - Health setter (passed from parent)
 * @param {Function} params.setConsecutiveLowEnergyTurns - Low energy counter setter (passed from parent)
 * @param {Function} params.setActiveEffects - Active effects setter (passed from parent)
 *
 * @returns {Object} Resource handlers
 */
export function useResourceHandlers({
  addJournalEntry,
  addToHistory,
  generateNewItemDetails,
  toast,
  awardXP,
  // Legacy params
  gameState,
  turnNumber,
  energy,
  health,
  currentWealth,
  consecutiveLowEnergyTurns,
  setEnergy,
  setHealth,
  setConsecutiveLowEnergyTurns,
  setActiveEffects,
}) {
  // Context hooks
  const { updateInventory, updateWealth, advanceTime } = useGameState();
  const { awardSkillXP } = usePlayer();

  /**
   * Apply resource changes (energy, health) with modifiers
   * Calculates energy/health changes, updates active effects, returns warnings
   */
  const applyResourceChanges = useCallback((action, modifiers = {}) => {
    // Calculate energy change
    const newEnergy = resourceManager.calculateEnergyChange(energy, action, modifiers);
    setEnergy(newEnergy);

    // Update low energy streak
    const newStreak = resourceManager.updateLowEnergyStreak(newEnergy, consecutiveLowEnergyTurns);
    setConsecutiveLowEnergyTurns(newStreak);

    // Calculate health changes
    const healthUpdate = resourceManager.calculateHealthDecrease(health, {
      wealth: currentWealth,
      energy: newEnergy,
      consecutiveLowEnergyTurns: newStreak
    }, modifiers);

    // Apply health bonus if provided
    const healthBonus = modifiers.healthBonus || 0;
    const finalHealth = Math.min(100, Math.max(0, healthUpdate.newHealth + healthBonus));

    setHealth(finalHealth);

    // Note: Maria's portrait is calculated dynamically in GamePage via getMariaPortrait()
    // No need to update status here

    // Check for warnings
    const energyWarning = resourceManager.getEnergyWarning(newEnergy);
    const healthWarning = resourceManager.getHealthWarning(finalHealth);

    // Update active effects
    const newEffects = [];

    if (newEnergy < 20) {
      newEffects.push({
        icon: '😴',
        name: 'Exhausted',
        description: 'Working too hard without rest',
        duration: 'Until rest'
      });
    }

    if (modifiers.wellRested) {
      newEffects.push({
        icon: '✨',
        name: 'Well Rested',
        description: 'Full night of sleep',
        duration: '3 turns'
      });
    }

    if (modifiers.energyBonus && modifiers.energyBonus >= 15) {
      newEffects.push({
        icon: '🍲',
        name: 'Nourished',
        description: 'Recently ate well',
        duration: '2 turns'
      });
    }

    if (healthWarning) {
      newEffects.push({
        icon: healthWarning.icon,
        name: 'Health Issue',
        description: healthWarning.message,
        duration: 'Until treated'
      });
    }

    setActiveEffects(newEffects);

    return { energyWarning, healthWarning, healthDecrease: healthUpdate.decrease, reasons: healthUpdate.reasons };
  }, [energy, health, currentWealth, consecutiveLowEnergyTurns, setEnergy, setConsecutiveLowEnergyTurns, setHealth, setActiveEffects]);

  /**
   * Handle eating a meal
   * Deducts wealth, applies energy/health bonuses, logs to journal and history
   */
  const handleEat = useCallback((meal) => {
    updateWealth(-meal.cost);

    applyResourceChanges('eat', {
      energyBonus: meal.energy,
      healthBonus: meal.health
    });

    const eatMessage = `*Maria ate ${meal.quality === 'good' ? 'a hearty meal' : meal.quality === 'adequate' ? 'a simple meal' : 'meager rations'}. ${meal.message}*`;
    addToHistory({ role: 'system', content: eatMessage });

    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Ate a meal (${meal.cost} reales). Energy restored by ${meal.energy}.`
    });
  }, [applyResourceChanges, turnNumber, gameState.date, updateWealth, addToHistory, addJournalEntry]);

  /**
   * Handle forage completion
   * Adds foraged items to inventory, awards XP, deducts energy, advances time
   */
  const handleForageComplete = useCallback(async (forageResult) => {
    console.log('[Forage] Completing forage action:', forageResult);

    if (forageResult.foundItem && forageResult.item) {
      const item = forageResult.item;

      updateInventory(item.name, forageResult.quantity, 'foraged');
      await generateNewItemDetails(item.name);

      if (forageResult.rarity === 'rare') {
        toast.success(`✨ Rare find! You discovered ${forageResult.quantity}x ${item.name}!`, { duration: 5000 });
      } else if (forageResult.rarity === 'uncommon') {
        toast.success(`🌟 Uncommon find! You found ${forageResult.quantity}x ${item.name}.`, { duration: 4000 });
      }

      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: `Foraged at ${gameState.location}. Found ${forageResult.quantity}x ${item.name} (${forageResult.rarity}). ${item.message || ''}`
      });

      // Award herbalism skill XP (only when item found)
      if (typeof awardSkillXP === 'function') {
        awardSkillXP('herbalism', forageResult.rarity === 'rare' ? 10 : forageResult.rarity === 'uncommon' ? 6 : 3);
      }

      const forageMessage = `*You foraged at ${gameState.location} and found ${forageResult.quantity}x ${item.name}. ${item.message || ''}*`;
      addToHistory({ role: 'system', content: forageMessage });
    } else if (forageResult.foundNothing) {
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: `Foraged at ${gameState.location}. Found nothing this time.`
      });

      const forageMessage = `*You searched ${gameState.location} for useful materials, but found nothing of value.*`;
      addToHistory({ role: 'system', content: forageMessage });
    }

    // Award XP for foraging (+1 XP per forage, regardless of result)
    if (typeof awardXP === 'function') {
      const itemName = forageResult.foundItem && forageResult.item ? forageResult.item.name : 'nothing';
      awardXP(1, `foraging_${itemName}`);
      console.log(`[XP] Awarded 1 XP for foraging (found: ${itemName})`);
    }

    const newEnergy = Math.max(0, energy - forageResult.energyCost);
    setEnergy(newEnergy);

    applyResourceChanges('forage', {
      energyBonus: -forageResult.energyCost
    });

    const timeData = {
      time: gameState.time,
      date: gameState.date,
      location: gameState.location
    };
    advanceTime(timeData, forageResult.timeCost);

    console.log('[Forage] Forage complete - energy:', newEnergy, 'time advanced:', forageResult.timeCost, 'minutes');
  }, [
    updateInventory,
    generateNewItemDetails,
    addJournalEntry,
    turnNumber,
    gameState.date,
    gameState.location,
    gameState.time,
    energy,
    setEnergy,
    applyResourceChanges,
    advanceTime,
    toast,
    awardSkillXP,
    awardXP,
    addToHistory
  ]);

  return {
    applyResourceChanges,
    handleEat,
    handleForageComplete,
  };
}
