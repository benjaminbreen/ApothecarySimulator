import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { entityManager } from '../core/entities/EntityManager';
import NPCPatientModal from '../features/medical/components/NPCPatientModal';
import POIModal from './POIModal';

/**
 * Core function that processes text and highlights entity names
 * This is used by all text-containing components (text, strong, em, p, etc.)
 */
function highlightEntitiesInText(text, sortedNPCs) {
  if (typeof text !== 'string') return text;

  let parts = [text];

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
          const isPatient = (npcData?.entityType || npcData?.type) === 'patient';
          const className = isPatient ? 'patient-name' : 'npc-name';

          newParts.push(
            <span
              key={`${npcName}-${i}-${Math.random()}`}
              className={className}
              data-npc-name={segment}
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
  // Get all entities from EntityManager, but filter to only NPCs, patients, and locations
  // We don't want to highlight items like "cobblestones", "oil", etc.
  const allEntities = entityManager.getAll();
  const highlightableEntities = allEntities.filter(entity => {
    const type = entity.entityType || entity.type;
    return type === 'npc' || type === 'patient' || type === 'location';
  });
  const highlightableNames = highlightableEntities.map(entity => entity.name);

  // Combine recentNPCs with highlightable entities, remove duplicates
  const allNames = [...new Set([...recentNPCs, ...highlightableNames])];

  // Sort by name length (longest first) to avoid partial matches
  const sortedNPCs = [...allNames].sort((a, b) => b.length - a.length);

  // Log once when components are created
  if (sortedNPCs.length > 0 && !window.__entityComponentsLogged) {
    console.log('[EntityHighlighter] Highlighting', sortedNPCs.length, 'NPCs/patients/locations (excluding items)');
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

const NarrativeEntry = ({ entry, index, recentNPCs = [], isBookmarked, onToggleBookmark, playerPortrait }) => {
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

  // Determine entry icon based on content or role
  const getEntryIcon = () => {
    if (isUser) {
      // Use Maria's current portrait for user input
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
    if (isSystem) {
      return (
        <svg className="w-5 h-5 text-potion-600 dark:text-amber-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      );
    }
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

  // Create custom components for entity highlighting (used by ReactMarkdown)
  const entityComponents = createEntityHighlightingComponents(recentNPCs);

  // Special handling for initial narrative (index 0) - full width, no icon, larger text, pure markdown with NPC highlighting
  if (index === 0 && !isUser && !isSystem) {
    return (
      <div className="narrative-entry-animated">
        <div className="bg-gradient-to-br from-white to-parchment-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-ink-200 dark:border-slate-600 shadow-elevation-1 dark:shadow-dark-elevation-1 transition-all duration-300">
          <div className="prose prose-lg max-w-none initial-narrative">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={entityComponents}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="narrative-entry-animated space-y-2">
      <div className={`flex items-start gap-3 relative group ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* NPC Mini Portrait - show for dialogue, positioned inside container */}
      
      

        {/* Circular icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-parchment-100 to-white dark:from-slate-700 dark:to-slate-800 border-2 border-ink-200 dark:border-slate-600 flex items-center justify-center shadow-elevation-1 dark:shadow-dark-elevation-1 mt-1 overflow-hidden transition-colors duration-300">
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
              {content.includes('"') || content.includes('"') ? (
                // NPC dialogue - special styling
                <div className="bg-gradient-to-br from-parchment-100/20 via-parchment-50/50 to-white dark:from-slate-800 dark:via-slate-750 dark:to-slate-700 rounded-2xl p-3.5 border-2 border-parchment-300 dark:border-amber-600/30 shadow-elevation-2 dark:shadow-dark-elevation-2 relative transition-all duration-300">

                  <div className="prose prose-lg max-w-none relative z-10">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={entityComponents}
                      className="text-[21px] text-parchment-900 dark:text-parchment-100 font-serif transition-colors duration-300"
                    >
                      {content}
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
                      className="text-[21px] text-ink-800 dark:text-parchment-100 font-serif  transition-colors duration-300"
                    >
                      {content}
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
    </div>
  );
};

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
  fontSize = 'text-base',
  isDarkMode = false
}) => {
  const narrativeRef = useRef(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showPOIModal, setShowPOIModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [bookmarkedIndices, setBookmarkedIndices] = useState(new Set());

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

  const handleNPCClick = (npcName) => {
    // Find entity data from EntityManager
    const entityData = entityManager.getByName(npcName);

    if (!entityData) {
      setSelectedEntity({
        name: npcName,
        description: 'No additional information available.',
        entityType: 'unknown'
      });
      setShowPOIModal(true);
      return;
    }

    const entityType = entityData.entityType || entityData.type;

    // If it's a patient, open full patient modal
    if (entityType === 'patient') {
      setSelectedPatient(entityData);
      setShowPatientModal(true);
      setShowPOIModal(false); // Close POI modal if open
      return;
    }

    // For all other entities (NPCs, locations), open POI modal
    setSelectedEntity(entityData);
    setShowPOIModal(true);
  };

  // Add click listeners to NPC names after render
  useEffect(() => {
    const narrativePanel = narrativeRef.current;
    if (!narrativePanel) return;

    const handleClick = (e) => {
      // Handle both npc-name and patient-name classes
      if (e.target.classList.contains('npc-name') || e.target.classList.contains('patient-name')) {
        const npcName = e.target.getAttribute('data-npc-name');
        handleNPCClick(npcName);
      }
    };

    narrativePanel.addEventListener('click', handleClick);
    return () => narrativePanel.removeEventListener('click', handleClick);
  }, [conversationHistory, recentNPCs]);

  return (
    <>
      <div className={`h-full bg-white/95 backdrop-blur-lg rounded-2xl overflow-hidden flex flex-col shadow-elevation-3 border border-white/20 transition-colors duration-300 ${
        isDarkMode ? 'dark bg-slate-900/95 dark:shadow-dark-elevation-3 dark:border-slate-700/50' : ''
      }`}>
        <div
          ref={narrativeRef}
          className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-[25px] py-[21px] space-y-4 ${fontSize}`}
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
              {conversationHistory.map((entry, index) => (
                <NarrativeEntry
                  key={index}
                  entry={entry}
                  index={index}
                  recentNPCs={recentNPCs}
                  isBookmarked={bookmarkedIndices.has(index)}
                  onToggleBookmark={handleToggleBookmark}
                  playerPortrait={playerPortrait}
                />
              ))}

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
                          You have prescribed <strong className="text-white">{pendingPrescription.item?.name}</strong> to {pendingPrescription.patient?.name} and wait expectantly to see the result...
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
            font-size: 1.25rem;
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
            color: #0d9488;
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 3px;
            transform: translateY(-1px);
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
            color: #dc2626;
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 3px;
            transform: translateY(-1px);
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
    </>
  );
};

export default NarrativePanel;
