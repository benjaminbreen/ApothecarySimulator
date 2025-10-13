import debounce from 'lodash/debounce';
import { createChatCompletion } from './core/services/llmService'; 

let isApiCallInProgress = false; // Add a flag to track the API call status

// Function to handle the turn logic
export const handleTurn = (narrativeText, journal) => {
  // Ensure narrativeText is present and valid before invoking
  if (narrativeText && narrativeText.trim() !== "") {
    if (!isApiCallInProgress) { // Only make the API call if one is not already in progress
      debouncedGenerateJournalEntry(narrativeText, journal);
    } else {
      console.warn("API call already in progress. Skipping additional requests.");
    }
  } else {
    console.warn("Narrative text is missing or incomplete. Skipping journal entry generation.");
  }
};

// Main function to generate the journal entry
export const generateJournalEntry = async (narrativeText, journal = []) => {
  try {
    isApiCallInProgress = true; // Set flag to indicate the API call is in progress

    // Validate the presence of necessary input data
    if (!narrativeText || narrativeText.trim() === "") {
      console.error("Narrative text is missing or empty. Aborting journal entry generation.");
      isApiCallInProgress = false; // Reset flag on error
      return null;
    }

    // Combine past journal entries (in markdown format) into one string
    const journalHistoryText = journal.map(entry => entry.content).join('\n\n');

    // Debugging logs for data availability
    console.log('Journal history:', journalHistoryText);
    console.log('Narrative text:', narrativeText);


        // Prepare the payload for the OpenAI API call
        const payload = {
                model: 'gpt-4o-mini',
                temperature: 0.2,
                messages: [
                    {
                        role: 'system',
                        content: `
You are a journal summarizer for a historical simulation featuring Maria de Lima, a 45-year-old apothecary who runs the Botica de la Amurgura in Mexico City. The game begins on August 22, 1680 and can extend for up to a year beyond that.
Given the following text, provide:
1. A one-sentence past tense summary of what happened, always noting the names of any patients seen (their names ALWAYS bolded) inventory bought or sold, and primary location. Always start EVERY entry with the date and time and short summary of location bold. Format: " Summary:**Date, Location**: summary with **NPC names bolded**" For example: Summary:**August 23, 10:15 AM, Botica de la Amurgura**:Maria assessed a patient named **Fray Patricio**, recognizing symptoms of anemia, and spent roughly 30 minutes asking about his urine, humoral balance, and diet.

2. A JSON object tracking the *full* current location, date, and time of day. ALWAYS make note of the region or city name, not just local name, for location, and be sure to include it. This is essential so that the simulation does not "forget" where action is taking place - i.e. say "Drawing room, Greenwich Observatory, London" rather than just "Drawing room." This MUST ALWAYS BE formatted as follows:
\`\`\`json
{
    "location": "Botica de la Amargura, Mexico City",
    "date": "August 22, 1680",
    "time": "8:35 AM"
}
\`\`\`

When updating the time and date, please follow these specific rules:
- A turn typically lasts between 45 minutes and several hours/days. Use your judgement to determine the length, but usually assign 2-3 hours per turn. If there is no significant event in the narrative that suggests a large time jump, estimate the time passage to be within this 2-3 hour range. However, if a description involves several hours passing, progress time by more like 5-6 hours. NEVER go backwards in time. If it is dusk, you can only go further into evening, or the morning of the following day if the turn calls for it.
- If the action described spans multiple events (e.g., traveling to another town, treating multiple patients), increase the time accordingly—use hours, and if necessary, increment the date by a day or more.
- Always provide an exact time in the format "8:35 AM" or "11:45 PM". Never return vague times like "morning" or "evening".
- If the current time passes midnight (12:00 AM), increment the date by one day. If the date changes due to significant time passage, clearly reflect this in the JSON output.
- For example: If Maria treats a patient at 9:15 PM on August 23 and then travels for 4 hours, set the new time as 1:15 AM the next day, August 24.
- Give the location as a short phrase which clearly indicates the setting - for instance, rather than just "street," you could say "Busy thoroughfare, Mexico City" or instead of "ship" you could say "Fisherman's trawler, mid-Atlantic." AVOID RETURNING TO BOTICA DE AMURGURA if Maria leaves - try very hard to preserve her location and track it in space, ensuring that if she goes somewhere far afield of her botica, you don't accidentally return her there out of habit. 
 Pay very careful attention to her movements and think through logically where she might be based on past context. Under no circumstances should Maria return to her previous locations unless explicitly stated in the provided narrative. Pay extremely close attention to where she is at the end of each turn. Track her exact location in detail based on the narrative, even if it is repetitive.
 REMEMBER: You must NEVER return Maria to a previously visited location unless the narrative makes it abundantly clear she traveled back. If the journal agent struggles with maintaining continuity, explicitly adding reminders like, "Maria is still in the mountains," within the narrative can help. Reinforcing the current location in the text prompts could prevent the model from switching locations unnecessarily.
3. A JSON object tracking any inventory changes:
\`\`\`json
{
    "inventoryChanges": [
        {"item": "Aloe Vera", "quantity": 2, "action": "bought"},
        {"item": "Cacao", "quantity": 1, "action": "sold"}
    ]
}
\`\`\`

IMPORTANT: Provide a concise summary of the turn's events. Do not repeat the entire narrative. Focus on key actions, interactions, and changes in Maria's situation. Be witty when warranted, at times somewhat arch. 
`
                    },
                    { role: 'user', content: narrativeText 
                 }
            ]
        };


   // Fetch data from the journal agent API
    const journalAgentData = await createChatCompletion(
      payload.messages,
      payload.temperature
    );

    // Extract the journal agent content
    const journalOutput = journalAgentData.choices[0]?.message?.content;
    if (!journalOutput) {
      throw new Error("No content received from the journal agent.");
    }

    console.log('Journal Agent Output:', journalOutput);

    // Extract the summary using regex
    const summaryMatch = journalOutput.match(/Summary:\s*(.*)/);
    const summary = summaryMatch ? summaryMatch[1].trim() : "Error: Could not generate summary.";

    // Extract JSON objects for location and inventory changes
    const jsonMatches = journalOutput.match(/```json([\s\S]*?)```/g);
    const summaryData = jsonMatches && jsonMatches[0]
      ? JSON.parse(jsonMatches[0].replace(/```json|```/g, '').trim())
      : { location: "", date: "", time: "" };

    const inventoryChanges = jsonMatches && jsonMatches[1]
      ? JSON.parse(jsonMatches[1].replace(/```json|```/g, '').trim()).inventoryChanges
      : [];

    // Debugging logs for verification
    console.log('Summary:', summary);
    console.log('Summary Data:', summaryData);
    console.log('Inventory Changes:', inventoryChanges);

    isApiCallInProgress = false; // Reset flag after successful API call

    // Return the parsed data in a structured format
    return {
      summary,
      summaryData,
      inventoryChanges,
    };

  } catch (error) {
    console.error("Error generating journal entry:", error);
    isApiCallInProgress = false; // Reset flag on error
    return {
      summary: "Error: Could not generate summary.",
      summaryData: { location: "", date: "", time: "" },
      inventoryChanges: [],
    };
  }
};

// Debounce the journal entry generation to avoid multiple rapid invocations
const debouncedGenerateJournalEntry = debounce(generateJournalEntry, 100); // 300ms delay