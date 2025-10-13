// TabNavigation.jsx
// Elegant tab switcher for central panel

import React from 'react';

export function TabNavigation({ activeTab, onTabChange, hasActivePatient, onOpenSettings }) {
  const allTabs = [
    {
      id: 'chronicle',
      label: 'Chronicle',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'log',
      label: 'Log',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'patient',
      label: 'Patient View',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      showIf: hasActivePatient  // Only show if there's an active patient
    },
  ];

  // Filter tabs based on showIf condition
  const tabs = allTabs.filter(tab => tab.showIf === undefined || tab.showIf === true);

  return (
    <div className="relative flex items-center gap-1 px-5 py-0 bg-gradient-to-b from-parchment-50 to-white/40 dark:from-slate-800 dark:to-slate-900/40 backdrop-blur-sm transition-colors duration-300">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-200
            ${activeTab === tab.id
              ? 'text-ink-900 dark:text-parchment-100 bg-white/95 dark:bg-slate-800/95 rounded-t-xl border-t-2 border-l-2 border-r-2 border-ink-200 dark:border-slate-600 shadow-sm dark:shadow-dark-elevation-1'
              : 'text-ink-500 dark:text-parchment-300 hover:text-ink-700 dark:hover:text-parchment-100 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-t-lg'
            }
          `}
          style={{
            marginBottom: activeTab === tab.id ? '-2px' : '0',
            zIndex: activeTab === tab.id ? 10 : 1,
          }}
        >
          <div className="flex items-center gap-2.5">
            {tab.icon}
            <span>{tab.label}</span>
          </div>
        </button>
      ))}

      {/* Settings Icon - Far Right */}
      <button
        onClick={onOpenSettings}
        className="ml-auto px-3 py-2 text-ink-400 dark:text-parchment-400 hover:text-ink-700 dark:hover:text-parchment-200 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200"
        title="Narration Settings"
        style={{ zIndex: 1 }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Divider line between tabs and content */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ink-100 via-ink-200 to-ink-100 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 transition-colors duration-300"
           style={{ zIndex: 5 }} />
    </div>
  );
}
