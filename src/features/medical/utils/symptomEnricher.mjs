/**
 * Symptom Enricher
 * Adds system and organ affinity fields to symptom objects based on pattern matching
 * This allows the category-based effectiveness calculator to work with dynamically generated symptoms
 */

/**
 * System pattern matching for symptoms
 */
const SYMPTOM_SYSTEM_PATTERNS = {
  musculoskeletal: /joint|bone|muscle|back|spine|neck|limb|rheumat|ache|aching|stiff|gout|arthrit|lame|sore/i,
  digestive: /stomach|bowel|digest|belly|gut|nausea|vomit|purg|constipat|diarrh|dysentery|flux|colic|cramp/i,
  respiratory: /lung|chest|cough|breath|throat|phlegm|asthma|congestion|wheez|chok|sputum/i,
  nervous: /nerv|brain|head|mind|dizz|faint|tremor|convuls|fit|seiz|paralys|numb|weak|lethargy|stupor|deliri/i,
  circulatory: /heart|blood|pulse|vein|bleed|hemorrhage|bruise|palpitat|chest pain|angina/i,
  dermatological: /skin|wound|ulcer|rash|sore|lesion|pox|pustule|boil|abscess|inflamm|swell|burn|scald/i,
  renal: /kidney|bladder|urin|stone|gravel|retention|suppression/i,
  reproductive: /womb|menses|birth|fertility|conception|menstrual|flux|whites/i,
  ophthalmological: /eye|vision|sight|blind|cataract|film|dimness/i,
  dental: /tooth|teeth|gum|mouth|jaw|toothache/i
};

/**
 * Organ pattern matching for symptoms
 */
const SYMPTOM_ORGAN_PATTERNS = {
  head: /head|skull|migrain|cephalic/i,
  heart: /heart|cardiac|chest pain|palpitat/i,
  liver: /liver|jaundice|yellow/i,
  stomach: /stomach|gastric|belly/i,
  lungs: /lung|chest|pulmon/i,
  kidneys: /kidney|renal/i,
  bladder: /bladder/i,
  spine: /spine|back|vertebr/i,
  joints: /joint|articulat|knee|elbow|wrist|ankle/i,
  skin: /skin|derma|cutane|rash/i,
  eyes: /eye|ocular|ophthalm/i,
  teeth: /tooth|teeth|dental/i,
  womb: /womb|uterus|uterine/i,
  bowels: /bowel|intestin|colon|gut/i,
  blood: /blood|sanguine|hemorrhage/i,
  brain: /brain|cerebr|deliri|stupor/i,
  throat: /throat|laryn|pharyn|tonsil/i,
  back: /back|dorsal|lumbar/i
};

/**
 * Enrich a single symptom with system and organ affinity
 * @param {Object|string} symptom - Symptom object or string
 * @returns {Object} Enriched symptom with system and affectedOrgan fields
 */
export function enrichSymptom(symptom) {
  // Handle string symptoms
  if (typeof symptom === 'string') {
    symptom = { name: symptom };
  }

  // If already enriched, return as-is
  if (symptom.system && symptom.affectedOrgan) {
    return symptom;
  }

  // Extract symptom text for pattern matching
  const symptomText = [
    symptom.name || symptom.symptom || '',
    symptom.description || symptom.details || ''
  ].join(' ');

  // Determine system
  let system = null;
  for (const [systemName, pattern] of Object.entries(SYMPTOM_SYSTEM_PATTERNS)) {
    if (pattern.test(symptomText)) {
      system = systemName;
      break; // Take first match
    }
  }

  // Determine affected organ
  let affectedOrgan = null;
  for (const [organName, pattern] of Object.entries(SYMPTOM_ORGAN_PATTERNS)) {
    if (pattern.test(symptomText)) {
      affectedOrgan = organName;
      break; // Take first match
    }
  }

  // Return enriched symptom
  return {
    ...symptom,
    name: symptom.name || symptom.symptom || symptomText.trim() || 'Unknown symptom',
    system,
    affectedOrgan
  };
}

/**
 * Enrich an array of symptoms
 * @param {Array} symptoms - Array of symptom objects or strings
 * @returns {Array} Array of enriched symptoms
 */
export function enrichSymptoms(symptoms) {
  if (!Array.isArray(symptoms)) {
    return [];
  }

  return symptoms.map(enrichSymptom);
}
