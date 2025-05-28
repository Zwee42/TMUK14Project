import handler from '@/pages/api/deleteUser'; // Adjust path if needed
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserModel } from '@/models/User';

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/models/User', () => ({
  __esModule: true,
  UserModel: {
    findOneAndDelete: jest.fn(),
  },
}));

describe('Nonfunctional tests for DELETE /api/user/delete', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    setHeaderMock = jest.fn();

    req = {
      method: 'DELETE',
      body: { email: 'test@example.com' },
    };

    res = {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('sets appropriate headers (if any) and completes within 100ms', async () => {
    (UserModel.findOneAndDelete as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

    const start = performance.now();
    await handler(req as NextApiRequest, res as NextApiResponse);
    const duration = performance.now() - start;

    // Check that no unexpected headers are set (or if your handler sets some, check them here)
    expect(setHeaderMock).not.toHaveBeenCalled();

    // Check that handler finishes quickly
    expect(duration).toBeLessThan(100);
  });

  it('logs error when database operation throws', async () => {
    const error = new Error('DB failure');
    (UserModel.findOneAndDelete as jest.Mock).mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting user:', error);

    consoleErrorSpy.mockRestore();
  });
});
