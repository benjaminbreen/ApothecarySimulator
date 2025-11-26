// PatientEnrichment - Utilities for enriching patient entities with LLM-extracted data
// Handles intelligent merging of symptoms, family history, and medical data

import { calculateZodiacSign, calculateAge } from '../utils/astrologyCalculator';
import { normalizeVital } from '../utils/vitalNormalizer';

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
 * Uses name similarity first, then location, and description overlap to detect duplicates
 * @param {Object} symptom1 - First symptom
 * @param {Object} symptom2 - Second symptom
 * @returns {boolean} True if symptoms are similar
 */
function areSymptomsSimil(symptom1, symptom2) {
  // Check name similarity FIRST (lowered threshold to catch "Weakness" vs "Extreme weakness")
  const nameDistance = levenshteinDistance(symptom1.name, symptom2.name);
  const maxLength = Math.max(symptom1.name.length, symptom2.name.length);
  const nameSimilarity = 1 - (nameDistance / maxLength);

  // If names are very similar (>80%) or identical, merge regardless of location
  // This handles cases like "Speech difficulty" in "general" vs "ears"
  if (nameSimilarity > 0.8) {
    console.log(`[PatientEnrichment] Strong name match (${(nameSimilarity * 100).toFixed(0)}%): "${symptom1.name}" ≈ "${symptom2.name}" - merging despite different locations`);
    return true;
  }

  // For moderate name similarity (60-80%), also check location must match
  // This prevents merging unrelated symptoms like "Pain" in different body parts
  if (nameSimilarity > 0.6) {
    const loc1 = symptom1.location?.toLowerCase() || '';
    const loc2 = symptom2.location?.toLowerCase() || '';

    if (loc1 === loc2) {
      console.log(`[PatientEnrichment] Moderate name match (${(nameSimilarity * 100).toFixed(0)}%) with same location: "${symptom1.name}" ≈ "${symptom2.name}"`);
      return true;
    }
  }

  // Fallback: Check description overlap for semantic similarity
  // Catches cases like "Dryness" vs "Coating" (both describe tongue coating)
  if (symptom1.description && symptom2.description) {
    const desc1 = symptom1.description.toLowerCase();
    const desc2 = symptom2.description.toLowerCase();

    // Extract significant words (>4 chars) for comparison
    const words1 = desc1.split(/\s+/).filter(w => w.length > 4);
    const words2 = desc2.split(/\s+/).filter(w => w.length > 4);

    if (words1.length === 0 || words2.length === 0) {
      return false; // Not enough content to compare
    }

    // Count common words
    const commonWords = words1.filter(w => words2.includes(w));
    const overlapRatio = commonWords.length / Math.min(words1.length, words2.length);

    // If >40% of words overlap, consider it the same symptom
    if (overlapRatio > 0.4) {
      console.log(`[PatientEnrichment] Description overlap (${(overlapRatio * 100).toFixed(0)}%): "${symptom1.name}" ≈ "${symptom2.name}"`);
      console.log(`[PatientEnrichment] Common words:`, commonWords.join(', '));
      return true;
    }
  }

  return false;
}

/**
 * Merge new symptom with existing symptom
 * Combines descriptions intelligently to preserve all details
 * @param {Object} existing - Existing symptom
 * @param {Object} newSymptom - New symptom data
 * @returns {Object} Merged symptom
 */
function mergeSymptoms(existing, newSymptom) {
  // Merge descriptions intelligently
  let mergedDescription = existing.description;

  if (newSymptom.description && newSymptom.description !== existing.description) {
    // Check if new description adds information (not just rewording)
    const existingWords = existing.description.toLowerCase().split(/\s+/);
    const newWords = newSymptom.description.toLowerCase().split(/\s+/);
    const uniqueNewWords = newWords.filter(w => w.length > 4 && !existingWords.includes(w));

    // If new description has unique information, append it
    if (uniqueNewWords.length > 2) {
      mergedDescription = `${existing.description}; ${newSymptom.description}`;
      console.log(`[PatientEnrichment] Appending additional symptom details for "${existing.name}"`);
    } else {
      // Otherwise prefer the longer/more detailed description
      mergedDescription = (newSymptom.description.length > existing.description.length)
        ? newSymptom.description
        : existing.description;
    }
  }

  return {
    ...existing,
    // Use more specific name if provided (e.g., "General Weakness" → "Extreme weakness")
    name: newSymptom.name || existing.name,
    // Update severity if new one is more severe
    severity: newSymptom.severity || existing.severity,
    type: newSymptom.type || existing.type,
    description: mergedDescription,
    // Add new fields
    onset: newSymptom.onset || existing.onset,
    trigger: newSymptom.trigger || existing.trigger,
    // Keep or update quote (prefer more recent/detailed)
    quote: (newSymptom.quote?.length > (existing.quote?.length || 0))
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
 * @returns {Object} { symptoms: Array, newSymptoms: Array }
 */
export function mergeSymptomsIntelligently(existingSymptoms = [], newSymptoms = []) {
  if (!newSymptoms || newSymptoms.length === 0) {
    return { symptoms: existingSymptoms, newSymptoms: [] };
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
 * Normalizes LLM variations and tracks history for trend indicators
 * @param {Object} existing - Existing vitals
 * @param {Object} newVitals - New vital signs
 * @returns {Object} Merged vitals with timestamp and history
 */
function mergeVitals(existing, newVitals) {
  if (!newVitals) return existing;

  const timestamp = new Date().toISOString();

  // Normalize all vital values (maps "fast"→"rapid", "burning"→"hot", etc.)
  const normalized = {};
  for (const [key, value] of Object.entries(newVitals)) {
    normalized[key] = normalizeVital(key, value);
  }

  // Initialize history array if missing
  const history = existing?.history || [];

  // Add current vitals as a snapshot for trend tracking
  history.push({
    timestamp,
    values: { ...existing, ...normalized }
  });

  return {
    ...existing,
    ...normalized, // New normalized values override old
    history: history.slice(-10), // Keep last 10 readings only
    lastExamined: timestamp
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

  // Handle name (overwrite if provided - patient told us their real name)
  const name = extractedData.name || patient.name;

  // Handle birth date and auto-calculate age & astrology
  let birthDate = extractedData.birthDate || patient.birthDate;
  let age = extractedData.age || patient.appearance?.age || patient.age;
  let gender = extractedData.gender || patient.appearance?.gender || patient.gender;
  let astrology = patient.astrology; // Keep existing if not recalculating

  // If birth date was provided, calculate age and astrology
  if (extractedData.birthDate) {
    birthDate = extractedData.birthDate;
    astrology = calculateZodiacSign(birthDate);
    // CRITICAL FIX: Pass game year (1680) as currentDate to prevent using real-world year (2025)
    // This prevents age corruption bug where 32-year-old becomes 377 (2025 - 1648 = 377)
    const gameDate = 'August 22, 1680'; // Game's default date
    age = calculateAge(birthDate, gameDate) || age; // Fallback to extracted age if calculation fails
    console.log('[PatientEnrichment] Calculated astrology from birthDate:', astrology);
  }

  console.log('[PatientEnrichment] Extracted data - age:', age, 'gender:', gender);

  // Merge humoral characteristics
  const humors = {
    temperature: extractedData.humors?.temperature || patient.humors?.temperature,
    moisture: extractedData.humors?.moisture || patient.humors?.moisture
  };

  // Create enriched patient
  const enriched = {
    ...patient,
    name,
    age,
    gender, // Apply extracted gender
    birthDate,
    astrology,
    humors,
    symptoms: symptomResult.symptoms,

    // Update appearance object with gender
    appearance: {
      ...patient.appearance,
      age, // Also update appearance.age
      gender // Update appearance.gender
    },

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
