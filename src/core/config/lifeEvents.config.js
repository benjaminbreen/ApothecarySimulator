/**
 * Life Events Configuration
 *
 * Templates for procedurally generating NPC life events.
 * Organized by event type, casta, class, and occupation.
 *
 * Events are historically accurate for colonial New Spain (1600-1680).
 *
 * @module lifeEvents
 */

export const LIFE_EVENTS = {
  // Birth events (always first event)
  birth: {
    all: [
      "Born in {birthplace}",
      "Born in {birthplace} to {father}, a {father_occupation}",
      "Born in {birthplace}, the {birth_order} child of {father} and {mother}"
    ]
  },

  // Career/Education events
  career: {
    elite: [
      "Studied at the Jesuit Colegio de San Pedro y San Pablo",
      "Studied theology at the Royal and Pontifical University of Mexico",
      "Completed studies at the Colegio de Santa Cruz de Tlatelolco",
      "Appointed to minor position in the colonial administration",
      "Inherited family estate and properties",
      "Purchased a hacienda in the Valley of Mexico",
      "Secured appointment to the city cabildo",
      "Received military commission as captain",
      "Appointed administrator of Indigenous tribute collection",
      "Invested in mining operations in Zacatecas"
    ],

    clergy: [
      "Entered seminary training",
      "Ordained as a priest in Mexico City",
      "Appointed to parish of {location}",
      "Rose to position of cathedral canon",
      "Joined the Franciscan order",
      "Appointed chaplain to the Viceroy",
      "Assigned to missionary work among Indigenous peoples",
      "Became confessor to noble families",
      "Appointed to the Holy Office of the Inquisition",
      "Elected prior of Dominican convent"
    ],

    artisan: [
      "Completed seven-year apprenticeship as a {occupation}",
      "Achieved rank of journeyman in the guild",
      "Opened own workshop in {location}",
      "Admitted to the guild of {occupation}s",
      "Secured contract to supply goods to the Cathedral",
      "Hired three apprentices to expand business",
      "Elected guild officer (veedor)",
      "Commissioned for major project by the Viceroy",
      "Established workshop on the Plaza Mayor",
      "Purchased tools and expanded operations"
    ],

    merchant: [
      "Established partnership with trader from Seville",
      "Secured monopoly contract for {trade_good}",
      "Opened shop on the Portal de Mercaderes",
      "Invested in Manila Galleon trade",
      "Purchased mule train for overland commerce",
      "Joined merchant guild (Consulado)",
      "Established trading post in {location}",
      "Secured loan to expand operations",
      "Lost shipment to pirates in the Caribbean",
      "Acquired warehouse for imported goods"
    ],

    common: [
      "Learned father's trade",
      "Found work as day laborer",
      "Secured position as domestic servant",
      "Apprenticed to local artisan",
      "Began working in textile obraje",
      "Hired as muleteer on trade routes",
      "Found work in silver mines",
      "Became market vendor",
      "Worked on sugar hacienda",
      "Secured position at the mint (Casa de Moneda)"
    ],

    indigenous: [
      "Elected to serve as Indigenous governor (gobernador)",
      "Appointed collector of tribute for the altepetl",
      "Learned to read and write at Franciscan school",
      "Trained as interpreter (nahuatlato) for the Audiencia",
      "Continued ancestral craft of featherwork",
      "Worked on Spanish estate as laborer",
      "Secured exemption from tribute (principal status)",
      "Appointed church fiscal in home parish",
      "Cultivated family's chinampas (floating gardens)",
      "Worked on construction of new cathedral"
    ]
  },

  // Marriage events
  marriage: {
    elite: [
      "Married {spouse}, daughter of wealthy landowner",
      "Contracted marriage to {spouse} to unite two estates",
      "Married {spouse} in ceremony at the Cathedral",
      "Wed {spouse} in arranged match by families",
      "Married {spouse}, bringing substantial dowry",
      "Betrothed to {spouse} to secure family alliance"
    ],

    common: [
      "Married {spouse} in parish church",
      "Wed {spouse} after several years of courtship",
      "Married {spouse} from neighboring barrio",
      "Married {spouse} with modest church ceremony",
      "Wed {spouse} against family's wishes",
      "Married {spouse} with blessing of priest"
    ],

    mixedCasta: [
      "Married {spouse}, causing family scandal due to casta difference",
      "Wed {spouse} despite social barriers",
      "Married {spouse} in private ceremony",
      "Union with {spouse} met with disapproval from families"
    ]
  },

  // Tragedy/hardship events
  tragedy: {
    all: [
      "Suffered severe illness, nearly dying",
      "Lost child to childhood disease",
      "Spouse died in childbirth",
      "Parent died unexpectedly",
      "Home destroyed in flooding",
      "Robbed by bandits on road to Veracruz",
      "Suffered injury that left permanent mark",
      "Child died in infancy",
      "Witnessed execution in Plaza Mayor",
      "Caught in earthquake, narrowly escaping death"
    ],

    elite: [
      "Lost costly lawsuit over property rights",
      "Investigated by the Holy Office of the Inquisition",
      "Accused of judaizing by jealous rival",
      "Massive debt crisis threatened estates",
      "Political rival blocked appointment to high office",
      "Family honor challenged in public dispute",
      "Dowry payment defaulted, marriage contract disputed",
      "Suspected of trading with Dutch pirates"
    ],

    common: [
      "Evicted from home for failure to pay rent",
      "Crop failure led to near starvation",
      "Tribute burden became unbearable",
      "Workshop burned down, losing all tools",
      "Impressed into forced labor (repartimiento)",
      "Lost employment, fell into poverty",
      "Jailed for debt for several months",
      "Accused of theft and publicly whipped"
    ],

    indigenous: [
      "Entire family fell ill during epidemic",
      "Land taken by Spanish encomendero",
      "Forced to relocate during congregation (reducción)",
      "Tribute burden doubled by corrupt official",
      "Traditional community lands seized",
      "Arrested for continuing pre-Christian practices",
      "Family altar destroyed by zealous priest"
    ],

    disease: [
      "Survived smallpox but left badly scarred",
      "Contracted typhus during epidemic",
      "Recovered from mysterious fever",
      "Lost several family members to plague",
      "Suffered from persistent cough and weakness",
      "Nearly died from infected wound"
    ]
  },

  // Success/triumph events
  success: {
    elite: [
      "Awarded encomienda of Indigenous laborers",
      "Appointed to prestigious position in colonial government",
      "Successfully defended title to extensive lands",
      "Secured royal favor and honors",
      "Daughter married into even more prominent family",
      "Won major legal case in the Audiencia",
      "Granted coat of arms by the Crown",
      "Appointed to the Council of the Indies"
    ],

    merchant: [
      "Made fortune from successful Manila Galleon voyage",
      "Secured exclusive import license",
      "Expanded business with new partners",
      "Purchased urban properties as investments",
      "Shipment arrived safely, yielding huge profits",
      "Cornered local market for luxury goods",
      "Extended credit network throughout New Spain"
    ],

    artisan: [
      "Commissioned for prestigious Cathedral project",
      "Work praised by the Archbishop",
      "Secured wealthy patron for commissions",
      "Elected head of guild",
      "Workshop flourished, hired more apprentices",
      "Created masterpiece recognized across colony"
    ],

    common: [
      "Saved enough to purchase small plot of land",
      "Secured steady employment",
      "Child became apprentice to respected artisan",
      "Granted freedom from debt servitude",
      "Successfully petitioned for reduction in tribute",
      "Opened small shop in the market"
    ]
  },

  // Family events
  family: {
    all: [
      "First child born",
      "Twins born, both survived",
      "Daughter married into respectable family",
      "Son entered religious life",
      "Became grandparent",
      "Sibling died, leaving children in care",
      "Parent died peacefully at advanced age",
      "Reconciled with estranged family member",
      "Welcomed relative who migrated from Spain",
      "Took in orphaned niece/nephew"
    ],

    elite: [
      "Arranged advantageous marriage for child",
      "Son appointed to prestigious position",
      "Daughter entered convent with substantial dowry",
      "Secured university education for son",
      "Family name honored at viceregal court"
    ]
  },

  // Religious/spiritual events
  religious: {
    all: [
      "Made pilgrimage to shrine of Our Lady of Guadalupe",
      "Became member of religious confraternity (cofradía)",
      "Donated to construction of new church",
      "Commissioned Mass for deceased family members",
      "Received Last Rites during serious illness, miraculously recovered",
      "Witnessed miraculous image weeping in church",
      "Participated in Holy Week processions",
      "Took vow to patron saint in time of crisis"
    ],

    converso: [
      "Investigated by Inquisition but cleared of charges",
      "Denounced for suspected judaizing practices",
      "Publicly affirmed Catholic faith in ceremony",
      "Family's converso heritage questioned",
      "Paid fine to Holy Office to avoid prosecution"
    ]
  },

  // Historical context events (tied to specific years)
  historical: {
    1629: {
      event: "Survived the Great Flood of Mexico City",
      affects: ['all']
    },
    1650: {
      event: "Lost family members during the plague outbreak",
      affects: ['all']
    },
    1665: {
      event: "Witnessed intensified Inquisition crackdown on conversos",
      affects: ['criollo', 'peninsular', 'español']
    },
    1666: {
      event: "Experienced aftermath of the auto-da-fé of July 1666",
      affects: ['all']
    },
    1671: {
      event: "Witnessed the corn shortage riot led by Indigenous women",
      affects: ['indigenous', 'mestizo', 'common']
    },
    1672: {
      event: "Observed construction of new viceregal palace",
      affects: ['elite']
    },
    1676: {
      event: "Experienced severe drought and crop failures",
      affects: ['common', 'indigenous']
    }
  },

  // Criminal/legal events
  legal: {
    accused: [
      "Accused of adultery and publicly shamed",
      "Brought before civil magistrate for debt",
      "Investigated for smuggling contraband",
      "Accused of assault in tavern brawl",
      "Suspected of witchcraft (brujería)",
      "Charged with blasphemy",
      "Accused of selling fraudulent goods"
    ],

    victim: [
      "Robbed by vagabonds on the highway",
      "Shop broken into and goods stolen",
      "Cheated by dishonest business partner",
      "Home burglarized during absence",
      "Assaulted in dark street at night",
      "Victim of confidence scheme"
    ]
  }
};

/**
 * Age ranges when certain events can occur
 */
export const EVENT_AGE_RANGES = {
  education: { min: 8, max: 18 },
  marriage: {
    elite: { min: 18, max: 30 },
    common: { min: 20, max: 35 },
    clergy: null // No marriage
  },
  careerStart: { min: 18, max: 30 },
  careerAdvancement: { min: 25, max: 60 },
  children: { min: 20, max: 45 },
  retirement: { min: 55, max: 75 },
  grandparent: { min: 40, max: 80 }
};

/**
 * Get appropriate life event templates for NPC
 * @param {string} eventType - Type of event
 * @param {string} casta - Casta category
 * @param {string} socialClass - Social class
 * @param {string} occupation - Occupation
 * @returns {Array} Array of event templates
 */
export function getEventTemplates(eventType, casta, socialClass, occupation) {
  const eventCategory = LIFE_EVENTS[eventType];
  if (!eventCategory) return [];

  const castaNormalized = casta ? casta.toLowerCase() : 'mestizo';
  const classNormalized = socialClass ? socialClass.toLowerCase() : 'common';
  const occupationNormalized = occupation ? occupation.toLowerCase() : '';

  let templates = [];

  // Add class-specific templates
  if (eventCategory[classNormalized]) {
    templates = templates.concat(eventCategory[classNormalized]);
  }

  // Add casta-specific templates
  if (eventCategory[castaNormalized]) {
    templates = templates.concat(eventCategory[castaNormalized]);
  }

  // Add occupation-specific templates
  if (occupationNormalized.includes('priest') || occupationNormalized.includes('clergy')) {
    if (eventCategory.clergy) {
      templates = templates.concat(eventCategory.clergy);
    }
  } else if (occupationNormalized.includes('merchant') || occupationNormalized.includes('trader')) {
    if (eventCategory.merchant) {
      templates = templates.concat(eventCategory.merchant);
    }
  } else if (occupationNormalized.includes('artisan') || occupationNormalized.includes('silversmith') || occupationNormalized.includes('goldsmith')) {
    if (eventCategory.artisan) {
      templates = templates.concat(eventCategory.artisan);
    }
  }

  // Add generic templates
  if (eventCategory.all) {
    templates = templates.concat(eventCategory.all);
  }

  return templates;
}

/**
 * Get historical event for specific year
 * @param {number} year - Year to check
 * @param {string} casta - Casta category
 * @param {string} socialClass - Social class
 * @returns {string|null} Historical event text or null
 */
export function getHistoricalEvent(year, casta, socialClass) {
  const historicalData = LIFE_EVENTS.historical[year];
  if (!historicalData) return null;

  const castaNormalized = casta ? casta.toLowerCase() : '';
  const classNormalized = socialClass ? socialClass.toLowerCase() : '';

  // Check if event affects this NPC
  const affects = historicalData.affects;
  if (affects.includes('all')) return historicalData.event;
  if (affects.includes(castaNormalized)) return historicalData.event;
  if (affects.includes(classNormalized)) return historicalData.event;

  return null;
}

export default LIFE_EVENTS;
