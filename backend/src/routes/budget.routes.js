import { Router } from 'express';
import {
  createBudget,
  getBudgets,
  getBudgetSummary,
  getBudgetById,
  updateBudget,
  deleteBudget,
} from '../controllers/budget.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../middlewares/validate.middleware.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  queryBudgetSchema,
} from '../validations/budget.validation.js';
import { objectIdParamSchema } from '../validations/params.validation.js';

const router = Router();

// Apply authentication middleware to all budget routes
router.use(authenticate);

// 1. Budget Summary (Must be mounted before /:id)
// GET /api/budgets/summary
router.get('/summary', validateQuery(queryBudgetSchema), getBudgetSummary);

// 2. Create Budget
// POST /api/budgets
router.post('/', validateBody(createBudgetSchema), createBudget);

// 3. List Budgets with pagination & filtering
// GET /api/budgets
router.get('/', validateQuery(queryBudgetSchema), getBudgets);

// 4. Get Single Budget
// GET /api/budgets/:id
router.get('/:id', validateParams(objectIdParamSchema), getBudgetById);

// 5. Update Budget
// PATCH /api/budgets/:id
router.patch(
  '/:id',
  validateParams(objectIdParamSchema),
  validateBody(updateBudgetSchema),
  updateBudget
);

// 6. Delete Budget
// DELETE /api/budgets/:id
router.delete('/:id', validateParams(objectIdParamSchema), deleteBudget);

export default router;
