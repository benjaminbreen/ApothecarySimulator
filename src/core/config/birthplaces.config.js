/**
 * Birthplace Data Configuration
 *
 * Historical birthplace data organized by casta, class, and region.
 * Based on demographic patterns in colonial New Spain (1600-1680).
 *
 * @module birthplaces
 */

export const BIRTHPLACES = {
  // Criollo birthplaces
  criollo: {
    elite: {
      cities: [
        { name: "Mexico City", weight: 0.4, neighborhoods: ["Traza central", "Near Cathedral", "Plaza Mayor district", "Near Alameda"] },
        { name: "Puebla de los Ángeles", weight: 0.25, neighborhoods: ["Cathedral district", "Barrio de Analco"] },
        { name: "Guadalajara", weight: 0.1, neighborhoods: ["City center", "Near cathedral"] },
        { name: "Querétaro", weight: 0.08, neighborhoods: ["Villa district"] },
        { name: "Valladolid (Morelia)", weight: 0.07, neighborhoods: ["Cathedral district"] },
        { name: "Oaxaca de Juárez", weight: 0.05, neighborhoods: ["City center"] },
        { name: "Guanajuato", weight: 0.05, neighborhoods: ["Mining district"] }
      ]
    },
    middling: {
      cities: [
        { name: "Mexico City", weight: 0.3, neighborhoods: ["San Juan", "Santa María", "Santiago", "Outskirts of traza"] },
        { name: "Puebla", weight: 0.2, neighborhoods: ["Barrio del Alto", "San Francisco"] },
        { name: "Tlaxcala", weight: 0.15, neighborhoods: ["Spanish quarter"] },
        { name: "Cholula", weight: 0.1, neighborhoods: ["Spanish settlement"] },
        { name: "Cuernavaca", weight: 0.1, neighborhoods: ["Town center"] },
        { name: "Taxco", weight: 0.08, neighborhoods: ["Near silver mines"] },
        { name: "Toluca", weight: 0.07, neighborhoods: ["Market district"] }
      ]
    },
    common: {
      cities: [
        { name: "Mexico City", weight: 0.25, neighborhoods: ["San Juan Tenochtitlan", "Santiago Tlatelolco", "Santa Cruz"] },
        { name: "Small town near Puebla", weight: 0.2, neighborhoods: [] },
        { name: "Cholula", weight: 0.15, neighborhoods: ["Mixed barrio"] },
        { name: "Tlaxcala", weight: 0.15, neighborhoods: ["Mestizo quarter"] },
        { name: "Rural hacienda near Mexico City", weight: 0.12, neighborhoods: [] },
        { name: "Small mining settlement", weight: 0.08, neighborhoods: [] },
        { name: "Textile obraje town", weight: 0.05, neighborhoods: [] }
      ]
    }
  },

  // Peninsular birthplaces (from Spain)
  peninsular: {
    elite: {
      cities: [
        { name: "Seville", weight: 0.3, region: "Andalusia" },
        { name: "Madrid", weight: 0.15, region: "Castile" },
        { name: "Cádiz", weight: 0.12, region: "Andalusia" },
        { name: "Barcelona", weight: 0.1, region: "Catalonia" },
        { name: "Salamanca", weight: 0.08, region: "León" },
        { name: "Toledo", weight: 0.07, region: "Castile" },
        { name: "Valladolid", weight: 0.06, region: "Castile" },
        { name: "Granada", weight: 0.06, region: "Andalusia" },
        { name: "Burgos", weight: 0.03, region: "Castile" },
        { name: "Valencia", weight: 0.03, region: "Valencia" }
      ],
      arrivalYears: [5, 8, 10, 12, 15, 18, 20, 25] // Years ago they arrived
    },
    middling: {
      cities: [
        { name: "Seville", weight: 0.25, region: "Andalusia" },
        { name: "Córdoba", weight: 0.15, region: "Andalusia" },
        { name: "Extremadura region", weight: 0.15, region: "Extremadura" },
        { name: "Galicia", weight: 0.1, region: "Galicia" },
        { name: "León", weight: 0.1, region: "León" },
        { name: "Asturias", weight: 0.08, region: "Asturias" },
        { name: "Basque Country", weight: 0.07, region: "Basque" },
        { name: "Canary Islands", weight: 0.1, region: "Canaries" }
      ],
      arrivalYears: [3, 5, 7, 10, 12, 15, 18, 20]
    }
  },

  // Indigenous birthplaces
  indigenous: {
    common: {
      altepetl: [
        { name: "Tenochtitlan", weight: 0.25, barrios: ["San Juan", "Santiago", "San Pablo", "Santa María la Redonda"] },
        { name: "Tlatelolco", weight: 0.15, barrios: ["Santiago", "San Juan Moyotlan"] },
        { name: "Xochimilco", weight: 0.12, barrios: ["San Bernardino", "Santa Cruz"] },
        { name: "Coyoacán", weight: 0.1, barrios: ["San Juan Bautista", "Santa Catarina"] },
        { name: "Texcoco", weight: 0.08, barrios: ["Cathedral barrio"] },
        { name: "Chalco", weight: 0.08, barrios: ["San Juan", "Santiago"] },
        { name: "Tlaxcala", weight: 0.07, barrios: ["Ocotelulco", "Quiahuiztlan", "Tepeticpac"] },
        { name: "Cholula", weight: 0.07, barrios: ["San Pedro", "San Andrés"] },
        { name: "Azcapotzalco", weight: 0.05, barrios: ["San Sebastián"] },
        { name: "Tacuba", weight: 0.03, barrios: ["Santa María"] }
      ]
    }
  },

  // Mestizo birthplaces
  mestizo: {
    middling: {
      cities: [
        { name: "Outskirts of Mexico City", weight: 0.3, neighborhoods: ["Mixed barrio", "Near Indigenous parcialidades"] },
        { name: "Puebla", weight: 0.2, neighborhoods: ["Mestizo quarter", "Barrio del Alto"] },
        { name: "Cholula", weight: 0.12, neighborhoods: ["Mixed settlement"] },
        { name: "Tlaxcala", weight: 0.1, neighborhoods: ["Spanish-Indigenous border"] },
        { name: "Mining town", weight: 0.1, neighborhoods: ["Zacatecas", "Guanajuato", "Taxco"] },
        { name: "Textile obraje settlement", weight: 0.08, neighborhoods: [] },
        { name: "Rural hacienda", weight: 0.1, neighborhoods: [] }
      ]
    },
    common: {
      cities: [
        { name: "Mixed neighborhood, Mexico City", weight: 0.25, neighborhoods: ["San Juan", "Santiago outskirts"] },
        { name: "Small town near Puebla", weight: 0.2, neighborhoods: [] },
        { name: "Rural hacienda", weight: 0.18, neighborhoods: ["Hacienda worker settlement"] },
        { name: "Mining camp", weight: 0.15, neighborhoods: ["Guanajuato", "Zacatecas", "Real del Monte"] },
        { name: "Cholula", weight: 0.1, neighborhoods: ["Mixed barrio"] },
        { name: "Textile workshop town", weight: 0.07, neighborhoods: [] },
        { name: "Small village", weight: 0.05, neighborhoods: [] }
      ]
    }
  },

  // Mulato/Pardo birthplaces
  mulato: {
    common: {
      cities: [
        { name: "Mexico City", weight: 0.35, neighborhoods: ["San Juan", "Santiago", "Mixed barrios", "Near slaughterhouses"] },
        { name: "Veracruz", weight: 0.2, neighborhoods: ["Port district", "Near docks"] },
        { name: "Puebla", weight: 0.15, neighborhoods: ["Afromestizo quarter"] },
        { name: "Mining town", weight: 0.1, neighborhoods: ["Zacatecas", "Guanajuato"] },
        { name: "Coastal settlement", weight: 0.08, neighborhoods: ["Pacific coast", "Gulf coast"] },
        { name: "Hacienda", weight: 0.07, neighborhoods: ["Sugar estate", "Livestock hacienda"] },
        { name: "Oaxaca", weight: 0.05, neighborhoods: ["Port area", "Coastal region"] }
      ]
    }
  },

  pardo: {
    common: {
      cities: [
        { name: "Mexico City", weight: 0.3, neighborhoods: ["San Juan", "Mixed barrios"] },
        { name: "Puebla", weight: 0.2, neighborhoods: ["Artisan quarter"] },
        { name: "Veracruz", weight: 0.15, neighborhoods: ["Port district"] },
        { name: "Guadalajara", weight: 0.1, neighborhoods: ["Mixed neighborhood"] },
        { name: "Oaxaca", weight: 0.08, neighborhoods: ["Urban settlement"] },
        { name: "Mining district", weight: 0.1, neighborhoods: [] },
        { name: "Rural hacienda", weight: 0.07, neighborhoods: [] }
      ]
    }
  },

  // Negro/Afrodescendant birthplaces
  negro: {
    common: {
      cities: [
        { name: "Mexico City", weight: 0.3, neighborhoods: ["San Juan", "Santiago", "Near markets"] },
        { name: "Veracruz", weight: 0.25, neighborhoods: ["Port district", "Dockside"] },
        { name: "Sugar hacienda, Veracruz region", weight: 0.15, neighborhoods: [] },
        { name: "Puebla", weight: 0.1, neighborhoods: ["Afrodescendant quarter"] },
        { name: "Coastal plantation", weight: 0.1, neighborhoods: [] },
        { name: "Oaxaca coastal region", weight: 0.05, neighborhoods: [] },
        { name: "Mining settlement", weight: 0.05, neighborhoods: ["Zacatecas", "Guanajuato"] }
      ]
    },
    // For African-born (bozales) - rare by 1680
    africanBorn: {
      regions: [
        { name: "West Africa (Angola, Congo)", weight: 0.4 },
        { name: "West Africa (Senegambia)", weight: 0.25 },
        { name: "West Africa (Gold Coast)", weight: 0.2 },
        { name: "Central Africa", weight: 0.15 }
      ]
    }
  },

  // Zambo birthplaces
  zambo: {
    common: {
      cities: [
        { name: "Rural settlement", weight: 0.3, neighborhoods: ["Near Indigenous villages"] },
        { name: "Coastal area", weight: 0.25, neighborhoods: ["Pacific coast", "Gulf coast"] },
        { name: "Mining district", weight: 0.15, neighborhoods: ["Fringe settlements"] },
        { name: "Hacienda", weight: 0.12, neighborhoods: ["Worker quarters"] },
        { name: "Marginal neighborhood, Mexico City", weight: 0.1, neighborhoods: ["City outskirts"] },
        { name: "Veracruz region", weight: 0.05, neighborhoods: [] },
        { name: "Oaxaca region", weight: 0.03, neighborhoods: [] }
      ]
    }
  },

  // Castizo birthplaces (similar to criollo but slightly lower status)
  castizo: {
    middling: {
      cities: [
        { name: "Mexico City", weight: 0.3, neighborhoods: ["Mixed Spanish neighborhoods"] },
        { name: "Puebla", weight: 0.2, neighborhoods: ["Spanish quarter"] },
        { name: "Querétaro", weight: 0.12, neighborhoods: ["Town center"] },
        { name: "Guadalajara", weight: 0.1, neighborhoods: ["Spanish district"] },
        { name: "Tlaxcala", weight: 0.1, neighborhoods: ["Spanish settlement"] },
        { name: "Cholula", weight: 0.08, neighborhoods: [] },
        { name: "Small Spanish town", weight: 0.1, neighborhoods: [] }
      ]
    }
  }
};

/**
 * Get birthplace for NPC based on casta and class
 * @param {string} casta - Casta category
 * @param {string} socialClass - Social class (elite, middling, common)
 * @param {Object} rng - Seeded RNG instance
 * @returns {Object} Birthplace data { city, neighborhood, region }
 */
export function getBirthplace(casta, socialClass, rng) {
  const castaNormalized = casta ? casta.toLowerCase().trim() : 'mestizo';
  const classNormalized = socialClass ? socialClass.toLowerCase() : 'common';

  // Get birthplace data for casta
  const castaData = BIRTHPLACES[castaNormalized] || BIRTHPLACES.mestizo;
  const classData = castaData[classNormalized] || castaData.common || castaData.middling;

  if (!classData) {
    console.warn(`[Birthplaces] No data for ${castaNormalized}/${classNormalized}, using default`);
    return { city: "Mexico City", neighborhood: "San Juan", region: null };
  }

  // Special handling for peninsulares
  if (castaNormalized === 'peninsular' || castaNormalized === 'español') {
    return getPeninsularBirthplace(classData, rng);
  }

  // Special handling for Indigenous
  if (castaNormalized === 'indigenous' || castaNormalized === 'indio') {
    return getIndigenousBirthplace(classData, rng);
  }

  // Standard birthplace selection
  const cities = classData.cities || classData.altepetl;
  if (!cities || cities.length === 0) {
    return { city: "Mexico City", neighborhood: "Unknown", region: null };
  }

  // Weighted random selection
  const totalWeight = cities.reduce((sum, city) => sum + city.weight, 0);
  let random = rng.nextFloat() * totalWeight;

  for (const cityData of cities) {
    random -= cityData.weight;
    if (random <= 0) {
      const neighborhood = cityData.neighborhoods && cityData.neighborhoods.length > 0
        ? rng.choice(cityData.neighborhoods)
        : null;

      return {
        city: cityData.name,
        neighborhood: neighborhood,
        region: cityData.region || null,
        altepetl: cityData.altepetl || null
      };
    }
  }

  // Fallback
  return {
    city: cities[0].name,
    neighborhood: cities[0].neighborhoods?.[0] || null,
    region: null
  };
}

/**
 * Get peninsular birthplace (from Spain) with arrival year
 * @param {Object} classData - Class-specific peninsular data
 * @param {Object} rng - Seeded RNG
 * @returns {Object} Birthplace with arrival info
 */
function getPeninsularBirthplace(classData, rng) {
  const cities = classData.cities;
  const totalWeight = cities.reduce((sum, city) => sum + city.weight, 0);
  let random = rng.nextFloat() * totalWeight;

  for (const cityData of cities) {
    random -= cityData.weight;
    if (random <= 0) {
      const yearsInNewSpain = rng.choice(classData.arrivalYears);
      return {
        city: cityData.name,
        neighborhood: null,
        region: cityData.region,
        yearsInNewSpain: yearsInNewSpain,
        arrivedFrom: "Spain"
      };
    }
  }

  return {
    city: "Seville",
    region: "Andalusia",
    yearsInNewSpain: 10,
    arrivedFrom: "Spain"
  };
}

/**
 * Get Indigenous birthplace (altepetl and barrio)
 * @param {Object} classData - Indigenous birthplace data
 * @param {Object} rng - Seeded RNG
 * @returns {Object} Birthplace with altepetl
 */
function getIndigenousBirthplace(classData, rng) {
  const altepetl = classData.altepetl;
  const totalWeight = altepetl.reduce((sum, a) => sum + a.weight, 0);
  let random = rng.nextFloat() * totalWeight;

  for (const altepetlData of altepetl) {
    random -= altepetlData.weight;
    if (random <= 0) {
      const barrio = rng.choice(altepetlData.barrios);
      return {
        city: altepetlData.name,
        neighborhood: barrio,
        altepetl: altepetlData.name,
        region: null
      };
    }
  }

  return {
    city: "Tenochtitlan",
    neighborhood: "San Juan",
    altepetl: "Tenochtitlan",
    region: null
  };
}

export default BIRTHPLACES;
