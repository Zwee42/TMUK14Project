// __tests__/api/users.test.ts
import handler from '@/pages/api/users';               // ändra sökvägen om nödvändigt
import { NextApiRequest, NextApiResponse } from 'next';

/* -------- Mockar -------- */

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(),          // dbConnect
}));

jest.mock('@/models/User', () => ({
  __esModule: true,
  UserModel: {
    find: jest.fn(),
  },
}));

const { UserModel } = require('@/models/User');

/* -------- Hjälpfunktioner -------- */

const mockRes = (): NextApiResponse => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  setHeader: jest.fn(),
  end: jest.fn(),
} as unknown as NextApiResponse);

const createReq = (method = 'GET'): NextApiRequest =>
  ({ method } as unknown as NextApiRequest);

/* -------- Testsvit -------- */

describe('/api/users', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returnerar alla användare (_id och username) vid GET', async () => {
    const fakeUsers = [
      { _id: '1', username: 'anna' },
      { _id: '2', username: 'bob' },
    ];
    (UserModel.find as jest.Mock).mockResolvedValueOnce(fakeUsers);

    const req = createReq('GET');
    const res = mockRes();

    await handler(req, res);

    expect(UserModel.find).toHaveBeenCalledWith({}, '_id username');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUsers);
  });

  it('hanterar databas-fel (500)', async () => {
    (UserModel.find as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const req = createReq('GET');
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch users' });
  });

  it('svarar 405 för andra HTTP-metoder', async () => {
    const req = createReq('POST');
    const res = mockRes();

    await handler(req, res);

    expect(UserModel.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
  });
});
