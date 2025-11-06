/**
 * Timeline Generator
 *
 * Generates chronological life events for NPCs from birth to present.
 * Uses historical data tables and seeded RNG for deterministic results.
 *
 * @module timelineGenerator
 */

import { LIFE_EVENTS, EVENT_AGE_RANGES, getEventTemplates, getHistoricalEvent } from '../../config/lifeEvents.config';

/**
 * Generate complete life event timeline for NPC
 * @param {Object} biography - Biography data from biographyGenerator
 * @param {Object} npc - NPC entity
 * @param {Object} rng - Seeded RNG instance
 * @param {number} currentYear - Current game year (default: 1680)
 * @returns {Array} Array of life events with year and description
 */
export function generateTimeline(biography, npc, rng, currentYear = 1680) {
  const timeline = [];
  const birthYear = biography.birthYear;
  const age = biography.age;
  const casta = npc.social?.casta || npc.casta || 'mestizo';
  const socialClass = npc.social?.class || npc.class || 'common';
  const occupation = npc.occupation || 'laborer';
  const gender = npc.gender || npc.appearance?.gender || 'male';
  const family = biography.family;

  // 1. BIRTH EVENT (always first)
  const birthEvent = generateBirthEvent(birthYear, biography, family, rng);
  timeline.push(birthEvent);

  // 2. CHILDHOOD EVENTS (age 8-17)
  const childhoodEvents = generateChildhoodEvents(birthYear, age, casta, socialClass, rng);
  timeline.push(...childhoodEvents);

  // 3. MARRIAGE EVENT (if married, age-appropriate)
  if (family.spouse) {
    const marriageYear = family.spouse.marriedYear;
    const marriageEvent = generateMarriageEvent(marriageYear, birthYear, family.spouse, casta, socialClass, rng);
    timeline.push(marriageEvent);
  }

  // 4. CAREER EVENTS
  const careerEvents = generateCareerEvents(birthYear, age, casta, socialClass, occupation, rng);
  timeline.push(...careerEvents);

  // 5. FAMILY EVENTS (children births)
  const familyEvents = generateFamilyEvents(family, birthYear, rng);
  timeline.push(...familyEvents);

  // 6. HISTORICAL EVENTS (events that occurred during lifetime)
  const historicalEvents = generateHistoricalEvents(birthYear, currentYear, casta, socialClass);
  timeline.push(...historicalEvents);

  // 7. TRAGEDIES (random, 0-2 based on class)
  const tragedies = generateTragedies(birthYear, age, casta, socialClass, rng);
  timeline.push(...tragedies);

  // 8. SUCCESSES (random, 1-3 based on class)
  const successes = generateSuccesses(birthYear, age, casta, socialClass, occupation, rng);
  timeline.push(...successes);

  // Sort timeline chronologically
  timeline.sort((a, b) => a.year - b.year);

  // Remove duplicates in same year (keep first of each type)
  const deduped = deduplicateEvents(timeline);

  // Cap at 15 events for performance (keep most important)
  const capped = capTimelineEvents(deduped, rng, 15);

  return capped;
}

/**
 * Generate birth event
 */
function generateBirthEvent(birthYear, biography, family, rng) {
  const templates = LIFE_EVENTS.birth.all;
  let template = rng.choice(templates);

  // Fill in template variables
  const father = family.parents.find(p => p.relation === 'father');
  const mother = family.parents.find(p => p.relation === 'mother');

  template = template
    .replace('{birthplace}', biography.birthplace)
    .replace('{father}', father?.name || 'unknown father')
    .replace('{father_occupation}', father?.occupation || 'laborer')
    .replace('{mother}', mother?.name || 'unknown mother')
    .replace('{birth_order}', getBirthOrder(family.siblings.length, rng));

  return {
    year: birthYear,
    age: 0,
    category: 'birth',
    description: template,
    importance: 3 // High importance
  };
}

/**
 * Get birth order descriptor
 */
function getBirthOrder(siblingCount, rng) {
  if (siblingCount === 0) return 'only';
  const orders = ['first', 'second', 'third', 'fourth', 'youngest', 'middle'];
  const index = Math.min(siblingCount, orders.length - 1);
  return rng.choice(orders.slice(0, index + 1));
}

/**
 * Generate childhood events (education, apprenticeships)
 */
function generateChildhoodEvents(birthYear, currentAge, casta, socialClass, rng) {
  const events = [];

  // Only generate if old enough
  if (currentAge < EVENT_AGE_RANGES.education.min) return events;

  // Elite get education events
  if (socialClass === 'elite' || socialClass === 'middling') {
    const educationAge = rng.nextInt(EVENT_AGE_RANGES.education.min, Math.min(EVENT_AGE_RANGES.education.max, currentAge));
    const careerTemplates = getEventTemplates('career', casta, socialClass, '');
    const educationTemplates = careerTemplates.filter(t =>
      t.toLowerCase().includes('studied') ||
      t.toLowerCase().includes('training') ||
      t.toLowerCase().includes('apprentice')
    );

    if (educationTemplates.length > 0) {
      const template = rng.choice(educationTemplates);
      events.push({
        year: birthYear + educationAge,
        age: educationAge,
        category: 'education',
        description: template,
        importance: 2
      });
    }
  }

  return events;
}

/**
 * Generate marriage event
 */
function generateMarriageEvent(marriageYear, birthYear, spouse, casta, socialClass, rng) {
  const category = socialClass === 'elite' ? 'elite' : 'common';
  const templates = LIFE_EVENTS.marriage[category] || LIFE_EVENTS.marriage.common;
  let template = rng.choice(templates);

  template = template.replace('{spouse}', spouse.name);

  return {
    year: marriageYear,
    age: marriageYear - birthYear, // Age at marriage
    category: 'marriage',
    description: template,
    importance: 3
  };
}

/**
 * Generate career events (start and advancement)
 */
function generateCareerEvents(birthYear, currentAge, casta, socialClass, occupation, rng) {
  const events = [];

  // Career start (age 18-30)
  if (currentAge >= EVENT_AGE_RANGES.careerStart.min) {
    const startAge = rng.nextInt(
      EVENT_AGE_RANGES.careerStart.min,
      Math.min(EVENT_AGE_RANGES.careerStart.max, currentAge)
    );

    const careerTemplates = getEventTemplates('career', casta, socialClass, occupation);
    if (careerTemplates.length > 0) {
      const startTemplate = rng.choice(careerTemplates);
      events.push({
        year: birthYear + startAge,
        age: startAge,
        category: 'career',
        description: startTemplate.replace('{occupation}', occupation),
        importance: 2
      });
    }
  }

  // Career advancement (age 25-60, if old enough)
  if (currentAge >= EVENT_AGE_RANGES.careerAdvancement.min + 5) {
    const advancementAge = rng.nextInt(
      EVENT_AGE_RANGES.careerAdvancement.min,
      Math.min(EVENT_AGE_RANGES.careerAdvancement.max, currentAge)
    );

    const careerTemplates = getEventTemplates('career', casta, socialClass, occupation);
    if (careerTemplates.length > 0) {
      const advancementTemplate = rng.choice(careerTemplates);
      events.push({
        year: birthYear + advancementAge,
        age: advancementAge,
        category: 'career',
        description: advancementTemplate.replace('{occupation}', occupation),
        importance: 2
      });
    }
  }

  return events;
}

/**
 * Generate family events (children births, deaths)
 */
function generateFamilyEvents(family, birthYear, rng) {
  const events = [];

  // Children births (if any)
  if (family.children && family.children.length > 0) {
    family.children.forEach((child, index) => {
      const childBirthYear = 1680 - child.age; // Calculate from current age
      events.push({
        year: childBirthYear,
        age: childBirthYear - birthYear,
        category: 'family',
        description: index === 0
          ? `First child born: ${child.name}`
          : `Child born: ${child.name}`,
        importance: child.living ? 2 : 1
      });

      // If child died, add death event
      if (!child.living && child.yearsDeceased) {
        const deathYear = 1680 - child.yearsDeceased;
        events.push({
          year: deathYear,
          age: deathYear - birthYear,
          category: 'tragedy',
          description: `Lost child ${child.name} to illness`,
          importance: 3
        });
      }
    });
  }

  // Parent deaths (if deceased)
  family.parents.forEach(parent => {
    if (!parent.living && parent.yearsDeceased) {
      const deathYear = 1680 - parent.yearsDeceased;
      events.push({
        year: deathYear,
        age: deathYear - birthYear,
        category: 'family',
        description: `${parent.relation.charAt(0).toUpperCase() + parent.relation.slice(1)} ${parent.name} passed away`,
        importance: 2
      });
    }
  });

  return events;
}

/**
 * Generate historical events that occurred during lifetime
 */
function generateHistoricalEvents(birthYear, currentYear, casta, socialClass) {
  const events = [];
  const historicalYears = Object.keys(LIFE_EVENTS.historical).map(Number);

  historicalYears.forEach(year => {
    // Only include if NPC was alive during this event
    if (year >= birthYear && year <= currentYear) {
      const eventText = getHistoricalEvent(year, casta, socialClass);
      if (eventText) {
        events.push({
          year: year,
          age: year - birthYear,
          category: 'historical',
          description: eventText,
          importance: 2
        });
      }
    }
  });

  return events;
}

/**
 * Generate random tragedies
 */
function generateTragedies(birthYear, currentAge, casta, socialClass, rng) {
  const events = [];

  // Number of tragedies based on class
  const tragedyCount = socialClass === 'elite'
    ? rng.nextInt(0, 1)  // Elite: 0-1 tragedies
    : rng.nextInt(1, 2); // Common: 1-2 tragedies

  const tragedyTemplates = [
    ...getEventTemplates('tragedy', casta, socialClass, ''),
    ...(LIFE_EVENTS.tragedy.all || [])
  ];

  for (let i = 0; i < tragedyCount && tragedyTemplates.length > 0; i++) {
    // Random age for tragedy (at least 15 years old)
    const tragedyAge = rng.nextInt(Math.max(15, EVENT_AGE_RANGES.education.max), currentAge - 2);
    const template = rng.choice(tragedyTemplates);

    events.push({
      year: birthYear + tragedyAge,
      age: tragedyAge,
      category: 'tragedy',
      description: template,
      importance: 2
    });
  }

  return events;
}

/**
 * Generate random successes
 */
function generateSuccesses(birthYear, currentAge, casta, socialClass, occupation, rng) {
  const events = [];

  // Number of successes based on class
  const successCount = socialClass === 'elite'
    ? rng.nextInt(2, 3)  // Elite: 2-3 successes
    : rng.nextInt(1, 2); // Common: 1-2 successes

  const successTemplates = getEventTemplates('success', casta, socialClass, occupation);

  for (let i = 0; i < successCount && successTemplates.length > 0; i++) {
    // Random age for success (at least 20 years old)
    const successAge = rng.nextInt(Math.max(20, EVENT_AGE_RANGES.careerStart.min), currentAge - 1);
    const template = rng.choice(successTemplates);

    events.push({
      year: birthYear + successAge,
      age: successAge,
      category: 'success',
      description: template.replace('{occupation}', occupation),
      importance: 2
    });
  }

  return events;
}

/**
 * Remove duplicate events in same year (keep first of each category)
 */
function deduplicateEvents(timeline) {
  const seen = new Map();

  return timeline.filter(event => {
    const key = `${event.year}_${event.category}`;
    if (seen.has(key)) {
      return false;
    }
    seen.set(key, true);
    return true;
  });
}

/**
 * Cap timeline at max events, keeping most important
 * @param {Array} timeline - Full timeline
 * @param {Object} rng - Seeded RNG
 * @param {number} maxEvents - Maximum events to keep (default 15)
 * @returns {Array} Capped timeline
 */
function capTimelineEvents(timeline, rng, maxEvents = 15) {
  // If under limit, return as-is
  if (timeline.length <= maxEvents) {
    return timeline;
  }

  // Separate high importance events (always keep)
  const highImportance = timeline.filter(e => e.importance >= 3);
  const normal = timeline.filter(e => e.importance < 3);

  // If high importance events alone exceed limit, take first N
  if (highImportance.length >= maxEvents) {
    return highImportance.slice(0, maxEvents);
  }

  // Calculate how many normal events we can keep
  const remainingSlots = maxEvents - highImportance.length;

  // Sample normal events (using RNG for deterministic sampling)
  const sampledNormal = rng.sample(normal, remainingSlots);

  // Combine and re-sort chronologically
  const result = [...highImportance, ...sampledNormal];
  result.sort((a, b) => a.year - b.year);

  return result;
}

/**
 * Get icon for event category
 */
export function getEventIcon(category) {
  const icons = {
    birth: '🍼',
    education: '📚',
    marriage: '💍',
    career: '⚒️',
    family: '👨‍👩‍👧',
    historical: '🏛️',
    tragedy: '⚡',
    success: '⭐',
    religious: '✝️',
    legal: '⚖️'
  };

  return icons[category] || '•';
}

/**
 * Get color for event category (for styling)
 */
export function getEventColor(category) {
  const colors = {
    birth: { light: 'rgba(236, 72, 153, 0.1)', dark: 'rgba(236, 72, 153, 0.2)', text: 'text-pink-700 dark:text-pink-400' },
    education: { light: 'rgba(59, 130, 246, 0.1)', dark: 'rgba(59, 130, 246, 0.2)', text: 'text-blue-700 dark:text-blue-400' },
    marriage: { light: 'rgba(236, 72, 153, 0.15)', dark: 'rgba(236, 72, 153, 0.25)', text: 'text-pink-700 dark:text-pink-300' },
    career: { light: 'rgba(168, 85, 247, 0.1)', dark: 'rgba(168, 85, 247, 0.2)', text: 'text-purple-700 dark:text-purple-400' },
    family: { light: 'rgba(34, 197, 94, 0.1)', dark: 'rgba(34, 197, 94, 0.2)', text: 'text-green-700 dark:text-green-400' },
    historical: { light: 'rgba(245, 158, 11, 0.1)', dark: 'rgba(245, 158, 11, 0.2)', text: 'text-amber-700 dark:text-amber-400' },
    tragedy: { light: 'rgba(239, 68, 68, 0.1)', dark: 'rgba(239, 68, 68, 0.2)', text: 'text-red-700 dark:text-red-400' },
    success: { light: 'rgba(251, 191, 36, 0.1)', dark: 'rgba(251, 191, 36, 0.2)', text: 'text-yellow-700 dark:text-yellow-300' },
    religious: { light: 'rgba(99, 102, 241, 0.1)', dark: 'rgba(99, 102, 241, 0.2)', text: 'text-indigo-700 dark:text-indigo-400' },
    legal: { light: 'rgba(107, 114, 128, 0.1)', dark: 'rgba(107, 114, 128, 0.2)', text: 'text-gray-700 dark:text-gray-400' }
  };

  return colors[category] || colors.career;
}

export default {
  generateTimeline,
  getEventIcon,
  getEventColor
};
