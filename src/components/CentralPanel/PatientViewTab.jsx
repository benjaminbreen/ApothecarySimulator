// PatientViewTab.jsx
// Patient examination view - two column layout with expanded space

import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getPositionForLocation } from '../../utils/bodyPositionMapper';
import PrescribePanelIntegrated from '../../features/medical/components/PrescribePanelIntegrated';
import DiagnosisPanel from '../../features/medical/components/DiagnosisPanel';
import PrescribeOverviewPanel from '../../features/medical/components/PrescribeOverviewPanel';
import { getZodiacSymbol } from '../../core/utils/astrologyCalculator';
import { entityManager } from '../../core/entities/EntityManager';

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
  transactionManager,
  TRANSACTION_CATEGORIES,
  toggleInventory,
  onOpenInventoryTab,
  onOpenMixing, // New prop for mixing modal
  onPrescriptionPending, // Callback when prescription is being processed
  onPrescriptionComplete // Callback when prescription outcome is accepted
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

  // Show diagnose button after first question is answered
  useEffect(() => {
    if (patientDialogue.length > 0) {
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
  const handleDiagnosisSubmit = (diagnosis) => {
    setDiagnosisData(diagnosis);

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
        { role: 'user', content: `[DIAGNOSIS SUBMITTED] Based on examination, diagnose ${patient.name}` },
        { role: 'assistant', content: diagnosisSummary },
        { role: 'system', content: `*[MEDICAL DIAGNOSIS] Diagnosis: ${diagnosis.diagnosis}. Evidence: ${evidenceSummary}*` }
      ]);
    }

    // Update history output for narration panel
    if (setHistoryOutput) {
      setHistoryOutput(`You have diagnosed ${patient.name} with **${diagnosis.diagnosis}**. Now you may offer a prescription.`);
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

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim() || !onAskQuestion) return;
    setIsAsking(true);
    await onAskQuestion(currentQuestion);
    setCurrentQuestion('');
    setIsAsking(false);
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
    { label: "👁️ Inspect wound", command: "examine the patient's wounds closely" },
    { label: "🫀 Check pulse", command: "check the patient's pulse" },
    { label: "👅 View tongue", command: "examine the patient's tongue" }
  ];

  const handleExamine = async (command) => {
    if (!onAskQuestion) return;
    setIsAsking(true);
    await onAskQuestion(command);
    setIsAsking(false);
  };

  const currentResponse = patientDialogue.length > 0
    ? patientDialogue[patientDialogue.length - 1]
    : null;

  // Extract symptoms from patient data and add SVG positions
  // ONLY show discovered symptoms (those with source: 'patient-dialogue')
  // OR the first symptom (chief complaint)
  const allSymptoms = patient.symptoms || [];
  const discoveredSymptoms = allSymptoms.filter((symptom, index) =>
    index === 0 || symptom.source === 'patient-dialogue' || symptom.discoveredAt
  );

  const symptoms = (discoveredSymptoms.length > 0 ? discoveredSymptoms : [
    {
      name: "Unknown Ailment",
      severity: "mild",
      type: "other",
      location: "General",
      description: "Chief complaint not yet recorded. Ask the patient what troubles them."
    }
  ]).map(symptom => ({
    ...symptom,
    // Add SVG position if not already present (using location mapper)
    position: symptom.position || getPositionForLocation(symptom.location)
  }));

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

  return (
    <div className="h-full grid grid-cols-[40%_60%] gap-4 animate-fade-in bg-gradient-to-br from-parchment-50 to-white p-4">

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
            </details>
          </div>
        )}

        {/* Current Response Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {currentResponse ? (
            <div className="bg-gradient-to-br from-white to-parchment-50 rounded-xl p-6 shadow-sm border border-ink-100">
              <div className="text-sm font-semibold text-emerald-700 mb-3">
                Q: "{currentResponse.question}"
              </div>
              <div className="text-xs uppercase tracking-wider text-ink-500 font-sans font-semibold mb-3">
                Patient Response
              </div>
              <div className="text-lg leading-relaxed text-ink-900 font-serif">
                {currentResponse.answer}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="text-6xl mb-4 opacity-20">💭</div>
                <p className="text-base text-ink-500 font-sans font-medium">Ask the patient a question</p>
                <p className="text-sm text-ink-400 font-sans mt-1">Use the input below or select a quick question</p>
              </div>
            </div>
          )}
        </div>

        {/* Question Input Area */}
        <div className="px-5 py-5 border-t-2 border-ink-100 bg-white">
          <div className="relative mb-3">
            <input
              type="text"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAsking}
              placeholder="Ask the patient..."
              className="w-full pl-4 pr-24 py-3 bg-parchment-50 border-2 border-ink-200 rounded-lg text-base font-serif focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all disabled:opacity-50"
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
                onClick={() => setCurrentQuestion(q)}
                disabled={isAsking}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-ink-200 hover:border-emerald-300 rounded-lg text-xs text-ink-600 hover:text-emerald-700 font-medium transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Examination Buttons */}
          <div className="flex gap-2 mb-3">
            {examinations.map((exam, idx) => (
              <button
                key={idx}
                onClick={() => handleExamine(exam.command)}
                disabled={isAsking}
                className="flex-1 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all disabled:opacity-50"
              >
                {exam.label}
              </button>
            ))}
          </div>

          {/* Prescription Banner */}
          {showPrescribeBanner && viewMode === 'examine' && (
            <div
              className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 rounded-lg p-3 cursor-pointer hover:border-red-500 transition-all group animate-pulse-slow"
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
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">

          {/* Examine Mode - Visible for both 'examine' and 'diagnose' modes */}
          <div className={`transition-opacity duration-500 ${viewMode !== 'prescribe' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>

          {/* Body Diagram Section */}
          <div className="body-diagram-container bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative mb-6">
            {/* Patient Header - Full Width */}
            <div className="flex items-center gap-4 pb-4 mb-4 border-b border-white/10">
              <div className="text-2xl font-display font-semibold text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                {patient.name || 'Unknown Patient'}
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
            <div className="grid grid-cols-[160px_1fr_160px] gap-6">
              {/* Left Info Panel */}
              <div className="flex flex-col gap-4">
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

                <InfoCard title="FAMILY">
                  <div className="text-xs text-ink-300 leading-relaxed">
                    {patient.family || 'Unknown'}
                  </div>
                </InfoCard>
                <InfoCard title="OCCUPATION">
                  <div className="text-xs text-ink-300 leading-relaxed">
                    {patient.occupation || 'Unknown'}
                  </div>
                </InfoCard>
              </div>

              {/* Body Diagram - Center (larger) */}
              <div className="flex items-center justify-center relative">
                <BodyDiagram
                  symptoms={symptoms}
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
                    <div className="text-emerald-400 font-semibold mb-1">
                      {currentResponse?.timestamp || 'Current examination'}
                    </div>
                    <div className="font-serif italic leading-relaxed">
                      "{hoveredSymptom.description}"
                    </div>
                  </div>
                )}
              </div>

              {/* Right Info Panel */}
              <div className="flex flex-col gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <InfoCardHeader>ASTROLOGY</InfoCardHeader>
                  <div className="text-3xl text-center my-1">
                    {patient.astrology ? getZodiacSymbol(patient.astrology) : '?'}
                  </div>
                  <div className="text-xs text-center text-emerald-400 font-semibold">
                    {patient.astrology || 'Unknown'}
                  </div>
                  <div className="text-[9px] text-center text-ink-400 mt-1">
                    Ask for birth date
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <InfoCardHeader>HUMORAL</InfoCardHeader>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {/* Temperature Dropdown */}
                    <div className="text-center p-1.5 bg-white/5 rounded">
                      <div className="text-[9px] text-ink-400 uppercase tracking-wide mb-0.5">Temp</div>
                      <select
                        value={manualHumorTemp || patient.humors?.temperature || ''}
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
                        value={manualHumorMoisture || patient.humors?.moisture || ''}
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

                  {/* Diagnose Button - Appears after first question */}
                  {viewMode === 'examine' && showDiagnoseButton && !diagnosisData && (
                    <button
                      onClick={() => setViewMode('diagnose')}
                      className="mt-3 w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-2 px-3 rounded-lg text-xs uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      🩺 Diagnose
                    </button>
                  )}

                  {/* Prescribe Button - Appears after diagnosis */}
                  {viewMode === 'examine' && diagnosisData && (
                    <button
                      onClick={() => setViewMode('prescribe')}
                      className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-2 px-3 rounded-lg text-xs uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      ℞ Prescribe
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Symptom List - Below diagram on same dark background */}
          <div className="mb-6">
            <SectionTitle icon="📋">Recorded Symptoms</SectionTitle>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5">
              <div className="space-y-3">
                {symptoms.map((symptom, idx) => (
                  <SymptomCard
                    key={idx}
                    symptom={symptom}
                    draggable={viewMode === 'diagnose'}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Vitals Grid - Below symptoms on same dark background */}
          <div>
            <SectionTitle>VITAL SIGNS</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <VitalCard label="Temperature" value="Hot" status="Elevated" statusColor="text-orange-400" />
              <VitalCard label="Pulse" value="Rapid" status="Elevated" statusColor="text-orange-400" />
              <VitalCard label="Complexion" value="Flushed" status="Concerning" statusColor="text-orange-400" />
              <VitalCard label="Last Examined" value="Turn 8" status="2:34 PM" statusColor="text-emerald-400" valueSize="text-base" />
            </div>
          </div>

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
            />
          </div>
          {/* End Prescribe Mode */}

        </div>
      </div>

    </div>
  );
}

// Body Diagram Component with SVG (240px - slightly bigger)
function BodyDiagram({ symptoms, onSymptomHover, onSymptomLeave }) {
  return (
    <div className="relative max-w-[240px] mx-auto">
      <svg viewBox="0 0 140 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" style={{ overflow: 'visible' }}>
        <defs>
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

        {/* Symptom Markers */}
        {symptoms.map((symptom, idx) => (
          <SymptomMarker
            key={idx}
            symptom={symptom}
            index={idx}
            onHover={onSymptomHover}
            onLeave={onSymptomLeave}
          />
        ))}
      </svg>
    </div>
  );
}

// Symptom Marker Component
function SymptomMarker({ symptom, index, onHover, onLeave }) {
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
      className="symptom-marker cursor-pointer transition-all duration-300 hover:scale-110"
      style={{
        animation: 'pulse-glow 2s ease-in-out infinite',
        filter: 'drop-shadow(0 0 8px currentColor)'
      }}
      onMouseEnter={(e) => onHover(symptom, e, index)}
      onMouseLeave={onLeave}
    >
      <circle cx={pos.x} cy={pos.y} r={radius.outer} fill={gradient} opacity="0.6"/>
      <circle cx={pos.x} cy={pos.y} r={radius.middle} fill={color} opacity="0.9"/>
      <circle cx={pos.x} cy={pos.y} r={radius.inner} fill={color} opacity="1" style={{ filter: 'brightness(1.5)' }}/>
    </g>
  );
}

// Helper Components
function InfoCard({ title, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <InfoCardHeader>{title}</InfoCardHeader>
      {children}
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

function SymptomCard({ symptom, draggable = false }) {
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
      className={`bg-white/5 rounded-lg p-3 border-l-4 ${getBorderColor(symptom.type)} hover:bg-white/10 transition-all ${draggable ? 'cursor-move' : 'cursor-pointer'}`}
      style={{
        opacity: isDragging ? 0.5 : 1
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {draggable && <span className="text-xs">⋮⋮</span>}
        <span className="text-sm font-semibold text-white">{symptom.name}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wide ${getSeverityColor(symptom.severity)}`}>
          {symptom.severity}
        </span>
      </div>
      <div className="text-xs text-ink-400 mb-1.5">📍 {symptom.location}</div>
      <div className="text-xs text-ink-300 font-serif italic leading-relaxed">
        "{symptom.description}"
      </div>
    </div>
  );
}

function VitalCard({ label, value, status, statusColor, valueSize = 'text-xl' }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <div className="text-xs uppercase tracking-wide text-ink-400 mb-1.5">{label}</div>
      <div className={`${valueSize} font-bold text-white`}>{value}</div>
      <div className={`text-xs mt-1 ${statusColor}`}>{status}</div>
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
