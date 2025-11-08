import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * JourneyTransitionScreen - Full-screen transition showing the journey portion
 * of a long-distance travel narrative with dramatic presentation.
 *
 * @param {boolean} isOpen - Whether the screen is visible
 * @param {string} journeyText - Journey narrative section (markdown)
 * @param {string} horizonImage - Path to horizon background image
 * @param {string} modeImage - Path to travel mode image
 * @param {Function} onSeeArrival - Callback when user clicks "See Arrival"
 */
export default function JourneyTransitionScreen({
  isOpen,
  journeyText,
  horizonImage,
  modeImage,
  onSeeArrival
}) {
  const [fadeIn, setFadeIn] = useState(false);

  // Trigger fade-in animation after mount
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => setFadeIn(true), 50);
      return () => clearTimeout(timer);
    } else {
      setFadeIn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[15000] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background horizon */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${horizonImage})` }}
      />

      {/* Content container */}
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-parchment-50/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-amber-600/30 dark:border-amber-500/20 mx-4 transition-all duration-700 ${
          fadeIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Travel mode image */}
        <div className="w-full">
          <img
            src={modeImage}
            alt="Journey"
            className="w-full rounded-t-3xl object-cover max-h-[280px]"
          />
        </div>

        {/* Journey narrative */}
        <div className="p-8 md:p-10">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="text-[20px] leading-relaxed text-ink-800 dark:text-parchment-100 font-serif"
            >
              {journeyText}
            </ReactMarkdown>
          </div>

          {/* See Arrival button - styled to match travel modal */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={onSeeArrival}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-base font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              See Arrival →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
