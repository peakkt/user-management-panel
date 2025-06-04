import { Request, Response } from 'express';
import prisma from '@/utils/prisma';
import { AuthRequest } from '@/middleware/auth';

export async function getUsers(_req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany();
  res.json(users);
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
}

export async function blockUser(req: Request, res: Response) {
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
}

export async function unblockUser(req: Request, res: Response) {
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
}
