import { z } from 'zod';

export const transactionQuerySchema = z.object({
  type: z
    .enum(['INCOME', 'EXPENSE', 'ALL', 'income', 'expense', 'all'])
    .optional()
    .default('ALL')
    .transform((val) => val.toUpperCase()),
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
});
