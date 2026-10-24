import { Router } from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../middlewares/validate.middleware.js';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
} from '../validations/expense.validation.js';
import { objectIdParamSchema } from '../validations/params.validation.js';

const router = Router();

// All expense routes require authentication
router.use(authenticate);

// POST /api/expenses
router.post('/', validateBody(createExpenseSchema), createExpense);

// GET /api/expenses
router.get('/', validateQuery(expenseQuerySchema), getExpenses);

// GET /api/expenses/:id
router.get('/:id', validateParams(objectIdParamSchema), getExpenseById);

// PUT /api/expenses/:id
router.put(
  '/:id',
  validateParams(objectIdParamSchema),
  validateBody(updateExpenseSchema),
  updateExpense
);

// PATCH /api/expenses/:id
router.patch(
  '/:id',
  validateParams(objectIdParamSchema),
  validateBody(updateExpenseSchema),
  updateExpense
);

// DELETE /api/expenses/:id
router.delete('/:id', validateParams(objectIdParamSchema), deleteExpense);

export default router;
