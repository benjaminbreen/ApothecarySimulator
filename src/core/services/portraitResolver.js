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
 * Occupation clustering for broader portrait matching
 * Groups semantically similar occupations together
 */
const OCCUPATION_CLUSTERS = {
  'commerce': ['merchant', 'vendor', 'trader', 'shopkeeper', 'importer', 'seller', 'dealer', 'merchantman', 'peddler'],
  'labor': ['farmer', 'laborer', 'worker', 'peasant', 'porter', 'field worker', 'agricultural worker', 'messenger'],
  'military': ['soldier', 'guard', 'militiaman', 'officer', 'sergeant', 'conquistador', 'knight', 'veteran'],
  'religious_male': ['priest', 'friar', 'monk', 'brother', 'abbot', 'prior', 'bishop', 'cleric'],
  'religious_female': ['nun', 'sister', 'abbess', 'novice'],
  'medical': ['physician', 'doctor', 'surgeon', 'apothecary', 'healer', 'midwife', 'curandera', 'herbalist'],
  'scholarly': ['scholar', 'scribe', 'notary', 'clerk', 'writer', 'teacher', 'tutor', 'student'],
  'artisan': ['artisan', 'craftsman', 'weaver', 'cobbler', 'blacksmith', 'carpenter', 'seamstress', 'goldsmith', 'toymaker'],
  'service': ['servant', 'maid', 'domestic', 'attendant', 'butler', 'cook', 'page'],
  'maritime': ['sailor', 'seaman', 'mariner', 'navigator', 'ship captain', 'dockworker'],
  'legal': ['lawyer', 'attorney', 'judge', 'official', 'magistrate'],
  'nobility': ['nobleman', 'noblewoman', 'lord', 'lady', 'patrician', 'don', 'doña', 'elite'],
  'entertainment': ['musician', 'performer', 'artist', 'juggler'],
  'transport': ['muleteer', 'driver', 'transporter', 'teamster'],
  'innkeeper': ['innkeeper', 'tavern keeper', 'host']
};

/**
 * Get occupation cluster for a given occupation
 * @param {string} occupation - Occupation to cluster
 * @returns {string|null} Cluster name or null
 */
function getOccupationCluster(occupation) {
  if (!occupation) return null;
  const occLower = occupation.toLowerCase().trim();

  for (const [cluster, occupations] of Object.entries(OCCUPATION_CLUSTERS)) {
    if (occupations.some(occ => occLower.includes(occ) || occ.includes(occLower))) {
      return cluster;
    }
  }
  return null;
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
  const occupationCluster = getOccupationCluster(occupation);

  console.log(`[Portrait Resolver] Matching demographics: ${gender}, ${age}, ${casta}, ${socialClass}, ${occupation}${occupationCluster ? ` (cluster: ${occupationCluster})` : ''}`);

  // Filter to ONLY generic portraits (exclude named portraits)
  const genericPortraits = Object.entries(PORTRAIT_LIBRARY)
    .filter(([_, meta]) => !meta.name); // Exclude portraits with explicit names

  // Score each portrait
  const scores = genericPortraits.map(([filename, portrait]) => {
    let score = 0;

    // PHASE 1: REBALANCED SCORING WEIGHTS
    // Priority: Visual authenticity (gender, age, casta) > Occupation specificity > Context (class)
    // Occupation is now heavily weighted to ensure sailors get sailor portraits, etc.

    // Gender match (critical, +60 for exact match)
    if (portrait.gender === gender && gender !== 'unknown') {
      score += 60;
    } else if (portrait.gender === 'unknown' || portrait.gender === 'group') {
      score += 10;
    } else if (gender === 'unknown') {
      score += 5;
    } else if (gender !== 'unknown' && portrait.gender !== 'unknown') {
      // CRITICAL: Severe penalty for wrong gender (visually disqualifying)
      score -= 70;
    }

    // Age match (+50 points, increased from +40) - Visual authenticity
    if (portrait.age === age) {
      score += 50;
    } else if (portrait.age === 'mixed') {
      score += 5;
    } else {
      // CRITICAL: Penalize major age mismatches (visually jarring)
      // Child/elderly mismatches are especially problematic
      const ageMismatches = {
        'child': { 'young': -30, 'adult': -50, 'middle-aged': -60, 'elderly': -60 },
        'young': { 'child': -30, 'middle-aged': -20, 'elderly': -30 },
        'adult': { 'child': -50, 'elderly': -20 },
        'middle-aged': { 'child': -60, 'young': -20, 'elderly': -10 },
        'elderly': { 'child': -60, 'young': -30, 'adult': -20, 'middle-aged': -10 }
      };

      const penalty = ageMismatches[age]?.[portrait.age];
      if (penalty) {
        score += penalty;
      }
    }

    // Casta match (+30 points, -30 for major mismatch) - Visual authenticity
    const portraitCastas = Array.isArray(portrait.casta) ? portrait.casta : [portrait.casta];
    const normalizedPortraitCastas = portraitCastas.map(c => normalizeCasta(c));
    if (normalizedPortraitCastas.includes(casta)) {
      score += 30;
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

      for (const [group, members] of Object.entries(majorEthnicGroups)) {
        const entityInGroup = members.includes(casta);
        const portraitInSameGroup = normalizedPortraitCastas.some(pc => members.includes(pc));

        if (entityInGroup && !portraitInSameGroup) {
          score -= 30;
          break;
        }
      }
    }

    // Class match (+25 points) - Social context
    const portraitClasses = Array.isArray(portrait.class) ? portrait.class : [portrait.class];
    const normalizedPortraitClasses = portraitClasses.map(c => normalizeClass(c));
    if (normalizedPortraitClasses.includes(socialClass)) {
      score += 25;
    } else if (normalizedPortraitClasses.includes('any')) {
      score += 5;
    }

    // PHASE 2: OCCUPATION CLUSTERING
    // CRITICAL: Occupation should be heavily weighted - it's narrative-specific context
    // A sailor should ALWAYS get a sailor portrait if available

    // Exact occupation match (+75 points) - Tripled from +25 for strong prioritization
    const portraitOccupations = Array.isArray(portrait.occupation) ? portrait.occupation : [portrait.occupation];
    const exactOccupationMatch = portraitOccupations.some(occ =>
      occ.toLowerCase().includes(occupation) || occupation.includes(occ.toLowerCase())
    );
    if (exactOccupationMatch) {
      score += 75;
    }

    // Cluster match (+40 points) - Allows broader matching (vendor can use merchant portrait)
    // Doubled from +20 to make semantic clusters more meaningful
    if (!exactOccupationMatch && occupationCluster) {
      const portraitClusters = portraitOccupations
        .map(occ => getOccupationCluster(occ))
        .filter(c => c !== null);

      if (portraitClusters.includes(occupationCluster)) {
        score += 40;
      }
    }

    // Tag fuzzy matching (+25 points) - Semantic relevance
    // Increased from +15 to make tags more meaningful
    if (portrait.tags && occupation !== 'unknown') {
      const tagMatch = portrait.tags.some(tag =>
        tag.toLowerCase().includes(occupation) || occupation.includes(tag.toLowerCase())
      );
      if (tagMatch) {
        score += 25;
      }
    }

    // CRITICAL: Sanity check - Must match at least 2 of 3 critical visual features
    // This prevents obviously wrong portraits (e.g., male portrait for female character)
    const genderMatches = portrait.gender === gender && gender !== 'unknown';
    const ageMatches = portrait.age === age;
    const castaMatches = normalizedPortraitCastas.includes(casta);
    const criticalMatches = [genderMatches, ageMatches, castaMatches].filter(Boolean).length;

    if (criticalMatches < 2) {
      score = 0; // Disqualify - too many critical mismatches
    }

    // Tiebreaker: Calculate specificity (prefer portraits with detailed metadata)
    const specificity = [
      portrait.gender !== 'unknown' && portrait.gender !== 'any' ? 1 : 0,
      portrait.age !== 'mixed' ? 1 : 0,
      !normalizedPortraitCastas.includes('any') ? 1 : 0,
      portrait.occupation && portrait.occupation !== 'unknown' ? 1 : 0
    ].reduce((sum, v) => sum + v, 0);

    return { filename, score, portrait, specificity };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Get best score
  const bestMatch = scores[0];

  if (!bestMatch || bestMatch.score < 30) {
    console.log(`[Portrait Resolver] ✗ No good match found (best: ${bestMatch?.score || 0}), using default`);
    return 'defaultnpc.jpg';
  }

  // VARIETY IMPROVEMENT: Pick randomly from top 3 portraits
  // Prevents selecting inappropriate portraits that happen to score similarly
  // (e.g., child portraits when looking for middle-aged adults)
  const TOP_N = 3;
  const topMatches = scores.slice(0, Math.min(TOP_N, scores.length));

  // Randomly select from top N matches
  const selectedMatch = topMatches[Math.floor(Math.random() * topMatches.length)];

  // Log top matches for debugging
  console.log(`[Portrait Resolver] Top ${Math.min(5, scores.length)} matches for "${entity.name}":`);
  scores.slice(0, 5).forEach((match, i) => {
    const isSelected = match.filename === selectedMatch.filename;
    console.log(`  ${i + 1}. ${match.filename} (score: ${match.score})${isSelected ? ' ← SELECTED' : ''}`);
  });
  console.log(`[Portrait Resolver] ✓ Randomly selected from top ${topMatches.length} matches`);

  return selectedMatch.filename;
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
