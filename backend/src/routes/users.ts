import { Router } from 'express';
import prisma from '@/utils/prisma';
import { authenticate, checkNotBlocked, AuthRequest } from '@/middleware/auth';

const router = Router();

router.get('/', authenticate, checkNotBlocked, async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.delete(
  '/:id',
  authenticate,
  checkNotBlocked,
  async (req: AuthRequest, res) => {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });
      res.json({ message: 'User deleted successfully' });
    } catch {
      res.status(404).json({ error: 'User not found' });
    }
  },
);

router.post('/:id/block', authenticate, checkNotBlocked, async (req, res) => {
  try {
    const target = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (target.isBlocked) {
      return res.status(400).json({ error: 'User already blocked' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBlocked: true },
    });
    res.json({ message: 'User blocked successfully', user });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/unblock', authenticate, checkNotBlocked, async (req, res) => {
  try {
    const target = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!target.isBlocked) {
      return res.status(400).json({ error: 'User is not blocked' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBlocked: false },
    });
    res.json({ message: 'User unblocked successfully', user });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
