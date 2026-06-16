import { Router } from 'express';
import * as membershipController from './membership.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { renewMembershipSchema } from './membership.validator';

const router = Router();

// All membership routes require authentication
router.use(authenticate);

router.post('/renew', validate(renewMembershipSchema), membershipController.renewMembership);
router.get('/expiring', membershipController.getExpiringMemberships);

export default router;
