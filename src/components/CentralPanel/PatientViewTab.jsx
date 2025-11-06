// PatientViewTab.jsx
// Patient examination view - two column layout with expanded space

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDrag } from 'react-dnd';
import ReactMarkdown from 'react-markdown';
import { getPositionForLocation } from '../../utils/bodyPositionMapper';
import PrescribePanelIntegrated from '../../features/medical/components/PrescribePanelIntegrated';
import DiagnosisPanel from '../../features/medical/components/DiagnosisPanel';
import PrescribeOverviewPanel from '../../features/medical/components/PrescribeOverviewPanel';
import { getZodiacSymbol } from '../../core/utils/astrologyCalculator';
import { entityManager } from '../../core/entities/EntityManager';
import PatientDialogueHistory from './PatientDialogueHistory';

export function PatientViewTab({
  patient,
  onAskQuestion,
  patientDialogue = [],
  // Prescription props
  gameState,
  updateInventory,
  addJournalEntry,
  conversationHistory,
  setHistoryOutput,
  setConversationHistory,
  setTurnNumber,
  currentWealth,
  prescriptionType,
  advanceTime,
  energy,
  updateEnergy,
  transactionManager,
  TRANSACTION_CATEGORIES,
  toggleInventory,
  onOpenInventoryTab,
  onOpenMixing, // New prop for mixing modal
  onPrescriptionPending, // Callback when prescription is being processed
  onPrescriptionComplete, // Callback when prescription outcome is accepted
  toast // Toast notification function
}) {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [hoveredSymptom, setHoveredSymptom] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('examine'); // 'examine', 'diagnose', or 'prescribe'
  const [showPrescribeBanner, setShowPrescribeBanner] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState(null); // Stores submitted diagnosis
  const [showDiagnoseButton, setShowDiagnoseButton] = useState(false);
  const [manualHumorTemp, setManualHumorTemp] = useState(null);
  const [manualHumorMoisture, setManualHumorMoisture] = useState(null);
  const [manualAstrology, setManualAstrology] = useState(null);
  const [focusedSymptomIndex, setFocusedSymptomIndex] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editableFields, setEditableFields] = useState({
    family: '',
    occupation: ''
  });
  const questionInputRef = useRef(null);
  const timelineRefs = useRef({});
  const focusResetTimer = useRef(null);
  const [activeMedicalTab, setActiveMedicalTab] = useState('body'); // 'body', 'symptoms', or 'diagnosis'

  // Initialize manual values from patient data on mount/patient change
  useEffect(() => {
    if (patient) {
      const initialTemp = typeof patient.humors?.temperature === 'string'
        ? patient.humors.temperature.toLowerCase()
        : patient.humors?.temperature;
      const initialMoisture = typeof patient.humors?.moisture === 'string'
        ? patient.humors.moisture.toLowerCase()
        : patient.humors?.moisture;
      setManualHumorTemp(initialTemp || null);
      setManualHumorMoisture(initialMoisture || null);
      setManualAstrology(patient.astrology || null);
      setEditableFields({
        family: patient.family || '',
        occupation: patient.occupation || ''
      });
    }
  }, [patient?.id]); // Only reset when patient changes

  useEffect(() => {
    if (!patient) return;

    if (
      patient.humors &&
      Object.prototype.hasOwnProperty.call(patient.humors, 'temperature')
    ) {
      const tempValue = typeof patient.humors.temperature === 'string'
        ? patient.humors.temperature.toLowerCase()
        : patient.humors.temperature;
      setManualHumorTemp(tempValue || '');
    }

    if (
      patient.humors &&
      Object.prototype.hasOwnProperty.call(patient.humors, 'moisture')
    ) {
      const moistureValue = typeof patient.humors.moisture === 'string'
        ? patient.humors.moisture.toLowerCase()
        : patient.humors.moisture;
      setManualHumorMoisture(moistureValue || '');
    }

    if (typeof patient.astrology !== 'undefined') {
      setManualAstrology(patient.astrology || '');
    }
  }, [patient?.humors?.temperature, patient?.humors?.moisture, patient?.astrology, patient?.id]);

  useEffect(() => {
    if (!patient || editingField) return;
    setEditableFields({
      family: patient.family || '',
      occupation: patient.occupation || ''
    });
  }, [patient?.family, patient?.occupation, patient?.id, editingField]);

  useEffect(() => {
    return () => {
      if (focusResetTimer.current) {
        clearTimeout(focusResetTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (focusResetTimer.current) {
      clearTimeout(focusResetTimer.current);
      focusResetTimer.current = null;
    }
    setFocusedSymptomIndex(null);
    timelineRefs.current = {};
  }, [patient?.id]);

  // Show diagnose button after 3+ questions are answered
  useEffect(() => {
    if (patientDialogue.length >= 3) {
      setShowDiagnoseButton(true);
    }
  }, [patientDialogue]);

  // Handler for manual humoral characteristics update
  const handleHumorUpdate = (humorType, value) => {
    if (!patient || !patient.id) return;

    // Update local state
    if (humorType === 'temperature') {
      setManualHumorTemp(value);
    } else {
      setManualHumorMoisture(value);
    }

    // Update patient entity in EntityManager
    const updatedPatient = {
      ...patient,
      humors: {
        ...patient.humors,
        [humorType]: value
      },
      lastUpdated: new Date().toISOString()
    };

    try {
      entityManager.update(patient.id, updatedPatient);
      console.log('[PatientViewTab] Updated patient humors:', humorType, value);

      // Also update journal
      if (addJournalEntry) {
        addJournalEntry({
          turnNumber: gameState?.turnNumber || 0,
          date: gameState?.date || new Date().toLocaleDateString(),
          entry: `Recorded humoral characteristic for ${patient.name}: ${humorType} = ${value}`
        });
      }
    } catch (error) {
      console.error('[PatientViewTab] Failed to update patient humors:', error);
    }
  };

  // Handler for manual astrology update
  const handleAstrologyUpdate = (value) => {
    if (!patient || !patient.id) return;

    // Update local state
    setManualAstrology(value);

    // Update patient entity in EntityManager
    const updatedPatient = {
      ...patient,
      astrology: value,
      lastUpdated: new Date().toISOString()
    };

    try {
      entityManager.update(patient.id, updatedPatient);
      console.log('[PatientViewTab] Updated patient astrology:', value);

      // Also update journal
      if (addJournalEntry) {
        addJournalEntry({
          turnNumber: gameState?.turnNumber || 0,
          date: gameState?.date || new Date().toLocaleDateString(),
          entry: `Recorded astrological sign for ${patient.name}: ${value}`
        });
      }
    } catch (error) {
      console.error('[PatientViewTab] Failed to update patient astrology:', error);
    }
  };

  const handlePatientFieldChange = (fieldKey, value) => {
    setEditableFields(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const commitPatientFieldUpdate = (fieldKey) => {
    if (!patient || !patient.id) return;

    const newValue = editableFields[fieldKey] || '';
    const updatedPatient = {
      ...patient,
      [fieldKey]: newValue,
      lastUpdated: new Date().toISOString()
    };

    try {
      entityManager.update(patient.id, updatedPatient);
      if (addJournalEntry && newValue) {
        addJournalEntry({
          turnNumber: gameState?.turnNumber || 0,
          date: gameState?.date || new Date().toLocaleDateString(),
          entry: `Updated ${fieldKey} for ${patient.name}: ${newValue}`
        });
      }
    } catch (error) {
      console.error('[PatientViewTab] Failed to update patient field:', fieldKey, error);
    } finally {
      setEditingField(null);
    }
  };

  const handleEditToggle = (fieldKey) => {
    if (!patient) return;
    if (!fieldKey) {
      setEditableFields({
        family: patient.family || '',
        occupation: patient.occupation || ''
      });
      setEditingField(null);
    } else {
      if (editingField === fieldKey) {
        setEditableFields({
          family: patient.family || '',
          occupation: patient.occupation || ''
        });
        setEditingField(null);
      } else {
        setEditingField(fieldKey);
      }
    }
  };

  // Show prescribe banner/button only after diagnosis is submitted
  useEffect(() => {
    if (diagnosisData) {
      setShowPrescribeBanner(true);
    }
  }, [diagnosisData]);

  // Auto-open inventory tab in left sidebar when entering prescribe mode
  useEffect(() => {
    if (viewMode === 'prescribe' && onOpenInventoryTab) {
      onOpenInventoryTab();
    }
  }, [viewMode, onOpenInventoryTab]);

  // Handle diagnosis submission
  const handleDiagnosisSubmit = async (diagnosis) => {
    setDiagnosisData(diagnosis);

    // FIX #1: Store diagnosis in patient entity so it's available for medical records
    if (patient && patient.id) {
      const updatedPatient = {
        ...patient,
        diagnosis: diagnosis.diagnosis, // Store the diagnosis text
        diagnosisEvidence: diagnosis.evidence, // Store supporting evidence
        diagnosisConfidence: diagnosis.confidence, // Store confidence level
        diagnosisTimestamp: diagnosis.timestamp, // Store when diagnosed
        lastUpdated: new Date().toISOString()
      };

      try {
        entityManager.update(patient.id, updatedPatient);
        console.log('[PatientViewTab] Stored diagnosis in patient entity:', diagnosis.diagnosis);
      } catch (error) {
        console.error('[PatientViewTab] Failed to store diagnosis in patient entity:', error);
      }
    }

    // Apply energy cost and time advancement
    const currentEnergy = energy || 50;
    const newEnergy = Math.max(0, currentEnergy - 1);
    updateEnergy(newEnergy);
    advanceTime({ minutes: 10 });
    console.log('[Energy] Diagnosis cost: -1 energy');
    console.log('[Time] Diagnosis: +10 minutes');

    // Add to journal
    if (addJournalEntry) {
      const evidenceText = diagnosis.evidence.join('\n');
      addJournalEntry(`🩺 Diagnosis for ${patient.name}:\n\n${diagnosis.diagnosis}\n\nEvidence:\n${evidenceText}`);
    }

    // Add to conversation history (so LLM knows about the diagnosis)
    if (setConversationHistory) {
      const diagnosisSummary = `Maria diagnosed ${patient.name} with: ${diagnosis.diagnosis}`;
      const evidenceSummary = diagnosis.evidence.join('; ');

      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: `Diagnose ${patient.name}`, hidden: true }, // Hidden - just context for LLM
        { role: 'assistant', content: diagnosisSummary },
        { role: 'system', content: `*[MEDICAL DIAGNOSIS] Diagnosis: ${diagnosis.diagnosis}. Evidence: ${evidenceSummary}*` }
      ]);
    }

    // Update history output for narration panel
    if (setHistoryOutput) {
      setHistoryOutput(`You have diagnosed ${patient.name} with **${diagnosis.diagnosis}**. Now you may offer a prescription.`);
    }

    // Get patient's reaction to the diagnosis
    if (onAskQuestion) {
      console.log('[DiagnosisPanel] Requesting patient reaction to diagnosis:', diagnosis.diagnosis);
      // Simulate Maria announcing the diagnosis to the patient
      await onAskQuestion(`[Maria tells the patient her diagnosis: "${diagnosis.diagnosis}"] How do you react to this diagnosis?`);
    }

    // Return to examine mode to show the prescribe option
    setViewMode('examine');
  };

  if (!patient) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-parchment-50 to-white animate-fade-in">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">👤</div>
          <p className="text-base text-ink-500 font-sans font-medium">No patient selected</p>
          <p className="text-sm text-ink-400 font-sans mt-1">Click on a patient's name in the Chronicle to examine them</p>
        </div>
      </div>
    );
  }

  const handleAskQuestion = async (questionOverride = null) => {
    const questionText = (questionOverride ?? currentQuestion).trim();
    if (!questionText || !onAskQuestion) return;
    if (isAsking) return;
    setIsAsking(true);
    if (!questionOverride) {
      setCurrentQuestion('');
    }
    try {
      await onAskQuestion(questionText);
    } catch (error) {
      console.error('[PatientViewTab] Failed to ask patient question:', error);
    } finally {
      if (questionOverride) {
        setCurrentQuestion('');
      }
      setIsAsking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const quickQuestions = [
    "When did this start?",
    "Any other symptoms?",
    "Family history?"
  ];

  const examinations = [
    { label: "🫁 Check breathing", command: "listen carefully to the patient's breathing" },
    { label: "🫀 Check pulse", command: "check the patient's pulse" },
    { label: "👅 View tongue", command: "examine the patient's tongue" },
    { label: "🫙 View urine", command: "examine the patient's urine. They might protest, but they have got to pee into the flask, it is essential." }
  ];

  const RECENT_PROMPT_WINDOW = 4;
  const RECENT_PROMPT_MINUTES = 15;

  const isPromptRecentlyAsked = (prompt) => {
    if (!prompt || !patientDialogue || patientDialogue.length === 0) return false;
    const normalizedPrompt = prompt.trim().toLowerCase();
    const now = Date.now();
    let inspected = 0;

    for (let i = patientDialogue.length - 1; i >= 0 && inspected < RECENT_PROMPT_WINDOW; i -= 1) {
      const entry = patientDialogue[i];
      if (!entry?.question) continue;
      inspected += 1;
      if (entry.question.trim().toLowerCase() === normalizedPrompt) {
        if (!entry.timestamp) {
          return true; // treat same-turn duplicates without timestamp as recent
        }
        const entryTime = new Date(entry.timestamp).getTime();
        if (Number.isNaN(entryTime)) {
          return true;
        }
        if (now - entryTime < RECENT_PROMPT_MINUTES * 60 * 1000) {
          return true;
        }
      }
    }
    return false;
  };

  const handleExamine = async (command) => {
    if (!onAskQuestion) return;
    if (isPromptRecentlyAsked(command)) return;
    await handleAskQuestion(command);
  };

  const handleQuickQuestion = async (question) => {
    if (isAsking) return;
    if (isPromptRecentlyAsked(question)) return;
    setCurrentQuestion(question);
    await handleAskQuestion(question);
  };

  const currentResponse = patientDialogue.length > 0
    ? patientDialogue[patientDialogue.length - 1]
    : null;

  // Extract symptoms from patient data and add SVG positions
  // ONLY show discovered symptoms (those with source: 'patient-dialogue')
  // OR the first symptom (chief complaint)
  const decoratedSymptoms = (patient.symptoms || []).map((symptom, index) => ({
    ...symptom,
    originalIndex: index
  }));

  const discoveredSymptoms = decoratedSymptoms.filter((symptom) =>
    symptom.originalIndex === 0 || symptom.source === 'patient-dialogue' || symptom.discoveredAt
  );

  const symptoms = (discoveredSymptoms.length > 0 ? discoveredSymptoms : [
    {
      name: "Unknown Ailment",
      severity: "mild",
      type: "other",
      location: "General",
      description: "Chief complaint not yet recorded. Ask the patient what troubles them.",
      originalIndex: -1
    }
  ]).map(symptom => ({
    ...symptom,
    // Add SVG position if not already present (using location mapper)
    position: symptom.position || getPositionForLocation(symptom.location)
  }));

  const symptomTimeline = useMemo(() => {
    const timelineEntries = (patient?.symptoms || []).map((symptom, index) => ({
      ...symptom,
      index
    }));

    const sortKey = (symptom) => {
      if (typeof symptom.discoveredAt === 'number') {
        return symptom.discoveredAt;
      }
      if (symptom.timestamp) {
        const ts = new Date(symptom.timestamp).getTime();
        if (!Number.isNaN(ts)) {
          return ts;
        }
      }
      if (symptom.discoveredAt) {
        const ts = new Date(symptom.discoveredAt).getTime();
        if (!Number.isNaN(ts)) {
          return ts;
        }
      }
      return Number.MAX_SAFE_INTEGER - symptom.index;
    };

    return timelineEntries
      .filter(symptom => symptom.discoveredAt || symptom.timestamp || symptom.source === 'patient-dialogue')
      .sort((a, b) => sortKey(a) - sortKey(b));
  }, [patient]);

  const latestSymptomEntry = symptomTimeline.length > 0
    ? symptomTimeline[symptomTimeline.length - 1]
    : null;

  const nextStep = useMemo(() => {
    if (!patient) return null;
    if (viewMode === 'diagnose') {
      return {
        tone: 'info',
        message: 'Review your evidence and submit the diagnosis to proceed.',
        cta: 'Submit Diagnosis',
        action: () => setViewMode('diagnose')
      };
    }
    if (viewMode === 'prescribe') {
      return {
        tone: 'success',
        message: 'Finalize the remedy, dosage, and route before returning to the narrative.',
        cta: 'Review Prescription',
        action: () => setViewMode('prescribe')
      };
    }
    if (!patientDialogue || patientDialogue.length === 0) {
      return {
        tone: 'neutral',
        message: 'Begin by asking the patient a question to uncover their complaints.',
        cta: 'Ask Now',
        action: () => {
          questionInputRef.current?.focus();
        }
      };
    }
    if (showDiagnoseButton && !diagnosisData) {
      return {
        tone: 'warning',
        message: 'You have gathered enough information to attempt a diagnosis.',
        cta: 'Diagnose Patient',
        action: () => setViewMode('diagnose')
      };
    }
    if (diagnosisData && viewMode === 'examine') {
      return {
        tone: 'danger',
        message: 'Present a treatment plan based on your diagnosis.',
        cta: 'Offer Prescription',
        action: () => setViewMode('prescribe')
      };
    }
    return null;
  }, [patient, patientDialogue, viewMode, showDiagnoseButton, diagnosisData, setViewMode]);

  const handleHighlightLatestSymptom = () => {
    if (!latestSymptomEntry) return;
    const { index } = latestSymptomEntry;
    setFocusedSymptomIndex(index);
    const targetNode = timelineRefs.current[index];
    if (targetNode?.scrollIntoView) {
      targetNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    if (focusResetTimer.current) {
      clearTimeout(focusResetTimer.current);
    }
    focusResetTimer.current = setTimeout(() => {
      setFocusedSymptomIndex(null);
      focusResetTimer.current = null;
    }, 4000);
  };

  const handleSymptomHover = (symptom, event, index) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const container = event.currentTarget.closest('.body-diagram-container')?.getBoundingClientRect();

    if (container) {
      setTooltipPos({
        x: rect.left - container.left + rect.width + 10,
        y: rect.top - container.top
      });
    }
    setHoveredSymptom({ ...symptom, index });
  };

  const handleSymptomLeave = () => {
    setHoveredSymptom(null);
  };

  const patientVitals = patient?.vitals || {};

  const vitalPresets = {
    temperature: {
      label: 'Temperature',
      fallback: { value: 'Unknown', status: 'No reading', color: 'text-ink-400' },
      valueMap: {
        hot: { value: 'Hot', status: 'Elevated', color: 'text-orange-400' },
        cold: { value: 'Cold', status: 'Depressed', color: 'text-blue-300' },
        neutral: { value: 'Temperate', status: 'Balanced', color: 'text-emerald-300' }
      },
      historyScale: {
        cold: 0,
        neutral: 1,
        temperate: 1,
        warm: 1.5,
        hot: 2
      }
    },
    pulse: {
      label: 'Pulse',
      fallback: { value: 'Unknown', status: 'No reading', color: 'text-ink-400' },
      valueMap: {
        rapid: { value: 'Rapid', status: 'Elevated', color: 'text-orange-400' },
        slow: { value: 'Slow', status: 'Depressed', color: 'text-blue-300' },
        steady: { value: 'Steady', status: 'Normal', color: 'text-emerald-300' }
      },
      historyScale: {
        slow: 0,
        steady: 1,
        rapid: 2
      }
    },
    urine: {
      label: 'urine',
      fallback: { value: 'Unknown', status: 'No observation', color: 'text-ink-400' },
      valueMap: {
        reddish: { value: 'Reddish', status: 'Concerning', color: 'text-orange-400' },
        pale: { value: 'Pale', status: 'Worrisome', color: 'text-blue-300' },
        sallow: { value: 'Sallow', status: 'Sickly', color: 'text-yellow-400' },
        balanced: { value: 'Balanced', status: 'Healthy', color: 'text-emerald-300' }
      },
      historyScale: {
        pale: 0,
        sallow: 0.5,
        balanced: 1,
        reddish: 2
      }
    },
    respiration: {
      label: 'Respiration',
      fallback: { value: 'Unknown', status: 'No reading', color: 'text-ink-400' },
      valueMap: {
        labored: { value: 'Labored', status: 'Strained', color: 'text-orange-400' },
        shallow: { value: 'Shallow', status: 'Compromised', color: 'text-orange-400' },
        steady: { value: 'Steady', status: 'Normal', color: 'text-emerald-300' }
      },
      historyScale: {
        shallow: 0,
        steady: 1,
        labored: 2
      }
    }
  };

  const vitalHistoryMap = useMemo(() => {
    const history = {};
    if (Array.isArray(patientVitals.history)) {
      patientVitals.history.forEach((entry) => {
        if (!entry) return;
        const timestamp = entry.timestamp || entry.time || entry.recordedAt || entry.date;
        const values = entry.values || entry;
        Object.keys(values || {}).forEach((k) => {
          if (!vitalPresets[k]) return;
          if (!history[k]) history[k] = [];
          history[k].push({
            timestamp,
            value: values[k]
          });
        });
      });
    }
    return history;
  }, [patientVitals]);

  const normalizeHistoryValue = (key, rawValue) => {
    if (!rawValue) return null;
    if (typeof rawValue === 'number') return rawValue;
    const config = vitalPresets[key];
    if (!config) return null;
    const scale = config.historyScale || {};
    if (typeof rawValue === 'string') {
      return scale[rawValue.toLowerCase?.() || rawValue] ?? null;
    }
    if (typeof rawValue === 'object') {
      if (rawValue.numeric != null) return Number(rawValue.numeric);
      if (rawValue.value) {
        return normalizeHistoryValue(key, rawValue.value);
      }
    }
    return null;
  };

  const resolveVitalEntry = (key) => {
    const config = vitalPresets[key];
    if (!config) return null;

    const rawValue = patientVitals[key];
    if (!rawValue) {
      return {
        label: config.label,
        ...config.fallback,
        statusColor: config.fallback.color,
        history: (vitalHistoryMap[key] || []).map(entry => ({
          timestamp: entry.timestamp,
          value: normalizeHistoryValue(key, entry.value)
        })).filter(point => point.value != null)
      };
    }

    if (typeof rawValue === 'object' && !Array.isArray(rawValue)) {
      const mapped = config.valueMap?.[rawValue.value?.toLowerCase?.() || rawValue.value];
      return {
        label: config.label,
        value: rawValue.value || mapped?.value || config.fallback.value,
        status: rawValue.status || mapped?.status || config.fallback.status,
        statusColor: rawValue.statusColor || mapped?.color || config.fallback.color,
        history: (vitalHistoryMap[key] || []).map(entry => ({
          timestamp: entry.timestamp,
          value: normalizeHistoryValue(key, entry.value)
        })).filter(point => point.value != null)
      };
    }

    const valueKey = typeof rawValue === 'string' ? rawValue.toLowerCase() : rawValue;
    const mapped = config.valueMap?.[valueKey];
    if (mapped) {
      return {
        label: config.label,
        ...mapped,
        statusColor: mapped.color,
        history: (vitalHistoryMap[key] || []).map(entry => ({
          timestamp: entry.timestamp,
          value: normalizeHistoryValue(key, entry.value)
        })).filter(point => point.value != null)
      };
    }

    return {
      label: config.label,
      value: typeof rawValue === 'string' ? rawValue : config.fallback.value,
      status: config.fallback.status,
      statusColor: config.fallback.color,
      history: (vitalHistoryMap[key] || []).map(entry => ({
        timestamp: entry.timestamp,
        value: normalizeHistoryValue(key, entry.value)
      })).filter(point => point.value != null)
    };
  };

  const vitalCards = Object.keys(vitalPresets)
    .map(resolveVitalEntry)
    .filter(Boolean);

  vitalCards.forEach((card) => {
    if (card.history && card.history.length >= 2) {
      const last = card.history[card.history.length - 1].value;
      const previous = card.history[card.history.length - 2].value;
      if (last > previous) {
        card.trend = 'up';
      } else if (last < previous) {
        card.trend = 'down';
      } else {
        card.trend = 'stable';
      }
    }
  });

  const lastExaminedTimestamp = patientVitals.lastExamined || patient?.lastExamined;
  const lastExaminedCard = (() => {
    if (!lastExaminedTimestamp) return null;
    const parsed = new Date(lastExaminedTimestamp);
    if (Number.isNaN(parsed.getTime())) return null;

    return {
      label: 'Last Examined',
      value: parsed.toLocaleDateString(),
      status: parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      statusColor: 'text-emerald-300',
      valueSize: 'text-base'
    };
  })();

  if (lastExaminedCard) {
    vitalCards.push(lastExaminedCard);
  }

  if (vitalCards.length === 0) {
    vitalCards.push({
      label: 'Vitals',
      value: 'No records',
      status: 'Ask additional questions to gather vitals',
      statusColor: 'text-ink-400'
    });
  }

  const getSeverityBadgeClasses = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'mild':
        return 'bg-yellow-400/10 text-yellow-200 border border-yellow-400/30';
      case 'moderate':
        return 'bg-orange-500/10 text-orange-200 border border-orange-400/40';
      case 'severe':
        return 'bg-red-500/10 text-red-200 border border-red-500/40';
      case 'critical':
        return 'bg-red-600/20 text-red-200 border border-red-600/50';
      default:
        return 'bg-slate-500/10 text-slate-200 border border-slate-400/30';
    }
  };

  const describeSymptomSource = (symptom) => {
    if (!symptom?.source) return null;
    switch (symptom.source) {
      case 'patient-dialogue':
        return 'Patient reported';
      case 'examination':
        return 'Observed during examination';
      case 'llm':
      case 'system':
        return 'Auto-recorded';
      default:
        {
          const sourceText = String(symptom.source);
          return sourceText.charAt(0).toUpperCase() + sourceText.slice(1);
        }
    }
  };

  const formatDiscoveredAt = (value) => {
    if (!value) return null;
    if (typeof value === 'number') {
      return `Turn ${value}`;
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    if (typeof value === 'string') {
      return value;
    }
    return null;
  };

  const hoveredSymptomSource = hoveredSymptom ? describeSymptomSource(hoveredSymptom) : null;
  const hoveredSymptomLoggedAt = hoveredSymptom
    ? formatDiscoveredAt(hoveredSymptom.discoveredAt || hoveredSymptom.timestamp || currentResponse?.timestamp)
    : null;

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-4 animate-fade-in bg-gradient-to-br from-parchment-50 via-white to-parchment-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 transition-colors">

      {/* LEFT COLUMN - DIALOGUE, DIAGNOSIS, OR PRESCRIBE OVERVIEW (40%) */}
      {viewMode === 'diagnose' ? (
        <DiagnosisPanel
          patient={patient}
          onBack={() => setViewMode('examine')}
          onSubmitDiagnosis={handleDiagnosisSubmit}
        />
      ) : viewMode === 'prescribe' ? (
        <PrescribeOverviewPanel
          patient={patient}
          patientDialogue={patientDialogue}
          diagnosisData={diagnosisData}
          onOpenMixing={onOpenMixing}
        />
      ) : (
      <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-ink-100 dark:border-slate-700 shadow-md overflow-hidden">
        {nextStep && (
          <div
            className={`px-5 py-4 border-b border-ink-100 dark:border-slate-700 bg-gradient-to-r ${
              nextStep.tone === 'danger'
                ? 'from-rose-50 to-amber-50 dark:from-rose-900/40 dark:to-amber-900/30'
                : nextStep.tone === 'warning'
                ? 'from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20'
                : nextStep.tone === 'success'
                ? 'from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20'
                : 'from-parchment-50/60 to-white dark:from-slate-800 dark:to-slate-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm font-semibold text-ink-800 dark:text-slate-100 leading-snug">
                {nextStep.message}
              </div>
              {nextStep.cta && (
                <button
                  onClick={nextStep.action}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-2 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  {nextStep.cta}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        {/* Previous Questions Toggle */}
        {patientDialogue.length > 1 && (
          <div className="px-5 py-3 border-b border-ink-100 bg-parchment-50/30">
            <details className="group">
              <summary className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer transition-colors">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                Previous Questions ({patientDialogue.length - 1})
              </summary>
              <div className="mt-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                <PatientDialogueHistory
                  entries={[...patientDialogue.slice(0, -1)].reverse()}
                  emptyLabel="No earlier questions recorded"
                />
              </div>
            </details>
          </div>
        )}

        {/* Current Response Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {currentResponse ? (
            <div className="bg-gradient-to-br from-white to-parchment-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 shadow-sm border border-ink-100 dark:border-slate-700">
              <div className="text-sm font-semibold text-emerald-700 mb-3">
                Q: "{currentResponse.question}"
              </div>
              <div className="text-xs uppercase tracking-wider text-ink-500 dark:text-slate-400 font-sans font-semibold mb-3">
                Patient Response
              </div>
              <div className="text-xl leading-relaxed text-ink-900 dark:text-slate-100 font-serif prose prose-lg max-w-none">
                <ReactMarkdown>{currentResponse.answer}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="text-6xl mb-4 opacity-20">💭</div>
                <p className="text-base text-ink-500 dark:text-slate-200 font-sans font-medium">Ask the patient a question</p>
                <p className="text-sm text-ink-400 dark:text-slate-400 font-sans mt-1">Use the input below or select a quick question</p>
              </div>
            </div>
          )}
        </div>

        {/* Diagnosis Button - Appears after 3+ questions */}
        {viewMode === 'examine' && showDiagnoseButton && !diagnosisData && (
          <div className="px-5 pt-4 pb-2 border-t-2 border-ink-100 dark:border-slate-700 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900/20">
            <button
              onClick={() => setViewMode('diagnose')}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-lg text-sm uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              🩺 Would you like to make a diagnosis?
            </button>
          </div>
        )}

        {/* Question Input Area */}
        <div className="px-5 py-5 border-t-2 border-ink-100 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="relative mb-3">
            <input
              type="text"
              ref={questionInputRef}
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAsking}
              placeholder="Ask the patient..."
              className="w-full pl-4 pr-24 py-3 bg-parchment-50 dark:bg-slate-800 border-2 border-ink-200 dark:border-slate-600 rounded-lg text-base font-serif text-ink-900 dark:text-slate-100 placeholder:text-ink-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleAskQuestion}
              disabled={!currentQuestion.trim() || isAsking}
              className="absolute right-1.5 top-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg text-sm font-semibold hover:from-emerald-500 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isAsking ? 'Asking...' : 'Ask'}
            </button>
          </div>

          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                disabled={isAsking || isPromptRecentlyAsked(q)}
                className={`group px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  isPromptRecentlyAsked(q)
                    ? 'bg-amber-50 border border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300'
                    : 'bg-white hover:bg-emerald-50 border border-ink-200 hover:border-emerald-300 text-ink-600 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300'
                }`}
              >
                <span>{q}</span>
                {isPromptRecentlyAsked(q) && (
                  <span className="ml-2 inline-flex items-center text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    Recent
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Examination Buttons */}
          <div className="flex gap-3 mb-3">
            {examinations.map((exam, idx) => (
              <button
                key={idx}
                onClick={() => handleExamine(exam.command)}
                disabled={isAsking || isPromptRecentlyAsked(exam.command)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  isPromptRecentlyAsked(exam.command)
                    ? 'bg-amber-50 border border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-200'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20 hover:border-emerald-500/50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40 dark:hover:bg-emerald-900/30'
                }`}
              >
                {exam.label}
                {isPromptRecentlyAsked(exam.command) && (
                  <span className="ml-2 inline-flex items-center text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    Recent
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Prescription Banner */}
          {showPrescribeBanner && viewMode === 'examine' && (
            <div
              className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-rose-900/30 dark:to-red-900/30 border-2 border-red-400 dark:border-red-500/70 rounded-lg p-3 cursor-pointer hover:border-red-500 dark:hover:border-red-400 transition-all group animate-pulse-slow"
              onClick={() => setViewMode('prescribe')}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-red-700 uppercase tracking-wide">
                  ℞ Offer a Prescription
                </span>
                <svg className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* RIGHT COLUMN - MEDICAL VISUALIZATION (60%) - Scrollable HUD Panel */}
      <div className="flex flex-col bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 rounded-xl shadow-lg overflow-hidden">

        {/* QUICK ACTIONS TOOLBAR */}
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-b border-white/10 px-5 py-3 flex items-center gap-3 sticky top-0 z-10">
          {/* Status Badge */}
          <div className={`px-3 py-1.5 rounded-lg border font-semibold text-xs uppercase tracking-wide flex items-center gap-2 ${
            diagnosisData
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
              : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
          }`}>
            {diagnosisData ? '✓ Diagnosed' : '⏳ Examining'}
          </div>

          {/* Action Buttons */}
          {viewMode !== 'prescribe' && (
            <>
              {showDiagnoseButton && !diagnosisData && (
                <button
                  onClick={() => setViewMode('diagnose')}
                  className="px-4 py-1.5 bg-blue-500/20 border border-blue-400/40 rounded-lg text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/60 transition-all text-xs font-semibold uppercase tracking-wide flex items-center gap-2"
                >
                  🩺 Diagnose
                </button>
              )}

              {diagnosisData && (
                <button
                  onClick={() => setViewMode('prescribe')}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-lg text-white transition-all text-xs font-semibold uppercase tracking-wide flex items-center gap-2 shadow-lg"
                >
                  ℞ Prescribe
                </button>
              )}
            </>
          )}

          {/* Back button when in prescribe mode */}
          {viewMode === 'prescribe' && (
            <button
              onClick={() => setViewMode('examine')}
              className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/15 transition-all text-xs font-semibold uppercase tracking-wide flex items-center gap-2"
            >
              ← Back to Examine
            </button>
          )}
        </div>

        {/* TAB NAVIGATION - Only show in examine mode */}
        {viewMode !== 'prescribe' && (
          <div className="flex-shrink-0 flex border-b border-white/10 bg-slate-900/50">
            <button
              onClick={() => setActiveMedicalTab('body')}
              className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                activeMedicalTab === 'body'
                  ? 'text-emerald-300 border-b-2 border-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              🫀 Body & Vitals
            </button>
            <button
              onClick={() => setActiveMedicalTab('symptoms')}
              className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                activeMedicalTab === 'symptoms'
                  ? 'text-emerald-300 border-b-2 border-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              📋 Symptoms
            </button>
            <button
              onClick={() => setActiveMedicalTab('diagnosis')}
              className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                activeMedicalTab === 'diagnosis'
                  ? 'text-emerald-300 border-b-2 border-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              🩺 Diagnosis
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">

          {/* Examine Mode - Visible for both 'examine' and 'diagnose' modes */}
          <div className={`transition-opacity duration-500 ${viewMode !== 'prescribe' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>

          {/* BODY & VITALS TAB */}
          {activeMedicalTab === 'body' && (
            <div className="animate-fade-in">
          {/* Body Diagram Section */}
          <div className="body-diagram-container bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative mb-6">
            {/* Patient Header - Full Width */}
            <div className="flex items-center gap-4 pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-display font-semibold text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                  {patient.name || 'Unknown Patient'}
                </div>
                {diagnosisData && (
                  <span className="px-3 py-1 rounded-full text-xs uppercase tracking-widest bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 max-w-[240px] truncate">
                    Diagnosed: {diagnosisData.diagnosis}
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-xs font-sans font-semibold">
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-ink-300">
                  Age {patient.age || '?'}
                </span>
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-ink-300">
                  {patient.gender || 'Unknown'}
                </span>
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-ink-300">
                  {patient.occupation || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Grid Layout: 3 columns for info around diagram */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)_160px]">
              {/* Left Info Panel */}
              <div className="flex flex-col gap-4 order-2 md:order-1 lg:order-1">
                {/* Patient Portrait */}
                {patient.visual?.image || patient.image ? (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2 overflow-hidden">
                    <img
                      src={`/portraits/${patient.visual?.image || patient.image}`}
                      alt={patient.name}
                      className="w-full h-auto rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : null}

                <EditableInfoCard
                  title="FAMILY"
                  fieldKey="family"
                  value={editableFields.family}
                  isEditing={editingField === 'family'}
                  onEditToggle={handleEditToggle}
                  onChange={handlePatientFieldChange}
                  onSave={commitPatientFieldUpdate}
                />
                <EditableInfoCard
                  title="OCCUPATION"
                  fieldKey="occupation"
                  value={editableFields.occupation}
                  isEditing={editingField === 'occupation'}
                  onEditToggle={handleEditToggle}
                  onChange={handlePatientFieldChange}
                  onSave={commitPatientFieldUpdate}
                />
              </div>

              {/* Body Diagram - Center (larger) */}
              <div className="flex items-center justify-center relative order-1 md:order-2 lg:order-2 md:col-span-2 lg:col-auto">
                <BodyDiagram
                  symptoms={symptoms}
                  humorTemp={manualHumorTemp}
                  humorMoisture={manualHumorMoisture}
                  focusedSymptomIndex={focusedSymptomIndex}
                  onSymptomHover={handleSymptomHover}
                  onSymptomLeave={handleSymptomLeave}
                />

                {/* Tooltip - positioned relative to container, not symptom */}
                {hoveredSymptom && (
                  <div
                    className="absolute bg-black/95 text-white px-4 py-3 rounded-lg text-xs pointer-events-none z-50 border border-emerald-500/30 max-w-xs"
                    style={{
                      left: '50%',
                      top: `${tooltipPos.y}px`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="text-sm font-semibold text-emerald-300 mb-1">
                      {hoveredSymptom.name || 'Recorded Symptom'}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-ink-200">
                      <span className={`px-2 py-0.5 rounded ${getSeverityBadgeClasses(hoveredSymptom.severity)}`}>
                        {hoveredSymptom.severity || 'Unknown'}
                      </span>
                      {hoveredSymptomSource && (
                        <span>{hoveredSymptomSource}</span>
                      )}
                      {hoveredSymptomLoggedAt && (
                        <span>Logged {hoveredSymptomLoggedAt}</span>
                      )}
                    </div>
                    <div className="font-serif italic leading-relaxed mt-2">
                      "{hoveredSymptom.description}"
                    </div>
                    {hoveredSymptom.location && (
                      <div className="mt-2 text-xs text-ink-200 font-medium">
                        📍 {hoveredSymptom.location}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Info Panel */}
              <div className="flex flex-col gap-4 order-3 md:order-3 lg:order-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <InfoCardHeader>ASTROLOGY</InfoCardHeader>
                  <div className="text-3xl text-center my-1">
                    {manualAstrology ? getZodiacSymbol(manualAstrology) : '?'}
                  </div>
                  <select
                    value={manualAstrology || ''}
                    onChange={(e) => handleAstrologyUpdate(e.target.value)}
                    className="w-full text-xs font-bold bg-transparent border border-white/20 text-center cursor-pointer text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1"
                  >
                    <option value="" className="bg-slate-800">Unknown</option>
                    <option value="Aries" className="bg-slate-800">♈ Aries</option>
                    <option value="Taurus" className="bg-slate-800">♉ Taurus</option>
                    <option value="Gemini" className="bg-slate-800">♊ Gemini</option>
                    <option value="Cancer" className="bg-slate-800">♋ Cancer</option>
                    <option value="Leo" className="bg-slate-800">♌ Leo</option>
                    <option value="Virgo" className="bg-slate-800">♍ Virgo</option>
                    <option value="Libra" className="bg-slate-800">♎ Libra</option>
                    <option value="Scorpio" className="bg-slate-800">♏ Scorpio</option>
                    <option value="Sagittarius" className="bg-slate-800">♐ Sagittarius</option>
                    <option value="Capricorn" className="bg-slate-800">♑ Capricorn</option>
                    <option value="Aquarius" className="bg-slate-800">♒ Aquarius</option>
                    <option value="Pisces" className="bg-slate-800">♓ Pisces</option>
                  </select>
                  <div className="text-[9px] text-center text-ink-400 mt-1">
                    Ask for birth date or set manually
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <InfoCardHeader>HUMORAL</InfoCardHeader>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {/* Temperature Dropdown */}
                    <div className="text-center p-1.5 bg-white/5 rounded">
                      <div className="text-[9px] text-ink-400 uppercase tracking-wide mb-0.5">Temp</div>
                      <select
                        value={manualHumorTemp || ''}
                        onChange={(e) => handleHumorUpdate('temperature', e.target.value)}
                        className="w-full text-sm font-bold bg-transparent border-none text-center cursor-pointer text-orange-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                      >
                        <option value="" className="bg-slate-800">?</option>
                        <option value="hot" className="bg-slate-800">Hot</option>
                        <option value="cold" className="bg-slate-800">Cold</option>
                        <option value="neutral" className="bg-slate-800">Neutral</option>
                      </select>
                    </div>
                    {/* Moisture Dropdown */}
                    <div className="text-center p-1.5 bg-white/5 rounded">
                      <div className="text-[9px] text-ink-400 uppercase tracking-wide mb-0.5">Moisture</div>
                      <select
                        value={manualHumorMoisture || ''}
                        onChange={(e) => handleHumorUpdate('moisture', e.target.value)}
                        className="w-full text-sm font-bold bg-transparent border-none text-center cursor-pointer text-yellow-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                      >
                        <option value="" className="bg-slate-800">?</option>
                        <option value="dry" className="bg-slate-800">Dry</option>
                        <option value="moist" className="bg-slate-800">Moist</option>
                        <option value="neutral" className="bg-slate-800">Neutral</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-[9px] text-center text-ink-400 mt-2">
                    Ask patient or set manually
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals Grid - In Body & Vitals Tab */}
          <div className="mt-6">
            <SectionTitle>VITAL SIGNS</SectionTitle>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {vitalCards.map((vital, idx) => (
                <VitalCard
                  key={`${vital.label}-${idx}`}
                  label={vital.label}
                  value={vital.value}
                  status={vital.status}
                  statusColor={vital.statusColor}
                  valueSize={vital.valueSize}
                  history={vital.history}
                  trend={vital.trend}
                />
              ))}
            </div>
          </div>

          </div>
          )}
          {/* END BODY & VITALS TAB */}

          {/* SYMPTOMS TAB */}
          {activeMedicalTab === 'symptoms' && (
            <div className="animate-fade-in">
          {/* Symptom List */}
          <div className="mb-6">
            <SectionTitle icon="📋">Recorded Symptoms</SectionTitle>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5">
              <div className="space-y-3">
                {symptoms.map((symptom, idx) => (
                  <SymptomCard
                    key={idx}
                    symptom={symptom}
                    draggable={viewMode === 'diagnose'}
                    isFocused={symptom.originalIndex === focusedSymptomIndex}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Symptom Timeline */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <SectionTitle icon="⏳">Symptom Timeline</SectionTitle>
              <button
                onClick={handleHighlightLatestSymptom}
                disabled={!latestSymptomEntry}
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-lg border border-emerald-400/40 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Highlight Latest
              </button>
            </div>
            {symptomTimeline.length === 0 ? (
              <div className="text-xs text-ink-300 dark:text-slate-400 bg-white/5 dark:bg-slate-800/60 border border-white/10 dark:border-slate-700 rounded-lg px-4 py-3">
                Collect more testimony or observations to build a symptom timeline.
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar">
                {symptomTimeline.map((symptom, idx) => {
                  const isFocused = focusedSymptomIndex === symptom.index;
                  return (
                  <div
                    key={`${symptom.name}-${idx}`}
                    ref={(el) => {
                      if (el) {
                        timelineRefs.current[symptom.index] = el;
                      }
                    }}
                    className={`min-w-[200px] bg-white/5 dark:bg-slate-800/60 border border-white/10 dark:border-slate-700 rounded-lg px-4 py-3 transition-all ${
                      isFocused ? 'ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-ink-900 dark:text-slate-100">{symptom.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${getSeverityBadgeClasses(symptom.severity)}`}>
                        {symptom.severity || 'Unknown'}
                      </span>
                    </div>
                    <div className="text-xs text-ink-400 dark:text-slate-400 mb-2">
                      {formatDiscoveredAt(symptom.discoveredAt || symptom.timestamp) || 'Timing unknown'}
                    </div>
                    <div className="text-xs text-ink-500 dark:text-slate-300 font-serif italic">
                      "{symptom.description}"
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </div>

          </div>
          )}
          {/* END SYMPTOMS TAB */}

          {/* DIAGNOSIS TAB */}
          {activeMedicalTab === 'diagnosis' && (
            <div className="animate-fade-in">
              <DiagnosisSummaryPanel
                patient={patient}
                symptoms={symptoms}
                diagnosisData={diagnosisData}
                manualHumorTemp={manualHumorTemp}
                manualHumorMoisture={manualHumorMoisture}
                manualAstrology={manualAstrology}
                editableFields={editableFields}
                vitalCards={vitalCards}
              />
            </div>
          )}
          {/* END DIAGNOSIS TAB */}

          </div>
          {/* End Examine Mode */}

          {/* Prescribe Mode */}
          <div className={`transition-opacity duration-500 ${viewMode === 'prescribe' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
            <PrescribePanelIntegrated
              gameState={gameState}
              updateInventory={updateInventory}
              onClose={() => setViewMode('examine')}
              currentPatient={patient}
              addJournalEntry={addJournalEntry}
              conversationHistory={conversationHistory}
              setHistoryOutput={setHistoryOutput}
              setConversationHistory={setConversationHistory}
              setTurnNumber={setTurnNumber}
              currentWealth={currentWealth}
              prescriptionType={prescriptionType || 'treatment'}
              advanceTime={advanceTime}
              transactionManager={transactionManager}
              TRANSACTION_CATEGORIES={TRANSACTION_CATEGORIES}
              onPrescriptionPending={onPrescriptionPending}
              onPrescriptionComplete={onPrescriptionComplete}
              toast={toast}
            />
          </div>
          {/* End Prescribe Mode */}

        </div>
      </div>

    </div>
  );
}

// Body Diagram Component with SVG (240px - slightly bigger)
function BodyDiagram({ symptoms, humorTemp, humorMoisture, focusedSymptomIndex, onSymptomHover, onSymptomLeave }) {
  const temperature = (humorTemp || 'neutral').toLowerCase();
  const moisture = (humorMoisture || 'neutral').toLowerCase();

  const TEMP_GRADIENTS = {
    hot: { start: 'rgba(239, 68, 68, 0.65)', end: 'rgba(249, 115, 22, 0.05)' },
    warm: { start: 'rgba(249, 115, 22, 0.5)', end: 'rgba(253, 186, 116, 0.05)' },
    cold: { start: 'rgba(59, 130, 246, 0.55)', end: 'rgba(125, 211, 252, 0.05)' },
    cool: { start: 'rgba(96, 165, 250, 0.45)', end: 'rgba(191, 219, 254, 0.05)' },
    neutral: { start: 'rgba(148, 163, 184, 0.35)', end: 'rgba(148, 163, 184, 0.05)' }
  };

  const MOISTURE_GRADIENTS = {
    moist: { start: 'rgba(16, 185, 129, 0.45)', end: 'rgba(59, 130, 246, 0.08)' },
    wet: { start: 'rgba(59, 130, 246, 0.45)', end: 'rgba(56, 189, 248, 0.08)' },
    dry: { start: 'rgba(234, 179, 8, 0.45)', end: 'rgba(249, 115, 22, 0.08)' },
    arid: { start: 'rgba(202, 138, 4, 0.45)', end: 'rgba(245, 158, 11, 0.08)' },
    neutral: { start: 'rgba(148, 163, 184, 0.25)', end: 'rgba(148, 163, 184, 0.05)' }
  };

  const tempGradientId = `humor-temp-gradient-${temperature}`;
  const moistureGradientId = `humor-moisture-gradient-${moisture}`;

  const activeTemp = TEMP_GRADIENTS[temperature] || TEMP_GRADIENTS.neutral;
  const activeMoisture = MOISTURE_GRADIENTS[moisture] || MOISTURE_GRADIENTS.neutral;

  return (
    <div className="relative max-w-[240px] mx-auto">
      <svg viewBox="0 0 140 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={tempGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={activeTemp.start} />
            <stop offset="100%" stopColor={activeTemp.end} />
          </linearGradient>
          <linearGradient id={moistureGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={activeMoisture.start} />
            <stop offset="100%" stopColor={activeMoisture.end} />
          </linearGradient>
          <radialGradient id="glow-pain">
            <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 0 }} />
          </radialGradient>
          <radialGradient id="glow-wound">
            <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0 }} />
          </radialGradient>
          <radialGradient id="glow-inflammation">
            <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 0.7 }} />
            <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 0 }} />
          </radialGradient>
          <radialGradient id="glow-other">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.7 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* Body Outline */}
        <g stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" fill="none">
          {/* Head */}
          <ellipse cx="70" cy="28" rx="15" ry="19"/>

          {/* Neck */}
          <line x1="70" y1="47" x2="70" y2="58"/>

          {/* Shoulders */}
          <line x1="52" y1="58" x2="88" y2="58"/>

          {/* Torso */}
          <path d="M 52 58 L 50 120 L 70 128 L 90 120 L 88 58"/>

          {/* Left Arm (parallel lines) */}
          <line x1="52" y1="58" x2="30" y2="78"/>
          <line x1="48" y1="60" x2="26" y2="80"/>
          <line x1="30" y1="78" x2="24" y2="106"/>
          <line x1="26" y1="80" x2="20" y2="108"/>

          {/* Left Hand */}
          <ellipse cx="22" cy="113" rx="4" ry="5"/>

          {/* Right Arm (parallel lines) */}
          <line x1="88" y1="58" x2="110" y2="78"/>
          <line x1="92" y1="60" x2="114" y2="80"/>
          <line x1="110" y1="78" x2="116" y2="106"/>
          <line x1="114" y1="80" x2="120" y2="108"/>

          {/* Right Hand */}
          <ellipse cx="118" cy="113" rx="4" ry="5"/>

          {/* Hips */}
          <line x1="50" y1="128" x2="56" y2="136"/>
          <line x1="90" y1="128" x2="84" y2="136"/>

          {/* Left Leg (parallel lines, shorter) */}
          <line x1="56" y1="136" x2="52" y2="190"/>
          <line x1="60" y1="136" x2="56" y2="190"/>
          <line x1="52" y1="190" x2="48" y2="230"/>
          <line x1="56" y1="190" x2="52" y2="230"/>

          {/* Right Leg (parallel lines, shorter) */}
          <line x1="84" y1="136" x2="88" y2="190"/>
          <line x1="80" y1="136" x2="84" y2="190"/>
          <line x1="88" y1="190" x2="92" y2="230"/>
          <line x1="84" y1="190" x2="88" y2="230"/>

        {/* Feet */}
        <ellipse cx="47" cy="237" rx="5" ry="4"/>
        <ellipse cx="90" cy="237" rx="5" ry="4"/>
        </g>

        {/* Humoral overlays */}
        <path
          d="M 52 58 L 50 120 L 70 128 L 90 120 L 88 58 Z"
          fill={`url(#${tempGradientId})`}
          opacity={temperature !== 'neutral' ? 0.75 : 0.35}
          pointerEvents="none"
        />
        <path
          d="M 52 58 L 50 120 L 70 128 L 90 120 L 88 58 Z"
          fill={`url(#${moistureGradientId})`}
          opacity={moisture !== 'neutral' ? 0.6 : 0.2}
          pointerEvents="none"
        />

        {/* Symptom Markers */}
        {symptoms.map((symptom, idx) => (
          <SymptomMarker
            key={idx}
            symptom={symptom}
            index={idx}
            onHover={onSymptomHover}
            onLeave={onSymptomLeave}
            isFocused={symptom.originalIndex === focusedSymptomIndex}
          />
        ))}
      </svg>
    </div>
  );
}

// Symptom Marker Component
function SymptomMarker({ symptom, index, onHover, onLeave, isFocused }) {
  const getSeverityRadius = (severity) => {
    switch (severity) {
      case 'mild': return { outer: 9, middle: 6, inner: 4 };
      case 'moderate': return { outer: 12, middle: 8, inner: 5 };
      case 'severe': return { outer: 16, middle: 10, inner: 6 };
      case 'critical': return { outer: 20, middle: 13, inner: 8 };
      default: return { outer: 12, middle: 8, inner: 5 };
    }
  };

  const getTypeGradient = (type) => {
    switch (type) {
      case 'pain': return 'url(#glow-pain)';
      case 'wound': return 'url(#glow-wound)';
      case 'inflammation': return 'url(#glow-inflammation)';
      default: return 'url(#glow-other)';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pain': return '#fbbf24';
      case 'wound': return '#ef4444';
      case 'inflammation': return '#f97316';
      default: return '#3b82f6';
    }
  };

  const radius = getSeverityRadius(symptom.severity);
  const gradient = getTypeGradient(symptom.type);
  const color = getTypeColor(symptom.type);
  const pos = symptom.position || { x: 70, y: 95 };

  return (
    <g
      className={`symptom-marker cursor-pointer transition-all duration-300 transform hover:scale-110 ${isFocused ? 'scale-110' : ''}`}
      style={{
        animation: 'pulse-glow 2s ease-in-out infinite',
        filter: 'drop-shadow(0 0 8px currentColor)'
      }}
      onMouseEnter={(e) => onHover(symptom, e, index)}
      onMouseLeave={onLeave}
    >
      {isFocused && (
        <circle cx={pos.x} cy={pos.y} r={radius.outer + 6} fill="none" stroke="#34d399" strokeWidth="1.5" className="animate-pulse" />
      )}
      <circle cx={pos.x} cy={pos.y} r={radius.outer} fill={gradient} opacity="0.6"/>
      <circle cx={pos.x} cy={pos.y} r={radius.middle} fill={color} opacity="0.9"/>
      <circle cx={pos.x} cy={pos.y} r={radius.inner} fill={color} opacity="1" style={{ filter: 'brightness(1.5)' }}/>
    </g>
  );
}

// Helper Components
function InfoCard({ title, children }) {
  return (
    <div className="bg-white/5 dark:bg-slate-800/60 border border-white/10 dark:border-slate-700 rounded-lg p-3">
      <InfoCardHeader>{title}</InfoCardHeader>
      {children}
    </div>
  );
}

function EditableInfoCard({
  title,
  fieldKey,
  value,
  isEditing,
  onEditToggle,
  onChange,
  onSave
}) {
  return (
    <div className="bg-white/5 dark:bg-slate-800/60 border border-white/10 dark:border-slate-700 rounded-lg p-3 group">
      <div className="flex items-center justify-between mb-2">
        <InfoCardHeader>{title}</InfoCardHeader>
        <button
          onClick={() => onEditToggle(fieldKey)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 hover:text-emerald-300"
          aria-label={`Edit ${title}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h2M5 11l-2 2 6 6 2-2M15 3l6 6-9 9h-6v-6l9-9z" />
          </svg>
        </button>
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-emerald-400/40 bg-white/80 dark:bg-slate-900/60 text-sm text-ink-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="Enter details..."
          />
          <div className="flex justify-end gap-2 text-xs">
            <button
              onClick={() => onEditToggle(null)}
              className="px-3 py-1 rounded-lg border border-ink-200 dark:border-slate-600 text-ink-500 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(fieldKey)}
              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="text-xs text-ink-300 dark:text-slate-300 leading-relaxed">
          {value || 'Unknown'}
        </div>
      )}
    </div>
  );
}

function InfoCardHeader({ children }) {
  return (
    <div
      className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold mb-2 font-sans"
      style={{ textShadow: '0 0 6px rgba(16, 185, 129, 0.5)' }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <div
      className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-4 flex items-center gap-2 font-sans"
      style={{ textShadow: '0 0 8px rgba(16, 185, 129, 0.4)' }}
    >
      {icon && <span className="text-base">{icon}</span>}
      {children}
    </div>
  );
}

function SymptomCard({ symptom, draggable = false, isFocused = false }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'symptom',
    item: { symptom },
    canDrag: draggable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const getBorderColor = (type) => {
    switch (type) {
      case 'pain': return 'border-l-yellow-400';
      case 'wound': return 'border-l-red-400';
      case 'inflammation': return 'border-l-orange-400';
      default: return 'border-l-blue-400';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return 'bg-yellow-400/20 text-yellow-400';
      case 'moderate': return 'bg-orange-400/20 text-orange-400';
      case 'severe': return 'bg-red-400/20 text-red-400';
      case 'critical': return 'bg-red-600/30 text-red-500';
      default: return 'bg-gray-400/20 text-gray-400';
    }
  };

  return (
    <div
      ref={draggable ? drag : null}
      className={`bg-white/5 dark:bg-slate-800/50 rounded-lg p-3 border-l-4 ${getBorderColor(symptom.type)} hover:bg-white/10 dark:hover:bg-slate-800/70 transition-all ${draggable ? 'cursor-move' : 'cursor-pointer'} ${isFocused ? 'ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''}`}
      style={{
        opacity: isDragging ? 0.5 : 1
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {draggable && <span className="text-xs">⋮⋮</span>}
        <span className="text-sm font-semibold text-white dark:text-slate-100">{symptom.name}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wide ${getSeverityColor(symptom.severity)}`}>
          {symptom.severity}
        </span>
      </div>
      <div className="text-xs text-ink-400 dark:text-slate-400 mb-1.5">📍 {symptom.location}</div>
      <div className="text-xs text-ink-300 dark:text-slate-300 font-serif italic leading-relaxed">
        "{symptom.description}"
      </div>
    </div>
  );
}

function VitalCard({ label, value, status, statusColor, valueSize = 'text-xl', history = [], trend = 'stable' }) {
  const chartWidth = 160;
  const chartHeight = 40;
  const gradientId = `sparkline-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const numericHistory = history
    .map(point => point.value)
    .filter(val => typeof val === 'number' && !Number.isNaN(val));

  const minVal = numericHistory.length > 0 ? Math.min(...numericHistory) : 0;
  const maxVal = numericHistory.length > 0 ? Math.max(...numericHistory) : 0;
  const range = maxVal - minVal || 1;

  const buildSparklinePoints = () => {
    if (numericHistory.length === 0) return '';
    return numericHistory
      .map((val, index) => {
        const x = (index / (numericHistory.length - 1 || 1)) * chartWidth;
        const y = chartHeight - ((val - minVal) / range) * chartHeight;
        return `${x},${Number.isFinite(y) ? y : chartHeight / 2}`;
      })
      .join(' ');
  };

  const latestTimestamp = history.length > 0 ? history[history.length - 1].timestamp : null;

  return (
    <div className="bg-white/5 dark:bg-slate-800/70 border border-white/10 dark:border-slate-700 rounded-lg p-4 min-w-[200px]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-xs uppercase tracking-wide text-ink-400 dark:text-slate-400">{label}</div>
        <TrendBadge trend={trend} />
      </div>
      <div className={`${valueSize} font-bold text-white dark:text-slate-100`}>{value}</div>
      <div className={`text-xs mt-1 ${statusColor || 'text-ink-300'} dark:text-slate-300`}>{status}</div>
      {numericHistory.length > 1 && (
        <div className="mt-3">
          <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-10">
            <polyline
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="2"
              strokeLinecap="round"
              points={buildSparklinePoints()}
            />
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
      {latestTimestamp && (
        <div className="text-[10px] uppercase tracking-wide text-ink-400 dark:text-slate-500 mt-2">
          Updated {formatDiscoveredAt(latestTimestamp)}
        </div>
      )}
    </div>
  );
}

function TrendBadge({ trend }) {
  if (!trend) return null;
  const config = {
    up: {
      label: 'Rising',
      classes: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7 7 7" />
        </svg>
      )
    },
    down: {
      label: 'Falling',
      classes: 'bg-rose-500/10 text-rose-300 border border-rose-500/40',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7" />
        </svg>
      )
    },
    stable: {
      label: 'Stable',
      classes: 'bg-slate-500/10 text-slate-300 border border-slate-500/40',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16" />
        </svg>
      )
    }
  };

  const data = config[trend] || config.stable;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-widest rounded-full ${data.classes}`}>
      {data.icon}
      {data.label}
    </span>
  );
}

// Diagnosis Summary Panel - Auto-populated text summary
function DiagnosisSummaryPanel({ patient, symptoms, diagnosisData, manualHumorTemp, manualHumorMoisture, manualAstrology, editableFields, vitalCards }) {
  if (!diagnosisData) {
    return (
      <div className="text-center py-16 px-6">
        <div className="text-6xl mb-6 opacity-30"></div>
        <div className="text-xl font-bold text-white mb-3">No Diagnosis Yet</div>
        <div className="text-sm text-slate-400 max-w-md mx-auto">
          Gather evidence through examination and questioning, then use the <strong className="text-emerald-300">Diagnose</strong> button in the toolbar to submit your diagnosis.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diagnosis Header */}
      <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl"></div>
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">Your Diagnosis</div>
            <div className="text-2xl font-bold text-white">{diagnosisData.diagnosis}</div>
          </div>
        </div>

        {diagnosisData.evidence && diagnosisData.evidence.length > 0 && (
          <div className="mt-4 pt-4 border-t border-emerald-400/20">
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-3">Evidence Used:</div>
            <div className="grid gap-2">
              {diagnosisData.evidence.map((evidence, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 flex-shrink-0">•</span>
                  <span>{evidence}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Patient Summary */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-4">📋 Patient Summary</div>

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <div>
            <span className="font-semibold text-white">Name:</span> {patient.name || 'Unknown'}
          </div>

          {(patient.age || patient.gender || editableFields.occupation) && (
            <div>
              <span className="font-semibold text-white">Demographics:</span>{' '}
              {[
                patient.age ? `Age ${patient.age}` : null,
                patient.gender,
                editableFields.occupation
              ].filter(Boolean).join(' • ')}
            </div>
          )}

          {editableFields.family && (
            <div>
              <span className="font-semibold text-white">Family:</span> {editableFields.family}
            </div>
          )}

          {(manualHumorTemp || manualHumorMoisture) && (
            <div>
              <span className="font-semibold text-white">Humoral Balance:</span>{' '}
              {[
                manualHumorTemp ? `${manualHumorTemp} temperature` : null,
                manualHumorMoisture ? `${manualHumorMoisture} moisture` : null
              ].filter(Boolean).join(', ')}
            </div>
          )}

          {manualAstrology && (
            <div>
              <span className="font-semibold text-white">Astrological Sign:</span> {manualAstrology}
            </div>
          )}
        </div>
      </div>

      {/* Symptoms Summary */}
      {symptoms && symptoms.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-4">📋 Recorded Symptoms ({symptoms.length})</div>

          <div className="space-y-3">
            {symptoms.map((symptom, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{symptom.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wide ${
                      symptom.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                      symptom.severity === 'severe' ? 'bg-orange-500/20 text-orange-300' :
                      symptom.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {symptom.severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1">📍 {symptom.location}</div>
                  <div className="text-sm text-slate-300 italic">"{symptom.description}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vitals Summary */}
      {vitalCards && vitalCards.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-4">💓 Vital Signs</div>

          <div className="grid grid-cols-2 gap-4">
            {vitalCards.map((vital, idx) => (
              <div key={idx} className="p-3 bg-white/5 rounded-lg">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{vital.label}</div>
                <div className="text-lg font-bold text-white">{vital.value}</div>
                <div className="text-xs text-slate-300">{vital.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Add keyframe animations
const styles = `
@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0) translateY(0);
  }
  50% {
    opacity: 1;
    transform: scale(1) translateY(-10px);
  }
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-sparkle {
  animation: sparkle 0.6s ease-out forwards;
}

.animate-bounce-subtle {
  animation: bounce-subtle 0.6s ease-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  if (!document.head.querySelector('style[data-patient-view-animations]')) {
    styleSheet.setAttribute('data-patient-view-animations', 'true');
    document.head.appendChild(styleSheet);
  }
}
