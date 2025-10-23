/**
 * NPC Condition System
 *
 * Simple condition checks for NPCs to determine when they should appear.
 * Replaces rigid turn-based scripted events with flexible state-based conditions.
 *
 * Each NPC condition returns:
 * - available: boolean (can this NPC appear now?)
 * - weight: number (multiplier for selection weight, 1.0 = normal)
 * - reason: string (why this NPC is prioritized, for debugging)
 */

/**
 * Parse time string to hour (24-hour format)
 * @param {string} timeStr - Time in format "H:MM AM/PM"
 * @returns {number} - Hour in 24-hour format (0-23)
 */
function parseTimeToHour(timeStr) {
  if (!timeStr) return 12; // Default to noon if no time provided

  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 12;

    let hour = parseInt(match[1]);
    const period = match[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    return hour;
  } catch (e) {
    console.warn('[npcConditions] Error parsing time:', timeStr, e);
    return 12;
  }
}

/**
 * Check if an NPC should appear based on game state
 * @param {string} npcName - Name of the NPC to check
 * @param {Object} gameState - Current game state
 * @returns {{available: boolean, weight: number, reason: string|null}}
 */
export function checkNPCConditions(npcName, gameState) {
  const {
    date,
    time,
    location,
    reputation = {},
    turnNumber = 0,
    currentWealth = 0,
    shopSign = {}
  } = gameState;

  // Default: NPC is available with normal weight
  let available = true;
  let weight = 1.0;
  let reason = null;

  switch (npcName) {
    // ==================== CRITICAL STORY NPCs ====================

    case "Don Luis":
      // Debt collector - appears when deadline approaches or passes
      try {
        const debtDeadline = new Date('1680-08-23T20:00:00');
        const currentDate = new Date(date + ' ' + time);
        const daysUntilDeadline = Math.ceil((debtDeadline - currentDate) / (1000 * 60 * 60 * 24));

        if (daysUntilDeadline <= 0) {
          // Deadline passed - VERY high priority
          weight = 100;
          reason = "Debt deadline has passed";
        } else if (daysUntilDeadline <= 1) {
          // Deadline is tomorrow - high priority
          weight = 50;
          reason = "Debt deadline is tomorrow";
        } else if (daysUntilDeadline <= 3) {
          // Deadline within 3 days - elevated priority
          weight = 10;
          reason = "Debt deadline approaches";
        }
      } catch (e) {
        console.warn('[npcConditions] Could not parse date for Don Luis check:', e);
      }
      break;

    case "Inquisitor Fernando":
      // Inquisitor - appears based on low church reputation, not turn number
      const churchRep = reputation.church || 50;

      if (churchRep < 20) {
        // Very low church reputation - high danger
        weight = 30;
        reason = "Church reputation critically low";
      } else if (churchRep < 30) {
        // Low church reputation - moderate danger
        weight = 15;
        reason = "Church reputation low";
      } else if (churchRep < 40) {
        // Slightly low church reputation - slight danger
        weight = 5;
        reason = "Church reputation concerning";
      } else if (turnNumber < 15) {
        // Too early in game - don't appear yet
        available = false;
        reason = "Too early for Inquisitor appearance";
      }
      break;

    case "Antonius Philalethes":
      // Valencian Alchemist - appears mid-game with knowledge quest
      if (turnNumber < 10) {
        available = false;
        reason = "Too early for alchemist questline";
      } else if (turnNumber >= 10 && turnNumber <= 15) {
        // Optimal window for first appearance
        weight = 8;
        reason = "Alchemist questline ready to trigger";
      }
      break;

    // ==================== FACTION-BASED CONDITIONS ====================

    case "Padre Juan":
    case "Sister María":
    case "Friar Tomás":
      // Church NPCs - more likely if at church or if church reputation is good
      if (location && location.toLowerCase().includes('church')) {
        weight = 5;
        reason = "At church location";
      } else if ((reputation.church || 50) > 70) {
        weight = 2;
        reason = "Good standing with church";
      }
      break;

    case "Leonor Méndez de Arteaga":
      // Silk merchant - more likely at market or if player has wealth
      if (location && location.toLowerCase().includes('market')) {
        weight = 4;
        reason = "At market location";
      } else if (currentWealth > 100) {
        weight = 2;
        reason = "Player has purchasing power";
      }
      break;

    case "Esteban Velázquez":
      // Muleteer - appears mid-game, more likely if player needs help
      if (turnNumber < 15) {
        available = false;
        reason = "Too early for muleteer";
      } else if ((reputation.church || 50) < 35) {
        // Player might need escape route soon
        weight = 3;
        reason = "Player may need transportation assistance";
      }
      break;

    case "Xochiquetzal":
      // Nahua healer - appears later game, location-sensitive
      if (turnNumber < 20) {
        available = false;
        reason = "Too early for indigenous healer";
      } else if (location && !location.toLowerCase().includes('botica')) {
        // More likely to encounter outside the shop
        weight = 3;
        reason = "Outside shop, chance to meet healer";
      }
      break;

    case "Tía Makeda":
      // African elder - appears mid-game, reputation with common folk matters
      if (turnNumber < 12) {
        available = false;
        reason = "Too early for Tía Makeda";
      } else if ((reputation.commonFolk || 50) > 60) {
        weight = 2;
        reason = "Good reputation with common folk";
      }
      break;

    // ==================== LOCATION-BASED CONDITIONS ====================

    case "Catalina de Fuentes":
      // Elite woman - more likely at social locations or if elite reputation is good
      if ((reputation.elite || 50) > 60) {
        weight = 2;
        reason = "Good standing with elite";
      }
      break;

    // ==================== SIMPLE INTERACTION NPCs ====================

    case "Pedro Vázquez":
      // Water seller - appears during daytime at shop
      const hour = parseTimeToHour(time);
      if (hour < 8 || hour > 18) {
        // Not working hours for water seller
        available = false;
        reason = "Water seller doesn't work at night";
      } else if (location && location.toLowerCase().includes('botica')) {
        // Balanced frequency with other simple interactions
        weight = 5;
        reason = "Water seller making rounds";
      } else {
        weight = 2;
        reason = "Chance encounter with water seller";
      }
      break;

    case "Widow Socorro":
      // Beggar - appears during day, more likely if player has good reputation
      const hourSocorro = parseTimeToHour(time);
      if (hourSocorro < 7 || hourSocorro > 19) {
        available = false;
        reason = "Widow Socorro seeks shelter at night";
      } else if ((reputation.commonFolk || 50) >= 60) {
        // Known to be kind to the poor
        weight = 6;
        reason = "Widow knows Maria is charitable";
      } else if ((reputation.commonFolk || 50) >= 40) {
        weight = 5;
        reason = "Widow has heard Maria might help";
      } else {
        weight = 4;
        reason = "Widow desperate enough to ask anyone";
      }
      break;

    case "Don Rodrigo Salazar":
      // Rival apothecary - appears when shop sign is hung and reputation is rising
      if (!shopSign.hung) {
        available = false;
        reason = "Rival doesn't notice Maria until shop sign hung";
      } else if (turnNumber < 5) {
        available = false;
        reason = "Too early for rival to appear";
      } else if ((reputation.merchants || 50) >= 65) {
        // Maria's reputation threatens rival
        weight = 6;
        reason = "Rival threatened by Maria's reputation";
      } else if ((reputation.merchants || 50) >= 50) {
        weight = 5;
        reason = "Rival scouting competitor";
      } else {
        weight = 4;
        reason = "Rival keeping tabs on new apothecary";
      }
      break;

    case "Tomás Cruz":
      // Street urchin gossip - appears randomly during day, more if player pays
      const hourTomas = parseTimeToHour(time);
      if (hourTomas < 6 || hourTomas > 20) {
        available = false;
        reason = "Tomás sleeping in alley";
      } else if (location && (location.toLowerCase().includes('market') || location.toLowerCase().includes('street'))) {
        // More likely to encounter on streets/market
        weight = 6;
        reason = "Tomás spotted on the streets";
      } else {
        weight = 5;
        reason = "Tomás making his rounds";
      }
      break;

    case "Sister Teresa de Ávila":
      // Friendly nun - appears occasionally, more when player needs warnings
      if (turnNumber < 8) {
        available = false;
        reason = "Too early for nun's friendship";
      } else if ((reputation.church || 50) < 30) {
        // Trying to warn Maria of danger
        weight = 6;
        reason = "Sister Teresa concerned about Inquisition threat";
      } else if ((reputation.church || 50) >= 60) {
        // Friendly social visits
        weight = 5;
        reason = "Sister Teresa friendly visit";
      } else {
        weight = 4;
        reason = "Sister Teresa passing by";
      }
      break;

    case "Martín the Tax Collector":
      // Tax collector seeking 'voluntary donations'
      const hourMartin = parseTimeToHour(time);
      if (hourMartin < 9 || hourMartin > 17) {
        // Not working hours for officials
        available = false;
        reason = "Tax collector only works during business hours";
      } else if (location && location.toLowerCase().includes('botica')) {
        // Shop visits during business hours
        weight = 5;
        reason = "Tax collector making rounds";
      } else {
        weight = 3;
        reason = "Chance encounter with tax collector";
      }
      break;

    case "Citlali":
      // Indigenous weaver selling textiles
      const hourCitlali = parseTimeToHour(time);
      if (hourCitlali < 8 || hourCitlali > 17) {
        available = false;
        reason = "Citlali returns to Texcoco before dark";
      } else if (location && (location.toLowerCase().includes('market') || location.toLowerCase().includes('plaza'))) {
        weight = 6;
        reason = "Citlali selling in the market";
      } else {
        weight = 5;
        reason = "Citlali making her rounds";
      }
      break;

    case "Gaspar the Night Watchman":
      // Night watchman running protection racket
      const hourGaspar = parseTimeToHour(time);
      if (hourGaspar >= 6 && hourGaspar < 20) {
        // Only appears at night
        available = false;
        reason = "Gaspar only patrols at night";
      } else if (location && location.toLowerCase().includes('botica')) {
        weight = 5;
        reason = "Gaspar on his rounds";
      } else {
        weight = 4;
        reason = "Gaspar patrolling streets";
      }
      break;

    case "Rodrigo the Musician":
      // Street musician seeking tips
      const hourRodrigo = parseTimeToHour(time);
      if (hourRodrigo < 10 || hourRodrigo > 21) {
        available = false;
        reason = "Rodrigo sleeping off last night's pulque";
      } else if (location && (location.toLowerCase().includes('plaza') || location.toLowerCase().includes('market'))) {
        weight = 6;
        reason = "Rodrigo performing in public spaces";
      } else {
        weight = 5;
        reason = "Rodrigo wandering and singing";
      }
      break;

    case "Juana the Milk Vendor":
      // Milk vendor making daily rounds
      const hourJuana = parseTimeToHour(time);
      if (hourJuana < 6 || hourJuana > 12) {
        // Milk sold in morning only (goes bad in heat)
        available = false;
        reason = "Juana only sells milk in the morning";
      } else if (location && location.toLowerCase().includes('botica')) {
        weight = 6;
        reason = "Juana on her morning rounds";
      } else {
        weight = 5;
        reason = "Juana selling milk nearby";
      }
      break;

    case "Don Esteban the Lottery Seller":
      // Lottery ticket seller (fallen merchant)
      const hourEsteban = parseTimeToHour(time);
      if (hourEsteban < 9 || hourEsteban > 18) {
        available = false;
        reason = "Don Esteban retired for the day";
      } else {
        weight = 5;
        reason = "Don Esteban selling lottery tickets";
      }
      break;

    case "Miguel the Apprentice":
      // Young man seeking apprenticeship
      if (turnNumber < 7) {
        available = false;
        reason = "Miguel hasn't arrived in the city yet";
      } else if (location && location.toLowerCase().includes('botica')) {
        // More likely to approach apothecary shops
        weight = 5;
        reason = "Miguel seeking apothecary apprenticeship";
      } else {
        weight = 3;
        reason = "Miguel searching for work";
      }
      break;

    case "Señora Beatriz":
      // Complaining neighbor
      const hourBeatriz = parseTimeToHour(time);
      if (hourBeatriz < 8 || hourBeatriz > 19) {
        available = false;
        reason = "Señora Beatriz at home for the evening";
      } else if (location && location.toLowerCase().includes('botica')) {
        // Only appears at the shop (neighbor)
        weight = 5;
        reason = "Señora Beatriz with a complaint";
      } else {
        available = false;
        reason = "Señora Beatriz only visits the shop";
      }
      break;

    case "Padre Alonso the Sacristan":
      // Church donation collector
      const hourAlonso = parseTimeToHour(time);
      if (hourAlonso < 9 || hourAlonso > 17) {
        available = false;
        reason = "Padre Alonso at cathedral for prayers";
      } else if ((reputation.church || 50) < 40) {
        // More pressure if church reputation is low
        weight = 6;
        reason = "Padre Alonso pressing for donations";
      } else {
        weight = 5;
        reason = "Padre Alonso collecting for the church";
      }
      break;

    case "Carmen the Fish Seller":
      // Fish seller from Xochimilco
      const hourCarmen = parseTimeToHour(time);
      if (hourCarmen < 7 || hourCarmen > 14) {
        // Must sell fish before they spoil in afternoon heat
        available = false;
        reason = "Carmen's fish sold out or spoiled";
      } else {
        weight = 5;
        reason = "Carmen selling fresh fish";
      }
      break;

    // ==================== DEFAULT ====================

    default:
      // No special conditions for this NPC
      // Return default values (available: true, weight: 1.0, reason: null)
      break;
  }

  return { available, weight, reason };
}

/**
 * Get critical NPC that MUST appear now (overrides normal selection)
 * Used for story-critical moments that can't be missed
 * @param {Object} gameState - Current game state
 * @returns {string|null} - NPC name or null
 */
export function getCriticalNPC(gameState) {
  const { date, time } = gameState;

  // Check Don Luis debt deadline (absolute priority)
  try {
    const debtDeadline = new Date('1680-08-23T20:00:00');
    const currentDate = new Date(date + ' ' + time);
    const daysUntilDeadline = Math.ceil((debtDeadline - currentDate) / (1000 * 60 * 60 * 24));

    if (daysUntilDeadline <= 0 && daysUntilDeadline > -2) {
      // Deadline passed but within 2 days - Don Luis MUST appear
      console.log('[npcConditions] CRITICAL: Don Luis debt deadline');
      return "Don Luis";
    }
  } catch (e) {
    console.warn('[npcConditions] Could not parse date for critical check:', e);
  }

  // No critical NPC required
  return null;
}

/**
 * Filter NPCs by basic availability (before weighting)
 * @param {Array<Object>} npcs - Array of NPC entities
 * @param {Object} gameState - Current game state
 * @returns {Array<Object>} - Filtered NPCs that are available
 */
export function filterAvailableNPCs(npcs, gameState) {
  return npcs.filter(npc => {
    const { available } = checkNPCConditions(npc.name, gameState);
    if (!available) {
      console.log(`[npcConditions] Filtering out ${npc.name} - not available yet`);
    }
    return available;
  });
}
