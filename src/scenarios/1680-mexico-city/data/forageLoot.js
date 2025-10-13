/**
 * Forage Loot Tables - 1680 Mexico City
 *
 * Scenario-specific items that can be found by foraging.
 * All items are historically accurate for colonial Mexico City in 1680.
 *
 * Rarity Distribution:
 * - common: 60% (everyday useful items)
 * - uncommon: 30% (valuable/rare herbs, small currency)
 * - rare: 9% (precious items, significant finds)
 * - trash: 1% (urban only, for realism)
 *
 * Each item includes:
 * - name: Item name (should match existing game items where possible)
 * - quantity: Fixed number or [min, max] range
 * - weight: Relative weight within rarity tier (higher = more common)
 * - message: Contextual flavor text when found
 * - itemType: Type for EntityManager
 * - categories: Array of category tags
 * - properties: Array of medicinal/item properties
 * - value: Optional monetary value in reales
 *
 * @module forageLoot
 */

export const FORAGE_LOOT_1680_MEXICO_CITY = {
  'urban-street': {
    common: [
      {
        name: 'Plantain Leaves',
        quantity: [1, 3],
        weight: 3,
        message: 'You find plantain growing stubbornly between cobblestones—a common sight in the city.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'wound-treatment'],
        properties: ['Vulnerary', 'Astringent']
      },
      {
        name: 'Wild Chamomile',
        quantity: [1, 2],
        weight: 2,
        message: 'Small chamomile flowers peek through cracks in the street pavement.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'sedative'],
        properties: ['Calming', 'Digestive']
      },
      {
        name: 'Dandelion Root',
        quantity: 1,
        weight: 2,
        message: 'You dig up a dandelion root from the roadside—bitter but useful.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'digestive'],
        properties: ['Bitter', 'Digestive', 'Diuretic']
      },
      {
        name: 'Cobblestone Moss',
        quantity: [2, 4],
        weight: 2,
        message: 'Damp moss grows in the cracks between stones.',
        itemType: 'materia_medica',
        categories: ['moss', 'foraged'],
        properties: ['Absorbent']
      }
    ],
    uncommon: [
      {
        name: 'Copper Coin',
        quantity: 1,
        weight: 2,
        message: 'A copper coin glints in the dirt—someone\'s careless loss!',
        itemType: 'currency',
        value: 0.5,
        categories: ['currency', 'found']
      },
      {
        name: 'Rosemary Sprig',
        quantity: [1, 2],
        weight: 3,
        message: 'Rosemary grows wild near a sun-warmed wall—its scent is unmistakable.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'aromatic'],
        properties: ['Aromatic', 'Stimulant', 'Memory']
      },
      {
        name: 'Discarded Linen',
        quantity: 1,
        weight: 1,
        message: 'A torn but clean piece of linen lies discarded. Useful for bandages.',
        itemType: 'material',
        categories: ['cloth', 'found'],
        properties: ['Bandaging']
      }
    ],
    rare: [
      {
        name: 'Silver Real',
        quantity: 1,
        weight: 1,
        message: 'You find a silver real glinting in the gutter—a fortunate discovery!',
        itemType: 'currency',
        value: 1,
        categories: ['currency', 'found']
      },
      {
        name: 'Sage Bundle',
        quantity: 1,
        weight: 1,
        message: 'Someone dropped a bundle of dried sage. Their loss is your gain!',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'sacred'],
        properties: ['Aromatic', 'Antiseptic', 'Sacred']
      },
      {
        name: 'Obsidian Shard',
        quantity: 1,
        weight: 1,
        message: 'A small obsidian shard—possibly pre-Columbian. Sharp and valuable.',
        itemType: 'mineral',
        categories: ['mineral', 'found', 'artifact'],
        properties: ['Sharp', 'Sacred'],
        value: 2
      }
    ],
    trash: [
      {
        name: 'Dog Excrement',
        quantity: 1,
        weight: 3,
        message: '¡Mierda! You nearly step in a pile of dog waste.',
        itemType: 'trash',
        categories: ['trash', 'disgusting']
      },
      {
        name: 'Rotting Food Scraps',
        quantity: 1,
        weight: 2,
        message: 'Spoiled scraps from yesterday\'s market, now festering in the sun.',
        itemType: 'trash',
        categories: ['trash', 'food']
      },
      {
        name: 'Broken Pottery Shards',
        quantity: [2, 5],
        weight: 2,
        message: 'Shards of a broken clay pot. Perhaps useful for grinding?',
        itemType: 'trash',
        categories: ['trash', 'pottery']
      }
    ]
  },

  'urban-plaza': {
    common: [
      {
        name: 'Coriander Seeds',
        quantity: [2, 5],
        weight: 3,
        message: 'Coriander seeds scattered from a spice vendor\'s stall.',
        itemType: 'materia_medica',
        categories: ['spice', 'foraged', 'digestive'],
        properties: ['Aromatic', 'Digestive', 'Carminative']
      },
      {
        name: 'Onion Skins',
        quantity: [3, 6],
        weight: 2,
        message: 'Discarded onion skins—still useful for dyes and tinctures.',
        itemType: 'materia_medica',
        categories: ['vegetable', 'foraged'],
        properties: ['Dye', 'Antiseptic']
      },
      {
        name: 'Maize Kernels',
        quantity: [5, 10],
        weight: 3,
        message: 'Fallen maize kernels near a grain vendor. The staple of New Spain.',
        itemType: 'food',
        categories: ['grain', 'foraged', 'food']
      },
      {
        name: 'Epazote Leaves',
        quantity: [2, 4],
        weight: 2,
        message: 'Fresh epazote leaves—essential for cooking and medicine.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'digestive'],
        properties: ['Digestive', 'Antiparasitic', 'Aromatic']
      }
    ],
    uncommon: [
      {
        name: 'Cinnamon Stick',
        quantity: 1,
        weight: 2,
        message: 'A dropped cinnamon stick from the East Indies! A fortunate find.',
        itemType: 'materia_medica',
        categories: ['spice', 'foraged', 'warming'],
        properties: ['Aromatic', 'Warming', 'Antiseptic'],
        value: 2
      },
      {
        name: 'Fresh Chili Peppers',
        quantity: [2, 4],
        weight: 2,
        message: 'Bright red chilies fallen from a basket. Hot and medicinal.',
        itemType: 'materia_medica',
        categories: ['spice', 'foraged', 'stimulant'],
        properties: ['Warming', 'Stimulant', 'Pain Relief']
      },
      {
        name: 'Copper Coins',
        quantity: [1, 2],
        weight: 2,
        message: 'A few copper coins left on the ground by a careless merchant!',
        itemType: 'currency',
        value: 0.5
      },
      {
        name: 'Pumpkin Seeds',
        quantity: [5, 10],
        weight: 2,
        message: 'Fresh pumpkin seeds—good for parasites and nutrition.',
        itemType: 'materia_medica',
        categories: ['seed', 'foraged', 'antiparasitic'],
        properties: ['Antiparasitic', 'Nutritive']
      }
    ],
    rare: [
      {
        name: 'Vanilla Bean',
        quantity: 1,
        weight: 1,
        message: 'A precious vanilla bean from Veracruz, somehow overlooked! This is worth a small fortune.',
        itemType: 'materia_medica',
        categories: ['spice', 'foraged', 'precious'],
        properties: ['Aromatic', 'Flavoring'],
        value: 10
      },
      {
        name: 'Cacao Beans',
        quantity: [2, 4],
        weight: 1,
        message: 'Cacao beans—not just currency, but medicine and sustenance too!',
        itemType: 'materia_medica',
        categories: ['spice', 'foraged', 'currency'],
        properties: ['Stimulant', 'Currency'],
        value: 2
      },
      {
        name: 'Silver Reales',
        quantity: [1, 2],
        weight: 1,
        message: 'Lost silver coins glint among the market debris!',
        itemType: 'currency',
        value: 1
      },
      {
        name: 'Saffron Threads',
        quantity: 1,
        weight: 0.5,
        message: 'Precious saffron threads! These must have fallen from a wealthy merchant\'s purse.',
        itemType: 'materia_medica',
        categories: ['spice', 'foraged', 'precious'],
        properties: ['Aromatic', 'Mood', 'Digestive'],
        value: 20
      }
    ],
    trash: [
      {
        name: 'Spoiled Fruit',
        quantity: [1, 3],
        weight: 3,
        message: 'Overripe fruit, swarming with flies. Disgusting.',
        itemType: 'trash',
        categories: ['trash', 'food']
      },
      {
        name: 'Fish Bones',
        quantity: [2, 5],
        weight: 2,
        message: 'Picked-clean fish bones from the market. Useless.',
        itemType: 'trash',
        categories: ['trash', 'bones']
      }
    ]
  },

  'forest': {
    common: [
      {
        name: 'Oak Bark',
        quantity: [2, 5],
        weight: 3,
        message: 'You peel strips of oak bark from a fallen tree. Excellent for tanning and medicine.',
        itemType: 'materia_medica',
        categories: ['bark', 'foraged', 'astringent'],
        properties: ['Astringent', 'Tannins', 'Wound Treatment']
      },
      {
        name: 'Wild Mushrooms',
        quantity: [1, 3],
        weight: 2,
        message: 'Edible mushrooms cluster on a rotting log. You identify them carefully.',
        itemType: 'materia_medica',
        categories: ['fungus', 'foraged', 'food'],
        properties: ['Nutritive']
      },
      {
        name: 'Pine Resin',
        quantity: [1, 2],
        weight: 3,
        message: 'Sticky pine resin oozes from a wounded tree. Useful for wounds and sealing.',
        itemType: 'materia_medica',
        categories: ['resin', 'foraged', 'antiseptic'],
        properties: ['Antiseptic', 'Sealing', 'Aromatic']
      },
      {
        name: 'Fern Fronds',
        quantity: [3, 6],
        weight: 2,
        message: 'Fresh fern fronds unfurl in the dappled shade.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged'],
        properties: ['Cooling', 'Astringent']
      },
      {
        name: 'Acorns',
        quantity: [5, 10],
        weight: 2,
        message: 'You gather acorns scattered across the forest floor. Good for tannins.',
        itemType: 'food',
        categories: ['seed', 'foraged', 'food'],
        properties: ['Nutritive', 'Astringent']
      }
    ],
    uncommon: [
      {
        name: 'Willow Bark',
        quantity: [2, 4],
        weight: 3,
        message: 'You strip willow bark from a riverside tree—excellent for pain and fever.',
        itemType: 'materia_medica',
        categories: ['bark', 'foraged', 'analgesic'],
        properties: ['Analgesic', 'Anti-inflammatory', 'Febrifuge']
      },
      {
        name: 'Wild Sage',
        quantity: [1, 3],
        weight: 2,
        message: 'Aromatic wild sage grows in a sun-dappled clearing.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'aromatic'],
        properties: ['Aromatic', 'Antiseptic', 'Memory']
      },
      {
        name: 'Elderflowers',
        quantity: [2, 5],
        weight: 2,
        message: 'Delicate elderflower blossoms dot the branches. Good for fevers.',
        itemType: 'materia_medica',
        categories: ['flower', 'foraged', 'febrifuge'],
        properties: ['Febrifuge', 'Diaphoretic', 'Aromatic']
      },
      {
        name: 'Copal Resin',
        quantity: 1,
        weight: 1,
        message: 'Sacred copal resin from a local tree—valuable for incense and medicine!',
        itemType: 'materia_medica',
        categories: ['resin', 'foraged', 'sacred'],
        properties: ['Sacred', 'Aromatic', 'Incense'],
        value: 5
      },
      {
        name: 'Palo Santo Wood',
        quantity: [1, 2],
        weight: 1,
        message: 'Fragrant palo santo wood—sacred and medicinal.',
        itemType: 'materia_medica',
        categories: ['wood', 'foraged', 'sacred'],
        properties: ['Sacred', 'Aromatic', 'Purifying'],
        value: 3
      }
    ],
    rare: [
      {
        name: "St. John's Wort",
        quantity: [1, 2],
        weight: 1,
        message: 'St. John\'s Wort grows in the clearing—a prized medicinal herb!',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'mood'],
        properties: ['Mood', 'Wound Healing', 'Sacred'],
        value: 4
      },
      {
        name: 'Tobacco Leaves',
        quantity: [2, 4],
        weight: 1,
        message: 'Wild tobacco grows here—valuable for trade, ceremony, and medicine.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'sacred'],
        properties: ['Stimulant', 'Sacred', 'Narcotic'],
        value: 3
      },
      {
        name: 'Deer Antler Shed',
        quantity: 1,
        weight: 1,
        message: 'A shed deer antler lies among the leaves. Rare and valuable—prized for tonics.',
        itemType: 'animal',
        categories: ['animal', 'foraged', 'tonic'],
        properties: ['Tonic', 'Strengthening'],
        value: 6
      },
      {
        name: 'Quetzal Feather',
        quantity: 1,
        weight: 0.5,
        message: 'A brilliant quetzal feather—sacred to the Mexica and extraordinarily rare! Worth a fortune.',
        itemType: 'material',
        categories: ['sacred', 'foraged', 'precious'],
        properties: ['Sacred', 'Decorative'],
        value: 15
      },
      {
        name: 'Wild Ginseng Root',
        quantity: 1,
        weight: 0.5,
        message: 'An extremely rare wild ginseng root—brought from the Orient and now growing wild!',
        itemType: 'materia_medica',
        categories: ['root', 'foraged', 'tonic'],
        properties: ['Tonic', 'Stimulant', 'Precious'],
        value: 12
      }
    ],
    trash: [] // Forests don't have trash
  },

  'garden': {
    common: [
      {
        name: 'Mint Leaves',
        quantity: [3, 6],
        weight: 3,
        message: 'Fresh mint leaves with a sharp, clean scent.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'aromatic'],
        properties: ['Aromatic', 'Digestive', 'Cooling']
      },
      {
        name: 'Basil',
        quantity: [2, 5],
        weight: 3,
        message: 'Aromatic basil grows abundantly in the garden.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'aromatic'],
        properties: ['Aromatic', 'Digestive', 'Warming']
      },
      {
        name: 'Marigold Flowers',
        quantity: [2, 4],
        weight: 2,
        message: 'Bright orange marigold petals—used for offerings and wound treatment.',
        itemType: 'materia_medica',
        categories: ['flower', 'foraged', 'wound-treatment'],
        properties: ['Vulnerary', 'Anti-inflammatory', 'Sacred']
      },
      {
        name: 'Oregano',
        quantity: [2, 5],
        weight: 2,
        message: 'Fresh oregano—aromatic and medicinal.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'aromatic'],
        properties: ['Aromatic', 'Antiseptic', 'Digestive']
      }
    ],
    uncommon: [
      {
        name: 'Rose Petals',
        quantity: [3, 6],
        weight: 2,
        message: 'Velvety rose petals, fragrant and medicinal.',
        itemType: 'materia_medica',
        categories: ['flower', 'foraged', 'aromatic'],
        properties: ['Aromatic', 'Astringent', 'Cooling']
      },
      {
        name: 'Lemon Verbena',
        quantity: [2, 4],
        weight: 2,
        message: 'Lemon verbena leaves with a citrus-sharp scent.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'aromatic'],
        properties: ['Aromatic', 'Digestive', 'Calming']
      },
      {
        name: 'Chamomile Flowers',
        quantity: [3, 6],
        weight: 2,
        message: 'Delicate chamomile blooms dot the garden beds.',
        itemType: 'materia_medica',
        categories: ['flower', 'foraged', 'sedative'],
        properties: ['Calming', 'Digestive', 'Anti-inflammatory']
      },
      {
        name: 'Bay Leaves',
        quantity: [2, 5],
        weight: 2,
        message: 'Fresh bay leaves from a small tree. Aromatic and useful.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'aromatic'],
        properties: ['Aromatic', 'Digestive']
      }
    ],
    rare: [
      {
        name: 'Aloe Vera Gel',
        quantity: [1, 2],
        weight: 1,
        message: 'Fresh aloe vera from a succulent plant—excellent for burns and wounds.',
        itemType: 'materia_medica',
        categories: ['succulent', 'foraged', 'wound-treatment'],
        properties: ['Vulnerary', 'Cooling', 'Soothing']
      },
      {
        name: 'Lavender',
        quantity: [2, 5],
        weight: 1,
        message: 'Fragrant lavender flowers—calming and aromatic.',
        itemType: 'materia_medica',
        categories: ['flower', 'foraged', 'aromatic'],
        properties: ['Aromatic', 'Calming', 'Antiseptic'],
        value: 2
      },
      {
        name: 'Damiana Leaves',
        quantity: [2, 4],
        weight: 1,
        message: 'Damiana leaves—prized by the indigenous peoples for vitality.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'tonic'],
        properties: ['Tonic', 'Stimulant', 'Aphrodisiac'],
        value: 4
      }
    ],
    trash: [] // Gardens don't have trash
  },

  'riverbank': {
    common: [
      {
        name: 'Watercress',
        quantity: [3, 6],
        weight: 3,
        message: 'Fresh watercress grows in the clear shallows.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'nutritive'],
        properties: ['Nutritive', 'Stimulant', 'Digestive']
      },
      {
        name: 'Cattail Roots',
        quantity: [2, 4],
        weight: 2,
        message: 'You dig up edible cattail roots from the muddy bank.',
        itemType: 'food',
        categories: ['root', 'foraged', 'food'],
        properties: ['Nutritive', 'Starchy']
      },
      {
        name: 'River Clay',
        quantity: [3, 5],
        weight: 2,
        message: 'Smooth clay from the riverbank—excellent for poultices and pottery.',
        itemType: 'mineral',
        categories: ['mineral', 'foraged', 'poultice'],
        properties: ['Drawing', 'Cooling']
      },
      {
        name: 'Reeds',
        quantity: [5, 10],
        weight: 2,
        message: 'Fresh reeds grow along the water\'s edge. Useful for weaving.',
        itemType: 'material',
        categories: ['plant', 'foraged', 'material']
      }
    ],
    uncommon: [
      {
        name: 'Horsetail Plant',
        quantity: [2, 4],
        weight: 2,
        message: 'Horsetail grows along the bank—useful for wounds and kidney ailments.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'astringent'],
        properties: ['Astringent', 'Wound Healing', 'Diuretic']
      },
      {
        name: 'Freshwater Mussel Shells',
        quantity: [2, 5],
        weight: 2,
        message: 'Empty mussel shells line the shore—useful for grinding compounds.',
        itemType: 'material',
        categories: ['shell', 'foraged', 'tool']
      },
      {
        name: 'River Stones',
        quantity: [5, 10],
        weight: 2,
        message: 'Smooth river stones—perfect for hot stone treatments.',
        itemType: 'mineral',
        categories: ['mineral', 'foraged', 'tool']
      }
    ],
    rare: [
      {
        name: 'Water Lily',
        quantity: 1,
        weight: 1,
        message: 'A beautiful water lily floats near the bank. Sacred and medicinal.',
        itemType: 'materia_medica',
        categories: ['flower', 'foraged', 'sedative'],
        properties: ['Calming', 'Sedative', 'Sacred'],
        value: 3
      },
      {
        name: 'Small Pearl',
        quantity: 1,
        weight: 0.5,
        message: 'A tiny freshwater pearl hidden in a mussel shell! A rare treasure.',
        itemType: 'mineral',
        categories: ['mineral', 'foraged', 'precious'],
        value: 8
      },
      {
        name: 'Jade Pebble',
        quantity: 1,
        weight: 1,
        message: 'A small jade stone polished by water—sacred to the Mexica people.',
        itemType: 'mineral',
        categories: ['mineral', 'foraged', 'sacred'],
        properties: ['Sacred'],
        value: 10
      }
    ],
    trash: [
      {
        name: 'Waterlogged Wood',
        quantity: [1, 3],
        weight: 2,
        message: 'Rotting wood from the river. Useless and heavy.',
        itemType: 'trash',
        categories: ['trash', 'wood']
      }
    ]
  },

  'field': {
    common: [
      {
        name: 'Wild Oats',
        quantity: [5, 10],
        weight: 3,
        message: 'Wild oats grow in abundance across the field.',
        itemType: 'food',
        categories: ['grain', 'foraged', 'food'],
        properties: ['Nutritive']
      },
      {
        name: 'Clover',
        quantity: [3, 6],
        weight: 2,
        message: 'Fresh clover carpets the ground in patches.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged'],
        properties: ['Nutritive', 'Blood Purifying']
      },
      {
        name: 'Field Flowers',
        quantity: [3, 6],
        weight: 2,
        message: 'Colorful wildflowers dot the field—useful for dyes.',
        itemType: 'materia_medica',
        categories: ['flower', 'foraged'],
        properties: ['Aromatic']
      }
    ],
    uncommon: [
      {
        name: 'Wild Garlic',
        quantity: [2, 4],
        weight: 2,
        message: 'Pungent wild garlic grows in a patch. Medicinal and flavorful.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'antiseptic'],
        properties: ['Antiseptic', 'Stimulant', 'Warming']
      },
      {
        name: 'Yarrow',
        quantity: [2, 5],
        weight: 2,
        message: 'Yarrow stands tall with white flower clusters—excellent for wounds.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'wound-treatment'],
        properties: ['Vulnerary', 'Astringent', 'Febrifuge']
      },
      {
        name: 'Nettle Leaves',
        quantity: [3, 6],
        weight: 2,
        message: 'Stinging nettles! You gather them carefully with cloth.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged', 'nutritive'],
        properties: ['Nutritive', 'Stimulant', 'Diuretic']
      }
    ],
    rare: [
      {
        name: 'Four-Leaf Clover',
        quantity: 1,
        weight: 1,
        message: 'A rare four-leaf clover! Perhaps it will bring good fortune.',
        itemType: 'curiosity',
        categories: ['herb', 'foraged', 'lucky'],
        properties: ['Lucky'],
        value: 1
      },
      {
        name: 'Wild Poppy Flowers',
        quantity: [2, 4],
        weight: 1,
        message: 'Bright red poppies sway in the breeze. Sedative and beautiful.',
        itemType: 'materia_medica',
        categories: ['flower', 'foraged', 'narcotic'],
        properties: ['Narcotic', 'Sedative', 'Analgesic'],
        value: 3
      },
      {
        name: 'Mandrake Root',
        quantity: 1,
        weight: 0.5,
        message: 'Mandrake root—rare and powerfully narcotic! Handle with extreme care.',
        itemType: 'materia_medica',
        categories: ['root', 'foraged', 'narcotic'],
        properties: ['Narcotic', 'Sedative', 'Hallucinogenic'],
        value: 12
      }
    ],
    trash: []
  },

  'urban-alley': {
    common: [
      {
        name: 'Wall Moss',
        quantity: [2, 4],
        weight: 2,
        message: 'Damp moss grows on the shadowy brick walls.',
        itemType: 'materia_medica',
        categories: ['moss', 'foraged'],
        properties: ['Absorbent']
      },
      {
        name: 'Lichen',
        quantity: [1, 3],
        weight: 2,
        message: 'Pale lichen clings to the ancient stones.',
        itemType: 'materia_medica',
        categories: ['lichen', 'foraged'],
        properties: ['Antiseptic']
      },
      {
        name: 'Wild Ivy',
        quantity: [2, 4],
        weight: 2,
        message: 'Ivy creeps along the alley walls.',
        itemType: 'materia_medica',
        categories: ['herb', 'foraged']
      }
    ],
    uncommon: [
      {
        name: 'Copper Coin',
        quantity: 1,
        weight: 2,
        message: 'A hidden coin glints in a shadowy crevice!',
        itemType: 'currency',
        value: 0.5
      },
      {
        name: 'Iron Nails',
        quantity: [1, 3],
        weight: 1,
        message: 'Old iron nails, still useful despite rust.',
        itemType: 'material',
        categories: ['metal', 'found', 'tool']
      },
      {
        name: 'Rope Fragment',
        quantity: 1,
        weight: 1,
        message: 'A piece of sturdy rope, discarded but serviceable.',
        itemType: 'material',
        categories: ['material', 'found']
      }
    ],
    rare: [
      {
        name: 'Silver Real',
        quantity: 1,
        weight: 1,
        message: 'A silver coin hidden in the shadows! Someone\'s misfortune.',
        itemType: 'currency',
        value: 1
      },
      {
        name: 'Mysterious Vial',
        quantity: 1,
        weight: 1,
        message: 'A discarded vial with mysterious residue inside. What was it?',
        itemType: 'curiosity',
        categories: ['curiosity', 'found'],
        value: 2
      }
    ],
    trash: [
      {
        name: 'Rat Droppings',
        quantity: [3, 6],
        weight: 3,
        message: 'Rat droppings everywhere. The alley reeks.',
        itemType: 'trash',
        categories: ['trash', 'disgusting']
      },
      {
        name: 'Rotting Garbage',
        quantity: [2, 4],
        weight: 2,
        message: 'Piles of festering refuse decay in the corner.',
        itemType: 'trash',
        categories: ['trash']
      },
      {
        name: 'Dead Rat',
        quantity: 1,
        weight: 1,
        message: 'A dead rat, already crawling with maggots. You recoil.',
        itemType: 'trash',
        categories: ['trash', 'animal']
      }
    ]
  },

  // Additional location types specific to 1680 Mexico City
  'urban-waterfront': {
    common: [
      {
        name: 'Seaweed',
        quantity: [3, 6],
        weight: 2,
        message: 'Fresh seaweed washed up on the dock. Slippery but useful.',
        itemType: 'materia_medica',
        categories: ['aquatic', 'foraged'],
        properties: ['Nutritive', 'Iodine']
      },
      {
        name: 'Driftwood',
        quantity: [2, 5],
        weight: 2,
        message: 'Pieces of sun-bleached driftwood.',
        itemType: 'material',
        categories: ['wood', 'foraged']
      }
    ],
    uncommon: [
      {
        name: 'Ship Rope',
        quantity: 1,
        weight: 1,
        message: 'A length of sturdy ship rope, cast off from a vessel.',
        itemType: 'material',
        categories: ['material', 'found']
      },
      {
        name: 'Foreign Spice',
        quantity: 1,
        weight: 1,
        message: 'An exotic spice fallen from a cargo crate! You can\'t identify it.',
        itemType: 'materia_medica',
        categories: ['spice', 'foraged', 'exotic'],
        value: 3
      }
    ],
    rare: [
      {
        name: 'Ambergris',
        quantity: 1,
        weight: 0.5,
        message: 'A lump of ambergris washed ashore! Precious beyond measure for perfumery.',
        itemType: 'material',
        categories: ['precious', 'foraged', 'aromatic'],
        value: 25
      },
      {
        name: 'Coral Fragment',
        quantity: 1,
        weight: 1,
        message: 'A piece of precious coral from distant seas.',
        itemType: 'mineral',
        categories: ['mineral', 'foraged', 'precious'],
        value: 8
      }
    ],
    trash: [
      {
        name: 'Fish Guts',
        quantity: [1, 3],
        weight: 3,
        message: 'Rotting fish entrails. The stench is overpowering.',
        itemType: 'trash',
        categories: ['trash', 'disgusting']
      }
    ]
  },

  // ==================== INTERIOR SPACES (SCROUNGING) ====================

  'interior-shop': {
    common: [
      {
        name: 'Pocket Lint',
        quantity: 1,
        weight: 4,
        message: 'A ball of pocket lint found in a corner. Practically worthless.',
        itemType: 'trash',
        categories: ['trash', 'scrounged']
      },
      {
        name: 'Wood Shavings',
        quantity: [2, 5],
        weight: 3,
        message: 'Sawdust and wood shavings from the shop floor.',
        itemType: 'material',
        categories: ['material', 'scrounged']
      },
      {
        name: 'Broken Nail',
        quantity: [1, 3],
        weight: 2,
        message: 'A bent iron nail discarded on the floor.',
        itemType: 'material',
        categories: ['material', 'scrounged']
      }
    ],
    uncommon: [
      {
        name: 'Copper Coin',
        quantity: 1,
        weight: 2,
        message: 'A small copper coin dropped by a customer!',
        itemType: 'currency',
        categories: ['coin', 'scrounged'],
        value: 0.5
      },
      {
        name: 'Leather Scrap',
        quantity: 1,
        weight: 1,
        message: 'A piece of good quality leather, trimmed from someone\'s purchase.',
        itemType: 'material',
        categories: ['material', 'scrounged'],
        value: 1
      }
    ],
    rare: [
      {
        name: 'Silver Real',
        quantity: 1,
        weight: 1,
        message: 'A full silver real coin, gleaming in the dust! Someone\'s loss is your gain.',
        itemType: 'currency',
        categories: ['coin', 'scrounged'],
        value: 1
      }
    ],
    trash: [
      {
        name: 'Rat Droppings',
        quantity: [1, 4],
        weight: 3,
        message: 'Fresh rat droppings. This shop has a pest problem.',
        itemType: 'trash',
        categories: ['trash', 'disgusting']
      }
    ]
  },

  'interior-church': {
    common: [
      {
        name: 'Candle Stub',
        quantity: [1, 2],
        weight: 3,
        message: 'A melted candle stub from the altar.',
        itemType: 'material',
        categories: ['material', 'scrounged']
      },
      {
        name: 'Dried Flowers',
        quantity: [1, 3],
        weight: 2,
        message: 'Wilted flowers from a religious offering.',
        itemType: 'material',
        categories: ['plant', 'scrounged']
      },
      {
        name: 'Prayer Beads',
        quantity: 1,
        weight: 1,
        message: 'A broken rosary left behind by a worshipper.',
        itemType: 'material',
        categories: ['religious', 'scrounged']
      }
    ],
    uncommon: [
      {
        name: 'Frankincense',
        quantity: 1,
        weight: 1,
        message: 'A small amount of frankincense resin used in ceremonies.',
        itemType: 'materia_medica',
        categories: ['resin', 'aromatic', 'scrounged'],
        value: 2
      },
      {
        name: 'Holy Water Vial',
        quantity: 1,
        weight: 1,
        message: 'A small vial of blessed water left on a pew.',
        itemType: 'liquid',
        categories: ['water', 'blessed', 'scrounged'],
        value: 1
      }
    ],
    rare: [
      {
        name: 'Silver Religious Medal',
        quantity: 1,
        weight: 1,
        message: 'A small silver medal of a saint. Someone will be heartbroken to have lost this.',
        itemType: 'treasure',
        categories: ['silver', 'religious', 'scrounged'],
        value: 3
      }
    ],
    trash: []
  },

  'interior-home': {
    common: [
      {
        name: 'Bread Crust',
        quantity: 1,
        weight: 3,
        message: 'A stale bread crust found under a table.',
        itemType: 'food',
        categories: ['food', 'stale', 'scrounged']
      },
      {
        name: 'String',
        quantity: [1, 3],
        weight: 3,
        message: 'A length of twine kept in a drawer.',
        itemType: 'material',
        categories: ['material', 'scrounged']
      },
      {
        name: 'Cloth Scrap',
        quantity: [1, 2],
        weight: 2,
        message: 'Scraps of fabric from someone\'s sewing.',
        itemType: 'material',
        categories: ['fabric', 'scrounged']
      },
      {
        name: 'Kitchen Herb',
        quantity: 1,
        weight: 2,
        message: 'A forgotten sprig of kitchen herbs.',
        itemType: 'materia_medica',
        categories: ['herb', 'culinary', 'scrounged']
      }
    ],
    uncommon: [
      {
        name: 'Needle and Thread',
        quantity: 1,
        weight: 2,
        message: 'A sewing needle with thread still attached.',
        itemType: 'tool',
        categories: ['tool', 'scrounged'],
        value: 0.5
      },
      {
        name: 'Copper Coin',
        quantity: [1, 2],
        weight: 2,
        message: 'A small coin found between floorboards.',
        itemType: 'currency',
        categories: ['coin', 'scrounged'],
        value: 0.5
      },
      {
        name: 'Dried Herbs',
        quantity: 1,
        weight: 1,
        message: 'A bundle of dried herbs hanging in the kitchen.',
        itemType: 'materia_medica',
        categories: ['herb', 'dried', 'scrounged'],
        value: 1
      }
    ],
    rare: [
      {
        name: 'Family Heirloom',
        quantity: 1,
        weight: 1,
        message: 'A small valuable trinket hidden in a drawer. You feel guilty taking this...',
        itemType: 'treasure',
        categories: ['treasure', 'scrounged'],
        value: 5
      }
    ],
    trash: [
      {
        name: 'Dust Bunny',
        quantity: [1, 5],
        weight: 3,
        message: 'An impressive accumulation of dust.',
        itemType: 'trash',
        categories: ['trash']
      }
    ]
  },

  'interior-palace': {
    common: [
      {
        name: 'Velvet Scrap',
        quantity: 1,
        weight: 2,
        message: 'A scrap of fine velvet, likely from drapery.',
        itemType: 'material',
        categories: ['fabric', 'luxury', 'scrounged'],
        value: 1
      },
      {
        name: 'Candle Wax',
        quantity: [1, 2],
        weight: 2,
        message: 'Wax drippings from expensive beeswax candles.',
        itemType: 'material',
        categories: ['material', 'scrounged']
      }
    ],
    uncommon: [
      {
        name: 'Quill Pen',
        quantity: 1,
        weight: 2,
        message: 'A discarded quill pen—still serviceable.',
        itemType: 'tool',
        categories: ['writing', 'scrounged'],
        value: 0.5
      },
      {
        name: 'Ink Vial',
        quantity: 1,
        weight: 1,
        message: 'A small vial of ink, partially used.',
        itemType: 'material',
        categories: ['writing', 'scrounged'],
        value: 1
      },
      {
        name: 'Silver Coin',
        quantity: 1,
        weight: 1,
        message: 'A silver real, dropped in haste! You glance around nervously.',
        itemType: 'currency',
        categories: ['coin', 'scrounged'],
        value: 1
      }
    ],
    rare: [
      {
        name: 'Gold Button',
        quantity: 1,
        weight: 0.5,
        message: 'A gold button from a noble\'s coat! This could fetch a good price—or get you arrested.',
        itemType: 'treasure',
        categories: ['gold', 'luxury', 'scrounged'],
        value: 10
      },
      {
        name: 'Jeweled Pin',
        quantity: 1,
        weight: 0.5,
        message: 'A delicate jeweled hairpin! Someone very wealthy will be furious about this loss.',
        itemType: 'treasure',
        categories: ['jewelry', 'luxury', 'scrounged'],
        value: 15
      }
    ],
    trash: []
  },

  'interior-hospital': {
    common: [
      {
        name: 'Linen Bandage Scrap',
        quantity: [1, 3],
        weight: 3,
        message: 'Used bandages, discarded but still mostly clean.',
        itemType: 'medical',
        categories: ['bandage', 'used', 'scrounged']
      },
      {
        name: 'Broken Lancet',
        quantity: 1,
        weight: 2,
        message: 'A broken bloodletting lancet—no longer sharp.',
        itemType: 'medical',
        categories: ['tool', 'broken', 'scrounged']
      },
      {
        name: 'Herbs (Medicinal)',
        quantity: 1,
        weight: 2,
        message: 'A few sprigs of medicinal herbs that fell from a treatment tray.',
        itemType: 'materia_medica',
        categories: ['herb', 'medicinal', 'scrounged']
      }
    ],
    uncommon: [
      {
        name: 'Clean Linen Bandage',
        quantity: [1, 2],
        weight: 2,
        message: 'Unused linen bandages—someone left these behind.',
        itemType: 'medical',
        categories: ['bandage', 'clean', 'scrounged'],
        value: 1
      },
      {
        name: 'Medicinal Tincture',
        quantity: 1,
        weight: 1,
        message: 'A small bottle of medicinal tincture, partially full.',
        itemType: 'medicine',
        categories: ['tincture', 'medicinal', 'scrounged'],
        value: 2
      },
      {
        name: 'Willow Bark',
        quantity: [1, 2],
        weight: 1,
        message: 'Willow bark for pain relief, stored in the hospital pharmacy.',
        itemType: 'materia_medica',
        categories: ['bark', 'analgesic', 'scrounged'],
        value: 1
      }
    ],
    rare: [
      {
        name: 'Theriac',
        quantity: 1,
        weight: 0.5,
        message: 'A vial of theriac—the legendary cure-all! How did this get left behind?',
        itemType: 'medicine',
        categories: ['compound', 'precious', 'scrounged'],
        value: 10
      },
      {
        name: 'Opium',
        quantity: 1,
        weight: 0.5,
        message: 'A small amount of opium, used for severe pain. Highly valuable.',
        itemType: 'materia_medica',
        categories: ['narcotic', 'analgesic', 'scrounged'],
        value: 8
      }
    ],
    trash: [
      {
        name: 'Blood-Soaked Rag',
        quantity: 1,
        weight: 3,
        message: 'A rag soaked with blood. Best not to touch it.',
        itemType: 'trash',
        categories: ['trash', 'disgusting']
      }
    ]
  },

  'interior-tavern': {
    common: [
      {
        name: 'Spilled Ale',
        quantity: 1,
        weight: 3,
        message: 'The floor is sticky with spilled ale. Nothing to salvage here.',
        itemType: 'trash',
        categories: ['trash']
      },
      {
        name: 'Peanut Shells',
        quantity: [2, 5],
        weight: 3,
        message: 'Cracked peanut shells litter the floor.',
        itemType: 'trash',
        categories: ['trash', 'food']
      },
      {
        name: 'Bread Heel',
        quantity: 1,
        weight: 2,
        message: 'A hard bread heel someone left behind.',
        itemType: 'food',
        categories: ['food', 'stale', 'scrounged']
      }
    ],
    uncommon: [
      {
        name: 'Copper Coin',
        quantity: [1, 3],
        weight: 3,
        message: 'Copper coins scattered under the tables from careless drunks.',
        itemType: 'currency',
        categories: ['coin', 'scrounged'],
        value: 0.5
      },
      {
        name: 'Tobacco Pouch',
        quantity: 1,
        weight: 1,
        message: 'A leather tobacco pouch, still half full.',
        itemType: 'trade_good',
        categories: ['tobacco', 'scrounged'],
        value: 2
      },
      {
        name: 'Pewter Mug',
        quantity: 1,
        weight: 1,
        message: 'A small pewter drinking cup, dented but usable.',
        itemType: 'tool',
        categories: ['vessel', 'scrounged'],
        value: 1
      }
    ],
    rare: [
      {
        name: 'Silver Real',
        quantity: [1, 2],
        weight: 1,
        message: 'Silver coins dropped by drunk patrons! The tavern keeper\'s loss.',
        itemType: 'currency',
        categories: ['coin', 'scrounged'],
        value: 1
      },
      {
        name: 'Playing Cards',
        quantity: 1,
        weight: 0.5,
        message: 'A deck of playing cards, left behind after a game. These are worth something.',
        itemType: 'trade_good',
        categories: ['game', 'scrounged'],
        value: 3
      }
    ],
    trash: [
      {
        name: 'Vomit Puddle',
        quantity: 1,
        weight: 2,
        message: 'Someone had too much to drink. You quickly step away.',
        itemType: 'trash',
        categories: ['trash', 'disgusting']
      }
    ]
  }
};

export default FORAGE_LOOT_1680_MEXICO_CITY;
