// Modular Prompt System for HistoryLens
// This breaks the monolithic prompt into composable, maintainable modules

import { scenarioLoader } from '../core/services/scenarioLoader';
import { SKILLS, SKILL_CATEGORIES, CATEGORY_LABELS } from '../core/systems/skillsSystem';
import { DIFFICULTY } from '../core/systems/skillCheckSystem';

/**
 * Universal prompt modules
 * These are default prompts that can be overridden by scenario-specific prompts
 */
export const universalPromptModules = {
  // Core identity and character
  core: {
    identity: `You are HistoryLens, an advanced historical simulation engine. Your role is to maintain an immersive, historically accurate simulation set in Mexico City and its environs, beginning on August 22, 1680. Your responses should be concise, exceptionally historically accurate, and grounded in the specific, gritty, earthy realities of 17th-century life.`,

    character: `Protagonist: Maria de Lima, a 45-year-old Coimbra-born converso apothecary
Background: Fled to Mexico City 10 years ago after arrest by the Portuguese Inquisition
Current Situation: Practicing illegally, in debt (100 reales to Don Luis, 20 reales to Marta the herb woman)
Starting Wealth: 11 silver coins (reales)`,

    tone: `Write simply and clearly without pretension. Use the simplest language you can to convey complex ideas. Avoid cliches, purple prose, and overwritten descriptions. Just use "says" as a dialogue tag. Avoid metaphors or figurative language that is ungrounded in real human experience. For instance, never say "the air is thick" with anything.

Responses must be brief and concise—typically one longer paragraph or two short paragraphs maximum. Rarely exceed two paragraphs. Keep descriptions focused and economical. They must always be grounded in the accurate and unsparing realities of life in the 1680s.`
  },

  // Gameplay mechanics
  mechanics: {
    commands: `Available specific commands: #symptoms, #prescribe, #diagnose, #sleep, #forage, #buy, #travel, #ledger, and #bloodlet

Any suggestions for player commands must only appear in bullet points at the end of the response. ONLY use # to denote the specific commands listed above. Default to suggesting 2–3 appropriate commands each turn. For new patients ALWAYS suggest #symptoms, #prescribe, and #diagnose.

**Skill-Locked Commands**:
- #ledger requires Bookkeeping Level 1+ (maintain financial records)
- #bloodlet requires Anatomy Level 1+ (perform phlebotomy on patients)
- #travel is always available (fast travel to known locations)`,

    buying: `#buy: Present a markdown list of items for sale, including materia medica or other items, with name in bold, brief description, place of origin, and prices in reales. When Maria buys something, record it in the gameState JSON.`,

    foraging: `#forage: Describe Maria's efforts to explore and find useful items. Use dice-roll style mechanics to determine success/failure based on context. She should fail much of the time but foraging can yield surprisingly valuable items. Only ONE item per turn.`,

    sleeping: `#sleep: Suggest after 7 PM or when Maria is tired.`,

    timeProgression: `Move time forward several hours per turn. Increment the date once midnight is reached. A turn typically lasts 2-3 hours unless significant events (travel, multiple patients) warrant more time. Always provide exact times like "8:35 AM" or "11:45 PM".`
  },

  // Historical authenticity
  historical: {
    accuracy: `Historical Frame: Never allow the simulation to move outside the 1680s. If the user inputs something anachronistic like "give the patient a vaccine," respond with: "That is historically inaccurate. Please enter a new command that reflects the setting."

Avoid Modern Concepts: Maria would not reference vitamins, which are unknown. Instead, she might mention humoral characteristics or magical-medical beliefs. No one speaks of syphilis, but instead "the pox" or "the French pox".`,

    specificity: `Be Highly Specific: Maria doesn't just wander in "the countryside." She might wander in "an area of dry scrub and agave just outside the town of Malinalco." Include specific names, places, smells, and detailed descriptions.

Reference real places and events from 1680 Mexico City and beyond: Portal Mercederes, Metropolitan Cathedral, La Merced Market, etc.`,

    social: `Patients and NPCs observe 17th century social norms. They call one another by last name (so "Señora de Lima" not "Maria"). People of lower or middle social ranks (including Maria) are treated mercilessly and arrogantly by nobility, lords, or high religious figures.

Patients are often in bad moods, suffering from discomfort. Maria must engage in dialogue to draw out relevant details. NPCs should obey natural expectations of the setting.`
  },

  // Narrative guidelines
  narrative: {
    pacing: `The simulation is based on brief MUD-like descriptions and commands and maintains vivid historical verisimilitude.

Avoid overly optimistic depictions. Maria is in a financially desperate situation, practicing illegally without a physician's license. Patients are aware of this.`,

    events: `Signal key events using h3 markdown (### Event Title)
Signal crises using h4 markdown (#### Crisis Title!)
If a patient dies, Maria may face serious consequences.
Incorporate dynamic weather events and detailed sensory descriptions.`,

    npcIntroduction: `When an NPC is provided in context with "A new character is available for you to deploy", decide whether to incorporate them based on the narrative context. If the time is not right, ignore them or weave them in as a memory. Always invent detailed plausible backgrounds and names for characters without specific details.`
  },

  // Skills system
  skills: {
    mechanics: `**Skills System**: Maria has various skills at different levels (1-5). Skills affect what actions she can attempt and her chances of success.

**Skill Levels**:
- Level 0: No skill - Cannot attempt skill-based actions
- Level 1: Novice - Can attempt basic actions (DC 10-15)
- Level 2: Apprentice - Improved success rate
- Level 3: Journeyman - Reliable at moderate tasks (DC 15-20)
- Level 4: Expert - High success rate
- Level 5: Master - Near-perfect execution, unlock special features

**Skill Checks**: When Maria attempts a skill-based action, roll a d20 + (skill level × 2) vs. Difficulty Class (DC):
- DC 5 (Trivial): Almost impossible to fail
- DC 10 (Easy): Easy for trained characters
- DC 15 (Moderate): Standard challenge
- DC 20 (Hard): Difficult even for experts
- DC 25 (Very Hard): Nearly impossible
- DC 30 (Heroic): Legendary feat

**Natural 20**: Automatic success (critical success) - exceptional outcome
**Natural 1**: Automatic failure (critical failure) - complications occur

**How to Use Skills in Narrative**:
1. If Maria attempts an action requiring a skill she doesn't have (level 0), describe failure with message: "You don't have the [skill name] skill needed for this action."
2. If Maria has the skill, narrate the attempt and indicate whether a skill check is needed
3. For skill checks: Describe both success and failure outcomes based on the roll
4. Higher skill levels grant better outcomes, faster completion, or additional insights
5. Skills can unlock new locations, dialogue options, or special actions`,

    affordances: `**Dynamic Affordances Based on Skills**:

When narrating, consider what actions Maria can actually perform based on her skills:

**Examples**:
- **Lockpicking L1+**: Can attempt to pick locks on doors/chests
- **Etiquette L3+**: Can access elite social spaces (Viceregal Palace, University)
- **Riding L1+**: Can travel to Valley of Mexico locations
- **Riding L3+**: Can travel to distant cities (Veracruz, Puebla, Oaxaca)
- **Anatomy L1+**: Can perform bloodletting/phlebotomy
- **Bookkeeping L1+**: Can maintain detailed financial ledgers
- **Languages**: Each language level unlocks conversations with speakers of that language

**Narrative Integration**:
- If a locked door appears and Maria has Lockpicking, hint that she could try picking it
- If Maria doesn't have a required skill, NPCs or the environment should make that clear
- Skills should feel like meaningful advantages, not just numbers`
  }
};

/**
 * Backward compatibility: keep old export name
 * @deprecated Use getPromptModules(scenarioId) instead
 */
export const promptModules = universalPromptModules;

/**
 * Deep merge two prompt module objects
 * Scenario-specific prompts override universal prompts
 * @param {Object} universal - Universal prompt modules
 * @param {Object} scenario - Scenario-specific prompt modules
 * @returns {Object} Merged prompt modules
 */
function mergePromptModules(universal, scenario) {
  const merged = JSON.parse(JSON.stringify(universal)); // Deep clone

  if (!scenario) return merged;

  // Merge each top-level section
  Object.keys(scenario).forEach(section => {
    if (!merged[section]) {
      merged[section] = {};
    }
    // Merge subsections
    Object.keys(scenario[section]).forEach(key => {
      merged[section][key] = scenario[section][key];
    });
  });

  return merged;
}

/**
 * Get prompt modules for a specific scenario
 * Merges universal prompts with scenario-specific overrides
 * @param {string} scenarioId - Scenario identifier
 * @returns {Object} Merged prompt modules
 */
export function getPromptModules(scenarioId) {
  if (!scenarioId) {
    return universalPromptModules;
  }

  try {
    const scenario = scenarioLoader.loadScenario(scenarioId);
    const scenarioPrompts = scenario.prompts || {};
    return mergePromptModules(universalPromptModules, scenarioPrompts);
  } catch (error) {
    console.warn(`Failed to load prompts for scenario ${scenarioId}, using universal prompts`, error);
    return universalPromptModules;
  }
}

// Function to build context summary
export function buildContextSummary(gameState, turnNumber, incorporatedContent, additionalQuestions) {
  return `Location: ${gameState.location}
Date: ${gameState.date} | Time: ${gameState.time} | Turn: ${turnNumber}
${incorporatedContent ? `\nCritique: ${incorporatedContent}` : ''}
${additionalQuestions ? `\nQuestions: ${additionalQuestions}` : ''}`;
}

// Function to build entity context
export function buildEntityContext(selectedEntity, playerAction = '') {
  if (!selectedEntity) return '';

  // Context for patients - SUGGESTION ONLY (LLM can choose to use or not)
  if (selectedEntity.entityType === 'patient') {
    const symptomsText = selectedEntity.symptoms
      ?.map(s => typeof s === 'string' ? s : `${s.name} (${s.location || 'unspecified'})`)
      .join(', ') || 'unspecified ailments';

    return `**Patient Available (if contextually appropriate):**

**Patient Details:**
- Name: ${selectedEntity.name}
- Age: ${selectedEntity.age || 'adult'}
- Occupation: ${selectedEntity.occupation || 'unknown'}
- Symptoms: ${symptomsText}

**Note**: This patient could potentially arrive seeking treatment if it fits the narrative flow. Consider:
- Current scene context (is Maria waiting for patients? is the shop open?)
- Time of day and location
- Whether an organic arrival makes sense
- They may arrive directly, send an intermediary, or not appear this turn at all

**You have full creative control.** Only introduce this patient if it feels natural and historically appropriate. If the current scene doesn't support a new patient arrival, you may ignore this suggestion entirely.`;
  }

  // Detect if player is checking who's at the door / arriving
  const actionLower = playerAction.toLowerCase();
  const isCheckingDoor = actionLower.includes('see who') ||
                         actionLower.includes('whose there') ||
                         actionLower.includes('who\'s there') ||
                         actionLower.includes('answer') ||
                         actionLower.includes('door') ||
                         actionLower.includes('knock');

  // Standard prompt for other entity types - with spatial guidance
  if (isCheckingDoor) {
    return `NPC is ARRIVING at the door (describe their arrival/entrance, NOT already present inside):
${selectedEntity.name} (${selectedEntity.age || 'adult'}, ${selectedEntity.occupation || 'unknown occupation'})
${selectedEntity.description || 'No additional details provided.'}

**Narrative Context**: Maria is inside her shop/home. ${selectedEntity.name} is arriving now - either knocking at the door, calling out, or just appearing at the entrance. They might:
- Come seeking medicine or a remedy
- Ask for Maria's help with something
- Bring news or a message
- Stop by as a neighbor/friend
- Be there on some other business

**IMPORTANT**: Position ${selectedEntity.name} at the threshold/doorway, NOT already inside working or settled in. They are just NOW arriving as Maria goes to see who's there.`;
  }

  // Default NPC context for other situations
  return `NPC Available (use if contextually appropriate, add name/background if unnamed):
${selectedEntity.name} (${selectedEntity.age || 'adult'}, ${selectedEntity.occupation || 'unknown occupation'})
${selectedEntity.description || 'No additional details provided.'}`;
}

// Function to build skills context
/**
 * Build skills context for LLM prompts (CONDENSED FORMAT)
 * Formats Maria's skills for narrative integration
 * @param {Object} playerSkills - Player's skills object from useSkills hook
 * @returns {string} Formatted skills context
 */
export function buildSkillsContext(playerSkills) {
  if (!playerSkills || !playerSkills.knownSkills) {
    return '**Maria\'s Skills**: None yet learned.';
  }

  const knownSkills = playerSkills.knownSkills;
  const skillsByCategory = {};

  // Group skills by category
  Object.entries(knownSkills).forEach(([skillId, skillData]) => {
    const skill = SKILLS[skillId];
    if (!skill) return;

    const category = skill.category;
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }

    const skillBonus = skillData.level * 2;
    const effects = skill.effects[skillData.level];

    skillsByCategory[category].push({
      name: skill.name,
      level: skillData.level,
      bonus: skillBonus,
      unlocks: effects?.description || ''
    });
  });

  // Build CONDENSED output
  const skillsList = [];

  // Sort categories in logical order
  const categoryOrder = [
    SKILL_CATEGORIES.MEDICAL,
    SKILL_CATEGORIES.SCHOLARLY,
    SKILL_CATEGORIES.SOCIAL,
    SKILL_CATEGORIES.PRACTICAL,
    SKILL_CATEGORIES.LANGUAGES,
    SKILL_CATEGORIES.COVERT
  ];

  categoryOrder.forEach(category => {
    const skills = skillsByCategory[category];
    if (!skills || skills.length === 0) return;

    skills.forEach(skill => {
      skillsList.push(`${skill.name} L${skill.level}`);
    });
  });

  // Collect key unlocks (only notable ones)
  const keyUnlocks = [];
  Object.entries(knownSkills).forEach(([skillId, skillData]) => {
    const skill = SKILLS[skillId];
    if (!skill) return;

    const effects = skill.effects[skillData.level];
    if (effects?.description &&
        (effects.description.includes('Unlock') ||
         effects.description.includes('unlock') ||
         skillData.level >= 3)) { // L3+ skills likely have important unlocks
      keyUnlocks.push(`${effects.description.split('|')[0].trim()}`);
    }
  });

  // Find mastered skills
  const masterSkills = Object.entries(knownSkills)
    .filter(([_, data]) => data.level === 5)
    .map(([skillId]) => SKILLS[skillId]?.name)
    .filter(Boolean);

  let output = `**Maria's Skills**: ${skillsList.join(', ')}\n\n`;

  if (keyUnlocks.length > 0) {
    output += `**Key Abilities**: ${keyUnlocks.slice(0, 5).join('; ')}\n\n`; // Limit to 5 most important
  }

  if (masterSkills.length > 0) {
    output += `**Mastered** (L5): ${masterSkills.join(', ')} - exceptional outcomes\n\n`;
  }

  output += `**Skill Checks**: Roll d20 + (level×2) vs DC. Natural 20 = critical success, Natural 1 = critical failure.`;

  return output;
}

// Function to build full system prompt
/**
 * Build complete system prompt for a scenario
 * @param {string} [scenarioId] - Scenario identifier (optional, defaults to universal)
 * @returns {string} Complete system prompt
 */
export function buildSystemPrompt(scenarioId = null) {
  const modules = scenarioId ? getPromptModules(scenarioId) : universalPromptModules;
  const { core, mechanics, historical, narrative, skills } = modules;

  return `${core.identity}

### Core Principles

**Historical Accuracy**: ${historical.accuracy}

**Vivid Specificity**: ${historical.specificity}

**Narrative Flexibility**: Allow for player-driven story progression while maintaining historical plausibility.

**Tone and Style**: ${core.tone}

### Setting and Character

${core.character}

### Gameplay Guidelines

${narrative.pacing}

${historical.social}

### Command System

${mechanics.commands}

${mechanics.buying}

${mechanics.foraging}

${mechanics.sleeping}

### Time Management

${mechanics.timeProgression}

### Skills System

${skills ? skills.mechanics : ''}

${skills ? skills.affordances : ''}

### Important Narrative Events

${narrative.events}

${narrative.npcIntroduction}

### Response Format

**CRITICAL**: You must respond with valid JSON in this exact structure:

\`\`\`json
{
  "narrative": "Your story text here. Use markdown for formatting. This is the main narrative shown to the player.",
  "gameState": {
    "wealth": 11,
    "status": "tired",
    "reputation": "😐",
    "location": "Botica de la Amargura, Mexico City",
    "time": "3:45 PM",
    "date": "August 22, 1680"
  },
  "inventoryChanges": [
    {"item": "Aloe Vera", "quantity": 2, "action": "bought"}
  ],
  "systemAnnouncements": [
    "Someone approaches: Diego Perez"
  ],
  "journalEntry": "**August 22, 3:45 PM, Botica**: Maria treated a patient with fever symptoms."
}
\`\`\`

**gameState Requirements**:
- wealth: integer (silver coins/reales)
- status: SINGLE WORD describing Maria's state (tired, exhilarated, frightened, etc.)
- reputation: emoji from scale: 😡 (1), 😠 (2), 😐 (3), 😶 (4), 🙂 (5), 😌 (6), 😏 (7), 😃 (8), 😇 (9), 👑 (10)
- location: specific place with region/city (e.g., "Botica de la Amargura, Mexico City")
- time: exact time like "8:35 AM" or "11:45 PM"
- date: full date like "August 22, 1680"

**inventoryChanges**: Array of objects with "item" (name), "quantity" (number), "action" ("bought", "sold", "foraged", "received", "used")

**systemAnnouncements**: Array of system messages like NPC arrivals, scene changes, time passing

**journalEntry**: One-sentence past tense summary starting with bold date/time/location, with NPC names bolded`;
}

export default {
  promptModules,
  universalPromptModules,
  getPromptModules,
  buildContextSummary,
  buildEntityContext,
  buildSkillsContext,
  buildSystemPrompt
};
