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
 * Transaction Outcomes (for non-monetary interactions)
 */
export const TRANSACTION_OUTCOMES = {
  REJECTED_BY_PLAYER: 'Rejected by Player',
  REJECTED_BY_NPC: 'Rejected by NPC',
  FAILED_NEGOTIATION: 'Failed Negotiation',
  DECLINED_OFFER: 'Declined Offer',
  INSUFFICIENT_FUNDS: 'Insufficient Funds',
  INSUFFICIENT_STOCK: 'Insufficient Stock',
  CANCELLED: 'Cancelled'
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
   * Log a completed monetary transaction
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
      balance: currentWealth,
      status: 'completed' // Completed monetary transaction
    };

    this.transactions.push(transaction);
    console.log(`[TransactionManager] Logged ${type}: ${description} (${amount} reales)`);
    return transaction;
  }

  /**
   * Log a failed/rejected transaction attempt
   * @param {string} category - Transaction category from TRANSACTION_CATEGORIES
   * @param {string} description - Human-readable description
   * @param {number} proposedAmount - Proposed transaction amount (0 if not applicable)
   * @param {string} outcome - Outcome from TRANSACTION_OUTCOMES
   * @param {string} reason - Why it failed/was rejected
   * @param {string} date - Game date
   * @param {string} time - Game time
   * @returns {Object} The created interaction record
   */
  logInteractionAttempt(category, description, proposedAmount, outcome, reason, date, time) {
    const interaction = {
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      date: date || 'Unknown Date',
      time: time || 'Unknown Time',
      type: 'interaction', // Non-monetary interaction
      category: category,
      description: description,
      amount: proposedAmount || 0, // Store proposed amount for reference
      balance: null, // No balance change
      status: 'failed',
      outcome: outcome,
      reason: reason
    };

    this.transactions.push(interaction);
    console.log(`[TransactionManager] Logged interaction: ${description} - ${outcome}`);
    return interaction;
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
   * @param {string} type - 'income', 'expense', 'interaction', or 'all'
   * @returns {Array} Filtered transactions
   */
  getTransactionsByType(type) {
    if (type === 'all') return this.getTransactions();
    return this.transactions.filter(t => t.type === type);
  }

  /**
   * Get only completed monetary transactions (excludes interactions)
   * @returns {Array} Monetary transactions only
   */
  getMonetaryTransactions() {
    return this.transactions.filter(t => t.type === 'income' || t.type === 'expense');
  }

  /**
   * Get only interaction attempts (excludes monetary transactions)
   * @returns {Array} Interaction attempts only
   */
  getInteractionAttempts() {
    return this.transactions.filter(t => t.type === 'interaction');
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
   * Get total income (monetary transactions only)
   * @returns {number} Sum of all income transactions
   */
  getTotalIncome() {
    return this.transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Get total expenses (monetary transactions only)
   * @returns {number} Sum of all expense transactions
   */
  getTotalExpenses() {
    return this.transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
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
   * Export transactions for save system
   * @returns {Array} Array of transaction data
   */
  exportForSave() {
    console.log(`[TransactionManager] Exported ${this.transactions.length} transactions for save`);
    return [...this.transactions];
  }

  /**
   * Load transactions from save data
   * @param {Array} transactionData - Array of transaction data from save
   * @returns {boolean} Success status
   */
  loadFromSave(transactionData) {
    try {
      if (!Array.isArray(transactionData)) {
        console.error('[TransactionManager] Invalid transaction data: not an array');
        return false;
      }

      this.transactions = transactionData;
      console.log(`[TransactionManager] ✅ Loaded ${transactionData.length} transactions from save`);
      return true;
    } catch (error) {
      console.error('[TransactionManager] ❌ Failed to load transactions from save:', error);
      return false;
    }
  }

  /**
   * @deprecated Use exportForSave() instead. localStorage operations moved to saveManager.
   */
  loadFromStorage(scenarioId) {
    console.warn('[TransactionManager] loadFromStorage() is deprecated. Use loadFromSave() and saveManager instead.');
  }

  /**
   * @deprecated Use exportForSave() instead. localStorage operations moved to saveManager.
   */
  saveToStorage(scenarioId) {
    console.warn('[TransactionManager] saveToStorage() is deprecated. Use exportForSave() and saveManager instead.');
  }
}

// Singleton instance
let transactionManagerInstance = null;

/**
 * Get or create the TransactionManager singleton
 * @param {string} scenarioId - Scenario identifier (no longer used, kept for compatibility)
 * @returns {TransactionManager} The transaction manager instance
 */
export function getTransactionManager(scenarioId) {
  if (!transactionManagerInstance) {
    transactionManagerInstance = new TransactionManager();
    // NOTE: Transactions now loaded from unified save system (v1.1.0+)
    // Legacy localStorage keys cleaned up by saveManager.cleanupLegacyStorage()
    console.log('[TransactionManager] Created new instance (transactions loaded from save system)');
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
