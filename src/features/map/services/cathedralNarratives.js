/**
 * Pre-written narratives for cathedral interior movement
 * Eliminates expensive LLM calls for simple position changes in Catedral Metropolitana
 *
 * Cathedral Layout:
 * - Total size: 1200×1000px
 * - Movement grid: 110px steps
 * - Rooms: Nave, Sanctuary, West Transept, East Transept, Sacristy
 * - Cross-shaped layout with grand religious architecture
 */

export const CATHEDRAL_INTERIOR_NARRATIVES = {
  // === NAVE (Main Central Hall) ===
  // X: 400-800, Y: 400-950
  // Central aisle for processions, pews on sides

  // Row 1 - Near sanctuary (Y: 440)
  '440,440': {
    morning: `You stand among the left pews near the sanctuary entrance, morning light streaming through high windows above. The Main Altar rises ahead to the north, its candles unlit but ready. Wooden pews surround you, their surfaces worn smooth by generations of worshippers. The air is cool and still.`,
    afternoon: `You stand among the left pews in the dim afternoon interior. The Main Altar ahead is barely visible in the shadowed sanctuary. The pews around you bear the marks of countless hours of prayer—worn wood, carved initials, dark stains from candle wax. The cathedral feels vast and quiet.`,
    evening: `You stand among the left pews as evening falls. Candlelight flickers from the sanctuary ahead, illuminating the Main Altar in warm gold. The pews around you fade into darkness. Shadows gather in the high vaulted ceiling above.`,
    nearbyPOIs: ['Pews', 'Main Altar']
  },

  '550,440': {
    morning: `You stand in the central aisle where nave meets sanctuary, the transition from congregational space to sacred ground. The Main Altar lies directly ahead to the north, framed by the sanctuary's stone arch. Morning light slants through clerestory windows, creating geometric patterns on the floor. The Pulpit rises to your right.`,
    afternoon: `You occupy the central aisle at the threshold between nave and sanctuary. The Main Altar ahead is shrouded in afternoon dimness. The stone floor beneath your feet is worn smooth by processional footsteps. The Pulpit to your right stands empty and shadowed.`,
    evening: `You stand in the central aisle as candlelight defines the boundary between nave and sanctuary. The Main Altar ahead glows with numerous candles. The stone threshold beneath your feet marks the division between common and sacred space. The Pulpit to your right catches flickering light.`,
    nearbyPOIs: ['Main Altar', 'Pulpit']
  },

  '660,440': {
    morning: `You stand in the central aisle, the main processional path opening before you toward the sanctuary. The Main Altar is clearly visible ahead; the Pulpit rises to your right. Morning light illuminates the path northward. The pews on either side are empty and waiting.`,
    afternoon: `You occupy the center of the processional aisle. The Main Altar ahead is dimly visible. The Pulpit to your right stands in shadow. The afternoon quiet is absolute—no footsteps, no voices, only the distant creak of settling wood.`,
    evening: `You stand in the central aisle as evening transforms the space. The Main Altar ahead blazes with candles. The Pulpit to your right is partially lit. Shadows pool between the pews on either side. The stone floor reflects candlelight.`,
    nearbyPOIs: ['Main Altar', 'Pulpit', 'Pews']
  },

  '770,440': {
    morning: `You stand among the right pews near the sanctuary, eastern light filtering through distant windows. The Pulpit rises nearby to your left, its carved wooden surface catching the morning glow. The door to the East Transept is visible to your right. The Main Altar is ahead to the north.`,
    afternoon: `You stand among the right pews in afternoon dimness. The Pulpit to your left is shadowed. The East Transept door to your right leads to deeper darkness. The pews around you are empty. Dust motes hang suspended in rare shafts of light.`,
    evening: `You stand among the right pews by candlelight. The Pulpit to your left catches warm light from the sanctuary candles. The East Transept door to your right is black. The pews around you are partially illuminated. Evening prayers echo faintly from the sanctuary.`,
    nearbyPOIs: ['Pews', 'Pulpit', 'East Side Altar']
  },

  // Row 2 - Mid-nave (Y: 550)
  '440,550': {
    morning: `You stand among the middle left pews, surrounded by rows of wooden benches. Morning light from the clerestory creates shifting patterns. The Main Altar is visible far to the north; the main entrance far to the south. The pews here show particular wear—this is where common folk worship. The western wall rises to your left.`,
    afternoon: `You occupy the middle left pews in afternoon shadow. The pews around you are empty, their wood dark and cool. The Main Altar to the north is barely discernible. The entrance to the south is distant. The western wall to your left bears moisture stains.`,
    evening: `You stand among the middle left pews by candlelight. The sanctuary candles to the north provide distant illumination. The entrance to the south is invisible in darkness. The pews around you fade into shadow. The western wall to your left is black.`,
    nearbyPOIs: ['Pews']
  },

  '550,550': {
    morning: `You stand in the central aisle at the nave's midpoint. The Main Altar is visible to the north; the main entrance to the south. Morning light streams from above, dividing the cathedral into zones of brightness and shadow. Pews flank you on both sides. The space feels balanced, symmetrical.`,
    afternoon: `You occupy the central aisle's midpoint. The Main Altar to the north is dim; the entrance to the south admits limited light. The pews on either side are shadowed. The cathedral's vast emptiness is palpable—your footsteps echo.`,
    evening: `You stand in the central aisle as candlelight from the sanctuary barely reaches this far. The Main Altar to the north glows distantly. The entrance to the south is dark. The pews on either side are invisible. You stand in a pool of near-darkness.`,
    nearbyPOIs: ['Pews']
  },

  '660,550': {
    morning: `You stand in the central processional aisle, equidistant from sanctuary and entrance. Morning light creates a path of illumination northward. The pews on either side are clearly visible. The stone floor beneath your feet is marked by centuries of use. The cathedral feels ancient, enduring.`,
    afternoon: `You occupy the central aisle in afternoon dimness. The processional path extends north and south into shadow. The pews on either side blend into darkness. The stone floor is cool beneath your feet. Silence presses in from all directions.`,
    evening: `You stand in the central aisle as candlelight from the sanctuary creates a faint glow to the north. The entrance to the south is black. The pews on either side are shadowed forms. The stone floor reflects nothing. Darkness dominates.`,
    nearbyPOIs: ['Pews']
  },

  '770,550': {
    morning: `You stand among the middle right pews, morning light filtering from the east. The Baptismal Font is visible to your south, near the entrance. The pews around you are sturdy oak, their surfaces carved with generations of idle marks. The eastern wall rises to your right. The Main Altar is distant to the north.`,
    afternoon: `You occupy the middle right pews in afternoon shadow. The Baptismal Font to the south is barely visible. The pews around you are dark and silent. The eastern wall to your right shows signs of dampness. The Main Altar to the north is a distant shadow.`,
    evening: `You stand among the middle right pews by candlelight. The Baptismal Font to the south catches faint light from entrance candles. The pews around you are shadowed. The eastern wall to your right is invisible. The Main Altar to the north glows distantly.`,
    nearbyPOIs: ['Pews', 'Baptismal Font']
  },

  // Row 3 - Lower mid-nave (Y: 660)
  '440,660': {
    morning: `You stand among the lower left pews, closer to the entrance than to the sanctuary. Morning light from the entrance doors is stronger here. The pews around you are humbler than those near the altar—simple benches for common worshippers. The western wall is to your left. The main entrance is visible to the south.`,
    afternoon: `You occupy the lower left pews in afternoon dimness. The entrance to the south admits limited light. The pews around you are simple and worn. The western wall to your left is shadowed. The cathedral feels particularly large from this vantage—the altar impossibly far.`,
    evening: `You stand among the lower left pews by candlelight. Entrance candles to the south provide some illumination. The pews around you are partially visible. The western wall to your left is dark. The sanctuary to the north is distant, its candles faint.`,
    nearbyPOIs: ['Pews']
  },

  '550,660': {
    morning: `You stand in the central aisle in the lower nave. The main entrance is clearly visible to the south; the sanctuary far to the north. Morning light streams through the entrance doors. The pews on either side are filled with morning shadows. The processional path stretches in both directions.`,
    afternoon: `You occupy the central aisle in the lower nave. The entrance to the south admits afternoon light; the sanctuary to the north is dim. The pews on either side are shadowed. The stone floor shows wear from countless feet. The cathedral's emptiness is striking.`,
    evening: `You stand in the central aisle as evening darkness fills the lower nave. The entrance to the south is barely lit. The sanctuary to the north glows with distant candles. The pews on either side are invisible. The processional path is marked only by worn stone underfoot.`,
    nearbyPOIs: ['Pews']
  },

  '660,660': {
    morning: `You stand in the central processional aisle facing the entrance to the south. Morning light floods through the doors. The Baptismal Font is visible to your southeast, near the right wall. The pews on either side frame the central path. The sanctuary is far behind you to the north.`,
    afternoon: `You occupy the central aisle facing the entrance. Afternoon light enters weakly from the south. The Baptismal Font to your southeast is partially visible. The pews on either side are shadowed. The stone floor reflects nothing.`,
    evening: `You stand in the central aisle as evening fills the lower nave. The entrance to the south is dark. The Baptismal Font to your southeast catches faint candlelight. The pews on either side are invisible. The sanctuary behind you to the north provides the only light.`,
    nearbyPOIs: ['Baptismal Font', 'Pews']
  },

  '770,660': {
    morning: `You stand among the lower right pews, near the Baptismal Font to your south. Morning light illuminates this area well. The pews around you are simple oak benches. The eastern wall rises to your right. The font's stone basin catches the light—a promise of spiritual rebirth.`,
    afternoon: `You occupy the lower right pews near the Baptismal Font. Afternoon shadows gather here. The pews around you are dark. The eastern wall to your right shows moisture damage. The font to your south is a shadowed mass.`,
    evening: `You stand among the lower right pews by candlelight. The Baptismal Font to your south catches light from entrance candles. The pews around you fade into darkness. The eastern wall to your right is invisible. The font's water reflects flickering light.`,
    nearbyPOIs: ['Pews', 'Baptismal Font']
  },

  // Row 4 - Entrance area (Y: 770)
  '440,770': {
    morning: `You stand in the entrance area among the left pews, morning light streaming through the doors to your south. The pews here are the simplest in the cathedral—unadorned benches for latecomers and the poor. The western wall is to your left. The Main Altar is far to the north, visible but distant.`,
    afternoon: `You occupy the entrance area among the left pews. Afternoon light enters from the doors to the south. The pews around you are plain and worn. The western wall to your left is shadowed. The cathedral stretches northward into dimness.`,
    evening: `You stand in the entrance area among the left pews by candlelight. Entrance candles provide illumination. The pews around you are simple benches. The western wall to your left is dark. The sanctuary to the north is impossibly distant, its candles faint stars.`,
    nearbyPOIs: ['Pews']
  },

  '550,770': {
    morning: `You stand in the central aisle near the main entrance, the threshold between sacred and profane space. Morning light floods through the entrance doors behind you to the south. The processional path extends northward toward the distant altar. The pews on either side are clearly visible. The Baptismal Font is to your southeast.`,
    afternoon: `You occupy the central aisle near the entrance. Afternoon light enters weakly from behind you. The processional path northward fades into shadow. The pews on either side are dim. The Baptismal Font to your southeast is partially visible.`,
    evening: `You stand in the central aisle near the entrance as evening darkness gathers. Limited candlelight from the entrance illuminates this area. The processional path northward disappears into darkness. The pews on either side are shadowed. The Baptismal Font to your southeast catches faint light.`,
    nearbyPOIs: ['Baptismal Font', 'Pews']
  },

  '660,770': {
    morning: `You stand in the lower central aisle near the Baptismal Font to your east. Morning light illuminates the font's carved stone basin—octagonal, with symbols of the four evangelists on its sides. The main entrance is to your south; the sanctuary far to the north. The pews on either side frame the processional path.`,
    afternoon: `You occupy the central aisle near the Baptismal Font. Afternoon light catches the font's stone basin. The entrance to your south admits limited light. The sanctuary to the north is dim and distant. The pews on either side are shadowed.`,
    evening: `You stand near the Baptismal Font as evening candles illuminate the entrance area. The font's water reflects candlelight—a pool of liquid fire. The entrance is to your south; the sanctuary far to the north. The pews on either side fade into darkness.`,
    nearbyPOIs: ['Baptismal Font', 'Pews']
  },

  '770,770': {
    morning: `You stand beside the Baptismal Font in the right entrance area. Morning light streams through the entrance to the south, illuminating the font's carved details—angels, doves, water flowing from stone mouths. The pews to your north are simple benches. The eastern wall is to your right. The sanctuary is far away to the north.`,
    afternoon: `You occupy the area beside the Baptismal Font. Afternoon light catches the font's carved surface. The pews to your north are shadowed. The eastern wall to your right shows wear. The sanctuary to the north is distant and dim.`,
    evening: `You stand beside the Baptismal Font by candlelight. The font's water reflects flickering flames. The carved angels and doves seem to move in the shifting light. The pews to your north are invisible. The eastern wall to your right is dark. The sanctuary to the north glows faintly.`,
    nearbyPOIs: ['Baptismal Font', 'Pews']
  },

  // === SANCTUARY (Holy of Holies) ===
  // X: 400-800, Y: 50-400
  // Main Altar, Pulpit, sacred space

  // Row 1 - Altar zone (Y: 110)
  '550,110': {
    morning: `You stand directly behind the Main Altar, the holiest ground in the cathedral. The altar's back reveals its construction—solid stone carved with scenes of Christ's passion, topped by a gilded tabernacle housing the Blessed Sacrament. Morning light from high windows creates a nimbus around the altar. Candles stand unlit on either side. The sanctuary floor is polished marble. This is where the priest stands during consecration.`,
    afternoon: `You occupy the space directly behind the Main Altar in afternoon dimness. The altar's stone back is cool to the touch. The tabernacle above holds the consecrated hosts. Afternoon silence fills the sanctuary. Unlit candles stand ready. The marble floor is cold beneath your feet.`,
    evening: `You stand directly behind the Main Altar as evening candles blaze. The altar is fully lit—dozens of candles on either side. The tabernacle above gleams gold. The marble floor reflects candlelight. This sacred ground is where heaven and earth meet in the Mass. The air smells of beeswax and lingering incense.`,
    nearbyPOIs: ['Main Altar']
  },

  '660,110': {
    morning: `You stand to the right of the Main Altar, near the candles on the altar's right side. Morning light slants through high sanctuary windows. The Pulpit is visible to your south. The marble floor is pristine. This is where altar servers position themselves during Mass. The eastern wall rises nearby.`,
    afternoon: `You occupy the right side of the Main Altar. Afternoon shadows gather here. The Pulpit to your south stands empty. The marble floor is cool. Unlit candles surround the altar. Silence prevails.`,
    evening: `You stand to the right of the Main Altar as evening candles burn. The Pulpit to your south catches light from the altar candles. The marble floor gleams. The altar blazes with illumination. The air is thick with candle smoke.`,
    nearbyPOIs: ['Main Altar', 'Pulpit']
  },

  // Row 2 - Preaching zone (Y: 220)
  '550,220': {
    morning: `You stand in the center of the sanctuary facing the nave. The Main Altar is behind you to the north; the congregation's pews spread before you to the south. Morning light illuminates the vast nave. The Pulpit is to your southeast. This is the priest's commanding position—where he faces his flock. The marble floor reflects morning light.`,
    afternoon: `You occupy the center of the sanctuary facing the empty nave. The Main Altar is behind you. The pews stretch away into afternoon shadow. The Pulpit to your southeast stands ready. The marble floor is cool. The cathedral's emptiness is palpable from this vantage.`,
    evening: `You stand in the sanctuary's center as evening candles from the altar behind you cast long shadows into the nave. The pews before you are invisible in darkness. The Pulpit to your southeast catches altar light. The marble floor reflects candlelight. The cathedral feels vast and mysterious.`,
    nearbyPOIs: ['Main Altar', 'Pulpit']
  },

  '770,220': {
    morning: `You stand near the Pulpit, the carved wooden structure rising beside you. Its octagonal form is carved with images of the four evangelists—Matthew, Mark, Luke, John—each with their symbolic creature. A wooden stairway curves up to the preaching platform. Morning light illuminates the Pulpit's details. The Main Altar is to your north; the nave to your south. The eastern transept door is nearby.`,
    afternoon: `You occupy the space near the Pulpit in afternoon shadow. The carved evangelists on its surface are dimly visible. The wooden stairway curves upward into darkness. The Main Altar to your north is shadowed. The nave to your south is dim.`,
    evening: `You stand near the Pulpit by candlelight from the Main Altar. The carved images of the evangelists seem to move in flickering light. The wooden stairway is partially illuminated. The Main Altar to your north blazes. The nave to your south is dark. The pulpit awaits tomorrow's sermon.`,
    nearbyPOIs: ['Pulpit', 'Main Altar']
  },

  // === WEST TRANSEPT (Left Arm - Side Chapel) ===
  // X: 50-400, Y: 350-650
  // West Side Altar, Religious Painting, private prayer space

  '110,440': {
    morning: `You stand in the western transept beside the West Religious Painting. Morning light from a high window illuminates the painting—a large canvas depicting the Virgin of Guadalupe, her image dark-skinned and radiant with golden rays. The West Side Altar is visible to your south. This transept is quieter than the main nave, a space for private devotion. The western wall is cool stone.`,
    afternoon: `You occupy the western transept beside the Religious Painting. Afternoon light catches the Virgin's painted face. The West Side Altar to your south bears spent candles. The transept is shadowed and cool. The western wall shows dampness. This space feels removed from the cathedral's main flow.`,
    evening: `You stand in the western transept by candlelight. The Religious Painting above you—the Virgin of Guadalupe—glows in warm light. The West Side Altar to your south is lit by votive candles. The western wall fades into darkness. This transept is a pocket of devotional light in the surrounding darkness.`,
    nearbyPOIs: ['West Religious Painting', 'West Side Altar']
  },

  '220,440': {
    morning: `You stand in the center of the western transept, between the side altar and the nave door. Morning light creates a peaceful atmosphere. The West Religious Painting is to your west; the West Side Altar to your southwest. The nave door is to your east. This transept serves as a side chapel for Marian devotion. The stone floor is worn smooth.`,
    afternoon: `You occupy the center of the western transept. Afternoon shadow fills this space. The Religious Painting to your west is dimly visible. The Side Altar to your southwest bears cold candles. The nave door to your east leads to dimness. The transept feels isolated.`,
    evening: `You stand in the center of the western transept as votive candles create pools of light. The Religious Painting to your west catches candlelight. The Side Altar to your southwest glows with offerings. The nave door to your east is dark. This transept is a haven of private prayer.`,
    nearbyPOIs: ['West Side Altar', 'West Religious Painting']
  },

  '110,550': {
    morning: `You stand against the western wall below the Religious Painting. Morning light slants across the stone floor. The West Side Altar is to your north, its carved wooden front depicting scenes of Mary's assumption. The transept is quiet, peaceful. The western wall behind you is cool and damp. This corner is where supplicants kneel in private prayer.`,
    afternoon: `You occupy the western wall below the Religious Painting. Afternoon dimness fills the transept. The West Side Altar to your north is shadowed. The stone floor is cold beneath your feet. The western wall behind you shows moisture stains. The transept feels forgotten.`,
    evening: `You stand against the western wall by candlelight. The Religious Painting above you—the Virgin—seems to glow. The West Side Altar to your north is lit by votive candles. The stone floor reflects flickering light. The western wall behind you is dark. This is a space of quiet devotion.`,
    nearbyPOIs: ['West Religious Painting', 'West Side Altar']
  },

  // === EAST TRANSEPT (Right Arm - Confessional) ===
  // X: 800-1150, Y: 350-650
  // East Side Altar, Confessional Booth, penance space

  '880,440': {
    morning: `You stand in the eastern transept near the door from the nave. Morning light from a high window illuminates this space. The East Side Altar is visible to your east, dedicated to San José. The Confessional Booth is to your south. This transept serves as a space for the sacrament of penance. The eastern wall rises nearby.`,
    afternoon: `You occupy the eastern transept near the nave door. Afternoon shadow fills this space. The East Side Altar to your east is dimly visible. The Confessional Booth to your south stands empty. The transept feels solemn and private. The eastern wall shows wear.`,
    evening: `You stand in the eastern transept by candlelight. The East Side Altar to your east glows with votive candles. The Confessional Booth to your south is shadowed—a dark wooden structure awaiting penitents. The eastern wall fades into darkness. This transept feels watchful.`,
    nearbyPOIs: ['East Side Altar', 'Confessional Booth']
  },

  '990,440': {
    morning: `You stand in the center of the eastern transept near the East Side Altar. Morning light illuminates the altar's carved front—scenes of San José with the infant Christ. The Confessional Booth is to your south; the nave door to your west. This transept is more formal than the western one, reserved for confession and penance. The stone floor is polished.`,
    afternoon: `You occupy the center of the eastern transept. The East Side Altar beside you is shadowed. Afternoon dimness fills the space. The Confessional Booth to your south stands ready. The nave door to your west leads to dimness. The transept feels austere.`,
    evening: `You stand near the East Side Altar by candlelight. The altar's carved scenes catch flickering light. The Confessional Booth to your south is partially visible—its dark wooden panels and screened windows. The nave door to your west is black. This transept is a space of reckoning.`,
    nearbyPOIs: ['East Side Altar', 'Confessional Booth']
  },

  '1100,550': {
    morning: `You stand in the southeastern corner of the transept beside the Confessional Booth. Morning light barely reaches this corner. The booth is a substantial wooden structure with two chambers—one for the priest, one for the penitent—separated by a screened grille. The East Side Altar is to your north. The eastern wall is nearby. This corner feels private, concealed.`,
    afternoon: `You occupy the southeastern corner beside the Confessional Booth. Afternoon shadow deepens here. The booth's dark wood seems to absorb light. The East Side Altar to your north is dim. The eastern wall shows dampness. This corner is the darkest part of the transept.`,
    evening: `You stand beside the Confessional Booth by candlelight. The booth's wooden panels catch faint light—its screened window a grid of shadow. The East Side Altar to your north glows with candles. The eastern wall is invisible. This corner is where sins are whispered and absolution granted. The booth awaits its next penitent.`,
    nearbyPOIs: ['Confessional Booth', 'East Side Altar']
  },

  // === SACRISTY (Priest Preparation Room) ===
  // X: 850-1100, Y: 50-300
  // Vestment Chest, Preparation Table, Book Shelf

  '990,110': {
    morning: `You stand in the sacristy near the Vestment Chest and Religious Book Shelf. Morning light from a small window illuminates this priest's domain. The Vestment Chest is open, revealing layers of silk and brocade vestments in liturgical colors—green for Ordinary Time, white for feast days, purple for Lent, red for martyrs. The Book Shelf beside you holds missals and brevaries. The Preparation Table is to your south. The sanctuary door is to your west.`,
    afternoon: `You occupy the sacristy near the Vestment Chest. Afternoon light catches the vestments' rich colors. The Book Shelf beside you is shadowed. The Preparation Table to your south holds sacred vessels covered with linen. The sanctuary door to your west is partially visible. The sacristy smells of incense and old fabric.`,
    evening: `You stand in the sacristy by candlelight. The Vestment Chest is open, vestments gleaming in flickering light. The Book Shelf beside you holds liturgical texts. The Preparation Table to your south is set for tomorrow's Mass. The sanctuary door to your west is dark. The sacristy is the priest's private world—where sacred and mundane meet.`,
    nearbyPOIs: ['Vestment Chest', 'Religious Book Shelf', 'Preparation Table']
  },

  '990,220': {
    morning: `You stand at the Preparation Table in the center of the sacristy. Morning light illuminates the table's contents—a silver chalice, a golden paten, cruets for water and wine, a covered ciborium. The table's surface is covered with white linen. The Vestment Chest is to your north; the Religious Book Shelf nearby. The sanctuary door is to your west. This is where the priest prepares for the sacred mysteries.`,
    afternoon: `You occupy the Preparation Table area. Afternoon light catches the silver and gold of sacred vessels. The chalice gleams; the paten reflects light. The Vestment Chest to your north is partially visible. The Book Shelf is shadowed. The sanctuary door to your west leads to dimness. The sacristy is quiet—preparations for tomorrow's Mass.`,
    evening: `You stand at the Preparation Table by candlelight. The sacred vessels gleam—chalice, paten, cruets. The white linen covering the table glows. The Vestment Chest to your north is shadowed. The Book Shelf is barely visible. The sanctuary door to your west is dark. The sacristy is where priests vest and unvest, where the sacred drama begins and ends.`,
    nearbyPOIs: ['Preparation Table', 'Vestment Chest', 'Religious Book Shelf']
  }
};

/**
 * Get time of day period from hour (24-hour format)
 * @param {number} hour - Hour in 24-hour format (0-23)
 * @returns {string} - 'morning', 'afternoon', or 'evening'
 */
function getTimeOfDayPeriod(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening'; // 18:00 onwards through night
}

/**
 * Parse time string to get hour
 * @param {string} timeString - Time in format like "8:00 AM" or "14:00"
 * @returns {number} - Hour in 24-hour format
 */
function parseTimeString(timeString) {
  if (!timeString) return 12; // Default to afternoon if no time

  // Handle "8:00 AM" or "8:00 PM" format
  const ampmMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1]);
    const isPM = ampmMatch[3].toUpperCase() === 'PM';
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    return hour;
  }

  // Handle "14:00" 24-hour format
  const twentyFourMatch = timeString.match(/(\d+):(\d+)/);
  if (twentyFourMatch) {
    return parseInt(twentyFourMatch[1]);
  }

  return 12; // Default to afternoon
}

/**
 * Get pre-written narrative for a position in cathedral interior
 * @param {number} x - X coordinate (pixel)
 * @param {number} y - Y coordinate (pixel)
 * @param {string} currentTime - Current game time (optional, for time-of-day variants)
 * @returns {Object|null} - Narrative object or null if not found
 */
export const getCathedralNarrative = (x, y, currentTime = null) => {
  // Round to nearest movement grid position (110px steps)
  const MOVEMENT_STEP = 110;
  const gridX = Math.round(x / MOVEMENT_STEP) * MOVEMENT_STEP;
  const gridY = Math.round(y / MOVEMENT_STEP) * MOVEMENT_STEP;

  const key = `${gridX},${gridY}`;
  const narrativeData = CATHEDRAL_INTERIOR_NARRATIVES[key];

  if (!narrativeData) return null;

  // If this position has time-of-day variants, select the appropriate one
  if (narrativeData.morning && narrativeData.afternoon && narrativeData.evening) {
    const hour = parseTimeString(currentTime);
    const period = getTimeOfDayPeriod(hour);

    return {
      description: narrativeData[period],
      nearbyPOIs: narrativeData.nearbyPOIs
    };
  }

  // Otherwise return the single description (for positions without time variants)
  return narrativeData;
};

/**
 * Check if position has a pre-written narrative
 * @param {string} mapId - Map identifier
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean}
 */
export const hasCathedralNarrative = (mapId, x, y) => {
  if (mapId !== 'cathedral-interior') return false;
  return getCathedralNarrative(x, y) !== null;
};
