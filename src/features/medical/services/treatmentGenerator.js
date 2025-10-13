// Procedural treatment history generator
// Creates realistic historical physician notes

import {
  PRACTITIONER_TYPES,
  TREATMENTS_BY_SYMPTOM,
  PRACTITIONER_NAMES,
  generatePastDate
} from '../data/historicalTreatments';

/**
 * Generate procedural treatment history for a patient
 * @param {Object} patient - Patient data with symptoms
 * @param {number} count - Number of past treatments to generate
 * @returns {Array} Array of treatment entries
 */
export function generateTreatmentHistory(patient, count = 3) {
  const treatments = [];
  const { diagnosis = '', symptoms = [] } = patient;

  // Determine which symptoms to treat
  const symptomsToTreat = extractSymptoms(diagnosis, symptoms);

  for (let i = 0; i < count; i++) {
    const daysAgo = (i + 1) * 2 + Math.floor(Math.random() * 3); // 2-5 day intervals
    const treatment = generateSingleTreatment(symptomsToTreat, daysAgo, i);
    if (treatment) {
      treatments.push(treatment);
    }
  }

  return treatments.reverse(); // Oldest first
}

/**
 * Extract symptoms from diagnosis text and symptom array
 */
function extractSymptoms(diagnosis, symptoms) {
  const symptomKeywords = [];

  // Parse diagnosis text for symptom keywords
  const lowerDiagnosis = diagnosis.toLowerCase();

  if (lowerDiagnosis.includes('headache') || lowerDiagnosis.includes('head pain')) {
    symptomKeywords.push('headache');
  }
  if (lowerDiagnosis.includes('fever')) {
    symptomKeywords.push('fever');
  }
  if (lowerDiagnosis.includes('joint pain') || lowerDiagnosis.includes('joints')) {
    symptomKeywords.push('joint_pain');
  }
  if (lowerDiagnosis.includes('lesion') || lowerDiagnosis.includes('rash') || lowerDiagnosis.includes('skin')) {
    symptomKeywords.push('skin_lesions');
  }
  if (lowerDiagnosis.includes('abdominal') || lowerDiagnosis.includes('stomach')) {
    symptomKeywords.push('abdominal_pain');
  }
  if (lowerDiagnosis.includes('chest pain') || lowerDiagnosis.includes('breathing')) {
    symptomKeywords.push('chest_pain');
  }

  // Add from symptoms array if provided
  symptoms.forEach(symptom => {
    // Handle both string symptoms and object symptoms {name, location, quote}
    const symptomText = typeof symptom === 'string' ? symptom : (symptom?.name || '');
    const lowerSymptom = symptomText.toLowerCase();

    if (lowerSymptom.includes('headache')) symptomKeywords.push('headache');
    if (lowerSymptom.includes('fever')) symptomKeywords.push('fever');
    if (lowerSymptom.includes('joint')) symptomKeywords.push('joint_pain');
    if (lowerSymptom.includes('skin') || lowerSymptom.includes('lesion')) symptomKeywords.push('skin_lesions');
    if (lowerSymptom.includes('vision') || lowerSymptom.includes('eye')) symptomKeywords.push('vision_problems');
    if (lowerSymptom.includes('cough') || lowerSymptom.includes('throat')) symptomKeywords.push('respiratory');
    if (lowerSymptom.includes('pain')) symptomKeywords.push('pain');
  });

  // Remove duplicates
  return [...new Set(symptomKeywords)];
}

/**
 * Generate a single treatment entry
 */
function generateSingleTreatment(symptoms, daysAgo, index) {
  if (symptoms.length === 0) {
    return generateGenericTreatment(daysAgo);
  }

  // Select a random symptom to address
  const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];

  // Select practitioner type (weighted: physicians more common early, folk healers tried when desperate)
  const practitionerTypes = ['physician', 'curandera', 'barber_surgeon', 'apothecary'];
  const weights = index === 0 ? [0.6, 0.2, 0.1, 0.1] : [0.4, 0.3, 0.15, 0.15]; // First treatment more likely physician
  const practitionerType = weightedRandom(practitionerTypes, weights);

  // Get treatment options for this symptom and practitioner
  const treatmentOptions = TREATMENTS_BY_SYMPTOM[symptom]?.[practitionerType];

  if (!treatmentOptions || treatmentOptions.length === 0) {
    return generateGenericTreatment(daysAgo);
  }

  const treatment = treatmentOptions[Math.floor(Math.random() * treatmentOptions.length)];
  const practitionerData = PRACTITIONER_TYPES[practitionerType];
  const practitionerName = selectPractitionerName(practitionerType);

  // Select outcome
  const outcomeType = weightedRandom(
    ['outcome_positive', 'outcome_neutral', 'outcome_negative'],
    [0.3, 0.5, 0.2] // Treatments often don't help much in 1680s
  );

  return {
    date: generatePastDate(null, daysAgo),
    practitioner: {
      name: practitionerName,
      type: practitionerType,
      title: practitionerData.title,
      education: practitionerData.education,
      isPlayer: false
    },
    treatment: {
      name: treatment.name,
      method: treatment.method,
      theory: treatment.theory
    },
    outcome: treatment[outcomeType],
    notes: generateNotes(practitionerType, treatment, outcomeType)
  };
}

/**
 * Generate generic treatment when specific symptom data unavailable
 */
function generateGenericTreatment(daysAgo) {
  const genericTreatments = [
    {
      practitionerType: 'physician',
      name: 'General bloodletting',
      method: '6 oz removed from arm',
      theory: 'Balance humors through depletion',
      outcome: 'Patient rested, condition unchanged'
    },
    {
      practitionerType: 'curandera',
      name: 'Herbal tea and prayers',
      method: 'Mixed herbs, ritual blessing',
      theory: 'Spiritual cleansing',
      outcome: 'Patient comforted, symptoms persist'
    }
  ];

  const treatment = genericTreatments[Math.floor(Math.random() * genericTreatments.length)];
  const practitionerData = PRACTITIONER_TYPES[treatment.practitionerType];
  const practitionerName = selectPractitionerName(treatment.practitionerType);

  return {
    date: generatePastDate(null, daysAgo),
    practitioner: {
      name: practitionerName,
      type: treatment.practitionerType,
      title: practitionerData.title,
      education: practitionerData.education,
      isPlayer: false
    },
    treatment: {
      name: treatment.name,
      method: treatment.method,
      theory: treatment.theory
    },
    outcome: treatment.outcome,
    notes: ''
  };
}

/**
 * Generate practitioner notes based on type and outcome
 */
function generateNotes(practitionerType, treatment, outcomeType) {
  const noteStyles = {
    physician: [
      'Treatment administered as prescribed by Galenic principles.',
      'Patient instructed to rest and maintain dietary restrictions.',
      'Follow-up examination recommended in three days.'
    ],
    curandera: [
      'The spirits were consulted before treatment.',
      'Patient advised to avoid cold and damp airs.',
      'Prayers offered for swift recovery.'
    ],
    barber_surgeon: [
      'Procedure completed without incident.',
      'Patient tolerated treatment well.',
      'Applied bandages as needed.'
    ],
    apothecary: [
      'Compound prepared according to standard formula.',
      'Dosage instructions provided to patient.',
      'Patient to return if symptoms worsen.'
    ]
  };

  const notes = noteStyles[practitionerType];
  return notes ? notes[Math.floor(Math.random() * notes.length)] : '';
}

/**
 * Select a practitioner name randomly from the pool
 */
function selectPractitionerName(type) {
  const names = PRACTITIONER_NAMES[type];
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Weighted random selection
 */
function weightedRandom(items, weights) {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]) {
      return items[i];
    }
    random -= weights[i];
  }

  return items[items.length - 1];
}

/**
 * Add a player treatment to existing history
 */
export function addPlayerTreatment(existingHistory, treatment, currentDate) {
  return [
    ...existingHistory,
    {
      date: currentDate,
      practitioner: {
        name: 'Maria de Lima',
        type: 'apothecary',
        title: '',
        education: 'Master Apothecary',
        isPlayer: true
      },
      treatment: {
        name: treatment.substanceName,
        method: `${treatment.amount} ${treatment.route}`,
        theory: treatment.rationale || 'Patient treatment'
      },
      outcome: 'Treatment administered, observing patient response',
      notes: treatment.notes || ''
    }
  ];
}
