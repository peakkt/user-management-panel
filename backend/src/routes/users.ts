import { Router } from 'express';
import { authenticate, checkNotBlocked } from '@/middleware/auth';
import {
  getUsers,
  deleteUser,
  blockUser,
  unblockUser,
} from '@/controllers/users.controller';

const router = Router();

router.get('/', authenticate, checkNotBlocked, getUsers);
router.delete('/:id', authenticate, checkNotBlocked, deleteUser);
router.post('/:id/block', authenticate, checkNotBlocked, blockUser);
router.post('/:id/unblock', authenticate, checkNotBlocked, unblockUser);

export default router;
