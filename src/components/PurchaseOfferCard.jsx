/**
 * PurchaseOfferCard.jsx
 *
 * Simple card that prompts user to open TradeModal when vendor offers goods
 * Delegates to TradeModal for actual item display and purchase logic
 */

import React from 'react';

/**
 * PurchaseOfferCard Component
 *
 * @param {Object} props
 * @param {Object} props.offer - Purchase offer data from StateAgent
 * @param {string} props.offer.npcName - Vendor's name
 * @param {string} props.offer.npcPortrait - Vendor's portrait filename
 * @param {string} props.offer.context - Brief context about what they're offering
 * @param {Function} props.onViewItems - Callback to open TradeModal
 * @param {Function} props.onDecline - Callback when user declines offer
 */
export function PurchaseOfferCard({ offer, onViewItems, onDecline }) {
  if (!offer) {
    return null;
  }

  const { npcName, npcPortrait, context } = offer;

  return (
    <div style={{
      margin: '16px auto',
      maxWidth: '600px',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 250, 247, 0.9) 100%)',
      border: '2px solid rgba(180, 175, 165, 0.5)',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      {/* Header with NPC info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid rgba(180, 175, 165, 0.3)',
        gap: '12px'
      }}>
        {npcPortrait && (
          <img
            src={`/portraits/${npcPortrait}`}
            alt={npcName}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(180, 175, 165, 0.5)'
            }}
            onError={(e) => {
              e.target.src = '/portraits/defaultnpc.jpg';
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            {npcName}
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            Offering Goods for Sale
          </p>
        </div>
      </div>

      {/* Context */}
      {context && (
        <div style={{
          padding: '16px',
          fontSize: '14px',
          color: '#374151',
          lineHeight: '1.6',
          borderBottom: '1px solid rgba(180, 175, 165, 0.3)'
        }}>
          {context}
        </div>
      )}

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '16px'
      }}>
        <button
          onClick={onViewItems}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
        >
          View Items
        </button>
        <button
          onClick={onDecline}
          style={{
            padding: '12px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
        >
          Not Interested
        </button>
      </div>
    </div>
  );
}
