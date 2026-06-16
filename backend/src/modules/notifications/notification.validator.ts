import { z } from 'zod';

export const saveTokenSchema = z.object({
  body: z.object({
    pushToken: z.string().min(1, 'Push token is required'),
  }),
});
