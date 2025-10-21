import React, { useState } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { useLongPress } from '../hooks/useLongPress';
import './TapToSelect.css';

/**
 * Tap To Select Component
 *
 * Mobile-friendly alternative to drag-and-drop
 * Features:
 * - Tap to select/deselect items
 * - Long press for context menu
 * - Visual selection state
 * - Multi-select mode
 * - Haptic feedback
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Content to render
 * @param {boolean} props.isSelected - Whether item is selected
 * @param {Function} props.onSelect - Select callback (item) => void
 * @param {Function} props.onDeselect - Deselect callback (item) => void
 * @param {Function} props.onLongPress - Long press callback (item) => void
 * @param {*} props.item - Item data
 * @param {boolean} props.disabled - Disable interaction
 * @param {boolean} props.enableHaptics - Enable haptic feedback (default: true)
 * @param {boolean} props.showCheckmark - Show checkmark when selected (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const TapToSelect = ({
  children,
  isSelected = false,
  onSelect,
  onDeselect,
  onLongPress,
  item,
  disabled = false,
  enableHaptics = true,
  showCheckmark = true,
  className = ''
}) => {
  const [isPressing, setIsPressing] = useState(false);

  // Long press handlers
  const longPressHandlers = useLongPress(
    (e) => {
      if (disabled) return;
      if (onLongPress) {
        onLongPress(item, e);
      }
    },
    {
      threshold: 500,
      enableHaptics,
      hapticType: 'heavy',
      onStart: () => setIsPressing(true),
      onFinish: () => setIsPressing(false),
      onCancel: () => setIsPressing(false)
    }
  );

  const handleTap = (e) => {
    if (disabled) return;

    // Don't trigger tap if long press was triggered
    if (isPressing) return;

    // Trigger haptic feedback
    if (enableHaptics) {
      triggerHaptic('selection');
    }

    // Toggle selection
    if (isSelected) {
      if (onDeselect) {
        onDeselect(item, e);
      }
    } else {
      if (onSelect) {
        onSelect(item, e);
      }
    }
  };

  return (
    <div
      className={`tap-to-select ${
        isSelected ? 'tap-to-select--selected' : ''
      } ${isPressing ? 'tap-to-select--pressing' : ''} ${
        disabled ? 'tap-to-select--disabled' : ''
      } ${className}`}
      onClick={handleTap}
      {...longPressHandlers}
    >
      {/* Selection Checkmark */}
      {showCheckmark && isSelected && (
        <div className="tap-to-select__checkmark" aria-hidden="true">
          ✓
        </div>
      )}

      {/* Content */}
      <div className="tap-to-select__content">{children}</div>

      {/* Selection Overlay */}
      {isSelected && (
        <div className="tap-to-select__overlay" aria-hidden="true" />
      )}
    </div>
  );
};

/**
 * Tap To Select Manager Hook
 * Manages multi-select state
 *
 * @param {Array} initialSelected - Initially selected items
 * @returns {Object} Selection state and handlers
 *
 * @example
 * const {
 *   selectedItems,
 *   isSelected,
 *   selectItem,
 *   deselectItem,
 *   toggleItem,
 *   clearSelection,
 *   selectAll
 * } = useTapToSelectManager();
 */
export function useTapToSelectManager(initialSelected = []) {
  const [selectedItems, setSelectedItems] = useState(initialSelected);

  const isSelected = (item) => {
    return selectedItems.some((selected) => selected.id === item.id);
  };

  const selectItem = (item) => {
    setSelectedItems((prev) => [...prev, item]);
  };

  const deselectItem = (item) => {
    setSelectedItems((prev) =>
      prev.filter((selected) => selected.id !== item.id)
    );
  };

  const toggleItem = (item) => {
    if (isSelected(item)) {
      deselectItem(item);
    } else {
      selectItem(item);
    }
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const selectAll = (items) => {
    setSelectedItems(items);
  };

  return {
    selectedItems,
    isSelected,
    selectItem,
    deselectItem,
    toggleItem,
    clearSelection,
    selectAll
  };
}

export default TapToSelect;
