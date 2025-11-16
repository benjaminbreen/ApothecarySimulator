/**
 * narrativeParser.js
 * Utility for extracting contextual action choices from narrative text
 * Detects patterns like "Will you X, or Y?" and generates dynamic action chips
 */

import {
  FaEye,
  FaBook,
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
  FaGift,
  FaMoneyBillWave,
  FaMortarPestle,
  FaListUl,
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
 * Detect medical context in narrative that suggests prescribing
 * @param {string} text - Narrative text to analyze
 * @returns {boolean} True if medical context detected
 */
function detectMedicalContext(text) {
  if (!text) return false;

  const medicalKeywords = [
    // Symptoms
    'fever', 'cough', 'pain', 'ache', 'illness', 'sick', 'ailment', 'affliction',
    'wound', 'injury', 'burn', 'rash', 'swelling', 'bleeding', 'headache',
    'stomach', 'nausea', 'vomit', 'dizzy', 'weak', 'fatigue', 'tired',
    'chill', 'shiver', 'sweating', 'breathe', 'breathing',

    // Medical terms
    'symptom', 'diagnose', 'diagnosis', 'treat', 'treatment', 'cure', 'remedy',
    'medicine', 'prescription', 'physician', 'apothecary', 'healer',
    'patient', 'suffer', 'afflict', 'malady',

    // Body parts (when mentioned with complaints)
    'chest pain', 'sore throat', 'broken', 'sprain', 'fracture',
    'infection', 'inflam', 'pus', 'boil', 'lesion',

    // Common requests
    'need help', 'need medicine', 'can you help', 'please help',
    'what can you give', 'do you have something for'
  ];

  const lowerText = text.toLowerCase();

  // Check for medical keywords
  for (const keyword of medicalKeywords) {
    if (lowerText.includes(keyword)) {
      return true;
    }
  }

  // Check for question patterns about health
  const medicalQuestions = [
    /what (?:can|should) (?:i|you) (?:do|take|give) for/i,
    /(?:i have|suffering from|afflicted with|troubled by)/i,
    /my (?:wife|husband|child|son|daughter|mother|father).{0,30}(?:ill|sick|fever|pain)/i,
    /need.{0,20}(?:medicine|remedy|treatment|cure|help)/i
  ];

  for (const pattern of medicalQuestions) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
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

        // AUTO-SUGGEST PRESCRIBE: Add prescribe chip if medical context detected
        if (detectMedicalContext(narrativeText)) {
          // Check if prescribe action isn't already in the choices
          const hasPrescribe = actions.some(a =>
            a.action.includes('prescribe') || a.action.includes('medicine') || a.action.includes('treat')
          );

          if (!hasPrescribe && actions.length < 3) {
            actions.push({
              label: 'Prescribe',
              icon: FaMortarPestle,
              action: '#prescribe',
              tooltip: 'Offer a prescription'
            });
            console.log('[narrativeParser] Added auto-suggest Prescribe chip (medical context detected)');
          }
        }

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
      action: 'Provide a vivid, sensory scene-setting description of Maria’s immediate surroundings. Include sights, sounds, smells, textures, lighting, notable objects, and the emotional tenor of the room. END WITH THIS EXACT FORMAT:\n\n**Others present:**\n- Name — short note about posture/intention\n- Name — short note about posture/intention\n\nAlways output the bold heading; if no one else is here, write “- none observed”.',
      tooltip: 'Request a rich sensory scene description that ends with a bold “Others present” list',
      displayAction: '*Maria looks around her and observes the surroundings carefully...*',
    },
    {
      label: 'List',
      icon: FaListUl,
      action: 'ask about ',
      tooltip: 'View available options and actions',
    },
    {
      label: 'Go somewhere',
      icon: FaWalking,
      action: 'go to ',
      tooltip: 'Travel to a different location in the city',
    },
    {
      label: 'Prescribe',
      icon: FaMortarPestle,
      action: '#prescribe',
      tooltip: 'Open the prescribing panel',
    },
    {
      label: 'Wait',
      icon: FaClock,
      action: 'wait and observe',
      tooltip: 'Pass time and observe your surroundings',
    },
  ];
}

/**
 * Parse list response marker from narrative text
 * List responses start with [LIST_RESPONSE:type] marker
 * @param {string} text - Narrative text
 * @returns {object} Parse result with isListResponse flag, validation errors
 */
export function parseListResponse(text) {
  if (!text || typeof text !== 'string') {
    return { isListResponse: false };
  }

  const markerPattern = /^\[LIST_RESPONSE:(\w+)\]/;
  const match = text.match(markerPattern);

  if (match) {
    const content = text.replace(markerPattern, '').trim();

    // Validate response format
    const validation = validateListResponse(content);

    return {
      isListResponse: true,
      listType: match[1],
      content: content,
      isValid: validation.isValid,
      error: validation.error
    };
  }

  return { isListResponse: false };
}

/**
 * Validate list response content
 * Checks if content is a valid markdown table or empty state message
 * @param {string} content - List response content (without marker)
 * @returns {object} Validation result
 */
function validateListResponse(content) {
  if (!content) {
    return {
      isValid: false,
      error: 'Empty response received'
    };
  }

  // Check for valid empty state messages
  const validEmptyMessages = [
    'No other people are currently visible.',
    'Unable to perceive sensory details.',
    'No notable objects visible.',
    'No ingredients available here.'
  ];

  if (validEmptyMessages.some(msg => content.includes(msg))) {
    return { isValid: true, error: null };
  }

  // Check for markdown table format (must have header row with |)
  const hasTableHeader = /\|.*\|/.test(content);
  const hasTableSeparator = /\|[-:\s]+\|/.test(content);

  if (!hasTableHeader) {
    return {
      isValid: false,
      error: 'Invalid table format: missing header row'
    };
  }

  if (!hasTableSeparator) {
    return {
      isValid: false,
      error: 'Invalid table format: missing separator row'
    };
  }

  // Check for minimum content (at least 3 lines: header, separator, and one row OR empty message)
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    return {
      isValid: false,
      error: 'Invalid table format: insufficient rows'
    };
  }

  return { isValid: true, error: null };
}

export default {
  parseNarrativeChoices,
  getDefaultChips,
  parseListResponse,
};
