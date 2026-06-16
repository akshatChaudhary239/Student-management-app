import { z } from 'zod';

export const renewMembershipSchema = z.object({
  body: z.object({
    memberId: z.string().uuid('Invalid member ID'),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    feeAmount: z.number().nonnegative(),
  }),
});
