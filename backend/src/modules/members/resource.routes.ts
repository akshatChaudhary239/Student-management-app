import { Router } from 'express';
import * as seatController from './resource.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { assignSeatSchema, unassignSeatSchema } from './resource.validator';

const router = Router();

// All resource routes require authentication
router.use(authenticate);

router.get('/', seatController.getSeats);
router.post('/assign', validate(assignSeatSchema), seatController.assignSeat);
router.post('/unassign', validate(unassignSeatSchema), seatController.unassignSeat);

export default router;
