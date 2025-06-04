import express from 'express';
import dotenv from 'dotenv';
import prisma from './prisma';
import {
  authenticate,
  generateToken,
  hashPassword,
  comparePassword,
  AuthRequest,
  checkNotBlocked,
} from './auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  try {
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });
    const token = generateToken(user.id);
    res.json({ token });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
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
  res.json({ token });
});

app.get('/users', authenticate, checkNotBlocked, async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.delete(
  '/users/:id',
  authenticate,
  checkNotBlocked,
  async (req: AuthRequest, res) => {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });
      res.sendStatus(204);
    } catch {
      res.status(404).json({ error: 'User not found' });
    }
  },
);

app.post(
  '/users/:id/block',
  authenticate,
  checkNotBlocked,
  async (req, res) => {
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
      res.json(user);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

app.post(
  '/users/:id/unblock',
  authenticate,
  checkNotBlocked,
  async (req, res) => {
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
      res.json(user);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
