import api from './api.js';

/**
 * Transaction API Service (Unified ledger)
 */
export const transactionService = {
  /**
   * Fetch paginated and filtered unified transaction records
   * @param {object} params - { type, category, startDate, endDate, minAmount, maxAmount, search, sortBy, sortOrder, page, limit }
   * @returns {Promise<{ items: Array, meta: object }>}
   */
  getTransactions: async (params = {}) => {
    // Strip empty string or undefined keys
    const cleanParams = Object.entries(params).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        acc[key] = val;
      }
      return acc;
    }, {});

    const response = await api.get('/transactions', { params: cleanParams });
    return {
      items: response.data?.data || [],
      meta: response.data?.meta || {
        pagination: {
          page: 1,
          limit: 10,
          totalRecords: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
        summary: {
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
        },
      },
    };
  },
};

export default transactionService;
