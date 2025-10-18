/**
 * EntityTooltipPopup - Elegant tooltip on hover + compact popup on click
 *
 * Shows entity description on hover, and on click provides:
 * 1. "Look Closer" button (opens full POIModal)
 * 2. "Add Note" button (journal entry - stub for now)
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function EntityTooltip({ rect, description, entityName }) {
  const isDark = document.documentElement.classList.contains('dark');

  if (!rect || !description) return null;

  // Calculate position directly from rect prop (no state needed)
  const position = {
    top: rect.top - 8,
    left: rect.left + rect.width / 2,
  };

  return createPortal(
    <div
      className="fixed pointer-events-none z-[9999] transition-opacity duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div
        className="px-3 py-2 rounded-lg shadow-2xl max-w-xs border backdrop-blur-sm"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 247, 0.95) 100%)',
          borderColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(16, 185, 129, 0.3)',
        }}
      >
        <div className="text-xs font-sans text-ink-700 dark:text-parchment-200 leading-relaxed">
          {description}
        </div>
        {/* Arrow pointing down */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(254, 252, 247, 0.95)'}`,
          }}
        />
      </div>
    </div>,
    document.body
  );
}

export function EntityPopup({ isOpen, onClose, entityName, description, onLookCloser, onAddNote }) {
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

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div
        ref={popupRef}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-scale-in border-2"
        style={{
          borderColor: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(16, 185, 129, 0.4)',
        }}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-parchment-200 dark:border-slate-700">
          <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-parchment-100">
            {entityName}
          </h3>
        </div>

        {/* Description */}
        <div className="p-5">
          <p className="font-sans text-sm text-ink-700 dark:text-parchment-300 leading-relaxed italic">
            "{description}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-5 pt-0 flex gap-3">
          <button
            onClick={() => {
              onClose();
              onLookCloser();
            }}
            className="flex-1 px-4 py-2.5 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-amber-600 dark:to-amber-700 text-white dark:text-slate-900 rounded-xl hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-amber-500 dark:hover:to-amber-600 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            Look Closer
          </button>

          <button
            onClick={() => {
              onAddNote();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 bg-parchment-100 dark:bg-slate-800 hover:bg-parchment-200 dark:hover:bg-slate-700 text-ink-900 dark:text-parchment-200 rounded-xl font-medium text-sm transition-all duration-200 border border-parchment-300 dark:border-slate-600 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Add Note
          </button>
        </div>

        {/* Close hint */}
        <div className="px-5 pb-4 text-center">
          <p className="text-xs text-ink-500 dark:text-parchment-400 font-sans">
            Press <kbd className="px-1 py-0.5 bg-parchment-200 dark:bg-slate-800 rounded text-[10px] font-mono border border-parchment-300 dark:border-slate-700">ESC</kbd> or click outside to close
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.15s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>,
    document.body
  );
}
