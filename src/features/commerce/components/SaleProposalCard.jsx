// SaleProposalCard.jsx
// Appears after player crafts a remedy in mixing workshop
// Allows completing sale to waiting customer

import React, { useState } from 'react';

export default function SaleProposalCard({
  saleContext,
  onCompleteSale,
  onAbandonSale,
  isDark = false
}) {
  if (!saleContext) return null;

  const {
    customerName,
    customerDescription,
    patientName,
    ailmentDescription,
    paymentOffered,
    craftedItem, // The remedy player just created
    npcPortrait
  } = saleContext;

  // State for custom price editing
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [customPrice, setCustomPrice] = useState(paymentOffered || 0);

  const handlePriceClick = () => {
    setIsEditingPrice(true);
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setCustomPrice(Math.max(0, value)); // Prevent negative prices
  };

  const handlePriceBlur = () => {
    setIsEditingPrice(false);
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditingPrice(false);
    }
  };

  const handleCompleteSale = () => {
    // Pass the custom price along with the sale context
    onCompleteSale({ ...saleContext, finalPrice: customPrice });
  };

  return (
    <div
      className="rounded-xl overflow-hidden shadow-2xl mb-4 animate-slide-in-right"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(55, 48, 163, 0.85) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 211, 77, 0.85) 100%)',
        backdropFilter: 'blur(12px)',
        border: isDark ? '2px solid rgba(245, 158, 11, 0.3)' : '2px solid rgba(245, 158, 11, 0.4)'
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
          borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.3)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <h3
                className="text-xl font-bold"
                style={{ color: isDark ? '#fbbf24' : '#d97706' }}
              >
                Sale Ready
              </h3>
              <p
                className="text-sm"
                style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
              >
                Complete the transaction
              </p>
            </div>
          </div>
          {isEditingPrice ? (
            <input
              type="number"
              value={customPrice}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              onKeyDown={handlePriceKeyDown}
              autoFocus
              className="text-2xl font-bold px-4 py-2 rounded-lg w-32 text-center"
              style={{
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.25)',
                color: isDark ? '#fbbf24' : '#d97706',
                border: '2px solid ' + (isDark ? '#f59e0b' : '#d97706')
              }}
            />
          ) : (
            <div
              onClick={handlePriceClick}
              className="text-2xl font-bold px-4 py-2 rounded-lg cursor-pointer hover:scale-105 transition-transform"
              style={{
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                color: isDark ? '#fbbf24' : '#d97706',
                border: '2px dashed ' + (isDark ? 'rgba(245, 158, 11, 0.5)' : 'rgba(245, 158, 11, 0.4)')
              }}
              title="Click to edit price"
            >
              {customPrice} reales ✏️
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex gap-4">
          {/* Portrait */}
          {npcPortrait && (
            <div className="flex-shrink-0">
              <img
                src={npcPortrait}
                alt={customerName}
                className="w-24 h-24 rounded-lg object-cover shadow-md"
                style={{
                  border: isDark
                    ? '2px solid rgba(245, 158, 11, 0.3)'
                    : '2px solid rgba(245, 158, 11, 0.4)'
                }}
              />
            </div>
          )}

          {/* Details */}
          <div className="flex-1 space-y-3">
            {/* Customer */}
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-wide mb-1"
                style={{ color: isDark ? 'rgba(245, 158, 11, 0.8)' : 'rgba(217, 119, 6, 0.8)' }}
              >
                Customer
              </p>
              <p
                className="font-bold text-lg"
                style={{ color: isDark ? '#fff' : '#1f2937' }}
              >
                {customerName}
              </p>
              {customerDescription && (
                <p
                  className="text-sm"
                  style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
                >
                  {customerDescription}
                </p>
              )}
            </div>

            {/* Crafted Item */}
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)'
              }}
            >
              <p
                className="text-sm font-semibold uppercase tracking-wide mb-1"
                style={{ color: isDark ? 'rgba(245, 158, 11, 0.8)' : 'rgba(217, 119, 6, 0.8)' }}
              >
                Remedy Prepared
              </p>
              <p
                className="font-bold"
                style={{ color: isDark ? '#fbbf24' : '#d97706' }}
              >
                {craftedItem?.name || 'Custom Compound'}
              </p>
              {craftedItem?.ingredients && (
                <p
                  className="text-xs mt-1"
                  style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)' }}
                >
                  Ingredients: {craftedItem.ingredients.join(', ')}
                </p>
              )}
            </div>

            {/* Request Summary */}
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-wide mb-1"
                style={{ color: isDark ? 'rgba(245, 158, 11, 0.8)' : 'rgba(217, 119, 6, 0.8)' }}
              >
                For Treatment Of
              </p>
              <p
                className="text-sm"
                style={{ color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)' }}
              >
                <strong>{patientName || 'Patient'}</strong>: {ailmentDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCompleteSale}
            className="flex-1 px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
            }}
          >
            Complete Sale for {customPrice} reales
          </button>
          <button
            onClick={onAbandonSale}
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
              color: isDark ? '#fca5a5' : '#dc2626',
              border: isDark ? '2px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            Abandon Sale
          </button>
        </div>
      </div>
    </div>
  );
}
