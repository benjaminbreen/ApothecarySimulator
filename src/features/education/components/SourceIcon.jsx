/**
 * SourceIcon Component
 *
 * A small, clickable document icon that appears next to game elements
 * (items, NPCs, locations, concepts) that have associated primary sources.
 *
 * Usage:
 *   <SourceIcon entityName="opium" onClick={(sources) => handleOpenModal(sources)} />
 *   <SourceIcon sources={[source1, source2]} />
 */

import React, { useMemo, useState } from 'react';
import { FaScroll, FaBook } from 'react-icons/fa';
import { getSourcesForEntity, hasSourcesForEntity } from '../../../core/services/primarySourceService';

/**
 * SourceIcon - Clickable icon indicating primary sources are available
 *
 * @param {Object} props
 * @param {string} props.entityName - Entity name to look up sources for
 * @param {Array} props.sources - Direct array of sources (alternative to entityName)
 * @param {Function} props.onClick - Callback when clicked, receives sources array
 * @param {string} props.size - Size: 'small', 'medium', 'large'
 * @param {boolean} props.showCount - Whether to show badge with source count
 * @param {string} props.variant - Visual variant: 'inline', 'button', 'minimal'
 * @param {string} props.tooltip - Custom tooltip text
 * @param {string} props.className - Additional CSS classes
 */
function SourceIcon({
  entityName,
  sources: directSources,
  onClick,
  size = 'small',
  showCount = false,
  variant = 'inline',
  tooltip,
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Get sources either directly or by entity name
  const sources = useMemo(() => {
    if (directSources && directSources.length > 0) {
      return directSources;
    }
    if (entityName) {
      return getSourcesForEntity(entityName);
    }
    return [];
  }, [entityName, directSources]);

  // Don't render if no sources
  if (sources.length === 0) {
    return null;
  }

  const count = sources.length;

  // Choose icon based on source type
  const IconComponent = useMemo(() => {
    // If most sources have PDFs, use book icon
    const pdfCount = sources.filter(s => s.pdf).length;
    if (pdfCount > count / 2) return FaBook;

    // Default to scroll icon
    return FaScroll;
  }, [sources, count]);

  // Size styles
  const sizeStyles = {
    small: 'w-5 h-5 text-xs',
    medium: 'w-6 h-6 text-sm',
    large: 'w-8 h-8 text-base'
  };

  // Icon size styles
  const iconSizeStyles = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  // Variant styles
  const variantStyles = {
    inline: 'inline-flex -mt-0.5 ml-1',
    button: 'px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/40',
    minimal: 'opacity-60 hover:opacity-100'
  };

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onClick) {
      onClick(sources);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const tooltipText = tooltip ||
    (count === 1
      ? 'View primary source'
      : `View ${count} primary sources`);

  return (
    <button
      type="button"
      className={`
        relative items-center justify-center cursor-pointer transition-all duration-200
        text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300
        hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded
        ${sizeStyles[size]} ${variantStyles[variant]} ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <IconComponent className={iconSizeStyles[size]} />

      {showCount && count > 1 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center
          bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm">
          {count}
        </span>
      )}

      {/* Subtle glow effect on hover */}
      {isHovered && (
        <span className="absolute inset-0 rounded bg-amber-400/20 animate-pulse" />
      )}
    </button>
  );
}

/**
 * SourceIconInline - Convenience wrapper for inline text usage
 * Automatically handles the most common use case
 */
export function SourceIconInline({ entityName, onOpenSource, className = '' }) {
  return (
    <SourceIcon
      entityName={entityName}
      onClick={onOpenSource}
      size="small"
      variant="inline"
      className={className}
    />
  );
}

/**
 * SourceIconButton - Larger, more prominent button variant
 */
export function SourceIconButton({ entityName, sources, onClick, label, className = '' }) {
  const sourcesToUse = sources || (entityName ? getSourcesForEntity(entityName) : []);

  if (sourcesToUse.length === 0) return null;

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg
        bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300
        hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors
        text-sm font-medium ${className}`}
      onClick={() => onClick && onClick(sourcesToUse)}
    >
      <FaScroll className="w-4 h-4" />
      <span>
        {label || `View ${sourcesToUse.length === 1 ? 'Source' : `${sourcesToUse.length} Sources`}`}
      </span>
    </button>
  );
}

/**
 * Hook for checking if sources exist (for conditional rendering)
 */
export function useHasSources(entityName) {
  return useMemo(() => {
    if (!entityName) return false;
    return hasSourcesForEntity(entityName);
  }, [entityName]);
}

export default SourceIcon;
