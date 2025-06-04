import { Router } from 'express';
import { authenticate, checkNotBlocked } from '@/middleware/auth';
import validate from '@/middleware/validate';
import { userIdSchema } from '@/validators/users.validator';
import {
  getUsers,
  deleteUser,
  blockUser,
  unblockUser,
} from '@/controllers/users.controller';

const router = Router();

router.get('/', authenticate, checkNotBlocked, getUsers);
router.delete(
  '/:id',
  authenticate,
  checkNotBlocked,
  validate(userIdSchema, 'params'),
  deleteUser,
);
router.post(
  '/:id/block',
  authenticate,
  checkNotBlocked,
  validate(userIdSchema, 'params'),
  blockUser,
);
router.post(
  '/:id/unblock',
  authenticate,
  checkNotBlocked,
  validate(userIdSchema, 'params'),
  unblockUser,
);

export default router;
