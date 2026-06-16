import { Router } from 'express';
import * as dashboardController from './dashboard.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/metrics', dashboardController.getMetrics);

export default router;
