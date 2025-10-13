import React, { useState } from 'react';
import './Helper.css'; // Make sure you style it later

const Helper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('menu');

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setCurrentPage('menu'); // Reset to menu when closed
  };

  const handleSelectPage = (page) => {
    setCurrentPage(page);
  };

  const getPageContent = () => {
    switch (currentPage) {
      case 'menu':
        return (
          <div className="helper-menu">
            <h2>Help Topics</h2>
            <p>This game was created by Benjamin Breen, a professor of history at UCSC, in summer of 2024. For more information, see the About button.</p>
            <ul>
              <li onClick={() => handleSelectPage('navigation')}>1. Navigating in the Game World</li>
              <li onClick={() => handleSelectPage('commands')}>2. Commands and Goals</li>
              <li onClick={() => handleSelectPage('mixing')}>3. Mixing Medicines</li>
              <li onClick={() => handleSelectPage('prescribing')}>4. Prescribing to Patients</li>
              <li onClick={() => handleSelectPage('inventory')}>5. Your Inventory</li>
              <li onClick={() => handleSelectPage('gameWorld')}>6. Learning More About the Game World</li>
            </ul>
          </div>
        );
      case 'navigation':
        return (
          <div className="helper-content">
            <h3>Navigating in the Game World</h3>
            <p>To move through the game world, use the #map command or choose options from the menu. Key locations will appear on your map as you discover them. You can explore different areas by selecting them directly on the map. Be mindful of the time of day and Maria's energy levels while navigating!</p>
            <button className="back-button" onClick={() => handleSelectPage('menu')}>Back to Menu</button>
          </div>
        );
      case 'commands':
        return (
          <div className="helper-content">
            <h3>Commands and Goals</h3>
            <p>Key commands include:</p>
            <ul>
              <li><strong>#prescribe</strong> - Prescribe a remedy to your patient.</li>
              <li><strong>#symptoms</strong> - Ask a patient about their symptoms.</li>
              <li><strong>#diagnose</strong> - Diagnose a patient's illness based on their symptoms.</li>
              <li><strong>#forage</strong> - Search the surroundings for medicinal ingredients.</li>
              <li><strong>#sleep</strong> - Rest and regain Maria’s energy for the next day.</li>
              <li><strong>#map</strong> - View the map and navigate to different locations.</li>
            </ul>
            <p>Your goal is to keep Maria’s apothecary running, treat patients, and manage resources while evading trouble from the authorities and rival physicians!</p>
            <button className="back-button" onClick={() => handleSelectPage('menu')}>Back to Menu</button>
          </div>
        );
      case 'mixing':
        return (
          <div className="helper-content">
            <h3>Mixing Medicines</h3>
            <p>To mix medicines, you’ll use ingredients in your inventory. The mixing process involves selecting ingredients that complement each other, considering their humoral properties (e.g., hot, cold, wet, dry). Different patients may need different kinds of treatments, so pay attention to the symptoms they describe and mix accordingly.</p>
            <button className="back-button" onClick={() => handleSelectPage('menu')}>Back to Menu</button>
          </div>
        );
      case 'prescribing':
        return (
          <div className="helper-content">
            <h3>Prescribing to Patients</h3>
            <p>Once you’ve diagnosed a patient, use the #prescribe command to recommend a treatment. You can use ingredients in your inventory or suggest common treatments from the time period. Watch for how patients react—sometimes, their symptoms may improve or worsen based on your decisions.</p>
            <button className="back-button" onClick={() => handleSelectPage('menu')}>Back to Menu</button>
          </div>
        );
      case 'inventory':
        return (
          <div className="helper-content">
            <h3>Your Inventory</h3>
            <p>Your inventory holds the ingredients and compounds you collect. Check your inventory regularly to ensure you have the right ingredients for mixing medicines. You can also buy new ingredients from merchants or forage them during your travels.</p>
            <button className="back-button" onClick={() => handleSelectPage('menu')}>Back to Menu</button>
          </div>
        );
      case 'gameWorld':
        return (
          <div className="helper-content">
            <h3>Learning More About the Game World</h3>
            <p>The game is set in 17th-century Mexico City. Maria is a converso apothecary operating on the fringes of the law. The social dynamics of the time, the importance of religion, and the medicinal practices of the era play a big role in the game. Exploring different areas and interacting with NPCs will help you learn more about the historical context. Also check out the Content Guide button below.</p>
            <button className="back-button" onClick={() => handleSelectPage('menu')}>Back to Menu</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`helper-container ${isOpen ? 'open' : ''}`}>
      <div className="helper-button" onClick={handleToggle}>
        ?
      </div>
      {isOpen && (
        <div className="helper-panel">
          {getPageContent()}
        </div>
      )}
    </div>
  );
};

export default Helper;
