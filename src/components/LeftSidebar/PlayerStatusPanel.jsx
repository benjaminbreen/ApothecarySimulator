import React, { useState } from 'react';
import { ReputationTab } from './ReputationTab';
import { StatusTab } from './StatusTab';
import { InventoryTab } from './InventoryTab';

/**
 * PlayerStatusPanel Component
 * Tabbed interface showing Reputation, Status (Skills + Effects), and Inventory
 */
export function PlayerStatusPanel({
  reputation,
  reputationEmoji,
  activeEffects,
  playerSkills,
  onItemClick,
  onOpenReputationModal,
  onOpenSkillsModal,
  activeTab: controlledActiveTab,
  onTabChange,
  inventory, // Add inventory prop
  xpGain, // XP gain notification data
  xpGainKey // Key to force re-render of XP animation
}) {
  const [internalActiveTab, setInternalActiveTab] = useState('reputation');
  const [hoveredTab, setHoveredTab] = useState(null);

  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;

  // Tab configuration
  const tabs = [
    { id: 'reputation', label: 'Reputation' },
    { id: 'status', label: 'Status' },
    { id: 'inventory', label: 'Inventory' },
  ];

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300 rounded-2xl" style={{
      background: isDark
        ? 'linear-gradient(315deg, rgba(15, 23, 42, 1.0) 0%, rgba(30, 41, 59, 1.0) 50%, rgba(15, 23, 42, 1.0) 100%)'
        : 'linear-gradient(315deg, rgba(255, 255, 255, 0.88) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.90) 100%)',
      backdropFilter: 'blur(16px) saturate(120%)',
      WebkitBackdropFilter: 'blur(16px) saturate(120%)',
      border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
      boxShadow: isDark
        ? '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        : '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    }}>

      {/* Tab Headers - Modern Minimal */}
      <div className="flex border-b-2 border-ink-100 dark:border-slate-700 bg-white dark:bg-slate-800" style={{ borderRadius: '16px 16px 0 0' }}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isHovered = hoveredTab === tab.id;
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className="flex-1 px-5 py-3 font-sans font-semibold text-sm tracking-wide transition-all duration-300 relative"
              style={{
                color: isActive ? (document.documentElement.classList.contains('dark') ? '#fbbf24' : '#10b981') : (document.documentElement.classList.contains('dark') ? '#a8a29e' : '#8a857d'),
                backgroundColor: isHovered && !isActive ? (document.documentElement.classList.contains('dark') ? '#334155' : '#f8f8f7') : (document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff'),
                borderRadius: isFirst ? '16px 0 0 0' : isLast ? '0 16px 0 0' : '0'
              }}
            >
              {tab.label}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                  style={{
                    height: '2px',
                    background: document.documentElement.classList.contains('dark')
                      ? 'linear-gradient(to right, #fbbf24, #f59e0b, #fbbf24)'
                      : 'linear-gradient(to right, #34d399, #10b981, #34d399)'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content - Embossed inset with realistic warm parchment lighting */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 transition-all duration-300 relative"
        style={{
          background: isDark
            ? `
                radial-gradient(ellipse at 0% 0%, rgba(51, 65, 85, 0.35) 0%, transparent 50%),
                radial-gradient(ellipse at 100% 100%, rgba(71, 85, 105, 0.2) 0%, transparent 50%),
                repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(100, 116, 139, 0.03) 2px, rgba(100, 116, 139, 0.03) 4px),
                repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(100, 116, 139, 0.015) 3px, rgba(100, 116, 139, 0.015) 6px),
                linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.25) 100%)
              `
            : `
                radial-gradient(ellipse at 0% 0%, rgba(180, 150, 110, 0.18) 0%, transparent 45%),
                radial-gradient(ellipse at 100% 100%, rgba(255, 250, 240, 0.3) 0%, transparent 45%),
                repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(139, 125, 107, 0.02) 2px, rgba(139, 125, 107, 0.02) 4px),
                repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(139, 125, 107, 0.012) 3px, rgba(139, 125, 107, 0.012) 6px),
                linear-gradient(135deg, rgba(245, 240, 232, 1) 0%, rgba(248, 244, 238, 0.98) 100%)
              `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
          boxShadow: isDark
            ? `
                inset 3px 3px 8px rgba(0, 0, 0, 0.35),
                inset 1px 1px 3px rgba(0, 0, 0, 0.25),
                inset -2px -2px 4px rgba(71, 85, 105, 0.15),
                inset 0 0 0 1px rgba(71, 85, 105, 0.2)
              `
            : `
                inset 3px 3px 10px rgba(140, 100, 60, 0.14),
                inset 2px 2px 5px rgba(120, 85, 50, 0.10),
                inset -2px -2px 4px rgba(255, 252, 245, 0.8),
                inset 0 0 0 1px rgba(200, 180, 150, 0.2)
              `,
        }}
      >
        {activeTab === 'reputation' && (
          <ReputationTab
            reputation={reputation}
            reputationEmoji={reputationEmoji}
            onOpenModal={onOpenReputationModal}
          />
        )}

        {activeTab === 'status' && (
          <StatusTab
            playerSkills={playerSkills}
            activeEffects={activeEffects}
            onOpenSkillsModal={onOpenSkillsModal}
            xpGain={xpGain}
            xpGainKey={xpGainKey}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab onItemClick={onItemClick} inventory={inventory} />
        )}
      </div>
    </div>
  );
}
