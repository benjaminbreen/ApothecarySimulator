/**
 * TradeModal - Modern Trading Interface (ReputationModal Style)
 *
 * Features:
 * - Skill-based pricing (Bargaining, Languages, Etiquette, Reputation)
 * - Haggling mini-game (unlocked at Bargaining 1+)
 * - Multiple merchant types with personalities
 * - Relationship tracking for repeat customers
 * - Black market tab (Bargaining 5+)
 * - Investment tab (Bookkeeping 5+)
 * - NPC trade negotiation with LLM
 * - Clean tabbed interface matching ReputationModal aesthetic
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createChatCompletion } from '../../../core/services/llmService';
import { FACTIONS } from '../../../core/systems/reputationSystem';
import { getItemRarity, getRarityColors } from '../../../core/systems/itemRarity';
import { getAllPersonalItems } from '../../../core/systems/personalEffects';
import { negotiateSale } from '../services/tradeNegotiationService';
import { calculateSkillBonuses, calculateReputationModifier, calculateFinalPrice } from '../utils/pricingUtils';
import CircularRelationshipMeter from './CircularRelationshipMeter';
import BonusCard from './BonusCard';
import InfoCard from './InfoCard';
import ItemRow from './ItemRow';
import NegotiationPanel from './NegotiationPanel';
import { getAllMedicineTypes, inferMedicineType } from '../../../core/config/medicineCategories';
import InventoryShelfDisplay from '../../inventory/components/InventoryShelfDisplay';
import { useTradeState } from '../hooks/useTradeState';
import NPCSellTab from './NPCSellTab';
import NPCBuyTab from './NPCBuyTab';
import InvestmentsTab from './InvestmentsTab';
import TransactionHistoryTab from './TransactionHistoryTab';

// Merchant archetypes with personalities and languages
const MERCHANT_TYPES = {
  MARKET_VENDOR: {
    id: 'market_vendor',
    name: 'Market Vendor',
    languages: ['spanish'],
    personality: 'practical',
    haggleResistance: 0.5,
    portrait: '/portraits/merchant_market.jpg'
  },
  INDIGENOUS_TRADER: {
    id: 'indigenous_trader',
    name: 'Indigenous Trader',
    languages: ['nahuatl', 'spanish'],
    personality: 'traditional',
    haggleResistance: 0.3,
    portrait: '/portraits/merchant_indigenous.jpg'
  },
  FOREIGN_MERCHANT: {
    id: 'foreign_merchant',
    name: 'French Merchant',
    languages: ['french', 'spanish'],
    personality: 'sophisticated',
    haggleResistance: 0.7,
    portrait: '/portraits/merchant_foreign.jpg'
  },
  BLACK_MARKET: {
    id: 'black_market',
    name: 'Black Market Dealer',
    languages: ['spanish', 'portuguese'],
    personality: 'suspicious',
    haggleResistance: 0.9,
    portrait: '/portraits/merchant_black_market.jpg'
  }
};

export default function TradeModal({
  isOpen,
  onClose,
  gameState,
  updateInventory,
  setHistoryOutput,
  currentWealth,
  handleWealthChange,
  addJournalEntry,
  conversationHistory,
  handleTurnEnd,
  reputation,
  transactionManager,
  TRANSACTION_CATEGORIES,
  playerSkills,
  awardXP,
  awardSkillXP,
  // NPC Trade props
  mode = 'market', // 'market' | 'npc' | 'inventory'
  tradingNPC = null, // NPC data when mode is 'npc'
  initialViewMode = 'shelf', // 'shelf' | 'list' - for inventory mode
  preselectedTab = null, // Optional tab to preselect (e.g., 'investments')
  // Investment props
  activeInvestments = [],
  setActiveInvestments
}) {
  // Use custom hook for all state management
  const {
    activeTab,
    setActiveTab,
    selectedMerchant,
    setSelectedMerchant,
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
    selectedSellItem,
    setSelectedSellItem,
    proposedSellPrice,
    setProposedSellPrice,
    negotiationHistory,
    setNegotiationHistory,
    isNegotiating,
    setIsNegotiating,
    selectedBuyItem,
    setSelectedBuyItem,
    buyQuantity,
    setBuyQuantity,
    medicineTypeFilter,
    setMedicineTypeFilter,
    isDarkMode
  } = useTradeState(mode, tradingNPC, preselectedTab);

  // Generate cache key for merchant inventory (refreshes daily)
  const getMerchantCacheKey = () => {
    const merchantId = selectedMerchant.id;
    const date = gameState?.date || 'default';
    return `merchant_inventory_${merchantId}_${date}`;
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Calculate skill bonuses using utility function
  const skillBonuses = useMemo(() => {
    return calculateSkillBonuses(
      playerSkills,
      selectedMerchant,
      relationshipLevel,
      gameState,
      selectedItem
    );
  }, [playerSkills, selectedMerchant, relationshipLevel, gameState, selectedItem]);

  // Calculate reputation modifier using utility function
  const reputationModifier = useMemo(() => {
    return calculateReputationModifier(reputation);
  }, [reputation]);

  // Separate materia medica from other items for NPC trading
  const materiaMedicaItems = useMemo(() => {
    if (!gameState.inventory) return [];
    return gameState.inventory.filter(item => {
      // Exclude clothing, misc, tools, weapons
      if (item.entityType === 'clothing' || item.type === 'clothing') return false;
      if (item.entityType === 'misc' || item.type === 'misc' || item.type === 'tool' || item.type === 'weapon') return false;
      return true;
    });
  }, [gameState.inventory]);

  const otherItems = useMemo(() => {
    if (!gameState.inventory) return [];
    return gameState.inventory.filter(item => {
      if (item.entityType === 'clothing' || item.type === 'clothing') return true;
      if (item.entityType === 'misc' || item.type === 'misc' || item.type === 'tool' || item.type === 'weapon') return true;
      return false;
    });
  }, [gameState.inventory]);

  // Filter materia medica by type
  const filteredMateriaMedica = useMemo(() => {
    if (medicineTypeFilter === 'all') {
      return materiaMedicaItems;
    }
    return materiaMedicaItems.filter(item => {
      const itemType = inferMedicineType(item);
      return itemType === medicineTypeFilter;
    });
  }, [materiaMedicaItems, medicineTypeFilter]);

  // Count by type
  const medicineCountsByType = useMemo(() => {
    const counts = { all: materiaMedicaItems.length };
    getAllMedicineTypes().forEach(type => {
      counts[type.id] = materiaMedicaItems.filter(item => inferMedicineType(item) === type.id).length;
    });
    return counts;
  }, [materiaMedicaItems]);

  // Get final price with all modifiers using utility function
  const getFinalPrice = (basePrice) => {
    return calculateFinalPrice(basePrice, skillBonuses.total, reputationModifier);
  };

  // Fetch items from LLM (with caching)
  useEffect(() => {
    const fetchItems = async () => {
      if (!isOpen) return;

      const cacheKey = getMerchantCacheKey();

      // Check cache first
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          console.log(`[TradeModal] Using cached inventory for ${selectedMerchant.name} (${cachedData.length} items)`);
          setAvailableItems(cachedData);
          setIsFetchingItems(false);
          return;
        }
      } catch (error) {
        console.warn('[TradeModal] Cache read error:', error);
      }

      // Cache miss - generate new inventory
      setIsFetchingItems(true);
      const previousContext = conversationHistory[conversationHistory.length - 1]?.content || '';

      // Adjust prompt based on merchant type
      const merchantContext = selectedMerchant.id === 'black_market'
        ? 'rare, illegal, or contraband items'
        : selectedMerchant.id === 'indigenous_trader'
        ? 'traditional Indigenous medicines, local herbs, and natural ingredients'
        : selectedMerchant.id === 'foreign_merchant'
        ? 'exotic imported goods, spices, and luxury items'
        : 'common market goods, basic medicines, and everyday ingredients';

      const prompt = `
        You are generating items for sale by a ${selectedMerchant.name} in 1680 Mexico City.
        This merchant specializes in ${merchantContext}.

        Previous context:
        "${previousContext}"

        Generate a list of 6-10 items for sale. Each item should include:
        1. **name**: The item's name (be specific, not generic)
        2. **description**: Brief description (1-2 sentences)
        3. **origin**: Specific origin location
        4. **price**: Price in reales (integer, ranging from 1-20)
        5. **emoji**: Appropriate emoji
        6. **rarity**: 'common', 'uncommon', 'rare', or 'legendary'
        7. **quantity**: How many of this item the merchant has in stock (integer, 1-5 for rare items, 5-20 for common)

        Example:
        [
          {
            "name": "Yucatan Honey",
            "description": "Golden honey harvested from wild bees. Excellent for sweetening medicines.",
            "origin": "Yucatan Peninsula",
            "price": 3,
            "emoji": "🍯",
            "rarity": "common",
            "quantity": 15
          }
        ]

        IMPORTANT: Return ONLY valid JSON array. No backticks, no additional text.
      `;

      try {
        const response = await createChatCompletion([
          { role: 'system', content: 'You are a historical item generator for a trading system. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ], 0.3, 2000, { type: 'json_object' });

        let generatedItems;
        try {
          generatedItems = JSON.parse(response.choices[0].message.content);
        } catch {
          const jsonMatch = response.choices[0].message.content.match(/\[.*?\]/s);
          generatedItems = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        }

        // Ensure each item has a quantity (default to 10 if missing)
        generatedItems = generatedItems.map(item => ({
          ...item,
          quantity: item.quantity || 10
        }));

        // Cache the generated inventory
        try {
          localStorage.setItem(cacheKey, JSON.stringify(generatedItems));
          console.log(`[TradeModal] Cached ${generatedItems.length} items for ${selectedMerchant.name}`);
        } catch (error) {
          console.warn('[TradeModal] Cache write error:', error);
        }

        setAvailableItems(generatedItems);
      } catch (error) {
        console.error('[TradeModal] Error fetching items:', error);
        setAvailableItems([]);
      } finally {
        setIsFetchingItems(false);
      }
    };

    fetchItems();
    // FIXED: Only depend on isOpen and selectedMerchant - NOT currentWealth or conversationHistory
  }, [isOpen, selectedMerchant.id, gameState?.date]);

  // Handle purchase
  const handlePurchase = async (finalPrice) => {
    if (!selectedItem) return;
    if (currentWealth < finalPrice) {
      setMerchantResponse({ type: 'error', text: 'Not enough wealth to purchase this item.' });
      return;
    }

    const updatedWealth = currentWealth - finalPrice;
    handleWealthChange(updatedWealth);
    updateInventory(selectedItem.name, 1);

    // Log transaction
    if (transactionManager && TRANSACTION_CATEGORIES) {
      transactionManager.logTransaction(
        'expense',
        TRANSACTION_CATEGORIES.INGREDIENTS,
        `Purchased ${selectedItem.name} from ${selectedMerchant.name}`,
        finalPrice,
        updatedWealth,
        gameState.date,
        gameState.time
      );
    }

    // Improve relationship slightly
    setRelationshipLevel(prev => Math.min(100, prev + 2));

    const responseText = `The ${selectedMerchant.name.toLowerCase()} accepts your offer of ${finalPrice} reales for ${selectedItem.name}. **Item added to inventory.**`;
    setHistoryOutput(responseText);
    addJournalEntry(`Purchased ${selectedItem.name} for ${finalPrice} reales.`);

    // Award XP for commerce (+1 XP)
    if (typeof awardXP === 'function') {
      awardXP(1, `commerce_purchase_${selectedItem.name}`);
    }

    // Award bargaining skill XP
    if (typeof awardSkillXP === 'function') {
      awardSkillXP('bargaining', 2);
    }

    await handleTurnEnd(responseText);

    setSelectedItem(null);
    setIsHaggling(false);
  };

  // Handle haggling
  const handleHaggle = async () => {
    if (!selectedItem || offeredPrice <= 0) return;

    const fairPrice = getFinalPrice(selectedItem.price);
    const bargainingLevel = playerSkills?.knownSkills?.bargaining?.level || 0;

    if (bargainingLevel === 0) {
      setMerchantResponse({ type: 'error', text: 'You need Bargaining skill to haggle.' });
      return;
    }

    // Calculate success chance
    const priceRatio = offeredPrice / fairPrice;
    const skillBonus = bargainingLevel * 0.1; // 10% bonus per level
    const relationshipBonus = (relationshipLevel - 50) / 200; // -25% to +25%
    const baseChance = 0.5;

    let successChance = baseChance + skillBonus + relationshipBonus;

    // Adjust based on how far from fair price
    if (priceRatio < 0.7) successChance -= 0.3; // Very low offer
    else if (priceRatio < 0.85) successChance -= 0.1; // Low offer
    else if (priceRatio >= 0.95) successChance += 0.2; // Close to fair

    const success = Math.random() < successChance;

    if (success) {
      // Accept the haggle
      setRelationshipLevel(prev => Math.min(100, prev + 5));
      await handlePurchase(offeredPrice);
    } else {
      // Reject and lower relationship
      setRelationshipLevel(prev => Math.max(0, prev - 3));
      setMerchantResponse({
        type: 'reject',
        text: `The ${selectedMerchant.name.toLowerCase()} scoffs at your offer of ${offeredPrice} reales. "That's insulting! The price is ${fairPrice} reales."`
      });
    }

    setIsHaggling(false);
  };

  // NPC Sell: Handle item selection
  const handleSelectSellItem = (item) => {
    setSelectedSellItem(item);
    setNegotiationHistory([]);
    setIsNegotiating(false);

    // Calculate suggested price (base price with bonuses applied)
    const basePrice = item.price || item.value || 10;
    const suggestedPrice = getFinalPrice(basePrice);
    setProposedSellPrice(suggestedPrice);
  };

  // NPC Sell: Handle price proposal
  const handleProposeSellPrice = async (proposedPrice) => {
    if (!selectedSellItem || proposedPrice <= 0) return;

    setIsNegotiating(true);

    try {
      const fairPrice = getFinalPrice(selectedSellItem.price || selectedSellItem.value || 10);

      // Use LLM-based negotiation service
      const result = await negotiateSale({
        npc: selectedMerchant,
        item: selectedSellItem,
        proposedPrice,
        fairPrice,
        relationshipLevel,
        previousHistory: negotiationHistory,
        playerSkills,
        scenarioContext: '1680 Mexico City'
      });

      if (result.accepted) {
        // NPC accepts the price
        const updatedWealth = currentWealth + proposedPrice;
        handleWealthChange(updatedWealth);

        // Remove item from inventory
        updateInventory(selectedSellItem.name, -1);

        // Log transaction
        if (transactionManager && TRANSACTION_CATEGORIES) {
          transactionManager.logTransaction(
            'income',
            TRANSACTION_CATEGORIES.COMMERCE,
            `Sold ${selectedSellItem.name} to ${selectedMerchant.name}`,
            proposedPrice,
            updatedWealth,
            gameState.date,
            gameState.time
          );
        }

        // Update relationship
        setRelationshipLevel(prev => Math.min(100, Math.max(0, prev + result.relationshipChange)));

        const responseText = `${result.dialogue}\n\n**Item sold for ${proposedPrice} reales. Wealth increased.**`;
        setHistoryOutput(responseText);
        addJournalEntry(`Sold ${selectedSellItem.name} for ${proposedPrice} reales to ${selectedMerchant.name}.`);

        // Award XP
        if (typeof awardXP === 'function') {
          awardXP(1, `commerce_sell_${selectedSellItem.name}`);
        }
        if (typeof awardSkillXP === 'function') {
          awardSkillXP('bargaining', 2);
        }

        await handleTurnEnd(responseText);

        // Clear selection
        setSelectedSellItem(null);
        setNegotiationHistory([]);
      } else {
        // NPC rejects - add to history
        const newHistory = [
          ...negotiationHistory,
          {
            speaker: 'You',
            text: `I'm asking ${proposedPrice} reales for this ${selectedSellItem.name}.`
          },
          {
            speaker: selectedMerchant.name,
            text: result.dialogue
          }
        ];
        setNegotiationHistory(newHistory);

        // Update suggested price to counter-offer if provided
        if (result.counterOffer) {
          setProposedSellPrice(result.counterOffer);
        }

        // Update relationship
        setRelationshipLevel(prev => Math.min(100, Math.max(0, prev + result.relationshipChange)));
      }
    } catch (error) {
      console.error('[TradeModal] Negotiation failed:', error);
      // Show error message
      setNegotiationHistory([
        ...negotiationHistory,
        {
          speaker: 'System',
          text: 'Negotiation failed due to a technical issue. Please try again.'
        }
      ]);
    }

    setIsNegotiating(false);
  };

  // NPC Sell: Cancel negotiation
  const handleCancelSellNegotiation = () => {
    setSelectedSellItem(null);
    setNegotiationHistory([]);
    setIsNegotiating(false);
  };

  // NPC Buy: Handle item selection
  const handleSelectBuyItem = (item) => {
    setSelectedBuyItem(item);
    setBuyQuantity(1);
  };

  // NPC Buy: Handle purchase
  const handleBuyFromNPC = async () => {
    if (!selectedBuyItem || buyQuantity <= 0) return;

    const totalCost = (selectedBuyItem.price || 10) * buyQuantity;

    if (currentWealth < totalCost) {
      setMerchantResponse({ type: 'error', text: 'Not enough wealth to purchase this item.' });
      return;
    }

    // Check if NPC has enough quantity
    if (selectedBuyItem.quantity && buyQuantity > selectedBuyItem.quantity) {
      setMerchantResponse({ type: 'error', text: `${selectedMerchant.name} only has ${selectedBuyItem.quantity} of this item.` });
      return;
    }

    // Process purchase
    const updatedWealth = currentWealth - totalCost;
    handleWealthChange(updatedWealth);
    updateInventory(selectedBuyItem.name, buyQuantity);

    // Log transaction
    if (transactionManager && TRANSACTION_CATEGORIES) {
      transactionManager.logTransaction(
        'expense',
        TRANSACTION_CATEGORIES.INGREDIENTS,
        `Purchased ${buyQuantity}x ${selectedBuyItem.name} from ${selectedMerchant.name}`,
        totalCost,
        updatedWealth,
        gameState.date,
        gameState.time
      );
    }

    // Improve relationship
    setRelationshipLevel(prev => Math.min(100, prev + 2));

    const responseText = `${selectedMerchant.name} sells you ${buyQuantity}x ${selectedBuyItem.name} for ${totalCost} reales. **Items added to inventory.**`;
    setHistoryOutput(responseText);
    addJournalEntry(`Purchased ${buyQuantity}x ${selectedBuyItem.name} for ${totalCost} reales.`);

    // Award XP
    if (typeof awardXP === 'function') {
      awardXP(1, `commerce_buy_from_npc_${selectedBuyItem.name}`);
    }
    if (typeof awardSkillXP === 'function') {
      awardSkillXP('bargaining', 1);
    }

    await handleTurnEnd(responseText);

    // Update NPC's available quantity (if applicable)
    // Note: This requires modifying tradingNPC.offering.items
    // For now, just clear selection
    setSelectedBuyItem(null);
    setBuyQuantity(1);
  };

  // NPC Buy: Cancel selection
  const handleCancelBuy = () => {
    setSelectedBuyItem(null);
    setBuyQuantity(1);
  };

  // Check if tabs are unlocked
  const hasBlackMarketAccess = (playerSkills?.knownSkills?.bargaining?.level || 0) >= 5;

  // Investments require Bookkeeping 5+ AND being at El Consulado
  const hasBookkeepingSkill = (playerSkills?.knownSkills?.bookkeeping?.level || 0) >= 5;
  const isAtConsulado = gameState?.currentMapId === 'consulado-interior';
  const hasInvestmentAccess = hasBookkeepingSkill && isAtConsulado;

  // Check if at market location
  const isAtMarket = gameState?.location?.toLowerCase().includes('market') ||
                     gameState?.location?.toLowerCase().includes('mercado') ||
                     gameState?.currentMapId === 'mercado-interior';

  // Check if NPC is present for trading
  const hasNPC = tradingNPC !== null && tradingNPC !== undefined;

  if (!isOpen) return null;

  const isDark = document.documentElement.classList.contains('dark');

  // Always show all tabs - availability determined by context
  const tabs = [
    // NPC Trade Tabs (only if NPC present)
    ...(hasNPC ? [
      { id: 'sell-to-npc', label: `Sell to ${selectedMerchant.name}`, icon: '💰', unlocked: true },
      { id: 'buy-from-npc', label: `Buy from ${selectedMerchant.name}`, icon: '🛒', unlocked: true },
    ] : []),
    // Standard Tabs (always visible, but market requires location)
    { id: 'market', label: 'Market', icon: '🏪', unlocked: isAtMarket },
    { id: 'black_market', label: 'Black Market', icon: '🎭', unlocked: hasBlackMarketAccess },
    { id: 'investments', label: 'Investments', icon: '💰', unlocked: hasInvestmentAccess },
    { id: 'full-inventory', label: 'Inventory', icon: '📦', unlocked: true },
    { id: 'history', label: 'History', icon: '📜', unlocked: true }
  ];

  return (
    <div
      className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4"
      style={{
        background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(41, 37, 36, 0.5)'
      }}
      onClick={onClose}
    >
      {/* Modal Container - Responsive: Full screen on mobile */}
      <div
        className={`relative w-full h-screen sm:h-[85vh] rounded-none sm:rounded-2xl overflow-hidden flex flex-col shadow-elevation-4 transition-all duration-300 ${
          activeTab === 'full-inventory' || activeTab === 'history' ? 'max-w-full sm:max-w-7xl' : 'max-w-full sm:max-w-5xl'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 1.0) 0%, rgba(30, 41, 59, 1.0) 50%, rgba(15, 23, 42, 1.0) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.95) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: isDark
            ? '0 24px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
            : '0 24px 80px rgba(61, 47, 36, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* Decorative Background Gradient */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: '50%',
            height: '70%',
            zIndex: 0,
            overflow: 'hidden',
            opacity: 0.15,
            background: 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.3) 0%, transparent 70%)'
          }}
        />

        {/* Close Button - Floating */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 p-2 rounded-lg transition-all duration-150"
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            border: isDark ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
            boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(243, 244, 246, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke={isDark ? '#fbbf24' : '#3d2817'} viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tab Navigation */}
        <div
          className="flex-shrink-0 flex border-b relative z-10"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
              : 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
            borderColor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(209, 213, 219, 0.3)'
          }}
        >
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const isLocked = !tab.unlocked;

            // Tooltip logic for locked tabs
            let tooltipText = '';
            if (tab.id === 'market' && isLocked) {
              tooltipText = 'Visit a marketplace to buy goods';
            } else if (tab.id === 'black_market' && isLocked) {
              tooltipText = 'Requires Bargaining Level 5+';
            } else if (tab.id === 'investments' && isLocked) {
              if (!hasBookkeepingSkill) {
                tooltipText = 'Requires Bookkeeping Level 5+';
              } else if (!isAtConsulado) {
                tooltipText = 'Visit El Consulado de Mercaderes to make investments';
              }
            } else if (isLocked) {
              tooltipText = 'Locked';
            }

            return (
              <button
                key={tab.id}
                onClick={() => !isLocked && setActiveTab(tab.id)}
                disabled={isLocked}
                title={tooltipText}
                className={`flex-1 px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative font-sans ${
                  isLocked ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                style={{
                  fontWeight: isActive ? 700 : 600,
                  letterSpacing: '0.08em',
                  color: isActive
                    ? (isDark ? '#fbbf24' : '#10b981')
                    : (isDark ? '#a8a29e' : '#6b5a47'),
                  background: isActive
                    ? (isDark
                      ? 'linear-gradient(to bottom, rgba(51, 65, 85, 0.9), rgba(30, 41, 59, 0.8))'
                      : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))')
                    : 'transparent',
                  borderLeft: idx > 0
                    ? (isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.2)')
                    : 'none'
                }}
              >
                <span className="mr-2 text-base" style={{ opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
                {tab.label}
                {isLocked && <span className="ml-2">🔒</span>}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: isDark
                        ? 'linear-gradient(to right, #fbbf24, #f59e0b, #fbbf24)'
                        : 'linear-gradient(to right, #10b981, #059669, #10b981)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area - Scrollable */}
        <div
          className="flex-1 overflow-y-auto custom-scrollbar relative z-10"
          style={{
            background: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(252, 250, 247, 0.4)'
          }}
        >
          {/* Inventory Mode Content - Shelf Display */}
          {activeTab === 'full-inventory' && (
            <InventoryShelfDisplay
              gameState={gameState}
              isDark={isDark}
              initialViewMode={initialViewMode}
            />
          )}

          {/* History Tab Content */}
          {activeTab === 'history' && (
            <TransactionHistoryTab
              transactionManager={transactionManager}
              isDark={isDark}
            />
          )}

          {/* Investments Tab Content */}
          {activeTab === 'investments' && (
            <InvestmentsTab
              activeInvestments={activeInvestments}
              setActiveInvestments={setActiveInvestments}
              isDark={isDark}
              gameState={gameState}
              playerSkills={playerSkills}
              reputation={reputation}
              currentWealth={currentWealth}
              handleWealthChange={handleWealthChange}
              addJournalEntry={addJournalEntry}
              awardSkillXP={awardSkillXP}
            />
          )}

          {/* NPC Trade Content (shown when NPC is present) */}
          {hasNPC && (
            <div className="h-full flex flex-col">
              {activeTab === 'sell-to-npc' && (
                <NPCSellTab
                  relationshipLevel={relationshipLevel}
                  selectedMerchant={selectedMerchant}
                  skillBonuses={skillBonuses}
                  tradingNPC={tradingNPC}
                  isDark={isDark}
                  medicineTypeFilter={medicineTypeFilter}
                  setMedicineTypeFilter={setMedicineTypeFilter}
                  materiaMedicaItems={materiaMedicaItems}
                  medicineCountsByType={medicineCountsByType}
                  filteredMateriaMedica={filteredMateriaMedica}
                  otherItems={otherItems}
                  selectedSellItem={selectedSellItem}
                  proposedSellPrice={proposedSellPrice}
                  negotiationHistory={negotiationHistory}
                  isNegotiating={isNegotiating}
                  handleSelectSellItem={handleSelectSellItem}
                  handleProposeSellPrice={handleProposeSellPrice}
                  handleCancelSellNegotiation={handleCancelSellNegotiation}
                />
              )}
              {activeTab === 'buy-from-npc' && (
                <NPCBuyTab
                  relationshipLevel={relationshipLevel}
                  selectedMerchant={selectedMerchant}
                  skillBonuses={skillBonuses}
                  tradingNPC={tradingNPC}
                  isDark={isDark}
                  selectedBuyItem={selectedBuyItem}
                  buyQuantity={buyQuantity}
                  setBuyQuantity={setBuyQuantity}
                  currentWealth={currentWealth}
                  handleSelectBuyItem={handleSelectBuyItem}
                  handleBuyFromNPC={handleBuyFromNPC}
                  handleCancelBuy={handleCancelBuy}
                />
              )}
            </div>
          )}

          {/* Market Tab Content */}
          {activeTab === 'market' && (
            <div className="p-8 space-y-6">
              {/* Relationship Meter */}
              <CircularRelationshipMeter
                value={relationshipLevel}
                merchantName={selectedMerchant.name}
              />

              {/* Bonus Cards Grid */}
              {skillBonuses.breakdown.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ink-600 dark:text-amber-400 mb-3 font-sans">
                    Your Trading Bonuses
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {skillBonuses.breakdown.map((bonus, idx) => {
                      // Map bonus names to component types
                      const typeMap = {
                        'Bargaining': 'bargaining',
                        'Language': 'language',
                        'Etiquette': 'etiquette',
                        'Herbalist': 'profession',
                        'Court Physician': 'profession',
                        'Relationship': 'relationship'
                      };
                      return (
                        <BonusCard
                          key={idx}
                          name={bonus.name}
                          level={bonus.level}
                          value={bonus.value}
                          type={typeMap[bonus.name] || 'bargaining'}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items Section */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink-600 dark:text-amber-400 mb-3 font-sans">
                  Items for Sale
                </h3>
                {isFetchingItems ? (
                  <div className="flex items-center justify-center py-12">
                    <div className={`text-lg font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Loading items for sale...
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {availableItems.map((item, idx) => {
                const rarity = getItemRarity(item);
                const colors = getRarityColors(rarity);
                const finalPrice = getFinalPrice(item.price);
                const hasDiscount = finalPrice < item.price;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedItem(item);
                      setOfferedPrice(finalPrice);
                      setIsHaggling(false);
                      setMerchantResponse(null);
                    }}
                    className={`relative rounded-xl cursor-pointer group overflow-hidden transition-all duration-300 ${
                      selectedItem === item ? 'ring-2 ring-emerald-500' : ''
                    }`}
                    style={{
                      aspectRatio: '1 / 1.15',
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.85) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 250, 247, 0.9) 50%, rgba(249, 245, 235, 0.85) 100%)',
                      backdropFilter: 'blur(12px) saturate(120%)',
                      WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                      border: isDark ? '1.5px solid rgba(71, 85, 105, 0.5)' : '1.5px solid rgba(180, 175, 165, 0.5)',
                      boxShadow: isDark
                        ? '0 3px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : '0 3px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {/* Rarity-colored hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 30%, ${colors.glow} 0%, ${colors.bg} 40%, transparent 70%)`,
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-between h-full p-3">
                      {/* Emoji Icon */}
                      <div className="flex items-center justify-center" style={{ height: '3rem' }}>
                        <span className="text-5xl">{item.emoji || '📦'}</span>
                      </div>

                      {/* Item Name */}
                      <div
                        className="text-center px-2 font-sans font-bold text-sm leading-tight"
                        style={{
                          color: isDark ? colors.light : colors.dark,
                          textShadow: isDark ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none',
                          minHeight: '2.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {item.name}
                      </div>

                      {/* Origin */}
                      <div className={`text-xs font-sans italic text-center px-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {item.origin}
                      </div>

                      {/* Price */}
                      <div className="text-center mt-2">
                        {hasDiscount ? (
                          <div>
                            <div className="text-xs line-through text-gray-400">
                              {item.price} reales
                            </div>
                            <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                              {finalPrice} reales
                            </div>
                          </div>
                        ) : (
                          <div className={`text-base font-bold font-mono ${isDark ? 'text-parchment-200' : 'text-ink-800'}`}>
                            {finalPrice} reales
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel - Selected Item & Purchase */}
        {selectedItem && activeTab === 'market' && (
          <div
            className="flex-shrink-0 border-t p-6"
            style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))'
                : 'linear-gradient(to top, rgba(248, 246, 241, 0.95), rgba(252, 250, 247, 0.9))',
              borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
            }}
          >
            <div className="flex items-start gap-6">
              {/* Selected Item Details */}
              <div className="flex-1">
                <h3 className={`text-xl font-bold font-serif mb-2 ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
                  {selectedItem.name}
                </h3>
                <p className={`text-sm font-sans mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {selectedItem.description}
                </p>
                <div className={`text-sm font-sans italic ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Origin: {selectedItem.origin}
                </div>
              </div>

              {/* Purchase Controls */}
              <div className="w-80 space-y-3">
                {/* Merchant Response */}
                {merchantResponse && (
                  <div
                    className={`px-4 py-3 rounded-lg text-sm font-sans ${
                      merchantResponse.type === 'error'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    }`}
                  >
                    {merchantResponse.text}
                  </div>
                )}

                {/* Bargaining Controls */}
                {(playerSkills?.knownSkills?.bargaining?.level || 0) >= 1 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(Number(e.target.value))}
                      min="1"
                      className={`flex-1 px-3 py-2 rounded-lg font-mono text-sm border ${
                        isDark
                          ? 'bg-slate-800 border-slate-600 text-parchment-100'
                          : 'bg-white border-gray-300 text-ink-900'
                      }`}
                    />
                    <button
                      onClick={handleHaggle}
                      disabled={offeredPrice <= 0 || currentWealth < offeredPrice}
                      className="px-4 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-200 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Haggle
                    </button>
                  </div>
                )}

                {/* Buy Button */}
                <button
                  onClick={() => handlePurchase(getFinalPrice(selectedItem.price))}
                  disabled={currentWealth < getFinalPrice(selectedItem.price)}
                  className="w-full px-6 py-3 rounded-lg font-sans font-bold text-base transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Buy for {getFinalPrice(selectedItem.price)} reales
                </button>

                {/* Wealth Display */}
                <div className={`text-center text-sm font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Your wealth: <span className="font-bold font-mono">{currentWealth} reales</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
