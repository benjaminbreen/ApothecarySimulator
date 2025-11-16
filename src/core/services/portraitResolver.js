/**
 * Portrait Resolver
 *
 * THE ONLY portrait resolution system in the game.
 * Call this when displaying a portrait, not during entity enrichment.
 *
 * Resolution priority:
 * 1. Check cache on entity (_portraitPath)
 * 2. Try ID-based portrait match (e.g., leonor_mendez.jpg for entity.id='leonor_mendez')
 * 3. Try exact named portrait match (for story-critical NPCs)
 * 4. Match generic portrait by demographics (gender, age, casta, class)
 * 5. Fallback to defaultnpc.jpg
 */

import { PORTRAIT_LIBRARY } from './portraitLibrary';
import { PORTRAIT_CATEGORIES } from '../config/portraits.config';

// Anti-repetition: Track recently used portraits (in-memory, session only)
const RECENT_PORTRAIT_HISTORY = [];
const MAX_HISTORY_SIZE = 20; // Remember last 20 portraits

// Debug info cache: Store selection reasoning for UI display
const PORTRAIT_DEBUG_CACHE = new Map(); // Key: entity name, Value: debug info object

// Tag priority tiers (defined once for performance)
const MEDICAL_TAGS = ['sick', 'disease', 'ill', 'patient', 'injured', 'wound', 'pox', 'smallpox', 'fever',
                      'rash', 'pustules', 'lesions', 'contagious', 'suffering', 'afflicted', 'hurt',
                      'bleeding', 'trauma', 'laceration', 'cut', 'malnourished', 'thin', 'skinny', 'gaunt'];
const OCCUPATION_TAGS = ['merchant', 'vendor', 'soldier', 'priest', 'scholar', 'artisan', 'farmer',
                        'sailor', 'physician', 'weaver', 'butcher', 'leatherworker', 'tools', 'food'];
const PERSONALITY_TAGS = ['cautious', 'desperate', 'worried', 'angry', 'friendly', 'suspicious'];

// Named portrait cache for O(1) lookup (built on first use)
let NAMED_PORTRAIT_CACHE = null;

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
    'portuguese': 'portugués',
    'filipino': 'filipino',
    'filipina': 'filipino',
    'philippine': 'filipino',
    'asian': 'filipino',
    'chinese': 'chinese',
    'chino': 'chinese',
    'china': 'chinese',
    'japanese': 'japanese',
    'japonés': 'japanese'
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
  'patient': ['patient', 'sick', 'ill', 'diseased', 'injured', 'wounded', 'suffering', 'afflicted', 'invalid'],
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
 * Find portrait by entity ID
 * Checks if a portrait file named {id}.jpg or {id}.png exists
 * This is the HIGHEST priority match for story NPCs with dedicated portraits
 * @param {string} entityId - Entity ID (e.g., 'leonor_mendez')
 * @returns {string|null} - Portrait filename or null
 */
function findPortraitById(entityId) {
  if (!entityId) return null;

  // Build set of available portraits inline (can't call getAllPortraitFilenames from here)
  const availablePortraits = new Set();
  Object.values(PORTRAIT_CATEGORIES).forEach(category => {
    if (Array.isArray(category)) {
      category.forEach(filename => availablePortraits.add(filename.toLowerCase()));
    }
  });

  const extensions = ['.jpg', '.png', '.jpeg'];

  // Try exact ID match with each extension
  for (const ext of extensions) {
    const idFilename = `${entityId}${ext}`;
    if (availablePortraits.has(idFilename.toLowerCase())) {
      console.log(`[Portrait Resolver] ✓ ID match: "${entityId}" → ${idFilename}`);

      // Find the original-case version from the config
      for (const category of Object.values(PORTRAIT_CATEGORIES)) {
        if (Array.isArray(category)) {
          const match = category.find(filename => filename.toLowerCase() === idFilename.toLowerCase());
          if (match) {
            return match;
          }
        }
      }

      // Fallback: return the ID filename (shouldn't reach here if portrait exists)
      return idFilename;
    }
  }

  console.log(`[Portrait Resolver] ✗ No ID-based match found for "${entityId}"`);
  return null;
}

/**
 * Find exact named portrait match (uses cache for O(1) lookup)
 * @param {string} entityName - Entity name to match
 * @returns {string|null} - Portrait filename or null
 */
function findNamedPortrait(entityName) {
  if (!entityName) return null;

  // Build cache on first use
  if (!NAMED_PORTRAIT_CACHE) {
    NAMED_PORTRAIT_CACHE = new Map();
    for (const [filename, meta] of Object.entries(PORTRAIT_LIBRARY)) {
      if (meta.name) {
        const normalizedName = normalizeName(meta.name);
        NAMED_PORTRAIT_CACHE.set(normalizedName, filename);
      }
    }
    console.log(`[Portrait Resolver] Built named portrait cache: ${NAMED_PORTRAIT_CACHE.size} entries`);
  }

  const normalized = normalizeName(entityName);
  const filename = NAMED_PORTRAIT_CACHE.get(normalized);

  if (filename) {
    console.log(`[Portrait Resolver] Named match: "${entityName}" → ${filename}`);
  }

  return filename || null;
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
    const scoreBreakdown = {}; // Track score components for debugging

    // PHASE 1: REBALANCED SCORING WEIGHTS
    // Priority: Visual authenticity (gender, age, casta) > Occupation specificity > Context (class)
    // Occupation is now heavily weighted to ensure sailors get sailor portraits, etc.

    // Gender match (critical, +60 for exact match)
    let genderScore = 0;
    if (portrait.gender === gender && gender !== 'unknown') {
      genderScore = 60;
    } else if (portrait.gender === 'unknown' || portrait.gender === 'group') {
      genderScore = 10;
    } else if (gender === 'unknown') {
      genderScore = 5;
    } else if (gender !== 'unknown' && portrait.gender !== 'unknown') {
      // CRITICAL: MASSIVE penalty for wrong gender (visually disqualifying)
      // This should prevent male portraits for female characters (and vice versa)
      // Penalty must exceed max possible score from other factors (~200 points)
      genderScore = -250;
    }
    score += genderScore;
    scoreBreakdown.gender = genderScore;

    // Age match (+50 points, increased from +40) - Visual authenticity
    let ageScore = 0;
    if (portrait.age === age) {
      ageScore = 50;
    } else if (portrait.age === 'mixed') {
      ageScore = 5;
    } else {
      // CRITICAL: Penalize major age mismatches (visually jarring)
      // Child/elderly mismatches are especially problematic
      const ageMismatches = {
        'child': { 'young': -30, 'adult': -50, 'middle-aged': -60, 'elderly': -60 },
        'young': { 'child': -30, 'adult': -20, 'middle-aged': -20, 'elderly': -30 },
        'adult': { 'child': -50, 'young': -20, 'elderly': -20 },
        'middle-aged': { 'child': -60, 'young': -20, 'elderly': -10 },
        'elderly': { 'child': -60, 'young': -30, 'adult': -20, 'middle-aged': -10 }
      };

      const penalty = ageMismatches[age]?.[portrait.age];
      if (penalty) {
        ageScore = penalty;
      }
    }
    score += ageScore;
    scoreBreakdown.age = ageScore;

    // Casta match (+30 points, -30 for major mismatch) - Visual authenticity
    const portraitCastas = Array.isArray(portrait.casta) ? portrait.casta : [portrait.casta];
    const normalizedPortraitCastas = portraitCastas.map(c => normalizeCasta(c));
    let castaScore = 0;
    // 'any' acts as a wildcard - matches anything (reduced from +20 to +10 to discourage generic portraits)
    if (casta === 'any' || normalizedPortraitCastas.includes('any')) {
      castaScore = 10; // Reduced bonus for wildcard to favor specific matches
    } else if (casta !== 'unknown' && normalizedPortraitCastas.includes(casta)) {
      castaScore = 30;
    } else if (casta !== 'unknown') {
      // Penalize major ethnic mismatches (visually obvious differences)
      const majorEthnicGroups = {
        'español': ['español', 'criollo', 'europeo', 'portugués'],
        'criollo': ['español', 'criollo', 'europeo', 'portugués'],
        'africano': ['africano', 'mulato'],
        'indio': ['indio'],
        'filipino': ['filipino', 'chinese', 'japanese'],
        'chinese': ['filipino', 'chinese', 'japanese'],
        'japanese': ['filipino', 'chinese', 'japanese'],
        'mestizo': ['mestizo'] // Mixed heritage - penalize for obviously different groups
      };

      for (const [group, members] of Object.entries(majorEthnicGroups)) {
        const entityInGroup = members.includes(casta);
        const portraitInSameGroup = normalizedPortraitCastas.some(pc => members.includes(pc));

        if (entityInGroup && !portraitInSameGroup) {
          castaScore = -30;
          break;
        }
      }
    }
    score += castaScore;
    scoreBreakdown.casta = castaScore;

    // Class match (+25 points) - Social context
    const portraitClasses = Array.isArray(portrait.class) ? portrait.class : [portrait.class];
    const normalizedPortraitClasses = portraitClasses.map(c => normalizeClass(c));
    let classScore = 0;
    // 'any' acts as a wildcard - matches anything (reduced to discourage generic portraits)
    if (socialClass === 'any' || normalizedPortraitClasses.includes('any')) {
      classScore = 8; // Reduced from +15 to favor specific matches
    } else if (normalizedPortraitClasses.includes(socialClass)) {
      classScore = 25;
    }
    score += classScore;
    scoreBreakdown.class = classScore;

    // PHASE 2: OCCUPATION CLUSTERING
    // CRITICAL: Occupation should be heavily weighted - it's narrative-specific context
    // A sailor should ALWAYS get a sailor portrait if available

    // Exact occupation match (+150 points) - MASSIVELY increased to ensure exact matches dominate
    const portraitOccupations = Array.isArray(portrait.occupation) ? portrait.occupation : [portrait.occupation];
    let exactOccupationMatch = false;
    let occupationScore = 0;

    // 'any' acts as a wildcard - portrait matches any entity occupation (reduced to discourage generic portraits)
    if (portraitOccupations.includes('any')) {
      occupationScore = 15; // Reduced from +30 to favor specific occupations
      exactOccupationMatch = true; // Treat wildcard as exact for cluster logic
    } else {
      exactOccupationMatch = portraitOccupations.some(occ =>
        occ.toLowerCase().includes(occupation) || occupation.includes(occ.toLowerCase())
      );
      if (occupation !== 'unknown' && exactOccupationMatch) {
        occupationScore = 150; // Increased from +75 to ensure exact matches win decisively
      }
    }

    // Cluster match (+40 points) - Allows broader matching (vendor can use merchant portrait)
    // Doubled from +20 to make semantic clusters more meaningful
    if (!exactOccupationMatch && occupationCluster) {
      const portraitClusters = portraitOccupations
        .map(occ => getOccupationCluster(occ))
        .filter(c => c !== null);

      if (portraitClusters.includes(occupationCluster)) {
        occupationScore = 40;
      }
    }

    score += occupationScore;
    scoreBreakdown.occupation = occupationScore;

    // PHASE 2.5: DIRECT NAME TAG MATCHING (CRITICAL FOR ANIMALS)
    // Check entity NAME for direct tag matches (NOT description - too broad)
    // This ensures animals like "a mule named Pepita" match donkey.jpg with 'mule' tag
    let directTagBonus = 0;
    const directTagMatches = [];
    if (portrait.tags && portrait.tags.length > 0 && entity.name) {
      const entityNameLower = entity.name.toLowerCase();

      portrait.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        // Use word boundaries to ensure "mule" doesn't match "Samuel"
        // Skip generic tags like "animal" - only specific animal types
        if (tagLower !== 'animal' && tagLower.length > 3) {
          const wordBoundaryRegex = new RegExp(`\\b${tagLower}\\b`);
          if (wordBoundaryRegex.test(entityNameLower)) {
            // CRITICAL MATCH: Entity name directly contains this specific tag
            // This is essential for animals (mule, donkey, cat, dog, etc.)
            directTagBonus += 250;
            directTagMatches.push(tag);
          }
        }
      });
    }

    score += directTagBonus;
    if (directTagBonus > 0) {
      scoreBreakdown.directTags = { score: directTagBonus, matches: directTagMatches };
    }

    // Tag fuzzy matching with PRIORITY TIERS - Semantic relevance
    // Matches tags against occupation, appearance, AND description for better context awareness
    let tagBonus = 0;
    let matchedTags = 0;
    const fuzzyTagMatches = [];

    if (portrait.tags && portrait.tags.length > 0) {
      // Build searchable text from all relevant entity fields
      const searchableText = [
        occupation,
        entity.appearance,
        entity.description,
        entity.personality
      ].filter(Boolean).join(' ').toLowerCase();

      portrait.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (searchableText.includes(tagLower)) {
          matchedTags++;
          let tagPoints = 0;

          // Tiered scoring based on tag importance (uses global constants)
          if (MEDICAL_TAGS.includes(tagLower)) {
            tagPoints = 80; // Medical/condition tags are most valuable
          } else if (OCCUPATION_TAGS.includes(tagLower)) {
            tagPoints = 70; // Occupation tags are highly important (increased from +40)
          } else if (PERSONALITY_TAGS.includes(tagLower)) {
            tagPoints = 25; // Personality tags are least valuable
          } else {
            tagPoints = 40; // Other tags (default, increased from +30)
          }

          tagBonus += tagPoints;
          fuzzyTagMatches.push({ tag, points: tagPoints });
        }
      });

      score += tagBonus;

      // Bonus for matching multiple tags (shows strong semantic fit)
      // Cap at 3 extra tags to prevent excessive bonuses
      let multiTagBonus = 0;
      if (matchedTags >= 2) {
        const bonusTags = Math.min(matchedTags - 1, 3); // Max +90 for 3+ matching tags
        multiTagBonus = 30 * bonusTags; // Increased from 20 to reward multi-tag matches more
        score += multiTagBonus;
      }

      if (tagBonus > 0 || multiTagBonus > 0) {
        scoreBreakdown.tags = {
          fuzzyBonus: tagBonus,
          multiTagBonus: multiTagBonus,
          matches: fuzzyTagMatches
        };
      }
    }

    // CRITICAL: Sanity check - Must match at least 2 of 3 critical visual features
    // This prevents obviously wrong portraits (e.g., male portrait for female character)
    // EXCEPTION: Animal portraits bypass this check (they rely on tag matching instead)

    const isAnimalPortrait = portrait.gender === 'animal' || portrait.casta === 'animal' || portrait.class === 'animal';

    // Animal entity detection - MUST be very specific to avoid false positives
    // (e.g., "stable master overseeing animals" should NOT trigger this)
    const entityNameLower = (entity.name || '').toLowerCase();
    const isAnimalEntity =
      // Explicit animal type
      entity.type === 'animal' ||
      gender === 'animal' ||
      casta === 'animal' ||
      // Entity NAME contains specific animal words (not description - too broad!)
      // Use word boundaries to avoid matching "mule" in "Samuel"
      /\b(mule|donkey|burro|cat|dog|horse|goat|sheep|pig|chicken|rooster|cow|bull|ox|frog)\b/.test(entityNameLower);

    // Skip sanity check for animal portraits matching animal entities
    if (!isAnimalPortrait || !isAnimalEntity) {
      const genderMatches = portrait.gender === gender && gender !== 'unknown';
      const ageMatches = portrait.age === age;
      // 'any' is treated as a wildcard match for sanity check
      const castaMatches = normalizedPortraitCastas.includes(casta) ||
                           casta === 'any' ||
                           normalizedPortraitCastas.includes('any');
      const criticalMatches = [genderMatches, ageMatches, castaMatches].filter(Boolean).length;

      if (criticalMatches < 2) {
        score = 0; // Disqualify - too many critical mismatches
      }
    }
    // Animal portraits rely on direct tag matching (handled above with +250 bonus)

    // Anti-repetition penalty: Penalize recently used portraits
    const recentUseIndex = RECENT_PORTRAIT_HISTORY.indexOf(filename);
    let antiRepetitionPenalty = 0;
    if (recentUseIndex !== -1) {
      // More recent = bigger penalty. Most recent gets -50, oldest gets -10
      const recency = RECENT_PORTRAIT_HISTORY.length - recentUseIndex;
      antiRepetitionPenalty = Math.floor(50 * (recency / RECENT_PORTRAIT_HISTORY.length));
      score -= antiRepetitionPenalty;
      scoreBreakdown.antiRepetition = -antiRepetitionPenalty;
    }

    // Specificity bonus: Add extra points for highly specific portraits
    const hasSpecificOccupation = Array.isArray(portrait.occupation)
      ? portrait.occupation.length > 0 && !portrait.occupation.includes('unknown') && !portrait.occupation.includes('any')
      : portrait.occupation && portrait.occupation !== 'unknown' && portrait.occupation !== 'any';

    const specificity = [
      portrait.gender !== 'unknown' && portrait.gender !== 'any' ? 1 : 0,
      portrait.age !== 'mixed' ? 1 : 0,
      !normalizedPortraitCastas.includes('any') ? 1 : 0,
      hasSpecificOccupation ? 1 : 0
    ].reduce((sum, v) => sum + v, 0);

    // Add bonus points for high specificity (encourages detailed portraits)
    let specificityBonus = 0;
    if (specificity >= 3) {
      specificityBonus = 15; // Bonus for very specific portraits
      score += specificityBonus;
      scoreBreakdown.specificity = specificityBonus;
    }

    return { filename, score, portrait, specificity, scoreBreakdown };
  });

  // Sort by score descending, use specificity as tiebreaker
  scores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.specificity - a.specificity; // Prefer detailed portraits over generic
  });

  // Get best score
  const bestMatch = scores[0];

  if (!bestMatch || bestMatch.score < 30) {
    console.log(`[Portrait Resolver] ✗ No good match found (best: ${bestMatch?.score || 0}), using default`);
    return 'defaultnpc.jpg';
  }

  // SMART SELECTION: Deterministic for clear winners, random for close matches
  // If top match has a significantly higher score (100+ points), it's a clear winner - use it
  // Otherwise, randomize from top N for variety
  const CLEAR_WINNER_THRESHOLD = 100; // Points gap that indicates a definitive match
  const TOP_N = 3; // Reduced from 5 to avoid poor matches (e.g., male portraits for female NPCs)

  let selectedMatch;
  const secondBestScore = scores[1]?.score || 0;
  const scoreDifference = bestMatch.score - secondBestScore;

  let selectionReason = '';

  if (scoreDifference >= CLEAR_WINNER_THRESHOLD) {
    // Clear winner - use deterministically (e.g., direct tag match, exact occupation)
    selectedMatch = bestMatch;
    selectionReason = `Clear winner (${scoreDifference} points ahead) - selected deterministically`;

    console.log(`[Portrait Resolver] Top ${Math.min(3, scores.length)} matches for "${entity.name}":`);
    scores.slice(0, 3).forEach((match, i) => {
      const isSelected = match.filename === selectedMatch.filename;
      const recentUse = RECENT_PORTRAIT_HISTORY.indexOf(match.filename);
      const recentLabel = recentUse !== -1 ? ` [Used ${recentUse} turns ago]` : '';
      console.log(`  ${i + 1}. ${match.filename} (score: ${match.score}, specificity: ${match.specificity})${isSelected ? ' ← SELECTED' : ''}${recentLabel}`);
    });
    console.log(`[Portrait Resolver] ✓ ${selectionReason}`);
  } else {
    // Close scores - randomize from top N for variety
    const topMatches = scores.slice(0, Math.min(TOP_N, scores.length));
    selectedMatch = topMatches[Math.floor(Math.random() * topMatches.length)];
    selectionReason = `Close scores (within ${CLEAR_WINNER_THRESHOLD} points) - randomly selected from top ${topMatches.length}`;

    console.log(`[Portrait Resolver] Top ${Math.min(3, scores.length)} matches for "${entity.name}":`);
    scores.slice(0, 3).forEach((match, i) => {
      const isSelected = match.filename === selectedMatch.filename;
      const recentUse = RECENT_PORTRAIT_HISTORY.indexOf(match.filename);
      const recentLabel = recentUse !== -1 ? ` [Used ${recentUse} turns ago]` : '';
      console.log(`  ${i + 1}. ${match.filename} (score: ${match.score}, specificity: ${match.specificity})${isSelected ? ' ← SELECTED' : ''}${recentLabel}`);
    });
    console.log(`[Portrait Resolver] ✓ ${selectionReason}`);
  }

  // Store debug info for UI display
  const top3 = scores.slice(0, 3).map(match => ({
    filename: match.filename,
    score: match.score,
    specificity: match.specificity,
    isSelected: match.filename === selectedMatch.filename,
    recentUse: RECENT_PORTRAIT_HISTORY.indexOf(match.filename),
    scoreBreakdown: match.scoreBreakdown // Include detailed score components
  }));

  PORTRAIT_DEBUG_CACHE.set(entity.name, {
    entityName: entity.name,
    selected: selectedMatch.filename,
    selectionReason,
    top3Matches: top3,
    demographics: {
      gender: entity.gender,
      age: entity.age,
      casta: entity.social?.casta,
      class: entity.social?.class,
      occupation: entity.social?.occupation
    }
  });

  return selectedMatch.filename;
}

/**
 * Track a portrait filename in the anti-repetition history
 * @param {string} filename - Portrait filename (e.g., 'merchant.jpg')
 */
function trackPortraitUsage(filename) {
  if (!filename) return;

  // Only track if not already at the front (avoid duplicate tracking on same turn)
  if (RECENT_PORTRAIT_HISTORY[0] !== filename) {
    RECENT_PORTRAIT_HISTORY.unshift(filename);
    if (RECENT_PORTRAIT_HISTORY.length > MAX_HISTORY_SIZE) {
      RECENT_PORTRAIT_HISTORY.pop(); // Remove oldest
    }
    console.log(`[Portrait Resolver] Tracked usage: ${filename} (history size: ${RECENT_PORTRAIT_HISTORY.length})`);
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

  let filename = null;
  let usedCache = false;

  // Check cache first (performance optimization)
  if (entity._portraitPath) {
    console.log(`[Portrait Resolver] Using cached path for ${entity.name}: ${entity._portraitPath}`);
    // Extract filename from path for tracking
    filename = entity._portraitPath.split('/').pop();
    usedCache = true;
  } else {
    // Step 1: Try ID-based portrait match (HIGHEST PRIORITY for story NPCs)
    // Looks for portraits named {entity.id}.jpg (e.g., leonor_mendez.jpg)
    if (entity.id) {
      filename = findPortraitById(entity.id);
    }

    // Step 2: Try exact named portrait match (for story-critical NPCs)
    if (!filename) {
      filename = findNamedPortrait(entity.name);
    }

    // Step 3: Match by demographics if no named portrait found
    if (!filename) {
      filename = matchGenericPortrait(entity);
    }

    // Step 4: Convert to full path
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
  }

  // CRITICAL: Track ALL portrait usage (including cached and named portraits)
  // This ensures anti-repetition system works for recurring characters
  trackPortraitUsage(filename);

  return usedCache ? entity._portraitPath : `/portraits/${filename}`;
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

/**
 * Clear the recent portrait history (useful for testing or reset)
 */
export function clearPortraitHistory() {
  RECENT_PORTRAIT_HISTORY.length = 0;
  console.log('[Portrait Resolver] Portrait history cleared');
}

/**
 * Get the current portrait history (for debugging)
 * @returns {Array<string>} Array of recently used portrait filenames
 */
export function getPortraitHistory() {
  return [...RECENT_PORTRAIT_HISTORY];
}

/**
 * Get portrait debug info for a specific NPC (for UI display)
 * @param {string} entityName - Entity name
 * @returns {Object|null} Debug info object or null if not found
 */
export function getPortraitDebugInfo(entityName) {
  return PORTRAIT_DEBUG_CACHE.get(entityName) || null;
}

export default {
  resolvePortrait,
  clearPortraitCache,
  clearPortraitHistory,
  getPortraitHistory,
  getPortraitDebugInfo
};
