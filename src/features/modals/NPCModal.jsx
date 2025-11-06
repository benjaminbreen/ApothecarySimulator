/**
 * NPC Modal - Redesigned for Better Readability
 *
 * Inspired by PlayerCharacterModal but with improvements:
 * - Larger, more readable typography
 * - Better visual hierarchy
 * - Cleaner organization
 * - Dialogue history tab
 * - Enhanced personality visualization
 */

import React, { useState, useMemo, useEffect } from 'react';
import { adaptEntityForNPCModal } from '../../core/entities/entityAdapter';
import { extractNPCDialogue, groupDialogueIntoSessions, getDialogueStats } from '../../utils/dialogueExtractor';
import { relationshipGraph } from '../../core/entities/RelationshipGraph';
import RelationshipBar from '../character/components/RelationshipBar';
import { getCastaInfo } from '../../core/config/castaInfo.config';
import { getBiography } from '../../core/entities/procedural/biographyGenerator';
import { getEventIcon, getEventColor } from '../../core/entities/procedural/timelineGenerator';
import {
  FaUser,
  FaTheaterMasks,
  FaBookOpen,
  FaComments,
  FaTshirt,
  FaLandmark,
  FaBrain,
  FaBalanceScale,
  FaCalendarAlt,
  FaLock,
  FaChevronDown,
  FaChevronUp,
  FaMapMarkerAlt,
  FaClock,
  FaHeart,
  FaSmile,
  FaMeh,
  FaFrown,
  FaHandshake,
  FaUserFriends,
  FaHistory
} from 'react-icons/fa';

export default function NPCModal({ isOpen, onClose, npc, primaryPortraitFile = null, conversationHistory = [] }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isClosing, setIsClosing] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    appearance: true,
    clothing: true,
    personality: true,
    social: true,
    humors: true,  // Default to expanded
    bigFive: false,
    traits: true,
    biography: true,
    events: true,
    family: true,
    siblings: true,
    spouse: true,
    children: true,
    timeline: true  // Default to expanded for timeline
  });

  // Handle smooth close with exit animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  // Reset closing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Adapt entity to ensure nested format
  const adaptedNpc = useMemo(() => {
    return adaptEntityForNPCModal(npc);
  }, [npc]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Extract dialogue from conversation history
  const npcDialogue = useMemo(() => {
    if (!conversationHistory || !adaptedNpc?.name) {
      console.log('[NPCModal] No conversation history or NPC name:', {
        hasHistory: !!conversationHistory,
        historyLength: conversationHistory?.length,
        npcName: adaptedNpc?.name
      });
      return [];
    }
    const dialogue = extractNPCDialogue(conversationHistory, adaptedNpc.name);
    console.log('[NPCModal] Extracted dialogue for', adaptedNpc.name, ':', {
      totalTurns: conversationHistory.length,
      dialogueFound: dialogue.length,
      sample: dialogue.slice(0, 2)
    });
    return dialogue;
  }, [conversationHistory, adaptedNpc?.name]);

  // Group dialogue into conversation sessions
  const dialogueSessions = useMemo(() => {
    return groupDialogueIntoSessions(npcDialogue);
  }, [npcDialogue]);

  // Get dialogue statistics
  const dialogueStats = useMemo(() => {
    return getDialogueStats(npcDialogue);
  }, [npcDialogue]);

  // Get relationship data with player
  const playerRelationship = useMemo(() => {
    if (!adaptedNpc?.id && !adaptedNpc?.name) return null;
    const id = adaptedNpc.id || adaptedNpc.name;
    return relationshipGraph.getRelationship(id, 'player');
  }, [adaptedNpc]);

  // Get NPC's relationships with other NPCs
  const npcRelationships = useMemo(() => {
    if (!adaptedNpc?.id && !adaptedNpc?.name) return [];
    const id = adaptedNpc.id || adaptedNpc.name;
    const allRels = relationshipGraph.getAllRelationships(id);

    // Convert Map to array, exclude player
    return Array.from(allRels.entries())
      .filter(([targetId]) => targetId !== 'player')
      .map(([targetId, rel]) => ({
        targetId,
        ...rel
      }))
      .sort((a, b) => b.value - a.value); // Sort by relationship value
  }, [adaptedNpc]);

  // Get casta info card if casta exists (must be before early return)
  const castaInfo = useMemo(() => {
    return getCastaInfo(adaptedNpc?.social?.casta);
  }, [adaptedNpc?.social?.casta]);

  // Generate biography (family tree, birthplace, etc.)
  const generatedBiography = useMemo(() => {
    if (!adaptedNpc) return null;
    try {
      const biography = getBiography(adaptedNpc, 1680);
      // getBiography returns null on invalid input (validation failed)
      if (!biography) {
        return { error: true, message: 'Unable to generate biography - invalid NPC data' };
      }
      return biography;
    } catch (error) {
      console.error('[NPCModal] Biography generation error:', error);
      return { error: true, message: error.message || 'Failed to generate biography' };
    }
  }, [adaptedNpc]);

  if (!isOpen || !adaptedNpc) return null;

  // Extract data
  const temperament = adaptedNpc.personality?.temperament;
  const bigFive = adaptedNpc.personality?.bigFive;
  const appearance = adaptedNpc.appearance;
  const clothing = adaptedNpc.clothing;
  const social = adaptedNpc.social;
  const biography = adaptedNpc.biography;

  // Determine portrait to show
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
    { id: 'overview', label: 'Overview', icon: <FaUser className="w-4 h-4" /> },
    { id: 'personality', label: 'Personality', icon: <FaTheaterMasks className="w-4 h-4" /> },
    { id: 'relationships', label: 'Relationships', icon: <FaHeart className="w-4 h-4" />, badge: playerRelationship ? 1 + npcRelationships.length : npcRelationships.length },
    { id: 'biography', label: 'Biography', icon: <FaBookOpen className="w-4 h-4" /> },
    { id: 'dialogue', label: 'Dialogue', icon: <FaComments className="w-4 h-4" />, badge: npcDialogue.length }
  ];

  const isDark = document.documentElement.classList.contains('dark');

  // Helper: Categorize traits as positive, negative, or neutral
  const categorizeTraits = (traits) => {
    if (!traits || !Array.isArray(traits)) return { positive: [], negative: [], neutral: [] };

    const positive = ['kind', 'honest', 'brave', 'generous', 'loyal', 'humble', 'patient', 'gentle', 'cheerful', 'friendly', 'helpful', 'compassionate', 'trustworthy'];
    const negative = ['greedy', 'cruel', 'cowardly', 'dishonest', 'arrogant', 'impatient', 'aggressive', 'suspicious', 'jealous', 'bitter', 'ruthless', 'selfish'];

    return {
      positive: traits.filter(t => positive.some(p => t.toLowerCase().includes(p))),
      negative: traits.filter(t => negative.some(n => t.toLowerCase().includes(n))),
      neutral: traits.filter(t => !positive.some(p => t.toLowerCase().includes(p)) && !negative.some(n => t.toLowerCase().includes(n)))
    };
  };

  // Helper: Determine mood from traits and relationship
  const determineMood = (traits, relationship) => {
    if (!traits || !Array.isArray(traits) || traits.length === 0) return { mood: 'Unknown', emoji: '😐', color: '#6b7280' };

    const hasNegative = traits.some(t => ['anxious', 'nervous', 'worried', 'fearful', 'desperate', 'angry', 'hostile'].includes(t.toLowerCase()));
    const hasPositive = traits.some(t => ['cheerful', 'happy', 'content', 'pleased', 'friendly', 'warm'].includes(t.toLowerCase()));

    // Factor in relationship
    const relValue = relationship?.value || 50;

    if (hasNegative || relValue < 30) {
      return { mood: 'Distressed', emoji: '😰', color: '#ef4444' };
    } else if (hasPositive && relValue > 70) {
      return { mood: 'Pleasant', emoji: '😊', color: '#22c55e' };
    } else if (relValue > 60) {
      return { mood: 'Friendly', emoji: '🙂', color: '#3b82f6' };
    } else {
      return { mood: 'Neutral', emoji: '😐', color: '#6b7280' };
    }
  };

  const categorizedTraits = categorizeTraits(adaptedNpc.personality?.traits);
  const currentMood = determineMood(adaptedNpc.personality?.traits, playerRelationship);

  return (
    <div
      className={`fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}
      onClick={handleClose}
    >
      {/* Modal Container - Fixed height for consistency */}
      <div
        className={`relative w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${isClosing ? 'animate-modal-scale-out' : 'animate-modal-scale-in'}`}
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

        {/* Decorative Background Pattern */}
        <div
          className="absolute top-0 right-0 pointer-events-none opacity-10"
          style={{
            width: '50%',
            height: '70%',
            zIndex: 0,
            background: isDark
              ? 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle at top right, rgba(22, 163, 74, 0.3) 0%, transparent 70%)'
          }}
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
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

        {/* Tab Navigation */}
        <div className="flex-shrink-0 flex border-b relative z-10" style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))'
            : 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
          borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
        }}>
          {tabs.map((tab, idx) => {
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
                    ? (isDark ? '#a78bfa' : '#16a34a')
                    : (isDark ? '#94a3b8' : '#6b5a47'),
                  background: isActive
                    ? (isDark
                      ? 'linear-gradient(to bottom, rgba(51, 65, 85, 0.8), rgba(30, 41, 59, 0.6))'
                      : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))')
                    : 'transparent',
                  borderLeft: idx > 0 ? (isDark ? '1px solid rgba(71, 85, 105, 0.2)' : '1px solid rgba(209, 213, 219, 0.2)') : 'none'
                }}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      background: isActive
                        ? (isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(22, 163, 74, 0.2)')
                        : 'rgba(107, 90, 71, 0.2)',
                      color: isActive
                        ? (isDark ? '#c4b5fd' : '#16a34a')
                        : '#6b7280'
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: isDark
                        ? 'linear-gradient(to right, #a78bfa, #8b5cf6, #a78bfa)'
                        : 'linear-gradient(to right, #22c55e, #16a34a, #22c55e)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area - Fixed height with scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10" style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.5))'
            : 'linear-gradient(to bottom, rgba(249, 245, 235, 0.6), rgba(255, 255, 255, 0.5))'
        }}>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="p-8 space-y-8">

              {/* Hero Section */}
              <div className="flex gap-8 items-start">

                {/* Left: Portrait */}
                {portraitUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={portraitUrl}
                      alt={adaptedNpc.name}
                      onClick={() => setIsLightboxOpen(true)}
                      className="w-72 h-72 object-cover rounded-2xl border-4 shadow-elevation-3 transition-all duration-200 cursor-pointer hover:scale-105 hover:brightness-105"
                      style={{
                        borderColor: isDark ? '#8b5cf6' : '#16a34a',
                        filter: isDark
                          ? 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))'
                          : 'drop-shadow(0 0 20px rgba(22, 163, 74, 0.3))'
                      }}
                    />
                  </div>
                )}

                {/* Right: Info */}
                <div className="flex-1 space-y-5">
                  {/* Name and Title */}
                  <div>
                    <h1 className="text-5xl font-bold mb-3 leading-tight font-serif text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                      {adaptedNpc.name}
                    </h1>
                    <p className="text-xl font-serif text-ink-700 dark:text-slate-300 mb-4 transition-colors duration-300">
                      {social?.occupation || adaptedNpc.occupation || 'Resident of Mexico City'}
                    </p>

                    {/* Quick Info Pills */}
                    <div className="flex flex-wrap gap-3">
                      {(appearance?.age || adaptedNpc.age) && (
                        <span className="px-4 py-2 rounded-full text-base font-semibold transition-colors duration-300"
                          style={{
                            background: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                            color: isDark ? '#93c5fd' : '#1e40af',
                            border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)'
                          }}>
                          {appearance?.age || adaptedNpc.age}
                        </span>
                      )}
                      {(appearance?.gender || adaptedNpc.gender) && (
                        <span className="px-4 py-2 rounded-full text-base font-semibold capitalize transition-colors duration-300"
                          style={{
                            background: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
                            color: isDark ? '#c4b5fd' : '#6b21a8',
                            border: isDark ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(168, 85, 247, 0.2)'
                          }}>
                          {appearance?.gender || adaptedNpc.gender}
                        </span>
                      )}
                      {(social?.class || adaptedNpc.class) && (
                        <span className="px-4 py-2 rounded-full text-base font-semibold capitalize transition-colors duration-300"
                          style={{
                            background: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                            color: isDark ? '#fbbf24' : '#92400e',
                            border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.2)'
                          }}>
                          {social?.class || adaptedNpc.class}
                        </span>
                      )}
                      {(social?.casta || adaptedNpc.casta) && (
                        <span className="px-4 py-2 rounded-full text-base font-semibold capitalize transition-colors duration-300"
                          style={{
                            background: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                            color: isDark ? '#86efac' : '#15803d',
                            border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.2)'
                          }}>
                          {social?.casta || adaptedNpc.casta}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* First Impression */}
                  {adaptedNpc.description && (
                    <div className="rounded-xl p-6 shadow-sm transition-colors duration-300"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)',
                        border: isDark ? '2px solid rgba(139, 92, 246, 0.35)' : '2px solid rgba(139, 92, 246, 0.25)'
                      }}>
                      <h3 className="text-sm font-bold uppercase tracking-wider mb-3 font-sans transition-colors duration-300"
                        style={{
                          color: isDark ? '#a78bfa' : '#7c3aed',
                          letterSpacing: '0.12em'
                        }}>
                       First Impression
                      </h3>
                      <p className="text-xl text-ink-700 dark:text-slate-300 leading-relaxed font-serif transition-colors duration-300">
                        {adaptedNpc.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Appearance Section */}
              {(appearance || adaptedNpc.appearance) && (
                <SectionCard
                  title="Physical Appearance"
                  icon={FaUser}
                  expanded={expandedSections.appearance}
                  onToggle={() => toggleSection('appearance')}
                  isDark={isDark}
                >
                  {/* LLM-generated appearance (string) - prioritize this */}
                  {typeof appearance === 'string' && appearance && (
                    <p className="text-lg text-ink-800 dark:text-slate-200 font leading-relaxed mb-4 transition-colors duration-300">
                      {appearance}
                    </p>
                  )}

                  {/* Procedurally-generated appearance (object) - show as details if no LLM description */}
                  {typeof appearance === 'object' && appearance && (
                    <>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {appearance.height && (
                          <DetailRow label="Height" value={appearance.height} isDark={isDark} />
                        )}
                        {appearance.build && (
                          <DetailRow label="Build" value={appearance.build} isDark={isDark} />
                        )}
                        {appearance.face?.skinTone && (
                          <DetailRow label="Complexion" value={appearance.face.skinTone} isDark={isDark} />
                        )}
                        {appearance.face?.eyeColor && (
                          <DetailRow
                            label="Eyes"
                            value={`${appearance.face.eyeShape || ''} ${appearance.face.eyeColor}`.trim()}
                            isDark={isDark}
                          />
                        )}
                        {appearance.hair?.color && (
                          <DetailRow
                            label="Hair"
                            value={`${appearance.hair.color}, ${appearance.hair.style || 'styled'}`}
                            isDark={isDark}
                          />
                        )}
                        {appearance.hair?.facialHair && (
                          <DetailRow label="Facial Hair" value={appearance.hair.facialHair} isDark={isDark} />
                        )}
                      </div>

                      {/* Distinguishing Features */}
                      {appearance.distinguishingFeatures && Array.isArray(appearance.distinguishingFeatures) && appearance.distinguishingFeatures.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-ink-200 dark:border-slate-700">
                          <p className="text-sm font-bold text-ink-900 dark:text-parchment-100 mb-3 uppercase tracking-wide transition-colors duration-300">
                            Notable Features
                          </p>
                          <div className="space-y-2">
                            {appearance.distinguishingFeatures.map((feature, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <span className="text-purple-500 dark:text-purple-400 mt-1 text-lg">•</span>
                                <span className="text-base text-ink-700 dark:text-slate-300 transition-colors duration-300">
                                  {feature.description || feature.location}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </SectionCard>
              )}

              {/* Clothing Section */}
              {clothing && (clothing.style || (clothing.items && clothing.items.length > 0)) && (
                <SectionCard
                  title="Clothing & Attire"
                  icon={FaTshirt}
                  expanded={expandedSections.clothing}
                  onToggle={() => toggleSection('clothing')}
                  isDark={isDark}
                >
                  {clothing.style && (
                    <p className="text-base text-ink-700 dark:text-slate-300 mb-4 italic transition-colors duration-300">
                      {clothing.style}
                    </p>
                  )}

                  {clothing.items && Array.isArray(clothing.items) && clothing.items.length > 0 && (
                    <div className="space-y-3">
                      {clothing.items.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-lg transition-colors duration-300"
                          style={{
                            background: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.06)',
                            border: isDark ? '1px solid rgba(168, 85, 247, 0.25)' : '1px solid rgba(168, 85, 247, 0.2)'
                          }}>
                          <span className="font-bold text-base text-ink-800 dark:text-slate-200 transition-colors duration-300">
                            {item.type}
                          </span>
                          {item.color && <span className="text-ink-600 dark:text-slate-400 transition-colors duration-300"> • {item.color}</span>}
                          {item.material && <span className="text-ink-500 dark:text-slate-500 text-sm transition-colors duration-300"> ({item.material})</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {clothing.accessories && Array.isArray(clothing.accessories) && clothing.accessories.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-ink-200 dark:border-slate-700">
                      <p className="text-sm font-bold text-ink-900 dark:text-parchment-100 mb-3 uppercase tracking-wide transition-colors duration-300">
                        Accessories
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {clothing.accessories.map((accessory, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-300"
                            style={{
                              background: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.12)',
                              color: isDark ? '#e9d5ff' : '#6b21a8'
                            }}
                          >
                            {accessory}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>
              )}

              {/* Social Standing */}
              {social && (
                <div className={`grid gap-6 ${castaInfo ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  <SectionCard
                    title="Social Standing"
                    icon={FaLandmark}
                    expanded={expandedSections.social}
                    onToggle={() => toggleSection('social')}
                    isDark={isDark}
                  >
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {social.casta && (
                        <DetailRow label="Casta" value={social.casta} isDark={isDark} />
                      )}
                      {social.wealth && (
                        <DetailRow label="Wealth" value={social.wealth} isDark={isDark} />
                      )}
                      {social.literacyLevel && (
                        <DetailRow label="Literacy" value={social.literacyLevel} isDark={isDark} />
                      )}
                      {social.languages && Array.isArray(social.languages) && social.languages.length > 0 && (
                        <DetailRow label="Languages" value={social.languages.join(', ')} isDark={isDark} />
                      )}
                      {social.reputation !== undefined && (
                        <DetailRow label="Reputation" value={`${social.reputation}/100`} isDark={isDark} />
                      )}
                    </div>
                  </SectionCard>

                  {/* Casta Info Card */}
                  {castaInfo && (
                    <div className="rounded-xl p-6 shadow-lg transition-all duration-300 border-2"
                      style={{
                        background: isDark
                          ? `linear-gradient(135deg, ${castaInfo.color}15 0%, ${castaInfo.color}08 100%)`
                          : `linear-gradient(135deg, ${castaInfo.color}12 0%, ${castaInfo.color}05 100%)`,
                        borderColor: isDark ? `${castaInfo.color}40` : `${castaInfo.color}30`,
                        boxShadow: isDark
                          ? `0 8px 32px ${castaInfo.color}20, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                          : `0 8px 32px ${castaInfo.color}15, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
                      }}>

                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b transition-colors duration-300"
                        style={{
                          borderColor: isDark ? `${castaInfo.color}30` : `${castaInfo.color}20`
                        }}>
                        <span className="text-4xl">{castaInfo.icon}</span>
                        <div>
                          <h4 className="text-xl font-bold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                            {castaInfo.title}
                          </h4>
                          <p className="text-sm text-ink-600 dark:text-slate-400 font-medium transition-colors duration-300">
                            Colonial Social Category
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-base leading-relaxed text-ink-700 dark:text-slate-300 font transition-colors duration-300">
                        {castaInfo.description}
                      </p>

                      {/* Historical Context Badge */}
                      <div className="mt-4 pt-4 border-t transition-colors duration-300"
                        style={{
                          borderColor: isDark ? `${castaInfo.color}30` : `${castaInfo.color}20`
                        }}>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-colors duration-300"
                          style={{
                            background: isDark ? `${castaInfo.color}25` : `${castaInfo.color}20`,
                            color: isDark ? `${castaInfo.color}` : castaInfo.color
                          }}>
                          📚 Historical Context
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* PERSONALITY TAB */}
          {activeTab === 'personality' && (
            <div className="p-8 space-y-8">

              <h2 className="text-4xl font-bold text-ink-900 dark:text-parchment-100 mb-2 font-serif transition-colors duration-300">
                Personality Profile
              </h2>
            

              {/* Current Mood Indicator */}
              <div className="p-6 rounded-xl transition-colors duration-300 flex items-center gap-4"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(79, 70, 229, 0.1))'
                    : 'linear-gradient(135deg, rgba(199, 210, 254, 0.6), rgba(165, 180, 252, 0.4))',
                  border: isDark ? '2px solid rgba(99, 102, 241, 0.3)' : '2px solid rgba(99, 102, 241, 0.3)'
                }}>
        
                <div className="flex-1">
                  <div className="text-sm font-bold uppercase tracking-wider mb-1 transition-colors duration-300"
                    style={{ color: currentMood.color }}>
                    Current Mood
                  </div>
                  <div className="text-xl font-bold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                    {currentMood.mood}
                  </div>
                </div>
              </div>

              {/* Character Traits - Enhanced with Categories */}
              {adaptedNpc.personality?.traits && Array.isArray(adaptedNpc.personality.traits) && adaptedNpc.personality.traits.length > 0 && (
                <SectionCard
                  title="Character Traits"
                  icon={FaTheaterMasks}
                  expanded={expandedSections.traits}
                  onToggle={() => toggleSection('traits')}
                  isDark={isDark}
                >
                  <div className="space-y-6">
                    {/* Positive Traits */}
                    {categorizedTraits.positive.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <FaSmile className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h4 className="text-sm font-bold uppercase tracking-wide text-green-700 dark:text-green-400">
                            Positive Qualities
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {categorizedTraits.positive.map((trait, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 hover:scale-105"
                              style={{
                                background: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.12)',
                                color: isDark ? '#86efac' : '#15803d',
                                border: isDark ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(34, 197, 94, 0.3)'
                              }}
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Negative Traits */}
                    {categorizedTraits.negative.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <FaFrown className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <h4 className="text-sm font-bold uppercase tracking-wide text-red-700 dark:text-red-400">
                            Negative Qualities
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {categorizedTraits.negative.map((trait, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 hover:scale-105"
                              style={{
                                background: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.12)',
                                color: isDark ? '#fca5a5' : '#991b1b',
                                border: isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)'
                              }}
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Neutral Traits */}
                    {categorizedTraits.neutral.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-0">
                        
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {categorizedTraits.neutral.map((trait, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 hover:scale-105"
                              style={{
                                background: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.12)',
                                color: isDark ? '#fcd34d' : '#92400e',
                                border: isDark ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(245, 158, 11, 0.3)'
                              }}
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Humoral Temperament */}
              {temperament && temperament.humors && (
                <SectionCard
                  title="Humoral Temperament"
                  icon={FaBalanceScale}
                  expanded={expandedSections.humors}
                  onToggle={() => toggleSection('humors')}
                  isDark={isDark}
                >
                  <div className="space-y-6">
                    {/* Primary/Secondary Display */}
                    {temperament.primary && (
                      <div className="text-center p-3 rounded-xl transition-colors duration-300"
                        style={{
                          background: isDark
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1))'
                            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05))',
                          border: isDark ? '2px solid rgba(139, 92, 246, 0.3)' : '2px solid rgba(139, 92, 246, 0.2)'
                        }}>
                        <p className="text-2xl font-bold text-ink-900 dark:text-parchment-100 capitalize mb-2 transition-colors duration-300">
                          {temperament.primary}
                        </p>
                        {temperament.secondary && (
                          <p className="text-md text-ink-600 dark:text-slate-400 font-medium capitalize transition-colors duration-300">
                            with {temperament.secondary} tendencies
                          </p>
                        )}
                      </div>
                    )}

                    {/* Humoral Circles - Enhanced */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                      {Object.entries(temperament.humors).map(([humor, value]) => {
                        const humorConfig = {
                          blood: {
                            gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            label: 'Blood',
                            sublabel: 'Sanguine',
                            glow: 'rgba(239, 68, 68, 0.4)'
                          },
                          phlegm: {
                            gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            label: 'Phlegm',
                            sublabel: 'Phlegmatic',
                            glow: 'rgba(59, 130, 246, 0.4)'
                          },
                          yellowBile: {
                            gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            label: 'Yellow Bile',
                            sublabel: 'Choleric',
                            glow: 'rgba(245, 158, 11, 0.4)'
                          },
                          blackBile: {
                            gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
                            label: 'Black Bile',
                            sublabel: 'Melancholic',
                            glow: 'rgba(107, 114, 128, 0.4)'
                          }
                        };
                        const config = humorConfig[humor];

                        // Determine if this is the dominant humor
                        const maxValue = Math.max(...Object.values(temperament.humors));
                        const isDominant = value === maxValue;

                        return (
                          <div key={humor} className="text-center">
                            <div
                              className={`w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold text-4xl transition-all duration-300 hover:scale-110 ${isDominant ? 'ring-4 ring-purple-400 dark:ring-purple-500' : ''}`}
                              style={{
                                background: config.gradient,
                                boxShadow: isDominant
                                  ? `0 12px 32px ${config.glow}, 0 0 24px ${config.glow}`
                                  : `0 8px 24px rgba(0, 0, 0, 0.3)`,
                                transform: isDominant ? 'scale(1.05)' : 'scale(1)'
                              }}
                            >
                              {value}%
                            </div>
                            <div className={`font-bold ${isDominant ? 'text-lg' : 'text-base'} text-ink-900 dark:text-parchment-100 mb-1 transition-colors duration-300`}>
                              {config.label}
                            </div>
                            <div className={`${isDominant ? 'text-base font-semibold' : 'text-sm'} text-ink-600 dark:text-slate-400 transition-colors duration-300`}>
                              {config.sublabel}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Historical Context */}
                    <div className="p-5 rounded-lg transition-colors duration-300"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))'
                          : 'linear-gradient(135deg, rgba(254, 243, 199, 0.7), rgba(253, 230, 138, 0.5))',
                        border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                      }}>
                      <p className="text-base text-amber-800 dark:text-amber-300 leading-relaxed transition-colors duration-300">
                        ℹ️ <span className="font-semibold">Galenic Theory:</span> According to humoral medicine, this individual's temperament reflects the balance of the four bodily humors. The dominant humor shapes their disposition, health tendencies, and behavior.
                      </p>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* Big Five Personality */}
              {bigFive && Object.keys(bigFive).length > 0 && (
                <SectionCard
                  title="Psychological Profile"
                  icon={FaBrain}
                  expanded={expandedSections.bigFive}
                  onToggle={() => toggleSection('bigFive')}
                  isDark={isDark}
                >
                  <div className="space-y-6">
                    {Object.entries(bigFive).map(([trait, value]) => {
                      const traitLabels = {
                        openness: 'Openness to Experience',
                        conscientiousness: 'Conscientiousness',
                        extroversion: 'Extraversion',
                        agreeableness: 'Agreeableness',
                        neuroticism: 'Neuroticism'
                      };

                      const traitDescriptions = {
                        openness: {
                          high: 'Highly imaginative, curious about new experiences',
                          mid: 'Moderate curiosity, balanced between tradition and novelty',
                          low: 'Prefers familiar routines, traditional values'
                        },
                        conscientiousness: {
                          high: 'Highly organized, dutiful, and disciplined',
                          mid: 'Moderately organized, generally reliable',
                          low: 'Spontaneous, flexible, less concerned with planning'
                        },
                        extroversion: {
                          high: 'Very sociable, energized by social interaction',
                          mid: 'Balanced between social and solitary activities',
                          low: 'Reserved, prefers solitude or small groups'
                        },
                        agreeableness: {
                          high: 'Very cooperative, compassionate, avoids conflict',
                          mid: 'Generally cooperative but stands ground when needed',
                          low: 'Competitive, skeptical, less concerned with harmony'
                        },
                        neuroticism: {
                          high: 'Prone to anxiety, worry, and emotional instability',
                          mid: 'Experiences normal stress responses',
                          low: 'Emotionally stable, calm under pressure'
                        }
                      };

                      const getDescription = (trait, value) => {
                        if (value >= 70) return traitDescriptions[trait].high;
                        if (value >= 40) return traitDescriptions[trait].mid;
                        return traitDescriptions[trait].low;
                      };

                      return (
                        <div key={trait}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-base font-bold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                              {traitLabels[trait]}
                            </span>
                            <span className="text-lg font-bold text-ink-700 dark:text-slate-300 transition-colors duration-300">
                              {value}%
                            </span>
                          </div>
                          <div className="text-sm text-ink-600 dark:text-slate-400 mb-3 font-sans transition-colors duration-300">
                            {getDescription(trait, value)}
                          </div>
                          <div className="h-7 rounded-full overflow-hidden transition-colors duration-300"
                            style={{ background: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(229, 231, 235, 0.6)' }}>
                            <div className="h-full rounded-full flex items-center justify-end px-4 text-sm font-bold text-white transition-all duration-500"
                              style={{
                                width: `${value}%`,
                                background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                                boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)'
                              }}>
                              {value}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

            </div>
          )}

          {/* BIOGRAPHY TAB */}
          {activeTab === 'biography' && (
            <div className="p-8 space-y-8">

              <h2 className="text-4xl font-bold text-ink-900 dark:text-parchment-100 mb-2 font-serif transition-colors duration-300">
                Life History
              </h2>
              <p className="text-base text-ink-600 dark:text-slate-400 mb-8 font-sans leading-relaxed transition-colors duration-300">
                The story of {adaptedNpc.name}'s life and experiences.
              </p>

              {/* Basic Biography */}
              {biography && (biography.birthplace || biography.birthYear) && (
                <SectionCard
                  title="Origins"
                  icon={FaBookOpen}
                  expanded={expandedSections.biography}
                  onToggle={() => toggleSection('biography')}
                  isDark={isDark}
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {biography.birthplace && (
                      <DetailRow label="Birthplace" value={biography.birthplace} isDark={isDark} />
                    )}
                    {biography.birthYear && (
                      <DetailRow label="Born" value={biography.birthYear} isDark={isDark} />
                    )}
                    {biography.immigrationYear && (
                      <DetailRow label="Immigrated" value={biography.immigrationYear} isDark={isDark} />
                    )}
                  </div>
                  {biography.immigrationReason && (
                    <p className="text-sm text-ink-600 dark:text-slate-400 italic mt-4 transition-colors duration-300">
                      {biography.immigrationReason}
                    </p>
                  )}
                </SectionCard>
              )}

              {/* Major Life Events */}
              {biography && biography.majorEvents && Array.isArray(biography.majorEvents) && biography.majorEvents.length > 0 && (
                <SectionCard
                  title="Major Life Events"
                  icon={FaCalendarAlt}
                  expanded={expandedSections.events}
                  onToggle={() => toggleSection('events')}
                  isDark={isDark}
                >
                  <div className="space-y-4">
                    {biography.majorEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className="pl-6 py-4 rounded-lg transition-colors duration-300"
                        style={{
                          background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.06)',
                          borderLeft: isDark ? '4px solid #10b981' : '4px solid #22c55e'
                        }}
                      >
                        <div className="text-sm text-green-700 dark:text-green-400 font-bold mb-2 uppercase tracking-wide transition-colors duration-300">
                          {event.year}
                        </div>
                        <div className="text-base text-ink-700 dark:text-slate-300 leading-relaxed transition-colors duration-300">
                          {event.event}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Secrets */}
              {biography && biography.secrets && Array.isArray(biography.secrets) && biography.secrets.length > 0 && (
                <div className="p-6 rounded-xl shadow-sm transition-colors duration-300"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.12) 100%)'
                      : 'linear-gradient(135deg, rgba(254, 243, 199, 0.7) 0%, rgba(253, 230, 138, 0.5) 100%)',
                    border: isDark ? '2px solid rgba(245, 158, 11, 0.4)' : '2px solid rgba(245, 158, 11, 0.4)'
                  }}>
                  <div className="flex items-center gap-4 mb-4">
                    <FaLock className="text-3xl text-amber-700 dark:text-amber-400" />
                    <h3 className="text-xl font-bold text-amber-900 dark:text-amber-300 transition-colors duration-300">
                      Secret
                    </h3>
                  </div>
                  {biography.secrets.map((secret, idx) => (
                    <p key={idx} className="text-base text-amber-800 dark:text-amber-200 italic leading-relaxed transition-colors duration-300">
                      {secret}
                    </p>
                  ))}
                </div>
              )}

              {/* Procedurally Generated Biography */}
              {generatedBiography?.error ? (
                <div className="p-6 rounded-xl border-2 transition-colors duration-300"
                  style={{
                    background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 0.8)',
                    borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)'
                  }}>
                  <p className="text-base font-bold text-red-700 dark:text-red-400 mb-2 transition-colors duration-300">
                    ⚠️ Biography Generation Failed
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300 transition-colors duration-300">
                    {generatedBiography.message}
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-2 transition-colors duration-300">
                    Try closing and reopening the modal, or contact support if this persists.
                  </p>
                </div>
              ) : generatedBiography && (
                <>
                  {/* Birthplace & Age */}
                  <SectionCard
                    title="Origins"
                    icon={FaMapMarkerAlt}
                    expanded={true}
                    onToggle={() => {}}
                    isDark={isDark}
                  >
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <DetailRow label="Born" value={`${generatedBiography.birthYear} (age ${generatedBiography.age})`} isDark={isDark} />
                      <DetailRow label="Birthplace" value={generatedBiography.birthplace} isDark={isDark} />
                    </div>
                  </SectionCard>

                  {/* Family - Parents */}
                  {generatedBiography.family.parents.length > 0 && (
                    <SectionCard
                      title="Parents"
                      icon={FaUser}
                      expanded={expandedSections.family}
                      onToggle={() => toggleSection('family')}
                      isDark={isDark}
                    >
                      <div className="space-y-4">
                        {generatedBiography.family.parents.map((parent, idx) => (
                          <div key={idx} className="p-4 rounded-lg transition-colors duration-300"
                            style={{
                              background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                              border: isDark ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)'
                            }}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-lg font-bold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                                  {parent.name}
                                </h4>
                                <p className="text-sm text-ink-600 dark:text-slate-400 capitalize transition-colors duration-300">
                                  {parent.relation} • {parent.occupation}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${parent.living ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'}`}>
                                {parent.living ? 'Living' : `Deceased ${parent.yearsDeceased} years ago`}
                              </span>
                            </div>
                            <div className="text-sm text-ink-700 dark:text-slate-300 transition-colors duration-300">
                              Age {parent.age} • {parent.casta}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {/* Family - Siblings */}
                  {generatedBiography.family.siblings.length > 0 && (
                    <SectionCard
                      title={`Siblings (${generatedBiography.family.siblings.length})`}
                      icon={FaUserFriends}
                      expanded={expandedSections.siblings}
                      onToggle={() => toggleSection('siblings')}
                      isDark={isDark}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generatedBiography.family.siblings.map((sibling, idx) => (
                          <div key={idx} className="p-3 rounded-lg transition-colors duration-300"
                            style={{
                              background: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)',
                              border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.15)'
                            }}>
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="text-base font-semibold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                                {sibling.name}
                              </h5>
                              {!sibling.living && (
                                <span className="text-xs text-gray-600 dark:text-gray-400">✝</span>
                              )}
                            </div>
                            <p className="text-xs text-ink-600 dark:text-slate-400 transition-colors duration-300">
                              {sibling.relation} • Age {sibling.age}
                            </p>
                            <p className="text-xs text-ink-700 dark:text-slate-300 mt-1 transition-colors duration-300">
                              {sibling.occupation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {/* Family - Spouse */}
                  {generatedBiography.family.spouse && (
                    <SectionCard
                      title="Spouse"
                      icon={FaHeart}
                      expanded={expandedSections.spouse}
                      onToggle={() => toggleSection('spouse')}
                      isDark={isDark}
                    >
                      <div className="p-4 rounded-lg transition-colors duration-300"
                        style={{
                          background: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.05)',
                          border: isDark ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(236, 72, 153, 0.2)'
                        }}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-bold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                              {generatedBiography.family.spouse.name}
                            </h4>
                            <p className="text-sm text-ink-600 dark:text-slate-400 transition-colors duration-300">
                              {generatedBiography.family.spouse.occupation}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${generatedBiography.family.spouse.living ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'}`}>
                            {generatedBiography.family.spouse.living ? 'Living' : 'Widowed'}
                          </span>
                        </div>
                        <div className="text-sm text-ink-700 dark:text-slate-300 transition-colors duration-300">
                          Married {generatedBiography.family.spouse.yearsMarried} years (since {generatedBiography.family.spouse.marriedYear}) • Age {generatedBiography.family.spouse.age}
                        </div>
                      </div>
                    </SectionCard>
                  )}

                  {/* Family - Children */}
                  {generatedBiography.family.children.length > 0 && (
                    <SectionCard
                      title={`Children (${generatedBiography.family.children.length})`}
                      icon={FaUser}
                      expanded={expandedSections.children}
                      onToggle={() => toggleSection('children')}
                      isDark={isDark}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generatedBiography.family.children.map((child, idx) => (
                          <div key={idx} className="p-3 rounded-lg transition-colors duration-300"
                            style={{
                              background: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.04)',
                              border: isDark ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(34, 197, 94, 0.15)'
                            }}>
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="text-base font-semibold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                                {child.name}
                              </h5>
                              {!child.living && (
                                <span className="text-xs text-gray-600 dark:text-gray-400">✝</span>
                              )}
                            </div>
                            <p className="text-xs text-ink-600 dark:text-slate-400 transition-colors duration-300">
                              Age {child.age} • {child.gender}
                            </p>
                            {child.occupation && (
                              <p className="text-xs text-ink-700 dark:text-slate-300 mt-1 transition-colors duration-300">
                                {child.occupation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {/* Family Summary */}
                  <div className="p-4 rounded-lg transition-colors duration-300"
                    style={{
                      background: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
                      border: isDark ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid rgba(168, 85, 247, 0.15)'
                    }}>
                    <p className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-2 transition-colors duration-300">
                      Family Summary
                    </p>
                    <div className="flex gap-6 text-sm text-ink-700 dark:text-slate-300 transition-colors duration-300">
                      <span>Total Members: {generatedBiography.family.summary.totalMembers}</span>
                      <span className="text-green-700 dark:text-green-400">Living: {generatedBiography.family.summary.livingMembers}</span>
                      <span className="text-gray-600 dark:text-gray-400">Deceased: {generatedBiography.family.summary.deceasedMembers}</span>
                    </div>
                  </div>

                  {/* Life Event Timeline */}
                  {generatedBiography.timeline && generatedBiography.timeline.length > 0 && (
                    <SectionCard
                      title={`Life Timeline (${generatedBiography.timeline.length} events)`}
                      icon={FaHistory}
                      expanded={expandedSections.timeline}
                      onToggle={() => toggleSection('timeline')}
                      isDark={isDark}
                    >
                      <div className="relative">
                        {/* Vertical timeline line */}
                        <div
                          className="absolute left-16 top-0 bottom-0 w-0.5 transition-colors duration-300"
                          style={{
                            background: isDark
                              ? 'linear-gradient(to bottom, rgba(251, 191, 36, 0.3), rgba(251, 191, 36, 0.1))'
                              : 'linear-gradient(to bottom, rgba(217, 119, 6, 0.3), rgba(217, 119, 6, 0.1))'
                          }}
                        />

                        {/* Timeline events */}
                        <div className="space-y-6">
                          {generatedBiography.timeline.map((event, idx) => {
                            const colors = getEventColor(event.category);
                            const icon = getEventIcon(event.category);
                            const isImportant = event.importance >= 3;

                            return (
                              <div key={idx} className="relative flex items-start gap-4">
                                {/* Year label */}
                                <div className="w-12 flex-shrink-0 text-right">
                                  <span className={`text-sm font-bold transition-colors duration-300 ${
                                    isImportant
                                      ? 'text-amber-700 dark:text-amber-400'
                                      : 'text-ink-600 dark:text-slate-400'
                                  }`}>
                                    {event.year}
                                  </span>
                                  <div className="text-xs text-ink-500 dark:text-slate-500 transition-colors duration-300">
                                    Age {event.age}
                                  </div>
                                </div>

                                {/* Event marker */}
                                <div
                                  className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isImportant ? 'ring-4 ring-amber-500/30 dark:ring-amber-400/30' : ''
                                  }`}
                                  style={{
                                    background: isDark
                                      ? `linear-gradient(135deg, ${colors.dark}, ${colors.light})`
                                      : `linear-gradient(135deg, ${colors.light}, ${colors.dark})`,
                                    border: isDark
                                      ? `2px solid ${colors.dark.replace('0.2', '0.5')}`
                                      : `2px solid ${colors.light.replace('0.1', '0.3')}`
                                  }}
                                >
                                  <span className="text-sm">{icon}</span>
                                </div>

                                {/* Event content */}
                                <div
                                  className={`flex-1 p-4 rounded-lg transition-all duration-300 ${
                                    isImportant ? 'shadow-lg' : ''
                                  }`}
                                  style={{
                                    background: isDark ? colors.dark : colors.light,
                                    border: isDark
                                      ? `1px solid ${colors.dark.replace('0.2', '0.4')}`
                                      : `1px solid ${colors.light.replace('0.1', '0.2')}`
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                                      isImportant
                                        ? 'font-semibold text-ink-900 dark:text-parchment-50'
                                        : 'text-ink-800 dark:text-slate-200'
                                    }`}>
                                      {event.description}
                                    </p>
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-bold uppercase whitespace-nowrap transition-colors duration-300 ${colors.text}`}
                                      style={{
                                        background: isDark
                                          ? colors.dark.replace('0.2', '0.3')
                                          : colors.light.replace('0.1', '0.2')
                                      }}
                                    >
                                      {event.category}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </SectionCard>
                  )}

                  {/* Empty state for timeline */}
                  {generatedBiography.timeline && generatedBiography.timeline.length === 0 && (
                    <div className="p-8 rounded-xl text-center transition-colors duration-300"
                      style={{
                        background: isDark ? 'rgba(107, 114, 128, 0.1)' : 'rgba(243, 244, 246, 0.8)',
                        border: isDark ? '1px solid rgba(107, 114, 128, 0.2)' : '1px solid rgba(209, 213, 219, 0.4)'
                      }}>
                      <FaHistory className="mx-auto mb-3 text-3xl text-gray-500 dark:text-gray-400 transition-colors duration-300" />
                      <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                        No Life Events Recorded
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        This character's life timeline is not yet available.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Empty state when no biography at all */}
              {!generatedBiography && (
                <div className="p-8 rounded-xl text-center transition-colors duration-300"
                  style={{
                    background: isDark ? 'rgba(107, 114, 128, 0.1)' : 'rgba(243, 244, 246, 0.8)',
                    border: isDark ? '1px solid rgba(107, 114, 128, 0.2)' : '1px solid rgba(209, 213, 219, 0.4)'
                  }}>
                  <FaUser className="mx-auto mb-3 text-3xl text-gray-500 dark:text-gray-400 transition-colors duration-300" />
                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                    Biography Not Available
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Biographical information for this character has not been generated.
                  </p>
                </div>
              )}

           

            </div>
          )}

          {/* RELATIONSHIPS TAB */}
          {activeTab === 'relationships' && (
            <div className="p-8 space-y-8">

              <h2 className="text-4xl font-bold text-ink-900 dark:text-parchment-100 mb-2 font-serif transition-colors duration-300">
                Relationships
              </h2>
              <p className="text-base text-ink-600 dark:text-slate-400 mb-8 font-sans leading-relaxed transition-colors duration-300">
                {adaptedNpc.name}'s connections and social standing with Maria and others.
              </p>

              {/* Relationship with Player */}
              {playerRelationship ? (
                <div className="space-y-6">
                  <div className="p-6 rounded-xl transition-colors duration-300"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1))'
                        : 'linear-gradient(135deg, rgba(199, 210, 254, 0.6), rgba(165, 180, 252, 0.4))',
                      border: isDark ? '2px solid rgba(139, 92, 246, 0.3)' : '2px solid rgba(99, 102, 241, 0.3)'
                    }}>
                    <div className="flex items-center gap-3 mb-4">
                      <FaHeart className="text-3xl text-purple-600 dark:text-purple-400" />
                      <div>
                        <h3 className="text-2xl font-bold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                          Relationship with Maria
                        </h3>
                        <p className="text-sm text-ink-600 dark:text-slate-400 transition-colors duration-300">
                          Current standing: <span className="font-bold capitalize">{playerRelationship.status}</span>
                        </p>
                      </div>
                    </div>

                    {/* Relationship Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-ink-700 dark:text-slate-300 transition-colors duration-300">
                          Affinity Level
                        </span>
                        <span className="text-lg font-bold text-purple-700 dark:text-purple-400 transition-colors duration-300">
                          {playerRelationship.value}/100
                        </span>
                      </div>
                      <div className="h-6 rounded-full overflow-hidden transition-colors duration-300"
                        style={{ background: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(229, 231, 235, 0.6)' }}>
                        <div className="h-full rounded-full flex items-center justify-end px-4 text-sm font-bold text-white transition-all duration-500"
                          style={{
                            width: `${playerRelationship.value}%`,
                            background: playerRelationship.value >= 80
                              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                              : playerRelationship.value >= 60
                                ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
                                : playerRelationship.value >= 40
                                  ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                  : 'linear-gradient(90deg, #ef4444, #dc2626)',
                            boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)'
                          }}>
                        </div>
                      </div>
                    </div>

                    {/* Last Interaction */}
                    {playerRelationship.lastInteraction && (
                      <div className="text-sm text-ink-600 dark:text-slate-400 mb-4 transition-colors duration-300">
                        <strong>Last interaction:</strong> {playerRelationship.lastInteraction}
                      </div>
                    )}

                    {/* Relationship History Timeline */}
                    {playerRelationship.history && playerRelationship.history.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-ink-200 dark:border-slate-700">
                        <h4 className="text-lg font-bold text-ink-900 dark:text-parchment-100 mb-4 flex items-center gap-2 transition-colors duration-300">
                          <FaClock className="w-5 h-5" />
                          Interaction History
                        </h4>
                        <div className="space-y-3">
                          {playerRelationship.history.slice().reverse().map((event, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-lg transition-colors duration-300"
                              style={{
                                background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(199, 210, 254, 0.3)',
                                borderLeft: `4px solid ${event.delta > 0 ? '#22c55e' : event.delta < 0 ? '#ef4444' : '#6b7280'}`
                              }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-ink-800 dark:text-slate-200 mb-1 transition-colors duration-300">
                                    {event.event}
                                  </div>
                                  <div className="text-xs text-ink-600 dark:text-slate-400 transition-colors duration-300">
                                    {event.date}
                                  </div>
                                </div>
                                <div
                                  className="px-3 py-1 rounded-full text-sm font-bold"
                                  style={{
                                    background: event.delta > 0
                                      ? (isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)')
                                      : event.delta < 0
                                        ? (isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)')
                                        : (isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.15)'),
                                    color: event.delta > 0
                                      ? '#22c55e'
                                      : event.delta < 0
                                        ? '#ef4444'
                                        : '#6b7280'
                                  }}
                                >
                                  {event.delta > 0 ? '+' : ''}{event.delta}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FaHeart className="text-6xl mb-6 mx-auto opacity-20 text-ink-400 dark:text-slate-600" />
                  <p className="text-xl font-bold text-ink-700 dark:text-slate-300 mb-2 transition-colors duration-300">
                    No Relationship Yet
                  </p>
                  <p className="text-base text-ink-600 dark:text-slate-400 max-w-md mx-auto transition-colors duration-300">
                    You haven't interacted with {adaptedNpc.name} yet.
                  </p>
                </div>
              )}

              {/* NPC's Social Network */}
              {npcRelationships.length > 0 && (
                <div className="mt-8 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaUserFriends className="text-3xl text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="text-2xl font-bold text-ink-900 dark:text-parchment-100 transition-colors duration-300">
                        Social Connections
                      </h3>
                      <p className="text-sm text-ink-600 dark:text-slate-400 transition-colors duration-300">
                        {adaptedNpc.name}'s relationships with other people
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {npcRelationships.map((rel, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg"
                        style={{
                          background: isDark
                            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                          border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="text-lg font-bold text-ink-900 dark:text-parchment-100 mb-1 transition-colors duration-300">
                              {rel.targetId}
                            </div>
                            <div className="text-sm capitalize font-semibold transition-colors duration-300"
                              style={{
                                color: rel.value >= 80
                                  ? '#22c55e'
                                  : rel.value >= 60
                                    ? '#3b82f6'
                                    : rel.value >= 40
                                      ? '#f59e0b'
                                      : '#ef4444'
                              }}>
                              {rel.status}
                            </div>
                          </div>
                          <div
                            className="px-3 py-1 rounded-full text-sm font-bold"
                            style={{
                              background: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)',
                              color: isDark ? '#c4b5fd' : '#7c3aed'
                            }}
                          >
                            {rel.value}/100
                          </div>
                        </div>

                        {/* Mini progress bar */}
                        <div className="h-2 rounded-full overflow-hidden transition-colors duration-300"
                          style={{ background: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(229, 231, 235, 0.6)' }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${rel.value}%`,
                              background: rel.value >= 80
                                ? '#22c55e'
                                : rel.value >= 60
                                  ? '#3b82f6'
                                  : rel.value >= 40
                                    ? '#f59e0b'
                                    : '#ef4444'
                            }}>
                          </div>
                        </div>

                        {/* Relationship type/reason */}
                        {rel.reason && (
                          <div className="mt-3 text-xs text-ink-600 dark:text-slate-400 italic transition-colors duration-300">
                            {rel.reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state for social network */}
              {npcRelationships.length === 0 && playerRelationship && (
                <div className="text-center py-12 rounded-xl transition-colors duration-300"
                  style={{
                    background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(249, 245, 235, 0.5)',
                    border: isDark ? '1px dashed rgba(71, 85, 105, 0.3)' : '1px dashed rgba(209, 213, 219, 0.3)'
                  }}>
                  <FaUserFriends className="text-5xl mb-4 mx-auto opacity-20 text-ink-400 dark:text-slate-600" />
                  <p className="text-base text-ink-600 dark:text-slate-400 transition-colors duration-300">
                    {adaptedNpc.name}'s connections with other NPCs haven't been discovered yet.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* DIALOGUE TAB */}
          {activeTab === 'dialogue' && (
            <div className="p-8 space-y-8">

              <h2 className="text-4xl font-bold text-ink-900 dark:text-parchment-100 mb-2 font-serif transition-colors duration-300">
                Conversation History
              </h2>
              <p className="text-base text-ink-600 dark:text-slate-400 mb-8 font-sans leading-relaxed transition-colors duration-300">
                Record of all conversations with {adaptedNpc.name}.
              </p>

              {/* Empty State */}
              {npcDialogue.length === 0 && (
                <div className="text-center py-16">
                  <FaComments className="text-6xl mb-6 mx-auto opacity-20 text-ink-400 dark:text-slate-600" />
                  <p className="text-xl font-bold text-ink-700 dark:text-slate-300 mb-2 transition-colors duration-300">
                    No Conversations Yet
                  </p>
                  <p className="text-base text-ink-600 dark:text-slate-400 max-w-md mx-auto transition-colors duration-300">
                    When you speak with {adaptedNpc.name}, their dialogue will appear here.
                  </p>
                </div>
              )}

              {/* Statistics Bar */}
              {npcDialogue.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-xl transition-colors duration-300"
                    style={{
                      background: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                      border: isDark ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.2)'
                    }}>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {dialogueStats.totalExchanges}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      Exchanges
                    </div>
                  </div>
                  <div className="p-4 rounded-xl transition-colors duration-300"
                    style={{
                      background: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
                      border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                      {dialogueStats.totalWords}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-300">
                      Words Spoken
                    </div>
                  </div>
                  <div className="p-4 rounded-xl transition-colors duration-300"
                    style={{
                      background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                      border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {dialogueSessions.length}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                      Conversations
                    </div>
                  </div>
                  <div className="p-4 rounded-xl transition-colors duration-300"
                    style={{
                      background: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                      border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                      {dialogueStats.locations.length}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      Locations
                    </div>
                  </div>
                </div>
              )}

              {/* Dialogue Sessions */}
              {dialogueSessions.length > 0 && (
                <div className="space-y-6">
                  {dialogueSessions.map((session, sessionIdx) => (
                    <div key={sessionIdx} className="space-y-4">
                      {/* Session Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 transition-colors duration-300"
                          style={{
                            background: isDark
                              ? 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3), transparent)'
                              : 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.2), transparent)'
                          }}
                        />
                        <span className="text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                          Conversation {sessionIdx + 1}
                        </span>
                        <div className="h-px flex-1 transition-colors duration-300"
                          style={{
                            background: isDark
                              ? 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3), transparent)'
                              : 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.2), transparent)'
                          }}
                        />
                      </div>

                      {/* Exchanges in this session */}
                      {session.map((exchange, exchangeIdx) => (
                        <div
                          key={exchangeIdx}
                          className="p-6 rounded-xl transition-all duration-300 hover:shadow-lg"
                          style={{
                            background: isDark
                              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))'
                              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                            border: isDark ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.2)'
                          }}
                        >
                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 mb-4 pb-3 border-b border-ink-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                              <FaClock className="w-3 h-3" />
                              Turn {exchange.turnNumber}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-ink-600 dark:text-slate-400">
                              📅 {exchange.date} • {exchange.time}
                            </div>
                            {exchange.location && exchange.location !== 'Unknown location' && (
                              <div className="flex items-center gap-2 text-xs text-ink-600 dark:text-slate-400">
                                <FaMapMarkerAlt className="w-3 h-3" />
                                {exchange.location}
                              </div>
                            )}
                          </div>

                          {/* Player Action (if available) */}
                          {exchange.playerAction && (
                            <div className="mb-4 p-3 rounded-lg transition-colors duration-300"
                              style={{
                                background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                                borderLeft: isDark ? '3px solid #818cf8' : '3px solid #a5b4fc'
                              }}>
                              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-2">
                                Maria's Action
                              </div>
                              <p className="text-sm text-ink-700 dark:text-slate-300 italic transition-colors duration-300">
                                "{exchange.playerAction}"
                              </p>
                            </div>
                          )}

                          {/* NPC Dialogue */}
                          <div className="p-4 rounded-lg transition-colors duration-300"
                            style={{
                              background: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
                              borderLeft: isDark ? '4px solid #a78bfa' : '4px solid #c4b5fd'
                            }}>
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300"
                                style={{
                                  background: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)',
                                  color: isDark ? '#c4b5fd' : '#7c3aed'
                                }}>
                                {adaptedNpc.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2 transition-colors duration-300">
                                  {adaptedNpc.name}
                                </div>
                                <p className="text-lg text-ink-900 dark:text-parchment-100 font-serif leading-relaxed transition-colors duration-300">
                                  "{exchange.dialogue}"
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

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

      {/* Portrait Lightbox */}
      {isLightboxOpen && portraitUrl && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center cursor-zoom-out"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-8 right-8 px-6 py-3 rounded-lg text-white font-bold transition-all duration-300 hover:bg-black/80"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            ✕ Close
          </button>
          <img
            src={portraitUrl}
            alt={adaptedNpc.name}
            className="max-w-[70%] max-h-[85%] rounded-2xl shadow-2xl"
            style={{
              boxShadow: '0 30px 120px rgba(0, 0, 0, 0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// SectionCard Component - Collapsible section with icon
function SectionCard({ title, icon: Icon, children, expanded, onToggle, isDark }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-md transition-all duration-300"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
        border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
      }}>
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between transition-all duration-200 hover:brightness-105"
      >
        <div className="flex items-center gap-4">
          <Icon className="text-xl" style={{
            color: isDark ? '#a78bfa' : '#16a34a'
          }} />
          <h3 className="text-sm font-semibold font-sans uppercase" style={{
            color: isDark ? '#e2e8f0' : '#3d2817',
            letterSpacing: '0.05em'
          }}>
            {title}
          </h3>
        </div>
        {expanded ? (
          <FaChevronUp className="w-5 h-5 transition-transform duration-200" style={{
            color: isDark ? '#94a3b8' : '#6b5a47'
          }} />
        ) : (
          <FaChevronDown className="w-5 h-5 transition-transform duration-200" style={{
            color: isDark ? '#94a3b8' : '#6b5a47'
          }} />
        )}
      </button>
      {expanded && (
        <div className="px-6 pb-6 transition-colors duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

// DetailRow Component - Label-value pair with better typography
function DetailRow({ label, value, isDark }) {
  return (
    <div className="py-3 border-b border-ink-100 dark:border-slate-700 last:border-0 transition-colors duration-300">
      <span className="block text-xs text-ink-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 transition-colors duration-300">
        {label}
      </span>
      <span className="block text-base text-ink-900 dark:text-parchment-100 font-semibold transition-colors duration-300">
        {value}
      </span>
    </div>
  );
}
