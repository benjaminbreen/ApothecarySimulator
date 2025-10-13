// TransactionManager - Central transaction logging system for financial tracking
// Enables the Ledger Modal to display real transaction history

/**
 * Transaction Categories (historically authentic 17th century accounting)
 */
export const TRANSACTION_CATEGORIES = {
  MEDICINE_SALES: 'Medicine Sales',
  INGREDIENTS: 'Ingredients',
  EQUIPMENT: 'Equipment',
  TRAVEL: 'Travel',
  FOOD: 'Food & Sustenance',
  RENT: 'Rent & Property',
  TAXES: 'Taxes & Fees',
  DEBT_PAYMENT: 'Debt Payment',
  DEBT_RECEIVED: 'Debt Received',
  WAGES: 'Wages & Services',
  GIFTS: 'Gifts & Charity',
  FINES: 'Fines & Penalties',
  OTHER: 'Other'
};

/**
 * TransactionManager class
 * Handles all financial transaction logging for the ledger system
 */
export class TransactionManager {
  constructor() {
    this.transactions = [];
  }

  /**
   * Log a new transaction
   * @param {string} type - 'income' or 'expense'
   * @param {string} category - Transaction category from TRANSACTION_CATEGORIES
   * @param {string} description - Human-readable description
   * @param {number} amount - Transaction amount (positive number)
   * @param {number} currentWealth - Current wealth AFTER transaction
   * @param {string} date - Game date
   * @param {string} time - Game time
   * @returns {Object} The created transaction
   */
  logTransaction(type, category, description, amount, currentWealth, date, time) {
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      date: date || 'Unknown Date',
      time: time || 'Unknown Time',
      type: type, // 'income' or 'expense'
      category: category,
      description: description,
      amount: Math.abs(amount), // Always store as positive
      balance: currentWealth
    };

    this.transactions.push(transaction);
    console.log(`[TransactionManager] Logged ${type}: ${description} (${amount} reales)`);
    return transaction;
  }

  /**
   * Get all transactions
   * @returns {Array} Copy of all transactions
   */
  getTransactions() {
    return [...this.transactions];
  }

  /**
   * Get transactions filtered by type
   * @param {string} type - 'income', 'expense', or 'all'
   * @returns {Array} Filtered transactions
   */
  getTransactionsByType(type) {
    if (type === 'all') return this.getTransactions();
    return this.transactions.filter(t => t.type === type);
  }

  /**
   * Get transactions filtered by category
   * @param {string} category - Transaction category
   * @returns {Array} Filtered transactions
   */
  getTransactionsByCategory(category) {
    return this.transactions.filter(t => t.category === category);
  }

  /**
   * Get current balance (from most recent transaction)
   * @returns {number} Current balance
   */
  getBalance() {
    return this.transactions.length > 0
      ? this.transactions[this.transactions.length - 1].balance
      : 0;
  }

  /**
   * Get total income
   * @returns {number} Sum of all income transactions
   */
  getTotalIncome() {
    return this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Get total expenses
   * @returns {number} Sum of all expense transactions
   */
  getTotalExpenses() {
    return this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Get net profit/loss
   * @returns {number} Total income minus total expenses
   */
  getNetProfit() {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  /**
   * Get profit margin percentage
   * @returns {number} (Net profit / Total income) * 100
   */
  getProfitMargin() {
    const income = this.getTotalIncome();
    if (income === 0) return 0;
    return ((this.getNetProfit() / income) * 100).toFixed(2);
  }

  /**
   * Get transactions in date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Array} Filtered transactions
   */
  getTransactionsInDateRange(startDate, endDate) {
    return this.transactions.filter(t => {
      return t.date >= startDate && t.date <= endDate;
    });
  }

  /**
   * Get category breakdown
   * @returns {Object} Object with categories as keys and totals as values
   */
  getCategoryBreakdown() {
    const breakdown = {};

    this.transactions.forEach(t => {
      if (!breakdown[t.category]) {
        breakdown[t.category] = {
          income: 0,
          expense: 0,
          count: 0
        };
      }

      if (t.type === 'income') {
        breakdown[t.category].income += t.amount;
      } else {
        breakdown[t.category].expense += t.amount;
      }

      breakdown[t.category].count += 1;
    });

    return breakdown;
  }

  /**
   * Clear all transactions
   */
  clear() {
    this.transactions = [];
    console.log('[TransactionManager] Cleared all transactions');
  }

  /**
   * Export transactions as JSON
   * @returns {string} JSON string of all transactions
   */
  exportToJSON() {
    return JSON.stringify(this.transactions, null, 2);
  }

  /**
   * Import transactions from JSON
   * @param {string} jsonString - JSON string of transactions
   */
  importFromJSON(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (Array.isArray(imported)) {
        this.transactions = imported;
        console.log(`[TransactionManager] Imported ${imported.length} transactions`);
      }
    } catch (error) {
      console.error('[TransactionManager] Failed to import transactions:', error);
    }
  }

  /**
   * Load transactions from localStorage
   * @param {string} scenarioId - Scenario identifier
   */
  loadFromStorage(scenarioId) {
    try {
      const key = `transactions_${scenarioId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        this.transactions = JSON.parse(stored);
        console.log(`[TransactionManager] Loaded ${this.transactions.length} transactions from storage`);
      }
    } catch (error) {
      console.error('[TransactionManager] Failed to load from storage:', error);
    }
  }

  /**
   * Save transactions to localStorage
   * @param {string} scenarioId - Scenario identifier
   */
  saveToStorage(scenarioId) {
    try {
      const key = `transactions_${scenarioId}`;
      localStorage.setItem(key, JSON.stringify(this.transactions));
      console.log(`[TransactionManager] Saved ${this.transactions.length} transactions to storage`);
    } catch (error) {
      console.error('[TransactionManager] Failed to save to storage:', error);
    }
  }
}

// Singleton instance
let transactionManagerInstance = null;

/**
 * Get or create the TransactionManager singleton
 * @param {string} scenarioId - Scenario identifier
 * @returns {TransactionManager} The transaction manager instance
 */
export function getTransactionManager(scenarioId) {
  if (!transactionManagerInstance) {
    transactionManagerInstance = new TransactionManager();
    transactionManagerInstance.loadFromStorage(scenarioId);
  }
  return transactionManagerInstance;
}

/**
 * Reset the transaction manager (for new games)
 */
export function resetTransactionManager() {
  transactionManagerInstance = null;
}

export default TransactionManager;
