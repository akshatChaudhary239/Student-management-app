import { Router } from 'express';
import * as activityController from './activity.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// All activity routes require authentication
router.use(authenticate);

router.get('/', activityController.getActivities);

export default router;
