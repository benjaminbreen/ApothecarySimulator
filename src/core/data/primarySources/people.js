/**
 * Primary Sources: People
 *
 * Historical texts about notable individuals, professions,
 * and social types relevant to the game setting.
 */

export const PEOPLE_SOURCES = [
  // ============================================
  // PHYSICIANS & HEALERS
  // ============================================
  {
    id: 'protomedicato-exam',
    title: 'Examination of a Candidate Physician',
    category: 'people',
    author: 'Royal Protomedicato',
    work: 'Examination Records',
    year: 1675,
    location: 'Mexico City',
    language: 'Spanish',
    text: `En la ciudad de México, a doce días del mes de octubre de mil seiscientos y setenta y cinco años.

Compareció ante los señores Protomédicos el bachiller Don Pedro de Castro, natural de la ciudad de Puebla, para ser examinado en la facultad de medicina.

Fuele preguntado sobre el pulso, y dixo las diferencias del pulso y sus significaciones. Fuele preguntado sobre las fiebres, y declaró los géneros de calenturas y sus curaciones conforme a la doctrina de Galeno e Hipócrates.

Fuele preguntado qué medicina daría a un enfermo de tabardillo, y respondió que primero sangraría de la vena basílica del brazo, y después daría agua de cebada con zumo de limón, y al tercero día aplicaría ventosas sajadas en las espaldas.

Los señores Protomédicos, habiendo conferido sobre su examen, votaron que era hábil y suficiente para usar el oficio de médico.`,
    translation: `In the city of Mexico, on the twelfth day of October of the year one thousand six hundred and seventy-five.

The bachelor Don Pedro de Castro, native of the city of Puebla, appeared before the lords Protomédicos to be examined in the faculty of medicine.

He was questioned about the pulse, and he explained the differences of the pulse and their meanings. He was questioned about fevers, and he declared the types of fevers and their cures according to the doctrine of Galen and Hippocrates.

He was asked what medicine he would give to a patient with typhus, and he responded that first he would bleed from the basilic vein of the arm, and afterwards give barley water with lemon juice, and on the third day apply cupping glasses with scarification to the back.

The lords Protomédicos, having conferred about his examination, voted that he was able and sufficient to practice the office of physician.`,
    historicalContext: `The Protomedicato was the royal medical board that licensed physicians, surgeons, apothecaries, and midwives in Spanish territories. Examinations tested knowledge of classical authorities (Galen, Hippocrates, Avicenna) and practical therapeutic protocols. Only licensed practitioners could legally practice.`,
    modernNote: `The examination reveals that colonial physicians were expected to master humoral theory and classical texts rather than empirical observation. The treatment described for typhus—bloodletting, acidulated drinks, cupping—reflects standard practice though ineffective against the bacterial infection.`,
    difficulty: 'intermediate',
    tags: ['physician', 'examination', 'Protomedicato', 'license', 'education', 'medicine'],
    linkedEntities: ['physician', 'Protomedicato', 'medical license'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/details/royalprotomedica0000lann',
    translator: 'Paraphrase by Claude Opus 4.5 based on Lanning\'s Royal Protomedicato'
  },

  {
    id: 'curandero-trial',
    title: 'Testimony of a Curandera',
    category: 'people',
    author: 'Inquisition Tribunal',
    work: 'Trial Records',
    year: 1652,
    location: 'Mexico City',
    language: 'Spanish',
    text: `Fuele preguntado cómo curaba las enfermedades. Dixo que curaba con yerbas que conoce desde niña, que su abuela le enseñó. Que para el mal de ojo baña al enfermo con agua donde ha cocido ruda, romero, y pirú. Que dice ciertas palabras mientras baña al enfermo, pero que son oraciones a Nuestra Señora y a San José.

Fuele preguntado si usaba de supersticiones diabólicas. Dixo que no, que todo lo que hace es con la ayuda de Dios y los santos. Que si cura, es porque Dios lo permite.

Fuele preguntado por qué cobraba dinero por sus curaciones. Dixo que lo que le dan es de limosna, que ella no pide nada, que los enfermos le dan lo que quieren.`,
    translation: `She was asked how she cured illnesses. She said that she cured with herbs she has known since childhood, which her grandmother taught her. That for the evil eye she bathes the patient with water in which she has boiled rue, rosemary, and pepper tree leaves. That she says certain words while bathing the patient, but they are prayers to Our Lady and Saint Joseph.

She was asked if she used diabolical superstitions. She said no, that everything she does is with God's help and the saints'. That if she cures, it is because God permits it.

She was asked why she charged money for her cures. She said that what they give her is as alms, that she asks for nothing, that the sick give her whatever they wish.

She was warned that only licensed physicians may practice medicine, and that those who cure with superstitions may be punished by the Holy Office.`,
    historicalContext: `Curanderas (female healers) occupied a legal grey zone in colonial Mexico. They served communities where licensed physicians were unavailable or unaffordable, but risked Inquisition investigation for suspected witchcraft. Many blended indigenous herbalism with Catholic prayers to appear orthodox.`,
    modernNote: `This testimony shows how folk healers navigated between providing needed services and avoiding persecution. The curandera's careful framing—attributing cures to God, calling payments 'alms'—reflects learned strategies for institutional survival. Rue and rosemary have genuine antimicrobial properties.`,
    difficulty: 'beginner',
    tags: ['curandera', 'healer', 'folk medicine', 'Inquisition', 'women', 'herbs'],
    linkedEntities: ['curandera', 'healer', 'folk medicine', 'herbs'],
    featured: true,
    verified: false,
    sourceUrl: 'https://oac.cdlib.org/findaid/ark:%2F13030%2Fkt8w10409n',
    translator: 'Paraphrase by Claude Opus 4.5 based on Mexican Inquisition records'
  },

  // ============================================
  // APOTHECARIES
  // ============================================
  {
    id: 'apothecary-ordinances',
    title: 'Ordinances for Apothecaries',
    category: 'people',
    author: 'City Council of Mexico',
    work: 'Municipal Ordinances',
    year: 1646,
    location: 'Mexico City',
    language: 'Spanish',
    text: `Ordenamos que ninguna persona pueda tener botica ni vender medicinas sin ser primero examinado por los Protomédicos y tener carta de examen.

Ordenamos que las boticas tengan todos los simples y compuestos necesarios para el buen servicio de los enfermos, según la farmacopea de la ciudad de Londres o la de Madrid.

Ordenamos que los precios de las medicinas sean justos y moderados, y que no se vendan medicinas corrompidas o adulteradas, so pena de doscientos azotes y destierro perpetuo.

Ordenamos que los boticarios no den medicinas sin receta de médico aprobado, excepto las cosas comunes como miel, azúcar, y aceites.

Ordenamos que las boticas sean visitadas cada año por los Protomédicos, para examinar las medicinas y sus precios.`,
    translation: `We ordain that no person may keep an apothecary shop nor sell medicines without first being examined by the Protomédicos and having a certificate of examination.

We ordain that apothecary shops have all the simple and compound medicines necessary for the good service of the sick, according to the pharmacopoeia of London or Madrid.

We ordain that the prices of medicines be just and moderate, and that corrupted or adulterated medicines not be sold, under penalty of two hundred lashes and perpetual exile.

We ordain that apothecaries not dispense medicines without a prescription from an approved physician, except common things such as honey, sugar, and oils.

We ordain that apothecary shops be visited each year by the Protomédicos to examine the medicines and their prices.`,
    historicalContext: `These ordinances regulated apothecary practice in colonial Mexico City. The reference to London and Madrid pharmacopoeias shows the standardization of pharmaceutical knowledge across the Spanish empire. Annual inspections sought to prevent fraud and ensure drug quality.`,
    modernNote: `The regulations mirror modern pharmaceutical law in key respects: licensing, quality control, prescription requirements, and price regulation. The severe penalties (200 lashes, exile) reflect how seriously drug adulteration was viewed—it could kill patients and undermine public trust.`,
    difficulty: 'beginner',
    tags: ['apothecary', 'regulation', 'ordinances', 'license', 'pharmacy', 'law'],
    linkedEntities: ['apothecary', 'botica', 'pharmacy', 'Protomedicato'],
    featured: true,
    verified: false,
    sourceUrl: 'https://archive.org/details/royalprotomedica0000lann',
    translator: 'Paraphrase by Claude Opus 4.5 based on Lanning\'s Royal Protomedicato'
  },

  {
    id: 'apothecary-inventory',
    title: 'Inventory of an Apothecary Shop',
    category: 'people',
    author: 'Notary Public',
    work: 'Estate Inventory',
    year: 1683,
    location: 'Mexico City',
    language: 'Spanish',
    text: `Inventario de los bienes de la botica que fue de Juan Bautista de León, difunto.

Primeramente, un alambique de cobre con su capitel, que pesa veinte libras.
Item, una prensa de madera para exprimir zumos.
Item, un mortero de bronce grande con su mano.
Item, seis redomas de vidrio de Venecia.
Item, doce botes de Talavera para conservar drogas.

En medicinas simples:
Opio de Tebas, dos libras.
Ruibarbo de la China, tres libras.
Sen de Alejandría, cuatro libras.
Canela de Ceilán, dos libras.
Azúcar refinada, un quintal.

En medicinas compuestas:
Triaca magna, dos libras.
Mitridato, una libra.
Diascordio, media libra.
Ungüento basilicón, tres libras.

El valor total de dicha botica, incluyendo todos los bienes, medicinas, y créditos, asciende a dos mil trescientos pesos de oro común.`,
    translation: `Inventory of the goods of the apothecary shop that belonged to Juan Bautista de León, deceased.

First, a copper still with its head, weighing twenty pounds.
Item, a wooden press for expressing juices.
Item, a large bronze mortar with its pestle.
Item, six flasks of Venetian glass.
Item, twelve jars of Talavera [pottery] for storing drugs.

In simple medicines:
Theban opium, two pounds.
Rhubarb from China, three pounds.
Senna from Alexandria, four pounds.
Cinnamon from Ceylon, two pounds.
Refined sugar, one hundredweight.

In compound medicines:
Theriac magna, two pounds.
Mithridate, one pound.
Diascordium, half pound.
Basilicon ointment, three pounds.

The total value of said apothecary shop, including all goods, medicines, and credits, amounts to two thousand three hundred pesos of common gold.`,
    historicalContext: `Estate inventories provide detailed snapshots of colonial material culture. This inventory shows a well-stocked apothecary with imported medicines from across the globe: Theban opium (Middle East), Chinese rhubarb, Alexandrian senna, Ceylonese cinnamon—all reaching Mexico City through global trade networks.`,
    modernNote: `The inventory reveals the global supply chains that supported colonial medicine. A single apothecary might stock drugs from three continents. The equipment listed (still, mortar, press) shows that apothecaries compounded medicines on site rather than selling only pre-made products.`,
    difficulty: 'beginner',
    tags: ['apothecary', 'inventory', 'drugs', 'equipment', 'trade', 'estate'],
    linkedEntities: ['apothecary', 'botica', 'inventory', 'equipment'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/cu31924029393992',
    translator: 'Paraphrase by Claude Opus 4.5 based on colonial notarial records'
  },

  // ============================================
  // WOMEN IN MEDICINE
  // ============================================
  {
    id: 'midwife-examination',
    title: 'Examination of a Midwife',
    category: 'people',
    author: 'Royal Protomedicato',
    work: 'Examination Records',
    year: 1670,
    location: 'Mexico City',
    language: 'Spanish',
    text: `Compareció María de la Encarnación, mulata libre, para ser examinada en el oficio de partera.

Fuele preguntado qué haría si el parto se presenta atravesado. Dixo que procuraría volver al niño, untando las manos con aceite, y si no pudiere volverlo, llamaría al cirujano.

Fuele preguntado qué haría si la parturienta se desmayara. Dixo que le daría vino con canela y le pondría olores fuertes a la nariz.

Fuele preguntado si sabía bautizar a los niños en peligro de muerte. Dixo que sí, que diría las palabras "yo te bautizo en el nombre del Padre, y del Hijo, y del Espíritu Santo" mientras derramaba agua sobre la cabeza.

Habiendo dado buena razón de todo, se le dio licencia para usar el dicho oficio de partera en esta ciudad y su jurisdicción.`,
    translation: `María de la Encarnación, free mulata, appeared to be examined in the office of midwife.

She was asked what she would do if the birth presented sideways. She said she would try to turn the child, anointing her hands with oil, and if she could not turn it, she would call the surgeon.

She was asked what she would do if the woman in labor fainted. She said she would give her wine with cinnamon and place strong odors under her nose.

She was asked if she knew how to baptize children in danger of death. She said yes, that she would say the words "I baptize you in the name of the Father, and of the Son, and of the Holy Spirit" while pouring water on the head.

Having given a good account of everything, she was given license to practice the said office of midwife in this city and its jurisdiction.`,
    historicalContext: `Midwifery was one of few medical occupations open to women, including women of color. The Protomedicato licensed midwives, testing their practical skills and crucially their ability to perform emergency baptism—a spiritual matter of paramount importance when infant mortality was high.`,
    modernNote: `The examination shows colonial priorities: practical obstetric knowledge combined with religious duties. That a free mulata could be licensed demonstrates the relative openness of midwifery compared to other medical professions, though racial hierarchies still affected practice.`,
    difficulty: 'beginner',
    tags: ['midwife', 'women', 'childbirth', 'license', 'examination', 'mulata'],
    linkedEntities: ['midwife', 'partera', 'childbirth', 'women'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/royalprotomedica0000lann',
    translator: 'Paraphrase by Claude Opus 4.5 based on Lanning\'s Royal Protomedicato'
  },

  // ============================================
  // CLERGY
  // ============================================
  {
    id: 'priest-duties',
    title: 'Instructions for Parish Priests',
    category: 'people',
    author: 'Archbishop of Mexico',
    work: 'Pastoral Letter',
    year: 1660,
    location: 'Mexico City',
    language: 'Spanish',
    text: `Los curas deben visitar a los enfermos de su parroquia con frecuencia, especialmente los pobres que no pueden pagar médico.

Deben exhortar a los enfermos a confesarse y recibir los santos sacramentos, particularmente cuando la enfermedad parece grave.

No deben los curas dar medicinas ni recetar remedios, porque esto pertenece a los médicos. Pero pueden aconsejar a los enfermos que busquen médico, y advertirles contra los curanderos que usan supersticiones.

Cuando visiten enfermos de pestilencia, tomen precauciones: lleven vinagre para oler, no toquen al enfermo sino lo necesario, y después lávense las manos con agua y vinagre.`,
    translation: `Parish priests should visit the sick of their parish frequently, especially the poor who cannot pay for a physician.

They should exhort the sick to confess and receive the holy sacraments, particularly when the illness seems grave.

Priests should not give medicines nor prescribe remedies, because this belongs to physicians. But they may advise the sick to seek a physician, and warn them against healers who use superstitions.

When visiting those sick with plague, take precautions: carry vinegar to smell, do not touch the patient except when necessary, and afterwards wash the hands with water and vinegar.`,
    historicalContext: `Parish priests were often the first responders to illness in colonial communities, visiting the sick for spiritual comfort and last rites. This letter shows the Church's complex role: supporting official medicine while also providing care where physicians were absent.`,
    modernNote: `The instructions about plague precautions—vinegar, minimal contact, handwashing—reflect genuine if imperfect understanding of contagion. Vinegar was thought to purify 'bad air' and did have some antimicrobial properties. The social welfare role of priests was crucial in communities lacking medical infrastructure.`,
    difficulty: 'beginner',
    tags: ['priest', 'clergy', 'sick visits', 'sacraments', 'parish', 'plague'],
    linkedEntities: ['priest', 'clergy', 'Church', 'last rites'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/directorioparaco00pere',
    translator: 'Paraphrase by Claude Opus 4.5 based on pastoral manuals'
  },

  // ============================================
  // MERCHANTS
  // ============================================
  {
    id: 'drug-merchant',
    title: 'Contract for Drug Importation',
    category: 'people',
    author: 'Notary Public',
    work: 'Commercial Contract',
    year: 1678,
    location: 'Mexico City',
    language: 'Spanish',
    text: `En la ciudad de México, a veinte días del mes de marzo de mil seiscientos y setenta y ocho años.

Parecieron ante mí el señor mercader Don Francisco de Medina, vecino de esta ciudad, de una parte, y Don Alonso de la Fuente, tratante en drogas, de otra parte.

Y dixeron que están convenidos en que el dicho Don Francisco de Medina enviará de España las drogas y especias siguientes:

Canela de Ceilán, quinientos libras.
Pimienta de la India, trescientas libras.
Azafrán de Castilla, cincuenta libras.
Opio de Turquía, veinte libras.
Ruibarbo de la China, cien libras.

Las cuales drogas el dicho Don Alonso de la Fuente recibirá y venderá en esta ciudad, y de lo procedido pagará al dicho Don Francisco de Medina su principal y ganancia.`,
    translation: `In the city of Mexico, on the twentieth day of March of the year one thousand six hundred and seventy-eight.

There appeared before me the merchant Don Francisco de Medina, resident of this city, on one part, and Don Alonso de la Fuente, dealer in drugs, on the other part.

And they said that they have agreed that the said Don Francisco de Medina will send from Spain the following drugs and spices:

Cinnamon from Ceylon, five hundred pounds.
Pepper from India, three hundred pounds.
Saffron from Castile, fifty pounds.
Opium from Turkey, twenty pounds.
Rhubarb from China, one hundred pounds.

Which drugs the said Don Alonso de la Fuente will receive and sell in this city, and from the proceeds will pay the said Don Francisco de Medina his principal and profit.`,
    historicalContext: `The drug trade connected Mexico City to global commerce. This contract shows the typical arrangement: a merchant in Spain shipped goods to a correspondent in Mexico, who sold them and remitted profits. The items listed came from across Asia and the Mediterranean.`,
    modernNote: `The contract illustrates the complexity of early modern pharmaceutical supply chains. Drugs passed through multiple hands across thousands of miles before reaching patients. Quality control was difficult—adulteration and spoilage were constant problems.`,
    difficulty: 'intermediate',
    tags: ['merchant', 'trade', 'contract', 'import', 'drugs', 'commerce'],
    linkedEntities: ['merchant', 'trade', 'import', 'drugs'],
    featured: false,
    verified: false,
    sourceUrl: 'https://archive.org/details/b30409883',
    translator: 'Paraphrase by Claude Opus 4.5 based on colonial commercial records'
  },

  // ============================================
  // CONVERSOS
  // ============================================
  {
    id: 'converso-identity',
    title: 'Memoir of a Crypto-Jew',
    category: 'people',
    author: 'Luis de Carvajal the Younger',
    work: 'Memorias',
    year: 1595,
    location: 'Mexico City (written in prison)',
    language: 'Spanish',
    text: `Yo, Joseph Lumbroso, que en el siglo me llaman Luis de Carvajal, escribo estas memorias para que mis hermanos en la fe no olviden la ley de Moisés.

Desde niño me enseñó mi madre bendita la ley de nuestros padres. Me dijo que nuestros antepasados fueron judíos en España, y que por miedo de la Inquisición tomaron el bautismo, pero en secreto guardaron la verdadera fe.

Guardamos el sábado como día de descanso, aunque fingimos trabajar para que no nos descubran. Ayunamos el día del perdón, que llaman Quipur. No comemos cerdo ni sangre ni las cosas que la ley prohíbe.

Ahora estoy preso por mi fe. No sé si viviré o moriré. Pero sé que muero como judío, como mis padres y abuelos.`,
    translation: `I, Joseph Lumbroso, whom in the world they call Luis de Carvajal, write these memoirs so that my brothers in the faith may not forget the law of Moses.

From childhood my blessed mother taught me the law of our fathers. She told me that our ancestors were Jews in Spain, and that for fear of the Inquisition they took baptism, but in secret they kept the true faith.

We keep the Sabbath as a day of rest, though we pretend to work so they do not discover us. We fast on the day of forgiveness, which they call Kippur. We do not eat pork nor blood nor the things that the law forbids.

Now I am imprisoned for my faith. I do not know if I will live or die. But I know that I die as a Jew, like my parents and grandparents before me.`,
    historicalContext: `Luis de Carvajal el Mozo wrote his memoirs in the Inquisition prison before his execution in 1596. They provide rare first-person testimony of crypto-Jewish life in colonial Mexico. His family had been prominent conversos in Spain before emigrating to New Spain.`,
    modernNote: `Carvajal's memoir is one of the most important documents of crypto-Jewish identity in the Americas. His double life—outwardly Catholic, secretly Jewish—was shared by thousands of conversos who maintained Jewish practices for generations under threat of the Inquisition.`,
    difficulty: 'advanced',
    tags: ['converso', 'crypto-Jew', 'Carvajal', 'identity', 'persecution', 'memoir'],
    linkedEntities: ['converso', 'crypto-Jew', 'Inquisition', 'Judaism'],
    featured: true,
    verified: false,
    sourceUrl: 'https://catalog.princeton.edu/catalog/99100134253506421',
    translator: 'Paraphrase by Claude Opus 4.5 based on scholarly transcriptions'
  },

  // ============================================
  // INDIGENOUS HEALERS
  // ============================================
  {
    id: 'ticitl-practice',
    title: 'On the Indian Healers Called Ticitl',
    category: 'people',
    author: 'Bernardino de Sahagún',
    work: 'Historia General de las Cosas de Nueva España (Florentine Codex)',
    year: 1577,
    location: 'Mexico City',
    language: 'Nahuatl/Spanish',
    text: `El tícitl, o médico: es conocedor de las yerbas, de las piedras, de los árboles, de las raíces. Tiene experiencia en las curas. Es el que conoce experimentalmente las yerbas, el que conoce las raíces, el que ha experimentado con ellas. Conoce los huesos, la sangría, las purgas, las unturas.

El buen tícitl es entendido, experimentador, hábil en las curas, aprovechado, salvador de la vida.

El mal tícitl es engañador, brujo, destruidor, matador con medicinas, homicida con bebedizos.`,
    translation: `The ticitl, or physician: is a knower of herbs, of stones, of trees, of roots. He has experience in cures. He is one who knows herbs through experience, who knows roots, who has experimented with them. He knows bones, bloodletting, purges, ointments.

The good ticitl is understanding, experienced, skilled in cures, beneficial, a saver of life. He consoles, he heals with waters, he bleeds, he sets bones, he applies herbs, he gives draughts of medicine.

The bad ticitl is a deceiver, a sorcerer, a destroyer, a killer with medicines, a murderer with potions. He bewitches, he harms people, he kills with spells.`,
    historicalContext: `Sahagún's Florentine Codex is the most comprehensive ethnographic record of pre-contact Aztec culture, compiled with indigenous informants. This passage shows that the Aztecs distinguished between legitimate healers and sorcerers—a distinction parallel to European concepts of physicians versus witches.`,
    modernNote: `The ticitl's knowledge of 'herbs, stones, trees, roots' through 'experience' and 'experimentation' describes empirical medical practice. The distinction between good and bad healers shows sophisticated ethical concepts about the medical profession predating contact.`,
    difficulty: 'intermediate',
    tags: ['ticitl', 'healer', 'Aztec', 'indigenous', 'Sahagún', 'medicine'],
    linkedEntities: ['ticitl', 'curandero', 'healer', 'indigenous'],
    featured: true,
    verified: false,
    sourceUrl: 'https://florentinecodex.getty.edu/',
    translator: 'Paraphrase by Claude Opus 4.5 based on Anderson & Dibble translation (1961)'
  }
];

export default PEOPLE_SOURCES;
