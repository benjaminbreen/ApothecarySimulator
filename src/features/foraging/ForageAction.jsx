/**
 * ForageAction - Immersive foraging/scrounging interface
 *
 * Allows players to search any location for items, with beautiful animations
 * and contextual flavor text that brings the world to life.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { forage } from '../../core/systems/forageSystem';
import { getLocationForageType } from '../../core/systems/locationType';

export default function ForageAction({
  isOpen,
  onClose,
  currentLocation,
  gameState,
  scenario,
  onForageComplete
}) {
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const scenarioData = {
    lootTables: scenario.foraging?.lootTables || {},
    locationMap: scenario.foraging?.locationMap || {}
  };

  const locationType = getLocationForageType(currentLocation, scenarioData.locationMap);

  const handleSearch = () => {
    setSearching(true);

    // Simulate search time (1.8 seconds)
    setTimeout(() => {
      const forageResult = forage(currentLocation, gameState, scenarioData);
      setResult(forageResult);
      setSearching(false);

      // Delay result reveal for dramatic effect
      setTimeout(() => {
        setShowResult(true);

        // If found item, trigger completion callback
        if (forageResult.foundItem && onForageComplete) {
          onForageComplete(forageResult);
        }
      }, 300);
    }, 1800);
  };

  const handleClose = () => {
    setResult(null);
    setShowResult(false);
    setSearching(false);
    onClose();
  };

  // Determine action verb based on location type
  const getActionVerb = () => {
    if (locationType.category === 'interior') {
      return 'Scrounge';
    }
    return 'Forage';
  };

  // Get rarity color scheme
  const getRarityStyle = (rarity) => {
    switch (rarity) {
      case 'rare':
        return {
          gradient: 'from-amber-400 via-yellow-300 to-amber-400',
          glow: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]',
          badge: 'bg-gradient-to-r from-amber-500 to-yellow-400',
          icon: '✨',
          border: 'border-amber-400'
        };
      case 'uncommon':
        return {
          gradient: 'from-blue-400 via-cyan-300 to-blue-400',
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
          badge: 'bg-gradient-to-r from-blue-500 to-cyan-400',
          icon: '🌟',
          border: 'border-blue-400'
        };
      case 'trash':
        return {
          gradient: 'from-gray-500 via-gray-400 to-gray-500',
          glow: 'shadow-[0_0_10px_rgba(107,114,128,0.3)]',
          badge: 'bg-gradient-to-r from-gray-600 to-gray-500',
          icon: '🗑️',
          border: 'border-gray-400'
        };
      default: // common
        return {
          gradient: 'from-green-400 via-emerald-300 to-green-400',
          glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
          badge: 'bg-gradient-to-r from-green-600 to-emerald-500',
          icon: '🌿',
          border: 'border-green-400'
        };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-parchment-100 to-botanical-50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-botanical-700/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-botanical-800 to-botanical-700 px-6 py-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-10"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-cinzel font-bold text-botanical-50 mb-1">
                  {getActionVerb()} for Items
                </h2>
                <p className="text-sm text-botanical-200/90 font-crimson">
                  {currentLocation}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-botanical-200 hover:text-white transition-colors p-2 hover:bg-black/20 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!searching && !result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Location Description Card */}
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-5 border border-botanical-200/50 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{locationType.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-cinzel font-bold text-botanical-900 text-lg mb-2">
                        {locationType.name}
                      </h3>
                      <p className="text-botanical-700 font-crimson text-sm leading-relaxed mb-3">
                        {locationType.flavorText}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {locationType.tags?.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-botanical-100/80 text-botanical-700 text-xs rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200/50">
                    <div className="text-xs font-crimson text-blue-600 uppercase tracking-wide mb-1">
                      Success Rate
                    </div>
                    <div className="text-2xl font-cinzel font-bold text-blue-900">
                      {Math.round(locationType.successRate * 100)}%
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-4 border border-amber-200/50">
                    <div className="text-xs font-crimson text-amber-600 uppercase tracking-wide mb-1">
                      Energy Cost
                    </div>
                    <div className="text-2xl font-cinzel font-bold text-amber-900">
                      {locationType.energyCost}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4 border border-purple-200/50">
                    <div className="text-xs font-crimson text-purple-600 uppercase tracking-wide mb-1">
                      Time Cost
                    </div>
                    <div className="text-2xl font-cinzel font-bold text-purple-900">
                      {locationType.timeCost}m
                    </div>
                  </div>
                </div>

                {/* Current Energy */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-300/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-crimson text-amber-700 mb-1">Your Current Energy</div>
                      <div className="text-xl font-cinzel font-bold text-amber-900">
                        {gameState.energy} / 100
                      </div>
                    </div>
                    <div className="text-3xl">{gameState.energy < locationType.energyCost ? '⚠️' : '✅'}</div>
                  </div>
                  {gameState.energy < locationType.energyCost && (
                    <div className="mt-3 text-sm font-crimson text-amber-800 bg-amber-100/50 rounded px-3 py-2">
                      ⚠️ Low energy! Consider using <span className="font-bold">#sleep</span> to rest, or <span className="font-bold">#eat</span> for a quick boost.
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <motion.button
                  onClick={handleSearch}
                  disabled={gameState.energy < locationType.energyCost}
                  whileHover={{ scale: gameState.energy >= locationType.energyCost ? 1.02 : 1 }}
                  whileTap={{ scale: gameState.energy >= locationType.energyCost ? 0.98 : 1 }}
                  className={`w-full py-4 px-6 rounded-lg font-cinzel font-bold text-lg transition-all duration-200 ${
                    gameState.energy >= locationType.energyCost
                      ? 'bg-gradient-to-r from-botanical-600 to-botanical-700 hover:from-botanical-700 hover:to-botanical-800 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {gameState.energy >= locationType.energyCost
                    ? `Begin ${getActionVerb()}ing`
                    : 'Insufficient Energy'}
                </motion.button>
              </motion.div>
            )}

            {/* Searching Animation */}
            {searching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="text-7xl mb-6"
                >
                  🔍
                </motion.div>
                <h3 className="text-2xl font-cinzel font-bold text-botanical-800 mb-2">
                  Searching{locationType.category === 'interior' ? ' carefully' : ' thoroughly'}...
                </h3>
                <p className="text-botanical-600 font-crimson text-center max-w-md">
                  Maria {locationType.category === 'interior' ? 'rifles through drawers and searches corners' : 'examines the ground and nearby plants'},
                  looking for anything useful...
                </p>
                <motion.div
                  className="flex gap-2 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-botanical-500 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Result Display */}
            {result && showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="space-y-4"
              >
                {result.foundItem ? (
                  <>
                    {/* Success Result */}
                    <div className={`relative overflow-hidden rounded-xl border-2 ${getRarityStyle(result.rarity).border} ${getRarityStyle(result.rarity).glow} bg-gradient-to-br ${getRarityStyle(result.rarity).gradient} p-6`}>
                      <div className="absolute inset-0 bg-white/30"></div>
                      <div className="relative">
                        {/* Rarity Badge */}
                        {result.rarity !== 'common' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
                            className={`inline-block px-4 py-2 ${getRarityStyle(result.rarity).badge} text-white font-cinzel font-bold rounded-full text-sm mb-4 shadow-lg`}
                          >
                            {result.rarity === 'rare' && '✨ RARE! ✨'}
                            {result.rarity === 'uncommon' && '🌟 Uncommon'}
                            {result.rarity === 'trash' && '🗑️ Trash'}
                          </motion.div>
                        )}

                        {/* Item Info */}
                        <div className="flex items-start gap-4">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                            className="text-6xl"
                          >
                            {getRarityStyle(result.rarity).icon}
                          </motion.div>

                          <div className="flex-1">
                            <motion.h3
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className="text-3xl font-cinzel font-bold text-white drop-shadow-md mb-2"
                            >
                              {result.item.name}
                              {result.quantity > 1 && (
                                <span className="text-2xl ml-2 opacity-90">×{result.quantity}</span>
                              )}
                            </motion.h3>

                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                              className="text-white/90 font-crimson text-lg leading-relaxed mb-3 drop-shadow"
                            >
                              {result.item.message}
                            </motion.p>

                            {result.item.value && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="inline-block bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full"
                              >
                                <span className="text-white font-cinzel font-bold">
                                  Worth {result.item.value} {result.item.value === 1 ? 'real' : 'reales'}
                                </span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resource Summary */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-botanical-200/50">
                      <div className="flex items-center justify-between text-sm font-crimson">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-600">⚡</span>
                          <span className="text-botanical-700">Energy used: <strong>{result.energyCost}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">⏱️</span>
                          <span className="text-botanical-700">Time passed: <strong>{result.timeCost} minutes</strong></span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Nothing Found
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-7xl mb-4"
                    >
                      🤷‍♀️
                    </motion.div>
                    <h3 className="text-2xl font-cinzel font-bold text-botanical-800 mb-2">
                      Nothing Found
                    </h3>
                    <p className="text-botanical-600 font-crimson max-w-md mx-auto mb-6">
                      Despite your careful search, you find nothing of value this time. Perhaps try a different location, or return later.
                    </p>
                    <div className="bg-botanical-50 rounded-lg p-4 border border-botanical-200/50 max-w-md mx-auto">
                      <div className="flex items-center justify-between text-sm font-crimson text-botanical-700">
                        <div>⚡ Energy used: <strong>{result.energyCost}</strong></div>
                        <div>⏱️ Time passed: <strong>{result.timeCost} minutes</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={handleClose}
                  className="w-full py-3 px-6 bg-gradient-to-r from-botanical-600 to-botanical-700 hover:from-botanical-700 hover:to-botanical-800 text-white font-cinzel font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {result.foundItem ? 'Take Item & Continue' : 'Continue'}
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
