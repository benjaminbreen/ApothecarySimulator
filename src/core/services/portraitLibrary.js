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
  'joao.jpeg': {
    name: 'João Rodrigues',
    gender: 'male',
    age: 'adult',
    casta: 'portugués',
    class: 'middling',
    occupation: 'apothecary',
    tags: ['apothecary', 'merchant']
  },
  'marta.jpeg': {
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
    occupation: ['soldier', 'night watch', 'guard'],
    tags: ['military', 'vigilant', 'threatening']
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
    occupation: ['maid', 'servant', 'youth'],
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
  'elderlycriollomalservant.jpg': {
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
  'criollofemalemerchant.jpg': {
    gender: 'female',
    age: 'adult',
    casta: 'criolla',
    class: 'middling',
    occupation: ['merchant', 'vendor', 'shopkeeper'],
    tags: ['merchant', 'business', 'criollo']
  },
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
  'elderlycriollomaleservant.jpg': {
    gender: 'male',
    age: 'elderly',
    casta: 'criollo',
    class: 'common',
    occupation: ['servant', 'butler', 'domestic'],
    tags: ['servant', 'domestic', 'elder']
  },
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
  'elderlyafricanofeemalepeasant.jpg': {
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
  'criollafemaleservantyoung.jpg': {
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

  // Animals
  'donkey.jpg': {
    gender: 'animal',
    age: 'adult',
    casta: 'animal',
    class: 'animal',
    occupation: ['donkey', 'pack animal', 'transport'],
    tags: ['animal', 'donkey', 'transport', 'working']
  }
};

/**
 * Normalize age from number or string to standard categories
 * @param {string|number} age - Age value
 * @returns {string} Normalized age category
 */
function normalizeAge(age) {
  if (!age) return 'adult';

  const numAge = parseInt(age);
  if (isNaN(numAge)) {
    // Already a category
    const ageLower = age.toLowerCase();
    if (['child', 'young', 'adult', 'middle-aged', 'elderly', 'mixed'].includes(ageLower)) {
      return ageLower;
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
 * @param {string} socialClass - Class designation
 * @returns {string} Normalized class
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
 * @param {string} casta - Casta designation
 * @returns {string} Normalized casta
 */
function normalizeCasta(casta) {
  if (!casta) return 'mestizo';

  const castaLower = casta.toLowerCase().trim();

  // Handle variations
  const castaMap = {
    'español': 'español',
    'espanol': 'español',
    'spanish': 'español',
    'peninsular': 'español',
    'criollo': 'criollo',
    'creole': 'criollo',
    'mestizo': 'mestizo',
    'mixed': 'mestizo',
    'indio': 'indio',
    'indigenous': 'indio',
    'native': 'indio',
    'mulato': 'mulato',
    'mulatto': 'mulato',
    'africano': 'africano',
    'african': 'africano',
    'europeo': 'europeo',
    'european': 'europeo',
    'portugués': 'portugués',
    'portuguese': 'portugués'
  };

  return castaMap[castaLower] || castaLower;
}

/**
 * Get best matching portrait for an NPC based on demographic data
 * @param {Object} npc - NPC entity with demographic data
 * @returns {string} - Portrait filename (defaults to 'defaultnpc.jpg')
 */
export function getMatchingPortrait(npc) {
  if (!npc) return 'defaultnpc.jpg';

  // Extract and normalize NPC demographics
  const rawGender = npc.appearance?.gender || npc.gender || 'unknown';
  const rawAge = npc.appearance?.age || npc.age || 'adult';
  const rawCasta = npc.social?.casta || npc.casta || 'unknown';
  const rawClass = npc.social?.class || npc.class || 'common';
  const occupation = npc.social?.occupation || npc.occupation || npc.archetype || 'unknown';

  // Normalize values for matching
  const gender = rawGender;  // Keep as-is for gender
  const age = normalizeAge(rawAge);
  const casta = normalizeCasta(rawCasta);
  const socialClass = normalizeClass(rawClass);

  console.log(`[Portrait Matcher] Searching for: ${gender}, ${age}, ${casta}, ${socialClass}, ${occupation}`);

  // Score each portrait
  const scores = Object.entries(PORTRAIT_LIBRARY).map(([filename, portrait]) => {
    let score = 0;

    // Gender match (critical, +50 points for actual genders, +10 for unknown)
    if (portrait.gender === gender) {
      // Penalize matches where both are 'unknown' - prefer specific gender portraits
      if (gender === 'unknown' && portrait.gender === 'unknown') {
        score += 10;
      } else {
        score += 50;  // Actual gender match
      }
    } else if (portrait.gender === 'unknown' || portrait.gender === 'group') {
      score += 10;
    }

    // Age match (+30 points)
    if (portrait.age === age) score += 30;
    else if (portrait.age === 'mixed') score += 5;

    // Casta match (+20 points)
    const portraitCastas = Array.isArray(portrait.casta) ? portrait.casta : [portrait.casta];
    const normalizedPortraitCastas = portraitCastas.map(c => normalizeCasta(c));
    if (normalizedPortraitCastas.includes(casta)) score += 20;
    else if (normalizedPortraitCastas.includes('any')) score += 5;

    // Class match (+15 points)
    const portraitClasses = Array.isArray(portrait.class) ? portrait.class : [portrait.class];
    const normalizedPortraitClasses = portraitClasses.map(c => normalizeClass(c));
    if (normalizedPortraitClasses.includes(socialClass)) score += 15;
    else if (normalizedPortraitClasses.includes('any')) score += 3;

    // Occupation match (+25 points)
    const portraitOccupations = Array.isArray(portrait.occupation) ? portrait.occupation : [portrait.occupation];
    const occupationLower = occupation.toLowerCase();
    const occupationMatch = portraitOccupations.some(occ =>
      occ.toLowerCase().includes(occupationLower) || occupationLower.includes(occ.toLowerCase())
    );
    if (occupationMatch) score += 25;

    // Tag fuzzy matching (+5 points per tag)
    if (portrait.tags && occupation) {
      const tagMatch = portrait.tags.some(tag =>
        tag.toLowerCase().includes(occupationLower) || occupationLower.includes(tag.toLowerCase())
      );
      if (tagMatch) score += 5;
    }

    // Penalty for named portraits (should only match exact NPCs)
    if (portrait.name && portrait.name !== npc.name) {
      score -= 100;
    }

    return { filename, score, portrait };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Log top matches
  console.log(`[Portrait Matcher] Top 3 matches for ${npc.name}:`);
  scores.slice(0, 3).forEach((match, i) => {
    console.log(`  ${i + 1}. ${match.filename} (score: ${match.score})`);
  });

  // Return best match (or default if score too low)
  const bestMatch = scores[0];
  if (bestMatch.score >= 30) {
    console.log(`[Portrait Matcher] ✓ Selected: ${bestMatch.filename}`);
    return bestMatch.filename;
  } else {
    console.log(`[Portrait Matcher] ✗ No good match found (best score: ${bestMatch.score}), using default`);
    return 'defaultnpc.jpg';
  }
}

export default {
  PORTRAIT_LIBRARY,
  getMatchingPortrait
};
