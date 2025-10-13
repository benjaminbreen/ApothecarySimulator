/**
 * NPC Modal
 *
 * Displays detailed information about non-patient NPCs.
 * Shows procedurally generated appearance, personality, clothing, biography.
 *
 * Swiss-inspired design matching the existing patient modal.
 */

import React, { useMemo } from 'react';
import { adaptEntityForNPCModal } from '../../core/entities/entityAdapter';

export default function NPCModal({ isOpen, onClose, npc }) {
  // Adapt entity to ensure nested format
  const adaptedNpc = useMemo(() => {
    return adaptEntityForNPCModal(npc);
  }, [npc]);

  if (!isOpen || !adaptedNpc) return null;

  const temperament = adaptedNpc.personality?.temperament;
  const bigFive = adaptedNpc.personality?.bigFive;
  const appearance = adaptedNpc.appearance;
  const clothing = adaptedNpc.clothing;
  const social = adaptedNpc.social;
  const biography = adaptedNpc.biography;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="modal-content bg-white rounded-2xl shadow-elevation-4 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">

        {/* Header */}
        <div className="bg-gradient-to-r from-botanical-600 to-botanical-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-6">
            {/* Portrait */}
            <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-elevation-3 flex-shrink-0 bg-gradient-to-br from-botanical-100 to-botanical-200">
              {adaptedNpc.visual?.image ? (
                <img src={adaptedNpc.visual.image} alt={adaptedNpc.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {adaptedNpc.visual?.emoji || '👤'}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold mb-2">{adaptedNpc.name}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-sans">
                  {social?.occupation || 'Unknown Occupation'}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-sans">
                  {social?.class || 'Common'}
                </span>
                {social?.casta && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-sans">
                    {social.casta}
                  </span>
                )}
              </div>
              <p className="text-white/90 font-serif text-sm leading-relaxed">
                {adaptedNpc.description || 'A resident of Mexico City.'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-2 gap-6">

            {/* Left Column */}
            <div className="space-y-6">

              {/* Appearance */}
              <section className="bg-parchment-50 rounded-xl p-4 border border-ink-200">
                <h3 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  Appearance
                </h3>
                <div className="space-y-2 text-sm font-serif text-ink-700">
                  {appearance?.age && (
                    <p><strong className="text-ink-900">Age:</strong> {appearance.age} years</p>
                  )}
                  {appearance?.gender && (
                    <p><strong className="text-ink-900">Gender:</strong> {appearance.gender}</p>
                  )}
                  {appearance?.height && appearance?.build && (
                    <p><strong className="text-ink-900">Build:</strong> {appearance.build}, {appearance.height}</p>
                  )}
                  {appearance?.face?.skinTone && (
                    <p><strong className="text-ink-900">Complexion:</strong> {appearance.face.skinTone}, {appearance.face.complexion || 'average'}</p>
                  )}
                  {appearance?.face?.eyeColor && (
                    <p><strong className="text-ink-900">Eyes:</strong> {appearance.face.eyeShape} {appearance.face.eyeColor} eyes</p>
                  )}
                  {appearance?.hair?.color && (
                    <p><strong className="text-ink-900">Hair:</strong> {appearance.hair.color}, {appearance.hair.style}</p>
                  )}
                  {appearance?.hair?.facialHair && appearance.gender === 'male' && (
                    <p><strong className="text-ink-900">Facial Hair:</strong> {appearance.hair.facialHair}</p>
                  )}

                  {/* Distinguishing Features */}
                  {appearance?.distinguishingFeatures && appearance.distinguishingFeatures.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-ink-200">
                      <p className="font-bold text-ink-900 mb-1">Distinguishing Features:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {appearance.distinguishingFeatures.map((feature, idx) => (
                          <li key={idx} className="text-ink-600">{feature.description || feature.location}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              {/* Clothing */}
              {clothing && clothing.items && clothing.items.length > 0 && (
                <section className="bg-parchment-50 rounded-xl p-4 border border-ink-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">👔</span>
                    Clothing
                  </h3>
                  <p className="text-sm text-ink-600 mb-2 font-sans">
                    <strong>Quality:</strong> {clothing.quality} • <strong>Style:</strong> {clothing.style}
                  </p>
                  <div className="space-y-2">
                    {clothing.items.map((item, idx) => (
                      <div key={idx} className="text-sm font-serif text-ink-700">
                        <span className="font-bold text-ink-900 capitalize">{item.garment}:</span>{' '}
                        {item.color} {item.material}
                        {item.decorations && item.decorations.length > 0 && (
                          <span className="text-botanical-600"> with {item.decorations.join(', ')}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {clothing.accessories && clothing.accessories.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-ink-200">
                      <p className="text-sm font-bold text-ink-900 mb-1">Accessories:</p>
                      <p className="text-sm text-ink-600 font-serif">
                        {clothing.accessories.map(a => a.item).join(', ')}
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* Social Context */}
              {social && (
                <section className="bg-parchment-50 rounded-xl p-4 border border-ink-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🏛️</span>
                    Social Standing
                  </h3>
                  <div className="space-y-2 text-sm font-serif text-ink-700">
                    {social.wealth && (
                      <p><strong className="text-ink-900">Wealth:</strong> {social.wealth}</p>
                    )}
                    {social.literacyLevel && (
                      <p><strong className="text-ink-900">Literacy:</strong> {social.literacyLevel}</p>
                    )}
                    {social.languages && social.languages.length > 0 && (
                      <p><strong className="text-ink-900">Languages:</strong> {social.languages.join(', ')}</p>
                    )}
                    {social.reputation !== undefined && (
                      <p><strong className="text-ink-900">Reputation:</strong> {social.reputation}/100</p>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Personality - Dual System */}
              <section className="bg-potion-50 rounded-xl p-4 border border-potion-200">
                <h3 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🎭</span>
                  Temperament & Personality
                </h3>

                {/* Humoral Temperament */}
                {temperament && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-potion-800 mb-2">Humoral Balance:</p>
                    <p className="text-base font-serif text-ink-900 mb-3">
                      <strong className="capitalize">{temperament.primary}</strong>
                      {temperament.secondary && <span> with {temperament.secondary} tendencies</span>}
                    </p>

                    {/* Humor bars */}
                    <div className="space-y-2">
                      {Object.entries(temperament.humors).map(([humor, value]) => (
                        <div key={humor} className="flex items-center gap-2">
                          <span className="text-xs font-sans text-ink-600 w-24 capitalize">
                            {humor === 'yellowBile' ? 'Yellow Bile' : humor === 'blackBile' ? 'Black Bile' : humor}:
                          </span>
                          <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${
                                humor === 'blood' ? 'bg-red-500' :
                                humor === 'yellowBile' ? 'bg-yellow-500' :
                                humor === 'blackBile' ? 'bg-gray-700' :
                                'bg-blue-300'
                              }`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="text-xs font-sans text-ink-600 w-8">{value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Big Five (for reference) */}
                {bigFive && (
                  <div className="pt-4 border-t border-potion-200">
                    <p className="text-xs font-sans text-potion-700 mb-2">Psychological Profile:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-sans text-ink-600">Openness:</span>
                        <span className="ml-1 text-ink-900">{bigFive.openness}</span>
                      </div>
                      <div>
                        <span className="font-sans text-ink-600">Conscientiousness:</span>
                        <span className="ml-1 text-ink-900">{bigFive.conscientiousness}</span>
                      </div>
                      <div>
                        <span className="font-sans text-ink-600">Extroversion:</span>
                        <span className="ml-1 text-ink-900">{bigFive.extroversion}</span>
                      </div>
                      <div>
                        <span className="font-sans text-ink-600">Agreeableness:</span>
                        <span className="ml-1 text-ink-900">{bigFive.agreeableness}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-sans text-ink-600">Neuroticism:</span>
                        <span className="ml-1 text-ink-900">{bigFive.neuroticism}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Behavioral Traits */}
                {npc.personality?.traits && npc.personality.traits.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-potion-200">
                    <p className="text-xs font-sans text-potion-700 mb-2">Behavioral Traits:</p>
                    <div className="flex flex-wrap gap-1">
                      {npc.personality.traits.map((trait, idx) => (
                        <span key={idx} className="px-2 py-1 bg-potion-100 text-potion-800 rounded text-xs font-sans capitalize">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Biography */}
              {biography && (
                <section className="bg-parchment-50 rounded-xl p-4 border border-ink-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">📜</span>
                    Biography
                  </h3>
                  <div className="space-y-2 text-sm font-serif text-ink-700">
                    {biography.birthplace && (
                      <p><strong className="text-ink-900">Birthplace:</strong> {biography.birthplace}</p>
                    )}
                    {biography.birthYear && (
                      <p><strong className="text-ink-900">Born:</strong> {biography.birthYear}</p>
                    )}
                    {biography.immigrationYear && (
                      <p>
                        <strong className="text-ink-900">Immigrated:</strong> {biography.immigrationYear}
                        {biography.immigrationReason && <span className="text-ink-600"> — {biography.immigrationReason}</span>}
                      </p>
                    )}

                    {/* Major Events */}
                    {biography.majorEvents && biography.majorEvents.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-ink-200">
                        <p className="font-bold text-ink-900 mb-2">Major Life Events:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {biography.majorEvents.map((event, idx) => (
                            <li key={idx} className="text-ink-600">
                              <strong>{event.year}:</strong> {event.event}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Secrets (only if discovered) */}
                    {biography.secrets && biography.secrets.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-ink-200 bg-warning-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                        <p className="font-bold text-warning-900 mb-1 flex items-center gap-1">
                          <span>🤫</span> Secret:
                        </p>
                        {biography.secrets.map((secret, idx) => (
                          <p key={idx} className="text-sm text-warning-800 italic">{secret}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Dialogue Patterns */}
              {npc.dialogue && (
                <section className="bg-botanical-50 rounded-xl p-4 border border-botanical-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    Speech Patterns
                  </h3>
                  <div className="space-y-2 text-sm font-serif text-ink-700">
                    {npc.dialogue.greeting && (
                      <p className="italic text-botanical-800">"{npc.dialogue.greeting}"</p>
                    )}
                    {npc.dialogue.voiceStyle && (
                      <p className="text-xs text-ink-600 mt-2">
                        <strong>Style:</strong> {npc.dialogue.voiceStyle}
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-parchment-100 border-t border-ink-200 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-ink-600 hover:bg-ink-700 text-white rounded-lg font-sans font-medium transition-colors shadow-elevation-1"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
