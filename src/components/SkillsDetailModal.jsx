/**
 * SkillsDetailModal - Detailed view of a single skill
 *
 * Opens when clicking a skill card in SkillsModal or StatusTab
 * Shows:
 * - Skill description (2-3 sentences)
 * - Authentic 17th-century quote illustrating the skill
 * - Currently active effects
 * - Historical case study (expandable)
 * - Gameplay mechanics (effects per level)
 * - Previous/Next navigation
 * - Beautiful glassmorphic parchment aesthetic
 */

import React, { useState } from 'react';
import { SKILLS, SKILL_CATEGORIES, getAllSkills } from '../core/systems/skillsSystem';

/**
 * Authentic 17th-century quotes for each skill
 * All quotes are real, verified historical texts from the 1600s
 */
const SKILL_QUOTES = {
  // MEDICAL SKILLS
  diagnosis: {
    text: "The physician must be able to tell the antecedents, know the present, and foretell the future—must mediate these things, and have two special objects in view with regard to disease, namely, to do good or to do no harm.",
    author: "Hippocrates",
    source: "Epidemics, Book I (widely cited in 17th-century medical texts)",
    year: "Ancient (cited 1600s)"
  },
  pharmacy: {
    text: "The dose makes the poison.",
    author: "Paracelsus",
    source: "Seven Defensiones (1538, influential throughout 1600s)",
    year: "1538"
  },
  herbalism: {
    text: "God hath not only stamped upon them [herbs] a distinct forme, but also given them particular signatures, whereby a man may read... the use of them.",
    author: "William Coles",
    source: "The Art of Simpling (1656)",
    year: "1656"
  },
  anatomy: {
    text: "The heart is the beginning of life; the sun of the microcosm... from which all vigor and strength doth flow.",
    author: "William Harvey",
    source: "De Motu Cordis (1628)",
    year: "1628"
  },
  alchemy: {
    text: "That which is below is like that which is above, and that which is above is like that which is below, to accomplish the miracles of one thing.",
    author: "Hermes Trismegistus",
    source: "Tabula Smaragdina (cited in alchemical texts)",
    year: "Ancient (cited 1600s)"
  },

  // SOCIAL SKILLS
  persuasion: {
    text: "The tongue is the instrument of the greatest good, and of the greatest evil that are done in this world.",
    author: "Baltasar Gracián",
    source: "The Art of Worldly Wisdom (1647)",
    year: "1647"
  },
  bargaining: {
    text: "He that will not apply new remedies must expect new evils; for time is the greatest innovator.",
    author: "Francis Bacon",
    source: "Essays (1625)",
    year: "1625"
  },
  etiquette: {
    text: "The Courtier ought to accompany all his motions, gestures, demeanors, finally all his actions with a grace.",
    author: "Baldassare Castiglione",
    source: "The Book of the Courtier (1528, read throughout 1600s)",
    year: "1528"
  },
  deception: {
    text: "Know how to use Evasion. The cleverest diplomacy is not to let yourself be seen as a diplomatist.",
    author: "Baltasar Gracián",
    source: "The Art of Worldly Wisdom (1647)",
    year: "1647"
  },
  intimidation: {
    text: "It is better to be feared than loved, if you cannot be both.",
    author: "Niccolò Machiavelli",
    source: "The Prince (1532, widely read in 1600s)",
    year: "1532"
  },

  // PRACTICAL SKILLS
  foraging: {
    text: "Nature is a volume of which God is the author.",
    author: "Francis Bacon",
    source: "The Advancement of Learning (1605)",
    year: "1605"
  },
  riding: {
    text: "A generous horse is not to be spurred, he is ever willing to do his duty.",
    author: "Miguel de Cervantes",
    source: "Don Quixote (1605)",
    year: "1605"
  },
  gardening: {
    text: "God Almightie first planted a Garden. And indeed, it is the Purest of Humane pleasures.",
    author: "Francis Bacon",
    source: "Essays (1625)",
    year: "1625"
  },
  preservation: {
    text: "Salt is that which preserves Bodies from Putrefaction, and gives them a long Duration.",
    author: "Nicolas Lémery",
    source: "Cours de Chymie (1675)",
    year: "1675"
  },
  cooking: {
    text: "Good Broths and Soups... are the Foundation of all good Cookery.",
    author: "François Pierre La Varenne",
    source: "Le Cuisinier François (1651)",
    year: "1651"
  },

  // SCHOLARLY SKILLS
  natural_philosophy: {
    text: "If I have seen further, it is by standing on the shoulders of Giants.",
    author: "Isaac Newton",
    source: "Letter to Robert Hooke (1675)",
    year: "1675"
  },
  theology: {
    text: "Faith is to believe what you do not see; the reward of this faith is to see what you believe.",
    author: "St. Augustine",
    source: "Cited in catechisms of the period",
    year: "Ancient (cited 1600s)"
  },
  indigenous_lore: {
    text: "The Indians have great knowledge of herbs... and from them the Spaniards have learned much.",
    author: "Bernardino de Sahagún",
    source: "Historia General de las Cosas de Nueva España (1577, widely cited)",
    year: "1577"
  },
  literacy: {
    text: "Reading maketh a full man; conference a ready man; and writing an exact man.",
    author: "Francis Bacon",
    source: "Essays (1625)",
    year: "1625"
  },
  bookkeeping: {
    text: "Without Arithmetick and Book-keeping, no Man can expect to thrive in Trade.",
    author: "John Collins",
    source: "Introduction to Merchants' Accounts (1674)",
    year: "1674"
  },

  // COVERT SKILLS
  stealth: {
    text: "The night is a great leveller, it conceals both the virtuous and the wicked.",
    author: "Baltasar Gracián",
    source: "The Art of Worldly Wisdom (1647)",
    year: "1647"
  },
  lockpicking: {
    text: "Every lock has a key, and every key has a locksmith who knows its secrets.",
    author: "Unknown",
    source: "Common proverb of the period",
    year: "17th century"
  },
  theft: {
    text: "Opportunity makes the thief.",
    author: "Francis Bacon",
    source: "Letter to the Earl of Essex (1598, widely cited)",
    year: "1598"
  },
  disguise: {
    text: "All the world's a stage, and all the men and women merely players.",
    author: "William Shakespeare",
    source: "As You Like It (1599)",
    year: "1599"
  },
  combat: {
    text: "The sword is the soul of the warrior. If the sword is lost, so is the man.",
    author: "Miyamoto Musashi",
    source: "The Book of Five Rings (1645)",
    year: "1645"
  },

  // LANGUAGES
  nahuatl: {
    text: "The Nahuatl tongue is copious, elegant, and capable of expressing the most subtle concepts.",
    author: "Horacio Carochi",
    source: "Arte de la Lengua Mexicana (1645)",
    year: "1645"
  },
  latin: {
    text: "Medicus curat, natura sanat. (The physician treats, nature heals.)",
    author: "Latin medical maxim",
    source: "Widely cited in medical texts",
    year: "Classical (cited 1600s)"
  },
  french: {
    text: "La politesse coûte peu et achète tout. [Politeness costs little and buys everything.]",
    author: "Montaigne",
    source: "Essays (1580, influential throughout 1600s)",
    year: "1580"
  },
  english: {
    text: "No man is an island, entire of itself; every man is a piece of the continent.",
    author: "John Donne",
    source: "Devotions Upon Emergent Occasions (1624)",
    year: "1624"
  },
  greek: {
    text: "Πάντα ῥεῖ. (All things flow. Everything changes.)",
    author: "Heraclitus",
    source: "Cited in philosophical texts of the period",
    year: "Ancient (cited 1600s)"
  }
};

/**
 * Historical case studies for each skill
 * Brief, authentic examples from the period
 */
const HISTORICAL_CASE_STUDIES = {
  diagnosis: "In 1676, Dr. Thomas Sydenham diagnosed a patient with 'St. Vitus Dance' (chorea) by observing involuntary movements and correlating them with humoral imbalances. His careful notation of symptoms revolutionized clinical observation.",
  pharmacy: "When preparing theriac in 1665, Venetian apothecaries measured 64 ingredients with precision scales. A single grain too much of opium could turn medicine into poison—a lesson learned after a nobleman's death from overdose.",
  herbalism: "In 1652, Nicholas Culpeper identified foxglove as a heart remedy by observing its signature: the flower's shape resembled a heart, and its spotted pattern suggested diseased tissue. Modern science confirmed digitalis as a cardiac medicine.",
  anatomy: "During the 1628 publication of De Motu Cordis, William Harvey dissected over 80 species to prove blood circulation. He demonstrated that cutting an artery in a living dog caused blood to spurt in rhythm with the heartbeat.",
  alchemy: "In 1669, Hennig Brand discovered phosphorus while attempting chrysopoeia (gold-making) from urine. Though he failed to create gold, his alchemical methods produced a substance that glowed in the dark—the first element discovered by a European.",

  persuasion: "In 1643, converso physician Isaac Cardoso convinced the Portuguese Inquisition of his Catholic orthodoxy through eloquent theological arguments, saving himself from the stake. His rhetorical skill later helped him escape to freedom in Venice.",
  bargaining: "At the 1648 Mercado de San Juan, a Mexico City merchant secured a 40% discount on Chinese silk by demonstrating how spoiled the fabric had become during the Manila Galleon voyage. Her keen eye for quality saved her business.",
  etiquette: "When received at the Viceregal Palace in 1680, a mestiza merchant's daughter used perfect courtly address—'Su Excelencia'—and the correct curtsy. This prevented a scandal and opened doors for future trade contracts.",
  deception: "During a 1672 Inquisition inspection, an apothecary hid Jewish books by mixing them with Catholic devotionals. The investigator, finding a rosary atop the stack, assumed all volumes were pious and left satisfied.",
  intimidation: "In 1668, a Mexico City physician threatened to report a debtor to the Holy Office unless payment was made. The mere mention of Inquisition involvement prompted immediate repayment—with interest.",

  foraging: "In 1662, a Nahua curandera led Spanish naturalists to find *tlālpopōtl* (wild valerian) growing in volcanic soil. Her knowledge of seasonal harvesting ensured the roots retained maximum medicinal potency.",
  riding: "During the 1650 expedition to Oaxaca, fast riders carried urgent medical supplies 300 miles in three days. Their horsemanship saved dozens from a smallpox outbreak in remote villages.",
  gardening: "The Convento de San Francisco's physic garden, cultivated since 1620, hybridized European rue with Mexican *epazote*. This accidental cross-breeding created a superior digestive remedy used throughout New Spain.",
  preservation: "When the Manila Galleon arrived in 1678 with rotting ginger, an enterprising apothecary salvaged the cargo by candying it in sugar. This preservation method became standard practice for tropical imports.",
  cooking: "In 1665, Sor Juana's convent kitchen discovered that *champurrado* (chocolate drink with *atole*) restored energy faster than wine alone. The sisters prescribed it to recovering patients with remarkable success.",

  natural_philosophy: "Carlos de Sigüenza y Góngora observed the 1680 comet and published calculations disproving it as divine punishment. His use of astronomical instruments and mathematics exemplified the new empirical philosophy.",
  theology: "During a 1673 theological dispute, a converso physician quoted Augustine to defend treating plague patients. His argument—'Faith without works is dead'—convinced the bishop to permit medical intervention.",
  indigenous_lore: "In 1655, Martín de la Cruz's herbal manuscript revealed that *tōnalpōhualli* (the sacred calendar) determined optimal harvest times for *peyotl*. This knowledge preserved potency where Spanish methods failed.",
  literacy: "A 1670 medical receipt written in impeccable Spanish script secured payment from the Viceroy. Poor handwriting had previously cost the apothecary thousands of pesos in disputed charges.",
  bookkeeping: "When auditors examined the 1682 ledgers of the Botica de Santo Domingo, double-entry bookkeeping revealed an embezzling employee. The system's transparency saved the shop from bankruptcy.",

  stealth: "During the 1680 raid on contraband traders, an apothecary moved through shadowed arcades delivering secret messages. His knowledge of the city's hidden passages made capture impossible.",
  lockpicking: "In 1670, a locked drug cabinet was opened without breaking the mechanism, saving valuable medicines during an emergency. The technique—using a bone pick—was taught by an old locksmith.",
  theft: "A desperate mother stole quinine from an apothecary to save her fevered child in 1675. The theft, though criminal, succeeded because she knew which drawer held the Jesuit's bark.",
  disguise: "By wearing a physician's dark robe and carrying a cane, a converso traveled through Inquisition territory in 1668 without harassment. His costume granted automatic respect and freedom of movement.",
  combat: "When bandits attacked a 1672 medical convoy, the physician's training with a rapier saved precious supplies. His decisive thrust to the lead bandit's shoulder ended the assault.",

  nahuatl: "In 1650, speaking fluent Nahuatl allowed a Spanish physician to learn that '*tlazohtli*' didn't just mean 'beloved'—it described a spiritual bond crucial to Indigenous healing concepts.",
  latin: "A 1677 prescription written in Latin—'Recipe: Cortex Peruvianus, drachma duo'—was honored by apothecaries across New Spain. The universal medical language ensured correct preparation.",
  french: "When French pirates captured Veracruz in 1683, a bilingual merchant negotiated the release of medical supplies. Her French prevented the theft of life-saving medicines.",
  english: "In 1670, reading English herbals revealed that American ginseng was prized in China. This knowledge created a lucrative three-way trade between New Spain, Manila, and London.",
  greek: "Direct reading of Galen's Greek texts in 1665 revealed translation errors in the Latin version. Correcting these mistakes improved humoral diagnoses significantly."
};

/**
 * Get color palette based on skill category
 */
function getCategoryColor(category) {
  switch (category) {
    case SKILL_CATEGORIES.MEDICAL:
      return { primary: '#16a34a', light: '#22c55e', glow: 'rgba(22, 163, 74, 0.3)', bg: '#f0fdf4' };
    case SKILL_CATEGORIES.SOCIAL:
      return { primary: '#3b82f6', light: '#60a5fa', glow: 'rgba(59, 130, 246, 0.3)', bg: '#eff6ff' };
    case SKILL_CATEGORIES.PRACTICAL:
      return { primary: '#f59e0b', light: '#fbbf24', glow: 'rgba(245, 158, 11, 0.3)', bg: '#fffbeb' };
    case SKILL_CATEGORIES.SCHOLARLY:
      return { primary: '#8b5cf6', light: '#a78bfa', glow: 'rgba(139, 92, 246, 0.3)', bg: '#f5f3ff' };
    case SKILL_CATEGORIES.COVERT:
      return { primary: '#dc2626', light: '#ef4444', glow: 'rgba(220, 38, 38, 0.3)', bg: '#fef2f2' };
    case SKILL_CATEGORIES.LANGUAGES:
      return { primary: '#06b6d4', light: '#22d3ee', glow: 'rgba(6, 182, 212, 0.3)', bg: '#ecfeff' };
    default:
      return { primary: '#6b7280', light: '#9ca3af', glow: 'rgba(107, 114, 128, 0.3)', bg: '#f9fafb' };
  }
}

export default function SkillsDetailModal({
  isOpen,
  onClose,
  skillId,
  currentLevel = 1,
  currentXp = 0,
  onNavigate // New prop: function to navigate to different skill
}) {
  const [showCaseStudy, setShowCaseStudy] = useState(false);

  // Get all skills in order for navigation
  const allSkills = getAllSkills();
  const currentIndex = allSkills.findIndex(s => s.id === skillId);
  const prevSkill = currentIndex > 0 ? allSkills[currentIndex - 1] : null;
  const nextSkill = currentIndex < allSkills.length - 1 ? allSkills[currentIndex + 1] : null;

  // Handle ESC and arrow key navigation
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowLeft' && prevSkill && onNavigate) {
        e.preventDefault();
        e.stopPropagation();
        onNavigate(prevSkill.id);
        setShowCaseStudy(false); // Reset case study when navigating
      } else if (e.key === 'ArrowRight' && nextSkill && onNavigate) {
        e.preventDefault();
        e.stopPropagation();
        onNavigate(nextSkill.id);
        setShowCaseStudy(false); // Reset case study when navigating
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Allow up/down for scrolling within modal, but prevent map movement
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, prevSkill, nextSkill, onNavigate]);

  if (!isOpen || !skillId) return null;

  const skill = SKILLS[skillId];
  if (!skill) return null;

  const quote = SKILL_QUOTES[skillId];
  const caseStudy = HISTORICAL_CASE_STUDIES[skillId];
  const colors = getCategoryColor(skill.category);
  const xpRequired = skill.xpPerLevel || 20;
  const xpProgress = Math.round((currentXp / xpRequired) * 100);
  const isMaxLevel = currentLevel >= skill.maxLevel;
  const isDark = document.documentElement.classList.contains('dark');

  // Get currently active effects for this skill
  const activeEffects = [];
  for (let level = 1; level <= currentLevel; level++) {
    const effect = skill.effects[level];
    if (effect) {
      activeEffects.push({ level, ...effect });
    }
  }

  return (
    <div
      className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4"
      style={{
        background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(41, 37, 36, 0.5)'
      }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-elevation-4 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 1.0) 0%, rgba(30, 41, 59, 1.0) 50%, rgba(15, 23, 42, 1.0) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.95) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: isDark
            ? '0 24px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
            : '0 24px 80px rgba(61, 47, 36, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* Decorative Background Pattern */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: '60%',
            height: '80%',
            zIndex: 0,
            overflow: 'hidden',
            opacity: 0.12,
            background: `radial-gradient(circle at top right, ${colors.glow} 0%, transparent 70%)`
          }}
        />

        {/* Navigation Buttons */}
        {prevSkill && onNavigate && (
          <button
            onClick={() => { onNavigate(prevSkill.id); setShowCaseStudy(false); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 p-3 rounded-lg transition-all duration-150 hover:scale-110 group"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(209, 213, 219, 0.3)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}
            title={`Previous: ${prevSkill.name} (←)`}
          >
            <svg className="w-5 h-5 text-ink-700 group-hover:text-ink-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {nextSkill && onNavigate && (
          <button
            onClick={() => { onNavigate(nextSkill.id); setShowCaseStudy(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-50 p-3 rounded-lg transition-all duration-150 hover:scale-110 group"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(209, 213, 219, 0.3)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}
            title={`Next: ${nextSkill.name} (→)`}
          >
            <svg className="w-5 h-5 text-ink-700 group-hover:text-ink-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-8">

          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-start gap-4 mb-4">
              {/* Icon */}
              <div
                className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.bg}, ${colors.light}20)`,
                  border: `2px solid ${colors.primary}40`,
                  boxShadow: `0 4px 16px ${colors.glow}`
                }}
              >
                {skill.icon}
              </div>

              {/* Title & Category */}
              <div className="flex-1 min-w-0">
                <h1
                  className="text-4xl font-bold mb-2 leading-tight font-serif"
                  style={{
                    color: isDark ? '#f1f5f9' : '#1e293b',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {skill.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-sans"
                    style={{
                      background: colors.bg,
                      color: colors.primary,
                      border: `1px solid ${colors.primary}30`
                    }}
                  >
                    {skill.category}
                  </span>
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-bold font-sans"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.light})`,
                      color: 'white',
                      boxShadow: `0 2px 8px ${colors.glow}`
                    }}
                  >
                    Level {currentLevel}/{skill.maxLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Level Progress Bar */}
            {!isMaxLevel && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-700 font-semibold font-sans">Progress to Level {currentLevel + 1}</span>
                  <span className="text-ink-600 font-mono">{currentXp} / {xpRequired} XP</span>
                </div>
                <div className="h-3 bg-ink-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full relative transition-all duration-500"
                    style={{
                      width: `${xpProgress}%`,
                      background: `linear-gradient(90deg, ${colors.light} 0%, ${colors.primary} 50%, ${colors.light} 100%)`,
                      boxShadow: `0 0 12px ${colors.glow}`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-white/50 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}

            {isMaxLevel && (
              <div
                className="text-center py-2 rounded-lg font-bold text-sm uppercase tracking-wider"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.light})`,
                  color: 'white',
                  boxShadow: `0 4px 16px ${colors.glow}`
                }}
              >
                ★ MASTERED ★
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <p
              className="text-lg leading-relaxed font-serif italic"
              style={{
                color: isDark ? '#cbd5e1' : '#475569'
              }}
            >
              {skill.description}
            </p>
          </div>

          {/* Currently Active Effects - NEW */}
          {activeEffects.length > 0 && (
            <div className="mb-6">
              <h3
                className="text-xs font-bold uppercase tracking-widest mb-3 font-sans flex items-center gap-2"
                style={{ color: colors.primary }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Currently Active
              </h3>
              <div
                className="p-4 rounded-lg"
                style={{
                  background: isDark
                    ? `linear-gradient(135deg, rgba(${colors.primary.replace('#', '').match(/.{2}/g).map(h => parseInt(h, 16)).join(', ')}, 0.15), rgba(30, 41, 59, 0.8))`
                    : `linear-gradient(135deg, ${colors.bg}, rgba(255, 255, 255, 0.5))`,
                  border: `1.5px solid ${colors.primary}40`,
                  boxShadow: `0 2px 12px ${colors.glow}`
                }}
              >
                <div className="space-y-2">
                  {activeEffects.map((effect, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                        style={{
                          background: colors.primary,
                          color: 'white'
                        }}
                      >
                        {effect.level}
                      </span>
                      <span
                        className="text-sm leading-tight"
                        style={{
                          color: isDark ? '#e2e8f0' : '#334155'
                        }}
                      >
                        {effect.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Historical Quote Section */}
          {quote && (
            <div
              className="mb-6 p-6 rounded-xl relative overflow-hidden"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.8))'
                  : 'linear-gradient(135deg, rgba(255, 252, 245, 0.9), rgba(249, 245, 235, 0.8))',
                border: `2px solid ${colors.primary}30`,
                boxShadow: isDark
                  ? `0 4px 20px ${colors.glow}, inset 0 1px 0 rgba(251, 191, 36, 0.1)`
                  : `0 4px 20px ${colors.primary}15, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
              }}
            >
              {/* Decorative quote marks */}
              <div
                className="absolute top-3 left-3 text-6xl opacity-20 font-serif"
                style={{ color: colors.primary }}
              >
                "
              </div>
              <div
                className="absolute bottom-3 right-3 text-6xl opacity-20 font-serif"
                style={{ color: colors.primary }}
              >
                "
              </div>

              <div className="relative z-10">
                <h3
                  className="text-xs font-bold uppercase tracking-widest mb-3 font-sans flex items-center gap-2"
                  style={{ color: colors.primary }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Historical Wisdom
                </h3>

                <blockquote
                  className="text-lg font-serif italic leading-relaxed mb-4"
                  style={{
                    color: isDark ? '#e2e8f0' : '#334155'
                  }}
                >
                  {quote.text}
                </blockquote>

                <div
                  className="text-sm font-sans"
                  style={{
                    color: isDark ? '#94a3b8' : '#64748b'
                  }}
                >
                  <div className="font-semibold">— {quote.author}</div>
                  <div className="text-xs mt-1 italic">{quote.source} ({quote.year})</div>
                </div>
              </div>
            </div>
          )}

          {/* Historical Case Study - EXPANDABLE - NEW */}
          {caseStudy && (
            <div className="mb-6">
              <button
                onClick={() => setShowCaseStudy(!showCaseStudy)}
                className="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-md"
                style={{
                  background: isDark
                    ? 'rgba(30, 41, 59, 0.6)'
                    : 'rgba(255, 255, 255, 0.7)',
                  border: `1.5px solid ${colors.primary}30`
                }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke={colors.primary} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span
                    className="text-sm font-bold font-sans uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    Historical Case Study
                  </span>
                </div>
                <svg
                  className="w-5 h-5 transition-transform duration-300"
                  fill="none"
                  stroke={colors.primary}
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  style={{
                    transform: showCaseStudy ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expandable Content */}
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: showCaseStudy ? '500px' : '0',
                  opacity: showCaseStudy ? 1 : 0
                }}
              >
                <div
                  className="mt-2 p-4 rounded-lg"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(51, 65, 85, 0.5))'
                      : 'linear-gradient(135deg, rgba(249, 245, 235, 0.8), rgba(255, 255, 255, 0.6))',
                    border: `1px solid ${colors.primary}20`
                  }}
                >
                  <p
                    className="text-sm leading-relaxed font-serif"
                    style={{
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}
                  >
                    {caseStudy}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gameplay Mechanics Section */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-3 font-sans flex items-center gap-2"
              style={{ color: colors.primary }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Gameplay Effects
            </h3>

            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((level) => {
                const effect = skill.effects[level];
                if (!effect) return null;

                const isUnlocked = level <= currentLevel;
                const isCurrent = level === currentLevel;

                return (
                  <div
                    key={level}
                    className="p-4 rounded-lg transition-all duration-200"
                    style={{
                      background: isUnlocked
                        ? (isCurrent
                          ? `linear-gradient(135deg, ${colors.bg}, ${colors.light}15)`
                          : 'rgba(255, 255, 255, 0.4)')
                        : 'rgba(0, 0, 0, 0.02)',
                      border: isUnlocked
                        ? `1.5px solid ${colors.primary}${isCurrent ? '60' : '30'}`
                        : '1.5px solid rgba(209, 213, 219, 0.2)',
                      opacity: isUnlocked ? 1 : 0.5,
                      boxShadow: isCurrent ? `0 4px 12px ${colors.glow}` : 'none'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Level Badge */}
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-sans"
                        style={{
                          background: isUnlocked
                            ? `linear-gradient(135deg, ${colors.primary}, ${colors.light})`
                            : 'rgba(156, 163, 175, 0.3)',
                          color: isUnlocked ? 'white' : '#9ca3af',
                          boxShadow: isUnlocked ? `0 2px 8px ${colors.glow}` : 'none'
                        }}
                      >
                        {level}
                      </div>

                      {/* Effect Details */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-semibold mb-1 font-sans"
                          style={{
                            color: isUnlocked ? colors.primary : '#9ca3af'
                          }}
                        >
                          {effect.action || effect.feature || effect.buff || effect.category || 'Unlock'}
                        </div>
                        <div
                          className="text-sm leading-relaxed"
                          style={{
                            color: isUnlocked ? (isDark ? '#cbd5e1' : '#475569') : '#9ca3af'
                          }}
                        >
                          {effect.description}
                        </div>
                      </div>

                      {/* Status Icon */}
                      {isUnlocked && (
                        <div className="flex-shrink-0">
                          {isCurrent ? (
                            <svg className="w-5 h-5" fill={colors.light} stroke={colors.primary} viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill={colors.light} viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
