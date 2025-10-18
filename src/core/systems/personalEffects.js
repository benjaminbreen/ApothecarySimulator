/**
 * Personal Effects Generator
 *
 * Generates historically authentic personal belongings for Maria de Lima
 * Based on historical records of converso households in 1680s Mexico City
 */

export function generatePersonalEffects() {
  return {
    // Books & Papers (on bookshelf)
    books: [
   
      {
        name: "Commonplace Book",
        category: "Books & Papers",
        location: "Desk",
        description: "Your personal compendium of remedies, compounds, and patient notes.",
        emoji: "📓",
        value: 25,
        origin: "Mexico City (your handwriting)",
        rarity: "common",
        canSell: false // Personal
      },
     
    ],

    // Clothing & Textiles (in trunk)
    clothing: [
   
      {
        name: "Linen Chemise",
        category: "Clothing & Textiles",
        location: "Trunk",
        description: "Undergarment, off-white linen. Worn daily beneath outer dress.",
        emoji: "👚",
        value: 3,
        origin: "Puebla",
        rarity: "common",
        canSell: true
      },
      {
        name: "Embroidered Shawl (Rebozo)",
        category: "Clothing & Textiles",
        location: "Trunk",
        description: "Indigenous-style shawl with Portuguese embroidery patterns. A blend of cultures.",
        emoji: "🧣",
        value: 12,
        origin: "Mexico City",
        rarity: "uncommon",
        canSell: true
      },
      

    ],

    // Kitchen & Household (various locations)
    household: [
      {
        name: "Copper Cooking Pot",
        category: "Kitchen & Household",
        location: "Kitchen",
        description: "Large pot for preparing meals and decoctions. Dented but functional.",
        emoji: "🍲",
        value: 12,
        origin: "Mexico City",
        rarity: "common",
        canSell: true
      },
      {
        name: "Clay Water Jug",
        category: "Kitchen & Household",
        location: "Kitchen",
        description: "Keeps water cool through evaporation. Indigenous craftsmanship.",
        emoji: "🏺",
        value: 2,
        origin: "Tlaxcala",
        rarity: "common",
        canSell: true
      },
      {
        name: "Wooden Spoons (Set of 3)",
        category: "Kitchen & Household",
        location: "Kitchen",
        description: "Carved mesquite wood. Essential cooking implements.",
        emoji: "🥄",
        value: 1,
        origin: "Mexico City",
        rarity: "common",
        canSell: true
      },
      {
        name: "Pewter Plate",
        category: "Kitchen & Household",
        location: "Kitchen",
        description: "Your only metal plate. Reserved for special meals.",
        emoji: "🍽️",
        value: 6,
        origin: "New Spain",
        rarity: "uncommon",
        canSell: true
      },
      {
        name: "Beeswax Candles (Bundle)",
        category: "Kitchen & Household",
        location: "Cupboard",
        description: "Six tallow candles. Essential for working after sunset.",
        emoji: "🕯️",
        value: 4,
        origin: "Mexico City",
        rarity: "common",
        canSell: true
      },
      {
        name: "Woven Petate Mat",
        category: "Kitchen & Household",
        location: "Bedroom",
        description: "Palm fiber sleeping mat. Indigenous style, but you prefer it to European bedding.",
        emoji: "🧺",
        value: 3,
        origin: "Cholula",
        rarity: "common",
        canSell: true
      },
      {
        name: "Wool Blanket",
        category: "Kitchen & Household",
        location: "Bedroom",
        description: "Heavy blanket for cold highland nights. Naturally dyed brown.",
        emoji: "🛏️",
        value: 10,
        origin: "Querétaro",
        rarity: "common",
        canSell: true
      }
    ],

    // Religious Items (for appearance)
    religious: [
      {
        name: "Wooden Crucifix",
        category: "Religious Items",
        location: "Bedroom Wall",
        description: "Hangs prominently above your bed. A necessary display of Catholic faith.",
        emoji: "✝️",
        value: 5,
        origin: "Mexico City",
        rarity: "common",
        canSell: false // Too suspicious
      },
  
    ],

    // Personal Items (in chest)
    personal: [
      {
        name: "Silver Hand Mirror",
        category: "Personal Items",
        location: "Chest",
        description: "Tarnished silver mirror. Your mother's, brought from Portugal.",
        emoji: "🪞",
        value: 20,
        origin: "Lisbon",
        rarity: "uncommon",
        canSell: true
      },
      {
        name: "Ivory Comb",
        category: "Personal Items",
        location: "Chest",
        description: "Fine-toothed comb carved from ivory. A luxury from your former life.",
        emoji: "💎",
        value: 15,
        origin: "Manila (via Acapulco)",
        rarity: "rare",
        canSell: true
      },
      {
        name: "Sewing Kit",
        category: "Personal Items",
        location: "Chest",
        description: "Needles, thread, and small scissors. Essential for mending.",
        emoji: "🧵",
        value: 4,
        origin: "Mexico City",
        rarity: "common",
        canSell: true
      },
      
    ],

    // Hidden Items (dangerous to be found with)
    hidden: [
      {
        name: "Hebrew Prayer Book",
        category: "Hidden Items",
        location: "False bottom of trunk",
        description: "Small Hebrew prayer book. Possession means death by Inquisition.",
        emoji: "📕",
        value: 0,
        origin: "Amsterdam (smuggled)",
        rarity: "forbidden",
        canSell: false, // Far too dangerous
        hidden: true // Never show unless specifically searching
      },
      {
        name: "Menorah (Small)",
        category: "Hidden Items",
        location: "Wrapped in cloth, buried in garden",
        description: "Seven-branched candelabrum. Used only in absolute secrecy on Friday nights.",
        emoji: "🕎",
        value: 0,
        origin: "Portugal (family heirloom)",
        rarity: "forbidden",
        canSell: false,
        hidden: true
      }
    ],

    // Tools & Equipment (shop items, not personal)
    shopEquipment: [
      {
        name: "Brass Mortar & Pestle",
        category: "Shop Equipment",
        location: "Laboratory",
        description: "Heavy brass mortar for grinding medicines. Your most important tool.",
        emoji: "⚗️",
        value: 25,
        origin: "New Spain",
        rarity: "uncommon",
        canSell: false // Need for work
      },
   
 
      {
        name: "Balance Scale (Brass)",
        category: "Shop Equipment",
        location: "Counter",
        description: "Precision balance for measuring doses. Customers trust your accuracy.",
        emoji: "⚖️",
        value: 35,
        origin: "Spain",
        rarity: "uncommon",
        canSell: false // Need for work
      },
  
    ]
  };
}

/**
 * Get all personal effects as a flat array, excluding hidden items by default
 */
export function getAllPersonalItems(includeHidden = false) {
  const effects = generatePersonalEffects();
  const categories = includeHidden
    ? Object.values(effects)
    : Object.entries(effects)
        .filter(([key]) => key !== 'hidden')
        .map(([, items]) => items);

  return categories.flat();
}

/**
 * Get only sellable personal items
 */
export function getSellablePersonalItems() {
  return getAllPersonalItems(false).filter(item => item.canSell);
}

/**
 * Format personal items for display in inventory
 */
export function formatPersonalItemsForInventory() {
  const items = getAllPersonalItems(false);

  return items.map(item => ({
    ...item,
    type: 'personal',
    quantity: 1,
    price: item.value,
    properties: {
      location: item.location,
      rarity: item.rarity
    }
  }));
}
