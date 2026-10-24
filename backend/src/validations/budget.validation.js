import { z } from 'zod';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

/**
 * Validation schema for creating a monthly budget
 * POST /api/budgets
 */
export const createBudgetSchema = z.object({
  category: z
    .string({ required_error: 'Expense category is required' })
    .trim()
    .min(1, 'Category name cannot be empty')
    .max(50, 'Category cannot exceed 50 characters'),
  limit: z
    .number({
      required_error: 'Monthly spending limit is required',
      invalid_type_error: 'Spending limit must be a valid number',
    })
    .positive('Spending limit must be greater than zero')
    .max(1000000000, 'Spending limit cannot exceed 1,000,000,000'),
  month: z
    .number({
      required_error: 'Budget month is required',
      invalid_type_error: 'Month must be an integer between 1 and 12',
    })
    .int('Month must be an integer')
    .min(1, 'Month must be between 1 and 12')
    .max(12, 'Month must be between 1 and 12')
    .default(currentMonth),
  year: z
    .number({
      required_error: 'Budget year is required',
      invalid_type_error: 'Year must be a valid year',
    })
    .int('Year must be an integer')
    .min(2000, 'Year must be 2000 or later')
    .max(2100, 'Year must be 2100 or earlier')
    .default(currentYear),
});

/**
 * Validation schema for updating a monthly budget
 * PATCH /api/budgets/:id
 */
export const updateBudgetSchema = z
  .object({
    category: z
      .string()
      .trim()
      .min(1, 'Category cannot be empty')
      .max(50, 'Category cannot exceed 50 characters')
      .optional(),
    limit: z
      .number({ invalid_type_error: 'Spending limit must be a number' })
      .positive('Spending limit must be greater than zero')
      .max(1000000000, 'Spending limit cannot exceed 1,000,000,000')
      .optional(),
    month: z
      .number({ invalid_type_error: 'Month must be an integer' })
      .int()
      .min(1, 'Month must be between 1 and 12')
      .max(12, 'Month must be between 1 and 12')
      .optional(),
    year: z
      .number({ invalid_type_error: 'Year must be an integer' })
      .int()
      .min(2000, 'Year must be 2000 or later')
      .max(2100, 'Year must be 2100 or earlier')
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    'At least one field must be provided for update'
  );

/**
 * Validation schema for query parameters when listing budgets
 * GET /api/budgets and GET /api/budgets/summary
 */
export const queryBudgetSchema = z.object({
  month: z
    .string()
    .regex(/^(1[0-2]|[1-9])$/, 'Month must be between 1 and 12')
    .transform(Number)
    .optional(),
  year: z
    .string()
    .regex(/^\d{4}$/, 'Year must be a 4-digit number')
    .transform(Number)
    .optional(),
  category: z.string().trim().optional(),
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
