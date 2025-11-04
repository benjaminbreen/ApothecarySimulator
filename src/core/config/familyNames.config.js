/**
 * Family Name Pools
 *
 * Historically accurate name data for generating NPC family members.
 * Organized by casta, gender, and region.
 *
 * Based on baptismal records, census data, and historical documents
 * from colonial New Spain (1600-1680).
 *
 * @module familyNames
 */

export const FAMILY_NAMES = {
  // Spanish/Criollo names
  criollo: {
    male: {
      first: [
        "Juan", "Diego", "Antonio", "Francisco", "José", "Pedro",
        "Carlos", "Miguel", "Fernando", "Luis", "Alonso", "Rodrigo",
        "Sebastián", "Tomás", "Andrés", "Martín", "Manuel", "Cristóbal",
        "Gabriel", "Rafael", "Domingo", "Ignacio", "Felipe", "Lorenzo",
        "Bernardo", "Mateo", "Nicolás", "Agustín", "Vicente", "Baltasar"
      ],
      titles: ["Don"] // For elite
    },
    female: {
      first: [
        "María", "Isabel", "Catalina", "Ana", "Juana", "Teresa",
        "Francisca", "Beatriz", "Inés", "Margarita", "Leonor", "Antonia",
        "Clara", "Luisa", "Elena", "Rosa", "Magdalena", "Josefa",
        "Paula", "Bárbara", "Lucía", "Petronila", "Úrsula", "Gertrudis",
        "Manuela", "Sebastiana", "Micaela", "Ángela", "Victoria"
      ],
      titles: ["Doña"] // For elite
    },
    surnames: [
      // Elite surnames
      "de León", "Cortés", "Valdés", "Mendoza", "Guzmán", "de la Cruz",
      "Velázquez", "Ramírez", "González", "Hernández", "López", "García",
      "Rodríguez", "Martínez", "Pérez", "Sánchez", "Ruiz", "Torres",
      "Díaz", "Morales", "Jiménez", "Álvarez", "Romero", "Navarro",
      "de Alvarado", "de Cervantes", "de Castilla", "de Toledo",
      "de Sandoval", "de Saavedra", "de Zamora", "de Córdoba"
    ]
  },

  // Indigenous names (Hispanized)
  indigenous: {
    male: {
      first: [
        // Christian names adopted post-conquest
        "Juan", "Diego", "Antonio", "Francisco", "Pedro", "Miguel",
        "Pablo", "Mateo", "Lucas", "Marcos", "Tomás", "Andrés",
        // Common Hispanized Nahuatl combinations
        "Juan Mateo", "Diego Hernández", "Antonio Tlacaelel",
        "Francisco Cuauhtémoc", "Pedro Nezahualcóyotl"
      ],
      nahuatlComponents: [
        "Tlacaelel", "Cuauhtémoc", "Moctezuma", "Ixtlilxóchitl",
        "Nezahualcóyotl", "Tlahuicole", "Xicohténcatl", "Cacama"
      ]
    },
    female: {
      first: [
        // Christian names
        "María", "Isabel", "Catalina", "Ana", "Juana", "Francisca",
        "Magdalena", "Lucía", "Bárbara", "Petrona", "Agustina",
        // Hispanized Nahuatl combinations
        "María Xóchitl", "Isabel Citlali", "Ana Itzel", "Juana Nenetl"
      ],
      nahuatlComponents: [
        "Xóchitl", "Citlali", "Itzel", "Nenetl", "Quetzali", "Yaretzi",
        "Tonantzin", "Izel", "Zyanya", "Tlalli"
      ]
    },
    surnames: [
      // Patronymics and place names
      "de San Juan", "de Santiago", "de Santa María", "de la Cruz",
      "Hernández", "López", "Pérez", "García", "Rodríguez", "Martínez",
      // Nahuatl surnames (Hispanized)
      "Tlacaélel", "Moctezuma", "Cuauhtémoc", "Nezahualcóyotl",
      "Xicohténcatl", "Chimalpahin", "Tezozómoc"
    ]
  },

  // Mestizo names (mix of Spanish and Indigenous)
  mestizo: {
    male: {
      first: [
        "Juan", "Diego", "Antonio", "Miguel", "Francisco", "Pedro",
        "José", "Pablo", "Mateo", "Andrés", "Tomás", "Felipe",
        "Manuel", "Rafael", "Gabriel", "Domingo", "Vicente", "Lorenzo"
      ]
    },
    female: {
      first: [
        "María", "Isabel", "Catalina", "Ana", "Juana", "Teresa",
        "Francisca", "Magdalena", "Lucía", "Rosa", "Antonia", "Josefa",
        "Clara", "Manuela", "Bárbara", "Gertrudis", "Paula"
      ]
    },
    surnames: [
      "Hernández", "López", "Pérez", "García", "Rodríguez", "Martínez",
      "González", "Sánchez", "Ramírez", "Torres", "Díaz", "Morales",
      "Jiménez", "Ruiz", "Álvarez", "Romero", "de la Cruz", "Castillo"
    ]
  },

  // Afrodescendant names (Mulato, Pardo, Negro)
  afrodescendant: {
    male: {
      first: [
        "Juan", "Francisco", "Antonio", "Miguel", "José", "Pedro",
        "Diego", "Manuel", "Domingo", "Sebastián", "Mateo", "Pablo",
        "Andrés", "Lorenzo", "Nicolás", "Cristóbal", "Tomás"
      ]
    },
    female: {
      first: [
        "María", "Isabel", "Catalina", "Juana", "Ana", "Francisca",
        "Magdalena", "Lucía", "Teresa", "Rosa", "Antonia", "Clara",
        "Bárbara", "Josefa", "Paula", "Petrona", "Manuela"
      ]
    },
    surnames: [
      // Often patronymics or place names
      "de la Cruz", "Hernández", "García", "López", "Pérez", "Martínez",
      "Rodríguez", "González", "Sánchez", "Torres", "Morales", "Díaz",
      // Sometimes lack surnames or use descriptor
      "sin apellido", "de color", "libre" // (free)
    ]
  }
};

/**
 * Generate family member name based on casta, gender, and role
 * @param {string} casta - Casta category
 * @param {string} gender - 'male' or 'female'
 * @param {string} role - Family role ('parent', 'sibling', 'spouse', 'child')
 * @param {string} surname - Family surname to inherit
 * @param {Object} rng - Seeded RNG
 * @param {boolean} isElite - Whether family is elite (for titles)
 * @returns {string} Generated name
 */
export function generateFamilyMemberName(casta, gender, role, surname, rng, isElite = false) {
  const castaNormalized = casta ? casta.toLowerCase().trim() : 'mestizo';

  // Map castas to name pools
  let namePool;
  if (castaNormalized === 'criollo' || castaNormalized === 'peninsular' || castaNormalized === 'español' || castaNormalized === 'castizo') {
    namePool = FAMILY_NAMES.criollo;
  } else if (castaNormalized === 'indigenous' || castaNormalized === 'indio') {
    namePool = FAMILY_NAMES.indigenous;
  } else if (castaNormalized === 'mestizo') {
    namePool = FAMILY_NAMES.mestizo;
  } else if (castaNormalized === 'mulato' || castaNormalized === 'pardo' || castaNormalized === 'negro' || castaNormalized === 'zambo') {
    namePool = FAMILY_NAMES.afrodescendant;
  } else {
    namePool = FAMILY_NAMES.mestizo; // Default
  }

  const genderPool = namePool[gender] || namePool.male;
  const firstName = rng.choice(genderPool.first);

  // Add title for elite Spanish families
  let fullName = firstName;
  if (isElite && (castaNormalized === 'criollo' || castaNormalized === 'peninsular' || castaNormalized === 'español')) {
    const title = gender === 'male' ? 'Don' : 'Doña';
    // Parents and older siblings get titles
    if (role === 'parent' || (role === 'sibling' && rng.chance(0.5))) {
      fullName = `${title} ${firstName}`;
    }
  }

  // Add surname (except for children who inherit it)
  if (role !== 'child') {
    if (surname) {
      fullName += ` ${surname}`;
    } else {
      // Generate surname
      const surnamePool = namePool.surnames || FAMILY_NAMES.mestizo.surnames;
      const generatedSurname = rng.choice(surnamePool);
      fullName += ` ${generatedSurname}`;
    }
  } else {
    // Children inherit parent's surname
    if (surname) {
      fullName += ` ${surname}`;
    }
  }

  return fullName;
}

/**
 * Get surname from full name
 * @param {string} fullName - Full name string
 * @returns {string} Extracted surname
 */
export function extractSurname(fullName) {
  if (!fullName) return '';

  // Remove titles
  const withoutTitle = fullName.replace(/^(Don|Doña|Fray|Sor|Sister|Father|Padre)\s+/i, '');

  // Split and get last part
  const parts = withoutTitle.trim().split(' ');
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }

  return '';
}

/**
 * Generate occupation for family member based on parent occupation
 * @param {string} parentOccupation - Parent's occupation
 * @param {string} casta - Casta category
 * @param {string} gender - 'male' or 'female'
 * @param {Object} rng - Seeded RNG
 * @returns {string} Family member occupation
 */
export function generateFamilyOccupation(parentOccupation, casta, gender, rng) {
  const parentOccLower = parentOccupation ? parentOccupation.toLowerCase() : '';

  // Elite occupations tend to inherit
  if (parentOccLower.includes('landowner') || parentOccLower.includes('noble')) {
    if (gender === 'male') {
      return rng.choice(['Landowner', 'Merchant', 'Official', 'Gentleman']);
    } else {
      return rng.choice(['Noblewoman', 'Landowner', 'Merchant widow']);
    }
  }

  // Clergy families
  if (parentOccLower.includes('priest') || parentOccLower.includes('clergy')) {
    if (gender === 'male') {
      return rng.choice(['Priest', 'Church official', 'Friar', 'Merchant']);
    } else {
      return rng.choice(['Nun', 'Merchant', 'Housewife']);
    }
  }

  // Artisan occupations inherit
  if (parentOccLower.includes('silversmith') || parentOccLower.includes('artisan')) {
    if (gender === 'male') {
      return rng.choice(['Silversmith', 'Goldsmith', 'Artisan', 'Merchant']);
    } else {
      return rng.choice(['Seamstress', 'Weaver', 'Merchant', 'Housewife']);
    }
  }

  // Merchant families
  if (parentOccLower.includes('merchant') || parentOccLower.includes('trader')) {
    if (gender === 'male') {
      return rng.choice(['Merchant', 'Trader', 'Shop owner', 'Official']);
    } else {
      return rng.choice(['Merchant', 'Trader', 'Shop owner', 'Housewife']);
    }
  }

  // Default by casta and gender
  if (gender === 'female') {
    return rng.choice(['Housewife', 'Seamstress', 'Weaver', 'Market vendor', 'Midwife']);
  } else {
    const castaLower = casta ? casta.toLowerCase() : '';
    if (castaLower === 'criollo' || castaLower === 'español') {
      return rng.choice(['Merchant', 'Artisan', 'Clerk', 'Official']);
    } else if (castaLower === 'indigenous' || castaLower === 'indio') {
      return rng.choice(['Laborer', 'Farmer', 'Artisan', 'Market vendor']);
    } else {
      return rng.choice(['Laborer', 'Artisan', 'Muleteer', 'Market vendor']);
    }
  }
}

export default FAMILY_NAMES;
