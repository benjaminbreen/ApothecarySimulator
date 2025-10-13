import React from 'react';

/**
 * ItemActionPopup - Modal for choosing action when dropping item on NPC
 * Options: Give, Sell, Prescribe
 */
function ItemActionPopup({
  isOpen,
  onClose,
  item,
  npc,
  onSelectAction // callback with (action, item, npc)
}) {
  if (!isOpen || !item || !npc) return null;

  const isDark = document.documentElement.classList.contains('dark');

  const actions = [
    {
      id: 'give',
      label: `Give ${item.name}`,
      description: 'Offer as a gift to improve relationship',
      icon: '🎁',
      gradient: 'from-emerald-500 to-emerald-600',
      hoverGradient: 'from-emerald-600 to-emerald-700',
      ring: 'ring-emerald-400',
      glow: 'shadow-emerald-500/50'
    },
    {
      id: 'sell',
      label: `Try to sell ${item.name}`,
      description: `Attempt to sell for ${item.price || 0} reales`,
      icon: '💰',
      gradient: 'from-amber-500 to-amber-600',
      hoverGradient: 'from-amber-600 to-amber-700',
      ring: 'ring-amber-400',
      glow: 'shadow-amber-500/50'
    },
    {
      id: 'prescribe',
      label: `Offer as prescription`,
      description: 'Provide as medical treatment',
      icon: '⚕️',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700',
      ring: 'ring-purple-400',
      glow: 'shadow-purple-500/50'
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(252, 250, 247, 0.95) 100%)',
            backdropFilter: 'blur(20px) saturate(120%)',
            WebkitBackdropFilter: 'blur(20px) saturate(120%)',
            border: isDark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(228, 218, 195, 0.5)',
          }}
        >
          {/* Header */}
          <div className="p-6 border-b border-ink-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-ink-900 dark:text-amber-400 font-serif mb-2">
                  Interact with {npc.name}
                </h3>
                <p className="text-sm text-ink-600 dark:text-parchment-300">
                  What would you like to do with {item.name}?
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-ink-500 dark:text-parchment-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Item Preview */}
          <div className="px-6 py-4 border-b border-ink-200 dark:border-slate-700">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-parchment-50 dark:bg-slate-800/50">
              <div className="text-3xl">{item.emoji || '📦'}</div>
              <div className="flex-1">
                <div className="font-semibold text-ink-900 dark:text-parchment-100">{item.name}</div>
                <div className="text-xs text-ink-500 dark:text-parchment-400">Quantity: {item.quantity}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 space-y-3">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => onSelectAction(action.id, item, npc)}
                className={`w-full group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r ${action.gradient} hover:${action.hoverGradient} shadow-lg hover:shadow-xl ${action.glow}`}
              >
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex items-center gap-4">
                  <div className="text-3xl">{action.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-white mb-1">{action.label}</div>
                    <div className="text-xs text-white/90">{action.description}</div>
                  </div>
                  <svg className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full py-2 text-sm text-ink-600 dark:text-parchment-400 hover:text-ink-900 dark:hover:text-parchment-200 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

export default ItemActionPopup;
