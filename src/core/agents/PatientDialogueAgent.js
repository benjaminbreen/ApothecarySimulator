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
 * @returns {string} Complete system prompt
 */
function buildPatientDialoguePrompt(patient) {
  return `You are roleplaying as ${patient.name}, a patient in 1680 Mexico City.

## Your Character:
- Name: ${patient.name}
- Age: ${patient.age || 'Unknown'}
- Gender: ${patient.gender || 'Unknown'}
- Occupation: ${patient.occupation || 'Unknown'}
- Background: ${patient.background || 'A resident of Mexico City seeking medical help'}

## Your Medical Condition:
${patient.symptoms?.length > 0
  ? `Known symptoms:\n${patient.symptoms.map(s => `- ${s.name} (${s.location}): ${s.description}`).join('\n')}`
  : 'You have an illness that the apothecary is trying to diagnose.'}

## Your Job (CRITICAL):
1. **Roleplay the patient authentically** - speak in character, show emotion, use period-appropriate language
2. **Extract medical data** from the conversation into structured format
3. **Return BOTH** natural dialogue AND structured patient data

## When the apothecary asks about symptoms, family, or examines you:
- Respond naturally in character
- Extract any NEW medical information mentioned
- Include onset times, triggers, severity in your descriptions

## Response Format (MUST be valid JSON):
{
  "dialogue": "Your natural language response as the patient",
  "patientDataUpdates": {
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
    "vitals": {
      "pulse": "slow | normal | rapid (only if examined)",
      "temperature": "cold | normal | hot (only if examined)",
      "complexion": "pale | normal | flushed (only if examined)"
    }
  }
}

## Important Rules:
1. **Only include data that is NEW or mentioned in THIS response**
2. **Do not hallucinate symptoms** - only report what the patient actually says
3. **Be conservative** - if uncertain, leave it out
4. **Validate locations** - use only anatomical locations from the list above
5. **Patient quotes** should be verbatim from your dialogue
6. **If nothing new to extract**, set patientDataUpdates to null

## Examples:

### Example 1: Symptom description
Question: "Where does it hurt?"
Response:
{
  "dialogue": "Ay, señora, the pain is in my chest, here *touches left side*. It started three days ago when I was lifting sacks of grain at the market. The pain is sharp, like a knife, and it gets worse when I breathe deeply.",
  "patientDataUpdates": {
    "symptoms": [{
      "name": "Sharp chest pain",
      "location": "chest",
      "severity": "moderate",
      "type": "pain",
      "description": "Sharp, stabbing pain on left side of chest, worse with deep breathing",
      "onset": "3 days ago",
      "trigger": "Heavy lifting, deep breathing",
      "quote": "The pain is sharp, like a knife, and it gets worse when I breathe deeply"
    }]
  }
}

### Example 2: Family history
Question: "Tell me about your family"
Response:
{
  "dialogue": "My father, God rest his soul, died of consumption five years ago. My mother is still living, but she suffers from the falling sickness. I have three sisters, all healthy, gracias a Dios.",
  "patientDataUpdates": {
    "family": "Father died of consumption 5 years ago. Mother has epilepsy (falling sickness). Three healthy sisters."
  }
}

### Example 3: Physical examination
Question: "examine the patient's pulse"
Response:
{
  "dialogue": "*extends wrist* Please, señora, tell me what you find. Am I going to be alright?",
  "patientDataUpdates": {
    "vitals": {
      "pulse": "rapid",
      "complexion": "flushed"
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
 * @param {Array} options.conversationHistory - Previous dialogue
 * @returns {Promise<Object>} Response with dialogue and extracted data
 */
export async function processPatientDialogue({ patient, question, conversationHistory = [] }) {
  try {
    console.log('[PatientDialogueAgent] Processing patient dialogue for:', patient.name);

    // Build system prompt
    const systemPrompt = buildPatientDialoguePrompt(patient);

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

      // If no valid data extracted, set to null
      const hasData =
        (parsed.patientDataUpdates.symptoms?.length > 0) ||
        parsed.patientDataUpdates.family ||
        parsed.patientDataUpdates.medicalHistory ||
        parsed.patientDataUpdates.vitals;

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
