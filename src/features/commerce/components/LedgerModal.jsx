/**
 * Ledger Modal - Modernized
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
 * - Modern UI with animations and dark mode
 *
 * Historical Context:
 * - Double-entry bookkeeping spread from Italy to Spain/New Spain in 16th-17th centuries
 * - Luca Pacioli's "Summa de arithmetica" (1494) standardized the practice
 * - Merchants used ledgers to track debits/credits, inventory, and accounts receivable
 */

import React, { useState, useMemo, useEffect } from 'react';
import { getAllMedicineTypes, inferMedicineType, getMedicineEmoji, getMedicineColor } from '../../../core/config/medicineCategories';

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
  const [activeTab, setActiveTab] = useState('transactions');
  const [previousTab, setPreviousTab] = useState('transactions');
  const [slideDirection, setSlideDirection] = useState('right');
  const [isClosing, setIsClosing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const isDark = document.documentElement.classList.contains('dark');

  // Handle smooth close with exit animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  // Reset closing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Get transactions from TransactionManager
  const transactions = transactionManager ? transactionManager.getTransactions() : [];
  const currentBalance = transactionManager ? transactionManager.getBalance() : currentWealth;
  const startingBalance = 11; // Maria's starting wealth
  const startDate = 'August 22, 1680';

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

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

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

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    const income = {};
    const expenses = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        income[t.category] = (income[t.category] || 0) + t.amount;
      } else {
        expenses[t.category] = (expenses[t.category] || 0) + Math.abs(t.amount);
      }
    });

    return { income, expenses };
  }, [transactions]);

  // Calculate medicine type breakdown (for medicine sales only)
  const medicineBreakdown = useMemo(() => {
    const medicineTypes = getAllMedicineTypes();
    const breakdown = {};

    // Initialize all types to 0
    medicineTypes.forEach(type => {
      breakdown[type.id] = {
        ...type,
        totalSales: 0,
        count: 0
      };
    });

    // Categorize medicine sales transactions
    transactions
      .filter(t => t.type === 'income' && t.category === 'Medicine Sales')
      .forEach(t => {
        // Try to infer medicine type from transaction description
        const medicineType = inferMedicineType({ name: t.description, description: t.description });
        if (breakdown[medicineType]) {
          breakdown[medicineType].totalSales += t.amount;
          breakdown[medicineType].count += 1;
        }
      });

    return breakdown;
  }, [transactions]);

  const tabs = [
    { id: 'transactions', label: 'Transactions', icon: '📝' },
    { id: 'summary', label: 'Summary', icon: '📊' },
    { id: 'categories', label: 'Categories', icon: '🏷️' }
  ];

  // Handle tab change with slide direction
  const handleTabChange = (newTab) => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    const newIndex = tabs.findIndex(t => t.id === newTab);

    setSlideDirection(newIndex > currentIndex ? 'right' : 'left');
    setPreviousTab(activeTab);
    setActiveTab(newTab);
  };

  if (!isOpen) return null;

  // Skill Required Modal
  if (!hasBookkeepingSkill) {
    return (
      <div className={`fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}>
        <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-elevation-4 max-w-md w-full p-8 ${isClosing ? 'animate-modal-scale-out' : 'animate-modal-scale-in'}`}>
          <h2 className="font-display text-2xl font-bold text-amber-900 dark:text-amber-400 mb-4">📒 Skill Required</h2>
          <p className="font-serif text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            You do not have the <span className="font-bold text-amber-700 dark:text-amber-400">Bookkeeping</span> skill required to maintain a proper ledger.
            Learning this skill will help you track income, expenses, and manage your finances effectively.
          </p>
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 hover:from-amber-500 hover:to-amber-600 dark:hover:from-amber-400 dark:hover:to-amber-500 text-white dark:text-slate-900 rounded-lg font-sans font-semibold transition-all duration-200 shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4 ${isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}
      style={{
        background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(41, 37, 36, 0.5)'
      }}
      onClick={handleClose}
    >
      {/* Modal Container - Responsive: Full screen on mobile */}
      <div
        className={`relative w-full max-w-full sm:max-w-7xl h-screen sm:h-[90vh] rounded-none sm:rounded-2xl overflow-hidden flex flex-col shadow-elevation-4 transition-all duration-300 ${isClosing ? 'animate-modal-scale-out' : 'animate-modal-scale-in'}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 1.0) 0%, rgba(30, 41, 59, 1.0) 50%, rgba(15, 23, 42, 1.0) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.95) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: isDark
            ? '0 24px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
            : '0 24px 80px rgba(61, 47, 36, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >

        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          opacity: 0.5,
          background: isDark
            ? 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle at top right, rgba(139, 92, 46, 0.25) 0%, transparent 70%)'
        }} />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-50 p-2 rounded-lg transition-all duration-150 hover:bg-ink-100 dark:hover:bg-slate-700"
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            border: isDark ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
            boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
            style={{ color: isDark ? '#cbd5e1' : '#3d2817' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header - Responsive padding */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-5 border-b relative z-10 transition-colors duration-300"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
              : 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
            borderColor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(209, 213, 219, 0.3)'
          }}>
          <div className="flex items-start gap-4">
            <img
              src="/icons/commonplace_book_icon.png"
              alt="Libro de Cuentas"
              className="w-14 h-14 object-contain"
              style={{
                filter: isDark ? 'drop-shadow(0 4px 8px rgba(251, 191, 36, 0.3))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }}
            />
            <div className="flex-1">
              <h1 className="font-serif text-4xl font-bold mb-2 tracking-tight transition-colors duration-300"
                style={{
                  color: isDark ? '#fbbf24' : '#78350f',
                  letterSpacing: '-0.02em'
                }}>
                Libro de Cuentas
              </h1>
              <p className="text-lg font-sans mb-1 transition-colors duration-300"
                style={{ color: isDark ? '#d1d5db' : '#6b5a47' }}>
                Complete record of income and expenses for the Botica de la Amargura
              </p>

            </div>
          </div>


        </div>

        {/* Summary Cards - Responsive padding */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 border-b relative z-10 transition-colors duration-300"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.2))'
              : 'linear-gradient(to bottom, rgba(251, 191, 36, 0.05), rgba(255, 255, 255, 0.5))',
            borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
          }}>

          {/* Current Balance */}
          <div
            className="rounded-xl p-4 transition-all duration-300 animate-cascade-in group cursor-default"
            style={{
              background: isDark
                ? 'linear-gradient(145deg, rgba(20, 28, 42, 0.6), rgba(30, 41, 59, 0.7))'
                : 'linear-gradient(145deg, rgba(245, 243, 238, 0.8), rgba(252, 250, 247, 0.9))',
              border: isDark ? '1px solid rgba(251, 191, 36, 0.15)' : '1px solid rgba(251, 191, 36, 0.2)',
              boxShadow: isDark
                ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.03)'
                : 'inset 2px 2px 6px rgba(0, 0, 0, 0.08), inset -2px -2px 6px rgba(255, 255, 255, 0.9)',
              animationDelay: '0ms'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? '0 8px 24px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.15)'
                : '0 8px 24px rgba(251, 191, 36, 0.25), 0 0 40px rgba(251, 191, 36, 0.12)';
              e.currentTarget.style.border = isDark ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid rgba(251, 191, 36, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.03)'
                : 'inset 2px 2px 6px rgba(0, 0, 0, 0.08), inset -2px -2px 6px rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.border = isDark ? '1px solid rgba(251, 191, 36, 0.15)' : '1px solid rgba(251, 191, 36, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="text-xs font-sans font-semibold mb-1 transition-colors duration-300"
              style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
              CURRENT BALANCE
            </div>
            <div className={`font-display text-2xl font-bold ${currentBalance >= 0 ? (isDark ? 'text-green-400' : 'text-green-700') : (isDark ? 'text-red-400' : 'text-red-700')}`}>
              {formatCurrency(currentBalance, currency)}
            </div>
          </div>

          {/* Total Income */}
          <div
            className="rounded-xl p-4 transition-all duration-300 animate-cascade-in group cursor-default"
            style={{
              background: isDark
                ? 'linear-gradient(145deg, rgba(20, 28, 42, 0.6), rgba(30, 41, 59, 0.7))'
                : 'linear-gradient(145deg, rgba(245, 243, 238, 0.8), rgba(252, 250, 247, 0.9))',
              border: isDark ? '1px solid rgba(34, 197, 94, 0.15)' : '1px solid rgba(34, 197, 94, 0.2)',
              boxShadow: isDark
                ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.03)'
                : 'inset 2px 2px 6px rgba(0, 0, 0, 0.08), inset -2px -2px 6px rgba(255, 255, 255, 0.9)',
              animationDelay: '60ms'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? '0 8px 24px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.15)'
                : '0 8px 24px rgba(34, 197, 94, 0.25), 0 0 40px rgba(34, 197, 94, 0.12)';
              e.currentTarget.style.border = isDark ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.03)'
                : 'inset 2px 2px 6px rgba(0, 0, 0, 0.08), inset -2px -2px 6px rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.border = isDark ? '1px solid rgba(34, 197, 94, 0.15)' : '1px solid rgba(34, 197, 94, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="text-xs font-sans font-semibold mb-1 transition-colors duration-300"
              style={{ color: isDark ? '#4ade80' : '#15803d' }}>
              TOTAL INCOME
            </div>
            <div className={`font-display text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              {formatCurrency(stats.totalIncome, currency)}
            </div>
          </div>

          {/* Total Expenses */}
          <div
            className="rounded-xl p-4 transition-all duration-300 animate-cascade-in group cursor-default"
            style={{
              background: isDark
                ? 'linear-gradient(145deg, rgba(20, 28, 42, 0.6), rgba(30, 41, 59, 0.7))'
                : 'linear-gradient(145deg, rgba(245, 243, 238, 0.8), rgba(252, 250, 247, 0.9))',
              border: isDark ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: isDark
                ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.03)'
                : 'inset 2px 2px 6px rgba(0, 0, 0, 0.08), inset -2px -2px 6px rgba(255, 255, 255, 0.9)',
              animationDelay: '120ms'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? '0 8px 24px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.15)'
                : '0 8px 24px rgba(239, 68, 68, 0.25), 0 0 40px rgba(239, 68, 68, 0.12)';
              e.currentTarget.style.border = isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.03)'
                : 'inset 2px 2px 6px rgba(0, 0, 0, 0.08), inset -2px -2px 6px rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.border = isDark ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="text-xs font-sans font-semibold mb-1 transition-colors duration-300"
              style={{ color: isDark ? '#f87171' : '#b91c1c' }}>
              TOTAL EXPENSES
            </div>
            <div className={`font-display text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              {formatCurrency(stats.totalExpenses, currency)}
            </div>
          </div>

          {/* Net Profit/Loss */}
          <div
            className="rounded-xl p-4 transition-all duration-300 animate-cascade-in group cursor-default"
            style={{
              background: isDark
                ? 'linear-gradient(145deg, rgba(20, 28, 42, 0.6), rgba(30, 41, 59, 0.7))'
                : 'linear-gradient(145deg, rgba(245, 243, 238, 0.8), rgba(252, 250, 247, 0.9))',
              border: isDark ? '1px solid rgba(59, 130, 246, 0.15)' : '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: isDark
                ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.03)'
                : 'inset 2px 2px 6px rgba(0, 0, 0, 0.08), inset -2px -2px 6px rgba(255, 255, 255, 0.9)',
              animationDelay: '180ms'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? '0 8px 24px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.15)'
                : '0 8px 24px rgba(59, 130, 246, 0.25), 0 0 40px rgba(59, 130, 246, 0.12)';
              e.currentTarget.style.border = isDark ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isDark
                ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.03)'
                : 'inset 2px 2px 6px rgba(0, 0, 0, 0.08), inset -2px -2px 6px rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.border = isDark ? '1px solid rgba(59, 130, 246, 0.15)' : '1px solid rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="text-xs font-sans font-semibold mb-1 transition-colors duration-300"
              style={{ color: isDark ? '#60a5fa' : '#1e40af' }}>
              NET PROFIT/LOSS
            </div>
            <div className={`font-display text-2xl font-bold ${stats.netProfit >= 0 ? (isDark ? 'text-green-400' : 'text-green-700') : (isDark ? 'text-red-400' : 'text-red-700')}`}>
              {formatCurrency(stats.netProfit, currency)}
            </div>
            <div className="text-xs mt-1 transition-colors duration-300"
              style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              Margin: {stats.profitMargin}%
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex border-b relative z-10 transition-colors duration-300"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
              : 'linear-gradient(to bottom, rgba(252, 250, 247, 0.95), rgba(248, 246, 241, 0.9))',
            borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
          }}>
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="flex-1 px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative font-sans"
              style={{
                fontWeight: activeTab === tab.id ? 700 : 600,
                letterSpacing: '0.08em',
                color: activeTab === tab.id
                  ? (isDark ? '#fbbf24' : '#78350f')
                  : (isDark ? '#a8a29e' : '#6b5a47'),
                background: activeTab === tab.id
                  ? (isDark
                    ? 'linear-gradient(to bottom, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.05))'
                    : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.8))')
                  : 'transparent',
                borderLeft: idx > 0 ? (isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.2)') : 'none'
              }}
            >
              <span className="mr-2 text-base" style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-colors duration-300"
                  style={{ background: isDark ? '#fbbf24' : '#78350f' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative"
          style={{
            background: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(252, 250, 247, 0.4)'
          }}>

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div
              key="transactions"
              className={`h-full flex flex-col ${slideDirection === 'right' ? 'animate-tab-slide-in-right' : 'animate-tab-slide-in-left'}`}
            >
              {/* Filters */}
              <div className="flex-shrink-0 flex flex-wrap gap-3 p-4 border-b transition-colors duration-300"
                style={{
                  background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 246, 241, 0.8)',
                  borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
                }}>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-sans font-semibold transition-colors duration-300"
                    style={{ color: isDark ? '#cbd5e1' : '#374151' }}>Type:</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-sm font-sans transition-colors duration-300"
                    style={{
                      background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'white',
                      color: isDark ? '#f3f4f6' : '#1f2937',
                      border: isDark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(209, 213, 219, 0.5)'
                    }}
                  >
                    <option value="all">All Transactions</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expenses Only</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-sans font-semibold transition-colors duration-300"
                    style={{ color: isDark ? '#cbd5e1' : '#374151' }}>Category:</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-sm font-sans transition-colors duration-300"
                    style={{
                      background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'white',
                      color: isDark ? '#f3f4f6' : '#1f2937',
                      border: isDark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(209, 213, 219, 0.5)'
                    }}
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

                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-sm font-sans font-semibold transition-colors duration-300"
                    style={{ color: isDark ? '#cbd5e1' : '#374151' }}>Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-sm font-sans transition-colors duration-300"
                    style={{
                      background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'white',
                      color: isDark ? '#f3f4f6' : '#1f2937',
                      border: isDark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(209, 213, 219, 0.5)'
                    }}
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
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="font-sans text-lg font-semibold mb-2 transition-colors duration-300"
                      style={{ color: isDark ? '#cbd5e1' : '#6b7280' }}>
                      No Transactions
                    </h3>
                    <p className="text-sm text-center transition-colors duration-300"
                      style={{ color: isDark ? '#94a3b8' : '#9ca3af' }}>
                      {filterType !== 'all' || filterCategory !== 'all'
                        ? 'No transactions match your current filters.'
                        : 'Your ledger is empty. Start trading to record transactions!'}
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0 z-10 transition-colors duration-300"
                      style={{
                        background: isDark
                          ? 'linear-gradient(to bottom, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.15))'
                          : 'linear-gradient(to bottom, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.1))'
                      }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-sans font-bold uppercase tracking-wider transition-colors duration-300"
                          style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-sans font-bold uppercase tracking-wider transition-colors duration-300"
                          style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-sans font-bold uppercase tracking-wider transition-colors duration-300"
                          style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                          Category
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-sans font-bold uppercase tracking-wider transition-colors duration-300"
                          style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                          Income
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-sans font-bold uppercase tracking-wider transition-colors duration-300"
                          style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                          Expense
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-sans font-bold uppercase tracking-wider transition-colors duration-300"
                          style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Starting Balance Row */}
                      <tr className="font-semibold border-b transition-colors duration-300 animate-cascade-in"
                        style={{
                          background: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)',
                          borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)',
                          animationDelay: '0ms'
                        }}>
                        <td className="px-4 py-3 text-xs font-sans font-semibold uppercase tracking-wider whitespace-nowrap transition-colors duration-300"
                          style={{ color: isDark ? '#cbd5e1' : '#374151', letterSpacing: '0.05em' }}>
                          {startDate}
                        </td>
                        <td className="px-4 py-3 text-base font-serif transition-colors duration-300" colSpan="2"
                          style={{ color: isDark ? '#cbd5e1' : '#374151' }}>
                          Opening Balance
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-right transition-colors duration-300"
                          style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                          —
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-right transition-colors duration-300"
                          style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                          —
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-right font-bold transition-colors duration-300"
                          style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
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
                            className="border-b transition-all duration-200 animate-cascade-in"
                            style={{
                              borderColor: isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(209, 213, 219, 0.2)',
                              animationDelay: `${(index + 1) * 30}ms`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = isIncome
                                ? (isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)')
                                : (isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)');
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <td className="px-4 py-3 text-xs font-sans font-semibold uppercase tracking-wider whitespace-nowrap transition-colors duration-300"
                              style={{ color: isDark ? '#cbd5e1' : '#374151', letterSpacing: '0.05em' }}>
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-4 py-3 text-base font-serif transition-colors duration-300"
                              style={{ color: isDark ? '#f3f4f6' : '#1f2937' }}>
                              {transaction.description}
                            </td>
                            <td className="px-4 py-3 text-sm font-sans">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium`}
                                style={{
                                  background: isIncome
                                    ? (isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)')
                                    : (isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'),
                                  color: isIncome
                                    ? (isDark ? '#4ade80' : '#15803d')
                                    : (isDark ? '#f87171' : '#b91c1c')
                                }}>
                                {transaction.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-right">
                              {isIncome ? (
                                <span className="font-semibold transition-colors duration-300"
                                  style={{ color: isDark ? '#4ade80' : '#15803d' }}>
                                  +{formatCurrency(amount, currency)}
                                </span>
                              ) : (
                                <span className="transition-colors duration-300"
                                  style={{ color: isDark ? '#64748b' : '#9ca3af' }}>—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-right">
                              {!isIncome ? (
                                <span className="font-semibold transition-colors duration-300"
                                  style={{ color: isDark ? '#f87171' : '#b91c1c' }}>
                                  -{formatCurrency(amount, currency)}
                                </span>
                              ) : (
                                <span className="transition-colors duration-300"
                                  style={{ color: isDark ? '#64748b' : '#9ca3af' }}>—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-right font-bold transition-colors duration-300"
                              style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                              {formatCurrency(transaction.balanceAfter, currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div
              key="summary"
              className={`p-8 space-y-6 ${slideDirection === 'right' ? 'animate-tab-slide-in-right' : 'animate-tab-slide-in-left'}`}
            >
              <h2 className="text-3xl font-bold font-serif mb-4 transition-colors duration-300"
                style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                Financial Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overview */}
                <div className="rounded-xl p-6 transition-all duration-300 animate-cascade-in"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                    border: isDark ? '1.5px solid rgba(251, 191, 36, 0.3)' : '1.5px solid rgba(251, 191, 36, 0.2)',
                    boxShadow: isDark
                      ? '0 6px 20px rgba(251, 191, 36, 0.15), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
                      : '0 6px 20px rgba(251, 191, 36, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                    animationDelay: '0ms'
                  }}>
                  <h3 className="text-lg font-bold font-sans mb-4 transition-colors duration-300"
                    style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                    Overview
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-sans transition-colors duration-300"
                        style={{ color: isDark ? '#cbd5e1' : '#6b7280' }}>
                        Total Transactions:
                      </span>
                      <span className="font-semibold font-mono transition-colors duration-300"
                        style={{ color: isDark ? '#f3f4f6' : '#1f2937' }}>
                        {stats.transactionCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-sans transition-colors duration-300"
                        style={{ color: isDark ? '#cbd5e1' : '#6b7280' }}>
                        Starting Balance:
                      </span>
                      <span className="font-semibold font-mono transition-colors duration-300"
                        style={{ color: isDark ? '#f3f4f6' : '#1f2937' }}>
                        {formatCurrency(startingBalance, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-sans transition-colors duration-300"
                        style={{ color: isDark ? '#cbd5e1' : '#6b7280' }}>
                        Current Balance:
                      </span>
                      <span className={`font-bold font-mono ${currentBalance >= 0 ? (isDark ? 'text-green-400' : 'text-green-700') : (isDark ? 'text-red-400' : 'text-red-700')}`}>
                        {formatCurrency(currentBalance, currency)}
                      </span>
                    </div>
                    <div className="pt-3 border-t transition-colors duration-300"
                      style={{ borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-sans font-semibold transition-colors duration-300"
                          style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                          Net Change:
                        </span>
                        <span className={`font-bold font-mono ${(currentBalance - startingBalance) >= 0 ? (isDark ? 'text-green-400' : 'text-green-700') : (isDark ? 'text-red-400' : 'text-red-700')}`}>
                          {formatCurrency(currentBalance - startingBalance, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="rounded-xl p-6 transition-all duration-300 animate-cascade-in"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(252, 250, 247, 0.9))',
                    border: isDark ? '1.5px solid rgba(59, 130, 246, 0.3)' : '1.5px solid rgba(59, 130, 246, 0.2)',
                    boxShadow: isDark
                      ? '0 6px 20px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(59, 130, 246, 0.1)'
                      : '0 6px 20px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                    animationDelay: '60ms'
                  }}>
                  <h3 className="text-lg font-bold font-sans mb-4 transition-colors duration-300"
                    style={{ color: isDark ? '#60a5fa' : '#1e40af' }}>
                    Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-sans transition-colors duration-300"
                        style={{ color: isDark ? '#cbd5e1' : '#6b7280' }}>
                        Profit Margin:
                      </span>
                      <span className={`font-semibold font-mono ${stats.profitMargin >= 0 ? (isDark ? 'text-green-400' : 'text-green-700') : (isDark ? 'text-red-400' : 'text-red-700')}`}>
                        {stats.profitMargin}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-sans transition-colors duration-300"
                        style={{ color: isDark ? '#cbd5e1' : '#6b7280' }}>
                        Avg Transaction:
                      </span>
                      <span className="font-semibold font-mono transition-colors duration-300"
                        style={{ color: isDark ? '#f3f4f6' : '#1f2937' }}>
                        {formatCurrency(stats.transactionCount > 0 ? (stats.totalIncome + stats.totalExpenses) / stats.transactionCount : 0, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-sans transition-colors duration-300"
                        style={{ color: isDark ? '#cbd5e1' : '#6b7280' }}>
                        Income/Expense Ratio:
                      </span>
                      <span className="font-semibold font-mono transition-colors duration-300"
                        style={{ color: isDark ? '#f3f4f6' : '#1f2937' }}>
                        {stats.totalExpenses > 0 ? (stats.totalIncome / stats.totalExpenses).toFixed(2) : '∞'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="rounded-xl p-6 transition-all duration-300 animate-cascade-in"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))'
                    : 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(251, 191, 36, 0.05))',
                  border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)',
                  animationDelay: '120ms'
                }}>
                <p className="text-sm font-serif italic text-center transition-colors duration-300"
                  style={{ color: isDark ? '#a8a29e' : '#78716c' }}>
                  "Let no transaction go unrecorded, for the ledger is the truth of commerce."
                  <br />
                  <span className="text-xs not-italic">— Traditional accounting wisdom</span>
                </p>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div
              key="categories"
              className={`p-8 space-y-6 ${slideDirection === 'right' ? 'animate-tab-slide-in-right' : 'animate-tab-slide-in-left'}`}
            >
              <h2 className="text-3xl font-bold font-serif mb-4 transition-colors duration-300"
                style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                Medicine Sales by Type
              </h2>

              <p className="text-sm font-serif italic mb-6 transition-colors duration-300"
                style={{ color: isDark ? '#a8a29e' : '#78716c' }}>
                Medicines are classified according to early modern pharmaceutical tradition: simples (single ingredients), compounds (complex mixtures), Indies drugs (exotic imports), alchemical preparations, medicinal foods, and animal products.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(medicineBreakdown)
                  .sort((a, b) => b.totalSales - a.totalSales)
                  .map((type, idx) => (
                    <div
                      key={type.id}
                      className="rounded-xl p-5 transition-all duration-300 animate-cascade-in group"
                      style={{
                        background: isDark
                          ? 'linear-gradient(145deg, rgba(20, 28, 42, 0.6), rgba(30, 41, 59, 0.7))'
                          : 'linear-gradient(145deg, rgba(245, 243, 238, 0.8), rgba(252, 250, 247, 0.9))',
                        border: `1.5px solid ${type.color}${isDark ? '40' : '30'}`,
                        boxShadow: isDark
                          ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.03)'
                          : 'inset 2px 2px 6px rgba(0, 0, 0, 0.08), inset -2px -2px 6px rgba(255, 255, 255, 0.9)',
                        animationDelay: `${idx * 50}ms`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 8px 24px ${type.color}40, 0 0 40px ${type.color}20`;
                        e.currentTarget.style.border = `1.5px solid ${type.color}80`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = isDark
                          ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.03)'
                          : 'inset 2px 2px 6px rgba(0, 0, 0, 0.08), inset -2px -2px 6px rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.border = `1.5px solid ${type.color}${isDark ? '40' : '30'}`;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{type.emoji}</span>
                        <div className="flex-1">
                          <h3 className="font-sans font-bold text-base transition-colors duration-300"
                            style={{ color: isDark ? type.color : type.color }}>
                            {type.name}
                          </h3>
                          <p className="text-xs font-sans transition-colors duration-300"
                            style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                            {type.count} sale{type.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Total Sales */}
                      <div className="mb-3">
                        <span className="font-display text-xl font-bold transition-colors duration-300"
                          style={{ color: isDark ? '#4ade80' : '#15803d' }}>
                          {type.totalSales > 0 ? `+${formatCurrency(type.totalSales, currency)}` : '—'}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs font-serif italic leading-relaxed transition-colors duration-300"
                        style={{ color: isDark ? '#a8a29e' : '#78716c' }}>
                        {type.description}
                      </p>

                      {/* Historical Context (on hover/always visible) */}
                      <div className="mt-3 pt-3 border-t transition-colors duration-300"
                        style={{ borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)' }}>
                        <p className="text-xs font-sans transition-colors duration-300"
                          style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                          {type.historicalContext}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Summary Footer */}
              <div className="rounded-xl p-6 transition-all duration-300 animate-cascade-in mt-8"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))'
                    : 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(251, 191, 36, 0.05))',
                  border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)',
                  animationDelay: `${Object.values(medicineBreakdown).length * 50}ms`
                }}>
                <div className="flex justify-between items-center">
                  <span className="font-serif text-base font-semibold transition-colors duration-300"
                    style={{ color: isDark ? '#fbbf24' : '#78350f' }}>
                    Total Medicine Sales:
                  </span>
                  <span className="font-display text-xl font-bold transition-colors duration-300"
                    style={{ color: isDark ? '#4ade80' : '#15803d' }}>
                    +{formatCurrency(
                      Object.values(medicineBreakdown).reduce((sum, type) => sum + type.totalSales, 0),
                      currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
