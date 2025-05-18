// __tests__/api/update-profile.test.ts
import handler from '@/pages/api/updateAccount';            // <-- justera sökvägen om filen heter annat
import { NextApiRequest, NextApiResponse } from 'next';

jest.mock('@/utils/auth', () => ({
  getUserFromRequest: jest.fn(),
  signCookie: jest.fn(),
}));

// Mocka precis de metoder som profilen använder
jest.mock('@/models/User', () => ({
  __esModule: true,
  User: {
    findByIdWithPassword: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const { getUserFromRequest, signCookie } = require('@/utils/auth');
const { User } = require('@/models/User');

const mockRes = (): NextApiResponse => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  setHeader: jest.fn(),
  end: jest.fn(),
} as unknown as NextApiResponse);

describe('/api/update-profile', () => {
  const userId = 'user123';

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createReq = (body: any, method = 'POST'): NextApiRequest =>
    ({ method, body } as unknown as NextApiRequest);

  /* ----------- testfall ----------- */

  it('returnerar 401 om användaren inte är inloggad', async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

    const req = createReq({}, 'POST');
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
  });

  it('vägrar ogiltigt användarnamn', async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce({ userId });

    const req = createReq({ username: 'bad username', bio: '', image: '' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username' });
  });

  it('returnerar 404 om användaren inte hittas', async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce({ userId });
    User.findByIdWithPassword.mockResolvedValueOnce(null); // ingen användare

    const req = createReq({ username: 'newname', bio: '', image: '' });
    const res = mockRes();

    await handler(req, res);

    expect(User.findByIdWithPassword).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('uppdaterar profilen korrekt', async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce({ userId });
    User.findByIdWithPassword.mockResolvedValueOnce({ _id: userId, username: 'old' });
    User.findOneAndUpdate.mockResolvedValueOnce({
      _id: userId,
      username: 'newname',
      bio: 'my bio',
      image: 'avatar.png',
    });

    const req = createReq({ username: 'newname', bio: 'my bio', image: 'avatar.png' });
    const res = mockRes();

    await handler(req, res);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      userId,
      { username: 'newname', bio: 'my bio', image: 'avatar.png' },
      { new: true }
    );
    expect(signCookie).toHaveBeenCalled(); // ny cookie på framgång
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Profile updated' });
  });

  it('svarar 405 för andra HTTP-metoder', async () => {
    const req = createReq({}, 'GET');
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
  });
});
