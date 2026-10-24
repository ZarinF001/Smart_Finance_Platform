import api from './api.js';

/**
 * Budget API Service
 */
export const budgetService = {
  /**
   * Fetch paginated and filtered budgets
   * @param {object} params - { month, year, category, page, limit }
   * @returns {Promise<{ items: Array, meta: object }>}
   */
  getBudgets: async (params = {}) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        acc[key] = val;
      }
      return acc;
    }, {});

    const response = await api.get('/budgets', { params: cleanParams });
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
      },
    };
  },

  /**
   * Fetch aggregated monthly budget summary
   * @param {object} params - { month, year }
   * @returns {Promise<object>}
   */
  getBudgetSummary: async (params = {}) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        acc[key] = val;
      }
      return acc;
    }, {});

    const response = await api.get('/budgets/summary', { params: cleanParams });
    return response.data?.data || {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      totalBudgets: 0,
      totalBudgetLimit: 0,
      totalSpent: 0,
      totalRemaining: 0,
      overallUtilization: 0,
      normalCount: 0,
      warningCount: 0,
      exceededCount: 0,
      budgets: [],
    };
  },

  /**
   * Fetch single budget by ID
   * @param {string} id
   * @returns {Promise<object>}
   */
  getBudgetById: async (id) => {
    const response = await api.get(`/budgets/${id}`);
    return response.data?.data;
  },

  /**
   * Create a monthly budget for an expense category
   * @param {object} data - { category, limit, month, year }
   * @returns {Promise<object>}
   */
  createBudget: async (data) => {
    const response = await api.post('/budgets', data);
    return response.data?.data;
  },

  /**
   * Update an existing budget
   * @param {string} id
   * @param {object} data - { limit, category, month, year }
   * @returns {Promise<object>}
   */
  updateBudget: async (id, data) => {
    const response = await api.patch(`/budgets/${id}`, data);
    return response.data?.data;
  },

  /**
   * Delete a budget record
   * @param {string} id
   * @returns {Promise<void>}
   */
  deleteBudget: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};

export default budgetService;
