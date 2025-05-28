import handler from '@/pages/api/session'; // Update the import path
import jwt from 'jsonwebtoken';

describe('API handler', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns 401 if no auth_token cookie', () => {
    req.headers.cookie = '';

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ isLoggedIn: false });
  });

  it('returns 200 and user with correct token payload', () => {
    const userPayload = {
      userId: 'abc123',
      username: 'testuser',
      avatar: 'avatar.png',
      bio: 'A bio',
      email: 'test@example.com',
    };

    req.headers.cookie = 'auth_token=validtoken123';

    // Mock jwt.verify to return the userPayload
jest.spyOn(jwt, 'verify').mockImplementation(() => userPayload);

    handler(req, res);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken123', process.env.JWT_SECRET);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ isLoggedIn: true, user: userPayload });
  });

  it('returns 401 if token is invalid', () => {
    req.headers.cookie = 'auth_token=invalidtoken';

    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});

    handler(req, res);

    expect(jwt.verify).toHaveBeenCalledWith('invalidtoken', process.env.JWT_SECRET);
    expect(console.error).toHaveBeenCalledWith('Error decoding token:');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ isLoggedIn: false });
  });
});
