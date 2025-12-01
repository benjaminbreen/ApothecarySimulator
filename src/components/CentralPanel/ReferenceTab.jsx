// ReferenceTab.jsx
// Medical Reference Compendium - Wikipedia + Primary Sources

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { REFERENCE_CATEGORIES, getAllEntries } from '../../core/data/medicalReference';
import { searchAll, getEnhancedEntry, getRelatedEntries } from '../../core/services/referenceService';
import { getSourceById } from '../../core/services/primarySourceService';

export function ReferenceTab({ initialSelectedEntry = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [viewMode, setViewMode] = useState('browse'); // 'browse', 'search', 'entry'
  const [entryTransitioning, setEntryTransitioning] = useState(false);

  // Get all entries for browsing
  const allEntries = useMemo(() => getAllEntries(), []);

  // Filtered entries by category
  const categoryEntries = useMemo(() => {
    if (!selectedCategory) return allEntries;
    return allEntries.filter(entry => entry.category === selectedCategory);
  }, [selectedCategory, allEntries]);

  // Handle initial entry selection from medical term clicks
  useEffect(() => {
    if (initialSelectedEntry) {
      console.log('[ReferenceTab] Loading initial entry from medical term click:', initialSelectedEntry);

      // Start smooth transition
      setEntryTransitioning(true);

      // Small delay for visual feedback
      setTimeout(async () => {
        await handleSelectEntry(initialSelectedEntry);
        setEntryTransitioning(false);
      }, 200);
    }
  }, [initialSelectedEntry]);

  // Handle search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setViewMode('browse');
      return;
    }

    setViewMode('search');
    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchAll(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('[ReferenceTab] Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load entry details with Wikipedia data
  const handleSelectEntry = async (entryId) => {
    setIsLoadingEntry(true);
    setViewMode('entry');

    try {
      const enhanced = await getEnhancedEntry(entryId);
      setSelectedEntry(enhanced);
    } catch (error) {
      console.error('[ReferenceTab] Error loading entry:', error);
    } finally {
      setIsLoadingEntry(false);
    }
  };

  // Back to browsing
  const handleBack = () => {
    setSelectedEntry(null);
    setViewMode(searchQuery ? 'search' : 'browse');
  };

  return (
    <div className="flex h-full overflow-hidden bg-gradient-to-br from-parchment-50 to-amber-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* Left Sidebar - Categories & Search */}
      <div className="w-72 flex flex-col border-r-2 border-parchment-300 dark:border-slate-700 bg-parchment-100/50 dark:bg-slate-800/50">
        {/* Header */}
        <div className="p-5 border-b-2 border-parchment-300 dark:border-slate-700">
          <h2 className="text-xl font-bold text-ink-900 dark:text-amber-400 font-serif flex items-center gap-2 mb-3">
            📚 Medical Compendium
          </h2>
          <p className="text-sm text-ink-600 dark:text-parchment-300 font-serif italic">
            Knowledge from antiquity to the New World
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b-2 border-parchment-300 dark:border-slate-700">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge..."
              className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-slate-900 border-2 border-parchment-300 dark:border-slate-600 rounded-xl text-ink-900 dark:text-parchment-100 placeholder-ink-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-600 transition-colors font-serif"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-400 dark:text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-bold text-ink-500 dark:text-slate-400 uppercase tracking-wider mb-3 font-sans">
            Browse by Category
          </div>

          {/* All Entries */}
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
              setViewMode('browse');
            }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
              selectedCategory === null && viewMode === 'browse'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-ink-900 dark:text-amber-400 shadow-sm'
                : 'bg-white/60 dark:bg-slate-800/60 text-ink-700 dark:text-parchment-200 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📖</span>
              <div className="flex-1">
                <div className="font-semibold font-serif">All Entries</div>
                <div className="text-xs text-ink-500 dark:text-slate-400">
                  {allEntries.length} entries
                </div>
              </div>
            </div>
          </button>

          {/* Category Buttons */}
          {Object.values(REFERENCE_CATEGORIES).map((category) => {
            const count = allEntries.filter(e => e.category === category.id).length;
            const isActive = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSearchQuery('');
                  setViewMode('browse');
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `bg-${category.color}-100 dark:bg-${category.color}-900/30 text-ink-900 dark:text-${category.color}-400 shadow-sm`
                    : 'bg-white/60 dark:bg-slate-800/60 text-ink-700 dark:text-parchment-200 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold font-serif">{category.name}</div>
                    <div className="text-xs text-ink-500 dark:text-slate-400">
                      {count} {count === 1 ? 'entry' : 'entries'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-parchment-300 dark:border-slate-700 bg-parchment-50/80 dark:bg-slate-900/80">
          <div className="text-xs text-ink-600 dark:text-slate-400 font-serif italic text-center">
            Sources: Historical texts, Wikipedia, and scholarly research
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {viewMode === 'entry' && selectedEntry ? (
          // Entry Detail View
          <EntryDetailView
            entry={selectedEntry}
            onBack={handleBack}
            onSelectRelated={handleSelectEntry}
            isLoading={isLoadingEntry}
          />
        ) : (
          // List View (Browse or Search Results)
          <ListViewArea
            entries={viewMode === 'search' ? searchResults : categoryEntries}
            onSelectEntry={handleSelectEntry}
            viewMode={viewMode}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            isSearching={isSearching}
          />
        )}
      </div>
    </div>
  );
}

/**
 * List View - Shows entries in a browsable list
 */
function ListViewArea({ entries, onSelectEntry, viewMode, searchQuery, selectedCategory, isSearching }) {
  const categoryName = selectedCategory
    ? REFERENCE_CATEGORIES[Object.keys(REFERENCE_CATEGORIES).find(k => REFERENCE_CATEGORIES[k].id === selectedCategory)]?.name
    : 'All Entries';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b-2 border-parchment-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60">
        <h3 className="text-lg font-bold text-ink-900 dark:text-parchment-100 font-serif">
          {viewMode === 'search' ? (
            <>Search Results for "{searchQuery}"</>
          ) : (
            <>{categoryName}</>
          )}
        </h3>
        <p className="text-sm text-ink-600 dark:text-slate-400 mt-1">
          {isSearching ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-3 w-3 border-2 border-amber-600 border-t-transparent rounded-full" />
              Searching...
            </span>
          ) : (
            <>{entries.length} {entries.length === 1 ? 'entry' : 'entries'} found</>
          )}
        </p>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-ink-600 dark:text-slate-400 font-serif italic">
              {viewMode === 'search' ? 'No entries found for your search.' : 'No entries in this category yet.'}
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onClick={() => onSelectEntry(entry.id)} />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Entry Card - Individual entry in list
 */
function EntryCard({ entry, onClick }) {
  const category = Object.values(REFERENCE_CATEGORIES).find(c => c.id === entry.category);
  const categoryColor = category?.color || 'amber';

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-parchment-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="flex items-start gap-4">
        {/* Icon/Thumbnail */}
        <div className={`flex-shrink-0 w-16 h-16 rounded-lg bg-${categoryColor}-100 dark:bg-${categoryColor}-900/30 flex items-center justify-center overflow-hidden border-2 border-parchment-200 dark:border-slate-600`}>
          {entry.icon ? (
            <img
              src={entry.icon}
              alt={entry.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to category icon if image fails
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<span class="text-2xl">${category?.icon || '📄'}</span>`;
              }}
            />
          ) : (
            <span className="text-2xl">{category?.icon || '📄'}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-ink-900 dark:text-parchment-100 font-serif group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              {entry.name}
            </h4>
            {entry.latinName && (
              <span className="text-xs text-ink-500 dark:text-slate-400 italic font-serif flex-shrink-0">
                {entry.latinName}
              </span>
            )}
          </div>

          <p className="text-sm text-ink-700 dark:text-slate-300 line-clamp-2 font-serif">
            {entry.summary}
          </p>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {entry.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-parchment-100 dark:bg-slate-700 text-ink-600 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        <svg
          className="w-5 h-5 text-ink-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

/**
 * Entry Detail View - Full entry with sources and Wikipedia
 */
function EntryDetailView({ entry, onBack, onSelectRelated, isLoading }) {
  const category = Object.values(REFERENCE_CATEGORIES).find(c => c.id === entry.category);
  const relatedEntries = getRelatedEntries(entry.id);

  // Get linked primary sources if any
  const linkedPrimarySources = useMemo(() => {
    if (!entry.primarySourceIds || entry.primarySourceIds.length === 0) return [];
    return entry.primarySourceIds
      .map(id => getSourceById(id))
      .filter(Boolean);
  }, [entry.primarySourceIds]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-ink-600 dark:text-slate-400 font-serif">Loading entry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Back Button */}
      <div className="px-6 py-4 border-b-2 border-parchment-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-parchment-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-ink-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Icon - Large prominent display */}
        <div className={`flex-shrink-0 w-20 h-20 rounded-xl bg-${category?.color || 'slate'}-100 dark:bg-${category?.color || 'slate'}-900/30 flex items-center justify-center overflow-hidden border-2 border-parchment-300 dark:border-slate-600 shadow-md`}>
          {entry.icon ? (
            <img
              src={entry.icon}
              alt={entry.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to category icon if image fails
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<span class="text-3xl">${category?.icon || '📄'}</span>`;
              }}
            />
          ) : (
            <span className="text-3xl">{category?.icon || '📄'}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-ink-900 dark:text-parchment-100 font-serif">
              {entry.name}
            </h2>
          </div>
          {entry.latinName && (
            <p className="text-sm text-ink-500 dark:text-slate-400 italic font-serif">
              {entry.latinName}
            </p>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary */}
          <section className="bg-white dark:bg-slate-800 rounded-xl p-5 border-2 border-parchment-200 dark:border-slate-700">
            <p className="text-ink-800 dark:text-parchment-200 font-serif leading-relaxed">
              {entry.summary}
            </p>
          </section>

          {/* Historical Source - Most Important! */}
          {entry.historicalSource && (
            <section className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border-2 border-amber-200 dark:border-amber-800">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 font-serif mb-3 flex items-center gap-2">
                📜 Historical Source
              </h3>
              <div className="space-y-3">
                <div className="font-serif text-amber-900 dark:text-amber-300">
                  <div className="font-semibold">{entry.historicalSource.work} ({entry.historicalSource.year})</div>
                  <div className="text-sm">by {entry.historicalSource.author}</div>
                  <div className="text-xs text-amber-700 dark:text-amber-500 mt-1">{entry.historicalSource.location}</div>
                </div>

                <blockquote className="border-l-4 border-amber-400 dark:border-amber-600 pl-4 py-2 italic text-amber-900 dark:text-amber-200 font-serif">
                  "{entry.historicalSource.excerpt}"
                </blockquote>

                {entry.historicalSource.translation && (
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-serif">
                    <span className="font-semibold">Translation:</span> "{entry.historicalSource.translation}"
                  </p>
                )}

                {/* Verification status badge */}
                {entry.historicalSource.verified !== undefined && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      entry.historicalSource.verified
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {entry.historicalSource.verified ? '✓ Verified Quote' : '⚠ Paraphrase'}
                    </span>
                    {entry.historicalSource.translator && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 italic">
                        {entry.historicalSource.translator}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Linked Primary Sources */}
          {linkedPrimarySources.length > 0 && (
            <section className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-5 border-2 border-amber-100 dark:border-amber-900">
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 font-serif mb-3 flex items-center gap-2">
                📚 Related Primary Sources
              </h3>
              <div className="space-y-4">
                {linkedPrimarySources.map((source) => (
                  <div key={source.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <div className="font-serif text-amber-900 dark:text-amber-300 mb-2">
                      <div className="font-semibold">{source.title}</div>
                      <div className="text-sm text-amber-700 dark:text-amber-400">
                        {source.author}, <em>{source.work}</em> ({source.year})
                      </div>
                    </div>

                    {source.text && (
                      <blockquote className="border-l-3 border-amber-300 dark:border-amber-600 pl-3 py-1 text-sm italic text-amber-800 dark:text-amber-200 font-serif mb-2">
                        "{source.text.length > 200 ? source.text.substring(0, 200) + '...' : source.text}"
                      </blockquote>
                    )}

                    {source.translation && (
                      <p className="text-sm text-amber-700 dark:text-amber-300 font-serif">
                        <span className="font-medium">Translation:</span> "{source.translation.length > 200 ? source.translation.substring(0, 200) + '...' : source.translation}"
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        source.verified
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {source.verified ? '✓ Verified' : '⚠ Paraphrase'}
                      </span>
                      {source.translator && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 italic">
                          {source.translator}
                        </span>
                      )}
                      {source.sourceUrl && (
                        <a
                          href={source.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View Source →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Properties (Humors, Uses, etc.) */}
          {entry.properties && (
            <section className="bg-white dark:bg-slate-800 rounded-xl p-5 border-2 border-parchment-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-ink-900 dark:text-parchment-100 font-serif mb-3">
                Properties & Characteristics
              </h3>
              <div className="space-y-3 font-serif text-ink-700 dark:text-parchment-200">
                {entry.properties.humors && (
                  <div>
                    <span className="font-semibold">Humoral Qualities:</span>{' '}
                    {entry.properties.humors.temperature && entry.properties.humors.moisture ? (
                      <>{entry.properties.humors.temperature.charAt(0).toUpperCase() + entry.properties.humors.temperature.slice(1)} and {entry.properties.humors.moisture.charAt(0).toUpperCase() + entry.properties.humors.moisture.slice(1)}</>
                    ) : 'Various'}
                  </div>
                )}
                {entry.properties.degree && (
                  <div>
                    <span className="font-semibold">Degree:</span> {entry.properties.degree}
                  </div>
                )}
                {entry.properties.qualities && (
                  <div>
                    <span className="font-semibold">Qualities:</span> {entry.properties.qualities.join(', ')}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Uses */}
          {entry.uses && entry.uses.length > 0 && (
            <section className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border-2 border-emerald-200 dark:border-emerald-800">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-400 font-serif mb-3">
                ✓ Medicinal Uses
              </h3>
              <ul className="space-y-2">
                {entry.uses.map((use, index) => (
                  <li key={index} className="flex items-start gap-2 text-emerald-900 dark:text-emerald-200 font-serif">
                    <span className="text-emerald-600 dark:text-emerald-500 mt-1">•</span>
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Contraindications */}
          {entry.contraindications && entry.contraindications.length > 0 && (
            <section className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-5 border-2 border-rose-200 dark:border-rose-800">
              <h3 className="text-lg font-bold text-rose-900 dark:text-rose-400 font-serif mb-3">
                ⚠️ Contraindications & Warnings
              </h3>
              <ul className="space-y-2">
                {entry.contraindications.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-rose-900 dark:text-rose-200 font-serif">
                    <span className="text-rose-600 dark:text-rose-500 mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Modern Note */}
          {entry.modernNote && (
            <section className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 font-serif mb-3 flex items-center gap-2">
                💡 Modern Understanding
              </h3>
              <p className="text-blue-900 dark:text-blue-200 font-serif leading-relaxed">
                {entry.modernNote}
              </p>
            </section>
          )}

          {/* Wikipedia Section */}
          {entry.hasWikipedia && entry.wikipedia && (
            <section className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-ink-900 dark:text-parchment-100 font-serif flex items-center gap-2">
                  🌐 Wikipedia
                </h3>
                <a
                  href={entry.wikipedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-sans"
                >
                  Read more →
                </a>
              </div>
              <p className="text-ink-700 dark:text-slate-300 font-serif leading-relaxed">
                {entry.wikipedia.extract}
              </p>
            </section>
          )}

          {/* Related Entries */}
          {relatedEntries.length > 0 && (
            <section className="bg-white dark:bg-slate-800 rounded-xl p-5 border-2 border-parchment-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-ink-900 dark:text-parchment-100 font-serif mb-3">
                Related Entries
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {relatedEntries.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => onSelectRelated(related.id)}
                    className="text-left p-3 bg-parchment-50 dark:bg-slate-700 rounded-lg hover:bg-parchment-100 dark:hover:bg-slate-600 transition-colors border border-parchment-200 dark:border-slate-600"
                  >
                    <div className="font-semibold text-ink-900 dark:text-parchment-100 font-serif text-sm">
                      {related.name}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
