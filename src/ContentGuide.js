import React, { useEffect } from 'react';
import './ContentGuide.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import primarySource1 from './assets/humors.jpg';
import primarySource2 from './assets/codex.jpg';
import primarySource3 from './assets/medicinapractica.jpg';
import primarySource4 from './assets/mariacoelho.jpeg';

const ContentGuide = ({ isOpen, toggleContentGuide }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (e.target.className === 'content-guide-popup') {
        toggleContentGuide();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, toggleContentGuide]);

  if (!isOpen) return null;

  const markdownContent = `

# What is the historical context for this?

Apothecaries were the historical predecessors to today's pharmacists. But the medicines they crafted were far stranger and surprising than what you might find in a pharmacy today. The practice of apothecaries in the 17th century was rooted in a blend of empirical knowledge, classical Greek, Roman, Muslim, and medieval Christian traditional medicine, and practices involving astrology, alchemy, and natural magic that veered toward the mystical. Maria de Lima, the "playable character" in this game and an adaptation of the real-life female apothecary Maria Coelho, is a semi-fictional apothecary in colonial Mexico City in the year 1680, a time when medicine was changing more rapidly than ever before.

## The Role of Apothecaries

The apothecaries of the 17th century occupied a unique and precarious position. On the one hand, they were critical figures in their communities, acting as front-line healers for clientele who might not be able to afford to visit physicians, while also creating drugs for physicians to prescribe. On the other hand, their involvement in the lucrative but controversial trade in medicinal drugs exposed them to accusations of fraud, heresy, and professional malpractice.

At the heart of the apothecaries' trade was their intimate knowledge of drugs, referred to as "simples" when in their raw, unprocessed state. Apothecaries like Maria Coelho, the daughter of a Jewish convert (*converso*) family in Portugal, mastered the art of transforming these simples into potent "compound remedies." Her work as an apothecary required her to be deeply familiar with the medicinal substances of her time, many of which were imported from distant lands. The shelves of her shop likely contained exotic ingredients such as guaiacum from the Americas or bezoar stones from Asia—substances that were part of the expanding global trade in drugs. 

  ![A depiction of the four humors from a 16th century German printed book](${primarySource1})
  *A depiction of the four humors from a 16th century German printed book*

The commodification of drugs in the 17th century was closely linked to their exotic origins. Apothecaries were at the forefront of this process, sourcing rare substances from Africa, Asia, and the Americas, and marketing them to European consumers eager for novel cures. João Curvo Semedo, a prominent Lisbon apothecary, openly praised the medicinal virtues of African and Asian remedies, going so far as to publish pamphlets that extolled the virtues of exotic drugs like bezoar and various animal-based cures. Semedo described how he had learned of these substances from "certain persons who have travelled in the Indies," though he was careful to obscure the identity of his informants—many of whom were likely non-European or non-Christian. This rhetorical strategy, common among apothecaries of the time, allowed them to capitalize on the allure of foreign drugs while distancing themselves from the social stigma associated with the non-European healers who had introduced these substances into European pharmacopoeias.

## Colonial Mexico's Medical Practices

In colonial Mexico, medicine was influenced by a combination of Indigenous, European, and African healing traditions. The blending of these traditions created a unique medical landscape where apothecaries like Maria navigated complex social and cultural dynamics.
The term 'Materia Medica' refers to the body of collected knowledge about the therapeutic properties of any substance used for healing (i.e., medicines). Maria's shop contains a wide array of these substances, from common herbs like aloe to exotic ingredients like powdered millipedes.

As Paula de Vos notes in her 2007 article "From Herbs to Alchemy" (full citation given below), the majority of medicines used by apothecaries in colonial Mexico were of plant origin, supplemented by some animal and mineral ingredients (De Vos 141-144). These substances were prepared as waters, syrups, ointments, and other formulations according to Galenic principles, which emphasized balancing the body's humors.

However, starting in the late 17th century, apothecaries began to incorporate chemical medicines and techniques into their practice. De Vos argues this was due to a resurgence of interest in medical alchemy in Spain after a period of suppression during the Counter-Reformation (De Vos 150). The adoption of chemical medicines in Mexico thus reflects the influence of long-standing alchemical traditions rather than a direct Paracelsian influence.

By the 18th century, Mexican apothecaries routinely stocked chemical medicines alongside traditional Galenic preparations. However, as De Vos points out, the incorporation of these remedies did not necessarily entail a rejection of the Galenic humoral system: "Practitioners of this tradition...effectively struck a compromise between chemical and Galenic medicine by marrying the recipes of the former with the explanations of the latter." (De Vos 152)
T
he medical practice depicted in this game thus represents a unique fusion of old and new - a Galenic framework increasingly inflected by the materials and methods of the chemical arts. Maria stands at the center of this transformation, her shop a microcosm of the diverse influences shaping colonial medicine.

![Medical practices in colonial Mexico](${primarySource3})
  *The title page of *Medicina Practica de Guadalupe* (see full citation in Further Reading below)*

## Female and Unlicensed Healers

The Inquisition, which sought to maintain both religious orthodoxy and social control, systematically targeted those who practiced healing outside the sanctioned medical guilds. The case of Isabel Hernández, as recounted by Estela Roselló Soberón in *Enfermar y curar: Historias cotidianas de cuerpos e identidades femeninas en la Nueva España*, offers a powerful lens through which we can explore the precarious position of female healers under colonial rule (Roselló Soberón, 2018, 93-94).

Hernández, a *partera* (midwife) and healer, was a well-known figure in her community for her ability to "amansar hombres" (literally, "to tame men")—an ambiguous charge that likely referred to her role in resolving domestic conflicts or using herbal remedies to influence male behavior (Roselló Soberón, 94). Her prominence, however, attracted the attention of local authorities and, eventually, the Inquisition. Accused of witchcraft and practicing unauthorized medicine, Hernández's belongings were seized, including a broken mirror, which became a symbol of the shattered lives of many women who, like her, found themselves at odds with both the Church and colonial law.

The inventory of her possessions reveals the mix of her domestic life and her practice as a healer: simple household items like an old bedspread and a few pots, alongside remedies such as powders and oils, hint at her dual role as caretaker and healer. These objects were put up for public auction after Hernández was imprisoned, a common practice in Inquisitorial cases. The sale of her belongings, conducted in front of the licenciado Antonio González Laso, underscores the material consequences of being prosecuted by the Inquisition, where even the most basic tools of a woman's trade could be stripped from her as part of her punishment (Roselló Soberón, 93).

Hernández's fate is a testament to how female healers, especially those working outside official institutions, faced criminalization not merely because they were women or because they healed, but because they embodied a complex threat to colonial order. The ambiguous charge of taming men suggests that Hernández's knowledge extended beyond traditional midwifery and into areas perceived as manipulative or supernatural, which heightened the suspicion surrounding her practice.

## The Real Maria de Lima

Maria de Lima is based on a real-life apothecary named Maria Coelho, who lived in 17th-century Coimbra, Portugal. Maria Coelho was part of a family of converso apothecaries, who were descendants of Sephardic Jews forced to convert to Christianity. 

Maria Coelho's Inquisition file still survives in the Portuguese national archives (AN/TT) in Lisbon. In it, an auto de entrega (warrant of delivery) states that on January 8, 1666, "in Coimbra at the gates of the prison of the Holy Inquisition, Pedro Rodrigues, solicitor of the Holy Office, delivered Maria Coelho, unmarried daughter of Felipe Coelho, apothecary, and Maria Pineta, natural and resident of Monte Mer o Velho, to the Alcayde of the said jails, Manuel Quaresma."

Maria's father, Filipe Coelho, was also an apothecary. The file reveals that Maria "lived for five years in the Village of Montemore o Velho in the house of Estevao Coelho, half new Christian, an apothecary, the unmarried son of another apothecary (Old Christian) whose name is forgotten, and Maria Pinto, New Christian." (Inquisition File, fol. 14). This indicates that the Coelho family was deeply involved in the apothecary profession, with multiple generations practicing the trade. The village named was on the outskirts of Coimbra, a medieval university town. 

Interestingly, a manuscript known as the "Pharmaca de Jozeph Coelho" was created by an apothecary *also* named Coelho who was *also* practicing in or near Coimbra. While it is not definitively known if Jozeph was an immediate family member of Maria, the shared last name and location strongly suggest that he was -- perhaps a brother or coursin. The "Pharmaca de Jozeph Coelho," filled with both medical knowledge and artistic doodles, provides a rare glimpse into the world of early modern apothecaries. The manuscript's drawings of a "Boticario" and "Botica[ria]" (male and female apothecaries) may even have been tribute to Maria by Jozeph, as this manuscript was created during the years when Maria was under arrest by the Inquisition. 

  ![A possible depiction of Maria and Jozeph Coelho from the Pharmaca de Jozeph Coelho](${primarySource4})
  *A possible depiction of Maria and Jozeph Coelho. Biblioteca Nacional de Portugal, BNP 2259, Pharmaca de Jozeph Coelho (1668), fol. 1r.  https://purl.pt/24899/1/index.html#/13/html* 

The Coelho family's converso status made them vulnerable to the scrutiny of the Inquisition. Maria's Inquisition file accuses the family of following "the Law of Moses," and participating in "Jewish ceremonies," and abstaining from eating "the flesh of pigs" (Processo de Maria Coelho, fol. 86). 

Maria Coelho herself was arrested by the Inquisition on January 2, 1666, on charges of judaísmo (retaining Jewish customs). After a lengthy trial lasting over three years, the Inquisition reached a decision on April 12, 1669, declaring Maria "convinced of the crime of heresy and apostasy, as she has become an apostate heretic from our holy Catholic faith" (Inquisition File, fol. 207). She was excommunicated, her goods were confiscated, and she was sentenced to exile in Brazil. Maria confessed on May 14, 1669, but her ultimate fate remains unknown.

The Pharmaca of Jozeph (or Joseph) Coelho can be [read in full here](https://purl.pt/24899/1/index.html#/13/html).

Maria's Inquisition file is available here: [Processo de Maria Coelho, Tribunal do Santo Ofício, Inquisição de Coimbra, proc. 352, AN/TT, Portugal, reference #PT/TT/TSO-IC/025/00352](http://digitarq.arquivos.pt/details?id=2349997).

## Further Reading

#### Primary Sources
- • João Curvo Semedo, *Observaçoens medicas doutrinaes de cem casos gravissimos* [Medical Observations of One Hundred Very Grave Cases] (Lisbon, 1707). [Link to text](https://archive.org/details/bub_gb_qCVH54Hs2i0C)
- • Juan de Esteyneffer, *Florilegia Medicinal* (Mexico, 1712). [Link to text](https://archive.org/details/b20389097)
- • Juan Santos, *Lauros panegiricos, aclamaciones reales, y festiuos aplausos* (1693). [Link to text](https://www.google.com/books/edition/Lauros_panegiricos_aclamaciones_reales_y/g5Ym-Af2uK0C?hl=en&gbpv=1)
- • Antonio de Solis, *Historia de la conquista de Mexico* (Madrid, 1684). [Link to text](https://www.google.com/books/edition/Historia_de_la_conquista_de_Mexico_pobla/kTKqrymXooIC?hl=en&gbpv=1&dq=Historia+de+la+conquista+de+Mexico+1684&printsec=frontcover)
- • Francisco Sanz de Dios y Guadalupe, *Medicina practica de Guadalupe* (1734). [Link to text](https://www.google.com/books/edition/Medicina_practica_de_Guadalupe/nLkNFq4qFaQC?gbpv=1)

#### Secondary Sources
- • Barrera-Osorio, Antonio, *Experiencing Nature: The Spanish American Empire and the Early Scientific Revolution* (Johns Hopkins University Press, 2006). [Link to text](https://www.google.com/books/edition/Experiencing_Nature/n2OMCgAAQBAJ?hl=en&gbpv=1&printsec=frontcover)
- • Bauer, Ralph, *The Alchemy of Conquest: Science, Religion, and the Secrets of the New World* (University of Virginia Press, 2019). [Link to text](https://www.google.com/books/edition/The_Alchemy_of_Conquest/GeKNDwAAQBAJ?hl=en&gbpv=1&printsec=frontcover)
- • Bleichmar, Daniela, *Visible Empire: Botanical Expeditions and Visual Culture in the Hispanic Enlightenment* (University of Chicago Press, 2012). [Link to text](https://www.google.com/books/edition/Visible_Empire/RmCFDtp11lAC?hl=en&gbpv=1&printsec=frontcover)
- • Breen, Benjamin, *The Age of Intoxication: Origins of the Global Drug Trade* (University of Pennsylvania Press, 2019)
- • Cagle, Hugh, *Assembling the Tropics: Science and Medicine in Portugal's Empire, 1450–1700* (Cambridge University Press, 2018)
- • Cook, Harold J., *Matters of Exchange: Commerce, Medicine, and Science in the Dutch Golden Age* (Yale University Press, 2007). [Link to text](https://www.google.com/books/edition/Matters_of_Exchange/aNBWudWBOsQC?hl=en&gbpv=1&printsec=frontcover)
- • Cooley, Mackenzie, *The Perfection of Nature: Animals, Breeding, and Race in the Renaissance* (University of Chicago Press, 2022)
- • Crawford, Matthew James, *The Andean Wonder Drug: Cinchona Bark and Imperial Science in the Spanish Atlantic* (University of Pittsburgh Press, 2016). [Link to text](https://www.google.com/books/edition/The_Andean_Wonder_Drug/HkwUDQAAQBAJ?hl=en&gbpv=1&printsec=frontcover)
- • De Vos, Paula, *Compound Remedies: Galenic Pharmacy in Colonial Mexico* (University of Pittsburgh Press, 2010). [Link to text](https://www.google.com/books/edition/Compound_Remedies/jv0LEAAAQBAJ?gbpv=1)
- • De Vos, Paula, "From Herbs to Alchemy: The Introduction of Chemical Medicine to Mexican Pharmacies in the Seventeenth and Eighteenth Centuries," *Journal of Spanish Cultural Studies* 8:2 (2007), 135-168. DOI: [10.1080/14636200701430984](https://doi.org/10.1080/14636200701430984)
- • Earle, Rebecca, *The Body of the Conquistador: Food, Race, and the Colonial Experience in Spanish America, 1492-1700* (Cambridge University Press, 2012)
- • Ferreira Furtado, Júnia, *Tropical Empiricism: Making Medical Knowledge in Colonial Brazil* (Cambridge University Press, 2016)
- • Gómez, Pablo F., *The Experiential Caribbean: Creating Knowledge and Healing in the Early Modern Atlantic* (University of North Carolina Press, 2017). [Link to text](https://www.google.com/books/edition/The_Experiential_Caribbean/AfMxDgAAQBAJ?hl=en&gbpv=1&printsec=frontcover)
- • Leong, Elaine, *Recipes and everyday knowledge: Medicine, science, and the household in early modern England.* (University of Chicago Press, 2019)
- • Leong, Elaine and Alisha Rankin, eds. *Secrets and knowledge in medicine and science, 1500–1800.* (Routledge, 2016)
- • Mundy, Barbara, *The Death of Aztec Tenochtitlan, the Life of Mexico City* (University of Texas Press, 2015)
- • Norton, Marcy, *Sacred Gifts, Profane Pleasures: A History of Tobacco and Chocolate in the Atlantic World* (Cornell University Press, 2008)
- • Pardo-Tomás, José, *Ciencia y censura: la Inquisición española y los libros científicos en los siglos XVI y XVII* (CSIC, 1991)
- • Pardo-Tomás, José, *El tesoro natural de América: Oviedo, Monardes, Hernández: colonialismo y ciencia en el siglo XVI* (Nivola, 2002)
- • Pimentel, Juan, *The Rhinoceros and the Megatherium: An Essay in Natural History* (Harvard University Press, 2017). [Link to text](https://www.google.com/books/edition/The_Rhinoceros_and_the_Megatherium/6uAZDgAAQBAJ?hl=en&gbpv=1&printsec=frontcover)
- • Portuondo, María M., *Secret Science: Spanish Cosmography and the New World* (University of Chicago Press, 2009)
- • Rankin, Alisha, *The Poison Trials: Wonder Drugs, Experiment, and the Battle for Authority in Renaissance Science* (University of Chicago Press, 2021)
- • Rodríguez Delgado, Adriana, "El goce del cuerpo. La impecabilidad entre los alumbrados de la Nueva España." In *Presencias y miradas del cuerpo en la Nueva España,* edited by Estela Roselló Soberón, 79-108. México: Universidad Nacional Autónoma de México Instituto de Investigaciones Históricas, 2011. [Link to text](http://www.historicas.unam.mx/publicaciones/publicadigital/libros/555/mira_das_cuerpo.html).    
- • Safier, Neil, *Measuring the New World: Enlightenment Science and South America* (University of Chicago Press, 2008)
- • Schiebinger, Londa, *Plants and Empire: Colonial Bioprospecting in the Atlantic World* (Harvard University Press, 2004)
- • Slater, John, Maríaluz López-Terrada, and José Pardo-Tomás, eds. *Medical Cultures of the Early Modern Spanish Empire.* (Routledge, 2014)
- • Smith, Pamela, *From Lived Experience to the Written Word: Reconstructing Practical Knowledge in the Early Modern World* (University of Chicago Press, 2022)
- • Smith, Pamela, *The business of alchemy: Science and culture in the Holy Roman Empire* (Princeton University Press, 2016)
- • Twinam, Ann, Purchasing Whiteness: Pardos, Mulattos, and the Quest for Social Mobility in the Spanish Indies (Stanford University Press, 2015)
- • Wear, Andrew, *Knowledge and Practice in English Medicine, 1550-1680* (Cambridge University Press, 2000)
`;

  return (
    <div className="content-guide-popup">
    <button onClick={toggleContentGuide} className="close-map-button">X</button>
      <div className="content-guide-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdownContent}
        </ReactMarkdown>
        <button className="close-content-guide-button" onClick={toggleContentGuide}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ContentGuide;