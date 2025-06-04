import { Request, Response, NextFunction } from 'express';
import prisma from '@/utils/prisma';

function withoutPassword<T extends { password?: unknown }>(
  user: T,
): Omit<T, 'password'> {
  const { password, ...rest } = user;
  return rest;
}
import { AuthRequest } from '@/middleware/auth';
import { HttpError } from '@/middleware/errorHandler';

export async function getUsers(_req: AuthRequest, res: Response) {
  const users = (await prisma.user.findMany()) as Array<{ password?: unknown }>;
  res.json(users.map((u) => withoutPassword(u)));
}

export async function deleteUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch {
    next(new HttpError(404, 'User not found'));
  }
}

export async function blockUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const target = (await prisma.user.findUnique({
      where: { id: req.params.id },
    })) as { isBlocked: boolean } | null;
    if (!target) {
      return next(new HttpError(404, 'User not found'));
    }
    if (target.isBlocked) {
      return next(new HttpError(400, 'User already blocked'));
    }
    const user = (await prisma.user.update({
      where: { id: req.params.id },
      data: { isBlocked: true },
    })) as { password?: unknown };
    res.json({
      message: 'User blocked successfully',
      user: withoutPassword(user),
    });
  } catch {
    next(new HttpError(500, 'Internal server error'));
  }
}

export async function unblockUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const target = (await prisma.user.findUnique({
      where: { id: req.params.id },
    })) as { isBlocked: boolean } | null;
    if (!target) {
      return next(new HttpError(404, 'User not found'));
    }
    if (!target.isBlocked) {
      return next(new HttpError(400, 'User is not blocked'));
    }
    const user = (await prisma.user.update({
      where: { id: req.params.id },
      data: { isBlocked: false },
    })) as { password?: unknown };
    res.json({
      message: 'User unblocked successfully',
      user: withoutPassword(user),
    });
  } catch {
    next(new HttpError(500, 'Internal server error'));
  }
}
