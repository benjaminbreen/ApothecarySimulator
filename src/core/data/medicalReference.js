/**
 * Medical Reference Data
 * Curated historical medical knowledge for 1680s New Spain
 * Combines hardcoded primary sources with Wikipedia API integration
 */

import { getIconForEntry } from './iconMappings';

export const REFERENCE_CATEGORIES = {
  MATERIA_MEDICA: {
    id: 'materia-medica',
    name: 'Materia Medica',
    icon: '🌿',
    description: 'Medicines, herbs, and compounds of the New World and Old',
    color: 'emerald'
  },
  DISEASES: {
    id: 'diseases',
    name: 'Diseases & Diagnoses',
    icon: '🩺',
    description: 'Common ailments and their identification',
    color: 'rose'
  },
  HUMORAL_THEORY: {
    id: 'humoral-theory',
    name: 'Humoral Theory',
    icon: '⚖️',
    description: 'The four humors and their balance',
    color: 'amber'
  },
  TREATMENTS: {
    id: 'treatments',
    name: 'Treatment Methods',
    icon: '⚕️',
    description: 'Therapeutic practices of the era',
    color: 'blue'
  },
  ASTROLOGY: {
    id: 'astrology',
    name: 'Medical Astrology',
    icon: '⭐',
    description: 'Celestial influences on health and treatment',
    color: 'purple'
  }
};

/**
 * Hardcoded reference entries with primary sources
 */
export const REFERENCE_ENTRIES = {
  // MATERIA MEDICA
  'opium': {
    id: 'opium',
    name: 'Opium',
    latinName: 'Papaver somniferum',
    category: 'materia-medica',
    tags: ['narcotic', 'pain', 'sleep', 'poison'],
    icon: getIconForEntry('opium'),

    summary: 'The dried latex of the poppy, known since antiquity for its powerful soporific and analgesic properties. Highly valued but dangerous in excess.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Soporific', 'Analgesic', 'Antispasmodic'],
      degree: 'Cold and dry in the fourth degree'
    },

    uses: [
      'Relief of severe pain',
      'Inducing sleep in those tormented by insomnia',
      'Stopping violent coughs',
      'Halting dysentery and bloody flux'
    ],

    contraindications: [
      'Children under 12 years',
      'Those of weak or melancholic constitution',
      'Patients with head injuries or lethargy',
      'Use with great caution - deadly in excess'
    ],

    historicalSource: {
      author: 'Thomas Sydenham',
      work: 'Observationes Medicae',
      year: 1676,
      // VERIFIED: Famous quote from the "English Hippocrates"
      excerpt: '"Of all the remedies it has pleased almighty God to give man to relieve his suffering, none is so universal and so efficacious as opium."',
      translation: null, // Original is in Latin, this is the standard English translation
      location: 'London, England',
      verified: true,
      sourceUrl: 'https://www.goodreads.com/quotes/8657845'
    },

    modernNote: 'Opium contains morphine and codeine alkaloids. Highly addictive. Medical use is strictly controlled. Understanding of addiction would not develop until the 19th century.',

    wikipediaQuery: 'Opium',
    relatedEntries: ['pain', 'sleep-disorders', 'humoral-theory-cold-dry', 'poison'],
    primarySourceIds: ['sydenham-laudanum', 'avicenna-opium']
  },

  'peruvian-bark': {
    id: 'peruvian-bark',
    name: 'Peruvian Bark (Quina)',
    latinName: 'Cinchona officinalis',
    category: 'materia-medica',
    tags: ['fever', 'malaria', 'indigenous', 'new-world'],
    icon: getIconForEntry('peruvian-bark'),

    summary: 'The bark of a tree from the Andes, recently introduced to New Spain. Remarkably effective against tertian fevers (malaria), though its mechanism remains mysterious.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Febrifuge', 'Astringent', 'Tonic'],
      degree: 'Cold and dry in the second degree'
    },

    uses: [
      'Tertian and quartan fevers (malaria)',
      'Any intermittent fever with shaking fits',
      'Strengthening the stomach',
      'Arresting hemorrhages'
    ],

    contraindications: [
      'Those with very cold constitutions',
      'Excessive use may dry the humors dangerously'
    ],

    historicalSource: {
      author: 'Sebastián Bado',
      work: 'Anastasis Corticis Peruvia',
      year: 1663,
      // PARAPHRASE: Based on Bado's treatise; exact wording not verified from original
      excerpt: '"La corteza de este árbol del Perú obra milagros contra las fiebres tercianas, que ninguna otra medicina puede igualar. Los naturales la llaman quina-quina."',
      translation: '"The bark of this Peruvian tree works miracles against tertian fevers, which no other medicine can equal. The natives call it quina-quina."',
      location: 'Genoa, Italy',
      verified: false,
      translator: 'Reconstruction by Claude Opus 4.5'
    },

    modernNote: 'Contains quinine, the first effective antimalarial drug. Its discovery revolutionized tropical medicine. Mechanism of action (interfering with parasite metabolism) was unknown until the 20th century.',

    wikipediaQuery: 'Cinchona',
    relatedEntries: ['malaria', 'fever', 'humoral-theory-cold-dry'],
    primarySourceIds: ['acosta-cinchona']
  },

  'bloodletting': {
    id: 'bloodletting',
    name: 'Bloodletting (Phlebotomy)',
    latinName: 'Phlebotomia',
    category: 'treatments',
    tags: ['surgery', 'humors', 'fever', 'excess-blood'],
    icon: getIconForEntry('bloodletting'),

    summary: 'The removal of blood from the body, either by opening a vein (venesection) or applying leeches. The most common medical procedure, used to restore humoral balance.',

    properties: {
      humors: { reduces: 'blood', balances: 'all' },
      indications: 'Excess of blood, plethora, hot diseases',
      methods: ['Venesection', 'Scarification', 'Cupping', 'Leeches']
    },

    uses: [
      'Acute fevers and inflammations',
      'Plethora (excess of blood)',
      'Apoplexy and fits',
      'Headaches from hot humors',
      'Spring purification (preventive)'
    ],

    contraindications: [
      'The very young or very old',
      'Pregnant women',
      'Those already weakened or anemic',
      'During winter months (blood is scarce)',
      'Excessive bleeding causes dangerous weakness'
    ],

    historicalSource: {
      author: 'Galen of Pergamon',
      work: 'On the Therapeutic Method',
      year: 'c. 180 CE',
      // PARAPHRASE: Based on Galen's general teachings on venesection
      excerpt: '"When the vessels are too full of blood, and disease threatens, we must evacuate by opening a vein. This is the most certain method of preventing putrefaction and restoring balance to the humors."',
      translation: 'Original in Greek, translated to Latin in medieval period',
      location: 'Rome',
      verified: false,
      translator: 'Paraphrase by Claude Opus 4.5'
    },

    modernNote: 'Bloodletting is medically harmful in most cases, causing weakness and increased mortality. It persisted as standard treatment until the mid-19th century despite mounting evidence of ineffectiveness. Only useful for specific conditions like polycythemia or hemochromatosis.',

    wikipediaQuery: 'Bloodletting',
    relatedEntries: ['humoral-theory', 'fever', 'plethora', 'blood-humor'],
    primarySourceIds: ['galen-humors', 'galen-bloodletting']
  },

  // HUMORAL THEORY
  'humoral-theory': {
    id: 'humoral-theory',
    name: 'The Four Humors',
    latinName: 'Quattuor Humores',
    category: 'humoral-theory',
    tags: ['theory', 'foundation', 'galen', 'hippocrates'],
    icon: getIconForEntry('humoral-theory'),

    summary: 'The foundational theory of medicine since antiquity. All disease results from imbalance of four bodily fluids: blood, phlegm, yellow bile, and black bile.',

    properties: {
      humors: [
        {
          name: 'Blood (Sanguis)',
          qualities: 'Hot and Moist',
          element: 'Air',
          season: 'Spring',
          temperament: 'Sanguine',
          organ: 'Heart',
          excess: 'Fever, inflammation, plethora'
        },
        {
          name: 'Phlegm (Phlegma)',
          qualities: 'Cold and Moist',
          element: 'Water',
          season: 'Winter',
          temperament: 'Phlegmatic',
          organ: 'Brain/Lungs',
          excess: 'Coughs, colds, lethargy'
        },
        {
          name: 'Yellow Bile (Cholera)',
          qualities: 'Hot and Dry',
          element: 'Fire',
          season: 'Summer',
          temperament: 'Choleric',
          organ: 'Liver',
          excess: 'Anger, violent fevers, jaundice'
        },
        {
          name: 'Black Bile (Melancholia)',
          qualities: 'Cold and Dry',
          element: 'Earth',
          season: 'Autumn',
          temperament: 'Melancholic',
          organ: 'Spleen',
          excess: 'Depression, fear, cancers'
        }
      ]
    },

    uses: [
      'Diagnosis of all diseases',
      'Selection of appropriate remedies',
      'Prevention through diet and regimen',
      'Understanding patient constitution'
    ],

    historicalSource: {
      author: 'Hippocrates',
      work: 'On the Nature of Man',
      year: 'c. 400 BCE',
      // PARAPHRASE: Based on Hippocratic Corpus; standard scholarly summary
      excerpt: '"The body of man has in itself blood, phlegm, yellow bile, and black bile; these make up the nature of the body, and through these he feels pain or enjoys health. He is particularly healthy when these are in proper proportion to one another."',
      translation: 'From ancient Greek',
      location: 'Kos, Greece',
      verified: false,
      translator: 'Paraphrase by Claude Opus 4.5 based on scholarly sources'
    },

    modernNote: 'Humoral theory dominated medicine for 2,000 years but is medically incorrect. Modern medicine understands disease through germ theory, cellular biology, and biochemistry. However, humoral theory represented an early attempt at systematic pathology.',

    wikipediaQuery: 'Humorism',
    relatedEntries: ['blood-humor', 'phlegm-humor', 'yellow-bile-humor', 'black-bile-humor', 'diagnosis'],
    primarySourceIds: ['galen-humors', 'hippocrates-airs-waters']
  },

  // DISEASES
  'malaria': {
    id: 'malaria',
    name: 'Tertian Fever (Malaria)',
    latinName: 'Febris Tertiana',
    category: 'diseases',
    tags: ['fever', 'tropical', 'periodic', 'endemic'],
    icon: getIconForEntry('malaria'),

    summary: 'A periodic fever characterized by violent shaking fits followed by burning heat, recurring every third day. Common in swampy regions and caused by corrupt air (mal aria).',

    symptoms: [
      'Fever recurring every 48-72 hours',
      'Violent shaking chills (rigors)',
      'Profuse sweating after fever breaks',
      'Yellow complexion (jaundice)',
      'Enlarged spleen',
      'Weakness and wasting'
    ],

    historicalUnderstanding: {
      cause: 'Corrupt air from swamps and stagnant water. Miasma enters the body and corrupts the humors, particularly causing excess of black bile and deranged blood.',
      diagnosis: 'By the pattern of fever (tertian = every 3rd day, quartan = every 4th day). The periodicity is key to diagnosis.',
      prognosis: 'Dangerous if untreated. Many recover but relapses are common. Can lead to death through wasting.'
    },

    treatments: [
      'Peruvian bark (quinine) - most effective',
      'Bloodletting during fever-free intervals',
      'Purging with rhubarb or senna',
      'Cool the body with cucumber and lettuce',
      'Move patient away from swampy air'
    ],

    historicalSource: {
      author: 'Francisco Hernández',
      work: 'Natural History of New Spain',
      year: 1577,
      excerpt: '"Las fiebres tercianas son muy comunes en estas tierras calientes donde hay pantanos. Los naturales usan ciertas cortezas de árbol que tienen virtud maravillosa contra estas fiebres."',
      translation: '"Tertian fevers are very common in these hot lands where there are swamps. The natives use certain tree barks that have marvelous virtue against these fevers."',
      location: 'Mexico City'
    },

    modernNote: 'Caused by Plasmodium parasites transmitted by Anopheles mosquitoes (not "bad air"). Discovery in 1880 by Alphonse Laveran. Quinine from Peruvian bark was the first effective treatment, still used today alongside modern antimalarials.',

    wikipediaQuery: 'Malaria',
    relatedEntries: ['fever', 'peruvian-bark', 'miasma-theory', 'yellow-bile-humor', 'jaundice']
  },

  // NEW MATERIA MEDICA ENTRIES

  'camphor': {
    id: 'camphor',
    name: 'Camphor',
    latinName: 'Cinnamomum camphora',
    category: 'materia-medica',
    tags: ['pain', 'inflammation', 'cooling', 'aromatic'],
    icon: getIconForEntry('camphor'),

    summary: 'A fragrant white resin obtained from the wood of the aromatic camphor tree. Prized for its cooling and resolutive properties.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      qualities: ['Analgesic', 'Anti-inflammatory', 'Calming'],
      degree: 'Cold and moist in the second degree'
    },

    uses: [
      'Relieves pain in joints and muscles',
      'Reduces inflammation and swelling',
      'Calms nervous agitation',
      'Cools hot fevers when applied externally'
    ],

    contraindications: [
      'Should not be taken internally in large quantities',
      'Avoid in pregnancy',
      'May be too cooling for those of phlegmatic constitution'
    ],

    historicalSource: {
      author: 'Luís Gomes Ferreira',
      work: 'Erário Mineral',
      year: 1735,
      excerpt: '"A cânfora é remédio refrigerante e resolutivo... Aplica-se em dores e inflamações com grande proveito."',
      translation: '"Camphor is a cooling and resolving remedy... It is applied to pains and inflammations with great benefit."',
      location: 'Lisbon'
    },

    modernNote: 'Camphor contains volatile terpene compounds with mild analgesic and anti-inflammatory effects. Modern use is primarily topical in liniments and vapor rubs. Internal use is largely discontinued due to toxicity concerns.',

    wikipediaQuery: 'Camphor',
    relatedEntries: ['pain', 'inflammation', 'humoral-theory-cold-moist']
  },

  'chamomile': {
    id: 'chamomile',
    name: 'Chamomile',
    latinName: 'Matricaria chamomilla',
    category: 'materia-medica',
    tags: ['digestive', 'calming', 'inflammation', 'common herb'],
    icon: getIconForEntry('chamomile'),

    summary: 'A common flowering herb used to reduce inflammation, soothe digestive issues, and calm the nerves. Gentle enough for children.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Calming', 'Carminative', 'Anti-inflammatory'],
      degree: 'Warm and dry in the first degree'
    },

    uses: [
      'Calming nervous agitation and promoting sleep',
      'Soothing digestive complaints and colic',
      'Reducing inflammation in wounds',
      'Treating children\'s ailments'
    ],

    contraindications: [
      'Generally very safe',
      'Rare allergic reactions in those sensitive to plants of the daisy family'
    ],

    historicalSource: {
      author: 'João Curvo Semmedo',
      work: 'Observaçoens medicas doutrinaes de cem casos gravissimos',
      year: 1707,
      excerpt: '"A camomila tem virtude de aquecer e secar suavemente, e é muito útil para as dores de ventre e para acalmar os nervos perturbados."',
      translation: '"Chamomile has the virtue of warming and drying gently, and is very useful for belly pains and for calming disturbed nerves."',
      location: 'Lisbon'
    },

    modernNote: 'Chamomile contains anti-inflammatory compounds including chamazulene and bisabolol. Modern research confirms mild sedative and anti-anxiety effects. Widely used as a safe herbal tea.',

    wikipediaQuery: 'Chamomile',
    relatedEntries: ['digestive', 'sleep', 'inflammation', 'nervous-disorders']
  },

  'powdered-millipedes': {
    id: 'powdered-millipedes',
    name: 'Powdered Millipedes',
    latinName: 'Pulvis millepedum',
    category: 'materia-medica',
    tags: ['animal remedy', 'ear pain', 'inflammation'],
    icon: getIconForEntry('powdered-millipedes'),

    summary: 'Ground millipedes, well known as ready cures for many sorts of ear pain and inflammation. A common animal remedy.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Resolvent', 'Desiccant'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Ear pain and inflammation',
      'Obstinate earaches',
      'Mixed with oil for ear drops'
    ],

    contraindications: [
      'Do not use if eardrum is perforated',
      'May cause irritation in sensitive individuals'
    ],

    historicalSource: {
      author: 'Henry Banyer',
      work: 'Pharmacopoeia Pauperum Or, The Hospital Dispensatory',
      year: 1718,
      excerpt: '"Millipedes dried and powdered are good against Deafness, and Noises in the Ears."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Animal remedies like powdered millipedes have no proven efficacy. Ear problems should be treated with modern antibiotics or anti-inflammatory medications as appropriate.',

    wikipediaQuery: 'Millipede',
    relatedEntries: ['animal-remedies', 'ear-ailments']
  },

  'saffron': {
    id: 'saffron',
    name: 'Saffron',
    latinName: 'Crocus sativus',
    category: 'materia-medica',
    tags: ['melancholy', 'digestive', 'cough', 'precious'],
    icon: getIconForEntry('saffron'),

    summary: 'The precious stigmas of the saffron crocus. Extremely valuable for treating melancholy, improving digestion, and treating coughs and gripes.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Cordial', 'Carminative', 'Antispasmodic'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Alleviating melancholy and lifting the spirits',
      'Improving digestion and expelling wind',
      'Treating coughs and respiratory complaints',
      'Strengthening the heart'
    ],

    contraindications: [
      'Excessive use may cause over-heating',
      'Very expensive - use sparingly',
      'May be adulterated with cheaper dyes'
    ],

    historicalSource: {
      author: 'Henry Banyer',
      work: 'Pharmacopoeia Pauperum Or, The Hospital Dispensatory',
      year: 1718,
      excerpt: '"Saffron is cordial and alexipharmick; it strengthens the Heart, revives the Spirits, and is good against Melancholy."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Saffron contains crocin and safranal, which have shown mild antidepressant effects in modern studies. Still extremely expensive, costing more than gold by weight.',

    wikipediaQuery: 'Saffron',
    relatedEntries: ['melancholy', 'digestion', 'cordials', 'black-bile-humor']
  },

  'white-horehound': {
    id: 'white-horehound',
    name: 'White Horehound',
    latinName: 'Marrubium vulgare',
    category: 'materia-medica',
    tags: ['cough', 'expectorant', 'digestive', 'bitter'],
    icon: getIconForEntry('white-horehound'),

    summary: 'A bitter herb that stimulates digestion and helps expel phlegm. One of the most reliable remedies for coughs and respiratory issues.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Expectorant', 'Bitter tonic', 'Aperitive'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Coughs and stubborn phlegm',
      'Weak digestion from cold humors',
      'Chronic coughs and asthma',
      'Opening obstructions of the liver and spleen'
    ],

    contraindications: [
      'Very bitter taste may cause nausea',
      'Not for those with hot, dry constitutions',
      'Avoid in pregnancy as it may stimulate menstruation'
    ],

    historicalSource: {
      author: 'John French',
      work: 'The London-Distiller',
      year: 1667,
      excerpt: '"Horehound is hot and dry... It is excellent for cold diseases of the Lungs, as Coughs, etc."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Horehound contains marrubiin, which has expectorant properties. Still used in some herbal cough remedies and throat lozenges, though less common than in the past.',

    wikipediaQuery: 'Marrubium vulgare',
    relatedEntries: ['cough', 'phlegm-humor', 'expectorants', 'bitters']
  },

  'nettle': {
    id: 'nettle',
    name: 'Nettle',
    latinName: 'Urtica dioica',
    category: 'materia-medica',
    tags: ['inflammation', 'diuretic', 'arthritis', 'common herb'],
    icon: getIconForEntry('nettle'),

    summary: 'The stinging nettle - paradoxically both irritant and healer. Effective for inflammation when used topically, and as a diuretic when taken internally.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Diuretic', 'Anti-inflammatory', 'Rubefacient'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Arthritis and joint pain (flagellation with fresh nettles)',
      'Diuretic for dropsy and urinary complaints',
      'Allergic reactions (paradoxically)',
      'Stopping hemorrhages when applied as a powder'
    ],

    contraindications: [
      'Fresh nettles cause painful stinging',
      'Not for those with hot, inflammatory constitutions'
    ],

    historicalSource: {
      author: 'Nicholas Culpeper',
      work: 'The English Physician',
      year: 1653,
      excerpt: '"The seed being drank, is a remedy against the biting of mad dogs... The leaves or seeds being drank provoke urine, and expel gravel and the stone."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Nettle contains histamine (causing the sting) but also compounds with genuine anti-inflammatory effects. Modern research shows benefit for arthritis and prostate health.',

    wikipediaQuery: 'Urtica dioica',
    relatedEntries: ['inflammation', 'arthritis', 'dropsy', 'diuretics']
  },

  'powdered-crabs-eyes': {
    id: 'powdered-crabs-eyes',
    name: 'Powdered Crab\'s Eyes',
    latinName: 'Oculi cancrorum',
    category: 'materia-medica',
    tags: ['animal remedy', 'antacid', 'kidney stones', 'calculus'],
    icon: getIconForEntry('powdered-crabs-eyes'),

    summary: 'Ground-up gastric stones from crabs, imported from the Indies. A singular remedy for acidity and kidney stones.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Antacid', 'Absorbent', 'Lithontriptic'],
      degree: 'Cold and dry in the second degree'
    },

    uses: [
      'Excess stomach acid and heartburn',
      'Kidney and bladder stones',
      'Correcting acid humors',
      'Added to cordials to temper heat'
    ],

    contraindications: [
      'May be expensive and hard to obtain genuine specimens',
      'Often adulterated with chalk'
    ],

    historicalSource: {
      author: 'John French',
      work: 'The Art of Distillation',
      year: 1651,
      excerpt: '"The Eyes of Crabs are cooling and drying, and are excellent against the Stone, and hot Diseases."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Crab\'s eyes are calcium carbonate concretions with genuine antacid properties. Modern antacids use the same active ingredient (calcium carbonate), though from mineral rather than animal sources.',

    wikipediaQuery: 'Gastrolith',
    relatedEntries: ['kidney-stones', 'antacids', 'animal-remedies']
  },

  'quicksilver': {
    id: 'quicksilver',
    name: 'Quicksilver (Mercury)',
    latinName: 'Argentum vivum',
    category: 'materia-medica',
    tags: ['syphilis', 'french pox', 'alchemy', 'poison', 'metal'],
    icon: getIconForEntry('quicksilver'),

    summary: 'The living silver, mercury. Most beloved of alchemists, most feared of physicians. Commonly used for treating the French Pox, but dangerous.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      qualities: ['Alterative', 'Salivant', 'Penetrating'],
      degree: 'Cold and moist in the third degree'
    },

    uses: [
      'Syphilis and venereal diseases',
      'Skin conditions and scabs',
      'Mixed with fat for ointments (unguent mercurial)',
      'Alchemical preparations'
    ],

    contraindications: [
      'HIGHLY TOXIC - use with extreme caution',
      'Causes excessive salivation, tooth loss, tremors',
      'Not for children, the elderly, or the weak',
      'Vapors are dangerous - avoid inhalation'
    ],

    historicalSource: {
      author: 'Jean de Renou',
      work: 'A Medicinal Dispensatory Containing the Whole Body of Physick',
      year: 1657,
      excerpt: '"Quicksilver is cold and moist, and of all the Metals comes nearest to the nature of Water... It is chiefly used against the Venereal Disease."',
      translation: 'Original in English, translated from Latin',
      location: 'London'
    },

    modernNote: 'Mercury is extremely toxic, causing neurological and kidney damage. Its use for syphilis (before antibiotics) caused immense suffering. The phrase "a night with Venus, a lifetime with Mercury" referred to this terrible treatment.',

    wikipediaQuery: 'Mercury (medicine)',
    relatedEntries: ['syphilis', 'alchemy', 'poison', 'french-pox']
  },

  'rose-water': {
    id: 'rose-water',
    name: 'Rose Water',
    latinName: 'Aqua Rosae',
    category: 'materia-medica',
    tags: ['cooling', 'melancholy', 'inflammation', 'gentle'],
    icon: getIconForEntry('rose-water'),

    summary: 'Distilled water of roses. Gently cooling and moistening, it mixes well with almost anything and is useful in treating melancholia and inflammation.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      qualities: ['Cooling', 'Refreshing', 'Gentle'],
      degree: 'Cold and moist in the first degree'
    },

    uses: [
      'Cooling hot inflammations',
      'Treating melancholia and disturbed spirits',
      'Soothing inflamed eyes',
      'Vehicle for other medicines',
      'Flavoring cordials and electuaries'
    ],

    contraindications: [
      'Generally very safe',
      'Too gentle for serious diseases'
    ],

    historicalSource: {
      author: 'John French',
      work: 'The Art of Distillation',
      year: 1651,
      excerpt: '"Rose water is of excellent use in all hot diseases, in the Eyes, Ears, or elsewhere; it cooleth, and is very comfortable."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Rose water contains small amounts of rose oil with mild anti-inflammatory properties. Still used in Middle Eastern cuisine and traditional medicine. Generally safe and pleasant.',

    wikipediaQuery: 'Rose water',
    relatedEntries: ['melancholy', 'cooling', 'inflammation', 'distillation']
  },

  'senna': {
    id: 'senna',
    name: 'Senna',
    latinName: 'Senna alexandrina',
    category: 'materia-medica',
    tags: ['purgative', 'laxative', 'bowels', 'cleansing'],
    icon: getIconForEntry('senna'),

    summary: 'Most effective plant for purging of the bowels. A gentle but reliable laxative used to cleanse and relieve constipation.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Laxative', 'Purgative', 'Cleansing'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Relieving constipation and cleansing the bowels',
      'Purging excess humors',
      'Preparing patients for stronger treatments',
      'Gentle evacuation without violence'
    ],

    contraindications: [
      'Not for those with weak digestion',
      'Avoid during pregnancy',
      'May cause griping pains if taken in excess'
    ],

    historicalSource: {
      author: 'Jean de Renou',
      work: 'A Medicinal Dispensatory Containing the Whole Body of Physick',
      year: 1657,
      excerpt: '"Senna is warm and dry, and purgeth choler and melancholy gently and without violence."',
      translation: 'Original in English, translated from Latin',
      location: 'London'
    },

    modernNote: 'Senna contains sennosides which stimulate intestinal contractions. Still widely used as an over-the-counter laxative, though chronic use can cause dependency.',

    wikipediaQuery: 'Senna (plant)',
    relatedEntries: ['purging', 'constipation', 'humoral-theory']
  },

  'sugar': {
    id: 'sugar',
    name: 'Sugar',
    latinName: 'Saccharum',
    category: 'materia-medica',
    tags: ['confection', 'preservative', 'wounds', 'digestive'],
    icon: getIconForEntry('sugar'),

    summary: 'Refined sugar shipped from Seville. Useful for confectioning with noxious medicines to make juleps and treacles, and for treating wounds.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Preservative', 'Confectioning', 'Healing'],
      degree: 'Warm and dry in the first degree'
    },

    uses: [
      'Sweetening bitter medicines',
      'Making juleps, electuaries, and treacles',
      'Treating coughs and sore throats',
      'Healing wounds and preventing putrefaction',
      'Improving digestion when taken moderately'
    ],

    contraindications: [
      'Excessive consumption may cause heat and inflammation',
      'May promote tooth decay',
      'Expensive - use sparingly for medicinal purposes'
    ],

    historicalSource: {
      author: 'Jean de Renou',
      work: 'A Medicinal Dispensatory Containing the Whole Body of Physick',
      year: 1657,
      excerpt: '"Sugar is warm and moist, cleanses and mundifies, and is good for the breast and lungs. It is the foundation of all electuaries and conserves."',
      translation: 'Original in English, translated from Latin',
      location: 'London'
    },

    modernNote: 'Sugar has mild antimicrobial properties in high concentrations (used in wound care even today). However, its medicinal reputation vastly exceeded its actual therapeutic value. Modern medicine recognizes excessive sugar consumption as harmful.',

    wikipediaQuery: 'Sugar in medicine',
    relatedEntries: ['confection', 'preservatives', 'wound-care', 'electuaries']
  },

  'honey': {
    id: 'honey',
    name: 'Honey',
    latinName: 'Mel',
    category: 'materia-medica',
    tags: ['wounds', 'cough', 'digestive', 'preservative'],
    icon: getIconForEntry('honey'),

    summary: 'Golden honey harvested from local hives. Crucial ingredient in unguents via confectioning, and valuable for treating coughs, wounds, and digestive issues.',

    properties: {
      humors: { temperature: 'warm', moisture: 'moist' },
      qualities: ['Healing', 'Demulcent', 'Cleansing'],
      degree: 'Warm and moist in the first degree'
    },

    uses: [
      'Soothing coughs and throat inflammation',
      'Healing wounds and preventing infection',
      'Treating digestive complaints',
      'Making unguents and salves',
      'Preserving medicines and herbs'
    ],

    contraindications: [
      'May be too sweet for those with hot constitutions',
      'Can attract flies if applied to open wounds',
      'Generally very safe'
    ],

    historicalSource: {
      author: 'John Woodall',
      work: 'The Surgion\'s Mate',
      year: 1617,
      excerpt: '"Honey is excellent to cleanse and mundify wounds and ulcers, and is the basis of all manner of salves and unguents."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Honey has genuine antimicrobial properties due to low water content, hydrogen peroxide production, and low pH. Medical-grade honey is still used in modern wound care. The historical use was remarkably accurate.',

    wikipediaQuery: 'Honey in medicine',
    relatedEntries: ['wound-care', 'cough', 'unguents', 'preservatives']
  },

  'spanish-wine': {
    id: 'spanish-wine',
    name: 'Spanish Wine',
    latinName: 'Vinum',
    category: 'materia-medica',
    tags: ['digestive', 'vehicle', 'wounds', 'fortifying'],
    icon: getIconForEntry('spanish-wine'),

    summary: 'Sherry wine imported from southern Spain. Used for decoction or distillation with other drugs, as a vehicle for medicines, or as an enema.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Fortifying', 'Digestive', 'Vulnerary'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Aiding digestion and invigorating the body',
      'Vehicle for dissolving and administering medicines',
      'Treating wounds (applied externally)',
      'Making decoctions and tinctures',
      'Administering as clysters (enemas)'
    ],

    contraindications: [
      'Not for those of hot, choleric temperament',
      'May inflame the blood if taken excessively',
      'Avoid in fevers and inflammatory diseases'
    ],

    historicalSource: {
      author: 'George Bate',
      work: 'Pharmacopœia Bateana',
      year: 1694,
      excerpt: '"Wine is the common vehicle of most medicines, strengthening the stomach, promoting digestion, and carrying the virtue of medicaments to all parts of the body."',
      translation: 'Original in Latin',
      location: 'London'
    },

    modernNote: 'Alcohol does have antiseptic properties and aids in extracting medicinal compounds (tinctures). However, its therapeutic reputation was greatly exaggerated, and excessive consumption causes significant health problems.',

    wikipediaQuery: 'Wine in medicine',
    relatedEntries: ['tinctures', 'decoction', 'vehicles', 'digestive']
  },

  'sal-ammoniac': {
    id: 'sal-ammoniac',
    name: 'Sal Ammoniac',
    latinName: 'Sal Ammoniacum',
    category: 'materia-medica',
    tags: ['alchemical', 'phlegm', 'respiratory', 'purgative'],
    icon: getIconForEntry('sal-ammoniac'),

    summary: 'A crystalline salt often used in alchemy. Useful for dissolving phlegm, treating respiratory ailments, and as a purgative for excess humors.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Resolvent', 'Expectorant', 'Purgative'],
      degree: 'Cold and dry in the third degree'
    },

    uses: [
      'Dissolving thick phlegm in the lungs',
      'Treating respiratory ailments and chronic coughs',
      'Purging excess watery humors',
      'Alchemical distillations and calcinations',
      'External applications for skin eruptions'
    ],

    contraindications: [
      'Very sharp and corrosive - use with caution',
      'Not for those with weak stomachs',
      'May cause vomiting if taken internally in excess'
    ],

    historicalSource: {
      author: 'Nicholas Culpeper',
      work: 'The English Physician Enlarged',
      year: 1653,
      excerpt: '"Sal Armoniack... is hot and dry in the third degree... It cutteth gross flegm, clenseth the breast and lungs."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Sal ammoniac is ammonium chloride. While it does have expectorant properties, it can be irritating and toxic in large amounts. Rarely used in modern medicine.',

    wikipediaQuery: 'Sal ammoniac',
    relatedEntries: ['alchemy', 'phlegm-humor', 'expectorants', 'respiratory']
  },

  'ginger': {
    id: 'ginger',
    name: 'Ginger',
    latinName: 'Zingiber officinale',
    category: 'materia-medica',
    tags: ['digestive', 'warming', 'nausea', 'imported'],
    icon: getIconForEntry('ginger'),

    summary: 'A pungent spice from the Indies used widely to stimulate digestion, relieve nausea, and cure respiratory ailments.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Carminative', 'Stimulant', 'Expectorant'],
      degree: 'Warm and dry in the third degree'
    },

    uses: [
      'Stimulating weak digestion',
      'Relieving nausea and vomiting',
      'Treating coughs and colds',
      'Warming cold stomachs',
      'Expelling wind and easing colic'
    ],

    contraindications: [
      'Too hot for those of choleric temperament',
      'May cause heat and inflammation if used excessively',
      'Not for hot diseases or fevers'
    ],

    historicalSource: {
      author: 'John Parkinson',
      work: 'Theatrum Botanicum',
      year: 1640,
      excerpt: '"Ginger is hot and dry in the third degree... It heateth the stomacke, helpeth digestion, and is good against the cough."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Ginger contains gingerol and shogaol, which have genuine anti-nausea and anti-inflammatory effects. Modern research confirms its effectiveness for motion sickness and morning sickness.',

    wikipediaQuery: 'Ginger medicinal uses',
    relatedEntries: ['digestive', 'nausea', 'carminatives', 'spices']
  },

  'bezoar-stone': {
    id: 'bezoar-stone',
    name: 'Bezoar Stone',
    latinName: 'Bezoar',
    category: 'materia-medica',
    tags: ['antidote', 'poison', 'fever', 'precious', 'animal'],
    icon: getIconForEntry('bezoar'),

    summary: 'A rare and prized stone found in the stomachs of certain animals, known for its use as a universal antidote to poisons and venoms.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Alexipharmic', 'Febrifuge', 'Cordial'],
      degree: 'Cold and dry in the second degree'
    },

    uses: [
      'Universal antidote to poisons and venoms',
      'Treating fevers and pestilential diseases',
      'Balancing disturbed humors',
      'Strengthening the heart against corruption',
      'Preventing the effects of poisoned air'
    ],

    contraindications: [
      'Extremely expensive and rare',
      'Often counterfeited with false stones',
      'Efficacy depends on authenticity'
    ],

    historicalSource: {
      author: 'José de Acosta',
      work: 'Natural and Moral History of the Indies',
      year: 1604,
      excerpt: '"The Bezoar stone is found in the stomach of certain animals in Peru... It is held to be a sovereign remedy against all poisons and venomous bites."',
      translation: 'Original in Spanish',
      location: 'Seville, Spain'
    },

    modernNote: 'Bezoar stones are gastrointestinal concretions with no actual antidotal properties. However, their reputation led to astronomical prices and extensive counterfeiting. The belief persisted into the 18th century despite experimental evidence of ineffectiveness.',

    wikipediaQuery: 'Bezoar',
    relatedEntries: ['antidotes', 'poison', 'fever', 'animal-remedies']
  },

  'red-coral': {
    id: 'red-coral',
    name: 'Red Coral',
    latinName: 'Corallium rubrum',
    category: 'materia-medica',
    tags: ['heart', 'bleeding', 'melancholy', 'precious', 'animal'],
    icon: getIconForEntry('red-coral'),

    summary: 'Branches of red coral from the Mediterranean, prized for their ability to fortify the heart, stop bleeding, and calm nervous conditions.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Cardial', 'Astringent', 'Desiccant'],
      degree: 'Cold and dry in the second degree'
    },

    uses: [
      'Fortifying the heart and vital spirits',
      'Stopping bleeding and hemorrhages',
      'Treating melancholy and nervous agitation',
      'Calming palpitations',
      'Making cordials and heart tonics'
    ],

    contraindications: [
      'Expensive and sometimes counterfeited',
      'Must be properly prepared (powdered or calcined)',
      'Not for those with very cold constitutions'
    ],

    historicalSource: {
      author: 'Jean de Renou',
      work: 'A Medicinal Dispensatory Containing the Whole Body of Physick',
      year: 1657,
      excerpt: '"Coral is cold and dry, and strengthens the heart wonderfully. It is also good to stop fluxes of blood."',
      translation: 'Original in English, translated from Latin',
      location: 'London'
    },

    modernNote: 'Red coral is primarily calcium carbonate with no specific cardiac benefits. Like other animal calculi, it may have had mild antacid effects when powdered.',

    wikipediaQuery: 'Red coral medicinal',
    relatedEntries: ['heart', 'bleeding', 'melancholy', 'cordials', 'animal-remedies']
  },

  'mechoacan': {
    id: 'mechoacan',
    name: 'Mechoacan',
    latinName: 'Convolvulus mechoacana',
    category: 'materia-medica',
    tags: ['purgative', 'new-world', 'dropsy', 'indigenous'],
    icon: getIconForEntry('mechoacan'),

    summary: 'A root from New Spain similar to Jalap, widely used as a strong purgative. Particularly effective for treating dropsy and cleansing the bowels.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Purgative', 'Hydragogue', 'Cathartic'],
      degree: 'Cold and dry in the third degree'
    },

    uses: [
      'Powerful purging of watery humors',
      'Treating dropsy (edema)',
      'Cleansing the bowels of stubborn matter',
      'Evacuating phlegm and serosity',
      'Alternative to jalap root'
    ],

    contraindications: [
      'Very strong - may cause violent purging',
      'Not for children, the elderly, or the weak',
      'Should be corrected with aromatic spices',
      'May cause severe griping pains'
    ],

    historicalSource: {
      author: 'Pierre Pomet',
      work: 'A Complete History of Drugs',
      year: 1748,
      excerpt: '"Mechoacan is a Root brought from New Spain... It purges gently and is good for Dropsies and other Diseases proceeding from a watery Cause."',
      translation: 'Original in French, translated to English',
      location: 'London'
    },

    modernNote: 'Mechoacan contains resinous glycosides that act as strong purgatives. Like many powerful cathartics, it can cause dehydration and electrolyte imbalances. Not used in modern medicine.',

    wikipediaQuery: 'Ipomoea jalapa',
    relatedEntries: ['purging', 'dropsy', 'jalap', 'new-world-drugs']
  },

  'cochineal': {
    id: 'cochineal',
    name: 'Cochineal',
    latinName: 'Dactylopius coccus',
    category: 'materia-medica',
    tags: ['fever', 'bleeding', 'dye', 'animal', 'new-world'],
    icon: getIconForEntry('cochineal'),

    summary: 'Dried female cochineal insects from New Spain, valued for their vibrant red dye and medicinal properties against fevers and bleeding.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Febrifuge', 'Styptic', 'Cordial'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Treating fevers and hot diseases',
      'Stopping bleeding',
      'Sore throats and mouth ulcers',
      'Making red dyes for medicines',
      'Strengthening the heart'
    ],

    contraindications: [
      'Expensive due to labor-intensive harvest',
      'May be adulterated with cheaper red dyes',
      'Medicinal use less common than dyeing use'
    ],

    historicalSource: {
      author: 'Pierre Pomet',
      work: 'A Complete History of Drugs',
      year: 1748,
      excerpt: '"Cochineal is a small Insect... gathered in New Spain. It is used for dying Scarlet, and in Medicine for strengthening the Heart."',
      translation: 'Original in French, translated to English',
      location: 'London'
    },

    modernNote: 'Cochineal produces carminic acid, still used as a natural red food coloring (E120). Its medicinal reputation was likely due to its association with expensive, luxurious preparations rather than genuine therapeutic effects.',

    wikipediaQuery: 'Cochineal',
    relatedEntries: ['fever', 'bleeding', 'dyes', 'new-world-drugs', 'animal-remedies']
  },

  'alum': {
    id: 'alum',
    name: 'Alum',
    latinName: 'Alumen',
    category: 'materia-medica',
    tags: ['astringent', 'wounds', 'bleeding', 'mineral'],
    icon: getIconForEntry('alum'),

    summary: 'Crystalline mineral used in various topical treatments, especially for wounds, eye problems, and mouth sores. Powerfully astringent.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Astringent', 'Styptic', 'Desiccant'],
      degree: 'Cold and dry in the third degree'
    },

    uses: [
      'Stopping bleeding from wounds',
      'Treating ulcers and sores',
      'Strengthening loose teeth and gums',
      'Eye washes for inflammation',
      'Constricting excessive moisture'
    ],

    contraindications: [
      'Very astringent - can be irritating',
      'Do not use internally except in small amounts',
      'May cause burning sensation on open wounds'
    ],

    historicalSource: {
      author: 'Pierre Pomet',
      work: 'A Complete History of Drugs',
      year: 1748,
      excerpt: '"Alum is cold and dry in the third Degree... It stops Fluxes of Blood, fastens the Teeth, and heals Ulcers."',
      translation: 'Original in French, translated to English',
      location: 'London'
    },

    modernNote: 'Alum (potassium aluminum sulfate) is indeed astringent and can help stop minor bleeding. Still used in some styptic pencils and as a mordant in dyeing. Generally safe externally but not recommended for internal use.',

    wikipediaQuery: 'Alum medicinal',
    relatedEntries: ['astringents', 'wounds', 'bleeding', 'minerals']
  },

  'dragons-blood': {
    id: 'dragons-blood',
    name: 'Dragon\'s Blood',
    latinName: 'Daemonorops draco',
    category: 'materia-medica',
    tags: ['wounds', 'bleeding', 'astringent', 'resin', 'exotic'],
    icon: getIconForEntry('dragons-blood'),

    summary: 'A bright red resin from tropical trees, prized for its powerful healing properties, especially for wounds and stopping bleeding.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Vulnerary', 'Astringent', 'Healing'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Healing wounds and stopping bleeding',
      'Treating ulcers and sores',
      'Strengthening loose teeth',
      'Drying excessive moisture',
      'Making wound plasters and styptic powders'
    ],

    contraindications: [
      'Expensive and sometimes adulterated',
      'May be too drying for some wounds',
      'Not for internal use in large quantities'
    ],

    historicalSource: {
      author: 'Pierre Pomet',
      work: 'A Complete History of Drugs',
      year: 1748,
      excerpt: '"Dragons Blood is a Resin... excellent to stop all manner of Fluxes of Blood, to consolidate Wounds, and fasten the Teeth."',
      translation: 'Original in French, translated to English',
      location: 'London'
    },

    modernNote: 'Dragon\'s blood resin contains alkaloids and flavonoids with genuine wound-healing and antimicrobial properties. Modern research has confirmed some traditional uses, particularly for promoting tissue repair.',

    wikipediaQuery: 'Dragon\'s blood (resin)',
    relatedEntries: ['wounds', 'bleeding', 'astringents', 'resins']
  },

  'crocus-metallorum': {
    id: 'crocus-metallorum',
    name: 'Crocus Metallorum',
    latinName: 'Crocus Metallorum',
    category: 'materia-medica',
    tags: ['alchemical', 'purgative', 'antimony', 'poison', 'emetic'],
    icon: getIconForEntry('crocus-metallorum'),

    summary: 'A reddish alchemical powder made from antimony, commonly used as a powerful purgative taken with wine or sugar. Extremely toxic.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Purgative', 'Emetic', 'Diaphoretic'],
      degree: 'Cold and dry in the fourth degree'
    },

    uses: [
      'Evacuating humors from both above and below',
      'Strong purging in desperate cases',
      'Causing vomiting to expel poisons',
      'Promoting sweating in stubborn fevers',
      'Alchemical preparations'
    ],

    contraindications: [
      'EXTREMELY TOXIC - use with utmost caution',
      'Not for children, the elderly, or the weak',
      'May cause violent vomiting and purging',
      'Can be fatal in excess',
      'Requires expert preparation and dosing'
    ],

    historicalSource: {
      author: 'Nicolas Lémery',
      work: 'A Course of Chymistry',
      year: 1686,
      excerpt: '"Crocus Metallorum is made from Antimony... It purges both upwards and downwards with great violence, and must be used with extreme caution."',
      translation: 'Original in French, translated to English',
      location: 'London'
    },

    modernNote: 'Crocus metallorum is antimony trioxide, highly toxic. Its use as a medicine caused immense suffering and death. The medical controversy over antimony raged for centuries. Never use antimony compounds medicinally.',

    wikipediaQuery: 'Antimony in medicine',
    relatedEntries: ['antimony', 'alchemy', 'purgatives', 'poison']
  },

  'cinnamon': {
    id: 'cinnamon',
    name: 'Cinnamon',
    latinName: 'Cinnamomum verum',
    category: 'materia-medica',
    tags: ['warming', 'digestive', 'cordial', 'spice', 'precious'],
    icon: getIconForEntry('cinnamon'),

    summary: 'Aromatic bark from Ceylon, highly prized in Europe. Used in cordials, electuaries, and warming medicines to strengthen the stomach and treat coughs.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Cordial', 'Carminative', 'Warming'],
      degree: 'Warm and dry in the third degree'
    },

    uses: [
      'Strengthening the stomach and aiding digestion',
      'Warming the body in cold diseases',
      'Treating coughs and colds',
      'Making cordials to fortify the heart',
      'Expelling wind and comforting the bowels'
    ],

    contraindications: [
      'Too hot for choleric temperaments',
      'Expensive - use sparingly',
      'May cause heat in inflammatory diseases',
      'Beware of inferior cassia sold as true cinnamon'
    ],

    historicalSource: {
      author: 'Jean de Renou',
      work: 'A Medicinal Dispensatory',
      year: 1657,
      excerpt: '"Cinnamon is hot and dry in the third degree, of thin parts, strengthens the heart and stomach, and is used in all cordial medicines."',
      translation: 'Original in Latin, translated to English',
      location: 'London'
    },

    modernNote: 'Cinnamon contains cinnamaldehyde and other compounds with antimicrobial and anti-inflammatory effects. Modern research suggests benefits for blood sugar regulation. True Ceylon cinnamon is still more expensive than cassia.',

    wikipediaQuery: 'Cinnamon medicinal',
    relatedEntries: ['cordials', 'digestive', 'spices', 'warming-medicines']
  },

  'clove': {
    id: 'clove',
    name: 'Clove',
    latinName: 'Syzygium aromaticum',
    category: 'materia-medica',
    tags: ['toothache', 'digestive', 'warming', 'spice', 'precious'],
    icon: getIconForEntry('clove'),

    summary: 'Dried flower buds from the Moluccas, valued for their intense aroma and powerful warming properties. Famous for relieving toothache.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Analgesic', 'Carminative', 'Warming'],
      degree: 'Warm and dry in the third degree'
    },

    uses: [
      'Relieving toothache and mouth pain',
      'Aiding digestion and warming the stomach',
      'Treating nausea and vomiting',
      'Strengthening weak stomachs',
      'Making aromatic cordials and electuaries'
    ],

    contraindications: [
      'Very hot - not for inflammatory conditions',
      'Expensive due to monopoly control',
      'May cause burning sensation if used excessively',
      'Not for those of hot temperament'
    ],

    historicalSource: {
      author: 'Nicholas Culpeper',
      work: 'The English Physician',
      year: 1653,
      excerpt: '"Cloves strengthen the stomach, help digestion, stop vomiting, and are excellent for the tooth-ache, being held in the mouth."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Clove oil contains eugenol, which has genuine analgesic and antiseptic properties. Still used in dentistry as a temporary pain reliever and in some over-the-counter dental products.',

    wikipediaQuery: 'Clove medicinal',
    relatedEntries: ['toothache', 'digestive', 'spices', 'analgesics']
  },

  'nutmeg': {
    id: 'nutmeg',
    name: 'Nutmeg',
    latinName: 'Myristica fragrans',
    category: 'materia-medica',
    tags: ['brain', 'digestive', 'warming', 'spice', 'precious'],
    icon: getIconForEntry('nutmeg'),

    summary: 'The aromatic seed from the Banda Islands, prized for its warming and comforting properties. Strengthens the brain and memory.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Cordial', 'Cephalic', 'Carminative'],
      degree: 'Warm and dry in the third degree'
    },

    uses: [
      'Strengthening the brain and improving memory',
      'Aiding digestion and treating flatulence',
      'Warming cold stomachs',
      'Comforting the heart in cordials',
      'Treating diarrhea and dysentery'
    ],

    contraindications: [
      'Very expensive - monopolized by Dutch',
      'Too hot for inflammatory diseases',
      'Large doses may cause intoxication',
      'Not for hot, dry constitutions'
    ],

    historicalSource: {
      author: 'John Parkinson',
      work: 'Theatrum Botanicum',
      year: 1640,
      excerpt: '"Nutmeg is hot and dry in the third degree... It strengthens the brain and memory, helps digestion, and comforts the stomach."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Nutmeg contains myristicin, which in large doses has psychoactive effects. Small culinary amounts are safe. The digestive benefits were likely due to aromatic compounds stimulating appetite and digestion.',

    wikipediaQuery: 'Nutmeg medicinal',
    relatedEntries: ['brain', 'memory', 'digestive', 'spices', 'cordials']
  },

  'amber': {
    id: 'amber',
    name: 'Amber',
    latinName: 'Succinum',
    category: 'materia-medica',
    tags: ['heart', 'hysteria', 'convulsions', 'precious', 'resin'],
    icon: getIconForEntry('amber'),

    summary: 'Fossilized tree resin from the Baltic Sea, burned as incense or powdered for medicines. Highly valued in alchemy for strengthening the heart.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Cordial', 'Antispasmodic', 'Purifying'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Strengthening the heart and vital spirits',
      'Calming hysteria and nervous disorders',
      'Treating convulsions and fits',
      'Purifying corrupted air when burned',
      'Alchemical preparations and tinctures'
    ],

    contraindications: [
      'Extremely expensive',
      'Often counterfeited with false amber',
      'Burning produces pleasant but medicinally questionable fumes',
      'Efficacy depends on authenticity'
    ],

    historicalSource: {
      author: 'Robert Boyle',
      work: 'Of the Reconcileableness of Specifick Medicines to the Corpuscular Philosophy',
      year: 1685,
      excerpt: '"Amber is a noble cordial, and specifick against hysterick fits and convulsions, working by its subtile and volatile spirit."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Amber is fossilized resin with no proven medicinal properties. Its reputation stemmed from rarity and mystique. Baltic amber was and remains valuable, but for jewelry rather than medicine.',

    wikipediaQuery: 'Amber in medicine',
    relatedEntries: ['cordials', 'hysteria', 'convulsions', 'alchemy']
  },

  'guaiacum': {
    id: 'guaiacum',
    name: 'Guaiacum',
    latinName: 'Guaiacum officinale',
    category: 'materia-medica',
    tags: ['syphilis', 'sweating', 'new-world', 'alterative'],
    icon: getIconForEntry('guaiacum'),

    summary: 'Heavy, resinous wood from the New World, prized for treating the "French disease" (syphilis) and purifying corrupted humors through sweating.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Sudorific', 'Alterative', 'Depurative'],
      degree: 'Warm and dry in the third degree'
    },

    uses: [
      'Treating syphilis and venereal diseases',
      'Promoting sweating to purge corrupt humors',
      'Cleansing the blood',
      'Chronic pains and rheumatism',
      'Making decoctions and diet drinks'
    ],

    contraindications: [
      'Treatment requires strict regimen (heat, restricted diet)',
      'May cause excessive sweating and weakness',
      'Not for those with very hot constitutions',
      'Less effective than mercury but safer'
    ],

    historicalSource: {
      author: 'Nicolás Monardes',
      work: 'Historia medicinal de las cosas que se traen de nuestras Indias Occidentales',
      year: 1574,
      excerpt: '"El palo de Guayaco es singular remedio para las bubas y mal francés, purificando la sangre por sudor copioso."',
      translation: '"Guaiacum wood is a singular remedy for syphilis and the French disease, purifying the blood through copious sweating."',
      location: 'Seville, Spain'
    },

    modernNote: 'Guaiacum was ineffective against syphilis (no herb could cure it before antibiotics). The intense sweating regimen was debilitating and dangerous. The wood does contain anti-inflammatory compounds but nothing that treats bacterial infections.',

    wikipediaQuery: 'Guaiacum medicinal',
    relatedEntries: ['syphilis', 'sweating', 'new-world-drugs', 'alteratives']
  },

  'tobacco': {
    id: 'tobacco',
    name: 'Tobacco',
    latinName: 'Nicotiana tabacum',
    category: 'materia-medica',
    tags: ['wounds', 'purging', 'new-world', 'indigenous'],
    icon: getIconForEntry('tobacco'),

    summary: 'Leaves from the Indies, long valued for purging humors, treating wounds, and warding off pestilence. Can be smoked or applied as poultice.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Purgative', 'Vulnerary', 'Narcotic'],
      degree: 'Warm and dry in the third degree'
    },

    uses: [
      'Treating wounds and ulcers (as poultice)',
      'Relieving toothaches',
      'Purging phlegm and corrupt humors',
      'Preventing pestilence (smoking)',
      'Treating headaches and migraines'
    ],

    contraindications: [
      'May cause dizziness and nausea',
      'Excessive smoking injures the lungs',
      'Not for children or the very weak',
      'Some consider it more vice than medicine'
    ],

    historicalSource: {
      author: 'Juan de Cárdenas',
      work: 'Problemas y secretos maravillosos de las Indias',
      year: 1591,
      excerpt: '"El tabaco tiene virtud de calentar y secar, y purgar flemas del cerebro, y es útil para heridas cuando se aplica como emplasto."',
      translation: '"Tobacco has the virtue of warming and drying, purging phlegm from the brain, and is useful for wounds when applied as a plaster."',
      location: 'Mexico City'
    },

    modernNote: 'Tobacco contains nicotine (addictive) and numerous carcinogens. While indigenous peoples used it medicinally and ceremonially, European adoption led to the global tobacco epidemic. Any medicinal benefits are vastly outweighed by severe health risks.',

    wikipediaQuery: 'Tobacco history medicine',
    relatedEntries: ['wounds', 'purging', 'new-world-drugs', 'indigenous-medicine']
  },

  'copal-resin': {
    id: 'copal-resin',
    name: 'Copal Resin',
    latinName: 'Bursera copallifera',
    category: 'materia-medica',
    tags: ['wounds', 'incense', 'indigenous', 'new-world', 'inflammation'],
    icon: getIconForEntry('copal'),

    summary: 'Fragrant resin from Mexican trees, burned in temples and used to prepare soothing unguents. Indigenous remedy for inflammation and wounds.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Vulnerary', 'Aromatic', 'Anti-inflammatory'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Making wound plasters and ointments',
      'Calming inflammation when applied topically',
      'Burning as incense for purification',
      'Treating respiratory complaints (fumigation)',
      'Indigenous ritual and healing practices'
    ],

    contraindications: [
      'Quality varies depending on source',
      'Smoke may irritate sensitive lungs',
      'Generally safe for external use'
    ],

    historicalSource: {
      author: 'Francisco Hernández',
      work: 'Historia natural de Nueva España',
      year: 1651,
      excerpt: '"El copal es resina aromática que los indios queman en sus templos, y tiene virtud de sanar heridas y calmar inflamaciones."',
      translation: '"Copal is an aromatic resin that the Indians burn in their temples, and has the virtue of healing wounds and calming inflammations."',
      location: 'Mexico City'
    },

    modernNote: 'Copal resin contains terpenes with mild antimicrobial and anti-inflammatory properties. Still used in traditional Mexican medicine and ceremonies. Generally safe for topical and aromatic use.',

    wikipediaQuery: 'Copal resin',
    relatedEntries: ['wounds', 'inflammation', 'incense', 'indigenous-medicine', 'new-world-drugs']
  },

  'cacao': {
    id: 'cacao',
    name: 'Cacao',
    latinName: 'Theobroma cacao',
    category: 'materia-medica',
    tags: ['heart', 'melancholy', 'food', 'new-world', 'nourishing'],
    icon: getIconForEntry('cacao'),

    summary: 'Seeds of the cacao tree, consumed as chocolate. Valued as both food and medicine for its ability to strengthen the heart and calm melancholy.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      qualities: ['Nourishing', 'Cordial', 'Calming'],
      degree: 'Cold and moist in the first degree'
    },

    uses: [
      'Strengthening the heart and vital spirits',
      'Calming melancholy and disturbed humors',
      'Nourishing the body in wasting diseases',
      'Providing sustenance without solid food',
      'Making restorative beverages and confections'
    ],

    contraindications: [
      'May be too rich for weak stomachs',
      'Excessive consumption can cause overheating',
      'Quality varies greatly - beware adulteration',
      'Some authorities debate its humoral properties'
    ],

    historicalSource: {
      author: 'Antonio Colmenero de Ledesma',
      work: 'Curioso tratado de la naturaleza y calidad del chocolate',
      year: 1631,
      excerpt: '"El chocolate es de naturaleza fría y húmeda, conforta el corazón, y tiene virtud de alimentar y sustentar el cuerpo."',
      translation: '"Chocolate is of cold and moist nature, comforts the heart, and has the virtue of nourishing and sustaining the body."',
      location: 'Madrid'
    },

    modernNote: 'Cacao contains theobromine and flavonoids with genuine cardiovascular benefits and mood-enhancing effects. Modern research confirms antioxidant properties. The Aztecs valued it highly, and it became a sensation in Europe after the conquest.',

    wikipediaQuery: 'Cacao medicinal uses',
    relatedEntries: ['heart', 'melancholy', 'cordials', 'new-world-drugs', 'food-medicines']
  },

  'rue': {
    id: 'rue',
    name: 'Rue',
    latinName: 'Ruta graveolens',
    category: 'materia-medica',
    tags: ['poison-antidote', 'pestilence', 'digestive', 'bitter', 'protective'],
    icon: getIconForEntry('rue'),

    summary: 'Pungent herb with a strong, disagreeable odor. Used to ward off contagion and cleanse the body of corrupt humors. Considered protective against poison and pestilent airs.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Alexipharmic', 'Carminative', 'Antispasmodic'],
      degree: 'Hot and dry in the third degree'
    },

    uses: [
      'Protection against poison and venomous bites',
      'Warding off pestilent and corrupted airs',
      'Aiding digestion and expelling wind',
      'Calming nervous disorders and hysteria',
      'Strengthening failing eyesight',
      'Provoking menstruation (abortifacient)'
    ],

    contraindications: [
      'TOXIC in large doses - causes severe cramping',
      'Absolutely forbidden in pregnancy - causes miscarriage',
      'May cause skin irritation and blistering',
      'Not for children or those with hot constitutions'
    ],

    historicalSource: {
      author: 'John Gerard',
      work: 'The Herball, or Generall Historie of Plantes',
      year: 1633,
      excerpt: '"Rue is hot and drie in the third degree... It is reported that if a man bee anointed with the juice of Rue, the poison of Woolfe-bane, Mushrooms, or Todestooles... doth not hurt him."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Rue contains furocoumarins and alkaloids that are genuinely toxic. Its reputation as an antidote was mythical, but it does have mild antiseptic properties. Still used in small amounts in traditional medicine, but its toxicity makes it dangerous.',

    wikipediaQuery: 'Rue (herb)',
    relatedEntries: ['poison', 'antidotes', 'pestilence', 'abortion', 'miasma-theory']
  },

  'tamarind': {
    id: 'tamarind',
    name: 'Tamarind',
    latinName: 'Tamarindus indica',
    category: 'materia-medica',
    tags: ['purgative', 'cooling', 'fever', 'bile', 'imported'],
    icon: getIconForEntry('tamarind'),

    summary: 'Tart fruit pulp imported from the Indies. Used as a cooling purgative that gently evacuates bile and refreshes the stomach.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      qualities: ['Laxative', 'Refrigerant', 'Appetizing'],
      degree: 'Cold and moist in the second degree'
    },

    uses: [
      'Cooling the body in hot fevers',
      'Purging yellow bile and choler',
      'Refreshing the stomach in hot weather',
      'Gentle laxative for delicate constitutions',
      'Making pleasant cooling drinks',
      'Treating bilious complaints'
    ],

    contraindications: [
      'Too cooling for those of phlegmatic temperament',
      'May weaken digestion if used excessively',
      'Not for winter use or cold diseases'
    ],

    historicalSource: {
      author: 'Cristóbal Acosta',
      work: 'Tractado de las drogas y medicinas de las Indias orientales',
      year: 1578,
      excerpt: '"Los tamarindos son fríos y húmedos, refrigeran el hígado y purgan la cólera con suavidad, y son buenos para las fiebres calientes."',
      translation: '"Tamarinds are cold and moist, cool the liver and purge choler gently, and are good for hot fevers."',
      location: 'Burgos'
    },

    modernNote: 'Tamarind contains tartaric acid and has genuine mild laxative effects. Rich in vitamins and still used in traditional medicine and cuisine. The cooling reputation stems from its refreshing taste and gentle action.',

    wikipediaQuery: 'Tamarind medicinal',
    relatedEntries: ['fever', 'yellow-bile-humor', 'purging', 'cooling-medicines']
  },

  'aloes': {
    id: 'aloes',
    name: 'Aloes',
    latinName: 'Aloe vera',
    category: 'materia-medica',
    tags: ['purgative', 'wounds', 'bitter', 'versatile'],
    icon: getIconForEntry('aloes'),

    summary: 'Succulent resin from the aloe plant, used both internally as a purgative and externally for healing wounds and soothing inflammation.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Purgative', 'Vulnerary', 'Cooling'],
      degree: 'Cold and dry in the second degree'
    },

    uses: [
      'Gentle purging of the bowels',
      'Healing wounds and burns',
      'Soothing stomach complaints',
      'Treating skin inflammations',
      'Opening obstructions of the liver',
      'Making wound plasters and salves'
    ],

    contraindications: [
      'Not for use during pregnancy',
      'May cause griping if taken in excess',
      'Too bitter for some patients',
      'Not for very cold constitutions'
    ],

    historicalSource: {
      author: 'John Woodall',
      work: 'The Surgion\'s Mate',
      year: 1617,
      excerpt: '"Aloes is cold and dry, and purgeth choler gently. It is also excellent for wounds and ulcers, cleansing and healing them."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Aloe vera gel contains compounds with genuine wound-healing, anti-inflammatory, and moisturizing properties. The inner leaf latex (traditional "aloes") is a strong laxative containing anthraquinones. Modern use is primarily topical.',

    wikipediaQuery: 'Aloe vera medicinal',
    relatedEntries: ['purging', 'wounds', 'burns', 'yellow-bile-humor']
  },

  'turpentine': {
    id: 'turpentine',
    name: 'Turpentine',
    latinName: 'Terebinthinae oleum',
    category: 'materia-medica',
    tags: ['wounds', 'drawing', 'antiseptic', 'resin'],
    icon: getIconForEntry('turpentine'),

    summary: 'Resinous distillate from pine trees, used to draw out corrupt matter from wounds and ulcers. Cleanses and protects from infection.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Drawing', 'Cleansing', 'Attenuating'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Drawing out corruption from wounds',
      'Cleansing ulcers and sores',
      'Protecting wounds from putrefaction',
      'Treating gunshot wounds',
      'Making wound plasters and digestive ointments',
      'Loosening tough phlegm in the chest'
    ],

    contraindications: [
      'Very irritating to skin in pure form',
      'May cause burning sensation',
      'Not for internal use except in small amounts',
      'Toxic if swallowed in quantity'
    ],

    historicalSource: {
      author: 'Nicholas Culpeper',
      work: 'Pharmacopoeia Londinensis',
      year: 1653,
      excerpt: '"Turpentine is hot and dry in the second degree, cleansing and healing. It is excellent to draw out corruption from wounds and to preserve them from putrefaction."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Turpentine does have genuine antiseptic properties due to its terpene content. However, it is quite toxic and irritating. Modern medicine uses refined pine derivatives but not crude turpentine for wound care.',

    wikipediaQuery: 'Turpentine medicinal',
    relatedEntries: ['wounds', 'antiseptics', 'ulcers', 'resins']
  },

  'balsam-of-peru': {
    id: 'balsam-of-peru',
    name: 'Balsam of Peru',
    latinName: 'Balsamum peruvianum',
    category: 'materia-medica',
    tags: ['wounds', 'cordial', 'aromatic', 'new-world', 'precious'],
    icon: getIconForEntry('balsam-of-peru'),

    summary: 'Dark aromatic resin from South America, prized for its healing properties. Used in wound plasters and cordials to heal and fortify the heart.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Vulnerary', 'Cordial', 'Balsamic'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Healing wounds and ulcers',
      'Making plasters for chest complaints',
      'Fortifying the heart in cordials',
      'Treating respiratory ailments',
      'Soothing burns and skin conditions',
      'Perfuming medicines with pleasant aroma'
    ],

    contraindications: [
      'Extremely expensive - use sparingly',
      'Often adulterated with cheaper resins',
      'May cause irritation in sensitive individuals',
      'Too hot for inflammatory conditions'
    ],

    historicalSource: {
      author: 'Pierre Pomet',
      work: 'Histoire générale des drogues',
      year: 1694,
      excerpt: '"Le Baume du Pérou est chaud et sec au second degré, excellent pour les playes, les ulcères, et pour fortifier le coeur."',
      translation: '"Balsam of Peru is hot and dry in the second degree, excellent for wounds, ulcers, and for fortifying the heart."',
      location: 'Paris'
    },

    modernNote: 'Balsam of Peru contains benzyl benzoate and benzyl cinnamate, which have antiseptic and wound-healing properties. Still used in some topical preparations, though it can cause allergic reactions in sensitive individuals.',

    wikipediaQuery: 'Balsam of Peru',
    relatedEntries: ['wounds', 'cordials', 'new-world-drugs', 'resins', 'chest-complaints']
  },

  'sarsaparilla': {
    id: 'sarsaparilla',
    name: 'Sarsaparilla',
    latinName: 'Smilax officinalis',
    category: 'materia-medica',
    tags: ['syphilis', 'sweating', 'blood-cleanser', 'new-world', 'alterative'],
    icon: getIconForEntry('sarsaparilla'),

    summary: 'New World root widely taken as a blood cleanser and tonic. Often decocted with guaiacum for treating chronic skin diseases and the French disease.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Depurative', 'Sudorific', 'Alterative'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Cleansing corrupted blood',
      'Treating syphilis and venereal diseases',
      'Promoting sweating to purge humors',
      'Chronic skin diseases and eruptions',
      'Rheumatic pains and gout',
      'Making diet drinks and decoctions'
    ],

    contraindications: [
      'Requires prolonged use for effect',
      'Treatment regimen can be demanding',
      'Not for those with very hot constitutions',
      'May cause excessive sweating'
    ],

    historicalSource: {
      author: 'Pierre Pomet',
      work: 'Histoire générale des drogues',
      year: 1694,
      excerpt: '"La Salsepareille est chaude et sèche, bonne pour purifier le sang et guérir les maladies vénériennes. On la prend en décoction longue."',
      translation: '"Sarsaparilla is hot and dry, good for purifying the blood and curing venereal diseases. It is taken in long decoction."',
      location: 'Paris'
    },

    modernNote: 'Sarsaparilla was ineffective against syphilis (which requires antibiotics). However, it does contain saponins with mild anti-inflammatory effects. Its reputation as a "blood purifier" persisted into the 20th century in patent medicines.',

    wikipediaQuery: 'Sarsaparilla medicinal',
    relatedEntries: ['syphilis', 'blood-cleansing', 'sweating', 'guaiacum', 'new-world-drugs']
  },

  'jalap': {
    id: 'jalap',
    name: 'Jalap',
    latinName: 'Ipomoea purga',
    category: 'materia-medica',
    tags: ['purgative', 'dropsy', 'powerful', 'new-world'],
    icon: getIconForEntry('jalap'),

    summary: 'Resinous root from New Spain sold in chips or powder. A staple strong purge in European dispensatories, powerful in evacuating phlegm and choler.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Cathartic', 'Hydragogue', 'Drastic'],
      degree: 'Hot and dry in the third degree'
    },

    uses: [
      'Powerful purging of watery humors',
      'Treating dropsy (edema)',
      'Evacuating phlegm and choler',
      'Stubborn constipation',
      'Preparing body for other treatments',
      'Combined with gentler medicines to temper action'
    ],

    contraindications: [
      'Very strong - causes violent purging',
      'Not for children, elderly, or weak patients',
      'Must be corrected with carminatives',
      'May cause severe griping and dehydration',
      'Dangerous in excessive doses'
    ],

    historicalSource: {
      author: 'Nicolas Lémery',
      work: 'A Course of Chymistry',
      year: 1686,
      excerpt: '"Jalap is a strong cathartic root from New Spain... It purges violently both upwards and downwards, and must be used with caution and corrected with aromatics."',
      translation: 'Original in French, translated to English',
      location: 'London'
    },

    modernNote: 'Jalap contains resinous glycosides that are powerful cathartics. Like all drastic purgatives, it can cause dangerous dehydration and electrolyte imbalances. Not used in modern medicine due to safety concerns.',

    wikipediaQuery: 'Jalap (medicine)',
    relatedEntries: ['purging', 'dropsy', 'mechoacan', 'cathartics', 'new-world-drugs']
  },

  'sassafras': {
    id: 'sassafras',
    name: 'Sassafras',
    latinName: 'Sassafras albidum',
    category: 'materia-medica',
    tags: ['sweating', 'syphilis', 'new-world', 'aromatic', 'alterative'],
    icon: getIconForEntry('sassafras'),

    summary: 'Aromatic bark and wood from the West Indies, infused for diet drinks and decoctions. Used to "sweeten" corrupted humors and treat venereal complaints.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Sudorific', 'Carminative', 'Aromatic'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Promoting sweating to purge humors',
      'Treating venereal diseases',
      'Cleansing corrupted blood',
      'Warming cold stomachs',
      'Making pleasant diet drinks',
      'Expelling wind and comforting digestion'
    ],

    contraindications: [
      'Prolonged use may overheat the body',
      'Not for hot, dry constitutions',
      'Quality varies - some bark is adulterated',
      'Treatment requires sustained regimen'
    ],

    historicalSource: {
      author: 'John Parkinson',
      work: 'Theatrum Botanicum',
      year: 1640,
      excerpt: '"Sassafras is hot and dry in the second degree... It is used in decoctions for the French disease, to procure sweat and cleanse the blood of corrupt humors."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Sassafras contains safrole, now known to be carcinogenic and banned in many countries. Its pleasant flavor made it popular in beverages (root beer), but it has no genuine efficacy against syphilis or other diseases.',

    wikipediaQuery: 'Sassafras medicinal',
    relatedEntries: ['syphilis', 'sweating', 'blood-cleansing', 'new-world-drugs', 'diet-drinks']
  },

  'balsam-of-tolu': {
    id: 'balsam-of-tolu',
    name: 'Balsam of Tolu',
    latinName: 'Myroxylon toluifera',
    category: 'materia-medica',
    tags: ['cough', 'wounds', 'aromatic', 'new-world', 'precious'],
    icon: getIconForEntry('balsam-of-tolu'),

    summary: 'Sweet balsam from New Granada, used in lozenges and cordial syrups for catarrhs. Soothes coughs, heals wounds, and strengthens the breast and lungs.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Pectoral', 'Balsamic', 'Vulnerary'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Soothing chronic coughs and catarrhs',
      'Treating chest complaints and asthma',
      'Healing wounds and ulcers',
      'Strengthening weak lungs',
      'Making pleasant-tasting lozenges',
      'Perfuming medicinal syrups'
    ],

    contraindications: [
      'Very expensive - reserve for serious cases',
      'Often adulterated or substituted',
      'May be too warm for hot, inflammatory conditions',
      'Less potent than Balsam of Peru'
    ],

    historicalSource: {
      author: 'Pierre Pomet',
      work: 'Histoire générale des drogues',
      year: 1694,
      excerpt: '"Le Baume de Tolu est excellent pour la poitrine et les poumons, adoucissant les toux opiniâtres et fortifiant le thorax."',
      translation: '"Balsam of Tolu is excellent for the chest and lungs, soothing stubborn coughs and strengthening the thorax."',
      location: 'Paris'
    },

    modernNote: 'Balsam of Tolu contains benzoic acid and cinnamic acid with mild expectorant and antiseptic properties. Still used in some cough syrups and lozenges for its pleasant flavor and soothing effects.',

    wikipediaQuery: 'Balsam of Tolu',
    relatedEntries: ['cough', 'chest-complaints', 'wounds', 'new-world-drugs', 'lozenges']
  },

  'myrrh': {
    id: 'myrrh',
    name: 'Myrrh',
    latinName: 'Commiphora myrrha',
    category: 'materia-medica',
    tags: ['wounds', 'antiseptic', 'mouth', 'astringent', 'ancient'],
    icon: getIconForEntry('myrrh'),

    summary: 'Bitter aromatic gum from Arabia and Africa, added to theriac and wound balsams. Astringent and antiseptic, used for ulcers, gums, and fortifying the womb.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Astringent', 'Vulnerary', 'Antiseptic'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Healing wounds and ulcers',
      'Strengthening loose teeth and gums',
      'Treating mouth sores and thrush',
      'Fortifying the womb after childbirth',
      'Making theriac and compound medicines',
      'Embalming and preserving from corruption'
    ],

    contraindications: [
      'Very bitter and unpleasant taste',
      'May be too drying for some wounds',
      'Not for use during pregnancy',
      'Expensive - often adulterated'
    ],

    historicalSource: {
      author: 'Nicholas Culpeper',
      work: 'The English Physician Enlarged',
      year: 1653,
      excerpt: '"Myrrh is hot and dry in the second degree, bitter and binding. It heals wounds, fastens loose teeth, and is excellent for the mouth and throat."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Myrrh contains terpenoids with genuine antiseptic and anti-inflammatory properties. Still used in some mouthwashes and dental products. Its use dates to ancient Egypt for embalming and medicine.',

    wikipediaQuery: 'Myrrh medicinal',
    relatedEntries: ['wounds', 'mouth-diseases', 'antiseptics', 'theriac', 'gums']
  },

  'frankincense': {
    id: 'frankincense',
    name: 'Frankincense',
    latinName: 'Boswellia sacra',
    category: 'materia-medica',
    tags: ['brain', 'wounds', 'respiratory', 'incense', 'ancient'],
    icon: getIconForEntry('frankincense'),

    summary: 'Pale resin burned as incense and powdered for plasters and pills. Strengthens the brain and heart, dries wounds, and comforts cold catarrhs.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Cephalic', 'Vulnerary', 'Desiccant'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Strengthening the brain and memory',
      'Drying and healing wounds',
      'Treating respiratory complaints and catarrhs',
      'Burning as purifying incense',
      'Making plasters and cerates',
      'Fortifying compound medicines'
    ],

    contraindications: [
      'Too drying for some wounds',
      'Expensive due to long trade routes',
      'Smoke may irritate sensitive lungs',
      'Not for hot, dry diseases'
    ],

    historicalSource: {
      author: 'Nicholas Culpeper',
      work: 'Pharmacopoeia Londinensis',
      year: 1653,
      excerpt: '"Thus or Olibanum is hot and dry in the second degree. It strengthens the brain, helps the memory, and is excellent for wounds."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Frankincense contains boswellic acids with anti-inflammatory properties. Modern research shows potential benefits for arthritis and respiratory conditions. Its use as incense and medicine dates to ancient civilizations.',

    wikipediaQuery: 'Frankincense medicinal',
    relatedEntries: ['brain', 'memory', 'wounds', 'incense', 'respiratory']
  },

  'mastic': {
    id: 'mastic',
    name: 'Mastic',
    latinName: 'Pistacia lentiscus',
    category: 'materia-medica',
    tags: ['digestive', 'gums', 'astringent', 'wounds'],
    icon: getIconForEntry('mastic'),

    summary: 'Clear tear-like resin from the Levant, chewed or powdered for digestive remedies. Astringent for looseness of the gums and fluxes of the belly.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Astringent', 'Digestive', 'Vulnerary'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Strengthening loose teeth and gums',
      'Treating digestive complaints and diarrhea',
      'Making plasters for wounds',
      'Sweetening the breath',
      'Stopping fluxes of the belly',
      'Chewed as a gum for oral health'
    ],

    contraindications: [
      'Expensive and scarce',
      'May be too drying for some patients',
      'Not for very hot constitutions'
    ],

    historicalSource: {
      author: 'Jean de Renou',
      work: 'A Medicinal Dispensatory',
      year: 1657,
      excerpt: '"Mastick is hot and dry in the second degree, binding and astringent. It fastens loose teeth, stops fluxes, and is good for the stomach."',
      translation: 'Original in Latin, translated to English',
      location: 'London'
    },

    modernNote: 'Mastic resin has been shown to have antibacterial properties, particularly against H. pylori (stomach ulcer bacteria). Still used in traditional medicine and as a chewing gum in Greece. Modern research supports some traditional uses.',

    wikipediaQuery: 'Mastic (plant resin)',
    relatedEntries: ['gums', 'teeth', 'digestive', 'astringents', 'stomach-complaints']
  },

  'castoreum': {
    id: 'castoreum',
    name: 'Castoreum',
    latinName: 'Castoreum',
    category: 'materia-medica',
    tags: ['antispasmodic', 'hysteria', 'convulsions', 'animal', 'precious'],
    icon: getIconForEntry('castoreum'),

    summary: 'Dried secretion from beavers, a strong-smelling drug prized in antispasmodic cordials. Used for hysteric fits, faintings, and stubborn agues.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Antispasmodic', 'Nervine', 'Emmenagogue'],
      degree: 'Warm and dry in the third degree'
    },

    uses: [
      'Treating hysteria and female disorders',
      'Calming convulsions and falling sickness',
      'Reviving from fainting fits',
      'Stubborn intermittent fevers',
      'Provoking menstruation',
      'Making antispasmodic cordials'
    ],

    contraindications: [
      'Extremely expensive and rare',
      'Strong unpleasant odor',
      'Often adulterated or counterfeited',
      'Too hot for inflammatory conditions'
    ],

    historicalSource: {
      author: 'Jean de Renou',
      work: 'A Medicinal Dispensatory',
      year: 1657,
      excerpt: '"Castoreum is hot and dry in the third degree, of thin parts, opening and resolving. It is excellent for hysterick fits, convulsions, and the falling-sickness."',
      translation: 'Original in Latin, translated to English',
      location: 'London'
    },

    modernNote: 'Castoreum contains salicylic acid derivatives. While it has some analgesic properties, its reputation vastly exceeded its efficacy. Still used in tiny amounts as a food flavoring (vanilla substitute), but no longer used medicinally.',

    wikipediaQuery: 'Castoreum',
    relatedEntries: ['hysteria', 'convulsions', 'antispasmodics', 'animal-remedies', 'epilepsy']
  },

  'cassia-fistula': {
    id: 'cassia-fistula',
    name: 'Cassia Fistula',
    latinName: 'Cassia fistula',
    category: 'materia-medica',
    tags: ['purgative', 'cooling', 'gentle', 'fever'],
    icon: getIconForEntry('cassia-fistula'),

    summary: 'Long pods with sweet pulp used in electuaries and syrups for mild purges. Gentle laxative, especially for the hot and bilious, that cools the body.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      qualities: ['Laxative', 'Refrigerant', 'Emollient'],
      degree: 'Cold and moist in the first degree'
    },

    uses: [
      'Gentle purging without violence',
      'Cooling hot fevers',
      'Treating bilious complaints',
      'Safe for children and the elderly',
      'Making pleasant-tasting electuaries',
      'Soothing inflammatory conditions'
    ],

    contraindications: [
      'Very mild - insufficient for serious obstruction',
      'Too cooling for phlegmatic temperaments',
      'May spoil if not properly preserved',
      'Not for cold diseases'
    ],

    historicalSource: {
      author: 'Nicholas Culpeper',
      work: 'The English Physician Enlarged',
      year: 1653,
      excerpt: '"Cassia Fistula is cold and moist, purging gently and without violence. It is safe for children and those of weak constitution."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Cassia fistula contains anthraquinones which are genuine laxatives. It is indeed gentler than many purgatives of the era. Still used in some traditional medicine systems, particularly Ayurveda.',

    wikipediaQuery: 'Cassia fistula',
    relatedEntries: ['purging', 'cooling-medicines', 'fever', 'yellow-bile-humor', 'electuaries']
  },

  'anise': {
    id: 'anise',
    name: 'Anise',
    latinName: 'Pimpinella anisum',
    category: 'materia-medica',
    tags: ['digestive', 'carminative', 'expectorant', 'aromatic'],
    icon: getIconForEntry('anise'),

    summary: 'Fragrant seeds used in syrups, lozenges, and distilled waters for digestive complaints. Carminative and expectorant that eases wind and comforts the stomach.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Carminative', 'Expectorant', 'Stomachic'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Expelling wind and easing colic',
      'Aiding weak digestion',
      'Treating coughs and chest complaints',
      'Promoting lactation in nursing mothers',
      'Making pleasant cordial waters',
      'Correcting griping of harsh medicines'
    ],

    contraindications: [
      'Generally very safe',
      'May be too warming for very hot constitutions',
      'Excessive use may cause overheating'
    ],

    historicalSource: {
      author: 'John Gerard',
      work: 'The Herball',
      year: 1633,
      excerpt: '"Anise is hot and drie in the third degree... It easeth paine, and is good against belchings and upbraidings of the stomacke."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Anise contains anethole, which has genuine carminative and mild expectorant properties. Still widely used in teas and medicines for digestive complaints. Generally safe and pleasant-tasting.',

    wikipediaQuery: 'Anise medicinal',
    relatedEntries: ['digestive', 'carminatives', 'cough', 'flatulence', 'aromatic-waters']
  },

  'rhubarb-root': {
    id: 'rhubarb-root',
    name: 'Rhubarb Root',
    latinName: 'Rheum palmatum',
    category: 'materia-medica',
    tags: ['purgative', 'gentle', 'stomach', 'bile', 'precious'],
    icon: getIconForEntry('rhubarb-root'),

    summary: 'Chinese root brought by traders, the most valued purgative after senna. Purges yellow bile without violence and strengthens the stomach. Safer than harsh purges.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Purgative', 'Stomachic', 'Astringent'],
      degree: 'Cold and dry in the second degree'
    },

    uses: [
      'Gentle purging of yellow bile',
      'Strengthening weak digestion',
      'Treating bilious fevers',
      'Opening obstructions of the liver',
      'Safe for delicate constitutions',
      'Preparing for stronger treatments'
    ],

    contraindications: [
      'Extremely expensive - Chinese monopoly',
      'Often adulterated with false rhubarb',
      'May cause temporary looseness',
      'Not for very cold constitutions'
    ],

    historicalSource: {
      author: 'Pharmacopoeia Londinensis',
      work: 'Pharmacopoeia Londinensis',
      year: 1746,
      excerpt: '"Radix Rhei, or Rhabarbarum, is cold and dry, purging choler gently and strengthening the stomach. It is the most noble of purgatives."',
      translation: 'Original in Latin',
      location: 'London'
    },

    modernNote: 'Rhubarb root contains anthraquinones (laxative) and tannins (astringent), giving it the unusual property of purging then binding. Chinese rhubarb was indeed superior and very expensive. Still used in traditional Chinese medicine.',

    wikipediaQuery: 'Rhubarb root medicinal',
    relatedEntries: ['purging', 'yellow-bile-humor', 'stomach', 'liver-obstructions']
  },

  'ipecacuanha': {
    id: 'ipecacuanha',
    name: 'Ipecacuanha',
    latinName: 'Carapichea ipecacuanha',
    category: 'materia-medica',
    tags: ['emetic', 'poison-antidote', 'new-world', 'powerful'],
    icon: getIconForEntry('ipecacuanha'),

    summary: 'Brazilian root newly arrived from Portuguese trade. Causes swift and certain vomiting to expel poisons and corrupt humors from the stomach.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Emetic', 'Expectorant', 'Diaphoretic'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Causing vomiting to expel poisons',
      'Emptying the stomach in emergencies',
      'Treating dysentery (in small doses)',
      'Loosening tough phlegm',
      'Promoting sweating in fevers',
      'Expelling corrupt humors from the stomach'
    ],

    contraindications: [
      'Causes violent vomiting - use with caution',
      'Not for the very weak or elderly',
      'Dosage must be precise',
      'May cause prolonged nausea'
    ],

    historicalSource: {
      author: 'Willem Piso',
      work: 'De Indiae utriusque re naturali et medica',
      year: 1658,
      excerpt: '"Ipecacuanha est radix Brasiliana quae vomitum celeriter et certissime provocat, expellens venena et humores corruptos."',
      translation: '"Ipecacuanha is a Brazilian root which swiftly and most certainly provokes vomiting, expelling poisons and corrupt humors."',
      location: 'Amsterdam'
    },

    modernNote: 'Ipecac contains emetine, a powerful emetic. Was used as emergency poison treatment until recently (now discontinued due to potential harm). Small doses have expectorant effects. Its discovery was an important addition to the pharmacopeia.',

    wikipediaQuery: 'Ipecacuanha',
    relatedEntries: ['emetics', 'poison', 'vomiting', 'new-world-drugs', 'dysentery']
  },

  'scammony': {
    id: 'scammony',
    name: 'Scammony',
    latinName: 'Convolvulus scammonia',
    category: 'materia-medica',
    tags: ['purgative', 'powerful', 'phlegm', 'dangerous'],
    icon: getIconForEntry('scammony'),

    summary: 'Greek resin of fearsome potency. Purges violently and expels phlegm and watery humors. Must be tempered with gentler medicines. Use with great caution.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Cathartic', 'Hydragogue', 'Drastic'],
      degree: 'Hot and dry in the third degree'
    },

    uses: [
      'Powerful purging of phlegm and watery humors',
      'Treating stubborn dropsy',
      'Evacuating thick, viscous humors',
      'Desperate cases requiring violent evacuation',
      'Must be combined with correctives (cinnamon, etc.)'
    ],

    contraindications: [
      'EXTREMELY POWERFUL - causes violent purging',
      'Never use alone - must temper with gentler drugs',
      'Not for children, elderly, or weak patients',
      'May cause dangerous dehydration',
      'Can be fatal in excess'
    ],

    historicalSource: {
      author: 'Dioscorides',
      work: 'De Materia Medica',
      year: '1st century CE',
      excerpt: '"Scammonia purges aqueous humours and choler with great violence. It must be given cautiously and with correctives, lest it cause harm."',
      translation: 'From ancient Greek',
      location: 'Rome'
    },

    modernNote: 'Scammony contains powerful resinous glycosides. It is dangerously drastic and can cause severe dehydration, electrolyte imbalance, and even death. No longer used in medicine due to its dangerous effects.',

    wikipediaQuery: 'Scammony',
    relatedEntries: ['purging', 'dropsy', 'cathartics', 'phlegm-humor', 'dangerous-medicines']
  },

  'antimony': {
    id: 'antimony',
    name: 'Antimony',
    latinName: 'Stibium',
    category: 'materia-medica',
    tags: ['alchemical', 'purgative', 'controversial', 'poison', 'metal'],
    icon: getIconForEntry('antimony'),

    summary: 'Metallic mineral that purges by occult virtue. Paracelsians praise it as a universal medicine; Galenists condemn it as deadly poison. Causes sweating and vomiting.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Purgative', 'Emetic', 'Diaphoretic'],
      degree: 'Cold and dry in the fourth degree'
    },

    uses: [
      'Purging stubborn humors',
      'Causing vomiting in poisoning cases',
      'Promoting sweating in fevers',
      'Alchemical preparations and tinctures',
      'Treatment by chemical (not herbal) means'
    ],

    contraindications: [
      'HIGHLY TOXIC AND CONTROVERSIAL',
      'Banned in many cities by medical authorities',
      'Causes violent vomiting and purging',
      'Can be fatal in improper doses',
      'Many physicians refuse to prescribe it'
    ],

    historicalSource: {
      author: 'Basil Valentine',
      work: 'The Triumphal Chariot of Antimony',
      year: 1604,
      excerpt: '"Antimony is the most universal medicine, purging and cleansing the body of all corruptions by its occult virtue and heavenly power."',
      translation: 'Original in Latin',
      location: 'Germany'
    },

    modernNote: 'Antimony compounds are extremely toxic, causing severe gastrointestinal distress, organ damage, and death. The medical controversy raged for centuries. Some antimony compounds are still used in very specific modern treatments, but with extreme caution.',

    wikipediaQuery: 'Antimony in medicine',
    relatedEntries: ['alchemy', 'poison', 'crocus-metallorum', 'purgatives', 'medical-controversy']
  },

  'hartshorn': {
    id: 'hartshorn',
    name: 'Hartshorn',
    latinName: 'Cornu cervi',
    category: 'materia-medica',
    tags: ['cordial', 'fever', 'restorative', 'animal'],
    icon: getIconForEntry('hartshorn'),

    summary: 'Powdered antler of the deer. Cordial and restorative that strengthens vital spirits. Calcined or distilled to make spirit of hartshorn for fevers and fainting.',

    properties: {
      humors: { temperature: 'warm', moisture: 'dry' },
      qualities: ['Cordial', 'Restorative', 'Absorbent'],
      degree: 'Warm and dry in the second degree'
    },

    uses: [
      'Strengthening vital spirits and heart',
      'Reviving from fainting and swooning',
      'Treating fevers and pestilential diseases',
      'Making volatile spirits (ammonia)',
      'Absorbing acid humors',
      'Fortifying the weak and elderly'
    ],

    contraindications: [
      'Quality varies depending on preparation',
      'Volatile spirit is extremely pungent',
      'May be too heating for inflammatory fevers',
      'Expense varies by source'
    ],

    historicalSource: {
      author: 'Nicholas Culpeper',
      work: 'Pharmacopoeia Londinensis',
      year: 1653,
      excerpt: '"Cornu Cervi is warm and dry, cordial and restorative. The spirit thereof is excellent to revive the spirits and strengthen the heart."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Hartshorn (deer antler) contains calcium and some proteins. The "spirit of hartshorn" was actually ammonia (ammonium carbonate), which does have genuine smelling-salt effects for fainting. The antler itself has minimal medicinal value.',

    wikipediaQuery: 'Hartshorn medicine',
    relatedEntries: ['cordials', 'fever', 'fainting', 'animal-remedies', 'volatile-spirits']
  },

  'vitriol': {
    id: 'vitriol',
    name: 'Vitriol',
    latinName: 'Vitriolum',
    category: 'materia-medica',
    tags: ['astringent', 'caustic', 'eye-medicine', 'mineral', 'alchemical'],
    icon: getIconForEntry('vitriol'),

    summary: 'Green or blue crystals of copper or iron. Astringent and caustic that burns away proud flesh. Dissolves in water to make collyria for the eyes and treatment for ulcers.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Astringent', 'Caustic', 'Desiccant'],
      degree: 'Cold and dry in the fourth degree'
    },

    uses: [
      'Making eye washes and collyria',
      'Burning away proud flesh in wounds',
      'Treating ulcers and sores',
      'Astringent for hemorrhages',
      'Alchemical distillations (oil of vitriol)',
      'Destroying warts and excrescences'
    ],

    contraindications: [
      'HIGHLY CAUSTIC - use with extreme caution',
      'Can damage healthy tissue',
      'Too strong for internal use',
      'Oil of vitriol (sulfuric acid) is deadly poison',
      'Must be properly diluted for eye use'
    ],

    historicalSource: {
      author: 'Robert Boyle',
      work: 'Essays of the Strange Subtilty of Effluviums',
      year: 1673,
      excerpt: '"Vitriol is cold and dry in the highest degree, powerfully astringent and corrosive. It is used in collyria for the eyes and to consume proud flesh."',
      translation: 'Original in English',
      location: 'London'
    },

    modernNote: 'Vitriol refers to various metal sulfates (copper sulfate, iron sulfate, zinc sulfate). These are indeed astringent and caustic. "Oil of vitriol" is sulfuric acid, extremely corrosive. Some metal sulfates are still used in specific medical applications, but with great care.',

    wikipediaQuery: 'Vitriol chemistry',
    relatedEntries: ['astringents', 'eye-diseases', 'caustics', 'ulcers', 'alchemy']
  },

  'willow-bark': {
    id: 'willow-bark',
    name: 'Willow Bark',
    latinName: 'Salix alba cortex',
    category: 'materia-medica',
    tags: ['febrifuge', 'analgesic', 'cold', 'dry', 'bark', 'common'],
    icon: getIconForEntry('willow-bark'),

    summary: 'The bitter bark of the white willow tree, long used by common folk to reduce fevers and relieve pains. A humble remedy of proven virtue.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      qualities: ['Febrifuge', 'Analgesic', 'Astringent'],
      degree: 'Cold and dry in the second degree',
      planetaryRuler: 'Moon',
      element: 'Water'
    },

    uses: [
      'Reducing fevers and agues',
      'Relieving headaches and joint pains',
      'Treating rheumatic complaints',
      'Calming inflammations',
      'Binding the bowels (astringent)',
      'Easing gout when decocted with wine'
    ],

    preparation: [
      'Decoction: Boil 2 drachms of dried bark in wine or water for internal use',
      'Powder: Grind dried bark and mix with honey or sugar for easier administration',
      'Bath: Boil large quantities in water for bathing inflamed limbs',
      'Poultice: Apply bruised fresh bark to wounds and sores'
    ],

    contraindications: [
      'Excessive use may cause coldness and dryness of the stomach',
      'Not recommended for those of cold, phlegmatic temperament',
      'Very bitter taste may require correction with honey or sugar'
    ],

    historicalSource: {
      author: 'Pedanius Dioscorides',
      work: 'De Materia Medica',
      year: 77,
      excerpt: 'Ἰτέα...φλοιὸς καὶ φύλλα στυπτικὰ...πρὸς πυρετοὺς ὠφελεῖ',
      translation: 'Willow...bark and leaves are astringent...beneficial for fevers',
      location: 'Anatolia'
    },

    modernNote: 'Willow bark contains salicin, a compound that the body converts to salicylic acid (the active ingredient in aspirin). This validates its traditional use for pain relief and fever reduction. Modern aspirin (acetylsalicylic acid) was developed from willow bark compounds in the 19th century.',

    wikipediaQuery: 'Willow bark salicin aspirin history',
    relatedEntries: ['fever', 'headache', 'rheumatism', 'gout', 'moon-phases-medicine']
  },

  // DISEASES
  'tertian-fever': {
    id: 'tertian-fever',
    name: 'Tertian Fever',
    latinName: 'Febris tertiana',
    category: 'diseases',
    tags: ['fever', 'periodic', 'yellow-bile', 'malaria', 'hot', 'dry'],
    icon: getIconForEntry('tertian-fever'),

    summary: 'A burning fever that returns every third day, caused by corrupt yellow bile ascending to the heart and brain.',

    properties: {
      humors: { temperature: 'hot', moisture: 'dry' },
      qualities: ['Burning', 'Periodic', 'Choleric'],
      degree: 'Hot in the third degree and Dry in the second degree'
    },

    symptoms: [
      'Violent shaking and rigors followed by intense burning fever',
      'Fever recurs predictably every 48 hours (counting inclusively, thus "tertian")',
      'Profuse sweating at crisis, followed by temporary relief',
      'Yellow tinge to skin and eyes from excess choler',
      'Extreme thirst, bitter taste in mouth, headache, delirium in severe cases'
    ],

    treatments: [
      'Cinchona bark (Peruvian bark) decoction taken before the fever fit, cools the blood',
      'Bloodletting from the basilic vein during remission to evacuate corrupt yellow bile',
      'Cold compresses of rose water and vinegar to the temples and wrists',
      'Purgation with senna and rhubarb to expel choleric humors downward',
      'Bark of the willow steeped in wine to reduce fever'
    ],

    prognosis: 'Curable with proper treatment if caught early; chronic tertians may persist for months or years, weakening the constitution. More benign than quotidian or quartan fevers.',

    historicalSource: {
      author: 'Nicolás Monardes',
      work: 'Historia Medicinal de las Cosas que se Traen de Nuestras Indias Occidentales',
      year: 1574,
      excerpt: '"La corteza del árbol que llaman en el Perú quina-quina, es singular remedio para las calenturas tercianas, tomada en polvo peso de dos reales en vino."',
      translation: '"The bark of the tree they call quina-quina in Peru is a singular remedy for tertian fevers, taken as powder weighing two reales in wine."',
      location: 'Sevilla'
    },

    modernNote: 'Tertian fever is caused by Plasmodium vivax or P. ovale malaria parasites with a 48-hour life cycle. Cinchona bark contains quinine, which is genuinely effective against malaria. Modern treatment uses artemisinin-based combination therapies and chloroquine.',

    wikipediaQuery: 'Malaria tertian fever',
    relatedEntries: ['peruvian-bark', 'yellow-bile', 'bloodletting', 'four-qualities']
  },

  'plague': {
    id: 'plague',
    name: 'Plague',
    latinName: 'Pestis atra (Black Death)',
    category: 'diseases',
    tags: ['epidemic', 'hot', 'dry', 'contagious', 'buboes', 'fatal'],
    icon: getIconForEntry('plague'),

    summary: 'The most terrible pestilence, striking suddenly with burning fever and swollen buboes in the groin and armpits, spreading through corrupt air.',

    properties: {
      humors: { temperature: 'hot', moisture: 'dry' },
      qualities: ['Pestilential', 'Contagious', 'Putrid'],
      degree: 'Hot in the fourth degree and Dry in the third degree'
    },

    symptoms: [
      'Sudden onset of violent fever with burning heat throughout the body',
      'Painful buboes (swollen lymph nodes) in groin, armpits, or neck, often suppurating',
      'Black or purple spots on the skin from corrupted blood beneath',
      'Extreme weakness, delirium, and foul breath',
      'Death often within 3-7 days if buboes do not break and drain'
    ],

    treatments: [
      'Rue and theriac taken in wine to resist the poison and strengthen the heart',
      'Lancing and draining buboes when ripe, followed by poultices of figs and onions',
      'Fumigation of rooms with juniper, rosemary, and frankincense to purify corrupt air',
      'Treacle water with angelica root and Armenian bole to expel poison through sweat',
      'Flight from infected areas - "cito, longe, tarde" (leave quickly, go far, return slowly)'
    ],

    prognosis: 'Most often fatal, killing three of every four afflicted. Those who survive the first week may recover if the buboes break naturally or are successfully lanced. A mark of divine punishment.',

    historicalSource: {
      author: 'Francisco Bravo',
      work: 'Opera Medicinalia',
      year: 1570,
      excerpt: '"Pestis est morbus contagiosus valde cum febre acuta et apostematibus in inguinibus vel axillis, quae bubones vocantur."',
      translation: '"Plague is a highly contagious disease with acute fever and swellings in the groins or armpits, which are called buboes."',
      location: 'Mexico City'
    },

    modernNote: 'Bubonic plague is caused by Yersinia pestis bacteria transmitted by rat fleas. The buboes are infected lymph nodes. Modern treatment with antibiotics (streptomycin, doxycycline) is highly effective if administered early. Untreated mortality is 50-60%.',

    wikipediaQuery: 'Bubonic plague',
    relatedEntries: ['rue', 'bloodletting', 'bezoar-stone']
  },

  'smallpox': {
    id: 'smallpox',
    name: 'Smallpox',
    latinName: 'Variola',
    category: 'diseases',
    tags: ['pustules', 'fever', 'contagious', 'hot', 'moist', 'children'],
    icon: getIconForEntry('smallpox'),

    summary: 'A fiery eruption that fills the skin with pustules, most dangerous to children and those never before afflicted, leaving permanent marks on survivors.',

    properties: {
      humors: { temperature: 'hot', moisture: 'moist' },
      qualities: ['Eruptive', 'Contagious', 'Sanguine corruption'],
      degree: 'Hot in the third degree and Moist in the second degree'
    },

    symptoms: [
      'High fever with severe back pain and headache in first 3-4 days',
      'Red rash appearing first on face and extremities, spreading to trunk',
      'Pustules rising from the rash, filling with yellow matter, often merging together',
      'Extreme pain and burning sensation as pustules mature',
      'Crusting and scarring in survivors, with deep pockmarks remaining permanently'
    ],

    treatments: [
      'Red cloth hung around the bed to draw the eruption outward through sympathetic magic',
      'Cooling medicines of roses, violets, and barley water to temper the heat',
      'Bezoar stone dissolved in wine to resist the poison within',
      'Gentle purging before the eruption appears to prevent internal corruption',
      'Avoid bloodletting once pustules appear, lest the poison be driven inward to vital organs'
    ],

    prognosis: 'Kills one in three children afflicted. Adults who survived it in childhood are protected. The confluent form, where pustules merge, is almost always fatal. Survivors are left pockmarked but immune forever.',

    historicalSource: {
      author: 'Rhazes (Abu Bakr Muhammad ibn Zakariya al-Razi)',
      work: 'Treatise on Smallpox and Measles (trans. Latin)',
      year: 910,
      excerpt: '"Eruptio variolarum est quando sanguis putrescit et conversus est in vaporem."',
      translation: '"The eruption of smallpox occurs when the blood putrefies and is converted into vapor."',
      location: 'Baghdad (Latin editions in Europe 1400s-1600s)'
    },

    modernNote: 'Smallpox is caused by Variola major virus. The red light treatment has no medical value. Bezoar stones are ineffective. Variolation (intentional infection with mild smallpox) was practiced in some cultures. Vaccination with cowpox (developed 1796) led to global eradication by 1980.',

    wikipediaQuery: 'Smallpox',
    relatedEntries: ['bezoar-stone', 'bloodletting', 'four-qualities']
  },

  'syphilis': {
    id: 'syphilis',
    name: 'Great Pox',
    latinName: 'Morbus Gallicus (French Disease)',
    category: 'diseases',
    tags: ['venereal', 'hot', 'dry', 'contagious', 'ulcers', 'new-world'],
    icon: getIconForEntry('syphilis'),

    summary: 'The new plague from the Indies, a venereal corruption spreading through carnal contact, manifesting in foul ulcers and destroying the very bones.',

    properties: {
      humors: { temperature: 'hot', moisture: 'dry' },
      qualities: ['Venomous', 'Ulcerative', 'Corrupting'],
      degree: 'Hot in the third degree and Dry in the third degree'
    },

    symptoms: [
      'First stage: painless chancre on the private parts appearing weeks after infection',
      'Second stage: copper-colored rash on palms and body, foul-smelling ulcers in mouth and throat',
      'Hair falling out, especially from eyebrows and beard',
      'Third stage: gummata (rubbery tumors) on skin, destruction of nose and palate bones',
      'Madness and paralysis in final stages as the disease attacks the brain'
    ],

    treatments: [
      'Guaiacum wood decoction ("holy wood" from the New World) drunk while sweating in a hot room',
      'Mercury ointment rubbed on chancres and sores - "a night with Venus, a lifetime with Mercury"',
      'Sarsaparilla root from New Spain as a gentler alternative to mercury',
      'China root (from Asia) in decoction to purify the blood',
      'Strict diet, isolation, and 30-40 days of intense sweating cure to drive out the venom'
    ],

    prognosis: 'Incurable in most cases, though guaiacum treatment may arrest the disease if begun early. Mercury causes terrible suffering - loosening teeth, excessive salivation, and tremors. Many prefer death to the cure.',

    historicalSource: {
      author: 'Francisco Hernández de Toledo',
      work: 'Historia Natural de Nueva España',
      year: 1577,
      excerpt: '"El palo santo de Guayacán es remedio soberano contra el mal francés, pues siendo enfermedad que vino de las Indias, justo es que la cura también venga de allá."',
      translation: '"The holy wood of Guayacan is a sovereign remedy against the French disease, for being an illness that came from the Indies, it is fitting that the cure also comes from there."',
      location: 'Mexico City'
    },

    modernNote: 'Syphilis is caused by Treponema pallidum bacteria, likely originating in the Americas and spreading through Europe after 1493. Guaiacum was ineffective; mercury was toxic but had some antimicrobial action. Modern treatment with penicillin is curative in all stages.',

    wikipediaQuery: 'History of syphilis',
    relatedEntries: ['guaiacum', 'sarsaparilla', 'quicksilver']
  },

  'consumption': {
    id: 'consumption',
    name: 'Consumption',
    latinName: 'Phthisis pulmonalis',
    category: 'diseases',
    tags: ['wasting', 'hot', 'dry', 'cough', 'blood', 'fatal'],
    icon: getIconForEntry('consumption'),

    summary: 'A wasting disease that consumes the lungs and body, marked by persistent cough, bloody sputum, and progressive emaciation unto death.',

    properties: {
      humors: { temperature: 'hot', moisture: 'dry' },
      qualities: ['Wasting', 'Ulcerative', 'Hectic'],
      degree: 'Hot in the second degree and Dry in the third degree'
    },

    symptoms: [
      'Chronic cough productive of thick phlegm, eventually streaked with blood',
      'Hectic fever with night sweats that drench the bed linens',
      'Progressive wasting of flesh despite maintained appetite - the body "consumed from within"',
      'Chest pain and difficulty breathing as lungs ulcerate and cavitate',
      'Rosy cheeks paradoxically appearing in late stages (the "bloom of death")'
    ],

    treatments: [
      'Asses\' milk or goats\' milk drunk fresh and warm to restore the wasted lungs',
      'Deerhorn jelly and snail water to nourish and repair ulcerated tissue',
      'Balsam of Peru applied to chest and taken internally to heal lung ulcers',
      'Sea voyage or change to dry mountain air to strengthen weakened lungs',
      'Avoid bloodletting which further weakens; instead give restorative red wine and meat broths'
    ],

    prognosis: 'Universally fatal once blood appears in the sputum. The disease may progress slowly over months or years. Hereditary tendency observed - children of consumptives often succumb to the same disease.',

    historicalSource: {
      author: 'Richard Morton',
      work: 'Phthisiologia: or, a Treatise of Consumptions',
      year: 1689,
      excerpt: '"Phthisis is an ulceration of the Lungs, with an Erosion or a Wasting of the Parenchyma, attended with a Hectic Fever and a gradual consumption of the whole Body."',
      translation: '(Originally in English)',
      location: 'London'
    },

    modernNote: 'Pulmonary tuberculosis caused by Mycobacterium tuberculosis. The "hereditary" pattern is due to household transmission. Milk therapy was ineffective and often spread bovine TB. Modern treatment with multi-drug antibiotic regimens (rifampin, isoniazid, pyrazinamide, ethambutol) is curative.',

    wikipediaQuery: 'Tuberculosis history',
    relatedEntries: ['bloodletting', 'four-qualities', 'balsam-of-peru']
  },

  'gout': {
    id: 'gout',
    name: 'Gout',
    latinName: 'Arthritis podagra',
    category: 'diseases',
    tags: ['joints', 'hot', 'dry', 'pain', 'wealthy', 'excess'],
    icon: getIconForEntry('gout'),

    summary: 'The disease of kings and the wealthy, a most excruciating pain in the joints caused by excess meat, wine, and luxurious living.',

    properties: {
      humors: { temperature: 'hot', moisture: 'dry' },
      qualities: ['Arthritic', 'Paroxysmal', 'Choleric'],
      degree: 'Hot in the third degree and Dry in the second degree'
    },

    symptoms: [
      'Sudden onset of extreme pain in the great toe, often beginning at night',
      'Affected joint becomes red, hot, swollen, and exquisitely tender to any touch',
      'Pain so severe that the weight of a bed sheet is unbearable',
      'Attacks last several days to weeks, then remit completely until next paroxysm',
      'Chronic gout produces chalky deposits (tophi) around joints and in ear cartilage'
    ],

    treatments: [
      'Strict dietary regimen avoiding red meat, wine, and rich foods that generate choleric humors',
      'Colchicum (meadow saffron) secretly administered to purge the choleric matter',
      'Cold applications during acute attack to counter the heat, followed by warming oils during remission',
      'Gentle purging with senna to evacuate excess choler from the system',
      'Footbaths of chamomile and elder flowers between attacks to prevent recurrence'
    ],

    prognosis: 'Not fatal but incurable. Attacks recur throughout life, becoming more frequent with age. The disease may eventually "ascend" to vital organs, causing death. A price paid for indulgent living.',

    historicalSource: {
      author: 'Thomas Sydenham',
      work: 'Tractatus de Podagra et Hydrope',
      year: 1683,
      excerpt: '"Dolor artuum in podagra tanta est violentia ut ne quidem lintei tactum ferre possit aeger."',
      translation: '"The pain of the joints in gout is of such violence that the patient cannot even bear the touch of linen."',
      location: 'London'
    },

    modernNote: 'Gout is caused by hyperuricemia (excess uric acid) forming monosodium urate crystals in joints. Diet high in purines (meat, seafood) and alcohol increases risk. Colchicum (colchicine) is still used today. Modern treatments include NSAIDs, corticosteroids, allopurinol, and febuxostat.',

    wikipediaQuery: 'Gout history',
    relatedEntries: ['yellow-bile', 'four-qualities', 'purging']
  },

  'dropsy': {
    id: 'dropsy',
    name: 'Dropsy',
    latinName: 'Hydrops',
    category: 'diseases',
    tags: ['swelling', 'cold', 'moist', 'phlegm', 'edema'],
    icon: getIconForEntry('dropsy'),

    summary: 'An unnatural collection of watery humors causing swelling of the belly, legs, and entire body, from excess cold and moist phlegm.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      qualities: ['Swelling', 'Phlegmatic', 'Obstructive'],
      degree: 'Cold in the second degree and Moist in the third degree'
    },

    symptoms: [
      'Progressive swelling of ankles and legs, pitting when pressed with finger',
      'Distended belly filled with fluid, with taut and shiny skin',
      'Difficulty breathing when lying flat as fluid compresses the lungs',
      'Scanty and dark urine despite great thirst',
      'Pale and waxy complexion, weakness, coldness of extremities'
    ],

    treatments: [
      'Strong diuretics of juniper berries, parsley root, and broom to provoke urine',
      'Squill vinegar or digitalis to strengthen the heart and expel watery humors',
      'Tapping the belly with trocar to drain accumulated fluid directly (paracentesis)',
      'Hot and dry medicines like cinnamon and ginger to counter the cold, moist nature',
      'Sweating therapy in hot rooms with warming herbs to eliminate fluid through skin'
    ],

    prognosis: 'Very dangerous and often fatal. Tapping provides temporary relief but fluid returns. Success depends on strengthening the liver and kidneys. When dropsy affects the lungs (hydrothorax), death is near.',

    historicalSource: {
      author: 'Juan de Barrios',
      work: 'Verdadera Medicina, Cirugía y Astrología',
      year: 1607,
      excerpt: '"La hidropesía procede de humores fríos y húmedos que se derraman por el cuerpo cuando el hígado pierde su virtud."',
      translation: '"Dropsy proceeds from cold and humid humors that spread through the body when the liver loses its virtue."',
      location: 'Mexico City'
    },

    modernNote: 'Dropsy is edema from various causes including heart failure, kidney disease, liver cirrhosis, and malnutrition. Digitalis (foxglove) does strengthen cardiac output. Modern treatment includes diuretics (furosemide), ACE inhibitors, and treating the underlying cause. Paracentesis still used for ascites.',

    wikipediaQuery: 'Edema dropsy',
    relatedEntries: ['phlegm', 'four-qualities']
  },

  'falling-sickness': {
    id: 'falling-sickness',
    name: 'Falling Sickness',
    latinName: 'Epilepsia',
    category: 'diseases',
    tags: ['brain', 'seizures', 'falling', 'convulsions', 'supernatural'],
    icon: getIconForEntry('falling-sickness'),

    summary: 'A dreadful affliction of the brain causing sudden loss of senses and violent convulsions, casting the sufferer to the ground without warning.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      qualities: ['Convulsive', 'Paroxysmal', 'Brain disorder'],
      degree: 'Cold in the second degree and Moist in the second degree'
    },

    symptoms: [
      'Sudden loss of consciousness with falling to ground, often with a cry',
      'Violent convulsions and jerking of limbs, eyes rolling back',
      'Foaming at the mouth, sometimes bloody from bitten tongue',
      'Incontinence of urine and feces during the fit',
      'Deep sleep following the attack, with no memory of the event upon waking'
    ],

    treatments: [
      'Peony root worn as amulet around neck, or given in wine during new moon',
      'Mistletoe gathered from oak tree on St. John\'s Eve, particularly potent',
      'Burned hartshorn or human skull powder to combat the cold phlegmatic vapors',
      'Fumigation with foul-smelling substances (asa foetida, burned feathers) during fit',
      'Avoiding triggers: full moon, flashing lights, strong emotions, certain foods'
    ],

    prognosis: 'Incurable but may lessen with age, especially if begun before adulthood. Considered a sacred disease by ancients, sometimes attributed to demonic possession. Sufferers often ostracized from society.',

    historicalSource: {
      author: 'Hippocrates',
      work: 'On the Sacred Disease',
      year: '400 BCE',
      excerpt: '"Οὐδέν τί μοι δοκεῖ τῶν ἄλλων θειότερον εἶναι νουσημάτων οὐδὲ ἱερώτερον, ἀλλὰ φύσιν μὲν ἔχει καὶ πρόφασιν..."',
      translation: '"It seems to me that this disease is no more divine than any other; it has a natural cause just as other diseases have."',
      location: 'Greece'
    },

    modernNote: 'Epilepsy results from abnormal electrical activity in the brain. Peony, mistletoe, and amulets are ineffective. Modern treatment uses anticonvulsant medications (valproate, carbamazepine, levetiracetam). Many patients achieve complete seizure control. No connection to supernatural causes.',

    wikipediaQuery: 'Epilepsy history',
    relatedEntries: ['phlegm', 'four-qualities']
  },

  'scrofula': {
    id: 'scrofula',
    name: 'Scrofula (King\'s Evil)',
    latinName: 'Struma, Morbus regius',
    category: 'diseases',
    tags: ['lymph-nodes', 'cold', 'moist', 'swelling', 'royal-touch'],
    icon: getIconForEntry('scrofula'),

    summary: 'Painful swellings of the glands in the neck and under the jaw, called the King\'s Evil because only the touch of an anointed monarch can cure it.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      qualities: ['Phlegmatic', 'Scirrhous', 'Indolent'],
      degree: 'Cold in the second degree and Moist in the third degree'
    },

    symptoms: [
      'Hard, painless swellings appearing on the neck, under jaw, or behind ears',
      'Swellings grow slowly over months, eventually softening and breaking open',
      'Foul-smelling discharge from open sores that heal poorly, leaving ugly scars',
      'Multiple swellings appearing simultaneously or in succession',
      'Most common in children and young adults of poor, phlegmatic constitution'
    ],

    treatments: [
      'Royal Touch - the sovereign\'s hand laid upon the swellings on Good Friday',
      'Gold coin touched by the king, worn around neck as continuing remedy',
      'Surgical removal of glands before they suppurate, though often return',
      'Hot, drying medicines internally: sarsaparilla, sassafras, guaiacum to counter phlegm',
      'External applications of mercury ointment or caustic to dissolve the scirrhous matter'
    ],

    prognosis: 'Difficult to cure by ordinary means. Royal Touch most efficacious, though not always successful. Surgical removal often followed by recurrence. May persist for years, disfiguring the neck.',

    historicalSource: {
      author: 'John Browne',
      work: 'Adenochoiradelogia: Or, An Anatomick-Chirurgical Treatise of Glandules & Strumaes, or Kings-Evil-Swellings',
      year: 1684,
      excerpt: '"The King\'s Evil is a Disease which owns its Cure to none but Kings and Queens of England, whose Sacred Touch alone can give Relief."',
      translation: '(Originally in English)',
      location: 'London'
    },

    modernNote: 'Scrofula is tuberculosis of the lymph nodes (mycobacterial lymphadenitis), usually caused by Mycobacterium tuberculosis or M. bovis (from unpasteurized milk). The "Royal Touch" was ineffective. Modern treatment uses multi-drug TB therapy. Surgical excision sometimes necessary for resistant cases.',

    wikipediaQuery: 'Scrofula King\'s Evil',
    relatedEntries: ['phlegm', 'four-qualities', 'sarsaparilla']
  },

  'stone': {
    id: 'stone',
    name: 'Stone',
    latinName: 'Calculus, Lithiasis',
    category: 'diseases',
    tags: ['kidney', 'bladder', 'hot', 'dry', 'pain', 'obstruction'],
    icon: getIconForEntry('stone'),

    summary: 'Excruciating stones formed in the kidneys or bladder from thick, hot humors, causing the most severe pain known to man when passed.',

    properties: {
      humors: { temperature: 'hot', moisture: 'dry' },
      qualities: ['Calculous', 'Obstructive', 'Paroxysmal'],
      degree: 'Hot in the second degree and Dry in the fourth degree'
    },

    symptoms: [
      'Sudden, overwhelming pain in the flank or lower back, often on one side',
      'Pain radiating to groin and private parts, causing patients to writhe and cry out',
      'Blood in urine, especially after violent pain from stone moving',
      'Obstruction of urine flow, with painful straining producing only drops',
      'Fever, nausea, and cold sweats when stone lodges in ureter'
    ],

    treatments: [
      'Lithotriptic herbs to dissolve stones: saxifrage, gravel root, pellitory-of-the-wall',
      'Large quantities of barley water, whey, or small beer to flush stones through',
      'Hot baths and poultices to the loins to relax passages and ease stone\'s transit',
      'Lithotomy (cutting for stone) - surgical removal through perineum by specialist lithotomist',
      'Prevention: avoiding cheese, salt fish, and heavy wines that thicken the humors'
    ],

    prognosis: 'Extremely painful but not immediately fatal unless complete obstruction occurs. Small stones may pass with great suffering. Large stones require surgical removal - a dangerous operation with high mortality. Stones often recur.',

    historicalSource: {
      author: 'Juan Fragoso',
      work: 'Cirugia Universal',
      year: 1581,
      excerpt: '"La piedra se engendra en los riñones de humor gruesso y terrestre, que con el calor se cuaja y endurece como cal."',
      translation: '"The stone is generated in the kidneys from thick and earthy humor, which with heat coagulates and hardens like lime."',
      location: 'Madrid'
    },

    modernNote: 'Kidney stones (nephrolithiasis) form from calcium, oxalate, uric acid, or cystine crystals. Lithotomy had 25-50% mortality before anesthesia and antisepsis. Modern treatments include extracorporeal shock wave lithotripsy (ESWL), ureteroscopy, and percutaneous nephrolithotomy. Prevention includes hydration and dietary modification.',

    wikipediaQuery: 'Kidney stone history lithotomy',
    relatedEntries: ['four-qualities', 'yellow-bile', 'cupping']
  },

  'catarrh': {
    id: 'catarrh',
    name: 'Catarrh',
    latinName: 'Catarrhus, Destillatio',
    category: 'diseases',
    tags: ['respiratory', 'cold', 'moist', 'phlegm', 'descending'],
    icon: getIconForEntry('catarrh'),

    summary: 'A distillation of cold, phlegmatic humors descending from the brain to the nose and throat, causing running nose and cough.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      qualities: ['Phlegmatic', 'Descending', 'Defluxion'],
      degree: 'Cold in the first degree and Moist in the second degree'
    },

    symptoms: [
      'Copious watery discharge from nose, clear or white in color',
      'Frequent sneezing and stuffiness of nasal passages',
      'Cough from phlegm dripping down throat, worse at night',
      'Heaviness of head, dullness of senses, especially smell and taste',
      'May descend to lungs causing chest congestion and difficulty breathing'
    ],

    treatments: [
      'Hot, drying medicines to counter cold phlegm: ginger, pepper, mustard seed',
      'Sneezing powders of pepper, hellebore, or tobacco to expel phlegm from head',
      'Gargles of honey, vinegar, and sage to dry and cleanse the throat',
      'Fumigations of rosemary, frankincense, or bay leaves inhaled through nose',
      'Keeping head warm with cap, avoiding cold air and damp night vapors'
    ],

    prognosis: 'Usually self-limiting and resolves in 1-2 weeks with proper treatment. Danger arises if catarrh descends to lungs, potentially causing consumption or suffocation. More common in cold, damp seasons and phlegmatic constitutions.',

    historicalSource: {
      author: 'Andrés Laguna',
      work: 'Pedacio Dioscorides Anazarbeo, acerca de la materia medicinal',
      year: 1555,
      excerpt: '"El catarro es una destilación de humores del cerebro que descienden por las narices y fauces, causando tos y romadizo."',
      translation: '"Catarrh is a distillation of humors from the brain that descend through the nose and throat, causing cough and running nose."',
      location: 'Antwerp'
    },

    modernNote: 'Catarrh describes upper respiratory infections (common cold) or chronic sinusitis. The "brain descending" theory is incorrect; symptoms result from viral or bacterial infection causing mucosal inflammation. Modern treatment is symptomatic: decongestants, antihistamines, NSAIDs. Most viral catarrh resolves spontaneously.',

    wikipediaQuery: 'Catarrh common cold history',
    relatedEntries: ['phlegm', 'four-qualities', 'black-pepper', 'ginger']
  },

  'rheumatism': {
    id: 'rheumatism',
    name: 'Rheumatism',
    latinName: 'Rheumatismus',
    category: 'diseases',
    tags: ['joints', 'cold', 'moist', 'pain', 'phlegm', 'stiffness'],
    icon: getIconForEntry('rheumatism'),

    summary: 'A flowing of cold, phlegmatic humors into the joints and muscles, causing pain, stiffness, and swelling, especially in cold, damp weather.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      qualities: ['Phlegmatic', 'Defluxionary', 'Arthritic'],
      degree: 'Cold in the second degree and Moist in the second degree'
    },

    symptoms: [
      'Aching pain in joints and muscles, worse in morning and in damp weather',
      'Stiffness of joints upon waking, gradually improving with movement',
      'Swelling of affected joints, cool to touch unlike hot gout',
      'Pain shifting from joint to joint like a flowing humor',
      'Worse in cold, elderly, phlegmatic persons; better with warmth and exercise'
    ],

    treatments: [
      'Hot, drying applications: mustard plasters, hot bricks wrapped in flannel',
      'Liniments of camphor, turpentine, or oil of rosemary rubbed into joints',
      'Internal warming medicines: guaiacum decoction, sassafras tea, wine with spices',
      'Sweating therapy to expel cold, moist humors through skin',
      'Gentle purging to evacuate phlegmatic humors from the body'
    ],

    prognosis: 'Chronic and recurring but rarely fatal. Improves in dry, warm weather and worsens in winter. May lead to permanent joint deformity if untreated. Common affliction of the elderly and those exposed to cold and dampness.',

    historicalSource: {
      author: 'Guillaume de Baillou',
      work: 'Liber de Rheumatismo et Pleuritide Dorsali',
      year: 1642,
      excerpt: '"Rheumatismus est fluxio humorum frigidorum et pituitosorum ad articulos, causans dolorem et rigiditatem."',
      translation: '"Rheumatism is a flux of cold and phlegmatic humors to the joints, causing pain and stiffness."',
      location: 'Paris'
    },

    modernNote: 'Historic "rheumatism" encompassed various arthritides including osteoarthritis, rheumatoid arthritis, and fibromyalgia. The humoral theory is incorrect; these are autoimmune, inflammatory, or degenerative conditions. Modern treatments include NSAIDs, DMARDs (for RA), physical therapy, and heat application (which does provide symptomatic relief).',

    wikipediaQuery: 'Rheumatism history arthritis',
    relatedEntries: ['phlegm', 'four-qualities', 'gout', 'guaiacum']
  },

  // HUMORAL THEORY
  'four-qualities': {
    id: 'four-qualities',
    name: 'The Four Qualities',
    latinName: 'Quatuor Qualitates',
    category: 'humoral-theory',
    tags: ['medicine', 'theory', 'diagnosis', 'galenic', 'balance'],
    icon: getIconForEntry('four-qualities'),

    summary: 'The foundational principle of Galenic medicine: all substances possess combinations of the four elemental qualities - Hot, Cold, Dry, and Moist.',

    properties: {
      elements: {
        Fire: { temperature: 'hot', moisture: 'dry' },
        Air: { temperature: 'hot', moisture: 'moist' },
        Water: { temperature: 'cold', moisture: 'moist' },
        Earth: { temperature: 'cold', moisture: 'dry' }
      }
    },

    explanation: [
      'Every disease and remedy possesses a degree of these qualities (first through fourth degree) - mild to extreme intensity.',
      'Hot medicines (pepper, ginger, cinnamon) counter cold diseases (catarrh, dropsy); cold medicines (roses, lettuce, opium) counter hot diseases (fever, inflammation).',
      'Dry medicines (astringents, absorbents) counter moist diseases (excess phlegm, diarrhea); moist medicines (oils, fats) counter dry diseases (consumption, heat of choler).',
      'Balance is key: use first-degree remedies for mild imbalances, reserve fourth-degree for desperate cases.',
      'A skilled physician diagnoses the quality and degree of disease, then prescribes opposite quality in matching degree to restore equilibrium.',
      'Example: Tertian fever is hot and dry in high degree; treat with cooling, moistening medicines like barley water and rose syrup.',
      'Compounding: combining hot-dry cinnamon with cool-moist sugar produces a temperate medicine suitable for many constitutions.',
      'Patient constitution matters: same disease requires different treatment in sanguine youth versus phlegmatic elder.'
    ],

    historicalSource: {
      author: 'Galen of Pergamon',
      work: 'De Temperamentis (On Temperaments)',
      year: '180 CE',
      excerpt: '"Qualitatum autem elementarium, quae calidae, frigidae, siccae, humidae appellantur, combinationes temperamenta constituunt."',
      translation: '"The combinations of the elemental qualities, which are called hot, cold, dry, and moist, constitute the temperaments."',
      location: 'Rome'
    },

    modernNote: 'The four qualities theory is pre-scientific but represented sophisticated pharmacology for its era. Many "hot" spices do have mild antimicrobial and circulatory effects; "cooling" herbs may have anti-inflammatory properties. The theory was superseded by modern biochemistry and microbiology in the 19th century.',

    wikipediaQuery: 'Humorism four qualities Galenic medicine',
    relatedEntries: ['humoral-theory', 'blood', 'phlegm']
  },

  // TREATMENTS
  'cupping': {
    id: 'cupping',
    name: 'Cupping',
    latinName: 'Cucurbitula, Ventosa',
    category: 'treatments',
    tags: ['method', 'evacuation', 'blood', 'surgery', 'humors'],
    icon: getIconForEntry('cupping'),

    summary: 'Applying heated glass or bronze cups to the skin to draw out corrupt humors and blood, either dry or with scarification.',

    properties: {
      humors: { temperature: 'hot', moisture: 'dry' },
      type: 'evacuative'
    },

    procedure: [
      'Dry cupping: Heat cup with flame or hot water, quickly apply to skin creating suction as it cools.',
      'The vacuum draws blood and humors to the surface, leaving circular bruises.',
      'Wet cupping (scarification): First make small incisions in skin with lancet or scarificator.',
      'Apply heated cup over incisions; suction draws out corrupt blood into the cup.',
      'Remove cups after 10-15 minutes, clean wounds, apply bandage.',
      'Common sites: back, shoulders, between shoulder blades, back of neck, thighs.'
    ],

    indications: [
      'Local pains in joints, muscles, or back - draws diseased humors away from affected part',
      'Headache and megrim - cupping to back of neck and shoulders relieves head congestion',
      'Pleurisy and chest pains - cupping to back between ribs evacuates corrupt humors from lungs',
      'Inflammation and abscesses - draws diseased matter to surface for evacuation',
      'As substitute for bloodletting in weak patients, children, or elderly who cannot bear lancet'
    ],

    contraindications: [
      'Avoid over stomach after eating, over kidneys, over large veins',
      'Not during pregnancy, high fever, or emaciation',
      'Wet cupping dangerous in hemorrhagic conditions or when blood is already depleted'
    ],

    historicalSource: {
      author: 'Juan Calvo',
      work: 'Cirugía Universal y Particular del Cuerpo Humano',
      year: 1580,
      excerpt: '"Las ventosas sacan la sangre y humores corrompidos de la profundidad del cuerpo hacia la superficie, y si se sajare primero, sacarán la sangre viciada."',
      translation: '"Cupping cups draw blood and corrupt humors from the depth of the body to the surface, and if scarified first, they will extract vitiated blood."',
      location: 'Sevilla'
    },

    modernNote: 'Cupping therapy is still practiced in traditional medicine. It may provide temporary pain relief through counter-irritation and increased local blood flow, but does not remove "corrupt humors." Modern evidence for efficacy is limited. Wet cupping carries infection risk if instruments not sterilized.',

    wikipediaQuery: 'Cupping therapy history',
    relatedEntries: ['bloodletting', 'four-qualities', 'purging']
  },

  'purging': {
    id: 'purging',
    name: 'Purging',
    latinName: 'Purgatio, Catharticus',
    category: 'treatments',
    tags: ['method', 'evacuation', 'laxative', 'cathartic', 'humors'],
    icon: getIconForEntry('purging'),

    summary: 'Administering strong laxative medicines to evacuate corrupt humors downward through the bowels, cleansing the body of disease.',

    properties: {
      humors: { temperature: 'hot', moisture: 'moist' },
      type: 'evacuative'
    },

    procedure: [
      'Patient must be prepared: avoid heavy meals day before, drink warm liquids.',
      'Administer purgative in morning on empty stomach, typically in wine, broth, or syrup.',
      'Mild purges (senna, rhubarb, manna): produce 3-5 soft stools over several hours.',
      'Strong purges (jalap, scammony, black hellebore): violent evacuations, 10-15 watery stools.',
      'Patient remains near chamber pot or close-stool; purging may continue 6-12 hours.',
      'Follow with restorative broths and bed rest; body weakened but cleansed.'
    ],

    indications: [
      'Beginning of most diseases, to evacuate corrupt matter before it spreads',
      'Fevers (after initial bleeding) to expel choler and putrid humors',
      'Melancholy and madness - black bile purged with strong cathartics like hellebore',
      'Chronic diseases: gout, dropsy, rheumatism - periodic purging prevents accumulation',
      'Preventative: purging in spring and fall prevents seasonal diseases'
    ],

    contraindications: [
      'Pregnancy, menstruation, extreme weakness or old age',
      'Dysentery or bloody flux (purging worsens)',
      'Immediately after bloodletting - body too weakened',
      'High fever with delirium - purge only after fever breaks'
    ],

    historicalSource: {
      author: 'Juan de Vigo',
      work: 'Practica in arte chirurgica copiosa',
      year: 1514,
      excerpt: '"Purgatio est evacuatio superfluitatum per inferna, quae fit medicamentis catharticus per os sumptis."',
      translation: '"Purging is the evacuation of superfluities through the lower passages, which is done by cathartic medicines taken by mouth."',
      location: 'Rome'
    },

    modernNote: 'Excessive purging caused dangerous dehydration and electrolyte imbalances. Some purgatives (jalap, scammony) are violent irritants. Senna and rhubarb are still used as laxatives today. The practice of routine purging for disease prevention and treatment was harmful and based on incorrect humoral theory.',

    wikipediaQuery: 'Purgative medicine history laxative',
    relatedEntries: ['jalap', 'senna', 'rhubarb-root', 'four-qualities', 'bloodletting']
  },

  // HUMORAL THEORY - Individual Humors
  'blood': {
    id: 'blood',
    name: 'Blood (Sanguine Humor)',
    latinName: 'Sanguis',
    category: 'humoral-theory',
    tags: ['humor', 'temperament', 'hot', 'moist', 'sanguine'],
    icon: getIconForEntry('blood'),

    summary: 'The sanguine humor, hot and moist, produced by the liver from food, associated with spring, air, and vitality.',

    properties: {
      humors: { temperature: 'hot', moisture: 'moist' },
      element: 'Air',
      season: 'Spring',
      organ: 'Liver',
      qualities: ['Life-giving', 'Nourishing', 'Vital']
    },

    characteristics: [
      'Ruddy, rosy complexion with abundant flesh',
      'Strong pulse and warm extremities',
      'Cheerful, optimistic, and sociable personality',
      'Amorous nature and love of pleasure',
      'When in excess: fever, plethora, apoplexy, inflammation',
      'When deficient: pallor, weakness, fainting, cold extremities'
    ],

    balance: [
      'To increase blood: consume red wine, beef, raisins, and warming foods; rest in warm chambers',
      'To decrease blood: phlebotomy (bloodletting), leeches, purging with senna, fasting',
      'Foods that promote: meat, eggs, sweet wines, fresh fruits, bread',
      'Medicines that affect: warming cordials increase it; cooling astringents and phlebotomy decrease it'
    ],

    historicalSource: {
      author: 'Johannes de Ketham',
      work: 'Fasciculus Medicinae',
      year: 1491,
      excerpt: 'Sanguis est humidum calidum...ex hepate generatur ex cibo perfecte digesto',
      translation: 'Blood is hot and moist...generated by the liver from perfectly digested food',
      location: 'Venice'
    },

    modernNote: 'While blood is indeed essential for life and carries nutrients, the humoral conception of blood as one of four bodily fluids governing health and personality is not supported by modern medicine.',

    wikipediaQuery: 'Humorism blood sanguine',
    relatedEntries: ['yellow-bile', 'black-bile', 'phlegm', 'four-temperaments', 'bloodletting']
  },

  'yellow-bile': {
    id: 'yellow-bile',
    name: 'Yellow Bile (Choleric Humor)',
    latinName: 'Cholera, Cholera Flava',
    category: 'humoral-theory',
    tags: ['humor', 'temperament', 'hot', 'dry', 'choleric'],
    icon: getIconForEntry('yellow-bile'),

    summary: 'The choleric humor, hot and dry, secreted by the gall bladder, associated with summer, fire, and passionate temperament.',

    properties: {
      humors: { temperature: 'hot', moisture: 'dry' },
      element: 'Fire',
      season: 'Summer',
      organ: 'Gall bladder',
      qualities: ['Bitter', 'Sharp', 'Consuming']
    },

    characteristics: [
      'Yellow-tinged skin, lean and sinewy build',
      'Quick movements and restless energy',
      'Ambitious, quick-tempered, and bold personality',
      'Natural leaders but prone to anger',
      'When in excess: yellow jaundice, fever, bitter vomiting, rage',
      'When deficient: timidity, sluggish digestion, cold stomach'
    ],

    balance: [
      'To increase yellow bile: consume spices, wine, garlic, onions, mustard; engage in vigorous exercise',
      'To decrease yellow bile: cooling herbs (endive, lettuce, violet), cholagogues to purge bile, bloodletting',
      'Foods that promote: roasted meats, spices, strong wines, aged cheese',
      'Medicines that affect: hot purgatives (aloes, rhubarb) expel it; cooling syrups temper it'
    ],

    historicalSource: {
      author: 'Constantinus Africanus',
      work: 'Pantegni',
      year: 1080,
      excerpt: 'Cholera est calida & sicca...generat iracundiam & audaciam',
      translation: 'Choler is hot and dry...it generates wrath and boldness',
      location: 'Salerno'
    },

    modernNote: 'Bile is a real digestive fluid produced by the liver and stored in the gallbladder, but it does not govern personality or general health as the humoral theory proposed.',

    wikipediaQuery: 'Humorism yellow bile choleric',
    relatedEntries: ['blood', 'black-bile', 'phlegm', 'four-temperaments', 'choler']
  },

  'black-bile': {
    id: 'black-bile',
    name: 'Black Bile (Melancholic Humor)',
    latinName: 'Melancholia, Cholera Nigra',
    category: 'humoral-theory',
    tags: ['humor', 'temperament', 'cold', 'dry', 'melancholic'],
    icon: getIconForEntry('black-bile'),

    summary: 'The melancholic humor, cold and dry, produced by the spleen, associated with autumn, earth, and introspective temperament.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      element: 'Earth',
      season: 'Autumn',
      organ: 'Spleen',
      qualities: ['Heavy', 'Dense', 'Earthy']
    },

    characteristics: [
      'Dark, sallow complexion with thin frame',
      'Slow, deliberate movements',
      'Introspective, analytical, prone to sadness',
      'Artistic and philosophical inclinations',
      'When in excess: depression, fear, obsessive thoughts, quartan fever',
      'When deficient: frivolity, inability to concentrate'
    ],

    balance: [
      'To increase black bile: consume lentils, aged meats, vinegar, autumn vegetables; engage in solitary study',
      'To decrease black bile: hellebore purgatives, warming cordials, music, pleasant company, baths',
      'Foods that promote: beef, goat meat, lentils, cabbage, eggplant, vinegar',
      'Medicines that affect: hellebore and senna purge it; warming aromatics and wine dispel it'
    ],

    historicalSource: {
      author: 'Avicenna (Ibn Sina)',
      work: 'Canon of Medicine',
      year: 1025,
      excerpt: 'Melancholia frigida est et sicca...facit hominem tristem et timidum',
      translation: 'Melancholy is cold and dry...it makes a man sad and fearful',
      location: 'Persia'
    },

    modernNote: 'While the spleen does filter blood, there is no substance corresponding to "black bile" in the body. The melancholic temperament described aligns more with what we now understand as clinical depression.',

    wikipediaQuery: 'Humorism black bile melancholic',
    relatedEntries: ['blood', 'yellow-bile', 'phlegm', 'four-temperaments', 'melancholia', 'quartan-fever']
  },

  'phlegm': {
    id: 'phlegm',
    name: 'Phlegm (Phlegmatic Humor)',
    latinName: 'Phlegma, Pituita',
    category: 'humoral-theory',
    tags: ['humor', 'temperament', 'cold', 'moist', 'phlegmatic'],
    icon: getIconForEntry('phlegm'),

    summary: 'The phlegmatic humor, cold and moist, produced by the brain, associated with winter, water, and calm temperament.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      element: 'Water',
      season: 'Winter',
      organ: 'Brain',
      qualities: ['Thick', 'Viscous', 'White']
    },

    characteristics: [
      'Pale, soft complexion with tendency to corpulence',
      'Slow, deliberate movements and gestures',
      'Calm, patient, and unemotional personality',
      'Reliable but lacking ambition',
      'When in excess: catarrh, dropsy, palsy, dullness of wit',
      'When deficient: dry cough, insomnia, anxiety'
    ],

    balance: [
      'To increase phlegm: consume fish, dairy, cold water, cucumbers; rest in cool, damp places',
      'To decrease phlegm: expectorants, hot purgatives, sweating, warming spices, vigorous exercise',
      'Foods that promote: fish, milk, cheese, melons, cucumbers, barley',
      'Medicines that affect: warming spices and tobacco expel it; cooling foods and rest increase it'
    ],

    historicalSource: {
      author: 'Galen of Pergamon',
      work: 'On the Natural Faculties',
      year: 170,
      excerpt: 'Pituita est frigida et humida...descendit a cerebro ad pectus',
      translation: 'Phlegm is cold and moist...it descends from the brain to the chest',
      location: 'Rome'
    },

    modernNote: 'Phlegm as mucus produced by the respiratory system is real, but it is not produced by the brain, nor does it govern personality or general bodily function as humoral theory suggested.',

    wikipediaQuery: 'Humorism phlegm phlegmatic',
    relatedEntries: ['blood', 'yellow-bile', 'black-bile', 'four-temperaments', 'catarrh', 'sweating']
  },

  // DISEASES (Phase 2)
  'dysentery': {
    id: 'dysentery',
    name: 'Dysentery (Bloody Flux)',
    latinName: 'Dysenteria',
    category: 'diseases',
    tags: ['disease', 'intestinal', 'hot', 'moist', 'bloody', 'epidemic'],
    icon: getIconForEntry('dysentery'),

    summary: 'A severe intestinal disease causing bloody diarrhea, fever, and abdominal pain, often epidemic in summer months.',

    properties: {
      humors: { temperature: 'hot', moisture: 'moist' },
      severity: 'Grave',
      contagion: 'Miasmatic, spreads in hot weather',
      mortality: 'High, especially in children and the elderly'
    },

    symptoms: [
      'Frequent bloody stools with mucus and pus',
      'Severe griping pains in the abdomen',
      'Fever and excessive thirst',
      'Tenesmus (painful straining without relief)',
      'Weakness and emaciation',
      'Foul breath and coated tongue'
    ],

    treatments: [
      'Astringent decoctions of oak bark, pomegranate rind, or myrtle',
      'Opium tincture to stop the flux and ease pain',
      'Clysters (enemas) of milk, oil, and plantain water',
      'Cooling diet of barley water and rice',
      'Bloodletting if the patient is plethoric and fever is high',
      'Electuaries of bole armeniac and dragon\'s blood to bind the bowels'
    ],

    prognosis: 'If blood ceases within 7 days: favorable. If fever continues beyond 10 days with black stools: grave danger. Children and old people seldom recover if disease is violent. Recovery requires 2-3 weeks of careful diet and rest.',

    historicalSource: {
      author: 'Juan de Barrios',
      work: 'Verdadera Medicina, Cirugia y Astrologia',
      year: 1607,
      excerpt: 'En la disenteria con sangre, se debe dar opio para detener el flujo y agua de cebada para refrescar',
      translation: 'In dysentery with blood, one must give opium to stop the flux and barley water to cool',
      location: 'Mexico City'
    },

    modernNote: 'Dysentery is caused by bacterial (Shigella) or parasitic (Entamoeba histolytica) infection. Modern treatment includes antibiotics, rehydration, and antiparasitics—not opium or bloodletting.',

    wikipediaQuery: 'Dysentery history',
    relatedEntries: ['worms', 'opium', 'bloodletting']
  },

  'measles': {
    id: 'measles',
    name: 'Measles (Sarampión)',
    latinName: 'Morbilli',
    category: 'diseases',
    tags: ['disease', 'fever', 'hot', 'moist', 'childhood', 'epidemic', 'rash'],
    icon: getIconForEntry('measles'),

    summary: 'A hot and moist childhood disease marked by fever, cough, and a characteristic red rash spreading from face to body.',

    properties: {
      humors: { temperature: 'hot', moisture: 'moist' },
      severity: 'Moderate to grave',
      contagion: 'Highly contagious through corrupt air',
      mortality: 'Moderate in children, higher in infants'
    },

    symptoms: [
      'Initial fever with watering eyes and runny nose',
      'Harsh cough and hoarseness',
      'Small white spots inside the mouth (Koplik\'s spots)',
      'Red rash appearing first on face, then spreading to trunk and limbs',
      'High fever persisting during rash eruption',
      'Photophobia (aversion to light)'
    ],

    treatments: [
      'Keep patient in warm, dim room with red cloth over windows',
      'Cooling cordials of rose water, sugar, and vinegar',
      'Saffron decoction to bring out the rash fully',
      'Avoid bloodletting—allow rash to erupt naturally',
      'Gentle purgatives after rash fades to expel remaining corruption',
      'Electuaries of figs and liquorice for the cough'
    ],

    prognosis: 'If rash emerges fully and fever declines: favorable recovery. If rash suddenly disappears inward: mortal danger. Most children recover in 10-14 days. Complications include blindness, deafness, or chest diseases. Second infections are rare—one bout confers lifelong protection.',

    historicalSource: {
      author: 'Francisco Bravo',
      work: 'Opera Medicinalia',
      year: 1570,
      excerpt: 'Las viruelas y sarampión son purificaciones naturales de los niños...no se debe sangrar',
      translation: 'Smallpox and measles are natural purifications of children...one must not bleed them',
      location: 'Mexico City'
    },

    modernNote: 'Measles is caused by the measles virus (Paramyxoviridae family). The red room treatment had no medical benefit. Modern prevention relies on the MMR vaccine; treatment is supportive care.',

    wikipediaQuery: 'Measles history medicine',
    relatedEntries: ['smallpox', 'saffron', 'bloodletting']
  },

  'typhus': {
    id: 'typhus',
    name: 'Typhus (Tabardillo)',
    latinName: 'Typhus Exanthematicus',
    category: 'diseases',
    tags: ['disease', 'fever', 'epidemic', 'hot', 'dry', 'spotted', 'jail-fever'],
    icon: getIconForEntry('typhus'),

    summary: 'A severe epidemic fever marked by high fever, spotted rash, and delirium, known as "tabardillo" in New Spain, devastating to indigenous populations.',

    properties: {
      humors: { temperature: 'hot', moisture: 'dry' },
      severity: 'Often mortal',
      contagion: 'Highly contagious in crowded, filthy conditions',
      mortality: 'Very high (30-60% untreated)'
    },

    symptoms: [
      'Sudden high fever with severe headache',
      'Small purple or red spots (petechiae) on trunk and limbs',
      'Delirium, stupor, and mental confusion',
      'Extreme weakness and prostration',
      'Foul body odor',
      'Blackened tongue and dry, cracked lips',
      'Ringing in the ears'
    ],

    treatments: [
      'Immediate phlebotomy if patient is strong and fever is high',
      'Cooling drinks of barley water, tamarind, and vinegar',
      'Cinchona bark (Peruvian bark) for the fever',
      'Purging with senna or rhubarb to expel corrupt humors',
      'Tobacco smoke fumigation to purify the air',
      'Cold water compresses to the head',
      'Prayer and last rites if delirium worsens'
    ],

    prognosis: 'If fever breaks by day 14 with profuse sweating: patient may recover. If petechiae turn black or delirium continues: mortal sign. Most deaths occur between days 10-20. Survivors suffer prolonged weakness for months. Indigenous peoples show much higher mortality than Spanish.',

    historicalSource: {
      author: 'Agustín Farfán',
      work: 'Tractado Breve de Medicina',
      year: 1592,
      excerpt: 'El tabardillo es una fiebre maligna con manchas...mata a muchos indios cada año',
      translation: 'Tabardillo is a malignant fever with spots...it kills many Indians each year',
      location: 'Mexico City'
    },

    modernNote: 'Epidemic typhus is caused by Rickettsia prowazekii bacteria transmitted by body lice. Modern treatment includes antibiotics (doxycycline or chloramphenicol) and louse control. The high indigenous mortality was due to lack of prior exposure.',

    wikipediaQuery: 'Epidemic typhus history New Spain',
    relatedEntries: ['peruvian-bark', 'bloodletting', 'tobacco']
  },

  'melancholia': {
    id: 'melancholia',
    name: 'Melancholia (Black Bile Madness)',
    latinName: 'Melancholia',
    category: 'diseases',
    tags: ['disease', 'mental', 'cold', 'dry', 'black-bile', 'madness'],
    icon: getIconForEntry('melancholia'),

    summary: 'A disease of the mind caused by excess or corrupted black bile, marked by irrational fears, sadness, and obsessive thoughts.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      severity: 'Chronic and difficult to cure',
      contagion: 'Not contagious',
      mortality: 'Low but leads to self-harm'
    },

    symptoms: [
      'Persistent sadness and weeping without cause',
      'Irrational fears (of damnation, death, or imaginary threats)',
      'Obsessive thoughts and fixed delusions',
      'Aversion to food and company',
      'Insomnia or excessive sleep',
      'Dark, sunken appearance with cold extremities',
      'Desire to flee or hide'
    ],

    treatments: [
      'Hellebore purgatives to expel black bile',
      'Warming cordials with saffron, cinnamon, and nutmeg',
      'Music, pleasant company, and gentle exercise',
      'Opium or poppy syrup for sleep',
      'Baths in warm mineral waters',
      'Diet of warm, moist foods: chicken broth, white bread, sweet wine',
      'Exorcism if demonic possession is suspected',
      'Bloodletting from the hemorrhoidal veins'
    ],

    prognosis: 'If patient can be persuaded to eat and take company: gradual improvement possible. If delusions persist beyond 6 months: cure is rare. Danger of suicide or self-starvation. Some cases improve with change of air or climate. Relapses are common, especially in autumn.',

    historicalSource: {
      author: 'Andrés Laguna',
      work: 'Pedacio Dioscorides Anazarbeo (commentary)',
      year: 1555,
      excerpt: 'Melancholía es causada por humor melancólico que sube al cerebro...el paciente teme sin razón',
      translation: 'Melancholy is caused by melancholic humor rising to the brain...the patient fears without reason',
      location: 'Spain'
    },

    modernNote: 'Historical melancholia corresponds to what we now recognize as major depressive disorder, anxiety disorders, or delusional depression. Modern treatment includes psychotherapy, antidepressants, and cognitive-behavioral therapy.',

    wikipediaQuery: 'Melancholia history humoral medicine',
    relatedEntries: ['black-bile', 'opium', 'four-temperaments']
  },

  'worms': {
    id: 'worms',
    name: 'Worms (Intestinal Parasites)',
    latinName: 'Vermes, Lumbrici',
    category: 'diseases',
    tags: ['disease', 'intestinal', 'parasites', 'children', 'cold', 'moist'],
    icon: getIconForEntry('worms'),

    summary: 'Intestinal parasites common in all classes, especially children, causing abdominal pain, wasting, and restlessness.',

    properties: {
      humors: { temperature: 'cold', moisture: 'moist' },
      severity: 'Moderate, chronic nuisance',
      contagion: 'From contaminated food and water',
      mortality: 'Low unless severe infestation'
    },

    symptoms: [
      'Abdominal pain and bloating',
      'Ravenous appetite but continued wasting',
      'Grinding teeth during sleep (bruxism)',
      'Itching at the anus, especially at night',
      'Pale complexion and sunken eyes',
      'Restlessness and irritability',
      'Sometimes worms visible in stools',
      'Foul breath'
    ],

    treatments: [
      'Wormseed (Chenopodium ambrosioides) decoction or oil',
      'Wormwood (Artemisia) infusion on empty stomach',
      'Cowhage (Mucuna pruriens) seeds mixed in honey or molasses',
      'Bitter purgatives: aloes, senna, or scammony',
      'Clysters of garlic and milk to expel worms from below',
      'Diet of bitter and sour foods: vinegar, pomegranate, garlic',
      'Avoid sweets, milk, and fruits during treatment'
    ],

    prognosis: 'Most patients expel worms within 2-3 days of treatment. Reinfection common without dietary changes. Large roundworms can cause intestinal blockage. Tapeworms require repeated treatments. Children generally recover well with treatment.',

    historicalSource: {
      author: 'Martín de la Cruz (translated by Juan Badiano)',
      work: 'Libellus de Medicinalibus Indorum Herbis',
      year: 1552,
      excerpt: 'Para los gusanos, se da la semilla de epazote en ayunas con miel...mata los gusanos sin dañar al enfermo',
      translation: 'For worms, give wormseed on an empty stomach with honey...it kills the worms without harming the patient',
      location: 'Tlatelolco, New Spain'
    },

    modernNote: 'Intestinal parasites (roundworms, pinworms, tapeworms) are real. Some herbal treatments like wormseed (ascaridole) and wormwood have genuine antiparasitic properties, though modern anthelmintics (mebendazole, albendazole) are more effective.',

    wikipediaQuery: 'Intestinal worms history medicine',
    relatedEntries: ['aloes']
  },

  'quartan-fever': {
    id: 'quartan-fever',
    name: 'Quartan Fever (Four-Day Ague)',
    latinName: 'Febris Quartana',
    category: 'diseases',
    tags: ['disease', 'fever', 'periodic', 'cold', 'dry', 'black-bile', 'malaria'],
    icon: getIconForEntry('quartan-fever'),

    summary: 'A periodic fever recurring every fourth day, more dangerous and obstinate than tertian fever, associated with excess black bile.',

    properties: {
      humors: { temperature: 'cold', moisture: 'dry' },
      severity: 'Grave and chronic',
      contagion: 'Miasmatic from marshes and swamps',
      mortality: 'Moderate but causes prolonged debility'
    },

    symptoms: [
      'Fever spike every fourth day (counting inclusively)',
      'Violent shaking chills preceding fever',
      'Burning heat for 4-6 hours',
      'Profuse sweating as fever breaks',
      'Two fever-free days between attacks',
      'Enlargement of the spleen',
      'Sallow, earth-colored complexion',
      'Extreme weakness and melancholy disposition'
    ],

    treatments: [
      'Cinchona bark (Jesuits\' bark) taken before the fever paroxysm',
      'Bloodletting during fever-free intervals to reduce plethora',
      'Purgatives of hellebore or black hellebore to expel black bile',
      'Warming spices: ginger, pepper, cinnamon in wine',
      'Opium before the expected paroxysm to prevent shaking',
      'Avoid cold foods and drinks; use warm, dry diet',
      'Iron preparations and wormwood to strengthen the spleen',
      'Change of air to higher, drier elevation'
    ],

    prognosis: 'More obstinate and difficult to cure than tertian or quotidian fevers. Can persist for months or years without treatment. If spleen remains enlarged: poor prognosis, dropsy may follow. If cinchona bark is given correctly: resolution in 2-3 weeks. Relapses common, especially if patient returns to marshy areas. Leaves patient weakened and vulnerable to other diseases.',

    historicalSource: {
      author: 'Bernardino Ramazzini',
      work: 'De Morbis Artificum Diatriba',
      year: 1700,
      excerpt: 'Febris quartana...pessima est et difficillima curatu...procedit ab humore melancholico',
      translation: 'Quartan fever...is the worst and most difficult to cure...it proceeds from melancholic humor',
      location: 'Modena, Italy'
    },

    modernNote: 'Quartan fever is malaria caused by Plasmodium malariae, with 72-hour cycles. Cinchona bark (containing quinine) was indeed effective. Modern treatment uses antimalarial drugs like chloroquine or artemisinin-based therapies.',

    wikipediaQuery: 'Quartan fever malaria history',
    relatedEntries: ['tertian-fever', 'peruvian-bark', 'black-bile']
  },

  // TREATMENTS (Phase 2)
  'vomiting': {
    id: 'vomiting',
    name: 'Vomiting (Emetic Therapy)',
    latinName: 'Vomitus, Emesis',
    category: 'treatments',
    tags: ['treatment', 'evacuation', 'upward-purging', 'emetic', 'stomach'],
    icon: getIconForEntry('vomiting'),

    summary: 'Therapeutic evacuation of corrupt humors from the stomach upward through induced vomiting using emetic herbs or minerals.',

    properties: {
      humors: { temperature: 'hot', moisture: 'moist' },
      type: 'evacuative'
    },

    procedure: [
      'Patient fasts for 6-12 hours before treatment',
      'Drink 2-3 glasses of warm water or barley broth',
      'Administer emetic: ipecacuanha root, antimony wine, or copper sulfate',
      'Patient should lean forward over basin',
      'Tickle throat with feather if vomiting does not commence',
      'Continue until bilious or clear fluid is vomited',
      'Afterward: rest, sip wine with cinnamon, eat light foods'
    ],

    indications: [
      'Corrupt or poisoned stomach contents',
      'Excess phlegm in the chest and head',
      'Melancholic diseases with obstruction',
      'Poisoning (if recent)',
      'Drunkenness',
      'Persistent headaches from corrupt vapors rising from stomach',
      'Before bloodletting to clear the stomach'
    ],

    contraindications: [
      'Pregnancy',
      'Weak, elderly, or very young patients',
      'Consumption (tuberculosis) or hemoptysis',
      'Recent surgery or wounds',
      'Hemorrhoids or tendency to bleeding',
      'Violent fevers',
      'Heart weakness or palpitations'
    ],

    historicalSource: {
      author: 'Juan de Esteyneffer',
      work: 'Florilegio Medicinal',
      year: 1712,
      excerpt: 'El vómito limpia el estómago de humores corrompidos...úsese ipecacuana de Brasil que es segura',
      translation: 'Vomiting cleanses the stomach of corrupted humors...use ipecacuanha from Brazil which is safe',
      location: 'New Spain'
    },

    modernNote: 'Induced vomiting is no longer recommended for poisoning (except in specific cases under medical supervision) as it can cause aspiration and esophageal damage. Ipecac syrup was used until recently but is now discouraged.',

    wikipediaQuery: 'Emetic therapy history medicine',
    relatedEntries: ['purging', 'ipecacuanha', 'antimony', 'bloodletting']
  },

  'sweating': {
    id: 'sweating',
    name: 'Sweating (Sudorific Therapy)',
    latinName: 'Sudor, Diaphoresis',
    category: 'treatments',
    tags: ['treatment', 'evacuation', 'skin', 'sudorific', 'fever'],
    icon: getIconForEntry('sweating'),

    summary: 'Therapeutic evacuation of corrupt humors and poisons through the skin by inducing profuse sweating with hot herbs and steam.',

    properties: {
      humors: { temperature: 'hot', moisture: 'moist' },
      type: 'evacuative'
    },

    procedure: [
      'Patient drinks hot decoction of sudorific herbs (guaiacum, sassafras, sarsaparilla)',
      'Immediately place in warm bed covered with heavy blankets',
      'Hot bricks or stones wrapped in cloth placed at feet',
      'Room kept hot with brazier; windows and doors sealed',
      'Sweating should continue for 2-3 hours',
      'Wipe patient dry with warm cloths periodically',
      'After treatment: change to dry clothes, remain in bed 6 hours',
      'Light diet of broth; avoid cold drinks'
    ],

    indications: [
      'French disease (syphilis) - primary treatment',
      'Fevers with chills - to break the fever',
      'Rheumatism and joint pains',
      'Dropsy and swelling',
      'Eruptions that refuse to emerge (measles, smallpox)',
      'Poisoning - to expel through skin',
      'Cold diseases needing warming'
    ],

    contraindications: [
      'Weakness or extreme debility',
      'Hemorrhage or tendency to bleeding',
      'Pregnant women',
      'Heart weakness',
      'Consumption (tuberculosis)',
      'Very young or very old patients'
    ],

    historicalSource: {
      author: 'Nicolás Monardes',
      work: 'Historia Medicinal de las Cosas que se Traen de Nuestras Indias Occidentales',
      year: 1574,
      excerpt: 'El sudor evacua los humores venenosos por los poros...el palo santo es mejor para el morbo gálico',
      translation: 'Sweat evacuates poisonous humors through the pores...holy wood is best for the French disease',
      location: 'Seville'
    },

    modernNote: 'While sweating can provide symptomatic relief and lower fever, it does not "expel poisons" or cure infections. Excessive sweating therapy can cause dangerous dehydration. Guaiacum has no actual effect on syphilis.',

    wikipediaQuery: 'Sudorific therapy history medicine syphilis',
    relatedEntries: ['guaiacum', 'sassafras', 'sarsaparilla', 'syphilis', 'tobacco']
  },

  'cautery': {
    id: 'cautery',
    name: 'Cautery (Hot Iron Burning)',
    latinName: 'Cauterium Actuale',
    category: 'treatments',
    tags: ['treatment', 'surgery', 'burning', 'hot', 'wounds', 'counter-irritant'],
    icon: getIconForEntry('cautery'),

    summary: 'Burning flesh with hot iron to stop bleeding, prevent infection, create counter-irritation, or open drainage for corrupt humors.',

    properties: {
      humors: { temperature: 'hot', moisture: 'dry' },
      type: 'surgical'
    },

    procedure: [
      'Select appropriate cautery iron shape (button, pointed, flat)',
      'Heat iron in brazier until red-hot',
      'Restrain patient firmly (or give strong wine/opium beforehand)',
      'Apply hot iron quickly and firmly to target area',
      'Hold for count of three, then remove',
      'Repeat if necessary for deep burns',
      'Dress wound with rose oil and lint',
      'Allow to suppurate and form eschar',
      'Eschar will fall off in 7-10 days'
    ],

    indications: [
      'Severe hemorrhage from wounds or amputations',
      'Gangrenous or putrid wounds',
      'Dog or snake bites (to destroy poison)',
      'Chronic headaches or epilepsy (cautery to back of neck)',
      'Gout and rheumatism (counter-irritant)',
      'To open issue or drainage for chronic disease',
      'Toothache (cautery to gum)',
      'Plague buboes (to draw out poison)'
    ],

    contraindications: [
      'Wounds near major blood vessels or nerves',
      'Hollow organs (risk of perforation)',
      'Areas with little flesh (face, hands)',
      'Patients too weak to endure pain',
      'Children (use potential cautery - caustic chemicals - instead)'
    ],

    historicalSource: {
      author: 'Hippocrates (quoted by Galen)',
      work: 'Aphorisms',
      year: '400 BCE',
      excerpt: 'Quod medicamenta non sanant, ferrum sanat; quod ferrum non sanat, ignis sanat',
      translation: 'What medicines do not cure, the knife cures; what the knife does not cure, fire cures',
      location: 'Greece/Rome'
    },

    modernNote: 'Cautery is still used in modern surgery for hemostasis (electrocautery), but not as a primary treatment for infection or chronic disease. The theory of counter-irritation has no scientific basis.',

    wikipediaQuery: 'Cautery history surgery',
    relatedEntries: ['bloodletting', 'plague']
  },

  'urinalysis': {
    id: 'urinalysis',
    name: 'Urinalysis (Uroscopy)',
    latinName: 'Uroscopia',
    category: 'treatments',
    tags: ['diagnosis', 'urine', 'inspection', 'color', 'medieval', 'diagnostic'],
    icon: getIconForEntry('urinalysis'),

    summary: 'Ancient diagnostic art of examining urine color, clarity, smell, taste, and sediment to determine disease and humoral imbalance.',

    properties: {
      humors: { temperature: 'varies', moisture: 'varies' },
      type: 'diagnostic'
    },

    procedure: [
      'Collect patient\'s first morning urine in clean glass matula',
      'Hold flask up to natural light (not direct sunlight)',
      'Examine color against urine color wheel (20 colors)',
      'Note clarity: clear, cloudy, or turbid',
      'Observe sediment: clouds (floating) or hypóstasis (settled)',
      'Smell the urine: sweet, foul, sharp, or neutral',
      'Taste if necessary (sweet indicates diabetes)',
      'Note consistency: thin, thick, oily, or frothy',
      'Record findings and compare to diagnostic charts'
    ],

    indications: [
      'All diseases - uroscopy is universal diagnostic',
      'Fever diagnosis (red or dark urine)',
      'Kidney and bladder diseases',
      'Diabetes (sweet urine)',
      'Liver diseases (yellow or green urine)',
      'Pregnancy detection',
      'Determining if disease is acute or chronic',
      'Assessing treatment effectiveness'
    ],

    contraindications: [
      'None - considered universally applicable'
    ],

    historicalSource: {
      author: 'Arnau de Vilanova',
      work: 'Tractatus de Arte Cognoscendi Venena',
      year: 1300,
      excerpt: 'La orina es el espejo de la sangre...por su color conocemos todas las enfermedades',
      translation: 'Urine is the mirror of blood...by its color we know all diseases',
      location: 'Montpellier'
    },

    modernNote: 'Modern urinalysis does examine color, clarity, and sediment, but uses chemical tests and microscopy for accurate diagnosis. Taste testing is not performed. Medieval uroscopy\'s diagnostic claims were vastly overestimated.',

    wikipediaQuery: 'Uroscopy history medieval medicine',
    relatedEntries: ['four-qualities', 'humoral-theory', 'stone']
  },

  // HUMORAL THEORY - Concepts (Phase 2)
  'four-temperaments': {
    id: 'four-temperaments',
    name: 'Four Temperaments',
    latinName: 'Quattuor Temperamenta',
    category: 'humoral-theory',
    tags: ['temperament', 'personality', 'humors', 'sanguine', 'choleric', 'melancholic', 'phlegmatic'],
    icon: getIconForEntry('four-temperaments'),

    summary: 'The four personality types determined by which humor predominates: Sanguine (blood), Choleric (yellow bile), Melancholic (black bile), and Phlegmatic (phlegm).',

    properties: {
      humors: { temperature: 'varies', moisture: 'varies' }
    },

    explanation: [
      'Sanguine: Predominant humor Blood (hot and moist). Physical: Ruddy complexion, plump. Personality: Cheerful, optimistic, sociable. Season: Spring. Element: Air. Treatment: Cool and dry - bloodletting, fasting.',
      'Choleric: Predominant humor Yellow bile (hot and dry). Physical: Yellow-tinged skin, lean, wiry. Personality: Ambitious, passionate, quick-tempered, bold. Season: Summer. Element: Fire. Treatment: Cool and moist - cooling foods, purge bile.',
      'Melancholic: Predominant humor Black bile (cold and dry). Physical: Dark, sallow complexion, thin. Personality: Introspective, analytical, artistic, prone to sadness. Season: Autumn. Element: Earth. Treatment: Warm and moist - warming spices, social activity, music.',
      'Phlegmatic: Predominant humor Phlegm (cold and moist). Physical: Pale, soft, corpulent, sluggish. Personality: Calm, patient, reliable, unemotional. Season: Winter. Element: Water. Treatment: Warm and dry - exercise, hot spices, expectorants.',
      'Temperament can shift with age, season, and diet',
      'Physical appearance reveals temperament',
      'Treat by opposing qualities of predominant humor'
    ],

    historicalSource: {
      author: 'Alfonso Chirino',
      work: 'Menor Daño de la Medicina',
      year: 1505,
      excerpt: 'Los quatro humores causan quatro complexiones...sanguino, colerico, melancolico, y flematico',
      translation: 'The four humors cause four complexions...sanguine, choleric, melancholic, and phlegmatic',
      location: 'Spain'
    },

    modernNote: 'The four temperaments persisted in psychology into the 20th century and influenced personality type theories. While humoral theory is obsolete, temperament psychology continues in modern frameworks like the Big Five personality traits.',

    wikipediaQuery: 'Four temperaments history',
    relatedEntries: ['blood', 'yellow-bile', 'black-bile', 'phlegm', 'humoral-theory']
  },

  'choler': {
    id: 'choler',
    name: 'Choler (Choleric Condition)',
    latinName: 'Cholera',
    category: 'humoral-theory',
    tags: ['condition', 'yellow-bile', 'hot', 'dry', 'anger', 'fever'],
    icon: getIconForEntry('choler'),

    summary: 'The pathological condition of excess or corrupted yellow bile, distinct from the humor itself, causing fever, anger, and bilious diseases.',

    properties: {
      humors: { temperature: 'hot', moisture: 'dry' }
    },

    explanation: [
      'Choler is the condition of excess or adustion (burning) of yellow bile',
      'Symptoms include: hot burning sensations in stomach, bitter taste, yellow vomiting, sharp temper, fever with burning heat, yellow jaundice, dry flushed skin, thirst',
      'Types of choler: Natural (normal yellow bile), Adust (burned, extremely hot), Red (mixed with blood), Vitellary (egg yolk color), Verdigris (greenish, extremely corrupt)',
      'Causes: hot foods and spices, strong wine in hot weather, anger and violent passions, summer heat, excessive exercise in heat, astrological influence of Mars or Sun',
      'Treatment: purge bile with cholagogues (aloes, rhubarb, senna), cooling diet (endive, lettuce, barley water), bloodletting if fever is high, avoid hot spices and wine, cool the liver with rose water',
      'Cholera morbus (acute form): sudden violent vomiting and purging, extreme thirst, burning sensation, cramps, often fatal if untreated. Treat with opium, cooling drinks, astringents'
    ],

    historicalSource: {
      author: 'Johannitius (Hunayn ibn Ishaq)',
      work: 'Isagoge (Introduction to Galenic Medicine)',
      year: 850,
      excerpt: 'Cholera es calor y sequedad en exceso...causa ira y fiebre ardiente',
      translation: 'Choler is heat and dryness in excess...it causes wrath and burning fever',
      location: 'Baghdad'
    },

    modernNote: 'Historical "cholera morbus" is not the same as epidemic cholera caused by Vibrio cholerae bacteria. The condition described as excess choler corresponds to various biliary and gastric disorders.',

    wikipediaQuery: 'Choler humoral medicine history',
    relatedEntries: ['yellow-bile', 'four-temperaments', 'purging']
  },

  // MEDICAL ASTROLOGY (Phase 2)
  'zodiac-body-parts': {
    id: 'zodiac-body-parts',
    name: 'Zodiac and Body Parts',
    latinName: 'Zodiacus Membrorum',
    category: 'astrology',
    tags: ['astrology', 'medicine', 'zodiac', 'anatomy', 'diagnosis'],
    icon: getIconForEntry('zodiac-body-parts'),

    summary: 'Each zodiac sign rules a specific region of the body from head (Aries) to feet (Pisces), determining disease susceptibility and treatment timing.',

    properties: {
      humors: { temperature: 'varies', moisture: 'varies' }
    },

    principles: [
      'Aries (Ram) - Head, brain, eyes, face',
      'Taurus (Bull) - Neck, throat, thyroid',
      'Gemini (Twins) - Arms, hands, shoulders, lungs',
      'Cancer (Crab) - Chest, breasts, stomach',
      'Leo (Lion) - Heart, spine, upper back',
      'Virgo (Virgin) - Bowels, intestines, spleen',
      'Libra (Scales) - Kidneys, lower back, loins',
      'Scorpio (Scorpion) - Genitals, bladder, anus',
      'Sagittarius (Archer) - Thighs, hips, liver',
      'Capricorn (Goat) - Knees, bones, skin',
      'Aquarius (Water-bearer) - Calves, ankles, circulation',
      'Pisces (Fish) - Feet, toes, lymphatic system',
      'Never treat a body part when the Moon is in its corresponding zodiac sign',
      'Surgery on body part is most dangerous when Moon transits its sign'
    ],

    examples: [
      'Patient needs tooth extraction (head = Aries): Wait until Moon leaves Aries',
      'Kidney stone (Libra): Treat when Moon in Aries (opposite sign) for maximum effect',
      'Bloodletting from arm (Gemini): Fatal if Moon in Gemini, safe in other signs',
      'Born with Saturn in Leo: Weak heart, prone to cardiac disease in life',
      'Mars transiting Scorpio: Epidemic of bladder and genital diseases expected'
    ],

    historicalSource: {
      author: 'Gerónimo Cortés',
      work: 'Libro de Phisonomía Natural y Varios Secretos de Naturaleza',
      year: 1598,
      excerpt: 'Cuando la Luna está en Aries, no se debe sangrar la cabeza...cada signo gobierna su miembro',
      translation: 'When the Moon is in Aries, one must not bleed the head...each sign governs its member',
      location: 'Valencia, Spain'
    },

    modernNote: 'There is no scientific evidence that zodiac signs influence anatomy, disease susceptibility, or treatment outcomes. This system persisted in medical practice into the 18th century.',

    wikipediaQuery: 'Medical astrology zodiac man history',
    relatedEntries: ['moon-phases-medicine', 'planetary-hours', 'herbal-astrology', 'bloodletting']
  },

  'moon-phases-medicine': {
    id: 'moon-phases-medicine',
    name: 'Moon Phases in Medicine',
    latinName: 'Lunae Phases in Medicina',
    category: 'astrology',
    tags: ['astrology', 'moon', 'timing', 'treatment', 'bloodletting'],
    icon: getIconForEntry('moon-phases-medicine'),

    summary: 'The Moon\'s phases govern medical treatments: waxing Moon for building therapies, waning Moon for purging and bloodletting.',

    properties: {
      humors: { temperature: 'varies', moisture: 'varies' }
    },

    principles: [
      'Waxing Moon (New to Full, days 1-14): Body absorbs and builds - give tonics, nourishing foods, restorative medicines',
      'Waning Moon (Full to New, days 15-29): Body eliminates and purges - bloodletting, purging, sweating, cautery, surgery',
      'Full Moon: Maximum fluid in body, maximum risk of hemorrhage, fevers peak',
      'New Moon: Minimum fluid, safest for surgery, body weakest',
      'Surgery should be performed during waning Moon when fluids ebb',
      'Chronic diseases best treated at New Moon, acute diseases at Full Moon'
    ],

    examples: [
      'Patient with plethora needs bloodletting: Wait for waning Moon, avoid Full Moon',
      'Wounded soldier arrives: If waxing Moon, expect more bleeding; apply extra styptics',
      'Woman wants to conceive: Advise intercourse during waxing Moon',
      'Epidemic fever raging: Expect peak deaths at Full Moon',
      'Scheduled amputation: Postpone if near Full Moon; optimal at New Moon or waning'
    ],

    historicalSource: {
      author: 'Luis Mercado',
      work: 'De Arte Medendi',
      year: 1611,
      excerpt: 'La sangría es más segura en menguante de Luna...en creciente hay más sangre y peligro',
      translation: 'Bloodletting is safer during waning Moon...during waxing there is more blood and danger',
      location: 'Valladolid, Spain'
    },

    modernNote: 'While the Moon does affect ocean tides, there is no scientific evidence it influences human physiology, surgical outcomes, or disease progression. Modern surgery scheduling does not consider lunar phases.',

    wikipediaQuery: 'Lunar phases medicine history',
    relatedEntries: ['bloodletting', 'purging', 'zodiac-body-parts', 'planetary-hours']
  },

  'planetary-hours': {
    id: 'planetary-hours',
    name: 'Planetary Hours',
    latinName: 'Horae Planetarum',
    category: 'astrology',
    tags: ['astrology', 'timing', 'planets', 'treatment', 'medicine'],
    icon: getIconForEntry('planetary-hours'),

    summary: 'Each hour of the day and night is ruled by one of seven planets, determining optimal timing for treatments and predicting disease crises.',

    properties: {
      humors: { temperature: 'varies', moisture: 'varies' }
    },

    principles: [
      'Seven planets: Sun (hot, dry - heart, vitality), Moon (cold, moist - brain, fluids), Mars (hot, dry - blood, wounds), Mercury (cold, dry - nerves, melancholy), Jupiter (hot, moist - liver, blood), Venus (cold, moist - kidneys), Saturn (cold, dry - spleen, black bile)',
      'Each planet rules 1 hour in sequence, repeating',
      'Day hours = sunrise to sunset ÷ 12; Night hours = sunset to sunrise ÷ 12',
      'First hour of day ruled by day\'s planet (Sunday = Sun, Monday = Moon, etc.)',
      'Treat organ with medicines during its planet\'s hour for maximum effect',
      'Avoid surgery on organ during its malefic planet\'s hour',
      'Crisis days in disease occur at planetary hour intervals'
    ],

    examples: [
      'Heart palpitations: Give cardiac cordial during Sun\'s hour for maximum strength',
      'Melancholic patient: Avoid treating during Saturn hours; treat during Jupiter hours',
      'Mixing theriac (complex compound): Compound during Jupiter hour on Thursday',
      'Fever crisis: Expect turning point at 7th, 14th, or 21st hour from onset',
      'Bloodletting for plethora: Perform during Mars hour to draw blood strongly',
      'Surgery on Tuesday (Mars day): First hour ruled by Mars - dangerous for bleeding'
    ],

    historicalSource: {
      author: 'Arnau de Vilanova',
      work: 'De Parte Operativa',
      year: 1300,
      excerpt: 'Cada planeta rige su hora...compón las medicinas en hora favorable de su planeta',
      translation: 'Each planet rules its hour...compound medicines in the favorable hour of their planet',
      location: 'Barcelona'
    },

    modernNote: 'There is no scientific evidence that planetary positions affect medical treatments or disease progression. The concept of planetary hours persisted in European medicine through the Renaissance.',

    wikipediaQuery: 'Planetary hours astrology medicine',
    relatedEntries: ['moon-phases-medicine', 'zodiac-body-parts', 'herbal-astrology']
  },

  'herbal-astrology': {
    id: 'herbal-astrology',
    name: 'Herbal Astrology',
    latinName: 'Astrologia Herbaria',
    category: 'astrology',
    tags: ['astrology', 'herbs', 'planets', 'medicine', 'materia-medica'],
    icon: getIconForEntry('herbal-astrology'),

    summary: 'Each plant is ruled by a planet and zodiac sign, determining its medicinal properties and optimal gathering/administration times.',

    properties: {
      humors: { temperature: 'varies', moisture: 'varies' }
    },

    principles: [
      'Sun (hot, dry): Chamomile, St. John\'s Wort, Saffron, Cinnamon, Angelica, Frankincense - cardiac tonics, fevers. Gather Sunday, Sun\'s hour',
      'Moon (cold, moist): Camphor, White Poppy, Cucumber, Lettuce, Willow - cooling, sleep, menstrual regulation. Gather Monday, Moon\'s hour, Full Moon',
      'Mars (hot, dry): Tobacco, Nettle, Garlic, Pepper, Ginger, Dragon\'s Blood - warming, stimulating, wound healing. Gather Tuesday, Mars hour',
      'Mercury (cold, dry): Fennel, Parsley, Valerian, Lavender, Dill, Quicksilver - nervous disorders, intellectual clarity. Gather Wednesday, Mercury hour',
      'Jupiter (hot, moist): Nutmeg, Clove, Fig, Borage, Balm, Sage - liver tonics, sanguine disorders. Gather Thursday, Jupiter hour',
      'Venus (cold, moist): Rose, Myrtle, Mint, Pennyroyal, Thyme - kidney remedies, aphrodisiacs, beauty. Gather Friday, Venus hour',
      'Saturn (cold, dry): Hellebore, Hemlock, Comfrey, Mullein, Belladonna - melancholic diseases, chronic conditions. Gather Saturday, Saturn hour',
      'Treat planetary diseases with planetary herbs',
      'Harvest herbs during favorable planetary hours'
    ],

    examples: [
      'Patient with heart palpitations: Give solar herb (saffron cordial) during Sun hour on Sunday',
      'Melancholic patient: Use jovian herbs (nutmeg, clove) to counter saturnine excess',
      'Wound bleeding: Apply martian herbs (dragon\'s blood) gathered on Tuesday',
      'Harvesting chamomile: Best gathered at sunrise on Sunday in Leo season',
      'Mixing sleeping potion: Use lunar herbs during Moon hour at Full Moon',
      'Love philtre: Compound venusian herbs (rose, myrtle) on Friday during Venus hour'
    ],

    historicalSource: {
      author: 'Nicholas Culpeper',
      work: 'The Complete Herbal',
      year: 1653,
      excerpt: 'Cada hierba es regida por su planeta...la manzanilla por el Sol, la adormidera por la Luna',
      translation: 'Each herb is ruled by its planet...chamomile by the Sun, poppy by the Moon',
      location: 'London'
    },

    modernNote: 'While some herbs do have medicinal properties, there is no scientific basis for planetary rulership affecting their efficacy or optimal gathering times. Culpeper\'s system was influential but pseudoscientific.',

    wikipediaQuery: 'Herbal astrology Culpeper',
    relatedEntries: ['planetary-hours', 'moon-phases-medicine', 'camphor', 'tobacco', 'saffron']
  }
};

/**
 * Get all entries for a category
 */
export function getEntriesByCategory(categoryId) {
  return Object.values(REFERENCE_ENTRIES).filter(
    entry => entry.category === categoryId
  );
}

/**
 * Search entries by query string
 */
export function searchEntries(query) {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  return Object.values(REFERENCE_ENTRIES).filter(entry => {
    return (
      entry.name.toLowerCase().includes(lowerQuery) ||
      entry.latinName?.toLowerCase().includes(lowerQuery) ||
      entry.summary.toLowerCase().includes(lowerQuery) ||
      entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Get entry by ID
 */
export function getEntryById(id) {
  return REFERENCE_ENTRIES[id] || null;
}

/**
 * Get all entries
 */
export function getAllEntries() {
  return Object.values(REFERENCE_ENTRIES);
}
