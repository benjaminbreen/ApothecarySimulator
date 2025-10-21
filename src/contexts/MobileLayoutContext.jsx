import React, { createContext, useContext, useState, useEffect } from 'react';
import { useScreenSize } from '../hooks/useScreenSize';

/**
 * Mobile Layout Context
 * Manages responsive layout state and provides utilities for mobile-first design
 */

const MobileLayoutContext = createContext(null);

/**
 * Layout states for different sections
 */
const LAYOUT_SECTIONS = {
  INVENTORY: 'inventory',
  STATS: 'stats',
  NARRATIVE: 'narrative',
  COMMANDS: 'commands',
  MAP: 'map',
  JOURNAL: 'journal'
};

/**
 * Default collapsed states for mobile
 */
const DEFAULT_COLLAPSED_STATE = {
  [LAYOUT_SECTIONS.INVENTORY]: false,
  [LAYOUT_SECTIONS.STATS]: true,
  [LAYOUT_SECTIONS.NARRATIVE]: false,
  [LAYOUT_SECTIONS.COMMANDS]: false,
  [LAYOUT_SECTIONS.MAP]: true,
  [LAYOUT_SECTIONS.JOURNAL]: true
};

export function MobileLayoutProvider({ children }) {
  const screenSize = useScreenSize();
  const { isMobile, isTablet, isDesktop, device, isPortrait, isLandscape } = screenSize;

  // Track which sections are collapsed (mobile only)
  const [collapsedSections, setCollapsedSections] = useState(DEFAULT_COLLAPSED_STATE);

  // Track active bottom sheet (mobile only)
  const [activeBottomSheet, setActiveBottomSheet] = useState(null);

  // Track keyboard visibility (affects layout on mobile)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Track fullscreen mode for specific sections
  const [fullscreenSection, setFullscreenSection] = useState(null);

  // Reset collapsed state when switching between mobile/desktop
  useEffect(() => {
    if (isDesktop) {
      // On desktop, expand all sections
      setCollapsedSections({});
      setActiveBottomSheet(null);
      setFullscreenSection(null);
    } else if (isMobile) {
      // On mobile, use default collapsed state
      setCollapsedSections(DEFAULT_COLLAPSED_STATE);
    }
  }, [isMobile, isDesktop]);

  // Keyboard visibility detection (mobile browsers)
  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      // Detect keyboard by checking if viewport height decreased significantly
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const screenHeight = window.screen.height;
      const keyboardThreshold = screenHeight * 0.25; // 25% of screen

      const isKeyboardOpen = (screenHeight - viewportHeight) > keyboardThreshold;
      setIsKeyboardVisible(isKeyboardOpen);
    };

    // Visual Viewport API (better keyboard detection)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      // Fallback to window resize
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [isMobile]);

  /**
   * Toggle section collapsed state
   */
  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  /**
   * Expand a specific section
   */
  const expandSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: false
    }));
  };

  /**
   * Collapse a specific section
   */
  const collapseSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: true
    }));
  };

  /**
   * Check if section is collapsed
   */
  const isSectionCollapsed = (section) => {
    return collapsedSections[section] || false;
  };

  /**
   * Open bottom sheet
   */
  const openBottomSheet = (sheetId) => {
    setActiveBottomSheet(sheetId);
  };

  /**
   * Close bottom sheet
   */
  const closeBottomSheet = () => {
    setActiveBottomSheet(null);
  };

  /**
   * Enter fullscreen mode for a section
   */
  const enterFullscreen = (section) => {
    setFullscreenSection(section);
  };

  /**
   * Exit fullscreen mode
   */
  const exitFullscreen = () => {
    setFullscreenSection(null);
  };

  /**
   * Get layout mode for current screen
   */
  const getLayoutMode = () => {
    if (fullscreenSection) return 'fullscreen';
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    return 'desktop';
  };

  /**
   * Get grid columns for responsive layouts
   */
  const getGridColumns = (config = {}) => {
    const { mobile = 1, tablet = 2, desktop = 3 } = config;

    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  /**
   * Get spacing for current screen size
   */
  const getSpacing = (config = {}) => {
    const { mobile = 'tight', tablet = 'normal', desktop = 'comfortable' } = config;

    const spacingMap = {
      tight: { gap: 2, padding: 2 },
      normal: { gap: 4, padding: 4 },
      comfortable: { gap: 6, padding: 6 }
    };

    let spacing = desktop;
    if (isMobile) spacing = mobile;
    else if (isTablet) spacing = tablet;

    return spacingMap[spacing] || spacingMap.normal;
  };

  const value = {
    // Screen size info
    ...screenSize,
    isMobile,
    isTablet,
    isDesktop,
    device,
    isPortrait,
    isLandscape,

    // Layout state
    collapsedSections,
    activeBottomSheet,
    isKeyboardVisible,
    fullscreenSection,

    // Section controls
    toggleSection,
    expandSection,
    collapseSection,
    isSectionCollapsed,

    // Bottom sheet controls
    openBottomSheet,
    closeBottomSheet,

    // Fullscreen controls
    enterFullscreen,
    exitFullscreen,

    // Utilities
    getLayoutMode,
    getGridColumns,
    getSpacing,

    // Constants
    LAYOUT_SECTIONS
  };

  return (
    <MobileLayoutContext.Provider value={value}>
      {children}
    </MobileLayoutContext.Provider>
  );
}

/**
 * Hook to access mobile layout context
 */
export function useMobileLayout() {
  const context = useContext(MobileLayoutContext);

  if (!context) {
    throw new Error('useMobileLayout must be used within MobileLayoutProvider');
  }

  return context;
}

export { LAYOUT_SECTIONS };
export default MobileLayoutContext;
