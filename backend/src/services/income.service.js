import Income from '../models/income.model.js';
import categoryService from './category.service.js';
import { TRANSACTION_TYPES, HTTP_STATUS } from '../constants/index.js';

class IncomeService {
  /**
   * Create a new income record for an authenticated user
   */
  async createIncome(userId, data) {
    // 1. Validate that category exists and matches INCOME type
    const validatedCategory = await categoryService.validateCategory(
      data.category,
      TRANSACTION_TYPES.INCOME
    );

    // 2. Explicitly extract permitted fields (prevent mass assignment)
    const incomeData = {
      user: userId,
      amount: data.amount,
      category: validatedCategory,
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description ? data.description.trim() : '',
    };

    const income = new Income(incomeData);
    return income.save();
  }

  /**
   * Get paginated list of incomes for an authenticated user with filtering
   */
  async getIncomes(userId, query = {}) {
    const {
      page = 1,
      limit = 10,
      category,
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

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        // Include full day if only YYYY-MM-DD passed
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

    // Execute queries in parallel: items, total count, and total sum
    const [items, totalRecords, summaryAgg] = await Promise.all([
      Income.find(filter).sort(sort).skip(skip).limit(limit),
      Income.countDocuments(filter),
      Income.aggregate([
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
          totalIncome: Math.round(totalAmount * 100) / 100,
        },
      },
    };
  }

  /**
   * Get single income record by ID for authenticated user
   */
  async getIncomeById(userId, incomeId) {
    const income = await Income.findOne({ _id: incomeId, user: userId });
    if (!income) {
      const error = new Error('Income record not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    return income;
  }

  /**
   * Update an existing income record (ensures user ownership)
   */
  async updateIncome(userId, incomeId, updateData) {
    const income = await Income.findOne({ _id: incomeId, user: userId });
    if (!income) {
      const error = new Error('Income record not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // If category is being updated, validate it
    if (updateData.category) {
      income.category = await categoryService.validateCategory(
        updateData.category,
        TRANSACTION_TYPES.INCOME
      );
    }

    if (updateData.amount !== undefined) {
      income.amount = updateData.amount;
    }

    if (updateData.date !== undefined) {
      income.date = new Date(updateData.date);
    }

    if (updateData.description !== undefined) {
      income.description = updateData.description.trim();
    }

    return income.save();
  }

  /**
   * Delete an income record (ensures user ownership)
   */
  async deleteIncome(userId, incomeId) {
    const income = await Income.findOneAndDelete({ _id: incomeId, user: userId });
    if (!income) {
      const error = new Error('Income record not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    return income;
  }
}

export const incomeService = new IncomeService();
export default incomeService;
