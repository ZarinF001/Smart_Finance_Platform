import mongoose from 'mongoose';
import Income from '../models/income.model.js';
import Expense from '../models/expense.model.js';
import { TRANSACTION_TYPES } from '../constants/index.js';

class TransactionService {
  /**
   * Get combined, filtered, and paginated transaction history for the authenticated user
   */
  async getTransactions(userId, query = {}) {
    const {
      type = 'ALL',
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const normalizedType = type.toUpperCase();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Build common filter for income/expense
    const buildFilter = () => {
      const filter = { user: userObjectId };

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

      return filter;
    };

    const filter = buildFilter();
    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // 1. If only INCOME requested
    if (normalizedType === TRANSACTION_TYPES.INCOME) {
      const [rawItems, totalRecords, summaryAgg] = await Promise.all([
        Income.find(filter)
          .sort({ [sortBy]: sortDirection })
          .skip(skip)
          .limit(limit)
          .lean(),
        Income.countDocuments(filter),
        Income.aggregate([
          { $match: filter },
          { $group: { _id: null, totalIncome: { $sum: '$amount' } } },
        ]),
      ]);

      const items = rawItems.map((item) => ({
        ...item,
        type: TRANSACTION_TYPES.INCOME,
      }));

      const totalIncome = summaryAgg.length > 0 ? summaryAgg[0].totalIncome : 0;
      const totalPages = Math.ceil(totalRecords / limit) || 1;

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
            totalIncome: Math.round(totalIncome * 100) / 100,
            totalExpense: 0,
            netBalance: Math.round(totalIncome * 100) / 100,
          },
        },
      };
    }

    // 2. If only EXPENSE requested
    if (normalizedType === TRANSACTION_TYPES.EXPENSE) {
      const [rawItems, totalRecords, summaryAgg] = await Promise.all([
        Expense.find(filter)
          .sort({ [sortBy]: sortDirection })
          .skip(skip)
          .limit(limit)
          .lean(),
        Expense.countDocuments(filter),
        Expense.aggregate([
          { $match: filter },
          { $group: { _id: null, totalExpense: { $sum: '$amount' } } },
        ]),
      ]);

      const items = rawItems.map((item) => ({
        ...item,
        type: TRANSACTION_TYPES.EXPENSE,
      }));

      const totalExpense = summaryAgg.length > 0 ? summaryAgg[0].totalExpense : 0;
      const totalPages = Math.ceil(totalRecords / limit) || 1;

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
            totalIncome: 0,
            totalExpense: Math.round(totalExpense * 100) / 100,
            netBalance: Math.round(-totalExpense * 100) / 100,
          },
        },
      };
    }

    // 3. Combined 'ALL' query using aggregation pipeline
    try {
      const pipeline = [
        { $match: filter },
        { $addFields: { type: TRANSACTION_TYPES.INCOME } },
        {
          $unionWith: {
            coll: 'expenses',
            pipeline: [
              { $match: filter },
              { $addFields: { type: TRANSACTION_TYPES.EXPENSE } },
            ],
          },
        },
        { $sort: { [sortBy]: sortDirection } },
        {
          $facet: {
            metadata: [
              {
                $group: {
                  _id: null,
                  totalRecords: { $sum: 1 },
                  totalIncome: {
                    $sum: {
                      $cond: [
                        { $eq: ['$type', TRANSACTION_TYPES.INCOME] },
                        '$amount',
                        0,
                      ],
                    },
                  },
                  totalExpense: {
                    $sum: {
                      $cond: [
                        { $eq: ['$type', TRANSACTION_TYPES.EXPENSE] },
                        '$amount',
                        0,
                      ],
                    },
                  },
                },
              },
            ],
            items: [{ $skip: skip }, { $limit: limit }],
          },
        },
      ];

      const [result] = await Income.aggregate(pipeline);

      const metaGroup = result?.metadata?.[0] || {
        totalRecords: 0,
        totalIncome: 0,
        totalExpense: 0,
      };

      const totalRecords = metaGroup.totalRecords || 0;
      const totalIncome = Math.round((metaGroup.totalIncome || 0) * 100) / 100;
      const totalExpense = Math.round((metaGroup.totalExpense || 0) * 100) / 100;
      const netBalance = Math.round((totalIncome - totalExpense) * 100) / 100;
      const totalPages = Math.ceil(totalRecords / limit) || 1;

      return {
        items: result?.items || [],
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
            totalIncome,
            totalExpense,
            netBalance,
          },
        },
      };
    } catch (aggError) {
      // Fallback in-memory combination if aggregation pipeline has collection mapping issues
      const [incomes, expenses] = await Promise.all([
        Income.find(filter).lean(),
        Expense.find(filter).lean(),
      ]);

      const taggedIncomes = incomes.map((i) => ({ ...i, type: TRANSACTION_TYPES.INCOME }));
      const taggedExpenses = expenses.map((e) => ({ ...e, type: TRANSACTION_TYPES.EXPENSE }));
      const combined = [...taggedIncomes, ...taggedExpenses];

      // Sort
      combined.sort((a, b) => {
        if (sortBy === 'amount') {
          return sortDirection === 1 ? a.amount - b.amount : b.amount - a.amount;
        }
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === 1 ? dateA - dateB : dateB - dateA;
      });

      const totalRecords = combined.length;
      const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
      const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
      const netBalance = totalIncome - totalExpense;
      const totalPages = Math.ceil(totalRecords / limit) || 1;
      const pagedItems = combined.slice(skip, skip + limit);

      return {
        items: pagedItems,
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
            totalIncome: Math.round(totalIncome * 100) / 100,
            totalExpense: Math.round(totalExpense * 100) / 100,
            netBalance: Math.round(netBalance * 100) / 100,
          },
        },
      };
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;
