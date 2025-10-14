// gameState.js
import React, { useState, useEffect, useCallback } from 'react';
import { initialInventoryData, potentialInventoryItems } from '../../initialInventory';
import { createChatCompletion } from '../services/llmService';
import { scenarioLoader } from '../services/scenarioLoader';
import { getPlayerTitle } from '../systems/levelingSystem';
import { getPassiveIncomePerDay } from '../systems/professionAbilities';

// Fisher-Yates shuffle function to shuffle the array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Function to get a random selection of 20 items from the full inventory
const getRandomInventory = () => {
  const inventorySet = new Set();
  while (inventorySet.size < 20) {
    const randomIndex = Math.floor(Math.random() * initialInventoryData.length);
    inventorySet.add(initialInventoryData[randomIndex]);
  }
  return Array.from(inventorySet);
};

/**
 * Initialize game state from scenario
 * @param {string} scenarioId - Scenario identifier
 * @returns {Object} Initial game state
 */
const initializeGameState = (scenarioId = '1680-mexico-city') => {
  // Generate random starting wealth between 5 and 25 reales
  const startingWealth = Math.floor(Math.random() * 21) + 17;

  try {
    const startingState = scenarioLoader.getStartingState(scenarioId);

    // Get random selection of 15 items from starting inventory
    const shuffled = shuffleArray([...startingState.inventory]);
    const randomInventory = shuffled.slice(0, 15);

    return {
      scenarioId: startingState.scenarioId,
      inventory: randomInventory,
      quests: {
        active: [],      // Active quests (new system)
        completed: [],   // Completed quest IDs
        failed: [],      // Failed quest IDs
        cooldowns: {},   // Quest template cooldowns
        legacy: []       // Old quest system (backward compatibility)
      },
      compounds: [],
      time: startingState.time,
      date: startingState.date,
      location: startingState.location,
      turnNumber: 1,
      isGameOver: false,
      endQuestResult: null,
      assessmentTriggered: false,
      unlockedMethods: startingState.unlockedMethods,
      shopSign: {
        hung: false  // Track whether shop sign is displayed
      },
      // Title and profession (level/XP now managed by playerSkills)
      playerTitle: startingState.character.title,
      chosenProfession: null, // null until Level 5 choice
      // Core player stats - single source of truth
      wealth: startingWealth,
      health: 85,
      energy: 62,
    };
  } catch (error) {
    console.error('Failed to load scenario, using fallback:', error);
    // Fallback to hardcoded 1680 Mexico City if scenario loading fails
    return {
      scenarioId: '1680-mexico-city',
      inventory: getRandomInventory(),
      quests: {
        active: [],      // Active quests (new system)
        completed: [],   // Completed quest IDs
        failed: [],      // Failed quest IDs
        cooldowns: {},   // Quest template cooldowns
        legacy: []       // Old quest system (backward compatibility)
      },
      compounds: [],
      time: '8:00 AM',
      date: 'August 22, 1680',
      location: 'Botica de la Amurgura, Mexico City',
      turnNumber: 1,
      isGameOver: false,
      endQuestResult: null,
      assessmentTriggered: false,
      unlockedMethods: ['Distill', 'Decoct', 'Calcinate', 'Confection'],
      shopSign: {
        hung: false  // Track whether shop sign is displayed
      },
      // Title and profession (fallback values - level/XP now managed by playerSkills)
      playerTitle: 'Independent Apothecary',
      chosenProfession: null, // null until Level 5 choice
      // Core player stats - single source of truth
      wealth: startingWealth,
      health: 85,
      energy: 62,
    };
  }
};

// Initial game state hook
export const useGameState = (scenarioId) => {
  const [gameState, setGameState] = useState(() => initializeGameState(scenarioId));

  const [lastAddedItem, setLastAddedItem] = useState(null);

  // Function to unlock a new mixing method
 const unlockMethod = useCallback((methodName) => {
  setGameState((prevState) => {
    if (!prevState.unlockedMethods.includes(methodName)) {
      return {
        ...prevState,
        unlockedMethods: [...prevState.unlockedMethods, methodName],
      };
    }
    return prevState;
  });
}, []);

  // Function to trigger the Game Over process based on the result of any quest
  const triggerGameOver = useCallback((result) => {
    setGameState((prevState) => ({
      ...prevState,
      isGameOver: true,  // Mark the game as over
      endQuestResult: result,  // Save the result of the quest (e.g., success, failure, poisoning)
    }));
  }, []);

  // Function to reset the game state after Game Over
  const resetGameOver = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      isGameOver: false,
      endQuestResult: null,
      assessmentTriggered: false,
    }));
  }, []);

  // Update location
  const updateLocation = useCallback((newLocation) => {
    if (!newLocation) return;

    setGameState((prevState) => ({
      ...prevState,
      location: newLocation, // Update to the new location
    }));
  }, []);

  // Start a new quest
  const startQuest = useCallback((newQuest) => {
    setGameState((prevState) => {
      // Check if the quest already exists
      const existingQuest = prevState.quests.find(quest => quest.id === newQuest.id);
      if (existingQuest) {
        console.warn(`Quest with ID ${newQuest.id} already started.`);
        return prevState; // Prevent adding the same quest twice
      }

      // Add the new quest to the quests array
      return {
        ...prevState,
        quests: [...prevState.quests, { ...newQuest, currentStage: 1, completed: false }],
      };
    });
  }, []);

  // Update inventory logic
  const updateInventory = useCallback((updateItemName, quantityChange) => {
    // Safety check: prevent null/undefined errors
    if (!updateItemName || typeof updateItemName !== 'string') {
      console.warn('[updateInventory] Invalid item name:', updateItemName);
      return;
    }

    setGameState((prevState) => {
      let updatedInventory = prevState.inventory.map((item) => {
        if (item.name && item.name.toLowerCase() === updateItemName.toLowerCase()) {
          const newQuantity = item.quantity + quantityChange;
          return { ...item, quantity: Math.max(0, newQuantity) };
        }
        return item;
      });

      const itemExists = updatedInventory.some(item => item.name && item.name.toLowerCase() === updateItemName.toLowerCase());
      if (!itemExists) {
        const newItem = potentialInventoryItems[updateItemName.toLowerCase()];
        if (newItem) {
          updatedInventory = [...updatedInventory, { ...newItem, quantity: quantityChange }];
        }
      }

      const filteredInventory = updatedInventory.filter(item => item.quantity > 0);
      return { ...prevState, inventory: filteredInventory };
    });
  }, []);

  // Add compound to inventory logic
  const addCompoundToInventory = useCallback((compound) => {
    if (!compound || typeof compound !== 'object' || !compound.name) {
      console.error('Invalid compound:', compound);
      return;
    }

    setGameState((prevState) => {
      const updatedInventory = [...prevState.inventory]; // Create a new array for immutability
      const existingItemIndex = updatedInventory.findIndex(
        (item) => item.name.toLowerCase() === compound.name.toLowerCase()
      );

      if (existingItemIndex >= 0) {
        updatedInventory[existingItemIndex].quantity += (compound.quantity || 1);
      } else {
        updatedInventory.push({ ...compound });
      }

      return {
        ...prevState,
        inventory: updatedInventory,
        compounds: [...prevState.compounds, { ...compound }],
      };
    });

    // NEW: Set the last added item
    setLastAddedItem(compound);
  }, []);

  // NEW: Function to clear the last added item after it's handled
  const clearLastAddedItem = useCallback(() => {
    setLastAddedItem(null);
  }, []);

  // Function to generate new item details
  const generateNewItemDetails = useCallback(async (itemName) => {
    const prompt = `Generate details for an item named "${itemName}" in JSON format. The item could be anything appropriate to a 17th-century historical setting, such as a letter, tool, weapon, clothing, materia medica, animal, or any other object. Everything from cats and dogs and monkeys to clothing to food to spices is possible to be an item. 
    The following fields must be included in your output in exactly this format:

name (string): The name of the item in English.
latinName (string): The Latin name of the item.
spanishName (string): The name of the item in Spanish.
price (integer): The price in silver coins (range: 1-20).
quantity (integer): The default quantity of the item (range: 1-5).
humoralQualities (string): Describe its qualities according to humoral theory (e.g., "Warm & Moist").
medicinalEffects (string): The specific effects it has on health and the body; if it has none, say so. 
description (string): A brief, historically plausible description of the item.
emoji (single emoji character): Choose a SINGLE emoji to represent the item, for instance 🥃 for rum, ☄️ for red sulphur, or 🐌 for snailwater. Be very creative here. 
Ensure the JSON is valid and uses double quotes for keys and string values.

Here are two examples of expected formatting:

Example 1: "Monkey" (Animal)

{
  "name": "Monkey",
  "latinName": "Simia",
  "spanishName": "Mono",
  "price": 25,
  "quantity": 1,
  "humoralQualities": "Warm & Moist",
  "medicinalEffects": "Monkeys are sometimes used in exotic medicinal recipes and believed to bring warmth and vitality.",
  "description": "A rare and lively pet, considered a luxury in 17th-century Mexico. Monkeys are often prized for their exotic nature.",
  "emoji": "🐒"
}
Example 2: "Peyote" (Plant)

{
  "name": "Peyote",
  "latinName": "Lophophora williamsii",
  "spanishName": "Peyote",
  "price": 10,
  "quantity": 1,
  "humoralQualities": "Hot & Dry",
  "medicinalEffects": "Used for spiritual healing and to treat ailments of the mind and spirit, inducing visions.",
  "description": "A sacred cactus used in religious ceremonies by indigenous peoples, known for its hallucinogenic properties.",
  "emoji": "🌵"
}
Ensure the JSON is valid and uses double quotes for keys and string values.
1. Start with an opening curly brace {
2. End with a closing curly brace }
3. Have all keys in double quotes
4. Have all string values in double quotes
5. Not have any trailing commas
6. Not have any comments or additional text outside the JSON structure

If your response doesn't meet these criteria, please correct it before returning.`;

    try {
      const messages = [
        {
          role: 'system',
          content: `You are an assistant that generates JSON data for items purchased in an educational game set in 1680 Mexico City. Use your historical knowledge to create accurate entries. Always return a valid JSON object with the exact fields specified, using double quotes for keys and string values. Here's an example of the expected format:
{
  "name": "Saffron",
  "latinName": "Crocus sativus",
  "spanishName": "Azafrán",
  "price": 15,
  "quantity": 1,
  "humoralQualities": "Warm & Dry",
  "medicinalEffects": "Used to alleviate melancholy, improve digestion, and treat coughs.",
  "description": "Highly valued spice derived from the stigmas of Crocus flowers, often mixed in compound drugs.",
  "emoji": "🌸"
}
Ensure that the JSON is correctly formatted and includes all required fields.`,
        },
        { role: 'user', content: prompt }
      ];

      const data = await createChatCompletion(messages, 0.4);
      let newItemDetails;

      try {
        newItemDetails = JSON.parse(data.choices[0].message.content);

        // Add the new item to the inventory and compounds
        addCompoundToInventory({
          ...newItemDetails,
          name: itemName,
        });
      } catch (error) {
        console.error("Error parsing new item details:", error);
      }

    } catch (error) {
      console.error("Error generating new item details:", error);
    }
  }, [addCompoundToInventory]);

  // Function to ensure that inventory updates are immediately reflected in the game state
  const refreshInventory = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      inventory: [...prevState.inventory],
      compounds: [...prevState.compounds]  // Add this line to refresh compounds as well
    }));
  }, []);

const advanceTime = useCallback((summaryData, playerLevel = 1) => {
  setGameState((prevState) => {
    let newTime = prevState.time;
    let newDate = prevState.date;
    let dayChanged = false;

    if (summaryData && summaryData.time && summaryData.date) {
      const prevDate = new Date(prevState.date);
      const newJournalDate = new Date(summaryData.date);

      if (newJournalDate < prevDate) {
        console.warn('JournalAgent returned an earlier date. Ignoring and requesting correction...');
        return prevState;
      }

      // Check if date changed
      dayChanged = prevDate.toDateString() !== newJournalDate.toDateString();

      newTime = summaryData.time;
      newDate = summaryData.date;
    } else {
      const currentTime = new Date(`August 22, 1680 ${prevState.time}`);
      currentTime.setHours(currentTime.getHours() + 3); // Increment by 3 hours
      newTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (currentTime.getHours() === 0) {
        const currentDate = new Date(prevState.date);
        currentDate.setDate(currentDate.getDate() + 1);
        newDate = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        dayChanged = true;
      }
    }

    // Court Physician passive income (awarded once per day)
    // Note: playerLevel is now passed from GamePage (from playerSkills.level)
    let newWealth = prevState.wealth;
    if (dayChanged && prevState.chosenProfession) {
      const passiveIncome = getPassiveIncomePerDay(prevState.chosenProfession, playerLevel);
      if (passiveIncome > 0) {
        newWealth += passiveIncome;
        console.log(`[Court Physician] Passive income: +${passiveIncome} reales (new wealth: ${newWealth})`);
        // Note: UI notification will be handled by GamePage detecting wealth change
      }
    }

    return {
      ...prevState,
      time: newTime,
      date: newDate,
      wealth: newWealth,
    };
  });
}, []);

  // ============================================
  // OLD QUEST SYSTEM (Legacy - backward compatibility)
  // ============================================

  // Advance quest to the next stage (OLD SYSTEM)
  const advanceQuestStage = useCallback((questId) => {
    setGameState(prevState => ({
      ...prevState,
      quests: {
        ...prevState.quests,
        legacy: prevState.quests.legacy.map(quest =>
          quest.id === questId ? { ...quest, currentStage: quest.currentStage + 1 } : quest
        )
      }
    }));
  }, []);

  // Complete a quest (OLD SYSTEM)
  const completeQuest = useCallback((questId) => {
    setGameState(prevState => ({
      ...prevState,
      quests: {
        ...prevState.quests,
        legacy: prevState.quests.legacy.map(quest =>
          quest.id === questId ? { ...quest, completed: true } : quest
        )
      }
    }));
  }, []);

  // ============================================
  // NEW QUEST SYSTEM
  // ============================================

  /**
   * Add an active quest
   * @param {Quest} quest - Quest object to add
   */
  const addActiveQuest = useCallback((quest) => {
    setGameState(prev => ({
      ...prev,
      quests: {
        ...prev.quests,
        active: [...prev.quests.active, quest]
      }
    }));
    console.log(`[GameState] Added active quest: ${quest.id}`);
  }, []);

  /**
   * Update a quest
   * @param {string} questId - Quest ID
   * @param {Object} updates - Updates to apply
   */
  const updateQuest = useCallback((questId, updates) => {
    setGameState(prev => ({
      ...prev,
      quests: {
        ...prev.quests,
        active: prev.quests.active.map(q =>
          q.id === questId ? { ...q, ...updates } : q
        )
      }
    }));
    console.log(`[GameState] Updated quest: ${questId}`);
  }, []);

  /**
   * Complete a quest and move to completed list
   * @param {string} questId - Quest ID to complete
   */
  const completeActiveQuest = useCallback((questId) => {
    setGameState(prev => {
      const quest = prev.quests.active.find(q => q.id === questId);
      if (!quest) {
        console.warn(`[GameState] Quest ${questId} not found in active quests`);
        return prev;
      }

      return {
        ...prev,
        quests: {
          ...prev.quests,
          active: prev.quests.active.filter(q => q.id !== questId),
          completed: [...prev.quests.completed, questId]
        }
      };
    });
    console.log(`[GameState] Completed quest: ${questId}`);
  }, []);

  /**
   * Fail a quest and move to failed list
   * @param {string} questId - Quest ID to fail
   */
  const failQuest = useCallback((questId) => {
    setGameState(prev => {
      const quest = prev.quests.active.find(q => q.id === questId);
      if (!quest) {
        console.warn(`[GameState] Quest ${questId} not found in active quests`);
        return prev;
      }

      return {
        ...prev,
        quests: {
          ...prev.quests,
          active: prev.quests.active.filter(q => q.id !== questId),
          failed: [...prev.quests.failed, questId]
        }
      };
    });
    console.log(`[GameState] Failed quest: ${questId}`);
  }, []);

  /**
   * Set quest cooldown for a template
   * @param {string} templateId - Template ID
   * @param {number} turnNumber - Current turn number
   */
  const setQuestCooldown = useCallback((templateId, turnNumber) => {
    setGameState(prev => ({
      ...prev,
      quests: {
        ...prev.quests,
        cooldowns: {
          ...prev.quests.cooldowns,
          [templateId]: turnNumber
        }
      }
    }));
  }, []);

  // Shop sign toggle
  const toggleShopSign = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      shopSign: {
        ...prevState.shopSign,
        hung: !prevState.shopSign.hung
      }
    }));
  }, []);

  // ============================================
  // CORE PLAYER STATS MANAGEMENT
  // ============================================

  /**
   * Update wealth
   * @param {number} amount - Amount to add (negative to subtract)
   */
  const updateWealth = useCallback((amount) => {
    setGameState(prev => ({
      ...prev,
      wealth: Math.max(0, prev.wealth + amount)
    }));
  }, []);

  /**
   * Set wealth to specific value
   * @param {number} value - New wealth value
   */
  const setWealth = useCallback((value) => {
    setGameState(prev => ({
      ...prev,
      wealth: Math.max(0, value)
    }));
  }, []);

  /**
   * Update health
   * @param {number} amount - Amount to add (negative to subtract)
   */
  const updateHealth = useCallback((amount) => {
    setGameState(prev => ({
      ...prev,
      health: Math.max(0, Math.min(100, prev.health + amount))
    }));
  }, []);

  /**
   * Set health to specific value
   * @param {number} value - New health value (0-100)
   */
  const setHealth = useCallback((value) => {
    setGameState(prev => ({
      ...prev,
      health: Math.max(0, Math.min(100, value))
    }));
  }, []);

  /**
   * Update energy
   * @param {number} amount - Amount to add (negative to subtract)
   */
  const updateEnergy = useCallback((amount) => {
    setGameState(prev => ({
      ...prev,
      energy: Math.max(0, Math.min(100, prev.energy + amount))
    }));
  }, []);

  /**
   * Set energy to specific value
   * @param {number} value - New energy value (0-100)
   */
  const setEnergy = useCallback((value) => {
    setGameState(prev => ({
      ...prev,
      energy: Math.max(0, Math.min(100, value))
    }));
  }, []);

  // ============================================
  // LEVELING & XP MANAGEMENT
  // ============================================
  // PROFESSION SYSTEM
  // ============================================

  /**
   * Set chosen profession (level check handled by GamePage)
   * @param {string} professionId - Profession ID from PROFESSIONS enum
   * @param {number} playerLevel - Current player level (from playerSkills)
   */
  const chooseProfession = useCallback((professionId, playerLevel) => {
    setGameState(prev => {

      if (prev.chosenProfession) {
        console.warn('[Profession] Profession already chosen:', prev.chosenProfession);
        return prev;
      }

      console.log(`[Profession] Chose profession: ${professionId}`);

      // Update title to profession base title (requires playerLevel from playerSkills)
      const newTitle = getPlayerTitle(playerLevel, professionId, {});

      return {
        ...prev,
        chosenProfession: professionId,
        playerTitle: newTitle
      };
    });
  }, []);

  return {
    gameState,
    updateInventory,
    setGameState,
    updateLocation,
    addCompoundToInventory,
    generateNewItemDetails,
    refreshInventory,

    // Legacy quest functions (OLD SYSTEM - backward compatibility)
    startQuest,
    advanceQuestStage,
    completeQuest,

    // New quest functions
    addActiveQuest,
    updateQuest,
    completeActiveQuest,
    failQuest,
    setQuestCooldown,

    // Time & game flow
    advanceTime,
    triggerGameOver,
    resetGameOver,

    // Item management
    lastAddedItem,
    clearLastAddedItem,
    unlockMethod,

    // Shop sign
    toggleShopSign,

    // Core player stats
    updateWealth,
    setWealth,
    updateHealth,
    setHealth,
    updateEnergy,
    setEnergy,

    // Profession system (level/XP managed by playerSkills)
    chooseProfession,
  };
};
