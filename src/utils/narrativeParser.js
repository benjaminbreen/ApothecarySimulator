/**
 * narrativeParser.js
 * Utility for extracting contextual action choices from narrative text
 * Detects patterns like "Will you X, or Y?" and generates dynamic action chips
 */

import {
  FaEye,
  FaComments,
  FaWalking,
  FaClock,
  FaBan,
  FaHandPaper,
  FaRunning,
  FaHandshake,
  FaDoorOpen,
  FaSearchPlus,
  FaUserShield,
  FaHeart,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaQuestion,
  FaBook,
  FaGift,
  FaMoneyBillWave,
} from 'react-icons/fa';

/**
 * Patterns for detecting choice questions in narrative text
 * Supports 1-3 choices in various formats
 */
const CHOICE_PATTERNS = [
  // Two choices with "or"
  /[Ww]ill you (.+?),?\s+or (.+?)\?/,
  /[Dd]o you (.+?),?\s+or (.+?)\?/,
  /[Ww]ould you (.+?),?\s+or (.+?)\?/,
  /[Ss]hould you (.+?),?\s+or (.+?)\?/,

  // Three choices with commas and "or"
  /[Ww]ill you (.+?),\s*(.+?),\s*or (.+?)\?/,
  /[Dd]o you (.+?),\s*(.+?),\s*or (.+?)\?/,
  /[Ww]ould you (.+?),\s*(.+?),\s*or (.+?)\?/,

  // Single choice (yes/no implicit)
  /[Ww]ill you (.+?)\?/,
  /[Dd]o you (.+?)\?/,
  /[Ww]ould you (.+?)\?/,
];

/**
 * Map action verbs/keywords to react-icons components
 * Priority order: most specific matches first
 */
const VERB_TO_ICON = {
  // Vision/examination
  'see': FaEye,
  'look': FaEye,
  'examine': FaSearchPlus,
  'inspect': FaSearchPlus,
  'observe': FaEye,
  'watch': FaEye,
  'peer': FaEye,
  'gaze': FaEye,
  'glance': FaEye,
  'check': FaSearchPlus,

  // Communication
  'speak': FaComments,
  'talk': FaComments,
  'ask': FaQuestion,
  'tell': FaComments,
  'say': FaComments,
  'converse': FaComments,
  'inquire': FaQuestion,
  'question': FaQuestion,
  'answer': FaComments,
  'reply': FaComments,
  'respond': FaComments,

  // Movement/departure
  'go': FaWalking,
  'leave': FaDoorOpen,
  'walk': FaWalking,
  'run': FaRunning,
  'flee': FaRunning,
  'depart': FaDoorOpen,
  'exit': FaDoorOpen,
  'enter': FaDoorOpen,
  'approach': FaWalking,
  'retreat': FaRunning,
  'follow': FaWalking,

  // Rejection/avoidance
  'ignore': FaBan,
  'refuse': FaTimes,
  'decline': FaTimes,
  'reject': FaTimes,
  'deny': FaTimes,
  'dismiss': FaHandPaper,
  'avoid': FaBan,
  'turn away': FaBan,

  // Time/waiting
  'wait': FaClock,
  'pause': FaHandPaper,
  'hesitate': FaClock,
  'delay': FaClock,
  'stay': FaHandPaper,
  'remain': FaHandPaper,

  // Interaction/engagement
  'accept': FaCheck,
  'agree': FaHandshake,
  'help': FaHeart,
  'assist': FaHeart,
  'aid': FaHeart,
  'support': FaHandshake,
  'join': FaHandshake,
  'greet': FaHandshake,

  // Caution/defense
  'defend': FaUserShield,
  'protect': FaUserShield,
  'guard': FaUserShield,
  'warn': FaExclamationTriangle,
  'caution': FaExclamationTriangle,
  'alert': FaExclamationTriangle,

  // Resources/items
  'give': FaGift,
  'offer': FaGift,
  'take': FaHandPaper,
  'grab': FaHandPaper,
  'pay': FaMoneyBillWave,
  'buy': FaMoneyBillWave,
  'sell': FaMoneyBillWave,
  'trade': FaMoneyBillWave,

  // Study/reading
  'read': FaBook,
  'study': FaBook,
  'consult': FaBook,
  'research': FaBook,
};

/**
 * Extract the first verb/keyword from an action phrase
 * @param {string} actionText - Raw action text (e.g., "see who is there")
 * @returns {string} First meaningful verb found
 */
function extractVerb(actionText) {
  const words = actionText.toLowerCase().trim().split(/\s+/);

  // Check for two-word phrases first (e.g., "turn away")
  for (let i = 0; i < words.length - 1; i++) {
    const twoWordPhrase = `${words[i]} ${words[i + 1]}`;
    if (VERB_TO_ICON[twoWordPhrase]) {
      return twoWordPhrase;
    }
  }

  // Then check single words
  for (const word of words) {
    if (VERB_TO_ICON[word]) {
      return word;
    }
  }

  // Default fallback
  return words[0] || 'examine';
}

/**
 * Get react-icon component for an action phrase
 * @param {string} actionText - Action phrase (e.g., "see who is there")
 * @returns {React.Component} React-icons component
 */
function getIconForAction(actionText) {
  const verb = extractVerb(actionText);
  return VERB_TO_ICON[verb] || FaQuestion;
}

/**
 * Clean up action text for display as chip label
 * @param {string} text - Raw action text
 * @returns {string} Cleaned, capitalized label
 */
function formatActionLabel(text) {
  // Remove trailing punctuation
  let cleaned = text.trim().replace(/[.,;:!?]+$/, '');

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Truncate if too long (max ~30 chars for chip)
  if (cleaned.length > 32) {
    cleaned = cleaned.substring(0, 29) + '...';
  }

  return cleaned;
}

/**
 * Parse narrative text for choice patterns and extract dynamic actions
 * @param {string} narrativeText - Full narrative text from LLM
 * @returns {Array|null} Array of action chip objects, or null if no pattern detected
 *
 * Returns format:
 * [
 *   { label: "See who is there", icon: FaEye, action: "see who is there" },
 *   { label: "Ignore them", icon: FaBan, action: "ignore them" }
 * ]
 */
export function parseNarrativeChoices(narrativeText) {
  if (!narrativeText || typeof narrativeText !== 'string') {
    return null;
  }

  // Search the full narrative text directly (choices typically appear at the end)
  // No need to split/rejoin since that loses punctuation

  // Try each pattern against the full text
  for (const pattern of CHOICE_PATTERNS) {
    const match = narrativeText.match(pattern);

    if (match) {
      const actions = [];

      // Extract captured groups (excluding the full match at index 0)
      for (let i = 1; i < match.length; i++) {
        if (match[i]) {
          const actionText = match[i].trim();

          actions.push({
            label: formatActionLabel(actionText),
            icon: getIconForAction(actionText),
            action: actionText.toLowerCase().trim(),
          });
        }
      }

      // Only return if we found 1-3 actions
      if (actions.length >= 1 && actions.length <= 3) {
        console.log('[narrativeParser] Successfully parsed choices:', actions.map(a => a.label));
        return actions;
      }
    }
  }

  return null;
}

/**
 * Get default fallback chips when no dynamic choices are detected
 * @returns {Array} Default action chips
 */
export function getDefaultChips() {
  return [
    {
      label: 'Examine',
      icon: FaSearchPlus,
      action: 'examine inventory',
      tooltip: 'Inspect your possessions and ingredients',
    },
    {
      label: 'Ask',
      icon: FaQuestion,
      action: 'ask about ',
      tooltip: 'Inquire about people, places, or things',
    },
    {
      label: 'Go somewhere',
      icon: FaWalking,
      action: 'go to ',
      tooltip: 'Travel to a different location in the city',
    },
    {
      label: 'Study',
      icon: FaBook,
      action: 'consult my books',
      tooltip: 'Consult medical texts and references',
    },
    {
      label: 'Wait',
      icon: FaClock,
      action: 'wait and observe',
      tooltip: 'Pass time and observe your surroundings',
    },
  ];
}

export default {
  parseNarrativeChoices,
  getDefaultChips,
};
