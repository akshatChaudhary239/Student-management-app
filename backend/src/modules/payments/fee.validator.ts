import { z } from 'zod';

export const recordFeeSchema = z.object({
  body: z.object({
    memberId: z.string().uuid('Invalid member ID'),
    amount: z.number().positive('Fee amount must be positive'),
    paymentDate: z.string().datetime().optional(),
    paymentMethod: z.enum(['CASH', 'UPI', 'BANK', 'OTHER']),
  }),
});
