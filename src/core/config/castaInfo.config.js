/**
 * Casta System Information Cards
 *
 * Historically accurate descriptions of colonial New Spain's casta system.
 * Each entry provides social context, legal status, and historical role.
 *
 * @module castaInfo
 */

export const CASTA_INFO = {
  peninsular: {
    title: "Peninsular",
    description: "Spanish-born individuals who emigrated to New Spain, forming the apex of colonial society. They monopolized high positions in church, government, and military, often viewing criollos with suspicion despite shared ancestry. Their 'purity of blood' (limpieza de sangre) granted exclusive access to elite institutions and offices.",
    color: "#9333ea", // Purple
    icon: "👑"
  },

  criollo: {
    title: "Criollo",
    description: "Individuals of Spanish descent born in the Americas, legally Spanish but often excluded from the highest offices reserved for peninsulares. They formed the colonial elite as landowners, merchants, and clergy, yet harbored resentment at their subordinate status despite wealth and education. Many, like Maria de Lima, navigated complex identities including converso heritage.",
    color: "#3b82f6", // Blue
    icon: "🏛️"
  },

  mestizo: {
    title: "Mestizo",
    description: "Children of Spanish and Indigenous unions, occupying an ambiguous middle position in colonial society. While some achieved prosperity as artisans, minor officials, or merchants, most faced legal restrictions and social stigma. By 1680, mestizos comprised a significant urban population in Mexico City, often bilingual and culturally hybrid.",
    color: "#f59e0b", // Amber
    icon: "🤝"
  },

  indigenous: {
    title: "Indigenous",
    description: "Native peoples of Mexico (referred to as 'indios' in colonial documents) who retained separate legal status under Spanish rule. Despite devastating population loss from disease and exploitation, Indigenous communities maintained distinct identities, languages, and governance through the 'república de indios' system. Many worked as laborers, artisans, or in agricultural tribute obligations.",
    color: "#84cc16", // Lime
    icon: "🌾"
  },

  indio: {
    title: "Indigenous",
    description: "Native peoples of Mexico (referred to as 'indios' in colonial documents) who retained separate legal status under Spanish rule. Despite devastating population loss from disease and exploitation, Indigenous communities maintained distinct identities, languages, and governance through the 'república de indios' system. Many worked as laborers, artisans, or in agricultural tribute obligations.",
    color: "#84cc16", // Lime
    icon: "🌾"
  },

  mulato: {
    title: "Mulato",
    description: "Individuals of mixed African and Spanish ancestry, often associated with urban trades and domestic service. Colonial authorities viewed mulatos with particular suspicion, subjecting them to special taxes and legal restrictions. Many worked as artisans, muleteers, or in retail trades, navigating a society that both depended on and feared their presence.",
    color: "#ef4444", // Red
    icon: "🔨"
  },

  pardo: {
    title: "Pardo",
    description: "A term for individuals of mixed African ancestry, often used interchangeably with mulato but sometimes denoting lighter skin or higher social standing. Pardos faced similar legal restrictions as mulatos, including special tribute obligations and exclusion from many guilds and religious orders. Some achieved economic success despite these barriers.",
    color: "#dc2626", // Dark red
    icon: "⚒️"
  },

  negro: {
    title: "Negro/Afrodescendant",
    description: "Individuals of African descent, whether enslaved or free (libres). While slavery was legal in New Spain, free Afrodescendants could own property and businesses, though they faced severe social and legal discrimination. By 1680, most Afrodescendants in Mexico City were creoles (born in the Americas) rather than African-born bozales.",
    color: "#7c2d12", // Brown
    icon: "⛓️"
  },

  zambo: {
    title: "Zambo",
    description: "Children of African and Indigenous unions, occupying one of the lowest positions in colonial social hierarchy. Colonial authorities particularly feared zambos as potential rebels, subjecting them to harsh surveillance and legal restrictions. Many worked as rural laborers or in urban informal economies, often living in marginal neighborhoods.",
    color: "#92400e", // Dark brown
    icon: "🛖"
  },

  castizo: {
    title: "Castizo",
    description: "Offspring of Spanish and mestizo unions, considered 'closer' to Spanish status in the colonial caste system. Castizos faced fewer legal restrictions than mestizos and could sometimes 'pass' as criollo with sufficient wealth or influence. The system theoretically promised Spanish status after multiple generations of 'improvement' (mejoramiento).",
    color: "#6366f1", // Indigo
    icon: "📜"
  },

  morisco: {
    title: "Morisco",
    description: "Children of Spanish and mulato unions, theoretically one step toward 'whitening' in the colonial caste logic. The term also carried connotations from Spain's history with expelled Muslims (moriscos), adding layers of religious suspicion. They faced similar restrictions as mulatos but with slightly higher social standing.",
    color: "#ec4899", // Pink
    icon: "🏺"
  },

  chino: {
    title: "Chino",
    description: "In New Spain, 'chino' often referred to individuals with Indigenous and African ancestry, despite the term's Asian origins. Some were descendants of Filipino migrants who arrived via the Manila Galleon trade. They occupied an ambiguous position in the caste system, facing discrimination but sometimes avoiding the specific restrictions placed on mulatos.",
    color: "#14b8a6", // Teal
    icon: "🌏"
  },

  lobo: {
    title: "Lobo",
    description: "Offspring of Indigenous and African unions, similar to zambos. The proliferation of such terms reflected colonial anxiety about racial mixing and attempts to maintain rigid social hierarchies. In practice, many individuals defied neat categorization, and enforcement of caste boundaries varied by region and circumstance.",
    color: "#64748b", // Slate
    icon: "🐺"
  },

  "español": {
    title: "Español",
    description: "A general term for individuals of Spanish ancestry, whether peninsular or criollo. This category enjoyed the highest legal and social privileges, including exemption from tribute, access to elite institutions, and the presumption of 'purity of blood.' However, the distinction between old Christian and converso heritage remained significant within this group.",
    color: "#8b5cf6", // Violet
    icon: "⚜️"
  }
};

/**
 * Get casta info by normalized name
 * @param {string} castaName - Casta name (case-insensitive)
 * @returns {Object|null} Casta info object or null if not found
 */
export function getCastaInfo(castaName) {
  if (!castaName) return null;
  const normalized = castaName.toLowerCase().trim();
  return CASTA_INFO[normalized] || null;
}

/**
 * Get all casta categories
 * @returns {Array<string>} List of casta keys
 */
export function getAllCastas() {
  return Object.keys(CASTA_INFO);
}

export default CASTA_INFO;
