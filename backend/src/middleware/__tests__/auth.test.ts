import { authenticate, checkNotBlocked } from '../auth';
import prisma from '@/utils/prisma';
import jwt from 'jsonwebtoken';

jest.mock('@/utils/prisma');

jest.mock('jsonwebtoken');

describe('middleware/authenticate', () => {
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('authenticates valid token', async () => {
    const req: any = { headers: { authorization: 'Bearer token' } };
    (jwt.verify as jest.Mock).mockReturnValue({ userId: '1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      isBlocked: false,
    });

    await authenticate(req, res, next);

    expect(req.userId).toBe('1');
    expect(next).toHaveBeenCalled();
  });

  it('rejects missing header', async () => {
    const req: any = { headers: {} };

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects invalid token', async () => {
    const req: any = { headers: { authorization: 'Bearer bad' } };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects when user not found', async () => {
    const req: any = { headers: { authorization: 'Bearer token' } };
    (jwt.verify as jest.Mock).mockReturnValue({ userId: '1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects when user blocked', async () => {
    const req: any = { headers: { authorization: 'Bearer token' } };
    (jwt.verify as jest.Mock).mockReturnValue({ userId: '1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      isBlocked: true,
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('middleware/checkNotBlocked', () => {
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes for active user', async () => {
    const req: any = { userId: '1' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      isBlocked: false,
    });

    await checkNotBlocked(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('rejects when blocked', async () => {
    const req: any = { userId: '1' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      isBlocked: true,
    });

    await checkNotBlocked(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('rejects when userId missing', async () => {
    const req: any = {};

    await checkNotBlocked(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects when user not found', async () => {
    const req: any = { userId: '1' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await checkNotBlocked(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
