import { Router } from 'express';
import * as feeController from './fee.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { recordFeeSchema } from './fee.validator';

const router = Router();

// All fee routes require authentication
router.use(authenticate);

router.post('/', validate(recordFeeSchema), feeController.recordFee);
router.get('/member/:memberId', feeController.getStudentFeeHistory);
router.get('/', feeController.getAllFees);

export default router;
