/**
 * NPCPatientModal - Enhanced Design
 *
 * Redesigned to match ItemModalEnhanced aesthetic:
 * - Glassomorphic parchment design
 * - Large visual portrait on overview
 * - Tab system: Overview, Background, Examination, History, Conversations
 * - Focus on patient as person (family, background, personality)
 * - Conversation history from InteractionMemory
 * - Retains Swiss design clean typography
 */

import React, { useState, useEffect, useMemo } from 'react';
import TreatmentTimeline from './TreatmentTimeline';
import { generateTreatmentHistory } from '../services/treatmentGenerator';
import { adaptEntityForPatientModal } from '../../../core/entities/entityAdapter';
import { getMemoryContext } from '../../../core/entities/InteractionMemory';
import { resolvePortrait } from '../../../core/services/portraitResolver';

export default function NPCPatientModal({
  isOpen,
  onClose,
  patient,
  onPrescribe,
  onDiagnose,
  medicalRecords = {},
  playerSkills = null,
  reputation = {},
  currentDate = '',
  currentTime = ''
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isVisible, setIsVisible] = useState(false);

  // Adapt entity to flat format
  const adaptedPatient = useMemo(() => {
    if (!patient) return null;

    const adapted = adaptEntityForPatientModal(patient);

    console.log('[NPCPatientModal] Adapted patient:', {
      name: adapted?.name,
      hasPortrait: !!adapted?.portrait,
      portraitPath: adapted?.portrait,
      hasDiagnosis: !!adapted?.diagnosis,
      diagnosis: adapted?.diagnosis,
      symptomsCount: adapted?.symptoms?.length || 0
    });

    return adapted;
  }, [patient]);

  // Get real treatment history from medical records
  const treatmentHistory = useMemo(() => {
    if (!patient?.id || !medicalRecords) return [];

    const patientRecord = medicalRecords[patient.id];
    if (!patientRecord?.sessions) return [];

    // Convert sessions to TreatmentTimeline format
    return patientRecord.sessions.map(session => {
      // Determine primary treatment from session
      const primaryTreatment = session.prescriptions?.[0] || session.procedures?.[0];

      return {
        date: session.date || currentDate,
        time: session.time || currentTime,

        // Practitioner info (TreatmentTimeline requires this)
        practitioner: {
          name: 'Maria de Lima', // Always the player in this game
          education: 'Apothecary',
          isPlayer: true
        },

        // Treatment info (TreatmentTimeline requires this)
        treatment: {
          name: primaryTreatment?.medicine || primaryTreatment?.item || primaryTreatment?.name || primaryTreatment?.type || 'Medical consultation',
          method: primaryTreatment?.route || session.procedureType || 'Galenic compound',
          theory: 'Humoral balancing'
        },

        // Outcome and notes
        outcome: session.outcome || 'Treatment administered, monitoring progress',
        notes: session.notes || ''
      };
    }).reverse(); // Most recent first
  }, [patient?.id, medicalRecords, currentDate, currentTime]);

  // Get active treatments (from most recent session)
  const activeTreatments = useMemo(() => {
    if (!patient?.id || !medicalRecords) return [];

    const patientRecord = medicalRecords[patient.id];
    if (!patientRecord?.sessions || patientRecord.sessions.length === 0) return [];

    const mostRecentSession = patientRecord.sessions[patientRecord.sessions.length - 1];
    const treatments = [];

    // Add prescriptions as active treatments
    if (mostRecentSession.prescriptions) {
      mostRecentSession.prescriptions.forEach(prescription => {
        treatments.push({
          type: 'prescription',
          name: prescription.medicine || prescription.item || 'Unknown Medicine',
          route: prescription.route || 'oral',
          dosage: prescription.dosage || 'As directed',
          prescribedDate: mostRecentSession.date,
          prescribedTime: mostRecentSession.time,
          status: 'active',
          effects: prescription.expectedEffects || []
        });
      });
    }

    // Add procedures as active treatments
    if (mostRecentSession.procedures) {
      mostRecentSession.procedures.forEach(procedure => {
        treatments.push({
          type: 'procedure',
          name: procedure.name || procedure.type || 'Medical Procedure',
          prescribedDate: mostRecentSession.date,
          prescribedTime: mostRecentSession.time,
          status: procedure.completed ? 'completed' : 'pending',
          notes: procedure.notes || ''
        });
      });
    }

    return treatments;
  }, [patient?.id, medicalRecords]);

  // Get conversation history from memory
  const conversationHistory = useMemo(() => {
    if (!patient?.memory?.interactions) return [];
    return patient.memory.interactions || [];
  }, [patient]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Entrance animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Calculate skill requirements for this patient's condition
  const skillRequirements = useMemo(() => {
    const patientDiagnosis = adaptedPatient?.diagnosis;
    if (!patientDiagnosis) return [];

    // Base requirements for all patients
    const requirements = [
      { skill: 'diagnosis', required: 2, description: 'Identify symptoms' },
      { skill: 'pharmacy', required: 2, description: 'Prescribe medicines' }
    ];

    // Add complexity-based requirements
    const diagnosisLower = (patientDiagnosis || '').toLowerCase();
    if (diagnosisLower.includes('fever') || diagnosisLower.includes('infection')) {
      requirements.push({ skill: 'herbalism', required: 3, description: 'Treat fever/infection' });
    }
    if (diagnosisLower.includes('surgery') || diagnosisLower.includes('wound') || diagnosisLower.includes('bleeding')) {
      requirements.push({ skill: 'surgery', required: 3, description: 'Perform surgical procedures' });
    }
    if (diagnosisLower.includes('poison') || diagnosisLower.includes('toxic')) {
      requirements.push({ skill: 'alchemy', required: 4, description: 'Handle poisonous compounds' });
    }
    if (diagnosisLower.includes('rare') || diagnosisLower.includes('complex') || diagnosisLower.includes('mysterious')) {
      requirements.push({ skill: 'diagnosis', required: 5, description: 'Diagnose rare conditions' });
    }

    return requirements;
  }, [adaptedPatient?.diagnosis]);

  // Calculate relationship metrics
  const relationshipData = useMemo(() => {
    // Get patient's casta/faction for reputation
    const casta = patient?.social?.casta || patient?.appearance?.casta || 'commonFolk';
    const reputationValue = reputation[casta] || reputation.commonFolk || 50;

    // Get patient affinity (from relationship system)
    const affinity = patient?.relationship?.affinity || 50;

    // Determine relationship status
    let relationshipStatus = 'Neutral';
    let relationshipColor = '#94a3b8';
    if (affinity >= 80) {
      relationshipStatus = 'Trusted';
      relationshipColor = '#10b981';
    } else if (affinity >= 60) {
      relationshipStatus = 'Friendly';
      relationshipColor = '#3b82f6';
    } else if (affinity < 40) {
      relationshipStatus = 'Wary';
      relationshipColor = '#ef4444';
    } else if (affinity < 20) {
      relationshipStatus = 'Hostile';
      relationshipColor = '#991b1b';
    }

    return {
      affinity,
      relationshipStatus,
      relationshipColor,
      casta,
      reputationValue
    };
  }, [patient, reputation]);

  if (!isOpen || !adaptedPatient) return null;

  const {
    name,
    age,
    type,
    description,
    diagnosis,
    socialContext,
    symptoms = [],
    portrait: adaptedPortrait,
    background,
    family,
    occupation,
    personality,
    relationships
  } = adaptedPatient;

  // FALLBACK: If adapter didn't get portrait, resolve it directly from original patient
  const portrait = adaptedPortrait || resolvePortrait(patient);

  const isDark = document.documentElement.classList.contains('dark');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'background', label: 'Background', icon: '👤' },
    { id: 'examination', label: 'Examination', icon: '🩺' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'conversations', label: 'Conversations', icon: '💬' }
  ];

  // Parse symptoms for display
  const parsedSymptoms = parseSymptoms(diagnosis, symptoms);

  // Get status color
  const statusColor = getPatientStatusColor(type);

  return (
    <div
      className={`fixed inset-0 bg-stone-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Modal Container - Responsive: Full screen on mobile */}
      <div
        className={`relative w-full max-w-full sm:max-w-6xl h-screen sm:h-[76vh] rounded-none sm:rounded-2xl overflow-hidden flex flex-col shadow-elevation-4 transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-98 translate-y-2'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(0, 0, 0, 0.92) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 245, 235, 0.95) 50%, rgba(252, 250, 247, 0.98) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: isDark
            ? '0 24px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 24px 80px rgba(61, 47, 36, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 p-2 rounded-lg transition-all duration-150 hover:bg-ink-100 dark:hover:bg-slate-700"
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke={isDark ? '#e2e8f0' : '#3d2817'} viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div
          className="flex-shrink-0 border-b relative z-10 px-8 py-5"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
              : 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
            borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Patient Name */}
              <h1 className={`font-serif font-bold text-3xl mb-2 ${isDark ? 'text-parchment-100' : 'text-ink-900'}`} style={{ letterSpacing: '-0.01em' }}>
                {name}
              </h1>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-baseline gap-2">
                  <span className={`font-sans font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.08em', fontSize: '0.65rem' }}>
                    Age
                  </span>
                  <span className={`font-sans font-bold ${isDark ? 'text-parchment-200' : 'text-ink-900'}`}>
                    {age || 'Unknown'}
                  </span>
                </div>

                <div className={`w-px h-4 ${isDark ? 'bg-slate-600' : 'bg-ink-300'}`} />

                <div className="flex items-baseline gap-2">
                  <span className={`font-sans font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.08em', fontSize: '0.65rem' }}>
                    Type
                  </span>
                  <span className={`font-sans font-bold capitalize ${isDark ? 'text-parchment-200' : 'text-ink-900'}`}>
                    {type}
                  </span>
                </div>

                <div className={`w-px h-4 ${isDark ? 'bg-slate-600' : 'bg-ink-300'}`} />

                <div className="flex items-baseline gap-2">
                  <span className={`font-sans font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.08em', fontSize: '0.65rem' }}>
                    Status
                  </span>
                  <span
                    className="px-2 py-0.5 font-sans font-bold text-xs rounded"
                    style={{
                      letterSpacing: '0.03em',
                      background: `linear-gradient(135deg, ${statusColor.light}, ${statusColor.primary})`,
                      color: '#fff',
                      boxShadow: `0 2px 6px ${statusColor.glow}`
                    }}
                  >
                    ACTIVE PATIENT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex-shrink-0 flex border-b relative z-10"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(0, 0, 0, 0.9))'
              : 'linear-gradient(to bottom, rgba(248, 246, 241, 0.95), rgba(245, 243, 238, 0.9))',
            borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
          }}
        >
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative font-sans"
                style={{
                  fontWeight: isActive ? 700 : 600,
                  letterSpacing: '0.08em',
                  color: isActive
                    ? statusColor.primary
                    : isDark ? '#94a3b8' : '#6b5a47',
                  background: isActive
                    ? isDark
                      ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.8))'
                      : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))'
                    : 'transparent',
                  borderLeft: idx > 0 ? `1px solid ${isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(209, 213, 219, 0.2)'}` : 'none'
                }}
              >
                <span className="mr-2 text-base" style={{ opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
                {tab.label}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: `linear-gradient(to right, ${statusColor.light}, ${statusColor.primary}, ${statusColor.light})`
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area - FIXED HEIGHT with scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8" style={{
          background: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(252, 250, 247, 0.4)'
        }}>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Hero Section with Portrait */}
              <div className="flex gap-6">
                {/* Portrait */}
                <div
                  className="w-80 h-80 rounded-xl overflow-hidden flex-shrink-0"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.95), rgba(30, 41, 59, 0.9))'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                    border: isDark ? '2px solid rgba(71, 85, 105, 0.3)' : '2px solid rgba(209, 213, 219, 0.3)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {portrait ? (
                    <img
                      src={portrait}
                      alt={name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      style={{ willChange: 'auto' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full items-center justify-center text-9xl"
                    style={{ display: portrait ? 'none' : 'flex' }}
                  >
                    {type === 'patient' ? '🤒' : '👤'}
                  </div>
                </div>

                {/* Patient Overview */}
                <div className="flex-1 space-y-4">
                  {/* Description */}
                  {description && (
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        background: isDark
                          ? 'rgba(15, 23, 42, 0.6)'
                          : 'rgba(255, 255, 255, 0.6)',
                        border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                      }}
                    >
                      <h3 className={`font-sans font-bold text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.1em' }}>
                        Patient Information
                      </h3>
                      <p className={`font-serif text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-ink-800'}`}>
                        {description}
                      </p>
                    </div>
                  )}

                  {/* Current Diagnosis - Emphasized */}
                  {diagnosis && (
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${statusColor.bg}, ${statusColor.light}15)`,
                        border: `1px solid ${statusColor.primary}40`
                      }}
                    >
                      <h3 className="font-sans font-bold text-xs uppercase tracking-wider mb-2" style={{ letterSpacing: '0.1em', color: statusColor.primary }}>
                        Current Diagnosis
                      </h3>
                      <p className={`font-serif text-base font-semibold leading-snug ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
                        "{extractChiefComplaint(diagnosis)}"
                      </p>
                    </div>
                  )}

                  {/* Social Context */}
                  {socialContext && (
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        background: isDark
                          ? 'rgba(15, 23, 42, 0.6)'
                          : 'rgba(255, 255, 255, 0.6)',
                        border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                      }}
                    >
                      <h3 className={`font-sans font-bold text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.1em' }}>
                        Social Context
                      </h3>
                      <p className={`font-serif text-sm leading-relaxed italic ${isDark ? 'text-slate-400' : 'text-ink-700'}`}>
                        {socialContext}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* NEW: Active Treatments Panel */}
              {activeTreatments.length > 0 && (
                <div
                  className="p-5 rounded-xl"
                  style={{
                    background: isDark
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(16, 185, 129, 0.05)',
                    border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <h3 className={`font-sans font-bold text-sm uppercase tracking-wider mb-4 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} style={{ letterSpacing: '0.1em' }}>
                    💊 Active Treatments ({activeTreatments.length})
                  </h3>
                  <div className="space-y-3">
                    {activeTreatments.map((treatment, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg p-3"
                        style={{
                          background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                          border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
                          borderLeft: `3px solid ${treatment.status === 'active' ? '#10b981' : '#94a3b8'}`
                        }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className={`font-sans font-bold text-sm ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
                            {treatment.type === 'prescription' ? '🌿' : '⚕️'} {treatment.name}
                          </p>
                          <span
                            className="px-2 py-0.5 text-xs font-sans font-bold uppercase rounded"
                            style={{
                              background: treatment.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                              color: treatment.status === 'active' ? '#10b981' : '#64748b',
                              fontSize: '0.65rem'
                            }}
                          >
                            {treatment.status}
                          </span>
                        </div>
                        {treatment.route && (
                          <p className={`text-xs font-sans mb-1 ${isDark ? 'text-slate-400' : 'text-ink-600'}`}>
                            Route: {treatment.route}  •  {treatment.dosage}
                          </p>
                        )}
                        <p className={`text-xs font-sans ${isDark ? 'text-slate-500' : 'text-ink-500'}`}>
                          Prescribed: {treatment.prescribedDate} at {treatment.prescribedTime}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NEW: Relationship & Reputation Panel */}
              <div className="grid grid-cols-2 gap-4">
                {/* Relationship Status */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                  }}
                >
                  <h3 className={`font-sans font-bold text-xs uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.1em' }}>
                    Patient Trust
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)' }}>
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${relationshipData.affinity}%`,
                            background: `linear-gradient(to right, ${relationshipData.relationshipColor}, ${relationshipData.relationshipColor}dd)`
                          }}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-sans font-bold ${isDark ? 'text-parchment-200' : 'text-ink-800'}`}>
                      {relationshipData.affinity}%
                    </span>
                  </div>
                  <p
                    className="text-sm font-sans font-semibold"
                    style={{ color: relationshipData.relationshipColor }}
                  >
                    {relationshipData.relationshipStatus}
                  </p>
                </div>

                {/* Faction Reputation */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                  }}
                >
                  <h3 className={`font-sans font-bold text-xs uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.1em' }}>
                    Faction Standing
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)' }}>
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${relationshipData.reputationValue}%`,
                            background: relationshipData.reputationValue >= 60 ? 'linear-gradient(to right, #10b981, #059669)' :
                                       relationshipData.reputationValue <= 40 ? 'linear-gradient(to right, #ef4444, #dc2626)' :
                                       'linear-gradient(to right, #f59e0b, #d97706)'
                          }}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-sans font-bold ${isDark ? 'text-parchment-200' : 'text-ink-800'}`}>
                      {relationshipData.reputationValue}%
                    </span>
                  </div>
                  <p className={`text-sm font-sans font-semibold capitalize ${isDark ? 'text-parchment-300' : 'text-ink-700'}`}>
                    {relationshipData.casta}
                  </p>
                </div>
              </div>

              {/* NEW: Skill Requirements Panel */}
              {playerSkills && skillRequirements.length > 0 && (
                <div
                  className="p-5 rounded-xl"
                  style={{
                    background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                  }}
                >
                  <h3 className={`font-sans font-bold text-sm uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-ink-700'}`} style={{ letterSpacing: '0.1em' }}>
                    📚 Required Skills
                  </h3>
                  <div className="space-y-2">
                    {skillRequirements.map((req, idx) => {
                      const playerSkill = playerSkills?.knownSkills?.[req.skill];
                      const playerLevel = playerSkill?.level || 0;
                      const meetsRequirement = playerLevel >= req.required;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 px-3 rounded-lg"
                          style={{
                            background: meetsRequirement
                              ? (isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)')
                              : (isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'),
                            border: meetsRequirement
                              ? '1px solid rgba(16, 185, 129, 0.2)'
                              : '1px solid rgba(239, 68, 68, 0.2)'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{meetsRequirement ? '✓' : '✗'}</span>
                            <div>
                              <p className={`font-sans font-bold text-sm capitalize ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
                                {req.skill}
                              </p>
                              <p className={`text-xs font-sans ${isDark ? 'text-slate-400' : 'text-ink-600'}`}>
                                {req.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-sans font-bold ${meetsRequirement ? (isDark ? 'text-emerald-300' : 'text-emerald-700') : (isDark ? 'text-red-300' : 'text-red-700')}`}>
                              Level {req.required} required
                            </p>
                            <p className={`text-xs font-sans ${isDark ? 'text-slate-400' : 'text-ink-600'}`}>
                              Your level: {playerLevel}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => onPrescribe?.(patient)}
                  className="px-6 py-4 rounded-xl font-sans font-bold text-sm uppercase tracking-wider transition-all duration-200"
                  style={{
                    letterSpacing: '0.1em',
                    background: `linear-gradient(135deg, ${statusColor.primary}, ${statusColor.dark})`,
                    color: '#fff',
                    boxShadow: `0 4px 12px ${statusColor.glow}`
                  }}
                >
                  Prescribe Treatment
                </button>

                <button
                  onClick={() => onDiagnose?.(patient)}
                  className={`px-6 py-4 rounded-xl font-sans font-bold text-sm uppercase tracking-wider transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-parchment-100'
                      : 'bg-white hover:bg-ink-50 text-ink-900'
                  }`}
                  style={{
                    letterSpacing: '0.1em',
                    border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '2px solid rgba(61, 40, 23, 0.2)'
                  }}
                >
                  Update Diagnosis
                </button>

                <button
                  className={`px-6 py-4 rounded-xl font-sans font-semibold text-sm uppercase tracking-wider transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-parchment-50 hover:bg-parchment-100 text-ink-700'
                  }`}
                  style={{
                    letterSpacing: '0.1em',
                    border: isDark ? '1px solid rgba(71, 85, 105, 0.2)' : '1px solid rgba(209, 213, 219, 0.3)'
                  }}
                >
                  Add Note
                </button>
              </div>
            </div>
          )}

          {/* BACKGROUND TAB */}
          {activeTab === 'background' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Family */}
                {(family || relationships) && (
                  <div
                    className="p-5 rounded-xl"
                    style={{
                      background: isDark
                        ? 'rgba(15, 23, 42, 0.6)'
                        : 'rgba(255, 255, 255, 0.6)',
                      border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                    }}
                  >
                    <h3 className={`font-sans font-bold text-xs uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.1em' }}>
                      Family & Relationships
                    </h3>
                    <p className={`font-serif text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-ink-800'}`}>
                      {renderTextOrFallback(family || relationships, 'No family information available.')}
                    </p>
                  </div>
                )}

                {/* Occupation */}
                {occupation && (
                  <div
                    className="p-5 rounded-xl"
                    style={{
                      background: isDark
                        ? 'rgba(15, 23, 42, 0.6)'
                        : 'rgba(255, 255, 255, 0.6)',
                      border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                    }}
                  >
                    <h3 className={`font-sans font-bold text-xs uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.1em' }}>
                      Occupation
                    </h3>
                    <p className={`font-serif text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-ink-800'}`}>
                      {renderTextOrFallback(occupation, 'No occupation information available.')}
                    </p>
                  </div>
                )}

                {/* Personality */}
                {personality && (
                  <div
                    className="p-5 rounded-xl col-span-2"
                    style={{
                      background: isDark
                        ? 'rgba(15, 23, 42, 0.6)'
                        : 'rgba(255, 255, 255, 0.6)',
                      border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                    }}
                  >
                    <h3 className={`font-sans font-bold text-xs uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.1em' }}>
                      Personality
                    </h3>
                    <p className={`font-serif text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-ink-800'}`}>
                      {renderTextOrFallback(personality, 'No personality information available.')}
                    </p>
                  </div>
                )}

                {/* Background/History */}
                {background && (
                  <div
                    className="p-5 rounded-xl col-span-2"
                    style={{
                      background: isDark
                        ? 'rgba(15, 23, 42, 0.6)'
                        : 'rgba(255, 255, 255, 0.6)',
                      border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                    }}
                  >
                    <h3 className={`font-sans font-bold text-xs uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.1em' }}>
                      Background
                    </h3>
                    <p className={`font-serif text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-ink-800'}`}>
                      {renderTextOrFallback(background, 'No background information available.')}
                    </p>
                  </div>
                )}
              </div>

              {/* If no background data available */}
              {(() => {
                const hasNoBackgroundData = !family && !occupation && !personality && !background && !relationships;
                return hasNoBackgroundData && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4 opacity-20">📋</div>
                    <p className={`text-base font-sans font-medium ${isDark ? 'text-slate-400' : 'text-ink-500'}`}>
                      No background information available
                    </p>
                    <p className={`text-sm font-sans mt-1 ${isDark ? 'text-slate-500' : 'text-ink-400'}`}>
                      Continue interactions to learn more about this patient
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* EXAMINATION TAB */}
          {activeTab === 'examination' && (
            <div className="space-y-6">
              {/* Symptoms List */}
              <div>
                <h2 className={`font-sans font-bold text-sm uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-ink-700'}`} style={{ letterSpacing: '0.1em' }}>
                  Documented Symptoms ({parsedSymptoms.length})
                </h2>
                <div className="space-y-3">
                  {parsedSymptoms.map((symptom, index) => (
                    <div
                      key={index}
                      className="rounded-xl p-4"
                      style={{
                        background: isDark
                          ? 'rgba(15, 23, 42, 0.6)'
                          : 'rgba(255, 255, 255, 0.6)',
                        border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
                        borderLeft: `4px solid ${getSeverityColor(symptom.severity)}`
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className={`font-sans font-bold text-base ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
                          {symptom.name}
                        </h3>
                        <span
                          className="px-2 py-0.5 text-xs font-sans font-bold uppercase tracking-wide rounded"
                          style={{
                            letterSpacing: '0.05em',
                            fontSize: '0.65rem',
                            background: getSeverityBg(symptom.severity),
                            color: getSeverityColor(symptom.severity)
                          }}
                        >
                          {symptom.severity}
                        </span>
                      </div>
                      <p className={`font-serif text-sm leading-relaxed mb-2 ${isDark ? 'text-slate-300' : 'text-ink-700'}`}>
                        {symptom.description}
                      </p>
                      {symptom.duration && (
                        <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-ink-500'}`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-sans">Duration: {symptom.duration}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Context */}
              <div
                className="p-5 rounded-xl"
                style={{
                  background: isDark
                    ? 'rgba(15, 23, 42, 0.6)'
                    : 'rgba(255, 255, 255, 0.6)',
                  border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                }}
              >
                <h3 className={`font-sans font-bold text-xs uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.1em' }}>
                  Prognosis
                </h3>
                <p className={`font-serif text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-ink-800'}`}>
                  {generatePrognosis(diagnosis)}
                </p>
              </div>

              <div
                className="p-5 rounded-xl"
                style={{
                  background: isDark
                    ? 'rgba(15, 23, 42, 0.6)'
                    : 'rgba(255, 255, 255, 0.6)',
                  border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                }}
              >
                <h3 className={`font-sans font-bold text-xs uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-ink-500'}`} style={{ letterSpacing: '0.1em' }}>
                  Recommended Approach
                </h3>
                <p className={`font-serif text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-ink-800'}`}>
                  {generateRecommendation(diagnosis)}
                </p>
              </div>

              {/* Historical Note */}
              <div
                className="p-5 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${statusColor.bg}, ${statusColor.light}15)`,
                  border: `1px solid ${statusColor.primary}40`
                }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: statusColor.primary }}>
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider" style={{ letterSpacing: '0.1em', color: statusColor.primary }}>
                    Historical Note
                  </h3>
                </div>
                <p className={`font-serif text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-ink-800'}`}>
                  {generateEducationalContext(diagnosis)}
                </p>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div>
              <h2 className={`font-sans font-bold text-sm uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-ink-700'}`} style={{ letterSpacing: '0.1em' }}>
                Treatment History
              </h2>
              {treatmentHistory.length > 0 ? (
                <TreatmentTimeline treatments={treatmentHistory} />
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4 opacity-20">📜</div>
                  <p className={`text-base font-sans font-medium ${isDark ? 'text-slate-400' : 'text-ink-500'}`}>
                    No treatment history available
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CONVERSATIONS TAB */}
          {activeTab === 'conversations' && (
            <div className="space-y-4">
              <h2 className={`font-sans font-bold text-sm uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-ink-700'}`} style={{ letterSpacing: '0.1em' }}>
                Conversation History
              </h2>

              {conversationHistory.length > 0 ? (
                <div className="space-y-3">
                  {conversationHistory.map((interaction, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl"
                      style={{
                        background: isDark
                          ? 'rgba(15, 23, 42, 0.6)'
                          : 'rgba(255, 255, 255, 0.6)',
                        border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: statusColor.primary }}>
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          <span className={`font-sans text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-ink-500'}`}>
                            {interaction.date || 'Unknown date'}
                          </span>
                        </div>
                        {interaction.delta && (
                          <span
                            className="px-2 py-0.5 text-xs font-sans font-bold rounded"
                            style={{
                              background: interaction.delta > 0 ? '#d1fae5' : '#fee2e2',
                              color: interaction.delta > 0 ? '#059669' : '#dc2626'
                            }}
                          >
                            {interaction.delta > 0 ? '+' : ''}{interaction.delta} relationship
                          </span>
                        )}
                      </div>
                      <p className={`font-serif text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-ink-800'}`}>
                        {interaction.summary || 'No summary available.'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4 opacity-20">💬</div>
                  <p className={`text-base font-sans font-medium ${isDark ? 'text-slate-400' : 'text-ink-500'}`}>
                    No conversation history
                  </p>
                  <p className={`text-sm font-sans mt-1 ${isDark ? 'text-slate-500' : 'text-ink-400'}`}>
                    This is your first interaction with {name}
                  </p>
                </div>
              )}

              {/* Archived Summary */}
              {patient?.memory?.archivedSummary && (
                <div
                  className="p-5 rounded-xl mt-6"
                  style={{
                    background: `linear-gradient(135deg, ${statusColor.bg}, ${statusColor.light}15)`,
                    border: `1px solid ${statusColor.primary}40`
                  }}
                >
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider mb-2" style={{ letterSpacing: '0.1em', color: statusColor.primary }}>
                    Earlier Interactions (Archived)
                  </h3>
                  <p className={`font-serif text-xs leading-relaxed italic ${isDark ? 'text-slate-400' : 'text-ink-700'}`}>
                    {typeof patient.memory.archivedSummary === 'string'
                      ? patient.memory.archivedSummary
                      : patient.memory.archivedSummary
                      ? JSON.stringify(patient.memory.archivedSummary)
                      : 'No archived interactions'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions

/**
 * Safely renders a value as text, handling objects, strings, and undefined
 * @param {any} value - The value to render
 * @param {string} fallback - Fallback text if value is empty/invalid
 * @returns {string} - Safe string to render
 */
function renderTextOrFallback(value, fallback = 'No information available.') {
  // If value is falsy (null, undefined, empty string, 0), return fallback
  if (!value) return fallback;

  // If value is a string, return it
  if (typeof value === 'string') return value;

  // If value is an object (including empty object {}), try to extract meaningful text
  if (typeof value === 'object') {
    // Check if it's an empty object
    if (Object.keys(value).length === 0) return fallback;

    // Try to extract common text fields from objects
    if (value.text) return value.text;
    if (value.description) return value.description;
    if (value.summary) return value.summary;
    if (value.value) return value.value;

    // Last resort: stringify the object
    return JSON.stringify(value);
  }

  // For other types (numbers, booleans), convert to string
  return String(value);
}

function parseSymptoms(diagnosis, symptomsArray) {
  // PRIORITY 1: Use actual symptoms from patient entity if available
  if (symptomsArray && Array.isArray(symptomsArray) && symptomsArray.length > 0) {
    console.log('[parseSymptoms] Using real symptoms data:', symptomsArray);

    // Map symptoms to expected format
    return symptomsArray.map(symptom => {
      // Handle different symptom formats
      if (typeof symptom === 'string') {
        return {
          name: symptom,
          severity: 'unknown',
          description: symptom,
          duration: 'Unknown'
        };
      }

      // Symptom is already an object
      return {
        name: symptom.name || symptom.symptom || 'Unknown symptom',
        severity: symptom.severity || 'moderate',
        description: symptom.description || symptom.details || symptom.name || '',
        duration: symptom.duration || 'Unknown',
        location: symptom.location || symptom.bodyPart || undefined,
        onset: symptom.onset || undefined
      };
    });
  }

  // PRIORITY 2: Fall back to parsing diagnosis text (legacy behavior)
  console.log('[parseSymptoms] No symptoms array, parsing from diagnosis:', diagnosis);
  const symptoms = [];
  const diagnosisLower = diagnosis?.toLowerCase() || '';

  if (diagnosisLower.includes('headache')) {
    symptoms.push({
      name: 'Headaches',
      severity: diagnosisLower.includes('terrible') || diagnosisLower.includes('severe') ? 'severe' : 'moderate',
      description: 'Recurring head pain, particularly in temple region',
      duration: '2 months'
    });
  }

  if (diagnosisLower.includes('joint pain') || diagnosisLower.includes('arthritis')) {
    symptoms.push({
      name: 'Joint Pain',
      severity: 'moderate',
      description: 'Pain and stiffness in knees and elbows',
      duration: '6 weeks'
    });
  }

  if (diagnosisLower.includes('lesion') || diagnosisLower.includes('skin') || diagnosisLower.includes('rash')) {
    symptoms.push({
      name: 'Skin Lesions',
      severity: 'mild',
      description: 'Pustular lesions appearing on torso, slowly spreading',
      duration: '3 weeks'
    });
  }

  if (diagnosisLower.includes('fever')) {
    symptoms.push({
      name: 'Intermittent Fever',
      severity: diagnosisLower.includes('high') ? 'severe' : 'moderate',
      description: 'Evening fevers, subsiding by morning',
      duration: '1 month'
    });
  }

  if (diagnosisLower.includes('gout')) {
    symptoms.push({
      name: 'Gouty Joint Pain',
      severity: 'severe',
      description: 'Acute pain and swelling in joints, particularly affecting the feet',
      duration: 'Episodic, recent flare-up'
    });
  }

  if (diagnosisLower.includes('kidney') || diagnosisLower.includes('stone')) {
    symptoms.push({
      name: 'Kidney Pain',
      severity: 'severe',
      description: 'Sharp pain in lower back and abdomen, difficulty urinating',
      duration: 'Recent onset'
    });
  }

  if (symptoms.length === 0) {
    symptoms.push({
      name: 'General Malaise',
      severity: 'mild',
      description: 'Patient reports feeling unwell',
      duration: 'Recent onset'
    });
  }

  return symptoms;
}

function extractChiefComplaint(diagnosis) {
  if (!diagnosis) return 'Patient presents with general complaints.';
  const firstSentence = diagnosis.split('.')[0];
  return firstSentence.trim();
}

function generatePrognosis(diagnosis) {
  const diagnosisLower = diagnosis?.toLowerCase() || '';

  if (diagnosisLower.includes('pox') || diagnosisLower.includes('syphilis')) {
    return 'Guarded. Without mercurial treatment, progression to tertiary stage likely within years. Treatment may arrest progression but carries significant risk of mercury poisoning.';
  }

  if (diagnosisLower.includes('gout')) {
    return 'Fair with proper management. Dietary modifications and avoidance of rich foods may reduce frequency of attacks. Colchicum may provide relief during acute episodes.';
  }

  if (diagnosisLower.includes('fever')) {
    return 'Fair. Fever patterns suggest humoral imbalance. Bloodletting and cooling remedies may provide relief. Monitor for signs of putrefaction.';
  }

  if (diagnosisLower.includes('kidney') || diagnosisLower.includes('stone')) {
    return 'Guarded. Passage of stone may occur naturally, but surgical intervention (lithotomy) carries high mortality risk. Conservative management preferred when possible.';
  }

  return 'Uncertain. Constellation of symptoms requires careful observation. Continue symptomatic treatment and monitor disease progression.';
}

function generateRecommendation(diagnosis) {
  const diagnosisLower = diagnosis?.toLowerCase() || '';

  if (diagnosisLower.includes('pox') || diagnosisLower.includes('syphilis')) {
    return 'Mercury ointment topically to lesions. Avoid bloodletting initially. Counsel patient on discretion due to social stigma. Warn of salivation and tremors from mercury.';
  }

  if (diagnosisLower.includes('gout')) {
    return 'Advise dietary restrictions: avoid red meat, wine, and rich foods. Colchicum during acute attacks. Cooling compresses to affected joints. Consider gentle bloodletting if patient is plethoric.';
  }

  return 'Address predominant symptoms through humoral balancing. Consider patient\'s constitution and social circumstances. Proceed with caution given incomplete understanding of etiology.';
}

function generateEducationalContext(diagnosis) {
  const diagnosisLower = diagnosis?.toLowerCase() || '';

  if (diagnosisLower.includes('pox') || diagnosisLower.includes('syphilis')) {
    return 'In the 1680s, syphilis (called "the pox" or "French disease") was treated primarily with mercury compounds despite severe toxicity. The disease was poorly understood and carried enormous social stigma. Mercury remained the standard treatment until the 20th century discovery of antibiotics.';
  }

  if (diagnosisLower.includes('gout')) {
    return 'Gout was well-recognized in the 17th century as a "disease of excess," affecting primarily wealthy men who could afford rich diets. The link between uric acid and gout would not be discovered until the 18th century. Colchicum (autumn crocus) was used empirically, though its mechanism remained unknown.';
  }

  if (diagnosisLower.includes('fever')) {
    return 'Fevers in 17th century medicine were understood through humoral theory as excesses of hot, moist humors (blood) or hot, dry humors (yellow bile). Bloodletting was the primary intervention, based on the belief that reducing blood volume would cool the body and restore balance.';
  }

  if (diagnosisLower.includes('kidney') || diagnosisLower.includes('stone')) {
    return 'Kidney stones have afflicted humanity since ancient times. In the 17th century, lithotomy (surgical stone removal) was performed by traveling specialists called "lithotomists," with mortality rates exceeding 50%. Conservative treatments using herbal diuretics were generally preferred.';
  }

  return 'Diagnosis in the 17th century relied entirely on observable symptoms and humoral theory. Without microscopy, germ theory, or laboratory tests, physicians worked within significant limitations, often causing harm through aggressive interventions like bloodletting and purging.';
}

function getPatientStatusColor(type) {
  // Use botanical green for patients
  return {
    primary: '#16a34a',
    light: '#4ade80',
    dark: '#15803d',
    bg: '#dcfce7',
    glow: 'rgba(34, 197, 94, 0.3)'
  };
}

function getSeverityColor(severity) {
  const severityLower = severity?.toLowerCase() || 'mild';
  if (severityLower === 'critical') return '#dc2626';
  if (severityLower === 'severe') return '#ea580c';
  if (severityLower === 'moderate') return '#f59e0b';
  return '#16a34a'; // mild
}

function getSeverityBg(severity) {
  const severityLower = severity?.toLowerCase() || 'mild';
  if (severityLower === 'critical') return '#fee2e2';
  if (severityLower === 'severe') return '#ffedd5';
  if (severityLower === 'moderate') return '#fef3c7';
  return '#dcfce7'; // mild
}
