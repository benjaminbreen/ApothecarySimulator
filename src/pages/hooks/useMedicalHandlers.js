// useMedicalHandlers.js
// Handles all medical/patient interaction logic
// Extracted from useGameHandlers.js (Phase 2.2)

import { useCallback } from 'react';
import { useGameState } from '../../contexts/GameStateContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { useNPCs } from '../../contexts/NPCContext';
import { processPatientDialogue } from '../../core/agents/PatientDialogueAgent';
import { extractPatientContext } from '../../core/agents/PatientContextExtractor';
import { enrichPatientData } from '../../core/entities/PatientEnrichment';
import { entityManager } from '../../core/entities/EntityManager';
import { createChatCompletion } from '../../core/services/llmService';
import { scenarioLoader } from '../../core/services/scenarioLoader';
import { resolvePortrait } from '../../core/services/portraitResolver';
import { getHouseCallData } from '../../features/medical/services/houseSelector';

/**
 * Custom hook for medical/patient handlers
 * Manages patient Q&A, treatment contracts, and diagnosis logic
 *
 * @param {Object} params - Hook parameters
 * @param {Function} params.addJournalEntry - Journal entry adder
 * @param {Function} params.setConversationHistory - Conversation history setter
 * @param {Function} params.setHistoryOutput - History output setter
 * @param {Function} params.setIsLoading - Loading state setter
 * @param {Function} params.toast - Toast notification function
 * @param {Function} params.awardXP - Award XP function
 * @param {Function} params.previousPortraitEntityRef - Ref to previous portrait entity
 * @param {Function} params.recentPortraitRef - Ref to recent portrait
 * @param {Function} params.setPendingHouseCall - Set pending house call state (Phase 3A)
 * @param {Object} params.gameState - DEPRECATED: Use useGameState() instead
 * @param {number} params.turnNumber - Current turn number
 * @param {Array} params.conversationHistory - Conversation history
 * @param {number} params.energy - DEPRECATED: Use usePlayer() instead
 * @param {Function} params.updateEnergy - DEPRECATED: Use usePlayer() instead
 * @param {Function} params.advanceTime - Time advancement function
 * @param {string} params.scenarioId - Scenario ID
 *
 * @returns {Object} Medical handlers
 */
export function useMedicalHandlers({
  addJournalEntry,
  setConversationHistory,
  setHistoryOutput,
  setIsLoading,
  toast,
  awardXP,
  previousPortraitEntityRef,
  recentPortraitRef,
  setPendingHouseCall,
  // Legacy params
  gameState,
  turnNumber,
  conversationHistory,
  energy,
  updateEnergy,
  advanceTime,
  scenarioId,
}) {
  // Context hooks
  const { updateWealth } = useGameState();
  const {
    activePatient,
    setActivePatient,
    patientDialogue,
    setPatientDialogue,
    pendingContract,
    setPendingContract,
    setPrimaryPortraitFile,
  } = useNPCs();

  /**
   * Handle asking a question to the active patient
   * Processes patient dialogue, extracts medical data, updates symptoms
   */
  const handleAskQuestion = useCallback(async (question) => {
    if (!activePatient || !question.trim()) return;

    try {
      console.log('[handleAskQuestion] Processing question for:', activePatient.name);

      // Extract narrative context if not already cached
      // This ensures patient knows about family, occupation, symptoms mentioned in narrative
      if (!activePatient.narrativeContext) {
        console.log('[handleAskQuestion] Extracting narrative context from conversation history...');
        const context = await extractPatientContext(activePatient, conversationHistory);

        if (context) {
          activePatient.narrativeContext = context;
          // Persist to EntityManager for future use
          entityManager.update(activePatient.id, activePatient);
          console.log('[handleAskQuestion] Cached narrative context:', context);
        } else {
          console.log('[handleAskQuestion] No narrative context found');
        }
      } else {
        console.log('[handleAskQuestion] Using cached narrative context');
      }

      // Use PatientDialogueAgent to get response with structured data extraction
      const result = await processPatientDialogue({
        patient: activePatient,
        question,
        conversationHistory: patientDialogue,
        narrativeContext: activePatient.narrativeContext // Pass extracted context
      });

      const { dialogue, patientDataUpdates } = result;

      // Enrich patient entity with extracted data
      let enrichedPatient = activePatient;
      let newSymptoms = [];

      if (patientDataUpdates) {
        const enrichmentResult = enrichPatientData(activePatient, patientDataUpdates);
        enrichedPatient = enrichmentResult.patient;
        newSymptoms = enrichmentResult.newSymptoms || [];

        // Update active patient state
        setActivePatient(enrichedPatient);

        // Persist to EntityManager
        entityManager.update(enrichedPatient.id, enrichedPatient);

        console.log('[handleAskQuestion] Patient data enriched:', {
          newSymptoms: newSymptoms.length,
          totalSymptoms: enrichedPatient.symptoms?.length
        });
      }

      // Add to patient dialogue history
      const newDialogue = {
        question,
        answer: dialogue,
        timestamp: gameState.time || new Date().toLocaleTimeString(),
        dataExtracted: patientDataUpdates // For debugging/review
      };

      setPatientDialogue(prev => [...prev, newDialogue]);

      // Show toast notification for newly discovered symptoms
      if (newSymptoms.length > 0) {
        const symptomNames = newSymptoms.map(s => s.name).join(', ');
        toast.success(`New symptom${newSymptoms.length > 1 ? 's' : ''} recorded: ${symptomNames}`, {
          duration: 4000
        });
      }

      // Add journal entry
      addJournalEntry({
        turnNumber,
        date: gameState.date,
        entry: `Examined ${activePatient.name}. Asked: "${question}". ` +
          (newSymptoms.length > 0
            ? `Discovered ${newSymptoms.length} new symptom(s): ${newSymptoms.map(s => s.name).join(', ')}.`
            : `Patient responded: ${dialogue.substring(0, 100)}...`)
      });

      // Add to main conversation history so LLM has context for future turns
      setConversationHistory(prev => [...prev,
        { role: 'user', content: `Maria asked ${activePatient.name}: "${question}"` },
        { role: 'assistant', content: dialogue },
        { role: 'system', content: `*[PATIENT EXAMINATION] ${newSymptoms.length > 0 ? `Discovered symptoms: ${newSymptoms.map(s => s.name).join(', ')}` : 'Gathering patient information'}*` }
      ]);

      // Apply minimal energy cost for patient Q&A (1 energy per question)
      // Represents mental focus during examination
      const currentEnergy = energy || 50;
      const newEnergy = Math.max(0, currentEnergy - 1);
      updateEnergy(newEnergy);
      console.log('[Energy] Patient Q&A cost: -1 energy');

      // Advance time by 5 minutes per question
      advanceTime({ minutes: 5 });
      console.log('[Time] Patient Q&A: +5 minutes');

    } catch (error) {
      console.error('[Ask Question] Error:', error);
      toast.error('Failed to get patient response. Please try again.');
    }
  }, [
    activePatient,
    patientDialogue,
    setPatientDialogue,
    scenarioId,
    addJournalEntry,
    turnNumber,
    gameState.date,
    gameState.time,
    toast,
    setConversationHistory,
    energy,
    updateEnergy,
    advanceTime,
    conversationHistory,
    setActivePatient
  ]);

  /**
   * Handle accepting a treatment contract
   * Generates transition narrative, updates wealth, sets active patient
   */
  const handleAcceptTreatment = useCallback(async (patientEntity, paymentAmount) => {
    console.log('[Contract] Accepting treatment:', patientEntity.name, 'Payment:', paymentAmount);

    // PHASE 3A: Detect house calls based on patientLocation in metadata
    const isHouseCall = patientEntity.metadata?.patientLocation &&
                        patientEntity.metadata?.patientLocation !== 'pending'; // Exclude "pending" from house calls
    const houseLocation = patientEntity.metadata?.patientLocation;

    console.log('[Phase 3A] House call detection:', {
      isHouseCall,
      location: houseLocation,
      patientMetadata: patientEntity.metadata
    });

    // Update wealth immediately (payment received upfront)
    updateWealth(paymentAmount);

    // Award XP for entering contract
    if (typeof awardXP === 'function') {
      awardXP(1, `contract_treatment_${patientEntity.name}`);
    }

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Accepted contract to treat ${patientEntity.name} for ${paymentAmount} reales.`
    });

    // PENDING PATIENT: If patient details are incomplete, generate clarification scene
    const isPendingDetails = patientEntity.metadata?.patientLocation === 'pending';

    if (isPendingDetails) {
      console.log('[Contract] Patient details pending, generating clarification scene');

      const clarificationPrompt = `You are narrating a brief scene in a historical medical RPG.

Maria de Lima, a converso apothecary in 1680 Mexico City, has just accepted a contract to treat "${patientEntity.name}" for ${paymentAmount} reales.

However, the patient's identity and location are unclear. The person who made the request (${patientEntity.metadata?.offeredBy || 'the messenger'}) has not provided full details yet.

Write a short (2-3 sentences) narrative showing Maria asking for clarification:
- What is the patient's actual name?
- Where is the patient located?
- What are their symptoms?

Keep it brief and professional. Maria needs this information before she can begin treatment.`;

      try {
        const response = await createChatCompletion(
          [
            { role: 'system', content: clarificationPrompt },
            { role: 'user', content: `Requester: ${patientEntity.metadata?.offeredBy || 'unknown'}\nPatient (vague): ${patientEntity.name}\nPayment: ${paymentAmount} reales` }
          ],
          0.7,
          150
        );

        const clarificationNarrative = response.choices[0].message.content;

        // Add to conversation history
        setConversationHistory(prev => [...prev,
          { role: 'system', content: `*[CONTRACT ACCEPTED] Maria agreed to treat ${patientEntity.name} for ${paymentAmount} reales (details pending).*` },
          { role: 'assistant', content: clarificationNarrative }
        ]);

        setHistoryOutput(clarificationNarrative);
        setPendingContract(null);
        setIsLoading(false);

        toast.info('Contract accepted - awaiting patient details', { duration: 3000 });
        return; // Don't set activePatient yet - need details first
      } catch (error) {
        console.error('[Contract] Clarification narrative failed:', error);
        // Fallback to simple message
        const fallback = `You nod to ${patientEntity.metadata?.offeredBy || 'the requester'}. "I accept. But I will need the patient's name, location, and symptoms before I can provide treatment."`;
        setConversationHistory(prev => [...prev,
          { role: 'system', content: `*[CONTRACT ACCEPTED] Maria agreed to treat ${patientEntity.name} for ${paymentAmount} reales (details pending).*` },
          { role: 'assistant', content: fallback }
        ]);
        setHistoryOutput(fallback);
        setPendingContract(null);
        setIsLoading(false);
        return;
      }
    }

    // PHASE 3A: If house call, set pending house call state instead of immediate examination
    if (isHouseCall) {
      console.log('[Phase 3A] Setting pending house call for:', houseLocation);

      const houseCallData = getHouseCallData(patientEntity, houseLocation);
      // Store payment amount for potential refund on cancellation
      houseCallData.paymentAmount = paymentAmount;
      console.log('[Phase 3A] House call data:', houseCallData);

      setPendingHouseCall(houseCallData);
      setPendingContract(null); // Clear contract modal

      toast.success(`Contract accepted! Preparing to travel to ${houseLocation}...`, { duration: 3000 });

      // Add to conversation history
      setConversationHistory(prev => [...prev,
        { role: 'system', content: `*[HOUSE CALL ACCEPTED] Maria agreed to travel to ${houseLocation} to treat ${patientEntity.name} for ${paymentAmount} reales.*` }
      ]);

      setIsLoading(false);
      return; // Skip the normal examination flow
    }

    toast.success(`Contract accepted! Preparing to examine ${patientEntity.name}...`, { duration: 3000 });

    // Generate transition narrative (Maria preparing/traveling)
    try {
      setIsLoading(true);

      const scenario = scenarioLoader.loadScenario(scenarioId);
      const systemPrompt = `You are narrating a brief transition scene in a historical medical RPG.

Maria de Lima, a converso apothecary in 1680 Mexico City, has just accepted a contract to treat ${patientEntity.name} for ${paymentAmount} reales.

Write a short (2-3 sentences) narrative showing:
- If the patient is present: Maria preparing her workspace and asking the patient to sit
- If the patient is elsewhere: Maria gathering her medical bag and traveling to the patient's location
- Maria's thoughts about the case or the payment

Keep it brief and atmospheric. End with Maria ready to begin the examination.`;

      const userPrompt = `Patient: ${patientEntity.name}
Payment: ${paymentAmount} reales
Location: ${gameState.location}
Time: ${gameState.time}

Generate the transition narrative.`;

      const response = await createChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        0.7, // Slightly higher temperature for narrative variety
        200 // Short response
      );

      const transitionNarrative = response.choices[0].message.content;

      // Add to conversation history
      setConversationHistory(prev => [...prev,
        { role: 'system', content: `*[CONTRACT ACCEPTED] Maria agreed to treat ${patientEntity.name} for ${paymentAmount} reales.*` },
        { role: 'assistant', content: transitionNarrative }
      ]);

      // Display narrative
      setHistoryOutput(transitionNarrative);

      // NOW set active patient (triggers "Patient Ready for Examination" card)
      // Do NOT auto-switch to patient tab - let player click the card
      setActivePatient(patientEntity);
      setPatientDialogue([]); // Clear previous dialogue

      // PHASE 2 FIX: Update portrait to show the patient who is now physically present
      // Since transition narrative doesn't go through NarrativeAgent, manually update portrait
      console.log('[Portrait Phase 2] Patient now present, updating portrait for:', patientEntity.name);

      // Enrich patient if needed to get appearance data
      const enrichedPatient = entityManager.getById(patientEntity.id) || patientEntity;

      // Use old portrait resolver as fallback for this edge case (transition scenes)
      const patientPortrait = resolvePortrait(enrichedPatient);
      if (patientPortrait) {
        const portraitFilename = patientPortrait.replace('/portraits/', '');
        console.log('[Portrait Phase 2] Setting patient portrait:', portraitFilename);

        // Store portrait in patient entity for display in "Patient Ready" card and patient view
        enrichedPatient.image = portraitFilename;
        if (!enrichedPatient.visual) enrichedPatient.visual = {};
        enrichedPatient.visual.image = portraitFilename;
        console.log('[Portrait Phase 2] Stored portrait in patient entity:', portraitFilename);

        setPrimaryPortraitFile(portraitFilename);

        // CRITICAL FIX: Update entity reference so ContextPanel displays correct name
        previousPortraitEntityRef.current = enrichedPatient;
        console.log('[Portrait Phase 2] Updated entity reference to:', enrichedPatient.name);

        // Update recent portrait for next turn's continuity
        recentPortraitRef.current = portraitFilename;
        console.log('[Portrait Phase 2] Stored portrait for next turn:', portraitFilename);

        // Update active patient to include the portrait
        setActivePatient({ ...enrichedPatient });
      } else {
        console.warn('[Portrait Phase 2] Could not resolve portrait for patient:', patientEntity.name);
      }

      // Clear the contract and close modal
      setPendingContract(null);

      setIsLoading(false);

    } catch (error) {
      console.error('[Contract] Transition narrative error:', error);
      setIsLoading(false);

      // Fallback: simple message
      const fallbackNarrative = `Maria accepts the payment and prepares to examine ${patientEntity.name}.`;
      setConversationHistory(prev => [...prev,
        { role: 'system', content: `*[CONTRACT ACCEPTED] Maria agreed to treat ${patientEntity.name} for ${paymentAmount} reales.*` },
        { role: 'assistant', content: fallbackNarrative }
      ]);
      setHistoryOutput(fallbackNarrative);
      setActivePatient(patientEntity);
      setPatientDialogue([]);

      // PHASE 2 FIX: Update portrait for patient (even in fallback case)
      const enrichedPatient = entityManager.getById(patientEntity.id) || patientEntity;
      const patientPortrait = resolvePortrait(enrichedPatient);
      if (patientPortrait) {
        const portraitFilename = patientPortrait.replace('/portraits/', '');
        setPrimaryPortraitFile(portraitFilename);

        // CRITICAL FIX: Update entity reference so ContextPanel displays correct name
        previousPortraitEntityRef.current = enrichedPatient;
        console.log('[Portrait Phase 2 Fallback] Updated entity reference to:', enrichedPatient.name);

        // Update recent portrait for next turn's continuity
        recentPortraitRef.current = portraitFilename;
        console.log('[Portrait Phase 2 Fallback] Stored portrait for next turn:', portraitFilename);
      }

      // Clear the contract and close modal (even in error case)
      setPendingContract(null);
    }
  }, [
    updateWealth,
    awardXP,
    addJournalEntry,
    turnNumber,
    gameState.date,
    gameState.location,
    gameState.time,
    toast,
    setIsLoading,
    scenarioId,
    setConversationHistory,
    setHistoryOutput,
    setActivePatient,
    setPatientDialogue,
    setPendingContract,
    setPendingHouseCall,
    setPrimaryPortraitFile,
    previousPortraitEntityRef,
    recentPortraitRef
  ]);

  /**
   * Handle declining a contract offer
   * Logs to journal and conversation history, closes contract modal
   */
  const handleDeclineContract = useCallback(() => {
    console.log('[Contract] Declined offer');

    // Log to conversation history
    setConversationHistory(prev => [...prev,
      { role: 'system', content: `*[CONTRACT DECLINED] Maria declined the offer.*` }
    ]);

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Declined a contract offer.`
    });

    toast.info('Contract declined.', { duration: 2000 });

    // Clear the contract and close modal
    setPendingContract(null);
  }, [
    setConversationHistory,
    addJournalEntry,
    turnNumber,
    gameState.date,
    toast,
    setPendingContract
  ]);

  return {
    handleAskQuestion,
    handleAcceptTreatment,
    handleDeclineContract,
  };
}
