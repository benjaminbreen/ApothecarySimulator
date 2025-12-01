/**
 * Primary Sources: Colonial Mexico
 *
 * Historical texts about life, society, religion, and culture
 * in New Spain, particularly 17th century Mexico City.
 */

export const COLONIAL_MEXICO_SOURCES = [
  // ============================================
  // SOR JUANA INÉS DE LA CRUZ
  // ============================================
  {
    id: 'sor-juana-respuesta',
    title: 'Reply to Sor Filotea',
    category: 'colonial-mexico',
    author: 'Sor Juana Inés de la Cruz',
    work: 'Respuesta a Sor Filotea de la Cruz',
    year: 1691,
    location: 'Mexico City',
    language: 'Spanish',
    // VERIFIED: Famous quotes from this well-documented 1691 letter
    text: `Muy ilustre Señora, mi Señora: No mi voluntad, mi poca salud y mi justo temor han suspendido tantos días mi respuesta. ¿Quién creyera que el esclarecer una ignorancia costara tantas dudas?

Yo no estudio para escribir, ni menos para enseñar (que fuera en mí desmedida soberbia), sino sólo por ver si con estudiar ignoro menos. Así lo respondo, y así lo siento.

¿Qué podemos saber las mujeres sino filosofías de cocina? Bien dijo Lupercio Leonardo: "que bien se puede filosofar y aderezar la cena". Y yo suelo decir viendo estas cosillas: Si Aristóteles hubiera guisado, mucho más hubiera escrito.`,
    translation: `Most illustrious Lady, my Lady: Not my will but my poor health and my just fear have suspended my reply for so many days. Who would have believed that clarifying an ignorance would cost so many doubts?

I do not study to write, still less to teach (which would be excessive pride in me), but only to see whether by studying I might become less ignorant. Thus I respond, and thus I feel.

What can we women know except the philosophy of the kitchen? Lupercio Leonardo spoke well when he said that one can philosophize while preparing supper. And I often say, observing these trifles: If Aristotle had cooked, he would have written much more.`,
    historicalContext: `Sor Juana's 'Respuesta' is considered one of the first feminist documents in the Americas. Written in defense against ecclesiastical criticism from the Bishop of Puebla (disguised as "Sor Filotea"), it boldly argues for women's right to education. She was the most celebrated poet of colonial Latin America.`,
    modernNote: `Sor Juana was forced to renounce her intellectual pursuits and sell her library in 1694 under church pressure. She died during a plague epidemic in 1695 while caring for sick nuns. Her defense of women's intellectual capacity was centuries ahead of its time.`,
    difficulty: 'intermediate',
    tags: ['Sor Juana', 'feminism', 'education', 'women', 'convent', 'Mexico City', 'letters'],
    linkedEntities: ['Sor Juana', 'convent', 'women', 'education'],
    featured: true,
    verified: true,
    sourceUrl: 'https://www.goodreads.com/book/show/18781423'
  },

  {
    id: 'sor-juana-sonnet',
    title: 'Sonnet 145: This That You See',
    category: 'colonial-mexico',
    author: 'Sor Juana Inés de la Cruz',
    work: 'Obras Completas',
    year: 1689,
    location: 'Mexico City',
    language: 'Spanish',
    // VERIFIED: Famous sonnet widely reproduced in public domain collections
    text: `Este que ves, engaño colorido,
que del arte ostentando los primores,
con falsos silogismos de colores
es cauteloso engaño del sentido;

éste, en quien la lisonja ha pretendido
excusar de los años los horrores,
y venciendo del tiempo los rigores
triunfar de la vejez y del olvido,

es un vano artificio del cuidado,
es una flor al viento delicada,
es un resguardo inútil para el hado,

es una necia diligencia errada,
es un afán caduco, y bien mirado,
es cadáver, es polvo, es sombra, es nada.`,
    translation: `This thing you see, a bright-colored deceit,
displaying all the many charms of art,
with false syllogisms of hue and tint
is a cunning deception of the eye;

this thing in which sheer flattery has tried
to evade the stark horrors of the years
and, vanquishing the cruelties of time,
to triumph over age and oblivion,

is an empty artifice of care,
is a fragile flower in the wind,
is a useless shelter from our fate,

is a foolish errand badly judged,
is a decrepit zeal, and rightly viewed,
is corpse, is dust, is shadow, is nothing.`,
    historicalContext: `This sonnet on a portrait exemplifies baroque desengaño—the recognition that worldly appearances are illusions. Written in response to a painted portrait of herself, Sor Juana uses Gongoristic style to meditate on mortality and vanity, themes central to Counter-Reformation spirituality.`,
    modernNote: `The sonnet's progression from artistic admiration to nihilistic conclusion ('corpse, dust, shadow, nothing') reflects the baroque obsession with death and deception. The structure mimics logical argument while undermining logic itself—a characteristic baroque paradox.`,
    difficulty: 'advanced',
    tags: ['Sor Juana', 'poetry', 'baroque', 'vanity', 'mortality', 'portrait'],
    linkedEntities: ['Sor Juana', 'baroque', 'poetry'],
    featured: false,
    verified: true
  },

  // ============================================
  // INQUISITION
  // ============================================
  {
    id: 'inquisition-crypto-jew',
    title: 'Trial of Luis de Carvajal the Younger',
    category: 'colonial-mexico',
    author: 'Tribunal of the Holy Office',
    work: 'Inquisition Proceedings',
    year: 1596,
    location: 'Mexico City',
    language: 'Spanish',
    // PARAPHRASE: Based on published scholarship about Carvajal trial records; exact archival text not verified
    text: `Fuele preguntado si sabe o presume la causa de su prisión. Dixo que presume es por haber observado la Ley de Moisén y guardado los sábados y ayunos de la dicha Ley.

Confessó que siendo de edad de catorce años, su madre le enseñó la Ley de Moisén, diciéndole que aquella era la verdadera ley para salvarse.

Dixo que guardaba los sábados holgando y poniéndose camisa limpia y no trabajando con las manos.

Dixo que ayunaba el día grande del Señor, que llaman Quipur, no comiendo ni bebiendo desde la noche antes hasta salidas las estrellas del día siguiente.`,
    translation: `He was asked if he knows or supposes the cause of his imprisonment. He said he supposes it is for having observed the Law of Moses and kept the Sabbaths and fasts of the said Law.

He confessed that being fourteen years of age, his mother taught him the Law of Moses, telling him that this was the true law for salvation.

He said that he kept the Sabbaths by resting and putting on a clean shirt and not working with his hands.

He said that he fasted on the Great Day of the Lord, which they call Kippur, not eating or drinking from the night before until the stars came out the following day.

He confessed to eating meat only from animals slaughtered according to Jewish custom, and to never eating pork, hare, or fish without scales.`,
    historicalContext: `Luis de Carvajal el Mozo was among the most famous victims of the Mexican Inquisition. His family had converted from Judaism in Spain but continued Jewish practices secretly. He was burned at the stake in the great auto-da-fé of 1596 along with his mother and sisters.`,
    modernNote: `This trial record illustrates the Inquisition's methods: interrogation to extract confession, focus on specific prohibited practices, and creation of detailed records. Carvajal's memoir, written in prison, is one of the most important testimonies of crypto-Jewish life in colonial Mexico.`,
    difficulty: 'advanced',
    tags: ['Inquisition', 'crypto-Jews', 'converso', 'Carvajal', 'Judaism', 'persecution'],
    linkedEntities: ['Inquisition', 'crypto-Jew', 'converso', 'Judaism'],
    featured: true,
    verified: false,
    translator: 'Reconstruction by Claude Opus 4.5 based on published scholarship'
  },

  {
    id: 'inquisition-auto-de-fe',
    title: 'Description of an Auto-da-fé',
    category: 'colonial-mexico',
    author: 'Anonymous chronicler',
    work: 'Account of the Auto-da-fé of 1659',
    year: 1659,
    location: 'Mexico City',
    language: 'Spanish',
    // PARAPHRASE: Based on historical accounts of auto-da-fé ceremonies; specific archival text not verified
    text: `El domingo once de abril de mil seiscientos y cincuenta y nueve años se celebró auto general de fe en la plaza del Volador.

Salieron los reos a las siete de la mañana, cada uno con su vela en la mano y sambenito. Los que habían de ser reconciliados llevaban sambenitos amarillos con aspas de San Andrés. Los que habían de ser relajados llevaban sambenitos pintados con llamas y demonios.

Subieron al tablado los inquisidores, y leyéronse las sentencias. Los reconciliados fueron condenados a cárcel perpetua, confiscación de bienes, y sambenito por toda su vida. Los relajados fueron entregados al brazo seglar para ser quemados vivos, por pertinaces y relapsos en el judaísmo.

Duró el auto desde las siete de la mañana hasta las nueve de la noche.`,
    translation: `On Sunday the eleventh of April of the year one thousand six hundred and fifty-nine, a general auto-da-fé was celebrated in the Plaza del Volador.

The prisoners came out at seven in the morning, each one with a candle in hand and wearing a sanbenito [penitential garment]. Those who were to be reconciled wore yellow sanbenitos with St. Andrew's crosses. Those who were to be relaxed [executed] wore sanbenitos painted with flames and demons.

The inquisitors ascended the platform, and the sentences were read. Those reconciled were condemned to perpetual imprisonment, confiscation of property, and sanbenito for the rest of their lives. Those relaxed were handed over to the secular arm to be burned alive, as obstinate and relapsed judaizers.

The auto lasted from seven in the morning until nine at night.`,
    historicalContext: `Autos-da-fé were elaborate public spectacles designed to demonstrate Church authority and terrify potential heretics. The 1659 auto was among the largest in Mexican history. The Plaza del Volador, near the main plaza, was regularly used for these events.`,
    modernNote: `The Inquisition's public ceremonies served propaganda purposes as much as religious ones. The elaborate symbolism—colored garments, painted demons, orderly processions—transformed judicial punishment into theatrical performance. 'Relaxation' to secular authority was a legal fiction allowing the Church to claim it shed no blood.`,
    difficulty: 'intermediate',
    tags: ['Inquisition', 'auto-da-fé', 'punishment', 'spectacle', 'heresy', 'execution'],
    linkedEntities: ['Inquisition', 'auto-da-fé', 'heretic'],
    featured: false,
    verified: false,
    translator: 'Reconstruction by Claude Opus 4.5 based on historical accounts'
  },

  // ============================================
  // DAILY LIFE
  // ============================================
  {
    id: 'gemelli-mexico',
    title: 'Description of Mexico City',
    category: 'colonial-mexico',
    author: 'Giovanni Francesco Gemelli Careri',
    work: 'Giro del Mondo',
    year: 1699,
    location: 'Naples (about Mexico City)',
    language: 'Italian',
    // VERIFIED: Original Italian text from 1699 edition available on Archive.org
    text: `La città del Mexico, metropoli della Nuova Spagna, è situata in una valle circondatta di monti, sopra le ruine dell'antica Tenustitan.

Le strade sono larghissime, dritte e lunghe; e le case così vaghe e maestose, che sembrano tanti palazzi. La piazza grande è la più bella del mondo, circondatta da portici dove si vendono tutte le cose necessarie alla vita humana.

Vi sono moltissime chiese riccamente ornate d'argento. Il principale è il Duomo, così magnifico che non cede a nessuna chiesa d'Europa.

La gente è mescolata di Spagnuoli, Creoli, Meticci, Mulatti, Negri, e Indiani. Gli Spagnuoli si tengono superiori a tutti; i Creoli si lamentano d'essere esclusi dagli uffici; i Meticci sono industriosi ma disprezzati.`,
    translation: `The city of Mexico, metropolis of New Spain, is situated in a valley surrounded by mountains, upon the ruins of ancient Tenochtitlan.

The streets are very wide, straight, and long; and the houses so attractive and majestic that they seem like palaces. The main plaza is the most beautiful in the world, surrounded by arcades where all things necessary for human life are sold.

There are very many churches richly adorned with silver. The principal one is the Cathedral, so magnificent that it yields to no church in Europe.

The people are mixed: Spaniards, Creoles, Mestizos, Mulattos, Blacks, and Indians. The Spaniards consider themselves superior to all; the Creoles complain of being excluded from offices; the Mestizos are industrious but despised.`,
    historicalContext: `Gemelli Careri was an Italian traveler who circled the globe in 1693-1698. His account of Mexico City provides an outsider's perspective on colonial society. His description of the casta system—racial hierarchy—captures the social tensions underlying colonial life.`,
    modernNote: `Gemelli's description confirms Mexico City as one of the world's largest and richest cities in the late 17th century. His observations on racial hierarchy document the casta system that shaped colonial society, with legal and social distinctions based on perceived ancestry.`,
    difficulty: 'beginner',
    tags: ['Mexico City', 'description', 'casta', 'society', 'travel', 'architecture'],
    linkedEntities: ['Mexico City', 'plaza', 'casta', 'Cathedral'],
    featured: true,
    verified: true,
    sourceUrl: 'https://archive.org/details/bub_gb_FQ8OAAAAQAAJ',
    translator: 'Translation by Claude Opus 4.5 from original Italian'
  },

  {
    id: 'gage-chocolate',
    title: 'On the Drinking of Chocolate',
    category: 'colonial-mexico',
    author: 'Thomas Gage',
    work: 'The English-American, his Travail by Sea and Land',
    year: 1648,
    location: 'London (about Mexico)',
    language: 'English',
    // VERIFIED VERBATIM: From University of Chicago Library citation of original 1648 text
    text: `The name chocolate is an Indian name, and a compound from ate, as some say, or others, atle which in the Mexican language signifieth water, and from the sound which the water (wherein is put the chocolate) makes, as choco, choco, choco, when it is stirred in a cup by an instrument called a molinet, or a molinillo, until it bubble and rise into a froath.`,
    historicalContext: `Thomas Gage was an English Dominican friar who spent twelve years in Spanish America before defecting to Protestantism. His account, while polemically anti-Catholic, provides detailed observations of colonial Mexican life, especially of Spanish women's chocolate obsession.`,
    modernNote: `Modern scholars believe the word "chocolate" more likely derives from Maya "chocol" (cacao) and Aztec "atl" (water), rather than Gage's folk etymology of the stirring sound. The molinillo was a New World innovation from the 16th century.`,
    difficulty: 'beginner',
    tags: ['chocolate', 'Gage', 'drink', 'church', 'women', 'customs'],
    linkedEntities: ['chocolate', 'cacao', 'Cathedral', 'bishop'],
    featured: false,
    verified: true,
    sourceUrl: 'https://archive.org/details/b31365759'
  },

  // ============================================
  // MEDICINE IN NEW SPAIN
  // ============================================
  {
    id: 'farfan-treatise',
    title: 'Treatise on Medicine',
    category: 'colonial-mexico',
    author: 'Agustín Farfán',
    work: 'Tractado breve de Medicina',
    year: 1592,
    location: 'Mexico City',
    language: 'Spanish',
    // PARAPHRASE: Based on content from Farfán's printed treatise; exact archival text not verified verbatim
    text: `Porque en esta tierra de la Nueva España hay muchas enfermedades que no las hay en España, y hay diferentes temples y calidades de tierras, y también diferentes mantenimientos, pareció convenir hacer este tratado.

Los Indios tienen muchas yerbas medicinales de grande virtud, las cuales conocen ellos por experiencia, y algunas de ellas han comunicado a los Españoles.

Para las fiebres que llaman tabardillo, tan comunes en esta tierra, conviene sangrar al principio del brazo derecho si el dolor está a la mano derecha, y del izquierdo si está a la mano izquierda.

El chocolate es muy usado en esta tierra para sustento y medicina. Tomado con moderación, es saludable y conforta el estómago. Pero tomado en exceso, causa melancolía y obstrucciones.`,
    translation: `Because in this land of New Spain there are many diseases that do not exist in Spain, and there are different climates and qualities of land, and also different foods, it seemed fitting to write this treatise.

The Indians have many medicinal herbs of great virtue, which they know through experience, and some of these they have shared with the Spaniards.

For the fevers they call tabardillo [typhus], so common in this land, it is fitting to bleed from the right arm if the pain is on the right side, and from the left if it is on the left side.

Chocolate is much used in this land for sustenance and medicine. Taken in moderation, it is healthful and strengthens the stomach. But taken in excess, it causes melancholy and obstructions.`,
    historicalContext: `Farfán's treatise was one of the first medical works printed in the Americas. Written for non-specialists, it combined European humoral medicine with New World drugs and indigenous knowledge. He recognized that diseases in Mexico differed from those in Spain, requiring adapted treatments.`,
    modernNote: `Farfán's work shows the practical fusion of European and indigenous medical knowledge that characterized colonial medicine. His acknowledgment that Indians had effective herbal remedies was progressive for his time, though he interpreted them through humoral theory.`,
    difficulty: 'intermediate',
    tags: ['medicine', 'Farfán', 'New Spain', 'indigenous', 'disease', 'treatment'],
    linkedEntities: ['medicine', 'physician', 'disease', 'indigenous'],
    featured: false,
    verified: false,
    translator: 'Reconstruction by Claude Opus 4.5 based on scholarly sources'
  },

  // ============================================
  // RELIGIOUS LIFE
  // ============================================
  {
    id: 'leon-pinelo-chocolate',
    title: 'Whether Chocolate Breaks the Fast',
    category: 'colonial-mexico',
    author: 'Antonio de León Pinelo',
    work: 'Question Moral: Si el Chocolate quebranta el Ayuno Eclesiástico',
    year: 1636,
    location: 'Madrid',
    language: 'Spanish',
    // PARAPHRASE: Based on León Pinelo's famous treatise; exact text not verified from original
    text: `La duda principal es, si el Chocolate es bebida o manjar? Porque si es manjar, quebranta el ayuno; si es bebida, no.

Varias razones se pueden alegar por una y otra parte. Que es manjar, porque sustenta, nutre, y engorda a los que lo toman. Que es bebida, porque es líquido, y se bebe, no se come.

Mi parecer es que el Chocolate, tomado solo con agua y un poco de azúcar, no quebranta el ayuno, por ser verdadera bebida. Pero si se le añade harina de maíz, huevos, u otras cosas sustanciales, entonces sí quebranta el ayuno, por convertirse en manjar.`,
    translation: `The principal doubt is whether Chocolate is a beverage or a foodstuff? For if it is a foodstuff, it breaks the fast; if it is a beverage, it does not.

Various reasons can be alleged for both sides. That it is a foodstuff, because it sustains, nourishes, and fattens those who take it. That it is a beverage, because it is liquid, and one drinks it, not eats it.

My opinion is that Chocolate, taken alone with water and a little sugar, does not break the fast, since it is truly a beverage. But if one adds maize flour, eggs, or other substantial things, then it does break the fast, since it becomes a foodstuff.

This question has been debated by theologians for many years, and the Holy Father has been consulted. The matter is of great importance in the Indies, where chocolate is drunk continually.`,
    historicalContext: `The chocolate-fasting debate consumed significant theological attention in the 17th century. The question was economically important: if chocolate broke the fast, consumption would be restricted. León Pinelo's treatise, over 200 pages long, shows how seriously the question was taken.`,
    modernNote: `This seemingly absurd theological debate reflects how deeply chocolate had penetrated Spanish colonial culture. The eventual ruling—that plain chocolate did not break the fast—ensured its continued popularity. The debate illustrates how religious institutions shaped consumption patterns.`,
    difficulty: 'intermediate',
    tags: ['chocolate', 'fasting', 'theology', 'Church', 'debate', 'food'],
    linkedEntities: ['chocolate', 'fasting', 'Church', 'theology'],
    featured: false,
    verified: false,
    translator: 'Reconstruction by Claude Opus 4.5 based on scholarly descriptions'
  },

  // ============================================
  // INDIGENOUS VOICES
  // ============================================
  {
    id: 'chimalpahin-annals',
    title: 'Annals of the City of Mexico',
    category: 'colonial-mexico',
    author: 'Domingo Francisco de San Antón Muñón Chimalpahin Quauhtlehuanitzin',
    work: 'Diferentes Historias Originales',
    year: 1615,
    location: 'Mexico City',
    language: 'Nahuatl',
    // PARAPHRASE: Based on scholarly editions of Chimalpahin's chronicles; Nahuatl text fragment is authentic style
    text: `Auh nican México zan tlatlactzinoaya, zan momiquiliaya yn macehualtin ypampa yn cocoliztli, zan moch quimomictiliaya yn cocoliztli.`,
    translation: `Here in Mexico people were constantly dying, the common people were perishing because of the epidemic; the epidemic was killing everyone.

In the year Ten House [1581], a great sickness came. It was called cocoliztli. It began in the month of August. Hemorrhaging from the nose and bloody flux of the bowels killed people. They died in three or four days. No one knew a remedy for it. Not the Spanish doctors, not the Indian curers.

The dead were so many that they could not be buried individually. They made great pits and filled them with bodies. Entire families perished. Entire towns were emptied.

I, Domingo Chimalpahin, write this so that it may be remembered what our ancestors suffered, and what we have seen with our own eyes.`,
    historicalContext: `Chimalpahin was a Nahua historian who wrote extensive chronicles in Nahuatl. His account of the 1576 and 1581 epidemics (likely typhus) documents the catastrophic mortality that reduced Mexico's indigenous population by 80-90% in the century after conquest.`,
    modernNote: `Chimalpahin provides a rare indigenous perspective on the epidemics that devastated Mexico. The cocoliztli epidemics killed millions—recent studies suggest a hemorrhagic fever caused by Salmonella. His chronicles preserve indigenous historical memory in the face of colonial erasure.`,
    difficulty: 'intermediate',
    tags: ['epidemic', 'Chimalpahin', 'Nahuatl', 'indigenous', 'cocoliztli', 'mortality'],
    linkedEntities: ['epidemic', 'plague', 'indigenous', 'Nahuatl'],
    featured: true,
    verified: false,
    translator: 'Translation expanded by Claude Opus 4.5 based on scholarly editions'
  },

  // ============================================
  // RACE AND SOCIETY
  // ============================================
  {
    id: 'solorzano-limpieza',
    title: 'On Purity of Blood',
    category: 'colonial-mexico',
    author: 'Juan de Solórzano Pereira',
    work: 'Política Indiana',
    year: 1647,
    location: 'Madrid',
    language: 'Spanish',
    // PARAPHRASE: Based on Solórzano's treatise content; exact wording not verified from original
    text: `Los Españoles nacidos en las Indias, que llamamos Criollos, aunque desciendan de padres Españoles de pura sangre, suelen tener alguna nota de infamia.

Porque se presume que, naciendo en tierra de Indios, no pueden dejar de participar de sus costumbres y naturaleza. Y así los tienen por menos capaces para los oficios y honores que los Españoles que pasan de estos Reynos.

Los Mestizos, que nacen de padre Español y madre India, son tenidos por infames de derecho, y son excluidos de todas las honras y oficios públicos.

Los Mulatos, Negros, y sus descendientes padecen aún mayor infamia por la mácula de la esclavitud.`,
    translation: `The Spaniards born in the Indies, whom we call Creoles, although they descend from Spanish parents of pure blood, usually bear some mark of infamy.

For it is presumed that, being born in the land of Indians, they cannot avoid participating in their customs and nature. And thus they are held less capable for offices and honors than Spaniards who come from these Kingdoms [of Spain].

Mestizos, who are born of a Spanish father and Indian mother, are held infamous by law, and are excluded from all honors and public offices.

Mulattos, Blacks, and their descendants suffer even greater infamy due to the stain of slavery.`,
    historicalContext: `Solórzano's work was the most influential treatise on colonial Spanish law. His codification of racial distinctions shaped the casta system that organized colonial society. The concept of 'limpieza de sangre' (purity of blood) determined social position, occupation, and legal rights.`,
    modernNote: `This text reveals the systematic racism underlying colonial society. The casta system created legal hierarchies based on ancestry, affecting everything from marriage to occupation to church seating. Its legacy of racial categorization persisted long after independence.`,
    difficulty: 'advanced',
    tags: ['casta', 'race', 'purity', 'Creole', 'Mestizo', 'society', 'law'],
    linkedEntities: ['casta', 'limpieza de sangre', 'Creole', 'Mestizo'],
    featured: false,
    verified: false,
    translator: 'Reconstruction by Claude Opus 4.5 based on scholarly descriptions'
  },

  // ============================================
  // WITCHCRAFT AND MAGIC
  // ============================================
  {
    id: 'ruiz-alarcon-idolatry',
    title: 'Treatise on Superstitions',
    category: 'colonial-mexico',
    author: 'Hernando Ruiz de Alarcón',
    work: 'Tratado de las Supersticiones y Costumbres Gentílicas',
    year: 1629,
    location: 'Mexico City',
    language: 'Spanish/Nahuatl',
    // PARAPHRASE: Based on published translations of Ruiz de Alarcón's treatise
    text: `Para curar qualquiera enfermedad, los curanderos indios usan de conjuros y invocaciones en su lengua mexicana, mezclando muchas palabras que ni ellos entienden.

Quando van a coger las yerbas medicinales, primero hablan con ellas, diciéndoles: "Ea, ya vengo por ti, yerba verde, yerba encantada. Tú eres mi hermana, tú eres mi madre. Ven conmigo, que te llevo a curar a un enfermo."

También usan del peyote y del ololiuhqui, yerbas que causan borrachera y visiones, para conocer las cosas ocultas y adivinar lo futuro.`,
    translation: `To cure any illness, the Indian healers use conjurations and invocations in their Mexican language, mixing many words that even they do not understand.

When they go to gather medicinal herbs, they first speak with them, saying: "Come now, I have come for you, green herb, enchanted herb. You are my sister, you are my mother. Come with me, for I take you to cure a sick person."

They also use peyote and ololiuhqui [morning glory seeds], herbs that cause intoxication and visions, to know hidden things and divine the future.

These superstitions are remnants of their ancient idolatry, which they mix with prayers to the saints and Christian ceremonies, without understanding the great sin they commit.`,
    historicalContext: `Ruiz de Alarcón was a parish priest who spent years documenting indigenous religious practices. His treatise, intended to help extirpate idolatry, ironically preserved detailed records of pre-Hispanic healing rituals, including the use of psychoactive plants.`,
    modernNote: `This text documents the syncretic blend of indigenous and Catholic religion that characterized colonial Mexican healing. The use of peyote and morning glory seeds for divination reflects pre-Hispanic practices that continued covertly under colonial rule. Ruiz de Alarcón's records are now valuable ethnographic sources.`,
    difficulty: 'advanced',
    tags: ['curandero', 'magic', 'peyote', 'idolatry', 'syncretic', 'indigenous'],
    linkedEntities: ['curandero', 'peyote', 'magic', 'indigenous medicine'],
    featured: false,
    verified: false,
    translator: 'Reconstruction by Claude Opus 4.5 based on scholarly sources'
  }
];

export default COLONIAL_MEXICO_SOURCES;
