/**
 * PatientRosterModal - Multi-tab patient management interface
 *
 * Displays all patients in the game with:
 * - All Patients tab: Complete roster
 * - Active tab: Currently being treated
 * - Recent tab: Recently interacted with
 * - Search & filtering capabilities
 *
 * Design matches ItemModalEnhanced and NPCPatientModal aesthetics
 */

import React, { useState, useEffect, useMemo } from 'react';
import { entityManager } from '../../../core/entities/EntityManager';
import { resolvePortrait } from '../../../core/services/portraitResolver';

export default function PatientRosterModal({
  isOpen,
  onClose,
  onSelectPatient
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

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
      setSearchQuery(''); // Reset search on close
    }
  }, [isOpen]);

  // Get all patients from EntityManager
  const allPatients = useMemo(() => {
    return entityManager.getByType('patient') || [];
  }, [isOpen]); // Re-fetch when modal opens

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return allPatients;

    const query = searchQuery.toLowerCase();
    return allPatients.filter(patient =>
      patient.name?.toLowerCase().includes(query) ||
      patient.diagnosis?.toLowerCase().includes(query) ||
      patient.occupation?.toLowerCase().includes(query)
    );
  }, [allPatients, searchQuery]);

  // Categorize patients
  const categorizedPatients = useMemo(() => {
    const active = [];
    const recent = [];
    const historical = [];

    filteredPatients.forEach(patient => {
      // Patients with recent interactions (last 10 turns)
      const hasRecentInteraction = patient.memory?.interactions?.length > 0;

      // Active patients (currently ill or being treated)
      const isActive = patient.diagnosis && !patient.diagnosis.toLowerCase().includes('cured');

      if (isActive && hasRecentInteraction) {
        active.push(patient);
      } else if (hasRecentInteraction) {
        recent.push(patient);
      } else {
        historical.push(patient);
      }
    });

    return { active, recent, historical };
  }, [filteredPatients]);

  // Get patients for current tab
  const displayedPatients = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return categorizedPatients.active;
      case 'recent':
        return categorizedPatients.recent;
      case 'historical':
        return categorizedPatients.historical;
      case 'all':
      default:
        return filteredPatients;
    }
  }, [activeTab, filteredPatients, categorizedPatients]);

  if (!isOpen) return null;

  const isDark = document.documentElement.classList.contains('dark');

  const tabs = [
    { id: 'all', label: 'All Patients', icon: '📋', count: filteredPatients.length },
    { id: 'active', label: 'Active', icon: '🩺', count: categorizedPatients.active.length },
    { id: 'recent', label: 'Recent', icon: '🕐', count: categorizedPatients.recent.length },
    { id: 'historical', label: 'Historical', icon: '📜', count: categorizedPatients.historical.length }
  ];

  return (
    <div
      className={`fixed inset-0 bg-stone-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Modal Container - FIXED DIMENSIONS */}
      <div
        className={`relative w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-elevation-4 transition-all duration-300 ${
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
        {/* Decorative Background Icon - Medical Theme */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: '50%',
            height: '60%',
            zIndex: 0,
            overflow: 'hidden',
            opacity: isDark ? 0.08 : 0.05,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)',
          }}
        >
          <div className="text-[20rem]" style={{ transform: 'translateX(20%) translateY(-20%)' }}>
            🩺
          </div>
        </div>

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
          className="flex-shrink-0 border-b relative z-10 px-8 py-6"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
              : 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
            borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
          }}
        >
          <h1 className={`font-serif font-bold text-4xl mb-3 ${isDark ? 'text-parchment-100' : 'text-ink-900'}`} style={{ letterSpacing: '-0.02em' }}>
            Patient Roster
          </h1>
          <p className={`font-sans text-sm ${isDark ? 'text-slate-400' : 'text-ink-600'}`}>
            View and manage all patients in your care
          </p>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, diagnosis, or occupation..."
                className={`w-full px-4 py-2.5 pl-10 rounded-lg font-sans text-sm transition-all duration-200 ${
                  isDark
                    ? 'bg-slate-800 border-slate-600 text-parchment-100 placeholder-slate-500 focus:bg-slate-750 focus:border-slate-500'
                    : 'bg-white border-ink-200 text-ink-900 placeholder-ink-400 focus:bg-parchment-50 focus:border-ink-400'
                }`}
                style={{
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(209, 213, 219, 0.5)'
                }}
              />
              <svg
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-ink-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
                    ? '#16a34a'
                    : isDark ? '#94a3b8' : '#6b5a47',
                  background: isActive
                    ? isDark
                      ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.8))'
                      : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))'
                    : 'transparent',
                  borderLeft: idx > 0 ? `1px solid ${isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(209, 213, 219, 0.2)'}` : 'none'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base" style={{ opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-bold"
                    style={{
                      background: isActive ? 'rgba(22, 163, 74, 0.15)' : isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 90, 71, 0.1)',
                      color: isActive ? '#16a34a' : isDark ? '#94a3b8' : '#6b5a47'
                    }}
                  >
                    {tab.count}
                  </span>
                </div>
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: 'linear-gradient(to right, rgba(22, 163, 74, 0.3), #16a34a, rgba(22, 163, 74, 0.3))'
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

          {displayedPatients.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-8xl mb-6 opacity-20">🩺</div>
              <h3 className={`text-2xl font-serif font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-ink-500'}`}>
                No Patients Found
              </h3>
              <p className={`text-base font-sans ${isDark ? 'text-slate-500' : 'text-ink-400'}`}>
                {searchQuery ? 'Try a different search query' : 'No patients match this filter'}
              </p>
            </div>
          ) : (
            /* Patient Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={() => {
                    if (onSelectPatient) {
                      onSelectPatient(patient);
                      onClose();
                    }
                  }}
                  isDark={isDark}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(245, 238, 223, 0.5)'};
          border-radius: 5px;
          margin: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(139, 92, 46, 0.3)'}, ${isDark ? 'rgba(71, 85, 105, 0.7)' : 'rgba(139, 92, 46, 0.4)'});
          border-radius: 5px;
          border: 2px solid ${isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(245, 238, 223, 0.5)'};
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, ${isDark ? 'rgba(71, 85, 105, 0.7)' : 'rgba(139, 92, 46, 0.5)'}, ${isDark ? 'rgba(71, 85, 105, 0.9)' : 'rgba(139, 92, 46, 0.6)'});
        }
      `}</style>
    </div>
  );
}

// Patient Card Component
function PatientCard({ patient, onClick, isDark }) {
  const name = patient.name || 'Unknown Patient';
  const age = patient.age || '?';
  const diagnosis = patient.diagnosis || 'No diagnosis recorded';
  const occupation = patient.occupation || 'Unknown occupation';

  // Use portrait resolver to get correct portrait path
  const portrait = React.useMemo(() => {
    return resolvePortrait(patient);
  }, [patient]);

  // Extract chief complaint (first sentence of diagnosis)
  const chiefComplaint = diagnosis.split('.')[0];

  // Determine patient status
  const isActive = diagnosis && !diagnosis.toLowerCase().includes('cured');
  const hasRecentInteraction = patient.memory?.interactions?.length > 0;

  return (
    <button
      onClick={onClick}
      className="group text-left rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.7) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 250, 247, 0.9) 100%)',
        border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
        boxShadow: isDark
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Portrait Section */}
      <div
        className="h-32 relative overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.6), rgba(30, 41, 59, 0.6))'
            : 'linear-gradient(135deg, rgba(249, 245, 235, 0.6), rgba(245, 238, 223, 0.6))'
        }}
      >
        {portrait ? (
          <img
            src={portrait}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">
            {isActive ? '🤒' : '👤'}
          </div>
        )}

        {/* Status Badge */}
        {isActive && (
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.4)'
            }}
          >
            Active
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4">
        {/* Name & Age */}
        <div className="mb-2">
          <h3 className={`font-serif font-bold text-lg leading-tight ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
            {name}
          </h3>
          <p className={`text-xs font-sans font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-ink-500'}`}>
            Age {age} • {occupation}
          </p>
        </div>

        {/* Chief Complaint */}
        <div
          className="p-2 rounded-lg mb-3"
          style={{
            background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)'
          }}
        >
          <p className={`text-xs font-serif leading-snug ${isDark ? 'text-slate-300' : 'text-ink-700'}`}>
            "{chiefComplaint}"
          </p>
        </div>

        {/* Interaction Count */}
        {hasRecentInteraction && (
          <div className="flex items-center gap-1 text-xs">
            <svg className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-ink-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span className={`font-sans font-semibold ${isDark ? 'text-slate-400' : 'text-ink-500'}`}>
              {patient.memory.interactions.length} interaction{patient.memory.interactions.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Click Prompt */}
        <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-ink-200'} flex items-center justify-between text-xs font-sans font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-ink-500'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
          <span>View Details</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
