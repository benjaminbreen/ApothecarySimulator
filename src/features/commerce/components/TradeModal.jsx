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
import { useTradeState } from '../hooks/useTradeState';
import NPCSellTab from './NPCSellTab';
import NPCBuyTab from './NPCBuyTab';
import { safeLocalStorage } from '../../../utils/safeLocalStorage';
import InvestmentsTab from './InvestmentsTab';
import TransactionHistoryTab from './TransactionHistoryTab';
import { entityManager } from '../../../core/entities/EntityManager';
import InventoryShelfDisplay from '../../inventory/components/InventoryShelfDisplay';

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
  mode = 'market', // 'market' | 'npc'
  tradingNPC = null, // NPC data when mode is 'npc'
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

  // View mode for market tab (card or list)
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'

  // Generate cache key for merchant inventory (refreshes daily)
  // IMPORTANT: Must match merchantInventoryGenerator.js cache key format
  const getMerchantCacheKey = () => {
    const merchantId = selectedMerchant.id;
    const date = gameState?.date || 'default';
    return `merchant_${merchantId}_${date}`; // Matches merchantInventoryGenerator.js line 33
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

  // Load relationship level from EntityManager when merchant changes
  useEffect(() => {
    if (!selectedMerchant?.id || !isOpen) return;

    try {
      const merchantNPC = entityManager.getById(selectedMerchant.id);
      if (merchantNPC?.relationships?.player?.value) {
        const savedRelationship = merchantNPC.relationships.player.value;
        console.log(`[TradeModal] Loaded relationship with ${selectedMerchant.name}: ${savedRelationship}`);
        setRelationshipLevel(savedRelationship);
      } else {
        // Default to 50 for new relationships
        setRelationshipLevel(50);
        console.log(`[TradeModal] No existing relationship with ${selectedMerchant.name}, defaulting to 50`);
      }
    } catch (error) {
      console.warn(`[TradeModal] Failed to load relationship for ${selectedMerchant.name}:`, error);
      setRelationshipLevel(50);
    }
  }, [selectedMerchant?.id, isOpen, setRelationshipLevel]);

  // Save relationship level to EntityManager when it changes
  useEffect(() => {
    if (!selectedMerchant?.id || !isOpen) return;
    if (relationshipLevel === 50) return; // Don't save default value

    try {
      const merchantNPC = entityManager.getById(selectedMerchant.id);
      if (merchantNPC) {
        // Update the merchant's relationship data
        const updatedNPC = {
          ...merchantNPC,
          relationships: {
            ...merchantNPC.relationships,
            player: {
              ...(merchantNPC.relationships?.player || {}),
              value: relationshipLevel,
              type: relationshipLevel >= 70 ? 'friend' : relationshipLevel >= 40 ? 'acquaintance' : 'stranger',
              status: relationshipLevel >= 60 ? 'positive' : relationshipLevel >= 40 ? 'neutral' : 'negative'
            }
          }
        };

        entityManager.update(selectedMerchant.id, updatedNPC);
        console.log(`[TradeModal] Saved relationship with ${selectedMerchant.name}: ${relationshipLevel}`);
      }
    } catch (error) {
      console.warn(`[TradeModal] Failed to save relationship for ${selectedMerchant.name}:`, error);
    }
  }, [relationshipLevel, selectedMerchant?.id, isOpen]);

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

      // 🛒 MERCHANT MODE: Use pre-generated inventory from tradingNPC
      if ((mode === 'merchant' || mode === 'npc') && tradingNPC?.offering?.items) {
        console.log(`[TradeModal] Using pre-generated inventory for ${selectedMerchant.name} (${tradingNPC.offering.items.length} items)`);
        setAvailableItems(tradingNPC.offering.items);
        setIsFetchingItems(false);
        return;
      }

      const cacheKey = getMerchantCacheKey();

      // Check cache first
      try {
        const cached = safeLocalStorage.getItem(cacheKey);
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

      // Adjust prompt based on merchant type (use merchantType for specific items)
      const getMerchantContext = () => {
        const merchantType = selectedMerchant.merchantType || tradingNPC?.merchantType;

        if (selectedMerchant.id === 'black_market') {
          return 'rare, illegal, or contraband items';
        }

        // Use merchantType for specific item generation
        switch(merchantType) {
          case 'herbalist':
            return 'medicinal herbs, indigenous plants, dried roots, herbal remedies, and traditional medicine ingredients';
          case 'general_goods':
            return 'tools, equipment, hardware, nails, rope, basic supplies, and household items';
          case 'spice_trader':
            return 'exotic spices, imported seasonings, pepper, cinnamon, cloves, aromatic herbs, and culinary ingredients';
          case 'food_vendor':
            return 'fresh food, prepared meals, bread, tortillas, honey, preserved foods, and edible goods';
          case 'textile_merchant':
            return 'fabrics, cloth, silk, cotton, wool, thread, embroidered items, and textile materials';
          case 'potter':
            return 'ceramic pottery, clay vessels, earthenware, decorative ceramics, bowls, jars, and ceramic containers';
          case 'butcher':
            return 'fresh and preserved meats, animal fats, bones, hides, and meat products';
          case 'vegetable_vendor':
            return 'fresh vegetables, fruits, beans, squash, tomatoes, chilies, and produce';
          case 'leather_worker':
            return 'leather goods, belts, bags, straps, hides, tanned leather, and leather accessories';
          case 'basket_weaver':
            return 'woven baskets, mats, containers, reed items, and traditional woven goods';
          default:
            return 'common market goods, basic medicines, and everyday ingredients';
        }
      };

      const merchantContext = getMerchantContext();
      const shopName = selectedMerchant.shopName || tradingNPC?.shopName || selectedMerchant.name;

      const prompt = `
        You are generating items for sale by ${selectedMerchant.name} at "${shopName}" in 1680 Mexico City.
        This merchant EXCLUSIVELY sells ${merchantContext}.

        IMPORTANT: ALL items must be directly related to this specialty. For example:
        - A pottery merchant sells ONLY ceramic items (bowls, jars, vessels, etc.)
        - A vegetable vendor sells ONLY produce (vegetables, fruits, beans, etc.)
        - A leather worker sells ONLY leather goods (belts, bags, hides, etc.)

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
          safeLocalStorage.setItem(cacheKey, JSON.stringify(generatedItems));
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

    // Remove item from merchant inventory
    const updatedItems = availableItems.map(item => {
      if (item.name === selectedItem.name) {
        const newQuantity = (item.quantity || 1) - 1;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(item => item !== null);

    setAvailableItems(updatedItems);

    // Update cache
    try {
      const cacheKey = getMerchantCacheKey();
      safeLocalStorage.setItem(cacheKey, JSON.stringify(updatedItems));
      console.log(`[TradeModal] Updated merchant inventory cache (${updatedItems.length} items remaining)`);
    } catch (error) {
      console.warn('[TradeModal] Failed to update inventory cache:', error);
    }

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

    // Remove purchased items from merchant inventory
    const updatedItems = availableItems.map(item => {
      if (item.name === selectedBuyItem.name) {
        const newQuantity = (item.quantity || 1) - buyQuantity;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(item => item !== null);

    setAvailableItems(updatedItems);

    // Update cache
    try {
      const cacheKey = getMerchantCacheKey();
      safeLocalStorage.setItem(cacheKey, JSON.stringify(updatedItems));
      console.log(`[TradeModal] Updated merchant inventory cache (${updatedItems.length} items remaining)`);
    } catch (error) {
      console.warn('[TradeModal] Failed to update inventory cache:', error);
    }

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

  // Determine tabs based on mode
  const tabs = mode === 'inventory' || tradingNPC?.type === 'inventory'
    ? [
        // Inventory mode: Only show inventory tab
        { id: 'inventory', label: 'Full Inventory', icon: '📦', unlocked: true }
      ]
    : mode === 'merchant' || mode === 'market'
    ? [
        // Merchant stall mode: Only show market tab
        { id: 'market', label: 'Market', icon: '🏪', unlocked: true },
        { id: 'black_market', label: 'Black Market', icon: '🎭', unlocked: hasBlackMarketAccess },
        { id: 'investments', label: 'Investments', icon: '💰', unlocked: hasInvestmentAccess },
        { id: 'history', label: 'History', icon: '📜', unlocked: true }
      ]
    : [
        // NPC Trade mode: Show NPC-specific tabs
        ...(hasNPC ? [
          { id: 'sell-to-npc', label: `Sell to ${selectedMerchant.name}`, icon: '💰', unlocked: true },
          { id: 'buy-from-npc', label: `Buy from ${selectedMerchant.name}`, icon: '🛒', unlocked: true },
        ] : []),
        { id: 'market', label: 'Market', icon: '🏪', unlocked: isAtMarket },
        { id: 'black_market', label: 'Black Market', icon: '🎭', unlocked: hasBlackMarketAccess },
        { id: 'investments', label: 'Investments', icon: '💰', unlocked: hasInvestmentAccess },
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
          activeTab === 'history' ? 'max-w-full sm:max-w-7xl' : 'max-w-full sm:max-w-5xl'
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
        {/* Decorative Portrait Overlay - Upper Right (like ItemModal) */}
        {(tradingNPC?.portrait || selectedMerchant.portrait) && (
          <div
            className="absolute top-0 right-0 pointer-events-none"
            style={{
              width: '55%',
              height: '85%',
              zIndex: 0,
              overflow: 'hidden',
              maskImage: isDark
                ? 'radial-gradient(ellipse at top right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.39) 25%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0) 85%)'
                : 'radial-gradient(ellipse at top right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.04) 65%, rgba(0,0,0,0) 85%)',
              WebkitMaskImage: isDark
                ? 'radial-gradient(ellipse at top right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0) 85%)'
                : 'radial-gradient(ellipse at top right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 25%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.04) 65%, rgba(0,0,0,0) 85%)',
            }}
          >
            <img
              src={tradingNPC?.portrait || selectedMerchant.portrait}
              alt=""
              className="w-full h-full object-cover"
              style={{
                transform: 'scale(1.4) translateX(12%) translateY(-8%)',
                mixBlendMode: isDark ? 'lighten' : 'multiply',
                opacity: isDark ? 0.35 : 0.55,
                objectPosition: 'top right'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

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
                className={`flex-1 px-4 py-2.5 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative font-sans ${
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

          {/* Inventory Tab Content */}
          {activeTab === 'inventory' && (
            <InventoryShelfDisplay
              gameState={gameState}
              isDark={isDark}
              initialViewMode="list"
            />
          )}

          {/* NPC Trade Content (only render wrapper when on NPC tabs) */}
          {hasNPC && (activeTab === 'sell-to-npc' || activeTab === 'buy-from-npc') && (
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
            <div className="p-6 space-y-4">
              {/* Merchant Header - Portrait + Info + Bonuses */}
              <div className="flex gap-6">
                {/* Merchant Portrait */}
                {(tradingNPC?.portrait || selectedMerchant.portrait) && (
                  <div className="flex-shrink-0">
                    <div
                      className="w-40 h-36 rounded-xl overflow-hidden border-3"
                      style={{
                        borderColor: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(209, 213, 219, 0.5)',
                        boxShadow: isDark
                          ? '0 8px 16px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(251, 191, 36, 0.2)'
                          : '0 8px 16px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      <img
                        src={tradingNPC?.portrait || selectedMerchant.portrait}
                        alt={selectedMerchant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Merchant Info */}
                <div className="flex-1 space-y-3 min-w-0">
                  {/* Name + Shop Name + Relationship */}
                  <div className="flex items-start gap-4">
                    <div>
                      <h2 className={`text-3xl font-bold font-serif ${isDark ? 'text-amber-100' : 'text-ink-900'}`}>
                        {selectedMerchant.name}
                      </h2>
                      <p className={`text-base font-sans italic ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                        {tradingNPC?.shopName || selectedMerchant.shopName}
                      </p>
                    </div>

                    {/* Compact Relationship Display */}
                    <div className="flex items-center gap-2.5 mt-1">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-ink-600'}`}>
                          Relationship
                        </div>
                        <div className="w-20 h-2 bg-ink-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1.5"
                          style={{
                            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${relationshipLevel}%`,
                              background: `linear-gradient(90deg, #fbbf24, #f59e0b)`,
                              boxShadow: '0 0 4px rgba(251, 191, 36, 0.5)'
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="w-14 h-14 rounded-full flex flex-col items-center justify-center relative flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(251, 191, 36, 0.15))`,
                          border: `2px solid rgba(251, 191, 36, 0.5)`,
                          boxShadow: isDark
                            ? '0 3px 10px rgba(251, 191, 36, 0.3)'
                            : '0 3px 10px rgba(251, 191, 36, 0.25)'
                        }}
                      >
                        <div className="text-xl">😐</div>
                        <div className="text-xs font-bold font-mono text-amber-600 dark:text-amber-300">
                          {relationshipLevel}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Greeting */}
                  {(tradingNPC?.greeting || selectedMerchant.greeting) && (
                    <div
                      className="px-4 py-2.5 rounded-lg text-xl font-serif italic leading-relaxed"
                      style={{
                        background: isDark
                          ? 'rgba(251, 191, 36, 0.12)'
                          : 'rgba(251, 191, 36, 0.15)',
                        borderLeft: `3px solid ${isDark ? '#fbbf24' : '#f59e0b'}`,
                        color: isDark ? '#fef3c7' : '#78350f',
                        boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      "{tradingNPC?.greeting || selectedMerchant.greeting}"
                    </div>
                  )}
                </div>

                {/* Trading Bonuses - RIGHT SIDE */}
                <div className="flex flex-col gap-2.5 items-end min-w-fit">
                  {/* Total Savings Badge (if any bonuses) */}
                  {skillBonuses.breakdown.length > 0 && (
                    <div
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.18))'
                          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.12))',
                        border: isDark ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(16, 185, 129, 0.35)',
                        boxShadow: isDark ? '0 2px 8px rgba(16, 185, 129, 0.2)' : '0 2px 6px rgba(16, 185, 129, 0.15)'
                      }}
                    >
                      <span className="text-xl">💸</span>
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                          Total Savings
                        </div>
                        <div className="text-lg font-bold font-mono text-emerald-500 dark:text-emerald-300">
                          {(skillBonuses.total * 100).toFixed(1)}% off
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trading Bonuses */}
                  {skillBonuses.breakdown.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {skillBonuses.breakdown.map((bonus, idx) => {
                        // Get tooltip text explaining each bonus
                        const getTooltip = (name) => {
                          switch(name) {
                            case 'Bargaining':
                              return `Your Bargaining skill (Level ${bonus.level}) reduces prices by 5% per level`;
                            case 'Language':
                              return "You speak the merchant's language, earning their trust";
                            case 'Etiquette':
                              return `Your Etiquette skill (Level ${bonus.level}) charms merchants`;
                            case 'Relationship':
                              return 'This merchant likes you and offers better deals';
                            case 'Herbalist':
                            case 'Court Physician':
                              return `Your ${name} profession grants discounts on related items`;
                            default:
                              return 'Price discount';
                          }
                        };

                        // Get icon for each bonus type
                        const getIcon = (name) => {
                          switch(name) {
                            case 'Bargaining': return '💰';
                            case 'Language': return '🗣️';
                            case 'Etiquette': return '🤝';
                            case 'Relationship': return '❤️';
                            case 'Herbalist': return '🌿';
                            case 'Court Physician': return '👑';
                            default: return '✨';
                          }
                        };

                        return (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-sans"
                            style={{
                              background: isDark
                                ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.8), rgba(30, 41, 59, 0.7))'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(249, 245, 235, 0.7))',
                              border: isDark ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
                              color: isDark ? '#fbbf24' : '#10b981'
                            }}
                            title={getTooltip(bonus.name)}
                          >
                            <span>{getIcon(bonus.name)}</span>
                            <span>{bonus.name}</span>
                            <span className="font-bold">-{(bonus.value * 100).toFixed(1)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Shop Ambiance - Enhanced styling */}
              {(tradingNPC?.shopAmbiance || selectedMerchant.shopAmbiance) && (
                <div
                  className="px-5 py-4 rounded-xl text-base font-sans leading-relaxed"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(30, 41, 59, 0.5))'
                      : 'linear-gradient(135deg, rgba(249, 245, 235, 0.9), rgba(252, 250, 247, 0.8))',
                    border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(209, 213, 219, 0.35)',
                    color: isDark ? '#cbd5e1' : '#44403c',
                    boxShadow: isDark
                      ? 'inset 0 1px 0 rgba(251, 191, 36, 0.1), 0 2px 8px rgba(0, 0, 0, 0.3)'
                      : 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 2px 6px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {tradingNPC?.shopAmbiance || selectedMerchant.shopAmbiance}
                </div>
              )}

              {/* Items Section Header + View Toggle */}
              <div className="flex items-center justify-between pt-2">
                <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${isDark ? 'text-amber-300' : 'text-ink-700'}`}>
                  Items for Sale
                </h3>

                {/* View Mode Toggle */}
                <div className="flex gap-1 p-1 rounded-lg" style={{
                  background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                }}>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-1.5 rounded transition-all duration-200 ${
                      viewMode === 'card'
                        ? (isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-100 text-emerald-700')
                        : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700')
                    }`}
                    title="Card View"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h4M4 10h4M4 14h4M4 18h4M10 6h4M10 10h4M10 14h4M10 18h4M16 6h4M16 10h4M16 14h4M16 18h4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-all duration-200 ${
                      viewMode === 'list'
                        ? (isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-100 text-emerald-700')
                        : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700')
                    }`}
                    title="List View"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Items Display */}
              {isFetchingItems ? (
                <div className="flex items-center justify-center py-12">
                  <div className={`text-lg font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Loading items for sale...
                  </div>
                </div>
              ) : viewMode === 'card' ? (
                /* Card View */
                <div className="grid grid-cols-6 gap-2">
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
                        className={`relative rounded-lg cursor-pointer group overflow-hidden transition-all duration-200 ${
                          selectedItem === item ? 'ring-2 ring-emerald-500' : ''
                        }`}
                        style={{
                          background: isDark
                            ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.85) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 250, 247, 0.9) 50%, rgba(249, 245, 235, 0.85) 100%)',
                          border: isDark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(180, 175, 165, 0.5)',
                          boxShadow: isDark
                            ? '0 2px 6px rgba(0, 0, 0, 0.3)'
                            : '0 2px 6px rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        {/* Content */}
                        <div className="flex flex-col items-center justify-center p-2 gap-1">
                          {/* Centered Emoji */}
                          <div className="text-3xl">{item.emoji || '📦'}</div>

                          {/* Item Name - BIGGER */}
                          <div
                            className="text-center font-sans font-bold text-sm leading-tight"
                            style={{
                              color: isDark ? colors.light : colors.dark,
                              textShadow: isDark ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none'
                            }}
                          >
                            {item.name}
                          </div>

                          {/* Price - Closer to name */}
                          <div className="text-center">
                            {hasDiscount ? (
                              <div>
                                <div className="text-xs line-through text-gray-400">
                                  {item.price}r
                                </div>
                                <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                  {finalPrice}r
                                </div>
                              </div>
                            ) : (
                              <div className={`text-sm font-bold font-mono ${isDark ? 'text-parchment-200' : 'text-ink-800'}`}>
                                {finalPrice}r
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="space-y-1">
                  {availableItems.map((item, idx) => {
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
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedItem === item
                            ? (isDark ? 'bg-emerald-900/30 ring-2 ring-emerald-500' : 'bg-emerald-100 ring-2 ring-emerald-500')
                            : (isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50')
                        }`}
                        style={{
                          border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                        }}
                      >
                        {/* Emoji */}
                        <div className="text-2xl flex-shrink-0">{item.emoji || '📦'}</div>

                        {/* Name + Origin */}
                        <div className="flex-1 min-w-0">
                          <div className={`font-sans font-bold text-sm ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
                            {item.name}
                          </div>
                          <div className={`text-xs font-sans italic ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            {item.origin}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
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
                    );
                  })}
                </div>
              )}
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
