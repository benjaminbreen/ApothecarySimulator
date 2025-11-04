/**
 * Weather Event Service
 * Triggers dramatic narrative events when weather becomes severe
 *
 * Simple, narrative-focused: Just creates memorable moments during storms/heat/fog
 * Not a complex mechanical system - just storytelling
 */

import { createChatCompletion } from '../services/llmService';

/**
 * Tracking state for weather events (prevent spam)
 */
let lastWeatherEventTurn = -20; // Allow first event after turn 20
let lastWeatherEventType = null;

/**
 * Reset weather event tracking (for new games)
 */
export function resetWeatherEventTracking() {
  lastWeatherEventTurn = -20;
  lastWeatherEventType = null;
}

/**
 * Check if a weather event should trigger
 * @param {Object} weather - Current weather state
 * @param {Object} gameState - Current game state
 * @returns {Object|null} Weather event data or null
 */
export async function checkForWeatherEvent(weather, gameState) {
  if (!weather) return null;

  // Cooldown: Don't trigger events too frequently (minimum 10 turns between)
  const turnsSinceLastEvent = gameState.turnNumber - lastWeatherEventTurn;
  if (turnsSinceLastEvent < 10) {
    return null;
  }

  // Determine weather severity and type
  const severityCheck = analyzeWeatherSeverity(weather);

  if (!severityCheck.isSevere) {
    return null;
  }

  // Random chance: Only 30% chance even when severe (keeps events special)
  if (Math.random() > 0.3) {
    return null;
  }

  // Don't repeat the same weather event type immediately
  if (severityCheck.eventType === lastWeatherEventType) {
    return null;
  }

  console.log(`[WeatherEvent] Severe ${severityCheck.eventType} detected - triggering event`);

  // Generate event
  const eventCard = await generateWeatherEvent(severityCheck, gameState);

  if (eventCard) {
    // Record this event
    lastWeatherEventTurn = gameState.turnNumber;
    lastWeatherEventType = severityCheck.eventType;
  }

  return eventCard;
}

/**
 * Analyze weather to determine if it's severe enough for an event
 * @returns {Object} { isSevere: boolean, eventType: string, description: string }
 */
function analyzeWeatherSeverity(weather) {
  // Thunderstorm - always severe
  if (weather.special === 'thunderstorm') {
    return {
      isSevere: true,
      eventType: 'thunderstorm',
      description: 'violent thunderstorm with lightning and flooding',
      severity: 'extreme'
    };
  }

  // Heavy rain with high winds - flooding risk
  if (weather.precipitation === 'rain' && weather.intensity > 0.7 && weather.windSpeed > 25) {
    return {
      isSevere: true,
      eventType: 'flooding',
      description: 'torrential rain causing street flooding',
      severity: 'high'
    };
  }

  // Dense fog - navigation danger
  if ((weather.special === 'fog' || weather.visibility < 0.2) && Math.random() > 0.5) {
    return {
      isSevere: true,
      eventType: 'fog',
      description: 'dense fog blanketing the city',
      severity: 'moderate'
    };
  }

  // Extreme heat - medical emergency risk
  if (weather.special === 'heatwave' && Math.random() > 0.5) {
    return {
      isSevere: true,
      eventType: 'heatwave',
      description: 'oppressive heat causing heat exhaustion',
      severity: 'high'
    };
  }

  // Heavy continuous rain - long duration
  if (weather.precipitation === 'rain' && weather.intensity > 0.6 && weather.cloudCover > 0.9) {
    return {
      isSevere: true,
      eventType: 'deluge',
      description: 'relentless downpour',
      severity: 'moderate'
    };
  }

  return { isSevere: false };
}

/**
 * Generate a weather event using LLM
 * Creates a dramatic narrative moment with player choices
 */
async function generateWeatherEvent(severityCheck, gameState) {
  const { eventType, description, severity } = severityCheck;

  // Get template for this weather type
  const template = getEventTemplate(eventType);

  if (!template) {
    console.error('[WeatherEvent] No template for event type:', eventType);
    return null;
  }

  try {
    // Generate dramatic narrative with LLM
    const systemPrompt = `You are generating a dramatic weather event for a historical RPG set in 1680 Mexico City.

The event type is: ${eventType}
Weather conditions: ${description}
Current location: ${gameState.location}
Current time: ${gameState.time}

Generate a BRIEF, DRAMATIC event description (2-3 sentences max) that creates urgency and atmosphere.

Then provide 2-3 meaningful player choices. Each choice should have:
- Clear consequences (what happens if chosen)
- Different risk/reward tradeoffs
- Historical authenticity

Format as JSON:
{
  "eventDescription": "2-3 sentence dramatic description",
  "choices": [
    {
      "text": "Action player can take",
      "outcome": "What happens (brief)",
      "energyCost": 0-20,
      "healthRisk": 0-10,
      "reputationImpact": { "faction": "change" }
    }
  ]
}

${template.promptGuidance}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate the ${eventType} event now.` }
    ];

    const response = await createChatCompletion(
      messages,
      0.8, // Higher temp for dramatic variety
      400,
      { type: 'json_object' },
      { agent: 'WeatherEventGenerator' }
    );

    const eventData = JSON.parse(response.choices[0].message.content);

    // Build event card for UI
    return {
      type: 'weather_event',
      eventId: `weather_${eventType}_${gameState.turnNumber}`,
      weatherType: eventType,
      severity,
      title: template.title,
      description: eventData.eventDescription,
      icon: template.icon,
      colorScheme: template.colorScheme,
      choices: eventData.choices.map((choice, idx) => ({
        id: `choice_${idx}`,
        text: choice.text,
        outcome: choice.outcome,
        effects: {
          energy: -(choice.energyCost || 0),
          health: -(choice.healthRisk || 0),
          reputation: choice.reputationImpact || {}
        }
      }))
    };

  } catch (error) {
    console.error('[WeatherEvent] Failed to generate event:', error);
    // Fall back to template-only version
    return buildStaticWeatherEvent(template, gameState);
  }
}

/**
 * Get event template for weather type
 */
function getEventTemplate(eventType) {
  const templates = {
    thunderstorm: {
      title: '⚡ Thunderstorm',
      icon: '⛈️',
      colorScheme: 'bg-slate-800 text-white border-yellow-400',
      promptGuidance: `Examples:
- Lightning strikes church steeple, fire risk
- Street flooding, person trapped
- Windows blown out by wind, glass everywhere
- Thunder spooks horses, cart accident

Keep it urgent and dramatic. This is a CRISIS moment.`
    },
    flooding: {
      title: '🌊 Flash Flood',
      icon: '💧',
      colorScheme: 'bg-blue-900 text-white border-blue-400',
      promptGuidance: `Examples:
- Streets turn to rivers, person drowning
- Water rushing into homes, valuables lost
- Sewer overflow, contamination risk
- Bridge collapse danger

Focus on water damage and rescue opportunities.`
    },
    fog: {
      title: '🌫️ Dense Fog',
      icon: '👁️',
      colorScheme: 'bg-gray-700 text-white border-gray-400',
      promptGuidance: `Examples:
- Person lost in fog, calling for help
- Thieves taking advantage of low visibility
- Cart crash in fog, injuries
- Strange sounds/figures in mist (atmospheric)

Create mystery and disorientation.`
    },
    heatwave: {
      title: '🌡️ Extreme Heat',
      icon: '☀️',
      colorScheme: 'bg-orange-700 text-white border-orange-400',
      promptGuidance: `Examples:
- Worker collapses from heat exhaustion
- Elderly person suffering heat stroke
- Water shortage, fights over wells
- Wilting crops, food shortage

Focus on dehydration and heat-related medical emergencies.`
    },
    deluge: {
      title: '☔ Torrential Downpour',
      icon: '🌧️',
      colorScheme: 'bg-indigo-800 text-white border-indigo-400',
      promptGuidance: `Examples:
- Mud slides on hillsides
- Roof leaks flooding homes
- Market stalls destroyed by rain
- Sick person needs medicine, can't travel

Focus on damage to property and isolation.`
    }
  };

  return templates[eventType] || null;
}

/**
 * Build a static weather event (fallback if LLM fails)
 */
function buildStaticWeatherEvent(template, gameState) {
  const staticChoices = {
    thunderstorm: [
      {
        id: 'shelter',
        text: 'Take shelter immediately',
        outcome: 'You wait out the storm safely',
        effects: { energy: -5 }
      },
      {
        id: 'help',
        text: 'Help people caught in the storm',
        outcome: 'You assist others at personal risk',
        effects: { energy: -15, health: -5, reputation: { 'common-folk': 5 } }
      }
    ],
    flooding: [
      {
        id: 'high_ground',
        text: 'Move to higher ground',
        outcome: 'You avoid the flooding',
        effects: { energy: -5 }
      },
      {
        id: 'rescue',
        text: 'Help rescue people from flood waters',
        outcome: 'You wade into danger to help',
        effects: { energy: -20, health: -10, reputation: { 'common-folk': 10 } }
      }
    ],
    fog: [
      {
        id: 'stay_put',
        text: 'Stay where you are until fog lifts',
        outcome: 'You wait it out safely',
        effects: { energy: -3 }
      },
      {
        id: 'navigate',
        text: 'Try to navigate through the fog',
        outcome: 'You risk getting lost',
        effects: { energy: -10 }
      }
    ],
    heatwave: [
      {
        id: 'seek_shade',
        text: 'Seek shade and rest',
        outcome: 'You avoid heat exhaustion',
        effects: { energy: -5 }
      },
      {
        id: 'help_sick',
        text: 'Help heat stroke victims',
        outcome: 'You treat the afflicted despite the heat',
        effects: { energy: -15, reputation: { 'common-folk': 8 } }
      }
    ],
    deluge: [
      {
        id: 'wait_inside',
        text: 'Stay indoors until rain passes',
        outcome: 'You stay dry and safe',
        effects: { energy: -3 }
      },
      {
        id: 'venture_out',
        text: 'Brave the downpour anyway',
        outcome: 'You get soaked but continue',
        effects: { energy: -12, health: -3 }
      }
    ]
  };

  return {
    type: 'weather_event',
    eventId: `weather_static_${template.title}_${gameState.turnNumber}`,
    weatherType: template.title,
    title: template.title,
    description: `A ${template.title.toLowerCase()} has struck the city!`,
    icon: template.icon,
    colorScheme: template.colorScheme,
    choices: staticChoices[Object.keys(staticChoices).find(k => template.title.toLowerCase().includes(k))] || staticChoices.thunderstorm
  };
}

export default {
  checkForWeatherEvent,
  resetWeatherEventTracking
};
