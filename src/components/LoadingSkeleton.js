import React from 'react';

export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gradient-to-r from-ink-200 via-ink-100 to-ink-200 rounded animate-pulse"
          style={{
            width: i === lines - 1 ? '70%' : '100%',
            animationDelay: `${i * 0.1}s`
          }}
        ></div>
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="h-6 bg-gradient-to-r from-ink-200 via-ink-100 to-ink-200 rounded w-1/3 mb-4"></div>
        <SkeletonText lines={3} />
      </div>
    </div>
  );
};

export const SkeletonAvatar = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-r from-ink-200 via-ink-100 to-ink-200 animate-pulse`}></div>
  );
};

export const SkeletonButton = ({ className = '' }) => {
  return (
    <div className={`h-10 bg-gradient-to-r from-ink-200 via-ink-100 to-ink-200 rounded-lg animate-pulse ${className}`}></div>
  );
};

export const NarrativeLoading = () => {
  return (
    <div className="flex items-start gap-4 animate-fade-in">
      <SkeletonAvatar size="sm" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gradient-to-r from-ink-200 via-ink-100 to-ink-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gradient-to-r from-ink-200 via-ink-100 to-ink-200 rounded w-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="h-4 bg-gradient-to-r from-ink-200 via-ink-100 to-ink-200 rounded w-5/6 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default {
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  NarrativeLoading
};
