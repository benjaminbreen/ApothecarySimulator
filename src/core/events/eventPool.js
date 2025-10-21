// eventPool.js
// Complete pool of 30 random events for 1680 Mexico City

/**
 * Event Pool - Random events that add variety and quick decision-making
 *
 * Categories:
 * - street-life: Daily urban happenings
 * - environmental: Discoveries and observations
 * - religious: Church and faith-related
 * - economic: Trade and money
 * - danger: Risky situations
 */

export const EVENT_POOL = [
  // ============================================
  // STREET LIFE (8 events)
  // ============================================

  {
    id: 'street-juggler',
    category: 'street-life',
    type: 'random_event',

    triggers: {
      locations: ['streets', 'market', 'plaza'],
      timeOfDay: ['morning', 'afternoon'],
      minTurnNumber: 3,
      maxPerSession: 1,
      weight: 15
    },

    title: 'Street Performance',
    description: 'A mestizo juggler performs with flaming torches near the fountain, drawing a small crowd. Children gasp as he tosses them high into the air. He bows theatrically as flames dance.',
    icon: '🎭',
    colorScheme: 'blue',

    choices: [
      {
        action: 'donate',
        label: 'Toss a coin',
        shortLabel: '1 real',
        requirements: { minWealth: 1 },
        cost: { wealth: 1 },
        outcomes: {
          reputation: { commonFolk: 3 },
          xp: 1,
          narrativeTemplate: 'The juggler catches your coin mid-routine without missing a beat. The crowd cheers your generosity, and several onlookers nod approvingly in your direction.'
        }
      },
      {
        action: 'applaud',
        label: 'Applaud enthusiastically',
        cost: { time: 2 },
        outcomes: {
          reputation: { commonFolk: 1 },
          narrativeTemplate: 'You join the crowd in applause. The juggler grins broadly, sweat glistening on his brow. A shared moment of joy in the dusty street.'
        }
      },
      {
        action: 'continue',
        label: 'Continue on your way',
        outcomes: {
          narrativeTemplate: 'You nod politely and move along, the sound of cheering fading behind you.'
        }
      }
    ]
  },

  {
    id: 'merchant-argument',
    category: 'street-life',
    type: 'random_event',

    triggers: {
      locations: ['market'],
      timeOfDay: ['morning', 'afternoon'],
      minTurnNumber: 5,
      maxPerSession: 1,
      weight: 12
    },

    title: 'Merchant Dispute',
    description: 'Two merchants argue loudly over prices. A Spanish trader accuses an Indigenous vendor of undercutting him. Passersby stop to watch the confrontation escalate.',
    icon: '⚖️',
    colorScheme: 'purple',

    choices: [
      {
        action: 'side_indigenous',
        label: 'Defend the Indigenous vendor',
        outcomes: {
          reputation: { indigenous: 5, merchants: -3 },
          xp: 2,
          narrativeTemplate: 'You speak up for fair competition. The Indigenous vendor thanks you quietly, while the Spanish merchant glares. Others in the market notice your stance.'
        }
      },
      {
        action: 'side_spanish',
        label: 'Support guild regulations',
        outcomes: {
          reputation: { merchants: 5, indigenous: -3 },
          xp: 1,
          narrativeTemplate: 'You cite guild rules about pricing. The Spanish merchant nods appreciatively, though the Indigenous vendor looks hurt by your words.'
        }
      },
      {
        action: 'mediate',
        label: 'Mediate peacefully',
        outcomes: {
          reputation: { indigenous: 2, merchants: 2, guild: 1 },
          xp: 3,
          narrativeTemplate: 'You propose a compromise both can accept. Both merchants grudgingly agree, and nearby guild members note your diplomatic wisdom.'
        }
      }
    ]
  },

  {
    id: 'religious-procession',
    category: 'street-life',
    type: 'random_event',

    triggers: {
      locations: ['streets', 'plaza', 'cathedral'],
      timeOfDay: ['morning', 'afternoon'],
      minTurnNumber: 4,
      maxPerSession: 1,
      weight: 10
    },

    title: 'Religious Procession',
    description: 'A procession approaches carrying an image of the Virgin Mary. Monks chant Latin hymns. People kneel as it passes. A priest watches who shows proper reverence.',
    icon: '✝️',
    colorScheme: 'purple',

    choices: [
      {
        action: 'kneel',
        label: 'Kneel respectfully',
        cost: { time: 5 },
        outcomes: {
          reputation: { church: 5 },
          narrativeTemplate: 'You kneel with bowed head as the procession passes. The priest nods approvingly. Your piety is noted by those around you.'
        }
      },
      {
        action: 'bow',
        label: 'Bow quickly',
        cost: { time: 2 },
        outcomes: {
          reputation: { church: 2 },
          narrativeTemplate: 'You bow respectfully but briefly. Acceptable, though not the deepest devotion. The procession continues past.'
        }
      },
      {
        action: 'ignore',
        label: 'Continue walking (risky)',
        outcomes: {
          reputation: { church: -8 },
          risk: true,
          narrativeTemplate: 'You keep walking. The priest\'s eyes narrow as he watches you pass. Several onlookers whisper disapprovingly. Dangerous.'
        }
      }
    ]
  },

  {
    id: 'pickpocket-attempt',
    category: 'street-life',
    type: 'random_event',

    triggers: {
      locations: ['market', 'streets'],
      timeOfDay: ['afternoon', 'evening'],
      minTurnNumber: 8,
      maxPerSession: 1,
      weight: 8,
      minWealth: 2
    },

    title: 'Pickpocket!',
    description: 'You feel a hand brush your money pouch. A young mestizo boy darts away through the crowd. You could chase him, but you\'d need to be quick.',
    icon: '🏃',
    colorScheme: 'red',

    choices: [
      {
        action: 'chase',
        label: 'Chase the thief',
        cost: { energy: 10, time: 10 },
        outcomes: {
          random: true,
          successChance: 60,
          success: {
            wealth: 2, // Recover stolen + extra
            xp: 2,
            narrativeTemplate: 'You sprint after him, weaving through carts. You corner him in an alley and recover your coins—plus a few extra that fall from his pockets!'
          },
          failure: {
            wealth: -1,
            narrativeTemplate: 'You chase but lose him in the maze of alleys. You\'re out of breath and down a real. The crowd seems amused by your failure.'
          }
        }
      },
      {
        action: 'shout',
        label: 'Shout for the guard',
        cost: { time: 5 },
        outcomes: {
          random: true,
          successChance: 70,
          success: {
            reputation: { elite: 3 },
            xp: 1,
            narrativeTemplate: 'A constable appears and chases down the boy. Your coins are returned, and the authorities commend your civic duty.'
          },
          failure: {
            wealth: -1,
            narrativeTemplate: 'No guard appears. The boy vanishes. A real is gone, but at least you didn\'t waste energy chasing him.'
          }
        }
      },
      {
        action: 'let_go',
        label: 'Let it go',
        cost: { wealth: 1 },
        outcomes: {
          narrativeTemplate: 'You sigh and let him run. A real is gone, but the boy probably needed it more. You hope he uses it for food, not vices.'
        }
      }
    ]
  },

  {
    id: 'street-vendor-haggle',
    category: 'street-life',
    type: 'random_event',

    triggers: {
      locations: ['market'],
      timeOfDay: ['morning', 'afternoon'],
      minTurnNumber: 6,
      maxPerSession: 2,
      weight: 14,
      minWealth: 5
    },

    title: 'Aggressive Vendor',
    description: 'A vendor pushes expensive saffron at you—8 reales for a small pouch (worth about 5). "Best price in Mexico City!" he insists, though his eyes betray desperation.',
    icon: '💰',
    colorScheme: 'amber',

    choices: [
      {
        action: 'pay_full',
        label: 'Pay 8 reales',
        requirements: { minWealth: 8 },
        cost: { wealth: 8 },
        outcomes: {
          inventory: [{ item: 'Saffron', quantity: 1 }],
          reputation: { merchants: 2 },
          narrativeTemplate: 'You pay without haggling. The vendor beams, counting coins eagerly. Other merchants notice your wealth and generosity.'
        }
      },
      {
        action: 'haggle',
        label: 'Offer 5 reales (fair price)',
        requirements: { minWealth: 5 },
        outcomes: {
          random: true,
          successChance: 70,
          success: {
            wealth: -5,
            inventory: [{ item: 'Saffron', quantity: 1 }],
            xp: 1,
            narrativeTemplate: 'He grumbles but accepts. "You drive a hard bargain, Doña," he mutters. Fair trade accomplished.'
          },
          failure: {
            reputation: { merchants: -2 },
            narrativeTemplate: 'He scoffs at your offer and turns away, muttering insults. Other vendors overhear and seem less friendly now.'
          }
        }
      },
      {
        action: 'walk_away',
        label: 'Walk away',
        outcomes: {
          narrativeTemplate: 'You shake your head and move to another stall. The vendor calls after you desperately, but you\'ve made your decision.'
        }
      }
    ]
  },

  {
    id: 'stray-dog',
    category: 'street-life',
    type: 'random_event',

    triggers: {
      locations: ['streets', 'market'],
      timeOfDay: ['any'],
      minTurnNumber: 10,
      maxPerSession: 1,
      weight: 10
    },

    title: 'Stray Dog',
    description: 'A scruffy but friendly dog approaches you, tail wagging. It looks hungry but healthy. Its brown eyes watch you hopefully.',
    icon: '🐕',
    colorScheme: 'green',

    choices: [
      {
        action: 'feed',
        label: 'Feed it bread',
        requirements: { hasItem: 'Bread' },
        cost: { inventory: [{ item: 'Bread', quantity: 1 }] },
        outcomes: {
          companion: 'dog', // Cosmetic companion
          xp: 2,
          narrativeTemplate: 'The dog devours the bread gratefully and follows you home. You have a new companion—whether you wanted one or not. His loyalty is absolute.'
        }
      },
      {
        action: 'pet',
        label: 'Pet it gently',
        cost: { time: 2 },
        outcomes: {
          xp: 1,
          morale: 5,
          narrativeTemplate: 'You kneel and scratch behind its ears. The dog leans into your hand, tail thumping. A simple moment of kindness in a harsh world.'
        }
      },
      {
        action: 'shoo',
        label: 'Shoo it away',
        outcomes: {
          narrativeTemplate: 'You wave it off firmly. The dog whines but trots away, tail drooping. You have work to do; there\'s no time for strays.'
        }
      }
    ]
  },

  {
    id: 'lost-child',
    category: 'street-life',
    type: 'random_event',

    triggers: {
      locations: ['market', 'streets'],
      timeOfDay: ['afternoon'],
      minTurnNumber: 7,
      maxPerSession: 1,
      weight: 11
    },

    title: 'Lost Child',
    description: 'A small Indigenous girl, perhaps five years old, stands crying in the crowded market. She calls for her mother in Nahuatl. No one stops to help.',
    icon: '👧',
    colorScheme: 'blue',

    choices: [
      {
        action: 'help',
        label: 'Help find her parents',
        cost: { energy: 10, time: 20 },
        outcomes: {
          reputation: { commonFolk: 8, indigenous: 10 },
          xp: 3,
          narrativeTemplate: 'You spend time searching the stalls, speaking gentle Spanish and broken Nahuatl. Finally, you reunite mother and daughter. The mother weeps with gratitude, pressing a small charm into your hand.'
        }
      },
      {
        action: 'constable',
        label: 'Point her to a constable',
        cost: { time: 5 },
        outcomes: {
          reputation: { elite: 2 },
          xp: 1,
          narrativeTemplate: 'You lead her to a Spanish constable and explain the situation. He nods curtly. You\'ve done your civic duty, at least.'
        }
      },
      {
        action: 'ignore',
        label: 'Continue on',
        outcomes: {
          reputation: { commonFolk: -3 },
          risk: true,
          narrativeTemplate: 'You avert your eyes and keep walking. Someone else will help. Still, her cries echo in your mind long after.'
        }
      }
    ]
  },

  {
    id: 'street-musician',
    category: 'street-life',
    type: 'random_event',

    triggers: {
      locations: ['plaza', 'cathedral'],
      timeOfDay: ['morning', 'afternoon'],
      minTurnNumber: 5,
      maxPerSession: 1,
      weight: 12
    },

    title: 'Blind Flutist',
    description: 'An elderly Indigenous man plays a wooden flute on the church steps. His eyes are clouded with cataracts, but his music is hauntingly beautiful. A wooden bowl sits at his feet, nearly empty.',
    icon: '🎵',
    colorScheme: 'blue',

    choices: [
      {
        action: 'donate_generous',
        label: 'Donate generously',
        shortLabel: '2 reales',
        requirements: { minWealth: 2 },
        cost: { wealth: 2 },
        outcomes: {
          reputation: { indigenous: 5, church: 5 },
          xp: 2,
          narrativeTemplate: 'You place two reales in his bowl. He pauses his playing, turns his clouded eyes toward you, and whispers a blessing in Nahuatl. A priest on the steps nods approvingly.'
        }
      },
      {
        action: 'donate_modest',
        label: 'Donate modestly',
        shortLabel: '1 real',
        requirements: { minWealth: 1 },
        cost: { wealth: 1 },
        outcomes: {
          reputation: { indigenous: 2 },
          xp: 1,
          narrativeTemplate: 'A single real drops into his bowl. The music continues, a small smile on his weathered face. You\'ve done what you can.'
        }
      },
      {
        action: 'listen',
        label: 'Listen quietly',
        cost: { time: 5 },
        outcomes: {
          reputation: { indigenous: 1 },
          morale: 5,
          narrativeTemplate: 'You pause and simply listen. The melody speaks of mountains and ancient gods. For a moment, the colonial city fades away.'
        }
      }
    ]
  },

  // ============================================
  // ENVIRONMENTAL DISCOVERY (6 events)
  // ============================================

  {
    id: 'rare-herb',
    category: 'environmental',
    type: 'random_event',

    triggers: {
      locations: ['streets', 'outskirts'],
      timeOfDay: ['morning', 'afternoon'],
      minTurnNumber: 4,
      maxPerSession: 1,
      weight: 13,
      requiresSkill: 'herbalism'
    },

    title: 'Unusual Plant',
    description: 'Growing between cobblestones, you spot an unusual plant with distinctive serrated leaves. Could be Valerian—useful for calming nerves—or could be a worthless weed.',
    icon: '🌿',
    colorScheme: 'green',

    choices: [
      {
        action: 'examine',
        label: 'Examine carefully (Herbalism)',
        cost: { time: 10, energy: 5 },
        outcomes: {
          skillCheck: 'herbalism',
          difficulty: 40, // 40% base success, modified by skill level
          success: {
            inventory: [{ item: 'Valerian', quantity: 1 }],
            xp: 3,
            narrativeTemplate: 'You examine the leaves and smell the roots. Definitely Valerian! You harvest it carefully, a valuable find.'
          },
          failure: {
            xp: 1,
            narrativeTemplate: 'You study it carefully but cannot positively identify it. Better safe than sorry—you leave it alone.'
          }
        }
      },
      {
        action: 'harvest_quick',
        label: 'Harvest quickly',
        cost: { time: 5 },
        outcomes: {
          random: true,
          successChance: 50,
          success: {
            inventory: [{ item: 'Valerian', quantity: 1 }],
            xp: 1,
            narrativeTemplate: 'You pluck it quickly. Examining it later, you realize you got lucky—it\'s Valerian! Though your hasty harvest damaged the roots.'
          },
          failure: {
            inventory: [{ item: 'Unknown Weed', quantity: 1 }],
            narrativeTemplate: 'You grab it hastily. Later examination reveals it\'s useless—just a common weed. You discard it.'
          }
        }
      },
      {
        action: 'leave',
        label: 'Leave it',
        outcomes: {
          narrativeTemplate: 'Without proper identification, it\'s too risky. You continue on, making a mental note of the location.'
        }
      }
    ]
  },

  {
    id: 'ancient-mural',
    category: 'environmental',
    type: 'random_event',

    triggers: {
      locations: ['cathedral', 'streets'],
      timeOfDay: ['afternoon'],
      minTurnNumber: 12,
      maxPerSession: 1,
      weight: 8,
      minChurchRep: 40 // Only if not too suspect
    },

    title: 'Crumbling Mural',
    description: 'A section of plaster has fallen from an old wall near the cathedral, revealing pre-Hispanic art beneath—a serpent with feathers, painted in faded red and blue. Aztec iconography, forbidden yet fascinating.',
    icon: '🗿',
    colorScheme: 'purple',

    choices: [
      {
        action: 'study',
        label: 'Study it closely',
        cost: { time: 15 },
        risk: true,
        outcomes: {
          xp: 3,
          knowledge: 'aztec_art',
          reputation: { church: -3 }, // Risky if seen
          narrativeTemplate: 'You trace the faded lines with your eyes, memorizing the serpent\'s form. Quetzalcoatl, the feathered serpent. Knowledge of the old ways, dangerous but enlightening.'
        }
      },
      {
        action: 'sketch',
        label: 'Sketch it quickly',
        cost: { time: 10 },
        requirements: { hasItem: 'Paper' },
        outcomes: {
          inventory: [{ item: 'Sketch of Aztec Mural', quantity: 1 }],
          xp: 2,
          narrativeTemplate: 'You quickly sketch the design before anyone notices. A piece of forbidden history captured on paper. You hide it carefully in your robes.'
        }
      },
      {
        action: 'move_along',
        label: 'Move along quickly',
        outcomes: {
          narrativeTemplate: 'Best not to be seen admiring pagan art. You glance once more, then hurry past. The Church has eyes everywhere.'
        }
      }
    ]
  },

  {
    id: 'found-manuscript',
    category: 'environmental',
    type: 'random_event',

    triggers: {
      locations: ['streets', 'market'],
      timeOfDay: ['any'],
      minTurnNumber: 6,
      maxPerSession: 1,
      weight: 10
    },

    title: 'Lost Manuscript Page',
    description: 'A torn page from a medical text lies in the mud, partially trampled. You can make out Latin text about humoral balance and bloodletting. Someone\'s loss could be your gain.',
    icon: '📜',
    colorScheme: 'amber',

    choices: [
      {
        action: 'keep',
        label: 'Keep it',
        outcomes: {
          inventory: [{ item: 'Manuscript Page (Galen)', quantity: 1 }],
          xp: 1,
          narrativeTemplate: 'You carefully retrieve the page and clean off the mud. Faded but legible—a fragment of Galen\'s teachings. You\'ll add it to your collection.'
        }
      },
      {
        action: 'return',
        label: 'Return to bookshop',
        cost: { time: 15 },
        outcomes: {
          reputation: { guild: 3 },
          xp: 2,
          narrativeTemplate: 'You bring it to the nearest bookshop. The owner is grateful—it\'s from an expensive text he sold recently. He offers you a discount on your next purchase.'
        }
      },
      {
        action: 'leave',
        label: 'Leave it',
        outcomes: {
          narrativeTemplate: 'It\'s too damaged to be useful. You leave it where you found it, returning to the mud from whence it came.'
        }
      }
    ]
  },

  {
    id: 'dead-rat-plague',
    category: 'environmental',
    type: 'random_event',

    triggers: {
      locations: ['fountain', 'market'],
      timeOfDay: ['any'],
      minTurnNumber: 15,
      maxPerSession: 1,
      weight: 7
    },

    title: 'Dead Rat',
    description: 'A dead rat lies near the public fountain, bloated and foul-smelling. In a city that remembers plague outbreaks, this is cause for alarm. People pass by nervously.',
    icon: '🐀',
    colorScheme: 'red',

    choices: [
      {
        action: 'report',
        label: 'Report to authorities',
        cost: { time: 20 },
        outcomes: {
          reputation: { elite: 5 },
          xp: 2,
          narrativeTemplate: 'You report it to a constable immediately. He dispatches workers to clean the fountain. Your vigilance may have prevented a plague outbreak.'
        }
      },
      {
        action: 'examine',
        label: 'Examine it (Medical)',
        cost: { time: 10, energy: 5 },
        risk: true,
        outcomes: {
          random: true,
          successChance: 80,
          success: {
            xp: 3,
            knowledge: 'plague_signs',
            narrativeTemplate: 'You examine it carefully, noting the swelling and discoloration. No buboes—likely not plague, but a warning nonetheless. You\'ll be more vigilant.'
          },
          failure: {
            health: -5,
            narrativeTemplate: 'Your examination was too close. You feel queasy afterward. Hopefully you didn\'t catch anything from the diseased creature.'
          }
        }
      },
      {
        action: 'avoid',
        label: 'Avoid the area',
        outcomes: {
          narrativeTemplate: 'You give the fountain a wide berth and warn your neighbors to do the same. Better safe than sorry when plague is concerned.'
        }
      }
    ]
  },

  {
    id: 'suspicious-plant-seller',
    category: 'environmental',
    type: 'random_event',

    triggers: {
      locations: ['alley', 'market'],
      timeOfDay: ['evening', 'afternoon'],
      minTurnNumber: 10,
      maxPerSession: 1,
      weight: 9,
      minWealth: 5
    },

    title: 'Black Market Herbs',
    description: 'A hooded figure in a dark alley whispers, "Rare ingredients, Doña. From the Orient. No questions asked." He shows you genuine Chinese ginger root—expensive and hard to obtain legally.',
    icon: '🥷',
    colorScheme: 'purple',

    choices: [
      {
        action: 'buy',
        label: 'Buy it (5 reales)',
        requirements: { minWealth: 5 },
        cost: { wealth: 5 },
        risk: true,
        outcomes: {
          inventory: [{ item: 'Chinese Ginger', quantity: 1 }],
          xp: 2,
          narrativeTemplate: 'You exchange coins quickly. The ginger is genuine—a valuable find. But you wonder: was it stolen? Smuggled? Some things are better left unknown.'
        }
      },
      {
        action: 'ask_questions',
        label: 'Ask about source',
        cost: { time: 10 },
        outcomes: {
          xp: 2,
          knowledge: 'black_market',
          narrativeTemplate: 'He reveals a network of smugglers bringing goods from Manila. Useful information, though dangerous knowledge. He eyes you carefully, deciding if you\'re trustworthy.'
        }
      },
      {
        action: 'refuse',
        label: 'Refuse politely',
        outcomes: {
          narrativeTemplate: 'You shake your head and back away. Better not to get involved with the black market—the Inquisition watches for such things.'
        }
      }
    ]
  },

  {
    id: 'cloud-formation',
    category: 'environmental',
    type: 'random_event',

    triggers: {
      locations: ['any_outdoor'],
      timeOfDay: ['afternoon'],
      minTurnNumber: 8,
      maxPerSession: 1,
      weight: 8
    },

    title: 'Beautiful Sky',
    description: 'The afternoon sky is painted in brilliant oranges and purples as the sun descends toward Popocatépetl. The volcano\'s peak pierces the clouds, majestic and eternal.',
    icon: '🌅',
    colorScheme: 'blue',

    choices: [
      {
        action: 'admire',
        label: 'Pause and admire',
        cost: { time: 5 },
        outcomes: {
          morale: 10,
          xp: 1,
          narrativeTemplate: 'You stop and simply breathe, watching the light dance across the sky. In this harsh world, beauty still exists. You feel renewed.'
        }
      },
      {
        action: 'predict',
        label: 'Predict tomorrow\'s weather',
        cost: { time: 3 },
        outcomes: {
          random: true,
          successChance: 60,
          success: {
            xp: 2,
            knowledge: 'weather_lore',
            narrativeTemplate: 'Red sky at night, sailor\'s delight. You predict fair weather tomorrow. Your grandmother taught you to read the skies—knowledge older than books.'
          },
          failure: {
            xp: 1,
            narrativeTemplate: 'You try to read the clouds but cannot divine tomorrow\'s weather. The sky keeps its secrets.'
          }
        }
      },
      {
        action: 'continue',
        label: 'Continue on',
        outcomes: {
          narrativeTemplate: 'No time for stargazing. Work awaits. You hurry along without a second glance.'
        }
      }
    ]
  },

  // ============================================
  // RELIGIOUS & SOCIAL (7 events)
  // ============================================

  {
    id: 'indulgence-seller',
    category: 'religious',
    type: 'random_event',

    triggers: {
      locations: ['cathedral', 'plaza'],
      timeOfDay: ['morning', 'afternoon'],
      minTurnNumber: 8,
      maxPerSession: 1,
      weight: 10,
      minWealth: 3
    },

    title: 'Papal Indulgence',
    description: 'A Dominican friar sells papal indulgences from a ornate stand. "Shorten your time in Purgatory!" he calls. "Three reales for divine mercy!" The Church\'s fundraising knows no bounds.',
    icon: '📿',
    colorScheme: 'purple',

    choices: [
      {
        action: 'buy',
        label: 'Buy indulgence',
        shortLabel: '3 reales',
        requirements: { minWealth: 3 },
        cost: { wealth: 3 },
        outcomes: {
          reputation: { church: 10 },
          morale: 5,
          narrativeTemplate: 'You purchase the indulgence, receiving a signed certificate. The friar blesses you. Whatever theological debates rage in Europe, here you\'ve shown proper piety.'
        }
      },
      {
        action: 'decline',
        label: 'Decline politely',
        outcomes: {
          reputation: { church: 2 },
          narrativeTemplate: 'You demur respectfully, citing your own devotions. The friar nods understandingly and turns to more prosperous targets.'
        }
      },
      {
        action: 'question',
        label: 'Question the theology (dangerous)',
        risk: true,
        outcomes: {
          reputation: { church: -8 },
          xp: 2,
          narrativeTemplate: 'You quietly question whether salvation can be purchased. The friar\'s eyes narrow dangerously. Several onlookers step away from you. Unwise words in New Spain.'
        }
      }
    ]
  },

  {
    id: 'public-penance',
    category: 'religious',
    type: 'random_event',

    triggers: {
      locations: ['cathedral', 'plaza'],
      timeOfDay: ['morning'],
      minTurnNumber: 10,
      maxPerSession: 1,
      weight: 9
    },

    title: 'Public Penance',
    description: 'A woman kneels on the cathedral steps in a sanbenito—the yellow robe of the penitent. Her crime: blasphemy. She prays aloud, tearfully begging God\'s forgiveness as citizens pass in judgment.',
    icon: '🙏',
    colorScheme: 'purple',

    choices: [
      {
        action: 'pray',
        label: 'Pray for her',
        cost: { time: 10 },
        outcomes: {
          reputation: { church: 3 },
          morale: -3,
          narrativeTemplate: 'You kneel nearby and pray for her soul. The harsh justice of the Church weighs on your heart, but you dare not question it openly.'
        }
      },
      {
        action: 'offer_water',
        label: 'Offer water (risky)',
        requirements: { hasItem: 'Water' },
        cost: { inventory: [{ item: 'Water', quantity: 1 }] },
        risk: true,
        outcomes: {
          reputation: { commonFolk: 5, church: -2 },
          xp: 2,
          narrativeTemplate: 'You discreetly offer her water. She whispers thanks through cracked lips. An Inquisitor watches but says nothing—charity is permissible, barely.'
        }
      },
      {
        action: 'avert',
        label: 'Avert your eyes',
        outcomes: {
          narrativeTemplate: 'You look away and continue walking. There but for the grace of God go you. Best not to attract attention.'
        }
      }
    ]
  },

  {
    id: 'converso-suspicion',
    category: 'religious',
    type: 'random_event',

    triggers: {
      locations: ['any'],
      timeOfDay: ['any'],
      minTurnNumber: 12,
      maxPerSession: 1,
      weight: 7,
      maxChurchRep: 70 // Only if church reputation isn't very high
    },

    title: 'Suspicious Stare',
    description: 'An elderly Spanish woman stares at you intently. Her eyes narrow. Does she suspect your converso heritage? Has she heard rumors? Your heart quickens despite your outward calm.',
    icon: '👁️',
    colorScheme: 'red',

    choices: [
      {
        action: 'cross',
        label: 'Cross yourself visibly',
        cost: { time: 2 },
        outcomes: {
          reputation: { church: 5 },
          narrativeTemplate: 'You make a deliberate sign of the cross and murmur "Jesús, María y José." Her expression softens. Just a devout Christian woman, nothing suspicious. You breathe easier.'
        }
      },
      {
        action: 'smile',
        label: 'Smile politely',
        outcomes: {
          narrativeTemplate: 'You offer a polite smile and nod. She sniffs disdainfully but looks away. Perhaps she was simply judging your clothing. You can never be certain.'
        }
      },
      {
        action: 'leave',
        label: 'Leave quickly',
        risk: true,
        outcomes: {
          reputation: { church: -3 },
          narrativeTemplate: 'You hurry away, perhaps too quickly. Might that seem like fleeing guilt? You curse yourself—paranoia breeds its own suspicion.'
        }
      }
    ]
  },

  {
    id: 'beggar-sick-child',
    category: 'religious',
    type: 'random_event',

    triggers: {
      locations: ['cathedral', 'streets'],
      timeOfDay: ['any'],
      minTurnNumber: 5,
      maxPerSession: 1,
      weight: 13
    },

    title: 'Desperate Mother',
    description: 'An Indigenous mother begs at the church steps, a sick child in her arms. The girl\'s breathing is labored, her lips pale. "Please, Doña," the mother pleads in broken Spanish. "My daughter needs help."',
    icon: '👶',
    colorScheme: 'blue',

    choices: [
      {
        action: 'donate_food',
        label: 'Donate food',
        requirements: { hasItem: 'Bread' },
        cost: { inventory: [{ item: 'Bread', quantity: 1 }] },
        outcomes: {
          reputation: { indigenous: 10, commonFolk: 5 },
          xp: 5,
          narrativeTemplate: 'You give her bread and show her how to make a simple broth for the child. The mother weeps with gratitude, pressing your hand to her forehead in blessing.'
        }
      },
      {
        action: 'donate_coins',
        label: 'Donate coins',
        shortLabel: '2 reales',
        requirements: { minWealth: 2 },
        cost: { wealth: 2 },
        outcomes: {
          reputation: { indigenous: 5, commonFolk: 3 },
          xp: 2,
          narrativeTemplate: 'You press two reales into her palm. She clutches the coins desperately—enough for a few days of food, at least.'
        }
      },
      {
        action: 'medical_advice',
        label: 'Offer medical advice (free)',
        cost: { time: 10, energy: 5 },
        outcomes: {
          reputation: { indigenous: 8, commonFolk: 5 },
          xp: 3,
          narrativeTemplate: 'You examine the child briefly—a simple cold, not plague. You advise warm liquids and rest. The mother memorizes your every word, hope lighting her eyes.'
        }
      },
      {
        action: 'refuse',
        label: 'Continue on',
        outcomes: {
          reputation: { indigenous: -8, commonFolk: -3 },
          morale: -5,
          narrativeTemplate: 'You shake your head and walk past. The mother\'s pleas follow you down the street. You tell yourself you cannot help everyone, but the guilt lingers.'
        }
      }
    ]
  },

  {
    id: 'elite-recognition',
    category: 'religious',
    type: 'random_event',

    triggers: {
      locations: ['plaza', 'cathedral'],
      timeOfDay: ['afternoon'],
      minTurnNumber: 15,
      maxPerSession: 1,
      weight: 10,
      minEliteRep: 50 // Only if you've built elite reputation
    },

    title: 'Public Recognition',
    description: 'A well-dressed criollo gentleman approaches. "Doña Maria de Lima, is it not? You treated my wife\'s fever last month. Excellent work!" Several onlookers turn to observe this public endorsement.',
    icon: '🎩',
    colorScheme: 'purple',

    choices: [
      {
        action: 'accept_graciously',
        label: 'Accept praise graciously',
        cost: { time: 5 },
        outcomes: {
          reputation: { elite: 10 },
          xp: 2,
          narrativeTemplate: 'You accept his thanks with appropriate modesty. The public endorsement raises your status—elite patients notice competent healers. Your reputation grows.'
        }
      },
      {
        action: 'deflect_humbly',
        label: 'Deflect humbly',
        cost: { time: 5 },
        outcomes: {
          reputation: { elite: 5, church: 5 },
          xp: 2,
          narrativeTemplate: 'You credit God\'s mercy and your medical training. Proper humility impresses both the gentleman and a nearby priest. Virtue and skill combined.'
        }
      },
      {
        action: 'ignore',
        label: 'Pretend not to hear',
        risk: true,
        outcomes: {
          reputation: { elite: -5 },
          narrativeTemplate: 'You feign distraction and walk on. The gentleman looks puzzled and slightly offended. Others notice the snub. A poor political choice.'
        }
      }
    ]
  },

  {
    id: 'gossip-opportunity',
    category: 'religious',
    type: 'random_event',

    triggers: {
      locations: ['market', 'fountain'],
      timeOfDay: ['morning', 'afternoon'],
      minTurnNumber: 7,
      maxPerSession: 2,
      weight: 14
    },

    title: 'Gossiping Women',
    description: 'Three women whisper near the fountain. You catch fragments: "...Don Luis the moneylender..." "...Inquisition..." "...debts forgiven if..." They notice you and fall silent, eyeing you measuringly.',
    icon: '🗣️',
    colorScheme: 'amber',

    choices: [
      {
        action: 'join',
        label: 'Join the conversation',
        cost: { time: 15 },
        outcomes: {
          reputation: { commonFolk: 3 },
          knowledge: 'don_luis_secrets',
          xp: 2,
          narrativeTemplate: 'You join their circle. They warm to you, sharing valuable information: Don Luis has enemies, and the Inquisition watches him. Useful intelligence.'
        }
      },
      {
        action: 'listen',
        label: 'Listen quietly',
        cost: { time: 10 },
        outcomes: {
          knowledge: 'marketplace_gossip',
          xp: 1,
          narrativeTemplate: 'You pretend to fill your water jug while listening. You catch enough to piece together the story. Information without commitment.'
        }
      },
      {
        action: 'walk_away',
        label: 'Walk away',
        outcomes: {
          narrativeTemplate: 'You nod politely and continue on. Gossip is dangerous currency—best to avoid entanglement in others\' affairs.'
        }
      }
    ]
  },

  {
    id: 'saints-day',
    category: 'religious',
    type: 'random_event',

    triggers: {
      locations: ['plaza', 'streets'],
      timeOfDay: ['afternoon'],
      minTurnNumber: 10,
      maxPerSession: 1,
      weight: 11
    },

    title: 'Saint\'s Day Fiesta',
    description: 'The plaza erupts in celebration for San Hipólito\'s feast day. Music, dancing, food vendors. Children laugh. The Church blesses the festivities. A rare moment of public joy.',
    icon: '🎉',
    colorScheme: 'blue',

    choices: [
      {
        action: 'join',
        label: 'Join the celebration',
        cost: { time: 30, energy: 10 },
        outcomes: {
          reputation: { church: 5, commonFolk: 5 },
          morale: 15,
          xp: 2,
          narrativeTemplate: 'You join the festivities, dancing and sharing food. For a few hours, the weight of daily life lifts. You feel part of the community, blessed and human.'
        }
      },
      {
        action: 'donate',
        label: 'Donate to church',
        shortLabel: '2 reales',
        requirements: { minWealth: 2 },
        cost: { wealth: 2 },
        outcomes: {
          reputation: { church: 8 },
          xp: 1,
          narrativeTemplate: 'You contribute to the church\'s collection. The priest acknowledges your donation publicly. Piety and generosity on display.'
        }
      },
      {
        action: 'continue',
        label: 'Continue working',
        outcomes: {
          narrativeTemplate: 'You have no time for festivities. Work awaits. The laughter fades as you return to your shop, alone.'
        }
      }
    ]
  },

  // ============================================
  // ECONOMIC & GAMES (5 events)
  // ============================================

  {
    id: 'dice-game',
    category: 'economic',
    type: 'random_event',

    triggers: {
      locations: ['tavern', 'alley'],
      timeOfDay: ['evening', 'afternoon'],
      minTurnNumber: 10,
      maxPerSession: 1,
      weight: 9,
      minWealth: 2
    },

    title: 'Dice Game',
    description: 'Mestizo men huddle in an alley, playing dice. One waves you over. "Care for a wager, Doña? Two reales. Fair odds." His grin is infectious, but his companions look practiced.',
    icon: '🎲',
    colorScheme: 'amber',

    choices: [
      {
        action: 'play',
        label: 'Bet 2 reales',
        requirements: { minWealth: 2 },
        cost: { time: 15 },
        outcomes: {
          random: true,
          successChance: 55,
          success: {
            wealth: 4,
            xp: 2,
            narrativeTemplate: 'The dice tumble in your favor! You win 4 reales. The men groan good-naturedly, clapping your back. Luck favors the bold today.'
          },
          failure: {
            wealth: -2,
            xp: 1,
            narrativeTemplate: 'The dice betray you. Two reales poorer, you learn an expensive lesson about gambling. The men pocket their winnings cheerfully.'
          }
        }
      },
      {
        action: 'watch',
        label: 'Watch and learn',
        cost: { time: 10 },
        outcomes: {
          xp: 1,
          knowledge: 'gambling_tricks',
          narrativeTemplate: 'You watch closely, learning their techniques. One man palms a die expertly—they\'re cheating! Better to observe than participate.'
        }
      },
      {
        action: 'decline',
        label: 'Decline politely',
        outcomes: {
          narrativeTemplate: 'You shake your head with a smile. Gambling is for those with coin to waste. You have debts to pay.'
        }
      }
    ]
  },

  {
    id: 'lightning-sale',
    category: 'economic',
    type: 'random_event',

    triggers: {
      locations: ['market'],
      timeOfDay: ['afternoon', 'evening'],
      minTurnNumber: 8,
      maxPerSession: 1,
      weight: 12,
      minWealth: 4
    },

    title: 'Desperate Vendor',
    description: 'A merchant urgently unloads his wares. "Must sell before nightfall! Tax collector comes tomorrow!" He offers quality cinnamon at 4 reales—normally 6. His desperation is genuine.',
    icon: '💸',
    colorScheme: 'green',

    choices: [
      {
        action: 'buy',
        label: 'Buy at discount (4 reales)',
        requirements: { minWealth: 4 },
        cost: { wealth: 4 },
        outcomes: {
          inventory: [{ item: 'Cinnamon', quantity: 1 }],
          xp: 1,
          narrativeTemplate: 'You purchase the cinnamon quickly. Quality goods at 30% off—a shrewd buy. The merchant looks relieved, counting his coins.'
        }
      },
      {
        action: 'negotiate',
        label: 'Offer 3 reales',
        requirements: { minWealth: 3 },
        outcomes: {
          random: true,
          successChance: 50,
          success: {
            wealth: -3,
            inventory: [{ item: 'Cinnamon', quantity: 1 }],
            xp: 2,
            narrativeTemplate: 'He hesitates, then accepts with a grimace. Three reales for quality cinnamon—an excellent deal. Desperation makes for poor negotiation.'
          },
          failure: {
            reputation: { merchants: -2 },
            narrativeTemplate: 'He shakes his head angrily. "I\'m desperate, not stupid!" He turns to other buyers, and you\'ve made an enemy. Poor judgment.'
          }
        }
      },
      {
        action: 'pass',
        label: 'Pass on the offer',
        outcomes: {
          narrativeTemplate: 'You decline. His desperation is sad, but you have your own financial troubles. He pleads with other passersby.'
        }
      }
    ]
  },

  {
    id: 'barter-offer',
    category: 'economic',
    type: 'random_event',

    triggers: {
      locations: ['market'],
      timeOfDay: ['morning', 'afternoon'],
      minTurnNumber: 12,
      maxPerSession: 1,
      weight: 11,
      minCompounds: 1
    },

    title: 'Barter Proposal',
    description: 'A farmer approaches. "Doña, I have no coin, but my wife needs medicine for her cough. I can offer fresh eggs, honey, and beans—three days\' worth. Will you trade?"',
    icon: '🥚',
    colorScheme: 'green',

    choices: [
      {
        action: 'trade',
        label: 'Trade medicine for food',
        requirements: { hasCompound: true },
        cost: { compounds: 1 },
        outcomes: {
          inventory: [
            { item: 'Eggs', quantity: 6 },
            { item: 'Honey', quantity: 1 },
            { item: 'Beans', quantity: 2 }
          ],
          reputation: { commonFolk: 5 },
          xp: 2,
          narrativeTemplate: 'A fair trade. You exchange a simple cough remedy for wholesome food. The farmer blesses you, promising to tell others of your fairness.'
        }
      },
      {
        action: 'demand_more',
        label: 'Ask for more food',
        outcomes: {
          random: true,
          successChance: 40,
          success: {
            compounds: -1,
            inventory: [
              { item: 'Eggs', quantity: 8 },
              { item: 'Honey', quantity: 2 },
              { item: 'Beans', quantity: 3 }
            ],
            reputation: { commonFolk: -1 },
            xp: 1,
            narrativeTemplate: 'He grumbles but adds more eggs and beans. You got a better deal, though he looks resentful. Business is business.'
          },
          failure: {
            reputation: { commonFolk: -5 },
            narrativeTemplate: 'He shakes his head and walks away, muttering about greedy apothecaries. Your reputation suffers for your greed.'
          }
        }
      },
      {
        action: 'decline',
        label: 'Decline the trade',
        outcomes: {
          narrativeTemplate: 'You need coin, not produce. He leaves disappointed, and you wonder if you made the right choice. Money is scarce for everyone.'
        }
      }
    ]
  },

  {
    id: 'church-lottery',
    category: 'economic',
    type: 'random_event',

    triggers: {
      locations: ['plaza', 'cathedral'],
      timeOfDay: ['afternoon'],
      minTurnNumber: 8,
      maxPerSession: 1,
      weight: 10,
      minWealth: 1
    },

    title: 'Church Raffle',
    description: 'The Church holds a raffle to fund cathedral repairs. "One real per ticket! Grand prize: 10 reales!" A priest watches who contributes to God\'s work.',
    icon: '🎫',
    colorScheme: 'purple',

    choices: [
      {
        action: 'buy_ticket',
        label: 'Buy ticket (1 real)',
        requirements: { minWealth: 1 },
        cost: { wealth: 1 },
        outcomes: {
          reputation: { church: 3 },
          random: true,
          successChance: 10,
          success: {
            wealth: 10,
            xp: 2,
            narrativeTemplate: 'Miracle! Your name is drawn! The priest hands you 10 reales as the crowd applauds. God smiles on the faithful today.'
          },
          failure: {
            xp: 1,
            narrativeTemplate: 'Another name is called. You didn\'t win, but you supported the Church. The priest notes your contribution approvingly.'
          }
        }
      },
      {
        action: 'donate_no_ticket',
        label: 'Donate without ticket (1 real)',
        requirements: { minWealth: 1 },
        cost: { wealth: 1 },
        outcomes: {
          reputation: { church: 5 },
          xp: 1,
          narrativeTemplate: 'You donate without taking a ticket—pure charity. The priest is impressed by your selflessness. True piety requires no earthly reward.'
        }
      },
      {
        action: 'decline',
        label: 'Decline to participate',
        outcomes: {
          narrativeTemplate: 'You politely decline. The priest frowns slightly but says nothing. Not everyone can afford charity, even to the Church.'
        }
      }
    ]
  },

  {
    id: 'guild-math-challenge',
    category: 'economic',
    type: 'random_event',

    triggers: {
      locations: ['guild'],
      timeOfDay: ['afternoon'],
      minTurnNumber: 15,
      maxPerSession: 1,
      weight: 8
    },

    title: 'Mathematical Test',
    description: 'A fellow apothecary quizzes you: "If three drachms of mercury cost 8 reales, what\'s the price for five drachms?" Other guild members watch, testing your competence.',
    icon: '🧮',
    colorScheme: 'amber',

    choices: [
      {
        action: 'answer_correct',
        label: 'Answer: 13.33 reales',
        outcomes: {
          skillCheck: 'calculation',
          difficulty: 50,
          success: {
            reputation: { guild: 5 },
            xp: 3,
            narrativeTemplate: 'You answer confidently and correctly. The questioner nods with respect. Your mathematical skill impresses the assembled apothecaries.'
          },
          failure: {
            reputation: { guild: -3 },
            narrativeTemplate: 'You miscalculate. The questioner corrects you gently. Others exchange glances. Your reputation suffers slightly.'
          }
        }
      },
      {
        action: 'admit_uncertain',
        label: 'Admit you\'re not sure',
        outcomes: {
          reputation: { guild: 1 },
          narrativeTemplate: 'You admit uncertainty honestly. They appreciate your humility over false confidence. No shame in admitting limits—better than bluffing.'
        }
      },
      {
        action: 'deflect',
        label: 'Deflect with humor',
        outcomes: {
          reputation: { guild: 0 },
          narrativeTemplate: 'You joke that you\'re better with herbs than numbers. Weak laughter. The test goes unanswered, and you\'ve neither gained nor lost respect.'
        }
      }
    ]
  },

  // ============================================
  // DANGER & DRAMA (4 events)
  // ============================================

  {
    id: 'inquisition-notice',
    category: 'danger',
    type: 'random_event',

    triggers: {
      locations: ['cathedral', 'plaza'],
      timeOfDay: ['any'],
      minTurnNumber: 10,
      maxPerSession: 1,
      weight: 7
    },

    title: 'Trial Announcement',
    description: 'A notice is posted on the cathedral doors: a list of accused heretics scheduled for Inquisition trial. Your hands tremble as you approach. Are there names you know?',
    icon: '📋',
    colorScheme: 'red',

    choices: [
      {
        action: 'read_closely',
        label: 'Read it closely',
        cost: { time: 10 },
        risk: true,
        outcomes: {
          reputation: { church: -2 },
          knowledge: 'inquisition_targets',
          xp: 2,
          narrativeTemplate: 'You read every name carefully. No one you know—this time. But studying Inquisition notices too closely draws attention. A priest watches you read.'
        }
      },
      {
        action: 'glance',
        label: 'Glance quickly',
        cost: { time: 3 },
        outcomes: {
          knowledge: 'inquisition_activity',
          xp: 1,
          narrativeTemplate: 'You scan it briefly. General information absorbed. Safer than lingering, but you missed details. The Inquisition remains active—a constant threat.'
        }
      },
      {
        action: 'avoid',
        label: 'Avoid it entirely',
        outcomes: {
          narrativeTemplate: 'You avert your eyes and hurry past. Ignorance might be safer. Those who study such lists too carefully sometimes find their own names added later.'
        }
      }
    ]
  },

  {
    id: 'constable-questioning',
    category: 'danger',
    type: 'random_event',

    triggers: {
      locations: ['streets'],
      timeOfDay: ['any'],
      minTurnNumber: 12,
      maxPerSession: 1,
      weight: 8
    },

    title: 'Constable\'s Questions',
    description: 'A Spanish constable stops you. "Doña, have you seen a suspicious Indigenous man lurking near the cathedral? Tall, scarred face?" He watches your reaction carefully.',
    icon: '⚔️',
    colorScheme: 'red',

    choices: [
      {
        action: 'cooperate',
        label: 'Cooperate fully',
        cost: { time: 10 },
        outcomes: {
          reputation: { elite: 5, church: 2 },
          xp: 1,
          narrativeTemplate: 'You answer his questions thoroughly, describing anyone you might have seen. He nods, satisfied with your civic cooperation. Law and order appreciated.'
        }
      },
      {
        action: 'vague',
        label: 'Answer vaguely',
        cost: { time: 5 },
        outcomes: {
          narrativeTemplate: 'You claim to have seen many people but no one matching that description. He frowns but accepts your answer. Neutral ground maintained.'
        }
      },
      {
        action: 'lie',
        label: 'Lie to protect the stranger',
        risk: true,
        outcomes: {
          random: true,
          successChance: 60,
          success: {
            reputation: { indigenous: 5 },
            xp: 2,
            narrativeTemplate: 'You send him in the wrong direction. He thanks you and departs. You may have saved an innocent—or harbored a criminal. The risk was yours.'
          },
          failure: {
            reputation: { elite: -5 },
            xp: 1,
            narrativeTemplate: 'He sees through your deception. His eyes narrow. "Lying to authorities is serious, Doña." He lets you go with a warning, but you\'re now on his list.'
          }
        }
      }
    ]
  },

  {
    id: 'medical-emergency',
    category: 'danger',
    type: 'random_event',

    triggers: {
      locations: ['streets', 'market'],
      timeOfDay: ['any'],
      minTurnNumber: 10,
      maxPerSession: 1,
      weight: 10
    },

    title: 'Collapsed Man',
    description: 'A man collapses in the street, clutching his chest. A crowd gathers but no one helps. "Is there a physician?" someone calls. All eyes turn, searching. Some land on you.',
    icon: '🏥',
    colorScheme: 'red',

    choices: [
      {
        action: 'help',
        label: 'Help immediately',
        cost: { energy: 15, time: 20 },
        outcomes: {
          skillCheck: 'medicine',
          difficulty: 60,
          success: {
            reputation: { commonFolk: 10, elite: 5 },
            xp: 5,
            narrativeTemplate: 'You rush to his side, checking his pulse and breathing. Your quick intervention saves his life. The crowd erupts in grateful applause. Your skill is proven publicly.'
          },
          failure: {
            reputation: { commonFolk: -5 },
            morale: -10,
            narrativeTemplate: 'Despite your efforts, he dies in the street. The crowd murmurs. Some question your competence. The weight of failure crushes your spirit.'
          }
        }
      },
      {
        action: 'call_physician',
        label: 'Call for a licensed physician',
        cost: { time: 10 },
        outcomes: {
          reputation: { elite: 2 },
          xp: 1,
          narrativeTemplate: 'You shout for a licensed physician and help clear space. Someone runs to fetch one. You\'ve done the prudent thing—deferring to proper authority.'
        }
      },
      {
        action: 'avoid',
        label: 'Avoid the crowd',
        risk: true,
        outcomes: {
          reputation: { commonFolk: -5 },
          narrativeTemplate: 'You slip away before being recognized. Cowardly, perhaps, but safe. If he dies and you\'d tried to help, the blame would be yours. Still, guilt gnaws.'
        }
      }
    ]
  },

  {
    id: 'theft-accusation',
    category: 'danger',
    type: 'random_event',

    triggers: {
      locations: ['market'],
      timeOfDay: ['afternoon'],
      minTurnNumber: 8,
      maxPerSession: 1,
      weight: 9
    },

    title: 'False Accusation',
    description: 'A Spanish merchant grabs an Indigenous youth by the collar. "Thief! He stole my purse!" The boy protests in Nahuatl, terrified. A constable approaches. The crowd waits for someone to speak.',
    icon: '👮',
    colorScheme: 'red',

    choices: [
      {
        action: 'defend_youth',
        label: 'Defend the youth',
        risk: true,
        outcomes: {
          reputation: { indigenous: 10, merchants: -5 },
          xp: 3,
          narrativeTemplate: 'You speak up: "I saw no theft. The boy was browsing peacefully." The merchant glares, but the constable releases the youth. You\'ve made an enemy but saved an innocent.'
        }
      },
      {
        action: 'neutral',
        label: 'Remain neutral',
        outcomes: {
          narrativeTemplate: 'You stay silent. The constable drags the boy away, still protesting. You told yourself it wasn\'t your business. The guilt will linger longer than you\'d like.'
        }
      },
      {
        action: 'support_merchant',
        label: 'Support the merchant',
        risk: true,
        outcomes: {
          reputation: { merchants: 5, indigenous: -8 },
          xp: 1,
          narrativeTemplate: 'You claim you saw the theft. The boy is arrested. The merchant thanks you. Later, you wonder: was he truly guilty, or did you condemn an innocent?'
        }
      }
    ]
  }
];

// Export event by ID for easy access
export const getEventById = (id) => EVENT_POOL.find(event => event.id === id);

// Export events by category
export const getEventsByCategory = (category) => EVENT_POOL.filter(event => event.category === category);

// Total event count
export const TOTAL_EVENTS = EVENT_POOL.length;
