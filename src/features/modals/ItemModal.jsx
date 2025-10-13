/**
 * Item Modal
 *
 * Displays detailed information about items.
 * Shows medicinal properties, combat stats, provenance, and educational content.
 *
 * Swiss-inspired design matching NPCModal.
 */

import React, { useState, useMemo } from 'react';
import { adaptEntityForItemModal } from '../../core/entities/entityAdapter';

export default function ItemModal({ isOpen, onClose, item }) {
  const [activeTab, setActiveTab] = useState('medicinal');

  // Check dark mode
  const isDark = document.documentElement.classList.contains('dark');

  // Adapt entity to ensure correct format
  const adaptedItem = useMemo(() => {
    return adaptEntityForItemModal(item);
  }, [item]);

  if (!isOpen || !adaptedItem) return null;

  const hasMedicinalProperties = adaptedItem.medicinal && (
    adaptedItem.medicinal.effects?.length > 0 ||
    adaptedItem.medicinal.humoralQualities?.temperature
  );

  const hasCombatProperties = adaptedItem.combat && (
    adaptedItem.combat.wieldable ||
    adaptedItem.combat.improvisedWeapon
  );

  const hasProvenance = adaptedItem.provenance && (
    adaptedItem.provenance.origin?.region ||
    adaptedItem.provenance.knowledgeSystems?.length > 0
  );

  const hasEducation = adaptedItem.education && (
    adaptedItem.education.historicalNote ||
    adaptedItem.education.citations?.length > 0
  );

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="modal-content bg-white dark:bg-slate-900 rounded-2xl shadow-elevation-4 dark:shadow-dark-elevation-4 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up border border-transparent dark:border-amber-500/20">

        {/* Header */}
        <div className="bg-gradient-to-r from-potion-600 to-potion-700 dark:from-amber-600 dark:to-amber-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-6">
            {/* Image */}
            <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-white shadow-elevation-3 flex-shrink-0 bg-gradient-to-br from-potion-100 to-potion-200">
              {adaptedItem.visual?.image ? (
                <img src={adaptedItem.visual.image} alt={adaptedItem.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  {adaptedItem.visual?.emoji || '⚗️'}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold mb-2">{adaptedItem.name}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-sans capitalize">
                  {adaptedItem.itemType?.replace('_', ' ') || 'Item'}
                </span>
                {adaptedItem.value?.rarity && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-sans capitalize">
                    {adaptedItem.value.rarity}
                  </span>
                )}
                {adaptedItem.value?.base && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-sans">
                    {adaptedItem.value.base} {adaptedItem.value.currency || 'reales'}
                  </span>
                )}
              </div>
              <p className="text-white/90 font-serif text-sm leading-relaxed">
                {adaptedItem.lore?.genericDescription || adaptedItem.appearance?.visualDescription || 'A valuable substance.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ink-200 dark:border-slate-600 bg-parchment-50 dark:bg-slate-800">
          {hasMedicinalProperties && (
            <button
              onClick={() => setActiveTab('medicinal')}
              className={`flex-1 px-4 py-3 font-sans font-medium text-sm uppercase tracking-wider transition-all relative ${
                activeTab === 'medicinal'
                  ? 'text-potion-900 dark:text-amber-300 bg-white dark:bg-slate-700'
                  : 'text-ink-600 dark:text-stone-400 hover:text-ink-900 dark:hover:text-amber-200 hover:bg-parchment-100 dark:hover:bg-slate-700'
              }`}
            >
              Medicinal
              {activeTab === 'medicinal' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-potion-600 dark:bg-amber-500"></div>
              )}
            </button>
          )}
          {hasCombatProperties && (
            <button
              onClick={() => setActiveTab('combat')}
              className={`flex-1 px-4 py-3 font-sans font-medium text-sm uppercase tracking-wider transition-all relative ${
                activeTab === 'combat'
                  ? 'text-danger-900 dark:text-red-300 bg-white dark:bg-slate-700'
                  : 'text-ink-600 dark:text-stone-400 hover:text-ink-900 dark:hover:text-amber-200 hover:bg-parchment-100 dark:hover:bg-slate-700'
              }`}
            >
              Combat
              {activeTab === 'combat' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-danger-600 dark:bg-red-500"></div>
              )}
            </button>
          )}
          {hasProvenance && (
            <button
              onClick={() => setActiveTab('provenance')}
              className={`flex-1 px-4 py-3 font-sans font-medium text-sm uppercase tracking-wider transition-all relative ${
                activeTab === 'provenance'
                  ? 'text-botanical-900 dark:text-emerald-300 bg-white dark:bg-slate-700'
                  : 'text-ink-600 dark:text-stone-400 hover:text-ink-900 dark:hover:text-amber-200 hover:bg-parchment-100 dark:hover:bg-slate-700'
              }`}
            >
              Provenance
              {activeTab === 'provenance' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-botanical-600 dark:bg-emerald-500"></div>
              )}
            </button>
          )}
          {hasEducation && (
            <button
              onClick={() => setActiveTab('education')}
              className={`flex-1 px-4 py-3 font-sans font-medium text-sm uppercase tracking-wider transition-all relative ${
                activeTab === 'education'
                  ? 'text-ink-900 dark:text-amber-300 bg-white dark:bg-slate-700'
                  : 'text-ink-600 dark:text-stone-400 hover:text-ink-900 dark:hover:text-amber-200 hover:bg-parchment-100 dark:hover:bg-slate-700'
              }`}
            >
              History
              {activeTab === 'education' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink-600 dark:bg-amber-500"></div>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

          {/* Medicinal Tab */}
          {activeTab === 'medicinal' && hasMedicinalProperties && (
            <div className="space-y-6 animate-fade-in">

              {/* Humoral Qualities */}
              {adaptedItem.medicinal.humoralQualities && (
                <section className="bg-potion-50 dark:bg-slate-800 rounded-xl p-4 border border-potion-200 dark:border-amber-700/30">
                  <h3 className="font-display text-lg font-bold text-ink-900 dark:text-amber-100 mb-3">Humoral Qualities</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {adaptedItem.medicinal.humoralQualities.temperature && (
                      <div>
                        <p className="text-sm font-sans text-potion-700 uppercase tracking-wide mb-1">Temperature</p>
                        <p className="text-lg font-serif text-ink-900 dark:text-stone-200 capitalize">
                          {adaptedItem.medicinal.humoralQualities.temperature}
                          {adaptedItem.medicinal.humoralQualities.temperatureDegree && (
                            <span className="text-sm text-ink-600"> ({adaptedItem.medicinal.humoralQualities.temperatureDegree}° degree)</span>
                          )}
                        </p>
                      </div>
                    )}
                    {adaptedItem.medicinal.humoralQualities.moisture && (
                      <div>
                        <p className="text-sm font-sans text-potion-700 uppercase tracking-wide mb-1">Moisture</p>
                        <p className="text-lg font-serif text-ink-900 dark:text-stone-200 capitalize">
                          {adaptedItem.medicinal.humoralQualities.moisture}
                          {adaptedItem.medicinal.humoralQualities.moistureDegree && (
                            <span className="text-sm text-ink-600"> ({adaptedItem.medicinal.humoralQualities.moistureDegree}° degree)</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Effects */}
              {adaptedItem.medicinal.effects && adaptedItem.medicinal.effects.length > 0 && (
                <section className="bg-parchment-50 rounded-xl p-4 border border-ink-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 dark:text-amber-100 mb-3">Medicinal Effects</h3>
                  <ul className="space-y-2">
                    {adaptedItem.medicinal.effects.map((effect, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm font-serif text-ink-700 dark:text-stone-300">
                        <span className="text-botanical-600 mt-1">✓</span>
                        <span className="capitalize">{effect}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Dosage & Usage */}
              {adaptedItem.medicinal.dosage && (
                <section className="bg-warning-50 rounded-xl p-4 border border-warning-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 dark:text-amber-100 mb-3">Dosage & Administration</h3>
                  <div className="space-y-2 text-sm font-serif text-ink-700 dark:text-stone-300">
                    {(adaptedItem.medicinal.dosage.min || adaptedItem.medicinal.dosage.max) && (
                      <p>
                        <strong className="text-ink-900">Dose:</strong>{' '}
                        {adaptedItem.medicinal.dosage.min}-{adaptedItem.medicinal.dosage.max} {adaptedItem.medicinal.dosage.unit}
                      </p>
                    )}
                    {adaptedItem.medicinal.dosage.frequency && (
                      <p>
                        <strong className="text-ink-900">Frequency:</strong> {adaptedItem.medicinal.dosage.frequency}
                      </p>
                    )}
                    {adaptedItem.medicinal.dosage.warnings && (
                      <p className="text-warning-800 italic mt-2">
                        ⚠️ {adaptedItem.medicinal.dosage.warnings}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* Preparations */}
              {adaptedItem.medicinal.preparations && adaptedItem.medicinal.preparations.length > 0 && (
                <section className="bg-parchment-50 rounded-xl p-4 border border-ink-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 dark:text-amber-100 mb-3">Preparations</h3>
                  <div className="flex flex-wrap gap-2">
                    {adaptedItem.medicinal.preparations.map((prep, idx) => (
                      <span key={idx} className="px-3 py-1 bg-botanical-100 text-botanical-800 rounded-full text-sm font-sans capitalize">
                        {typeof prep === 'string' ? prep : prep.method}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Contraindications */}
              {adaptedItem.medicinal.contraindications && adaptedItem.medicinal.contraindications.length > 0 && (
                <section className="bg-danger-50 rounded-xl p-4 border border-danger-200">
                  <h3 className="font-display text-lg font-bold text-danger-900 mb-3">⚠️ Contraindications</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm font-serif text-danger-800">
                    {adaptedItem.medicinal.contraindications.map((contra, idx) => (
                      <li key={idx}>{contra}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {/* Combat Tab */}
          {activeTab === 'combat' && hasCombatProperties && (
            <div className="space-y-6 animate-fade-in">
              <section className="bg-danger-50 rounded-xl p-4 border border-danger-200">
                <h3 className="font-display text-lg font-bold text-ink-900 mb-4">Combat Properties</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-sans text-danger-700 uppercase tracking-wide mb-1">Wieldable</p>
                    <p className="text-lg font-serif text-ink-900">
                      {adaptedItem.combat.wieldable ? '✓ Yes' : '✗ No'}
                      {adaptedItem.combat.improvisedWeapon && <span className="text-sm text-danger-600"> (improvised)</span>}
                    </p>
                  </div>

                  {adaptedItem.combat.damage > 0 && (
                    <div>
                      <p className="text-sm font-sans text-danger-700 uppercase tracking-wide mb-1">Damage</p>
                      <p className="text-lg font-serif text-ink-900 dark:text-stone-200">{adaptedItem.combat.damage}</p>
                    </div>
                  )}

                  {adaptedItem.combat.range !== undefined && (
                    <div>
                      <p className="text-sm font-sans text-danger-700 uppercase tracking-wide mb-1">Range</p>
                      <p className="text-lg font-serif text-ink-900 dark:text-stone-200">
                        {adaptedItem.combat.range === 0 ? 'N/A' : adaptedItem.combat.range === 1 ? 'Melee' : `${adaptedItem.combat.range} ft`}
                      </p>
                    </div>
                  )}

                  {adaptedItem.combat.attackType && (
                    <div>
                      <p className="text-sm font-sans text-danger-700 uppercase tracking-wide mb-1">Attack Type</p>
                      <p className="text-lg font-serif text-ink-900 capitalize">{adaptedItem.combat.attackType}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Provenance Tab */}
          {activeTab === 'provenance' && hasProvenance && (
            <div className="space-y-6 animate-fade-in">

              {/* Origin */}
              {adaptedItem.provenance.origin && adaptedItem.provenance.origin.region && (
                <section className="bg-botanical-50 rounded-xl p-4 border border-botanical-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 dark:text-amber-100 mb-3">Origin</h3>
                  <div className="space-y-2 text-sm font-serif text-ink-700 dark:text-stone-300">
                    <p><strong className="text-ink-900">Region:</strong> {adaptedItem.provenance.origin.region}</p>
                    {adaptedItem.provenance.origin.specificLocation && (
                      <p><strong className="text-ink-900">Location:</strong> {adaptedItem.provenance.origin.specificLocation}</p>
                    )}
                    {adaptedItem.provenance.origin.culturalGroup && (
                      <p><strong className="text-ink-900">Cultural Group:</strong> {adaptedItem.provenance.origin.culturalGroup}</p>
                    )}
                  </div>
                </section>
              )}

              {/* Trade Route */}
              {adaptedItem.provenance.tradeRoute && (
                <section className="bg-parchment-50 rounded-xl p-4 border border-ink-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 dark:text-amber-100 mb-3">Trade Route</h3>
                  <p className="text-sm font-serif text-ink-700 leading-relaxed">
                    {adaptedItem.provenance.tradeRoute['1680-mexico-city'] || adaptedItem.provenance.tradeRoute.generic}
                  </p>
                </section>
              )}

              {/* Knowledge Systems */}
              {adaptedItem.provenance.knowledgeSystems && adaptedItem.provenance.knowledgeSystems.length > 0 && (
                <section className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-ink-900">Knowledge Traditions</h3>
                  {adaptedItem.provenance.knowledgeSystems.map((system, idx) => (
                    <div key={idx} className="bg-potion-50 rounded-xl p-4 border border-potion-200">
                      <h4 className="font-sans font-bold text-potion-900 mb-2">{system.tradition}</h4>
                      {system.termFor && (
                        <p className="text-sm text-ink-700 mb-2">
                          <strong>Term:</strong> {system.termFor}
                        </p>
                      )}
                      {system.theory && (
                        <p className="text-sm text-ink-700 mb-2 italic">"{system.theory}"</p>
                      )}
                      {system.uses && system.uses.length > 0 && (
                        <div>
                          <p className="text-xs font-sans text-potion-700 uppercase tracking-wide mb-1">Uses:</p>
                          <ul className="list-disc list-inside text-sm text-ink-700">
                            {system.uses.map((use, i) => (
                              <li key={i}>{use}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && hasEducation && (
            <div className="space-y-6 animate-fade-in">

              {adaptedItem.education.historicalNote && (
                <section className="bg-parchment-50 rounded-xl p-4 border border-ink-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                    <span>📚</span> Historical Note
                  </h3>
                  <p className="text-sm font-serif text-ink-700 leading-relaxed">
                    {adaptedItem.education.historicalNote}
                  </p>
                </section>
              )}

              {adaptedItem.education.funFact && (
                <section className="bg-botanical-50 rounded-xl p-4 border border-botanical-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                    <span>💡</span> Did You Know?
                  </h3>
                  <p className="text-sm font-serif text-ink-700 leading-relaxed">
                    {adaptedItem.education.funFact}
                  </p>
                </section>
              )}

              {adaptedItem.education.citations && adaptedItem.education.citations.length > 0 && (
                <section className="bg-ink-50 rounded-xl p-4 border border-ink-200">
                  <h3 className="font-display text-lg font-bold text-ink-900 dark:text-amber-100 mb-3">Citations</h3>
                  <div className="space-y-2">
                    {adaptedItem.education.citations.map((citation, idx) => (
                      <p key={idx} className="text-xs font-serif text-ink-600 leading-relaxed">
                        {citation}
                      </p>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-parchment-100 border-t border-ink-200 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-ink-600 hover:bg-ink-700 text-white rounded-lg font-sans font-medium transition-colors shadow-elevation-1"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
