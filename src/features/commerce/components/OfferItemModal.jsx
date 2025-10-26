// OfferItemModal.jsx
// Modal for offering items from inventory to NPCs (as gift or for sale)
import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useGesture } from '../../../hooks/useGesture';
import imageMap from '../../../imageMap';
import '../../../PrescribePopup.css'; // Reuse existing modal styles

function OfferItemModal({
  isOpen,
  onClose,
  gameState = {},
  updateInventory,
  currentWealth,
  handleWealthChange,
  recipientName = 'them',
  onOfferComplete,
  toggleInventory
}) {
  const { inventory = [] } = gameState;
  const [selectedItem, setSelectedItem] = useState(null);
  const [amount, setAmount] = useState(1);
  const [price, setPrice] = useState(0);
  const [isGift, setIsGift] = useState(true); // Default to gift
  const [isLoading, setIsLoading] = useState(false);

  // Swipe-to-close gesture support
  const gestureRef = useGesture({
    onSwipeDown: () => {
      if (!isLoading) {
        handleClose();
      }
    },
    minSwipeDistance: 80,
    enableHaptics: true
  });

  // Automatically open inventory when modal opens
  useEffect(() => {
    if (isOpen && toggleInventory) {
      toggleInventory(true);
    }
  }, [isOpen, toggleInventory]);

  // Update selected item when inventory changes
  useEffect(() => {
    if (selectedItem) {
      const updatedItem = inventory.find(
        i => i.name.toLowerCase() === selectedItem.name.toLowerCase()
      );
      if (updatedItem) {
        setSelectedItem(updatedItem);
        // Set suggested price based on item's base price
        if (!isGift && updatedItem.price) {
          setPrice(Math.round(updatedItem.price * amount));
        }
      }
    }
  }, [inventory, selectedItem, amount, isGift]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
      setAmount(1);
      setPrice(0);
      setIsGift(true);
    }
  }, [isOpen]);

  // Update price when amount or gift toggle changes
  useEffect(() => {
    if (selectedItem && !isGift && selectedItem.price) {
      setPrice(Math.round(selectedItem.price * amount));
    } else if (isGift) {
      setPrice(0);
    }
  }, [amount, isGift, selectedItem]);

  // Drop zone for inventory items
  const [{ isOver }, drop] = useDrop({
    accept: 'INVENTORY_ITEM',
    drop: (item) => {
      setSelectedItem(item);
      setAmount(1);
      if (!isGift && item.price) {
        setPrice(item.price);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const handleClose = () => {
    if (toggleInventory) {
      toggleInventory(false);
    }
    onClose();
  };

  const handleOfferItem = () => {
    if (!selectedItem) return;

    const itemInInventory = inventory.find(
      i => i.name.toLowerCase() === selectedItem.name.toLowerCase()
    );

    if (!itemInInventory || itemInInventory.quantity < amount) {
      alert(`You don't have enough ${selectedItem.name}!`);
      return;
    }

    setIsLoading(true);

    // Remove item from inventory
    updateInventory(selectedItem.name, -amount);

    // If selling, add money to wealth
    if (!isGift && price > 0) {
      handleWealthChange(price);
    }

    // Call completion handler with offer details
    if (onOfferComplete) {
      onOfferComplete({
        item: selectedItem,
        amount,
        price,
        isGift,
        recipientName
      });
    }

    setIsLoading(false);
    handleClose();
  };

  const normalizeImageKey = (key) => {
    return key?.toLowerCase().replace(/[_\s]+/g, '') || '';
  };

  const getItemImage = (item) => {
    if (!item) return null;
    const normalizedKey = normalizeImageKey(item.name);
    return imageMap[normalizedKey] || imageMap.defaultitem;
  };

  if (!isOpen) return null;

  const maxAmount = selectedItem
    ? inventory.find(i => i.name.toLowerCase() === selectedItem.name.toLowerCase())?.quantity || 1
    : 1;

  return (
    <div className="prescribe-popup-overlay" onClick={handleClose}>
      <div
        className="prescribe-popup"
        onClick={(e) => e.stopPropagation()}
        ref={gestureRef}
      >
        {/* Header */}
        <div className="popup-header">
          <h2 className="popup-title">Offer Item to {recipientName}</h2>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Drop Zone */}
        <div
          ref={drop}
          className={`drop-zone ${isOver ? 'drop-zone-active' : ''}`}
          style={{
            border: '2px dashed #8B7355',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '16px',
            backgroundColor: isOver ? 'rgba(139, 115, 85, 0.1)' : 'transparent',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {selectedItem ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img
                src={getItemImage(selectedItem)}
                alt={selectedItem.name}
                style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '8px' }}
              />
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selectedItem.name}</span>
              <span style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                Available: {maxAmount}
              </span>
            </div>
          ) : (
            <p style={{ color: '#8B7355', fontSize: '14px' }}>
              Drag an item from your inventory here
            </p>
          )}
        </div>

        {/* Amount Selector */}
        {selectedItem && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Amount:
            </label>
            <input
              type="number"
              min="1"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(Math.min(maxAmount, Math.max(1, parseInt(e.target.value) || 1)))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
        )}

        {/* Gift vs Sale Toggle */}
        {selectedItem && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => setIsGift(true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #8B7355',
                  borderRadius: '6px',
                  backgroundColor: isGift ? '#8B7355' : 'white',
                  color: isGift ? 'white' : '#8B7355',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🎁 Gift
              </button>
              <button
                onClick={() => setIsGift(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #8B7355',
                  borderRadius: '6px',
                  backgroundColor: !isGift ? '#8B7355' : 'white',
                  color: !isGift ? 'white' : '#8B7355',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                💰 Sale
              </button>
            </div>

            {/* Price Input (only shown when Sale is selected) */}
            {!isGift && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Price (reales):
                </label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                  placeholder="Enter price..."
                />
                {selectedItem.price && (
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Suggested: {Math.round(selectedItem.price * amount)} reales
                    (base: {selectedItem.price} per unit)
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {selectedItem && (
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px'
            }}
          >
            <p style={{ margin: '4px 0' }}>
              <strong>You will offer:</strong> {amount}× {selectedItem.name}
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>To:</strong> {recipientName}
            </p>
            {isGift ? (
              <p style={{ margin: '4px 0', color: '#2d7a2d' }}>
                <strong>As a gift</strong> (no charge)
              </p>
            ) : (
              <p style={{ margin: '4px 0', color: '#8B7355' }}>
                <strong>For sale:</strong> {price} reales
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleOfferItem}
            disabled={!selectedItem || isLoading}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: selectedItem ? '#4a7c59' : '#ccc',
              color: 'white',
              cursor: selectedItem ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Offering...' : isGift ? 'Give Gift' : 'Make Offer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OfferItemModal;
