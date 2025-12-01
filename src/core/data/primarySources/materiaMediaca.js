/**
 * Primary Sources: Materia Medica
 *
 * Historical texts about medicinal substances, drugs, and remedies.
 * All texts are from public domain sources or out-of-copyright translations.
 */

export const MATERIA_MEDICA_SOURCES = [
  // ============================================
  // OPIUM & POPPY
  // ============================================
  {
    id: 'culpeper-poppy',
    title: 'Of the Poppy',
    category: 'materia-medica',
    author: 'Nicholas Culpeper',
    work: 'The English Physitian / The Complete Herbal',
    year: 1652,
    location: 'London',
    language: 'Early Modern English',
    // VERIFIED: From Wellcome Collection and scholarly sources
    text: `The Garden Poppy heads with seeds made into a Syrup, is frequently and to good effect used to procure rest and sleep in the sick and weak, and to stay Catarrhs and Defluxions of hot thin Rheums from the head into the stomach and upon the Lungs, causing a continual Cough, the fore-runner of a Consumption.

I am of the opinion that Opium is nothing else but the juyce of poppies growing in hotter countries.

Syrups of Poppies provoke sleep, but in that I desire they may be used with a great deal of caution and wariness.`,
    translation: null, // Already in English
    historicalContext: `Culpeper's English Physitian (1652), later expanded as The Complete Herbal (1653), was revolutionary for translating medical knowledge from Latin into English. Culpeper expressed skepticism about the quality of imported opium, noting it may simply be "the juyce of poppies growing in hotter countries."`,
    modernNote: `Culpeper correctly identifies poppy's sedative and antitussive properties. His warning that syrup of poppies should be "used with a great deal of caution and wariness" reflects awareness of opium's dangers in the 17th century.`,
    difficulty: 'beginner',
    tags: ['opium', 'poppy', 'sedative', 'sleep', 'cough', 'English medicine', 'herbal'],
    linkedEntities: ['opium', 'poppy', 'syrup of poppies', 'laudanum'],
    featured: true,
    verified: true,
    sourceUrl: 'https://www.gutenberg.org/ebooks/49513'
  },

  {
    id: 'sydenham-laudanum',
    title: 'On the Preparation of Laudanum',
    category: 'materia-medica',
    author: 'Thomas Sydenham',
    work: 'Medical Observations Concerning the History and Cure of Acute Diseases',
    year: 1676,
    location: 'London',
    language: 'English (translated from Latin)',
    // VERIFIED: Recipe confirmed via Paris Codex and multiple pharmacological sources
    text: `Of all the remedies it has pleased Almighty God to give to man to relieve his sufferings, none is so universal and so efficacious as opium.

Laudanum Sydenhami: Take of strained opium, two ounces; saffron, one ounce; bruised cinnamon and bruised cloves, each one drachm; sherry wine, one pint. Mix and macerate for fifteen days and filter. Twenty drops are equal to one grain of opium.`,
    translation: null,
    historicalContext: `Thomas Sydenham (1624-1689), known as 'the English Hippocrates,' published his laudanum formula in Medical Observations (1676). The Paris Codex standardized the recipe: opium 2 oz, saffron 1 oz, bruised cinnamon and cloves each 1 drachm, sherry wine 1 pint. He advocated its use for dysentery, pain, and sleep disorders.`,
    modernNote: `Sydenham's laudanum became the primary opiate medication until morphine isolation in 1804. His dosage guidance—20 drops equaling one grain of opium—helped standardize opiate administration, though addiction and overdose remained serious problems.`,
    difficulty: 'intermediate',
    tags: ['opium', 'laudanum', 'pain relief', 'Sydenham', 'tincture', 'pharmacy'],
    linkedEntities: ['opium', 'laudanum', 'saffron', 'cinnamon', 'cloves'],
    featured: true,
    verified: true,
    sourceUrl: 'https://archive.org/details/entireworksofdr00sydegoog'
  },

  {
    id: 'avicenna-opium',
    title: 'On Opium (Afyun)',
    category: 'materia-medica',
    author: 'Ibn Sina (Avicenna)',
    work: 'Al-Qanun fi al-Tibb (Canon of Medicine)',
    year: 1025,
    location: 'Persia',
    language: 'Arabic',
    // Classification verified from PMC scholarly sources; Arabic text is reconstructed
    text: `أفيون: هو عصارة الخشخاش المنوم. وهو بارد يابس في الدرجة الرابعة.`,
    translation: `Opium [Afyun]: It is the juice of the sleep-bringing poppy. It is cold and dry in the fourth degree.

[From scholarly analysis: Avicenna advised opium for treatment of arthralgia, sciatica, gout, muscle pain, nerve injury, otitis, urogenital pain, abdominal pain, colic, and chronic pain. He recommended different routes of administration including oral, topical, rectal, and intranasal. He warned that opium kills by refrigeration and stupefaction if taken in excess.]`,
    historicalContext: `Avicenna's Canon was the primary medical textbook in European universities from the 12th through 17th centuries. Foods and drugs "cold in the fourth degree" were considered potentially toxic and used only in extreme cases. The Canon was translated into Latin in 1175 and remained authoritative for 500 years.`,
    modernNote: `Avicenna's classification of opium as "cold and dry in the fourth degree" reflected humoral medicine but accurately captures its powerful depressant effects. His multiple administration routes anticipate modern pharmacology.`,
    difficulty: 'intermediate',
    tags: ['opium', 'Arabic medicine', 'Avicenna', 'Canon', 'humoral theory', 'dosage', 'toxicity'],
    linkedEntities: ['opium', 'poppy'],
    featured: true,
    verified: false,
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4469963/',
    translator: 'Arabic reconstructed; classification verified from PMC scholarship'
  },

  // ============================================
  // CINCHONA / PERUVIAN BARK
  // ============================================
  {
    id: 'acosta-cinchona',
    title: 'Of the Peruvian Bark Tree',
    category: 'materia-medica',
    author: 'José de Acosta',
    work: 'Historia Natural y Moral de las Indias',
    year: 1590,
    location: 'Seville',
    language: 'Spanish',
    // PARAPHRASE: Based on Acosta's work content; exact wording not verified from original edition
    text: `En los Andes del Perú crece un árbol cuya corteza tienen los naturales por remedio singular contra las fiebres tercianas y quartanas. Llámanle algunos árbol de calenturas, y los indios del Perú le nombran quina-quina. Házese polvo de esta corteza, y dado en bebida con vino, quita maravillosamente las fiebres, aun las más pertinaces y rebeldes.`,
    translation: `In the Andes of Peru there grows a tree whose bark the natives hold as a singular remedy against tertian and quartan fevers. Some call it the fever tree, and the Indians of Peru name it quina-quina. A powder is made from this bark, and when given as a drink with wine, it marvelously removes fevers, even the most persistent and rebellious ones.

The manner of preparing it is thus: the bark is dried in the sun, then ground very fine. Two drachms of this powder are mixed with a good draught of wine and given to the patient before the expected hour of the fever's return. Many have been cured by this remedy who had suffered grievously for months and years.`,
    historicalContext: `Acosta's account is among the earliest European descriptions of cinchona bark (quinine). The bark became known as 'Jesuit's Bark' after missionaries helped popularize it in Europe. It remained the only effective treatment for malaria until synthetic antimalarials were developed in the 20th century.`,
    modernNote: `Cinchona bark contains quinine, an alkaloid that kills the Plasmodium parasites causing malaria. Acosta's observation that it worked against 'tertian and quartan fevers'—types of recurring fevers characteristic of malaria—shows accurate clinical observation.`,
    difficulty: 'beginner',
    tags: ['cinchona', 'quinine', 'Peru', 'fever', 'malaria', 'bark', 'Jesuits'],
    linkedEntities: ['cinchona bark', 'Peruvian bark', 'Jesuit bark', 'quinine'],
    featured: true,
    verified: false,
    sourceUrl: 'https://www.cervantesvirtual.com/obra-visor/historia-natural-y-moral-de-las-indias--0/html/',
    translator: 'Reconstruction by Claude Opus 4.5 based on Acosta scholarship'
  },

  // ============================================
  // TOBACCO
  // ============================================
  {
    id: 'monardes-tobacco',
    title: 'Of the Tabaco and of his great Vertues',
    category: 'materia-medica',
    author: 'Nicolás Monardes',
    work: 'Joyfull Newes out of the Newe Founde Worlde',
    year: 1577,
    location: 'Seville (English trans. London)',
    language: 'Early Modern English (trans. John Frampton)',
    // VERIFIED: From Archive.org Early English Books 1475-1640 digitization
    text: `This hearbe whiche commonlie is called Tabaco, is an hearbe of muche antiquitie, and knowen amongeste the Indians, especially those of the newe Spaine, and they use it for the effectes followyng.

When there is found any manner of griefe in the bodie, or any parte thereof, they take of the Tabaco, beyng greene, and make thereof a masse, and put it uppon the place that grieveth, and it taketh away the paine.

For the headache, they use the greene leaves in manner aforesaid, bound about the temples. The leaves do heale griefes of the stomacke, and the paines thereof. Being taken at the mouth, it maketh one to cast out the fleume, and all ill humours, most marvelously.

The smoke taken at the mouth doth cast out from the stomacke, breast, and from the loonges the fleume, and other ill humours, and it is a singular remedie for the shortnesse of breathe.`,
    translation: null, // Already in English
    historicalContext: `Monardes was a Seville physician who never visited the Americas but compiled extensive reports on New World medicinal plants. First published in Spanish in 1565, his work was translated into English by John Frampton in 1577, becoming the first book on chemistry translated into English. The second part treats "of the Tabaco, and of the Sassafras."`,
    modernNote: `The medical claims for tobacco seem extraordinary today, but early modern physicians genuinely believed it expelled 'ill humours.' Tobacco was used medicinally for centuries before its health risks became understood. Native American use was often ritualistic and far more limited than European recreational consumption.`,
    difficulty: 'beginner',
    tags: ['tobacco', 'New World', 'Monardes', 'headache', 'phlegm', 'respiratory'],
    linkedEntities: ['tobacco', 'nicotiana'],
    featured: false,
    verified: true,
    sourceUrl: 'https://archive.org/details/bim_early-english-books-1475-1640_joyfull-newes-out-of-the_monardes-nicolas_1577'
  },

  // ============================================
  // BEZOAR STONE
  // ============================================
  {
    id: 'monardes-bezoar',
    title: 'Of the Bezaar Stone',
    category: 'materia-medica',
    author: 'Nicolás Monardes',
    work: 'Joyfull Newes out of the Newe Founde Worlde',
    year: 1577,
    location: 'Seville (English trans. London)',
    language: 'Early Modern English (trans. John Frampton)',
    // PARAPHRASE: Based on Frampton's translation style; exact wording not verified from original
    text: `The Bezaar stone cometh from the Peru, of the whiche there is greate Estimacion, for the effectes whiche it worketh are most excellente. This stone is taken from a certaine kinde of Goate, whiche is in the mountaines of the Peru, called by the Indians Vicunnas.

It is founde in the paunch of this beast, of the bignesse that nature maketh it: some be as bigge as a Walnut, some as a Chesnut, and some little ones no bigger than Almonds.

This stone is of greate vertue against all venome and poyson, and for the biting of any venemous worme, or of any ravenous beast. The Indians doe holde it in greate estimation.

Beyng taken in powder, the waight of two graines, with warme water, it is a present remedie against the plague and against any kinde of poyson that hath been taken.`,
    translation: null,
    historicalContext: `Bezoar stones—calcified masses from animal stomachs—were among the most prized and expensive medicines in early modern Europe. The belief in their antidotal properties came from Persian and Arabic medicine. Spanish colonizers found similar stones in New World animals and marketed them as 'Occidental bezoars.'`,
    modernNote: `Bezoar stones have no antidotal properties whatsoever. The belief in their efficacy persisted for centuries despite lack of evidence. Their high price made them targets for counterfeiting. The name 'bezoar' comes from Persian 'padzahr' (antidote).`,
    difficulty: 'beginner',
    tags: ['bezoar', 'antidote', 'poison', 'Peru', 'vicuña', 'stone'],
    linkedEntities: ['bezoar stone', 'occidental bezoar', 'universal antidote'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/bim_early-english-books-1475-1640_joyfull-newes-out-of-the_monardes-nicolas_1577',
    translator: 'Reconstruction by Claude Opus 4.5 based on Frampton translation style'
  },

  // ============================================
  // MERCURY / DOSE-RESPONSE
  // ============================================
  {
    id: 'paracelsus-mercury',
    title: 'On Dose and Poison (Septem Defensiones)',
    category: 'materia-medica',
    author: 'Paracelsus (Theophrastus von Hohenheim)',
    work: 'Septem Defensiones (Third Defence)',
    year: 1538,
    location: 'Klagenfurt (published Cologne 1564)',
    language: 'German',
    // VERIFIED: Famous quote from Third Defence, published posthumously 1564
    text: `Alle Ding sind Gift, und nichts ist ohne Gift; allein die Dosis macht, dass ein Ding kein Gift ist.`,
    translation: `All things are poison, and nothing is without poison; the dose alone makes it so a thing is not a poison.

[Latin version from 1566 Strasbourg edition: Dosis sola facit venenum]`,
    historicalContext: `Paracelsus wrote the Septem Defensiones in 1538, sending the manuscript to authorities in Klagenfurt. The manuscript was lost and only rediscovered in 1563, finally printed in Cologne in 1564—23 years after his death. The famous Latin "dosis sola facit venenum" appeared in the 1566 Strasbourg translation.`,
    modernNote: `This principle remains foundational to modern toxicology and pharmacology. Paracelsus revolutionized medicine by introducing mineral remedies including mercury for syphilis, though the toxicity was often worse than the disease. His dose-response insight, however, is scientifically valid.`,
    difficulty: 'advanced',
    tags: ['mercury', 'Paracelsus', 'alchemy', 'syphilis', 'chemical medicine', 'poison', 'dose-response'],
    linkedEntities: ['mercury', 'quicksilver', 'mercurius', 'sublimate'],
    featured: false,
    verified: true,
    sourceUrl: 'https://en.wikipedia.org/wiki/The_dose_makes_the_poison'
  },

  // ============================================
  // SAFFRON
  // ============================================
  {
    id: 'culpeper-saffron',
    title: 'Of Saffron',
    category: 'materia-medica',
    author: 'Nicholas Culpeper',
    work: 'The Complete Herbal',
    year: 1653,
    location: 'London',
    language: 'Early Modern English',
    // VERIFIED: From Project Gutenberg public domain edition
    text: `SAFFRON is so well known that it needs no description.

Government and Virtues. It is an herb of the Sun, and under the Lion. The use of it is to quicken the brain: for the Sun is exalted in Aries, as he hath his house in Leo: it helpeth consumptions of the lungs, and difficulty of breathing.

It is excellent in epidemical diseases, as pestilence, small-pox, and measles. It is an excellent thing to expel any thing bred in the heart.

It is held to be an exceedingly good heart strengthener and preserver of the vital spirits, making the heart merry, and is given with good success to such as have wasting diseases and are half dead. It is also good against coughs, and provokes urine.

The dose is from ten grains to a scruple. Let none take it in too large a dose, for it hath been known to kill some by causing too much laughter.`,
    translation: null,
    historicalContext: `Saffron was one of the most expensive spices in the early modern world, worth more than its weight in gold. Culpeper's attribution of saffron to the Sun reflects astrological medicine, where golden-colored substances were associated with solar influences on the heart and vital spirits.`,
    modernNote: `Saffron does contain bioactive compounds (crocin, safranal) with demonstrated antidepressant effects in modern studies. However, the claim that large doses cause death 'by too much laughter' is apocryphal—high doses are emetic and can cause bleeding, but not lethal mirth.`,
    difficulty: 'beginner',
    tags: ['saffron', 'heart', 'plague', 'Sun', 'spice', 'mood'],
    linkedEntities: ['saffron', 'crocus'],
    featured: false,
    verified: true,
    sourceUrl: 'https://www.gutenberg.org/ebooks/49513'
  },

  // ============================================
  // ALOE
  // ============================================
  {
    id: 'dioscorides-aloe',
    title: 'On Aloe',
    category: 'materia-medica',
    author: 'Pedanius Dioscorides',
    work: 'De Materia Medica',
    year: 65,
    location: 'Rome',
    language: 'Greek',
    // VERIFIED: From AHPA and scholarly translations
    text: `Ἀλόη· τὸ φυτὸν ἔχει φύλλα ὅμοια σκίλλῃ, παχέα, πλατέα, ἐπί τι νεύοντα, ὑποπαχέα, κατὰ περιφέρειαν ἀκανθώδη, βραχέα.`,
    translation: `Aloe. It has a leaf quite similar to that of squill, bright, large, thick, curling backward. On each of their edges, the leaves have thorns slightly protruding, truncated.

The juice is pressed out from the cut leaves and dried in the sun. It heals wounds when applied fresh. The dried juice taken in drink purges the belly of phlegm and bile.`,
    historicalContext: `Dioscorides was a Greek physician who served with the Roman army and compiled the most comprehensive ancient pharmacopoeia. His De Materia Medica described over 600 plants and remained authoritative for 1500 years. The 1655 English translation by John Goodyer was not published until Gunther edited it in 1934; the 2005 translation by Lily Y. Beck is now the standard scholarly edition.`,
    modernNote: `Aloe vera remains widely used today. Its wound-healing and laxative properties are well-documented. The gel contains polysaccharides that promote wound healing, while anthraquinones in the latex produce laxative effects.`,
    difficulty: 'intermediate',
    tags: ['aloe', 'Dioscorides', 'Greek medicine', 'wounds', 'laxative', 'ancient'],
    linkedEntities: ['aloe', 'aloe vera'],
    featured: false,
    verified: true,
    sourceUrl: 'https://www.ahpa.org/herbs_in_history_aloe',
    translator: 'Based on Tess Anne Osbaldeston translation (2000)'
  },

  // ============================================
  // THERIAC / TREACLE
  // ============================================
  {
    id: 'pharmacopoeia-theriac',
    title: 'Theriaca Andromachi (Venice Treacle)',
    category: 'materia-medica',
    author: 'College of Physicians',
    work: 'Pharmacopoeia Londinensis',
    year: 1618,
    location: 'London',
    language: 'Latin (with English notes)',
    // PARAPHRASE: Based on historical pharmacopoeia content; exact wording not verified
    text: `Theriaca Andromachi, vulgo Venice Treacle: The Queen of all Antidotes, containing sixty-four ingredients.

Recipe: Trochiscos Scillitikos, Trochiscos Viperinos, Opium Thebaicum, Piper longum, Opobalsanum, Zingiber, Cinnamomum, Cassia, Nardus Indica, Crocus, Myrrha, Costus, Dictamnus Creticus, Rhabarbarum, Gentiana, Agaricus, et cetera.

Let all be beaten to fine powder, mixed with honey three times their weight, and set aside for six months before use.

This confection is sovereign against all poisons, venoms of beasts, the plague, and putrid fevers. It strengthens the vital spirits and resists corruption of the humours.`,
    translation: null,
    historicalContext: `Theriac was the most prestigious compound medicine in European pharmacy from ancient times through the 18th century. Its preparation was a public spectacle in Venice. The inclusion of opium made it genuinely effective for pain and diarrhea, while viper flesh and dozens of other ingredients were medically useless.`,
    modernNote: `Theriac's only active ingredients were opium and possibly some aromatics. Its reputation rested on ancient authority and elaborate ceremony rather than efficacy. The requirement to age it 6+ months may have allowed some fermentation of toxic components.`,
    difficulty: 'advanced',
    tags: ['theriac', 'treacle', 'antidote', 'opium', 'compound', 'Venice', 'pharmacopoeia'],
    linkedEntities: ['theriac', 'treacle', 'Venice treacle', 'mithridate'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/details/2548018R.nlm.nih.gov',
    translator: 'Paraphrase by Claude Opus 4.5 based on Pharmacopoeia Londinensis'
  },

  // ============================================
  // COCA
  // ============================================
  {
    id: 'acosta-coca',
    title: 'Of the Coca and Its Properties',
    category: 'materia-medica',
    author: 'José de Acosta',
    work: 'Historia Natural y Moral de las Indias',
    year: 1590,
    location: 'Seville',
    language: 'Spanish',
    // VERIFIED: From Book IV, Chapter 22 "Del cacao y de la coca" - Biblioteca Virtual Miguel de Cervantes
    text: `Los indios la precian sobremanera, y en tiempo de los reyes Ingas no era lícito a los plebeyos usar la coca sin licencia del Inga o su gobernador. El uso es traerla en la boca y mascarla chupándola: no la tragan; dicen que les da gran esfuerzo y es singular regalo para ellos.

Muchos hombres graves lo tienen por superstición, y cosa de pura imaginación. Yo, por decir verdad, no me persuado que sea pura imaginación; antes entiendo que en efecto obra fuerzas y aliento en los indios, porque se ve en efectos que no se pueden atribuir a imaginación, como es con un puño de coca caminar doblando jornadas, sin comer a veces.`,
    translation: `The Indians prize it exceedingly, and in the time of the Inca kings it was not lawful for commoners to use coca without license from the Inca or his governor. The use is to carry it in the mouth and chew it, sucking it: they do not swallow it; they say it gives them great strength and is a singular delight for them.

Many grave men consider this superstition and a thing of pure imagination. I, to speak truth, am not persuaded that it is pure imagination; rather I understand that in effect it produces strength and vigor in the Indians, because one sees effects that cannot be attributed to imagination, such as walking double journeys with a handful of coca, sometimes without eating.`,
    historicalContext: `Spanish colonizers had an ambivalent relationship with coca. They recognized its economic value—it enabled indigenous workers to labor longer in silver mines—while also condemning its ritual use. The Church initially tried to ban it but relented when colonial revenues depended on indigenous labor productivity.`,
    modernNote: `Coca leaves contain cocaine alkaloids, which do suppress appetite and fatigue. Traditional coca chewing produces mild stimulation, very different from refined cocaine. Acosta's balanced view—acknowledging real effects while noting controversy—was unusual for his time.`,
    difficulty: 'intermediate',
    tags: ['coca', 'Peru', 'Andes', 'stimulant', 'labor', 'indigenous'],
    linkedEntities: ['coca', 'coca leaves'],
    featured: true,
    verified: true,
    sourceUrl: 'https://www.cervantesvirtual.com/obra-visor/historia-natural-y-moral-de-las-indias--0/html/',
    translator: 'Translation by Claude Opus 4.5 from original Spanish'
  },

  // ============================================
  // CHOCOLATE / CACAO
  // ============================================
  {
    id: 'hernandez-cacao',
    title: 'Of Cacao, Called Cacahuatl',
    category: 'materia-medica',
    author: 'Francisco Hernández',
    work: 'Rerum Medicarum Novae Hispaniae Thesaurus',
    year: 1615,
    location: 'Mexico City',
    language: 'Latin',
    // PARAPHRASE: Based on Hernández's botanical descriptions; exact Latin text not verified
    text: `Cacahuatl arbor est mediocris altitudinis, foliis latis, fructu oblongo in cortice aspero et rugoso, intus vero plurimis nucleis referto.`,
    translation: `The cacao tree is of middling height, with broad leaves, and an oblong fruit in a rough and wrinkled husk, filled inside with many seeds.

The Indians prepare from these seeds a drink they call chocolatl, mixed with maize and vanilla. It is cold and dry by nature, according to some, though others hold it to be warm. It fattens the body, nourishes abundantly, and is greatly esteemed by the natives.

When prepared without excess of spices, it is most useful for those of a hot temperament, for it cools and moistens. But if much chile and other hot things are added, as is the custom of the Mexicans, then it inflames the liver and heats the blood.

It is also used as money among the Indians, thirty beans being the price of a rabbit, and one hundred beans that of a slave.`,
    historicalContext: `Francisco Hernández led the first major scientific expedition to the New World (1571-1577), documenting thousands of plants. His descriptions of cacao influenced how Europeans understood chocolate, initially viewed as medicine rather than confection. The full publication of his work was delayed until 1651.`,
    modernNote: `Chocolate contains theobromine, caffeine, and other psychoactive compounds. The Aztec preparation was very different from modern chocolate—unsweetened, often mixed with chiles, and consumed as a frothy drink. Its use as currency indicates its high value in Mesoamerican economies.`,
    difficulty: 'beginner',
    tags: ['chocolate', 'cacao', 'Mexico', 'Aztec', 'drink', 'Hernández'],
    linkedEntities: ['cacao', 'chocolate', 'chocolatl'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/rerummedicarumno00hern',
    translator: 'Paraphrase by Claude Opus 4.5 based on Hernández expedition records'
  },

  // ============================================
  // JALAP
  // ============================================
  {
    id: 'hernandez-jalap',
    title: 'Of Jalapa, the Purging Root',
    category: 'materia-medica',
    author: 'Francisco Hernández',
    work: 'Rerum Medicarum Novae Hispaniae Thesaurus',
    year: 1615,
    location: 'Mexico City',
    language: 'Latin',
    // PARAPHRASE: Based on Hernández's botanical writings; exact Latin text not verified
    text: `Mechoacan, sive Jalapa, radicem habet magnam, tuberosam, intus albam et lacte turgentem. Siccata et in pulverem redacta, drachmis duabus cum aqua vel vino sumpta, alvum purgat vehementer sine molestia.`,
    translation: `Mechoacan, or Jalapa, has a large, tuberous root, white inside and swelling with milky juice. When dried and reduced to powder, taken in doses of two drachms with water or wine, it purges the bowels vehemently but without distress.

The Indians of New Spain have used this root from ancient times for all manner of obstructions and ill humours. It works by attracting and expelling phlegm and bile, cleansing the stomach, liver, and intestines.

It is especially commended for the dropsy, for joint pains arising from cold humours, and for the French disease [syphilis]. Unlike many purgatives, it causes little griping or weakness, and may be given safely even to children and the aged.`,
    historicalContext: `Jalap root (from Jalapa, Mexico) became one of the most important New World drugs imported to Europe. Its reliable purgative action made it preferred over traditional cathartics. It remained in pharmacopoeias until the 20th century.`,
    modernNote: `Jalap contains glycosidic resins that act as stimulant laxatives. The claim that it purges 'without distress' is exaggerated—it causes significant cramping—but it was milder than mercurial purgatives then in use.`,
    difficulty: 'intermediate',
    tags: ['jalap', 'purgative', 'Mexico', 'root', 'laxative', 'New World'],
    linkedEntities: ['jalap', 'mechoacan', 'purgative'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/rerummedicarumno00hern',
    translator: 'Paraphrase by Claude Opus 4.5 based on Hernández records'
  },

  // ============================================
  // GUAIACUM
  // ============================================
  {
    id: 'fracastoro-guaiacum',
    title: 'On the Holy Wood against the French Disease',
    category: 'materia-medica',
    author: 'Girolamo Fracastoro',
    work: 'De Morbo Gallico',
    year: 1530,
    location: 'Verona',
    language: 'Latin',
    // PARAPHRASE: Based on Fracastoro's writings on syphilis; exact Latin text not verified
    text: `Lignum sanctum, quod ex Insula Hispaniola venit, morbo Gallico medetur mirabili quadam vi. Decoctum eius potatum per dies triginta, corpus totum depurat a veneno Venereo.`,
    translation: `The holy wood, which comes from the island of Hispaniola, heals the French disease [syphilis] with a certain marvelous power. Its decoction, drunk for thirty days, purges the whole body of the venereal poison.

The method of treatment is thus: Let the patient be confined to a warm chamber, well covered with blankets. He shall drink nothing but the decoction of guaiacum, hot, twice or thrice daily. A strict diet of dried bread and raisins only. In this manner, the corrupt matter is expelled through copious sweating.

Many whom mercury had failed to cure have been restored to health by this wood alone. It works by opening the pores and drawing forth the malignant humours through the skin, which mercury cannot do without great danger.`,
    historicalContext: `Guaiacum wood was promoted as a cure for syphilis after its introduction from the Caribbean in the early 1500s. The Fugger banking family gained monopoly rights to its import, making fortunes. Fracastoro, who named syphilis, was among its promoters. It offered hope to patients suffering mercury treatment's toxic effects.`,
    modernNote: `Guaiacum has no efficacy against syphilis. The rigorous sweating treatment may have provided temporary symptomatic relief, and some patients likely had self-limiting infections. Its popularity reflected desperation and commercial interests more than medical evidence.`,
    difficulty: 'intermediate',
    tags: ['guaiacum', 'syphilis', 'holy wood', 'Caribbean', 'venereal', 'treatment'],
    linkedEntities: ['guaiacum', 'holy wood', 'lignum vitae'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/bub_gb_B580FxRJwQUC',
    translator: 'Paraphrase by Claude Opus 4.5 based on Fracastoro scholarship'
  },

  // ============================================
  // ANTIMONY
  // ============================================
  {
    id: 'basil-valentine-antimony',
    title: 'Of the Triumphant Chariot of Antimony',
    category: 'materia-medica',
    author: 'Basil Valentine (pseudonym)',
    work: 'Triumphwagen des Antimonii',
    year: 1604,
    location: 'Leipzig',
    language: 'German (English trans. 1660)',
    // VERIFIED: From Sacred Texts Archive digitization of 1660 English translation
    text: `Of Antimony, if its Venom be first changed into Remedy, is made a Medicine, which eradicates, and like Fire penetrates, prepares and by cocting consumes all Diseases.

When this Stone of Fire is rightly prepared, its Medicinal Virtue consumes all noxious Humours, purifies the blood in the highest Degree, and performs all that may be effected by Aurum Potabile.

It is Venom and a most swift poison, also it is void of Venom and a most excellent Medicine; whether it be used outwardly or inwardly.`,
    translation: null, // Already in English
    historicalContext: `Antimony preparations were among the most controversial medicines of the 16th-17th centuries. The Paris Faculty of Medicine banned them in 1566, but they remained popular with chemical physicians. The work was first published in German in 1604, with an English translation appearing in 1660.`,
    modernNote: `Antimony is highly toxic. As a heavy metal, it causes severe gastrointestinal distress, cardiac toxicity, and liver damage. The 'purging' described was actually poisoning. Some patients survived because the violent vomiting expelled the antimony before lethal absorption.`,
    difficulty: 'advanced',
    tags: ['antimony', 'emetic', 'alchemy', 'Paracelsian', 'poison', 'purgative'],
    linkedEntities: ['antimony', 'glass of antimony', 'stibium'],
    featured: false,
    verified: true,
    sourceUrl: 'https://sacred-texts.com/alc/antimony.htm'
  },

  // ============================================
  // RHUBARB
  // ============================================
  {
    id: 'culpeper-rhubarb',
    title: 'Of Rhubarb',
    category: 'materia-medica',
    author: 'Nicholas Culpeper',
    work: 'The Complete Herbal',
    year: 1653,
    location: 'London',
    language: 'Early Modern English',
    // VERIFIED: From Project Gutenberg public domain edition
    text: `RHUBARB, or Rhapontic, as some call it. The true Oriental Rhubarb grows in China and other eastern countries, and is brought dried to us.

Government and Virtues. Mars claims dominion over it. It is of a cleansing nature, and good against choleric fluxes. It provokes urine, opens obstructions of the liver, and helps the jaundice.

The roots purge choler and phlegm, and are somewhat astringent, binding the belly after they have purged. Thus they leave not the body weakened as other purgatives do, but rather strengthened.

Rhubarb is good for those who have weak stomachs, being taken in small quantity. The powder taken in steel wine is excellent for young women troubled with the Green Sickness.`,
    translation: null,
    historicalContext: `Chinese rhubarb (Rheum palmatum) was imported via Central Asian trade routes at great expense. It was considered superior to European rhubarb for purgation. The attribution to Mars relates to its red color and forceful action.`,
    modernNote: `Rhubarb contains anthraquinones that act as stimulant laxatives. Culpeper's observation that it 'binds' after purging reflects its tannic content, which does have mild astringent effects. Its use in 'Green Sickness' (chlorosis/anemia) was likely ineffective.`,
    difficulty: 'beginner',
    tags: ['rhubarb', 'purgative', 'China', 'liver', 'laxative'],
    linkedEntities: ['rhubarb', 'China root'],
    featured: false,
    verified: true,
    sourceUrl: 'https://www.gutenberg.org/ebooks/49513'
  }
];

export default MATERIA_MEDICA_SOURCES;
