import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { AUTH_COOKIE_NAME, HTTP_STATUS, ROLES, ACCOUNT_STATUS } from '../constants/index.js';
import { errorResponse } from '../utils/apiResponse.js';
import { verifyToken } from '../utils/token.js';
import User from '../models/user.model.js';

/**
 * Authentication middleware
 * Verifies JWT token from HTTP-only cookie or Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
      token = req.cookies[AUTH_COOKIE_NAME];
    }
    // 2. Fallback to Authorization: Bearer <token>
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'Authentication required. Please sign in.',
      });
    }

    // 3. Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: 'Your session has expired. Please sign in again.',
        });
      }
      return errorResponse(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'Invalid authentication token.',
      });
    }

    // 4. Check if user still exists
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return errorResponse(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // 5. Check if user account is active
    if (user.status !== ACCOUNT_STATUS.ACTIVE) {
      return errorResponse(res, {
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware factory
 * @param  {...string} allowedRoles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: 'Forbidden. You do not have permission to access this resource.',
      });
    }

    next();
  };
};

/**
 * Convenience authorization middleware for ADMIN role
 */
export const authorizeAdmin = authorize(ROLES.ADMIN);

/**
 * Rate limiter middleware for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    });
  },
});
