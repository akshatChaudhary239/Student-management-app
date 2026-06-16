import { z } from 'zod';

export const assignSeatSchema = z.object({
  body: z.object({
    memberId: z.string().uuid('Invalid member ID'),
    resourceName: z.string().min(1, 'Resource number is required'),
  }),
});

export const unassignSeatSchema = z.object({
  body: z.object({
    memberId: z.string().uuid('Invalid member ID'),
  }),
});
