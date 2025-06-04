import { Router } from 'express';
import prisma from '@/utils/prisma';
import {
  generateToken,
  hashPassword,
  comparePassword,
} from '@/middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  try {
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });
    const token = generateToken(user.id);
    res.json({ message: 'Registration successful', token });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (user.isBlocked) {
    return res.status(403).json({ error: 'User is blocked' });
  }
  const match = await comparePassword(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = generateToken(user.id);
  res.json({ message: 'Login successful', token });
});

export default router;
