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
  const isDark = document.documentElement.classList.contains('dark');

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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-20 z-[9999] pointer-events-auto"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '500px',
            width: '90%'
          }}
        >
          <div
            className="rounded-xl overflow-hidden shadow-2xl border-2"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))'
                : 'linear-gradient(135deg, rgba(252, 250, 247, 0.98), rgba(245, 238, 223, 0.98))',
              borderColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(139, 92, 46, 0.2)',
              boxShadow: isDark
                ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
                : '0 20px 60px rgba(92, 74, 58, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}
          >
            {/* Header */}
            <div
              className="relative px-6 py-4 text-center border-b"
              style={{
                background: isDark
                  ? 'linear-gradient(to bottom, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))'
                  : 'linear-gradient(to bottom, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.05))',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'
              }}
            >
              <div className="text-5xl mb-2">⭐</div>
              <h2
                className="text-3xl font-bold mb-1 font-serif tracking-wide"
                style={{
                  color: isDark ? '#fbbf24' : '#3d2f24'
                }}
              >
                LEVEL UP!
              </h2>
              <p
                className="text-sm font-semibold uppercase tracking-widest"
                style={{
                  color: isDark ? '#94a3b8' : '#8b7a6a'
                }}
              >
                Experience Gained
              </p>
            </div>

            {/* Level display */}
            <div
              className="px-6 py-4"
              style={{
                background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)'
              }}
            >
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="text-center">
                  <div
                    className="text-4xl font-bold font-mono"
                    style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
                  >
                    {newLevel - 1}
                  </div>
                  <div
                    className="text-xs uppercase"
                    style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                  >
                    Previous
                  </div>
                </div>

                <div
                  className="text-3xl"
                  style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                >
                  →
                </div>

                <div className="text-center">
                  <div
                    className="text-5xl font-bold font-mono"
                    style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                  >
                    {newLevel}
                  </div>
                  <div
                    className="text-xs uppercase"
                    style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                  >
                    Current
                  </div>
                </div>
              </div>

              {/* New Title */}
              <div
                className="text-center py-3 px-4 rounded-xl mb-4"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.6), rgba(30, 41, 59, 0.5))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))',
                  border: isDark ? '1px solid rgba(71, 85, 105, 0.4)' : '1px solid rgba(209, 213, 219, 0.3)',
                  boxShadow: isDark
                    ? '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(251, 191, 36, 0.05)'
                    : '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                }}
              >
                <div
                  className="text-xs mb-1 uppercase tracking-wider"
                  style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                >
                  New Title
                </div>
                <div
                  className="text-xl font-bold font-serif italic"
                  style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                >
                  {newTitle}
                </div>
              </div>

              {/* Rewards */}
              <div className="grid grid-cols-3 gap-2">
                {/* Health Gain */}
                <div
                  className="text-center py-2 px-2 rounded-lg"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  <div className="text-2xl mb-1">❤️</div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                  >
                    +{healthGain}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                  >
                    Health
                  </div>
                </div>

                {/* Energy Gain */}
                <div
                  className="text-center py-2 px-2 rounded-lg"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  <div className="text-2xl mb-1">⚡</div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                  >
                    +{energyGain}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                  >
                    Energy
                  </div>
                </div>

                {/* Skill Point */}
                <div
                  className="text-center py-2 px-2 rounded-lg"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  <div className="text-2xl mb-1">🎓</div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                  >
                    +{skillPointGain}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: isDark ? '#94a3b8' : '#8b7a6a' }}
                  >
                    Skill Point
                  </div>
                </div>
              </div>
            </div>

            {/* Special message for Level 5 */}
            {newLevel === 5 && (
              <div
                className="px-6 py-4 text-center border-2"
                style={{
                  background: isDark
                    ? 'linear-gradient(to right, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))'
                    : 'linear-gradient(to right, rgba(252, 211, 77, 0.2), rgba(251, 191, 36, 0.15))',
                  borderColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.4)'
                }}
              >
                <div
                  className="text-xl font-bold mb-1"
                  style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                >
                  🌟 PROFESSION CHOICE AVAILABLE 🌟
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: isDark ? '#cbd5e1' : '#78716c' }}
                >
                  You can now choose your specialization!
                </p>
              </div>
            )}

            {/* Close button */}
            <div
              className="px-6 py-3 flex justify-center"
              style={{
                background: isDark
                  ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))'
                  : 'linear-gradient(to bottom, rgba(245, 238, 223, 0.5), rgba(250, 248, 243, 0.3))',
                borderTop: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
              }}
            >
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: isDark
                    ? 'linear-gradient(to right, #10b981, #059669)'
                    : 'linear-gradient(to right, #059669, #047857)',
                  color: '#ffffff',
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
