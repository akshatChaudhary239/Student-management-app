import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    libraryName: z.string().min(2, 'Organization name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    address: z.string().optional(),
    totalResources: z.number().int().min(0, 'Total resources must be 0 or more'),
    nicheType: z.enum(['LIBRARY', 'GYM', 'COACHING', 'TUITION', 'DANCE', 'YOGA', 'TRAINING', 'STUDY']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});
