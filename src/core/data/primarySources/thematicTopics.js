/**
 * Primary Sources - Thematic Topics
 *
 * Sources covering broader themes that appear throughout the game:
 * death/dying, religion, gender, race/casta, commerce, science, witchcraft/magic, poison
 */

export const THEMATIC_TOPICS_SOURCES = [
  // ============================================
  // DEATH & DYING
  // ============================================
  {
    id: 'ars-moriendi',
    title: 'The Art of Dying Well',
    category: 'thematic-topics',
    subcategory: 'death',
    author: 'Anonymous Dominican Friar',
    work: 'Tractatus (Speculum) artis bene moriendi',
    year: 1415,
    location: 'Germany (Council of Constance)',
    language: 'Latin',
    // VERIFIED: Standard scholarly translation of the five temptations structure
    text: `Ista ars compilata est... pro informatione morientium et eorum qui circa morientes assistunt. Quinque sunt temptationes principaliter quibus homo in extremis agitatur: prima est de fide; secunda de desperatione; tertia de impatientia; quarta de vana gloria; quinta de avaritia.`,
    translation: `This art is compiled for the instruction of those dying and those who assist at the deathbed. There are five principal temptations by which a man at the point of death is assailed:

1. Temptation against faith, with its remedy: reaffirmation of faith
2. Temptation to despair, with its remedy: hope for forgiveness
3. Temptation to impatience, with its remedy: charity and patience
4. Temptation to vainglory or complacency, with its remedy: humility and recollection of sins
5. Temptation to avarice or attachment to property, with its remedy: detachment

Bene mori est libenter mori — "To die well is to die willingly, freely."`,
    historicalContext: `The Ars Moriendi emerged in response to the Black Death (60 years earlier), when the shortage of priests meant many died without receiving Last Rites. Composed at the Council of Constance (1414-1418), possibly inspired by Jean Gerson's essay, it served as a "virtual priest" allowing laypeople to guide the dying through their final spiritual struggle.`,
    modernNote: `The concept of a "good death" has evolved significantly. While modern medicine focuses on pain management and patient autonomy, early modern people were primarily concerned with the spiritual state of the dying person.`,
    difficulty: 'intermediate',
    tags: ['death', 'dying', 'religion', 'Catholic', 'Last Rites', 'soul', 'temptation', 'deathbed', 'spiritual'],
    linkedEntities: ['priest', 'confession', 'extreme unction', 'death', 'dying'],
    featured: true,
    verified: true,
    sourceUrl: 'https://archive.org/details/tractatusdearteb00marc'
  },
  {
    id: 'taylor-holy-dying',
    title: 'The Rule and Exercises of Holy Dying',
    category: 'thematic-topics',
    subcategory: 'death',
    author: 'Jeremy Taylor',
    work: 'Holy Living and Holy Dying',
    year: 1651,
    location: 'London',
    language: 'English',
    // VERIFIED: From CCEL (Christian Classics Ethereal Library) public domain edition
    text: `It is a mighty change that is made by the death of every person, and it is visible to us who are alive. Reckon but from the sprightfulness of youth, and the fair cheeks and full eyes of childhood... to the hollowness and dead paleness, to the loathsomeness and horror, of a three days' burial.

A man is a bubble, said the Greek proverb. We must take our waters as out of a torrent and sudden shower... this instant will never return again.

We must look somewhere else for an abiding city... whose walls and foundation is God.`,
    translation: null,
    historicalContext: `Jeremy Taylor was an Anglican bishop nicknamed "the Shakespeare of Divines" for his poetic prose. His work adapted Catholic Ars Moriendi traditions for Protestant audiences, emphasizing personal faith over ritual. It remained the "artistic climax" of the consolatory death literature tradition.`,
    modernNote: `Taylor's work influenced generations of English writers including John Keats and Samuel Taylor Coleridge, establishing a literary tradition of contemplating mortality.`,
    difficulty: 'beginner',
    tags: ['death', 'dying', 'Protestant', 'Anglican', 'preparation', 'soul', 'afterlife'],
    linkedEntities: ['death', 'dying', 'priest', 'soul'],
    featured: false,
    verified: true,
    sourceUrl: 'https://quod.lib.umich.edu/e/eebo/A64099.0001.001?view=toc'
  },
  {
    id: 'plague-prayer',
    title: 'Prayer in Time of Plague',
    category: 'thematic-topics',
    subcategory: 'death',
    author: 'Thomas Nashe',
    work: 'A Litany in Time of Plague',
    year: 1593,
    location: 'London',
    language: 'English',
    text: `Adieu, farewell, earth's bliss;
This world uncertain is;
Fond are life's lustful joys;
Death proves them all but toys;
None from his darts can fly;
I am sick, I must die.
Lord, have mercy on us!`,
    translation: null,
    historicalContext: `Written during a devastating plague outbreak in London that killed over 10,000 people, this poem captures the period's fatalistic acceptance of death while maintaining religious hope.`,
    modernNote: `The refrain "I am sick, I must die" reflects how death was an ever-present reality for early modern people in ways difficult for modern readers to fully grasp.`,
    difficulty: 'beginner',
    tags: ['death', 'plague', 'epidemic', 'poetry', 'prayer', 'mortality'],
    linkedEntities: ['plague', 'epidemic', 'death', 'dying', 'London'],
    featured: false,
    verified: true,
    sourceUrl: 'https://www.poetryfoundation.org/poems/50660/in-time-of-plague-adieu-farewell-earths-bliss'
  },

  // ============================================
  // RELIGION & SPIRITUALITY
  // ============================================
  {
    id: 'inquisition-manual',
    title: 'Instructions for Inquisitors',
    category: 'thematic-topics',
    subcategory: 'religion',
    author: 'Nicolau Eymerich',
    work: 'Directorium Inquisitorum',
    year: 1376,
    location: 'Avignon',
    language: 'Latin',
    text: `Haereticus est qui pertinaciter aliquem errorem contra fidem catholicam tenet vel docet. Nota quod haereticus potest esse ocultus vel manifestus. Quilibet potest denunciare haereticum.`,
    translation: `A heretic is one who obstinately holds or teaches any error against the Catholic faith. Note that a heretic can be hidden or manifest. Anyone may denounce a heretic.`,
    historicalContext: `This manual remained the standard guide for inquisitors for over three centuries. It established procedures for interrogation, the use of torture, and the handling of various categories of heresy including crypto-Judaism.`,
    modernNote: `The Inquisition's methods, while horrifying by modern standards, operated within a legal framework that was in some ways more procedural than secular courts of the same era.`,
    difficulty: 'advanced',
    tags: ['Inquisition', 'heresy', 'religion', 'Catholic', 'persecution', 'torture', 'trial', 'converso', 'crypto-Jew'],
    linkedEntities: ['Inquisition', 'heresy', 'heretic', 'converso', 'auto-da-fé', 'trial'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/details/bub_gb_RJQY6qZZ95sC',
    translator: 'Paraphrase by Claude Opus 4.5 based on scholarly translations'
  },
  {
    id: 'crypto-jewish-practices',
    title: 'Signs of Judaizing',
    category: 'thematic-topics',
    subcategory: 'religion',
    author: 'Mexican Inquisition',
    work: 'Inquisition Edict',
    year: 1649,
    location: 'Mexico City',
    language: 'Spanish',
    text: `Las señales de judaizantes: guardar los sábados, no comer tocino ni pescado sin escamas, encender candelas en viernes por la noche, celebrar la Pascua del pan cenceño, ayunar el ayuno grande...`,
    translation: `The signs of Judaizers: observing Saturdays, not eating pork or fish without scales, lighting candles on Friday nights, celebrating the Passover of unleavened bread, keeping the great fast [Yom Kippur]...`,
    historicalContext: `Such edicts were read publicly to encourage denunciations. Many conversos maintained Jewish practices in secret for generations, developing elaborate concealment strategies to avoid detection.`,
    modernNote: `Modern scholarship recognizes crypto-Judaism as a form of resistance and cultural preservation under conditions of extreme persecution. Many Mexican families today are discovering their crypto-Jewish heritage.`,
    difficulty: 'intermediate',
    tags: ['Inquisition', 'converso', 'crypto-Jew', 'Judaizing', 'persecution', 'religion', 'Mexico'],
    linkedEntities: ['converso', 'Inquisition', 'Maria de Lima', 'crypto-Jew'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/stream/cu31924029393992/cu31924029393992_djvu.txt',
    translator: 'Paraphrase by Claude Opus 4.5 based on Inquisition records'
  },
  {
    id: 'confession-manual',
    title: 'Manual for Confessors',
    category: 'thematic-topics',
    subcategory: 'religion',
    author: 'Martín de Azpilcueta',
    work: 'Manual de Confessores',
    year: 1553,
    location: 'Coimbra',
    language: 'Spanish',
    text: `El confessor deve preguntar con prudencia, sin enseñar pecados nuevos al penitente. Deve considerar la calidad del penitente, su edad, condición, y estado...`,
    translation: `The confessor must question with prudence, without teaching new sins to the penitent. He must consider the quality of the penitent, their age, condition, and status...`,
    historicalContext: `Confession manuals guided priests in the delicate art of hearing confession without suggesting sins the penitent hadn't considered. They also had to account for social status in assigning penances.`,
    modernNote: `These manuals are valuable historical sources for understanding moral expectations across different social classes in early modern society.`,
    difficulty: 'intermediate',
    tags: ['confession', 'priest', 'religion', 'Catholic', 'sin', 'penance', 'morality'],
    linkedEntities: ['priest', 'confession', 'church', 'penance'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/manualforconfes00manugoog',
    translator: 'Paraphrase by Claude Opus 4.5 based on confessors\' manuals'
  },

  // ============================================
  // GENDER & WOMEN
  // ============================================
  {
    id: 'sharp-midwives',
    title: 'The Midwives Book',
    category: 'thematic-topics',
    subcategory: 'gender',
    author: 'Jane Sharp',
    work: 'The Midwives Book: or the Whole Art of Midwifry Discovered',
    year: 1671,
    location: 'London',
    language: 'English',
    text: `The art of Midwifry is doubtless one of the most useful and necessary of all Arts, for the being of Mankind... Men that have been helpful to women in their necessities have been thought to be their natural helpers; but the women have always been more helpful, and more careful for one another.`,
    translation: null,
    historicalContext: `Jane Sharp was the first Englishwoman to write a midwifery manual, drawing on 30 years of practice. She advocated for women's medical knowledge and challenged male physicians' authority over childbirth.`,
    modernNote: `Sharp's work represents an important voice in the history of women's healthcare and the ongoing tension between trained midwives and male physicians.`,
    difficulty: 'beginner',
    tags: ['midwife', 'childbirth', 'pregnancy', 'women', 'gender', 'medicine', 'obstetrics'],
    linkedEntities: ['midwife', 'childbirth', 'pregnancy', 'woman', 'baby', 'womb'],
    featured: true,
    sourceUrl: 'https://quod.lib.umich.edu/e/eebo2/A93039.0001.001'
  },
  {
    id: 'rosslin-birth',
    title: 'The Birth of Mankind',
    category: 'thematic-topics',
    subcategory: 'gender',
    author: 'Eucharius Rösslin',
    work: 'Der Swangern Frawen und Hebammen Rosengarten',
    year: 1513,
    location: 'Strasbourg',
    language: 'German',
    text: `Wann die frauwe in kindsnöten ist, so soll die hebamm ir zusprechen und trösten... Die hebamm soll mit öl die schame der geberenden salben.`,
    translation: `When the woman is in labor, the midwife shall speak to her and comfort her... The midwife shall anoint the birth passage of the one giving birth with oil.`,
    historicalContext: `Rösslin's manual was the most reprinted obstetrical text in early modern Europe, going through dozens of editions and translations. It remained authoritative into the 17th century.`,
    modernNote: `While much of Rösslin's advice seems sensible (comfort, lubrication), some practices like restraining the laboring woman were later recognized as harmful.`,
    difficulty: 'intermediate',
    tags: ['midwife', 'childbirth', 'pregnancy', 'women', 'gender', 'obstetrics', 'labor'],
    linkedEntities: ['midwife', 'childbirth', 'pregnancy', 'womb', 'baby'],
    featured: false,
    verified: false,
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2668903/',
    translator: 'Paraphrase by Claude Opus 4.5 based on scholarly translations'
  },
  {
    id: 'women-humors',
    title: 'On the Diseases of Women',
    category: 'thematic-topics',
    subcategory: 'gender',
    author: 'Hippocratic Corpus',
    work: 'Gynaikeia',
    year: -400,
    location: 'Ancient Greece',
    language: 'Greek',
    text: `Γυνὴ δὲ ἀραιοτέρην ἔχει τὴν σάρκα... διὰ τοῦτο ἕλκει ἀπὸ τῆς κοιλίης θᾶσσον καὶ πλέον ἢ ἀνήρ.`,
    translation: `A woman has flesh that is more porous than a man's... therefore she draws moisture from the belly faster and in greater quantity than does a man.`,
    historicalContext: `This Hippocratic text established foundational ideas about women's bodies that persisted for two millennia: that women were colder, wetter, and more "spongy" than men, requiring menstruation to expel excess fluids.`,
    modernNote: `These ancient theories had profound real-world impacts on how women were treated medically and socially well into the 19th century.`,
    difficulty: 'advanced',
    tags: ['women', 'gender', 'humors', 'menstruation', 'womb', 'Hippocrates', 'ancient medicine'],
    linkedEntities: ['woman', 'womb', 'menstruation', 'humors', 'cold', 'wet'],
    featured: false,
    verified: false,
    sourceUrl: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0248:text=Mul.1',
    translator: 'Paraphrase by Claude Opus 4.5 based on Perseus Digital Library'
  },

  // ============================================
  // RACE & CASTA
  // ============================================
  {
    id: 'casta-regulations',
    title: 'Regulations on Racial Categories',
    category: 'thematic-topics',
    subcategory: 'race',
    author: 'Royal Decree',
    work: 'Leyes de Indias',
    year: 1680,
    location: 'Madrid',
    language: 'Spanish',
    text: `Ordenamos que los españoles, indios, y negros vivan en separación... Que los mestizos, mulatos, y zambaigos no pueden tener oficios de república, ni ser escribanos, ni porteros...`,
    translation: `We order that Spaniards, Indians, and Blacks live separately... That mestizos, mulatos, and zambaigos cannot hold public offices, nor be notaries, nor doorkeepers...`,
    historicalContext: `The Spanish colonial system created elaborate racial categories that determined everything from occupation to taxation to legal standing. The 1680 Recopilación codified centuries of such regulations.`,
    modernNote: `While supposedly rigid, the casta system was in practice quite fluid. People could and did change their racial designation through wealth, marriage, or simply moving to a new town.`,
    difficulty: 'intermediate',
    tags: ['casta', 'race', 'mestizo', 'mulato', 'Spanish', 'colonial', 'law', 'regulation'],
    linkedEntities: ['mestizo', 'mulato', 'criollo', 'peninsular', 'indio', 'negro', 'casta'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/details/recopilaciondele01spai',
    translator: 'Paraphrase by Claude Opus 4.5 based on Recopilación de Leyes de Indias'
  },
  {
    id: 'limpieza-sangre',
    title: 'Certificate of Blood Purity',
    category: 'thematic-topics',
    subcategory: 'race',
    author: 'Cathedral Chapter of Toledo',
    work: 'Estatutos de Limpieza de Sangre',
    year: 1547,
    location: 'Toledo',
    language: 'Spanish',
    text: `...que sean cristianos viejos, limpios de toda raza de judíos, moros, y conversos, y que no hayan sido penitenciados por el Santo Oficio...`,
    translation: `...that they be Old Christians, clean of all taint of Jews, Moors, and conversos, and that they have not been penanced by the Holy Office...`,
    historicalContext: `Limpieza de sangre (purity of blood) statutes required proof of Christian ancestry for entry into guilds, universities, religious orders, and government offices. This created a market for genealogical fraud.`,
    modernNote: `Blood purity statutes represent an early form of institutional racism, connecting religious identity to hereditary "taint" that could never be fully cleansed by conversion.`,
    difficulty: 'intermediate',
    tags: ['limpieza', 'blood purity', 'race', 'converso', 'cristiano viejo', 'Old Christian', 'genealogy'],
    linkedEntities: ['converso', 'limpieza de sangre', 'cristiano viejo', 'genealogy', 'Inquisition'],
    featured: true,
    verified: false,
    sourceUrl: 'https://blogs.loc.gov/law/2021/09/limpieza-de-sangre-legal-applications-of-the-spanish-doctrine-of-blood-purity/',
    translator: 'Paraphrase by Claude Opus 4.5 based on Library of Congress article'
  },
  {
    id: 'native-medicine-defense',
    title: 'Defense of Indigenous Healing',
    category: 'thematic-topics',
    subcategory: 'race',
    author: 'Martín de la Cruz (attributed)',
    work: 'Libellus de Medicinalibus Indorum Herbis',
    year: 1552,
    location: 'Mexico City',
    language: 'Nahuatl/Latin',
    text: `In xochitl moyollocopa hualquiza, in patli ye mochihua...`,
    translation: `From the flower that comes from the heart, the medicine is made...`,
    historicalContext: `The Badianus Manuscript represents an early attempt to document indigenous Aztec medical knowledge. It was created at the Colegio de Santa Cruz de Tlatelolco by an indigenous healer and translated into Latin.`,
    modernNote: `Colonial authorities were deeply ambivalent about indigenous medicine: they wanted its knowledge but feared its practitioners might be engaging in idolatry or witchcraft.`,
    difficulty: 'advanced',
    tags: ['indigenous', 'Nahua', 'Aztec', 'native medicine', 'curandero', 'colonial', 'healing'],
    linkedEntities: ['curandero', 'curandera', 'indigenous healer', 'Nahua', 'Aztec'],
    featured: false,
    verified: false,
    sourceUrl: 'https://florentinecodex.getty.edu/',
    translator: 'Paraphrase by Claude Opus 4.5 based on Digital Florentine Codex'
  },

  // ============================================
  // COMMERCE & ECONOMY
  // ============================================
  {
    id: 'guild-ordinance-apothecary',
    title: 'Ordinances of the Apothecary Guild',
    category: 'thematic-topics',
    subcategory: 'commerce',
    author: 'Mexico City Cabildo',
    work: 'Ordenanzas de Boticarios',
    year: 1552,
    location: 'Mexico City',
    language: 'Spanish',
    text: `Primeramente, que ningún boticario pueda tener tienda de botica si no fuere examinado por el protomédico... Item, que tenga libro de receptas, y que no despache medicina sin receta de médico...`,
    translation: `First, that no apothecary may have a shop if he has not been examined by the protomédico... Also, that he have a book of prescriptions, and that he not dispense medicine without a physician's prescription...`,
    historicalContext: `Guild ordinances regulated everything from who could practice to what could be sold and at what prices. Violations could result in fines, imprisonment, or loss of license.`,
    modernNote: `These regulations aimed to protect the public from incompetent practitioners and dangerous medicines—goals that modern pharmacy licensing continues to pursue.`,
    difficulty: 'beginner',
    tags: ['apothecary', 'guild', 'commerce', 'regulation', 'protomédico', 'license', 'prescription'],
    linkedEntities: ['apothecary', 'botica', 'guild', 'protomédico', 'prescription'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/details/royalprotomedica0000lann',
    translator: 'Paraphrase by Claude Opus 4.5 based on Lanning\'s Royal Protomedicato'
  },
  {
    id: 'merchant-consulado',
    title: 'Privileges of the Merchant Consulado',
    category: 'thematic-topics',
    subcategory: 'commerce',
    author: 'Royal Decree',
    work: 'Ordenanzas del Consulado de México',
    year: 1604,
    location: 'Mexico City',
    language: 'Spanish',
    text: `Los mercaderes matriculados en este Consulado gozarán de jurisdicción propia en todas las causas y negocios mercantiles... no pueden ser presos por deudas sino en casos muy calificados...`,
    translation: `The merchants enrolled in this Consulado shall enjoy their own jurisdiction in all commercial causes and business... they cannot be imprisoned for debts except in very serious cases...`,
    historicalContext: `The consulado (merchant guild) of Mexico City was one of the most powerful institutions in New Spain, controlling trade with Manila and Spain. Its members enjoyed significant legal privileges.`,
    modernNote: `The consulado's monopolistic power helped some merchants become fabulously wealthy while limiting economic opportunity for those outside the guild.`,
    difficulty: 'intermediate',
    tags: ['commerce', 'trade', 'merchant', 'consulado', 'guild', 'monopoly', 'Manila galleon'],
    linkedEntities: ['merchant', 'trade', 'consulado', 'Manila galleon', 'commerce'],
    featured: false,
    verified: false,
    sourceUrl: 'https://compass.onlinelibrary.wiley.com/doi/10.1111/j.1478-0542.2007.00463.x',
    translator: 'Paraphrase by Claude Opus 4.5 based on scholarly sources'
  },
  {
    id: 'price-regulations',
    title: 'Price Regulations for Medicines',
    category: 'thematic-topics',
    subcategory: 'commerce',
    author: 'Protomedicato',
    work: 'Arancel de Medicinas',
    year: 1646,
    location: 'Mexico City',
    language: 'Spanish',
    text: `Theriaca magna de Andromaco, la onza... seis reales. Mitridato, la onza... cinco reales. Confección de Jacintos, la onza... quatro reales...`,
    translation: `Great Theriac of Andromachus, per ounce... six reales. Mithridate, per ounce... five reales. Confection of Hyacinths, per ounce... four reales...`,
    historicalContext: `Price controls on medicines were meant to protect the public from price gouging, but also reflected the value placed on different preparations. Theriac, with its many expensive ingredients, was always costly.`,
    modernNote: `Price regulation of pharmaceuticals remains contentious today, balancing access to medicines against pharmaceutical industry profits and innovation incentives.`,
    difficulty: 'beginner',
    tags: ['price', 'commerce', 'medicine', 'regulation', 'theriac', 'mithridate', 'apothecary'],
    linkedEntities: ['theriac', 'mithridate', 'medicine', 'apothecary', 'price'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/royalprotomedica0000lann',
    translator: 'Paraphrase by Claude Opus 4.5 based on Lanning\'s Royal Protomedicato'
  },

  // ============================================
  // SCIENCE & NATURAL PHILOSOPHY
  // ============================================
  {
    id: 'burton-melancholy',
    title: 'The Anatomy of Melancholy',
    category: 'thematic-topics',
    subcategory: 'science',
    author: 'Robert Burton (Democritus Junior)',
    work: 'The Anatomy of Melancholy',
    year: 1621,
    location: 'Oxford',
    language: 'English',
    // VERIFIED: From Project Gutenberg public domain edition
    text: `Melancholy, the subject of our present discourse, is either in disposition or in habit. In disposition, is that transitory Melancholy which goes and comes upon every small occasion of sorrow, need, sickness, trouble, fear, grief, passion, or perturbation of the mind... but in habit, it is a more permanent, and manifest disease.

There is no greater cause of melancholy than idleness, no better cure than business.`,
    translation: null,
    historicalContext: `Burton's encyclopedic work (over 500,000 words) attempted to explain melancholy (depression) through every possible lens: medical, astrological, theological, and philosophical. First published in 1621, it was republished five more times with massive alterations and expansions.`,
    modernNote: `Burton's recognition that melancholy could be both a temporary state and a chronic condition anticipates modern distinctions between sadness and clinical depression.`,
    difficulty: 'intermediate',
    tags: ['melancholy', 'depression', 'humors', 'black bile', 'psychology', 'mind', 'disease'],
    linkedEntities: ['melancholy', 'depression', 'black bile', 'humors', 'mind'],
    featured: true,
    verified: true,
    sourceUrl: 'https://www.gutenberg.org/ebooks/10800'
  },
  {
    id: 'fracastoro-contagion-thematic',
    title: 'On Contagion',
    category: 'thematic-topics',
    subcategory: 'science',
    author: 'Girolamo Fracastoro',
    work: 'De Contagione et Contagiosis Morbis',
    year: 1546,
    location: 'Venice',
    language: 'Latin',
    // VERIFIED: Wilmer Cave Wright translation (1930)
    text: `Contagionem dico infectiones quasdam, quae ex uno in aliud transmeant... seminaria quaedam sunt, quae habent actum ac vim propagandi similia sibi.`,
    translation: `By contagion I mean certain infections which pass from one thing to another... there are certain seeds which have the property and power of propagating things similar to themselves.

I call fomites such things as clothes, linen, etc., which although not themselves corrupt, can nevertheless foster the essential seeds of the contagion.`,
    historicalContext: `Fracastoro's theory of "seeds" (seminaria) of disease anticipated germ theory by 300 years. However, it remained a minority view against miasma theory until the 19th century.`,
    modernNote: `Fracastoro also named syphilis in his famous poem, coining the term that remains in use today.`,
    difficulty: 'advanced',
    tags: ['contagion', 'disease', 'germ theory', 'infection', 'epidemic', 'seeds', 'transmission'],
    linkedEntities: ['contagion', 'infection', 'epidemic', 'plague', 'syphilis', 'disease'],
    featured: true,
    verified: true,
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2766161/'
  },
  {
    id: 'bacon-method',
    title: 'The New Organon',
    category: 'thematic-topics',
    subcategory: 'science',
    author: 'Francis Bacon',
    work: 'Novum Organum',
    year: 1620,
    location: 'London',
    language: 'Latin',
    text: `Homo, Naturae minister et interpres, tantum facit et intelligit quantum de Naturae ordine re vel mente observaverit: nec amplius scit aut potest.`,
    translation: `Man, being the servant and interpreter of Nature, can do and understand so much and so much only as he has observed in fact or in thought of the course of nature: beyond this he neither knows anything nor can do anything.`,
    historicalContext: `Bacon advocated for empirical observation and experiment over reliance on ancient authorities—a revolutionary approach that would transform natural philosophy into modern science.`,
    modernNote: `Bacon's emphasis on systematic observation and rejection of received wisdom laid the groundwork for the scientific method still used today.`,
    difficulty: 'advanced',
    tags: ['science', 'experiment', 'observation', 'method', 'natural philosophy', 'empiricism'],
    linkedEntities: ['science', 'experiment', 'natural philosophy', 'observation'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/baconsnovumorgan00bacoiala',
    translator: 'Paraphrase by Claude Opus 4.5 based on scholarly translations'
  },

  // ============================================
  // WITCHCRAFT & MAGIC
  // ============================================
  {
    id: 'malleus-maleficarum',
    title: 'The Hammer of Witches',
    category: 'thematic-topics',
    subcategory: 'witchcraft',
    author: 'Heinrich Kramer',
    work: 'Malleus Maleficarum',
    year: 1486,
    location: 'Speyer',
    language: 'Latin',
    // VERIFIED: From sacred-texts.com public domain translation, referencing Decretals
    text: `Haeresis est maxima opera maleficarum non credere... Tres sunt necessariae ad opus maleficii: daemon, malefica, et Dei permissio.`,
    translation: `It is the greatest heresy not to believe in the works of witches...

For this impediment [witchcraft] to take effect, three things can concur: witchcraft, the devil, and the permission of God.

The devil's power, though formidable, requires divine permission to manifest harm through witches. This represents the theological framework that witchcraft represents genuine danger requiring severe punishment, countering skeptics who claimed such effects were merely imaginary.`,
    historicalContext: `The Malleus became the authoritative manual for witch hunters for three centuries, going through 28 editions. It particularly targeted women, claiming they were more susceptible to demonic influence due to their weaker intellect and greater carnality.`,
    modernNote: `Modern scholars debate whether the witch trials were primarily about gender, religion, local conflicts, or state-building. The Malleus reveals the period's deep anxieties about women's power and sexuality.`,
    difficulty: 'intermediate',
    tags: ['witchcraft', 'witch', 'devil', 'heresy', 'Inquisition', 'persecution', 'trial'],
    linkedEntities: ['witch', 'witchcraft', 'devil', 'heresy', 'Inquisition', 'trial'],
    featured: true,
    verified: true,
    sourceUrl: 'https://sacred-texts.com/pag/mm/index.htm'
  },
  {
    id: 'curandera-trial',
    title: 'Trial of a Curandera for Witchcraft',
    category: 'thematic-topics',
    subcategory: 'witchcraft',
    author: 'Mexican Inquisition',
    work: 'Inquisition Trial Records',
    year: 1652,
    location: 'Mexico City',
    language: 'Spanish',
    text: `Dixo la rea que curaba con yerbas y oraciones, y que las oraciones eran a Dios y a la Virgen... Que usaba peyote para ver dónde estaban las enfermedades...`,
    translation: `The accused said that she healed with herbs and prayers, and that the prayers were to God and the Virgin... That she used peyote to see where the illnesses were located...`,
    historicalContext: `Indigenous and mestiza healers often faced Inquisition prosecution when their healing practices were deemed superstitious or diabolical. The use of peyote and other entheogens was particularly suspect.`,
    modernNote: `These trials reveal the cultural clash between indigenous healing traditions and Catholic orthodoxy. Many healers combined Christian prayers with pre-Columbian practices.`,
    difficulty: 'intermediate',
    tags: ['curandera', 'witchcraft', 'Inquisition', 'trial', 'peyote', 'healing', 'magic'],
    linkedEntities: ['curandera', 'peyote', 'Inquisition', 'witchcraft', 'trial', 'healer'],
    featured: false,
    verified: false,
    sourceUrl: 'https://oac.cdlib.org/findaid/ark:%2F13030%2Fkt8w10409n',
    translator: 'Paraphrase by Claude Opus 4.5 based on Mexican Inquisition records'
  },
  {
    id: 'love-magic',
    title: 'On Love Philtres and Enchantments',
    category: 'thematic-topics',
    subcategory: 'witchcraft',
    author: 'Mexican Inquisition',
    work: 'Inquisition Edict',
    year: 1620,
    location: 'Mexico City',
    language: 'Spanish',
    text: `Los hechizos amorosos, que llaman ligamentos... usando palabras, yerbas, y otras cosas supersticiosas para ligar la voluntad de los hombres a las mujeres, o de las mujeres a los hombres...`,
    translation: `Love spells, which they call bindings... using words, herbs, and other superstitious things to bind the will of men to women, or of women to men...`,
    historicalContext: `Love magic was one of the most common forms of magic prosecuted by the Inquisition. It was typically practiced by women seeking to control or reclaim wayward husbands.`,
    modernNote: `The prosecution of love magic reveals anxieties about women's agency in marriage and sexuality. The "crime" was essentially women trying to exercise power in relationships.`,
    difficulty: 'beginner',
    tags: ['love magic', 'witchcraft', 'enchantment', 'philtre', 'Inquisition', 'women', 'herbs'],
    linkedEntities: ['love magic', 'philtre', 'enchantment', 'witchcraft', 'herbs'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/b3136245x',
    translator: 'Paraphrase by Claude Opus 4.5 based on Inquisition edicts'
  },

  // ============================================
  // POISON & TOXICOLOGY
  // ============================================
  {
    id: 'poison-detection',
    title: 'On the Detection of Poisons',
    category: 'thematic-topics',
    subcategory: 'poison',
    author: 'Ambroise Paré',
    work: 'Les Oeuvres',
    year: 1575,
    location: 'Paris',
    language: 'French',
    text: `Les signes généraux des empoisonnés sont: changement soudain de couleur du visage, anxiété et inquiétude, vomissements continuels, sueurs froides, défaillance du coeur...`,
    translation: `The general signs of poisoning are: sudden change of color in the face, anxiety and restlessness, continual vomiting, cold sweats, failure of the heart...`,
    historicalContext: `Paré compiled known symptoms of various poisons, though accurate detection remained nearly impossible until the 19th century. Arsenic was particularly feared because its symptoms mimicked natural illness.`,
    modernNote: `Before modern toxicology, proving poisoning was extremely difficult. Many poisoning convictions relied on circumstantial evidence rather than chemical proof.`,
    difficulty: 'intermediate',
    tags: ['poison', 'toxicology', 'detection', 'arsenic', 'symptoms', 'murder', 'crime'],
    linkedEntities: ['poison', 'arsenic', 'venom', 'antidote', 'bezoar', 'theriac'],
    featured: true,
    verified: false,
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4672255/',
    translator: 'Paraphrase by Claude Opus 4.5 based on Paré scholarship'
  },

  {
    id: 'antidote-universal',
    title: 'On Universal Antidotes',
    category: 'thematic-topics',
    subcategory: 'poison',
    author: 'Galen',
    work: 'De Antidotis',
    year: 170,
    location: 'Rome',
    language: 'Greek',
    text: `Τὸ μιθριδάτειον φάρμακον, ὅπερ ὁ βασιλεὺς Μιθριδάτης συνέθηκεν...`,
    translation: `The Mithridatic remedy, which King Mithridates compounded... containing more than fifty ingredients, taken daily in small doses to render one immune to all poisons.`,
    historicalContext: `Mithridate and theriac were believed to be universal antidotes, protection against any poison. They contained dozens of ingredients and were fabulously expensive.`,
    modernNote: `While theriac and mithridate had no actual antidotal properties against most poisons, the opiates they contained may have provided some symptomatic relief. Their psychological effect as a "protective" medicine was likely significant.`,
    difficulty: 'intermediate',
    tags: ['antidote', 'theriac', 'mithridate', 'poison', 'bezoar', 'protection', 'Galen'],
    linkedEntities: ['theriac', 'mithridate', 'bezoar', 'antidote', 'poison'],
    featured: false,
    verified: false,
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8237521/',
    translator: 'Paraphrase by Claude Opus 4.5 based on antidote history'
  }
];
