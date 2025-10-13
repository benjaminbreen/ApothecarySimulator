import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../NotificationPopup.css';

const NotificationPopup = ({ popupData, onClose }) => {
  
  // Use `useEffect` to add and clean up the keydown event listener
  useEffect(() => {
    if (!popupData) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        onClose(); // Close the popup when "Escape" or "Enter" is pressed
      }
    };

    // Attach the event listener when the component mounts
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [popupData, onClose]); // Re-run effect if `popupData` or `onClose` changes

  // Return null if there's no popupData
  if (!popupData) return null;

  return (
    <div className="notification-popup">
      <div className="popup-content">
        {popupData.image && (
          <img src={popupData.image} alt="Notification" className="popup-image" />
        )}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {popupData.text}
        </ReactMarkdown>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default NotificationPopup;
