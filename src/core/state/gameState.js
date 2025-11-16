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
      compounds: [],
      time: startingState.time,
      date: startingState.date,
      location: startingState.location,
      locationType: 'shop', // NEW: Structured location type (shop = Botica de la Amargura)
      biome: 'city-mexico', // NEW: Geographical biome (Mexico City = city-mexico)
      turnNumber: 1,
      isGameOver: false,
      endQuestResult: null,
      assessmentTriggered: false,
      unlockedMethods: startingState.unlockedMethods,
      shopSign: {
        hung: false  // Track whether shop sign is displayed
      },
      crisis: {
        active: false,
        reason: null,
        context: null
      },
      // Title and profession (level/XP now managed by playerSkills)
      playerTitle: startingState.character.title,
      chosenProfession: null, // null until Level 5 choice
      // Core player stats - single source of truth
      wealth: startingWealth,
      health: 85,
      energy: 62,
      status: 'calm', // Emotional state from StateAgent (default: calm)
      activeEffects: [], // Body effects (hallucinating, poisoned, blessed, etc.)
      // Medical records system - tracks all patients Maria has actually treated
      medicalRecords: {}, // { [patientId]: { patientInfo, sessions: [...] } }
      // Scheduled follow-up visits - tracks patients who should return
      scheduledFollowUps: [], // [{ patientId, patientName, scheduledTurn, priority }]
      // NPC Commerce system - tracks trade opportunities and history
      tradeOpportunities: [], // Active trade opportunities from narrative
      tradeHistory: {}, // { [npcId]: [transactions...] }
      // Document library - tracks all received documents (letters, codices, maps, etc.)
      documents: [], // [{ name, type, metadata, dateReceived, turnReceived, read }]
      // Gambling history - tracks all gambling interactions
      gamblingHistory: {
        byNPC: {}, // { [npcName]: { totalWins, totalLosses, netGain, lastGameType, lastInteraction } }
        recentGames: [], // Last 10 games: [{ npcName, gameType, result: 'win'|'lose', amount, turnNumber }]
        currentStreak: { type: null, count: 0 } // Track win/loss streaks
      },
      // Extortion history - tracks all extortion attempts and responses
      extortionHistory: {
        byNPC: {}, // { [npcName]: { timesPaid, timesRefused, timesNegotiated, timesReported, lastAmount, lastResponse, lastTurn, threatenerType } }
        activeProtection: [], // NPCs/patrons providing protection: [{ protectorName, expiresOnTurn }]
        pendingRetaliation: [] // Scheduled retaliations: [{ npcName, triggerTurn, retaliationType, severity }]
      },
      // Pending consequences - events scheduled to trigger in future turns
      pendingConsequences: [], // [{ type, triggerTurn, data, description }]
      // Investment system - track active investments and history
      investments: {
        active: [], // Active investments: [{ id, typeId, type, emoji, amount, startDate, maturityDate, duration, status, riskLevel }]
        history: [], // Completed investments: [{ id, typeId, type, amount, payout, profit, returnPercentage, outcome, completedDate }]
        maturedThisTurn: [] // Investments that matured this turn (cleared after notification)
      },
      // Story NPC encounters - replaces legacy quests with dynamic interactions
      storyNpcStatus: {}, // { [npcId]: { state, lastTurn, lastOutcome } }

      // Long-distance travel system - tracks visited locations and routes
      playthroughSeed: Math.random().toString(36).substring(2, 15), // Unique seed for this playthrough (for randomization)
      visitedWorldLocations: ['mexico-city'], // Array of visited world location IDs
      worldLocationId: 'mexico-city', // Current world location ID (null if not at a world location)
    };
  } catch (error) {
    console.error('Failed to load scenario, using fallback:', error);
    // Fallback to hardcoded 1680 Mexico City if scenario loading fails
    return {
      scenarioId: '1680-mexico-city',
      inventory: getRandomInventory(),
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
      crisis: {
        active: false,
        reason: null,
        context: null
      },
      // Title and profession (fallback values - level/XP now managed by playerSkills)
      playerTitle: 'Independent Apothecary',
      chosenProfession: null, // null until Level 5 choice
      // Core player stats - single source of truth
      wealth: startingWealth,
      health: 85,
      energy: 62,
      status: 'calm', // Emotional state from StateAgent (default: calm)
      activeEffects: [], // Body effects (hallucinating, poisoned, blessed, etc.)
      // Medical records system - tracks all patients Maria has actually treated
      medicalRecords: {}, // { [patientId]: { patientInfo, sessions: [...] } }
      // Scheduled follow-up visits - tracks patients who should return
      scheduledFollowUps: [], // [{ patientId, patientName, scheduledTurn, priority }]
      // NPC Commerce system - tracks trade opportunities and history
      tradeOpportunities: [], // Active trade opportunities from narrative
      tradeHistory: {}, // { [npcId]: [transactions...] }
      // Document library - tracks all received documents (letters, codices, maps, etc.)
      documents: [], // [{ name, type, metadata, dateReceived, turnReceived, read }]
      // Gambling history - tracks all gambling interactions
      gamblingHistory: {
        byNPC: {}, // { [npcName]: { totalWins, totalLosses, netGain, lastGameType, lastInteraction } }
        recentGames: [], // Last 10 games: [{ npcName, gameType, result: 'win'|'lose', amount, turnNumber }]
        currentStreak: { type: null, count: 0 } // Track win/loss streaks
      },
      // Extortion history - tracks all extortion attempts and responses
      extortionHistory: {
        byNPC: {}, // { [npcName]: { timesPaid, timesRefused, timesNegotiated, timesReported, lastAmount, lastResponse, lastTurn, threatenerType } }
        activeProtection: [], // NPCs/patrons providing protection: [{ protectorName, expiresOnTurn }]
        pendingRetaliation: [] // Scheduled retaliations: [{ npcName, triggerTurn, retaliationType, severity }]
      },
      // Pending consequences - events scheduled to trigger in future turns
      pendingConsequences: [], // [{ type, triggerTurn, data, description }]
      // Investment system - track active investments and history
      investments: {
        active: [], // Active investments: [{ id, typeId, type, emoji, amount, startDate, maturityDate, duration, status, riskLevel }]
        history: [], // Completed investments: [{ id, typeId, type, amount, payout, profit, returnPercentage, outcome, completedDate }]
        maturedThisTurn: [] // Investments that matured this turn (cleared after notification)
      },
      // Story NPC encounters
      storyNpcStatus: {},

      // Long-distance travel system - tracks visited locations and routes
      playthroughSeed: Math.random().toString(36).substring(2, 15), // Unique seed for this playthrough (for randomization)
      visitedWorldLocations: ['mexico-city'], // Array of visited world location IDs
      worldLocationId: 'mexico-city', // Current world location ID (null if not at a world location)
    };
  }
};

// Initial game state hook
export const useGameState = (scenarioId, loadedSaveData = null) => {
  const [gameState, setGameState] = useState(() => {
    // If loaded save data exists, use it instead of initializing new game
    if (loadedSaveData && loadedSaveData.gameState) {
      console.log('[useGameState] Loading from save data');
      return loadedSaveData.gameState;
    }

    console.log('[useGameState] Initializing new game');
    return initializeGameState(scenarioId);
  });

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

  // Update inventory logic
  const updateInventory = useCallback((updateItemName, quantityChange) => {
    // Safety check: prevent null/undefined errors
    if (!updateItemName || typeof updateItemName !== 'string') {
      console.warn('[updateInventory] Invalid item name:', updateItemName);
      return;
    }

    console.log('[gameState] updateInventory called:', updateItemName, 'change:', quantityChange);

    setGameState((prevState) => {
      let updatedInventory = prevState.inventory.map((item) => {
        if (item.name && item.name.toLowerCase() === updateItemName.toLowerCase()) {
          const newQuantity = item.quantity + quantityChange;
          console.log('[gameState] Updated item:', item.name, 'from', item.quantity, 'to', newQuantity);
          return { ...item, quantity: Math.max(0, newQuantity) };
        }
        return item;
      });

      const itemExists = updatedInventory.some(item => item.name && item.name.toLowerCase() === updateItemName.toLowerCase());
      if (!itemExists) {
        console.log('[gameState] Item not found, looking for new item:', updateItemName);
        console.log('[gameState] Current inventory items:', updatedInventory.map(i => i.name).join(', '));
        const newItem = potentialInventoryItems[updateItemName.toLowerCase()];
        if (newItem) {
          console.log('[gameState] Adding new item from potentialInventoryItems');
          updatedInventory = [...updatedInventory, { ...newItem, quantity: quantityChange }];

          // Track this as the last added item (only when adding, not removing)
          if (quantityChange > 0) {
            setLastAddedItem({ ...newItem, quantity: quantityChange });
          }
        } else if (quantityChange < 0) {
          // Trying to remove an item that doesn't exist - log warning
          console.warn(`[gameState] ⚠️ Cannot remove "${updateItemName}" - not in inventory. Available: ${updatedInventory.map(i => i.name).join(', ')}`);
        }
      } else if (quantityChange > 0) {
        // Item already exists but quantity increased - track it
        const updatedItem = updatedInventory.find(item => item.name && item.name.toLowerCase() === updateItemName.toLowerCase());
        if (updatedItem) {
          setLastAddedItem({ ...updatedItem });
        }
      }

      const filteredInventory = updatedInventory.filter(item => item.quantity > 0);
      console.log('[gameState] Final inventory count:', filteredInventory.length);
      return { ...prevState, inventory: filteredInventory };
    });
  }, []);

  // Add compound to inventory logic
  const addCompoundToInventory = useCallback((compound) => {
    if (!compound || typeof compound !== 'object' || !compound.name) {
      console.error('Invalid compound:', compound);
      return;
    }

    // Sanitize quantity to ensure it's a number (LLM sometimes returns strings)
    const sanitizedCompound = {
      ...compound,
      quantity: typeof compound.quantity === 'string'
        ? parseInt(compound.quantity, 10) || 1
        : (compound.quantity || 1)
    };

    setGameState((prevState) => {
      const updatedInventory = [...prevState.inventory]; // Create a new array for immutability
      const existingItemIndex = updatedInventory.findIndex(
        (item) => item.name.toLowerCase() === sanitizedCompound.name.toLowerCase()
      );

      if (existingItemIndex >= 0) {
        updatedInventory[existingItemIndex].quantity += sanitizedCompound.quantity;
      } else {
        updatedInventory.push({ ...sanitizedCompound });
      }

      return {
        ...prevState,
        inventory: updatedInventory,
        compounds: [...prevState.compounds, { ...sanitizedCompound }],
      };
    });

    // NEW: Set the last added item
    setLastAddedItem(sanitizedCompound);
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
    } else if (summaryData && summaryData.minutes !== undefined) {
      // Handle incremental time advancement by minutes
      const currentTime = new Date(`${prevState.date} ${prevState.time}`);
      currentTime.setMinutes(currentTime.getMinutes() + summaryData.minutes);

      newTime = currentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // Check if date rolled over to next day
      const currentDate = new Date(prevState.date);
      if (currentTime.toDateString() !== currentDate.toDateString()) {
        newDate = currentTime.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        dayChanged = true;
      }
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

    // Check for matured investments
    let updatedInvestments = { ...prevState.investments };
    if (prevState.investments && prevState.investments.active && prevState.investments.active.length > 0) {
      const activeInvestments = prevState.investments.active || [];
      const maturedInvestments = [];
      const stillActiveInvestments = [];

      // Import investment utilities dynamically
      const { hasMatured } = require('../../../features/commerce/utils/investmentCalculator');
      const { calculateInvestmentOutcome } = require('../../../features/commerce/utils/investmentCalculator');
      const { getAllInvestmentTypes } = require('../../../features/commerce/data/investmentTypes');

      activeInvestments.forEach(investment => {
        if (hasMatured(investment, newDate)) {
          // Get investment type definition
          const investmentType = getAllInvestmentTypes().find(t => t.id === investment.typeId);

          if (investmentType) {
            // Calculate outcome (without async LLM narrative for now)
            const result = calculateInvestmentOutcome(investment, investmentType, prevState.playerSkills || {}, prevState.reputation || {});

            // Add to wealth
            newWealth += result.payout;

            // Create history entry
            const historyEntry = {
              id: investment.id,
              typeId: investment.typeId,
              type: investment.type,
              amount: investment.amount,
              payout: result.payout,
              profit: result.profit,
              returnPercentage: result.returnPercentage,
              outcome: result.outcome.label,
              outcomeDescription: result.outcome.description,
              completedDate: newDate,
              startDate: investment.startDate,
              maturityDate: investment.maturityDate
            };

            maturedInvestments.push(historyEntry);
            console.log(`[Investment] Matured: ${investment.type} - ${result.payout} reales (${result.returnPercentage >= 0 ? '+' : ''}${result.returnPercentage}%)`);
          } else {
            console.warn(`[Investment] Unknown investment type: ${investment.typeId}`);
            stillActiveInvestments.push(investment);
          }
        } else {
          stillActiveInvestments.push(investment);
        }
      });

      // Update investments state
      updatedInvestments = {
        active: stillActiveInvestments,
        history: [
          ...(maturedInvestments || []),
          ...(prevState.investments.history || [])
        ],
        maturedThisTurn: maturedInvestments // Store for toast notifications
      };

      // Log summary if any investments matured
      if (maturedInvestments.length > 0) {
        console.log(`[Investment] ${maturedInvestments.length} investment(s) matured. New wealth: ${newWealth}`);
      }
    }

    return {
      ...prevState,
      time: newTime,
      date: newDate,
      wealth: newWealth,
      investments: updatedInvestments,
    };
  });
}, []);

  /**
   * Clear matured investments notification
   */
  const clearMaturedInvestments = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      investments: {
        ...prev.investments,
        maturedThisTurn: []
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

  const setCrisisState = useCallback((updater) => {
    setGameState((prevState) => {
      const current = prevState.crisis || { active: false, reason: null, context: null };
      const next = typeof updater === 'function' ? updater(current, prevState) : updater || {};
      return {
        ...prevState,
        crisis: {
          ...current,
          ...next
        }
      };
    });
  }, []);

  const clearCrisisState = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      crisis: {
        active: false,
        reason: null,
        context: null
      }
    }));
  }, []);

  // ============================================
  // STORY NPC TRACKING (replaces legacy quests)
  // ============================================

  const updateStoryNpcStatus = useCallback((npcId, updates = {}) => {
    if (!npcId) return;
    setGameState(prev => ({
      ...prev,
      storyNpcStatus: {
        ...(prev.storyNpcStatus || {}),
        [npcId]: {
          ...(prev.storyNpcStatus?.[npcId] || {}),
          ...updates
        }
      }
    }));
  }, []);

  const resetStoryNpcStatus = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      storyNpcStatus: {}
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
  // NPC COMMERCE SYSTEM
  // ============================================

  /**
   * Add a trade opportunity
   * @param {Object} opportunity - Trade opportunity object
   */
  const addTradeOpportunity = useCallback((opportunity) => {
    setGameState(prev => ({
      ...prev,
      tradeOpportunities: [...prev.tradeOpportunities, {
        ...opportunity,
        id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        turnOffered: prev.turnNumber,
        expiresAtTurn: prev.turnNumber + 5 // Expires after 5 turns
      }]
    }));
    console.log('[TradeSystem] Added trade opportunity:', opportunity.npcName);
  }, []);

  /**
   * Remove a trade opportunity
   * @param {string} opportunityId - Opportunity ID to remove
   */
  const removeTradeOpportunity = useCallback((opportunityId) => {
    setGameState(prev => ({
      ...prev,
      tradeOpportunities: prev.tradeOpportunities.filter(opp => opp.id !== opportunityId)
    }));
  }, []);

  /**
   * Add a trade transaction to history
   * @param {string} npcId - NPC ID
   * @param {Object} transaction - Transaction data
   */
  const addTradeTransaction = useCallback((npcId, transaction) => {
    setGameState(prev => {
      const npcHistory = prev.tradeHistory[npcId] || [];
      return {
        ...prev,
        tradeHistory: {
          ...prev.tradeHistory,
          [npcId]: [...npcHistory, {
            ...transaction,
            id: `transaction-${Date.now()}`,
            turn: prev.turnNumber,
            date: prev.date
          }]
        }
      };
    });
    console.log('[TradeSystem] Added transaction:', transaction);
  }, []);

  /**
   * Get trade history for an NPC
   * @param {string} npcId - NPC ID
   * @returns {Array} Transaction history
   */
  const getTradeHistory = useCallback((npcId) => {
    return gameState.tradeHistory[npcId] || [];
  }, [gameState.tradeHistory]);

  /**
   * Clean up expired trade opportunities
   */
  const cleanupExpiredOpportunities = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      tradeOpportunities: prev.tradeOpportunities.filter(
        opp => opp.expiresAtTurn > prev.turnNumber
      )
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
    try {
      console.log('[Profession] chooseProfession called with:', { professionId, playerLevel });

      setGameState(prev => {
        if (prev.chosenProfession) {
          console.warn('[Profession] Profession already chosen:', prev.chosenProfession);
          return prev;
        }

        console.log(`[Profession] Choosing profession: ${professionId}`);

        // Update title to profession base title (requires playerLevel from playerSkills)
        let newTitle;
        try {
          newTitle = getPlayerTitle(playerLevel, professionId, {});
          console.log('[Profession] Generated title:', newTitle);
        } catch (titleError) {
          console.error('[Profession] Error generating title:', titleError);
          newTitle = 'Apothecary'; // Fallback title
        }

        const newState = {
          ...prev,
          chosenProfession: professionId,
          playerTitle: newTitle
        };

        console.log('[Profession] Updated state:', newState);
        return newState;
      });

      console.log('[Profession] State update completed successfully');
    } catch (error) {
      console.error('[Profession] Error in chooseProfession:', error);
      throw error; // Re-throw so GamePage can handle it
    }
  }, []);

  // Document library management functions
  const addDocument = useCallback((documentData) => {
    setGameState((prevState) => {
      // Check if document already exists
      const existingDoc = prevState.documents.find(doc => doc.name === documentData.name);
      if (existingDoc) {
        console.log('[Documents] Document already in library:', documentData.name);
        return prevState;
      }

      console.log('[Documents] Adding document to library:', documentData.name);
      return {
        ...prevState,
        documents: [...prevState.documents, {
          ...documentData,
          read: false // Initially unread
        }]
      };
    });
  }, []);

  const markDocumentAsRead = useCallback((documentName) => {
    setGameState((prevState) => ({
      ...prevState,
      documents: prevState.documents.map(doc =>
        doc.name === documentName ? { ...doc, read: true } : doc
      )
    }));
  }, []);

  const getDocuments = useCallback(() => {
    return gameState.documents || [];
  }, [gameState.documents]);

  const getUnreadDocumentsCount = useCallback(() => {
    return (gameState.documents || []).filter(doc => !doc.read).length;
  }, [gameState.documents]);

  // ============================================
  // INVESTMENT MANAGEMENT
  // ============================================

  /**
   * Add an active investment
   * @param {Object} investment - Investment data
   */
  const addActiveInvestment = useCallback((investment) => {
    setGameState((prev) => {
      const newInvestment = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...investment,
        status: 'active'
      };

      console.log('[Investment] Adding active investment:', newInvestment);

      return {
        ...prev,
        investments: {
          ...prev.investments,
          active: [...(prev.investments?.active || []), newInvestment]
        }
      };
    });
  }, []);

  /**
   * Get active investments
   * @returns {Array} Active investments
   */
  const getActiveInvestments = useCallback(() => {
    return gameState.investments?.active || [];
  }, [gameState.investments]);

  /**
   * Get investment history
   * @returns {Array} Completed investments
   */
  const getInvestmentHistory = useCallback(() => {
    return gameState.investments?.history || [];
  }, [gameState.investments]);

  // ============================================
  // FOLLOW-UP VISIT MANAGEMENT
  // ============================================

  /**
   * Add a scheduled follow-up visit
   * @param {Object} followUp - Follow-up data { patientId, patientName, scheduledTurn, priority }
   */
  const addScheduledFollowUp = useCallback((followUp) => {
    setGameState((prev) => {
      // BUG FIX #6: Add null check for scheduledFollowUps (backwards compatibility with old saves)
      const existingFollowUps = prev.scheduledFollowUps || [];

      // Check if already scheduled (prevent duplicates)
      const alreadyScheduled = existingFollowUps.some(
        f => f.patientId === followUp.patientId
      );

      if (alreadyScheduled) {
        console.log(`[FollowUps] Patient ${followUp.patientName} already has a follow-up scheduled`);
        return prev;
      }

      console.log(`[FollowUps] Adding follow-up for ${followUp.patientName} at turn ${followUp.scheduledTurn}`);
      return {
        ...prev,
        scheduledFollowUps: [...existingFollowUps, followUp]
      };
    });
  }, []);

  /**
   * Remove a scheduled follow-up visit
   * @param {string} patientId - Patient ID to remove
   */
  const removeScheduledFollowUp = useCallback((patientId) => {
    setGameState((prev) => ({
      ...prev,
      // BUG FIX #6: Add null check for scheduledFollowUps (backwards compatibility with old saves)
      scheduledFollowUps: (prev.scheduledFollowUps || []).filter(
        f => f.patientId !== patientId
      )
    }));
    console.log(`[FollowUps] Removed follow-up for patient: ${patientId}`);
  }, []);

  /**
   * Update a scheduled follow-up visit
   * @param {string} patientId - Patient ID
   * @param {Object} updates - Updates to apply
   */
  const updateScheduledFollowUp = useCallback((patientId, updates) => {
    setGameState((prev) => ({
      ...prev,
      // BUG FIX #6: Add null check for scheduledFollowUps (backwards compatibility with old saves)
      scheduledFollowUps: (prev.scheduledFollowUps || []).map(f =>
        f.patientId === patientId ? { ...f, ...updates } : f
      )
    }));
    console.log(`[FollowUps] Updated follow-up for patient: ${patientId}`);
  }, []);

  /**
   * Get all scheduled follow-ups
   * @returns {Array} Scheduled follow-ups
   */
  const getScheduledFollowUps = useCallback(() => {
    return gameState.scheduledFollowUps || [];
  }, [gameState.scheduledFollowUps]);

  /**
   * Get scheduled follow-ups that are due now
   * @param {number} currentTurn - Current turn number
   * @returns {Array} Due follow-ups
   */
  const getDueFollowUps = useCallback((currentTurn) => {
    return (gameState.scheduledFollowUps || []).filter(
      f => f.scheduledTurn <= currentTurn
    );
  }, [gameState.scheduledFollowUps]);

  return {
    gameState,
    updateInventory,
    setGameState,
    updateLocation,
    addCompoundToInventory,
    generateNewItemDetails,
    refreshInventory,

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
    setCrisisState,
    clearCrisisState,
    updateStoryNpcStatus,
    resetStoryNpcStatus,

    // Core player stats
    updateWealth,
    setWealth,
    updateHealth,
    setHealth,
    updateEnergy,
    setEnergy,

    // Profession system (level/XP managed by playerSkills)
    chooseProfession,

    // NPC Commerce system
    addTradeOpportunity,
    removeTradeOpportunity,
    addTradeTransaction,
    getTradeHistory,
    cleanupExpiredOpportunities,

    // Document library system
    addDocument,
    markDocumentAsRead,
    getDocuments,
    getUnreadDocumentsCount,

    // Investment system
    addActiveInvestment,
    getActiveInvestments,
    getInvestmentHistory,
    clearMaturedInvestments,

    // Follow-up visit system
    addScheduledFollowUp,
    removeScheduledFollowUp,
    updateScheduledFollowUp,
    getScheduledFollowUps,
    getDueFollowUps,
  };
};
