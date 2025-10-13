/**
 * ContractOfferModal - Handles medical treatment contracts and item sales
 *
 * Features:
 * - Treatment contracts with negotiation
 * - Sale contracts with pricing
 * - LLM-powered negotiation responses
 */

import React, { useState } from 'react';
import { entityManager } from '../core/entities/EntityManager';
import { createChatCompletion } from '../core/services/llmService';

function ContractOfferModal({
  offer,
  isOpen,
  onClose,
  onAcceptTreatment,
  onAcceptSale,
  onDecline,
  onNegotiate,
  inventory = [],
  theme = 'light',
  scenarioId = '1680-mexico-city'
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [proposedPrice, setProposedPrice] = useState(0);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [counterOffer, setCounterOffer] = useState('');
  const [negotiationResponse, setNegotiationResponse] = useState(null);
  const [isProcessingNegotiation, setIsProcessingNegotiation] = useState(false);

  if (!isOpen || !offer) return null;

  const isDark = theme === 'dark';
  const isTreatment = offer.type === 'treatment';
  const isSale = offer.type === 'sale';

  // Handle treatment contract acceptance
  const handleAcceptTreatment = () => {
    // Find or create the patient entity
    let patientEntity = entityManager.getByName(offer.patientName);

    if (!patientEntity) {
      // Create patient entity if it doesn't exist
      patientEntity = {
        id: `patient_${offer.patientName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        name: offer.patientName,
        entityType: 'patient',
        type: 'patient',
        description: offer.patientDescription || 'Patient requiring treatment',
        symptoms: extractSymptoms(offer.patientDescription),
        social: {
          class: 'unknown',
          casta: 'unknown'
        },
        appearance: {
          gender: 'unknown',
          age: 'adult'
        },
        metadata: {
          representedBy: offer.offeredBy,
          paymentAgreed: offer.paymentOffered
        }
      };

      // Register with EntityManager
      patientEntity = entityManager.register(patientEntity);
      console.log('[ContractModal] Created patient entity:', patientEntity.name);
    }

    onAcceptTreatment(patientEntity, offer.paymentOffered);
    onClose();
  };

  // Handle sale contract - propose item and price
  const handleProposeSale = () => {
    if (!selectedItem || proposedPrice <= 0) {
      return; // Need both item and price
    }

    onAcceptSale(selectedItem, proposedPrice, offer.offeredBy);
    onClose();
  };

  // Handle negotiation submission
  const handleNegotiationSubmit = async () => {
    if (!counterOffer.trim()) return;

    setIsProcessingNegotiation(true);

    try {
      // Call LLM to negotiate
      const negotiationPrompt = `You are ${offer.offeredBy} negotiating with Maria de Lima, an apothecary in 1680 Mexico City.

**Your Original Offer:**
${isTreatment ? `Treatment for ${offer.patientName}: ${offer.paymentOffered} reales` : `Purchase ${offer.itemRequested}: ${offer.paymentOffered} reales`}

**Your Character:**
${offer.offeredByDescription}

**Maria's Counter-Offer:**
"${counterOffer}"

**Your Task:** Respond to Maria's counter-offer as ${offer.offeredBy}. You must decide:
1. **ACCEPT** - If the counter-offer is reasonable and fair
2. **COUNTER** - If you want to negotiate further (provide a specific new offer)
3. **REJECT** - If the counter-offer is unreasonable or insulting

**Response Format (JSON):**
\`\`\`json
{
  "decision": "accept|counter|reject",
  "response": "Your spoken response as ${offer.offeredBy} (1-2 sentences, in character)",
  "newOffer": {
    "paymentOffered": 0
  }
}
\`\`\`

**Guidelines:**
- Consider the social context (elite vs common folk)
- Consider the urgency of the situation
- Be realistic about colonial Mexican economics
- Stay in character
- If you ACCEPT, say so clearly
- If you COUNTER, provide a specific new amount
- If you REJECT, explain why briefly`;

      const messages = [
        { role: 'system', content: negotiationPrompt },
        { role: 'user', content: counterOffer }
      ];

      const response = await createChatCompletion(
        messages,
        0.7, // Higher temperature for personality
        500,
        { type: 'json_object' }
      );

      const result = JSON.parse(response.choices[0].message.content);
      setNegotiationResponse(result);

      // If accepted, automatically proceed
      if (result.decision === 'accept') {
        setTimeout(() => {
          if (isTreatment) {
            handleAcceptTreatment();
          } else {
            handleProposeSale();
          }
        }, 2000);
      }

      // If countered, update the offer
      if (result.decision === 'counter' && result.newOffer) {
        offer.paymentOffered = result.newOffer.paymentOffered;
      }

    } catch (error) {
      console.error('[Negotiation] Error:', error);
      setNegotiationResponse({
        decision: 'reject',
        response: `${offer.offeredBy} seems confused and withdraws the offer.`
      });
    } finally {
      setIsProcessingNegotiation(false);
    }
  };

  // Extract symptoms from patient description
  const extractSymptoms = (description) => {
    if (!description) return [];

    const symptoms = [];
    const text = description.toLowerCase();

    // Common symptom patterns
    if (text.includes('fever')) symptoms.push({ name: 'Fever', location: 'body', severity: 'moderate' });
    if (text.includes('cough')) symptoms.push({ name: 'Cough', location: 'chest', severity: 'moderate' });
    if (text.includes('pain') || text.includes('griping')) symptoms.push({ name: 'Pain', location: 'stomach', severity: 'moderate' });
    if (text.includes('weak')) symptoms.push({ name: 'Weakness', location: 'body', severity: 'moderate' });
    if (text.includes('diarrhea') || text.includes('evacuation')) symptoms.push({ name: 'Diarrhea', location: 'stomach', severity: 'moderate' });

    return symptoms;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: isDark
          ? 'rgba(0, 0, 0, 0.7)'
          : 'rgba(0, 0, 0, 0.3)'
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: isDark ? '#1e293b' : '#ffffff',
          border: isDark ? '1px solid #334155' : '1px solid #e5e7eb'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b"
          style={{
            borderColor: isDark ? '#334155' : '#e5e7eb',
            background: isDark ? '#0f172a' : '#fafaf9'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: isDark ? '#334155' : '#f5f5f4',
                color: isDark ? '#f1f5f9' : '#44403c'
              }}
            >
              {isTreatment ? '📜' : '💰'}
            </div>
            <div>
              <h2
                className="text-xl font-semibold"
                style={{
                  color: isDark ? '#f1f5f9' : '#1c1917',
                  fontFamily: 'Cormorant Garamond, serif'
                }}
              >
                {isTreatment ? 'Treatment Contract' : 'Sale Proposal'}
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: isDark ? '#94a3b8' : '#78716c' }}
              >
                {offer.offeredBy}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Negotiation Response (if active) */}
          {negotiationResponse && (
            <div
              className="p-4 rounded-lg border"
              style={{
                background: negotiationResponse.decision === 'accept'
                  ? isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'
                  : negotiationResponse.decision === 'reject'
                  ? isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'
                  : isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                borderColor: negotiationResponse.decision === 'accept'
                  ? isDark ? '#22c55e' : '#86efac'
                  : negotiationResponse.decision === 'reject'
                  ? isDark ? '#ef4444' : '#fca5a5'
                  : isDark ? '#3b82f6' : '#93c5fd'
              }}
            >
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: isDark ? '#f1f5f9' : '#1c1917' }}
              >
                {offer.offeredBy}'s Response:
              </p>
              <p
                className="text-sm italic"
                style={{ color: isDark ? '#cbd5e1' : '#44403c' }}
              >
                "{negotiationResponse.response}"
              </p>
              {negotiationResponse.decision === 'counter' && negotiationResponse.newOffer && (
                <p
                  className="text-sm font-semibold mt-2"
                  style={{ color: isDark ? '#60a5fa' : '#2563eb' }}
                >
                  New Offer: {negotiationResponse.newOffer.paymentOffered} reales
                </p>
              )}
            </div>
          )}

          {/* Treatment Details */}
          {isTreatment && !isNegotiating && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-xs font-medium mb-1 uppercase tracking-wide"
                  style={{ color: isDark ? '#94a3b8' : '#78716c' }}
                >
                  Patient
                </label>
                <p
                  className="text-base font-semibold"
                  style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                >
                  {offer.patientName}
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: isDark ? '#cbd5e1' : '#57534e' }}
                >
                  {offer.patientDescription}
                </p>
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-1 uppercase tracking-wide"
                  style={{ color: isDark ? '#94a3b8' : '#78716c' }}
                >
                  Payment
                </label>
                <p
                  className="text-3xl font-bold"
                  style={{ color: isDark ? '#10b981' : '#059669' }}
                >
                  {offer.paymentOffered} <span className="text-base font-normal opacity-70">reales</span>
                </p>
              </div>
            </div>
          )}

          {/* Negotiation Mode */}
          {isNegotiating && (
            <div className="space-y-3">
              <label
                className="block text-xs font-medium uppercase tracking-wide"
                style={{ color: isDark ? '#94a3b8' : '#78716c' }}
              >
                Your Counter-Offer
              </label>
              <textarea
                value={counterOffer}
                onChange={(e) => setCounterOffer(e.target.value)}
                placeholder="Propose different terms... (e.g., 'I require 25 reales for such urgent work')"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border resize-none text-sm"
                style={{
                  background: isDark ? '#0f172a' : '#fafaf9',
                  borderColor: isDark ? '#334155' : '#e7e5e4',
                  color: isDark ? '#f1f5f9' : '#1c1917'
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleNegotiationSubmit}
                  disabled={!counterOffer.trim() || isProcessingNegotiation}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
                  style={{
                    background: isDark ? '#3b82f6' : '#2563eb',
                    color: '#ffffff'
                  }}
                >
                  {isProcessingNegotiation ? 'Negotiating...' : 'Submit Offer'}
                </button>
                <button
                  onClick={() => {
                    setIsNegotiating(false);
                    setCounterOffer('');
                    setNegotiationResponse(null);
                  }}
                  className="px-4 py-2.5 rounded-lg font-medium text-sm"
                  style={{
                    background: isDark ? '#1e293b' : '#f5f5f4',
                    color: isDark ? '#cbd5e1' : '#44403c'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Sale Details */}
          {isSale && !isNegotiating && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-xs font-medium mb-2 uppercase tracking-wide"
                  style={{ color: isDark ? '#94a3b8' : '#78716c' }}
                >
                  Item Requested
                </label>
                <p
                  className="text-base"
                  style={{ color: isDark ? '#e2e8f0' : '#1c1917' }}
                >
                  {offer.itemRequested}
                </p>
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-2 uppercase tracking-wide"
                  style={{ color: isDark ? '#94a3b8' : '#78716c' }}
                >
                  Select Item
                </label>
                <select
                  value={selectedItem?.name || ''}
                  onChange={(e) => {
                    const item = inventory.find(i => i.name === e.target.value);
                    setSelectedItem(item);
                    setProposedPrice(item?.price || 0);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm"
                  style={{
                    background: isDark ? '#0f172a' : '#fafaf9',
                    borderColor: isDark ? '#334155' : '#e7e5e4',
                    color: isDark ? '#e2e8f0' : '#1c1917'
                  }}
                >
                  <option value="">Choose from inventory...</option>
                  {inventory.map((item, idx) => (
                    <option key={idx} value={item.name}>
                      {item.name} ({item.quantity} available)
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem && (
                <div>
                  <label
                    className="block text-xs font-medium mb-2 uppercase tracking-wide"
                    style={{ color: isDark ? '#94a3b8' : '#78716c' }}
                  >
                    Your Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm"
                    style={{
                      background: isDark ? '#0f172a' : '#fafaf9',
                      borderColor: isDark ? '#334155' : '#e7e5e4',
                      color: isDark ? '#e2e8f0' : '#1c1917'
                    }}
                  />
                  <p
                    className="text-xs mt-1.5"
                    style={{ color: isDark ? '#94a3b8' : '#78716c' }}
                  >
                    Base price: {selectedItem.price} reales
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isNegotiating && (
          <div
            className="px-6 py-4 border-t flex gap-2"
            style={{
              borderColor: isDark ? '#334155' : '#e5e7eb',
              background: isDark ? '#0f172a' : '#fafaf9'
            }}
          >
            {isTreatment && (
              <>
                <button
                  onClick={handleAcceptTreatment}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
                  style={{
                    background: isDark ? '#059669' : '#10b981',
                    color: '#ffffff'
                  }}
                >
                  Accept
                </button>
                <button
                  onClick={() => setIsNegotiating(true)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm"
                  style={{
                    background: isDark ? '#1e293b' : '#f5f5f4',
                    color: isDark ? '#cbd5e1' : '#44403c',
                    border: isDark ? '1px solid #334155' : '1px solid #e7e5e4'
                  }}
                >
                  Negotiate
                </button>
                <button
                  onClick={() => { onDecline(); onClose(); }}
                  className="px-4 py-2.5 rounded-lg font-medium text-sm"
                  style={{
                    background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                    color: isDark ? '#f87171' : '#dc2626',
                    border: isDark ? '1px solid #991b1b' : '1px solid #fca5a5'
                  }}
                >
                  Decline
                </button>
              </>
            )}

            {isSale && (
              <>
                <button
                  onClick={handleProposeSale}
                  disabled={!selectedItem || proposedPrice <= 0}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isDark ? '#d97706' : '#f59e0b',
                    color: '#ffffff'
                  }}
                >
                  Propose
                </button>
                <button
                  onClick={() => { onDecline(); onClose(); }}
                  className="px-4 py-2.5 rounded-lg font-medium text-sm"
                  style={{
                    background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                    color: isDark ? '#f87171' : '#dc2626',
                    border: isDark ? '1px solid #991b1b' : '1px solid #fca5a5'
                  }}
                >
                  Decline
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContractOfferModal;
