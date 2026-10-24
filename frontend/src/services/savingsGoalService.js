import api from './api.js';

/**
 * Savings Goal API Service
 */
export const savingsGoalService = {
  /**
   * Fetch all savings goals with calculated progress metrics
   * @param {object} params - { status, page, limit }
   * @returns {Promise<{ items: Array, meta: object }>}
   */
  getGoals: async (params = {}) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        acc[key] = val;
      }
      return acc;
    }, {});

    const response = await api.get('/savings-goals', { params: cleanParams });
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
   * Fetch single savings goal by ID with recent contributions
   * @param {string} id
   * @returns {Promise<object>}
   */
  getGoalById: async (id) => {
    const response = await api.get(`/savings-goals/${id}`);
    return response.data?.data;
  },

  /**
   * Create a new savings goal
   * @param {object} data - { name, targetAmount, deadline, description }
   * @returns {Promise<object>}
   */
  createGoal: async (data) => {
    const response = await api.post('/savings-goals', data);
    return response.data?.data;
  },

  /**
   * Update an existing savings goal
   * @param {string} id
   * @param {object} data - { name, targetAmount, deadline, description }
   * @returns {Promise<object>}
   */
  updateGoal: async (id, data) => {
    const response = await api.patch(`/savings-goals/${id}`, data);
    return response.data?.data;
  },

  /**
   * Delete a savings goal and all its contributions
   * @param {string} id
   * @returns {Promise<void>}
   */
  deleteGoal: async (id) => {
    const response = await api.delete(`/savings-goals/${id}`);
    return response.data;
  },

  /**
   * Record a contribution towards a goal
   * @param {string} goalId
   * @param {object} data - { amount, date, description }
   * @returns {Promise<{ contribution: object, goal: object }>}
   */
  addContribution: async (goalId, data) => {
    const response = await api.post(`/savings-goals/${goalId}/contributions`, data);
    return response.data?.data;
  },

  /**
   * Get paginated contribution history for a savings goal
   * @param {string} goalId
   * @param {object} params - { page, limit }
   * @returns {Promise<{ items: Array, meta: object }>}
   */
  getContributions: async (goalId, params = {}) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        acc[key] = val;
      }
      return acc;
    }, {});

    const response = await api.get(`/savings-goals/${goalId}/contributions`, {
      params: cleanParams,
    });
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
};

export default savingsGoalService;
