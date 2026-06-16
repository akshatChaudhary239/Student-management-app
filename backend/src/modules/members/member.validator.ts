import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
    parentMobile: z.string().regex(/^[0-9]{10}$/, 'Parent mobile number must be exactly 10 digits').optional().nullable(),
    address: z.string().optional().nullable(),
    batch: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    resourceName: z.string().optional().nullable(),
    membershipStartDate: z.string().datetime().optional(),
    membershipEndDate: z.string().datetime().optional(),
    feeAmount: z.number().nonnegative().optional(),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits').optional(),
    parentMobile: z.string().regex(/^[0-9]{10}$/, 'Parent mobile number must be exactly 10 digits').optional().nullable(),
    address: z.string().optional().nullable(),
    batch: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'EXPIRED', 'LEFT']).optional(),
  }),
});
