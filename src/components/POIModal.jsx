/**
 * POIModal - Place or Person of Interest Modal
 * Redesigned: clean layout with LLM-generated vivid description
 */

import React, { useState, useEffect, useRef } from 'react';
import { entityManager } from '../core/entities/EntityManager';
import { resolvePortrait } from '../core/services/portraitResolver';
import { createChatCompletion } from '../core/services/llmService';
import { getDetailImagePathSync } from '../utils/detailImageResolver';

export function POIModal({ entity, isOpen, onClose, onAction }) {
  const [vividDescription, setVividDescription] = useState('');
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);

  // Cache for vivid descriptions (persists across modal open/close)
  const descriptionCacheRef = useRef({});

  // Generate vivid description when modal opens
  useEffect(() => {
    if (!isOpen || !entity) {
      setVividDescription('');
      return;
    }

    // Create cache key from entity name + type
    const cacheKey = `${entity.name}-${entity.entityType || entity.type}`;

    // Check if we already have a cached description
    if (descriptionCacheRef.current[cacheKey]) {
      setVividDescription(descriptionCacheRef.current[cacheKey]);
      return;
    }

    setIsLoadingDescription(true);

    // Contextual prompt based on entity type
    const isDirectObservation = entityType === 'item' ||
                                (entityType === 'location' && entity.locationType === 'Interior');

    const systemPrompt = isDirectObservation
      ? `You are a vivid scene describer for a historical RPG set in 1680s Mexico City.
Given an entity description, write a SHORT (1-2 sentences max) vivid description in second person ("You see..." or "You examine...").
Be immersive, sensory, and historically accurate. Use evocative language but keep it concise.`
      : `You are a vivid scene describer for a historical RPG set in 1680s Mexico City.
Given an entity description, write a SHORT (1-2 sentences max) evocative description.
For locations, describe what you know or recall about the place. For people, describe who they are.
Avoid "you see" unless it's something immediately visible. Be immersive and historically accurate.`;

    const userPrompt = isDirectObservation
      ? `Entity: ${entity.name}
Type: ${entity.entityType || entity.type || 'unknown'}
Description: ${entity.description || 'A person/place of interest'}

Write a vivid second-person description (1-2 sentences) of what you see/examine.`
      : `Entity: ${entity.name}
Type: ${entity.entityType || entity.type || 'unknown'}
Description: ${entity.description || 'A person/place of interest'}

Write an evocative description (1-2 sentences). Use "You recall..." or "You know of..." for distant places. Describe people neutrally or as "You think about..."`;

    // Correct function signature: createChatCompletion(messages, temperature, maxTokens, responseFormat, metadata)
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    createChatCompletion(messages, 0.7, 100, null, { agent: 'POIDescriber' })
      .then(response => {
        const text = response.choices[0].message.content.trim();
        setVividDescription(text);
        // Cache the description
        descriptionCacheRef.current[cacheKey] = text;
      })
      .catch(error => {
        console.error('[POIModal] Error generating vivid description:', error);
        const fallbackText = `You see ${entity.name}. ${entity.description || ''}`;
        setVividDescription(fallbackText);
        // Cache the fallback too
        descriptionCacheRef.current[cacheKey] = fallbackText;
      })
      .finally(() => {
        setIsLoadingDescription(false);
      });
  }, [isOpen, entity]);

  if (!isOpen || !entity) return null;

  const entityType = entity.entityType || entity.type || 'unknown';
  const isLocation = entityType === 'location';
  const isPatient = entityType === 'patient';
  const isNPC = entityType === 'npc';
  const isItem = entityType === 'item';

  // Resolve header image based on entity type
  const headerImage = (() => {
    // PRIORITY 1: Check for detail image in public/details/ folder
    const detailImagePath = getDetailImagePathSync(entity.name);
    if (detailImagePath) {
      // We'll optimistically try to load this, and fall back on error
      return detailImagePath;
    }

    // PRIORITY 2: If entity has explicit image property
    if (entity.image) {
      if (entity.image.includes('/')) {
        return entity.image;
      }
      if (isLocation) return `/locations/${entity.image}`;
      if (isItem) return `/items/${entity.image}`;
      return `/portraits/${entity.image}`;
    }

    // PRIORITY 3: For NPCs/Patients, use centralized portrait resolver
    if (isNPC || isPatient) {
      return resolvePortrait(entity);
    }

    // PRIORITY 4: Fallback images by type
    if (isLocation) {
      // Interior spaces in the botica use boticaentrance.png
      if (entity.locationType === 'Interior' || entity.name?.toLowerCase().includes('botica')) {
        return '/locations/boticaentrance.png';
      }
      return '/assets/parchment.jpg';
    }
    if (isItem) return '/assets/parchment.jpg';
    return '/assets/parchment.jpg';
  })();

  // Get icon based on entity type
  const getIcon = () => {
    if (isLocation) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (isPatient) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (isItem) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    );
  };

  // Get subtitle based on entity type
  const getSubtitle = () => {
    if (isLocation && entity.locationType) {
      return `${entity.locationType}${entity.travelTime ? ` • ${entity.travelTime}` : ''}`;
    }
    if (isPatient) {
      return `Patient${entity.urgency ? ` • ${entity.urgency} Urgency` : ''}`;
    }
    if (isNPC) {
      return `${entity.occupation || 'Character'}${entity.class ? ` • ${entity.class}` : ''}`;
    }
    if (isItem) {
      return `${entity.category || 'Item'}${entity.price ? ` • ${entity.price} reales` : ''}`;
    }
    return entityType;
  };

  // Render left column (primary info)
  const renderLeftColumn = () => {
    if (isLocation) {
      return (
        <>
          {entity.travelTime && (
            <InfoCard icon="📍" title="Travel Time" color="amber">
              <p className="text-sm text-gray-700 dark:text-gray-300">{entity.travelTime}</p>
            </InfoCard>
          )}
          {entity.coordinates && (
            <InfoCard title="Coordinates" color="blue">
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{entity.coordinates}</p>
            </InfoCard>
          )}
          {entity.specimens && entity.specimens.length > 0 && (
            <InfoCard title="Specimens" color="purple">
              <div className="flex flex-wrap gap-2">
                {entity.specimens.map((specimen, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-md">
                    {specimen}
                  </span>
                ))}
              </div>
            </InfoCard>
          )}
        </>
      );
    }

    if (isPatient || isNPC) {
      return (
        <>
          {(entity.age || entity.occupation || entity.birthplace || entity.casta) && (
            <InfoCard title="Personal Information" color="amber">
              <div className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                {entity.age && <div><span className="font-medium">Age:</span> {entity.age}</div>}
                {entity.occupation && <div><span className="font-medium">Occupation:</span> {entity.occupation}</div>}
                {entity.birthplace && <div><span className="font-medium">Birthplace:</span> {entity.birthplace}</div>}
                {entity.casta && <div><span className="font-medium">Casta:</span> {entity.casta}</div>}
              </div>
            </InfoCard>
          )}
          {isPatient && (entity.diagnosis || entity.urgency) && (
            <InfoCard title="Medical Information" color="red">
              <div className="space-y-2">
                {entity.diagnosis && (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Diagnosis:</span> {entity.diagnosis}
                  </div>
                )}
                {entity.urgency && (
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      entity.urgency === 'High' || entity.urgency === 'Critical' ? 'bg-red-600 text-white' :
                      entity.urgency === 'Medium' || entity.urgency === 'Moderate' ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {entity.urgency}
                    </span>
                  </div>
                )}
              </div>
            </InfoCard>
          )}
          {entity.socialContext && (
            <InfoCard title="Social Context" color="blue">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{entity.socialContext}</p>
            </InfoCard>
          )}
          {entity.relationships && Object.keys(entity.relationships).length > 0 && (
            <InfoCard title="Relationships" color="purple">
              <div className="space-y-2">
                {Object.entries(entity.relationships).map(([name, relationship]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      relationship.affinity > 50 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      relationship.affinity < 30 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {relationship.type}
                    </span>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}
        </>
      );
    }

    if (isItem) {
      return (
        <>
          <InfoCard title="Properties" color="amber">
            <div className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
              {entity.category && <div><span className="font-medium">Category:</span> {entity.category}</div>}
              {entity.price && <div><span className="font-medium">Price:</span> {entity.price} reales</div>}
              {entity.origin && <div><span className="font-medium">Origin:</span> {entity.origin}</div>}
              {entity.rarity && <div><span className="font-medium">Rarity:</span> {entity.rarity}</div>}
            </div>
          </InfoCard>
          {entity.properties && entity.properties.length > 0 && (
            <InfoCard title="Medical Properties" color="green">
              <ul className="space-y-1">
                {entity.properties.map((prop, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">• {prop}</li>
                ))}
              </ul>
            </InfoCard>
          )}
          {entity.historicalContext && (
            <InfoCard title="Historical Context" color="blue">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{entity.historicalContext}</p>
            </InfoCard>
          )}
        </>
      );
    }

    return null;
  };

  // Render right column (secondary info) - now only for locations
  const renderRightColumn = () => {
    if (isLocation) {
      return (
        <>
          {entity.locationType && (
            <InfoCard title="Terrain" color="green">
              <p className="text-sm text-gray-700 dark:text-gray-300">{entity.locationType}</p>
              {entity.fatigueImpact !== undefined && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Fatigue Impact</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{entity.fatigueImpact || 'Low'}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${
                      entity.fatigueImpact === 'Low' ? 'bg-green-500 w-1/3' :
                      entity.fatigueImpact === 'Medium' ? 'bg-yellow-500 w-2/3' :
                      'bg-red-500 w-full'
                    }`} />
                  </div>
                </div>
              )}
            </InfoCard>
          )}
          {entity.features && entity.features.length > 0 && (
            <InfoCard title="Features" color="blue">
              <ul className="space-y-1">
                {entity.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">• {feature}</li>
                ))}
              </ul>
            </InfoCard>
          )}
        </>
      );
    }

    return null;
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} aria-label="Close modal" />

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-scale-in border-2 border-emerald-500/30 dark:border-amber-500/30">

        {/* Top Section: Image + Title */}
        <div className="relative h-80 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={headerImage}
              alt={entity.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.warn('[POIModal] Image failed to load:', headerImage);
                e.target.src = '/assets/parchment.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 z-10 border border-white/20 hover:border-white/40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {/* Icon Badge */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-amber-600 dark:to-amber-700 flex items-center justify-center text-white shadow-xl mb-3 border-2 border-white/30">
              {getIcon()}
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-3xl font-bold text-white drop-shadow-2xl font-serif leading-tight mb-1">
              {entity.name}
            </h2>
            <p className="text-emerald-200 dark:text-amber-200 text-sm font-medium drop-shadow-lg">
              {getSubtitle()}
            </p>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto max-h-[calc(90vh-20rem)] custom-scrollbar">
          <div className="p-6 space-y-6">

            {/* Vivid LLM-Generated Description */}
            <div className="relative">
              {isLoadingDescription ? (
                <div className="flex items-center justify-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 dark:border-amber-400 mr-3"></div>
                  <span className="text-sm text-ink-500 dark:text-parchment-300 font-sans">Observing...</span>
                </div>
              ) : vividDescription ? (
                <div className="relative p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-emerald-300/50 dark:border-amber-600/30">
                  <div className="absolute top-4 left-4 text-5xl opacity-20">👁️</div>
                  <p className="text-xl font-serif text-ink-900 dark:text-parchment-100 leading-relaxed italic pl-12">
                    {vividDescription}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Information Sections */}
            <div className="space-y-4">
              {/* Primary Information */}
              {renderLeftColumn() && (
                <div className="space-y-3">
                  {renderLeftColumn()}
                </div>
              )}

              {/* Secondary Information */}
              {renderRightColumn() && (
                <div className="space-y-3">
                  {renderRightColumn()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="border-t-2 border-parchment-200 dark:border-slate-700 bg-parchment-50/50 dark:bg-slate-800/50 p-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-parchment-100 hover:bg-parchment-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-ink-900 dark:text-parchment-100 font-medium rounded-xl transition-all duration-200 border border-parchment-300 dark:border-slate-600"
            >
              Close
            </button>
            {onAction && (
              <button
                onClick={() => onAction(entity)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-amber-600 dark:to-amber-700 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-amber-500 dark:hover:to-amber-600 text-white dark:text-slate-900 font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isLocation ? 'Travel Here' : isPatient ? 'Examine' : isNPC ? 'Speak' : 'View Details'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.15s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1); }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.6), rgba(5, 150, 105, 0.6));
          border-radius: 4px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8));
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(251, 191, 36, 0.6), rgba(245, 158, 11, 0.6));
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(251, 191, 36, 0.8), rgba(245, 158, 11, 0.8));
        }
      `}</style>
    </div>
  );
}

// InfoCard component for consistent styling
function InfoCard({ title, children, color = 'gray', icon }) {
  const colorStyles = {
    amber: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30',
    red: 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30',
    green: 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30',
    blue: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30',
    purple: 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30',
    gray: 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30',
  };

  return (
    <div className={`border rounded-lg p-3 ${colorStyles[color] || colorStyles.gray}`}>
      <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  );
}

export default POIModal;
