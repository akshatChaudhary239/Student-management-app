import { Router } from 'express';
import * as studentController from './member.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createStudentSchema, updateStudentSchema } from './member.validator';

const router = Router();

// All member routes require authentication
router.use(authenticate);

router.post('/', validate(createStudentSchema), studentController.createStudent);
router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudentById);
router.put('/:id', validate(updateStudentSchema), studentController.updateStudent);
router.post('/:id/renew', studentController.renewStudent);
router.post('/:id/cancel', studentController.cancelStudent);
router.delete('/:id', studentController.deleteStudent);

export default router;
