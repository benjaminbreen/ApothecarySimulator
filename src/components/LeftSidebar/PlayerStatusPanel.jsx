import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ReputationTab } from './ReputationTab';
import { StatusTab } from './StatusTab';
import { InventoryTab } from './InventoryTab';
import { RippleButton } from '../RippleButton';

// Tooltip component matching Header/ActionPanel style
const SidebarTooltip = ({ children, targetRef, show }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (show && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8, // 8px below button
        left: rect.left + rect.width / 2 // center of button
      });
    }
  }, [show, targetRef]);

  if (!show) return null;

  return createPortal(
    <div
      className="fixed pointer-events-none z-[9999] transition-opacity duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, 0)',
        opacity: show ? 1 : 0
      }}
    >
      <div
        className="px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap border backdrop-blur-sm"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 247, 0.95) 100%)',
          borderColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(100, 116, 139, 0.3)',
        }}
      >
        <div className="text-xs font-sans text-ink-700 dark:text-parchment-200" style={{ fontWeight: 500 }}>
          {children}
        </div>
        {/* Arrow pointing up */}
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: isDark ? '6px solid rgba(15, 23, 42, 0.98)' : '6px solid rgba(255, 255, 255, 0.98)',
          }}
        />
      </div>
    </div>,
    document.body
  );
};

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
  onOpenSkillDetail,
  onOpenFullInventory, // Handler to open full inventory modal
  activeTab: controlledActiveTab,
  onTabChange,
  inventory, // Add inventory prop
  xpGain, // XP gain notification data
  xpGainKey, // Key to force re-render of XP animation
  reputationDelta, // Reputation change delta for particle effect
  newlyAddedItemName // Name of newly-added item for particle effect
}) {
  const [internalActiveTab, setInternalActiveTab] = useState('inventory');
  const [hoveredTab, setHoveredTab] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Tooltip state and refs
  const [showReputationTooltip, setShowReputationTooltip] = useState(false);
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);
  const [showInventoryTooltip, setShowInventoryTooltip] = useState(false);
  const reputationTabRef = useRef(null);
  const statusTabRef = useRef(null);
  const inventoryTabRef = useRef(null);

  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;

  // Handle tab click with collapse/expand logic
  const handleTabClick = (tabId) => {
    if (tabId === activeTab && !isCollapsed) {
      // Clicking active tab when expanded -> collapse
      setIsCollapsed(true);
    } else {
      // Clicking different tab or clicking when collapsed -> expand and switch
      setIsCollapsed(false);
      setActiveTab(tabId);
    }
  };

  // Tab configuration with color schemes
  const tabs = [
    {
      id: 'reputation',
      label: 'Reputation',
      colors: {
        light: { active: '#f59e0b', inactive: '#8a857d', ripple: 'rgba(245, 158, 11, 0.25)' },
        dark: { active: '#fbbf24', inactive: '#a8a29e', ripple: 'rgba(251, 191, 36, 0.3)' }
      },
      gradient: {
        light: 'linear-gradient(to right, #fbbf24, #f59e0b, #fbbf24)',
        dark: 'linear-gradient(to right, #fbbf24, #f59e0b, #fbbf24)'
      }
    },
    {
      id: 'status',
      label: 'Status',
      colors: {
        light: { active: '#10b981', inactive: '#8a857d', ripple: 'rgba(16, 185, 129, 0.25)' },
        dark: { active: '#34d399', inactive: '#a8a29e', ripple: 'rgba(52, 211, 153, 0.3)' }
      },
      gradient: {
        light: 'linear-gradient(to right, #34d399, #10b981, #34d399)',
        dark: 'linear-gradient(to right, #34d399, #10b981, #34d399)'
      }
    },
    {
      id: 'inventory',
      label: 'Inventory',
      colors: {
        light: { active: '#3b82f6', inactive: '#8a857d', ripple: 'rgba(59, 130, 246, 0.25)' },
        dark: { active: '#60a5fa', inactive: '#a8a29e', ripple: 'rgba(96, 165, 250, 0.3)' }
      },
      gradient: {
        light: 'linear-gradient(to right, #60a5fa, #3b82f6, #60a5fa)',
        dark: 'linear-gradient(to right, #60a5fa, #3b82f6, #60a5fa)'
      }
    },
  ];

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl" style={{
      flex: isCollapsed ? '0 0 auto' : '1 1 auto',
      transition: 'flex-basis 0.6s cubic-bezier(0.4, 0, 0.2, 1), flex-grow 0.6s cubic-bezier(0.4, 0, 0.2, 1), flex-shrink 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      background: isDark
        ? 'linear-gradient(315deg, rgba(15, 23, 42, 0.45) 0%, rgba(30, 41, 59, 0.55) 50%, rgba(15, 23, 42, 0.45) 100%)'
        : 'linear-gradient(315deg, rgba(255, 255, 255, 0.4) 0%, rgba(249, 245, 235, 0.5) 50%, rgba(252, 250, 247, 0.45) 100%)',
      backdropFilter: 'blur(20px) saturate(140%)',
      WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      border: isDark ? '1px solid rgba(71, 85, 105, 0.4)' : '1px solid rgba(209, 213, 219, 0.5)',
      boxShadow: isDark
        ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 1px 2px rgba(0, 0, 0, 0.2)'
        : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 1px 2px rgba(0, 0, 0, 0.05)',
    }}>

      {/* Tab Headers - Glassomorphic */}
      <div className="flex border-b-2 transition-all duration-500" style={{
        borderRadius: '16px 16px 0 0',
        borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.4)',
        background: isDark
          ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.2) 100%)'
          : 'linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(249, 245, 235, 0.25) 100%)',
        backdropFilter: 'blur(12px) saturate(120%)',
        WebkitBackdropFilter: 'blur(12px) saturate(120%)',
      }}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isHovered = hoveredTab === tab.id;
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;
          const tabColors = isDark ? tab.colors.dark : tab.colors.light;

          // Get appropriate ref and tooltip setter for this tab
          const getTabRef = () => {
            if (tab.id === 'reputation') return reputationTabRef;
            if (tab.id === 'status') return statusTabRef;
            if (tab.id === 'inventory') return inventoryTabRef;
            return null;
          };

          const getTooltipSetter = () => {
            if (tab.id === 'reputation') return setShowReputationTooltip;
            if (tab.id === 'status') return setShowStatusTooltip;
            if (tab.id === 'inventory') return setShowInventoryTooltip;
            return () => {};
          };

          return (
            <div
              key={tab.id}
              ref={getTabRef()}
              onMouseEnter={() => {
                setHoveredTab(tab.id);
                getTooltipSetter()(true);
              }}
              onMouseLeave={() => {
                setHoveredTab(null);
                getTooltipSetter()(false);
              }}
              className="flex-1"
            >
              <RippleButton
                onClick={() => handleTabClick(tab.id)}
                rippleColor={tabColors.ripple}
                className="w-full px-5 py-3 font-sans font-semibold text-sm tracking-wide transition-all duration-500 relative"
                style={{
                  color: isActive ? tabColors.active : tabColors.inactive,
                  background: isHovered && !isActive
                    ? (isDark
                        ? 'linear-gradient(180deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.4) 100%)'
                        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(248, 244, 238, 0.4) 100%)')
                    : 'transparent',
                  backdropFilter: isHovered ? 'blur(16px) saturate(150%)' : 'blur(8px)',
                  WebkitBackdropFilter: isHovered ? 'blur(16px) saturate(150%)' : 'blur(8px)',
                  borderRadius: isFirst ? '16px 0 0 0' : isLast ? '0 16px 0 0' : '0',
                boxShadow: isHovered && !isActive
                  ? (isDark
                      ? 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.2)'
                      : 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.05)')
                  : 'none'
              }}
            >
              {tab.label}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                  style={{
                    height: '2px',
                    background: isDark ? tab.gradient.dark : tab.gradient.light,
                    boxShadow: isDark
                      ? `0 0 8px ${tabColors.active}40`
                      : `0 0 6px ${tabColors.active}30`
                  }}
                />
              )}
            </RippleButton>
            </div>
          );
        })}
      </div>

      {/* Tab Content - Glassomorphic with subtle texture */}
      <div
        className="overflow-y-auto custom-scrollbar px-3 py-3 relative"
        style={{
          flex: isCollapsed ? '0 0 0' : '1 1 auto',
          maxHeight: isCollapsed ? '0' : '100%',
          opacity: isCollapsed ? 0 : 1,
          paddingTop: isCollapsed ? 0 : '0.75rem',
          paddingBottom: isCollapsed ? 0 : '0.75rem',
          transition: 'flex-basis 0.3s cubic-bezier(0.4, 0, 0.2, 1), flex-grow 0.3s cubic-bezier(0.4, 0, 0.2, 1), flex-shrink 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: isDark
            ? `
                radial-gradient(ellipse at 0% 0%, rgba(51, 65, 85, 0.2) 0%, transparent 50%),
                radial-gradient(ellipse at 100% 100%, rgba(71, 85, 105, 0.15) 0%, transparent 50%),
                repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(100, 116, 139, 0.02) 2px, rgba(100, 116, 139, 0.02) 4px),
                repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(100, 116, 139, 0.01) 3px, rgba(100, 116, 139, 0.01) 6px),
                linear-gradient(135deg, rgba(15, 23, 42, 0.25) 0%, rgba(30, 41, 59, 0.15) 100%)
              `
            : `
                radial-gradient(ellipse at 10% 10%, rgba(180, 150, 110, 0.04) 20%, transparent 35%),
                radial-gradient(ellipse at 100% 100%, rgba(255, 250, 240, 0.15) 0%, transparent 45%),
                repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(139, 125, 107, 0.015) 2px, rgba(139, 125, 107, 0.015) 4px),
                repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(139, 125, 107, 0.012) 3px, rgba(139, 125, 107, 0.012) 6px),
                linear-gradient(135deg, rgba(245, 240, 232, 0.3) 0%, rgba(248, 244, 238, 0.25) 100%)
              `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
          backdropFilter: 'blur(8px) saturate(110%)',
          WebkitBackdropFilter: 'blur(8px) saturate(110%)',
          boxShadow: isDark
            ? `
                inset 2px 2px 6px rgba(0, 0, 0, 0.2),
                inset 1px 1px 2px rgba(0, 0, 0, 0.15),
                inset -1px -1px 3px rgba(71, 85, 105, 0.1),
                inset 0 0 0 1px rgba(71, 85, 105, 0.15)
              `
            : `
                inset 1px 2px 6px rgba(140, 100, 60, 0.12),
                inset 1px 1px 4px rgba(120, 85, 50, 0.04),
                inset -1px -1px 3px rgba(255, 252, 245, 0.5),
                inset 0 0 0 1px rgba(200, 180, 150, 0.04)
              `,
        }}
      >
        {activeTab === 'reputation' && (
          <ReputationTab
            reputation={reputation}
            reputationEmoji={reputationEmoji}
            onOpenModal={onOpenReputationModal}
            reputationDelta={reputationDelta}
          />
        )}

        {activeTab === 'status' && (
          <StatusTab
            playerSkills={playerSkills}
            activeEffects={activeEffects}
            onOpenSkillsModal={onOpenSkillsModal}
            onOpenSkillDetail={onOpenSkillDetail}
            xpGain={xpGain}
            xpGainKey={xpGainKey}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            onItemClick={onItemClick}
            onOpenFullInventory={onOpenFullInventory}
            inventory={inventory}
            newlyAddedItemName={newlyAddedItemName}
          />
        )}
      </div>

      {/* Tab Tooltips */}
      <SidebarTooltip targetRef={reputationTabRef} show={showReputationTooltip}>
        View faction standings & relationships
      </SidebarTooltip>

      <SidebarTooltip targetRef={statusTabRef} show={showStatusTooltip}>
        View skills & active effects
      </SidebarTooltip>

      <SidebarTooltip targetRef={inventoryTabRef} show={showInventoryTooltip}>
        View materia medica & compounds
      </SidebarTooltip>
    </div>
  );
}
