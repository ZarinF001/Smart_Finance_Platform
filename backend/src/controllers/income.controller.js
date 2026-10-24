import incomeService from '../services/income.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Add a new income record
 * POST /api/incomes
 */
export const createIncome = async (req, res, next) => {
  try {
    const income = await incomeService.createIncome(req.user._id, req.body);
    return successResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Income record created successfully',
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List the authenticated user's incomes with pagination and filters
 * GET /api/incomes
 */
export const getIncomes = async (req, res, next) => {
  try {
    const { items, meta } = await incomeService.getIncomes(req.user._id, req.query);
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Incomes retrieved successfully',
      data: items,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single income record by ID
 * GET /api/incomes/:id
 */
export const getIncomeById = async (req, res, next) => {
  try {
    const income = await incomeService.getIncomeById(req.user._id, req.params.id);
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Income record retrieved successfully',
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Edit an existing income record
 * PUT /api/incomes/:id or PATCH /api/incomes/:id
 */
export const updateIncome = async (req, res, next) => {
  try {
    const income = await incomeService.updateIncome(
      req.user._id,
      req.params.id,
      req.body
    );
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Income record updated successfully',
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an income record
 * DELETE /api/incomes/:id
 */
export const deleteIncome = async (req, res, next) => {
  try {
    await incomeService.deleteIncome(req.user._id, req.params.id);
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Income record deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
