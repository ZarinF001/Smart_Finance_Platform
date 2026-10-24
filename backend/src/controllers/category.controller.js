import categoryService from '../services/category.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Get available categories optionally filtered by type (INCOME/EXPENSE)
 * GET /api/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories({
      type: req.query.type,
    });

    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
