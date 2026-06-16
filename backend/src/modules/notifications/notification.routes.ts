import { Router } from 'express';
import * as notificationController from './notification.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { saveTokenSchema } from './notification.validator';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.post('/token', validate(saveTokenSchema), notificationController.saveToken);
router.get('/', notificationController.getNotifications);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

export default router;
