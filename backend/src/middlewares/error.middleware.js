import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/index.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Centralized error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    return errorResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  // Handle malformed JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: 'Malformed JSON payload in request body',
    });
  }

  // Handle MongoDB Duplicate Key Error (e.g. unique email constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, {
      statusCode: HTTP_STATUS.CONFLICT,
      message: `An account with this ${field} already exists.`,
    });
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: `Invalid format for identifier: ${err.path}`,
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return errorResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: 'Database validation failed',
      errors,
    });
  }

  // Handle JWT specific errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: 'Invalid authentication token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: 'Your session has expired. Please sign in again.',
    });
  }

  // Log unexpected errors internally
  console.error(`💥 [Error] ${err.message}`, err.stack);

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message =
    statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR && env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred'
      : err.message || 'An unexpected internal error occurred';

  const responsePayload = {
    statusCode,
    message,
  };

  if (env.NODE_ENV === 'development' && err.stack) {
    responsePayload.errors = {
      stack: err.stack,
    };
  }

  return errorResponse(res, responsePayload);
};

export default errorHandler;
