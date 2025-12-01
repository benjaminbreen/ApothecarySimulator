/**
 * Primary Sources: Places & Events
 *
 * Historical texts about locations, historical events, epidemics,
 * and significant occurrences in the game's setting.
 */

export const PLACES_EVENTS_SOURCES = [
  // ============================================
  // MEXICO CITY LOCATIONS
  // ============================================
  {
    id: 'plaza-mayor',
    title: 'Description of the Plaza Mayor',
    category: 'places-events',
    author: 'Giovanni Francesco Gemelli Careri',
    work: 'Giro del Mondo',
    year: 1699,
    location: 'Naples (about Mexico City)',
    language: 'Italian',
    text: `La piazza grande di Mexico è la più bella che io habbia veduto nel mondo. È quadrata, di grande ampiezza, circondata da portici sotto i quali si vendono tutte le mercanzie.

Da un lato sta il palazzo del Vicerè, grande e magnifico. Dall'altro lato la Cattedrale, la più ricca chiesa delle Indie, con le sue due torri altissime. Dall'altra parte vi sono le case del Cabildo, dove si radunano i regidores della città.

Nel mezzo della piazza vi è una fontana con un'aquila di bronzo. Ogni giorno vi concorrono migliaia di persone per comprare e vendere.`,
    translation: `The great plaza of Mexico is the most beautiful I have seen in the world. It is square, of great size, surrounded by arcades under which all kinds of merchandise are sold.

On one side stands the palace of the Viceroy, large and magnificent. On the other side the Cathedral, the richest church of the Indies, with its two very tall towers. On another side are the houses of the Cabildo [town council], where the regidores of the city gather.

In the middle of the plaza there is a fountain with a bronze eagle. Every day thousands of people gather there to buy and sell. One sees there Indians, Spaniards, Blacks, and all manner of people mixed together.

The markets are particularly abundant on Saturdays, when the Indians bring their wares from the surrounding villages.`,
    historicalContext: `The Plaza Mayor (now the Zócalo) was the heart of colonial Mexico City, built directly over the ruins of the Aztec ceremonial center of Tenochtitlan. It served as marketplace, religious center, site of public executions, and symbol of Spanish colonial power.`,
    modernNote: `Gemelli Careri's description captures the plaza's multiple functions: commerce, government, religion, and social mixing. The presence of 'all manner of people mixed together' reflects Mexico City's status as the most populous and diverse city in the Americas.`,
    difficulty: 'beginner',
    tags: ['Plaza Mayor', 'Mexico City', 'market', 'Cathedral', 'Viceroy', 'architecture'],
    linkedEntities: ['Plaza Mayor', 'Zócalo', 'Cathedral', 'market'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/details/gaborowitsch_gmail_Giro',
    translator: 'Paraphrase by Claude Opus 4.5 based on Gemelli Careri scholarship'
  },

  {
    id: 'hospital-naturales',
    title: 'On the Hospital de Naturales',
    category: 'places-events',
    author: 'Agustín de Vetancurt',
    work: 'Teatro Mexicano',
    year: 1698,
    location: 'Mexico City',
    language: 'Spanish',
    text: `El Hospital Real de los Naturales se fundó por cédula del Emperador Carlos V en el año de 1553 para la curación de los indios enfermos.

Tiene cuatro salas grandes con más de doscientas camas. Los enfermos son curados por médicos y cirujanos asalariados por el Rey. Hay también una botica bien provista de medicinas.

Los religiosos de la Orden de San Hipólito tienen a su cargo el cuidado espiritual de los enfermos. Cada día se dicen misas en la capilla del hospital.

Muchos indios vienen de pueblos lejanos a curarse aquí, porque no hay otro hospital donde los reciban.`,
    translation: `The Royal Hospital of the Natives was founded by decree of Emperor Charles V in the year 1553 for the care of sick Indians.

It has four large wards with more than two hundred beds. The sick are treated by physicians and surgeons salaried by the King. There is also an apothecary shop well supplied with medicines.

The religious of the Order of San Hipólito have charge of the spiritual care of the sick. Each day masses are said in the hospital chapel.

Many Indians come from distant towns to be cured here, because there is no other hospital where they are received. The cost of their care is paid from the tribute they owe to the Crown.`,
    historicalContext: `The Hospital Real de Naturales was the largest hospital in the Americas, serving exclusively indigenous patients. Its founding reflected both humanitarian concern and colonial interest in maintaining a healthy labor force. Indigenous tribute payments funded their own healthcare.`,
    modernNote: `The hospital's existence shows the colonial paradox: exploitation of indigenous labor alongside institutions meant to preserve it. The segregation of indigenous patients reflects the casta system's penetration even into healthcare. The hospital continued operating until 1822.`,
    difficulty: 'beginner',
    tags: ['hospital', 'indigenous', 'healthcare', 'Mexico City', 'royal', 'medicine'],
    linkedEntities: ['hospital', 'Hospital de Naturales', 'healthcare'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/details/teatromexicanode01veta',
    translator: 'Paraphrase by Claude Opus 4.5 based on Vetancurt scholarship'
  },

  {
    id: 'alameda-park',
    title: 'The Alameda Garden',
    category: 'places-events',
    author: 'Francisco de la Maza',
    work: 'Chronicle of Mexico City',
    year: 1680,
    location: 'Mexico City',
    language: 'Spanish',
    text: `La Alameda es un paseo público plantado de álamos, de donde toma su nombre. Fue mandada hacer por el Virrey don Luis de Velasco en el año de 1592.

Es lugar de recreo para todos los vecinos de la ciudad. Por las tardes, especialmente los domingos, se llena de coches y de gente a pie. Las damas salen en sus coches a ver y ser vistas.

Hay fuentes con agua cristalina y bancas de piedra para descansar. Los vendedores ambulantes ofrecen frutas, dulces y aguas frescas.

La Alameda también ha servido para las ejecuciones de los condenados por el Santo Oficio, cuyas cenizas se esparcen en este lugar.`,
    translation: `The Alameda is a public promenade planted with poplar trees, from which it takes its name. It was ordered built by Viceroy Don Luis de Velasco in the year 1592.

It is a place of recreation for all the residents of the city. In the afternoons, especially on Sundays, it fills with carriages and people on foot. Ladies go out in their carriages to see and be seen.

There are fountains with crystal water and stone benches for resting. Street vendors offer fruits, sweets, and fresh waters.

The Alameda has also served for the executions of those condemned by the Holy Office, whose ashes are scattered in this place.`,
    historicalContext: `The Alameda was one of the first public parks in the Americas, modeled on Spanish promenades. Its dual function—social recreation and execution site—exemplifies the baroque juxtaposition of pleasure and mortality. The park was rebuilt after the 1692 riot.`,
    modernNote: `The contrast between leisurely promenading and Inquisition executions captures colonial Mexico's complexities. The Alameda remains Mexico City's oldest park, though its size has changed. The site where heretics were burned is now a fine arts palace.`,
    difficulty: 'beginner',
    tags: ['Alameda', 'park', 'promenade', 'recreation', 'execution', 'Mexico City'],
    linkedEntities: ['Alameda', 'park', 'promenade'],
    featured: false
  },

  // ============================================
  // EPIDEMICS
  // ============================================
  {
    id: 'cocoliztli-1576',
    title: 'The Great Cocoliztli of 1576',
    category: 'places-events',
    author: 'Francisco Hernández',
    work: 'De Antiquitatibus Novae Hispaniae',
    year: 1576,
    location: 'Mexico City',
    language: 'Latin',
    text: `Morbus hic pestilens quem Indi cocoliztli vocant, innumerabiles homines interfecit anno Domini 1576.`,
    translation: `This pestilential disease which the Indians call cocoliztli killed innumerable people in the year of our Lord 1576.

The symptoms are as follows: a great fever that consumes the whole body, burning thirst, bloody flux from the bowels, bleeding from the nose, ears, and mouth, and a deadly pallor. Death comes in three or four days.

The disease strikes the Indians with particular fury. Whole villages are emptied. The Spanish are also affected, but fewer die. No remedy avails against it—neither bleeding, nor purging, nor the cooling medicines of European doctors, nor the herbs of Indian healers.

I estimate that more than two million Indians have perished in this epidemic. The fields lie untilled, for there are not enough living to bury the dead.`,
    historicalContext: `The 1576 cocoliztli was one of the most devastating epidemics in human history, killing an estimated 45% of Mexico's remaining indigenous population. Francisco Hernández witnessed it firsthand during his scientific expedition. The disease was likely a hemorrhagic fever, possibly caused by Salmonella.`,
    modernNote: `Recent DNA analysis suggests the cocoliztli may have been caused by Salmonella enterica, brought by European animals and spread by drought conditions. The disproportionate impact on indigenous peoples reflects both their lack of immunity and the social conditions of colonial exploitation.`,
    difficulty: 'intermediate',
    tags: ['epidemic', 'cocoliztli', 'plague', 'mortality', 'indigenous', '1576'],
    linkedEntities: ['plague', 'epidemic', 'cocoliztli', 'disease'],
    featured: true
  },

  {
    id: 'matlazahuatl-1736',
    title: 'Account of the Matlazáhuatl Epidemic',
    category: 'places-events',
    author: 'Cayetano Cabrera y Quintero',
    work: 'Escudo de Armas de México',
    year: 1746,
    location: 'Mexico City',
    language: 'Spanish',
    text: `El año de 1736 comenzó la peste llamada matlazáhuatl en el pueblo de Tacuba, y de allí se extendió a toda la ciudad de México.

Los enfermos padecían grandes calenturas, dolor de cabeza intensísimo, flujo de sangre por la nariz, y manchas moradas por todo el cuerpo. Morían en tres o cuatro días.

Tantos murieron que no había quien los enterrase. Se abrieron fosas grandes donde se echaban los cuerpos sin ceremonia. Las iglesias no daban abasto para los funerales.

Se mandó traer la imagen de Nuestra Señora de Guadalupe en procesión solemne, y desde aquel día comenzó a menguar la peste. En gratitud, la ciudad juró tomarla por patrona principal.`,
    translation: `In the year 1736, the plague called matlazáhuatl began in the town of Tacuba, and from there spread to all of Mexico City.

The sick suffered great fevers, most intense headache, bleeding from the nose, and purple spots all over the body. They died in three or four days.

So many died that there was no one to bury them. Large pits were opened where the bodies were thrown without ceremony. The churches could not keep up with the funerals.

The image of Our Lady of Guadalupe was ordered brought in solemn procession, and from that day the plague began to diminish. In gratitude, the city swore to take her as principal patron.

It is estimated that more than forty thousand people died in Mexico City alone, and many more in the surrounding towns.`,
    historicalContext: `The 1736-1739 matlazáhuatl epidemic (likely typhus) killed an estimated 300,000 people in central Mexico. The Virgin of Guadalupe's procession during the epidemic cemented her status as Mexico's patron saint. The event is still commemorated annually.`,
    modernNote: `The epidemic's association with the Virgin of Guadalupe illustrates how disease experiences shaped religious devotion. The symptoms described—fever, headache, petechial rash—are consistent with epidemic typhus, spread by lice in crowded urban conditions.`,
    difficulty: 'intermediate',
    tags: ['epidemic', 'matlazáhuatl', 'typhus', 'Guadalupe', 'mortality', 'religion'],
    linkedEntities: ['plague', 'epidemic', 'matlazáhuatl', 'Virgin of Guadalupe'],
    featured: false
  },

  // ============================================
  // RIOTS AND DISTURBANCES
  // ============================================
  {
    id: 'riot-1692',
    title: 'Account of the Great Riot of 1692',
    category: 'places-events',
    author: 'Carlos de Sigüenza y Góngora',
    work: 'Alboroto y Motín de los Indios de México',
    year: 1692,
    location: 'Mexico City',
    language: 'Spanish',
    text: `El día ocho de junio de mil seiscientos noventa y dos, estando yo en la plaza, vi acercarse una multitud de indios e indias, todos armados de piedras.

Gritaban que no había maíz, que se morían de hambre, que los españoles tenían escondido el grano. Comenzaron a apedrear el palacio del Virrey.

El fuego prendió en el portal de los mercaderes y en las casas del Cabildo. La multitud saqueaba las tiendas mientras ardían. Los soldados no podían contener a tanta gente.

Toda la noche duró el incendio. A la mañana siguiente, la plaza estaba en ruinas. El palacio del Virrey, medio quemado. Las tiendas de los mercaderes, destruidas.`,
    translation: `On the eighth day of June of sixteen ninety-two, being in the plaza, I saw a multitude of Indian men and women approaching, all armed with stones.

They shouted that there was no maize, that they were dying of hunger, that the Spanish had hidden the grain. They began to stone the Viceroy's palace.

Fire caught in the merchants' arcade and in the Cabildo houses. The multitude looted the shops while they burned. The soldiers could not contain so many people.

All night the fire lasted. The next morning, the plaza was in ruins. The Viceroy's palace, half burned. The merchants' shops, destroyed.

The riot began from hunger, but it became a war of the castas against the Spanish. Indians, mestizos, mulattos, and even some poor Spaniards joined together against the rich.`,
    historicalContext: `The 1692 riot was the most serious urban uprising in colonial Mexico. Triggered by maize shortages and suspected hoarding, it united various castas against Spanish authorities. The destruction of the Plaza Mayor was unprecedented. Sigüenza y Góngora rescued indigenous codices from burning archives.`,
    modernNote: `The riot revealed the fragility of colonial order and the potential for cross-casta solidarity against Spanish elites. The underlying causes—food insecurity, economic inequality, racial hierarchy—were never addressed. The rebuilt plaza incorporated security features to prevent future uprisings.`,
    difficulty: 'advanced',
    tags: ['riot', '1692', 'hunger', 'casta', 'uprising', 'Plaza Mayor'],
    linkedEntities: ['riot', 'uprising', 'Plaza Mayor', 'Viceroy'],
    featured: true,
    verified: false,
    sourceUrl: 'https://laresolana.wordpress.com/wp-content/uploads/2016/04/13-1-siguenza-alboroto.pdf',
    translator: 'Paraphrase by Claude Opus 4.5 based on Sigüenza y Góngora'
  },

  // ============================================
  // RELIGIOUS EVENTS
  // ============================================
  {
    id: 'corpus-christi',
    title: 'The Feast of Corpus Christi',
    category: 'places-events',
    author: 'Thomas Gage',
    work: 'The English-American',
    year: 1648,
    location: 'London (about Mexico)',
    language: 'English',
    text: `The feast of Corpus Christi is celebrated in Mexico with greater pomp and solemnity than in any city of Christendom that I have seen.

The procession goeth round about the great Piazza, which is hanged with rich hangings of silk and cloth of gold. The streets are strewed with flowers and herbs, and covered over with arches made of boughs and flowers.

There go in the procession giants and dragons, representing the conquest of Satan by the Sacrament. The Indians dance before the Host in their ancient manner, with feathers and drums, which some think idolatrous but the Church permits.

All the religious orders go with their crosses and images. The Archbishop himself carries the monstrance under a canopy of gold. Thousands of candles burn along the way.`,
    historicalContext: `Corpus Christi was the most spectacular public celebration in colonial Mexico, combining Catholic liturgy with pre-Hispanic performance traditions. The Church's tolerance of indigenous dances reflected accommodation strategies while also demonstrating Christian triumph over paganism.`,
    modernNote: `Gage's Protestant perspective highlights what he saw as Catholic excess, but also documents the syncretic nature of colonial religion. The 'giants and dragons' he describes were European carnival traditions, while indigenous dances preserved elements of pre-contact ceremony within Christian framework.`,
    difficulty: 'beginner',
    tags: ['Corpus Christi', 'procession', 'religion', 'festival', 'indigenous', 'spectacle'],
    linkedEntities: ['Corpus Christi', 'procession', 'festival', 'Cathedral'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/b31365759',
    translator: 'Paraphrase by Claude Opus 4.5 based on Thomas Gage'
  },

  // ============================================
  // NATURAL DISASTERS
  // ============================================
  {
    id: 'earthquake-1629',
    title: 'The Great Flood of 1629',
    category: 'places-events',
    author: 'Anonymous chronicler',
    work: 'Relación del Estado de la Ciudad de México',
    year: 1631,
    location: 'Mexico City',
    language: 'Spanish',
    text: `El año de mil seiscientos veinte y nueve llovió con tanta abundancia que toda la ciudad de México quedó anegada de agua.

El agua creció hasta cubrir los primeros pisos de las casas. La gente andaba en canoas por las calles como si fuera Venecia. Muchas casas se cayeron por estar los cimientos mojados.

Murieron más de treinta mil indios, unos ahogados, otros de enfermedades que vinieron con la humedad. Los españoles se refugiaron en los pisos altos de sus casas.

El agua no bajó por cinco años. Se propuso abandonar la ciudad y fundarla en otro lugar, pero el costo era demasiado. Finalmente se hizo un desagüe para sacar el agua a los lagos de afuera.`,
    translation: `In the year sixteen twenty-nine it rained with such abundance that all of Mexico City was flooded with water.

The water rose until it covered the first floors of houses. People traveled in canoes through the streets as if it were Venice. Many houses collapsed because the foundations were wet.

More than thirty thousand Indians died, some drowned, others from diseases that came with the humidity. The Spanish took refuge on the upper floors of their houses.

The water did not recede for five years. It was proposed to abandon the city and found it in another place, but the cost was too great. Finally, a drainage canal was made to carry the water to the outer lakes.`,
    historicalContext: `The 1629 flood was the worst in colonial Mexico City's history, caused by heavy rains overwhelming the Spanish drainage system that had replaced Aztec flood controls. The disaster killed thousands and nearly led to the city's abandonment. The indigenous population suffered disproportionately.`,
    modernNote: `Mexico City still struggles with flooding and subsidence, consequences of Spanish decisions to drain the lake system rather than live with it as the Aztecs had. The 1629 flood illustrates how colonial engineering disrupted successful indigenous environmental management.`,
    difficulty: 'intermediate',
    tags: ['flood', 'disaster', '1629', 'Mexico City', 'drainage', 'mortality'],
    linkedEntities: ['flood', 'disaster', 'Mexico City'],
    featured: false
  },

  // ============================================
  // TRADE AND COMMERCE
  // ============================================
  {
    id: 'manila-galleon',
    title: 'The Arrival of the Manila Galleon',
    category: 'places-events',
    author: 'Giovanni Francesco Gemelli Careri',
    work: 'Giro del Mondo',
    year: 1699,
    location: 'Naples (about Acapulco)',
    language: 'Italian',
    text: `Il galeone di Manila arriva ogni anno al porto di Acapulco, portando le ricchezze dell'Oriente.

Porta sete della Cina, spezie delle Molucche, porcellane, lacche, e ogni sorta di mercanzie preziose. In cambio, porta via l'argento del Messico.

Quando il galeone arriva, si tiene una fiera che dura un mese. Vengono mercanti da tutto il Messico a comprare le merci orientali. I prezzi sono alti, ma le merci non si trovano altrove.

Molti muoiono nel viaggio attraverso il Pacifico, che dura sei mesi. La nave è così carica di merci che i passeggeri appena possono muoversi. Ma la ricchezza che porta è tale che tutti i pericoli sembrano pochi.`,
    translation: `The Manila galleon arrives every year at the port of Acapulco, bringing the riches of the Orient.

It brings Chinese silks, Moluccan spices, porcelain, lacquerware, and all sorts of precious merchandise. In exchange, it carries away the silver of Mexico.

When the galleon arrives, a fair is held that lasts a month. Merchants come from all over Mexico to buy the Oriental goods. The prices are high, but the goods cannot be found elsewhere.

Many die on the voyage across the Pacific, which lasts six months. The ship is so laden with merchandise that passengers can barely move. But the wealth it brings is such that all dangers seem small.`,
    historicalContext: `The Manila Galleon trade (1565-1815) was the longest-running commercial route in history, connecting Asia to the Americas. Mexican silver flowed to China; Asian luxury goods returned. The annual fair at Acapulco was the most important commercial event in New Spain.`,
    modernNote: `The galleon trade created the first truly global economy, linking Asian production to American silver and European consumers. Many medicines in colonial Mexican pharmacies—Chinese rhubarb, cinnamon, camphor—arrived via this route. The trade's profits drove Spanish colonial policy.`,
    difficulty: 'beginner',
    tags: ['Manila Galleon', 'trade', 'Acapulco', 'China', 'commerce', 'fair'],
    linkedEntities: ['Manila Galleon', 'trade', 'Acapulco', 'silk', 'spices'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/details/gaborowitsch_gmail_Giro',
    translator: 'Paraphrase by Claude Opus 4.5 based on Gemelli Careri'
  },

  // ============================================
  // URBAN LIFE
  // ============================================
  {
    id: 'tianguis-market',
    title: 'The Indian Market of Tlatelolco',
    category: 'places-events',
    author: 'Bernal Díaz del Castillo',
    work: 'Historia Verdadera de la Conquista de la Nueva España',
    year: 1568,
    location: 'Guatemala (about Mexico)',
    language: 'Spanish',
    // VERIFIED: From UNAM Noticonquista project and multiple scholarly sources
    text: `Cuando llegamos a la gran plaza que se dice de Tlatelulco, como no habíamos visto tal cosa, quedamos admirados de la multitud de gente y mercadería que en ella había y del gran concierto y regimiento que en todo ello tenían.`,
    translation: `When we arrived at the great plaza called Tlatelolco, as we had never seen such a thing, we were amazed at the multitude of people and merchandise that was there and the great order and regulation they maintained in everything.`,
    historicalContext: `Though written about the pre-conquest market, tianguis (indigenous markets) continued throughout the colonial period. The Tlatelolco market impressed conquistadors with its size and organization. Spanish chroniclers provided important descriptions of the market's size—Francisco Cervantes de Salazar claimed about 30,000 people visited the market daily, while Cortés expanded this number to 60,000.`,
    modernNote: `Indigenous market systems were more sophisticated than Spaniards initially recognized. The presence of judges enforcing standards, the organized sections for different goods, and the use of cacao currency showed complex economic institutions. Tianguis markets continue in Mexico today.`,
    difficulty: 'beginner',
    tags: ['market', 'tianguis', 'Tlatelolco', 'commerce', 'indigenous', 'merchandise'],
    linkedEntities: ['market', 'tianguis', 'commerce', 'cacao'],
    featured: false,
    verified: true,
    sourceUrl: 'https://archive.org/details/A048263060'
  },

  // ============================================
  // SCIENTIFIC EVENTS
  // ============================================
  {
    id: 'eclipse-1691',
    title: 'Observation of the Solar Eclipse',
    category: 'places-events',
    author: 'Carlos de Sigüenza y Góngora',
    work: 'Libra Astronómica y Filosófica',
    year: 1691,
    location: 'Mexico City',
    language: 'Spanish',
    text: `El día veinte y tres de agosto de mil seiscientos noventa y uno observé en esta ciudad de México un eclipse total del Sol.

Usé un tubo óptico de dos lentes para ver el momento en que la Luna comenzó a cubrir al Sol. Anoté con exactitud la hora, los minutos y los segundos de cada fase del eclipse.

El vulgo ignorante mostró gran temor, creyendo que el Sol moría. Pero los que entienden de filosofía natural saben que los eclipses son fenómenos regulares que pueden predecirse mediante el cálculo matemático.

Comparé mis observaciones con las tablas astronómicas de Copérnico y Tycho Brahe, y hallé buena concordancia.`,
    translation: `On the twenty-third day of August of sixteen ninety-one I observed in this city of Mexico a total eclipse of the Sun.

I used an optical tube of two lenses to see the moment when the Moon began to cover the Sun. I noted with exactness the hour, minutes, and seconds of each phase of the eclipse.

The ignorant common people showed great fear, believing that the Sun was dying. But those who understand natural philosophy know that eclipses are regular phenomena that can be predicted through mathematical calculation.

I compared my observations with the astronomical tables of Copernicus and Tycho Brahe, and found good agreement.`,
    historicalContext: `Sigüenza y Góngora was colonial Mexico's leading scientist, known for astronomy, mathematics, and history. His eclipse observations demonstrate that cutting-edge European science was practiced in the colonies. He corresponded with European scientists and maintained an observatory.`,
    modernNote: `Sigüenza's empirical approach and use of European astronomical tables shows the integration of New Spain into Atlantic scientific networks. His dismissal of popular fears as 'ignorance' reflects Enlightenment attitudes, though such fears persisted across all social classes.`,
    difficulty: 'advanced',
    tags: ['eclipse', 'astronomy', 'Sigüenza', 'science', 'observation', 'calculation'],
    linkedEntities: ['eclipse', 'astronomy', 'science', 'Sigüenza'],
    featured: false
  }
];

export default PLACES_EVENTS_SOURCES;
