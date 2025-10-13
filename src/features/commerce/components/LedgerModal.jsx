/**
 * Ledger Modal
 *
 * Historical double-entry bookkeeping system.
 * Unlocked with Bookkeeping Level 1.
 *
 * Features:
 * - Income/expense transaction tracking
 * - Profit/loss summary
 * - Running balance calculation
 * - Date-based filtering
 * - Category-based organization
 * - 17th century accounting style
 *
 * Historical Context:
 * - Double-entry bookkeeping spread from Italy to Spain/New Spain in 16th-17th centuries
 * - Luca Pacioli's "Summa de arithmetica" (1494) standardized the practice
 * - Merchants used ledgers to track debits/credits, inventory, and accounts receivable
 */

import React, { useState, useMemo } from 'react';

/**
 * Transaction Categories
 */
const INCOME_CATEGORIES = [
  'Medicine Sales',
  'Consultation Fees',
  'Compound Sales',
  'Medical Procedures',
  'Gifts/Donations',
  'Other Income'
];

const EXPENSE_CATEGORIES = [
  'Ingredients Purchased',
  'Supplies',
  'Rent',
  'Taxes',
  'Debt Payments',
  'Wages',
  'Other Expenses'
];

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'reales') {
  const symbol = currency === 'reales' ? 'R' : currency;
  return `${amount >= 0 ? '' : '-'}${symbol} ${Math.abs(amount).toFixed(2)}`;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  return dateString; // Already formatted in game
}

export default function LedgerModal({
  isOpen,
  onClose,
  playerSkills,
  transactionManager,
  TRANSACTION_CATEGORIES,
  currentWealth = 0,
  gameState,
  currency = 'reales',
  theme = 'light'
}) {
  // Get transactions from TransactionManager
  const transactions = transactionManager ? transactionManager.getTransactions() : [];
  const currentBalance = transactionManager ? transactionManager.getBalance() : currentWealth;
  const startingBalance = 11; // Maria's starting wealth
  const startDate = 'August 22, 1680';
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-asc', 'date-desc', 'amount-asc', 'amount-desc'

  // Check if player has Bookkeeping skill
  const bookkeepingLevel = playerSkills?.knownSkills?.bookkeeping?.level || 0;
  const hasBookkeepingSkill = bookkeepingLevel > 0;

  // Calculate statistics
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      transactionCount: transactions.length
    };
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return a.turnNumber - b.turnNumber;
        case 'date-desc':
          return b.turnNumber - a.turnNumber;
        case 'amount-asc':
          return Math.abs(a.amount) - Math.abs(b.amount);
        case 'amount-desc':
          return Math.abs(b.amount) - Math.abs(a.amount);
        default:
          return b.turnNumber - a.turnNumber;
      }
    });

    return filtered;
  }, [transactions, filterType, filterCategory, sortBy]);

  // Calculate running balance for each transaction
  const transactionsWithBalance = useMemo(() => {
    let runningBalance = startingBalance;
    return filteredTransactions.map(t => {
      if (t.type === 'income') {
        runningBalance += t.amount;
      } else {
        runningBalance -= Math.abs(t.amount);
      }
      return {
        ...t,
        balanceAfter: runningBalance
      };
    });
  }, [filteredTransactions, startingBalance]);

  if (!isOpen) return null;

  if (!hasBookkeepingSkill) {
    return (
      <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="modal-content bg-white rounded-2xl shadow-elevation-4 max-w-md w-full p-8">
          <h2 className="font-display text-2xl font-bold text-amber-900 mb-4">📒 Skill Required</h2>
          <p className="font-serif text-gray-700 mb-6">
            You do not have the <span className="font-bold">Bookkeeping</span> skill required to maintain a proper ledger.
            Learning this skill will help you track income, expenses, and manage your finances effectively.
          </p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-sans font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="modal-content bg-white rounded-2xl shadow-elevation-4 max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-4">
            <div className="text-5xl">📒</div>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold mb-2">Ledger (Libro de Cuentas)</h1>
              <p className="text-white/90 font-serif text-sm mb-2">
                Complete record of income and expenses for the Botica de la Amargura
              </p>
              <p className="text-white/80 text-xs italic">
                "In accounting, one must be precise and honest, for numbers reveal all truths." — Luca Pacioli, 1494
              </p>
            </div>
          </div>

          {/* Date Range */}
          <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 w-fit">
            <span className="text-sm font-sans">From {startDate} to present</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gradient-to-b from-amber-50 to-white border-b border-amber-200">
          {/* Current Balance */}
          <div className="bg-white rounded-xl border-2 border-amber-300 p-4 shadow-sm">
            <div className="text-xs font-sans font-semibold text-amber-700 mb-1">CURRENT BALANCE</div>
            <div className={`font-display text-2xl font-bold ${currentBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(currentBalance, currency)}
            </div>
          </div>

          {/* Total Income */}
          <div className="bg-white rounded-xl border-2 border-green-200 p-4 shadow-sm">
            <div className="text-xs font-sans font-semibold text-green-700 mb-1">TOTAL INCOME</div>
            <div className="font-display text-2xl font-bold text-green-700">
              {formatCurrency(stats.totalIncome, currency)}
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-white rounded-xl border-2 border-red-200 p-4 shadow-sm">
            <div className="text-xs font-sans font-semibold text-red-700 mb-1">TOTAL EXPENSES</div>
            <div className="font-display text-2xl font-bold text-red-700">
              {formatCurrency(stats.totalExpenses, currency)}
            </div>
          </div>

          {/* Net Profit/Loss */}
          <div className="bg-white rounded-xl border-2 border-blue-200 p-4 shadow-sm">
            <div className="text-xs font-sans font-semibold text-blue-700 mb-1">NET PROFIT/LOSS</div>
            <div className={`font-display text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(stats.netProfit, currency)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Margin: {stats.profitMargin}%
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 border-b border-gray-200">
          {/* Filter by Type */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-sans font-semibold text-gray-700">Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-sans"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          {/* Filter by Category */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-sans font-semibold text-gray-700">Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-sans"
            >
              <option value="all">All Categories</option>
              <optgroup label="Income">
                {INCOME_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
              <optgroup label="Expenses">
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm font-sans font-semibold text-gray-700">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-sans"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="flex-1 overflow-y-auto">
          {transactionsWithBalance.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="font-sans text-lg font-semibold mb-2">No Transactions</h3>
              <p className="text-sm text-center">
                {filterType !== 'all' || filterCategory !== 'all'
                  ? 'No transactions match your current filters.'
                  : 'Your ledger is empty. Start trading to record transactions!'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-amber-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-sans font-bold text-amber-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans font-bold text-amber-900 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans font-bold text-amber-900 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-sans font-bold text-amber-900 uppercase tracking-wider">
                    Income
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-sans font-bold text-amber-900 uppercase tracking-wider">
                    Expense
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-sans font-bold text-amber-900 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Starting Balance Row */}
                <tr className="bg-amber-50 font-semibold">
                  <td className="px-4 py-3 text-sm font-serif text-gray-700">
                    {startDate}
                  </td>
                  <td className="px-4 py-3 text-sm font-serif text-gray-700" colSpan="2">
                    Opening Balance
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-gray-700">
                    —
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-gray-700">
                    —
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-gray-900 font-bold">
                    {formatCurrency(startingBalance, currency)}
                  </td>
                </tr>

                {/* Transaction Rows */}
                {transactionsWithBalance.map((transaction, index) => {
                  const isIncome = transaction.type === 'income';
                  const amount = Math.abs(transaction.amount);

                  return (
                    <tr
                      key={index}
                      className={`
                        ${isIncome ? 'hover:bg-green-50' : 'hover:bg-red-50'}
                        transition-colors
                      `}
                    >
                      <td className="px-4 py-3 text-sm font-serif text-gray-700 whitespace-nowrap">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-3 text-sm font-serif text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-3 text-sm font-sans text-gray-600">
                        <span className={`
                          inline-block px-2 py-0.5 rounded-full text-xs font-medium
                          ${isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        `}>
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-right">
                        {isIncome ? (
                          <span className="text-green-700 font-semibold">
                            +{formatCurrency(amount, currency)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-right">
                        {!isIncome ? (
                          <span className="text-red-700 font-semibold">
                            -{formatCurrency(amount, currency)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-right font-bold text-gray-900">
                        {formatCurrency(transaction.balanceAfter, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600 font-serif italic">
              "Let no transaction go unrecorded, for the ledger is the truth of commerce."
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-sans font-medium transition-colors shadow-lg"
            >
              Close Ledger
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
