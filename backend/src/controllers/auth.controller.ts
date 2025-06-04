import { Request, Response, NextFunction } from 'express';
import prisma from '@/utils/prisma';
import {
  generateToken,
  hashPassword,
  comparePassword,
} from '@/middleware/auth';
import { HttpError } from '@/middleware/errorHandler';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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
      return next(new HttpError(409, 'Email already registered'));
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return next(new HttpError(401, 'Invalid email or password'));
  }
  if (user.isBlocked) {
    return next(new HttpError(403, 'User is blocked'));
  }
  const match = await comparePassword(password, user.password);
  if (!match) {
    return next(new HttpError(401, 'Invalid email or password'));
  }
  const token = generateToken(user.id);
  res.json({ message: 'Login successful', token });
}
