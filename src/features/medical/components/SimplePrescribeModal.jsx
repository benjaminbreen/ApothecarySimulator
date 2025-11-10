/**
 * SimplePrescribeModal - Modern Redesign
 *
 * Lightweight prescription modal for quick dispensing without full patient examination
 *
 * Design Features:
 * - Modern parchment aesthetic with dark mode support
 * - Responsive mobile-first layout
 * - Smooth animations and transitions
 * - Touch-friendly drag-and-drop
 * - Beautiful gradient backgrounds
 */

import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useGesture } from '../../../hooks/useGesture';
import { useDarkMode } from '../../../hooks/useDarkMode';
import imageMap from '../../../imageMap';

import oralImage from '../../../assets/oral.jpg';
import inhaledImage from '../../../assets/inhaled.jpg';
import topicalImage from '../../../assets/topical.jpg';
import enemaImage from '../../../assets/enema.jpg';

const routeImages = {
  Oral: oralImage,
  Inhaled: inhaledImage,
  Topical: topicalImage,
  Enema: enemaImage
};

function SimplePrescribeModal({
  isOpen,
  onClose,
  gameState = {},
  updateInventory,
  currentWealth,
  handleWealthChange,
  recipientName = 'them',
  onPrescribeComplete,
  toggleInventory
}) {
  const { inventory = [] } = gameState;
  const [selectedItem, setSelectedItem] = useState(null);
  const [amount, setAmount] = useState(1);
  const [price, setPrice] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Dark mode hook
  const { isDarkMode } = useDarkMode();

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
        // Update suggested price based on item's base price
        if (updatedItem.price) {
          setPrice(Math.round(updatedItem.price * amount * 1.5)); // 1.5x markup
        }
      }
    }
  }, [inventory, selectedItem, amount]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
      setAmount(1);
      setPrice(0);
      setSelectedRoute('');
      setIsClosing(false);
    }
  }, [isOpen]);

  // Update price when amount changes
  useEffect(() => {
    if (selectedItem && selectedItem.price) {
      setPrice(Math.round(selectedItem.price * amount * 1.5));
    }
  }, [amount, selectedItem]);

  // Drop zone for inventory items (including custom compounds)
  const [{ isOver }, drop] = useDrop({
    accept: ['INVENTORY_ITEM', 'inventoryItem', 'compoundItem'],
    drop: (item) => {
      setSelectedItem(item);
      setAmount(1);
      if (item.price) {
        setPrice(Math.round(item.price * 1.5));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (toggleInventory) {
        toggleInventory(false);
      }
      onClose();
    }, 200); // Match animation duration
  };

  const handlePrescribe = () => {
    if (!selectedItem || !selectedRoute) {
      return;
    }

    const itemInInventory = inventory.find(
      i => i.name.toLowerCase() === selectedItem.name.toLowerCase()
    );

    if (!itemInInventory || itemInInventory.quantity < amount) {
      return;
    }

    setIsLoading(true);

    // Remove item from inventory
    updateInventory(selectedItem.name, -amount);

    // Add money to wealth
    if (price > 0) {
      handleWealthChange(price);
    }

    // Call completion handler with prescription details
    if (onPrescribeComplete) {
      onPrescribeComplete({
        item: selectedItem,
        amount,
        price,
        route: selectedRoute,
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

  const canDispense = selectedItem && selectedRoute && !isLoading;

  // Check if we have insufficient quantity
  // Note: Use the selectedItem's quantity directly if inventory lookup fails (for freshly mixed compounds)
  const inventoryItem = selectedItem ? inventory.find(i => i.name.toLowerCase() === selectedItem.name.toLowerCase()) : null;
  const availableQuantity = inventoryItem?.quantity ?? selectedItem?.quantity ?? 0;
  const insufficientQuantity = selectedItem && availableQuantity < amount;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-stone-900/40 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      >
        {/* Modal Container - Responsive */}
        <div
          className={`relative w-full max-w-full sm:max-w-2xl bg-gradient-to-br rounded-lg sm:rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)'
              : 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 50%, #faf8f3 100%)',
            boxShadow: isDarkMode
              ? '0 12px 48px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(251, 191, 36, 0.1)'
              : '0 8px 40px rgba(92, 74, 58, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
            maxHeight: '90vh'
          }}
          onClick={(e) => e.stopPropagation()}
          ref={gestureRef}
        >
          {/* Subtle Border Accent */}
          <div
            className="absolute inset-0 pointer-events-none rounded-lg sm:rounded-xl"
            style={{
              border: isDarkMode
                ? '1px solid rgba(251, 191, 36, 0.2)'
                : '1px solid rgba(139, 92, 46, 0.15)'
            }}
          />

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div
              className="sticky top-0 z-10 px-4 sm:px-6 py-4 border-b flex items-center justify-between transition-colors duration-300"
              style={{
                background: isDarkMode
                  ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
                  : 'linear-gradient(to bottom, rgba(245, 238, 223, 0.95), rgba(250, 248, 243, 0.9))',
                borderColor: isDarkMode
                  ? 'rgba(251, 191, 36, 0.15)'
                  : 'rgba(139, 92, 46, 0.15)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div>
                <h2 className={`text-xl sm:text-2xl font-serif font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-amber-50' : 'text-stone-800'
                }`}>
                  Quick Prescription
                </h2>
                <p className={`text-sm mt-0.5 transition-colors duration-300 ${
                  isDarkMode ? 'text-amber-200/60' : 'text-stone-600'
                }`}>
                  Dispense to {recipientName}
                </p>
              </div>
              <button
                onClick={handleClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isDarkMode
                    ? 'hover:bg-amber-500/20 text-amber-200/70 hover:text-amber-100'
                    : 'hover:bg-stone-200/60 text-stone-500 hover:text-stone-700'
                }`}
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 py-6 space-y-6">
              {/* Drop Zone for Medicine */}
              <div>
                <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                  isDarkMode ? 'text-amber-100' : 'text-stone-700'
                }`}>
                  Medicine
                </label>
                <div
                  ref={drop}
                  className={`relative rounded-xl p-6 border-2 border-dashed transition-all duration-300 ${
                    isOver
                      ? (isDarkMode ? 'bg-amber-500/10 border-amber-500/50' : 'bg-amber-50 border-amber-400')
                      : (isDarkMode ? 'bg-slate-800/30 border-slate-600/30' : 'bg-white/50 border-stone-300')
                  }`}
                  style={{
                    minHeight: '140px',
                    boxShadow: isOver
                      ? (isDarkMode ? '0 0 20px rgba(251, 191, 36, 0.15)' : '0 0 20px rgba(251, 191, 36, 0.1)')
                      : 'none'
                  }}
                >
                  {selectedItem ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className={`w-20 h-20 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                        isDarkMode ? 'bg-slate-700/50' : 'bg-stone-100'
                      }`}>
                        <img
                          src={getItemImage(selectedItem)}
                          alt={selectedItem.name}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className={`font-semibold text-base sm:text-lg transition-colors duration-300 ${
                          isDarkMode ? 'text-amber-50' : 'text-stone-800'
                        }`}>
                          {selectedItem.name}
                        </p>
                        <p className={`text-sm mt-1 transition-colors duration-300 ${
                          isDarkMode ? 'text-slate-400' : 'text-stone-500'
                        }`}>
                          Available: {maxAmount} {maxAmount === 1 ? 'unit' : 'units'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-6">
                      <svg className={`w-12 h-12 mb-3 transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-600' : 'text-stone-300'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-400' : 'text-stone-500'
                      }`}>
                        Drag a medicine from inventory
                      </p>
                      <p className={`text-xs mt-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-500' : 'text-stone-400'
                      }`}>
                        Or select from the left sidebar
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Route Selection */}
              {selectedItem && (
                <div className="animate-fade-in">
                  <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-amber-100' : 'text-stone-700'
                  }`}>
                    Route of Administration
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(routeImages).map(([route, image]) => (
                      <button
                        key={route}
                        onClick={() => setSelectedRoute(route)}
                        className={`group relative p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedRoute === route
                            ? (isDarkMode
                                ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
                                : 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/20')
                            : (isDarkMode
                                ? 'bg-slate-800/30 border-slate-600/30 hover:border-amber-500/50 hover:bg-amber-500/10'
                                : 'bg-white/50 border-stone-300 hover:border-emerald-400 hover:bg-emerald-50/50')
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                            selectedRoute === route
                              ? (isDarkMode ? 'bg-amber-500/20' : 'bg-emerald-100')
                              : (isDarkMode ? 'bg-slate-700/50' : 'bg-stone-100')
                          }`}>
                            <img
                              src={image}
                              alt={route}
                              className="w-6 h-6 object-contain"
                            />
                          </div>
                          <span className={`font-semibold text-sm sm:text-base transition-colors duration-200 ${
                            selectedRoute === route
                              ? (isDarkMode ? 'text-amber-100' : 'text-emerald-700')
                              : (isDarkMode ? 'text-slate-300' : 'text-stone-600')
                          }`}>
                            {route}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount & Price Row */}
              {selectedItem && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  {/* Amount */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-amber-100' : 'text-stone-700'
                    }`}>
                      Amount
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={maxAmount}
                      value={amount}
                      onChange={(e) => setAmount(Math.min(maxAmount, Math.max(1, parseInt(e.target.value) || 1)))}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? 'bg-slate-800/50 border-slate-600/30 text-amber-50 focus:ring-amber-500/50 focus:border-amber-500'
                          : 'bg-white border-stone-300 text-stone-800 focus:ring-emerald-500/50 focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-amber-100' : 'text-stone-700'
                    }`}>
                      Price (reales)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? 'bg-slate-800/50 border-slate-600/30 text-amber-50 focus:ring-amber-500/50 focus:border-amber-500'
                          : 'bg-white border-stone-300 text-stone-800 focus:ring-emerald-500/50 focus:border-emerald-500'
                      }`}
                      placeholder="Enter price..."
                    />
                    {selectedItem.price && (
                      <p className={`text-xs mt-1.5 transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-400' : 'text-stone-500'
                      }`}>
                        Base cost: {selectedItem.price} × {amount} = {selectedItem.price * amount} reales
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Summary Card */}
              {selectedItem && selectedRoute && (
                <div
                  className={`rounded-xl p-4 border transition-all duration-300 animate-fade-in ${
                    isDarkMode
                      ? 'bg-slate-800/40 border-amber-500/20'
                      : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-300' : 'text-stone-600'
                      }`}>
                        Dispensing:
                      </span>
                      <span className={`font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-amber-100' : 'text-stone-800'
                      }`}>
                        {amount}× {selectedItem.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-300' : 'text-stone-600'
                      }`}>
                        Route:
                      </span>
                      <span className={`font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-amber-100' : 'text-stone-800'
                      }`}>
                        {selectedRoute}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-300' : 'text-stone-600'
                      }`}>
                        Recipient:
                      </span>
                      <span className={`font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-amber-100' : 'text-stone-800'
                      }`}>
                        {recipientName}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center pt-2 border-t ${
                      isDarkMode ? 'border-amber-500/20' : 'border-emerald-200'
                    }`}>
                      <span className={`text-sm font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-amber-200' : 'text-emerald-700'
                      }`}>
                        Total Price:
                      </span>
                      <span className={`text-lg font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-amber-100' : 'text-emerald-700'
                      }`}>
                        {price} reales
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Warning */}
              {insufficientQuantity && (
                <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/30 animate-fade-in">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Insufficient quantity available
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div
              className={`sticky bottom-0 px-4 sm:px-6 py-4 border-t flex gap-3 transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-slate-900/95 border-amber-500/15'
                  : 'bg-parchment-50/95 border-stone-200'
              }`}
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <button
                onClick={handleClose}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600/30'
                    : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
              >
                Cancel
              </button>
              <button
                onClick={handlePrescribe}
                disabled={!canDispense || insufficientQuantity}
                className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all duration-200 ${
                  canDispense && !insufficientQuantity
                    ? (isDarkMode
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30')
                    : (isDarkMode
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed')
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Dispensing...
                  </span>
                ) : (
                  'Dispense Medicine'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default SimplePrescribeModal;
