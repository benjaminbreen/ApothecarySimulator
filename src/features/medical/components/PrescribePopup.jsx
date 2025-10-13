/**
 * PrescribePopup - Complete Redesign with Tailwind
 * Beautiful alchemical aesthetic with light/dark mode support
 * Preserves all game logic while modernizing UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { createChatCompletion } from '../../../core/services/llmService';
import ConfirmDialog from '../../../components/ConfirmDialog';
import imageMap from '../../../imageMap';

import oralImage from '../../../assets/oral.jpg';
import inhaledImage from '../../../assets/inhaled.jpg';
import topicalImage from '../../../assets/topical.jpg';
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
  const [isEmoji, setIsEmoji] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPrescription, setPendingPrescription] = useState(null);

  const isDark = theme === 'dark';

  const routeImages = {
    Oral: oralImage,
    Inhaled: inhaledImage,
    Topical: topicalImage,
    Enema: enemaImage
  };

  const normalizeImageKey = (key) => {
    return key.toLowerCase().replace(/[_\s]+/g, '');
  };

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

  // Auto-open inventory when popup opens
  useEffect(() => {
    if (isOpen && toggleInventory) {
      toggleInventory(true);
    }
  }, [isOpen, toggleInventory]);

  // Update price when amount changes
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
        setPrice(updatedItem.price || 0);
      } else {
        console.warn('Dropped item not found in inventory:', item);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Main prescription handler (preserves all game logic)
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

    console.log(`Social Context: ${socialContext}`);
    console.log(`Secret: ${secret}`);

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

    try {
      setIsLoading(true);
      const messages = [
        ...(conversationHistory || []),
        { role: 'user', content: prescriptionPrompt }
      ];

      const data = await createChatCompletion(messages, 0.8);
      const simulatedOutput = data.choices[0].message.content;
      setSimulatedOutput(simulatedOutput);

      // Update inventory
      updateInventory(item.name, -amount);

      // Update NPC portrait
      if (currentPatient) {
        const npcImageKey = normalizeImageKey(currentPatient.name);
        let selectedImage = imageMap[npcImageKey]?.src;
        if (!selectedImage) {
          console.warn(`No matching image found for key: ${npcImageKey}. Falling back to default.`);
          selectedImage = imageMap['default']?.src;
        }

        console.log("Selected NPC Image Key:", npcImageKey);
        console.log("Selected Image Path:", selectedImage);
        // Note: Portrait display is now handled by ContextPanel via EntityManager
      }

      // Generate journal summary
      const summaryPrompt = `
      Please summarize the following text with an overall summary of "Result: [emoji] [single word summing it up." Then add one sentence with a succinct, basic summary of what happened, but with vivid details for instance it should say exactly what the complications or impact was.
      Emoji guidance: use one of the following emojis as appropriate to represent the result (💀 for death, 🩸 for injury, ✨ for miraculous cure, 😡 for a patient walking out due to price, 🤢 for marked nauseau or disgust or minor toxicity, 😐 if ineffective, 💸 for an extremely valuable prescription, 🚪 for when a patient leaves unhappy.). Also include the score out of 10. The summary should reflect the patient's response:
      ${simulatedOutput}
    `;

      const summaryMessages = [{ role: 'user', content: summaryPrompt }];
      const summaryData = await createChatCompletion(summaryMessages, 0.4);
      const journalSummary = summaryData.choices[0].message.content.trim();

      console.log("Current Patient Details:", currentPatient);

      if (typeof addJournalEntry === 'function') {
        addJournalEntry(`℞ Maria prescribed ${amount} drachms of **${item.name}** for **${price} reales** to **${npcName}** via the ${route} route. ${journalSummary}`);
      } else {
        console.warn('addJournalEntry is not a function. Skipping journal entry.');
      }

      // Log transaction for medicine sale (income)
      if (transactionManager && TRANSACTION_CATEGORIES && price > 0) {
        transactionManager.logTransaction(
          'income',
          TRANSACTION_CATEGORIES.MEDICINE_SALES,
          `Prescribed ${item.name} to ${npcName}`,
          price,
          currentWealth + price, // New wealth after income
          date,
          time
        );
      }

    } catch (error) {
      console.error("Error during prescription:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPatient, conversationHistory, gameState, updateInventory, addJournalEntry, currentWealth, prescriptionType, handlePrescriptionOutcome, setHistoryOutput]);

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

  const handleSummaryContinue = () => {
    setIsSummaryOpen(false);
    setHistoryOutput(simulatedOutput);

    const updatedTime = gameState.time;
    const updatedDate = gameState.date;
    advanceTime({ time: updatedTime, date: updatedDate });

    if (typeof onPrescriptionComplete === 'function') {
      onPrescriptionComplete(simulatedOutput);
    }

    // Add conversation history with clear context for next turn
    const npcName = currentPatient?.name || 'the patient';
    const route = selectedRoute || 'unknown';

    // Create a concise action summary for the LLM
    const prescriptionAction = `Maria prescribed ${amount} drachm${amount > 1 ? 's' : ''} of ${selectedItem?.name || 'medicine'} to ${npcName} via the ${route} route for ${price} reales.`;

    // Add system message to clearly mark this as a prescription event
    setConversationHistory(prev => [
      ...prev,
      { role: 'user', content: prescriptionAction },
      { role: 'assistant', content: simulatedOutput },
      { role: 'system', content: `*[PRESCRIPTION COMPLETED] ${prescriptionAction} Time advanced to ${updatedTime}.*` }
    ]);

    setTurnNumber(prev => prev + 1);
    toggleInventory(false);
    setSelectedItem(null);
    setAmount(1);
    setPrice(0);
    setSelectedRoute('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Main Prescription Modal */}
      {!isSummaryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: isDark
              ? 'rgba(15, 23, 42, 0.85)'
              : 'rgba(92, 74, 58, 0.4)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={onClose}
        >
          {/* Modal Container */}
          <div
            className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-xl"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)'
                : 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 50%, #faf8f3 100%)',
              boxShadow: isDark
                ? '0 25px 70px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.05)'
                : '0 25px 70px rgba(92, 74, 58, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Border Accent */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{
                border: isDark
                  ? '1px solid rgba(148, 163, 184, 0.2)'
                  : '1px solid rgba(139, 92, 46, 0.15)'
              }}
            />

            {/* Header */}
            <div
              className="relative px-8 py-6 border-b"
              style={{
                background: isDark
                  ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.6))'
                  : 'linear-gradient(to bottom, rgba(245, 238, 223, 0.5), rgba(250, 248, 243, 0.3))',
                borderColor: isDark
                  ? 'rgba(148, 163, 184, 0.2)'
                  : 'rgba(139, 92, 46, 0.15)'
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🧪</span>
                    <h1
                      className="text-3xl tracking-tight"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontWeight: 700,
                        color: isDark ? '#e2e8f0' : '#3d2f24',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {prescriptionType === 'poison' ? 'Administer Poison' : 'Prescribe Medicine'}
                    </h1>
                  </div>
                  {currentPatient && (
                    <p
                      className="text-sm font-medium mt-2"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: isDark ? '#94a3b8' : '#8b7a6a',
                        letterSpacing: '0.01em'
                      }}
                    >
                      Patient: <span style={{ fontWeight: 600, color: isDark ? '#cbd5e1' : '#6b5d52' }}>{currentPatient.name}</span>
                      {currentPatient.diagnosis && ` • ${currentPatient.diagnosis}`}
                    </p>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold transition-all rounded"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    background: isDark ? '#334155' : '#5c4a3a',
                    color: 'white',
                    border: isDark
                      ? '1px solid rgba(148, 163, 184, 0.3)'
                      : '1px solid rgba(92, 74, 58, 0.3)',
                    boxShadow: isDark
                      ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                      : '0 2px 8px rgba(92, 74, 58, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = isDark ? '#475569' : '#4a3a2d';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = isDark ? '#334155' : '#5c4a3a';
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              className="p-8 overflow-y-auto"
              style={{
                maxHeight: 'calc(95vh - 180px)',
                background: isDark
                  ? 'rgba(15, 23, 42, 0.3)'
                  : 'rgba(248, 243, 233, 0.3)'
              }}
            >
              {/* Drag & Drop Area */}
              <div className="mb-6">
                <label
                  className="block text-sm font-semibold mb-3"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isDark ? '#cbd5e1' : '#6b5d52'
                  }}
                >
                  Select Medicine
                </label>
                <div
                  ref={drop}
                  className="relative rounded-lg border-2 border-dashed transition-all"
                  style={{
                    minHeight: '140px',
                    borderColor: isOver
                      ? (isDark ? '#fbbf24' : '#d97706')
                      : (isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(139, 92, 46, 0.25)'),
                    background: isOver
                      ? (isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(217, 119, 6, 0.08)')
                      : (isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 250, 240, 0.6)'),
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem'
                  }}
                >
                  {selectedItem ? (
                    <>
                      <div className="text-5xl mb-2">{selectedItem.emoji || '🍵'}</div>
                      <h3
                        className="text-xl font-bold text-center"
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          color: isDark ? '#e2e8f0' : '#3d2f24'
                        }}
                      >
                        {selectedItem.name}
                      </h3>
                      {selectedItem.spanishName && (
                        <p
                          className="text-sm italic"
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            color: isDark ? '#94a3b8' : '#8b7a6a'
                          }}
                        >
                          ({selectedItem.spanishName})
                        </p>
                      )}
                      {selectedRoute && (
                        <p
                          className="text-sm font-medium px-3 py-1 rounded"
                          style={{
                            background: isDark
                              ? 'rgba(34, 197, 94, 0.2)'
                              : 'rgba(34, 197, 94, 0.15)',
                            color: isDark ? '#86efac' : '#16a34a',
                            fontFamily: "'Inter', sans-serif"
                          }}
                        >
                          Route: {selectedRoute}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">📦</div>
                      <p
                        className="text-center font-medium"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          color: isDark ? '#94a3b8' : '#8b7a6a',
                          maxWidth: '400px'
                        }}
                      >
                        Drag an item from the inventory to prescribe
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Amount and Price Controls */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: isDark ? '#cbd5e1' : '#6b5d52'
                    }}
                  >
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
                    className="w-full px-4 py-3 rounded-lg border transition-all"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '1rem',
                      fontWeight: 500,
                      background: isDark
                        ? 'rgba(30, 41, 59, 0.8)'
                        : 'rgba(255, 255, 255, 0.9)',
                      borderColor: isDark
                        ? 'rgba(148, 163, 184, 0.3)'
                        : 'rgba(139, 92, 46, 0.25)',
                      color: isDark ? '#e2e8f0' : '#3d2f24'
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: isDark ? '#cbd5e1' : '#6b5d52'
                    }}
                  >
                    Price (silver reales)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border transition-all"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '1rem',
                      fontWeight: 500,
                      background: isDark
                        ? 'rgba(30, 41, 59, 0.8)'
                        : 'rgba(255, 255, 255, 0.9)',
                      borderColor: isDark
                        ? 'rgba(148, 163, 184, 0.3)'
                        : 'rgba(139, 92, 46, 0.25)',
                      color: isDark ? '#e2e8f0' : '#3d2f24'
                    }}
                  />
                </div>
              </div>

              {/* Route Selection */}
              <div className="mb-6">
                <label
                  className="block text-sm font-semibold mb-3"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isDark ? '#cbd5e1' : '#6b5d52'
                  }}
                >
                  Route of Administration
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(routeImages).map(([route, image]) => (
                    <button
                      key={route}
                      onClick={() => setSelectedRoute(route)}
                      className="relative overflow-hidden rounded-lg transition-all"
                      style={{
                        height: '120px',
                        border: selectedRoute === route
                          ? (isDark ? '3px solid #fbbf24' : '3px solid #d97706')
                          : (isDark ? '2px solid rgba(148, 163, 184, 0.3)' : '2px solid rgba(139, 92, 46, 0.25)'),
                        boxShadow: selectedRoute === route
                          ? (isDark ? '0 4px 16px rgba(251, 191, 36, 0.3)' : '0 4px 16px rgba(217, 119, 6, 0.3)')
                          : 'none',
                        transform: selectedRoute === route ? 'scale(1.02)' : 'scale(1)',
                        opacity: selectedRoute === route ? 1 : 0.7
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: isDark ? 'brightness(0.7)' : 'none'
                        }}
                      />
                      <div
                        className="absolute inset-0 flex items-end justify-center pb-3"
                        style={{
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)'
                        }}
                      >
                        <span
                          className="text-sm font-bold text-white px-3 py-1 rounded"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            background: selectedRoute === route
                              ? 'rgba(217, 119, 6, 0.9)'
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

              {/* Prescribe Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handlePrescribeClick}
                  disabled={!selectedItem || !selectedRoute || isLoading}
                  className="px-8 py-3 text-base font-semibold transition-all rounded-lg"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    background: (!selectedItem || !selectedRoute || isLoading)
                      ? (isDark ? '#1e293b' : '#d1d5db')
                      : (prescriptionType === 'poison'
                        ? (isDark ? '#dc2626' : '#991b1b')
                        : (isDark ? '#16a34a' : '#15803d')),
                    color: (!selectedItem || !selectedRoute || isLoading)
                      ? (isDark ? '#64748b' : '#9ca3af')
                      : 'white',
                    border: (!selectedItem || !selectedRoute || isLoading)
                      ? 'none'
                      : (prescriptionType === 'poison'
                        ? (isDark ? '1px solid rgba(220, 38, 38, 0.5)' : '1px solid rgba(153, 27, 27, 0.3)')
                        : (isDark ? '1px solid rgba(22, 163, 74, 0.5)' : '1px solid rgba(21, 128, 61, 0.3)')),
                    boxShadow: (!selectedItem || !selectedRoute || isLoading)
                      ? 'none'
                      : (prescriptionType === 'poison'
                        ? '0 4px 12px rgba(220, 38, 38, 0.3)'
                        : '0 4px 12px rgba(22, 163, 74, 0.3)'),
                    cursor: (!selectedItem || !selectedRoute || isLoading) ? 'not-allowed' : 'pointer',
                    opacity: (!selectedItem || !selectedRoute || isLoading) ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (selectedItem && selectedRoute && !isLoading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = prescriptionType === 'poison'
                        ? '0 6px 16px rgba(220, 38, 38, 0.4)'
                        : '0 6px 16px rgba(22, 163, 74, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = (!selectedItem || !selectedRoute || isLoading)
                      ? 'none'
                      : (prescriptionType === 'poison'
                        ? '0 4px 12px rgba(220, 38, 38, 0.3)'
                        : '0 4px 12px rgba(22, 163, 74, 0.3)');
                  }}
                >
                  {isLoading ? 'Processing...' : (prescriptionType === 'poison' ? '☠️ Administer Poison' : '✓ Prescribe Medicine')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {isSummaryOpen && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: isDark
              ? 'rgba(15, 23, 42, 0.9)'
              : 'rgba(92, 74, 58, 0.5)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)'
                : 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 50%, #faf8f3 100%)',
              boxShadow: isDark
                ? '0 30px 80px rgba(0, 0, 0, 0.7)'
                : '0 30px 80px rgba(92, 74, 58, 0.5)'
            }}
          >
            {/* Border */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{
                border: isDark
                  ? '1px solid rgba(148, 163, 184, 0.2)'
                  : '1px solid rgba(139, 92, 46, 0.15)'
              }}
            />

            {/* Content */}
            <div className="p-10 overflow-y-auto" style={{ maxHeight: '90vh' }}>
              <h2
                className="text-2xl font-bold text-center mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  color: isDark ? '#e2e8f0' : '#3d2f24'
                }}
              >
                Prescription Summary
              </h2>

              <p
                className="text-center mb-6"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: isDark ? '#cbd5e1' : '#6b5d52',
                  fontSize: '1rem',
                  lineHeight: '1.6'
                }}
              >
                Maria administered <strong>{amount}</strong> drachms of <strong>{selectedItem.name}</strong> via the <strong>{selectedRoute}</strong> route for <strong>{price}</strong> reales.
                <br />
                She waits expectantly to see what effect her treatment will have...
              </p>

              {/* Item Details */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{selectedItem.emoji || '🍵'}</div>
                <h1
                  className="text-3xl font-bold mb-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: isDark ? '#e2e8f0' : '#3d2f24'
                  }}
                >
                  {selectedItem.name}
                </h1>
                {selectedItem.spanishName && (
                  <p
                    className="text-lg italic mb-3"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      color: isDark ? '#94a3b8' : '#8b7a6a'
                    }}
                  >
                    ({selectedItem.spanishName})
                  </p>
                )}
                {selectedItem.latinName && (
                  <p
                    className="text-base italic mb-4"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      color: isDark ? '#fbbf24' : '#d97706'
                    }}
                  >
                    {selectedItem.latinName}
                  </p>
                )}
              </div>

              {/* Properties */}
              <div
                className="rounded-lg p-5 mb-6"
                style={{
                  background: isDark
                    ? 'rgba(30, 41, 59, 0.6)'
                    : 'rgba(255, 250, 240, 0.8)',
                  border: isDark
                    ? '1px solid rgba(148, 163, 184, 0.2)'
                    : '1px solid rgba(139, 92, 46, 0.15)'
                }}
              >
                {selectedItem.humoralQualities && (
                  <p
                    className="mb-3"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.95rem',
                      color: isDark ? '#cbd5e1' : '#4a3f35'
                    }}
                  >
                    <strong style={{ color: isDark ? '#e2e8f0' : '#3d2f24' }}>Humoral Qualities:</strong> {selectedItem.humoralQualities}
                  </p>
                )}
                {selectedItem.medicinalEffects && (
                  <p
                    className="mb-3"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.95rem',
                      color: isDark ? '#cbd5e1' : '#4a3f35'
                    }}
                  >
                    <strong style={{ color: isDark ? '#e2e8f0' : '#3d2f24' }}>Medicinal Effects:</strong> {selectedItem.medicinalEffects}
                  </p>
                )}
                {selectedItem.description && (
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '1rem',
                      lineHeight: '1.7',
                      color: isDark ? '#cbd5e1' : '#4a3f35'
                    }}
                  >
                    {selectedItem.description}
                  </p>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleSummaryContinue}
                className="w-full px-6 py-4 text-lg font-semibold transition-all rounded-lg"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  background: isDark ? '#16a34a' : '#15803d',
                  color: 'white',
                  border: isDark
                    ? '1px solid rgba(22, 163, 74, 0.5)'
                    : '1px solid rgba(21, 128, 61, 0.3)',
                  boxShadow: '0 4px 16px rgba(22, 163, 74, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = isDark ? '#15803d' : '#166534';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(22, 163, 74, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = isDark ? '#16a34a' : '#15803d';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(22, 163, 74, 0.3)';
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}

export default PrescribePopup;
