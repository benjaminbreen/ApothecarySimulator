import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Import the GFM plugin for markdown
import '../../PDFPopup.css';


const PDFPopup = ({ isOpen, onClose, pdfPath, citation }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Prevent body scrolling and ensure proper positioning when popup is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      // Clean up event listeners and reset styles when popup closes
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'visible';  // Reset overflow when popup is closed
      document.body.style.position = 'static';   // Reset position when popup is closed
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;




  return (
    <div className="pdf-popup-overlay" onClick={onClose}>
      <div className="pdf-popup-content" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={pdfPath}
          width="70%"
          height="80vh"
          title="PDF Viewer"
          frameBorder="0"
        />
        <button className="close-popup" onClick={onClose}>
          Close
        </button>
        <div className="citation">
        <h3>Citation:</h3>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {citation}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default PDFPopup;
