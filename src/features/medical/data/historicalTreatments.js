// Historical medical treatments database for procedural generation
// 1680s Mexico City medical practices

export const PRACTITIONER_TYPES = {
  physician: {
    title: 'Dr.',
    honorific: 'Doctor',
    theory: 'humoral',
    language: 'formal',
    education: 'University-trained',
    reliability: 0.6
  },
  apothecary: {
    title: '',
    honorific: 'Master',
    theory: 'humoral-practical',
    language: 'practical',
    education: 'Apprenticeship',
    reliability: 0.7
  },
  curandera: {
    title: '',
    honorific: 'Doña',
    theory: 'indigenous-syncretic',
    language: 'mystical',
    education: 'Traditional knowledge',
    reliability: 0.5
  },
  barber_surgeon: {
    title: '',
    honorific: 'Master',
    theory: 'practical',
    language: 'simple',
    education: 'Guild training',
    reliability: 0.4
  }
};

// Treatment database by symptom
export const TREATMENTS_BY_SYMPTOM = {
  headache: {
    physician: [
      {
        name: 'Bloodletting from temple',
        theory: 'Relieve pressure of hot humors in the head',
        method: 'Incision at temple vein',
        outcome_positive: 'Temporary relief reported',
        outcome_negative: 'No improvement, patient weakened',
        outcome_neutral: 'Mild relief, symptoms persist'
      },
      {
        name: 'Purgative of black hellebore',
        theory: 'Expel excess black bile causing melancholic headache',
        method: 'Oral administration, 2 drachms',
        outcome_positive: 'Headache diminished after purging',
        outcome_negative: 'Severe vomiting, headache worsened',
        outcome_neutral: 'Purging successful, headache unchanged'
      }
    ],
    curandera: [
      {
        name: 'Tobacco poultice on forehead',
        theory: 'Draw out evil humors through skin',
        method: 'Crushed tobacco leaves mixed with tallow',
        outcome_positive: 'Patient reported cooling sensation and relief',
        outcome_negative: 'Skin irritation, no relief',
        outcome_neutral: 'Mild improvement, brief duration'
      },
      {
        name: 'Prayer and copal incense',
        theory: 'Mal aire (bad air) causing pain',
        method: 'Ritual cleansing with copal smoke',
        outcome_positive: 'Headache resolved after ceremony',
        outcome_negative: 'No change observed',
        outcome_neutral: 'Patient calmer but pain persists'
      }
    ],
    apothecary: [
      {
        name: 'Willow bark decoction',
        theory: 'Cooling properties balance hot humors',
        method: 'Tea, 3 times daily',
        outcome_positive: 'Pain reduced within hours',
        outcome_negative: 'Stomach upset, headache continues',
        outcome_neutral: 'Slight improvement noted'
      }
    ]
  },

  fever: {
    physician: [
      {
        name: 'Bloodletting from arm',
        theory: 'Reduce excess hot, wet humors (blood)',
        method: '8-12 oz removed from median cubital vein',
        outcome_positive: 'Fever broke within 24 hours',
        outcome_negative: 'Patient weakened, fever persists',
        outcome_neutral: 'Temporary reduction, fever returns'
      },
      {
        name: 'Cooling bath with vinegar',
        theory: 'External cooling to balance internal heat',
        method: 'Tepid water with wine vinegar',
        outcome_positive: 'Fever reduced significantly',
        outcome_negative: 'Patient chilled, fever unchanged',
        outcome_neutral: 'Brief relief, fever continues'
      }
    ],
    curandera: [
      {
        name: 'Herbal tea of gordolobo and mint',
        theory: 'Cool the blood, dispel fever spirits',
        method: 'Infusion, drink throughout day',
        outcome_positive: 'Fever diminished, sweating increased',
        outcome_negative: 'No effect observed',
        outcome_neutral: 'Mild improvement, fever low-grade'
      }
    ]
  },

  joint_pain: {
    physician: [
      {
        name: 'Application of Spanish Fly blister',
        theory: 'Counter-irritation draws out painful humors',
        method: 'Cantharides plaster to affected joint',
        outcome_positive: 'Pain reduced after blistering',
        outcome_negative: 'Severe skin damage, increased pain',
        outcome_neutral: 'Blistering occurred, pain unchanged'
      }
    ],
    curandera: [
      {
        name: 'Arnica and chile poultice',
        theory: 'Heat dispels cold, damp humors in joints',
        method: 'Warm compress, applied nightly',
        outcome_positive: 'Swelling reduced, mobility improved',
        outcome_negative: 'Skin burned, no improvement',
        outcome_neutral: 'Warmth comforting, pain persists'
      }
    ],
    barber_surgeon: [
      {
        name: 'Cupping over painful joint',
        theory: 'Draw out corrupt blood and fluids',
        method: 'Hot glass cups applied',
        outcome_positive: 'Pain lessened after treatment',
        outcome_negative: 'Bruising severe, pain worse',
        outcome_neutral: 'Marks visible, pain same'
      }
    ]
  },

  skin_lesions: {
    physician: [
      {
        name: 'Mercury ointment application',
        theory: 'Mercurial cure for venereal corruption',
        method: 'Unguentum hydrargyri, topical twice daily',
        outcome_positive: 'Lesions beginning to heal',
        outcome_negative: 'Salivation, tremors, lesions spread',
        outcome_neutral: 'Treatment continuing, slow progress'
      },
      {
        name: 'Sulfur and lard salve',
        theory: 'Dry out moist, corrupt humors in skin',
        method: 'Thick application to lesions',
        outcome_positive: 'Lesions drying, less weeping',
        outcome_negative: 'Skin irritation increased',
        outcome_neutral: 'Some drying noted, new lesions appear'
      }
    ],
    curandera: [
      {
        name: 'Aloe vera and honey dressing',
        theory: 'Cool inflammation, promote healing',
        method: 'Fresh aloe pulp with honey, changed daily',
        outcome_positive: 'Lesions less inflamed, healing edges',
        outcome_negative: 'Infection worsened',
        outcome_neutral: 'Soothing but no healing observed'
      }
    ]
  },

  abdominal_pain: {
    physician: [
      {
        name: 'Purgative of senna and rhubarb',
        theory: 'Expel corrupt matter from bowels',
        method: 'Strong dose, oral administration',
        outcome_positive: 'Pain relieved after purging',
        outcome_negative: 'Severe cramping, dehydration',
        outcome_neutral: 'Purging violent, pain unchanged'
      }
    ],
    curandera: [
      {
        name: 'Chamomile and anise tea',
        theory: 'Calm stomach, expel wind',
        method: 'Warm infusion, sipped slowly',
        outcome_positive: 'Pain eased, gas passed',
        outcome_negative: 'No effect',
        outcome_neutral: 'Mild comfort, pain persists'
      }
    ],
    apothecary: [
      {
        name: 'Opium tincture',
        theory: 'Arrest pain and spasms',
        method: '10 drops in wine',
        outcome_positive: 'Pain ceased, patient resting',
        outcome_negative: 'Stupor, pain returns when wears off',
        outcome_neutral: 'Pain dulled, cause unaddressed'
      }
    ]
  },

  chest_pain: {
    physician: [
      {
        name: 'Bloodletting from arm',
        theory: 'Plethora of blood oppressing heart and lungs',
        method: '10 oz removed',
        outcome_positive: 'Breathing easier, pain reduced',
        outcome_negative: 'Patient fainted, pain worse',
        outcome_neutral: 'Some relief initially, pain returns'
      }
    ],
    curandera: [
      {
        name: 'Mustard plaster to chest',
        theory: 'Counter-irritation draws out internal pain',
        method: 'Hot mustard paste, applied until skin reddens',
        outcome_positive: 'Pain lessened after treatment',
        outcome_negative: 'Severe skin burn',
        outcome_neutral: 'Skin reddened, pain same'
      }
    ]
  }
};

// Sample practitioner names for procedural generation
export const PRACTITIONER_NAMES = {
  physician: [
    'Dr. Francisco Ramírez',
    'Dr. Antonio de Herrera',
    'Dr. Juan Méndez',
    'Dr. Pedro Gutiérrez',
    'Dr. Miguel Santos'
  ],
  curandera: [
    'Doña Ana',
    'Ixchel (curandera)',
    'Doña Rosa Hernández',
    'Tlalli (healer)',
    'María Xochitl'
  ],
  barber_surgeon: [
    'Master García (barber)',
    'Tomás the Barber',
    'Juan de los Santos',
    'Diego (surgeon)',
    'Master Rodrigo'
  ],
  apothecary: [
    'Master Vicente (apothecary)',
    'Carlos de la Cruz',
    'Master Sebastián',
    'Antonio (apothecary)',
    'Master Eduardo'
  ]
};

// Generate dates in the past relative to current game date
export function generatePastDate(currentDate, daysAgo) {
  // Simplified for now - would parse actual game date
  const dates = [
    'August 20, 1680',
    'August 18, 1680',
    'August 15, 1680',
    'August 12, 1680',
    'August 10, 1680',
    'August 8, 1680',
    'August 5, 1680'
  ];
  return dates[Math.min(daysAgo, dates.length - 1)];
}
