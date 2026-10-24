import { HTTP_STATUS } from '../constants/index.js';

/**
 * Standard successful response
 */
export const successResponse = (res, {
  statusCode = HTTP_STATUS.OK,
  message = 'Success',
  data = null,
  meta = null,
} = {}) => {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Standard error response
 */
export const errorResponse = (res, {
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  message = 'Internal Server Error',
  errors = null,
} = {}) => {
  const payload = {
    success: false,
    message,
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};
