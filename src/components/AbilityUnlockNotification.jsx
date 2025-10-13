/**
 * Ability Unlock Notification
 *
 * Toast notification that appears when a profession ability unlocks
 * Displays at L15, L20, L25, L30 with ability details
 *
 * Usage:
 *   <AbilityUnlockNotification
 *     isVisible={showAbilityUnlock}
 *     abilityName="Swift Compounds"
 *     abilityDescription="Mix compounds 20% faster"
 *     level={15}
 *     professionIcon="⚗️"
 *     professionColor="#8b5cf6"
 *     onClose={() => setShowAbilityUnlock(false)}
 *   />
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AbilityUnlockNotification({
  isVisible,
  abilityName,
  abilityDescription,
  level,
  professionIcon,
  professionColor = '#8b5cf6',
  onClose,
  autoDismissDelay = 6000 // Auto-dismiss after 6 seconds
}) {
  // Auto-dismiss timer
  useEffect(() => {
    if (isVisible && autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoDismissDelay, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-24 right-6 z-[9999] pointer-events-auto"
          style={{
            maxWidth: '400px',
            width: '90%'
          }}
        >
          <div
            className="rounded-xl overflow-hidden shadow-2xl border-2"
            style={{
              background: `linear-gradient(135deg, ${professionColor}15, ${professionColor}08)`,
              borderColor: professionColor,
              boxShadow: `0 20px 60px ${professionColor}40, 0 0 0 1px ${professionColor}30 inset`
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-3 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${professionColor}95, ${professionColor})`
              }}
            >
              {/* Sparkle effect */}
              <div className="absolute top-1 right-2 text-2xl opacity-70 animate-pulse">✨</div>
              <div className="absolute bottom-1 left-2 text-xl opacity-50 animate-pulse" style={{ animationDelay: '0.3s' }}>⭐</div>

              <div className="flex items-center gap-3">
                <div className="text-4xl">{professionIcon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white font-serif tracking-wide">
                    New Ability Unlocked!
                  </h3>
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                    Level {level} Ability
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              {/* Ability Name */}
              <div
                className="text-center py-2 px-4 rounded-lg mb-3"
                style={{
                  background: `${professionColor}15`,
                  border: `1px solid ${professionColor}30`
                }}
              >
                <div
                  className="text-xl font-bold font-serif"
                  style={{ color: professionColor }}
                >
                  {abilityName}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-ink-700 leading-relaxed text-center mb-4">
                {abilityDescription}
              </p>

              {/* Status Badge */}
              <div className="flex items-center justify-center gap-2">
                <div
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: `linear-gradient(135deg, ${professionColor}, ${professionColor}dd)`,
                    color: 'white',
                    boxShadow: `0 4px 12px ${professionColor}40`
                  }}
                >
                  ✓ Active Now
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="px-5 py-3 border-t flex justify-center" style={{ borderColor: `${professionColor}20` }}>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: `${professionColor}20`,
                  color: professionColor,
                  border: `1px solid ${professionColor}30`
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
