import { z } from 'zod';

export const objectIdParamSchema = z.object({
  id: z
    .string({ required_error: 'Resource ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid resource identifier format'),
});
