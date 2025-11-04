/**
 * InvestmentsTab - Investment opportunities interface
 *
 * Features:
 * - Display active investments with progress bars
 * - Show available investment opportunities
 * - Investment detail modal
 * - Process new investments
 */

import React, { useState, useEffect } from 'react';
import { getAvailableInvestments, processNewInvestment, getInvestmentProgress } from '../services/investmentService';

export default function InvestmentsTab({
  // State
  activeInvestments = [],
  setActiveInvestments,
  isDark,
  gameState,
  playerSkills,
  reputation,
  currentWealth,
  // Handlers
  handleWealthChange,
  addJournalEntry,
  awardSkillXP
}) {
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [availableOpportunities, setAvailableOpportunities] = useState(null);

  // Fetch available investments
  useEffect(() => {
    const opportunities = getAvailableInvestments(
      playerSkills,
      reputation,
      activeInvestments
    );
    setAvailableOpportunities(opportunities);
  }, [playerSkills, reputation, activeInvestments]);

  const handleSelectInvestment = (opportunity) => {
    setSelectedInvestment(opportunity);
    setShowDetailModal(true);
  };

  const handleInvest = () => {
    if (!selectedInvestment) return;

    const cost = selectedInvestment.suggestedCost;

    // Check if player has enough wealth
    if (currentWealth < cost) {
      alert('You do not have enough wealth for this investment.');
      return;
    }

    // Check if at investment limit
    if (activeInvestments.length >= (availableOpportunities?.maxSlots || 3)) {
      alert('You have reached your maximum active investment limit.');
      return;
    }

    // Process investment
    const newInvestment = processNewInvestment(
      selectedInvestment,
      cost,
      gameState.date
    );

    // Deduct wealth
    handleWealthChange(currentWealth - cost);

    // Add to active investments
    setActiveInvestments([...activeInvestments, newInvestment]);

    // Add journal entry
    addJournalEntry(
      `Invested ${cost} reales in ${selectedInvestment.name}. Expected return in ${newInvestment.duration} days.`
    );

    // Close modal
    setShowDetailModal(false);
    setSelectedInvestment(null);
  };

  if (!availableOpportunities) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-slate-400">Loading investment opportunities...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header with slots info */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold font-serif ${isDark ? 'text-amber-100' : 'text-ink-900'}`}>
          💼 Investment Opportunities
        </h2>
        <div className={`text-sm font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          Active: {activeInvestments.length} / {availableOpportunities.maxSlots}
        </div>
      </div>

      {/* Active Investments Section */}
      {activeInvestments.length > 0 && (
        <div>
          <h3 className={`text-lg font-bold font-serif mb-4 ${isDark ? 'text-amber-200' : 'text-ink-800'}`}>
            Active Investments
          </h3>
          <div className="space-y-3">
            {activeInvestments.map(investment => {
              const progress = getInvestmentProgress(investment, gameState.date);
              return (
                <ActiveInvestmentCard
                  key={investment.id}
                  investment={investment}
                  progress={progress}
                  isDark={isDark}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Available Opportunities Section */}
      <div>
        <h3 className={`text-lg font-bold font-serif mb-4 ${isDark ? 'text-amber-200' : 'text-ink-800'}`}>
          Available Opportunities
        </h3>

        {availableOpportunities.slotsAvailable === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💼</div>
            <p className={`text-base font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              You have reached your maximum active investment limit ({availableOpportunities.maxSlots}).
            </p>
            <p className={`text-sm font-sans mt-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
              Wait for current investments to mature before making new ones.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableOpportunities.opportunities.map((opportunity, idx) => (
              <OpportunityCard
                key={opportunity.id || idx}
                opportunity={opportunity}
                isDark={isDark}
                currentWealth={currentWealth}
                onSelect={handleSelectInvestment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedInvestment && (
        <InvestmentDetailModal
          investment={selectedInvestment}
          isDark={isDark}
          currentWealth={currentWealth}
          playerSkills={playerSkills}
          onInvest={handleInvest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInvestment(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * Active Investment Card Component
 */
function ActiveInvestmentCard({ investment, progress, isDark }) {
  const riskColor = investment.riskLevel.color;

  return (
    <div
      className="p-4 rounded-lg border transition-all duration-200"
      style={{
        background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        borderColor: isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(209, 213, 219, 0.3)'
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{investment.emoji}</span>
          <div>
            <h4 className={`font-bold font-serif ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
              {investment.type}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Invested: {investment.amount} reales
              </span>
              <span className="text-xs" style={{ color: riskColor }}>
                {investment.riskLevel.emoji} {investment.riskLevel.label}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {progress.daysRemaining} {progress.daysRemaining === 1 ? 'day' : 'days'} remaining
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 rounded-full overflow-hidden" style={{
        background: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
      }}>
        <div
          className="absolute top-0 left-0 h-full transition-all duration-300"
          style={{
            width: `${progress.progressPercentage}%`,
            background: riskColor
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className={`text-xs font-sans ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
          {progress.progressPercentage}% complete
        </span>
        {progress.isAlmostMature && (
          <span className={`text-xs font-sans font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            Maturing soon!
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Opportunity Card Component
 */
function OpportunityCard({ opportunity, isDark, currentWealth, onSelect }) {
  const canAfford = currentWealth >= opportunity.suggestedCost;
  const riskColor = opportunity.riskLevel.color;

  return (
    <div
      className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
      style={{
        background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        borderColor: isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(209, 213, 219, 0.3)'
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{opportunity.emoji}</span>
          <div className="flex-1">
            <h4 className={`font-bold font-serif ${isDark ? 'text-parchment-100' : 'text-ink-900'}`}>
              {opportunity.name}
            </h4>
            <p className={`text-sm font-sans mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {opportunity.description}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs font-sans ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                Cost: {opportunity.suggestedCost} reales
              </span>
              <span className={`text-xs font-sans ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                Duration: {opportunity.suggestedDuration} days
              </span>
              <span className="text-xs" style={{ color: riskColor }}>
                {opportunity.riskLevel.emoji} {opportunity.riskLevel.label}
              </span>
            </div>
            <div className={`text-xs font-sans mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Return: {opportunity.returnRange.minPercent}% to {opportunity.returnRange.maxPercent}%
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSelect(opportunity)}
            disabled={!canAfford}
            className={`px-4 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-200 ${
              canAfford
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-400 cursor-not-allowed text-gray-200'
            }`}
          >
            {canAfford ? 'Invest →' : 'Too Expensive'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Investment Detail Modal Component
 */
function InvestmentDetailModal({ investment, isDark, currentWealth, playerSkills, onInvest, onClose }) {
  const canAfford = currentWealth >= investment.suggestedCost;
  const meetsAllRequirements = investment.eligibility.allowed && canAfford;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      style={{
        background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(41, 37, 36, 0.5)'
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 245, 235, 0.98) 100%)',
          border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(209, 213, 219, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{
          borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
        }}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{investment.emoji}</span>
            <div>
              <h2 className={`text-2xl font-bold font-serif ${isDark ? 'text-amber-100' : 'text-ink-900'}`}>
                {investment.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm" style={{ color: investment.riskLevel.color }}>
                  {investment.riskLevel.emoji} {investment.riskLevel.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Historical Context */}
          <p className={`text-sm font-sans italic ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            "{investment.historicalContext}"
          </p>

          {/* Investment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg" style={{
              background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
              border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.25)'
            }}>
              <div className={`text-xs font-sans font-semibold uppercase tracking-wide mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Capital Required
              </div>
              <div className={`text-2xl font-bold font-mono ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                {investment.suggestedCost} reales
              </div>
            </div>

            <div className="p-3 rounded-lg" style={{
              background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)',
              border: isDark ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.25)'
            }}>
              <div className={`text-xs font-sans font-semibold uppercase tracking-wide mb-1 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                Duration
              </div>
              <div className={`text-2xl font-bold font-mono ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                {investment.suggestedDuration} days
              </div>
            </div>
          </div>

          {/* Possible Outcomes */}
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wide mb-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
              Possible Outcomes
            </h3>
            <div className="space-y-2">
              {investment.outcomes.map((outcome, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded text-xs font-sans flex items-center justify-between"
                  style={{
                    background: isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(229, 231, 235, 0.5)'
                  }}
                >
                  <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>
                    {outcome.label} ({(outcome.chance * 100).toFixed(0)}%)
                  </span>
                  <span className={`font-bold ${outcome.returnMultiplier >= 1 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                    {((outcome.returnMultiplier - 1) * 100).toFixed(0)}% return
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Your Wealth */}
          <div className={`text-sm font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Your Wealth: <span className={`font-bold ${canAfford ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>{currentWealth} reales</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-3" style={{
          borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
        }}>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-200 ${
              isDark
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onInvest}
            disabled={!meetsAllRequirements}
            className={`flex-1 px-4 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-200 ${
              meetsAllRequirements
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-400 cursor-not-allowed text-gray-200'
            }`}
          >
            Invest {investment.suggestedCost} Reales →
          </button>
        </div>
      </div>
    </div>
  );
}
