/**
 * EquipmentModal - Full-Screen Equipment & Paperdoll System
 *
 * Features:
 * - Ragdoll human figure with equipment slots
 * - Drag & drop equipment system
 * - Full inventory display
 * - Character stats and portrait
 * - Settings V3 + Mixing Workshop aesthetic
 *
 * Equipment Slots: Head, Neck, Chest, Hands, Waist, Feet, Ring L/R, Back
 */

import React, { useState } from 'react';
import { useDrop, useDrag } from 'react-dnd';

const EQUIPMENT_SLOTS = {
  head: { name: 'Head', position: { x: 50, y: 10 }, types: ['hat', 'hood', 'crown', 'helmet'] },
  neck: { name: 'Neck', position: { x: 50, y: 25 }, types: ['necklace', 'amulet', 'collar'] },
  chest: { name: 'Chest', position: { x: 50, y: 45 }, types: ['robe', 'tunic', 'vest', 'coat'] },
  hands: { name: 'Hands', position: { x: 50, y: 60 }, types: ['gloves', 'rings', 'bracelet'] },
  waist: { name: 'Waist', position: { x: 50, y: 70 }, types: ['belt', 'sash', 'girdle'] },
  feet: { name: 'Feet', position: { x: 50, y: 90 }, types: ['boots', 'shoes', 'sandals'] },
  ringLeft: { name: 'Ring (L)', position: { x: 20, y: 60 }, types: ['ring'] },
  ringRight: { name: 'Ring (R)', position: { x: 80, y: 60 }, types: ['ring'] },
  back: { name: 'Back', position: { x: 50, y: 35 }, types: ['cloak', 'cape', 'shawl'] }
};

function EquipmentSlot({ slotId, slot, equippedItem, onDrop, onUnequip, theme }) {
  const isDark = theme === 'dark';

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'inventoryItem',
    canDrop: (item) => {
      // Check if item type matches slot (if item has equipmentSlot property)
      if (item.equipmentSlot) {
        return item.equipmentSlot === slotId;
      }
      // For now, allow any item (we can add equipment type checking later)
      return true;
    },
    drop: (item) => onDrop(slotId, item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'inventoryItem',
    item: equippedItem ? { ...equippedItem, fromSlot: slotId } : null,
    canDrag: !!equippedItem,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [equippedItem, slotId]);

  return (
    <div
      ref={equippedItem ? drag : drop}
      className="absolute"
      style={{
        left: `${slot.position.x}%`,
        top: `${slot.position.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: equippedItem ? 'grab' : 'pointer'
      }}
    >
      <div
        className="relative transition-all"
        style={{
          width: slotId.includes('ring') ? '60px' : '80px',
          height: slotId.includes('ring') ? '60px' : '80px',
          borderRadius: '12px',
          border: isOver && canDrop
            ? (isDark ? '3px solid #fbbf24' : '3px solid #d97706')
            : (isDark ? '2px solid rgba(148, 163, 184, 0.4)' : '2px solid rgba(139, 92, 46, 0.3)'),
          background: isOver && canDrop
            ? (isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(217, 119, 6, 0.15)')
            : equippedItem
              ? (isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 250, 240, 0.9)')
              : (isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)'),
          boxShadow: equippedItem
            ? (isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(92, 74, 58, 0.25)')
            : 'none',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          opacity: isDragging ? 0.5 : 1
        }}
      >
        {equippedItem ? (
          <>
            <div className="text-3xl mb-1">{equippedItem.emoji || '📦'}</div>
            <p
              className="text-xs font-semibold text-center truncate w-full"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: isDark ? '#cbd5e1' : '#6b5d52'
              }}
            >
              {equippedItem.name}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnequip(slotId);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: isDark ? '#dc2626' : '#991b1b',
                color: 'white',
                border: 'none',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
              }}
            >
              ×
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="text-2xl mb-1 opacity-40">+</div>
            <p
              className="text-xs font-medium opacity-60"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: isDark ? '#94a3b8' : '#8b7a6a'
              }}
            >
              {slot.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableInventoryItem({ item, index, theme }) {
  const isDark = theme === 'dark';

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'inventoryItem',
    item: { ...item, fromInventory: true },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [item]);

  return (
    <div
      ref={drag}
      className="transition-all rounded-lg p-3 cursor-grab"
      style={{
        opacity: isDragging ? 0.5 : 1,
        background: isDark
          ? 'rgba(30, 41, 59, 0.6)'
          : 'rgba(255, 250, 240, 0.8)',
        border: isDark
          ? '1px solid rgba(148, 163, 184, 0.3)'
          : '1px solid rgba(139, 92, 46, 0.2)',
        boxShadow: isDark
          ? '0 2px 6px rgba(0, 0, 0, 0.2)'
          : '0 2px 6px rgba(92, 74, 58, 0.15)'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl flex-shrink-0">{item.emoji || '📦'}</div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: isDark ? '#e2e8f0' : '#3d2f24'
            }}
          >
            {item.name}
          </p>
          <p
            className="text-xs opacity-70"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: isDark ? '#94a3b8' : '#8b7a6a'
            }}
          >
            Qty: {item.quantity || 1}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentModal({
  isOpen,
  onClose,
  inventory = [],
  characterName = 'Maria de Lima',
  portraitImage = null,
  health = 85,
  energy = 62,
  wealth = 11,
  theme = 'light'
}) {
  const [equipped, setEquipped] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const isDark = theme === 'dark';

  const handleEquip = (slotId, item) => {
    console.log(`Equipping ${item.name} to ${slotId}`);
    setEquipped(prev => ({
      ...prev,
      [slotId]: item
    }));
  };

  const handleUnequip = (slotId) => {
    console.log(`Unequipping from ${slotId}`);
    setEquipped(prev => {
      const newEquipped = { ...prev };
      delete newEquipped[slotId];
      return newEquipped;
    });
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Full Screen Backdrop */}
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
              : 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 50%, #faf8f3 100%)'
          }}
        >
          {/* Header */}
          <div
            className="relative px-8 py-6 border-b"
            style={{
              background: isDark
                ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.7))'
                : 'linear-gradient(to bottom, rgba(245, 238, 223, 0.6), rgba(250, 248, 243, 0.4))',
              borderColor: isDark
                ? 'rgba(148, 163, 184, 0.2)'
                : 'rgba(139, 92, 46, 0.15)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">👤</span>
                  <div>
                    <h1
                      className="text-4xl tracking-tight"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontWeight: 700,
                        color: isDark ? '#e2e8f0' : '#3d2f24',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      Equipment & Inventory
                    </h1>
                    <p
                      className="text-sm font-medium mt-1"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: isDark ? '#94a3b8' : '#8b7a6a',
                        letterSpacing: '0.01em'
                      }}
                    >
                      Equip items • Manage belongings • View character
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="px-6 py-3 text-base font-semibold transition-all rounded-lg"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  background: isDark ? '#334155' : '#5c4a3a',
                  color: 'white',
                  border: isDark
                    ? '1px solid rgba(148, 163, 184, 0.3)'
                    : '1px solid rgba(92, 74, 58, 0.3)',
                  boxShadow: isDark
                    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                    : '0 2px 8px rgba(92, 74, 58, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = isDark ? '#475569' : '#4a3a2d';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = isDark ? '#334155' : '#5c4a3a';
                }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex h-[calc(100vh-120px)]">

            {/* Left Sidebar - Character Info */}
            <div
              className="w-80 p-6 border-r overflow-y-auto"
              style={{
                background: isDark
                  ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))'
                  : 'linear-gradient(to bottom, rgba(235, 225, 210, 0.6), rgba(240, 232, 218, 0.8))',
                borderColor: isDark
                  ? 'rgba(148, 163, 184, 0.2)'
                  : 'rgba(139, 92, 46, 0.15)'
              }}
            >
              {/* Portrait */}
              {portraitImage && (
                <div
                  className="mb-6 overflow-hidden rounded-xl"
                  style={{
                    border: isDark
                      ? '3px solid rgba(148, 163, 184, 0.3)'
                      : '3px solid rgba(139, 92, 46, 0.25)',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                      : '0 8px 24px rgba(92, 74, 58, 0.3)'
                  }}
                >
                  <img
                    src={portraitImage}
                    alt={characterName}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Character Name */}
              <h2
                className="text-2xl font-bold mb-6 text-center"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  color: isDark ? '#e2e8f0' : '#3d2f24'
                }}
              >
                {characterName}
              </h2>

              {/* Stats */}
              <div className="space-y-4">
                {/* Health */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: isDark ? '#cbd5e1' : '#6b5d52'
                      }}
                    >
                      ❤️ Health
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: health < 30
                          ? (isDark ? '#fca5a5' : '#dc2626')
                          : (isDark ? '#86efac' : '#16a34a')
                      }}
                    >
                      {health}%
                    </span>
                  </div>
                  <div
                    className="h-3 rounded-full overflow-hidden"
                    style={{
                      background: isDark
                        ? 'rgba(30, 41, 59, 0.8)'
                        : 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${health}%`,
                        background: health < 30
                          ? (isDark ? '#dc2626' : '#991b1b')
                          : (isDark ? '#16a34a' : '#15803d')
                      }}
                    />
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: isDark ? '#cbd5e1' : '#6b5d52'
                      }}
                    >
                      ⚡ Energy
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: energy < 20
                          ? (isDark ? '#fca5a5' : '#dc2626')
                          : (isDark ? '#93c5fd' : '#3b82f6')
                      }}
                    >
                      {energy}%
                    </span>
                  </div>
                  <div
                    className="h-3 rounded-full overflow-hidden"
                    style={{
                      background: isDark
                        ? 'rgba(30, 41, 59, 0.8)'
                        : 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${energy}%`,
                        background: energy < 20
                          ? (isDark ? '#dc2626' : '#991b1b')
                          : (isDark ? '#3b82f6' : '#2563eb')
                      }}
                    />
                  </div>
                </div>

                {/* Wealth */}
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: isDark
                      ? 'rgba(251, 191, 36, 0.15)'
                      : 'rgba(217, 119, 6, 0.1)',
                    border: isDark
                      ? '1px solid rgba(251, 191, 36, 0.3)'
                      : '1px solid rgba(217, 119, 6, 0.2)'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: isDark ? '#fbbf24' : '#d97706'
                      }}
                    >
                      💰 Wealth
                    </span>
                    <span
                      className="text-lg font-bold"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: isDark ? '#fbbf24' : '#d97706'
                      }}
                    >
                      {wealth} reales
                    </span>
                  </div>
                </div>
              </div>

              {/* Equipment Summary */}
              <div className="mt-8">
                <h3
                  className="text-lg font-bold mb-4"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: isDark ? '#e2e8f0' : '#3d2f24'
                  }}
                >
                  Equipped Items
                </h3>
                <div className="space-y-2">
                  {Object.entries(equipped).length === 0 ? (
                    <p
                      className="text-sm italic opacity-60"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: isDark ? '#94a3b8' : '#8b7a6a'
                      }}
                    >
                      No items equipped
                    </p>
                  ) : (
                    Object.entries(equipped).map(([slotId, item]) => (
                      <div
                        key={slotId}
                        className="flex items-center gap-2 p-2 rounded"
                        style={{
                          background: isDark
                            ? 'rgba(30, 41, 59, 0.5)'
                            : 'rgba(255, 250, 240, 0.6)'
                        }}
                      >
                        <span className="text-lg">{item.emoji}</span>
                        <span
                          className="text-sm flex-1"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: isDark ? '#cbd5e1' : '#4a3f35'
                          }}
                        >
                          {item.name}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Center - Paperdoll */}
            <div
              className="flex-1 p-12 flex items-center justify-center"
              style={{
                background: isDark
                  ? 'rgba(15, 23, 42, 0.3)'
                  : 'rgba(248, 243, 233, 0.3)'
              }}
            >
              <div className="relative" style={{ width: '500px', height: '700px' }}>
                {/* Title */}
                <h2
                  className="text-center text-2xl font-bold mb-8"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: isDark ? '#e2e8f0' : '#3d2f24'
                  }}
                >
                  Character Equipment
                </h2>

                {/* Human Figure SVG */}
                <div
                  className="relative rounded-2xl p-8"
                  style={{
                    width: '100%',
                    height: '600px',
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 250, 240, 0.8) 0%, rgba(250, 248, 243, 0.6) 100%)',
                    border: isDark
                      ? '2px solid rgba(148, 163, 184, 0.3)'
                      : '2px solid rgba(139, 92, 46, 0.2)',
                    boxShadow: isDark
                      ? 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
                      : 'inset 0 2px 8px rgba(92, 74, 58, 0.15)'
                  }}
                >
                  {/* Simple human figure outline */}
                  <svg
                    viewBox="0 0 200 400"
                    className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                    style={{ padding: '2rem' }}
                  >
                    {/* Head */}
                    <circle cx="100" cy="40" r="25" fill="none" stroke={isDark ? '#94a3b8' : '#8b7a6a'} strokeWidth="2" />
                    {/* Neck */}
                    <line x1="100" y1="65" x2="100" y2="85" stroke={isDark ? '#94a3b8' : '#8b7a6a'} strokeWidth="3" />
                    {/* Torso */}
                    <rect x="70" y="85" width="60" height="100" fill="none" stroke={isDark ? '#94a3b8' : '#8b7a6a'} strokeWidth="2" rx="10" />
                    {/* Arms */}
                    <line x1="70" y1="100" x2="30" y2="160" stroke={isDark ? '#94a3b8' : '#8b7a6a'} strokeWidth="3" />
                    <line x1="130" y1="100" x2="170" y2="160" stroke={isDark ? '#94a3b8' : '#8b7a6a'} strokeWidth="3" />
                    {/* Hands */}
                    <circle cx="30" cy="160" r="8" fill="none" stroke={isDark ? '#94a3b8' : '#8b7a6a'} strokeWidth="2" />
                    <circle cx="170" cy="160" r="8" fill="none" stroke={isDark ? '#94a3b8' : '#8b7a6a'} strokeWidth="2" />
                    {/* Legs */}
                    <line x1="85" y1="185" x2="80" y2="310" stroke={isDark ? '#94a3b8' : '#8b7a6a'} strokeWidth="3" />
                    <line x1="115" y1="185" x2="120" y2="310" stroke={isDark ? '#94a3b8' : '#8b7a6a'} strokeWidth="3" />
                    {/* Feet */}
                    <ellipse cx="80" cy="320" rx="12" ry="6" fill="none" stroke={isDark ? '#94a3b8' : '#8b7a6a'} strokeWidth="2" />
                    <ellipse cx="120" cy="320" rx="12" ry="6" fill="none" stroke={isDark ? '#94a3b8' : '#8b7a6a'} strokeWidth="2" />
                  </svg>

                  {/* Equipment Slots */}
                  {Object.entries(EQUIPMENT_SLOTS).map(([slotId, slot]) => (
                    <EquipmentSlot
                      key={slotId}
                      slotId={slotId}
                      slot={slot}
                      equippedItem={equipped[slotId]}
                      onDrop={handleEquip}
                      onUnequip={handleUnequip}
                      theme={theme}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Inventory */}
            <div
              className="w-96 border-l flex flex-col"
              style={{
                background: isDark
                  ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))'
                  : 'linear-gradient(to bottom, rgba(235, 225, 210, 0.6), rgba(240, 232, 218, 0.8))',
                borderColor: isDark
                  ? 'rgba(148, 163, 184, 0.2)'
                  : 'rgba(139, 92, 46, 0.15)'
              }}
            >
              {/* Search */}
              <div className="p-6 border-b" style={{
                borderColor: isDark
                  ? 'rgba(148, 163, 184, 0.2)'
                  : 'rgba(139, 92, 46, 0.15)'
              }}>
                <h3
                  className="text-xl font-bold mb-4"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: isDark ? '#e2e8f0' : '#3d2f24'
                  }}
                >
                  📦 Inventory
                </h3>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg transition-all"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    background: isDark
                      ? 'rgba(15, 23, 42, 0.8)'
                      : 'rgba(255, 255, 255, 0.8)',
                    border: isDark
                      ? '1px solid rgba(148, 163, 184, 0.3)'
                      : '1px solid rgba(139, 92, 46, 0.25)',
                    color: isDark ? '#e2e8f0' : '#3d2f24'
                  }}
                />
              </div>

              {/* Inventory Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {filteredInventory.length === 0 ? (
                    <p
                      className="text-center text-sm italic opacity-60 mt-8"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: isDark ? '#94a3b8' : '#8b7a6a'
                      }}
                    >
                      {searchTerm ? 'No items found' : 'Inventory is empty'}
                    </p>
                  ) : (
                    filteredInventory.map((item, index) => (
                      <DraggableInventoryItem
                        key={`${item.name}-${index}`}
                        item={item}
                        index={index}
                        theme={theme}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                className="p-4 border-t text-center"
                style={{
                  borderColor: isDark
                    ? 'rgba(148, 163, 184, 0.2)'
                    : 'rgba(139, 92, 46, 0.15)',
                  background: isDark
                    ? 'rgba(15, 23, 42, 0.6)'
                    : 'rgba(245, 238, 223, 0.6)'
                }}
              >
                <p
                  className="text-xs opacity-70"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isDark ? '#94a3b8' : '#8b7a6a'
                  }}
                >
                  Drag items to equipment slots
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
