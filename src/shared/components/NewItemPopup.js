// NewItemPopup.js
import React from 'react';


const NewItemPopup = ({ item, onClose }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content summary-popup" onClick={(e) => e.stopPropagation()}>
        <h2 className="summary-title">New Item Acquired</h2>
        <p>You have acquired a new item:</p>

        <h1 className="medieval-header">
          <span>{item.name || 'Unknown Item'}</span>
          <br />
          <span className="spanish-name">({item.spanishName || 'No Spanish name'})</span>
        </h1>

        <div className="item-emoji" style={{ fontSize: '4rem', textAlign: 'center' }}>
          {item.emoji || '🎁'}
        </div>

        <p style={{ fontSize: '1.4rem', fontStyle: 'italic', textAlign: 'center', marginBottom: '15px' }}>
          {item.latinName || 'No Latin name available'}
        </p>

        <p><strong>Humoral Qualities:</strong> {item.humoralQualities || 'Unknown'}</p>
        <p><strong>Medicinal Effects:</strong> {item.medicinalEffects || 'No known effects'}</p>
        <p>{item.description || 'No description available'}</p>

        <button onClick={onClose}>Continue</button>
      </div>
    </div>
  );
};

export default NewItemPopup;
