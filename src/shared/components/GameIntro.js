import React, { useState } from 'react';
import '../../GameIntro.css';
import mixButtonImage from '../../assets/mixbutton.jpg';
import remedies from '../../assets/remedies.jpg';

const GameIntro = ({ onClose }) => {
  const [hoverSection, setHoverSection] = useState(null); // State to track the hovered section
  const [showExtendedInstructions, setShowExtendedInstructions] = useState(false); // State to manage extended instructions page
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 }); // Track mouse position

  // Update hover position based on mouse movement
  const handleMouseMove = (e) => {
    setHoverPosition({
      x: e.pageX,
      y: e.pageY,
    });
  };

  // Toggle hover sections
  const toggleHover = (section) => {
    setHoverSection(section);
  };

  // Handle toggling between the main page and extended instructions
  const toggleExtendedInstructions = () => {
    setShowExtendedInstructions(!showExtendedInstructions);
  };

  if (showExtendedInstructions) {
    return (
      <div className="game-intro-popup">
        <div className="game-intro-content">
          <span className="close-icon" onClick={toggleExtendedInstructions}>&times;</span>
          <div className="content-wrapper">
            <h2 data-text>Extended Game Instructions</h2>
          <p>
            In this game, you’ll encounter complex situations that require both historical knowledge and critical decision-making. Each turn is generated based on the text command you input, so you’ll need to think strategically about your next move. Below are some additional instructions to guide your gameplay:
          </p>
          <ul>
            <li>
              <strong>Exploration Commands:</strong> Use commands like "go to the market", "visit the university", and "explore the cathedral" to move Maria to various locations within Mexico City. It's also possible to leave the city and travel long distances, but in order to succeed at this, you will need to input commands that are both historically accurate and grounded in reality (for instance, to book passage on a ship, you need to pay or, failing that, offer your services as an apothecary). 
            </li>
            <li>
              <strong>Mixing Medicines:</strong> You start with a randomized collection of ten ingredients. You can use the "Mix Drugs" button to experiment with <strong>four different methods</strong> of chemically recombinging ingredients to make new "compound drugs." These four methods are: Distillation, Decoction, Calcination, and Confection. You can also unlock a Sublimate method by successfully navigating an encounter with a traveling alchemist. These methods are grounded in the historical reality of 1680s alchemical medicine, and to mix a useful new drug, you need to study the sources included in the game (you can access PDFs of sources if a word or phrase has a 📄 next to it). Be mindful of humoral theory—each ingredient has properties that affect the balance of hot, cold, wet, and dry.
            </li>
            <li>
              <strong>Interactions:</strong> When encountering patients or NPCs, you can engage them in lengthy dialogues. Be careful: how you phrase questions can influence their willingness to help you, and your "bedside manner" will also shape how much patients decide to pay you for your services, as well as their own perception of whether your cures are effective.
            </li>
            <li>
              <strong>Patient Care:</strong> Use the symptoms described in the text and apply historical remedies based on real sources. Some treatments may be dangerous, so balance the risks and rewards.
            </li>
           <li> <strong>The Counter-Narrative button:</strong> Beneath the main "output box" which displays the AI's simulation of the turn, there is a button marked "View Counter-Narrative." This provides an on-demand, dynamically generated fact check of the preceding turn's events along with citations of relevent historians who have written on related topics. 
            </li>
          </ul>
 <div className="splash-button-container">
         <button className="instruction-button" onClick={toggleExtendedInstructions}>Back to Main</button>  <button className="start-button" onClick={onClose}>Start Playing</button>
          </div>
          </div>

        </div>
      </div>
    );
  }

 return (
    <div className="game-intro-popup" onMouseMove={handleMouseMove}>
      <div className="game-intro-content">
        <span className="close-icon" onClick={onClose}>&times;</span>
        <div className="content-wrapper">
        <h2 data-text="1680s APOTHECARY SIMULATOR">1680s APOTHECARY SIMULATOR</h2>


        <p>
          Step into the shoes of <strong>Maria de Lima</strong>, an apothecary living in 17th-century Mexico City who faces a moment of crisis due to her mounting debts. In this <span 
            className="hoverable-text" 
            onMouseEnter={() => toggleHover('historicalSimulation')}
            onMouseLeave={() => toggleHover(null)}
          >AI-enabled educational historical simulation game</span>, you’ll face the challenges of running an apothecary shop while navigating the complex social world of colonial Mexico.
        </p> 

        {hoverSection === 'historicalSimulation' && (
          <div className="hover-popup" style={{ top: hoverPosition.y + 20, left: hoverPosition.x - 100 }}>
            This game grew out of assignments developed by Benjamin Breen and his history classes at UC Santa Cruz in 2023-24. It is an experimental educational activity designed to take advantage of the distinctive features of LLMs (large language models) while also providing fact-checking and guardrails via real historical primary sources. Though fictionalized, it is deeply grounded in reality (for instance, both Maria and the patients she encounters are based on real people). The goal is to create a new kind of immersive learning experience which is also fun... hopefully!
          </div>
        )}

     
     <h3>Game Overview</h3>


     <p> Your primary goals as player are to <span
            className="hoverable-text"
            onMouseEnter={() => toggleHover('playerGoals')}
            onMouseLeave={() => toggleHover(null)}
          >successfully manage Maria’s apothecary</span> so as to pay off her debts (she owes 100 reales to a moneylender named Don Luis), avoid other sorts of trouble (beware any Inquisitor), and treat Maria's patients using historically appropriate remedies.  
</p>
<ul>
<figure className="image-container-left">
  <img src={remedies} alt="Mix Button" className="image-left" />
  <figcaption className="caption">Screenshot of your inventory</figcaption>
</figure>
  <li>

    <span
      className="hoverable-text"
      onMouseEnter={() => toggleHover('gameplayHow')}
      onMouseLeave={() => toggleHover(null)}
    >
      The gameplay is primarily text-based
    </span>, meaning you will input words, phrases, and sentences to explore the world, gather ingredients, and interact with characters. Think of it as an interactive book.
  </li>

  <li>You can save your game to your browser cache and return to it by clicking the <strong>Save Game button</strong> at the bottom of this page. You can click <strong>End Game</strong> to receive an automated assessment of how you did. This website collects no data about usage and does not track you in any way.</li>

  <li>This is designed to be a challenging and at times a frustrating game. Mixing and prescribing drugs effectively requires you to mobilize knowledge from the actual historical record.   <span 
              className="hoverable-text"
              onMouseEnter={() => toggleHover('choices')}
              onMouseLeave={() => toggleHover(null)}
            >Think carefully about your choices</span>.
          </li>

          {hoverSection === 'choices' && (
            <div className="hover-popup" style={{ top: hoverPosition.y + 20, left: hoverPosition.x - 100 }}>
              Your choices will directly influence the story’s outcomes. Some decisions might seem simple but could have far-reaching consequences. Read the clues carefully and consider the possible outcomes before taking action. It is possible to die and to kill in this game. You "win" simply by avoiding either. 
            </div>  )} 

  <li>
    You will also <span
      className="hoverable-text"
      onMouseEnter={() => toggleHover('moralDilemmas')}
      onMouseLeave={() => toggleHover(null)}
    >face moral dilemmas</span>—balancing Maria's economic survival with her desire to treat patients from all walks of life — while also navigating the <strong>risk of a cure becoming a poison</strong>...
  </li>
</ul>

{hoverSection === 'playerGoals' && (
  <div className="hover-popup" style={{ top: hoverPosition.y + 20, left: hoverPosition.x - 100 }}>
    As Maria, you'll need to balance running the apothecary as a business and your personal ethics. The game challenges you to treat a variety of patients from different social classes, making decisions that impact both your reputation and economic survival. If you choose to, you might even find a way to avoid your debts by mixing and prescribing drugs that <em>poison</em>, rather than <em>heal</em>...
  </div>
)}

{hoverSection === 'gameplayHow' && (
  <div className="hover-popup" style={{ top: hoverPosition.y + 20, left: hoverPosition.x - 100 }}>
    Use commands like <strong>"#buy"</strong>, <strong>"#diagnose"</strong>, <strong>"#prescribe"</strong>, or <strong>"#symptoms"</strong> to acquire items and interact with patients, but any command you can think of will work. For instance, to move through the game you can try everything from <strong>"go south"</strong> to <strong>"let's take a walk"</strong> to <strong>"travel to the northern frontier on a mule train"</strong> or even <strong>"book passage on a ship to Manila." </strong>
  </div>
)}

{hoverSection === 'moralDilemmas' && (
  <div className="hover-popup" style={{ top: hoverPosition.y + 20, left: hoverPosition.x - 100}}>
    As a converso in colonial Mexico, Maria is caught between economic pressures and her own ethics. Decisions must be made about who to treat, how to treat them, and when the risk of failure outweighs the reward of a cure.
  </div>
)}


        <h3>How to Play</h3>
        <ul>   <figure className="image-container-right">
    <img src={mixButtonImage} alt="Mix Button" className="image-right" />
    <figcaption className="caption">Screenshot of the input box and main game buttons</figcaption>
  </figure>
          <li>
            <strong>Dynamic text-based gameplay:</strong> You, as the player, type your next move into the <strong>input box </strong> and then click <strong>Submit</strong>. The simulation will dynamically create a new "turn" in response. </li>
      

         <li>

  <strong>Mixing medicines: </strong>    
   Collect ingredients and use alchemical and Galenic methods to create new drugs using the <strong>Mix Drugs Button</strong>. 
  The key to success is understanding humoral theory (hot, cold, wet, and dry) and reading real historical sources. 
  Carefully study your <strong>Inventory</strong> to learn more, and also consult the <strong>Content Guide</strong>. Your <strong>Journal</strong> automatically records all events via a specialized LLM agent. 

</li>

<li>
  <strong>Exploring the world: </strong> 
  Use the text-based commands to navigate to key locations like the <strong>the markets of Mexico City</strong> to buy ingredients, 
  <strong>the university</strong> to research old medical texts, or to the <strong>homes of patients</strong> to learn more about them. 
  You might also try traveling to other cities or distant lands.
</li>

<li>
  <strong>Learning more: </strong> 
  You can click on the portraits of both NPCs (at left) and Maria herself (at right) to learn more, as well as exploring the  
  <strong> Content Guide</strong> and the historical sources available at the <strong>Show All Sources</strong> button. 
  Some patients even have secrets that you can learn more about. 
  
</li>
        </ul>

        <h3>Ready to Begin?</h3>
        <p>
          Click the <strong>Start Playing</strong> button below to begin your journey through 17th-century Mexico City, or click <strong>More Instructions</strong> if you'd like additional guidance. Make wise decisions, experiment with remedies, and remember: history is not just a series of facts but a collection of lived experiences that shaped the world we know today.
        </p>
  </div>
        <div className="splash-button-container">
            <button className="start-button" onClick={onClose}>Start Playing!</button>
            <button className="instruction-button" onClick={toggleExtendedInstructions}>More Instructions</button>
        
        </div>
      </div>
    </div>
  );
};

export default GameIntro;
