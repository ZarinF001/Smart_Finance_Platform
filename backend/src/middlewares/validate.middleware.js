/**
 * Middleware factory to validate request body using a Zod schema
 * @param {import('zod').ZodSchema} schema
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // assign sanitized/parsed data
      next();
    } catch (error) {
      next(error); // handled by centralized error middleware
    }
  };
};

/**
 * Middleware factory to validate request query parameters using a Zod schema
 * @param {import('zod').ZodSchema} schema
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed; // assign sanitized/parsed data
      next();
    } catch (error) {
      next(error); // handled by centralized error middleware
    }
  };
};

/**
 * Middleware factory to validate request path parameters (e.g. :id)
 * @param {import('zod').ZodSchema} schema
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.params);
      req.params = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default {
  validateBody,
  validateQuery,
  validateParams,
};
