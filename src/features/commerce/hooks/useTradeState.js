/**
 * useTradeState.js - Custom hook for managing TradeModal state
 *
 * Consolidates all state management for the trade modal:
 * - Tab navigation
 * - Merchant selection
 * - Item selection (buying and selling)
 * - Haggling/negotiation
 * - Dark mode detection
 */

import { useState, useEffect } from 'react';

const MERCHANT_TYPES = {
  MARKET_VENDOR: {
    id: 'market_vendor',
    name: 'Market Vendor',
    languages: ['spanish'],
    personality: 'practical',
    haggleResistance: 0.5,
    portrait: '/portraits/merchant_market.jpg'
  }
};

/**
 * Custom hook for managing trade modal state
 * @param {string} mode - Modal mode: 'market' | 'npc' | 'inventory'
 * @param {Object} tradingNPC - NPC data when in 'npc' mode
 * @param {string} initialTab - Optional tab to preselect (overrides mode-based default)
 * @returns {Object} State and setters for trade modal
 */
export function useTradeState(mode = 'market', tradingNPC = null, initialTab = null) {
  // Determine initial tab based on mode (or use explicit initialTab if provided)
  const getInitialTab = () => {
    // If explicit initialTab provided, use it
    if (initialTab) return initialTab;

    // Otherwise fall back to mode-based logic
    if (mode === 'inventory') return 'full-inventory';
    if (mode === 'npc') {
      if (tradingNPC?.type === 'buy') return 'sell-to-npc';
      if (tradingNPC?.type === 'sell') return 'buy-from-npc';
      return 'sell-to-npc';
    }
    return 'market';
  };

  // Tab state
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Merchant state
  const [selectedMerchant, setSelectedMerchant] = useState(
    (mode === 'npc' || mode === 'merchant') && tradingNPC
      ? {
          id: tradingNPC.id || tradingNPC.npcId || 'npc',
          name: tradingNPC.name || tradingNPC.npcName || 'NPC',
          shopName: tradingNPC.shopName,
          merchantType: tradingNPC.merchantType,
          languages: ['spanish'],
          personality: 'friendly',
          haggleResistance: 0.5,
          portrait: tradingNPC.portrait || tradingNPC.npcPortrait || '/portraits/default_npc.jpg'
        }
      : MERCHANT_TYPES.MARKET_VENDOR
  );

  // Market buying state
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [offeredPrice, setOfferedPrice] = useState(0);
  const [isHaggling, setIsHaggling] = useState(false);
  const [merchantResponse, setMerchantResponse] = useState(null);
  const [isFetchingItems, setIsFetchingItems] = useState(false);
  const [relationshipLevel, setRelationshipLevel] = useState(50);

  // NPC selling state
  const [selectedSellItem, setSelectedSellItem] = useState(null);
  const [proposedSellPrice, setProposedSellPrice] = useState(0);
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [isNegotiating, setIsNegotiating] = useState(false);

  // NPC buying state
  const [selectedBuyItem, setSelectedBuyItem] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);

  // Filter state
  const [medicineTypeFilter, setMedicineTypeFilter] = useState('all');

  // Dark mode detection
  const [isDarkMode, setIsDarkMode] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  // Reset state when mode or initialTab changes
  useEffect(() => {
    setActiveTab(getInitialTab());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tradingNPC?.type, initialTab]);

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Merchant state
    selectedMerchant,
    setSelectedMerchant,

    // Market buying state
    availableItems,
    setAvailableItems,
    selectedItem,
    setSelectedItem,
    offeredPrice,
    setOfferedPrice,
    isHaggling,
    setIsHaggling,
    merchantResponse,
    setMerchantResponse,
    isFetchingItems,
    setIsFetchingItems,
    relationshipLevel,
    setRelationshipLevel,

    // NPC selling state
    selectedSellItem,
    setSelectedSellItem,
    proposedSellPrice,
    setProposedSellPrice,
    negotiationHistory,
    setNegotiationHistory,
    isNegotiating,
    setIsNegotiating,

    // NPC buying state
    selectedBuyItem,
    setSelectedBuyItem,
    buyQuantity,
    setBuyQuantity,

    // Filter state
    medicineTypeFilter,
    setMedicineTypeFilter,

    // UI state
    isDarkMode,
    setIsDarkMode
  };
}
