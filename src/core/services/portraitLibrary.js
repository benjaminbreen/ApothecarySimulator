// portraitLibrary.js
// Demographic metadata for portrait matching

/**
 * Portrait library: Maps portrait files to demographic data
 * This allows smart matching of NPCs to appropriate portraits based on:
 * - gender, age, casta, class, occupation
 */

export const PORTRAIT_LIBRARY = {
  // Named Character Portraits (specific NPCs from scenario)
  'antonius.jpg': {
    name: 'Antonius Philalethes',
    gender: 'male',
    age: 'middle-aged',
    casta: 'europeo',
    class: 'elite',
    occupation: 'alchemist',
    tags: ['scholar', 'mysterious', 'alchemist']
  },
  'inquisitorfernando.jpg': {
    name: 'Fernando Medina Castro',
    gender: 'male',
    age: 'middle-aged',
    casta: 'español',
    class: 'elite',
    occupation: 'inquisitor',
    tags: ['authority', 'religious', 'threatening']
  },
  'donluis.jpeg': {
    name: 'Don Luis de Céspedes',
    gender: 'male',
    age: 'elderly',
    casta: 'español',
    class: 'elite',
    occupation: 'merchant',
    tags: ['wealthy', 'elite', 'merchant']
  },
  'anadesoto.jpg': {
    name: 'Ana de Soto',
    gender: 'female',
    age: 'adult',
    casta: 'española',
    class: 'middling',
    occupation: 'midwife',
    tags: ['midwife', 'healer']
  },
  'joao.jpg': {
    name: 'João Rodrigues',
    gender: 'male',
    age: 'adult',
    casta: 'portugués',
    class: 'middling',
    occupation: 'apothecary',
    tags: ['apothecary', 'merchant']
  },
  'marta.jpg': {
    name: 'Marta',
    gender: 'female',
    age: 'adult',
    casta: 'mestiza',
    class: 'common',
    occupation: 'servant',
    tags: ['servant', 'domestic']
  },
  'arturohernandez.jpg': {
    name: 'Arturo Hernandez',
    gender: 'male',
    age: 'middle-aged',
    casta: 'peninsular',
    class: 'middling',
    occupation: 'merchant',
    tags: ['merchant', 'lawyer', 'investigator', 'spy', 'guild']
  },
  'michaeladelasierra.jpg': {
    name: 'Doña Michaela de la Sierra',
    gender: 'female',
    age: 'middle-aged',
    casta: 'criolla',
    class: 'elite',
    occupation: 'noblewoman',
    tags: ['elite', 'wife', 'hacendado', 'noble', 'patient', 'paralyzed']
  },
  'gonzalodeloanda.jpg': {
    name: 'Gonzalo de Loanda',
    gender: 'male',
    age: 'middle-aged',
    casta: 'africano',
    class: 'freedman',
    occupation: 'innkeeper',
    tags: ['african', 'freedman', 'innkeeper', 'patient', 'cataracts']
  },
  'carlosenriquez.jpg': {
    name: 'Carlos Enriquez',
    gender: 'male',
    age: 'middle-aged',
    casta: 'español',
    class: 'elite',
    occupation: 'attorney',
    tags: ['attorney', 'lawyer', 'wealthy', 'peninsular', 'patient', 'sick']
  },
  'panchorodriguez.jpg': {
    name: 'Pancho Rodriguez',
    gender: 'male',
    age: 'middle-aged',
    casta: 'español',
    class: 'middling',
    occupation: 'goldsmith',
    tags: ['goldsmith', 'artisan', 'peninsular', 'patient', 'mercury poisoning']
  },
  'franciscodiasdearaujo.jpg': {
    name: 'Francisco Dias de Araujo',
    gender: 'male',
    age: 'adult',
    casta: 'criollo',
    class: 'middling',
    occupation: 'merchant',
    tags: ['merchant', 'wealthy', 'patient', 'dysentery']
  },
  'frayjordanes.jpg': {
    name: 'Fray Jordanes',
    gender: 'male',
    age: 'middle-aged',
    casta: 'español',
    class: 'religious',
    occupation: 'friar',
    tags: ['augustinian', 'friar', 'clergy', 'patient', 'ergotism', 'visions']
  },
  'fraypatricio.jpg': {
    name: 'Fray Patricio',
    gender: 'male',
    age: 'middle-aged',
    casta: 'europeo',
    class: 'religious',
    occupation: 'friar',
    tags: ['dominican', 'friar', 'clergy', 'patient', 'hemorrhoids', 'irish']
  },
  'antoniadeochoa.jpg': {
    name: 'Antonia de Ochoa',
    gender: 'female',
    age: 'young',
    casta: 'criolla',
    class: 'religious',
    occupation: 'nun',
    tags: ['nun', 'clergy', 'patient', 'stigmata', 'mystic', 'visions']
  },
  'sebastianathayde.jpg': {
    name: 'Sebastián Athayde',
    gender: 'male',
    age: 'child',
    casta: 'español',
    class: 'middling',
    occupation: 'apprentice',
    tags: ['child', 'apprentice', 'patient', 'asthma', 'candle maker']
  },
  'isabeldelacruz.jpg': {
    name: 'Isabel de la Cruz',
    gender: 'female',
    age: 'adult',
    casta: 'mestiza',
    class: 'middling',
    occupation: 'housewife',
    tags: ['mestiza', 'patient', 'migraines', 'wife']
  },
  'donalejandrocortez.jpg': {
    name: 'Don Alejandro Cortez',
    gender: 'male',
    age: 'elderly',
    casta: 'español',
    class: 'elite',
    occupation: 'judge',
    tags: ['judge', 'elite', 'peninsular', 'patient', 'gout', 'kidney stones', 'retired']
  },
  'rosamariaperez.jpg': {
    name: 'Rosa Maria Perez',
    gender: 'female',
    age: 'adult',
    casta: 'criolla',
    class: 'common',
    occupation: 'housewife',
    tags: ['housewife', 'patient', 'headaches', 'dizziness']
  },
  'diegoperez.jpg': {
    name: 'Diego Perez',
    gender: 'male',
    age: 'young',
    casta: 'indio',
    class: 'common',
    occupation: 'carpenter',
    tags: ['carpenter', 'indigenous', 'patient', 'respiratory', 'working class']
  },
  'inquisitorsantiagovaldez.jpg': {
    name: 'Santiago Valdez',
    gender: 'male',
    age: 'elderly',
    casta: 'español',
    class: 'religious',
    occupation: 'inquisitor',
    tags: ['inquisitor', 'clergy', 'authority', 'threatening', 'peninsular']
  },
  'tlacaelel.jpg': {
    name: 'Tlacaelel',
    gender: 'male',
    age: 'adult',
    casta: 'indio',
    class: 'middling',
    occupation: 'scribe',
    tags: ['indigenous', 'scribe', 'herbalist', 'nahuatl', 'codex bearer']
  },
  'juanbraga.jpg': {
    name: 'Juan Braga',
    gender: 'male',
    age: 'middle-aged',
    casta: 'mestizo',
    class: 'middling',
    occupation: 'apothecary',
    tags: ['apothecary', 'rival', 'merchant', 'competitor']
  },
  'ignaciodelacruz.jpg': {
    name: 'Doctor Ignacio de la Cruz',
    gender: 'male',
    age: 'elderly',
    casta: 'criollo',
    class: 'elite',
    occupation: 'physician',
    tags: ['physician', 'doctor', 'medical', 'university-trained']
  },
  'sirrobertsouthwell.jpg': {
    name: 'Sir Robert Southwell',
    gender: 'male',
    age: 'middle-aged',
    casta: 'europeo',
    class: 'elite',
    occupation: 'diplomat',
    tags: ['diplomat', 'anglo-irish', 'nobility', 'patient', 'malaria', 'english', 'royal society']
  },
  'sorjuanainesdelacruz.jpg': {
    name: 'Sor Juana Inés de la Cruz',
    gender: 'female',
    age: 'adult',
    casta: 'criolla',
    class: 'elite',
    occupation: 'nun',
    tags: ['nun', 'poet', 'writer', 'philosopher', 'intellectual', 'patient', 'famous']
  },
  'alfredojiménez.jpg': {
    name: 'Alfredo Jiménez',
    gender: 'male',
    age: 'middle-aged',
    casta: 'indio',
    class: 'middling',
    occupation: 'toymaker',
    tags: ['toymaker', 'artisan', 'indigenous', 'patient', 'back pain']
  },

  // Generic Male Portraits - Elite/Educated
  'femalescholar.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['española', 'criolla'],
    class: 'elite',
    occupation: ['scholar', 'nun', 'writer', 'noblewoman'],
    tags: ['educated', 'literate', 'refined']
  },
  'spanishlord.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: ['nobleman', 'lord', 'official', 'landowner'],
    tags: ['elite', 'wealthy', 'formal', 'authority']
  },
  'spanishnoblesolider.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: ['military officer', 'knight', 'conquistador', 'nobleman'],
    tags: ['military', 'elite', 'armored', 'authority', 'warrior']
  },
  'elderlynobleman.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: ['nobleman', 'retired official', 'patriarch', 'landowner'],
    tags: ['elite', 'elderly', 'wealthy', 'authority', 'experience']
  },
  'elderlypeninsulareman.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: ['español', 'peninsular'],
    class: 'elite',
    occupation: ['peninsular nobleman', 'official', 'merchant', 'patriarch'],
    tags: ['peninsular', 'elite', 'elderly', 'spanish-born', 'authority']
  },
  'peninsulareyoungman.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['español', 'peninsular'],
    class: ['elite', 'middling'],
    occupation: ['student', 'clerk', 'merchant', 'official'],
    tags: ['peninsular', 'young', 'spanish-born', 'educated']
  },
  '1680stheologianorscholar.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: ['theologian', 'scholar', 'priest', 'lawyer'],
    tags: ['educated', 'religious', 'intellectual']
  },
  '1680smanwearingglassesstudious.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: ['scholar', 'notary', 'scribe', 'physician'],
    tags: ['literate', 'educated', 'studious']
  },
  '1680sscholarold.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: ['scholar', 'philosopher', 'retired official'],
    tags: ['wisdom', 'age', 'learned']
  },
  'physician.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: ['physician', 'surgeon', 'doctor'],
    tags: ['medical', 'professional', 'university-trained']
  },
  'alchemist.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['europeo', 'español'],
    class: 'elite',
    occupation: ['alchemist', 'natural philosopher', 'apothecary'],
    tags: ['scholarly', 'mysterious', 'experimental']
  },
  'oldapothecary.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: ['español', 'criollo'],
    class: 'middling',
    occupation: ['apothecary', 'herbalist', 'healer'],
    tags: ['experienced', 'wise', 'medical']
  },
  'writer.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'middling',
    occupation: ['writer', 'clerk', 'notary', 'scribe'],
    tags: ['literate', 'administrative']
  },

  // Generic Male Portraits - Middling Class
  'merchantman.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'middling',
    occupation: ['merchant', 'shopkeeper', 'trader'],
    tags: ['commercial', 'urban']
  },
  'merchantwritingbill.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['español', 'criollo'],
    class: 'middling',
    occupation: ['merchant', 'accountant', 'clerk'],
    tags: ['literate', 'commercial', 'careful']
  },
  'scholar.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'middling',
    occupation: ['teacher', 'tutor', 'scholar', 'clerk'],
    tags: ['educated', 'modest']
  },
 
  'seacaptain.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['español', 'portugués'],
    class: 'middling',
    occupation: ['ship captain', 'sailor', 'navigator'],
    tags: ['maritime', 'experienced', 'weathered']
  },
  'oldsailornight.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: ['español', 'mestizo'],
    class: 'common',
    occupation: ['sailor', 'veteran', 'dockworker'],
    tags: ['maritime', 'experienced', 'weathered']
  },
  'traveler.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'mestizo'],
    class: 'middling',
    occupation: ['traveler', 'merchant', 'explorer'],
    tags: ['journey', 'foreign', 'mysterious']
  },
  'mestizoartisan.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['mestizo'],
    class: 'middling',
    occupation: ['artisan', 'weaver', 'craftsman', 'merchant'],
    tags: ['mestizo', 'artisan', 'skilled', 'colorful']
  },
  'mulattoman.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['mulato'],
    class: ['middling', 'common'],
    occupation: ['artisan', 'laborer', 'free person', 'craftsman'],
    tags: ['mulato', 'mixed-race', 'working', 'dignified']
  },

  // Generic Male Portraits - Common/Lower Class
  'peasant.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['mestizo', 'indio'],
    class: 'common',
    occupation: ['farmer', 'peasant', 'laborer'],
    tags: ['rural', 'working', 'poor']
  },
  'laborer.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['mestizo', 'indio', 'mulato'],
    class: 'common',
    occupation: ['laborer', 'porter', 'worker'],
    tags: ['manual labor', 'urban', 'working']
  },
  'mestizo.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['mestizo'],
    class: 'common',
    occupation: ['laborer', 'artisan', 'worker'],
    tags: ['mixed heritage', 'working']
  },
  'enslavedperson.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['africano', 'mulato'],
    class: 'enslaved',
    occupation: ['enslaved', 'servant', 'laborer'],
    tags: ['enslaved', 'oppressed']
  },
  'youngman.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['español', 'criollo', 'mestizo'],
    class: ['middling', 'common'],
    occupation: ['apprentice', 'student', 'youth', 'servant', 'clerk'],
    tags: ['young', 'energetic', 'working']
  },

'blacksmith.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: ['middling', 'common'],
    occupation: ['blacksmith', 'ironworker', 'smith'],
    tags: ['blacksmith', 'smith', 'working']
  },

    'criollomaleinnkeeperelderly.jpg': {
    gender: 'male',
    age: 'middle-aged',
     casta: ['español', 'criollo'],
    class: 'common',
    occupation: 'innkeeper',
    tags: ['innkeeper', 'tavern', 'working', 'urban', 'jovial']
  },

  // Generic Male Portraits - African/Mulato
  'youngafricanman.png': {
    gender: 'male',
    age: 'young',
    casta: ['africano'],
    class: ['common', 'enslaved'],
    occupation: ['laborer', 'enslaved', 'servant', 'apprentice'],
    tags: ['african', 'young', 'working', 'strong']
  },
  'youngafricanartisan.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['africano'],
    class: ['middling', 'common'],
    occupation: ['artisan', 'craftsman', 'laborer', 'apprentice'],
    tags: ['african', 'young', 'artisan', 'skilled']
  },

  // Generic Male Portraits - Poor Class
  'beggar.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['any'],
    class: 'poor',
    occupation: ['beggar', 'destitute', 'homeless'],
    tags: ['poor', 'desperate', 'ragged', 'poverty']
  },
  'pooryoungman.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['any'],
    class: 'poor',
    occupation: ['beggar', 'orphan', 'destitute', 'laborer'],
    tags: ['poor', 'young', 'struggling', 'poverty']
  },



  // Religious/Military - Male
  'mulattosoldier.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['mulato'],
    class: 'middling',
    occupation: ['soldier', 'militiaman', 'guard', 'sergeant'],
    tags: ['military', 'mixed-race', 'armed', 'patrol', 'authority']
  },
  'elderlysoldier.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: ['español', 'mestizo'],
    class: 'middling',
    occupation: ['veteran', 'retired soldier', 'guard', 'militiaman'],
    tags: ['military', 'elderly', 'experienced', 'weathered', 'veteran']
  },
  'friar.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'religious',
    occupation: ['friar', 'franciscan', 'monk'],
    tags: ['religious', 'humble', 'pious']
  },
  'monk.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['español', 'criollo'],
    class: 'religious',
    occupation: ['monk', 'priest', 'brother'],
    tags: ['religious', 'contemplative']
  },
  'abbot.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: ['español', 'criollo'],
    class: 'religious',
    occupation: ['abbot', 'prior', 'bishop'],
    tags: ['authority', 'religious', 'elevated']
  },
  'conquistador.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español'],
    class: 'elite',
    occupation: ['conquistador', 'soldier', 'officer'],
    tags: ['military', 'aggressive', 'armored']
  },
  'soldier.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'middling',
    occupation: ['soldier', 'guard', 'militiaman'],
    tags: ['military', 'armed']
  },
  'armedsoldiernight.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'middling',
    occupation: ['soldier', 'night watch', 'city watch'],
    tags: ['military', 'vigilant', 'city watch',]
  },
  'frontiersoldier.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'mestizo'],
    class: 'middling',
    occupation: ['frontier soldier', 'militiaman', 'settler'],
    tags: ['frontier', 'rugged', 'military']
  },

  // Generic Female Portraits - Elite/Spanish
  'spanishnoblewoman.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: ['noblewoman', 'elite woman', 'lady'],
    tags: ['elite', 'refined', 'wealthy', 'formal']
  },
  'youngspanishwoman.jpg': {
    gender: 'female',
    age: 'young',
    casta: ['español', 'criollo'],
    class: ['elite', 'middling'],
    occupation: ['noblewoman', 'merchant daughter', 'educated woman'],
    tags: ['young', 'spanish', 'refined', 'modest']
  },

  // Generic Female Portraits - Various Classes
  'oldwoman.jpg': {
    gender: 'female',
    age: 'elderly',
    casta: ['española', 'mestiza', 'india'],
    class: ['middling', 'common'],
    occupation: ['widow', 'grandmother', 'healer', 'beggar'],
    tags: ['age', 'wisdom', 'poor']
  },
  'peasantwoman.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['mestiza', 'india'],
    class: 'common',
    occupation: ['peasant', 'laborer', 'farmer'],
    tags: ['rural', 'working', 'humble']
  },
  'youngwomanholdinglanternnight.jpg': {
    gender: 'female',
    age: 'young',
    casta: ['española', 'criolla', 'mestiza'],
    class: 'middling',
    occupation: ['night maid', 'night servant'],
    tags: ['young', 'night', 'mysterious']
  },
  'seamstressdraperortextilemerchant.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['española', 'mestiza'],
    class: 'middling',
    occupation: ['seamstress', 'textile merchant', 'weaver'],
    tags: ['artisan', 'skilled', 'commercial']
  },
  'nun.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['española', 'criolla'],
    class: 'religious',
    occupation: ['nun', 'sister', 'abbess'],
    tags: ['religious', 'pious', 'educated']
  },

  // Generic Female Portraits - Indigenous
  'youngindigenouswoman.jpg': {
    gender: 'female',
    age: 'young',
    casta: ['indio', 'indígena'],
    class: 'common',
    occupation: ['weaver', 'servant', 'farmer', 'vendor', 'laborer'],
    tags: ['indigenous', 'young', 'working', 'modest']
  },

  // Generic Female Portraits - African/Mulato
  'africanwoman.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['africano'],
    class: ['common', 'enslaved'],
    occupation: ['servant', 'enslaved', 'healer', 'cook', 'laborer'],
    tags: ['african', 'working', 'dignified']
  },
  'youngafricanwoman.jpg': {
    gender: 'female',
    age: 'young',
    casta: ['africano'],
    class: ['common', 'enslaved'],
    occupation: ['servant', 'enslaved', 'vendor', 'laborer'],
    tags: ['african', 'young', 'working']
  },
  'youngmulattowoman.jpg': {
    gender: 'female',
    age: 'young',
    casta: ['mulato'],
    class: ['middling', 'common'],
    occupation: ['servant', 'artisan', 'vendor', 'free person'],
    tags: ['mulato', 'mixed-race', 'young', 'working']
  },

  // Generic Female Portraits - Servants & Workers
  'criollofemaleservant.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['criollo'],
    class: 'common',
    occupation: ['servant', 'maid', 'domestic worker', 'cook'],
    tags: ['criolla', 'working', 'servant', 'domestic', 'modest']
  },
    'criollofemalematron40s.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['criollo'],
    class: 'common',
    occupation: ['matron', 'mother'],
    tags: ['criolla', 'mother', 'matron', 'parent', 'family']
  },
  'elderlycriollomaleservant.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: ['criollo'],
    class: 'common',
    occupation: ['servant', 'butler', 'domestic worker', 'steward'],
    tags: ['criollo', 'elderly', 'servant', 'dignified', 'experienced']
  },

  // Generic Female Portraits - Healers & Medical
  'elderlycriollofemalehealer.jpg': {
    gender: 'female',
    age: 'elderly',
    casta: ['criollo'],
    class: 'middling',
    occupation: ['healer', 'curandera', 'midwife', 'herbalist'],
    tags: ['healer', 'elderly', 'wise', 'traditional', 'medicine']
  },
  'sickyoungwoman.jpg': {
    gender: 'female',
    age: 'young',
    casta: ['española', 'criolla'],
    class: ['elite', 'middling'],
    occupation: ['patient', 'noblewoman', 'sick person'],
    tags: ['sick', 'ill', 'patient', 'young', 'weak', 'suffering']
  },
  'sickyoungman.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['español', 'criollo', 'mestizo'],
    class: ['middling', 'common'],
    occupation: ['patient', 'sick person', 'laborer'],
    tags: ['sick', 'ill', 'patient', 'young', 'weak', 'suffering']
  },

  // Generic Female Portraits - Poor Class
  'beggarwoman.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['any'],
    class: 'poor',
    occupation: ['beggar', 'destitute', 'homeless'],
    tags: ['poor', 'desperate', 'ragged', 'poverty']
  },
  'poorwoman.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['mestiza', 'india', 'any'],
    class: 'poor',
    occupation: ['beggar', 'destitute', 'laborer', 'widow'],
    tags: ['poor', 'worn', 'struggling', 'poverty']
  },
  'poorfarmerwoman.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['mestiza', 'india'],
    class: 'poor',
    occupation: ['farmer', 'peasant', 'laborer'],
    tags: ['poor', 'rural', 'farming', 'struggling']
  },

  // Children
  'child.jpg': {
    gender: 'unknown',
    age: 'child',
    casta: ['any'],
    class: ['any'],
    occupation: ['child'],
    tags: ['young', 'innocent']
  },
  'sickboy.jpg': {
    gender: 'male',
    age: 'child',
    casta: ['any'],
    class: ['any'],
    occupation: ['child', 'patient'],
    tags: ['sick', 'young', 'ill']
  },
  'indigenousgirl.jpg': {
    gender: 'female',
    age: 'child',
    casta: ['indio', 'indígena'],
    class: ['common', 'poor'],
    occupation: ['child', 'farmer daughter', 'helper'],
    tags: ['indigenous', 'child', 'young', 'girl']
  },
  'mulattogirl.jpg': {
    gender: 'female',
    age: 'child',
    casta: ['mulato'],
    class: ['common', 'middling'],
    occupation: ['child', 'servant child', 'daughter'],
    tags: ['mulato', 'mixed-race', 'child', 'young', 'girl']
  },

  // Family/Group Portraits
  'family.jpg': {
    gender: 'group',
    age: 'mixed',
    casta: ['español', 'criollo', 'mestizo'],
    class: ['middling', 'common'],
    occupation: ['family'],
    tags: ['family', 'domestic', 'group']
  },

  // Ambiguous/Silhouette/Generic
  'defaultnpc.jpg': {
    gender: 'unknown',
    age: 'adult',
    casta: ['any'],
    class: ['any'],
    occupation: ['unknown'],
    tags: ['generic', 'placeholder', 'ambiguous']
  },
  'genericman.jpeg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: ['middling', 'common'],
    occupation: ['commoner', 'townsman'],
    tags: ['generic', 'ordinary']
  },
  'gentlemanstandingindoorwaysilhouette.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: ['gentleman', 'official', 'merchant'],
    tags: ['mysterious', 'silhouette', 'doorway']
  },
  'silhouetteofmanwearinghat.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['any'],
    class: ['middling', 'common'],
    occupation: ['traveler', 'stranger'],
    tags: ['mysterious', 'silhouette', 'anonymous']
  },

  // === NEW PORTRAITS BATCH (42 portraits) ===

  // Farmers & Rural Workers
  'middleagedfarmer.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'common',
    occupation: ['farmer', 'laborer', 'peasant'],
    tags: ['rural', 'working', 'outdoors']
  },
  'middleagedmestizofarmer.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: 'mestizo',
    class: 'common',
    occupation: ['farmer', 'laborer', 'peasant'],
    tags: ['rural', 'mestizo', 'working']
  },

  // Merchants & Vendors
  'countrysidemestizomalemerchant.jpg': {
    gender: 'male',
    age: 'adult',
    casta: 'mestizo',
    class: 'middling',
    occupation: ['merchant', 'vendor', 'trader'],
    tags: ['merchant', 'rural', 'mestizo']
  },
  'mestizomiddleagedmalemerchant.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: 'mestizo',
    class: 'middling',
    occupation: ['merchant', 'vendor', 'trader'],
    tags: ['merchant', 'mestizo', 'middle-aged']
  },
  'middleagedcriollofemalemerchant.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: 'criolla',
    class: 'middling',
    occupation: ['merchant', 'vendor', 'shopkeeper'],
    tags: ['merchant', 'criollo', 'female']
  },
  'middleagedafricanofemalemerchant.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: 'africana',
    class: 'common',
    occupation: ['merchant', 'vendor', 'trader'],
    tags: ['merchant', 'africana', 'working']
  },
  'middleagedmalemerchant.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'middling',
    occupation: ['merchant', 'vendor', 'trader'],
    tags: ['merchant', 'business', 'middling']
  },

  // Healers & Medical
  'elderlyfemaleindiohealer.jpg': {
    gender: 'female',
    age: 'elderly',
    casta: 'india',
    class: 'common',
    occupation: ['healer', 'curandera', 'herbalist'],
    tags: ['healer', 'indigenous', 'elder', 'medicine']
  },
  'middleagedfemaleapothecary.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: ['española', 'criolla'],
    class: 'middling',
    occupation: ['apothecary', 'healer', 'pharmacist'],
    tags: ['medicine', 'apothecary', 'professional']
  },
  'middleagedmaleapothecary.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['español', 'criollo'],
    class: 'middling',
    occupation: ['apothecary', 'physician', 'pharmacist'],
    tags: ['medicine', 'apothecary', 'professional']
  },
  'middleagedmulattomidwife.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: 'mulata',
    class: 'common',
    occupation: ['midwife', 'healer', 'nurse'],
    tags: ['midwife', 'healer', 'mulata']
  },

  // Servants & Laborers
  'africanomalelaborer.jpg': {
    gender: 'male',
    age: 'adult',
    casta: 'africano',
    class: 'common',
    occupation: ['laborer', 'worker', 'servant'],
    tags: ['laborer', 'working', 'africano']
  },

  // Religious
  'middleagedcriollanun.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: 'criolla',
    class: 'middling',
    occupation: ['nun', 'religious', 'sister'],
    tags: ['religious', 'nun', 'church', 'criollo']
  },

   // Religious
  'elderlycriollaonun.jpg': {
    gender: 'female',
    age: 'elderly',
    casta: 'criolla',
    class: 'middling',
    occupation: ['nun', 'religious', 'sister'],
    tags: ['religious', 'nun', 'church', 'criollo']
  },

  'middleagedcriollomalepriest.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: 'criollo',
    class: 'elite',
    occupation: ['priest', 'cleric', 'religious'],
    tags: ['religious', 'priest', 'church', 'criollo']
  },

  // Military & Soldiers
  'spanishnoblesoldier.jpg': {
    gender: 'male',
    age: 'adult',
    casta: 'español',
    class: 'elite',
    occupation: ['soldier', 'officer', 'military'],
    tags: ['military', 'noble', 'soldier', 'elite']
  },

  // Nobility & Elite
  'noblemallechild.jpg': {
    gender: 'male',
    age: 'child',
    casta: 'español',
    class: 'elite',
    occupation: ['student', 'noble child'],
    tags: ['noble', 'child', 'elite', 'young']
  },

  // Indigenous People
  'indiowoman.jpg': {
    gender: 'female',
    age: 'adult',
    casta: 'india',
    class: 'common',
    occupation: ['vendor', 'servant', 'laborer'],
    tags: ['indigenous', 'india', 'working']
  },
  'indiopeasantman.jpg': {
    gender: 'male',
    age: 'adult',
    casta: 'indio',
    class: 'common',
    occupation: ['peasant', 'laborer', 'farmer'],
    tags: ['indigenous', 'indio', 'peasant']
  },

  // Elderly Women
  'elderlyafricanofemalepeasant.jpg': {
    gender: 'female',
    age: 'elderly',
    casta: 'africana',
    class: 'common',
    occupation: ['peasant', 'laborer', 'servant'],
    tags: ['africana', 'elder', 'working', 'poor']
  },
  'elderlyafricanowoman.jpg': {
    gender: 'female',
    age: 'elderly',
    casta: 'africana',
    class: 'common',
    occupation: ['servant', 'laborer', 'domestic'],
    tags: ['africana', 'elder', 'working']
  },

  // Children
  'africanoboy.jpg': {
    gender: 'male',
    age: 'child',
    casta: 'africano',
    class: 'common',
    occupation: ['child', 'servant child'],
    tags: ['child', 'young', 'africano']
  },
  'mestizoboy.jpg': {
    gender: 'male',
    age: 'child',
    casta: 'mestizo',
    class: 'common',
    occupation: ['child', 'apprentice'],
    tags: ['child', 'young', 'mestizo']
  },
  'mestizogirl.jpg': {
    gender: 'female',
    age: 'child',
    casta: 'mestiza',
    class: 'common',
    occupation: ['child', 'servant child'],
    tags: ['child', 'young', 'mestiza']
  },
  'childmalescholar.jpg': {
    gender: 'male',
    age: 'child',
    casta: ['español', 'criollo'],
    class: ['elite', 'middling'],
    occupation: ['student', 'scholar child'],
    tags: ['child', 'educated', 'student', 'young']
  },
  'childfemalepeasant.jpg': {
    gender: 'female',
    age: 'child',
    casta: ['mestiza', 'india', 'any'],
    class: ['common', 'poor'],
    occupation: ['child', 'peasant child'],
    tags: ['child', 'young', 'peasant', 'poor']
  },

  // Specialized Occupations
  'middleagedmalemeleteer.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['mestizo', 'criollo', 'any'],
    class: 'common',
    occupation: ['muleteer', 'driver', 'transporter'],
    tags: ['transport', 'working', 'travel']
  },
  'middleagedmalesailor.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['español', 'criollo', 'mestizo', 'mulato'],
    class: 'common',
    occupation: ['sailor', 'seaman', 'mariner'],
    tags: ['sailor', 'maritime', 'working']
  },

  // === HOUSEHOLD STAFF & SERVANTS (New Batch) ===

  // Young Servants - Criolla/Criollo
  'criollofemaleservantyoung.jpg': {
    gender: 'female',
    age: 'young',
    casta: ['criolla', 'española'],
    class: ['common', 'middling'],
    occupation: ['servant', 'maid', 'domestic', 'household staff'],
    tags: ['servant', 'young', 'criolla', 'domestic', 'household']
  },
  'criollomaleservantyoung.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['criollo', 'español'],
    class: ['common', 'middling'],
    occupation: ['servant', 'attendant', 'domestic', 'household staff'],
    tags: ['servant', 'young', 'criollo', 'domestic', 'household']
  },
  'femaleyoungcriolloservant.jpg': {
    gender: 'female',
    age: 'young',
    casta: ['criolla', 'mestiza'],
    class: 'common',
    occupation: ['servant', 'maid', 'domestic', 'household staff'],
    tags: ['servant', 'young', 'criolla', 'working', 'domestic']
  },

  // Young Servants - Peninsular
  'pensinsularefemaleservantyoung.jpg': {
    gender: 'female',
    age: 'young',
    casta: ['española', 'peninsular'],
    class: ['middling', 'common'],
    occupation: ['servant', 'maid', 'domestic', 'household staff'],
    tags: ['servant', 'young', 'peninsular', 'española', 'domestic']
  },
  'peninsularemaleservantyoung.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['español', 'peninsular'],
    class: ['middling', 'common'],
    occupation: ['servant', 'attendant', 'page', 'household staff'],
    tags: ['servant', 'young', 'peninsular', 'español', 'domestic']
  },
    'youngmalemessenger.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['español', 'peninsular', 'mestizo', 'criollo'],
    class: ['middling', 'common'],
    occupation: ['messenger', 'page', 'young man', 'household staff', 'court messenger', 'runner'],
    tags: ['messenger', 'young', 'court', 'runner', 'delivery', 'assistant']
  },

  // Elderly Servants
  'elderlymaleservant.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: ['criollo', 'español', 'mestizo'],
    class: 'common',
    occupation: ['servant', 'attendant', 'domestic', 'household staff', 'butler'],
    tags: ['servant', 'elderly', 'experienced', 'domestic', 'loyal']
  },

  // Middle-aged Men - Various Occupations
  'middleagedcriolloman.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['criollo', 'español'],
    class: ['middling', 'common'],
    occupation: ['clerk', 'official', 'craftsman', 'merchant'],
    tags: ['middle-aged', 'criollo', 'working', 'respectable']
  },
  'shopkeepercriollomiddleaged.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['criollo', 'español'],
    class: 'middling',
    occupation: ['shopkeeper', 'merchant', 'trader', 'vendor'],
    tags: ['merchant', 'shopkeeper', 'middle-aged', 'criollo', 'business']
  },
  'criollofarmer.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['criollo', 'mestizo'],
    class: 'common',
    occupation: ['farmer', 'agriculturalist', 'peasant', 'landowner'],
    tags: ['farmer', 'rural', 'middle-aged', 'criollo', 'working']
  },

  // Female Merchants & Professionals
  'criollofemalemerchant.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: ['criolla', 'española'],
    class: 'middling',
    occupation: ['merchant', 'trader', 'shopkeeper', 'vendor'],
    tags: ['merchant', 'businesswoman', 'middle-aged', 'criolla', 'independent']
  },

  // Generic Male Portraits - Additional Middling Class
  'male_middleaged_criollo_merchant_importer.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['criollo'],
    class: 'middling',
    occupation: ['merchant', 'importer', 'trader', 'businessman'],
    tags: ['merchant', 'importer', 'trade', 'criollo', 'middling', 'business']
  },
  'male_middleaged_mestizo_artisan_cobbler.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['mestizo'],
    class: ['middling', 'common'],
    occupation: ['cobbler', 'shoemaker', 'artisan', 'craftsman'],
    tags: ['artisan', 'cobbler', 'shoemaker', 'craftsman', 'mestizo', 'skilled']
  },

  // Generic Male Portraits - Indigenous Elite
  'male_elder_indigenous_noble_delegate.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: ['indio', 'indígena'],
    class: ['elite', 'middling'],
    occupation: ['noble', 'delegate', 'cacique', 'representative', 'leader'],
    tags: ['indigenous', 'noble', 'elite', 'delegate', 'elder', 'dignified', 'cacique']
  },

  // Generic Female Portraits - Additional Young/Middle-aged
  'female_young_mestiza_market_vendor.jpg': {
    gender: 'female',
    age: 'young',
    casta: ['mestiza'],
    class: 'common',
    occupation: ['vendor', 'market seller', 'trader', 'shopkeeper'],
    tags: ['vendor', 'market', 'mestiza', 'young', 'working', 'seller']
  },
  'female_middleaged_criollo_patroness.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: ['criollo', 'criolla'],
    class: ['elite', 'middling'],
    occupation: ['patroness', 'noblewoman', 'lady', 'benefactor'],
    tags: ['patroness', 'elite', 'criolla', 'benefactor', 'wealthy', 'dignified']
  },

  // Animals
  'donkey.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['donkey', 'pack animal', 'transport'],
    tags: ['animal', 'donkey', 'transport', 'working', 'mule']
  },
  'goat.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['goat', 'farm animal', 'livestock'],
    tags: ['animal', 'goat', 'farm', 'livestock']
  },
  'pablothegoat.jpg': {
    name: 'Pablo',
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['goat', 'farm animal'],
    tags: ['animal', 'goat', 'named character', 'Pablo']
  },
  'dog.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['dog', 'pet', 'companion'],
    tags: ['animal', 'dog', 'pet', 'companion']
  },
  'cat.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['cat', 'pet', 'companion'],
    tags: ['animal', 'cat', 'pet', 'companion']
  },
  'catday.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['cat', 'pet', 'companion'],
    tags: ['animal', 'cat', 'pet', 'companion', 'daytime']
  },
  'frog.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['frog', 'amphibian'],
    tags: ['animal', 'frog', 'amphibian', 'small creature', 'wild']
  },
  'horse.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['horse', 'transport', 'working animal'],
    tags: ['animal', 'horse', 'transport', 'working']
  },
  'cow.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['cow', 'farm animal', 'livestock'],
    tags: ['animal', 'cow', 'farm', 'livestock']
  },
  'pig.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['pig', 'farm animal', 'livestock'],
    tags: ['animal', 'pig', 'farm', 'livestock']
  },
  'sheep.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['sheep', 'farm animal', 'livestock'],
    tags: ['animal', 'sheep', 'farm', 'livestock']
  },
  'rabbit.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['rabbit', 'small animal'],
    tags: ['animal', 'rabbit', 'wild', 'small']
  },
  'duck.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['duck', 'farm animal', 'bird'],
    tags: ['animal', 'duck', 'bird', 'farm']
  },
  'rooster.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['rooster', 'farm animal', 'bird'],
    tags: ['animal', 'rooster', 'bird', 'farm']
  },
  'owl.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['owl', 'wild bird'],
    tags: ['animal', 'owl', 'bird', 'wild', 'nocturnal']
  },
  'lizard.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['lizard', 'reptile'],
    tags: ['animal', 'lizard', 'reptile', 'wild']
  },
  'crab.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['crab', 'sea creature'],
    tags: ['animal', 'crab', 'sea creature', 'crustacean']
  },

  // Auto-generated entries from sync script
  'artisaninworkshop.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'middling',
    occupation: 'artisan',
    tags: ['artisan', 'male', 'craftsman', 'workshop', 'tools']
  },
  'conquistadorfrontier.jpg': {
    gender: 'male',
    age: 'adult',
    casta: 'español',
    class: 'common',
    occupation: 'conquistador',
    tags: ['conquistador', 'male', 'español']
  },
  'cowboyonhorse.jpg': {
    gender: 'male',
    age: 'adult',
    casta: 'criollo',
    class: 'common',
    occupation: 'cowboy',
    tags: ['male', 'cowboy', 'vaquero', 'rural',]
  },
  'criollafemalematron40s.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: 'criollo',
    class: 'common',
    occupation: 'unknown',
    tags: ['female', 'middle-aged', 'criollo']
  },

  'criollofemaleseamstressmiddleaged.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: 'criollo',
    class: 'common',
    occupation: 'seamstress',
    tags: ['seamstress', 'female', 'middle-aged', 'criollo']
  },
  'criollomaleprintermiddleaged.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: 'criollo',
    class: 'common',
    occupation: 'printer',
    tags: ['printer', 'male', 'middle-aged', 'criollo']
  },
  'curandera.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['indio', 'mestizo'],
    class: 'common',
    occupation: 'healer',
    tags: ['healer', 'female', 'curandera', 'medicine', 'herbalist']
  },
  'dominicannunelderly.jpg .png': {
    gender: 'female',
    age: 'elderly',
    casta: ['español', 'criollo'],
    class: 'religious',
    occupation: 'nun',
    tags: ['nun', 'female', 'elderly', 'dominican', 'religious']
  },
  'dominicannunelderly.png': {
    gender: 'female',
    age: 'elderly',
    casta: ['español', 'criollo'],
    class: 'religious',
    occupation: 'nun',
    tags: ['nun', 'female', 'elderly', 'dominican', 'religious']
  },
  'elderlyafricanwoman.jpg': {
    gender: 'female',
    age: 'elderly',
    casta: 'africano',
    class: 'common',
    occupation: 'unknown',
    tags: ['female', 'elderly', 'africano']
  },
  'elderlycriollamatroninterior.jpg': {
    gender: 'female',
    age: 'elderly',
    casta: 'criollo',
    class: 'common',
    occupation: 'unknown',
    tags: ['female', 'elderly', 'criollo']
  },
  'elderlycriollonun.jpg': {
    gender: 'female',
    age: 'elderly',
    casta: 'criollo',
    class: 'common',
    occupation: 'nun',
    tags: ['nun', 'female', 'elderly', 'criollo']
  },
  'fishermanonriver.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['indio', 'mestizo'],
    class: 'common',
    occupation: 'fisherman',
    tags: ['fisherman', 'male', 'river', 'labor', 'worker']
  },
  'handsomecriolloyoungnobleman.jpg': {
    gender: 'male',
    age: 'young',
    casta: 'criollo',
    class: 'elite',
    occupation: 'unknown',
    tags: ['male', 'young', 'criollo', 'elite']
  },
  'indianmerchants.jpg': {
    gender: 'male',
    age: 'adult',
    casta: 'indio',
    class: 'middling',
    occupation: 'merchant',
    tags: ['merchant', 'male', 'indio', 'vendor', 'trader', 'group']
  },
  'indiofemalechinampafarmerelderly.jpg': {
    gender: 'female',
    age: 'elderly',
    casta: 'indio',
    class: 'common',
    occupation: 'farmer',
    tags: ['farmer', 'female', 'elderly', 'indio']
  },
  'indioyoungmale.jpg': {
    gender: 'male',
    age: 'young',
    casta: 'indio',
    class: 'common',
    occupation: 'unknown',
    tags: ['male', 'young', 'indio']
  },
  'juana_milk_vendor.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['indio', 'mestizo'],
    class: 'common',
    occupation: 'vendor',
    tags: ['vendor', 'female', 'milk', 'market', 'food']
  },
  'malejeweler.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'middling',
    occupation: 'jeweler',
    tags: ['jeweler', 'male', 'artisan', 'craftsman', 'goldsmith']
  },
  'manandwomandinnercandlelight.jpg': {
    gender: 'group',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'middling',
    occupation: 'any',
    tags: ['female', 'male', 'couple', 'dining', 'candlelight', 'evening']
  },
  'manattablecandle.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'middling',
    occupation: 'any',
    tags: ['male', 'candle', 'reading', 'writing', 'evening', 'scholar']
  },
  'manonhorse.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'middling',
    occupation: 'any',
    tags: ['male', 'horse', 'rider', 'mounted', 'cavalier', 'travel']
  },
  'manonhorsebacknight.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'middling',
    occupation: 'any',
    tags: ['male', 'horse', 'rider', 'mounted', 'night', 'travel', 'cavalier']
  },
  'manwritingwithlantern.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'middling',
    occupation: 'any',
    tags: ['male', 'writing', 'lantern', 'scholar', 'scribe', 'clerk', 'educated']
  },
  'marketplacevendorindiowoman.jpg': {
    gender: 'female',
    age: 'adult',
    casta: 'indio',
    class: 'common',
    occupation: 'vendor',
    tags: ['vendor', 'female', 'indio']
  },
  'marketvendors.jpg': {
    gender: 'group',
    age: 'mixed',
    casta: ['indio', 'mestizo'],
    class: 'common',
    occupation: 'vendor',
    tags: ['vendor', 'market', 'group', 'trading']
  },
  'mestizawomanaged30s.jpg': {
    gender: 'female',
    age: 'adult',
    casta: 'mestizo',
    class: 'common',
    occupation: 'unknown',
    tags: ['female', 'mestizo']
  },
  'mestizomaleartisan.jpg': {
    gender: 'male',
    age: 'adult',
    casta: 'mestizo',
    class: 'middling',
    occupation: 'artisan',
    tags: ['artisan', 'male', 'mestizo']
  },
  'middleagedcriollofemaleservant.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: 'criollo',
    class: 'common',
    occupation: 'servant',
    tags: ['servant', 'female', 'middle-aged', 'criollo']
  },
  'middleagedmalemuleteer.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['mestizo', 'indio', 'español'],
    class: 'common',
    occupation: 'muleteer',
    tags: ['muleteer', 'male', 'middle-aged', 'transport', 'driver', 'worker']
  },
  'middleagedmaleportuguesesailor.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: 'portugués',
    class: 'common',
    occupation: 'sailor',
    tags: ['sailor', 'male', 'middle-aged', 'portugués', 'maritime', 'seaman']
  },
  'middleagedpeasantwoman.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: ['indio', 'mestizo'],
    class: 'poor',
    occupation: 'any',
    tags: ['female', 'middle-aged', 'poor', 'peasant', 'rural']
  },

  'mulattonyoungman.jpg': {
    gender: 'male',
    age: 'young',
    casta: 'mulatto',
    class: 'common',
    occupation: 'unknown',
    tags: ['male', 'young', 'mulatto']
  },
  'noblemalechild.jpg': {
    gender: 'male',
    age: 'child',
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: 'child',
    tags: ['male', 'child', 'elite', 'noble', 'wealthy']
  },
  'oldmanholdingcandlenight.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'common',
    occupation: 'any',
    tags: ['male', 'elderly', 'candle', 'night']
  },
  'peninsularenoblewomanfemaleindoorsmiddleaged.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: 'español',
    class: 'elite',
    occupation: 'unknown',
    tags: ['female', 'middle-aged', 'español', 'elite']
  },
  'peninsularpriestmiddleaged.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: 'español',
    class: 'common',
    occupation: 'priest',
    tags: ['priest', 'male', 'middle-aged', 'español']
  },
  'poormalepickpocketyoung.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['mestizo', 'indio', 'criollo'],
    class: 'poor',
    occupation: 'thief',
    tags: ['thief', 'male', 'young', 'poor', 'pickpocket', 'street']
  },
  'pooryoungmaninterior.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['mestizo', 'indio', 'criollo'],
    class: 'poor',
    occupation: 'any',
    tags: ['male', 'young', 'poor', 'interior']
  },
  'priest.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'religious',
    occupation: 'priest',
    tags: ['priest', 'male', 'clergy', 'religious']
  },
  'sailor.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo', 'portugués'],
    class: 'common',
    occupation: 'sailor',
    tags: ['sailor', 'male', 'maritime', 'seaman']
  },
  'shopkeeper.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'middling',
    occupation: 'shopkeeper',
    tags: ['shopkeeper', 'male', 'merchant', 'vendor']
  },
  'shopkeeperatwindowdusk.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'middling',
    occupation: 'shopkeeper',
    tags: ['shopkeeper', 'male', 'merchant', 'vendor', 'dusk']
  },
  'skinnyyoungman.jpg': {
    gender: 'male',
    age: 'young',
    casta: 'any',
    class: 'poor',
    occupation: 'any',
    tags: ['male', 'young', 'thin', 'skinny', 'malnourished', 'poor', 'hungry', 'gaunt', 'weak', 'poverty']
  },
  'soldier_guard_middleaged_espanol.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: 'español',
    class: 'common',
    occupation: 'soldier',
    tags: ['soldier', 'guard', 'male', 'middle-aged', 'español', 'military']
  },
  'soldiers.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'common',
    occupation: 'soldier',
    tags: ['soldier', 'male', 'group', 'military']
  },
  'teenagemaleservant.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['mestizo', 'indio', 'criollo'],
    class: 'common',
    occupation: 'servant',
    tags: ['servant', 'male', 'young', 'domestic', 'teenage']
  },
  'unhealthyindiowoman.jpg': {
    gender: 'female',
    age: 'adult',
    casta: 'indio',
    class: 'common',
    occupation: 'unknown',
    tags: ['female', 'indio']
  },
  'unhealthymiddleagedman.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: ['mestizo', 'criollo', 'español'],
    class: 'common',
    occupation: 'any',
    tags: ['male', 'middle-aged', 'sick', 'ill', 'unhealthy', 'patient']
  },
  'unhealthypickpocket.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['mestizo', 'criollo', 'español'],
    class: 'poor',
    occupation: 'thief',
    tags: ['thief', 'male', 'poor', 'unhealthy', 'thin']
  },
  'widow.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'common',
    occupation: 'any',
    tags: ['female', 'widow', 'mourning', 'grief']
  },
  'widow.png': {
    gender: 'female',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'common',
    occupation: 'any',
    tags: ['female', 'widow', 'mourning', 'grief']
  },
  'widowpeninsulare30s.jpg': {
    gender: 'female',
    age: 'adult',
    casta: 'español',
    class: 'common',
    occupation: 'unknown',
    tags: ['female', 'español']
  },
  'tejedora.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'common',
    occupation: 'any',
    tags: ['female', 'tejedora', 'weaver', 'labor']
  },

  'youngcavalier.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['español', 'criollo', 'mestizo'],
    class: 'middling',
    occupation: 'cavalier',
    tags: ['cavalier', 'young', 'male', 'military', 'horseman']
  },
  'youngcriollawoman.jpg': {
    gender: 'female',
    age: 'young',
    casta: 'criollo',
    class: 'common',
    occupation: 'unknown',
    tags: ['female', 'young', 'criollo']
  },
  'youngcriollawoman.png': {
    gender: 'female',
    age: 'young',
    casta: 'criollo',
    class: 'common',
    occupation: 'unknown',
    tags: ['female', 'young', 'criollo']
  },
  'youngfootman.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['mestizo', 'criollo', 'español'],
    class: 'common',
    occupation: 'servant',
    tags: ['servant', 'male', 'young', 'footman', 'domestic']
  },

  'youngmaleservant.jpg': {
    gender: 'male',
    age: 'young',
    casta: ['mestizo', 'indio', 'criollo'],
    class: 'common',
    occupation: ['servant', 'attendant', 'assistant', 'household staff'],
    tags: ['servant', 'male', 'young', 'domestic', 'attendant', 'assistant', 'helper']
  },
  'youngmanwithfaciallaceration.jpg': {
    gender: 'male',
    age: 'young',
    casta: 'any',
    class: 'common',
    occupation: 'any',
    tags: ['male', 'young', 'injured', 'wound', 'cut', 'laceration', 'trauma', 'hurt', 'bleeding', 'facial injury', 'accident', 'violence']
  },
  'youngmanwithpox.jpg': {
    gender: 'male',
    age: 'young',
    casta: 'any',
    class: 'common',
    occupation: 'any',
    tags: ['male', 'young', 'sick', 'disease', 'pox', 'smallpox', 'great pox', 'rash', 'ill', 'pustules', 'lesions', 'contagious', 'fever', 'patient', 'suffering']
  },
  'youngmestizawoman.jpg': {
    gender: 'female',
    age: 'young',
    casta: 'mestizo',
    class: 'common',
    occupation: 'unknown',
    tags: ['female', 'young', 'mestizo']
  },
  'youngpeasantwoman.jpg': {
    gender: 'female',
    age: 'young',
    casta: ['indio', 'mestizo'],
    class: 'poor',
    occupation: 'any',
    tags: ['female', 'young', 'poor', 'peasant', 'rural']
  },
  'youngwomansmallpox.jpg': {
    gender: 'female',
    age: 'young',
    casta: 'any',
    class: 'common',
    occupation: 'any',
    tags: ['female', 'young', 'sick', 'disease', 'smallpox', 'pox', 'rash', 'ill', 'pustules', 'lesions', 'contagious', 'fever', 'patient', 'suffering', 'disfigured']
  },

  // === ADDITIONAL CHARACTERS (Previously Unused) ===

  // Artists & Musicians
  'artist.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['criollo', 'español', 'mestizo'],
    class: 'middling',
    occupation: ['artist', 'painter', 'artisan'],
    tags: ['artist', 'creative', 'middling', 'cultured']
  },
  'musicians.jpg': {
    gender: 'multiple',
    age: 'adult',
    casta: ['criollo', 'mestizo', 'mulato'],
    class: ['common', 'middling'],
    occupation: ['musician', 'performer', 'entertainer'],
    tags: ['musician', 'group', 'entertainment', 'performance']
  },

  // Criminals & Outlaws
  'bandito.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['mestizo', 'criollo'],
    class: 'poor',
    occupation: ['bandit', 'outlaw', 'criminal'],
    tags: ['bandit', 'outlaw', 'dangerous', 'criminal']
  },

  // Elite & Nobility
  'caballero.jpg': {
    gender: 'male',
    age: 'adult',
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: ['gentleman', 'noble', 'caballero'],
    tags: ['elite', 'noble', 'gentleman', 'high-class']
  },
  'dona.jpg': {
    gender: 'female',
    age: ['adult', 'middle-aged'],
    casta: ['española', 'criolla'],
    class: 'elite',
    occupation: ['noblewoman', 'lady', 'doña'],
    tags: ['elite', 'noble', 'lady', 'high-class', 'female']
  },
  'dons.jpg': {
    gender: 'male',
    age: ['adult', 'middle-aged'],
    casta: ['español', 'criollo'],
    class: 'elite',
    occupation: ['nobleman', 'don', 'elite'],
    tags: ['elite', 'noble', 'group', 'high-class']
  },
  'spanishnoble.jpg': {
    gender: 'male',
    age: ['adult', 'middle-aged'],
    casta: 'español',
    class: 'elite',
    occupation: ['noble', 'peninsular', 'aristocrat'],
    tags: ['peninsular', 'noble', 'elite', 'spanish', 'aristocrat']
  },
  'viceroy.jpg': {
    gender: 'male',
    age: ['middle-aged', 'elderly'],
    casta: 'español',
    class: 'elite',
    occupation: ['viceroy', 'official', 'governor'],
    tags: ['viceroy', 'elite', 'official', 'authority', 'government']
  },

  // Legal Professionals
  'lawyers.jpg': {
    gender: 'male',
    age: ['adult', 'middle-aged'],
    casta: ['español', 'criollo'],
    class: ['middling', 'elite'],
    occupation: ['lawyer', 'legal professional', 'advocate'],
    tags: ['lawyer', 'legal', 'professional', 'educated', 'group']
  },

  // Family Scenes (may be used as portraits in certain contexts)
  'motherandchildrenday.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['mestiza', 'criolla'],
    class: ['common', 'middling'],
    occupation: ['mother', 'parent'],
    tags: ['mother', 'family', 'children', 'domestic', 'daytime']
  },
  'motherandchildrentwilight.jpg': {
    gender: 'female',
    age: 'adult',
    casta: ['mestiza', 'criolla'],
    class: ['common', 'middling'],
    occupation: ['mother', 'parent'],
    tags: ['mother', 'family', 'children', 'domestic', 'evening']
  },

  // === NEW PORTRAITS (November 2024) ===

  'middleagedcriollofoodvendor.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: 'criollo',
    class: 'common',
    occupation: ['vendor', 'food seller', 'merchant'],
    tags: ['vendor', 'food', 'seller', 'market', 'working', 'business', 'criollo', 'middle-aged']
  },
  'middleagedfemalemerchant.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: 'any',
    class: 'middling',
    occupation: ['merchant', 'shopkeeper', 'vendor'],
    tags: ['merchant', 'business', 'female', 'middle-aged', 'shopkeeper', 'independent', 'commercial']
  },
  'middleagedindiofemalepotterartisan.jpg': {
    gender: 'female',
    age: 'middle-aged',
    casta: 'indio',
    class: 'common',
    occupation: ['potter', 'artisan', 'craftsperson'],
    tags: ['potter', 'artisan', 'craftswoman', 'indigenous', 'skilled', 'ceramic', 'clay', 'working', 'traditional']
  },
  'middleagedmalebutcher.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: 'any',
    class: 'common',
    occupation: ['butcher', 'meat seller', 'merchant'],
    tags: ['butcher', 'meat', 'food', 'vendor', 'working', 'skilled', 'trade', 'market']
  },
  'middleagedmaleleatherworker.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: 'any',
    class: 'common',
    occupation: ['leatherworker', 'tanner', 'artisan'],
    tags: ['leatherworker', 'tanner', 'artisan', 'craftsman', 'working', 'skilled', 'leather', 'trade']
  },
  'youngfemaleindiovendor.jpg': {
    gender: 'female',
    age: 'young',
    casta: 'indio',
    class: 'common',
    occupation: ['vendor', 'seller', 'merchant'],
    tags: ['vendor', 'seller', 'market', 'indigenous', 'young', 'female', 'working', 'trade']
  },
  'elderlyfemaleindioweaver.jpg': {
    gender: 'female',
    age: 'elderly',
    casta: 'indio',
    class: 'common',
    occupation: ['weaver', 'artisan', 'textile worker'],
    tags: ['weaver', 'artisan', 'craftswoman', 'textile', 'indigenous', 'elderly', 'skilled', 'traditional', 'working']
  },
  'mestizomiddleagedmaletoolvendor.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: 'mestizo',
    class: 'common',
    occupation: ['vendor', 'tool seller', 'merchant', 'shopkeeper'],
    tags: ['vendor', 'seller', 'tools', 'merchant', 'market', 'mestizo', 'middle-aged', 'working', 'trade', 'hardware']
  },
  'middleagedmalefilipinomerchant.jpg': {
    gender: 'male',
    age: 'middle-aged',
    casta: 'filipino',
    class: 'middling',
    occupation: ['merchant', 'trader', 'shopkeeper'],
    tags: ['merchant', 'trader', 'filipino', 'asian', 'pacific', 'middle-aged', 'business', 'commercial', 'galleon trade', 'manila', 'overseas']
  }
};

/**
 * NOTE: This file contains ONLY portrait metadata.
 *
 * For portrait resolution logic, see portraitResolver.js which provides:
 * - resolvePortrait() - THE ONLY function to call for getting portraits
 * - Normalization functions (age, class, casta)
 * - Demographic matching algorithm
 *
 * This separation keeps data (this file) separate from logic (portraitResolver.js).
 */
