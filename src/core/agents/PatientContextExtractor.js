// PatientContextExtractor - Extracts patient context from conversation narrative
// Uses LLM to parse natural language and extract structured facts about patients

import { createChatCompletion } from '../services/llmService';

/**
 * Extract patient context from conversation history
 * Uses LLM to intelligently parse narrative and extract structured facts
 *
 * @param {Object} patient - Patient entity
 * @param {Array} conversationHistory - Recent conversation messages
 * @returns {Promise<Object>} Structured context (family, occupation, symptoms, etc.)
 */
export async function extractPatientContext(patient, conversationHistory) {
  try {
    console.log('[PatientContextExtractor] Extracting context for:', patient.name);

    // Filter to assistant messages (narrative) from last 10 turns
    const recentNarrative = conversationHistory
      .filter(msg => msg.role === 'assistant')
      .slice(-10)
      .map(msg => msg.content)
      .join('\n\n');

    if (!recentNarrative || recentNarrative.trim().length === 0) {
      console.log('[PatientContextExtractor] No narrative found, returning empty context');
      return null;
    }

    const systemPrompt = `You are a data extraction agent. Extract factual information about ${patient.name} from the provided narrative text.

**Your Task:**
Parse the narrative and extract ONLY explicitly stated facts about ${patient.name}. Do not infer, guess, or make assumptions.

**Extract:**
1. **Family members** - Names and relationships (wife, husband, children, parents, siblings)
2. **Occupation** - Job title and workplace details
3. **Symptoms** - Medical symptoms mentioned in the narrative (not from previous patient knowledge)
4. **Diet** - Foods, drinks, eating habits mentioned
5. **Social context** - Class, wealth, status, living situation

**Critical Rules:**
- Only extract information explicitly mentioned in the text
- Use null for fields with no information
- Do not hallucinate or invent details
- Family members should include relationship, e.g., "Mariana de la Cruz (wife)"
- Symptoms should be from narrative descriptions, not patient self-reports

**Return Format (MUST be valid JSON):**
{
  "familyMembers": ["name (relationship)", "..."] or null,
  "occupation": "job title and workplace" or null,
  "symptoms": ["symptom description", "..."] or null,
  "diet": "diet details" or null,
  "socialContext": "class/status information" or null,
  "locationContext": "where patient lives/works" or null
}

**Example:**
Narrative: "Mariana de la Cruz explains that her husband Don Rafael, a clerk at the Royal Mint, has suffered from cold sweats and fever for three days. He has been eating only light bread and broth."

Extract:
{
  "familyMembers": ["Mariana de la Cruz (wife)"],
  "occupation": "Clerk at the Royal Mint",
  "symptoms": ["cold sweats for 3 days", "fever for 3 days"],
  "diet": "light bread and broth only",
  "socialContext": null,
  "locationContext": "Royal Mint (workplace)"
}

Now extract from the narrative below.`;

    const userPrompt = `Patient: ${patient.name}

Narrative:
${recentNarrative}

Extract the information in JSON format.`;

    // Call LLM with low temperature for factual extraction
    const response = await createChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      0.3, // Low temperature for factual extraction
      500, // Max tokens
      { type: 'json_object' } // Request JSON format
    );

    // Parse JSON response
    const content = response.choices[0].message.content;
    let context;

    try {
      context = JSON.parse(content);
    } catch (parseError) {
      console.error('[PatientContextExtractor] Failed to parse JSON:', content);
      return null;
    }

    // Validate and clean context
    const cleanedContext = {
      familyMembers: Array.isArray(context.familyMembers) && context.familyMembers.length > 0
        ? context.familyMembers
        : null,
      occupation: context.occupation && context.occupation !== 'null'
        ? context.occupation
        : null,
      symptoms: Array.isArray(context.symptoms) && context.symptoms.length > 0
        ? context.symptoms
        : null,
      diet: context.diet && context.diet !== 'null'
        ? context.diet
        : null,
      socialContext: context.socialContext && context.socialContext !== 'null'
        ? context.socialContext
        : null,
      locationContext: context.locationContext && context.locationContext !== 'null'
        ? context.locationContext
        : null,
      extractedAt: new Date().toISOString() // Timestamp for cache invalidation
    };

    // Check if any useful data was extracted
    const hasData = Object.values(cleanedContext).some(v => v !== null && v !== undefined);

    if (!hasData) {
      console.log('[PatientContextExtractor] No useful context extracted');
      return null;
    }

    console.log('[PatientContextExtractor] Extracted context:', cleanedContext);
    return cleanedContext;

  } catch (error) {
    console.error('[PatientContextExtractor] Error extracting context:', error);
    return null; // Graceful degradation - patient dialogue will work without context
  }
}

export default {
  extractPatientContext
};
