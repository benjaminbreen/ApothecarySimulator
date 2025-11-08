#!/usr/bin/env node
/**
 * Mechanics Test Script
 * Verifies that the humoral matching and prescription calculation systems work correctly
 *
 * Run with: node src/features/medical/utils/mechanicsTest.js
 */

import { calculateHumoralMatch, _testExports as humoralTestExports } from './humoralMatcher.mjs';
import { calculatePrescriptionOutcome, getOutcomeDescription } from './prescriptionCalculator.mjs';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(80));
  log(message, 'bright');
  console.log('='.repeat(80));
}

function logSection(message) {
  console.log('\n' + '-'.repeat(80));
  log(message, 'cyan');
  console.log('-'.repeat(80));
}

// Test data - Using actual items from the game
const testItems = {
  chamomile: {
    name: 'Chamomile',
    humoralQualities: 'Warm & Dry',
    medicinalEffects: 'Calming, anti-inflammatory, aids digestion.',
    price: 3
  },
  roseWater: {
    name: 'Rose Water',
    humoralQualities: 'Cold & Moist',
    medicinalEffects: 'Soothes inflammation, cools the body, and calms the nerves.',
    price: 3
  },
  opium: {
    name: 'Opium',
    humoralQualities: 'Cold & Dry',
    medicinalEffects: 'Powerful pain relief, sedative, and treatment for cough and diarrhea.',
    price: 6
  },
  quicksilver: {
    name: 'Quicksilver',
    humoralQualities: 'Cold & Moist',
    medicinalEffects: 'Treatment for syphilis and skin conditions.',
    price: 1
  },
  senna: {
    name: 'Senna',
    humoralQualities: 'Warm & Dry',
    medicinalEffects: 'Laxative, cleanses the bowels, relieves constipation.',
    price: 2
  },
  camphor: {
    name: 'Camphor',
    humoralQualities: 'Cold & Moist',
    medicinalEffects: 'Relieves pain, anti-inflammatory, calming.',
    price: 4
  },
  ginger: {
    name: 'Ginger',
    humoralQualities: 'Warm & Dry',
    medicinalEffects: 'Stimulates digestion, relieves nausea, and soothes coughs.',
    price: 5
  },
  nettle: {
    name: 'Nettle',
    humoralQualities: 'Warm & Dry',
    medicinalEffects: 'Anti-inflammatory, diuretic, treats allergies and arthritis.',
    price: 1
  }
};

// Test patients with various conditions
const testPatients = {
  headachePatient: {
    name: 'Ana López',
    symptoms: [
      { name: 'headache', severity: 'moderate' },
      { name: 'anxiety', severity: 'mild' }
    ]
  },
  feverPatient: {
    name: 'Juan García',
    symptoms: [
      { name: 'fever', severity: 'high' },
      { name: 'inflammation', severity: 'moderate' }
    ]
  },
  coldPatient: {
    name: 'María Hernández',
    symptoms: [
      { name: 'chills', severity: 'moderate' },
      { name: 'weakness', severity: 'mild' },
      { name: 'paleness', severity: 'mild' }
    ]
  },
  woundPatient: {
    name: 'Pedro Sánchez',
    symptoms: [
      { name: 'wound', severity: 'severe' },
      { name: 'pain', severity: 'high' },
      { name: 'inflammation', severity: 'moderate' }
    ]
  },
  constipationPatient: {
    name: 'Isabel Ruiz',
    symptoms: [
      { name: 'constipation', severity: 'moderate' }
    ]
  }
};

// Mock player skills for testing
const mockPlayerSkills = {
  knownSkills: {
    herbalism: {
      level: 3,
      xp: 150
    }
  }
};

// Test counters
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  testsRun++;
  if (condition) {
    testsPassed++;
    log(`  ✓ ${message}`, 'green');
  } else {
    testsFailed++;
    log(`  ✗ ${message}`, 'red');
  }
}

// ============================================================================
// TEST SUITE 1: Humoral Matching
// ============================================================================

function testHumoralMatching() {
  logHeader('TEST SUITE 1: Humoral Matching');

  logSection('Test 1.1: Chamomile for Headache (Warm remedy for Hot symptom)');
  const result1 = calculateHumoralMatch(testItems.chamomile, testPatients.headachePatient.symptoms);
  log(`  Chamomile (Warm & Dry) treating Headache + Anxiety`);
  log(`  Total Score: ${result1.totalScore}/100`);
  log(`  Humoral Score: ${result1.humoralScore}, Direct Score: ${result1.directScore}`);
  log(`  Matched Symptoms: ${result1.matchedSymptoms.join(', ')}`);
  result1.humoralExplanations.forEach(exp => log(`    • ${exp}`, 'dim'));

  // Chamomile should NOT match well (warm doesn't counter hot)
  assert(result1.totalScore < 50, 'Chamomile should score low for hot symptoms (no opposition)');
  assert(result1.directMatches.includes('anxiety'), 'Should match anxiety via direct effects');

  logSection('Test 1.2: Rose Water for Fever (Cold remedy for Hot symptom)');
  const result2 = calculateHumoralMatch(testItems.roseWater, testPatients.feverPatient.symptoms);
  log(`  Rose Water (Cold & Moist) treating Fever + Inflammation`);
  log(`  Total Score: ${result2.totalScore}/100`);
  log(`  Humoral Score: ${result2.humoralScore}, Direct Score: ${result2.directScore}`);
  log(`  Matched Symptoms: ${result2.matchedSymptoms.join(', ')}`);
  result2.humoralExplanations.forEach(exp => log(`    • ${exp}`, 'dim'));

  // Rose Water should match well (cold counters hot)
  assert(result2.totalScore >= 50, 'Rose Water should score high for hot symptoms (perfect opposition)');
  assert(result2.humoralScore > 0, 'Should have positive humoral score');

  logSection('Test 1.3: Ginger for Cold Patient (Warm remedy for Cold symptom)');
  const result3 = calculateHumoralMatch(testItems.ginger, testPatients.coldPatient.symptoms);
  log(`  Ginger (Warm & Dry) treating Chills + Weakness + Paleness`);
  log(`  Total Score: ${result3.totalScore}/100`);
  log(`  Humoral Score: ${result3.humoralScore}, Direct Score: ${result3.directScore}`);
  log(`  Matched Symptoms: ${result3.matchedSymptoms.join(', ')}`);
  result3.humoralExplanations.forEach(exp => log(`    • ${exp}`, 'dim'));

  // Ginger should match excellently (warm counters cold)
  assert(result3.totalScore >= 40, 'Ginger should score well for cold symptoms');
  assert(result3.humoralExplanations.length > 0, 'Should have humoral explanations');

  logSection('Test 1.4: Senna for Constipation (Direct Effect Match)');
  const result4 = calculateHumoralMatch(testItems.senna, testPatients.constipationPatient.symptoms);
  log(`  Senna (Warm & Dry) treating Constipation`);
  log(`  Total Score: ${result4.totalScore}/100`);
  log(`  Humoral Score: ${result4.humoralScore}, Direct Score: ${result4.directScore}`);
  log(`  Direct Matches: ${result4.directMatches.join(', ')}`);

  // Senna should match via direct effects (laxative for constipation)
  assert(result4.directScore > 0, 'Senna should match constipation via direct effects');
  assert(result4.directMatches.includes('constipation'), 'Should directly match constipation');
}

// ============================================================================
// TEST SUITE 2: Route Appropriateness
// ============================================================================

function testRouteAppropriate() {
  logHeader('TEST SUITE 2: Route Appropriateness');

  logSection('Test 2.1: Topical route for Wound (Optimal)');
  const result1 = calculatePrescriptionOutcome({
    item: testItems.camphor,
    patient: testPatients.woundPatient,
    route: 'Topical',
    amount: 1,
    playerSkills: mockPlayerSkills
  });
  log(`  Camphor applied topically for wound`);
  log(`  Route Bonus: +${result1.breakdown.routeBonus}`);
  log(`  Route Explanation: ${result1.breakdown.routeExplanation}`);

  assert(result1.breakdown.routeBonus >= 15, 'Topical route should give significant bonus for wounds');

  logSection('Test 2.2: Oral route for Nausea (Inappropriate)');
  const result2 = calculatePrescriptionOutcome({
    item: testItems.ginger,
    patient: { name: 'Test', symptoms: [{ name: 'nausea' }] },
    route: 'Oral',
    amount: 1,
    playerSkills: mockPlayerSkills
  });
  log(`  Ginger taken orally for nausea`);
  log(`  Route Bonus: ${result2.breakdown.routeBonus}`);
  log(`  Route Explanation: ${result2.breakdown.routeExplanation}`);

  assert(result2.breakdown.routeBonus <= 0, 'Oral route should be penalized for nausea');
}

// ============================================================================
// TEST SUITE 3: Dosage Effects
// ============================================================================

function testDosageEffects() {
  logHeader('TEST SUITE 3: Dosage Effects');

  logSection('Test 3.1: Normal Dosage (1-3 drachms)');
  const result1 = calculatePrescriptionOutcome({
    item: testItems.chamomile,
    patient: testPatients.headachePatient,
    route: 'Oral',
    amount: 2,
    playerSkills: mockPlayerSkills
  });
  log(`  2 drachms of Chamomile (normal dose)`);
  log(`  Dosage Modifier: ${result1.breakdown.dosageModifier}`);
  log(`  Warning: ${result1.breakdown.dosageWarning || 'None'}`);

  assert(result1.breakdown.dosageModifier === 0, 'Normal dosage should have no penalty');

  logSection('Test 3.2: Overdose (5 drachms)');
  const result2 = calculatePrescriptionOutcome({
    item: testItems.chamomile,
    patient: testPatients.headachePatient,
    route: 'Oral',
    amount: 5,
    playerSkills: mockPlayerSkills
  });
  log(`  5 drachms of Chamomile (excessive)`);
  log(`  Dosage Modifier: ${result2.breakdown.dosageModifier}`);
  log(`  Warning: ${result2.breakdown.dosageWarning || 'None'}`);

  assert(result2.breakdown.dosageModifier < 0, 'Excessive dosage should have penalty');

  logSection('Test 3.3: Toxic Substance Overdose (Opium 3 drachms)');
  const result3 = calculatePrescriptionOutcome({
    item: testItems.opium,
    patient: testPatients.woundPatient,
    route: 'Oral',
    amount: 3,
    playerSkills: mockPlayerSkills
  });
  log(`  3 drachms of Opium (above safe dose)`);
  log(`  Dosage Modifier: ${result3.breakdown.dosageModifier}`);
  log(`  Toxicity Warning: ${result3.breakdown.toxicityWarning || 'None'}`);

  assert(result3.breakdown.dosageModifier < 0, 'Opium overdose should have significant penalty');
  assert(result3.breakdown.dosageWarning !== null, 'Should warn about opium toxicity');
}

// ============================================================================
// TEST SUITE 4: Fatal Toxicity
// ============================================================================

function testFatalToxicity() {
  logHeader('TEST SUITE 4: Fatal Toxicity');

  logSection('Test 4.1: Quicksilver Inhaled (FATAL)');
  const result1 = calculatePrescriptionOutcome({
    item: testItems.quicksilver,
    patient: testPatients.feverPatient,
    route: 'Inhaled',
    amount: 1,
    playerSkills: mockPlayerSkills
  });
  log(`  Quicksilver administered via Inhaled route`);
  log(`  Outcome: ${result1.outcome.toUpperCase()}`);
  log(`  Fatal: ${result1.fatal || false}`);
  log(`  Reason: ${result1.fatalReason || 'N/A'}`);

  assert(result1.outcome === 'death', 'Inhaled mercury should be fatal');
  assert(result1.fatal === true, 'Should be marked as fatal');

  logSection('Test 4.2: Quicksilver Topical (Safe)');
  const result2 = calculatePrescriptionOutcome({
    item: testItems.quicksilver,
    patient: testPatients.woundPatient,
    route: 'Topical',
    amount: 1,
    playerSkills: mockPlayerSkills
  });
  log(`  Quicksilver applied topically (historical treatment for syphilis)`);
  log(`  Outcome: ${result2.outcome}`);
  log(`  Fatal: ${result2.fatal || false}`);

  assert(result2.outcome !== 'death', 'Topical mercury should not be immediately fatal');
}

// ============================================================================
// TEST SUITE 5: Complete Prescription Scenarios
// ============================================================================

function testCompletePrescriptions() {
  logHeader('TEST SUITE 5: Complete Prescription Scenarios');

  logSection('Test 5.1: Optimal Treatment (Rose Water for Fever, topical)');
  const result1 = calculatePrescriptionOutcome({
    item: testItems.roseWater,
    patient: testPatients.feverPatient,
    route: 'Topical',
    amount: 2,
    playerSkills: mockPlayerSkills
  });

  log(`  Patient: ${result1.patientName}`);
  log(`  Medicine: ${result1.itemName}`);
  log(`  Final Effectiveness: ${result1.effectiveness}%`);
  log(`  Outcome: ${result1.outcome.toUpperCase()} - ${getOutcomeDescription(result1.outcome)}`);
  log(`\n  Breakdown:`);
  log(`    Humoral Match: +${result1.breakdown.humoralScore}`);
  log(`    Route Bonus: +${result1.breakdown.routeBonus}`);
  log(`    Skill Check: ${result1.breakdown.skillCheck.roll} + ${result1.breakdown.skillCheck.bonus} = ${result1.breakdown.skillCheck.total}`);
  log(`    Dosage: ${result1.breakdown.dosageModifier}`);
  log(`\n  Matched Symptoms: ${result1.matchedSymptoms.join(', ')}`);
  result1.breakdown.humoralExplanations.forEach(exp => log(`    • ${exp}`, 'dim'));

  assert(result1.effectiveness >= 50, 'Optimal treatment should be reasonably effective');
  assert(result1.outcome === 'success' || result1.outcome === 'partial', 'Should be success or partial success');

  logSection('Test 5.2: Poor Treatment (Warm remedy for Hot symptom)');
  const result2 = calculatePrescriptionOutcome({
    item: testItems.ginger,
    patient: testPatients.feverPatient,
    route: 'Oral',
    amount: 1,
    playerSkills: mockPlayerSkills
  });

  log(`  Patient: ${result2.patientName}`);
  log(`  Medicine: ${result2.itemName}`);
  log(`  Final Effectiveness: ${result2.effectiveness}%`);
  log(`  Outcome: ${result2.outcome.toUpperCase()} - ${getOutcomeDescription(result2.outcome)}`);
  log(`\n  Mismatches:`);
  result2.breakdown.mismatches.forEach(mis => log(`    ${mis}`, 'yellow'));

  assert(result2.effectiveness < 50, 'Inappropriate treatment should have low effectiveness');

  logSection('Test 5.3: Skill Matters (No skills vs With skills)');
  const noSkills = calculatePrescriptionOutcome({
    item: testItems.chamomile,
    patient: testPatients.headachePatient,
    route: 'Oral',
    amount: 1,
    playerSkills: null // No skills
  });

  const withSkills = calculatePrescriptionOutcome({
    item: testItems.chamomile,
    patient: testPatients.headachePatient,
    route: 'Oral',
    amount: 1,
    playerSkills: mockPlayerSkills // Level 3 herbalism
  });

  log(`  Without skills: ${noSkills.effectiveness}% (skill bonus: ${noSkills.breakdown.skillCheck.bonus})`);
  log(`  With Level 3 Herbalism: ${withSkills.effectiveness}% (skill bonus: ${withSkills.breakdown.skillCheck.bonus})`);

  const difference = withSkills.effectiveness - noSkills.effectiveness;
  log(`  Difference: +${difference}%`, difference > 0 ? 'green' : 'red');

  assert(withSkills.breakdown.skillCheck.bonus > 0, 'Should have skill bonus with level 3 herbalism');
}

// ============================================================================
// TEST SUITE 6: Edge Cases
// ============================================================================

function testEdgeCases() {
  logHeader('TEST SUITE 6: Edge Cases');

  logSection('Test 6.1: Patient with No Symptoms');
  const result1 = calculatePrescriptionOutcome({
    item: testItems.chamomile,
    patient: { name: 'Healthy Person', symptoms: [] },
    route: 'Oral',
    amount: 1,
    playerSkills: mockPlayerSkills
  });
  log(`  Treating patient with no symptoms`);
  log(`  Effectiveness: ${result1.effectiveness}%`);
  log(`  Humoral Score: ${result1.breakdown.humoralScore}`);

  assert(result1.breakdown.humoralScore === 0, 'No symptoms should give 0 humoral score');

  logSection('Test 6.2: Invalid Item Data');
  const result2 = calculatePrescriptionOutcome({
    item: { name: 'Unknown Medicine' }, // No humoral data
    patient: testPatients.headachePatient,
    route: 'Oral',
    amount: 1,
    playerSkills: mockPlayerSkills
  });
  log(`  Medicine with no humoral data`);
  log(`  Effectiveness: ${result2.effectiveness}%`);

  assert(result2.effectiveness >= 0, 'Should not crash with missing data');

  logSection('Test 6.3: Multiple Symptom Matching');
  const multiSymptomPatient = {
    name: 'Complex Patient',
    symptoms: [
      { name: 'fever' },
      { name: 'inflammation' },
      { name: 'pain' },
      { name: 'headache' }
    ]
  };

  const result3 = calculatePrescriptionOutcome({
    item: testItems.camphor, // Cold & Moist, anti-inflammatory
    patient: multiSymptomPatient,
    route: 'Topical',
    amount: 2,
    playerSkills: mockPlayerSkills
  });

  log(`  Camphor for 4 symptoms`);
  log(`  Matched: ${result3.matchedSymptoms.length}/4 symptoms`);
  log(`  Matched Symptoms: ${result3.matchedSymptoms.join(', ')}`);
  log(`  Total Effectiveness: ${result3.effectiveness}%`);

  assert(result3.matchedSymptoms.length > 0, 'Should match at least some symptoms');
  assert(result3.matchedSymptoms.length <= 4, 'Cannot match more symptoms than exist');
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

function runAllTests() {
  log('\n', 'reset');
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'bright');
  log('║                      PRESCRIPTION MECHANICS TEST SUITE                     ║', 'bright');
  log('║                         Apothecary Simulator v1.0                          ║', 'bright');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'bright');

  try {
    testHumoralMatching();
    testRouteAppropriate();
    testDosageEffects();
    testFatalToxicity();
    testCompletePrescriptions();
    testEdgeCases();

    // Print summary
    logHeader('TEST SUMMARY');
    log(`\nTotal Tests: ${testsRun}`);
    log(`Passed: ${testsPassed}`, 'green');
    log(`Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');

    const passRate = ((testsPassed / testsRun) * 100).toFixed(1);
    log(`\nPass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');

    if (testsFailed === 0) {
      log('\n✅ ALL TESTS PASSED! The mechanics system is working correctly.', 'bright');
      log('The prescription calculation system is ready for integration.\n', 'green');
      process.exit(0);
    } else {
      log('\n❌ SOME TESTS FAILED. Please review the failures above.', 'bright');
      process.exit(1);
    }

  } catch (error) {
    log('\n💥 FATAL ERROR DURING TESTING:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runAllTests();
