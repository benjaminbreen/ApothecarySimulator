import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDrop } from 'react-dnd';

// Tooltip component that renders via Portal
const Tooltip = ({ children, targetRef, colorScheme, show }) => {
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

const InputArea = ({
  userInput,
  setUserInput,
  handleSubmit,
  disabled = false,
  onQuickAction,
  onItemDrop // New callback for when an item is dropped
}) => {
  const inputRef = useRef(null);

  // Drop zone for inventory items
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'INVENTORY_ITEM',
    drop: (item) => {
      if (onItemDrop) {
        onItemDrop(item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [onItemDrop]);

  // Combine drop ref with the container
  const textareaRef = useRef(null);
  drop(textareaRef);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Quick action buttons - more subtle and contextual
  const quickActions = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      label: 'Examine',
      action: 'examine inventory',
      tooltip: 'Inspect your possessions and ingredients'
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: 'Ask',
      action: 'ask about ',
      tooltip: 'Inquire about people, places, or things'
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
      ),
      label: 'Go somewhere',
      action: 'go to ',
      tooltip: 'Travel to a different location in the city'
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      label: 'Study',
      action: 'consult my books',
      tooltip: 'Consult medical texts and references'
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Wait',
      action: 'wait and observe',
      tooltip: 'Pass time and observe your surroundings'
    },
  ];

  const handleQuickAction = (action) => {
    if (onQuickAction) {
      onQuickAction(action);
    } else {
      setUserInput(action);
    }
  };

  const dropIndicatorClasses = isOver && canDrop
    ? 'ring-4 ring-botanical-400 ring-opacity-50 border-botanical-500 bg-botanical-50'
    : canDrop
    ? 'border-botanical-400'
    : '';

  const [isFocused, setIsFocused] = React.useState(false);
  const [hoveredAction, setHoveredAction] = React.useState(null);
  const hasText = userInput.length > 0;
  const isDark = document.documentElement.classList.contains('dark');

  // Store refs for all chip buttons
  const chipRefs = useRef({});

  return (
    <div className="rounded-2xl p-2.5 transition-all duration-300" style={{
      background: isDark
        ? 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.92) 100%)'
        : 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.96) 0%, rgba(249, 245, 235, 0.92) 100%)',
      backdropFilter: 'blur(12px) saturate(120%)',
      WebkitBackdropFilter: 'blur(12px) saturate(120%)',
      border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(228, 218, 195, 0.3)',
      boxShadow: isDark
        ? '0 4px 12px rgba(0, 0, 0, 0.4)'
        : '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className="flex gap-2.5 relative">
          <div ref={textareaRef} className="flex-1 relative group">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isOver ? "Drop item to add it to your action..." : "What do you do?"}
              className={`w-full h-14 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-parchment-300 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-emerald-200/50 dark:focus:ring-amber-500/30 text-ink-900 dark:text-parchment-100 placeholder-ink-500 dark:placeholder-slate-500 transition-all duration-300 shadow-sm dark:shadow-dark-elevation-1 ${dropIndicatorClasses}`}
              disabled={disabled}
              aria-label="Action input"
              style={{
                fontFamily: "'Crimson Text', Georgia, serif",
                fontSize: '1.125rem',
                lineHeight: '1.5',
                fontWeight: 500
              }}
            />
            {/* Subtle glow on focus, stronger when text entered - amber in dark mode */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-300 shadow-glow-botanical dark:shadow-glow-amber" />
          </div>
          <button
            type="submit"
            disabled={disabled}
            className={`px-6 text-white bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-amber-500 dark:to-amber-600 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans h-12 relative overflow-hidden shadow-elevation-2 dark:shadow-glow-amber ${isFocused ? 'scale-[1.02]' : ''} ${hasText ? 'scale-105' : ''} active:scale-[0.98]`}
            aria-label="Submit action"
          >
            {/* Subtle inner highlight */}
            <div className="absolute inset-0 rounded-xl opacity-20 pointer-events-none bg-gradient-to-br from-white/50 to-transparent" />

            {/* Content */}
            <span className="hidden sm:inline tracking-wide text-sm relative z-10">Continue</span>
            <svg
              className={`w-4 h-4 transition-all duration-300 relative z-10 ${hasText ? 'translate-x-1 animate-pulse' : isFocused ? 'translate-x-0.5' : ''} group-hover:translate-x-0.5`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </button>
        </div>

        {/* Quick Action Chips + Keyboard hint on same line */}
        <div className="flex flex-wrap items-center gap-1.5">
          {quickActions.map((qa, idx) => {
            const refKey = `chip-${idx}`;
            if (!chipRefs.current[refKey]) {
              chipRefs.current[refKey] = { current: null };
            }

            return (
              <div key={idx} className="relative group">
                <button
                  ref={(el) => chipRefs.current[refKey].current = el}
                  type="button"
                  onClick={() => handleQuickAction(qa.action)}
                  onMouseEnter={() => setHoveredAction(idx)}
                  onMouseLeave={() => setHoveredAction(null)}
                  disabled={disabled}
                  className="px-3 py-1.5 relative overflow-hidden rounded-lg text-xs text-ink-700 dark:text-parchment-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 font-sans font-medium shadow-elevation-1 dark:shadow-dark-elevation-1 hover:shadow-elevation-2 dark:hover:shadow-glow-amber active:scale-95 border border-transparent hover:border-emerald-400/30 dark:hover:border-amber-500/30"
                  aria-label={qa.label}
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(254, 252, 247, 0.98) 0%, rgba(249, 245, 235, 0.95) 100%)',
                  }}
                >
                  {/* Hover gradient overlay */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    }}
                  />
                  {/* Content */}
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-emerald-700 dark:group-hover:text-amber-400">
                    {qa.icon}
                  </span>
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-emerald-700 dark:group-hover:text-amber-400">
                    {qa.label}
                  </span>
                </button>

                <Tooltip
                  targetRef={chipRefs.current[refKey]}
                  colorScheme={{ glowColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(16, 185, 129, 0.3)' }}
                  show={hoveredAction === idx}
                >
                  {qa.tooltip}
                </Tooltip>
              </div>
            );
          })}

          {/* Keyboard hint on same line */}
          <div className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-slate-400 ml-auto transition-colors duration-300">
            <span className="font-sans">Press</span>
            <kbd className="px-2 py-0.5 bg-parchment-100 dark:bg-slate-700 border border-parchment-300 dark:border-slate-600 rounded text-ink-700 dark:text-parchment-200 font-mono font-semibold shadow-sm text-[0.65rem] transition-colors duration-300">
              Enter ↵
            </kbd>
            <span className="font-sans">to continue</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InputArea;
