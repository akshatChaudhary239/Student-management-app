import { Router } from 'express';
import * as importController from './import.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

// All import routes require authentication
router.use(authenticate);

router.post('/members', upload.single('file'), importController.importStudentsData);

export default router;
