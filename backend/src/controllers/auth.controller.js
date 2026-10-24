import authService from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/apiResponse.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookie.js';

/**
 * Register a new user account
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);

    // Set HTTP-only session cookie
    setAuthCookie(res, token);

    return successResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user and issue JWT
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);

    // Set HTTP-only session cookie
    setAuthCookie(res, token);

    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Logged in successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Terminate user session and clear authentication cookie
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);

    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch profile of currently authenticated user
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'User profile retrieved successfully',
      data: {
        user: req.user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change authenticated user's password
 * PATCH /api/auth/change-password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword({
      userId: req.user._id,
      currentPassword,
      newPassword,
    });

    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Password changed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
