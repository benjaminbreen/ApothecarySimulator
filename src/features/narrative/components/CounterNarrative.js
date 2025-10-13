import React, { useState, useEffect } from 'react';
import LoadingIndicator from '../../../shared/components/LoadingIndicator';
import ReactMarkdown from 'react-markdown';
import '../../../CounterNarrative.css';
import EntityList from '../../../EntityList';
import { createChatCompletion } from '../../../core/services/llmService';

const CounterNarrative = ({ historyOutput, handleIncorporate, currentPatient }) => {
    const [leftNarrative, setLeftNarrative] = useState(null); // Default to Subjective POV
    const [rightPaneContent, setRightPaneContent] = useState(''); // Renamed to avoid conflict
    const [leftContent, setLeftContent] = useState('');
const [isLeftLoading, setIsLeftLoading] = useState(false);
const [isRightLoading, setIsRightLoading] = useState(false);


const fetchNarrative = async (narrativeType, setContent, setLoading) => {
    setLoading(true); // Set specific loading state
    try {
        let systemPrompt;

            if (narrativeType === 'Historian Critique') {
                systemPrompt = `
                    As a professional historian, critically and succinctly analyze the output of this historical simulation of an apothecary named Maria and her life and work in the year 1680 in Mexico City, identifying the 2-3 biggest historical inaccuracies or anachronisms, in NO MORE THAN TWO PARAGRAPHS. Be plainspoken. Never pedantic, and cite at least 5-6 real scholars who can provide further information - put their names in bold. Potential authors/works to cite when appropriate: Paula De Vos, Compound Remedies: Galenic Pharmacy in Colonial Mexico (2010)
Pablo F. Gómez, The Experiential Caribbean: Creating Knowledge and Healing in the Early Modern Atlantic (2017)
Londa Schiebinger, Plants and Empire: Colonial Bioprospecting in the Atlantic World (2004)
Antonio Barrera-Osorio, Experiencing Nature: The Spanish American Empire and the Early Scientific Revolution (2006)
Matthew James Crawford, The Andean Wonder Drug: Cinchona Bark and Imperial Science in the Spanish Atlantic (2016)
Andrew Wear, Knowledge and Practice in English Medicine, 1550-1680 (2000)
Harold J. Cook, Matters of Exchange: Commerce, Medicine, and Science in the Dutch Golden Age (2007)
Ralph Bauer, The Alchemy of Conquest: Science, Religion, and the Secrets of the New World (2019)
Daniela Bleichmar, Visible Empire: Botanical Expeditions and Visual Culture in the Hispanic Enlightenment (2012)
Mackenzie Cooley, The Perfection of Nature: Animals, Breeding, and Race in the Renaissance (2022), 
Rebecca Earle, The Body of the Conquistador: Food, Race, and the Colonial Experience in Spanish America, 1492-1700 (2012), 
Barbara Mundy, The Death of Aztec Tenochtitlan, the Life of Mexico City (2015), 
Neil Safier, Measuring the New World: Enlightenment Science and South America (2008), 
José Pardo-Tomás, Ciencia y censura: la Inquisición española y los libros científicos en los siglos XVI y XVII (1991)
José Pardo-Tomás, El tesoro natural de América: Oviedo, Monardes, Hernández: colonialismo y ciencia en el siglo XVI (2002)
Juan Pimentel, The Rhinoceros and the Megatherium: An Essay in Natural History (2017),
 José Pardo-Tomás, Science and Empire in the Atlantic World (2017); 
 María M. Portuondo, Secret Science: Spanish Cosmography and the New World (2009); 
 Marcy Norton, Sacred Gifts, Profane Pleasures: A History of Tobacco and Chocolate in the Atlantic World (2008); 
 Karen Ordahl Kupperman, Indians and English: Facing Off in Early America (2000); 
 Júnia Ferreira Furtado, Tropical Empiricism: Making Medical Knowledge in Colonial Brazil (2016); 
 Ann Twinam, Purchasing Whiteness: Pardos, Mulattos, and the Quest for Social Mobility in the Spanish Indies (2015); 
 John Slater, Medicine and Empire: Learned Medicine and Colonial Knowledge in the Spanish Empire (2011)
                `;
       } else if (narrativeType === 'Maria\'s Subjective POV') {
    systemPrompt = `
        From the perspective of Maria, a skilled apothecary in 1680s Mexico City, write a succinct, raw, honest narrative reflecting her thoughts and perceptions during this encounter. Use first-person perspective and incorporate extreme historical accuracy and subjective POV. Limit to two paragraphs. Do not use complex words or expressions. Keep it simple and honest.
    `;
} else if (narrativeType === 'João\'s POV') {
    systemPrompt = `
        From the perspective of João, Maria's cat who was born on the streets, reflecting his true to life cat thoughts and emotions during the encounter. João's subjectivity resembles that of animal characters in CHARLOTTE'S WEB or Aesop tales - he thinks like an animal but has some awareness of human society. Three sentences max, fragmentary, animal-like.  Do not use complex words or expressions. Keep it simple and honest.
    `;
} else if (narrativeType === 'Subaltern POV') {
    systemPrompt = `
        Pick another character in this world who may not be represented in historical narratives and who relates in some way to the action. Be creative about it (for instance, it could be the POV of a person who grew a given materia media mentioned in the turn on a different continent). Highlight their unique perspective, which might be absent from official records, and how they view the events happening around them. Limit to one paragraph. It should be from their particular POV and should be realistic - imagine a true to life, historically authentic situation that is plausible, i.e. it shouldn't be someone in the room who the other characters aren't aware of. Think SEA OF POPPIES by Amitav Ghosh. The POV here should NEVER be that of Maria de Lima, the Portuguese converso apothecary who is the main playable character of the game, but someone orthogonal to the narrative.  Do not use complex words or expressions. Keep it simple and honest.  
    `;
} else {
    // Fallback: Write from the POV of a character in the current scenario
    systemPrompt = `
        From the perspective of a character involved in the current scenario described in the history agent output, write a subjective, stream-of-consciousness narrative reflecting their thoughts and emotions during the encounter. Use first-person perspective and incorporate the context and events provided in the output. Limit three sentences.
    `;
}

const response = await createChatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: historyOutput },
        ], 1.0, 1000);

            setContent(response.choices[0].message.content);
        } catch (error) {
            console.error('Error fetching data:', error);
            setContent(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

useEffect(() => {
    fetchNarrative('Historian Critique', setRightPaneContent, setIsRightLoading);
}, []);

useEffect(() => {
    if (leftNarrative !== null) { // Only fetch if a valid selection is made
        fetchNarrative(leftNarrative, setLeftContent, setIsLeftLoading);
    }
}, [leftNarrative]);

    const handleIncorporateClick = () => {
        handleIncorporate(rightPaneContent); // Use the updated state variable
    };

    return (
        <div className="counter-narrative-container">
            <div className="pane left-pane critique-agent-container">
               <div className="dropdown-container">
   <select onChange={(e) => setLeftNarrative(e.target.value)} defaultValue="">
       <option value="" disabled>Select a counter-narrative</option>
       <option value="Maria's Subjective POV">Maria's Subjective POV</option>
       <option value="João's POV">João's POV</option>
       <option value="Subaltern POV">Subaltern POV</option>
   </select>
</div>

                <div className={`output-box ${isLeftLoading ? 'loading' : ''}`}>
                    {isLeftLoading ? (
                        <LoadingIndicator />
                    ) : (
                        <ReactMarkdown>{leftContent || 'Please select a subjective point of view.'}</ReactMarkdown>
                    )}
                </div>
            </div>

            <div className="pane right-pane critique-agent-container">
                <div className="header">Critique by a Skeptical Historian</div> 
                
                {/* Add "Incorporate" Button */}
                <div className="incorporate-button-container" style={{ textAlign: 'right', marginBottom: '10px' }}>
                    <button onClick={handleIncorporateClick} className="incorporate-button">
                        Incorporate
                    </button>
                </div>

                <div className={`output-box ${isRightLoading ? 'loading' : ''}`}>
                   {isRightLoading ? (
                       <LoadingIndicator />
                   ) : (
                       <ReactMarkdown>{rightPaneContent || 'Loading...'}</ReactMarkdown>
                   )}
                </div>
            </div>
        </div>
    );
};

export default CounterNarrative;
