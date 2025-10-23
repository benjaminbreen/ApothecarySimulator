import React from 'react';

/**
 * Simple Mobile Bottom Navigation
 * Clean implementation with inline styles to avoid CSS conflicts
 */
const SimpleMobileNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'chronicle', icon: '📖', label: 'Story' },
    { id: 'character', icon: '👤', label: 'Character' },
    { id: 'inventory', icon: '🎒', label: 'Inventory' },
    { id: 'location', icon: '🗺️', label: 'Location' }
  ];

  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 99999,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    padding: '0',
    margin: '0'
  };

  const buttonStyle = (isActive) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: isActive ? '#4caf50' : '#6b7280',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: isActive ? '600' : '400',
    minHeight: '60px',
    WebkitTapHighlightColor: 'transparent'
  });

  const iconStyle = {
    fontSize: '24px',
    lineHeight: 1
  };

  return (
    <nav style={navStyle}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            style={buttonStyle(isActive)}
            onClick={() => {
              console.log('[SimpleMobileNav] Button clicked:', tab.id);
              onTabChange(tab.id);
            }}
          >
            <span style={iconStyle}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default SimpleMobileNav;
