import expenseService from '../services/expense.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Add a new expense record
 * POST /api/expenses
 */
export const createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.user._id, req.body);
    return successResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Expense record created successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List the authenticated user's expenses with pagination and filters
 * GET /api/expenses
 */
export const getExpenses = async (req, res, next) => {
  try {
    const { items, meta } = await expenseService.getExpenses(
      req.user._id,
      req.query
    );
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Expenses retrieved successfully',
      data: items,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single expense record by ID
 * GET /api/expenses/:id
 */
export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(
      req.user._id,
      req.params.id
    );
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Expense record retrieved successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Edit an existing expense record
 * PUT /api/expenses/:id or PATCH /api/expenses/:id
 */
export const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(
      req.user._id,
      req.params.id,
      req.body
    );
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Expense record updated successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an expense record
 * DELETE /api/expenses/:id
 */
export const deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.user._id, req.params.id);
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Expense record deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
