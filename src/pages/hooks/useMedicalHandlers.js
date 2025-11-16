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
 * @param {Function} params.setBackgroundMode - Set background mode for immersive UI
 * @param {Function} params.handleSubmit - Main submit handler for triggering full narrative turns
 * @param {Object} params.gameState - Current game state (passed from parent)
 * @param {number} params.turnNumber - Current turn number
 * @param {Array} params.conversationHistory - Conversation history
 * @param {number} params.energy - Current energy value (passed from parent)
 * @param {Function} params.updateEnergy - Energy update function (passed from parent)
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
  setBackgroundMode, // Immersive background mode (fade UI for travel)
  handleSubmit, // Main submit handler for full turns
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

      // Detect if input is an examination action vs conversational question
      const actionVerbs = ['check', 'examine', 'inspect', 'look at', 'feel', 'listen to', 'palpate', 'observe', 'measure', 'test'];
      const isExaminationAction = actionVerbs.some(verb => question.trim().toLowerCase().startsWith(verb));

      console.log('[handleAskQuestion] Input type:', isExaminationAction ? 'EXAMINATION ACTION' : 'QUESTION');

      // Use PatientDialogueAgent to get response with structured data extraction
      const result = await processPatientDialogue({
        patient: activePatient,
        question,
        isExaminationAction, // NEW: Tell agent this is a physical examination
        conversationHistory: patientDialogue,
        narrativeContext: activePatient.narrativeContext // Pass extracted context
      });

      const { dialogue, patientDataUpdates } = result;

      // Enrich patient entity with extracted data
      let enrichedPatient = activePatient;
      let newSymptoms = [];

      if (patientDataUpdates) {
        // CRITICAL FIX: Merge context data (age, gender, family, occupation) from extractPatientContext
        // into patientDataUpdates so they're applied to the patient entity
        const mergedUpdates = {
          ...patientDataUpdates
        };

        // Apply age from context if extracted
        if (activePatient.narrativeContext?.age && !mergedUpdates.age) {
          mergedUpdates.age = activePatient.narrativeContext.age;
          console.log('[handleAskQuestion] Applying age from context:', activePatient.narrativeContext.age);
        }

        // Apply gender from context if extracted
        if (activePatient.narrativeContext?.gender && !mergedUpdates.gender) {
          mergedUpdates.gender = activePatient.narrativeContext.gender;
          console.log('[handleAskQuestion] Applying gender from context:', activePatient.narrativeContext.gender);
        }

        // Apply family from context if extracted
        if (activePatient.narrativeContext?.familyMembers && !mergedUpdates.family) {
          mergedUpdates.family = activePatient.narrativeContext.familyMembers.join(', ');
          console.log('[handleAskQuestion] Applying family from context');
        }

        // Apply occupation from context if extracted
        if (activePatient.narrativeContext?.occupation && !mergedUpdates.occupation) {
          mergedUpdates.occupation = activePatient.narrativeContext.occupation;
          console.log('[handleAskQuestion] Applying occupation from context:', activePatient.narrativeContext.occupation);
        }

        const enrichmentResult = enrichPatientData(activePatient, mergedUpdates);
        enrichedPatient = enrichmentResult.patient;
        newSymptoms = enrichmentResult.newSymptoms || [];

        // DIAGNOSIS EXTRACTION: Store diagnosis in patient medical record
        if (patientDataUpdates.diagnosis) {
          console.log('[handleAskQuestion] Diagnosis extracted:', {
            diagnosis: patientDataUpdates.diagnosis,
            confidence: patientDataUpdates.confidence || 'medium'
          });

          // Initialize medical record if it doesn't exist
          if (!enrichedPatient.medicalRecord) {
            enrichedPatient.medicalRecord = {
              diagnoses: [],
              treatments: [],
              notes: []
            };
          }

          // Add diagnosis to medical record
          const diagnosisEntry = {
            diagnosis: patientDataUpdates.diagnosis,
            confidence: patientDataUpdates.confidence || 'medium',
            timestamp: gameState.time || new Date().toLocaleTimeString(),
            date: gameState.date || new Date().toLocaleDateString(),
            evidence: enrichedPatient.symptoms || []
          };

          enrichedPatient.medicalRecord.diagnoses = enrichedPatient.medicalRecord.diagnoses || [];
          enrichedPatient.medicalRecord.diagnoses.push(diagnosisEntry);

          console.log('[handleAskQuestion] Diagnosis stored in medical record:', diagnosisEntry);

          // Show toast notification for diagnosis
          toast.success(`Diagnosis recorded: ${patientDataUpdates.diagnosis} (${patientDataUpdates.confidence || 'medium'} confidence)`, {
            duration: 5000
          });

          // Add journal entry for diagnosis
          addJournalEntry({
            turnNumber,
            date: gameState.date,
            entry: `Diagnosed ${activePatient.name} with: ${patientDataUpdates.diagnosis} (Confidence: ${patientDataUpdates.confidence || 'medium'})`
          });
        }

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

      // Format conversation entry based on input type
      let formattedUserAction;
      if (isExaminationAction) {
        // Extract object: "check the patient's pulse" → "the patient's pulse"
        const actionMatch = question.match(/^(check|examine|inspect|look at|feel|listen to|palpate|observe|measure|test)\s+(.+)$/i);
        const examinationObject = actionMatch ? actionMatch[2] : question;
        formattedUserAction = `Maria checked ${examinationObject}`;
      } else {
        formattedUserAction = `Maria said to ${activePatient.name}: "${question}"`;
      }

      // Add to main conversation history so LLM has context for future turns
      setConversationHistory(prev => [...prev,
        { role: 'user', content: formattedUserAction },
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
  const handleAcceptTreatment = useCallback(async (patientEntity, paymentAmount, contractMeta = null) => {
    console.log('[Contract] Accepting treatment for patient:', patientEntity.name);
    console.log('[Contract] Patient entity:', patientEntity);
    console.log('[Contract] Contract metadata:', contractMeta);
    console.log('[Contract] Payment:', paymentAmount);

    // PHASE 3A: Detect house calls based on patientLocation in metadata
    const metaLocation = contractMeta?.patientLocation ?? patientEntity.metadata?.patientLocation;
    const metaIsEmissary = contractMeta?.isEmissary ?? patientEntity.metadata?.isEmissary;

    // CRITICAL: Don't treat as house call if patient is already at current location
    // Check if metaLocation is the same as current location (or a sub-location of it)
    const currentLoc = gameState.location || '';
    const isPatientAtCurrentLocation = metaLocation && (
      metaLocation === currentLoc ||
      metaLocation.includes(currentLoc) ||
      currentLoc.includes(metaLocation) ||
      (metaLocation.includes('Botica') && currentLoc.includes('Botica'))
    );

    const isHouseCall = Boolean(
      !isPatientAtCurrentLocation && // Patient must be elsewhere
      (metaIsEmissary || (metaLocation && metaLocation !== 'pending'))
    );

    // FIXED: Generate fallback location if LLM didn't extract one
    let houseLocation = metaLocation;
    if (isHouseCall && !houseLocation) {
      // Generate appropriate location based on patient description/class
      const patientDesc = (patientEntity.description || patientEntity.name || '').toLowerCase();
      const socialClass = (patientEntity.class || patientEntity.social?.class || '').toLowerCase();

      if (patientDesc.includes('priest') || patientDesc.includes('friar') || patientDesc.includes('nun')) {
        houseLocation = 'the Church rectory';
      } else if (patientDesc.includes('don ') || patientDesc.includes('doña ') || socialClass.includes('elite')) {
        houseLocation = 'a noble estate';
      } else if (patientDesc.includes('merchant') || socialClass.includes('middling')) {
        houseLocation = 'a merchant household';
      } else if (patientDesc.includes('servant') || patientDesc.includes('slave')) {
        houseLocation = 'the servant quarters';
      } else {
        // Generic fallback based on emissary description
        const emissaryDesc = (contractMeta?.offeredBy || '').toLowerCase();
        if (emissaryDesc.includes('servant')) {
          houseLocation = 'their household';
        } else {
          houseLocation = 'a nearby residence';
        }
      }
      console.log('[Phase 3A] Generated fallback location:', houseLocation);
    }

    console.log('[Phase 3A] House call detection:', {
      isHouseCall,
      isPatientAtCurrentLocation,
      currentLocation: currentLoc,
      patientLocation: metaLocation,
      houseLocation: houseLocation,
      patientMetadata: patientEntity.metadata,
      contractMeta
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
    const isPendingDetails = (metaLocation || patientEntity.metadata?.patientLocation) === 'pending';

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
        const fallback = `You nod to ${contractMeta?.offeredBy || patientEntity.metadata?.offeredBy || 'the requester'}. "I accept. But I will need the patient's name, location, and symptoms before I can provide treatment."`;
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

    // PHASE 3A: If house call, generate transition narrative and set pending house call state
    if (isHouseCall) {
      console.log('[Phase 3A] Setting pending house call for:', houseLocation);

      const houseCallData = getHouseCallData(patientEntity, houseLocation);
      // Store payment amount for potential refund on cancellation
      houseCallData.paymentAmount = paymentAmount;
      console.log('[Phase 3A] House call data:', houseCallData);

      toast.success(`Contract accepted! Preparing to travel to ${houseLocation}...`, { duration: 3000 });

      // Generate house call transition narrative
      try {
        setIsLoading(true);

        // Build conversation context (last 5 messages showing negotiation)
        const recentHistory = conversationHistory.slice(-5)
          .filter(msg => !msg.hidden && msg.content)
          .map(msg => `${msg.role === 'user' ? 'Maria' : msg.role === 'system' ? 'System' : 'Narrator'}: ${msg.content}`)
          .join('\n');

        // Determine who made the request
        const representedBy = contractMeta?.offeredBy || patientEntity.metadata?.representedBy;
        const ailmentDescription = contractMeta?.ailmentDescription || patientEntity.description || 'Unknown condition';

        const houseCallPrompt = `You are narrating a brief transition scene in a historical medical RPG.

Maria de Lima, a converso apothecary in 1680 Mexico City, has just accepted a house call to travel to ${houseLocation} to treat ${patientEntity.name} for ${paymentAmount} reales.

**Recent Conversation Context**:
${recentHistory}

**Details**:
- Patient: ${patientEntity.name} (at ${houseLocation})
- Symptoms: ${ailmentDescription}
- Representative/Messenger: ${representedBy || 'None (direct request)'}
- Payment: ${paymentAmount} reales

Write a short (2-3 sentences) narrative in present tense showing:
- Maria preparing her medical bag with appropriate remedies and tools
${representedBy && representedBy !== patientEntity.name ? `- The messenger ${representedBy} departing or preparing to guide Maria` : '- Maria preparing to depart for the house call'}
- Maria's thoughts about the journey or the case ahead

Keep it brief and atmospheric. End with Maria ready to depart.`;

        const response = await createChatCompletion(
          [
            { role: 'system', content: houseCallPrompt },
            { role: 'user', content: `Patient: ${patientEntity.name}\nLocation: ${houseLocation}\nSymptoms: ${ailmentDescription}\nPayment: ${paymentAmount} reales\n\nGenerate the house call preparation narrative.` }
          ],
          0.7,
          200
        );

        const transitionNarrative = response.choices[0].message.content;

        // Add to conversation history
        setConversationHistory(prev => [...prev,
          { role: 'system', content: `*[HOUSE CALL ACCEPTED] Maria agreed to travel to ${houseLocation} to treat ${patientEntity.name} for ${paymentAmount} reales.*` },
          { role: 'assistant', content: transitionNarrative }
        ]);

        // Display narrative
        setHistoryOutput(transitionNarrative);

        // Fade UI to show background (immersive mode)
        setBackgroundMode('housecall');
        setPendingHouseCall(houseCallData);
        setPendingContract(null); // Clear contract modal

        setIsLoading(false);
      } catch (error) {
        console.error('[Phase 3A] House call narrative generation failed:', error);
        // Fallback to simple system message
        setConversationHistory(prev => [...prev,
          { role: 'system', content: `*[HOUSE CALL ACCEPTED] Maria agreed to travel to ${houseLocation} to treat ${patientEntity.name} for ${paymentAmount} reales.*` }
        ]);
        setHistoryOutput(`You gather your medical supplies and prepare to travel to ${houseLocation} to treat ${patientEntity.name}.`);

        // Fade UI to show background (immersive mode)
        setBackgroundMode('housecall');
        setPendingHouseCall(houseCallData);
        setPendingContract(null);
        setIsLoading(false);
      }

      return; // Skip the normal examination flow
    }

    toast.success(`Contract accepted! Preparing to examine ${patientEntity.name}...`, { duration: 3000 });

    // Generate transition narrative (Maria preparing for examination)
    try {
      setIsLoading(true);

      const scenario = scenarioLoader.loadScenario(scenarioId);

      // Build conversation context (last 5 messages showing negotiation)
      const recentHistory = conversationHistory.slice(-5)
        .filter(msg => !msg.hidden && msg.content)
        .map(msg => `${msg.role === 'user' ? 'Maria' : msg.role === 'system' ? 'System' : 'Narrator'}: ${msg.content}`)
        .join('\n');

      // Determine who is physically present
      const representedBy = contractMeta?.offeredBy || patientEntity.metadata?.representedBy;
      const isRepresentative = representedBy && representedBy !== patientEntity.name;
      const ailmentDescription = contractMeta?.ailmentDescription || patientEntity.description || 'Not yet examined';

      const systemPrompt = `You are narrating a brief transition scene in a historical medical RPG.

Maria de Lima, a converso apothecary in 1680 Mexico City, has just accepted a contract to treat ${patientEntity.name} for ${paymentAmount} reales.

**Recent Conversation Context**:
${recentHistory}

**Patient Details**:
- Patient name: ${patientEntity.name}
- Symptoms/condition: ${ailmentDescription}
${isRepresentative
  ? `- Represented by: ${representedBy} (physically present at the shop requesting treatment for ${patientEntity.name})`
  : `- Patient is physically present at the shop`}

Write a short (2-3 sentences) narrative in present tense showing:
${isRepresentative
  ? `- Maria acknowledging ${representedBy}'s request and preparing her workspace to examine ${patientEntity.name} when they arrive
- Maria's brief thoughts about the symptoms described or the payment`
  : `- Maria asking ${patientEntity.name} to sit down and preparing her workspace to begin the examination
- Maria's brief thoughts about the case or the payment`}

Keep it brief and atmospheric. End with Maria ready to begin the examination.`;

      const userPrompt = `Patient: ${patientEntity.name}
Represented by: ${representedBy || 'Self (patient is present)'}
Ailment: ${ailmentDescription}
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

      // CARD CLEANUP: Remove contract cards from conversation history when accepting
      setConversationHistory(prev => {
        const updated = prev.map(msg => {
          // Remove contract/sale_inquiry cards from assistant messages
          if (msg.role === 'assistant' && msg.card &&
              (msg.card.type === 'contract' || msg.card.type === 'sale_inquiry')) {
            const { card, ...msgWithoutCard } = msg;
            console.log('[Contract] Removing card from history after accept:', msg.card.type);
            return msgWithoutCard;
          }
          return msg;
        });

        // Add system message and transition narrative
        return [...updated,
          { role: 'system', content: `*[CONTRACT ACCEPTED] Maria agreed to treat ${patientEntity.name} for ${paymentAmount} reales.*` },
          { role: 'assistant', content: transitionNarrative }
        ];
      });

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
      // CARD CLEANUP: Remove contract cards from conversation history when accepting (fallback path)
      setConversationHistory(prev => {
        const updated = prev.map(msg => {
          if (msg.role === 'assistant' && msg.card &&
              (msg.card.type === 'contract' || msg.card.type === 'sale_inquiry')) {
            const { card, ...msgWithoutCard } = msg;
            console.log('[Contract] Removing card from history after accept (fallback):', msg.card.type);
            return msgWithoutCard;
          }
          return msg;
        });

        return [...updated,
          { role: 'system', content: `*[CONTRACT ACCEPTED] Maria agreed to treat ${patientEntity.name} for ${paymentAmount} reales.*` },
          { role: 'assistant', content: fallbackNarrative }
        ];
      });
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
   * Triggers narrative turn to show NPC/emissary reaction to decline
   */
  const handleDeclineContract = useCallback(async () => {
    console.log('[Contract] Declined offer');

    const contract = pendingContract;
    if (!contract) {
      console.warn('[Contract] No pending contract to decline');
      return;
    }

    // Clear the contract BEFORE narrative turn to prevent re-display
    setPendingContract(null);

    // CARD CLEANUP: Remove contract cards from conversation history
    setConversationHistory(prev => {
      return prev.map(msg => {
        // Remove contract/sale_inquiry cards from assistant messages
        if (msg.role === 'assistant' && msg.card &&
            (msg.card.type === 'contract' || msg.card.type === 'sale_inquiry')) {
          const { card, ...msgWithoutCard } = msg;
          console.log('[Contract] Removing card from history after decline:', msg.card.type);
          return msgWithoutCard;
        }
        return msg;
      });
    });

    // Add journal entry
    addJournalEntry({
      turnNumber,
      date: gameState.date,
      entry: `Declined a contract offer from ${contract.offeredBy || 'an emissary'}.`
    });

    // Trigger narrative turn for NPC/emissary reaction
    const npcName = contract.offeredBy || 'the messenger';
    const patientName = contract.patientName || 'their patient';
    const isHouseCall = contract.type === 'treatment';

    const declineAction = isHouseCall
      ? `politely decline ${npcName}'s request to treat ${patientName}`
      : `decline ${npcName}'s offer`;

    const llmInstructions = `
## CRITICAL: Contract Decline Reaction Protocol

Maria has declined ${npcName}'s ${isHouseCall ? 'house call request' : 'contract offer'}. Generate their reaction:

1. **Emotional Response**: Show how ${npcName} reacts (disappointment, anger, understanding, concern for ${patientName})
2. **Brief Dialogue**: 1-2 sentences from ${npcName} expressing their feelings
   ${isHouseCall ? `- Consider: They're worried about ${patientName}, may express urgency or desperation` : ''}
3. **Departure**: ${npcName} MUST leave after this exchange
   - Describe them exiting (walking out, leaving disappointed, hurrying away, etc.)
   - Set npcDeparted = true in your response
4. **No Lingering**: Do NOT have them continue pleading or negotiating

Example: "${npcName} sighs heavily, looking distressed. 'I understand, Doña Maria, though I fear for ${patientName}. I will seek another healer.' With a worried expression, they turn and hasten back toward the street."`;

    await handleSubmit(null, declineAction, {
      llmInstructions,
      actionResultType: 'contract_declined'
    });

    toast.info('Contract declined.', { duration: 2000 });
  }, [
    pendingContract,
    setPendingContract,
    setConversationHistory,
    addJournalEntry,
    turnNumber,
    gameState.date,
    toast,
    handleSubmit
  ]);

  return {
    handleAskQuestion,
    handleAcceptTreatment,
    handleDeclineContract,
  };
}
