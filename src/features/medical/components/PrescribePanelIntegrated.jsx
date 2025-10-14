/**
 * PrescribePanelIntegrated - Inline Prescription Panel for Patient View
 * Parchment/glassomorphic aesthetic with 17th century themingAdapted from PrescribePopup for vertical column layout
 * Preserves all game logic while fitting in Patient View right column
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { createChatCompletion } from '../../../core/services/llmService';
import ConfirmDialog from '../../../components/ConfirmDialog';
import PrescriptionOutcomeModal from './PrescriptionOutcomeModal';

import oralImage from '../../../assets/oral.jpg';
import inhaledImage from '../../../assets/inhaled.jpg';
import topicalImage from '../../../assets/topical.jpg';
import enemaImage from '../../../assets/enema.jpg';

function PrescribePanelIntegrated({
  gameState = {},
  updateInventory,
  onClose,
  currentPatient,
  addJournalEntry,
  conversationHistory = [],
  setHistoryOutput,
  setConversationHistory,
  setTurnNumber,
  currentWealth,
  prescriptionType = 'treatment',
  handlePrescriptionOutcome,
  onPrescriptionComplete, // Called when user accepts outcome and returns to narrative
  onPrescriptionPending, // Called when prescription starts processing
  advanceTime,
  theme = 'light',
  transactionManager,
  TRANSACTION_CATEGORIES
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPrescription, setPendingPrescription] = useState(null);
  const [justDropped, setJustDropped] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);

  const routeImages = {
    Oral: oralImage,
    Inhaled: inhaledImage,
    Topical: topicalImage,
    Enema: enemaImage
  };

  // Open modal after simulatedOutput is set
  useEffect(() => {
    if (pendingModalOpen && simulatedOutput && prescriptionData) {
      console.log('[PrescribePanelIntegrated] Opening modal via useEffect', {
        simulatedOutputLength: simulatedOutput.length,
        hasPrescriptionData: !!prescriptionData
      });
      setShowOutcomeModal(true);
      setPendingModalOpen(false);
    }
  }, [pendingModalOpen, simulatedOutput, prescriptionData]);

  // Update selectedItem when inventory changes
  useEffect(() => {
    if (selectedItem) {
      const updatedItem = inventory.find(
        i => i.name.toLowerCase() === selectedItem.name.toLowerCase()
      );
      if (updatedItem) {
        setSelectedItem(updatedItem);
        setBasePrice(updatedItem.price || 0);
        setPrice(updatedItem.price || 0);
      }
    }
  }, [inventory, selectedItem]);

  // Update price when amount changes
  useEffect(() => {
    setPrice(basePrice * amount);
  }, [amount, basePrice]);

  // Handle drop of item into prescription area
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['INVENTORY_ITEM', 'inventoryItem', 'compoundItem'],
    drop: (item) => {
      const updatedItem = inventory.find(i => i.name.toLowerCase() === item.name.toLowerCase());
      if (updatedItem) {
        setSelectedItem(updatedItem);
        setBasePrice(updatedItem.price || 0);
        setPrice(updatedItem.price || 0);

        // Trigger drop animation
        setJustDropped(true);
        setTimeout(() => setJustDropped(false), 600);
      } else {
        console.warn('Dropped item not found in inventory:', item);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Main prescription handler (preserves all game logic from PrescribePopup)
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

    const npcName = currentPatient.name;
    const { location, time, date } = gameState;
    const diagnosis = currentPatient.diagnosis || 'Unknown diagnosis';
    const socialContext = currentPatient.socialContext || 'Unknown social context';
    const secret = currentPatient.secret || 'No known secret';

    let prescriptionPrompt = '';

    // Inquisitor scenario
    if (npcName === 'Inquisitor Santiago Valdez') {
      if (prescriptionType === 'treatment') {
        prescriptionPrompt = `
      Maria has administered ${amount} drachms of ${item.name} to Inquisitor Santiago Valdez via the ${route} route, attempting to treat his illness (syphilis). He has threatened violence if she fails or reveals his secret.
      This is a medical treatment rather than poison. Consider the appropriate dosage and the likely effects of the medicine.
      Using your extensive knowledge of early modern treatments and their effects, assess if the treatment will relieve his symptoms or cause dangerous side effects.
      Begin with a customized "headline" in h5 markdown font, either "Maria's treatment was successful. The condition of the Inquisitor improved." or "Maria's treatment failed. The condition of the Inquisitor worsened."
      Describe the sensory characteristics of the treatment, the Inquisitor's reaction, and the aftermath in 2-3 paragraphs. If the treatment is successful, the Inquisitor thanks Maria effusively and sends her on her way. If it failed, he arrests her for brujeria and jails her. Ensure historical accuracy regarding the type and effects of the treatment.
      Remember that this treatment is taking place in the personal residence of Valdez, not Maria's shop, and under extremely tense circumstances as the revelation of his syphilis would be catastrophic for him. There is notable tension and Maria wonders when the other shoe will drop - is her life at risk?
    `;
      } else if (prescriptionType === 'poison') {
        prescriptionPrompt = `
      Maria has administered ${amount} drachms of ${item.name} to Inquisitor Santiago Valdez via the ${route} route, treating his secret illness (syphilis). He has brought her to his residence under threat of violence if she fails or reveals his secret.
      This is an attempt to poison him rather than cure his illness. Consider the dosage and potential lethality of the poison.
      Using your extensive knowledge of early modern poisons and their effects, determine if the dose is sufficient to kill without causing suspicion.
      Begin with a customized "headline" in h5 markdown font, either "Maria's poison was successful. The Inquisitor has died." or "Maria's poison failed. The Inquisitor survived."
      Describe the sensory characteristics of the poison, the Inquisitor's reaction, and the aftermath in 2-3 paragraphs. If the poison is successful, Maria slips away by darting into a servant's door and making her way to the street. If the poison fails, she is imprisoned by the Inquisitor, who is enraged. Ensure historical accuracy regarding the type and effects of the poison.
    `;
      }
    }
    // Don Luis scenario
    else if (npcName === 'Don Luis the Moneylender') {
      if (prescriptionType === 'treatment') {
        prescriptionPrompt = `
      Maria has administered ${amount} drachms of ${item.name} to Don Luis via the ${route} route, attempting to treat his debt-related stress and physical ailments.
      This is a medical treatment rather than poison. Consider the appropriate dosage and the likely effects of the medicine.
      Begin with a customized "headline" in h5 markdown font, either "Maria's treatment was successful. Don Luis's condition improved." or "Maria's treatment failed. Don Luis's condition worsened."
      Describe the sensory characteristics of the treatment, Don Luis's reaction, and the aftermath in 2-3 paragraphs. If the treatment is successful, Don Luis agrees to reduce or eliminate your debt in gratitude (the amount he reduces is based on how well it succeeds). If it failed, he threatens further consequences.
      Ensure historical accuracy regarding the type and effects of the treatment.
    `;
      } else if (prescriptionType === 'poison') {
        prescriptionPrompt = `
      Maria has administered ${amount} drachms of ${item.name} to Don Luis via the ${route} route, intending to poison him rather than treat his ailments.
      Consider the dosage and potential lethality of the poison.
      Using your extensive knowledge of early modern poisons and their effects, determine if the dose is sufficient to kill without causing suspicion.
      Begin with a customized "headline" in h5 markdown font, either "Maria's poison was successful. Don Luis has died." or "Maria's poison failed. Don Luis survived."
      Describe the sensory characteristics of the poison, Don Luis's reaction, and the aftermath in 2-3 paragraphs. If the poison is successful, Maria slips away unnoticed. If it fails, Don Luis threatens her life or demands immediate repayment.
      Ensure historical accuracy regarding the type and effects of the poison.
    `;
      }
    }
    // General treatment
    else if (prescriptionType === 'treatment' || currentPatient.type === 'patient') {
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

    - **h5 markdown**: Use h5 markdown tags (#####) for headlines where the patient has suffered **serious harm** or a **fatal reaction**. When using h5:
      - If the patient **died**, always start with: ##### 💀 The patient has died! 💀
      - For more minor injuries, use something like: ##### The prescription seems to have failed...

    ### Patient Reactions:
    After the headline, describe the patient's experience over a period of three hours in 2 highly detailed paragraphs that emphasize vivid, historically authentic characterization and finely observed details:
    - Focus on the **sensory characteristics** of the medicine (e.g., taste, smell, texture). Always mention the route of administration and give specifics about how it was applied.
    - Show how the patient reacts to the prescribed dose, including the price. Reactions might range from a miraculous cure to mild discomfort, satisfaction, or a complete lack of effect.
    - Describe the **perceived effects** of the medicine on the patient's health, and when appropriate, consider early modern concepts like humoral balance (hot, cold, wet, dry qualities).

    ### Dosage & Effects:
    - One drachm of most medicines is usually safe, but two or more drachms of highly toxic substances (like quicksilver or laudanum) could lead to fatal outcomes.
    - Benign things like wine, rose water, and other lightly infused or sugared medicines should not cause serious complications unless taken in excess.
    - Topical prescriptions are almost always well tolerated and effective for external ailments.

    Following the description, include a historically authentic quote or proverb that reflects the situation. Rate the prescription with a score out of 10 (10=best possible prescription choice, 1=worst possible). At the end of the response, provide a summary of Maria's wealth, status, reputation, and the time (remember that at least four hours have passed) in **this exact format**:

    *Now Maria has ${currentWealth + price} silver coins. She is feeling [single word status]. Her reputation is [emoji]. The time is now # AM (or PM), xx [month] [year].*

    **Reputation Emoji Guide:**
    - 😡 (1) : Extremely bad (e.g., patient dies)
    - 😠 (2) : Very bad (e.g., severe complications)
    - 😐 (3) : Neutral (e.g., treatment is ineffective but not harmful)
    - 🙂 (5) : Positive (e.g., minor positive effects)
    - 😇 (9) : Excellent (e.g., miraculous cure)
    - 👑 (10) : Outstanding (e.g., near-mythical healing)
  `;
    }
    // General poison
    else if (prescriptionType === 'poison') {
      prescriptionPrompt = `
    Maria has secretly administered ${amount} drachms of ${item.name} to ${npcName}.
    This is an attempt to poison them rather than cure any illness. Consider the dosage and potential lethality of the poison.
    Using your extensive knowledge of early modern poisons and their effects, determine if the dose is sufficient to kill without causing suspicion.
    Begin with a customized "headline" in h5 markdown font, either "Maria's poison was successful. ${npcName} has died." or "Maria's poison failed. ${npcName} survived."
    Describe the sensory characteristics of the poison, the patient's reaction, and the aftermath in 2-3 paragraphs.
    Ensure historical accuracy regarding the type and effects of the poison.
  `;
    }

    setPrescriptionPrompt(prescriptionPrompt);

    // Store prescription data for the modal
    setPrescriptionData({
      item,
      amount,
      price,
      route
    });

    try {
      setIsLoading(true);

      // Notify parent that prescription is pending (triggers blue card in narration and switches to chronicle tab)
      if (onPrescriptionPending) {
        onPrescriptionPending({
          patient: currentPatient,
          item,
          amount,
          price,
          route
        });
      }

      // Small delay to allow tab transition to complete before generating
      await new Promise(resolve => setTimeout(resolve, 300));

      const messages = [
        ...(conversationHistory || []),
        { role: 'user', content: prescriptionPrompt }
      ];

      const data = await createChatCompletion(messages, 0.8);
      const simulatedOutput = data.choices[0].message.content;
      setSimulatedOutput(simulatedOutput);

      // Add to conversation history IMMEDIATELY (so LLM knows about prescription)
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: prescriptionPrompt },
        { role: 'assistant', content: simulatedOutput },
        { role: 'system', content: `*[PRESCRIPTION ADMINISTERED] Prescribed ${amount} ${item.name} to ${currentPatient.name} via ${route} route.*` }
      ]);

      // Update history output immediately so it appears in chronicle
      setHistoryOutput(`℞ **Prescription Administered**: You prescribed ${amount} ${item.name} to ${currentPatient.name} via ${route} route. Processing outcome...`);

      // Increment turn number so prescription appears as separate chronicle entry
      setTurnNumber(prev => prev + 1);

      // Update inventory
      updateInventory(item.name, -amount);

      // Generate journal summary
      const summaryPrompt = `
      Please summarize the following text with an overall summary of "Result: [emoji] [single word summing it up." Then add one sentence with a succinct, basic summary of what happened, but with vivid details for instance it should say exactly what the complications or impact was.
      Emoji guidance: use one of the following emojis as appropriate to represent the result (💀 for death, 🩸 for injury, ✨ for miraculous cure, 😡 for a patient walking out due to price, 🤢 for marked nauseau or disgust or minor toxicity, 😐 if ineffective, 💸 for an extremely valuable prescription, 🚪 for when a patient leaves unhappy.). Also include the score out of 10. The summary should reflect the patient's response:
      ${simulatedOutput}
    `;

      const summaryMessages = [{ role: 'user', content: summaryPrompt }];
      const summaryData = await createChatCompletion(summaryMessages, 0.4);
      const journalSummary = summaryData.choices[0].message.content.trim();

      if (typeof addJournalEntry === 'function') {
        addJournalEntry(`℞ Maria prescribed ${amount} drachms of **${item.name}** for **${price} reales** to **${npcName}** via the ${route} route. ${journalSummary}`);
      }

      // Log transaction
      if (transactionManager && TRANSACTION_CATEGORIES && price > 0) {
        transactionManager.logTransaction(
          'income',
          TRANSACTION_CATEGORIES.MEDICINE_SALES,
          `Prescribed ${item.name} to ${npcName}`,
          price,
          currentWealth + price,
          date,
          time
        );
      }

      // Show outcome modal instead of adding to conversation history
      // Use pendingModalOpen to trigger the modal opening via useEffect
      // This ensures simulatedOutput state has been updated before modal renders
      console.log('[PrescribePanelIntegrated] Setting pendingModalOpen to trigger modal', {
        simulatedOutputLength: simulatedOutput?.length,
        currentPatient: currentPatient?.name,
        hasPrescriptionData: !!prescriptionData
      });
      setPendingModalOpen(true);

    } catch (error) {
      console.error("Error during prescription:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPatient, conversationHistory, gameState, updateInventory, addJournalEntry, currentWealth, prescriptionType, handlePrescriptionOutcome, setHistoryOutput, transactionManager, TRANSACTION_CATEGORIES, onPrescriptionPending]);

  const handlePrescribeClick = async () => {
    if (!selectedRoute) {
      alert("Please select a route of administration.");
      return;
    }

    if (selectedItem && selectedRoute) {
      const isExpensive = price >= 5;
      const isDangerous = prescriptionType === 'poison' ||
        currentPatient?.name === 'Inquisitor Santiago Valdez';

      if (isExpensive || isDangerous) {
        setPendingPrescription({ selectedItem, amount, price, selectedRoute });
        setShowConfirmDialog(true);
      } else {
        setIsLoading(true);
        await handlePrescribe(selectedItem, amount, price, selectedRoute);
        setIsLoading(false);
        setIsSummaryOpen(true);
      }
    }
  };

  const handleConfirmPrescription = async () => {
    if (pendingPrescription) {
      const { selectedItem, amount, price, selectedRoute } = pendingPrescription;
      setShowConfirmDialog(false);
      await handlePrescribe(selectedItem, amount, price, selectedRoute);
      setPendingPrescription(null);
    }
  };

  const handleOutcomeModalContinue = () => {
    setShowOutcomeModal(false);
    setPendingModalOpen(false);

    // Update history output for narration panel (conversation history already updated)
    setHistoryOutput(simulatedOutput);

    const updatedTime = gameState.time;
    const updatedDate = gameState.date;
    advanceTime({ time: updatedTime, date: updatedDate });

    // Clear the pending prescription state (removes blue card)
    if (typeof onPrescriptionComplete === 'function') {
      onPrescriptionComplete();
    }

    setTurnNumber(prev => prev + 1);
    setSelectedItem(null);
    setAmount(1);
    setPrice(0);
    setSelectedRoute('');
    setPrescriptionData(null);

    // Return to examine mode
    if (onClose) onClose();
  };


  return (
    <>
      {/* Main Prescribe Panel - Dark Mode Support */}
      <div className="h-full flex flex-col bg-white dark:bg-slate-800 backdrop-blur-sm rounded-xl border border-ink-100 dark:border-slate-700 shadow-lg dark:shadow-dark-elevation-3 overflow-hidden transition-colors duration-300 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-ink-100 dark:border-slate-700 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <span className="text-2xl">℞</span>
            <h2 className="text-xl font-bold text-ink-900 dark:text-parchment-100 font-serif transition-colors duration-300">
              {prescriptionType === 'poison' ? 'Administer Poison' : 'Prescribe Medicine'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 font-sans bg-ink-100 dark:bg-slate-700 hover:bg-ink-200 dark:hover:bg-slate-600 text-ink-900 dark:text-parchment-100 border border-ink-200 dark:border-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Examine
          </button>
        </div>

        {/* Patient Info */}
        {currentPatient && (
          <div className="mb-4 rounded-lg p-3 bg-parchment-50 dark:bg-slate-900/50 border border-ink-100 dark:border-slate-700 transition-colors duration-300">
            <p className="text-sm text-ink-700 dark:text-slate-300 font-sans transition-colors duration-300">
              <span className="text-ink-900 dark:text-parchment-100 font-semibold">Patient:</span> {currentPatient.name}
              {currentPatient.diagnosis && <span className="text-ink-600 dark:text-slate-400"> • {currentPatient.diagnosis}</span>}
            </p>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
          {/* Drop Zone */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-ink-700 dark:text-slate-300 uppercase tracking-wide font-sans">
              Select Medicine
            </label>
            <div
              ref={drop}
              className={`relative rounded-lg border-2 border-dashed transition-all duration-300 min-h-[140px] flex flex-col items-center justify-center p-4 bg-white/50 dark:bg-slate-900/30 ${
                justDropped ? 'animate-bounce-subtle' : ''
              }`}
              style={{
                borderColor: isOver && canDrop
                  ? '#10b981'
                  : selectedItem
                  ? '#f59e0b'
                  : document.documentElement.classList.contains('dark')
                  ? 'rgba(71, 85, 105, 0.5)'
                  : 'rgba(209, 213, 219, 0.5)',
                background: isOver && canDrop
                  ? document.documentElement.classList.contains('dark')
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.12) 100%)'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)'
                  : selectedItem
                  ? document.documentElement.classList.contains('dark')
                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)'
                  : document.documentElement.classList.contains('dark')
                  ? 'rgba(15, 23, 42, 0.3)'
                  : 'rgba(255, 255, 255, 0.5)',
                boxShadow: isOver && canDrop
                  ? '0 0 20px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.1)'
                  : selectedItem
                  ? '0 4px 12px rgba(245, 158, 11, 0.2)'
                  : 'none',
                transform: isOver && canDrop ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {/* Pulse ring animation when hovering */}
              {isOver && canDrop && (
                <div
                  className="absolute inset-0 rounded-lg border-2 border-emerald-400 animate-ping"
                  style={{ opacity: 0.5 }}
                />
              )}

              {/* Sparkle effect when item selected */}
              {justDropped && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-sparkle"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}

              {selectedItem ? (
                <div className={`transition-all duration-300 ${justDropped ? 'scale-110' : 'scale-100'}`}>
                  <div className="text-5xl mb-2 transition-transform duration-300 hover:scale-110">
                    {selectedItem.emoji || '🍵'}
                  </div>
                  <h3 className="text-lg font-bold text-ink-900 dark:text-parchment-100 text-center font-serif">
                    {selectedItem.name}
                  </h3>
                  {selectedItem.spanishName && (
                    <p className="text-sm italic text-ink-600 dark:text-slate-400 font-serif">
                      ({selectedItem.spanishName})
                    </p>
                  )}
                  {selectedRoute && (
                    <p className="text-xs font-medium px-2 py-1 rounded mt-2 font-sans bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 transition-colors duration-300">
                      Route: {selectedRoute}
                    </p>
                  )}
                </div>
              ) : (
                <div className={`transition-all duration-300 ${isOver && canDrop ? 'scale-110' : 'scale-100'}`}>
                  <div className={`text-4xl mb-2 transition-all duration-300 ${isOver && canDrop ? 'opacity-100 animate-bounce' : 'opacity-40'}`}>
                    {isOver && canDrop ? '⬇️' : '📦'}
                  </div>
                  <p className={`text-center text-sm font-sans transition-colors duration-300 ${
                    isOver && canDrop ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-ink-500 dark:text-slate-500'
                  }`}>
                    {isOver && canDrop ? 'Drop here to select' : 'Drag an item from inventory to prescribe'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Amount and Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-2 text-ink-700 dark:text-slate-300 uppercase tracking-wide font-sans transition-colors duration-300">
                Amount (drachms)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const newAmount = Number(e.target.value);
                  setAmount(newAmount < 1 ? 1 : newAmount);
                }}
                min="1"
                className="w-full px-3 py-2 rounded-lg border transition-all font-sans bg-white dark:bg-slate-900 border-ink-200 dark:border-slate-600 text-ink-900 dark:text-parchment-100 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 text-ink-700 dark:text-slate-300 uppercase tracking-wide font-sans transition-colors duration-300">
                Price (reales)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 rounded-lg border transition-all font-sans bg-white dark:bg-slate-900 border-ink-200 dark:border-slate-600 text-ink-900 dark:text-parchment-100 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50 outline-none"
              />
            </div>
          </div>

          {/* Route Selection - Compact 2x2 Grid */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-ink-700 dark:text-slate-300 uppercase tracking-wide font-sans transition-colors duration-300">
              Route of Administration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(routeImages).map(([route, image]) => (
                <button
                  key={route}
                  onClick={() => setSelectedRoute(route)}
                  className="relative overflow-hidden rounded-lg transition-all h-24 border-2"
                  style={{
                    borderColor: selectedRoute === route
                      ? '#f59e0b'
                      : document.documentElement.classList.contains('dark')
                      ? 'rgba(71, 85, 105, 0.4)'
                      : 'rgba(209, 213, 219, 0.4)',
                    boxShadow: selectedRoute === route
                      ? '0 4px 16px rgba(245, 158, 11, 0.4), 0 0 0 3px rgba(245, 158, 11, 0.2)'
                      : document.documentElement.classList.contains('dark')
                      ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                      : '0 2px 8px rgba(61, 47, 36, 0.1)',
                    transform: selectedRoute === route ? 'scale(1.02)' : 'scale(1)',
                    opacity: selectedRoute === route ? 1 : 0.8
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: document.documentElement.classList.contains('dark')
                        ? 'brightness(0.65) sepia(0.3) saturate(1.1)'
                        : 'brightness(0.85) sepia(0.2)'
                    }}
                  />
                  {/* Dark overlay for dark mode */}
                  {document.documentElement.classList.contains('dark') && (
                    <div className="absolute inset-0 bg-slate-900/20" />
                  )}
                  <div className="absolute inset-0 flex items-end justify-center pb-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                    <span
                      className="text-xs font-bold text-white px-2 py-1 rounded font-sans"
                      style={{
                        background: selectedRoute === route
                          ? 'rgba(245, 158, 11, 0.9)'
                          : 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      {route}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prescribe Button - Fixed at bottom */}
        <div className="pt-4 mt-4 border-t-2 border-ink-100 dark:border-slate-700 transition-colors duration-300">
          <button
            onClick={handlePrescribeClick}
            disabled={!selectedItem || !selectedRoute || isLoading}
            className={`w-full px-6 py-3 text-base font-semibold transition-all rounded-lg font-sans
              ${(!selectedItem || !selectedRoute || isLoading)
                ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed opacity-50'
                : prescriptionType === 'poison'
                ? 'bg-gradient-to-b from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-red-700'
                : 'bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-emerald-700'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              prescriptionType === 'poison' ? '☠️ Administer Poison' : '✓ Prescribe Medicine'
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
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

      {/* Prescription Outcome Modal */}
      <PrescriptionOutcomeModal
        isOpen={showOutcomeModal}
        onClose={() => setShowOutcomeModal(false)}
        patient={currentPatient}
        prescriptionData={prescriptionData}
        outcome={simulatedOutput}
        onContinue={handleOutcomeModalContinue}
      />
    </>
  );
}

export default PrescribePanelIntegrated;
