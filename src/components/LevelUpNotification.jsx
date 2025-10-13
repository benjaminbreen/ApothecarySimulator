/**
 * Level Up Notification Component
 *
 * Toast notification that appears when player levels up
 * Shows new level, title, and rewards
 *
 * Usage:
 *   <LevelUpNotification
 *     isVisible={showLevelUp}
 *     newLevel={playerLevel}
 *     newTitle={playerTitle}
 *     onClose={() => setShowLevelUp(false)}
 *   />
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LevelUpNotification({
  isVisible,
  newLevel,
  newTitle,
  healthGain = 10,
  energyGain = 5,
  skillPointGain = 1,
  onClose,
  autoDismissDelay = 5000 // Auto-dismiss after 5 seconds
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
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-auto"
          style={{
            maxWidth: '500px',
            width: '90%'
          }}
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl border-2"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.98) 0%, rgba(124, 58, 237, 0.98) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 60px rgba(139, 92, 246, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            }}
          >
            {/* Header with sparkle effect */}
            <div className="relative px-6 py-4 text-center">
              {/* Sparkle decorations */}
              <div className="absolute top-2 left-4 text-3xl animate-pulse">✨</div>
              <div className="absolute top-2 right-4 text-3xl animate-pulse" style={{ animationDelay: '0.3s' }}>✨</div>

              <div className="text-6xl mb-2">⭐</div>
              <h2 className="text-3xl font-bold text-white mb-1 font-serif tracking-wide">
                LEVEL UP!
              </h2>
              <p className="text-purple-100 text-sm font-semibold uppercase tracking-widest">
                Experience Gained
              </p>
            </div>

            {/* Level display */}
            <div className="px-6 py-4 bg-black/20">
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white font-mono">{newLevel - 1}</div>
                  <div className="text-xs text-purple-200 uppercase">Previous</div>
                </div>

                <div className="text-3xl text-white">→</div>

                <div className="text-center">
                  <div className="text-5xl font-bold text-yellow-300 font-mono animate-pulse">
                    {newLevel}
                  </div>
                  <div className="text-xs text-purple-200 uppercase">Current</div>
                </div>
              </div>

              {/* New Title */}
              <div className="text-center py-3 px-4 rounded-xl bg-white/10 backdrop-blur-sm mb-4">
                <div className="text-xs text-purple-200 mb-1 uppercase tracking-wider">New Title</div>
                <div className="text-xl font-bold text-yellow-300 font-serif italic">
                  {newTitle}
                </div>
              </div>

              {/* Rewards */}
              <div className="grid grid-cols-3 gap-2">
                {/* Health Gain */}
                <div className="text-center py-2 px-2 rounded-lg bg-white/10">
                  <div className="text-2xl mb-1">❤️</div>
                  <div className="text-lg font-bold text-white">+{healthGain}</div>
                  <div className="text-xs text-purple-200">Health</div>
                </div>

                {/* Energy Gain */}
                <div className="text-center py-2 px-2 rounded-lg bg-white/10">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-lg font-bold text-white">+{energyGain}</div>
                  <div className="text-xs text-purple-200">Energy</div>
                </div>

                {/* Skill Point */}
                <div className="text-center py-2 px-2 rounded-lg bg-white/10">
                  <div className="text-2xl mb-1">🎓</div>
                  <div className="text-lg font-bold text-white">+{skillPointGain}</div>
                  <div className="text-xs text-purple-200">Skill Point</div>
                </div>
              </div>
            </div>

            {/* Special message for Level 5 */}
            {newLevel === 5 && (
              <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-center">
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  🌟 PROFESSION CHOICE AVAILABLE 🌟
                </div>
                <p className="text-sm text-purple-800 font-semibold">
                  You can now choose your specialization!
                </p>
              </div>
            )}

            {/* Close button */}
            <div className="px-6 py-3 bg-black/20 flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
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
