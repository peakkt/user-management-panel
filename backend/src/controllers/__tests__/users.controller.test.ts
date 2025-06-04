import {
  getUsers,
  deleteUser,
  blockUser,
  unblockUser,
} from '../users.controller';
import prisma from '@/utils/prisma';
import { HttpError } from '@/middleware/errorHandler';

jest.mock('@/utils/prisma');

describe('users.controller', () => {
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns users', async () => {
    const req = {} as any;
    (prisma.user.findMany as jest.Mock).mockResolvedValue([{ id: '1' }]);

    await getUsers(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: '1' }]);
  });

  describe('deleteUser', () => {
    it('deletes user', async () => {
      const req = { params: { id: '1' } } as any;
      (prisma.user.delete as jest.Mock).mockResolvedValue(undefined);

      await deleteUser(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'User deleted successfully',
      });
    });

    it('handles missing user', async () => {
      const req = { params: { id: '1' } } as any;
      (prisma.user.delete as jest.Mock).mockRejectedValue(
        new Error('not found'),
      );

      await deleteUser(req, res, next);

      const err = (next as jest.Mock).mock.calls[0][0] as HttpError;
      expect(err.status).toBe(404);
    });
  });

  describe('blockUser', () => {
    it('blocks user', async () => {
      const req = { params: { id: '1' } } as any;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        isBlocked: false,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: '1',
        isBlocked: true,
      });

      await blockUser(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'User blocked successfully',
        user: { id: '1', isBlocked: true },
      });
    });

    it('fails when user not found', async () => {
      const req = { params: { id: '1' } } as any;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await blockUser(req, res, next);

      const err = (next as jest.Mock).mock.calls[0][0] as HttpError;
      expect(err.status).toBe(404);
    });

    it('fails when already blocked', async () => {
      const req = { params: { id: '1' } } as any;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        isBlocked: true,
      });

      await blockUser(req, res, next);

      const err = (next as jest.Mock).mock.calls[0][0] as HttpError;
      expect(err.status).toBe(400);
    });
  });

  describe('unblockUser', () => {
    it('unblocks user', async () => {
      const req = { params: { id: '1' } } as any;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        isBlocked: true,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: '1',
        isBlocked: false,
      });

      await unblockUser(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'User unblocked successfully',
        user: { id: '1', isBlocked: false },
      });
    });

    it('fails when user not found', async () => {
      const req = { params: { id: '1' } } as any;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await unblockUser(req, res, next);

      const err = (next as jest.Mock).mock.calls[0][0] as HttpError;
      expect(err.status).toBe(404);
    });

    it('fails when not blocked', async () => {
      const req = { params: { id: '1' } } as any;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        isBlocked: false,
      });

      await unblockUser(req, res, next);

      const err = (next as jest.Mock).mock.calls[0][0] as HttpError;
      expect(err.status).toBe(400);
    });
  });
});
