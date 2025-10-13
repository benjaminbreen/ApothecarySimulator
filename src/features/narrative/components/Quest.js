import React, { useState, useEffect } from 'react';
import '../../../Quest.css';
import { useGameState } from '../../../core/state/gameState';
import imageMap from '../../../imageMap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NotificationPopup from '../../../shared/components/NotificationPopup';
import { potentialInventoryItems } from '../../../initialInventory';
import PrescribePopup from '../../medical/components/PrescribePopup'; // Import PrescribePopup
import distillImage from '../../../assets/distill.jpg';
import distillActiveImage from '../../../assets/distill-active.jpg';
import calcinateImage from '../../../assets/calcinate.jpg';
import calcinateActiveImage from '../../../assets/calcinate-active.jpg';
import confectionImage from '../../../assets/confection.jpg';
import confectionActiveImage from '../../../assets/confection-active.jpg';
import decoctImage from '../../../assets/decoct.jpg';
import decoctActiveImage from '../../../assets/decoct-active.jpg';

import { createChatCompletion } from '../../../core/services/llmService';





const quests = [


  {
    id: 0,
    name: 'Prologue',
    completed: false,
    npc: 'Joao the Kitten', // Placeholder NPC for interaction
    classification: 'Prologue',
    trigger: (turnNumber) => turnNumber === 0,  
    stages: [
      {
        type: 'banner',
        image: 'quest0a', // Placeholder dream sequence image
         text: [
          "Strange...",
          "...I'm having the dream again.",
          "Always, the same dream.",
          "Cold Atlantic Ocean waters pulling me down into darkness...",
          "Then the tides pulling me back into new waters... ",
          "... a new world.",
          "In my dreams I am always still in Portugal. Not Mexico. Even after all these years.",
          "We Portuguese have a word for the feeling:",
          " ",
          "...*Saudade*."
        ],
        buttons: [
          { text: 'Try to go back to sleep.', action: 'proceed' },
             { text: 'Start my day.', action: { type: 'goToStage', stage: 'decision' } },
        ],
      },
      {
        type: 'dialogue',
        image: 'quest0b', // image of Joao the kitten
        text: `*Joao the kitten paws at you, meowing softly. It’s clear he doesn’t intend to let you go back to sleep.*`,
        npcResponses: [
          '[NOTE: Joao should NEVER speak and your responses for Joao should only record his actions. He only interacts in short actions of a few words, like *Joao purrs contentedly, seemingly satisfied that you’re awake*]. Give no other commentary, except perhaps a phrase or very short sentence.',
          
        ],
        playerChoices: [
          'Tell Joao you’ll start the day soon.',
          'Shoo Joao away.'
        ],
        decisionPoint: true,
        maxExchanges: 1,
      },
      {
        type: 'decision',
        image: 'quest0c', // Placeholder image of the letter
        text: `*You walk downstairs and find a letter waiting for you. Most of your inventory has been smashed, fragments of jars and piles of spices and herbs scattered around the floor. A harsh demand from **Don Luis the moneylender** threatens to repossess your shop if you don’t get him 100 reales by the following evening. Looks like you have your work cut out for you.*`,
        buttons: [
          { text: 'Ay. This is not good.', action: 'end' }
 
        ],
      },
  ]
  },

  {
    id: 1,
    name: 'The Valencian Alchemist',
    completed: false, 
    npc: 'Antonius Philalethes',
    classification: 'Helper',
trigger: (turnNumber, actions, currentTime, currentDate) => {
  console.log("Checking Quest 1 trigger:", { turnNumber, actions, currentTime, currentDate });
  if (!quests[0].completed && currentDate === 'August 22, 1680') {
    const [time, meridiem] = currentTime.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    
    console.log("Time check:", { hour, meridiem });
    if (meridiem === 'PM' && hour >= 6 && hour <= 10) {
      console.log("Quest 1 trigger conditions met!");
      return true;
    }
  }
  return false;
},
    stages: [
      {
        type: 'banner',
        image: 'quest1a',
        text: `At dusk, after the shop has closed to patients, an unfamiliar man stands in the doorway. He is wearing the wide-brimmed black hat of a traveler, and the pouches strapped to his belt at first make you think he must be a peddler of some kind. He pauses at the threshold, taking in the smells of herbs. Then he speaks.  
        &nbsp;   
        "Good evening, señora. I hope I am not interrupting. I am **Antonius Philalethes**, a scholar. Formerly of Valencia, though by birth I am Greek. By a freak of fortune, I find myself in your city. I was told that you are a skilled apothecary. May we speak?" &nbsp;   
        `,

        buttons: [
         { text: 'Yes, what are you inquiring about?', action: 'proceed' },
          { text: 'No, the shop is closed.', action: 'end' },
          { text: 'I have already heard about you. Let us begin.', action: { type: 'goToStage', stage: 'decision' } },

        ],
      },

      // note to self, to make educational, structure this dialogue part so the student has to actually read the bit about the best mumia being reddish or purplish in quest1tip.jpg in order to answer correctly
      {
        type: 'dialogue',
        image: 'quest1b',
        text: `**Antonius Philalethes**: "In Castille, I had the good fortune of winning the patronage of a great lord involved in high affairs of state. He was a most learned man. My patron taught me the chymical arts, and he encouraged me to read widely in natural philosophy. Do you know Monsieur Descartes, the Frenchman? I met him once. And I have had the honor of corresponding with a few gentlemen of the Royal Society."
        &nbsp;  
        &nbsp;  
        Antonius hesitates for a moment. "I say all this not to boast, but to reassure you that I am motivated by the noblest of goals: curiosity. I have here a substance known as *mumia*. I would be grateful if you might permit me to use some of your tools to conduct an *experimenta* with it. But only if you think it prudent, señora."
        `,
        npcResponses: [
          '[Antonius should be cagey and wary if asked too much about himself - he was prosecuted by the Inquisition and will seek to deflect on this issue.] Me? I am not an interesting man. But I have had the pleasure of meeting many interesting men and women. Monsieur Descartes, for instance. He has introduced a way of thinking that seeks to measure and understand the world through reason, rather than the old doctrines. I find it most convincing. Perhaps I should not be announcing that loudly, however. I am told his doctrines have been rejected by the Church.',
          '[Improvise more based on this - work in references to the Mediterranean drug trade]. A traveler from the lands of the Ottoman sultan arrived in Valencia one day. He sold it to me along with a new substance, much used in the Levant, known as coffee. Disgusting stuff. This mumia, however...',
          '[Extensively draw on your knowledge of Paracelsus and alchemy here.] Mumia is said to contain within it a balsam that can aid in the restoration of the body’s own natural faculties, as Paracelsus says. It is, according to him, imbued with great virtues due to its combination of ancient balsams and the physical remains of mighty lords of Egpyt.',
        ],
        playerChoices: [
          'Ask about Antonius and why he has come.',
          'Ask more about how he came to possess mumia.',
          'Inquire about mumia and its properties.',
        ],
        decisionPoint: true,
        inputType: 'text',
        maxExchanges: 1,
      },
      {
        type: 'decision',
        image: 'quest1c',
        text: 'Antonius presents the mumia and asks, "Which method do you think would be best to test this substance? Calcination, distillation, confection, or decoction?"',
        buttons: [
          { 
            text: 'Calcination', 
            image: calcinateImage, 
            activeImage: calcinateActiveImage, 
            action: 'success' 
          },
          { 
            text: 'Distillation', 
            image: distillImage, 
            activeImage: distillActiveImage, 
            action: 'success' 
          },
          { 
            text: 'Confection', 
            image: confectionImage, 
            activeImage: confectionActiveImage, 
            action: 'failure' 
          },
          { 
            text: 'Decoction', 
            image: decoctImage, 
            activeImage: decoctActiveImage, 
            action: 'failure' 
          }
        ],
      },
      {
  type: 'outcome',
  image: 'quest1d',
  text: (outcome) => {
    if (outcome === 'success') {
      return `The process yields interesting results. Antonius nods approvingly, "Excellent choice, señora. This method has revealed some fascinating properties of the mumia." He carefully measures out a portion and hands it to you. "Please, take this drachm of mumia as a token of my appreciation. I believe it will serve you well in your work."
      `;
    } else {
      return `The process doesn't yield any significant results. Antonius looks disappointed, "Ah, perhaps this wasn't the best method for this substance. Still, we've learned something, haven't we?" He carefully packs away the mumia. "Thank you for your assistance, señora. Perhaps our paths will cross again someday."
      `;
    }
  },
  outcome: (selectedOption) => selectedOption.action,
  reward: (outcome) => outcome === 'success' ? 'mumia' : null,
},
    ],
  },
  {
  id: 2,
  name: 'Letter from the Inquisitor',
  completed: false, 
  npc: 'Inquisitor Santiago Valdez',
  classification: 'Antagonist',
 trigger: (turnNumber, actions) => actions.includes('#startQuest2') || turnNumber === 30,
  stages: [
    {
      type: 'banner',
      image: 'quest2a',
      text: 'A nervous-looking messenger delivers a sealed letter from the Inquisition. The thought of your secret identity as a converso being uncovered once again sends a chill through you as you hold the letter, but upon opening it, you realize it is soemthing quite unusual: a personal invitation from a senior official in the Inquisition named Don Santiago Valdez who turns out to be a patient seeking your assistance, not an Inquisitor seeking to ruin you. He does not specify his ailment. Instead, he simply invites you to his quarters to offer an expert opinion and, if necessary, provide a cure. Will you help him?',
      buttons: [
        { text: 'Yes, I\'ll go', action: 'proceed' },
        { text: 'No, I\'m not interested', action: 'end' },
        { text: 'Tell me more', action: 'proceed' }
      ],
    },
    {
      type: 'dialogue',
      image: 'quest2b',
      text: `Inquisitor Santiago Valdez: "I need your discretion... I have long feared that I have contracted the French pox. Now unmistakeable symptoms have made this a certainty. I am in great pain, Señora. But I am also in an extremely delicate position. My position is... at risk if this becomes known. I am willing to pay handsomely for your silence."`,
      npcResponses: [
        'This illness has been a curse upon my soul. Perhaps it is divine retribution.',
        'You must understand, the consequences of this becoming known would be catastrophic. You must TELL NO ONE.',
      ],
      playerChoices: [
        'Agree to treat the Inquisitor.',
        'Refuse and suggest he sees a licensed physician.',
      ],
      decisionPoint: true,
      inputType: 'text',
      maxExchanges: 2,
    },
    {
  type: 'decision',
  image: 'quest2c',
  text: 'The Inquisitor has requested that you treat his "French pox," aka syphilis, a venereal disease. Needless to say, this would be a shameful revelation if it were made public. The stakes are high, as the Inquisitor is an extremely powerful man in the society of New Spain, and he has everything to lose if you were to reveal his secret. Then again... you have much to lose as well. What will you do?',
  buttons: [ 
    { text: 'Submit an excuse', action: 'submit_excuse' },
    { text: 'Provide Treatment', action: 'provide_treatment2' },
    { text: 'Poison Him', action: 'provide_poison2' }
  ],
},


  ],
},

  {
    id: 3,
    name: 'The Nahuatl Codex',
    completed: false, 
    npc: 'Tlacaelel',
    classification: 'Investigate',
     trigger: (gameState) =>
      gameState.location === 'Marketplace',
    stages: [
      {
        type: 'banner',
        image: 'quest3a',
        text: 'A Nahuatl man approaches you with an ancient codex in hand, seeking your help to interpret its contents.',
        buttons: [
          { text: 'Yes, I\'ll help', action: 'proceed' },
          { text: 'No, I\'m not interested', action: 'end' },
          { text: 'Tell me more', action: 'proceed' }
        ],
      },
      {
        type: 'dialogue',
        image: 'quest3b',
        text: `Tlacaelel: "This codex was passed down from my ancestors. It contains images of plants that were once used by our people for healing. If you can help me identify these plants, I will reward you with an herbal remedy known only to my people."

        `,
        npcResponses: [
          'This codex is sacred. Its knowledge has been kept secret for centuries.',
          'The images are faded, but I believe they depict plants that grow in the mountains near Tenochtitlan.',
          'The Spaniards have tried to destroy our heritage, but this codex survived. Help me preserve what little remains.',
        ],
        playerChoices: [
          'Examine the first image carefully.',
          'Ask Tlacaelel about the origins of the codex.',
          'Attempt to identify the plants based on your knowledge.',
        ],
        decisionPoint: true,
        inputType: 'text',
        maxExchanges: 5,
        thumbnails: true,
      },
      {
        type: 'decision',
        image: 'quest3c',
        text: 'Have you identified the plants correctly?',
        options: [
          { text: 'Yes', action: 'success' },
          { text: 'No', action: 'end' }
        ],
      },
      {
        type: 'outcome',
        image: imageMap.quest3d,
        text: 'Your knowledge of herbal remedies impresses Tlacaelel, and he shares a powerful Aztec remedy with you.',
        outcome: 'success',
        reward: 'aztec_remedy',
      },
    ],
  },
  {
    id: 4,
    name: 'The Guild Lawsuit',
    completed: false, 
    npc: 'Licenciado Francisco Ramírez',
    classification: 'Antagonist',
    trigger: (turnNumber, actions) => actions.includes('#startQuest4') || turnNumber === 40,
    stages: [
      {
        type: 'banner',
        image: 'quest4a',
        text: 'A stern-looking lawyer arrives with a summons. The Physicians\' Guild is suing you for practicing medicine without a license.',
        buttons: [
          { text: 'Yes, I\'ll go', action: 'proceed' },
          { text: 'No, I\'m not interested', action: 'end' },
          { text: 'Tell me more', action: 'proceed' }
        ],
      },
      {
        type: 'dialogue',
        image: 'quest4b',
        text: `Licenciado José de Aguillar: "You have been accused of practicing medicine unlawfully, señora. The Guild does not take kindly to those who infringe upon their domain. You will need to defend yourself in court."
        `,
        npcResponses: [
          'The evidence against you is overwhelming. You should consider settling before things get worse.',
          'The Guild has powerful allies. Fighting them could ruin you.',
        ],
        playerChoices: [
          'Argue that you are providing a necessary service to the community.',
          'Attempt to negotiate a settlement.',
          'Refuse to negotiate and prepare for court.',
        ],
        decisionPoint: true,
        inputType: 'text',
        maxExchanges: 2,
      },
      {
        type: 'decision',
        image: 'quest4c',
        text: 'Do you negotiate or prepare for court?',
        options: [
          { text: 'Negotiate', action: 'success' },
          { text: 'Prepare for court', action: 'end' }
        ],
      },
      // add a special section here in which Arturo Hernandez, a faux patient who had visited Maria's shop under a false name to test if she was prescribing drugs without a physician's license, is revealed to be the powerful licenciado Arturo Ramirez. He delivers a summary of Maria's misdeeds which pulls dynamically from 
      {
        type: 'outcome',
        image: 'quest4d',
        text: 'You negotiate a settlement, paying a fine but avoiding further legal action. The Guild agrees to leave you alone, for now.',
        outcome: 'success',
        reward: 'avoid_arrest',
      },
    ],
  },

  {
  id: 5,
  name: 'The Arrival of Don Luis',
  npc: 'Don Luis the Moneylender',
  classification: 'Main',
trigger: (turnNumber, actions, currentTime, currentDate) => {
  console.log("Checking Quest 1 trigger:", { turnNumber, actions, currentTime, currentDate });
  if (!quests[0].completed && currentDate === 'August 23, 1680') {
    const [time, meridiem] = currentTime.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    
    console.log("Time check:", { hour, meridiem });
    if (meridiem === 'PM' && hour >= 5 && hour <= 11) {
      console.log("Quest 1 trigger conditions met!");
      return true;
    }
  }
  return false;
},
  stages: [
    {
      type: 'banner',
      image: 'quest5a', // Placeholder image of Don Luis arriving at Maria's door at dusk
      text: 
      `A sharp knock echoes from the door just as the sun begins to dip below the horizon. The familiar silhouette of Don Luis stands in the fading light. He walks in without waiting for an invitation, his cane tapping the floor ominously. "Maria, we need to talk," he says. " I've been patient... too patient."
      `,
      buttons: [
        { text: 'Hear him out.', action: 'proceed' }
      ],
    },
    {
      type: 'dialogue',
      image: 'quest5b', // Placeholder image of Don Luis
      text: `Don Luis’s eyes narrow as he steps further into your shop, glancing briefly at the shelves, then turning back to you as he casually knocks two of your medicine jars to the floor. He seems to be deciding what his next course of action should be. Will you offer to pay him, ask for more time, or perhaps try subterfuge?`,
      npcResponses: [
        "Don Luis: *It's no longer 100 reales you owe, Maria. It's 110 now. The interest accumulates.*",
        "Don Luis: *What's more...* he pauses, watching you closely, *I may have mentioned your background to an old friend of mine.*",
        "Don Luis: *An assistant inquisitor.*",
      ],
      playerChoices: [
        'Stiffen and ask him what he wants.',
        'Keep calm and ask him how you can make it right.'
      ],
      decisionPoint: false, // This is not the decision point yet, just dialogue
      maxExchanges: 2, // This stage will last for two turns
    },
    {
      type: 'dialogue',
      image: 'quest5c', // Placeholder image of Don Luis, leaning in closer
      text: `Don Luis leans in. "Well? You have 110 reales, or not?`,
      npcResponses: [
        "Don Luis: *So tell me, Maria, what are you going to do to repay this debt?*"        
      ],
      playerChoices: [
        'Humbly tell him you will find a way to pay soon.',
        'Say nothing and secretly plan an alternative approach to remove Don Luis as a problem.'
      ],
      decisionPoint: true,  // Decision point for the player
      maxExchanges: 1,  // Only lasts for one exchange before the decision
    },
    {
      type: 'decision',
      image: 'quest5d', // Placeholder image of Maria deep in thought
      text: `*Don Luis watches your face intently, waiting for your response. You can see from the jaundiced tone of his skin that he is a sick man. You have heard that it is a liver complaint, and is serious. Whatever you choose now could determine your future.*`,
      buttons: [
        { text: 'Ask for more time.', action: 'endQuestWithDebt' },
        { text: 'Pay him everything you have.', action: 'endQuestWithDebt' },
        { text: 'Offer a miraculous cure in exchange for relief from debt.', action: 'provide_treatment5' },
        { text: 'Pretend to offer a cure... but secretly poison him.', action: 'provide_poison5' }
      ],
    },
  ],
  endQuestWithDebt: (currentWealth, setWealth) => {
    setWealth(0);  // Remove all wealth
    return "Maria has lost all her wealth. She now has 0 silver coins.";
  },
},

  {
    id: 6,
    name: 'The Dream of the Waves',
    npc: 'The Waves',
    classification: 'Dream',
    trigger: (turnNumber, actions) => actions.includes('go to sleep'),
    stages: [
      {
        type: 'banner',
        image: 'quest0a', // Use the waves image from Quest 0
        text: `_The waves pull you in. Cold and dark, but with a voice. A voice from the depths._  
               **The Waves**: "We are fathomless."`,
        buttons: [
          { text: 'Listen to the waves.', action: 'proceed' },
        ],
      },
      {
        type: 'dialogue',
        image: 'quest0d', // Reuse the waves image for the dialogue stage
        text: `The waves speak...`,
        npcResponses: [
          '[NOTE: MOST RESPONSES SHOULD BE ONLY ONE WORD, A PHRASE AT MOST] Yes, you are dying.',
          'The sparrow says *quiet interlude, quiet interlude.*',
          'And ye shall find it in the furthest depths of the King of Spain his dominions...',
          'Words, words, words.',
          'Death is a beggining.',
          'Those are pearls that were his eyes...',
        ],
        playerChoices: [
          '...',
        ],
        decisionPoint: true,
        inputType: 'text',
        maxExchanges: 3, // Lasts for 3 exchanges
      },
      {
        type: 'outcome',
        image: 'quest0b',
        text: `Maria has died. The game is over.`,
         buttons: [
          { text: '...', action: 'end' },
        ],
      },
    ], 
  },
  ];



// LLM system prompt to assess player creativity, accuracy, and other criteria at quest end
const detailedQuestAssessment = async (quest, dialogueHistory) => {
  const prompt = `
    You are a historical role-playing assessment agent for a game set in 1680 Mexico City.
    Maria de Lima has completed a quest where she interacted with various characters and situations.
    Please provide an evaluation across the following criteria:
    1. **Historical Accuracy**: Did her responses align with 17th-century Mexico City norms and tone?
    2. **Creativity**: Did she show creative solutions to the problems?
    3. **Deployment of Historical Knowledge**: Did she demonstrate knowledge of apothecary practices, or other relevant historical details?

    Based on these criteria, award one of the following badges:
    - Badge of Creativity: For creative responses.
    - Badge of Historical Accuracy: For staying true to the time period.
    - Badge of Apothecary Expertise: For demonstrating strong knowledge of apothecary work.
    - Badge of Curiosity: For asking thoughtful or probing questions.

    After awarding the badges, generate a personalized message for the player and include a fitting emoji.
    Here's the interaction history for the quest: 
    ${dialogueHistory}

    Please include an emoji for each badge awarded.
  `;

  const messages = [
    { role: 'system', content: 'You are a historical role-playing game assessment agent.' },
    { role: 'user', content: prompt },
  ];

  const data = await createChatCompletion(messages, 0.3);
  return data.choices[0].message.content.trim();
};



// LLM system prompt for basic player response quality check
const checkPlayerResponseQuality = async (userInput, quest, npc, stage) => {
  const prompt = `
    You are an LLM engine for a historical role-playing game set in 1680 Mexico City.
    The player, Maria de Lima, is interacting with ${npc}, a character in the game.
    The player's last input was: "${userInput}".
    Please judge the quality of this response based on the following criteria:
    1. Historical accuracy and appropriateness.
    2. Whether the tone and content align with a 17th-century apothecary in Mexico City.

    If the response is historically inaccurate or low-quality (i.e., anachronistic), return 'fail'.
    Otherwise, return 'pass'.
  `;

  const messages = [
    { role: 'system', content: 'You are a role-playing game judge for historical accuracy.' },
    { role: 'user', content: prompt },
  ];

  const data = await createChatCompletion(messages, 0.1);
  return data.choices[0].message.content.trim();
};


// Helper function to handle LLM dialogue generation
const questAgent = async (quest, stage, userInput) => {
  const prompt = `
    You are ${quest.npc}, a character in a historical simulation set in 1680 Mexico City. This is an educational game which emphasizes fidelity to the gritty, strange, and surprising realities of history. In all you do, remember to avoid historical innacuracies and anachronisms.
    The player, a Portuguese-born female apothecary resident in Mexico City named Maria de Lima, is interacting with you in a quest. 
    Respond to her based on the following dialogue history and player input:
    Dialogue History: ${stage.text}
    Player Input: "${userInput}"
    NPC Dialogue: ${stage.npcResponses.join('\n')}
    Using this material (inclduing the directions to you in brackets in NPCresponses which should not be reproduced for the end user) please generate a historically accurate response of no more than 2 sentences. Avoid cliches and genre conventions. Example of WHAT TO AVOID: "I ask you, do the whispers of the ancients not have a call upon your own curiosity? What might we unearth together... if we dare?" That sounds like corny, cliched dialogue from a bad fantasy novel. EXAMPLE OF WHAT TO DO: "Señora, I have spoken enough. Let us begin now -- unless you have some reason to object?" 
    Your dialogue should sound like something a real person might've said. Remember that this is a conversation, not a monologue. At times the NPC might take offense, or get angry, or make an odd observation, or do some other surprising thing. They might even answer with a single sentence, like "I have no idea what you mean by that" if the user has inputted something perplexing or unimpressive. NPCs make specific hsitorical references relevent to their background and time period.
    Any questions should never be didactic or expected. NO EXCLAMATION POINTS! VARIED DIALOGUE, UNUSUAL OBSERVATIONS AND DETAILS. KEEP IT VERY SIMPLE AND SHORT - instead of "Ah, the game of life is a treacherous one, is it not?" perhaps just "Life is crazy, isn't it?" If you are asked to pretend to be "waves," respond only in odd single words or phrases.
    Quest id 6, the Dream of the Waves, is triggered when Maria dies in the game. It is a near-death experience. The waves should answer in ONLY single words or very short phrases. Think T.S. Eliot.
  `;

  const messages = [
    { role: 'system', content: 'You are a historical role-playing engine for a 17th-century Mexico City simulation. Your job is to create dialogue and events in a quest popup in this educational game which centers on a converso apothecary named Maria de Lima.' },
    { role: 'user', content: prompt },
  ];

  const data = await createChatCompletion(messages, 0.9);
  return data.choices[0].message.content.trim();
};

// Main Quest component
const Quest = ({
  currentTurn,
  userActions,
  location,
  startQuest,
  activeQuest,
  setActiveQuest,
  triggerNotificationPopup,
  markQuestAsStarted,
    conversationHistory = [],
  setConversationHistory = () => {},
  setHistoryOutput,
  setTurnNumber,
  currentWealth,
  toggleInventory,
  isPrescribePopupOpen,
  currentPrescriptionType,
  openPrescribePopup,
  setCurrentPatient,
  addJournalEntry,
  setIsEmoji,
  setNpcCaption,
  setNpcInfo,
  setNpcImage,
  unlockMethod,
  summaryData

}) => {
  const { gameState, advanceQuestStage, completeQuest, updateInventory, addCompoundToInventory
} = useGameState();
const [currentStage, setCurrentStage] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showQuestPopup, setShowQuestPopup] = useState(false);
  const [questOutput, setQuestOutput] = useState('');
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [animatedText, setAnimatedText] = useState([]);
  const [hoverButton, setHoverButton] = useState(null);
  const [simulatedOutput, setSimulatedOutput] = useState('');
  const [prescriptionPrompt, setPrescriptionPrompt] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [amount, setAmount] = useState(1);
  const [price, setPrice] = useState(0);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [currentOutcome, setCurrentOutcome] = useState(null);
  const [npcPortrait, setNpcPortrait] = useState('default.jpg')

// Helper function to handle Santiago Valdez as the patient
  useEffect(() => {
    if (activeQuest?.id === 2) {  // Quest 2 is active
      const santiagoValdez = { name: 'Santiago Valdez', type: 'npc' }; 
      setCurrentPatient(santiagoValdez); // Set Santiago Valdez as the current patient
    }
  }, [activeQuest]);

    useEffect(() => {
    if (activeQuest && activeQuest.id === 0 && activeQuest.stages[currentStage].type === 'banner') {
      const lines = activeQuest.stages[currentStage].text;
      let currentLineIndex = 0;
      const intervalId = setInterval(() => {
        if (currentLineIndex < lines.length) {
          setAnimatedText(prev => [...prev, lines[currentLineIndex]]);
          currentLineIndex++;
        } else {
          clearInterval(intervalId);
        }
      }, 3200);

      return () => clearInterval(intervalId);
    }
  }, [activeQuest, currentStage]);


  // Function to handle prescription outcomes
  const handlePrescriptionOutcome = (outcome) => {
    if (outcome === 'game_over') {
      // Maria dies, trigger Quest 6
      triggerNotificationPopup({
        image: imageMap.quest2i, // Ensure this image exists in imageMap
        text: '**Maria has been killed by the Inquisitor\'s men to preserve his secret.**',
        type: 'gameOver',
      });
      // Start Quest 6: The Dream of the Waves
      const quest6 = quests.find(q => q.id === 6);
      if (quest6) {
        startQuest(quest6);
        setActiveQuest(quest6);
        if (markQuestAsStarted) {
          markQuestAsStarted(quest6.id);
        }
      }
    } else if (outcome === 'success') {
      // Successfully poisoned Inquisitor
      triggerNotificationPopup({
        image: imageMap.quest2k, // Ensure this image exists in imageMap
        text: '**You have successfully poisoned the Inquisitor. He succumbs to the poison, and you slip away unscathed, maintaining your safety.**',
        type: 'questSuccess',
      });
      markQuestAsCompleted();
    } else if (outcome === 'end') {
      markQuestAsCompleted();
    }
  };

  //  function that handles the outcome after PrescribePopup
  const handleSummaryContinue = async () => {
  setIsSummaryOpen(false); // Close the summary popup
  setHistoryOutput(simulatedOutput); // Display the simulated output in the main history box

  // Portrait handling now done automatically via npcTracker + ContextPanel
  // Removed wasteful generateImageAndCaption LLM call

  // Continue the regular logic for turn processing
  setTurnNumber(prev => prev + 1);
  toggleInventory(false);  // Close the inventory
  setSelectedItem(null);  // Reset the selected item
  setAmount(1);  // Reset the amount
  setPrice(0);  // Reset the price
};
  // Function to mark the quest as completed
  const markQuestAsCompleted = () => {
    if (activeQuest && activeQuest.id === 0) {
      // Trigger the inventory destruction popup for Quest 0 upon completion
      triggerNotificationPopup({
        image: imageMap['quest0f'],
        text: '**Disaster!** Most of your inventory of "simples" — the raw ingredients to make medicinal drugs — has been destroyed. You have only ten items left. Click the **Inventory** button to check them, and the **Mix Drugs** button to experiment with recipes. Looks like you will need to be creative about your drug mixing to make enough money to pay back **Don Luis**.',
        type: 'questCompletion',
      });
    }

       // Unlock sublimation when Quest 1 is completed
    if (activeQuest.id === 1) {
      unlockMethod('Sublimate');
    }
    
    // Check for Quest 2 completion to update NPC portrait
    if (activeQuest && activeQuest.id === 2) {
      setNpcPortrait('quest2d.jpg'); // Set NPC portrait to quest2d.jpg when Quest 2 is completed
    }

    completeQuest(activeQuest.id); // Mark the quest as completed

    setShowQuestPopup(false);
    setActiveQuest(null);
};


  // Function to handle closing the quest via the 'X' button
  const handleCloseQuest = () => {
    setShowQuestPopup(false);  // Close the quest popup
    setActiveQuest(null);      // Reset active quest to null
  };

  // Function to handle quest input
 const handleQuestInput = async (input, buttonAction) => {
  setIsLoading(true);
  const currentQuestStage = activeQuest.stages[currentStage];

  // Reset dialogue history at the start of a new dialogue
  if (currentQuestStage.type === 'dialogue' && dialogueHistory.length === 0) {
    setDialogueHistory([]);
  }

  // Handle banners and decisions
  if (currentQuestStage.type === 'banner' || currentQuestStage.type === 'decision') {
    if (typeof buttonAction === 'object' && buttonAction.type === 'goToStage') {
      goToSpecificStage(buttonAction.stage);
    } else {
      switch (buttonAction) {
        case 'end':
        case 'fail':
        case 'complete':
          markQuestAsCompleted();
          break;
        case 'proceed':
          advanceToNextStage();
          break;
        case 'success':
          handleSuccess();
          break;
        case 'submit_excuse':
          setCurrentStage(activeQuest.stages.findIndex(s => s.type === 'dialogue' && s.text.includes('submit an excuse')));
          break;
        case 'provide_treatment2':
          openPrescribePopup('treatment', { name: 'Inquisitor Santiago Valdez', type: 'npc' });
          markQuestAsCompleted();
          break;
        case 'provide_poison2':
          openPrescribePopup('poison', { name: 'Inquisitor Santiago Valdez', type: 'npc' });
          markQuestAsCompleted();
          break;
         case 'provide_treatment5':
          openPrescribePopup('treatment', { name: 'Don Luis', type: 'npc' });
          markQuestAsCompleted();
          break;
        case 'provide_poison5':
          openPrescribePopup('poison', { name: 'Don Luis', type: 'npc' });
          markQuestAsCompleted();
        default:
          console.error('Unknown action type:', buttonAction);
      }
    }
  }

  // Handle dialogue stages
  else if (currentQuestStage.type === 'dialogue') {
    try {
      const questResponse = await questAgent(activeQuest, currentQuestStage, input);
      
      setDialogueHistory((prev) => {
        const updatedHistory = [...prev, { userInput: input, npcResponse: questResponse }];
        
        if (updatedHistory.length >= currentQuestStage.maxExchanges) {
          setTimeout(() => advanceToNextStage(), 0);
        }

        return updatedHistory;
      });
    } catch (error) {
      console.error("Error fetching LLM response:", error);
    }
  }

  // Handle outcome stages
  else if (currentQuestStage.type === 'outcome') {
    if (typeof currentQuestStage.text === 'function') {
      const outcomeText = currentQuestStage.text(buttonAction);
      setDialogueHistory((prev) => [...prev, { npcResponse: outcomeText }]);
    }
    setTimeout(() => advanceToNextStage(), 0);
  }

  setIsLoading(false);
  setUserInput('');
};

const handleSuccess = () => {
  if (activeQuest.id === 1) {
    // Unlock the "Sublimate" method
    if (typeof unlockMethod === 'function') {
      unlockMethod('Sublimate');
    } else {
      console.warn('unlockMethod is not a function. Skipping method unlock.');
    }
    
    // Add a journal entry about learning sublimation
    if (typeof addJournalEntry === 'function') {
      addJournalEntry('Maria has learned the art of sublimation from Antonius Philalethes.');
    } else {
      console.warn('addJournalEntry is not a function. Skipping journal entry.');
    }

    // Trigger the notification popup for unlocking sublimation
    triggerNotificationPopup({
      image: imageMap['sublimateIcon'], // Replace with the actual image key for sublimation
      text: '**New Method Unlocked: Sublimate!** Maria has learned the art of sublimation from Antonius Philalethes. Click the **Mix Drugs** button to try it.',
      type: 'methodUnlock', // Customize the type if needed
    });
  }

  // Proceed to the next stage of the quest
  advanceToNextStage();
};

  // Implement 'checkExcuse' function
  const checkExcuse = async (excuse) => {
    const prompt = `
      You are an assistant evaluating excuses for declining medical assistance from Maria to an Inquisitor who desires secret treatment for his debilitating syphilis. He is a dangerous and crafty man. Determine if the following excuse is sufficiently convincing to prevent suspicion of the Inquisitor's condition.
      Excuse: "${excuse}"
      Return "pass" if convincing, otherwise "fail".
    `;

    try {
      const messages = [
        { role: 'system', content: 'You are a quality checker for excuses in a historical simulation educational game set in Mexico City in 1680, where the player is a female apothecary named Maria de Lima.' },
        { role: 'user', content: prompt },
      ];

      const data = await createChatCompletion(messages);
      const result = data.choices[0].message.content.trim().toLowerCase();
      return result === 'pass';
    } catch (error) {
      console.error("Error validating excuse:", error);
      return false; // Default to fail on error
    }
  };


  const advanceToNextStage = () => {
    const nextStageIndex = currentStage + 1;
    if (nextStageIndex < activeQuest.stages.length) {
      setCurrentStage(nextStageIndex);
      advanceQuestStage(activeQuest.id);
      setDialogueHistory([]);
    } else {
      markQuestAsCompleted();
    }
  };

  const goToSpecificStage = (stageType) => {
    const stageIndex = activeQuest.stages.findIndex(s => s.type === stageType);
    if (stageIndex !== -1) {
      setCurrentStage(stageIndex);
      advanceQuestStage(activeQuest.id);
      setDialogueHistory([]);  // Clear dialogue history when changing stages
    } else {
      console.error(`Stage type "${stageType}" not found in quest`);
    }
  };

   // Helper function to get the correct image URL
  const getImageUrl = (imageName) => {
    return imageMap[imageName] || imageMap.default;
  };

  useEffect(() => {
    if (activeQuest) {
      setShowQuestPopup(true);
      setCurrentStage(0);
      setDialogueHistory([]);
      setAnimatedText([]); // Reset animated text when a new quest starts

    }
  }, [activeQuest]);

  if (!showQuestPopup || !activeQuest) return null;

  const stage = activeQuest.stages[currentStage];


  return (
    <>
      <div className="dark-overlay"></div>
      <div className="quest-popup">
        <div className="quest-header">
          <h2>{activeQuest.name}</h2>
          {stage.type === 'banner' && activeQuest.id === 0 ? (
            <div 
              className="panning-banner-image"
              style={{ backgroundImage: `url(${getImageUrl(stage.image)})` }}
            />
          ) : (
            <img 
              src={getImageUrl(stage.image)} 
              alt={`${activeQuest.name} - ${stage.type}`}
              className={stage.type === 'banner' ? 'banner-image' : 'dialogue-image'}
            />
          )}
          <button className="quest-close-button" onClick={handleCloseQuest}>X</button>
        </div>
        
        <div className="quest-content">
        {activeQuest.id === 0 && stage.type === 'banner' ? (
          <div className="initial-text">
            {animatedText.map((line, index) => (
              <ReactMarkdown key={index} remarkPlugins={[remarkGfm]} className="animated-line">{line}</ReactMarkdown>
            ))}
          </div>

         ) : stage.type === 'outcome' ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {typeof stage.text === 'function' 
              ? stage.text(currentOutcome) 
              : stage.text}
          </ReactMarkdown>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {typeof stage.text === 'function'
              ? stage.text()
              : stage.text}
          </ReactMarkdown>
        )}

          {stage.type === 'dialogue' && (
            <div className="quest-output">
              {dialogueHistory.map((dialogue, idx) => (
                <div key={idx} className="dialogue-entry">
                  <div className="quest-user-input">
                    <ReactMarkdown>{dialogue.userInput}</ReactMarkdown>
                  </div>
                  <div className="npc-response">
                    <ReactMarkdown>{dialogue.npcResponse}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="loading-indicator">
              <span>Loading</span><span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </div>
          )}

          {(stage.type === 'banner' || stage.type === 'decision') && stage.buttons && (
            <div className="button-group">
              {stage.buttons.map((btn, idx) => (
                <div key={idx} className="button-container">
                  <button
                    onClick={() => handleQuestInput(btn.text, btn.action)}
                    className={`quest-button ${btn.image ? 'image-button' : ''}`}
                    onMouseEnter={() => setHoverButton(idx)}
                    onMouseLeave={() => setHoverButton(null)}
                    style={btn.image ? {
                      backgroundImage: `url(${hoverButton === idx && btn.activeImage ? btn.activeImage : btn.image})`,
                      width: '200px',
                      height: '200px',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    } : {}}
                  >
                    {btn.image ? '' : btn.text}
                  </button>
                  {(btn.text === 'Calcination' || btn.text === 'Distillation' || btn.text === 'Confection' || btn.text === 'Decoction') && (
                    <span className="button-caption">
                      {btn.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {stage.type === 'dialogue' && (
            <div className="dialogue-input">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleQuestInput(userInput);
                  }
                }}
                placeholder="Type your response..."
              />
              <button onClick={() => handleQuestInput(userInput)}>
                Send
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export { quests };
export default Quest;


