/**
 * NPC Modal - Professional Redesign
 *
 * Features:
 * - Large portrait image on left
 * - React-icons instead of emojis
 * - Professional typography and spacing
 * - Better information hierarchy
 * - Glassomorphic aesthetic matching ItemModal
 * - Comprehensive dark mode support
 */

import React, { useState, useMemo } from 'react';
import { adaptEntityForNPCModal } from '../../core/entities/entityAdapter';
import { FaUser, FaTheaterMasks, FaBookOpen, FaChevronDown, FaChevronUp, FaTshirt, FaLandmark, FaBrain, FaBalanceScale, FaCalendarAlt, FaLock } from 'react-icons/fa';

export default function NPCModal({ isOpen, onClose, npc, primaryPortraitFile = null }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    appearance: true,
    clothing: false,
    personality: false,
    social: false,
    humors: false,
    bigFive: false,
    traits: true,
    biography: true,
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

  // Determine portrait to show
  // Priority: 1) botica interior, 2) primaryPortraitFile, 3) npc visual image
  let portraitUrl = null;
  if (primaryPortraitFile) {
    if (primaryPortraitFile.startsWith('ui/')) {
      portraitUrl = `/${primaryPortraitFile}`;
    } else {
      portraitUrl = `/portraits/${primaryPortraitFile}`;
    }
  } else if (adaptedNpc.visual?.image) {
    portraitUrl = adaptedNpc.visual.image;
  }

  // Toggle expandable sections
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'personality', label: 'Personality', icon: FaTheaterMasks },
    { id: 'biography', label: 'Biography', icon: FaBookOpen }
  ];

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-6xl h-[88vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 247, 0.95) 50%, rgba(255, 255, 255, 0.98) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: isDark
            ? '0 24px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 24px 80px rgba(61, 47, 36, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-lg transition-all duration-150 hover:bg-ink-100 dark:hover:bg-slate-700"
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
            style={{ color: isDark ? '#cbd5e1' : '#3d2817' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with Portrait */}
        <div className="flex-shrink-0 flex items-stretch border-b transition-colors duration-300"
          style={{
            background: isDark
              ? 'linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))'
              : 'linear-gradient(to right, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
            borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
          }}>

          {/* Portrait Section */}
          {portraitUrl && (
            <div className="flex-shrink-0 w-64 h-52 relative overflow-hidden">
              <img
                src={portraitUrl}
                alt={adaptedNpc.name}
                className="w-full h-full object-cover"
                style={{
                  boxShadow: isDark
                    ? 'inset 0 0 30px rgba(0, 0, 0, 0.5)'
                    : 'inset 0 0 30px rgba(0, 0, 0, 0.1)'
                }}
              />
              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: isDark
                    ? 'linear-gradient(to right, transparent 0%, rgba(15, 23, 42, 0.3) 100%)'
                    : 'linear-gradient(to right, transparent 0%, rgba(252, 250, 247, 0.3) 100%)'
                }}
              />
            </div>
          )}

          {/* Header Info */}
          <div className="flex-1 flex items-center px-8 py-6">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-ink-900 dark:text-parchment-100 font-serif mb-2 transition-colors duration-300">
                {adaptedNpc.name}
              </h2>
              <p className="text-lg text-ink-600 dark:text-slate-400 font-sans mb-4 transition-colors duration-300">
                {social?.occupation || adaptedNpc.occupation || 'Resident of Mexico City'}
              </p>

              {/* Quick Info Pills */}
              <div className="flex flex-wrap gap-2">
                {(appearance?.age || adaptedNpc.age) && (
                  <span className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-300"
                    style={{
                      background: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                      color: isDark ? '#93c5fd' : '#1e40af',
                      border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                    {appearance?.age || adaptedNpc.age}
                  </span>
                )}
                {(appearance?.gender || adaptedNpc.gender) && (
                  <span className="px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors duration-300"
                    style={{
                      background: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
                      color: isDark ? '#c4b5fd' : '#6b21a8',
                      border: isDark ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(168, 85, 247, 0.2)'
                    }}>
                    {appearance?.gender || adaptedNpc.gender}
                  </span>
                )}
                {(social?.class || adaptedNpc.class) && (
                  <span className="px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors duration-300"
                    style={{
                      background: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                      color: isDark ? '#fbbf24' : '#92400e',
                      border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                    {social?.class || adaptedNpc.class}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex-shrink-0 flex border-b transition-colors duration-300"
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)',
            borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
          }}>
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative font-sans flex items-center justify-center gap-2"
                style={{
                  fontWeight: isActive ? 700 : 600,
                  letterSpacing: '0.1em',
                  color: isActive
                    ? (isDark ? '#fbbf24' : '#15803d')
                    : (isDark ? '#94a3b8' : '#6b5a47'),
                  background: isActive
                    ? (isDark
                      ? 'linear-gradient(to bottom, rgba(51, 65, 85, 0.8), rgba(30, 41, 59, 0.6))'
                      : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))')
                    : 'transparent',
                  borderLeft: idx > 0 ? (isDark ? '1px solid rgba(71, 85, 105, 0.2)' : '1px solid rgba(209, 213, 219, 0.2)') : 'none',
                  borderBottom: isActive
                    ? (isDark ? '3px solid #fbbf24' : '3px solid #15803d')
                    : '3px solid transparent'
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar transition-colors duration-300"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.5))'
              : 'linear-gradient(to bottom, rgba(249, 245, 235, 0.6), rgba(255, 255, 255, 0.5))'
          }}>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="p-8 space-y-6">

              {/* Description Card */}
              {adaptedNpc.description && (
                <div className="p-5 rounded-xl shadow-sm transition-colors duration-300"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)'
                      : 'linear-gradient(135deg, rgba(254, 252, 247, 0.95) 0%, rgba(249, 245, 235, 0.9) 100%)',
                    border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(217, 199, 171, 0.4)'
                  }}>
                  <p className="text-base text-ink-700 dark:text-slate-300 leading-relaxed font-serif transition-colors duration-300">
                    {adaptedNpc.description}
                  </p>
                </div>
              )}

              {/* Appearance */}
              {appearance && (
                <InfoCard
                  title="Appearance"
                  icon={FaUser}
                  expanded={expandedSections.appearance}
                  onToggle={() => toggleSection('appearance')}
                  color="blue"
                >
                  <div className="space-y-3 text-sm">
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
                      <div className="mt-4 pt-4 border-t border-ink-200 dark:border-slate-700">
                        <p className="font-semibold text-ink-900 dark:text-parchment-100 mb-2 text-xs uppercase tracking-wide transition-colors duration-300">
                          Distinguishing Features
                        </p>
                        <ul className="space-y-1.5 text-ink-600 dark:text-slate-400 transition-colors duration-300">
                          {appearance.distinguishingFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-500 dark:text-emerald-400 mt-0.5">•</span>
                              <span>{feature.description || feature.location}</span>
                            </li>
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
                  icon={FaTshirt}
                  expanded={expandedSections.clothing}
                  onToggle={() => toggleSection('clothing')}
                  color="purple"
                >
                  <div className="space-y-3 text-sm">
                    {clothing.style && (
                      <PropertyRow label="Style" value={clothing.style} />
                    )}
                    {clothing.quality && (
                      <PropertyRow label="Quality" value={clothing.quality} />
                    )}
                    {clothing.items && Array.isArray(clothing.items) && clothing.items.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold text-ink-900 dark:text-parchment-100 mb-3 text-xs uppercase tracking-wide transition-colors duration-300">
                          Garments
                        </p>
                        <div className="space-y-2">
                          {clothing.items.map((item, idx) => (
                            <div key={idx} className="p-3 rounded-lg transition-colors duration-300"
                              style={{
                                background: isDark ? 'rgba(168, 85, 247, 0.08)' : 'rgba(168, 85, 247, 0.05)',
                                border: isDark ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid rgba(168, 85, 247, 0.15)'
                              }}>
                              <span className="font-semibold text-ink-700 dark:text-slate-300 transition-colors duration-300">
                                {item.type}
                              </span>
                              {item.color && <span className="text-ink-600 dark:text-slate-400 transition-colors duration-300"> • {item.color}</span>}
                              {item.material && <span className="text-ink-500 dark:text-slate-500 text-xs transition-colors duration-300"> ({item.material})</span>}
                              {item.decorations && Array.isArray(item.decorations) && item.decorations.length > 0 && (
                                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 transition-colors duration-300">
                                  Decorations: {item.decorations.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {clothing.accessories && Array.isArray(clothing.accessories) && clothing.accessories.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-ink-200 dark:border-slate-700">
                        <p className="font-semibold text-ink-900 dark:text-parchment-100 mb-2 text-xs uppercase tracking-wide transition-colors duration-300">
                          Accessories
                        </p>
                        <ul className="space-y-1.5 text-ink-600 dark:text-slate-400 transition-colors duration-300">
                          {clothing.accessories.map((accessory, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-purple-500 dark:text-purple-400 mt-0.5">•</span>
                              <span>{accessory}</span>
                            </li>
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
                  icon={FaLandmark}
                  expanded={expandedSections.social}
                  onToggle={() => toggleSection('social')}
                  color="green"
                >
                  <div className="space-y-3 text-sm">
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
            <div className="p-8 space-y-6">

              {/* Personality Traits */}
              {adaptedNpc.personality?.traits && Array.isArray(adaptedNpc.personality.traits) && (
                <InfoCard
                  title="Character Traits"
                  icon={FaTheaterMasks}
                  expanded={expandedSections.traits}
                  onToggle={() => toggleSection('traits')}
                  color="purple"
                >
                  <div className="flex flex-wrap gap-2">
                    {adaptedNpc.personality.traits.map((trait, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300"
                        style={{
                          background: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.12)',
                          color: isDark ? '#e9d5ff' : '#6b21a8',
                          border: isDark ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(168, 85, 247, 0.3)'
                        }}
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
                  icon={FaBalanceScale}
                  expanded={expandedSections.humors}
                  onToggle={() => toggleSection('humors')}
                  color="amber"
                >
                  <div className="space-y-5">
                    <p className="text-xl font-semibold text-ink-900 dark:text-parchment-100 capitalize transition-colors duration-300">
                      {temperament.primary}
                      {temperament.secondary && (
                        <span className="text-base text-ink-600 dark:text-slate-400 font-normal transition-colors duration-300">
                          {' '}with {temperament.secondary} tendencies
                        </span>
                      )}
                    </p>

                    {/* Humor bars */}
                    <div className="space-y-4">
                      {Object.entries(temperament.humors).map(([humor, value]) => (
                        <div key={humor}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-ink-700 dark:text-slate-300 capitalize font-semibold transition-colors duration-300">
                              {humor === 'yellowBile' ? 'Yellow Bile' : humor === 'blackBile' ? 'Black Bile' : humor}
                            </span>
                            <span className="text-sm text-ink-600 dark:text-slate-400 font-mono font-semibold transition-colors duration-300">{value}%</span>
                          </div>
                          <div className="h-3 rounded-full overflow-hidden transition-colors duration-300"
                            style={{
                              background: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(229, 231, 235, 0.8)'
                            }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${value}%`,
                                background: humor === 'blood' ? 'linear-gradient(to right, #ef4444, #dc2626)' :
                                          humor === 'yellowBile' ? 'linear-gradient(to right, #eab308, #ca8a04)' :
                                          humor === 'blackBile' ? 'linear-gradient(to right, #6b7280, #4b5563)' :
                                          'linear-gradient(to right, #3b82f6, #2563eb)'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 p-4 rounded-lg transition-colors duration-300"
                      style={{
                        background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(254, 243, 199, 0.5)',
                        border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                      }}>
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
                  title="Psychological Profile"
                  icon={FaBrain}
                  expanded={expandedSections.bigFive}
                  onToggle={() => toggleSection('bigFive')}
                  color="blue"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg transition-colors duration-300"
                      style={{
                        background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(219, 234, 254, 0.6)',
                        border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                      <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1 uppercase tracking-wider transition-colors duration-300">Openness</div>
                      <div className="text-3xl font-bold text-blue-900 dark:text-blue-300 font-mono transition-colors duration-300">{bigFive.openness}</div>
                    </div>
                    <div className="p-4 rounded-lg transition-colors duration-300"
                      style={{
                        background: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(220, 252, 231, 0.6)',
                        border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
                      }}>
                      <div className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1 uppercase tracking-wider transition-colors duration-300">Conscientiousness</div>
                      <div className="text-3xl font-bold text-green-900 dark:text-green-300 font-mono transition-colors duration-300">{bigFive.conscientiousness}</div>
                    </div>
                    <div className="p-4 rounded-lg transition-colors duration-300"
                      style={{
                        background: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(243, 232, 255, 0.6)',
                        border: isDark ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)'
                      }}>
                      <div className="text-xs text-purple-700 dark:text-purple-400 font-semibold mb-1 uppercase tracking-wider transition-colors duration-300">Extroversion</div>
                      <div className="text-3xl font-bold text-purple-900 dark:text-purple-300 font-mono transition-colors duration-300">{bigFive.extroversion}</div>
                    </div>
                    <div className="p-4 rounded-lg transition-colors duration-300"
                      style={{
                        background: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(252, 231, 243, 0.6)',
                        border: isDark ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(236, 72, 153, 0.3)'
                      }}>
                      <div className="text-xs text-pink-700 dark:text-pink-400 font-semibold mb-1 uppercase tracking-wider transition-colors duration-300">Agreeableness</div>
                      <div className="text-3xl font-bold text-pink-900 dark:text-pink-300 font-mono transition-colors duration-300">{bigFive.agreeableness}</div>
                    </div>
                    <div className="col-span-2 p-4 rounded-lg transition-colors duration-300"
                      style={{
                        background: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 226, 226, 0.6)',
                        border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                      }}>
                      <div className="text-xs text-red-700 dark:text-red-400 font-semibold mb-1 uppercase tracking-wider transition-colors duration-300">Neuroticism</div>
                      <div className="text-3xl font-bold text-red-900 dark:text-red-300 font-mono transition-colors duration-300">{bigFive.neuroticism}</div>
                    </div>
                  </div>
                </InfoCard>
              )}
            </div>
          )}

          {/* BIOGRAPHY TAB */}
          {activeTab === 'biography' && (
            <div className="p-8 space-y-6">

              {/* Life History */}
              {biography && (
                <InfoCard
                  title="Life History"
                  icon={FaBookOpen}
                  expanded={expandedSections.biography}
                  onToggle={() => toggleSection('biography')}
                  color="blue"
                >
                  <div className="space-y-3 text-sm">
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
                  icon={FaCalendarAlt}
                  expanded={expandedSections.events}
                  onToggle={() => toggleSection('events')}
                  color="green"
                >
                  <div className="space-y-3">
                    {biography.majorEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className="pl-5 py-3 rounded-lg transition-colors duration-300"
                        style={{
                          background: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.05)',
                          borderLeft: isDark ? '4px solid #10b981' : '4px solid #22c55e'
                        }}
                      >
                        <div className="text-xs text-green-700 dark:text-green-400 font-bold mb-1 uppercase tracking-wide transition-colors duration-300">{event.year}</div>
                        <div className="text-sm text-ink-700 dark:text-slate-300 leading-relaxed transition-colors duration-300">{event.event}</div>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              )}

              {/* Secrets */}
              {biography && biography.secrets && Array.isArray(biography.secrets) && biography.secrets.length > 0 && (
                <div className="p-5 rounded-xl shadow-sm transition-colors duration-300"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(254, 243, 199, 0.6) 0%, rgba(253, 230, 138, 0.4) 100%)',
                    border: isDark ? '2px solid rgba(245, 158, 11, 0.4)' : '2px solid rgba(245, 158, 11, 0.4)'
                  }}>
                  <div className="flex items-center gap-3 mb-3">
                    <FaLock className="text-2xl text-amber-700 dark:text-amber-400" />
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
              <div className="p-5 rounded-xl transition-colors duration-300"
                style={{
                  background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 246, 255, 0.6)',
                  border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                <p className="text-xs font-bold mb-2 uppercase tracking-wider text-blue-700 dark:text-blue-400 transition-colors duration-300">
                  Historical Context
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
          width: 12px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDark ? 'rgba(15, 23, 42, 0.3)' : 'rgba(249, 245, 235, 0.5)'};
          border-radius: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark
            ? 'linear-gradient(to bottom, rgba(71, 85, 105, 0.6), rgba(51, 65, 85, 0.4))'
            : 'linear-gradient(to bottom, rgba(217, 199, 171, 0.6), rgba(197, 176, 146, 0.4))'};
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark
            ? 'linear-gradient(to bottom, rgba(71, 85, 105, 0.8), rgba(51, 65, 85, 0.6))'
            : 'linear-gradient(to bottom, rgba(217, 199, 171, 0.8), rgba(197, 176, 146, 0.6))'};
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
}

// InfoCard Component - Collapsible card with colored accents
function InfoCard({ title, icon: Icon, color, children, expanded, onToggle }) {
  const isDark = document.documentElement.classList.contains('dark');

  const colorConfig = {
    blue: {
      bg: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 246, 255, 0.6)',
      border: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.25)',
      text: isDark ? '#93c5fd' : '#1e40af',
      hoverBg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(219, 234, 254, 0.8)'
    },
    purple: {
      bg: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(243, 232, 255, 0.6)',
      border: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.25)',
      text: isDark ? '#e9d5ff' : '#6b21a8',
      hoverBg: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(233, 213, 255, 0.8)'
    },
    green: {
      bg: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(240, 253, 244, 0.6)',
      border: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.25)',
      text: isDark ? '#86efac' : '#15803d',
      hoverBg: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(220, 252, 231, 0.8)'
    },
    amber: {
      bg: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(254, 243, 199, 0.6)',
      border: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.25)',
      text: isDark ? '#fcd34d' : '#92400e',
      hoverBg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(253, 230, 138, 0.8)'
    }
  };

  const colors = colorConfig[color] || colorConfig.blue;

  return (
    <div className="rounded-xl overflow-hidden shadow-sm transition-all duration-300"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`
      }}>
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between transition-all duration-200"
        style={{
          background: expanded ? colors.hoverBg : 'transparent'
        }}
      >
        <div className="flex items-center gap-3">
          <Icon className="text-xl" style={{ color: colors.text }} />
          <h3 className="text-base font-bold uppercase tracking-wide" style={{ color: colors.text }}>
            {title}
          </h3>
        </div>
        {expanded ? (
          <FaChevronUp className="w-4 h-4 transition-transform duration-200" style={{ color: colors.text }} />
        ) : (
          <FaChevronDown className="w-4 h-4 transition-transform duration-200" style={{ color: colors.text }} />
        )}
      </button>
      {expanded && (
        <div className="px-5 pb-5 transition-colors duration-300"
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)'
          }}>
          {children}
        </div>
      )}
    </div>
  );
}

// PropertyRow Component - Label-value pair
function PropertyRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-ink-100 dark:border-slate-700 last:border-0 transition-colors duration-300">
      <span className="text-ink-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider transition-colors duration-300">{label}</span>
      <span className="text-ink-900 dark:text-parchment-100 font-semibold text-right transition-colors duration-300">{value}</span>
    </div>
  );
}
