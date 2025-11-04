/**
 * TransactionHistoryTab - Beautiful sortable transaction history display
 *
 * Features:
 * - Sortable by date, type, category, amount, balance
 * - Filter by type (income/expense/all)
 * - Filter by category
 * - Search functionality
 * - Summary statistics
 * - Export functionality
 */

import React, { useState, useMemo } from 'react';
import { TRANSACTION_CATEGORIES, TRANSACTION_OUTCOMES } from '../../../core/systems/transactionManager';

export default function TransactionHistoryTab({
  transactionManager,
  isDark
}) {
  const [sortBy, setSortBy] = useState('timestamp'); // timestamp, amount, category, type
  const [sortDirection, setSortDirection] = useState('desc'); // asc or desc
  const [filterType, setFilterType] = useState('all'); // all, income, expense, interaction
  const [filterCategory, setFilterCategory] = useState('all'); // all or specific category
  const [searchQuery, setSearchQuery] = useState('');

  // Get transactions
  const transactions = useMemo(() => {
    if (!transactionManager) return [];
    return transactionManager.getTransactions();
  }, [transactionManager]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [transactions, filterType, filterCategory, searchQuery]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions];

    sorted.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'timestamp':
          aVal = new Date(a.timestamp);
          bVal = new Date(b.timestamp);
          break;
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        case 'type':
          aVal = a.type;
          bVal = b.type;
          break;
        case 'balance':
          aVal = a.balance;
          bVal = b.balance;
          break;
        default:
          aVal = new Date(a.timestamp);
          bVal = new Date(b.timestamp);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredTransactions, sortBy, sortDirection]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!transactionManager) {
      return { totalIncome: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0 };
    }

    return {
      totalIncome: transactionManager.getTotalIncome(),
      totalExpenses: transactionManager.getTotalExpenses(),
      netProfit: transactionManager.getNetProfit(),
      profitMargin: transactionManager.getProfitMargin()
    };
  }, [transactionManager]);

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to desc
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // Handle export
  const handleExport = () => {
    if (!transactionManager) return;

    const jsonData = transactionManager.exportToJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get unique categories from transactions
  const categories = useMemo(() => {
    const cats = new Set();
    transactions.forEach(t => cats.add(t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold font-serif mb-2 ${isDark ? 'text-amber-100' : 'text-ink-900'}`}>
            Transaction History
          </h2>
          <p className={`text-sm font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            All transaction attempts including completed deals, rejected offers, and failed negotiations
          </p>
          <p className={`text-xs font-sans italic ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
            Statistics show only completed monetary transactions
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={transactions.length === 0}
          className={`px-4 py-2 rounded-lg font-sans font-semibold text-sm transition-all duration-200 ${
            isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-amber-400 disabled:opacity-40'
              : 'bg-white hover:bg-gray-50 text-ink-800 border border-gray-300 disabled:opacity-40'
          } disabled:cursor-not-allowed`}
          title="Export transactions as JSON"
        >
          📥 Export
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Income */}
        <div
          className="p-4 rounded-xl border"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))'
              : 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(22, 163, 74, 0.03))',
            borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'
          }}
        >
          <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
            Total Income
          </div>
          <div className={`text-2xl font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            +{stats.totalIncome.toFixed(0)} ℛ
          </div>
        </div>

        {/* Total Expenses */}
        <div
          className="p-4 rounded-xl border"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.03))',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'
          }}
        >
          <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
            Total Expenses
          </div>
          <div className={`text-2xl font-bold font-mono ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            -{stats.totalExpenses.toFixed(0)} ℛ
          </div>
        </div>

        {/* Net Profit */}
        <div
          className="p-4 rounded-xl border"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(37, 99, 235, 0.03))',
            borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
          }}
        >
          <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            Net Profit
          </div>
          <div className={`text-2xl font-bold font-mono ${
            stats.netProfit >= 0
              ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
              : (isDark ? 'text-red-400' : 'text-red-600')
          }`}>
            {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(0)} ℛ
          </div>
        </div>

        {/* Profit Margin */}
        <div
          className="p-4 rounded-xl border"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05))'
              : 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(147, 51, 234, 0.03))',
            borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)'
          }}
        >
          <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
            Profit Margin
          </div>
          <div className={`text-2xl font-bold font-mono ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            {stats.profitMargin}%
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`flex-1 min-w-[200px] px-4 py-2 rounded-lg font-sans text-sm border ${
            isDark
              ? 'bg-slate-800 border-slate-600 text-parchment-100 placeholder-slate-500'
              : 'bg-white border-gray-300 text-ink-900 placeholder-gray-400'
          }`}
        />

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-2 rounded-lg font-sans text-sm border ${
            isDark
              ? 'bg-slate-800 border-slate-600 text-parchment-100'
              : 'bg-white border-gray-300 text-ink-900'
          }`}
        >
          <option value="all">All Types</option>
          <option value="income">✓ Income Only</option>
          <option value="expense">✓ Expense Only</option>
          <option value="interaction">✗ Failed/Rejected Only</option>
        </select>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`px-4 py-2 rounded-lg font-sans text-sm border ${
            isDark
              ? 'bg-slate-800 border-slate-600 text-parchment-100'
              : 'bg-white border-gray-300 text-ink-900'
          }`}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Transaction Count */}
      <div className={`text-sm font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        Showing {sortedTransactions.length} of {transactions.length} transactions
      </div>

      {/* Transaction Table */}
      {sortedTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📜</div>
          <h3 className={`text-xl font-bold font-serif mb-2 ${isDark ? 'text-amber-100' : 'text-ink-900'}`}>
            No Transactions Found
          </h3>
          <p className={`text-sm font-sans ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {searchQuery || filterType !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Your transactions will appear here as you play.'}
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden border"
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(209, 213, 219, 0.5)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: isDark
                      ? 'linear-gradient(to bottom, rgba(51, 65, 85, 0.9), rgba(30, 41, 59, 0.8))'
                      : 'linear-gradient(to bottom, rgba(249, 250, 251, 0.95), rgba(243, 244, 246, 0.9))',
                    borderBottom: isDark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(209, 213, 219, 0.5)'
                  }}
                >
                  <th
                    onClick={() => handleSort('timestamp')}
                    className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                      isDark ? 'text-amber-400' : 'text-ink-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      Date & Time
                      {sortBy === 'timestamp' && (
                        <span className="text-base">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('type')}
                    className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                      isDark ? 'text-amber-400' : 'text-ink-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      Type
                      {sortBy === 'type' && (
                        <span className="text-base">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                      isDark ? 'text-amber-400' : 'text-ink-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      Category
                      {sortBy === 'category' && (
                        <span className="text-base">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-ink-700'}`}>
                    Description
                  </th>
                  <th
                    onClick={() => handleSort('amount')}
                    className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                      isDark ? 'text-amber-400' : 'text-ink-700'
                    }`}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Amount
                      {sortBy === 'amount' && (
                        <span className="text-base">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('balance')}
                    className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                      isDark ? 'text-amber-400' : 'text-ink-700'
                    }`}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Balance
                      {sortBy === 'balance' && (
                        <span className="text-base">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((transaction, idx) => {
                  const isInteraction = transaction.type === 'interaction';

                  return (
                    <tr
                      key={transaction.id}
                      className={`border-b transition-colors ${
                        isInteraction
                          ? (isDark ? 'border-slate-700/50 hover:bg-slate-800/30 opacity-75' : 'border-gray-200 hover:bg-gray-50/70 opacity-80')
                          : (isDark ? 'border-slate-700 hover:bg-slate-800/50' : 'border-gray-200 hover:bg-gray-50')
                      }`}
                    >
                      <td className={`px-4 py-3 text-sm font-sans ${isDark ? 'text-slate-300' : 'text-gray-700'} ${isInteraction ? 'line-through' : ''}`}>
                        <div className="font-medium">{transaction.date}</div>
                        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                          {transaction.time}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-sans">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            isInteraction
                              ? (isDark ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-200 text-gray-600')
                              : transaction.type === 'income'
                              ? (isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                              : (isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700')
                          }`}
                        >
                          {isInteraction
                            ? '✗ Failed'
                            : transaction.type === 'income' ? '↑ Income' : '↓ Expense'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm font-sans ${isDark ? 'text-slate-300' : 'text-gray-700'} ${isInteraction ? 'italic' : ''}`}>
                        {transaction.category}
                      </td>
                      <td className={`px-4 py-3 text-sm font-sans ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        <div className={isInteraction ? 'line-through' : ''}>
                          {transaction.description}
                        </div>
                        {isInteraction && transaction.outcome && (
                          <div className={`text-xs italic mt-1 ${isDark ? 'text-amber-400/70' : 'text-amber-700'}`}>
                            {transaction.outcome}
                            {transaction.reason && ` — ${transaction.reason}`}
                          </div>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-sm font-mono text-right font-semibold ${
                        isInteraction
                          ? (isDark ? 'text-gray-600 line-through' : 'text-gray-500 line-through')
                          : transaction.type === 'income'
                          ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                          : (isDark ? 'text-red-400' : 'text-red-600')
                      }`}>
                        {isInteraction && transaction.amount > 0 && '('}
                        {!isInteraction && (transaction.type === 'income' ? '+' : '-')}
                        {transaction.amount} ℛ
                        {isInteraction && transaction.amount > 0 && ')'}
                        {isInteraction && transaction.amount === 0 && '—'}
                      </td>
                      <td className={`px-4 py-3 text-sm font-mono text-right ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {transaction.balance !== null ? `${transaction.balance} ℛ` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
