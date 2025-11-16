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
  const [confidence, setConfidence] = useState(null); // null, 'low', 'medium', 'high'
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

    if (!confidence) {
      alert('Please select your confidence level in this diagnosis.');
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
      confidence: confidence,
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
        <div className="mb-3 shadow-inner rounded-lg py-1 p-2.5" style={{
          background: 'rgba(249, 245, 235, 0.5)',
          border: '1px solid rgba(209, 213, 219, 0.3)'
        }}>
          <p className="text-xs text-ink-700 mt-1 mb-1  font-sans">
            <span className="text-ink-900 font-semibold">Patient:</span> {patient.name}
          </p>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2 min-h-0">

        {/* Evidence Section - Grows to fill available space */}
        <div className="flex flex-col min-h-0 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base"></span>
            <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wide font-sans">
              Clinical Evidence
            </h3>
          </div>

          {/* Responsive Evidence Cards Container - grows with available space */}
          <div className="overflow-y-auto custom-scrollbar space-y-1 pr-1 mb-1.5 max-h-[200px]">
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
            className="w-full px-2 py-1.5 rounded-lg text-xs font-semibold transition-all font-sans"
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
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base"></span>
            <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wide font-sans">
              Your Diagnosis
            </h3>
          </div>

          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Enter your medical diagnosis based on the evidence...&#10;e.g., 'Considering the patient's melancholic humors, I diagnose an excess of black bile...'"
            className="shadow-inner w-full px-3 ml-1 py-2 rounded-lg border resize-none font-serif leading-relaxed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400"
            rows={2}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(209, 213, 219, 0.5)',
              color: '#1f1b14',
              fontSize: '18px'
            }}
          />
        </div>

        {/* Confidence Meter */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base"></span>
            <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wide font-sans">
              Diagnostic Certainty
            </h3>
          </div>

          <div className="space-y-1.5">
            <div className="flex gap-1.5">
              {[
                { value: 'low', label: 'Low', emoji: '❓', color: '#f59e0b', description: 'Uncertain, requires more examination' },
                { value: 'medium', label: 'Medium', emoji: '⚖️', color: '#3b82f6', description: 'Reasonably confident based on evidence' },
                { value: 'high', label: 'High', emoji: '✓', color: '#10b981', description: 'Very confident in this diagnosis' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setConfidence(option.value)}
                  className="flex-1 px-2 py-1.5 rounded-lg transition-all duration-300 font-sans relative overflow-hidden group"
                  style={{
                    background: confidence === option.value
                      ? `linear-gradient(135deg, ${option.color}22 0%, ${option.color}33 100%)`
                      : 'rgba(255, 255, 255, 0.5)',
                    border: confidence === option.value
                      ? `2px solid ${option.color}`
                      : '2px solid rgba(209, 213, 219, 0.4)',
                    boxShadow: confidence === option.value
                      ? `0 4px 12px ${option.color}44`
                      : 'none',
                    transform: confidence === option.value ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  {/* Animated glow effect on selection */}
                  {confidence === option.value && (
                    <div
                      className="absolute inset-0 animate-pulse"
                      style={{
                        background: `radial-gradient(circle at center, ${option.color}22 0%, transparent 70%)`,
                        pointerEvents: 'none'
                      }}
                    />
                  )}

                  <div className="relative flex flex-col items-center gap-0.5">
                    <span className="text-base">{option.emoji}</span>
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        color: confidence === option.value ? option.color : '#6b7280'
                      }}
                    >
                      {option.label}
                    </span>
                  </div>

                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap text-[10px] font-sans"
                    style={{
                      background: 'rgba(31, 27, 20, 0.95)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      zIndex: 50
                    }}
                  >
                    {option.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Visual Confidence Meter */}
            {confidence && (
              <div className="rounded-lg p-2 transition-all duration-500" style={{
                background: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(209, 213, 219, 0.3)'
              }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-ink-700 uppercase tracking-wide font-sans">Certainty</span>
                  <span className="text-[9px] font-bold font-sans" style={{
                    color: confidence === 'high' ? '#10b981' : confidence === 'medium' ? '#3b82f6' : '#f59e0b'
                  }}>
                    {confidence === 'high' ? '85-100%' : confidence === 'medium' ? '50-84%' : '0-49%'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: confidence === 'high' ? '92%' : confidence === 'medium' ? '67%' : '32%',
                      background: confidence === 'high'
                        ? 'linear-gradient(to right, #10b981, #059669)'
                        : confidence === 'medium'
                        ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                        : 'linear-gradient(to right, #f59e0b, #d97706)',
                      boxShadow: confidence === 'high'
                        ? '0 0 12px #10b98166'
                        : confidence === 'medium'
                        ? '0 0 12px #3b82f666'
                        : '0 0 12px #f59e0b66'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2 mt-2 flex-shrink-0" style={{ borderTop: '2px solid rgba(209, 213, 219, 0.3)' }}>
        <button
          onClick={handleSubmit}
          disabled={!diagnosis.trim()}
          className="w-full px-4 py-2 text-xs font-semibold transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-sans"
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
        className="relative rounded-lg p-2 transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          border: '2px solid rgba(209, 213, 219, 0.4)',
          boxShadow: '0 2px 8px rgba(61, 47, 36, 0.08)'
        }}
      >
        <button
          onClick={onRemove}
          className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center rounded-full transition-all font-sans"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            fontSize: '11px'
          }}
        >
          ×
        </button>

        <div className="flex items-start gap-2">
          <span className="text-base">{getSymptomEmoji(symptom.type)}</span>
          <div className="flex-1 pr-4">
            <h4 className="text-xs font-bold text-ink-900 mb-0.5 font-serif">{symptom.name}</h4>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide font-sans ${getSeverityColor(symptom.severity)}`}>
                {symptom.severity}
              </span>
            </div>
            <p className="text-[10px] text-ink-600 font-sans">📍 {symptom.location}</p>
            {symptom.description && (
              <p className="text-[10px] text-ink-500 italic mt-0.5 font-serif line-clamp-2">"{symptom.description}"</p>
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
        className="relative rounded-lg p-2 transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          border: '2px solid rgba(209, 213, 219, 0.4)',
          boxShadow: '0 2px 8px rgba(61, 47, 36, 0.08)'
        }}
      >
        <button
          onClick={onRemove}
          className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center rounded-full transition-all font-sans"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            fontSize: '11px'
          }}
        >
          ×
        </button>

        <div className="flex items-start gap-2 pr-4">
          <span className="text-base">📝</span>
          <p className="flex-1 text-xs text-ink-700 font-sans">{card.content}</p>
        </div>
      </div>
    );
  }

  // Render empty card with drop zone / text entry
  if (isEditing) {
    return (
      <div
        className="rounded-lg p-2"
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
          className="w-full px-2 py-1 text-xs rounded border-none focus:outline-none font-sans"
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
      className="rounded-lg p-2.5 transition-all cursor-pointer"
      style={{
        background: isOver ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255, 255, 255, 0.3)',
        border: isOver
          ? '2px dashed #f59e0b'
          : '2px dashed rgba(209, 213, 219, 0.4)',
        boxShadow: isOver ? '0 4px 16px rgba(245, 158, 11, 0.2)' : 'none'
      }}
    >
      <p className="text-center text-[10px] text-ink-400 font-sans">
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
