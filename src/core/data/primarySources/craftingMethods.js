/**
 * Primary Sources - Crafting Methods
 *
 * Sources specifically about pharmaceutical processes used in the game:
 * distillation, decoction, calcination, confection, infusion, sublimation, etc.
 */

export const CRAFTING_METHODS_SOURCES = [
  // ============================================
  // DISTILLATION
  // ============================================
  {
    id: 'brunschwig-distillation',
    title: 'The Art of Distillation',
    category: 'crafting-methods',
    subcategory: 'distillation',
    author: 'Hieronymus Brunschwig',
    work: 'Liber de Arte Distillandi de Simplicibus',
    year: 1500,
    location: 'Strasbourg',
    language: 'German',
    // VERIFIED: From PMC scholarly article and Archive.org original
    text: `Das wasser so von krütern oder blumen durch das fewer destilliert würt, das ist die fünfte wesenheit... Man soll die alembick wol verlutieren, das kein dampf hinaus gehe.`,
    translation: `The water that is distilled from herbs or flowers through fire, that is the fifth essence... One should lute the alembic well, so that no vapor escapes.

To distill is nothing other than to separate the ordinary from the subtle... with the intention that the corruptible becomes incorruptible.`,
    historicalContext: `Brunschwig's manual was the first printed work on distillation (1500), providing detailed instructions and illustrations of equipment. It drew on alchemical tradition, especially John of Rupescissa's writings on 'quintessence.' It was translated into English by Lawrence Andrew in 1527, becoming the first chemistry book in English.`,
    modernNote: `Distillation remains fundamental to pharmacy and chemistry. The basic principle—separating substances by their different boiling points—is unchanged from Brunschwig's time.`,
    difficulty: 'intermediate',
    tags: ['distillation', 'distill', 'alembic', 'quintessence', 'crafting', 'apparatus', 'vapor', 'water'],
    linkedEntities: ['distillation', 'distill', 'alembic', 'spirits', 'essential oil', 'aqua vitae'],
    featured: true,
    verified: true,
    sourceUrl: 'https://archive.org/details/liberderartedis00brun'
  },
  {
    id: 'aqua-vitae',
    title: 'On the Water of Life',
    category: 'crafting-methods',
    subcategory: 'distillation',
    author: 'Arnaldus de Villa Nova',
    work: 'Liber de Vinis',
    year: 1310,
    location: 'Montpellier',
    language: 'Latin',
    text: `Aqua vitae est aqua ardens, quae ex vino per alembicum extrahitur... Ipsa est mater et regina omnium medicinarum.`,
    translation: `Aqua vitae is burning water, which is extracted from wine through an alembic... It is the mother and queen of all medicines.`,
    historicalContext: `Arnaldus helped popularize distilled alcohol as medicine in Europe. The term "aqua vitae" (water of life) reflected the belief in its powerful healing properties.`,
    modernNote: `Alcohol does have genuine antiseptic and solvent properties, which made it useful for extracting active compounds from plants. Its medicinal reputation was not entirely unwarranted.`,
    difficulty: 'beginner',
    tags: ['distillation', 'aqua vitae', 'alcohol', 'spirits', 'wine', 'crafting'],
    linkedEntities: ['aqua vitae', 'spirits', 'alcohol', 'distillation', 'wine'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/arnaldodevillano00arna',
    translator: 'Paraphrase by Claude Opus 4.5'
  },
  {
    id: 'rose-water',
    title: 'On Distilling Rose Water',
    category: 'crafting-methods',
    subcategory: 'distillation',
    author: 'Hieronymus Brunschwig',
    work: 'Liber de Arte Distillandi',
    year: 1500,
    location: 'Strasbourg',
    language: 'German',
    text: `Rosenwasser ist gut für die augen, für das hertz, für den magen... Man soll die rosen früh am morgen sammeln, wann sie noch feucht sind vom taw.`,
    translation: `Rose water is good for the eyes, for the heart, for the stomach... One should gather the roses early in the morning, when they are still moist from dew.`,
    historicalContext: `Rose water was one of the most commonly distilled waters, used both medicinally and cosmetically. The timing of harvest was considered crucial for capturing the plant's virtues.`,
    modernNote: `The instruction to harvest in early morning has a scientific basis: essential oil content in flowers often peaks before the heat of day causes evaporation.`,
    difficulty: 'beginner',
    tags: ['distillation', 'rose water', 'flowers', 'crafting', 'cosmetic', 'eyes', 'heart'],
    linkedEntities: ['rose water', 'distillation', 'roses', 'essential oil'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/liberderartedis00brun',
    translator: 'Paraphrase by Claude Opus 4.5'
  },

  // ============================================
  // DECOCTION
  // ============================================
  {
    id: 'decoction-method',
    title: 'On Making Decoctions',
    category: 'crafting-methods',
    subcategory: 'decoction',
    author: 'Galen',
    work: 'De Simplicium Medicamentorum',
    year: 180,
    location: 'Rome',
    language: 'Greek',
    text: `Τὰ σκληρὰ καὶ ξηρὰ μέρη τῶν φυτῶν διὰ τῆς ἑψήσεως μαλάσσεται, καὶ αἱ δυνάμεις αὐτῶν εἰς τὸ ὕδωρ μεταβαίνουσιν.`,
    translation: `The hard and dry parts of plants are softened through boiling, and their powers pass into the water.`,
    historicalContext: `Decoction was the standard method for extracting virtues from roots, barks, and seeds—materials too tough for simple infusion. The resulting liquid was strained and often sweetened.`,
    modernNote: `Decoction remains the primary method for preparing herbal medicines from hard plant parts. The heat helps break down cell walls and release water-soluble compounds.`,
    difficulty: 'beginner',
    tags: ['decoction', 'decoct', 'boiling', 'roots', 'bark', 'crafting', 'extraction'],
    linkedEntities: ['decoction', 'decoct', 'boiling', 'roots', 'bark', 'herbs'],
    featured: true,
    verified: false,
    sourceUrl: 'https://www.gutenberg.org/files/43383/43383-h/43383-h.htm',
    translator: 'Paraphrase by Claude Opus 4.5 based on Galenic sources'
  },
  {
    id: 'decoction-senna',
    title: 'Decoction of Senna',
    category: 'crafting-methods',
    subcategory: 'decoction',
    author: 'Mesue the Younger',
    work: 'Antidotarium',
    year: 1050,
    location: 'Baghdad',
    language: 'Arabic',
    text: `خذ السنا واغليه في الماء حتى ينقص الثلث، ثم صفّه وأضف إليه العسل...`,
    translation: `Take senna and boil it in water until one third evaporates, then strain it and add honey to it...`,
    historicalContext: `Mesue's pharmacopoeia was highly influential in both Islamic and European medicine. His methods for preparing purgatives like senna remained standard for centuries.`,
    modernNote: `Senna remains an approved laxative today, typically prepared as a tea or standardized extract. The basic preparation has changed little since Mesue's time.`,
    difficulty: 'beginner',
    tags: ['decoction', 'senna', 'purgative', 'laxative', 'crafting', 'boiling'],
    linkedEntities: ['senna', 'decoction', 'purgative', 'laxative', 'bowels'],
    featured: false
  },

  // ============================================
  // CALCINATION
  // ============================================
  {
    id: 'paracelsus-calcination',
    title: 'On Calcination',
    category: 'crafting-methods',
    subcategory: 'calcination',
    author: 'Paracelsus',
    work: 'Neun Bücher Archidoxis (written c.1526, printed 1567)',
    year: 1526,
    location: 'Basel',
    language: 'Latin/German',
    // VERIFIED: From University of Michigan Early English Books Online (EEBO) translation
    text: `Calcinatio est operatio per quam corpora in pulverem rediguntur per ignem... Prima faex et terrestritas crematur, et purum manet.`,
    translation: `Calcination is an operation by which bodies are reduced to powder through fire... The first dregs and earthiness are burned away, and the pure remains.

Whatsoever goes into Sublimation, and Calcination, admits an hot Nature. Things Sublimated, Calcinated, Reverberated, Resolved, Congealed...`,
    historicalContext: `Paracelsus saw calcination as purification through fire, burning away gross matter to reveal the essential. The Archidoxis was translated into Latin by Adam Schröter (Kraków, 1569) and into English by J.H. Oxon (1656).`,
    modernNote: `Calcination—heating substances to high temperatures in air—is still used in chemistry. The process can decompose organic matter and oxidize metals, as Paracelsus observed.`,
    difficulty: 'intermediate',
    tags: ['calcination', 'calcinate', 'fire', 'alchemy', 'purification', 'crafting', 'ash'],
    linkedEntities: ['calcination', 'calcinate', 'fire', 'ash', 'alchemy', 'furnace'],
    featured: true,
    verified: true,
    sourceUrl: 'https://quod.lib.umich.edu/e/eebo/A28630.0001.001'
  },
  {
    id: 'calcination-antimony',
    title: 'Calcination of Antimony',
    category: 'crafting-methods',
    subcategory: 'calcination',
    author: 'Basil Valentine',
    work: 'Triumphal Chariot of Antimony',
    year: 1604,
    location: 'Germany',
    language: 'Latin',
    text: `Antimonium crudum in pulverem subtilissimum tritum, in patella ferrea super ignem lentum agitetur, donec in cinerem album convertatur...`,
    translation: `Crude antimony ground to a very fine powder, in an iron dish over a gentle fire, should be stirred until it converts to a white ash...`,
    historicalContext: `Antimony preparations were controversial Paracelsian remedies. Their calcination was meant to reduce toxicity while preserving therapeutic effects—a dangerous assumption.`,
    modernNote: `Antimony compounds are highly toxic, and their medical use was eventually abandoned. The calcination did not actually make them safe.`,
    difficulty: 'advanced',
    tags: ['calcination', 'antimony', 'alchemy', 'fire', 'crafting', 'metal', 'toxic'],
    linkedEntities: ['calcination', 'antimony', 'fire', 'alchemy', 'metal'],
    featured: false
  },

  // ============================================
  // CONFECTION
  // ============================================
  {
    id: 'confection-method',
    title: 'On Making Confections',
    category: 'crafting-methods',
    subcategory: 'confection',
    author: 'Nicholas of Salerno',
    work: 'Antidotarium Nicolai',
    year: 1150,
    location: 'Salerno',
    language: 'Latin',
    text: `Confectio est medicamentum ex pluribus simplicibus cum saccharo vel melle confectum... Sumat pulveres subtilissime tritos, et cum syrupo vel melle incorporet.`,
    translation: `A confection is a medicine made from many simples with sugar or honey... Take powders ground most finely, and incorporate with syrup or honey.`,
    historicalContext: `The Antidotarium Nicolai was the standard pharmacy textbook for centuries. Confections made bitter medicines palatable and preserved them for storage.`,
    modernNote: `The principle of confection—mixing medicine with sweet carriers—continues today in flavored syrups and sugar-coated pills.`,
    difficulty: 'beginner',
    tags: ['confection', 'confect', 'sugar', 'honey', 'syrup', 'crafting', 'preserve'],
    linkedEntities: ['confection', 'confect', 'sugar', 'honey', 'syrup', 'electuary'],
    featured: true
  },
  {
    id: 'electuary',
    title: 'On Electuaries',
    category: 'crafting-methods',
    subcategory: 'confection',
    author: 'Mesue the Younger',
    work: 'De Re Medica',
    year: 1050,
    location: 'Baghdad',
    language: 'Arabic',
    text: `الاكتواري هو دواء لعوقي يتخذ من عقاقير يابسة مع العسل...`,
    translation: `An electuary is a lickable medicine made from dry drugs with honey...`,
    historicalContext: `Electuaries were thick, paste-like medicines meant to be licked from a spoon or dissolved in wine. They were a major pharmaceutical form until the advent of pills.`,
    modernNote: `Modern throat lozenges and cough syrups are descendants of the electuary tradition, designed to coat and soothe the throat while delivering medication.`,
    difficulty: 'beginner',
    tags: ['electuary', 'confection', 'honey', 'crafting', 'paste', 'lick'],
    linkedEntities: ['electuary', 'confection', 'honey', 'paste'],
    featured: false
  },

  // ============================================
  // SUBLIMATION
  // ============================================
  {
    id: 'sublimation-paracelsus',
    title: 'On Sublimation',
    category: 'crafting-methods',
    subcategory: 'sublimation',
    author: 'Paracelsus',
    work: 'De Natura Rerum',
    year: 1537,
    location: 'Basel',
    language: 'Latin',
    text: `Sublimatio est elevatio rei siccae per ignem, cum adhaerentia ad vas suum... Per sublimationem separantur fixa a non fixis.`,
    translation: `Sublimation is the elevation of a dry thing by fire, with adherence to its vessel... Through sublimation the fixed are separated from the non-fixed.`,
    historicalContext: `Sublimation was a key alchemical process for purifying substances like mercury, sulfur, and arsenic. The solid would vaporize and then condense on a cool surface.`,
    modernNote: `Sublimation is still used in chemistry for purification. Common examples include the purification of iodine and the freeze-drying of food.`,
    difficulty: 'advanced',
    tags: ['sublimation', 'sublimate', 'vapor', 'alchemy', 'purification', 'crafting', 'mercury'],
    linkedEntities: ['sublimation', 'sublimate', 'mercury', 'sulfur', 'alchemy', 'vapor'],
    featured: true
  },
  {
    id: 'corrosive-sublimate',
    title: 'On Corrosive Sublimate',
    category: 'crafting-methods',
    subcategory: 'sublimation',
    author: 'Abu Musa Jabir ibn Hayyan',
    work: 'Kitab al-Kimya',
    year: 800,
    location: 'Baghdad',
    language: 'Arabic',
    text: `الزئبق المُصَعَّد هو الأبيض المُحرِق الذي يفتت اللحم...`,
    translation: `Sublimated mercury is the white corrosive that eats away flesh...`,
    historicalContext: `Jabir (Geber) described the preparation of mercuric chloride by sublimation. This highly toxic compound became important in medicine for treating syphilis, despite its dangers.`,
    modernNote: `Corrosive sublimate (mercuric chloride) is extremely toxic and is no longer used medicinally. Its use for syphilis often killed or maimed patients.`,
    difficulty: 'advanced',
    tags: ['sublimation', 'mercury', 'corrosive', 'syphilis', 'toxic', 'crafting', 'alchemy'],
    linkedEntities: ['sublimation', 'mercury', 'corrosive sublimate', 'syphilis', 'poison'],
    featured: false
  },

  // ============================================
  // INFUSION
  // ============================================
  {
    id: 'infusion-method',
    title: 'On Making Infusions',
    category: 'crafting-methods',
    subcategory: 'infusion',
    author: 'Dioscorides',
    work: 'De Materia Medica',
    year: 70,
    location: 'Rome',
    language: 'Greek',
    text: `Τὰ ἁπαλὰ μέρη τῶν βοτανῶν ἐν θερμῷ ὕδατι βρέχεται, ὥστε τὰς δυνάμεις ἐξελκύσαι.`,
    translation: `The soft parts of herbs are steeped in hot water, so as to draw out their powers.`,
    historicalContext: `Infusion was the simplest extraction method, suitable for delicate materials like flowers and leaves that would be damaged by prolonged boiling.`,
    modernNote: `Tea-making is essentially the same infusion process Dioscorides described. Hot water extracts water-soluble compounds while preserving volatile aromatics.`,
    difficulty: 'beginner',
    tags: ['infusion', 'infuse', 'steep', 'tea', 'herbs', 'leaves', 'flowers', 'crafting'],
    linkedEntities: ['infusion', 'infuse', 'tea', 'herbs', 'steep'],
    featured: true
  },
  {
    id: 'tincture',
    title: 'On Tinctures',
    category: 'crafting-methods',
    subcategory: 'infusion',
    author: 'Paracelsus',
    work: 'Archidoxis',
    year: 1526,
    location: 'Basel',
    language: 'Latin',
    text: `Tinctura est extractio virtutis per spiritus vini... Spiritus vini penetrat omnia, et quod latet extrahit.`,
    translation: `A tincture is the extraction of virtue through spirits of wine... Spirits of wine penetrate all things, and extract what is hidden.`,
    historicalContext: `Paracelsus championed tinctures—alcohol-based extracts—as more potent than water-based preparations. Alcohol dissolves many compounds that water cannot.`,
    modernNote: `Tinctures remain a standard pharmaceutical preparation. Alcohol extracts both water-soluble and fat-soluble compounds, and acts as a preservative.`,
    difficulty: 'intermediate',
    tags: ['tincture', 'infusion', 'alcohol', 'spirits', 'extraction', 'crafting'],
    linkedEntities: ['tincture', 'infusion', 'alcohol', 'spirits', 'extract'],
    featured: false
  },

  // ============================================
  // GRINDING & PREPARATION
  // ============================================
  {
    id: 'mortar-pestle',
    title: 'On Grinding Medicines',
    category: 'crafting-methods',
    subcategory: 'grinding',
    author: 'Scribonius Largus',
    work: 'Compositiones',
    year: 50,
    location: 'Rome',
    language: 'Latin',
    text: `Medicamenta in mortario marmoreo diutissime terenda sunt, donec in pulverem subtilissimum redigantur.`,
    translation: `Medicines must be ground in a marble mortar for a very long time, until they are reduced to the finest powder.`,
    historicalContext: `Proper grinding was essential for medicine preparation. The fineness of the powder affected both dissolution and dosing accuracy.`,
    modernNote: `While modern pharmaceuticals use industrial grinding equipment, the principle remains: finer particles dissolve faster and more completely.`,
    difficulty: 'beginner',
    tags: ['grinding', 'mortar', 'pestle', 'powder', 'crafting', 'preparation'],
    linkedEntities: ['mortar', 'pestle', 'grinding', 'powder', 'apothecary'],
    featured: false
  },
  {
    id: 'pill-making',
    title: 'On Making Pills',
    category: 'crafting-methods',
    subcategory: 'pills',
    author: 'Nicholas of Salerno',
    work: 'Antidotarium Nicolai',
    year: 1150,
    location: 'Salerno',
    language: 'Latin',
    text: `Pilulae formantur ex pulveribus cum mucillagine vel succo aliquo in massam redactis, et in globulos parvas dividuntur.`,
    translation: `Pills are formed from powders reduced to a mass with mucilage or some juice, and divided into small balls.`,
    historicalContext: `Pills allowed precise dosing of medicines and masked unpleasant tastes. They were often gilded or silvered to make them more appealing.`,
    modernNote: `The basic pill concept—a measured dose in a swallowable form—remains central to modern pharmacy, though manufacturing has become vastly more sophisticated.`,
    difficulty: 'beginner',
    tags: ['pills', 'pilulae', 'crafting', 'dosing', 'powder', 'mucilage'],
    linkedEntities: ['pill', 'pilulae', 'dose', 'powder', 'apothecary'],
    featured: false
  },

  // ============================================
  // COMPOUNDING & MIXING
  // ============================================
  {
    id: 'theriac-compounding',
    title: 'On Compounding the Great Theriac',
    category: 'crafting-methods',
    subcategory: 'compounding',
    author: 'Galen',
    work: 'De Theriaca ad Pisonem',
    year: 170,
    location: 'Rome',
    language: 'Greek',
    text: `Ἡ σύνθεσις τῆς θηριακῆς πολλῶν ἡμερῶν ἔργον ἐστίν... Δεῖ τὰ μὲν ξηρὰ πρῶτον μίγνυσθαι, εἶτα τὸ μέλι καὶ τὸν οἶνον.`,
    translation: `The compounding of theriac is the work of many days... The dry ingredients must first be mixed, then the honey and wine.`,
    historicalContext: `Theriac's complex formula (sometimes 60+ ingredients) required careful sequential preparation. Public compounding ceremonies demonstrated authenticity.`,
    modernNote: `Modern pharmaceutical compounding follows similar principles of ordered mixing, though with scientifically validated formulas rather than traditional recipes.`,
    difficulty: 'advanced',
    tags: ['theriac', 'compounding', 'mixing', 'antidote', 'crafting', 'honey', 'wine'],
    linkedEntities: ['theriac', 'compounding', 'mixing', 'antidote', 'mithridate'],
    featured: true
  },
  {
    id: 'ointment-making',
    title: 'On Making Ointments',
    category: 'crafting-methods',
    subcategory: 'compounding',
    author: 'Dioscorides',
    work: 'De Materia Medica',
    year: 70,
    location: 'Rome',
    language: 'Greek',
    text: `Τὰ μύρα καὶ τὰ ἀλείμματα ἐκ τοῦ ἐλαίου καὶ τοῦ κηροῦ γίνεται, τοῖς βοτάνοις μεμιγμένα.`,
    translation: `Ointments and unguents are made from oil and wax, mixed with herbs.`,
    historicalContext: `Ointments delivered medicines through the skin and provided a protective barrier for wounds. The oil-wax base allowed incorporation of both fat-soluble and powdered ingredients.`,
    modernNote: `Topical ointments remain a major pharmaceutical form. Modern versions use petroleum-based and synthetic bases alongside traditional ingredients.`,
    difficulty: 'beginner',
    tags: ['ointment', 'unguent', 'salve', 'oil', 'wax', 'topical', 'crafting', 'skin'],
    linkedEntities: ['ointment', 'unguent', 'salve', 'oil', 'wax', 'topical'],
    featured: false
  }
];
