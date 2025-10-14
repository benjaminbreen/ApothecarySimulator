/**
 * XPGainNotification Component
 *
 * Beautiful particle animation and message display for XP gains
 * Shows when player gains experience
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Color schemes for different XP categories
const COLOR_SCHEMES = {
  gold: {
    particles: 'from-yellow-400 to-amber-500',
    shadow: 'rgba(251, 191, 36, 0.8)',
    background: 'from-amber-500/90 to-yellow-500/90',
    icon: '💰'
  },
  green: {
    particles: 'from-emerald-400 to-green-500',
    shadow: 'rgba(16, 185, 129, 0.8)',
    background: 'from-emerald-500/90 to-green-500/90',
    icon: '🌿'
  },
  purple: {
    particles: 'from-purple-400 to-violet-500',
    shadow: 'rgba(168, 85, 247, 0.8)',
    background: 'from-purple-500/90 to-violet-500/90',
    icon: '⚕️'
  },
  blue: {
    particles: 'from-blue-400 to-cyan-500',
    shadow: 'rgba(59, 130, 246, 0.8)',
    background: 'from-blue-500/90 to-cyan-500/90',
    icon: '✨'
  }
};

export default function XPGainNotification({ xpGain, onComplete }) {
  const [particles, setParticles] = useState([]);

  // Get color scheme based on category (default to gold)
  const category = xpGain?.category || 'gold';
  const colors = COLOR_SCHEMES[category] || COLOR_SCHEMES.gold;

  useEffect(() => {
    if (!xpGain) return;

    // Generate 8-12 particles with random positions and velocities
    const particleCount = Math.floor(Math.random() * 5) + 8;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50, // -50 to 50
      y: -20 - Math.random() * 30, // -20 to -50
      delay: Math.random() * 0.2,
      duration: 0.8 + Math.random() * 0.4,
      size: 3 + Math.random() * 4
    }));
    setParticles(newParticles);

    // Clear after animation
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [xpGain, onComplete]);

  if (!xpGain) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute bottom-0 left-1/2"
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1
            }}
            animate={{
              x: particle.x,
              y: particle.y,
              opacity: 0,
              scale: 0
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'easeOut'
            }}
          >
            <div
              className={`rounded-full bg-gradient-to-br ${colors.particles}`}
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                boxShadow: `0 0 10px ${colors.shadow}`
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* XP Gain Message */}
      <AnimatePresence>
        <motion.div
          className="absolute left-0 right-0 -bottom-16 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className={`bg-gradient-to-r ${colors.background} text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{colors.icon}</span>
              <div className="text-xs font-sans tracking-wide">
                <span className="font-semibold">+{xpGain.amount} XP</span>
                {xpGain.reason && (
                  <span className="opacity-90 ml-1">for {xpGain.reason}</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
