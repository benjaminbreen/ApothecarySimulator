import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { entityManager } from '../core/entities/EntityManager';
import NPCPatientModal from '../features/medical/components/NPCPatientModal';
import POIModal from './POIModal';
import { EntityTooltip, EntityPopup } from './EntityTooltipPopup';
import ActionPromptCard from './ActionPromptCard';
import MixingDecisionCard from '../features/crafting/components/MixingDecisionCard';
import SimpleInteractionCard from './SimpleInteractionCard';
import RandomEventCard from './RandomEventCard';
import ExitConfirmationCard from './ExitConfirmationCard';

/**
 * Sound effect definitions - maps trigger keywords to visual effects
 */
const SOUND_EFFECTS = {
  knock: {
    keywords: ['knock', 'knocking', 'knocked', 'knocks', 'rapping', 'rapped', 'tapping', 'tapped'],
    text: 'KNOCK, KNOCK, KNOCK...',
    color: '#a83319',
    shadow: '0 0 20px rgba(139, 69, 19, 0.1)',
  },
  bell: {
    keywords: ['bell', 'ring', 'ringing', 'rang', 'chime', 'chiming', 'ting', 'ding', 'clang', 'clanging', 'toll', 'tolling'],
    text: '🔔 DING DING DING!',
    color: '#fbbf24',
    gradient: 'linear-gradient(135deg, #fde047 0%, #fbbf24 50%, #f59e0b 100%)',
    shadow: '0 0 20px rgba(251, 191, 36, 0.6)',
  },
  scream: {
    keywords: ['scream', 'screaming', 'screamed', 'shriek', 'shrieking', 'shrieked', 'yell', 'yelling', 'yelled', 'shout', 'shouting', 'shouted', 'cry', 'cried'],
    text: '😱 AAAAAHHH!',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 50%, #dc2626 100%)',
    shadow: '0 0 20px rgba(239, 68, 68, 0.6)',
  },
  crash: {
    keywords: ['crash', 'crashing', 'crashed', 'shatter', 'shattering', 'shattered', 'smash', 'smashing', 'smashed', 'break', 'breaking', 'broke', 'broken'],
    text: '💥 CRASH!',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
    shadow: '0 0 20px rgba(249, 115, 22, 0.6)',
  },
  footsteps: {
    keywords: ['footstep', 'footsteps', 'footfall', 'footfalls', 'step', 'stepping', 'stepped', 'steps', 'walking', 'walked', 'walk', 'tread', 'treading'],
    text: '👣 tap tap tap...',
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #475569 100%)',
    shadow: '0 0 20px rgba(100, 116, 139, 0.6)',
  },
};

/**
 * SoundEffectDisplay - Animated fighting-game style sound effect
 */
function SoundEffectDisplay({ effect, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate particles immediately
    const particleCount = 15;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 200 - 100, // -100 to 100px horizontal spread
      y: -(Math.random() * 80 + 40), // -40 to -120px vertical movement
      rotation: Math.random() * 360,
      delay: 1000 + i * 40, // Start after text appears
      duration: 2000 + Math.random() * 500,
     
    }));

    setParticles(newParticles);

    // Complete animation after 2.5 seconds
    const timeout = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => clearTimeout(timeout);
  }, [effect, onComplete]);

  // Split text into words for sequential animation
  const words = effect.text.split(' ');

  return (
    <div
      className="fixed z-[100] pointer-events-none"
      style={{
        bottom: '30px',
        left: '70%',
        transform: 'translateX(-50%)',
      }}
    >
      {/* Animated words */}
      <div className="flex gap-2 items-center px-5 py-1 rounded" style={{
        backgroundColor: `${effect.color}0`,
        animation: 'containerFadeOut 4.5s ease-in-out forwards',
      }}>
        {words.map((word, index) => {
          // Alternate rotation: 10deg, -10deg, 10deg, -10deg...
          const rotation = index % 2 === 0 ? 10 : -10;
          const delay = index * 500; // 500ms between each word

          return (
            <span
              key={index}
              className="font text-xs tracking-widest inline-block"
              style={{
                color: effect.color,
                textShadow: `0 0 2px ${effect.color}60`,
                animation: `wordFadeIn-${index} 3.5s ease-out forwards`,
                animationDelay: `${delay}ms`,
                opacity: 0,
              }}
            >
              {word}
              <style>{`
                @keyframes wordFadeIn-${index} {
                  0% {
                    opacity: 0;
                    transform: rotate(${rotation}deg) translateY(5px);
                  }
                  100% {
                    opacity: 1;
                    transform: rotate(${rotation}deg) translateY(0);
                  }
                }
              `}</style>
            </span>
          );
        })}
      </div>

      {/* Particle effects */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            animation: `particle-float-${particle.id} ${particle.duration}ms ease-out forwards`,
            animationDelay: `${particle.delay}ms`,
          }}
        >
          <div
            className="text-xs"
            style={{
              transform: `rotate(${particle.rotation}deg)`,
              filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))',
            }}
          >
            {particle.char}
          </div>
          <style>{`
            @keyframes particle-float-${particle.id} {
              0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(calc(-50% + ${particle.x}px), calc(-50% + ${particle.y}px)) scale(0.3);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      ))}

      {/* Global fade out animation for entire container */}
      <style>{`
        @keyframes containerFadeOut {
          0% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Detects sound effects from narrative text
 * Prioritizes the effect whose keyword appears FIRST in the text
 * Uses word boundary matching to avoid false positives (e.g., "rang" in "warning")
 */
function detectSoundEffects(text) {
  if (typeof text !== 'string') return null;

  const lowerText = text.toLowerCase();
  let earliestMatch = null;
  let earliestPosition = Infinity;

  // Check each sound effect definition
  for (const [key, effect] of Object.entries(SOUND_EFFECTS)) {
    // Find the earliest position of any keyword for this effect
    for (const keyword of effect.keywords) {
      // Use regex with word boundaries to match whole words only
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
      const match = lowerText.match(regex);

      if (match && match.index < earliestPosition) {
        earliestPosition = match.index;
        earliestMatch = effect;
        console.log(`[SoundEffect] Found whole word "${keyword}" at position ${match.index}`);
      }
    }
  }

  if (earliestMatch) {
    console.log(`[SoundEffect] ✅ Triggered effect at position ${earliestPosition}:`, earliestMatch.text);
    return earliestMatch;
  }

  console.log('[SoundEffect] No keywords matched in text');
  return null;
}

/**
 * Preprocesses content to wrap quoted dialogue in markdown bold syntax
 * Converts "dialogue" or "dialogue" to **"dialogue"** for semibold rendering
 */
function boldQuotedDialogue(content) {
  if (typeof content !== 'string') return content;

  // Match text within straight quotes "..." or curly quotes "..."
  // Wrap the entire quoted portion (including quotes) with ** markers
  return content
    .replace(/"([^"]+)"/g, '**"$1"**')  // Straight quotes
    .replace(/"([^"]+)"/g, '**"$1"**'); // Curly quotes
}

/**
 * Core function that processes text and highlights entity names
 * This is used by all text-containing components (text, strong, em, p, etc.)
 */
function highlightEntitiesInText(text, sortedNPCs) {
  if (typeof text !== 'string') return text;

  let parts = [text];

  // Running counter to ensure unique keys across all entity spans
  let entityCounter = 0;

  // Split text by each entity name, replacing matches with clickable spans
  sortedNPCs.forEach((npcName) => {
    const newParts = [];
    parts.forEach(part => {
      if (typeof part !== 'string') {
        // Already a React element, keep it
        newParts.push(part);
        return;
      }

      // Create regex to match entity name (case insensitive, whole word)
      const regex = new RegExp(`\\b(${npcName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
      const segments = part.split(regex);

      segments.forEach((segment, i) => {
        if (i % 2 === 0) {
          // Regular text (non-match)
          if (segment) newParts.push(segment);
        } else {
          // Entity name match - wrap in clickable span
          const npcData = entityManager.getRawByName(segment);
          const entityType = (npcData?.entityType || npcData?.type || '').toLowerCase();

          // Determine className based on entity type
          let className = 'npc-name'; // Default
          if (entityType === 'patient') {
            className = 'patient-name';
          } else if (entityType === 'item') {
            className = 'item-name';
          } else if (entityType === 'location') {
            className = 'location-name';
          }

          const description = npcData?.description || 'No additional information available.';

          // Use running counter for truly unique keys
          newParts.push(
            <span
              key={`entity-${npcName}-${entityCounter++}`}
              className={className}
              data-npc-name={segment}
              data-description={description}
            >
              {segment}
            </span>
          );
        }
      });
    });
    parts = newParts;
  });

  return <>{parts}</>;
}

/**
 * Create custom renderers for ReactMarkdown that highlight entity names
 * This creates wrappers for all text-containing elements so highlighting works
 * even when text is inside bold, italic, or other formatting
 */
function createEntityHighlightingComponents(recentNPCs = []) {
  // Get all entities from EntityManager, filter to NPCs, patients, locations, and items
  // Items are now included to support POI furniture (Drug Cabinet, Sales Counter, etc.)
  const allEntities = entityManager.getAll();
  const highlightableEntities = allEntities.filter(entity => {
    const type = entity.entityType || entity.type;
    return type === 'npc' || type === 'patient' || type === 'location' || type === 'item';
  });
  const highlightableNames = highlightableEntities.map(entity => entity.name);

  // Combine recentNPCs with highlightable entities, remove duplicates
  const allNames = [...new Set([...recentNPCs, ...highlightableNames])];

  // EXCLUDE player name "Doña Maria" from highlighting (prevents nonsensical backstory generation)
  const filteredNames = allNames.filter(name =>
    name !== 'Doña Maria' && name !== 'Dona Maria' && name !== 'Maria de Lima'
  );

  // Sort by name length (longest first) to avoid partial matches
  const sortedNPCs = [...filteredNames].sort((a, b) => b.length - a.length);

  // Log once when components are created
  if (sortedNPCs.length > 0 && !window.__entityComponentsLogged) {
    console.log('[EntityHighlighter] Highlighting', sortedNPCs.length, 'entities (NPCs, patients, locations, items)');
    window.__entityComponentsLogged = true;
  }

  // Return components for all text-containing markdown elements
  return {
    // Bare text nodes
    text: ({ children }) => {
      if (typeof children !== 'string') return children;
      return highlightEntitiesInText(children, sortedNPCs);
    },

    // Bold text (from **text** or __text__)
    strong: ({ children, ...props }) => {
      const processedChildren = React.Children.map(children, child => {
        if (typeof child === 'string') {
          return highlightEntitiesInText(child, sortedNPCs);
        }
        return child;
      });
      return <strong {...props}>{processedChildren}</strong>;
    },

    // Italic text (from *text* or _text_)
    em: ({ children, ...props }) => {
      const processedChildren = React.Children.map(children, child => {
        if (typeof child === 'string') {
          return highlightEntitiesInText(child, sortedNPCs);
        }
        return child;
      });
      return <em {...props}>{processedChildren}</em>;
    },

    // Paragraphs
    p: ({ children, ...props }) => {
      const processedChildren = React.Children.map(children, child => {
        if (typeof child === 'string') {
          return highlightEntitiesInText(child, sortedNPCs);
        }
        return child;
      });
      return <p {...props}>{processedChildren}</p>;
    }
  };
}

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-start gap-3 animate-fade-in">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-parchment-100 to-white dark:from-slate-700 dark:to-slate-800 border-2 border-ink-200 dark:border-slate-600 flex items-center justify-center shadow-elevation-1 dark:shadow-dark-elevation-1 mt-1 transition-colors duration-300">
      <svg className="w-5 h-5 text-ink-600 dark:text-parchment-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <div className="bg-gradient-to-br from-white to-parchment-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-ink-200 dark:border-slate-600 shadow-sm dark:shadow-dark-elevation-1 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="typing-dot"></div>
          <div className="typing-dot delay-1"></div>
          <div className="typing-dot delay-2"></div>
        </div>
      </div>
    </div>
    <style>{`
      .typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #64748b;
        animation: typing-bounce 1.4s infinite ease-in-out;
      }
      .typing-dot.delay-1 {
        animation-delay: 0.2s;
      }
      .typing-dot.delay-2 {
        animation-delay: 0.4s;
      }
      @keyframes typing-bounce {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.7;
        }
        30% {
          transform: translateY(-10px);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

const NarrativeEntry = React.memo(({
  entry,
  index,
  recentNPCs = [],
  isBookmarked,
  onToggleBookmark,
  playerPortrait,
  entityComponents,
  // Card-related props
  onOpenContractModal,
  onSimpleInteractionChoice,
  onRandomEventChoice,
  onConfirmExit,
  onCancelExit,
  gameState,
  isDarkMode
}) => {
  const isUser = entry.role === 'user';
  const isSystem = entry.role === 'system';
  const content = entry.content || '';

  // Get NPC data for portraits
  const getNPCData = () => {
    if (isUser || isSystem) return null;

    // Try to extract NPC name from content
    const allEntities = entityManager.getAll();
    const npcNames = allEntities.map(entity => entity.name);
    const foundNPC = npcNames.find(name => content.includes(name));

    if (foundNPC) {
      return entityManager.getByName(foundNPC);
    }
    return null;
  };

  const npcData = getNPCData();

  // Detect if content has certain keywords to add contextual tags
  const getTags = (text) => {
    const tags = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('plague') || lowerText.includes('pestilence') || lowerText.includes('spots')) {
      tags.push({ icon: '🦠', text: 'Plague Risk', color: 'danger' });
    }
    if (lowerText.includes('diagnose') || lowerText.includes('symptoms') || lowerText.includes('examination')) {
      tags.push({ icon: '🧪', text: 'Medical', color: 'potion' });
    }
    if (lowerText.includes('decision') || lowerText.includes('choice') || lowerText.includes('choose')) {
      tags.push({ icon: '⚖️', text: 'Decision Point', color: 'warning' });
    }

    return tags;
  };

  const tags = getTags(content);

  // Get tooltip text for entry icon
  const getTooltipText = () => {
    if (isUser) {
      return "Maria's action";
    }
    if (isSystem) {
      return "System message";
    }

    // NPC portrait present
    if (entry.primaryPortrait) {
      return "This turn shows an NPC physically present in the scene";
    }

    // Movement turn
    if (entry.responseType === 'movement') {
      return "This is a *movement turn*, recording movement in space";
    }

    // Next steps turn (after simple interactions)
    if (entry.responseType === 'next_steps') {
      return "This is a *next steps turn*, offering guidance after a brief interaction";
    }

    // Default: narration turn
    return "This is a *narration turn*, focusing on describing events";
  };

  // Determine entry icon based on content or role
  const getEntryIcon = () => {
    // User input: Maria's portrait
    if (isUser) {
      return (
        <img
          src={playerPortrait || "/assets/marianormal.jpg"}
          alt="Maria de Lima"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to icon if image fails to load
            e.target.outerHTML = '<svg class="w-5 h-5 text-botanical-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>';
          }}
        />
      );
    }

    // System messages: gear icon
    if (isSystem) {
      return (
        <svg className="w-5 h-5 text-potion-600 dark:text-amber-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      );
    }

    // PHASE 3B: Three response modes for assistant messages

    // NPC PORTRAIT: Show if LLM selected a portrait (works for both dialogue and narration modes)
    if (entry.primaryPortrait) {
      return (
        <img
          src={`/portraits/${entry.primaryPortrait}`}
          alt={entry.npcSpeaker || 'NPC'}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.warn('[NarrativePanel] Failed to load NPC portrait:', entry.primaryPortrait);
            // Fallback to botica entrance if portrait fails
            e.target.src = '/maps/boticaentrance.png';
          }}
        />
      );
    }

    // MOVEMENT MODE: Compass icon
    if (entry.responseType === 'movement') {
      return (
        <svg className="w-5 h-5 text-botanical-600 dark:text-botanical-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      );
    }

    // NEXT STEPS MODE: Question mark icon (after simple interactions)
    if (entry.responseType === 'next_steps') {
      return (
        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      );
    }

    // NARRATION MODE (default): Book icon
    return (
      <svg className="w-6 h-6 text-ink-600 dark:text-parchment-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    );
  };

  // Check if user content has a system announcement appended (common pattern)
  const hasCombinedContent = isUser && (
    content.includes('Someone approaches:') ||
    content.includes('appears:') ||
    content.includes('steps forth:') ||
    content.match(/\n\n[A-Z][\w\s]+:/m)
  );

  let userContent = content;
  let systemAnnouncement = null;

  if (hasCombinedContent) {
    // Split user action from system announcement
    const parts = content.split(/\n\n(?=Someone approaches:|.*appears:|.*steps forth:)/);
    if (parts.length > 1) {
      userContent = parts[0];
      systemAnnouncement = parts.slice(1).join('\n\n');
    }
  }

  // Special handling for initial narrative (index 0) - full width, no icon, larger text, pure markdown with NPC highlighting
  if (index === 0 && !isUser && !isSystem) {
    return (
      <div className="narrative-entry-animated" data-entry-index={index} data-primary-portrait={entry.primaryPortrait || ''} data-primary-npc-name={entry.primaryNPCName || ''}>
        <div className="bg-gradient-to-br from-white to-parchment-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-ink-200 dark:border-slate-600 shadow-elevation-1 dark:shadow-dark-elevation-1 transition-all duration-300">
          <div className="prose prose-lg max-w-none initial-narrative">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={entityComponents}
            >
              {boldQuotedDialogue(content)}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // Action result styling (for give/sell/prescribe completions)
  const actionResultStyles = {
    give: {
      borderColor: 'border-emerald-400/40 dark:border-emerald-600/40',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-900/20',
      icon: '🎁',
      iconBg: 'bg-emerald-500',
      label: 'Given'
    },
    sell: {
      borderColor: 'border-amber-400/40 dark:border-amber-600/40',
      bgColor: 'bg-amber-50/50 dark:bg-amber-900/20',
      icon: '💰',
      iconBg: 'bg-amber-500',
      label: 'Sold'
    },
    prescribe: {
      borderColor: 'border-purple-400/40 dark:border-purple-600/40',
      bgColor: 'bg-purple-50/50 dark:bg-purple-900/20',
      icon: '⚕️',
      iconBg: 'bg-purple-500',
      label: 'Prescribed'
    }
  };

  const actionStyle = entry.actionResultType ? actionResultStyles[entry.actionResultType] : null;

  return (
    <div className="narrative-entry-animated space-y-2" data-entry-index={index} data-primary-portrait={entry.primaryPortrait || ''} data-primary-npc-name={entry.primaryNPCName || ''}>
      {/* Action Result Header - Special styling for give/sell/prescribe completions */}
      {actionStyle && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${actionStyle.borderColor} ${actionStyle.bgColor} animate-fade-in`}>
          <div className={`w-6 h-6 ${actionStyle.iconBg} rounded-full flex items-center justify-center text-white text-sm`}>
            {actionStyle.icon}
          </div>
          <span className="text-sm font-semibold text-ink-700 dark:text-parchment-200">
            {actionStyle.label}
          </span>
        </div>
      )}

      <div className={`flex items-start gap-3 relative group ${isUser ? 'flex-row-reverse' : ''} ${actionStyle ? actionStyle.borderColor + ' border-l-4 pl-2' : ''}`}>
        {/* NPC Mini Portrait - show for dialogue, positioned inside container */}
      
      

        {/* Circular icon */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-parchment-100 to-white dark:from-slate-700 dark:to-slate-800 border-2 border-ink-200 dark:border-slate-600 flex items-center justify-center shadow-elevation-1 dark:shadow-dark-elevation-1 mt-1 overflow-hidden transition-colors duration-300 cursor-help"
          title={getTooltipText()}
        >
          {getEntryIcon()}
        </div>
        <div className="flex-1 min-w-0 relative">

        {/* Bookmark button - positioned inside, top-right corner of content */}
        {!isUser && (
          <button
            onClick={() => onToggleBookmark?.(index)}
            className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-parchment-100 rounded-lg hover:scale-110"
            title={isBookmarked ? "Remove bookmark" : "Bookmark this moment"}
          >
            <svg
              className={`w-4 h-4 transition-colors ${isBookmarked ? 'text-yellow-500 fill-yellow-500' : 'text-ink-400'}`}
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        )}
          {isUser ? (
            <div className="bg-gradient-to-br from-botanical-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl p-2.5 border border-botanical-200 dark:border-slate-600 shadow-elevation-1 dark:shadow-dark-elevation-1 transition-all duration-300">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={entityComponents}
                  className="text-xl text-ink-900 dark:text-parchment-100 font-serif italic leading-normal font-medium transition-colors duration-300"
                >
                  {userContent}
                </ReactMarkdown>
              </div>
            </div>
          ) : isSystem ? (
            // System announcements - sans serif, no bubble, italic
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={entityComponents}
                className="text-base text-ink-700 dark:text-parchment-300 font-sans leading-relaxed italic transition-colors duration-300"
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div>
              {/* DIALOGUE MODE - RESERVED FOR FUTURE COMPANION TRAVEL FEATURE
                  This styling displays pure NPC speech during companion travel (Maria walking with an NPC).
                  NOT used in normal gameplay - NPC dialogue is embedded in narration mode instead.
                  Kept here for future animated map travel feature where Maria follows an NPC to a location. */}
              {entry.responseType === 'dialogue' && entry.dialogue ? (
                <div className="bg-gradient-to-br from-parchment-100/20 via-parchment-50/50 to-white dark:from-slate-800 dark:via-slate-750 dark:to-slate-700 rounded-2xl p-3.5 border-2 border-parchment-300 dark:border-amber-600/30 shadow-elevation-2 dark:shadow-dark-elevation-2 relative transition-all duration-300">
                  <div className="prose prose-lg max-w-none relative z-10">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={entityComponents}
                      className="text-[21px] text-parchment-900 dark:text-parchment-100 font-serif italic transition-colors duration-300"
                    >
                      {boldQuotedDialogue(entry.dialogue)}
                    </ReactMarkdown>
                  </div>
                  {/* Optional: Show speaker name */}
                  {entry.npcSpeaker && (
                    <div className="text-xs text-parchment-600 dark:text-parchment-400 mt-2 font-serif">
                      — {entry.npcSpeaker}
                    </div>
                  )}
                </div>
              ) : content.includes('"') || content.includes('"') ? (
                // Legacy: NPC dialogue detected by quotation marks
                <div className="bg-gradient-to-br from-parchment-100/20 via-parchment-50/50 to-white dark:from-slate-800 dark:via-slate-750 dark:to-slate-700 rounded-2xl p-3.5 border-2 border-parchment-300 dark:border-amber-600/30 shadow-elevation-2 dark:shadow-dark-elevation-2 relative transition-all duration-300">

                  <div className="prose prose-lg max-w-none relative z-10">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={entityComponents}
                      className="text-[21px] text-parchment-900 dark:text-parchment-100 font-serif transition-colors duration-300"
                    >
                      {boldQuotedDialogue(content)}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : entry.responseType === 'movement' ? (
                // PHASE 3B: Movement mode - distinct travel/navigation styling
                <div className="bg-gradient-to-br from-botanical-50/30 to-parchment-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-3.5 border border-botanical-200 dark:border-slate-600 shadow-elevation-1 dark:shadow-dark-elevation-1 transition-all duration-300">
                  {/* Extract direction from content for header */}
                  {(() => {
                    const directionMatch = content.match(/\b(north|south|east|west)\b/i);
                    const direction = directionMatch ? directionMatch[1] : null;
                    return direction && (
                      <div className="text-xs font-bold uppercase tracking-wider text-botanical-700 dark:text-botanical-400 mb-2 flex items-center gap-1.5">
                        <span>→</span>
                        <span>Heading {direction.charAt(0).toUpperCase() + direction.slice(1)}</span>
                      </div>
                    );
                  })()}
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={entityComponents}
                      className="text-[20px] text-ink-800 dark:text-parchment-100 font-sans transition-colors duration-300"
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : entry.responseType === 'next_steps' ? (
                // NEXT STEPS MODE: Reflective prompt after simple interactions
                <div className="bg-gradient-to-br from-amber-50/40 to-parchment-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-3.5 border border-amber-200 dark:border-amber-600/20 shadow-elevation-1 dark:shadow-dark-elevation-1 transition-all duration-300">
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={entityComponents}
                      className="text-[21px] text-ink-800 dark:text-parchment-100 font-serif transition-colors duration-300"
                    >
                      {boldQuotedDialogue(content)}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                // Regular narrative description - serif in bubble, LARGER
                <div className="bg-gradient-to-br from-white to-parchment-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-3.5 border border-ink-200 dark:border-slate-600 shadow-elevation-1 dark:shadow-dark-elevation-1 transition-all duration-300">
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={entityComponents}
                      className="text-[22px] text-ink-800 dark:text-parchment-100 font-serif  transition-colors duration-300"
                    >
                      {boldQuotedDialogue(content)}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 bg-${tag.color}-100 text-${tag.color}-700 text-sm rounded-full font-semibold font-sans inline-flex items-center gap-1.5 shadow-elevation-1`}
                    >
                      <span>{tag.icon}</span>
                      <span>{tag.text}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* System announcement if it was combined with user input */}
      {systemAnnouncement && (
        <div className="flex items-start gap-4 ml-14">
          <div className="flex-1 min-w-0">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={entityComponents}
                className="text-lg text-ink-700 dark:text-parchment-300 font-sans leading-relaxed italic transition-colors duration-300"
              >
                {systemAnnouncement}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Cards - Rendered from conversation history metadata */}
      {entry.card && (
        <div className="mt-3 animate-fade-in">
          {/* Contract Card */}
          {entry.card.type === 'contract' && onOpenContractModal && (
            <div className="w-full p-4 bg-gradient-to-r from-amber-500/90 to-yellow-600 dark:from-amber-700 dark:to-yellow-800 rounded-xl shadow-lg border-2 border-amber-400/20 dark:border-amber-600/30">
              <div className="flex items-center gap-3">
                {/* Contract Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-bold text-lg mb-0.5">
                    {entry.card.data.type === 'treatment' ? 'Treatment Contract Available' : 'Sale Request'}
                  </div>
                  <div className="text-amber-100 dark:text-amber-200 text-sm font-medium">
                    {entry.card.data.offeredBy} is seeking your services
                  </div>
                </div>
                <button
                  onClick={onOpenContractModal}
                  className="flex-shrink-0 px-4 py-2 bg-white hover:bg-amber-50 text-amber-600 font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2"
                >
                  Negotiate Terms
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Simple Interaction Card */}
          {entry.card.type === 'simple_interaction' && onSimpleInteractionChoice && (
            <SimpleInteractionCard
              interaction={entry.card.data}
              onChoice={(action) => onSimpleInteractionChoice(action, entry.card.data)}
              currentWealth={gameState.wealth || 0}
              inventory={gameState.inventory || []}
              isDark={isDarkMode}
            />
          )}

          {/* Random Event Card */}
          {entry.card.type === 'random_event' && onRandomEventChoice && (
            <RandomEventCard
              eventCard={entry.card.data}
              onChoice={(action) => onRandomEventChoice(action, entry.card.data)}
              currentWealth={gameState.wealth || 0}
              energy={gameState.energy || 100}
              health={gameState.health || 100}
              inventory={gameState.inventory || []}
              isDark={isDarkMode}
            />
          )}

          {/* Exit Confirmation Card */}
          {entry.card.type === 'exit_confirmation' && onConfirmExit && onCancelExit && (
            <ExitConfirmationCard
              exitData={entry.card.data}
              onConfirm={onConfirmExit}
              onCancel={onCancelExit}
              isDark={isDarkMode}
            />
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if these specific props change
  // This prevents all entries from re-rendering when hover state changes in parent
  return (
    prevProps.entry === nextProps.entry &&
    prevProps.isBookmarked === nextProps.isBookmarked &&
    prevProps.entityComponents === nextProps.entityComponents &&
    prevProps.playerPortrait === nextProps.playerPortrait
  );
});

const NarrativePanel = ({
  conversationHistory = [],
  isOpen,
  toggleHistory,
  recentNPCs = [],
  isLoading = false,
  playerPortrait,
  activePatient,
  onSwitchToPatientView,
  pendingPrescription,
  pendingContract = null, // Contract offer pending negotiation
  onOpenContractModal = null, // Handler to open contract modal
  pendingExitConfirmation = null, // Exit confirmation data
  onConfirmExit = null, // Handler to confirm exit
  onCancelExit = null, // Handler to cancel exit
  tradeOpportunities = [], // Active trade opportunities from StateAgent
  onAcceptTrade = null, // Handler to open trade modal with NPC
  onDeclineTrade = null, // Handler to decline trade opportunity
  pendingSimpleInteraction = null, // Simple interaction (service offers, donations, etc.)
  onSimpleInteractionChoice = null, // Handler for simple interaction choices
  pendingActionPrompt = null, // Action prompt (give/sell/prescribe)
  onProposeAction = null, // Handler to propose action
  onDeclineAction = null, // Handler to decline action
  pendingMixingDecision = null, // Mixing decision (craft remedy prompt)
  onOpenMixingWorkshop = null, // Handler to open mixing workshop
  onAbandonMixing = null, // Handler to abandon mixing opportunity
  pendingRandomEvent = null, // Random event (variety gameplay moments)
  onRandomEventChoice = null, // Handler for random event choices
  gameState = {}, // Game state for wealth/inventory
  updateInventory = null, // Handler to update inventory quantities
  fontSize = 'text-base',
  isDarkMode = false
}) => {
  const narrativeRef = useRef(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showPOIModal, setShowPOIModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [bookmarkedIndices, setBookmarkedIndices] = useState(new Set());

  // Entity tooltip and compact popup state
  const [hoveredEntity, setHoveredEntity] = useState(null); // { name, description, rect }
  const [showEntityPopup, setShowEntityPopup] = useState(false);
  const [popupEntity, setPopupEntity] = useState(null);

  // Sound effect state
  const [activeSoundEffect, setActiveSoundEffect] = useState(null);

  // Debounce timer for hover state
  const hoverTimeoutRef = useRef(null);

  // Stabilize recentNPCs reference - only update when actual content changes (not just array reference)
  // This prevents entityComponents from being recreated on every parent render
  const stableRecentNPCs = useMemo(() => {
    return recentNPCs || [];
  }, [JSON.stringify(recentNPCs)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Memoize entity highlighting components - only recreate when recentNPCs content actually changes
  const entityComponents = useMemo(() => {
    return createEntityHighlightingComponents(stableRecentNPCs);
  }, [stableRecentNPCs]);

  // Toggle bookmark for a message
  const handleToggleBookmark = (index) => {
    setBookmarkedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (narrativeRef.current) {
      narrativeRef.current.scrollTop = narrativeRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // Detect sound effects from latest narrative message
  useEffect(() => {
    if (conversationHistory.length === 0) return;

    const latestMessage = conversationHistory[conversationHistory.length - 1];

    console.log('[SoundEffect] Checking message:', {
      role: latestMessage.role,
      contentPreview: latestMessage.content?.substring(0, 100)
    });

    // Only check AI responses (not user messages)
    if (latestMessage.role === 'assistant' && latestMessage.content) {
      const detectedEffect = detectSoundEffects(latestMessage.content);

      if (detectedEffect) {
        console.log('[SoundEffect] ✅ Detected:', detectedEffect.text);
        setActiveSoundEffect(detectedEffect);
      } else {
        console.log('[SoundEffect] ❌ No effect detected in:', latestMessage.content.substring(0, 200));
      }
    }
  }, [conversationHistory]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen && toggleHistory) {
        toggleHistory();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggleHistory]);

  const handleNPCClick = (npcName, clickEvent = null) => {
    // Clear hover tooltip when clicking on entity
    setHoveredEntity(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Try to find the primary portrait from the conversation history entry
    // BUT only use it if the clicked NPC matches the primary NPC name
    let primaryPortrait = null;
    if (clickEvent && clickEvent.target) {
      // Walk up DOM to find the narrative-entry-animated container
      let element = clickEvent.target;
      while (element && !element.classList.contains('narrative-entry-animated')) {
        element = element.parentElement;
      }
      if (element) {
        const entryPrimaryNPCName = element.getAttribute('data-primary-npc-name') || null;
        const entryPrimaryPortrait = element.getAttribute('data-primary-portrait') || null;

        // Only use the portrait if the clicked entity matches the primary NPC
        if (entryPrimaryNPCName && entryPrimaryPortrait && npcName === entryPrimaryNPCName) {
          primaryPortrait = entryPrimaryPortrait;
          console.log('[NarrativePanel] Clicked NPC matches primary NPC, using portrait:', primaryPortrait);
        } else if (entryPrimaryNPCName && npcName !== entryPrimaryNPCName) {
          console.log('[NarrativePanel] Clicked NPC does NOT match primary NPC, portrait will be resolved independently');
        }
      }
    }

    // Find entity data from EntityManager
    const entityData = entityManager.getByName(npcName);

    if (!entityData) {
      // Open POI modal even for unknown entities
      setSelectedEntity({
        name: npcName,
        description: 'No additional information available.',
        entityType: 'unknown',
        image: primaryPortrait ? `/portraits/${primaryPortrait}` : null
      });
      setShowPOIModal(true);
      return;
    }

    const entityType = entityData.entityType || entityData.type;

    // If it's a patient, open full patient modal
    if (entityType === 'patient') {
      setSelectedPatient(entityData);
      setShowPatientModal(true);
      return;
    }

    // For all other entities (NPCs, locations, items), open POI modal directly
    // Enrich entity with portrait from conversation history if available
    const enrichedEntity = {
      ...entityData,
      image: primaryPortrait ? `/portraits/${primaryPortrait}` : entityData.image
    };
    setSelectedEntity(enrichedEntity);
    setShowPOIModal(true);
  };

  const handleLookCloser = () => {
    // Open full POI modal with current entity
    setSelectedEntity(popupEntity);
    setShowPOIModal(true);
    // Clear hover tooltip when modal opens
    setHoveredEntity(null);
    // Clear any pending hover timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleAddNote = () => {
    // Stub for journal note functionality
    console.log('[Journal] Add note for:', popupEntity?.name);
    // TODO: Implement journal note system
    alert(`Journal note for "${popupEntity?.name}" will be added here (not yet implemented)`);
  };

  // Add click and hover listeners to NPC names after render
  // Re-attach when entityComponents changes to ensure listeners work with new DOM nodes
  useEffect(() => {
    const narrativePanel = narrativeRef.current;
    if (!narrativePanel) return;

    // Clear any lingering hover state when re-attaching listeners (prevents stale tooltips)
    setHoveredEntity(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    const handleClick = (e) => {
      // Don't open modal if user is selecting text
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        return;
      }

      // Handle entity clicks (NPCs, patients, items, locations)
      if (e.target.classList.contains('npc-name') ||
          e.target.classList.contains('patient-name') ||
          e.target.classList.contains('item-name') ||
          e.target.classList.contains('location-name')) {
        const npcName = e.target.getAttribute('data-npc-name');
        handleNPCClick(npcName, e);
      }
    };

    const handleMouseEnter = (e) => {
      if (e.target.classList.contains('npc-name') ||
          e.target.classList.contains('patient-name') ||
          e.target.classList.contains('item-name') ||
          e.target.classList.contains('location-name')) {
        // Clear any existing timeout
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }

        // Capture data IMMEDIATELY before element can be replaced by React
        const npcName = e.target.getAttribute('data-npc-name');
        const description = e.target.getAttribute('data-description');
        const rect = e.target.getBoundingClientRect();

        // Debounce state update to prevent rapid re-renders
        hoverTimeoutRef.current = setTimeout(() => {
          // Use captured data, not e.target reference (which may be stale)
          setHoveredEntity({
            name: npcName,
            description,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          });
        }, 150); // 150ms delay
      }
    };

    const handleMouseLeave = (e) => {
      if (e.target.classList.contains('npc-name') ||
          e.target.classList.contains('patient-name') ||
          e.target.classList.contains('item-name') ||
          e.target.classList.contains('location-name')) {
        // Clear any pending hover state updates
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }

        // Debounce the clear too - give small grace period before hiding tooltip
        hoverTimeoutRef.current = setTimeout(() => {
          setHoveredEntity(null);
        }, 50); // 50ms grace period
      }
    };

    narrativePanel.addEventListener('click', handleClick);
    narrativePanel.addEventListener('mouseenter', handleMouseEnter, true); // true = capture phase
    narrativePanel.addEventListener('mouseleave', handleMouseLeave, true); // true = capture phase

    return () => {
      narrativePanel.removeEventListener('click', handleClick);
      narrativePanel.removeEventListener('mouseenter', handleMouseEnter, true);
      narrativePanel.removeEventListener('mouseleave', handleMouseLeave, true);
      // Clean up any pending timeouts and hover state
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setHoveredEntity(null);
    };
  }, [entityComponents]); // Re-attach when entityComponents changes (new DOM nodes created)

  return (
    <>
      <div className="h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-2xl overflow-hidden flex flex-col  dark:shadow-dark-elevation-3 border-1 border-white/20 dark:border-slate-700/50 transition-colors duration-300">
        <div
          ref={narrativeRef}
          className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-[20px] py-[22px] space-y-3 ${fontSize}`}
        >
          {conversationHistory.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-parchment-200 to-parchment-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-elevation-2 dark:shadow-dark-elevation-2 transition-colors duration-300">
                <svg className="w-10 h-10 text-ink-400 dark:text-parchment-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="font-display text-xl text-ink-600 dark:text-parchment-200 italic transition-colors duration-300">The chronicle begins...</p>
              <p className="text-sm text-ink-500 dark:text-parchment-400 font-sans mt-2 transition-colors duration-300">Your adventure awaits</p>
            </div>
          ) : (
            <>
              {conversationHistory
                .filter(entry => !entry.hidden && entry.role !== 'system') // Skip hidden entries and system messages (system messages only appear in Log tab)
                .map((entry, index) => (
                <NarrativeEntry
                  key={index}
                  entry={entry}
                  index={index}
                  recentNPCs={recentNPCs}
                  isBookmarked={bookmarkedIndices.has(index)}
                  onToggleBookmark={handleToggleBookmark}
                  playerPortrait={playerPortrait}
                  entityComponents={entityComponents}
                  // Card-related props
                  onOpenContractModal={onOpenContractModal}
                  onSimpleInteractionChoice={onSimpleInteractionChoice}
                  onRandomEventChoice={onRandomEventChoice}
                  onConfirmExit={onConfirmExit}
                  onCancelExit={onCancelExit}
                  gameState={gameState}
                  isDarkMode={isDarkMode}
                />
              ))}

              {/* Contract Offer Card - Amber/Gold
                  LEGACY: Only show if not already embedded in conversation history
                  Cards are now embedded in conversation history for persistence */}
              {pendingContract && onOpenContractModal && !conversationHistory.some(entry => entry.card?.type === 'contract') && (
                <div className="animate-fade-in mb-4">
                  <div className="w-full p-4 bg-gradient-to-r from-amber-500/90 to-yellow-600 dark:from-amber-700 dark:to-yellow-800 rounded-xl shadow-lg border-2 border-amber-400/20 dark:border-amber-600/30">
                    <div className="flex items-center gap-3">
                      {/* Contract Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-bold text-lg mb-0.5">
                          {pendingContract.type === 'treatment' ? 'Treatment Contract Available' : 'Sale Request'}
                        </div>
                        <div className="text-amber-100 dark:text-amber-200 text-sm font-medium">
                          {pendingContract.offeredBy} is seeking your services
                        </div>
                      </div>
                      <button
                        onClick={onOpenContractModal}
                        className="flex-shrink-0 px-4 py-2 bg-white hover:bg-amber-50 text-amber-600 font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2"
                      >
                        Negotiate Terms
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Exit Confirmation Card - Amber/Warning
                  LEGACY: Only show if not already embedded in conversation history
                  Cards are now embedded in conversation history for persistence */}
              {pendingExitConfirmation && onConfirmExit && onCancelExit && !conversationHistory.some(entry => entry.card?.type === 'exit_confirmation') && (
                <div className="mb-4 animate-fade-in">
                  <ExitConfirmationCard
                    exitData={pendingExitConfirmation}
                    onConfirm={onConfirmExit}
                    onCancel={onCancelExit}
                    isDark={isDarkMode}
                  />
                </div>
              )}

              {/* Trade Opportunity Cards - DEPRECATED: Replaced by actionPrompt system */}

              {/* Simple Interaction Card - Fast Gameplay Loops
                  LEGACY: Only show if not already embedded in conversation history
                  Cards are now embedded in conversation history for persistence */}
              {pendingSimpleInteraction && onSimpleInteractionChoice && !conversationHistory.some(entry => entry.card?.type === 'simple_interaction') && (
                <div className="mb-4 animate-fade-in">
                  <SimpleInteractionCard
                    interaction={pendingSimpleInteraction}
                    onChoice={(action) => onSimpleInteractionChoice(action, pendingSimpleInteraction)}
                    currentWealth={gameState.wealth || 0}
                    inventory={gameState.inventory || []}
                    isDark={isDarkMode}
                  />
                </div>
              )}

              {/* Sale Inquiry Card - DEPRECATED: Replaced by actionPrompt system */}

              {/* Action Prompt Card - Give/Sell/Prescribe Requests */}
              {pendingActionPrompt && onProposeAction && onDeclineAction && (
                <div className="mb-4 animate-fade-in">
                  <ActionPromptCard
                    actionPrompt={pendingActionPrompt}
                    inventory={gameState.inventory || []}
                    onPropose={onProposeAction}
                    onDecline={onDeclineAction}
                    isDark={isDarkMode}
                  />
                </div>
              )}

              {/* Mixing Decision Card - Craft Remedy Prompt */}
              {pendingMixingDecision && onOpenMixingWorkshop && onAbandonMixing && (
                <div className="mb-4 animate-fade-in">
                  <MixingDecisionCard
                    mixingContext={pendingMixingDecision}
                    onOpenMixing={() => onOpenMixingWorkshop(pendingMixingDecision)}
                    onDecline={() => onAbandonMixing(pendingMixingDecision)}
                    isDark={isDarkMode}
                  />
                </div>
              )}

              {/* Sale Proposal Card - DEPRECATED: Replaced by actionPrompt system */}

              {/* Random Event Card - Variety Gameplay Moments
                  LEGACY: Only show if not already embedded in conversation history
                  Cards are now embedded in conversation history for persistence */}
              {pendingRandomEvent && onRandomEventChoice && !conversationHistory.some(entry => entry.card?.type === 'random_event') && (
                <div className="mb-4 animate-fade-in">
                  <RandomEventCard
                    eventCard={pendingRandomEvent}
                    onChoice={(action) => onRandomEventChoice(action, pendingRandomEvent)}
                    currentWealth={gameState.wealth || 0}
                    energy={gameState.energy || 100}
                    health={gameState.health || 100}
                    inventory={gameState.inventory || []}
                    isDark={isDarkMode}
                  />
                </div>
              )}

              {/* Patient Ready for Examination Card - Red */}
              {activePatient && !pendingPrescription && (
                <div className="animate-fade-in mb-4">
                  <div className="w-full p-4 bg-gradient-to-r from-red-500/90 to-rose-600 dark:from-red-700 dark:to-rose-800 rounded-xl shadow-lg border-2 border-red-400/20 dark:border-red-600/30">
                    <div className="flex items-center gap-3">
                      {/* Patient Portrait */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
                        {activePatient.visual?.image || activePatient.image ? (
                          <img
                            src={`/portraits/${activePatient.visual?.image || activePatient.image}`}
                            alt={activePatient.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.outerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                            }}
                          />
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-bold text-lg mb-0.5">
                          Patient Ready for Examination
                        </div>
                        <div className="text-red-100 dark:text-red-200 text-sm font-medium">
                          {activePatient.name} is waiting to be treated
                        </div>
                      </div>
                      {onSwitchToPatientView && (
                        <button
                          onClick={onSwitchToPatientView}
                          className="flex-shrink-0 px-4 py-2 bg-white hover:bg-red-50 text-red-600 font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2"
                        >
                          Begin Examination
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Prescription Pending Status Card - Blue */}
              {pendingPrescription && (
                <div className="animate-fade-in">
                  <div className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-xl shadow-lg border-2 border-blue-400/30 dark:border-blue-600/30">
                    <div className="flex items-center gap-3">
                      {/* Patient Portrait */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
                        {pendingPrescription.patient?.visual?.image || pendingPrescription.patient?.image ? (
                          <img
                            src={`/portraits/${pendingPrescription.patient.visual?.image || pendingPrescription.patient.image}`}
                            alt={pendingPrescription.patient.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.outerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                            }}
                          />
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-bold text-lg mb-0.5 flex items-center gap-2">
                          <span className="text-xl">℞</span>
                          Prescription Administered
                        </div>
                        <div className="text-blue-100 dark:text-blue-200 text-sm font-medium">
                          You have prescribed <strong className="text-white">{pendingPrescription.item?.name}</strong> to {pendingPrescription.patient?.name}.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show typing indicator when AI is generating */}
              {isLoading && <TypingIndicator />}
            </>
          )}
        </div>

        <style>{`
          /* Smooth entry animation */
          @keyframes narrative-entry-slide-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .narrative-entry-animated {
            animation: narrative-entry-slide-in 0.4s ease-out;
          }

          /* Better paragraph spacing in narrative content */
          .prose p {
            margin-top: 0.75em;
            margin-bottom: 0.75em;
          }

          /* Initial narrative gets better paragraph spacing and larger text */
          .initial-narrative p {
            margin-top: 1em;
            margin-bottom: 1em;
            color: #3d2817;
            font-size: 1.35rem;
            font-family: 'Crimson Text', Georgia, serif;
            line-height: 1.7;
            letter-spacing: 0.01em;
          }

          .dark .initial-narrative p {
            color: #f4e8d0;
          }

          .initial-narrative p:first-child {
            margin-top: 0;
          }

          .initial-narrative p:last-child {
            margin-bottom: 0;
          }

          /* NPC names - Subtle teal with semibold weight */
          .npc-name {
            color: #14b8a6;
            font-weight: 600;
            font-size: inherit;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
          }

          .npc-name:hover {
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 3px;
          }

          /* Patient names - Subtle red with semibold weight */
          .patient-name {
            color: #ef4444;
            font-weight: 600;
            font-size: inherit;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
          }

          .patient-name:hover {
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 3px;
          }

          /* Item names - Subtle purple/indigo */
          .item-name {
            color: #8b5cf6;
            font-weight: 500;
            font-size: inherit;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
          }

          .item-name:hover {
            color: #7c3aed;
            text-decoration: underline;
            text-decoration-thickness: 1px;
            text-underline-offset: 3px;
          }

          /* Location names - Subtle amber/orange */
          .location-name {
            color: #f59e0b;
            font-weight: 500;
            font-size: inherit;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
          }

          .location-name:hover {
            color: #d97706;
            text-decoration: underline;
            text-decoration-thickness: 1px;
            text-underline-offset: 3px;
          }

          /* Bold text (dialogue) - Warm parchment color */
          .prose strong {
            color: #261409;
            font-weight: 600;
          }

          .dark .prose strong {
            color: #d4c5a9;
            font-weight: 600;
          }
        `}</style>
      </div>

      {/* POI Modal - for NPCs and locations */}
      <POIModal
        isOpen={showPOIModal}
        onClose={() => {
          setShowPOIModal(false);
          setSelectedEntity(null);
        }}
        entity={selectedEntity}
        inventory={gameState?.inventory || []}
        onInventoryUpdate={(itemName, quantityChange) => {
          if (updateInventory) {
            console.log('[NarrativePanel] Forwarding inventory update to parent:', itemName, quantityChange);
            updateInventory(itemName, quantityChange);
          } else {
            console.warn('[NarrativePanel] updateInventory callback not provided!');
          }
        }}
      />

      {/* NPC Patient Modal - full medical examination view */}
      <NPCPatientModal
        isOpen={showPatientModal}
        onClose={() => {
          setShowPatientModal(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        onPrescribe={(patient) => {
          console.log('Prescribe to:', patient.name);
        }}
        onDiagnose={(patient) => {
          console.log('Diagnose:', patient.name);
        }}
      />

      {/* Entity Tooltip - shows on hover */}
      {hoveredEntity && (
        <EntityTooltip
          rect={hoveredEntity.rect}
          description={hoveredEntity.description}
          entityName={hoveredEntity.name}
        />
      )}

      {/* Entity Compact Popup - shows on click */}
      <EntityPopup
        isOpen={showEntityPopup}
        onClose={() => setShowEntityPopup(false)}
        entityName={popupEntity?.name}
        description={popupEntity?.description || 'No additional information available.'}
        onLookCloser={handleLookCloser}
        onAddNote={handleAddNote}
      />

      {/* Sound Effect Display - fighting game style animated sound effects */}
      {activeSoundEffect && (
        <SoundEffectDisplay
          effect={activeSoundEffect}
          onComplete={() => setActiveSoundEffect(null)}
        />
      )}
    </>
  );
};

export default NarrativePanel;
