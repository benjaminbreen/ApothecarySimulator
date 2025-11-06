/**
 * Medical Records Manager
 *
 * Manages patient medical records for the Patient Roster.
 * Tracks all patients Maria has actually treated with complete history:
 * - Q&A exchanges during diagnosis
 * - Symptoms and diagnoses
 * - Prescriptions and treatments
 * - Treatment outcomes
 */

import { resolvePortrait } from '../services/portraitResolver';

export class MedicalRecordsManager {
  /**
   * Add or update a patient session in medical records
   * @param {Object} currentRecords - Current medical records from game state
   * @param {Object} patient - Patient entity
   * @param {Object} sessionData - Session data
   * @param {string} sessionData.date - Session date
   * @param {number} sessionData.turnNumber - Turn number
   * @param {string} sessionData.sessionType - "examination" or "purchase"
   * @param {Array} sessionData.qaExchanges - Q&A exchanges [{ question, answer }]
   * @param {Array} sessionData.symptoms - Reported symptoms
   * @param {string} sessionData.diagnosis - Diagnosis text
   * @param {Array} sessionData.prescriptions - Prescriptions [{ medicine, route, dosage }]
   * @param {string} sessionData.outcome - Treatment outcome
   * @param {number} sessionData.payment - Payment amount (for purchases)
   * @param {string} sessionData.ailment - Brief ailment description (for purchases)
   * @returns {Object} Updated medical records
   */
  static addSession(currentRecords, patient, sessionData) {
    const patientId = patient.id || patient.name;
    const updatedRecords = { ...currentRecords };

    // Initialize patient record if doesn't exist
    if (!updatedRecords[patientId]) {
      // BUG FIX #3: Resolve portrait before storing in medical records
      // This ensures PatientRosterModal can display portraits correctly
      let resolvedPortrait = null;
      if (patient.portrait) {
        // Portrait is already resolved
        resolvedPortrait = patient.portrait;
      } else if (patient.primaryNPC && typeof patient.primaryNPC === 'object') {
        // Portrait needs resolution from primaryNPC object
        resolvedPortrait = resolvePortrait(patient.primaryNPC);
        console.log(`[MedicalRecords] Resolved portrait for ${patient.name}: ${resolvedPortrait}`);
      }

      updatedRecords[patientId] = {
        patientId,
        patientName: patient.name,
        age: patient.age || patient.appearance?.age || 'Unknown',
        occupation: patient.occupation || patient.social?.occupation || 'Unknown',
        portrait: resolvedPortrait,
        firstSeen: sessionData.date,
        lastSeen: sessionData.date,
        sessions: []
      };
    } else {
      // Update last seen date
      updatedRecords[patientId].lastSeen = sessionData.date;

      // BUG FIX #7: Also resolve portrait on subsequent visits if it's still missing
      if (!updatedRecords[patientId].portrait && patient.primaryNPC && typeof patient.primaryNPC === 'object') {
        const resolvedPortrait = resolvePortrait(patient.primaryNPC);
        updatedRecords[patientId].portrait = resolvedPortrait;
        console.log(`[MedicalRecords] Resolved missing portrait for returning patient ${patient.name}: ${resolvedPortrait}`);
      } else if (!updatedRecords[patientId].portrait && patient.portrait) {
        updatedRecords[patientId].portrait = patient.portrait;
        console.log(`[MedicalRecords] Updated missing portrait for returning patient ${patient.name}: ${patient.portrait}`);
      }
    }

    // Add new session
    const session = {
      date: sessionData.date,
      turnNumber: sessionData.turnNumber,
      sessionType: sessionData.sessionType || 'examination', // "examination" or "purchase"
      qaExchanges: sessionData.qaExchanges || [],
      symptoms: sessionData.symptoms || [],
      diagnosis: sessionData.diagnosis || '',
      prescriptions: sessionData.prescriptions || [],
      outcome: sessionData.outcome || 'In progress',
      payment: sessionData.payment || 0,
      ailment: sessionData.ailment || '', // For purchases: brief description
      timestamp: Date.now()
    };

    updatedRecords[patientId].sessions.push(session);

    console.log(`[MedicalRecords] Added ${session.sessionType} session for ${patient.name}:`, session);

    return updatedRecords;
  }

  /**
   * Update the most recent session for a patient
   * @param {Object} currentRecords - Current medical records
   * @param {string} patientId - Patient ID
   * @param {Object} updates - Fields to update in the latest session
   * @returns {Object} Updated medical records
   */
  static updateLatestSession(currentRecords, patientId, updates) {
    const updatedRecords = { ...currentRecords };

    if (!updatedRecords[patientId] || updatedRecords[patientId].sessions.length === 0) {
      console.warn(`[MedicalRecords] No session found for patient ${patientId}`);
      return updatedRecords;
    }

    const sessionIndex = updatedRecords[patientId].sessions.length - 1;
    updatedRecords[patientId].sessions[sessionIndex] = {
      ...updatedRecords[patientId].sessions[sessionIndex],
      ...updates
    };

    console.log(`[MedicalRecords] Updated session for ${patientId}:`, updates);

    return updatedRecords;
  }

  /**
   * Add Q&A exchange to the current session
   * @param {Object} currentRecords - Current medical records
   * @param {string} patientId - Patient ID
   * @param {string} question - Question asked
   * @param {string} answer - Answer received
   * @returns {Object} Updated medical records
   */
  static addQAExchange(currentRecords, patientId, question, answer) {
    const updatedRecords = { ...currentRecords };

    if (!updatedRecords[patientId] || updatedRecords[patientId].sessions.length === 0) {
      console.warn(`[MedicalRecords] No session found for patient ${patientId} to add Q&A`);
      return updatedRecords;
    }

    const sessionIndex = updatedRecords[patientId].sessions.length - 1;
    const currentSession = updatedRecords[patientId].sessions[sessionIndex];

    if (!currentSession.qaExchanges) {
      currentSession.qaExchanges = [];
    }

    currentSession.qaExchanges.push({ question, answer, timestamp: Date.now() });

    console.log(`[MedicalRecords] Added Q&A for ${patientId}:`, { question, answer });

    return updatedRecords;
  }

  /**
   * Get all treated patients (patients with medical records)
   * @param {Object} medicalRecords - Medical records from game state
   * @returns {Array} Array of patient records
   */
  static getTreatedPatients(medicalRecords) {
    return Object.values(medicalRecords || {}).sort((a, b) => {
      // Sort by last seen date (most recent first)
      return new Date(b.lastSeen) - new Date(a.lastSeen);
    });
  }

  /**
   * Get active patients (patients with incomplete treatments)
   * @param {Object} medicalRecords - Medical records from game state
   * @returns {Array} Array of active patient records
   */
  static getActivePatients(medicalRecords) {
    return Object.values(medicalRecords || {}).filter(record => {
      // BUG FIX #10: Check if sessions array exists before accessing
      if (!record.sessions || !Array.isArray(record.sessions) || record.sessions.length === 0) {
        return false;
      }
      const latestSession = record.sessions[record.sessions.length - 1];
      return latestSession && latestSession.outcome === 'In progress';
    });
  }

  /**
   * Get patient record by ID
   * @param {Object} medicalRecords - Medical records from game state
   * @param {string} patientId - Patient ID
   * @returns {Object|null} Patient record or null
   */
  static getPatientRecord(medicalRecords, patientId) {
    return medicalRecords[patientId] || null;
  }

  /**
   * Get total number of treated patients
   * @param {Object} medicalRecords - Medical records from game state
   * @returns {number} Count of treated patients
   */
  static getTreatedPatientsCount(medicalRecords) {
    return Object.keys(medicalRecords || {}).length;
  }

  /**
   * Get total number of sessions across all patients
   * @param {Object} medicalRecords - Medical records from game state
   * @returns {number} Total session count
   */
  static getTotalSessionsCount(medicalRecords) {
    return Object.values(medicalRecords || {}).reduce((total, record) => {
      // BUG FIX #11: Check if sessions array exists before accessing length
      return total + (record.sessions?.length || 0);
    }, 0);
  }
}

export default MedicalRecordsManager;
