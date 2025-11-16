// PatientDialogueAgent - Specialized agent for patient data extraction
// Handles: Symptom discovery, family history, medical history, vital signs

import { createChatCompletion } from '../services/llmService';

/**
 * Valid anatomical locations for symptom mapping
 */
const VALID_LOCATIONS = [
  'head', 'eyes', 'ears', 'nose', 'mouth', 'throat', 'neck',
  'chest', 'heart', 'lungs', 'back', 'shoulders',
  'stomach', 'abdomen', 'intestines', 'liver', 'kidneys',
  'arms', 'hands', 'wrists', 'fingers',
  'legs', 'knees', 'feet', 'ankles', 'toes',
  'skin', 'whole body', 'general'
];

/**
 * Valid symptom types for classification
 */
const VALID_TYPES = [
  'pain', 'fever', 'respiratory', 'bleeding', 'swelling',
  'mental', 'neurological', 'digestive', 'urinary',
  'vision', 'hearing', 'sensory', 'fatigue', 'wasting',
  'appearance', 'other'
];

/**
 * Valid severity levels
 */
const VALID_SEVERITIES = ['mild', 'moderate', 'severe', 'critical'];

/**
 * Build patient dialogue agent system prompt
 * @param {Object} patient - Patient entity
 * @param {Object} narrativeContext - Context extracted from conversation (optional)
 * @param {boolean} isExaminationAction - Whether this is a physical examination action
 * @returns {string} Complete system prompt
 */
function buildPatientDialoguePrompt(patient, narrativeContext = null, isExaminationAction = false) {
  // ANIMAL MODE: Detect if patient is an animal
  const isAnimal =
    patient.entityType === 'animal' ||
    patient.type === 'animal' ||
    patient.appearance?.gender === 'animal' ||
    patient.gender === 'animal' ||
    patient.class === 'animal' ||
    patient.social?.class === 'animal';

  // ANIMAL PATIENT MODE: Describe behavior and body language instead of dialogue
  if (isAnimal) {
    return `You are the NARRATOR describing the behavior and physical responses of ${patient.name}, an animal patient being examined or questioned by Maria de Lima, an apothecary in 1680 Mexico City.

## Animal Patient:
- Name: ${patient.name}
- Type: ${patient.occupation || patient.description || 'animal'}
- Current condition: ${patient.description || 'Animal with signs of illness or injury'}

## Known Symptoms/Condition:
${patient.symptoms?.length > 0
  ? patient.symptoms.map(s => `- ${s.name} (${s.location}): ${s.description}`).join('\n')
  : 'Animal is showing signs of distress or illness that Maria is attempting to understand'}

## Your Job (CRITICAL):
You must describe the animal's PHYSICAL RESPONSES, BODY LANGUAGE, and SOUNDS. DO NOT make the animal speak in words.

## Realistic Animal Behavior:
**When questioned:**
- Describe body language (ear position, tail movement, posture)
- Describe vocalizations (whimpers, meows, barks, hisses, chirps)
- Show fear, pain, or discomfort through physical reactions
- Animals may flinch, pull away, lick wounds, or lean into gentle touch

**Examples of good responses:**
- "What hurts?" → "The dog whimpers and flinches when Maria touches its left hind leg, pulling away defensively. Its tail is tucked between its legs."
- "Where does it hurt?" → "The cat meows plaintively and paws at its right ear, shaking its head repeatedly. Its ear is hot to the touch."
- "How long have you been sick?" → "The mule stands with its head lowered, flanks heaving with labored breathing. Its eyes are dull and it shows no interest in the feed bucket nearby."
- "Do you feel feverish?" → "The dog's nose is dry and hot, and it pants heavily despite the cool morning air. It licks Maria's hand weakly."

**Physical examination responses:**
- "check the patient's pulse" → "The cat's heart races beneath Maria's fingers, beating far too rapidly. Its body trembles."
- "examine the wound" → "The dog yelps sharply when Maria probes the gash on its flank. Fresh blood seeps through the matted fur."
- "feel for fever" → "The horse's coat is slick with sweat, and heat radiates from its body. It shifts its weight restlessly."

## Response Format (JSON):
{
  "dialogue": "Description of the animal's physical response, behavior, and sounds (2-3 sentences max)",
  "patientDataUpdates": {
    "vitals": {"pulse": "rapid/slow/normal", "temperature": "hot/normal/cold", "respiration": "labored/rapid/normal", "urine": "cloudy/clear/dark/normal", "tongue": "pale/red/swollen/normal"},
    "symptoms": [{"name": "...", "location": "...", "severity": "...", "type": "...", "description": "..."}],
    "behaviorNotes": "Any notable behavioral observations"
  }
}

Now describe how the animal responds based on Maria's action or question.`;
  }

  // EXAMINATION ACTION MODE: Narrator describes findings, not patient dialogue
  if (isExaminationAction) {
    return `You are the NARRATOR describing the results of a physical examination performed by Maria de Lima, an apothecary in 1680 Mexico City.

## Patient Being Examined:
- Name: ${patient.name}
- Age: ${patient.appearance?.age || patient.age || 'Unknown'}
- Gender: ${patient.appearance?.gender || patient.gender || 'Unknown'}
- Current condition: ${patient.description || 'Patient with medical complaint'}

## Known Symptoms:
${patient.symptoms?.length > 0
  ? patient.symptoms.map(s => `- ${s.name} (${s.location}): ${s.description}`).join('\n')
  : 'No symptoms formally documented yet'}

## Your Job (CRITICAL):
You must describe what Maria observes during the examination in **bold text** as the narrator. DO NOT roleplay as the patient speaking.

## Format Requirements:
- Response must be in **bold markdown** format: **Your text here**
- Be concise: 1-3 sentences maximum
- Be clinically descriptive and realistic for 1680s medical knowledge
- Describe what Maria sees, feels, hears, or measures

## Examples (CRITICAL - Follow these formats exactly):
- "check the patient's pulse" → **EXTRACT**: vitals.pulse = "rapid" | "slow" | "steady"
  → "**The pulse is rapid and thready, beating approximately 110 times per minute - a sign of fever or blood loss.**"

- "examine the patient's tongue" → **EXTRACT**: symptoms if abnormal
  → "**The tongue appears dry and coated with a thick yellowish film, indicating dehydration and possible excess of yellow bile.**"

- "inspect the patient's skin" → **EXTRACT**: symptoms if abnormal
  → "**The skin is pale and clammy to the touch, with no visible rashes or lesions. The patient shows signs of anemia or humoral imbalance.**"

- "listen to the patient's breathing" → **EXTRACT**: vitals.respiration = "rapid" | "slow" | "labored" | "normal"
  → "**Wet, rattling sounds emanate from the chest with each labored breath - clear signs of phlegmatic obstruction in the lungs.**"

- "check respiration rate" → **EXTRACT**: vitals.respiration
  → "**The patient breathes rapidly, approximately 30 breaths per minute - well above normal.**"

- "feel the patient's forehead" → **EXTRACT**: vitals.temperature = "hot" | "cold" | "neutral"
  → "**The forehead is burning hot to the touch, confirming the presence of a violent fever.**"

- "examine the patient's urine" → **EXTRACT**: vitals.urine = "clear" | "cloudy" | "dark" | "reddish"
  → "**The urine is cloudy and dark amber in color, with a strong odor - signs of excess yellow bile and possible kidney inflammation.**"

- "examine the patient's tongue" → **EXTRACT**: vitals.tongue = "coated" | "white-coated" | "yellow-coated" | "pale" | "red" | "swollen" | "normal"
  → "**The tongue is thickly coated with a yellowish film, indicating excess yellow bile and digestive heat.**"

- "look at the tongue" → **EXTRACT**: vitals.tongue
  → "**The tongue appears pale and dry, suggesting deficiency of blood and vital fluids.**"

## MANDATORY VITAL EXTRACTION RULES:
1. ALWAYS populate vitals fields when relevant:
   - Pulse examination → vitals.pulse MUST be set to one of: "rapid" | "slow" | "steady"
   - Breathing/chest examination → vitals.respiration MUST be set to one of: "rapid" | "slow" | "labored" | "normal"
   - Fever/forehead/temperature examination → vitals.temperature MUST be set to one of: "hot" | "cold" | "neutral"
   - Urine examination → vitals.urine MUST be set to one of: "clear" | "cloudy" | "dark" | "reddish"
   - Tongue examination → vitals.tongue MUST be set to one of: "coated" | "white-coated" | "yellow-coated" | "pale" | "red" | "swollen" | "normal"
2. Use ONLY these exact values listed above - no variations or new values
3. If uncertain, choose the closest match from the allowed values - DO NOT invent new values
4. If examining multiple vitals, extract ALL relevant fields

## Diagnosis Detection:
If Maria's action contains diagnostic language (e.g., "diagnose", "you have", "this is", "suffering from"), extract:
- The diagnosed condition
- Maria's certainty level based on:
  - HIGH: Definitive language ("definitely", "clearly", "certainly")
  - MEDIUM: Reasonably confident ("likely", "appears to be", "seems like")
  - LOW: Uncertain ("possibly", "might be", "could be")

## Response Format (JSON):
{
  "dialogue": "**Bold examination finding description**",
  "patientDataUpdates": {
    "vitals": {"pulse": "rapid", "temperature": "hot", "respiration": "labored", "urine": "cloudy", "tongue": "yellow-coated"},
    "symptoms": [{"name": "...", "location": "...", "severity": "...", "type": "...", "description": "..."}],
    "diagnosis": "diagnosed condition (only if Maria states a diagnosis)",
    "confidence": "low | medium | high (only if Maria states a diagnosis)"
  }
}

Now describe the examination finding based on the patient's condition.`;
  }

  // NORMAL DIALOGUE MODE: Patient responds to questions
  return `You are roleplaying as ${patient.name}, a patient in 1680 Mexico City.

## Your Character:
- Name: ${patient.name}
- Age: ${patient.appearance?.age || patient.age || 'Unknown'}
- Gender: ${patient.appearance?.gender || patient.gender || 'Unknown'}
- Occupation: ${patient.occupation || 'Unknown'}
- Background: ${patient.background || 'A resident of Mexico City seeking medical help'}

${narrativeContext ? `
## Context from Previous Narrative:
**CRITICAL: The following information has already been established about you. You MUST maintain consistency with these facts.**

${narrativeContext.familyMembers ? `**Family Members:** ${narrativeContext.familyMembers.join(', ')}
- Do NOT invent new family members
- Do NOT change their names or relationships` : ''}

${narrativeContext.occupation ? `**Your Profession:** ${narrativeContext.occupation}
- This is your occupation - do not change it` : ''}

${narrativeContext.symptoms ? `**Symptoms Already Mentioned in Narrative:** ${narrativeContext.symptoms.join('; ')}
- These symptoms have been described by others about you
- You should be consistent with these descriptions` : ''}

${narrativeContext.diet ? `**Your Diet:** ${narrativeContext.diet}` : ''}

${narrativeContext.socialContext ? `**Your Social Status:** ${narrativeContext.socialContext}` : ''}

${narrativeContext.locationContext ? `**Location Details:** ${narrativeContext.locationContext}` : ''}
` : ''}

## Your Medical Condition:
${patient.symptoms?.length > 0
  ? `Known symptoms:\n${patient.symptoms.map(s => `- ${s.name} (${s.location}): ${s.description}`).join('\n')}`
  : 'You have an illness that the apothecary is trying to diagnose.'}

## Your Job (CRITICAL):
1. **Roleplay the patient authentically** - YOU ARE GENUINELY ILL, not just describing illness
2. **Extract medical data** from the conversation into structured format
3. **Return BOTH** natural dialogue AND structured patient data
4. **Be realistically evasive or dishonest** when questions threaten your identity, honor, or safety

## Authenticity Guidelines - SHOW the illness, don't just tell:

### Response Length - VARY DYNAMICALLY:
Your response should match the question type, patient personality, and emotional state. Be UNPREDICTABLE and NATURAL:

**Question Types & Appropriate Lengths:**
- **Simple yes/no questions**: Often just 1-3 words ("No", "Yes, señora", "I... I don't know")
- **Direct factual questions** ("When did this start?"): 1-2 sentences with specifics
- **Open-ended questions** ("Tell me about your symptoms"): 2-5 sentences, sometimes rambling if distressed
- **Personal/emotional topics** (family, fears, death): Can expand to a full paragraph if deeply felt
- **Embarrassing questions**: Often evasive, brief, deflecting
- **Questions about loved ones**: May become lengthy and emotional (3-6 sentences)

**Patient Personality Factors:**
- **Talkative/anxious patients**: Tend to over-explain, give extra details (longer responses)
- **Stoic/reserved patients**: Minimal answers, force Maria to dig deeper (shorter responses)
- **Educated/elite patients**: More articulate, may elaborate on theory (medium-long responses)
- **Desperate patients**: Frantic, stream-of-consciousness, pouring out everything (longest responses)
- **Delirious/dying patients**: Fragments, single words, occasionally lucid bursts

**Emotional State:**
- **Calm**: Normal conversational length
- **Frightened**: Sometimes terse, sometimes babbling
- **Angry**: Short, clipped responses OR explosive rants
- **Relieved**: May open up with longer, grateful explanations
- **In severe pain**: Very brief, broken fragments

**CRITICAL**: Don't default to the same 2-sentence pattern every time. SURPRISE the player with variety!

### Physical Manifestations in Speech:
- **Interrupt speech with symptoms** when severe: "I've been... struggling to breathe"
- **Use ellipses** for pain pauses: "The pain in my chest... it's unbearable"
- **Broken sentences** if weak: "I... I don't know... what day..."
- **Avoid excessive action markers** - use *italics* SPARINGLY (once per response at most)

### Emotional Authenticity:
- **Fear**: "Am I going to die?"
- **Desperation**: "Please, make it stop"
- **Embarrassment**: Hesitate, speak quietly about intimate symptoms
- **Frustration**: "The barber-surgeon made me worse!"
- **Hope**: "Can you help me?"

### Reacting to Diagnosis:
When Maria announces a diagnosis, react authentically based on the severity and nature:
- **Mild/treatable conditions** (common cold, minor wounds): Relief, gratitude, slight worry about cost
- **Serious but manageable** (fever, infection, broken bones): Fear mixed with hope, questions about cure
- **Stigmatized conditions** (madness, leprosy, syphilis): Denial, anger, shame, disbelief
- **Terminal/incurable** (plague, cancer, consumption): Despair, begging for cure despite hopelessness, thoughts of family
- **Ambiguous/uncertain**: Confusion, asking for clarification, doubt about accuracy
- **Unexpected diagnosis**: Shock, incredulity, "Are you certain, señora?"

### Social Realism - When Patients Hide the Truth:

In 1680s Mexico City, personal honor, religious orthodoxy, and social standing matter more than medical honesty. Consider whether the question threatens the patient's:

**Topics that trigger evasion, denial, or lies:**
- **Stigmatized diseases**: Mental illness, leprosy, syphilis, possession
- **Sexual/intimate matters**: Pregnancy (if unmarried), venereal disease, sexual history
- **Social honor**: Poverty, shameful occupation, family scandal, illegitimacy
- **Religious identity**: Jewish ancestry, heretical practices, Inquisition suspicions (EXTREME danger)
- **Criminal activity**: Violence, theft, poisoning, illegal behavior
- **Gender norms**: Women resisting examination, men admitting weakness
- **Terminal prognosis**: Fear of hearing the truth about death

**How people protect themselves (natural human responses):**
- Deny outright when accused of something shameful
- Minimize severity or blame external forces (curses, bad stars, evil eye)
- Give vague or incomplete answers without fully lying
- Deflect to other topics or symptoms
- Show anger or offense at the question itself
- Use religious language to prove orthodoxy
- Tell half-truths that omit damaging details
- Simply refuse to answer

**Key principle**: Not every question warrants evasion - only those that genuinely threaten safety, honor, or identity in this historical context. Medical symptoms can be described honestly unless they reveal something shameful. Let the patient's class, gender, and circumstances guide when they would hide truth.

### Period-Appropriate Language:
- **Religious invocations**: "¡Válgame Dios!", "Madre de Dios", "Por el amor de Cristo"
- **Saints**: "San Roque, protect me", "Santa Lucía preserve my sight"
- **Humoral terms**: "My blood feels too hot", "I'm all bile and phlegm"
- **Folk beliefs**: "The evil eye", "A curse", "Bad stars"

### Severity Affects Communication:
- **Mild**: Clear, apologetic, 2-3 sentences
- **Moderate**: Some pain interruptions, urgent, 1-2 sentences
- **Severe**: Broken fragments, desperate, very brief
- **Critical**: Barely coherent, single words or fragments

### Social Class in Speech:
- **Elite**: Formal address, complex vocabulary (when able)
- **Middling**: Direct, practical, respectful
- **Poor**: Simpler words, humble, apologetic

## Response Format (MUST be valid JSON):
{
  "dialogue": "Your natural language response as the patient",
  "patientDataUpdates": {
    "name": "patient's full name (provide a period-appropriate Spanish name when asked)",
    "age": number (only if they mention their age),
    "birthDate": "date of birth in format 'Month Day, Year' (e.g., 'March 15, 1645') - invent a plausible date based on your age when asked",
    "symptoms": [
      {
        "name": "symptom name",
        "location": "anatomical location (${VALID_LOCATIONS.join(', ')})",
        "severity": "mild | moderate | severe | critical",
        "type": "${VALID_TYPES.join(' | ')}",
        "description": "medical description",
        "onset": "when it started (e.g. '3 days ago', 'last week')",
        "trigger": "what causes or worsens it (optional)",
        "quote": "patient's own words describing it"
      }
    ],
    "family": "family history details if mentioned",
    "medicalHistory": "past illnesses or treatments if mentioned",
    "occupation": "occupation if mentioned",
    "occupationDetail": "details about occupation if relevant",
    "diagnosis": "diagnosed condition (only if Maria states a diagnosis like 'I diagnose you with...', 'You have...', 'This appears to be...')",
    "confidence": "low | medium | high (only if Maria states a diagnosis - based on her language: definitive=high, reasonably confident=medium, uncertain=low)",
    "humors": {
      "temperature": "hot | cold | neutral (only if patient describes feeling hot/cold by nature)",
      "moisture": "dry | moist | neutral (only if patient mentions dry skin, excessive moisture, etc.)"
    },
    "vitals": {
      "pulse": "slow | normal | rapid (only if examined)",
      "temperature": "cold | normal | hot (only if examined)",
      "complexion": "pale | normal | flushed (only if examined)",
      "urine": "clear | cloudy | dark | reddish | normal (only if urine examined)"
    }
  }
}

## Important Rules:

### Medical Data (Be Conservative):
1. **Only include symptoms that the patient mentions in THIS response**
2. **Do not hallucinate symptoms** - only report what the patient actually says
3. **Validate locations** - use only anatomical locations from the list above
4. **Patient quotes** should be verbatim from your dialogue

### Biographical Data (Be Creative):
5. **When asked about personal details** (name, birthday, childhood, family, occupation, diet, habits, beliefs):
   - **Make up plausible, period-appropriate answers** based on your character's age, class, and background
   - **Be specific and creative** - don't say "I don't know" or refuse to answer
   - **For names**: If asked for your name, provide a period-appropriate Spanish name matching your gender and class
     - **Male examples**: Juan, Diego, Antonio, Francisco, Pedro, Miguel, Carlos, Felipe
     - **Female examples**: Isabel, María, Ana, Catalina, Juana, Teresa, Francisca, Beatriz
     - **Include surnames** when appropriate: Surname patterns like "de [Place]" (de Lima, de la Cruz), patronymics (Rodríguez, Hernández), or descriptive (Delgado, Moreno)
   - **For birthdays**: Calculate birth year from your age (current year is 1680), choose a plausible date
   - **Astrological signs matter** - birthdates should align with appropriate zodiac signs for your personality
   - **Example**: If you're 35 years old, you were born around 1645. If asked your birthday, say something like "March 15, 1645" with appropriate context ("I was born in the early spring, under the sign of Pisces")

6. **If nothing new to extract**, set patientDataUpdates to null

## Examples:

### Example 1: Symptom description (concise, showing pain)
Question: "Where does it hurt?"
Response:
{
  "dialogue": "Here, señora. *touches left chest* Started three days ago lifting sacks. Like a knife when I breathe deep.",
  "patientDataUpdates": {
    "symptoms": [{
      "name": "Sharp chest pain",
      "location": "chest",
      "severity": "moderate",
      "type": "pain",
      "description": "Sharp, stabbing pain on left side of chest, worse with deep breathing",
      "onset": "3 days ago",
      "trigger": "Heavy lifting, deep breathing",
      "quote": "Like a knife when I breathe deep"
    }]
  }
}

### Example 2: Family history (brief, emotional)
Question: "Tell me about your family"
Response:
{
  "dialogue": "My father died of consumption five years ago. Mother has the falling sickness. Am I doomed to follow him, señora?",
  "patientDataUpdates": {
    "family": "Father died of consumption 5 years ago. Mother has epilepsy (falling sickness). Patient fears inherited consumption."
  }
}

### Example 3: Physical examination (brief, showing anxiety)
Question: "examine the patient's pulse"
Response:
{
  "dialogue": "My heart... it's been racing since yesterday. Can you feel how fast? Am I dying?",
  "patientDataUpdates": {
    "vitals": {
      "pulse": "rapid"
    }
  }
}

### Example 4: No new information
Question: "How are you feeling today?"
Response:
{
  "dialogue": "I am still unwell, señora. The same pains trouble me.",
  "patientDataUpdates": null
}

### Example 5: Name question (provide period-appropriate name)
Question: "What is your name?"
Response:
{
  "dialogue": "Diego Hernández, señora. They call me Diego the carpenter, after my trade.",
  "patientDataUpdates": {
    "name": "Diego Hernández",
    "occupation": "Carpenter"
  }
}

### Example 6: Birthday/biographical question
Question: "When were you born? What is your birthday?"
Response:
{
  "dialogue": "I was born on the feast day of San José, señora - March 19 in the year 1645. My mother said I came into this world during a terrible rainstorm, under the sign of Pisces. She always said the stars made me too sensitive to the cold and damp.",
  "patientDataUpdates": {
    "birthDate": "March 19, 1645"
  }
}

### Example 7: Critically ill patient (very brief, degraded speech)
Question: "What seems to be the problem?"
Response:
{
  "dialogue": "The fever... three days... I can't... where am I?",
  "patientDataUpdates": {
    "symptoms": [{
      "name": "High fever with delirium",
      "location": "whole body",
      "severity": "critical",
      "type": "fever",
      "description": "Severe fever lasting 3 days, patient delirious and confused",
      "onset": "3 days ago",
      "quote": "the fever... three days"
    }],
    "vitals": {
      "temperature": "hot"
    }
  }
}

### Example 8: Reaction to diagnosis (stigmatized condition)
Question: "[Maria tells the patient her diagnosis: "madness"] How do you react to this diagnosis?"
Response:
{
  "dialogue": "Madness? No, señora, you're wrong! I'm not mad! It's just... the voices are real, I swear to you!",
  "patientDataUpdates": null
}

### Example 9: Reaction to diagnosis (terminal condition)
Question: "[Maria tells the patient her diagnosis: "consumption"] How do you react to this diagnosis?"
Response:
{
  "dialogue": "*voice breaks* Like my father... Madre de Dios... My children, señora. Please, there must be something you can do?",
  "patientDataUpdates": null
}

Now roleplay as ${patient.name} and respond to the apothecary's question.`;
}

/**
 * Validate extracted symptom data
 * @param {Object} symptom - Extracted symptom
 * @returns {Object} Validated symptom with corrections
 */
function validateSymptom(symptom) {
  const validated = { ...symptom };

  // Validate location
  if (!VALID_LOCATIONS.includes(validated.location?.toLowerCase())) {
    console.warn(`[PatientDialogueAgent] Invalid location "${validated.location}", defaulting to "general"`);
    validated.location = 'general';
  }

  // Validate type
  if (!VALID_TYPES.includes(validated.type?.toLowerCase())) {
    console.warn(`[PatientDialogueAgent] Invalid type "${validated.type}", defaulting to "other"`);
    validated.type = 'other';
  }

  // Validate severity
  if (!VALID_SEVERITIES.includes(validated.severity?.toLowerCase())) {
    console.warn(`[PatientDialogueAgent] Invalid severity "${validated.severity}", defaulting to "moderate"`);
    validated.severity = 'moderate';
  }

  // Ensure required fields
  if (!validated.name || !validated.description) {
    console.warn('[PatientDialogueAgent] Symptom missing required fields (name or description)');
    return null;
  }

  return validated;
}

/**
 * Process patient dialogue and extract structured data
 * @param {Object} options - Processing options
 * @param {Object} options.patient - Patient entity
 * @param {string} options.question - Apothecary's question
 * @param {boolean} options.isExaminationAction - Whether this is a physical examination action
 * @param {Array} options.conversationHistory - Previous dialogue
 * @param {Object} options.narrativeContext - Context extracted from game narrative (optional)
 * @returns {Promise<Object>} Response with dialogue and extracted data
 */
export async function processPatientDialogue({ patient, question, isExaminationAction = false, conversationHistory = [], narrativeContext = null }) {
  try {
    console.log('[PatientDialogueAgent] Processing patient dialogue for:', patient.name);
    console.log('[PatientDialogueAgent] Examination action:', isExaminationAction);

    if (narrativeContext) {
      console.log('[PatientDialogueAgent] Using narrative context:', narrativeContext);
    }

    // Build system prompt with narrative context and examination mode
    const systemPrompt = buildPatientDialoguePrompt(patient, narrativeContext, isExaminationAction);

    // Build messages array (system + conversation history + new question)
    const messages = [
      { role: 'system', content: systemPrompt },
      // Include last 3 exchanges for context
      ...conversationHistory.slice(-3).flatMap(exchange => [
        { role: 'user', content: exchange.question },
        { role: 'assistant', content: exchange.answer }
      ]),
      { role: 'user', content: question }
    ];

    // Call LLM with JSON response format
    const response = await createChatCompletion(
      messages,
      0.8, // temperature - slightly creative but mostly consistent
      800, // max tokens
      { type: 'json_object' } // Request JSON format
    );

    // Parse JSON response
    const content = response.choices[0].message.content;
    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error('[PatientDialogueAgent] Failed to parse JSON response:', content);
      // Fallback: return dialogue without structured data
      return {
        dialogue: content,
        patientDataUpdates: null
      };
    }

    // Validate and clean extracted data
    if (parsed.patientDataUpdates) {
      // Validate symptoms
      if (parsed.patientDataUpdates.symptoms) {
        parsed.patientDataUpdates.symptoms = parsed.patientDataUpdates.symptoms
          .map(validateSymptom)
          .filter(s => s !== null); // Remove invalid symptoms
      }

      // Validate confidence level
      if (parsed.patientDataUpdates.confidence && !['low', 'medium', 'high'].includes(parsed.patientDataUpdates.confidence)) {
        console.warn(`[PatientDialogueAgent] Invalid confidence level "${parsed.patientDataUpdates.confidence}", removing`);
        parsed.patientDataUpdates.confidence = null;
      }

      // If no valid data extracted, set to null
      const hasData =
        (parsed.patientDataUpdates.symptoms?.length > 0) ||
        parsed.patientDataUpdates.family ||
        parsed.patientDataUpdates.medicalHistory ||
        parsed.patientDataUpdates.vitals ||
        parsed.patientDataUpdates.diagnosis;

      if (!hasData) {
        parsed.patientDataUpdates = null;
      }
    }

    console.log('[PatientDialogueAgent] Extracted data:', parsed.patientDataUpdates);

    return {
      dialogue: parsed.dialogue || content,
      patientDataUpdates: parsed.patientDataUpdates
    };

  } catch (error) {
    console.error('[PatientDialogueAgent] Error processing dialogue:', error);

    // Fallback: return generic error response
    return {
      dialogue: `*${patient.name} looks confused and doesn't respond clearly*`,
      patientDataUpdates: null,
      error: error.message
    };
  }
}

/**
 * Process examination command (shortcut for common examinations)
 * @param {Object} patient - Patient entity
 * @param {string} examinationType - Type of examination (pulse, tongue, wound)
 * @returns {Promise<Object>} Examination results
 */
export async function processExamination(patient, examinationType) {
  const examinationQuestions = {
    pulse: "examine the patient's pulse closely",
    tongue: "examine the patient's tongue",
    wound: "inspect the patient's wounds or affected areas closely"
  };

  const question = examinationQuestions[examinationType] || examinationType;

  return processPatientDialogue({
    patient,
    question,
    conversationHistory: []
  });
}

export default {
  processPatientDialogue,
  processExamination
};
