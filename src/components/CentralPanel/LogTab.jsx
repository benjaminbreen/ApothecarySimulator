// LogTab.jsx
// Event timeline tab - shows ALL game events (user actions, narrative, system messages)

import React, { useState } from 'react';

export function LogTab({ conversationHistory = [], onEntityClick }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const toggleExpanded = (index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  };

  // Filter entries based on search and type
  const filteredHistory = conversationHistory.filter((entry, idx) => {
    // Search filter
    const matchesSearch = !searchQuery ||
      entry.content?.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    let matchesType = true;
    if (filterType === 'player') {
      matchesType = entry.role === 'user';
    } else if (filterType === 'narrative') {
      matchesType = entry.role === 'assistant';
    } else if (filterType === 'system') {
      matchesType = entry.role === 'system';
    }

    return matchesSearch && matchesType;
  });

  if (conversationHistory.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-parchment-50 to-white animate-fade-in">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">📜</div>
          <p className="text-base text-ink-500 font-sans font-medium">No events recorded yet</p>
          <p className="text-sm text-ink-400 font-sans mt-1">Your journey will be chronicled here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-parchment-50 to-white animate-fade-in">
      {/* Toolbar */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-ink-100 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-display text-lg font-bold text-ink-900">Event Chronicle</h2>
          <span className="text-xs text-ink-500 font-sans">
            {filteredHistory.length} of {conversationHistory.length} events
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-ink-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
            />
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <FilterButton
              active={filterType === 'all'}
              onClick={() => setFilterType('all')}
            >
              All
            </FilterButton>
            <FilterButton
              active={filterType === 'player'}
              onClick={() => setFilterType('player')}
            >
              Actions
            </FilterButton>
            <FilterButton
              active={filterType === 'narrative'}
              onClick={() => setFilterType('narrative')}
            >
              Narrative
            </FilterButton>
            <FilterButton
              active={filterType === 'system'}
              onClick={() => setFilterType('system')}
            >
              System
            </FilterButton>
          </div>
        </div>
      </div>

      {/* Event Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        <div className="space-y-2.5">
          {filteredHistory.slice().reverse().map((entry, reverseIdx) => {
            const actualIndex = filteredHistory.length - 1 - reverseIdx;
            const isExpanded = expandedIndex === actualIndex;

            return (
              <div
                key={actualIndex}
                onClick={() => toggleExpanded(actualIndex)}
                className={`rounded-lg p-3 border transition-all duration-base cursor-pointer ${
                  entry.role === 'user'
                    ? 'bg-gradient-to-br from-potion-50 to-white border-potion-200 hover:border-potion-300'
                    : entry.role === 'assistant'
                    ? 'bg-gradient-to-br from-parchment-50 to-white border-ink-200 hover:border-ink-300'
                    : 'bg-gradient-to-br from-botanical-50 to-white border-botanical-200 hover:border-botanical-300'
                } shadow-elevation-1 hover:shadow-elevation-2 ${isExpanded ? 'ring-2 ring-emerald-200' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {/* Icon */}
                  <span className="text-base flex-shrink-0 mt-0.5">
                    {entry.role === 'user' ? (
                      <svg className="w-4 h-4 text-potion-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : entry.role === 'assistant' ? (
                      <svg className="w-4 h-4 text-ink-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-botanical-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-500 font-sans uppercase tracking-wide font-semibold">
                          {entry.role === 'user' ? 'Action' : entry.role === 'assistant' ? 'Narrative' : 'System'}
                        </span>
                        {entry.timestamp && (
                          <span className="text-xs text-ink-400 font-mono">
                            {entry.timestamp.time} • {entry.timestamp.date}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-ink-400 font-mono">
                        Entry {conversationHistory.indexOf(entry) + 1}
                      </span>
                    </div>

                    {/* Content - always visible, truncated when collapsed */}
                    <p className={`text-xs text-ink-800 font-sans leading-relaxed ${!isExpanded ? 'line-clamp-2' : 'whitespace-pre-wrap'}`}>
                      {entry.content}
                    </p>

                    {/* Expand indicator */}
                    {entry.content && entry.content.length > 150 && (
                      <div className="mt-1 text-xs text-emerald-600 font-semibold">
                        {isExpanded ? '▲ Click to collapse' : '▼ Click to expand'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200
        ${active
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-white text-ink-600 border border-ink-200 hover:border-emerald-200 hover:text-emerald-600'
        }
      `}
    >
      {children}
    </button>
  );
}
