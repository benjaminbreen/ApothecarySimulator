/**
 * GameOverModal Component
 *
 * Displayed when Maria's health reaches 0.
 * Shows cause of death and allows restart.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameOverModal({ isOpen, causeOfDeath, onRestart, onMainMenu }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Dark backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
      >
        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
            delay: 0.2
          }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border-2 border-red-900/50"
        >
          {/* Decorative top border */}
          <div className="h-2 bg-gradient-to-r from-red-900 via-red-700 to-red-900"></div>

          {/* Content */}
          <div className="p-12 text-center space-y-8">
            {/* Skull icon with pulse animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                damping: 10,
                stiffness: 200,
                delay: 0.5
              }}
              className="flex justify-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-8xl filter drop-shadow-2xl"
              >
                💀
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <h2 className="font-cinzel font-bold text-5xl text-red-500 tracking-wide drop-shadow-lg">
                Game Over
              </h2>
              <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
              <p className="font-cinzel text-2xl text-gray-300 italic">
                Maria de Lima has perished
              </p>
            </motion.div>

            {/* Cause of death */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-red-900/30"
            >
              <p className="font-crimson text-lg text-gray-200 leading-relaxed">
                {causeOfDeath || 'Her health was depleted, and she succumbed to her injuries.'}
              </p>
            </motion.div>

            {/* Historical quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="space-y-2"
            >
              <p className="font-crimson text-sm text-gray-400 italic">
                "In this uncertain world, death comes swiftly to the unwary."
              </p>
              <p className="font-crimson text-xs text-gray-500">
                — Colonial Mexico, 1680
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="flex gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRestart}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-cinzel font-bold text-lg rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl border border-red-600"
              >
                Start New Game
              </motion.button>

              {onMainMenu && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMainMenu}
                  className="flex-1 py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white font-cinzel font-bold text-lg rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl border border-slate-600"
                >
                  Main Menu
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
