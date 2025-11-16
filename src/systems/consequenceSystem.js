/**
 * Consequence System
 * Handles scheduled consequences from player actions (extortion refusals, etc.)
 * Triggers events when pendingConsequences reach their triggerTurn
 */

/**
 * Check and trigger any consequences that are due this turn
 * @param {Object} gameState - Current game state
 * @param {number} currentTurn - Current turn number
 * @param {Function} updateGameState - Function to update game state
 * @param {Function} updateWealth - Function to update player wealth
 * @param {Function} updateHealth - Function to update player health
 * @param {Function} updateEnergy - Function to update player energy
 * @param {Function} updateInventory - Function to update inventory
 * @param {Function} toast - Toast notification function
 * @returns {Array} Array of triggered consequence events with narrative
 */
export const checkAndTriggerConsequences = (
  gameState,
  currentTurn,
  { updateWealth, updateHealth, updateEnergy, updateInventory, toast }
) => {
  if (!gameState.pendingConsequences || gameState.pendingConsequences.length === 0) {
    return [];
  }

  const triggeredConsequences = [];
  const remainingConsequences = [];

  // Check each pending consequence
  for (const consequence of gameState.pendingConsequences) {
    if (consequence.triggerTurn <= currentTurn) {
      // This consequence should trigger now
      console.log(`[Consequence] Triggering: ${consequence.type} at turn ${currentTurn}`);

      const result = executeConsequence(consequence, gameState, {
        updateWealth,
        updateHealth,
        updateEnergy,
        updateInventory,
        toast
      });

      triggeredConsequences.push(result);
    } else {
      // Not yet time for this consequence
      remainingConsequences.push(consequence);
    }
  }

  // Update gameState to remove triggered consequences
  gameState.pendingConsequences = remainingConsequences;

  return triggeredConsequences;
};

/**
 * Execute a single consequence and apply its effects
 * @param {Object} consequence - The consequence to execute
 * @param {Object} gameState - Current game state
 * @param {Object} handlers - Handler functions for state updates
 * @returns {Object} Result with narrative and applied effects
 */
const executeConsequence = (consequence, gameState, handlers) => {
  const { updateWealth, updateHealth, updateEnergy, updateInventory, toast } = handlers;

  if (consequence.type === 'extortion_retaliation') {
    return executeExtortionRetaliation(consequence, gameState, handlers);
  }

  if (consequence.type === 'lottery_result') {
    return executeLotteryResult(consequence, gameState, handlers);
  }

  // Default fallback
  console.warn('[Consequence] Unknown consequence type:', consequence.type);
  return {
    narrative: `Something unexpected happened related to ${consequence.description || 'past events'}.`,
    effects: []
  };
};

/**
 * Execute extortion retaliation consequences
 * @param {Object} consequence - The consequence data
 * @param {Object} gameState - Current game state
 * @param {Object} handlers - Handler functions
 * @returns {Object} Result with narrative and effects
 */
const executeExtortionRetaliation = (consequence, gameState, handlers) => {
  const { updateWealth, updateHealth, updateEnergy, updateInventory, toast } = handlers;
  const { data } = consequence;
  const { npcName, retaliationType, severity, threatener, originalAmount } = data;

  let narrative = '';
  const effects = [];

  switch (retaliationType) {
    case 'vandalism': {
      // Shop vandalized - lose random items, repair costs
      const severityMultiplier = { low: 1, medium: 2, high: 3 }[severity] || 2;
      const repairCost = Math.floor(originalAmount * 0.5 * severityMultiplier);
      const itemsLost = Math.floor(Math.random() * severityMultiplier) + 1;

      // Lose random inventory items
      const inventory = gameState.inventory || [];
      for (let i = 0; i < itemsLost && inventory.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * inventory.length);
        const lostItem = inventory[randomIndex];
        updateInventory(lostItem.name, -1, 'lost to vandalism');
        effects.push(`Lost ${lostItem.name}`);
      }

      // Pay repair costs
      updateWealth(-repairCost);
      effects.push(`Repair costs: ${repairCost} reales`);

      narrative = `You arrive at your shop to find the door broken and shelves overturned. ${npcName}'s retaliation for your refusal was swift and brutal. Broken jars litter the floor, and several valuable ingredients have been destroyed or stolen. The damage will cost ${repairCost} reales to repair.`;

      toast.error(`⚠️ VANDALISM! Lost items and ${repairCost}r repair costs`, { duration: 5000 });
      break;
    }

    case 'assault': {
      // Physical attack - health and energy damage
      const healthDamage = { low: 10, medium: 20, high: 35 }[severity] || 20;
      const energyLoss = { low: 15, medium: 25, high: 40 }[severity] || 25;

      updateHealth(-healthDamage);
      updateEnergy(-energyLoss);
      effects.push(`Health -${healthDamage}`, `Energy -${energyLoss}`);

      narrative = `As you leave your shop, shadowy figures emerge from an alley. ${npcName}'s associates move quickly, fists flying. You try to defend yourself, but they're too many. After a brutal beating, they leave you bruised and bleeding in the dirt, a warning against defying ${npcName} again.`;

      toast.error(`⚠️ ASSAULT! -${healthDamage} health, -${energyLoss} energy`, { duration: 5000 });
      break;
    }

    case 'theft': {
      // Burglary - lose multiple items and some money
      const stolenMoney = Math.floor(originalAmount * 1.5);
      const itemsStolen = { low: 2, medium: 3, high: 5 }[severity] || 3;

      updateWealth(-stolenMoney);
      effects.push(`Stolen: ${stolenMoney} reales`);

      const inventory = gameState.inventory || [];
      for (let i = 0; i < itemsStolen && inventory.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * inventory.length);
        const stolenItem = inventory[randomIndex];
        updateInventory(stolenItem.name, -1, 'stolen by thieves');
        effects.push(`Stolen: ${stolenItem.name}`);
      }

      narrative = `You wake to find your shop's lock broken. A quick inventory reveals the worst: ${stolenMoney} reales stolen from your cashbox, and valuable ingredients missing from your shelves. ${npcName} has made good on the threat. The loss stings far worse than any beating.`;

      toast.error(`⚠️ THEFT! Lost ${stolenMoney}r and ${itemsStolen} items`, { duration: 5000 });
      break;
    }

    case 'shop_closure': {
      // Official forces closure - can't work, lose reputation
      const closureDays = { low: 1, medium: 2, high: 3 }[severity] || 2;
      const fine = originalAmount * 2;

      updateWealth(-fine);
      effects.push(`Fine: ${fine} reales`, `Shop closed for ${closureDays} days`);

      // Note: Actual closure mechanic would need additional state tracking
      // For now, we just apply the fine and warn the player

      narrative = `An official delegation arrives at your door with a writ bearing ${npcName}'s seal. "By order of the colonial authorities, this establishment is hereby closed for inspection." They cite spurious violations and demand a fine of ${fine} reales. Your protests fall on deaf ears. ${npcName} has used official power to strike at your livelihood.`;

      toast.error(`⚠️ SHOP CLOSED! Fine: ${fine}r, closure for ${closureDays} days`, { duration: 5000 });
      break;
    }

    case 'investigation': {
      // Inquisition/official investigation - major reputation hit
      const reputationLoss = { low: 20, medium: 40, high: 60 }[severity] || 40;

      effects.push(`Reputation -${reputationLoss} (investigation)`);

      narrative = `Word spreads through Mexico City: ${npcName} has initiated an investigation into your background. Whispers about your converso heritage circulate among the elite. Former patrons avoid your shop, and suspicious glances follow you through the streets. The shadow of the Inquisition looms larger than ever.`;

      toast.error(`⚠️ INVESTIGATION! Reputation -${reputationLoss}`, { duration: 5000 });
      break;
    }

    case 'social_pressure': {
      // Social/religious consequences - reputation damage
      const reputationLoss = { low: 15, medium: 30, high: 50 }[severity] || 30;

      effects.push(`Reputation -${reputationLoss} (social pressure)`);

      narrative = `${npcName} has been busy spreading rumors. Congregants whisper as you pass the cathedral. Neighbors who once greeted you warmly now avert their eyes. Your converso heritage, once quietly tolerated, has become a subject of public scrutiny. Business slows as the faithful seek "more respectable" practitioners.`;

      toast.error(`⚠️ SOCIAL PRESSURE! Reputation -${reputationLoss}`, { duration: 5000 });
      break;
    }

    case 'inquisition_notice': {
      // Most severe - formal Inquisition attention
      const reputationLoss = 80;
      const fine = originalAmount * 3;

      updateWealth(-fine);
      effects.push(`Reputation -${reputationLoss} (Inquisition notice)`, `Fine: ${fine} reales`);

      narrative = `A messenger in black arrives with a formal summons from the Holy Office of the Inquisition. ${npcName}'s machinations have borne terrible fruit. You are "invited" to testify regarding your family's religious practices. The fine for "administrative costs" is ${fine} reales. The shadow that has haunted your family for generations now falls directly upon you.`;

      toast.error(`🔥 INQUISITION NOTICE! -${reputationLoss} reputation, ${fine}r fine`, { duration: 6000 });
      break;
    }

    case 'price_war': {
      // Rival apothecary undercuts prices
      const revenueLoss = Math.floor(originalAmount * 1.2);

      updateWealth(-revenueLoss);
      effects.push(`Lost revenue: ${revenueLoss} reales`);

      narrative = `${npcName} has begun selling remedies at impossibly low prices, drawing away your customers. Word on the street is they're taking a loss just to spite you. Your income this week drops by ${revenueLoss} reales as patients choose your rival's cheap medicines over your quality preparations.`;

      toast.error(`⚠️ PRICE WAR! Lost ${revenueLoss}r revenue`, { duration: 4000 });
      break;
    }

    case 'rumors': {
      // Reputation damage from spread rumors
      const reputationLoss = { low: 10, medium: 25, high: 40 }[severity] || 25;

      effects.push(`Reputation -${reputationLoss} (rumors)`);

      narrative = `${npcName} has been spreading vicious lies about your medical practice. Tales of failed treatments and botched diagnoses circulate through the markets. Some claim you use forbidden Hebrew texts. Others whisper about unnatural methods. Your reputation suffers as doubt spreads like plague through the city.`;

      toast.error(`⚠️ RUMORS SPREAD! Reputation -${reputationLoss}`, { duration: 4000 });
      break;
    }

    case 'sabotage': {
      // Subtle business sabotage
      const itemsLost = { low: 2, medium: 3, high: 4 }[severity] || 3;

      const inventory = gameState.inventory || [];
      for (let i = 0; i < itemsLost && inventory.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * inventory.length);
        const ruinedItem = inventory[randomIndex];
        updateInventory(ruinedItem.name, -1, 'sabotaged/contaminated');
        effects.push(`Ruined: ${ruinedItem.name}`);
      }

      narrative = `You discover several containers have been tampered with. ${npcName}'s agents must have slipped in while the shop was unattended. Valuable tinctures are contaminated, herbs have been replaced with worthless substitutes. The sabotage is subtle enough to maintain deniability, but the message is clear: cross ${npcName} and your business suffers.`;

      toast.error(`⚠️ SABOTAGE! ${itemsLost} items ruined`, { duration: 4000 });
      break;
    }

    case 'intimidation': {
      // Minor consequence - warning/scare
      const energyLoss = { low: 10, medium: 15, high: 20 }[severity] || 15;

      updateEnergy(-energyLoss);
      effects.push(`Energy -${energyLoss} (stress)`);

      narrative = `${npcName}'s associates have been lurking near your shop, making their presence known without taking direct action. The constant sense of being watched wears on you. You find yourself jumping at shadows, sleeping poorly. The psychological toll is exhausting.`;

      toast.warning(`⚠️ INTIMIDATION! -${energyLoss} energy from stress`, { duration: 3000 });
      break;
    }

    case 'retaliation_for_snitching': {
      // Reported to authorities but they tipped off the extorter - severe
      const healthDamage = 25;
      const reputationLoss = 40;
      const stolenMoney = originalAmount * 2;

      updateHealth(-healthDamage);
      updateWealth(-stolenMoney);
      effects.push(`Health -${healthDamage}`, `Stolen: ${stolenMoney} reales`, `Reputation -${reputationLoss}`);

      narrative = `Your attempt to report ${npcName} to the authorities has backfired catastrophically. Corrupt officials tipped them off, and the retaliation is swift and brutal. You're assaulted in broad daylight, your shop is ransacked, and ${stolenMoney} reales are taken. Worse, word spreads that you're a "snitch" - your standing in the community plummets. The authorities you trusted have betrayed you.`;

      toast.error(`🔥 BRUTAL RETALIATION! Corrupt authorities betrayed you!`, { duration: 6000 });
      break;
    }

    default:
      narrative = `${npcName} has made good on their threat. The consequences of defying them are severe.`;
      toast.warning(`⚠️ Consequence from ${npcName}`, { duration: 3000 });
  }

  return {
    narrative,
    effects,
    consequence
  };
};

/**
 * Execute lottery drawing result
 * @param {Object} consequence - The consequence data
 * @param {Object} gameState - Current game state
 * @param {Object} handlers - Handler functions
 * @returns {Object} Result with narrative and effects
 */
const executeLotteryResult = (consequence, gameState, handlers) => {
  const { updateWealth, toast } = handlers;
  const { data } = consequence;
  const { npcName, wager, potentialWin, drawingTurns } = data;

  let narrative = '';
  const effects = [];

  // Determine if player won (10% chance - historically accurate low odds)
  const won = Math.random() < 0.10;

  if (won) {
    // Player won the lottery!
    updateWealth(potentialWin);
    effects.push(`Won lottery: +${potentialWin} reales`);

    narrative = `${npcName} arrives at your shop, his face beaming with an uncharacteristic smile. "Doña Maria! Blessed news! Your ticket was drawn at the cathedral steps this afternoon! The Virgin smiles upon you!" He counts out ${potentialWin} reales into your palm, seeming genuinely delighted by your good fortune. "Perhaps some of your luck will rub off on me," he says wistfully, before bowing and departing.`;

    toast.success(`🎉 LOTTERY WIN! +${potentialWin} reales!`, { duration: 5000 });

    // Update gambling history if it exists
    if (gameState.gamblingHistory?.byNPC) {
      if (!gameState.gamblingHistory.byNPC[npcName]) {
        gameState.gamblingHistory.byNPC[npcName] = {
          totalWins: 0,
          totalLosses: 0,
          netGain: 0,
          lastGameType: 'lottery',
          lastInteraction: consequence.triggerTurn
        };
      }
      const npcHistory = gameState.gamblingHistory.byNPC[npcName];
      npcHistory.totalWins++;
      npcHistory.netGain += (potentialWin - wager);
      npcHistory.lastGameType = 'lottery';
      npcHistory.lastInteraction = consequence.triggerTurn;
    }
  } else {
    // Player lost
    effects.push(`Lottery ticket did not win`);

    narrative = `${npcName} approaches your shop, his expression apologetic. "I'm sorry, Doña Maria. Your number was not drawn at this afternoon's lottery. The Virgin's blessings fell to another this time." He spreads his hands helplessly. "Perhaps next week? I'll be selling tickets again if you're interested." With a resigned bow, he departs, his threadbare doublet disappearing into the afternoon crowd.`;

    toast.info(`No luck this time - ticket didn't win`, { duration: 3500 });

    // Update gambling history if it exists
    if (gameState.gamblingHistory?.byNPC) {
      if (!gameState.gamblingHistory.byNPC[npcName]) {
        gameState.gamblingHistory.byNPC[npcName] = {
          totalWins: 0,
          totalLosses: 0,
          netGain: 0,
          lastGameType: 'lottery',
          lastInteraction: consequence.triggerTurn
        };
      }
      const npcHistory = gameState.gamblingHistory.byNPC[npcName];
      npcHistory.totalLosses++;
      npcHistory.netGain -= wager;
      npcHistory.lastGameType = 'lottery';
      npcHistory.lastInteraction = consequence.triggerTurn;
    }
  }

  console.log(`[Lottery] Result: ${won ? 'WON' : 'LOST'} (${potentialWin}r potential win)`);

  return {
    narrative,
    effects,
    consequence
  };
};

/**
 * Get a warning message for upcoming consequences (optional preview system)
 * @param {Object} gameState - Current game state
 * @param {number} currentTurn - Current turn number
 * @param {number} lookAhead - How many turns ahead to check (default 2)
 * @returns {Array} Array of upcoming consequence warnings
 */
export const getUpcomingConsequenceWarnings = (gameState, currentTurn, lookAhead = 2) => {
  if (!gameState.pendingConsequences || gameState.pendingConsequences.length === 0) {
    return [];
  }

  const warnings = [];
  const cutoff = currentTurn + lookAhead;

  for (const consequence of gameState.pendingConsequences) {
    if (consequence.triggerTurn <= cutoff && consequence.triggerTurn > currentTurn) {
      const turnsUntil = consequence.triggerTurn - currentTurn;
      warnings.push({
        description: consequence.description,
        turnsUntil,
        severity: consequence.data?.severity || 'medium'
      });
    }
  }

  return warnings;
};
