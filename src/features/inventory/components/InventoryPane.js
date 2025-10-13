import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import PDFPopup from '../../../shared/components/PDFPopup'; // Import the PDFPopup component
import { useGameState } from '../../../core/state/gameState';

function InventoryItem({ item, index, getHumoralShorthand, onPDFClick, onItemClick }) {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'inventoryItem',
    item: () => ({ ...item }), // Use a function to return the latest item data
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [item]); // Add item as a dependency
  drag(ref);


  return (
    <li
      ref={ref}
      key={index}
      className={`bg-white/15 p-3 rounded-lg flex items-start relative border-2 border-ink-700 dark:border-ink-600 transition-all duration-100 cursor-grab mb-2.5 hover:-translate-y-0.5 hover:shadow-md ${isDragging ? 'opacity-100 scale-100 shadow-lg cursor-grabbing bg-ink-700' : ''}`}
      style={{ opacity: isDragging ? 1 : 1 }}
      onClick={() => onItemClick(item, index)} // Pass the clicked item and its index to show popup
    >
      {/* Emoji */}
      <div className="absolute top-1 left-1">
        <span className="text-6xl md:text-5xl" style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.9)' }}>{item.emoji}</span>
      </div>

      {/* Item Details */}
      <div className="ml-16 md:ml-12">
        <strong
          className="font-display text-xl md:text-base capitalize text-parchment-50 mb-1 pl-3 md:pl-2 inline-block"
          style={{
            fontWeight: item.pdf ? 'bold' : 'normal',
            textDecoration: item.pdf ? 'underline dotted' : 'none',
            cursor: item.pdf ? 'pointer' : 'default'
          }}
          onClick={item.pdf ? (e) => { e.stopPropagation(); onPDFClick(`/pdfs/${item.pdf}`, item.citation); } : undefined}
        >
          {item.name} {item.pdf && '📄'}
        </strong>

        {/* Meta Information */}
        <div className="flex flex-col mb-1 pl-3 md:pl-2">
          <div className="flex flex-col">
            <span className="text-[0.6rem] text-ink-400 dark:text-ink-500 uppercase tracking-wide mb-0.5 pl-1">QUANTITY:</span>
            <span className="font-display text-sm md:text-xs text-parchment-50">{item.quantity} drachms</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.6rem] text-ink-400 dark:text-ink-500 uppercase tracking-wide mb-0.5 pl-1">VALUE:</span>
            <span className="font-display text-sm md:text-xs text-parchment-50">{item.price} coins</span>
          </div>
        </div>

        {/* Description */}
        <p className="font-serif text-ink-200 dark:text-ink-300 text-base md:text-sm mt-1 mb-0">{item.description}</p>
      </div>

      {/* Humoral Circle */}
      <div className="absolute top-[110px] md:top-[90px] left-3.5 md:left-2.5 w-8 h-8 md:w-5 md:h-5 bg-purple-400/40 rounded-full flex items-center justify-center text-xs md:text-[0.5rem] text-white uppercase shadow-sm">
        {getHumoralShorthand(item.humoralQualities)}
      </div>
    </li>
  );
}

function InventoryPane({ isOpen, toggleInventory, isPrescribing, onPDFClick, inventory, refreshInventory }) {
  const { gameState } = useGameState();
  const currentInventory = inventory; 
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedPdfPath, setSelectedPdfPath] = useState('');
  const [selectedCitation, setSelectedCitation] = useState('');
  const [selectedItem, setSelectedItem] = useState(null); // Track selected item for popup
  const [selectedItemIndex, setSelectedItemIndex] = useState(null); // Track selected index for arrow key navigation

  const handlePDFClick = useCallback((pdfPath, citation) => {
    setSelectedPdfPath(pdfPath);
    setSelectedCitation(citation);
    setIsPdfOpen(true);
  }, []);

  const handleItemClick = useCallback((item, index) => {
    setSelectedItem(item); // Open the popup with the selected item
    setSelectedItemIndex(index); // Set the index of the selected item
  }, [setSelectedItem, setSelectedItemIndex]);

  const closeItemPopup = () => {
    setSelectedItem(null); // Close the item popup
    setSelectedItemIndex(null); // Reset the index when closing the popup
  };

  useEffect(() => {
  if (isOpen) {
    refreshInventory();
  }
}, [isOpen, refreshInventory]);

  // Add escape key listener to close inventory pane and arrow keys to navigate items
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        toggleInventory(); // Close the inventory pane when "Escape" is pressed
      }

      if (selectedItem !== null) {
        if (event.key === 'ArrowRight') {
          // Navigate to the next item
          const nextIndex = (selectedItemIndex + 1) % inventory.length;
          setSelectedItem(inventory[nextIndex]);
          setSelectedItemIndex(nextIndex);
        } else if (event.key === 'ArrowLeft') {
          // Navigate to the previous item
          const prevIndex = (selectedItemIndex - 1 + inventory.length) % inventory.length;
          setSelectedItem(inventory[prevIndex]);
          setSelectedItemIndex(prevIndex);
        }
      }
    };

    // Attach the event listener when the component mounts
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedItem, selectedItemIndex, inventory, toggleInventory]); // Re-run effect if `isOpen` or other dependencies change

  const getHumoralShorthand = (qualities) => {
    // Handle items without humoral qualities (like clothing, equipment)
    if (!qualities || typeof qualities !== 'string') {
      return '—'; // Return dash for non-medicinal items
    }
    return qualities.split('&').map(q => q.trim().charAt(0)).join(' ');
  };

  return (
    <>
      {/* Inventory Pane */}
      <div className={`fixed top-0 h-full w-[350px] md:w-[160px] bg-gradient-to-b from-ink-800 to-ink-900 dark:from-ink-900 dark:to-black border-l border-ink-500 dark:border-ink-600 shadow-elevation-4 z-10 p-5 md:p-1 text-parchment-50 overflow-y-auto custom-scrollbar transition-all duration-400 ease-in-out ${isOpen ? 'right-0' : '-right-[350px] md:-right-[200px]'}`}>

        {/* Close Button */}
        <button
          className="absolute top-5 right-5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-none px-5 py-2.5 rounded cursor-pointer transition-colors duration-300"
          style={{ boxShadow: '0px 0px 10px rgba(255, 0, 0, 0.6)' }}
          onClick={toggleInventory}
        >
          Close
        </button>

        {/* Header */}
        <h2 className="font-display text-3xl md:text-lg uppercase tracking-wide border-b-2 border-ink-500 dark:border-ink-600 pb-2.5 mb-5 md:mb-2 mt-16 md:mt-14 text-parchment-200 text-center">
          Inventory
        </h2>

        {/* Inventory List */}
        <ul className="list-none p-0 m-0">
          {inventory.map((item, index) => (
            <InventoryItem
              key={item.id || item.name} // Use a unique identifier
              item={item}
              index={index}
              getHumoralShorthand={getHumoralShorthand}
              onPDFClick={handlePDFClick}
              onItemClick={handleItemClick}
            />
          ))}
        </ul>
      </div>

      {/* PDF Popup */}
      {isPdfOpen && (
        <PDFPopup
          isOpen={isPdfOpen}
          onClose={() => setIsPdfOpen(false)}
          pdfPath={selectedPdfPath}
          citation={selectedCitation}
        />
      )}

      {/* Item Attribute Popup */}
      {selectedItem && (
        <div
          className="fixed inset-0 w-full h-full bg-black/70 dark:bg-black/80 flex justify-center items-center z-[1000]"
          onClick={closeItemPopup}
        >
          <div
            className="relative bg-gradient-to-br from-ink-700/95 to-ink-800/95 dark:from-ink-900/95 dark:to-black/95 p-8 rounded-xl shadow-elevation-4 max-w-3xl w-full text-parchment-100 text-left font-serif"
            style={{ fontSize: '1.3rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white border-none px-3 py-2 rounded cursor-pointer text-lg transition-colors duration-300"
              style={{ boxShadow: '0px 0px 10px rgba(255, 0, 0, 0.6)' }}
              onClick={closeItemPopup}
            >
              ×
            </button>

            {/* Item Header */}
            <h1 className="font-display text-3xl uppercase tracking-wider border-b-2 border-ink-500 dark:border-ink-600 pb-2.5 mb-5 text-parchment-200 text-center" style={{ textShadow: '0px 0px 10px rgba(255, 255, 255, 0.23)' }}>
              <span>{selectedItem.name}</span>
              <br />
              <span className="text-xl text-ink-400 dark:text-ink-500" style={{ textShadow: '0px 0px 6px rgba(255, 255, 255, 0.1)' }}>
                ({selectedItem.spanishName})
              </span>
            </h1>

            {/* Item Image */}
            {selectedItem.image && (
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="max-w-full h-[400px] rounded-lg mx-auto mb-4 mt-5 shadow-elevation-3"
              />
            )}

            {/* Latin Name */}
            <p className="text-3xl italic text-center mb-4 text-ink-300 dark:text-ink-400">
              {selectedItem.latinName}
            </p>

            {/* Item Details */}
            <p className="text-lg mb-2">
              <strong className="text-xl text-white">Price:</strong> {selectedItem.price} silver coins
            </p>
            <p className="text-lg mb-2">
              <strong className="text-xl text-white">Quantity:</strong> {selectedItem.quantity} drachms
            </p>
            <p className="text-lg mb-2">
              <strong className="text-xl text-white">Humoral Qualities:</strong> {selectedItem.humoralQualities}
            </p>
            <p className="text-lg mb-2">
              <strong className="text-xl text-white">Medicinal Effects:</strong> {selectedItem.medicinalEffects}
            </p>
            <p className="text-lg">{selectedItem.description}</p>
          </div>
        </div>
      )}
    </>
  );
}

export { InventoryPane, InventoryItem };
