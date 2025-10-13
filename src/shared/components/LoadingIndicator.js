import React, { useState, useEffect } from 'react';
import wheelImage from '../../assets/wheel.png';

const phrases = [
  "...simulating the events of the following turn...",
  "...historical details being finalized...",
  "...envisioning what comes next...",
  "...preparing the next turn...",
  "...loading the next scene...",
  "...reconstructing the events of the era...",
   "...aligning the stars of fate...",
  "...consulting the oracle of time...",
  "...tuning the orchestra of history...",
  "...sketching the outlines of future paths...",
   "...restoring the patina of authenticity...",
    "...adjusting the focal length of hindsight...",
  "...preparing the canvas...",
 "The universe is a sort of book, whose first page one has read when one has seen only one’s own country. — Fougeret de Monbron, 1753",
 "Aún aprendo. [I am still learning]' - Francisco Goya, 1826",
 "Errare humanum est, sed perseverare diabolicum. [To err is human, but to persist in error is diabolical] — Seneca, c. 65 CE",
 "Quien no ha visto Sevilla, no ha visto maravilla. [He who has not seen Seville, has not seen a marvel.] — Juan de Mal Lara, 1568",
 "Il mondo è un teatro, e la vita una commedia. [The world is a stage, and life is a comedy.] — Pietro Aretino, 1534",
"Homo homini lupus. [Man is wolf to man] — Thomas Hobbes, 1642",
"Esse est percipi. [To be is to be perceived.] — George Berkeley, 1710",
"La naturaleza es un libro. [Nature is a book.] — Leonardo da Vinci, 1510",
"Omnia venena sunt, nec sine veneno quicquam existit. [All things are poison, and nothing is without poison.] — Paracelsus 1538",
"Tempus edax rerum... [Time, the devourer of all things...] — Ovid, c. 8 CE",
"The art of medicine consists of amusing the patient while nature cures the disease. — Voltaire, 1746",
"Nothing is so painful to the human mind as a great and sudden change. — Mary Shelley, 1818",
"In Nature’s infinite book of secrecy, a little I can read. - Margaret Cavendish, 1666", 
"Though the brain be the house of reason, yet it is not its birthplace. — Margaret Cavendish, 1664",


];

function LoadingIndicator() {
  const [fadeOutPhrase, setFadeOutPhrase] = useState(false);
  const [fadeContainer, setFadeContainer] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');

  const [fadeInPhrase, setFadeInPhrase] = useState(false);

  useEffect(() => {
    const phraseIndex = Math.floor(Math.random() * phrases.length);
    setCurrentPhrase(phrases[phraseIndex]);

    const startFadeInTimeout = setTimeout(() => {
      setFadeInPhrase(true);  // Start fade-in
    }, 1000);  // Fade in the phrase after 1 second

    const startFadeOutTimeout = setTimeout(() => {
      setFadeOutPhrase(true);  // Start fade-out animation
    }, 6000);  // Start fading out after 5 seconds

    const fadeContainerTimeout = setTimeout(() => {
      setFadeContainer(true);  // Trigger container fade-to-white
    }, 8000);  // Fade the entire container after 8 seconds

    return () => {
      clearTimeout(startFadeInTimeout);
      clearTimeout(startFadeOutTimeout);
      clearTimeout(fadeContainerTimeout);
    };
  }, []);

  return (
    <div className={`loading-container ${fadeContainer ? 'fade-to-white' : ''}`}>
      {/* Rotating wheel image */}
      <img src={wheelImage} alt="Loading Wheel" className="wheel-image" />

      {/* Phrase with fade-in effect */}
      <div className={`loading-phrase ${fadeOutPhrase ? 'fade-out' : ''}`}>
        {currentPhrase}
      </div>
    </div>
  );
}

export default LoadingIndicator;
