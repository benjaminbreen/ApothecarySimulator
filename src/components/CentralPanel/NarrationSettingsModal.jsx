// NarrationSettingsModal.jsx
// Settings modal for narration panel customization

import React, { useState } from 'react';

export function NarrationSettingsModal({
  isOpen,
  onClose,
  fontSize,
  onFontSizeChange,
  isDarkMode,
  onDarkModeToggle,
  onOpenLLMView
}) {
  if (!isOpen) return null;

  const fontSizes = [
    { label: 'Small', value: 'text-sm', sample: '14px' },
    { label: 'Medium', value: 'text-base', sample: '16px' },
    { label: 'Large', value: 'text-lg', sample: '18px' },
    { label: 'Extra Large', value: 'text-xl', sample: '20px' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-ink-200 dark:border-slate-600">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 dark:border-slate-600 bg-gradient-to-r from-parchment-50 to-white dark:from-slate-700 dark:to-slate-800">
          <h2 className="text-xl font-bold text-ink-900 dark:text-parchment-100">
            Narration Settings
          </h2>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 dark:text-parchment-400 dark:hover:text-parchment-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Font Size Control */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-parchment-200 mb-3">
              Font Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => onFontSizeChange(size.value)}
                  className={`
                    px-4 py-3 rounded-lg border-2 transition-all duration-200
                    ${fontSize === size.value
                      ? 'border-botanical-500 bg-botanical-50 dark:bg-botanical-900/20 text-botanical-700 dark:text-botanical-300 font-semibold'
                      : 'border-ink-200 dark:border-slate-600 hover:border-ink-300 dark:hover:border-slate-500 text-ink-600 dark:text-parchment-300'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="font-medium">{size.label}</div>
                    <div className="text-xs opacity-70 mt-1">{size.sample}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-parchment-200 mb-3">
              Narration Panel Theme
            </label>
            <button
              onClick={onDarkModeToggle}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all duration-200
                ${isDarkMode
                  ? 'border-slate-600 bg-slate-800 text-parchment-100'
                  : 'border-ink-200 bg-white text-ink-700'
                }
                hover:shadow-md
              `}
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="font-medium">
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <span className="text-xs opacity-70">
                Click to toggle
              </span>
            </button>
          </div>

          {/* LLM Transparency View */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-parchment-200 mb-3">
              Advanced
            </label>
            <button
              onClick={() => {
                onOpenLLMView();
                onClose();
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 border-ink-200 dark:border-slate-600 hover:border-botanical-500 dark:hover:border-botanical-500 bg-white dark:bg-slate-900 text-ink-700 dark:text-parchment-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-botanical-600 dark:text-botanical-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium">LLM Transparency View</div>
                  <div className="text-xs opacity-70">View AI inputs/outputs</div>
                </div>
              </div>
              <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-parchment-50 dark:bg-slate-900 border-t border-ink-200 dark:border-slate-600">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-botanical-600 hover:bg-botanical-700 dark:bg-botanical-700 dark:hover:bg-botanical-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
