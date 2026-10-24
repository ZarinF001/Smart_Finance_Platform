import api from './api.js';

/**
 * Expense API Service
 */
export const expenseService = {
  /**
   * Fetch paginated and filtered expense records
   * @param {object} params - { page, limit, category, paymentMethod, startDate, endDate, minAmount, maxAmount, search, sortBy, sortOrder }
   * @returns {Promise<{ items: Array, meta: object }>}
   */
  getExpenses: async (params = {}) => {
    // Strip empty string or undefined keys
    const cleanParams = Object.entries(params).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        acc[key] = val;
      }
      return acc;
    }, {});

    const response = await api.get('/expenses', { params: cleanParams });
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
          totalExpense: 0,
        },
      },
    };
  },

  /**
   * Fetch single expense record by ID
   * @param {string} id
   * @returns {Promise<object>}
   */
  getExpenseById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data?.data;
  },

  /**
   * Create a new expense record
   * @param {object} data - { amount, category, date, description, paymentMethod }
   * @returns {Promise<object>}
   */
  createExpense: async (data) => {
    const response = await api.post('/expenses', data);
    return response.data?.data;
  },

  /**
   * Update an existing expense record
   * @param {string} id
   * @param {object} data - { amount, category, date, description, paymentMethod }
   * @returns {Promise<object>}
   */
  updateExpense: async (id, data) => {
    const response = await api.patch(`/expenses/${id}`, data);
    return response.data?.data;
  },

  /**
   * Delete an expense record
   * @param {string} id
   * @returns {Promise<void>}
   */
  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

export default expenseService;
