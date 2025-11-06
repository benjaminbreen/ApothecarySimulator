/**
 * Follow-Up Visit Utilities
 * Helper functions for scheduling and managing patient follow-up visits
 */

/**
 * Generate follow-up schedule based on treatment type and condition severity
 * @param {Object} patient - Patient entity
 * @param {Object} prescription - Treatment given (or { type: "continued_care" } for subsequent follow-ups)
 * @param {string} currentDate - Current game date
 * @param {number} currentTurn - Current turn number
 * @param {Object} options - Optional parameters
 * @param {string} options.treatmentOutcome - 'success', 'failure', 'complication', 'death' (for quick follow-ups)
 * @param {string} options.outcomeNarrative - Full outcome text for analysis
 * @returns {Object} Follow-up schedule data
 */
export function generateFollowUpSchedule(patient, prescription, currentDate, currentTurn, options = {}) {
  // Determine days until follow-up based on condition severity
  let daysUntilFollowUp = 3; // Default
  let hoursUntilFollowUp = null; // For very quick follow-ups
  let priority = "routine";
  let reason = "Check treatment progress";

  // Get diagnosis (from multiple possible locations)
  const diagnosis = (
    patient.diagnosis ||
    patient.medical?.diagnosis ||
    patient.medicalRecord?.diagnoses?.[0]?.diagnosis ||
    ""
  ).toLowerCase();

  // Get symptoms
  const symptoms = patient.symptoms || patient.medical?.symptoms || [];

  // QUICK FOLLOW-UP: Check if treatment outcome suggests immediate return
  if (options.treatmentOutcome || options.outcomeNarrative) {
    const outcome = options.treatmentOutcome?.toLowerCase() || '';
    const narrative = (options.outcomeNarrative || '').toLowerCase();

    // Very bad outcomes = return in hours
    if (outcome === 'failure' || outcome === 'complication' ||
        narrative.includes('worsened') || narrative.includes('worse') ||
        narrative.includes('complication') || narrative.includes('severe reaction') ||
        narrative.includes('vomiting') || narrative.includes('seizure') ||
        narrative.includes('unconscious') || narrative.includes('collapsed')) {

      hoursUntilFollowUp = 4; // Return in 4 hours (roughly 1 turn)
      daysUntilFollowUp = 0;
      priority = "urgent";
      reason = "Emergency follow-up - treatment complications";
      console.log(`[FollowUpUtils] URGENT: Bad outcome detected - scheduling emergency follow-up in ${hoursUntilFollowUp} hours`);
    }
    // Moderately bad outcomes = return same day (8-12 hours)
    else if (outcome === 'ineffective' ||
             narrative.includes('no effect') || narrative.includes('ineffective') ||
             narrative.includes('still suffering') || narrative.includes('pain persists') ||
             narrative.includes('disappointed') || narrative.includes('frustrated')) {

      hoursUntilFollowUp = 8; // Return in 8 hours (roughly 2 turns)
      daysUntilFollowUp = 0;
      priority = "urgent";
      reason = "Same-day follow-up - treatment ineffective";
      console.log(`[FollowUpUtils] Treatment ineffective - scheduling same-day follow-up in ${hoursUntilFollowUp} hours`);
    }
    // Death = no follow-up
    else if (outcome === 'death' || narrative.includes('died') || narrative.includes('death') ||
             narrative.includes('💀') || narrative.includes('passed away')) {
      console.log(`[FollowUpUtils] Patient died - no follow-up scheduled`);
      return null; // No follow-up if patient died
    }
  }

  // Severity-based scheduling logic (only if not already set by outcome)
  if (diagnosis.includes("wound") || diagnosis.includes("injury") || diagnosis.includes("laceration")) {
    daysUntilFollowUp = 3; // Wounds need checking soon
    reason = "Check wound healing";
  } else if (diagnosis.includes("fever") || diagnosis.includes("infection") || diagnosis.includes("sepsis")) {
    daysUntilFollowUp = 2; // Infections are urgent
    priority = "urgent";
    reason = "Monitor infection progress";
  } else if (diagnosis.includes("fracture") || diagnosis.includes("broken") || diagnosis.includes("bone")) {
    daysUntilFollowUp = 5; // Fractures heal slowly
    reason = "Check bone healing";
  } else if (diagnosis.includes("burn")) {
    daysUntilFollowUp = 4;
    reason = "Monitor burn recovery";
  } else if (diagnosis.includes("chronic") || diagnosis.includes("persistent")) {
    daysUntilFollowUp = 7; // Chronic conditions can wait longer
    reason = "Assess chronic condition";
  } else if (diagnosis.includes("pain") && !diagnosis.includes("severe")) {
    daysUntilFollowUp = 5; // Pain management follow-up
    reason = "Assess pain management";
  } else if (diagnosis.includes("cough") || diagnosis.includes("respiratory")) {
    daysUntilFollowUp = 4;
    reason = "Check respiratory symptoms";
  } else if (diagnosis.includes("stomach") || diagnosis.includes("abdominal") || diagnosis.includes("digestive")) {
    daysUntilFollowUp = 3;
    reason = "Monitor digestive health";
  }

  // Check symptom severity to adjust priority
  const hasSevereSymptoms = symptoms.some(s =>
    (typeof s === 'object' && s.severity === 'severe') ||
    (typeof s === 'string' && s.toLowerCase().includes('severe'))
  );

  if (hasSevereSymptoms && priority === "routine") {
    priority = "urgent";
    daysUntilFollowUp = Math.max(2, daysUntilFollowUp - 1); // Schedule sooner
  }

  // Calculate follow-up date and turn
  let followUpDate;
  let followUpTurn;

  if (hoursUntilFollowUp !== null) {
    // Quick follow-up in hours (same day or next day)
    followUpDate = currentDate; // Same day for hours
    // 1 turn ≈ 3-4 hours, so divide hours by 4
    const turnsUntilFollowUp = Math.ceil(hoursUntilFollowUp / 4);
    followUpTurn = currentTurn + turnsUntilFollowUp;

    console.log(`[FollowUpUtils] Generated URGENT schedule: ${patient.name || 'Patient'} - ${hoursUntilFollowUp} hours (${turnsUntilFollowUp} turns, turn ${followUpTurn}), ${priority} priority`);
  } else {
    // Normal follow-up in days
    const currentDateObj = new Date(currentDate);
    const followUpDateObj = new Date(currentDateObj);
    followUpDateObj.setDate(followUpDateObj.getDate() + daysUntilFollowUp);

    followUpDate = followUpDateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Estimate turn number (roughly 1 turn = 3-4 hours of game time)
    // Assume 6 turns per day on average
    followUpTurn = currentTurn + (daysUntilFollowUp * 6);

    console.log(`[FollowUpUtils] Generated schedule: ${patient.name || 'Patient'} - ${daysUntilFollowUp} days (turn ${followUpTurn}), ${priority} priority`);
  }

  return {
    scheduledDate: followUpDate,
    scheduledTurn: followUpTurn,
    reason,
    daysAfterTreatment: daysUntilFollowUp,
    hoursAfterTreatment: hoursUntilFollowUp, // For urgent same-day follow-ups
    priority,
    missedVisits: 0
  };
}

/**
 * Calculate days between two date strings
 * @param {string} date1Str - First date (earlier)
 * @param {string} date2Str - Second date (later)
 * @returns {number} Number of days between dates
 */
export function calculateDaysBetween(date1Str, date2Str) {
  try {
    const date1 = new Date(date1Str);
    const date2 = new Date(date2Str);

    // Check for invalid dates
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      console.warn('[FollowUpUtils] Invalid date(s) provided:', date1Str, date2Str);
      return 0;
    }

    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('[FollowUpUtils] Error calculating days between dates:', error);
    return 0;
  }
}

/**
 * Check if a patient has a follow-up scheduled
 * @param {Object} patient - Patient entity
 * @returns {boolean} True if follow-up is scheduled
 */
export function hasScheduledFollowUp(patient) {
  return patient.treatmentStatus === 'followup_scheduled' && patient.followUp !== null;
}

/**
 * Check if a follow-up is overdue
 * @param {Object} followUp - Follow-up data from patient entity
 * @param {number} currentTurn - Current turn number
 * @returns {boolean} True if follow-up is overdue
 */
export function isFollowUpOverdue(followUp, currentTurn) {
  if (!followUp || !followUp.scheduledTurn) return false;
  return currentTurn > followUp.scheduledTurn + 5; // Allow 5 turns grace period
}

/**
 * Check if a follow-up is due now or soon
 * @param {Object} followUp - Follow-up data from patient entity
 * @param {number} currentTurn - Current turn number
 * @returns {boolean} True if follow-up is due within 3 turns
 */
export function isFollowUpDue(followUp, currentTurn) {
  if (!followUp || !followUp.scheduledTurn) return false;
  return currentTurn >= followUp.scheduledTurn && currentTurn <= followUp.scheduledTurn + 3;
}

/**
 * Generate a session record for medical records
 * @param {Object} params - Session parameters
 * @returns {Object} Session record
 */
export function createSessionRecord({
  sessionNumber,
  date,
  turnNumber,
  type, // 'initial' or 'followup'
  prescriptions = [],
  paymentReceived = 0,
  outcome = '',
  notes = ''
}) {
  return {
    sessionNumber,
    date,
    turnNumber,
    type,
    prescriptions,
    paymentReceived,
    outcome,
    notes,
    timestamp: new Date().toISOString()
  };
}

/**
 * Update patient's medical record with a new session
 * @param {Object} patient - Patient entity
 * @param {Object} sessionData - Session data to add
 * @returns {Object} Updated patient entity
 */
export function addSessionToMedicalRecord(patient, sessionData) {
  // Initialize medicalRecord if it doesn't exist
  if (!patient.medicalRecord) {
    patient.medicalRecord = {
      diagnoses: [],
      treatments: [],
      notes: [],
      sessions: []
    };
  }

  // Ensure sessions array exists
  if (!patient.medicalRecord.sessions) {
    patient.medicalRecord.sessions = [];
  }

  // Add the new session
  patient.medicalRecord.sessions.push(sessionData);

  console.log(`[FollowUpUtils] Added session ${sessionData.sessionNumber} to ${patient.name || 'patient'}'s medical record`);

  return patient;
}

/**
 * Determine if patient needs further treatment based on outcome
 * @param {string} outcomeStatus - 'improving', 'stable', 'worsening', 'resolved'
 * @returns {boolean} True if needs more treatment
 */
export function needsFurtherTreatment(outcomeStatus) {
  return outcomeStatus === 'worsening' || outcomeStatus === 'improving' || outcomeStatus === 'stable';
}

/**
 * Calculate next follow-up turn for recurring visits
 * @param {string} outcomeStatus - Current outcome status
 * @param {number} currentTurn - Current turn number
 * @returns {number} Next follow-up turn number
 */
export function calculateNextFollowUpTurn(outcomeStatus, currentTurn) {
  let turnsUntilNext;

  switch (outcomeStatus) {
    case 'worsening':
      turnsUntilNext = 4; // Check again in ~16 hours (urgent)
      break;
    case 'stable':
      turnsUntilNext = 12; // Check in ~2 days (routine)
      break;
    case 'improving':
      turnsUntilNext = 9; // Check in ~1.5 days (routine)
      break;
    default:
      turnsUntilNext = 6; // Default ~1 day
  }

  return currentTurn + turnsUntilNext;
}

export default {
  generateFollowUpSchedule,
  calculateDaysBetween,
  hasScheduledFollowUp,
  isFollowUpOverdue,
  isFollowUpDue,
  createSessionRecord,
  addSessionToMedicalRecord,
  needsFurtherTreatment,
  calculateNextFollowUpTurn
};
