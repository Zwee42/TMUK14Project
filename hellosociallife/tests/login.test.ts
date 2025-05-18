import handler from '@/pages/api/login';
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserModel } from '@/models/User';
import bcrypt from 'bcryptjs';

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('@/models/User', () => ({
  __esModule: true,
  UserModel: {
    findOne: jest.fn()
  }
}));

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

describe('Login API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('logs in successfully with correct credentials', async () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedPassword',
      image: 'avatar.png',
      bio: 'bio text'
    };

    // Mockerar Mongoose-kedjan: findOne().select(). Där select returnerar ett user-objekt.
    (UserModel.findOne as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(user)
    });

    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

    const req = {
      method: 'POST',
      body: {
        emailOrUsername: 'test@example.com',
        password: 'password123',
      },
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({
      $or: [
        { email: 'test@example.com' },
        { username: 'test@example.com' }
      ]
    });

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged in successfully' });
  });

  it('fails when password is incorrect', async () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedPassword',
    };

    (UserModel.findOne as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(user)
    });

    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    const req = {
      method: 'POST',
      body: {
        emailOrUsername: 'test@example.com',
        password: 'wrongPassword123',
      },
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid ddcredentials' }); // OBS: "ddcredentials" är ett stavfel i login.ts!
  });

  it('fails when user is not found', async () => {
    (UserModel.findOne as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(null)
    });

    const req = {
      method: 'POST',
      body: {
        emailOrUsername: 'nonexistent@example.com',
        password: 'password123',
      },
    } as unknown as NextApiRequest;

    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Fel e-post eller användarnamn' });
  });

  it('rejects non-POST methods', async () => {
    const req = { method: 'GET' } as unknown as NextApiRequest;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
  });
});
