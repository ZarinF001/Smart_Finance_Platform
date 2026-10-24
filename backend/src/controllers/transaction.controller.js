import transactionService from '../services/transaction.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Get combined transaction history (incomes and expenses)
 * GET /api/transactions
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { items, meta } = await transactionService.getTransactions(
      req.user._id,
      req.query
    );

    return successResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Transactions retrieved successfully',
      data: items,
      meta,
    });
  } catch (error) {
    next(error);
  }
};
