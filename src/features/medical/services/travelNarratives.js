/**
 * Travel Narrative Templates
 *
 * Phase 3B: Pre-written travel narratives for house calls
 * Varies based on time of day, distance, and weather/mood
 */

/**
 * Get appropriate travel narrative based on context
 *
 * @param {Object} params
 * @param {string} params.patientName - Patient name
 * @param {string} params.destination - Destination location
 * @param {number} params.distance - Distance in meters
 * @param {number} params.travelTime - Travel time in minutes
 * @param {number} params.timeOfDay - Hour (0-23)
 * @returns {string} - Travel narrative text
 */
export function getTravelNarrative({ patientName, destination, distance, travelTime, timeOfDay }) {
  const isShortDistance = distance < 700;
  const isMorning = timeOfDay >= 6 && timeOfDay < 12;
  const isAfternoon = timeOfDay >= 12 && timeOfDay < 18;
  const isEvening = timeOfDay >= 18 && timeOfDay < 22;
  const isNight = timeOfDay >= 22 || timeOfDay < 6;

  // Short distance narratives
  if (isShortDistance) {
    const shortNarratives = [
      `Maria gathers her medical bag and steps into the street, the familiar cobblestones leading toward ${destination}. The journey is brief, just a few minutes through narrow alleys.`,
      `With practiced efficiency, Maria secures her supplies and sets out. ${destination} is nearby—she knows these streets well, having walked them countless times before.`,
      `Maria locks the botica's door and begins the short walk to ${destination}. The scent of cooking fires drifts from nearby homes as she makes her way through the neighborhood.`,
    ];
    return shortNarratives[Math.floor(Math.random() * shortNarratives.length)];
  }

  // Morning narratives
  if (isMorning) {
    const morningNarratives = [
      `Maria steps into the morning light, medical bag in hand. The streets of Mexico City are already stirring with vendors and early risers as she makes her way toward ${destination}.`,
      `The morning air is cool as Maria begins her journey to ${destination}. Church bells echo across the city, marking the hour as she navigates the awakening streets.`,
      `Maria adjusts her shawl against the morning chill and sets out for ${destination}. Market vendors are setting up their stalls, calling greetings as she passes.`,
    ];
    return morningNarratives[Math.floor(Math.random() * morningNarratives.length)];
  }

  // Afternoon narratives
  if (isAfternoon) {
    const afternoonNarratives = [
      `Under the midday sun, Maria makes her way through the bustling streets toward ${destination}. The heat rises from the cobblestones as she weaves through crowds of afternoon shoppers.`,
      `Maria shields her eyes from the bright afternoon sun as she heads to ${destination}. The streets are crowded with merchants and customers conducting their daily business.`,
      `The afternoon heat bears down as Maria walks toward ${destination}. She keeps to the shaded side of the street when possible, her medical bag growing heavier with each step.`,
    ];
    return afternoonNarratives[Math.floor(Math.random() * afternoonNarratives.length)];
  }

  // Evening narratives
  if (isEvening) {
    const eveningNarratives = [
      `As the sun begins to set, Maria hurries toward ${destination}. Long shadows stretch across the cobblestones, and the evening air brings a welcome coolness after the day's heat.`,
      `Maria walks briskly through the twilight streets toward ${destination}. Shopkeepers are closing their shutters, and the smell of evening meals wafts from open windows.`,
      `The golden light of early evening guides Maria's path to ${destination}. Families gather in doorways, and children play their last games before nightfall.`,
    ];
    return eveningNarratives[Math.floor(Math.random() * eveningNarratives.length)];
  }

  // Night narratives
  if (isNight) {
    const nightNarratives = [
      `Maria carries a small lantern as she makes her way through the dark streets to ${destination}. The night watch calls out challenges, recognizing her as the familiar apothecary on an urgent errand.`,
      `The streets are quiet and shadowed as Maria walks carefully toward ${destination}. Her lantern casts dancing light on the walls, and she quickens her pace, mindful of the late hour.`,
      `Night has fallen over Mexico City as Maria ventures out to ${destination}. The darkness is broken only by occasional torchlight and the glow of her own lantern leading the way.`,
    ];
    return nightNarratives[Math.floor(Math.random() * nightNarratives.length)];
  }

  // Fallback (should not reach here)
  return `Maria makes her way through the streets of Mexico City toward ${destination}, her medical bag prepared for the consultation with ${patientName}.`;
}
