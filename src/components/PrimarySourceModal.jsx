/**
 * PrimarySourceModal - Unified viewer for primary source documents
 *
 * Displays primary sources with original text, translation, PDFs, images,
 * historical context, and metadata in an elegant modal.
 *
 * Supports both single-source and multi-source navigation modes.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FaTimes, FaBook, FaScroll, FaInfoCircle, FaExternalLinkAlt,
  FaChevronLeft, FaChevronRight, FaCopy, FaCheck, FaFilePdf, FaImage,
  FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { SOURCE_CATEGORIES } from '../core/data/primarySources/index';

/**
 * PrimarySourceModal - Unified modal component
 */
export default function PrimarySourceModal({
  isOpen,
  onClose,
  source,
  sources = [],
  initialIndex = 0,
  relatedSources = [],
  onNavigateToSource
}) {
  const modalRef = useRef(null);

  // Normalize to sources array for unified handling
  const allSources = useMemo(() => {
    if (sources && sources.length > 0) return sources;
    if (source) return [source];
    return [];
  }, [source, sources]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState('text');
  const [showOriginal, setShowOriginal] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const currentSource = allSources[currentIndex] || null;

  const contentType = useMemo(() => {
    if (!currentSource) return { hasText: false, hasTranslation: false, hasPdf: false, hasImages: false };
    return {
      hasText: !!(currentSource.text || currentSource.translation),
      hasTranslation: !!(currentSource.text && currentSource.translation),
      hasPdf: !!currentSource.pdf,
      hasImages: !!(currentSource.images && currentSource.images.length > 0)
    };
  }, [currentSource]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setCopiedCitation(false);
    setImageZoom(false);
  }, [allSources, initialIndex]);

  useEffect(() => {
    if (currentSource) {
      if (contentType.hasText) {
        setActiveTab('text');
      } else if (contentType.hasPdf) {
        setActiveTab('pdf');
      } else if (contentType.hasImages) {
        setActiveTab('images');
      } else {
        setActiveTab('context');
      }
      setShowOriginal(false);
    }
  }, [currentSource, contentType]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        // If there are related sources and onNavigateToSource is available,
        // navigate to the first related source
        if (relatedSources && relatedSources.length > 0 && onNavigateToSource) {
          onNavigateToSource(relatedSources[0]);
        } else if (allSources.length > 1) {
          // Fallback to cycling through multi-source navigation
          setCurrentIndex(prev => (prev > 0 ? prev - 1 : allSources.length - 1));
        }
      } else if (e.key === 'ArrowRight') {
        // If there are related sources and onNavigateToSource is available,
        // navigate to the last related source
        if (relatedSources && relatedSources.length > 0 && onNavigateToSource) {
          onNavigateToSource(relatedSources[relatedSources.length - 1]);
        } else if (allSources.length > 1) {
          // Fallback to cycling through multi-source navigation
          setCurrentIndex(prev => (prev < allSources.length - 1 ? prev + 1 : 0));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, allSources.length, relatedSources, onNavigateToSource]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCopyCitation = useCallback(async () => {
    if (!currentSource) return;

    const citation = `${currentSource.author}, "${currentSource.title}" in ${currentSource.work}${currentSource.location ? `, ${currentSource.location}` : ''}, ${currentSource.year}.`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  }, [currentSource]);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : allSources.length - 1));
    setCopiedCitation(false);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < allSources.length - 1 ? prev + 1 : 0));
    setCopiedCitation(false);
  };

  if (!isOpen || !currentSource) return null;

  const category = SOURCE_CATEGORIES[currentSource.category];
  const displayText = showOriginal && currentSource.text
    ? currentSource.text
    : (currentSource.translation || currentSource.text || 'No text available.');

  // Tab configuration
  const tabs = [
    { id: 'text', icon: FaScroll, label: 'Text', show: contentType.hasText },
    { id: 'pdf', icon: FaFilePdf, label: 'PDF', show: contentType.hasPdf },
    { id: 'images', icon: FaImage, label: 'Images', show: contentType.hasImages },
    { id: 'context', icon: FaInfoCircle, label: 'Context', show: true },
    { id: 'about', icon: FaBook, label: 'About', show: true },
  ].filter(tab => tab.show);

  return createPortal(
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-title"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #1a1f2e 0%, #0f1419 100%)'
            : 'linear-gradient(180deg, #fefdfb 0%, #faf6f0 100%)',
        }}
      >
        {/* Compact Header */}
        <div className="flex-shrink-0 relative">
          {/* Top bar with title and close button */}
          <div className="flex items-start justify-between px-4 pt-3 pb-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Category icon - smaller */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  backgroundColor: (category?.color || '#f59e0b') + '15',
                }}
              >
                {category?.icon || '📚'}
              </div>

              {/* Title and author */}
              <div className="min-w-0 flex-1">
                <h2
                  id="source-title"
                  className="text-base font-semibold text-amber-900 dark:text-amber-100 leading-tight"
                >
                  {currentSource.title}
                </h2>
                <p className="text-sm text-amber-700/70 dark:text-amber-400/70 truncate">
                  {currentSource.author} • <em>{currentSource.work}</em> ({currentSource.year})
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <FaTimes className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            </button>
          </div>

          {/* Metadata row with View Original button */}
          <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
            {/* View Original - beautiful blue button */}
            {currentSource.sourceUrl && (
              <a
                href={currentSource.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                  dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600
                  text-white shadow-sm hover:shadow-md transition-all duration-200
                  border border-blue-400/20"
                title="View original source"
              >
                <FaExternalLinkAlt className="w-3 h-3" />
                View Original
              </a>
            )}

            {/* Verified/Paraphrase indicator */}
            {currentSource.verified !== undefined && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  currentSource.verified
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}
                title={currentSource.verified ? 'Verified primary source' : 'Scholarly paraphrase'}
              >
                {currentSource.verified
                  ? <FaCheckCircle className="w-3.5 h-3.5" />
                  : <FaExclamationTriangle className="w-3.5 h-3.5" />
                }
                <span className="hidden sm:inline text-xs">
                  {currentSource.verified ? 'Verified' : 'Paraphrase'}
                </span>
              </div>
            )}

            {/* Category pill */}
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: (category?.color || '#f59e0b') + '20',
                color: category?.color || '#f59e0b'
              }}
            >
              {category?.name || 'Source'}
            </span>

            {/* Language if not English */}
            {currentSource.language && currentSource.language !== 'English' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {currentSource.language}
              </span>
            )}

            {/* Copy citation - small button */}
            <button
              onClick={handleCopyCitation}
              className={`ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                copiedCitation
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-300'
              }`}
              title="Copy citation"
            >
              {copiedCitation ? <FaCheck className="w-3 h-3" /> : <FaCopy className="w-3 h-3" />}
              <span className="hidden sm:inline">{copiedCitation ? 'Copied!' : 'Cite'}</span>
            </button>
          </div>

          {/* Multi-source navigation */}
          {allSources.length > 1 && (
            <div className="flex items-center justify-center gap-3 px-4 pb-3">
              <button
                onClick={goToPrevious}
                className="p-1.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                aria-label="Previous source"
              >
                <FaChevronLeft className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              </button>

              <div className="flex items-center gap-1.5">
                {allSources.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => { setCurrentIndex(index); setCopiedCitation(false); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-amber-600 dark:bg-amber-400 scale-125'
                        : 'bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700'
                    }`}
                    aria-label={`Source ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="p-1.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                aria-label="Next source"
              >
                <FaChevronRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              </button>
            </div>
          )}

          {/* Tabs - underline style */}
          <div
            className="flex border-b"
            style={{ borderColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(180, 120, 60, 0.15)' }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all relative ${
                    isActive
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-amber-600/60 dark:text-amber-500/60 hover:text-amber-700 dark:hover:text-amber-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-500 dark:bg-amber-400"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Text Tab */}
          {activeTab === 'text' && contentType.hasText && (
            <div className="p-5">
              {/* Language toggle */}
              {contentType.hasTranslation && (
                <div className="flex items-center justify-end gap-2 mb-4">
                  <span className="text-xs text-amber-600/70 dark:text-amber-500/70">
                    {showOriginal ? `Original (${currentSource.language})` : 'English Translation'}
                  </span>
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      showOriginal
                        ? 'bg-amber-500 dark:bg-amber-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-label={showOriginal ? 'Show translation' : 'Show original'}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        showOriginal ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Quote block - cleaner design */}
              <div
                className="relative pl-5 py-1"
                style={{
                  borderLeft: `3px solid ${category?.color || '#d97706'}`,
                }}
              >
                <div
                  className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                    showOriginal ? 'italic font-serif' : ''
                  } ${isDark ? 'text-parchment-200' : 'text-ink-800'}`}
                >
                  {displayText}
                </div>
              </div>

              {/* Citation */}
              <div className="mt-5 text-sm text-amber-600/70 dark:text-amber-400/60 text-right">
                — {currentSource.author}, <em>{currentSource.work}</em>
                {currentSource.location && ` (${currentSource.location}`}
                {currentSource.year && `, ${currentSource.year}`}
                {currentSource.location && ')'}
              </div>

              {/* Translator/Source info */}
              <div className="mt-4 pt-4 border-t border-amber-200/30 dark:border-amber-800/20 space-y-2">
                {currentSource.translator && (
                  <p className="text-xs text-amber-600/70 dark:text-amber-500/70">
                    {currentSource.translator}
                  </p>
                )}
                {currentSource.sourceUrl && (
                  <a
                    href={currentSource.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    <FaExternalLinkAlt className="w-3 h-3" />
                    Read the original source document
                  </a>
                )}
                {!currentSource.sourceUrl && !currentSource.verified && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 italic flex items-center gap-1.5">
                    <FaExclamationTriangle className="w-3 h-3" />
                    Scholarly paraphrase. Original digitized source not yet located.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* PDF Tab */}
          {activeTab === 'pdf' && contentType.hasPdf && (
            <div className="p-5 h-full min-h-[400px]">
              <iframe
                src={`/pdfs/${currentSource.pdf}`}
                title={`PDF: ${currentSource.title}`}
                className="w-full h-full min-h-[400px] rounded-lg border border-amber-200/50 dark:border-slate-700"
              />
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && contentType.hasImages && (
            <div className="p-5">
              <div className="grid gap-4">
                {currentSource.images.map((image, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-lg overflow-hidden border border-amber-200/50 dark:border-slate-700 cursor-pointer transition-transform ${
                      imageZoom ? 'scale-100' : 'hover:scale-[1.01]'
                    }`}
                    onClick={() => setImageZoom(!imageZoom)}
                  >
                    <img
                      src={`/sources/images/${image}`}
                      alt={`${currentSource.title} - Image ${idx + 1}`}
                      className={`w-full object-contain ${imageZoom ? 'max-h-none' : 'max-h-80'}`}
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                      Click to {imageZoom ? 'shrink' : 'expand'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Context Tab */}
          {activeTab === 'context' && (
            <div className="p-5 space-y-5">
              {currentSource.historicalContext && (
                <div>
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Historical Context
                  </h3>
                  <p className="text-sm text-ink-700 dark:text-parchment-300 leading-relaxed">
                    {currentSource.historicalContext}
                  </p>
                </div>
              )}

              {currentSource.modernNote && (
                <div>
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Modern Perspective
                  </h3>
                  <p className="text-sm text-ink-700 dark:text-parchment-300 leading-relaxed">
                    {currentSource.modernNote}
                  </p>
                </div>
              )}

              {currentSource.tags && currentSource.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Topics
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSource.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs rounded-full bg-amber-100/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!currentSource.historicalContext && !currentSource.modernNote && (!currentSource.tags || currentSource.tags.length === 0) && (
                <div className="text-center py-8 text-amber-600/60 dark:text-amber-500/60 italic text-sm">
                  No additional context available for this source.
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Author', value: currentSource.author },
                  { label: 'Work', value: currentSource.work, italic: true },
                  { label: 'Year', value: currentSource.year },
                  { label: 'Location', value: currentSource.location || 'Unknown' },
                  { label: 'Language', value: currentSource.language || 'Unknown' },
                  { label: 'Category', value: `${category?.icon || ''} ${category?.name || 'Source'}` },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/30 dark:bg-slate-800/30">
                    <div className="text-[10px] uppercase tracking-wider text-amber-600/70 dark:text-amber-500/70 mb-0.5">
                      {item.label}
                    </div>
                    <div className={`text-sm text-ink-800 dark:text-parchment-200 ${item.italic ? 'italic' : ''}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {currentSource.sourceUrl && (
                <a
                  href={currentSource.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-4 px-4 py-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/20
                    hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors
                    text-amber-800 dark:text-amber-200 text-sm"
                >
                  <FaExternalLinkAlt className="w-3.5 h-3.5" />
                  View Original Source Online
                </a>
              )}

              {currentSource.linkedEntities && currentSource.linkedEntities.length > 0 && (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wider text-amber-600/70 dark:text-amber-500/70 mb-2">
                    Linked Game Entities
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSource.linkedEntities.map((entity, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs rounded-full bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      >
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Sources - horizontal scrolling cards */}
        {relatedSources && relatedSources.length > 0 && (
          <div
            className="flex-shrink-0 px-5 py-3 border-t"
            style={{ borderColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(180, 120, 60, 0.1)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wider text-amber-600/70 dark:text-amber-500/70">
                Related Sources
              </div>
              {onNavigateToSource && (
                <div className="text-[10px] text-amber-500/50 dark:text-amber-600/50 flex items-center gap-1">
                  <span>←</span>
                  <span>first</span>
                  <span className="mx-1">|</span>
                  <span>last</span>
                  <span>→</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {relatedSources.slice(0, 6).map((related) => (
                <button
                  key={related.id}
                  onClick={() => onNavigateToSource?.(related)}
                  className="flex-shrink-0 px-3 py-2 rounded-lg bg-white/40 dark:bg-slate-800/40
                    hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors
                    text-left min-w-[140px] max-w-[180px] border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                >
                  <div className="text-xs font-medium text-ink-800 dark:text-parchment-200 truncate">
                    {related.title}
                  </div>
                  <div className="text-[10px] text-amber-600/60 dark:text-amber-500/60 truncate mt-0.5">
                    {related.author}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer - minimal */}
        <div
          className="flex-shrink-0 px-5 py-2 text-center"
          style={{
            background: isDark ? 'rgba(15, 23, 42, 0.3)' : 'rgba(254, 252, 247, 0.5)',
          }}
        >
          <p className="text-[10px] text-amber-600/50 dark:text-amber-500/50">
            Historical sources are presented for educational purposes. Interpretations reflect the biases of their time.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
