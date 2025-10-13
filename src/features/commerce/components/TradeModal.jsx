/**
 * TradeModal - Modern Trading Interface
 *
 * Features:
 * - Skill-based pricing (Bargaining, Languages, Etiquette, Reputation)
 * - Haggling mini-game (unlocked at Bargaining 1+)
 * - Multiple merchant types with personalities
 * - Relationship tracking for repeat customers
 * - Black market tab (Bargaining 5+)
 * - Investment tab (Bookkeeping 5+)
 * - Glassomorphic parchment aesthetic matching modern UI
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createChatCompletion } from '../../../core/services/llmService';
import { calculatePriceModifier, FACTIONS } from '../../../core/systems/reputationSystem';
import { getItemRarity, getRarityColors } from '../../../core/systems/itemRarity';
import { getMarketDiscountBonus } from '../../../core/systems/professionAbilities';

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
  awardSkillXP
}) {
  const [activeTab, setActiveTab] = useState('market');
  const [selectedMerchant, setSelectedMerchant] = useState(MERCHANT_TYPES.MARKET_VENDOR);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [offeredPrice, setOfferedPrice] = useState(0);
  const [isHaggling, setIsHaggling] = useState(false);
  const [merchantResponse, setMerchantResponse] = useState(null);
  const [isFetchingItems, setIsFetchingItems] = useState(false);
  const [relationshipLevel, setRelationshipLevel] = useState(50); // 0-100

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

  // Calculate skill bonuses
  const skillBonuses = useMemo(() => {
    if (!playerSkills) return { total: 0, breakdown: [] };

    const breakdown = [];
    let totalDiscount = 0;

    // Bargaining skill (0-15% discount)
    const bargaining = playerSkills.knownSkills?.bargaining?.level || 0;
    if (bargaining > 0) {
      const discount = bargaining * 0.05; // 5% per level
      totalDiscount += discount;
      breakdown.push({
        name: 'Bargaining',
        level: bargaining,
        value: discount,
        color: '#10b981'
      });
    }

    // Language bonus (10% if you speak merchant's language)
    const merchantLanguages = selectedMerchant.languages || [];
    const hasLanguageMatch = merchantLanguages.some(lang => {
      const skillName = lang === 'nahuatl' ? 'nahuatl' :
                       lang === 'french' ? 'french' :
                       lang === 'english' ? 'english' :
                       lang === 'latin' ? 'latin' : null;
      if (!skillName) return false;
      const skillLevel = playerSkills.knownSkills?.[skillName]?.level || 0;
      return skillLevel >= 2; // Need level 2+ for trading bonus
    });

    if (hasLanguageMatch) {
      totalDiscount += 0.10;
      breakdown.push({
        name: 'Language',
        level: 2,
        value: 0.10,
        color: '#6366f1'
      });
    }

    // Etiquette bonus (10% sympathetic merchant discount at level 2+)
    const etiquette = playerSkills.knownSkills?.etiquette?.level || 0;
    if (etiquette >= 2) {
      totalDiscount += 0.10;
      breakdown.push({
        name: 'Etiquette',
        level: etiquette,
        value: 0.10,
        color: '#8b5cf6'
      });
    }

    // Relationship bonus (up to 10% for repeat customers)
    const relationshipBonus = (relationshipLevel - 50) / 500; // 0-10% based on relationship above 50
    if (relationshipBonus > 0) {
      totalDiscount += relationshipBonus;
      breakdown.push({
        name: 'Relationship',
        level: Math.round(relationshipLevel),
        value: relationshipBonus,
        color: '#f59e0b'
      });
    }

    // Profession bonuses (Herbalist L20/L30, Court Physician L20/L30)
    const professionDiscount = getMarketDiscountBonus(
      gameState.chosenProfession,
      gameState.playerLevel,
      selectedItem?.categories || []
    );

    if (professionDiscount > 0) {
      totalDiscount += professionDiscount;

      // Determine profession name for breakdown
      const professionName = gameState.chosenProfession === 'herbalist' ? 'Herbalist' : 'Court Physician';

      breakdown.push({
        name: professionName,
        level: gameState.playerLevel,
        value: professionDiscount,
        color: '#ec4899'
      });
    }

    return { total: totalDiscount, breakdown };
  }, [playerSkills, selectedMerchant, relationshipLevel, gameState.chosenProfession, gameState.playerLevel, selectedItem]);

  // Calculate reputation modifier
  const reputationModifier = useMemo(() => {
    if (!reputation) return 1.0;
    const merchantRep = reputation.factions[FACTIONS.MERCHANTS] || 50;
    return calculatePriceModifier(merchantRep);
  }, [reputation]);

  // Get final price with all modifiers
  const getFinalPrice = (basePrice) => {
    // Apply reputation modifier first
    let price = basePrice * reputationModifier;
    // Then apply skill bonuses
    price = price * (1 - skillBonuses.total);
    return Math.max(1, Math.round(price));
  };

  // Fetch items from LLM
  useEffect(() => {
    const fetchItems = async () => {
      if (!isOpen) return;

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

        Maria's current wealth is ${currentWealth} reales.

        Generate a list of 4-8 items for sale. Each item should include:
        1. **name**: The item's name (be specific, not generic)
        2. **description**: Brief description (1-2 sentences)
        3. **origin**: Specific origin location
        4. **price**: Price in reales (integer, ranging from 1-20)
        5. **emoji**: Appropriate emoji
        6. **rarity**: 'common', 'uncommon', 'rare', or 'legendary'

        Example:
        [
          {
            "name": "Yucatan Honey",
            "description": "Golden honey harvested from wild bees. Excellent for sweetening medicines.",
            "origin": "Yucatan Peninsula",
            "price": 3,
            "emoji": "🍯",
            "rarity": "common"
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

        setAvailableItems(generatedItems);
      } catch (error) {
        console.error('[TradeModal] Error fetching items:', error);
        setAvailableItems([]);
      } finally {
        setIsFetchingItems(false);
      }
    };

    fetchItems();
  }, [isOpen, selectedMerchant, conversationHistory, currentWealth]);

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

    // Award XP for commerce
    if (typeof awardXP === 'function') {
      awardXP(2, `commerce_purchase_${selectedItem.name}`);
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

  // Check if tabs are unlocked
  const hasBlackMarketAccess = (playerSkills?.knownSkills?.bargaining?.level || 0) >= 5;
  const hasInvestmentAccess = (playerSkills?.knownSkills?.bookkeeping?.level || 0) >= 5;

  if (!isOpen) return null;

  const isDark = document.documentElement.classList.contains('dark');

  const tabs = [
    { id: 'market', label: 'Market', icon: '🏪', unlocked: true },
    { id: 'black_market', label: 'Black Market', icon: '🎭', unlocked: hasBlackMarketAccess },
    { id: 'investments', label: 'Investments', icon: '💰', unlocked: hasInvestmentAccess }
  ];

  return (
    <div
      className="fixed inset-0 bg-stone-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Container - Fixed Dimensions */}
      <div
        className="relative w-full max-w-7xl h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-elevation-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(0, 0, 0, 0.92) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 245, 235, 0.95) 50%, rgba(252, 250, 247, 0.98) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: isDark
            ? '0 24px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 24px 80px rgba(61, 47, 36, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 p-2 rounded-lg transition-all duration-150 hover:bg-ink-100 dark:hover:bg-slate-700"
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke={isDark ? '#e2e8f0' : '#3d2817'} viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header - Merchant Info */}
        <div
          className="flex-shrink-0 border-b relative z-10"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
              : 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
            borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
          }}
        >
          <div className="p-6 flex items-start gap-6">
            {/* Merchant Portrait */}
            <div
              className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95), rgba(30, 41, 59, 0.9))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                border: isDark ? '2px solid rgba(71, 85, 105, 0.3)' : '2px solid rgba(209, 213, 219, 0.3)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
              }}
            >
              <img
                src={selectedMerchant.portrait}
                alt={selectedMerchant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="w-full h-full items-center justify-center text-5xl"
                style={{ display: 'none' }}
              >
                🧑‍🌾
              </div>
            </div>

            {/* Merchant Details */}
            <div className="flex-1">
              <h2 className={`text-3xl font-bold font-serif mb-2 ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
                {selectedMerchant.name}
              </h2>
              <div className="flex items-center gap-4 text-sm font-sans">
                <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  <span>🗣️</span>
                  <span className="font-semibold">Languages:</span>
                  <span>{selectedMerchant.languages.join(', ')}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  <span>💚</span>
                  <span className="font-semibold">Relationship:</span>
                  <div className="w-24 h-2 bg-gray-300 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${relationshipLevel}%`,
                        background: relationshipLevel >= 70 ? '#10b981' : relationshipLevel >= 40 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                  <span>{relationshipLevel}/100</span>
                </div>
              </div>
            </div>

            {/* Bonuses Panel */}
            <div
              className="px-4 py-3 rounded-xl"
              style={{
                background: isDark
                  ? 'rgba(15, 23, 42, 0.6)'
                  : 'rgba(255, 255, 255, 0.6)',
                border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
              }}
            >
              <div className={`text-xs font-sans font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Your Bonuses
              </div>
              <div className="space-y-1">
                {skillBonuses.breakdown.length === 0 ? (
                  <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>None</div>
                ) : (
                  skillBonuses.breakdown.map((bonus, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 text-sm font-sans">
                      <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>
                        {bonus.name} {bonus.level && `(${bonus.level})`}
                      </span>
                      <span className="font-bold" style={{ color: bonus.color }}>
                        -{Math.round(bonus.value * 100)}%
                      </span>
                    </div>
                  ))
                )}
                <div className={`pt-2 mt-2 border-t ${isDark ? 'border-slate-600' : 'border-gray-300'}`}>
                  <div className="flex items-center justify-between text-sm font-sans font-bold">
                    <span className={isDark ? 'text-parchment-200' : 'text-ink-800'}>Total Discount</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      -{Math.round(skillBonuses.total * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex-shrink-0 flex border-b relative z-10"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(0, 0, 0, 0.9))'
              : 'linear-gradient(to bottom, rgba(248, 246, 241, 0.95), rgba(245, 243, 238, 0.9))',
            borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
          }}
        >
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const isLocked = !tab.unlocked;

            return (
              <button
                key={tab.id}
                onClick={() => !isLocked && setActiveTab(tab.id)}
                disabled={isLocked}
                className={`flex-1 px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative font-sans ${
                  isLocked ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                style={{
                  fontWeight: isActive ? 700 : 600,
                  letterSpacing: '0.08em',
                  color: isActive
                    ? '#10b981'
                    : isDark ? '#94a3b8' : '#6b5a47',
                  background: isActive
                    ? isDark
                      ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.8))'
                      : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))'
                    : 'transparent',
                  borderLeft: idx > 0 ? `1px solid ${isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(209, 213, 219, 0.2)'}` : 'none'
                }}
              >
                <span className="mr-2 text-base" style={{ opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
                {tab.label}
                {isLocked && <span className="ml-2">🔒</span>}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: 'linear-gradient(to right, transparent, #10b981, transparent)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area - Items Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6" style={{
          background: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(252, 250, 247, 0.4)'
        }}>
          {isFetchingItems ? (
            <div className="flex items-center justify-center h-full">
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

        {/* Bottom Panel - Selected Item & Purchase */}
        {selectedItem && (
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
