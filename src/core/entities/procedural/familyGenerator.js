/**
 * Family Generator
 *
 * Procedurally generates family members for NPCs based on their
 * age, casta, class, and occupation.
 *
 * Uses seeded RNG for deterministic results.
 *
 * @module familyGenerator
 */

import { generateFamilyMemberName, extractSurname, generateFamilyOccupation } from '../../config/familyNames.config';

/**
 * Mortality rates by age group (percentage chance of being deceased)
 */
const MORTALITY_RATES = {
  // Chance parent is deceased based on NPC's age
  parent: {
    npcAge_20_30: 0.15,  // Young NPC � 15% chance parent died
    npcAge_30_40: 0.25,
    npcAge_40_50: 0.40,
    npcAge_50_60: 0.60,
    npcAge_60_plus: 0.85
  },
  // Chance sibling is deceased
  sibling: {
    infant: 0.40,      // Died in infancy (<5 years)
    child: 0.25,       // Died in childhood (5-15 years)
    adult: 0.15        // Died in adulthood (15+ years)
  },
  // Chance spouse is deceased (widowhood)
  spouse: {
    young: 0.10,       // NPC age 18-35
    middleAged: 0.25,  // NPC age 35-55
    elderly: 0.50      // NPC age 55+
  },
  // Chance child is deceased (infant/child mortality)
  child: {
    infant: 0.35,      // Died in infancy
    young: 0.15        // Died in childhood
  }
};

/**
 * Family size ranges by class
 */
const FAMILY_SIZES = {
  elite: {
    siblings: { min: 3, max: 6 },      // High fertility, lower infant mortality
    children: { min: 2, max: 5 }
  },
  middling: {
    siblings: { min: 2, max: 5 },
    children: { min: 2, max: 4 }
  },
  common: {
    siblings: { min: 2, max: 4 },      // High infant mortality
    children: { min: 1, max: 4 }
  }
};

/**
 * Generate parents for NPC
 * @param {Object} npc - NPC entity
 * @param {Object} rng - Seeded RNG
 * @returns {Array} Array of parent objects
 */
export function generateParents(npc, rng) {
  const surname = extractSurname(npc.name) || 'Unknown';
  const casta = npc.social?.casta || npc.casta || 'mestizo';
  const socialClass = npc.social?.class || npc.class || 'common';
  const isElite = socialClass.toLowerCase() === 'elite';
  const npcAge = npc.age || 40;

  // Parent age (typically 20-30 years older than NPC)
  const fatherAge = npcAge + rng.nextInt(22, 32);
  const motherAge = npcAge + rng.nextInt(20, 28);

  // Mortality check based on NPC age
  let parentMortalityRate = 0.15;
  if (npcAge >= 60) parentMortalityRate = 0.85;
  else if (npcAge >= 50) parentMortalityRate = 0.60;
  else if (npcAge >= 40) parentMortalityRate = 0.40;
  else if (npcAge >= 30) parentMortalityRate = 0.25;

  const fatherAlive = !rng.chance(parentMortalityRate);
  const motherAlive = !rng.chance(parentMortalityRate * 1.1); // Slightly higher mortality for women (childbirth)

  // Father's occupation influences NPC's occupation
  const fatherOccupation = npc.occupation || generateFamilyOccupation(null, casta, 'male', rng);

  // Generate parent castas (if mixed heritage)
  const { fatherCasta, motherCasta } = determineParentCastas(casta, rng);

  const parents = [];

  // Father
  const fatherName = generateFamilyMemberName(fatherCasta, 'male', 'parent', surname, rng, isElite);
  parents.push({
    name: fatherName,
    relation: 'father',
    age: fatherAge,
    gender: 'male',
    occupation: fatherOccupation,
    casta: fatherCasta,
    living: fatherAlive,
    yearsDeceased: fatherAlive ? null : rng.nextInt(1, Math.max(5, Math.floor(npcAge * 0.7)))
  });

  // Mother (elite families more likely to record mother's name)
  if (isElite || rng.chance(0.7)) {
    const motherSurname = rng.choice(['de Le�n', 'Cort�s', 'Mendoza', 'Garc�a', 'L�pez', 'Hern�ndez', 'Ram�rez']);
    const motherName = generateFamilyMemberName(motherCasta, 'female', 'parent', motherSurname, rng, isElite);
    const motherOccupation = isElite ? 'Noblewoman' : generateFamilyOccupation(null, casta, 'female', rng);

    parents.push({
      name: motherName,
      relation: 'mother',
      age: motherAge,
      gender: 'female',
      occupation: motherOccupation,
      casta: motherCasta,
      living: motherAlive,
      yearsDeceased: motherAlive ? null : rng.nextInt(1, Math.max(5, Math.floor(npcAge * 0.7)))
    });
  }

  return parents;
}

/**
 * Determine parent castas based on NPC casta (for mixed heritage)
 * @param {string} npcCasta - NPC's casta
 * @param {Object} rng - Seeded RNG
 * @returns {Object} { fatherCasta, motherCasta }
 */
function determineParentCastas(npcCasta, rng) {
  const castaNormalized = npcCasta.toLowerCase();

  // Casta system rules (simplified)
  switch (castaNormalized) {
    case 'mestizo':
      // Spanish + Indigenous
      return rng.chance(0.5)
        ? { fatherCasta: 'espa�ol', motherCasta: 'indigenous' }
        : { fatherCasta: 'indigenous', motherCasta: 'espa�ol' };

    case 'castizo':
      // Spanish + Mestizo
      return rng.chance(0.6)
        ? { fatherCasta: 'espa�ol', motherCasta: 'mestizo' }
        : { fatherCasta: 'mestizo', motherCasta: 'espa�ol' };

    case 'mulato':
      // Spanish + African
      return rng.chance(0.5)
        ? { fatherCasta: 'espa�ol', motherCasta: 'negro' }
        : { fatherCasta: 'negro', motherCasta: 'espa�ol' };

    case 'morisco':
      // Spanish + Mulato
      return { fatherCasta: 'espa�ol', motherCasta: 'mulato' };

    case 'zambo':
      // Indigenous + African
      return rng.chance(0.5)
        ? { fatherCasta: 'indigenous', motherCasta: 'negro' }
        : { fatherCasta: 'negro', motherCasta: 'indigenous' };

    case 'pardo':
      // Various African mixtures
      return { fatherCasta: 'mulato', motherCasta: 'mulato' };

    // Pure castas (both parents same)
    case 'criollo':
    case 'espa�ol':
    case 'peninsular':
      return { fatherCasta: 'espa�ol', motherCasta: 'espa�ol' };

    case 'indigenous':
    case 'indio':
      return { fatherCasta: 'indigenous', motherCasta: 'indigenous' };

    case 'negro':
      return { fatherCasta: 'negro', motherCasta: 'negro' };

    default:
      return { fatherCasta: castaNormalized, motherCasta: castaNormalized };
  }
}

/**
 * Generate siblings for NPC
 * @param {Object} npc - NPC entity
 * @param {Object} parents - Generated parents
 * @param {Object} rng - Seeded RNG
 * @returns {Array} Array of sibling objects
 */
export function generateSiblings(npc, parents, rng) {
  const casta = npc.social?.casta || npc.casta || 'mestizo';
  const socialClass = npc.social?.class || npc.class || 'common';
  const isElite = socialClass.toLowerCase() === 'elite';
  const surname = extractSurname(npc.name);
  const npcAge = npc.age || 40;

  // Family size based on class
  const classNormalized = socialClass.toLowerCase();
  const familySizes = FAMILY_SIZES[classNormalized] || FAMILY_SIZES.common;
  const siblingCount = rng.nextInt(familySizes.siblings.min, familySizes.siblings.max);

  const siblings = [];
  const father = parents.find(p => p.relation === 'father');

  for (let i = 0; i < siblingCount; i++) {
    // Age relative to NPC (spread 1-8 years)
    const ageGap = rng.nextInt(1, 8);
    const isOlder = rng.chance(0.5);
    const siblingAge = isOlder ? npcAge + ageGap : npcAge - ageGap;

    // Skip if age is implausible
    if (siblingAge < 0 || siblingAge > 90) continue;

    const gender = rng.chance(0.5) ? 'male' : 'female';

    // Mortality check (higher for younger siblings - infant mortality)
    let mortalityRate = 0.15;
    if (siblingAge < 5) mortalityRate = 0.40; // Infant mortality
    else if (siblingAge < 15) mortalityRate = 0.25; // Child mortality

    const isAlive = !rng.chance(mortalityRate);

    // Occupation (inherit from father if same gender, or generate)
    let occupation;
    if (gender === 'male' && father) {
      occupation = rng.chance(0.5) ? father.occupation : generateFamilyOccupation(father.occupation, casta, gender, rng);
    } else {
      occupation = generateFamilyOccupation(father?.occupation, casta, gender, rng);
    }

    // Name
    const name = generateFamilyMemberName(casta, gender, 'sibling', surname, rng, isElite && isOlder);

    siblings.push({
      name,
      relation: isOlder ? 'older sibling' : 'younger sibling',
      age: siblingAge,
      gender,
      occupation,
      living: isAlive,
      yearsDeceased: isAlive ? null : rng.nextInt(1, Math.max(1, npcAge - siblingAge))
    });
  }

  return siblings.sort((a, b) => b.age - a.age); // Sort by age (oldest first)
}

/**
 * Generate spouse for NPC (if married)
 * @param {Object} npc - NPC entity
 * @param {Object} rng - Seeded RNG
 * @returns {Object|null} Spouse object or null if unmarried
 */
export function generateSpouse(npc, rng) {
  const npcAge = npc.age || 40;
  const gender = npc.gender || npc.appearance?.gender || 'male';
  const casta = npc.social?.casta || npc.casta || 'mestizo';
  const socialClass = npc.social?.class || npc.class || 'common';
  const occupation = npc.occupation || npc.social?.occupation || '';
  const isElite = socialClass.toLowerCase() === 'elite';

  // Clergy don't marry
  if (occupation.toLowerCase().includes('priest') ||
      occupation.toLowerCase().includes('friar') ||
      occupation.toLowerCase().includes('monk') ||
      occupation.toLowerCase().includes('nun')) {
    return null;
  }

  // Marriage probability based on age and class
  const marriageAge = isElite ? 25 : 30;
  if (npcAge < 20) return null; // Too young

  // Probability of being married
  let marriageProbability = 0.7;
  if (npcAge < marriageAge) marriageProbability = 0.3;
  else if (npcAge > 45) marriageProbability = 0.8;

  if (!rng.chance(marriageProbability)) return null; // Unmarried

  // Spouse details
  const spouseGender = gender === 'male' ? 'female' : 'male';
  const spouseAge = gender === 'male'
    ? Math.max(16, npcAge - rng.nextInt(2, 8))  // Wives typically younger (minimum age 16)
    : npcAge + rng.nextInt(2, 8); // Husbands typically older

  // Age when married
  const marriedAge = isElite ? rng.nextInt(18, 25) : rng.nextInt(20, 30);
  const yearsMarried = Math.max(0, npcAge - marriedAge);

  // Widowhood check
  let mortalityRate = 0.10;
  if (npcAge >= 55) mortalityRate = 0.50;
  else if (npcAge >= 35) mortalityRate = 0.25;

  const spouseAlive = !rng.chance(mortalityRate);

  // Spouse casta (usually same or close)
  let spouseCasta = casta;
  if (rng.chance(0.2)) {
    // 20% chance of mixed marriage
    const mixedOptions = getMixedMarriageOptions(casta);
    if (mixedOptions.length > 0) {
      spouseCasta = rng.choice(mixedOptions);
    }
  }

  // Spouse name (different surname if female married male)
  const spouseSurname = spouseGender === 'female' && gender === 'male'
    ? extractSurname(npc.name)
    : rng.choice(['Garc�a', 'L�pez', 'Hern�ndez', 'Ram�rez', 'Torres', 'Cort�s', 'Mendoza']);

  const spouseName = generateFamilyMemberName(spouseCasta, spouseGender, 'spouse', spouseSurname, rng, isElite);

  // Spouse occupation
  const spouseOccupation = generateFamilyOccupation(occupation, spouseCasta, spouseGender, rng);

  return {
    name: spouseName,
    relation: spouseAlive ? 'spouse' : 'deceased spouse',
    age: spouseAge,
    gender: spouseGender,
    occupation: spouseOccupation,
    casta: spouseCasta,
    living: spouseAlive,
    marriedYear: 1680 - yearsMarried,
    yearsMarried: yearsMarried,
    yearsDeceased: spouseAlive ? null : rng.nextInt(1, Math.min(yearsMarried, 15))
  };
}

/**
 * Get possible casta options for mixed marriages
 * @param {string} casta - NPC's casta
 * @returns {Array} Array of possible spouse castas
 */
function getMixedMarriageOptions(casta) {
  const castaNormalized = casta.toLowerCase();

  switch (castaNormalized) {
    case 'criollo':
    case 'espa�ol':
      return ['criollo', 'castizo', 'peninsular'];
    case 'mestizo':
      return ['mestizo', 'castizo', 'indigenous'];
    case 'indigenous':
    case 'indio':
      return ['indigenous', 'mestizo'];
    case 'mulato':
    case 'pardo':
      return ['mulato', 'pardo', 'morisco'];
    case 'negro':
      return ['negro', 'mulato', 'zambo'];
    default:
      return [castaNormalized];
  }
}

/**
 * Generate children for NPC (if married long enough)
 * @param {Object} npc - NPC entity
 * @param {Object} spouse - Spouse object
 * @param {Object} rng - Seeded RNG
 * @returns {Array} Array of child objects
 */
export function generateChildren(npc, spouse, rng) {
  if (!spouse) return [];

  const npcAge = npc.age || 40;
  const gender = npc.gender || npc.appearance?.gender || 'male';
  const yearsMarried = spouse.yearsMarried || 0;
  const casta = npc.social?.casta || npc.casta || 'mestizo';
  const socialClass = npc.social?.class || npc.class || 'common';
  const surname = extractSurname(npc.name);
  const isElite = socialClass.toLowerCase() === 'elite';

  // Need to be married at least 2 years to have children
  if (yearsMarried < 2) return [];

  // Number of children based on class and years married
  const classNormalized = socialClass.toLowerCase();
  const familySizes = FAMILY_SIZES[classNormalized] || FAMILY_SIZES.common;

  // Reduce child count if widowed
  const maxChildren = spouse.living
    ? familySizes.children.max
    : Math.floor(familySizes.children.max * 0.6);

  const childCount = rng.nextInt(Math.max(1, familySizes.children.min), maxChildren);

  const children = [];

  for (let i = 0; i < childCount; i++) {
    // Child age (spread 2-4 years apart, up to years married - 1)
    const maxChildAge = Math.min(yearsMarried - 1, npcAge - 18);
    if (maxChildAge < 1) continue;

    const childAge = rng.nextInt(1, Math.max(1, maxChildAge - (i * 3)));
    if (childAge < 0) continue;

    const childGender = rng.chance(0.5) ? 'male' : 'female';

    // Infant/child mortality
    let mortalityRate = 0.35;
    if (childAge > 5) mortalityRate = 0.15;
    if (childAge > 15) mortalityRate = 0.05;

    const isAlive = !rng.chance(mortalityRate);

    // Child's casta (determined by parent castas)
    const childCasta = determineChildCasta(casta, spouse.casta, rng);

    // Name
    const childName = generateFamilyMemberName(childCasta, childGender, 'child', surname, rng, false);

    // Occupation (only if adult age)
    let occupation = null;
    if (childAge >= 15 && isAlive) {
      occupation = generateFamilyOccupation(npc.occupation, childCasta, childGender, rng);
    } else if (childAge >= 8 && childAge < 15 && isAlive) {
      occupation = 'Child (learning trade)';
    } else if (isAlive) {
      occupation = 'Child';
    }

    children.push({
      name: childName,
      relation: 'child',
      age: childAge,
      gender: childGender,
      occupation,
      casta: childCasta,
      living: isAlive,
      yearsDeceased: isAlive ? null : rng.nextInt(0, childAge)
    });
  }

  return children.sort((a, b) => b.age - a.age); // Sort by age (oldest first)
}

/**
 * Determine child's casta from parent castas
 * @param {string} parent1Casta - First parent's casta
 * @param {string} parent2Casta - Second parent's casta
 * @param {Object} rng - Seeded RNG
 * @returns {string} Child's casta
 */
function determineChildCasta(parent1Casta, parent2Casta, rng) {
  const p1 = parent1Casta.toLowerCase();
  const p2 = parent2Casta.toLowerCase();

  // Same casta parents � same casta child
  if (p1 === p2) return parent1Casta;

  // Mixed heritage logic (simplified colonial casta system)
  const pair = [p1, p2].sort().join('_');

  const castaRules = {
    'espa�ol_indigenous': 'mestizo',
    'espa�ol_mestizo': 'castizo',
    'espa�ol_negro': 'mulato',
    'espa�ol_mulato': 'morisco',
    'indigenous_negro': 'zambo',
    'indigenous_mestizo': 'mestizo',
    'mestizo_mulato': 'pardo',
    'mulato_negro': 'pardo'
  };

  return castaRules[pair] || rng.choice([parent1Casta, parent2Casta]);
}

/**
 * Generate complete family for NPC
 * @param {Object} npc - NPC entity
 * @param {Object} rng - Seeded RNG
 * @returns {Object} Complete family structure
 */
export function generateFamily(npc, rng) {
  const parents = generateParents(npc, rng);
  const siblings = generateSiblings(npc, parents, rng);
  const spouse = generateSpouse(npc, rng);
  const children = spouse ? generateChildren(npc, spouse, rng) : [];

  return {
    parents,
    siblings,
    spouse,
    children,
    summary: {
      totalMembers: parents.length + siblings.length + (spouse ? 1 : 0) + children.length,
      livingMembers: [
        ...parents.filter(p => p.living),
        ...siblings.filter(s => s.living),
        ...(spouse && spouse.living ? [spouse] : []),
        ...children.filter(c => c.living)
      ].length,
      deceasedMembers: [
        ...parents.filter(p => !p.living),
        ...siblings.filter(s => !s.living),
        ...(spouse && !spouse.living ? [spouse] : []),
        ...children.filter(c => !c.living)
      ].length
    }
  };
}

export default {
  generateParents,
  generateSiblings,
  generateSpouse,
  generateChildren,
  generateFamily
};
