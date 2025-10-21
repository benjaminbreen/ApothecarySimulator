import React, { useState, useEffect, useMemo } from 'react';
import '../../../Buy.css'; // Optional: Styling for the Buy Popup
import { createChatCompletion } from '../../../core/services/llmService';
import { calculatePriceModifier, FACTIONS } from '../../../core/systems/reputationSystem';
import { useGesture } from '../../../hooks/useGesture';
import {
  hasBlackMarketAccess,
  getBlackMarketCategories,
  getBlackMarketDiscount,
  getMarketDiscountBonus
} from '../../../core/systems/professionAbilities';
import { getAvailableBlackMarketItems } from '../../../data/blackMarketItems';
import { getAllMedicineTypes, inferMedicineType, getMedicineEmoji } from '../../../core/config/medicineCategories';
import MedicineTypeBadge from '../../../components/MedicineTypeBadge';

function Buy({
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
  TRANSACTION_CATEGORIES
}) {
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [offeredPrice, setOfferedPrice] = useState(0);
  const [merchantResponse, setMerchantResponse] = useState(null);
  const [isFetchingItems, setIsFetchingItems] = useState(false);  // Local loading state for fetching items
 const [isClosing, setIsClosing] = useState(false);
 const [isFadingOut, setIsFadingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('regular'); // 'regular' or 'blackMarket'
  const [medicineTypeFilter, setMedicineTypeFilter] = useState('all'); // Medicine type filter

  // Check black market access
  const hasBlackMarket = hasBlackMarketAccess(gameState.chosenProfession, gameState.playerLevel);
  const blackMarketDiscount = getBlackMarketDiscount(gameState.chosenProfession, gameState.playerLevel);
  const blackMarketCategories = getBlackMarketCategories(gameState.chosenProfession, gameState.playerLevel);

  // Get black market items based on player level
  const blackMarketItems = hasBlackMarket
    ? getAvailableBlackMarketItems(gameState.playerLevel)
    : [];

  // Calculate price modifiers
  const reputationModifier = reputation ? calculatePriceModifier(reputation.factions[FACTIONS.MERCHANTS]) : 1.0;
  const courtPhysicianDiscount = getMarketDiscountBonus(gameState.chosenProfession, gameState.playerLevel);

  // Stack Court Physician discount with reputation modifier for regular market
  // (multiplicative stacking: both discounts apply)
  const priceModifier = reputationModifier * (1 - courtPhysicianDiscount);
  const discountPercent = Math.round((1 - priceModifier) * 100);

  // Get modified price for an item
  const getModifiedPrice = (basePrice, isBlackMarket = false) => {
    if (isBlackMarket) {
      // Black market items: apply black market discount (no reputation modifier)
      return Math.max(1, Math.round(basePrice * (1 - blackMarketDiscount)));
    }
    // Regular items: apply reputation modifier + Court Physician bonus
    return Math.max(1, Math.round(basePrice * priceModifier));
  };

  // Filter items by medicine type
  const filteredItems = useMemo(() => {
    const items = activeTab === 'blackMarket' ? blackMarketItems : availableItems;

    if (medicineTypeFilter === 'all') {
      return items;
    }

    return items.filter(item => {
      const itemType = inferMedicineType(item);
      return itemType === medicineTypeFilter;
    });
  }, [availableItems, blackMarketItems, medicineTypeFilter, activeTab]);

  // Count items by type
  const itemCountsByType = useMemo(() => {
    const items = activeTab === 'blackMarket' ? blackMarketItems : availableItems;
    const counts = { all: items.length };

    getAllMedicineTypes().forEach(type => {
      counts[type.id] = items.filter(item => inferMedicineType(item) === type.id).length;
    });

    return counts;
  }, [availableItems, blackMarketItems, activeTab]);

  // Swipe-to-close gesture support
  const gestureRef = useGesture({
    onSwipeDown: () => {
      if (!isFetchingItems) {
        closePopup();
      }
    },
    minSwipeDistance: 80,
    enableHaptics: true
  });

   const closePopup = () => {
    // Trigger the fade-out animation
    setIsClosing(true);

      setTimeout(() => {
      setIsClosing(false); // Reset the closing state
      onClose(); // Close the popup after animation ends
    }, 500); // Match the duration of the fade-out animation (0.5s)
  };

  // Fetch available items based on the previous turn context
  useEffect(() => {
    const fetchItemsForSale = async () => {
      if (isOpen) {
        setIsFetchingItems(true);  // Use local loading state
        const previousTurnContext = conversationHistory[conversationHistory.length - 1]?.content || '';
        
        const prompt = `
          You are a historical simulator generating market items for sale in 1680 Mexico City. Determine the most likely and authentic list of HIGHLY SPECIFIC items for sale based on the provided context. 
          If context includes mention of items available for sale, be sure to ALWAYS include them. However, it needs to be specific. If the context mentions "tropical fruits," then extrapolate that to mean you should list something like ripe papayas and green mangoes (as two seperate items), not a generic "tropical fruit" item.
          
          Based on the following context:
          "${previousTurnContext}"

          Maria's current wealth is ${currentWealth} reales. Generate a list of between 1 and 6 items available for sale within the context of the previous turn (be strictly accurate about what MIGHT be available in this setting - you can imagine possibilities, but they need to fit in the context). Each item should include:
          1. **name**: The item's name.
          2. **description**: A brief description of the item.
          3. **origin**: Where the item is from. BE HIGHLY SPECIFIC.
          4. **price**: Price in reales (as an integer).
          5. **emoji**: An appropriate emoji that symbolizes the item, such as 🫚 (for ginger) or 🍵🫖 (for teas) 
          
          Example 1:
          [
            {
              "name": "Peruvian Cinchona Bark",
              "description": "Used to treat fevers, particularly malaria. Quite rare.",
              "origin": "Loxa, Peru",
              "price": 8,
              "emoji": "🪵"
            }
          ]

          Example 2:
          [
            {
              "name": "Yucatan Honey",
              "description": "A common sweetener and medicinal ingredient.",
              "origin": "Yucatan Peninsula",
              "price": 1,
              "emoji": "🍯"
            },
            {
              "name": "Aloe Vera",
              "description": "A common plant used to treat skin conditions.",
              "origin": "Mexico City environs",
              "price": 1,
              "emoji": "🌵"
            }
          ]

          Example 3:
          [
            {
              "name": "Guava",
              "description": "A fruit used for its medicinal and nutritional properties.",
              "origin": "Central America",
              "price": 3,
              "emoji": "🍈"
            },
            {
              "name": "Clove",
              "description": "A spice and medicinal ingredient.",
              "origin": "Malaku Islands, East Indies",
              "price": 4,
              "emoji": "🌰"
            }
          ]

          Ensure your response is formatted in strict JSON format, with no additional characters outside of the JSON object.
          IMPORTANT: Use no backticks in your response. Include no additional text of any kind. ONLY JSON formatted as above.
        `;

        try {
          const response = await createChatCompletion([
                { role: 'system', content: 'You are a historical simulator generating market items for sale in 1680 Mexico City. Follow the prompt instructions exactly.' },
                { role: 'user', content: prompt }
              ], 0.3, 2000, { type: 'json_object' });

          let generatedItems;
          try {
            generatedItems = JSON.parse(response.choices[0].message.content);
          } catch (jsonParseError) {
            console.warn("JSON parsing failed. Attempting to sanitize output.", jsonParseError);
            const jsonMatch = response.choices[0].message.content.match(/\[.*?\]/s);
            if (jsonMatch) {
              generatedItems = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error("Failed to extract valid JSON structure from AI response.");
            }
          }

          setAvailableItems(generatedItems);
        } catch (error) {
          console.error("Error fetching items from AI:", error);
          setHistoryOutput('Error generating items for sale.');
        } finally {
          setIsFetchingItems(false);  // End local loading state
        }
      }
    };

    fetchItemsForSale();
  }, [isOpen, conversationHistory, setHistoryOutput]);

  const handleOffer = async (price) => {
    if (!selectedItem) {
      alert("Please select an item to buy.");
      return;
    }

    if (currentWealth < price) {
      alert("Not enough wealth to buy this item.");
      return;
    }

    const isBlackMarket = activeTab === 'blackMarket';

    // Deduct wealth first
    const updatedWealth = currentWealth - price;

    // Deduct wealth first in state
    handleWealthChange(updatedWealth);  // Deduct the price from Maria's wealth first

    updateInventory(selectedItem.name, 1);

    setIsFetchingItems(true);  // Use local loading state

    // Use the appropriate modified price as the base
    const basePrice = getModifiedPrice(selectedItem.price || 5, isBlackMarket);
    let response = '';

    if (price >= basePrice) {
      if (isBlackMarket) {
        response = `The shady merchant quickly accepts your ${price} reales and hands over ${selectedItem.name}, glancing around nervously. "You didn't see me here," they mutter. Maria now has ${updatedWealth} reales.
        &nbsp;
        You can #buy again to purchase more items, or enter a new command.
    &nbsp;
        **Maria received ${selectedItem.name}. It has been added to her inventory.**`;
      } else {
        response = `The merchant happily accepts your offer of ${price} reales for ${selectedItem.name}. You can now access this item as part of your inventory. Maria now has ${updatedWealth} reales.
        &nbsp;
        You can #buy again if you would like to purchase more items, or enter a new command to move on to something else.
    &nbsp;
        **Maria received ${selectedItem.name}. It has been added to her inventory. **`;
      }

      // Log transaction
      if (transactionManager && TRANSACTION_CATEGORIES) {
        transactionManager.logTransaction(
          'expense',
          TRANSACTION_CATEGORIES.INGREDIENTS,
          isBlackMarket ? `[Black Market] Purchased ${selectedItem.name}` : `Purchased ${selectedItem.name}`,
          price,
          updatedWealth,
          gameState.date,
          gameState.time
        );
      }

      onClose();  // Close the Buy popup
    } else if (price >= basePrice * 0.8) {
      if (isBlackMarket) {
        response = `The shady merchant eyes you suspiciously, then reluctantly accepts your offer. "Fine, but don't tell anyone about this deal." *Maria received ${selectedItem.name}. She paid ${price} reales.*`;
      } else {
        response = `The merchant hesitates but accepts your offer for ${selectedItem.name}. *Maria received ${selectedItem.name}. She paid ${price} reales. It has been added to her inventory.*`;
      }

      // Log transaction
      if (transactionManager && TRANSACTION_CATEGORIES) {
        transactionManager.logTransaction(
          'expense',
          TRANSACTION_CATEGORIES.INGREDIENTS,
          isBlackMarket ? `[Black Market] Purchased ${selectedItem.name}` : `Purchased ${selectedItem.name}`,
          price,
          updatedWealth,
          gameState.date,
          gameState.time
        );
      }

      addJournalEntry(`Maria bought ${selectedItem.name} for ${price} reales${isBlackMarket ? ' from the black market' : ''}.`);
      onClose();  // Close the Buy popup
    } else {
      if (isBlackMarket) {
        response = `The shady merchant shakes their head. "That's insulting. Come back when you're serious." They refuse to sell at ${price} reales.`;
      } else {
        response = `The merchant scoffs at your offer of ${price} reales and refuses to sell the item.`;
      }
    }

    setHistoryOutput(response);
    setMerchantResponse(response);

    await handleTurnEnd(response);  // Trigger next turn

    setIsFetchingItems(false);  // End local loading state
  };

  const handleClose = () => {
  setIsFadingOut(true);  // Trigger fade out

  setTimeout(() => {
    onClose();  // Actually close after the fade-out is complete (0.5s for the animation)
  }, 500);  // Match this with the animation duration
};


  return (
    <>
   {isOpen && (
        <div ref={gestureRef} className={`buy-popup ${isClosing ? 'fade-out' : ''}`}>
          <div className="buy-popup-overlay" />
          <div className="buy-popup-content">
            <h2>Buy Items</h2>

            {/* Tabs for Black Market (Poisoners only) */}
            {hasBlackMarket && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                borderBottom: '2px solid #ccc'
              }}>
                <button
                  onClick={() => setActiveTab('regular')}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderBottom: activeTab === 'regular' ? '3px solid #8b4513' : 'none',
                    backgroundColor: activeTab === 'regular' ? '#f5f5f5' : 'transparent',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'regular' ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  🏪 Regular Market
                </button>
                <button
                  onClick={() => setActiveTab('blackMarket')}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderBottom: activeTab === 'blackMarket' ? '3px solid #8b4513' : 'none',
                    backgroundColor: activeTab === 'blackMarket' ? '#f5f5f5' : 'transparent',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'blackMarket' ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  🕵️ Black Market {blackMarketDiscount > 0 && `(-${Math.round(blackMarketDiscount * 100)}%)`}
                </button>
              </div>
            )}

            {/* Price Modifiers Display (Regular Market only) */}
            {activeTab === 'regular' && (reputation || courtPhysicianDiscount > 0) && (
              <div style={{
                padding: '8px 12px',
                marginBottom: '12px',
                borderRadius: '8px',
                backgroundColor: discountPercent > 0 ? '#d1fae5' : '#fee2e2',
                border: `1px solid ${discountPercent > 0 ? '#10b981' : '#ef4444'}`,
                textAlign: 'center',
                fontSize: '0.9em'
              }}>
                {/* Reputation Discount */}
                {reputation && discountPercent !== 0 && (
                  <div>
                    <strong>Merchant Reputation:</strong>
                    {' '}
                    <span style={{ color: discountPercent > 0 ? '#059669' : '#dc2626' }}>
                      {Math.round((1 - reputationModifier) * 100) > 0
                        ? `${Math.round((1 - reputationModifier) * 100)}% Discount`
                        : `${Math.abs(Math.round((1 - reputationModifier) * 100))}% Markup`}
                    </span>
                    {' '}
                    <span style={{ fontSize: '0.85em', color: '#666' }}>
                      ({reputation.factions[FACTIONS.MERCHANTS]}/100 standing)
                    </span>
                  </div>
                )}

                {/* Court Physician Bonus */}
                {courtPhysicianDiscount > 0 && (
                  <div style={{ marginTop: reputation ? '4px' : '0' }}>
                    <strong>👑 Court Physician:</strong>
                    {' '}
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                      +{Math.round(courtPhysicianDiscount * 100)}% Discount
                    </span>
                    {' '}
                    <span style={{ fontSize: '0.85em', color: '#666' }}>
                      (profession bonus)
                    </span>
                  </div>
                )}

                {/* Total Discount */}
                {(reputation || courtPhysicianDiscount > 0) && discountPercent > 0 && (
                  <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #10b98140' }}>
                    <strong>Total Discount:</strong>
                    {' '}
                    <span style={{ color: '#059669', fontWeight: 'bold' }}>
                      {discountPercent}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Black Market Info Banner */}
            {activeTab === 'blackMarket' && (
              <div style={{
                padding: '12px',
                marginBottom: '12px',
                borderRadius: '8px',
                backgroundColor: '#1a1a1a',
                border: '2px solid #8b0000',
                color: '#fff',
                fontSize: '0.9em'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#ff6b6b' }}>
                  🕵️ Shady Merchant's Wares
                </div>
                <div style={{ color: '#ccc', marginBottom: '6px' }}>
                  Access to illicit substances and forbidden items. No questions asked.
                </div>
                <div style={{ fontSize: '0.85em', color: '#aaa' }}>
                  <strong>Available:</strong> {blackMarketCategories.map(cat => {
                    const labels = { poisons: 'Poisons', drugs: 'Drugs', weapons: 'Weapons' };
                    return labels[cat] || cat;
                  }).join(', ')}
                  {blackMarketDiscount > 0 && ` • ${Math.round(blackMarketDiscount * 100)}% Poisoner Discount Applied`}
                </div>
                {gameState.playerLevel >= 10 && blackMarketCategories.includes('weapons') && (
                  <div style={{ marginTop: '6px', fontSize: '0.85em', color: '#90EE90', fontStyle: 'italic' }}>
                    ✨ New: Weapons category unlocked at Level 10!
                  </div>
                )}
                {gameState.playerLevel >= 20 && (
                  <div style={{ marginTop: '6px', fontSize: '0.85em', color: '#ffd700', fontStyle: 'italic' }}>
                    ✨ Rare contraband now available!
                  </div>
                )}
              </div>
            )}

            {/* Medicine Type Filter */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setMedicineTypeFilter('all')}
                style={{
                  padding: '6px 12px',
                  border: medicineTypeFilter === 'all' ? '2px solid #8b4513' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: medicineTypeFilter === 'all' ? '#8b4513' : 'white',
                  color: medicineTypeFilter === 'all' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875em',
                  fontWeight: medicineTypeFilter === 'all' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                All Types ({itemCountsByType.all})
              </button>
              {getAllMedicineTypes().map(type => (
                <button
                  key={type.id}
                  onClick={() => setMedicineTypeFilter(type.id)}
                  style={{
                    padding: '6px 12px',
                    border: medicineTypeFilter === type.id ? `2px solid ${type.color}` : '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: medicineTypeFilter === type.id ? type.color : 'white',
                    color: medicineTypeFilter === type.id ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '0.875em',
                    fontWeight: medicineTypeFilter === type.id ? 'bold' : 'normal',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{type.emoji}</span>
                  <span>{type.name}</span>
                  <span style={{ opacity: 0.8 }}>({itemCountsByType[type.id] || 0})</span>
                </button>
              ))}
            </div>

            {isFetchingItems && activeTab === 'regular' ? (
              <p>Loading items for sale...</p>
            ) : (
              <div className="item-list">
                {filteredItems.map((item) => {
                  const isBlackMarket = activeTab === 'blackMarket';
                  const modifiedPrice = getModifiedPrice(item.price, isBlackMarket);
                  const blackMarketDiscountPercent = Math.round(blackMarketDiscount * 100);

                  return (
                    <div
                      key={item.name}
                      className={`item ${selectedItem === item ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedItem(item);
                        setOfferedPrice(modifiedPrice);
                      }}
                      style={{
                        ...(isBlackMarket && {
                          border: '2px solid #8b0000',
                          backgroundColor: '#2a2a2a',
                          color: '#fff'
                        })
                      }}
                    >
                      {/* Medicine Type Badge */}
                      <div style={{ position: 'relative' }}>
                        <MedicineTypeBadge
                          item={item}
                          size="small"
                          position="top-right"
                          showTooltip={true}
                        />
                      </div>

                      {/* Display emoji centered above the item name */}
                      <span className="emoji" style={{ fontSize: '2rem', display: 'block', textAlign: 'center' }}>{item.emoji}</span>
                      <strong>{item.name}</strong>
                      <div>{item.description}</div>
                      <div style={{ fontStyle: 'italic', marginTop: '8px' }}>Origin: {item.origin}</div>

                      {/* Display properties for black market items */}
                      {isBlackMarket && item.properties && (
                        <div style={{ marginTop: '8px', fontSize: '0.85em', color: '#aaa' }}>
                          {item.properties.join(' • ')}
                        </div>
                      )}

                      <div style={{ fontWeight: 'bold', marginTop: '5px' }}>
                        {modifiedPrice !== item.price ? (
                          <>
                            <span style={{ textDecoration: 'line-through', color: '#999' }}>{item.price}</span>
                            {' '}
                            <span style={{ color: isBlackMarket ? '#90EE90' : (discountPercent > 0 ? '#10b981' : '#ef4444') }}>
                              {modifiedPrice} reales
                            </span>
                            <span style={{ fontSize: '0.85em', marginLeft: '4px', color: isBlackMarket ? '#90EE90' : (discountPercent > 0 ? '#10b981' : '#ef4444') }}>
                              {isBlackMarket ? `(-${blackMarketDiscountPercent}%)` : `(${discountPercent > 0 ? '-' : '+'}${Math.abs(discountPercent)}%)`}
                            </span>
                          </>
                        ) : (
                          <span>Price: {item.price} reales</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedItem && (
              <div className="buy-controls">
                <p>
                  You've selected: <strong>{selectedItem.name}</strong> - {selectedItem.description}
                </p>
                <label>
                  Offer price:
                  <input
                    type="number"
                    value={offeredPrice}
                    onChange={(e) => setOfferedPrice(Number(e.target.value))}
                    min="1"
                  />
                </label>
                <button onClick={() => handleOffer(offeredPrice)} disabled={isFetchingItems}>
                  {isFetchingItems ? 'Processing...' : 'Make Offer'}
                </button>
              </div>
            )}

            {merchantResponse && (
              <div className="merchant-response">
                <p>{merchantResponse}</p>
                <button onClick={() => setMerchantResponse(null)}>Continue</button>
              </div>
            )}

            <button onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Buy;