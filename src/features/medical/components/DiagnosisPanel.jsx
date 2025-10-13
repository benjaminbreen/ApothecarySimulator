/**
 * DiagnosisPanel - Clinical diagnosis interface with evidence collection
 * Parchment/glassomorphic aesthetic matching prescription panel
 * Supports drag-drop symptoms from body diagram and manual text entry
 */

import React, { useState } from 'react';
import { useDrop } from 'react-dnd';

export function DiagnosisPanel({ patient, onBack, onSubmitDiagnosis }) {
  const [evidenceCards, setEvidenceCards] = useState([
    { id: 1, content: '', type: 'empty' },
    { id: 2, content: '', type: 'empty' },
    { id: 3, content: '', type: 'empty' }
  ]);
  const [diagnosis, setDiagnosis] = useState('');
  const [nextId, setNextId] = useState(4);

  const handleAddCard = () => {
    setEvidenceCards([...evidenceCards, { id: nextId, content: '', type: 'empty' }]);
    setNextId(nextId + 1);
  };

  const handleRemoveCard = (id) => {
    setEvidenceCards(evidenceCards.filter(card => card.id !== id));
  };

  const handleUpdateCard = (id, content) => {
    setEvidenceCards(evidenceCards.map(card =>
      card.id === id ? { ...card, content, type: 'manual' } : card
    ));
  };

  const handleDropSymptom = (cardId, symptom) => {
    setEvidenceCards(evidenceCards.map(card =>
      card.id === cardId
        ? {
            ...card,
            content: symptom,
            type: 'symptom'
          }
        : card
    ));
  };

  const handleSubmit = () => {
    if (!diagnosis.trim()) {
      alert('Please enter a diagnosis before submitting.');
      return;
    }

    const evidence = evidenceCards
      .filter(card => card.content)
      .map(card => {
        if (card.type === 'symptom') {
          return `• ${card.content.name} (${card.content.severity}) - ${card.content.location}`;
        }
        return `• ${card.content}`;
      });

    onSubmitDiagnosis({
      diagnosis: diagnosis.trim(),
      evidence: evidence,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="h-full flex flex-col" style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.95) 100%)',
      backdropFilter: 'blur(16px) saturate(120%)',
      WebkitBackdropFilter: 'blur(16px) saturate(120%)',
      border: '1px solid rgba(209, 213, 219, 0.3)',
      boxShadow: '0 8px 32px rgba(61, 47, 36, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      borderRadius: '16px',
      padding: '20px'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '2px solid rgba(209, 213, 219, 0.3)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🩺</span>
          <h2 className="text-xl font-bold text-ink-900 font-serif">
            Clinical Diagnosis
          </h2>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 font-sans"
          style={{
            background: 'rgba(209, 213, 219, 0.2)',
            color: '#3f2f1e',
            border: '1px solid rgba(209, 213, 219, 0.4)'
          }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {/* Patient Info */}
      {patient && (
        <div className="mb-4 rounded-lg p-2.5" style={{
          background: 'rgba(249, 245, 235, 0.5)',
          border: '1px solid rgba(209, 213, 219, 0.3)'
        }}>
          <p className="text-xs text-ink-700 font-sans">
            <span className="text-ink-900 font-semibold">Patient:</span> {patient.name}
          </p>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">

        {/* Evidence Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">📋</span>
            <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wide font-sans">
              Clinical Evidence
            </h3>
          </div>

          <div className="space-y-2">
            {evidenceCards.map((card) => (
              <EvidenceCard
                key={card.id}
                card={card}
                onRemove={() => handleRemoveCard(card.id)}
                onUpdate={(content) => handleUpdateCard(card.id, content)}
                onDrop={(symptom) => handleDropSymptom(card.id, symptom)}
              />
            ))}
          </div>

          <button
            onClick={handleAddCard}
            className="mt-3 w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all font-sans"
            style={{
              background: 'rgba(209, 213, 219, 0.15)',
              color: '#059669',
              border: '1px dashed rgba(209, 213, 219, 0.4)'
            }}
          >
            + Add Evidence Card
          </button>
        </div>

        {/* Diagnosis Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">🩺</span>
            <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wide font-sans">
              Your Diagnosis
            </h3>
          </div>

          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Enter your medical diagnosis based on the evidence...&#10;&#10;e.g., 'Considering the patient's persistent headache and melancholic humors, I diagnose an excess of black bile causing humoral imbalance...'"
            className="w-full px-4 py-3 rounded-lg border resize-none font-serif text-sm leading-relaxed"
            rows={8}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(209, 213, 219, 0.5)',
              color: '#1f1b14'
            }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 mt-4" style={{ borderTop: '2px solid rgba(209, 213, 219, 0.3)' }}>
        <button
          onClick={handleSubmit}
          disabled={!diagnosis.trim()}
          className="w-full px-6 py-3 text-sm font-semibold transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-sans"
          style={{
            background: diagnosis.trim()
              ? 'linear-gradient(to bottom, #10b981, #059669)'
              : 'rgba(209, 213, 219, 0.3)',
            color: diagnosis.trim() ? 'white' : '#9ca3af',
            border: diagnosis.trim()
              ? '1px solid rgba(16, 185, 129, 0.5)'
              : '1px solid rgba(209, 213, 219, 0.3)',
            boxShadow: diagnosis.trim()
              ? '0 4px 12px rgba(16, 185, 129, 0.3)'
              : 'none'
          }}
        >
          ✓ Submit Diagnosis
        </button>
      </div>
    </div>
  );
}

// Evidence Card Component with drag-drop support
function EvidenceCard({ card, onRemove, onUpdate, onDrop }) {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState('');

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'symptom',
    drop: (item) => {
      onDrop(item.symptom);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  });

  const handleTextSubmit = () => {
    if (textValue.trim()) {
      onUpdate(textValue.trim());
      setIsEditing(false);
      setTextValue('');
    }
  };

  const handleClick = () => {
    if (!card.content) {
      setIsEditing(true);
    }
  };

  // Render populated symptom card
  if (card.type === 'symptom' && card.content) {
    const symptom = card.content;
    return (
      <div
        className="relative rounded-lg p-3 transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          border: '2px solid rgba(209, 213, 219, 0.4)',
          boxShadow: '0 2px 8px rgba(61, 47, 36, 0.08)'
        }}
      >
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full transition-all font-sans"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            fontSize: '12px'
          }}
        >
          ×
        </button>

        <div className="flex items-start gap-2">
          <span className="text-lg">{getSymptomEmoji(symptom.type)}</span>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-ink-900 mb-1 font-serif">{symptom.name}</h4>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wide font-sans ${getSeverityColor(symptom.severity)}`}>
                {symptom.severity}
              </span>
            </div>
            <p className="text-xs text-ink-600 font-sans">📍 {symptom.location}</p>
            {symptom.description && (
              <p className="text-xs text-ink-500 italic mt-1 font-serif">"{symptom.description}"</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render populated manual card
  if (card.type === 'manual' && card.content) {
    return (
      <div
        className="relative rounded-lg p-3 transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          border: '2px solid rgba(209, 213, 219, 0.4)',
          boxShadow: '0 2px 8px rgba(61, 47, 36, 0.08)'
        }}
      >
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full transition-all font-sans"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            fontSize: '12px'
          }}
        >
          ×
        </button>

        <div className="flex items-start gap-2">
          <span className="text-lg">📝</span>
          <p className="flex-1 text-sm text-ink-700 font-sans">{card.content}</p>
        </div>
      </div>
    );
  }

  // Render empty card with drop zone / text entry
  if (isEditing) {
    return (
      <div
        className="rounded-lg p-3"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          border: '2px solid rgba(209, 213, 219, 0.4)'
        }}
      >
        <input
          type="text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTextSubmit();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          onBlur={handleTextSubmit}
          placeholder="Type evidence and press Enter..."
          autoFocus
          className="w-full px-2 py-1 text-sm rounded border-none focus:outline-none font-sans"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#1f1b14'
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={drop}
      onClick={handleClick}
      className="rounded-lg p-4 transition-all cursor-pointer"
      style={{
        background: isOver ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255, 255, 255, 0.3)',
        border: isOver
          ? '2px dashed #f59e0b'
          : '2px dashed rgba(209, 213, 219, 0.4)',
        boxShadow: isOver ? '0 4px 16px rgba(245, 158, 11, 0.2)' : 'none'
      }}
    >
      <p className="text-center text-xs text-ink-400 font-sans">
        {isOver ? '📦 Drop symptom here' : 'Click to type or drag symptom here'}
      </p>
    </div>
  );
}

// Helper functions
function getSymptomEmoji(type) {
  switch (type) {
    case 'pain': return '⚡';
    case 'wound': return '🩸';
    case 'inflammation': return '🔥';
    case 'humoral': return '💭';
    default: return '📋';
  }
}

function getSeverityColor(severity) {
  switch (severity) {
    case 'mild': return 'bg-yellow-400/20 text-yellow-700';
    case 'moderate': return 'bg-orange-400/20 text-orange-700';
    case 'severe': return 'bg-red-400/20 text-red-700';
    case 'critical': return 'bg-red-600/30 text-red-800';
    default: return 'bg-gray-400/20 text-gray-700';
  }
}

export default DiagnosisPanel;
