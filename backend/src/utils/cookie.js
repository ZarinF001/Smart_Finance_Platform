import { env } from '../config/env.js';
import { AUTH_COOKIE_NAME } from '../constants/index.js';

/**
 * Get cookie options tailored to current environment
 */
export const getAuthCookieOptions = () => {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    // When in production with cross-origin frontend/backend, secure must be true and sameSite 'none'
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: env.COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

/**
 * Get options for clearing the auth cookie
 */
export const getClearAuthCookieOptions = () => {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
};

/**
 * Attach authentication JWT cookie to response
 */
export const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

/**
 * Clear authentication JWT cookie from response
 */
export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions());
};
