import { HTTP_STATUS } from '../constants/index.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * 404 Handler for unknown routes
 */
export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};
