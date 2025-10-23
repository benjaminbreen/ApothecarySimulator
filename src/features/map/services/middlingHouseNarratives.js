/**
 * Pre-written Movement Narratives: Middling House Interior
 *
 * A modest but respectable 4-room house for a middling-class family
 * Time-of-day variants: morning (6-12), afternoon (12-18), evening (18+)
 * Grid: 110px movement steps
 * Rooms: Sala (reception), Master Bedroom, Second Bedroom, Storage/Pantry
 */

/**
 * Parse time string to hour number
 * @param {string} timeStr - Time string like "8:00 AM" or "2:30 PM"
 * @returns {number} - Hour in 24-hour format
 */
function parseTimeString(timeStr) {
  if (!timeStr) return 12; // Default to noon
  const [time, period] = timeStr.split(' ');
  const [hour, minute] = time.split(':').map(Number);

  if (period === 'PM' && hour !== 12) return hour + 12;
  if (period === 'AM' && hour === 12) return 0;
  return hour;
}

/**
 * Get time of day period
 * @param {number} hour - Hour in 24-hour format
 * @returns {string} - 'morning', 'afternoon', or 'evening'
 */
function getTimeOfDayPeriod(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Middling House Interior Movement Narratives
 * Key positions across 4 rooms
 */
export const MIDDLING_HOUSE_NARRATIVES = {
  // ===== SALA (Reception/Living Area) =====

  // Center of sala (near dining table)
  '660,550': {
    morning: `You stand in the center of the sala, the household's public face, morning light streaming through the shuttered windows. The dining table before you is already set for the morning meal—simple but proper, with clean linens and matching dishes. This room announces respectability to visitors.`,
    afternoon: `You occupy the middle of the sala as afternoon warmth fills the reception room. The dining table dominates the space, its polished surface reflecting the family's aspirations—not wealthy, but maintaining standards. A religious painting on the wall reminds visitors that this is a godly household.`,
    evening: `You stand in the sala's center as evening approaches, candles ready to be lit on the dining table. This room transforms at night into the family's gathering space—the public persona giving way to private intimacy. Soon the household will assemble here for the evening meal and prayers.`,
    nearbyPOIs: ['Dining Table', 'Religious Painting']
  },

  // Near sala entrance
  '660,660': {
    morning: `You stand near the sala's entrance, morning air flowing in when the door opens to admit visitors or family members departing for the day's work. This threshold marks the boundary between public street and private home—crossed with formality, never casually.`,
    afternoon: `You occupy the area near the main entrance, afternoon shadows falling across the doorway. Visitors would be received here first, judged by how they're greeted—invited deeper into the house for intimates, kept in the sala for business acquaintances, turned away at the threshold for the unwelcome.`,
    evening: `You stand by the entrance as evening falls, the door now bolted against the night. The sala becomes an interior space, sealed off from the dangerous darkness outside. Family only now—the public mask can finally be removed.`,
    nearbyPOIs: ['Dining Table']
  },

  // Near master bedroom door (north wall of sala)
  '660,330': {
    morning: `You stand at the threshold between sala and master bedroom, morning routines flowing between public and private spaces. The parents emerge from their room ready to face the day; later they'll retreat back through this doorway for the siesta.`,
    afternoon: `You occupy the doorway connecting sala to master bedroom, afternoon quiet suggesting someone rests behind the closed door. Privacy matters in a house this size—each room can be sealed off, unlike the single-room hovels where families have no secrets.`,
    evening: `You stand near the door to the master bedroom as evening approaches, the boundary between family space and parental privacy. Children know not to enter without permission; this room belongs to the household heads alone.`,
    nearbyPOIs: ['Dining Table']
  },

  // ===== MASTER BEDROOM =====

  // Center of master bedroom (near bed)
  '660,220': {
    morning: `You stand in the master bedroom, morning light revealing the room's modest but real comforts—a proper bed with frame and mattress, not just a straw pallet. The room is tidy, the bed already made, linens smoothed. Order maintained even in private spaces.`,
    afternoon: `You occupy the center of the master bedroom, afternoon silence amplifying the room's role as adult sanctuary. This space belongs to the household heads—their bed, their chest of belongings, their escape from children and servants. A rare luxury of privacy.`,
    evening: `You stand in the master bedroom as evening falls, candlelight casting intimate shadows across the bed and furniture. Soon the parents will retire here, the day's burdens shed with their clothing. The room becomes a refuge, a marriage bed, a place for whispered adult conversations.`,
    nearbyPOIs: ['Master Bed', 'Clothing Chest', 'Writing Desk']
  },

  // Near writing desk
  '550,330': {
    morning: `You stand beside the writing desk positioned near the wall, morning light good for reading correspondence or managing household accounts. The desk's presence announces literacy, education, participation in the world of written business beyond manual labor.`,
    afternoon: `You occupy the corner where the writing desk sits, afternoon quiet perfect for the concentration writing requires. Ledgers might rest here, or letters to business contacts, or the household accounts carefully tallied. Evidence of middle-class aspirations recorded in ink.`,
    evening: `You stand by the writing desk as evening approaches, candlelight soon to illuminate whatever evening work awaits—correspondence to finish, accounts to balance, records to update. The desk transforms from furniture to tool of economic survival.`,
    nearbyPOIs: ['Writing Desk', 'Master Bed']
  },

  // ===== SECOND BEDROOM =====

  // Center of second bedroom (near bed)
  '220,220': {
    morning: `You stand in the second bedroom, morning chaos of children dressing or servants preparing evident in the unmade bed and scattered belongings. This room serves whoever needs it—children, visiting relatives, domestic help. Less precious than the master bedroom, but still private space.`,
    afternoon: `You occupy the center of the second bedroom in afternoon quiet, the room tidied from morning disarray. The bed, shelf, and chest suggest multiple inhabitants—siblings sharing, perhaps, or a rotating cast of household dependents. Privacy divided rather than absolute.`,
    evening: `You stand in the second bedroom as evening falls, the room preparing for sleep. Whoever occupies this space tonight—children, servants, poor relations—they at least have a door that closes, a room that's theirs. More than many can claim.`,
    nearbyPOIs: ['Bed', 'Storage Chest', 'Shelf']
  },

  // Near shelf
  '110,220': {
    morning: `You stand beside the wooden shelf mounted on the wall, morning light revealing its contents—books perhaps, if the family is literate, or practical items like candles and linens. The shelf organizes the room's necessities, preventing chaos in the shared space.`,
    afternoon: `You occupy the corner near the shelf, afternoon shadows falling across whatever items it holds. In a house of this class, storage matters—everything must have its place, or the limited space becomes unlivable. Order imposed on modest means.`,
    evening: `You stand by the shelf as evening approaches, its contents soon to be needed—nightclothes retrieved, candles taken down, the practical items that sustain daily life. The shelf serves whoever currently occupies this room, adapting to their needs.`,
    nearbyPOIs: ['Shelf', 'Bed']
  },

  // ===== STORAGE/PANTRY =====

  // Center of storage room (near shelves)
  '220,550': {
    morning: `You stand in the storage room, morning inventory revealing the household's provisions—shelves holding preserved foods, linens, extra household goods. This room measures the family's security, their buffer against hunger and want. A full pantry means stability.`,
    afternoon: `You occupy the center of the storage space, afternoon light filtering through cracks to illuminate rows of carefully organized supplies. The two storage shelves dominate the room, their contents representing months of careful accumulation. Wealth measured in sacks of corn and folded cloth.`,
    evening: `You stand amid the storage room as evening falls, the day's consumption about to be measured against tomorrow's needs. The shelves and chest hold the family's economic cushion—not luxury, but sufficiency. The difference between middling comfort and poverty visible in preserved food and stored goods.`,
    nearbyPOIs: ['Storage Shelf', 'Food Chest']
  },

  // Near sala door (east wall)
  '440,550': {
    morning: `You stand near the doorway connecting storage to sala, morning traffic flowing between the two rooms as provisions are retrieved for breakfast preparation. The storage room feeds the household's daily needs, its contents slowly depleted and replenished in the cycle of commerce.`,
    afternoon: `You occupy the threshold between storage and sala, afternoon quiet suggesting provisions are set for the day. The door can close, securing the family's supplies from curious eyes or opportunistic hands. Trust measured by who's allowed into this room unsupervised.`,
    evening: `You stand at the doorway to the sala as evening approaches, the storage room about to yield ingredients for the evening meal. The movement between these spaces traces the daily rhythm—storage to preparation to consumption to waste. The household economy made visible.`,
    nearbyPOIs: ['Storage Shelf']
  },

  // Near pantry chest (south end)
  '220,660': {
    morning: `You stand near the food chest at the south end of the storage room, morning smells of preserved foods and stored grains rising from its interior. The chest guards the family's most precious commodities—foodstuffs that mean the difference between eating well and going hungry.`,
    afternoon: `You occupy the area near the pantry chest, afternoon heat making the storage room stuffy but preserving the foods within. The chest is substantial, iron-bound, worthy of its contents. Unlike the poor who store nothing because they have nothing, this family maintains reserves.`,
    evening: `You stand by the food chest as evening approaches, its contents about to be accessed for the meal. The chest represents foresight—buying in bulk when prices are low, storing for lean times, maintaining household security. Middle-class virtues embodied in a wooden box.`,
    nearbyPOIs: ['Food Chest', 'Storage Shelf']
  }
};

/**
 * Get narrative for a position in the middling house
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} currentTime - Current game time (e.g., "8:00 AM")
 * @returns {Object|null} - Narrative data or null if no narrative for this position
 */
export function getMiddlingHouseNarrative(x, y, currentTime = null) {
  const MOVEMENT_STEP = 110;

  // Round to nearest grid point
  const gridX = Math.round(x / MOVEMENT_STEP) * MOVEMENT_STEP;
  const gridY = Math.round(y / MOVEMENT_STEP) * MOVEMENT_STEP;

  const key = `${gridX},${gridY}`;
  const narrativeData = MIDDLING_HOUSE_NARRATIVES[key];

  if (!narrativeData) {
    return null;
  }

  // If time-based variants exist, select based on current time
  if (narrativeData.morning && narrativeData.afternoon && narrativeData.evening) {
    const hour = parseTimeString(currentTime);
    const period = getTimeOfDayPeriod(hour);

    return {
      description: narrativeData[period],
      nearbyPOIs: narrativeData.nearbyPOIs || []
    };
  }

  // Return single narrative if no time variants
  return narrativeData;
}
