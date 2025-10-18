import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import apothecaryImage from '../../../assets/apothecary.jpeg';
import mariaCoelhoImage from '../../../assets/mariacoelho.jpeg';
import '../../../PortraitSection.css';
import { entityManager } from '../../../core/entities/EntityManager';
import { initialInventoryData } from '../../../initialInventory'; // Assuming you have this file as in `HistoryOutput`
import PDFPopup from '../../../shared/components/PDFPopup';  // Direct import since we're no longer lazy loading

function PortraitSection({ npcImage, npcCaption, npcInfo, pcCaption, portraitImage, isEmoji }) {
  const [showNpcPopup, setShowNpcPopup] = useState(false);
  const [showPcPopup, setShowPcPopup] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedPdfPath, setSelectedPdfPath] = useState('');
  const [selectedCitation, setSelectedCitation] = useState('');
  const [fadeClass, setFadeClass] = useState('fade-in');
  const [showSecretPopup, setShowSecretPopup] = useState(false);
  const [npcSecret, setNpcSecret] = useState(null);

  // Process text to include PDF links like in HistoryOutput
  const processTextWithPDFLinks = useMemo(() => {
    const allEntities = entityManager.getAll();
    const allItemsWithPdf = [
      ...allEntities.filter(entity => entity.pdf),
      ...initialInventoryData.filter(item => item.pdf)
    ];

    const pattern = new RegExp(`\\b(${allItemsWithPdf.map(item => item.name).join('|')})\\b`, 'gi');
    
    return (text) => {
      const mentionedItems = new Set();
      const processedText = text.replace(pattern, (match) => {
        const item = allItemsWithPdf.find(item => item.name.toLowerCase() === match.toLowerCase());
        if (item) {
          mentionedItems.add(item);
          return `[${match} 📄](/pdfs/${item.pdf} "${item.citation || ''}")`;
        }
        return match;
      });
      return processedText;
    };
  }, []);

  const handlePDFClick = useCallback((pdfPath, citation) => {
    setSelectedPdfPath(pdfPath);
    setSelectedCitation(citation);
    setIsPdfOpen(true);
  }, []);

  const closePDFPopup = () => {
    setIsPdfOpen(false);
    setSelectedPdfPath('');
    setSelectedCitation('');
  };

  // Handle showing the NPC secret
  const handleRevealSecret = (secret) => {
    setNpcSecret(secret);
    setShowSecretPopup(true);
  };

  const closeSecretPopup = () => {
    setShowSecretPopup(false);
    setNpcSecret(null);
  };

  const pcInfoContent = (
    <div>
      <h2 className="portrait-medieval-header">
        <span>NAME:</span> Maria de Lima<br/>
        <span>AGE:</span> 45<br/>
        <span>BIRTHPLACE:</span> Coimbra, Portugal
      </h2>
      <p><strong>Biography:</strong> Maria, a skilled apothecary, has been living in Mexico City for the past 10 years after she was charged with heresy and deported from Portugal by the Inquisition. Born into a <i>converso</i> family, she is well-versed in the hybrid of alchemical and Galenic medicine practiced in mid-seventeenth-century Iberia.</p>
      <p>Maria is based on the real-life historical figure of Maria Coelho, who had a similar background and life history but who disappears from the historical record following her deportation from Portugal by the Inquisition in 1669. She was last recorded as bound for Brazil. You can read more about the real-life Maria <a href="https://recipes.hypotheses.org/4710" target="_blank" rel="noopener noreferrer">here</a> and by clicking the Content Guide button.</p>
      <img src={mariaCoelhoImage} alt="Maria Coelho" style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );

  // Check if the NPC exists in EntityManager
  const getNpcFromEntityList = (npcName) => {
    return entityManager.getByName(npcName);
  };

  // Get NPC info or use generated captions/description
  const getNpcInfo = (npcName) => {
    const npc = getNpcFromEntityList(npcName);
    if (npc) {
      return (
        <div>
          <p><strong>Age:</strong> {npc.age}</p>
          <p><strong>Occupation:</strong> {npc.occupation}</p>
          <p><strong>Birthplace:</strong> {npc.birthplace}</p>
          <p><strong>Current Residence:</strong> {npc.currentResidence}</p>
          <p><strong>Description:</strong> {npc.description}</p>
          {npc.symptoms && (
            <div>
              <p><strong>Symptoms:</strong></p>
              <ul>
                {npc.symptoms.map((symptom, index) => (
                  <li key={index}>{symptom.name}: "{symptom.quote}"</li>
                ))}
              </ul>
            </div>
          )}
          {/* Add Reveal Secret Button if NPC has a secret */}
          {npc.secret && (
            <button onClick={() => handleRevealSecret(npc.secret)} className="reveal-secret-button">
              Reveal their secret
            </button>
          )}
        </div>
      );
    } else {
      // Fallback to using the caption or default NPC info
      return <p>{npcInfo || 'No additional information available.'}</p>;
    }
  };

  return (
    <div className="portrait-section">
      <div className="npc-portrait-container" onClick={() => setShowNpcPopup(true)}>
        <div className="npc-portrait-wrapper">
          {isEmoji ? (
            <div className={`emoji-image ${fadeClass}`}>
              {npcInfo} {/* Directly render emoji or text here */}
            </div>
          ) : (
            <img 
              src={npcImage}
              alt="NPC" 
              className={`npc-portrait-image ${fadeClass}`} 
              onError={(e) => {
                e.target.src = apothecaryImage;
              }}
            />
          )}
          <p className="portrait-caption">
            {npcCaption}
            {getNpcFromEntityList(npcCaption.split(',')[0])?.pdf && (
              <span 
                className="pdf-name" 
                onClick={() => handlePDFClick(getNpcFromEntityList(npcCaption.split(',')[0]).pdf, getNpcFromEntityList(npcCaption.split(',')[0]).citation)}
              >
                📄
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="pc-portrait-container" onClick={() => setShowPcPopup(true)}>
        <div>
          <img src={portraitImage} alt="Maria" className="pc-portrait-image" />
          <p className="portrait-caption">{pcCaption}</p>
        </div>
      </div>

      {showNpcPopup && (
        <div className="npc-portrait-popup">
          {isEmoji ? (
            <div className="emoji-image popup-portrait-image">
              {npcInfo} {/* Direct emoji render */}
            </div>
          ) : (
            <img src={npcImage} alt="NPC" className="popup-portrait-image" />
          )}
          <p><strong>{npcCaption.split(' ').slice(2).join(' ')}</strong></p>
          <div className="popup-info">{getNpcInfo(npcCaption.split(',')[0])}</div>
          <button onClick={() => setShowNpcPopup(false)} className="close-map-button">Close</button>
        </div>
      )}

      {showPcPopup && (
        <div className="pc-portrait-popup">
          <img src={portraitImage} alt="Maria" className="popup-portrait-image" />
          <p><strong>Maria de Lima</strong></p>
          <div className="popup-info">{pcInfoContent}</div>
          <button onClick={() => setShowPcPopup(false)} className="close-map-button">Close</button>
        </div>
      )}

      {isPdfOpen && (
        <PDFPopup
          isOpen={isPdfOpen}
          onClose={closePDFPopup}
          pdfPath={selectedPdfPath}
          citation={selectedCitation}
        />
      )}

      {showSecretPopup && (
        <div className="secret-popup">
          <div className="secret-popup-content">
            <p><strong>Secret:</strong> {npcSecret}</p>
            <button onClick={closeSecretPopup} className="close-secret-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortraitSection;
