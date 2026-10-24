import api from './api.js';

/**
 * Health service to verify API connectivity and database status
 */
export const healthService = {
  /**
   * Fetch backend system health status
   */
  async checkHealth() {
    const response = await api.get('/health');
    return response.data;
  },
};

export default healthService;
