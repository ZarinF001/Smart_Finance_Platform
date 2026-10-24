import { Router } from 'express';
import { getTransactions } from '../controllers/transaction.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateQuery } from '../middlewares/validate.middleware.js';
import { transactionQuerySchema } from '../validations/transaction.validation.js';

const router = Router();

// GET /api/transactions
router.get(
  '/',
  authenticate,
  validateQuery(transactionQuerySchema),
  getTransactions
);

export default router;
