// PrescribePopup.js
import React, { useState, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import '../../../PrescribePopup.css';
import imageMap from '../../../imageMap';
import { createChatCompletion } from '../../../core/services/llmService';
import ConfirmDialog from '../../../components/ConfirmDialog';
import ActiveBonusIndicator from '../../../components/ActiveBonusIndicator';
import { getToxicXPBonus } from '../../../core/systems/professionAbilities';

import oralImage from '../../../assets/oral.jpg';
import inhaledImage from '../../../assets/inhaled.jpg';
import topicalImage from '../../../assets/topical.jpg';
import { getPaymentMultiplier } from '../../../core/systems/professionAbilities';
import enemaImage from '../../../assets/enema.jpg';

function PrescribePopup({
  gameState = {},
  updateInventory,
  isOpen,
  onClose,
  currentPatient,
  addJournalEntry,
  conversationHistory = [],
  setHistoryOutput,
  setConversationHistory,
  setTurnNumber,
  toggleInventory,
  currentWealth,
  prescriptionType,
  handlePrescriptionOutcome,
  onPrescriptionComplete,
  advanceTime,
  setNpcInfo,
  setNpcImage,
  setNpcCaption,
  awardXP,
  awardSkillXP
}) {
  const { inventory = [] } = gameState;
  const [selectedItem, setSelectedItem] = useState(null);
  const [amount, setAmount] = useState(1);
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [simulatedOutput, setSimulatedOutput] = useState('');
  const [prescriptionPrompt, setPrescriptionPrompt] = useState('');
   const [selectedRoute, setSelectedRoute] = useState('');
   const [basePrice, setBasePrice] = useState(0);
     const [isEmoji, setIsEmoji] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPrescription, setPendingPrescription] = useState(null);

   const handleRouteSelect = (route) => {
    setSelectedRoute(route);
  };

  const normalizeImageKey = (key) => {
  return key.toLowerCase().replace(/[_\s]+/g, ''); // Remove underscores and spaces, convert to lowercase
};

  
  const routeImages = {
    Oral: oralImage,
    Inhaled: inhaledImage,
    Topical: topicalImage,
    Enema: enemaImage
  };


  // Update selectedItem when an item is dropped in
  useEffect(() => {
    if (selectedItem) {
      const updatedItem = inventory.find(
        i => i.name.toLowerCase() === selectedItem.name.toLowerCase()
      );
      if (updatedItem) {
        setSelectedItem(updatedItem); // Ensuring the updated item is set properly
        setBasePrice(updatedItem.price || 0); // Set the base price per drachm
        setPrice(updatedItem.price || 0); 
      }
    }
  }, [inventory, selectedItem]);

  // Automatically open inventory when the popup opens
  useEffect(() => {
    if (isOpen && toggleInventory) {
      toggleInventory(true);
    }
  }, [isOpen, toggleInventory]);

    // Automatically update the price when the amount changes
  useEffect(() => {
    setPrice(basePrice * amount);
  }, [amount, basePrice]);

  // Handle drop of item into prescription area
const [{ isOver }, drop] = useDrop({
  accept: ['inventoryItem', 'compoundItem'],
  drop: (item) => {
    const updatedItem = inventory.find(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (updatedItem) {
      setSelectedItem(updatedItem);
      setBasePrice(updatedItem.price || 0); 
      setPrice(updatedItem.price || 0);  // Auto-populate the price based on the dropped item's price
    } else {
      console.warn('Dropped item not found in inventory:', item);
    }
  },
  collect: (monitor) => ({
    isOver: !!monitor.isOver(),
  }),
});

  // Function to handle prescription
 const handlePrescribe = useCallback(async (item, amount, price, route) => {
    if (!currentPatient) {
      console.error("No patient or NPC selected for prescription");
      setHistoryOutput("Error: No patient or NPC selected for prescription.");
      return;
    }

    if (!route) {
      console.error("No route of administration selected");
      setHistoryOutput("Error: Please select a route of administration.");
      return;
    }

    // Apply Court Physician L15/L20 ability: High Society Connections (payment bonus)
    const paymentMultiplier = getPaymentMultiplier(
      gameState.chosenProfession,
      gameState.playerLevel,
      currentPatient
    );

    let adjustedPrice = price;
    if (paymentMultiplier > 1.0) {
      adjustedPrice = Math.floor(price * paymentMultiplier);
      console.log(`[Court Physician] High Society Connections bonus: ${price} → ${adjustedPrice} reales (${Math.round((paymentMultiplier - 1) * 100)}% bonus)`);
    }

    const npcName = currentPatient.name;
    const { location, time, date } = gameState;

     const diagnosis = currentPatient.diagnosis || 'Unknown diagnosis';
  const socialContext = currentPatient.socialContext || 'Unknown social context';
  const secret = currentPatient.secret || 'No known secret';

  console.log(`Social Context: ${socialContext}`);
  console.log(`Secret: ${secret}`);

    let prescriptionPrompt = '';

  // patient picking logic 
  if (npcName === 'Inquisitor Santiago Valdez') {
  if (prescriptionType === 'treatment') {
    // Special treatment prompt for the Inquisitor
    prescriptionPrompt = `
      Maria has administered ${amount} drachms of ${item.name} to Inquisitor Santiago Valdez via the ${route} route, attempting to treat his illness (syphilis). He has threatened violence if she fails or reveals his secret.
      This is a medical treatment rather than poison. Consider the appropriate dosage and the likely effects of the medicine.
      Using your extensive knowledge of early modern treatments and their effects, assess if the treatment will relieve his symptoms or cause dangerous side effects.
      Begin with a customized "headline" in h5 markdown font, either "Maria's treatment was successful. The condition of the Inquisitor improved." or "Maria's treatment failed. The condition of the Inquisitor worsened."
      Describe the sensory characteristics of the treatment, the Inquisitor's reaction, and the aftermath in 2-3 paragraphs. If the treatment is successful, the Inquisitor thanks Maria effusively and sends her on her way. If it failed, he arrests her for brujeria and jails her. Ensure historical accuracy regarding the type and effects of the treatment.
      Remember that this treatment is taking place in the personal residence of Valdez, not Maria's shop, and under extremely tense circumstances as the revelation of his syphilis would be catastrophic for him. There is notable tension and Maria wonders when the other shoe will drop - is her life at risk?
    `;
  } else if (prescriptionType === 'poison') {
    // Poison prompt for the Inquisitor
    prescriptionPrompt = `
      Maria has administered ${amount} drachms of ${item.name} to Inquisitor Santiago Valdez via the ${route} route, treating his secret illness (syphilis). He has brought her to his residence under threat of violence if she fails or reveals his secret.
      This is an attempt to poison him rather than cure his illness. Consider the dosage and potential lethality of the poison.
      Using your extensive knowledge of early modern poisons and their effects, determine if the dose is sufficient to kill without causing suspicion.
      Begin with a customized "headline" in h5 markdown font, either "Maria's poison was successful. The Inquisitor has died." or "Maria's poison failed. The Inquisitor survived."
      Describe the sensory characteristics of the poison, the Inquisitor's reaction, and the aftermath in 2-3 paragraphs. If the poison is successful, Maria slips away by darting into a servant's door and making her way to the street. If the poison fails, she is imprisoned by the Inquisitor, who is enraged. Ensure historical accuracy regarding the type and effects of the poison.
    `;
  }
} else if (npcName === 'Don Luis the Moneylender') {
  if (prescriptionType === 'treatment') {
    // Special treatment prompt for Don Luis
    prescriptionPrompt = `
      Maria has administered ${amount} drachms of ${item.name} to Don Luis via the ${route} route, attempting to treat his debt-related stress and physical ailments.
      This is a medical treatment rather than poison. Consider the appropriate dosage and the likely effects of the medicine.
      Begin with a customized "headline" in h5 markdown font, either "Maria's treatment was successful. Don Luis's condition improved." or "Maria's treatment failed. Don Luis's condition worsened."
      Describe the sensory characteristics of the treatment, Don Luis's reaction, and the aftermath in 2-3 paragraphs. If the treatment is successful, Don Luis agrees to reduce or eliminate your debt in gratitude (the amount he reduces is based on how well it succeeds). If it failed, he threatens further consequences.
      Ensure historical accuracy regarding the type and effects of the treatment.
    `;
  } else if (prescriptionType === 'poison') {
    // Special poison prompt for Don Luis
    prescriptionPrompt = `
      Maria has administered ${amount} drachms of ${item.name} to Don Luis via the ${route} route, intending to poison him rather than treat his ailments.
      Consider the dosage and potential lethality of the poison.
      Using your extensive knowledge of early modern poisons and their effects, determine if the dose is sufficient to kill without causing suspicion.
      Begin with a customized "headline" in h5 markdown font, either "Maria's poison was successful. Don Luis has died." or "Maria's poison failed. Don Luis survived."
      Describe the sensory characteristics of the poison, Don Luis's reaction, and the aftermath in 2-3 paragraphs. If the poison is successful, Maria slips away unnoticed. If it fails, Don Luis threatens her life or demands immediate repayment.
      Ensure historical accuracy regarding the type and effects of the poison.
    `;
  }
} else if (prescriptionType === 'treatment' || currentPatient.type === 'patient') {
  // General treatment prompt for other NPCs
  prescriptionPrompt = `
    Maria has administered ${amount} drachms of ${item.name} via the ${route} route for ${price} silver coins to ${npcName}.
    The transaction occurred at ${time} on ${date}, in ${location}. (This is context and should not be restated to the player.)
    Diagnosis: ${diagnosis}
    Social Context: ${socialContext}
    Secret: ${secret}
    Maria's current wealth is ${currentWealth} silver coins.

    Using your knowledge of early modern medicine, humoral theory, and human biology (and incorporating information from the NPC's secret, social context, and diagnosis), assess the safety and effectiveness of this prescription. Consider both immediate and long-term effects of the medicine. Focus on the dosage, toxicity, and health condition of the NPC, ensuring the response is naturalistic and varied based on the substance and method of delivery. Some prescriptions can cause an NPC to die or suffer disabling complications, but not every instance should result in severe side effects such as nausea unless appropriate. Most treatments, however, will fail in various ways.

    Be unsparing, detailed, and realistic in your descriptions. Avoid excessive nausea or vomiting for relatively benign substances like wine, chamomile, or lightly infused herbal remedies unless administered in excess or combined with other dangerous factors. Instead, consider other common reactions in early modern medicine, such as mild discomfort, temporary relief, or no reaction at all. If a treatment is historically known for purging, do not shy away from those reactions, but balance it with other possibilities based on the patient's condition. 

    Consider reactions like:
    - If a drug causes purging (such as vomiting or diarrhea), describe it in vivid, unsparing and graphically realistic sensory detail, but ensure that only substances known for their toxicity or purgative qualities cause such effects.
    - If a prescription causes discomfort or irritation (e.g., an unpleasant taste, slight dizziness), show those effects while emphasizing sensory characteristics like taste, smell, and texture.
    - If the treatment is ineffective, focus on disappointment or resignation in the patient's response. Comments like "I should go to a real physician and be bled" or "I expected more from this treatment" could reflect their frustration. Directly utilize their ${socialContext} and ${secret} to craft their personalized reaction.

    Always be realistic: 
    - Substances like chamomile, sugar, rose water, or wine will not cause serious complications in normal doses. These should produce milder reactions (or no reaction) unless combined with other dangerous factors or taken in excessive amounts.
    - Medications like saffron or wine might give a mildly pleasant or ineffective result, rather than cause harm. More dangerous substances like mercury, opium, and other potent compounds, especially in higher doses or certain delivery methods (like inhalation or enema), should be treated with the appropriate severity. Patients often proclaim opium or opioids and alcoholic cures to be far more effective than they actually are. Inhaled mercury (quicksilver) or mercury products ALWAYS kills a patient in ALL circumstances. 

    Begin your output with a clear and concise **headline** that summarizes your assessment of the prescription. For significant results, add a SINGLE emoji to symbolize the main message at the end. Use appropriate markdown formatting as follows:

    - **h3 markdown**: Use h3 markdown tags (###) for headlines where the effects are neutral, positive, or only slightly negative. For example, you might write: 
      ### Maria attempted an unconventional treatment that was somewhat effective ⚖
      or
      ### The prescription was unpleasant but highly effective
      or
      ### The patient felt neutral effects ⚖️
      or ### The patient felt better - the treatment worked well.
      Or many others of your choice. 

    - **h5 markdown**: Use h5 markdown tags (#####) for headlines where the patient has suffered **serious harm** or a **fatal reaction**. When using h5:
      - If the patient **died**, always start with: ##### 💀 The patient has died! 💀
      - For more minor injuries, use something like:
        ##### The prescription seems to have failed... 
      - Be realistic about death and harm: some outcomes should reflect mild discomfort, but not all treatments should lead to nausea or purging unless the medicine calls for it.

    ### Patient Reactions:
    After the headline, describe the patient's experience over a period of three hours in 2 highly detailed paragraphs that emphasize vivid, historically authentic characterization and finely observed details:
    - Focus on the **sensory characteristics** of the medicine (e.g., taste, smell, texture). Always mention the route of administration and give specifics about how it was applied.
    - Show how the patient reacts to the prescribed dose, including the price. Reactions might range from a miraculous cure to mild discomfort, satisfaction, or a complete lack of effect. Purging, nausea, and more severe reactions should occur based on specific medicinal properties or improper dosage, but should not be the default response.
    - Describe the **perceived effects** of the medicine on the patient's health, and when appropriate, consider early modern concepts like humoral balance (hot, cold, wet, dry qualities). For example, if the patient suffers from a cold, damp ailment, the medicine may dry or heat them, bringing relief.
    - For toxic or fatal doses, be explicit about the timeline of worsening symptoms or death.

    ### Dosage & Effects:
    - One drachm of most medicines is usually safe, but two or more drachms of highly toxic substances (like quicksilver or laudanum) could lead to fatal outcomes. If the dose is fatal, show the NPC dying.
    - Benign things like wine, rose water, and other lightly infused or sugared medicines should not cause serious complications unless taken in excess or with aggravating factors.
    - Topical prescriptions (e.g., poultices or salves) are almost always well tolerated and effective for external ailments like wounds. For internal ailments, their effectiveness might be limited but not harmful.
    - Consider the patient's weight, health, and the route of administration in assessing whether a dose is fatal or highly toxic. Potent drugs like mercury, opium, or alchemical compounds should be dangerous in large doses, while other remedies are more likely to have mild effects.

    Following the description, include a historically authentic quote or proverb that reflects the situation. Rate the prescription with a score out of 10 (10=best possible prescription choice, 1=worst possible). At the end of the response, provide a summary of Maria's wealth, status, reputation, and the time (remember that at least four hours have passed) in **this exact format**:

    *Now Maria has ${currentWealth + adjustedPrice} silver coins. She is feeling [single word status]. Her reputation is [emoji]. The time is now # AM (or PM), xx [month] [year].*
    
    **Reputation Emoji Guide:**
    - 😡 (1) : Extremely bad (e.g., patient dies)
    - 😠 (2) : Very bad (e.g., severe complications)
    - 😐 (3) : Neutral (e.g., treatment is ineffective but not harmful)
    - 🙂 (5) : Positive (e.g., minor positive effects)
    - 😇 (9) : Excellent (e.g., miraculous cure)
    - 👑 (10) : Outstanding (e.g., near-mythical healing)
  `;
} else if (prescriptionType === 'poison') {
  // General poison prompt for other NPCs
  prescriptionPrompt = `
    Maria has secretly administered ${amount} drachms of ${item.name} to ${npcName}.
    This is an attempt to poison them rather than cure any illness. Consider the dosage and potential lethality of the poison.
    Using your extensive knowledge of early modern poisons and their effects, determine if the dose is sufficient to kill without causing suspicion.
    Begin with a customized "headline" in h3 markdown font, such as "Maria successfully poisoned ${npcName}" or "The poison had unintended effects." If the poison kills the NPC, use h5 tags with "${npcName} has died!".
    Describe the sensory characteristics of the poison, the NPC's reaction, and the aftermath in 2-3 paragraphs. Ensure historical accuracy regarding the type and effects of the poison.
    After documenting the effects, provide a final line tracking Maria's updated wealth, status, reputation, and the date and time at the VERY END of your response, displayed in bold, as explained below. ALWAYS PROGRESS TIME BY AT LEAST THREE TO FOUR HOURS.

    *Now Maria has [integer] silver coins (${currentWealth} + ${adjustedPrice} = ${currentWealth + adjustedPrice}). She is feeling [single word status]. Her reputation is [emoji]. The time is now # AM (or PM), xx [month] [year].*
  `;
} else {
  // Fallback prompt
  prescriptionPrompt = `
   Maria has administered ${amount} drachms of ${item.name} via the ${route} route for ${price} silver coins to ${npcName}.
    The transaction occurred at ${time} on ${date}, in ${location}. (This is context and should not be restated to the player.)
    Diagnosis: ${diagnosis}
    Social Context: ${socialContext}
    Secret: ${secret}
    Maria's current wealth is ${currentWealth} silver coins.

    Using your knowledge of early modern medicine, humoral theory, and human biology (and incorporating information from the NPC's secret, social context, and diagnosis), assess the safety and effectiveness of this prescription. Consider both immediate and long-term effects of the medicine. Focus on the dosage, toxicity, and health condition of the NPC, ensuring the response is naturalistic and varied based on the substance and method of delivery. Some prescriptions can cause an NPC to die or suffer disabling complications, but not every instance should result in severe side effects such as nausea unless appropriate.

    Be unsparing, detailed, and realistic in your descriptions. Avoid excessive nausea or vomiting for relatively benign substances like wine, chamomile, or lightly infused herbal remedies unless administered in excess or combined with other dangerous factors. Instead, consider other common reactions in early modern medicine, such as mild discomfort, temporary relief, or no reaction at all. If a treatment is historically known for purging, do not shy away from those reactions, but balance it with other possibilities based on the patient's condition. 

    Consider reactions like:
    - If a drug causes purging (such as vomiting or diarrhea), describe it in vivid, unsparing and graphically realistic sensory detail, but ensure that only substances known for their toxicity or purgative qualities cause such effects.
    - If a prescription causes discomfort or irritation (e.g., an unpleasant taste, slight dizziness), show those effects while emphasizing sensory characteristics like taste, smell, and texture.
    - If the treatment is ineffective, focus on disappointment or resignation in the patient's response. Comments like "I should go to a real physician and be bled" or "I expected more from this treatment" could reflect their frustration. Directly utilize their ${socialContext} and ${secret} to craft their personalized reaction.

    Always be realistic: 
    - Substances like chamomile, sugar, rose water, or wine will not cause serious complications in normal doses. These should produce milder reactions (or no reaction) unless combined with other dangerous factors or taken in excessive amounts.
    - Medications like saffron or wine might give a mildly pleasant or ineffective result, rather than cause harm. More dangerous substances like mercury, opium, and other potent compounds, especially in higher doses or certain delivery methods (like inhalation or enema), should be treated with the appropriate severity. Patients often proclaim opium or opioids and alcoholic cures to be far more effective than they actually are. Inhaled mercury (quicksilver) or mercury products ALWAYS kills a patient in ALL circumstances. 

    Begin your output with a clear and concise **headline** that summarizes your assessment of the prescription. For significant results, add a SINGLE emoji to symbolize the main message at the end. Use appropriate markdown formatting as follows:

    - **h3 markdown**: Use h3 markdown tags (###) for headlines where the effects are neutral, positive, or only slightly negative. For example, you might write: 
      ### Maria attempted an unconventional treatment that was somewhat effective ⚖
      or
      ### The prescription was unpleasant but highly effective
      or
      ### The patient felt neutral effects ⚖️
      or ### The patient felt better - the treatment worked well.
      Or many others of your choice. 

    - **h5 markdown**: Use h5 markdown tags (#####) for headlines where the patient has suffered **serious harm** or a **fatal reaction**. When using h5:
      - If the patient **died**, always start with: ##### 💀 The patient has died! 💀
      - For more minor injuries, use something like:
        ##### The prescription seems to have failed... 
      - Be realistic about death and harm: some outcomes should reflect mild discomfort, but not all treatments should lead to nausea or purging unless the medicine calls for it.

    ### Patient Reactions:
    After the headline, describe the patient's experience over a period of three hours in 2 highly detailed paragraphs that emphasize vivid, historically authentic characterization and finely observed details:
    - Focus on the **sensory characteristics** of the medicine (e.g., taste, smell, texture). Always mention the route of administration and give specifics about how it was applied.
    - Show how the patient reacts to the prescribed dose, including the price. Reactions might range from a miraculous cure to mild discomfort, satisfaction, or a complete lack of effect. Purging, nausea, and more severe reactions should occur based on specific medicinal properties or improper dosage, but should not be the default response.
    - Describe the **perceived effects** of the medicine on the patient's health, and when appropriate, consider early modern concepts like humoral balance (hot, cold, wet, dry qualities). For example, if the patient suffers from a cold, damp ailment, the medicine may dry or heat them, bringing relief.
    - For toxic or fatal doses, be explicit about the timeline of worsening symptoms or death.

    ### Dosage & Effects:
    - One drachm of most medicines is usually safe, but two or more drachms of highly toxic substances (like quicksilver or laudanum) could lead to fatal outcomes. If the dose is fatal, show the NPC dying.
    - Benign things like wine, rose water, and other lightly infused or sugared medicines should not cause serious complications unless taken in excess or with aggravating factors.
    - Topical prescriptions (e.g., poultices or salves) are almost always well tolerated and effective for external ailments like wounds. For internal ailments, their effectiveness might be limited but not harmful.
    - Consider the patient's weight, health, and the route of administration in assessing whether a dose is fatal or highly toxic. Potent drugs like mercury, opium, or alchemical compounds should be dangerous in large doses, while other remedies are more likely to have mild effects.

    Following the description, include a historically authentic quote or proverb that reflects the situation. Rate the prescription with a score out of 10 (10=best possible prescription choice, 1=worst possible). At the end of the response, provide a summary of Maria's wealth, status, reputation, and the time (remember that at least four hours have passed) in **this exact format**:

    *Now Maria has ${currentWealth + adjustedPrice} silver coins. She is feeling [single word status]. Her reputation is [emoji]. The time is now # AM (or PM), xx [month] [year].*
  `;
}

// Set the generated prescription prompt
setPrescriptionPrompt(prescriptionPrompt);

    try {
      setIsLoading(true);
      const messages = [
        ...(conversationHistory || []),
        { role: 'user', content: prescriptionPrompt }
      ];

      const data = await createChatCompletion(messages, 0.8);
      const simulatedOutput = data.choices[0].message.content;
      setSimulatedOutput(simulatedOutput);

      // Handle inventory updates and journal entry
     updateInventory(item.name, -amount);

         // Update NPC portrait based on the current patient details
if (currentPatient) {
  const npcImageKey = normalizeImageKey(currentPatient.name);

  // Determine the appropriate image from the imageMap
  let selectedImage = imageMap[npcImageKey]?.src;
  if (!selectedImage) {
    console.warn(`No matching image found for key: ${npcImageKey}. Falling back to default.`);
    selectedImage = imageMap['default']?.src; // Use default NPC image or Maria's normal image as a last resort
  }

  console.log("Selected NPC Image Key:", npcImageKey);
  console.log("Selected Image Path:", selectedImage);

  // Set NPC image
  setNpcImage(selectedImage);
  setIsEmoji(false);  // Assuming the image is not an emoji here, change logic if emojis are possible

  // Set NPC caption and description
  const npcCaption = `The prescription of ${currentPatient.name}`;
  setNpcCaption(npcCaption);
  setNpcInfo(currentPatient.description || 'No additional information available.');
}

    // Now make a second API call to generate a journal summary 
    const summaryPrompt = `
      Please summarize the following text with an overall summary of "Result: [emoji] [single word summing it up." Then add one sentence with a succinct, basic summary of what happened, but with vivid details for instance it should say exactly what the complications or impact was. 
      Emoji guidance: use one of the following emojis as appropriate to represent the result (💀 for death, 🩸 for injury, ✨ for miraculous cure, 😡 for a patient walking out due to price, 🤢 for marked nauseau or disgust or minor toxicity, 😐 if ineffective, 💸 for an extremely valuable prescription, 🚪 for when a patient leaves unhappy.). Also include the score out of 10. The summary should reflect the patient's response:
      ${simulatedOutput}
    `;

    const summaryMessages = [
      { role: 'user', content: summaryPrompt }
    ];

    const summaryData = await createChatCompletion(summaryMessages, 0.4);
    const journalSummary = summaryData.choices[0].message.content.trim();

    console.log("Current Patient Details:", currentPatient);

    // Award XP based on prescription outcome
    if (typeof awardXP === 'function') {
      // Parse journal summary to determine outcome
      let xpAmount = 15; // Default for neutral outcomes

      if (journalSummary.includes('✨') || journalSummary.includes('💸') || journalSummary.includes('😇')) {
        xpAmount = 25; // Excellent outcome
      } else if (journalSummary.includes('💀') || journalSummary.includes('😡') || journalSummary.includes('🩸')) {
        xpAmount = 5; // Poor outcome
      }

      // Apply Poisoner L10/L30 ability: Poison Knowledge (bonus XP for toxic substances)
      const toxicBonus = getToxicXPBonus(gameState.chosenProfession, gameState.playerLevel, item.name);
      if (toxicBonus > 1.0) {
        xpAmount = Math.floor(xpAmount * toxicBonus);
        console.log(`[Poisoner] Toxic substance bonus applied: ${toxicBonus}x XP`);
      }

      awardXP(xpAmount, `patient_healing_${npcName}`);
      console.log(`[XP] Awarded ${xpAmount} XP for prescription to ${npcName}`);
    }

    // Award pharmacy skill XP
    if (typeof awardSkillXP === 'function') {
      let pharmacyXP = 5;

      // Apply Poisoner toxic substance bonus to skill XP as well
      const toxicBonus = getToxicXPBonus(gameState.chosenProfession, gameState.playerLevel, item.name);
      if (toxicBonus > 1.0) {
        pharmacyXP = Math.floor(pharmacyXP * toxicBonus);
      }

      awardSkillXP('pharmacy', pharmacyXP);
    }

 // Safeguard before adding journal entry
    if (typeof addJournalEntry === 'function') {
      addJournalEntry(`℞ Maria prescribed ${amount} drachms of **${item.name}** for **${adjustedPrice} reales** to **${npcName}** via the ${route} route. ${journalSummary}`);
    } else {
      console.warn('addJournalEntry is not a function. Skipping journal entry.');
    }

  } catch (error) {
    console.error("Error during prescription:", error);

  } finally {
    setIsLoading(false);
  }
}, [currentPatient, conversationHistory, gameState, updateInventory, addJournalEntry, currentWealth, prescriptionType, handlePrescriptionOutcome]);

 const handlePrescribeClick = async () => {
    if (!selectedRoute) {
      alert("Please select a route of administration.");
      return;
    }

    if (selectedItem && selectedRoute) {
      // Check if this is an expensive or potentially dangerous prescription
      const isExpensive = price >= 5;
      const isDangerous = prescriptionType === 'poison' ||
                          currentPatient?.name === 'Inquisitor Santiago Valdez';

      if (isExpensive || isDangerous) {
        // Show confirmation dialog for expensive/dangerous treatments
        setPendingPrescription({ selectedItem, amount, price, selectedRoute });
        setShowConfirmDialog(true);
      } else {
        // Proceed directly for cheap, safe treatments
        setIsLoading(true);
        await handlePrescribe(selectedItem, amount, price, selectedRoute);
        setIsLoading(false);
        onClose();
        setIsSummaryOpen(true);
      }
    }
  };

  const handleConfirmPrescription = async () => {
    if (pendingPrescription) {
      const { selectedItem, amount, price, selectedRoute } = pendingPrescription;
      setIsLoading(true);
      await handlePrescribe(selectedItem, amount, price, selectedRoute);
      setIsLoading(false);
      onClose();
      setIsSummaryOpen(true);
      setPendingPrescription(null);
    }
  };

  // Modify the function that handles the outcome after PrescribePopup
const handleSummaryContinue = () => {
  setIsSummaryOpen(false);
  setHistoryOutput(simulatedOutput);

   // Ensure journal agent gets the updated time from the prescription
   const updatedTime = gameState.time; // Use the updated time after prescription
   const updatedDate = gameState.date; // Make sure the date is also updated

   // Pass this updated information to journalagent.js for processing
   advanceTime({ time: updatedTime, date: updatedDate });
  
  // Notify the parent component that the prescription is complete
  if (typeof onPrescriptionComplete === 'function') {
    onPrescriptionComplete(simulatedOutput);
  }

  setConversationHistory(prev => [
    ...prev,
    { role: 'user', content: prescriptionPrompt },
    { role: 'assistant', content: simulatedOutput },
  ]);

  setTurnNumber(prev => prev + 1);
  toggleInventory(false);
  setSelectedItem(null);
  setAmount(1);
  setPrice(0);
};


 return (
  <>
   {isOpen && !isSummaryOpen && (
  <>
    {/* Add the darkened overlay */}
    <div className="popup-overlay" />

    <div className={`prescribe-popup ${isLoading ? 'loading' : ''} ${prescriptionType === 'poison' ? 'poisoning' : 'normal'}`}>
      <div className="prescribe-content">
        <h2>🧪 Prescribe a Medicine</h2>

        {/* Active Profession Bonuses */}
        <ActiveBonusIndicator
          context="prescribing"
          profession={gameState.chosenProfession}
          playerLevel={gameState.playerLevel}
          additionalData={{
            itemName: selectedItem?.name,
            patientType: currentPatient?.type
          }}
        />

        <div ref={drop} className={`prescription-area ${isOver ? 'drag-over' : ''}`}>
          {selectedItem ? (
            <div className="selected-item">
              <span className="emoji">{selectedItem.emoji || '❓'}</span>
              <span>{selectedItem.name}</span>
              {selectedRoute && (
                <p className="selected-route"><i>{selectedRoute}</i></p>
              )}
            </div>
          ) : (
            <p>Drag an item here from the inventory to prescribe. And don't forget to set a price and select a route of administration!</p>
          )}
        </div>
        <div className="prescription-controls">
          <label>
            Amount (drachms):
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                const newAmount = Number(e.target.value);
                // Ensure the amount is never less than 1
                setAmount(newAmount < 1 ? 1 : newAmount);
              }}
              min="1"
            />
          </label>
          <label>
            Price (silver reales):
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min="0"
            />
          </label>
        </div>
        <div className="route-selection">
          <label>Select a route of administration:</label>
          <div className="route-buttons">
            {Object.entries(routeImages).map(([route, image]) => (
              <button
                key={route}
                className={`route-button ${selectedRoute === route ? 'selected' : ''}`}
                onClick={() => setSelectedRoute(route)}
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <span>{route}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="prescription-buttons">
          <button onClick={handlePrescribeClick} disabled={!selectedItem || isLoading}>
            {isLoading ? 'Prescribing...' : 'Prescribe'}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  </>
)}


      {isSummaryOpen && (
         <div className="popup-overlay">
    <div className="popup-content summary-popup" onClick={(e) => e.stopPropagation()}>
      <h2 className="summary-title">Prescription Summary</h2>
      <p>
        Maria administered {amount} drachms of {selectedItem?.name} via the {selectedRoute} route for {price} reales.
        She waits expectantly to see what effect her treatment will have...

      </p>

            <h1 className="medieval-header">
              <span>{selectedItem?.name || 'Unknown Item'}</span>
              <br />
              <span className="spanish-name">({selectedItem?.spanishName || 'No Spanish name'})</span>
            </h1>

            <div className="item-emoji" style={{ fontSize: '4rem', textAlign: 'center' }}>
              {selectedItem?.emoji || '🍵'}
            </div>

            <p style={{ fontSize: '1.4rem', fontStyle: 'italic', textAlign: 'center', marginBottom: '15px' }}>
              {selectedItem?.latinName || 'No Latin name available'}
            </p>

            <p><strong>Humoral Qualities:</strong> {selectedItem?.humoralQualities || 'Unknown'}</p>
            <p><strong>Medicinal Effects:</strong> {selectedItem?.medicinalEffects || 'No known effects'}</p>
            <p>{selectedItem?.description || 'No description available'}</p>

            <button onClick={handleSummaryContinue}>Continue</button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Expensive/Dangerous Prescriptions */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setPendingPrescription(null);
        }}
        onConfirm={handleConfirmPrescription}
        title={prescriptionType === 'poison' ? 'Confirm Poisoning' : 'Confirm Prescription'}
        message={
          prescriptionType === 'poison'
            ? `Are you sure you want to administer ${pendingPrescription?.amount} drachm(s) of ${pendingPrescription?.selectedItem?.name} as poison to ${currentPatient?.name}? This action could be deadly and irreversible.`
            : `Are you sure you want to prescribe ${pendingPrescription?.amount} drachm(s) of ${pendingPrescription?.selectedItem?.name} to ${currentPatient?.name} for ${pendingPrescription?.price} reales? This is an expensive treatment.`
        }
        confirmText={prescriptionType === 'poison' ? 'Administer Poison' : 'Prescribe'}
        cancelText="Cancel"
        type={prescriptionType === 'poison' ? 'danger' : 'warning'}
      />
    </>
  );
}

export default PrescribePopup;
