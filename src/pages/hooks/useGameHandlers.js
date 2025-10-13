// useGameHandlers.js
// Custom hook containing all event handlers for GamePage

import { useCallback, useRef } from 'react';
import { orchestrateTurn } from '../../core/agents/AgentOrchestrator';
import { processPatientDialogue } from '../../core/agents/PatientDialogueAgent';
import { enrichPatientData } from '../../core/entities/PatientEnrichment';
import { entityManager } from '../../core/entities/EntityManager';
import { createChatCompletion } from '../../core/services/llmService';
import { buildSystemPrompt } from '../../prompts/promptModules';
import { scenarioLoader } from '../../core/services/scenarioLoader';
import resourceManager from '../../systems/ResourceManager';
import { relationshipGraph } from '../../core/entities/RelationshipGraph';
import { applyRelationshipToReputation } from '../../core/systems/reputationFeedback';
import { getXPForNextLevel, getPlayerTitle } from '../../core/systems/levelingSystem';
import { resolvePortrait } from '../../core/services/portraitResolver';

export function useGameHandlers({
  // State setters
  setWealth,  // Changed from setWealth - now uses gameState
  setMariaStatus,
  setReputation,
  setIncorporatedContent,
  setShowIncorporatePopup,
  setIsJournalOpen,
  setIsInventoryOpen,
  setIsHistoryOpen,
  setIsAboutOpen,
  setIsMapOpen,
  setIsDiagnoseOpen,
  setShowMixingPopup,
  setSelectedPDF,
  setSelectedCitation,
  setIsPdfOpen,
  setSelectedPatient,
  setShowPatientModal,
  setJournal,
  setCustomJournalEntry,
  setEnergy,
  setConsecutiveLowEnergyTurns,
  setHealth,
  setActiveEffects,
  setConversationHistory,
  setIsLoading,
  setHistoryOutput,
  setCurrentEntities,
  setUserInput,
  setSelectedNpcName,
  setShowSymptomsPopup,
  setIsBuyOpen,
  setIsPrescribePopupOpen,
  setIsSleepOpen,
  setIsRestDurationOpen,
  setIsEatOpen,
  setIsForageOpen,
  setTurnNumber,
  setCurrentPatient,
  setIsPrescribing,
  setCurrentPrescriptionType,
  setNPCPosition,
  setPlayerPosition,
  setIsModernInventoryOpen,
  setUserActions,
  setActiveTab,
  setGameLog,
  setActivePatient,
  setPatientDialogue,
  setIsLedgerOpen,
  setIsFastTravelOpen,
  setIsBloodlettingOpen,
  setIsPatientRosterOpen,
  setPendingContract,
  setIsContractModalOpen,

  // State values
  energy,
  health,
  currentWealth,
  consecutiveLowEnergyTurns,
  toast,
  turnNumber,
  gameState,
  scenarioId,
  userInput,
  conversationHistory,
  npcTracker,
  reputation,
  reputationEmoji,
  currentMapData,
  playerPosition,
  currentMapId,
  npcPositions,
  activeTab,
  gameLog,
  activePatient,
  patientDialogue,
  playerSkills,
  journal,

  // Callbacks from gameState
  updateInventory,
  generateNewItemDetails,
  advanceTime,
  updateLocation,
  addCompoundToInventory,
  refreshInventory,
  toggleShopSign,

  // Leveling system
  awardXP,
  awardSkillXP,
}) {

  // Helper: Fuzzy match for NPC names
  const fuzzyMatch = (input, target) => {
    if (!input || !target) return false;
    return target.toLowerCase().includes(input.toLowerCase());
  };

  // Track previous portrait entity for smooth transitions (persists across renders)
  const previousPortraitEntityRef = useRef(null);

  // STATE CHANGE HANDLERS
  const handleWealthChange = (newWealth) => {
    setWealth(newWealth);
  };

  /**
   * Check if an entity is an animal or object (not portrait-worthy)
   * @param {Object} entity - Entity to check
   * @returns {boolean} - True if entity is an animal/object
   */
  const isAnimalOrObject = (entity) => {
    if (!entity) return true;

    const name = entity.name?.toLowerCase() || '';
    // Support BOTH flat and nested formats (EntityList vs EntityManager)
    const occupation = (entity.social?.occupation || entity.occupation || '').toLowerCase();
    const casta = (entity.social?.casta || entity.casta || '').toLowerCase();

    // Check for animal keywords
    const animalKeywords = ['dog', 'cat', 'horse', 'goat', 'sheep', 'pig', 'chicken', 'cow', 'donkey', 'mule'];
    const isAnimal = animalKeywords.some(keyword =>
      name.includes(keyword) || occupation.includes(keyword)
    );

    // Check for object/non-person indicators
    const isObject =
      casta === 'n/a' ||
      occupation.includes('farm animal') ||
      occupation.includes('livestock');

    return isAnimal || isObject;
  };

  const handleStatusChange = (newStatus) => {
    setMariaStatus(newStatus);
  };

  const handleReputationChange = (newReputation) => {
    // Note: Reputation is now managed by useReputation hook in GamePage
    // LLM reputation updates are temporarily disabled during reputation system migration
    console.log('[useGameHandlers] Reputation update (ignored):', newReputation);
  };

  const handleIncorporate = (content) => {
    setIncorporatedContent(content);
    setShowIncorporatePopup(true);
    setTimeout(() => setShowIncorporatePopup(false), 2000);
  };

  // TOGGLE HANDLERS
  const toggleJournal = () => setIsJournalOpen(prev => !prev);
  const toggleInventory = () => setIsInventoryOpen(prev => !prev);
  const toggleHistory = () => setIsHistoryOpen(prev => !prev);
  const toggleAbout = () => setIsAboutOpen(prev => !prev);
  const toggleMap = () => setIsMapOpen(prev => !prev);
  const toggleDiagnose = () => setIsDiagnoseOpen(prev => !prev);
  const toggleMixingPopup = () => setShowMixingPopup(prev => !prev);

  // PDF HANDLERS
  const handlePDFClick = useCallback((pdfPath, citation) => {
    setSelectedPDF(pdfPath);
    setSelectedCitation(citation);
    setIsPdfOpen(true);
  }, [setSelectedPDF, setSelectedCitation, setIsPdfOpen]);

  const closePdfPopup = () => {
    setIsPdfOpen(false);
    setSelectedPDF(null);
    setSelectedCitation(null);
  };

  // PORTRAIT/NPC HANDLERS
  const handlePortraitClick = useCallback((npcData) => {
    if (!npcData) return;

    console.log('[Portrait Click] NPC Data:', npcData);

    if (npcData.type === 'patient') {
      setSelectedPatient(npcData);
      setShowPatientModal(true);
    } else {
      console.log('[Portrait Click] Non-patient NPC clicked:', npcData.name);
    }
  }, [setSelectedPatient, setShowPatientModal]);

  // JOURNAL HANDLERS
  const addJournalEntry = (entry) => {
    setJournal(prevJournal => [...prevJournal, entry]);
  };

  const handleJournalEntrySubmit = async (e) => {
    e.preventDefault();
    const customEntryValue = e.target.elements?.journalEntry?.value;
    if (!customEntryValue || !customEntryValue.trim()) return;

    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: customEntryValue
    });
    setCustomJournalEntry('');
  };

  // RESOURCE MANAGEMENT
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

    // Update status based on resources
    const newStatus = resourceManager.getStatusDescription(finalHealth, newEnergy);
    setMariaStatus(newStatus);

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
  }, [energy, health, currentWealth, consecutiveLowEnergyTurns, setEnergy, setConsecutiveLowEnergyTurns, setHealth, setMariaStatus, setActiveEffects]);

  // EAT HANDLER
  const handleEat = useCallback((meal) => {
    setWealth(prev => prev - meal.cost);

    applyResourceChanges('eat', {
      energyBonus: meal.energy,
      healthBonus: meal.health
    });

    const eatMessage = `*Maria ate ${meal.quality === 'good' ? 'a hearty meal' : meal.quality === 'adequate' ? 'a simple meal' : 'meager rations'}. ${meal.message}*`;
    setConversationHistory(prev => [...prev, { role: 'system', content: eatMessage }]);

    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Ate a meal (${meal.cost} reales). Energy restored by ${meal.energy}.`
    });
  }, [applyResourceChanges, turnNumber, gameState.date, setWealth, setConversationHistory]);

  // FORAGE HANDLER
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

      // Award XP for foraging
      if (typeof awardXP === 'function') {
        let xpAmount = 8; // Base foraging XP

        // Bonus for rarity
        if (forageResult.rarity === 'rare') {
          xpAmount += 10;
        } else if (forageResult.rarity === 'uncommon') {
          xpAmount += 5;
        }

        awardXP(xpAmount, `foraging_${item.name}`);
        console.log(`[XP] Awarded ${xpAmount} XP for foraging ${item.name} (${forageResult.rarity})`);
      }

      // Award herbalism skill XP
      if (typeof awardSkillXP === 'function') {
        awardSkillXP('herbalism', forageResult.rarity === 'rare' ? 10 : forageResult.rarity === 'uncommon' ? 6 : 3);
      }

      const forageMessage = `*You foraged at ${gameState.location} and found ${forageResult.quantity}x ${item.name}. ${item.message || ''}*`;
      setConversationHistory(prev => [...prev, { role: 'system', content: forageMessage }]);
    } else if (forageResult.foundNothing) {
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: `Foraged at ${gameState.location}. Found nothing this time.`
      });

      const forageMessage = `*You searched ${gameState.location} for useful materials, but found nothing of value.*`;
      setConversationHistory(prev => [...prev, { role: 'system', content: forageMessage }]);
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
    setConversationHistory,
    energy,
    setEnergy,
    applyResourceChanges,
    advanceTime,
    toast
  ]);

  // ITEM DROP HANDLER - Formats item text for input field
  const handleItemDrop = useCallback((item) => {
    // Get quality inline
    const getItemQuality = (item) => {
      if (!item || !item.quality) return 'standard';
      return item.quality;
    };

    const quantity = item.quantity || 1;
    const isMedicine = !['clothing', 'misc', 'tool', 'weapon'].includes(item.type || item.entityType);

    // Get quality prefix
    const quality = getItemQuality(item);
    const qualityPrefix = quality === 'high_quality' ? 'high quality ' : quality === 'exceptional' ? 'exceptional ' : '';

    // Number words for quantities 1-10
    const numberWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const quantityWord = quantity <= 10 ? numberWords[quantity] : quantity.toString();

    let formattedText;
    if (isMedicine) {
      // For medicine: "Three drachms of high quality opium"
      const drachmText = quantity === 1 ? 'drachm' : 'drachms';
      formattedText = `${quantityWord} ${drachmText} of ${qualityPrefix}${item.name.toLowerCase()}`;
    } else {
      // For other items: "Two leather shoes" or "One blue apron"
      formattedText = `${quantityWord} ${qualityPrefix}${item.name.toLowerCase()}`;
    }

    // Capitalize first letter
    const capitalizedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1);
    setUserInput(capitalizedText);
  }, [setUserInput]);

  // MAIN SUBMIT HANDLER
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let narrativeText = userInput.trim().toLowerCase();

    // Handle command shortcuts
    if (narrativeText === '#prescribe') {
      setIsPrescribePopupOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (narrativeText === '#sleep') {
      setIsRestDurationOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (narrativeText === '#eat') {
      setIsEatOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#buy') {
      setIsBuyOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#forage') {
      setIsForageOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#travel') {
      setIsFastTravelOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#ledger') {
      // Check if player has Bookkeeping skill
      const bookkeepingLevel = playerSkills?.knownSkills?.bookkeeping?.level || 0;

      if (bookkeepingLevel < 1) {
        setHistoryOutput('Maria lacks formal bookkeeping training. She needs at least Level 1 Bookkeeping skill to maintain a proper ledger.');
        setUserInput('');
        setIsLoading(false);
        return;
      }

      setIsLedgerOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#bloodlet') {
      // Check if player has Anatomy skill
      const anatomyLevel = playerSkills?.knownSkills?.anatomy?.level || 0;

      if (anatomyLevel < 1) {
        setHistoryOutput('Maria lacks the anatomical knowledge to perform phlebotomy safely. She needs at least Level 1 Anatomy skill.');
        setUserInput('');
        setIsLoading(false);
        return;
      }

      setIsBloodlettingOpen(true);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    if (userInput.trim().toLowerCase() === '#hangsign' || userInput.trim().toLowerCase() === '#removesign') {
      // Toggle shop sign
      toggleShopSign();

      // Determine message based on current state (will be opposite after toggle)
      const signWasHung = gameState.shopSign?.hung || false;
      const message = signWasHung
        ? '*You remove your shop sign from the entrance. Patients will be less likely to approach.*'
        : '*With your sign hung outside your shop, you are now actively seeking patients.*';

      // Add journal entry
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: signWasHung ? 'Removed the shop sign.' : 'Hung the shop sign to attract patients.'
      });

      setConversationHistory(prev => [...prev, { role: 'system', content: message }]);
      setHistoryOutput(message);
      setUserInput('');
      setIsLoading(false);
      return;
    }

    // Track user actions
    setUserActions(prevActions => [...prevActions, narrativeText]);

    // Normalize command
    const command = narrativeText.startsWith('#') ? narrativeText.substring(1) : narrativeText;

    // Handle symptoms command
    if (command.startsWith('symptoms')) {
      const recentNPCs = npcTracker.getRecentNPCs();
      const latestNPC = recentNPCs.length > 0 ? recentNPCs[recentNPCs.length - 1] : null;
      const npcName = command.split(' ')[1] || latestNPC;
      if (npcName) {
        setSelectedNpcName(npcName);
        setShowSymptomsPopup(true);
        setUserInput('');
        setIsLoading(false);
        return;
      } else {
        setHistoryOutput('No NPC is currently selected.');
        setUserInput('');
        setIsLoading(false);
        return;
      }
    }

    // Use AgentOrchestrator for coordinated agent responses
    try {
      const result = await orchestrateTurn({
        scenarioId: gameState.scenarioId || '1680-mexico-city',
        playerAction: narrativeText,
        conversationHistory,
        gameState: {
          ...gameState,
          position: playerPosition,
          currentMap: currentMapId
        },
        turnNumber,
        recentNPCs: npcTracker.getRecentNPCs(),
        reputation: reputation,
        wealth: currentWealth,
        mapData: currentMapData,
        playerPosition: playerPosition,
        currentMapId: currentMapId,
        playerSkills: playerSkills,
        journal: journal,
        activePatient: activePatient // Pass current active patient for contextual guards
      });

      if (!result.success) {
        setHistoryOutput(result.narrative || 'An error occurred. Please try again.');
        setIsLoading(false);
        return;
      }

      // PATIENT HANDLING: If entity is a patient, validate LLM used them correctly
      if (result.selectedEntity) {
        const entityType = result.selectedEntity.entityType || result.selectedEntity.type;

        if (entityType === 'patient') {
          const preSelectedPatient = result.selectedEntity;
          let patientToSet = preSelectedPatient;
          let validationStatus = 'direct'; // direct, intermediary, or diverged

          // Check if LLM actually mentioned the pre-selected patient in the narrative
          const narrativeLower = result.narrative?.toLowerCase() || '';
          const patientNameLower = preSelectedPatient.name.toLowerCase();
          const patientMentioned = narrativeLower.includes(patientNameLower);

          if (!patientMentioned) {
            console.warn(`[Patient Validation] Pre-selected patient "${preSelectedPatient.name}" NOT mentioned in narrative`);

            // Check if any extracted entities could be intermediaries
            const intermediaryKeywords = /woman|man|servant|messenger|daughter|son|wife|husband|child|mother|father|family|representative|maid|attendant|envoy/i;
            const extractedIntermediaries = (result.newNPCs || []).filter(entity =>
              intermediaryKeywords.test(entity.name) || intermediaryKeywords.test(entity.description || '')
            );

            if (extractedIntermediaries.length > 0) {
              // Found potential intermediary - link them to the patient
              const intermediary = extractedIntermediaries[0];
              console.log(`[Patient Validation] Found intermediary: "${intermediary.name}" representing ${preSelectedPatient.name}`);

              // Enrich intermediary with relationship to patient
              if (intermediary.metadata) {
                intermediary.metadata.representsPatient = preSelectedPatient.name;
                intermediary.metadata.representsPatierId = preSelectedPatient.id;
              }

              validationStatus = 'intermediary';
              // Still set the pre-selected patient as active (they're the one who needs treatment)
            } else {
              // LLM completely diverged - no intermediary found
              console.warn(`[Patient Validation] LLM diverged - no patient or intermediary found. Trusting pre-selection.`);
              validationStatus = 'diverged';
            }
          } else {
            console.log(`[Patient Validation] ✓ Pre-selected patient "${preSelectedPatient.name}" mentioned in narrative`);
          }

          // Set active patient regardless (they're the one being treated)
          console.log(`[Patient] Setting active patient: ${patientToSet.name} (validation: ${validationStatus})`);
          setActivePatient(patientToSet);
          setPatientDialogue([]); // Clear previous dialogue
        }

        const npcId = result.selectedEntity.id || result.selectedEntity.name;
        const currentNPCPosition = npcPositions.find(npc => npc.npcId === npcId);

        if (!currentNPCPosition && playerPosition && currentMapData) {
          const offsetX = (Math.random() - 0.5) * 100;
          const offsetY = (Math.random() - 0.5) * 100;
          const npcPosition = [
            Math.max(50, Math.min(currentMapData.bounds.width - 50, playerPosition.gridX * 20 + offsetX)),
            Math.max(50, Math.min(currentMapData.bounds.height - 50, playerPosition.gridY * 20 + offsetY))
          ];
          setNPCPosition(npcId, result.selectedEntity.name, npcPosition, 'interacting');
          console.log(`[NPC] Placed ${result.selectedEntity.name} at map position`, npcPosition);
        } else if (currentNPCPosition) {
          setNPCPosition(npcId, result.selectedEntity.name, currentNPCPosition.position, 'interacting');
          console.log(`[NPC] ${result.selectedEntity.name} is now interacting`);
        }
      } else {
        npcPositions.forEach(npc => {
          if (npc.status === 'interacting') {
            setNPCPosition(npc.npcId, npc.npcName, npc.position, 'idle');
          }
        });
      }

      // Portrait Selection Logic (RESTORED ORIGINAL):
      // Portrait selection - prioritize LLM hint, then fallback to heuristics
      let portraitEntity = null;

      // 1. PRIMARY: Trust LLM's portrait hint (knows narrative intent)
      console.log('[Portrait] LLM hint received:', result.showPortraitFor);
      if (result.showPortraitFor) {
        // Search EntityManager (includes all entities, not just new ones this turn)
        const hintedEntity = entityManager.getByName(result.showPortraitFor);
        console.log('[Portrait] Entity lookup result for', result.showPortraitFor, ':', hintedEntity ? 'FOUND' : 'NOT FOUND');

        if (hintedEntity && !isAnimalOrObject(hintedEntity)) {
          portraitEntity = hintedEntity;
          console.log('[Portrait] ✓ Using LLM hint:', result.showPortraitFor);
        } else if (!hintedEntity) {
          console.warn('[Portrait] ✗ LLM suggested', result.showPortraitFor, 'but entity not found in EntityManager');
        } else {
          console.warn('[Portrait] ✗ LLM suggested', result.showPortraitFor, 'but it is an animal/object:', hintedEntity);
        }
      } else {
        console.log('[Portrait] No LLM hint provided (showPortraitFor was null/undefined)');
      }

      // 2. FALLBACK: Use EntityAgent's selection
      if (!portraitEntity && result.selectedEntity) {
        if (!isAnimalOrObject(result.selectedEntity)) {
          portraitEntity = result.selectedEntity;
          console.log('[Portrait] ⟳ Fallback to EntityAgent selection:', result.selectedEntity.name);
        }
      }

      // 3. LAST RESORT: First person mentioned (excluding animals/objects/items)
      if (!portraitEntity && result.newNPCs?.length > 0) {
        const firstPerson = result.newNPCs.find(npc => {
          // Exclude animals, objects, and items
          if (isAnimalOrObject(npc)) return false;
          const entityType = npc.entityType || npc.type;
          if (entityType === 'item' || entityType === 'location') return false;
          return true;
        });
        if (firstPerson) {
          portraitEntity = firstPerson;
          console.log('[Portrait] ⟳ Last resort - first person mentioned:', firstPerson.name);
        }
      }

      // 4. FINAL FALLBACK: Keep previous portrait if no new entity found
      if (!portraitEntity && previousPortraitEntityRef.current) {
        portraitEntity = previousPortraitEntityRef.current;
        console.log('[Portrait] ↻ No new entity found, keeping previous:', portraitEntity.name);
      }

      // Track NPCs for portrait system (ContextPanel queries directly from EntityManager)
      if (portraitEntity) {
        npcTracker.addNPC(portraitEntity.name);
        console.log('[Portrait] → Tracking for display:', portraitEntity.name);
        // Update previous portrait for next turn
        previousPortraitEntityRef.current = portraitEntity;
      } else {
        console.log('[Portrait] ∅ No portrait-worthy NPCs this turn');
      }

      // Log all entities for debugging
      if (result.newNPCs && result.newNPCs.length > 0) {
        console.log(`[Entities] ${result.newNPCs.length} entities mentioned in narrative:`,
          result.newNPCs.map(npc => `${npc.name} (${npc.tier || 'background'})`).join(', '));
      }

      // Display narrative
      setHistoryOutput(result.narrative);

      // Store entities for historical context panel
      if (result.entities && result.entities.length > 0) {
        console.log('[GameHandlers] Storing entities for context panel:', result.entities);
        setCurrentEntities(result.entities);
      } else {
        setCurrentEntities([]);
      }

      // Add entry to game log
      const logEntry = {
        id: `turn-${turnNumber}`,
        timestamp: new Date().toLocaleTimeString(),
        turnNumber: turnNumber,
        category: result.category || 'default',
        summary: result.summary || narrativeText.substring(0, 100),
        context: {
          action: narrativeText,
          narrative: result.narrative,
          stateChanges: result.gameState || {},
          entities: result.selectedEntity ? [result.selectedEntity.name] : []
        },
        debug: result.debug || null
      };
      setGameLog(prev => [...prev, logEntry]);

      // Build conversation history
      const newUserMessage = { role: 'user', content: narrativeText };
      const newHistory = [...conversationHistory, newUserMessage];

      // Note: Removed "Someone approaches" system message - causes confusion when LLM diverges
      // The narrative itself already mentions who appears

      newHistory.push({ role: 'assistant', content: result.narrative });

      if (result.systemAnnouncements && result.systemAnnouncements.length > 0) {
        result.systemAnnouncements.forEach(announcement => {
          newHistory.push({ role: 'system', content: announcement });
        });
      }

      setConversationHistory(newHistory);
      setTurnNumber(result.turnNumber || turnNumber + 1);

      // Handle game state updates
      if (result.gameState) {
        if (result.gameState.wealth !== undefined) {
          setWealth(result.gameState.wealth);
        }
        if (result.gameState.status) {
          setMariaStatus(result.gameState.status);
        }
        if (result.gameState.reputation) {
          // Reputation updates from LLM temporarily disabled during migration
          console.log('[useGameHandlers] LLM reputation update (ignored):', result.gameState.reputation);
        }
        if (result.gameState.location) {
          updateLocation(result.gameState.location);
        }
        if (result.gameState.time && result.gameState.date) {
          advanceTime({
            time: result.gameState.time,
            date: result.gameState.date,
            location: result.gameState.location || gameState.location
          });
        }
        // Update player position if movement occurred (with validation)
        if (result.gameState.position &&
            typeof result.gameState.position.x === 'number' &&
            typeof result.gameState.position.y === 'number') {
          setPlayerPosition(result.gameState.position);
          console.log(`[Movement] Player moved to: (${result.gameState.position.x}, ${result.gameState.position.y})`);
        } else if (result.gameState.position) {
          console.warn('[Movement] Invalid position received:', result.gameState.position);
        }
      }

      // Log movement details
      if (result.movement) {
        if (result.movement.valid) {
          console.log(`[Movement] ✓ Moved ${result.movement.direction}`);
          if (result.movement.nearbyLocations && result.movement.nearbyLocations.length > 0) {
            console.log(`[Movement] Nearby: ${result.movement.nearbyLocations.map(l => l.name).join(', ')}`);
          }
        } else {
          console.log(`[Movement] ✗ Blocked: ${result.movement.reason}`);
        }
      }

      // Handle inventory changes
      if (result.inventoryChanges && result.inventoryChanges.length > 0) {
        for (const change of result.inventoryChanges) {
          updateInventory(change.item, change.quantity, change.action);

          if (change.action === 'bought' || change.action === 'foraged' || change.action === 'received') {
            await generateNewItemDetails(change.item);
          }
        }
      }

      // Handle relationship changes and reputation feedback
      if (result.relationshipChanges && result.relationshipChanges.length > 0) {
        console.log(`[Relationship] Processing ${result.relationshipChanges.length} relationship changes`);

        for (const change of result.relationshipChanges) {
          // Update relationship graph
          relationshipGraph.updateRelationship(
            change.npcId,
            'player',
            change.delta,
            change.reason
          );

          console.log(`[Relationship] ${change.npcName}: ${change.delta > 0 ? '+' : ''}${change.delta} (${change.reason})`);

          // Apply reputation feedback
          const newReputation = applyRelationshipToReputation(
            change.npcId,
            change.delta,
            change.reason,
            reputation,
            {
              profession: gameState.chosenProfession,
              playerLevel: gameState.playerLevel,
              itemUsed: change.itemUsed || ''
            }
          );

          if (newReputation) {
            setReputation(newReputation);
            console.log('[Reputation] Updated from relationship change');
          }
        }
      }

      // Handle contract offers (treatment or sale)
      if (result.contractOffer && result.contractOffer.type) {
        console.log('[Contract] Offer detected:', result.contractOffer.type, result.contractOffer);
        setPendingContract(result.contractOffer);
        setIsContractModalOpen(true);
      }

      // Add journal entry
      if (result.journalEntry) {
        setJournal(prevJournal => [...prevJournal, { content: result.journalEntry, type: 'auto' }]);
      }

      // Detect action type and apply resource changes
      let actionType = 'chat';
      const lowerInput = narrativeText.toLowerCase();

      if (lowerInput.includes('study') || lowerInput.includes('read')) {
        actionType = 'study';
      } else if (lowerInput.includes('forage') || lowerInput.includes('search') || lowerInput.includes('gather')) {
        actionType = 'forage';
      } else if (lowerInput.includes('mix') || lowerInput.includes('prepare medicine') || lowerInput.includes('compound')) {
        actionType = 'mix';
      } else if (lowerInput.includes('patient') || lowerInput.includes('examine') || lowerInput.includes('treat')) {
        actionType = 'seePatients';
      } else if (lowerInput.includes('travel') || lowerInput.includes('go to') || lowerInput.includes('visit')) {
        actionType = 'travel';
      } else if (lowerInput.includes('buy') || lowerInput.includes('purchase') || lowerInput.includes('shop')) {
        actionType = 'buy';
      }

      applyResourceChanges(actionType);

    } catch (error) {
      console.error("Error fetching data:", error);
      setHistoryOutput(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }

    setUserInput('');

  }, [
    conversationHistory,
    gameState,
    turnNumber,
    userInput,
    npcTracker,
    reputation,
    reputationEmoji,
    currentWealth,
    updateInventory,
    updateLocation,
    advanceTime,
    generateNewItemDetails,
    setJournal,
    setIsLoading,
    setHistoryOutput,
    setConversationHistory,
    setTurnNumber,
    setUserInput,
    setSelectedNpcName,
    setShowSymptomsPopup,
    setIsBuyOpen,
    setIsPrescribePopupOpen,
    setIsSleepOpen,
    setWealth,
    setMariaStatus,
    applyResourceChanges,
    setUserActions,
    setIsEatOpen,
    setIsForageOpen,
    setNPCPosition,
    currentMapData,
    playerPosition,
    currentMapId,
    npcPositions,
    setPlayerPosition,
    setGameLog
  ]);

  // QUICK ACTION HANDLER
  const handleQuickAction = (action) => {
    setUserInput(action);
  };

  // ACTION CLICK HANDLER
  const handleActionClick = (action) => {
    if (action.startsWith('#')) {
      const commandType = action.split(' ')[0].toLowerCase();

      switch (commandType) {
        case '#mix':
          setShowMixingPopup(true);
          break;
        case '#buy':
          setIsBuyOpen(true);
          break;
        case '#sleep':
          setIsRestDurationOpen(true);
          break;
        case '#eat':
          setIsEatOpen(true);
          break;
        case '#forage':
          setIsForageOpen(true);
          break;
        // NOTE: #hangsign and #removesign removed - now handled as direct button actions in ContextPanel
        case '#prescribe':
        case '#symptoms':
        case '#diagnose':
          setUserInput(action);
          break;
        default:
          setUserInput(action);
          break;
      }
    } else {
      // Handle non-command actions (from ActionPanel secondary buttons)
      switch (action) {
        case 'roster':
          setIsPatientRosterOpen(true);
          break;
        case 'rest':
          setIsRestDurationOpen(true);
          break;
        case 'bargain':
          setIsBuyOpen(true);
          break;
        case 'accounts':
          setIsLedgerOpen(true);
          break;
        default:
          setUserInput(action);
          break;
      }
    }
  };

  // COMMAND CLICK HANDLER
  const handleCommandClick = (command) => {
    const commandParts = command.split(' ');
    const commandType = commandParts[0].toLowerCase();
    const targetName = commandParts.slice(1).join(' ');
    let npcName;

    // Get most recent NPC from tracker if no explicit name provided
    if (commandType !== '#sleep') {
      const recentNPCs = npcTracker.getRecentNPCs();
      npcName = recentNPCs.length > 0 ? recentNPCs[recentNPCs.length - 1] : null;
    }

    // Try fuzzy matching for NPC name
    const getMatchedNPC = (name) => {
      const EntityList = require('../../EntityList').default;
      return EntityList.find(entity => fuzzyMatch(name, entity.name));
    };

    switch (commandType) {
      case '#buy':
        setIsBuyOpen(true);
        setUserInput('');
        setIsLoading(false);
        toggleInventory();
        break;

      case '#symptoms':
        let matchedNPC = getMatchedNPC(npcName);
        if (matchedNPC) {
          setSelectedNpcName(matchedNPC.name);
          setShowSymptomsPopup(true);

          const npcId = matchedNPC.id || matchedNPC.name;
          const npcPos = npcPositions.find(npc => npc.npcId === npcId);
          if (npcPos) {
            setNPCPosition(npcId, matchedNPC.name, npcPos.position, 'interacting');
          }
        } else {
          setHistoryOutput('No NPC is currently selected.');
        }
        break;

      case '#prescribe':
        let targetNPC = getMatchedNPC(targetName || npcName);
        if (targetNPC) {
          setCurrentPatient(targetNPC);
          setIsPrescribing(true);
          setIsInventoryOpen(true);
          setIsPrescribePopupOpen(true);

          const npcId = targetNPC.id || targetNPC.name;
          const npcPos = npcPositions.find(npc => npc.npcId === npcId);
          if (npcPos) {
            setNPCPosition(npcId, targetNPC.name, npcPos.position, 'interacting');
          }
        } else {
          setHistoryOutput('No valid NPC found for prescription. Make sure an NPC is present in the current scene or specify a valid NPC name.');
        }
        break;

      case '#diagnose':
        setIsDiagnoseOpen(true);
        break;

      case '#sleep':
        setIsRestDurationOpen(true);
        break;

      case '#eat':
        setIsEatOpen(true);
        break;

      case '#forage':
        setIsForageOpen(true);
        break;

      case '#mix':
        toggleMixingPopup();
        break;

      case '#inventory':
        setIsModernInventoryOpen(true);
        break;

      case 'see patients':
        const EntityList = require('../../EntityList').default;
        const patients = EntityList.filter(npc => npc.type === 'patient');

        if (patients.length > 0) {
          setSelectedPatient(patients[0]);
          setShowPatientModal(true);
          console.log(`[See Patients] Opening patient modal for: ${patients[0].name}`);
        } else {
          setHistoryOutput('No patients are currently waiting to see you. Try asking around or going to the market.');
        }
        break;

      default:
        break;
    }
  };

  // SAVE GAME HANDLER
  const handleSaveGame = () => {
    toast.success('Game saved successfully!');
    // Add actual save logic here
  };

  // CENTRAL PANEL HANDLERS
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  const handleEntityClick = useCallback((entityType, entityName) => {
    console.log('[Entity Click]', entityType, entityName);

    // Get entity from EntityManager or EntityList
    const EntityList = require('../../EntityList').default;
    const entity = EntityList.find(e => e.name === entityName);

    if (!entity) {
      console.warn(`[Entity Click] Entity not found: ${entityName}`);
      return;
    }

    if (entityType === 'patient' || entity.type === 'patient') {
      // Open Patient View tab and set active patient
      setActivePatient(entity);
      setActiveTab('patient');
      setPatientDialogue([]); // Clear previous dialogue
    } else if (entityType === 'npc' || entity.type === 'npc') {
      // For now, just log - could open NPC modal in future
      console.log('[Entity Click] NPC clicked:', entityName);
      setSelectedPatient(entity);
      setShowPatientModal(true);
    } else if (entityType === 'item') {
      // Could open item modal
      console.log('[Entity Click] Item clicked:', entityName);
    }
  }, [setActivePatient, setActiveTab, setPatientDialogue, setSelectedPatient, setShowPatientModal]);

  const handleAskQuestion = useCallback(async (question) => {
    if (!activePatient || !question.trim()) return;

    try {
      console.log('[handleAskQuestion] Processing question for:', activePatient.name);

      // Use PatientDialogueAgent to get response with structured data extraction
      const result = await processPatientDialogue({
        patient: activePatient,
        question,
        conversationHistory: patientDialogue
      });

      const { dialogue, patientDataUpdates } = result;

      // Enrich patient entity with extracted data
      let enrichedPatient = activePatient;
      let newSymptoms = [];

      if (patientDataUpdates) {
        const enrichmentResult = enrichPatientData(activePatient, patientDataUpdates);
        enrichedPatient = enrichmentResult.patient;
        newSymptoms = enrichmentResult.newSymptoms || [];

        // Update active patient state
        setActivePatient(enrichedPatient);

        // Persist to EntityManager
        entityManager.update(enrichedPatient.id, enrichedPatient);

        console.log('[handleAskQuestion] Patient data enriched:', {
          newSymptoms: newSymptoms.length,
          totalSymptoms: enrichedPatient.symptoms?.length
        });
      }

      // Add to patient dialogue history
      const newDialogue = {
        question,
        answer: dialogue,
        timestamp: gameState.time || new Date().toLocaleTimeString(),
        dataExtracted: patientDataUpdates // For debugging/review
      };

      setPatientDialogue(prev => [...prev, newDialogue]);

      // Show toast notification for newly discovered symptoms
      if (newSymptoms.length > 0) {
        const symptomNames = newSymptoms.map(s => s.name).join(', ');
        toast.success(`New symptom${newSymptoms.length > 1 ? 's' : ''} recorded: ${symptomNames}`, {
          duration: 4000
        });
      }

      // Add journal entry
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: `Examined ${activePatient.name}. Asked: "${question}". ` +
          (newSymptoms.length > 0
            ? `Discovered ${newSymptoms.length} new symptom(s): ${newSymptoms.map(s => s.name).join(', ')}.`
            : `Patient responded: ${dialogue.substring(0, 100)}...`)
      });

      // Add to main conversation history so LLM has context for future turns
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: `Maria asked ${activePatient.name}: "${question}"` },
        { role: 'assistant', content: dialogue },
        { role: 'system', content: `*[PATIENT EXAMINATION] ${newSymptoms.length > 0 ? `Discovered symptoms: ${newSymptoms.map(s => s.name).join(', ')}` : 'Gathering patient information'}*` }
      ]);

    } catch (error) {
      console.error('[Ask Question] Error:', error);
      toast.error('Failed to get patient response. Please try again.');
    }
  }, [activePatient, patientDialogue, setPatientDialogue, scenarioId, addJournalEntry, turnNumber, gameState.date, toast, setConversationHistory]);

  // Helper: Build prompt for item action
  const buildItemActionPrompt = useCallback((action, item, npc, npcEntity, affinity, gameState) => {
    const scenario = scenarioLoader.getScenario(gameState.scenarioId || '1680-mexico-city');

    const basePrompt = `You are simulating ${npc.name}, a character in 1680 Mexico City.

**NPC Profile:**
- Name: ${npc.name}
- Type: ${npcEntity?.entityType || npc.type || 'npc'}
- Background: ${npcEntity?.background || npc.background || 'Unknown'}
- Personality: ${npcEntity?.personality || npc.personality || 'Reserved'}
- Social Class: ${npcEntity?.socialClass || npc.socialClass || 'Middle class'}
- Wealth: ${npcEntity?.wealth || npc.wealth || 'Moderate means'}
- Current Relationship with Maria: ${affinity > 50 ? 'Friendly' : affinity > 0 ? 'Neutral' : affinity < -50 ? 'Hostile' : 'Cautious'} (${affinity}/100)

**Item Details:**
- Name: ${item.name}
- Type: ${item.type || 'medicine'}
- Price: ${item.price || 0} reales
- Quality: ${item.quality || 'standard'}
- Properties: ${item.properties?.join(', ') || 'Unknown'}
- Description: ${item.description || 'No description'}

**Context:**
Maria de Lima, a converso apothecary, is attempting to ${action === 'give' ? 'give this item as a gift' : action === 'sell' ? 'sell this item' : 'prescribe this item as medical treatment'} to ${npc.name}.

**Instructions:**
Based on ${npc.name}'s personality, social status, current relationship with Maria, and the nature of the item, determine how they would respond.

Consider:
1. Would they accept/buy/use this item? Why or why not?
2. How does their relationship with Maria affect their response?
3. ${action === 'sell' ? 'Is the price fair? Would they negotiate?' : action === 'give' ? 'Do they appreciate gifts? Is this gift appropriate?' : 'Do they trust Maria\'s medical expertise? Are they suffering from an ailment this could treat?'}
4. Historical context (Inquisition, social hierarchy, converso prejudice)

Respond with ONLY a JSON object in this exact format:
{
  "accepted": true or false,
  "narrative": "A 2-3 sentence response from ${npc.name} in their voice, showing their reaction",
  "relationshipDelta": number between -15 and +15 (how this interaction affects their relationship),
  "priceAdjustment": ${action === 'sell' ? 'number (positive if they pay more, negative if they bargain down)' : '0'},
  "systemMessage": "One sentence explaining the outcome (e.g., 'They appreciated the gesture but politely declined' or 'They paid 5 reales for the medicine')"
}`;

    return basePrompt;
  }, []);

  // Helper: Parse LLM response for item action
  const parseItemActionOutcome = useCallback((response, action, item) => {
    try {
      // Try to parse as JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          accepted: parsed.accepted || false,
          narrative: parsed.narrative || `${parsed.accepted ? 'They accept.' : 'They decline.'}`,
          relationshipDelta: parsed.relationshipDelta || 0,
          priceAdjustment: parsed.priceAdjustment || 0,
          price: action === 'sell' ? (item.price + (parsed.priceAdjustment || 0)) : 0,
          systemMessage: parsed.systemMessage || `${parsed.accepted ? 'Transaction completed' : 'Offer declined'}.`
        };
      }
    } catch (error) {
      console.error('[Item Action] Failed to parse LLM response:', error);
    }

    // Fallback response if parsing fails
    return {
      accepted: false,
      narrative: "They seem uncertain and politely decline for now.",
      relationshipDelta: 0,
      priceAdjustment: 0,
      price: 0,
      systemMessage: "The interaction was inconclusive."
    };
  }, []);

  // ITEM ACTION HANDLER - Give/Sell/Prescribe items to NPCs
  const handleItemAction = useCallback(async (action, item, npc, closePopup) => {
    console.log(`[Item Action] Starting: ${action} ${item.name} to ${npc.name}`);

    try {
      // Get full NPC entity data from EntityManager
      const npcEntity = entityManager.getByName(npc.name);
      console.log('[Item Action] NPC Entity:', npcEntity);

      // Get relationship value if available
      const relationship = relationshipGraph.getRelationship(npc.id || npc.name, 'player');
      const affinity = relationship?.value || 0;
      console.log('[Item Action] Relationship affinity:', affinity);

      // Build prompt based on action type
      const systemPrompt = buildItemActionPrompt(action, item, npc, npcEntity, affinity, gameState);
      console.log('[Item Action] Prompt built, calling LLM...');

      // Call LLM to get NPC response
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Maria attempts to ${action === 'give' ? 'give' : action === 'sell' ? 'sell' : 'prescribe'} ${item.name} to ${npc.name}.` }
      ];

      const response = await createChatCompletion(
        messages,
        0.8,  // temperature
        500   // maxTokens
      );

      console.log('[Item Action] LLM Response:', response);

      // Extract text content from response
      const responseText = response.choices?.[0]?.message?.content || response;
      console.log('[Item Action] Response text:', responseText);

      // Parse response
      const outcome = parseItemActionOutcome(responseText, action, item);
      console.log('[Item Action] Parsed outcome:', outcome);

      // Update game state based on outcome
      if (outcome.accepted) {
        // Remove item from inventory
        updateInventory(item.name, -1, action);

        // Update wealth if selling
        if (action === 'sell' && outcome.price) {
          const finalPrice = item.price + (outcome.priceAdjustment || 0);
          setWealth(prev => prev + finalPrice);

          toast.success(`Sold ${item.name} for ${finalPrice} reales!`, { duration: 3000 });
        } else if (action === 'give') {
          toast.success(`${npc.name} accepted your gift!`, { duration: 3000 });
        } else if (action === 'prescribe') {
          toast.success(`${npc.name} accepted the prescription!`, { duration: 3000 });
        }

        // Update relationship
        if (outcome.relationshipDelta) {
          relationshipGraph.updateRelationship(
            npc.id || npc.name,
            'player',
            outcome.relationshipDelta,
            `${action === 'give' ? 'Received gift' : action === 'sell' ? 'Purchased item' : 'Received prescription'}: ${item.name}`
          );

          console.log(`[Relationship] ${npc.name}: ${outcome.relationshipDelta > 0 ? '+' : ''}${outcome.relationshipDelta} (${action} ${item.name})`);
        }
      } else {
        // Action rejected - item stays in inventory
        if (action === 'sell') {
          toast.error(`${npc.name} declined to buy ${item.name}`, { duration: 3000 });
        } else if (action === 'give') {
          toast.info(`${npc.name} politely refused your gift`, { duration: 3000 });
        } else if (action === 'prescribe') {
          toast.warning(`${npc.name} declined the prescription`, { duration: 3000 });
        }
      }

      // Add to conversation history
      const narrativeMessage = { role: 'assistant', content: outcome.narrative };
      const systemMessage = { role: 'system', content: `*${outcome.systemMessage}*` };

      setConversationHistory(prev => [...prev, narrativeMessage, systemMessage]);

      // Also update history output to display in narrative panel
      setHistoryOutput(outcome.narrative);

      // Add journal entry
      const journalText = outcome.accepted
        ? `${action === 'give' ? 'Gave' : action === 'sell' ? 'Sold' : 'Prescribed'} ${item.name} to ${npc.name}. ${outcome.systemMessage}`
        : `Attempted to ${action} ${item.name} to ${npc.name}, but they declined. ${outcome.systemMessage}`;

      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: journalText
      });

      // Close popup
      if (closePopup) {
        closePopup();
      }

    } catch (error) {
      console.error('[Item Action] Error details:', error);
      console.error('[Item Action] Error stack:', error.stack);
      toast.error(`Failed to ${action} item: ${error.message}`, { duration: 5000 });

      if (closePopup) {
        closePopup();
      }
    }
  }, [
    updateInventory,
    setWealth,
    setConversationHistory,
    setHistoryOutput,
    addJournalEntry,
    turnNumber,
    gameState,
    toast,
    buildItemActionPrompt,
    parseItemActionOutcome
  ]);

  // CONTRACT HANDLERS

  // Handle accepting treatment contract
  const handleAcceptTreatment = useCallback((patientEntity, paymentAmount) => {
    console.log('[Contract] Accepting treatment:', patientEntity.name, 'Payment:', paymentAmount);

    // Set as active patient immediately
    setActivePatient(patientEntity);
    setActiveTab('patient');
    setPatientDialogue([]); // Clear previous dialogue

    // Update wealth
    setWealth(prev => prev + paymentAmount);

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[CONTRACT ACCEPTED] Maria agreed to treat ${patientEntity.name} for ${paymentAmount} reales. Payment received.*` }
    ]);

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Accepted contract to treat ${patientEntity.name} for ${paymentAmount} reales.`
    });

    toast.success(`Contract accepted! ${patientEntity.name} is now your active patient.`, { duration: 4000 });
  }, [setActivePatient, setActiveTab, setPatientDialogue, setWealth, setConversationHistory, addJournalEntry, turnNumber, gameState.date, toast]);

  // Handle accepting sale contract
  const handleAcceptSale = useCallback(async (item, price, customerName) => {
    console.log('[Contract] Proposing sale:', item.name, 'Price:', price, 'Customer:', customerName);

    // Update inventory (remove item)
    updateInventory(item.name, -1, 'sold');

    // Update wealth
    setWealth(prev => prev + price);

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[SALE COMPLETED] Maria sold ${item.name} to ${customerName} for ${price} reales.*` }
    ]);

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Sold ${item.name} to ${customerName} for ${price} reales.`
    });

    toast.success(`Sold ${item.name} for ${price} reales!`, { duration: 3000 });
  }, [updateInventory, setWealth, setConversationHistory, addJournalEntry, turnNumber, gameState.date, toast]);

  // Handle declining contract
  const handleDeclineContract = useCallback(() => {
    console.log('[Contract] Declined offer');

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[CONTRACT DECLINED] Maria declined the offer.*` }
    ]);

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Declined a contract offer.`
    });

    toast.info('Contract declined.', { duration: 2000 });
  }, [setConversationHistory, addJournalEntry, turnNumber, gameState.date, toast]);

  // Return all handlers
  return {
    handleWealthChange,
    handleStatusChange,
    handleReputationChange,
    handleIncorporate,
    toggleJournal,
    toggleInventory,
    toggleHistory,
    toggleAbout,
    toggleMap,
    toggleDiagnose,
    toggleMixingPopup,
    handlePDFClick,
    closePdfPopup,
    handlePortraitClick,
    addJournalEntry,
    handleJournalEntrySubmit,
    applyResourceChanges,
    handleEat,
    handleForageComplete,
    handleItemDrop,
    handleSubmit,
    handleQuickAction,
    handleActionClick,
    handleCommandClick,
    handleSaveGame,
    handleTabChange,
    handleEntityClick,
    handleAskQuestion,
    handleItemAction,
    handleAcceptTreatment,
    handleAcceptSale,
    handleDeclineContract,
  };
}
