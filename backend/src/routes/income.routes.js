import { Router } from 'express';
import {
  createIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
} from '../controllers/income.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../middlewares/validate.middleware.js';
import {
  createIncomeSchema,
  updateIncomeSchema,
  incomeQuerySchema,
} from '../validations/income.validation.js';
import { objectIdParamSchema } from '../validations/params.validation.js';

const router = Router();

// All income routes require authentication
router.use(authenticate);

// POST /api/incomes
router.post('/', validateBody(createIncomeSchema), createIncome);

// GET /api/incomes
router.get('/', validateQuery(incomeQuerySchema), getIncomes);

// GET /api/incomes/:id
router.get('/:id', validateParams(objectIdParamSchema), getIncomeById);

// PUT /api/incomes/:id
router.put(
  '/:id',
  validateParams(objectIdParamSchema),
  validateBody(updateIncomeSchema),
  updateIncome
);

// PATCH /api/incomes/:id
router.patch(
  '/:id',
  validateParams(objectIdParamSchema),
  validateBody(updateIncomeSchema),
  updateIncome
);

// DELETE /api/incomes/:id
router.delete('/:id', validateParams(objectIdParamSchema), deleteIncome);

export default router;
