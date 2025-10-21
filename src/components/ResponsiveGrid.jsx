import React from 'react';
import { useScreenSize } from '../hooks/useScreenSize';
import './ResponsiveGrid.css';

/**
 * Responsive Grid Component
 *
 * Auto-adapting grid layout with mobile-first breakpoints
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Grid items
 * @param {number} props.cols - Desktop columns (default: 3)
 * @param {number} props.tabletCols - Tablet columns (default: 2)
 * @param {number} props.mobileCols - Mobile columns (default: 1)
 * @param {string} props.gap - Gap between items: 'tight', 'normal', 'comfortable' (default: 'normal')
 * @param {string} props.align - Align items: 'start', 'center', 'end', 'stretch' (default: 'stretch')
 * @param {string} props.justify - Justify items: 'start', 'center', 'end', 'stretch' (default: 'start')
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
const ResponsiveGrid = ({
  children,
  cols = 3,
  tabletCols = 2,
  mobileCols = 1,
  gap = 'normal',
  align = 'stretch',
  justify = 'start',
  className = '',
  style = {}
}) => {
  const { isMobile, isTablet } = useScreenSize();

  // Determine current column count
  const currentCols = isMobile ? mobileCols : isTablet ? tabletCols : cols;

  return (
    <div
      className={`responsive-grid responsive-grid--gap-${gap} responsive-grid--align-${align} responsive-grid--justify-${justify} ${className}`}
      style={{
        ...style,
        gridTemplateColumns: `repeat(${currentCols}, 1fr)`
      }}
    >
      {children}
    </div>
  );
};

/**
 * Responsive Grid Item
 * Optional wrapper for grid items with span control
 */
export const ResponsiveGridItem = ({
  children,
  span = 1,
  tabletSpan,
  mobileSpan,
  className = '',
  style = {}
}) => {
  const { isMobile, isTablet } = useScreenSize();

  // Determine current span
  const currentSpan = isMobile
    ? mobileSpan || span
    : isTablet
    ? tabletSpan || span
    : span;

  return (
    <div
      className={`responsive-grid-item ${className}`}
      style={{
        ...style,
        gridColumn: `span ${currentSpan}`
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;
