import mongoose from 'mongoose';
import SavingsGoal from '../models/savingsGoal.model.js';
import SavingsContribution from '../models/savingsContribution.model.js';
import { SAVINGS_GOAL_STATUS, HTTP_STATUS } from '../constants/index.js';

class SavingsGoalService {
  /**
   * Helper to attach dynamic savings metrics calculated from contributions
   * @param {object} goal - SavingsGoal document or object
   * @returns {Promise<object>} Goal object with calculated savings metrics
   */
  async attachGoalMetrics(goal) {
    const rawGoal = goal.toObject ? goal.toObject() : goal;
    const goalId = rawGoal._id;

    // Aggregate contributions for this goal (source of truth)
    const aggResult = await SavingsContribution.aggregate([
      { $match: { goal: new mongoose.Types.ObjectId(goalId) } },
      { $group: { _id: null, totalSaved: { $sum: '$amount' }, contributionCount: { $sum: 1 } } },
    ]);

    const totalSaved = aggResult.length > 0 ? Math.round(aggResult[0].totalSaved * 100) / 100 : 0;
    const contributionCount = aggResult.length > 0 ? aggResult[0].contributionCount : 0;
    const targetAmount = rawGoal.targetAmount;

    const remainingAmount = Math.max(0, Math.round((targetAmount - totalSaved) * 100) / 100);
    const progressPercentage = targetAmount > 0
      ? Math.min(100, Math.round((totalSaved / targetAmount) * 100 * 100) / 100)
      : 0;
    const actualPercentage = targetAmount > 0
      ? Math.round((totalSaved / targetAmount) * 100 * 100) / 100
      : 0;

    const isCompleted = totalSaved >= targetAmount;

    // Time calculations
    const now = new Date();
    const deadline = new Date(rawGoal.deadline);
    const diffMs = deadline.getTime() - now.getTime();
    const isExpired = now > deadline && !isCompleted;
    const daysRemaining = isExpired ? 0 : Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // Status: COMPLETED, EXPIRED, or IN_PROGRESS
    let status = SAVINGS_GOAL_STATUS.IN_PROGRESS;
    if (isCompleted) {
      status = SAVINGS_GOAL_STATUS.COMPLETED;
    } else if (isExpired) {
      status = SAVINGS_GOAL_STATUS.EXPIRED;
    }

    /**
     * Required monthly savings calculation:
     * - If completed: 0
     * - If expired or 0 days remaining: remainingAmount (due immediately)
     * - Otherwise:
     *   We divide remaining target by remaining months (standard astronomical average: 30.4375 days/month).
     *   monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30.4375))
     *   requiredMonthlySavings = Math.round((remainingAmount / monthsRemaining) * 100) / 100
     */
    let monthsRemaining = 0;
    let requiredMonthlySavings = 0;

    if (isCompleted) {
      monthsRemaining = 0;
      requiredMonthlySavings = 0;
    } else if (isExpired || daysRemaining <= 0) {
      monthsRemaining = 0;
      requiredMonthlySavings = remainingAmount;
    } else {
      monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30.4375));
      requiredMonthlySavings = Math.round((remainingAmount / monthsRemaining) * 100) / 100;
    }

    return {
      ...rawGoal,
      totalSaved,
      remainingAmount,
      progressPercentage,
      actualPercentage,
      contributionCount,
      isCompleted,
      isExpired,
      daysRemaining,
      monthsRemaining,
      requiredMonthlySavings,
      status,
    };
  }

  /**
   * Create a new savings goal
   */
  async createGoal(userId, data) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const goal = new SavingsGoal({
      user: userObjectId,
      name: data.name.trim(),
      targetAmount: data.targetAmount,
      deadline: new Date(data.deadline),
      description: data.description ? data.description.trim() : '',
    });

    await goal.save();
    return this.attachGoalMetrics(goal);
  }

  /**
   * List savings goals for authenticated user with metrics
   */
  async getGoals(userId, query = {}) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { status, page = 1, limit = 10 } = query;

    const filter = { user: userObjectId };
    const skip = (page - 1) * limit;

    const [rawGoals, totalRecords] = await Promise.all([
      SavingsGoal.find(filter)
        .sort({ deadline: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SavingsGoal.countDocuments(filter),
    ]);

    // Attach real-time contribution metrics
    let items = await Promise.all(
      rawGoals.map((g) => this.attachGoalMetrics(g))
    );

    // Optional status filtering in-memory if requested (IN_PROGRESS, COMPLETED, EXPIRED)
    if (status) {
      const normalizedStatus = status.toUpperCase();
      items = items.filter((g) => g.status === normalizedStatus);
    }

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
   * Get single savings goal by ID with metrics and recent contribution history
   */
  async getGoalById(userId, goalId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const goal = await SavingsGoal.findOne({ _id: goalId, user: userObjectId });
    if (!goal) {
      const error = new Error('Savings goal not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const [enrichedGoal, recentContributions] = await Promise.all([
      this.attachGoalMetrics(goal),
      SavingsContribution.find({ goal: goalId, user: userObjectId })
        .sort({ date: -1, createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return {
      ...enrichedGoal,
      recentContributions,
    };
  }

  /**
   * Update an existing savings goal
   */
  async updateGoal(userId, goalId, updateData) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const goal = await SavingsGoal.findOne({ _id: goalId, user: userObjectId });
    if (!goal) {
      const error = new Error('Savings goal not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    if (updateData.name !== undefined) {
      goal.name = updateData.name.trim();
    }

    if (updateData.targetAmount !== undefined) {
      goal.targetAmount = updateData.targetAmount;
    }

    if (updateData.deadline !== undefined) {
      goal.deadline = new Date(updateData.deadline);
    }

    if (updateData.description !== undefined) {
      goal.description = updateData.description.trim();
    }

    await goal.save();
    return this.attachGoalMetrics(goal);
  }

  /**
   * Delete a savings goal and all associated contributions (cascade delete)
   */
  async deleteGoal(userId, goalId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const goal = await SavingsGoal.findOneAndDelete({ _id: goalId, user: userObjectId });
    if (!goal) {
      const error = new Error('Savings goal not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Cascade delete contributions
    await SavingsContribution.deleteMany({ goal: goalId, user: userObjectId });

    return goal;
  }

  /**
   * Record a new contribution towards a savings goal
   */
  async addContribution(userId, goalId, data) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Verify goal exists and user owns it
    const goal = await SavingsGoal.findOne({ _id: goalId, user: userObjectId });
    if (!goal) {
      const error = new Error('Savings goal not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // 2. Create contribution record
    const contribution = new SavingsContribution({
      goal: goal._id,
      user: userObjectId,
      amount: data.amount,
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description ? data.description.trim() : '',
    });

    await contribution.save();

    // 3. Return updated goal metrics and new contribution
    const updatedGoal = await this.attachGoalMetrics(goal);

    return {
      contribution,
      goal: updatedGoal,
    };
  }

  /**
   * Get paginated contribution history for a particular goal
   */
  async getContributions(userId, goalId, query = {}) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { page = 1, limit = 10 } = query;

    // Verify goal ownership
    const goal = await SavingsGoal.findOne({ _id: goalId, user: userObjectId });
    if (!goal) {
      const error = new Error('Savings goal not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const skip = (page - 1) * limit;

    const [items, totalRecords] = await Promise.all([
      SavingsContribution.find({ goal: goalId, user: userObjectId })
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SavingsContribution.countDocuments({ goal: goalId, user: userObjectId }),
    ]);

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
}

export const savingsGoalService = new SavingsGoalService();
export default savingsGoalService;
