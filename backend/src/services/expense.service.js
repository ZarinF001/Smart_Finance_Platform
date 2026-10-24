import Expense from '../models/expense.model.js';
import categoryService from './category.service.js';
import { TRANSACTION_TYPES, HTTP_STATUS } from '../constants/index.js';

class ExpenseService {
  /**
   * Create a new expense record for an authenticated user
   */
  async createExpense(userId, data) {
    // 1. Validate that category exists and matches EXPENSE type
    const validatedCategory = await categoryService.validateCategory(
      data.category,
      TRANSACTION_TYPES.EXPENSE
    );

    // 2. Explicitly extract permitted fields (prevent mass assignment)
    const expenseData = {
      user: userId,
      amount: data.amount,
      category: validatedCategory,
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description ? data.description.trim() : '',
      paymentMethod: data.paymentMethod || 'cash',
    };

    const expense = new Expense(expenseData);
    return expense.save();
  }

  /**
   * Get paginated list of expenses for an authenticated user with filtering
   */
  async getExpenses(userId, query = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      paymentMethod,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    // Build filter
    const filter = { user: userId };

    if (category) {
      filter.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod.trim().toLowerCase();
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        if (endDate.length <= 10) {
          end.setHours(23, 59, 59, 999);
        }
        filter.date.$lte = end;
      }
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      filter.amount = {};
      if (minAmount !== undefined) filter.amount.$gte = minAmount;
      if (maxAmount !== undefined) filter.amount.$lte = maxAmount;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ description: searchRegex }, { category: searchRegex }];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute queries in parallel
    const [items, totalRecords, summaryAgg] = await Promise.all([
      Expense.find(filter).sort(sort).skip(skip).limit(limit),
      Expense.countDocuments(filter),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const totalAmount = summaryAgg.length > 0 ? summaryAgg[0].totalAmount : 0;

    return {
      items,
      meta: {
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        summary: {
          totalExpense: Math.round(totalAmount * 100) / 100,
        },
      },
    };
  }

  /**
   * Get single expense record by ID for authenticated user
   */
  async getExpenseById(userId, expenseId) {
    const expense = await Expense.findOne({ _id: expenseId, user: userId });
    if (!expense) {
      const error = new Error('Expense record not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    return expense;
  }

  /**
   * Update an existing expense record (ensures user ownership)
   */
  async updateExpense(userId, expenseId, updateData) {
    const expense = await Expense.findOne({ _id: expenseId, user: userId });
    if (!expense) {
      const error = new Error('Expense record not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    if (updateData.category) {
      expense.category = await categoryService.validateCategory(
        updateData.category,
        TRANSACTION_TYPES.EXPENSE
      );
    }

    if (updateData.amount !== undefined) {
      expense.amount = updateData.amount;
    }

    if (updateData.date !== undefined) {
      expense.date = new Date(updateData.date);
    }

    if (updateData.description !== undefined) {
      expense.description = updateData.description.trim();
    }

    if (updateData.paymentMethod !== undefined) {
      expense.paymentMethod = updateData.paymentMethod;
    }

    return expense.save();
  }

  /**
   * Delete an expense record (ensures user ownership)
   */
  async deleteExpense(userId, expenseId) {
    const expense = await Expense.findOneAndDelete({ _id: expenseId, user: userId });
    if (!expense) {
      const error = new Error('Expense record not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    return expense;
  }
}

export const expenseService = new ExpenseService();
export default expenseService;
