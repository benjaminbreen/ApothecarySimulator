import { createChatCompletion } from '../services/llmService';

const SYSTEM_PROMPT = `You are the Long-Distance Travel Agent for a historical narrative simulator set in 1680 New Spain.

Goal:
- Evaluate the proposed journey and narrate it vividly, covering the passage of time, landscapes, hazards, and the traveler's changing condition.
- If the journey is plausible, advance Maria to the destination with an evocative arrival scene that sets up immediate next steps.
- If the journey is implausible or fails, describe the obstacles and leave Maria at the logical location with clear consequences.

Tone:
- Ground every detail in late 17th-century New Spain / early-modern Atlantic world realities.
- Use second person ("You ride...", "You arrive...").
- Keep it immersive but concise (2-4 short paragraphs, 180 words max).

Output Requirements:
- Respond **only** with valid JSON matching this schema:
{
  "narrative": "markdown string describing the travel or failure",
  "outcome": "success | failure | delayed",
  "arrival": {
    "location": "string",
    "worldLocationId": "string|null",
    "notes": "optional string"
  },
  "timeAdvanceMinutes": number,
  "wealthDelta": number,
  "energyDelta": number,
  "reputationDelta": number
}

Rules:
- Always set "timeAdvanceMinutes" to reflect the journey (default to durationDays × 1440 if not otherwise compelled).
- Use "wealthDelta" to represent the actual net change (negative means money spent, positive means money gained/refunded). If the plan barters goods successfully, wealthDelta may be 0.
- If travel fails, set outcome to "failure", keep arrival.location equal to the departure point, and justify in the narrative.
- Never refer to previous NPC dialogue unless explicitly provided in recentHistory. Treat the journey as its own scene.`;

function buildUserPayload({ travelPlan, gameState, playerSkills, reputation, journal, recentHistory }) {
  const payload = {
    travelPlan,
    currentState: {
      time: gameState.time,
      date: gameState.date,
      location: gameState.location,
      wealth: gameState.wealth,
      energy: gameState.energy,
      health: gameState.health
    },
    playerSkills: playerSkills ? {
      level: playerSkills.level,
      professions: playerSkills.professions || [],
      knownSkills: playerSkills.knownSkills || {}
    } : null,
    reputation,
    journalTail: Array.isArray(journal) ? journal.slice(-5) : [],
    recentHistory: Array.isArray(recentHistory)
      ? recentHistory.map(entry => entry.content).filter(Boolean)
      : []
  };

  return JSON.stringify(payload);
}

function cleanupJSON(raw) {
  if (!raw) return raw;
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export async function simulateLongDistanceTravel({
  travelPlan,
  gameState,
  playerSkills,
  reputation,
  journal,
  recentHistory = []
}) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPayload({ travelPlan, gameState, playerSkills, reputation, journal, recentHistory }) }
  ];

  const response = await createChatCompletion(
    messages,
    0.65,
    900,
    { type: 'json_object' },
    { agent: 'LongDistanceTravelAgent' }
  );

  const rawContent = response.choices?.[0]?.message?.content || '';
  const cleaned = cleanupJSON(rawContent);

  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('[LongDistanceTravelAgent] Failed to parse response:', cleaned, error);
    throw new Error('Failed to interpret travel narrative.');
  }
}

export default {
  simulateLongDistanceTravel
};
