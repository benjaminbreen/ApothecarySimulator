import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaClipboardList, FaBed, FaShoppingCart, FaBalanceScale } from 'react-icons/fa';
import { RippleButton } from './RippleButton';

// Available actions that can be assigned to hotkey slots
const AVAILABLE_ACTIONS = {
  forage: {
    id: 'forage',
    name: 'Forage',
    emoji: '🌿',
    description: 'Search for herbs and natural ingredients'
  },
  hangSign: {
    id: 'hangSign',
    name: 'Hang Sign',
    emoji: '🪧',
    description: 'Display your shop sign to attract patients',
    contextual: true // Only shows at shop
  },
  removeSign: {
    id: 'removeSign',
    name: 'Remove Sign',
    emoji: '🚫',
    description: 'Take down your shop sign',
    contextual: true // Only shows at shop when sign is hung
  },
  read: {
    id: 'read',
    name: 'Read',
    emoji: '📖',
    description: 'Examine readable sources in this location'
  },
  observe: {
    id: 'observe',
    name: 'Observe',
    emoji: '👁️',
    description: 'Examine your surroundings with all senses'
  },
  diagnose: {
    id: 'diagnose',
    name: 'Diagnose',
    emoji: '🩺',
    description: 'Examine the patient\'s condition',
    contextual: true // Only shows when NPC is active
  },
  mix: {
    id: 'mix',
    name: 'Mix',
    emoji: '⚗️',
    description: 'Combine ingredients into compounds'
  },
  experiment: {
    id: 'experiment',
    name: 'Experiment',
    emoji: '🧪',
    description: 'Try new alchemical combinations'
  },
  map: {
    id: 'map',
    name: 'Map',
    emoji: '🗺️',
    description: 'View your surroundings and travel'
  },
  research: {
    id: 'research',
    name: 'Research',
    emoji: '📜',
    description: 'Study texts and historical documents'
  },
  investigate: {
    id: 'investigate',
    name: 'Investigate',
    emoji: '🔍',
    description: 'Search for clues and hidden details'
  },
  converse: {
    id: 'converse',
    name: 'Converse',
    emoji: '💬',
    description: 'Engage in dialogue with NPCs'
  },
};

// Tooltip component that renders via Portal
const Tooltip = ({ children, targetRef, colorScheme, show }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (show && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // 8px above button (accounts for tooltip height + margin)
        left: rect.left + rect.width / 2 // center of button
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
        className="px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap border backdrop-blur-sm"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 247, 0.95) 100%)',
          borderColor: colorScheme?.glowColor || (isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(16, 185, 129, 0.3)'),
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

export function ActionPanel({
  hasActiveNPC = false,
  onActionClick,
  className = '',
  location = '',
  shopSignHung = false
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [pressedKey, setPressedKey] = useState(null);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Store refs for all buttons
  const buttonRefs = useRef({});

  // Default hotkey assignments
  const [hotkeySlots, setHotkeySlots] = useState({
    1: 'forage',
    2: 'read',
    3: 'mix'
  });

  // Temporary state for settings (before saving)
  const [tempHotkeySlots, setTempHotkeySlots] = useState(hotkeySlots);

  // Check if player is at their shop
  const isAtShop = location && location.toLowerCase().includes('botica');

  // Update slot 1 based on location (shop sign replaces forage)
  let currentSlot1 = hotkeySlots[1];
  if (isAtShop && hotkeySlots[1] === 'forage') {
    currentSlot1 = shopSignHung ? 'removeSign' : 'hangSign';
  }

  // Update slot 3 based on NPC presence
  const currentSlot3 = hasActiveNPC && hotkeySlots[3] === 'observe' ? 'diagnose' : hotkeySlots[3];

  const handleSaveSettings = () => {
    setHotkeySlots(tempHotkeySlots);
    setIsSettingsOpen(false);
  };

  const handleCancelSettings = () => {
    setTempHotkeySlots(hotkeySlots);
    setIsSettingsOpen(false);
  };

  const handleSlotChange = (slot, actionId) => {
    setTempHotkeySlots(prev => ({
      ...prev,
      [slot]: actionId
    }));
  };

  // Initial render animation
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialRender(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts with press feedback
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isSettingsOpen) return;

      // Don't trigger hotkeys if user is typing in a text input or textarea
      const activeElement = document.activeElement;
      const isTyping = activeElement &&
        (activeElement.tagName === 'INPUT' ||
         activeElement.tagName === 'TEXTAREA' ||
         activeElement.isContentEditable);

      if (isTyping) return;

      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const slot = parseInt(e.key);

        // Visual feedback
        setPressedKey(slot);
        setTimeout(() => setPressedKey(null), 200);

        let actionId;
        if (slot === 1) {
          actionId = currentSlot1;
        } else if (slot === 3) {
          actionId = currentSlot3;
        } else {
          actionId = hotkeySlots[slot];
        }
        const action = AVAILABLE_ACTIONS[actionId];
        if (action && onActionClick) {
          onActionClick(actionId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hotkeySlots, currentSlot1, currentSlot3, isSettingsOpen, onActionClick]);

  // Color schemes for different action types
  const getActionColorScheme = (actionId) => {
    const isDark = document.documentElement.classList.contains('dark');
    const schemes = {
      forage: {
        glowColor: isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)',
        radialCenter: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(134, 239, 172, 0.2)'
      },
      hangSign: {
        glowColor: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(251, 191, 36, 0.3)',
        radialCenter: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(254, 243, 199, 0.2)'
      },
      removeSign: {
        glowColor: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)',
        radialCenter: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 202, 202, 0.2)'
      },
      read: {
        glowColor: isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.3)',
        radialCenter: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(233, 213, 255, 0.2)'
      },
      observe: {
        glowColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
        radialCenter: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(191, 219, 254, 0.2)'
      },
      diagnose: {
        glowColor: isDark ? 'rgba(236, 72, 153, 0.4)' : 'rgba(236, 72, 153, 0.3)',
        radialCenter: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(252, 231, 243, 0.2)'
      },
      mix: {
        glowColor: isDark ? 'rgba(249, 115, 22, 0.4)' : 'rgba(249, 115, 22, 0.3)',
        radialCenter: isDark ? 'rgba(249, 115, 22, 0.15)' : 'rgba(254, 215, 170, 0.2)'
      },
      experiment: {
        glowColor: isDark ? 'rgba(14, 165, 233, 0.4)' : 'rgba(14, 165, 233, 0.3)',
        radialCenter: isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(186, 230, 253, 0.2)'
      },
      map: {
        glowColor: isDark ? 'rgba(20, 184, 166, 0.4)' : 'rgba(20, 184, 166, 0.3)',
        radialCenter: isDark ? 'rgba(20, 184, 166, 0.15)' : 'rgba(153, 246, 228, 0.2)'
      },
      research: {
        glowColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)',
        radialCenter: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(221, 214, 254, 0.2)'
      },
      investigate: {
        glowColor: isDark ? 'rgba(202, 138, 4, 0.4)' : 'rgba(202, 138, 4, 0.3)',
        radialCenter: isDark ? 'rgba(202, 138, 4, 0.15)' : 'rgba(254, 240, 138, 0.2)'
      },
      converse: {
        glowColor: isDark ? 'rgba(236, 72, 153, 0.4)' : 'rgba(236, 72, 153, 0.3)',
        radialCenter: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(252, 231, 243, 0.2)'
      }
    };
    return schemes[actionId] || schemes.read;
  };

  const renderMainActionButton = (slot) => {
    let actionId;
    if (slot === 1) {
      actionId = currentSlot1;
    } else if (slot === 3) {
      actionId = currentSlot3;
    } else {
      actionId = hotkeySlots[slot];
    }
    const action = AVAILABLE_ACTIONS[actionId];
    if (!action) return null;

    const isHovered = hoveredAction === `main-${slot}`;
    const isPressed = pressedKey === slot;
    const isSignActive = actionId === 'removeSign';
    const isDark = document.documentElement.classList.contains('dark');
    const colorScheme = getActionColorScheme(actionId);

    // Create ref if doesn't exist
    const refKey = `main-${slot}`;
    if (!buttonRefs.current[refKey]) {
      buttonRefs.current[refKey] = { current: null };
    }

    // Stagger animation delay
    const animationDelay = isInitialRender ? `${slot * 100}ms` : '0ms';
    const animationClass = isInitialRender ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0';

    return (
      <div key={slot} className="relative group/tooltip">
        <RippleButton
          ref={(el) => buttonRefs.current[refKey].current = el}
          onMouseEnter={() => setHoveredAction(`main-${slot}`)}
          onMouseLeave={() => setHoveredAction(null)}
          onClick={() => onActionClick?.(actionId)}
          rippleColor={colorScheme.glowColor}
          className={`relative overflow-hidden ${animationClass} ${
            isSignActive
              ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-400 dark:border-amber-600 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 animate-pulse-slow'
              : 'bg-white dark:bg-gray-800 border-2 border-[#e5dcc9] dark:border-gray-700'
          } hover:border-[#d4c5a9] dark:hover:border-gray-600 rounded-2xl p-2.5 w-full aspect-square flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 ${
            isPressed ? 'scale-95' : 'hover:-translate-y-1'
          }`}
          style={{
            transitionDelay: animationDelay
          }}
        >
          {/* Subtle radial gradient around emoji on hover */}
          <div
            className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${colorScheme.radialCenter}, transparent 60%)`
            }}
          />

          {/* Hotkey Badge - Outlined with glow on hover */}
          <div
            className={`absolute top-1.5 right-1.5 w-4 h-4 border border-parchment-600/40 dark:border-[#f4e8d0]/40 text-[#6b5a47] dark:text-[#f4e8d0] rounded-md flex items-center justify-center font-mono font-semibold text-[0.6rem] transition-all duration-300 z-10 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            style={{
              boxShadow: isHovered ? `0 0 8px ${colorScheme.glowColor}` : 'none'
            }}
          >
            {slot}
          </div>

          {/* Emoji Icon with better depth and glow on hover */}
          <div className={`mb-2 transition-all duration-500 z-10 ${isHovered ? 'scale-110' : 'scale-100'}`}>
            <div
              className="w-10 h-10 bg-gradient-to-br from-[#fdfbf7] to-[#f9f6f1] dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center text-xl border border-[#f4e8d0] dark:border-gray-600 transition-all duration-300 group-hover/tooltip:rotate-[5deg]"
              style={{
                boxShadow: isHovered
                  ? `inset 0 2px 4px rgba(0, 0, 0, ${isDark ? 0.3 : 0.08}), 0 2px 8px rgba(0, 0, 0, ${isDark ? 0.2 : 0.05}), 0 0 20px ${colorScheme.glowColor}`
                  : isDark
                  ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
                  : 'inset 0 2px 4px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              {action.emoji}
            </div>
          </div>

          {/* Label */}
          <div className="text-[0.85rem] font-semibold tracking-wide text-[#3d2817] dark:text-[#f4e8d0] text-center leading-tight z-10">
            {action.name}
          </div>
        </RippleButton>

        {/* Tooltip via Portal */}
        <Tooltip targetRef={buttonRefs.current[refKey]} colorScheme={colorScheme} show={isHovered}>
          {action.description}
        </Tooltip>
      </div>
    );
  };

  const renderSecondaryButton = (action, index) => {
    const isHovered = hoveredAction === `secondary-${action.id}`;
    const isDark = document.documentElement.classList.contains('dark');
    // Use green ripple for all secondary buttons to match their green hover state
    const greenRippleColor = isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)';

    // Create ref if doesn't exist
    const refKey = `secondary-${action.id}`;
    if (!buttonRefs.current[refKey]) {
      buttonRefs.current[refKey] = { current: null };
    }

    // Stagger animation delay (start after primary buttons)
    const animationDelay = isInitialRender ? `${(index + 4) * 100}ms` : '0ms';
    const animationClass = isInitialRender ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0';

    return (
      <div key={action.id} className="relative group/tooltip">
        <RippleButton
          ref={(el) => buttonRefs.current[refKey].current = el}
          onMouseEnter={() => setHoveredAction(`secondary-${action.id}`)}
          onMouseLeave={() => setHoveredAction(null)}
          onClick={() => onActionClick?.(action.id)}
          rippleColor={greenRippleColor}
          className={`${animationClass} group bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 border border-[#e5dcc9] dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700/50 rounded-lg p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-300 w-full`}
          style={{
            transitionDelay: animationDelay
          }}
        >
          {/* Icon */}
          <div className="w-10 h-10 bg-[#f9f6f1] dark:bg-gray-700 rounded-lg flex items-center justify-center text-lg flex-shrink-0 text-[#6b5a47] dark:text-[#f4e8d0]">
            {action.icon}
          </div>

          {/* Text Content */}
          <div className="flex-1 text-left">
            <div className="font-['Crimson_Text'] text-base font-semibold text-[#3d2817] dark:text-[#f4e8d0] leading-tight">
              {action.name}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight font-sans">
              {action.description}
            </div>
          </div>
        </RippleButton>

        {/* Tooltip via Portal */}
        <Tooltip
          targetRef={buttonRefs.current[refKey]}
          colorScheme={{ glowColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.3)' }}
          show={isHovered}
        >
          {action.description}
        </Tooltip>
      </div>
    );
  };

  const renderSettings = () => {
    const isDark = document.documentElement.classList.contains('dark');

    return (
      <div
        className="rounded-2xl p-4 space-y-4"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.92) 50%, rgba(15, 23, 42, 0.90) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.90) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: isDark
            ? '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d4c5a9] dark:border-gray-700">
          <h3 className="font-['Cinzel'] text-base font-bold text-[#3d2817] dark:text-[#f4e8d0] uppercase tracking-wider">
            Customize Actions
          </h3>
          <button
            onClick={handleCancelSettings}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hotkey Slots Configuration - Compact */}
        <div className="space-y-2.5">
          {[1, 2, 3].map(slot => (
            <div key={slot} className="flex items-center gap-3">
              <label className="text-xs font-semibold text-[#3d2817] dark:text-[#f4e8d0] font-mono w-8">
                Key {slot}
              </label>
              <select
                value={tempHotkeySlots[slot]}
                onChange={(e) => handleSlotChange(slot, e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 border border-[#d4c5a9] dark:border-gray-600 rounded-lg px-3 py-1.5 text-[#3d2817] dark:text-[#f4e8d0] font-sans text-sm focus:outline-none focus:border-[#b8a989] dark:focus:border-gray-500 transition-colors"
              >
                {Object.values(AVAILABLE_ACTIONS)
                  .filter(action => !action.contextual)
                  .map(action => (
                    <option key={action.id} value={action.id}>
                      {action.emoji} {action.name}
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSaveSettings}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-sans text-sm"
          >
            Save
          </button>
          <button
            onClick={handleCancelSettings}
            className="flex-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-650 text-[#3d2817] dark:text-[#f4e8d0] font-semibold py-2 px-3 rounded-lg border border-[#d4c5a9] dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 font-sans text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  if (isSettingsOpen) {
    return (
      <div className={`space-y-4 ${className}`}>
        {renderSettings()}
      </div>
    );
  }

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className={className}>
      {/* Main Panel with Glassomorphic Effect - Bottom-Right Variant */}
      <div
        className="group rounded-2xl p-3.5 transition-all duration-500 relative overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.92) 50%, rgba(15, 23, 42, 0.90) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.90) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: isDark
            ? '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        }}
      >

        {/* Primary Actions Section Header with Elegant Dividers */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4c5a9] to-[#d4c5a9] dark:via-gray-600 dark:to-gray-600"></div>
          <span className="font-sans text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-[0.15em] whitespace-nowrap">
            Primary Actions
          </span>
          <div className="relative">
            <button
              ref={(el) => {
                const refKey = 'settings-button';
                if (!buttonRefs.current[refKey]) {
                  buttonRefs.current[refKey] = { current: null };
                }
                buttonRefs.current[refKey].current = el;
              }}
              onMouseEnter={() => setHoveredAction('settings-button')}
              onMouseLeave={() => setHoveredAction(null)}
              onClick={() => setIsSettingsOpen(true)}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex-shrink-0"
              aria-label="Customize actions"
            >
              <span className="text-sm">⚙️</span>
            </button>
            <Tooltip
              targetRef={buttonRefs.current['settings-button']}
              colorScheme={{ glowColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.3)' }}
              show={hoveredAction === 'settings-button'}
            >
              Customize action hotkeys
            </Tooltip>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#d4c5a9] to-[#d4c5a9] dark:via-gray-600 dark:to-gray-600"></div>
        </div>

        {/* 3 Main Action Buttons (ROW) */}
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          {renderMainActionButton(1)}
          {renderMainActionButton(2)}
          {renderMainActionButton(3)}
        </div>

        {/* Resources Section Header with Elegant Dividers */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4c5a9] to-[#d4c5a9] dark:via-gray-600 dark:to-gray-600"></div>
          
        </div>

        {/* 4 Secondary Buttons (2x2 GRID) - Compact */}
        <div className="grid grid-cols-2 gap-1.5">
          {renderSecondaryButton({
            id: 'roster',
            icon: <FaClipboardList />,
            name: 'Patient Roster',
            description: 'View all patients'
          }, 0)}
          {renderSecondaryButton({
            id: 'rest',
            icon: <FaBed />,
            name: 'Rest',
            description: 'Restore energy'
          }, 1)}
          {renderSecondaryButton({
            id: 'bargain',
            icon: <FaShoppingCart />,
            name: 'Trade',
            description: 'Buy and sell'
          }, 2)}
          {renderSecondaryButton({
            id: 'accounts',
            icon: <FaBalanceScale />,
            name: 'Accounts',
            description: 'Review finances'
          }, 3)}
        </div>

        {/* NPC Active Indicator */}
        {hasActiveNPC && (
          <div className="mt-2.5 bg-[#fff8e7] dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-1.5 flex items-center justify-center space-x-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              NPC Active — Press <kbd className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded font-mono text-xs">3</kbd> to {currentSlot3 === 'diagnose' ? 'Diagnose' : AVAILABLE_ACTIONS[currentSlot3].name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActionPanel;
