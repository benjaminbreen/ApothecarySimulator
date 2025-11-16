import { STORY_NPCS, STORY_NPC_LOOKUP } from '../../data/storyNpcs';

function sanitizePortraitName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeString(value = '') {
  return (value || '').toLowerCase();
}

function locationMatches(preferred = [], gameState) {
  if (!preferred || preferred.length === 0) return true;
  const location = normalizeString(gameState.location);
  const locationType = normalizeString(gameState.locationType);

  return preferred.some(tag => {
    if (tag === 'any') return true;
    const normalizedTag = tag.toLowerCase();
    return location.includes(normalizedTag) || locationType.includes(normalizedTag);
  });
}

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  const roll = Math.random() * totalWeight;
  let cumulative = 0;
  for (const item of items) {
    cumulative += item.weight || 1;
    if (roll <= cumulative) {
      return item;
    }
  }
  return items[items.length - 1];
}

function buildInteractionPayload(npc) {
  const base = {
    npcName: npc.name,
    npcPortrait: npc.portrait,
    storyNpcId: npc.id,
    loreSummary: npc.summary,
    type: npc.interaction.type,
    npcRole: npc.interaction.npcRole || null,
    context: npc.interaction.context || npc.summary
  };

  // Build portrait candidates list (priority order)
  const portraitCandidates = [];

  // HIGHEST PRIORITY: ID-based portrait (e.g., leonor_mendez.jpg for id='leonor_mendez')
  if (npc.id) {
    portraitCandidates.push(`/portraits/${npc.id}.jpg`);
  }

  // MEDIUM PRIORITY: Explicit portrait from config
  if (npc.portrait) {
    portraitCandidates.push(npc.portrait);
  }

  // LOW PRIORITY: Fallback to sanitized name (for backward compatibility)
  const sanitized = sanitizePortraitName(npc.name);
  if (sanitized && sanitized !== npc.id) {
    portraitCandidates.push(`/portraits/${sanitized}.jpg`);
  }

  const payload = {
    ...base,
    portraitList: portraitCandidates
  };

  if (npc.interaction.information) {
    payload.information = npc.interaction.information;
  }
  if (npc.interaction.request) {
    payload.request = npc.interaction.request;
  }
  if (npc.interaction.competitive) {
    payload.competitive = npc.interaction.competitive;
  }
  if (npc.interaction.extortion) {
    payload.extortion = npc.interaction.extortion;
  }
  if (npc.interaction.social) {
    payload.social = npc.interaction.social;
  }
  if (npc.interaction.offer) {
    payload.offer = npc.interaction.offer;
  }
  if (npc.interaction.investment) {
    payload.investment = npc.interaction.investment;
  }

  payload.successAction = npc.interaction.successAction || null;
  payload.failureAction = npc.interaction.failureAction || null;

  return payload;
}

/**
 * Select a story NPC encounter for the current turn, if eligible.
 */
export function selectStoryNpcEncounter(gameState) {
  const turnNumber = gameState.turnNumber || 1;
  const statusMap = gameState.storyNpcStatus || {};
  const hasActiveStoryNpc = Object.values(statusMap).some(status => status?.state === 'active');

  if (hasActiveStoryNpc) {
    return null;
  }

  const candidates = STORY_NPCS.filter(npc => {
    const status = statusMap[npc.id];
    if (status?.state === 'completed') return false;
    if (npc.minTurn && turnNumber < npc.minTurn) return false;
    if (!locationMatches(npc.preferredLocations, gameState)) return false;
    if (status?.lastTurn && npc.cooldown && turnNumber - status.lastTurn < npc.cooldown) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    return null;
  }

  const chosen = weightedRandom(candidates);
  return {
    npc: chosen,
    interaction: buildInteractionPayload(chosen),
    arrivalText: chosen.arrivalText,
    introNarrative: null
  };
}

export function forceStoryNpcEncounter(gameState) {
  const statusMap = gameState.storyNpcStatus || {};
  const eligible = STORY_NPCS.filter(npc => {
    const status = statusMap[npc.id];
    return status?.state !== 'completed';
  });

  if (eligible.length === 0) {
    return null;
  }

  const chosen = weightedRandom(eligible);
  return {
    npc: chosen,
    interaction: buildInteractionPayload(chosen),
    arrivalText: chosen.arrivalText,
    introNarrative: null
  };
}

export function getStoryNpcOutcomeConfig(id, action) {
  const npc = STORY_NPC_LOOKUP[id];
  if (!npc) return null;
  const outcomes = npc.outcomes || {};
  return outcomes[action] || outcomes.default || null;
}

export function resolveStoryNpcOutcome(id, action) {
  const config = getStoryNpcOutcomeConfig(id, action);
  if (!config) {
    return null;
  }
  return {
    state: config.state || 'met',
    journal: config.journal || '',
    rewards: config.rewards || [],
    penalties: config.penalties || []
  };
}

export function getStoryNpcById(id) {
  return STORY_NPC_LOOKUP[id];
}
