// PatientEnrichment - Utilities for enriching patient entities with LLM-extracted data
// Handles intelligent merging of symptoms, family history, and medical data

/**
 * Calculate string similarity (Levenshtein distance)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistance(str1, str2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  const costs = [];

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }

  return costs[s2.length];
}

/**
 * Check if two symptoms are similar enough to be considered the same
 * @param {Object} symptom1 - First symptom
 * @param {Object} symptom2 - Second symptom
 * @returns {boolean} True if symptoms are similar
 */
function areSymptomsSimil(symptom1, symptom2) {
  // Same location is required
  if (symptom1.location !== symptom2.location) {
    return false;
  }

  // Check name similarity
  const nameDistance = levenshteinDistance(symptom1.name, symptom2.name);
  const maxLength = Math.max(symptom1.name.length, symptom2.name.length);
  const nameSimilarity = 1 - (nameDistance / maxLength);

  // Consider similar if >70% name match and same location
  return nameSimilarity > 0.7;
}

/**
 * Merge new symptom with existing symptom
 * @param {Object} existing - Existing symptom
 * @param {Object} newSymptom - New symptom data
 * @returns {Object} Merged symptom
 */
function mergeSymptoms(existing, newSymptom) {
  return {
    ...existing,
    // Update fields if new data is more specific
    severity: newSymptom.severity || existing.severity,
    type: newSymptom.type || existing.type,
    description: newSymptom.description || existing.description,
    // Add new fields
    onset: newSymptom.onset || existing.onset,
    trigger: newSymptom.trigger || existing.trigger,
    // Keep or update quote (prefer more recent/detailed)
    quote: (newSymptom.quote?.length > existing.quote?.length)
      ? newSymptom.quote
      : existing.quote,
    // Track update metadata
    lastUpdated: new Date().toISOString(),
    source: 'patient-dialogue'
  };
}

/**
 * Intelligently merge new symptoms with existing symptoms
 * Avoids duplicates and updates existing symptoms with new information
 * @param {Array} existingSymptoms - Current patient symptoms
 * @param {Array} newSymptoms - New symptoms from dialogue
 * @returns {Array} Merged symptom list
 */
export function mergeSymptomsIntelligently(existingSymptoms = [], newSymptoms = []) {
  if (!newSymptoms || newSymptoms.length === 0) {
    return existingSymptoms;
  }

  const merged = [...existingSymptoms];
  const addedSymptoms = [];

  for (const newSymptom of newSymptoms) {
    // Try to find similar existing symptom
    const existingIndex = merged.findIndex(existing =>
      areSymptomsSimil(existing, newSymptom)
    );

    if (existingIndex !== -1) {
      // Update existing symptom
      console.log(`[PatientEnrichment] Updating existing symptom: ${newSymptom.name}`);
      merged[existingIndex] = mergeSymptoms(merged[existingIndex], newSymptom);
    } else {
      // Add new symptom
      console.log(`[PatientEnrichment] Adding new symptom: ${newSymptom.name}`);
      merged.push({
        ...newSymptom,
        discoveredAt: new Date().toISOString(),
        source: 'patient-dialogue'
      });
      addedSymptoms.push(newSymptom);
    }
  }

  return {
    symptoms: merged,
    newSymptoms: addedSymptoms // Track which symptoms were just discovered
  };
}

/**
 * Merge family history information
 * @param {string} existing - Existing family history
 * @param {string} newInfo - New family information
 * @returns {string} Merged family history
 */
function mergeFamilyHistory(existing, newInfo) {
  if (!newInfo) return existing;
  if (!existing) return newInfo;

  // Avoid exact duplicates
  if (existing.includes(newInfo) || newInfo.includes(existing)) {
    return existing.length > newInfo.length ? existing : newInfo;
  }

  // Append new information
  return `${existing}\n${newInfo}`;
}

/**
 * Merge medical history information
 * @param {string} existing - Existing medical history
 * @param {string} newInfo - New medical information
 * @returns {string} Merged medical history
 */
function mergeMedicalHistory(existing, newInfo) {
  if (!newInfo) return existing;
  if (!existing) return newInfo;

  // Avoid exact duplicates
  if (existing.includes(newInfo) || newInfo.includes(existing)) {
    return existing.length > newInfo.length ? existing : newInfo;
  }

  // Append with timestamp
  const timestamp = new Date().toLocaleDateString();
  return `${existing}\n[${timestamp}] ${newInfo}`;
}

/**
 * Merge vital signs (always prefer most recent)
 * @param {Object} existing - Existing vitals
 * @param {Object} newVitals - New vital signs
 * @returns {Object} Merged vitals with timestamp
 */
function mergeVitals(existing, newVitals) {
  if (!newVitals) return existing;

  return {
    ...existing,
    ...newVitals, // New values override old
    lastExamined: new Date().toISOString()
  };
}

/**
 * Enrich patient entity with LLM-extracted data
 * Main entry point for updating patient data from dialogue
 * @param {Object} patient - Current patient entity
 * @param {Object} extractedData - Data extracted from LLM
 * @returns {Object} Enriched patient entity
 */
export function enrichPatientData(patient, extractedData) {
  if (!extractedData) {
    console.log('[PatientEnrichment] No extracted data to merge');
    return { patient, newSymptoms: [] };
  }

  console.log('[PatientEnrichment] Enriching patient with extracted data:', extractedData);

  // Merge symptoms intelligently
  const symptomResult = mergeSymptomsIntelligently(
    patient.symptoms || [],
    extractedData.symptoms || []
  );

  // Create enriched patient
  const enriched = {
    ...patient,
    symptoms: symptomResult.symptoms,

    // Merge text fields
    family: extractedData.family
      ? mergeFamilyHistory(patient.family, extractedData.family)
      : patient.family,

    medicalHistory: extractedData.medicalHistory
      ? mergeMedicalHistory(patient.medicalHistory, extractedData.medicalHistory)
      : patient.medicalHistory,

    // Update occupation if more specific
    occupation: extractedData.occupation || patient.occupation,
    occupationDetail: extractedData.occupationDetail || patient.occupationDetail,

    // Merge vitals (most recent wins)
    vitals: extractedData.vitals
      ? mergeVitals(patient.vitals, extractedData.vitals)
      : patient.vitals,

    // Metadata
    lastUpdated: new Date().toISOString(),
    dataSource: 'llm-enriched'
  };

  return {
    patient: enriched,
    newSymptoms: symptomResult.newSymptoms // For UI notifications
  };
}

/**
 * Create a minimal patient entity from scratch (for procedural generation)
 * @param {string} name - Patient name
 * @param {Object} initialData - Initial patient data from LLM
 * @returns {Object} New patient entity
 */
export function createPatientFromData(name, initialData = {}) {
  return {
    name,
    entityType: 'patient',
    type: 'patient',

    // Basic info
    age: initialData.age || null,
    gender: initialData.gender || null,
    occupation: initialData.occupation || null,
    family: initialData.family || null,
    background: initialData.background || null,

    // Medical data
    symptoms: initialData.symptoms || [],
    medicalHistory: initialData.medicalHistory || null,
    vitals: initialData.vitals || null,

    // Metadata
    createdAt: new Date().toISOString(),
    dataSource: 'llm-generated',
    isProcedural: true // Flag to indicate this wasn't in EntityList
  };
}

export default {
  enrichPatientData,
  mergeSymptomsIntelligently,
  createPatientFromData
};
