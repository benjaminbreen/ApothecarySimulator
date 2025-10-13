/**
 * Portrait Resolver
 *
 * THE ONLY portrait resolution system in the game.
 * Call this when displaying a portrait, not during entity enrichment.
 *
 * Resolution priority:
 * 1. Check cache on entity (_portraitPath)
 * 2. Try exact named portrait match (for story-critical NPCs)
 * 3. Match generic portrait by demographics (gender, age, casta, class)
 * 4. Fallback to defaultnpc.jpg
 */

import { PORTRAIT_LIBRARY } from './portraitLibrary';

/**
 * Normalize name for matching (lowercase, no special chars, no spaces)
 */
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Normalize age from number or string to standard categories
 */
function normalizeAge(age) {
  if (!age) return 'adult';

  const numAge = parseInt(age);
  if (isNaN(numAge)) {
    // Already a category
    const ageLower = age.toLowerCase();
    if (['child', 'youth', 'young', 'adult', 'middle-aged', 'elderly', 'mixed'].includes(ageLower)) {
      return ageLower === 'youth' || ageLower === 'young' ? 'young' : ageLower;
    }
    return 'adult';
  }

  // Convert number to category
  if (numAge < 13) return 'child';
  if (numAge < 25) return 'young';
  if (numAge < 45) return 'adult';
  if (numAge < 60) return 'middle-aged';
  return 'elderly';
}

/**
 * Normalize social class to standard categories
 */
function normalizeClass(socialClass) {
  if (!socialClass) return 'common';

  const classMap = {
    'upper class': 'elite',
    'elite': 'elite',
    'nobility': 'elite',
    'aristocrat': 'elite',
    'noble': 'elite',
    'middle class': 'middling',
    'middling': 'middling',
    'merchant': 'middling',
    'artisan': 'middling',
    'craftsman': 'middling',
    'lower class': 'common',
    'common': 'common',
    'working class': 'common',
    'peasant': 'common',
    'laborer': 'common',
    'poor': 'poor',
    'enslaved': 'enslaved',
    'slave': 'enslaved',
    'clergy': 'religious',
    'religious': 'religious',
    'priest': 'religious',
    'monk': 'religious',
    'nun': 'religious',
    'friar': 'religious'
  };

  return classMap[socialClass.toLowerCase().trim()] || 'common';
}

/**
 * Normalize casta designation
 */
function normalizeCasta(casta) {
  if (!casta) return 'mestizo';

  const castaLower = casta.toLowerCase().trim();

  const castaMap = {
    'español': 'español',
    'espanol': 'español',
    'spanish': 'español',
    'peninsular': 'español',
    'european': 'español',
    'criollo': 'criollo',
    'criolla': 'criollo',
    'creole': 'criollo',
    'mestizo': 'mestizo',
    'mestiza': 'mestizo',
    'mixed': 'mestizo',
    'indio': 'indio',
    'india': 'indio',
    'indígena': 'indio',
    'indigena': 'indio',
    'indigenous': 'indio',
    'native': 'indio',
    'mulato': 'mulato',
    'mulata': 'mulato',
    'mulatto': 'mulato',
    'africano': 'africano',
    'africana': 'africano',
    'african': 'africano',
    'negro': 'africano',
    'negra': 'africano',
    'europeo': 'europeo',
    'europea': 'europeo',
    'portugués': 'portugués',
    'portuguesa': 'portugués',
    'portuguese': 'portugués'
  };

  return castaMap[castaLower] || castaLower;
}

/**
 * Find exact named portrait match
 * @param {string} entityName - Entity name to match
 * @returns {string|null} - Portrait filename or null
 */
function findNamedPortrait(entityName) {
  if (!entityName) return null;

  const normalized = normalizeName(entityName);

  for (const [filename, meta] of Object.entries(PORTRAIT_LIBRARY)) {
    if (meta.name) {
      const metaNormalized = normalizeName(meta.name);
      if (metaNormalized === normalized) {
        console.log(`[Portrait Resolver] Named match: "${entityName}" → ${filename}`);
        return filename;
      }
    }
  }

  return null;
}

/**
 * Match generic portrait by demographics
 * @param {Object} entity - Entity with demographics
 * @returns {string} - Portrait filename (never null, defaults to 'defaultnpc.jpg')
 */
function matchGenericPortrait(entity) {
  // Extract demographics (support both new and old format)
  const demographics = {
    gender: entity.appearance?.gender || entity.gender || 'unknown',
    age: entity.appearance?.age || entity.age || 'adult',
    casta: entity.social?.casta || entity.casta || 'unknown',
    class: entity.social?.class || entity.class || 'common',
    occupation: entity.social?.occupation || entity.occupation || 'unknown'
  };

  // Normalize
  const gender = demographics.gender;
  const age = normalizeAge(demographics.age);
  const casta = normalizeCasta(demographics.casta);
  const socialClass = normalizeClass(demographics.class);
  const occupation = demographics.occupation.toLowerCase();

  console.log(`[Portrait Resolver] Matching demographics: ${gender}, ${age}, ${casta}, ${socialClass}, ${occupation}`);

  // Filter to ONLY generic portraits (exclude named portraits)
  const genericPortraits = Object.entries(PORTRAIT_LIBRARY)
    .filter(([_, meta]) => !meta.name); // Exclude portraits with explicit names

  // Score each portrait
  const scores = genericPortraits.map(([filename, portrait]) => {
    let score = 0;

    // Gender match (critical, +50 for exact match)
    if (portrait.gender === gender && gender !== 'unknown') {
      score += 50;
    } else if (portrait.gender === 'unknown' || portrait.gender === 'group') {
      score += 10;
    } else if (gender === 'unknown') {
      score += 5; // Unknown gender gets slight preference for unknown portraits
    }

    // Age match (+30 points)
    if (portrait.age === age) {
      score += 30;
    } else if (portrait.age === 'mixed') {
      score += 5;
    }

    // Casta match (+20 points, -30 for major mismatch)
    const portraitCastas = Array.isArray(portrait.casta) ? portrait.casta : [portrait.casta];
    const normalizedPortraitCastas = portraitCastas.map(c => normalizeCasta(c));
    if (normalizedPortraitCastas.includes(casta)) {
      score += 20;
    } else if (normalizedPortraitCastas.includes('any')) {
      score += 5;
    } else if (casta !== 'unknown') {
      // Penalize major ethnic mismatches (visually obvious differences)
      const majorEthnicGroups = {
        'español': ['español', 'criollo', 'europeo', 'portugués'],
        'criollo': ['español', 'criollo', 'europeo', 'portugués'],
        'africano': ['africano', 'mulato'],
        'indio': ['indio']
      };

      // Check if this is a major mismatch (different visible ethnic group)
      for (const [group, members] of Object.entries(majorEthnicGroups)) {
        const entityInGroup = members.includes(casta);
        const portraitInSameGroup = normalizedPortraitCastas.some(pc => members.includes(pc));

        if (entityInGroup && !portraitInSameGroup) {
          // Entity is in this ethnic group but portrait isn't - major mismatch
          score -= 30;
          break;
        }
      }
    }

    // Class match (+15 points)
    const portraitClasses = Array.isArray(portrait.class) ? portrait.class : [portrait.class];
    const normalizedPortraitClasses = portraitClasses.map(c => normalizeClass(c));
    if (normalizedPortraitClasses.includes(socialClass)) {
      score += 15;
    } else if (normalizedPortraitClasses.includes('any')) {
      score += 3;
    }

    // Occupation match (+50 points) - INCREASED from +25 to prioritize occupation-specific portraits
    const portraitOccupations = Array.isArray(portrait.occupation) ? portrait.occupation : [portrait.occupation];
    const occupationMatch = portraitOccupations.some(occ =>
      occ.toLowerCase().includes(occupation) || occupation.includes(occ.toLowerCase())
    );
    if (occupationMatch) {
      score += 50;
    }

    // Tag fuzzy matching (+10 points per tag) - INCREASED from +5 for better occupation matching
    if (portrait.tags && occupation !== 'unknown') {
      const tagMatch = portrait.tags.some(tag =>
        tag.toLowerCase().includes(occupation) || occupation.includes(tag.toLowerCase())
      );
      if (tagMatch) {
        score += 10;
      }
    }

    return { filename, score, portrait };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Log top 3 matches
  console.log(`[Portrait Resolver] Top 3 matches for "${entity.name}":`);
  scores.slice(0, 3).forEach((match, i) => {
    console.log(`  ${i + 1}. ${match.filename} (score: ${match.score})`);
  });

  // Return best match (or default if score too low)
  const bestMatch = scores[0];
  if (bestMatch && bestMatch.score >= 30) {
    console.log(`[Portrait Resolver] ✓ Selected: ${bestMatch.filename} (score: ${bestMatch.score})`);
    return bestMatch.filename;
  } else {
    console.log(`[Portrait Resolver] ✗ No good match found (best: ${bestMatch?.score || 0}), using default`);
    return 'defaultnpc.jpg';
  }
}

/**
 * Resolve portrait for an entity
 *
 * This is THE ONLY function that should be called to get a portrait path.
 *
 * @param {Object} entity - Entity with demographics
 * @returns {string|null} - Full portrait path (/portraits/filename.jpg) or null
 */
export function resolvePortrait(entity) {
  if (!entity) {
    console.warn('[Portrait Resolver] Called with null entity');
    return null;
  }

  // Check cache first (performance optimization)
  if (entity._portraitPath) {
    console.log(`[Portrait Resolver] Using cached path for ${entity.name}: ${entity._portraitPath}`);
    return entity._portraitPath;
  }

  let filename = null;

  // Step 1: Try exact named portrait match (for story-critical NPCs)
  filename = findNamedPortrait(entity.name);

  // Step 2: Match by demographics if no named portrait found
  if (!filename) {
    filename = matchGenericPortrait(entity);
  }

  // Step 3: Convert to full path
  const fullPath = `/portraits/${filename}`;

  // Cache on entity for future calls (non-enumerable to avoid serialization issues)
  try {
    Object.defineProperty(entity, '_portraitPath', {
      value: fullPath,
      writable: true,
      enumerable: false,
      configurable: true
    });
  } catch (error) {
    // Silently fail if entity is frozen/sealed
    console.warn('[Portrait Resolver] Could not cache portrait path on entity');
  }

  return fullPath;
}

/**
 * Clear portrait cache on an entity (useful if demographics change)
 * @param {Object} entity - Entity to clear cache from
 */
export function clearPortraitCache(entity) {
  if (entity && entity._portraitPath) {
    delete entity._portraitPath;
    console.log(`[Portrait Resolver] Cleared cache for ${entity.name}`);
  }
}

export default {
  resolvePortrait,
  clearPortraitCache
};
