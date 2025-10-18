import React from 'react';
import PropTypes from 'prop-types';

const CompoundResultCard = ({ compound }) => {
  const isSuccess = compound.name !== 'Unusable Sludge';

  // Rarity colors and styling
  const rarityStyles = {
    common: {
      bg: 'from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700',
      border: 'border-slate-700 dark:border-slate-800',
      glow: 'rgba(100, 116, 139, 0.3)',
      text: 'Common'
    },
    scarce: {
      bg: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
      border: 'border-blue-700 dark:border-blue-800',
      glow: 'rgba(59, 130, 246, 0.4)',
      text: 'Scarce'
    },
    rare: {
      bg: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
      border: 'border-purple-700 dark:border-purple-800',
      glow: 'rgba(168, 85, 247, 0.5)',
      text: 'Rare'
    },
    legendary: {
      bg: 'from-amber-400 via-orange-500 to-amber-400 dark:from-amber-500 dark:via-orange-600 dark:to-amber-500',
      border: 'border-amber-600 dark:border-amber-700',
      glow: 'rgba(251, 146, 60, 0.6)',
      text: 'Legendary'
    }
  };

  const rarity = rarityStyles[compound.rarity] || rarityStyles.common;

  return (
    <div className={`
      relative rounded-3xl p-8 mb-6 border-4 border-double shadow-2xl overflow-hidden
      ${isSuccess
        ? 'bg-gradient-to-br from-botanical-50 via-emerald-50 to-botanical-100 dark:from-emerald-950/50 dark:via-emerald-900/40 dark:to-emerald-950/50 border-botanical-400 dark:border-emerald-600/50'
        : 'bg-gradient-to-br from-danger-50 via-red-50 to-danger-100 dark:from-red-950/50 dark:via-red-900/40 dark:to-red-950/50 border-danger-400 dark:border-red-600/50'
      }
    `}>

      {/* Decorative corner elements */}
      <div className="absolute top-2 left-2 w-16 h-16 border-l-2 border-t-2 border-amber-600/40 dark:border-amber-400/30 rounded-tl-2xl"></div>
      <div className="absolute top-2 right-2 w-16 h-16 border-r-2 border-t-2 border-amber-600/40 dark:border-amber-400/30 rounded-tr-2xl"></div>
      <div className="absolute bottom-2 left-2 w-16 h-16 border-l-2 border-b-2 border-amber-600/40 dark:border-amber-400/30 rounded-bl-2xl"></div>
      <div className="absolute bottom-2 right-2 w-16 h-16 border-r-2 border-b-2 border-amber-600/40 dark:border-amber-400/30 rounded-br-2xl"></div>

      {/* Success/Failure Banner */}
      <div className={`
        absolute -top-1 left-1/2 transform -translate-x-1/2 px-8 py-2 rounded-b-xl border-2 border-t-0 font-display font-bold text-sm tracking-wider shadow-lg
        ${isSuccess
          ? 'bg-gradient-to-b from-botanical-600 to-botanical-700 dark:from-emerald-700 dark:to-emerald-800 text-white border-botanical-800 dark:border-emerald-900'
          : 'bg-gradient-to-b from-danger-600 to-danger-700 dark:from-red-700 dark:to-red-800 text-white border-danger-800 dark:border-red-900'
        }
      `}>
        {isSuccess ? '✨ SUCCESS' : '⚠️ FAILED EXPERIMENT'}
      </div>

      {/* Rarity Badge - Only show for successful compounds */}
      {isSuccess && compound.rarity && (
        <div
          className={`
            absolute -top-1 right-8 px-6 py-2 rounded-b-xl border-2 border-t-0 font-display font-bold text-sm tracking-widest shadow-lg
            bg-gradient-to-b ${rarity.bg} text-white ${rarity.border} uppercase animate-pulse
          `}
          style={{
            boxShadow: `0 4px 12px ${rarity.glow}, 0 0 20px ${rarity.glow}`
          }}
        >
          {compound.rarity === 'legendary' && '⭐ '}
          {rarity.text}
          {compound.rarity === 'legendary' && ' ⭐'}
        </div>
      )}

      <div className="flex items-start gap-8 mt-4">
        {/* Compound Emoji */}
        <div className={`
          flex-shrink-0 relative
          ${isSuccess ? 'animate-float' : 'animate-pulse'}
        `}>
          <div
            className="text-9xl filter drop-shadow-2xl"
            style={{
              textShadow: isSuccess
                ? '0 0 30px rgba(34, 197, 94, 0.6), 0 0 60px rgba(34, 197, 94, 0.4)'
                : '0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.4)'
            }}
          >
            {compound.emoji}
          </div>
        </div>

        {/* Compound Details */}
        <div className="flex-1">
          {/* Name */}
          <h3 className="font-display text-4xl font-bold text-ink-900 dark:text-amber-50 mb-4 drop-shadow-md">
            {compound.name}
          </h3>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Latin Name */}
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-ink-200 dark:border-slate-600 backdrop-blur-sm">
              <span className="block text-xs uppercase tracking-wider text-ink-500 dark:text-amber-300/60 font-serif font-semibold mb-1">
                Nomen Latinum
              </span>
              <p className="font-serif italic text-lg text-ink-900 dark:text-amber-100">
                {compound.latinName || 'N/A'}
              </p>
            </div>

            {/* Spanish Name */}
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-ink-200 dark:border-slate-600 backdrop-blur-sm">
              <span className="block text-xs uppercase tracking-wider text-ink-500 dark:text-amber-300/60 font-serif font-semibold mb-1">
                Nombre Español
              </span>
              <p className="font-serif italic text-lg text-ink-900 dark:text-amber-100">
                {compound.spanishName || 'N/A'}
              </p>
            </div>

            {/* Humoral Qualities */}
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-ink-200 dark:border-slate-600 backdrop-blur-sm">
              <span className="block text-xs uppercase tracking-wider text-ink-500 dark:text-amber-300/60 font-serif font-semibold mb-1">
                Humoral Qualities
              </span>
              <p className="font-display text-lg font-bold text-botanical-700 dark:text-emerald-400">
                {compound.humoralQualities || 'N/A'}
              </p>
            </div>

            {/* Value */}
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-ink-200 dark:border-slate-600 backdrop-blur-sm">
              <span className="block text-xs uppercase tracking-wider text-ink-500 dark:text-amber-300/60 font-serif font-semibold mb-1">
                Market Value
              </span>
              <p className="font-display text-2xl font-bold text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                <span>💰</span>
                {compound.price} reales
              </p>
            </div>
          </div>

          {/* Medicinal Effects */}
          <div className="bg-gradient-to-r from-potion-50/80 via-potion-100/60 to-potion-50/80 dark:from-purple-900/20 dark:via-purple-800/20 dark:to-purple-900/20 rounded-xl p-4 border border-potion-300 dark:border-purple-700/30 mb-4">
            <span className="block text-xs uppercase tracking-wider text-potion-700 dark:text-purple-300 font-serif font-semibold mb-2">
              Medicinal Effects
            </span>
            <p className="text-base text-ink-800 dark:text-amber-100 font-serif leading-relaxed">
              {compound.medicinalEffects || 'N/A'}
            </p>
          </div>

          {/* Description */}
          <div className="bg-white/60 dark:bg-slate-900/40 rounded-xl p-5 border-2 border-dashed border-ink-300 dark:border-slate-600 mb-4">
            <p className="text-lg text-ink-700 dark:text-amber-200 font-serif italic leading-relaxed">
              "{compound.description}"
            </p>
          </div>

          {/* Citation & Historical Accuracy */}
          <div className="border-t-2 border-ink-200 dark:border-slate-700 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="block text-xs uppercase tracking-wider text-ink-500 dark:text-amber-400/60 font-serif font-semibold mb-2">
                  Historical Source
                </span>
                <p className="text-sm text-ink-600 dark:text-amber-300/80 font-serif italic leading-relaxed">
                  📜 {compound.citation || 'Unknown source'}
                </p>
              </div>

              {/* Historical Accuracy Score */}
              {isSuccess && compound.historicalAccuracyScore && (
                <div className="flex-shrink-0 text-center">
                  <span className="block text-xs uppercase tracking-wider text-ink-500 dark:text-amber-400/60 font-serif font-semibold mb-1">
                    Authenticity
                  </span>
                  <div className="relative">
                    <div className="text-2xl font-bold font-display" style={{
                      color: compound.historicalAccuracyScore >= 86 ? '#f59e0b' :
                             compound.historicalAccuracyScore >= 61 ? '#a855f7' :
                             compound.historicalAccuracyScore >= 31 ? '#3b82f6' : '#64748b'
                    }}>
                      {compound.historicalAccuracyScore}
                      <span className="text-sm">/100</span>
                    </div>
                    <p className="text-xs text-ink-500 dark:text-amber-400/70 mt-1 font-sans">
                      {compound.historicalAccuracyScore >= 86 ? 'Legendary' :
                       compound.historicalAccuracyScore >= 61 ? 'Sophisticated' :
                       compound.historicalAccuracyScore >= 31 ? 'Well-documented' : 'Common'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Historical Accuracy Rationale */}
            {isSuccess && compound.historicalAccuracyRationale && (
              <div className="mt-3 pt-3 border-t border-ink-200/50 dark:border-slate-700/50">
                <div className="flex items-start gap-2">
                  <span className="text-ink-400 dark:text-amber-400/50 text-sm flex-shrink-0">💡</span>
                  <p className="text-xs text-ink-600 dark:text-amber-300/70 font-serif italic leading-relaxed">
                    {compound.historicalAccuracyRationale}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {isSuccess && (
        <div className="mt-6 bg-gradient-to-r from-botanical-100 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-2 border-botanical-400 dark:border-emerald-600/50 rounded-xl p-4 text-center">
          <p className="text-lg text-botanical-900 dark:text-emerald-200 font-serif font-semibold">
            ✨ Successfully created! This compound has been added to your inventory.
          </p>
        </div>
      )}

      {/* Failure Message */}
      {!isSuccess && (
        <div className="mt-6 bg-gradient-to-r from-danger-100 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-danger-400 dark:border-red-600/50 rounded-xl p-4 text-center">
          <p className="text-lg text-danger-900 dark:text-red-200 font-serif font-semibold">
            ☠️ The transmutation failed. Better study the alchemical principles more carefully.
          </p>
        </div>
      )}
    </div>
  );
};

CompoundResultCard.propTypes = {
  compound: PropTypes.shape({
    name: PropTypes.string.isRequired,
    latinName: PropTypes.string,
    spanishName: PropTypes.string,
    emoji: PropTypes.string.isRequired,
    price: PropTypes.number,
    humoralQualities: PropTypes.string,
    medicinalEffects: PropTypes.string,
    description: PropTypes.string,
    citation: PropTypes.string,
    rarity: PropTypes.oneOf(['common', 'scarce', 'rare', 'legendary']),
    historicalAccuracyScore: PropTypes.number,
    historicalAccuracyRationale: PropTypes.string
  }).isRequired
};

export default CompoundResultCard;
