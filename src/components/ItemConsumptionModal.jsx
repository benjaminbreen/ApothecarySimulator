/**
 * ItemConsumptionModal Component
 *
 * Minimalist modal for confirming item consumption by the player character.
 * Centered with subtle backdrop overlay.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ItemConsumptionModal({ isOpen, itemName, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Subtle backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4"
        onClick={onCancel}
      >
        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="bg-gradient-to-br from-parchment-50 via-white to-amber-50/50 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-200/60"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Item name - centered, elegant */}
            <div className="text-center space-y-3">
              <div className="text-6xl mb-1">🧪</div>
              <h3 className="font-cinzel font-bold text-amber-900 text-2xl tracking-wide">
                {itemName}
              </h3>
              <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            </div>

            {/* Question - refined typography */}
            <div className="text-center space-y-4">
              <p className="font-crimson text-amber-900 text-lg leading-relaxed">
                Consume this item?
              </p>
              <p className="font-crimson text-amber-800/80 text-base leading-relaxed max-w-md mx-auto">
                Effects vary by substance. Some restore energy and health, while others may cause harm.
              </p>
            </div>

            {/* Buttons - clean and minimal */}
            <div className="flex gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-sans font-semibold text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Consume
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="flex-1 py-4 px-6 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 font-sans font-semibold text-base rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
