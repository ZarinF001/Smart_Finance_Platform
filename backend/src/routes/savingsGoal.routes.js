import { Router } from 'express';
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addContribution,
  getContributions,
} from '../controllers/savingsGoal.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../middlewares/validate.middleware.js';
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  createContributionSchema,
  queryContributionSchema,
} from '../validations/savingsGoal.validation.js';
import { objectIdParamSchema } from '../validations/params.validation.js';

const router = Router();

// Apply authentication middleware to all savings goal routes
router.use(authenticate);

// 1. Create Savings Goal
// POST /api/savings-goals
router.post('/', validateBody(createSavingsGoalSchema), createGoal);

// 2. List Savings Goals
// GET /api/savings-goals
router.get('/', getGoals);

// 3. Get Single Goal Details
// GET /api/savings-goals/:id
router.get('/:id', validateParams(objectIdParamSchema), getGoalById);

// 4. Update Savings Goal
// PATCH /api/savings-goals/:id
router.patch(
  '/:id',
  validateParams(objectIdParamSchema),
  validateBody(updateSavingsGoalSchema),
  updateGoal
);

// 5. Delete Savings Goal
// DELETE /api/savings-goals/:id
router.delete('/:id', validateParams(objectIdParamSchema), deleteGoal);

// 6. Record Contribution towards Goal
// POST /api/savings-goals/:id/contributions
router.post(
  '/:id/contributions',
  validateParams(objectIdParamSchema),
  validateBody(createContributionSchema),
  addContribution
);

// 7. List Contributions History for Goal
// GET /api/savings-goals/:id/contributions
router.get(
  '/:id/contributions',
  validateParams(objectIdParamSchema),
  validateQuery(queryContributionSchema),
  getContributions
);

export default router;
