import React, { useState, useEffect } from 'react';
import { createChatCompletion } from '../core/services/llmService';
import ReadableTextModal from './ReadableTextModal';
import { RippleButton } from './RippleButton';

const StudyTab = ({
  discoveredBooks = [],
  onBookClick = null,
  theme = 'light',
  narrativeTurn = '', // Most recent narrative turn
  location = '' // Current location
}) => {
  const isDark = theme === 'dark';
  const [readableItems, setReadableItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cache for generated text content (persists during playthrough, cleared on unmount)
  const textCacheRef = React.useRef({});

  // Generate readable items from the current scene
  useEffect(() => {
    if (!narrativeTurn) return;

    setIsLoading(true);

    const messages = [
      {
        role: 'system',
        content: `You are analyzing a scene from a historical game set in 1680s Mexico City. Based on the narrative, list all readable items visible to the player character.

Your response must be a JSON array of objects. Each object should have:
- "name": The title/description of the readable item
- "type": One of "book", "sign", "label", "inscription", "document", or "ambient"
- "description": A brief description (1 sentence)

Priority order:
1. If books/texts are mentioned or plausible (library, study, bookshelf), list 3-5 specific historical books
2. If in a shop/street with signs, list 2-4 visible signs or labels
3. If no text is visible, create ONE "ambient" entry with a spare sensory description

Be historically accurate for 1680s Mexico. Book titles should be real or plausibly real. Keep it brief.

Example format:
[
  {"name": "De Historia Plantarum", "type": "book", "description": "Leather-bound botanical treatise"},
  {"name": "Botica Sign", "type": "sign", "description": "Painted wooden sign above the door"}
]`
      },
      {
        role: 'user',
        content: `Location: ${location}\n\nNarrative:\n${narrativeTurn}`
      }
    ];

    createChatCompletion(messages, 0.4, 600, null, { agent: 'ReadableItems' })
      .then(response => {
        const content = response.choices[0].message.content;

        // Try to parse JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const items = JSON.parse(jsonMatch[0]);
          setReadableItems(items);
        } else {
          // Fallback: create ambient description
          setReadableItems([{
            name: 'Ambient Scene',
            type: 'ambient',
            description: content.substring(0, 150)
          }]);
        }
      })
      .catch(error => {
        console.error('[StudyTab] Error generating readable items:', error);
        setReadableItems([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [narrativeTurn, location]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="h-full flex flex-col p-4 animate-fade-in bg-gradient-to-br from-parchment-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        
        <h3 className="font-['Cinzel'] text-sm font-semibold text-[#3d2817] dark:text-sky-400 truncate uppercase tracking-widest transition-colors duration-300">
          Readable Texts
        </h3>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ink-700 dark:border-amber-400 mb-3"></div>
          <p className="text-sm text-ink-500 dark:text-parchment-300 font-sans transition-colors duration-300">
            Scanning surroundings...
          </p>
        </div>
      ) : readableItems.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {readableItems.map((item, idx) => (
            <ReadableCard
              key={`${item.name}-${idx}`}
              item={item}
              onClick={() => handleItemClick(item)}
              isDark={isDark}
              index={idx}
            />
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-parchment-200 to-parchment-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-elevation-2 dark:shadow-dark-elevation-2 mb-3 transition-colors duration-300">
            <svg className="w-8 h-8 text-ink-400 dark:text-parchment-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-sm text-ink-500 dark:text-parchment-300 font-sans uppercase tracking-wide mb-1 transition-colors duration-300">
            No Texts Nearby
          </p>
          <p className="text-xs text-ink-400 dark:text-parchment-400 font-sans transition-colors duration-300">
            Readable items will appear here
          </p>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(209, 213, 219, 0.2)'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(156, 163, 175, 0.5)'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? 'rgba(71, 85, 105, 0.7)' : 'rgba(107, 114, 128, 0.7)'};
        }
      `}</style>

      {/* Readable Text Modal */}
      <ReadableTextModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
        theme={theme}
        textCache={textCacheRef.current}
      />
    </div>
  );
};

// ReadableCard Component - displays books, signs, or ambient descriptions with glassomorphic styling
const ReadableCard = ({ item, onClick, isDark, index }) => {
  // Animation delay based on index
  const animationDelay = `${index * 50}ms`;

  // Get ripple color based on type
  const getRippleColor = () => {
    if (item.type === 'ambient') {
      return isDark ? 'rgba(139, 92, 246, 0.35)' : 'rgba(167, 139, 250, 0.3)';
    } else if (item.type === 'sign' || item.type === 'label') {
      return isDark ? 'rgba(217, 119, 6, 0.35)' : 'rgba(180, 83, 9, 0.3)';
    } else {
      return isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(37, 99, 235, 0.3)';
    }
  };

  // Different icon based on type
  const getIcon = () => {
    if (item.type === 'ambient') {
      return (
        <svg className="w-5 h-5 text-ink-700 dark:text-amber-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    } else if (item.type === 'sign' || item.type === 'label') {
      return (
        <svg className="w-5 h-5 text-ink-700 dark:text-amber-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-ink-700 dark:text-amber-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    }
  };

  return (
    <RippleButton
      onClick={onClick}
      rippleColor={getRippleColor()}
      className="w-full text-left p-2 py-3 rounded-lg transition-all duration-300 group animate-fade-in cursor-pointer hover:-translate-y-0.5"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(51, 65, 85, 0.80) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(249, 245, 235, 0.90) 100%)',
        backdropFilter: 'blur(12px) saturate(90%)',
        WebkitBackdropFilter: 'blur(12px) saturate(110%)',
        border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(212, 197, 169, 0.35)'}`,
        boxShadow: isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        animationDelay,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(251, 191, 36, 0.5)' : 'rgba(16, 185, 129, 0.5)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
          : '0 4px 16px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(212, 197, 169, 0.35)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.9) 0%, rgba(71, 85, 105, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(254, 252, 247, 0.9) 0%, rgba(244, 237, 220, 0.9) 100%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          {getIcon()}
        </div>

        {/* Item Info */}
        <div className="flex-1 min-w-0">
          {/* Title/Name */}
          <h4 className="font-serif text-sm font-bold text-ink-900 dark:text-parchment-100 mb-0.5 line-clamp-2 transition-colors duration-300">
            {item.name}
          </h4>

          {/* Description */}
          <p className="font-sans text-xs text-ink-600 dark:text-parchment-300 mb-1 transition-colors line-clamp-2 duration-300">
            {item.description || item.citation}
          </p>

          {/* Type Badge */}
          {item.type && (
            <span
              className="inline-block text-[10px] font-sans font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded transition-colors duration-300"
              style={{
                background: item.type === 'ambient'
                  ? (isDark
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.3) 100%)'
                    : 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(167, 139, 250, 0.2) 100%)')
                  : (item.type === 'sign' || item.type === 'label')
                    ? (isDark
                      ? 'linear-gradient(135deg, rgba(139, 90, 43, 0.25) 0%, rgba(139, 90, 43, 0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(160, 120, 74, 0.15) 0%, rgba(160, 120, 74, 0.2) 100%)')
                    : (isDark
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.15) 100%)'),
                color: item.type === 'ambient'
                  ? (isDark ? '#c4b5fd' : '#6d28d9')
                  : (item.type === 'sign' || item.type === 'label')
                    ? (isDark ? '#d4a574' : '#654321')
                    : (isDark ? '#93c5fd' : '#2563eb'),
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            >
              {item.type.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Arrow Icon - always show */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-4 h-4 text-ink-600 dark:text-parchment-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </RippleButton>
  );
};

export default StudyTab;
