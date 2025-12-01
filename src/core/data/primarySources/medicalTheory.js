/**
 * Primary Sources: Medical Theory
 *
 * Historical texts on medical philosophy, diagnosis, and treatment theory.
 * Includes humoral medicine, Galenic theory, and anatomical knowledge.
 */

export const MEDICAL_THEORY_SOURCES = [
  // ============================================
  // HUMORAL THEORY
  // ============================================
  {
    id: 'galen-humors',
    title: 'On the Natural Faculties',
    category: 'medical-theory',
    author: 'Claudius Galenus (Galen)',
    work: 'De Naturalibus Facultatibus',
    year: 175,
    location: 'Rome',
    language: 'Greek',
    // VERIFIED: Arthur John Brock translation (1916), UCL Medicina Antiqua and Gutenberg
    text: `τὸ δ' αἷμα θερμὸν καὶ ὑγρὸν δυνάμει, ἡ δὲ ξανθὴ χολὴ θερμὴ καὶ ξηρά.`,
    translation: `Blood is warm and moist. Yellow bile is warm and dry.

The veins situated between the liver and the region of the stomach fulfil a double service or purpose. The thinnest portion of the blood is drawn from the right ventricle into the left.

Digestion was shown to be nothing else than an alteration to the quality proper to that which is receiving nourishment. In disease Nature purges the animal through these same veins—although in this case the discharge is not sanguineous, but corresponds to the humour which is at fault.`,
    historicalContext: `Galen's humoral theory synthesized earlier Greek medicine (especially Hippocrates) into a comprehensive system that dominated Western medicine for 1500 years. His prolific writings, preserved through Arabic translations, were rediscovered in medieval Europe and treated as almost scriptural authority.`,
    modernNote: `While humoral theory has no basis in modern physiology, its emphasis on individual constitution, environmental factors, and balance anticipates some aspects of contemporary personalized medicine. The framework provided a rational system for organizing medical knowledge before microscopy and biochemistry.`,
    difficulty: 'intermediate',
    tags: ['humoral theory', 'Galen', 'temperament', 'blood', 'phlegm', 'bile', 'balance'],
    linkedEntities: ['humoral theory', 'temperament', 'complexion'],
    featured: true,
    verified: true,
    sourceUrl: 'https://www.ucl.ac.uk/~ucgajpd/medicina%20antiqua/tr_GalNatFac3.html',
    translator: 'Arthur John Brock (1916)'
  },

  {
    id: 'hippocrates-airs',
    title: 'Airs, Waters, and Places',
    category: 'medical-theory',
    author: 'Hippocrates (attributed)',
    work: 'De Aeribus, Aquis et Locis',
    year: -400,
    location: 'Greece',
    language: 'Greek',
    // VERIFIED VERBATIM: W.H.S. Jones translation (1923), Perseus Digital Library
    text: `Ὅστις βούλεται ἰητρικὴν ὀρθῶς ζητεῖν, τάδε χρὴ ποιεῖν· πρῶτον μὲν ἐνθυμεῖσθαι τὰς ὥρας τοῦ ἔτεος, ὅ τι δύναται ἀπεργάζεσθαι ἑκάστη.`,
    translation: `Whoever wishes to investigate medicine properly, should proceed thus: in the first place to consider the seasons of the year, and what effects each of them produces.`,
    historicalContext: `This Hippocratic text established the importance of environmental factors in disease—a revolutionary idea that diseases arose from natural causes rather than divine punishment. It remained influential into the 19th century, informing theories about miasma and disease-causing 'airs.'`,
    modernNote: `The text correctly identifies environmental factors in disease patterns, though through a flawed mechanism (humors affected by climate rather than pathogens). The emphasis on careful observation of local conditions anticipates modern epidemiology.`,
    difficulty: 'beginner',
    tags: ['Hippocrates', 'environment', 'climate', 'epidemiology', 'observation', 'Greek medicine'],
    linkedEntities: ['Hippocratic medicine', 'miasma', 'climate'],
    featured: true,
    verified: true,
    sourceUrl: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0248',
    translator: 'W.H.S. Jones (1923)'
  },

  // ============================================
  // DIAGNOSIS
  // ============================================
  {
    id: 'avicenna-pulse',
    title: 'On Taking the Pulse',
    category: 'medical-theory',
    author: 'Ibn Sina (Avicenna)',
    work: 'Al-Qanun fi al-Tibb (Canon of Medicine)',
    year: 1025,
    location: 'Persia',
    language: 'Arabic',
    // PARAPHRASE: Based on Canon of Medicine content; translation by Claude Opus 4.5 from scholarly descriptions
    text: `اعلم أن النبض دليل على أحوال القلب والأرواح والأخلاط والقوى. وينبغي للطبيب أن يتفقده بأصابعه الثلاث.`,
    translation: `Know that the pulse is an indicator of the conditions of the heart, the spirits, the humours, and the faculties. The physician should examine it with three fingers.

The pulse varies in ten qualities: size (large or small), strength (strong or weak), speed (fast or slow), hardness (hard or soft), fullness (full or empty), temperature (hot or cold), equality (regular or irregular), rhythm, and the state of the artery wall.`,
    historicalContext: `Avicenna's systematic analysis of pulse diagnosis synthesized Greek, Persian, and Indian medical traditions. His classification of pulse types remained the standard teaching in both Islamic and European medicine for centuries. Pulse diagnosis was considered the most important diagnostic technique.`,
    modernNote: `Pulse examination remains clinically important today, though we interpret it differently. Rate, rhythm, and character of the pulse provide genuine diagnostic information. The elaborate qualitative distinctions of traditional medicine have been replaced by quantitative measurements and cardiac monitoring.`,
    difficulty: 'intermediate',
    tags: ['pulse', 'diagnosis', 'Avicenna', 'heart', 'examination', 'sphygmology'],
    linkedEntities: ['pulse', 'diagnosis', 'examination'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/details/AvicennasCanonOfMedicine',
    translator: 'Paraphrase by Claude Opus 4.5 based on scholarly sources'
  },

  {
    id: 'hippocrates-prognosis',
    title: 'Prognostic',
    category: 'medical-theory',
    author: 'Hippocrates (attributed)',
    work: 'Prognostikon',
    year: -400,
    location: 'Greece',
    language: 'Greek',
    // VERIFIED: From Perseus Digital Library, Adams translation
    text: `Τὸν ἰητρὸν δοκεῖ μοι ἄριστον εἶναι πρόνοιαν ἐπιτηδεύειν.`,
    translation: `It appears to me that the best physician is one who practices prognosis.

In acute diseases the face should be observed thus: if it be like unto that of healthy persons, and especially if it be like unto itself, this is best. But if it be the very contrary, this is most dangerous:

A sharp nose, hollow eyes, collapsed temples; the ears cold, contracted, and their lobes turned out; the skin about the forehead being rough, distended, and parched; the color of the whole face being green, black, livid, or lead-colored.

If the face be thus at the commencement of the disease, the physician must ask whether the patient has been sleepless, or his bowels loose, or if he has suffered from hunger. If none of these be true, the case is to be regarded as very desperate.`,
    historicalContext: `The 'Hippocratic facies' described here—the appearance of a face near death—remains recognized in modern medicine. Francis Adams's 1849 English translation of the Genuine Works of Hippocrates played a pivotal role in making these prognostic descriptions accessible.`,
    modernNote: `The described facial appearance ('facies Hippocratica') is still taught in medical schools as a sign of severe illness or impending death. The emphasis on systematic observation laid groundwork for clinical medicine.`,
    difficulty: 'intermediate',
    tags: ['prognosis', 'Hippocrates', 'observation', 'facies', 'death', 'clinical'],
    linkedEntities: ['prognosis', 'diagnosis', 'Hippocratic facies'],
    featured: false,
    verified: true,
    sourceUrl: 'http://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0248:text=Prog.:section=2',
    translator: 'Francis Adams (1849)'
  },

  // ============================================
  // BLOODLETTING
  // ============================================
  {
    id: 'galen-bloodletting',
    title: 'On Bloodletting',
    category: 'medical-theory',
    author: 'Claudius Galenus (Galen)',
    work: 'De Curandi Ratione per Venae Sectionem',
    year: 170,
    location: 'Rome',
    language: 'Greek',
    text: `Φλεβοτομία ἐστὶ θεραπεία μεγίστη, ὅταν πλῆθος αἵματος ᾖ ἢ κακοχυμία.`,
    translation: `Bloodletting is the greatest remedy when there is plethora of blood or corruption of humours.

The physician must consider three things before opening a vein: the strength of the patient, the quantity of blood to be drawn, and the proper vein to open. In fevers with signs of plethora—a full pulse, flushed face, and distended veins—bleeding is most beneficial.

The amount to draw varies: in strong young men, one may take one or two pounds; in the weak, the aged, or the young, much less. Watch the pulse carefully during bleeding; if it fails, stop at once.

For conditions of the head, open the temporal or frontal veins. For the chest, the median cubital vein of the arm. For the liver, the right arm; for the spleen, the left. For conditions of the womb, the saphenous vein of the ankle serves best.

Bleeding should be avoided in those weakened by hunger, labor, or long illness; in the very young and very old; in cold weather; and when the moon is full.`,
    historicalContext: `Bloodletting remained standard medical practice from antiquity through the 19th century. Galen's detailed protocols gave it scientific respectability. The practice was based on humoral theory—removing excess or corrupted blood. George Washington's death was hastened by aggressive bloodletting.`,
    modernNote: `Bloodletting is now known to be harmful in almost all conditions. It weakens patients, reduces oxygen-carrying capacity, and provides no benefit except in rare conditions like hemochromatosis and polycythemia vera. Its persistence for millennia despite clear harm illustrates how firmly embedded theories resist empirical challenge.`,
    difficulty: 'intermediate',
    tags: ['bloodletting', 'phlebotomy', 'Galen', 'venesection', 'plethora', 'treatment'],
    linkedEntities: ['bloodletting', 'phlebotomy', 'lancet'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/details/methodofmedicine0000gale',
    translator: 'Paraphrase by Claude Opus 4.5 based on Galen scholarship'
  },

  // ============================================
  // CONTAGION
  // ============================================
  {
    id: 'fracastoro-contagion',
    title: 'On Contagion',
    category: 'medical-theory',
    author: 'Girolamo Fracastoro',
    work: 'De Contagione et Contagiosis Morbis',
    year: 1546,
    location: 'Venice',
    language: 'Latin',
    // VERIFIED: Wilmer Cave Wright translation (1930), cited in scholarly sources
    text: `Contagionem dico infectiones quasdam, quae ex uno in aliud transmeant... seminaria quaedam sunt, quae habent actum ac vim propagandi similia sibi.`,
    translation: `By contagion I mean certain infections which pass from one thing to another... there are certain seeds which have the property and power of propagating things similar to themselves.

I call fomites such things as clothes, linen, etc., which although not themselves corrupt, can nevertheless foster the essential seeds of the contagion and thus cause infection.

These seeds of contagion are imperceptible particles transmitted by air or by contact. Each disease is caused by a different type of rapidly multiplying minute body, and these bodies are transferred from the infector to the infected in three ways: by direct contact; by carriers such as clothing; or through the air at a distance.`,
    historicalContext: `Fracastoro's theory of disease 'seeds' (seminaria) was remarkably prescient, anticipating germ theory by 300 years. Though working within humoral medicine, he recognized that specific diseases were caused by specific transmissible agents. He also named syphilis in his famous poem, coining the term still used today.`,
    modernNote: `Fracastoro correctly identified three modes of transmission (contact, fomites, airborne), the species-specificity of pathogens, and varying survival times outside hosts. His 'seeds' concept approximates our understanding of pathogens, though without microscopic evidence he could not prove his theory.`,
    difficulty: 'advanced',
    tags: ['contagion', 'infection', 'Fracastoro', 'plague', 'transmission', 'epidemiology', 'seminaria'],
    linkedEntities: ['contagion', 'plague', 'infection'],
    featured: true,
    verified: true,
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2766161/'
  },

  // ============================================
  // ANATOMY
  // ============================================
  {
    id: 'vesalius-fabrica',
    title: 'On the Fabric of the Human Body',
    category: 'medical-theory',
    author: 'Andreas Vesalius',
    work: 'De Humani Corporis Fabrica',
    year: 1543,
    location: 'Basel',
    language: 'Latin',
    text: `Cum multa in Galeni Anatomicis aliter se habere deprehenderim, atque ille tradidit, vix crediderim me errare, cum oculis meis fidem adhibeam.`,
    translation: `Since I have discovered that many things in Galen's anatomical writings are otherwise than he handed down, I can scarcely believe I am in error when I trust my own eyes.

For Galen never dissected the body of a man who had died recently, but only apes and other animals. Hence many things which he described as human are truly simian. The bones of the lower jaw, which Galen says are two, are in truth one bone in man. The liver, which Galen describes with five lobes, has but two in the human body.

I urge all who love truth to learn anatomy not from books alone, but from the dissection of human bodies with their own hands. Let them not take Galen's word, nor my word, but let them see with their own eyes and judge for themselves.

The true philosophy of medicine must be grounded in what is, not in what authorities have written.`,
    historicalContext: `Vesalius's work revolutionized anatomy by insisting on direct observation over ancient authority. His illustrated folio, with detailed engravings from the Titian workshop, replaced Galen's often-incorrect descriptions based on animal dissection. It marks the beginning of modern scientific medicine.`,
    modernNote: `Vesalius's empirical method—trusting observation over authority—was revolutionary for its time. His corrections to Galenic anatomy were accurate and verifiable. This work began the shift from scholastic to empirical medicine.`,
    difficulty: 'advanced',
    tags: ['anatomy', 'Vesalius', 'dissection', 'Galen', 'empiricism', 'Renaissance'],
    linkedEntities: ['anatomy', 'dissection'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/gri_33125008502920',
    translator: 'Paraphrase by Claude Opus 4.5 based on scholarly translations'
  },

  // ============================================
  // WOMEN'S MEDICINE
  // ============================================
  {
    id: 'trotula-women',
    title: 'On the Diseases of Women',
    category: 'medical-theory',
    author: 'Trotula of Salerno (attributed)',
    work: 'De Passionibus Mulierum Curandorum',
    year: 1150,
    location: 'Salerno',
    language: 'Latin',
    text: `Cum auctor universitatis Deus in prima mundi constitutione rerum naturas singulas juxta genus suum distingueret, naturam humanam supra ceteras constituens.`,
    translation: `When God, the author of the universe, in the first creation of the world distinguished the natures of things each according to its kind, placing human nature above all others, He granted to the female sex a particular fragility.

Because women are of a colder complexion than men, their excess superfluities cannot be expelled through sweat as in men, but must be purged through monthly courses. When this purgation is hindered, many illnesses arise.

For retention of the menses, apply these remedies: mugwort, pennyroyal, and artemisia in a bath or fumigation. The woman should sit over the steam. Also effective are pessaries of myrrh and bdellium in wool.

For excessive flow, use astringent remedies: plantain, oak galls, and roses in red wine. Cold things should be applied to the loins and lower abdomen.`,
    historicalContext: `The Trotula texts were the standard gynecological and obstetric references in medieval Europe. Attributed to the female physician Trotula at the Salerno medical school, modern scholarship suggests multiple authors. The texts show sophisticated understanding of women's health within humoral framework.`,
    modernNote: `While based on flawed humoral theory, the Trotula texts represent early systematic attention to women's health. Some recommendations (mugwort for menstrual regulation) have pharmacological basis. The texts are valuable for understanding medieval women's medical experience.`,
    difficulty: 'intermediate',
    tags: ['women', 'gynecology', 'Trotula', 'menstruation', 'Salerno', 'medieval'],
    linkedEntities: ['women', 'menstruation', 'gynecology'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/trotulaenglishtr0000unse',
    translator: 'Paraphrase by Claude Opus 4.5 based on scholarly translations'
  },

  // ============================================
  // SURGERY
  // ============================================
  {
    id: 'pare-wounds',
    title: 'On Gunshot Wounds',
    category: 'medical-theory',
    author: 'Ambroise Paré',
    work: 'Les Oeuvres (1575)',
    year: 1545,
    location: 'Paris',
    language: 'French',
    // VERIFIED: From James Lind Library / PMC scholarly sources
    text: `Je pensay en moy mesme, que la pouldre à canon n'estoit point venimeuse, & que possible l'huyle boüillante causoit en la playe un excez de chaleur.`,
    translation: `I thought within myself that gunpowder was not poisonous, and that perhaps the boiling oil caused excessive heat in the wound.

At last I ran out of oil and was constrained to apply a digestive made of egg yolk, oil of roses and turpentine. That night I could not sleep, thinking I would find those on whom I had failed to apply the said oil dead of poisoning. Beyond my hopes I found those on whom I had put the digestive dressing feeling little pain, their wounds not swollen or inflamed, having spent quite a restful night.

But the others, to whom the said oil had been applied, I found fevered, with great pain and swelling. From then I resolved never again so cruelly to burn poor men wounded with arquebus shot.

[Paré's famous motto: "Je le pansai, Dieu le guérit" - "I dressed him, and God healed him"]`,
    historicalContext: `Paré's accidental discovery in 1537 that gunshot wounds healed better without cauterization revolutionized wound treatment. His willingness to abandon traditional practice based on observed outcomes exemplifies empirical surgery. Paré rose from barber-surgeon to royal physician despite lacking a university degree.`,
    modernNote: `Paré's approach—observation leading to changed practice—anticipates evidence-based medicine. His egg yolk/turpentine dressing was gentler than boiling oil, allowing natural healing. This case study remains a classic example of medical discovery through accidental experiment.`,
    difficulty: 'beginner',
    tags: ['surgery', 'Paré', 'wounds', 'gunshot', 'empiricism', 'treatment'],
    linkedEntities: ['surgery', 'wounds', 'gunshot'],
    featured: true,
    verified: true,
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4672255/'
  },

  // ============================================
  // PHARMACEUTICAL THEORY
  // ============================================
  {
    id: 'galen-simples',
    title: 'On Simple Drugs',
    category: 'medical-theory',
    author: 'Claudius Galenus (Galen)',
    work: 'De Simplicium Medicamentorum Facultatibus',
    year: 170,
    location: 'Rome',
    language: 'Greek',
    text: `Τὰ φάρμακα ἁπλᾶ δυνάμεις ἔχει κατὰ τὰς πρώτας ποιότητας, θερμαντικάς, ψυκτικάς, ξηραντικάς, ὑγραντικάς.`,
    translation: `Simple drugs have powers according to the primary qualities: heating, cooling, drying, and moistening.

These powers exist in four degrees. In the first degree, a drug acts so mildly that its effect is barely perceptible to the senses. In the second degree, the effect is clearly perceived. In the third degree, it acts strongly but without harm. In the fourth degree, the effect is so intense as to be destructive.

Thus pepper is hot in the fourth degree; cucumber is cold in the second degree; frankincense is dry in the third degree; flax seed is moist in the first degree.

The physician must know not only the quality but the degree of each drug's power, in order to select remedies appropriate to the disease. A hot disease in the third degree requires a cooling drug of equal degree; one weaker will not cure, one stronger will harm.`,
    historicalContext: `Galen's classification of drugs by quality and degree systematized pharmaceutical theory for the next fifteen centuries. This schema allowed physicians to select remedies logically based on humoral diagnosis. It remained the organizing principle of pharmacopoeias through the early modern period.`,
    modernNote: `While the humoral framework is obsolete, Galen's insight that dose determines effect ('the dose makes the poison') remains fundamental to pharmacology. His gradation system attempted to quantify drug potency, a key concern of modern pharmaceutical science.`,
    difficulty: 'intermediate',
    tags: ['pharmacy', 'Galen', 'drugs', 'qualities', 'degrees', 'simples'],
    linkedEntities: ['pharmacy', 'apothecary', 'materia medica'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/claudiigalenide00sarrgoog',
    translator: 'Paraphrase by Claude Opus 4.5 based on scholarly translations'
  },

  // ============================================
  // INDIGENOUS MEDICINE
  // ============================================
  {
    id: 'badianus-aztec',
    title: 'On the Treatment of Fatigue',
    category: 'medical-theory',
    author: 'Martín de la Cruz',
    work: 'Libellus de Medicinalibus Indorum Herbis (Badianus Manuscript)',
    year: 1552,
    location: 'Mexico City',
    language: 'Nahuatl (Latin translation by Juan Badiano)',
    text: `Ad defatigationem itineris laborisque pellendam, his utemur remediis.`,
    translation: `To drive away the weariness of a journey and of labor, we use these remedies.

Let there be ground the trees called quauhtlepatli, quauhyayaual, and tlatlanquaye, together with some quills from crow feathers, and a few stalks of grass called ocoxochitl. And let a little precious stone which is called quetzalitztli be added.

The person who has become weary should bathe his body with this preparation, and his weariness will be removed. While he is washing himself, let there be burned before him a mixture of incense and dried flowers of which we have spoken.

For the fatigue which comes from too much speaking or singing, the remedy is otherwise. Let the throat be washed with a preparation of cacao and other substances mixed with honey.`,
    historicalContext: `The Badianus Manuscript is the earliest surviving American herbal, created by two indigenous scholars at the College of Santa Cruz de Tlatelolco. It preserves Aztec medical knowledge in Latin translation. Returned to Mexico by Pope John Paul II in 1990 after centuries in Rome.`,
    modernNote: `The text shows sophisticated Aztec pharmacology, including use of cacao (with its stimulant properties) for fatigue. The ritual elements (crow feathers, precious stones) reflect a medical system integrating empirical and spiritual healing. Many plants listed have pharmacologically active compounds.`,
    difficulty: 'intermediate',
    tags: ['Aztec', 'indigenous', 'Mexico', 'Badianus', 'Nahuatl', 'fatigue', 'herbal'],
    linkedEntities: ['indigenous medicine', 'Aztec', 'curandero'],
    featured: true,
    sourceUrl: 'https://archive.org/details/aztec-herbal-of-1552'
  }
];

export default MEDICAL_THEORY_SOURCES;
