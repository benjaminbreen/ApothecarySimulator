/**
 * NPC Modal - Enhanced Design with Dark Mode
 *
 * Features:
 * - Tab navigation (Overview/Personality/Biography)
 * - Collapsible sections with InfoCard and PropertySection
 * - Glassomorphic parchment aesthetic
 * - Comprehensive dark mode support
 * - Better typography and organization
 */

import React, { useState, useMemo } from 'react';
import { adaptEntityForNPCModal } from '../../core/entities/entityAdapter';

export default function NPCModal({ isOpen, onClose, npc }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    appearance: false,
    clothing: false,
    personality: false,
    social: false,
    humors: false,
    bigFive: false,
    traits: false,
    biography: false,
    events: false
  });

  // Adapt entity to ensure nested format
  const adaptedNpc = useMemo(() => {
    return adaptEntityForNPCModal(npc);
  }, [npc]);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !adaptedNpc) return null;

  // Extract data
  const temperament = adaptedNpc.personality?.temperament;
  const bigFive = adaptedNpc.personality?.bigFive;
  const appearance = adaptedNpc.appearance;
  const clothing = adaptedNpc.clothing;
  const social = adaptedNpc.social;
  const biography = adaptedNpc.biography;

  // Toggle expandable sections
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'personality', label: 'Personality', icon: '🎭' },
    { id: 'biography', label: 'Biography', icon: '📜' }
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Container - FIXED DIMENSIONS */}
      <div
        className="relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-parchment-50 via-white to-parchment-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl dark:shadow-dark-elevation-4 border-2 border-ink-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b-2 border-ink-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 transition-colors duration-300">
          <div className="flex items-center gap-4">
            {adaptedNpc.visual?.image && (
              <img
                src={adaptedNpc.visual.image}
                alt={adaptedNpc.name}
                className="w-16 h-16 rounded-lg object-cover border-2 border-ink-300 dark:border-slate-600 shadow-md"
              />
            )}
            <div>
              <h2 className="text-3xl font-bold text-ink-900 dark:text-parchment-100 font-serif transition-colors duration-300">
                {adaptedNpc.name}
              </h2>
              <p className="text-sm text-ink-600 dark:text-slate-400 font-sans transition-colors duration-300">
                {social?.occupation || adaptedNpc.occupation || 'Resident of Mexico City'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-ink-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex-shrink-0 flex border-b-2 border-ink-100 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-300">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-3 font-semibold text-sm uppercase tracking-wide transition-all duration-200 font-sans ${
                activeTab === tab.id
                  ? 'text-amber-700 dark:text-amber-400 bg-gradient-to-b from-amber-50 to-white dark:from-slate-700 dark:to-slate-800 border-b-4 border-amber-600 dark:border-amber-500'
                  : 'text-ink-600 dark:text-slate-400 hover:bg-amber-50/50 dark:hover:bg-slate-700/50'
              }`}
              style={{
                borderLeft: idx > 0 ? '1px solid' : 'none',
                borderColor: 'rgba(0, 0, 0, 0.05)'
              }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area - FIXED HEIGHT with scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-parchment-50 to-white dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-4">

              {/* Quick Info Grid */}
              <div className="grid grid-cols-3 gap-4">
                {(appearance?.age || adaptedNpc.age) && (
                  <div className="px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-ink-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                    <div className="text-xs text-ink-500 dark:text-slate-500 font-semibold mb-1 uppercase tracking-wide">Age</div>
                    <div className="text-lg text-ink-900 dark:text-parchment-100 font-semibold transition-colors duration-300">{appearance?.age || adaptedNpc.age}</div>
                  </div>
                )}
                {(appearance?.gender || adaptedNpc.gender) && (
                  <div className="px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-ink-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                    <div className="text-xs text-ink-500 dark:text-slate-500 font-semibold mb-1 uppercase tracking-wide">Gender</div>
                    <div className="text-lg text-ink-900 dark:text-parchment-100 font-semibold capitalize transition-colors duration-300">{appearance?.gender || adaptedNpc.gender}</div>
                  </div>
                )}
                {(social?.class || adaptedNpc.class) && (
                  <div className="px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-ink-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                    <div className="text-xs text-ink-500 dark:text-slate-500 font-semibold mb-1 uppercase tracking-wide">Class</div>
                    <div className="text-lg text-ink-900 dark:text-parchment-100 font-semibold capitalize transition-colors duration-300">{social?.class || adaptedNpc.class}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              {adaptedNpc.description && (
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 border border-amber-200 dark:border-slate-600 shadow-sm transition-colors duration-300">
                  <p className="text-base text-ink-700 dark:text-slate-300 leading-relaxed font-serif transition-colors duration-300">
                    {adaptedNpc.description}
                  </p>
                </div>
              )}

              {/* Appearance */}
              {appearance && (
                <InfoCard
                  title="Appearance"
                  icon="👤"
                  expanded={expandedSections.appearance}
                  onToggle={() => toggleSection('appearance')}
                  color="blue"
                >
                  <div className="space-y-2 text-sm">
                    {appearance.height && (
                      <PropertyRow label="Height" value={appearance.height} />
                    )}
                    {appearance.build && (
                      <PropertyRow label="Build" value={appearance.build} />
                    )}
                    {appearance.face?.skinTone && (
                      <PropertyRow label="Complexion" value={appearance.face.skinTone} />
                    )}
                    {appearance.face?.eyeColor && (
                      <PropertyRow
                        label="Eyes"
                        value={`${appearance.face.eyeShape || ''} ${appearance.face.eyeColor}`.trim()}
                      />
                    )}
                    {appearance.hair?.color && (
                      <PropertyRow
                        label="Hair"
                        value={`${appearance.hair.color}, ${appearance.hair.style || 'styled'}`}
                      />
                    )}
                    {appearance.hair?.facialHair && (appearance.gender === 'male' || adaptedNpc.gender === 'male') && (
                      <PropertyRow label="Facial Hair" value={appearance.hair.facialHair} />
                    )}
                    {appearance.distinguishingFeatures && Array.isArray(appearance.distinguishingFeatures) && appearance.distinguishingFeatures.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-ink-200 dark:border-slate-700">
                        <p className="font-semibold text-ink-900 dark:text-parchment-100 mb-2 transition-colors duration-300">Distinguishing Features:</p>
                        <ul className="list-disc list-inside space-y-1 text-ink-600 dark:text-slate-400 transition-colors duration-300">
                          {appearance.distinguishingFeatures.map((feature, idx) => (
                            <li key={idx}>{feature.description || feature.location}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </InfoCard>
              )}

              {/* Clothing */}
              {clothing && (
                <InfoCard
                  title="Clothing & Style"
                  icon="👔"
                  expanded={expandedSections.clothing}
                  onToggle={() => toggleSection('clothing')}
                  color="purple"
                >
                  <div className="space-y-2 text-sm">
                    {clothing.style && (
                      <PropertyRow label="Style" value={clothing.style} />
                    )}
                    {clothing.quality && (
                      <PropertyRow label="Quality" value={clothing.quality} />
                    )}
                    {clothing.items && Array.isArray(clothing.items) && clothing.items.length > 0 && (
                      <div className="mt-3">
                        <p className="font-semibold text-ink-900 dark:text-parchment-100 mb-2 transition-colors duration-300">Garments:</p>
                        <ul className="space-y-2">
                          {clothing.items.map((item, idx) => (
                            <li key={idx} className="pl-4 border-l-2 border-purple-300 dark:border-purple-700">
                              <span className="font-medium text-ink-700 dark:text-slate-300 transition-colors duration-300">{item.type}</span>
                              {item.color && <span className="text-ink-600 dark:text-slate-400 transition-colors duration-300"> - {item.color}</span>}
                              {item.material && <span className="text-ink-500 dark:text-slate-500 text-xs transition-colors duration-300"> ({item.material})</span>}
                              {item.decorations && Array.isArray(item.decorations) && item.decorations.length > 0 && (
                                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 transition-colors duration-300">
                                  Decorations: {item.decorations.join(', ')}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {clothing.accessories && Array.isArray(clothing.accessories) && clothing.accessories.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-ink-200 dark:border-slate-700">
                        <p className="font-semibold text-ink-900 dark:text-parchment-100 mb-2 transition-colors duration-300">Accessories:</p>
                        <ul className="list-disc list-inside space-y-1 text-ink-600 dark:text-slate-400 transition-colors duration-300">
                          {clothing.accessories.map((accessory, idx) => (
                            <li key={idx}>{accessory}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </InfoCard>
              )}

              {/* Social Standing */}
              {social && (
                <InfoCard
                  title="Social Standing"
                  icon="🏛️"
                  expanded={expandedSections.social}
                  onToggle={() => toggleSection('social')}
                  color="green"
                >
                  <div className="space-y-2 text-sm">
                    {social.casta && (
                      <PropertyRow label="Casta" value={social.casta} />
                    )}
                    {social.wealth && (
                      <PropertyRow label="Wealth" value={social.wealth} />
                    )}
                    {social.literacyLevel && (
                      <PropertyRow label="Literacy" value={social.literacyLevel} />
                    )}
                    {social.languages && Array.isArray(social.languages) && social.languages.length > 0 && (
                      <PropertyRow label="Languages" value={social.languages.join(', ')} />
                    )}
                    {social.reputation !== undefined && (
                      <PropertyRow label="Reputation" value={`${social.reputation}/100`} />
                    )}
                  </div>
                </InfoCard>
              )}
            </div>
          )}

          {/* PERSONALITY TAB */}
          {activeTab === 'personality' && (
            <div className="p-6 space-y-4">

              {/* Personality Traits */}
              {adaptedNpc.personality?.traits && Array.isArray(adaptedNpc.personality.traits) && (
                <InfoCard
                  title="Character Traits"
                  icon="✨"
                  expanded={expandedSections.traits}
                  onToggle={() => toggleSection('traits')}
                  color="purple"
                >
                  <div className="flex flex-wrap gap-2">
                    {adaptedNpc.personality.traits.map((trait, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm font-medium border border-purple-200 dark:border-purple-700 transition-colors duration-300"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </InfoCard>
              )}

              {/* Humoral Temperament */}
              {temperament && (
                <InfoCard
                  title="Humoral Temperament"
                  icon="⚖️"
                  expanded={expandedSections.humors}
                  onToggle={() => toggleSection('humors')}
                  color="amber"
                >
                  <div className="space-y-4">
                    <p className="text-lg font-semibold text-ink-900 dark:text-parchment-100 capitalize transition-colors duration-300">
                      {temperament.primary}
                      {temperament.secondary && (
                        <span className="text-base text-ink-600 dark:text-slate-400 font-normal transition-colors duration-300">
                          {' '}with {temperament.secondary} tendencies
                        </span>
                      )}
                    </p>

                    {/* Humor bars */}
                    <div className="space-y-3">
                      {Object.entries(temperament.humors).map(([humor, value]) => (
                        <div key={humor}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-ink-700 dark:text-slate-300 capitalize font-medium transition-colors duration-300">
                              {humor === 'yellowBile' ? 'Yellow Bile' : humor === 'blackBile' ? 'Black Bile' : humor}
                            </span>
                            <span className="text-sm text-ink-600 dark:text-slate-400 font-mono transition-colors duration-300">{value}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                humor === 'blood' ? 'bg-red-500' :
                                humor === 'yellowBile' ? 'bg-yellow-500' :
                                humor === 'blackBile' ? 'bg-gray-600' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 transition-colors duration-300">
                      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed transition-colors duration-300">
                        According to Galenic medicine, this individual's temperament reflects the balance of the four humors within their body.
                      </p>
                    </div>
                  </div>
                </InfoCard>
              )}

              {/* Big Five */}
              {bigFive && (
                <InfoCard
                  title="Psychological Profile (Big Five)"
                  icon="🧠"
                  expanded={expandedSections.bigFive}
                  onToggle={() => toggleSection('bigFive')}
                  color="blue"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 transition-colors duration-300">
                      <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1 uppercase tracking-wide transition-colors duration-300">Openness</div>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-300 font-mono transition-colors duration-300">{bigFive.openness}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 transition-colors duration-300">
                      <div className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1 uppercase tracking-wide transition-colors duration-300">Conscientiousness</div>
                      <div className="text-2xl font-bold text-green-900 dark:text-green-300 font-mono transition-colors duration-300">{bigFive.conscientiousness}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 transition-colors duration-300">
                      <div className="text-xs text-purple-700 dark:text-purple-400 font-semibold mb-1 uppercase tracking-wide transition-colors duration-300">Extroversion</div>
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-300 font-mono transition-colors duration-300">{bigFive.extroversion}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 transition-colors duration-300">
                      <div className="text-xs text-pink-700 dark:text-pink-400 font-semibold mb-1 uppercase tracking-wide transition-colors duration-300">Agreeableness</div>
                      <div className="text-2xl font-bold text-pink-900 dark:text-pink-300 font-mono transition-colors duration-300">{bigFive.agreeableness}</div>
                    </div>
                    <div className="col-span-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors duration-300">
                      <div className="text-xs text-red-700 dark:text-red-400 font-semibold mb-1 uppercase tracking-wide transition-colors duration-300">Neuroticism</div>
                      <div className="text-2xl font-bold text-red-900 dark:text-red-300 font-mono transition-colors duration-300">{bigFive.neuroticism}</div>
                    </div>
                  </div>
                </InfoCard>
              )}
            </div>
          )}

          {/* BIOGRAPHY TAB */}
          {activeTab === 'biography' && (
            <div className="p-6 space-y-4">

              {/* Life History */}
              {biography && (
                <InfoCard
                  title="Life History"
                  icon="📖"
                  expanded={expandedSections.biography}
                  onToggle={() => toggleSection('biography')}
                  color="blue"
                >
                  <div className="space-y-2 text-sm">
                    {biography.birthplace && (
                      <PropertyRow label="Birthplace" value={biography.birthplace} />
                    )}
                    {biography.birthYear && (
                      <PropertyRow label="Born" value={biography.birthYear} />
                    )}
                    {biography.immigrationYear && (
                      <div>
                        <PropertyRow label="Immigrated" value={biography.immigrationYear} />
                        {biography.immigrationReason && (
                          <p className="text-xs text-ink-600 dark:text-slate-400 italic mt-1 pl-4 transition-colors duration-300">
                            {biography.immigrationReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </InfoCard>
              )}

              {/* Major Life Events */}
              {biography && biography.majorEvents && Array.isArray(biography.majorEvents) && biography.majorEvents.length > 0 && (
                <InfoCard
                  title="Major Life Events"
                  icon="📅"
                  expanded={expandedSections.events}
                  onToggle={() => toggleSection('events')}
                  color="green"
                >
                  <div className="space-y-3">
                    {biography.majorEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className="pl-4 border-l-4 border-green-400 dark:border-green-600 py-2"
                      >
                        <div className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1 transition-colors duration-300">{event.year}</div>
                        <div className="text-sm text-ink-700 dark:text-slate-300 leading-relaxed transition-colors duration-300">{event.event}</div>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              )}

              {/* Secrets */}
              {biography && biography.secrets && Array.isArray(biography.secrets) && biography.secrets.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 shadow-md transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🤫</span>
                    <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 transition-colors duration-300">Secret</h3>
                  </div>
                  {biography.secrets.map((secret, idx) => (
                    <p key={idx} className="text-sm text-amber-800 dark:text-amber-200 italic leading-relaxed transition-colors duration-300">
                      {secret}
                    </p>
                  ))}
                </div>
              )}

              {/* Historical Context Note */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 transition-colors duration-300">
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-blue-700 dark:text-blue-400 transition-colors duration-300">
                  💡 Historical Context
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed transition-colors duration-300">
                  This character exists within the complex social hierarchy of 1680 Mexico City, where casta, class, and occupation
                  determined nearly every aspect of daily life.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 46, 0.3);
          border-radius: 5px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 46, 0.5);
          background-clip: padding-box;
        }

        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(203, 213, 225, 0.3);
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(203, 213, 225, 0.5);
          }
        }
      `}</style>
    </div>
  );
}

// InfoCard Component - Collapsible card with colored accents
function InfoCard({ title, icon, color, children, expanded, onToggle }) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-300',
      hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-800 dark:text-purple-300',
      hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-300',
      hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900/30'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-800 dark:text-amber-300',
      hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} overflow-hidden shadow-sm transition-all duration-300`}>
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${colors.hoverBg}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className={`text-base font-bold ${colors.text} transition-colors duration-300`}>{title}</h3>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${colors.text}`}
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4 bg-white dark:bg-slate-800/50 transition-colors duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

// PropertyRow Component - Label-value pair
function PropertyRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-1">
      <span className="text-ink-600 dark:text-slate-400 font-medium transition-colors duration-300">{label}:</span>
      <span className="text-ink-900 dark:text-parchment-100 font-semibold text-right transition-colors duration-300">{value}</span>
    </div>
  );
}
