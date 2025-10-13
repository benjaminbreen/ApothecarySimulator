import React from 'react';

const StudyTab = ({
  discoveredBooks = [],
  onBookClick = null,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="h-full flex flex-col p-4 animate-fade-in bg-gradient-to-br from-parchment-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-ink-700 dark:text-amber-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="font-serif text-base font-bold text-ink-900 dark:text-amber-400 uppercase tracking-wide transition-colors duration-300">
          Your Library
        </h3>
      </div>

      {/* Books List */}
      {discoveredBooks.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {discoveredBooks.map((book, idx) => (
            <BookCard
              key={`${book.name}-${idx}`}
              book={book}
              onClick={onBookClick}
              isDark={isDark}
              index={idx}
            />
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-parchment-200 to-parchment-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-elevation-2 dark:shadow-dark-elevation-2 mb-3 transition-colors duration-300">
            <svg className="w-8 h-8 text-ink-400 dark:text-parchment-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-sm text-ink-500 dark:text-parchment-300 font-sans uppercase tracking-wide mb-1 transition-colors duration-300">
            Your Library is Empty
          </p>
          <p className="text-xs text-ink-400 dark:text-parchment-400 font-sans transition-colors duration-300">
            Books and texts you encounter will appear here for study
          </p>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(209, 213, 219, 0.2)'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(156, 163, 175, 0.5)'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? 'rgba(71, 85, 105, 0.7)' : 'rgba(107, 114, 128, 0.7)'};
        }
      `}</style>
    </div>
  );
};

// BookCard Component
const BookCard = ({ book, onClick, isDark, index }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(book);
    }
  };

  // Animation delay based on index
  const animationDelay = `${index * 50}ms`;

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group animate-fade-in"
      style={{
        background: isDark
          ? 'rgba(30, 41, 59, 0.6)'
          : 'rgba(255, 255, 255, 0.6)',
        border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(209, 213, 219, 0.5)'}`,
        animationDelay,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isDark ? '#f59e0b' : '#10b981';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(209, 213, 219, 0.5)';
      }}
    >
      <div className="flex items-start gap-3">
        {/* Book Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gradient-to-br from-parchment-200 to-parchment-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110">
          <svg className="w-5 h-5 text-ink-700 dark:text-amber-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="font-serif text-sm font-bold text-ink-900 dark:text-parchment-100 mb-0.5 line-clamp-2 transition-colors duration-300">
            {book.name}
          </h4>

          {/* Citation/Author */}
          {book.citation && (
            <p className="font-serif text-xs italic text-ink-600 dark:text-parchment-300 mb-1 transition-colors duration-300">
              {book.citation}
            </p>
          )}

          {/* Type Badge */}
          {book.type && (
            <span className="inline-block text-[10px] font-sans font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded transition-colors duration-300"
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                color: isDark ? '#93c5fd' : '#2563eb',
              }}
            >
              {book.type.replace('_', ' ')}
            </span>
          )}

          {/* PDF Indicator */}
          {book.pdf && (
            <div className="flex items-center gap-1 mt-1.5">
              <svg className="w-3 h-3 text-ink-500 dark:text-parchment-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-sans text-ink-500 dark:text-parchment-400 transition-colors duration-300">
                Click to view document
              </span>
            </div>
          )}
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg className="w-4 h-4 text-ink-600 dark:text-parchment-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default StudyTab;
