/**
 * Enhanced Item Modal
 *
 * Production-ready inventory item viewer with:
 * - Fixed dimensions (no height jumping)
 * - High information density with expandable sections
 * - Embedded PDF viewer
 * - Typography matching ActionPanel/InventoryTab standards
 * - Glassomorphic parchment aesthetic
 */

import React, { useState } from 'react';
import { getItemRarity, getItemQuality, getRarityColors, QUALITY_LABELS, RARITY_LABELS } from '../../../core/systems/itemRarity';

export default function ItemModalEnhanced({ isOpen, onClose, item }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [generatingSources, setGeneratingSources] = useState(false);

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

  if (!isOpen || !item) return null;

  // Get rarity/quality data
  const rarity = getItemRarity(item);
  const quality = getItemQuality(item);
  const colors = getRarityColors(rarity);

  // Toggle expandable sections
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Construct PDF path
  const pdfPath = item.pdf ? `/pdfs/${item.pdf}` : null;

  // Try to find historical portrait image
  const itemNameNormalized = item.name.toLowerCase().replace(/[']/g, '').replace(/\s+/g, '');
  const historicalImage = item.image || `/portraits/${itemNameNormalized}.jpg`;

  // Get item icon for decorative background
  const itemIconPath = `/icons/${item.name.toLowerCase().replace(/[']/g, '').replace(/\s+/g, '_')}_icon.png`;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'properties', label: 'Properties', icon: '⚗️' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'sources', label: 'Sources', icon: '📄' }
  ];

  const handleGenerateSources = () => {
    setGeneratingSources(true);
    // Simulate LLM call
    setTimeout(() => {
      setGeneratingSources(false);
      alert('LLM source suggestions would appear here');
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-stone-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >

      {/* Modal Container - FIXED DIMENSIONS */}
      <div
        className="relative w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-elevation-4 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.95) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: '0 24px 80px rgba(61, 47, 36, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >

        {/* Decorative Background Icon - Upper Right */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: '65%',
            height: '80%',
            zIndex: 0,
            overflow: 'hidden',
            maskImage: 'linear-gradient(to bottom, linear-gradient(to left, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0) 100%) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0) 100%)',
          }}
        >
          <img
            src={itemIconPath}
            alt=""
            className="w-full h-full object-contain opacity-70"
            style={{
              transform: 'scale(1.5) translateX(20%) translateY(-15%)',
              mixBlendMode: 'multiply',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 p-2 rounded-lg transition-all duration-150 hover:bg-ink-100"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(209, 213, 219, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="#3d2817" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tab Navigation */}
        <div className="flex-shrink-0 flex border-b relative z-10" style={{
          background: 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
          borderColor: 'rgba(209, 213, 219, 0.3)'
        }}>
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative font-sans"
              style={{
                fontWeight: activeTab === tab.id ? 700 : 600,
                letterSpacing: '0.08em',
                color: activeTab === tab.id ? colors.primary : '#6b5a47',
                background: activeTab === tab.id
                  ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))'
                  : 'transparent',
                borderLeft: idx > 0 ? '1px solid rgba(209, 213, 219, 0.2)' : 'none'
              }}
            >
              <span className="mr-2 text-base" style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: `linear-gradient(to right, ${colors.light}, ${colors.primary}, ${colors.light})`
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area - FIXED HEIGHT with scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10" style={{
          background: 'rgba(252, 250, 247, 0.4)'
        }}>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="p-8 space-y-6">

              {/* Hero Section */}
              <div className="flex gap-6">
                {/* Image */}
                <div
                  className="w-56 h-56 rounded-xl overflow-hidden flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                    border: '2px solid rgba(209, 213, 219, 0.3)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <img
                    src={historicalImage}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="w-full h-full items-center justify-center text-8xl"
                    style={{ display: 'none' }}
                  >
                    {item.emoji || '📦'}
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0 ">
                  {/* Name */}
                  <h1
                    className="text-5xl font-bold mb-3 leading-tight font-serif text-ink-900"
                    style={{
                      letterSpacing: '-0.02em',
                      lineHeight: '1.1'
                    }}
                  >
                    {item.name}  {item.quantity && (
                      <span
                        className="px-2 py-2 rounded-lg text-sm mb-3 font-bold font-sans"
                        style={{
                          background: 'rgba(245, 238, 223, 0.7)',
                          color: '#5c4a3a',
                          border: '1px solid rgba(209, 213, 219, 0.3)'
                        }}
                      >
                        In Stock: {item.quantity}
                      </span>
                    )}
                  </h1>



                  {/* Latin & Spanish */}
                  <div className="space-y-1 mb-4">
                    {item.latinName && (
                      <p className="text-lg italic font-serif text-ink-700" style={{ fontWeight: 500 }}>
                        {item.latinName}
                      </p>
                    )}
                    {item.spanishName && (
                      <p className="text-sm font-sans text-ink-600" style={{ fontWeight: 500 }}>
                        En español: <span style={{ fontWeight: 600 }}>{item.spanishName}</span>
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-sans"
                      style={{
                        background: `linear-gradient(135deg, ${colors.light}, ${colors.primary})`,
                        color: 'white',
                        boxShadow: `0 2px 8px ${colors.glow}, inset 0 1px 2px rgba(255, 255, 255, 0.3)`
                      }}
                    >
                      {RARITY_LABELS[rarity]}
                    </span>
                    {quality !== 'standard' && (
                      <span
                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-sans"
                        style={{
                          background: 'linear-gradient(135deg, #c084fc, #a855f7)',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(168, 85, 247, 0.5)'
                        }}
                      >
                        {QUALITY_LABELS[quality]}
                      </span>
                    )}
                    <span
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-sans"
                      style={{
                        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(245, 158, 11, 0.1))',
                        color: '#92400e',
                        border: '1px solid rgba(217, 119, 6, 0.25)'
                      }}
                    >
                      {item.price} Reales
                    </span>
                   
                  </div>

                  {/* Description */}
                  <p
                    className="text-base leading-relaxed font-serif text-ink-900"
                    style={{
                      lineHeight: '1.6',
                      fontSize: '1.35rem'
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-4">

                {/* Humoral Qualities */}
                {item.humoralQualities && (
                  <InfoCard
                    title="Humoral Qualities"
              
                    color="#3b82f6"
                    expanded={expandedSections.overview_humoral}
                    onToggle={() => toggleSection('overview_humoral')}
                  >
                    <p className="text-2xl font-bold mb-2 font-serif" style={{ color: '#1e3a8a' }}>
                      {item.humoralQualities}
                    </p>
                    <p className="text-sm leading-relaxed font-sans text-ink-700" style={{ lineHeight: '1.6' }}>
                      {expandedSections.overview_humoral
                        ? "According to Galenic humoral theory, these qualities determine how this substance interacts with the body's four humors: blood (hot & moist), phlegm (cold & moist), yellow bile (hot & dry), and black bile (cold & dry). Physicians prescribe remedies to restore balance."
                        : "According to Galenic humoral theory, these qualities determine how this substance interacts with the body's four humors..."}
                    </p>
                  </InfoCard>
                )}

                {/* Medicinal Effects */}
                {item.medicinalEffects && (
                  <InfoCard
                    title="Medicinal Effects"
                    
                    color="#10b981"
                    expanded={expandedSections.overview_effects}
                    onToggle={() => toggleSection('overview_effects')}
                  >
                    <p className="text-lg leading-relaxed font-serif text-ink-900" style={{ lineHeight: '1.7' }}>
                      {item.medicinalEffects}
                    </p>
                  </InfoCard>
                )}
              </div>

              {/* Provenance & Trade */}
              <InfoCard
                title="Provenance & Trade Routes"

                color="#8b5cf6"
                expanded={expandedSections.overview_provenance}
                onToggle={() => toggleSection('overview_provenance')}
              >
                <p className="text-md leading-relaxed mb-3 font-sans text-ink-900" style={{ lineHeight: '1.7' }}>
                  {expandedSections.overview_provenance
                    ? "In 1680 New Spain, this substance arrived through complex global trade networks. Most exotic materia medica entered Mexico City via the Manila Galleon trade route from the Philippines, or through Spanish shipping from Seville and Cádiz. Local apothecaries also sourced indigenous plants and minerals from regional markets, creating a unique pharmacopeia blending European, Asian, African, and Mesoamerican medical traditions."
                    : "In 1680 New Spain, this substance arrived through complex global trade networks. Most exotic materia medica entered Mexico City via the Manila Galleon trade route..."}
                </p>
                {expandedSections.overview_provenance && (
                  <div
                    className="rounded-lg p-3 text-lg font-sans text-ink-800"
                    style={{
                      background: 'rgba(139, 92, 46, 0.08)',
                      border: '1px solid rgba(139, 92, 46, 0.15)',
                      lineHeight: '1.6'
                    }}
                  >
                    <strong>Typical Trade Route:</strong> Manila → Acapulco (Manila Galleon) → Overland to Mexico City →
                    Distribution to apothecaries via merchants in the Plaza Mayor
                  </div>
                )}
              </InfoCard>

              {/* Further Reading */}
              <div
                className="rounded-xl p-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.05))',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}
              >
                <p className="text-xs font-bold mb-2 uppercase tracking-wider font-sans text-emerald-800" style={{ letterSpacing: '0.08em' }}>
                  💡 Further Reading
                </p>
                <p className="text-sm leading-relaxed font-sans text-emerald-700" style={{ lineHeight: '1.6' }}>
                  For more on early modern materia medica, consult <em>London Dispensatory</em> (1618),
                  <em>Pharmacopoeia Londinensis</em> (1677), or <em>Erário Mineral</em> by Luís Gomes Ferreira (1735).
                </p>
              </div>
            </div>
          )}

          {/* PROPERTIES TAB */}
          {activeTab === 'properties' && (
            <div className="p-8 space-y-6">

              {/* Centered Item Icon */}
              <div className="flex justify-center mb-8">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    width: '200px',
                    height: '200px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                    border: '2px solid rgba(209, 213, 219, 0.3)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <img
                    src={itemIconPath}
                    alt={item.name}
                    className="w-full h-full object-contain p-6"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full items-center justify-center text-6xl hidden">
                    {item.emoji || '📦'}
                  </div>
                </div>
              </div>

              <PropertySection
                title="Humoral Theory"
                expanded={expandedSections.prop_humoral}
                onToggle={() => toggleSection('prop_humoral')}
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2 font-sans text-ink-600">
                      Primary Qualities
                    </p>
                    <p className="text-2xl font-bold font-serif" style={{ color: '#1e3a8a' }}>
                      {item.humoralQualities}
                    </p>
                  </div>
                  <p className="text-base leading-relaxed font-serif text-ink-900" style={{ lineHeight: '1.8' }}>
                    The theory of the four humors—blood, phlegm, yellow bile, and black bile—forms the foundation
                    of Galenic medicine. Each humor possesses a combination of hot/cold and moist/dry qualities.
                    Disease results from humoral imbalance, and treatment involves administering substances with
                    opposing qualities to restore equilibrium.
                  </p>
                  {expandedSections.prop_humoral && (
                    <div className="rounded-lg p-5" style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.15)'
                    }}>
                      <p className="text-sm font-semibold mb-2 font-serif" style={{ color: '#1e40af' }}>
                        Clinical Application:
                      </p>
                      <p className="text-base font-serif text-ink-700" style={{ lineHeight: '1.8' }}>
                        This substance would be prescribed to counteract conditions manifesting the opposite qualities.
                        For example, a "cold & dry" remedy treats ailments characterized by excess heat and moisture.
                      </p>
                    </div>
                  )}
                </div>
              </PropertySection>

              <PropertySection
                title="Medicinal Actions"
                expanded={expandedSections.prop_effects}
                onToggle={() => toggleSection('prop_effects')}
              >
                <p className="text-base leading-relaxed mb-4 font-serif text-ink-900" style={{ lineHeight: '1.8' }}>
                  {item.medicinalEffects}
                </p>
                {expandedSections.prop_effects && (
                  <>
                    <div className="rounded-lg p-5 mb-4" style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.15)'
                    }}>
                      <p className="text-sm font-bold mb-3 font-serif text-emerald-800">
                        Common Preparations
                      </p>
                      <ul className="space-y-2 text-base font-serif text-emerald-900">
                        <li>• <strong>Decoction:</strong> Boiled in water or wine to extract virtues</li>
                        <li>• <strong>Distillation:</strong> Essence extracted via alembic</li>
                        <li>• <strong>Confection:</strong> Mixed with sugar or honey for palatability</li>
                        <li>• <strong>Topical:</strong> Applied directly to affected areas</li>
                      </ul>
                    </div>
                    <p className="text-sm italic font-serif text-ink-600" style={{ lineHeight: '1.7' }}>
                      Dosage and administration should follow the guidance of a learned physician.
                      Many substances possess both curative and toxic properties depending on quantity.
                    </p>
                  </>
                )}
              </PropertySection>

              <PropertySection
                title="Pharmaceutical Forms"
                expanded={expandedSections.prop_forms}
                onToggle={() => toggleSection('prop_forms')}
              >
                <p className="text-base leading-relaxed font-serif text-ink-900" style={{ lineHeight: '1.8' }}>
                  This materia medica can be processed into various pharmaceutical forms: simple decoctions,
                  distilled waters, electuaries (confections), syrups, oils, and tinctures. The choice of
                  preparation method depends on the intended therapeutic effect and the patient's constitution.
                </p>
                {expandedSections.prop_forms && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {['Decoct', 'Distill', 'Confection', 'Calcinate'].map(method => (
                      <span key={method} className="px-3 py-1.5 rounded-lg text-sm font-semibold font-serif" style={{
                        background: 'rgba(139, 92, 46, 0.1)',
                        color: '#5c4a3a'
                      }}>
                        {method}
                      </span>
                    ))}
                  </div>
                )}
              </PropertySection>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="p-8 space-y-5">
              <PropertySection
                title="Historical Context"
                expanded={expandedSections.hist_context}
                onToggle={() => toggleSection('hist_context')}
              >
                <p className="text-sm leading-relaxed mb-3 font-serif text-ink-900" style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                  {item.description}
                </p>
                {expandedSections.hist_context && (
                  <p className="text-sm leading-relaxed font-sans text-ink-700" style={{ lineHeight: '1.7' }}>
                    By 1680, Mexico City had become one of the world's great centers of pharmaceutical knowledge,
                    drawing on European, Indigenous Mesoamerican, African, and Asian medical traditions. The city's
                    apothecaries served a diverse population and had access to an extraordinarily rich pharmacopeia.
                  </p>
                )}
              </PropertySection>

              <PropertySection
                title="Knowledge Traditions"
                expanded={expandedSections.hist_knowledge}
                onToggle={() => toggleSection('hist_knowledge')}
              >
                <div className="space-y-3">
                  <div className="rounded-lg p-4" style={{
                    background: 'rgba(217, 119, 6, 0.08)',
                    border: '1px solid rgba(217, 119, 6, 0.15)'
                  }}>
                    <p className="text-sm font-bold mb-1 font-sans" style={{ color: '#92400e' }}>
                      Galenic Medicine (European)
                    </p>
                    <p className="text-sm font-sans" style={{ color: '#78350f', lineHeight: '1.6' }}>
                      Part of the classical materia medica described by Dioscorides, Galen, and Avicenna.
                      Prescribed according to humoral theory to restore bodily balance.
                    </p>
                  </div>
                  {expandedSections.hist_knowledge && (
                    <>
                      <div className="rounded-lg p-4" style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.15)'
                      }}>
                        <p className="text-sm font-bold mb-1 font-sans" style={{ color: '#065f46' }}>
                          Indigenous Mesoamerican
                        </p>
                        <p className="text-sm font-sans" style={{ color: '#047857', lineHeight: '1.6' }}>
                          Local curanderos and ticitls possessed extensive knowledge of regional flora and fauna,
                          documented in codices like the Badianus Manuscript.
                        </p>
                      </div>
                      <div className="rounded-lg p-4" style={{
                        background: 'rgba(139, 92, 246, 0.08)',
                        border: '1px solid rgba(139, 92, 246, 0.15)'
                      }}>
                        <p className="text-sm font-bold mb-1 font-sans" style={{ color: '#5b21b6' }}>
                          Chinese Medicine (via Manila Galleon)
                        </p>
                        <p className="text-sm font-sans" style={{ color: '#6b21a8', lineHeight: '1.6' }}>
                          Asian medicinal knowledge and substances arrived regularly through the trans-Pacific
                          trade route, introducing concepts like qi and yin-yang balance.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </PropertySection>
            </div>
          )}

          {/* SOURCES TAB */}
          {activeTab === 'sources' && (
            <div className="h-full flex flex-col">
              {pdfPath ? (
                <>
                  {/* PDF Viewer */}
                  <div className="flex-1 p-4">
                    <iframe
                      src={pdfPath}
                      className="w-full h-full rounded-lg"
                      style={{
                        border: '2px solid rgba(209, 213, 219, 0.3)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                      }}
                      title="Historical source document"
                    />
                  </div>
                  {/* Citation Bar */}
                  <div
                    className="flex-shrink-0 p-5 border-t"
                    style={{
                      background: 'linear-gradient(to top, rgba(250, 245, 235, 0.95), rgba(248, 246, 241, 0.9))',
                      borderColor: 'rgba(209, 213, 219, 0.3)'
                    }}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider mb-2 font-sans text-ink-600">
                      📚 Citation
                    </p>
                    <p className="text-sm leading-relaxed font-serif text-ink-900" style={{ lineHeight: '1.6' }}>
                      {item.citation || 'Historical source document'}
                    </p>
                  </div>
                </>
              ) : (
                /* No PDF Available - LLM Suggestion */
                <div className="flex-1 flex items-center justify-center p-8">
                  <div
                    className="max-w-md text-center rounded-2xl p-8"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.05))',
                      border: '2px dashed rgba(59, 130, 246, 0.25)'
                    }}
                  >
                    <div className="text-5xl mb-4">📚</div>
                    <h3 className="text-xl font-bold mb-3 font-serif text-blue-900">
                      No Primary Source Available
                    </h3>
                    <p className="text-sm leading-relaxed mb-5 font-sans text-ink-700" style={{ lineHeight: '1.6' }}>
                      We don't have a digitized historical document for this item yet.
                      Would you like to generate scholarly source suggestions?
                    </p>
                    <button
                      onClick={handleGenerateSources}
                      disabled={generatingSources}
                      className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 font-sans"
                      style={{
                        background: generatingSources
                          ? 'rgba(59, 130, 246, 0.5)'
                          : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        boxShadow: generatingSources
                          ? 'none'
                          : '0 4px 12px rgba(59, 130, 246, 0.3)',
                        border: '1px solid rgba(37, 99, 235, 0.5)',
                        cursor: generatingSources ? 'wait' : 'pointer'
                      }}
                    >
                      {generatingSources ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Consulting archives...
                        </span>
                      ) : (
                        '🤖 Generate Source Suggestions'
                      )}
                    </button>
                  </div>
                </div>
              )}
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
          background: rgba(245, 238, 223, 0.5);
          border-radius: 5px;
          margin: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(139, 92, 46, 0.3), rgba(139, 92, 46, 0.4));
          border-radius: 5px;
          border: 2px solid rgba(245, 238, 223, 0.5);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(139, 92, 46, 0.5), rgba(139, 92, 46, 0.6));
        }
      `}</style>
    </div>
  );
}

// Info Card with Preview & Expand
function InfoCard({ title, icon, color, children, expanded, onToggle }) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
        border: `1.5px solid ${color}20`,
        boxShadow: expanded
          ? `0 6px 20px ${color}15, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
          : '0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
      }}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between transition-all duration-150"
        style={{
          background: expanded ? `${color}08` : 'transparent'
        }}
      >
        <div className="flex items-center gap-2.5">
          
          <h3
            className="text-sm font-semibold uppercase tracking-widest font-sans"
            style={{
              color: color,
              letterSpacing: '0.08em'
            }}
          >
            {title}
          </h3>
        </div>
        <svg
          className="w-4 h-4 transition-transform duration-200"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            color: color
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="px-4 pb-4">
        {children}
      </div>
    </div>
  );
}

// Property Section for Properties/History tabs
function PropertySection({ title, children, expanded, onToggle }) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
        border: '1.5px solid rgba(209, 213, 219, 0.3)',
        boxShadow: expanded
          ? '0 6px 20px rgba(139, 92, 46, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
          : '0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
      }}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between transition-all duration-150"
        style={{
          background: expanded ? 'rgba(139, 92, 46, 0.05)' : 'transparent'
        }}
      >
        <h3 className="text-xl font-bold font-serif text-ink-900" style={{ letterSpacing: '-0.01em' }}>
          {title}
        </h3>
        <svg
          className="w-5 h-5 transition-transform duration-200"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            color: '#6b5a47'
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="px-6 pb-6">
        {children}
      </div>
    </div>
  );
}
