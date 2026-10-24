import mongoose from 'mongoose';
import Budget from '../models/budget.model.js';
import Expense from '../models/expense.model.js';
import categoryService from './category.service.js';
import {
  TRANSACTION_TYPES,
  BUDGET_STATUS,
  BUDGET_WARNING_THRESHOLD,
  HTTP_STATUS,
} from '../constants/index.js';

class BudgetService {
  /**
   * Helper to calculate spending metrics dynamically from Expense records
   * @param {mongoose.Types.ObjectId} userObjectId
   * @param {object} budget - Budget document or object
   * @returns {Promise<object>} Budget object with calculated metrics
   */
  async attachBudgetMetrics(userObjectId, budget) {
    const rawBudget = budget.toObject ? budget.toObject() : budget;

    // Define UTC start and end dates for the budget's month & year
    const startOfMonth = new Date(Date.UTC(rawBudget.year, rawBudget.month - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(rawBudget.year, rawBudget.month, 0, 23, 59, 59, 999));

    // Aggregate expenses in this category and month
    const aggResult = await Expense.aggregate([
      {
        $match: {
          user: userObjectId,
          category: new RegExp(`^${rawBudget.category.trim()}$`, 'i'),
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spent = aggResult.length > 0 ? Math.round(aggResult[0].totalSpent * 100) / 100 : 0;
    const limit = rawBudget.limit;
    const remaining = Math.round((limit - spent) * 100) / 100;
    const utilization = limit > 0 ? Math.round((spent / limit) * 100 * 100) / 100 : 0;

    // Determine status: EXCEEDED, WARNING (>= 80% and <= 100%), NORMAL (< 80%)
    let status = BUDGET_STATUS.NORMAL;
    if (spent > limit) {
      status = BUDGET_STATUS.EXCEEDED;
    } else if (limit > 0 && spent / limit >= BUDGET_WARNING_THRESHOLD) {
      status = BUDGET_STATUS.WARNING;
    }

    return {
      ...rawBudget,
      spent,
      remaining,
      utilization,
      status,
      warningThresholdPercent: Math.round(BUDGET_WARNING_THRESHOLD * 100),
      isExceeded: spent > limit,
    };
  }

  /**
   * Create a new monthly budget
   */
  async createBudget(userId, data) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Validate category against EXPENSE transaction type
    const validatedCategory = await categoryService.validateCategory(
      data.category,
      TRANSACTION_TYPES.EXPENSE
    );

    const month = data.month || new Date().getMonth() + 1;
    const year = data.year || new Date().getFullYear();

    // 2. Enforce uniqueness: prevent duplicate budget for same category/month/year
    const existing = await Budget.findOne({
      user: userObjectId,
      category: new RegExp(`^${validatedCategory}$`, 'i'),
      month,
      year,
    });

    if (existing) {
      const error = new Error(
        `A budget for category '${validatedCategory}' already exists for ${month}/${year}. Edit the existing budget or choose another category.`
      );
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    // 3. Save new budget
    const budget = new Budget({
      user: userObjectId,
      category: validatedCategory,
      limit: data.limit,
      month,
      year,
    });

    await budget.save();
    return this.attachBudgetMetrics(userObjectId, budget);
  }

  /**
   * List budgets with filtering, pagination, and calculated spending metrics
   */
  async getBudgets(userId, query = {}) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { month, year, category, page = 1, limit = 10 } = query;

    const filter = { user: userObjectId };

    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);
    if (category) filter.category = new RegExp(`^${category.trim()}$`, 'i');

    const skip = (page - 1) * limit;

    const [rawBudgets, totalRecords] = await Promise.all([
      Budget.find(filter)
        .sort({ year: -1, month: -1, category: 1 })
        .skip(skip)
        .limit(limit),
      Budget.countDocuments(filter),
    ]);

    // Attach real-time spending calculations to each budget
    const items = await Promise.all(
      rawBudgets.map((b) => this.attachBudgetMetrics(userObjectId, b))
    );

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      items,
      meta: {
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalRecords,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    };
  }

  /**
   * Get overall monthly budget summary and health metrics for a given month/year
   */
  async getBudgetSummary(userId, query = {}) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const month = query.month ? Number(query.month) : now.getMonth() + 1;
    const year = query.year ? Number(query.year) : now.getFullYear();

    // Fetch all budgets for this month/year
    const budgets = await Budget.find({ user: userObjectId, month, year });

    if (budgets.length === 0) {
      return {
        month,
        year,
        totalBudgets: 0,
        totalBudgetLimit: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallUtilization: 0,
        normalCount: 0,
        warningCount: 0,
        exceededCount: 0,
        budgets: [],
      };
    }

    // Attach metrics for each budget
    const enriched = await Promise.all(
      budgets.map((b) => this.attachBudgetMetrics(userObjectId, b))
    );

    const totalBudgetLimit = Math.round(
      enriched.reduce((acc, b) => acc + b.limit, 0) * 100
    ) / 100;

    const totalSpent = Math.round(
      enriched.reduce((acc, b) => acc + b.spent, 0) * 100
    ) / 100;

    const totalRemaining = Math.round((totalBudgetLimit - totalSpent) * 100) / 100;

    const overallUtilization = totalBudgetLimit > 0
      ? Math.round((totalSpent / totalBudgetLimit) * 100 * 100) / 100
      : 0;

    const normalCount = enriched.filter((b) => b.status === BUDGET_STATUS.NORMAL).length;
    const warningCount = enriched.filter((b) => b.status === BUDGET_STATUS.WARNING).length;
    const exceededCount = enriched.filter((b) => b.status === BUDGET_STATUS.EXCEEDED).length;

    return {
      month,
      year,
      totalBudgets: enriched.length,
      totalBudgetLimit,
      totalSpent,
      totalRemaining,
      overallUtilization,
      normalCount,
      warningCount,
      exceededCount,
      budgets: enriched,
    };
  }

  /**
   * Get single budget record by ID
   */
  async getBudgetById(userId, budgetId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const budget = await Budget.findOne({ _id: budgetId, user: userObjectId });
    if (!budget) {
      const error = new Error('Budget record not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    return this.attachBudgetMetrics(userObjectId, budget);
  }

  /**
   * Update an existing budget record
   */
  async updateBudget(userId, budgetId, updateData) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const budget = await Budget.findOne({ _id: budgetId, user: userObjectId });
    if (!budget) {
      const error = new Error('Budget record not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    let targetCategory = budget.category;
    let targetMonth = budget.month;
    let targetYear = budget.year;

    // 1. Validate category if updated
    if (updateData.category) {
      targetCategory = await categoryService.validateCategory(
        updateData.category,
        TRANSACTION_TYPES.EXPENSE
      );
      budget.category = targetCategory;
    }

    if (updateData.month !== undefined) {
      targetMonth = updateData.month;
      budget.month = targetMonth;
    }

    if (updateData.year !== undefined) {
      targetYear = updateData.year;
      budget.year = targetYear;
    }

    // 2. Check for duplicate conflicts if category, month, or year changed
    if (
      updateData.category ||
      updateData.month !== undefined ||
      updateData.year !== undefined
    ) {
      const conflict = await Budget.findOne({
        _id: { $ne: budgetId },
        user: userObjectId,
        category: new RegExp(`^${targetCategory}$`, 'i'),
        month: targetMonth,
        year: targetYear,
      });

      if (conflict) {
        const error = new Error(
          `Another budget for category '${targetCategory}' already exists for ${targetMonth}/${targetYear}.`
        );
        error.statusCode = HTTP_STATUS.CONFLICT;
        throw error;
      }
    }

    if (updateData.limit !== undefined) {
      budget.limit = updateData.limit;
    }

    await budget.save();
    return this.attachBudgetMetrics(userObjectId, budget);
  }

  /**
   * Delete a budget record
   */
  async deleteBudget(userId, budgetId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const budget = await Budget.findOneAndDelete({ _id: budgetId, user: userObjectId });
    if (!budget) {
      const error = new Error('Budget record not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    return budget;
  }
}

export const budgetService = new BudgetService();
export default budgetService;
