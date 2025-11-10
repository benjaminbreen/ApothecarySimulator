/**
 * Story NPC configurations
 * Replaces legacy quest scripting with lightweight data the LLM can react to.
 *
 * Each entry defines:
 * - spawn rules (turns, locations, cooldown)
 * - simple interaction payload (maps to SimpleInteractionCard)
 * - outcome mapping keyed by player action
 */

export const STORY_NPCS = [
  {
    id: 'antonius_philalethes',
    name: 'Antonius Philalethes',
    portrait: '/portraits/antonius.jpg',
    summary: 'Greek alchemist expelled by the Inquisition, obsessed with perfecting sublimation furnaces.',
    arrivalText: 'Antonius Philalethes arrives with soot-darkened sleeves and an anxious glint in his eyes.',
    preferredLocations: ['botica', 'market', 'plaza'],
    minTurn: 3,
    cooldown: 6,
    weight: 1,
    interaction: {
      type: 'information_exchange',
      npcRole: 'Alchemist',
      information: {
        topic: 'forbidden sublimation diagrams',
        cost: '5 reales',
        value: 'Unlocks Sublimation mixing method'
      },
      successAction: 'pay',
      failureAction: 'refuse'
    },
    outcomes: {
      pay: {
        state: 'completed',
        rewards: [
          { type: 'unlock_method', method: 'Sublimation' },
          { type: 'reputation', faction: 'elite', amount: 2 }
        ],
        journal: 'Funded Antonius’s clandestine furnace and learned his sublimation process.'
      },
      refuse: {
        state: 'declined',
        penalties: [
          { type: 'reputation', faction: 'elite', amount: -1 }
        ],
        journal: 'Refused Antonius’s dangerous proposal; he left muttering about Portuguese caution.'
      }
    }
  },
  {
    id: 'tlacaelel_codex',
    name: 'Tlacaelel',
    portrait: '/portraits/tlacaelel.jpg',
    summary: 'Nahuatl scribe guarding a codex of traditional materia medica.',
    arrivalText: 'Tlacaelel unwraps a worn codex bound in painted deerskin, asking if Maria respects old knowledge.',
    preferredLocations: ['market', 'plaza', 'street'],
    minTurn: 5,
    cooldown: 8,
    weight: 1,
    interaction: {
      type: 'information_exchange',
      npcRole: 'Codex Keeper',
      information: {
        topic: 'Nahua remedies recorded in his codex',
        cost: '3 reales',
        value: 'Insight into Indigenous materia medica'
      },
      successAction: 'pay',
      failureAction: 'refuse'
    },
    outcomes: {
      pay: {
        state: 'completed',
        rewards: [
          { type: 'reputation', faction: 'indigenous', amount: 3 },
          { type: 'inventory', item: 'Codex Fragment', quantity: 1 }
        ],
        journal: 'Purchased a codex fragment from Tlacaelel documenting Nahua plant lore.'
      },
      refuse: {
        state: 'declined',
        penalties: [
          { type: 'reputation', faction: 'indigenous', amount: -2 }
        ],
        journal: 'Declined Tlacaelel’s offer; the codex leaves with its secrets intact.'
      }
    }
  },
  {
    id: 'alonso_garcia',
    name: 'Alonso García',
    portrait: '/portraits/alonso_garcia.jpg',
    summary: 'Sign maker secretly spying for Maria’s rival Juan Braga.',
    arrivalText: 'Alonso arrives with charcoal-stained fingers, asking to inspect Maria’s tinctures.',
    preferredLocations: ['botica', 'street'],
    minTurn: 6,
    cooldown: 7,
    weight: 0.8,
    interaction: {
      type: 'competitive_check',
      npcRole: 'Rival artisan',
      competitive: {
        difficulty: 'medium',
        goal: 'Pry trade secrets about Botica de la Amargura'
      },
      successAction: 'misdirect',
      failureAction: 'show_around'
    },
    outcomes: {
      misdirect: {
        state: 'completed',
        rewards: [
          { type: 'reputation', faction: 'guild', amount: 2 }
        ],
        journal: 'Misdirected Alonso with fabricated recipes, keeping Juan Braga guessing.'
      },
      refuse_politely: {
        state: 'met',
        rewards: [
          { type: 'reputation', faction: 'guild', amount: 1 }
        ],
        journal: 'Politely refused to reveal shop secrets to Alonso.'
      },
      show_around: {
        state: 'declined',
        penalties: [
          { type: 'reputation', faction: 'guild', amount: -2 }
        ],
        journal: 'Let Alonso inspect the workspace; word will likely reach Juan Braga.'
      },
      boast: {
        state: 'declined',
        penalties: [
          { type: 'reputation', faction: 'guild', amount: -1 }
        ],
        journal: 'Boasted about techniques to Alonso, giving him plenty to whisper about.'
      }
    }
  },
  {
    id: 'licenciado_ramirez',
    name: 'Licenciado Rodrigo Ramírez',
    portrait: '/portraits/rodrigo_ramirez.jpg',
    summary: 'Guild lawyer pressing the lawsuit against unlicensed healers.',
    arrivalText: 'Licenciado Ramírez arrives with crisp legal parchments, demanding a “compliance donation.”',
    preferredLocations: ['botica', 'cathedral', 'plaza'],
    minTurn: 10,
    cooldown: 10,
    weight: 0.9,
    interaction: {
      type: 'extortion_demand',
      extortion: {
        demandType: 'guild bribe',
        amount: 8,
        threatLevel: 'direct',
        threatener: 'official',
        consequence: 'Guild seizure of the botica',
        difficulty: 'hard'
      },
      successAction: 'refuse',
      failureAction: 'pay'
    },
    outcomes: {
      refuse: {
        state: 'completed',
        rewards: [
          { type: 'reputation', faction: 'commonFolk', amount: 3 }
        ],
        journal: 'Refused Licenciado Ramírez’s bribe; the guild lawyer left fuming.'
      },
      pay: {
        state: 'declined',
        penalties: [
          { type: 'reputation', faction: 'guild', amount: -2 }
        ],
        journal: 'Paid Licenciado Ramírez to stall the lawsuit, but the guild now knows Maria is vulnerable.'
      }
    }
  },
  {
    id: 'beatriz_moreno',
    name: 'Beatriz Moreno',
    portrait: '/portraits/elderlycriollofemalehealer.jpg',
    summary: 'Criolla curandera willing to trade Indigenous/herbal knowledge if treated respectfully.',
    arrivalText: 'Beatriz Moreno arrives with a satchel of herbs, gauging whether Maria respects traditional healers.',
    preferredLocations: ['market', 'plaza', 'botica'],
    minTurn: 8,
    cooldown: 6,
    weight: 1.1,
    interaction: {
      type: 'social_visit',
      npcRole: 'Curandera',
      social: {
        purpose: 'Share traditional remedies or test Maria’s humility',
        mood: 'Cautiously curious'
      },
      successAction: 'welcome',
      failureAction: 'decline'
    },
    outcomes: {
      welcome: {
        state: 'completed',
        rewards: [
          { type: 'inventory', item: 'Indigenous Remedy Kit', quantity: 1 },
          { type: 'reputation', faction: 'indigenous', amount: 2 }
        ],
        journal: 'Welcomed Beatriz and exchanged remedies drawn from Nahua practice.'
      },
      decline: {
        state: 'declined',
        penalties: [
          { type: 'reputation', faction: 'indigenous', amount: -2 }
        ],
        journal: 'Turned Beatriz away; word will spread among curanderas.'
      }
    }
  },
  {
    id: 'sergeant_miguel',
    name: 'Sergeant Miguel Cordero',
    portrait: '/portraits/mulattosoldier.jpg',
    summary: 'Mulato militia sergeant whose infected musket wound still festers.',
    arrivalText: 'Sergeant Miguel stomps in from patrol, grimacing and clutching his shoulder.',
    preferredLocations: ['street', 'plaza'],
    minTurn: 7,
    cooldown: 6,
    weight: 1,
    interaction: {
      type: 'donation_request',
      npcRole: 'City patrol',
      request: {
        item: 'healing liniment for his shoulder',
        reputationImpact: {
          donate: 2,
          refuse: -1
        }
      },
      successAction: 'donate',
      failureAction: 'refuse'
    },
    outcomes: {
      donate: {
        state: 'completed',
        rewards: [],
        journal: 'Provided liniment to Sergeant Miguel; the patrol owes Maria a favor.'
      },
      refuse: {
        state: 'declined',
        penalties: [
          { type: 'reputation', faction: 'commonFolk', amount: -2 }
        ],
        journal: 'Refused Miguel’s request; gossip among the patrol will not be kind.'
      }
    }
  },
  {
    id: 'don_rodrigo_salazar',
    name: 'Don Rodrigo de Salazar',
    portrait: '/portraits/elderlypeninsulareman.jpg',
    summary: 'Retired colonial official suffering from gout and kidney stones.',
    arrivalText: 'Don Rodrigo arrives borne on a litter, demanding a discreet consultation.',
    preferredLocations: ['botica', 'palace', 'elite'],
    minTurn: 9,
    cooldown: 8,
    weight: 0.9,
    interaction: {
      type: 'social_visit',
      npcRole: 'Elite patron',
      social: {
        purpose: 'Private consultation about his recurring gout',
        mood: 'Imperious but worried'
      },
      successAction: 'welcome',
      failureAction: 'decline'
    },
    outcomes: {
      welcome: {
        state: 'completed',
        rewards: [
          { type: 'wealth', amount: 12 },
          { type: 'reputation', faction: 'elite', amount: 3 }
        ],
        journal: 'Advised Don Rodrigo discreetly; he paid handsomely for treatment.'
      },
      decline: {
        state: 'declined',
        penalties: [
          { type: 'reputation', faction: 'elite', amount: -3 }
        ],
        journal: 'Refused Don Rodrigo’s request; rumors of insolence may spread through the cabildo.'
      }
    }
  },
  {
    id: 'leonor_mendez',
    name: 'Leonor Méndez de Arteaga',
    portrait: '/portraits/criollofemalemerchant.jpg',
    summary: 'Widowed silk merchant with Manila connections seeking reliable partners.',
    arrivalText: 'Leonor sweeps in wearing silk patterned with Manila dyes, ledger in hand.',
    preferredLocations: ['market', 'botica', 'consulado'],
    minTurn: 4,
    cooldown: 6,
    weight: 1.1,
    interaction: {
      type: 'investment_offer',
      npcRole: 'Silk merchant',
      context: 'invites Maria to review her import syndicate',
      investment: {
        investmentType: 'manila_galleon',
        amount: 6,
        duration: 30,
        expectedReturn: { min: 8, max: 14 },
        description: 'Back-room access to galleon cargo auctions—rare materia medica guaranteed.',
        emoji: '🚢'
      },
      successAction: 'view_details',
      failureAction: 'decline'
    },
    outcomes: {
      view_details: {
        state: 'completed',
        rewards: [
          { type: 'reputation', faction: 'merchants', amount: 2 }
        ],
        journal: 'Visited the Consulado with Leonor to review her Manila galleon contacts.'
      },
      maybe_later: {
        state: 'met',
        journal: 'Deferred Leonor’s invitation; she will return if the books stay balanced.'
      },
      decline: {
        state: 'declined',
        penalties: [
          { type: 'reputation', faction: 'merchants', amount: -1 }
        ],
        journal: 'Declined Leonor’s trade proposal; she will remember the slight.'
      }
    }
  },
  {
    id: 'tia_makeda',
    name: 'Tía Makeda',
    portrait: '/portraits/elderlyafricanofeemalepeasant.jpg',
    summary: 'Respected Africana elder whose arthritis threatens her livelihood.',
    arrivalText: 'Tía Makeda hobbles in with a basket of laundry, asking for mercy rather than alms.',
    preferredLocations: ['botica', 'market', 'plaza'],
    minTurn: 5,
    cooldown: 7,
    weight: 1.2,
    interaction: {
      type: 'donation_request',
      npcRole: 'Community elder',
      request: {
        item: 'warming salve or charitable treatment',
        reputationImpact: {
          donate: 3,
          refuse: -2
        }
      },
      successAction: 'donate',
      failureAction: 'refuse'
    },
    outcomes: {
      donate: {
        state: 'completed',
        rewards: [
          { type: 'xp', amount: 2 }
        ],
        journal: 'Treated Tía Makeda’s swollen joints; the African barrio will remember the kindness.'
      },
      refuse: {
        state: 'declined',
        penalties: [
          { type: 'reputation', faction: 'commonFolk', amount: -3 }
        ],
        journal: 'Turned away Tía Makeda; whispers of cold-heartedness follow.'
      }
    }
  },
  {
    id: 'esteban_velazquez',
    name: 'Esteban Velázquez',
    portrait: '/portraits/middleagedmalemeleteer.jpg',
    summary: 'Muleteer who knows every road from Veracruz to the mines—and how to disappear along them.',
    arrivalText: 'Esteban arrives dust-covered from the road, smelling of leather and wet earth.',
    preferredLocations: ['street', 'plaza', 'market'],
    minTurn: 8,
    cooldown: 7,
    weight: 1,
    interaction: {
      type: 'information_exchange',
      npcRole: 'Muleteer',
      information: {
        topic: 'smuggling routes and discreet supply chains',
        cost: '4 reales',
        value: 'Safe passage or contraband ingredients'
      },
      successAction: 'pay',
      failureAction: 'refuse'
    },
    outcomes: {
      pay: {
        state: 'completed',
        rewards: [
          { type: 'inventory', item: 'Smuggled Ingredients', quantity: 1 },
          { type: 'reputation', faction: 'merchants', amount: 1 }
        ],
        journal: 'Paid Esteban for a list of safe routes and contraband contacts.'
      },
      refuse: {
        state: 'declined',
        journal: 'Let Esteban keep his secrets; he shrugs and heads back to his mules.'
      }
    }
  },
  {
    id: 'xochiquetzal_healer',
    name: 'Xochiquetzal',
    portrait: '/portraits/elderlyfemaleindiohealer.jpg',
    summary: 'Renowned Nahua ticitl guarding sacred plant sites.',
    arrivalText: 'Xochiquetzal studies the shelves silently before asking whether Maria respects Nahua healers.',
    preferredLocations: ['plaza', 'botica', 'forest'],
    minTurn: 12,
    cooldown: 10,
    weight: 0.8,
    interaction: {
      type: 'social_visit',
      npcRole: 'Ticitl (traditional healer)',
      social: {
        purpose: 'Judge whether Maria earns access to sacred plant lore',
        mood: 'Testing but hopeful'
      },
      successAction: 'welcome',
      failureAction: 'decline'
    },
    outcomes: {
      welcome: {
        state: 'completed',
        rewards: [
          { type: 'inventory', item: 'Sacred Plant Sample', quantity: 1 },
          { type: 'reputation', faction: 'indigenous', amount: 3 }
        ],
        journal: 'Received a sacred plant sample from Xochiquetzal after honoring her lineage.'
      },
      decline: {
        state: 'declined',
        penalties: [
          { type: 'reputation', faction: 'indigenous', amount: -3 }
        ],
        journal: 'Dismissed Xochiquetzal’s visit; she departs convinced the botica is another colonial tool.'
      }
    }
  }
];

export const STORY_NPC_LOOKUP = STORY_NPCS.reduce((acc, npc) => {
  acc[npc.id] = npc;
  return acc;
}, {});

export function getStoryNpcById(id) {
  return STORY_NPC_LOOKUP[id];
}
