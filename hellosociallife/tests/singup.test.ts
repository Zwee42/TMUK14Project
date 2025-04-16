import handler from '@/pages/api/register';
import type { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/models/User');
jest.mock('bcryptjs');

const mockRes = () => {
  const res: Partial<NextApiResponse> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
    end: jest.fn(),
  };
  return res as NextApiResponse;
};

describe('Signup API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a new user with valid credentials', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');

    // Mock the User constructor to simulate new user
    (User as unknown as jest.Mock).mockImplementation(() => ({
      id: '123',
      email: 'newuser@example.com',
      name: 'newuser',
      save: jest.fn().mockResolvedValueOnce(undefined),
    }));

    // No email or username conflict
    (User.findOne as jest.Mock)
      .mockResolvedValueOnce(null) // email
      .mockResolvedValueOnce(null); // username

    const req = {
      method: 'POST',
      body: {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      },
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User registered successfully',
      user: {
        id: '123',
        email: 'newuser@example.com',
        username: 'newuser',
      },
    });
  });

  it('fails when email already exists', async () => {
    const existingUser = { email: 'existing@example.com' };

    (User.findOne as jest.Mock).mockResolvedValueOnce(existingUser);

    const req = {
      method: 'POST',
      body: {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password123',
      },
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already in use' });
  });

  it('fails when username already exists', async () => {
    (User.findOne as jest.Mock)
      .mockResolvedValueOnce(null) // email is fine
      .mockResolvedValueOnce({}); // username is taken

    const req = {
      method: 'POST',
      body: {
        email: 'newuser@example.com',
        username: 'existinguser',
        password: 'password123',
      },
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Username already taken' });
  });

  it('fails with missing required fields', async () => {
    const req = {
      method: 'POST',
      body: {
        email: '',
        username: '',
        password: '',
      },
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
  });

  it('fails when password is too short', async () => {
    const req = {
      method: 'POST',
      body: {
        email: 'shortpass@example.com',
        username: 'shortuser',
        password: '123',
      },
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password must be at least 8 characters' });
  });

  it('rejects non-POST methods', async () => {
    const req = {
      method: 'GET',
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
  });
});
