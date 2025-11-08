/**
 * merchantInventoryGenerator.js
 * Generates daily inventories for merchant NPCs
 *
 * Combines:
 * - Items from initialInventory (curated materia medica)
 * - Clothing items (for clothiers)
 * - Food items (for food vendors)
 * - Tools (for general goods vendors)
 */

import { initialInventoryData } from '../../../initialInventory';
import { getAllPersonalItems } from '../../../core/systems/personalEffects';
import { safeLocalStorage } from '../../../utils/safeLocalStorage';

/**
 * Generate daily inventory for a merchant shop
 * @param {Object} merchantNPC - Merchant NPC entity from EntityList
 * @param {string} gameDate - Current game date (for caching)
 * @returns {Array} Array of items available for purchase
 */
export function generateMerchantInventory(merchantNPC, gameDate) {
  const { id, merchantType, inventory } = merchantNPC;

  if (!inventory) {
    console.error('[MerchantInventory] No inventory config for merchant:', merchantNPC.name);
    return [];
  }

  const { categories, size, priceVariation } = inventory;

  // Generate cache key
  const cacheKey = `merchant_${id}_${gameDate}`;

  // Check cache first
  const cached = safeLocalStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsedCache = JSON.parse(cached);
      console.log(`[MerchantInventory] Using cached inventory for ${merchantNPC.name} (${parsedCache.length} items)`);
      return parsedCache;
    } catch (e) {
      console.warn('[MerchantInventory] Cache parse error, regenerating');
    }
  }

  // Generate new inventory
  console.log(`[MerchantInventory] Generating new inventory for ${merchantNPC.name}`);
  const items = [];

  // Seed random generator with merchant ID and date for consistency
  const seed = hashString(id + gameDate);
  const rng = seededRandom(seed);

  // 1. Get materia medica from initialInventory
  if (shouldIncludeMateriaMedica(categories)) {
    const materiaMedica = initialInventoryData.filter(item =>
      item.categories?.some(cat => categories.includes(cat))
    );

    if (materiaMedica.length > 0) {
      // Randomly select items based on size config
      const targetCount = Math.floor(size[0] + rng() * (size[1] - size[0]));
      const selected = shuffleArray(materiaMedica, rng).slice(0, targetCount);

      // Add with price variation and random quantities
      selected.forEach(item => {
        const priceModifier = 1 + (rng() - 0.5) * 2 * priceVariation;
        items.push({
          ...item,
          id: item.id || `${item.name.replace(/\s+/g, '_').toLowerCase()}`,
          price: Math.max(1, Math.round(item.price * priceModifier)),
          quantity: Math.floor(rng() * 10) + 1,
          source: 'merchant',
          merchantId: id
        });
      });
    }
  }

  // 2. Get textiles if textile merchant
  if (merchantType === 'textile_merchant' || categories.includes('textiles')) {
    const textileItems = [
      // Common fabrics
      { name: 'Cotton Manta', price: 4, emoji: '🧵', description: 'Plain white cotton cloth, locally woven', rarity: 'common' },
      { name: 'Wool Fabric', price: 6, emoji: '🧶', description: 'Coarse brown wool for everyday garments', rarity: 'common' },
      { name: 'Linen Cloth', price: 8, emoji: '🧵', description: 'White linen from Spain, breathable and fine', rarity: 'common' },
      { name: 'Indigo-Dyed Cotton', price: 10, emoji: '🔵', description: 'Cotton fabric dyed deep blue with índigo', rarity: 'common' },
      { name: 'Cochineal Red Wool', price: 12, emoji: '🔴', description: 'Wool dyed crimson with cochineal insects', rarity: 'common' },
      { name: 'Silk Thread', price: 15, emoji: '🧵', description: 'Fine silk thread for embroidery', rarity: 'common' },
      { name: 'Hemp Canvas', price: 5, emoji: '⛵', description: 'Rough hemp canvas for sacks and tents', rarity: 'common' },

      // Scarce fabrics
      { name: 'Velvet Fabric', price: 25, emoji: '✨', description: 'Luxurious velvet from Italy, rich texture', rarity: 'scarce' },
      { name: 'Brocade', price: 30, emoji: '👑', description: 'Ornate woven fabric with metallic threads', rarity: 'scarce' },
      { name: 'Fine Lace', price: 20, emoji: '🕸️', description: 'Delicate handmade lace from Flanders', rarity: 'scarce' },
      { name: 'Damask', price: 28, emoji: '🌸', description: 'Reversible figured fabric with elaborate patterns', rarity: 'scarce' },
      { name: 'Saffron-Dyed Silk', price: 35, emoji: '🟡', description: 'Golden yellow silk dyed with precious saffron', rarity: 'scarce' },

      // Rare luxury fabrics
      { name: 'Chinese Silk', price: 50, emoji: '🐉', description: 'Finest silk from the Manila galleon trade', rarity: 'rare' },
      { name: 'Cloth of Gold', price: 80, emoji: '✨', description: 'Fabric woven with actual gold threads', rarity: 'rare' },
      { name: 'Tyrian Purple Wool', price: 60, emoji: '💜', description: 'Wool dyed with rare murex shells, royal color', rarity: 'rare' }
    ];

    const targetCount = Math.floor(size[0] * 0.8 + rng() * (size[1] - size[0] * 0.8));

    // Weighted selection based on rarity
    const selected = [];
    const shuffled = shuffleArray(textileItems, rng);

    for (const item of shuffled) {
      if (selected.length >= targetCount) break;

      const roll = rng();
      if (item.rarity === 'rare' && roll > 0.08) continue; // 8% chance
      if (item.rarity === 'scarce' && roll > 0.30) continue; // 30% chance

      selected.push(item);
    }

    items.push(...selected.map(item => ({
      ...item,
      id: `textile_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
      quantity: Math.floor(rng() * 8) + 2,
      source: 'merchant',
      merchantId: id,
      categories: ['textiles'],
      tags: item.rarity !== 'common' ? [item.rarity] : []
    })));
  }

  // 2b. Get clothing if clothier (NOT textile merchant)
  if (categories.includes('clothing') && merchantType !== 'textile_merchant' && !categories.includes('textiles')) {
    const clothing = getAllPersonalItems('clothing') || [];
    const targetCount = Math.min(12, Math.floor(size[0] + rng() * (size[1] - size[0])));
    const selected = shuffleArray(clothing, rng).slice(0, targetCount);

    selected.forEach(item => {
      const basePrice = item.basePrice || item.price || 10;
      const priceModifier = 1 + (rng() - 0.5) * 2 * priceVariation;
      items.push({
        ...item,
        id: item.id || `${item.name.replace(/\s+/g, '_').toLowerCase()}`,
        name: item.name,
        price: Math.max(1, Math.round(basePrice * priceModifier)),
        quantity: Math.floor(rng() * 5) + 1,
        source: 'merchant',
        merchantId: id,
        entityType: 'clothing',
        categories: ['clothing']
      });
    });
  }

  // 3a. Get vegetables if vegetable vendor
  if (merchantType === 'vegetable_vendor') {
    const vegetableItems = [
      // Common vegetables from chinampas
      { name: 'Tomatoes', price: 1, emoji: '🍅', description: 'Red tomatoes from the chinampas, ripe and firm', rarity: 'common' },
      { name: 'Chili Peppers', price: 1, emoji: '🌶️', description: 'Fresh green and red peppers, varying heat', rarity: 'common' },
      { name: 'Squash', price: 2, emoji: '🎃', description: 'Winter squash, calabaza variety', rarity: 'common' },
      { name: 'Black Beans', price: 1, emoji: '🫘', description: 'Dried black beans, one pound', rarity: 'common' },
      { name: 'Maize', price: 1, emoji: '🌽', description: 'White and yellow corn kernels for grinding', rarity: 'common' },
      { name: 'Nopal Cactus', price: 1, emoji: '🌵', description: 'Fresh nopal pads, spines removed', rarity: 'common' },
      { name: 'Quelites', price: 1, emoji: '🥬', description: 'Wild greens and herbs from the fields', rarity: 'common' },
      { name: 'Epazote', price: 1, emoji: '🌿', description: 'Pungent herb for beans and stews', rarity: 'common' },
      { name: 'Cilantro', price: 1, emoji: '🌿', description: 'Fresh coriander leaves, aromatic', rarity: 'common' },
      { name: 'Verdolagas', price: 1, emoji: '🥬', description: 'Purslane greens, tender and nutritious', rarity: 'common' },

      // Scarce items
      { name: 'Avocados', price: 3, emoji: '🥑', description: 'Aguacate from Xochimilco orchards', rarity: 'scarce' },
      { name: 'Tomatillos', price: 2, emoji: '🟢', description: 'Green tomatoes with papery husks', rarity: 'scarce' },
      { name: 'Chayote', price: 2, emoji: '🥒', description: 'Pear-shaped squash, mild and crisp', rarity: 'scarce' },
      { name: 'Amaranth Greens', price: 2, emoji: '🥬', description: 'Nutritious quelite from amaranth plants', rarity: 'scarce' },
      { name: 'Fresh Herbs Bundle', price: 2, emoji: '🌿', description: 'Epazote, cilantro, and hierba santa', rarity: 'scarce' },

      // Rare specialty items
      { name: 'Huitlacoche', price: 5, emoji: '🌽', description: 'Corn smut fungus, prized delicacy', rarity: 'rare' },
      { name: 'White Sapote', price: 4, emoji: '🍑', description: 'Sweet white fruit from indigenous orchards', rarity: 'rare' },
      { name: 'Maguey Hearts', price: 6, emoji: '🌵', description: 'Fresh agave hearts for cooking', rarity: 'rare' }
    ];

    const targetCount = Math.floor(size[0] + rng() * (size[1] - size[0]));

    // Weighted selection based on rarity
    const selected = [];
    const shuffled = shuffleArray(vegetableItems, rng);

    for (const item of shuffled) {
      if (selected.length >= targetCount) break;

      const roll = rng();
      if (item.rarity === 'rare' && roll > 0.12) continue; // 12% chance
      if (item.rarity === 'scarce' && roll > 0.35) continue; // 35% chance

      selected.push(item);
    }

    items.push(...selected.map(item => ({
      ...item,
      id: `vegetable_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
      quantity: Math.floor(rng() * 20) + 8,
      source: 'merchant',
      merchantId: id,
      categories: ['food', 'dietary'],
      tags: item.rarity !== 'common' ? [item.rarity] : []
    })));
  }

  // 3b. Get food items if general food vendor (but NOT butcher or vegetable vendor)
  const isFoodVendor = (categories.includes('food') || categories.includes('dietary')) &&
                        merchantType !== 'butcher' &&
                        merchantType !== 'vegetable_vendor';
  if (isFoodVendor) {
    const foodItems = [
      // Common foods
      { name: 'Tortillas', price: 1, emoji: '🫓', description: 'Fresh corn tortillas, still warm', rarity: 'common' },
      { name: 'Tamales', price: 2, emoji: '🫔', description: 'Steamed masa with savory filling', rarity: 'common' },
      { name: 'Fresh Fish', price: 3, emoji: '🐟', description: 'From Lake Texcoco, caught this morning', rarity: 'common' },
      { name: 'Pulque', price: 2, emoji: '🍺', description: 'Fermented agave drink, slightly sour', rarity: 'common' },
      { name: 'Atole', price: 1, emoji: '☕', description: 'Warm corn drink, thick and comforting', rarity: 'common' },
      { name: 'Dried Chilies', price: 2, emoji: '🌶️', description: 'Ancho and guajillo chilies, sun-dried', rarity: 'common' },
      { name: 'Salt', price: 1, emoji: '🧂', description: 'Sea salt from Veracruz coast', rarity: 'common' },
      { name: 'Piloncillo', price: 1, emoji: '🟤', description: 'Unrefined cane sugar cone', rarity: 'common' },

      // Scarce foods
      { name: 'Chocolate', price: 6, emoji: '🍫', description: 'Ground cacao for drinking, unsweetened', rarity: 'scarce' },
      { name: 'Honey', price: 5, emoji: '🍯', description: 'Wild honey in clay jar', rarity: 'scarce' },
      { name: 'Cheese', price: 4, emoji: '🧀', description: 'Fresh queso fresco from nearby ranch', rarity: 'scarce' },
      { name: 'Wheat Bread', price: 3, emoji: '🍞', description: 'Spanish-style wheat loaf', rarity: 'scarce' },
      { name: 'Olive Oil', price: 8, emoji: '🫒', description: 'Imported Spanish olive oil, one bottle', rarity: 'scarce' },

      // Rare luxury foods
      { name: 'Vanilla Pods', price: 12, emoji: '🌺', description: 'Precious vanilla from Veracruz', rarity: 'rare' },
      { name: 'Spanish Wine', price: 10, emoji: '🍷', description: 'Red wine from Andalusia', rarity: 'rare' },
      { name: 'Almonds', price: 8, emoji: '🥜', description: 'Imported almonds from Spain', rarity: 'rare' }
    ];

    const targetCount = Math.floor(size[0] * 0.6 + rng() * (size[1] - size[0] * 0.6));

    // Weighted selection based on rarity
    const selected = [];
    const shuffled = shuffleArray(foodItems, rng);

    for (const item of shuffled) {
      if (selected.length >= targetCount) break;

      const roll = rng();
      if (item.rarity === 'rare' && roll > 0.10) continue; // 10% chance
      if (item.rarity === 'scarce' && roll > 0.30) continue; // 30% chance

      selected.push(item);
    }

    items.push(...selected.map(item => ({
      ...item,
      id: `food_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
      quantity: Math.floor(rng() * 15) + 5,
      source: 'merchant',
      merchantId: id,
      categories: ['food'],
      tags: item.rarity !== 'common' ? [item.rarity] : []
    })));
  }

  // 4. Get pottery if potter
  if (merchantType === 'potter' || categories.includes('pottery')) {
    const potteryItems = [
      // Common pottery
      { name: 'Drinking Cup', price: 1, emoji: '🥤', description: 'Small clay cup, unglazed', rarity: 'common' },
      { name: 'Ceramic Bowl', price: 2, emoji: '🥣', description: 'Hand-formed clay bowl with simple designs', rarity: 'common' },
      { name: 'Water Jug', price: 3, emoji: '🏺', description: 'Clay jug for storing water', rarity: 'common' },
      { name: 'Comal', price: 3, emoji: '🫓', description: 'Flat clay griddle for cooking tortillas', rarity: 'common' },
      { name: 'Storage Jar', price: 4, emoji: '⚱️', description: 'Large earthenware jar with lid', rarity: 'common' },
      { name: 'Cooking Pot', price: 5, emoji: '🍲', description: 'Large clay pot for stews and soups', rarity: 'common' },
      { name: 'Oil Lamp', price: 2, emoji: '🪔', description: 'Small clay lamp for oil or tallow', rarity: 'common' },
      { name: 'Plate', price: 2, emoji: '🍽️', description: 'Flat ceramic plate for serving food', rarity: 'common' },

      // Scarce pottery
      { name: 'Molcajete', price: 7, emoji: '🗿', description: 'Three-legged stone mortar for grinding spices', rarity: 'scarce' },
      { name: 'Grinding Bowl', price: 6, emoji: '🥣', description: 'Wide shallow bowl for preparing maize', rarity: 'scarce' },
      { name: 'Flower Vase', price: 5, emoji: '🏺', description: 'Narrow-necked vase with painted patterns', rarity: 'scarce' },
      { name: 'Incense Burner', price: 8, emoji: '🪔', description: 'Decorative clay brazier for copal incense', rarity: 'scarce' },
      { name: 'Painted Bowl', price: 7, emoji: '🥣', description: 'Bowl with intricate geometric patterns in red and black', rarity: 'scarce' },
      { name: 'Pulque Jar', price: 6, emoji: '🏺', description: 'Traditional olla for fermenting pulque', rarity: 'scarce' },

      // Rare ceremonial pottery
      { name: 'Ceremonial Vessel', price: 12, emoji: '⚱️', description: 'Decorative pot with pre-Hispanic motifs', rarity: 'rare' },
      { name: 'Xoloitzcuintli Figurine', price: 10, emoji: '🐕', description: 'Clay figurine of sacred dog, hand-molded', rarity: 'rare' },
      { name: 'Aztec Calendar Stone Replica', price: 15, emoji: '☀️', description: 'Miniature carved stone with calendar symbols', rarity: 'rare' },
      { name: 'Tlaloc Rain God Vessel', price: 14, emoji: '⚱️', description: 'Sacred water vessel with rain god imagery', rarity: 'rare' }
    ];

    const targetCount = Math.floor(size[0] * 0.8 + rng() * (size[1] - size[0] * 0.8));

    // Weighted selection based on rarity
    const selected = [];
    const shuffled = shuffleArray(potteryItems, rng);

    for (const item of shuffled) {
      if (selected.length >= targetCount) break;

      const roll = rng();
      if (item.rarity === 'rare' && roll > 0.08) continue; // 8% chance
      if (item.rarity === 'scarce' && roll > 0.35) continue; // 35% chance

      selected.push(item);
    }

    items.push(...selected.map(item => ({
      ...item,
      id: `pottery_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
      quantity: Math.floor(rng() * 12) + 3,
      source: 'merchant',
      merchantId: id,
      categories: ['pottery', 'tool'],
      tags: item.rarity !== 'common' ? [item.rarity] : []
    })));
  }

  // 5. Get butcher items if butcher
  if (merchantType === 'butcher' || categories.includes('butcher')) {
    const butcherItems = [
      // Common meats
      { name: 'Beef', price: 6, emoji: '🥩', description: 'Fresh beef cuts, ready for cooking', rarity: 'common' },
      { name: 'Pork', price: 5, emoji: '🥓', description: 'Pork shoulder and belly cuts', rarity: 'common' },
      { name: 'Mutton', price: 4, emoji: '🍖', description: 'Lamb and mutton cuts', rarity: 'common' },
      { name: 'Chicken', price: 3, emoji: '🍗', description: 'Whole chicken, plucked and cleaned', rarity: 'common' },
      { name: 'Chorizo', price: 4, emoji: '🌭', description: 'Spanish-style pork sausages with paprika', rarity: 'common' },
      { name: 'Salt Pork', price: 5, emoji: '🥓', description: 'Salt-cured pork belly, preserved', rarity: 'common' },
      { name: 'Beef Liver', price: 2, emoji: '🫀', description: 'Fresh beef liver', rarity: 'common' },
      { name: 'Tallow', price: 1, emoji: '🕯️', description: 'Rendered animal fat for candles and cooking', rarity: 'common' },
      { name: 'Pork Ribs', price: 5, emoji: '🥩', description: 'Fresh pork ribs with meat', rarity: 'common' },
      { name: 'Beef Tongue', price: 4, emoji: '👅', description: 'Whole beef tongue, ready for cooking', rarity: 'common' },

      // Scarce items
      { name: 'Veal', price: 8, emoji: '🥩', description: 'Tender veal from young calf', rarity: 'scarce' },
      { name: 'Duck', price: 7, emoji: '🦆', description: 'Whole duck, plucked and dressed', rarity: 'scarce' },
      { name: 'Rabbit', price: 6, emoji: '🐇', description: 'Wild rabbit, skinned and cleaned', rarity: 'scarce' },
      { name: 'Bone Marrow', price: 4, emoji: '🦴', description: 'Beef marrow bones for broth', rarity: 'scarce' },
      { name: 'Morcilla', price: 5, emoji: '🌭', description: 'Blood sausage with pork blood and rice', rarity: 'scarce' },
      { name: 'Pork Head Cheese', price: 6, emoji: '🧀', description: 'Jellied loaf made from pig head meat', rarity: 'scarce' },
      { name: 'Turkey', price: 9, emoji: '🦃', description: 'Whole turkey from local farms', rarity: 'scarce' },
      { name: 'Goat Meat', price: 5, emoji: '🐐', description: 'Cabrito cuts, tender and flavorful', rarity: 'scarce' },

      // Rare luxury meats
      { name: 'Venison', price: 14, emoji: '🦌', description: 'Fresh deer meat from royal hunt', rarity: 'rare' },
      { name: 'Wild Boar', price: 18, emoji: '🐗', description: 'Wild boar haunch, gamey and rich', rarity: 'rare' },
      { name: 'Quail', price: 12, emoji: '🐦', description: 'Delicate quail, favored by nobles', rarity: 'rare' },
      { name: 'Peacock', price: 20, emoji: '🦚', description: 'Exotic peacock for wealthy tables', rarity: 'rare' },
      { name: 'Suckling Pig', price: 16, emoji: '🐷', description: 'Whole young pig, roasted golden', rarity: 'rare' }
    ];

    const targetCount = Math.floor(size[0] * 0.7 + rng() * (size[1] - size[0] * 0.7));

    // Weighted selection based on rarity
    const selected = [];
    const shuffled = shuffleArray(butcherItems, rng);

    for (const item of shuffled) {
      if (selected.length >= targetCount) break;

      // Spawn chance based on rarity
      const roll = rng();
      if (item.rarity === 'rare' && roll > 0.15) continue; // 15% chance
      if (item.rarity === 'scarce' && roll > 0.35) continue; // 35% chance
      // Common items always spawn

      selected.push(item);
    }

    items.push(...selected.map(item => ({
      ...item,
      id: `meat_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
      quantity: Math.floor(rng() * 6) + 2,
      source: 'merchant',
      merchantId: id,
      categories: ['food', 'animal'],
      tags: item.rarity !== 'common' ? [item.rarity] : []
    })));
  }

  // 6. Get leather goods if leather worker
  if (merchantType === 'leather_worker' || categories.includes('leather')) {
    const leatherItems = [
      // Common items
      { name: 'Leather Straps', price: 1, emoji: '🪢', description: 'Strips of leather for repairs', rarity: 'common' },
      { name: 'Leather Pouch', price: 2, emoji: '👝', description: 'Small leather pouch for coins', rarity: 'common' },
      { name: 'Leather Belt', price: 3, emoji: '🔗', description: 'Simple leather belt with iron buckle', rarity: 'common' },
      { name: 'Leather Apron', price: 6, emoji: '🦺', description: 'Heavy leather apron for craftsmen', rarity: 'common' },
      { name: 'Satchel', price: 5, emoji: '🎒', description: 'Leather shoulder bag for travel', rarity: 'common' },
      { name: 'Work Boots', price: 8, emoji: '🥾', description: 'Sturdy leather boots for laborers', rarity: 'common' },
      { name: 'Leather Sheath', price: 4, emoji: '🗡️', description: 'Knife sheath with belt loop', rarity: 'common' },
      { name: 'Water Skin', price: 3, emoji: '🫙', description: 'Leather flask for carrying water', rarity: 'common' },

      // Scarce items
      { name: 'Coin Purse', price: 5, emoji: '💰', description: 'Embossed leather purse with drawstring', rarity: 'scarce' },
      { name: 'Leather Gloves', price: 8, emoji: '🧤', description: 'Fine leather gloves, lined with wool', rarity: 'scarce' },
      { name: 'Document Case', price: 12, emoji: '📂', description: 'Leather case for important papers', rarity: 'scarce' },
      { name: 'Saddle Bags', price: 14, emoji: '🎒', description: 'Pair of leather bags for horses', rarity: 'scarce' },
      { name: 'Riding Boots', price: 16, emoji: '🥾', description: 'Tall leather boots for horseback riding', rarity: 'scarce' },
      { name: 'Leather Journal', price: 10, emoji: '📔', description: 'Blank journal with leather binding', rarity: 'scarce' },
      { name: 'Belt with Silver Buckle', price: 12, emoji: '🔗', description: 'Fine leather belt with silver adornment', rarity: 'scarce' },

      // Rare luxury items
      { name: 'Leather-bound Book Cover', price: 20, emoji: '📕', description: 'Tooled leather binding for books with gold leaf', rarity: 'rare' },
      { name: 'Gentleman\'s Riding Gloves', price: 22, emoji: '🧤', description: 'Soft kid leather gloves with silk embroidery', rarity: 'rare' },
      { name: 'Toledan Boots', price: 28, emoji: '👢', description: 'Finest Spanish leather boots, Toledan style', rarity: 'rare' },
      { name: 'Saddle', price: 45, emoji: '🏇', description: 'Complete leather saddle with brass stirrups', rarity: 'rare' },
      { name: 'Embossed Scabbard', price: 25, emoji: '⚔️', description: 'Ornate leather sword scabbard with metalwork', rarity: 'rare' }
    ];

    const targetCount = Math.floor(size[0] * 0.7 + rng() * (size[1] - size[0] * 0.7));

    // Weighted selection based on rarity
    const selected = [];
    const shuffled = shuffleArray(leatherItems, rng);

    for (const item of shuffled) {
      if (selected.length >= targetCount) break;

      const roll = rng();
      if (item.rarity === 'rare' && roll > 0.12) continue; // 12% chance
      if (item.rarity === 'scarce' && roll > 0.40) continue; // 40% chance

      selected.push(item);
    }

    items.push(...selected.map(item => ({
      ...item,
      id: `leather_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
      quantity: Math.floor(rng() * 5) + 1,
      source: 'merchant',
      merchantId: id,
      categories: ['clothing', 'tool'],
      tags: item.rarity !== 'common' ? [item.rarity] : []
    })));
  }

  // 7. Get woven goods if basket weaver
  if (merchantType === 'basket_weaver' || categories.includes('woven')) {
    const wovenItems = [
      // Common items
      { name: 'Palm Fan', price: 1, emoji: '🪭', description: 'Woven palm fan for cooling', rarity: 'common' },
      { name: 'Small Basket', price: 1, emoji: '🧺', description: 'Small woven basket for tortillas', rarity: 'common' },
      { name: 'Market Basket', price: 2, emoji: '🧺', description: 'Large basket for carrying goods', rarity: 'common' },
      { name: 'Tortilla Basket', price: 2, emoji: '🧺', description: 'Flat woven basket lined with cloth', rarity: 'common' },
      { name: 'Carrying Net', price: 2, emoji: '🕸️', description: 'Maguey fiber net for hauling goods', rarity: 'common' },
      { name: 'Sleeping Mat', price: 3, emoji: '🏞️', description: 'Woven petate mat for sleeping', rarity: 'common' },
      { name: 'Storage Basket', price: 3, emoji: '🧺', description: 'Deep basket with lid for storage', rarity: 'common' },
      { name: 'Reed Hat', price: 2, emoji: '👒', description: 'Woven straw hat for sun protection', rarity: 'common' },
      { name: 'Twine', price: 1, emoji: '🧵', description: 'Maguey fiber twine for binding', rarity: 'common' },

      // Scarce items
      { name: 'Maguey Rope', price: 5, emoji: '🪢', description: 'Strong rope woven from maguey fiber', rarity: 'scarce' },
      { name: 'Decorative Mat', price: 7, emoji: '🏞️', description: 'Petate with intricate geometric patterns', rarity: 'scarce' },
      { name: 'Ceremonial Basket', price: 10, emoji: '🧺', description: 'Ornate basket with traditional designs', rarity: 'scarce' },
      { name: 'Reed Screen', price: 9, emoji: '🎋', description: 'Woven reed divider for rooms', rarity: 'scarce' },
      { name: 'Woven Wall Hanging', price: 8, emoji: '🖼️', description: 'Decorative wall piece with indigenous motifs', rarity: 'scarce' },
      { name: 'Fruit Basket', price: 5, emoji: '🧺', description: 'Large shallow basket for displaying fruit', rarity: 'scarce' },

      // Rare specialty items
      { name: 'Wedding Basket', price: 18, emoji: '🧺', description: 'Elaborate basket for ceremonial gifts, intricate weave', rarity: 'rare' },
      { name: 'Royal Mat', price: 25, emoji: '🏞️', description: 'Finely woven mat with noble motifs and dyed patterns', rarity: 'rare' },
      { name: 'Medicine Basket', price: 15, emoji: '🧺', description: 'Special basket for storing healing herbs, with secret compartment', rarity: 'rare' },
      { name: 'Feathered Fan', price: 20, emoji: '🪶', description: 'Woven fan adorned with precious feathers', rarity: 'rare' }
    ];

    const targetCount = Math.floor(size[0] * 0.8 + rng() * (size[1] - size[0] * 0.8));

    // Weighted selection based on rarity
    const selected = [];
    const shuffled = shuffleArray(wovenItems, rng);

    for (const item of shuffled) {
      if (selected.length >= targetCount) break;

      const roll = rng();
      if (item.rarity === 'rare' && roll > 0.10) continue; // 10% chance
      if (item.rarity === 'scarce' && roll > 0.35) continue; // 35% chance

      selected.push(item);
    }

    items.push(...selected.map(item => ({
      ...item,
      id: `woven_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
      quantity: Math.floor(rng() * 8) + 2,
      source: 'merchant',
      merchantId: id,
      categories: ['tool', 'common'],
      tags: item.rarity !== 'common' ? [item.rarity] : []
    })));
  }

  // 8. Get tools if tool vendor
  if (merchantType === 'tool_vendor' || (categories.includes('tool') && merchantType === 'general_goods')) {
    const toolItems = [
      // Common carpentry tools
      { name: 'Iron Hammer', price: 6, emoji: '🔨', description: 'Iron-headed hammer with wooden handle', rarity: 'common' },
      { name: 'Hand Saw', price: 8, emoji: '🪚', description: 'Steel saw for cutting wood', rarity: 'common' },
      { name: 'Wood Chisel', price: 5, emoji: '🔧', description: 'Sharp chisel for woodworking', rarity: 'common' },
      { name: 'Iron Nails', price: 2, emoji: '📌', description: 'Sack of hand-forged iron nails', rarity: 'common' },
      { name: 'Hemp Rope', price: 3, emoji: '🪢', description: 'Coiled hemp rope, ten varas long', rarity: 'common' },
      { name: 'Wooden Mallet', price: 4, emoji: '🔨', description: 'Hardwood mallet for driving stakes', rarity: 'common' },
      { name: 'Iron Hoe', price: 7, emoji: '⛏️', description: 'Heavy hoe for tilling soil', rarity: 'common' },
      { name: 'Sickle', price: 5, emoji: '🌾', description: 'Curved iron blade for harvesting grain', rarity: 'common' },
      { name: 'Iron Knife', price: 6, emoji: '🔪', description: 'Sharp utility knife with wooden handle', rarity: 'common' },
      { name: 'Tallow Candles', price: 2, emoji: '🕯️', description: 'Bundle of six tallow candles', rarity: 'common' },
      { name: 'Flint and Steel', price: 3, emoji: '🔥', description: 'For striking sparks and lighting fires', rarity: 'common' },
      { name: 'Iron Hooks', price: 4, emoji: '🪝', description: 'Set of three iron hooks for hanging', rarity: 'common' },

      // Scarce specialized tools
      { name: 'Hand Plane', price: 12, emoji: '🪛', description: 'Woodworking plane for smoothing boards', rarity: 'scarce' },
      { name: 'Awl', price: 5, emoji: '🪡', description: 'Sharp awl for punching holes in leather', rarity: 'scarce' },
      { name: 'Iron Scissors', price: 10, emoji: '✂️', description: 'Steel scissors for cutting cloth', rarity: 'scarce' },
      { name: 'Metal File', price: 8, emoji: '🔧', description: 'Steel file for shaping and smoothing metal', rarity: 'scarce' },
      { name: 'Iron Tongs', price: 9, emoji: '🔥', description: 'Blacksmith tongs for handling hot metal', rarity: 'scarce' },
      { name: 'Crowbar', price: 10, emoji: '🔧', description: 'Iron crowbar for prying and leverage', rarity: 'scarce' },
      { name: 'Scythe', price: 14, emoji: '🌾', description: 'Long-handled scythe for cutting hay', rarity: 'scarce' },
      { name: 'Iron Rake', price: 7, emoji: '🍂', description: 'Heavy rake for clearing debris', rarity: 'scarce' },
      { name: 'Chain Links', price: 8, emoji: '⛓️', description: 'Iron chain, three varas long', rarity: 'scarce' },
      { name: 'Mortar and Pestle', price: 8, emoji: '🗿', description: 'Stone grinding tools for medicines', rarity: 'scarce' },

      // Rare high-quality tools
      { name: 'Toledo Steel Blade', price: 25, emoji: '⚔️', description: 'Fine steel blade from Toledo workshops', rarity: 'rare' },
      { name: 'Brass Compass', price: 20, emoji: '🧭', description: 'Navigation compass with brass case', rarity: 'rare' },
      { name: 'Iron Anvil', price: 35, emoji: '⚒️', description: 'Small blacksmith anvil for metalwork', rarity: 'rare' },
      { name: 'Glass Lenses', price: 18, emoji: '🔍', description: 'Magnifying lens from European glassmakers', rarity: 'rare' },
      { name: 'Steel Saw Set', price: 30, emoji: '🪚', description: 'Complete set of fine steel saws', rarity: 'rare' }
    ];

    const targetCount = Math.floor(size[0] + rng() * (size[1] - size[0]));
    const shuffled = shuffleArray(toolItems, rng);
    const selected = [];

    for (const item of shuffled) {
      if (selected.length >= targetCount) break;
      const roll = rng();
      // Rarity weights: rare 8%, scarce 30%, common always
      if (item.rarity === 'rare' && roll > 0.08) continue;
      if (item.rarity === 'scarce' && roll > 0.30) continue;
      selected.push(item);
    }

    items.push(...selected.map(item => ({
      ...item,
      id: `tool_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
      quantity: Math.floor(rng() * 8) + 2,
      source: 'merchant',
      merchantId: id,
      categories: ['tool'],
      tags: item.rarity !== 'common' ? [item.rarity] : []
    })));
  }

  // Cache the generated inventory
  safeLocalStorage.setItem(cacheKey, JSON.stringify(items));

  console.log(`[MerchantInventory] Generated ${items.length} items for ${merchantNPC.name}`);
  return items;
}

/**
 * Check if merchant type should include materia medica
 */
function shouldIncludeMateriaMedica(categories) {
  const mmCategories = ['herb', 'alchemical', 'animal', 'imported', 'exotic', 'spice', 'indigenous', 'mineral'];
  return categories.some(cat => mmCategories.includes(cat));
}

/**
 * Hash string to number (simple hash for seeding)
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator
 * Returns a function that generates consistent random numbers
 */
function seededRandom(seed) {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Shuffle array using seeded random
 */
function shuffleArray(array, rng) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Clear all cached merchant inventories (useful for testing)
 */
export function clearMerchantInventoryCache() {
  const keys = safeLocalStorage.keys();
  keys.forEach(key => {
    if (key.startsWith('merchant_')) {
      safeLocalStorage.removeItem(key);
    }
  });
  console.log('[MerchantInventory] Cleared all merchant inventory caches');
}
