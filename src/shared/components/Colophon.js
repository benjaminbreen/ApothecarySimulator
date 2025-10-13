import React, { useEffect } from 'react';
import './ContentGuide.css'; // Reusing the same CSS

const Colophon = ({ isOpen, toggleColophon }) => {

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (e.target.className === 'content-guide-popup') {
        toggleColophon();
      }
    };

    // Add event listener to close colophon when clicking outside of the content box
    document.addEventListener('mousedown', handleOutsideClick);

    // Clean up event listener when component is unmounted or isOpen changes
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, toggleColophon]);

  if (!isOpen) return null;

  return (
    <div className="content-guide-popup">
      <div className="content-guide-content">
        <h1>Colophon</h1>
        <p>
          This game was created by <a href="https://benjaminpbreen.com"> Benjamin Breen </a> in 2024 using React.js, with most of the code produced by GPT-4o and images mostly by DALLE-3. I am a beginning coder and recognize that it's currently not optimized at all and full of bugs - bear with me! 
          <br /><br />
          The purpose of this project is to create a historically immersive simulation, allowing users to explore the life and practices of a 17th-century apothecary in Mexico City, while also inviting them to question where the simulation breaks down - try the "Counter-Narrative" button to get automatic fact-checking and historical references, for instance.

        </p>
        <h2>Methodology</h2>
        <p>

          - The "engines" of the game are the language models GPT-4o-mini and GPT-4o, which have been fed detailed prompts with historical information and primary sources relevent to the setting. Different instances or agents based on these models are called via API to generate both the main hsitorical simulation and to generate the counter-narrative, the journal entries, and to power the logic behind the drug mixing and prescribing components.
          <br /><br />  
          - This is a very early draft of both the user interface, the game engine, and the content underlying the simulation. My goal is to develop this into not only the best apothecary simulator ever, but to also make it the jumping-off point for dozens of other educational simulation games built on the same underlying model.
          <br /><br />
           Please contact me [bebreen at ucsc dot edu] if you are interested in collaborating. 
        </p>


        <h2>About me</h2>
        <p>
          I am a historian and writer focused on the history of science, medicine, technology, and globalization and an associate professor at UC Santa Cruz. This application is an outgrowth of an ongoing collaboration with Pranav Anand and Zac Zimmer at UCSC. 
        </p>
        <button className="close-content-guide-button" onClick={toggleColophon}>Close</button>
      </div>
    </div>
  );
};

export default Colophon;
