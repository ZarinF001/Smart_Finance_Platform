import api from './api.js';

/**
 * Service to communicate with backend authentication endpoints
 */
export const authService = {
  /**
   * Register a new user account
   * @param {{ name: string, email: string, password: string }} credentials
   */
  async register(credentials) {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  /**
   * Log into an existing user account
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Log out of current session and clear authentication cookie
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Fetch currently authenticated user profile
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Change password for currently authenticated user
   * @param {{ currentPassword: string, newPassword: string, confirmPassword?: string }} data
   */
  async changePassword(data) {
    const response = await api.patch('/auth/change-password', data);
    return response.data;
  },
};

export default authService;
