import { z } from 'zod';

export const createIncomeSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required' })
    .finite('Amount must be a finite number')
    .positive('Amount must be greater than zero'),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category cannot be empty')
    .max(50, 'Category cannot exceed 50 characters'),
  date: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Transaction date must be a valid date'
    ),
  description: z
    .string()
    .trim()
    .max(250, 'Description cannot exceed 250 characters')
    .optional(),
});

export const updateIncomeSchema = z
  .object({
    amount: z
      .number()
      .finite('Amount must be a finite number')
      .positive('Amount must be greater than zero')
      .optional(),
    category: z
      .string()
      .trim()
      .min(1, 'Category cannot be empty')
      .max(50, 'Category cannot exceed 50 characters')
      .optional(),
    date: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        'Transaction date must be a valid date'
      ),
    description: z
      .string()
      .trim()
      .max(250, 'Description cannot exceed 250 characters')
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    'At least one field must be provided for update'
  );

export const incomeQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1, 'Page must be an integer >= 1'),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine(
      (val) => !isNaN(val) && val >= 1 && val <= 100,
      'Limit must be an integer between 1 and 100'
    ),
  category: z.string().trim().optional(),
  startDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'startDate must be a valid date string'
    ),
  endDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'endDate must be a valid date string'
    ),
  minAmount: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine(
      (val) => val === undefined || (!isNaN(val) && val >= 0),
      'minAmount must be a valid number >= 0'
    ),
  maxAmount: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine(
      (val) => val === undefined || (!isNaN(val) && val >= 0),
      'maxAmount must be a valid number >= 0'
    ),
  search: z.string().trim().optional(),
  sortBy: z.enum(['date', 'amount']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
