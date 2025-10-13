/**
 * POIModal - Place or Person of Interest Modal
 * Redesigned for elegance: compact, modern, two-column layout
 */

import React from 'react';
import { entityManager } from '../core/entities/EntityManager';
import { resolvePortrait } from '../core/services/portraitResolver';

export function POIModal({ entity, isOpen, onClose, onAction }) {
  if (!isOpen || !entity) return null;

  const entityType = entity.entityType || entity.type || 'unknown';
  const isLocation = entityType === 'location';
  const isPatient = entityType === 'patient';
  const isNPC = entityType === 'npc';
  const isItem = entityType === 'item';

  // Resolve header image based on entity type
  const headerImage = (() => {
    // If entity has explicit image property
    if (entity.image) {
      if (entity.image.includes('/')) {
        return entity.image;
      }
      if (isLocation) return `/locations/${entity.image}`;
      if (isItem) return `/items/${entity.image}`;
      return `/portraits/${entity.image}`;
    }

    // For NPCs/Patients, use centralized portrait resolver
    if (isNPC || isPatient) {
      return resolvePortrait(entity);
    }

    // Fallback images by type
    if (isLocation) return '/locations/default.jpg';
    if (isItem) return '/items/default.jpg';
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
        <div className="space-y-4">
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
        </div>
      );
    }

    if (isPatient || isNPC) {
      return (
        <div className="space-y-4">
          {(entity.age || entity.occupation || entity.birthplace || entity.casta) && (
            <InfoCard title="Details" color="amber">
              <div className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                {entity.age && <div><span className="font-medium">Age:</span> {entity.age}</div>}
                {entity.occupation && <div><span className="font-medium">Occupation:</span> {entity.occupation}</div>}
                {entity.birthplace && <div><span className="font-medium">Birthplace:</span> {entity.birthplace}</div>}
                {entity.casta && <div><span className="font-medium">Casta:</span> {entity.casta}</div>}
              </div>
            </InfoCard>
          )}
          {isPatient && (entity.diagnosis || entity.urgency) && (
            <InfoCard title="Medical Info" color="red">
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
        </div>
      );
    }

    if (isItem) {
      return (
        <div className="space-y-4">
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
        </div>
      );
    }

    return null;
  };

  // Render right column (secondary info)
  const renderRightColumn = () => {
    if (isLocation) {
      return (
        <div className="space-y-4">
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
        </div>
      );
    }

    if (isPatient || isNPC) {
      return (
        <div className="space-y-4">
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
        </div>
      );
    }

    if (isItem) {
      return (
        <div className="space-y-4">
          {entity.historicalContext && (
            <InfoCard title="Historical Context" color="blue">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{entity.historicalContext}</p>
            </InfoCard>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} aria-label="Close modal" />

      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-scale-in">
        {/* Compact Header with Image */}
        <div className="relative h-24 overflow-hidden rounded-t-2xl">
          <img
            src={headerImage}
            alt={entity.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/assets/parchment.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Icon Badge - Smaller */}
          <div className="absolute top-3 left-4 w-10 h-10 rounded-full bg-amber-600 dark:bg-amber-500 flex items-center justify-center text-white shadow-lg">
            {getIcon()}
          </div>

          {/* Title - Compact */}
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-xl font-bold text-white drop-shadow-lg leading-tight">{entity.name}</h2>
            <p className="text-amber-200 dark:text-amber-300 text-xs font-medium drop-shadow mt-0.5">{getSubtitle()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description Quote */}
          {entity.description && (
            <div className="mb-5 pl-4 border-l-2 border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 py-2 pr-3 rounded-r">
              <p className="text-gray-800 dark:text-gray-200 italic text-sm leading-relaxed">"{entity.description}"</p>
            </div>
          )}

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {renderLeftColumn()}
            {renderRightColumn()}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
            {onAction && (
              <button
                onClick={() => onAction(entity)}
                className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
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
