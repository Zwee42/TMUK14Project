import handler from '@/pages/api/login';
import type { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('@/models/User');
jest.mock('bcryptjs');

const mockRes = () => {
  const res: Partial<NextApiResponse> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),  // Corrected mock for setHeader
    end: jest.fn(),
  };
  return res as NextApiResponse;
};

describe('Login API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('logs in successfully with correct credentials', async () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      name: 'testuser',
      password: 'hashedPassword',
    };

    (User.findOne as jest.Mock).mockResolvedValueOnce(user);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);  // Simulate correct password

    const req = {
      method: 'POST',
      body: {
        emailOrUsername: 'test@example.com',
        password: 'password123',
      },
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(User.findOne).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged in successfully' });
  });

  it('fails when password is incorrect', async () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      name: 'testuser',
      password: 'hashedPassword',
    };

    (User.findOne as jest.Mock).mockResolvedValueOnce(user);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);  // Simulate incorrect password

    const req = {
      method: 'POST',
      body: {
        emailOrUsername: 'test@example.com',
        password: 'wrongPassword123',
      },
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('fails when user is not found', async () => {
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);  // Simulate user not found

    const req = {
      method: 'POST',
      body: {
        emailOrUsername: 'nonexistent@example.com',
        password: 'password123',
      },
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('rejects non-POST methods', async () => {
    const req = { method: 'GET' } as unknown as NextApiRequest;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
  });
});