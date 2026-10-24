import api from './api.js';

/**
 * Category API Service
 */
export const categoryService = {
  /**
   * Fetch categories, optionally filtered by type ('INCOME' | 'EXPENSE')
   * @param {string} [type]
   * @returns {Promise<Array>}
   */
  getCategories: async (type) => {
    const params = type ? { type } : {};
    const response = await api.get('/categories', { params });
    return response.data?.data || [];
  },
};

export default categoryService;
