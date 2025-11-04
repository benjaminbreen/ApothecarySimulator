/**
 * ListDropdown - Dropdown menu showing available list types
 * Appears when user clicks "List" chip
 */

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaListUl, FaTimes } from 'react-icons/fa';
import { LIST_TYPES } from '../core/config/listTypes.config';

export function ListDropdown({
  show,
  onClose,
  onSelectListType,
  targetRef,
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [hoveredType, setHoveredType] = useState(null);
  const dropdownRef = useRef(null);
  const isDark = document.documentElement.classList.contains('dark');

  // Position dropdown above the chip
  useEffect(() => {
    if (show && targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 10, // 10px above the chip
        left: rect.left,
      });
    }
  }, [show, targetRef]);

  // Close on outside click
  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          targetRef?.current && !targetRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose, targetRef]);

  if (!show) return null;

  const handleListTypeClick = (listType) => {
    console.log('🟡 [ListDropdown] handleListTypeClick called with:', listType);
    console.log('🟡 [ListDropdown] onSelectListType exists?', typeof onSelectListType);
    console.log('🟡 [ListDropdown] Calling onSelectListType...');
    onSelectListType(listType);
    console.log('🟡 [ListDropdown] Closing dropdown...');
    onClose();
  };

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[10000] transition-opacity duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-100%)',
        opacity: show ? 1 : 0,
      }}
    >
      <div
        className="rounded-xl shadow-2xl border overflow-hidden backdrop-blur-sm min-w-[280px]"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 247, 0.95) 100%)',
          borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(228, 218, 195, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-parchment-300 dark:border-slate-600">
          <div className="flex items-center gap-2">
            <FaListUl className="w-4 h-4 text-emerald-600 dark:text-amber-500" />
            <span className="text-sm font-semibold text-ink-900 dark:text-parchment-100 font-sans">
              Reference Lists
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 dark:text-slate-400 hover:text-ink-700 dark:hover:text-parchment-200 transition-colors"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List type options */}
        <div className="py-1">
          {LIST_TYPES.map((listType) => {
            const Icon = listType.icon;
            return (
              <button
                key={listType.id}
                onClick={() => handleListTypeClick(listType)}
                onMouseEnter={() => setHoveredType(listType.id)}
                onMouseLeave={() => setHoveredType(null)}
                className="w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-start gap-3 group"
              >
                <Icon className="w-4 h-4 text-emerald-600 dark:text-amber-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink-900 dark:text-parchment-100 group-hover:text-emerald-700 dark:group-hover:text-amber-400 transition-colors">
                    {listType.label}
                  </div>
                  <div className="text-xs text-ink-500 dark:text-slate-400 mt-1">
                    {listType.tooltip}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Helpful hint */}
        <div className="border-t border-parchment-300/60 dark:border-slate-700/60 bg-parchment-50/40 dark:bg-slate-800/40 px-4 py-2.5">
          <p className="text-xs text-ink-500 dark:text-slate-400 text-center italic">
            Generate a reference table for the current scene
          </p>
        </div>
      </div>

      {/* Arrow pointing down */}
      <div
        className="absolute top-full left-6 w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: isDark ? '8px solid rgba(15, 23, 42, 0.98)' : '8px solid rgba(255, 255, 255, 0.98)',
        }}
      />
    </div>,
    document.body
  );
}

export default ListDropdown;
