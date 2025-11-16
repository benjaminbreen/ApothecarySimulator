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

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getItemRarity, getItemQuality, getRarityColors, QUALITY_LABELS, RARITY_LABELS } from '../../../core/systems/itemRarity';
import MedicineTypeBadge from '../../../components/MedicineTypeBadge';
import { calculatePrescriptionOutcome } from '../../medical/utils/prescriptionCalculator.mjs';
import { createChatCompletion } from '../../../core/services/llmService';
import ReactMarkdown from 'react-markdown';
import { toTitleCase } from '../../../utils/textUtils';
import { initialInventoryData } from '../../../initialInventory';

// Cache for generated sources (persists during playthrough, cleared on page refresh)
const sourcesCache = new Map();

// Rarity tooltip descriptions
const RARITY_TOOLTIPS = {
  common: "Widely available items found in most markets (< 8 reales)",
  scarce: "Less common items requiring some effort to obtain (8-19 reales)",
  rare: "Difficult to find items from specialized suppliers (20-39 reales)",
  legendary: "Extremely rare items of exceptional value (40+ reales)"
};

const QUALITY_TOOLTIPS = {
  high_quality: "Superior preparation with enhanced properties (2x value multiplier)",
  exceptional: "Masterwork quality with optimal potency (3x value multiplier)"
};

// Common symptoms for effectiveness testing
const COMMON_SYMPTOMS = [
  { name: 'fever', description: 'Hot condition (excess heat)' },
  { name: 'chills', description: 'Cold condition (deficient heat)' },
  { name: 'headache', description: 'Hot condition (blood excess)' },
  { name: 'cough with phlegm', description: 'Moist condition (phlegm excess)' },
  { name: 'dry cough', description: 'Dry condition (moisture deficiency)' },
  { name: 'constipation', description: 'Dry condition (bowel dryness)' },
  { name: 'diarrhea', description: 'Moist condition (bowel flux)' },
  { name: 'anxiety', description: 'Hot & dry (yellow bile excess)' },
  { name: 'wound', description: 'Hot & moist (blood imbalance)' },
  { name: 'inflammation', description: 'Hot condition (excess heat)' }
];

export default function ItemModalEnhanced({ isOpen, onClose, item, initialTab = 'overview', onOpenLedger }) {
  // Safety check: Ensure item has preparationAdvice by looking it up from initialInventoryData
  const itemWithAdvice = useMemo(() => {
    if (!item) return null;

    // If item already has preparationAdvice, use it
    if (item.preparationAdvice) {
      return item;
    }

    // Otherwise, look it up from initialInventoryData by name
    const templateItem = initialInventoryData.find(
      template => template.name.toLowerCase() === item.name.toLowerCase()
    );

    if (templateItem?.preparationAdvice) {
      console.log(`[ItemModalEnhanced] Restored preparationAdvice for ${item.name}`);
      return { ...item, preparationAdvice: templateItem.preparationAdvice };
    }

    // If still not found, return original item (will show fallback)
    return item;
  }, [item]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedSections, setExpandedSections] = useState({
    prop_effects: true,  // Medicinal Actions default open
    prop_effectiveness: true  // Treatment Effectiveness default open
  });

  // Reset to initial tab when modal opens or initialTab changes
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [generatingSources, setGeneratingSources] = useState(false);
  const [generatedSources, setGeneratedSources] = useState(null); // Stores LLM-generated source suggestions
  const [hoveredBadge, setHoveredBadge] = useState(null); // 'rarity' or 'quality'
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const rarityBadgeRef = useRef(null);
  const qualityBadgeRef = useRef(null);

  // Calculate tooltip position when hovering
  useEffect(() => {
    if (hoveredBadge && (hoveredBadge === 'rarity' ? rarityBadgeRef.current : qualityBadgeRef.current)) {
      const ref = hoveredBadge === 'rarity' ? rarityBadgeRef : qualityBadgeRef;
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setTooltipPosition({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2
        });
      }
    }
  }, [hoveredBadge]);

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

  // Load cached sources when item changes
  React.useEffect(() => {
    if (itemWithAdvice?.name && sourcesCache.has(itemWithAdvice.name)) {
      setGeneratedSources(sourcesCache.get(itemWithAdvice.name));
    } else {
      setGeneratedSources(null);
    }
  }, [itemWithAdvice?.name]);

  // Memoize effectiveness calculations to prevent recalculating on every render
  // MUST be before early return to satisfy Rules of Hooks
  const effectivenessResults = useMemo(() => {
    // Only calculate when effectiveness section is expanded and modal is open
    if (!isOpen || !itemWithAdvice || !expandedSections.prop_effectiveness) return [];

    const mockPatient = { name: 'Test', symptoms: [] };
    const results = COMMON_SYMPTOMS.map(symptom => {
      try {
        mockPatient.symptoms = [{ name: symptom.name, severity: 'moderate' }];
        const result = calculatePrescriptionOutcome({
          item: itemWithAdvice,
          patient: mockPatient,
          route: 'Oral',
          amount: 1,
          playerSkills: null
        });
        return {
          symptom: symptom.name,
          description: symptom.description,
          effectiveness: result.effectiveness,
          outcome: result.outcome,
          humoralScore: result.breakdown.humoralScore,
          explanations: result.breakdown.humoralExplanations
        };
      } catch (error) {
        console.error('[ItemModal] Failed to calculate effectiveness for', symptom.name, error);
        return {
          symptom: symptom.name,
          description: symptom.description,
          effectiveness: 0,
          outcome: 'unknown',
          humoralScore: 0,
          explanations: []
        };
      }
    });

    // Sort by effectiveness (highest first)
    results.sort((a, b) => b.effectiveness - a.effectiveness);
    return results;
  }, [itemWithAdvice, expandedSections.prop_effectiveness, isOpen]);

  // Conditionally define tabs - hide Sources tab for personal items
  // MUST be before early return to satisfy Rules of Hooks
  const tabs = useMemo(() => {
    if (!itemWithAdvice) return [];

    const baseTabs = [
      { id: 'overview', label: 'Overview', icon: '📋' },
      { id: 'properties', label: 'Properties', icon: '⚗️' },
      { id: 'history', label: 'History', icon: '📜' }
    ];

    // Only show Sources tab for materia medica (not personal items)
    if (itemWithAdvice.type !== 'personal') {
      baseTabs.push({ id: 'sources', label: 'Sources', icon: '📄' });
    }

    return baseTabs;
  }, [itemWithAdvice]);

  // Early return AFTER all hooks
  if (!isOpen || !itemWithAdvice) return null;

  // Get rarity/quality data
  const rarity = getItemRarity(itemWithAdvice);
  const quality = getItemQuality(itemWithAdvice);
  const colors = getRarityColors(rarity);

  // Toggle expandable sections
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Construct PDF path
  const pdfPath = itemWithAdvice.pdf ? `/pdfs/${itemWithAdvice.pdf}` : null;

  // Try to find historical portrait image
  const itemNameNormalized = itemWithAdvice.name.toLowerCase().replace(/[']/g, '').replace(/\s+/g, '');
  const historicalImage = itemWithAdvice.image || `/portraits/${itemNameNormalized}.jpg`;

  // Get item icon for decorative background
  const itemIconPath = `/icons/${itemWithAdvice.name.toLowerCase().replace(/[']/g, '').replace(/\s+/g, '_')}_icon.png`;

  const handleGenerateSources = async () => {
    setGeneratingSources(true);

    try {
      const prompt = [
        {
          role: 'system',
          content: `You are a scholarly research assistant specializing in early modern European and colonial Latin American medical history, with expertise in pharmacology and material culture from 1600-1700.`
        },
        {
          role: 'user',
          content: `Generate concise scholarly source suggestions for researching this materia medica used in 1680 Mexico City:

**Item**: ${itemWithAdvice.name} ${itemWithAdvice.latinName ? `(${itemWithAdvice.latinName})` : ''}
**Properties**: ${itemWithAdvice.humoralQualities || 'Not specified'}

Provide 2-3 key sources per category:
1. **Primary Sources (1500-1700)**: Historical herbals, pharmacopoeias, medical texts
2. **Secondary Scholarship**: Modern academic books/articles (realistic authors/titles)
3. **Archives & Digital**: Relevant collections and databases (only real resources)

Format as markdown. Be specific but concise - aim for 200-300 words total. Only suggest plausible sources.`
        }
      ];

      const response = await createChatCompletion(
        prompt,
        0.7, // temperature
        800, // maxTokens (reduced for concise output)
        null, // no JSON format needed
        { feature: 'source_suggestions', item: itemWithAdvice.name }
      );

      console.log('[ItemModal] Generated sources:', response);
      // Extract content from API response (choices[0].message.content)
      const content = response.choices?.[0]?.message?.content || response.content || 'No content generated';

      // Cache the generated sources for this playthrough
      if (itemWithAdvice?.name) {
        sourcesCache.set(itemWithAdvice.name, content);
        console.log('[ItemModal] Cached sources for:', itemWithAdvice.name);
      }

      setGeneratedSources(content);
    } catch (error) {
      console.error('[ItemModal] Failed to generate sources:', error);
      setGeneratedSources('**Error**: Unable to generate source suggestions. Please try again.');
    } finally {
      setGeneratingSources(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-stone-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >

      {/* Modal Container - Responsive: Full screen on mobile */}
      <div
        className="relative w-full max-w-full sm:max-w-5xl h-screen sm:h-[85vh] rounded-none sm:rounded-2xl overflow-hidden flex flex-col shadow-elevation-4 transition-all duration-300"
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
              className="flex-1 px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 relative font-sans"
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
                    alt={itemWithAdvice.name}
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
                    {itemWithAdvice.emoji || '📦'}
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0 ">
                  {/* Name and Medicine Type Badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <h1
                      className="text-5xl font-bold leading-tight font-serif text-ink-900"
                      style={{
                        letterSpacing: '-0.02em',
                        lineHeight: '1.1'
                      }}
                    >
                      {toTitleCase(itemWithAdvice.name)}
                    </h1>
                    <MedicineTypeBadge
                      item={itemWithAdvice}
                      size="medium"
                      position="inline"
                      showTooltip={true}
                    />
                    {itemWithAdvice.quantity && (
                      <span
                        className="px-2 py-2 rounded-lg text-sm font-bold font-sans"
                        style={{
                          background: 'rgba(245, 238, 223, 0.7)',
                          color: '#5c4a3a',
                          border: '1px solid rgba(209, 213, 219, 0.3)'
                        }}
                      >
                        In Stock: {itemWithAdvice.quantity}
                      </span>
                    )}
                  </div>

                  {/* Special: Account Book - Link to Ledger */}
                  {itemWithAdvice.name === 'Account Book' && onOpenLedger && (
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          onOpenLedger();
                          onClose();
                        }}
                        className="px-4 py-2.5 rounded-lg font-sans font-semibold text-sm transition-all duration-200 flex items-center gap-2 hover:shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
                          color: 'white',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Open Financial Ledger
                      </button>
                      <p className="text-xs text-ink-500 mt-2 font-sans italic">
                        View your complete transaction history, income, and expenses
                      </p>
                    </div>
                  )}

                  {/* Latin & Spanish */}
                  <div className="space-y-1 mb-4">
                    {itemWithAdvice.latinName && (
                      <p className="text-lg italic font-serif text-ink-700" style={{ fontWeight: 500 }}>
                        {itemWithAdvice.latinName}
                      </p>
                    )}
                    {itemWithAdvice.spanishName && (
                      <p className="text-sm font-sans text-ink-600" style={{ fontWeight: 500 }}>
                        En español: <span style={{ fontWeight: 600 }}>{itemWithAdvice.spanishName}</span>
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span
                      ref={rarityBadgeRef}
                      onMouseEnter={() => setHoveredBadge('rarity')}
                      onMouseLeave={() => setHoveredBadge(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-sans cursor-help transition-all duration-200"
                      style={{
                        background: `linear-gradient(135deg, ${colors.light}, ${colors.primary})`,
                        color: 'white',
                        boxShadow: hoveredBadge === 'rarity'
                          ? `0 4px 12px ${colors.glow}, inset 0 1px 2px rgba(255, 255, 255, 0.3)`
                          : `0 2px 8px ${colors.glow}, inset 0 1px 2px rgba(255, 255, 255, 0.3)`,
                        transform: hoveredBadge === 'rarity' ? 'scale(1.05)' : 'scale(1)'
                      }}
                    >
                      {RARITY_LABELS[rarity]}
                    </span>
                    {quality !== 'standard' && (
                      <span
                        ref={qualityBadgeRef}
                        onMouseEnter={() => setHoveredBadge('quality')}
                        onMouseLeave={() => setHoveredBadge(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-sans cursor-help transition-all duration-200"
                        style={{
                          background: 'linear-gradient(135deg, #c084fc, #a855f7)',
                          color: 'white',
                          boxShadow: hoveredBadge === 'quality'
                            ? '0 4px 12px rgba(168, 85, 247, 0.7)'
                            : '0 2px 8px rgba(168, 85, 247, 0.5)',
                          transform: hoveredBadge === 'quality' ? 'scale(1.05)' : 'scale(1)'
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
                      {itemWithAdvice.price} Reales
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
                    {itemWithAdvice.description}
                  </p>
                </div>
              </div>

              {/* Information Grid - Only show for materia medica (not personal items) */}
              {itemWithAdvice.type !== 'personal' && (
              <div className="grid grid-cols-2 gap-4">

                {/* Humoral Qualities */}
                {itemWithAdvice.humoralQualities && (
                  <InfoCard
                    title="Humoral Qualities"

                    color="#3b82f6"
                    expanded={expandedSections.overview_humoral}
                    onToggle={() => toggleSection('overview_humoral')}
                  >
                    <p className="text-2xl font-bold mb-2 font-serif" style={{ color: '#1e3a8a' }}>
                      {itemWithAdvice.humoralQualities}
                    </p>
                    <p className="text-sm leading-relaxed font-sans text-ink-700" style={{ lineHeight: '1.6' }}>
                      {expandedSections.overview_humoral
                        ? "According to Galenic humoral theory, these qualities determine how this substance interacts with the body's four humors: blood (hot & moist), phlegm (cold & moist), yellow bile (hot & dry), and black bile (cold & dry). Physicians prescribe remedies to restore balance."
                        : "According to Galenic humoral theory, these qualities determine how this substance interacts with the body's four humors..."}
                    </p>
                  </InfoCard>
                )}

                {/* Medicinal Effects */}
                {itemWithAdvice.medicinalEffects && (
                  <InfoCard
                    title="Medicinal Effects"

                    color="#10b981"
                    expanded={expandedSections.overview_effects}
                    onToggle={() => toggleSection('overview_effects')}
                  >
                    <p className="text-lg leading-relaxed font-serif text-ink-900" style={{ lineHeight: '1.7' }}>
                      {itemWithAdvice.medicinalEffects}
                    </p>
                  </InfoCard>
                )}
              </div>
              )}

              {/* Provenance & Trade - Only show for materia medica (not personal items) */}
              {itemWithAdvice.type !== 'personal' && (
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
              )}

              {/* Further Reading - Only show for materia medica (not personal items) */}
              {itemWithAdvice.type !== 'personal' && (
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
              )}
            </div>
          )}

          {/* PROPERTIES TAB */}
          {activeTab === 'properties' && (
            <div className="p-6 space-y-3">

              {/* Centered Item Icon */}
              <div className="flex justify-center mb-4">
                <div
                  className="rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500"
                  style={{
                    width: '200px',
                    height: '200px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                    border: '2px solid rgba(209, 213, 219, 0.3)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(252, 250, 247, 0.95))';
                    e.currentTarget.style.backdropFilter = 'blur(20px) saturate(180%)';
                    e.currentTarget.style.WebkitBackdropFilter = 'blur(20px) saturate(180%)';
                    e.currentTarget.style.boxShadow = `0 16px 48px ${colors.glow}, 0 8px 24px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.8)`;
                    e.currentTarget.style.border = `2px solid ${colors.light}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))';
                    e.currentTarget.style.backdropFilter = 'none';
                    e.currentTarget.style.WebkitBackdropFilter = 'none';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)';
                    e.currentTarget.style.border = '2px solid rgba(209, 213, 219, 0.3)';
                  }}
                >
                  <img
                    src={itemIconPath}
                    alt={itemWithAdvice.name}
                    className="w-full h-full object-contain p-6 transition-all duration-500 group-hover:scale-125"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.filter = `drop-shadow(0 0 20px ${colors.glow}) drop-shadow(0 0 40px ${colors.primary}40)`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full items-center justify-center text-6xl hidden">
                    {itemWithAdvice.emoji || '📦'}
                  </div>
                </div>
              </div>

              {/* Materia medica-specific sections - hide for personal items */}
              {itemWithAdvice.type !== 'personal' && (
              <>
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
                      {itemWithAdvice.humoralQualities}
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
                  {itemWithAdvice.medicinalEffects}
                </p>
                {expandedSections.prop_effects && (
                  <>
                    <div className="rounded-lg p-5 mb-4" style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.15)'
                    }}>
                      <p className="text-sm font-bold mb-3 font-serif text-emerald-800">
                        Preparation Methods
                      </p>
                      {itemWithAdvice.preparationAdvice ? (
                        <ul className="space-y-2 text-base font-serif text-emerald-900">
                          <li>• <strong>Decoction:</strong> {itemWithAdvice.preparationAdvice.decoction}</li>
                          <li>• <strong>Distillation:</strong> {itemWithAdvice.preparationAdvice.distillation}</li>
                          <li>• <strong>Calcination:</strong> {itemWithAdvice.preparationAdvice.calcination}</li>
                          <li>• <strong>Confection:</strong> {itemWithAdvice.preparationAdvice.confection}</li>
                        </ul>
                      ) : (
                        <ul className="space-y-2 text-base font-serif text-emerald-900">
                          <li>• <strong>Decoction:</strong> Boiled in water or wine to extract virtues</li>
                          <li>• <strong>Distillation:</strong> Essence extracted via alembic</li>
                          <li>• <strong>Confection:</strong> Mixed with sugar or honey for palatability</li>
                          <li>• <strong>Calcination:</strong> Burned to ash for mineral salts</li>
                        </ul>
                      )}
                    </div>
                    <p className="text-sm italic font-serif text-ink-600" style={{ lineHeight: '1.7' }}>
                      Dosage and administration should follow the guidance of a learned physician.
                      Many substances possess both curative and toxic properties depending on quantity.
                    </p>
                  </>
                )}
              </PropertySection>

              <PropertySection
                title="Treatment Effectiveness Guide"
                expanded={expandedSections.prop_effectiveness ?? true}
                onToggle={() => toggleSection('prop_effectiveness')}
              >
                <p className="text-base leading-relaxed mb-4 font-serif text-ink-900" style={{ lineHeight: '1.8' }}>
                  Based on humoral theory, this remedy's effectiveness varies by condition. Higher percentages
                  indicate better humoral matching according to Galenic principles.
                </p>
                {expandedSections.prop_effectiveness && effectivenessResults.length > 0 && (
                    <div className="space-y-3">
                      {effectivenessResults.map((result, idx) => {
                        const getEffectivenessColor = (eff) => {
                          if (eff >= 60) return { bg: 'rgba(22, 163, 74, 0.1)', text: '#15803d', border: 'rgba(22, 163, 74, 0.2)' };
                          if (eff >= 40) return { bg: 'rgba(234, 179, 8, 0.1)', text: '#ca8a04', border: 'rgba(234, 179, 8, 0.2)' };
                          if (eff >= 20) return { bg: 'rgba(249, 115, 22, 0.1)', text: '#c2410c', border: 'rgba(249, 115, 22, 0.2)' };
                          return { bg: 'rgba(220, 38, 38, 0.1)', text: '#991b1b', border: 'rgba(220, 38, 38, 0.2)' };
                        };

                        const colors = getEffectivenessColor(result.effectiveness);

                        return (
                          <div
                            key={idx}
                            className="rounded-lg p-3"
                            style={{
                              background: colors.bg,
                              border: `1px solid ${colors.border}`
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="font-bold text-base font-serif capitalize" style={{ color: colors.text }}>
                                  {result.symptom}
                                </span>
                                <span className="text-xs font-sans ml-2 opacity-70" style={{ color: colors.text }}>
                                  {result.description}
                                </span>
                              </div>
                              <span
                                className="px-2 py-1 rounded text-sm font-bold font-sans"
                                style={{
                                  background: colors.text,
                                  color: 'white'
                                }}
                              >
                                {result.effectiveness}%
                              </span>
                            </div>
                            {result.explanations.length > 0 && (
                              <p className="text-xs font-serif mt-2" style={{ color: colors.text, opacity: 0.9, lineHeight: '1.5' }}>
                                {result.explanations[0]}
                              </p>
                            )}
                          </div>
                        );
                      })}
                      <div
                        className="rounded-lg p-3 mt-4"
                        style={{
                          background: 'rgba(59, 130, 246, 0.08)',
                          border: '1px solid rgba(59, 130, 246, 0.15)'
                        }}
                      >
                        <p className="text-xs font-sans text-ink-600" style={{ lineHeight: '1.6' }}>
                          <strong>Note:</strong> These scores assume oral administration with 1 drachm dosage and moderate skill level.
                          Actual effectiveness varies based on route, dosage, and practitioner skill.
                        </p>
                      </div>
                    </div>
                )}
              </PropertySection>
              </>
              )}

              {/* Personal items - show basic info */}
              {itemWithAdvice.type === 'personal' && (
                <div className="rounded-lg p-6 space-y-4" style={{
                  background: 'rgba(139, 92, 46, 0.08)',
                  border: '1px solid rgba(139, 92, 46, 0.15)'
                }}>
                  <p className="text-base font-serif text-ink-900 leading-relaxed" style={{ lineHeight: '1.8' }}>
                    {itemWithAdvice.description}
                  </p>
                  {itemWithAdvice.origin && (
                    <div className="pt-3 border-t border-ink-200/30">
                      <p className="text-sm font-sans text-ink-700">
                        <strong>Origin:</strong> {itemWithAdvice.origin}
                      </p>
                    </div>
                  )}
                  {itemWithAdvice.value && (
                    <div>
                      <p className="text-sm font-sans text-ink-700">
                        <strong>Value:</strong> {itemWithAdvice.value} reales
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="p-8 space-y-5">
              {/* Materia medica-specific sections - hide for personal items */}
              {itemWithAdvice.type !== 'personal' && (
              <>
              <PropertySection
                title="Historical Context"
                expanded={expandedSections.hist_context}
                onToggle={() => toggleSection('hist_context')}
              >
                <p className="text-sm leading-relaxed mb-3 font-serif text-ink-900" style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                  {itemWithAdvice.description}
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
              </>
              )}

              {/* Personal items - show basic info */}
              {itemWithAdvice.type === 'personal' && (
                <div className="rounded-lg p-6" style={{
                  background: 'rgba(139, 92, 46, 0.08)',
                  border: '1px solid rgba(139, 92, 46, 0.15)'
                }}>
                  <h3 className="text-lg font-bold font-serif text-ink-900 mb-3">
                    About this Item
                  </h3>
                  <p className="text-base font-serif text-ink-900 leading-relaxed mb-4" style={{ lineHeight: '1.8' }}>
                    {itemWithAdvice.description}
                  </p>
                  <div className="space-y-2 text-sm font-sans text-ink-700">
                    {itemWithAdvice.origin && (
                      <p><strong>Origin:</strong> {itemWithAdvice.origin}</p>
                    )}
                    {itemWithAdvice.rarity && (
                      <p><strong>Rarity:</strong> {itemWithAdvice.rarity}</p>
                    )}
                    {itemWithAdvice.location && (
                      <p><strong>Location:</strong> {itemWithAdvice.location}</p>
                    )}
                  </div>
                </div>
              )}
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
                      {itemWithAdvice.citation || 'Historical source document'}
                    </p>
                  </div>
                </>
              ) : generatedSources ? (
                /* Display Generated Sources */
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-4xl">📚</div>
                        <h3 className="text-2xl font-bold font-serif text-ink-900">
                          Scholarly Source Suggestions
                        </h3>
                      </div>
                      <p className="text-sm font-sans text-ink-600 mb-4" style={{ lineHeight: '1.6' }}>
                        AI-generated research suggestions for <strong>{toTitleCase(itemWithAdvice.name)}</strong>. These are plausible sources based on historical context, but should be verified.
                      </p>
                      <button
                        onClick={() => {
                          // Clear cache for this item and regenerate
                          if (itemWithAdvice?.name) {
                            sourcesCache.delete(itemWithAdvice.name);
                          }
                          setGeneratedSources(null);
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-semibold font-sans transition-all duration-200"
                        style={{
                          background: 'rgba(139, 92, 46, 0.1)',
                          color: '#5c4a3a',
                          border: '1px solid rgba(139, 92, 46, 0.2)'
                        }}
                      >
                        ↻ Regenerate Suggestions
                      </button>
                    </div>

                    {/* Markdown Content */}
                    <div
                      className="prose prose-sm max-w-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                        border: '1px solid rgba(209, 213, 219, 0.3)',
                        borderRadius: '1rem',
                        padding: '2rem',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold font-serif text-ink-900 mb-4 mt-6" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold font-serif text-ink-900 mb-3 mt-5" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-semibold font-serif text-ink-800 mb-2 mt-4" {...props} />,
                          p: ({node, ...props}) => <p className="text-base font-serif text-ink-900 mb-3 leading-relaxed" style={{ lineHeight: '1.8' }} {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                          li: ({node, ...props}) => <li className="text-base font-serif text-ink-900" style={{ lineHeight: '1.7' }} {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-ink-900" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-ink-800" {...props} />,
                          code: ({node, ...props}) => <code className="px-2 py-1 rounded text-sm font-mono" style={{ background: 'rgba(139, 92, 46, 0.1)', color: '#5c4a3a' }} {...props} />
                        }}
                      >
                        {generatedSources}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                /* No PDF Available - Generate Button */
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

      {/* Rarity/Quality Tooltip Portal */}
      {hoveredBadge && createPortal(
        <div
          className="fixed pointer-events-none z-[9999] transition-opacity duration-200"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translate(-50%, 0)',
            opacity: hoveredBadge ? 1 : 0
          }}
        >
          <div
            className="px-4 py-2 rounded-lg shadow-2xl backdrop-blur-sm whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
              border: '1.5px solid rgba(251, 191, 36, 0.3)',
              maxWidth: '320px'
            }}
          >
            <div className="text-xs font-sans text-parchment-200" style={{ fontWeight: 500 }}>
              {hoveredBadge === 'rarity' ? RARITY_TOOLTIPS[rarity] : QUALITY_TOOLTIPS[quality]}
            </div>
            {/* Arrow pointing up */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '6px solid rgba(15, 23, 42, 0.98)',
              }}
            />
          </div>
        </div>,
        document.body
      )}
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
