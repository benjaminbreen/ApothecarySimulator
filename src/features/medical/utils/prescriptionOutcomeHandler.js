/**
 * Prescription Outcome Handler
 * Processes prescription completion and schedules follow-up visits
 *
 * Usage: Call handlePrescriptionComplete() after a prescription is successfully administered
 */

import { entityManager } from '../../../core/entities/EntityManager';
import { generateFollowUpSchedule, createSessionRecord, addSessionToMedicalRecord } from './followUpUtils';

/**
 * Extract outcome status from LLM-generated narrative
 * @param {string} narrative - Full outcome text
 * @returns {string} 'success' | 'failure' | 'complication' | 'death' | null
 */
function extractOutcomeStatus(narrative) {
  if (!narrative) return null;

  const lowerNarrative = narrative.toLowerCase();

  // Death takes highest priority
  if (lowerNarrative.includes('💀') ||
      lowerNarrative.includes('died') ||
      lowerNarrative.includes('death') ||
      lowerNarrative.includes('fatal') ||
      lowerNarrative.includes('passed away')) {
    return 'death';
  }

  // Complications
  if (lowerNarrative.includes('complication') ||
      lowerNarrative.includes('severe reaction') ||
      lowerNarrative.includes('worsened') ||
      lowerNarrative.includes('worse') ||
      lowerNarrative.includes('seizure') ||
      lowerNarrative.includes('unconscious') ||
      lowerNarrative.includes('collapsed')) {
    return 'complication';
  }

  // Failure/ineffective
  if (lowerNarrative.includes('ineffective') ||
      lowerNarrative.includes('no effect') ||
      lowerNarrative.includes('failed') ||
      lowerNarrative.includes('disappointed') ||
      lowerNarrative.includes('frustrated')) {
    return 'failure';
  }

  // Success indicators
  if (lowerNarrative.includes('successful') ||
      lowerNarrative.includes('improved') ||
      lowerNarrative.includes('better') ||
      lowerNarrative.includes('effective') ||
      lowerNarrative.includes('relief') ||
      lowerNarrative.includes('cured')) {
    return 'success';
  }

  return null; // Uncertain
}

/**
 * Handle prescription completion - schedule follow-up and update records
 * @param {Object} params - Prescription completion parameters
 * @param {Object} params.patient - Patient entity who received treatment
 * @param {Object} params.prescription - Prescription data
 * @param {string} params.prescription.substanceName - Name of prescribed substance
 * @param {number} params.prescription.amount - Amount prescribed
 * @param {string} params.prescription.route - Route of administration
 * @param {number} params.prescription.price - Price charged
 * @param {string} params.prescription.rationale - Treatment rationale (optional)
 * @param {Object} params.gameState - Current game state
 * @param {Function} params.setGameState - Game state setter function (DEPRECATED - use addScheduledFollowUp instead)
 * @param {Function} params.addScheduledFollowUp - Add follow-up helper from useGameState
 * @param {Function} params.addJournalEntry - Journal entry function (optional)
 * @param {Function} params.toast - Toast notification function (optional)
 * @param {string} params.outcomeNarrative - Full LLM-generated outcome text (optional, for urgency detection)
 * @param {string} params.journalSummary - Brief outcome summary (optional, for records)
 * @returns {Object} Updated patient entity with follow-up scheduled (or null if patient died)
 */
export function handlePrescriptionComplete({
  patient,
  prescription,
  gameState,
  setGameState, // DEPRECATED - for backward compatibility only
  addScheduledFollowUp, // NEW - preferred method
  addJournalEntry,
  toast,
  outcomeNarrative = '',
  journalSummary = ''
}) {
  if (!patient || !prescription) {
    console.error('[PrescriptionOutcome] Missing required parameters:', { patient, prescription });
    return patient;
  }

  console.log(`[PrescriptionOutcome] Processing prescription for ${patient.name}`);

  const { substanceName, amount, route, price, rationale } = prescription;
  const { date, turnNumber } = gameState;

  // Extract outcome status for death detection
  const outcomeStatus = extractOutcomeStatus(outcomeNarrative);

  // Generate follow-up schedule with outcome data for urgency detection
  const followUpData = generateFollowUpSchedule(
    patient,
    prescription,
    date,
    turnNumber,
    {
      outcomeNarrative: outcomeNarrative,
      treatmentOutcome: outcomeStatus
    }
  );

  // If patient died, mark them as deceased and return null
  if (!followUpData || outcomeStatus === 'death') {
    console.log(`[PrescriptionOutcome] Patient died - marking as deceased`);

    // Mark patient as deceased in EntityManager
    const deceasedPatient = {
      ...patient,
      isDead: true,
      treatmentStatus: 'deceased',
      deathDate: date,
      deathTurn: turnNumber
    };

    entityManager.update(patient.id, deceasedPatient);
    console.log(`[PrescriptionOutcome] Patient ${patient.name} marked as deceased in EntityManager`);

    return null;
  }

  console.log(`[PrescriptionOutcome] Follow-up scheduled for ${followUpData.scheduledDate} (turn ${followUpData.scheduledTurn})`);

  // Update patient entity with treatment tracking
  const updatedPatient = {
    ...patient,
    treatmentStatus: 'followup_scheduled',
    followUp: followUpData,
    treatmentProgress: {
      initialDiagnosis: patient.diagnosis || patient.medical?.diagnosis || 'Unknown condition',
      treatmentsGiven: [substanceName],
      lastTreatmentDate: date,
      lastTreatmentTurn: turnNumber,
      outcomeStatus: 'unknown', // Will be determined at follow-up
      symptomChanges: []
    }
  };

  // Create session record
  const sessionData = createSessionRecord({
    sessionNumber: 1, // Initial treatment
    date,
    turnNumber,
    type: 'initial',
    prescriptions: [substanceName],
    paymentReceived: price || 0,
    outcome: `Prescribed ${substanceName} (${amount} via ${route})`,
    notes: rationale || ''
  });

  // Add session to medical record
  addSessionToMedicalRecord(updatedPatient, sessionData);

  // Update EntityManager
  entityManager.update(patient.id, updatedPatient);
  console.log(`[PrescriptionOutcome] Updated patient entity: ${patient.id}`);

  // Add to game state scheduled follow-ups using new helper function
  const followUpEntry = {
    patientId: patient.id,
    patientName: patient.name,
    scheduledTurn: followUpData.scheduledTurn,
    priority: followUpData.priority
  };

  if (addScheduledFollowUp && typeof addScheduledFollowUp === 'function') {
    // NEW: Use helper function (preferred)
    addScheduledFollowUp(followUpEntry);
  } else if (setGameState && typeof setGameState === 'function') {
    // FALLBACK: Use old method for backward compatibility
    console.warn('[PrescriptionOutcome] Using deprecated setGameState - please pass addScheduledFollowUp instead');
    setGameState(prev => {
      const scheduledFollowUps = prev.scheduledFollowUps || [];

      // Check if already scheduled (prevent duplicates)
      const alreadyScheduled = scheduledFollowUps.some(f => f.patientId === patient.id);
      if (alreadyScheduled) {
        console.log(`[PrescriptionOutcome] Patient ${patient.name} already has a follow-up scheduled`);
        return prev;
      }

      return {
        ...prev,
        scheduledFollowUps: [...scheduledFollowUps, followUpEntry]
      };
    });
  }

  // Add journal entry if function provided
  if (addJournalEntry && typeof addJournalEntry === 'function') {
    addJournalEntry({
      turnNumber,
      date,
      entry: `Follow-up scheduled for ${patient.name} on ${followUpData.scheduledDate} (${followUpData.reason})`
    });
  }

  // Show toast notification for follow-up scheduling
  if (toast && typeof toast === 'function') {
    const timeLabel = followUpData.hoursAfterTreatment
      ? `in ${followUpData.hoursAfterTreatment} hours`
      : `in ${followUpData.daysAfterTreatment} day${followUpData.daysAfterTreatment > 1 ? 's' : ''}`;

    const urgencyIcon = followUpData.priority === 'urgent' ? '🚨 ' : '📅 ';

    toast.info(`${urgencyIcon}Follow-up scheduled for ${patient.name} ${timeLabel}`, {
      duration: 4000
    });
  }

  console.log(`[PrescriptionOutcome] ✓ Follow-up visit scheduled for ${patient.name}`);

  return updatedPatient;
}

/**
 * Handle follow-up visit outcome - process patient's return and determine next steps
 * @param {Object} params - Follow-up outcome parameters
 * @param {Object} params.patient - Patient entity returning for follow-up
 * @param {Object} params.outcomeData - Outcome data from NarrativeAgent
 * @param {string} params.outcomeData.outcomeStatus - 'improving' | 'stable' | 'worsening' | 'resolved'
 * @param {Array} params.outcomeData.symptomChanges - Changes in symptoms
 * @param {boolean} params.outcomeData.needsFurtherTreatment - Whether more treatment is needed
 * @param {Object} params.gameState - Current game state
 * @param {Function} params.setGameState - Game state setter function (DEPRECATED)
 * @param {Function} params.removeScheduledFollowUp - Remove follow-up helper from useGameState
 * @param {Function} params.updateScheduledFollowUp - Update follow-up helper from useGameState
 * @param {Function} params.addScheduledFollowUp - Add follow-up helper from useGameState
 * @param {Function} params.awardXP - XP award function (optional)
 * @param {Function} params.addJournalEntry - Journal entry function (optional)
 * @returns {Object} Updated patient entity
 */
export function handleFollowUpOutcome({
  patient,
  outcomeData,
  gameState,
  setGameState, // DEPRECATED
  removeScheduledFollowUp,
  updateScheduledFollowUp,
  addScheduledFollowUp,
  awardXP,
  addJournalEntry
}) {
  if (!patient || !outcomeData) {
    console.error('[FollowUpOutcome] Missing required parameters:', { patient, outcomeData });
    return patient;
  }

  console.log(`[FollowUpOutcome] Processing follow-up outcome for ${patient.name}: ${outcomeData.outcomeStatus}`);

  const { outcomeStatus, symptomChanges = [], needsFurtherTreatment = false } = outcomeData;
  const { date, turnNumber } = gameState;

  // Update patient treatment progress
  const updatedPatient = {
    ...patient,
    treatmentProgress: {
      ...patient.treatmentProgress,
      outcomeStatus,
      symptomChanges
    }
  };

  // Create follow-up session record
  const sessionNumber = (patient.medicalRecord?.sessions?.length || 0) + 1;
  const sessionData = createSessionRecord({
    sessionNumber,
    date,
    turnNumber,
    type: 'followup',
    prescriptions: [],
    paymentReceived: 0,
    outcome: `Follow-up visit - condition ${outcomeStatus}`,
    notes: symptomChanges.map(s => `${s.symptom}: ${s.before} → ${s.now}`).join('; ')
  });

  addSessionToMedicalRecord(updatedPatient, sessionData);

  // Handle based on outcome
  if (outcomeStatus === 'resolved') {
    // Treatment successful - mark as completed
    updatedPatient.treatmentStatus = 'completed';
    updatedPatient.followUp = null;

    // Award XP
    if (awardXP && typeof awardXP === 'function') {
      awardXP(5, `successful_treatment_${patient.name}`);
      console.log('[FollowUpOutcome] Awarded 5 XP for successful treatment');
    }

    // Remove from scheduled follow-ups
    if (removeScheduledFollowUp && typeof removeScheduledFollowUp === 'function') {
      removeScheduledFollowUp(patient.id);
    } else if (setGameState && typeof setGameState === 'function') {
      // FALLBACK: Use old method for backward compatibility
      setGameState(prev => ({
        ...prev,
        scheduledFollowUps: prev.scheduledFollowUps.filter(f => f.patientId !== patient.id)
      }));
    }

    // Journal entry
    if (addJournalEntry) {
      addJournalEntry({
        turnNumber,
        date,
        entry: `✓ ${patient.name} has fully recovered! Treatment complete.`
      });
    }

    console.log(`[FollowUpOutcome] ✓ Treatment completed successfully for ${patient.name}`);

  } else if (outcomeStatus === 'improving') {
    // Schedule another follow-up
    const newFollowUp = generateFollowUpSchedule(
      updatedPatient,
      { type: 'continued_care' },
      date,
      turnNumber
    );

    updatedPatient.followUp = newFollowUp;
    updatedPatient.treatmentStatus = 'followup_scheduled';

    // Update scheduled follow-ups
    if (updateScheduledFollowUp && typeof updateScheduledFollowUp === 'function') {
      updateScheduledFollowUp(patient.id, {
        scheduledTurn: newFollowUp.scheduledTurn,
        priority: newFollowUp.priority
      });
    } else if (setGameState && typeof setGameState === 'function') {
      // FALLBACK: Use old method for backward compatibility
      setGameState(prev => ({
        ...prev,
        scheduledFollowUps: prev.scheduledFollowUps.map(f =>
          f.patientId === patient.id
            ? { ...f, scheduledTurn: newFollowUp.scheduledTurn, priority: newFollowUp.priority }
            : f
        )
      }));
    }

    // Award partial XP
    if (awardXP && typeof awardXP === 'function') {
      awardXP(2, `treatment_improving_${patient.name}`);
      console.log('[FollowUpOutcome] Awarded 2 XP for improving treatment');
    }

    // Journal entry
    if (addJournalEntry) {
      addJournalEntry({
        turnNumber,
        date,
        entry: `${patient.name}'s condition is improving. Follow-up scheduled for ${newFollowUp.scheduledDate}.`
      });
    }

  } else if (outcomeStatus === 'worsening' || outcomeStatus === 'stable') {
    // Treatment not working - needs different approach
    updatedPatient.treatmentStatus = 'active';
    updatedPatient.followUp = null;

    // Remove from scheduled follow-ups
    if (removeScheduledFollowUp && typeof removeScheduledFollowUp === 'function') {
      removeScheduledFollowUp(patient.id);
    } else if (setGameState && typeof setGameState === 'function') {
      // FALLBACK: Use old method for backward compatibility
      setGameState(prev => ({
        ...prev,
        scheduledFollowUps: prev.scheduledFollowUps.filter(f => f.patientId !== patient.id)
      }));
    }

    // Journal entry
    if (addJournalEntry) {
      addJournalEntry({
        turnNumber,
        date,
        entry: `⚠ ${patient.name}'s condition is ${outcomeStatus}. Treatment may need adjustment.`
      });
    }

    console.log(`[FollowUpOutcome] ⚠ Treatment ${outcomeStatus} for ${patient.name}`);
  }

  // Update EntityManager
  entityManager.update(patient.id, updatedPatient);

  return updatedPatient;
}

export default {
  handlePrescriptionComplete,
  handleFollowUpOutcome
};
