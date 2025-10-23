/**
 * Patient Positioning System (Phase 3C)
 *
 * Determines where to position patients in house interiors
 * based on their medical condition severity and house type
 */

/**
 * Assess patient condition severity from symptoms
 * @param {Object} patient - Patient entity
 * @returns {'critical'|'moderate'|'mild'} - Severity level
 */
function assessConditionSeverity(patient) {
  const symptoms = patient.symptoms || [];

  if (symptoms.length === 0) {
    return 'mild'; // No symptoms, mild concern
  }

  // Check for high-severity symptoms
  const criticalSymptoms = symptoms.filter(s =>
    s.severity === 'severe' ||
    s.severity === 'critical' ||
    (typeof s === 'string' && (
      s.toLowerCase().includes('fever') ||
      s.toLowerCase().includes('unconscious') ||
      s.toLowerCase().includes('bleeding') ||
      s.toLowerCase().includes('convuls') ||
      s.toLowerCase().includes('paralys')
    ))
  );

  if (criticalSymptoms.length > 0) {
    return 'critical'; // Bedridden
  }

  // Check for moderate severity
  const moderateSymptoms = symptoms.filter(s =>
    s.severity === 'moderate' ||
    (typeof s === 'string' && (
      s.toLowerCase().includes('pain') ||
      s.toLowerCase().includes('weak') ||
      s.toLowerCase().includes('cough') ||
      s.toLowerCase().includes('dizz')
    ))
  );

  if (moderateSymptoms.length >= 2 || symptoms.length >= 3) {
    return 'moderate'; // Sitting consultation
  }

  return 'mild'; // Standing/minor consultation
}

/**
 * Get patient position for humble house (single room)
 * @param {'critical'|'moderate'|'mild'} severity
 * @returns {Object} - {furnitureName, position: {x, y}, description}
 */
function getHumbleHousePosition(severity) {
  switch (severity) {
    case 'critical':
      // Bedridden - on straw mattress
      return {
        furnitureName: 'Straw Mattress',
        position: { x: 150, y: 190 }, // Near bed, accessible for examination
        description: 'The patient lies on the straw mattress, too weak to rise.'
      };

    case 'moderate':
      // Sitting at table for consultation
      return {
        furnitureName: 'Rough Table',
        position: { x: 280, y: 280 }, // At table edge
        description: 'The patient sits at the rough table, looking unwell but able to converse.'
      };

    case 'mild':
      // Standing near hearth (common gathering spot)
      return {
        furnitureName: 'Cooking Hearth',
        position: { x: 350, y: 280 }, // Near hearth
        description: 'The patient stands near the hearth, looking troubled but mobile.'
      };
  }
}

/**
 * Get patient position for middling house (4 rooms)
 * @param {'critical'|'moderate'|'mild'} severity
 * @returns {Object} - {furnitureName, position: {x, y}, description, roomId}
 */
function getMiddlingHousePosition(severity) {
  switch (severity) {
    case 'critical':
      // Bedridden - in master bedroom
      return {
        furnitureName: 'Master Bed',
        position: { x: 650, y: 220 }, // Beside bed for examination
        roomId: 'master-bedroom',
        description: 'The patient lies in the master bed, pallid and feverish.'
      };

    case 'moderate':
      // Sitting in sala (reception room) for formal consultation
      return {
        furnitureName: 'Chair',
        position: { x: 560, y: 490 }, // At chair near table
        roomId: 'sala',
        description: 'The patient sits in the sala, uncomfortable but composed for the consultation.'
      };

    case 'mild':
      // Standing in sala near religious painting (common waiting area)
      return {
        furnitureName: 'Dining Table',
        position: { x: 600, y: 520 }, // Standing near table
        roomId: 'sala',
        description: 'The patient stands in the sala, showing signs of concern but otherwise well.'
      };
  }
}

/**
 * Determine patient position in house based on condition and house type
 * @param {Object} patient - Patient entity
 * @param {string} houseMapId - 'humble-house-interior' or 'middling-house-interior'
 * @returns {Object} - Complete positioning data
 */
export function determinePatientPosition(patient, houseMapId) {
  const severity = assessConditionSeverity(patient);

  console.log('[Phase 3C] Patient positioning:', {
    patient: patient.name,
    severity,
    symptomsCount: patient.symptoms?.length || 0,
    houseType: houseMapId
  });

  let positionData;

  if (houseMapId === 'humble-house-interior') {
    positionData = getHumbleHousePosition(severity);
  } else if (houseMapId === 'middling-house-interior') {
    positionData = getMiddlingHousePosition(severity);
  } else {
    // Fallback to default position
    console.warn('[Phase 3C] Unknown house type, using default position');
    positionData = {
      furnitureName: 'Room Center',
      position: { x: 250, y: 250 },
      description: 'The patient awaits in the room.',
      severity
    };
  }

  return {
    ...positionData,
    severity,
    patient: patient.name
  };
}

/**
 * Get narrative description for patient placement
 * @param {Object} positionData - Result from determinePatientPosition
 * @param {Object} patient - Patient entity
 * @returns {string} - Narrative text
 */
export function getPlacementNarrative(positionData, patient) {
  const { severity, furnitureName, description } = positionData;

  const baseNarrative = description || `${patient.name} is positioned near ${furnitureName}.`;

  // Add condition-specific context
  const contextAdditions = {
    critical: ` Maria can see the gravity of the situation immediately.`,
    moderate: ` Maria notes the patient's discomfort with concern.`,
    mild: ` Maria prepares to examine the patient's complaint.`
  };

  return baseNarrative + (contextAdditions[severity] || '');
}
