// __tests__/api/change-email.test.ts
import handler from '@/pages/api/change-email';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

jest.mock('@/utils/auth', () => ({
  getUserFromRequest: jest.fn(),
  signCookie: jest.fn(),
}));

// Mock the actual User model (not UserModel)
jest.mock('@/models/User', () => ({
  __esModule: true,
  User: {
    findById: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock('bcryptjs');

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const { getUserFromRequest, signCookie } = require('@/utils/auth');
const { User } = require('@/models/User');

const mockRes = (): NextApiResponse => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
    end: jest.fn(),
  } as unknown as NextApiResponse;
};

describe('/api/change-email', () => {
  const userId = 'user123';
  const password = 'Password123!';
  const hashedPassword = 'hashedPassword123';

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createReq = (body: any, method = 'POST'): NextApiRequest => ({
    method,
    body,
  } as unknown as NextApiRequest);

  it('returnerar 401 om användaren inte är inloggad', async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);
    const req = createReq({}, 'POST');
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
  });

  it('kräver både ny e-post och nuvarande lösenord', async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce({ userId });
    const req = createReq({ email: '', currentPassword: '' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'New email and current password are required' });
  });

  it('vägrar ogiltigt e-postformat', async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce({ userId });
    const req = createReq({ email: 'not-an-email', currentPassword: password });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email format' });
  });

  it('vägrar felaktigt lösenord', async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce({ userId });
    User.findById.mockResolvedValueOnce({
      _id: userId,
      password: hashedPassword,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    const req = createReq({ email: 'new@mail.com', currentPassword: 'wrongPass' });
    const res = mockRes();

    await handler(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith('wrongPass', hashedPassword);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Incorrect password' });
  });

  it('vägrar om e-posten redan finns', async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce({ userId });
    User.findById.mockResolvedValueOnce({
      _id: userId,
      password: hashedPassword,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

    User.findOne.mockResolvedValueOnce({ email: 'taken@mail.com' });

    const req = createReq({ email: 'taken@mail.com', currentPassword: password });
    const res = mockRes();

    await handler(req, res);

    expect(User.findOne).toHaveBeenCalledWith('taken@mail.com');
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already in use' });
  });

  it('uppdaterar e-post korrekt', async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce({ userId });
    User.findById.mockResolvedValueOnce({
      _id: userId,
      password: hashedPassword,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    User.findOne.mockResolvedValueOnce(null);
    User.findOneAndUpdate.mockResolvedValueOnce({
      _id: userId,
      email: 'new@mail.com',
    });

    const req = createReq({ email: 'new@mail.com', currentPassword: password });
    const res = mockRes();

    await handler(req, res);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      userId,
      { email: 'new@mail.com' },
      { new: true }
    );
    expect(signCookie).toHaveBeenCalled();  // We expect signCookie to be called on success
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email updated successfully' });
  });

  it('svarar 405 för andra HTTP-metoder', async () => {
    const req = createReq({}, 'GET');
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
  });
});
