import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Tooltip component that renders via Portal
const Tooltip = ({ children, targetRef, show }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (show && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2
      });
    }
  }, [show, targetRef]);

  if (!show) return null;

  return createPortal(
    <div
      className="fixed pointer-events-none z-[9999] transition-opacity duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
        opacity: show ? 1 : 0
      }}
    >
      <div
        className="px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap border backdrop-blur-sm max-w-xs"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 247, 0.95) 100%)',
          borderColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(16, 185, 129, 0.3)',
        }}
      >
        <div className="text-xs font-sans text-ink-700 dark:text-parchment-200" style={{ fontWeight: 500 }}>
          {children}
        </div>
        {/* Arrow pointing down */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: isDark ? '6px solid rgba(15, 23, 42, 0.98)' : '6px solid rgba(255, 255, 255, 0.98)',
          }}
        />
      </div>
    </div>,
    document.body
  );
};

/**
 * EntityCard - Displays entity information with Wikipedia preview
 */
const EntityCard = ({ entity, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const isDark = document.documentElement.classList.contains('dark');

  if (!entity) return null;

  const { text, entityType, tier, occupation, demographics, description, wikipedia } = entity;

  // Color schemes by entity type
  const typeColors = {
    patient: {
      border: 'border-red-200 dark:border-red-900/50',
      icon: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50/60 dark:bg-red-900/20'
    },
    npc: {
      border: 'border-emerald-200 dark:border-emerald-900/50',
      icon: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50/60 dark:bg-emerald-900/20'
    },
    item: {
      border: 'border-purple-200 dark:border-purple-900/50',
      icon: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50/60 dark:bg-purple-900/20'
    },
    location: {
      border: 'border-blue-200 dark:border-blue-900/50',
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50/60 dark:bg-blue-900/20'
    },
    animal: {
      border: 'border-amber-200 dark:border-amber-900/50',
      icon: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50/60 dark:bg-amber-900/20'
    }
  };

  const colors = typeColors[entityType] || typeColors.npc;

  // Truncate Wikipedia extract to first 4 lines (approximately 200 chars)
  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Build tooltip content from entity metadata
  const getTooltipContent = () => {
    const parts = [];

    parts.push(`Type: ${entityType}`);
    parts.push(`Tier: ${tier}`);

    if (occupation) parts.push(`Occupation: ${occupation}`);
    if (demographics) {
      if (demographics.gender) parts.push(`Gender: ${demographics.gender}`);
      if (demographics.age) parts.push(`Age: ${demographics.age}`);
      if (demographics.casta) parts.push(`Casta: ${demographics.casta}`);
      if (demographics.class) parts.push(`Class: ${demographics.class}`);
    }

    return (
      <div className="whitespace-normal max-w-xs">
        {parts.map((part, i) => (
          <div key={i} className="text-left">{part}</div>
        ))}
      </div>
    );
  };

  // If no Wikipedia data, show basic entity card
  if (!wikipedia) {
    return (
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${colors.bg} ${colors.border} border rounded-lg p-3 space-y-2 hover:shadow-md dark:hover:shadow-dark-elevation-1 hover:-translate-y-0.5 transition-all duration-200 cursor-default opacity-0 animate-fade-in`}
        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
      >
        <div className="flex items-start gap-2">
          <div className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`}>
            {entityType === 'patient' && '👤'}
            {entityType === 'npc' && '🗣️'}
            {entityType === 'item' && '⚗️'}
            {entityType === 'location' && '📍'}
            {entityType === 'animal' && '🐎'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-xs text-ink-900 dark:text-parchment-200">{text}</h4>
            {description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        <Tooltip targetRef={cardRef} show={isHovered}>
          {getTooltipContent()}
        </Tooltip>
      </div>
    );
  }

  // Show Wikipedia-enhanced card
  // Show entity name, but Wikipedia article is about contextual topic
  const showContextLink = entity.wikipediaSearchTerm && entity.wikipediaSearchTerm !== entity.text;

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${colors.bg} ${colors.border} border rounded-lg p-3 space-y-2 hover:shadow-md dark:hover:shadow-dark-elevation-1 hover:-translate-y-0.5 transition-all duration-200 cursor-default opacity-0 animate-fade-in`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-2">
        <svg className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-xs text-ink-900 dark:text-parchment-200">
            {text}
          </h4>
          {showContextLink && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 italic mt-0.5">
              Context: {wikipedia.title}
            </p>
          )}
          {wikipedia.description && !showContextLink && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 italic mt-0.5">
              {wikipedia.description}
            </p>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
            {truncateText(wikipedia.extract)}
          </p>
          <a
            href={wikipedia.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs ${colors.icon} hover:underline font-semibold mt-1.5 inline-block`}
            onClick={(e) => e.stopPropagation()}
          >
            Read on Wikipedia →
          </a>
        </div>
      </div>
      <Tooltip targetRef={cardRef} show={isHovered}>
        {getTooltipContent()}
      </Tooltip>
    </div>
  );
};

export default EntityCard;
