import api from './api.js';

/**
 * Income API Service
 */
export const incomeService = {
  /**
   * Fetch paginated and filtered income records
   * @param {object} params - { page, limit, category, startDate, endDate, minAmount, maxAmount, search, sortBy, sortOrder }
   * @returns {Promise<{ items: Array, meta: object }>}
   */
  getIncomes: async (params = {}) => {
    // Strip empty string or undefined keys
    const cleanParams = Object.entries(params).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        acc[key] = val;
      }
      return acc;
    }, {});

    const response = await api.get('/incomes', { params: cleanParams });
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
        },
      },
    };
  },

  /**
   * Fetch single income record by ID
   * @param {string} id
   * @returns {Promise<object>}
   */
  getIncomeById: async (id) => {
    const response = await api.get(`/incomes/${id}`);
    return response.data?.data;
  },

  /**
   * Create a new income record
   * @param {object} data - { amount, category, date, description }
   * @returns {Promise<object>}
   */
  createIncome: async (data) => {
    const response = await api.post('/incomes', data);
    return response.data?.data;
  },

  /**
   * Update an existing income record
   * @param {string} id
   * @param {object} data - { amount, category, date, description }
   * @returns {Promise<object>}
   */
  updateIncome: async (id, data) => {
    const response = await api.patch(`/incomes/${id}`, data);
    return response.data?.data;
  },

  /**
   * Delete an income record
   * @param {string} id
   * @returns {Promise<void>}
   */
  deleteIncome: async (id) => {
    const response = await api.delete(`/incomes/${id}`);
    return response.data;
  },
};

export default incomeService;
