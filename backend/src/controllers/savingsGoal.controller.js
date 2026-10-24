import savingsGoalService from '../services/savingsGoal.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Create a new savings goal
 * POST /api/savings-goals
 */
export const createGoal = async (req, res, next) => {
  try {
    const goal = await savingsGoalService.createGoal(req.user._id, req.body);
    return successResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Savings goal created successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all savings goals for authenticated user
 * GET /api/savings-goals
 */
export const getGoals = async (req, res, next) => {
  try {
    const { items, meta } = await savingsGoalService.getGoals(req.user._id, req.query);
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Savings goals retrieved successfully',
      data: items,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single savings goal by ID
 * GET /api/savings-goals/:id
 */
export const getGoalById = async (req, res, next) => {
  try {
    const goal = await savingsGoalService.getGoalById(req.user._id, req.params.id);
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Savings goal retrieved successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a savings goal
 * PATCH /api/savings-goals/:id
 */
export const updateGoal = async (req, res, next) => {
  try {
    const goal = await savingsGoalService.updateGoal(
      req.user._id,
      req.params.id,
      req.body
    );
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Savings goal updated successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a savings goal
 * DELETE /api/savings-goals/:id
 */
export const deleteGoal = async (req, res, next) => {
  try {
    await savingsGoalService.deleteGoal(req.user._id, req.params.id);
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Savings goal deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a contribution to a savings goal
 * POST /api/savings-goals/:id/contributions
 */
export const addContribution = async (req, res, next) => {
  try {
    const result = await savingsGoalService.addContribution(
      req.user._id,
      req.params.id,
      req.body
    );
    return successResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Contribution recorded successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List contribution history for a savings goal
 * GET /api/savings-goals/:id/contributions
 */
export const getContributions = async (req, res, next) => {
  try {
    const { items, meta } = await savingsGoalService.getContributions(
      req.user._id,
      req.params.id,
      req.query
    );
    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Contribution history retrieved successfully',
      data: items,
      meta,
    });
  } catch (error) {
    next(error);
  }
};
