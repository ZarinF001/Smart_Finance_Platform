import { z } from 'zod';

/**
 * Validation schema for creating a savings goal
 * POST /api/savings-goals
 */
export const createSavingsGoalSchema = z.object({
  name: z
    .string({ required_error: 'Savings goal name is required' })
    .trim()
    .min(1, 'Goal name cannot be empty')
    .max(100, 'Goal name cannot exceed 100 characters'),
  targetAmount: z
    .number({
      required_error: 'Target amount is required',
      invalid_type_error: 'Target amount must be a number',
    })
    .positive('Target amount must be greater than zero')
    .max(1000000000, 'Target amount cannot exceed 1,000,000,000'),
  deadline: z
    .string({ required_error: 'Goal deadline date is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Deadline must be a valid date (YYYY-MM-DD or ISO 8601)',
    }),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .default(''),
});

/**
 * Validation schema for updating a savings goal
 * PATCH /api/savings-goals/:id
 */
export const updateSavingsGoalSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Goal name cannot be empty')
      .max(100, 'Goal name cannot exceed 100 characters')
      .optional(),
    targetAmount: z
      .number({ invalid_type_error: 'Target amount must be a number' })
      .positive('Target amount must be greater than zero')
      .max(1000000000, 'Target amount cannot exceed 1,000,000,000')
      .optional(),
    deadline: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Deadline must be a valid date',
      })
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    'At least one field must be provided for update'
  );

/**
 * Validation schema for adding a contribution to a savings goal
 * POST /api/savings-goals/:id/contributions
 */
export const createContributionSchema = z.object({
  amount: z
    .number({
      required_error: 'Contribution amount is required',
      invalid_type_error: 'Contribution amount must be a number',
    })
    .positive('Contribution amount must be greater than zero')
    .max(1000000000, 'Contribution amount cannot exceed 1,000,000,000'),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Contribution date must be a valid date',
    })
    .optional(),
  description: z
    .string()
    .trim()
    .max(250, 'Description cannot exceed 250 characters')
    .optional()
    .default(''),
});

/**
 * Validation schema for listing contributions of a goal
 * GET /api/savings-goals/:id/contributions
 */
export const queryContributionSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n >= 1, 'Page must be >= 1')
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n >= 1 && n <= 100, 'Limit must be between 1 and 100')
    .optional()
    .default('10'),
});
