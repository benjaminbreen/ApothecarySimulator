/**
 * SourceIndicator - Small icon that appears next to terms with primary sources
 *
 * Shows a small book icon that can be clicked to view related primary sources.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaBook, FaScroll, FaFeatherAlt, FaTimes } from 'react-icons/fa';
import { SOURCE_CATEGORIES } from '../core/data/primarySources/index';
import { getSourcesForEntity } from '../core/services/primarySourceService';

/**
 * Small source indicator icon
 */
export function SourceIndicator({ term, onClick, className = '' }) {
  const sources = getSourcesForEntity(term);

  if (!sources || sources.length === 0) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(term, sources);
      }}
      className={`inline-flex items-center justify-center w-4 h-4 ml-0.5 -mt-0.5
        rounded-sm bg-amber-100/80 dark:bg-amber-900/40
        text-amber-700 dark:text-amber-400
        hover:bg-amber-200 dark:hover:bg-amber-800/60
        hover:scale-110 transition-all duration-150
        cursor-pointer align-middle ${className}`}
      title={`${sources.length} primary source${sources.length > 1 ? 's' : ''} available`}
      aria-label={`View primary sources for ${term}`}
    >
      <FaBook className="w-2.5 h-2.5" />
    </button>
  );
}

/**
 * Source tooltip showing source preview
 */
export function SourceTooltip({ rect, term, sources }) {
  const isDark = document.documentElement.classList.contains('dark');

  if (!rect || !sources || sources.length === 0) return null;

  // Get first source for preview
  const firstSource = sources[0];
  const category = SOURCE_CATEGORIES[firstSource.category];

  return createPortal(
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        top: `${rect.top - 8}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div
        className="px-3 py-2 rounded-lg shadow-2xl max-w-xs border backdrop-blur-sm"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 248, 235, 0.98) 0%, rgba(254, 243, 220, 0.95) 100%)',
          borderColor: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(180, 120, 60, 0.4)',
        }}
      >
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-lg"
            style={{ backgroundColor: category?.color + '20' }}>
            {category?.icon || '📚'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-amber-900 dark:text-amber-200 truncate">
              {firstSource.title}
            </div>
            <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
              {firstSource.author}, {firstSource.year}
            </div>
            {sources.length > 1 && (
              <div className="text-[10px] text-amber-600 dark:text-amber-500 mt-1">
                +{sources.length - 1} more source{sources.length > 2 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        {/* Arrow */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(254, 243, 220, 0.95)'}`,
          }}
        />
      </div>
    </div>,
    document.body
  );
}

/**
 * Source popup panel - shows when clicking a source indicator
 */
export function SourcePopup({ isOpen, onClose, term, sources, onViewSource }) {
  const popupRef = useRef(null);
  const isDark = document.documentElement.classList.contains('dark');

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !sources || sources.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div
        ref={popupRef}
        className="w-full max-w-md max-h-[70vh] overflow-hidden rounded-xl shadow-2xl border"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(180deg, #fffbf0 0%, #fef3e2 100%)',
          borderColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(180, 120, 60, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200/30 dark:border-amber-800/30">
          <div className="flex items-center gap-2">
            <FaScroll className="text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Primary Sources: <span className="text-amber-700 dark:text-amber-300">{term}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
          >
            <FaTimes className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </button>
        </div>

        {/* Source list */}
        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
          {sources.map((source, index) => {
            const category = SOURCE_CATEGORIES[source.category];
            return (
              <button
                key={source.id}
                onClick={() => onViewSource?.(source)}
                className="w-full text-left px-4 py-3 border-b border-amber-100/30 dark:border-amber-900/30
                  last:border-b-0 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: (category?.color || '#f59e0b') + '20' }}
                  >
                    {category?.icon || '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      {source.title}
                    </div>
                    <div className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                      {source.author} • {source.work} ({source.year})
                    </div>
                    {source.translation && (
                      <div className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-1 line-clamp-2 italic">
                        "{source.translation.substring(0, 100)}..."
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: (category?.color || '#f59e0b') + '20',
                          color: category?.color || '#f59e0b'
                        }}
                      >
                        {category?.name || 'Source'}
                      </span>
                      <span className="text-[10px] text-amber-600/60 dark:text-amber-500/60">
                        {source.difficulty || 'intermediate'}
                      </span>
                    </div>
                  </div>
                  <FaFeatherAlt className="w-4 h-4 text-amber-400/50 dark:text-amber-600/50 flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Wrapper component to be used when highlighting source terms in text
 */
export function SourceTerm({ children, term, onSourceClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [rect, setRect] = useState(null);
  const spanRef = useRef(null);

  const sources = getSourcesForEntity(term);

  // No sources, just render children
  if (!sources || sources.length === 0) {
    return <>{children}</>;
  }

  const handleMouseEnter = () => {
    if (spanRef.current) {
      setRect(spanRef.current.getBoundingClientRect());
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRect(null);
  };

  return (
    <>
      <span
        ref={spanRef}
        className="source-term relative inline"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <SourceIndicator
          term={term}
          onClick={() => onSourceClick?.(term, sources)}
        />
      </span>
      {isHovered && rect && (
        <SourceTooltip rect={rect} term={term} sources={sources} />
      )}
    </>
  );
}

export default {
  SourceIndicator,
  SourceTooltip,
  SourcePopup,
  SourceTerm
};
