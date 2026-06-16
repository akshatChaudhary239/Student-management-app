import { Router } from 'express';
import * as subscriptionController from './subscription.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

// Only OWNER or ADMIN can view/manage subscriptions
router.get('/current', requireRole(['OWNER', 'ADMIN']), subscriptionController.getCurrentSubscription);

export default router;
