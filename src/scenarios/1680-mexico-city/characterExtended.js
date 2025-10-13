// Extended character configuration for Maria de Lima
// This structure is scenario-agnostic and can be adapted for other time periods

export default {
  // Core identity (required for all scenarios)
  name: 'Maria de Lima',
  age: 45,
  title: 'Master Apothecary',
  level: 8,

  // Main description
  background: `Maria de Lima is a 45-year-old converso apothecary from Coimbra, Portugal. She fled to Mexico City 10 years ago after being arrested by the Portuguese Inquisition for secretly practicing Judaism. She now practices medicine illegally, without a physician's license, operating out of her small botica on the Calle de la Amargura. She lives in constant fear of being discovered by the Mexican Inquisition, which has recently intensified its persecution of conversos.`,

  // Background fields - configurable per scenario
  // These are generic labels that work across time periods
  backgroundFields: [
    { key: 'birthplace', label: 'Born', value: 'Coimbra, Portugal', icon: '🏛️' },
    { key: 'yearArrived', label: 'Arrived', value: '1670 (10 years ago)', icon: '⛵' },
    { key: 'criminalHistory', label: 'Legal Status', value: 'Fled Inquisition arrest', icon: '⚖️' },
    { key: 'socialStatus', label: 'Social Standing', value: 'Converso (Hidden)', icon: '🎭' },
    { key: 'license', label: 'Medical License', value: 'None (Illegal practice)', icon: '📜' }
  ],

  // Skills with progress (0-100) - fully customizable per scenario
  skills: [
    { name: 'Diagnosis', level: 85, description: 'Identifying diseases from symptoms' },
    { name: 'Surgery', level: 45, description: 'Performing minor surgical procedures' },
    { name: 'Alchemy', level: 90, description: 'Mixing and preparing compounds' },
    { name: 'Herbalism', level: 88, description: 'Knowledge of medicinal plants' },
    { name: 'Anatomy', level: 60, description: 'Understanding the human body' },
    { name: 'Languages', level: 75, description: 'Spanish, Portuguese, Latin, some Nahuatl' }
  ],

  // Medical knowledge (scenario-specific terminology)
  medicalKnowledge: {
    knownMethods: ['Distill', 'Decoct', 'Calcinate', 'Confection'],
    specialties: ['Humoral medicine', 'Portuguese folk remedies', 'Galenic compounds'],
    learning: [
      { method: 'Sublimation', progress: 75 },
      { method: 'Fixation', progress: 30 }
    ]
  },

  // Personal effects - narrative items that tell the character's story
  personalEffects: [
    {
      name: "Grandmother's Rosary",
      description: 'A worn rosary that conceals secret Jewish prayers written on tiny scrolls',
      icon: '📿',
      significance: 'Religious'
    },
    {
      name: 'Medical Codex',
      description: 'A hand-copied manuscript of Galenic medicine with forbidden diagrams',
      icon: '📖',
      significance: 'Professional'
    },
    {
      name: 'Shop Key',
      description: 'Iron key to Botica de la Amargura, her only refuge',
      icon: '🗝️',
      significance: 'Personal'
    },
    {
      name: 'Letter from Coimbra',
      description: 'Encrypted letter from her brother, still in Portugal',
      icon: '✉️',
      significance: 'Family'
    }
  ],

  // Relationships with NPCs (tracked in game state, but default values here)
  relationships: [
    { npcId: 'don-luis', name: 'Don Luis', type: 'Moneylender', score: -80, emoji: '😡' },
    { npcId: 'marta', name: 'Marta', type: 'Herb Woman', score: 40, emoji: '😌' },
    { npcId: 'gonzalo', name: 'Gonzalo de Loanda', type: 'Merchant', score: 15, emoji: '🙂' },
    { npcId: 'isabel', name: 'Isabel Cardoso', type: 'Widow', score: 65, emoji: '😏' }
  ],

  // Historical context sections - educational content
  // These are scenario-specific but follow a generic structure
  historicalContext: [
    {
      id: 'converso-identity',
      title: 'Converso Identity',
      icon: '🕎',
      summary: 'Portuguese Jews forced to convert to Christianity to escape persecution.',
      content: `Conversos were Iberian Jews who converted to Christianity, often under duress during the Spanish and Portuguese Inquisitions. Many continued to practice Judaism in secret (crypto-Judaism) while outwardly conforming to Catholic practices. In New Spain (Mexico), conversos faced constant surveillance and the threat of arrest, torture, and execution if discovered. Maria's status as a converso makes her particularly vulnerable to denunciation.`,
      source: 'Historical reference: Bodian, "Hebrews of the Portuguese Nation" (1997)'
    },
    {
      id: 'humoral-medicine',
      title: 'Humoral Medicine',
      icon: '⚗️',
      summary: 'The dominant medical theory of the 17th century, based on balancing four bodily humors.',
      content: `Galenic medicine, practiced throughout Europe and its colonies, was based on the theory of four humors: blood, phlegm, yellow bile, and black bile. Each humor was associated with qualities (hot, cold, wet, dry) and temperaments. Disease was thought to result from humoral imbalance, treated through diet, herbs, bloodletting, and purging. This system dominated Western medicine until the 19th century.`,
      source: 'Historical reference: Lindemann, "Medicine and Society in Early Modern Europe" (2010)'
    },
    {
      id: 'unlicensed-practice',
      title: 'Medical Practice Without License',
      icon: '⚖️',
      summary: 'In New Spain, practicing medicine without a license was illegal and could lead to arrest.',
      content: `Colonial authorities strictly regulated medical practice. Licensed physicians, trained at European universities, were at the top of the hierarchy. Apothecaries could sell medicines but were legally forbidden from diagnosing or prescribing without a physician's supervision. In practice, many apothecaries and folk healers operated in this gray zone, especially in areas where licensed physicians were scarce. Women and conversos faced additional barriers to obtaining licenses.`,
      source: 'Historical reference: Few, "Women Who Live Evil Lives" (2002)'
    },
    {
      id: 'inquisition-mexico',
      title: 'The Inquisition in New Spain',
      icon: '🔥',
      summary: 'The Mexican Inquisition actively hunted crypto-Jews and other heretics.',
      content: `Established in 1571, the Mexican Inquisition was particularly active in persecuting conversos suspected of secretly practicing Judaism. The 1640s-1680s saw intensified persecution, with major autos-da-fé (public trials and executions). Accusations could come from anyone, and trials involved torture to extract confessions. Penalties ranged from public humiliation and property confiscation to burning at the stake. The threat shaped every aspect of converso life.`,
      source: 'Historical reference: Liebman, "The Jews in New Spain" (1970)'
    }
  ],

  // Portrait data
  portraits: {
    normal: 'marianormal.jpg',
    happy: 'mariahappy.jpg',
    sad: 'mariasad.jpg',
    worried: 'mariaworried.jpg',
    determined: 'mariadetermined.jpg',
    curious: 'mariacurious.jpg'
  }
};
