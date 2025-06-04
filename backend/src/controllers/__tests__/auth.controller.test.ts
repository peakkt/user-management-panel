import { register, login } from '../auth.controller';
import prisma from '@/utils/prisma';
import * as auth from '@/middleware/auth';
import { HttpError } from '@/middleware/errorHandler';

jest.mock('@/utils/prisma');

describe('auth.controller', () => {
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('registers a user', async () => {
      const req = { body: { email: 'a@test.com', password: 'pass' } } as any;
      jest.spyOn(auth, 'hashPassword').mockResolvedValue('hashed');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'a@test.com',
      });
      jest.spyOn(auth, 'generateToken').mockReturnValue('token');

      await register(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Registration successful',
        token: 'token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('handles duplicate email', async () => {
      const req = { body: { email: 'a@test.com', password: 'pass' } } as any;
      jest.spyOn(auth, 'hashPassword').mockResolvedValue('hashed');
      (prisma.user.create as jest.Mock).mockRejectedValue({ code: 'P2002' });

      await register(req, res, next);

      const err = (next as jest.Mock).mock.calls[0][0] as HttpError;
      expect(err.status).toBe(409);
    });
  });

  describe('login', () => {
    it('logs in a user', async () => {
      const req = { body: { email: 'a@test.com', password: 'pass' } } as any;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        password: 'hash',
        isBlocked: false,
      });
      jest.spyOn(auth, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(auth, 'generateToken').mockReturnValue('token');

      await login(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'token',
      });
    });

    it('fails when user not found', async () => {
      const req = { body: { email: 'a@test.com', password: 'pass' } } as any;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await login(req, res, next);

      const err = (next as jest.Mock).mock.calls[0][0] as HttpError;
      expect(err.status).toBe(401);
    });

    it('fails when user blocked', async () => {
      const req = { body: { email: 'a@test.com', password: 'pass' } } as any;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        password: 'hash',
        isBlocked: true,
      });

      await login(req, res, next);

      const err = (next as jest.Mock).mock.calls[0][0] as HttpError;
      expect(err.status).toBe(403);
    });

    it('fails on password mismatch', async () => {
      const req = { body: { email: 'a@test.com', password: 'pass' } } as any;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        password: 'hash',
        isBlocked: false,
      });
      jest.spyOn(auth, 'comparePassword').mockResolvedValue(false);

      await login(req, res, next);

      const err = (next as jest.Mock).mock.calls[0][0] as HttpError;
      expect(err.status).toBe(401);
    });
  });
});
