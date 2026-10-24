import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';
import notify from '../utils/notify.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Verify authenticated session through backend HTTP-only cookie
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // 401 simply means no active session, which is normal for unauthenticated visitors
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize session verification on initial application mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Log into account
   */
  const login = async ({ email, password }) => {
    const response = await authService.login({ email, password });
    if (response?.data?.user) {
      setUser(response.data.user);
      notify.success(`Welcome back, ${response.data.user.name}!`);
    }
    return response.data;
  };

  /**
   * Register new account
   */
  const register = async ({ name, email, password }) => {
    const response = await authService.register({ name, email, password });
    if (response?.data?.user) {
      setUser(response.data.user);
      notify.success('Account created successfully! Welcome to FinFlow.');
    }
    return response.data;
  };

  /**
   * Log out of current session and clear backend cookie
   */
  const logout = async () => {
    try {
      await authService.logout();
      notify.info('You have been logged out.');
    } catch (err) {
      // Even if network error occurs, clear local session state
      console.warn('Backend logout encountered error, clearing local state:', err);
    } finally {
      setUser(null);
    }
  };

  /**
   * Update locally cached user profile
   */
  const updateUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    checkAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
