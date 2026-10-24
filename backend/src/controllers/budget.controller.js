import budgetService from '../services/budget.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Create a new monthly budget
 * POST /api/budgets
 */
export const createBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.createBudget(req.user._id, req.body);
    return successResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Budget created successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List monthly budgets with spending metrics
 * GET /api/budgets
 */
export const getBudgets = async (req, res, next) => {
  try {
    const { items, meta } = await budgetService.getBudgets(req.user._id, req.query);
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Budgets retrieved successfully',
      data: items,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly budget health summary
 * GET /api/budgets/summary
 */
export const getBudgetSummary = async (req, res, next) => {
  try {
    const summary = await budgetService.getBudgetSummary(req.user._id, req.query);
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Budget summary retrieved successfully',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single budget record by ID
 * GET /api/budgets/:id
 */
export const getBudgetById = async (req, res, next) => {
  try {
    const budget = await budgetService.getBudgetById(req.user._id, req.params.id);
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Budget record retrieved successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing budget record
 * PATCH /api/budgets/:id
 */
export const updateBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.updateBudget(
      req.user._id,
      req.params.id,
      req.body
    );
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Budget record updated successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a budget record
 * DELETE /api/budgets/:id
 */
export const deleteBudget = async (req, res, next) => {
  try {
    await budgetService.deleteBudget(req.user._id, req.params.id);
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Budget record deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
