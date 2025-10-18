import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDrop } from 'react-dnd';
import { getProfessionName, getProfessionIcon, PROFESSIONS } from '../../core/systems/levelingSystem';
import { RippleIconButton } from '../RippleButton';

/**
 * Get profession color theme for badges
 */
function getProfessionColor(professionId) {
  const colors = {
    [PROFESSIONS.ALCHEMIST]: {
      primary: '#8b5cf6',
      light: 'rgba(139, 92, 246, 0.15)',
      dark: '#6d28d9',
      glow: 'rgba(139, 92, 246, 0.3)'
    },
    [PROFESSIONS.HERBALIST]: {
      primary: '#16a34a',
      light: 'rgba(22, 163, 74, 0.15)',
      dark: '#15803d',
      glow: 'rgba(22, 163, 74, 0.3)'
    },
    [PROFESSIONS.SURGEON]: {
      primary: '#dc2626',
      light: 'rgba(220, 38, 38, 0.15)',
      dark: '#b91c1c',
      glow: 'rgba(220, 38, 38, 0.3)'
    },
    [PROFESSIONS.POISONER]: {
      primary: '#1f2937',
      light: 'rgba(31, 41, 55, 0.15)',
      dark: '#111827',
      glow: 'rgba(31, 41, 55, 0.3)'
    },
    [PROFESSIONS.SCHOLAR]: {
      primary: '#0ea5e9',
      light: 'rgba(14, 165, 233, 0.15)',
      dark: '#0284c7',
      glow: 'rgba(14, 165, 233, 0.3)'
    },
    [PROFESSIONS.COURT_PHYSICIAN]: {
      primary: '#f59e0b',
      light: 'rgba(245, 158, 11, 0.15)',
      dark: '#d97706',
      glow: 'rgba(245, 158, 11, 0.3)'
    }
  };
  return colors[professionId] || colors[PROFESSIONS.SCHOLAR];
}

/**
 * CharacterCard Component
 * Displays character portrait, identity, and vital stats (health, energy, wealth)
 * with animations and collapse functionality
 */
export function CharacterCard({
  wealth = 11,
  status = 'rested',
  health = 85,
  energy = 62,
  characterName = 'Maria de Lima',
  characterTitle = 'Master Apothecary',
  characterLevel = 8,
  chosenProfession = null, // New prop: player's chosen profession
  portraitImage = null,
  onOpenCharacterModal,
  onItemDropOnPlayer, // New prop for handling item drops
  onCollapseChange, // Callback when collapse state changes
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Notify parent when collapse state changes
  React.useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  // Tooltip state for portrait
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const portraitRef = useRef(null);

  // Track previous values for animations
  const [prevHealth, setPrevHealth] = useState(health);
  const [prevEnergy, setPrevEnergy] = useState(energy);
  const [prevWealth, setPrevWealth] = useState(wealth);

  // Animation states
  const [healthFlash, setHealthFlash] = useState(null);
  const [energyFlash, setEnergyFlash] = useState(null);
  const [wealthFlash, setWealthFlash] = useState(null);
  const [ringPulse, setRingPulse] = useState(null); // null, 'mild', 'moderate', 'critical'

  // Timers
  const healthTimer = useRef(null);
  const energyTimer = useRef(null);
  const wealthTimer = useRef(null);
  const ringPulseTimer = useRef(null);

  // Detect health changes
  useEffect(() => {
    if (health !== prevHealth) {
      const diff = health - prevHealth;
      setHealthFlash(diff);
      setPrevHealth(health);

      if (healthTimer.current) clearTimeout(healthTimer.current);
      healthTimer.current = setTimeout(() => setHealthFlash(null), 2000);
    }
  }, [health, prevHealth]);

  // Detect energy changes
  useEffect(() => {
    if (energy !== prevEnergy) {
      const diff = energy - prevEnergy;
      setEnergyFlash(diff);
      setPrevEnergy(energy);

      if (energyTimer.current) clearTimeout(energyTimer.current);
      energyTimer.current = setTimeout(() => setEnergyFlash(null), 2000);
    }
  }, [energy, prevEnergy]);

  // Detect wealth changes
  useEffect(() => {
    if (wealth !== prevWealth) {
      const diff = wealth - prevWealth;
      setWealthFlash(diff);
      setPrevWealth(wealth);

      if (wealthTimer.current) clearTimeout(wealthTimer.current);
      wealthTimer.current = setTimeout(() => setWealthFlash(null), 2000);
    }
  }, [wealth, prevWealth]);

  // IMPROVED: Semantic color logic - only show warning/danger when actually critical
  const getStatColor = (value, type) => {
    if (type === 'health') {
      if (value < 20) return 'danger';
      if (value < 40) return 'warning';
      return 'success';
    }
    if (type === 'energy') {
      if (value < 15) return 'danger';
      if (value < 35) return 'warning';
      return 'potion';
    }
    return 'botanical';
  };

  // Status color mapping (corresponds to portrait border color)
  const getStatusColor = (statusText) => {
    const lowerStatus = statusText.toLowerCase();
    if (lowerStatus.includes('rested') || lowerStatus.includes('energized') || lowerStatus.includes('well')) {
      return { bg: 'bg-success-100', text: 'text-success-700', ring: 'ring-success-400' };
    }
    if (lowerStatus.includes('tired') || lowerStatus.includes('fatigued') || lowerStatus.includes('weary')) {
      return { bg: 'bg-warning-100', text: 'text-warning-700', ring: 'ring-warning-400' };
    }
    if (lowerStatus.includes('injured') || lowerStatus.includes('sick') || lowerStatus.includes('ill') || lowerStatus.includes('critical')) {
      return { bg: 'bg-danger-100', text: 'text-danger-700', ring: 'ring-danger-400' };
    }
    // Default neutral
    return { bg: 'bg-ink-100', text: 'text-ink-700', ring: 'ring-ink-400' };
  };

  const statusColors = getStatusColor(status);

  // Update portrait ring color based on health and energy with gradient data
  const getPortraitRingStyle = () => {
    // Check overall condition based on health and energy - more granular thresholds
    if (health >= 75 && energy >= 60) {
      return {
        gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 25%, #10b981 50%, #059669 75%, #10b981 100%)',
        glow: '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
        overlayColor: 'rgba(16, 185, 129, 0.15)',
        shimmerGradient: 'linear-gradient(90deg, rgba(16, 185, 129, 0) 0%, rgba(52, 211, 153, 0.6) 50%, rgba(16, 185, 129, 0) 100%)'
      };
    }
    if (health >= 65 && energy >= 50) {
      return {
        gradient: 'linear-gradient(135deg, #34d399 0%, #6ee7b7 25%, #34d399 50%, #10b981 75%, #34d399 100%)',
        glow: '0 0 20px rgba(52, 211, 153, 0.4), 0 0 40px rgba(52, 211, 153, 0.2)',
        overlayColor: 'rgba(52, 211, 153, 0.15)',
        shimmerGradient: 'linear-gradient(90deg, rgba(52, 211, 153, 0) 0%, rgba(110, 231, 183, 0.6) 50%, rgba(52, 211, 153, 0) 100%)'
      };
    }
    if (health >= 55 && energy >= 40) {
      return {
        gradient: 'linear-gradient(135deg, #84cc16 0%, #a3e635 25%, #84cc16 50%, #65a30d 75%, #84cc16 100%)',
        glow: '0 0 20px rgba(132, 204, 22, 0.4), 0 0 40px rgba(132, 204, 22, 0.2)',
        overlayColor: 'rgba(132, 204, 22, 0.15)',
        shimmerGradient: 'linear-gradient(90deg, rgba(132, 204, 22, 0) 0%, rgba(163, 230, 53, 0.6) 50%, rgba(132, 204, 22, 0) 100%)'
      };
    }
    if (health >= 45 && energy >= 30) {
      return {
        gradient: 'linear-gradient(135deg, #eab308 0%, #fde047 25%, #eab308 50%, #ca8a04 75%, #eab308 100%)',
        glow: '0 0 20px rgba(234, 179, 8, 0.4), 0 0 40px rgba(234, 179, 8, 0.2)',
        overlayColor: 'rgba(234, 179, 8, 0.15)',
        shimmerGradient: 'linear-gradient(90deg, rgba(234, 179, 8, 0) 0%, rgba(253, 224, 71, 0.6) 50%, rgba(234, 179, 8, 0) 100%)'
      };
    }
    if (health >= 35 && energy >= 20) {
      return {
        gradient: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 25%, #fbbf24 50%, #f59e0b 75%, #fbbf24 100%)',
        glow: '0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.2)',
        overlayColor: 'rgba(251, 191, 36, 0.15)',
        shimmerGradient: 'linear-gradient(90deg, rgba(251, 191, 36, 0) 0%, rgba(252, 211, 77, 0.6) 50%, rgba(251, 191, 36, 0) 100%)'
      };
    }
    if (health >= 25 || energy >= 15) {
      return {
        gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 25%, #f97316 50%, #ea580c 75%, #f97316 100%)',
        glow: '0 0 20px rgba(249, 115, 22, 0.4), 0 0 40px rgba(249, 115, 22, 0.2)',
        overlayColor: 'rgba(249, 115, 22, 0.15)',
        shimmerGradient: 'linear-gradient(90deg, rgba(249, 115, 22, 0) 0%, rgba(251, 146, 60, 0.6) 50%, rgba(249, 115, 22, 0) 100%)'
      };
    }
    return {
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 25%, #ef4444 50%, #dc2626 75%, #ef4444 100%)',
      glow: '0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)',
      overlayColor: 'rgba(239, 68, 68, 0.15)',
      shimmerGradient: 'linear-gradient(90deg, rgba(239, 68, 68, 0) 0%, rgba(248, 113, 113, 0.6) 50%, rgba(239, 68, 68, 0) 100%)'
    };
  };

  // Get ring status tier (for detecting threshold crossings)
  const getRingTier = (h, e) => {
    if (h >= 75 && e >= 60) return 0; // Best - emerald green
    if (h >= 65 && e >= 50) return 1; // Light emerald
    if (h >= 55 && e >= 40) return 2; // Lime
    if (h >= 45 && e >= 30) return 3; // Gold
    if (h >= 35 && e >= 20) return 4; // Amber
    if (h >= 25 || e >= 15) return 5; // Orange
    return 6; // Worst - red
  };

  // Detect ring status changes and trigger pulse
  useEffect(() => {
    const currentTier = getRingTier(health, energy);
    const prevTier = getRingTier(prevHealth, prevEnergy);

    if (currentTier !== prevTier) {
      const tierDiff = currentTier - prevTier;

      // Determine pulse intensity
      let intensity = 'mild';
      if (Math.abs(tierDiff) >= 3 || currentTier >= 5) {
        intensity = 'critical'; // Big jump or entering critical range
      } else if (Math.abs(tierDiff) >= 2 || currentTier >= 4) {
        intensity = 'moderate'; // Moderate jump or entering warning range
      }

      setRingPulse(intensity);

      if (ringPulseTimer.current) clearTimeout(ringPulseTimer.current);
      ringPulseTimer.current = setTimeout(() => setRingPulse(null), 1000);
    }
  }, [health, energy, prevHealth, prevEnergy]);

  // Drop zone for inventory items on player portrait
  const [{ isOverPlayer }, dropPlayer] = useDrop(() => ({
    accept: 'INVENTORY_ITEM',
    drop: (item) => {
      if (onItemDropOnPlayer) {
        onItemDropOnPlayer(item);
      }
    },
    collect: (monitor) => ({
      isOverPlayer: monitor.isOver(),
    }),
  }), [onItemDropOnPlayer]);

  // Update tooltip position when showing
  useEffect(() => {
    if (showTooltip && portraitRef.current) {
      const rect = portraitRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 8, // 8px above portrait
        left: rect.left + rect.width / 2 // center of portrait
      });
    }
  }, [showTooltip]);

  const initials = characterName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <>
      <style>{`
        @keyframes liquidShimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .liquid-shimmer-green::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 9px;
          background: linear-gradient(
            90deg,
            rgba(16, 185, 129, 0) 0%,
            rgba(16, 185, 129, 0.5) 25%,
            rgba(52, 211, 153, 0.7) 40%,
            rgba(167, 243, 208, 0.8) 50%,
            rgba(52, 211, 153, 0.7) 60%,
            rgba(16, 185, 129, 0.5) 75%,
            rgba(16, 185, 129, 0) 100%
          );
          background-size: 200% 100%;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .liquid-shimmer-green:hover::after {
          opacity: 1;
          animation: liquidShimmer 4.5s ease-in-out infinite;
        }

        .liquid-shimmer-purple::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 9px;
          background: linear-gradient(
            90deg,
            rgba(168, 85, 247, 0) 0%,
            rgba(168, 85, 247, 0.5) 25%,
            rgba(192, 132, 252, 0.7) 40%,
            rgba(233, 213, 255, 0.8) 50%,
            rgba(192, 132, 252, 0.7) 60%,
            rgba(168, 85, 247, 0.5) 75%,
            rgba(168, 85, 247, 0) 100%
          );
          background-size: 200% 100%;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .liquid-shimmer-purple:hover::after {
          opacity: 1;
          animation: liquidShimmer 4.5s ease-in-out infinite;
        }

        .liquid-shimmer-gold::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 9px;
          background: linear-gradient(
            90deg,
            rgba(234, 179, 8, 0) 0%,
            rgba(234, 179, 8, 0.5) 20%,
            rgba(250, 204, 21, 0.7) 35%,
            rgba(253, 224, 71, 0.85) 45%,
            rgba(255, 255, 150, 0.95) 50%,
            rgba(253, 224, 71, 0.85) 55%,
            rgba(250, 204, 21, 0.7) 65%,
            rgba(234, 179, 8, 0.5) 80%,
            rgba(234, 179, 8, 0) 100%
          );
          background-size: 200% 100%;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .liquid-shimmer-gold:hover::after {
          opacity: 1;
          animation: liquidShimmer 4.5s ease-in-out infinite;
        }

        /* Portrait ring shimmer animation */
        @keyframes portraitRingShimmer {
          0% {
            transform: rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: rotate(360deg);
            opacity: 0;
          }
        }

        .portrait-ring-shimmer::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          padding: 2px;
          background: linear-gradient(90deg, transparent, var(--shimmer-color), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .portrait-ring-shimmer:hover::before {
          opacity: 1;
          animation: portraitRingShimmer 3s ease-in-out infinite;
        }

        /* Dynamic ring width expansion on hover */
        .portrait-ring-shimmer:hover {
          padding: 6px !important;
        }

        /* Pulse animations for status changes */
        @keyframes ringPulseMild {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.03);
            filter: brightness(1.15);
          }
        }

        @keyframes ringPulseModerate {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1) drop-shadow(0 0 0px transparent);
          }
          50% {
            transform: scale(1.05);
            filter: brightness(1.25) drop-shadow(0 0 8px currentColor);
          }
        }

        @keyframes ringPulseCritical {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1) drop-shadow(0 0 0px transparent);
          }
          25% {
            transform: scale(1.08);
            filter: brightness(1.4) drop-shadow(0 0 12px currentColor);
          }
          50% {
            transform: scale(1.05);
            filter: brightness(1.3) drop-shadow(0 0 10px currentColor);
          }
          75% {
            transform: scale(1.08);
            filter: brightness(1.4) drop-shadow(0 0 12px currentColor);
          }
        }

        .ring-pulse-mild {
          animation: ringPulseMild 0.6s ease-in-out;
        }

        .ring-pulse-moderate {
          animation: ringPulseModerate 0.8s ease-in-out;
        }

        .ring-pulse-critical {
          animation: ringPulseCritical 1s ease-in-out;
        }
      `}</style>
    <div className="group rounded-2xl p-4 shadow-lg dark:shadow-dark-elevation-2 mb-4 flex-shrink-0 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-dark-elevation-3 relative overflow-hidden bg-gradient-to-br from-parchment-50/50 via-white/90 to-parchment-50/70 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 backdrop-blur-lg border border-parchment-300/30 hover:border-parchment-400/50 dark:border-slate-600/30 dark:hover:border-amber-500/40"
    >
      {/* Beautiful glassmorphic overlay - subtle by default, brighter on hover */}
      <div
        className="absolute inset-0 opacity-0 dark:opacity-0 group-hover:opacity-40 dark:group-hover:opacity-0 transition-all duration-700 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 80%, rgba(240, 253, 244, 0.15) 0%, rgba(255, 255, 255, 0.35) 30%, rgba(252, 250, 247, 0.18) 60%, transparent 100%)',
          backdropFilter: 'blur(20px) saturate(100%)',
          WebkitBackdropFilter: 'blur(20px) saturate(100%)',
        }}
      />
      {/* Collapse/Expand Button */}
      <RippleIconButton
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 border border-ink-200 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-amber-500 transition-all duration-200 shadow-sm hover:shadow z-10 group"
        title={isCollapsed ? "Expand stats" : "Collapse stats"}
      >
        <svg
          className={`w-3.5 h-3.5 text-ink-500 dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-amber-400 transition-all duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </RippleIconButton>

      <div className="flex flex-col items-center mb-5">
        {portraitImage ? (
          <button
            ref={(node) => {
              dropPlayer(node);
              portraitRef.current = node;
            }}
            onClick={onOpenCharacterModal}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`mb-3 transition-all duration-500 hover:scale-105 cursor-pointer group relative portrait-ring-shimmer ${ringPulse ? `ring-pulse-${ringPulse}` : ''} ${isOverPlayer ? 'ring-4 ring-amber-400 scale-105' : ''}`}
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              padding: '5px',
              background: getPortraitRingStyle().gradient,
              boxShadow: isOverPlayer
                ? `0 0 0 4px rgba(251, 191, 36, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)`
                : `0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)`,
              '--shimmer-color': getPortraitRingStyle().overlayColor
            }}
          >
            {/* Inner white ring for separation */}
            <div className="w-full h-full rounded-full p-[2px] bg-white dark:bg-slate-800 transition-all duration-500 group-hover:shadow-lg"
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Portrait container with inset shadow */}
              <div className="w-full h-full rounded-full overflow-hidden relative group/portrait"
                style={{
                  boxShadow: `
                    inset 0 3px 8px rgba(0, 0, 0, 0.3),
                    inset 0 1px 3px rgba(0, 0, 0, 0.4),
                    inset 0 -2px 4px rgba(255, 255, 255, 0.1)
                  `
                }}
              >
                <img
                  src={portraitImage}
                  alt={characterName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Outer glow on hover */}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                boxShadow: getPortraitRingStyle().glow,
              }}
            ></div>
          </button>
        ) : (
          <button
            ref={dropPlayer}
            onClick={onOpenCharacterModal}
            className={`mb-3 cursor-pointer hover:scale-105 transition-all duration-500 group relative flex items-center justify-center portrait-ring-shimmer ${ringPulse ? `ring-pulse-${ringPulse}` : ''} ${isOverPlayer ? 'ring-4 ring-amber-400 scale-105' : ''}`}
            title={isOverPlayer ? "Drop item to use" : "View character details"}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              padding: '5px',
              background: getPortraitRingStyle().gradient,
              boxShadow: isOverPlayer
                ? `0 0 0 4px rgba(251, 191, 36, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)`
                : `0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)`,
              '--shimmer-color': getPortraitRingStyle().overlayColor
            }}
          >
            {/* Inner white ring for separation */}
            <div className="w-full h-full rounded-full p-[2px] bg-white dark:bg-slate-800 transition-all duration-500 flex items-center justify-center"
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-3xl text-white font-display relative overflow-hidden"
                style={{
                  boxShadow: `
                    inset 0 3px 8px rgba(0, 0, 0, 0.3),
                    inset 0 -2px 4px rgba(255, 255, 255, 0.1)
                  `
                }}
              >
                {initials}
              </div>
            </div>

            {/* Outer glow on hover */}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                boxShadow: getPortraitRingStyle().glow,
              }}
            ></div>
          </button>
        )}
        <div className="text-center relative z-10">
          {/* Elegant Cinzel name with slight small-caps effect */}
          <h2 className="font-bold mb-1 text-ink-800 dark:text-amber-400 transition-colors duration-300" style={{
            fontSize: '1.3rem',
            letterSpacing: '0.02em',
            fontFamily: "'Cinzel', serif",
            textTransform: 'uppercase',
          }}>
            {characterName.split(' ').map((word, i) => (
              <span key={i}>
                <span style={{ fontSize: '1.15em' }}>{word.charAt(0)}</span>
                {word.slice(1).toLowerCase()}
                {i < characterName.split(' ').length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <p className="text-sm text-ink-500 dark:text-parchment-300 font-serif italic mb-3 transition-colors duration-300">{characterTitle}</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 bg-potion-50 dark:bg-amber-900/30 text-potion-700 dark:text-amber-300 rounded-md font-semibold font-sans border border-potion-200 dark:border-amber-600/30 transition-colors duration-300">
              Level {characterLevel}
            </span>

            {/* Profession Badge (only shown after Level 5 profession choice) */}
            {chosenProfession && (
              <span
                className="text-xs px-2.5 py-1 rounded-md font-semibold font-sans border transition-all duration-300"
                style={{
                  background: getProfessionColor(chosenProfession).light,
                  color: getProfessionColor(chosenProfession).dark,
                  borderColor: getProfessionColor(chosenProfession).primary,
                  boxShadow: `0 2px 4px ${getProfessionColor(chosenProfession).glow}`
                }}
                title={`${getProfessionName(chosenProfession)} - View abilities in Settings`}
              >
                {getProfessionIcon(chosenProfession)} {getProfessionName(chosenProfession)}
              </span>
            )}

            <span className={`text-xs px-2.5 py-1 ${statusColors.bg} dark:bg-slate-700/50 ${statusColors.text} dark:text-parchment-300 rounded-md font-semibold font-sans capitalize border border-opacity-30 transition-colors duration-300`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Stats - collapsible */}
      {!isCollapsed && (
      <div className="space-y-2 animate-fade-in-up">
        {/* Health */}
        <div className="relative group/stat">
          <div className="flex justify-between items-center mb-0.5">
            <span className="font-sans text-xs text-ink-900  dark:text-parchment-300 uppercase tracking-widest transition-colors duration-300">
              Health
            </span>
            <span className="font-semibold font-sans text-sm text-ink-700 dark:text-parchment-100 transition-all duration-300">
              {health}/100
              {healthFlash !== null && (
                <span className={`ml-2 text-xs font-bold animate-float-up ${healthFlash > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {healthFlash > 0 ? '+' : ''}{healthFlash}
                </span>
              )}
            </span>
          </div>

          {/* Tooltip */}
          <div className="absolute left-0 right-0 -top-16 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
            <div className="bg-ink-900 dark:bg-slate-800 text-white dark:text-parchment-100 px-3 py-2 rounded-lg shadow-2xl text-xs font-sans border border-slate-700 dark:border-slate-600 transition-colors duration-300">
              <div className="font-bold mb-1">Physical Wellbeing</div>
              <div className="text-ink-200 dark:text-parchment-300">Your vitality and resistance to illness. Low health increases risk of death.</div>
              <div className="absolute bottom-0 left-8 transform translate-y-1/2 rotate-45 w-2 h-2 bg-ink-900 dark:bg-slate-800"></div>
            </div>
          </div>

          {/* Health bar - Glass emerald */}
          <div className="relative rounded-full overflow-visible transition-colors duration-300" style={{
            height: '7px',
            borderRadius: '10px',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.03) 100%)',
               boxShadow: `
              inset 0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 1px 2px rgba(0, 0, 0, 0.05),
              0 1px 0 rgba(255, 255, 255, 0.55)
            `,
            padding: '0px'
          }}>
            <div
              className="h-full relative overflow-hidden group/bar liquid-shimmer-green"
              style={{
                width: `${health}%`,
                borderRadius: '9px',
                background: 'linear-gradient(90deg, #5cf04f 2%, #5bd93f 40%, #2ed93f 65%, #16a329 89%, #179128 100%)',
                boxShadow: `inset 0 1px 1.5px rgba(255, 255, 255, 0.38)`,
                transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
            >
              {/* Glass overlay - base */}
              <div className="absolute inset-0 rounded-full opacity-80 group-hover/bar:opacity-100 transition-opacity duration-700" style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 100%)'
              }}></div>

              {/* Glass overlay - radial glow on hover */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity duration-700" style={{
                background: 'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.3) 0%, transparent 60%)'
              }}></div>
            </div>
          </div>
          {health < 30 && (
            <p className="text-xs text-danger-700 dark:text-red-400 mt-1 font-sans italic flex items-center gap-1 transition-colors duration-300">
              <svg className="w-3 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {health < 20 ? 'Critical condition!' : 'Your health is poor'}
            </p>
          )}
        </div>

        {/* Energy */}
        <div className="relative group/stat">
          <div className="flex justify-between items-center mb-0.5">
            <span className="font-sans text-xs text-ink-900 dark:text-parchment-300 uppercase tracking-widest transition-colors duration-300">
              Energy
            </span>
            <span className="font-semibold font-sans text-sm text-ink-700 dark:text-parchment-100 transition-all duration-300">
              {energy}/100
              {energyFlash !== null && (
                <span className={`ml-2 text-xs font-bold animate-float-up ${energyFlash > 0 ? 'text-potion-800' : 'text-danger-600'}`}>
                  {energyFlash > 0 ? '+' : ''}{energyFlash}
                </span>
              )}
            </span>
          </div>

          {/* Tooltip */}
          <div className="absolute left-0 right-0 -top-16 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
            <div className="bg-ink-900 dark:bg-slate-800 text-white dark:text-parchment-100 px-3 py-2 rounded-lg shadow-2xl text-xs font-sans border border-slate-700 dark:border-slate-600 transition-colors duration-300">
              <div className="font-bold mb-1">Physical Stamina</div>
              <div className="text-ink-200 dark:text-parchment-300">Your capacity for work. Actions consume energy. Rest to recover.</div>
              <div className="absolute bottom-0 left-8 transform translate-y-1/2 rotate-45 w-2 h-2 bg-ink-900 dark:bg-slate-800"></div>
            </div>
          </div>

          {/* Energy bar - Glass purple */}
          <div className="relative rounded-full overflow-visible transition-colors duration-300" style={{
            height: '7px',
            borderRadius: '10px',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.04) 100%)',
            boxShadow: `
              inset 0 2px 4px rgba(0, 0, 0, 0.15),
              inset 0 1px 2px rgba(0, 0, 0, 0.05),
              0 1px 0 rgba(255, 255, 255, 0.55)
            `,
            padding: '0px'
          }}>
            <div
              className="h-full relative overflow-hidden group/bar liquid-shimmer-purple"
              style={{
                width: `${energy}%`,
                borderRadius: '9px',
                background: 'linear-gradient(90deg, #c084fc 0%, #a855f7 64%, #9333ea 72%, #7e22ce 95%, #6d28d9 100%)',
                boxShadow: `inset 0 1px 1.5px rgba(255, 255, 255, 0.38)`,
                transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
            >
              {/* Glass overlay - base */}
              <div className="absolute inset-0 rounded-full opacity-80 group-hover/bar:opacity-100 transition-opacity duration-700" style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 100%)'
              }}></div>

              {/* Glass overlay - radial glow on hover */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity duration-700" style={{
                background: 'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.3) 0%, transparent 60%)'
              }}></div>
            </div>
          </div>
          {energy < 25 && (
            <p className="text-xs text-warning-700 dark:text-amber-400 mt-1.5 font-sans italic flex items-center gap-1 transition-colors duration-300">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {energy < 15 ? 'Too exhausted to work!' : 'You are very tired'}
            </p>
          )}
        </div>

        {/* Wealth */}
        <div className="relative group/stat">
          <div className="flex justify-between items-center mb-0.5">
            <span className=" font-sans text-xs text-ink-900 dark:text-parchment-300 uppercase tracking-widest transition-colors duration-300">Wealth</span>
            <span className="font-semibold font-sans text-sm text-ink-700 dark:text-parchment-100 transition-all duration-300">
              {wealth} reales
              {wealthFlash !== null && (
                <span className={`ml-2 text-xs font-bold animate-float-up ${wealthFlash > 0 ? 'text-brass-600' : 'text-danger-600'}`}>
                  {wealthFlash > 0 ? '+' : ''}{wealthFlash}
                </span>
              )}
            </span>
          </div>

          {/* Tooltip */}
          <div className="absolute left-0 right-0 -top-16 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
            <div className="bg-ink-900 dark:bg-slate-800 text-white dark:text-parchment-100 px-3 py-2 rounded-lg shadow-2xl text-xs font-sans border border-slate-700 dark:border-slate-600 transition-colors duration-300">
              <div className="font-bold mb-1">Financial Resources</div>
              <div className="text-ink-200 dark:text-parchment-300">Your currency in reales. Used to purchase supplies and settle debts.</div>
              <div className="absolute bottom-0 left-8 transform translate-y-1/2 rotate-45 w-2 h-2 bg-ink-900 dark:bg-slate-800"></div>
            </div>
          </div>

          {/* Wealth bar - Glass gold */}
          <div className="relative rounded-full overflow-visible transition-colors duration-300" style={{
            height: '7px',
            borderRadius: '19px',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.03) 100%)',
           boxShadow: `
              inset 0 2px 4px rgba(0, 0, 0, 0.15),
              inset 0 1px 2px rgba(0, 0, 0, 0.05),
              0 1px 0 rgba(255, 255, 255, 0.55)
            `,
            padding: '0px'
          }}>
            <div
              className="h-full relative overflow-hidden group/bar liquid-shimmer-gold"
              style={{
                width: `${Math.min(100, (wealth / 100) * 100)}%`,
                borderRadius: '9px',
                background: 'linear-gradient(90deg, #fef08a 0%, #fde047 10%, #facc15 52%, #eab308 98%, #ca8a04 100%)',
                boxShadow: `inset 0 1px 1.5px rgba(255, 255, 255, 0.38)`,
                transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
            >
              {/* Glass overlay - base */}
              <div className="absolute inset-0 rounded-full opacity-80 group-hover/bar:opacity-100 transition-opacity duration-700" style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.01) 40%, transparent 100%)'
              }}></div>

              {/* Glass overlay - radial glow on hover */}
              <div className="absolute inset-0 rounded-full opacity-40 group-hover/bar:opacity-100 transition-opacity duration-700" style={{
                background: 'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.3) 0%, transparent 60%)'
              }}></div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>

    {/* Portal-based tooltip for Maria's portrait */}
    {showTooltip && createPortal(
      <div
        className="fixed pointer-events-none z-[9999] transition-opacity duration-200"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: 'translate(-50%, -100%)',
          opacity: showTooltip ? 1 : 0
        }}
      >
        <div
          className="px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap border backdrop-blur-sm"
          style={{
            background: document.documentElement.classList.contains('dark')
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 247, 0.95) 100%)',
            borderColor: document.documentElement.classList.contains('dark')
              ? 'rgba(251, 191, 36, 0.3)'
              : 'rgba(16, 185, 129, 0.3)',
          }}
        >
          <div className="text-xs font-sans text-ink-700 dark:text-parchment-200" style={{ fontWeight: 500 }}>
            Maria is feeling <span className="font-bold">{status || 'calm'}</span>. Click for more information.
          </div>
          {/* Arrow pointing down */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: document.documentElement.classList.contains('dark')
                ? '6px solid rgba(15, 23, 42, 0.98)'
                : '6px solid rgba(255, 255, 255, 0.98)',
            }}
          />
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
