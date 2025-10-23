/**
 * Pre-written Movement Narratives: Humble House Interior
 *
 * Single-room dwelling for a poor family
 * Time-of-day variants: morning (6-12), afternoon (12-18), evening (18+)
 * Grid: 110px movement steps
 * Room bounds: 50-450 (x), 50-450 (y)
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
 * Humble House Interior Movement Narratives
 * Key positions across the single main room
 */
export const HUMBLE_HOUSE_NARRATIVES = {
  // Near entrance door (south side)
  '220,440': {
    morning: `You stand near the threshold of this humble dwelling, morning light filtering through gaps in the rough wooden door. The earthen floor is swept clean despite the poverty—someone maintains what little dignity remains in this cramped space.`,
    afternoon: `You occupy the area near the door, harsh afternoon sun creating bright stripes across the dirt floor through cracks in the walls. The heat makes the small room feel even more oppressive and airless.`,
    evening: `You stand by the door as evening shadows pool in the corners of this modest dwelling. The fading light reveals how truly small this space is—an entire family's life contained in one room no larger than a wealthy person's closet.`,
    nearbyPOIs: ['Storage Chest']
  },

  // Center of main room
  '220,220': {
    morning: `You stand in the heart of this single-room dwelling, morning light revealing its dual nature—bedroom, kitchen, workshop, and living space all compressed into one cramped square. The rough table before you bears witness to every meal, every mended garment, every whispered prayer.`,
    afternoon: `You occupy the center of the main room, afternoon heat making the confined space sweltering. Everything happens here—sleeping, eating, working, dying. The table dominates this central space, the family's only furniture of consequence.`,
    evening: `You stand in the middle of the room as evening approaches, smoke from the hearth beginning to accumulate near the low ceiling. This is where the family will gather soon—crowded around the rough table for their simple meal before collapsing onto straw mattresses.`,
    nearbyPOIs: ['Rough Table', 'Cooking Hearth']
  },

  // Sleeping corner (northeast - near bed)
  '110,110': {
    morning: `You stand in the sleeping corner where the straw mattress lies against the wall, morning light showing its threadbare covering. The mattress is already rolled up—in such tight quarters, every inch must serve multiple purposes throughout the day.`,
    afternoon: `You occupy the northeast corner designated for sleeping, though "afternoon" means nothing here—the straw bed never truly rests, pressed into service as seating when guests visit. The smell of unwashed bodies and straw mingles with smoke from the hearth.`,
    evening: `You stand near the sleeping area as evening falls, the straw mattress already unrolled in preparation for the night. Here an entire family will sleep—parents, children, perhaps grandparents—their bodies providing warmth in the cold highland nights.`,
    nearbyPOIs: ['Straw Mattress', 'Religious Icon']
  },

  // Cooking area (east side - near hearth)
  '440,220': {
    morning: `You stand beside the cooking hearth built into the eastern wall, morning ashes still warm from last night's fire. A few blackened pots hang from iron hooks—the family's entire batterie de cuisine. The smell of old smoke permeates the adobe walls.`,
    afternoon: `You occupy the cooking area along the east wall, afternoon heat making the unlit hearth seem almost cool by comparison. Cooking will wait until evening when the family returns from their labors—one meal a day, if fortune permits.`,
    evening: `You stand by the hearth as evening falls and cooking fires are lit throughout the neighborhood. Soon this hearth will join them—a humble pot of beans and corn, perhaps some chile if there's money. The family's survival measured in handfuls of maize.`,
    nearbyPOIs: ['Cooking Hearth', 'Rough Table']
  },

  // Storage corner (south side - near chest)
  '110,440': {
    morning: `You stand near the storage chest in the southern corner, morning light revealing how little it contains. A family's entire material wealth—a few spare garments, perhaps some dried corn, a treasured possession or two. Everything else is used daily or doesn't exist.`,
    afternoon: `You occupy the storage corner where the family's meager possessions live in a rough wooden chest. Afternoon light shows the chest's worn surface, its simple construction. No lock—nothing here worth stealing except to those equally desperate.`,
    evening: `You stand by the storage chest as evening approaches, its lid closed on the family's few belongings. Tomorrow someone will open it to retrieve work clothes, or a shawl against the cold, or the last handful of corn kernels. Then close it again on the nearly empty interior.`,
    nearbyPOIs: ['Storage Chest']
  },

  // Religious wall (northeast - near icon)
  '330,110': {
    morning: `You stand before the eastern wall where a small religious icon hangs—the room's only decoration, the family's only luxury. Morning light catches the faded paint of the Virgin, her compassionate face watching over this humble space. Even the poorest maintain their faith.`,
    afternoon: `You occupy the corner near the religious icon mounted on the wall, afternoon shadows falling across the Virgin's painted face. Someone has placed a tiny wildflower before it—an offering that cost nothing but meant everything. Faith sustained by those who have nothing else.`,
    evening: `You stand beneath the religious icon as evening falls, its image barely visible in the gathering darkness. Soon the family will kneel here for evening prayers—the day's hardships offered up, tomorrow's bread petitioned for. The cycle continues, generation after generation.`,
    nearbyPOIs: ['Religious Icon', 'Straw Mattress']
  }
};

/**
 * Get narrative for a position in the humble house
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} currentTime - Current game time (e.g., "8:00 AM")
 * @returns {Object|null} - Narrative data or null if no narrative for this position
 */
export function getHumbleHouseNarrative(x, y, currentTime = null) {
  const MOVEMENT_STEP = 110;

  // Round to nearest grid point
  const gridX = Math.round(x / MOVEMENT_STEP) * MOVEMENT_STEP;
  const gridY = Math.round(y / MOVEMENT_STEP) * MOVEMENT_STEP;

  const key = `${gridX},${gridY}`;
  const narrativeData = HUMBLE_HOUSE_NARRATIVES[key];

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
