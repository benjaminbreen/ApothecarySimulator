import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaTimes, FaPlus, FaDownload, FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * Enhanced Journal Panel
 *
 * Features:
 * - Glassomorphic parchment styling
 * - Shows game metadata (time, location, weather, reputation)
 * - Supports auto-generated, player, and AI context entries
 * - Expandable AI entries (collapsed by default to 2 lines)
 * - Player can add custom entries
 */
const JournalPanelEnhanced = ({
  isOpen,
  onClose,
  journal = [], // Array of journal entries: { content, type: 'auto'|'human'|'ai', source?, timestamp?, metadata? }
  onAddEntry, // Callback to add new player entry
  // Game state for metadata display
  currentTime = '',
  currentDate = '',
  currentLocation = '',
  currentWeather = '',
  reputation = 0,
}) => {
  const [customEntry, setCustomEntry] = useState('');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const isDark = document.documentElement.classList.contains('dark');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmitEntry = () => {
    if (customEntry.trim()) {
      onAddEntry({
        content: customEntry,
        type: 'human',
        timestamp: new Date().toISOString(),
        metadata: {
          time: currentTime,
          date: currentDate,
          location: currentLocation,
          weather: currentWeather,
          reputation
        }
      });
      setCustomEntry('');
      setIsAddingEntry(false);
    }
  };

  const handleSaveJournal = () => {
    const textContent = journal.map((entry, index) => {
      const meta = entry.metadata;
      const metaString = meta ? `\n[${meta.date} ${meta.time} | ${meta.location}]\n` : '\n';
      return `Entry ${index + 1}${metaString}${entry.content}`;
    }).join('\n\n---\n\n');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-${currentDate}.txt`.replace(/\s+/g, '-');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleExpanded = (index) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getEntryPreview = (content, maxLines = 2) => {
    const lines = content.split('\n');
    if (lines.length <= maxLines) return content;
    return lines.slice(0, maxLines).join('\n') + '...';
  };

  const getReputationLabel = (rep) => {
    if (rep >= 80) return { label: 'Renowned', color: 'text-emerald-600 dark:text-emerald-400' };
    if (rep >= 60) return { label: 'Respected', color: 'text-blue-600 dark:text-blue-400' };
    if (rep >= 40) return { label: 'Known', color: 'text-amber-600 dark:text-amber-400' };
    if (rep >= 20) return { label: 'Obscure', color: 'text-orange-600 dark:text-orange-400' };
    return { label: 'Infamous', color: 'text-red-600 dark:text-red-400' };
  };

  // Format date for entry headers: "SATURDAY, AUG 22, 1680, 8:15 AM"
  const formatEntryDate = (metadata) => {
    if (!metadata || !metadata.date || !metadata.time) return null;

    try {
      // Parse date like "August 22, 1680"
      const dateParts = metadata.date.match(/(\w+)\s+(\d+),?\s+(\d+)/);
      if (!dateParts) return `${metadata.date}, ${metadata.time}`.toUpperCase();

      const [, monthName, day, year] = dateParts;
      const monthAbbr = monthName.substring(0, 3).toUpperCase();

      // Create a Date object to get day of week (use 2020 as proxy year since JavaScript Date doesn't handle 1680)
      const monthNum = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December']
                        .indexOf(monthName);
      const proxyDate = new Date(2020, monthNum, parseInt(day));
      const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][proxyDate.getDay()];

      return `${dayOfWeek}, ${monthAbbr} ${day}, ${year}, ${metadata.time}`;
    } catch (e) {
      return `${metadata.date}, ${metadata.time}`.toUpperCase();
    }
  };

  const repInfo = getReputationLabel(reputation);

  return (
    <div
      className={`fixed top-0 right-0 h-full transition-all duration-500 ease-in-out z-[2000] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: 'min(500px, 100vw)' }}
    >
      {/* Glassomorphic container */}
      <div
        className="h-full flex flex-col"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 20, 10, 0.95) 0%, rgba(40, 30, 20, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(250, 245, 230, 0.95) 0%, rgba(245, 235, 215, 0.95) 100%)',
          backdropFilter: 'blur(12px)',
          borderLeft: isDark ? '2px solid rgba(139, 92, 46, 0.3)' : '2px solid rgba(139, 92, 46, 0.2)',
          boxShadow: isDark
            ? '-8px 0 24px rgba(0, 0, 0, 0.5)'
            : '-8px 0 24px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 px-6 py-5 border-b"
          style={{
            borderColor: isDark ? 'rgba(139, 92, 46, 0.3)' : 'rgba(139, 92, 46, 0.2)',
            background: isDark
              ? 'linear-gradient(to bottom, rgba(40, 30, 20, 0.6), rgba(30, 20, 10, 0.4))'
              : 'linear-gradient(to bottom, rgba(250, 245, 230, 0.6), rgba(245, 235, 215, 0.4))'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Crimson_Text'] text-3xl font-bold text-amber-900 dark:text-amber-100">
              Journal
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-amber-200/50 dark:hover:bg-amber-900/30"
              style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 83, 9)' }}
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Metadata Display */}
          <div className="grid grid-cols-2 gap-2 text-xs font-sans">
            <div className="px-3 py-2 rounded-lg bg-amber-100/40 dark:bg-amber-950/30 border border-amber-300/30 dark:border-amber-700/30">
              <div className="text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider text-[10px]">Time</div>
              <div className="text-amber-900 dark:text-amber-100 font-medium">{currentTime}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-amber-100/40 dark:bg-amber-950/30 border border-amber-300/30 dark:border-amber-700/30">
              <div className="text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider text-[10px]">Date</div>
              <div className="text-amber-900 dark:text-amber-100 font-medium">{currentDate}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-amber-100/40 dark:bg-amber-950/30 border border-amber-300/30 dark:border-amber-700/30">
              <div className="text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider text-[10px]">Location</div>
              <div className="text-amber-900 dark:text-amber-100 font-medium text-[11px] leading-tight">{currentLocation}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-amber-100/40 dark:bg-amber-950/30 border border-amber-300/30 dark:border-amber-700/30">
              <div className="text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider text-[10px]">Reputation</div>
              <div className={`font-bold ${repInfo.color}`}>{repInfo.label}</div>
            </div>
          </div>

          {currentWeather && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-blue-100/40 dark:bg-blue-950/30 border border-blue-300/30 dark:border-blue-700/30">
              <div className="text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wider text-[10px]">Weather</div>
              <div className="text-blue-900 dark:text-blue-100 font-medium text-[11px]">{currentWeather}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setIsAddingEntry(!isAddingEntry)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-sans text-sm font-semibold transition-all duration-200"
              style={{
                background: isAddingEntry
                  ? (isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)')
                  : (isDark ? 'rgba(139, 92, 46, 0.2)' : 'rgba(139, 92, 46, 0.15)'),
                color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 83, 9)',
                border: `1px solid ${isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(180, 83, 9, 0.3)'}`
              }}
            >
              <FaPlus size={12} />
              Add Entry
            </button>
            <button
              onClick={handleSaveJournal}
              className="px-3 py-2 rounded-lg font-sans text-sm font-semibold transition-all duration-200"
              style={{
                background: isDark ? 'rgba(139, 92, 46, 0.2)' : 'rgba(139, 92, 46, 0.15)',
                color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 83, 9)',
                border: `1px solid ${isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(180, 83, 9, 0.3)'}`
              }}
            >
              <FaDownload size={12} />
            </button>
          </div>
        </div>

        {/* Add Entry Section */}
        {isAddingEntry && (
          <div
            className="flex-shrink-0 px-6 py-4 border-b animate-fade-in"
            style={{
              borderColor: isDark ? 'rgba(139, 92, 46, 0.3)' : 'rgba(139, 92, 46, 0.2)',
              background: isDark ? 'rgba(251, 191, 36, 0.05)' : 'rgba(251, 191, 36, 0.08)'
            }}
          >
            <textarea
              value={customEntry}
              onChange={(e) => setCustomEntry(e.target.value)}
              onKeyDown={(e) => {
                // Command+Enter (Mac) or Ctrl+Enter (Windows) to submit
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmitEntry();
                }
              }}
              placeholder="Write your journal entry here... (⌘+Enter to save)"
              className="w-full p-3 rounded-lg font-serif text-sm leading-relaxed resize-none focus:outline-none focus:ring-2"
              style={{
                background: isDark ? 'rgba(20, 15, 10, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                color: isDark ? 'rgb(245, 235, 215)' : 'rgb(60, 40, 20)',
                border: `1px solid ${isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(180, 83, 9, 0.2)'}`,
                minHeight: '100px'
              }}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSubmitEntry}
                disabled={!customEntry.trim()}
                className="flex-1 px-4 py-2 rounded-lg font-sans text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)',
                  color: isDark ? 'rgb(74, 222, 128)' : 'rgb(22, 163, 74)',
                  border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.25)'}`
                }}
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setIsAddingEntry(false);
                  setCustomEntry('');
                }}
                className="px-4 py-2 rounded-lg font-sans text-sm font-semibold transition-all duration-200"
                style={{
                  background: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                  color: isDark ? 'rgb(248, 113, 113)' : 'rgb(220, 38, 38)',
                  border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Journal Entries */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {journal && journal.length > 0 ? (
            <div className="space-y-4">
              {[...journal].reverse().map((entry, reverseIndex) => {
                const index = journal.length - 1 - reverseIndex; // Original index
                const isExpanded = expandedEntries.has(index);
                const isAI = entry.type === 'ai';
                const isHuman = entry.type === 'human';
                const needsExpansion = isAI && entry.content.split('\n').length > 2;

                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg transition-all duration-200"
                    style={{
                      background: isAI
                        ? (isDark ? 'rgba(168, 85, 247, 0.08)' : 'rgba(168, 85, 247, 0.05)')
                        : isHuman
                        ? (isDark ? 'rgba(251, 191, 36, 0.08)' : 'rgba(251, 191, 36, 0.05)')
                        : (isDark ? 'rgba(139, 92, 46, 0.08)' : 'rgba(139, 92, 46, 0.05)'),
                      border: `1px solid ${
                        isAI
                          ? (isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.15)')
                          : isHuman
                          ? (isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)')
                          : (isDark ? 'rgba(139, 92, 46, 0.2)' : 'rgba(139, 92, 46, 0.15)')
                      }`
                    }}
                  >
                    {/* Entry Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {isAI && (
                          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider mb-2"
                            style={{
                              background: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.15)',
                              color: isDark ? 'rgb(196, 181, 253)' : 'rgb(126, 34, 206)'
                            }}
                          >
                            <span>🤖</span>
                            AI Generated
                            {entry.source && <span className="opacity-70">• {entry.source}</span>}
                          </div>
                        )}
                        {isHuman && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider mb-2"
                            style={{
                              background: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)',
                              color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 83, 9)'
                            }}
                          >
                            <span>✍️</span>
                            Personal Note
                          </div>
                        )}
                      </div>
                      {needsExpansion && (
                        <button
                          onClick={() => toggleExpanded(index)}
                          className="ml-2 p-1 rounded transition-colors duration-200"
                          style={{
                            color: isDark ? 'rgb(168, 85, 247)' : 'rgb(126, 34, 206)'
                          }}
                        >
                          {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </button>
                      )}
                    </div>

                    {/* Formatted Date Label */}
                    {entry.metadata && formatEntryDate(entry.metadata) && (
                      <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-3 pb-2 border-b border-amber-200/50 dark:border-amber-800/50">
                        {formatEntryDate(entry.metadata)}
                      </div>
                    )}

                    {/* Entry Content */}
                    <div
                      className={`text-sm leading-relaxed ${
                        isHuman ? 'font-serif' : 'font-sans'
                      }`}
                      style={{
                        color: isDark ? 'rgb(245, 235, 215)' : 'rgb(60, 40, 20)'
                      }}
                    >
                      <ReactMarkdown>
                        {needsExpansion && !isExpanded ? getEntryPreview(entry.content) : entry.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-amber-700 dark:text-amber-400 italic font-serif">
                No entries yet. Begin your journey...
              </p>
            </div>
          )}
        </div>

        {/* Custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${isDark ? 'rgba(40, 30, 20, 0.3)' : 'rgba(245, 235, 215, 0.3)'};
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(180, 83, 9, 0.3)'};
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? 'rgba(251, 191, 36, 0.5)' : 'rgba(180, 83, 9, 0.5)'};
          }
        `}</style>
      </div>
    </div>
  );
};

export default JournalPanelEnhanced;
